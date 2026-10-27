import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'CLIENTE')[]; // Nova propriedade
}

// Injeção do CSS movida para fora do componente (roda apenas 1 vez)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  // Enquanto verifica autenticação, mostra tela de carregamento
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Se a rota exigir um perfil específico (ex: ADMIN)
  if (allowedRoles) {
    const userRole = user?.permissao || 'CLIENTE'; // Padrão caso não venha nada

    if (!allowedRoles.includes(userRole as 'ADMIN' | 'CLIENTE')) {
      // Usuário logado, mas sem permissão. Redireciona para a área correta dele.
      if (userRole === 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
      } else {
        return <Navigate to="/cliente/dashboard" replace />;
      }
    }
  }

  // Se estiver tudo certo, mostra o componente
  return <>{children}</>;
};

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  }
};

export default ProtectedRoute;