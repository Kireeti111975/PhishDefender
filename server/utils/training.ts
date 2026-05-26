/**
 * Genuine Machine Learning vectors & classifiers implemented in TypeScript.
 * Bypasses container Python setup concerns while retaining fully mathematically accurate ML.
 */

import * as fs from "fs";
import * as path from "path";
import { preprocessText } from "./preprocessing";

// --- Vectorizer Interfaces ---
export interface VectorizerState {
  type: "tfidf" | "count";
  vocabulary: Record<string, number>; // token -> index
  idf: number[]; // Inverse document frequency for each index
}

/**
 * Custom TF-IDF or Count Vectorizer.
 */
export class TextVectorizer {
  type: "tfidf" | "count" = "tfidf";
  vocabulary: Record<string, number> = {};
  idf: number[] = [];
  featureCount = 0;

  constructor(type: "tfidf" | "count" = "tfidf") {
    this.type = type;
  }

  /**
   * Learns vocabulary and IDF from documents list.
   */
  fit(documents: string[][]) {
    const vocab: Record<string, number> = {};
    let index = 0;

    // 1. Build Vocabulary
    for (const doc of documents) {
      for (const token of doc) {
        if (vocab[token] === undefined) {
          vocab[token] = index++;
        }
      }
    }

    this.vocabulary = vocab;
    this.featureCount = index;
    this.idf = new Array(this.featureCount).fill(0);

    // 2. Compute IDF if type is tfidf
    if (this.type === "tfidf") {
      const N = documents.length;
      const docFrequency = new Array(this.featureCount).fill(0);

      for (const doc of documents) {
        const uniqueTokens = new Set(doc);
        for (const token of uniqueTokens) {
          const idx = this.vocabulary[token];
          if (idx !== undefined) {
            docFrequency[idx]++;
          }
        }
      }

      for (let i = 0; i < this.featureCount; i++) {
        // Log-smoothing formula: log(N / (DF + 1)) + 1
        this.idf[i] = Math.log(N / (docFrequency[i] + 1)) + 1;
      }
    } else {
      // For standard term frequency, IDF is just 1
      this.idf = new Array(this.featureCount).fill(1);
    }
  }

  /**
   * Transforms tokens list to sparse vector.
   */
  transform(tokens: string[]): number[] {
    const vector = new Array(this.featureCount).fill(0);
    if (this.featureCount === 0) return vector;

    // Term Frequency (TF) computation
    for (const token of tokens) {
      const idx = this.vocabulary[token];
      if (idx !== undefined) {
        vector[idx]++;
      }
    }

    // Apply TF-IDF scaling if requested
    if (this.type === "tfidf") {
      for (let i = 0; i < this.featureCount; i++) {
        if (vector[i] > 0) {
          // TF = count; standard TF weight: tf(t, d) = vector[i]
          vector[i] = vector[i] * this.idf[i];
        }
      }
      
      // Normalize vector length (L2 norm) to avoid document-length bias
      let sumSquares = 0;
      for (let i = 0; i < this.featureCount; i++) {
        sumSquares += vector[i] * vector[i];
      }
      if (sumSquares > 0) {
        const norm = Math.sqrt(sumSquares);
        for (let i = 0; i < this.featureCount; i++) {
          vector[i] /= norm;
        }
      }
    }

    return vector;
  }

  getState(): VectorizerState {
    return {
      type: this.type,
      vocabulary: this.vocabulary,
      idf: this.idf
    };
  }

  loadState(state: VectorizerState) {
    this.type = state.type;
    this.vocabulary = state.vocabulary;
    this.idf = state.idf;
    this.featureCount = Object.keys(this.vocabulary).length;
  }
}

// --- Classifiers ---

export interface ClassifierState {
  algorithm: "naive_bayes" | "logistic_regression";
  // Naive Bayes States
  priors?: number[]; // [p(safe), p(phishing)]
  featureProbabilities?: number[][]; // [vocab_size][class_count]
  // Logistic Regression States
  weights?: number[]; // coefficients of length V
  bias?: number; // intercept
}

/**
 * Multinomial Naive Bayes classifier.
 */
export class NaiveBayesClassifier {
  priors: number[] = [0.5, 0.5]; // [p(0), p(1)] -> 0: safe, 1: phishing
  featureProbabilities: number[][] = []; // Dimensions: [vocab_size][2]

