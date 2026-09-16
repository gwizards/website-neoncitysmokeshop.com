import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
for(const path of ['index.html','privacy/index.html','404.html']){
 const html=readFileSync('dist/'+path,'utf8');
 assert.match(html,/name="robots" content="noindex, nofollow, noarchive"/);
 assert.doesNotMatch(html,/<link[^>]+rel="(?:canonical|sitemap)"/);
 assert.doesNotMatch(html,/googletagmanager|google-analytics|wp-content|add to cart|shopping cart|checkout/i);
 assert.doesNotMatch(html,/<script(?![^>]*src=)[^>]*>/,'Executable scripts must be external for CSP');
 for(const match of html.matchAll(/(?:href|src|poster|data-src)="(\/[^"#?]+)[^"]*"/g)){
   const p=match[1];assert(existsSync('dist'+p) || existsSync('dist'+p+'index.html'),'Missing local asset '+p);
 }
}
const home=readFileSync('dist/index.html','utf8');
assert.match(home,/id="age-gate"[^>]*role="dialog"[^>]*aria-modal="true"/);
assert.match(home,/You must be over the age of<br[^>]*>21 to visit this website/);
assert.match(home,/data-src="\/video\/neon-final\.mp4"/);
assert.match(home,/data-src="\/video\/original-colored-smoke\.mp4"/);
assert.match(home,/neon-city-header-logo\.webp/);
assert.match(home,/href="https:\/\/quickvee\.com\/merchant\/MAR630037NV\?orderMethod=delivery"/);
assert.match(home,/aria-label="Order online through QuickVee \(opens in a new tab\)"/);
const posts=JSON.parse(readFileSync('src/data/blog.json','utf8'));
assert.equal(posts.length,13);
assert(existsSync('dist/blog/index.html'));
for(const post of posts){
 assert.match(post.slug,/^[a-z0-9-]+$/);
 assert(existsSync(`dist/${post.slug}/index.html`),`Missing article route ${post.slug}`);
 assert(existsSync(`dist${post.image}`),`Missing article image ${post.image}`);
 const article=readFileSync(`dist/${post.slug}/index.html`,'utf8');
 const escapedTitle=post.title.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 assert(article.includes(`<h1>${escapedTitle}</h1>`),`Incorrect article heading ${post.slug}`);
 assert.doesNotMatch(article,/wp-content|<script(?![^>]*src=)/i);
}
assert.match(readFileSync('dist/robots.txt','utf8'),/Disallow: \//);
assert(!readdirSync('dist').some(f=>/sitemap|llms/.test(f)));
const c=JSON.parse(readFileSync('wrangler.jsonc','utf8'));
assert.deepEqual(c.routes,[{pattern:'dev.neoncitysmokeshop.com',custom_domain:true}]);
assert.equal(c.workers_dev,false);assert.equal(c.assets.run_worker_first,true);
console.log('PASS: routes, preview indexing, local assets, no production routes or trackers.');
