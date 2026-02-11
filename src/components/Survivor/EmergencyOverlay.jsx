import React, { useEffect, useState } from 'react';
import { Typography, Button, Space } from 'antd';
import { Phone, AlertTriangle } from 'lucide-react';

const { Title, Text } = Typography;

const EmergencyOverlay = ({ onCancel, vitals }) => {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(211, 47, 47, 0.95)', // Deep Red Overlay
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            {/* Flashing Icon */}
            <div style={{ marginBottom: 40, animation: 'pulse-fast 1s infinite' }}>
                <div style={{
                    background: 'white',
                    borderRadius: '50%',
                    width: 120,
                    height: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Phone size={64} color="#D32F2F" fill="#D32F2F" />
                </div>
            </div>

            <Title level={1} style={{ color: 'white', fontSize: '3rem', margin: 0, letterSpacing: 2 }}>
                CRITICAL VITALS
            </Title>

            <Title level={3} style={{ color: 'white', marginTop: 10, marginBottom: 40 }}>
                CONTACTING EMERGENCY SERVICES...
            </Title>

            <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '20px 40px',
                borderRadius: 16,
                marginBottom: 40,
                border: '1px solid rgba(255,255,255,0.3)'
            }}>
                <Text style={{ color: 'white', fontSize: 18, display: 'block' }}>Detected Heart Rate</Text>
                <Text strong style={{ color: 'white', fontSize: 48 }}>{vitals.heartRate} BPM</Text>
                <div style={{ marginTop: 10 }}>
                    <Text type="secondary" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        Connecting... 00:0{seconds}
                    </Text>
                </div>
            </div>

            <Button
                size="large"
                shape="round"
                style={{
                    height: 60,
                    padding: '0 50px',
                    fontSize: 20,
                    background: 'white',
                    color: '#D32F2F',
                    border: 'none',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                }}
                onClick={onCancel}
            >
                CANCEL REQUEST
            </Button>

            <style>{`
                @keyframes pulse-fast {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default EmergencyOverlay;
