import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function FeatureCard({ to, title, description, icon: Icon, stat }) {
  return (
    <Link to={to} className="feature-card" aria-label={`Open ${title}`}>
      <div>
        <div className="feature-card-header">
          <div className="feature-icon-badge">
            <Icon size={26} strokeWidth={2} />
          </div>
          {stat && <span className="badge">{stat}</span>}
        </div>
        <h3 className="feature-card-title">{title}</h3>
        <p className="feature-card-desc">{description}</p>
      </div>

      <div className="feature-card-footer">
        <span className="feature-cta">
          Explore {title}
          <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}
