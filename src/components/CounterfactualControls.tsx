import React from "react";
import {
  CounterfactualTreatment,
  PatientBiomarkers,
  StatinIntensity,
  DietPattern,
  ExerciseLevel,
} from "../types/cardio";
import {
  Pill,
  HeartHandshake,
  Dna,
  ShieldPlus,
  Flame,
  Salad,
  CigaretteOff,
  Zap,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

interface CounterfactualControlsProps {
  treatment: CounterfactualTreatment;
  baseline: PatientBiomarkers;
  onChange: (updated: CounterfactualTreatment) => void;
}

export const CounterfactualControls: React.FC<CounterfactualControlsProps> = ({
  treatment,
  baseline,
  onChange,
}) => {
  const updateTreatment = <K extends keyof CounterfactualTreatment>(
    key: K,
    val: CounterfactualTreatment[K]
  ) => {
    onChange({ ...treatment, [key]: val });
  };

  // Quick Strategy Pre-sets
  const applyPreset = (type: string) => {
    switch (type) {
      case "guideline_target": // Goal LDL < 55 mg/dL
        onChange({
          ...treatment,
          statinIntensity: baseline.statinIntolerant ? "none" : "high",
          ezetimibe: true,
          pcsk9: true,
          bempedoicAcid: baseline.statinIntolerant,
          sbpReduction: Math.max(10, baseline.sbp - 120),
          diet: "mediterranean",
          exerciseLevel: "moderate",
          smokingCessation: baseline.smoker === "current",
          weightLossPercent: baseline.bmi > 25 ? 7 : 0,
        });
        break;
      case "max_oral": // High Statin + Ezetimibe
        onChange({
          ...treatment,
          statinIntensity: baseline.statinIntolerant ? "none" : "high",
          ezetimibe: true,
          pcsk9: false,
          bempedoicAcid: baseline.statinIntolerant,
          sbpReduction: Math.max(8, baseline.sbp - 125),
          diet: "mediterranean",
          exerciseLevel: "moderate",
          smokingCessation: baseline.smoker === "current",
        });
        break;
      case "triple_lipid": // Statin + Ezetimibe + PCSK9i
        onChange({
          ...treatment,
          statinIntensity: "high",
          ezetimibe: true,
          pcsk9: true,
          bempedoicAcid: false,
          sbpReduction: 12,
          diet: "mediterranean",
          exerciseLevel: "moderate",
          smokingCessation: baseline.smoker === "current",
          aspirin: true,
        });
        break;
      case "statin_intolerant_safe": // Statin-free (Bempedoic Acid + Ezetimibe + PCSK9i)
        onChange({
          ...treatment,
          statinIntensity: "none",
          ezetimibe: true,
          pcsk9: true,
          bempedoicAcid: true,
          icosapent: baseline.triglycerides >= 150,
          glp1sglt2: baseline.diabetes,
          diet: "mediterranean",
          exerciseLevel: "moderate",
          smokingCessation: baseline.smoker === "current",
        });
        break;
      case "lifestyle_only": // Intensive Lifestyle
        onChange({
          statinIntensity: "none",
          ezetimibe: false,
          pcsk9: false,
          bempedoicAcid: false,
          icosapent: false,
          glp1sglt2: false,
          sbpReduction: 0,
          aspirin: false,
          diet: "dash",
          exerciseLevel: "vigorous",
          smokingCessation: baseline.smoker === "current",
          weightLossPercent: 12,
          sodiumReduction: true,
        });
        break;
      case "reset":
        onChange({
          statinIntensity: "none",
          ezetimibe: false,
          pcsk9: false,
          bempedoicAcid: false,
          icosapent: false,
          glp1sglt2: false,
          sbpReduction: 0,
          aspirin: false,
          diet: "standard",
          exerciseLevel: "sedentary",
          smokingCessation: false,
          weightLossPercent: 0,
          sodiumReduction: false,
        });
        break;
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-lg space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Counterfactual Simulation Sandbox ('What-If' Levers)
            </h2>
            <p className="text-[11px] text-slate-400">
              Simulate pharmacological, antihypertensive, and lifestyle interventions in real time
            </p>
          </div>
        </div>

        {/* Fast Intervention Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset("guideline_target")}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
          >
            🎯 GDMT Target (LDL &lt; 55)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("max_oral")}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer"
          >
            💊 High Statin + Ezetimibe
          </button>
          <button
            type="button"
            onClick={() => applyPreset("triple_lipid")}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 transition-all cursor-pointer hidden md:inline-block"
          >
            🧬 Triple Lipid Lowering
          </button>
          {baseline.statinIntolerant && (
            <button
              type="button"
              onClick={() => applyPreset("statin_intolerant_safe")}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-all cursor-pointer"
            >
              🛡️ Statin-Free Regimen
            </button>
          )}
          <button
            type="button"
            onClick={() => applyPreset("reset")}
            className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            title="Reset counterfactual levers"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1. Lipid-Lowering Pharmacotherapy */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Pill className="w-3.5 h-3.5 text-cyan-400" />
          1. Lipid-Lowering Pharmacotherapy (Guideline-Directed)
        </h3>

        {/* Statin Intensity Segmented Control */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/90 space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-200">
              HMG-CoA Reductase Inhibitor (Statin)
            </label>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold">
              {treatment.statinIntensity === "high"
                ? "-52% LDL (Atorvastatin 80mg / Rosuvastatin 40mg)"
                : treatment.statinIntensity === "moderate"
                ? "-38% LDL (Atorvastatin 20mg / Rosuvastatin 10mg)"
                : treatment.statinIntensity === "low"
                ? "-28% LDL (Pravastatin 20-40mg / Simvastatin 20mg)"
                : "No Statin"}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {(["none", "low", "moderate", "high"] as StatinIntensity[]).map((intensity) => (
              <button
                key={intensity}
                type="button"
                onClick={() => updateTreatment("statinIntensity", intensity)}
                className={`py-1.5 text-xs font-semibold rounded-md capitalize transition-all cursor-pointer ${
                  treatment.statinIntensity === intensity
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {intensity}
              </button>
            ))}
          </div>
          {baseline.statinIntolerant && treatment.statinIntensity !== "none" && (
            <div className="text-[11px] text-amber-400 flex items-center gap-1 mt-1">
              ⚠️ Note: Patient has documented history of statin intolerance/SAMS. Consider non-statin therapies below.
            </div>
          )}
        </div>

        {/* Non-Statin Add-On Therapies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Ezetimibe */}
          <label className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            treatment.ezetimibe
              ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-200"
              : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold block">Ezetimibe 10 mg</span>
              <input
                id="chk-ezetimibe"
                type="checkbox"
                checked={treatment.ezetimibe}
                onChange={(e) => updateTreatment("ezetimibe", e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-cyan-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <span className="text-[10px] opacity-80 mt-1">
              NPC1L1 Inhibitor · <strong>+18-20% additional LDL drop</strong> (IMPROVE-IT)
            </span>
          </label>

          {/* PCSK9 Inhibitor */}
          <label className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            treatment.pcsk9
              ? "bg-violet-500/15 border-violet-500/40 text-violet-200"
              : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold block">PCSK9 Monoclonal / siRNA</span>
              <input
                id="chk-pcsk9"
                type="checkbox"
                checked={treatment.pcsk9}
                onChange={(e) => updateTreatment("pcsk9", e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-violet-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <span className="text-[10px] opacity-80 mt-1">
              Evolocumab / Alirocumab / Inclisiran · <strong>+55-60% LDL drop</strong> (FOURIER)
            </span>
          </label>

          {/* Bempedoic Acid */}
          <label className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            treatment.bempedoicAcid
              ? "bg-purple-500/15 border-purple-500/40 text-purple-200"
              : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold block">Bempedoic Acid 180 mg</span>
              <input
                id="chk-bempedoic"
                type="checkbox"
                checked={treatment.bempedoicAcid}
                onChange={(e) => updateTreatment("bempedoicAcid", e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-purple-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <span className="text-[10px] opacity-80 mt-1">
              ACL Inhibitor (Nexletol) · <strong>+18-24% LDL drop</strong> (CLEAR Outcomes)
            </span>
          </label>

          {/* Icosapent Ethyl */}
          <label className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            treatment.icosapent
              ? "bg-amber-500/15 border-amber-500/40 text-amber-200"
              : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold block">Icosapent Ethyl (Vascepa 4g)</span>
              <input
                id="chk-icosapent"
                type="checkbox"
                checked={treatment.icosapent}
                onChange={(e) => updateTreatment("icosapent", e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-amber-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <span className="text-[10px] opacity-80 mt-1">
              High-purity EPA · <strong>-25% MACE risk if TG ≥135</strong> (REDUCE-IT)
            </span>
          </label>
        </div>
      </div>

      {/* 2. Hemodynamic & Cardiorenal Optimization */}
      <div className="space-y-3 pt-2 border-t border-slate-800/60">
        <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
          2. Antihypertensive & Cardiometabolic Protection
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Target SBP Reduction Slider */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/90 space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-200">
                Antihypertensive Titration (Target SBP Reduction)
              </label>
              <span className="text-xs font-mono font-bold text-amber-300">
                -{treatment.sbpReduction} mmHg
              </span>
            </div>
            <input
              id="range-sbp-reduction"
              type="range"
              min={0}
              max={30}
              step={2}
              value={treatment.sbpReduction}
              onChange={(e) => updateTreatment("sbpReduction", Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseline.sbp} mmHg</span>
              <span>Projected SBP: <strong className="text-white font-mono">{Math.max(95, baseline.sbp - treatment.sbpReduction)} mmHg</strong></span>
            </div>
          </div>

          {/* SGLT2i / GLP-1 RA */}
          <label className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            treatment.glp1sglt2
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
              : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold block">SGLT2i / GLP-1 RA Therapy</span>
              <input
                id="chk-glp1-sglt2"
                type="checkbox"
                checked={treatment.glp1sglt2}
                onChange={(e) => updateTreatment("glp1sglt2", e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-emerald-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <span className="text-[10px] opacity-80 mt-1">
              Empagliflozin / Semaglutide · Cardiorenal & MACE protection (SELECT/EMPA-REG)
            </span>
          </label>

          {/* Aspirin */}
          <label className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            treatment.aspirin
              ? "bg-blue-500/15 border-blue-500/40 text-blue-200"
              : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold block">Low-Dose Aspirin (81 mg)</span>
              <input
                id="chk-aspirin"
                type="checkbox"
                checked={treatment.aspirin}
                onChange={(e) => updateTreatment("aspirin", e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-blue-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <span className="text-[10px] opacity-80 mt-1">
              Antiplatelet therapy · Recommended for secondary prevention or CAC ≥ 100
            </span>
          </label>
        </div>
      </div>

      {/* 3. Lifestyle & Behavioral Levers */}
      <div className="space-y-3 pt-2 border-t border-slate-800/60">
        <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Salad className="w-3.5 h-3.5 text-emerald-400" />
          3. Lifestyle & Behavioral Optimization
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Dietary Pattern */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90">
            <label className="text-[11px] font-medium text-slate-400 block mb-1">
              Nutritional Framework
            </label>
            <select
              id="select-diet-pattern"
              value={treatment.diet}
              onChange={(e) => updateTreatment("diet", e.target.value as DietPattern)}
              className="w-full bg-slate-900 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="standard">Standard Western Diet (No change)</option>
              <option value="mediterranean">Mediterranean Diet (-10% LDL, PREDIMED)</option>
              <option value="dash">DASH Diet (-10% LDL, -8 mmHg SBP)</option>
              <option value="low_carb_plant">Plant-Forward Cardiometabolic</option>
            </select>
          </div>

          {/* Physical Activity */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90">
            <label className="text-[11px] font-medium text-slate-400 block mb-1">
              Exercise Prescription
            </label>
            <select
              id="select-exercise-level"
              value={treatment.exerciseLevel}
              onChange={(e) => updateTreatment("exerciseLevel", e.target.value as ExerciseLevel)}
              className="w-full bg-slate-900 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="sedentary">Sedentary (&lt;30 min/wk)</option>
              <option value="light">Light Activity (75 min/wk)</option>
              <option value="moderate">Moderate Aerobic (150 min/wk - GDMT)</option>
              <option value="vigorous">Vigorous / High Volume (300+ min/wk)</option>
            </select>
          </div>

          {/* Smoking Cessation (if current smoker) */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
            baseline.smoker === "current"
              ? treatment.smokingCessation
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                : "bg-rose-950/30 border-rose-500/40 text-rose-300"
              : "bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold block">Smoking Cessation</span>
              <input
                id="chk-smoking-cessation"
                type="checkbox"
                disabled={baseline.smoker !== "current"}
                checked={treatment.smokingCessation}
                onChange={(e) => updateTreatment("smokingCessation", e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-emerald-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <span className="text-[10px] mt-1">
              {baseline.smoker === "current" ? (
                treatment.smokingCessation ? "✓ Cessation active: -35% relative ASCVD drop" : "⚠️ Active smoking carries massive risk multiplier"
              ) : (
                "Patient is a non-smoker"
              )}
            </span>
          </div>

          {/* Target Weight Loss */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90 space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-medium text-slate-400">Target Weight Loss</label>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {treatment.weightLossPercent}%
              </span>
            </div>
            <input
              id="range-weight-loss"
              type="range"
              min={0}
              max={15}
              step={1}
              value={treatment.weightLossPercent}
              onChange={(e) => updateTreatment("weightLossPercent", Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-[10px] text-slate-400 block">
              Target: <strong className="text-white font-mono">{(baseline.weight * (1 - treatment.weightLossPercent / 100)).toFixed(1)} kg</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
