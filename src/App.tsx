import React, { useState, useMemo, useEffect } from "react";
import {
  PatientBiomarkers,
  CounterfactualTreatment,
  UnitSystem,
} from "./types/cardio";
import { clinicalPresets } from "./data/presets";
import {
  calculateBaselineRisk,
  calculateCounterfactualRisk,
} from "./services/riskEngine";
import { Header } from "./components/Header";
import { PreviewPage } from "./components/PreviewPage";
import { DigitalTwinHero } from "./components/DigitalTwinHero";
import { BiomarkerInputs } from "./components/BiomarkerInputs";
import { CounterfactualControls } from "./components/CounterfactualControls";
import { VascularLumenVisualizer } from "./components/VascularLumenVisualizer";
import { VisualCharts } from "./components/VisualCharts";
import { ClinicalAISynthesis } from "./components/ClinicalAISynthesis";
import { ExportReportModal } from "./components/ExportReportModal";
import { SystemGuideModal } from "./components/SystemGuideModal";
import { Activity, ShieldAlert, Sparkles, Sliders, Eye } from "lucide-react";

export function App() {
  // Navigation view: "preview" (accessible showcase) vs "workbench" (interactive simulator)
  const [currentView, setCurrentView] = useState<"preview" | "workbench">(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash === "#workbench" || params.get("view") === "workbench") {
        return "workbench";
      }
    }
    return "preview";
  });

  // Active clinical preset or custom patient
  const [activePresetId, setActivePresetId] = useState<string>(clinicalPresets[0].id);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("mgdl");

  // Patient Biomarkers state
  const [patient, setPatient] = useState<PatientBiomarkers>(
    clinicalPresets[0].patient
  );

  // Counterfactual Treatment state
  const [treatment, setTreatment] = useState<CounterfactualTreatment>(
    clinicalPresets[0].recommendedCounterfactual
  );

  // Modal open states
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#workbench") {
        setCurrentView("workbench");
      } else if (hash === "#preview") {
        setCurrentView("preview");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleSwitchView = (view: "preview" | "workbench") => {
    setCurrentView(view);
    if (typeof window !== "undefined") {
      window.location.hash = view;
    }
  };

  // Handle preset selection
  const handleSelectPreset = (presetId: string) => {
    setActivePresetId(presetId);
    const selected = clinicalPresets.find((p) => p.id === presetId);
    if (selected) {
      setPatient(selected.patient);
      setTreatment(selected.recommendedCounterfactual);
    }
  };

  // Launch workbench from preview page with specific preset
  const handleLaunchWorkbench = (presetId?: string) => {
    if (presetId) {
      handleSelectPreset(presetId);
    }
    handleSwitchView("workbench");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Real-time Risk Calculation
  const riskBaseline = useMemo(() => calculateBaselineRisk(patient), [patient]);
  const riskCounterfactual = useMemo(
    () => calculateCounterfactualRisk(patient, treatment),
    [patient, treatment]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Application Header */}
      <Header
        activePresetId={activePresetId}
        onSelectPreset={(preset) => handleSelectPreset(preset.id)}
        unitSystem={unitSystem}
        onToggleUnits={(u) => setUnitSystem(u)}
        onOpenAIReview={() => setIsAIModalOpen(true)}
        onOpenReport={() => setIsExportModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onReset={() => handleSelectPreset(activePresetId)}
        currentView={currentView}
        onSwitchView={handleSwitchView}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-6">
        {currentView === "preview" ? (
          /* Public Accessible Preview Showcase Page */
          <PreviewPage
            onLaunchWorkbench={handleLaunchWorkbench}
            unitSystem={unitSystem}
            onToggleUnits={setUnitSystem}
            onOpenAIReview={() => setIsAIModalOpen(true)}
          />
        ) : (
          /* Interactive Simulation Workbench */
          <>
            {/* Quick Banner to return to Preview */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>
                  <strong>Interactive Simulation Workbench Active:</strong> Tweak patient biomarkers and therapy levers below.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSwitchView("preview")}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Return to Preview Page</span>
              </button>
            </div>

            {/* Top Section: Digital Twin Comparison Card */}
            <DigitalTwinHero
              baseline={patient}
              riskBaseline={riskBaseline}
              riskCounterfactual={riskCounterfactual}
              unitSystem={unitSystem}
            />

            {/* Middle Section: Biomarkers Input (Left) & Counterfactual Sandbox (Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <BiomarkerInputs
                patient={patient}
                onChange={(updated) => {
                  setPatient(updated);
                  setActivePresetId("custom");
                }}
                unitSystem={unitSystem}
              />

              <CounterfactualControls
                treatment={treatment}
                baseline={patient}
                onChange={setTreatment}
              />
            </div>

            {/* Lower Section: 3D SVG Artery Lumen Remodeling (Left) & Recharts Visual Analytics (Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <VascularLumenVisualizer
                baseline={patient}
                riskBaseline={riskBaseline}
                riskCounterfactual={riskCounterfactual}
              />

              <VisualCharts
                riskBaseline={riskBaseline}
                riskCounterfactual={riskCounterfactual}
                unitSystem={unitSystem}
              />
            </div>
          </>
        )}

        {/* Footer info bar */}
        <footer className="pt-4 pb-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              CardioTwin Engine v2.5 · Mathematical models grounded in ACC/AHA 2018/2024, ESC 2019/2024, CSI, ICMR-INDIAB, and CTT Meta-analyses
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSwitchView(currentView === "preview" ? "workbench" : "preview")}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Switch to {currentView === "preview" ? "Workbench" : "Preview Page"}
            </button>
            <span>·</span>
            <span>In Silico Patient Simulation Sandbox</span>
          </div>
        </footer>
      </main>

      {/* AI Clinical Synthesis Modal */}
      <ClinicalAISynthesis
        baseline={patient}
        counterfactual={treatment}
        riskBaseline={riskBaseline}
        riskCounterfactual={riskCounterfactual}
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      {/* Export EHR Report Modal */}
      <ExportReportModal
        patient={patient}
        treatment={treatment}
        riskBaseline={riskBaseline}
        riskCounterfactual={riskCounterfactual}
        unitSystem={unitSystem}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Interactive System Architecture & Drug Guide Modal */}
      <SystemGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        patient={patient}
        riskBaseline={riskBaseline}
      />
    </div>
  );
}

export default App;
