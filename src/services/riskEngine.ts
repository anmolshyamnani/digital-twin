import {
  PatientBiomarkers,
  CounterfactualTreatment,
  CalculatedRisk,
  RiskCategory,
  SurvivalDataPoint,
  TrajectoryDataPoint,
  RiskAttribution,
} from "../types/cardio";

/**
 * ACC/AHA Pooled Cohort Equations (PCE) exact coefficients
 */
interface PCECoefficients {
  lnAge: number;
  lnAgeSq: number;
  lnTotalChol: number;
  lnAgeTotalChol: number;
  lnHDL: number;
  lnAgeHDL: number;
  lnTreatedSBP: number;
  lnAgeTreatedSBP: number;
  lnUntreatedSBP: number;
  lnAgeUntreatedSBP: number;
  smoker: number;
  lnAgeSmoker: number;
  diabetes: number;
  meanTerm: number;
  baselineSurvival: number;
}

const PCE_COEFFS: Record<string, PCECoefficients> = {
  // White/Other Female
  female_white: {
    lnAge: -29.799,
    lnAgeSq: 4.884,
    lnTotalChol: 13.54,
    lnAgeTotalChol: -3.114,
    lnHDL: -13.578,
    lnAgeHDL: 3.149,
    lnTreatedSBP: 2.019,
    lnAgeTreatedSBP: 0,
    lnUntreatedSBP: 1.957,
    lnAgeUntreatedSBP: 0,
    smoker: 7.574,
    lnAgeSmoker: -1.665,
    diabetes: 0.661,
    meanTerm: -29.18,
    baselineSurvival: 0.9665,
  },
  // African American Female
  female_african_american: {
    lnAge: 17.114,
    lnAgeSq: 0,
    lnTotalChol: 0.94,
    lnAgeTotalChol: 0,
    lnHDL: -18.92,
    lnAgeHDL: 4.475,
    lnTreatedSBP: 29.291,
    lnAgeTreatedSBP: -6.432,
    lnUntreatedSBP: 27.82,
    lnAgeUntreatedSBP: -6.087,
    smoker: 0.691,
    lnAgeSmoker: 0,
    diabetes: 0.874,
    meanTerm: 86.61,
    baselineSurvival: 0.9533,
  },
  // White/Other Male
  male_white: {
    lnAge: 12.344,
    lnAgeSq: 0,
    lnTotalChol: 11.853,
    lnAgeTotalChol: -2.664,
    lnHDL: -7.99,
    lnAgeHDL: 1.769,
    lnTreatedSBP: 1.797,
    lnAgeTreatedSBP: 0,
    lnUntreatedSBP: 1.764,
    lnAgeUntreatedSBP: 0,
    smoker: 7.837,
    lnAgeSmoker: -1.795,
    diabetes: 0.658,
    meanTerm: 61.18,
    baselineSurvival: 0.9144,
  },
  // African American Male
  male_african_american: {
    lnAge: 2.469,
    lnAgeSq: 0,
    lnTotalChol: 0.302,
    lnAgeTotalChol: 0,
    lnHDL: -0.307,
    lnAgeHDL: 0,
    lnTreatedSBP: 1.916,
    lnAgeTreatedSBP: 0,
    lnUntreatedSBP: 1.809,
    lnAgeUntreatedSBP: 0,
    smoker: 0.549,
    lnAgeSmoker: 0,
    diabetes: 0.645,
    meanTerm: 19.54,
    baselineSurvival: 0.8954,
  },
};

/**
 * Calculate raw 10-Year ASCVD Risk using ACC/AHA PCE model
 */
export function calculateRawPCERisk(patient: PatientBiomarkers): number {
  const isAA = patient.race === "african_american";
  const key = `${patient.sex}_${isAA ? "african_american" : "white"}`;
  const coeffs = PCE_COEFFS[key] || PCE_COEFFS[`${patient.sex}_white`];

  const age = Math.min(79, Math.max(40, patient.age));
  const lnAge = Math.log(age);
  const lnAgeSq = lnAge * lnAge;
  const lnTotalChol = Math.log(Math.max(130, Math.min(320, patient.totalChol)));
  const lnHDL = Math.log(Math.max(20, Math.min(100, patient.hdl)));
  const sbp = Math.max(90, Math.min(200, patient.sbp));
  const lnSBP = Math.log(sbp);
  const isSmoker = patient.smoker === "current" ? 1 : 0;
  const isDiabetic = patient.diabetes ? 1 : 0;

  let sum = 0;
  sum += coeffs.lnAge * lnAge;
  if (coeffs.lnAgeSq) sum += coeffs.lnAgeSq * lnAgeSq;
  sum += coeffs.lnTotalChol * lnTotalChol;
  if (coeffs.lnAgeTotalChol) sum += coeffs.lnAgeTotalChol * (lnAge * lnTotalChol);
  sum += coeffs.lnHDL * lnHDL;
  if (coeffs.lnAgeHDL) sum += coeffs.lnAgeHDL * (lnAge * lnHDL);

  if (patient.onBPMeds) {
    sum += coeffs.lnTreatedSBP * lnSBP;
    if (coeffs.lnAgeTreatedSBP) sum += coeffs.lnAgeTreatedSBP * (lnAge * lnSBP);
  } else {
    sum += coeffs.lnUntreatedSBP * lnSBP;
    if (coeffs.lnAgeUntreatedSBP) sum += coeffs.lnAgeUntreatedSBP * (lnAge * lnSBP);
  }

  sum += coeffs.smoker * isSmoker;
  if (coeffs.lnAgeSmoker) sum += coeffs.lnAgeSmoker * (lnAge * isSmoker);
  sum += coeffs.diabetes * isDiabetic;

  const individualSum = sum - coeffs.meanTerm;
  const risk = (1 - Math.pow(coeffs.baselineSurvival, Math.exp(individualSum))) * 100;

  // Handle age < 40 or > 79 adjustments smoothly
  if (patient.age < 40) {
    const ageScale = Math.pow(patient.age / 40, 1.8);
    return Math.max(0.5, Math.min(95, risk * ageScale));
  } else if (patient.age > 79) {
    const ageScale = 1 + (patient.age - 79) * 0.025;
    return Math.max(0.5, Math.min(95, risk * ageScale));
  }

  return Math.max(0.5, Math.min(95, risk));
}

