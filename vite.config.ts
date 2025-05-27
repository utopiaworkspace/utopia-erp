import { defineConfig, loadEnv } from 'vite'; // Import Vite config helpers
import react from '@vitejs/plugin-react';      // Import React plugin for Vite
import path from 'path';                      // Import Node.js path module

export default defineConfig(({ mode }) => {    // Export Vite config, mode is 'development', 'staging', or 'production'
  const env = loadEnv(mode, process.cwd());   // Load environment variables for the current mode

  return {
    plugins: [react()],                       // Use React plugin
    define: {
      'import.meta.env.VITE_ENV': JSON.stringify(env.VITE_ENV),           // Define VITE_ENV for client code
      'import.meta.env.VITE_API_BASE': JSON.stringify(env.VITE_API_BASE), // Define VITE_API_BASE for client code
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // Use '@' as alias for './src' folder
      },
    },
    server: {
      port: 3000,   // Always use http://localhost:3000
      open: true,   // Auto open browser when server starts
    },
  };
});
