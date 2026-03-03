import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite config with React and Tailwind plugin.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
