const clean = (v: unknown, n = 120) => typeof v === 'string' || typeof v === 'number' ? String(v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n) : '';
export function requestContext(request: Request): Record<string, string> {
  const cf = (request.cf || {}) as Record<string, unknown>;
  const result: Record<string, string> = { 'Submitted (UTC)': new Date().toISOString() };
  for (const [label, key, limit] of [['Approximate city','city',120],['Approximate region','region',120],['Country','country',120],['Approximate postal code','postalCode',120],['Approximate latitude','latitude',120],['Approximate longitude','longitude',120],['Time zone','timezone',80],['Network organization','asOrganization',160],['ASN','asn',120],['Edge colo','colo',120]] as const) {
    const v = clean(cf[key],limit); if (v) result[label] = v;
  }
  if (result['Time zone']) { try { result['Approximate local time'] = new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'long',timeZone:result['Time zone']}).format(new Date()); } catch { /* malformed or unavailable zone omitted */ } }
  const language = clean(request.headers.get('Accept-Language')?.split(',')[0],35); if(language) result['Preferred language']=language;
  const ua = request.headers.get('User-Agent')?.slice(0,1000) || '';
  if (ua) result['Browser / OS / device'] = `${/Edg\//.test(ua)?'Edge':/Firefox\//.test(ua)?'Firefox':/Chrome\//.test(ua)?'Chrome':/Safari\//.test(ua)?'Safari':'Other'} / ${/Android/.test(ua)?'Android':/iPhone|iPad/.test(ua)?'iOS':/Windows/.test(ua)?'Windows':/Mac/.test(ua)?'macOS':/Linux/.test(ua)?'Linux':'Other'} / ${/Mobile|Android|iPhone/.test(ua)?'Mobile':'Desktop or tablet'}`;
  const ray = clean(request.headers.get('CF-Ray'),80); if(ray)result['Cloudflare Ray ID']=ray;
  try {
    const source = new URL(request.headers.get('Referer') || new URL('/',request.url));
    if (source.origin === new URL(request.url).origin) {
      result['Source page']=clean(source.origin+source.pathname,600);
      const campaign=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].map(k => source.searchParams.has(k)?`${k}=${clean(source.searchParams.get(k),100)}`:'').filter(Boolean).join('; ').slice(0,500);
      if(campaign)result['Campaign']=campaign;
    }
  } catch { /* no untrusted fallback URL */ }
  return result;
}
