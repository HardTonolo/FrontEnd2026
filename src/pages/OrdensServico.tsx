import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarOrdensServico, deletarOrdemServico } from '../services/ordemServicoService';
import { listarDepartamentos } from '../services/departamentoService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faUser, faPhone, faCalendarAlt, faClock, faCar } from '@fortawesome/free-solid-svg-icons';

const OrdensServico: React.FC = () => {
  const navigate = useNavigate();
  const [ordens, setOrdens] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroDepartamento, setFiltroDepartamento] = useState<number>(0);
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const [busca, setBusca] = useState<string>('');
  const [pagina, setPagina] = useState(1);
  const [totalOrdensLista, setTotalOrdensLista] = useState(0);
  const [ordemDeletando, setOrdemDeletando] = useState<number | null>(null);
  const itensPorPagina = 4;

  useEffect(() => {
    carregarDepartamentos();
  }, []);

  useEffect(() => {
    setPagina(1);
    carregarOrdens();
  }, [busca, filtroDepartamento, filtroStatus]);

  useEffect(() => {
    carregarOrdens();
  }, [pagina]);

  const carregarDepartamentos = async () => {
    try {
      const dados = await listarDepartamentos();
      setDepartamentos(dados);
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
    }
  };

  const carregarOrdens = async () => {
    setLoading(true);
    try {
      const response = await listarOrdensServico(
        pagina,
        itensPorPagina,
        filtroDepartamento,
        filtroStatus,
        busca
      );
      setOrdens(response.dados);
      setTotalOrdensLista(response.total);
    } catch (error) {
      console.error('Erro ao carregar ordens de serviço:', error);
      alert('Erro ao carregar lista de ordens de serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar esta ordem de serviço?')) {
      return;
    }

    setOrdemDeletando(id);
    try {
      await deletarOrdemServico(id);
      alert('Ordem de serviço deletada com sucesso!');
      carregarOrdens();
    } catch (error: any) {
      console.error('Erro ao deletar ordem:', error);
      alert(error.response?.data?.error || 'Erro ao deletar ordem de serviço');
    } finally {
      setOrdemDeletando(null);
    }
  };

  const handleEditar = (id: number) => {
    navigate(`/ordens-servico/editar/${id}`);
  };

  const handleNovo = () => {
    navigate('/ordens-servico/novo');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'orçamento': return '#17a2b8';
      case 'em_andamento': return '#ffc107';
      case 'concluido': return '#28a745';
      case 'aguardando_retirada': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusTexto = (status?: string) => {
    switch (status) {
      case 'orçamento': return 'Orçamento';
      case 'em_andamento': return 'Em Andamento';
      case 'concluido': return 'Concluído';
      case 'aguardando_retirada': return 'Aguardando Retirada';
      default: return status || 'Desconhecido';
    }
  };

  const formatarData = (data: string) => {
    if (!data) return '--/--/----';
    const [ano, mes, dia] = data.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const totalPaginas = Math.ceil(totalOrdensLista / itensPorPagina);

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Gestão de Funilaria</h2>
          <p style={styles.subtitle}>Acompanhe todos os veículos em tempo real</p>
        </div>
        <button onClick={handleNovo} style={styles.buttonNovo}>
          + Nova Ordem de Serviço
        </button>
      </div>

      <div style={styles.filtrosContainer}>
        <div style={styles.filtroGroup}>
          <label style={styles.filtroLabel}>FILTRAR POR ETAPA:</label>
          <select
            value={filtroStatus}
            onChange={(e) => { setFiltroStatus(e.target.value); setPagina(1); }}
            style={styles.select}
          >
            <option value="todas">TODAS</option>
            <option value="orçamento">ORÇAMENTO</option>
            <option value="em_andamento">EM ANDAMENTO</option>
            <option value="concluido">CONCLUÍDO</option>
            <option value="aguardando_retirada">AGUARDANDO RETIRADA</option>
          </select>
        </div>

        <div style={styles.filtroGroup}>
          <label style={styles.filtroLabel}>FILTRAR POR DEPARTAMENTO:</label>
          <select
            value={filtroDepartamento}
            onChange={(e) => { setFiltroDepartamento(parseInt(e.target.value)); setPagina(1); }}
            style={styles.select}
          >
            <option value={0}>TODOS</option>
            {departamentos.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.nome}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filtroGroup}>
          <label style={styles.filtroLabel}>BUSCAR:</label>
          <input
            type="text"
            placeholder="Placa, modelo, cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Carregando ordens de serviço...</div>
      ) : (
        <>
          <div style={styles.cardsGrid}>
            {ordens.map((ordem) => (
              <div key={ordem.id} style={styles.cardOS}>
                <div style={styles.cardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* AJUSTADO PARA ordem.veiculo */}
                    {ordem.veiculo?.foto ? (
                      <img 
                        src={`http://localhost:3000/uploads/${ordem.veiculo.foto}`} 
                        alt="Foto" 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <FontAwesomeIcon icon={faCar} color="#aaa" />
                      </div>
                    )}
                    <div>
                      <div style={styles.placa}>{ordem.veiculo?.placa || 'Sem Placa'}</div>
                      <div style={styles.modelo}>{ordem.veiculo?.modelo || 'Modelo não informado'}</div>
                    </div>
                  </div>
                  
                  <div style={styles.cardActions}>
                    <button onClick={() => handleEditar(ordem.id)} style={styles.editBtn}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => handleDeletar(ordem.id)} style={styles.deleteBtn} disabled={ordemDeletando === ordem.id}>
                      <FontAwesomeIcon icon={faTrashAlt} spin={ordemDeletando === ordem.id} />
                    </button>
                  </div>
                </div>

                <div style={styles.clienteInfo}>
                  <FontAwesomeIcon icon={faUser} style={styles.iconSmall} />
                  {/* AJUSTADO PARA ordem.cliente */}
                  <strong>{ordem.cliente?.nome || 'Cliente não encontrado'}</strong>
                  <div style={styles.telefone}>
                    <FontAwesomeIcon icon={faPhone} style={styles.iconTiny} />
                    {ordem.cliente?.telefone || 'Sem telefone'}
                  </div>
                </div>

                <div style={styles.detalhesServico}>
                  <div style={styles.dataInfo}>
                    <div>
                      <FontAwesomeIcon icon={faCalendarAlt} style={styles.iconTiny} />
                      <span style={styles.dataLabel}>ENTRADA</span>
                      {/* AJUSTADO PARA dataEntrada */}
                      <div>{formatarData(ordem.dataEntrada)}</div>
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faClock} style={styles.iconTiny} />
                      <span style={styles.dataLabel}>PREVISÃO</span>
                      {/* AJUSTADO PARA dataPrevisao */}
                      <div>{formatarData(ordem.dataPrevisao)}</div>
                    </div>
                  </div>

                  <div style={styles.departamentoInfo}>
                    {/* AJUSTADO PARA ordem.departamento */}
                    <strong>Departamento:</strong> {ordem.departamento?.nome || 'Não informado'}
                  </div>

                  <div style={styles.servicos}>
                    <strong>Serviços:</strong>
                    {/* AJUSTADO PARA servicosRealizar */}
                    <p>{ordem.servicosRealizar || 'Não informado'}</p>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <div style={styles.consultor}>
                    OS #{ordem.id}
                  </div>
                  <div style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(ordem.status) 
                  }}>
                    {getStatusTexto(ordem.status).toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {ordens.length === 0 && (
            <div style={styles.emptyState}>
              <p>Nenhuma ordem de serviço encontrada.</p>
              <button onClick={handleNovo} style={styles.buttonNovoEmpty}>
                Criar primeira ordem de serviço
              </button>
            </div>
          )}

          {totalPaginas > 1 && (
            <div style={styles.paginacao}>
              <button
                onClick={() => setPagina(pagina - 1)}
                disabled={pagina === 1}
                style={styles.buttonPagina}
              >
                ANTERIOR
              </button>
              <span style={styles.paginaInfo}>
                PÁGINA {pagina} DE {totalPaginas}
              </span>
              <button
                onClick={() => setPagina(pagina + 1)}
                disabled={pagina === totalPaginas}
                style={styles.buttonPagina}
              >
                PRÓXIMA
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' as const, gap: '16px' },
  title: { fontSize: '24px', color: '#333', marginBottom: '8px' },
  subtitle: { fontSize: '14px', fontFamily: "Arial, Helvetica, sans-serif", color: '#666' },
  buttonNovo: { backgroundColor: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  buttonNovoEmpty: { backgroundColor: '#28a745', fontFamily: "Arial, Helvetica, sans-serif", color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', marginTop: '10px' },
  filtrosContainer: { display: 'flex', fontFamily: "Arial, Helvetica, sans-serif", gap: '20px', marginBottom: '24px', flexWrap: 'wrap' as const, backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  filtroGroup: { display: 'flex', flexDirection: 'column' as const, gap: '8px', minWidth: '180px' },
  filtroLabel: { fontSize: '12px', fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 'bold', color: '#666' },
  select: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', backgroundColor: 'white' },
  searchInput: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', backgroundColor: 'white' },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginBottom: '24px' },
  cardOS: { backgroundColor: '#f8f9fa', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'transform 0.2s' },
  cardHeader: { backgroundColor: '#fff', padding: '16px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  placa: { fontSize: '20px', fontWeight: 'bold', color: '#2c3e50', fontFamily: "Arial, Helvetica, sans-serif" },
  modelo: { fontSize: '14px', color: '#7f8c8d', fontFamily: "Arial, Helvetica, sans-serif", marginTop: '4px' },
  cardActions: { display: 'flex', gap: '8px' },
  editBtn: { backgroundColor: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '4px', color: '#3498db' },
  deleteBtn: { backgroundColor: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '4px', color: '#e74c3c' },
  clienteInfo: { padding: '16px', borderBottom: '1px solid #e9ecef', fontFamily: "Arial, Helvetica, sans-serif", backgroundColor: '#fff' },
  telefone: { fontSize: '12px', color: '#7f8c8d', marginTop: '4px' },
  detalhesServico: { padding: '16px', fontFamily: "Arial, Helvetica, sans-serif", backgroundColor: '#fff' },
  dataInfo: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e9ecef', textAlign: 'center' as const },
  dataLabel: { fontSize: '10px', color: '#95a5a6', fontWeight: 'bold', letterSpacing: '0.5px', marginLeft: '4px', display: 'block' },
  departamentoInfo: { fontSize: '13px', color: '#2c3e50', marginBottom: '12px', padding: '8px', backgroundColor: '#e9ecef', borderRadius: '8px', textAlign: 'center' as const },
  servicos: { fontSize: '13px', color: '#2c3e50', lineHeight: '1.5', backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '8px' },
  cardFooter: { padding: '12px 16px', borderTop: '1px solid #e9ecef', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  consultor: { fontSize: '12px', fontFamily: "Arial, Helvetica, sans-serif", color: '#7f8c8d', fontWeight: 'bold' },
  statusBadge: { padding: '4px 12px', borderRadius: '20px', color: 'white', fontFamily: "Arial, Helvetica, sans-serif", fontSize: '10px', fontWeight: 'bold' },
  emptyState: { textAlign: 'center' as const, fontFamily: "Arial, Helvetica, sans-serif", padding: '60px', backgroundColor: 'white', borderRadius: '8px', color: '#666' },
  loading: { textAlign: 'center' as const, fontFamily: "Arial, Helvetica, sans-serif", padding: '40px', fontSize: '18px', color: '#666' },
  paginacao: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px', padding: '20px' },
  buttonPagina: { backgroundColor: '#007bff', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  paginaInfo: { fontSize: '14px', color: '#666' },
  iconSmall: { marginRight: '8px', color: '#7f8c8d' },
  iconTiny: { marginRight: '4px', fontSize: '10px', color: '#95a5a6' }
};

export default OrdensServico;