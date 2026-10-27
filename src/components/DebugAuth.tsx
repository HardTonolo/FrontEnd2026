import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugAuth: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: '#333',
      color: '#fff',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div>Autenticado: {isAuthenticated ? 'SIM ✅' : 'NÃO ❌'}</div>
      <div>Loading: {loading ? 'Carregando...' : 'Pronto'}</div>
      <div>Usuário: {user ? user.nome : 'Nenhum'}</div>
      <div>Token: {localStorage.getItem('token') ? 'Existe' : 'Não existe'}</div>
    </div>
  );
};

export default DebugAuth;