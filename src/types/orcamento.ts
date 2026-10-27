export interface Orcamento {
  id: number;
  etapa: string | null;
  valor_inicial: string | null;
  valor_final: string | null;
  data_inicio: string | null;
  data_termino: string | null;
  descricao: string | null;
  id_usuario: number | null;
  id_cliente: number | null;
  id_veiculo: number | null;
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
  veiculos?: {
    id: number;
    placa: string;
    modelo: string;
    id_cliente: number | null;
  };
  usuarios?: {
    id: number;
    nome: string;
    email: string;
  };
}

export interface OrcamentoFormData {
  etapa?: string;
  valor_inicial?: string;
  valor_final?: string;
  data_inicio?: string;
  data_termino?: string;
  descricao?: string;
  id_cliente: number;
  id_veiculo: number;
}