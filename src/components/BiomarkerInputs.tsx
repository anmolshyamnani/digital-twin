import React, { useState } from "react";
import {
  PatientBiomarkers,
  Sex,
  Race,
  SmokerStatus,
  UnitSystem,
} from "../types/cardio";
import {
  Activity,
  Heart,
  Droplet,
  Flame,
  Scale,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap,
} from "lucide-react";

interface BiomarkerInputsProps {
  patient: PatientBiomarkers;
  onChange: (updated: PatientBiomarkers) => void;
  unitSystem: UnitSystem;
}

export const BiomarkerInputs: React.FC<BiomarkerInputsProps> = ({
  patient,
  onChange,
  unitSystem,
}) => {
  // Conversion factors: 1 mmol/L Chol = 38.67 mg/dL, 1 mmol/L TG = 88.57 mg/dL
  const cholFactor = unitSystem === "mmoll" ? 38.67 : 1;
  const tgFactor = unitSystem === "mmoll" ? 88.57 : 1;

  const displayChol = (valMgDl: number) => {
    return unitSystem === "mmoll" ? (valMgDl / 38.67).toFixed(1) : Math.round(valMgDl);
  };

  const handleCholInput = (field: "totalChol" | "ldl" | "hdl", inputVal: number) => {
    const rawVal = unitSystem === "mmoll" ? Math.round(inputVal * 38.67) : Math.round(inputVal);
    updateField(field, rawVal);
  };

  const handleTGInput = (inputVal: number) => {
    const rawVal = unitSystem === "mmoll" ? Math.round(inputVal * 88.57) : Math.round(inputVal);
    updateField("triglycerides", rawVal);
  };

  const updateField = <K extends keyof PatientBiomarkers>(
    key: K,
    val: PatientBiomarkers[K]
  ) => {
    const updated = { ...patient, [key]: val };

    // Auto-recalculate BMI if height or weight changed
    if (key === "height" || key === "weight") {
      const hM = updated.height / 100;
      if (hM > 0) {
        updated.bmi = Number((updated.weight / (hM * hM)).toFixed(1));
      }
    }

    onChange(updated);
  };

  const nonHDL = Math.max(0, patient.totalChol - patient.hdl);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-lg space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Patient Biomarkers & Clinical Phenotype
            </h2>
            <p className="text-[11px] text-slate-400">
              Input patient-specific lab metrics, hemodynamics, and imaging
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          ID: {patient.id}
        </span>
      </div>

      {/* 1. Demographics & Risk Enhancers */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          1. Demographics & Atherosclerotic History
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Age */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-medium text-slate-400">Age</label>
              <span className="text-xs font-mono font-bold text-white">{patient.age} yrs</span>
            </div>
            <input
              id="input-patient-age"
              type="range"
              min={25}
              max={88}
              value={patient.age}
              onChange={(e) => updateField("age", Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Sex */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90">
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Biological Sex</label>
            <div className="grid grid-cols-2 gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                id="btn-sex-male"
                type="button"
                onClick={() => updateField("sex", "male")}
                className={`py-1 text-xs font-semibold rounded-md transition-all ${
                  patient.sex === "male"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Male
              </button>
              <button
                id="btn-sex-female"
                type="button"
                onClick={() => updateField("sex", "female")}
                className={`py-1 text-xs font-semibold rounded-md transition-all ${
                  patient.sex === "female"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Female
              </button>
            </div>
          </div>

          {/* Race / PCE Population */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90">
            <label className="text-[11px] font-medium text-slate-400 block mb-1">PCE Population Cohort</label>
            <select
              id="select-patient-race"
              value={patient.race}
              onChange={(e) => updateField("race", e.target.value as Race)}
              className="w-full bg-slate-900 text-slate-200 text-xs font-medium rounded-lg px-2 py-1 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="white">White / Other</option>
              <option value="african_american">African American</option>
              <option value="hispanic">Hispanic / Latino</option>
              <option value="asian">South / East Asian</option>
            </select>
          </div>

          {/* Smoking Status */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90">
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Smoking Exposure</label>
            <select
              id="select-patient-smoker"
              value={patient.smoker}
              onChange={(e) => updateField("smoker", e.target.value as SmokerStatus)}
              className={`w-full text-xs font-medium rounded-lg px-2 py-1 border focus:outline-none focus:ring-1 ${
                patient.smoker === "current"
                  ? "bg-rose-950/40 text-rose-300 border-rose-500/40 focus:ring-rose-500"
                  : "bg-slate-900 text-slate-200 border-slate-800 focus:ring-cyan-500"
              }`}
            >
              <option value="never">Never Smoked</option>
              <option value="former">Former Smoker</option>
              <option value="current">Current Smoker (High Risk)</option>
            </select>
          </div>
        </div>

        {/* Binary High-Risk Checkbox Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
            patient.familyHistoryCAD
              ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
              : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}>
            <input
              id="chk-family-cad"
              type="checkbox"
              checked={patient.familyHistoryCAD}
              onChange={(e) => updateField("familyHistoryCAD", e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-semibold block">Premature Family CAD</span>
              <span className="text-[10px] opacity-75">1st-deg relative &lt;55M/&lt;65F</span>
            </div>
          </label>

          <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
            patient.priorASCVD
              ? "bg-rose-500/15 border-rose-500/40 text-rose-200"
              : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}>
            <input
              id="chk-prior-ascvd"
              type="checkbox"
              checked={patient.priorASCVD}
              onChange={(e) => updateField("priorASCVD", e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-semibold block">Prior ASCVD (Secondary)</span>
              <span className="text-[10px] opacity-75">History of MI, Stent, CABG, Stroke</span>
            </div>
          </label>

          <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
            patient.statinIntolerant
              ? "bg-purple-500/15 border-purple-500/40 text-purple-200"
              : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}>
            <input
              id="chk-statin-intolerant"
              type="checkbox"
              checked={patient.statinIntolerant}
              onChange={(e) => updateField("statinIntolerant", e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-purple-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-semibold block">Statin Intolerance / SAMS</span>
              <span className="text-[10px] opacity-75">Myalgias / CK elevation on ≥2 statins</span>
            </div>
          </label>
        </div>
      </div>

      {/* 2. Comprehensive Lipid Panel */}
      <div className="space-y-3 pt-2 border-t border-slate-800/60">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            2. Atherogenic Lipid & Apolipoprotein Panel
          </h3>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-slate-400">Non-HDL:</span>
            <span className={`font-bold px-1.5 py-0.5 rounded ${
              nonHDL >= 160 ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-slate-800 text-cyan-300"
            }`}>
              {displayChol(nonHDL)} {unitSystem}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total Cholesterol */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90">
            <label className="text-[11px] font-medium text-slate-400 block mb-1">
              Total Cholesterol
            </label>
            <div className="flex items-center gap-1">
              <input
                id="input-total-chol"
                type="number"
                step={unitSystem === "mmoll" ? 0.1 : 1}
                value={displayChol(patient.totalChol)}
                onChange={(e) => handleCholInput("totalChol", parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 text-white font-mono font-bold text-sm rounded-lg px-2 py-1 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <span className="text-[10px] text-slate-500">{unitSystem}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {patient.totalChol >= 240 ? "⚠️ High (≥240)" : patient.totalChol >= 200 ? "Borderline (200-239)" : "Desirable (<200)"}
            </span>
          </div>

          {/* LDL-C */}
          <div className={`p-2.5 rounded-xl border ${
            patient.ldl >= 190
              ? "bg-rose-950/30 border-rose-500/50"
              : patient.ldl >= 160
              ? "bg-amber-950/20 border-amber-500/40"
              : "bg-slate-950/60 border-slate-800/90"
          }`}>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-rose-300">LDL-C (Direct)</label>
              {patient.ldl >= 190 && (
                <span className="text-[9px] font-bold px-1 rounded bg-rose-500 text-white">HeFH</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <input
                id="input-ldl"
                type="number"
                step={unitSystem === "mmoll" ? 0.1 : 1}
                value={displayChol(patient.ldl)}
                onChange={(e) => handleCholInput("ldl", parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 text-rose-200 font-mono font-bold text-sm rounded-lg px-2 py-1 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <span className="text-[10px] text-slate-500">{unitSystem}</span>
            </div>
            <span className="text-[10px] font-medium text-rose-400/90 block mt-1">
              {patient.ldl >= 190 ? "Extreme Tier (≥190)" : patient.ldl >= 160 ? "High (160-189)" : patient.ldl >= 100 ? "Moderate (100-159)" : "Optimal (<100)"}
            </span>
          </div>

          {/* HDL-C */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90">
            <label className="text-[11px] font-medium text-slate-400 block mb-1">HDL-C (Protective)</label>
            <div className="flex items-center gap-1">
              <input
                id="input-hdl"
                type="number"
                step={unitSystem === "mmoll" ? 0.1 : 1}
                value={displayChol(patient.hdl)}
                onChange={(e) => handleCholInput("hdl", parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 text-cyan-200 font-mono font-bold text-sm rounded-lg px-2 py-1 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <span className="text-[10px] text-slate-500">{unitSystem}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {patient.hdl < 40 ? "⚠️ Low (<40 mg/dL)" : "Optimal (≥50 mg/dL)"}
            </span>
          </div>

          {/* Triglycerides */}
          <div className={`p-2.5 rounded-xl border ${
            patient.triglycerides >= 500
              ? "bg-red-950/40 border-red-500/60"
              : patient.triglycerides >= 200
              ? "bg-amber-950/20 border-amber-500/40"
              : "bg-slate-950/60 border-slate-800/90"
          }`}>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Triglycerides</label>
            <div className="flex items-center gap-1">
              <input
                id="input-triglycerides"
                type="number"
                step={unitSystem === "mmoll" ? 0.1 : 1}
                value={unitSystem === "mmoll" ? (patient.triglycerides / 88.57).toFixed(1) : patient.triglycerides}
                onChange={(e) => handleTGInput(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 text-white font-mono font-bold text-sm rounded-lg px-2 py-1 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <span className="text-[10px] text-slate-500">{unitSystem}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {patient.triglycerides >= 500 ? "🚨 Severe (Pancreatitis)" : patient.triglycerides >= 200 ? "High (200-499)" : "Normal (<150)"}
            </span>
          </div>

          {/* Lp(a) */}
          <div className={`p-2.5 rounded-xl border ${
            (patient.lpa || 0) > 125
              ? "bg-rose-950/30 border-rose-500/40"
              : "bg-slate-950/60 border-slate-800/90"
          }`}>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-medium text-slate-300">Lp(a)</label>
              {(patient.lpa || 0) > 125 && (
                <span className="text-[9px] font-bold text-rose-400">Risk Gen+</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <input
                id="input-lpa"
                type="number"
                placeholder="N/A"
                value={patient.lpa || ""}
                onChange={(e) => updateField("lpa", e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full bg-slate-900 text-white font-mono font-bold text-sm rounded-lg px-2 py-1 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <span className="text-[10px] text-slate-500">nmol/L</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {(patient.lpa || 0) > 125 ? "⚠️ High Gen Risk (>125)" : "Normal (<75)"}
            </span>
          </div>

          {/* ApoB */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90">
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Apolipoprotein B</label>
            <div className="flex items-center gap-1">
              <input
                id="input-apob"
                type="number"
                placeholder="N/A"
                value={patient.apoB || ""}
                onChange={(e) => updateField("apoB", e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full bg-slate-900 text-white font-mono font-bold text-sm rounded-lg px-2 py-1 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <span className="text-[10px] text-slate-500">mg/dL</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {(patient.apoB || 0) > 130 ? "⚠️ High Particle Count" : "Target (<90)"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Hemodynamics & Blood Pressure */}
      <div className="space-y-3 pt-2 border-t border-slate-800/60">
        <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          3. Hemodynamics & Arterial Pressure
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Systolic BP */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-medium text-slate-400">Systolic BP</label>
              <span className="text-xs font-mono font-bold text-amber-300">{patient.sbp} mmHg</span>
            </div>
            <input
              id="range-patient-sbp"
              type="range"
              min={90}
              max={210}
              value={patient.sbp}
              onChange={(e) => updateField("sbp", Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              {patient.sbp >= 140 ? "⚠️ Stage 2 HTN (≥140)" : patient.sbp >= 130 ? "Stage 1 HTN (130-139)" : patient.sbp >= 120 ? "Elevated (120-129)" : "Normal (<120)"}
            </span>
          </div>

          {/* Diastolic BP */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-medium text-slate-400">Diastolic BP</label>
              <span className="text-xs font-mono font-bold text-white">{patient.dbp} mmHg</span>
            </div>
            <input
              id="range-patient-dbp"
              type="range"
              min={55}
              max={120}
              value={patient.dbp}
              onChange={(e) => updateField("dbp", Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              Pulse Pressure: <strong className="font-mono text-slate-300">{patient.sbp - patient.dbp} mmHg</strong>
            </span>
          </div>

          {/* Treated BP Meds */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90 flex flex-col justify-between">
            <label className="text-[11px] font-medium text-slate-400 block">Antihypertensive Rx</label>
            <div className="flex items-center gap-2 mt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="chk-bp-meds"
                  type="checkbox"
                  checked={patient.onBPMeds}
                  onChange={(e) => updateField("onBPMeds", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                <span className="ml-2 text-xs font-medium text-slate-300">
                  {patient.onBPMeds ? "Currently on Meds" : "Untreated BP"}
                </span>
              </label>
            </div>
          </div>

          {/* Resting Heart Rate */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-medium text-slate-400">Resting Heart Rate</label>
              <span className="text-xs font-mono font-bold text-white">{patient.restingHR} bpm</span>
            </div>
            <input
              id="range-patient-hr"
              type="range"
              min={48}
              max={110}
              value={patient.restingHR}
              onChange={(e) => updateField("restingHR", Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
            />
          </div>
        </div>
      </div>

      {/* 4. Metabolic, Renal & Subclinical Imaging */}
      <div className="space-y-3 pt-2 border-t border-slate-800/60">
        <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          4. Glycemic, Renal & Subclinical Plaque (CAC Score)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* CAC Score */}
          <div className={`p-2.5 rounded-xl border col-span-2 sm:col-span-1 lg:col-span-1 ${
            patient.cac >= 400
              ? "bg-rose-950/40 border-rose-500/50"
              : patient.cac >= 100
              ? "bg-amber-950/30 border-amber-500/40"
              : "bg-slate-950/60 border-slate-800/90"
          }`}>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-200">CAC Score (Agatston)</label>
              <span className="text-xs font-mono font-bold text-cyan-300">{patient.cac}</span>
            </div>
            <input
              id="range-patient-cac"
              type="range"
              min={0}
              max={1200}
              step={10}
              value={patient.cac}
              onChange={(e) => updateField("cac", Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-[10px] font-medium text-slate-400 block mt-1">
              {patient.cac === 0 ? "0 (Zero Plaque)" : patient.cac < 100 ? "1-99 (Mild Plaque)" : patient.cac < 400 ? "100-399 (Moderate Plaque)" : "≥400 (Extensive Calcification)"}
            </span>
          </div>

          {/* Fasting Glucose / Diabetes */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-medium text-slate-400">Glucose / HbA1c</label>
              <label className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold cursor-pointer">
                <input
                  id="chk-diabetes"
                  type="checkbox"
                  checked={patient.diabetes}
                  onChange={(e) => updateField("diabetes", e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 w-3 h-3 cursor-pointer"
                />
                T2D
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="input-glucose"
                type="number"
                value={patient.glucose}
                onChange={(e) => updateField("glucose", Number(e.target.value))}
                className="w-1/2 bg-slate-900 text-white font-mono font-bold text-xs rounded-lg px-2 py-1 border border-slate-800 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">mg/dL</span>
              <input
                id="input-hba1c"
                type="number"
                step="0.1"
                value={patient.hba1c}
                onChange={(e) => updateField("hba1c", Number(e.target.value))}
                className="w-1/2 bg-slate-900 text-white font-mono font-bold text-xs rounded-lg px-2 py-1 border border-slate-800 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">%</span>
            </div>
          </div>

          {/* eGFR (Kidney Function) */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-medium text-slate-400">eGFR (CKD)</label>
              <span className="text-xs font-mono font-bold text-white">{patient.egfr}</span>
            </div>
            <input
              id="range-patient-egfr"
              type="range"
              min={15}
              max={120}
              value={patient.egfr}
              onChange={(e) => updateField("egfr", Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              {patient.egfr < 60 ? "⚠️ CKD Stage 3+ (<60)" : "Normal Renal Function (≥90)"}
            </span>
          </div>

          {/* Urine Albumin/Cr */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90">
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Urine ACR (uACR)</label>
            <div className="flex items-center gap-1">
              <input
                id="input-uacr"
                type="number"
                value={patient.uacr}
                onChange={(e) => updateField("uacr", Number(e.target.value))}
                className="w-full bg-slate-900 text-white font-mono font-bold text-xs rounded-lg px-2 py-1 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <span className="text-[10px] text-slate-500">mg/g</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {patient.uacr > 30 ? "⚠️ Albuminuria (>30)" : "Normoalbuminuria (<30)"}
            </span>
          </div>

          {/* BMI / Anthropometrics */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-medium text-slate-400">BMI Calculator</label>
              <span className="text-xs font-mono font-bold text-cyan-300">{patient.bmi} kg/m²</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                id="input-height"
                type="number"
                placeholder="Ht cm"
                value={patient.height}
                onChange={(e) => updateField("height", Number(e.target.value))}
                className="w-1/2 bg-slate-900 text-white font-mono text-xs rounded-lg px-1.5 py-1 border border-slate-800"
              />
              <input
                id="input-weight"
                type="number"
                placeholder="Wt kg"
                value={patient.weight}
                onChange={(e) => updateField("weight", Number(e.target.value))}
                className="w-1/2 bg-slate-900 text-white font-mono text-xs rounded-lg px-1.5 py-1 border border-slate-800"
              />
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {patient.bmi >= 30 ? "Obese (≥30)" : patient.bmi >= 25 ? "Overweight (25-29.9)" : "Normal (18.5-24.9)"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
