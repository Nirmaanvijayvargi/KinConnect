import React, { useState } from 'react';
import { Card, Typography, Button, Modal, Input, TimePicker, Checkbox } from 'antd';
import { CheckCircleTwoTone, MedicineBoxTwoTone, PlusOutlined } from '@ant-design/icons';
import { useSpeech } from '../../hooks/useSpeech';
import { logDose, addSchedule } from '../../services/medicineService';
import { useAccessibilityAudio } from '../../hooks/useAccessibilityAudio';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const MedTracker = ({ dueMeds, onLog }) => {
    const { speak } = useSpeech();
    const { playSuccessChime } = useAccessibilityAudio();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newMedName, setNewMedName] = useState('');
    const [newMedTime, setNewMedTime] = useState('09:00');

    const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4, 5, 6]);

    const handleAdd = async () => {
        if (!newMedName) return;
        await addSchedule(newMedName, newMedTime, selectedDays);
        setIsModalVisible(false);
        setNewMedName('');
        setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
        // We ideally want to trigger a refresh here, but dueMeds comes from parent hook.
        // We can use onLog as a generic "refresh request" or rely on polling.
        // For immediate feedback, let's call onLog() which presumably triggers parent refresh.
        if (onLog) onLog();
    };

    const daysOptions = [
        { label: 'Sun', value: 0 },
        { label: 'Mon', value: 1 },
        { label: 'Tue', value: 2 },
        { label: 'Wed', value: 3 },
        { label: 'Thu', value: 4 },
        { label: 'Fri', value: 5 },
        { label: 'Sat', value: 6 },
    ];

    if (!dueMeds || dueMeds.length === 0) {
        return (
            <Card size="small" style={{ marginTop: 20, textAlign: 'center' }}>
                <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 24, marginBottom: 8 }} />
                <div><Text strong>All Meds Taken</Text></div>
                <Text type="secondary" style={{ fontSize: 12 }}>Next due later...</Text>

                <div style={{ marginTop: 12, borderTop: '1px solid #eee', paddingTop: 8 }}>
                    <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                        Schedule Meds
                    </Button>
                </div>

                <Modal
                    title="Weekly Medicine Planner"
                    open={isModalVisible}
                    onOk={handleAdd}
                    onCancel={() => setIsModalVisible(false)}
                    okText="Save Schedule"
                    okButtonProps={{ style: { background: '#D32F2F', borderColor: '#D32F2F' } }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <Text strong>Medicine Name</Text>
                            <Input
                                placeholder="e.g. Aspirin"
                                value={newMedName}
                                onChange={e => setNewMedName(e.target.value)}
                                style={{ marginTop: 4 }}
                            />
                        </div>
                        <div>
                            <Text strong>Time (24h)</Text>
                            <TimePicker
                                format="HH:mm"
                                value={dayjs(newMedTime, 'HH:mm')}
                                onChange={(time, timeString) => setNewMedTime(timeString)}
                                style={{ width: '100%', marginTop: 4 }}
                            />
                        </div>
                        <div>
                            <Text strong>Repeat Days</Text>
                            <Checkbox.Group
                                options={daysOptions}
                                value={selectedDays}
                                onChange={setSelectedDays}
                                style={{ marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}
                            />
                        </div>
                    </div>
                </Modal>
            </Card>
        );
    }

    const med = dueMeds[0]; // Handle first due med first

    const handleTake = async () => {
        playSuccessChime();
        speak("I have taken my medicine");
        await logDose(med.id);
        if (onLog) onLog(); // Callback to refresh hooks if needed
    };

    return (
        <Card
            style={{
                marginTop: 20,
                background: '#D32F2F',
                border: 'none',
                animation: 'pulse-red 2s infinite'
            }}
            styles={{ body: { padding: 16, textAlign: 'center' } }}
        >
            <MedicineBoxTwoTone twoToneColor="#ffffff" style={{ fontSize: 32, marginBottom: 8 }} />
            <Title level={4} style={{ color: '#fff', margin: 0 }}>TAKE {med.name.toUpperCase()}</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 12 }}>It is time for your medication.</Text>

            <Button
                size="large"
                block
                style={{
                    height: 50,
                    borderRadius: 25,
                    fontWeight: 'bold',
                    fontSize: 18,
                    color: '#D32F2F'
                }}
                onClick={handleTake}
            >
                Confirm Taken
            </Button>

            <style jsx global>{`
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(211, 47, 47, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
                }
            `}</style>
        </Card>
    );
};

export default MedTracker;
