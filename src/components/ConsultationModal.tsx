import React, { useState } from 'react';
import { X, Calendar, Scale, Ruler, Activity, Save } from 'lucide-react';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  patientId: string;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose, onSave, patientId }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    data_consulta: new Date().toISOString().split('T')[0],
    peso: '',
    cintura: '',
    quadril: '',
    percentual_gordura: '',
    observacoes: '',
    proximo_retorno: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSave = {
        paciente_id: patientId,
        data_consulta: formData.data_consulta,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        cintura: formData.cintura ? parseFloat(formData.cintura) : null,
        quadril: formData.quadril ? parseFloat(formData.quadril) : null,
        percentual_gordura: formData.percentual_gordura ? parseFloat(formData.percentual_gordura) : null,
        observacoes: formData.observacoes || null,
        proximo_retorno: formData.proximo_retorno || null,
      };
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar consulta:', error);
      alert('Erro ao salvar consulta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Nova Consulta</h3>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Data da Consulta *</label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <input 
                  type="date" 
                  name="data_consulta" 
                  value={formData.data_consulta} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Peso (kg) *</label>
              <div className="input-with-icon">
                <Scale size={18} className="input-icon" />
                <input 
                  type="number" 
                  step="0.1" 
                  name="peso" 
                  value={formData.peso} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>% de Gordura (%)</label>
              <div className="input-with-icon">
                <Activity size={18} className="input-icon" />
                <input 
                  type="number" 
                  step="0.1" 
                  name="percentual_gordura" 
                  value={formData.percentual_gordura} 
                  onChange={handleInputChange} 
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Cintura (cm)</label>
              <div className="input-with-icon">
                <Ruler size={18} className="input-icon" />
                <input 
                  type="number" 
                  step="0.1" 
                  name="cintura" 
                  value={formData.cintura} 
                  onChange={handleInputChange} 
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Quadril (cm)</label>
              <div className="input-with-icon">
                <Ruler size={18} className="input-icon" />
                <input 
                  type="number" 
                  step="0.1" 
                  name="quadril" 
                  value={formData.quadril} 
                  onChange={handleInputChange} 
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Observações</label>
              <textarea 
                name="observacoes" 
                value={formData.observacoes} 
                onChange={handleInputChange} 
                rows={3} 
                placeholder="Notas sobre a consulta..."
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Próximo Retorno</label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <input 
                  type="date" 
                  name="proximo_retorno" 
                  value={formData.proximo_retorno} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : <><Save size={18} /> Salvar consulta</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationModal;
