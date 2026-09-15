#!/usr/bin/env python3
"""
Root execution script for Cardiovascular & Hyperlipidemia Digital Twin Research Pipeline.
Usage:
    python3 run_pipeline.py [--cohort-size 2000] [--export-csv cohort.csv]
"""

import sys
import argparse
from digital_twin_pipeline.clinical_validator import run_complete_digital_twin_validation
from digital_twin_pipeline.cohort_generator import SouthAsianCohortGenerator

def main():
    parser = argparse.ArgumentParser(
        description="Cardiovascular & Hyperlipidemia Digital Twin Research Pipeline (South Asian Cohort Optimization)"
    )
    parser.add_argument("--cohort-size", type=int, default=1500, help="Number of synthetic patient records to generate (default: 1500)")
    parser.add_argument("--export-csv", type=str, default="synthetic_south_asian_cohort.csv", help="CSV export filename")
    parser.add_argument("--export-json", type=str, default=None, help="JSON export filename")
    
    args = parser.parse_args()
    
    # Run full 4-capability validation
    results = run_complete_digital_twin_validation(n_synthetic_cohort=args.cohort_size)
    
    # Export cohort file
    gen = SouthAsianCohortGenerator(seed=42)
    cohort = gen.generate_cohort(n_patients=args.cohort_size)
    
    if args.export_csv:
        gen.export_to_csv(cohort, args.export_csv)
        print(f"\n📁 Exported synthetic cohort dataset to: {args.export_csv}")
        
    if args.export_json:
        gen.export_to_json(cohort, args.export_json)
        print(f"📁 Exported synthetic cohort dataset to: {args.export_json}")

if __name__ == "__main__":
    main()
