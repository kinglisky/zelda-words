import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/zelda-words/',

    build: {
        outDir: 'docs',
    },

    plugins: [vue()],
});
