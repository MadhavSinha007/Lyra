import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: "Emily Rodriguez",
    role: "Software Engineer",
    quote: "Lyra has transformed how I understand my emotional patterns. The AI insights are remarkably accurate and have helped me recognize triggers I wasn't aware of.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 2,
    name: "Alex Chen",
    role: "Graphic Designer",
    quote: "As someone who struggles with anxiety, Lyra's compassionate tracking and gentle reminders have made my mental health journey much more manageable.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 3,
    name: "Jordan Taylor",
    role: "Marketing Manager",
    quote: "The multi-dimensional analysis gives me a complete picture of my well-being. I've never had such comprehensive insights into my emotional health.",
    rating: 4,
    avatar: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    id: 4,
    name: "Sam Wilson",
    role: "University Student",
    quote: "Lyra's breathing exercises and music recommendations have been lifesavers during exam season. It's like having a personal wellness coach.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/75.jpg"
  }
];

const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timeoutRef = useRef(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    resetTimeout();
    if (isAutoPlaying) {
      timeoutRef.current = setTimeout(() => {
        nextTestimonial();
      }, 5000);
    }

    return () => {
      resetTimeout();
    };
  }, [currentIndex, isAutoPlaying]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <section id="testimonials" className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-white/10 text-white mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl font-bold text-white mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Hear from people who've transformed their mental well-being with Lyra
          </p>
        </div>

        <div 
          className="max-w-4xl mx-auto relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button 
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 bg-white/10 p-3 rounded-full shadow-md hover:bg-white/20 transition-all hover:scale-110"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="text-white" size={24} />
          </button>
          
          <button 
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 bg-white/10 p-3 rounded-full shadow-md hover:bg-white/20 transition-all hover:scale-110"
            aria-label="Next testimonial"
          >
            <ChevronRight className="text-white" size={24} />
          </button>

          <div className="relative h-96">
            <AnimatePresence custom={direction} initial={false}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="absolute inset-0 bg-black/50 rounded-2xl shadow-lg p-8 flex flex-col items-center border border-white/10"
              >
                <div className="relative mb-6">
                  <img
                    src={testimonials[currentIndex].avatar}
                    alt={testimonials[currentIndex].name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white/10 shadow-md"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-white/20 rounded-full p-2">
                    <Quote className="text-white" size={16} />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-1">
                  {testimonials[currentIndex].name}
                </h3>
                <p className="text-white/80 mb-6">{testimonials[currentIndex].role}</p>
                
                <p className="text-white/80 text-center mb-8 max-w-2xl mx-auto leading-relaxed">
                  "{testimonials[currentIndex].quote}"
                </p>
                
                <div className="flex mt-auto">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < testimonials[currentIndex].rating ? 'text-white fill-current' : 'text-white/30'}`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-white w-6' : 'bg-white/30'}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;