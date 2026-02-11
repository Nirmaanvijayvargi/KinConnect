import { openDB } from 'idb';
import { DEFAULT_TILES } from '../constants/defaultTiles';
import { saveTile } from './localDatabase';

const DB_NAME = 'kinconnect-db';
const STORE_NAME = 'tiles';

// Helper to convert Emoji to Blob (Image)
const emojiToBlob = async (emoji) => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#000000'; // Black background as per design
    ctx.fillRect(0, 0, 200, 200);

    // Emoji
    ctx.font = '100px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(emoji, 100, 100);

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/png');
    });
};

export const initializeDatabase = async () => {
    try {
        const db = await openDB(DB_NAME, 1);

        console.log("Preparing default assets...");
        // Pre-generate blobs to avoid awaiting inside the DB transaction (which causes auto-commit)
        const defaultTilePayloads = await Promise.all(DEFAULT_TILES.map(async (tile) => {
            const blob = await emojiToBlob(tile.emoji);
            return { ...tile, imageBlob: blob };
        }));

        console.log("Checking for duplicates and missing tiles...");

        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        const existingTiles = await store.getAll();
        const labelMap = new Map();

        // 1. Identify Duplicates
        for (const tile of existingTiles) {
            if (tile.label) {
                if (!labelMap.has(tile.label)) {
                    labelMap.set(tile.label, []);
                }
                labelMap.get(tile.label).push(tile);
            }
        }

        // 2. Remove Duplicates
        for (const [label, tiles] of labelMap) {
            if (tiles.length > 1) {
                console.log(`Duplicate found for "${label}". Cleaning up...`);
                // Use explicit System flag to prefer if possible, else low ID
                // Simple sort: ID
                tiles.sort((a, b) => a.id - b.id);
                const toDelete = tiles.slice(1);
                for (const trash of toDelete) {
                    await store.delete(trash.id);
                }
            }
        }

        // 3. Add Missing Defaults
        // Refresh the set of what we have after cleanup
        const currentLabels = new Set(labelMap.keys());

        for (const payload of defaultTilePayloads) {
            // Case insensitive check
            const exists = Array.from(currentLabels).some(l => l.toLowerCase() === payload.label.toLowerCase());

            if (!exists) {
                console.log(`Adding strictly missing tile: ${payload.label}`);
                const newTile = {
                    id: payload.id || undefined, // Use explicit ID from defaultTiles if available
                    label: payload.label,
                    image: payload.imageBlob, // Use pre-generated blob
                    createdAt: new Date().toISOString(),
                    category: payload.category, // Ensure category is saved
                    clicks: 0,
                    isSystem: true
                };
                await store.add(newTile);
            }
        }

        await tx.done;
        console.log("Initialization & Deduplication complete.");
        return true;
    } catch (error) {
        console.error("DB Init Failed:", error);
        return false;
    }
};

export const resetDatabase = async () => {
    try {
        console.log("Resetting Database...");
        // Clear Application Cache for Smart Sorter
        sessionStorage.clear();
        console.log("Session cache cleared.");

        const db = await openDB(DB_NAME, 1);
        await db.clear(STORE_NAME);
        console.log("Database cleared.");
        await initializeDatabase();
        console.log("Database re-seeded.");
        return true;
    } catch (error) {
        console.error("Reset Failed:", error);
        return false;
    }
};
