import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PrivateRouteWrapper = () => {

    const token = localStorage.getItem("authToken");
    let decodedToken = "";
    if (token) {
        decodedToken = jwtDecode(token);
    }

    if (!decodedToken?.userId) {
        return <Navigate to="/" />;
    }

    return <Outlet />
};

export default PrivateRouteWrapper;
