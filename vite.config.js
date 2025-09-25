import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

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
