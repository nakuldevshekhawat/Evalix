import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setDemo = (username) => setForm({ username, password: 'admin123' });

  return (
    <div className="login-screen">
      <div className="login-bg-orb o1" />
      <div className="login-bg-orb o2" />
      <div className="login-bg-orb o3" />

      <form className="login-box" onSubmit={handleSubmit}>
        <div className="login-logo">
          <div className="login-logo-dot" />
          Student Result Management System
        </div>
        <div className="login-title">
          Welcome<br />
          <span>Back.</span>
        </div>

        <div className="field">
          <label>Username</label>
          <input
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            placeholder="Enter your username"
            autoFocus
            autoComplete="username"
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: 16 }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Signing in...
            </span>
          ) : 'Sign In →'}
        </button>

        <div className="login-hint">
          <div style={{ marginBottom: 10, color: 'var(--text2)', fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>QUICK ACCESS</div>
          <button type="button" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', fontSize: 11 }} onClick={() => setDemo('faculty1')}>
            Login as Faculty Demo
          </button>
        </div>

      </form>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