/**
 * Apply Risk Enhancers (CAC Score, Lp(a), eGFR, uACR, Family History, Prior ASCVD)
 */
export function calculateEnhancedASCVD(
  patient: PatientBiomarkers,
  rawRisk: number
): { risk: number; category: RiskCategory; multiplierBreakdown: Record<string, number> } {
  // If established secondary prevention (Prior ASCVD / MI / Stent / Stroke)
  if (patient.priorASCVD) {
    const baselineSecondary = Math.max(30.0, rawRisk * 1.6);
    return {
      risk: Math.min(85.0, baselineSecondary),
      category: "Very High (≥30% or Secondary)",
      multiplierBreakdown: { priorASCVD: 2.2 },
    };
  }

  let multiplier = 1.0;
  const breakdown: Record<string, number> = {};

  // CAC Score Multiplier (AHA/ACC 2018/2024 Prevention Guidelines)
  if (patient.cac > 0) {
    if (patient.cac === 0) {
      multiplier *= 0.45; // Power of zero CAC: down-classifies risk
      breakdown.cacZero = 0.45;
    } else if (patient.cac < 100) {
      multiplier *= 1.25;
      breakdown.cacMild = 1.25;
    } else if (patient.cac < 400) {
      multiplier *= 1.85;
      breakdown.cacModerate = 1.85;
    } else {
      multiplier *= 2.8;
      breakdown.cacSevere = 2.8;
    }
  }

  // Lp(a) Multiplier
  if (patient.lpa && patient.lpa > 75) {
    if (patient.lpa > 150) {
      multiplier *= 1.45;
      breakdown.lpaHigh = 1.45;
    } else {
      multiplier *= 1.22;
      breakdown.lpaElevated = 1.22;
    }
  }

  // Family History of Premature CAD
  if (patient.familyHistoryCAD) {
    multiplier *= 1.35;
    breakdown.familyHistory = 1.35;
  }

  // Chronic Kidney Disease (eGFR & uACR)
  if (patient.egfr < 60) {
    const egfrMult = 1 + (60 - patient.egfr) * 0.012;
    multiplier *= egfrMult;
    breakdown.egfrReduced = egfrMult;
  }
  if (patient.uacr > 30) {
    multiplier *= 1.2;
    breakdown.albuminuria = 1.2;
  }

  // Severe Hypercholesterolemia (LDL >= 190 mg/dL)
  if (patient.ldl >= 190) {
    multiplier *= 1.4;
    breakdown.severeHypercholesterolemia = 1.4;
  }

  const finalRisk = Math.min(95, Math.max(0.4, rawRisk * multiplier));

  let category: RiskCategory = "Low (<5%)";
  if (finalRisk >= 30) category = "Very High (≥30% or Secondary)";
  else if (finalRisk >= 20) category = "High (20-29.9%)";
  else if (finalRisk >= 7.5) category = "Intermediate (7.5-19.9%)";
  else if (finalRisk >= 5.0) category = "Borderline (5-7.4%)";

  return { risk: finalRisk, category, multiplierBreakdown: breakdown };
}

/**
 * Calculate Vascular / Biological Heart Age
 */
export function calculateVascularAge(patient: PatientBiomarkers, risk10y: number): number {
  // Base model: Ideal risk profile matching
  // A person with ideal markers has 10y risk:
  // Age 30: ~0.8%, Age 40: ~1.5%, Age 50: ~3.0%, Age 60: ~5.5%, Age 70: ~11.0%, Age 80: ~19%
  const baseLogRisk = Math.log(Math.max(0.4, risk10y));
  
  // Invert exponential risk model for ideal adult
  // idealRisk(age) = 0.5 * exp(0.048 * (age - 25))
  // ln(risk / 0.5) = 0.048 * (age - 25)
  // age = 25 + ln(risk / 0.5) / 0.048
  let estimatedVascularAge = 25 + Math.log(Math.max(0.5, risk10y) / 0.5) / 0.052;

  // Modifiers for CAC, extreme LDL, smoking
  if (patient.cac >= 100) estimatedVascularAge += 4;
  if (patient.cac >= 400) estimatedVascularAge += 5;
  if (patient.smoker === "current") estimatedVascularAge += 3;
  if (patient.ldl > 190) estimatedVascularAge += 3;

  // Bound within realistic biological limits
  return Math.min(95, Math.max(patient.age - 5, Math.round(estimatedVascularAge)));
}

