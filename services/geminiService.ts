import { GoogleGenAI } from "@google/genai";
import { Product, SaleRecord, DailyStat } from '../types';

let genAI: GoogleGenAI | null = null;

try {
  if (process.env.API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  } else {
    console.warn("Gemini API Key missing. AI features will be disabled.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini:", error);
}

export const generateBakeryInsights = async (
  products: Product[],
  todaysSales: SaleRecord[],
  totalRevenue: number
): Promise<string> => {
  if (!genAI) {
    return "AI service is unavailable. Please check your API key configuration.";
  }

  const lowStockItems = products.filter(p => p.stock <= p.minStock).map(p => p.name).join(", ");
  const topSellers = products.filter(p => p.stock < 20).slice(0, 3).map(p => p.name).join(", "); // Mock logic for context

  const prompt = `
    You are an expert bakery manager assistant. Analyze the following daily data and provide a concise, encouraging, and actionable summary for the bakery admin.
    
    Data:
    - Total Revenue Today: $${totalRevenue.toFixed(2)}
    - Transaction Count: ${todaysSales.length}
    - Low Stock Warnings: ${lowStockItems || "None"}
    - Estimated Top Sellers (based on low stock): ${topSellers}

    Please format the response in Markdown with:
    1. **Daily Highlight**: A one-sentence summary of performance.
    2. **Action Items**: Bullet points on what to restock or focus on.
    3. **Strategy Tip**: A brief tip for increasing sales tomorrow.

    Keep it professional, warm, and concise.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate insights.";
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "An error occurred while generating the report. Please try again later.";
  }
};
