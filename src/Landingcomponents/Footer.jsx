import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-6 md:mb-0 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
          >
            Lyra
          </motion.div>

          {/* Navigation */}
          <motion.nav 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0"
          >
            <a 
              href="#" 
              className="text-gray-300 hover:text-teal-400 transition-colors duration-300 relative group"
            >
              Home
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-teal-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a 
              href="#features" 
              className="text-gray-300 hover:text-teal-400 transition-colors duration-300 relative group"
            >
              Features
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-teal-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a 
              href="#testimonials" 
              className="text-gray-300 hover:text-teal-400 transition-colors duration-300 relative group"
            >
              Testimonials
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-teal-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </motion.nav>

          {/* Social Links */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex space-x-6"
          >
            <a 
              href="#" 
              className="text-gray-300 hover:text-teal-400 transition-colors duration-300"
              aria-label="Twitter"
            >
              <Twitter className="w-6 h-6" />
            </a>
            <a 
              href="#" 
              className="text-gray-300 hover:text-teal-400 transition-colors duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-6 h-6" />
            </a>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center text-gray-500 text-sm pt-8 border-t border-gray-800"
        >
          © 2024 Lyra. All Rights Reserved.
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;