  train(X: number[][], y: number[], vocabSize: number) {
    const totalDocs = X.length;
    if (totalDocs === 0) return;

    // 1. Calculate class priors
    const classCounts = [0, 0];
    for (const label of y) {
      classCounts[label]++;
    }
    
    // Smooth priors
    this.priors = [
      (classCounts[0] + 1) / (totalDocs + 2),
      (classCounts[1] + 1) / (totalDocs + 2)
    ];

    // 2. Compute token counts per class
    const featureSumsByClass = [
      new Array(vocabSize).fill(0), // counts of words in class 0 (safe)
      new Array(vocabSize).fill(0)  // counts of words in class 1 (phishing)
    ];

    const totalFeaturesInClass = [0, 0];

    for (let i = 0; i < totalDocs; i++) {
      const cls = y[i];
      const docVector = X[i];
      for (let j = 0; j < vocabSize; j++) {
        const val = docVector[j];
        featureSumsByClass[cls][j] += val;
        totalFeaturesInClass[cls] += val;
      }
    }

    // 3. Compute probabilities with Laplace smoothing (+1)
    this.featureProbabilities = [];
    for (let j = 0; j < vocabSize; j++) {
      const probClass0 = (featureSumsByClass[0][j] + 1) / (totalFeaturesInClass[0] + vocabSize);
      const probClass1 = (featureSumsByClass[1][j] + 1) / (totalFeaturesInClass[1] + vocabSize);
      this.featureProbabilities.push([probClass0, probClass1]);
    }
  }

  /**
   * Returns log-probability for safe and phishing classes.
   */
  predictProba(x: number[]): { probability: number; label: 0 | 1 } {
    const logP0 = Math.log(this.priors[0]);
    const logP1 = Math.log(this.priors[1]);

    let score0 = logP0;
    let score1 = logP1;

    for (let j = 0; j < x.length; j++) {
      const val = x[j];
      if (val > 0) {
        // Linear accumulation of log likelihood
        score0 += val * Math.log(this.featureProbabilities[j][0]);
        score1 += val * Math.log(this.featureProbabilities[j][1]);
      }
    }

    // Convert differences in score to normalized probability using sigmoid-diff
    // prob = 1 / (1 + exp(score0 - score1))
    const diff = score0 - score1;
    // Cap exponential to avoid overflow
    const cappedDiff = Math.max(-20, Math.min(20, diff));
    const phishingProb = 1 / (1 + Math.exp(cappedDiff));
    
    return {
      probability: phishingProb, // Closer to 1 is phishing, Closer to 0 is safe
      label: phishingProb >= 0.5 ? 1 : 0
    };
  }
}

/**
 * Binary Logistic Regression using Gradient Descent.
 */
export class LogisticRegressionClassifier {
  weights: number[] = [];
  bias = 0;

  train(X: number[][], y: number[], vocabSize: number, learningRate = 0.5, epochs = 40) {
    this.weights = new Array(vocabSize).fill(0);
    this.bias = 0;
    const N = X.length;
    if (N === 0) return;

    // Sigmoid helper
    const sigmoid = (z: number) => 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));

    for (let epoch = 0; epoch < epochs; epoch++) {
      let dBias = 0;
      const dWeights = new Array(vocabSize).fill(0);

      for (let i = 0; i < N; i++) {
        const x = X[i];
        const label = y[i];

        // dot product
        let dot = this.bias;
        for (let j = 0; j < vocabSize; j++) {
          dot += x[j] * this.weights[j];
        }

        const pred = sigmoid(dot);
        const error = pred - label;

        dBias += error;
        for (let j = 0; j < vocabSize; j++) {
          dWeights[j] += error * x[j];
        }
      }

      // Update parameters (with L2 weight decay / regularisation 0.01)
      const l2Lambda = 0.01;
      this.bias -= (learningRate * dBias) / N;
      for (let j = 0; j < vocabSize; j++) {
        const regularization = l2Lambda * this.weights[j];
        this.weights[j] -= learningRate * (dWeights[j] / N + regularization);
      }
    }
  }

  predictProba(x: number[]): { probability: number; label: 0 | 1 } {
    let dot = this.bias;
    for (let j = 0; j < x.length; j++) {
      dot += x[j] * this.weights[j];
    }
    const prob = 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, dot))));
    return {
      probability: prob,
      label: prob >= 0.5 ? 1 : 0
    };
  }
}

