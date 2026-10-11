import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Typography follows the client's reference: EB Garamond + Italianno script.
import '@fontsource/eb-garamond/latin-400.css';
import '@fontsource/eb-garamond/latin-500.css';
import '@fontsource/eb-garamond/latin-400-italic.css';
import '@fontsource/italianno/latin-400.css';
import './styles.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
