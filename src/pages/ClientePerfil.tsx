import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSave } from '@fortawesome/free-solid-svg-icons';
import { formatarTelefone } from '../utils/validations';

const ClientePerfil: React.FC = () => {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
    cpf: user?.cpf || ''
  });
  
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let valorFormatado = value;
    if (name === 'telefone') {
      valorFormatado = formatarTelefone(value);
    }
    setFormData({ ...formData, [name]: valorFormatado });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      // Envia a atualização para a rota de clientes
      await api.put(`/clientes/${user?.id}`, {
        nome: formData.nome,
        telefone: formData.telefone.replace(/\D/g, ''),
        email: formData.email
      });

      // Atualiza o contexto global (para o nome no menu mudar na hora)
      updateUser({ 
        nome: formData.nome, 
        email: formData.email, 
        telefone: formData.telefone 
      });

      setMensagem({ tipo: 'sucesso', texto: 'Perfil atualizado com sucesso!' });
      
    } catch (error: any) {
      console.error(error);
      setMensagem({ 
        tipo: 'erro', 
        texto: error.response?.data?.error || 'Erro ao atualizar o perfil. Tente novamente.' 
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div>
      <h2 style={styles.title}>
        <FontAwesomeIcon icon={faUser} style={{ marginRight: '10px' }} />
        Meu Perfil
      </h2>

      {mensagem.texto && (
        <div style={mensagem.tipo === 'sucesso' ? styles.success : styles.error}>
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Nome Completo:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            style={styles.input}
            disabled={carregando}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>CPF (Não editável):</label>
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            style={{ ...styles.input, backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
            disabled
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Telefone:</label>
          <input
            type="text"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            style={styles.input}
            disabled={carregando}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>E-mail:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            disabled={carregando}
            required
          />
        </div>

        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.buttonSalvar} disabled={carregando}>
            <FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }} />
            {carregando ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  title: { marginBottom: '24px', color: '#333', display: 'flex', alignItems: 'center' },
  form: { maxWidth: '600px', backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #eee' },
  formGroup: { marginBottom: '20px', display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#333', fontFamily: "Arial, Helvetica, sans-serif" },
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' },
  buttonGroup: { display: 'flex', gap: '10px', marginTop: '24px' },
  buttonSalvar: { backgroundColor: '#2980b9', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' },
  success: { backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #c3e6cb' },
  error: { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #f5c6cb' }
};

export default ClientePerfil;