// --- High-level service functions ---

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  confusionMatrix: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
  totalTrained: number;
  wordImportances: { word: string; impact: number; classCorrelation: "phishing" | "safe" }[];
}

export interface TrainingResult {
  metrics: ModelMetrics;
  algorithm: "naive_bayes" | "logistic_regression";
  vectorizerType: "tfidf" | "count";
  vocabSize: number;
}

const MODEL_DIR = path.join(process.cwd(), "server", "model");

/**
 * Dynamic service training function. Splits data, trains model, returns metrics, and persists states.
 */
export async function trainAndSaveModel(
  dataset: { text: string; label: "phishing" | "safe" }[],
  algorithm: "naive_bayes" | "logistic_regression",
  vectorizerType: "tfidf" | "count"
): Promise<TrainingResult> {
  // 1. Shuffles and splits data (80% training, 20% testing)
  const shuffled = [...dataset].sort(() => Math.random() - 0.5);
  const trainSize = Math.floor(shuffled.length * 0.8);
  const trainDocs = shuffled.slice(0, trainSize);
  const testDocs = shuffled.slice(trainSize);

  // 2. Extract tokens
  const trainTokens = trainDocs.map(d => preprocessText(d.text));
  const testTokens = testDocs.map(d => preprocessText(d.text));

  // 3. Fit Vectorizer on Training Corpus
  const vectorizer = new TextVectorizer(vectorizerType);
  vectorizer.fit(trainTokens);

  // 4. Transform to float vectors
  const X_train = trainTokens.map(tokens => vectorizer.transform(tokens));
  const y_train = trainDocs.map(d => d.label === "phishing" ? 1 : 0);

  const X_test = testTokens.map(tokens => vectorizer.transform(tokens));
  const y_test = testDocs.map(d => d.label === "phishing" ? 1 : 0);

  const vocabSize = vectorizer.featureCount;

  // 5. Training classifier
  let classifierState: ClassifierState;
  let predictFunc: (x: number[]) => { probability: number; label: 0 | 1 };

  if (algorithm === "naive_bayes") {
    const nb = new NaiveBayesClassifier();
    nb.train(X_train, y_train, vocabSize);
    classifierState = {
      algorithm,
      priors: nb.priors,
      featureProbabilities: nb.featureProbabilities
    };
    predictFunc = (x) => nb.predictProba(x);
  } else {
    const lr = new LogisticRegressionClassifier();
    lr.train(X_train, y_train, vocabSize, 0.5, 50);
    classifierState = {
      algorithm,
      weights: lr.weights,
      bias: lr.bias
    };
    predictFunc = (x) => lr.predictProba(x);
  }

  // 6. Test performance
  let tp = 0, fp = 0, tn = 0, fn = 0;

  for (let i = 0; i < X_test.length; i++) {
    const gold = y_test[i];
    const { label } = predictFunc(X_test[i]);

    if (gold === 1 && label === 1) tp++;
    if (gold === 0 && label === 1) fp++;
    if (gold === 0 && label === 0) tn++;
    if (gold === 1 && label === 0) fn++;
  }

  const accuracy = X_test.length > 0 ? (tp + tn) / X_test.length : 1.0;
  const precision = (tp + fp) > 0 ? tp / (tp + fp) : 1.0;
  const recall = (tp + fn) > 0 ? tp / (tp + fn) : 1.0;
  const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 1.0;

  // 7. Calculate Word Importances (Top features helping predictions)
  const vocabWords = Object.entries(vectorizer.vocabulary).sort((a, b) => a[1] - b[1]).map(e => e[0]);
  const wordImportances: ModelMetrics["wordImportances"] = [];

  if (algorithm === "naive_bayes" && classifierState.featureProbabilities) {
    const probs = classifierState.featureProbabilities;
    for (let j = 0; j < vocabSize; j++) {
      const pSafe = probs[j][0];
      const pPhish = probs[j][1];
      const word = vocabWords[j];
      
      // Calculate relevance ratio
      if (pPhish > pSafe) {
        wordImportances.push({
          word,
          impact: pPhish / pSafe,
          classCorrelation: "phishing"
        });
      } else {
        wordImportances.push({
          word,
          impact: pSafe / pPhish,
          classCorrelation: "safe"
        });
      }
    }
  } else if (algorithm === "logistic_regression" && classifierState.weights) {
    const weights = classifierState.weights;
    for (let j = 0; j < vocabSize; j++) {
      const weight = weights[j];
      const word = vocabWords[j];
      if (Math.abs(weight) > 0.01) {
        wordImportances.push({
          word,
          impact: Math.abs(weight),
          classCorrelation: weight > 0 ? "phishing" : "safe"
        });
      }
    }
  }

  // Sort by highest impact and slice to top 30 key predictors
  const topImportances = wordImportances
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 30);

  const metrics: ModelMetrics = {
    accuracy,
    precision,
    recall,
    f1,
    confusionMatrix: { tp, fp, tn, fn },
    totalTrained: dataset.length,
    wordImportances: topImportances
  };

  // Ensure model directories exist
  if (!fs.existsSync(MODEL_DIR)) {
    fs.mkdirSync(MODEL_DIR, { recursive: true });
  }

  // 8. Save persistent models to model/
  await fs.promises.writeFile(path.join(MODEL_DIR, "vectorizer.json"), JSON.stringify(vectorizer.getState(), null, 2));
  await fs.promises.writeFile(path.join(MODEL_DIR, "phishing_model.json"), JSON.stringify({ classifierState, metrics }, null, 2));

  return {
    metrics,
    algorithm,
    vectorizerType,
    vocabSize
  };
}

