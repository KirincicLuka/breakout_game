import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Vaš CSS stil

// Kreiramo root i renderujemo React aplikaciju unutar div-a sa id="root"
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
