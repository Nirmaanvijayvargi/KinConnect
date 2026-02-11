import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBG34pYqvOvM2XZ-r5NOZ68N095LCdkcDc"; // User provided key

async function listModels() {
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // Note: listModels might not be exposed directly in the simplified SDK client on some versions, 
        // but let's try to infer it or just try a direct REST call if SDK fails.
        // Actually, for debugging, a simple fetch is more reliable to see raw response.
        console.log("Checking API Key...");

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
        } else {
            console.log("Available Models:");
            console.log(JSON.stringify(data.models, null, 2));
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
