# Design Document: Secure Submission System

## Overview

This design document outlines the architecture for a secure, AI-powered submission system for Vibe Hub. The system enables users to submit vibe-coded applications with automated verification while maintaining zero-cost or minimal-cost operation through serverless architecture and free-tier services.

### Key Design Principles

1. **Security First**: API keys never exposed client-side, all sensitive operations server-side
2. **Cost Optimization**: Leverage free tiers and minimize API calls through caching
3. **Serverless Architecture**: No persistent servers, use edge functions and serverless databases
4. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with AI features
5. **Privacy by Design**: Minimal data collection, no unnecessary tracking

### Technology Stack

- **Frontend**: React 19 + TypeScript + Vite (existing)
- **Backend**: Vercel Edge Functions (serverless)
- **Database**: Vercel KV (Redis-compatible, free tier: 256MB storage, 3000 commands/day)
- **Image Storage**: Cloudinary Free Tier (25 monthly credits, ~25GB storage, 25GB bandwidth)
- **AI Vision**: OpenRouter API with GPT-4o-mini vision (cost-effective multimodal model)
- **Rate Limiting**: Vercel Edge Config + KV Store
- **Translation**: OpenRouter API with cached results

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  React App   │  │ Submit Form  │  │  App Detail  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Functions                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ /api/submit  │  │ /api/verify  │  │ /api/upload  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────┬────────────────┬────────────────┬──────────────────┘
         │                │                │
         ▼                ▼                ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│  Vercel KV     │ │  OpenRouter    │ │  Cloudinary    │
│  (Database)    │ │  (AI Vision)   │ │  (Images)      │
└────────────────┘ └────────────────┘ └────────────────┘
```

### Data Flow

1. **Submission Flow**:
   - User fills form → Client validates → Uploads image to `/api/upload`
   - Image stored in Cloudinary → Returns secure URL
   - Form data + image URL sent to `/api/submit`
   - Rate limiter checks IP → AI verifier analyzes screenshot
   - If verified → Store in Vercel KV submission queue
   - Return confirmation to user

2. **Verification Flow**:
   - Extract image URL from submission
   - Send to OpenRouter with vision-capable model
   - AI extracts username from screenshot
   - Compare with claimed username from URL
   - Return verification result

3. **Approval Flow**:
   - Admin accesses `/api/admin/pending` (protected)
   - Reviews submissions from KV store
   - Approves → Move to main app list in KV
   - Rejects → Remove from queue

## Components and Interfaces

### Frontend Components

#### SubmitForm Component (Enhanced)

```typescript
interface SubmitFormProps {
  onClose: () => void;
  lang: Language;
}

interface SubmitFormState {
  step: 'form' | 'uploading' | 'verifying' | 'success' | 'error';
  formData: {
    appName: string;
    summary: string;
    tags: string[];
    creator: string;
    category: AppCategory;
    sourceUrl: string;
    screenshotFile: File | null;
  };
  error: string | null;
  uploadProgress: number;
}
```

**Key Methods**:
- `handleImageUpload()`: Upload screenshot to `/api/upload`
- `handleSubmit()`: Submit form data to `/api/submit`
- `validateForm()`: Client-side validation before submission

#### AppDetailPage Component (New)

```typescript
interface AppDetailPageProps {
  appId: string;
  lang: Language;
}

