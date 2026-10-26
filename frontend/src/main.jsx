import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { MoodProvider } from './context/MoodContext';

import './styles/themes.css';
import './styles/global.css';
import './styles/components.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MoodProvider>
          <App />
        </MoodProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
