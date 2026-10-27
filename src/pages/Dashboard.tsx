import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarClientes } from '../services/clienteService';
import { listarTodosVeiculos } from '../services/veiculoService';
import { listarTodasOrdensServico } from '../services/ordemServicoService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faTools, faClock, faCheck, faUser, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalVeiculos, setTotalVeiculos] = useState(0);
  const [totalOrdens, setTotalOrdens] = useState(0);
  const [emAndamento, setEmAndamento] = useState(0);
  const [concluido, setConcluido] = useState(0);
  const [aguardandoRetirada, setAguardandoRetirada] = useState(0);
  const [ordensRecentes, setOrdensRecentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    setLoading(true);
    try {
      const clientesResponse = await listarClientes(1, 1000);
      setTotalClientes(clientesResponse.total);

      const veiculosResponse = await listarTodosVeiculos();
      setTotalVeiculos(veiculosResponse.length);

      const ordens = await listarTodasOrdensServico();
      setTotalOrdens(ordens.length);
      
      // Contadores por status
      setEmAndamento(ordens.filter(o => o.status === 'em_andamento').length);
      setConcluido(ordens.filter(o => o.status === 'concluido').length);
      setAguardandoRetirada(ordens.filter(o => o.status === 'aguardando_retirada').length);

      // Pega as 5 ordens mais recentes para exibir no dashboard
      // (Como a listagem já vem ordenada por criado_em desc, pegamos os primeiros)
      setOrdensRecentes(ordens.slice(0, 5));
      
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'orçamento': return '#17a2b8';
      case 'em_andamento': return '#ffc107';
      case 'concluido': return '#28a745';
      case 'aguardando_retirada': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusTexto = (status: string) => {
    switch (status) {
      case 'orçamento': return 'Orçamento';
      case 'em_andamento': return 'Em Andamento';
      case 'concluido': return 'Concluído';
      case 'aguardando_retirada': return 'Aguardando Retirada';
      default: return status;
    }
  };

  const formatarData = (data: string) => {
    if (!data) return '--/--/----';
    const [ano, mes, dia] = data.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
  };

  if (loading) {
    return <div style={styles.loading}>Carregando estatísticas...</div>;
  }

  return (
    <div>
      <h2 style={styles.title}>PAINEL DE CONTROLE</h2>
      <p style={styles.subtitle}>Acompanhe os veículos e ordens de serviço em tempo real</p>

      {/* CARDS DE INDICADORES */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardIcon}>
            <FontAwesomeIcon icon={faCar} color="#2c3e50"/>
          </div>
          <div style={styles.cardContent}>
            <h3 style={styles.cardTitle}>Total de Veículos</h3>
            <p style={styles.cardValue}>{totalVeiculos}</p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>
            <FontAwesomeIcon icon={faTools} color="#2c3e50"/>
          </div>
          <div style={styles.cardContent}>
            <h3 style={styles.cardTitle}>Em Andamento</h3>
            <p style={styles.cardValue}>{emAndamento}</p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>
            <FontAwesomeIcon icon={faCheck} color="#2c3e50"/>
          </div>
          <div style={styles.cardContent}>
            <h3 style={styles.cardTitle}>Concluído</h3>
            <p style={styles.cardValue}>{concluido}</p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>
            <FontAwesomeIcon icon={faClock} color="#2c3e50"/>
          </div>
          <div style={styles.cardContent}>
            <h3 style={styles.cardTitle}>Aguardando Retirada</h3>
            <p style={styles.cardValue}>{aguardandoRetirada}</p>
          </div>
        </div>
      </div>

      {/* LISTA DE ORDENS RECENTES */}
      <div style={styles.recentSection}>
        <div style={styles.recentHeader}>
          <h3 style={styles.recentTitle}>Ordens de Serviço Recentes</h3>
          <button onClick={() => navigate('/ordens-servico')} style={styles.buttonVerTodas}>
            Ver Todas
          </button>
        </div>

        {ordensRecentes.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Nenhuma ordem de serviço cadastrada ainda.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Veículo</th>
                  <th>Cliente</th>
                  <th>Departamento</th>
                  <th>Entrada</th>
                  <th>Previsão</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ordensRecentes.map((ordem) => (
                  <tr key={ordem.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {ordem.veiculo?.foto || ordem.veiculos?.foto ? (
                          <img 
                            src={`http://localhost:3000/uploads/${ordem.veiculo?.foto || ordem.veiculos?.foto}`} 
                            alt="Foto" 
                            style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} 
                          />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faCar} color="#aaa" />
                          </div>
                        )}
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 'bold' }}>{ordem.veiculo?.placa || ordem.placa}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{ordem.veiculo?.modelo || ordem.modelo}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <FontAwesomeIcon icon={faUser} style={{ marginRight: '5px', color: '#666' }} />
                      {ordem.cliente?.nome || 'Não informado'}
                    </td>
                    <td>{ordem.departamento?.nome || 'Não informado'}</td>
                    <td>
                      <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '5px', color: '#666' }} />
                      {formatarData(ordem.dataEntrada)}
                    </td>
                    <td>
                      <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '5px', color: '#666' }} />
                      {formatarData(ordem.dataPrevisao)}
                    </td>
                    <td>
                      <div style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(ordem.status)
                      }}>
                        {getStatusTexto(ordem.status).toUpperCase()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  title: {
    fontSize: '30px',
    fontFamily: "Arial, Helvetica, sans-serif",
    color: '#333',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    fontFamily: "Arial, Helvetica, sans-serif",
    color: '#666',
    marginBottom: '24px'
  },
  loading: {
    textAlign: 'center' as const,
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: '40px',
    fontSize: '18px',
    color: '#666'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  cardIcon: {
    fontSize: '48px',
    backgroundColor: '#f8f9fa',
    width: '70px',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%'
  },
  cardContent: {
    flex: 1,
    fontFamily: "Arial, Helvetica, sans-serif"
  },
  cardTitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
    textTransform: 'uppercase' as const
  },
  cardValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333'
  },
  recentSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  recentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  recentTitle: {
    fontSize: '20px',
    fontFamily: "Arial, Helvetica, sans-serif",
    color: '#333',
    margin: 0
  },
  buttonVerTodas: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  tableWrapper: {
    overflowX: 'auto' as const
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontFamily: "Arial, Helvetica, sans-serif",
    textAlign: 'left' as const
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    color: 'white',
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: '10px',
    fontWeight: 'bold',
    display: 'inline-block'
  }
};

export default Dashboard;