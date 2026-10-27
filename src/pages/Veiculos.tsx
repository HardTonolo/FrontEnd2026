import React, { useState, useEffect } from 'react';
import { listarVeiculos, deletarVeiculo } from '../services/veiculoService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar } from '@fortawesome/free-solid-svg-icons';

const Veiculos: React.FC = () => {
  // Usamos any temporariamente para acessar veiculo.clientes?.nome 
  // (Você pode atualizar sua interface Veiculo depois se quiser)
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [veiculoDeletando, setVeiculoDeletando] = useState<number | null>(null);
  const itensPorPagina = 5;

  useEffect(() => {
    carregarDados();
  }, [pagina]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const veiculosResponse = await listarVeiculos(pagina, itensPorPagina);
      setVeiculos(veiculosResponse.dados);
      setTotal(veiculosResponse.total);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      alert('Erro ao carregar lista de veículos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este veículo?')) {
      return;
    }

    setVeiculoDeletando(id);
    try {
      await deletarVeiculo(id);
      alert('Veículo deletado com sucesso!');
      carregarDados();
    } catch (error: any) {
      console.error('Erro ao deletar veículo:', error);
      alert(error.response?.data?.error || 'Erro ao deletar veículo');
    } finally {
      setVeiculoDeletando(null);
    }
  };

  const totalPaginas = Math.ceil(total / itensPorPagina);

  return (
    <div>
      <div style={styles.header}>
        <h2>Veículos da Concessionária</h2>
        <p style={{ color: '#666', margin: 0 }}>Gerenciamento de frota (Apenas leitura e exclusão)</p>
      </div>

      {loading ? (
        <div style={styles.loading}>Carregando...</div>
      ) : (
        <>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>ID</th>
                  <th>Placa</th>
                  <th>Modelo</th>
                  <th>Cliente Proprietário</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {veiculos.map((veiculo) => (
                  <tr key={veiculo.id}>
                    <td>
                      <div style={styles.imageContainer}>
                        {veiculo.foto ? (
                          <img 
                            src={`http://localhost:3000/uploads/${veiculo.foto}`} 
                            alt={veiculo.modelo} 
                            style={styles.image} 
                          />
                        ) : (
                          <div style={styles.imagePlaceholder}>
                            <FontAwesomeIcon icon={faCar} color="#aaa" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{veiculo.id}</td>
                    <td style={{ fontWeight: 'bold' }}>{veiculo.placa}</td>
                    <td>{veiculo.modelo}</td>
                    <td>{veiculo.clientes?.nome || 'Sem proprietário'}</td>
                    <td style={styles.acoes}>
                      <button
                        onClick={() => handleDeletar(veiculo.id)}
                        style={styles.buttonDeletar}
                        disabled={veiculoDeletando === veiculo.id}
                      >
                        {veiculoDeletando === veiculo.id ? 'Deletando...' : 'Excluir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {veiculos.length === 0 && (
            <div style={styles.emptyState}>
              <p>Nenhum veículo cadastrado no sistema.</p>
            </div>
          )}

          {totalPaginas > 1 && (
            <div style={styles.paginacao}>
              <button
                onClick={() => setPagina(pagina - 1)}
                disabled={pagina === 1}
                style={styles.buttonPagina}
              >
                Anterior
              </button>
              
              <span style={styles.paginaInfo}>
                Página {pagina} de {totalPaginas} ({total} veículos)
              </span>
              
              <button
                onClick={() => setPagina(pagina + 1)}
                disabled={pagina === totalPaginas}
                style={styles.buttonPagina}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  header: {
    marginBottom: '20px'
  },
  tableWrapper: {
    overflowX: 'auto' as const,
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontFamily: "Arial, Helvetica, sans-serif",
    textAlign: 'center' as const
  },
  loading: {
    textAlign: 'center' as const,
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: '40px',
    fontSize: '18px',
    color: '#666'
  },
  emptyState: {
    textAlign: 'center' as const,
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: '40px',
    color: '#666',
    backgroundColor: 'white',
    borderRadius: '8px',
    marginTop: '20px'
  },
  imageContainer: {
    width: '50px',
    height: '50px',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  imagePlaceholder: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%'
  },
  acoes: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  buttonDeletar: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  paginacao: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
    padding: '20px'
  },
  buttonPagina: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  paginaInfo: {
    fontSize: '14px',
    color: '#666'
  }
};

export default Veiculos;