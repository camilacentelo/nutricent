import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Clipboard, Coffee, Save, ChevronLeft, 
  CheckCircle2, Loader2 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'pessoal' | 'clinico' | 'habitos';

const NewPatientPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('pessoal');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    sexo: '',
    telefone: '',
    whatsapp: '',
    email: '',
    peso_inicial: '',
    altura: '',
    objetivos: [] as string[],
    objetivo_texto: '',
    nivel_atividade: '',
    patologias: [] as string[],
    patologias_outro: '',
    restricoes_alimentares: [] as string[],
    restricoes_outro: '',
    alergias: [] as string[],
    alergias_outro: '',
    medicamentos: '',
    suplementos: '',
    refeicoes_por_dia: '',
    horario_acorda: '',
    horario_dorme: '',
    litros_agua: '',
    atividade_fisica: false,
    atividade_fisica_descricao: '',
    observacoes: ''
  });

  const [age, setAge] = useState<number | null>(null);
  const [imc, setImc] = useState<number | null>(null);

  // Calculations
  useEffect(() => {
    if (formData.data_nascimento) {
      const birth = new Date(formData.data_nascimento);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      setAge(age);
    } else {
      setAge(null);
    }
  }, [formData.data_nascimento]);

  useEffect(() => {
    const peso = parseFloat(formData.peso_inicial);
    const altura = parseFloat(formData.altura);
    if (peso > 0 && altura > 0) {
      const alturaM = altura / 100;
      const calcImc = peso / (alturaM * alturaM);
      setImc(parseFloat(calcImc.toFixed(1)));
    } else {
      setImc(null);
    }
  }, [formData.peso_inicial, formData.altura]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const toggleArrayItem = (field: 'objetivos' | 'patologias' | 'restricoes_alimentares' | 'alergias', item: string) => {
    setFormData(prev => {
      const current = prev[field] as string[];
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...current, item] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // Mesclar campos "outro" nos arrays antes de salvar
      const finalPatologias = [...formData.patologias];
      if (formData.patologias_outro) finalPatologias.push(formData.patologias_outro);

      const finalRestricoes = [...formData.restricoes_alimentares];
      if (formData.restricoes_outro) finalRestricoes.push(formData.restricoes_outro);

      const finalAlergias = [...formData.alergias];
      if (formData.alergias_outro) finalAlergias.push(formData.alergias_outro);

      // Format data for saving
      const dataToSave = {
        nutricionista_id: user.id,
        nome: formData.nome,
        data_nascimento: formData.data_nascimento || null,
        sexo: formData.sexo || null,
        telefone: formData.telefone || null,
        whatsapp: formData.whatsapp || null,
        email: formData.email || null,
        peso_inicial: formData.peso_inicial ? parseFloat(formData.peso_inicial) : null,
        altura: formData.altura ? parseFloat(formData.altura) : null,
        objetivos: formData.objetivos,
        objetivo_texto: formData.objetivo_texto || null,
        nivel_atividade: formData.nivel_atividade || null,
        patologias: finalPatologias,
        restricoes_alimentares: finalRestricoes,
        alergias: finalAlergias,
        medicamentos: formData.medicamentos || null,
        suplementos: formData.suplementos || null,
        refeicoes_por_dia: formData.refeicoes_por_dia ? parseInt(formData.refeicoes_por_dia) : null,
        horario_acorda: formatTime(formData.horario_acorda),
        horario_dorme: formatTime(formData.horario_dorme),
        litros_agua: formData.litros_agua ? parseFloat(formData.litros_agua) : null,
        atividade_fisica: formData.atividade_fisica,
        atividade_fisica_descricao: formData.atividade_fisica_descricao || null,
        observacoes: formData.observacoes || null,
      };

      const { data, error } = await supabase
        .from('pacientes')
        .insert([dataToSave])
        .select();

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        if (data && data[0]) {
          navigate(`/pacientes/${data[0].id}`);
        } else {
          navigate('/pacientes');
        }
      }, 2000);
    } catch (err) {
      console.error('Erro ao salvar paciente:', err);
      alert('Ocorreu um erro ao salvar o paciente. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (val: string) => {
    if (!val) return '';
    if (val.includes(':')) return val;
    let clean = val.replace(/\D/g, '');
    if (clean.length === 1) clean = '0' + clean + '00';
    if (clean.length === 2) clean = clean + '00';
    if (clean.length === 3) clean = '0' + clean;
    if (clean.length === 4) {
      return `${clean.substring(0, 2)}:${clean.substring(2, 4)}`;
    }
    return val;
  };

  return (
    <div className="new-patient-container">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/pacientes')} className="btn-secondary" style={{ padding: '8px' }}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Novo Paciente</h2>
            <p style={{ color: 'var(--text-muted)' }}>Preencha os dados para iniciar o acompanhamento.</p>
          </div>
        </div>
      </header>

      {success && (
        <div className="success-banner">
          <CheckCircle2 size={24} />
          <span>Paciente cadastrado com sucesso! Redirecionando...</span>
        </div>
      )}

      <div className="tabs-container">
        <button 
          className={`tab-button ${activeTab === 'pessoal' ? 'active' : ''}`}
          onClick={() => setActiveTab('pessoal')}
        >
          <User size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Pessoal
        </button>
        <button 
          className={`tab-button ${activeTab === 'clinico' ? 'active' : ''}`}
          onClick={() => setActiveTab('clinico')}
        >
          <Clipboard size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Clínico
        </button>
        <button 
          className={`tab-button ${activeTab === 'habitos' ? 'active' : ''}`}
          onClick={() => setActiveTab('habitos')}
        >
          <Coffee size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Hábitos
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        {/* TAB 1: PESSOAL */}
        {activeTab === 'pessoal' && (
          <div className="form-grid">
            <h3 className="form-section-title">Dados Pessoais</h3>
            
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Nome Completo *</label>
              <input 
                name="nome" 
                value={formData.nome} 
                onChange={handleInputChange} 
                required 
                placeholder="Ex: Maria Oliveira"
              />
            </div>

            <div className="form-group">
              <label>Data de Nascimento {age !== null && `(${age} anos)`}</label>
              <input 
                name="data_nascimento" 
                type="date" 
                value={formData.data_nascimento} 
                onChange={handleInputChange} 
              />
            </div>

            <div className="form-group">
              <label>Sexo</label>
              <select name="sexo" value={formData.sexo} onChange={handleInputChange}>
                <option value="">Selecione</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="form-group">
              <label>Telefone</label>
              <input name="telefone" value={formData.telefone} onChange={handleInputChange} placeholder="(00) 0000-0000" />
            </div>

            <div className="form-group">
              <label>WhatsApp</label>
              <input name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="(00) 00000-0000" />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>E-mail</label>
              <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="exemplo@email.com" />
            </div>
          </div>
        )}

        {/* TAB 2: CLINICO */}
        {activeTab === 'clinico' && (
          <div className="form-grid">
            <h3 className="form-section-title">Avaliação Clínica</h3>

            <div className="form-group" style={{ position: 'relative' }}>
              <label>Peso Inicial</label>
              <input name="peso_inicial" type="number" step="0.1" value={formData.peso_inicial} onChange={handleInputChange} />
              <span className="input-suffix">kg</span>
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label>Altura</label>
              <input name="altura" type="number" value={formData.altura} onChange={handleInputChange} />
              <span className="input-suffix">cm</span>
            </div>

            <div className="form-group">
              <label>IMC (Calculado)</label>
              <input value={imc || ''} readOnly style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} placeholder="--" />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Objetivo</label>
              <div className="checkbox-grid">
                {['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'].map(opt => (
                  <label key={opt} className={`checkbox-item ${formData.objetivos.includes(opt) ? 'selected' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={formData.objetivos.includes(opt)} 
                      onChange={() => toggleArrayItem('objetivos', opt)}
                      style={{ display: 'none' }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
              <textarea 
                name="objetivo_texto" 
                value={formData.objetivo_texto} 
                onChange={handleInputChange} 
                placeholder="Detalhes adicionais sobre o objetivo..." 
                rows={2}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Nível de Atividade Física</label>
              <div className="checkbox-grid">
                {['Sedentário', 'Levemente ativo', 'Moderadamente ativo', 'Muito ativo', 'Extremamente ativo'].map(opt => (
                  <label key={opt} className={`checkbox-item ${formData.nivel_atividade === opt ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="nivel_atividade"
                      value={opt}
                      checked={formData.nivel_atividade === opt} 
                      onChange={handleInputChange}
                      style={{ display: 'none' }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Patologias ou Condições</label>
              <div className="checkbox-grid">
                {['Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Hipertireoidismo', 'Síndrome do ovário policístico', 'Doença celíaca', 'Colesterol alto', 'Nenhum'].map(opt => (
                  <label key={opt} className={`checkbox-item ${formData.patologias.includes(opt) ? 'selected' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={formData.patologias.includes(opt)} 
                      onChange={() => toggleArrayItem('patologias', opt)}
                      style={{ display: 'none' }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
              <input name="patologias_outro" value={formData.patologias_outro} onChange={handleInputChange} placeholder="Outras condições..." />
            </div>

            {/* Repetir para restricoes e alergias se desejar ou simplificar */}
          </div>
        )}

        {/* TAB 3: HABITOS */}
        {activeTab === 'habitos' && (
          <div className="form-grid">
            <h3 className="form-section-title">Hábitos e Estilo de Vida</h3>

            <div className="form-group">
              <label>Refeições por dia</label>
              <input name="refeicoes_por_dia" type="number" value={formData.refeicoes_por_dia} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Horário que acorda</label>
              <input 
                name="horario_acorda" 
                value={formData.horario_acorda} 
                onChange={handleInputChange} 
                placeholder="Ex: 6 ou 630"
                onBlur={(e) => setFormData(prev => ({ ...prev, horario_acorda: formatTime(e.target.value) }))}
              />
            </div>

            <div className="form-group">
              <label>Horário que dorme</label>
              <input 
                name="horario_dorme" 
                value={formData.horario_dorme} 
                onChange={handleInputChange} 
                placeholder="Ex: 23 ou 2230"
                onBlur={(e) => setFormData(prev => ({ ...prev, horario_dorme: formatTime(e.target.value) }))}
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label>Água por dia</label>
              <input name="litros_agua" type="number" step="0.1" value={formData.litros_agua} onChange={handleInputChange} />
              <span className="input-suffix">litros</span>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name="atividade_fisica" 
                  checked={formData.atividade_fisica} 
                  onChange={(e) => setFormData(prev => ({ ...prev, atividade_fisica: e.target.checked }))}
                  style={{ width: 'auto' }}
                />
                Pratica atividade física regularmente?
              </label>
              {formData.atividade_fisica && (
                <input 
                  name="atividade_fisica_descricao" 
                  value={formData.atividade_fisica_descricao} 
                  onChange={handleInputChange} 
                  placeholder="Qual atividade e frequência?" 
                  className="mt-4"
                />
              )}
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Observações Gerais</label>
              <textarea name="observacoes" value={formData.observacoes} onChange={handleInputChange} rows={4} />
            </div>
          </div>
        )}

        <div className="form-footer">
          <button type="button" className="btn-secondary" onClick={() => navigate('/pacientes')}>Cancelar</button>
          {activeTab !== 'habitos' ? (
            <button 
              type="button" 
              className="btn-primary" 
              style={{ width: 'auto' }}
              onClick={() => setActiveTab(activeTab === 'pessoal' ? 'clinico' : 'habitos')}
            >
              Próximo
            </button>
          ) : (
            <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              <span>{loading ? 'Salvando...' : 'Salvar Paciente'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default NewPatientPage;
