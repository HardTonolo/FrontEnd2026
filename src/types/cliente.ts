export interface Cliente {
  id: number;
  nome: string;
  email?: string;  // Opcional - front-end usa mas back-end não tem
  telefone: string | null;
  cpf: string | null;
  cnh: string | null;
  endereco?: string;  // Opcional - front-end usa mas back-end não tem
  dataCadastro?: string;
  criado_em: string;
  atualizado_em: string;
  deletado_em: string | null;
}

export interface ClienteFormData {
  nome: string;
  telefone?: string;
  cpf?: string;
  cnh?: string;
}