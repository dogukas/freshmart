import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import './HeroLightSection.css';

export default function HeroLightSection() {
  const { products, isLoadingProducts } = useCart();
  
  // Show only 5 products in this section for layout
  const displayProducts = products.slice(0, 5);

  return (
    <section className="hero-light-section">
      {/* Top: Blue hero banner */}
      <div className="hero-light__banner">
        <div className="hero-light__text">
          <h2 className="hero-light__heading">Ready To Fill Your Cart With Freshness?</h2>
          <p className="hero-light__subtext">
            Shop farm-fresh groceries, daily essentials, and exclusive deals delivered straight to your door.
          </p>
          <div className="hero-light__app-buttons">
            <div className="app-store-btn">
              <span>🍎</span>
              <div>
                <div className="app-btn-label">Download on the</div>
                <div className="app-btn-name">App Store</div>
              </div>
            </div>
            <div className="app-store-btn">
              <span>▶</span>
              <div>
                <div className="app-btn-label">Get it on</div>
                <div className="app-btn-name">Google Play</div>
              </div>
            </div>
          </div>
        </div>
        <img src="/images/basket_hero.png" alt="Fresh basket" className="hero-light__basket" />
      </div>

      {/* Bottom: Products row */}
      <div className="hero-light__products-row">
        <div className="hero-light__products-header">
          <h3 className="section-subtitle">Just for you</h3>
          <Link to="/search" className="show-all-btn">Show All <span>›</span></Link>
        </div>
        <div className="hero-light__products-scroll">
          {isLoadingProducts ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="product-card skeleton-card">
                <div className="skeleton-img"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
              </div>
            ))
          ) : (
            displayProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
