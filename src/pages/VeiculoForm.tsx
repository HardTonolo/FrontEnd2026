import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { buscarVeiculoPorId } from '../services/veiculoService';

interface FormData {
  placa: string;
  modelo: string;
}

const VeiculoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isEdicao = !!id;

  const [formData, setFormData] = useState<FormData>({
    placa: '',
    modelo: ''
  });
  
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>('');
  
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(isEdicao);

  useEffect(() => {
    if (isEdicao && id) {
      carregarVeiculo(parseInt(id));
    }
  }, [id, isEdicao]);

  const carregarVeiculo = async (veiculoId: number) => {
    try {
      const veiculo = await buscarVeiculoPorId(veiculoId);
      if (veiculo) {
        setFormData({
          placa: veiculo.placa || '',
          modelo: veiculo.modelo || ''
        });
        if (veiculo.foto) {
          setFotoPreview(`http://localhost:3000/uploads/${veiculo.foto}`);
        }
      } else {
        alert('Veículo não encontrado');
        navigate('/cliente/veiculos');
      }
    } catch (error) {
      console.error('Erro ao carregar veículo:', error);
      alert('Erro ao carregar dados do veículo');
    } finally {
      setCarregandoDados(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let valorFormatado = value;
    
    if (name === 'placa') {
      // Deixa em maiúsculo e remove caracteres que não sejam letras ou números
      valorFormatado = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }
    
    setFormData({ ...formData, [name]: valorFormatado });
    
    if (erros[name]) {
      setErros({ ...erros, [name]: '' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        setErros({ ...erros, foto: 'A imagem não pode passar de 5MB.' });
        return;
      }

      setFoto(file);
      setFotoPreview(URL.createObjectURL(file));
      setErros({ ...erros, foto: '' });
    }
  };

  const validarPlaca = (placa: string) => {
    // Limpa a placa (remove hífens e espaços) e deixa maiúscula
    const placaLimpa = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Padrão antigo: 3 letras e 4 números (ex: ABC1234)
    const padraoAntigo = /^[A-Z]{3}[0-9]{4}$/;
    // Padrão Mercosul: 3 letras, 1 número, 1 letra, 2 números (ex: ABC1D23)
    const padraoMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
    
    return padraoAntigo.test(placaLimpa) || padraoMercosul.test(placaLimpa);
  };

  const validarFormulario = (): boolean => {
    const novosErros: { [key: string]: string } = {};

    if (!formData.modelo || !formData.modelo.trim()) {
      novosErros.modelo = 'Modelo é obrigatório';
    }

    if (!formData.placa || !formData.placa.trim()) {
      novosErros.placa = 'Placa é obrigatória';
    } else if (!validarPlaca(formData.placa)) {
      novosErros.placa = 'Placa inválida. Use o formato ABC1234 ou ABC1D23';
    }

    if (!isEdicao && !foto) {
      novosErros.foto = 'A imagem do veículo é obrigatória para o cadastro';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setCarregando(true);

    try {
      const placaLimpa = formData.placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

      const dadosParaEnviar = new FormData();
      dadosParaEnviar.append('placa', placaLimpa);
      dadosParaEnviar.append('modelo', formData.modelo);
      
      if (user?.id) {
        dadosParaEnviar.append('id_cliente', user.id.toString());
      }

      if (foto) {
        dadosParaEnviar.append('foto', foto);
      }

      if (isEdicao && id) {
        await api.put(`/veiculos/${id}`, dadosParaEnviar, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Veículo atualizado com sucesso!');
      } else {
        await api.post('/veiculos', dadosParaEnviar, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Veículo cadastrado com sucesso!');
      }
      
      navigate('/cliente/veiculos');
    } catch (error: any) {
      console.error('Erro ao salvar veículo:', error);
      alert(error.response?.data?.error || 'Erro ao salvar veículo. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  if (carregandoDados) {
    return <div style={styles.loading}>Carregando dados do veículo...</div>;
  }

  return (
    <div>
      <h2 style={styles.title}>
        {isEdicao ? 'Editar Veículo' : 'Novo Veículo'}
      </h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Modelo do Veículo:*</label>
          <input
            type="text"
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
            style={{...styles.input, borderColor: erros.modelo ? '#dc3545' : '#ddd'}}
            disabled={carregando}
            placeholder="Ex: Civic, Corolla, Onix"
          />
          {erros.modelo && <span style={styles.errorText}>{erros.modelo}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Placa:*</label>
          <input
            type="text"
            name="placa"
            value={formData.placa}
            onChange={handleChange}
            style={{...styles.input, borderColor: erros.placa ? '#dc3545' : '#ddd'}}
            disabled={carregando}
            placeholder="ABC1234 ou ABC1D23"
            maxLength={8}
          />
          {erros.placa && <span style={styles.errorText}>{erros.placa}</span>}
          <span style={styles.helperText}>Formatos aceitos: ABC1234 (antigo) ou ABC1D23 (Mercosul). O hífen é ignorado.</span>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Foto do Veículo {(!isEdicao) && '*'}</label>
          
          {fotoPreview && (
            <div style={{ marginBottom: '10px' }}>
              <img src={fotoPreview} alt="Preview" style={{ width: '200px', borderRadius: '8px', objectFit: 'cover' }} />
            </div>
          )}

          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleFileChange}
            style={{...styles.input, borderColor: erros.foto ? '#dc3545' : '#ddd', padding: '8px'}}
            disabled={carregando}
          />
          {erros.foto && <span style={styles.errorText}>{erros.foto}</span>}
          <span style={styles.helperText}>Tamanho máximo: 5MB. Formatos: JPG, PNG, WEBP.</span>
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate('/cliente/veiculos')}
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
            {carregando ? 'Salvando...' : (isEdicao ? 'Atualizar Veículo' : 'Cadastrar Veículo')}
          </button>
        </div>
      </form>
    </div>
  );
};

// (Os estilos continuam os mesmos que você já tinha)
const styles = {
  title: { marginBottom: '24px', color: '#333' },
  form: { maxWidth: '600px', backgroundColor: 'white', padding: '24px', borderRadius: '8px' },
  formGroup: { marginBottom: '20px', display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#333', fontFamily: "Arial, Helvetica, sans-serif" },
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', transition: 'border-color 0.3s' },
  helperText: { fontSize: '11px', color: '#666', marginTop: '4px', fontFamily: "Arial, Helvetica, sans-serif" },
  errorText: { color: '#dc3545', fontSize: '12px', marginTop: '4px' },
  buttonGroup: { display: 'flex', gap: '10px', marginTop: '24px' },
  buttonSalvar: { backgroundColor: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', flex: 1 },
  buttonCancelar: { backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', flex: 1 },
  loading: { textAlign: 'center' as const, padding: '40px', fontSize: '18px', color: '#666' }
};

export default VeiculoForm;