import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const HeroSection = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Handle animation and 3D rendering
  useEffect(() => {
    if (!containerRef.current) return;
    
    let scene, camera, renderer, particles, brainMesh;
    let animationFrameId;
    let particleSystem;
    
    // Scene setup
    const initThree = () => {
      // Create scene
      scene = new THREE.Scene();
      
      // Create camera
      camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
      );
      camera.position.z = 30;
      
      // Create renderer
      renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current,
        alpha: true,
        antialias: true
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      
      // Create particle system (representing neural network)
      const particleCount = 2000;
      const particleGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      
      // Create brain-like particle distribution
      for (let i = 0; i < particleCount; i++) {
        // Brain shape approximation using mathematical functions
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const r = 10 + Math.random() * 8 * Math.sin(phi);
        
        // Convert spherical to cartesian coordinates with brain-like distortion
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta); // x
        positions[i * 3 + 1] = r * Math.cos(phi) + (Math.random() - 0.5) * 3; // y
        positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta); // z
        
        // Gradient colors (teal to cyan)
        colors[i * 3] = 0.1 + Math.random() * 0.1; // R
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.2; // G
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.1; // B
        
        // Random sizes for particles
        sizes[i] = Math.random() * 0.5 + 0.1;
      }
      
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      
      // Particle material
      const particleMaterial = new THREE.ShaderMaterial({
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            float distanceToCenter = length(gl_PointCoord - vec2(0.5, 0.5));
            if (distanceToCenter > 0.5) discard;
            gl_FragColor = vec4(vColor, 1.0 - (distanceToCenter * 2.0));
          }
        `,
        transparent: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending
      });
      
      // Create particle system
      particleSystem = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particleSystem);
      
      // Connect particles with lines
      const connections = 1200;
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = new Float32Array(connections * 6);
      const lineColors = new Float32Array(connections * 6);
      
      for (let i = 0; i < connections; i++) {
        // Get two random particle indices
        const idx1 = Math.floor(Math.random() * particleCount);
        const idx2 = Math.floor(Math.random() * particleCount);
        
        // Only connect particles if they're close enough
        const x1 = positions[idx1 * 3];
        const y1 = positions[idx1 * 3 + 1];
        const z1 = positions[idx1 * 3 + 2];
        
        const x2 = positions[idx2 * 3];
        const y2 = positions[idx2 * 3 + 1];
        const z2 = positions[idx2 * 3 + 2];
        
        const distance = Math.sqrt(
          Math.pow(x2 - x1, 2) + 
          Math.pow(y2 - y1, 2) + 
          Math.pow(z2 - z1, 2)
        );
        
        // Only connect if within distance threshold
        if (distance < 8) {
          linePositions[i * 6] = x1;
          linePositions[i * 6 + 1] = y1;
          linePositions[i * 6 + 2] = z1;
          
          linePositions[i * 6 + 3] = x2;
          linePositions[i * 6 + 4] = y2;
          linePositions[i * 6 + 5] = z2;
          
          // Gradient colors based on distance
          const alpha = 1 - (distance / 8);
          
          lineColors[i * 6] = 0.1;
          lineColors[i * 6 + 1] = 0.7;
          lineColors[i * 6 + 2] = 0.8;
          
          lineColors[i * 6 + 3] = 0.1;
          lineColors[i * 6 + 4] = 0.8;
          lineColors[i * 6 + 5] = 0.9;
        }
      }
      
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
      
      const lineMaterial = new THREE.LineBasicMaterial({ 
        vertexColors: true,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);
      
      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);
      
      // Add directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
      
      // Animation loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        
        // Rotate the particle system
        particleSystem.rotation.y += 0.001;
        particleSystem.rotation.x += 0.0005;
        lines.rotation.y += 0.001;
        lines.rotation.x += 0.0005;
        
        // Make particles pulse
        const positions = particleGeometry.attributes.position.array;
        const time = Date.now() * 0.0005;
        
        for (let i = 0; i < particleCount; i++) {
          const ix = i * 3;
          const pulse = Math.sin(time + i * 0.1) * 0.1;
          
          // Pulse the particles outward slightly
          const x = positions[ix];
          const y = positions[ix + 1];
          const z = positions[ix + 2];
          
          const length = Math.sqrt(x * x + y * y + z * z);
          const normalizedX = x / length;
          const normalizedY = y / length;
          const normalizedZ = z / length;
          
          positions[ix] = x + normalizedX * pulse;
          positions[ix + 1] = y + normalizedY * pulse;
          positions[ix + 2] = z + normalizedZ * pulse;
        }
        
        particleGeometry.attributes.position.needsUpdate = true;
        
        // Mouse interaction - move camera slightly based on mouse position
        if (mousePosition.x && mousePosition.y) {
          camera.position.x += (mousePosition.x * 30 - camera.position.x) * 0.05;
          camera.position.y += (-mousePosition.y * 30 - camera.position.y) * 0.05;
          camera.lookAt(scene.position);
        }
        
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Handle window resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        scene.clear();
        renderer.dispose();
      };
    };
    
    // Initialize Three.js
    const cleanup = initThree();
    
    // Set loaded state after initialization
    setTimeout(() => setIsLoaded(true), 500);
    
    return cleanup;
  }, []);
  
  // Track mouse position for 3D effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <section 
      id="hero" 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center text-center overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800"
    >
      {/* 3D Background Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-80"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-slate-900/80 to-cyan-500/5 z-0"></div>
      
      {/* Glowing Orbs - Decorative Elements */}
      <div className="absolute w-80 h-80 rounded-full bg-teal-400/10 filter blur-[100px] top-1/4 -left-40 animate-pulse-slow"></div>
      <div className="absolute w-80 h-80 rounded-full bg-cyan-400/10 filter blur-[100px] bottom-1/4 -right-40 animate-pulse-slow animation-delay-2000"></div>
      
      {/* Content Container */}
      <div 
        className={`container relative z-10 mx-auto px-4 transition-all duration-1000 ease-out transform ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Floating Card */}
        <div 
          className="max-w-4xl mx-auto backdrop-blur-xl bg-slate-800/50 p-12 rounded-3xl shadow-2xl border border-teal-500/20 transform transition-all duration-500 hover:border-teal-400/40"
          style={{ 
            transform: isHovering 
              ? `perspective(1000px) rotateX(${mousePosition.y * -5}deg) rotateY(${mousePosition.x * 5}deg) scale(1.02)` 
              : 'perspective(1000px) rotateX(0) rotateY(0) scale(1)',
            transformStyle: 'preserve-3d',
            boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.15)'
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-transparent via-teal-400/30 to-transparent pointer-events-none" 
                 style={{ 
                   transform: `translateX(${mousePosition.x * 100}px) translateY(${mousePosition.y * 100}px)`,
                   transition: 'transform 0.2s ease-out'
                 }}></div>
          </div>
          
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none border border-teal-500/10"></div>
          
          {/* Title with Animation */}
          <div className="relative mb-8">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400 mb-4 leading-tight tracking-tight">
              <span className="block transform animate-float delay-100">Lyra</span>
              <span className="block text-4xl font-medium text-slate-200 mt-4 transform animate-float delay-300">Your Mental Health Companion</span>
            </h1>
            
            {/* Animated Underline */}
            <div className="h-1 w-40 mx-auto bg-gradient-to-r from-teal-400/80 via-cyan-400/80 to-teal-400/80 rounded-full transform animate-width-expand mt-6"></div>
          </div>
          
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed transform animate-fade-in delay-500">
            Discover a better way to track and improve your emotional well-being with AI-powered insights and personalized care.
          </p>
          
          {/* Animated Button */}
          <div className="relative inline-block transform animate-fade-in delay-700 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full blur opacity-70 group-hover:opacity-90 transition-all duration-500 animate-pulse-slow"></div>
            <a href="/analysis" className="relative">
              <button className="relative bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold px-12 py-4 rounded-full text-lg transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-teal-500/30 group-hover:shadow-cyan-400/30 overflow-hidden">
                <span className="relative z-10 flex items-center justify-center gap-2 tracking-wide">
                  <span>Get Started</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-x-0 group-hover:scale-x-100 origin-left"></div>
              </button>
            </a>
          </div>
        </div>
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes pulse-slow {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
          100% { opacity: 0.3; transform: scale(1); }
        }
        
        @keyframes width-expand {
          0% { width: 0; opacity: 0; }
          100% { width: 160px; opacity: 1; }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animate-width-expand {
          animation: width-expand 1.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 1s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
        
        .delay-100 { animation-delay: 100ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-700 { animation-delay: 700ms; }
      `}</style>
    </section>
  );
};

export default HeroSection;