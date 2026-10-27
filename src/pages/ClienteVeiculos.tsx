import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { deletarVeiculo } from '../services/veiculoService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faPlus, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

interface Veiculo {
  id: number;
  modelo: string;
  placa: string;
  foto: string | null;
}

const ClienteVeiculos: React.FC = () => {
  const navigate = useNavigate();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [veiculoDeletando, setVeiculoDeletando] = useState<number | null>(null);

  const carregarVeiculos = async () => {
    try {
      const response = await api.get('/veiculos');
      setVeiculos(response.data.data || response.data);
    } catch (error) {
      console.error(error);
      setErro('Erro ao carregar seus veículos.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarVeiculos();
  }, []);

  const handleDeletar = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este veículo?')) {
      return;
    }

    setVeiculoDeletando(id);
    try {
      await deletarVeiculo(id);
      alert('Veículo excluído com sucesso!');
      carregarVeiculos();
    } catch (error: any) {
      console.error('Erro ao deletar veículo:', error);
      alert(error.response?.data?.error || 'Erro ao excluir veículo.');
    } finally {
      setVeiculoDeletando(null);
    }
  };

  if (carregando) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Carregando seus veículos...</div>;
  }

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>Meus Veículos</h2>
        <Link to="/cliente/veiculos/novo" style={styles.addButton}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
          Adicionar Veículo
        </Link>
      </div>
      
      {erro && <div style={styles.error}>{erro}</div>}

      {veiculos.length === 0 ? (
        <div style={styles.emptyState}>
          <FontAwesomeIcon icon={faCar} size="3x" color="#ccc" />
          <p>Você ainda não cadastrou nenhum veículo.</p>
          <Link to="/cliente/veiculos/novo" style={styles.emptyStateButton}>
            Cadastrar meu primeiro carro
          </Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {veiculos.map((veiculo) => (
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
                
                <div style={styles.actions}>
                  <button 
                    onClick={() => navigate(`/cliente/veiculos/editar/${veiculo.id}`)} 
                    style={styles.editButton}
                  >
                    <FontAwesomeIcon icon={faEdit} style={{ marginRight: '5px' }} />
                    Editar
                  </button>
                  
                  {/* BOTÃO DE EXCLUIR */}
                  <button 
                    onClick={() => handleDeletar(veiculo.id)} 
                    style={styles.deleteButton}
                    disabled={veiculoDeletando === veiculo.id}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} spin={veiculoDeletando === veiculo.id} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  pageTitle: { color: '#333', margin: '0', fontFamily: 'Arial, sans-serif' },
  addButton: { backgroundColor: '#27ae60', color: 'white', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center' },
  error: { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '20px' },
  emptyState: { textAlign: 'center' as const, padding: '50px 20px', color: '#666', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' },
  emptyStateButton: { display: 'inline-block', marginTop: '15px', backgroundColor: '#3498db', color: 'white', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  imageContainer: { width: '100%', height: '180px', backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%', objectFit: 'cover' as const },
  imagePlaceholder: { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' },
  cardContent: { padding: '15px' },
  vehicleName: { margin: '0 0 5px 0', fontSize: '20px', color: '#2c3e50' },
  plate: { margin: '0', color: '#666', fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' },
  actions: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '15px' },
  editButton: { backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', flex: 1, marginRight: '10px' },
  deleteButton: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }
};

export default ClienteVeiculos;