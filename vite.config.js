import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

// Vite build configuration for the React + Laravel SPA
export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css', // global css (optional)
                'resources/js/app.tsx',  // your React entry
            ],
            refresh: true,
        }),
        react(),
    ],
});
