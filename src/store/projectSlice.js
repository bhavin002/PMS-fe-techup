import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../utils/axiosInstance";
import toast from "react-hot-toast";

export const getProjects = createAsyncThunk("getProjects", async (filters) => {
    try {
        const response = await apiClient().get('/projects', { params: filters });
        return response.data;
    } catch (error) {
        toast.error(error);
        throw error;
    }
});

export const getProject = createAsyncThunk("getProject", async (id) => {
    try {
        const response = await apiClient().get(`/projects/${id}`);
        return response.data;
    } catch (error) {
        toast.error(error);
        throw error;
    }
});

export const project = createSlice({
    name: "projects",
    initialState: {
        projects: [],
        project: null,
        status: null,
    },
    reducers: {
        addProject: (state, action) => {
            state.projects.unshift(action.payload);
        },
        updateProject: (state, action) => {
            const { id, ...updates } = action.payload;
            const existingProject = state.projects.find((project) => project._id === id);
            if (existingProject) {
                Object.assign(existingProject, updates);
            }
        },
        deleteProject: (state, action) => {
            const id = action.payload;
            state.projects = state.projects.filter((project) => project._id !== id);
        },
        addNoteToProject: (state, action) => {
            const { projectId, note } = action.payload;
            const project = state.projects.find((project) => project._id === projectId);
            if (project) {
                project.notes.push(note._id);
            }
            const projectState = state.project;
            if (projectState && projectState._id === projectId) {
                projectState.notes.push(note);
            }
        },
        updateNoteInProject: (state, action) => {
            const { projectId, note } = action.payload;
            const projectState = state.project;
            if (projectState && projectState?._id === projectId) {
                const noteIndex = projectState.notes.findIndex((n) => n._id === note._id);
                if (noteIndex !== -1) {
                    projectState.notes[noteIndex] = { ...projectState.notes[noteIndex], ...note };
                }
            }
        },
        removeNoteFromProject: (state, action) => {
            const { projectId, noteId } = action.payload;
            const project = state.projects.find((project) => project._id === projectId);
            if (project) {
                project.notes = project.notes.filter((note) => note !== noteId);
            }
            const projectState = state.project;
            if (projectState && projectState._id === projectId) {
                projectState.notes = projectState.notes.filter((note) => note._id !== noteId);
            }
        },
        addFilesToProject: (state, action) => {
            const { projectId, files } = action.payload;
            const project = state.projects.find((project) => project._id === projectId);
            if (project) {
                project.files.push(...files.map((file) => file._id));
            }
            const projectState = state.project;
            if (projectState && projectState._id === projectId) {
                projectState.files.push(...files);
            }
        },
        removeFileToProject: (state, action) => {
            const { projectId, fileId } = action.payload;
            const project = state.projects.find((project) => project._id === projectId);
            if (project) {
                project.files = project.files.filter((file) => file !== fileId);
            }
            const projectState = state.project;
            if (projectState && projectState._id === projectId) {
                projectState.files = projectState.files.filter((file) => file._id !== fileId);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProjects.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.projects = action.payload;
            })
            .addCase(getProjects.pending, (state, action) => {
                state.status = "loading";
            })
            .addCase(getProjects.rejected, (state, action) => {
                state.status = "failed";
            })
            .addCase(getProject.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.project = action.payload;
            })
            .addCase(getProject.pending, (state, action) => {
                state.status = "loading";
            })
            .addCase(getProject.rejected, (state, action) => {
                state.status = "failed";
            });

    }
})

export const { addProject, updateProject, deleteProject, addNoteToProject, updateNoteInProject, removeNoteFromProject, addFilesToProject, removeFileToProject } = project.actions;

export const projectReducer = project.reducer;