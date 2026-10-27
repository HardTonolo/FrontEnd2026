import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { criarOrdemServico, atualizarOrdemServico, buscarOrdemServicoPorId } from '../services/ordemServicoService';
import { listarClientes } from '../services/clienteService';
import { buscarVeiculosPorCliente } from '../services/veiculoService';
import { listarDepartamentos } from '../services/departamentoService';
import { Cliente } from '../types/cliente';
import { Veiculo } from '../types/veiculo';
import { Departamento } from '../types/departamento';

type StatusType = 'orçamento' | 'em_andamento' | 'concluido' | 'aguardando_retirada';

interface FormData {
  clienteId: number;
  veiculoId: number;
  departamentoId: number;
  dataEntrada: string;
  dataPrevisao: string;
  servicosRealizar: string;
  status: StatusType;
}

const OrdemServicoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdicao = !!id;

  const [formData, setFormData] = useState<FormData>({
    clienteId: 0,
    veiculoId: 0,
    departamentoId: 0,
    dataEntrada: new Date().toISOString().split('T')[0],
    dataPrevisao: '',
    servicosRealizar: '',
    status: 'orçamento'
  });
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculosFiltrados, setVeiculosFiltrados] = useState<Veiculo[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const carregarDadosIniciais = async () => {
    try {
      const [clientesResponse, departamentosResponse] = await Promise.all([
        listarClientes(1, 1000),
        listarDepartamentos()
      ]);
      
      setClientes(clientesResponse.dados);
      setDepartamentos(departamentosResponse);

      if (isEdicao && id) {
        const ordem = await buscarOrdemServicoPorId(parseInt(id));
        if (ordem) {
          setFormData({
            clienteId: ordem.clienteId || 0,
            veiculoId: ordem.veiculoId || 0,
            departamentoId: ordem.departamentoId || 0,
            dataEntrada: ordem.dataEntrada || '',
            dataPrevisao: ordem.dataPrevisao || '',
            servicosRealizar: ordem.servicosRealizar || '',
            status: (ordem.status as StatusType) || 'orçamento'
          });

          if (ordem.clienteId) {
            const veiculosDoCliente = await buscarVeiculosPorCliente(ordem.clienteId);
            setVeiculosFiltrados(veiculosDoCliente);
          }
        } else {
          alert('Ordem de serviço não encontrada');
          navigate('/ordens-servico');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados iniciais');
    } finally {
      setCarregandoDados(false);
    }
  };

  const handleClienteChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clienteId = parseInt(e.target.value);
    setFormData({ ...formData, clienteId, veiculoId: 0 });
    
    if (clienteId > 0) {
      try {
        const veiculosDoCliente = await buscarVeiculosPorCliente(clienteId);
        setVeiculosFiltrados(veiculosDoCliente);
      } catch (error) {
        console.error('Erro ao buscar veículos do cliente:', error);
        setVeiculosFiltrados([]);
      }
    } else {
      setVeiculosFiltrados([]);
    }
    
    if (erros.clienteId) {
      setErros({ ...erros, clienteId: '' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // CORREÇÃO: Converte para número se for um campo de ID
    let valorFormatado: any = value;
    if (name === 'veiculoId' || name === 'departamentoId') {
      valorFormatado = Number(value);
    }

    setFormData({ ...formData, [name]: valorFormatado });
    
    if (erros[name]) {
      setErros({ ...erros, [name]: '' });
    }
  };

  const validarFormulario = (): boolean => {
    const novosErros: { [key: string]: string } = {};

    if (!formData.clienteId || formData.clienteId === 0) novosErros.clienteId = 'Selecione um cliente';
    if (!formData.veiculoId || formData.veiculoId === 0) novosErros.veiculoId = 'Selecione um veículo';
    if (!formData.departamentoId || formData.departamentoId === 0) novosErros.departamentoId = 'Selecione um departamento';
    if (!formData.dataEntrada) novosErros.dataEntrada = 'Data de entrada é obrigatória';
    
    if (!formData.dataPrevisao) {
      novosErros.dataPrevisao = 'Data de previsão é obrigatória';
    } else if (formData.dataEntrada) {
      const entrada = new Date(formData.dataEntrada);
      const previsao = new Date(formData.dataPrevisao);
      if (previsao < entrada) novosErros.dataPrevisao = 'A previsão não pode ser anterior à entrada';
    }
    
    if (!formData.servicosRealizar || !formData.servicosRealizar.trim()) {
      novosErros.servicosRealizar = 'Descreva os serviços a realizar';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setCarregando(true);

    try {
      // Forçando todos os IDs a serem números por segurança
      const dadosParaEnviar = {
        clienteId: Number(formData.clienteId),
        veiculoId: Number(formData.veiculoId),
        departamentoId: Number(formData.departamentoId),
        dataEntrada: formData.dataEntrada,
        dataPrevisao: formData.dataPrevisao,
        servicosRealizar: formData.servicosRealizar,
        status: formData.status
      };

      if (isEdicao && id) {
        await atualizarOrdemServico(parseInt(id), dadosParaEnviar as any);
        alert('Ordem de serviço atualizada com sucesso!');
      } else {
        await criarOrdemServico(dadosParaEnviar as any);
        alert('Ordem de serviço criada com sucesso!');
      }
      
      navigate('/ordens-servico');
    } catch (error: any) {
      console.error('Erro ao salvar ordem:', error);
      alert(error.response?.data?.error || 'Erro ao salvar ordem de serviço. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  if (carregandoDados) {
    return <div style={styles.loading}>Carregando dados...</div>;
  }

  return (
    <div>
      <h2 style={styles.title}>
        {isEdicao ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
      </h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Cliente:*</label>
            <select
              name="clienteId"
              value={formData.clienteId}
              onChange={handleClienteChange}
              style={{...styles.select, borderColor: erros.clienteId ? '#dc3545' : '#ddd'}}
              disabled={carregando}
            >
              <option value={0}>Selecione um cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
              ))}
            </select>
            {erros.clienteId && <span style={styles.errorText}>{erros.clienteId}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Veículo:*</label>
            <select
              name="veiculoId"
              value={formData.veiculoId}
              onChange={handleChange}
              style={{...styles.select, borderColor: erros.veiculoId ? '#dc3545' : '#ddd'}}
              disabled={carregando || !formData.clienteId}
            >
              <option value={0}>
                {formData.clienteId ? 'Selecione um veículo' : 'Selecione um cliente primeiro'}
              </option>
              {veiculosFiltrados.map(veiculo => (
                <option key={veiculo.id} value={veiculo.id}>{veiculo.placa} - {veiculo.modelo}</option>
              ))}
            </select>
            {erros.veiculoId && <span style={styles.errorText}>{erros.veiculoId}</span>}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Departamento:*</label>
          <select
            name="departamentoId"
            value={formData.departamentoId}
            onChange={handleChange}
            style={{...styles.select, borderColor: erros.departamentoId ? '#dc3545' : '#ddd'}}
            disabled={carregando}
          >
            <option value={0}>Selecione um departamento</option>
            {departamentos.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.nome}</option>
            ))}
          </select>
          {erros.departamentoId && <span style={styles.errorText}>{erros.departamentoId}</span>}
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Data de Entrada:*</label>
            <input
              type="date"
              name="dataEntrada"
              value={formData.dataEntrada}
              onChange={handleChange}
              style={{...styles.input, borderColor: erros.dataEntrada ? '#dc3545' : '#ddd'}}
              disabled={carregando}
            />
            {erros.dataEntrada && <span style={styles.errorText}>{erros.dataEntrada}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Previsão de Saída:*</label>
            <input
              type="date"
              name="dataPrevisao"
              value={formData.dataPrevisao}
              onChange={handleChange}
              style={{...styles.input, borderColor: erros.dataPrevisao ? '#dc3545' : '#ddd'}}
              disabled={carregando}
            />
            {erros.dataPrevisao && <span style={styles.errorText}>{erros.dataPrevisao}</span>}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Status / Etapa:*</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={styles.select}
            disabled={carregando}
          >
            <option value="orçamento">ORÇAMENTO</option>
            <option value="em_andamento">EM ANDAMENTO</option>
            <option value="concluido">CONCLUÍDO</option>
            <option value="aguardando_retirada">AGUARDANDO RETIRADA</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Descrição dos Serviços:*</label>
          <textarea
            name="servicosRealizar"
            value={formData.servicosRealizar}
            onChange={handleChange}
            style={{...styles.textarea, borderColor: erros.servicosRealizar ? '#dc3545' : '#ddd'}}
            disabled={carregando}
            rows={4}
            placeholder="Descreva os serviços que serão realizados..."
          />
          {erros.servicosRealizar && <span style={styles.errorText}>{erros.servicosRealizar}</span>}
        </div>

        <div style={styles.buttonGroup}>
          <button type="button" onClick={() => navigate('/ordens-servico')} style={styles.buttonCancelar} disabled={carregando}>
            Cancelar
          </button>
          <button type="submit" style={styles.buttonSalvar} disabled={carregando}>
            {carregando ? 'Salvando...' : (isEdicao ? 'Atualizar' : 'Cadastrar')}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  title: { fontSize: '24px', color: '#333', marginBottom: '24px' },
  form: { maxWidth: '800px', backgroundColor: 'white', padding: '24px', borderRadius: '8px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' },
  formGroup: { marginBottom: '20px', display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  label: { fontSize: '14px', fontWeight: 'bold', fontFamily: "Arial, Helvetica, sans-serif", color: '#333' },
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' },
  select: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', backgroundColor: 'white' },
  textarea: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', fontFamily: "Arial, Helvetica, sans-serif", resize: 'vertical' as const },
  errorText: { color: '#dc3545', fontSize: '12px', marginTop: '4px' },
  buttonGroup: { display: 'flex', gap: '10px', marginTop: '24px' },
  buttonSalvar: { backgroundColor: '#28a745', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', flex: 1 },
  buttonCancelar: { backgroundColor: '#6c757d', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', flex: 1 },
  loading: { textAlign: 'center' as const, padding: '40px', fontSize: '18px', color: '#666' }
};

export default OrdemServicoForm;