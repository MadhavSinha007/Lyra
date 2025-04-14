import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Testimonials', href: '#testimonials' },
  ];

  const actionButtons = [
    { name: 'Lyra Chat', href: '/chatbot', variant: 'secondary' },
    { name: 'Get Started', href: '/analysis', variant: 'primary' },
  ];

  const renderNavLink = (item, index, isMobile = false) => (
    <motion.a
      key={item.name}
      href={item.href}
      className={`relative text-white/80 hover:text-white transition-colors font-medium text-sm group ${
        isMobile ? 'block px-3 py-2 rounded-md hover:bg-white/10' : ''
      }`}
      initial={{ opacity: 0, y: isMobile ? 0 : -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        delay: isMobile ? 0 : 0.1 * index
      }}
      onClick={() => setMobileMenuOpen(false)}
    >
      {item.name}
      {!isMobile && <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>}
    </motion.a>
  );

  const renderActionButton = (button, isMobile = false) => (
    <motion.div
    key={button.name}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
    className={isMobile ? 'w-full mt-2' : 'ml-2'}
  >
    <a
      href={button.href}
      target={['/analysis', '/chatbot'].includes(button.href) ? '_blank' : undefined}
      rel={['/analysis', '/chatbot'].includes(button.href) ? 'noopener noreferrer' : undefined}
      onClick={() => setMobileMenuOpen(false)}
    >
      <button
        className={`px-5 py-2 rounded-full transition-all duration-300 w-full ${
          button.variant === 'primary'
            ? 'bg-white text-black hover:bg-white/90'
            : 'bg-transparent border border-white text-white hover:bg-white/10'
        }`}
      >
        {button.name}
        {button.variant === 'primary' && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1 inline transform transition-transform group-hover:translate-x-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
    </a>
  </motion.div>
  );

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/90 backdrop-blur-lg shadow-sm border-b border-white/10 py-2'
          : 'bg-black/80 backdrop-blur-md py-3'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.a
          href="#"
          className="flex items-center space-x-2 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src="public/logo.png"
            alt='.'
            className="h-8 w-8"
          />
          <span className="text-2xl font-bold">LYRA</span>
        </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((item, index) => renderNavLink(item, index))}
            
            <div className="flex items-center space-x-2 ml-4">
              {actionButtons.map(button => renderActionButton(button))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden mt-4 pb-4 space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((item, index) => renderNavLink(item, index, true))}
            
            <div className="mt-4 space-y-2">
              {actionButtons.map(button => renderActionButton(button, true))}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;