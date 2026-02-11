import { useEffect, useRef } from 'react';
import { notification } from 'antd';

export const useInactivity = (timeoutMs = 1000 * 60 * 60 * 2) => { // Default 2 hours
    const timerRef = useRef(null);

    const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            notification.warning({
                message: 'Are you still there?',
                description: 'Touch the screen to wake up KinConnect.',
                duration: 0, // Stay until clicked
                style: { backgroundColor: '#fff1f0', border: '1px solid #ffa39e' }
            });
        }, timeoutMs);
    };

    useEffect(() => {
        // Events to listen for
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        const handleActivity = () => {
            resetTimer();
        };

        // Attach listeners
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Initialize
        resetTimer();

        // Cleanup
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [timeoutMs]);
};
