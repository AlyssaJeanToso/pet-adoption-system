import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './AuthContext';
import './styles.css';

// This entry file stays plain JavaScript; JSX lives in the .jsx component files.
const h = React.createElement;

createRoot(document.getElementById('root')).render(
  h(
    React.StrictMode,
    null,
    h(BrowserRouter, null, h(AuthProvider, null, h(App)))
  )
);
