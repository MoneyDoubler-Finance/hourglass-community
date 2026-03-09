import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import './i18next';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading ...</div>}>
      <App />
    </Suspense>
  </React.StrictMode>
);
