export interface User {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  permissao?: string; // <-- Adicionado
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}