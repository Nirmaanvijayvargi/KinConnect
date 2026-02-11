import { useState, useEffect, useRef, useCallback } from 'react';
// Assuming webgazer is available globally or imported if compatible
import webgazer from 'webgazer';

export const useEyeTracker = (isActive = true) => {
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [isCalibrating, setIsCalibrating] = useState(true);
    const [paused, setPaused] = useState(false);

    // Dwell Logic
    const [hoveredElement, setHoveredElement] = useState(null);
    const dwellTimerRef = useRef(null);
    const lastHoverRef = useRef(null);

    // Blink Logic (Heuristic: Loss of tracking for 300-500ms)
    const lastDataTimeRef = useRef(Date.now());
    const blinkTimerRef = useRef(null);

    // Blink Logic
    const [lastBlinkTime, setLastBlinkTime] = useState(0);
    const blinkListenerRef = useRef(null);

    // Initialize WebGazer
    useEffect(() => {
        if (!isActive) return;

        // Lazy load blink detector
        import('../services/blinkDetector').then(({ createBlinkListener }) => {
            blinkListenerRef.current = createBlinkListener(() => {
                setLastBlinkTime(Date.now());
            });
        });

        const initGazer = async () => {
            // Clear any previous instance data
            try {
                await webgazer.setRegression('ridge')
                    .setTracker('TFFacemesh') // TFFacemesh is more accurate if available, else CLMTrackr
                    .begin();

                webgazer.showVideoPreview(true)
                    .showPredictionPoints(false)
                    .applyKalmanFilter(true);

                // Gaze Listener
                webgazer.setGazeListener((data, elapsed) => {
                    if (paused) return;

                    // Feed the Blink Listener
                    if (data) {
                        blinkListenerRef.current?.update();
                    }

                    if (data == null) {
                        // Potential Blink (Loss of tracking)
                        return;
                    }

                    // Reset Blink Timer if we have data (Eyes Open)
                    // If we had a gap of 300-500ms before this, it was a blink.
                    // This is hard to perfect without dedicated blink API.
                    // We will focus on Gaze for now.

                    const x = data.x;
                    const y = data.y;
                    setCursorPos({ x, y });

                    // Hit Testing
                    handleDwell(x, y);
                });
            } catch (e) {
                console.error("WebGazer Init Failed:", e);
            }
        };

        initGazer();

        return () => {
            try {
                webgazer.end();
            } catch (e) {
                console.warn("WebGazer Cleanup Failed (Expected):", e);
            }
        };
    }, [isActive, paused]);

    // Dwell Detection
    const handleDwell = useCallback((x, y) => {
        const el = document.elementFromPoint(x, y);

        // Check if it's an interactive tile
        const tile = el?.closest('[data-eye-interactive="true"]');

        if (tile) {
            if (lastHoverRef.current !== tile) {
                // New hover
                lastHoverRef.current = tile;
                setHoveredElement(tile);

                // Reset Timer
                if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);

                // Start Dwell Timer (1s)
                dwellTimerRef.current = setTimeout(() => {
                    // Trigger Click
                    if (lastHoverRef.current === tile) {
                        console.log("Dwell Click Triggered!", tile);
                        tile.click();
                        // Visual feedback?
                        tile.style.transform = "scale(0.95)";
                        setTimeout(() => tile.style.transform = "", 150);
                    }
                }, 1000);
            }
        } else {
            // Lost hover
            if (lastHoverRef.current) {
                lastHoverRef.current = null;
                setHoveredElement(null);
                if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
            }
        }
    }, []);

    const togglePause = () => {
        if (paused) {
            webgazer.resume();
            setPaused(false);
        } else {
            webgazer.pause();
            setPaused(true);
        }
    };

    return { cursorPos, hoveredElement, paused, togglePause, lastBlinkTime };
};
