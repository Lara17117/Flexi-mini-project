import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const MoodContext = createContext();

export const MOODS = [
  {
    id: 'happy',
    name: 'Happy',
    emoji: '☀️',
    tagline: 'Joyful & warm',
    accentColor: '#d97706',
    description: 'Sunshine gold, sunflowers, lemons, and joyful scrapbook collage.'
  },
  {
    id: 'calm',
    name: 'Calm',
    emoji: '🌊',
    tagline: 'Serene sea water',
    accentColor: '#0284c7',
    description: 'Crystal clear sea water, gentle ocean ripples, and peaceful aquatic serenity.'
  },
  {
    id: 'romantic',
    name: 'Romantic',
    emoji: '🌹',
    tagline: 'Blush roses',
    accentColor: '#be185d',
    description: 'Blooming blush and dusty roses, scattered petals, and poetic love letters.'
  },
  {
    id: 'low-key',
    name: 'Low-key',
    emoji: '🌧️',
    tagline: 'Dark rain clouds',
    accentColor: '#334155',
    description: 'Moody atmospheric dark clouds, cozy rainy skies, and reflective quiet comfort.'
  },
  {
    id: 'energetic',
    name: 'Energetic',
    emoji: '⚡',
    tagline: 'Sports & gym',
    accentColor: '#ea580c',
    description: 'Football, basketball, dumbbells, and dynamic peach-coral workout energy.'
  }
];

export function MoodProvider({ children }) {
  const [currentMood, setCurrentMood] = useState(() => {
    return localStorage.getItem('vibevault_mood') || 'happy';
  });

  useEffect(() => {
    const root = document.documentElement;
    MOODS.forEach(m => root.classList.remove(`theme-${m.id}`));
    root.classList.add(`theme-${currentMood}`);
    localStorage.setItem('vibevault_mood', currentMood);
  }, [currentMood]);

  const setMood = async (moodId) => {
    const valid = MOODS.some(m => m.id === moodId);
    if (!valid) return;
    
    setCurrentMood(moodId);

    const token = localStorage.getItem('vibevault_token');
    if (token) {
      try {
        await api.patch('/users/me/mood', { preferredMood: moodId });
      } catch (err) {
        console.warn('Could not sync mood with cloud profile:', err.message);
      }
    }
  };

  const currentMoodObj = MOODS.find(m => m.id === currentMood) || MOODS[0];

  return (
    <MoodContext.Provider value={{ currentMood, setMood, currentMoodObj, moods: MOODS }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
}
