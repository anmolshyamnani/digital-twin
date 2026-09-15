import React, { useState, useMemo } from "react";
import {
  HeartPulse,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  Activity,
  ArrowRight,
  Share2,
  Check,
  ExternalLink,
  Layers,
  Cpu,
  Sliders,
  Award,
  BookOpen,
  Stethoscope,
  ChevronRight,
  Info,
  CheckCircle2,
  BarChart3,
  Dna,
  Zap,
} from "lucide-react";
import { CLINICAL_PRESETS } from "../data/presets";
import { calculateBaselineRisk, calculateCounterfactualRisk } from "../services/riskEngine";
import { ClinicalPreset, UnitSystem } from "../types/cardio";

interface PreviewPageProps {
  onLaunchWorkbench: (presetId?: string) => void;
  unitSystem: UnitSystem;
  onToggleUnits: (units: UnitSystem) => void;
  onOpenAIReview?: () => void;
}

export const PreviewPage: React.FC<PreviewPageProps> = ({
  onLaunchWorkbench,
  unitSystem,
  onToggleUnits,
  onOpenAIReview,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(CLINICAL_PRESETS[0].id);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"showcase" | "capabilities" | "guidelines" | "about">("showcase");

  const selectedPreset: ClinicalPreset = useMemo(() => {
    return CLINICAL_PRESETS.find((p) => p.id === selectedPresetId) || CLINICAL_PRESETS[0];
  }, [selectedPresetId]);

  const baselineRisk = useMemo(() => {
    return calculateBaselineRisk(selectedPreset.patient);
  }, [selectedPreset]);

  const counterfactualRisk = useMemo(() => {
    return calculateCounterfactualRisk(selectedPreset.patient, selectedPreset.recommendedCounterfactual);
  }, [selectedPreset]);

  const arr = useMemo(() => {
    return Math.max(0, baselineRisk.tenYearRisk - counterfactualRisk.tenYearRisk);
  }, [baselineRisk, counterfactualRisk]);

  const rrr = useMemo(() => {
    if (baselineRisk.tenYearRisk <= 0.01) return 0;
    return Math.round((arr / baselineRisk.tenYearRisk) * 100);
  }, [arr, baselineRisk]);

  const vascularGain = useMemo(() => {
    return Math.max(0, baselineRisk.vascularAge - counterfactualRisk.vascularAge);
  }, [baselineRisk, counterfactualRisk]);

  // Copy shareable link
  const handleCopyLink = () => {
    const shareUrl = window.location.origin
      ? `${window.location.origin}${window.location.pathname}#preview`
      : "https://ais-pre-hr4dgjzyg7qjpswthagsxe-925272355965.asia-east1.run.app";

    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="w-full flex flex-col space-y-8 pb-16">
      {/* Public Access Banner */}
      <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-cyan-950/20">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Publicly Accessible Preview
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Open to clinicians, researchers, and public review
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Share this live demonstration of the Cardiovascular & Hyperlipidemia Digital Twin with anyone.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            id="preview-copy-link-btn"
            type="button"
            onClick={handleCopyLink}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 transition-all cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-cyan-300" />
                <span>Copy Shareable Link</span>
              </>
            )}
          </button>

          <button
            id="preview-launch-simulator-btn"
            type="button"
            onClick={() => onLaunchWorkbench(selectedPreset.id)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-md shadow-rose-900/30 transition-all cursor-pointer"
          >
            <span>Launch Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Showcase Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/90 p-6 sm:p-8 lg:p-12">
        {/* Background glow effects */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-10 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-300">
            <HeartPulse className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Cardiovascular & Hyperlipidemia In Silico Twin Engine</span>
            <span className="w-1 h-1 rounded-full bg-slate-500" />
            <span className="text-cyan-400 font-semibold">Grounded in ACC/AHA, ESC, CSI & ICMR Guidelines</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Precision In Silico Modeling for{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-amber-300 to-cyan-400">
              Cardiovascular Risk & Lipid Therapy
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            CardioTwin synthesizes non-linear mathematical biology, deep lipidomics, and counterfactual
            pharmacotherapy to predict individualized ASCVD events, model vascular lumen remodeling, and calculate
            guideline-directed absolute risk reduction.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-3xl mx-auto">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-xl sm:text-2xl font-bold text-cyan-400 font-mono">4 Pillars</div>
              <div className="text-[11px] text-slate-400 mt-0.5">In Silico Capabilities</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">10+ Levers</div>
              <div className="text-[11px] text-slate-400 mt-0.5">GDMT & Novel Agents</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">Real-Time</div>
              <div className="text-[11px] text-slate-400 mt-0.5">3D Lumen Remodeling</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-xl sm:text-2xl font-bold text-violet-400 font-mono">AI Synthesized</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Clinical Decision Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-center border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          <button
            id="tab-showcase-btn"
            type="button"
            onClick={() => setActiveTab("showcase")}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "showcase"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Interactive Archetypes</span>
          </button>

          <button
            id="tab-capabilities-btn"
            type="button"
            onClick={() => setActiveTab("capabilities")}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "capabilities"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Core 4 Capabilities</span>
          </button>

          <button
            id="tab-guidelines-btn"
            type="button"
            onClick={() => setActiveTab("guidelines")}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "guidelines"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Guideline Benchmarks</span>
          </button>

          <button
            id="tab-about-btn"
            type="button"
            onClick={() => setActiveTab("about")}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "about"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Public Access Guide</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE LIVE ARCHETYPES SHOWCASE */}
      {activeTab === "showcase" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-cyan-400" />
                Select a Clinical Patient Archetype to Preview
              </h2>
              <p className="text-xs text-slate-400">
                Explore how the digital twin simulates physiological baseline vs. counterfactual therapeutic transformation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Units:</span>
              <button
                type="button"
                onClick={() => onToggleUnits("mgdl")}
                className={`text-xs px-2 py-1 rounded-md font-medium ${
                  unitSystem === "mgdl" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                mg/dL
              </button>
              <button
                type="button"
                onClick={() => onToggleUnits("mmoll")}
                className={`text-xs px-2 py-1 rounded-md font-medium ${
                  unitSystem === "mmoll" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                mmol/L
              </button>
            </div>
          </div>

          {/* Archetype Card Selector Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CLINICAL_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPreset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "bg-slate-900/90 border-cyan-500/60 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/30"
                      : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${preset.avatarColor}`} />
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          Active Preview
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-cyan-400/90 mb-1">{preset.tagline}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{preset.description}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      LDL: <strong className="text-slate-200">{preset.patient.ldl}</strong> | CAC:{" "}
                      <strong className="text-slate-200">{preset.patient.cac}</strong>
                    </span>
                    <span className="text-cyan-400 font-semibold flex items-center gap-0.5">
                      View Twin <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Comparison Preview Card for the Selected Archetype */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${selectedPreset.avatarColor}`} />
                  <h3 className="text-lg font-bold text-white">{selectedPreset.name} — Live Digital Twin Simulation</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{selectedPreset.tagline}</p>
              </div>

              <button
                type="button"
                onClick={() => onLaunchWorkbench(selectedPreset.id)}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-md shadow-rose-900/30 transition-all cursor-pointer self-start sm:self-auto"
              >
                <span>Open & Tweak in Workbench</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3-Column Comparison: Baseline vs Strategy vs Projected Outcome */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Baseline Column */}
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Baseline Twin State
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold">
                    {baselineRisk.riskCategory}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1">
                  <div className="text-xs text-slate-400">10-Year ASCVD Event Risk</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
                    {baselineRisk.tenYearRisk.toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Vascular Biological Age:{" "}
                    <strong className="text-rose-300">{baselineRisk.vascularAge} yrs</strong> (Chronological:{" "}
                    {selectedPreset.patient.age} yrs)
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">LDL-C:</span>
                    <span className="font-semibold text-white">{selectedPreset.patient.ldl} mg/dL</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">ApoB:</span>
                    <span className="font-semibold text-white">{selectedPreset.patient.apoB || "N/A"} mg/dL</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Lipoprotein(a):</span>
                    <span className="font-semibold text-white">{selectedPreset.patient.lpa || "N/A"} nmol/L</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Blood Pressure:</span>
                    <span className="font-semibold text-white">
                      {selectedPreset.patient.sbp}/{selectedPreset.patient.dbp} mmHg
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">CAC Plaque Index:</span>
                    <span className="font-semibold text-amber-300">{selectedPreset.patient.cac} Agatston</span>
                  </div>
                </div>
              </div>

              {/* Counterfactual Regimen Column */}
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    Simulated GDMT Regimen
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                    Counterfactual
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Statin Therapy</span>
                    <span className="font-bold text-cyan-300 capitalize">
                      {selectedPreset.recommendedCounterfactual.statinIntensity} Intensity
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Lipid Add-on Agents</span>
                    <span className="font-medium text-slate-200">
                      {[
                        selectedPreset.recommendedCounterfactual.ezetimibe ? "Ezetimibe 10mg" : null,
                        selectedPreset.recommendedCounterfactual.pcsk9 ? "PCSK9 Inhibitor (Evolocumab)" : null,
                        selectedPreset.recommendedCounterfactual.bempedoicAcid ? "Bempedoic Acid 180mg" : null,
                        selectedPreset.recommendedCounterfactual.icosapent ? "Icosapent Ethyl 4g" : null,
                      ]
                        .filter(Boolean)
                        .join(" + ") || "None"}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">BP & Cardiometabolic Target</span>
                    <span className="font-medium text-slate-200">
                      Target SBP Drop: -{selectedPreset.recommendedCounterfactual.sbpReduction} mmHg
                      {selectedPreset.recommendedCounterfactual.glp1sglt2 ? " + SGLT2i/GLP-1 RA" : ""}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Lifestyle Optimization</span>
                    <span className="font-medium text-slate-200 capitalize">
                      {selectedPreset.recommendedCounterfactual.diet} Diet ·{" "}
                      {selectedPreset.recommendedCounterfactual.exerciseLevel} Exercise ·{" "}
                      {selectedPreset.recommendedCounterfactual.weightLossPercent}% Weight Loss
                    </span>
                  </div>
                </div>
              </div>

              {/* Projected Counterfactual Outcome Column */}
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Projected Outcome
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                    {counterfactualRisk.riskCategory}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1">
                  <div className="text-xs text-slate-400">Post-Intervention 10-Yr Risk</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                    {counterfactualRisk.tenYearRisk.toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-emerald-300 font-semibold">
                    ARR: -{arr.toFixed(1)}% (RRR: {rrr}%) · NNT: {counterfactualRisk.nnt}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Projected LDL-C:</span>
                    <span className="font-bold text-emerald-400">{counterfactualRisk.projectedLDL} mg/dL</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Projected ApoB:</span>
                    <span className="font-bold text-emerald-400">{counterfactualRisk.projectedApoB} mg/dL</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Rejuvenated Vascular Age:</span>
                    <span className="font-bold text-emerald-300">
                      {counterfactualRisk.vascularAge} yrs (-{vascularGain} yrs)
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Event-Free Years Gained:</span>
                    <span className="font-bold text-cyan-300">+{counterfactualRisk.yearsGained.toFixed(1)} years</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  Simulated outcomes conform to the Cardiological Society of India (CSI), ACC/AHA, and ESC LDL target guidelines.
                </span>
              </div>
              <button
                type="button"
                onClick={() => onLaunchWorkbench(selectedPreset.id)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                Launch Workbench with this patient ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THE 4 CORE CAPABILITIES */}
      {activeTab === "capabilities" && (
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              The 4 Pillars of the CardioTwin Platform
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Rigorous, evidence-based in silico methodology uniting machine learning and mathematical physiology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Pillar 1 */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Dna className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">1. In Silico Trial Augmentation</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Synthesizes physiologically coherent virtual patient cohorts calibrated against real-world epidemiology
                (INTERHEART, MASALA, ICMR-INDIAB). Augments underrepresented populations with high premature CAD,
                elevated Lipoprotein(a), and low HDL phenotypes for robust statistical power without patient risk.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] text-cyan-300">
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  Synthetic Cohort Synthesis
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  Covariance Matrix Sampling
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  CSV Export Ready
                </span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3 hover:border-rose-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">2. Refined Non-Linear ML Risk Stratification</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Moves beyond simple linear calculators. Models non-linear synergistic interactions: the diabetic
                dyslipidemia triad multiplier, ApoB + Lp(a) dual particle cytotoxicity, Asian-Indian abdominal visceral
                adiposity cutoffs, and subclinical CAC Agatston score calibration.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] text-rose-300">
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                  Continuous Probability
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                  Biological Vascular Age
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                  AUROC 0.82+ Calibration
                </span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3 hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">3. Counterfactual Therapeutic Sandbox</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Empowers clinicians to perform real-time "What If" simulation. Test combinations of high-intensity
                statins, Rosuvastatin + Ezetimibe FDCs, PCSK9 inhibitors, Bempedoic Acid, Saroglitazar (dual PPAR-α/γ),
                SGLT2 inhibitors, GLP-1 receptor agonists, and blood pressure reductions with instant ARR and NNT metrics.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] text-emerald-300">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Multiplicative Retention
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Fixed-Dose Combinations
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  CSI Goal Attainment
                </span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3 hover:border-amber-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">4. Confounding-Free Feature Isolation (Ceteris Paribus)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Solves confounding in observational datasets. Evaluates pure partial derivatives (∂Risk/∂Variable)
                across a biological manifold while freezing all other 18+ demographic and laboratory covariates static.
                Renders 2D response surfaces to inspect non-linear cross-talk between biomarkers.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] text-amber-300">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  1D Partial Derivatives
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  2D Response Surface
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  Pure Gradient Sensitivity
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GUIDELINE BENCHMARKS */}
      {activeTab === "guidelines" && (
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Guideline Validation & Target Attainment
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Aligned with consensus guidelines from Cardiological Society of India (CSI), ACC/AHA, and ESC.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-300 font-semibold">
                  <th className="p-3 sm:p-4">Risk Category</th>
                  <th className="p-3 sm:p-4">CSI Target (mg/dL)</th>
                  <th className="p-3 sm:p-4">ESC/EAS Goal (mg/dL)</th>
                  <th className="p-3 sm:p-4">ACC/AHA Recommendation</th>
                  <th className="p-3 sm:p-4">CardioTwin Implementation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                <tr>
                  <td className="p-3 sm:p-4 font-bold text-rose-400">Extreme / Secondary CAD</td>
                  <td className="p-3 sm:p-4 font-mono font-semibold text-white">LDL-C &lt; 30-55 mg/dL</td>
                  <td className="p-3 sm:p-4 font-mono font-semibold text-white">LDL-C &lt; 40-55 mg/dL</td>
                  <td className="p-3 sm:p-4">High-intensity statin + Ezetimibe + PCSK9i</td>
                  <td className="p-3 sm:p-4 text-emerald-400 font-medium">Flagged & highlighted with dual FDC guidance</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-bold text-rose-300">Very High Risk</td>
                  <td className="p-3 sm:p-4 font-mono font-semibold text-white">LDL-C &lt; 55 mg/dL</td>
                  <td className="p-3 sm:p-4 font-mono font-semibold text-white">LDL-C &lt; 55 mg/dL</td>
                  <td className="p-3 sm:p-4">≥50% reduction + LDL &lt; 55-70 mg/dL</td>
                  <td className="p-3 sm:p-4 text-emerald-400 font-medium">Automatic goal tracker & ARR projection</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-bold text-amber-300">High Risk / Metabolic</td>
                  <td className="p-3 sm:p-4 font-mono font-semibold text-white">LDL-C &lt; 70 mg/dL</td>
                  <td className="p-3 sm:p-4 font-mono font-semibold text-white">LDL-C &lt; 70 mg/dL</td>
                  <td className="p-3 sm:p-4">≥50% reduction in LDL-C</td>
                  <td className="p-3 sm:p-4 text-emerald-400 font-medium">ApoB (&lt;80) & Non-HDL (&lt;100) integrated</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-bold text-cyan-300">Atherogenic Triad (High TG/Low HDL)</td>
                  <td className="p-3 sm:p-4 font-mono font-semibold text-white">TG &lt; 150 mg/dL, ApoB &lt; 65</td>
                  <td className="p-3 sm:p-4 font-mono font-semibold text-white">Non-HDL target priority</td>
                  <td className="p-3 sm:p-4">Lifestyle + Fibrate/Icosapent Ethyl</td>
                  <td className="p-3 sm:p-4 text-emerald-400 font-medium">Saroglitazar & Fenofibrate FDC simulation</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-bold text-indigo-300">Hypertension (IHG-IV)</td>
                  <td className="p-3 sm:p-4 font-mono font-semibold text-white">BP &lt; 130/80 mmHg</td>
                  <td className="p-3 sm:p-4 font-mono font-semibold text-white">BP &lt; 130/80 mmHg</td>
                  <td className="p-3 sm:p-4">BP &lt; 130/80 mmHg</td>
                  <td className="p-3 sm:p-4 text-emerald-400 font-medium">Telmisartan + Cilnidipine FDC modeled</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PUBLIC ACCESS GUIDE & FAQ */}
      {activeTab === "about" && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Public Access & Sharing Guide</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Learn how anyone can view, experiment with, and evaluate CardioTwin.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                How can anyone access this preview page?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                This preview page is completely open and requires no authentication. Anyone can access it via the shared
                link, view interactive archetypes, compare baseline vs counterfactual outcomes, and launch into the full
                simulation workbench.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                What is the difference between the Preview Page and the Simulator Workbench?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The <strong>Preview Page</strong> provides a curated, high-level walkthrough and interactive archetype
                showcase suitable for quick review, presentations, and peer evaluation. The <strong>Simulator Workbench</strong>{" "}
                is the deep clinical sandbox where you can adjust over 25 granular physiological parameters, customize
                medication doses, inspect 3D vascular lumen cross-sections, and run Gemini AI clinical reviews.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Can I export or share patient simulations?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Yes! Inside the workbench, click the <strong>Export Report</strong> button to generate an EHR-ready,
                print-ready clinical summary formatted with baseline metrics, simulated drug regimen, and calculated risk
                deltas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Public Share URL Reference
              </h3>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-400 overflow-x-auto">
                <span className="truncate">https://ais-pre-hr4dgjzyg7qjpswthagsxe-925272355965.asia-east1.run.app</span>
              </div>
              <p className="text-[11px] text-slate-400">
                This public URL can be shared with anyone to let them access and interact with the application.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Launch Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-cyan-950/40 border border-slate-800 p-6 sm:p-8 text-center space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-white">
          Ready to experiment with custom patient biomarkers and counterfactuals?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Switch to the interactive workbench to adjust lipid sliders, customize fixed-dose drug combinations, and
          visualize real-time artery lumen remodeling.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onLaunchWorkbench(selectedPreset.id)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-lg shadow-rose-900/30 transition-all cursor-pointer"
          >
            <span>Launch Interactive Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>{copied ? "Link Copied!" : "Share Preview"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
