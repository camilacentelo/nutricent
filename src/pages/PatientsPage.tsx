import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Loader2, User } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface Patient {
  id: string;
  nome: string;
  objetivos: string[];
  ultima_consulta?: string;
}

const PatientsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchPatients = async () => {
      setLoading(true);
      try {
        // Fetch patients
        const { data: patientsData, error: pError } = await supabase
          .from('pacientes')
          .select('id, nome, objetivos')
          .eq('nutricionista_id', user.id)
          .order('nome');

        if (pError) throw pError;

        // Fetch last consultation for each patient
        const { data: consultationsData, error: cError } = await supabase
          .from('consultas')
          .select('paciente_id, data_consulta')
          .in('paciente_id', patientsData.map(p => p.id))
          .order('data_consulta', { ascending: false });

        if (cError) throw cError;

        // Map last consultation to patients
        const patientsWithConsultation = patientsData.map(p => {
          const lastConsultation = consultationsData.find(c => c.paciente_id === p.id);
          return {
            ...p,
            ultima_consulta: lastConsultation?.data_consulta
          };
        });

        setPatients(patientsWithConsultation);
      } catch (err) {
        console.error('Erro ao buscar pacientes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user]);

  const filteredPatients = patients.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100%' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary-color)" />
        <span style={{ marginLeft: '12px', color: 'var(--text-muted)' }}>Carregando pacientes...</span>
      </div>
    );
  }

  return (
    <div className="patients-container">
      <header className="page-header">
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Meus Pacientes</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie e acompanhe o progresso de seus pacientes.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/pacientes/novo')} style={{ width: 'auto' }}>
          <UserPlus size={20} />
          <span>Novo Paciente</span>
        </button>
      </header>

      <div className="search-container" style={{ marginBottom: '24px' }}>
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Buscar paciente por nome..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="patient-table-container">
        {filteredPatients.length > 0 ? (
          <table className="patient-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Objetivo Principal</th>
                <th>Última Consulta</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(p => (
                <tr key={p.id} className="patient-row" onClick={() => navigate(`/pacientes/${p.id}`)}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-color)'
                      }}>
                        <User size={18} />
                      </div>
                      <span style={{ fontWeight: 600 }}>{p.nome}</span>
                    </div>
                  </td>
                  <td>{p.objetivos && p.objetivos.length > 0 ? p.objetivos[0] : 'Não definido'}</td>
                  <td>{p.ultima_consulta ? new Date(p.ultima_consulta).toLocaleDateString('pt-BR') : 'Nenhuma consulta'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem' }}>
              {searchTerm ? 'Nenhum paciente encontrado para esta busca.' : 'Nenhum paciente cadastrado ainda.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsPage;
