import api from './api';
import { Departamento, DepartamentoFormData } from '../types/departamento';

// Listar todos os departamentos ativos
export const listarDepartamentos = async (): Promise<Departamento[]> => {
  try {
    const response = await api.get('/departamentos');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Erro ao carregar departamentos:', error);
    // Fallback para mock caso a API falhe
    return [
      { id: 1, nome: 'Funilaria', descricao: 'Reparos de lataria', cor: '#dc3545', ativo: true, criado_em: '', atualizado_em: '', deletado_em: null },
      { id: 2, nome: 'Pintura', descricao: 'Pintura automotiva', cor: '#28a745', ativo: true, criado_em: '', atualizado_em: '', deletado_em: null },
      { id: 3, nome: 'Mecânica', descricao: 'Serviços mecânicos', cor: '#007bff', ativo: true, criado_em: '', atualizado_em: '', deletado_em: null },
      { id: 4, nome: 'Auto Santos', descricao: 'Serviços especializados', cor: '#ffc107', ativo: true, criado_em: '', atualizado_em: '', deletado_em: null },
      { id: 5, nome: 'Maquinaria', descricao: 'Máquinas pesadas', cor: '#6c757d', ativo: true, criado_em: '', atualizado_em: '', deletado_em: null }
    ];
  }
};

// Buscar departamento por ID
export const buscarDepartamentoPorId = async (id: number): Promise<Departamento | null> => {
  try {
    const response = await api.get(`/departamentos/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Erro ao buscar departamento:', error);
    return null;
  }
};

// Criar novo departamento
export const criarDepartamento = async (dados: DepartamentoFormData): Promise<Departamento> => {
  const response = await api.post('/departamentos', dados);
  return response.data.data || response.data;
};

// Atualizar departamento
export const atualizarDepartamento = async (id: number, dados: Partial<DepartamentoFormData>): Promise<Departamento> => {
  const response = await api.put(`/departamentos/${id}`, dados);
  return response.data.data || response.data;
};

// Deletar departamento
export const deletarDepartamento = async (id: number): Promise<void> => {
  await api.delete(`/departamentos/${id}`);
};