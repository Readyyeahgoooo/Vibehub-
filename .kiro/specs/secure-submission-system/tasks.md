# Implementation Plan: Secure Submission System

## Overview

This implementation plan breaks down the secure submission system into incremental, testable tasks. Each task builds on previous work and includes verification steps. The focus is on implementing core functionality with proper security measures while staying within free-tier limits.

## Tasks

- [x] 1. Set up serverless backend infrastructure
  - Create Vercel Edge Functions directory structure (`/api`)
  - Configure Vercel KV database connection
  - Set up Cloudinary SDK for image uploads
  - Create environment variable configuration file
  - Add TypeScript types for API requests/responses
  - _Requirements: 1.1, 1.3, 9.1, 9.2, 9.3_

- [x] 1.1 Write property test for API key isolation
  - **Property 1: API Key Isolation**
  - **Validates: Requirements 1.2, 1.4**
  - Test that built client bundle contains no API key patterns

- [ ] 2. Implement secure image upload endpoint
  - [ ] 2.1 Create `/api/upload` endpoint
    - Validate file type (JPEG/PNG/WebP only)
    - Validate file size (max 5MB)
    - Generate unique filename using UUID
    - Upload to Cloudinary with server-side SDK
    - Return secure HTTPS URL
    - _Requirements: 5.1, 5.2, 5.4, 5.7_

  - [ ] 2.2 Write property test for file upload validation
    - **Property 5: File Upload Validation**
    - **Validates: Requirements 5.1, 5.2**
    - Test that only valid file types and sizes are accepted

  - [ ] 2.3 Write property test for unique filename generation
    - **Property 6: Unique Filename Generation**
    - **Validates: Requirements 5.4**
    - Test that all generated filenames are unique

  - [ ] 2.4 Write property test for HTTPS URL generation
    - **Property 7: HTTPS URL Generation**
    - **Validates: Requirements 5.7**
    - Test that all returned URLs use HTTPS protocol

  - [ ] 2.5 Write unit tests for upload error handling
    - Test file too large error
    - Test invalid file type error
    - Test upload failure scenarios
    - _Requirements: 5.6_

- [ ] 3. Implement URL validation and malicious link detection
  - [ ] 3.1 Create URL validation utility
    - Validate URL syntax
    - Check domain against allowlist (threads.net, github.com, twitter.com)
    - Check for suspicious patterns (IP addresses, data URIs, javascript:)
    - Check domain against blocklist
    - Extract username from URL
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 3.2 Write property test for URL validation completeness
    - **Property 3: URL Validation Completeness**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
    - Test that URL validation correctly accepts/rejects based on all criteria

  - [ ] 3.3 Write unit tests for URL validation edge cases
    - Test various valid URL formats
    - Test malicious URL patterns
    - Test username extraction from different platforms
    - _Requirements: 3.5_

- [ ] 4. Implement AI-powered screenshot verification
  - [ ] 4.1 Create `/api/verify` endpoint
    - Accept screenshot URL and claimed username
    - Call OpenRouter API with GPT-4o-mini vision model
    - Extract username from screenshot using AI
    - Compare extracted username with claimed username (case-insensitive, fuzzy match)
    - Return verification result with confidence score
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

  - [ ] 4.2 Write property test for username verification consistency
    - **Property 2: Username Verification Consistency**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Test that verification result matches username comparison

  - [ ] 4.3 Write unit tests for verification scenarios
    - Test matching usernames (verified)
    - Test mismatched usernames (rejected)
    - Test unclear screenshots (edge case)
    - _Requirements: 2.4, 2.5, 2.7_

