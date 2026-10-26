import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import {
  Activity,
  Plus,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ACTIVITY_TYPES = [
  'Pilates',
  'Yoga',
  'Walking',
  'Running',
  'Strength',
  'Dance',
  'Stretching',
  'Cycling',
  'Swimming',
  'Other'
];

export default function Workout() {
  const [workouts, setWorkouts] = useState([]);
  const [summary, setSummary] = useState({
    totalMinutes: 0,
    todayMinutes: 0,
    completedCount: 0,
    todayCount: 0,
    byType: {}
  });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    activityName: '',
    activityType: 'Walking',
    durationMinutes: 30,
    notes: '',
    activityDate: new Date().toISOString().split('T')[0],
    completed: true
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = '';
      if (filterType !== 'all') query = `?type=${filterType}`;

      const [listRes, sumRes] = await Promise.all([
        api.get(`/workouts${query}`),
        api.get('/workouts/summary')
      ]);

      setWorkouts(listRes.data.workouts || []);
      setSummary(sumRes.data.summary || {});
    } catch (err) {
      console.error('Error fetching workouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType]);

  const handleOpenAddModal = () => {
    setEditingWorkout(null);
    setFormData({
      activityName: '',
      activityType: 'Yoga',
      durationMinutes: 30,
      notes: '',
      activityDate: new Date().toISOString().split('T')[0],
      completed: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (w) => {
    setEditingWorkout(w);
    setFormData({
      activityName: w.activityName,
      activityType: w.activityType,
      durationMinutes: w.durationMinutes,
      notes: w.notes || '',
      activityDate: w.activityDate ? new Date(w.activityDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      completed: w.completed !== false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.activityName.trim() || !formData.durationMinutes) return;

    try {
      if (editingWorkout) {
        await api.patch(`/workouts/${editingWorkout._id}`, formData);
      } else {
        await api.post('/workouts', formData);
        if (formData.completed) {
          try {
            confetti({
              particleCount: 30,
              spread: 50,
              origin: { y: 0.7 }
            });
          } catch (e) {}
        }
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save activity.');
    }
  };

  const toggleCompleted = async (w) => {
    try {
      const nextVal = !w.completed;
      await api.patch(`/workouts/${w._id}`, { completed: nextVal });
      if (nextVal) {
        try {
          confetti({
            particleCount: 20,
            spread: 40,
            origin: { y: 0.8 }
          });
        } catch (e) {}
      }
      fetchData();
    } catch (err) {
      console.error('Failed to toggle workout status:', err);
    }
  };

  const handleDelete = async () => {
    if (!workoutToDelete) return;
    try {
      await api.delete(`/workouts/${workoutToDelete._id}`);
      setWorkoutToDelete(null);
      fetchData();
    } catch (err) {
      alert('Could not delete workout session.');
    }
  };

  return (
    <div className="main-wrapper">
      <Header
        title="Mindful Movement"
        subtitle="Move in a way that feels good. Honoring your body without pressure, expectations, or comparison."
      />

      {/* Encouraging Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '18px',
          marginBottom: '28px'
        }}
      >
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted-color)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Today's Movement
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              {summary.todayMinutes || 0}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--muted-color)' }}>minutes</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted-color)', marginTop: '4px' }}>
            {summary.todayMinutes >= 30 ? '🌿 Wonderful mindful pace today!' : 'A 10-minute stretch counts too.'}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted-color)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Total Mindful Time
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              {summary.totalMinutes || 0}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--muted-color)' }}>minutes</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted-color)', marginTop: '4px' }}>
            Across {summary.completedCount || 0} nourishing sessions
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted-color)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Movement Philosophy
          </span>
          <div style={{ marginTop: '8px', fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--text-color)', lineHeight: 1.5 }}>
            “Listen to what your body needs today — whether it's stillness, a walk, or a dance.”
          </div>
        </div>
      </div>

      {/* Control Bar: Activity Filter & Log Button */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterType('all')}
            className={filterType === 'all' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
          >
            All Movement
          </button>
          {['Pilates', 'Yoga', 'Walking', 'Running', 'Dance'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={filterType === t ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
            >
              {t}
            </button>
          ))}
        </div>

        <button onClick={handleOpenAddModal} className="btn-primary">
          <Plus size={16} />
          <span>Log Activity</span>
        </button>
      </div>

      {/* Activity Log List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted-color)' }}>
          <Sparkles className="spin" size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
          <p>Fetching your activity journal...</p>
        </div>
      ) : workouts.length === 0 ? (
        <div
          className="glass-panel"
          style={{ textAlign: 'center', padding: '50px 20px', maxWidth: '520px', margin: '40px auto' }}
        >
          <Activity size={36} color="var(--accent-color)" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No movement recorded</h3>
          <p style={{ color: 'var(--muted-color)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Log a sunrise walk, a relaxing stretch, or a heart-pumping pilates session.
          </p>
          <button onClick={handleOpenAddModal} className="btn-primary">
            <Plus size={16} />
            Log First Movement
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
          {workouts.map(w => (
            <div
              key={w._id}
              className="glass-panel"
              style={{
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                borderLeft: w.completed ? '4px solid var(--accent-color)' : '4px solid var(--border-color)',
                opacity: w.completed ? 1 : 0.8
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <button
                  onClick={() => toggleCompleted(w)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: w.completed ? 'var(--accent-color)' : 'var(--muted-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                  title={w.completed ? 'Mark uncompleted' : 'Mark completed'}
                >
                  {w.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{w.activityName}</span>
                    <span className="badge">{w.activityType}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-color)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} />
                      {w.durationMinutes} mins
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--muted-color)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} />
                      {new Date(w.activityDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {w.notes && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted-color)', marginTop: '4px' }}>
                      {w.notes}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleOpenEditModal(w)}
                  className="btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                >
                  <Edit3 size={13} />
                </button>
                <button
                  onClick={() => setWorkoutToDelete(w)}
                  className="btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#e11d48' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Activity Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.35rem' }}>{editingWorkout ? 'Edit Activity' : 'Log Mindful Movement'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Activity Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset Golden Hour Walk"
                  value={formData.activityName}
                  onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-color)'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Type
                  </label>
                  <select
                    value={formData.activityType}
                    onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-color)'
                    }}
                  >
                    {ACTIVITY_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Duration (mins) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-color)'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={formData.activityDate}
                  onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-color)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Feelings & Reflections (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Felt so energized afterwards, great breathwork..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-color)',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="workout-completed"
                  checked={formData.completed}
                  onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                />
                <label htmlFor="workout-completed" style={{ fontSize: '0.88rem', cursor: 'pointer' }}>
                  Completed this activity
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingWorkout ? 'Save Activity' : 'Save Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {workoutToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 10002,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div className="glass-panel" style={{ maxWidth: '400px', padding: '26px', textAlign: 'center' }}>
            <AlertCircle size={36} color="#e11d48" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Remove activity?</h3>
            <p style={{ color: 'var(--muted-color)', fontSize: '0.88rem', marginBottom: '20px' }}>
              Delete <strong>"{workoutToDelete.activityName}"</strong> from your log?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button onClick={() => setWorkoutToDelete(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleDelete} className="btn-primary" style={{ background: '#e11d48' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
