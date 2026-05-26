import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, ShieldAlert, Sparkles, Terminal, ArrowRight, HelpCircle, FileText, CheckCircle2 } from "lucide-react";
import { ClassificationResult } from "../types";

interface DetectViewProps {
  onClassify: (text: string) => Promise<ClassificationResult | null>;
  isAnalyzing: boolean;
}

const TEMPLATE_EMAILS = [
  {
    title: "⚠️ PayPal Scam (Phishing)",
    label: "Phishing",
    text: `Subject: URGENT: Verify your PayPal account immediately!

Dear PayPal Customer,
We detected a suspicious login attempt to your account from an unrecognized IP address. To secure your account and recover login access, you must click the link below and login to verify your credentials.

http://paypal-secure-portal.com/login/update/verify-account.html

If you do not verify your identity within 24 hours, your debit card and account balances will be permanently suspended.`
  },
  {
    title: "⚠️ Unrecognized IP (Phishing)",
    label: "Phishing",
    text: `Subject: Security Alert: Unauthorized login attempt detected

Your Chase bank account has been locked due to multiple failed login attempts. To unlock your account, click here to access the secure portal and update your passcode:

http://192.168.102.11/chase/portal-login.html

Please have your card details and account number ready. Action is required immediately to prevent wire fraud.`
  },
  {
    title: "✅ Work Update (Safe)",
    label: "Safe",
    text: `Subject: Weekly Project Status Updates

Hi team,
We had a highly productive week. Here are the key highlights:
1. Sarah completed the frontend layout designs for the user dashboard.
2. The server-side API endpoints are now connected.
3. We have integrated Jest for unit testing.

Our next standup is scheduled for Wednesday at 10 AM on Google Meet. Let's make sure everyone updates their Jira tasks.

Best regards,
John (Project Manager)`
  },
  {
    title: "✅ Dinner Invite (Safe)",
    label: "Safe",
    text: `Hey David,
Just checking if you're free to catch up for lunch tomorrow around noon? There's a new Italian pizzeria that opened up down the street near the park, and I wanted to check it out.

Let me know if that works or if we should plan for Thursday instead!

Talk soon,
Alex`
  }
];

