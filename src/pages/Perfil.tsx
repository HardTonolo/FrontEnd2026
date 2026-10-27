import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validarCPF, formatarCPF, formatarTelefone, avaliarForcaSenha } from '../utils/validations';
import { buscarUsuarioLogado, alterarSenha } from '../services/authService';

interface PerfilData {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
}

const Perfil: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState<PerfilData>({
    nome: '',
    email: '',
    cpf: '',
    telefone: ''
  });
  
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [mostrarAlterarSenha, setMostrarAlterarSenha] = useState(false);
  
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [carregando, setCarregando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [forcaSenha, setForcaSenha] = useState<{ forca: string; mensagem: string; pontos: number } | null>(null);

  // Carregar dados do usuário - BUSCA DIRETO DO BACK-END
  useEffect(() => {
    const carregarDadosCompletos = async () => {
  try {
    const usuarioCompleto = await buscarUsuarioLogado();
    if (usuarioCompleto) {
      setFormData({
        nome: usuarioCompleto.nome || '',
        email: usuarioCompleto.email || '',
        cpf: usuarioCompleto.cpf ? formatarCPF(usuarioCompleto.cpf) : '',  // ← FORMATAR AQUI
        telefone: usuarioCompleto.telefone || ''
      });
    } else if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        cpf: user.cpf ? formatarCPF(user.cpf) : '',  // ← FORMATAR AQUI
        telefone: user.telefone || ''
      });
    }
  } catch (error) {
    console.error('Erro ao carregar dados completos:', error);
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        cpf: user.cpf ? formatarCPF(user.cpf) : '',  // ← FORMATAR AQUI
        telefone: user.telefone || ''
      });
    }
  }
};
    
    carregarDadosCompletos();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let valorFormatado = value;
    
    if (name === 'cpf') {
      const apenasNumeros = value.replace(/\D/g, '');
      const numerosLimitados = apenasNumeros.slice(0, 11);
      valorFormatado = formatarCPF(numerosLimitados);
    } else if (name === 'telefone') {
      valorFormatado = formatarTelefone(value);
    }
    
    setFormData({ ...formData, [name]: valorFormatado });
    
    if (erros[name]) {
      setErros({ ...erros, [name]: '' });
    }
  };

  const handleNovaSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNovaSenha(value);
    
    if (value) {
      const avaliacao = avaliarForcaSenha(value);
      setForcaSenha(avaliacao);
    } else {
      setForcaSenha(null);
    }
    
    if (erros.novaSenha) {
      setErros({ ...erros, novaSenha: '' });
    }
  };

  const validarFormulario = (): boolean => {
    const novosErros: { [key: string]: string } = {};

    if (!formData.nome || !formData.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      novosErros.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (formData.cpf && formData.cpf.trim()) {
      const cpfNumerico = formData.cpf.replace(/[^\d]/g, '');
      if (cpfNumerico.length !== 11 && cpfNumerico.length > 0) {
        novosErros.cpf = 'CPF deve ter 11 dígitos';
      } else if (cpfNumerico.length === 11 && !validarCPF(formData.cpf)) {
        novosErros.cpf = 'CPF inválido';
      }
    }

    if (mostrarAlterarSenha) {
      if (!senhaAtual) {
        novosErros.senhaAtual = 'Senha atual é obrigatória';
      }
      
      if (!novaSenha) {
        novosErros.novaSenha = 'Nova senha é obrigatória';
      } else if (novaSenha.length < 6) {
        novosErros.novaSenha = 'Nova senha deve ter pelo menos 6 caracteres';
      } else if (forcaSenha && forcaSenha.forca === 'fraca') {
        novosErros.novaSenha = forcaSenha.mensagem;
      }
      
      if (!confirmarNovaSenha) {
        novosErros.confirmarNovaSenha = 'Confirme sua nova senha';
      } else if (novaSenha !== confirmarNovaSenha) {
        novosErros.confirmarNovaSenha = 'As senhas não coincidem';
      }
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
    setMensagemSucesso('');

    try {
      const dadosAtualizados: any = {
        nome: formData.nome,
        cpf: formData.cpf,
        telefone: formData.telefone
      };
      
      updateUser(dadosAtualizados);
      
      if (mostrarAlterarSenha && user) {
        await alterarSenha(user.id, senhaAtual, novaSenha);
        setMensagemSucesso('Perfil e senha atualizados com sucesso!');
        
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarNovaSenha('');
        setMostrarAlterarSenha(false);
        setForcaSenha(null);
      } else {
        setMensagemSucesso('Perfil atualizado com sucesso!');
      }
      
      setTimeout(() => {
        setMensagemSucesso('');
      }, 3000);
      
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      setErros({ submit: error.response?.data?.error || 'Erro ao atualizar perfil. Tente novamente.' });
    } finally {
      setCarregando(false);
    }
  };

  const handleCancelar = () => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        cpf: user.cpf || '',
        telefone: user.telefone || ''
      });
    }
    setMostrarAlterarSenha(false);
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarNovaSenha('');
    setForcaSenha(null);
    setErros({});
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
    <div>
      <h2 style={styles.title}>Meu Perfil</h2>
      <p style={styles.subtitle}>Gerencie suas informações pessoais</p>

      {mensagemSucesso && (
        <div style={styles.sucesso}>
          {mensagemSucesso}
        </div>
      )}

      {erros.submit && (
        <div style={styles.erro}>
          {erros.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formSection}>
          <h3 style={styles.sectionTitle}>Dados Pessoais</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Nome Completo:*</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              style={{...styles.input, borderColor: erros.nome ? '#dc3545' : '#ddd'}}
              disabled={carregando}
            />
            {erros.nome && <span style={styles.errorText}>{erros.nome}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              style={{...styles.input, backgroundColor: '#f5f5f5'}}
              disabled={true}
            />
            <span style={styles.helperText}>O email não pode ser alterado</span>
          </div>

          <div style={styles.formGroup}>
  <label style={styles.label}>CPF:</label>
  <input
    type="text"
    name="cpf"
    value={formData.cpf}
    style={{...styles.input, backgroundColor: '#f5f5f5'}}
    disabled={true}
    placeholder="000.000.000-00"
  />
  <span style={styles.helperText}>O CPF não pode ser alterado</span>
</div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Telefone:</label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              style={{...styles.input, borderColor: erros.telefone ? '#dc3545' : '#ddd'}}
              disabled={carregando}
              placeholder="(11) 99999-9999"
              maxLength={15}
            />
          </div>
        </div>

        {/* Seção de Alteração de Senha */}
        <div style={styles.formSection}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Alterar Senha</h3>
            <button
              type="button"
              onClick={() => setMostrarAlterarSenha(!mostrarAlterarSenha)}
              style={styles.buttonToggle}
            >
              {mostrarAlterarSenha ? 'Cancelar alteração' : 'Alterar senha'}
            </button>
          </div>

          {mostrarAlterarSenha && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Senha Atual:*</label>
                <input
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  style={{...styles.input, borderColor: erros.senhaAtual ? '#dc3545' : '#ddd'}}
                  disabled={carregando}
                  placeholder="Digite sua senha atual"
                />
                {erros.senhaAtual && <span style={styles.errorText}>{erros.senhaAtual}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nova Senha:*</label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={handleNovaSenhaChange}
                  style={{...styles.input, borderColor: erros.novaSenha ? '#dc3545' : '#ddd'}}
                  disabled={carregando}
                  placeholder="Digite sua nova senha"
                />
                
                {novaSenha && (
                  <div style={styles.forcaContainer}>
                    <div style={styles.forcaLabels}>
                      <span style={styles.forcaLabel}>Força da senha:</span>
                      <span style={{...styles.forcaTexto, color: getForcaCor()}}>
                        {forcaSenha?.forca.toUpperCase()}
                      </span>
                    </div>
                    <div style={styles.forcaBarraBg}>
                      <div 
                        style={{
                          ...styles.forcaBarraPreenchida,
                          width: getForcaLargura(),
                          backgroundColor: getForcaCor()
                        }}
                      />
                    </div>
                    {forcaSenha && (
                      <span style={styles.forcaMensagem}>{forcaSenha.mensagem}</span>
                    )}
                  </div>
                )}
                
                {erros.novaSenha && <span style={styles.errorText}>{erros.novaSenha}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Confirmar Nova Senha:*</label>
                <input
                  type="password"
                  value={confirmarNovaSenha}
                  onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                  style={{...styles.input, borderColor: erros.confirmarNovaSenha ? '#dc3545' : '#ddd'}}
                  disabled={carregando}
                  placeholder="Confirme sua nova senha"
                />
                {erros.confirmarNovaSenha && <span style={styles.errorText}>{erros.confirmarNovaSenha}</span>}
              </div>
            </>
          )}
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleCancelar}
            style={styles.buttonCancelar}
            disabled={carregando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            style={styles.buttonSalvar}
            disabled={carregando}
          >
            {carregando ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  title: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    fontFamily: "Arial, Helvetica, sans-serif",
    color: '#666',
    marginBottom: '24px'
  },
  form: {
    maxWidth: '600px',
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px'
  },
  formSection: {
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #eee'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '18px',
    color: '#333',
    margin: 0
  },
  buttonToggle: {
    backgroundColor: 'transparent',
    color: '#007bff',
    border: '1px solid #007bff',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  formGroup: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    fontFamily: "Arial, Helvetica, sans-serif",
    color: '#333'
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    transition: 'border-color 0.3s'
  },
  helperText: {
    fontSize: '11px',
    fontFamily: "Arial, Helvetica, sans-serif",
    color: '#666',
    marginTop: '4px'
  },
  errorText: {
    color: '#dc3545',
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: '12px',
    marginTop: '4px'
  },
  sucesso: {
    backgroundColor: '#d4edda',
    color: '#155724',
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #c3e6cb'
  },
  erro: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb'
  },
  forcaContainer: {
    marginTop: '8px'
  },
  forcaLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: "Arial, Helvetica, sans-serif",
    marginBottom: '4px'
  },
  forcaLabel: {
    fontSize: '12px',
    color: '#666'
  },
  forcaTexto: {
    fontSize: '12px',
    fontFamily: "Arial, Helvetica, sans-serif",
    fontWeight: 'bold'
  },
  forcaBarraBg: {
    height: '4px',
    backgroundColor: '#e9ecef',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  forcaBarraPreenchida: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  forcaMensagem: {
    fontSize: '11px',
    color: '#666',
    fontFamily: "Arial, Helvetica, sans-serif",
    marginTop: '4px',
    display: 'block'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '24px'
  },
  buttonSalvar: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    flex: 1
  },
  buttonCancelar: {
    backgroundColor: '#6c757d',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    flex: 1
  }
};

export default Perfil;