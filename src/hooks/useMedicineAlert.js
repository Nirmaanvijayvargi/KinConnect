import { useState, useEffect } from 'react';
import { getDueMeds, seedDemoInfo } from '../services/medicineService';

export const useMedicineAlert = (simulatedTime) => {
    const [dueMeds, setDueMeds] = useState([]);
    const [loading, setLoading] = useState(true);

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refresh = () => setRefreshTrigger(prev => prev + 1);

    useEffect(() => {
        // Init DB on mount
        seedDemoInfo();

        const checkMeds = async () => {
            try {
                const meds = await getDueMeds(simulatedTime);
                setDueMeds(meds);
            } catch (error) {
                console.error("Med Check Failed:", error);
            } finally {
                setLoading(false);
            }
        };

        checkMeds();

        // Poll every minute if using real time, or depend on simulatedTime prop change
        // Since we depend on simulatedTime, it will re-run automatically when time changes.
        // We can add a small interval just in case minute changes without simulatedTime changing (real time flow).

        const interval = setInterval(checkMeds, 30000);
        return () => clearInterval(interval);

    }, [simulatedTime, refreshTrigger]);

    return { dueMeds, isDue: dueMeds.length > 0, loading, refresh };
};
