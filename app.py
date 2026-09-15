"""
CardioTwin-IN: Cardiovascular & Hyperlipidemia Digital Twin Research System
Streamlit Frontend Application for In Silico Trial Augmentation, Refined Risk Stratification,
Counterfactual Therapeutic Optimization, and Confounding Reduction in Indian & South Asian Cohorts.
Aligned with Cardiological Society of India (CSI), ICMR, RSSDI, and IHG-IV Clinical Guidelines.
"""

import math
import io
import json
import csv
from typing import Dict, Any

try:
    import streamlit as st
    import pandas as pd
    import numpy as np
    STREAMLIT_AVAILABLE = True
except ImportError:
    STREAMLIT_AVAILABLE = False

from digital_twin_pipeline.cohort_generator import SouthAsianCohortGenerator, SyntheticPatientRecord
from digital_twin_pipeline.ml_risk_models import NonLinearASCVDClassifier, PredictionOutput
from digital_twin_pipeline.counterfactual_engine import (
    CounterfactualSimulationEngine,
    TreatmentIntervention,
    SimulationResult,
)
from digital_twin_pipeline.feature_isolation import FeatureIsolationEngine


def create_streamlit_app():
    if not STREAMLIT_AVAILABLE:
        print("Streamlit is not installed in the current environment.")
        print("To run the Streamlit frontend, install dependencies via:")
        print("  pip install streamlit pandas numpy matplotlib")
        print("Then launch via:")
        print("  streamlit run app.py")
        return

    st.set_page_config(
        page_title="CardioTwin-IN | Indian CVD & Hyperlipidemia Digital Twin",
        page_icon="🫀",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    # Custom Header Styling
    st.markdown(
        """
        <style>
        .main-header {
            font-size: 2.1rem;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 0.2rem;
        }
        .sub-header {
            font-size: 1.05rem;
            color: #475569;
            margin-bottom: 1.2rem;
        }
        .badge-csi {
            background-color: #fef3c7;
            color: #92400e;
            padding: 0.25rem 0.65rem;
            border-radius: 9999px;
            font-weight: 600;
            font-size: 0.8rem;
            border: 1px solid #fde68a;
            display: inline-block;
        }
        .badge-triad {
            background-color: #fee2e2;
            color: #991b1b;
            padding: 0.25rem 0.65rem;
            border-radius: 9999px;
            font-weight: 600;
            font-size: 0.8rem;
            border: 1px solid #fca5a5;
            display: inline-block;
        }
        .badge-target {
            background-color: #dcfce7;
            color: #166534;
            padding: 0.25rem 0.65rem;
            border-radius: 9999px;
            font-weight: 600;
            font-size: 0.8rem;
            border: 1px solid #86efac;
            display: inline-block;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )

    # Initialize ML Engine & Cache
    @st.cache_resource
    def load_pipeline():
        generator = SouthAsianCohortGenerator(seed=42)
        records = generator.generate_cohort(n_patients=1000)
        classifier = NonLinearASCVDClassifier()
        classifier.train_and_calibrate(records)
        sim_engine = CounterfactualSimulationEngine(classifier=classifier)
        isolation_engine = FeatureIsolationEngine(classifier=classifier)
        return generator, classifier, sim_engine, isolation_engine, records

    generator, classifier, sim_engine, isolation_engine, default_cohort = load_pipeline()

    # Title & Clinical Scope
    st.markdown('<div class="main-header">🫀 CardioTwin-IN: Indian CVD & Hyperlipidemia Digital Twin</div>', unsafe_allow_html=True)
    st.markdown(
        """
        <div class="sub-header">
        <span class="badge-csi">CSI / ICMR-INDIAB / RSSDI CALIBRATED</span> &nbsp;
        In Silico Trial Augmentation • Non-Linear Risk Stratification • Counterfactual GDMT & FDC Simulation • Confounding-Free Feature Isolation
        </div>
        """,
        unsafe_allow_html=True,
    )

    # -------------------------------------------------------------
    # SIDEBAR: Clinical Archetype Presets & Patient Inputs
    # -------------------------------------------------------------
    st.sidebar.header("📋 Indian Clinical Archetypes")
    preset_choice = st.sidebar.selectbox(
        "Load Clinical Archetype:",
        [
            "Custom Patient Vector",
            "1. Premature CAD & High Lp(a) (36yo Male, Mumbai)",
            "2. Diabetic Atherogenic Triad (46yo Female, Delhi)",
            "3. Accelerated Hypertension & Central Adiposity (50yo Male, Bengaluru)",
            "4. Severe Hypercholesterolemia / SAMS Risk (42yo Male, Chennai)",
        ],
    )

    # Preset defaults
    default_vals = {
        "age": 45.0,
        "sex": "male",
        "bmi": 26.2,
        "wc": 92.0,
        "sbp": 138.0,
        "dbp": 88.0,
        "tc": 225.0,
        "tg": 210.0,
        "hdl": 38.0,
        "ldl": 145.0,
        "apob": 120.0,
        "lpa": 85.0,
        "fbs": 112.0,
        "hba1c": 6.1,
        "max_hr": 165.0,
        "smoker": "never",
        "diabetes": False,
        "fam_cad": True,
        "cac": 45.0,
    }

    if "1. Premature CAD" in preset_choice:
        default_vals.update({
            "age": 36.0,
            "sex": "male",
            "bmi": 25.2,
            "wc": 91.5,
            "sbp": 132.0,
            "dbp": 84.0,
            "tc": 235.0,
            "tg": 195.0,
            "hdl": 36.0,
            "ldl": 160.0,
            "apob": 138.0,
            "lpa": 195.0,  # High genetic Lp(a)
            "fbs": 102.0,
            "hba1c": 5.7,
            "fam_cad": True,
            "cac": 65.0,
        })
    elif "2. Diabetic Atherogenic Triad" in preset_choice:
        default_vals.update({
            "age": 46.0,
            "sex": "female",
            "bmi": 27.8,
            "wc": 88.0,  # Elevated female waist > 80cm
            "sbp": 142.0,
            "dbp": 88.0,
            "tc": 240.0,
            "tg": 295.0,  # High TG
            "hdl": 33.0,  # Low HDL
            "ldl": 148.0,
            "apob": 130.0,
            "lpa": 55.0,
            "fbs": 142.0,
            "hba1c": 7.8,  # Diabetes
            "diabetes": True,
            "fam_cad": True,
            "cac": 110.0,
        })
    elif "3. Accelerated Hypertension" in preset_choice:
        default_vals.update({
            "age": 50.0,
            "sex": "male",
            "bmi": 29.5,
            "wc": 98.0,
            "sbp": 164.0,
            "dbp": 98.0,
            "tc": 230.0,
            "tg": 220.0,
            "hdl": 37.0,
            "ldl": 149.0,
            "apob": 125.0,
            "lpa": 60.0,
            "fbs": 118.0,
            "hba1c": 6.3,
            "fam_cad": True,
            "cac": 280.0,
        })
    elif "4. Severe Hypercholesterolemia" in preset_choice:
        default_vals.update({
            "age": 42.0,
            "sex": "male",
            "bmi": 25.8,
            "wc": 90.0,
            "sbp": 136.0,
            "dbp": 86.0,
            "tc": 290.0,
            "tg": 180.0,
            "hdl": 42.0,
            "ldl": 212.0,
            "apob": 165.0,
            "lpa": 110.0,
            "fbs": 105.0,
            "hba1c": 5.8,
            "fam_cad": True,
            "cac": 140.0,
        })

    st.sidebar.markdown("---")
    st.sidebar.subheader("🩺 Baseline Patient Biomarkers")

    col_s1, col_s2 = st.sidebar.columns(2)
    with col_s1:
        age_in = st.number_input("Age (years)", 20.0, 90.0, float(default_vals["age"]), step=1.0)
        sex_in = st.selectbox("Biological Sex", ["male", "female"], index=0 if default_vals["sex"] == "male" else 1)
        bmi_in = st.number_input("BMI (kg/m²)", 16.0, 50.0, float(default_vals["bmi"]), step=0.1)
        wc_in = st.number_input("Waist Circumference (cm)", 55.0, 160.0, float(default_vals["wc"]), step=0.5)
    with col_s2:
        sbp_in = st.number_input("Systolic BP (mmHg)", 80.0, 220.0, float(default_vals["sbp"]), step=1.0)
        dbp_in = st.number_input("Diastolic BP (mmHg)", 50.0, 130.0, float(default_vals["dbp"]), step=1.0)
        max_hr_in = st.number_input("Max Heart Rate", 100.0, 210.0, float(default_vals["max_hr"]), step=1.0)
        cac_in = st.number_input("CAC Agatston Score", 0.0, 2000.0, float(default_vals["cac"]), step=10.0)

    # Asian Indian BMI interpretation
    if bmi_in < 18.5:
        bmi_cat_label = "Underweight (<18.5)"
    elif bmi_in < 23.0:
        bmi_cat_label = "Normal (18.5-22.9)"
    elif bmi_in < 25.0:
        bmi_cat_label = "Overweight (23.0-24.9)"
    else:
        bmi_cat_label = "Obese (≥25.0)"

    # Waist circumference threshold
    wc_cutoff = 90.0 if sex_in == "male" else 80.0
    wc_elevated = wc_in >= wc_cutoff

    st.sidebar.markdown(f"**Asian-Indian BMI:** `{bmi_cat_label}`")
    if wc_elevated:
        st.sidebar.warning(f"⚠️ Abdominal Adiposity: Waist {wc_in}cm ≥ {wc_cutoff:.0f}cm cutoff")

    st.sidebar.markdown("**Atherogenic Lipid Panel (mg/dL)**")
    col_l1, col_l2 = st.sidebar.columns(2)
    with col_l1:
        ldl_in = st.number_input("LDL-C", 20.0, 350.0, float(default_vals["ldl"]), step=1.0)
        hdl_in = st.number_input("HDL-C", 15.0, 100.0, float(default_vals["hdl"]), step=1.0)
        tg_in = st.number_input("Triglycerides", 40.0, 900.0, float(default_vals["tg"]), step=5.0)
    with col_l2:
        apob_in = st.number_input("ApoB", 30.0, 250.0, float(default_vals["apob"]), step=1.0)
        lpa_in = st.number_input("Lp(a) (nmol/L)", 5.0, 350.0, float(default_vals["lpa"]), step=5.0)
        tc_in = st.number_input("Total Cholesterol", 100.0, 450.0, float(default_vals["tc"]), step=5.0)

    # Atherogenic triad check
    has_triad = (tg_in >= 150.0) and (hdl_in < (40.0 if sex_in == "male" else 50.0)) and (apob_in >= 90.0)
    if has_triad:
        st.sidebar.markdown('<span class="badge-triad">ATHEROGENIC TRIAD PRESENT</span>', unsafe_allow_html=True)

    st.sidebar.markdown("**Metabolic & Glycemic Markers**")
    col_g1, col_g2 = st.sidebar.columns(2)
    with col_g1:
        fbs_in = st.number_input("Fasting Glucose", 60.0, 350.0, float(default_vals["fbs"]), step=1.0)
        hba1c_in = st.number_input("HbA1c (%)", 4.5, 14.0, float(default_vals["hba1c"]), step=0.1)
    with col_g2:
        smoker_in = st.selectbox("Smoking / Bidi Status", ["never", "former", "current"], index=0)

    fam_cad_in = st.sidebar.checkbox("Premature CAD Family History (1st-degree)", value=default_vals["fam_cad"])
    diabetes_in = st.sidebar.checkbox("Documented Type 2 Diabetes", value=default_vals["diabetes"] or (hba1c_in >= 6.5))

    patient_vector = {
        "id": "PT-TWIN-ACTIVE",
        "age": age_in,
        "sex": sex_in,
        "bmi": bmi_in,
        "waist_circumference_cm": wc_in,
        "asian_indian_bmi_category": bmi_cat_label,
        "atherogenic_triad": 1 if has_triad else 0,
        "resting_bp_systolic": sbp_in,
        "resting_bp_diastolic": dbp_in,
        "serum_cholesterol": tc_in,
        "triglycerides": tg_in,
        "hdl_c": hdl_in,
        "ldl_c": ldl_in,
        "apo_b": apob_in,
        "lp_a": lpa_in,
        "fasting_blood_sugar": fbs_in,
        "hba1c": hba1c_in,
        "max_heart_rate": max_hr_in,
        "resting_heart_rate": 72.0,
        "smoker": smoker_in,
        "diabetes": 1 if diabetes_in else 0,
        "family_history_cad": 1 if fam_cad_in else 0,
        "coronary_calcium_score": cac_in,
    }

    # -------------------------------------------------------------
    # MAIN APPLICATION TABS
    # -------------------------------------------------------------
    tab1, tab2, tab3, tab4 = st.tabs([
        "🧬 1. Baseline Risk & CSI Stratification",
        "🧪 2. Counterfactual GDMT & FDC Sandbox",
        "🔬 3. Confounding-Free Feature Isolation",
        "📊 4. In Silico Indian Cohort Augmentation",
    ])

    # -------------------------------------------------------------
    # TAB 1: Baseline Risk Stratification
    # -------------------------------------------------------------
    with tab1:
        st.subheader("CSI-Calibrated Continuous Machine Learning Risk Stratification")
        st.markdown(
            "Individualized multi-horizon probability calculation calibrated against Indian clinical epidemiology (CSI / ICMR-INDIAB)."
        )

        base_pred = classifier.predict_detailed(patient_vector)

        c1, c2, c3, c4 = st.columns(4)
        with c1:
            st.metric(
                label="5-Year Subclinical ASCVD Risk",
                value=f"{base_pred.continuous_ascvd_5yr_risk_pct:.2f}%",
                delta=base_pred.risk_category,
                delta_color="inverse",
            )
        with c2:
            st.metric(
                label="3-Year Incident Event Risk",
                value=f"{base_pred.continuous_ascvd_3yr_risk_pct:.2f}%",
            )
        with c3:
            st.metric(
                label="10-Year Lifetime Horizon",
                value=f"{base_pred.continuous_ascvd_10yr_risk_pct:.2f}%",
            )
        with c4:
            st.metric(
                label="Biological Vascular Age",
                value=f"{base_pred.vascular_age:.1f} yrs",
                delta=f"+{base_pred.vascular_age_delta:.1f} yrs vs Chronological ({base_pred.chronological_age:.0f}y)",
                delta_color="inverse",
            )

        st.markdown("---")
        st.subheader("🔍 Phenotypic Risk Drivers & CSI Biomarker Attribution")
        for feat_name, impact, advice in base_pred.top_risk_drivers:
            st.info(f"**{feat_name}** (Impact Score: +{impact:.1f}) — *{advice}*")

    # -------------------------------------------------------------
    # TAB 2: Counterfactual Therapeutic Lab
    # -------------------------------------------------------------
    with tab2:
        st.subheader("🧪 Therapeutic Optimization Sandbox (Counterfactual Simulation Loop)")
        st.markdown(
            "Apply Indian GDMT pharmacotherapy, Fixed-Dose Combinations (FDCs), Saroglitazar, and lifestyle modifications to evaluate post-intervention risk delta (ΔRisk), ARR, RRR, NNT, and CSI target attainment."
        )

        col_rx1, col_rx2 = st.columns(2)
        with col_rx1:
            st.markdown("##### 💊 Lipid & Cardiometabolic Pharmacotherapy (Indian GDMT)")
            statin_choice = st.selectbox(
                "Statin Intensity",
                ["none", "low (Atorva 10mg / Rosuva 5mg: -28% LDL)", "moderate (Atorva 20mg / Rosuva 10mg: -38% LDL)", "high (Atorva 40-80mg / Rosuva 20-40mg: -50% LDL)"],
                index=3,
            )
            statin_intensity_clean = statin_choice.split()[0]

            fdc_statin_ezetimibe_toggle = st.checkbox(
                "Indian FDC: Rosuvastatin 10/20mg + Ezetimibe 10mg (Mitigates SAMS myopathy, achieves ~58% LDL drop)",
                value=True,
            )

            col_sub1, col_sub2 = st.columns(2)
            with col_sub1:
                saroglitazar_toggle = st.checkbox("Saroglitazar 4mg (Lipaglyn: Dual PPAR-α/γ, TG -45%, HDL +10%, NASH/MASLD)", value=tg_in >= 200 or diabetes_in)
                fenofibrate_fdc_toggle = st.checkbox("Statin + Fenofibrate FDC (Severe mixed dyslipidemia, TG -38%)", value=False)
                bempedoic_toggle = st.checkbox("Bempedoic Acid 180mg (+20% LDL reduction)", value=False)
                fdc_triple_lipid_toggle = st.checkbox("Triple Lipid FDC: Statin + Bempedoic + Ezetimibe (~70% LDL reduction)", value=False)
            with col_sub2:
                pcsk9_toggle = st.checkbox("PCSK9 Inhibitor / siRNA (Evolocumab/Inclisiran: -58% LDL, -28% Lp(a))", value=lpa_in >= 125 or ldl_in >= 190)
                icosapent_toggle = st.checkbox("Icosapent Ethyl 4g (Purified EPA, REDUCE-IT 25% RRR)", value=tg_in >= 150)
                sglt2_toggle = st.checkbox("SGLT2i (Empagliflozin/Dapagliflozin)", value=diabetes_in)
                glp1_toggle = st.checkbox("GLP-1 RA (Semaglutide/Tirzepatide)", value=bmi_in >= 27.0 or diabetes_in)

            st.markdown("##### 🫀 Antihypertensive Regimen (Indian Hypertension Guidelines IHG-IV)")
            bp_regimen = st.selectbox(
                "Blood Pressure Management Regimen",
                [
                    "none",
                    "arb_mono (Telmisartan 40-80mg or Azilsartan 40mg: -12 mmHg SBP)",
                    "arb_ccb_fdc (Telmisartan 40mg + Cilnidipine 10mg FDC: -22 mmHg SBP, reduces pedal edema)",
                    "triple_fdc (Telmisartan + Cilnidipine + Chlorthalidone 12.5mg: -30 mmHg SBP)",
                ],
                index=2 if sbp_in >= 140 else 1,
            )
            bp_regimen_clean = bp_regimen.split()[0]

        with col_rx2:
            st.markdown("##### 🥗 Lifestyle & Metabolic Modification")
            diet_choice = st.selectbox(
                "Dietary Pattern",
                [
                    "standard",
                    "traditional_indian_modified (Low-Glycemic, High-Fiber Pulses/Lentils, Reduced Refined Oils & Ghee)",
                    "mediterranean_south_asian (Cardioprotective Plant & Nut Rich)",
                    "dash (Sodium-Restricted <2g/day)",
                    "low_carb_plant (Triglyceride & Insulin-Targeted)",
                ],
                index=1,
            )
            diet_clean = diet_choice.split()[0]

            exercise_choice = st.selectbox(
                "Physical Activity Prescription",
                ["sedentary", "moderate (150 min/wk brisk walking/yoga)", "vigorous (300 min/wk structured cardio & resistance)"],
                index=1,
            )
            exercise_clean = exercise_choice.split()[0]

            weight_loss = st.slider("Target Weight / Visceral Fat Loss (%)", 0.0, 20.0, 6.0, step=0.5)
            smoking_cessation = st.checkbox("Tobacco / Bidi Cessation Program", value=smoker_in == "current")

        intervention = TreatmentIntervention(
            statin_intensity=statin_intensity_clean,
            fdc_statin_ezetimibe=fdc_statin_ezetimibe_toggle,
            ezetimibe=False,
            pcsk9_inhibitor=pcsk9_toggle,
            bempedoic_acid=bempedoic_toggle,
            fdc_triple_lipid=fdc_triple_lipid_toggle,
            saroglitazar=saroglitazar_toggle,
            fenofibrate_fdc=fenofibrate_fdc_toggle,
            icosapent_ethyl=icosapent_toggle,
            sglt2_inhibitor=sglt2_toggle,
            glp1_ra=glp1_toggle,
            sglt2_or_glp1ra=sglt2_toggle or glp1_toggle,
            antihypertensive_regimen=bp_regimen_clean,
            diet_pattern=diet_clean,
            exercise_level=exercise_clean,
            smoking_cessation=smoking_cessation,
            weight_loss_pct=weight_loss,
        )

        sim_res = sim_engine.simulate(patient_vector, intervention)

        st.markdown("---")
        st.subheader("🎯 Real-Time Counterfactual Outcomes")

        m1, m2, m3, m4, m5 = st.columns(5)
        with m1:
            st.metric("Baseline 5-Yr Risk", f"{sim_res.baseline_prediction.continuous_ascvd_5yr_risk_pct:.2f}%", delta=sim_res.baseline_prediction.risk_category, delta_color="inverse")
        with m2:
            st.metric("Counterfactual 5-Yr Risk", f"{sim_res.counterfactual_prediction.continuous_ascvd_5yr_risk_pct:.2f}%", delta=sim_res.counterfactual_prediction.risk_category, delta_color="normal")
        with m3:
            st.metric("Absolute Risk Reduction (ARR)", f"{sim_res.absolute_risk_reduction_5yr_pct:.2f}%", delta="Cardioprotection Averted")
        with m4:
            st.metric("Relative Risk Reduction (RRR)", f"{sim_res.relative_risk_reduction_5yr_pct:.1f}%")
        with m5:
            st.metric("Number Needed to Treat (NNT)", f"{sim_res.number_needed_to_treat_5yr}")

        st.success(
            f"🌿 **Vascular Age Rejuvenation:** Biological vascular age improved by **{sim_res.vascular_years_rejuvenated} years** (from {sim_res.baseline_vascular_age} to {sim_res.counterfactual_vascular_age} years)."
        )

        st.markdown("##### 🎯 Cardiological Society of India (CSI) Guideline Targets")
        for rec in sim_res.actionable_recommendations:
            st.write(f"• {rec}")

        st.subheader("📋 Projected Biomarker Transitions")
        bio_rows = []
        for bio, data in sim_res.projected_biomarkers.items():
            bio_rows.append({
                "Biomarker Parameter": bio,
                "Baseline Value": data["baseline"],
                "Projected Post-Treatment": data["counterfactual"],
                "Net Delta (Δ)": f"{data['delta']:+}",
            })
        st.dataframe(pd.DataFrame(bio_rows), use_container_width=True)

    # -------------------------------------------------------------
    # TAB 3: Confounding-Free Feature Isolation
    # -------------------------------------------------------------
    with tab3:
        st.subheader("🔬 Reduction of Confounding Variables (Strict Feature Isolation)")
        st.markdown(
            "Hold all other clinical, demographic, and phenotypic covariates strictly static (ceteris paribus) to isolate pure therapeutic gradients."
        )

        iso_feat = st.selectbox(
            "Select Clinical Feature to Isolate:",
            [
                ("resting_bp_systolic", "Systolic Blood Pressure (mmHg)"),
                ("ldl_c", "LDL Cholesterol (mg/dL)"),
                ("apo_b", "Apolipoprotein B (mg/dL)"),
                ("hba1c", "Hemoglobin A1c (%)"),
                ("triglycerides", "Triglycerides (mg/dL)"),
                ("waist_circumference_cm", "Waist Circumference (cm)"),
                ("bmi", "Body Mass Index (kg/m²)"),
                ("lp_a", "Lipoprotein(a) (nmol/L)"),
            ],
            format_func=lambda x: x[1],
        )[0]

        curve = isolation_engine.generate_isolated_sensitivity_curve(patient_vector, iso_feat)

        st.markdown(f"##### 1D Isolated Response Manifold: {curve.feature_name}")
        st.write(
            f"• **Linear Partial Derivative (∂Risk/∂{curve.feature_name}):** `{curve.linear_slope_per_unit:+.4f}%` risk delta per {curve.feature_unit}"
        )
        st.write(
            f"• **Maximum Achievable Isolated Risk Reduction:** `-{curve.max_risk_reduction_achievable_pct:.2f}%`"
        )

        chart_data = pd.DataFrame([
            {
                f"{curve.feature_name} ({curve.feature_unit})": pt.isolated_feature_value,
                "5-Year ASCVD Risk (%)": pt.predicted_5yr_risk_pct,
                "3-Year Risk (%)": pt.predicted_3yr_risk_pct,
                "Vascular Age (yrs)": pt.vascular_age,
            }
            for pt in curve.points
        ]).set_index(f"{curve.feature_name} ({curve.feature_unit})")

        st.line_chart(chart_data[["5-Year ASCVD Risk (%)", "3-Year Risk (%)"]])

        st.markdown("---")
        st.subheader("🧊 2D Cross-Isolator Response Surface")
        st.markdown("Evaluate non-linear interaction between two isolated variables with all other 18+ variables locked.")
        grid_2d = isolation_engine.generate_2d_response_surface(patient_vector, "ldl_c", "resting_bp_systolic", grid_size=5)

        df_grid = pd.DataFrame(
            grid_2d["risk_5yr_matrix"],
            index=[f"SBP {y} mmHg" for y in grid_2d["y_axis_values"]],
            columns=[f"LDL {x} mg/dL" for x in grid_2d["x_axis_values"]],
        )
        st.dataframe(df_grid, use_container_width=True)

    # -------------------------------------------------------------
    # TAB 4: In Silico Trial Augmentation
    # -------------------------------------------------------------
    with tab4:
        st.subheader("📊 In Silico Trial Augmentation (Indian Cohort Synthesis)")
        st.markdown(
            "Generate large-scale synthetic patient cohorts calibrated to Indian epidemiological distributions (ICMR-INDIAB / CSI registries / INTERHEART South Asia)."
        )

        col_g1, col_g2 = st.columns([1, 3])
        with col_g1:
            cohort_size_in = st.slider("Cohort Population Size", 100, 5000, 1000, step=100)
            generate_btn = st.button("🚀 Synthesize In Silico Indian Cohort", use_container_width=True)

        if generate_btn or "cohort_records" not in st.session_state:
            st.session_state["cohort_records"] = generator.generate_cohort(n_patients=cohort_size_in)

        records = st.session_state["cohort_records"]
        summary = generator.compute_cohort_summary_statistics(records)

        st.markdown("##### Indian Cohort Epidemiological Quality Control")
        sq1, sq2, sq3, sq4 = st.columns(4)
        with sq1:
            st.metric("Mean Age (Premature Onset)", summary.get("mean_age_years", "48.2y"))
            st.metric("Observed 5-Yr Event Rate", f"{summary.get('observed_5yr_ascvd_event_rate_pct', 0)}%")
        with sq2:
            st.metric("Mean Triglycerides", f"{summary.get('mean_triglycerides_mgdl', 203)} mg/dL")
            st.metric("High Lp(a) (≥125 nmol/L)", f"{summary.get('high_lpa_prevalence_pct', 0)}%")
        with sq3:
            st.metric("Mean HDL-C", f"{summary.get('mean_hdl_mgdl', 39.5)} mg/dL")
            st.metric("Diabetes Prevalence", f"{summary.get('diabetes_prevalence_pct', 0)}%")
        with sq4:
            st.metric("Mean ApoB", f"{summary.get('mean_apob_mgdl', 105)} mg/dL")
            st.metric("Mean Waist Circumference", f"{summary.get('mean_waist_circumference_cm', 88.5)} cm")

        # Convert to DataFrame for exploration & export
        df_cohort = pd.DataFrame([r.__dict__ for r in records])
        st.markdown("##### Synthetic Cohort Explorer (First 20 Records)")
        st.dataframe(df_cohort.head(20), use_container_width=True)

        csv_buffer = io.StringIO()
        df_cohort.to_csv(csv_buffer, index=False)
        st.download_button(
            label="📥 Download Indian Synthetic Cohort CSV",
            data=csv_buffer.getvalue(),
            file_name=f"indian_synthetic_cohort_{len(records)}.csv",
            mime="text/csv",
        )


if __name__ == "__main__":
    create_streamlit_app()
