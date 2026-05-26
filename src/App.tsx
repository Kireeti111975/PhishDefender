import React, { useState, useEffect } from "react";
import Navigation from "./components/Navigation";
import HomeView from "./components/HomeView";
import DetectView from "./components/DetectView";
import DashboardView from "./components/DashboardView";
import { ModelStatus, ClassificationResult, ModelAlgorithm, VectorizerType } from "./types";
import { ShieldCheck, ShieldAlert, Terminal, RefreshCw, AlertCircle } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "detect" | "dashboard">("home");
  
  // Real-time backend model states
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Training progress states
  const [isTraining, setIsTraining] = useState(false);
  const [trainingError, setTrainingError] = useState<string | null>(null);
  const [trainingSuccessMsg, setTrainingSuccessMsg] = useState<string | null>(null);

  // Analysis progress states
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 1. Fetch current trained model configuration and statistics
  const fetchModelStatus = async () => {
    try {
      setStatusError(null);
      const res = await fetch("/api/model-status");
      if (!res.ok) {
        throw new Error("HTTP connection to safety server failed.");
      }
      const data = await res.json();
      setModelStatus(data);
    } catch (err: any) {
      console.error("Error fetching model status:", err);
      setStatusError("Could not connect to full-stack service portal. Ensure the dev server is active.");
    } finally {
      setIsStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchModelStatus();
  }, []);

  // 2. Training utilizing preloaded default electronic mail templates
  const handleTrainDefault = async (algorithm: ModelAlgorithm, vectorizerType: VectorizerType) => {
    try {
      setIsTraining(true);
      setTrainingError(null);
      setTrainingSuccessMsg(null);

      const res = await fetch("/api/train-default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ algorithm, vectorizerType }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to finalize training session.");
      }

      setModelStatus({
        trained: true,
        metrics: data.metrics,
        algorithm: data.algorithm,
        vectorizerType: data.vectorizerType,
      });

      setTrainingSuccessMsg("Success! Model trained perfectly using 20 standard preloaded electronic messages.");
      
      // Auto transition to view dashboard metrics
      setTimeout(() => {
        setActiveTab("dashboard");
        setTrainingSuccessMsg(null);
      }, 1500);

    } catch (err: any) {
      setTrainingError(err.message || "Model compilation error occurred.");
    } finally {
      setIsTraining(false);
    }
  };

  // 3. Custom Training utilizing parsed CSV data uploaded by client
  const handleTrainCustom = async (
    algorithm: ModelAlgorithm,
    vectorizerType: VectorizerType,
    dataset: { text: string; label: string }[]
  ) => {
    try {
      setIsTraining(true);
      setTrainingError(null);
      setTrainingSuccessMsg(null);

      const res = await fetch("/api/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset, algorithm, vectorizerType }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Dataset failed constraints compilation.");
      }

      setModelStatus({
        trained: true,
        metrics: data.metrics,
        algorithm: data.algorithm,
        vectorizerType: data.vectorizerType,
      });

      setTrainingSuccessMsg(`Success! Vector parameters learned. Trained classification on ${dataset.length} records.`);
      
      // Navigate to performance dashboard
      setTimeout(() => {
        setActiveTab("dashboard");
        setTrainingSuccessMsg(null);
      }, 1500);

    } catch (err: any) {
      setTrainingError(err.message || "Failed custom learning.");
    } finally {
      setIsTraining(false);
    }
  };

  // 4. Classify an electronic message
  const handleClassifyEmail = async (text: string): Promise<ClassificationResult | null> => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Classification transaction failed.");
      }
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Classifier transaction failure:", err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 5. Destruct current saved trained model coefficient files
  const handleResetModel = async () => {
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        setModelStatus({ trained: false });
        setActiveTab("home");
      }
    } catch (err) {
      console.error("Model reset failure:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-[#e0e0e0] flex flex-col font-sans relative selection:bg-cyan-500/20 selection:text-cyan-300 antialiased custom-scanline">
      
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-radial from-cyan-500/5 via-[#0a0b0e]/0 to-[#0a0b0e]/0 pointer-events-none z-0" />

      {/* Main system header / navigation */}
      <Navigation 
         activeTab={activeTab} 
         setActiveTab={setActiveTab} 
         modelStatus={modelStatus} 
      />

      {/* Success Notification popups */}
      {trainingSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce max-w-sm">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded shadow-2xl flex items-start space-x-3 text-cyan-400 text-xs">
            <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5 text-cyan-400" />
            <div>
              <p className="font-bold uppercase tracking-wider text-white">SECURE KERNEL UPDATED</p>
              <p className="mt-1 text-zinc-300 leading-normal">{trainingSuccessMsg}</p>
            </div>
          </div>
        </div>
      )}

      {/* Connection Portal Failure Header */}
      {statusError && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-400 py-2.5 text-center text-xs font-mono font-bold flex items-center justify-center space-x-2 z-10">
          <AlertCircle className="h-4 w-4" />
          <span>PORTAL ALERT: {statusError}</span>
        </div>
      )}

      {/* Primary Workspace View Switcher */}
      <main className="flex-1 z-10">
        {isStatusLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              Connecting to secure classification center...
            </p>
          </div>
        ) : (
          <div className="relative">
            {activeTab === "home" && (
              <HomeView
                modelStatus={modelStatus}
                onTrainDefault={handleTrainDefault}
                onTrainCustom={handleTrainCustom}
                isTraining={isTraining}
                trainingError={trainingError}
                onResetModel={handleResetModel}
              />
            )}

            {activeTab === "detect" && (
              <DetectView 
                onClassify={handleClassifyEmail} 
                isAnalyzing={isAnalyzing} 
              />
            )}

            {activeTab === "dashboard" && (
              <DashboardView
                modelStatus={modelStatus}
                onResetModel={handleResetModel}
              />
            )}
          </div>
        )}
      </main>

      {/* Humble Footer */}
      <footer className="border-t border-white/5 bg-zinc-950/20 py-6 text-center z-10">
        <div className="max-w-7xl mx-auto px-4 text-zinc-600 text-[10px] font-mono tracking-wider">
          PHISHDEFENDER ML ANALYZER CLIENT • DATA ENCRYPTED SECURE TRANSVERSE
        </div>
      </footer>
    </div>
  );
}
