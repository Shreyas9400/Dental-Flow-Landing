
import { GoogleGenAI } from "@google/genai";

const PRODUCT_KNOWLEDGE = `
You are the "ClinicFloww Elite Advisor," an AI-powered growth assistant for clinic practitioners.

Your primary goal is to show the clinical business value of ClinicFloww:
- Emphasize Time Saving: Automated billing and WhatsApp recalls save 40% of admin time.
- Emphasize Revenue Growth: AI identifies missed follow-ups and revenue leakage.
- Emphasize Security: 100% local data ownership means patient records never leave the clinic's local hardware.

Core Features:
1. Patient Records: Digital directory with clinical history and Demographics.
2. Financials: Automated invoicing, quotes, and receivable tracking.
3. Inventory: Smart expiry alerts to prevent clinical waste.
4. AI Clinical Engine: Drafting professional prescriptions and identifying recall opportunities.
5. WhatsApp: One-click patient recall for checkups.

Support Email: ClinicFloww@gmail.com
If a user asks about pricing, mention Clincfloww Essentials is currently available with Free Access for qualified clinics.
`;

export const getGeminiResponse = async (userPrompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: {
        systemInstruction: PRODUCT_KNOWLEDGE,
        temperature: 0.7,
      },
    });
    return response.text || "I apologize, I could not synthesize that clinical insight. How else can I assist your practice today?";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (!process.env.API_KEY) {
      return "Practice Intelligence is currently offline. Please ensure the API_KEY environment variable is configured.";
    }
    return "The clinical AI link is currently unstable. Please try querying practice performance again in a moment.";
  }
};

export const getDashboardInsights = async (data: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Synthesize a business growth strategy based on this clinical data. Focus on missed revenue opportunities and patient retention: ${JSON.stringify(data)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional Clinical Business Strategist. Provide 3 high-impact, actionable insights to increase clinic footfall and revenue.",
        temperature: 0.5,
      },
    });
    return response.text || "Revenue analysis currently unavailable.";
  } catch (error: any) {
    console.error("Insights Error:", error);
    return "Could not synthesize revenue insights at this time.";
  }
};
