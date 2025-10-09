import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import AfiliadosPage from "../pages/AfiliadosPage";
import PrestadoresPage from "../pages/PrestadoresPage";
import AfiliadoProfile from "../pages/AfiliadoProfilePage";
import PrestadorProfilePage from "../pages/PrestadoresProfilePage";
import { PrestadorDarDeAlta } from "../pages/PrestadorDarDeAltaPage";
import { AfiliadoDarDeAlta } from "../pages/AfiliadoDarDeAltaPage";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/afiliados" element={<AfiliadosPage />} />
      <Route path="/prestadores" element={<PrestadoresPage />} />
      <Route path="/afiliados/:id" element={<AfiliadoProfile />} />
      <Route path="/prestadores/:id" element={<PrestadorProfilePage />} />
      <Route path="/prestadores/alta" element={<PrestadorDarDeAlta />} />
      <Route path="/afiliados/alta" element={<AfiliadoDarDeAlta />} />
    </Routes>
  );
};

export default AppRoutes;
