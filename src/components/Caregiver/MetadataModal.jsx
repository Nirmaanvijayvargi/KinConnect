import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Spin, Image } from 'antd';

const MetadataModal = ({ visible, onClose, onSave, imageFile, initialLabel, isGenerating }) => {
    const [form] = Form.useForm();
    const [preview, setPreview] = useState('');

    useEffect(() => {
        if (imageFile) {
            const objectUrl = URL.createObjectURL(imageFile);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [imageFile]);

    useEffect(() => {
        // Only update the form when not generating and initialLabel changes
        if (!isGenerating && initialLabel) {
            form.setFieldsValue({ label: initialLabel });
        } else if (isGenerating) {
            form.setFieldsValue({ label: "Analyzing..." });
        }
    }, [initialLabel, isGenerating, form]);

    const handleOk = () => {
        form
            .validateFields()
            .then((values) => {
                form.resetFields();
                onSave(values.label);
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            title="Confirm Image Label"
            open={visible}
            onOk={handleOk}
            onCancel={onClose}
            okText="Save Tile"
            okButtonProps={{ disabled: isGenerating }}
        >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                {preview && <Image width={200} src={preview} style={{ borderRadius: 8 }} />}
            </div>

            <Form
                form={form}
                layout="vertical"
                name="metadata_form"
                initialValues={{ label: initialLabel }}
            >
                <Form.Item
                    name="label"
                    label="Label (What does this image mean?)"
                    rules={[{ required: true, message: 'Please input a label for the survivor!' }]}
                >
                    <Input
                        size="large"
                        placeholder="e.g., Water, Dad, Hungry"
                        disabled={isGenerating}
                        suffix={isGenerating ? <Spin size="small" /> : null}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default MetadataModal;
