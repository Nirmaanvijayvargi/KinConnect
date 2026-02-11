import React from 'react';
import { Typography, Button } from 'antd';
import { Heart, Activity } from 'lucide-react';
import { useSpeech } from '../../hooks/useSpeech';
import { useAccessibilityAudio } from '../../hooks/useAccessibilityAudio';

const { Text } = Typography;

const WatchSimulator = ({ vitals, isUnstable, simulatedTime }) => {
    const displayTime = simulatedTime || new Date();
    const { playEmergencyAlert } = useAccessibilityAudio();
    const { speak } = useSpeech();

    const handleSOS = () => {
        speak("Emergency Alert Activated");
        playEmergencyAlert();
    };

    return (
        <div style={{
            width: 180,
            height: 220,
            background: '#000',
            borderRadius: 32,
            border: '4px solid #333',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            margin: '0 auto 20px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Watch Header (Time) */}
            <div style={{ textAlign: 'center', padding: '12px 0 4px', borderBottom: '1px solid #222' }}>
                <Text style={{ color: '#fff', fontSize: 28, fontWeight: '300', letterSpacing: 1 }}>
                    {displayTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </div>

            {/* Vitals Display */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, padding: '0 16px' }}>

                {/* Heart Rate */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Heart size={20} color="#ff4d4f" fill="#ff4d4f" style={{ animation: `pulse ${60 / (vitals?.heartRate || 60)}s infinite` }} />
                        <Text style={{ color: '#999', fontSize: 12 }}>BPM</Text>
                    </div>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{vitals?.heartRate || '--'}</Text>
                </div>

                {/* Blood Pressure */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Activity size={20} color="#1890ff" />
                        <Text style={{ color: '#999', fontSize: 12 }}>BP</Text>
                    </div>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
                        {vitals?.bpSys && vitals?.bpDia ? `${vitals.bpSys}/${vitals.bpDia}` : '--/--'}
                    </Text>
                </div>

                {/* Oxygen */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text style={{ color: '#52c41a', fontSize: 14, fontWeight: 'bold' }}>O₂</Text>
                        <Text style={{ color: '#999', fontSize: 12 }}>SpO2</Text>
                    </div>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{vitals?.spO2 || '--'}%</Text>
                </div>
            </div>

            {/* SOS Button */}
            <div style={{ padding: 12 }}>
                <Button
                    type="primary"
                    danger
                    block
                    shape="round"
                    style={{ height: 40, fontWeight: 'bold', fontSize: 16, boxShadow: '0 0 10px rgba(211, 47, 47, 0.4)' }}
                    onClick={handleSOS}
                >
                    SOS
                </Button>
            </div>

            {/* Animation Style */}
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default WatchSimulator;
