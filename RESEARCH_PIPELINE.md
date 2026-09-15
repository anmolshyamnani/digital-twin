# Cardiovascular & Hyperlipidemia Digital Twin Research Pipeline
### Optimization & Calibration for South Asian and Indian Clinical Cohorts

This repository contains an end-to-end clinical research engineer and machine learning architecture for in silico cardiovascular disease (CVD) and hyperlipidemia digital twin simulation, optimized for South Asian and Indian clinical phenotypes.

---

## 1. Core Architecture & Capabilities

### 1. In Silico Trial Augmentation (`digital_twin_pipeline/cohort_generator.py`)
- Generates synthetic patient cohorts ($N = 100 \text{ to } 10,000+$) using multivariate correlated statistical distributions and copulas calibrated to **INTERHEART**, **MASALA**, and **CADI** epidemiological studies.
- Models key South Asian clinical characteristics:
  - **Premature Onset**: Vascular age and incident event age shifted 8–10 years younger than standard Western cohorts.
  - **Atherogenic Dyslipidemia Triad**: High Triglycerides ($\ge 180\text{ mg/dL}$), Hypoalphalipoproteinemia (Low HDL-C $\le 40\text{ mg/dL}$), and discordantly elevated Apolipoprotein B ($\text{ApoB}$) representing small dense LDL particles.
  - **Hereditary $\text{Lp(a)}$ Hyper-prevalence**: Markedly elevated Lipoprotein(a) ($\ge 125\text{ nmol/L}$ or $\ge 50\text{ mg/dL}$) present in $30-40\%$ of the population.
  - **Metabolic Syndrome & Insulin Resistance**: Lower BMI thresholds for central adiposity (South Asian cutoff: overweight $\ge 23\text{ kg/m}^2$, obesity $\ge 27.5\text{ kg/m}^2$) and accelerated glycemic dysregulation.

### 2. Refined Risk Stratification (`digital_twin_pipeline/ml_risk_models.py`)
- Non-linear machine learning classifiers trained across multi-variable feature vectors:
  - $\text{Feature Space} = \{\text{Age, Sex, BMI, SBP, DBP, Total Chol, TG, HDL-C, LDL-C, ApoB, Lp(a), FBS, HbA1c, Max HR, Smoker, Diabetes, Family History CAD, CAC}\}$.
  - Computes **continuous, individualized probabilities** (e.g. $18.42\%$ 5-year subclinical ASCVD risk) rather than coarse categorical bins.
  - Generates multi-horizon hazard projections (3-year incident event risk, 5-year ASCVD hazard, 10-year lifetime trajectory, biological vascular age).

### 3. Therapeutic Optimization (Counterfactual Simulation Loop) (`digital_twin_pipeline/counterfactual_engine.py`)
- Simulates patient-specific pharmacotherapy and lifestyle modifications via physiological transition matrices:
  - **Pharmacotherapy**: Statin intensity titration (30%, 38%, 50% LDL-C reduction), Ezetimibe (+19%), PCSK9 Inhibitors/siRNA (+58% LDL-C, -28% Lp(a)), Bempedoic Acid (+18%), Icosapent Ethyl (REDUCE-IT 25% RRR on ischemic events), SGLT2i/GLP-1 RA cardiometabolic protection, Target SBP lowering via ARB/CCB titration.
  - **Lifestyle**: South Asian Heart-Healthy / Mediterranean diet, aerobic exercise prescriptions, active tobacco cessation, and targeted visceral adiposity reduction.
- Instantaneous computation of clinical outcomes:
  $$\text{ARR} = \text{Risk}_{\text{baseline}} - \text{Risk}_{\text{counterfactual}}$$
  $$\text{RRR} = \frac{\text{ARR}}{\text{Risk}_{\text{baseline}}} \times 100\%$$
  $$\text{NNT} = \frac{100}{\text{ARR}}$$

### 4. Reduction of Confounding Variables (`digital_twin_pipeline/feature_isolation.py`)
- Strict **ceteris paribus** feature-isolation mechanisms holding all other 15+ demographic, clinical, and lifestyle covariates 100% frozen.
- Computes 1D sensitivity curves and partial derivatives:
  $$\frac{\partial \text{Risk}}{\partial X}$$
- Generates 2D cross-isolator response surfaces (e.g., LDL-C vs. SBP) to evaluate non-linear interaction spaces without confounding.

---

## 2. Quickstart & Execution Guide

### Running the Python Research Pipeline
```bash
# Execute end-to-end 4-capability validation and synthetic cohort generation
python3 run_pipeline.py --cohort-size 1500 --export-csv synthetic_south_asian_cohort.csv
```

### Launching the Interactive Streamlit UI
```bash
pip install -r requirements.txt
streamlit run app.py
```
