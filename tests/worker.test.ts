import { describe,it,expect,vi,afterEach } from 'vitest';
import worker,{contact,validate,emailBodies,idempotency} from '../worker/index';
import { requestContext } from '../worker/context';
const data={name:'Test reviewer',email:'fernando@wizards.global',topic:'Website feedback',message:'This is a development validation message.',consent:true,website:'',token:'fresh-token'};
const env={SITE_ORIGIN:'https://dev.neoncitysmokeshop.com',TURNSTILE_HOSTNAMES:'dev.neoncitysmokeshop.com',RESEND_API_KEY:'test-key',TURNSTILE_SECRET:'test-secret',RATE_LIMIT_PEPPER:'test-pepper',MAIL_FROM:'Neon City Support <neoncity@updates.wizards.us>',MAIL_TO:'fernando@wizards.global',CONTACT_RATE_LIMITER:{limit:vi.fn(async()=>({success:true}))},ASSETS:{fetch:vi.fn(async()=>new Response('not found',{status:404}))}} as any;
const request=(body:any=data,headers:any={})=>new Request(env.SITE_ORIGIN+'/api/contact',{method:'POST',headers:{Origin:env.SITE_ORIGIN,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1',...headers},body:JSON.stringify(body)});
afterEach(()=>{vi.unstubAllGlobals();vi.clearAllMocks();});
describe('support delivery boundary',()=>{
 it('rejects invalid fields, unknown topics, injection and honeypots',()=>{
  expect(validate(data)).toBeTruthy();
  for(const patch of [{email:'x\r\nBcc:y@example.com'},{name:'x\ny'},{topic:'Sales'},{message:'short'},{message:'x'.repeat(3001)},{website:'spam'},{consent:false}])expect(validate({...data,...patch})).toBeNull();
 });
 it('rejects foreign origins, unsupported payloads and missing configuration before fetch',async()=>{
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
  expect((await contact(request(data,{Origin:'https://evil.example'}),env)).status).toBe(403);
  expect((await contact(request(data,{'Content-Type':'text/plain'}),env)).status).toBe(415);
  expect((await contact(request(),{...env,RESEND_API_KEY:''})).status).toBe(503);
  expect(fetch).not.toHaveBeenCalled();
 });
 it('bounds streamed bodies and rate limits hashed identities',async()=>{
  expect((await contact(request({...data,message:'x'.repeat(17000)}),env)).status).toBe(400);
  expect((await contact(request(),{...env,CONTACT_RATE_LIMITER:{limit:async()=>({success:false})}})).status).toBe(429);
  expect(env.CONTACT_RATE_LIMITER.limit.mock.calls[0][0].key).not.toContain('192.0.2.1');
 });
 it.each([{success:false},{success:'true',action:'support',hostname:'dev.neoncitysmokeshop.com'},{success:true,action:'other',hostname:'dev.neoncitysmokeshop.com'},{success:true,action:'support',hostname:'localhost'}])('requires strict verification action and host: %j',async(result)=>{
  const fetch=vi.fn(async()=>Response.json(result));vi.stubGlobal('fetch',fetch);
  expect((await contact(request(),env)).status).toBe(403);expect(fetch).toHaveBeenCalledTimes(1);
 });
 it('fails closed on verification network errors',async()=>{
  vi.stubGlobal('fetch',vi.fn(async()=>{throw new Error('upstream');}));expect((await contact(request(),env)).status).toBe(403);
 });
 it('sends both alternatives with fixed recipient, reply address, attribution and retry key',async()=>{
  const fetch=vi.fn().mockResolvedValueOnce(Response.json({success:true,action:'support',hostname:'dev.neoncitysmokeshop.com'})).mockResolvedValueOnce(Response.json({id:'test-receipt'}));vi.stubGlobal('fetch',fetch);
  expect((await contact(request(),env)).status).toBe(200);
  expect(fetch.mock.calls[0][0]).toContain('/siteverify');
  const [url,init]=fetch.mock.calls[1];const payload=JSON.parse(init.body);
  expect(url).toBe('https://api.resend.com/emails');expect(init.headers.Authorization).toBe('Bearer test-key');expect(init.headers['Idempotency-Key']).toMatch(/^neon-support-/);
  expect(payload).toMatchObject({from:env.MAIL_FROM,to:[env.MAIL_TO],reply_to:data.email,subject:'Neon City support: Website feedback'});
  for(const field of [data.name,data.email,data.topic,data.message,'Consent: Yes','Wizards Services']){expect(payload.text).toContain(field);expect(payload.html).toContain(field);}
  expect(payload.html).toContain('href="https://www.wizards.us/"');expect(payload.html).not.toMatch(/<img|<script|<form/);
 });
 it('reports primary notification failure',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(Response.json({success:true,action:'support',hostname:'dev.neoncitysmokeshop.com'})).mockResolvedValueOnce(Response.json({error:'private provider data'},{status:403})));
  const r=await contact(request(),env);expect(r.status).toBe(502);expect(await r.text()).not.toContain('private provider data');
 });
 it('keeps retries stable within the ten-minute bucket',async()=>{
  expect(await idempotency(validate(data)!,1000)).toBe(await idempotency(validate(data)!,9000));
  expect(await idempotency(validate(data)!,1000)).not.toBe(await idempotency(validate(data)!,601000));
 });
 it('rejects replayed Turnstile tokens before email',async()=>{
  const fetch=vi.fn(async()=>Response.json({success:false,'error-codes':['timeout-or-duplicate']}));vi.stubGlobal('fetch',fetch);
  expect((await contact(request(),env)).status).toBe(403);expect(fetch).toHaveBeenCalledTimes(1);
 });
 it('puts noindex and security headers on missing pages and API errors',async()=>{
  for(const url of ['/missing','/api/missing','/api/contact']){const r=await worker.fetch(new Request(env.SITE_ORIGIN+url),env);expect(r.headers.get('X-Robots-Tag')).toContain('noindex');expect(r.headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");}
 });
 it('caches versioned bundles and media while keeping documents non-cacheable',async()=>{
  const assetEnv={...env,ASSETS:{fetch:vi.fn(async()=>new Response('asset',{status:200}))}} as any;
  expect((await worker.fetch(new Request(env.SITE_ORIGIN+'/_astro/site.hash.js'),assetEnv)).headers.get('Cache-Control')).toContain('immutable');
  expect((await worker.fetch(new Request(env.SITE_ORIGIN+'/images/neon-city-full-logo.webp'),assetEnv)).headers.get('Cache-Control')).toContain('stale-while-revalidate');
  expect((await worker.fetch(new Request(env.SITE_ORIGIN+'/about/'),assetEnv)).headers.get('Cache-Control')).toBe('no-store');
  expect((await worker.fetch(new Request(env.SITE_ORIGIN+'/version.json'),assetEnv)).headers.get('Cache-Control')).toBe('no-store');
 });
 it('allows production pages to be indexed and redirects www to the canonical apex',async()=>{
  const production={...env,SITE_ORIGIN:'https://neoncitysmokeshop.com',TURNSTILE_HOSTNAMES:'neoncitysmokeshop.com,www.neoncitysmokeshop.com',ASSETS:{fetch:vi.fn(async()=>new Response('page',{status:200}))}} as any;
  const page=await worker.fetch(new Request('https://neoncitysmokeshop.com/about/'),production);
  expect(page.headers.has('X-Robots-Tag')).toBe(false);
  const legacy=await worker.fetch(new Request('https://neoncitysmokeshop.com/author/hernan-diego-velarde/'),production);
  expect(legacy.headers.get('X-Robots-Tag')).toContain('noindex');
  const redirect=await worker.fetch(new Request('https://www.neoncitysmokeshop.com/blog/?source=www'),production);
  expect(redirect.status).toBe(308);expect(redirect.headers.get('Location')).toBe('https://neoncitysmokeshop.com/blog/?source=www');
 });
});
describe('notification context and escaping',()=>{
 it('omits unavailable context and raw IP',()=>{const c=requestContext(request());expect(JSON.stringify(c)).not.toMatch(/192\.0\.2\.1|undefined/);});
 it('bounds, sanitizes and renders the full context in both alternatives',()=>{
  const req=request(data,{'Referer':env.SITE_ORIGIN+'/?secret=hidden&utm_source=test#private','Accept-Language':'en-US,en;q=0.9','User-Agent':'Mozilla/5.0 (Windows) Chrome/125.0','CF-Ray':'abc-DFW'});
  Object.defineProperty(req,'cf',{value:{city:'<img src=x>'+ 'a'.repeat(500),region:'Nevada',country:'US',postalCode:'89101',latitude:'36.1',longitude:'-115.1',timezone:'America/Los_Angeles',asOrganization:'Test network',asn:123,colo:'LAX'}});
  const content=emailBodies({...validate(data)!,message:'Test <script>bad</script> & content'},req);
  for(const label of Object.keys(requestContext(req))){expect(content.text).toContain(label);expect(content.html).toContain(label);}
  expect(content.html).toContain('&lt;script&gt;');expect(content.html).not.toContain('<script>');expect(content.html).toContain('&lt;img');
  expect(content.text).not.toContain('secret=hidden');expect(content.text).not.toContain('#private');expect(content.text).not.toContain('192.0.2.1');expect(requestContext(req)['Approximate city'].length).toBe(120);
 });
});
