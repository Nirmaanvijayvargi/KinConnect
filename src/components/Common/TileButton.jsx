import React, { useState, useRef } from 'react';
import { Typography } from 'antd';
import { useSpeech } from '../../hooks/useSpeech';
import { useAccessibilityAudio } from '../../hooks/useAccessibilityAudio';

const { Text } = Typography;

const TileButton = (props) => {
    const { label, imageUrl, emoji, onClick, style } = props;
    const [active, setActive] = useState(false);
    const { speak } = useSpeech();
    const { playActionClick, playEmergencyAlert } = useAccessibilityAudio();

    // Long Press Refs
    const timerRef = useRef(null);
    const isLongPress = useRef(false);

    const handleStart = () => {
        isLongPress.current = false;
        setActive(true);

        if (label === 'Help' || label === 'SOS') {
            timerRef.current = setTimeout(() => {
                isLongPress.current = true;
                playEmergencyAlert();
                // Visual feedback for long press?
                setActive(false);
            }, 1000); // 1 second long press
        }
    };

    const handleEnd = (e) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Slight delay to finish visual animation if needed
        setTimeout(() => setActive(false), 200);

        // If it was NOT a long press, trigger normal action
        if (!isLongPress.current) {
            // Prevent default if it's a touch event to distinguish from scroll?
            // Better to rely on onClick usually, but we are mixing events.
            // Let's rely on standard onClick for the external action, but internal audio here.

            // Checks to ensure we don't double fire if using both touch/mouse listeners
            // Simple approach: Logic in onClick/Interaction

            playActionClick();
            speak(label);
            if (onClick) onClick(label);
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            data-eye-interactive="true"
            onClick={(e) => e.stopPropagation()}
            // Mouse Events
            onMouseDown={handleStart}
            onMouseUp={handleEnd}
            onMouseLeave={() => {
                if (timerRef.current) clearTimeout(timerRef.current);
                setActive(false);
            }}
            // Touch Events
            onTouchStart={handleStart}
            onTouchEnd={handleEnd}

            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    playActionClick();
                    speak(label);
                    if (onClick) onClick(label);
                }
            }}
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#000000', // Solid Black
                borderRadius: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transform: active ? 'scale(0.95)' : 'scale(1)',
                transition: 'transform 0.1s ease-in-out',
                overflow: 'hidden',
                border: '4px solid #333', // Subtle border
                boxShadow: active ? 'none' : '0 8px 16px rgba(0,0,0,0.3)',
                position: 'relative',
                userSelect: 'none', // Prevent text selection on press
                ...style
            }}
        >
            {/* Image/Icon Area */}
            <div style={{
                flex: 2,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 20px 0 20px'
            }}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={label}
                        style={{
                            width: '80%',
                            height: '80%',
                            objectFit: 'contain',
                        }}
                    />
                ) : (
                    <div style={{ fontSize: '80px', lineHeight: 1 }}>
                        {/* Fallback or Emoji prop if passed, but currently we rely on imageUrl. 
                            We need to pass 'emoji' prop or handle it. 
                            Let's assume the parent passes 'emoji' in 'imageUrl' for now? 
                            No, better to allow an 'emoji' prop.
                        */}
                        {emoji || "❓"}
                    </div>
                )}
            </div>

            {/* Label Area */}
            <div style={{
                flex: 1,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: 10
            }}>
                <Text strong style={{
                    fontSize: 24,
                    color: '#FFD700', // High-visibility Yellow
                    textAlign: 'center',
                    lineHeight: 1.2
                }}>
                    {label}
                </Text>
            </div>
        </div>
    );
};

export default TileButton;
