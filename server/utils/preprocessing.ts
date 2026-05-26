/**
 * Preprocessing utilities for email text classification.
 */

// A solid set of standard English stopwords to remove
export const ENGLISH_STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
  "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
  "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's",
  "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'm", "i've",
  "i'd", "i'll", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
  "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not",
  "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
  "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll",
  "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's",
  "the", "their", "theirs", "them", "themselves", "then", "there", "there's",
  "these", "they", "they'd", "they'll", "they're", "they've", "this", "those",
  "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we",
  "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when",
  "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why",
  "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll",
  "you're", "you've", "your", "yours", "yourself", "yourselves"
]);

/**
 * Preprocesses a raw email text string by:
 * 1. Lowercasing
 * 2. Regularizing URLs
 * 3. Removing special characters
 * 4. Tokenizing by whitespace
 * 5. Removing stopwords
 * 6. Filtering out short or empty tokens
 * 
 * @param text The raw email string.
 * @returns An array of filtered, normalized word tokens.
 */
export function preprocessText(text: string): string[] {
  if (!text) return [];

  // 1. Lowercasing
  let processed = text.toLowerCase();

  // 2. Extract and standardize URL placeholders so TF-IDF can leverage URL presence
  processed = processed.replace(/https?:\/\/[^\s]+/g, " http_url_placeholder ");
  
  // 3. Remove special characters (keep words and url placeholders)
  // Let's replace any character that is not alphanumeric or whitespace or underscores with spaces
  processed = processed.replace(/[^a-z0-9_\s]/g, " ");

  // 4. Tokenization by spaces
  const tokens = processed.split(/\s+/);

  // 5. Filter out stopwords and short strings
  const cleanTokens: string[] = [];
  for (const token of tokens) {
    if (!token) continue;
    
    // Stopword check
    if (ENGLISH_STOPWORDS.has(token)) {
      continue;
    }
    
    // Minimum length requirement (except crucial markers or numbers)
    if (token.length > 1 || token === "http_url_placeholder" || /^\d+$/.test(token)) {
      cleanTokens.push(token);
    }
  }

  return cleanTokens;
}
