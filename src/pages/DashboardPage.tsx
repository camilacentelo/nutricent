import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface PatientWithoutReturn {
  id: string;
  nome: string;
  ultima_consulta: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [weekConsultations, setWeekConsultations] = useState<number>(0);
  const [patientsWithoutReturn, setPatientsWithoutReturn] = useState<PatientWithoutReturn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Total de Pacientes Ativos
        const { count: patientsCount, error: pError } = await supabase
          .from('pacientes')
          .select('*', { count: 'exact', head: true })
          .eq('nutricionista_id', user.id);

        if (pError) throw pError;
        setTotalPatients(patientsCount || 0);

        // 2. Consultas da Semana
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Dom) a 6 (Sab)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Note: The filter above on join might be tricky in Supabase depending on the version.
        // Alternative: Fetch patients for this nutri, then consultations for those patients.
        
        // Let's use a more reliable way:
        const { data: nutriPatients } = await supabase
          .from('pacientes')
          .select('id')
          .eq('nutricionista_id', user.id);
        
        const patientIds = nutriPatients?.map(p => p.id) || [];

        if (patientIds.length > 0) {
          const { count: cCount } = await supabase
            .from('consultas')
            .select('*', { count: 'exact', head: true })
            .in('paciente_id', patientIds)
            .gte('data_consulta', startOfWeek.toISOString().split('T')[0])
            .lte('data_consulta', endOfWeek.toISOString().split('T')[0]);
          
          setWeekConsultations(cCount || 0);

          // 3. Pacientes sem Retorno
          // - Ultima consulta ha mais de 30 dias
          // - Sem proximo retorno agendado (ou retorno ja passou)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(today.getDate() - 30);
          const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
          const todayStr = today.toISOString().split('T')[0];

          // Subquery logic in JS: Get last consultation for each patient
          const { data: lastConsultations, error: lcError } = await supabase
            .from('consultas')
            .select('paciente_id, data_consulta, proximo_retorno, pacientes(nome)')
            .in('paciente_id', patientIds)
            .order('data_consulta', { ascending: false });

          if (lcError) throw lcError;

          // Group by patient and take the most recent one
          const latestMap = new Map<string, any>();
          lastConsultations?.forEach(c => {
            if (!latestMap.has(c.paciente_id)) {
              latestMap.set(c.paciente_id, c);
            }
          });

          const withoutReturn = Array.from(latestMap.values())
            .filter(c => {
              const hasNoFutureReturn = !c.proximo_retorno || c.proximo_retorno < todayStr;
              const isOldConsultation = c.data_consulta < thirtyDaysAgoStr;
              return hasNoFutureReturn && isOldConsultation;
            })
            .map(c => ({
              id: c.paciente_id,
              nome: c.pacientes.nome,
              ultima_consulta: c.data_consulta
            }));

          setPatientsWithoutReturn(withoutReturn);
        }

      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100%' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary-color)" />
        <span style={{ marginLeft: '12px', color: 'var(--text-muted)' }}>Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Painel de Controle</h2>
        <p style={{ color: 'var(--text-muted)' }}>Bem-vinda de volta ao NutriCent.</p>
      </header>

      <div className="dashboard-grid">
        {/* Card 1: Total de Pacientes */}
        <div className="info-card">
          <div className="card-icon">
            <Users size={24} />
          </div>
          <p className="card-label">Pacientes Ativos</p>
          <p className="card-value">{totalPatients}</p>
        </div>

        {/* Card 2: Consultas da Semana */}
        <div className="info-card">
          <div className="card-icon">
            <Calendar size={24} />
          </div>
          <p className="card-label">Consultas da Semana</p>
          <p className="card-value">{weekConsultations}</p>
        </div>

        {/* Card 3: Pacientes sem Retorno */}
        <div className="info-card" style={{ gridColumn: 'span 1' }}>
          <div className="card-icon" style={{ backgroundColor: '#fff5f5', color: 'var(--error-color)' }}>
            <AlertCircle size={24} />
          </div>
          <p className="card-label">Pacientes sem Retorno</p>
          <p className="card-value" style={{ color: 'var(--error-color)' }}>{patientsWithoutReturn.length}</p>
          
          {patientsWithoutReturn.length > 0 ? (
            <ul className="patient-list">
              {patientsWithoutReturn.map(p => (
                <li key={p.id}>
                  <Link to={`/pacientes/${p.id}`} className="patient-item">
                    {p.nome}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">Nenhum paciente sem retorno no momento</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
