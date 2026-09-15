# CardioTwin: Cardiovascular & Hyperlipidemia Digital Twin System
## Complete Clinical & Technical Documentation

**Version:** 2.4.0  
**Target Population:** General Adult & South Asian / Indian Phenotypes  
**Frameworks Grounded:** ACC/AHA 2019/2023 Primary Prevention, AHA PREVENT™ (2024), ESC Dyslipidemia (2020), CTT Meta-Analyses, REDUCE-IT, CLEAR Outcomes, and INTERHEART / MASALA Studies.

---

## Table of Contents
1. [Executive Summary & System Overview](#1-executive-summary--system-overview)
2. [How the Digital Twin Works (Step-by-Step)](#2-how-the-digital-twin-works-step-by-step)
3. [The South Asian / Indian Clinical Phenotype](#3-the-south-asian--indian-clinical-phenotype)
4. [How to Incorporate New Drugs & Molecules](#4-how-to-incorporate-new-drugs--molecules)
5. [The 6 Primary Outcomes of the System](#5-the-6-primary-outcomes-of-the-system)
6. [Mathematical & Clinical Formulation Reference](#6-mathematical--clinical-formulation-reference)
7. [System Architecture & File Organization](#7-system-architecture--file-organization)
8. [Quickstart & Execution Guide](#8-quickstart--execution-guide)

---

## 1. Executive Summary & System Overview

A **Cardiovascular Digital Twin** is a dynamic, multi-dimensional, in silico replica of an individual patient's cardiovascular system. Rather than testing therapies sequentially through empirical trial-and-error across months or years in high-risk patients, the digital twin simulates pharmacological, nutraceutical, and lifestyle interventions instantaneously.

### Key Capabilities
- **Simulates 18+ Correlated Biomarkers**: Evaluates lipid fractions (LDL-C, HDL-C, Triglycerides, ApoB, Lp(a)), hemodynamics (SBP, DBP, Resting HR), glycemic indices (FBS, HbA1c), renal indices (eGFR, uACR), and subclinical atherosclerosis burden (CAC Agatston score).
- **Instantaneous Multi-Horizon Risk Calculations**: 3-year subclinical risk, 5-year ASCVD hazard, 10-year lifetime trajectory, and biological vascular age.
- **Counterfactual Intervention Modeling**: Evaluates High/Moderate/Low intensity Statins, Ezetimibe, PCSK9 Inhibitors/siRNA, Bempedoic Acid, Icosapent Ethyl, SGLT2i/GLP-1 RA, Antihypertensives, and Lifestyle/Dietary prescriptions.
- **Histological Lumen Visualization**: Generates real-time 3D cross-sectional vascular lumen opening and fibrous cap thickness predictions.

---

## 2. How the Digital Twin Works (Step-by-Step)

```
┌──────────────────────────┐      ┌──────────────────────────┐      ┌──────────────────────────┐
│   1. PATIENT BIOMARKERS  │ ───► │  2. BASELINE RISK MODEL  │ ───► │ 3. COUNTERFACTUAL ENGINE │
│ • SBP / DBP / HR         │      │ • ACC/AHA PCE & PREVENT  │      │ • Statin / Ezetimibe     │
│ • LDL, HDL, TG, ApoB     │      │ • South Asian Triad      │      │ • PCSK9i / Bempedoic     │
│ • Lp(a), HbA1c, CAC, eGFR│      │ • Biological Vascular Age│      │ • Icosapent / SGLT2i     │
└──────────────────────────┘      └──────────────────────────┘      └────────────┬─────────────┘
                                                                                 │
                                                                                 ▼
                                                                    ┌──────────────────────────┐
                                                                    │   4. CLINICAL OUTCOMES   │
                                                                    │ • ARR, RRR, NNT          │
                                                                    │ • Vascular Rejuvenation  │
                                                                    │ • Lumen Remodeling       │
                                                                    │ • Kaplan-Meier Curves    │
                                                                    └──────────────────────────┘
```

### Step 1: Ingesting the Patient's Multi-Variable Fingerprint
The twin captures 18+ demographic, laboratory, and imaging variables:
- **Demographics**: Age, Biological Sex, Race / Ethnicity.
- **Lipid Panel**: Total Cholesterol, LDL-C, HDL-C, Fasting Triglycerides, Apolipoprotein B (ApoB), and Lipoprotein(a) [Lp(a)].
- **Hemodynamics & Renal**: Systolic BP, Diastolic BP, Antihypertensive status, eGFR, and Urine Albumin-to-Creatinine Ratio (uACR).
- **Metabolic & Lifestyle**: Fasting Blood Sugar, HbA1c, BMI, Smoking status, and Diabetes status.
- **Subclinical Imaging**: Coronary Artery Calcium (CAC Agatston Score).

### Step 2: Baseline Non-Linear Risk Stratification
The baseline engine determines:
1. **10-Year ASCVD Risk (%)**: Using ACC/AHA Pooled Cohort Equations (PCE) and AHA PREVENT™ equations calibrated with South Asian lipid risk modifiers.
2. **Biological Vascular Age (Years)**: The chronological age at which an individual with optimal risk factors would have the same 10-year risk profile.
3. **5-Year Hazard Rate**: Projected medium-term subclinical event probability.

### Step 3: Counterfactual Drug Simulation Loop
A "counterfactual" represents a hypothetical clinical branch: *"What if this specific patient is placed on High-Intensity Statin + Ezetimibe + PCSK9 inhibitor + Icosapent Ethyl?"*
The engine computes the updated biomarker state:
- Each medication applies an evidence-based biological reduction factor (e.g. High-Intensity Statin = $-52\%$ LDL-C, Ezetimibe = $-19\%$ residual LDL-C, PCSK9i = $-58\%$ residual LDL-C).

### Step 4: Real-Time Physiological Remodeling & Metrics
The twin recalculates the risk equations under the new biomarker profile to produce comparative clinical metrics (ARR, RRR, NNT) and visualizes arterial remodeling.

---

## 3. The South Asian / Indian Clinical Phenotype

South Asians (individuals from India, Pakistan, Bangladesh, Sri Lanka, and Nepal) experience a premature, aggressive, and distinct pattern of cardiovascular disease:
- **Premature Onset**: Incident coronary events occur **8 to 10 years earlier** than Western cohorts, with over 50% of myocardial infarctions occurring before age 50.
- **Atherogenic Dyslipidemia Triad**: High Triglycerides ($\ge 180\text{ mg/dL}$), low HDL-C ($\le 38\text{ mg/dL}$), and elevated Apolipoprotein B ($\ge 120\text{ mg/dL}$) reflecting small, dense, highly atherogenic LDL particles (sdLDL).
- **Hereditary $\text{Lp(a)}$ Elevation**: Elevated Lipoprotein(a) ($\ge 125\text{ nmol/L}$) is present in **$30\text{–}40\%$** of South Asians due to genetic $LPA$ kringle IV-2 repeat variants.
- **Lower BMI Cutoffs**: Visceral adiposity and insulin resistance occur at lower body mass indices (South Asian overweight cutoff: $\ge 23\text{ kg/m}^2$; obesity: $\ge 27.5\text{ kg/m}^2$).

---

## 4. How to Incorporate New Drugs & Molecules

Incorporating a new pharmaceutical drug (from Phase 2, Phase 3, or emerging trials) requires defining three parameters:

### The 3 Core Parameters
1. **Biomarker Delta ($\Delta$)**: The percentage by which the drug lowers specific blood markers based on clinical trials:
   - LDL-C drop ($\%$)
   - Lp(a) drop ($\%$)
   - Triglycerides drop ($\%$)
   - SBP drop ($\text{mmHg}$)
   - HbA1c drop ($\%$)
2. **Clinical Hazard Ratio ($HR$)**:
   - **CTT Linear Relationship**: Every $38.67\text{ mg/dL}$ ($1.0\text{ mmol/L}$) reduction in LDL-C confers a **$22\%$ reduction in Major Adverse Cardiovascular Events (MACE)** ($HR = 0.78$).
   - **Non-LDL Independent Benefit**: Direct plaque stabilization or anti-inflammatory benefit (e.g. REDUCE-IT 25% RRR with Icosapent Ethyl).
3. **Patient Eligibility / Indication**: Specific phenotypes that qualify for the drug (e.g. statin intolerance, baseline $\text{TG} \ge 150\text{ mg/dL}$, or $\text{Lp(a)} \ge 125\text{ nmol/L}$).

### TypeScript Implementation Example
```typescript
// 1. In types/cardio.ts: Add the new drug flag
export interface CounterfactualTreatment {
  statinIntensity: 'none' | 'low' | 'moderate' | 'high';
  ezetimibe: boolean;
  pcsk9: boolean;
  bempedoicAcid: boolean;
  icosapent: boolean;
  glp1sglt2: boolean;
  
  // NEW DRUG CANDIDATE:
  obicetrapib?: boolean;  // Oral CETP Inhibitor (-45% LDL, -30% ApoB)
  pelacarsen?: boolean;   // siRNA against Lp(a) (-80% Lp(a))
  tirzepatide?: boolean;  // Dual GIP/GLP-1 (-20% weight, -6 mmHg SBP)
}

// 2. In services/riskEngine.ts: Apply the biological effect
if (counterfactual.obicetrapib) {
  ldlMultiplier *= (1 - 0.45); // 45% reduction from BROADWAY trial
}

if (counterfactual.pelacarsen) {
  projectedLpa *= (1 - 0.80);  // 80% reduction from HORIZON trial
}

// 3. Compute new 10-Year ASCVD Risk via CTT meta-analysis law
const ldlDelta = baselineLdl - projectedLdl;
const ldlMmol = Math.max(0, ldlDelta / 38.67);
const ldlHazardRatio = Math.pow(0.78, ldlMmol);
const counterfactualRisk = baselineRisk * ldlHazardRatio;
```

### Python Pipeline Implementation Example
```python
# In digital_twin_pipeline/counterfactual_engine.py
def apply_novel_drug(patient_record: dict, drug_name: str) -> dict:
    updated = patient_record.copy()
    if drug_name == "obicetrapib":
        updated["ldl"] *= (1.0 - 0.45)
        updated["apoB"] *= (1.0 - 0.30)
    elif drug_name == "pelacarsen":
        updated["lpa"] *= (1.0 - 0.80)
    elif drug_name == "tirzepatide":
        updated["bmi"] *= (1.0 - 0.18)
        updated["sbp"] -= 6.0
        updated["hba1c"] -= 1.8
    return updated
```

---

## 5. The 6 Primary Outcomes of the System

| Outcome Metric | Mathematical Definition | Clinical Interpretation | Clinical Example |
|---|---|---|---|
| **1. Absolute Risk Reduction (ARR)** | $\text{ARR} = \text{Risk}_{\text{base}} - \text{Risk}_{\text{treat}}$ | Direct percentage point drop in 10-year cardiovascular event risk. | Baseline $26.0\% \to 8.0\% \implies \mathbf{18.0\%\text{ ARR}}$ |
| **2. Relative Risk Reduction (RRR)** | $\text{RRR} = \left(\frac{\text{ARR}}{\text{Risk}_{\text{base}}}\right) \times 100\%$ | Proportion of total baseline risk eliminated by the therapy. | $\frac{18.0}{26.0} \times 100 = \mathbf{69.2\%\text{ RRR}}$ |
| **3. Number Needed to Treat (NNT)** | $\text{NNT} = \left\lceil \frac{100}{\text{ARR}} \right\rceil$ | Number of identical patients treated for 10 years to prevent 1 event. | $\frac{100}{18.0} = \mathbf{6\text{ patients}}$ |
| **4. Vascular Age Rejuvenation** | $\Delta\text{Age} = \text{Age}_{\text{base}} - \text{Age}_{\text{treat}}$ | Translates percentage risks into intuitive biological heart years. | Arteries behaving like a 68yo rejuvenated to **52yo** ($+16\text{ yrs gained}$). |
| **5. Arterial Lumen Remodeling** | $\text{Lumen Stenosis } \% = \frac{\text{Plaque Area}}{\text{Vessel Area}} \times 100$ | 3D visual cross-section of lipid core regression and lumen widening. | Lumen stenosis reduced from **$58\%$ to $22\%$**. |
| **6. Kaplan-Meier Survival Curve** | $S(t) = \prod_{t_i \le t} \left(1 - \frac{d_i}{n_i}\right)$ | 10-year cumulative event-free survival curves. | Visualizes cumulative 10-year event-free probability trajectory. |

---

## 6. Mathematical & Clinical Formulation Reference

### Cholesterol Treatment Trialists (CTT) Meta-Analysis
$$\text{Hazard Ratio}_{\text{LDL}} = 0.78^{\left(\frac{\Delta \text{LDL-C (mg/dL)}}{38.67}\right)}$$

### Blood Pressure Lowering Treatment Trialists (BPLTTC)
$$\text{Hazard Ratio}_{\text{BP}} = 0.80^{\left(\frac{\Delta \text{SBP (mmHg)}}{10}\right)}$$

### Coronary Artery Calcium (CAC) Agatston Multiplier
$$\text{Multiplier}_{\text{CAC}} = \begin{cases} 
0.45 & \text{if } \text{CAC} = 0 \\
1.00 & \text{if } 1 \le \text{CAC} \le 99 \\
1.65 & \text{if } 100 \le \text{CAC} \le 399 \\
2.40 & \text{if } \text{CAC} \ge 400 
\end{cases}$$

### South Asian Hereditary Lipoprotein(a) Hazard Multiplier
$$\text{Multiplier}_{\text{Lp(a)}} = 1.0 + \max\left(0, \frac{\text{Lp(a)} - 75}{150}\right) \times 0.65$$

---

## 7. System Architecture & File Organization

```
cardiotwin-app/
├── SYSTEM_ARCHITECTURE_GUIDE.html    # Standalone, printable, interactive documentation
├── RESEARCH_PIPELINE.md             # Python research pipeline architecture specification
├── app.py                           # Standalone Streamlit research web application
├── run_pipeline.py                  # CLI validation & synthetic cohort generator script
├── requirements.txt                 # Python dependencies (Streamlit, Scikit-learn, XGBoost)
├── public/
│   └── system_guide.html            # Web-accessible HTML guide
├── src/
│   ├── App.tsx                      # Primary React digital twin user interface
│   ├── types/cardio.ts              # TypeScript interfaces for biomarkers & drugs
│   ├── data/presets.ts              # Clinical presets (including Rajesh Kumar SA phenotype)
│   ├── services/
│   │   ├── riskEngine.ts            # Clinical risk engine (PCE, PREVENT, CTT meta-analyses)
│   │   └── geminiAdvisor.ts         # Google Gemini AI GDMT clinical synthesis
│   └── components/
│       ├── Header.tsx               # Top navigation bar with "How It Works & Drugs" trigger
│       ├── SystemGuideModal.tsx     # 4-tab interactive guide & live drug sandbox
│       ├── DigitalTwinHero.tsx      # Patient avatar, vascular age, and risk overview
│       ├── BiomarkerInputs.tsx      # Real-time multi-variable biomarker sliders
│       ├── CounterfactualControls.tsx# Drug sandbox (Statins, PCSK9, SGLT2i, ARBs, etc.)
│       ├── VascularLumenVisualizer.tsx# Dynamic 3D arterial cross-section renderer
│       ├── VisualCharts.tsx         # Kaplan-Meier survival curves & comparison charts
│       ├── ClinicalAISynthesis.tsx  # Gemini GDMT AI recommendation drawer
│       └── ExportReportModal.tsx    # Printable PDF/EHR clinical consultation report
└── digital_twin_pipeline/           # Python research package
    ├── cohort_generator.py          # Synthetic South Asian cohort generator
    ├── ml_risk_models.py            # Non-linear ML risk stratification models
    ├── counterfactual_engine.py     # Pharmacotherapy transition matrix engine
    └── feature_isolation.py         # Ceteris paribus confounder reduction engine
```

---

## 8. Quickstart & Execution Guide

### Web Dashboard (Live in AI Studio Preview)
- Open the application in your browser preview: `https://ais-dev-hr4dgjzyg7qjpswthagsxe-925272355965.asia-east1.run.app`
- Click **"How It Works & Drugs"** in the top navigation bar to open the interactive system guide and live drug testing sandbox.
- Select clinical cases such as **Rajesh Kumar (South Asian Premature CAD)** to explore real-time counterfactual interventions.

### Python Research Pipeline (CLI)
```bash
# Run end-to-end 4-capability validation and export synthetic cohort CSV
python3 run_pipeline.py --cohort-size 1500 --export-csv synthetic_south_asian_cohort.csv
```

### Python Streamlit Application
```bash
# Install dependencies
pip install -r requirements.txt

# Launch Streamlit frontend
streamlit run app.py
```
