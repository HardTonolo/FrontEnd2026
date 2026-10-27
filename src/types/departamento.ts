export interface Departamento {
  id: number;
  nome: string;
  descricao: string | null;
  cor: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  deletado_em: string | null;
}

export interface DepartamentoFormData {
  nome: string;
  descricao?: string;
  cor?: string;
}