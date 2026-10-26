import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import IntroScreen from './components/IntroScreen';
import Home from './pages/Home';
import Wardrobe from './pages/Wardrobe';
import Scrapbook from './pages/Scrapbook';
import Skincare from './pages/Skincare';
import Workout from './pages/Workout';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app-container">
      {/* 3-Second Full-Screen Opening Branded Intro */}
      <IntroScreen />

      {/* Mood Adaptive Background Image Layer */}
      <div className="app-bg-layer" aria-hidden="true" />

      {/* Soft translucent overlay layer for text readability */}
      <div className="app-overlay-layer" aria-hidden="true" />

      {/* Main Layout Area */}
      <div className="app-layout">
        {!isAuthPage && <Sidebar />}

        <main style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wardrobe" element={<Wardrobe />} />
            <Route path="/scrapbook" element={<Scrapbook />} />
            <Route path="/skincare" element={<Skincare />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
