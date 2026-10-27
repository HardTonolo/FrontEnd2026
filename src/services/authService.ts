import api from './api';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  permissao: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface LoginResponse {
  usuario: Usuario;
  token: string;
}

export interface CadastroResponse {
  data: Usuario;
  message: string;
}

// Login do usuário
export const login = async (email: string, senha: string): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', { email, senha });
  return response.data;
};

// Cadastro de novo usuário (Agora aponta para a rota pública de clientes)
export const cadastrarUsuario = async (dados: {
  nome: string;
  email: string;
  senha: string;
  cpf?: string;
  telefone?: string;
}): Promise<CadastroResponse> => {
  const response = await api.post('/clientes', dados); // <-- CORRIGIDO AQUI
  return response.data;
};

// Buscar dados do usuário logado
export const buscarUsuarioLogado = async (): Promise<Usuario> => {
  const response = await api.get('/usuarios/me');
  return response.data.data || response.data;
};

// Alterar senha do usuário
export const alterarSenha = async (id: number, senhaAtual: string, novaSenha: string): Promise<{ message: string }> => {
  const response = await api.put(`/usuarios/${id}/senha`, { senhaAtual, novaSenha });
  return response.data;
};