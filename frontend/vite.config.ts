<<<<<<< HEAD
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
=======
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      'lucide-react': path.resolve(__dirname, './src/components/LucideIcons.tsx'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
>>>>>>> 071a39a990d8d851a677928900ec91f75fab24b3
