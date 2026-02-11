import { openDB } from 'idb';

const DB_NAME = 'kinconnect-db';
const STORE_NAME = 'tiles';

const initDB = async () => {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('createdAt', 'createdAt');
            }
        },
    });
};

export const saveTile = async (label, imageFile, explicitId = undefined) => {
    const db = await initDB();
    const newTile = {
        label,
        image: imageFile,
        createdAt: new Date().toISOString(),
        clicks: 0,
        ...(explicitId ? { id: explicitId } : {})
    };
    const id = await db.add(STORE_NAME, newTile);
    return { ...newTile, id };
};

export const getAllTiles = async () => {
    const db = await initDB();
    const tiles = await db.getAllFromIndex(STORE_NAME, 'createdAt');
    // IndexedDB sorts ascending by default, reverse for newest first
    return tiles.reverse().map(tile => ({
        ...tile,
        // Create a temporary URL for the Blob to display in <img>
        imageUrl: URL.createObjectURL(tile.image)
    }));
};

export const deleteTile = async (id) => {
    const db = await initDB();
    await db.delete(STORE_NAME, id);
};
