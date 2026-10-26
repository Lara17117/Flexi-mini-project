import React from 'react';

/**
 * VibeVault distinctive Logo Wordmark
 * Features a rounded, friendly typography and a delicate 5-petal flower motif
 * blossoming above the dotless lowercase letter "ı".
 */
export default function Logo({ size = 'md', className = '' }) {
  return (
    <div className={`brand-wordmark ${size} ${className}`} aria-label="VibeVault">
      <span className="wordmark-container">
        <span>V</span>
        <span className="letter-i-wrapper">
          {/* Dotless lowercase ı */}
          <span>ı</span>
          {/* Flower bloom sitting precisely above the stem */}
          <svg
            className="flower-crown"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* 5 rounded aesthetic petals */}
            <circle cx="12" cy="5.5" r="3.2" fill="currentColor" opacity="0.9" />
            <circle cx="17.8" cy="9.8" r="3.2" fill="currentColor" opacity="0.9" />
            <circle cx="15.5" cy="16.5" r="3.2" fill="currentColor" opacity="0.9" />
            <circle cx="8.5" cy="16.5" r="3.2" fill="currentColor" opacity="0.9" />
            <circle cx="6.2" cy="9.8" r="3.2" fill="currentColor" opacity="0.9" />
            {/* Center pistil */}
            <circle cx="12" cy="11.5" r="2.8" fill="#fff" opacity="0.95" />
            <circle cx="12" cy="11.5" r="1.5" fill="#f59e0b" />
          </svg>
        </span>
        <span>beVault</span>
      </span>
    </div>
  );
}
