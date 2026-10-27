import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faWrench, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

interface Orcamento {
  id: number;
  etapa: string;
  descricao: string;
  data_inicio: string;
  data_termino: string;
  departamentos?: { nome: string };
}

interface Veiculo {
  id: number;
  modelo: string;
  placa: string;
  foto: string | null;
  orcamentos: Orcamento[];
}

const ClienteDashboard: React.FC = () => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // O backend deve retornar apenas os veículos do cliente logado
        const response = await api.get('/veiculos');
        setVeiculos(response.data.data || response.data);
      } catch (error) {
        console.error(error);
        setErro('Erro ao carregar os dados dos seus veículos.');
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  if (carregando) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Carregando seus veículos...</div>;
  }

  return (
    <div>
      <h2 style={styles.pageTitle}>Meus Veículos e Serviços</h2>
      
      {erro && <div style={styles.error}>{erro}</div>}

      {veiculos.length === 0 ? (
        <div style={styles.emptyState}>
          <FontAwesomeIcon icon={faCar} size="3x" color="#ccc" />
          <p>Você ainda não possui veículos cadastrados.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {veiculos.map((veiculo) => {
            // Pega o orçamento mais recente (se existir)
            const orcamentoAtual = veiculo.orcamentos && veiculo.orcamentos.length > 0 
              ? veiculo.orcamentos[0] 
              : null;

            return (
              <div key={veiculo.id} style={styles.card}>
                <div style={styles.imageContainer}>
                  {veiculo.foto ? (
                    <img 
                      src={`http://localhost:3000/uploads/${veiculo.foto}`} 
                      alt={veiculo.modelo} 
                      style={styles.image} 
                    />
                  ) : (
                    <div style={styles.imagePlaceholder}>
                      <FontAwesomeIcon icon={faCar} size="2x" color="#aaa" />
                    </div>
                  )}
                </div>
                
                <div style={styles.cardContent}>
                  <h3 style={styles.vehicleName}>{veiculo.modelo}</h3>
                  <p style={styles.plate}>Placa: {veiculo.placa}</p>

                  <hr style={styles.divider} />

                  {orcamentoAtual ? (
                    <div style={styles.serviceInfo}>
                      <h4 style={styles.serviceTitle}>
                        <FontAwesomeIcon icon={faWrench} style={{ marginRight: '8px' }} />
                        Em Atendimento
                      </h4>
                      <p><strong>Departamento:</strong> {orcamentoAtual.departamentos?.nome || 'Não informado'}</p>
                      <p><strong>Etapa:</strong> {orcamentoAtual.etapa || 'Aguardando'}</p>
                      <p><strong>Descrição:</strong> {orcamentoAtual.descricao}</p>
                      <p style={styles.dateInfo}>
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '5px' }} />
                        Entrada: {new Date(orcamentoAtual.data_inicio).toLocaleDateString('pt-BR')} <br/>
                        Previsão de saída: {new Date(orcamentoAtual.data_termino).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ) : (
                    <div style={styles.serviceEmpty}>
                      Nenhum serviço em andamento para este veículo.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  pageTitle: { color: '#333', marginBottom: '20px', fontFamily: 'Arial, sans-serif' },
  error: { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '20px' },
  emptyState: { textAlign: 'center' as const, padding: '50px 20px', color: '#666', backgroundColor: '#f9f9f9', borderRadius: '8px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  imageContainer: { width: '100%', height: '180px', backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%', objectFit: 'cover' as const },
  imagePlaceholder: { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' },
  cardContent: { padding: '15px' },
  vehicleName: { margin: '0 0 5px 0', fontSize: '20px', color: '#2c3e50' },
  plate: { margin: '0', color: '#666', fontSize: '14px', fontWeight: 'bold' },
  divider: { border: '0', borderTop: '1px solid #eee', margin: '15px 0' },
  serviceInfo: { backgroundColor: '#e8f4f8', padding: '10px', borderRadius: '6px', fontSize: '14px', color: '#333' },
  serviceTitle: { margin: '0 0 10px 0', color: '#2980b9', fontSize: '16px' },
  dateInfo: { marginTop: '10px', fontSize: '13px', color: '#555' },
  serviceEmpty: { color: '#888', fontSize: '14px', fontStyle: 'italic', textAlign: 'center' as const }
};

export default ClienteDashboard;