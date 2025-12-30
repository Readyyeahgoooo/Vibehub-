# Requirements Document

## Introduction

This document specifies the requirements for a secure, AI-powered submission system for the Vibe Hub platform. The system enables users to submit their vibe-coded applications with automated verification, secure data handling, and comprehensive safety measures. The platform operates as a static site with serverless backend functions to minimize costs while maintaining security and functionality.

## Glossary

- **Vibe_Hub**: The web platform showcasing vibe-coded applications
- **Submission_System**: The complete workflow for users to submit new applications
- **AI_Verifier**: The OpenRouter-powered service that validates screenshot authenticity
- **Serverless_Backend**: Cloud functions (Vercel/Netlify) that handle submissions without persistent servers
- **Screenshot_Verification**: Process of validating that a user owns the application they're submitting
- **Rate_Limiter**: System that prevents abuse by limiting submission frequency
- **Malicious_Link_Detector**: Service that validates URLs are safe and legitimate
- **Image_Storage**: Cloud storage for uploaded screenshots and app photos
- **Submission_Queue**: Temporary storage for pending submissions awaiting approval
- **App_Detail_Page**: Individual page for each application showing full information and gallery

## Requirements

### Requirement 1: Secure API Key Management

**User Story:** As a platform administrator, I want API keys to remain secure when deployed, so that unauthorized users cannot access or abuse paid services.

#### Acceptance Criteria

1. THE Vibe_Hub SHALL store all API keys as environment variables on the deployment platform
2. THE Vibe_Hub SHALL NOT expose API keys in client-side JavaScript code
3. THE Serverless_Backend SHALL access API keys only from server-side environment variables
4. WHEN the repository is public, THEN the Vibe_Hub SHALL NOT include any API keys in committed files
5. THE Vibe_Hub SHALL provide clear documentation for setting environment variables on GitHub and Vercel

### Requirement 2: Screenshot Verification with AI

**User Story:** As a platform moderator, I want submissions to be automatically verified, so that only legitimate app creators can add their applications.

#### Acceptance Criteria

1. WHEN a user uploads a screenshot, THEN the AI_Verifier SHALL extract the username from the image
2. WHEN a user provides a Threads or GitHub URL, THEN the AI_Verifier SHALL extract the claimed username from the URL
3. THE AI_Verifier SHALL compare the screenshot username with the URL username
4. IF the usernames match, THEN the Submission_System SHALL mark the submission as verified
5. IF the usernames do not match, THEN the Submission_System SHALL reject the submission with a clear error message
6. THE AI_Verifier SHALL use OpenRouter API with vision-capable models for image analysis
7. WHEN the screenshot is unclear or unreadable, THEN the AI_Verifier SHALL request a clearer image

### Requirement 3: Malicious Link Detection

**User Story:** As a platform administrator, I want to prevent malicious links, so that users are protected from harmful content.

#### Acceptance Criteria

1. WHEN a user submits a URL, THEN the Malicious_Link_Detector SHALL validate the URL format
2. THE Malicious_Link_Detector SHALL verify URLs point to legitimate domains (threads.net, github.com, twitter.com, or verified custom domains)
3. IF a URL contains suspicious patterns, THEN the Submission_System SHALL reject the submission
4. THE Malicious_Link_Detector SHALL check URLs against a blocklist of known malicious domains
5. WHEN a URL is rejected, THEN the Submission_System SHALL provide a specific reason to the user

### Requirement 4: Rate Limiting and Abuse Prevention

**User Story:** As a platform administrator, I want to prevent spam and abuse, so that the platform remains high-quality and costs stay low.

#### Acceptance Criteria

1. THE Rate_Limiter SHALL limit submissions to 3 per IP address per 24-hour period
2. THE Rate_Limiter SHALL limit AI verification requests to 10 per IP address per hour
3. WHEN a rate limit is exceeded, THEN the Submission_System SHALL return a clear error message with retry time
4. THE Rate_Limiter SHALL use serverless edge storage or KV stores for tracking limits
5. THE Rate_Limiter SHALL reset counters automatically after the time window expires

### Requirement 5: Secure Image Upload and Storage

**User Story:** As a user, I want to upload screenshots and app photos securely, so that my images are stored safely without exposing sensitive data.

#### Acceptance Criteria

1. THE Submission_System SHALL accept image uploads in JPEG, PNG, and WebP formats only
2. THE Submission_System SHALL limit individual image uploads to 5MB maximum size
3. THE Image_Storage SHALL store uploaded images in a cloud storage service (Vercel Blob, Cloudinary, or similar)
4. THE Submission_System SHALL generate unique, non-guessable filenames for all uploaded images
5. THE Submission_System SHALL scan uploaded images for malware or inappropriate content
6. WHEN an image upload fails, THEN the Submission_System SHALL provide a clear error message
7. THE Image_Storage SHALL serve images over HTTPS only

