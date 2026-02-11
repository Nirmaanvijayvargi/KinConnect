import React, { useState, useRef, useEffect } from 'react';
import { Layout, Drawer, FloatButton, Button, Typography, Space, Badge } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, SettingOutlined } from '@ant-design/icons';
import { Clock, Sun, Moon, Coffee, Utensils, MousePointer2 } from 'lucide-react';
import CommunicationGrid from './CommunicationGrid';
import WatchSimulator from '../Watch/WatchSimulator';
import HealthTester from '../Debug/HealthTester';
import EmergencyOverlay from './EmergencyOverlay';
import EyeOverlay from '../Watch/EyeOverlay';
import MedTracker from '../Dashboard/MedTracker';
import { useMedicineAlert } from '../../hooks/useMedicineAlert';
import { useHealthBand } from '../../hooks/useHealthBand';
import { useHeadTracker } from '../../hooks/useHeadTracker';
import { useStabilizedGaze } from '../../hooks/useStabilizedGaze';
import { getTimeContext } from '../../utils/timeLogic';

// ... (other imports)

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const SurvivorDashboard = () => {
    const { vitals, isUnstable, mode, setManualVitals, resumeAuto } = useHealthBand();
    const [simulatedTime, setSimulatedTime] = useState(new Date());
    const { dueMeds, refresh } = useMedicineAlert(simulatedTime);

    // 1. Head Pose Navigation (Replaces EyeTracker)
    const { headCursor, isBlinking, loading, error, debugStatus } = useHeadTracker(true);
    const [paused, setPaused] = useState(false);
    const togglePause = () => setPaused(!paused);

    // Convert boolean blink to timestamp for the click trigger
    const [lastBlinkTime, setLastBlinkTime] = useState(0);
    const wasBlinkingRef = useRef(false);

    useEffect(() => {
        if (isBlinking && !wasBlinkingRef.current) {
            // Started Blinking
            wasBlinkingRef.current = true;
        } else if (!isBlinking && wasBlinkingRef.current) {
            // Stopped Blinking (Blink Complete) -> Trigger Click
            setLastBlinkTime(Date.now());
            wasBlinkingRef.current = false;
        }
    }, [isBlinking]);

    // 2. Stabilized Engine (Consumes Head Cursor)
    const { smoothedPos, focusedElementId, dwellProgress } = useStabilizedGaze(paused ? null : headCursor, lastBlinkTime);

    // --- Settings Drawer Logic (Hidden Dev Controls) ---
    const [settingsVisible, setSettingsVisible] = useState(false);
    const longPressTimerRef = useRef(null);

    const handleTouchStart = () => {
        longPressTimerRef.current = setTimeout(() => {
            setSettingsVisible(true);
        }, 1500); // 1.5s Long Press
    };

    const handleTouchEnd = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
        }
    };

    const setTime = (hour) => {
        const d = new Date();
        d.setHours(hour);
        d.setMinutes(0);
        setSimulatedTime(d);
    };

    const currentTimeContext = getTimeContext(simulatedTime);

    return (
        <Layout style={{ minHeight: '100vh', background: '#e0e0e0' }}>

            {/* DEBUG OVERLAY */}
            <div style={{
                position: 'fixed', bottom: 10, left: 10, zIndex: 99999,
                background: 'rgba(0,0,0,0.8)', color: '#0f0', padding: 10, borderRadius: 8,
                fontFamily: 'monospace', fontSize: 12, pointerEvents: 'none'
            }}>
                <div>HEAD TRACKER DEBUG</div>
                {error ? (
                    <div style={{ color: 'red', fontWeight: 'bold' }}>ERROR: {error}</div>
                ) : (
                    <>
                        <div>Status: {debugStatus}</div>
                        <div>Cursor: {headCursor ? `${Math.round(headCursor.x)}, ${Math.round(headCursor.y)}` : "NULL"}</div>
                        <div>Focus: {focusedElementId || "NONE"}</div>
                    </>
                )}
            </div>

            <Header
                style={{ background: '#D32F2F', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <h1 style={{ color: 'white', margin: 0, fontSize: 32, letterSpacing: 1, cursor: 'pointer' }}>MY BOARD</h1>
            </Header>

            <Drawer
                title="Dev Settings & Time Travel"
                placement="top"
                onClose={() => setSettingsVisible(false)}
                open={settingsVisible}
                height={300}
            >
                <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Space>
                            <Clock size={16} />
                            <Text strong>Time Travel:</Text>
                        </Space>
                        <Badge status="processing" text={`Context: ${currentTimeContext}`} />
                    </div>

                    <Space wrap>
                        <Button icon={<Coffee size={14} />} onClick={() => setTime(8)}>Morning</Button>
                        <Button icon={<Utensils size={14} />} onClick={() => setTime(12)}>Lunch</Button>
                        <Button icon={<Sun size={14} />} onClick={() => setTime(15)}>Afternoon</Button>
                        <Button icon={<Utensils size={14} />} onClick={() => setTime(19)}>Dinner</Button>
                        <Button icon={<Moon size={14} />} onClick={() => setTime(22)}>Night</Button>
                    </Space>

                    <Button danger onClick={async () => {
                        const { resetDatabase } = await import('../../services/dbInit');
                        if (confirm("Reset Database? This will wipe all tiles.")) {
                            await resetDatabase();
                            window.location.reload();
                        }
                    }}>Reset Database (Wipe All)</Button>
                </div>
            </Drawer>

            <Layout style={{ position: 'relative' }}>
                <Content style={{ padding: '24px', maxWidth: '100%', overflowX: 'hidden', position: 'relative' }}>
                    {isUnstable ? (
                        <EmergencyOverlay vitals={vitals} onCancel={resumeAuto} />
                    ) : (
                        <>
                            <EyeOverlay cursorPos={smoothedPos} paused={paused} onTogglePause={togglePause} />

                            <CommunicationGrid
                                simulatedTime={simulatedTime}
                                setSimulatedTime={setSimulatedTime}
                                dueMeds={dueMeds}
                                focusedElementId={focusedElementId}
                                dwellProgress={dwellProgress}
                                lastBlinkTime={lastBlinkTime}
                            />

                            {/* PAUSE EYES FAB */}
                            <FloatButton
                                icon={paused ? <MousePointer2 size={24} style={{ opacity: 0.5 }} /> : <MousePointer2 size={24} />}
                                type={paused ? "default" : "primary"}
                                style={{ right: 24, bottom: 24, width: 64, height: 64 }}
                                onClick={togglePause}
                                tooltip={paused ? "Resume Head Detection" : "Pause Head Detection"}
                            />
                        </>
                    )}
                </Content>

                {/* Right Sidebar for Health Band (Judge Demo) */}
                <Sider width={240} style={{ background: '#f5f5f5', padding: 20, borderLeft: '1px solid #ddd' }} breakpoint="lg" collapsedWidth="0">
                    <WatchSimulator vitals={vitals} isUnstable={isUnstable} simulatedTime={simulatedTime} />
                    <MedTracker dueMeds={dueMeds} onLog={refresh} />
                    <HealthTester
                        currentVitals={vitals}
                        onOverride={setManualVitals}
                        onResume={resumeAuto}
                        mode={mode}
                    />
                </Sider>
            </Layout>

        </Layout>
    );
};

export default SurvivorDashboard;
