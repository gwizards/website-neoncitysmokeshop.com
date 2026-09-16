import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
for(const path of ['index.html','privacy/index.html','404.html']){
 const html=readFileSync('dist/'+path,'utf8');
 assert.match(html,/name="robots" content="noindex, nofollow, noarchive"/);
 assert.doesNotMatch(html,/<link[^>]+rel="(?:canonical|sitemap)"/);
 assert.doesNotMatch(html,/googletagmanager|google-analytics|wp-content|order online|add to cart/i);
 assert.doesNotMatch(html,/<script(?![^>]*src=)[^>]*>/,'Executable scripts must be external for CSP');
 for(const match of html.matchAll(/(?:href|src|poster|data-src)="(\/[^"#?]+)[^"]*"/g)){
   const p=match[1];assert(existsSync('dist'+p) || existsSync('dist'+p+'index.html'),'Missing local asset '+p);
 }
}
assert.match(readFileSync('dist/robots.txt','utf8'),/Disallow: \//);
assert(!readdirSync('dist').some(f=>/sitemap|llms/.test(f)));
const c=JSON.parse(readFileSync('wrangler.jsonc','utf8'));
assert.deepEqual(c.routes,[{pattern:'dev.neoncitysmokeshop.com',custom_domain:true}]);
assert.equal(c.workers_dev,false);assert.equal(c.assets.run_worker_first,true);
console.log('PASS: routes, preview indexing, local assets, no production routes or trackers.');