/**
 * Phenotype Hyperlipidemia & Familial Hypercholesterolemia (DLCN Score)
 */
export function evaluateHyperlipidemia(patient: PatientBiomarkers): {
  phenotype: string;
  fhScore: number;
  fhLikelihood: "Unlikely" | "Possible" | "Probable" | "Definite";
} {
  let score = 0;

  // LDL criteria (DLCN)
  if (patient.ldl >= 330) score += 8;
  else if (patient.ldl >= 250) score += 5;
  else if (patient.ldl >= 190) score += 3;
  else if (patient.ldl >= 155) score += 1;

  // Family History
  if (patient.familyHistoryCAD) score += 1;
  if (patient.ldl >= 190 && patient.familyHistoryCAD) score += 1;

  // Personal History / CAD / CAC
  if (patient.priorASCVD) score += 2;
  else if (patient.cac > 100) score += 1;

  let fhLikelihood: "Unlikely" | "Possible" | "Probable" | "Definite" = "Unlikely";
  if (score >= 8) fhLikelihood = "Definite";
  else if (score >= 6) fhLikelihood = "Probable";
  else if (score >= 3) fhLikelihood = "Possible";

  let phenotype = "Normal Lipid Profile";
  if (patient.ldl >= 190 || score >= 6) {
    phenotype = "Severe Heterozygous Familial Hypercholesterolemia (HeFH)";
  } else if (patient.triglycerides >= 500) {
    phenotype = "Severe Hypertriglyceridemia (High Pancreatitis Risk)";
  } else if (patient.triglycerides >= 175 && patient.hdl < 40 && patient.ldl >= 130) {
    phenotype = "Mixed / Atherogenic Dyslipidemia (Small Dense LDL Phenotype B)";
  } else if (patient.ldl >= 160) {
    phenotype = "Primary Hypercholesterolemia (Type IIa)";
  } else if (patient.triglycerides >= 200 && patient.ldl >= 130) {
    phenotype = "Combined Hyperlipidemia (Type IIb)";
  } else if (patient.triglycerides >= 200) {
    phenotype = "Hypertriglyceridemia (Type IV)";
  } else if (patient.hdl < 40 && patient.sex === "male" || patient.hdl < 50 && patient.sex === "female") {
    phenotype = "Isolated Hypoalphalipoproteinemia (Low HDL-C)";
  }

  return { phenotype, fhScore: score, fhLikelihood };
}

/**
 * Plaque Burden Index (0-100) & Vessel Stenosis estimation
 */
export function calculatePlaqueMetrics(
  patient: PatientBiomarkers,
  vascularAge: number
): {
  plaqueIndex: number;
  plaqueSeverity: "Minimal" | "Mild" | "Moderate" | "Severe" | "Critical";
  lumenStenosisPercent: number;
  lumenAreaMm2: number;
  coronaryPerfusionIndex: number;
  fibrousCapThicknessUm: number;
  arterialStiffnessScore: number;
} {
  // Plaque Index is composed of continuous contributions:
  // 1. Cumulative LDL-years exposure
  const ldlExposure = (patient.ldl / 100) * (patient.age / 45) * 18;
  let basePlaque = ldlExposure;

  // 2. ApoB particle excess
  if (patient.apoB && patient.apoB > 80) {
    basePlaque += Math.min(16, (patient.apoB - 80) * 0.18);
  }

  // 3. Triglycerides & Atherogenic triad
  if (patient.triglycerides > 150) {
    basePlaque += Math.min(14, (patient.triglycerides - 150) * 0.025);
  }

  // 4. Lp(a) genetic particle burden
  if (patient.lpa && patient.lpa > 75) {
    basePlaque += Math.min(18, (patient.lpa - 75) * 0.09);
  }

  // 5. CAC score calcified plaque burden
  if (patient.cac > 0) {
    basePlaque += Math.min(50, Math.sqrt(patient.cac) * 1.55);
  }

  // 6. Smoking, Diabetes, BMI, and SBP endothelial wall shear stress
  if (patient.smoker === "current") basePlaque += 14;
  else if (patient.smoker === "former") basePlaque += 4;

  if (patient.diabetes) basePlaque += 12;
  else if (patient.hba1c > 5.7) basePlaque += Math.min(8, (patient.hba1c - 5.7) * 4);

  if (patient.sbp >= 120) {
    basePlaque += ((patient.sbp - 120) / 10) * 3.5;
  }

  if (patient.bmi > 25) {
    basePlaque += Math.min(10, (patient.bmi - 25) * 0.8);
  }

  const plaqueIndex = Math.min(98, Math.max(4, Math.round(basePlaque)));

  let plaqueSeverity: "Minimal" | "Mild" | "Moderate" | "Severe" | "Critical" = "Minimal";
  if (plaqueIndex >= 80) plaqueSeverity = "Critical";
  else if (plaqueIndex >= 60) plaqueSeverity = "Severe";
  else if (plaqueIndex >= 40) plaqueSeverity = "Moderate";
  else if (plaqueIndex >= 20) plaqueSeverity = "Mild";

  // Lumen stenosis % continuous calculation
  const lumenStenosisPercent = Math.min(
    88,
    Math.max(5, Math.round(plaqueIndex * 0.72 + (patient.cac > 400 ? 12 : 0)))
  );

  // Normal proximal coronary artery has ~3.5mm diameter -> ~9.62 mm2 lumen area
  const lumenAreaMm2 = Number((9.62 * (1 - lumenStenosisPercent / 100)).toFixed(2));

  // Baseline coronary perfusion index
  const coronaryPerfusionIndex = 1.0;

  // Fibrous cap thickness in micrometers (um)
  const fibrousCapThicknessUm = Math.max(
    45,
    Math.round(125 - plaqueIndex * 0.65 + (patient.cac > 200 ? 8 : 0))
  );

  // Arterial stiffness: based on Pulse Pressure (SBP - DBP) + Age
  const pulsePressure = patient.sbp - patient.dbp;
  const stiffness = Math.min(10, Math.max(1, Math.round(pulsePressure / 12 + patient.age / 20 - 1.5)));

  return {
    plaqueIndex,
    plaqueSeverity,
    lumenStenosisPercent,
    lumenAreaMm2,
    coronaryPerfusionIndex,
    fibrousCapThicknessUm,
    arterialStiffnessScore: stiffness,
  };
}

