/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  /* relative asset paths, so the same build works served from the domain
     root (vite preview, the probes) AND from a sub-path (GitHub Pages
     serves project sites at /<repo>/) */
  base: './',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
