/**
 * Global Types and Interfaces for Phishing Email Detection Applet
 */

export type ModelAlgorithm = "naive_bayes" | "logistic_regression";
export type VectorizerType = "tfidf" | "count";

export interface ConfusionMatrix {
  tp: number; // True Positive (Phishing identified as Phishing)
  fp: number; // False Positive (Safe identified as Phishing)
  tn: number; // True Negative (Safe identified as Safe)
  fn: number; // False Negative (Phishing identified as Safe)
}

export interface WordImportance {
  word: string;
  impact: number;
  classCorrelation: "phishing" | "safe";
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  confusionMatrix: ConfusionMatrix;
  totalTrained: number;
  wordImportances: WordImportance[];
}

export interface ModelStatus {
  trained: boolean;
  metrics?: ModelMetrics;
  algorithm?: ModelAlgorithm;
  vectorizerType?: VectorizerType;
}

export interface MatchedIndicator {
  category: string;
  matches: string[];
  severity: "low" | "medium" | "high";
}

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
  matchedIndicators: MatchedIndicator[];
}

export interface ClassificationResult {
  success: boolean;
  prediction: "Phishing" | "Safe";
  confidence: number;
  riskLevel: "Safe" | "Caution/Low" | "Warning/Medium" | "Danger/High";
  classificationSource: "ML Model" | "Heuristic Rule Engine";
  features: EmailFeatures;
}

export interface SampleEmail {
  text: string;
  label: "phishing" | "safe";
}
