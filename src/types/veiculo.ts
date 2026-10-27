export interface Veiculo {
  id: number;
  placa: string;
  modelo: string;
  marca?: string;
  ano?: number;
  cor?: string;
  id_cliente: number | null;
  id_usuario: number | null;
  id_departamento: number | null;
  observacoes?: string;
  foto?: string | null; // <-- ADICIONADO AQUI
  criado_em: string;
  atualizado_em: string;
  deletado_em: string | null;
  // Campos relacionados (populados pelo Prisma quando usado include)
  clientes?: {
    id: number;
    nome: string;
    telefone: string | null;
    cpf: string | null;
  };
  usuarios?: {
    id: number;
    nome: string;
    email: string;
  };
  departamentos?: {
    id: number;
    nome: string;
  };
}

export interface VeiculoFormData {
  placa: string;
  modelo: string;
  id_cliente?: number;
  id_usuario?: number;
  id_departamento?: number;
}