import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Typing indicator component (WhatsApp-style)
const TypingIndicator = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
    className="flex items-center space-x-1 p-3 bg-white/10 backdrop-blur-md rounded-lg self-start shadow-lg"
  >
    <motion.div
      animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
      className="w-2 h-2 bg-white rounded-full"
    />
    <motion.div
      animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      className="w-2 h-2 bg-white rounded-full"
    />
    <motion.div
      animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      className="w-2 h-2 bg-white rounded-full"
    />
  </motion.div>
);

// Chat bubble component with line-by-line animation
const ChatBubble = ({ message, isUser, lines, lineRefs }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 700, damping: 20 }}
    className={`relative max-w-sm md:max-w-lg lg:max-w-xl p-4 rounded-lg ${
      isUser 
        ? 'bg-white/20 text-white self-end rounded-tr-none'
        : 'bg-black/20 text-white self-start rounded-tl-none'
    } backdrop-blur-md shadow-lg border border-white/10`}
  >
    {isUser ? (
      <span>{message.text}</span>
    ) : (
      <AnimatePresence>
        {lines.map((line, index) => (
          <motion.div
            key={index}
            ref={lineRefs?.[index]} // Attach ref for scrolling
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: index * 0.4, ease: 'easeOut' }}
          >
            {line}
          </motion.div>
        ))}
      </AnimatePresence>
    )}
    {/* Bubble tail */}
    <div className={`absolute w-3 h-3 bottom-0 ${
      isUser 
        ? 'right-0 -mr-1 bg-white/20'
        : 'left-0 -ml-1 bg-black/20'
    }`}
    style={{ clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)' }} 
    />
  </motion.div>
);

export default function LyraChatbot() {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: "Hey there, I'm Lyra. I'm here to listen—how are you feeling today?", 
      lines: ["Hey there, I'm Lyra.", "I'm here to listen—how are you feeling today?"] 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTyping, setShowTyping] = useState(false); // New state for typing indicator
  const messagesEndRef = useRef(null);
  const [currentLineRefs, setCurrentLineRefs] = useState([]); // Store refs for bot response lines
  const [currentLineIndex, setCurrentLineIndex] = useState(-1); // Track current animating line

  // Scroll to the latest line for bot messages or bottom for user messages
  useEffect(() => {
    if (messages[messages.length - 1]?.sender === 'user') {
      // For user messages, scroll to bottom immediately
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (currentLineIndex >= 0 && currentLineRefs[currentLineIndex]) {
      // For bot messages, scroll to the current line
      currentLineRefs[currentLineIndex]?.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }
  }, [currentLineIndex, messages]);

  // Reset line index and refs when a new bot message is added
  useEffect(() => {
    if (messages[messages.length - 1]?.sender === 'bot' && !loading) {
      const lines = messages[messages.length - 1].lines;
      setCurrentLineRefs(lines.map(() => React.createRef()));
      setCurrentLineIndex(0); // Start animating from the first line
    }
  }, [messages, loading]);

  // Increment line index to trigger scroll for each line
  useEffect(() => {
    if (currentLineIndex >= 0 && messages[messages.length - 1]?.sender === 'bot') {
      const lines = messages[messages.length - 1].lines;
      if (currentLineIndex < lines.length - 1) {
        const timer = setTimeout(() => {
          setCurrentLineIndex(prev => prev + 1);
        }, 400); // Match line animation delay
        return () => clearTimeout(timer);
      }
    }
  }, [currentLineIndex, messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: `You are Lyra, a mental health companion. Respond empathetically and supportively to: ${input}` }]
          }]
        })
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      const botText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "I'm here for you. Want to share more about how you're feeling?";
      
      // Split response into lines
      const lines = botText
        .split(/[.!?]\s+|\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => (line.match(/[.!?]$/) ? line : `${line}.`));

      const botResponse = { sender: 'bot', text: botText, lines };
      
      // Show typing indicator briefly before adding response
      setShowTyping(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Show for 1 second
      setShowTyping(false);
      
      setMessages(prev => [...prev, botResponse]);

      // Wait for line animations to complete
      const totalAnimationTime = lines.length * 400; // 400ms per line
      await new Promise(resolve => setTimeout(resolve, totalAnimationTime));
    } catch (error) {
      const errorMessage = { 
        sender: 'bot', 
        text: error.message.includes('HTTP') ? 'Network issue, please try again.' : "I'm having a little trouble right now, but I'm still here for you. Try again?",
        lines: error.message.includes('HTTP') ? ['Network issue.', 'Please try again.'] : ["I'm having a little trouble right now.", "But I'm still here for you. Try again?"]
      };
      
      // Show typing indicator for error message
      setShowTyping(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Show for 1 second
      setShowTyping(false);
      
      setMessages(prev => [...prev, errorMessage]);

      // Wait for line animations to complete
      const totalAnimationTime = errorMessage.lines.length * 400;
      await new Promise(resolve => setTimeout(resolve, totalAnimationTime));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
        className="w-full max-w-3xl scale-105"
      >
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">
            <a href='/'>Lyra</a> 
          </h1>
        </div>
        
        <div className="w-full bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          {/* Chat header */}
          <motion.div 
            className="p-5 border-b border-white/10 bg-black/10 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-white/30"></div>
              <div className="w-3 h-3 rounded-full bg-white/30"></div>
              <div className="w-3 h-3 rounded-full bg-white/30"></div>
              <div className="ml-2 text-sm font-medium text-white/50">Your Mental Health Companion</div>
            </div>
          </motion.div>
          
          {/* Chat messages */}
          <div className="h-[500px] overflow-y-auto p-5 space-y-4" aria-live="polite">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <ChatBubble 
                  key={index} 
                  message={msg} 
                  isUser={msg.sender === 'user'} 
                  lines={msg.lines || [msg.text]} 
                  lineRefs={msg.sender === 'bot' && index === messages.length - 1 ? currentLineRefs : null}
                />
              ))}
              
              {showTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </AnimatePresence>
          </div>
          
          {/* Input area */}
          <motion.div 
            className="p-5 border-t border-white/10 bg-black/10 backdrop-blur-md"
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 600 }}
          >
            <div className="flex gap-3">
              <motion.input
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 500))}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 p-4 rounded-lg bg-white/10 text-white outline-none border border-white/10 focus:border-white/50 transition-all backdrop-blur-md"
                placeholder="How are you feeling today?"
                whileFocus={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.7)' }}
                transition={{ duration: 0.3 }}
                aria-label="Type your message to Lyra"
              />
              <motion.button
                onClick={handleSend}
                disabled={loading}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.12, backgroundColor: 'rgba(255,255,255,0.25)' }}
                className={`px-6 py-3 bg-white/20 text-white font-medium rounded-lg shadow-lg border border-white/10 backdrop-blur-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                transition={{ type: 'spring', stiffness: 500 }}
                aria-label="Send message"
              >
                Send
              </motion.button>
            </div>
            <p className="text-xs text-white/40 mt-3 text-center">
              Lyra is here to listen. Your thoughts are safe with me.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}