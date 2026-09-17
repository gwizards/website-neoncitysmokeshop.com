import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
const production=process.env.DEPLOY_ENV==='production';
const origin=production?'https://neoncitysmokeshop.com':'https://dev.neoncitysmokeshop.com';
const noindexPaths=new Set(['author/hernan-diego-velarde/index.html','thank-you-for-contacting-us/index.html','404.html']);
const pagePaths=['index.html','about/index.html','products-services/index.html','location/index.html','contact-us/index.html','blog/index.html','author/hernan-diego-velarde/index.html','thank-you-for-contacting-us/index.html','privacy/index.html','404.html'];
const assertDocument=(html,path)=>{
 const indexable=production&&!noindexPaths.has(path);
 if(indexable){assert.match(html,/name="robots" content="index, follow"/);assert.match(html,new RegExp(`<link rel="canonical" href="${origin.replaceAll('.','\\.')}`));}
 else {assert.match(html,/name="robots" content="noindex, nofollow, noarchive"/);assert.doesNotMatch(html,/<link[^>]+rel="canonical"/);}
 assert.doesNotMatch(html,/<link[^>]+rel="sitemap"/);
 assert.doesNotMatch(html,/googletagmanager|google-analytics|wp-content|add to cart|shopping cart|checkout/i);
 const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)];
 for(const [,attrs,body] of scripts)if(!/\bsrc=/.test(attrs)){assert.match(attrs,/type="application\/ld\+json"/,'Executable scripts must be external for CSP');assert.doesNotThrow(()=>JSON.parse(body),`Invalid JSON-LD in ${path}`);}
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`Expected one H1 in ${path}`);
 for(const meta of ['og:title','og:description','og:image'])assert.match(html,new RegExp(`<meta property="${meta}"`));
 assert.match(html,/<script type="application\/ld\+json">/);
 for(const match of html.matchAll(/(?:href|src|poster|data-src)="(\/[^"#?]+)[^"]*"/g)){const p=match[1];assert(existsSync('dist'+p)||existsSync('dist'+p+'index.html'),'Missing local asset '+p);}
};
for(const path of pagePaths)assertDocument(readFileSync('dist/'+path,'utf8'),path);
const home=readFileSync('dist/index.html','utf8');
assert.match(home,/id="age-gate"[^>]*role="dialog"[^>]*aria-modal="true"/);
assert.match(home,/You must be over the age of/);
assert.match(home,/https:\/\/quickvee\.com\/merchant\/MAR630037NV\?orderMethod=delivery/);
if(production){assert.doesNotMatch(home,/Development preview/i);assert.doesNotMatch(readFileSync('dist/contact-us/index.html','utf8'),/test form|development review inbox/i);}
const posts=JSON.parse(readFileSync('src/data/blog.json','utf8'));assert.equal(posts.length,13);
for(const post of posts){
 const path=`${post.slug}/index.html`;assert(existsSync(`dist/${path}`));assert(existsSync(`dist${post.image}`));
 const article=readFileSync(`dist/${path}`,'utf8');assertDocument(article,path);assert.match(article,/"@type":"BlogPosting"/);
}
const robots=readFileSync('dist/robots.txt','utf8');
if(production){
 assert.match(robots,/Allow: \//);assert.match(robots,new RegExp(`Sitemap: ${origin.replaceAll('.','\\.')}/sitemap\\.xml`));
 const sitemap=readFileSync('dist/sitemap.xml','utf8');assert.match(sitemap,/<urlset/);assert.doesNotMatch(sitemap,/author\/|thank-you|404/);assert.equal((sitemap.match(/<url>/g)||[]).length,20);
 const llms=readFileSync('dist/llms.txt','utf8');assert.match(llms,/Neon City Smoke Shop/);assert.doesNotMatch(llms,/dev\./);
}else{
 assert.match(robots,/Disallow: \//);assert(!readdirSync('dist').some(file=>/sitemap|llms/.test(file)));
}
console.log(`PASS: ${production?'production':'preview'} routes, indexing contract, local assets, structured data, and commerce boundary.`);
