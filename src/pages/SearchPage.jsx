import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import './SearchPage.css';

export default function SearchPage() {
  const { products, isLoadingProducts } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  const searchQuery = queryParams.get('q')?.toLowerCase() || '';
  const categoryFilter = queryParams.get('category')?.toLowerCase() || '';

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const prodName = product.name?.toLowerCase() || '';
      const prodCat = product.category?.toLowerCase() || '';
      
      const matchesSearch = prodName.includes(searchQuery);
      
      // Category match: either exact match or the name contains the category key (fallback for loose data)
      const matchesCategory = !categoryFilter || 
                              prodCat === categoryFilter || 
                              prodCat.includes(categoryFilter) ||
                              prodName.includes(categoryFilter);
                              
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  if (isLoadingProducts) {
    return (
      <div className="search-page__loading">
        <div className="search-page__container">
          <h2 className="section-title">Searching...</h2>
          <div className="search-page__grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton-card" style={{ height: '380px' }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <div className="search-page__container">
        <div className="search-page__header">
          <button className="search-page__back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h2 className="section-title">
            {categoryFilter 
              ? `Category: ${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}` 
              : searchQuery 
                ? `Search results for "${searchQuery}"`
                : "All Products"}
          </h2>
          <p className="search-page__count">{filteredProducts.length} items found</p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="search-page__no-results">
            <div className="no-results__icon">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or category filters.</p>
            <button className="no-results__btn" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="search-page__grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
