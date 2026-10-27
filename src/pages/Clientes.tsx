import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarClientes, deletarCliente } from '../services/clienteService';
import { Cliente } from '../types/cliente';
import { formatarCPF } from '../utils/validations';

const Clientes: React.FC = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [clienteDeletando, setClienteDeletando] = useState<number | null>(null);
  const itensPorPagina = 5;

  useEffect(() => {
    carregarClientes();
  }, [pagina]);

  const carregarClientes = async () => {
    setLoading(true);
    try {
      const response = await listarClientes(pagina, itensPorPagina);
      setClientes(response.dados);
      setTotal(response.total);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      alert('Erro ao carregar lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este cliente?')) {
      return;
    }

    setClienteDeletando(id);
    try {
      await deletarCliente(id);
      alert('Cliente deletado com sucesso!');
      carregarClientes();
    } catch (error: any) {
      console.error('Erro ao deletar cliente:', error);
      // Exibe a mensagem de erro exata que veio do Back-end (ex: se tiver ordens vinculadas)
      alert(error.response?.data?.error || 'Erro ao deletar cliente');
    } finally {
      setClienteDeletando(null);
    }
  };

  const handleEditar = (id: number) => {
    navigate(`/clientes/editar/${id}`);
  };

  const handleNovo = () => {
    navigate('/clientes/novo');
  };

  const totalPaginas = Math.ceil(total / itensPorPagina);

  return (
    <div>
      <div style={styles.header}>
        <h2>Clientes</h2>
        <button onClick={handleNovo} style={styles.buttonNovo}>
          + Novo Cliente
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Carregando...</div>
      ) : (
        <>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>CPF</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.id}</td>
                    <td>{cliente.nome || '-'}</td>
                    <td>{cliente.email || '-'}</td>
                    <td>{cliente.telefone || '-'}</td>
                    <td>{cliente.cpf ? formatarCPF(cliente.cpf) : '-'}</td>
                    <td style={styles.acoes}>
                      <button
                        onClick={() => handleEditar(cliente.id)}
                        style={styles.buttonEditar}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletar(cliente.id)}
                        style={styles.buttonDeletar}
                        disabled={clienteDeletando === cliente.id}
                      >
                        {clienteDeletando === cliente.id ? 'Deletando...' : 'Deletar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {clientes.length === 0 && (
            <div style={styles.emptyState}>
              <p>Nenhum cliente cadastrado.</p>
              <button onClick={handleNovo} style={styles.buttonNovoEmpty}>
                Cadastrar primeiro cliente
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
                Anterior
              </button>
              
              <span style={styles.paginaInfo}>
                Página {pagina} de {totalPaginas} ({total} clientes)
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  buttonNovo: {
    backgroundColor: '#28a745',
    fontFamily: "Arial, Helvetica, sans-serif",
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  buttonNovoEmpty: {
    backgroundColor: '#28a745',
    fontFamily: "Arial, Helvetica, sans-serif",
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '10px'
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
    color: '#666'
  },
  acoes: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  buttonEditar: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
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

export default Clientes;