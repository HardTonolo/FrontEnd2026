import api from './api';
import { Veiculo, VeiculoFormData } from '../types/veiculo';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Listar veículos com paginação
export const listarVeiculos = async (
  pagina: number = 1,
  itensPorPagina: number = 5
): Promise<{ dados: Veiculo[]; total: number }> => {
  const response = await api.get<PaginatedResponse<Veiculo>>('/veiculos', {
    params: { page: pagina, limit: itensPorPagina }
  });
  
  return {
    dados: response.data.data,
    total: response.data.total
  };
};

// Listar todos os veículos (sem paginação)
export const listarTodosVeiculos = async (): Promise<Veiculo[]> => {
  const response = await api.get<PaginatedResponse<Veiculo>>('/veiculos', {
    params: { limit: 1000 }
  });
  return response.data.data;
};

// Buscar veículo por ID
export const buscarVeiculoPorId = async (id: number): Promise<Veiculo | null> => {
  const response = await api.get(`/veiculos/${id}`);
  return response.data.data || response.data;
};

// Buscar veículos por cliente
export const buscarVeiculosPorCliente = async (clienteId: number): Promise<Veiculo[]> => {
  const response = await api.get<PaginatedResponse<Veiculo>>('/veiculos', {
    params: { limit: 1000 }
  });
  // Filtra os veículos pelo clienteId
  return response.data.data.filter(veiculo => veiculo.id_cliente === clienteId);
};

// Criar veículo
export const criarVeiculo = async (dados: VeiculoFormData): Promise<Veiculo> => {
  const response = await api.post('/veiculos', dados);
  return response.data.data || response.data;
};

// Atualizar veículo
export const atualizarVeiculo = async (id: number, dados: Partial<VeiculoFormData>): Promise<Veiculo> => {
  const response = await api.put(`/veiculos/${id}`, dados);
  return response.data.data || response.data;
};

// Deletar veículo (soft delete)
export const deletarVeiculo = async (id: number): Promise<void> => {
  await api.delete(`/veiculos/${id}`);
};