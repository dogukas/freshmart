import React from 'react';
import HeroSection from '../sections/HeroSection';
import PopularCategories from '../sections/PopularCategories';
import HeroLightSection from '../sections/HeroLightSection';
import FreshPicksSection from '../sections/FreshPicksSection';
import PromoSection from '../sections/PromoSection';
import Reveal from '../components/Reveal';

export default function HomePage() {
  return (
    <main className="app__main">
      <Reveal delay={0} origin="top">
        <HeroSection />
      </Reveal>
      
      <Reveal delay={150}>
        <PopularCategories />
      </Reveal>
      
      <Reveal delay={150} origin="left">
        <HeroLightSection />
      </Reveal>
      
      <Reveal delay={150} origin="right">
        <FreshPicksSection />
      </Reveal>
      
      <Reveal delay={150}>
        <PromoSection />
      </Reveal>
    </main>
  );
}
