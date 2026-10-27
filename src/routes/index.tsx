import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Cadastro from '../pages/Cadastro';
import Clientes from '../pages/Clientes';
import ClienteForm from '../pages/ClienteForm';
import Dashboard from '../pages/Dashboard';
import Veiculos from '../pages/Veiculos';
import VeiculoForm from '../pages/VeiculoForm';
import OrdensServico from '../pages/OrdensServico';
import OrdemServicoForm from '../pages/OrdemServicoForm';
import Perfil from '../pages/Perfil';

// Importações das telas do Cliente
import ClienteDashboard from '../pages/ClienteDashboard';
import ClienteVeiculos from '../pages/ClienteVeiculos';
import ClientePerfil from '../pages/ClientePerfil'; // <-- IMPORT ADICIONADO

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          
          {/* ================= ROTAS DO ADMIN ================= */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute allowedRoles={['ADMIN']}><Layout><Clientes /></Layout></ProtectedRoute>} />
          <Route path="/clientes/novo" element={<ProtectedRoute allowedRoles={['ADMIN']}><Layout><ClienteForm /></Layout></ProtectedRoute>} />
          <Route path="/clientes/editar/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><Layout><ClienteForm /></Layout></ProtectedRoute>} />
          
          {/* Rotas de Veículos do Admin (Visualizar e Excluir) */}
          <Route path="/veiculos" element={<ProtectedRoute allowedRoles={['ADMIN']}><Layout><Veiculos /></Layout></ProtectedRoute>} />
          
          {/* Rotas de Ordens de Serviço */}
          <Route path="/ordens-servico" element={<ProtectedRoute allowedRoles={['ADMIN']}><Layout><OrdensServico /></Layout></ProtectedRoute>} />
          <Route path="/ordens-servico/novo" element={<ProtectedRoute allowedRoles={['ADMIN']}><Layout><OrdemServicoForm /></Layout></ProtectedRoute>} />
          <Route path="/ordens-servico/editar/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><Layout><OrdemServicoForm /></Layout></ProtectedRoute>} />
          
          <Route path="/perfil" element={<ProtectedRoute allowedRoles={['ADMIN']}><Layout><Perfil /></Layout></ProtectedRoute>} />

          {/* ================= ROTAS DO CLIENTE ================= */}
          <Route path="/cliente/dashboard" element={<ProtectedRoute allowedRoles={['CLIENTE']}><Layout><ClienteDashboard /></Layout></ProtectedRoute>} />
          
          {/* Tela de Listagem de Veículos do Cliente */}
          <Route path="/cliente/veiculos" element={<ProtectedRoute allowedRoles={['CLIENTE']}><Layout><ClienteVeiculos /></Layout></ProtectedRoute>} />
          
          {/* Rotas de Cadastro e Edição de Veículos do Cliente (Reaproveitando o VeiculoForm) */}
          <Route path="/cliente/veiculos/novo" element={<ProtectedRoute allowedRoles={['CLIENTE']}><Layout><VeiculoForm /></Layout></ProtectedRoute>} />
          <Route path="/cliente/veiculos/editar/:id" element={<ProtectedRoute allowedRoles={['CLIENTE']}><Layout><VeiculoForm /></Layout></ProtectedRoute>} />

          <Route path="/cliente/perfil" element={<ProtectedRoute allowedRoles={['CLIENTE']}><Layout><ClientePerfil /></Layout></ProtectedRoute>} />

          {/* Rota 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;