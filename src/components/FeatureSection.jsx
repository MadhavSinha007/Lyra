import React, { useEffect, useRef } from 'react';
import { Brain, Heart, Music } from 'lucide-react';
import { motion, useAnimation, useInView } from 'framer-motion';

const FeaturesSection = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const features = [
    {
      icon: Brain,
      title: "Sentiment Analysis",
      description: "AI analyzes your journal entries to detect emotional patterns and provide insights.",
      color: "from-teal-100 to-teal-50",
      iconColor: "text-teal-500"
    },
    {
      icon: Heart,
      title: "Breathing Exercises",
      description: "Personalized breathing techniques recommended based on your stress levels.",
      color: "from-blue-100 to-blue-50",
      iconColor: "text-blue-500"
    },
    {
      icon: Music,
      title: "Music Recommendations",
      description: "Curated Spotify playlists tailored to your current mood and preferences.",
      color: "from-cyan-100 to-cyan-50",
      iconColor: "text-cyan-500"
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
    hidden: { y: 30, opacity: 0 },
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
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 150
      }
    }
  };

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-slate-50 to-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-teal-100 text-teal-800 mb-4">
            Features
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Personalized Mental Wellness
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Lyra provides tailored recommendations to support your emotional well-being.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className={`feature-card bg-gradient-to-br ${feature.color} p-8 rounded-2xl shadow-sm hover:shadow-md border border-white transition-all duration-300`}
            >
              <motion.div
                variants={iconVariants}
                className="icon-container relative mb-6 mx-auto w-20 h-20 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-white/80 rounded-full blur-sm"></div>
                <div className="absolute inset-0 bg-white rounded-full"></div>
                <feature.icon className={`relative z-10 ${feature.iconColor}`} size={40} />
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .feature-card {
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(4px);
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </section>
  );
};

export default FeaturesSection;