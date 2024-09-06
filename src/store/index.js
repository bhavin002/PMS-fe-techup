import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { projectReducer } from "./projectSlice";

const store = configureStore({
    reducer: {
        project: projectReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;