- [ ] 5. Implement rate limiting system
  - [ ] 5.1 Create rate limiter utility using Vercel KV
    - Track submission count per IP (24-hour window)
    - Track verification count per IP (1-hour window)
    - Implement automatic counter reset after time window
    - Return rate limit status and retry time
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

  - [ ] 5.2 Write property test for rate limit enforcement
    - **Property 4: Rate Limit Enforcement**
    - **Validates: Requirements 4.1, 4.2, 4.5**
    - Test that rate limits are enforced and reset correctly

  - [ ] 5.3 Write unit tests for rate limit scenarios
    - Test rate limit exceeded error
    - Test retry-after calculation
    - Test counter reset after time window
    - _Requirements: 4.3_

- [ ] 6. Checkpoint - Ensure all backend utilities pass tests
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement submission endpoint
  - [ ] 7.1 Create `/api/submit` endpoint
    - Validate all required fields
    - Check rate limit for submitter IP
    - Validate URL using malicious link detector
    - Call AI verification endpoint
    - If verified, store submission in Vercel KV queue
    - Return submission confirmation with ID
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ] 7.2 Write property test for form validation completeness
    - **Property 8: Form Validation Completeness**
    - **Validates: Requirements 6.4**
    - Test that all required fields are validated

  - [ ] 7.3 Write property test for Unicode text support
    - **Property 9: Unicode Text Support**
    - **Validates: Requirements 6.7**
    - Test that Unicode text (EN/Chinese) is accepted and stored correctly

  - [ ] 7.4 Write unit tests for submission workflow
    - Test successful submission flow
    - Test validation errors
    - Test rate limit errors
    - Test verification failures
    - _Requirements: 6.5, 6.6_

- [ ] 8. Enhance frontend submission form
  - [ ] 8.1 Update SubmitForm component
    - Add multi-step form UI (form → uploading → verifying → success/error)
    - Implement image upload with progress indicator
    - Add form validation with error messages
    - Integrate with `/api/upload` and `/api/submit` endpoints
    - Add multi-language support for form labels and errors
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6, 6.7_

  - [ ] 8.2 Write unit tests for form component
    - Test form validation
    - Test image upload flow
    - Test error message display
    - Test multi-language support

- [ ] 9. Implement app detail pages
  - [ ] 9.1 Create AppDetailPage component
    - Display all app information (name, description, tags, creator, etc.)
    - Implement image gallery with lightbox
    - Add share button with social media integration
    - Support multi-language display
    - Add breadcrumb navigation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 9.2 Write property test for app detail page completeness
    - **Property 10: App Detail Page Completeness**
    - **Validates: Requirements 7.2**
    - Test that all required fields are displayed

  - [ ] 9.3 Write unit tests for detail page features
    - Test image gallery functionality
    - Test share button
    - Test language switching
    - _Requirements: 7.3, 7.5_

- [ ] 10. Implement translation system with caching
  - [ ] 10.1 Create translation service
    - Call OpenRouter API for AI translation
    - Cache translations in Vercel KV (30-day TTL)
    - Check cache before making API calls
    - Support EN, Traditional Chinese, Simplified Chinese
    - Add "AI-translated" indicator
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

  - [ ] 10.2 Write property test for translation caching efficiency
    - **Property 11: Translation Caching Efficiency**
    - **Validates: Requirements 8.3, 8.4**
    - Test that cached translations are reused without API calls

  - [ ] 10.3 Write unit tests for translation service
    - Test translation API calls
    - Test cache hit/miss scenarios
    - Test AI-translated indicator display
    - _Requirements: 8.5_

- [ ] 11. Implement admin approval workflow
  - [ ] 11.1 Create admin API endpoints
    - `/api/admin/pending` - List pending submissions (protected)
    - `/api/admin/approve` - Approve or reject submission (protected)
    - Implement simple token-based authentication
    - Move approved submissions to main app list
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ] 11.2 Write unit tests for admin workflow
    - Test authentication
    - Test listing pending submissions
    - Test approval flow
    - Test rejection flow
    - _Requirements: 11.6_

