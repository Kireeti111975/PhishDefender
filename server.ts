import express from "express";
import path from "path";
import * as fs from "fs";
import { createServer as createViteServer } from "vite";
import { trainAndSaveModel, loadAndClassifyEmail, getModelStatus } from "./server/utils/training";
import { extractEmailFeatures } from "./server/utils/feature_extraction";
import { SAMPLE_EMAILS } from "./server/data/sample_emails";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Configure body parser with appropriate limits for larger uploaded datasets
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // --- API Routes defined FIRST ---

  // Endpoint: Get current model status (is it trained, what are the current metrics?)
  app.get("/api/model-status", async (req, res) => {
    try {
      const status = await getModelStatus();
      return res.json(status);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to fetch model status" });
    }
  });

  // Endpoint: Preload default sample emails, train, and return metrics
  app.post("/api/train-default", async (req, res) => {
    try {
      const { algorithm, vectorizerType } = req.body;
      const algo = algorithm || "naive_bayes";
      const vec = vectorizerType || "tfidf";

      const trainResult = await trainAndSaveModel(SAMPLE_EMAILS, algo, vec);
      return res.json({
        success: true,
        message: "Successfully trained model using high-quality preloaded samples.",
        ...trainResult
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to train with preloaded dataset" });
    }
  });

  // Endpoint: Train on custom uploaded CSV list compiled from frontend
  app.post("/api/train", async (req, res) => {
    try {
      const { dataset, algorithm, vectorizerType } = req.body;
      
      if (!dataset || !Array.isArray(dataset) || dataset.length === 0) {
        return res.status(400).json({ error: "Invalid dataset. Expected non-empty array of email items." });
      }

      // Convert and validate structure
      const formattedData = dataset.map((item: any) => {
        const text = String(item.text || item.content || "");
        const rawLabel = String(item.label || "").toLowerCase().trim();
        const label = (rawLabel === "phishing" || rawLabel === "1" || rawLabel === "spam") ? "phishing" : "safe";
        return { text, label: label as "phishing" | "safe" };
      }).filter(d => d.text.length > 5);

      if (formattedData.length < 4) {
        return res.status(400).json({ error: "Not enough valid emails found. Please provide at least 4 emails to support splitting." });
      }

      const algo = algorithm || "naive_bayes";
      const vec = vectorizerType || "tfidf";

      const trainResult = await trainAndSaveModel(formattedData, algo, vec);
      
      return res.json({
        success: true,
        message: `Successfully trained on ${formattedData.length} records.`,
        ...trainResult
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Training failed" });
    }
  });

  // Endpoint: Predict classification and extract key indicators for a custom email body
  app.post("/api/classify", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Please provide valid email text for analysis." });
      }

      // 1. Extract physical features anyway (works regardless of ML state)
      const features = extractEmailFeatures(text);

      // 2. Classify if model is trained, else provide a standard heuristic as fallback
      const mlResult = await loadAndClassifyEmail(text);

      let prediction: "Phishing" | "Safe";
      let confidence: number;
      let classificationSource: "ML Model" | "Heuristic Rule Engine";

      if (mlResult) {
        prediction = mlResult.prediction;
        confidence = mlResult.confidence;
        classificationSource = "ML Model";
      } else {
        // Fallback rule engine based on feature extractions
        // If there are urgent indicators or phishing domains, flag as Phishing
        const urgentCount = features.urgentKeywordsCount;
        const fakeLoginCount = features.fakeLoginCount;
        const ipUrlCount = features.ipBasedUrlsCount;
        const susUrlCount = features.suspiciousUrlsCount;

        const threatScore = (urgentCount * 1.5) + (fakeLoginCount * 2.0) + (ipUrlCount * 4.0) + (susUrlCount * 3.0);
        
        if (threatScore >= 2.5) {
          prediction = "Phishing";
          confidence = Math.min(0.95, 0.5 + (threatScore * 0.1));
        } else if (threatScore >= 1.0) {
          prediction = "Phishing";
          confidence = 0.55;
        } else {
          prediction = "Safe";
          confidence = 0.85;
        }
        classificationSource = "Heuristic Rule Engine";
      }

      // Determine risk score & threat badges
      let riskLevel: "Safe" | "Caution/Low" | "Warning/Medium" | "Danger/High" = "Safe";
      if (prediction === "Phishing") {
        if (confidence >= 0.85) riskLevel = "Danger/High";
        else if (confidence >= 0.70) riskLevel = "Warning/Medium";
        else riskLevel = "Caution/Low";
      } else {
        if (features.totalUrlCount > 0 || features.urgentKeywordsCount > 0 || features.matchedIndicators.length > 0) {
          riskLevel = "Caution/Low";
        }
      }

      return res.json({
        success: true,
        prediction,
        confidence,
        riskLevel,
        classificationSource,
        features
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to classify email" });
    }
  });

  // Endpoint: Reset current saved models to support raw training simulations
  app.post("/api/reset", async (req, res) => {
    try {
      const MODEL_DIR = path.join(process.cwd(), "server", "model");
      const modelPath = path.join(MODEL_DIR, "phishing_model.json");
      const vecPath = path.join(MODEL_DIR, "vectorizer.json");

      if (fs.existsSync(modelPath)) {
        await fs.promises.unlink(modelPath);
      }
      if (fs.existsSync(vecPath)) {
        await fs.promises.unlink(vecPath);
      }

      return res.json({ success: true, message: "Model reset successful." });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to reset model" });
    }
  });

  // --- Vite Dev server or Static Production configuration ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Production serves the built dist/ assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Phishing-Server] Active on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical server failure on startup:", err);
});
