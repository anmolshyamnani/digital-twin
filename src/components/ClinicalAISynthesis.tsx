import React, { useState, useEffect } from "react";
import {
  PatientBiomarkers,
  CounterfactualTreatment,
  CalculatedRisk,
} from "../types/cardio";
import {
  Sparkles,
  Send,
  Bot,
  User,
  RefreshCw,
  FileCheck,
  AlertCircle,
  Stethoscope,
  HelpCircle,
} from "lucide-react";

interface ClinicalAISynthesisProps {
  baseline: PatientBiomarkers;
  counterfactual: CounterfactualTreatment;
  riskBaseline: CalculatedRisk;
  riskCounterfactual: CalculatedRisk;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const ClinicalAISynthesis: React.FC<ClinicalAISynthesisProps> = ({
  baseline,
  counterfactual,
  riskBaseline,
  riskCounterfactual,
  isOpen,
  onClose,
}) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Assistant Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState<string>("");
  const [isAsking, setIsAsking] = useState<boolean>(false);

  // Pre-populated query chips
  const queryChips = [
    "How to manage statin intolerance / SAMS in this twin?",
    "Does elevated Lp(a) necessitate a stricter LDL-C target?",
    "When is PCSK9i preferred over Bempedoic Acid + Ezetimibe?",
    "Should we order a Coronary CTA or repeat CAC in 3-5 years?",
  ];

  // Fetch AI Analysis when modal opens or on demand
  const fetchAnalysis = async () => {
    setIsLoadingAnalysis(true);
    setAnalysisError(null);

    try {
      const res = await fetch("/api/twin/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseline,
          counterfactual,
          riskBaseline,
          riskCounterfactual,
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      } else {
        setAnalysisError(data.error || "Failed to generate clinical analysis.");
      }
    } catch (err: any) {
      setAnalysisError(err.message || "Failed to connect to AI service.");
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    if (isOpen && !analysis && !isLoadingAnalysis) {
      fetchAnalysis();
    }
  }, [isOpen]);

  const handleSendMessage = async (questionText?: string) => {
    const q = questionText || inputQuestion.trim();
    if (!q || isAsking) return;

    const userMsg: ChatMessage = { role: "user", content: q };
    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuestion("");
    setIsAsking(true);

    try {
      const res = await fetch("/api/twin/ask-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          baseline,
          counterfactual,
          riskBaseline,
          riskCounterfactual,
          history: chatMessages.slice(-4),
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.answer || "Unable to retrieve clinical answer.",
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error connecting to AI service. Please try again." },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                CardioTwin AI Clinical Synthesis
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Gemini 3.7 Flash
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                In Silico Decision Support, Guideline Appraisal (ACC/AHA & ESC) & GDMT Strategy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAnalysis}
              disabled={isLoadingAnalysis}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
              title="Regenerate Clinical Assessment"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingAnalysis ? "animate-spin text-cyan-400" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm">
          {/* Quick Metrics Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Patient Profile</span>
              <strong className="text-white font-semibold">{baseline.name} ({baseline.age}y {baseline.sex})</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Baseline ASCVD Risk</span>
              <strong className="text-rose-400 font-mono font-bold">{riskBaseline.tenYearRisk.toFixed(1)}% ({riskBaseline.riskCategory})</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Counterfactual Risk</span>
              <strong className="text-emerald-400 font-mono font-bold">{riskCounterfactual.tenYearRisk.toFixed(1)}% (-{riskCounterfactual.arr}% ARR)</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Vascular Age Rollback</span>
              <strong className="text-cyan-300 font-mono font-bold">{riskBaseline.vascularAge}y → {riskCounterfactual.vascularAge}y</strong>
            </div>
          </div>

          {/* AI Clinical Assessment Markdown Box */}
          <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Comprehensive Clinical Impression
              </span>
              {isLoadingAnalysis && (
                <span className="text-xs text-indigo-400 animate-pulse font-medium">
                  Generating expert synthesis...
                </span>
              )}
            </div>

            {isLoadingAnalysis ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                <span className="text-xs">Analyzing atherogenic lipid particle kinetics & GDMT guidelines...</span>
              </div>
            ) : analysisError ? (
              <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{analysisError}</span>
              </div>
            ) : analysis ? (
              <div className="prose prose-invert prose-sm max-w-none text-slate-300 space-y-3 leading-relaxed whitespace-pre-wrap font-sans">
                {analysis}
              </div>
            ) : null}
          </div>

          {/* Interactive "Ask Virtual Cardiologist" Chat */}
          <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Ask the Virtual Preventive Cardiologist Assistant
              </h4>
            </div>

            {/* Query Chips */}
            <div className="flex flex-wrap gap-1.5">
              {queryChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  className="text-left text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                >
                  💬 {chip}
                </button>
              ))}
            </div>

            {/* Conversation Log */}
            {chatMessages.length > 0 && (
              <div className="space-y-3 max-h-60 overflow-y-auto p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 text-xs ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600/30 border border-indigo-500/40 text-indigo-100"
                          : "bg-slate-950 border border-slate-800 text-slate-200"
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
                {isAsking && (
                  <div className="flex gap-2 text-xs text-slate-400 items-center">
                    <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>Consulting clinical evidence...</span>
                  </div>
                )}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Ask any question regarding pharmacotherapy, trials, or titration..."
                className="flex-1 bg-slate-900 text-white text-xs rounded-xl px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isAsking}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
