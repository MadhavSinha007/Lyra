import React, { useState, useEffect } from 'react';

const Header = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY < 100); // Show only when near top
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`text-center transition-all duration-500 ease-in-out mt-16 mb-12 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
      }`}
    >
      <h1 className="text-3xl font-bold text-white mb-4 relative inline-block group">
        Emotion Wellness Check
        <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
      </h1>
      <p className="text-lg text-white">
        Share your feelings through images, voice, or text
      </p>
    </div>
  );
};

export default Header;
