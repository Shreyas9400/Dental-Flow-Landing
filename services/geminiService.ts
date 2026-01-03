
import { GoogleGenAI } from "@google/genai";

const PRODUCT_KNOWLEDGE = `
You are the AI Support Assistant for ClinicFlow, a professional, high-performance management system for dental practitioners.

Core Product Details:
- Type: Secure Desktop-First Application with Local Data Ownership.
- Key Clinical Value: Focuses on privacy, clinical precision, and business growth.

Specific Features you should know about:
1. Patient Management: Comprehensive demographics, medical history, and clinical notes.
2. Odontogram (Dental Chart): Interactive visual charts for both adults and children to mark conditions like Cavities, Crowns, and RCT.
3. Intelligent Scheduling: Monthly/Weekly views with Google Calendar Sync.
4. WhatsApp Integration: Send automated appointment reminders to patients with a single click.
5. AI Clinical Assistance: Drafts professional prescriptions in seconds and provides insights on treatment trends.
6. Financial Module: Professional letterhead-ready Invoices, Quotations, and PDF exports. 
7. Business Intelligence: Visual reports for income vs. expenses and profit analysis.
8. Inventory: Supply tracking with automated expiry alerts.
9. Security: Private local data storage (no cloud risks), hardware-locked licensing, and automated backups every 2 hours.

Founders: 
- Dr. Sayali Jadhav (CEO)
- Dr. Prashant Hajare (CMO & Business Lead)

Pricing:
- Standard: ₹19,999 (One-time) + ₹1,999 (Annual Support).
- Promo: ₹14,999 (One-time) + ₹1,999 (Annual Support).
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
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to the AI brain right now. Please use our contact form for immediate support!";
  }
};
