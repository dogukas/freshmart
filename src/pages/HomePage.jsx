import React from 'react';
import HeroSection from '../sections/HeroSection';
import PopularCategories from '../sections/PopularCategories';
import HeroLightSection from '../sections/HeroLightSection';
import FreshPicksSection from '../sections/FreshPicksSection';
import PromoSection from '../sections/PromoSection';

export default function HomePage() {
  return (
    <main className="app__main">
      <HeroSection />
      <PopularCategories />
      <HeroLightSection />
      <FreshPicksSection />
      <PromoSection />
    </main>
  );
}
