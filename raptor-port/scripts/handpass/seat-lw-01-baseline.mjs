/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, the baseline pair.
   BEFORE anything is placed: what the schedule says about the Saturday, and
   what the war's Saturday column says about every man. The two lists are read
   in the SAME run so a later comparison cannot be blamed on a different world. */
import { open, board, readDay, go, shot, STATE } from './lib.mjs'

const ISO = '2026-07-18'
const DI = 5
const { browser, page, errors } = await open({ state: STATE })

await board(page, DI)
const R = await readDay(page, DI)
const pub = await page.evaluate(i => {
  const S = window.SCHED || {}
  return { dayOK: (S.dayOK || {})[i], cur: (S.cur || {})[i], als: ((S.als || {})[i] || []).length,
    verchip: (document.querySelector('#schedBoard .verchip') || {}).innerText || '' }
}, DI)
console.log('DAY', DI, 'date', await page.evaluate(i => window.DAYS[i].date, DI))
console.log('publish state:', JSON.stringify(pub))
console.log('waves:', JSON.stringify(R.waves).slice(0, 1800))
console.log('duties:', JSON.stringify(R.duties))
console.log('sims:', JSON.stringify(R.sims))
console.log('ground:', JSON.stringify(R.ground))
console.log('prog:', JSON.stringify(R.prog))

await go(page, 'leavewar')
await page.waitForTimeout(1600)
const cells = await page.evaluate(d => {
  const out = []
  for (const r of document.querySelectorAll('[data-testid^="row-"]')) {
    const id = r.getAttribute('data-testid').slice(4)
    const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`)
    const n = r.querySelector(`[data-testid="person-${id}"]`)
    out.push({ id, cs: (n ? n.innerText : '').replace(/\s+/g, ' ').trim().slice(0, 18),
      txt: c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : 'NO CELL',
      cls: c ? c.className.replace(/\s+/g, ' ').trim().slice(0, 60) : '',
      title: c ? (c.getAttribute('title') || '').slice(0, 70) : '' })
  }
  return out
}, ISO)
console.log('\nWAR CELLS for', ISO, '— only the non-blank ones:')
for (const c of cells) if (c.txt || c.title) console.log(' ', c.cs.padEnd(16), '[' + c.txt + ']', c.cls, c.title ? '· ' + c.title : '')
console.log('(blank for ' + cells.filter(c => !c.txt && !c.title).length + ' of ' + cells.length + ')')
await shot(page, 'LW-02-saturday-column-baseline')
console.log('errors:', errors.slice(0, 8))
await browser.close()
