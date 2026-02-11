import { useState, useEffect } from 'react';
import { fetchTiles, addTile as addTileToDb, deleteTile as deleteTileFromDb, subscribeToTiles, seedDatabase } from '../lib/supabase';

export const useTiles = () => {
    const [tiles, setTiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refreshTiles = async () => {
        setLoading(true);
        setError(null);

        try {
            // fetchTiles returns { data, error }
            let { data, error: fetchError } = await fetchTiles();

            if (fetchError) throw fetchError;

            // Auto-Seed if empty
            if (!data || data.length === 0) {
                console.log("No tiles found. Attempting to seed...");
                await seedDatabase();
                // Fetch again
                const res = await fetchTiles();
                if (res.error) throw res.error;
                data = res.data;
            }

            // Map DB snake_case to frontend camelCase
            const mappedData = data ? data.map(t => ({
                ...t,
                imageUrl: t.image_url // Maintain compatibility
            })) : [];

            setTiles(mappedData);
        } catch (err) {
            console.error("Error fetching tiles:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial Fetch
        refreshTiles();

        // Realtime Subscription
        const subscription = subscribeToTiles(() => {
            refreshTiles();
        });

        return () => {
            // Cleanup subscription
            subscription.unsubscribe();
        };
    }, []);

    const addTile = async (label, imageUrl, category = 'Custom') => {
        try {
            await addTileToDb({ label, image_url: imageUrl, category });
            // Refresh handled by subscription, but we can optimistically update if desired.
            // For now, let's rely on the Realtime trigger to ensure consistency.
        } catch (error) {
            console.error("Failed to add tile:", error);
            throw error;
        }
    };

    const removeTile = async (id) => {
        try {
            await deleteTileFromDb(id);
        } catch (error) {
            console.error("Failed to delete tile:", error);
            throw error;
        }
    };

    return { tiles, loading, error, addTile, removeTile, refreshTiles };
};
