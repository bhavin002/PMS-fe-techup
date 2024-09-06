import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Formik, Field, Form as FormikForm, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import apiClient from '../utils/axiosInstance';
import { useAppDispatch } from '../store';
import { addNoteToProject, updateNoteInProject } from '../store/projectSlice';

const validationSchema = Yup.object({
    content: Yup.string().required('Note content is required'),
});

const NoteModal = ({ show, onHide, projectId, note }) => {
    const dispatch = useAppDispatch();
    const handleSaveNote = async (values, { setSubmitting }) => {
        try {
            if (note) {
                // Edit existing note
                const response = await apiClient().put(`/notes/${note._id}`, values);
                dispatch(updateNoteInProject({ projectId, note: response.data }));
            } else {
                // Add new note
                values.projectId = projectId;
                const response = await apiClient().post(`/notes/create`, values);
                dispatch(addNoteToProject({ projectId, note: response.data }));
            }
        } catch (error) {
            console.error('Error saving note:', error);
        } finally {
            onHide();
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{note ? 'Edit Note' : 'Add Note'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={{
                        content: note?.content || '',
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSaveNote}
                >
                    {({ isSubmitting }) => (
                        <FormikForm>
                            <Form.Group controlId="formContent">
                                <Form.Label>Note Content</Form.Label>
                                <Field
                                    as="textarea"
                                    name="content"
                                    className="form-control"
                                    placeholder="Enter your note"
                                />
                                <ErrorMessage name="content" component="div" className="text-danger" />
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

export default NoteModal;
