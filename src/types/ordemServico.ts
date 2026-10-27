import { Cliente } from './cliente';
import { Veiculo } from './veiculo';
import { Departamento } from './departamento';

export interface OrdemServico {
  id: number;
  numeroOS: string;
  clienteId: number;
  cliente?: Cliente;
  veiculoId: number;
  veiculo?: Veiculo;
  departamentoId: number;
  departamento?: Departamento;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cor: string;
  dataEntrada: string;
  dataPrevisao: string;
  dataConclusao?: string;
  status: 'orçamento' | 'em_andamento' | 'concluido' | 'aguardando_retirada';
  servicosRealizar: string;
  observacoes: string;
  consultorResponsavel: string;
  fotos?: string[];
  tempoDecorrido?: number;
}

// Interface enxuta: Apenas o que o formulário envia para o Service
export interface OrdemServicoFormData {
  clienteId: number;
  veiculoId: number;
  departamentoId: number;
  dataEntrada: string;
  dataPrevisao: string;
  servicosRealizar: string;
  status: 'orçamento' | 'em_andamento' | 'concluido' | 'aguardando_retirada';
}