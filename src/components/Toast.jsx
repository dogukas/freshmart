import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import './Toast.css';

const ICONS = {
  success: '✓',
  love: '♡',
  info: 'ℹ',
  error: '✕',
};

export default function Toast() {
  const { toasts } = useCart();

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          <span className="toast__icon">{ICONS[t.type] || '✓'}</span>
          <span className="toast__message">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
