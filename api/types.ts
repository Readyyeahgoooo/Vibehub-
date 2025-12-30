// Shared types for API requests and responses

export interface UploadRequest {
  file: File;
}

export interface UploadResponse {
  success: boolean;
  url?: string;
  error?: ErrorResponse;
}

export interface VerifyRequest {
  screenshotUrl: string;
  claimedUsername: string;
  sourceUrl: string;
}

export interface VerifyResponse {
  verified: boolean;
  confidence: number;
  extractedUsername?: string;
  reason?: string;
}

export interface SubmitRequest {
  appName: string;
  summary: string;
  tags: string[];
  creator: string;
  category: string;
  sourceUrl: string;
  screenshotUrl: string;
  language: string;
}

export interface SubmitResponse {
  success: boolean;
  submissionId?: string;
  message: string;
  error?: ErrorResponse;
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: any;
  retryAfter?: number;
}

export enum ErrorCode {
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

export interface SubmissionData {
  id: string;
  appName: string;
  summary: string;
  tags: string[];
  creator: string;
  category: string;
  sourceUrl: string;
  screenshotUrl: string;
  language: string;
  verificationResult: {
    verified: boolean;
    confidence: number;
    extractedUsername: string;
    timestamp: string;
  };
  submittedAt: string;
  submitterIp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AppDetailData {
  id: string;
  name: string;
  summary: string;
  fullDescription: string;
  tags: string[];
  creator: string;
  category: string;
  githubUrl?: string;
  threadsUrl?: string;
  screenshots: string[];
  createdAt: string;
  updatedAt: string;
  sourceVerified: boolean;
  translations?: {
    [key: string]: {
      name: string;
      fullDescription: string;
      summary: string;
    };
  };
}
