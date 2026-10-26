import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useMood } from '../context/MoodContext';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Trash2, Check, AlertCircle, Sparkles, Shield, Palette } from 'lucide-react';

export default function Settings() {
  const { user, updateProfile, logout, deleteAccount } = useAuth();
  const { currentMood, setMood, moods } = useMood();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [preferredMood, setPreferredMood] = useState(user?.preferredMood || currentMood);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  if (!user) {
    return (
      <div className="main-wrapper">
        <Header title="Account & Preferences" subtitle="Customize your personal space in VibeVault." />
        <div
          className="glass-panel"
          style={{
            maxWidth: '500px',
            margin: '40px auto',
            padding: '40px',
            textAlign: 'center'
          }}
        >
          <User size={48} color="var(--accent-color)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Personal Universe Offline</h3>
          <p style={{ color: 'var(--muted-color)', marginBottom: '24px', fontSize: '0.92rem' }}>
            Please sign in to sync your wardrobe, scrapbook, routines, and custom preferences with the MongoDB database.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn-secondary" style={{ textDecoration: 'none' }}>
              Create Account
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile({ name, preferredMood });
      setMood(preferredMood);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type "DELETE" exactly to confirm.');
      return;
    }
    try {
      await deleteAccount();
      navigate('/');
    } catch (err) {
      alert('Failed to delete account.');
    }
  };

  return (
    <div className="main-wrapper">
      <Header
        title="Settings & Universe"
        subtitle="Manage your profile, preferred default atmosphere, and account safety."
      />

      <div style={{ maxWidth: '680px', margin: '0 auto 40px', width: '100%' }}>
        {/* Profile Card */}
        <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div className="profile-avatar-btn" style={{ width: '60px', height: '60px', fontSize: '1.3rem' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '1.4rem' }}>{user.name}</h3>
              <p style={{ color: 'var(--muted-color)', fontSize: '0.88rem' }}>{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px' }}>
                Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-color)',
                  fontSize: '0.92rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px' }}>
                Registered Email (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(0,0,0,0.03)',
                  color: 'var(--muted-color)',
                  fontSize: '0.92rem',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '8px' }}>
                Default Preferred Atmosphere
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                {moods.map((m) => {
                  const isSelected = preferredMood === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPreferredMood(m.id)}
                      className={`mood-card ${isSelected ? 'active' : ''}`}
                      style={{ padding: '12px 8px' }}
                    >
                      <span style={{ fontSize: '1.4rem' }}>{m.emoji}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              {saveSuccess && (
                <span style={{ color: '#10b981', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> Changes saved to MongoDB!
                </span>
              )}
              <div style={{ marginLeft: 'auto' }}>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Database & Connection Information Card */}
        <div className="glass-panel" style={{ padding: '26px 32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Shield size={20} color="var(--accent-color)" />
            <h4 style={{ fontSize: '1.15rem' }}>MongoDB & Data Isolation</h4>
          </div>
          <p style={{ color: 'var(--muted-color)', fontSize: '0.88rem', lineHeight: 1.6 }}>
            Your data is stored in the MongoDB database collection tagged under your authenticated User ID.
            You can inspect collections in real-time using <strong>MongoDB Compass</strong> by connecting to the target URI in your backend <code style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>.env</code>.
          </p>
        </div>

        {/* Account Actions (Logout & Delete) */}
        <div className="glass-panel" style={{ padding: '26px 32px' }}>
          <h4 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Session & Danger Zone</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.92rem' }}>Sign out of this session</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted-color)' }}>
                Clears your current token and returns to guest preview.
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="btn-secondary"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>

          <div
            style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px dashed var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.92rem', color: '#e11d48' }}>Delete Universe & Account</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted-color)' }}>
                Permanently removes your wardrobe, scrapbook, and workouts.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-secondary"
              style={{ color: '#e11d48', borderColor: 'rgba(225, 29, 72, 0.3)' }}
            >
              <Trash2 size={16} />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)',
            zIndex: 10002,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div className="glass-panel" style={{ maxWidth: '440px', padding: '30px', textAlign: 'center' }}>
            <AlertCircle size={42} color="#e11d48" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Are you absolutely sure?</h3>
            <p style={{ color: 'var(--muted-color)', fontSize: '0.88rem', marginBottom: '16px', lineHeight: 1.5 }}>
              This will permanently delete your user record and all associated wardrobe items, scrapbook polaroids, and routine completions.
            </p>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '8px' }}>
              Type <strong style={{ color: '#e11d48' }}>DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              placeholder="DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                textAlign: 'center',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                marginBottom: '20px',
                fontSize: '0.95rem',
                letterSpacing: '0.1em'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                className="btn-primary"
                style={{
                  background: deleteConfirmText === 'DELETE' ? '#e11d48' : '#ccc',
                  cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed'
                }}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
