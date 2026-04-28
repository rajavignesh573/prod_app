import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function hasPackage(name) {
  try {
    require.resolve(name);
    return true;
  } catch {
    return false;
  }
}

export default defineConfig(async ({ mode }) => {
  const canUseVisualizer = mode === 'analyze' && hasPackage('rollup-plugin-visualizer');
  const canUseTerser = hasPackage('terser');
  const canUseChecker = hasPackage('vite-plugin-checker');
  const plugins = [react()];

  if (canUseVisualizer) {
    const { visualizer } = await import('rollup-plugin-visualizer');
    plugins.push(
      visualizer({
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
        open: false
      })
    );
  }

  if (canUseChecker) {
    const checker = (await import('vite-plugin-checker')).default;
    plugins.push(checker({ typescript: true }));
  }

  return {
    plugins,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@types': path.resolve(__dirname, 'src/types')
    }
  },
  build: {
    target: 'es2020',
    minify: canUseTerser ? 'terser' : 'esbuild',
    terserOptions: canUseTerser
      ? {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      : undefined,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor';
          if (id.includes('node_modules/react-router-dom')) return 'router';
          if (id.includes('node_modules/preline')) return 'ui';
          if (id.includes('node_modules/@tanstack/react-query')) return 'query';
          if (id.includes('node_modules/@tanstack/react-virtual')) return 'virtual';
          if (id.includes('/src/features/')) return 'features';
          return null;
        }
      }
    }
  },
  server: {
    port: 5173
  }
  };
});
