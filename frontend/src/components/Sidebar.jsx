import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Shirt, BookOpen, Sparkles, Activity, Settings, Flower2, Heart } from 'lucide-react';
import Logo from './Logo';

export default function Sidebar() {
  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/wardrobe', label: 'My Wardrobe', icon: Shirt },
    { to: '/scrapbook', label: 'Scrapbook', icon: BookOpen },
    { to: '/skincare', label: 'Skincare', icon: Sparkles },
    { to: '/workout', label: 'Workout', icon: Activity },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar" aria-label="Sidebar navigation">
      {/* Brand Header with custom Flower Wordmark */}
      <div className="sidebar-header">
        <NavLink to="/" style={{ textDecoration: 'none' }}>
          <Logo size="md" />
        </NavLink>
      </div>

      {/* Navigation section */}
      <div className="sidebar-nav-title">Your Space</div>
      <nav className="sidebar-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              end={item.to === '/'}
            >
              <Icon size={19} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Decorative Bottom Note with flower motif */}
      <div className="sidebar-bottom-note">
        <Flower2 className="note-flower" />
        <p>“A little space for everything that makes you, you.”</p>
      </div>
    </aside>
  );
}
