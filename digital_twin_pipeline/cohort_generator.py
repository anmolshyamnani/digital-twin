"""
In Silico Trial Augmentation Module
Specialized for South Asian and Indian Clinical Cohorts (INTERHEART / MASALA / CADI epidemiology)
"""

import math
import random
import csv
import json
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional, Tuple


@dataclass
class SyntheticPatientRecord:
    patient_id: str
    age: float
    sex: str  # 'male' or 'female'
    bmi: float
    waist_circumference_cm: float  # Indian cutoffs: Men >= 90 cm, Women >= 80 cm
    asian_indian_bmi_category: str  # 'Normal (18.5-22.9)', 'Overweight (23.0-24.9)', 'Obese (≥25.0)'
    resting_bp_systolic: float
    resting_bp_diastolic: float
    serum_cholesterol: float
    triglycerides: float
    hdl_c: float
    ldl_c: float
    fasting_blood_sugar: float
    hba1c: float
    max_heart_rate: float
    resting_heart_rate: float
    lp_a: float  # Lipoprotein(a) in nmol/L (or mg/dL: >=50 mg/dL is high risk in CSI guidelines)
    apo_b: float  # Apolipoprotein B in mg/dL (CSI target <65 in very high risk, <80 in high risk)
    atherogenic_triad: int  # 1 if High TG + Low HDL + Elevated ApoB
    smoker: str  # 'never', 'former', 'current'
    diabetes: int  # 0 or 1
    family_history_cad: int  # 0 or 1 (premature 1st degree: males <55, females <65)
    coronary_calcium_score: float  # Agatston score
    true_ascvd_5yr_event: int  # Synthetic ground-truth event outcome (0 or 1)
    true_subclinical_risk: float  # Continuous true underlying risk (0.0 - 1.0)


