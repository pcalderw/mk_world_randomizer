import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Output filenames carry a content hash so browsers/CDNs never serve a stale
// bundle. This plugin records the hashed names in a Jekyll data file, which
// index.markdown reads to build the <script>/<link> tags.
function jekyllAssetManifest() {
  return {
    name: 'jekyll-asset-manifest',
    writeBundle(_options, bundle) {
      const files = Object.values(bundle);
      const manifest = {
        js: files.find((f) => f.type === 'chunk' && f.isEntry).fileName,
        css: files
          .filter((f) => f.type === 'asset' && f.fileName.endsWith('.css'))
          .map((f) => f.fileName),
      };
      const dataDir = path.resolve(__dirname, '_data');
      fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(
        path.join(dataDir, 'react_assets.json'),
        JSON.stringify(manifest, null, 2) + '\n'
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), jekyllAssetManifest()],
  root: 'src',
  build: {
    outDir: path.resolve(__dirname, 'assets/react-dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main.jsx'),
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});
