import React, { useState } from "react";
import {
  Activity,
  FileText,
  Sparkles,
  RotateCcw,
  Sliders,
  HeartPulse,
  Info,
  BookOpen,
  Eye,
  Share2,
  Check,
} from "lucide-react";
import { ClinicalPreset, UnitSystem } from "../types/cardio";
import { CLINICAL_PRESETS } from "../data/presets";

interface HeaderProps {
  activePresetId: string;
  onSelectPreset: (preset: ClinicalPreset) => void;
  unitSystem: UnitSystem;
  onToggleUnits: (units: UnitSystem) => void;
  onOpenAIReview: () => void;
  onOpenReport: () => void;
  onOpenGuide?: () => void;
  onReset: () => void;
  isAiGenerating?: boolean;
  currentView: "preview" | "workbench";
  onSwitchView: (view: "preview" | "workbench") => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePresetId,
  onSelectPreset,
  unitSystem,
  onToggleUnits,
  onOpenAIReview,
  onOpenReport,
  onOpenGuide,
  onReset,
  isAiGenerating = false,
  currentView,
  onSwitchView,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = window.location.origin
      ? `${window.location.origin}${window.location.pathname}#preview`
      : "https://ais-pre-hr4dgjzyg7qjpswthagsxe-925272355965.asia-east1.run.app";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand identity & View Switcher */}
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div
            onClick={() => onSwitchView("preview")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 via-red-500/10 to-cyan-500/20 border border-rose-500/30 shadow-inner shadow-rose-500/10 group-hover:border-rose-500/50 transition-all">
              <HeartPulse className="w-5 h-5 text-rose-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  CardioTwin
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Digital Twin v2.5
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Cardiovascular & Hyperlipidemia In Silico Simulation
              </p>
            </div>
          </div>

          {/* View Mode Toggle: Preview vs Workbench */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              id="view-preview-btn"
              type="button"
              onClick={() => onSwitchView("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                currentView === "preview"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Page</span>
            </button>

            <button
              id="view-workbench-btn"
              type="button"
              onClick={() => onSwitchView("workbench")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                currentView === "workbench"
                  ? "bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Workbench</span>
            </button>
          </div>
        </div>

        {/* Controls: Preset selector, Unit toggle, and Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Quick Share Link button */}
          <button
            id="header-share-btn"
            type="button"
            onClick={handleCopyLink}
            title="Copy shareable link accessible to anyone"
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          {/* Preset Selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-0.5">
            <span className="text-[10px] font-semibold text-slate-400 pl-2 pr-1 uppercase tracking-wider hidden xl:inline">
              Case:
            </span>
            <select
              id="clinical-preset-select"
              value={activePresetId}
              onChange={(e) => {
                const selected = CLINICAL_PRESETS.find((p) => p.id === e.target.value);
                if (selected) onSelectPreset(selected);
              }}
              className="bg-slate-950 text-slate-200 text-xs font-medium rounded-md px-2 py-1.5 border border-slate-800 hover:border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {CLINICAL_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} ({preset.tagline.split("·")[0].trim()})
                </option>
              ))}
            </select>
          </div>

          {/* Unit Toggle (mg/dL vs mmol/L) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
            <button
              id="unit-mgdl-btn"
              type="button"
              onClick={() => onToggleUnits("mgdl")}
              className={`px-2 py-1 rounded-md transition-all ${
                unitSystem === "mgdl"
                  ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              mg/dL
            </button>
            <button
              id="unit-mmoll-btn"
              type="button"
              onClick={() => onToggleUnits("mmoll")}
              className={`px-2 py-1 rounded-md transition-all ${
                unitSystem === "mmoll"
                  ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              mmol/L
            </button>
          </div>

          {/* System Guide & Drug Integration Trigger */}
          {onOpenGuide && (
            <button
              id="open-system-guide-btn"
              type="button"
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer shadow-sm"
              title="Learn how this digital twin works, how to incorporate new drugs, and clinical outcomes"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">How It Works</span>
            </button>
          )}

          {/* AI Clinical Review Trigger */}
          <button
            id="ai-clinical-review-btn"
            type="button"
            onClick={onOpenAIReview}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600/90 to-indigo-600/90 hover:from-violet-500 hover:to-indigo-500 text-white shadow-sm shadow-indigo-900/30 border border-indigo-400/30 transition-all cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 text-indigo-200 ${isAiGenerating ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">AI Synthesis</span>
          </button>

          {/* Export Report Trigger */}
          <button
            id="export-report-btn"
            type="button"
            onClick={onOpenReport}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Reset button */}
          <button
            id="reset-twin-btn"
            type="button"
            onClick={onReset}
            title="Reset Patient Twin to baseline"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
