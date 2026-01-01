
import { GoogleGenAI } from "@google/genai";

const PRODUCT_KNOWLEDGE = `
You are the AI Support Assistant for DentalFlow, a premium dental management application.
DentalFlow is a "Local-First" application, meaning it stores all data on the dentist's local machine for maximum security and privacy.

Key Features:
- Comprehensive Patient Management: Electronic health records, treatment plans.
- Smart Billing & Accounting: Insurance claims, automated invoicing.
- Inventory Management: Track clinical supplies and equipment maintenance.
- Appointment Scheduling: Seamlessly syncs with Google Calendar.
- AI Assistant: Powered by Gemini to help summarize patient history or suggest treatment codes.
- Local-Only Storage: No cloud database; 100% data ownership.
- Direct Messaging: Communicate with patients via integrated SMS/Email modules.
- Free Trial: 7 days.

Founders: 
- Dr. Sayali Jadhav (Chief Executive Officer)
- Dr. Prashant Hajare (Chief Marketing and Business Lead Officer)

Pricing (One-time license + Annual subscription):
- Introductory Offer: ₹14,999 (One-time) + ₹1,999 (Annual).
- Standard Price: ₹19,999 (One-time) + ₹1,999 (Annual).

Availability: Offline and Online modes.
`;

export const getGeminiResponse = async (userPrompt: string) => {
  // Always create a new instance right before making an API call 
  // to ensure it uses the most up-to-date environment key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: {
        systemInstruction: PRODUCT_KNOWLEDGE,
        temperature: 0.7,
        topP: 0.95,
      },
    });
    
    // Using the direct .text property as per SDK guidelines
    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I am currently offline. Please reach out to our support team directly via the contact form!";
  }
};
