import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    base: '/zelda-words/',

    assetsInclude: 'buffer',
  
    build: {
        outDir: 'docs',
        rollupOptions: {
            input: {
              index: path.resolve(__dirname, 'index.html'),
              cnn: path.resolve(__dirname, 'cnn.html')
            }
          }
    },
    plugins: [vue()],
});
