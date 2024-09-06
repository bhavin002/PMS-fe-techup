import React, { useState } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { FileEarmarkArrowUpFill } from 'react-bootstrap-icons';
import { useDropzone } from 'react-dropzone';
import apiClient from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const FileModal = ({ show, onHide, projectId, onUploadSuccess }) => {
    const [files, setFiles] = useState([]);
    const [fileLoading, setFileLoading] = useState(false);

    const handleUploadFiles = async () => {
        setFileLoading(true);
        const fileNames = files.map(file => file.name);
        try {
            const response = await apiClient().post('/files/upload-signed-urls', { files: fileNames });

            if (files.length !== response?.data?.preSignedUrls?.length) {
                throw new Error('Mismatch between files and pre-signed URLs');
            }

            const uploadPromises = response.data.preSignedUrls.map((preSignedUrl, index) => {
                const file = files[index];
                const headers = {
                    'Content-Type': file.type
                };
                return fetch(preSignedUrl.URL, {
                    method: 'PUT',
                    body: file,
                    headers: headers
                });
            });

            await Promise.all(uploadPromises);

            const fileDetails = response.data.preSignedUrls.map((preSignedUrl, index) => {
                const file = files[index];
                const file_name = file.name;
                const file_extension = file_name.split('.').pop();
                const s3_key = preSignedUrl.key;
                return { file_name, file_extension, s3_key };
            });
            await apiClient().post('/files/create', { files: fileDetails, projectId });

            onHide();
            onUploadSuccess();
            toast.success('Files uploaded successfully');
        } catch (error) {
            console.error('Error uploading files:', error);
            toast.error('Error uploading files');
        } finally {
            setFiles([]);
            setFileLoading(false);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => setFiles(acceptedFiles),
        multiple: true,
        accept: {
            'application/pdf': ['.pdf']
        }
    });

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Upload Files</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {fileLoading && (
                    <div className="text-center">
                        <Spinner animation="border" />
                    </div>
                )}
                <div {...getRootProps({ className: 'dropzone' })} style={{
                    border: '2px dashed #007bff',
                    borderRadius: '4px',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer'
                }}>
                    <input {...getInputProps()} />
                    <div>
                        <FileEarmarkArrowUpFill style={{ fontSize: '3rem', color: '#007bff' }} />
                    </div>
                    <p className="mt-2">Upload Files</p>
                    <ul>
                        {files.map(file => (
                            <li key={file.name}>{file.name}</li>
                        ))}
                    </ul>
                </div>
                <Button className='mt-3' variant="primary" onClick={handleUploadFiles} disabled={fileLoading}>
                    {fileLoading ? 'Uploading...' : 'Upload Files'}
                </Button>
            </Modal.Body>
        </Modal>
    );
};

export default FileModal;