interface AppDetailData {
  id: string;
  name: string;
  fullDescription: string;
  summary: string;
  tags: string[];
  creator: string;
  category: AppCategory;
  githubUrl?: string;
  threadsUrl?: string;
  screenshots: string[]; // Cloudinary URLs
  createdAt: string;
  translations?: {
    [key in Language]?: {
      name: string;
      fullDescription: string;
      summary: string;
    };
  };
}
```

**Key Features**:
- Image gallery with lightbox
- Share button with social media integration
- Language switcher with AI translation fallback
- Responsive layout

### Backend API Endpoints

#### POST /api/upload

**Purpose**: Upload and validate images securely

**Request**:
```typescript
// FormData with file
{
  file: File; // Max 5MB, JPEG/PNG/WebP only
}
```

**Response**:
```typescript
{
  success: boolean;
  url?: string; // Cloudinary secure URL
  error?: string;
}
```

**Implementation**:
1. Validate file type and size
2. Generate unique filename (UUID)
3. Upload to Cloudinary using server-side SDK
4. Return secure HTTPS URL
5. Set 30-day expiration for unverified images

#### POST /api/submit

**Purpose**: Process app submission with AI verification

**Request**:
```typescript
{
  appName: string;
  summary: string; // 10-20 words
  tags: string[]; // 1-2 tags
  creator: string;
  category: AppCategory;
  sourceUrl: string; // Threads/GitHub/Twitter URL
  screenshotUrl: string; // From /api/upload
  language: Language;
}
```

**Response**:
```typescript
{
  success: boolean;
  submissionId?: string;
  message: string;
  error?: string;
}
```

**Implementation**:
1. Check rate limit (3 submissions per IP per 24h)
2. Validate all fields
3. Check malicious link patterns
4. Call AI verification
5. If verified, store in KV submission queue
6. Return confirmation

#### POST /api/verify

**Purpose**: AI-powered screenshot verification

**Request**:
```typescript
{
  screenshotUrl: string;
  claimedUsername: string;
  sourceUrl: string;
}
```

**Response**:
```typescript
{
  verified: boolean;
  confidence: number; // 0-1
  extractedUsername?: string;
  reason?: string;
}
```

**Implementation**:
1. Download image from Cloudinary
2. Send to OpenRouter with GPT-4o-mini vision
3. Prompt: "Extract the username visible in this screenshot. Look for profile names, @handles, or account names."
4. Compare extracted username with claimed username (fuzzy match)
5. Return verification result with confidence score

#### GET /api/apps

**Purpose**: Fetch approved apps list

**Response**:
```typescript
{
  apps: VibeApp[];
  total: number;
}
```

#### GET /api/apps/[id]

**Purpose**: Fetch detailed app information

**Response**:
```typescript
{
  app: AppDetailData;
}
```

#### GET /api/admin/pending (Protected)

**Purpose**: List pending submissions for approval

**Authentication**: Simple token-based auth (admin token in env var)

**Response**:
```typescript
{
  submissions: Array<{
    id: string;
    appData: SubmitFormData;
    verificationResult: VerificationResult;
    submittedAt: string;
  }>;
}
```

#### POST /api/admin/approve (Protected)

**Purpose**: Approve or reject submission

**Request**:
```typescript
{
  submissionId: string;
  action: 'approve' | 'reject';
  reason?: string; // For rejection
}
```

## Data Models

### Vercel KV Schema

**Key Patterns**:

```typescript
// Rate limiting
`ratelimit:submit:${ipHash}` → count (TTL: 24h)
`ratelimit:verify:${ipHash}` → count (TTL: 1h)

// Submissions queue
`submission:${submissionId}` → SubmissionData (TTL: 7 days)
`submissions:pending` → Set<submissionId>

// Approved apps
`app:${appId}` → AppDetailData
`apps:approved` → Set<appId>

// Translation cache
`translation:${hash}:${targetLang}` → translatedText (TTL: 30 days)

