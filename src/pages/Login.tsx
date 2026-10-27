import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validarEmail } from '../utils/validations';
import { login } from '../services/authService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [carregando, setCarregando] = useState(false);

  const validarFormulario = (): boolean => {
    const novosErros: { [key: string]: string } = {};

    if (!email) {
      novosErros.email = 'Email é obrigatório';
    } else if (!validarEmail(email)) {
      novosErros.email = 'Digite um email válido (ex: nome@gmail.com)';
    }

    if (!senha) {
      novosErros.senha = 'Senha é obrigatória';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setCarregando(true);

    try {
      const response = await login(email, senha);
      
      const userData = {
        id: response.usuario.id,
        nome: response.usuario.nome,
        email: response.usuario.email,
        cpf: response.usuario.cpf || '',
        telefone: response.usuario.telefone || '',
        permissao: response.usuario.permissao || (response.usuario.telefone ? 'CLIENTE' : 'ADMIN') // Fallback seguro
      };
      
      authLogin(response.token, userData);
      
      // Redirecionamento baseado no perfil
      if (userData.permissao === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/cliente/dashboard');
      }

    } catch (error: any) {
      setErros({ submit: error.response?.data?.error || 'Erro ao fazer login. Tente novamente.' });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Bem-vindo à Concessionária</h1>

        {erros.submit && <div style={styles.erro}>{erros.submit}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...styles.input,
                borderColor: erros.email ? '#dc3545' : '#ddd'
              }}
              disabled={carregando}
              placeholder="E-mail"
            />
            {erros.email && <span style={styles.errorText}>{erros.email}</span>}
          </div>

          <div style={styles.inputGroup}>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={{
                ...styles.input,
                borderColor: erros.senha ? '#dc3545' : '#ddd'
              }}
              disabled={carregando}
              placeholder="Senha"
            />
            {erros.senha && <span style={styles.errorText}>{erros.senha}</span>}
          </div>

          <button
            type="submit"
            style={styles.button}
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>

          <p style={styles.linkContainer}>
            Não tem uma conta? <Link to="/cadastro" style={styles.link}>Cadastre-se</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    height: '100%',
    width: '100%' // <-- Corrigido aqui
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    fontSize: '24px',
    fontFamily: "Arial, Helvetica, sans-serif",
    color: '#333',
    marginBottom: '25px',
    textAlign: 'center' as const
  },
  form: {
    display: 'flex',
    fontFamily: "Arial, Helvetica, sans-serif",
    flexDirection: 'column' as const,
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  input: {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '15px',
    fontSize: '16px',
    margin: '10px',
    transition: 'border-color 0.3s'
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '15px',
    border: 'none',
    borderRadius: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    margin: '10px 10px 0 10px'
  },
  erro: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    fontFamily: "Arial, Helvetica, sans-serif",
    borderRadius: '4px',
    marginBottom: '16px',
    border: '1px solid #f5c6cb'
  },
  errorText: {
    color: '#dc3545',
    fontSize: '12px',
    fontFamily: "Arial, Helvetica, sans-serif",
    marginTop: '4px',
    marginLeft: '10px'
  },
  linkContainer: {
    marginTop: '15px',
    textAlign: 'center' as const,
    fontSize: '14px',
    fontFamily: "Arial, Helvetica, sans-serif"
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};

export default Login;