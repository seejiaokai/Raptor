import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
export const root = fileURLToPath(new URL('../../', import.meta.url))
const digest = bytes => createHash('sha256').update(bytes).digest('hex')
const rel = path => relative(root, path).replaceAll('\\', '/')
function tree(dir) { return readdirSync(dir, { withFileTypes:true }).flatMap(e => e.isDirectory() ? tree(resolve(dir,e.name)) : [resolve(dir,e.name)]) }
export function freeze(file) {
  if (existsSync(file)) throw new Error('Freeze already exists; retain it and choose a new name')
  const files = ['src','e2e','dist'].flatMap(d => tree(resolve(root,d)))
  files.push(...['package.json','package-lock.json','playwright.config.ts','vite.config.ts',
    'docs/superpowers/plans/2026-10-04-schedule-tab-build-plan.md',
    'scripts/handpass/schedule-tab-evidence.mjs','scripts/handpass/schedule-tab-walk.mjs',
    'scripts/handpass/schedule-tab-role-picture.mjs'].map(p => resolve(root,p)))
  const result = { created:new Date().toISOString(), files:files.map(p => ({path:rel(p),sha256:digest(readFileSync(p))})) }
  writeFileSync(file, JSON.stringify(result,null,2)); console.log(`Frozen ${result.files.length} files`)
}
export async function verify(file, base) {
  const data = JSON.parse(readFileSync(file)), assets = data.files.filter(f => f.path.startsWith('dist/'))
  if (!assets.length) throw new Error('Empty dist verification is not proof')
  for (const f of data.files) if (digest(readFileSync(resolve(root,f.path))) !== f.sha256) throw new Error('Freeze mismatch: '+f.path)
  const served=[]
  for (const f of assets) {
    const url = new URL(f.path.slice(5), base+'/').href, response = await fetch(url)
    if (!response.ok) throw new Error('HTTP '+response.status+' '+url)
    const hash=digest(Buffer.from(await response.arrayBuffer()))
    if (hash !== f.sha256) throw new Error('Served asset mismatch: '+url)
    served.push({path:f.path,url,sha256:hash})
  }
  return {files:data.files.length,assets:served}
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [mode,file,base] = process.argv.slice(2)
  if (mode === 'freeze') freeze(resolve(file))
  else if (mode === 'verify') console.log(JSON.stringify(await verify(resolve(file),base),null,2))
  else throw new Error('Use freeze <file> or verify <file> <base>')
}
