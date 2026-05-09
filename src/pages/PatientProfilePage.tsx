import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, User, Calendar, Target, Activity, 
  Save, CheckCircle2, Plus, Clipboard, Coffee,
  TrendingUp, FileText, ChevronRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { supabase } from '../lib/supabaseClient';
import ConsultationModal from '../components/ConsultationModal';

type DataTab = 'pessoal' | 'clinico' | 'habitos';

const PatientProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // States
  const [patient, setPatient] = useState<any>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<DataTab>('pessoal');
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  
  // Form State for editing patient
  const [formData, setFormData] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Patient
      const { data: patientData, error: patientError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (patientError) throw patientError;
      setPatient(patientData);
      setFormData(patientData);

      // Fetch Consultations
      const { data: consData, error: consError } = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_id', id)
        .order('data_consulta', { ascending: false });
      
      if (consError) throw consError;
      setConsultations(consData || []);

      // Fetch Plans
      const { data: plansData, error: plansError } = await supabase
        .from('planos_alimentares')
        .select('*')
        .eq('paciente_id', id)
        .order('created_at', { ascending: false });
      
      if (plansError) throw plansError;
      setPlans(plansData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      navigate('/pacientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const toggleArrayItem = (field: string, item: string) => {
    setFormData((prev: any) => {
      const current = prev[field] || [];
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter((i: string) => i !== item) };
      } else {
        return { ...prev, [field]: [...current, item] };
      }
    });
  };

  const handleSavePatient = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('pacientes')
        .update(formData)
        .eq('id', id);
      
      if (error) throw error;
      
      setPatient(formData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      alert('Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConsultation = async (consData: any) => {
    const { error } = await supabase
      .from('consultas')
      .insert([consData]);
    
    if (error) throw error;
    
    // Refresh consultations
    const { data: newData } = await supabase
      .from('consultas')
      .select('*')
      .eq('paciente_id', id)
      .order('data_consulta', { ascending: false });
    
    setConsultations(newData || []);
  };

  const chartData = useMemo(() => {
    return [...consultations]
      .reverse() // Sort ascending for chart
      .map(c => ({
        date: new Date(c.data_consulta).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        weight: c.peso
      }));
  }, [consultations]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted">Carregando perfil...</p>
    </div>
  );

  return (
    <div className="profile-container p-6">
      <header className="page-header mb-8">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/pacientes')} className="btn-secondary" style={{ padding: '8px' }}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{patient.nome}</h2>
            <p style={{ color: 'var(--text-muted)' }}>Acompanhamento Nutricional</p>
          </div>
        </div>
      </header>

      {showSuccess && (
        <div className="success-banner">
          <CheckCircle2 size={24} />
          <span>Alterações salvas com sucesso!</span>
        </div>
      )}

      {/* SECTION 1: DADOS DO PACIENTE */}
      <section className="profile-section">
        <div className="section-header">
          <h3 className="section-title"><User size={24} color="var(--primary-main)" /> Dados do Paciente</h3>
          <button 
            className="btn-primary" 
            onClick={handleSavePatient}
            disabled={saving}
          >
            {saving ? 'Salvando...' : <><Save size={20} /> Salvar alterações</>}
          </button>
        </div>

        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === 'pessoal' ? 'active' : ''}`}
            onClick={() => setActiveTab('pessoal')}
          >
            <User size={18} /> Pessoal
          </button>
          <button 
            className={`profile-tab ${activeTab === 'clinico' ? 'active' : ''}`}
            onClick={() => setActiveTab('clinico')}
          >
            <Clipboard size={18} /> Clínico
          </button>
          <button 
            className={`profile-tab ${activeTab === 'habitos' ? 'active' : ''}`}
            onClick={() => setActiveTab('habitos')}
          >
            <Coffee size={18} /> Hábitos
          </button>
        </div>

        <div className="form-card" style={{ padding: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}>
          {activeTab === 'pessoal' && (
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Nome Completo</label>
                <input name="nome" value={formData.nome} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Data de Nascimento</label>
                <input type="date" name="data_nascimento" value={formData.data_nascimento || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Sexo</label>
                <select name="sexo" value={formData.sexo || ''} onChange={handleInputChange}>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input name="telefone" value={formData.telefone || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>WhatsApp</label>
                <input name="whatsapp" value={formData.whatsapp || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>E-mail</label>
                <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} />
              </div>
            </div>
          )}

          {activeTab === 'clinico' && (
            <div className="form-grid">
              <div className="form-group">
                <label>Peso Inicial (kg)</label>
                <input type="number" step="0.1" name="peso_inicial" value={formData.peso_inicial || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Altura (cm)</label>
                <input type="number" name="altura" value={formData.altura || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Objetivos</label>
                <div className="checkbox-grid">
                  {['Emagrecer', 'Ganhar massa', 'Saúde geral', 'Performance esportiva'].map(opt => (
                    <label key={opt} className={`checkbox-item ${(formData.objetivos || []).includes(opt) ? 'selected' : ''}`}>
                      <input 
                        type="checkbox" 
                        checked={(formData.objetivos || []).includes(opt)} 
                        onChange={() => toggleArrayItem('objetivos', opt)}
                        style={{ display: 'none' }}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Nível de Atividade</label>
                <select name="nivel_atividade" value={formData.nivel_atividade || ''} onChange={handleInputChange}>
                  <option value="Sedentário">Sedentário</option>
                  <option value="Levemente ativo">Levemente ativo</option>
                  <option value="Moderadamente ativo">Moderadamente ativo</option>
                  <option value="Muito ativo">Muito ativo</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'habitos' && (
            <div className="form-grid">
              <div className="form-group">
                <label>Refeições por dia</label>
                <input type="number" name="refeicoes_por_dia" value={formData.refeicoes_por_dia || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Água (litros/dia)</label>
                <input type="number" step="0.1" name="litros_agua" value={formData.litros_agua || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Observações</label>
                <textarea name="observacoes" value={formData.observacoes || ''} onChange={handleInputChange} rows={4} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: CONSULTAS */}
      <section className="profile-section">
        <div className="section-header">
          <h3 className="section-title"><TrendingUp size={24} color="var(--primary-main)" /> Consultas</h3>
          <button className="btn-primary" onClick={() => setIsConsultationModalOpen(true)}>
            <Plus size={20} /> Nova Consulta
          </button>
        </div>

        <div className="chart-container">
          <h4 style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Evolução de Peso (kg)</h4>
          {consultations.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f7" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#a0aec0', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0aec0', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 700, color: 'var(--text-main)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="var(--primary-main)" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: 'var(--primary-main)', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <Activity size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p>Nenhuma consulta registrada ainda</p>
            </div>
          )}
        </div>

        <div className="history-list">
          {consultations.map((c) => (
            <div key={c.id} className="history-item">
              <div>
                <p className="history-label">Data</p>
                <p className="history-value">{new Date(c.data_consulta).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="history-label">Peso</p>
                <p className="history-value">{c.weight || c.peso} kg</p>
              </div>
              <div>
                <p className="history-label">Cintura / Quadril</p>
                <p className="history-value">{c.cintura || '--'} / {c.quadril || '--'} cm</p>
              </div>
              <div>
                <p className="history-label">% Gordura</p>
                <p className="history-value">{c.percentual_gordura || '--'} %</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <p className="history-label">Próximo Retorno</p>
                <p className="history-value" style={{ color: 'var(--primary-main)' }}>
                  {c.proximo_retorno ? new Date(c.proximo_retorno).toLocaleDateString('pt-BR') : 'Não definido'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: PLANOS ALIMENTARES */}
      <section className="profile-section">
        <div className="section-header">
          <h3 className="section-title"><FileText size={24} color="var(--primary-main)" /> Planos Alimentares</h3>
          <button className="btn-primary" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
            Gerar Plano Alimentar
          </button>
        </div>

        {plans.length > 0 ? (
          <div className="history-list">
            {plans.map((p) => (
              <div key={p.id} className="history-item" style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p className="history-label">Gerado em</p>
                  <p className="history-value">{new Date(p.created_at).toLocaleDateString('pt-BR')} às {new Date(p.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <ChevronRight size={20} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Clipboard size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p>Nenhum plano alimentar gerado ainda</p>
          </div>
        )}
      </section>

      <ConsultationModal 
        isOpen={isConsultationModalOpen} 
        onClose={() => setIsConsultationModalOpen(false)}
        onSave={handleSaveConsultation}
        patientId={id!}
      />
    </div>
  );
};

export default PatientProfilePage;