### Requirement 6: Submission Workflow

**User Story:** As a user, I want to submit my vibe-coded app easily, so that it can be featured on Vibe Hub.

#### Acceptance Criteria

1. WHEN a user clicks "Submit Vibe App", THEN the Submission_System SHALL display a multi-step form
2. THE Submission_System SHALL collect: app name, summary (10-20 words), tags (1-2), creator name, category, and source URL
3. THE Submission_System SHALL require a verification screenshot showing the user as the app creator
4. THE Submission_System SHALL validate all required fields before submission
5. WHEN a submission is complete, THEN the Submission_System SHALL add it to the Submission_Queue
6. THE Submission_System SHALL send a confirmation message to the user
7. THE Submission_System SHALL support both English and Chinese input for all text fields

### Requirement 7: App Detail Pages

**User Story:** As a user, I want to view detailed information about each app, so that I can learn more before using it.

#### Acceptance Criteria

1. WHEN a user clicks an app name, THEN the Vibe_Hub SHALL display the App_Detail_Page
2. THE App_Detail_Page SHALL show: full description, creator info, tags, category, source links, and image gallery
3. THE App_Detail_Page SHALL include a "Share" button that generates a shareable link
4. THE App_Detail_Page SHALL support multi-language display (EN, Traditional Chinese, Simplified Chinese)
5. WHEN translations are provided, THEN the App_Detail_Page SHALL display content in the selected language
6. THE App_Detail_Page SHALL allow users to upload additional screenshots (with verification)

### Requirement 8: Multi-Language Translation

**User Story:** As a user, I want the interface in my preferred language, so that I can use the platform comfortably.

#### Acceptance Criteria

1. THE Vibe_Hub SHALL support English, Traditional Chinese, and Simplified Chinese
2. WHEN a user switches languages, THEN the Vibe_Hub SHALL translate all UI elements immediately
3. THE Vibe_Hub SHALL use AI translation for user-submitted content when translations are not provided
4. THE Vibe_Hub SHALL cache AI translations to minimize API costs
5. WHEN displaying translated content, THEN the Vibe_Hub SHALL indicate it is AI-translated

### Requirement 9: Serverless Backend Architecture

**User Story:** As a platform administrator, I want to minimize hosting costs, so that the platform can operate for free or at minimal cost.

#### Acceptance Criteria

1. THE Serverless_Backend SHALL use Vercel Edge Functions or Netlify Functions
2. THE Serverless_Backend SHALL handle: submission processing, AI verification, image uploads, and rate limiting
3. THE Serverless_Backend SHALL store submission data in a serverless database (Vercel KV, Supabase, or similar)
4. THE Serverless_Backend SHALL operate within free tier limits of chosen services
5. WHEN free tier limits are approached, THEN the Serverless_Backend SHALL log warnings
6. THE Serverless_Backend SHALL implement efficient caching to reduce API calls

### Requirement 10: Data Privacy and Security

**User Story:** As a user, I want my submitted data to be secure, so that my personal information is protected.

#### Acceptance Criteria

1. THE Submission_System SHALL NOT store user IP addresses beyond rate limiting purposes
2. THE Submission_System SHALL encrypt all data in transit using HTTPS
3. THE Submission_System SHALL NOT collect or store personal information beyond what is publicly visible
4. THE Submission_System SHALL provide a privacy policy explaining data handling
5. WHEN a user requests data deletion, THEN the Submission_System SHALL remove their submission within 7 days
6. THE Submission_System SHALL comply with GDPR and basic privacy regulations

### Requirement 11: Submission Approval Workflow

**User Story:** As a platform moderator, I want to review submissions before they go live, so that quality and safety standards are maintained.

#### Acceptance Criteria

1. WHEN a submission passes AI verification, THEN the Submission_System SHALL add it to the Submission_Queue
2. THE Submission_Queue SHALL be accessible via an admin interface
3. THE Submission_System SHALL allow moderators to approve or reject submissions
4. WHEN a submission is approved, THEN the Vibe_Hub SHALL add it to the public app list
5. WHEN a submission is rejected, THEN the Submission_System SHALL optionally notify the submitter with a reason
6. THE Submission_System SHALL support bulk approval for verified submissions

### Requirement 12: Social Sharing

**User Story:** As a user, I want to share apps I discover, so that others can benefit from them.

#### Acceptance Criteria

1. THE App_Detail_Page SHALL include a "Share" button
2. WHEN a user clicks "Share", THEN the Vibe_Hub SHALL generate a shareable URL
3. THE Vibe_Hub SHALL generate Open Graph meta tags for rich social media previews
4. THE Vibe_Hub SHALL support sharing to: Twitter, Threads, and via direct link copy
5. THE shareable URL SHALL deep-link directly to the App_Detail_Page
