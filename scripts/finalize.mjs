import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const production = process.env.DEPLOY_ENV === 'production';
const origin = production ? 'https://neoncitysmokeshop.com' : 'https://dev.neoncitysmokeshop.com';
const hash = createHash('sha256');
for (const dir of ['src','worker','shared','public','scripts']) {
  for (const file of readdirSync(dir,{recursive:true,withFileTypes:true}).filter(file => file.isFile()).map(file => `${file.parentPath}/${file.name}`).sort()) hash.update(file).update(readFileSync(file));
}
for (const file of ['package.json','package-lock.json','astro.config.mjs','wrangler.jsonc']) hash.update(file).update(readFileSync(file));
let commit = null;
try { commit = execFileSync('git',['rev-parse','--verify','HEAD'],{stdio:['ignore','pipe','ignore']}).toString().trim(); } catch {}
let committed = false;
if (commit) {
  try { committed = execFileSync('git',['status','--porcelain','--untracked-files=all'],{encoding:'utf8'}).trim() === ''; } catch {}
}
writeFileSync('dist/version.json',JSON.stringify({site:'neon-city-smoke-shop',environment:production ? 'production' : 'development',sourceSha256:hash.digest('hex'),commit,committed,buildTime:new Date().toISOString()},null,2)+'\n');

for (const file of ['dist/sitemap.xml','dist/llms.txt']) if (existsSync(file)) rmSync(file);
if (production) {
  const files = readdirSync('dist',{recursive:true,withFileTypes:true}).filter(file => file.isFile() && file.name.endsWith('.html')).map(file => `${file.parentPath}/${file.name}`);
  const urls = files.filter(file => file !== 'dist/404.html' && /name="robots" content="index, follow"/.test(readFileSync(file,'utf8'))).map(file => file === 'dist/index.html' ? `${origin}/` : `${origin}/${file.slice(5,-10)}`).sort();
  writeFileSync('dist/robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
  writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`);
  writeFileSync('dist/llms.txt',`# Neon City Smoke Shop\n\n> An age-gated Las Vegas smoke shop website for adults 21 and older.\n\n## Primary pages\n- ${origin}/about/\n- ${origin}/products-services/\n- ${origin}/location/\n- ${origin}/contact-us/\n- ${origin}/blog/\n\n## Policies and boundaries\n- Product categories and educational articles are informational.\n- Current inventory and availability should be confirmed directly with the shop.\n- Online ordering is handled by the external QuickVee merchant linked from the site.\n- Contact details, address, and published opening hours appear on the location and contact pages.\n`);
}
