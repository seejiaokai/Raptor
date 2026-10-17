/* [TRK-CHART-FPS] / D993 — the walk of Quals' pinned header row, now moved sideways by the browser (the Leave War's way).
   On the production bundle: the row stands exactly over the table's headings at every sideways place, from its first
   frame, after a finger's scroll, after a rotate, while editing, and on a desktop; the callsign heading stays put over
   the left; a press on a pinned heading still sorts. Pictures to QP_SHOTS (default docs/img/handpass/2026-10-18-trk-chart-fps/quals),
   results to docs/handpass/parts/trk-fps/quals.json.
     HP_URL  the preview serving THIS checkout's dist (required) */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, rmSync, readdirSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_SHOTS ||= process.env.QP_SHOTS || resolve(HERE, '../../docs/img/handpass/2026-10-18-trk-chart-fps/quals')
process.env.HP_OUT ||= resolve(HERE, '../../docs/handpass/parts/trk-fps')
mkdirSync(process.env.HP_SHOTS, { recursive: true })
for (const f of readdirSync(process.env.HP_SHOTS)) if (f.endsWith('.png')) rmSync(resolve(process.env.HP_SHOTS, f))
if (!process.env.HP_URL) { console.error('HP_URL not set'); process.exit(2) }
{
  const served = ((await (await fetch(process.env.HP_URL + '/')).text()).match(/assets\/index-[^"']+\.js/) || [])[0]
  const local = readdirSync(resolve(HERE, '../../dist/assets')).find(f => /^index-.*\.js$/.test(f))
  if (!served || served !== 'assets/' + local) { console.error(`the preview at ${process.env.HP_URL} serves ${served}, this checkout built assets/${local}`); process.exit(2) }
}
const { open, toPage, shot, save, PHONE, DESK } = await import('./trk-lib.mjs')
console.log('quals-pinned-walk v1 —', process.env.HP_URL)
const rows = []
const note = (id, name, pass, detail) => { rows.push({ id, name, pass, detail }); console.log(`${pass === null ? 'NOT WALKED' : pass ? 'PASS' : 'FAIL'}  ${id} ${name}  ${JSON.stringify(detail)}`) }
const wait = ms => new Promise(r => setTimeout(r, ms))
const T = (cdp, type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints })

/* every pinned heading against the table's own, by its sort key: the worst sideways gap, in screen pixels, among the
   headings the screen shows; and the callsign heading's place and width against the table's */
const align = page => page.evaluate(() => {
  const bar = document.querySelector('[data-testid="qsticky-head"]'); if (!bar) return null
  const br = bar.getBoundingClientRect()
  let worst = 0, n = 0
  for (const th of bar.querySelectorAll('.qfixed-scroll th[data-sort]')) {
    const k = th.getAttribute('data-sort'); if (k === 'cs') continue
    const real = document.querySelector(`#qtbl thead th[data-sort="${k}"]`); if (!real) continue
    const a = th.getBoundingClientRect(), b = real.getBoundingClientRect()
    if (a.right < br.left + 120 || a.left > br.right) continue      /* off the pinned row's view, or under the callsign */
    worst = Math.max(worst, Math.abs(a.left - b.left)); n++
  }
  const cs = (bar.querySelector('.qfixed-frozen th[data-sort="cs"]') || bar.querySelector('.qfixed-scroll th[data-sort="cs"]'))?.getBoundingClientRect()
  const rcs = document.querySelector('#qtbl thead th[data-sort="cs"]')?.getBoundingClientRect()
  const frozen = bar.querySelector('.qfixed-frozen')?.getBoundingClientRect()
  return { worst: Math.round(worst * 10) / 10, n, browserFollow: !!bar.querySelector('.qfixed-anim'),
    csLeftGap: cs && rcs ? Math.round(Math.abs(cs.left - rcs.left) * 10) / 10 : null,
    frozenWidthGap: frozen && rcs ? Math.round(Math.abs(frozen.width - rcs.width) * 10) / 10 : null }
})
const wrapX = page => page.evaluate(() => { const w = document.querySelector('.qwrap'); return { x: Math.round(w.scrollLeft), max: w.scrollWidth - w.clientWidth } })

/* ================= PHONE ================= */
{
  const { browser, page, errors } = await open({ size: PHONE, who: 'a', tracker: false, touch: true })
  const cdp = await page.context().newCDPSession(page)
  await toPage(page, 'quals'); await page.waitForSelector('#qtbl td.qname'); await wait(400)
  /* Q1 — the row's first frame, with the table already scrolled sideways: read in the task that inserts it */
  await page.evaluate(() => { document.querySelector('.qwrap').scrollLeft = 400 })
  await page.evaluate(() => {
    const w = window; w.__qAt = null
    const mo = new MutationObserver(() => {
      const bar = document.querySelector('[data-testid="qsticky-head"]'); if (!bar) return
      mo.disconnect()
      const th = bar.querySelector('.qfixed-scroll th[data-sort="sxo"]') || bar.querySelectorAll('.qfixed-scroll th[data-sort]')[3]
      const k = th.getAttribute('data-sort'), real = document.querySelector(`#qtbl thead th[data-sort="${k}"]`)
      w.__qAt = { key: k, gap: Math.round(Math.abs(th.getBoundingClientRect().left - real.getBoundingClientRect().left) * 10) / 10 }
    })
    mo.observe(document.body, { childList: true, subtree: true })
  })
  await page.evaluate(() => window.scrollTo(0, 700)); await wait(500)
  const first = await page.evaluate(() => window.__qAt)
  note('Q1', 'phone: the pinned row is over the table from its first frame (the table scrolled 400 sideways)', !!first && first.gap < 2, first)
  /* Q2 — at every sideways place, set and by a finger */
  const out = []
  for (const x of [0, 150, 400, 9999]) { await page.evaluate(x => { document.querySelector('.qwrap').scrollLeft = x }, x); await wait(150); out.push({ at: (await wrapX(page)).x, ...(await align(page)) }) }
  const ok2 = out.every(o => o.browserFollow && o.n > 0 && o.worst < 2 && o.csLeftGap < 2 && o.frozenWidthGap < 2)
  note('Q2', 'phone: at every sideways place each pinned heading stands over its column, the callsign heading over its own', ok2, out)
  await shot(page, 'q2-phone-pinned-row-scrolled-sideways')
  { await page.evaluate(() => { document.querySelector('.qwrap').scrollLeft = 0 }); await wait(150)
    const r = await page.evaluate(() => { const w = document.querySelector('.qwrap').getBoundingClientRect(); return { x: w.left + w.width * 0.75, y: Math.min(w.bottom, innerHeight) - 160 } })
    await T(cdp, 'touchStart', [{ x: r.x, y: r.y, id: 1 }])
    for (let i = 1; i <= 12; i++) { await wait(16); await T(cdp, 'touchMove', [{ x: r.x - i * 20, y: r.y, id: 1 }]) }
    await wait(100); await T(cdp, 'touchEnd', []); await wait(300)
    const a = await align(page), p = await wrapX(page)
    await shot(page, 'q3-phone-after-finger-swipe')
    note('Q3', 'phone: after a finger swipes the table sideways the row is still over it', p.x > 120 && a.worst < 2 && a.csLeftGap < 2, { scrolled: p.x, ...a }) }
  /* Q4 — a press on a pinned heading sorts; a press on the pinned callsign heading too */
  { const before = await page.evaluate(() => [...document.querySelectorAll('#qtbl td.qname')].slice(0, 3).map(t => t.textContent.trim()).join(','))
    const cs = await page.evaluate(() => { const r = document.querySelector('[data-testid="qsticky-head"] .qfixed-frozen th[data-sort="cs"]')?.getBoundingClientRect(); return r ? { x: r.left + 20, y: r.top + r.height / 2 } : null })
    if (cs) { await T(cdp, 'touchStart', [{ x: cs.x, y: cs.y, id: 2 }]); await wait(60); await T(cdp, 'touchEnd', []); await wait(500) }
    const after = await page.evaluate(() => [...document.querySelectorAll('#qtbl td.qname')].slice(0, 3).map(t => t.textContent.trim()).join(','))
    note('Q4', 'phone: a tap on the pinned callsign heading sorts the table', !!cs && after !== before, { before, after }) }
  /* Q5 — a rotate: re-measured, still over the table */
  await page.setViewportSize({ width: PHONE.height, height: PHONE.width }); await wait(700)
  await page.evaluate(() => window.scrollTo(0, 500)); await wait(400)
  await page.evaluate(() => { document.querySelector('.qwrap').scrollLeft = 300 }); await wait(200)
  { const a = await align(page); await shot(page, 'q5-phone-on-its-side')
    note('Q5', 'a phone turned on its side: the row re-measured and over the table', !!a && a.worst < 2 && a.csLeftGap < 2 && a.frozenWidthGap < 2, a) }
  await page.setViewportSize(PHONE); await wait(700)
  /* Q6 — while editing (the headings carry their grips): still over the table */
  await page.evaluate(() => window.scrollTo(0, 0)); await wait(300)
  const ed = page.locator('.qbar button:has-text("Enable editing"), .qbar button:has-text("Edit")').first()
  if (await ed.count()) {
    await ed.click(); await wait(500)
    await page.evaluate(() => window.scrollTo(0, 700)); await wait(400)
    await page.evaluate(() => { document.querySelector('.qwrap').scrollLeft = 350 }); await wait(200)
    const a = await align(page); await shot(page, 'q6-phone-editing')
    note('Q6', 'phone, editing: the row is over the table', !!a && a.worst < 2 && a.csLeftGap < 2, a)
  } else note('Q6', 'phone, editing', null, 'no Enable editing button')
  note('E1', 'phone: no errors', errors.length === 0, errors.slice(0, 5))
  await browser.close()
}

/* ================= DESKTOP ================= */
{
  const { browser, page, errors } = await open({ size: { width: 1100, height: 800 }, who: 'a', tracker: false })
  await toPage(page, 'quals'); await page.waitForSelector('#qtbl td.qname'); await wait(400)
  await page.evaluate(() => window.scrollTo(0, 700)); await wait(400)
  const p = await wrapX(page)
  if (p.max > 50) await page.evaluate(() => { document.querySelector('.qwrap').scrollLeft = 200 })
  await wait(200)
  const a = await align(page); await shot(page, 'd1-desktop-pinned-row')
  note('D1', 'desktop 1100: the row is over the table', !!a && a.worst < 2 && a.csLeftGap < 2, { range: p.max, ...a })
  note('E2', 'desktop: no errors', errors.length === 0, errors.slice(0, 5))
  await browser.close()
}
save('quals', rows)
const f = rows.filter(r => r.pass === false).length, n = rows.filter(r => r.pass === null).length
console.log(`\n${rows.length - f - n} passed, ${f} failed, ${n} not walked`)
process.exit(f ? 1 : 0)
