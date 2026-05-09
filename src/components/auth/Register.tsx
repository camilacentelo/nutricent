import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      // 1. Sign up in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // 2. Insert into nutricionistas table
        const { error: dbError } = await supabase
          .from('nutricionistas')
          .insert([
            { id: data.user.id, nome: fullName, email: email }
          ]);

        if (dbError) throw dbError;
        
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Ocorreu um erro ao criar sua conta.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <CheckCircle2 size={64} color="var(--success-color)" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ marginBottom: '10px' }}>Conta criada com sucesso!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Você será redirecionada para o painel em instantes...</p>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="logo-container">
        <h1 className="logo-text">
          <span style={{ color: 'var(--primary-color)' }}>Nutri</span>Cent
        </h1>
      </div>

      <div className="auth-header">
        <h2>Criar sua conta</h2>
        <p>Comece a organizar seus atendimentos hoje mesmo.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="fullName">Nome Completo</label>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="fullName"
              type="text"
              placeholder="Como você gostaria de ser chamada?"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Senha (min. 6 caracteres)</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Senha</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
          <span>{loading ? 'Criando conta...' : 'Criar conta'}</span>
        </button>
      </form>

      <div className="auth-footer">
        Já tem conta? <Link to="/login">Faça login</Link>
      </div>
    </div>
  );
};

export default Register;
