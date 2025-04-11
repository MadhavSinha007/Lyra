import React, { useEffect, useRef, useState } from 'react';
import { Brain, Heart, Music, X } from 'lucide-react';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FeatureModal = ({ feature, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Blurred overlay */}
      <motion.div
        initial={{ backdropFilter: 'blur(0px)' }}
        animate={{ backdropFilter: 'blur(8px)' }}
        exit={{ backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`relative z-50 max-w-2xl w-full rounded-2xl p-8 shadow-2xl bg-gradient-to-br ${feature.color} border border-white/10`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white"
        >
          <X size={24} />
        </button>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-lg"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/5 rounded-full border border-white/5"></div>
              <feature.icon 
                className={`relative z-10 ${feature.iconColor} drop-shadow-lg`} 
                size={60} 
              />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
            <p className="text-slate-200 mb-6">{feature.description}</p>
            <div className="bg-white/5 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-white mb-2">How it works:</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>Advanced AI analyzes your input</li>
                <li>Real-time emotional pattern detection</li>
                <li>Personalized recommendations</li>
              </ul>
            </div>
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white backdrop-blur-sm transition-all duration-300 shadow-lg">
              Try it now
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const controls = useAnimation();
  const ref = useRef(null);
  const sectionRef = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }

    // GSAP scroll animations
    gsap.fromTo(
      sectionRef.current,
      { backgroundColor: 'rgb(15 23 42)' },
      {
        backgroundColor: 'rgb(2 6 23)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        }
      }
    );

    // 3D tilt effect on hover
    const cards = document.querySelectorAll('.feature-card-3d');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const x = e.clientX - card.getBoundingClientRect().left;
        const y = e.clientY - card.getBoundingClientRect().top;
        
        const centerX = card.offsetWidth / 2;
        const centerY = card.offsetHeight / 2;
        
        const angleX = (y - centerY) / 20;
        const angleY = (centerX - x) / 20;
        
        gsap.to(card, {
          rotateX: angleX,
          rotateY: angleY,
          transformPerspective: 1000,
          transformOrigin: "center center",
          ease: "power2.out",
          duration: 0.5
        });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          ease: "elastic.out(1, 0.5)",
          duration: 1.5
        });
      });
    });

    // Floating animation for icons
    gsap.to(".floating-icon", {
      y: 10,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

  }, [isInView, controls]);

  const features = [
    {
      icon: Brain,
      title: "Sentiment Analysis",
      description: "Our AI analyzes your journal entries to detect emotional patterns and provide insights. Get detailed reports on your mood trends over time.",
      color: "from-teal-900/80 to-slate-900/80",
      iconColor: "text-teal-400",
      extendedInfo: "Our sentiment analysis goes beyond simple positive/negative detection. Using advanced NLP techniques, we can identify subtle emotional states and provide actionable insights."
    },
    {
      icon: Heart,
      title: "Breathing Exercises",
      description: "Personalized breathing techniques recommended based on your stress levels. Real-time biofeedback helps you master each technique.",
      color: "from-blue-900/80 to-slate-900/80",
      iconColor: "text-blue-400",
      extendedInfo: "Choose from 12 different breathing techniques tailored to your current state. Our system adapts to your progress and suggests new exercises as you improve."
    },
    {
      icon: Music,
      title: "Music Recommendations",
      description: "Curated Spotify playlists tailored to your current mood and preferences. Updated in real-time as your emotional state changes.",
      color: "from-cyan-900/80 to-slate-900/80",
      iconColor: "text-cyan-400",
      extendedInfo: "Our music engine analyzes thousands of tracks to find the perfect match for your current emotional state. The more you use it, the better it gets at predicting your preferences."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0, rotate: -10 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 150
      }
    }
  };

  return (
    <section 
      id="features" 
      className="py-20 bg-slate-900 text-white transition-colors duration-1000 overflow-hidden"
      ref={sectionRef}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 relative"
        >
          <motion.span 
            className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-teal-900/50 text-teal-300 mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            Features
          </motion.span>
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Personalized Mental Wellness
          </motion.h2>
          <motion.p 
            className="text-xl text-slate-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Lyra provides tailored recommendations to support your emotional well-being.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="feature-grid grid md:grid-cols-3 gap-8 relative"
          ref={ref}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="perspective-1000"
            >
              <div
                className={`feature-card-3d bg-gradient-to-br ${feature.color} p-8 rounded-2xl shadow-2xl border border-slate-700/50 transition-all duration-500 relative overflow-hidden h-full`}
                style={{
                  transformStyle: 'preserve-3d',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
              >
                {/* Inner content */}
                <div className="relative z-10 h-full flex flex-col">
                  <motion.div
                    variants={iconVariants}
                    className="icon-container relative mb-6 mx-auto w-20 h-20 flex items-center justify-center floating-icon"
                  >
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-md scale-110"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/5 rounded-full border border-white/5"></div>
                    <feature.icon 
                      className={`relative z-10 ${feature.iconColor} drop-shadow-lg`} 
                      size={40} 
                    />
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 mb-6">
                    {feature.description}
                  </p>
                  
                  {/* 3D button */}
                  <div className="mt-auto">
                    <button 
                      onClick={() => setSelectedFeature(feature)}
                      className="px-4 py-2 bg-gradient-to-r from-white/10 to-white/5 border border-white/10 rounded-lg text-white backdrop-blur-sm hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-teal-500/20 transform hover:-translate-y-1"
                    >
                      Learn more
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedFeature && (
          <FeatureModal 
            feature={selectedFeature} 
            onClose={() => setSelectedFeature(null)} 
          />
        )}
      </AnimatePresence>

      {/* Custom Styles */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .feature-card-3d {
          transform-style: preserve-3d;
          transition: transform 0.5s ease, box-shadow 0.5s ease;
        }
        
        .feature-card-3d:hover {
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.3);
        }
        
        .floating-icon {
          will-change: transform;
        }
      `}</style>
    </section>
  );
};

export default FeaturesSection;