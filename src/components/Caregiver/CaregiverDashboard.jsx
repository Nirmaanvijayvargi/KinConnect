import React, { useState } from 'react';
import { Layout, Typography, List, Card, message, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import ImageUploader from './ImageUploader';
import MetadataModal from './MetadataModal';
import { useGemini } from '../../hooks/useGemini';
import { compressImage } from '../../utils/imageOptimizer';
import { useTiles } from '../../hooks/useTiles';
import { useAccessibilityAudio } from '../../hooks/useAccessibilityAudio';
import { uploadImage } from '../../lib/supabase';

const { Header, Content } = Layout;
const { Title } = Typography;

const CaregiverDashboard = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const [aiLabel, setAiLabel] = useState("");
    const { generateLabel, loading: aiLoading } = useGemini();
    const { playSuccessChime } = useAccessibilityAudio();

    // Use local tiles hook
    const { tiles: recentTiles, addTile, removeTile } = useTiles();

    const handleDeleteTile = (id) => {
        Modal.confirm({
            title: 'Delete Tile?',
            content: 'Are you sure you want to delete this tile? This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                await removeTile(id);
                message.success('Tile deleted permanently.');
            },
        });
    };

    const handleImageUpload = async (originalFile) => {
        let file = originalFile;
        try {
            console.log(`Original size: ${(originalFile.size / 1024 / 1024).toFixed(2)} MB`);
            file = await compressImage(originalFile);
            console.log(`Compressed size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        } catch (error) {
            console.warn("Image compression failed, using original:", error);
        }

        setCurrentFile(file);
        setModalVisible(true);

        // Trigger AI Labeling
        const label = await generateLabel(file);
        setAiLabel(label);
    };

    // AI Labeling Trigger

    const handleSaveTile = async (finalLabel) => {
        if (!currentFile) return;

        const hide = message.loading('Uploading and saving to cloud...', 0);
        try {
            // 1. Upload Image to Supabase Storage
            const publicUrl = await uploadImage(currentFile);

            // 2. Save Tile Metadata to Supabase DB
            await addTile(finalLabel, publicUrl, 'Custom'); // Updated addTile signature in useTiles
            playSuccessChime();

            message.success('Tile synced to cloud!');
            setModalVisible(false);
            setCurrentFile(null);
            setAiLabel("");
        } catch (error) {
            console.error("Error saving tile:", error);
            message.error("Failed to upload/save tile.");
        } finally {
            hide();
        }
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            <Header style={{ background: '#fff', padding: '0 20px', borderBottom: '1px solid #f0f0f0' }}>
                <Title level={3} style={{ color: '#333', margin: '15px 0' }}>Caregiver Portal (Local-First)</Title>
            </Header>
            <Content style={{ padding: '20px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>

                {/* Upload Section */}
                <div style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <Title level={4}>Add New Communication Tile</Title>
                    <ImageUploader onImageUpload={handleImageUpload} />
                </div>

                {/* Recent Tiles List */}
                <div style={{ background: 'white', padding: 24, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <Title level={4}>Recent Tiles</Title>
                    <List
                        grid={{ gutter: 16, xs: 2, sm: 3, md: 4, lg: 6, xl: 6, xxl: 8 }}
                        dataSource={recentTiles}
                        renderItem={(item) => (
                            <List.Item>
                                <Card
                                    hoverable
                                    cover={<img alt={item.label} src={item.imageUrl} style={{ height: 120, objectFit: 'cover' }} />}
                                    styles={{ body: { padding: 12 } }}
                                    actions={[
                                        !item.is_system && <DeleteOutlined key="delete" style={{ color: 'red' }} onClick={() => handleDeleteTile(item.id)} />
                                    ]}
                                >
                                    <Card.Meta title={item.label} />
                                </Card>
                            </List.Item>
                        )}
                    />
                </div>

                <MetadataModal
                    visible={modalVisible}
                    imageFile={currentFile}
                    initialLabel={aiLabel}
                    isGenerating={aiLoading}
                    onClose={() => setModalVisible(false)}
                    onSave={handleSaveTile}
                />

            </Content>
        </Layout>
    );
};

export default CaregiverDashboard;
