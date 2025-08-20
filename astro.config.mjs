// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';
import netlify from '@astrojs/netlify';
import remarkMermaid from "remark-mermaidjs";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), vue()],
  
  markdown: {
    remarkPlugins: [remarkMermaid],
  },
  
  vite: {
    plugins: [tailwindcss()]
  },

  adapter: netlify()
});