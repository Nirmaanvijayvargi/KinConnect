/**
 * Sorts tiles based on the current time of day.
 * This is a simple heuristic: 
 * - Morning (6-11): Breakfast, Meds, Clothes
 * - Afternoon (12-17): Lunch, Walk, Water
 * - Evening (18-22): Dinner, TV, Bed
 * 
 * In a real app, this would be based on historical usage data per user.
 * For now, we'll assign a "timeScore" to tiles if their labels match keywords.
 */

export const getTimeContext = (date = new Date()) => {
    const hour = date.getHours();
    if (hour >= 5 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 14) return 'lunch';
    if (hour >= 14 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 21) return 'dinner';
    return 'night';
};

export const sortTilesByTime = (tiles, date = new Date()) => {
    const context = getTimeContext(date);

    // Define keywords for contexts
    const keywords = {
        morning: ['breakfast', 'coffee', 'tea', 'meds', 'pills', 'shower', 'dress', 'toilet'],
        lunch: ['lunch', 'sandwich', 'hungry', 'water', 'living room'],
        afternoon: ['walk', 'snack', 'water', 'tea', 'living room'],
        dinner: ['dinner', 'hungry', 'food', 'bedroom'],
        night: ['bed', 'sleep', 'bedroom', 'toilet', 'bathroom']
    };

    const currentKeywords = keywords[context] || [];

    return [...tiles].sort((a, b) => {
        const aLabel = a.label?.toLowerCase() || "";
        const bLabel = b.label?.toLowerCase() || "";

        const aScore = currentKeywords.some(k => aLabel.includes(k)) ? 1 : 0;
        const bScore = currentKeywords.some(k => bLabel.includes(k)) ? 1 : 0;

        return bScore - aScore; // Higher score first
    });
};
