import React from 'react';
import { createRoot } from 'react-dom/client';
import TripItinerary from '../main';
import './index.css';

const container = document.getElementById('root')!;
createRoot(container).render(
  <React.StrictMode>
    <TripItinerary />
  </React.StrictMode>
);
