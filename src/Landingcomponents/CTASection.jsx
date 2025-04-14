import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="relative py-24 bg-black text-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-white/10 filter blur-[100px]"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-white/10 filter blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Take Control of Your <br className="hidden md:block" /> Emotional Well-being Today
          </h2>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed">
            Your mental health journey starts with understanding. <br className="hidden md:block" /> Let Lyra guide you with personalized insights.
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <a href="/analysis" target="_blank" rel="noopener noreferrer">
              <button className="group relative overflow-hidden bg-white text-black font-semibold px-10 py-4 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Your Journey
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </a>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -15, 0],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
            className="w-3 h-3 rounded-full bg-white/80"
          />
        ))}
      </div>
    </section>
  );
};

export default CTASection;