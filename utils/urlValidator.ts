// URL validation and malicious link detection

const ALLOWED_DOMAINS = [
  'threads.net',
  'github.com',
  'twitter.com',
  'x.com',
];

const SUSPICIOUS_PATTERNS = [
  /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP addresses
  /^data:/i, // Data URIs
  /^javascript:/i, // JavaScript protocol
  /^file:/i, // File protocol
  /<script/i, // Script tags
  /on\w+=/i, // Event handlers
];

const BLOCKED_DOMAINS = [
  // Add known malicious domains here
  'bit.ly', // URL shorteners can hide malicious links
  'tinyurl.com',
];

export interface URLValidationResult {
  valid: boolean;
  error?: string;
  domain?: string;
  username?: string;
}

/**
 * Validates a URL for security and allowed domains
 */
export function validateURL(urlString: string): URLValidationResult {
  // Check for empty or invalid input
  if (!urlString || typeof urlString !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(urlString)) {
      return { valid: false, error: 'URL contains suspicious patterns' };
    }
  }

  // Parse URL
  let url: URL;
  try {
    url = new URL(urlString);
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Check protocol
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { valid: false, error: 'Only HTTP/HTTPS protocols are allowed' };
  }

  // Extract domain
  const domain = url.hostname.toLowerCase();

  // Check against blocklist
  for (const blocked of BLOCKED_DOMAINS) {
    if (domain.includes(blocked)) {
      return { valid: false, error: 'Domain is blocked' };
    }
  }

  // Check against allowlist
  const isAllowed = ALLOWED_DOMAINS.some(allowed => 
    domain === allowed || domain.endsWith(`.${allowed}`)
  );

  if (!isAllowed) {
    return { 
      valid: false, 
      error: `Domain not allowed. Allowed domains: ${ALLOWED_DOMAINS.join(', ')}` 
    };
  }

  // Extract username from URL
  const username = extractUsername(url);

  return { 
    valid: true, 
    domain,
    username 
  };
}

/**
 * Extracts username from supported platform URLs
 */
export function extractUsername(url: URL): string | undefined {
  const domain = url.hostname.toLowerCase();
  const pathname = url.pathname;

  // GitHub: https://github.com/username or https://github.com/username/repo
  if (domain.includes('github.com')) {
    const match = pathname.match(/^\/([^\/]+)/);
    return match ? match[1] : undefined;
  }

  // Threads: https://www.threads.net/@username
  if (domain.includes('threads.net')) {
    const match = pathname.match(/^\/@?([^\/]+)/);
    return match ? match[1] : undefined;
  }

  // Twitter/X: https://twitter.com/username or https://x.com/username
  if (domain.includes('twitter.com') || domain.includes('x.com')) {
    const match = pathname.match(/^\/([^\/]+)/);
    return match ? match[1] : undefined;
  }

  return undefined;
}

/**
 * Normalizes username for comparison (case-insensitive, removes @ prefix)
 */
export function normalizeUsername(username: string): string {
  if (!username) return '';
  return username.toLowerCase().replace(/^@/, '').trim();
}

/**
 * Compares two usernames for matching (fuzzy match)
 */
export function usernamesMatch(username1: string, username2: string): boolean {
  const normalized1 = normalizeUsername(username1);
  const normalized2 = normalizeUsername(username2);
  
  if (!normalized1 || !normalized2) return false;
  
  return normalized1 === normalized2;
}
