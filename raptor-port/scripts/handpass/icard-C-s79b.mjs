import * as L from './icard-C-lib.mjs'
import { readFileSync, writeFileSync } from 'node:fs'
const { sleep } = L
const out = []
const errs = []
for (const S of [{ tag: 'phone 390x568', size: 'phone', viewport: { width: 390, height: 568 } }, { tag: 'phone 844x390', size: 'phone', viewport: { width: 844, height: 390 } }]) {
  const w = await L.world(S.size, 'ad', { viewport: S.viewport })
  const p = w.page
  try {
    await L.fileNew(w, { iso: '2026-07-24', type: 'Duty', s: '09:00', e: '12:00' })
    await L.declareHoliday(w, '2026-07-24', 'Test holiday', 'TH'); await L.closeWins(p)
    await L.openDay(w, '2026-07-24')
    const c = p.locator('[data-testid^="idy-row-"]').filter({ hasText: 'Duty' }).first()
    await c.locator('[data-testid="idy-open"]').tap(); await L.win(p).waitFor(); await sleep(300)
    const a = p.locator('[data-testid="oil-answer"]')
    await a.scrollIntoViewIfNeeded(); await sleep(300)
    const before = await a.evaluate(e => { const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], hit: x === e || e.contains(x) } })
    await a.tap(); await sleep(700)
    let q = await L.oilText(p)
    let how = 'tap'
    if (!q) { await a.click({ force: true }).catch(() => {}); await sleep(700); q = await L.oilText(p); how = 'then a forced click' }
    const f = q ? await p.locator('[data-testid="oilconf-save"]').evaluate(e => { const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { in: r.top >= 0 && r.bottom <= innerHeight, hit: x === e || e.contains(x), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] } }) : null
    const pic = await L.pic(w, `79b-${S.tag.replace(/[ ]/g, '-')}-oil-question`)
    out.push(`${S.tag}: Answer... button ${JSON.stringify(before)}; ${how} -> question ${q ? 'OPEN' : 'DID NOT OPEN'}; Save of the question ${JSON.stringify(f)} (${pic})`)
  } catch (e) { out.push(`${S.tag}: ERR ${String(e).slice(0, 200)}`) }
  errs.push(...w.errors)
  await w.browser.close()
}
const j = JSON.parse(readFileSync(L.JSONF, 'utf8'))
j.extras = j.extras || []
j.extras.push({ text: '79b OIL question on short screens: ' + out.join(' || '), pic: '' })
j.errors = [...new Set([...(j.errors || []), ...errs])]
writeFileSync(L.JSONF, JSON.stringify(j, null, 1))
console.log(out.join('\n'))
