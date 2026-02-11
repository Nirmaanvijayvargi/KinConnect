import { useState, useEffect, useRef } from 'react';

export const useGazeFocus = (cursorPos, onBlink) => {
    const [focusedElementId, setFocusedElementId] = useState(null);
    const [dwellProgress, setDwellProgress] = useState(0); // 0 to 100

    // Internal refs
    const lastFocusRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const startTimeRef = useRef(0);
    const DWELL_TIME_MS = 1500;

    useEffect(() => {
        if (!cursorPos) return;

        // Hit Test
        // We look for elements with 'data-gaze-id'
        const el = document.elementFromPoint(cursorPos.x, cursorPos.y);
        const gazeTarget = el?.closest('[data-gaze-id]');
        const targetId = gazeTarget ? gazeTarget.getAttribute('data-gaze-id') : null;

        if (targetId) {
            // We are looking at a target
            if (lastFocusRef.current !== targetId) {
                // New Target Entered
                setFocusedElementId(targetId);
                lastFocusRef.current = targetId;

                // Start Dwell
                startDwell(targetId);
            }
        } else {
            // We are looking at nothing focused
            if (lastFocusRef.current) {
                // Target Lost
                setFocusedElementId(null);
                lastFocusRef.current = null;
                resetDwell();
            }
        }

    }, [cursorPos.x, cursorPos.y]);

    const startDwell = (targetId) => {
        resetDwell();
        startTimeRef.current = Date.now();

        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const progress = Math.min((elapsed / DWELL_TIME_MS) * 100, 100);

            setDwellProgress(progress);

            if (progress >= 100) {
                // Dwell Complete -> Trigger Click!
                triggerClick(targetId);
                resetDwell(); // Optional: reset after click or hold?
            }
        }, 50);
    };

    const resetDwell = () => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setDwellProgress(0);
    };

    const triggerClick = (targetId) => {
        const el = document.querySelector(`[data-gaze-id="${targetId}"]`);
        if (el) {
            console.log("[GazeFocus] Triggering Click on", targetId);
            el.click();
            // Provide visual feedback/audio here if needed
        }
    };

    // Integrate Blink
    // If we receive a blink signal (passed from parent or context), and we have a focus, click immediately.
    useEffect(() => {
        if (onBlink && focusedElementId) {
            // Blink Detected while focused -> Snap Click!
            triggerClick(lastFocusRef.current);
        }
    }, [onBlink, focusedElementId]);

    return { focusedElementId, dwellProgress };
};