export default function DetectView({ onClassify, isAnalyzing }: DetectViewProps) {
  const [emailText, setEmailText] = useState("");
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!emailText.trim()) {
      setError("Please paste or type email content before requesting evaluation.");
      return;
    }
    setError(null);
    try {
      const res = await onClassify(emailText);
      if (res) {
        setResult(res);
      } else {
        setError("Analysis failed. Please verify that the system server is operational.");
      }
    } catch (err: any) {
      setError(err.message || "An exception occurred during email evaluation.");
    }
  };

  const loadTemplate = (text: string) => {
    setEmailText(text);
    setResult(null);
    setError(null);
  };

  const clearInput = () => {
    setEmailText("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Title Header */}
      <div className="mb-8">
        <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
          <Terminal className="h-5 w-5 text-cyan-400" />
          <span>Email Threat Inspection Sandbox</span>
        </h2>
        <p className="text-zinc-400 text-xs mt-1">
          Paste any electronic mail header and body into the sandbox below to evaluate the spam, credentials, and structural hazard factors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Hand: Email input and Template triggers */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-5 shadow-xl relative animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                EMAIL_INGESTION_MODULE
              </span>
              <button
                onClick={clearInput}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 font-mono underline cursor-pointer"
              >
                Clear Sandbox
              </button>
            </div>

            {/* Quick Test templates */}
            <div className="mb-4">
              <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                QUICK-INSERT DEMO SCENARIOS
              </span>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATE_EMAILS.map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => loadTemplate(tpl.text)}
                    className="p-2 text-left bg-[#0a0b0e] border border-white/5 hover:border-cyan-500/30 rounded text-[10px] font-mono text-zinc-300 transition-all truncate hover:bg-white/5 cursor-pointer"
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Textarea */}
            <div className="relative">
              <textarea
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder="Paste raw email header, subject lines, links, and text here..."
                rows={11}
                className="w-full bg-[#0a0b0e] border border-white/10 text-zinc-100 text-xs p-4 rounded focus:outline-hidden focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 placeholder-zinc-700 font-mono leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-[9px] text-zinc-600 font-mono">
                Length: {emailText.length} bytes
              </div>
            </div>

            {emailText.trim() && (
              <div className="mt-2.5 flex items-center justify-between p-2.5 bg-zinc-900/40 border border-white/5 rounded text-[10px] text-zinc-500 font-mono">
                <span>SYSTEM HEURISTICS READY</span>
                <span className="text-cyan-400 font-bold">✓ TOKENS IDENTIFIED</span>
              </div>
            )}

            {/* Analyze Button */}
            <div className="mt-5">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !emailText.trim()}
                className="w-full flex items-center justify-center space-x-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-900 text-white disabled:text-zinc-600 text-xs font-bold tracking-widest uppercase rounded shadow-[0_0_15px_rgba(8,145,178,0.3)] disabled:shadow-none cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>EXTRACTING PATTERNS & EVALUATING...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4.5 w-4.5 text-white" />
                    <span>RUN SECURITY ANALYSIS</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-start space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded text-xs leading-normal">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Hand: Interactive analysis outcome */}
        <div className="col-span-1 lg:col-span-5 space-y-6">
          {result ? (
            <div className="space-y-6">
              
              {/* Core Verdict Badge */}
              <div className={`p-5 rounded-xl border shadow-xl relative overflow-hidden ${
                result.prediction === "Phishing"
                  ? "bg-rose-500/5 border-rose-500/20 text-rose-100"
                  : "bg-emerald-500/5 border-emerald-500/20 text-emerald-100"
              }`}>
                {/* Visual Backdrop glowing circle */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-10 ${
                  result.prediction === "Phishing" ? "bg-rose-500" : "bg-emerald-500"
                }`} />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {result.prediction === "Phishing" ? (
                      <ShieldAlert className="h-5 w-5 text-rose-400 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                    )}
                    <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-zinc-500">
                      SECURE PROCESS RESULT
                    </span>
                  </div>
                  
                  {/* Classification engine info */}
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-[#0a0b0e] border border-white/5 rounded text-cyan-400 uppercase tracking-wider">
                    {result.classificationSource}
                  </span>
                </div>

                {/* Status Callout and Verdict */}
                <div className="flex items-baseline space-x-3 mb-1">
                  <span className={`text-2xl font-mono font-bold uppercase tracking-tight ${
                    result.prediction === "Phishing" ? "text-rose-500" : "text-emerald-500"
                  }`}>
                    {result.prediction === "Phishing" ? "Phishing Email" : "Safe Email"}
                  </span>
                </div>

                {/* Risk Level and Confidence Scores */}
                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
                      CONFIDENCE LEVEL
                    </span>
                    <span className="text-base font-mono font-bold text-zinc-200">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                    <div className="w-full bg-[#0a0b0e] h-1.5 rounded mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded ${result.prediction === "Phishing" ? "bg-rose-500" : "bg-cyan-500"}`}
                        style={{ width: `${result.confidence * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
                      THREAT RISK BADGE
                    </span>
                    <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-semibold mt-1 ${
                      result.riskLevel === "Danger/High" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                      result.riskLevel === "Warning/Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      result.riskLevel === "Caution/Low" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        result.riskLevel === "Danger/High" ? "bg-rose-400" :
                        result.riskLevel === "Warning/Medium" ? "bg-amber-400" :
                        result.riskLevel === "Caution/Low" ? "bg-cyan-400" :
                        "bg-emerald-400"
                      }`} />
                      <span>{result.riskLevel}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical/Structural Indicators lists */}
              <div className="bg-zinc-900/50 border border-white/5 rounded p-5 shadow-xl">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#e0e0e0] border-b border-white/5 pb-3 mb-4 flex items-center justify-between">
                  <span>Extracted Threat Indicators</span>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                    {result.features.matchedIndicators.length} Threat Vectors Marked
                  </span>
                </h3>

                {result.features.matchedIndicators.length === 0 ? (
                  <div className="text-center py-6 text-xs text-zinc-500 font-mono">
                    No aggressive text indicators or suspicious structural patterns identified inside message body.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {result.features.matchedIndicators.map((feat, idx) => (
                      <div key={idx} className="p-3 bg-zinc-950/20 border border-white/5 rounded">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-zinc-200">
                            {feat.category}
                          </span>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                            feat.severity === "high" ? "bg-rose-500/10 text-rose-450 border border-rose-500/20" :
                            feat.severity === "medium" ? "bg-amber-500/10 text-amber-450 border border-amber-500/20" :
                            "bg-cyan-500/10 text-cyan-455 border border-cyan-500/20"
                          }`}>
                            {feat.severity} threat
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {feat.matches.map((item, keyIdx) => (
                            <span key={keyIdx} className="text-[10px] font-mono text-cyan-400 bg-[#0a0b0e] px-2 py-0.5 rounded border border-white/5 truncate max-w-xs">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Character Details / Footprint Metadata */}
              <div className="bg-zinc-900/50 border border-white/5 rounded p-4 shadow-xl font-mono text-[10px] text-zinc-500 space-y-1.5">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Analyzer Footprint Metadata
                </p>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Character Size:</span>
                  <span className="text-zinc-300">{result.features.emailLength} bytes</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Suspicious Hyperlinks:</span>
                  <span className="text-zinc-300">{result.features.suspiciousUrlsCount}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Total Embedded URLs:</span>
                  <span className="text-zinc-300">{result.features.totalUrlCount}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Urgent Triggers:</span>
                  <span className="text-zinc-300">{result.features.urgentKeywordsCount}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Fake Portal Mentions:</span>
                  <span className="text-zinc-300">{result.features.fakeLoginCount}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>IP-based Anchor Hyperlinks:</span>
                  <span className="text-zinc-300">{result.features.ipBasedUrlsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Punctuation Anarchy:</span>
                  <span className="text-zinc-300">{result.features.excessiveSpecialChars ? "ACTIVE" : "INACTIVE"}</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="border border-dashed border-white/10 rounded p-8 text-center flex flex-col items-center justify-center min-h-[350px] bg-zinc-900/10 text-zinc-500">
              <div className="w-12 h-12 rounded-full bg-[#0a0b0e] flex items-center justify-center border border-white/5 mb-4">
                <HelpCircle className="h-6 w-6 text-zinc-600 animate-pulse" />
              </div>
              <h4 className="font-semibold text-zinc-400 text-xs uppercase tracking-wider font-mono mb-1">
                Awaiting Input Content
              </h4>
              <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
                Provide or paste an email on the left panel, then request security evaluation to view predictive markers!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
