import React, { useState, useEffect, useCallback } from 'react';
import { Button, Container, Row, Col, Card, Alert, Spinner, Form, InputGroup } from 'react-bootstrap';
import { format } from 'date-fns';
import { JournalText, FileEarmarkArrowUpFill, Search } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axiosInstance';
import Header from '../components/Header';
import ProjectModal from '../modals/ProjectModal';
import NoteModal from '../modals/NoteModal';
import FileModal from '../modals/FileModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showFileModal, setShowFileModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const navigate = useNavigate();

    // State for filters
    const [statusFilter, setStatusFilter] = useState('');
    const [keywordFilter, setKeywordFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    const loadProjects = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const response = await apiClient().get('/projects', { params: filters });
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const debouncedLoadProjects = useCallback(
        debounce((filters) => loadProjects(filters), 300),
        [loadProjects]
    );

    useEffect(() => {
        const filters = {
            status: statusFilter,
            keyword: keywordFilter,
            start_date: startDateFilter,
            end_date: endDateFilter,
        };
        debouncedLoadProjects(filters);
    }, [statusFilter, keywordFilter, startDateFilter, endDateFilter, debouncedLoadProjects]);

    const handleAddProjectClick = () => {
        setSelectedProject(null);
        setShowModal(true);
    };

    const handleEditProjectClick = (project) => {
        setSelectedProject(project);
        setShowModal(true);
    };

    const handleAddNoteClick = (project) => {
        setSelectedProject(project);
        setShowNoteModal(true);
    };

    const handleAddFileClick = (project) => {
        setSelectedProject(project);
        setShowFileModal(true);
    };

    const handleDeleteProject = (project) => {
        setProjectToDelete(project);
        setShowConfirmModal(true);
    };

    const confirmDeleteItem = async () => {
        if (projectToDelete) {
            try {
                await apiClient().delete(`/projects/${projectToDelete._id}`);
                setProjects(projects.filter(p => p._id !== projectToDelete._id));
                setShowConfirmModal(false);
                setProjectToDelete(null);
            } catch (error) {
                console.error('Error deleting project:', error);
                toast.error('Error deleting project');
            }
        }
    };

    const resetFilters = () => {
        setStatusFilter('');
        setKeywordFilter('');
        setStartDateFilter('');
        setEndDateFilter('');
    };

    return (
        <>
            <Header />
            <Container>
                <div className='d-flex justify-content-between my-4'>
                    <h2>Projects</h2>
                    <Button variant="success" onClick={handleAddProjectClick}>
                        Add Project
                    </Button>
                </div>

                {/* Filter Form */}
                <Form className="mb-4">
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Active">Active</option>
                                    <option value="Completed">Completed</option>
                                    <option value="On-hold">On Hold</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Keyword</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search..."
                                        value={keywordFilter}
                                        onChange={(e) => setKeywordFilter(e.target.value)}
                                    />
                                    <InputGroup.Text>
                                        <Search />
                                    </InputGroup.Text>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={startDateFilter}
                                    onChange={(e) => setStartDateFilter(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label>End Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={endDateFilter}
                                    onChange={(e) => setEndDateFilter(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2} className="d-flex align-items-end">
                            <Button variant="secondary" onClick={resetFilters} className="w-100">
                                Reset Filters
                            </Button>
                        </Col>
                    </Row>
                </Form>

                {loading && (
                    <div className="text-center my-4">
                        <Spinner animation="border" />
                    </div>
                )}
                {!loading && !projects.length ? (
                    <Alert variant="info">No projects found.</Alert>
                ) : (
                    <Row>
                        {projects.map(project => (
                            <Col key={project._id} md={4} className="mb-3">
                                <Card>
                                    <Card.Body>
                                        <Card.Title className='d-flex align-items-center justify-content-between'>
                                            {project.title}
                                            <div>
                                                <Button
                                                    variant="link"
                                                    className="ms-2 p-0 fs-3"
                                                    onClick={() => handleAddNoteClick(project)}
                                                >
                                                    <JournalText />
                                                </Button>
                                                <Button
                                                    variant="link"
                                                    className="ms-2 p-0 fs-3"
                                                    onClick={() => handleAddFileClick(project)}
                                                >
                                                    <FileEarmarkArrowUpFill />
                                                </Button>
                                            </div>
                                        </Card.Title>
                                        <Card.Text>{project.description}</Card.Text>
                                        <Card.Text>
                                            Status: {project.status}<br />
                                            Start Date: {format(new Date(project.start_date), 'd MMM yyyy')}<br />
                                            End Date: {format(new Date(project.end_date), 'd MMM yyyy')}
                                        </Card.Text>
                                        <Button
                                            variant="primary"
                                            onClick={() => handleEditProjectClick(project)}
                                        >
                                            Edit Details
                                        </Button>
                                        <Button
                                            variant="info"
                                            className="mx-1"
                                            onClick={() => navigate(`/project/${project._id}`)}
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDeleteProject(project)}
                                        >
                                            Delete Project
                                        </Button>
                                    </Card.Body>
                                    <Card.Footer>
                                        <small className="text-muted">
                                            Notes: {project.notes.length} | Files: {project.files.length}
                                        </small>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>

            <ConfirmationModal
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                onConfirm={confirmDeleteItem}
                title="Confirm Delete Project"
                message="Are you sure you want to delete this project? This action cannot be undone."
            />
            <ProjectModal
                show={showModal}
                onHide={() => setShowModal(false)}
                selectedProject={selectedProject}
                setProjects={setProjects}
            />
            <NoteModal
                show={showNoteModal}
                onHide={() => setShowNoteModal(false)}
                projectId={selectedProject?._id}
                setProjects={setProjects}
            />
            <FileModal
                show={showFileModal}
                onHide={() => setShowFileModal(false)}
                projectId={selectedProject?._id}
                onUploadSuccess={loadProjects}
            />
        </>
    );
}

export default Projects;