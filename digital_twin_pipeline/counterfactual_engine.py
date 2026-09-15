"""
Therapeutic Optimization (Counterfactual Simulation Loop) Module
Simulates clinical interventions, pharmacotherapy titrations, and lifestyle modifications
to compute exact risk deltas (ΔRisk), ARR, RRR, NNT, and 3-to-5-year event projections.
"""

import math
import copy
from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional
from .ml_risk_models import NonLinearASCVDClassifier, PredictionOutput


@dataclass
class TreatmentIntervention:
    """
    Specification of counterfactual interventions to apply to a patient's baseline profile.
    Aligned with Cardiological Society of India (CSI), ICMR, API, and Indian Consensus Guidelines.
    """
    # Pharmacotherapy levers (Indian GDMT & FDCs)
    statin_intensity: str = "none"  # 'none', 'low', 'moderate', 'high'
    fdc_statin_ezetimibe: bool = False  # Indian FDC: Rosuvastatin 10/20mg + Ezetimibe 10mg (Lowers SAMS risk while achieving ~60% LDL drop)
    ezetimibe: bool = False  # +18-20% LDL reduction
    pcsk9_inhibitor: bool = False  # Evolocumab / Alirocumab / Inclisiran (+55-60% LDL, -25-30% Lp(a))
    bempedoic_acid: bool = False  # +15-25% LDL reduction (Bempe/Nexlizet)
    fdc_triple_lipid: bool = False  # Triple FDC: Statin + Bempedoic Acid + Ezetimibe
    saroglitazar: bool = False  # Lipaglyn (DCGI-approved Dual PPAR-α/γ agonist for diabetic dyslipidemia, TG reduction ~45%, HDL increase, NASH/MASLD)
    fenofibrate_fdc: bool = False  # Statin + Micronized Fenofibrate (for severe mixed dyslipidemia with TG > 200 mg/dL)
    icosapent_ethyl: bool = False  # Purified EPA (for residual CV risk & TG >= 150 mg/dL)
    sglt2_inhibitor: bool = False  # Empagliflozin 10/25mg or Dapagliflozin 10mg (Renoprotection & HF MACE reduction)
    glp1_ra: bool = False  # Semaglutide / Tirzepatide (Metabolic weight loss & anti-atherosclerotic GDMT)
    sglt2_or_glp1ra: bool = False  # Generic cardiometabolic toggle for backwards compatibility

    # Antihypertensive GDMT Regimen (Indian Hypertension Guidelines IHG-IV)
    antihypertensive_regimen: str = "none"  # 'none', 'arb_mono', 'arb_ccb_fdc', 'triple_fdc'
    target_sbp_reduction_mmhg: float = 0.0  # Custom additional SBP reduction (0-40 mmHg)
    direct_ldl_reduction_pct: float = 0.0  # Optional direct LDL override percentage (0-80%)
    direct_hba1c_reduction: float = 0.0  # e.g. 0.5 - 2.5% HbA1c lowering

    # Lifestyle & Metabolic modifications (Indian diet & exercise)
    diet_pattern: str = "standard"  # 'standard', 'mediterranean_south_asian', 'dash', 'low_carb_plant', 'traditional_indian_modified'
    exercise_level: str = "sedentary"  # 'sedentary', 'moderate', 'vigorous'
    smoking_cessation: bool = False
    weight_loss_pct: float = 0.0  # 0 to 20% total body weight reduction


@dataclass
class SimulationResult:
    """
    Detailed counterfactual simulation outcome comparing baseline vs post-intervention twins.
    """
    baseline_prediction: PredictionOutput
    counterfactual_prediction: PredictionOutput

    # Absolute and Relative deltas
    delta_risk_5yr_pct: float  # Baseline - Counterfactual (Positive is risk reduction)
    relative_risk_reduction_5yr_pct: float  # RRR %
    absolute_risk_reduction_5yr_pct: float  # ARR %
    number_needed_to_treat_5yr: float  # NNT = 100 / ARR

    delta_risk_3yr_pct: float
    relative_risk_reduction_3yr_pct: float

    delta_risk_10yr_pct: float
    relative_risk_reduction_10yr_pct: float

    # Biological age deltas
    baseline_vascular_age: float
    counterfactual_vascular_age: float
    vascular_years_rejuvenated: float

    # Biomarker trajectories (Baseline -> Counterfactual)
    projected_biomarkers: Dict[str, Dict[str, float]]

    # Clinical guideline commentary
    actionable_recommendations: List[str]


