import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { validarEmail, validarCPF, avaliarForcaSenha, formatarCPF, formatarTelefone } from '../utils/validations';
import { cadastrarUsuario } from '../services/authService';

const Cadastro: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState(''); // <-- NOVO ESTADO
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [carregando, setCarregando] = useState(false);
  const [forcaSenha, setForcaSenha] = useState<{ forca: string; mensagem: string; pontos: number } | null>(null);

  const handleSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novaSenha = e.target.value;
    setSenha(novaSenha);
    
    if (novaSenha) {
      const avaliacao = avaliarForcaSenha(novaSenha);
      setForcaSenha(avaliacao);
    } else {
      setForcaSenha(null);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cpfFormatado = formatarCPF(e.target.value);
    setCpf(cpfFormatado);
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatarTelefone(e.target.value));
  };

  const validarFormulario = (): boolean => {
    const novosErros: { [key: string]: string } = {};

    if (!nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    } else if (nome.trim().length < 3) {
      novosErros.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!email) {
      novosErros.email = 'Email é obrigatório';
    } else if (!validarEmail(email)) {
      novosErros.email = 'Digite um email válido';
    }

    if (!cpf) {
      novosErros.cpf = 'CPF é obrigatório';
    } else {
      const cpfNumerico = cpf.replace(/[^\d]/g, '');
      if (cpfNumerico.length !== 11) {
        novosErros.cpf = 'CPF deve ter 11 dígitos';
      } else if (!validarCPF(cpf)) {
        novosErros.cpf = 'CPF inválido';
      }
    }

    // Validação do Telefone (NOVO)
    if (!telefone) {
      novosErros.telefone = 'Telefone é obrigatório';
    } else {
      const telNumerico = telefone.replace(/\D/g, '');
      if (telNumerico.length < 10 || telNumerico.length > 11) {
        novosErros.telefone = 'Telefone inválido (com DDD)';
      }
    }

    if (!senha) {
      novosErros.senha = 'Senha é obrigatória';
    } else if (senha.length < 6) {
      novosErros.senha = 'Senha deve ter pelo menos 6 caracteres';
    } else if (forcaSenha && forcaSenha.forca === 'fraca') {
      novosErros.senha = forcaSenha.mensagem;
    }

    if (!confirmarSenha) {
      novosErros.confirmarSenha = 'Confirme sua senha';
    } else if (senha !== confirmarSenha) {
      novosErros.confirmarSenha = 'As senhas não coincidem';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setCarregando(true);

    try {
      const cpfNumerico = cpf.replace(/[^\d]/g, '');
      const telNumerico = telefone.replace(/\D/g, '');
      
      await cadastrarUsuario({
        nome,
        email,
        senha,
        cpf: cpfNumerico,
        telefone: telNumerico // <-- ENVIANDO O TELEFONE
      });
      
      alert('Cadastro realizado com sucesso! Faça seu login.');
      navigate('/');
    } catch (error: any) {
      setErros({ submit: error.response?.data?.error || 'Erro ao cadastrar. Tente novamente.' });
    } finally {
      setCarregando(false);
    }
  };

  const getForcaCor = () => {
    if (!forcaSenha) return '#ddd';
    switch (forcaSenha.forca) {
      case 'fraca': return '#dc3545';
      case 'media': return '#ffc107';
      case 'forte': return '#28a745';
      default: return '#ddd';
    }
  };

  const getForcaLargura = () => {
    if (!forcaSenha) return '0%';
    return `${(forcaSenha.pontos / 6) * 100}%`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Sistema Concessionária</h1>
        
        {erros.submit && <div style={styles.erro}>{erros.submit}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={{...styles.input, borderColor: erros.nome ? '#dc3545' : '#ddd'}}
              disabled={carregando}
              placeholder="Nome Completo *"
            />
            {erros.nome && <span style={styles.errorText}>{erros.nome}</span>}
          </div>
          
          <div style={styles.inputGroup}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{...styles.input, borderColor: erros.email ? '#dc3545' : '#ddd'}}
              disabled={carregando}
              placeholder="E-mail *"
            />
            {erros.email && <span style={styles.errorText}>{erros.email}</span>}
          </div>
          
          <div style={styles.inputGroup}>
            <input
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              style={{...styles.input, borderColor: erros.cpf ? '#dc3545' : '#ddd'}}
              disabled={carregando}
              placeholder="CPF *"
              maxLength={14}
            />
            {erros.cpf && <span style={styles.errorText}>{erros.cpf}</span>}  
          </div>

          {/* CAMPO DE TELEFONE ADICIONADO */}
          <div style={styles.inputGroup}>
            <input
              type="text"
              value={telefone}
              onChange={handleTelefoneChange}
              style={{...styles.input, borderColor: erros.telefone ? '#dc3545' : '#ddd'}}
              disabled={carregando}
              placeholder="Telefone com DDD *"
              maxLength={15}
            />
            {erros.telefone && <span style={styles.errorText}>{erros.telefone}</span>}  
          </div>
          
          <div style={styles.inputGroup}>
            <input
              type="password"
              value={senha}
              onChange={handleSenhaChange}
              style={{...styles.input, borderColor: erros.senha ? '#dc3545' : '#ddd'}}
              disabled={carregando}
              placeholder="Senha *"
            />
            
            {senha && (
              <div style={styles.forcaContainer}>
                <div style={styles.forcaLabels}>
                  <span style={styles.forcaLabel}>Força da senha:</span>
                  <span style={{...styles.forcaTexto, color: getForcaCor()}}>
                    {forcaSenha?.forca.toUpperCase()}
                  </span>
                </div>
                <div style={styles.forcaBarraBg}>
                  <div style={{...styles.forcaBarraPreenchida, width: getForcaLargura(), backgroundColor: getForcaCor()}} />
                </div>
                {forcaSenha && <span style={styles.forcaMensagem}>{forcaSenha.mensagem}</span>}
              </div>
            )}
            {erros.senha && <span style={styles.errorText}>{erros.senha}</span>}
          </div>
          
          <div style={styles.inputGroup}>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              style={{...styles.input, borderColor: erros.confirmarSenha ? '#dc3545' : '#ddd'}}
              disabled={carregando}
              placeholder="Confirmar Senha *"
            />
            {erros.confirmarSenha && <span style={styles.errorText}>{erros.confirmarSenha}</span>}
          </div>
          
          <button type="submit" style={styles.button} disabled={carregando}>
            {carregando ? 'Cadastrando...' : 'Cadastrar'}
          </button>
          
          <p style={styles.linkContainer}>
            Já tem uma conta? <Link to="/" style={styles.link}>Faça login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '40px' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px' },
  title: { fontSize: '24px', fontFamily: "Arial, Helvetica, sans-serif", color: '#333', marginBottom: '25px', textAlign: 'center' as const },
  form: { display: 'flex', flexDirection: 'column' as const, gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  input: { padding: '15px', border: '1px solid #ddd', borderRadius: '15px', fontSize: '16px', transition: 'border-color 0.3s', margin: '10px' },
  button: { backgroundColor: '#007bff', color: 'white', padding: '15px', border: 'none', borderRadius: '15px', fontSize: '16px', fontWeight: 'bold', fontFamily: "Arial, Helvetica, sans-serif", cursor: 'pointer', marginTop: '8px' },
  erro: { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '16px', border: '1px solid #f5c6cb' },
  errorText: { color: '#dc3545', fontSize: '12px', fontFamily: "Arial, Helvetica, sans-serif", marginTop: '4px' },
  forcaContainer: { marginTop: '8px' },
  forcaLabels: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
  forcaLabel: { fontSize: '12px', fontFamily: "Arial, Helvetica, sans-serif", color: '#666' },
  forcaTexto: { fontSize: '12px', fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 'bold' },
  forcaBarraBg: { height: '4px', backgroundColor: '#e9ecef', borderRadius: '2px', overflow: 'hidden' },
  forcaBarraPreenchida: { height: '100%', transition: 'width 0.3s ease' },
  forcaMensagem: { fontSize: '11px', fontFamily: "Arial, Helvetica, sans-serif", color: '#666', marginTop: '4px', display: 'block' },
  linkContainer: { marginTop: '16px', textAlign: 'center' as const, fontFamily: "Arial, Helvetica, sans-serif", fontSize: '14px' },
  link: { color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }
};

export default Cadastro;