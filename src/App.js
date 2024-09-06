import './App.css';
import AuthForm from './pages/AuthForm';
import { Routes, Route } from 'react-router-dom';
import Projects from './pages/Projects';
import PrivateRouteWrapper from './components/PrivateRouteWrapper';
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from 'react';
import Project from './pages/Project';

function App() {
  const handleClick = (event) => {
    toast.dismiss();
  };

  useEffect(() => {
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);
  return (
    <>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route element={<PrivateRouteWrapper />}>
          <Route path="/projects" element={<Projects />} />
          <Route path='/project/:projectId' element={<Project />} />
        </Route>
      </Routes>
      <Toaster
        toastOptions={{
          position: "top-right",
          duration: 3000,
          success: {
            style: {
              background: "#54D62C",
              color: "black",
            },
          },
          error: {
            style: {
              background: "#FF4842",
              color: "white",
              fontWeight: "600",
            },
          },
        }}
      />
    </>
  );
}

export default App;