class SouthAsianCohortGenerator:
    """
    Generates realistic synthetic patient cohorts modeling South Asian cardiovascular phenotypes:
    - Early-onset vascular disease (mean age shifted younger)
    - Atherogenic dyslipidemia phenotype: High Triglycerides, Low HDL-C, Elevated ApoB
    - Heightened prevalence of hyper-Lp(a) (> 125 nmol/L in ~35% of population)
    - Lower BMI thresholds for metabolic dysfunction (South Asian phenotype: normal weight central adiposity)
    - Elevated rates of prediabetes and microvascular/macrovascular insulin resistance
    """

    def __init__(self, seed: Optional[int] = 42):
        if seed is not None:
            random.seed(seed)

    @staticmethod
    def _clamp(val: float, low: float, high: float) -> float:
        return max(low, min(high, val))

    def _sample_correlated_multivariate(
        self,
        male_ratio: float = 0.58,
        age_mean: float = 48.5,
        age_sd: float = 11.2,
    ) -> Dict[str, Any]:
        """
        Samples a single clinical profile incorporating South Asian physiological covariance matrices.
        """
        # Latent cardiometabolic health axis z ~ N(0, 1)
        z_metabolic = random.gauss(0, 1)
        z_vascular = random.gauss(0, 1)
        z_genetic_lipid = random.gauss(0, 1)

        # 1. Demographics
        is_male = random.random() < male_ratio
        sex_str = "male" if is_male else "female"

        # Age: Gamma / Gaussian distribution centered earlier (30 to 75)
        raw_age = random.gauss(age_mean, age_sd)
        age = self._clamp(raw_age, 24.0, 82.0)

        # 2. Anthropometrics (Asian Indian specific cutoffs: Overweight >= 23.0, Obese >= 25.0 kg/m2)
        base_bmi = 25.8 if is_male else 26.4
        bmi = self._clamp(base_bmi + 3.8 * z_metabolic + random.gauss(0, 1.8), 17.5, 43.0)
        
        # Asian Indian BMI Classification per ICMR / API / RSSDI
        if bmi < 18.5:
            bmi_cat = "Underweight (<18.5)"
        elif bmi < 23.0:
            bmi_cat = "Normal (18.5-22.9)"
        elif bmi < 25.0:
            bmi_cat = "Overweight (23.0-24.9)"
        else:
            bmi_cat = "Obese (≥25.0)"

        # Waist Circumference (Asian Indian cutoffs: Men >= 90 cm, Women >= 80 cm for abdominal obesity)
        base_wc = (88.0 if is_male else 79.0) + (bmi - 23.0) * 2.6 + 4.5 * z_metabolic + random.gauss(0, 3.2)
        waist_circumference = round(self._clamp(base_wc, 60.0, 140.0), 1)

        # 3. Glycemic Metrics (Fasting Blood Sugar & HbA1c)
        # Strong insulin resistance coupling with metabolic axis and age
        fbs_base = 104.0 + 16.0 * z_metabolic + 0.35 * (age - 45) + random.gauss(0, 14.0)
        fasting_blood_sugar = self._clamp(fbs_base, 70.0, 310.0)

        # HbA1c calibrated from FBS
        hba1c_mean = 4.4 + (fasting_blood_sugar * 0.021) + 0.18 * z_metabolic + random.gauss(0, 0.35)
        hba1c = round(self._clamp(hba1c_mean, 4.8, 13.5), 1)
        has_diabetes = 1 if (fasting_blood_sugar >= 126.0 or hba1c >= 6.5) else 0

        # 4. Blood Pressure (Systolic & Diastolic)
        # Accelerated arterial stiffness in South Asian cohorts
        sbp_mean = 126.0 + 7.5 * z_vascular + 5.2 * z_metabolic + 0.55 * (age - 40) + (8.0 if has_diabetes else 0.0)
        resting_bp_systolic = self._clamp(sbp_mean + random.gauss(0, 10.0), 92.0, 215.0)

        dbp_mean = 80.0 + 3.8 * z_vascular + 2.1 * z_metabolic + 0.15 * (age - 40)
        resting_bp_diastolic = self._clamp(dbp_mean + random.gauss(0, 6.5), 55.0, 125.0)

        # Heart rates
        resting_hr = self._clamp(74.0 + 4.5 * z_metabolic + random.gauss(0, 8.0), 50.0, 110.0)
        # Tanaka formula: Max HR = 208 - 0.7 * Age
        max_hr = self._clamp(208.0 - (0.7 * age) - 3.0 * z_metabolic + random.gauss(0, 9.0), 110.0, 195.0)

        # 5. South Asian Atherogenic Lipid Triad
        # Characteristic: Hypertriglyceridemia, Hypoalphalipoproteinemia (Low HDL), Elevated ApoB & Small Dense LDL
        # Triglycerides: log-normal distribution shifted high
        tg_log_mean = math.log(185.0) + 0.38 * z_metabolic + 0.18 * z_genetic_lipid
        triglycerides = self._clamp(math.exp(tg_log_mean + random.gauss(0, 0.28)), 55.0, 950.0)

        # HDL-C: Inverse relationship with TG and metabolic syndrome (typically low in South Asians: ~37-43 mg/dL)
        hdl_base = (39.0 if is_male else 43.0) - 5.5 * z_metabolic - 0.022 * (triglycerides - 150)
        hdl_c = self._clamp(hdl_base + random.gauss(0, 5.0), 18.0, 78.0)

        # LDL-C: Variable, but highly atherogenic particle concentration
        ldl_mean = 132.0 + 26.0 * z_genetic_lipid + 8.5 * z_metabolic + (6.0 if is_male else 0.0)
        ldl_c = self._clamp(ldl_mean + random.gauss(0, 24.0), 45.0, 310.0)

        # Total Cholesterol = HDL + LDL + VLDL (VLDL approximated as TG / 5)
        serum_cholesterol = self._clamp(hdl_c + ldl_c + (triglycerides / 5.0) + random.gauss(0, 4.0), 110.0, 420.0)

        # Apolipoprotein B (ApoB): Reflects total atherogenic particle count
        # In South Asians, ApoB is often discordant (higher than LDL-C would suggest due to small dense LDL and TG-rich remnant particles)
        apo_b_calc = (ldl_c * 0.78) + (triglycerides * 0.12) + 12.0 + 8.0 * z_genetic_lipid
        apo_b = self._clamp(apo_b_calc + random.gauss(0, 8.0), 45.0, 230.0)

        # Lipoprotein(a) [Lp(a)]: High genetic prevalence in South Asians (~35% have >125 nmol/L or >50 mg/dL)
        if random.random() < 0.36:
            # High Lp(a) sub-cluster
            lp_a = self._clamp(random.expovariate(1.0 / 140.0) + 75.0, 50.0, 340.0)
        else:
            # Standard physiological range
            lp_a = self._clamp(random.expovariate(1.0 / 35.0) + 8.0, 4.0, 75.0)

        # 6. Clinical History & Habits
        # Smoking / Bidi / Hookah exposure
        smoker_roll = random.random()
        if is_male:
            smoker = "current" if smoker_roll < 0.28 else ("former" if smoker_roll < 0.44 else "never")
        else:
            smoker = "current" if smoker_roll < 0.05 else ("former" if smoker_roll < 0.09 else "never")

        # Family History of Premature CAD (very high in South Asian cohorts: ~35-45%)
        fam_prob = 0.40 + 0.10 * z_genetic_lipid
        family_history_cad = 1 if random.random() < fam_prob else 0

        # Atherogenic dyslipidemia triad check (TG >= 150 mg/dL, HDL < 40 male / 50 female, ApoB >= 90 mg/dL)
        has_atherogenic_triad = 1 if (triglycerides >= 150.0 and hdl_c < (40.0 if is_male else 50.0) and apo_b >= 90.0) else 0

        # Subclinical Coronary Calcium (CAC Agatston Score)
        # Influenced by age, LDL, SBP, diabetes, smoking, and Lp(a)
        cac_latent = (
            -3.2
            + 0.075 * (age - 35)
            + 0.012 * (ldl_c - 100)
            + 0.022 * (resting_bp_systolic - 120)
            + 0.006 * (lp_a - 30)
            + (1.2 if has_diabetes else 0.0)
            + (0.9 if smoker == "current" else 0.0)
            + (0.75 if family_history_cad else 0.0)
            + random.gauss(0, 0.6)
        )
        if cac_latent > 0:
            coronary_calcium_score = round(min(2200.0, math.exp(cac_latent * 1.5) * 12.0), 1)
        else:
            coronary_calcium_score = 0.0

        # 7. Ground Truth Subclinical Continuous ASCVD 5-Year Risk & Incident Event Generation
        # Multi-factorial non-linear logit hazard modeling
        smoker_weight = 0.72 if smoker == "current" else (0.28 if smoker == "former" else 0.0)
        
        # Logit risk score calibrated with South Asian epidemiological hazard ratios (INTERHEART South Asia coefficient = 1.35x standard Framingham)
        logit_risk = (
            -4.75
            + 0.062 * (age - 45)
            + (0.42 if is_male else 0.0)
            + 0.038 * (bmi - 23.0)
            + 0.024 * (resting_bp_systolic - 125.0)
            + 0.012 * (ldl_c - 100.0)
            + 0.009 * (apo_b - 90.0)
            + 0.004 * (triglycerides - 150.0)
            - 0.028 * (hdl_c - 45.0)
            + 0.005 * (lp_a - 30.0)
            + 0.008 * (fasting_blood_sugar - 100.0)
            + (0.65 if has_diabetes else 0.0)
            + smoker_weight
            + (0.52 if family_history_cad else 0.0)
            + 0.0012 * min(800.0, coronary_calcium_score)
        )

        true_subclinical_risk = 1.0 / (1.0 + math.exp(-logit_risk))
        true_subclinical_risk = round(self._clamp(true_subclinical_risk, 0.01, 0.88), 4)

        # Bernoulli event draw for in silico trial augmentation validation
        event_prob_5yr = true_subclinical_risk
        true_event = 1 if random.random() < event_prob_5yr else 0

        return {
            "age": round(age, 1),
            "sex": sex_str,
            "bmi": round(bmi, 2),
            "waist_circumference_cm": waist_circumference,
            "asian_indian_bmi_category": bmi_cat,
            "resting_bp_systolic": round(resting_bp_systolic, 1),
            "resting_bp_diastolic": round(resting_bp_diastolic, 1),
            "serum_cholesterol": round(serum_cholesterol, 1),
            "triglycerides": round(triglycerides, 1),
            "hdl_c": round(hdl_c, 1),
            "ldl_c": round(ldl_c, 1),
            "fasting_blood_sugar": round(fasting_blood_sugar, 1),
            "hba1c": hba1c,
            "max_heart_rate": round(max_hr, 1),
            "resting_heart_rate": round(resting_hr, 1),
            "lp_a": round(lp_a, 1),
            "apo_b": round(apo_b, 1),
            "atherogenic_triad": has_atherogenic_triad,
            "smoker": smoker,
            "diabetes": has_diabetes,
            "family_history_cad": family_history_cad,
            "coronary_calcium_score": coronary_calcium_score,
            "true_subclinical_risk": true_subclinical_risk,
            "true_ascvd_5yr_event": true_event,
        }

    def generate_cohort(
        self,
        n_patients: int = 1500,
        cohort_prefix: str = "SA-CTWIN",
    ) -> List[SyntheticPatientRecord]:
        """
        Generates a synthetic patient cohort of size n_patients.
        """
        records: List[SyntheticPatientRecord] = []
        for i in range(1, n_patients + 1):
            pid = f"{cohort_prefix}-{i:05d}"
            raw = self._sample_correlated_multivariate()
            rec = SyntheticPatientRecord(
                patient_id=pid,
                **raw
            )
            records.append(rec)
        return records

    def export_to_csv(self, records: List[SyntheticPatientRecord], filepath: str) -> None:
        """
        Exports synthetic cohort records to a clean CSV file.
        """
        if not records:
            return
        fieldnames = list(asdict(records[0]).keys())
        with open(filepath, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for r in records:
                writer.writerow(asdict(r))

    def export_to_json(self, records: List[SyntheticPatientRecord], filepath: str) -> None:
        """
        Exports synthetic cohort records to JSON format.
        """
        data = [asdict(r) for r in records]
        with open(filepath, mode="w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def compute_cohort_summary_statistics(
        self, records: List[SyntheticPatientRecord]
    ) -> Dict[str, Any]:
        """
        Computes clinical epidemiological summary statistics for quality control.
        """
        n = len(records)
        if n == 0:
            return {}

        def _mean_sd(values: List[float]) -> Tuple[float, float]:
            m = sum(values) / len(values)
            var = sum((x - m) ** 2 for x in values) / max(1, len(values) - 1)
            return round(m, 2), round(math.sqrt(var), 2)

        males = sum(1 for r in records if r.sex == "male")
        diabetics = sum(1 for r in records if r.diabetes == 1)
        smokers = sum(1 for r in records if r.smoker == "current")
        high_lpa = sum(1 for r in records if r.lp_a >= 125.0)
        events = sum(1 for r in records if r.true_ascvd_5yr_event == 1)

        age_m, age_sd = _mean_sd([r.age for r in records])
        bmi_m, bmi_sd = _mean_sd([r.bmi for r in records])
        sbp_m, sbp_sd = _mean_sd([r.resting_bp_systolic for r in records])
        ldl_m, ldl_sd = _mean_sd([r.ldl_c for r in records])
        hdl_m, hdl_sd = _mean_sd([r.hdl_c for r in records])
        tg_m, tg_sd = _mean_sd([r.triglycerides for r in records])
        apob_m, apob_sd = _mean_sd([r.apo_b for r in records])
        lpa_m, lpa_sd = _mean_sd([r.lp_a for r in records])
        fbs_m, fbs_sd = _mean_sd([r.fasting_blood_sugar for r in records])
        hba1c_m, hba1c_sd = _mean_sd([r.hba1c for r in records])
        risk_m, risk_sd = _mean_sd([r.true_subclinical_risk * 100 for r in records])

        return {
            "total_cohort_size": n,
            "male_percentage": round((males / n) * 100, 1),
            "female_percentage": round(((n - males) / n) * 100, 1),
            "diabetes_prevalence_pct": round((diabetics / n) * 100, 1),
            "current_smoker_pct": round((smokers / n) * 100, 1),
            "high_lpa_prevalence_pct": round((high_lpa / n) * 100, 1),
            "observed_5yr_ascvd_event_rate_pct": round((events / n) * 100, 1),
            "mean_age_years": f"{age_m} ± {age_sd}",
            "mean_bmi": f"{bmi_m} ± {bmi_sd}",
            "mean_sbp_mmhg": f"{sbp_m} ± {sbp_sd}",
            "mean_ldl_mgdl": f"{ldl_m} ± {ldl_sd}",
            "mean_hdl_mgdl": f"{hdl_m} ± {hdl_sd}",
            "mean_triglycerides_mgdl": f"{tg_m} ± {tg_sd}",
            "mean_apob_mgdl": f"{apob_m} ± {apob_sd}",
            "mean_lpa_nmoll": f"{lpa_m} ± {lpa_sd}",
            "mean_fbs_mgdl": f"{fbs_m} ± {fbs_sd}",
            "mean_hba1c_pct": f"{hba1c_m} ± {hba1c_sd}",
            "mean_baseline_5yr_ascvd_risk_pct": f"{risk_m}% ± {risk_sd}%",
        }
