
import { GoogleGenAI } from "@google/genai";

const PRODUCT_KNOWLEDGE = `
You are the AI Support Assistant for Clincfloww, a high-performance management system for dental practitioners.

Core Product Details:
- Type: Secure Desktop-First Application with Local Data Ownership.
- Key Clinical Value: Privacy, clinical precision, and business growth.
- Primary Offering: Clincfloww – Essentials (Free Access).

Specific Features:
1. Patient Management: Comprehensive demographics, medical history, and clinical notes.
2. Odontogram (Dental Chart): Interactive visual charts for marking Cavities, Crowns, and RCT.
3. WhatsApp Integration: One-click automated appointment reminders.
4. AI Clinical Assistance: Drafts professional prescriptions in seconds.
5. Financial Module: Invoices, Quotations, and PDF exports. 
6. Security: Private local data storage (no cloud risks), hardware-locked licensing.

Support Email: clincfloww@gmail.com
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
    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to the AI brain right now. Please try again later.";
  }
};

export const getDashboardInsights = async (data: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Based on the following patient and clinical data, provide a 3-sentence high-level summary of practice performance, patient retention, and revenue opportunities: ${JSON.stringify(data)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a clinical business analyst for a premium dental clinic. Be professional, concise, and insightful.",
        temperature: 0.5,
      },
    });
    return response.text || "Insights currently unavailable.";
  } catch (error: any) {
    console.error("Insights Error:", error);
    return "Could not synthesize insights at this time.";
  }
};