- [ ] 12. Implement social sharing features
  - [ ] 12.1 Add Open Graph meta tags
    - Generate meta tags for each app detail page
    - Include og:title, og:description, og:image, og:url
    - Implement server-side rendering for meta tags
    - _Requirements: 12.3_

  - [ ] 12.2 Create share functionality
    - Add share button to app detail pages
    - Generate shareable URLs with deep linking
    - Support Twitter, Threads, and direct link copy
    - _Requirements: 12.1, 12.2, 12.4, 12.5_

  - [ ] 12.3 Write property test for Open Graph meta tags
    - **Property 13: Open Graph Meta Tag Presence**
    - **Validates: Requirements 12.3**
    - Test that all required meta tags are present

  - [ ] 12.4 Write property test for share URL deep linking
    - **Property 14: Share URL Deep Linking**
    - **Validates: Requirements 12.5**
    - Test that share URLs navigate to correct pages

  - [ ] 12.5 Write unit tests for share functionality
    - Test share button click
    - Test URL generation
    - Test social media links

- [ ] 13. Implement security measures
  - [ ] 13.1 Add HTTPS enforcement
    - Ensure all API requests use HTTPS
    - Add security headers (CSP, HSTS, X-Frame-Options)
    - Configure CORS appropriately
    - _Requirements: 10.2_

  - [ ] 13.2 Write property test for HTTPS request enforcement
    - **Property 12: HTTPS Request Enforcement**
    - **Validates: Requirements 10.2**
    - Test that all requests use HTTPS protocol

  - [ ] 13.3 Add input sanitization
    - Sanitize all user inputs before storage
    - Prevent XSS attacks in displayed content
    - Limit input lengths
    - _Requirements: 10.3_

  - [ ] 13.4 Write unit tests for security measures
    - Test input sanitization
    - Test XSS prevention
    - Test security headers

- [ ] 14. Migrate existing data to Vercel KV
  - [ ] 14.1 Create data migration script
    - Export APPS_DATA from constants.ts
    - Transform to AppDetailData format
    - Upload to Vercel KV
    - Verify data integrity
    - _Requirements: 9.3_

  - [ ] 14.2 Write unit tests for data migration
    - Test data transformation
    - Test data integrity after migration

- [ ] 15. Implement error handling and monitoring
  - [ ] 15.1 Add comprehensive error handling
    - Implement consistent error response format
    - Add user-friendly error messages in all languages
    - Implement retry logic for transient failures
    - Add graceful degradation for AI service failures
    - _Requirements: Error Handling section_

  - [ ] 15.2 Write unit tests for error scenarios
    - Test all error codes
    - Test error message translations
    - Test retry logic
    - Test graceful degradation

  - [ ] 15.3 Set up monitoring and logging
    - Configure Vercel Analytics
    - Add error tracking (console logging for now)
    - Monitor API usage and costs
    - Track submission success rates

- [ ] 16. Final checkpoint - Integration testing
  - [ ] 16.1 Test complete submission flow end-to-end
    - User submits app → Upload screenshot → AI verification → Approval → Display
    - Test in all three languages
    - Test error scenarios
    - Test rate limiting

  - [ ] 16.2 Run all property tests with extended iterations
    - Run all 14 property tests with 1000 iterations each
    - Verify all tests pass

  - [ ] 16.3 Verify security measures
    - Confirm no API keys in client bundle
    - Confirm HTTPS enforcement
    - Confirm rate limiting works
    - Confirm input sanitization works

- [ ] 17. Documentation and deployment
  - [ ] 17.1 Update README with new features
    - Document submission process
    - Document admin workflow
    - Document environment variables
    - Add troubleshooting guide

  - [ ] 17.2 Create deployment guide
    - Document Vercel setup steps
    - Document KV database setup
    - Document Cloudinary setup
    - Document environment variable configuration

  - [ ] 17.3 Deploy to production
    - Set up production environment variables
    - Deploy to Vercel
    - Verify all features work in production
    - Monitor for errors

## Notes

- All tasks including tests are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Focus on security and cost optimization throughout implementation
