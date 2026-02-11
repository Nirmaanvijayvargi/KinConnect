import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Manual simple parser since dotenv might not be installed or configured for modules
const envPath = path.resolve(process.cwd(), '.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const apiKeyLine = envFile.split('\n').find(line => line.startsWith('VITE_GEMINI_API_KEY='));
const apiKey = apiKeyLine ? apiKeyLine.split('=')[1].trim() : null;

console.log("Using API Key:", apiKey ? apiKey.substring(0, 5) + "..." : "NONE");

async function listModels() {
    if (!apiKey) {
        console.error("No API Key found in .env");
        return;
    }

    try {
        console.log("Querying Google API for available models...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("API Error Details:", JSON.stringify(data.error, null, 2));
            console.log("\nPOSSIBLE CAUSES:");
            console.log("1. 'Generative Language API' is not enabled in Google Cloud Console.");
            console.log("2. API Key restrictions block this IP or Referrer.");
            console.log("3. Billing is disabled (required for some pro models).");
        } else {
            console.log("SUCCESS! Available Models:");
            if (data.models) {
                data.models.forEach(m => {
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                        console.log(`- ${m.name.replace('models/', '')}`);
                    }
                });
            } else {
                console.log("No models returned (Empty list).");
            }
        }
    } catch (error) {
        console.error("Network/Script Error:", error);
    }
}

listModels();
