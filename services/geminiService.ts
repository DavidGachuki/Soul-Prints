import { GoogleGenAI } from "@google/genai";
import { UserProfile, MatchProfile, Message } from '../types';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Helper to analyze a user's soul print
export const analyzeSoulPrint = async (
  name: string,
  answer1: string,
  answer2: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Analyze the "Soul Print" of a user named ${name} for a relationship-focused app called "Soul Prints".
      They answered "What keeps you up at night?" with: "${answer1}".
      They answered "What is your perfect Sunday?" with: "${answer2}".
      
      Generate a warm, insightful, and empathetic 2-sentence description of their personality.
      Focus on their emotional landscape and what they value in life. tone should be supportive and romantic.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error analyzing soul print:", error);
    return "A beautiful soul with stories yet to be shared.";
  }
};

// Helper to calculate compatibility
export const calculateCompatibility = async (
  user: UserProfile,
  match: MatchProfile
): Promise<{ score: number; reason: string }> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Analyze the potential connection between two people.
      
      Person A (${user.name}):
      - Deep Thoughts: ${user.deepAnswer1}
      - Ideal Sunday: ${user.deepAnswer2}
      
      Person B (${match.name}):
      - Bio: ${match.bio}
      - Deep Thoughts: ${match.deepAnswer1}
      - Ideal Sunday: ${match.deepAnswer2}
      
      Return a JSON object with:
      1. "score": a number between 65 and 98.
      2. "reason": a one-sentence, gentle explanation of why their hearts might align. Focus on shared values or complementary energies.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const json = JSON.parse(response.text.trim());
    return {
      score: json.score || 85,
      reason: json.reason || "Your energies seem to dance to the same rhythm."
    };
  } catch (error) {
    console.error("Error calculating compatibility:", error);
    return { score: 80, reason: "A promising connection worth exploring." };
  }
};

// Helper to generate a chat response
export const generateChatResponse = async (
  match: MatchProfile,
  history: Message[],
  lastUserMessage: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Construct simple history string
    const context = history.slice(-5).map(m => 
      `${m.senderId === match.id ? match.name : 'User'}: ${m.text}`
    ).join('\n');

    const prompt = `
      Roleplay as ${match.name} on a dating app.
      Your personality: ${match.soulAnalysis}
      
      Recent chat history:
      ${context}
      
      User just said: "${lastUserMessage}"
      
      Reply as ${match.name}. Be friendly, engaging, and genuinely interested. 
      Keep it conversational and warm. Feel free to use a smiley if appropriate.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating chat:", error);
    return "That's lovely! Tell me more?";
  }
};