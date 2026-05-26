import React, { useState, useRef } from "react";
import { Upload, AlertCircle, Sparkles, CheckCircle2, RefreshCw, FileText, Settings, ShieldAlert, ArrowRight, Table } from "lucide-react";
import { ModelAlgorithm, VectorizerType, ModelStatus } from "../types";

interface HomeViewProps {
  modelStatus: ModelStatus | null;
  onTrainDefault: (algo: ModelAlgorithm, vec: VectorizerType) => Promise<void>;
  onTrainCustom: (algo: ModelAlgorithm, vec: VectorizerType, dataset: { text: string; label: string }[]) => Promise<void>;
  isTraining: boolean;
  trainingError: string | null;
  onResetModel: () => Promise<void>;
}

export default function HomeView({
  modelStatus,
  onTrainDefault,
  onTrainCustom,
  isTraining,
  trainingError,
  onResetModel,
}: HomeViewProps) {
  // Config States
  const [algorithm, setAlgorithm] = useState<ModelAlgorithm>("naive_bayes");
  const [vectorizerType, setVectorizerType] = useState<VectorizerType>("tfidf");

  // Custom Upload States
  const [parsedData, setParsedData] = useState<{ text: string; label: string }[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean CSV Parser Supporting Quote Escapes and simple comma delimiters
  const parseCSVContent = (content: string) => {
    try {
      setParseError(null);
      setUploadProgress("Analyzing data file...");

      // Split into lines, handle CRLF
      const lines = content.split(/\r?\n/);
      if (lines.length < 2) {
        throw new Error("CSV file must contain a header row and at least 1 data row.");
      }

      // Read first line (header)
      // Standard headers: label, text or content
      const firstLine = lines[0];
      const headers = firstLine.split(",").map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
      
      const textIndex = headers.findIndex(h => h === "text" || h === "content" || h === "email" || h === "body");
      const labelIndex = headers.findIndex(h => h === "label" || h === "phishing" || h === "class" || h === "status");

      if (textIndex === -1 || labelIndex === -1) {
        throw new Error(
          `Could not map columns. CSV headers must contain indicator words for both body and classification (e.g. 'text' and 'label'). Headers found: [${headers.join(", ")}]`
        );
      }

      const results: { text: string; label: string }[] = [];

      // Loop over rows starting from 1 (skipping header)
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].trim();
        if (!row) continue;

        // Custom parser to handle commas within double quotes correctly
        const cells: string[] = [];
        let curCell = "";
        let insideQuotes = false;

        for (let charIndex = 0; charIndex < row.length; charIndex++) {
          const char = row[charIndex];
          if (char === '"' || char === "'") {
            insideQuotes = !insideQuotes;
          } else if (char === "," && !insideQuotes) {
            cells.push(curCell.trim().replace(/^["']|["']$/g, ""));
            curCell = "";
          } else {
            curCell += char;
          }
        }
        cells.push(curCell.trim().replace(/^["']|["']$/g, ""));

        if (cells.length > Math.max(textIndex, labelIndex)) {
          const textValue = cells[textIndex];
          const labelValue = cells[labelIndex];
          if (textValue && labelValue) {
            results.push({
              text: textValue,
              label: labelValue
            });
          }
        }
      }

      if (results.length === 0) {
        throw new Error("No valid data rows successfully parsed from the uploaded CSV.");
      }

      setParsedData(results);
      setUploadProgress(null);
    } catch (err: any) {
      setParseError(err.message || "Failed to process CSV file.");
      setParsedData(null);
      setUploadProgress(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseCSVContent(text);
      };
      reader.readAsText(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseCSVContent(text);
      };
      reader.readAsText(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const trainWithCustom = () => {
    if (parsedData && parsedData.length > 0) {
      onTrainCustom(algorithm, vectorizerType, parsedData);
    }
  };

  const clearUploadedFile = () => {
    setParsedData(null);
    setParseError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Visual Header / Banner */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-zinc-900/30 px-6 py-10 md:p-14 mb-8 shadow-2xl">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none hidden lg:block">
          <svg width="400" height="300" viewBox="0 0 100 100" fill="none" stroke="#06b6d4" strokeWidth="0.5">
            <path d="M10,10 L90,10 L90,90 L10,90 Z" />
            <path d="M10,30 L90,30 M10,50 L90,50 M10,70 L90,70" />
            <path d="M30,10 L30,90 M50,10 L50,90 M70,10 L70,90" />
          </svg>
        </div>

        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-[10px] text-cyan-400 font-mono mb-4 tracking-widest uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>NATURAL LANGUAGE TEXT PROCESSING SERVICE</span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
            Analyze Natural Emails, <br/>
            Identify <span className="text-cyan-500 underline decoration-2 underline-offset-4">Phishing Threats</span>.
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
            Protect networks and personal identities with specialized text analysis. Upload email datasets 
            or configure our fast, server-side Machine Learning engine to isolate urgent patterns, 
            suspicious spoof domains, and financial aggregions instantly.
          </p>
        </div>
      </div>

      {/* Main Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Hyperparameters Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-5 shadow-xl">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#e0e0e0] border-b border-white/5 pb-3 mb-4 flex items-center space-x-2">
              <Settings className="h-4 w-4 text-cyan-500" />
              <span>Model Hyperparameters</span>
            </h3>

            {/* Algorithm Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">
                  CLASSIFICATION ALGORITHM
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <label className={`relative flex flex-col p-3 rounded border cursor-pointer select-none transition-all ${
                    algorithm === "naive_bayes" 
                      ? "border-cyan-500/30 bg-cyan-500/5 text-slate-100" 
                      : "border-white/5 bg-zinc-900/40 text-zinc-400 hover:border-white/10"
                  }`}>
                    <input
                      type="radio"
                      name="algo"
                      value="naive_bayes"
                      checked={algorithm === "naive_bayes"}
                      onChange={() => setAlgorithm("naive_bayes")}
                      className="sr-only"
                    />
                    <span className="text-xs font-semibold text-slate-100 flex items-center justify-between">
                      <span>Naive Bayes</span>
                      {algorithm === "naive_bayes" && <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />}
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-1 leading-normal">
                      Excellent for text classifications based on conditional word probabilities. Fast and stable.
                    </span>
                  </label>

                  <label className={`relative flex flex-col p-3 rounded border cursor-pointer select-none transition-all ${
                    algorithm === "logistic_regression" 
                      ? "border-cyan-500/30 bg-cyan-500/5 text-slate-100" 
                      : "border-white/5 bg-zinc-900/40 text-zinc-400 hover:border-white/10"
                  }`}>
                    <input
                      type="radio"
                      name="algo"
                      value="logistic_regression"
                      checked={algorithm === "logistic_regression"}
                      onChange={() => setAlgorithm("logistic_regression")}
                      className="sr-only"
                    />
                    <span className="text-xs font-semibold text-slate-100 flex items-center justify-between">
                      <span>Logistic Regression</span>
                      {algorithm === "logistic_regression" && <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />}
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-1 leading-normal">
                      Gradually optimizes token weights via gradient descent to learn dynamic threat boundaries.
                    </span>
                  </label>
                </div>
              </div>

              {/* Vectorization Scheme Selection */}
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">
                  TEXT VECTORIZATION FEATURING
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setVectorizerType("tfidf")}
                    style={{ contentVisibility: "auto" }}
                    className={`px-3 py-2 text-xs font-mono rounded border transition-all cursor-pointer ${
                      vectorizerType === "tfidf"
                        ? "bg-white/5 text-cyan-400 border-cyan-500/30 font-medium"
                        : "bg-zinc-900/40 text-zinc-400 border-white/5 hover:border-white/10"
                    }`}
                  >
                    TF-IDF Vectorizer
                  </button>
                  <button
                    onClick={() => setVectorizerType("count")}
                    className={`px-3 py-2 text-xs font-mono rounded border transition-all cursor-pointer ${
                      vectorizerType === "count"
                        ? "bg-white/5 text-cyan-400 border-cyan-500/30 font-medium"
                        : "bg-zinc-900/40 text-zinc-400 border-white/5 hover:border-white/10"
                    }`}
                  >
                    Count Vectorizer
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1.5 leading-normal">
                  {vectorizerType === "tfidf" 
                    ? "Weight scales by Inverse Document Frequency to ignore redundant words." 
                    : "Counts the standard frequency of occurrences for vocabulary tokens directly."}
                </p>
              </div>
            </div>
          </div>

          {/* Quick-setup Sample Action */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-5 shadow-xl relative overflow-hidden">
            <h4 className="font-mono font-bold text-zinc-200 text-xs mb-2 flex items-center space-x-1.5 uppercase">
              <CheckCircle2 className="h-4 w-4 text-cyan-500" />
              <span>Instant Sample Training</span>
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
              Don't have a dataset file? Click below to instantly train and deploy the selected model 
              with our structured cybersecurity set of standard emails.
            </p>
            <button
              onClick={() => onTrainDefault(algorithm, vectorizerType)}
              disabled={isTraining}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-900 text-white disabled:text-zinc-500 text-xs font-bold font-mono tracking-widest uppercase cursor-pointer rounded transition-all duration-150 shadow-[0_0_15px_rgba(8,145,178,0.3)] disabled:shadow-none"
            >
              {isTraining ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>TRAINING KERNEL...</span>
                </>
              ) : (
                <>
                  <span>BOOTSTRAP PRESET MODULE</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Custom Data Upload & Console Logs */}
        <div className="lg:col-span-8 space-y-6">

          {/* Main Drag & Drop Zone */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-6 shadow-xl">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-200 border-b border-white/5 pb-3 mb-4 flex items-center space-x-2">
              <Upload className="h-4 w-4 text-cyan-500" />
              <span>Training Dataset CSV Upload</span>
            </h3>

             {!parsedData ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`border border-dashed rounded p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
                  dragActive 
                    ? "border-cyan-500 bg-cyan-500/5" 
                    : "border-white/10 bg-zinc-900/20 hover:border-white/20 hover:bg-zinc-900/35"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv"
                  className="hidden"
                />
                
                <div className="w-12 h-12 rounded-full bg-[#0a0b0e] flex items-center justify-center border border-white/5 mb-4 text-zinc-400">
                  <FileText className="h-6 w-6 text-zinc-300" />
                </div>

                <h4 className="font-semibold text-zinc-200 text-sm mb-1">
                  Drag and drop your dataset CSV file here
                </h4>
                <p className="text-xs text-zinc-500 mb-4">
                  Or click on this zone to browse from local computer
                </p>

                <div className="text-[10px] text-zinc-500 space-y-1 max-w-md bg-zinc-950/40 p-2.5 rounded border border-white/5 font-mono">
                  <p className="text-zinc-400 text-left font-bold">CSV Structure Requirements:</p>
                  <p className="text-left">• Headers: "text" (for email content) and "label" (safe/phishing)</p>
                  <p className="text-left">• Format: comma-separated text files (.csv)</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Upload details */}
                <div className="flex items-center justify-between p-3.5 bg-zinc-900/50 border border-white/5 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <Table className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">Custom Dataset Loaded</p>
                      <p className="text-[11px] font-mono text-zinc-500">
                        Total Parsed: <span className="text-cyan-400">{parsedData.length} records</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearUploadedFile}
                    className="text-xs text-rose-400 hover:text-rose-300 font-mono underline"
                  >
                    Clear File
                  </button>
                </div>

                {/* Previews Table of 4 elements */}
                <div className="border border-white/5 rounded overflow-hidden bg-zinc-950/20">
                  <div className="px-3 py-2 bg-zinc-800/10 border-b border-white/5 flex items-center text-[10px] font-semibold text-zinc-400 uppercase tracking-widest font-mono">
                    <Table className="h-3.5 w-3.5 text-cyan-500 mr-1.5" />
                    Parsed CSV Data Preview (Truncated)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-350 font-mono">
                      <thead className="bg-zinc-900/80 text-zinc-400 border-b border-white/5">
                        <tr>
                          <th className="px-3 py-2 w-16">Label</th>
                          <th className="px-3 py-2">Email Content Preview</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {parsedData.slice(0, 4).map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="px-3 py-2.5 font-bold">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] ${
                                String(row.label).toLowerCase() === "phishing" 
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/25" 
                                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25"
                              }`}>
                                {row.label}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 truncate max-w-md text-[11px] text-zinc-400">
                              {row.text}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Submit button for custom training */}
                <button
                  onClick={trainWithCustom}
                  disabled={isTraining || parsedData.length < 4}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-900 text-white disabled:text-zinc-500 text-xs font-bold font-mono tracking-widest uppercase cursor-pointer rounded transition-all duration-150 shadow-[0_0_15px_rgba(8,145,178,0.3)] disabled:shadow-none"
                >
                  {isTraining ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>TRAINING ML ENGINE... NEW PARAMS LEARNING...</span>
                    </>
                  ) : (
                    <>
                      <span>TRAIN CLASSIFIER WITH CUSTOM DATASET</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error Indicators */}
            {parseError && (
              <div className="mt-4 flex items-start space-x-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span><strong>Parse Error:</strong> {parseError}</span>
              </div>
            )}

            {trainingError && (
              <div className="mt-4 flex items-start space-x-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span><strong>Training Failure:</strong> {trainingError}</span>
              </div>
            )}

            {uploadProgress && (
              <div className="mt-4 flex items-center space-x-2.5 p-3.5 bg-[#0a0b0e] border border-white/5 rounded text-cyan-400 text-xs font-mono">
                <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
                <span>{uploadProgress}</span>
              </div>
            )}
          </div>

          {/* Model Status Console Alert */}
          {modelStatus?.trained ? (
            <div className="bg-zinc-900/50 border border-cyan-500/30 rounded p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-mono font-bold text-zinc-100 text-xs uppercase tracking-wider">
                    Model Deployed and Active
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Successfully trained a <span className="text-cyan-400 font-mono font-semibold">{modelStatus.algorithm === 'naive_bayes' ? 'Naive Bayes' : 'Logistic Regression'}</span> model and preprocessed using a <span className="text-cyan-400 font-mono font-semibold">{modelStatus.vectorizerType?.toUpperCase()}</span> vectorizer. Model is ready to ingest email contents!
                  </p>
                </div>
              </div>
              <button
                onClick={onResetModel}
                className="px-3 py-1.5 bg-zinc-950 border border-white/5 hover:border-rose-500/40 text-zinc-400 hover:text-rose-400 text-xs font-mono rounded cursor-pointer transition-all uppercase shrink-0"
              >
                Reset Engine
              </button>
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-white/5 border-l-4 border-l-amber-500 rounded p-5 shadow-xl flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-mono font-bold text-amber-400 text-xs uppercase tracking-wider">
                  Active Model Status: Uninitialized
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  No trained machine learning model was detected on disk. Email classification will currently 
                  operate on a safe, deterministic **Heuristic Rule Engine** identifying static high-severity terms. 
                  Please load a preset sample or upload a custom CSV dataset to train the model coefficients!
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
