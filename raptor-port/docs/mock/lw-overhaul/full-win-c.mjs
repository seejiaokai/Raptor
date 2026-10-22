// Picture 15: the Inputs page's "+ Input" window for a leave — its document (D1150) the way a medical asks for one, never a
// stop; and Q6 — a member's leave on a locked day refused there too. The document control is the medical kind's own,
// taken from the same window with ATT C picked; the ask is the medical ask's own box with a leave's words.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, mark, unmark, errs, OUT } from './full-lib.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const { ctx, p } = await newPage(browser, 390, 844, true, state)
await signIn(p, 'member')
await p.evaluate(() => window.go('inputs')); await p.waitForTimeout(1200)
await p.locator('button:has-text("List")').first().tap(); await p.waitForTimeout(700)
await p.locator('button:has-text("+ Input")').first().tap(); await p.waitForTimeout(900)
const sel = p.locator('.inpedwin select').first()
const opts = await sel.evaluate(s => [...s.options].map(o => o.value + '=' + o.textContent.trim()))
console.log('types:', opts.slice(0, 20).join(' | '))
// today, a medical: its document control
await sel.selectOption({ label: opts.find(o => /ATT C/.test(o)).split('=')[1] }).catch(e => console.log('no ATT C', e.message)); await p.waitForTimeout(500)
await shot(p, 't-w15-phone-medical')
const docRow = await p.evaluate(() => { const b = document.querySelector('.inpedwin .docbtn'); return b ? b.outerHTML : null })
console.log('doc row found:', !!docRow)
// a leave (OL, the window's own default since D917): today no document
await sel.selectOption({ label: opts.find(o => /=OL\b|Overseas/.test(o)).split('=')[1] }).catch(e => console.log('no OL', e.message)); await p.waitForTimeout(500)
await shot(p, 't-w15-phone-leave')
await p.evaluate(html => {
  const w = document.querySelector('.inpedwin'); const rem = [...w.querySelectorAll('.inped-k')].find(l => /Remarks/.test(l.textContent))
  const n = document.createElement('div'); n.className = 'zz-new zz-ldoc'; n.style.margin = '0 0 12px'
  n.innerHTML = '<label class="inped-k">Document</label><div>' + (html || '') + '</div>'
  rem.before(n)
}, docRow)
await p.waitForTimeout(200); await shot(p, 'p-w15-phone-leave-clean')
await mark(p, '.zz-ldoc', '1', { num: true })
await shot(p, 'p-w15-phone-leave'); await unmark(p)
// the ask at "Add", a medical ask's own box (DocConfirm) with a leave's words — never a stop
await p.evaluate(() => {
  const pop = document.createElement('div'); pop.className = 'airpop upconf-pop docconf-pop zz-new zz-ask'
  pop.innerHTML = `<div class="airpop-box upconf-box"><div class="airpop-head"><b>No leave form — Ranger, OL</b><button class="x" aria-label="Close">✕</button></div>
    <div class="airpop-body upconf-body"><div class="upconf-h">This leave has no approved form attached.</div>
    <div style="margin:6px 0 12px;color:#8a96a3;font:500 13.5px/1.5 system-ui">You can add it now or later. The bell reminds you the day before the leave starts.</div>
    <div style="display:flex;gap:8px"><button class="abtn primary">Upload</button><button class="abtn">Later</button></div></div></div>`
  document.body.appendChild(pop)
})
await p.waitForTimeout(250); await mark(p, '.zz-ask .airpop-box', '2', { num: true }); await shot(p, 'p-w15-phone-leave-ask'); await unmark(p)
await p.evaluate(() => document.querySelector('.zz-ask')?.remove())
// Q6: on a locked day the Inputs page refuses a member's leave too, and says why
await p.evaluate(() => {
  const w = document.querySelector('.inpedwin'); const add = [...w.querySelectorAll('button.abtn')].find(b => b.textContent.trim() === 'Add')
  const n = document.createElement('div'); n.className = 'zz-new zz-refuse'
  n.style.cssText = 'margin:8px 2px;padding:8px 10px;border-radius:8px;background:rgba(240,85,95,.10);color:#FFA6AD;font:600 13.5px/1.45 system-ui'
  n.textContent = 'Tue 10 Feb is locked: Exercise week. Ask a scheduler to file it.'
  ;(add?.parentElement || w).before(n)
})
await p.evaluate(() => document.querySelector('.zz-refuse')?.scrollIntoView({ block: 'center' })); await p.waitForTimeout(250)
await mark(p, '.zz-refuse', '3', { num: true }); await shot(p, 'p-w15-phone-locked')
await ctx.close(); await browser.close(); console.log('errors:', errs)
