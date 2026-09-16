import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
const pagePaths=['index.html','about/index.html','products-services/index.html','location/index.html','contact-us/index.html','blog/index.html','author/hernan-diego-velarde/index.html','thank-you-for-contacting-us/index.html','privacy/index.html','404.html'];
const assertDocument=(html,path)=>{
 assert.match(html,/name="robots" content="noindex, nofollow, noarchive"/);
 assert.doesNotMatch(html,/<link[^>]+rel="(?:canonical|sitemap)"/);
 assert.doesNotMatch(html,/googletagmanager|google-analytics|wp-content|add to cart|shopping cart|checkout/i);
 const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)];
 for(const [,attrs,body] of scripts)if(!/\bsrc=/.test(attrs)){
   assert.match(attrs,/type="application\/ld\+json"/,'Executable scripts must be external for CSP');
   assert.doesNotThrow(()=>JSON.parse(body),`Invalid JSON-LD in ${path}`);
 }
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`Expected one H1 in ${path}`);
 assert.match(html,/<meta property="og:title"/);
 assert.match(html,/<meta property="og:description"/);
 assert.match(html,/<meta property="og:image"/);
 assert.match(html,/<script type="application\/ld\+json">/);
 for(const match of html.matchAll(/(?:href|src|poster|data-src)="(\/[^"#?]+)[^"]*"/g)){
   const p=match[1];assert(existsSync('dist'+p) || existsSync('dist'+p+'index.html'),'Missing local asset '+p);
 }
};
for(const path of pagePaths){
 const html=readFileSync('dist/'+path,'utf8');
 assertDocument(html,path);
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
 assertDocument(article,`${post.slug}/index.html`);
 const escapedTitle=post.title.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 assert(article.includes(`<h1>${escapedTitle}</h1>`),`Incorrect article heading ${post.slug}`);
 assert.doesNotMatch(article,/wp-content/i);
 assert.match(article,/"@type":"BlogPosting"/);
}
assert.match(readFileSync('dist/robots.txt','utf8'),/Disallow: \//);
assert(!readdirSync('dist').some(f=>/sitemap|llms/.test(f)));
const c=JSON.parse(readFileSync('wrangler.jsonc','utf8'));
assert.deepEqual(c.routes,[{pattern:'dev.neoncitysmokeshop.com',custom_domain:true}]);
assert.equal(c.workers_dev,false);assert.equal(c.assets.run_worker_first,true);
console.log('PASS: routes, preview indexing, local assets, no production routes or trackers.');
