# Implementation Plan: GitHub Pages + Cloudflare Workers

## Overview

This plan implements the Vibe Hub secure submission system for GitHub Pages (frontend) with Cloudflare Workers (backend). All tasks focus on free-tier deployment.

## Tasks

- [ ] 1. Setup GitHub Pages deployment
  - [ ] 1.1 Create GitHub Actions workflow for automated deployment
    - Configure build and deploy steps
    - Set up environment variables
    - Add deployment status checks
    - _Requirements: 1.2, 1.3, 4.1, 4.2, 4.3_
  
  - [ ] 1.2 Configure GitHub Pages settings
    - Enable GitHub Pages in repository settings
    - Set up custom domain (optional)
    - Configure HTTPS
    - _Requirements: 1.1, 1.3, 1.4_
  
  - [ ] 1.3 Update build configuration for GitHub Pages
    - Set base URL for GitHub Pages
    - Configure routing for SPA
    - Add 404.html for client-side routing
    - _Requirements: 1.5_

- [ ] 2. Setup Cloudflare Workers infrastructure
  - [ ] 2.1 Initialize Cloudflare Workers project
    - Install Wrangler CLI
    - Create wrangler.toml configuration
    - Set up TypeScript for workers
    - Configure KV namespace binding
    - Configure R2 bucket binding
    - _Requirements: 2.1, 2.3, 2.4, 5.2_
  
  - [ ] 2.2 Configure Cloudflare secrets
    - Set OPENROUTER_API_KEY secret
    - Set ADMIN_TOKEN secret
    - Document secret management
    - _Requirements: 2.2, 5.3_
  
  - [ ] 2.3 Create CORS middleware
    - Implement OPTIONS handler
    - Add CORS headers to all responses
    - Configure allowed origins
    - _Requirements: 2.5, 3.1, 3.2, 3.3, 3.4_

- [ ] 3. Implement Cloudflare R2 image upload
  - [ ] 3.1 Create /api/upload worker endpoint
    - Validate file type and size
    - Generate unique filename
    - Upload to R2 bucket
    - Return public URL
    - _Requirements: Secure image upload_
  
  - [ ] 3.2 Configure R2 public access
    - Set up R2 custom domain or public bucket
    - Configure CORS for R2
    - Test image serving
    - _Requirements: Image storage_
  
  - [ ] 3.3 Write tests for upload endpoint
    - Test file validation
    - Test unique filename generation
    - Test R2 upload
    - Test error handling

- [ ] 4. Implement worker API endpoints
  - [ ] 4.1 Create /api/verify endpoint
    - Implement AI screenshot verification
    - Call OpenRouter API
    - Extract and compare usernames
    - Return verification result
    - _Requirements: AI verification_
  
  - [ ] 4.2 Create /api/submit endpoint
    - Validate form data
    - Check rate limits using KV
    - Call verification endpoint
    - Store in KV submission queue
    - Return confirmation
    - _Requirements: Submission workflow_
  
  - [ ] 4.3 Create /api/apps endpoints
    - GET /api/apps - List approved apps
    - GET /api/apps/[id] - Get app details
    - Store/retrieve from KV
    - _Requirements: App data retrieval_
  
  - [ ] 4.4 Create /api/admin endpoints
    - GET /api/admin/pending - List submissions
    - POST /api/admin/approve - Approve/reject
    - Implement token authentication
    - _Requirements: Admin workflow_

- [ ] 5. Update frontend for Cloudflare Workers
  - [ ] 5.1 Create API client service
    - Abstract API calls
    - Use VITE_API_BASE_URL environment variable
    - Handle CORS
    - Add error handling
    - _Requirements: 5.1_
  
  - [ ] 5.2 Update SubmitForm component
    - Integrate with new API client
    - Handle upload progress
    - Display verification status
    - Show error messages
    - _Requirements: Enhanced submission form_
  
  - [ ] 5.3 Update environment configuration
    - Create .env.production with worker URL
    - Update .env.example
    - Document configuration
    - _Requirements: 5.1, 5.4_

- [ ] 6. Implement rate limiting with Cloudflare KV
  - [ ] 6.1 Create rate limiter utility
    - Track requests per IP in KV
    - Implement sliding window
    - Auto-expire old entries
    - Return rate limit status
    - _Requirements: Rate limiting_
  
  - [ ] 6.2 Write tests for rate limiting
    - Test limit enforcement
    - Test counter reset
    - Test multiple IPs

- [ ] 7. Implement caching with Cloudflare KV
  - [ ] 7.1 Create translation cache
    - Cache AI translations in KV
    - Check cache before API calls
    - Set 30-day TTL
    - _Requirements: Translation caching_
  
  - [ ] 7.2 Create app data cache
    - Cache approved apps list
    - Invalidate on updates
    - Optimize read performance

- [ ] 8. Migrate existing data to Cloudflare KV
  - [ ] 8.1 Create migration script
    - Export APPS_DATA from constants.ts
    - Transform to KV format
    - Upload using Wrangler CLI
    - Verify data integrity
    - _Requirements: Data migration_
  
  - [ ] 8.2 Write tests for migration
    - Test data transformation
    - Test KV operations

- [ ] 9. Implement security measures
  - [ ] 9.1 Add input sanitization
    - Sanitize all user inputs
    - Prevent XSS attacks
    - Limit input lengths
    - _Requirements: Security_
  
  - [ ] 9.2 Add security headers
    - CSP headers
    - HSTS headers
    - X-Frame-Options
    - _Requirements: HTTPS enforcement_
  
  - [ ] 9.3 Write security tests
    - Test input sanitization
    - Test XSS prevention
    - Test CORS configuration

- [ ] 10. Testing and validation
  - [ ] 10.1 Write unit tests for all workers
    - Test each endpoint
    - Test error scenarios
    - Test rate limiting
    - Test caching
  
  - [ ] 10.2 Write integration tests
    - Test complete submission flow
    - Test admin workflow
    - Test multi-language support
  
  - [ ] 10.3 Run property-based tests
    - All 14 correctness properties
    - 100+ iterations each
    - Verify all pass

- [ ] 11. Documentation
  - [ ] 11.1 Update README for GitHub Pages deployment
    - Document setup steps
    - Document Cloudflare configuration
    - Add troubleshooting guide
    - _Requirements: Documentation_
  
  - [ ] 11.2 Create deployment guide
    - Step-by-step Cloudflare setup
    - GitHub Actions configuration
    - Environment variables setup
    - Custom domain setup (optional)

- [ ] 12. Deploy to production
  - [ ] 12.1 Deploy Cloudflare Workers
    - Run wrangler deploy
    - Verify endpoints work
    - Test CORS from GitHub Pages
  
  - [ ] 12.2 Deploy to GitHub Pages
    - Push to main branch
    - Verify GitHub Actions runs
    - Check deployment status
    - Test live site
  
  - [ ] 12.3 Final verification
    - Test all features end-to-end
    - Verify API keys not exposed
    - Check rate limiting works
    - Monitor for errors

## Notes

- All services used are free tier
- Cloudflare Workers: 100k requests/day free
- Cloudflare KV: 1GB storage, 100k reads/day free
- Cloudflare R2: 10GB storage, zero egress fees
- GitHub Pages: Free for public repos
- Total cost: $0-1/month (only OpenRouter API usage)
