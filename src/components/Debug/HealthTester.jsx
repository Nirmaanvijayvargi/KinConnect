import React, { useState } from 'react';
import { Card, InputNumber, Button, Typography, Space, Divider } from 'antd';
import { ControlOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const HealthTester = ({ currentVitals, onOverride, onResume, mode }) => {
    const [manualValues, setManualValues] = useState(currentVitals);

    const handleApply = () => {
        onOverride(manualValues);
    };

    return (
        <Card title={<span><ControlOutlined /> Medical Event Simulator</span>} size="small" style={{ marginTop: 20 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>Heart Rate:</Text>
                    <InputNumber
                        min={0} max={250}
                        value={manualValues.heartRate}
                        onChange={(val) => setManualValues(prev => ({ ...prev, heartRate: val }))}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>SpO2 (%):</Text>
                    <InputNumber
                        min={0} max={100}
                        value={manualValues.spO2}
                        onChange={(val) => setManualValues(prev => ({ ...prev, spO2: val }))}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>Systolic BP:</Text>
                    <InputNumber
                        min={0} max={300}
                        value={manualValues.bpSys}
                        onChange={(val) => setManualValues(prev => ({ ...prev, bpSys: val }))}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>Diastolic BP:</Text>
                    <InputNumber
                        min={0} max={200}
                        value={manualValues.bpDia}
                        onChange={(val) => setManualValues(prev => ({ ...prev, bpDia: val }))}
                    />
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Button
                        type="primary"
                        danger
                        icon={<PauseCircleOutlined />}
                        onClick={handleApply}
                        disabled={mode === 'manual'}
                    >
                        Override (Trigger)
                    </Button>
                    <Button
                        type="default"
                        icon={<PlayCircleOutlined />}
                        onClick={onResume}
                        disabled={mode === 'auto'}
                    >
                        Resume Auto
                    </Button>
                </Space>

                {mode === 'manual' && (
                    <Text type="warning" style={{ fontSize: 12, display: 'block', textAlign: 'center' }}>
                        * Simulation Paused. Manual values active.
                    </Text>
                )}
            </Space>
        </Card>
    );
};

export default HealthTester;
