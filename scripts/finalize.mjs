import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const hash = createHash('sha256');
for(const dir of ['src','worker','shared','public','scripts']) {
  for(const file of readdirSync(dir,{recursive:true,withFileTypes:true}).filter(f=>f.isFile()).map(f=>`${f.parentPath}/${f.name}`).sort()) hash.update(file).update(readFileSync(file));
}
for(const file of ['package.json','package-lock.json','astro.config.mjs','wrangler.jsonc'])hash.update(file).update(readFileSync(file));
let commit=null;try{commit=execFileSync('git',['rev-parse','--verify','HEAD'],{stdio:['ignore','pipe','ignore']}).toString().trim();}catch{}
let committed = false;
if (commit) {
  try { committed = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], { encoding: 'utf8' }).trim() === ''; } catch {}
}
writeFileSync('dist/version.json',JSON.stringify({site:'neon-city-support',environment:'development',sourceSha256:hash.digest('hex'),commit,committed,buildTime:new Date().toISOString()},null,2)+'\n');
