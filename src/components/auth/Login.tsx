import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message === 'Invalid login credentials' 
        ? 'E-mail ou senha incorretos. Por favor, tente novamente.' 
        : 'Ocorreu um erro ao tentar entrar. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="logo-container">
        <h1 className="logo-text">
          <span style={{ color: 'var(--primary-color)' }}>Nutri</span>Cent
        </h1>
      </div>

      <div className="auth-header">
        <h2>Bem-vinda de volta!</h2>
        <p>Acesse sua conta para gerenciar seus pacientes.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleLogin}>
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
          <label htmlFor="password">Senha</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
          <span>{loading ? 'Entrando...' : 'Entrar'}</span>
        </button>
      </form>

      <div className="auth-footer">
        Não tem conta? <Link to="/register">Cadastre-se</Link>
      </div>
    </div>
  );
};

export default Login;
