import React, { useState } from "react";
import {
  PatientBiomarkers,
  CounterfactualTreatment,
  CalculatedRisk,
  UnitSystem,
} from "../types/cardio";
import {
  FileText,
  Copy,
  Check,
  Download,
  Printer,
  X,
  Share2,
} from "lucide-react";

interface ExportReportModalProps {
  patient: PatientBiomarkers;
  treatment: CounterfactualTreatment;
  riskBaseline: CalculatedRisk;
  riskCounterfactual: CalculatedRisk;
  unitSystem: UnitSystem;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  patient,
  treatment,
  riskBaseline,
  riskCounterfactual,
  unitSystem,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const displayVal = (valMgDl: number) => {
    return unitSystem === "mmoll" ? (valMgDl / 38.67).toFixed(1) : Math.round(valMgDl);
  };

  const reportText = `========================================================================
CARDIOTWIN: CARDIOVASCULAR & HYPERLIPIDEMIA DIGITAL TWIN REPORT
Generated on: ${new Date().toLocaleDateString()} | In Silico Clinical Simulation
========================================================================

PATIENT DEMOGRAPHICS & BIOMARKERS
------------------------------------------------------------------------
Patient ID / Name   : ${patient.id} - ${patient.name}
Age / Sex / Race    : ${patient.age} years | ${patient.sex.toUpperCase()} | ${patient.race.replace("_", " ").toUpperCase()}
Blood Pressure      : ${patient.sbp}/${patient.dbp} mmHg (${patient.onBPMeds ? "Treated" : "Untreated"})
Heart Rate / BMI    : ${patient.restingHR} bpm | ${patient.bmi} kg/m² (${patient.weight} kg, ${patient.height} cm)
Lipid Panel         : Total Chol: ${displayVal(patient.totalChol)} ${unitSystem}
                      LDL-C: ${displayVal(patient.ldl)} ${unitSystem}
                      HDL-C: ${displayVal(patient.hdl)} ${unitSystem}
                      Triglycerides: ${unitSystem === "mmoll" ? (patient.triglycerides / 88.57).toFixed(1) : patient.triglycerides} ${unitSystem}
                      Non-HDL: ${displayVal(patient.totalChol - patient.hdl)} ${unitSystem}
                      Lp(a): ${patient.lpa || "N/A"} nmol/L | ApoB: ${patient.apoB || "N/A"} mg/dL
Metabolic & Renal   : Glucose: ${patient.glucose} mg/dL | HbA1c: ${patient.hba1c}% | Diabetes: ${patient.diabetes ? "YES" : "NO"}
                      eGFR: ${patient.egfr} mL/min/1.73m² | uACR: ${patient.uacr} mg/g
Subclinical Plaque  : Coronary Artery Calcium (CAC Agatston): ${patient.cac}
Clinical History    : Prior ASCVD: ${patient.priorASCVD ? "YES" : "NO"} | Family Hx CAD: ${patient.familyHistoryCAD ? "YES" : "NO"}
                      Smoking Status: ${patient.smoker.toUpperCase()} | Statin Intolerance: ${patient.statinIntolerant ? "YES" : "NO"}

========================================================================
BASELINE DIGITAL TWIN (UNTREATED STATE)
------------------------------------------------------------------------
- 10-Year ASCVD Risk Score     : ${riskBaseline.tenYearRisk.toFixed(1)}% (${riskBaseline.riskCategory.toUpperCase()})
- Biological Vascular Age      : ${riskBaseline.vascularAge} years (${riskBaseline.vascularAgeDelta > 0 ? `+${riskBaseline.vascularAgeDelta}y excess` : "aligned"})
- Coronary Plaque Burden Index : ${riskBaseline.plaqueIndex}/100 (${riskBaseline.plaqueSeverity})
- Estimated Lumen Stenosis     : ${riskBaseline.lumenStenosisPercent}%
- 10-Year Event Probabilities  :
    * Myocardial Infarction    : ${riskBaseline.miProb}%
    * Ischemic Stroke          : ${riskBaseline.strokeProb}%
    * Heart Failure            : ${riskBaseline.hfProb}%
    * Cardiovascular Death     : ${riskBaseline.cvDeathProb}%

========================================================================
SIMULATED COUNTERFACTUAL TWIN (GDMT INTERVENTIONS)
------------------------------------------------------------------------
Active Interventions:
  - Statin Regimen             : ${treatment.statinIntensity.toUpperCase()} INTENSITY
  - Ezetimibe 10mg             : ${treatment.ezetimibe ? "YES (+20% LDL drop)" : "NO"}
  - PCSK9 Inhibitor            : ${treatment.pcsk9 ? "YES (+58% LDL drop)" : "NO"}
  - Bempedoic Acid (Nexletol)  : ${treatment.bempedoicAcid ? "YES (+18% LDL drop)" : "NO"}
  - Icosapent Ethyl (Vascepa)  : ${treatment.icosapent ? "YES (-25% MACE)" : "NO"}
  - SGLT2i / GLP-1 RA          : ${treatment.glp1sglt2 ? "YES" : "NO"}
  - Blood Pressure Reduction   : -${treatment.sbpReduction} mmHg Target
  - Low-Dose Aspirin (81mg)    : ${treatment.aspirin ? "YES" : "NO"}
  - Dietary Pattern            : ${treatment.diet.toUpperCase()}
  - Exercise Level             : ${treatment.exerciseLevel.toUpperCase()}
  - Smoking Cessation          : ${treatment.smokingCessation ? "ACTIVE" : "N/A"}
  - Target Weight Loss         : -${treatment.weightLossPercent}%

Counterfactual Outcome Projections:
- Simulated 10-Year ASCVD Risk : ${riskCounterfactual.tenYearRisk.toFixed(1)}% (${riskCounterfactual.riskCategory.toUpperCase()})
- Absolute Risk Reduction (ARR): -${riskCounterfactual.arr}% (ARR)
- Relative Risk Reduction (RRR): -${riskCounterfactual.rrr}% (RRR)
- Number Needed to Treat (NNT) : ${riskCounterfactual.nnt} patients
- Life-Years Gained            : +${riskCounterfactual.yearsGained} event-free years
- Projected Target LDL-C       : ${displayVal(riskCounterfactual.projectedLDL)} ${unitSystem}
- Projected Target SBP         : ${riskCounterfactual.projectedSBP} mmHg
- Rejuvenated Vascular Age     : ${riskCounterfactual.vascularAge} years
- Remodeled Plaque Index       : ${riskCounterfactual.plaqueIndex}/100

========================================================================
CLINICAL GUIDELINE RECOMMENDATIONS (ACC/AHA 2018 / ESC 2019 / NLA)
------------------------------------------------------------------------
1. Target LDL-C: For very-high risk ASCVD patients, maintain LDL-C < 55 mg/dL (< 1.4 mmol/L) and >=50% reduction from baseline.
2. Combination Therapy: Early addition of non-statin therapies (Ezetimibe, PCSK9i) ensures rapid plaque stabilization.
3. Lifestyle: Adherence to Mediterranean/DASH nutritional patterns and 150 min/wk moderate aerobic exercise.
========================================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([reportText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `CardioTwin_Report_${patient.id}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Export Digital Twin Clinical Consultation Summary
              </h2>
              <p className="text-xs text-slate-400">
                Standardized EHR-ready summary with counterfactual evidence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with formatted text */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950/50">
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
            {reportText}
          </pre>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Export format: Plain Text (ASCII / HL7 Compatible)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Text"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download .TXT File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
