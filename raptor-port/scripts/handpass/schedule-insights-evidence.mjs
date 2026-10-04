import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { resolve, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
export const root=fileURLToPath(new URL('../../',import.meta.url))
const digest=b=>createHash('sha256').update(b).digest('hex')
function tree(p){return readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?tree(resolve(p,e.name)):[resolve(p,e.name)])}
export function freeze(file){
  if(existsSync(file))throw new Error('Preserve earlier freeze; choose a new path')
  const files=['src','e2e','dist'].flatMap(d=>tree(resolve(root,d)))
  files.push(...['package.json','package-lock.json','playwright.config.ts','vite.config.ts',
    'docs/superpowers/plans/2026-10-04-schedule-insights-menu-plan.md',
    'docs/superpowers/plans/2026-10-04-schedule-insights-menu-challenge.md',
    'docs/superpowers/plans/2026-10-04-schedule-insights-menu-acceptance-scenarios.md',
    'scripts/handpass/schedule-insights-evidence.mjs','scripts/handpass/schedule-insights-walk.mjs'].map(p=>resolve(root,p)))
  const snapshot=resolve(dirname(file),'snapshot')
  if(existsSync(snapshot))throw new Error('Preserve earlier snapshot')
  mkdirSync(dirname(file),{recursive:true})
  const entries=files.map(p=>{
    const name=relative(root,p).replaceAll('\\','/'),dest=resolve(snapshot,name)
    mkdirSync(dirname(dest),{recursive:true});copyFileSync(p,dest)
    return {path:name,sha256:digest(readFileSync(p))}
  })
  writeFileSync(file,JSON.stringify({created:new Date().toISOString(),files:entries},null,2));console.log(`Frozen ${entries.length} files`)
}
export async function verify(file,base){
  const data=JSON.parse(readFileSync(file)),assets=data.files.filter(f=>f.path.startsWith('dist/'))
  if(!assets.length)throw new Error('An empty served-asset list is not proof')
  for(const f of data.files)if(digest(readFileSync(resolve(root,f.path)))!==f.sha256)throw new Error('Freeze mismatch: '+f.path)
  const served=[]
  for(const f of assets){const url=new URL(f.path.slice(5),base+'/').href,res=await fetch(url);if(!res.ok)throw new Error('HTTP '+res.status+' '+url)
    const hash=digest(Buffer.from(await res.arrayBuffer()));if(hash!==f.sha256)throw new Error('Served bytes mismatch: '+f.path)
    served.push({path:f.path,url,sha256:hash})}
  return {files:data.files.length,assets:served}
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [mode,file,base]=process.argv.slice(2)
  if(mode==='freeze')freeze(resolve(file));else if(mode==='verify')console.log(JSON.stringify(await verify(resolve(file),base),null,2));else throw new Error('Use freeze <file> or verify <file> <base>')
}
