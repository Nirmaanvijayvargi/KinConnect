import React, { useState } from 'react';
import { Button, Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const ProtectedRoute = ({ children }) => {
    // Simple mock auth state for now since Firebase is removed.
    // In a real Supabase app, we would use supabase.auth.getSession() here.
    const [user, setUser] = useState(null);

    const handleLogin = () => {
        // Mock Login
        setUser({ uid: 'mock-user', displayName: 'Caregiver' });
    };

    if (!user) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
                <Card style={{ width: 400, textAlign: 'center' }}>
                    <Title level={3} style={{ color: '#D32F2F' }}>Caregiver Access</Title>
                    <Paragraph>Please sign in to verify you are a family member.</Paragraph>
                    <Button type="primary" size="large" onClick={handleLogin} style={{ width: '100%', marginBottom: 16 }}>
                        Enter Caregiver Mode
                    </Button>
                </Card>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
