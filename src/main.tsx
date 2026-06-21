import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { isEmbedded } from './lib/embed';
import './index.css';

// 起動時に iframe 埋め込みを判定し、<html> に印を付ける。
// 埋め込み時はアプリ内スクロールを解除し、親ページスクロールへ集約する（index.css 参照）。
if (isEmbedded()) {
  document.documentElement.setAttribute('data-embedded', 'true');
  document.documentElement.classList.add('is-embedded');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
