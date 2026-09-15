import React from "react";
import { PatientBiomarkers, CalculatedRisk, UnitSystem } from "../types/cardio";
import {
  Heart,
  TrendingDown,
  Clock,
  ShieldCheck,
  Zap,
  Activity,
  AlertCircle,
  Award,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface DigitalTwinHeroProps {
  baseline: PatientBiomarkers;
  riskBaseline: CalculatedRisk;
  riskCounterfactual: CalculatedRisk;
  unitSystem: UnitSystem;
}

export const DigitalTwinHero: React.FC<DigitalTwinHeroProps> = ({
  baseline,
  riskBaseline,
  riskCounterfactual,
  unitSystem,
}) => {
  const displayVal = (valMgDl: number) => {
    return unitSystem === "mmoll" ? (valMgDl / 38.67).toFixed(1) : Math.round(valMgDl);
  };

  const getRiskBadgeColor = (category: string) => {
    if (category.includes("Low")) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    if (category.includes("Borderline")) return "bg-teal-500/20 text-teal-300 border-teal-500/30";
    if (category.includes("Intermediate")) return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    if (category.includes("High")) return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    return "bg-rose-500/20 text-rose-300 border-rose-500/30";
  };

  const getRiskScoreColor = (risk: number) => {
    if (risk < 5) return "text-emerald-400";
    if (risk < 7.5) return "text-teal-400";
    if (risk < 20) return "text-amber-400";
    if (risk < 30) return "text-orange-400";
    return "text-rose-400";
  };

  const isSignificantImprovement = riskBaseline.tenYearRisk - riskCounterfactual.tenYearRisk > 2.0;

  return (
    <div className="space-y-4">
      {/* Top Clinical Payoff Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Absolute Risk Reduction */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 p-3.5 rounded-2xl border border-emerald-500/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Absolute Risk Drop (ARR)</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-extrabold text-emerald-400">
              -{riskCounterfactual.arr > 0 ? riskCounterfactual.arr : "0.0"}%
            </span>
            <span className="text-[11px] text-emerald-400/80 font-medium">10y MACE</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Relative reduction: <strong className="text-emerald-300 font-mono">-{riskCounterfactual.rrr}%</strong>
          </div>
        </div>

        {/* Number Needed to Treat (NNT) */}
        <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 p-3.5 rounded-2xl border border-cyan-500/30 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>10-Yr NNT</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-extrabold text-cyan-300">
              {riskCounterfactual.nnt < 500 ? riskCounterfactual.nnt : "—"}
            </span>
            <span className="text-[11px] text-cyan-300/80 font-medium">Patients</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            To prevent 1 primary MACE event
          </div>
        </div>

        {/* Biological Life-Years Gained */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 p-3.5 rounded-2xl border border-indigo-500/30 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Healthspan Extension</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-extrabold text-indigo-300">
              +{riskCounterfactual.yearsGained > 0 ? riskCounterfactual.yearsGained : "0.0"}
            </span>
            <span className="text-[11px] text-indigo-300/80 font-medium">Years</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Cardiovascular event-free gain
          </div>
        </div>

        {/* Projected LDL Target Achievement */}
        <div className="bg-gradient-to-br from-violet-950/40 via-slate-900 to-slate-950 p-3.5 rounded-2xl border border-violet-500/30 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Simulated LDL Target</span>
            <Award className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-extrabold text-violet-300">
              {displayVal(riskCounterfactual.projectedLDL)}
            </span>
            <span className="text-[11px] text-violet-300/80 font-medium">{unitSystem}</span>
          </div>
          <div className="mt-1 text-[11px] font-medium flex items-center gap-1">
            {riskCounterfactual.projectedLDL < 55 ? (
              <span className="text-emerald-400 font-semibold">✓ Meets &lt;55 mg/dL Very High Target</span>
            ) : riskCounterfactual.projectedLDL < 70 ? (
              <span className="text-teal-400 font-semibold">✓ Meets &lt;70 mg/dL High Target</span>
            ) : (
              <span className="text-amber-400 font-semibold">⚠️ Suboptimal Target (&gt;70 mg/dL)</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Digital Twin Dual Comparison Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Baseline Digital Twin Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-4"></span>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  Baseline Patient Twin
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Current Untreated / As-Is State
                  </span>
                </h3>
              </div>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getRiskBadgeColor(riskBaseline.riskCategory)}`}>
              {riskBaseline.riskCategory}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* 10-Year ASCVD Risk Score */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                10-Year ASCVD Risk
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`text-3xl font-mono font-black ${getRiskScoreColor(riskBaseline.tenYearRisk)}`}>
                  {riskBaseline.tenYearRisk.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400">PCE/PREVENT</span>
              </div>
              <div className="mt-1.5 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (riskBaseline.tenYearRisk / 40) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Vascular Biological Age */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Vascular Biological Age
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-mono font-black text-rose-300">
                  {riskBaseline.vascularAge}
                </span>
                <span className="text-xs text-slate-400">yrs</span>
              </div>
              <div className="text-[11px] font-medium text-rose-400 mt-1">
                {riskBaseline.vascularAgeDelta > 0 ? (
                  <span>+{riskBaseline.vascularAgeDelta} yrs older than chronological ({baseline.age}y)</span>
                ) : (
                  <span>Aligned with chronological age ({baseline.age}y)</span>
                )}
              </div>
            </div>
          </div>

          {/* Biomarkers & Specific Event Probabilities */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">10y MI (Heart Attack)</span>
                <strong className="text-rose-300 font-mono font-bold">{riskBaseline.miProb}%</strong>
              </div>
              <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">10y Ischemic Stroke</span>
                <strong className="text-amber-300 font-mono font-bold">{riskBaseline.strokeProb}%</strong>
              </div>
              <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">10y Heart Failure</span>
                <strong className="text-cyan-300 font-mono font-bold">{riskBaseline.hfProb}%</strong>
              </div>
              <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">10y CV Mortality</span>
                <strong className="text-purple-300 font-mono font-bold">{riskBaseline.cvDeathProb}%</strong>
              </div>
            </div>

            {/* Phenotype & Plaque Burden Status */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Lipid Phenotype
                </span>
                <span className="font-semibold text-white">{riskBaseline.hyperlipidemiaPhenotype}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Coronary Plaque Index
                </span>
                <span className="font-mono font-bold text-amber-300">{riskBaseline.plaqueIndex}/100 ({riskBaseline.plaqueSeverity})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Counterfactual Simulated Twin Card */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <div>
                <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  Simulated Counterfactual Twin
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Active Interventions
                  </span>
                </h3>
              </div>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getRiskBadgeColor(riskCounterfactual.riskCategory)}`}>
              {riskCounterfactual.riskCategory}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Simulated 10-Year ASCVD Risk */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-cyan-500/30 shadow-inner">
              <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center justify-between">
                <span>Simulated 10-Yr Risk</span>
                {isSignificantImprovement && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                    -{riskCounterfactual.arr}% ARR
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`text-3xl font-mono font-black ${getRiskScoreColor(riskCounterfactual.tenYearRisk)}`}>
                  {riskCounterfactual.tenYearRisk.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400">PCE/PREVENT</span>
              </div>
              <div className="mt-1.5 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (riskCounterfactual.tenYearRisk / 40) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Simulated Vascular Age */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-cyan-500/30">
              <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center justify-between">
                <span>Rejuvenated Vascular Age</span>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-mono font-black text-emerald-400">
                  {riskCounterfactual.vascularAge}
                </span>
                <span className="text-xs text-slate-400">yrs</span>
                {riskBaseline.vascularAge > riskCounterfactual.vascularAge && (
                  <span className="text-xs font-bold text-emerald-400 ml-auto">
                    -{riskBaseline.vascularAge - riskCounterfactual.vascularAge} yrs
                  </span>
                )}
              </div>
              <div className="text-[11px] font-medium text-emerald-400 mt-1">
                Vascular age rollback under GDMT
              </div>
            </div>
          </div>

          {/* Simulated Specific Event Probabilities */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-slate-950/70 p-2 rounded-lg border border-cyan-900/40">
                <span className="text-[10px] text-slate-400 block">Simulated MI</span>
                <strong className="text-emerald-300 font-mono font-bold">{riskCounterfactual.miProb}%</strong>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-lg border border-cyan-900/40">
                <span className="text-[10px] text-slate-400 block">Simulated Stroke</span>
                <strong className="text-emerald-300 font-mono font-bold">{riskCounterfactual.strokeProb}%</strong>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-lg border border-cyan-900/40">
                <span className="text-[10px] text-slate-400 block">Simulated HF</span>
                <strong className="text-cyan-300 font-mono font-bold">{riskCounterfactual.hfProb}%</strong>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-lg border border-cyan-900/40">
                <span className="text-[10px] text-slate-400 block">Simulated CV Death</span>
                <strong className="text-indigo-300 font-mono font-bold">{riskCounterfactual.cvDeathProb}%</strong>
              </div>
            </div>

            {/* Target Biomarkers Achieved */}
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-cyan-900/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Projected LDL:</span>
                <span className="font-mono font-bold text-emerald-300">
                  {displayVal(riskCounterfactual.projectedLDL)} {unitSystem}
                </span>
                <span className="text-slate-500 line-through text-[10px]">
                  {displayVal(baseline.ldl)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Projected SBP:</span>
                <span className="font-mono font-bold text-emerald-300">
                  {riskCounterfactual.projectedSBP} mmHg
                </span>
                <span className="text-slate-500 line-through text-[10px]">
                  {baseline.sbp}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
