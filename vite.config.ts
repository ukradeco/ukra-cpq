import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss' // 1. استيراد
import autoprefixer from 'autoprefixer' // 2. استيراد

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 3. إضافة هذا القسم لربط Tailwind
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
})