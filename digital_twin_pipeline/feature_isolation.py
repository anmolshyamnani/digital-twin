"""
Reduction of Confounding Variables Module
Strict Feature-Isolation (Ceteris Paribus) Response Manifold & Sensitivity Engine
Allows researchers to hold all baseline demographic and clinical covariates entirely static
while sweeping single or dual parameters independently to evaluate isolated therapeutic gradients.
"""

import copy
from dataclasses import dataclass
from typing import Dict, Any, List, Tuple, Optional
from .ml_risk_models import NonLinearASCVDClassifier


@dataclass
class SensitivityPoint:
    isolated_feature_value: float
    predicted_5yr_risk_pct: float
    predicted_3yr_risk_pct: float
    predicted_10yr_risk_pct: float
    marginal_risk_delta_from_baseline: float
    vascular_age: float


@dataclass
class SensitivityCurveResult:
    feature_name: str
    feature_unit: str
    baseline_value: float
    points: List[SensitivityPoint]
    linear_slope_per_unit: float  # Partial derivative ∂Risk/∂X
    max_risk_reduction_achievable_pct: float


class FeatureIsolationEngine:
    """
    Evaluates isolated, confounding-free therapeutic gradients by holding all covariates static (ceteris paribus).
    """

    FEATURE_CONFIGS = {
        "resting_bp_systolic": {
            "name": "Systolic Blood Pressure",
            "unit": "mmHg",
            "min_val": 100.0,
            "max_val": 200.0,
            "steps": 11,
        },
        "ldl_c": {
            "name": "LDL Cholesterol",
            "unit": "mg/dL",
            "min_val": 30.0,
            "max_val": 230.0,
            "steps": 11,
        },
        "apo_b": {
            "name": "Apolipoprotein B",
            "unit": "mg/dL",
            "min_val": 40.0,
            "max_val": 200.0,
            "steps": 11,
        },
        "hba1c": {
            "name": "Hemoglobin A1c",
            "unit": "%",
            "min_val": 4.8,
            "max_val": 11.5,
            "steps": 10,
        },
        "triglycerides": {
            "name": "Serum Triglycerides",
            "unit": "mg/dL",
            "min_val": 50.0,
            "max_val": 500.0,
            "steps": 10,
        },
        "hdl_c": {
            "name": "HDL Cholesterol",
            "unit": "mg/dL",
            "min_val": 20.0,
            "max_val": 80.0,
            "steps": 9,
        },
        "bmi": {
            "name": "Body Mass Index",
            "unit": "kg/m²",
            "min_val": 19.0,
            "max_val": 40.0,
            "steps": 10,
        },
        "lp_a": {
            "name": "Lipoprotein(a)",
            "unit": "nmol/L",
            "min_val": 10.0,
            "max_val": 280.0,
            "steps": 10,
        },
    }

    def __init__(self, classifier: Optional[NonLinearASCVDClassifier] = None):
        self.classifier = classifier or NonLinearASCVDClassifier()

    def generate_isolated_sensitivity_curve(
        self,
        baseline_patient: Dict[str, Any],
        target_feature_key: str,
        custom_min: Optional[float] = None,
        custom_max: Optional[float] = None,
        custom_steps: Optional[int] = None,
    ) -> SensitivityCurveResult:
        """
        Executes a 1D strict ceteris paribus sweep:
        Holds all other patient attributes 100% frozen while sweeping target_feature_key across its range.
        """
        cfg = self.FEATURE_CONFIGS.get(
            target_feature_key,
            {
                "name": target_feature_key,
                "unit": "units",
                "min_val": 50.0,
                "max_val": 200.0,
                "steps": 10,
            },
        )

        min_val = custom_min if custom_min is not None else cfg["min_val"]
        max_val = custom_max if custom_max is not None else cfg["max_val"]
        steps = custom_steps if custom_steps is not None else cfg["steps"]

        base_val = float(baseline_patient.get(target_feature_key, (min_val + max_val) / 2.0))
        base_pred = self.classifier.predict_detailed(baseline_patient)
        base_risk = base_pred.continuous_ascvd_5yr_risk_pct

        step_size = (max_val - min_val) / max(1, steps - 1)
        points: List[SensitivityPoint] = []

        # Sweep with static frozen covariate environment
        for i in range(steps):
            cur_val = round(min_val + i * step_size, 2)
            isolated_vector = copy.deepcopy(baseline_patient)
            isolated_vector[target_feature_key] = cur_val

            # Pass through non-linear classifier
            pred = self.classifier.predict_detailed(isolated_vector)
            delta = round(pred.continuous_ascvd_5yr_risk_pct - base_risk, 2)

            pt = SensitivityPoint(
                isolated_feature_value=cur_val,
                predicted_5yr_risk_pct=pred.continuous_ascvd_5yr_risk_pct,
                predicted_3yr_risk_pct=pred.continuous_ascvd_3yr_risk_pct,
                predicted_10yr_risk_pct=pred.continuous_ascvd_10yr_risk_pct,
                marginal_risk_delta_from_baseline=delta,
                vascular_age=pred.vascular_age,
            )
            points.append(pt)

        # Compute empirical gradient slope (∂Risk / ∂X)
        if len(points) >= 2:
            first_pt = points[0]
            last_pt = points[-1]
            dx = last_pt.isolated_feature_value - first_pt.isolated_feature_value
            dy = last_pt.predicted_5yr_risk_pct - first_pt.predicted_5yr_risk_pct
            slope = round(dy / max(1e-5, dx), 4)
        else:
            slope = 0.0

        min_risk_in_curve = min(p.predicted_5yr_risk_pct for p in points)
        max_reduction = round(max(0.0, base_risk - min_risk_in_curve), 2)

        return SensitivityCurveResult(
            feature_name=cfg["name"],
            feature_unit=cfg["unit"],
            baseline_value=base_val,
            points=points,
            linear_slope_per_unit=slope,
            max_risk_reduction_achievable_pct=max_reduction,
        )

    def generate_2d_response_surface(
        self,
        baseline_patient: Dict[str, Any],
        feature_x: str = "ldl_c",
        feature_y: str = "resting_bp_systolic",
        grid_size: int = 5,
    ) -> Dict[str, Any]:
        """
        Generates a 2D interaction grid for two isolated features (e.g. LDL-C vs SBP)
        while holding all other 15+ variables completely static.
        """
        cfg_x = self.FEATURE_CONFIGS.get(feature_x, {"name": feature_x, "min_val": 40.0, "max_val": 200.0})
        cfg_y = self.FEATURE_CONFIGS.get(feature_y, {"name": feature_y, "min_val": 100.0, "max_val": 180.0})

        x_vals = [
            round(cfg_x["min_val"] + i * (cfg_x["max_val"] - cfg_x["min_val"]) / (grid_size - 1), 1)
            for i in range(grid_size)
        ]
        y_vals = [
            round(cfg_y["min_val"] + j * (cfg_y["max_val"] - cfg_y["min_val"]) / (grid_size - 1), 1)
            for j in range(grid_size)
        ]

        matrix: List[List[float]] = []

        for y in y_vals:
            row: List[float] = []
            for x in x_vals:
                isolated_vector = copy.deepcopy(baseline_patient)
                isolated_vector[feature_x] = x
                isolated_vector[feature_y] = y
                prob = self.classifier.predict_continuous_probability(isolated_vector)
                row.append(round(prob * 100, 2))
            matrix.append(row)

        return {
            "feature_x": cfg_x["name"],
            "feature_y": cfg_y["name"],
            "x_axis_values": x_vals,
            "y_axis_values": y_vals,
            "risk_5yr_matrix": matrix,
        }