/**
 * Calculate Counterfactual Projected Biomarkers & Risk
 */
export function simulateCounterfactualTwin(
  baseline: PatientBiomarkers,
  counterfactual: CounterfactualTreatment,
  baselineCalculated: CalculatedRisk
): CalculatedRisk {
  // 1. Calculate Multiplicative LDL Reduction
  let ldlMultiplier = 1.0;

  // Statin effect (AHA/ACC 2018/2024)
  if (counterfactual.statinIntensity === "high") ldlMultiplier *= (1 - 0.52);
  else if (counterfactual.statinIntensity === "moderate") ldlMultiplier *= (1 - 0.38);
  else if (counterfactual.statinIntensity === "low") ldlMultiplier *= (1 - 0.28);

  // Ezetimibe (IMPROVE-IT, +18-20% on residual LDL)
  if (counterfactual.ezetimibe) ldlMultiplier *= (1 - 0.19);

  // PCSK9i (FOURIER / ODYSSEY, +55-62% on residual LDL)
  if (counterfactual.pcsk9) ldlMultiplier *= (1 - 0.58);

  // Bempedoic Acid (CLEAR Outcomes, +18% on residual LDL)
  if (counterfactual.bempedoicAcid) ldlMultiplier *= (1 - 0.18);

  // Lifestyle: Mediterranean/DASH Diet (-8 to -12% LDL)
  if (counterfactual.diet === "mediterranean" || counterfactual.diet === "dash") {
    ldlMultiplier *= (1 - 0.10);
  } else if (counterfactual.diet === "low_carb_plant") {
    ldlMultiplier *= (1 - 0.08);
  }

  // Weight loss (-0.5% per 1% weight loss)
  if (counterfactual.weightLossPercent > 0) {
    ldlMultiplier *= (1 - (counterfactual.weightLossPercent * 0.005));
  }

  const projectedLDL = Math.max(15, Math.round(baseline.ldl * ldlMultiplier));
  const ldlDelta = baseline.ldl - projectedLDL;

  // 2. Projected SBP Reduction
  let sbpDrop = counterfactual.sbpReduction;
  if (counterfactual.diet === "dash" || counterfactual.diet === "mediterranean") sbpDrop += 4;
  if (counterfactual.exerciseLevel === "moderate") sbpDrop += 3;
  else if (counterfactual.exerciseLevel === "vigorous") sbpDrop += 6;
  if (counterfactual.sodiumReduction) sbpDrop += 4;
  if (counterfactual.weightLossPercent > 0) sbpDrop += Math.round(counterfactual.weightLossPercent * 0.6);

  const projectedSBP = Math.max(95, baseline.sbp - sbpDrop);

  // 3. Projected Triglycerides & HDL
  let tgMultiplier = 1.0;
  if (counterfactual.icosapent) tgMultiplier *= 0.72; // Vascepa effect
  if (counterfactual.exerciseLevel === "moderate" || counterfactual.exerciseLevel === "vigorous") tgMultiplier *= 0.85;
  if (counterfactual.statinIntensity === "high") tgMultiplier *= 0.82;
  const projectedTriglycerides = Math.max(45, Math.round(baseline.triglycerides * tgMultiplier));

  const projectedTotalChol = Math.max(90, Math.round(projectedLDL + baseline.hdl + (projectedTriglycerides / 5)));
  const projectedNonHDL = Math.max(25, projectedTotalChol - baseline.hdl);

  // 4. Calculate Risk Hazard Reductions (Based on CTT meta-analysis & Clinical Trials)
  // CTT Meta-analysis: 22% MACE reduction per 1 mmol/L (38.67 mg/dL) LDL-C reduction
  const ldlMMOLReduction = ldlDelta / 38.67;
  const ldlHazardRatio = Math.max(0.28, Math.pow(0.78, Math.max(0, ldlMMOLReduction)));

  // SBP Reduction: ~20% MACE reduction per 10 mmHg SBP reduction (SPRINT / BPLTTC)
  const actualSBPDrop = baseline.sbp - projectedSBP;
  const sbpHazardRatio = Math.max(0.55, Math.pow(0.80, actualSBPDrop / 10));

  // Smoking Cessation: ~35% relative risk reduction
  const smokingHazardRatio = (baseline.smoker === "current" && counterfactual.smokingCessation) ? 0.65 : 1.0;

  // Icosapent Ethyl (REDUCE-IT 25% MACE reduction if baseline TG >= 135)
  const icosapentHR = (counterfactual.icosapent && baseline.triglycerides >= 135) ? 0.75 : 1.0;

  // SGLT2i / GLP-1 RA (14% MACE reduction, 25% HF/Kidney reduction)
  const glp1sglt2HR = counterfactual.glp1sglt2 ? 0.84 : 1.0;

  // Aspirin (11% secondary / high risk reduction)
  const aspirinHR = (counterfactual.aspirin && (baseline.priorASCVD || baselineCalculated.tenYearRisk >= 15)) ? 0.89 : 1.0;

  // Exercise bonus HR
  const exerciseHR = counterfactual.exerciseLevel === "vigorous" ? 0.85 : counterfactual.exerciseLevel === "moderate" ? 0.92 : 1.0;

  // Combined Relative Hazard Ratio
  const combinedHR = ldlHazardRatio * sbpHazardRatio * smokingHazardRatio * icosapentHR * glp1sglt2HR * aspirinHR * exerciseHR;

  // Final Simulated 10-Year ASCVD Risk
  const simulated10YearRisk = Math.max(0.3, Math.min(90, baselineCalculated.tenYearRisk * combinedHR));

  // Lifetime CVD Risk
  const simulatedLifetimeRisk = Math.max(2.0, Math.min(95, baselineCalculated.lifetimeRisk * Math.pow(combinedHR, 0.75)));

  // Risk Category
  let simCategory: RiskCategory = "Low (<5%)";
  if (simulated10YearRisk >= 30 || baseline.priorASCVD) simCategory = "Very High (≥30% or Secondary)";
  else if (simulated10YearRisk >= 20) simCategory = "High (20-29.9%)";
  else if (simulated10YearRisk >= 7.5) simCategory = "Intermediate (7.5-19.9%)";
  else if (simulated10YearRisk >= 5.0) simCategory = "Borderline (5-7.4%)";

  // Absolute & Relative Risk Reductions
  const arr = Math.max(0, baselineCalculated.tenYearRisk - simulated10YearRisk);
  const rrr = Math.min(95, Math.max(0, (arr / Math.max(0.1, baselineCalculated.tenYearRisk)) * 100));
  const nnt = arr > 0.05 ? Math.max(1, Math.round(100 / arr)) : 999;

  // Simulated Vascular Age & Event-free years gained
  const simulatedVascularAge = Math.max(
    baseline.age - 3,
    Math.round(baselineCalculated.vascularAge - (baselineCalculated.vascularAge - baseline.age) * (1 - combinedHR) * 1.3 - (arr * 0.45))
  );
  const yearsGained = Math.max(0, (baselineCalculated.vascularAge - simulatedVascularAge) * 0.75 + (arr * 0.15));

  // Continuous Plaque Progression & Remodeling Simulation (ASTEROID/GLAGOV & FOURIER IVUS regression)
  const ldlDropRatio = Math.max(0, (baseline.ldl - projectedLDL) / Math.max(30, baseline.ldl));
  const sbpDropRatio = Math.max(0, actualSBPDrop / 40);
  const smokingBonus = (baseline.smoker === "current" && counterfactual.smokingCessation) ? 0.06 : 0;
  const drugPleiotropy = (counterfactual.statinIntensity === "high" ? 0.08 : counterfactual.statinIntensity === "moderate" ? 0.04 : 0) +
    (counterfactual.pcsk9 ? 0.09 : 0) +
    (counterfactual.icosapent ? 0.04 : 0) +
    (counterfactual.glp1sglt2 ? 0.04 : 0);

  const totalPlaqueReductionRatio = (ldlDropRatio * 0.45) + (sbpDropRatio * 0.20) + smokingBonus + drugPleiotropy;
  const continuousPlaqueModifier = Math.max(0.35, 1.0 - totalPlaqueReductionRatio);

  const simPlaqueIndex = Math.max(2, Math.round(baselineCalculated.plaqueIndex * continuousPlaqueModifier));
  let simPlaqueSeverity: "Minimal" | "Mild" | "Moderate" | "Severe" | "Critical" = "Minimal";
  if (simPlaqueIndex >= 80) simPlaqueSeverity = "Critical";
  else if (simPlaqueIndex >= 60) simPlaqueSeverity = "Severe";
  else if (simPlaqueIndex >= 40) simPlaqueSeverity = "Moderate";
  else if (simPlaqueIndex >= 20) simPlaqueSeverity = "Mild";

  const simLumenStenosis = Math.max(4, Math.round(baselineCalculated.lumenStenosisPercent * continuousPlaqueModifier));
  const simLumenAreaMm2 = Number((9.62 * (1 - simLumenStenosis / 100)).toFixed(2));
  
  // Poiseuille's law relative flow index Q ~ r^4 (or area^2)
  const baseAreaRatio = Math.max(0.05, 1 - baselineCalculated.lumenStenosisPercent / 100);
  const simAreaRatio = Math.max(0.05, 1 - simLumenStenosis / 100);
  const coronaryPerfusionIndex = Number((Math.pow(simAreaRatio / baseAreaRatio, 2)).toFixed(2));

  // Thickened fibrous cap under intensive GDMT
  const fibrousCapThicknessUm = Math.min(
    195,
    Math.round(
      baselineCalculated.fibrousCapThicknessUm +
      ldlDelta * 0.42 +
      actualSBPDrop * 0.5 +
      (counterfactual.statinIntensity === "high" ? 28 : counterfactual.statinIntensity === "moderate" ? 16 : 0) +
      (counterfactual.pcsk9 ? 22 : 0) +
      (counterfactual.smokingCessation ? 15 : 0)
    )
  );

  // Individual Event Projections
  const miProb = Math.max(0.1, simulated10YearRisk * 0.52);
  const strokeProb = Math.max(0.1, simulated10YearRisk * 0.28);
  const hfProb = Math.max(0.1, simulated10YearRisk * 0.14);
  const cvDeathProb = Math.max(0.1, simulated10YearRisk * 0.22);

  // Generate 10-Year Survival Curve Data
  const survivalCurve: SurvivalDataPoint[] = [];
  const baseAnnualRate = 1 - Math.pow(1 - (baselineCalculated.tenYearRisk / 100), 0.1);
  const simAnnualRate = 1 - Math.pow(1 - (simulated10YearRisk / 100), 0.1);

  for (let yr = 0; yr <= 10; yr++) {
    const baseSurv = Math.pow(1 - baseAnnualRate, yr) * 100;
    const simSurv = Math.pow(1 - simAnnualRate, yr) * 100;
    survivalCurve.push({
      year: yr,
      baselineSurvival: Number(baseSurv.toFixed(1)),
      counterfactualSurvival: Number(simSurv.toFixed(1)),
      baselineRisk: Number((100 - baseSurv).toFixed(1)),
      counterfactualRisk: Number((100 - simSurv).toFixed(1)),
    });
  }

  // Generate Comprehensive Multi-Factor Trajectory Data (Years 0, 1, 2, 3, 5, 7, 10)
  const trajectoryYears = [0, 1, 2, 3, 5, 7, 10];
  const biomarkerTrajectory: TrajectoryDataPoint[] = trajectoryYears.map((yr) => {
    // Natural baseline progression (worsens with aging without treatment)
    const agingFactor = 1 + (yr * 0.012);
    const bLDL = Math.round(baseline.ldl * agingFactor);
    const bSBP = Math.round(baseline.sbp + (yr * 0.85));
    const bPlaque = Math.min(100, Math.round(baselineCalculated.plaqueIndex + (yr * 2.2)));
    const bStenosis = Math.min(95, Math.round(baselineCalculated.lumenStenosisPercent + (yr * 1.8)));
    const bAnnualRate = 1 - Math.pow(1 - (baselineCalculated.tenYearRisk / 100), 0.1);
    const bCumRisk = Number(((1 - Math.pow(1 - bAnnualRate, yr)) * 100).toFixed(1));

    // Counterfactual trajectory (rapid response in year 1, sustained progression-free maintenance)
    const tRatio = yr === 0 ? 0 : yr === 1 ? 0.85 : 1.0;
    const cLDL = Math.round(baseline.ldl - (ldlDelta * tRatio));
    const cSBP = Math.round(baseline.sbp - (actualSBPDrop * tRatio));
    const cPlaque = yr === 0 ? baselineCalculated.plaqueIndex : Math.max(2, Math.round(baselineCalculated.plaqueIndex - (yr * 0.7 * (1 - continuousPlaqueModifier + 0.3))));
    const cStenosis = yr === 0 ? baselineCalculated.lumenStenosisPercent : Math.max(4, Math.round(baselineCalculated.lumenStenosisPercent - (yr * 0.6 * (1 - continuousPlaqueModifier + 0.3))));
    const cAnnualRate = 1 - Math.pow(1 - (simulated10YearRisk / 100), 0.1);
    const cCumRisk = Number(((1 - Math.pow(1 - cAnnualRate, yr)) * 100).toFixed(1));

    return {
      year: yr,
      baselineLDL: bLDL,
      counterfactualLDL: cLDL,
      baselineSBP: bSBP,
      counterfactualSBP: cSBP,
      baselinePlaque: bPlaque,
      counterfactualPlaque: cPlaque,
      baselineStenosis: bStenosis,
      counterfactualStenosis: cStenosis,
      baselineRisk: bCumRisk,
      counterfactualRisk: cCumRisk,
    };
  });

  return {
    tenYearRisk: Number(simulated10YearRisk.toFixed(1)),
    lifetimeRisk: Number(simulatedLifetimeRisk.toFixed(1)),
    riskCategory: simCategory,
    vascularAge: simulatedVascularAge,
    vascularAgeDelta: simulatedVascularAge - baseline.age,
    miProb: Number(miProb.toFixed(1)),
    strokeProb: Number(strokeProb.toFixed(1)),
    hfProb: Number(hfProb.toFixed(1)),
    cvDeathProb: Number(cvDeathProb.toFixed(1)),
    plaqueIndex: simPlaqueIndex,
    plaqueSeverity: simPlaqueSeverity,
    lumenStenosisPercent: simLumenStenosis,
    lumenAreaMm2: simLumenAreaMm2,
    coronaryPerfusionIndex,
    fibrousCapThicknessUm,
    arterialStiffnessScore: Math.max(1, baselineCalculated.arterialStiffnessScore - 1),
    hyperlipidemiaPhenotype: baselineCalculated.hyperlipidemiaPhenotype,
    fhScore: baselineCalculated.fhScore,
    fhLikelihood: baselineCalculated.fhLikelihood,
    projectedLDL,
    projectedSBP,
    projectedTotalChol,
    projectedNonHDL,
    projectedTriglycerides,
    arr: Number(arr.toFixed(1)),
    rrr: Number(rrr.toFixed(1)),
    nnt,
    yearsGained: Number(yearsGained.toFixed(1)),
    survivalCurve,
    biomarkerTrajectory,
    riskBreakdown: baselineCalculated.riskBreakdown,
  };
}

