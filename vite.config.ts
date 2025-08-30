import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

const computeBase = (): string => {
  if (process.env.CI && process.env.GITHUB_REPOSITORY) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    const isUserSite = repo?.toLowerCase() === `${owner?.toLowerCase()}.github.io`;
    return isUserSite ? '/' : `/${repo}/`;
  }
  return '/';
};

export default defineConfig({
  base: computeBase(),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});
