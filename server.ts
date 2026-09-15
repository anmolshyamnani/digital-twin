import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy GoogleGenAI initializer
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Clinical AI synthesis will use intelligent fallback.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Endpoint: AI Clinical Twin Synthesis & GDMT Guidance
app.post("/api/twin/ai-analysis", async (req, res) => {
  try {
    const { baseline, counterfactual, riskBaseline, riskCounterfactual } = req.body;

    const ai = getAIClient();
    if (!ai) {
      // Return structured rule-based clinical evaluation fallback
      return res.json({
        analysis: generateFallbackAnalysis(baseline, counterfactual, riskBaseline, riskCounterfactual),
        source: "engine-rules",
      });
    }

    const prompt = `
You are a Board-Certified Preventive Cardiologist and Lipidologist reviewing a patient's Cardiovascular & Hyperlipidemia Digital Twin.

### Patient Profile:
- Age: ${baseline.age} | Sex: ${baseline.sex} | Ethnicity/Race: ${baseline.race}
- Blood Pressure: ${baseline.sbp}/${baseline.dbp} mmHg (On BP Meds: ${baseline.onBPMeds ? "Yes" : "No"})
- Lipid Panel:
  - Total Cholesterol: ${baseline.totalChol} mg/dL
  - LDL-C: ${baseline.ldl} mg/dL
  - HDL-C: ${baseline.hdl} mg/dL
  - Triglycerides: ${baseline.triglycerides} mg/dL
  - Lp(a): ${baseline.lpa ? `${baseline.lpa} nmol/L` : "Not measured"}
  - ApoB: ${baseline.apoB ? `${baseline.apoB} mg/dL` : "Not measured"}
- Metabolic & Renal:
  - Fasting Glucose: ${baseline.glucose} mg/dL | HbA1c: ${baseline.hba1c}%
  - eGFR: ${baseline.egfr} mL/min/1.73m² | Urine Albumin/Cr: ${baseline.uacr} mg/g
  - BMI: ${baseline.bmi} (Height: ${baseline.height} cm, Weight: ${baseline.weight} kg)
- Clinical Risk Factors & History:
  - Smoking: ${baseline.smoker}
  - Diabetes: ${baseline.diabetes ? "Yes" : "No"}
  - Coronary Artery Calcium (CAC) Score: ${baseline.cac} Agatston units
  - Prior ASCVD (Secondary prevention): ${baseline.priorASCVD ? "Yes" : "No"}
  - Family History Premature CAD: ${baseline.familyHistoryCAD ? "Yes" : "No"}
  - Statin Intolerance: ${baseline.statinIntolerant ? "Yes" : "No"}

### Baseline Risk Calculations:
- 10-Year ASCVD Risk (PCE/PREVENT): ${riskBaseline.tenYearRisk.toFixed(1)}% (${riskBaseline.riskCategory})
- Lifetime CVD Risk: ${riskBaseline.lifetimeRisk.toFixed(1)}%
- Vascular Biological Age: ${riskBaseline.vascularAge} years (vs Chronological: ${baseline.age} years)
- 10-Year MI Probability: ${riskBaseline.miProb.toFixed(1)}% | Stroke Probability: ${riskBaseline.strokeProb.toFixed(1)}%
- Estimated Plaque Burden Index: ${riskBaseline.plaqueIndex}/100 (${riskBaseline.plaqueSeverity})
- Hyperlipidemia Phenotype: ${riskBaseline.hyperlipidemiaPhenotype}

### Simulated Counterfactual Interventions:
- Pharmacotherapy:
  - Statin: ${counterfactual.statinIntensity}
  - Ezetimibe: ${counterfactual.ezetimibe ? "Active" : "None"}
  - PCSK9 Inhibitor: ${counterfactual.pcsk9 ? "Active" : "None"}
  - Bempedoic Acid: ${counterfactual.bempedoicAcid ? "Active" : "None"}
  - Icosapent Ethyl: ${counterfactual.icosapent ? "Active" : "None"}
  - SGLT2i / GLP-1 RA: ${counterfactual.glp1sglt2 ? "Active" : "None"}
  - SBP Reduction Target: -${counterfactual.sbpReduction} mmHg
  - Aspirin / Antiplatelet: ${counterfactual.aspirin ? "Active" : "None"}
- Lifestyle:
  - Diet: ${counterfactual.diet}
  - Exercise Target: ${counterfactual.exerciseLevel}
  - Smoking Cessation: ${counterfactual.smokingCessation ? "Yes (Quitting)" : "No change"}
  - Weight Target: ${counterfactual.weightLossPercent}% reduction

### Simulated Counterfactual Outcomes:
- Simulated 10-Year Risk: ${riskCounterfactual.tenYearRisk.toFixed(1)}% (Absolute Risk Reduction: ${(riskBaseline.tenYearRisk - riskCounterfactual.tenYearRisk).toFixed(1)}%, Relative Reduction: ${(((riskBaseline.tenYearRisk - riskCounterfactual.tenYearRisk) / Math.max(0.1, riskBaseline.tenYearRisk)) * 100).toFixed(0)}%)
- Simulated LDL-C Target: ${riskCounterfactual.projectedLDL} mg/dL
- Simulated Vascular Age: ${riskCounterfactual.vascularAge} years
- 10-Year Estimated NNT (Number Needed to Treat): ${riskCounterfactual.nnt}
- Event-Free Years Gained: ${riskCounterfactual.yearsGained.toFixed(1)} years

### Instruction:
Provide an expert, structured clinical assessment formatted in clean Markdown with the following sections:
1. **Executive Clinical Impression & Phenotypic Drivers**: Key pathophysiological drivers (atherogenic particles, endothelial shear, metabolic/renal synergy).
2. **Guideline-Directed Medical Therapy (GDMT) Appraisal (ACC/AHA 2018/2024 & ESC 2019/2024)**: Compare current therapy vs optimal target. Note LDL-C goal (<55 mg/dL for very high risk / secondary, <70 mg/dL for high risk).
3. **Counterfactual Strategy Impact & Evidence Basis**: Synthesize how the selected combination achieves the risk reduction (reference trial precedents like FOURIER, CLEAR Outcomes, IMPROVE-IT, SPRINT where relevant).
4. **Safety, Lab Monitoring & Statin Intolerance Management**: Baseline & follow-up safety checkpoints (ALT/AST, CK, eGFR, fasting lipids at 4-12 weeks).
5. **Patient-Centered Translation (Actionable Summary)**: 2-3 encouraging, plain-language takeaway points explaining the "Why" and actionable milestones to the patient.

Keep the tone authoritative, rigorous, evidence-based, concise, and structured. Do not include markdown code blocks, just direct formatted markdown.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({
      analysis: response.text,
      source: "gemini-3.7-flash",
    });
  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate AI analysis",
      fallback: "Clinical analysis could not be completed via AI service.",
    });
  }
});

// Endpoint: Ask Assistant / Virtual Cardiologist consultation chat
app.post("/api/twin/ask-assistant", async (req, res) => {
  try {
    const { question, baseline, counterfactual, riskBaseline, riskCounterfactual, history = [] } = req.body;

    const ai = getAIClient();
    if (!ai) {
      return res.json({
        answer: "AI services are currently operating in local mode. The simulated model shows an absolute risk reduction of " +
          (riskBaseline.tenYearRisk - riskCounterfactual.tenYearRisk).toFixed(1) + "% with the current counterfactual configuration. Consult clinical guidelines for specific medication titration.",
      });
    }

    const systemInstruction = `You are a clinical decision support specialist and preventive cardiologist AI assistant embedded in a Cardiovascular & Hyperlipidemia Digital Twin platform.
You have real-time access to the patient's baseline biomarkers:
- Age: ${baseline.age}, Sex: ${baseline.sex}, SBP: ${baseline.sbp}/${baseline.dbp} mmHg, Total Chol: ${baseline.totalChol}, LDL-C: ${baseline.ldl}, HDL-C: ${baseline.hdl}, TG: ${baseline.triglycerides}, Lp(a): ${baseline.lpa || "N/A"}, CAC Score: ${baseline.cac}, Smoker: ${baseline.smoker}, Diabetes: ${baseline.diabetes}.
Baseline 10-Year ASCVD Risk: ${riskBaseline.tenYearRisk.toFixed(1)}%.
Counterfactual Simulated 10-Year ASCVD Risk: ${riskCounterfactual.tenYearRisk.toFixed(1)}% (LDL target: ${riskCounterfactual.projectedLDL} mg/dL).

Answer the user's specific clinical, pharmacological, or physiological question clearly, referencing ACC/AHA, NLA, and ESC guidelines. Include practical nuances such as statin safety, PCSK9 indication, CAC scoring implications, Lp(a) risk enhancement, and lifestyle synergy. Keep responses concise (under 250 words) with clear bullet points.`;

    const contents = [
      ...history.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      {
        role: "user",
        parts: [{ text: question }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction,
      },
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error("Ask assistant error:", error);
    res.status(500).json({ error: error.message || "Failed to process question" });
  }
});

// Helper for fallback analysis when API key is missing
function generateFallbackAnalysis(baseline: any, counterfactual: any, riskBaseline: any, riskCounterfactual: any) {
  const arr = (riskBaseline.tenYearRisk - riskCounterfactual.tenYearRisk).toFixed(1);
  const rrr = (((riskBaseline.tenYearRisk - riskCounterfactual.tenYearRisk) / Math.max(0.1, riskBaseline.tenYearRisk)) * 100).toFixed(0);

  return `### Executive Clinical Impression & Phenotypic Drivers
- **Patient Profile**: ${baseline.age}-year-old ${baseline.sex} presenting with a baseline 10-year ASCVD risk of **${riskBaseline.tenYearRisk.toFixed(1)}%** (${riskBaseline.riskCategory}).
- **Atherogenic Burden**: Baseline LDL-C of ${baseline.ldl} mg/dL with a calculated vascular biological age of **${riskBaseline.vascularAge} years** (${Math.max(0, riskBaseline.vascularAge - baseline.age)} years older than chronological age).
- **Phenotype Classification**: ${riskBaseline.hyperlipidemiaPhenotype}.

### Guideline-Directed Medical Therapy (GDMT) Appraisal
- **Target LDL-C**: According to ACC/AHA and ESC dyslipidemia guidelines, target LDL-C for this risk category is **< 70 mg/dL** (or **< 55 mg/dL** if very high risk/secondary prevention).
- **Current vs Projected**: Baseline LDL-C (${baseline.ldl} mg/dL) is projected to decline to **${riskCounterfactual.projectedLDL} mg/dL** under the simulated regimen.

### Counterfactual Strategy Impact
- **Absolute Risk Reduction (ARR)**: **${arr}%** over 10 years.
- **Relative Risk Reduction (RRR)**: **${rrr}%**.
- **Calculated NNT**: **${riskCounterfactual.nnt}** patients treated over 10 years to prevent 1 major adverse cardiovascular event (MACE).
- **Simulated Vascular Life Extension**: Approximately **+${riskCounterfactual.yearsGained.toFixed(1)} event-free life years** gained.

### Recommended Monitoring Roadmap
1. Fasting lipid panel and ALT at 4 to 12 weeks post-therapy initiation or dose adjustment.
2. Routine blood pressure log validation to confirm sustained target < 130/80 mmHg.
3. Annual renal panel (eGFR, serum creatinine) and HbA1c surveillance.`;
}

// Start server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CardioTwin Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
