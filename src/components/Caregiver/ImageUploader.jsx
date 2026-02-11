import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

const ImageUploader = ({ onImageUpload }) => {
    const props = {
        name: 'file',
        multiple: false,
        showUploadList: false,
        customRequest: ({ file, onSuccess }) => {
            // Mock success for local handling
            setTimeout(() => {
                onSuccess("ok");
                onImageUpload(file);
            }, 0);
        },
        onChange(info) {

            const { status } = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                message.success(`${info.file.name} file ready for labeling.`);
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    return (
        <div style={{ marginBottom: 24 }}>
            <Dragger {...props} style={{ background: '#fafafa', borderColor: '#d9d9d9' }}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ color: '#D32F2F' }} />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibited from uploading company data or other
                    banned files.
                    <br />(Actually, just upload a family photo!)
                </p>
            </Dragger>
        </div>
    );
};

export default ImageUploader;
