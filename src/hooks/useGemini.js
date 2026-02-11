import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const useGemini = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateLabel = async (file) => {
        if (!genAI) return "Key Missing";
        setLoading(true);
        setError(null);

        let base64Data = ""; // Defined at function level to fix the 'not defined' error

        try {
            // 1. Convert to Base64
            base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
            });

            // 2. Use 2.0-flash for high quota (1500 req/day)
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const prompt = "Identify the main object in this photo. Return ONLY 1-2 words.";

            const result = await model.generateContent([
                { text: prompt },
                { inlineData: { data: base64Data, mimeType: file.type } }
            ]);

            const response = await result.response;
            return response.text().trim().replace(/[*#]/g, '');

        } catch (err) {
            console.error("🛑 Gemini Error:", err);
            // Fallback: If AI fails (quota/network), use the filename
            return file.name.split('.')[0].substring(0, 10).toUpperCase();
        } finally {
            setLoading(false);
        }
    };

    return { generateLabel, loading, error };
};