import React, { useState, useEffect } from 'react';
import { Container, Button, ListGroup, Card } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { PencilSquare, Trash, Plus, Eye, Download } from 'react-bootstrap-icons';
import Header from '../components/Header';
import NoteModal from '../modals/NoteModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import apiClient from '../utils/axiosInstance';
import { format } from 'date-fns';
import Loader from '../components/Loader';
import PDFViewerModal from '../modals/PDFViewerModal';
import toast from 'react-hot-toast';
import FileModal from '../modals/FileModal';


const Project = () => {
    const [project, setProject] = useState(null);
    const { projectId } = useParams();
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showFileModal, setShowFileModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(null);
    const [showPDFModal, setShowPDFModal] = useState(false);
    const [selectedFileURL, setSelectedFileURL] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadProject();
    }, [projectId]);

    const loadProject = async () => {
        try {
            const response = await apiClient().get(`/projects/${projectId}`);
            setProject(response.data);
        } catch (error) {
            console.error('Error fetching project:', error);
        }
    };

    const handleAddNote = () => {
        setSelectedNote(null);
        setShowNoteModal(true);
    };

    const handleAddFile = () => {
        setShowFileModal(true);
    }

    const handleEditNote = (note) => {
        setSelectedNote(note);
        setShowNoteModal(true);
    };

    const handleDeleteItem = (item, type) => {
        setItemToDelete(item);
        setDeleteType(type);
        setShowConfirmModal(true);
    };

    const confirmDeleteItem = async () => {
        try {
            if (deleteType === 'note') {
                await apiClient().delete(`/notes/${itemToDelete._id}`);
            } else if (deleteType === 'file') {
                await apiClient().delete(`/files/${itemToDelete._id}`);
            }
            await loadProject();
        } catch (error) {
            console.error(`Error deleting ${deleteType}:`, error);
        } finally {
            setShowConfirmModal(false);
            setItemToDelete(null);
            setDeleteType(null);
        }
    };

    const handleNoteModalClose = () => {
        setShowNoteModal(false);
        setSelectedNote(null);
    };

    const handleFilePreview = async (file) => {
        console.log('✌️file --->', file);
        const response = await apiClient().post(`/files/get-signed-url`, {
            key: file.s3_key
        });
        setSelectedFileURL(response.data.url);
        setShowPDFModal(true);
    };

    const handleFileDownload = async (file) => {
        try {
            setIsLoading(true);
            const response = await apiClient().post(`/files/get-signed-url`, {
                key: file.s3_key
            });
            fetch(response.data.url)
                .then((response) => response.blob())
                .then((blob) => {
                    const blobUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = blobUrl;
                    link.setAttribute("download", file.file_name);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);
                    window.URL.revokeObjectURL(blobUrl);
                    setIsLoading(false);
                })
                .catch((error) => console.error("Error downloading file:", error));
        } catch (error) {
            toast.error("Error downloading file");
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            {(project === null || isLoading) ? (
                <Loader />
            ) : (
                <Container>
                    <h1 className="my-3">{project.title}</h1>
                    <Card>
                        <Card.Body className="m-3">
                            <Card.Title className="fs-3">Description</Card.Title>
                            <Card.Text className="fs-5">{project.description}</Card.Text>
                            <Card.Title className="fs-3">Details</Card.Title>
                            <Card.Text className="fs-5">
                                The Project started on {format(new Date(project.start_date), 'd MMM yyyy')} and the deadline is on{' '}
                                {format(new Date(project.end_date), 'd MMM yyyy')}. The project status is {project.status}.
                            </Card.Text>
                        </Card.Body>
                        <Card.Footer className="px-4 pb-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="my-3">Notes</h5>
                                <Button variant="primary" onClick={handleAddNote}>
                                    <Plus /> Add Note
                                </Button>
                            </div>
                            <ListGroup>
                                {project.notes.map((note) => (
                                    <ListGroup.Item
                                        key={note._id}
                                        className="d-flex justify-content-between align-items-center list-item"
                                        style={{ position: 'relative' }}
                                    >
                                        {note.content}
                                        <div className="item-icons" style={{ position: 'absolute', right: '10px', display: 'none' }}>
                                            <Button variant="link" onClick={() => handleEditNote(note)}>
                                                <PencilSquare />
                                            </Button>
                                            <Button variant="link" onClick={() => handleDeleteItem(note, 'note')}>
                                                <Trash />
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="my-3">Files</h5>
                                <Button variant="primary" onClick={handleAddFile}>
                                    <Plus /> Add File
                                </Button>
                            </div>
                            <ListGroup>
                                {project.files.map((file) => (
                                    <ListGroup.Item
                                        key={file._id}
                                        className="d-flex justify-content-between align-items-center list-item"
                                        style={{ position: 'relative' }}
                                    >
                                        {file.file_name}
                                        <div className="item-icons" style={{ position: 'absolute', right: '10px', display: 'none' }}>
                                            <Button variant="link" onClick={() => handleFilePreview(file)}>
                                                <Eye />
                                            </Button>
                                            <Button variant="link" onClick={() => handleFileDownload(file)}>
                                                <Download />
                                            </Button>
                                            <Button variant="link" onClick={() => handleDeleteItem(file, 'file')}>
                                                <Trash />
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Footer>
                    </Card>
                </Container>
            )}
            <NoteModal
                show={showNoteModal}
                onHide={handleNoteModalClose}
                projectId={projectId}
                note={selectedNote}
                setProjects={loadProject}
            />
            <ConfirmationModal
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                onConfirm={confirmDeleteItem}
                title={`Confirm Delete ${deleteType}`}
                message={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
            />
            <FileModal
                show={showFileModal}
                onHide={() => setShowFileModal(false)}
                projectId={projectId}
                onUploadSuccess={loadProject}
            />
            <PDFViewerModal
                show={showPDFModal}
                setShow={setShowPDFModal}
                onHide={() => setShowPDFModal(false)}
                documentURL={selectedFileURL}
            />
            <style>
                {`
                .list-item:hover .item-icons {
                    display: block !important;
                }
                `}
            </style>
        </>
    );
};

export default Project;