import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button, Layout, Space, Typography, Card } from 'antd';
import ThemeConfig from './theme/ThemeConfig';
import SurvivorDashboard from './components/Survivor/SurvivorDashboard';
import CaregiverDashboard from './components/Caregiver/CaregiverDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { useAccessibilityAudio } from './hooks/useAccessibilityAudio';
import { AlertTriangle } from 'lucide-react';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const Home = () => {
    const { playActionClick } = useAccessibilityAudio();

    return (
        <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }}>
            <Content style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', position: 'relative' }}>

                {/* Emergency Button - Fixed Top Right */}


                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                    <Title level={1} style={{ fontSize: '4rem', color: '#D32F2F', marginBottom: 0, letterSpacing: '-2px' }}>
                        KinConnect
                    </Title>
                    <Paragraph style={{ fontSize: '1.5rem', color: '#666', marginTop: 10 }}>
                        Bridging gaps with AI-powered communication.
                    </Paragraph>
                </div>

                <Space size={40} wrap style={{ justifyContent: 'center' }}>

                    <Link to="/survivor" onClick={playActionClick}>
                        <Card
                            hoverable
                            style={{ width: 300, borderRadius: 24, textAlign: 'center', border: 'none', boxShadow: '0 20px 40px rgba(211, 47, 47, 0.15)' }}
                            styles={{ body: { padding: 40 } }}
                        >
                            <Title level={3} style={{ color: '#D32F2F' }}>Survivor</Title>
                            <Paragraph type="secondary">Access your personal communication board.</Paragraph>
                            <Button type="primary" size="large" shape="round" style={{ height: 50, padding: '0 40px', fontSize: 18, marginTop: 20 }}>
                                Enter Mode
                            </Button>
                        </Card>
                    </Link>

                    <Link to="/caregiver" onClick={playActionClick}>
                        <Card
                            hoverable
                            style={{ width: 300, borderRadius: 24, textAlign: 'center', border: 'none', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)' }}
                            styles={{ body: { padding: 40 } }}
                        >
                            <Title level={3} style={{ color: '#333' }}>Caregiver</Title>
                            <Paragraph type="secondary">Manage photos, labels, and customize settings.</Paragraph>
                            <Button size="large" shape="round" style={{ height: 50, padding: '0 40px', fontSize: 18, marginTop: 20 }}>
                                Caregiver Portal
                            </Button>
                        </Card>
                    </Link>
                </Space>

                <div style={{ marginTop: 80, color: '#aaa' }}>
                    <Paragraph type="secondary" style={{ fontSize: 12 }}>Designed for Assistive Tech • Powered by Gemini AI</Paragraph>
                </div>

            </Content>
        </Layout>
    );
};

function App() {
    return (
        <ThemeConfig>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/survivor" element={<SurvivorDashboard />} />
                    <Route
                        path="/caregiver"
                        element={
                            <ProtectedRoute>
                                <CaregiverDashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </ThemeConfig>
    );
}

export default App;