class CounterfactualSimulationEngine:
    """
    Executes counterfactual simulation loops by applying physiological transition matrices
    to baseline feature vectors and passing them through the non-linear risk model.
    """

    def __init__(self, classifier: Optional[NonLinearASCVDClassifier] = None):
        self.classifier = classifier or NonLinearASCVDClassifier()

    def apply_treatment_matrix(
        self, baseline_patient: Dict[str, Any], intervention: TreatmentIntervention
    ) -> Dict[str, Any]:
        """
        Transforms the baseline patient vector into a counterfactual post-intervention vector.
        Follows pharmacological pharmacokinetic response curves and lifestyle clinical trial evidence.
        """
        post = copy.deepcopy(baseline_patient)

        # 1. Lipid Lowering Pharmacotherapy (Multiplicative LDL & ApoB reductions)
        ldl_retention = 1.0

        # High-intensity statin in Indian clinical context (Atorvastatin 40-80mg or Rosuvastatin 20-40mg: ~50% drop)
        if intervention.statin_intensity == "low":
            ldl_retention *= (1.0 - 0.28)
        elif intervention.statin_intensity == "moderate":
            ldl_retention *= (1.0 - 0.38)
        elif intervention.statin_intensity == "high":
            ldl_retention *= (1.0 - 0.50)

        # Indian FDC: Rosuvastatin + Ezetimibe (avoids high-dose statin myopathy / SAMS, achieves ~60% LDL drop)
        if intervention.fdc_statin_ezetimibe:
            ldl_retention *= (1.0 - 0.58)

        if intervention.ezetimibe and not intervention.fdc_statin_ezetimibe:
            ldl_retention *= (1.0 - 0.19)

        if intervention.pcsk9_inhibitor:
            ldl_retention *= (1.0 - 0.58)
            # PCSK9i / siRNA also reduces Lp(a) by ~25-30%
            post["lp_a"] = max(5.0, float(post.get("lp_a", 30.0)) * 0.72)

        if intervention.bempedoic_acid:
            ldl_retention *= (1.0 - 0.20)

        if intervention.fdc_triple_lipid:
            # Triple FDC: Statin + Bempedoic Acid + Ezetimibe (~68-72% LDL reduction)
            ldl_retention *= (1.0 - 0.70)

        if intervention.saroglitazar:
            # Saroglitazar (Lipaglyn): DCGI approved dual PPAR-α/γ agonist
            # Lowers LDL by 15-20%, raises HDL, and dramatically lowers TG
            ldl_retention *= (1.0 - 0.16)

        if intervention.direct_ldl_reduction_pct > 0:
            ldl_retention *= (1.0 - (intervention.direct_ldl_reduction_pct / 100.0))

        # Dietary impact on LDL
        if intervention.diet_pattern in ("mediterranean_south_asian", "dash", "traditional_indian_modified"):
            ldl_retention *= 0.92

        # Apply LDL update
        base_ldl = float(baseline_patient.get("ldl_c", 130.0))
        post_ldl = max(20.0, base_ldl * ldl_retention)
        post["ldl_c"] = round(post_ldl, 1)

        # ApoB decreases proportionally with LDL-C and TG reductions (CSI target <65 for very high risk)
        base_apob = float(baseline_patient.get("apo_b", 100.0))
        post_apob = max(30.0, base_apob * (0.22 + 0.78 * (post_ldl / max(30.0, base_ldl))))
        post["apo_b"] = round(post_apob, 1)

        # 2. Triglycerides and HDL Modulation (Targeting the Atherogenic Triad)
        base_tg = float(baseline_patient.get("triglycerides", 180.0))
        tg_retention = 1.0

        if intervention.saroglitazar:
            # Saroglitazar reduces TG by 42-48%
            tg_retention *= 0.55

        if intervention.fenofibrate_fdc:
            # Statin + Fenofibrate FDC reduces TG by ~35-40%
            tg_retention *= 0.62

        if intervention.icosapent_ethyl:
            tg_retention *= 0.78  # 22% TG lowering + membrane stabilization

        if intervention.diet_pattern in ("mediterranean_south_asian", "traditional_indian_modified"):
            tg_retention *= 0.86
        elif intervention.diet_pattern == "low_carb_plant":
            tg_retention *= 0.80

        if intervention.exercise_level == "moderate":
            tg_retention *= 0.88
        elif intervention.exercise_level == "vigorous":
            tg_retention *= 0.80

        if intervention.weight_loss_pct > 0:
            tg_retention *= max(0.60, 1.0 - (intervention.weight_loss_pct * 0.024))

        post_tg = max(45.0, base_tg * tg_retention)
        post["triglycerides"] = round(post_tg, 1)

        # HDL enhancement
        base_hdl = float(baseline_patient.get("hdl_c", 40.0))
        hdl_boost = 0.0
        if intervention.saroglitazar:
            hdl_boost += 4.5  # PPAR-α effect on HDL synthesis
        if intervention.fenofibrate_fdc:
            hdl_boost += 4.0
        if intervention.exercise_level == "moderate":
            hdl_boost += 3.5
        elif intervention.exercise_level == "vigorous":
            hdl_boost += 7.0
        if intervention.diet_pattern in ("mediterranean_south_asian", "dash", "traditional_indian_modified"):
            hdl_boost += 2.5
        if intervention.weight_loss_pct >= 5.0:
            hdl_boost += (intervention.weight_loss_pct * 0.45)

        post["hdl_c"] = round(min(90.0, base_hdl + hdl_boost), 1)

        # Total cholesterol recalculation
        post["serum_cholesterol"] = round(post["hdl_c"] + post["ldl_c"] + (post["triglycerides"] / 5.0), 1)

        # 3. Blood Pressure Management (Indian Hypertension Guidelines IHG-IV)
        base_sbp = float(baseline_patient.get("resting_bp_systolic", 130.0))
        sbp_drop = intervention.target_sbp_reduction_mmhg

        if intervention.antihypertensive_regimen == "arb_mono":
            sbp_drop += 12.0  # Telmisartan 40-80mg or Azilsartan 40mg
        elif intervention.antihypertensive_regimen == "arb_ccb_fdc":
            sbp_drop += 22.0  # Telmisartan + Cilnidipine 10mg FDC (Indian first-line to avoid edema)
        elif intervention.antihypertensive_regimen == "triple_fdc":
            sbp_drop += 30.0  # Telmisartan + Cilnidipine + Chlorthalidone 12.5mg FDC

        if intervention.diet_pattern == "dash":
            sbp_drop += 6.0
        elif intervention.diet_pattern in ("mediterranean_south_asian", "traditional_indian_modified"):
            sbp_drop += 3.5

        if intervention.exercise_level in ("moderate", "vigorous"):
            sbp_drop += 4.5

        if intervention.weight_loss_pct > 0:
            sbp_drop += (intervention.weight_loss_pct * 0.85)

        if intervention.sglt2_inhibitor or intervention.sglt2_or_glp1ra:
            sbp_drop += 4.0

        post_sbp = max(95.0, base_sbp - sbp_drop)
        post["resting_bp_systolic"] = round(post_sbp, 1)

        base_dbp = float(baseline_patient.get("resting_bp_diastolic", 82.0))
        post["resting_bp_diastolic"] = round(max(60.0, base_dbp - (sbp_drop * 0.55)), 1)

        # 4. Glycemic and Metabolic Control (RSSDI / ICMR Guidelines)
        base_hba1c = float(baseline_patient.get("hba1c", 5.8))
        hba1c_drop = intervention.direct_hba1c_reduction

        if intervention.sglt2_inhibitor or intervention.sglt2_or_glp1ra:
            hba1c_drop += 0.85
        if intervention.glp1_ra:
            hba1c_drop += 1.30
        if intervention.saroglitazar:
            hba1c_drop += 0.45  # PPAR-γ insulin sensitizing effect

        if intervention.weight_loss_pct >= 5.0:
            hba1c_drop += (intervention.weight_loss_pct * 0.06)

        if intervention.exercise_level in ("moderate", "vigorous"):
            hba1c_drop += 0.40

        post_hba1c = max(4.8, base_hba1c - hba1c_drop)
        post["hba1c"] = round(post_hba1c, 1)

        base_fbs = float(baseline_patient.get("fasting_blood_sugar", 105.0))
        post["fasting_blood_sugar"] = round(max(75.0, base_fbs - (hba1c_drop * 24.0)), 1)
        if post["hba1c"] < 6.5 and post["fasting_blood_sugar"] < 126.0:
            post["diabetes"] = 0

        # 5. Weight & Asian-Indian BMI / Waist Circumference
        base_bmi = float(baseline_patient.get("bmi", 26.5))
        loss_pct = intervention.weight_loss_pct
        if intervention.glp1_ra and loss_pct == 0:
            loss_pct = 8.5
        elif (intervention.sglt2_inhibitor or intervention.sglt2_or_glp1ra) and loss_pct == 0:
            loss_pct = 3.5

        if loss_pct > 0:
            post["bmi"] = round(base_bmi * (1.0 - loss_pct / 100.0), 2)
            if "waist_circumference_cm" in baseline_patient:
                base_wc = float(baseline_patient["waist_circumference_cm"])
                post["waist_circumference_cm"] = round(max(60.0, base_wc * (1.0 - (loss_pct * 0.85) / 100.0)), 1)

        # Update Asian Indian BMI category
        post_bmi_val = float(post["bmi"])
        if post_bmi_val < 18.5:
            post["asian_indian_bmi_category"] = "Underweight (<18.5)"
        elif post_bmi_val < 23.0:
            post["asian_indian_bmi_category"] = "Normal (18.5-22.9)"
        elif post_bmi_val < 25.0:
            post["asian_indian_bmi_category"] = "Overweight (23.0-24.9)"
        else:
            post["asian_indian_bmi_category"] = "Obese (≥25.0)"

        # Re-evaluate atherogenic triad
        is_m = str(post.get("sex", "male")).lower() == "male"
        post["atherogenic_triad"] = 1 if (post["triglycerides"] >= 150.0 and post["hdl_c"] < (40.0 if is_m else 50.0) and post["apo_b"] >= 90.0) else 0

        # 6. Smoking Cessation
        if intervention.smoking_cessation and str(baseline_patient.get("smoker", "")).lower() == "current":
            post["smoker"] = "former"

        return post

    def simulate(
        self, baseline_patient: Dict[str, Any], intervention: TreatmentIntervention
    ) -> SimulationResult:
        """
        Executes the full digital twin simulation loop comparing baseline vs counterfactual states.
        """
        # 1. Baseline prediction
        base_pred = self.classifier.predict_detailed(baseline_patient)

        # 2. Apply physiological transformation matrix
        counterfactual_patient = self.apply_treatment_matrix(baseline_patient, intervention)

        # 3. Counterfactual prediction
        cf_pred = self.classifier.predict_detailed(counterfactual_patient)

        # Apply specific trial hazard multiplier for Icosapent Ethyl (REDUCE-IT 25% RRR) if applicable
        if intervention.icosapent_ethyl and float(baseline_patient.get("triglycerides", 180)) >= 135:
            adj_5yr = cf_pred.continuous_ascvd_5yr_risk_pct * 0.75
            adj_3yr = cf_pred.continuous_ascvd_3yr_risk_pct * 0.75
            adj_10yr = cf_pred.continuous_ascvd_10yr_risk_pct * 0.75
            cf_pred.continuous_ascvd_5yr_risk_pct = round(adj_5yr, 2)
            cf_pred.continuous_ascvd_3yr_risk_pct = round(adj_3yr, 2)
            cf_pred.continuous_ascvd_10yr_risk_pct = round(adj_10yr, 2)

        # Apply SGLT2i / GLP-1 RA MACE hazard reduction (14% RRR) if diabetic
        if intervention.sglt2_or_glp1ra and baseline_patient.get("diabetes"):
            adj_5yr = cf_pred.continuous_ascvd_5yr_risk_pct * 0.86
            adj_3yr = cf_pred.continuous_ascvd_3yr_risk_pct * 0.86
            adj_10yr = cf_pred.continuous_ascvd_10yr_risk_pct * 0.86
            cf_pred.continuous_ascvd_5yr_risk_pct = round(adj_5yr, 2)
            cf_pred.continuous_ascvd_3yr_risk_pct = round(adj_3yr, 2)
            cf_pred.continuous_ascvd_10yr_risk_pct = round(adj_10yr, 2)

        # Deltas
        arr_5yr = round(max(0.0, base_pred.continuous_ascvd_5yr_risk_pct - cf_pred.continuous_ascvd_5yr_risk_pct), 2)
        rrr_5yr = round((arr_5yr / max(0.1, base_pred.continuous_ascvd_5yr_risk_pct)) * 100, 1)
        nnt_5yr = round(100.0 / max(0.01, arr_5yr), 1) if arr_5yr > 0 else 999.0

        arr_3yr = round(max(0.0, base_pred.continuous_ascvd_3yr_risk_pct - cf_pred.continuous_ascvd_3yr_risk_pct), 2)
        rrr_3yr = round((arr_3yr / max(0.1, base_pred.continuous_ascvd_3yr_risk_pct)) * 100, 1)

        arr_10yr = round(max(0.0, base_pred.continuous_ascvd_10yr_risk_pct - cf_pred.continuous_ascvd_10yr_risk_pct), 2)
        rrr_10yr = round((arr_10yr / max(0.1, base_pred.continuous_ascvd_10yr_risk_pct)) * 100, 1)

        years_rejuv = round(max(0.0, base_pred.vascular_age - cf_pred.vascular_age), 1)

        # Biomarker comparison dictionary
        projected = {
            "LDL-C (mg/dL)": {
                "baseline": float(baseline_patient.get("ldl_c", 130)),
                "counterfactual": float(counterfactual_patient.get("ldl_c", 130)),
                "delta": round(float(counterfactual_patient.get("ldl_c", 130)) - float(baseline_patient.get("ldl_c", 130)), 1),
            },
            "ApoB (mg/dL)": {
                "baseline": float(baseline_patient.get("apo_b", 100)),
                "counterfactual": float(counterfactual_patient.get("apo_b", 100)),
                "delta": round(float(counterfactual_patient.get("apo_b", 100)) - float(baseline_patient.get("apo_b", 100)), 1),
            },
            "Systolic BP (mmHg)": {
                "baseline": float(baseline_patient.get("resting_bp_systolic", 130)),
                "counterfactual": float(counterfactual_patient.get("resting_bp_systolic", 130)),
                "delta": round(float(counterfactual_patient.get("resting_bp_systolic", 130)) - float(baseline_patient.get("resting_bp_systolic", 130)), 1),
            },
            "Triglycerides (mg/dL)": {
                "baseline": float(baseline_patient.get("triglycerides", 180)),
                "counterfactual": float(counterfactual_patient.get("triglycerides", 180)),
                "delta": round(float(counterfactual_patient.get("triglycerides", 180)) - float(baseline_patient.get("triglycerides", 180)), 1),
            },
            "HDL-C (mg/dL)": {
                "baseline": float(baseline_patient.get("hdl_c", 40)),
                "counterfactual": float(counterfactual_patient.get("hdl_c", 40)),
                "delta": round(float(counterfactual_patient.get("hdl_c", 40)) - float(baseline_patient.get("hdl_c", 40)), 1),
            },
            "HbA1c (%)": {
                "baseline": float(baseline_patient.get("hba1c", 5.8)),
                "counterfactual": float(counterfactual_patient.get("hba1c", 5.8)),
                "delta": round(float(counterfactual_patient.get("hba1c", 5.8)) - float(baseline_patient.get("hba1c", 5.8)), 1),
            },
            "BMI": {
                "baseline": float(baseline_patient.get("bmi", 26.5)),
                "counterfactual": float(counterfactual_patient.get("bmi", 26.5)),
                "delta": round(float(counterfactual_patient.get("bmi", 26.5)) - float(baseline_patient.get("bmi", 26.5)), 2),
            },
            "Non-HDL-C (mg/dL)": {
                "baseline": round(float(baseline_patient.get("serum_cholesterol", 200)) - float(baseline_patient.get("hdl_c", 40)), 1),
                "counterfactual": round(float(counterfactual_patient.get("serum_cholesterol", 200)) - float(counterfactual_patient.get("hdl_c", 40)), 1),
                "delta": round((float(counterfactual_patient.get("serum_cholesterol", 200)) - float(counterfactual_patient.get("hdl_c", 40))) - (float(baseline_patient.get("serum_cholesterol", 200)) - float(baseline_patient.get("hdl_c", 40))), 1),
            },
        }

        # CSI / ICMR-INDIAB / IHG-IV Actionable Clinical Guidance
        recs: List[str] = []
        cf_ldl = float(counterfactual_patient.get("ldl_c", 100))
        cf_apob = float(counterfactual_patient.get("apo_b", 100))
        cf_tg = float(counterfactual_patient.get("triglycerides", 180))
        cf_sbp = float(counterfactual_patient.get("resting_bp_systolic", 130))
        cf_hba1c = float(counterfactual_patient.get("hba1c", 5.8))

        if arr_5yr >= 5.0:
            recs.append(f"Cardioprotective Delta: 5-Year ARR of {arr_5yr}% (RRR {rrr_5yr}%, NNT {nnt_5yr}).")
        if cf_pred.vascular_age < base_pred.vascular_age:
            recs.append(f"Vascular Rejuvenation: Arterial age reduced by {years_rejuv} years (from {base_pred.vascular_age} to {cf_pred.vascular_age} years).")

        # CSI Lipid Target Thresholds
        if cf_ldl <= 30.0:
            recs.append("CSI Extreme Risk Target Achieved: LDL-C ≤ 30 mg/dL (Indicated for recurrent acute coronary syndromes or multi-vessel CAD with diabetes).")
        elif cf_ldl <= 55.0:
            recs.append("CSI Very High Risk Target Achieved: LDL-C ≤ 55 mg/dL (<1.4 mmol/L) with ≥50% reduction from baseline.")
        elif cf_ldl <= 70.0:
            recs.append("CSI High Risk Target Achieved: LDL-C ≤ 70 mg/dL (<1.8 mmol/L).")
        else:
            recs.append(f"CSI Target Pending: Projected LDL-C is {cf_ldl} mg/dL. Consider intensifying to Rosuvastatin + Ezetimibe FDC or adding Bempedoic Acid / PCSK9 inhibitor to attain <55 mg/dL.")

        # ApoB & Non-HDL Targets (CSI)
        if cf_apob <= 65.0:
            recs.append("CSI ApoB Goal Met: ApoB ≤ 65 mg/dL (optimal suppression of total atherogenic particle burden).")
        elif cf_apob <= 80.0:
            recs.append("CSI ApoB High-Risk Goal Met: ApoB ≤ 80 mg/dL.")

        # Atherogenic Triad & Triglycerides
        if cf_tg < 150.0:
            recs.append("Hypertriglyceridemia Controlled: Fasting Triglycerides < 150 mg/dL.")
        elif cf_tg >= 200.0:
            recs.append("Residual Hypertriglyceridemia (TG ≥ 200 mg/dL): Consider Saroglitazar 4 mg or Statin + Fenofibrate FDC to address remnant cholesterol.")

        # Blood Pressure Target (IHG-IV)
        if cf_sbp <= 130.0:
            recs.append("IHG-IV Blood Pressure Target Achieved: Systolic BP ≤ 130 mmHg.")
        else:
            recs.append(f"Blood Pressure Alert: SBP is {cf_sbp} mmHg (IHG-IV recommends <130/80 mmHg using Telmisartan + Cilnidipine FDC).")

        # Glycemic Control (RSSDI)
        if baseline_patient.get("diabetes") or cf_hba1c >= 6.5:
            if cf_hba1c < 7.0:
                recs.append("RSSDI Glycemic Target Met: HbA1c < 7.0% without excess hypoglycemia risk.")
            else:
                recs.append(f"Metabolic Optimization Needed: HbA1c is {cf_hba1c}%. Prioritize SGLT2i (Empagliflozin/Dapagliflozin) or GLP-1 RA.")

        return SimulationResult(
            baseline_prediction=base_pred,
            counterfactual_prediction=cf_pred,
            delta_risk_5yr_pct=arr_5yr,
            relative_risk_reduction_5yr_pct=rrr_5yr,
            absolute_risk_reduction_5yr_pct=arr_5yr,
            number_needed_to_treat_5yr=nnt_5yr,
            delta_risk_3yr_pct=arr_3yr,
            relative_risk_reduction_3yr_pct=rrr_3yr,
            delta_risk_10yr_pct=arr_10yr,
            relative_risk_reduction_10yr_pct=rrr_10yr,
            baseline_vascular_age=base_pred.vascular_age,
            counterfactual_vascular_age=cf_pred.vascular_age,
            vascular_years_rejuvenated=years_rejuv,
            projected_biomarkers=projected,
            actionable_recommendations=recs,
        )
