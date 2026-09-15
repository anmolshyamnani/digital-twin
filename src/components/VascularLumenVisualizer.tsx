import React, { useState } from "react";
import { CalculatedRisk, PatientBiomarkers } from "../types/cardio";
import { Eye, Layers, Activity, Sparkles, Shield, AlertTriangle } from "lucide-react";

interface VascularLumenVisualizerProps {
  baseline: PatientBiomarkers;
  riskBaseline: CalculatedRisk;
  riskCounterfactual: CalculatedRisk;
}

export const VascularLumenVisualizer: React.FC<VascularLumenVisualizerProps> = ({
  baseline,
  riskBaseline,
  riskCounterfactual,
}) => {
  const [viewMode, setViewMode] = useState<"cross_section" | "longitudinal">("cross_section");
  const [showLipidCore, setShowLipidCore] = useState(true);
  const [showCalcium, setShowCalcium] = useState(true);
  const [showFlowStreamlines, setShowFlowStreamlines] = useState(true);

  // Baseline stenosis & plaque geometry
  const baseStenosis = riskBaseline.lumenStenosisPercent;
  const simStenosis = riskCounterfactual.lumenStenosisPercent;

  // Outer radius is 90px
  const outerR = 90;
  const baseLumenR = Math.max(25, outerR * Math.sqrt(1 - baseStenosis / 100));
  const simLumenR = Math.max(35, outerR * Math.sqrt(1 - simStenosis / 100));

  // Area & Flow Calculations
  const areaGainPercent = riskCounterfactual.lumenAreaMm2 && riskBaseline.lumenAreaMm2
    ? Math.round(((riskCounterfactual.lumenAreaMm2 - riskBaseline.lumenAreaMm2) / riskBaseline.lumenAreaMm2) * 100)
    : 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              In Silico Coronary Artery & Plaque Remodeling
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive histological simulation of endothelial lumen patency & atheroma architecture
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode("cross_section")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === "cross_section"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Lumen Cross-Section
          </button>
          <button
            type="button"
            onClick={() => setViewMode("longitudinal")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === "longitudinal"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Longitudinal Flow
          </button>
        </div>
      </div>

      {/* Live Biophysical Parameter HUD Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Patent Lumen Area
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-sm font-mono font-bold text-rose-400">{riskBaseline.lumenAreaMm2}</span>
            <span className="text-xs text-slate-500">→</span>
            <span className="text-base font-mono font-extrabold text-cyan-300">{riskCounterfactual.lumenAreaMm2}</span>
            <span className="text-[10px] text-slate-400">mm²</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400">
            {areaGainPercent > 0 ? `+${areaGainPercent}% Lumen Gain` : "Unchanged"}
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Coronary Perfusion Flow
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-sm font-mono font-bold text-slate-400">1.00×</span>
            <span className="text-xs text-slate-500">→</span>
            <span className="text-base font-mono font-extrabold text-emerald-400">
              {riskCounterfactual.coronaryPerfusionIndex || 1.0}×
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Poiseuille Q Flow Index</span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Fibrous Cap Thickness
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-sm font-mono font-bold text-amber-300">{riskBaseline.fibrousCapThicknessUm}</span>
            <span className="text-xs text-slate-500">→</span>
            <span className="text-base font-mono font-extrabold text-cyan-300">
              {riskCounterfactual.fibrousCapThicknessUm}
            </span>
            <span className="text-[10px] text-slate-400">µm</span>
          </div>
          <span className={`text-[10px] font-semibold ${
            riskCounterfactual.fibrousCapThicknessUm >= 120 ? "text-emerald-400" : "text-amber-400"
          }`}>
            {riskCounterfactual.fibrousCapThicknessUm >= 120 ? "✓ Stabilized Thick Cap" : "Vulnerable Thin Cap"}
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Lumen Stenosis Δ
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-sm font-mono font-bold text-rose-400">{baseStenosis}%</span>
            <span className="text-xs text-slate-500">→</span>
            <span className="text-base font-mono font-extrabold text-emerald-300">{simStenosis}%</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400">
            -{baseStenosis - simStenosis}% Stenosis Drop
          </span>
        </div>
      </div>

      {/* Layer Visibility Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" /> Histology Layers:
          </span>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showLipidCore}
              onChange={(e) => setShowLipidCore(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              Necrotic Lipid Core
            </span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showCalcium}
              onChange={(e) => setShowCalcium(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-slate-200 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block"></span>
              Calcified Nodules (CAC)
            </span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showFlowStreamlines}
              onChange={(e) => setShowFlowStreamlines(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-rose-500 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              Laminar Blood Flow
            </span>
          </label>
        </div>
      </div>

      {/* Main Visual Rendering Canvas */}
      {viewMode === "cross_section" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Baseline Cross Section */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Baseline Artery (Stenosis: {baseStenosis}%)
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950/50 text-rose-300 border border-rose-500/30">
                {100 - baseStenosis}% Patent Lumen
              </span>
            </div>

            <div className="relative flex items-center justify-center p-4">
              <svg width="240" height="240" viewBox="0 0 240 240" className="overflow-visible">
                <defs>
                  <radialGradient id="arteryWallGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="85%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </radialGradient>
                  <radialGradient id="lipidCoreGrad" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="60%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#ca8a04" />
                  </radialGradient>
                  <radialGradient id="bloodFlowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                    <stop offset="80%" stopColor="#be123c" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#881337" stopOpacity="0.6" />
                  </radialGradient>
                </defs>

                {/* Tunica Adventitia (Outer Border) */}
                <circle cx="120" cy="120" r="105" fill="none" stroke="#475569" strokeWidth="4" strokeDasharray="3 3" />
                
                {/* Tunica Media & Adventitia Vessel Wall */}
                <circle cx="120" cy="120" r={outerR} fill="url(#arteryWallGrad)" stroke="#64748b" strokeWidth="6" />

                {/* Atheroma / Lipid-rich necrotic core */}
                {showLipidCore && (
                  <path
                    d={`M ${120 - outerR + 6} 120 A ${outerR - 6} ${outerR - 6} 0 0 1 ${120 + outerR - 6} 120 Q 120 ${120 + baseLumenR * 0.4} ${120 - outerR + 6} 120 Z`}
                    fill="url(#lipidCoreGrad)"
                    opacity="0.9"
                  />
                )}

                {/* Fibrous Cap overlay */}
                <path
                  d={`M ${120 - outerR + 12} 120 Q 120 ${120 + baseLumenR * 0.4} ${120 + outerR - 12} 120`}
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="3.5"
                  opacity="0.8"
                />

                {/* Calcified Nodules based on CAC */}
                {showCalcium && baseline.cac > 0 && (
                  <g>
                    <circle cx="80" cy="140" r={Math.min(10, 3 + Math.sqrt(baseline.cac) * 0.3)} fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
                    <circle cx="150" cy="145" r={Math.min(9, 2 + Math.sqrt(baseline.cac) * 0.25)} fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
                    {baseline.cac > 200 && (
                      <circle cx="115" cy="165" r="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
                    )}
                  </g>
                )}

                {/* Patent Blood Flow Lumen */}
                <circle
                  cx="120"
                  cy={120 - (outerR - baseLumenR) * 0.45}
                  r={baseLumenR}
                  fill="url(#bloodFlowGrad)"
                  stroke="#fb7185"
                  strokeWidth="2.5"
                />

                {/* Pulsing blood flow indicator */}
                {showFlowStreamlines && (
                  <g>
                    <circle
                      cx="120"
                      cy={120 - (outerR - baseLumenR) * 0.45}
                      r={baseLumenR * 0.6}
                      fill="none"
                      stroke="#fecdd3"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      className="animate-spin origin-[120px_90px]"
                    />
                    <circle
                      cx="120"
                      cy={120 - (outerR - baseLumenR) * 0.45}
                      r="4"
                      fill="#fff"
                    />
                  </g>
                )}
              </svg>
            </div>

            <div className="w-full text-center text-xs text-slate-400 mt-2 space-y-1">
              <div>Plaque Index: <strong className="text-amber-300 font-mono">{riskBaseline.plaqueIndex}/100</strong></div>
              <div className="text-[11px] text-rose-400 font-medium">⚠️ High endothelial wall shear stress & vulnerability</div>
            </div>
          </div>

          {/* Counterfactual Simulated Cross Section */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-cyan-500/30 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Simulated Remodeled Artery (Stenosis: {simStenosis}%)
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
                {100 - simStenosis}% Patent Lumen
              </span>
            </div>

            <div className="relative flex items-center justify-center p-4">
              <svg width="240" height="240" viewBox="0 0 240 240" className="overflow-visible">
                {/* Tunica Adventitia */}
                <circle cx="120" cy="120" r="105" fill="none" stroke="#0891b2" strokeWidth="3" strokeDasharray="4 4" opacity="0.6" />
                
                {/* Tunica Media & Vessel Wall */}
                <circle cx="120" cy="120" r={outerR} fill="url(#arteryWallGrad)" stroke="#0e7490" strokeWidth="6" />

                {/* Stabilized & Regressed Atheroma */}
                {showLipidCore && (
                  <path
                    d={`M ${120 - outerR + 6} 120 A ${outerR - 6} ${outerR - 6} 0 0 1 ${120 + outerR - 6} 120 Q 120 ${120 + simLumenR * 0.25} ${120 - outerR + 6} 120 Z`}
                    fill="url(#lipidCoreGrad)"
                    opacity="0.6"
                  />
                )}

                {/* Thickened, Stabilized Fibrous Cap (GLAGOV / ASTEROID trial response) */}
                <path
                  d={`M ${120 - outerR + 10} 120 Q 120 ${120 + simLumenR * 0.25} ${120 + outerR - 10} 120`}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="5"
                  opacity="0.95"
                />

                {/* Calcified inclusions (stabilized/healed) */}
                {showCalcium && baseline.cac > 0 && (
                  <g>
                    <circle cx="85" cy="135" r={Math.min(8, 2.5 + Math.sqrt(baseline.cac) * 0.2)} fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
                    <circle cx="145" cy="140" r={Math.min(7, 2 + Math.sqrt(baseline.cac) * 0.2)} fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
                  </g>
                )}

                {/* Expanded Patent Blood Flow Lumen */}
                <circle
                  cx="120"
                  cy={120 - (outerR - simLumenR) * 0.35}
                  r={simLumenR}
                  fill="url(#bloodFlowGrad)"
                  stroke="#38bdf8"
                  strokeWidth="3"
                />

                {/* Dynamic Flow Streamlines */}
                {showFlowStreamlines && (
                  <g>
                    <circle
                      cx="120"
                      cy={120 - (outerR - simLumenR) * 0.35}
                      r={simLumenR * 0.65}
                      fill="none"
                      stroke="#bae6fd"
                      strokeWidth="1.5"
                      strokeDasharray="5 5"
                      className="animate-spin origin-[120px_100px]"
                    />
                    <circle
                      cx="120"
                      cy={120 - (outerR - simLumenR) * 0.35}
                      r="5"
                      fill="#38bdf8"
                    />
                  </g>
                )}
              </svg>
            </div>

            <div className="w-full text-center text-xs text-slate-400 mt-2 space-y-1">
              <div>Stabilized Plaque Index: <strong className="text-emerald-400 font-mono">{riskCounterfactual.plaqueIndex}/100</strong></div>
              <div className="text-[11px] text-emerald-400 font-medium">✓ Plaque stabilization with thickened fibrous protective cap</div>
            </div>
          </div>
        </div>
      ) : (
        /* Longitudinal Flow View */
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Longitudinal Coronary Artery Hemodynamic Streamline
            </span>
            <span className="text-xs text-slate-400">
              Left Anterior Descending (LAD) model
            </span>
          </div>

          <div className="w-full max-w-2xl py-2">
            <svg viewBox="0 0 600 160" className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="longVesselWall" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="longPlaque" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#eab308" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#ca8a04" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Upper Vessel Wall */}
              <path d="M 10 20 L 590 20" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />

              {/* Lower Vessel Wall */}
              <path d="M 10 140 L 590 140" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />

              {/* Plaque Mountain on Lower Wall */}
              <path
                d={`M 150 140 Q 300 ${140 - baseStenosis * 0.9} 450 140 Z`}
                fill="url(#longPlaque)"
                stroke="#f1f5f9"
                strokeWidth="2.5"
              />

              {/* Counterfactual Plaque Regression Outline */}
              <path
                d={`M 170 140 Q 300 ${140 - simStenosis * 0.9} 430 140 Z`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Blood Flow Streamlines */}
              <path d="M 20 40 Q 300 40 580 40" stroke="#f43f5e" strokeWidth="2.5" opacity="0.8" />
              <path d="M 20 60 Q 300 50 580 60" stroke="#fb7185" strokeWidth="3" opacity="0.85" />
              <path
                d={`M 20 80 Q 300 ${80 - baseStenosis * 0.4} 580 80`}
                stroke="#fda4af"
                strokeWidth="3.5"
                opacity="0.9"
              />
              <path
                d={`M 20 100 Q 300 ${100 - baseStenosis * 0.65} 580 100`}
                stroke="#e11d48"
                strokeWidth="2.5"
                opacity="0.8"
              />

              {/* Annotations */}
              <text x="300" y="28" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                Proximal LAD Lumen
              </text>
              <text x="300" y="155" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                Cyan Dash: Remodeled Plaque Contour under GDMT
              </text>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
