import React, { useState } from 'react';
import { Row, Col, Empty, Spin, Modal, Card, Typography, Button, Space, Badge } from 'antd';
import { AlertTriangle, Clock, Sun, Moon, Coffee, Utensils } from 'lucide-react';
import { useSpeech } from '../../hooks/useSpeech';
import TileButton from '../Common/TileButton';
import GazeButton from '../Watch/GazeButton';
import { useSmartSorter } from '../../hooks/useSmartSorter';
import { useInactivity } from '../../hooks/useInactivity';
import { useAccessibilityAudio } from '../../hooks/useAccessibilityAudio';
import { getTimeContext } from '../../utils/timeLogic';

const { Text, Title } = Typography;

const CommunicationGrid = ({
    simulatedTime,
    setSimulatedTime,
    dueMeds,
    focusedElementId,
    dwellProgress,
    lastBlinkTime
}) => {
    // We use the simulatedTime passed from parent, or default to now if undefined (safety)
    const displayTime = simulatedTime || new Date();

    // Pass simulated time to sorter
    const sorterResult = useSmartSorter(displayTime, dueMeds);
    const tiles = sorterResult?.sortedTiles || [];
    const loading = sorterResult?.loading || false;
    const connError = sorterResult?.error || null;

    // console.log("CommunicationGrid Render:", { tiles, loading, connError });
    const { playEmergencyAlert, playActionClick } = useAccessibilityAudio();
    const { speak } = useSpeech();

    const handleTileClick = (tile) => {
        playActionClick();
        speak(tile.label);
    };

    // Trigger inactivity nudge after 2 hours
    useInactivity(1000 * 60 * 60 * 2);

    const handleEmergencyClick = () => {
        Modal.confirm({
            title: 'Emergency?',
            content: 'Do you need help right now?',
            okText: 'YES, HELP!',
            okType: 'danger',
            cancelText: 'No',
            centered: true,
            icon: <AlertTriangle color="red" />,
            onOk() {
                playEmergencyAlert();
            },
        });
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}><Spin size="large" /></div>;
    }



    // ...

    if (connError) {
        return (
            <div style={{ padding: 20, textAlign: 'center', color: 'red' }}>
                <AlertTriangle size={48} />
                <Title level={4} style={{ color: 'red' }}>Connection Error</Title>
                <Text>{connError.message || "Failed to load tiles from Supabase."}</Text>
                <div style={{ marginTop: 10 }}>Check your internet or API keys.</div>
            </div>
        );
    }

    return (
        <div>
            {/* Dev Controls moved to Dashboard Drawer */}

            <Row gutter={[24, 24]}>
                {/* 1. Emergency Tile (Always First) */}
                <Col xs={12} sm={12} md={8} lg={6}>
                    <div style={{ aspectRatio: '1/1' }}>
                        <GazeButton
                            gazeId="emergency-btn"
                            isFocused={focusedElementId === "emergency-btn"}
                            dwellProgress={dwellProgress}
                            onClick={handleEmergencyClick}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <Card
                                hoverable
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 24,
                                    background: '#D32F2F', // Alert Red
                                    border: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center', // Center content horizontally
                                    justifyContent: 'center', // Center content vertically
                                    boxShadow: '0 10px 20px rgba(211, 47, 47, 0.3)'
                                }}
                                styles={{ body: { padding: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } }}
                            >
                                <AlertTriangle size={64} color="white" strokeWidth={2.5} />
                                <Text strong style={{ fontSize: 28, color: 'white', marginTop: 16, letterSpacing: 1 }}>
                                    HELP
                                </Text>
                            </Card>
                        </GazeButton>
                    </div>
                </Col>

                {/* 2. User Tiles */}
                {tiles && tiles.map((tile) => (
                    <Col xs={12} sm={12} md={8} lg={6} key={tile.id}>
                        <div style={{ aspectRatio: '1/1' }}>
                            <GazeButton
                                gazeId={tile.id}
                                isFocused={String(focusedElementId) === String(tile.id)}
                                dwellProgress={dwellProgress}
                                onClick={() => handleTileClick(tile)}
                                style={{ width: '100%', height: '100%' }}
                            >
                                <TileButton
                                    label={tile.label}
                                    imageUrl={tile.imageUrl}
                                    emoji={tile.emoji}
                                />
                            </GazeButton>
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default CommunicationGrid;
