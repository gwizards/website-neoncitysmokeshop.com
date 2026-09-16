import { topics } from '../shared/site';
import { requestContext } from './context';
type Bindings = Env & { RESEND_API_KEY?: string; TURNSTILE_SECRET?: string; RATE_LIMIT_PEPPER?: string };
type Payload = { name: string; email: string; topic: string; message: string; consent: true };
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const json = (status: number, error?: string) => Response.json(error ? {ok:false,error} : {ok:true}, {status,headers:{'Cache-Control':'no-store'}});
async function hash(value: string) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), b=>b.toString(16).padStart(2,'0')).join(''); }
async function readBody(request: Request) {
  if(Number(request.headers.get('Content-Length'))>16384)throw new Error('large');
  const reader=request.body?.getReader(); if(!reader)throw new Error('empty');
  const chunks: Uint8Array[]=[]; let size=0;
  try { while(true) { const {value,done}=await reader.read(); if(done)break; size+=value.length; if(size>16384){await reader.cancel();throw new Error('large');} chunks.push(value); } }
  finally {reader.releaseLock();}
  const all=new Uint8Array(size);let at=0;for(const chunk of chunks){all.set(chunk,at);at+=chunk.length;}
  return JSON.parse(new TextDecoder().decode(all));
}
export function validate(data: unknown): Payload | null {
  if(!data || typeof data!=='object' || Array.isArray(data))return null;
  const d=data as Record<string,unknown>;
  for(const [k,max] of [['name',100],['email',254],['topic',50],['message',3000]] as const)if(typeof d[k]!=='string' || (d[k] as string).length>max)return null;
  const name=(d.name as string).trim(), email=(d.email as string).trim().toLowerCase(), topic=d.topic as string, message=(d.message as string).trim();
  if(name.length<2 || /[\r\n\x00-\x1f\x7f]/.test(name+email) || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(email) || !(topics as readonly string[]).includes(topic) || message.length<20 || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(message) || d.consent!==true || d.website)return null;
  return {name,email,topic,message,consent:true};
}
export async function idempotency(data: Payload, now=Date.now()) { return 'neon-support-'+await hash(JSON.stringify(data)+':'+Math.floor(now/600000)); }
export function emailBodies(data: Payload, request: Request) {
  const context=requestContext(request);
  const text=`Neon City · Support request\n\nTopic: ${data.topic}\nName: ${data.name}\nEmail: ${data.email}\nConsent: Yes\n\n${data.message}\n\nApproximate request context (Cloudflare; no external enrichment)\n${Object.entries(context).map(([k,v])=>`${k}: ${v}`).join('\n')}\n\nEmail delivery provided by Wizards Services • https://www.wizards.us/`;
  const html=`<!doctype html><html><body style="margin:0;background:#171320;color:#f4f3ee;font-family:Arial,sans-serif"><div style="display:none">New administrative support message for Neon City</div><table role="presentation" width="100%"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" style="max-width:600px;background:#221c2b;border-radius:12px"><tr><td style="padding:28px"><p style="color:#33bdc4;letter-spacing:2px">NEON CITY</p><h1 style="font-size:26px">Support request</h1><p style="color:#33bdc4">${escapeHtml(data.topic)}</p><p><strong>${escapeHtml(data.name)}</strong><br>${escapeHtml(data.email)}<br>Consent: Yes</p><a style="color:#33bdc4" href="mailto:${escapeHtml(data.email)}">Reply to sender</a><div style="background:#171320;padding:20px;margin-top:24px;line-height:1.6;overflow-wrap:anywhere">${escapeHtml(data.message).replaceAll('\n','<br>')}</div><h2 style="font-size:17px;margin-top:28px">Approximate request context</h2><p style="font-size:12px">Cloudflare supplied this context. No external enrichment was used.</p><table role="presentation" style="font-size:12px">${Object.entries(context).map(([k,v])=>`<tr><td style="padding:6px;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px;overflow-wrap:anywhere">${escapeHtml(v)}</td></tr>`).join('')}</table><p style="font-size:12px;margin-top:28px">Email delivery provided by Wizards Services • <a style="color:#33bdc4" href="https://www.wizards.us/">www.wizards.us</a></p></td></tr></table></td></tr></table></body></html>`;
  return {html,text};
}
export async function contact(request: Request, env: Bindings): Promise<Response> {
  if(request.method!=='POST')return new Response(null,{status:405,headers:{Allow:'POST'}});
  if(request.headers.get('Origin')!==env.SITE_ORIGIN || new URL(request.url).origin!==env.SITE_ORIGIN)return json(403,'forbidden');
  if(request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase()!=='application/json')return json(415,'unsupported_type');
  if(!env.RESEND_API_KEY || !env.TURNSTILE_SECRET || !env.RATE_LIMIT_PEPPER || !env.CONTACT_RATE_LIMITER || !env.TURNSTILE_HOSTNAMES)return json(503,'unavailable');
  const ip=request.headers.get('CF-Connecting-IP');
  if(!ip)return json(403,'forbidden');
  if(!(await env.CONTACT_RATE_LIMITER.limit({key:await hash(env.RATE_LIMIT_PEPPER+':ip:'+ip)})).success)return json(429,'rate_limited');
  let raw;try {raw=await readBody(request);}catch {return json(400,'invalid_request');}
  const data=validate(raw);if(!data)return json(400,'invalid_fields');
  if(!(await env.CONTACT_RATE_LIMITER.limit({key:await hash(env.RATE_LIMIT_PEPPER+':email:'+data.email)})).success)return json(429,'rate_limited');
  if(typeof raw.token!=='string' || !raw.token || raw.token.length>2048)return json(403,'verification_failed');
  try {
    const verified=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:raw.token,remoteip:ip}),signal:AbortSignal.timeout(8000)});
    if(!verified.ok)return json(403,'verification_failed');
    const check=await verified.json() as {success?: boolean;action?:string;hostname?:string};
    if(check.success!==true || check.action!=='support' || !env.TURNSTILE_HOSTNAMES.split(',').includes(check.hostname || ''))return json(403,'verification_failed');
  } catch {return json(403,'verification_failed');}
  try {
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':await idempotency(data)},body:JSON.stringify({from:env.MAIL_FROM,to:[env.MAIL_TO],reply_to:data.email,subject:`Neon City support: ${data.topic}`,...emailBodies(data,request)}),signal:AbortSignal.timeout(10000)});
    if(!response.ok)return json(502,'delivery_failed');
    const receipt=await response.json() as {id?:string};if(!receipt.id)return json(502,'delivery_failed');
    console.log(JSON.stringify({event:'support_delivery_accepted',id:receipt.id}));
    return json(200);
  } catch {return json(502,'delivery_failed');}
}
const csp="default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests";
export default { async fetch(request: Request, env: Bindings): Promise<Response> {
  const path=new URL(request.url).pathname;
  let response:Response;
  try { response=path.startsWith('/api/') ? path==='/api/contact' ? await contact(request,env) : json(404,'not_found') : await env.ASSETS.fetch(request); }
  catch {response=json(503,'unavailable');}
  const out=new Response(response.body,response);
  out.headers.set('X-Robots-Tag','noindex, nofollow, noarchive');
  out.headers.set('Content-Security-Policy',csp);
  out.headers.set('X-Content-Type-Options','nosniff');
  out.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  out.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  out.headers.set('Strict-Transport-Security','max-age=31536000');
  if(path.startsWith('/_astro/'))out.headers.set('Cache-Control','public, max-age=31536000, immutable');
  else if(/\.(?:avif|webp|png|svg|woff2|mp4)$/i.test(path))out.headers.set('Cache-Control','public, max-age=86400, stale-while-revalidate=604800');
  else out.headers.set('Cache-Control','no-store');
  return out;
}} satisfies ExportedHandler<Bindings>;
