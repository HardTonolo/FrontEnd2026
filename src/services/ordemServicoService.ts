import api from './api';
import { OrdemServico, OrdemServicoFormData } from '../types/ordemServico';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const formatarDataLocal = (data: string | null): string => {
  if (!data) return '';
  const parteData = data.split('T')[0];
  return parteData;
};

const mapearOrcamentoParaOrdemServico = (orcamento: any): OrdemServico => {
  const dataEntradaRaw = orcamento.data_inicio ? formatarDataLocal(orcamento.data_inicio) : new Date().toISOString().split('T')[0];
  const dataPrevisaoRaw = orcamento.data_termino ? formatarDataLocal(orcamento.data_termino) : '';
  
  return {
    id: orcamento.id,
    numeroOS: `OS-${orcamento.id}`,
    clienteId: orcamento.id_cliente,
    cliente: orcamento.clientes ? {
      id: orcamento.clientes.id,
      nome: orcamento.clientes.nome || '',
      telefone: orcamento.clientes.telefone || 'Não informado',
      cpf: orcamento.clientes.cpf || '',
      cnh: '',
      criado_em: orcamento.criado_em || '',
      atualizado_em: orcamento.atualizado_em || '',
      deletado_em: null
    } : undefined,
    veiculoId: orcamento.id_veiculo,
    veiculo: orcamento.veiculos ? {
      id: orcamento.veiculos.id,
      placa: orcamento.veiculos.placa || '',
      modelo: orcamento.veiculos.modelo || '',
      foto: orcamento.veiculos.foto || null, // <-- CORRIGIDO AQUI
      marca: '',
      ano: new Date().getFullYear(),
      cor: '',
      id_cliente: orcamento.veiculos.id_cliente || 0,
      id_usuario: null,
      id_departamento: orcamento.id_departamento || 1,
      criado_em: orcamento.criado_em || '',
      atualizado_em: orcamento.atualizado_em || '',
      deletado_em: null
    } : undefined,
    departamentoId: orcamento.id_departamento || 1,
    departamento: orcamento.departamentos ? {
      id: orcamento.departamentos.id,
      nome: orcamento.departamentos.nome,
      descricao: orcamento.departamentos.descricao || '',
      cor: orcamento.departamentos.cor || '#6c757d',
      ativo: true,
      criado_em: orcamento.departamentos.criado_em || '',
      atualizado_em: orcamento.departamentos.atualizado_em || '',
      deletado_em: null
    } : undefined,
    placa: orcamento.veiculos?.placa || '',
    modelo: orcamento.veiculos?.modelo || '',
    marca: '',
    ano: new Date().getFullYear(),
    cor: '',
    dataEntrada: dataEntradaRaw,
    dataPrevisao: dataPrevisaoRaw,
    status: orcamento.etapa === 'concluido' ? 'concluido' : 
            orcamento.etapa === 'aguardando_retirada' ? 'aguardando_retirada' : 
            orcamento.etapa === 'orçamento' ? 'orçamento' : 'em_andamento',
    servicosRealizar: orcamento.descricao || '',
    observacoes: '',
    consultorResponsavel: orcamento.usuarios?.nome || 'Sistema'
  };
};

const mapearOrdemServicoParaOrcamento = (dados: OrdemServicoFormData): any => {
  const dataEntrada = dados.dataEntrada ? `${dados.dataEntrada}T00:00:00.000Z` : new Date().toISOString();
  const dataPrevisao = dados.dataPrevisao ? `${dados.dataPrevisao}T00:00:00.000Z` : null;
  
  return {
    id_cliente: dados.clienteId,
    id_veiculo: dados.veiculoId,
    id_departamento: Number(dados.departamentoId),
    etapa: dados.status,
    descricao: dados.servicosRealizar,
    data_inicio: dataEntrada,
    data_termino: dataPrevisao,
    valor_inicial: null,
    valor_final: null
  };
};

export const listarOrdensServico = async (
  pagina: number = 1,
  itensPorPagina: number = 5,
  filtroDepartamento?: number,
  filtroStatus?: string,
  busca?: string
): Promise<{ dados: OrdemServico[]; total: number }> => {
  
  const params: any = { 
    page: pagina, 
    limit: itensPorPagina 
  };
  
  if (filtroStatus && filtroStatus !== 'todas') {
    params.etapa = filtroStatus;
  }

  if (filtroDepartamento && filtroDepartamento > 0) {
    params.id_departamento = filtroDepartamento;
  }

  if (busca && busca.trim() !== '') {
    params.busca = busca.trim();
  }
  
  const response = await api.get<PaginatedResponse<any>>('/orcamentos', { params });
  
  return {
    dados: response.data.data.map(mapearOrcamentoParaOrdemServico),
    total: response.data.total 
  };
};

export const listarTodasOrdensServico = async (): Promise<OrdemServico[]> => {
  const response = await api.get<PaginatedResponse<any>>('/orcamentos', { params: { limit: 1000 } });
  return response.data.data.map(mapearOrcamentoParaOrdemServico);
};

export const buscarOrdemServicoPorId = async (id: number): Promise<OrdemServico | null> => {
  const response = await api.get(`/orcamentos/${id}`);
  const orcamento = response.data.data || response.data;
  return mapearOrcamentoParaOrdemServico(orcamento);
};

export const criarOrdemServico = async (dados: OrdemServicoFormData): Promise<OrdemServico> => {
  const payload = mapearOrdemServicoParaOrcamento(dados);
  const response = await api.post('/orcamentos', payload);
  return mapearOrcamentoParaOrdemServico(response.data.data || response.data);
};

export const atualizarOrdemServico = async (id: number, dados: Partial<OrdemServicoFormData>): Promise<OrdemServico> => {
  const payload: any = {};
  
  if (dados.clienteId) payload.id_cliente = dados.clienteId;
  if (dados.veiculoId) payload.id_veiculo = dados.veiculoId;
  if (dados.departamentoId) payload.id_departamento = Number(dados.departamentoId);
  if (dados.status) payload.etapa = dados.status;
  if (dados.servicosRealizar) payload.descricao = dados.servicosRealizar;
  
  if (dados.dataEntrada) {
    payload.data_inicio = `${dados.dataEntrada}T00:00:00.000Z`;
  }
  if (dados.dataPrevisao) {
    payload.data_termino = `${dados.dataPrevisao}T00:00:00.000Z`;
  }
  
  const response = await api.put(`/orcamentos/${id}`, payload);
  return mapearOrcamentoParaOrdemServico(response.data.data || response.data);
};

export const deletarOrdemServico = async (id: number): Promise<void> => {
  await api.delete(`/orcamentos/${id}`);
};