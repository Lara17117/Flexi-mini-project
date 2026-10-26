import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import MoodSelector from '../components/MoodSelector';
import FeatureCard from '../components/FeatureCard';
import Footer from '../components/Footer';
import { Shirt, BookOpen, Sparkles, Activity, Sparkle, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMood } from '../context/MoodContext';
import api from '../services/api';

export default function Home() {
  const { user } = useAuth();
  const { currentMoodObj } = useMood();
  const [stats, setStats] = useState({
    wardrobe: 0,
    memories: 0,
    skincareSteps: 0,
    workoutMins: 0
  });

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        const [wRes, sRes, skRes, woRes] = await Promise.allSettled([
          api.get('/wardrobe'),
          api.get('/scrapbook'),
          api.get('/skincare/routine'),
          api.get('/workouts/summary')
        ]);

        setStats({
          wardrobe: wRes.status === 'fulfilled' ? wRes.value.data.count : 0,
          memories: sRes.status === 'fulfilled' ? sRes.value.data.count : 0,
          skincareSteps: skRes.status === 'fulfilled' ? skRes.value.data.count : 0,
          workoutMins: woRes.status === 'fulfilled' ? (woRes.value.data.summary?.todayMinutes || 0) : 0
        });
      } catch (err) {
        console.warn('Stats fetch warning:', err);
      }
    }
    fetchStats();
  }, [user]);

  return (
    <div className="main-wrapper">
      <Header
        title={user ? `Welcome back, ${user.name.split(' ')[0]}.` : 'Make today feel like you.'}
        subtitle="Your little corner of the world, designed around how you feel."
      />

      {/* Mood Selector */}
      <MoodSelector />

      {/* Feature Lifestyle Cards Grid */}
      <section aria-labelledby="features-heading">
        <h2 id="features-heading" className="visually-hidden" style={{ position: 'absolute', opacity: 0 }}>
          Lifestyle Modules
        </h2>
        <div className="features-grid">
          <FeatureCard
            to="/wardrobe"
            title="My Wardrobe"
            description="Find a look that feels like you. Organize outfits, catalog your favorite pieces, and curate effortless everyday ensembles."
            icon={Shirt}
            stat={stats.wardrobe ? `${stats.wardrobe} items saved` : 'Catalog looks'}
          />

          <FeatureCard
            to="/scrapbook"
            title="Scrapbook"
            description="Save the little things worth remembering. Polaroid snapshots, poetic memories, pressed flowers, and gratitude notes."
            icon={BookOpen}
            stat={stats.memories ? `${stats.memories} memories` : 'Journal today'}
          />

          <FeatureCard
            to="/skincare"
            title="Skincare"
            description="A gentle routine, just for you. Track morning and evening rituals, pamper your skin barrier, and glow at your own pace."
            icon={Sparkles}
            stat={stats.skincareSteps ? `${stats.skincareSteps} ritual steps` : 'Daily glow'}
          />

          <FeatureCard
            to="/workout"
            title="Workout"
            description="Move in a way that feels good. Gentle yoga, uplifting walks, mindful pilates, and celebrating moving your body without pressure."
            icon={Activity}
            stat={stats.workoutMins ? `${stats.workoutMins}m moved today` : 'Mindful movement'}
          />
        </div>
      </section>

      {/* Aesthetic Mood Inspiration Callout */}
      <section
        className="glass-panel"
        style={{
          padding: '24px 30px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              fontSize: '2rem',
              lineHeight: 1,
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
            }}
          >
            {currentMoodObj.emoji}
          </div>
          <div>
            <h3 style={{ fontSize: '1.18rem', marginBottom: '2px' }}>
              Currently embodying: {currentMoodObj.name}
            </h3>
            <p style={{ color: 'var(--muted-color)', fontSize: '0.9rem' }}>
              {currentMoodObj.description}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge" style={{ fontSize: '0.82rem' }}>
            {currentMoodObj.tagline}
          </span>
        </div>
      </section>

      <Footer />
    </div>
  );
}
