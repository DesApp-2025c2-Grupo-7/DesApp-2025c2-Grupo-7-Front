import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import AfiliadosPage from "../pages/AfiliadosPage";
import PrestadoresPage from "../pages/PrestadoresPage";
import AfiliadoProfile from "../pages/AfiliadoProfilePage";

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/afiliados" element={<AfiliadosPage />} />
            <Route path="/prestadores" element={<PrestadoresPage />} />
            <Route path="/afiliados/:id" element={<AfiliadoProfile />} />
        </Routes>
    );
};

export default AppRoutes;
