import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Formik, Field, Form as FormikForm, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import apiClient from '../utils/axiosInstance';
import { useAppDispatch } from '../store';
import { addProject, updateProject } from '../store/projectSlice';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    start_date: Yup.date().required('Start date is required').nullable(),
    end_date: Yup.date()
        .required('End date is required')
        .nullable()
        .min(Yup.ref('start_date'), 'End date must be after start date'),
    status: Yup.string().oneOf(['Draft', 'Active', 'On-hold', 'Completed'], 'Invalid status').required('Status is required')
});

const ProjectModal = ({ show, onHide, selectedProject }) => {
    const dispatch = useAppDispatch();
    const handleSaveProject = async (values, { setSubmitting }) => {
        try {
            if (selectedProject) {
                const response = await apiClient().put(`/projects/${selectedProject._id}`, values);
                dispatch(updateProject({ id: selectedProject._id, ...response.data }));
            } else {
                const response = await apiClient().post('/projects/create', values);
                dispatch(addProject(response.data));
            }
            onHide();
        } catch (error) {
            toast.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{selectedProject ? 'Edit Project' : 'Add Project'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={{
                        title: selectedProject?.title || '',
                        description: selectedProject?.description || '',
                        start_date: selectedProject?.start_date ? format(new Date(selectedProject.start_date), 'yyyy-MM-dd') : '',
                        end_date: selectedProject?.end_date ? format(new Date(selectedProject.end_date), 'yyyy-MM-dd') : '',
                        status: selectedProject?.status || ''
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSaveProject}
                >
                    {({ isSubmitting }) => (
                        <FormikForm>
                            <Form.Group controlId="formTitle">
                                <Form.Label>Title</Form.Label>
                                <Field
                                    type="text"
                                    name="title"
                                    className="form-control"
                                    placeholder="Enter project title"
                                />
                                <ErrorMessage name="title" component="div" className="text-danger" />
                            </Form.Group>
                            <Form.Group controlId="formDescription">
                                <Form.Label className='my-3'>Description</Form.Label>
                                <Field
                                    as="textarea"
                                    name="description"
                                    className="form-control"
                                    placeholder="Enter project description"
                                />
                                <ErrorMessage name="description" component="div" className="text-danger" />
                            </Form.Group>
                            <Form.Group controlId="formStartDate">
                                <Form.Label className='my-3'>Start Date</Form.Label>
                                <Field
                                    type="date"
                                    name="start_date"
                                    className="form-control"
                                />
                                <ErrorMessage name="start_date" component="div" className="text-danger" />
                            </Form.Group>
                            <Form.Group controlId="formEndDate">
                                <Form.Label className='my-3'>End Date</Form.Label>
                                <Field
                                    type="date"
                                    name="end_date"
                                    className="form-control"
                                />
                                <ErrorMessage name="end_date" component="div" className="text-danger" />
                            </Form.Group>
                            <Form.Group controlId="formStatus">
                                <Form.Label className="my-3">Status</Form.Label>
                                <Field
                                    as="select"
                                    name="status"
                                    className="form-control"
                                >
                                    <option value="">Select status</option>
                                    <option value="Active">Active</option>
                                    <option value="On-hold">On-hold</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Completed">Completed</option>
                                </Field>
                                <ErrorMessage name="status" component="div" className="text-danger" />
                            </Form.Group>
                            <Button variant="secondary" onClick={onHide} className="mt-3 me-2">
                                Cancel
                            </Button>
                            <Button variant="success" type="submit" disabled={isSubmitting} className="mt-3">
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                        </FormikForm>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export default ProjectModal;
