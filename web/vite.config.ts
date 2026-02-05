import { defineConfig } from 'vite'             
import react from '@vitejs/plugin-react'        
import path from "path"                          // new
import tailwindcss from "@tailwindcss/vite"      // new 

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],             // tailwindcss() new
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // everything above this line until plugins is new
})