import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import AfiliadosPage from "../pages/AfiliadosPage";

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/afiliados" element={<AfiliadosPage />} />
        </Routes>
    );
};

export default AppRoutes;
