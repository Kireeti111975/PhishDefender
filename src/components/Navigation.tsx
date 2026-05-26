import React from "react";
import { ShieldCheck, Database, Sliders, Activity, Terminal } from "lucide-react";
import { ModelStatus } from "../types";

interface NavigationProps {
  activeTab: "home" | "detect" | "dashboard";
  setActiveTab: (tab: "home" | "detect" | "dashboard") => void;
  modelStatus: ModelStatus | null;
}

export default function Navigation({ activeTab, setActiveTab, modelStatus }: NavigationProps) {
  const isTrained = modelStatus?.trained;

  return (
    <header className="border-b border-white/10 bg-[#0c0d12]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className="relative flex items-center justify-center">
              <div className="w-3.5 h-3.5 bg-cyan-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)] mr-1" />
              <div className="absolute w-3.5 h-3.5 bg-cyan-400 rounded-full animate-ping opacity-30" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base tracking-tight text-white uppercase">
                PHISH<span className="text-cyan-500 underline decoration-2 underline-offset-4">DEFENDER</span>
              </h1>
              <p className="text-[9px] font-mono text-zinc-500 mt-0.5 uppercase tracking-widest leading-none">
                Threat Detection Suite
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-2" aria-label="Tabs">
            {[
              { id: "home", name: "Overview & Upload", icon: Database },
              { id: "detect", name: "Email Analysis", icon: ShieldCheck },
              { id: "dashboard", name: "Model Performance", icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded text-xs font-mono transition-all duration-150 cursor-pointer border
                    ${isActive
                      ? "bg-white/5 border-white/10 text-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.02)]"
                      : "text-zinc-500 hover:text-white hover:bg-white/5 border-transparent"
                    }
                  `}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-cyan-400" : "text-zinc-600"}`} />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Core System Status */}
          <div className="flex items-center space-x-3 font-mono text-xs">
            <div className={`hidden md:flex items-center space-x-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded`}>
              <span className={`w-2 h-2 rounded-full ${isTrained ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
              <span className="text-zinc-400 text-[10px] uppercase font-semibold">
                MODEL: {isTrained ? `${modelStatus.algorithm === 'naive_bayes' ? 'Naive Bayes' : 'Logistic Reg.'} (${modelStatus.vectorizerType?.toUpperCase()})` : 'UNINITIALIZED'}
              </span>
            </div>
            
            <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-zinc-900/55 border border-zinc-800 rounded text-[10px] text-zinc-400 font-semibold uppercase">
              <Terminal className="h-3.5 w-3.5 text-cyan-500" />
              <span>SYS ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
