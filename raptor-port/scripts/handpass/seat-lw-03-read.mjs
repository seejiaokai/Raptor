/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 2: read the money.
   Resumes the world seat-lw-02-setup.mjs published and answers the first two
   of the four questions the plan names: does a man credited through a
   PLACEHOLDER get the same OIL tracker figure as a man named directly on a
   row, and does the day's cell read FO or HO as the schedule decided. */
import { open, go, shot } from './lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const STATE = process.env.LW_STATE || OUT + '/state-lw-published.json'
const SATISO = '2026-07-18', SUNISO = '2026-07-19'
const { browser, page, errors } = await open({ state: STATE })

await go(page, 'leavewar')
await page.waitForTimeout(2200)

const read = async (iso) => page.evaluate(d => {
  const out = []
  for (const r of document.querySelectorAll('[data-testid^="row-"]')) {
    const id = r.getAttribute('data-testid').slice(4)
    const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`)
    const n = r.querySelector(`[data-testid="person-${id}"]`)
    out.push({ id, cs: (n ? n.innerText : '').replace(/\s+/g, ' ').trim().slice(0, 18),
      txt: c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : 'NO CELL',
      title: c ? (c.getAttribute('title') || '').slice(0, 90) : '' })
  }
  return out
}, iso)

for (const [lbl, iso] of [['SATURDAY 18 Jul (SAT DESK crowd 08:00-18:00 + Piston named 08:00-18:00)', SATISO],
                          ['SUNDAY  19 Jul (SUN DESK crowd 09:00-12:00)', SUNISO]]) {
  const cells = await read(iso)
  const filled = cells.filter(c => c.txt && c.txt !== 'NO CELL')
  console.log('\n=== ' + lbl)
  console.log('   cells with something in them: ' + filled.length + ' of ' + cells.length)
  const by = {}
  for (const c of filled) (by[c.txt] = by[c.txt] || []).push(c.cs)
  for (const k of Object.keys(by)) console.log('   [' + k + '] x' + by[k].length + ' :', by[k].join(' '))
  const sample = filled.slice(0, 3)
  for (const s of sample) console.log('   title on ' + s.cs + ': ' + s.title)
}
await shot(page, 'LW-07-war-grid-after-publish')

/* The OIL tracker figure per man — money, not screen. */
await page.click('[data-testid="oil-tracker"]')
await page.waitForTimeout(1500)
const bal = await page.evaluate(() => {
  const out = []
  for (const r of document.querySelectorAll('[data-testid^="oil-row-"]')) {
    const id = r.getAttribute('data-oilrow')
    const b = r.querySelector(`[data-testid="oil-bal-${id}"]`)
    const nm = r.querySelector(`[data-testid="oil-name-${id}"]`)
    out.push({ id, cs: (nm ? nm.innerText : '').replace(/\s+/g, ' ').trim().slice(0, 18),
      bal: b ? b.textContent.trim() : null,
      jul: [...r.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim())
        .filter(t => /1[89] Jul/.test(t)) })
  }
  return out
})
console.log('\n=== OIL TRACKER — every man whose ledger names 18 or 19 Jul')
for (const b of bal) if (b.jul.length) console.log('  ', b.cs.padEnd(14), 'bal=' + b.bal, '|', b.jul.join(' ;; '))
console.log('\n   men with NO 18/19 Jul entry:', bal.filter(b => !b.jul.length).map(b => b.cs).join(' '))
await shot(page, 'LW-08-oil-tracker-after-publish')
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
