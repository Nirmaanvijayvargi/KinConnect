import React, { useState } from 'react';
import { Card, Typography } from 'antd';
import { useSpeech } from '../../hooks/useSpeech';

const { Text } = Typography;

const CommunicationCard = ({ label, imageUrl, onClick }) => {
    const [active, setActive] = useState(false);
    const { speak } = useSpeech();

    const handleInteraction = () => {
        // Visual Feedback
        setActive(true);
        setTimeout(() => setActive(false), 300);

        // Audio Feedback
        speak(label);

        // Optional parent callback (e.g., logging)
        if (onClick) onClick(label);
    };

    return (
        <Card
            hoverable
            style={{
                width: '100%',
                height: 240, // Fixed Height for Consistency
                borderRadius: 24,
                overflow: 'hidden',
                border: active ? '8px solid #FFD700' : 'none', // Gold Border on active
                transform: active ? 'scale(0.95)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy transition
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                background: '#000' // Dark background for the card
            }}
            styles={{ body: { padding: 0, height: '100%', display: 'flex', flexDirection: 'column' } }}
            onClick={handleInteraction}
        >
            {/* Image Area - Flexible */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#fff' }}>
                <img
                    alt={label}
                    src={imageUrl}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            </div>

            {/* Label Area - High Contrast Footer */}
            <div style={{
                height: 60,
                background: '#222', // Dark footer
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderTop: '4px solid #FFD700' // Gold accent line
            }}>
                <Text style={{
                    fontSize: 22,
                    color: '#FFD700', // Gold Text
                    fontWeight: '800', // Extra Bold
                    textTransform: 'uppercase',
                    letterSpacing: 1
                }}>
                    {label || "UNKNOWN"}
                </Text>
            </div>
        </Card>
    );
};

export default CommunicationCard;
