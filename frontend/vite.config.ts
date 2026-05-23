import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'), // Mapeo manual del alias
        },
    },
    server: {
        host: true,
        port: 5173,
        watch: { usePolling: true }, // Crucial si desarrollas en Windows/WSL
    },
});
