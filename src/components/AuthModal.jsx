import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './AuthModal.css';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, signIn, signUp, resetPassword } = useAuth();
  const { showToast } = useCart();
  
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        showToast('Başarıyla giriş yapıldı! Hoşgeldiniz.', 'success');
        setAuthModalOpen(false);
      } else if (view === 'register') {
        const { error } = await signUp(email, password);
        if (error) throw error;
        showToast('Kayıt başarılı! Lütfen e-postanızı kontrol edin veya giriş yapın.', 'success');
        setView('login');
      } else if (view === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        showToast('Şifre sıfırlama bağlantısı e-postanıza gönderildi.', 'success');
        setView('login');
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
          <h2 className="auth-title">
            {view === 'login' && 'Hoşgeldiniz'}
            {view === 'register' && 'Hesap Oluştur'}
            {view === 'forgot' && 'Şifremi Unuttum'}
          </h2>
          <p className="auth-subtitle">
            {view === 'login' && 'Devam etmek için hesabınıza giriş yapın.'}
            {view === 'register' && 'Taptaze ürünler için hemen aramıza katılın.'}
            {view === 'forgot' && 'Hesabınıza kayıtlı e-postayı girin, sıfırlama linki gönderelim.'}
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

          {view !== 'forgot' && (
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
              {view === 'login' && (
                <span className="auth-forgot-link" onClick={() => setView('forgot')}>
                  Şifremi unuttum
                </span>
              )}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn" 
            disabled={loading}
          >
            {loading ? 'İşleniyor...' : (view === 'login' ? 'Giriş Yap' : view === 'register' ? 'Kayıt Ol' : 'Link Gönder')}
          </button>
        </form>

        <div className="auth-footer">
          {view === 'login' ? (
            <p>Hesabınız yok mu? <span className="auth-link" onClick={() => setView('register')}>Hemen Kayıt Olun</span></p>
          ) : view === 'register' ? (
            <p>Zaten üye misiniz? <span className="auth-link" onClick={() => setView('login')}>Giriş Yapın</span></p>
          ) : (
            <p><span className="auth-link" onClick={() => setView('login')}>Giriş ekranına dön</span></p>
          )}
        </div>
      </div>
    </div>
  );
}
