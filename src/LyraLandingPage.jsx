import React, { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import NavBar from './components/NavBar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeatureSection';
import TestimonialSection from './components/TestimonialSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

const LyraLandingPage = () => {
  // Smooth scroll behavior
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Remove default scroll behavior
      window.history.scrollRestoration = 'manual';
      
      // Smooth scroll polyfill for Safari
      if (!('scrollBehavior' in document.documentElement.style)) {
        import('smoothscroll-polyfill').then((smoothscroll) => {
          smoothscroll.polyfill();
        });
      }
    }
  }, []);

  // Scroll progress indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="bg-white text-gray-900 font-sans antialiased overflow-x-hidden">
      {/* Scroll progress indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-cyan-500 z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Smooth scroll container */}
      <div className="scroll-smooth">
        <NavBar />
        <HeroSection />
        <FeaturesSection />
        <TestimonialSection />
        <CTASection />
        <Footer />
      </div>

      {/* Back to top button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.8, y: 0 }}
        whileHover={{ opacity: 1, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-gradient-to-br from-teal-500 to-cyan-600 text-white p-3 rounded-full shadow-lg z-40"
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>
    </div>
  );
};

export default LyraLandingPage;