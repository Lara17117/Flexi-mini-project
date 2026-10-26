import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('luna@vibevault.app', 'password123');
      navigate('/');
    } catch (err) {
      setError('Could not connect to demo account. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px 32px',
          textAlign: 'center'
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <Logo size="lg" />
          <p style={{ color: 'var(--muted-color)', fontSize: '0.88rem', marginTop: '8px' }}>
            YOUR LITTLE UNIVERSE
          </p>
        </div>

        <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Welcome Home</h2>
        <p style={{ color: 'var(--muted-color)', fontSize: '0.88rem', marginBottom: '24px' }}>
          Enter your sanctuary to explore your wardrobe, scrapbook, and daily rituals.
        </p>

        {error && (
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(225, 29, 72, 0.1)',
              color: '#e11d48',
              fontSize: '0.86rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'left'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-color)' }} />
              <input
                type="email"
                required
                placeholder="you@universe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-color)',
                  fontSize: '0.92rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-color)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-color)',
                  fontSize: '0.92rem'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px' }}
          >
            {loading ? 'Entering...' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ margin: '22px 0 16px', position: 'relative', textAlign: 'center' }}>
          <div style={{ height: '1px', background: 'var(--border-color)', width: '100%' }} />
          <span
            style={{
              position: 'relative',
              top: '-10px',
              background: 'var(--panel-bg)',
              padding: '0 12px',
              fontSize: '0.78rem',
              color: 'var(--muted-color)'
            }}
          >
            OR EXPLORE INSTANTLY
          </span>
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="btn-secondary"
          style={{ width: '100%', padding: '11px', justifyContent: 'center' }}
        >
          <Sparkles size={16} color="var(--accent-color)" />
          <span>One-Click Demo Universe</span>
        </button>

        <p style={{ marginTop: '24px', fontSize: '0.88rem', color: 'var(--muted-color)' }}>
          Don't have a universe yet?{' '}
          <Link to="/register" style={{ color: 'var(--accent-color)', fontWeight: 600, textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
