/* DIAGNOSIS 2 for defect 4: LIVE crowd vs ISSUED crowd, and who the extra man is. */
import { open, board } from './lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const { browser, page, errors } = await open({ state: OUT + '/state-lw-published.json' })
await board(page, 6)

const out = await page.evaluate(() => {
  const w = window
  const di = w.SBDAY
  const snap = w.daySnapOf(di, w.dayCurVer(di))
  const issued = snap && snap.d && snap.d.oilev
  const live = w.oilEvidenceOf(di)
  const item = Object.keys(issued.sent).sort((a, b) => issued.sent[b].length - issued.sent[a].length)[0]
  const A = issued.sent[item] || []
  const B = (live && live.sent[item]) || []
  const cs = p => (w.PEOPLE[p] || {}).cs || p
  const extra = B.filter(p => !A.includes(p))
  const missing = A.filter(p => !B.includes(p))
  const body = extra.map(p => { const q = w.PEOPLE[p] || {}; return { id: p, cs: q.cs, archived: !!q.archived, san: !!q.san, pers: !!q.pers, special: !!q.special } })
  return { item, issuedN: A.length, liveN: B.length, extra: extra.map(cs), missing: missing.map(cs), body }
})
console.log(JSON.stringify(out, null, 1))

/* what the Leave War roster says about the extra man */
await page.evaluate(() => window.go('leavewar'))
await page.waitForTimeout(2500)
const war = await page.evaluate(() => {
  const rows = []
  for (const r of document.querySelectorAll('[data-testid^="row-"]')) {
    const id = r.getAttribute('data-testid').slice(4)
    const c = document.querySelector(`[data-testid="cell-${id}-2026-07-19"]`)
    rows.push({ id, txt: c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : '(no cell)', cls: c ? c.className : '' })
  }
  return rows.filter(r => /torch|grit|fable/i.test(r.id) || /FO|HO|PO/.test(r.txt)).slice(0, 60)
})
console.log('war rows on 19 Jul:', JSON.stringify(war, null, 1).slice(0, 3000))
console.log('errors:', errors.slice(0, 5))
await browser.close()
