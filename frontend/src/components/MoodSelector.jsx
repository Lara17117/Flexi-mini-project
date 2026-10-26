import React from 'react';
import { useMood } from '../context/MoodContext';

export default function MoodSelector() {
  const { currentMood, setMood, moods } = useMood();

  return (
    <section className="mood-section" aria-labelledby="mood-section-title">
      <div className="mood-section-header">
        <h2 id="mood-section-title" className="mood-section-title">
          How are you feeling today?
        </h2>
        <span className="badge">
          Active: {moods.find((m) => m.id === currentMood)?.name}
        </span>
      </div>

      <div className="mood-grid" role="radiogroup" aria-label="Select mood">
        {moods.map((mood) => {
          const isSelected = currentMood === mood.id;
          return (
            <button
              key={mood.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`mood-card ${isSelected ? 'active' : ''}`}
              onClick={() => setMood(mood.id)}
              aria-label={`Select ${mood.name} mood: ${mood.description}`}
            >
              <span className="mood-emoji" aria-hidden="true">
                {mood.emoji}
              </span>
              <span className="mood-name">{mood.name}</span>
              <span className="mood-subtitle">{mood.tagline}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
