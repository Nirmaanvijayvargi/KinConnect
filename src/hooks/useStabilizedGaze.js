import { useState, useEffect, useRef } from 'react';

export const useStabilizedGaze = (rawCursorPos, lastBlinkTime) => {
    // 1. Smoothing State
    const [smoothedPos, setSmoothedPos] = useState({ x: 0, y: 0 });
    const historyRef = useRef([]);
    const HISTORY_SIZE = 10;

    // 2. Focus State
    const [focusedElementId, setFocusedElementId] = useState(null);
    const [dwellProgress, setDwellProgress] = useState(0);

    // Internal Refs for Logic
    const lastFocusRef = useRef(null);
    const offTargetStartTimeRef = useRef(0);
    const dwellStartTimeRef = useRef(0);
    const progressFrameRef = useRef(null);

    // Constants
    const STICKY_BUFFER_MS = 800; // Increased from 300ms for Head Tracking Stability
    const DWELL_TIME_MS = 1200; // Reduced from 1500ms to make clicking easier

    // --- A. Smoothing Engine ---
    useEffect(() => {
        if (!rawCursorPos) return;

        // Add new point
        historyRef.current.push(rawCursorPos);
        if (historyRef.current.length > HISTORY_SIZE) {
            historyRef.current.shift();
        }

        // Calculate Average
        const sum = historyRef.current.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
        const count = historyRef.current.length;
        const avgX = sum.x / count;
        const avgY = sum.y / count;

        setSmoothedPos({ x: avgX, y: avgY });

    }, [rawCursorPos]); // Runs on every raw frame update

    // --- B. Focus & Stickiness Engine ---
    useEffect(() => {
        // Hit Test using SMOOTHED position
        const el = document.elementFromPoint(smoothedPos.x, smoothedPos.y);
        const gazeTarget = el?.closest('[data-gaze-id]');
        let targetId = gazeTarget ? gazeTarget.getAttribute('data-gaze-id') : null;

        // --- Discrete Snapping Logic ---
        const SNAP_DISTANCE = 60;
        let snapped = false;

        // If we aren't directly over an element, check distance to all interactables
        if (!targetId) {
            const allTargets = document.querySelectorAll('[data-gaze-id]');
            let closestDist = Infinity;
            let closestId = null;
            let closestRect = null;

            allTargets.forEach(t => {
                const rect = t.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Euclidean Distance
                const dist = Math.sqrt(
                    Math.pow(smoothedPos.x - centerX, 2) +
                    Math.pow(smoothedPos.y - centerY, 2)
                );

                if (dist < closestDist) {
                    closestDist = dist;
                    closestId = t.getAttribute('data-gaze-id');
                    closestRect = { x: centerX, y: centerY };
                }
            });

            if (closestDist < SNAP_DISTANCE && closestId) {
                // Snap!
                targetId = closestId;
                snapped = true;
                // Visually snap the cursor for better feedback (optional, but good UX)
                // Note: We don't update smoothedPos here to avoid feedback loops in the smoothing engine,
                // but the "Focus" state will update.
            }
        }

        const currentFocus = lastFocusRef.current; // The ID we are currently "stuck" to

        if (targetId) {
            // Looking at a valid target (or snapped to one)
            if (targetId !== currentFocus) {
                // We are looking at a NEW target
                switchFocus(targetId);
            } else {
                // Looking at the SAME target.
                // Reset off-target timer if we were drifting.
                offTargetStartTimeRef.current = 0;
            }
        } else {
            // Looking at NOTHING (Gap)
            if (currentFocus) {
                // We HAVE a focus, but look at nothing.
                // Check buffer.
                if (offTargetStartTimeRef.current === 0) {
                    // Just started looking away
                    offTargetStartTimeRef.current = Date.now();
                } else {
                    const elapsed = Date.now() - offTargetStartTimeRef.current;
                    if (elapsed > STICKY_BUFFER_MS) {
                        // Buffer exceeded. Drop focus.
                        switchFocus(null);
                    }
                }
            }
        }

    }, [smoothedPos]); // Runs on smoothed updates

    // --- C. Dwell Engine (Animation Frame) ---
    useEffect(() => {
        const updateDwell = () => {
            if (lastFocusRef.current) {
                const elapsed = Date.now() - dwellStartTimeRef.current;
                const progress = Math.min((elapsed / DWELL_TIME_MS) * 100, 100);
                setDwellProgress(progress);

                if (progress >= 100) {
                    // Trigger Click
                    triggerClick(lastFocusRef.current);
                    dwellStartTimeRef.current = Date.now(); // Reset? Or hold?
                }
            } else {
                setDwellProgress(0);
            }
            progressFrameRef.current = requestAnimationFrame(updateDwell);
        };

        progressFrameRef.current = requestAnimationFrame(updateDwell);
        return () => cancelAnimationFrame(progressFrameRef.current);
    }, []); // Runs constantly loop

    // --- D. Blink Trigger ---
    useEffect(() => {
        if (lastBlinkTime > 0 && focusedElementId) {
            console.log("[StabilizedGaze] Blink Click!", focusedElementId);
            triggerClick(focusedElementId);
        }
    }, [lastBlinkTime, focusedElementId]);

    const switchFocus = (newId) => {
        lastFocusRef.current = newId;
        setFocusedElementId(newId);
        offTargetStartTimeRef.current = 0;
        dwellStartTimeRef.current = Date.now();
        setDwellProgress(0);
    };

    const triggerClick = (targetId) => {
        const targetEl = document.querySelector(`[data-gaze-id="${targetId}"]`);
        if (targetEl) {
            console.log("[StabilizedGaze] Auto-Click:", targetId);
            targetEl.click();
            // Reset dwell to prevent machine-gun clicks
            dwellStartTimeRef.current = Date.now();
            setDwellProgress(0);
        }
    };

    return { smoothedPos, focusedElementId, dwellProgress };
};
