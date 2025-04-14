import React, { useState, useEffect, useRef } from 'react';

const LYRALoadingAnimation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState('in');
  const previousTextCycleRef = useRef(-1);

  const phrases = [
    {
      text: "Your Personal Companion • LYRA",
      lang: "English",
      font: "font-sans"
    },
    {
      text: "आपका व्यक्तिगत साथी • LYRA",
      lang: "Hindi",
      font: "font-[Noto-Sans-Devanagari]"
    },
    {
      text: "உங்கள் தனிப்பட்ட துணை • LYRA",
      lang: "Tamil",
      font: "font-[Noto-Sans-Tamil]"
    },
    {
      text: "మీ వ్యక్తిగత తోడుగా • LYRA",
      lang: "Telugu",
      font: "font-[Noto-Sans-Telugu]"
    },
    {
      text: "Votre compagnon personnel • LYRA",
      lang: "French",
      font: "font-serif"
    },
    {
      text: "あなたのパーソナルコンパニオン • LYRA",
      lang: "Japanese",
      font: "font-[Noto-Sans-JP]"
    },
    {
      text: "您的个人伴侣 • LYRA",
      lang: "Chinese",
      font: "font-[Noto-Sans-SC]"
    },
    {
      text: "دوستانہ معاون • LYRA",
      lang: "Urdu",
      font: "font-[Noto-Nastaliq-Urdu]"
    },
    {
      text: "شخصی همراه شما • LYRA",
      lang: "Persian",
      font: "font-[Noto-Nastaliq-Urdu]"
    },
    {
      text: "Ваш персональний помічник • LYRA",
      lang: "Ukrainian",
      font: "font-[Noto-Sans-Cyrillic]"
    },
    {
      text: "আপনার ব্যক্তিগত সঙ্গী • LYRA",
      lang: "Bengali",
      font: "font-[Noto-Sans-Bengali]"
    },
    {
      text: "നിങ്ങളുടെ വ്യക്തിഗത കൂട്ടുകാരൻ • LYRA",
      lang: "Malayalam",
      font: "font-[Noto-Sans-Malayalam]"
    },
    {
      text: "તમારો વ્યક્તિગત સાથી • LYRA",
      lang: "Gujarati",
      font: "font-[Noto-Sans-Gujarati]"
    },
    {
      text: "당신의 개인 비서 • LYRA",
      lang: "Korean",
      font: "font-[Noto-Sans-KR]"
    },
    {
      text: "رفيقك الشخصي • LYRA",
      lang: "Arabic",
      font: "font-[Noto-Sans-Arabic]"
    },
    {
      text: "Su compañero personal • LYRA",
      lang: "Spanish",
      font: "font-sans"
    },
    {
      text: "Ihr persönlicher Begleiter • LYRA",
      lang: "German",
      font: "font-sans"
    },
    {
      text: "Il tuo compagno personale • LYRA",
      lang: "Italian",
      font: "font-sans"
    },
    {
      text: "Seu companheiro pessoal • LYRA",
      lang: "Portuguese",
      font: "font-sans"
    },
    {
      text: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಸಂಗಾತಿ • LYRA",
      lang: "Kannada",
      font: "font-[Noto-Sans-Kannada]"
    }
  ];

  const getRandomIndex = (currentIdx, maxIdx) => {
    const newIdx = Math.floor(Math.random() * maxIdx);
    return newIdx === currentIdx ? (newIdx + 1) % maxIdx : newIdx;
  };

  useEffect(() => {
    const textChangeDuration = 2000;
    const textChangeInterval = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setCurrentIndex(prev => getRandomIndex(prev, phrases.length));
        setFadeState('in');
      }, 300);
    }, textChangeDuration);

    return () => clearInterval(textChangeInterval);
  }, [phrases.length]);

  const getFadeClass = () => {
    if (fadeState === 'in') return 'opacity-100 transform translate-y-0 scale-100';
    if (fadeState === 'out') return 'opacity-0 transform translate-y-8 scale-95';
    return '';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white px-4">
      <div className="flex flex-col items-center justify-center text-center space-y-6">


        {/* Logo */}
        <img 
          src="/logo.png"
          alt="LYRA"
          className="w-16 h-16 object-contain"
        />


        {/* Language indicator */}
        <div className="px-3 py-1 border border-white bg-transparent rounded-full text-xs tracking-wider uppercase">
          {phrases[currentIndex].lang}
        </div>

        
        {/* Main animated text */}
        <div className={`transition-all duration-300 ease-in-out ${getFadeClass()}`}>
          <h1 className={`text-3xl md:text-4xl font-bold tracking-tight ${phrases[currentIndex].font}`}>
            {phrases[currentIndex].text}
          </h1>
        </div>

        {/* Decorative dots */}
        <div className="flex space-x-4 pt-6">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className={`h-1 w-1 rounded-full bg-white opacity-20 transition-all duration-1000 ${fadeState === 'in' ? 'scale-100' : 'scale-50'}`}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LYRALoadingAnimation;
