/* DOOR CHECK for blocks C and D — name the on-screen control for every action
   in "retraction, editing, publishing, amending" before walking any of it. */
import { open, board, shot, SHOTS } from './lib.mjs'

const STATE = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f98d5224-18e3-4e42-8a4f-bd4fe1b84782/scratchpad/cd/base.json'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

const dump = await page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const vis = e => !!(e.offsetParent || e.getClientRects().length)
  const out = {}
  // every data-* attribute name in use on the board, with a sample
  const attrs = {}
  root.querySelectorAll('*').forEach(e => {
    if (!vis(e)) return
    for (const a of e.attributes) {
      if (!a.name.startsWith('data-')) continue
      attrs[a.name] = attrs[a.name] || { n: 0, sample: [], text: [] }
      attrs[a.name].n++
      if (attrs[a.name].sample.length < 3) {
        attrs[a.name].sample.push(a.value.slice(0, 30))
        attrs[a.name].text.push((e.innerText || e.title || e.tagName).replace(/\s+/g, ' ').trim().slice(0, 24))
      }
    }
  })
  out.attrs = attrs
  // every visible button on the board with its label
  out.buttons = [...root.querySelectorAll('button, .btn, [role=button]')].filter(vis)
    .map(b => ({ t: (b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 28), id: b.id, cls: b.className.slice(0, 40),
      d: Object.entries(b.dataset).map(([k, v]) => k + '=' + String(v).slice(0, 22)).join(' ') }))
    .filter(b => b.t || b.d)
  // the day's top bar text
  const bar = root.querySelector('.sb-top, .sb-daybar, .sb-head')
  out.topbar = bar ? (bar.innerText || '').replace(/\n+/g, ' | ').slice(0, 500) : null
  out.boardText = (root.innerText || '').replace(/\n+/g, ' | ').slice(0, 1800)
  return out
})

console.log('=== DATA ATTRS ===')
Object.entries(dump.attrs).sort().forEach(([k, v]) => console.log(`  ${k.padEnd(20)} x${String(v.n).padEnd(4)} ${v.sample.join(' , ')}   << ${v.text.join(' / ')}`))
console.log('\n=== BUTTONS ===')
dump.buttons.forEach(b => console.log(`  "${b.t}" #${b.id} .${b.cls} [${b.d}]`))
console.log('\n=== TOPBAR ===\n' + dump.topbar)
console.log('\n=== BOARD TEXT ===\n' + dump.boardText)
console.log('\nerrors:', errors.slice(0, 5))
await shot(page, 'CD-doors-board')
await browser.close()
