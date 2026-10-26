import React from 'react';
import { Heart } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Logo size="sm" />
        <span>— Your Little Universe</span>
      </div>
      <div>
        <span>Crafted with gentle care &bull; {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
