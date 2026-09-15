import React, { useState } from "react";
import { CalculatedRisk, UnitSystem } from "../types/cardio";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  LineChart as LineChartIcon,
  TrendingUp,
  PieChart,
  Activity,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface VisualChartsProps {
  riskBaseline: CalculatedRisk;
  riskCounterfactual: CalculatedRisk;
  unitSystem: UnitSystem;
}

export const VisualCharts: React.FC<VisualChartsProps> = ({
  riskBaseline,
  riskCounterfactual,
  unitSystem,
}) => {
  const [activeTab, setActiveTab] = useState<"survival" | "trajectory" | "attribution" | "events">("survival");
  const [trajectoryMetric, setTrajectoryMetric] = useState<"ldl" | "sbp" | "stenosis" | "risk">("ldl");

  const displayVal = (valMgDl: number) => {
    return unitSystem === "mmoll" ? (valMgDl / 38.67).toFixed(1) : Math.round(valMgDl);
  };

  // Specific event probabilities data
  const eventsData = [
    {
      name: "Myocardial Infarction",
      baseline: riskBaseline.miProb,
      counterfactual: riskCounterfactual.miProb,
      drop: Number((riskBaseline.miProb - riskCounterfactual.miProb).toFixed(1)),
    },
    {
      name: "Ischemic Stroke",
      baseline: riskBaseline.strokeProb,
      counterfactual: riskCounterfactual.strokeProb,
      drop: Number((riskBaseline.strokeProb - riskCounterfactual.strokeProb).toFixed(1)),
    },
    {
      name: "Heart Failure",
      baseline: riskBaseline.hfProb,
      counterfactual: riskCounterfactual.hfProb,
      drop: Number((riskBaseline.hfProb - riskCounterfactual.hfProb).toFixed(1)),
    },
    {
      name: "Cardiovascular Death",
      baseline: riskBaseline.cvDeathProb,
      counterfactual: riskCounterfactual.cvDeathProb,
      drop: Number((riskBaseline.cvDeathProb - riskCounterfactual.cvDeathProb).toFixed(1)),
    },
  ];

  // Configure trajectory series based on selected metric
  const getTrajectoryConfig = () => {
    switch (trajectoryMetric) {
      case "sbp":
        return {
          title: "Systolic Blood Pressure (mmHg)",
          baselineKey: "baselineSBP",
          counterfactualKey: "counterfactualSBP",
          unit: "mmHg",
          formatY: (v: number) => `${v}`,
          formatTooltip: (v: number) => `${v} mmHg`,
          baseColor: "#f97316",
          simColor: "#38bdf8",
        };
      case "stenosis":
        return {
          title: "Arterial Lumen Stenosis (%)",
          baselineKey: "baselineStenosis",
          counterfactualKey: "counterfactualStenosis",
          unit: "% Stenosis",
          formatY: (v: number) => `${v}%`,
          formatTooltip: (v: number) => `${v}% stenosis`,
          baseColor: "#ef4444",
          simColor: "#10b981",
        };
      case "risk":
        return {
          title: "Cumulative CVD Event Probability (%)",
          baselineKey: "baselineRisk",
          counterfactualKey: "counterfactualRisk",
          unit: "%",
          formatY: (v: number) => `${v}%`,
          formatTooltip: (v: number) => `${v}% cumulative risk`,
          baseColor: "#f43f5e",
          simColor: "#06b6d4",
        };
      case "ldl":
      default:
        return {
          title: `Atherogenic LDL-C (${unitSystem})`,
          baselineKey: "baselineLDL",
          counterfactualKey: "counterfactualLDL",
          unit: unitSystem,
          formatY: (v: number) => `${displayVal(v)}`,
          formatTooltip: (v: number) => `${displayVal(v)} ${unitSystem}`,
          baseColor: "#f43f5e",
          simColor: "#10b981",
        };
    }
  };

  const trajConfig = getTrajectoryConfig();

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-lg space-y-4">
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <LineChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Visual Analytics & In Silico Trajectories
            </h3>
            <p className="text-[11px] text-slate-400">
              Comparative longitudinal risk models and factor attribution
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("survival")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "survival"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            10-Yr Survival (KM)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("trajectory")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "trajectory"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Biomarker Trajectory
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("attribution")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "attribution"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Risk Attribution
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "events"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Event Probabilities
          </button>
        </div>
      </div>

      {/* Chart 1: 10-Year Event-Free Survival (Kaplan-Meier Style) */}
      {activeTab === "survival" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">
              Kaplan-Meier Event-Free Survival Probability Trajectory (%)
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-rose-500 inline-block"></span>
                Baseline Twin (10y Free: {riskBaseline.survivalCurve[10]?.baselineSurvival}%)
              </span>
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-3 h-0.5 bg-cyan-400 inline-block"></span>
                Counterfactual Twin (10y Free: {riskCounterfactual.survivalCurve[10]?.counterfactualSurvival}%)
              </span>
            </div>
          </div>

          <div className="w-full h-72 bg-slate-950/70 p-3 rounded-xl border border-slate-800/90">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskCounterfactual.survivalCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="counterfactualSurvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="baselineSurvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="year"
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(val) => `Year ${val}`}
                />
                <YAxis
                  domain={[50, 100]}
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val}%`, ""]}
                  labelFormatter={(label) => `Follow-up: Year ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="counterfactualSurvival"
                  name="Counterfactual Event-Free"
                  stroke="#22d3ee"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#counterfactualSurvGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="baselineSurvival"
                  name="Baseline Event-Free"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#baselineSurvGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400 text-center">
            *Survival trajectory modeled from exponential hazard rates derived from ACC/AHA PCE, CTT meta-analyses, and intervention trial hazard ratios.
          </div>
        </div>
      )}

      {/* Chart 2: Biomarker Trajectory Projection */}
      {activeTab === "trajectory" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">
              10-Year Longitudinal Projection: {trajConfig.title}
            </span>

            {/* Trajectory Metric Selector Pills */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setTrajectoryMetric("ldl")}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-lg transition-all ${
                  trajectoryMetric === "ldl"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                LDL-C ({unitSystem})
              </button>
              <button
                type="button"
                onClick={() => setTrajectoryMetric("sbp")}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-lg transition-all ${
                  trajectoryMetric === "sbp"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Systolic BP (mmHg)
              </button>
              <button
                type="button"
                onClick={() => setTrajectoryMetric("stenosis")}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-lg transition-all ${
                  trajectoryMetric === "stenosis"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Plaque Stenosis (%)
              </button>
              <button
                type="button"
                onClick={() => setTrajectoryMetric("risk")}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-lg transition-all ${
                  trajectoryMetric === "risk"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Cumulative Risk (%)
              </button>
            </div>
          </div>

          <div className="w-full h-72 bg-slate-950/70 p-3 rounded-xl border border-slate-800/90">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskCounterfactual.biomarkerTrajectory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="year"
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(val) => `Year ${val}`}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={trajConfig.formatY}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [trajConfig.formatTooltip(Number(val)), ""]}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey={trajConfig.baselineKey}
                  name="Baseline Trajectory"
                  stroke={trajConfig.baseColor}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ fill: trajConfig.baseColor, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey={trajConfig.counterfactualKey}
                  name="Counterfactual Projected"
                  stroke={trajConfig.simColor}
                  strokeWidth={2.5}
                  dot={{ fill: trajConfig.simColor, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Year 0 to Year 10 simulation based on trial hazard ratios and continuous biomarker response functions.
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: trajConfig.baseColor }}></span> Baseline
              </span>
              <span className="flex items-center gap-1 font-semibold" style={{ color: trajConfig.simColor }}>
                <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: trajConfig.simColor }}></span> Counterfactual Projected
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart 3: Risk Factor Attribution */}
      {activeTab === "attribution" && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-300">
            Individual Pathophysiological Risk Attribution Breakdown
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Attribution Bars */}
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800/90">
              {riskBaseline.riskBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      {item.factor}
                    </span>
                    <span className="font-mono font-bold text-white">{item.contributionPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${item.contributionPercent}%`, backgroundColor: item.color }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400 block">{item.description}</span>
                </div>
              ))}
            </div>

            {/* Clinical Takeaway */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 flex flex-col justify-between text-xs space-y-3">
              <div className="space-y-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                  Top Modifiable Driver Analysis
                </span>
                <p className="text-slate-300 leading-relaxed">
                  The primary biological contributor to this patient's excess hazard is{" "}
                  <strong className="text-rose-400 font-semibold">
                    {riskBaseline.riskBreakdown.reduce((prev, curr) => (curr.contributionPercent > prev.contributionPercent ? curr : prev)).factor}
                  </strong>{" "}
                  accounting for{" "}
                  <strong className="text-white font-mono">
                    {Math.max(...riskBaseline.riskBreakdown.map((r) => r.contributionPercent))}%
                  </strong>{" "}
                  of the total estimated cardiovascular stress profile.
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Aggressive lipid lowering via high-intensity statin + ezetimibe / PCSK9i directly targets the atherogenic particle burden, preventing lipid infiltration into the subendothelial space.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-[11px]">
                💡 Tip: Counterfactual simulations test whether single-target vs multi-risk factor modulation yields synergistic risk reduction.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart 4: Specific Clinical Event Probabilities */}
      {activeTab === "events" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">
              10-Year Probability of Discrete Clinical Events (%)
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-rose-500 rounded inline-block"></span> Baseline
              </span>
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-3 h-3 bg-cyan-400 rounded inline-block"></span> Counterfactual
              </span>
            </div>
          </div>

          <div className="w-full h-72 bg-slate-950/70 p-3 rounded-xl border border-slate-800/90">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val}%`, ""]}
                />
                <Bar dataKey="baseline" name="Baseline Probability" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="counterfactual" name="Counterfactual Probability" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
