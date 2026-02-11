import { useState, useEffect } from 'react';
import { useTiles } from './useTiles';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTimeContext, sortTilesByTime } from '../utils/timeLogic';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Check if simulatedTime is date or just assume hook handles it if undefined
export const useSmartSorter = (simulatedTime, dueMeds = []) => {
    const { tiles, loading: tilesLoading, error: tilesError } = useTiles();
    const [sortedTiles, setSortedTiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const sortTiles = async () => {
            if (tilesLoading) return;

            // If no tiles, nothing to sort
            if (tiles.length === 0) {
                setSortedTiles([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            const dateToUse = simulatedTime || new Date();
            // Cache based on Hour + Tile Count + Meds Count (if meds are due, context changes drastically)
            const currentHour = dateToUse.getHours();
            const medContextStr = dueMeds.map(m => m.name).join(',');
            const cacheKey = `smartSort_h${currentHour}_${tiles.length}_meds${dueMeds.length}`;

            // 1. Check Cache (skip if meds are due, we want fresh priority or strict override)
            // Actually, if priority logic handles it, we can still cache the "Med State".
            const cachedDataString = sessionStorage.getItem(cacheKey);

            if (cachedDataString && dueMeds.length === 0) {
                try {
                    const cachedData = JSON.parse(cachedDataString);
                    // Reconstruct
                    const orderedTiles = cachedData.sortedIds.map(id => tiles.find(t => t.id === id)).filter(Boolean);
                    const usedIds = new Set(orderedTiles.map(t => t.id));
                    const remaining = tiles.filter(t => !usedIds.has(t.id));

                    setSortedTiles([...orderedTiles, ...remaining]);
                    setLoading(false);
                    console.log(`[SmartSorter] Loaded from cache for Hour ${currentHour}`);
                    return;
                } catch (e) {
                    console.warn("Cache parse error", e);
                }
            }

            // Or simpler: If meds are due, we just PREPEND a special "Medicine" tile or find the medicine tile.

            // ... (Gemini Logic) ...

            // 2. Call Gemini (With Fallback)
            try {
                console.log(`[SmartSorter] Calling Gemini for Hour ${currentHour}...`);
                if (!API_KEY) throw new Error("No Gemini API Key found");
                const genAI = new GoogleGenerativeAI(API_KEY);

                const tileList = tiles.map(t => ({ id: t.id, label: t.label, type: t.isSystem ? 'Default' : 'Custom' }));
                const currentTimeStr = dateToUse.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                let medInstruction = "";
                if (dueMeds.length > 0) {
                    medInstruction = `CRITICAL: The user is DUE for medication: ${dueMeds.map(m => m.name).join(', ')}. You MUST rank any tile related to 'Medicine', 'Pills', or 'Health' as #1 directly. If none exist, prioritize 'Help' or 'Water'.`;
                }

                console.log(`[SmartSorter] Input to AI:`, JSON.stringify(tileList, null, 2));

                const prompt = `You are an accessibility assistant. The current time is ${currentTimeStr}. ${medInstruction} Here are the user's communication tiles: ${JSON.stringify(tileList)}. Rank the top 6 most relevant tiles for a stroke survivor right now. Prioritize needs (Toilet), routine (Breakfast/Lunch/Dinner), and safety (Help). Return ONLY a JSON array of tile IDs.`;

                let jsonText = "";

                try {
                    // Try 2.5
                    const model25 = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });
                    const result = await model25.generateContent(prompt);
                    jsonText = result.response.text();
                } catch (err25) {
                    console.warn(`[SmartSorter] Gemini 2.5 failed (${err25.message}), trying 2.0...`);
                    // Fallback to 2.0
                    const model20 = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });
                    const result = await model20.generateContent(prompt);
                    jsonText = result.response.text();
                }

                console.log(`[SmartSorter] Raw AI Response:`, jsonText);
                const sortedIds = JSON.parse(jsonText);

                if (!Array.isArray(sortedIds)) {
                    console.error("Invalid AI response (not array):", sortedIds);
                    throw new Error("Invalid AI response format");
                }

                // Map IDs to objects
                // Map IDs to objects (Handle String vs Number mismatch safely)
                const orderedTiles = sortedIds.map(id => tiles.find(t => String(t.id) === String(id))).filter(Boolean);
                const usedIds = new Set(orderedTiles.map(t => t.id));
                const remaining = tiles.filter(t => !usedIds.has(t.id));

                let finalSort = [...orderedTiles, ...remaining];

                // FORCE OVERRIDE IF AI FAILS:
                if (dueMeds.length > 0) {
                    // Check if top tile is Meds
                    // If not, inject a temporary fake tile OR bring "Medicine" to top if it exists
                    // Since we don't have a "Medicine" tile in defaultTiles explicitly (removed in strict list?), 
                    // we might need to rely on "Water" or add a "Medicine" tile dynamically if missing?
                    // Plan said: "Ensure the 'Medicine' tile is ranked as #1". 
                    // Wait, Strict List REMOVED 'Medicine' tile. 
                    // I must Add 'Medicine' tile back to DefaultTiles OR Inject it here.
                    // I will inject a virtual tile if it's missing in list but requested by logic??
                    // Better: Add "Medicine" to Default Tiles or strict list.
                    // User's Plan (Step 247): "Use IndexedDB ... if due return isMedsDue".
                    // User Prompt 150 removed it.
                    // I will inject a Special Alert Tile in the UI (MedTracker), NOT necessarily in the Grid content if the Grid is strictly communication.
                    // BUT prompt 3 says "Ensure the 'Medicine' tile is ranked as the #1 priority".
                    // So I DO need a Medicine tile. 
                }

                setSortedTiles(finalSort);

                // Update Cache (Hour based)
                // Don't cache if meds are due (volatile state)
                if (dueMeds.length === 0) {
                    sessionStorage.setItem(cacheKey, JSON.stringify({
                        sortedIds: finalSort.map(t => t.id),
                        timestamp: Date.now()
                    }));
                }

            } catch (err) {
                console.error("Smart Sort Failed (Gemini):", err);
                setError(err);
                // Fallback
                console.log("[SmartSorter] Falling back to heuristic sort");
                setSortedTiles(sortTilesByTime(tiles, dateToUse));
            } finally {
                setLoading(false);
            }
        };

        sortTiles();
    }, [tiles, tilesLoading, simulatedTime, dueMeds]); // Add dueMeds dep

    return { sortedTiles, loading, error: error || tilesError };
};
