import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { criarCliente, atualizarCliente, buscarClientePorId } from '../services/clienteService';
import { validarCPF, formatarCPF, formatarTelefone, validarEmail } from '../utils/validations';

interface FormData {
  nome: string;
  email: string;
  senha?: string;
  telefone: string;
  cpf: string;
  // cnh foi removido
}

const ClienteForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdicao = !!id;

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    cpf: ''
  });
  
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(isEdicao);

  useEffect(() => {
    if (isEdicao && id) {
      carregarCliente(parseInt(id));
    }
  }, [id, isEdicao]);

  const carregarCliente = async (clienteId: number) => {
    try {
      const cliente = await buscarClientePorId(clienteId);
      if (cliente) {
        setFormData({
          nome: cliente.nome || '',
          email: cliente.email || '',
          telefone: cliente.telefone || '',
          cpf: cliente.cpf ? formatarCPF(cliente.cpf) : ''
          // cnh removido
        });
      } else {
        alert('Cliente não encontrado');
        navigate('/clientes');
      }
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      alert('Erro ao carregar dados do cliente');
    } finally {
      setCarregandoDados(false);
    }
  };

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

  const validarFormulario = (): boolean => {
    const novosErros: { [key: string]: string } = {};

    if (!formData.nome || !formData.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      novosErros.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.email) {
      novosErros.email = 'E-mail é obrigatório';
    } else if (!validarEmail(formData.email)) {
      novosErros.email = 'Digite um e-mail válido';
    }

    if (!isEdicao) {
      if (!formData.senha) {
        novosErros.senha = 'Senha é obrigatória';
      } else if (formData.senha.length < 6) {
        novosErros.senha = 'A senha deve ter pelo menos 6 caracteres';
      }
    }

    if (formData.telefone && formData.telefone.trim()) {
      const telefoneLimpo = formData.telefone.replace(/\D/g, '');
      if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        novosErros.telefone = 'Telefone deve ter 10 ou 11 dígitos (com DDD)';
      }
    }

    if (formData.cpf && formData.cpf.trim()) {
      const cpfNumerico = formData.cpf.replace(/[^\d]/g, '');
      if (cpfNumerico.length !== 11) {
        novosErros.cpf = 'CPF deve ter 11 dígitos';
      } else if (!validarCPF(formData.cpf)) {
        novosErros.cpf = 'CPF inválido';
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

    try {
      const dadosParaEnviar: any = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone || undefined,
        cpf: formData.cpf ? formData.cpf.replace(/[^\d]/g, '') : undefined
        // cnh removido
      };

      if (!isEdicao && formData.senha) {
        dadosParaEnviar.senha = formData.senha;
      }

      if (isEdicao && id) {
        await atualizarCliente(parseInt(id), dadosParaEnviar);
        alert('Cliente atualizado com sucesso!');
      } else {
        await criarCliente(dadosParaEnviar);
        alert('Cliente cadastrado com sucesso!');
      }
      
      navigate('/clientes');
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      alert(error.response?.data?.error || 'Erro ao salvar cliente. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  if (carregandoDados) {
    return <div style={styles.loading}>Carregando dados do cliente...</div>;
  }

  return (
    <div>
      <h2 style={styles.title}>
        {isEdicao ? 'Editar Cliente' : 'Novo Cliente'}
      </h2>

      <form onSubmit={handleSubmit} style={styles.form}>
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
          <label style={styles.label}>E-mail:*</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{...styles.input, borderColor: erros.email ? '#dc3545' : '#ddd'}}
            disabled={carregando}
            placeholder="email@exemplo.com"
          />
          {erros.email && <span style={styles.errorText}>{erros.email}</span>}
        </div>

        {!isEdicao && (
          <div style={styles.formGroup}>
            <label style={styles.label}>Senha de Acesso:*</label>
            <input
              type="password"
              name="senha"
              value={formData.senha || ''}
              onChange={handleChange}
              style={{...styles.input, borderColor: erros.senha ? '#dc3545' : '#ddd'}}
              disabled={carregando}
              placeholder="Mínimo 6 caracteres"
            />
            {erros.senha && <span style={styles.errorText}>{erros.senha}</span>}
            <span style={styles.helperText}>O cliente usará esta senha para logar no sistema.</span>
          </div>
        )}

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
          />
          {erros.telefone && <span style={styles.errorText}>{erros.telefone}</span>}
          <span style={styles.helperText}>Digite apenas números</span>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>CPF:{!isEdicao && ' *'}</label>
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            disabled={isEdicao || carregando}
            style={{...styles.input, borderColor: erros.cpf ? '#dc3545' : '#ddd', backgroundColor: isEdicao ? '#f5f5f5' : 'white'}}
            placeholder="000.000.000-00"
            maxLength={14}
          />
          {erros.cpf && <span style={styles.errorText}>{erros.cpf}</span>}
          {isEdicao && <span style={styles.helperText}>O CPF não pode ser alterado após o cadastro</span>}
          {!isEdicao && <span style={styles.helperText}>Digite apenas números - formatação automática</span>}
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate('/clientes')}
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
            {carregando ? 'Salvando...' : (isEdicao ? 'Atualizar' : 'Cadastrar')}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  title: { marginBottom: '24px', color: '#333' },
  form: { maxWidth: '600px', backgroundColor: 'white', padding: '24px', borderRadius: '8px' },
  formGroup: { marginBottom: '20px', display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  label: { fontSize: '14px', fontWeight: 'bold', fontFamily: "Arial, Helvetica, sans-serif", color: '#333' },
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', transition: 'border-color 0.3s' },
  helperText: { fontSize: '11px', fontFamily: "Arial, Helvetica, sans-serif", color: '#666', marginTop: '4px' },
  errorText: { color: '#dc3545', fontSize: '12px', marginTop: '4px' },
  buttonGroup: { display: 'flex', gap: '10px', marginTop: '24px' },
  buttonSalvar: { backgroundColor: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', flex: 1 },
  buttonCancelar: { backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', flex: 1 },
  loading: { textAlign: 'center' as const, padding: '40px', fontSize: '18px', color: '#666' }
};

export default ClienteForm;