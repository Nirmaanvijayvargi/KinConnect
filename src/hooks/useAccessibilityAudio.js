import { useRef, useEffect } from 'react';

export const useAccessibilityAudio = () => {
    const audioContextRef = useRef(null);

    useEffect(() => {
        // Initialize AudioContext lazily
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioContextRef.current = new AudioContext();
        }

        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(console.error);
            }
        };
    }, []);

    const ensureContextResumed = async () => {
        const ctx = audioContextRef.current;
        if (!ctx) return;
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }
    };

    const playTone = (frequency, type, duration, startTime = 0, gainValue = 0.1) => {
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

        gainNode.gain.setValueAtTime(gainValue, ctx.currentTime + startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime + startTime);
        oscillator.stop(ctx.currentTime + startTime + duration);
    };

    const playActionClick = async () => {
        await ensureContextResumed();
        // Low-frequency 'thud' (150Hz)
        playTone(150, 'sine', 0.1, 0, 0.3);
    };

    const playSuccessChime = async () => {
        await ensureContextResumed();
        // Ascending 2-tone (440Hz -> 660Hz)
        playTone(440, 'sine', 0.3, 0, 0.2);
        playTone(660, 'sine', 0.4, 0.2, 0.2); // Starts after 0.2s
    };

    const playEmergencyAlert = async () => {
        await ensureContextResumed();
        // High-pitched, piercing beep (880Hz), repeats 3 times
        const now = 0;
        const beepDuration = 0.2;
        const gap = 0.1;

        for (let i = 0; i < 3; i++) {
            playTone(880, 'square', beepDuration, i * (beepDuration + gap), 0.3);
        }
    };

    return { playActionClick, playSuccessChime, playEmergencyAlert };
};