// Admin auth
`admin:token` → hashedToken
```

### SubmissionData Model

```typescript
interface SubmissionData {
  id: string;
  appName: string;
  summary: string;
  tags: string[];
  creator: string;
  category: AppCategory;
  sourceUrl: string;
  screenshotUrl: string;
  language: Language;
  verificationResult: {
    verified: boolean;
    confidence: number;
    extractedUsername: string;
    timestamp: string;
  };
  submittedAt: string;
  submitterIp: string; // Hashed for privacy
  status: 'pending' | 'approved' | 'rejected';
}
```

### AppDetailData Model

```typescript
interface AppDetailData extends VibeApp {
  fullDescription: string;
  screenshots: string[];
  createdAt: string;
  updatedAt: string;
  sourceVerified: boolean;
  translations?: {
    [key in Language]?: {
      name: string;
      fullDescription: string;
      summary: string;
    };
  };
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API Key Isolation

*For any* client-side JavaScript bundle produced by the build process, scanning the bundle contents should never reveal any API key patterns (strings matching common API key formats like `sk-`, `Bearer `, etc.).

**Validates: Requirements 1.2, 1.4**

### Property 2: Username Verification Consistency

*For any* screenshot image and source URL pair, if the AI extracts a username from the screenshot and the URL parser extracts a username from the URL, then the verification result should be true if and only if the usernames match (allowing for case-insensitive comparison and common variations like with/without @ prefix).

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: URL Validation Completeness

*For any* submitted URL, the malicious link detector should accept it if and only if: (1) it has valid URL syntax, (2) its domain is in the allowlist (threads.net, github.com, twitter.com, or verified custom domains), (3) it does not match any suspicious patterns (e.g., IP addresses, data URIs, javascript: protocol), and (4) its domain is not in the blocklist.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 4: Rate Limit Enforcement

*For any* IP address and time window, the rate limiter should reject requests that exceed the configured limit (3 submissions per 24h, 10 verifications per hour) and should automatically allow requests again after the time window expires.

**Validates: Requirements 4.1, 4.2, 4.5**

### Property 5: File Upload Validation

*For any* uploaded file, the system should accept it if and only if: (1) its MIME type is image/jpeg, image/png, or image/webp, and (2) its size is less than or equal to 5MB.

**Validates: Requirements 5.1, 5.2**

### Property 6: Unique Filename Generation

*For any* two image uploads (even of the same file), the generated filenames should be unique and non-guessable (e.g., using UUIDs or cryptographically secure random strings).

**Validates: Requirements 5.4**

### Property 7: HTTPS URL Generation

*For any* image stored in the cloud storage system, the returned URL should use the HTTPS protocol (URL should start with "https://").

**Validates: Requirements 5.7**

### Property 8: Form Validation Completeness

*For any* submission form data, validation should reject the submission if any required field (appName, summary, tags, creator, category, sourceUrl, screenshotUrl) is missing or empty.

**Validates: Requirements 6.4**

### Property 9: Unicode Text Support

*For any* valid Unicode text input (including English, Traditional Chinese, Simplified Chinese, and other languages), the submission system should accept and store it correctly without corruption or data loss.

**Validates: Requirements 6.7**

### Property 10: App Detail Page Completeness

*For any* approved app, its detail page should display all required fields: name, full description, summary, tags, creator, category, source links, and screenshots array (even if empty).

**Validates: Requirements 7.2**

### Property 11: Translation Caching Efficiency

*For any* piece of content that has been translated to a target language, subsequent requests for the same content in the same language should return the cached translation without making additional AI API calls.

**Validates: Requirements 8.3, 8.4**

### Property 12: HTTPS Request Enforcement

*For any* HTTP request made by the system (to APIs, image storage, etc.), it should use the HTTPS protocol to ensure data is encrypted in transit.

**Validates: Requirements 10.2**

### Property 13: Open Graph Meta Tag Presence

*For any* app detail page, the rendered HTML should contain Open Graph meta tags including at minimum: og:title, og:description, og:image, and og:url.

**Validates: Requirements 12.3**

### Property 14: Share URL Deep Linking

*For any* generated share URL for an app, navigating to that URL should display the correct app detail page (matching the app ID in the URL).

**Validates: Requirements 12.5**

## Error Handling

### Error Categories

1. **Validation Errors**: Client-side and server-side validation failures
2. **Rate Limit Errors**: Too many requests from same IP
3. **Verification Errors**: AI verification fails or returns low confidence
4. **Upload Errors**: Image upload fails or file is invalid
5. **Network Errors**: API calls fail or timeout
6. **Database Errors**: KV store operations fail

### Error Response Format

All API endpoints return consistent error format:

```typescript
{
  success: false,
  error: {
    code: string; // Machine-readable error code
    message: string; // Human-readable message
    details?: any; // Additional context
    retryAfter?: number; // For rate limit errors (seconds)
  }
}
```

### Error Codes

```typescript
enum ErrorCode {
  // Validation
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Verification
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  USERNAME_MISMATCH = 'USERNAME_MISMATCH',
  SCREENSHOT_UNCLEAR = 'SCREENSHOT_UNCLEAR',
  
  // URL Validation
  INVALID_URL = 'INVALID_URL',
  MALICIOUS_URL = 'MALICIOUS_URL',
  DOMAIN_NOT_ALLOWED = 'DOMAIN_NOT_ALLOWED',
  
  // Upload
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
}
```

### Error Handling Strategy

1. **Graceful Degradation**: If AI services fail, fall back to manual review queue
2. **User-Friendly Messages**: Translate error codes to helpful messages in user's language
3. **Retry Logic**: Implement exponential backoff for transient failures
4. **Logging**: Log all errors server-side for debugging (without exposing to client)
5. **Monitoring**: Track error rates to detect issues early

### Specific Error Scenarios

**Scenario 1: AI Verification Timeout**
- If OpenRouter API takes >10 seconds, timeout the request
- Add submission to manual review queue
- Notify user: "Verification is taking longer than expected. Your submission will be reviewed manually."

**Scenario 2: Image Upload Failure**
- If Cloudinary upload fails, retry once
- If still fails, return clear error with troubleshooting steps
- Suggest: "Please try a smaller image or different format"

**Scenario 3: Rate Limit Exceeded**
- Return 429 status with `Retry-After` header
- Show user: "You've reached the submission limit. Please try again in X hours."
- Provide exact retry time

**Scenario 4: Database Unavailable**
- If Vercel KV is down, queue submission in memory (with warning)
- Return success but flag for manual verification
- Log incident for admin review

## Testing Strategy

### Dual Testing Approach

This system requires both unit tests and property-based tests to ensure comprehensive correctness:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Both are complementary and necessary for comprehensive coverage

### Property-Based Testing

We will use **fast-check** (JavaScript/TypeScript property-based testing library) to implement the correctness properties defined above.

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: secure-submission-system, Property {number}: {property_text}`
- Tests run in CI/CD pipeline before deployment

**Example Property Test Structure**:

```typescript
import fc from 'fast-check';

describe('Feature: secure-submission-system', () => {
  it('Property 2: Username Verification Consistency', () => {
    fc.assert(
      fc.property(
        fc.string(), // screenshot username
        fc.string(), // URL username
        (screenshotUsername, urlUsername) => {
          const result = verifyUsernameMatch(screenshotUsername, urlUsername);
          const normalized1 = normalizeUsername(screenshotUsername);
          const normalized2 = normalizeUsername(urlUsername);
          
          // Property: verification succeeds iff normalized usernames match
          expect(result.verified).toBe(normalized1 === normalized2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Focus

Unit tests should cover:

1. **Specific Examples**:
   - Valid submission with matching usernames
   - Invalid submission with mismatched usernames
   - Edge cases: empty strings, special characters, very long inputs

2. **Integration Points**:
   - API endpoint request/response cycles
   - Database read/write operations
   - External service integrations (OpenRouter, Cloudinary)

3. **Error Conditions**:
   - Network failures
   - Invalid API responses
   - Database connection errors
   - Rate limit scenarios

4. **UI Components**:
   - Form validation
   - Language switching
   - Image upload progress
   - Error message display

### Testing Tools

- **Unit Tests**: Vitest (fast, Vite-native)
- **Property Tests**: fast-check
- **Integration Tests**: Playwright (for E2E flows)
- **API Tests**: Supertest (for endpoint testing)

### Test Coverage Goals

- **Unit Test Coverage**: >80% for business logic
- **Property Test Coverage**: All 14 correctness properties implemented
- **Integration Test Coverage**: All critical user flows (submit, verify, approve)

### Continuous Integration

All tests run on:
- Every pull request
- Before deployment to production
- Nightly for property tests (extended runs with 1000+ iterations)

## Implementation Notes

### Security Considerations

1. **API Key Management**:
   - Store in Vercel environment variables
   - Never log API keys
   - Rotate keys periodically
   - Use separate keys for dev/staging/prod

2. **Input Sanitization**:
   - Sanitize all user inputs before storage
   - Prevent XSS attacks in displayed content
   - Validate URLs before making requests
   - Limit input lengths to prevent DoS

3. **Rate Limiting**:
   - Implement at edge function level
   - Use IP hashing for privacy
   - Consider CAPTCHA for suspicious activity
   - Monitor for abuse patterns

4. **Image Security**:
   - Validate file signatures (not just extensions)
   - Use Cloudinary's moderation features
   - Set appropriate CORS headers
   - Implement CSP headers

### Cost Optimization

**Free Tier Limits**:
- Vercel Hobby: 100GB bandwidth, unlimited function invocations (5s timeout)
- Vercel KV: 256MB storage, 3000 commands/day
- Cloudinary Free: 25 credits/month (~25GB storage + bandwidth)
- OpenRouter: Pay-per-use (GPT-4o-mini: ~$0.15/1M tokens)

**Optimization Strategies**:
1. **Caching**: Cache translations, verification results, app data
2. **Image Optimization**: Use Cloudinary transformations to serve optimized images
3. **Lazy Loading**: Load images and data on-demand
4. **Batch Operations**: Batch database operations where possible
5. **CDN**: Leverage Vercel's edge network for static assets

**Cost Monitoring**:
- Log API usage to track costs
- Set up alerts for approaching limits
- Implement circuit breakers for expensive operations
- Provide admin dashboard with usage metrics

### Deployment Strategy

1. **Environment Setup**:
   ```bash
   # .env.local (development)
   VITE_OPENROUTER_API_KEY=sk-or-...
   KV_REST_API_URL=https://...
   KV_REST_API_TOKEN=...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ADMIN_TOKEN=...
   ```

2. **Vercel Configuration**:
   - Set environment variables in Vercel dashboard
   - Configure edge functions in `vercel.json`
   - Set up KV database in Vercel Storage
   - Enable edge config for rate limiting

3. **Database Migration**:
   - Export existing APPS_DATA to KV store
   - Create admin interface for data management
   - Implement backup/restore functionality

4. **Monitoring**:
   - Set up Vercel Analytics
   - Configure error tracking (Sentry or similar)
   - Monitor API usage and costs
   - Track submission success rates

### Future Enhancements

1. **Advanced Verification**:
   - Multi-factor verification (email, OAuth)
   - Reputation system for submitters
   - Community voting on submissions

2. **Enhanced Search**:
   - Full-text search with Algolia
   - Filters by tags, category, date
   - Trending apps algorithm

3. **Social Features**:
   - User profiles
   - Comments and ratings
   - Follow favorite creators

4. **Analytics**:
   - View counts per app
   - Popular searches
   - Geographic distribution

5. **Internationalization**:
   - Support more languages
   - Community translations
   - RTL language support
