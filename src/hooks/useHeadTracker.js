import { useState, useEffect, useRef } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

export const useHeadTracker = (isActive = true) => {
    const [headCursor, setHeadCursor] = useState(null);
    const [isBlinking, setIsBlinking] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debugStatus, setDebugStatus] = useState("Initializing...");

    const faceLandmarkerRef = useRef(null);
    const videoRef = useRef(null);
    const requestRef = useRef(null);
    const lastVideoTimeRef = useRef(-1);
    const lastProcessTimeRef = useRef(Date.now());
    const watchdogRef = useRef(null);

    // Stability & History
    const historyRef = useRef([]);
    const HISTORY_SIZE = 25;
    const neutralRef = useRef({ yaw: 0, pitch: 0 });
    const calibratedRef = useRef(false);

    useEffect(() => {
        if (!isActive) return;

        const initMediaPipe = async () => {
            console.log("🚀 Init MediaPipe...");
            try {
                // 1. Explicitly versioned WASM to prevent 'NULL' errors
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
                );

                // 2. Load model with CPU fallback for stability
                faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "CPU" // FORCE CPU: Much more stable for live demos than GPU
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1
                });

                console.log("✅ MediaPipe Loaded (CPU Mode)");
                startWebcam();
            } catch (err) {
                console.error("🛑 MediaPipe Init Failed:", err);
                setError("Failed to load tracking model.");
            }
        };

        initMediaPipe();

        // 3. Watchdog: Restart if stuck for > 5s
        watchdogRef.current = setInterval(() => {
            if (Date.now() - lastProcessTimeRef.current > 5000 && isActive && !loading) {
                console.warn("⚠️ Head Tracker Frozen! Restarting...");
                setDebugStatus("Frozen! Restarting...");
                stopWebcam();
                startWebcam();
                lastProcessTimeRef.current = Date.now(); // Reset timer to prevent double-trigger
            }
        }, 2000);

        return () => {
            stopWebcam();
            if (watchdogRef.current) clearInterval(watchdogRef.current);
            if (videoRef.current && document.body.contains(videoRef.current)) {
                document.body.removeChild(videoRef.current);
            }
        };
    }, [isActive]);

    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            console.log("✅ Webcam Stream Acquired");
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.playsInline = true;
            // Video must be in DOM to work reliably, but hidden
            video.style.opacity = "0";
            video.style.position = "fixed";
            video.style.bottom = "0";
            video.style.right = "0";
            video.style.pointerEvents = "none";
            video.style.zIndex = "-1";
            document.body.appendChild(video);
            videoRef.current = video;

            video.onloadeddata = () => {
                console.log("✅ Webcam Data Loaded - Starting Prediction");
                video.play().catch(e => console.error("Video Play Error:", e));
                setLoading(false);
                predictWebcam();
            };
        } catch (err) {
            console.error("🛑 Webcam Error:", err);
            setError("Webcam access denied.");
        }
    };

    const predictWebcam = () => {
        if (!videoRef.current || !faceLandmarkerRef.current) return;

        // CRITICAL FIX: MediaPipe crashes if video has 0 dimensions
        if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
            console.warn("Waiting for video dimensions...", videoRef.current.videoWidth, videoRef.current.videoHeight);
            requestRef.current = requestAnimationFrame(predictWebcam);
            return;
        }

        const startTimeMs = performance.now();

        // DEBUG: Trace Loop
        // console.log("Loop:", videoRef.current.currentTime, lastVideoTimeRef.current, videoRef.current.readyState);

        if (lastVideoTimeRef.current !== videoRef.current.currentTime) {
            lastVideoTimeRef.current = videoRef.current.currentTime;

            try {
                const results = faceLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
                if (results.faceLandmarks?.[0]) {
                    // console.log("✅ Face Detected!");
                    setDebugStatus("FACE FOUND ✅");
                    processLandmarks(results.faceLandmarks[0], results.faceBlendshapes[0]);
                } else {
                    // console.log("❌ No Face (Landmarks Empty)", videoRef.current.readyState);
                    setDebugStatus("Searching for Face... ❌");
                }
            } catch (e) {
                console.warn("Detection frame skipped", e);
                setDebugStatus("Frame Error ⚠️");
            }
        }
        requestRef.current = requestAnimationFrame(predictWebcam);
    };

    const processLandmarks = (landmarks, blendshapes) => {
        const nose = landmarks[1];
        const leftEar = landmarks[234];
        const rightEar = landmarks[454];

        const midEarX = (leftEar.x + rightEar.x) / 2;
        const midEarY = (leftEar.y + rightEar.y) / 2;

        const yaw = (nose.x - midEarX) * 100;
        const pitch = (nose.y - midEarY) * 100;

        if (!calibratedRef.current) {
            console.log("🎯 Calibrated Neutral:", { yaw, pitch });
            neutralRef.current = { yaw, pitch };
            calibratedRef.current = true;
        }

        const activeYaw = yaw - neutralRef.current.yaw;
        const activePitch = pitch - neutralRef.current.pitch;

        // "Snapping" Sensitivity
        const SENSITIVITY = 25;
        const targetX = (window.innerWidth / 2) + (activeYaw * SENSITIVITY);
        const targetY = (window.innerHeight / 2) + (activePitch * SENSITIVITY);

        historyRef.current.push({ x: targetX, y: targetY });
        if (historyRef.current.length > HISTORY_SIZE) historyRef.current.shift();

        const avg = historyRef.current.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
        const smoothX = avg.x / historyRef.current.length;
        const smoothY = avg.y / historyRef.current.length;

        if (!isNaN(smoothX) && !isNaN(smoothY)) {
            setHeadCursor({
                x: Math.max(0, Math.min(window.innerWidth, smoothX)),
                y: Math.max(0, Math.min(window.innerHeight, smoothY))
            });
            // Update watchdog timestamp
            lastProcessTimeRef.current = Date.now();
        }

        // Select (Blink) Logic
        if (blendshapes?.categories) {
            const bL = blendshapes.categories.find(c => c.categoryName === 'eyeBlinkLeft')?.score || 0;
            const bR = blendshapes.categories.find(c => c.categoryName === 'eyeBlinkRight')?.score || 0;
            setIsBlinking(bL > 0.4 && bR > 0.4);
        }
    };

    const stopWebcam = () => {
        console.log("🛑 Stopping Webcam");
        videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    return { headCursor, isBlinking, loading, error, debugStatus };
};