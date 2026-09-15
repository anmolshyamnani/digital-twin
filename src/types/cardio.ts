export type Sex = "male" | "female";
export type Race = "white" | "african_american" | "hispanic" | "asian" | "other";
export type SmokerStatus = "never" | "former" | "current";
export type StatinIntensity = "none" | "low" | "moderate" | "high";
export type DietPattern = "standard" | "mediterranean" | "dash" | "low_carb_plant";
export type ExerciseLevel = "sedentary" | "light" | "moderate" | "vigorous";
export type RiskCategory = "Low (<5%)" | "Borderline (5-7.4%)" | "Intermediate (7.5-19.9%)" | "High (20-29.9%)" | "Very High (≥30% or Secondary)";
export type UnitSystem = "mgdl" | "mmoll";

export interface PatientBiomarkers {
  id: string;
  name: string;
  age: number; // 20 - 90
  sex: Sex;
  race: Race;
  
  // Hemodynamics
  sbp: number; // Systolic BP (mmHg) 80 - 220
  dbp: number; // Diastolic BP (mmHg) 50 - 130
  onBPMeds: boolean;
  restingHR: number; // bpm 45 - 120

  // Lipid Panel (in mg/dL)
  totalChol: number; // 100 - 450
  ldl: number; // 30 - 350
  hdl: number; // 15 - 120
  triglycerides: number; // 40 - 1000
  lpa?: number; // Lp(a) in nmol/L (0 - 300)
  apoB?: number; // ApoB in mg/dL (40 - 220)

  // Glycemic & Renal
  glucose: number; // Fasting glucose mg/dL (60 - 300)
  hba1c: number; // % (4.5 - 14.0)
  egfr: number; // mL/min/1.73m2 (15 - 120)
  uacr: number; // Urine Albumin/Cr mg/g (5 - 500)

  // Anthropometrics
  height: number; // cm (120 - 220)
  weight: number; // kg (35 - 200)
  bmi: number; // Calculated

  // Clinical History & Risk Modifiers
  smoker: SmokerStatus;
  diabetes: boolean;
  cac: number; // Coronary Artery Calcium Agatston score (0 - 2000)
  priorASCVD: boolean; // Secondary prevention
  familyHistoryCAD: boolean; // Premature CAD in 1st degree relative
  statinIntolerant: boolean;
  baselineStatin: StatinIntensity;
}

export interface CounterfactualTreatment {
  // Pharmacotherapy
  statinIntensity: StatinIntensity;
  ezetimibe: boolean;
  pcsk9: boolean; // Evolocumab / Alirocumab / Inclisiran
  bempedoicAcid: boolean; // Nexletol
  icosapent: boolean; // Vascepa (for high TG)
  glp1sglt2: boolean; // SGLT2i / GLP-1 RA for cardiometabolic protection
  sbpReduction: number; // Target SBP reduction (0 to 30 mmHg)
  aspirin: boolean; // Low-dose ASA 81mg

  // Lifestyle
  diet: DietPattern;
  exerciseLevel: ExerciseLevel;
  smokingCessation: boolean;
  weightLossPercent: number; // 0 to 20%
  sodiumReduction: boolean;
}

export interface SurvivalDataPoint {
  year: number;
  baselineSurvival: number; // %
  counterfactualSurvival: number; // %
  baselineRisk: number; // % cumulative
  counterfactualRisk: number; // % cumulative
}

export interface TrajectoryDataPoint {
  year: number;
  baselineLDL: number;
  counterfactualLDL: number;
  baselineSBP: number;
  counterfactualSBP: number;
  baselinePlaque: number;
  counterfactualPlaque: number;
  baselineStenosis: number;
  counterfactualStenosis: number;
  baselineRisk: number;
  counterfactualRisk: number;
}

export interface RiskAttribution {
  factor: string;
  contributionPercent: number;
  score: number;
  color: string;
  description: string;
}

export interface CalculatedRisk {
  tenYearRisk: number; // % (0 - 100)
  lifetimeRisk: number; // % (0 - 100)
  riskCategory: RiskCategory;
  vascularAge: number; // years
  vascularAgeDelta: number; // vascularAge - chronologicalAge
  
  // Specific event 10-year probabilities
  miProb: number; // Myocardial Infarction %
  strokeProb: number; // Ischemic Stroke %
  hfProb: number; // Heart Failure %
  cvDeathProb: number; // Cardiovascular Death %

  // Vascular & Plaque metrics
  plaqueIndex: number; // 0 - 100
  plaqueSeverity: "Minimal" | "Mild" | "Moderate" | "Severe" | "Critical";
  lumenStenosisPercent: number; // Estimated % stenosis
  lumenAreaMm2: number; // Estimated patent lumen area (mm2)
  coronaryPerfusionIndex: number; // Relative flow index (1.0x baseline)
  fibrousCapThicknessUm: number; // Fibrous cap thickness in micrometers (um)
  arterialStiffnessScore: number; // 1 - 10

  // Hyperlipidemia Phenotyping
  hyperlipidemiaPhenotype: string;
  fhScore: number; // Dutch Lipid Clinic Network score
  fhLikelihood: "Unlikely" | "Possible" | "Probable" | "Definite";

  // Counterfactual target projections
  projectedLDL: number;
  projectedSBP: number;
  projectedTotalChol: number;
  projectedNonHDL: number;
  projectedTriglycerides: number;

  // Impact metrics
  arr: number; // Absolute Risk Reduction (%)
  rrr: number; // Relative Risk Reduction (%)
  nnt: number; // Number Needed to Treat (10y)
  yearsGained: number; // Event-free years gained

  // Chart series
  survivalCurve: SurvivalDataPoint[];
  biomarkerTrajectory: TrajectoryDataPoint[];
  riskBreakdown: RiskAttribution[];
}

export interface ClinicalPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  avatarColor: string;
  patient: PatientBiomarkers;
  recommendedCounterfactual: CounterfactualTreatment;
}
