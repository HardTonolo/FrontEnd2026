import React, { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartColumn, faUsers, faCar, faWrench, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

interface LayoutProps {
  children: ReactNode;
}

// Injeção de CSS para deixar o menu responsivo em telas menores
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @media (max-width: 768px) {
      .sidebar-layout {
        position: relative !important;
        width: 100% !important;
        height: auto !important;
      }
      .main-layout {
        margin-left: 0 !important;
      }
      .container-layout {
        flex-direction: column !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.permissao === 'ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Função auxiliar para checar se o link está ativo
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div style={styles.container} className="container-layout">
      <aside style={styles.sidebar} className="sidebar-layout">
        <div style={styles.logo}>
          <h2>Concessionária</h2>
        </div>

        <nav style={styles.nav}>
          {isAdmin ? (
            // ================= MENU DO ADMIN =================
            <>
              <Link
                to="/dashboard"
                style={{
                  ...styles.navLink,
                  ...(isActive('/dashboard') ? styles.navLinkActive : {})
                }}
              >
                <FontAwesomeIcon icon={faChartColumn} style={{ marginRight: '10px' }} />
                Dashboard
              </Link>
              <Link
                to="/clientes"
                style={{
                  ...styles.navLink,
                  ...(isActive('/clientes') ? styles.navLinkActive : {})
                }}
              >
                <FontAwesomeIcon icon={faUsers} style={{ marginRight: '10px' }} />
                Clientes
              </Link>
              <Link
                to="/veiculos"
                style={{
                  ...styles.navLink,
                  ...(isActive('/veiculos') ? styles.navLinkActive : {})
                }}
              >
                <FontAwesomeIcon icon={faCar} style={{ marginRight: '10px' }} />
                Veículos
              </Link>
              <Link
                to="/ordens-servico"
                style={{
                  ...styles.navLink,
                  ...(isActive('/ordens-servico') ? styles.navLinkActive : {})
                }}
              >
                <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
                Ordens de Serviço
              </Link>
              <Link
                to="/perfil"
                style={{
                  ...styles.navLink,
                  ...(isActive('/perfil') ? styles.navLinkActive : {})
                }}
              >
                <FontAwesomeIcon icon={faUser} style={{ marginRight: '10px' }} />
                Meu Perfil
              </Link>
            </>
          ) : (
            // ================= MENU DO CLIENTE =================
            <>
              <Link
                to="/cliente/dashboard"
                style={{
                  ...styles.navLink,
                  ...(isActive('/cliente/dashboard') ? styles.navLinkActive : {})
                }}
              >
                <FontAwesomeIcon icon={faChartColumn} style={{ marginRight: '10px' }} />
                Meu Dashboard
              </Link>
              <Link
                to="/cliente/veiculos"
                style={{
                  ...styles.navLink,
                  ...(isActive('/cliente/veiculos') ? styles.navLinkActive : {})
                }}
              >
                <FontAwesomeIcon icon={faCar} style={{ marginRight: '10px' }} />
                Meus Veículos
              </Link>
              <Link
                to="/cliente/perfil"
                style={{
                  ...styles.navLink,
                  ...(isActive('/cliente/perfil') ? styles.navLinkActive : {})
                }}
              >
                <FontAwesomeIcon icon={faUser} style={{ marginRight: '10px' }} />
                Meu Perfil
              </Link>
            </>
          )}
        </nav>

        <div style={styles.userInfo}>
          <div style={styles.userName}>
            {user?.nome || 'Usuário'}
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '8px' }} />
            Sair
          </button>
        </div>
      </aside>

      <main style={styles.main} className="main-layout">
        <div style={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#2c3e50',
    color: 'white',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'fixed' as const,
    height: '100vh',
    overflowY: 'auto' as const
  },
  logo: {
    padding: '20px 0 20px 0',
    fontSize: '20px',
    borderBottom: '1px solid #34495e',
    textAlign: 'center' as const
  },
  nav: {
    flex: 1,
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px'
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: '12px 20px',
    transition: 'background-color 0.3s',
    display: 'block'
  },
  navLinkActive: {
    backgroundColor: '#34495e',
    borderLeft: '4px solid #3498db'
  },
  userInfo: {
    padding: '20px',
    borderTop: '1px solid #34495e',
    textAlign: 'center' as const
  },
  userName: {
    marginBottom: '10px',
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: '18px',
    fontWeight: 'bold'
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    fontSize: '17px'
  },
  main: {
    flex: 1,
    marginLeft: '250px',
    padding: '20px'
  },
  content: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    minHeight: 'calc(100vh - 40px)'
  }
};

export default Layout;