/**
 * Master Baseline Calculator
 */
export function calculateBaselineTwin(patient: PatientBiomarkers): CalculatedRisk {
  // 1. Raw PCE 10-Year Risk
  const rawPCE = calculateRawPCERisk(patient);

  // 2. Enhanced ASCVD Risk with CAC, Lp(a), eGFR, Family History
  const enhanced = calculateEnhancedASCVD(patient, rawPCE);

  // 3. Lifetime CVD Risk
  let lifetimeRisk = patient.sex === "male" ? 38.0 : 28.0;
  if (patient.smoker === "current") lifetimeRisk += 14;
  if (patient.diabetes) lifetimeRisk += 16;
  if (patient.sbp >= 140) lifetimeRisk += 10;
  if (patient.totalChol >= 240 || patient.ldl >= 160) lifetimeRisk += 12;
  if (patient.priorASCVD) lifetimeRisk = 75.0;
  lifetimeRisk = Math.min(95, Math.max(5, lifetimeRisk));

  // 4. Vascular Age
  const vascularAge = calculateVascularAge(patient, enhanced.risk);

  // 5. Hyperlipidemia evaluation
  const lipidEval = evaluateHyperlipidemia(patient);

  // 6. Plaque & Stenosis metrics
  const plaqueMetrics = calculatePlaqueMetrics(patient, vascularAge);

  // 7. Individual event probabilities
  const miProb = Math.max(0.2, enhanced.risk * 0.54);
  const strokeProb = Math.max(0.1, enhanced.risk * 0.29);
  const hfProb = Math.max(0.1, enhanced.risk * 0.16);
  const cvDeathProb = Math.max(0.1, enhanced.risk * 0.23);

  // 8. Risk Factor Contribution Attribution
  const totalCholScore = Math.max(0, (patient.ldl - 70) * 0.35 + (patient.triglycerides > 150 ? 10 : 0));
  const bpScore = Math.max(0, (patient.sbp - 115) * 0.45);
  const metabolicScore = (patient.diabetes ? 25 : 0) + Math.max(0, (patient.glucose - 90) * 0.15) + (patient.egfr < 60 ? 15 : 0);
  const lifestyleScore = (patient.smoker === "current" ? 28 : patient.smoker === "former" ? 8 : 0) + (patient.bmi > 28 ? 10 : 0);
  const nonModifiableScore = (patient.familyHistoryCAD ? 18 : 0) + (patient.cac > 100 ? 15 : 5);

  const sumAttribution = totalCholScore + bpScore + metabolicScore + lifestyleScore + nonModifiableScore || 1;

  const riskBreakdown: RiskAttribution[] = [
    {
      factor: "Atherogenic Lipids (LDL / ApoB)",
      score: Math.round(totalCholScore),
      contributionPercent: Math.round((totalCholScore / sumAttribution) * 100),
      color: "#ef4444", // red-500
      description: `LDL ${patient.ldl} mg/dL, TG ${patient.triglycerides} mg/dL`,
    },
    {
      factor: "Hemodynamic Shear (Blood Pressure)",
      score: Math.round(bpScore),
      contributionPercent: Math.round((bpScore / sumAttribution) * 100),
      color: "#f97316", // orange-500
      description: `SBP ${patient.sbp}/${patient.dbp} mmHg (${patient.onBPMeds ? "Treated" : "Untreated"})`,
    },
    {
      factor: "Metabolic & Renal Synergy",
      score: Math.round(metabolicScore),
      contributionPercent: Math.round((metabolicScore / sumAttribution) * 100),
      color: "#eab308", // yellow-500
      description: `${patient.diabetes ? "Diabetic" : "Non-diabetic"}, eGFR ${patient.egfr}`,
    },
    {
      factor: "Lifestyle & Environmental",
      score: Math.round(lifestyleScore),
      contributionPercent: Math.round((lifestyleScore / sumAttribution) * 100),
      color: "#06b6d4", // cyan-500
      description: `Smoking: ${patient.smoker}, BMI: ${patient.bmi}`,
    },
    {
      factor: "Genetics & Subclinical Plaque (CAC)",
      score: Math.round(nonModifiableScore),
      contributionPercent: Math.round((nonModifiableScore / sumAttribution) * 100),
      color: "#a855f7", // purple-500
      description: `CAC ${patient.cac} Agatston, FamHx: ${patient.familyHistoryCAD ? "Positive" : "Negative"}`,
    },
  ];

  // 9. Survival Curve Data (Baseline)
  const survivalCurve: SurvivalDataPoint[] = [];
  const baseAnnualRate = 1 - Math.pow(1 - (enhanced.risk / 100), 0.1);
  for (let yr = 0; yr <= 10; yr++) {
    const baseSurv = Math.pow(1 - baseAnnualRate, yr) * 100;
    survivalCurve.push({
      year: yr,
      baselineSurvival: Number(baseSurv.toFixed(1)),
      counterfactualSurvival: Number(baseSurv.toFixed(1)),
      baselineRisk: Number((100 - baseSurv).toFixed(1)),
      counterfactualRisk: Number((100 - baseSurv).toFixed(1)),
    });
  }

  // 10. Trajectory Data (Baseline)
  const trajectoryYears = [0, 1, 2, 3, 5, 7, 10];
  const biomarkerTrajectory: TrajectoryDataPoint[] = trajectoryYears.map((yr) => {
    const agingFactor = 1 + (yr * 0.012);
    const bLDL = Math.round(patient.ldl * agingFactor);
    const bSBP = Math.round(patient.sbp + (yr * 0.85));
    const bPlaque = Math.min(100, Math.round(plaqueMetrics.plaqueIndex + (yr * 2.2)));
    const bStenosis = Math.min(95, Math.round(plaqueMetrics.lumenStenosisPercent + (yr * 1.8)));
    const bCumRisk = Number(((1 - Math.pow(1 - baseAnnualRate, yr)) * 100).toFixed(1));

    return {
      year: yr,
      baselineLDL: bLDL,
      counterfactualLDL: bLDL,
      baselineSBP: bSBP,
      counterfactualSBP: bSBP,
      baselinePlaque: bPlaque,
      counterfactualPlaque: bPlaque,
      baselineStenosis: bStenosis,
      counterfactualStenosis: bStenosis,
      baselineRisk: bCumRisk,
      counterfactualRisk: bCumRisk,
    };
  });

  return {
    tenYearRisk: Number(enhanced.risk.toFixed(1)),
    lifetimeRisk: Number(lifetimeRisk.toFixed(1)),
    riskCategory: enhanced.category,
    vascularAge,
    vascularAgeDelta: vascularAge - patient.age,
    miProb: Number(miProb.toFixed(1)),
    strokeProb: Number(strokeProb.toFixed(1)),
    hfProb: Number(hfProb.toFixed(1)),
    cvDeathProb: Number(cvDeathProb.toFixed(1)),
    plaqueIndex: plaqueMetrics.plaqueIndex,
    plaqueSeverity: plaqueMetrics.plaqueSeverity,
    lumenStenosisPercent: plaqueMetrics.lumenStenosisPercent,
    lumenAreaMm2: plaqueMetrics.lumenAreaMm2,
    coronaryPerfusionIndex: plaqueMetrics.coronaryPerfusionIndex,
    fibrousCapThicknessUm: plaqueMetrics.fibrousCapThicknessUm,
    arterialStiffnessScore: plaqueMetrics.arterialStiffnessScore,
    hyperlipidemiaPhenotype: lipidEval.phenotype,
    fhScore: lipidEval.fhScore,
    fhLikelihood: lipidEval.fhLikelihood,
    projectedLDL: patient.ldl,
    projectedSBP: patient.sbp,
    projectedTotalChol: patient.totalChol,
    projectedNonHDL: patient.totalChol - patient.hdl,
    projectedTriglycerides: patient.triglycerides,
    arr: 0,
    rrr: 0,
    nnt: 0,
    yearsGained: 0,
    survivalCurve,
    biomarkerTrajectory,
    riskBreakdown,
  };
}

export const calculateBaselineRisk = calculateBaselineTwin;

export function calculateCounterfactualRisk(
  patient: PatientBiomarkers,
  counterfactual: CounterfactualTreatment
): CalculatedRisk {
  const baselineCalc = calculateBaselineTwin(patient);
  return simulateCounterfactualTwin(patient, counterfactual, baselineCalc);
}
