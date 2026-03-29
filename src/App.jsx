import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import SubNav from './components/SubNav';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import ProductPage from './pages/ProductPage';
import WishlistPage from './pages/WishlistPage';
import AdminPage from './pages/AdminPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import CheckoutFlow from './components/CheckoutFlow';
import Toast from './components/Toast';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className={`app ${isAdminPath ? 'app--admin' : ''}`}>
      {!isAdminPath && <Navbar />}
      {!isAdminPath && <SubNav />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
      </Routes>
      {!isAdminPath && <Footer />}
      <CartDrawer />
      <AuthModal />
      <CheckoutFlow />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
