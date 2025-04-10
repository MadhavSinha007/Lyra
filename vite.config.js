import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Proper assets inclusion
  assetsInclude: [
    /\.json$/,  // Include all JSON files
    /-shard1$/,  // Include all shard files
    /\.bin$/     // Include all binary files
  ],

  // Build configuration
  build: {
    rollupOptions: {
      external: [
        // Specific patterns for model files
        /public\/models\/.*\.json$/,
        /public\/models\/.*-shard1$/
      ]
    }
  },

  // Server configuration
  server: {
    fs: {
      allow: [
        // Allow serving files from project root
        process.cwd(),
        // Explicit path to models
        '/home/madbot/Lyra/public/models'
      ]
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }
  },

  optimizeDeps: {
    include: ['framer-motion', 'face-api.js'],
    exclude: ['public/models']  // Simplified exclusion
  }
});