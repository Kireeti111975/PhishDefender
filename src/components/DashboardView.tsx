import React, { useState } from "react";
import { Activity, ShieldAlert, BarChart2, Award, Zap, AlertCircle, HelpCircle, Search } from "lucide-react";
import { ModelStatus } from "../types";

interface DashboardViewProps {
  modelStatus: ModelStatus | null;
  onResetModel: () => Promise<void>;
}

export default function DashboardView({ modelStatus, onResetModel }: DashboardViewProps) {
  const [featureSearch, setFeatureSearch] = useState("");
  const [featureClassFilter, setFeatureClassFilter] = useState<"all" | "phishing" | "safe">("all");

  if (!modelStatus || !modelStatus.trained || !modelStatus.metrics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-fade-in">
        <div className="max-w-md mx-auto bg-zinc-900/50 border border-white/5 rounded p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-5">
            <Activity className="h-7 w-7 text-amber-400 animate-pulse" />
          </div>
          <h3 className="font-mono font-bold text-sm text-zinc-200 uppercase tracking-widest">
            Performance Diagnostics Offline
          </h3>
          <p className="text-[11px] text-zinc-400 leading-relaxed mt-2 mb-6">
            There are current no active metrics because the classification model has not yet been trained. 
            Please select the Overview tab and bootstrap/upload a training CSV file first!
          </p>
        </div>
      </div>
    );
  }

  const metrics = modelStatus.metrics;
  const cm = metrics.confusionMatrix;
  const wordImportances = metrics.wordImportances || [];

  // Filter word importances based on selection
  const filteredWords = wordImportances
    .filter(item => {
      const matchesSearch = item.word.toLowerCase().includes(featureSearch.toLowerCase());
      const matchesClass = 
        featureClassFilter === "all" || 
        item.classCorrelation === featureClassFilter;
      return matchesSearch && matchesClass;
    });

  // Calculations for Confusion Matrix
  const totalTestCases = cm.tp + cm.fp + cm.tn + cm.fn;
  const tpPercent = totalTestCases > 0 ? (cm.tp / totalTestCases) * 100 : 0;
  const fpPercent = totalTestCases > 0 ? (cm.fp / totalTestCases) * 100 : 0;
  const tnPercent = totalTestCases > 0 ? (cm.tn / totalTestCases) * 100 : 0;
  const fnPercent = totalTestCases > 0 ? (cm.fn / totalTestCases) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Visual Header */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-mono font-bold text-2xl text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            <span>Model Performance Dashboard</span>
          </h2>
          <p className="text-zinc-400 text-xs mt-1">
            Historical diagnostic counters computed against the isolated 20% validation test data during the latest training cycle.
          </p>
        </div>
        <div className="font-mono text-[10px] font-bold text-cyan-400 bg-[#0a0b0e] border border-white/5 rounded px-3 py-1.5 self-start md:self-auto uppercase tracking-wider">
          KERNEL: <span className="text-white">{modelStatus.algorithm === "naive_bayes" ? "Naive Bayes" : "Logistic Regression"}</span>
        </div>
      </div>

      {/* Grid: 4 Core Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Accuracy Card */}
        <div className="bg-zinc-900/50 border border-white/5 rounded p-4 shadow-xl relative overflow-hidden">
          <div className="absolute right-3 top-3 text-zinc-700">
            <Award className="h-4 w-4" />
          </div>
          <span className="block text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
            Overall Model Accuracy
          </span>
          <span className="text-2xl font-mono font-bold text-white mt-1 block">
            {(metrics.accuracy * 100).toFixed(1)}%
          </span>
          <p className="text-[10px] text-cyan-400 mt-2 font-mono flex items-center space-x-1">
            <span>✓ CORRECT SEVERITY RATIO</span>
          </p>
        </div>

        {/* Precision Card */}
        <div className="bg-zinc-900/50 border border-white/5 rounded p-4 shadow-xl relative overflow-hidden">
          <div className="absolute right-3 top-3 text-zinc-700">
            <BarChart2 className="h-4 w-4" />
          </div>
          <span className="block text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
            Precision Score
          </span>
          <span className="text-2xl font-mono font-bold text-white mt-1 block">
            {(metrics.precision * 100).toFixed(1)}%
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">
            Ratio of true threats to alerts
          </p>
        </div>

        {/* Recall Card */}
        <div className="bg-zinc-900/50 border border-white/5 rounded p-4 shadow-xl relative overflow-hidden">
          <div className="absolute right-3 top-3 text-zinc-700">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <span className="block text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
            Recall (Sensitivity)
          </span>
          <span className="text-2xl font-mono font-bold text-white mt-1 block">
            {(metrics.recall * 100).toFixed(1)}%
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">
            Ratios of caught threat vectors
          </p>
        </div>

        {/* F1-Score Card */}
        <div className="bg-zinc-900/50 border border-white/5 rounded p-4 shadow-xl relative overflow-hidden">
          <div className="absolute right-3 top-3 text-zinc-700">
            <Zap className="h-4 w-4" />
          </div>
          <span className="block text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
            Harmonic F1-Score
          </span>
          <span className="text-2xl font-mono font-bold text-white mt-1 block">
            {(metrics.f1 * 100).toFixed(1)}%
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">
            Unified precision/recall index
          </p>
        </div>

      </div>

      {/* Grid: Confusion Matrix & Comparative SVG Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 overflow-hidden">
        
        {/* Confusion Matrix Heatmap Panel */}
        <div className="col-span-1 lg:col-span-6 bg-zinc-900/50 border border-white/5 rounded p-6 shadow-xl relative overflow-hidden">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#e0e0e0] border-b border-white/5 pb-3 mb-4 flex items-center justify-between">
            <span>Responsive Confusion Matrix Grid</span>
            <span className="font-mono text-[9px] text-[#06b6d4] uppercase tracking-wider">
              {totalTestCases} Validation Samples
            </span>
          </h3>

          <div className="grid grid-cols-2 gap-4 mt-4">
            
            {/* True Negative Box (Safe identified as Safe) */}
            <div className="p-4 bg-cyan-950/10 border border-cyan-500/20 rounded hover:bg-cyan-950/20 transition-all flex flex-col justify-between h-28 relative overflow-hidden">
              <div className="absolute -right-3 -top-3 text-[55px] font-mono opacity-[0.03] select-none text-cyan-400 font-bold">TN</div>
              <div>
                <span className="block text-[9px] font-mono uppercase text-zinc-500 tracking-wider font-semibold">
                  True Negatives (TN)
                </span>
                <span className="text-2xl font-mono font-bold text-cyan-400 mt-1 block">
                  {cm.tn}
                </span>
              </div>
              <span className="text-[10px] text-cyan-400/80 leading-normal font-mono">
                Safe identified correctly ({tnPercent.toFixed(1)}%)
              </span>
            </div>

            {/* False Positive Box (Safe identified as Phishing) */}
            <div className="p-4 bg-amber-950/10 border border-amber-500/20 rounded hover:bg-amber-950/20 transition-all flex flex-col justify-between h-28 relative overflow-hidden">
              <div className="absolute -right-3 -top-3 text-[55px] font-mono opacity-[0.03] select-none text-amber-500 font-bold">FP</div>
              <div>
                <span className="block text-[9px] font-mono uppercase text-zinc-500 tracking-wider font-semibold">
                  False Positives (FP)
                </span>
                <span className="text-2xl font-mono font-bold text-amber-400 mt-1 block">
                  {cm.fp}
                </span>
              </div>
              <span className="text-[10px] text-amber-500/80 leading-normal font-mono">
                Unjustified alarm indices ({fpPercent.toFixed(1)}%)
              </span>
            </div>

            {/* False Negative Box (Phishing identified as Safe) */}
            <div className="p-4 bg-rose-950/10 border border-rose-500/20 rounded hover:bg-rose-950/20 transition-all flex flex-col justify-between h-28 relative overflow-hidden">
              <div className="absolute -right-3 -top-3 text-[55px] font-mono opacity-[0.03] select-none text-rose-500 font-bold">FN</div>
              <div>
                <span className="block text-[9px] font-mono uppercase text-[#f43f5e]/80 tracking-wider font-semibold">
                  False Negatives (FN)
                </span>
                <span className="text-2xl font-mono font-bold text-rose-450 mt-1 block">
                  {cm.fn}
                </span>
              </div>
              <span className="text-[10px] text-rose-450/80 leading-normal font-mono">
                Hazard leaked through ({fnPercent.toFixed(1)}%)
              </span>
            </div>

            {/* True Positive Box (Phishing identified as Phishing) */}
            <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded hover:bg-rose-950/30 transition-all flex flex-col justify-between h-28 relative overflow-hidden">
              <div className="absolute -right-3 -top-3 text-[55px] font-mono opacity-[0.03] select-none text-rose-500 font-bold">TP</div>
              <div>
                <span className="block text-[9px] font-mono uppercase text-zinc-500 tracking-wider font-semibold">
                  True Positives (TP)
                </span>
                <span className="text-2xl font-mono font-bold text-rose-400 mt-1 block">
                  {cm.tp}
                </span>
              </div>
              <span className="text-[10px] text-rose-400/80 leading-normal font-mono">
                Threat correctly isolated ({tpPercent.toFixed(1)}%)
              </span>
            </div>

          </div>

          <div className="mt-4 flex items-start space-x-2.5 p-3 bg-zinc-950/40 border border-white/5 rounded">
            <AlertCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#9f9f9f] leading-normal font-mono">
              <strong>Matrix Diagnosis:</strong> Accuracy value is derived directly on server validation iterations utilizing a standalone validation cache. These statistics prove correct core mathematical deployment.
            </p>
          </div>
        </div>

        {/* Visual Charts: Custom SVG Bar graphs */}
        <div className="col-span-1 lg:col-span-6 bg-zinc-900/50 border border-white/5 rounded p-6 shadow-xl relative overflow-hidden">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#e0e0e0] border-b border-white/5 pb-3 mb-4 flex items-center space-x-1.5">
            <BarChart2 className="h-4 w-4 text-cyan-500" />
            <span>Interactive Metrics Visualizer</span>
          </h3>

          <div className="space-y-4 mt-6">
            
            {/* SVG Visual Bar 1: Accuracy */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-zinc-300">Model Accuracy (Overall Correct)</span>
                <span className="text-cyan-400 font-bold">{(metrics.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-[#0a0b0e] rounded overflow-hidden relative border border-white/5">
                <div 
                  className="h-full bg-cyan-500 rounded transition-all duration-500"
                  style={{ width: `${metrics.accuracy * 100}%` }}
                />
              </div>
            </div>

            {/* SVG Visual Bar 2: Precision */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-zinc-300">Precision (Integrity Coefficient)</span>
                <span className="text-cyan-400 font-bold">{(metrics.precision * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-[#0a0b0e] rounded overflow-hidden relative border border-white/5">
                <div 
                  className="h-full bg-cyan-600 rounded transition-all duration-500"
                  style={{ width: `${metrics.precision * 100}%` }}
                />
              </div>
            </div>

            {/* SVG Visual Bar 3: Recall */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-zinc-300">Recall / Sensitivity (Threat Coverage)</span>
                <span className="text-cyan-400 font-bold">{(metrics.recall * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-[#0a0b0e] rounded overflow-hidden relative border border-white/5">
                <div 
                  className="h-full bg-[#0891b2] rounded transition-all duration-500"
                  style={{ width: `${metrics.recall * 100}%` }}
                />
              </div>
            </div>

            {/* SVG Visual Bar 4: F1 Score */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-zinc-300">Balanced Harmonic Performance F1</span>
                <span className="text-cyan-400 font-bold">{(metrics.f1 * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-[#0a0b0e] rounded overflow-hidden relative border border-white/5">
                <div 
                  className="h-full bg-cyan-700 rounded transition-all duration-500"
                  style={{ width: `${metrics.f1 * 100}%` }}
                />
              </div>
            </div>

          </div>

          <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center font-mono">
            <span className="text-[10px] text-zinc-500">
              VAL DATASET COEFFICIENTS: {metrics.totalTrained} FILES
            </span>
            <button
              onClick={onResetModel}
              className="text-[11px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
            >
              Destruct Model Coefficients
            </button>
          </div>
        </div>

      </div>

      {/* Linguistic Predictor Words Section */}
      <div className="bg-zinc-900/50 border border-white/5 rounded p-6 shadow-xl relative overflow-hidden">
        <div className="border-b border-white/5 pb-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-200 flex items-center space-x-1.5">
              <Search className="h-4 w-4 text-cyan-400" />
              <span>Diagnostic Token Weights List</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Shows how the model correlates individual vocabulary terms mathematically (Naive Bayes probability indices or Logistic Regression weights).
            </p>
          </div>

          {/* Filtering control buttons */}
          <div className="flex items-center space-x-2 self-start md:self-auto">
            <input
              type="text"
              placeholder="Search words..."
              value={featureSearch}
              onChange={(e) => setFeatureSearch(e.target.value)}
              className="px-2.5 py-1 text-xs bg-[#0a0b0e] border border-white/10 rounded text-zinc-100 placeholder-zinc-700 font-mono focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
            />
            
            <select
              value={featureClassFilter}
              onChange={(e: any) => setFeatureClassFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-[#0a0b0e] border border-white/10 rounded text-zinc-300 font-mono focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Words</option>
              <option value="phishing">Phishing Indicators</option>
              <option value="safe">Legitimate Indicators</option>
            </select>
          </div>
        </div>

        {filteredWords.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-500 font-mono">
            No terms found matching your query filter conditions.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.slice(0, 30).map((item, idx) => (
              <div 
                key={idx} 
                className="p-3 bg-zinc-950/20 border border-white/5 rounded flex items-center justify-between"
              >
                <div className="flex items-center space-x-2 text-xs">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    item.classCorrelation === "phishing" ? "bg-rose-500" : "bg-cyan-500"
                  }`} />
                  <span className="font-mono text-zinc-200 font-bold">"{item.word}"</span>
                </div>
                
                <div className="text-right flex items-center space-x-1.5 font-mono">
                  <span className={`text-[9px] font-bold tracking-wider ${
                    item.classCorrelation === "phishing" ? "text-rose-450" : "text-cyan-450"
                  }`}>
                    {item.classCorrelation === "phishing" ? "PHISH" : "SAFE"}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 bg-[#0a0b0e] px-1.5 py-0.5 rounded border border-white/5">
                    {item.impact.toFixed(3)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
