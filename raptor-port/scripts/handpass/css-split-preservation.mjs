/* One-off D540/D541 preservation evidence, bound to the combined pre-split commit.
   Usage: node ... capture | extract | compare. Never updates expected evidence. */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'

const ref='0804877ca099c844b77bfd8692cd2d055e5534c7'
const dir='docs/handpass/css-split/preservation'
const hash=b=>createHash('sha256').update(b).digest('hex')
const original=execFileSync('git',['show',`${ref}:raptor-port/src/ui/scheduler.css`],{maxBuffer:2**20})
assert.equal(hash(original),'0c16a9f046abaedb4f06e7876e2811a78e4695cf930fee884e3432d3c0f26fec')
const specs=[
 [1,'00-foundation-login.css',':root{'],[209,'01-logic.css','LOGIC'],[299,'02-shell.css','TOP BAR'],
 [617,'03-week.css','WEEK / DAY'],[1226,'04-pucks-sections.css','PUCK'],[1998,'05-quals.css','QUALS PAGE'],
 [2167,'06-inputs.css','INPUTS PAGE'],[2550,'07-inputs-calendar.css','MONTH CALENDAR'],
 [2903,'08-windows-tools.css','MODALS / DRAWER'],[3341,'09-week-responsive.css','prefers-reduced-motion'],
 [3772,'10-board-history.css','SCHEDULER BOARD'],[4260,'11-drag.css','BOTH GHOSTS'],
 [4441,'12-schedule-editing.css','/*'],[4799,'13-board-rows-responsive.css','scheduler-board line controls'],
 [5721,'14-input-editors.css','type legend'],[5975,'15-admin-help.css','Admin page'],
 [6111,'16-medical.css','MEDICAL PAPERWORK'],[6240,'17-save-status.css',"postman's indicator"],
 [6261,'18-oil-board.css','/*'],[6415,'19-availability.css','ALL-AVAIL-WINDOW'],
 [6541,'20-changes-quals.css','D149'],[6703,'21-insights.css','D515/D524/D532'],
]
const assets=()=>readdirSync('dist/assets').filter(p=>p.endsWith('.css')).sort().map(p=>({name:p,hash:hash(readFileSync('dist/assets/'+p)),bytes:readFileSync('dist/assets/'+p).length}))
const mode=process.argv[2]
if(mode==='capture'){
 assert.ok(!existsSync(dir),'Baseline already exists; never overwrite')
 assert.deepEqual(readFileSync('src/ui/scheduler.css'),original)
 mkdirSync(dir,{recursive:true});writeFileSync(dir+'/baseline.source.css',original)
 const built=assets();assert.ok(built.length>0)
 for(const a of built)writeFileSync(dir+'/'+a.name,readFileSync('dist/assets/'+a.name))
 writeFileSync(dir+'/baseline.json',JSON.stringify({ref,sourceHash:hash(original),bytes:original.length,assets:built},null,2))
 console.log('Captured exact integrated baseline',original.length,built)
}else if(mode==='extract'){
 assert.ok(existsSync(dir+'/baseline.json'),'Capture production baseline first')
 assert.deepEqual(readFileSync('src/ui/scheduler.css'),original)
 assert.ok(!existsSync('src/ui/scheduler'),'Never overwrite parts')
 const starts=[0];for(let i=0;i<original.length;i++)if(original[i]===10)starts.push(i+1)
 mkdirSync('src/ui/scheduler')
 const parts=specs.map(([line,name,anchor],i)=>{
  const start=starts[line-1],end=i+1<specs.length?starts[specs[i+1][0]-1]:original.length
  const bytes=original.subarray(start,end);assert.ok(bytes.subarray(0,150).toString().includes(anchor),`${name}: wrong boundary`)
  writeFileSync('src/ui/scheduler/'+name,bytes);return {name,line,start,end,hash:hash(bytes),bytes:bytes.length}
 })
 assert.deepEqual(Buffer.concat(parts.map(p=>readFileSync('src/ui/scheduler/'+p.name))),original)
 const entry='/* Explicit eager cascade: contiguous screen/shared runs in their original order.\r\n   Late overrides intentionally remain late. See the CSS split plan for ownership. */\r\n'+parts.map(p=>`@import './scheduler/${p.name}';`).join('\r\n')+'\r\n'
 writeFileSync('src/ui/scheduler.css',entry)
 writeFileSync(dir+'/source-equality.json',JSON.stringify({ref,sourceHash:hash(original),parts,exactByteRecomposition:true},null,2))
 console.log('22 contiguous parts recompose exactly')
}else if(mode==='compare'){
 const before=JSON.parse(readFileSync(dir+'/baseline.json','utf8')),after=assets()
 assert.deepEqual(after.map(a=>a.hash).sort(),before.assets.map(a=>a.hash).sort(),'Emitted stylesheet content changed')
 writeFileSync(dir+'/compiled-equality.json',JSON.stringify({ref,before:before.assets,after,exactByteEquality:true},null,2))
 console.log('ALL emitted CSS assets are byte-identical, including lazy screen styles')
}else throw Error('Use capture, extract or compare')
