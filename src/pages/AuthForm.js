import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Button, InputGroup, Container, Row, Col } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import * as Yup from 'yup';
import apiClient from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import toast from "react-hot-toast";

const AuthForm = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [passwordShown, setPasswordShown] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/projects');
    }
  }, [navigate]);

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const toggleFormType = () => {
    setIsRegister(!isRegister);
  };

  const validationSchema = Yup.object({
    name: isRegister ? Yup.string().required('Name is required') : null,
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters long')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/\d/, 'Password must contain at least one digit')
      .matches(/[@$!%*?&#]/, 'Password must contain at least one special character')
      .required('Password is required'),
  });

  const initialValues = {
    name: '',
    email: '',
    password: '',
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      if (!isRegister) {
        delete values.name;
      }
      const response = await apiClient().post(endpoint, {
        ...values
      });
      if (!isRegister && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        navigate('/projects');
      }
      toast.success(`${isRegister ? 'Registered' : 'Logged in'} successfully`);
      if (isRegister) {
        setIsRegister(false);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Container className="mt-5">
          <Row className="justify-content-md-center">
            <Col md={6}>
              <h2 className="text-center mb-4">{isRegister ? 'Register' : 'Login'}</h2>

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ handleSubmit }) => (
                  <Form onSubmit={handleSubmit}>
                    {isRegister && (
                      <div className="mb-3">
                        <label htmlFor="name">Name</label>
                        <Field
                          type="text"
                          name="name"
                          className="form-control"
                          placeholder="Enter your name"
                        />
                        <ErrorMessage name="name" component="div" className="text-danger" />
                      </div>
                    )}

                    <div className="mb-3">
                      <label htmlFor="email">Email</label>
                      <Field
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="Enter your email"
                      />
                      <ErrorMessage name="email" component="div" className="text-danger" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password">Password</label>
                      <InputGroup>
                        <Field
                          type={passwordShown ? 'text' : 'password'}
                          name="password"
                          className="form-control"
                          placeholder="Enter your password"
                        />
                        <Button variant="outline-secondary" onClick={togglePasswordVisibility}>
                          {passwordShown ? <EyeSlash /> : <Eye />}
                        </Button>
                      </InputGroup>
                      <ErrorMessage name="password" component="div" className="text-danger" />
                    </div>

                    <Button variant="primary" type="submit" className="w-100">
                      {isRegister ? 'Register' : 'Login'}
                    </Button>
                  </Form>
                )}
              </Formik>

              <div className="text-center mt-3">
                {isRegister ? (
                  <p>
                    Already have an account?{' '}
                    <Button variant="link" onClick={toggleFormType}>
                      Login here
                    </Button>
                  </p>
                ) : (
                  <p>
                    Don't have an account?{' '}
                    <Button variant="link" onClick={toggleFormType}>
                      Register here
                    </Button>
                  </p>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      )}
    </>
  );
};

export default AuthForm;
