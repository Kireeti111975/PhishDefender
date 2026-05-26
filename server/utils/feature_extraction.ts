/**
 * Security feature extraction for emails.
 * Detects structural or linguistic indicators of phishing.
 */

export interface EmailFeatures {
  emailLength: number;
  suspiciousUrlsCount: number;
  urgentKeywordsCount: number;
  fakeLoginCount: number;
  financialKeywordsCount: number;
  excessiveSpecialChars: boolean;
  specialCharCount: number;
  ipBasedUrlsCount: number;
  totalUrlCount: number;
  matchedIndicators: {
    category: string;
    matches: string[];
    severity: "low" | "medium" | "high";
  }[];
}

// Concrete list of suspicious/urgent words and triggers requested by the specification
const URGENT_KEYWORDS = [
  "verify account", "urgent", "login now", "bank", "free money", "password reset", "click here",
  "immediate action", "suspended", "security alert", "unauthorized access", "action required", "expires within"
];

const FAKE_LOGIN_KEYWORDS = [
  "login", "sign in", "portal", "credentials", "update password", "verify login", "secure portal", "auth-portal"
];

const FINANCIAL_KEYWORDS = [
  "bank", "free money", "payment", "invoice", "refund", "wire transfer", "bank details", "credit card",
  "lottery", "cash prize", "dollars", "crypto", "bitcoin", "claim prize", "sum of"
];

const SUSPICIOUS_URL_PATTERNS = [
  /paypal|netfl|google|apple|amazon|microsoft|bankofamerica|chase|wellsfargo/i, // Brands lookalikes
  /-secure\./i, /verify-/i, /login-/i, /update-/i, /support-/i, /auth-/i,
  /\.(xyz|top|loan|party|club|work|gdn|click)/i // suspicious TLDs
];

/**
 * Extracts phishing features and security indicators from raw email content.
 */
export function extractEmailFeatures(text: string): EmailFeatures {
  const content = text.toLowerCase();
  
  // 1. Email Length
  const emailLength = text.length;

  // 2. Total URLs & Suspicious URLs & IP-based URLs
  // Find all URLs in email
  const urlRegex = /https?:\/\/[^\s]+/gi;
  const urls = text.match(urlRegex) || [];
  const totalUrlCount = urls.length;

  let suspiciousUrlsCount = 0;
  let ipBasedUrlsCount = 0;
  const urlMatches: string[] = [];
  const ipMatches: string[] = [];

  const ipRegex = /https?:\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\b0x[a-f0-9]+\b)/i;

  for (const url of urls) {
    // Check IP based
    if (ipRegex.test(url)) {
      ipBasedUrlsCount++;
      ipMatches.push(url);
    }
    
    // Check suspicious keywords inside the URL or specific TLDs
    let isSus = false;
    for (const pat of SUSPICIOUS_URL_PATTERNS) {
      if (pat.test(url)) {
        isSus = true;
        break;
      }
    }
    if (isSus) {
      suspiciousUrlsCount++;
      urlMatches.push(url);
    }
  }

  // 3. Urgent keywords check
  const urgentMatches: string[] = [];
  let urgentKeywordsCount = 0;
  for (const keyword of URGENT_KEYWORDS) {
    if (content.includes(keyword)) {
      urgentKeywordsCount++;
      urgentMatches.push(keyword);
    }
  }

  // 4. Fake login keywords check
  const loginMatches: string[] = [];
  let fakeLoginCount = 0;
  for (const keyword of FAKE_LOGIN_KEYWORDS) {
    if (content.includes(keyword)) {
      fakeLoginCount++;
      loginMatches.push(keyword);
    }
  }

  // 5. Financial keywords check
  const finMatches: string[] = [];
  let financialKeywordsCount = 0;
  for (const keyword of FINANCIAL_KEYWORDS) {
    if (content.includes(keyword)) {
      financialKeywordsCount++;
      finMatches.push(keyword);
    }
  }

  // 6. Excessive Special Characters check
  // E.g. exclamation marks, dollar signs, question marks
  const specialChars = (text.match(/[!$?*]/g) || []);
  const specialCharCount = specialChars.length;
  // If special chars represent more than 2% of the content or are absolute counts > 10 in a short email, flag it
  const excessiveSpecialChars = specialCharCount > 8 || (emailLength > 0 && (specialCharCount / emailLength) > 0.04);

  // Compile matched indicators details for high frequency representation in ui
  const matchedIndicators: EmailFeatures["matchedIndicators"] = [];

  if (ipBasedUrlsCount > 0) {
    matchedIndicators.push({
      category: "IP-Based Domain/URL",
      matches: ipMatches,
      severity: "high"
    });
  }

  if (suspiciousUrlsCount > 0) {
    matchedIndicators.push({
      category: "Suspicious Lookalike/TLD URLs",
      matches: urlMatches,
      severity: "high"
    });
  } else if (totalUrlCount > 0) {
    matchedIndicators.push({
      category: "Embedded Hyperlinks",
      matches: [`Found ${totalUrlCount} total links`],
      severity: "low"
    });
  }

  if (urgentMatches.length > 0) {
    matchedIndicators.push({
      category: "Urgency Indicators",
      matches: urgentMatches,
      severity: "high"
    });
  }

  if (loginMatches.length > 0) {
    matchedIndicators.push({
      category: "Credential/Login Requests",
      matches: loginMatches,
      severity: "medium"
    });
  }

  if (finMatches.length > 0) {
    matchedIndicators.push({
      category: "Financial Aggressions",
      matches: finMatches,
      severity: "medium"
    });
  }

  if (excessiveSpecialChars) {
    matchedIndicators.push({
      category: "Hyperbolic Punctuation (Excessive Special Characters)",
      matches: [`Total of ${specialCharCount} aggressive characters (!, $, ?, *)`],
      severity: "low"
    });
  }

  return {
    emailLength,
    suspiciousUrlsCount,
    urgentKeywordsCount,
    fakeLoginCount,
    financialKeywordsCount,
    excessiveSpecialChars,
    specialCharCount,
    ipBasedUrlsCount,
    totalUrlCount,
    matchedIndicators
  };
}
