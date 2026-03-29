import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './AuthModal.css';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, signIn, signUp } = useAuth();
  const { showToast } = useCart();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        showToast('Başarıyla giriş yapıldı! Hoşgeldiniz.', 'success');
        setAuthModalOpen(false);
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        showToast('Kayıt başarılı! Lütfen giriş yapınız.', 'success');
        setIsLogin(true); // Switch to login view
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setAuthModalOpen(false);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="auth-overlay" onClick={closeModal}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        
        <button className="auth-close" onClick={closeModal}>✕</button>

        <div className="auth-header">
          <h2 className="auth-title">{isLogin ? 'Hoşgeldiniz' : 'Hesap Oluştur'}</h2>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Devam etmek için hesabınıza giriş yapın.' 
              : 'Taptaze ürünler için hemen aramıza katılın.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label className="auth-label">E-Posta</label>
            <input 
              type="email" 
              className="auth-input" 
              placeholder="isim@adres.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Şifre</label>
            <input 
              type="password" 
              className="auth-input" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn" 
            disabled={loading}
          >
            {loading ? 'İşleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>Hesabınız yok mu? <span className="auth-link" onClick={() => setIsLogin(false)}>Hemen Kayıt Olun</span></p>
          ) : (
            <p>Zaten üye misiniz? <span className="auth-link" onClick={() => setIsLogin(true)}>Giriş Yapın</span></p>
          )}
        </div>
      </div>
    </div>
  );
}
