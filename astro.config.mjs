import { defineConfig } from 'astro/config';
const production = process.env.DEPLOY_ENV === 'production';
export default defineConfig({ site: production ? 'https://neoncitysmokeshop.com' : 'https://dev.neoncitysmokeshop.com', output: 'static', trailingSlash: 'always', build: { inlineStylesheets: 'never' }, vite: { build: { assetsInlineLimit: 0 } } });
