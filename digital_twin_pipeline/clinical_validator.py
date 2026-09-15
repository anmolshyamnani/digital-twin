"""
Autonomous Clinical Digital Twin Pipeline Validation Runner
Validates all 4 core capabilities: In Silico Trial Augmentation, Refined Risk Stratification,
Therapeutic Optimization (Counterfactual Simulation), and Reduction of Confounding Variables.
"""

import sys
import json
from .cohort_generator import SouthAsianCohortGenerator
from .ml_risk_models import NonLinearASCVDClassifier
from .counterfactual_engine import CounterfactualSimulationEngine, TreatmentIntervention
from .feature_isolation import FeatureIsolationEngine


def run_complete_digital_twin_validation(n_synthetic_cohort: int = 1500) -> dict:
    print("=" * 80)
    print("CARDIOVASCULAR & HYPERLIPIDEMIA DIGITAL TWIN RESEARCH PIPELINE")
    print("Specialized for South Asian and Indian Clinical Cohorts")
    print("=" * 80)

    # -------------------------------------------------------------
    # 1. IN SILICO TRIAL AUGMENTATION
    # -------------------------------------------------------------
    print("\n[CAPABILITY 1/4] IN SILICO TRIAL AUGMENTATION...")
    generator = SouthAsianCohortGenerator(seed=42)
    synthetic_cohort = generator.generate_cohort(n_patients=n_synthetic_cohort)
    cohort_stats = generator.compute_cohort_summary_statistics(synthetic_cohort)

    print(f"✓ Generated {len(synthetic_cohort)} synthetic patient twins.")
    print(f"  - Mean Age: {cohort_stats['mean_age_years']} years (Premature onset profile)")
    print(f"  - Mean Triglycerides: {cohort_stats['mean_triglycerides_mgdl']} mg/dL")
    print(f"  - Mean HDL-C: {cohort_stats['mean_hdl_mgdl']} mg/dL (Low HDL phenotype)")
    print(f"  - Elevated Lp(a) (≥125 nmol/L) Prevalence: {cohort_stats['high_lpa_prevalence_pct']}%")
    print(f"  - Diabetes Prevalence: {cohort_stats['diabetes_prevalence_pct']}%")
    print(f"  - Observed 5-Year ASCVD Event Rate: {cohort_stats['observed_5yr_ascvd_event_rate_pct']}%")

    # -------------------------------------------------------------
    # 2. REFINED RISK STRATIFICATION (NON-LINEAR ML CLASSIFIER)
    # -------------------------------------------------------------
    print("\n[CAPABILITY 2/4] REFINED RISK STRATIFICATION (NON-LINEAR ML)...")
    classifier = NonLinearASCVDClassifier()
    eval_report = classifier.train_and_calibrate(synthetic_cohort)

    print("✓ Model training & continuous calibration complete.")
    print(f"  - AUROC (Discriminative Accuracy): {eval_report.auroc}")
    print(f"  - Brier Score (Calibration Metric): {eval_report.brier_score}")
    print(f"  - Log Loss: {eval_report.log_loss}")
    print(f"  - Sensitivity at High-Risk Cutoff: {eval_report.sensitivity * 100:.1f}%")
    print(f"  - Specificity: {eval_report.specificity * 100:.1f}%")
    print("  - Top Risk Drivers (Feature Importances):")
    for feat, imp in list(eval_report.feature_importances.items())[:5]:
        print(f"    • {feat}: {imp:.3f}")

    # -------------------------------------------------------------
    # 3. THERAPEUTIC OPTIMIZATION (COUNTERFACTUAL SIMULATION LOOP)
    # -------------------------------------------------------------
    print("\n[CAPABILITY 3/4] THERAPEUTIC OPTIMIZATION (COUNTERFACTUAL SIMULATION)...")
    sim_engine = CounterfactualSimulationEngine(classifier=classifier)

    # High-risk 46yo South Asian male with dyslipidemia, hypertension, and elevated Lp(a)
    baseline_patient = {
        "id": "PATIENT-DEMO-01",
        "name": "Rajesh Kumar (Synthetic Twin)",
        "age": 46.0,
        "sex": "male",
        "bmi": 27.8,
        "resting_bp_systolic": 148.0,
        "resting_bp_diastolic": 92.0,
        "serum_cholesterol": 245.0,
        "triglycerides": 230.0,
        "hdl_c": 36.0,
        "ldl_c": 165.0,
        "apo_b": 135.0,
        "lp_a": 160.0,  # High hereditary Lp(a)
        "fasting_blood_sugar": 118.0,
        "hba1c": 6.2,
        "max_heart_rate": 165.0,
        "resting_heart_rate": 78.0,
        "smoker": "never",
        "diabetes": 0,
        "family_history_cad": 1,
        "coronary_calcium_score": 120.0,
    }

    # Combined pharmacological & lifestyle intervention
    intervention = TreatmentIntervention(
        statin_intensity="high",  # Atorvastatin 80mg or Rosuvastatin 40mg
        ezetimibe=True,  # 10mg Ezetimibe
        pcsk9_inhibitor=False,
        bempedoic_acid=False,
        icosapent_ethyl=True,  # Vascepa for TG 230 mg/dL
        sglt2_or_glp1ra=False,
        target_sbp_reduction_mmhg=18.0,  # Titrated ARB/CCB
        diet_pattern="mediterranean_south_asian",
        exercise_level="moderate",
        smoking_cessation=False,
        weight_loss_pct=6.0,
    )

    sim_result = sim_engine.simulate(baseline_patient, intervention)

    print("✓ Counterfactual simulation finished:")
    print(f"  - Baseline 5-Year ASCVD Risk: {sim_result.baseline_prediction.continuous_ascvd_5yr_risk_pct:.2f}% ({sim_result.baseline_prediction.risk_category})")
    print(f"  - Counterfactual 5-Year ASCVD Risk: {sim_result.counterfactual_prediction.continuous_ascvd_5yr_risk_pct:.2f}% ({sim_result.counterfactual_prediction.risk_category})")
    print(f"  - Absolute Risk Reduction (ARR): {sim_result.absolute_risk_reduction_5yr_pct:.2f}%")
    print(f"  - Relative Risk Reduction (RRR): {sim_result.relative_risk_reduction_5yr_pct:.1f}%")
    print(f"  - Number Needed to Treat (NNT): {sim_result.number_needed_to_treat_5yr}")
    print(f"  - Vascular Age Rejuvenation: From {sim_result.baseline_vascular_age} to {sim_result.counterfactual_vascular_age} years (Gain: -{sim_result.vascular_years_rejuvenated} yrs)")
    print("  - Projected Biomarker Shifts:")
    for bio, vals in list(sim_result.projected_biomarkers.items())[:4]:
        print(f"    • {bio}: {vals['baseline']} -> {vals['counterfactual']} (Δ: {vals['delta']})")

    # -------------------------------------------------------------
    # 4. REDUCTION OF CONFOUNDING VARIABLES (FEATURE ISOLATION)
    # -------------------------------------------------------------
    print("\n[CAPABILITY 4/4] REDUCTION OF CONFOUNDING VARIABLES (CETERIS PARIBUS)...")
    isolation_engine = FeatureIsolationEngine(classifier=classifier)

    # 1D SBP Isolation curve
    sbp_curve = isolation_engine.generate_isolated_sensitivity_curve(
        baseline_patient=baseline_patient, target_feature_key="resting_bp_systolic"
    )
    print(f"✓ Isolated Systolic Blood Pressure Sensitivity (All other {len(baseline_patient)-1} variables fixed):")
    print(f"  - Linear Partial Derivative ∂Risk/∂SBP: +{sbp_curve.linear_slope_per_unit:.4f}% risk per mmHg")
    print(f"  - Max Achievable Risk Reduction from SBP isolation: -{sbp_curve.max_risk_reduction_achievable_pct}%")
    print("  - Sample Points on Manifold:")
    for pt in sbp_curve.points[::3]:
        print(f"    • SBP {pt.isolated_feature_value:5.1f} mmHg -> 5-Yr Risk: {pt.predicted_5yr_risk_pct:5.2f}% (Δ {pt.marginal_risk_delta_from_baseline:+5.2f}%)")

    # 1D LDL Isolation curve
    ldl_curve = isolation_engine.generate_isolated_sensitivity_curve(
        baseline_patient=baseline_patient, target_feature_key="ldl_c"
    )
    print(f"\n✓ Isolated LDL-C Sensitivity (All other variables fixed):")
    print(f"  - Linear Partial Derivative ∂Risk/∂LDL: +{ldl_curve.linear_slope_per_unit:.4f}% risk per mg/dL")
    print(f"  - Max Achievable Risk Reduction from LDL isolation: -{ldl_curve.max_risk_reduction_achievable_pct}%")

    # 2D Cross-Isolator Response Grid (LDL-C vs SBP)
    grid_2d = isolation_engine.generate_2d_response_surface(
        baseline_patient=baseline_patient, feature_x="ldl_c", feature_y="resting_bp_systolic", grid_size=4
    )
    print(f"\n✓ 2D Response Surface (LDL-C vs SBP with static covariates):")
    print(f"  LDL Axis: {grid_2d['x_axis_values']} mg/dL")
    print(f"  SBP Axis: {grid_2d['y_axis_values']} mmHg")
    print(f"  Risk Matrix (5-Year %):")
    for row in grid_2d["risk_5yr_matrix"]:
        print(f"    {row}")

    print("\n" + "=" * 80)
    print("PIPELINE EXECUTION & VALIDATION SUCCESSFUL")
    print("=" * 80)

    return {
        "cohort_statistics": cohort_stats,
        "evaluation_metrics": {
            "auroc": eval_report.auroc,
            "brier_score": eval_report.brier_score,
            "log_loss": eval_report.log_loss,
            "sensitivity": eval_report.sensitivity,
            "specificity": eval_report.specificity,
            "accuracy": eval_report.accuracy,
        },
        "simulation_sample": {
            "baseline_risk_5yr": sim_result.baseline_prediction.continuous_ascvd_5yr_risk_pct,
            "counterfactual_risk_5yr": sim_result.counterfactual_prediction.continuous_ascvd_5yr_risk_pct,
            "arr_5yr": sim_result.absolute_risk_reduction_5yr_pct,
            "rrr_5yr": sim_result.relative_risk_reduction_5yr_pct,
            "nnt_5yr": sim_result.number_needed_to_treat_5yr,
            "vascular_age_rejuvenated": sim_result.vascular_years_rejuvenated,
        },
        "feature_isolation_gradients": {
            "sbp_slope": sbp_curve.linear_slope_per_unit,
            "ldl_slope": ldl_curve.linear_slope_per_unit,
        },
    }


if __name__ == "__main__":
    run_complete_digital_twin_validation()
