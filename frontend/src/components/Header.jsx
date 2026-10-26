import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMood } from '../context/MoodContext';
import { User as UserIcon, Sparkles } from 'lucide-react';

export default function Header({
  title = 'Make today feel like you.',
  subtitle = 'Your little corner of the world, designed around how you feel.'
}) {
  const { user } = useAuth();
  const { currentMoodObj } = useMood();

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : null;

  return (
    <header className="main-header">
      <div>
        <div className="header-greeting-date">
          <span>{today}</span>
          <span style={{ margin: '0 8px' }}>•</span>
          <span>Mood: {currentMoodObj.name} {currentMoodObj.emoji}</span>
        </div>
        <h1 className="header-title">{title}</h1>
        <p className="header-subtitle">{subtitle}</p>
      </div>

      <div className="header-user-section">
        {user ? (
          <Link
            to="/settings"
            className="profile-avatar-btn"
            title={`${user.name} (${user.email}) - Settings`}
            aria-label="User settings"
          >
            {initial}
          </Link>
        ) : (
          <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none' }}>
            <UserIcon size={16} />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
