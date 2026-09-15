import React, { useState } from "react";
import {
  HelpCircle,
  X,
  Pill,
  Activity,
  Layers,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Code2,
  Sparkles,
  Heart,
  ShieldCheck,
  Zap,
  ExternalLink,
  BookOpen,
  FlaskConical,
  Scale,
  Gauge,
  Sliders,
  Search,
} from "lucide-react";
import { PatientBiomarkers, CalculatedRisk } from "../types/cardio";
import { GLOSSARY_TERMS, GlossaryItem } from "../data/glossary";

interface SystemGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: PatientBiomarkers;
  riskBaseline?: CalculatedRisk;
}

export const SystemGuideModal: React.FC<SystemGuideModalProps> = ({
  isOpen,
  onClose,
  patient,
  riskBaseline,
}) => {
  const [activeTab, setActiveTab] = useState<
    "how_it_works" | "incorporating_drugs" | "outcomes" | "interactive_sandbox" | "glossary"
  >("how_it_works");

  // State for the interactive drug sandbox within the guide
  const [customDrugName, setCustomDrugName] = useState("Obicetrapib (CETP Inhibitor)");
  const [customLdlReduction, setCustomLdlReduction] = useState(45);
  const [customLpaReduction, setCustomLpaReduction] = useState(50);
  const [customSbpReduction, setCustomSbpReduction] = useState(0);
  const [customAdditionalMaceHR, setCustomAdditionalMaceHR] = useState(0.85);
  const [glossaryQuery, setGlossaryQuery] = useState("");

  if (!isOpen) return null;

  // Calculate sandbox hypothetical outcome based on current baseline or default
  const baseRisk = riskBaseline?.tenYearRisk ?? 24.5;
  const baseLdl = patient?.ldl ?? 160;
  const simulatedLdl = Math.max(15, Math.round(baseLdl * (1 - customLdlReduction / 100)));
  const ldlDelta = baseLdl - simulatedLdl;
  // CTT: ~22% MACE reduction per 38.67 mg/dL (1 mmol/L) LDL drop
  const ldlHR = Math.pow(0.78, Math.max(0, ldlDelta / 38.67));
  const combinedHR = ldlHR * customAdditionalMaceHR;
  const simulatedRisk = Number((baseRisk * combinedHR).toFixed(1));
  const arr = Number((baseRisk - simulatedRisk).toFixed(1));
  const rrr = Number(((arr / baseRisk) * 100).toFixed(1));
  const nnt = arr > 0.1 ? Math.max(1, Math.round(100 / arr)) : 999;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl shadow-2xl shadow-cyan-950/50 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                CardioTwin System Architecture & Drug Guide
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hidden sm:inline">
                  Interactive Guide
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Simple-language explanation of digital twin simulation, new drug integration, and clinical outcomes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/system_guide.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <span>Full HTML View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 gap-2 sm:gap-4 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab("how_it_works")}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "how_it_works"
                ? "border-cyan-400 text-cyan-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-4 h-4" />
            1. How the Full System Works
          </button>
          <button
            onClick={() => setActiveTab("incorporating_drugs")}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "incorporating_drugs"
                ? "border-cyan-400 text-cyan-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Pill className="w-4 h-4" />
            2. How to Incorporate New Drugs
          </button>
          <button
            onClick={() => setActiveTab("outcomes")}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "outcomes"
                ? "border-cyan-400 text-cyan-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Gauge className="w-4 h-4" />
            3. What is the Clinical Outcome?
          </button>
          <button
            onClick={() => setActiveTab("interactive_sandbox")}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "interactive_sandbox"
                ? "border-cyan-400 text-cyan-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            4. Try a New Drug (Interactive)
          </button>
          <button
            onClick={() => setActiveTab("glossary")}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "glossary"
                ? "border-cyan-400 text-cyan-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            5. Complete Medical Glossary (32 Terms)
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* TAB 1: HOW THE FULL SYSTEM WORKS */}
          {activeTab === "how_it_works" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Simple Overview Banner */}
              <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900 to-indigo-950/30 border border-cyan-500/30 rounded-xl p-4 sm:p-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  The Concept in 30 Seconds
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  A <strong>Cardiovascular Digital Twin</strong> is a virtual, mathematical replica of a patient's cardiovascular system. Instead of testing different medications through trial and error over months or years on the real patient, doctors and researchers can test therapies <em>in silico</em> (in computer simulation) to instantly predict how much a patient's risk of heart attack, stroke, and arterial blockage will drop.
                </p>
              </div>

              {/* 4-Step Pipeline Flow */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
                  End-to-End Simulation Pipeline
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Step 1 */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">
                        1
                      </span>
                      Patient Profile & Biomarkers
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      We collect 18+ key clinical indicators: Age, Sex, Blood Pressure, LDL-C, HDL-C, Triglycerides, ApoB, Lp(a), Blood Glucose, HbA1c, Kidney eGFR, and Coronary Artery Calcium (CAC) score.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">
                        2
                      </span>
                      Baseline Risk Calculation
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Using calibrated clinical equations (ACC/AHA PCE, AHA PREVENT, and South Asian atherogenic lipid modifiers), the twin calculates the patient's baseline 10-year risk of heart attack or stroke without intervention.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                        3
                      </span>
                      Counterfactual Drug Sandbox
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      The clinician or researcher selects one or more medications (e.g. Statin + Ezetimibe + PCSK9i + Icosapent). The engine calculates the biological shift in cholesterol and blood pressure using proven clinical trial ratios.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold">
                        4
                      </span>
                      Remodeling & Real-Time Outcomes
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      The engine computes the new 10-year risk, ARR (Absolute Risk Reduction), RRR (Relative Risk Reduction), NNT (Number Needed to Treat), biological heart age rejuvenation, and renders 3D arterial cross-sections.
                    </p>
                  </div>
                </div>
              </div>

              {/* Underlying Scientific Basis */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Validated Clinical Evidence Base
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="font-semibold text-white mb-1">CTT Meta-Analyses</div>
                    <div className="text-slate-400">22% reduction in Major Adverse Cardiac Events (MACE) per 38.67 mg/dL (1 mmol/L) drop in LDL-C.</div>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="font-semibold text-white mb-1">SPRINT / BPLTTC</div>
                    <div className="text-slate-400">~20% reduction in cardiovascular events per 10 mmHg reduction in Systolic Blood Pressure.</div>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="font-semibold text-white mb-1">REDUCE-IT & CLEAR</div>
                    <div className="text-slate-400">25% risk drop with Icosapent Ethyl for high triglycerides; 18% LDL-C drop with Bempedoic Acid.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOW TO INCORPORATE NEW DRUGS */}
          {activeTab === "incorporating_drugs" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-slate-950/70 border border-indigo-500/30 rounded-xl p-4 sm:p-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                  <Pill className="w-4 h-4 text-indigo-400" />
                  How New Drug Compounds Are Plugged In
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Incorporating a new drug (e.g. from Phase 2 or Phase 3 trials) into the digital twin requires defining only <strong>three core mathematical parameters</strong>:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-xs font-bold text-indigo-400 block mb-1">1. Biomarker Delta (Δ)</span>
                    <span className="text-xs text-slate-300">How much does it lower LDL-C, SBP, Triglycerides, or Lp(a)? (e.g. -50% LDL)</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-xs font-bold text-indigo-400 block mb-1">2. Target Indication</span>
                    <span className="text-xs text-slate-300">Which patients qualify? (e.g. Statin intolerant, baseline TG &gt; 150 mg/dL)</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-xs font-bold text-indigo-400 block mb-1">3. Direct Hazard Ratio (HR)</span>
                    <span className="text-xs text-slate-300">Does it provide non-LDL cardiovascular protection? (e.g. HR = 0.85)</span>
                  </div>
                </div>
              </div>

              {/* Code Integration Example */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    Adding a Drug in 4 Lines of Code (TypeScript Engine)
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">src/services/riskEngine.ts</span>
                </div>
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
                  <pre className="text-slate-300">
{`// 1. In types/cardio.ts: Add the new drug flag to CounterfactualTreatment
export interface CounterfactualTreatment {
  // ... existing drugs (statin, ezetimibe, pcsk9)
  obicetrapib?: boolean;       // New CETP Inhibitor
  pelacarsen?: boolean;        // New siRNA Lp(a) Inhibitor
  tirzepatide?: boolean;       // Dual GLP-1/GIP Agonist
}

// 2. In services/riskEngine.ts: Apply the drug's multiplicative biological effect
if (counterfactual.obicetrapib) {
  ldlMultiplier *= (1 - 0.45); // 45% reduction in LDL-C (BROADWAY Trial)
}

if (counterfactual.pelacarsen) {
  // 80% reduction in Lipoprotein(a) (Lp(a)HORIZON Trial)
  projectedLpa *= (1 - 0.80);
}

if (counterfactual.tirzepatide) {
  weightLossPercent += 15;     // 15% weight loss (SURPASS/SURMOUNT Trials)
  sbpDrop += 6;                // Additional 6 mmHg blood pressure reduction
}`}
                  </pre>
                </div>
              </div>

              {/* Examples of Next-Generation Pipeline Drugs */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Emerging Cardiovascular Drug Candidates
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-xs">Obicetrapib (CETP Inhibitor)</span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">Oral Once-Daily</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Lowers LDL-C by up to 45% and ApoB by 30% on top of maximally tolerated statins with no blood pressure side-effects.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-xs">Pelacarsen / Olpasiran (siRNA)</span>
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono">Lp(a) Targeted</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Specifically targets hepatic LPA mRNA to reduce genetic Lipoprotein(a) by 80% to 95%, especially crucial for South Asian patients.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-xs">Tirzepatide & Retatrutide</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">Dual / Triple Incretin</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Produces 15-24% total body weight reduction, reverses visceral adiposity, drops HbA1c by 1.8%, and lowers blood pressure.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-xs">Inclisiran (PCSK9 siRNA)</span>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">Twice-Yearly Injection</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Sustained 50-54% LDL-C lowering administered only twice per year in the clinic, eliminating patient medication non-adherence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHAT IS THE OUTCOME */}
          {activeTab === "outcomes" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-4 sm:p-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  What Are the Outcomes of This System?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  When a doctor or researcher tests an intervention, the digital twin calculates <strong>6 actionable clinical outcomes</strong> that transform complex medical data into clear, life-saving insights:
                </p>
              </div>

              {/* 6 Core Outcomes Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Outcome 1 */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4" />
                      1. Absolute Risk Reduction (ARR)
                    </span>
                    <span className="text-xs font-mono text-slate-400">ARR = Risk_base - Risk_treat</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    The direct percentage point reduction in 10-year heart attack risk. If a patient's risk drops from <strong>25%</strong> to <strong>7%</strong>, the <strong>ARR is 18%</strong>.
                  </p>
                </div>

                {/* Outcome 2 */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      2. Relative Risk Reduction (RRR)
                    </span>
                    <span className="text-xs font-mono text-slate-400">RRR = (ARR / Risk_base) × 100%</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    The percentage of total baseline risk eliminated. For example, a drop from 25% to 7% represents a <strong>72% Relative Risk Reduction</strong>.
                  </p>
                </div>

                {/* Outcome 3 */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Scale className="w-4 h-4" />
                      3. Number Needed to Treat (NNT)
                    </span>
                    <span className="text-xs font-mono text-slate-400">NNT = 100 / ARR</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    How many similar patients must be treated to prevent <strong>one</strong> fatal or non-fatal heart attack. An NNT of <strong>6</strong> means treating just 6 patients saves 1 life.
                  </p>
                </div>

                {/* Outcome 4 */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Heart className="w-4 h-4" />
                      4. Biological Heart Age Rejuvenation
                    </span>
                    <span className="text-xs font-mono text-slate-400">Years Gained</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Translates abstract percentages into intuitive years. A 48-year-old with a vascular age of 63 can rejuvenate their vascular health back to <strong>49 years</strong>.
                  </p>
                </div>

                {/* Outcome 5 */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      5. Arterial Plaque Regression Modeling
                    </span>
                    <span className="text-xs font-mono text-slate-400">Lumen % Opening</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Visualizes how lipid-lowering stops the growth of necrotic lipid cores inside the coronary artery wall, promoting fibrous cap stabilization and lumen widening.
                  </p>
                </div>

                {/* Outcome 6 */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                      <Activity className="w-4 h-4" />
                      6. 10-Year Kaplan-Meier Survival Curves
                    </span>
                    <span className="text-xs font-mono text-slate-400">Survival Trajectory</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Generates year-by-year event-free survival curves comparing the untreated baseline vs the optimized counterfactual digital twin over a 10-year horizon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INTERACTIVE DRUG SANDBOX */}
          {activeTab === "interactive_sandbox" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4 sm:p-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                  <FlaskConical className="w-4 h-4 text-cyan-400" />
                  Live Hypothetical Drug Tester
                </h3>
                <p className="text-xs text-slate-400">
                  Enter the properties of any experimental or new pharmaceutical compound to see how it transforms the Digital Twin in real-time.
                </p>

                {/* Interactive Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Drug Name / Class
                      </label>
                      <input
                        type="text"
                        value={customDrugName}
                        onChange={(e) => setCustomDrugName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        placeholder="e.g. Obicetrapib 10mg"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">LDL-C Reduction Effect (%)</span>
                        <span className="font-bold text-cyan-400">-{customLdlReduction}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={85}
                        step={5}
                        value={customLdlReduction}
                        onChange={(e) => setCustomLdlReduction(Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Lipoprotein(a) Reduction Effect (%)</span>
                        <span className="font-bold text-rose-400">-{customLpaReduction}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={95}
                        step={5}
                        value={customLpaReduction}
                        onChange={(e) => setCustomLpaReduction(Number(e.target.value))}
                        className="w-full accent-rose-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Independent Hazard Ratio (HR)</span>
                        <span className="font-bold text-indigo-400">{customAdditionalMaceHR}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.65}
                        max={1.0}
                        step={0.01}
                        value={customAdditionalMaceHR}
                        onChange={(e) => setCustomAdditionalMaceHR(Number(e.target.value))}
                        className="w-full accent-indigo-400 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500">1.0 = no extra non-LDL benefit; 0.80 = 20% extra MACE reduction</span>
                    </div>
                  </div>

                  {/* Real-time Computed Outcome Box */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Simulated Digital Twin Impact
                      </div>
                      <div className="text-sm font-semibold text-white mb-3">
                        {customDrugName || "Hypothetical Compound"}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase block">Baseline LDL → New LDL</span>
                          <span className="text-sm font-bold text-slate-200">
                            {baseLdl} → <span className="text-cyan-400">{simulatedLdl} mg/dL</span>
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase block">10-Yr Event Risk</span>
                          <span className="text-sm font-bold text-slate-200">
                            {baseRisk}% → <span className="text-emerald-400">{simulatedRisk}%</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">ARR</span>
                          <span className="text-xs font-bold text-emerald-400">-{arr}%</span>
                        </div>
                        <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">RRR</span>
                          <span className="text-xs font-bold text-cyan-400">+{rrr}%</span>
                        </div>
                        <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">NNT</span>
                          <span className="text-xs font-bold text-amber-400">{nnt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Mathematical simulation grounded in CTT regression models ($p &lt; 0.0001$).</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COMPLETE MEDICAL GLOSSARY (32 TERMS) */}
          {activeTab === "glossary" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    Clinical & Technical Medical Dictionary
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comprehensive definitions of every metric, biomarker, drug, and visual element with what it shows on screen.
                  </p>
                </div>
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={glossaryQuery}
                    onChange={(e) => setGlossaryQuery(e.target.value)}
                    placeholder="Search any term (ARR, ApoB, PCSK9...)..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GLOSSARY_TERMS.filter((item) => {
                  if (!glossaryQuery) return true;
                  const q = glossaryQuery.toLowerCase();
                  return (
                    item.term.toLowerCase().includes(q) ||
                    item.fullName.toLowerCase().includes(q) ||
                    item.meaning.toLowerCase().includes(q) ||
                    item.showsOnScreen.toLowerCase().includes(q) ||
                    item.keywords.toLowerCase().includes(q)
                  );
                }).map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between transition-colors shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-white flex items-center gap-1.5">
                          {item.term}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          item.category === "outcomes"
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                            : item.category === "biomarkers"
                            ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                            : item.category === "drugs"
                            ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                            : item.category === "imaging"
                            ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                            : "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                        }`}>
                          {item.categoryLabel}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-cyan-400 mb-2">{item.fullName}</div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">{item.meaning}</p>
                    </div>

                    <div className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800 text-[11px] space-y-1">
                      <div className="font-semibold text-slate-200 flex items-center gap-1">
                        <span className="text-cyan-400 font-bold">▶</span> What It Shows On Screen:
                      </div>
                      <div className="text-slate-300 leading-snug">{item.showsOnScreen}</div>
                      {item.targetOrFormula && (
                        <div className="pt-1 text-[10px] font-mono text-amber-400/90 border-t border-slate-800/80">
                          {item.targetOrFormula}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>CardioTwin Research Framework · ACC/AHA & ESC Guideline Compliant</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="/system_guide.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none text-center px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 transition-colors"
            >
              Open Printable HTML Guide
            </a>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors cursor-pointer"
            >
              Got it, Back to Twin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
