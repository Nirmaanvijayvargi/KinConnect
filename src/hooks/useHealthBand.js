import { useState, useEffect, useRef } from 'react';
import { useAccessibilityAudio } from './useAccessibilityAudio';

export const useHealthBand = () => {
    const [vitals, setVitals] = useState({
        heartRate: 72,
        spO2: 98,
        bpSys: 120,
        bpDia: 80
    });
    const [mode, setMode] = useState('auto'); // 'auto' | 'manual'
    const [isUnstable, setIsUnstable] = useState(false);

    const { playEmergencyAlert } = useAccessibilityAudio();
    const lastAlertTime = useRef(0);

    // Thresholds
    const THRESHOLDS = {
        HR_MIN: 50,
        HR_MAX: 110,
        SPO2_MIN: 92,
        BP_SYS_MAX: 140,
        BP_DIA_MAX: 90
    };

    // Automatic Simulation
    useEffect(() => {
        if (mode !== 'auto') return;

        const interval = setInterval(() => {
            setVitals(prev => {
                // Jitter logic: +/- small random amount
                const jitter = (base, range) => Math.floor(base + (Math.random() * range * 2 - range));

                return {
                    heartRate: jitter(prev.heartRate > 100 || prev.heartRate < 60 ? 72 : prev.heartRate, 2), // Return to baseline if simulated spike is over
                    spO2: Math.min(100, jitter(98, 1)),
                    bpSys: jitter(120, 3),
                    bpDia: jitter(80, 2)
                };
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [mode]);

    // Check Vitals & Trigger Alerts
    useEffect(() => {
        const { heartRate, spO2, bpSys, bpDia } = vitals;

        const unstable =
            heartRate < THRESHOLDS.HR_MIN ||
            heartRate > THRESHOLDS.HR_MAX ||
            spO2 < THRESHOLDS.SPO2_MIN ||
            bpSys > THRESHOLDS.BP_SYS_MAX ||
            bpDia > THRESHOLDS.BP_DIA_MAX;

        setIsUnstable(unstable);

        if (unstable) {
            const now = Date.now();
            // Prevent spamming the alert (limit 1 per 5 seconds)
            if (now - lastAlertTime.current > 5000) {
                playEmergencyAlert();
                lastAlertTime.current = now;
            }
        }
    }, [vitals, playEmergencyAlert, THRESHOLDS]);

    // Manual Override
    const setManualVitals = (newVitals) => {
        setMode('manual');
        setVitals(prev => ({ ...prev, ...newVitals }));
    };

    const resumeAuto = () => {
        setMode('auto');
        setVitals({ heartRate: 72, spO2: 98, bpSys: 120, bpDia: 80 }); // Reset to baseline
    };

    return { vitals, isUnstable, mode, setManualVitals, resumeAuto };
};
