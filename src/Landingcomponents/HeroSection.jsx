import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const HeroSection = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    let scene, camera, renderer, particleSystem, lines;
    let animationFrameId;

    const initThree = () => {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 30;

      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      // Particle system (neural network)
      const particleCount = 2000;
      const particleGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const r = 10 + Math.random() * 8 * Math.sin(phi);

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.cos(phi) + (Math.random() - 0.5) * 3;
        positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

        // White to gray colors
        const intensity = 0.5 + Math.random() * 0.5;
        colors[i * 3] = intensity;
        colors[i * 3 + 1] = intensity;
        colors[i * 3 + 2] = intensity;

        sizes[i] = Math.random() * 0.5 + 0.1;
      }

      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

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

      particleSystem = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particleSystem);

      // Particle connections
      const connections = 1200;
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = new Float32Array(connections * 6);
      const lineColors = new Float32Array(connections * 6);

      for (let i = 0; i < connections; i++) {
        const idx1 = Math.floor(Math.random() * particleCount);
        const idx2 = Math.floor(Math.random() * particleCount);

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

        if (distance < 8) {
          linePositions[i * 6] = x1;
          linePositions[i * 6 + 1] = y1;
          linePositions[i * 6 + 2] = z1;

          linePositions[i * 6 + 3] = x2;
          linePositions[i * 6 + 4] = y2;
          linePositions[i * 6 + 5] = z2;

          // White lines
          const alpha = 1 - (distance / 8);
          lineColors[i * 6] = 1.0;
          lineColors[i * 6 + 1] = 1.0;
          lineColors[i * 6 + 2] = alpha;

          lineColors[i * 6 + 3] = 1.0;
          lineColors[i * 6 + 4] = 1.0;
          lineColors[i * 6 + 5] = alpha;
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

      lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        particleSystem.rotation.y += 0.001;
        particleSystem.rotation.x += 0.0005;
        lines.rotation.y += 0.001;
        lines.rotation.x += 0.0005;

        const positions = particleGeometry.attributes.position.array;
        const time = Date.now() * 0.0005;

        for (let i = 0; i < particleCount; i++) {
          const ix = i * 3;
          const pulse = Math.sin(time + i * 0.1) * 0.1;

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

        if (mousePosition.x && mousePosition.y) {
          camera.position.x += (mousePosition.x * 30 - camera.position.x) * 0.05;
          camera.position.y += (-mousePosition.y * 30 - camera.position.y) * 0.05;
          camera.lookAt(scene.position);
        }

        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        scene.clear();
        renderer.dispose();
      };
    };

    const cleanup = initThree();
    setTimeout(() => setIsLoaded(true), 500);

    return cleanup;
  }, []);

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
      className="relative min-h-screen flex items-center justify-center text-center overflow-hidden bg-black"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-80"
      />

      <div className="absolute inset-0 bg-black/50 z-0"></div>

      <div className="absolute w-80 h-80 rounded-full bg-white/10 filter blur-[100px] top-1/4 -left-40 animate-pulse-slow"></div>
      <div className="absolute w-80 h-80 rounded-full bg-white/10 filter blur-[100px] bottom-1/4 -right-40 animate-pulse-slow animation-delay-2000"></div>

      <div
        className={`container relative z-10 mx-auto px-4 transition-all duration-1000 ease-out transform ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="relative mb-8">
          <h1 className="text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
            <span className="block transform animate-float delay-100">Lyra</span>
            <span className="block text-4xl font-medium text-white/80 mt-4 transform animate-float delay-300">Your Mental Health Companion</span>
          </h1>

          <div className="h-1 w-40 mx-auto bg-white rounded-full transform animate-width-expand mt-6"></div>
        </div>

        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed transform animate-fade-in delay-500">
          Discover a better way to track and improve your emotional well-being with AI-powered insights and personalized care.
        </p>

        <div className="relative inline-block transform animate-fade-in delay-700 group">
          <div className="absolute -inset-1 bg-white/30 rounded-full blur opacity-50 group-hover:opacity-70 transition-all duration-500 animate-pulse-slow"></div>
          <a href="/analysis" className="relative">
            <button className="relative bg-white text-black font-semibold px-12 py-4 rounded-full text-lg transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-white/20 group-hover:shadow-white/30 overflow-hidden">
              <span className="relative z-10 flex items-center justify-center gap-2 tracking-wide">
                <span>Get Started</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-20 transition-opacity duration-300 transform scale-x-0 group-hover:scale-x-100 origin-left"></div>
            </button>
          </a>
        </div>
      </div>

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