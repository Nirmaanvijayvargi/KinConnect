// Basic heuristic blink detector
// In a real production app with full WebGazer access, we might use webgazer.setBlinkListener
// But for stability and simplicity without deep training, we use "Loss of Eye Tracking" as a blink proxy.

export const createBlinkListener = (onBlink) => {
    let lastEyeDataTime = Date.now();
    let blinkTimer = null;
    const BLINK_MIN_DURATION = 150; // ms
    const BLINK_MAX_DURATION = 600; // ms

    return {
        // Called whenever we get valid gaze data (Eyes likely open)
        update: () => {
            const now = Date.now();
            const timeSinceLastData = now - lastEyeDataTime;

            // If we had a gap that matches blink duration
            if (timeSinceLastData > BLINK_MIN_DURATION && timeSinceLastData < BLINK_MAX_DURATION) {
                // Determine if it was a blink
                if (onBlink) {
                    console.log("[BlinkDetector] Blink Detected!", timeSinceLastData + "ms");
                    onBlink();
                }
            }

            lastEyeDataTime = now;
        },

        // Reset if needed
        reset: () => {
            lastEyeDataTime = Date.now();
        }
    };
};
