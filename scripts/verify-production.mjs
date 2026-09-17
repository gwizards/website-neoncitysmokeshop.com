import assert from 'node:assert/strict';
const origin=process.argv[2]||'https://neoncitysmokeshop.com';
const expected=process.env.RELEASE_SHA||process.argv[3];
const headers={'User-Agent':'Mozilla/5.0 Chrome/140 NeonCityReleaseAudit/1.0'};
const get=(path,options={})=>fetch(origin+path,{headers,...options,signal:AbortSignal.timeout(30000)});
let version;
for(let attempt=0;attempt<12;attempt++){
 try{const response=await get('/version.json',{cache:'no-store'});if(response.ok){version=await response.json();if(!expected||version.commit===expected)break;}}catch{}
 await new Promise(resolve=>setTimeout(resolve,5000));
}
assert(version,'Production version endpoint did not respond');
if(expected)assert.equal(version.commit,expected,'Production edge commit does not match the release commit');
assert.equal(version.environment,'production');assert.equal(version.committed,true);
const home=await get('/');assert.equal(home.status,200);assert.equal(home.headers.has('x-robots-tag'),false);const html=await home.text();assert.match(html,/name="robots" content="index, follow"/);assert.match(html,new RegExp(`<link rel="canonical" href="${origin.replaceAll('.','\\.')}/"`));
const robots=await get('/robots.txt');assert.equal(robots.status,200);assert.match(await robots.text(),new RegExp(`Allow: /[\\s\\S]*Sitemap: ${origin.replaceAll('.','\\.')}/sitemap\\.xml`));
const sitemap=await get('/sitemap.xml');assert.equal(sitemap.status,200);const xml=await sitemap.text();assert.equal((xml.match(/<url>/g)||[]).length,20);assert.doesNotMatch(xml,/dev\.|author\/|thank-you/);
const llms=await get('/llms.txt');assert.equal(llms.status,200);assert.match(await llms.text(),/Neon City Smoke Shop/);
const missing=await get('/production-release-missing/');assert.equal(missing.status,404);assert.match(missing.headers.get('x-robots-tag')||'',/noindex/);
const api=await get('/api/contact');assert.equal(api.status,405);assert.match(api.headers.get('x-robots-tag')||'',/noindex/);
const www=await fetch(`https://www.neoncitysmokeshop.com/blog/?source=www`,{headers,redirect:'manual',signal:AbortSignal.timeout(30000)});assert.equal(www.status,308);assert.equal(www.headers.get('location'),`${origin}/blog/?source=www`);
const assets=[['/_astro/', 'immutable'],['/images/neon-city-display-logo.webp','stale-while-revalidate']];
const homeAsset=[...html.matchAll(/(?:href|src)="(\/_astro\/[^"]+)"/g)].map(match=>match[1])[0];assert(homeAsset);
const hashed=await get(homeAsset);assert.equal(hashed.status,200);assert.match(hashed.headers.get('cache-control')||'',/immutable/);
const media=await get(assets[1][0]);assert.equal(media.status,200);assert.match(media.headers.get('cache-control')||'',/stale-while-revalidate/);
console.log(JSON.stringify({origin,commit:version.commit,environment:version.environment,indexableHome:true,sitemapUrls:20,wwwRedirect:308,apiSafeGet:405,missingStatus:404},null,2));
