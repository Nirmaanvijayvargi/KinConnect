
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("⚠️ Supabase URL or Key is missing! Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- TILES Helper Functions ---

/**
 * Fetch all tiles from the database.
 * @returns {Promise<Array>} List of tiles
 */
export const fetchTiles = async () => {
    const { data, error } = await supabase
        .from('tiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching tiles:", error);
        return { data: [], error };
    }
    return { data, error: null };
};

/**
 * Add a new tile to the database.
 * @param {Object} tileData - { label, image_url, category }
 */
export const addTile = async (tileData) => {
    const { data, error } = await supabase
        .from('tiles')
        .insert([{
            ...tileData,
            usage_count: 0,
            created_at: new Date().toISOString()
        }])
        .select();

    if (error) throw error;
    return data[0];
};

/**
 * Seed the database with default tiles if empty.
 */
export const seedDatabase = async () => {
    // 1. Check if empty
    const { count, error } = await supabase
        .from('tiles')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error("Error checking DB count:", error);
        return;
    }

    if (count === 0) {
        console.log("Database empty. Seeding default tiles...");
        const { DEFAULT_TILES } = await import('../constants/defaultTiles');

        const payload = DEFAULT_TILES.map(t => ({
            label: t.label,
            emoji: t.emoji,
            category: t.category,
            is_system: true,
            image_url: null,
            created_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
            .from('tiles')
            .insert(payload);

        if (insertError) console.error("Seeding failed:", insertError);
        else console.log("Seeding complete!");
    }
};

/**
 * Delete a tile by ID.
 * @param {string|number} id 
 */
export const deleteTile = async (id) => {
    // Check if system tile first
    const { data: tile } = await supabase
        .from('tiles')
        .select('is_system')
        .eq('id', id)
        .single();

    if (tile?.is_system) {
        throw new Error("Cannot delete system tiles.");
    }

    const { error } = await supabase
        .from('tiles')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

/**
 * Subscribe to changes in the tiles table.
 * @param {Function} onUpdate - Callback function receiving the updated payload or generic trigger
 * @returns {Object} Subscription object (call .unsubscribe() to stop)
 */
export const subscribeToTiles = (onUpdate) => {
    return supabase
        .channel('tiles-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tiles' }, (payload) => {
            console.log('Realtime change received!', payload);
            onUpdate();
        })
        .subscribe();
};

// --- IMAGES / STORAGE ---

/**
 * Upload an image file to Supabase Storage.
 * @param {File} file 
 * @returns {Promise<string>} Public URL of the uploaded image
 */
export const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('communication-tiles')
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data } = supabase.storage
        .from('communication-tiles')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

// --- HEALTH LOGS ---

/**
 * Log health vitals to the database.
 * @param {Object} vitals - { bpm, spo2, systolic, diastolic }
 */
export const logHealthData = async (vitals) => {
    const { error } = await supabase
        .from('health_logs')
        .insert([{
            ...vitals,
            timestamp: new Date().toISOString()
        }]);

    if (error) console.error("Error logging health data:", error);
};
