import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMood } from '../context/MoodContext';
import Logo from '../components/Logo';
import { ArrowRight, Lock, Mail, User, AlertCircle } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredMood, setPreferredMood] = useState('happy');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { moods } = useMood();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password, preferredMood);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          maxWidth: '460px',
          padding: '40px 32px',
          textAlign: 'center'
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <Logo size="lg" />
          <p style={{ color: 'var(--muted-color)', fontSize: '0.88rem', marginTop: '6px' }}>
            YOUR LITTLE UNIVERSE
          </p>
        </div>

        <h2 style={{ fontSize: '1.55rem', marginBottom: '8px' }}>Create Your Space</h2>
        <p style={{ color: 'var(--muted-color)', fontSize: '0.88rem', marginBottom: '20px' }}>
          Begin your journey with your own mood-adaptive lifestyle dashboard.
        </p>

        {error && (
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(225, 29, 72, 0.1)',
              color: '#e11d48',
              fontSize: '0.86rem',
              marginBottom: '18px',
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
              Your Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-color)' }} />
              <input
                type="text"
                required
                placeholder="e.g. Luna Skye"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
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
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
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
                  padding: '10px 14px 10px 38px',
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
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
              Password (min. 6 characters)
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
                  padding: '10px 14px 10px 38px',
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
              Starting Mood Atmosphere
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              {moods.map((m) => {
                const isSelected = preferredMood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPreferredMood(m.id)}
                    className={`mood-card ${isSelected ? 'active' : ''}`}
                    style={{ padding: '8px 4px' }}
                    title={m.name}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{m.emoji}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
          >
            {loading ? 'Creating Universe...' : 'Create Account'}
            <ArrowRight size={16} />
          </button>
        </form>

        <p style={{ marginTop: '22px', fontSize: '0.88rem', color: 'var(--muted-color)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