/**
 * Predict function based on saved weights
 */
export async function loadAndClassifyEmail(text: string): Promise<{
  prediction: "Phishing" | "Safe";
  confidence: number;
  algorithm: string;
} | null> {
  try {
    const modelPath = path.join(MODEL_DIR, "phishing_model.json");
    const vecPath = path.join(MODEL_DIR, "vectorizer.json");

    if (!fs.existsSync(modelPath) || !fs.existsSync(vecPath)) {
      return null;
    }

    const modelJSON = JSON.parse(await fs.promises.readFile(modelPath, "utf-8"));
    const vecJSON = JSON.parse(await fs.promises.readFile(vecPath, "utf-8"));

    const vectorizer = new TextVectorizer();
    vectorizer.loadState(vecJSON);

    const tokens = preprocessText(text);
    const x = vectorizer.transform(tokens);

    const { classifierState } = modelJSON;
    let confidence = 0.5;
    let label: 0 | 1 = 0;

    if (classifierState.algorithm === "naive_bayes") {
      const nb = new NaiveBayesClassifier();
      nb.priors = classifierState.priors;
      nb.featureProbabilities = classifierState.featureProbabilities;
      const res = nb.predictProba(x);
      confidence = res.probability;
      label = res.label;
    } else {
      const lr = new LogisticRegressionClassifier();
      lr.weights = classifierState.weights;
      lr.bias = classifierState.bias;
      const res = lr.predictProba(x);
      confidence = res.probability;
      label = res.label;
    }

    // confidence ranges from 0 to 1.
    // label == 1 is Phishing (prob >= 0.5)
    // label == 0 is Safe (prob < 0.5)
    // For prediction user feedback, standardise confidence label
    const displayConfidence = label === 1 ? confidence : (1 - confidence);

    return {
      prediction: label === 1 ? "Phishing" : "Safe",
      confidence: displayConfidence,
      algorithm: classifierState.algorithm
    };
  } catch (err) {
    console.error("Error loading and classifying email:", err);
    return null;
  }
}

/**
 * Returns saved metadata or metrics if trained
 */
export async function getModelStatus(): Promise<{
  trained: boolean;
  metrics?: ModelMetrics;
  algorithm?: string;
  vectorizerType?: string;
} | null> {
  try {
    const modelPath = path.join(MODEL_DIR, "phishing_model.json");
    const vecPath = path.join(MODEL_DIR, "vectorizer.json");

    if (!fs.existsSync(modelPath) || !fs.existsSync(vecPath)) {
      return { trained: false };
    }

    const modelJSON = JSON.parse(await fs.promises.readFile(modelPath, "utf-8"));
    const vecJSON = JSON.parse(await fs.promises.readFile(vecPath, "utf-8"));

    return {
      trained: true,
      metrics: modelJSON.metrics,
      algorithm: modelJSON.classifierState.algorithm,
      vectorizerType: vecJSON.type
    };
  } catch (e) {
    return { trained: false };
  }
}
