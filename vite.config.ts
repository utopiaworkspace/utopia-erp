import { defineConfig, loadEnv } from 'vite'; // Import Vite config helpers
import react from '@vitejs/plugin-react';      // Import React plugin for Vite
import path from 'path';                      // Import Node.js path module

export default defineConfig(({ mode }) => {    // Export Vite config, mode is 'development', 'staging', or 'production'
  // 👇 加载对应 .env 文件（.env.staging、.env.production）
  const env = loadEnv(mode, process.cwd());   // Load environment variables for the current mode

  console.log('🔍 当前 VITE_ENV:', env.VITE_ENV); // Print current VITE_ENV to console

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
  };
});
