import React, { useState, useEffect } from 'react';

export default function IntroScreen({ onComplete }) {
  const [stage, setStage] = useState('active'); // 'active' | 'fading' | 'done'

  useEffect(() => {
    // Check if user already saw intro in this session or prefers reduced motion
    const alreadySeen = sessionStorage.getItem('vibevault_intro_seen');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (alreadySeen || prefersReducedMotion) {
      setStage('done');
      if (onComplete) onComplete();
      return;
    }

    // After 2.5 seconds, start the fade-out
    const fadeTimer = setTimeout(() => {
      setStage('fading');
    }, 2500);

    // After 3.2 seconds, complete and remove from DOM
    const completeTimer = setTimeout(() => {
      setStage('done');
      sessionStorage.setItem('vibevault_intro_seen', 'true');
      if (onComplete) onComplete();
    }, 3200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (stage === 'done') return null;

  return (
    <div
      className={`intro-screen ${stage === 'fading' ? 'fade-out' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="VibeVault Introduction"
    >
      <div className="intro-content">
        {/* Flower blossoming motif */}
        <svg
          className="intro-flower-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="5.5" r="3.2" fill="#f59e0b" />
          <circle cx="17.8" cy="9.8" r="3.2" fill="#f59e0b" />
          <circle cx="15.5" cy="16.5" r="3.2" fill="#f59e0b" />
          <circle cx="8.5" cy="16.5" r="3.2" fill="#f59e0b" />
          <circle cx="6.2" cy="9.8" r="3.2" fill="#f59e0b" />
          <circle cx="12" cy="11.5" r="2.8" fill="#fff" />
          <circle cx="12" cy="11.5" r="1.5" fill="#d97706" />
        </svg>

        {/* Wordmark with flower crown */}
        <h1 className="intro-title">
          <span>V</span>
          <span className="letter-i-wrapper">
            <span>ı</span>
            <svg
              className="flower-crown"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="5.5" r="3.2" fill="#f59e0b" />
              <circle cx="17.8" cy="9.8" r="3.2" fill="#f59e0b" />
              <circle cx="15.5" cy="16.5" r="3.2" fill="#f59e0b" />
              <circle cx="8.5" cy="16.5" r="3.2" fill="#f59e0b" />
              <circle cx="6.2" cy="9.8" r="3.2" fill="#f59e0b" />
              <circle cx="12" cy="11.5" r="2.8" fill="#fff" />
              <circle cx="12" cy="11.5" r="1.5" fill="#d97706" />
            </svg>
          </span>
          <span>beVault</span>
        </h1>

        <p className="intro-tagline">YOUR LITTLE UNIVERSE</p>
      </div>
    </div>
  );
}
