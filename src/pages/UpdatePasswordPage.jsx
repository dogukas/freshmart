import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import './UpdatePasswordPage.css';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a hash in the URL (Supabase appends the recovery token to the hash)
    const hash = window.location.hash;
    if (!hash || !hash.includes('type=recovery')) {
      setError('Geçersiz veya süresi dolmuş sıfırlama bağlantısı.');
    }
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage('Şifreniz başarıyla güncellendi! Yönlendiriliyorsunuz...');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Şifre güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-password-page">
      <div className="update-password-container">
        <h2>Yeni Şifre Belirleme</h2>

        {error && <div className="update-error">{error}</div>}
        {message && <div className="update-success">{message}</div>}

        <form onSubmit={handleUpdatePassword} className="update-form">
          <div className="form-group">
            <label>Yeni Şifreniz</label>
            <input 
              type="password"
              placeholder="En az 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="update-btn" 
            disabled={loading || !!message}
          >
            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>
    </div>
  );
}
