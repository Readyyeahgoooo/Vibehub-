// Input sanitization utilities to prevent XSS and other attacks

/**
 * Sanitizes text input by removing potentially dangerous characters
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitizes HTML by escaping special characters
 */
export function escapeHTML(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, char => map[char]);
}

/**
 * Validates and sanitizes app name
 */
export function sanitizeAppName(name: string): string {
  if (!name) return '';
  
  return sanitizeText(name)
    .slice(0, 100) // Max 100 characters
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Validates and sanitizes summary (10-20 words)
 */
export function sanitizeSummary(summary: string): string {
  if (!summary) return '';
  
  const sanitized = sanitizeText(summary)
    .slice(0, 200) // Max 200 characters
    .replace(/\s+/g, ' ');
  
  return sanitized;
}

/**
 * Validates summary word count
 */
export function validateSummaryWordCount(summary: string): boolean {
  const words = summary.trim().split(/\s+/).filter(w => w.length > 0);
  return words.length >= 10 && words.length <= 20;
}

/**
 * Validates and sanitizes tags
 */
export function sanitizeTags(tags: string[]): string[] {
  if (!Array.isArray(tags)) return [];
  
  return tags
    .map(tag => sanitizeText(tag).slice(0, 50))
    .filter(tag => tag.length > 0)
    .slice(0, 2); // Max 2 tags
}

/**
 * Validates and sanitizes creator name
 */
export function sanitizeCreatorName(name: string): string {
  if (!name) return '';
  
  return sanitizeText(name)
    .slice(0, 100)
    .replace(/\s+/g, ' ');
}

/**
 * Validates file type
 */
export function validateFileType(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return allowedTypes.includes(file.type);
}

/**
 * Validates file size (max 5MB)
 */
export function validateFileSize(file: File): boolean {
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  return file.size <= maxSize;
}

/**
 * Generates a secure random filename
 */
export function generateSecureFilename(originalFilename: string): string {
  const extension = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}.${extension}`;
}

/**
 * Hashes IP address for privacy (simple hash for rate limiting)
 */
export function hashIP(ip: string): string {
  // Simple hash function for rate limiting
  // In production, use a proper hashing library
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Validates category
 */
export function validateCategory(category: string): boolean {
  const validCategories = [
    'Productivity & Tools',
    'Design & Creative',
    'AI & Experimental',
    'Lifestyle & Niche'
  ];
  return validCategories.includes(category);
}

/**
 * Validates language
 */
export function validateLanguage(language: string): boolean {
  const validLanguages = ['en', 'zh-TW', 'zh-CN'];
  return validLanguages.includes(language);
}

/**
 * Comprehensive form validation
 */
export interface FormValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateSubmissionForm(data: {
  appName: string;
  summary: string;
  tags: string[];
  creator: string;
  category: string;
  sourceUrl: string;
  screenshotUrl: string;
  language: string;
}): FormValidationResult {
  const errors: Record<string, string> = {};

  // Validate app name
  if (!data.appName || data.appName.trim().length === 0) {
    errors.appName = 'App name is required';
  } else if (data.appName.length > 100) {
    errors.appName = 'App name must be 100 characters or less';
  }

  // Validate summary
  if (!data.summary || data.summary.trim().length === 0) {
    errors.summary = 'Summary is required';
  } else if (!validateSummaryWordCount(data.summary)) {
    errors.summary = 'Summary must be 10-20 words';
  }

  // Validate tags
  if (!data.tags || data.tags.length === 0) {
    errors.tags = 'At least one tag is required';
  } else if (data.tags.length > 2) {
    errors.tags = 'Maximum 2 tags allowed';
  }

  // Validate creator
  if (!data.creator || data.creator.trim().length === 0) {
    errors.creator = 'Creator name is required';
  }

  // Validate category
  if (!validateCategory(data.category)) {
    errors.category = 'Invalid category';
  }

  // Validate source URL
  if (!data.sourceUrl || data.sourceUrl.trim().length === 0) {
    errors.sourceUrl = 'Source URL is required';
  }

  // Validate screenshot URL
  if (!data.screenshotUrl || data.screenshotUrl.trim().length === 0) {
    errors.screenshotUrl = 'Screenshot is required';
  }

  // Validate language
  if (!validateLanguage(data.language)) {
    errors.language = 'Invalid language';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
