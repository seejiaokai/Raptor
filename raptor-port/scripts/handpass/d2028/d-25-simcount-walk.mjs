/* d-25-simcount-walk v1 — [SIM-COUNT-OVER-SEAT], the host's walk of the fix: the count beside ALL / ALL AVAIL in every
   seat a sim row has. Each variant is seeded the way e2e/availwin.spec.ts seeds its rows (the route through the app's
   own controls is d-23's), then on the board every count is measured — what stands at its centre, its box against every
   other seat of the pair grid and every other cell of the row — and PRESSED: the window must open, nothing arm.
   usage (from raptor-port/): node scripts/handpass/d2028/d-25-simcount-walk.mjs pc|phone */
const KIND = process.argv[2] || 'pc'
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/simcount/walk-' + KIND
const { mkdirSync } = await import('node:fs'); mkdirSync(process.env.HP_SHOTS, { recursive: true })
console.log('d-25 v1', KIND)
const D = await import('./d-lib.mjs')
const { sleep, j, FRI } = D
const w = await D.world(KIND)
const { page } = w
console.log('bundle', await D.bundle(page), '· placeholders', await page.evaluate(() => Object.keys(window.PEOPLE).filter(k => /^all/i.test(k))))
const A = 'allavail', M = w.ID('Ranger'), N = w.ID('Piston')
await D.L.go(page, 'editsched'); await sleep(400)
const VARIANTS = [
  ['v1 front ALL AVAIL, rear empty', { oft: [{ label: 'OFT BRIEF', str: '09:00', end: '10:00', p: A, w: '' }] }],
  ['v2 front ALL AVAIL, a man in the rear', { oft: [{ label: 'OFT BRIEF', str: '09:00', end: '10:00', p: A, w: M }] }],
  ['v3 rear ALL AVAIL, front empty', { oft: [{ label: 'OFT BRIEF', str: '09:00', end: '10:00', p: '', w: A }] }],
  ['v4 a man in front, rear ALL AVAIL', { oft: [{ label: 'OFT BRIEF', str: '09:00', end: '10:00', p: M, w: A }] }],
  ['v5 ALL AVAIL in both seats', { oft: [{ label: 'OFT BRIEF', str: '09:00', end: '10:00', p: A, w: A }] }],
  ['v6 two men, ALL AVAIL as the extra', { oft: [{ label: 'OFT BRIEF', str: '09:00', end: '10:00', p: M, w: N, more: [A] }] }],
  ['v7 front ALL (everyone), rear empty', { oft: [{ label: 'OFT BRIEF', str: '09:00', end: '10:00', p: 'all', w: '' }] }],
  ['v8 the AMT box: ALL AVAIL, a man, ALL AVAIL', { amt: [{ label: 'BOX', str: '09:00', end: '10:00', pax: [A, M, A] }] }],
]
const closeWin = async () => { for (let k = 0; k < 2 && await page.locator('.availwin:not([hidden])').count(); k++) { const x = page.locator('.availwin:not([hidden]) .wx, .availwin:not([hidden]) [aria-label*="lose" i]').first(); if (await x.count()) { if (w.phone) await x.tap(); else await x.click() } else await page.keyboard.press('Escape'); await sleep(400) } }
let bad = 0
for (const [name, sims] of VARIANTS) {
  const ok = await page.evaluate(([di, s]) => { const W = window; for (const id of [].concat(...Object.values(s).map(rows => rows.flatMap(r => [r.p, r.w, ...(r.more || []), ...(r.pax || [])])))) if (id && !W.PEOPLE[id]) return 'no such person: ' + id
    W.DAYS[di].sims.oft = s.oft || []; if (s.amt) W.DAYS[di].sims.amt = s.amt; W.afterSchedMutate(); W.openScheduler(di); return 'ok' }, [FRI, sims])
  if (ok !== 'ok') { console.log('SKIP', name, ok); continue }
  await sleep(600)
  const n = await page.locator('#schedBoard .ppl.fcprcp .oilcount').count()
  if (n) await page.locator('#schedBoard .ppl.fcprcp .oilcount').first().evaluate(e => e.scrollIntoView({ block: 'center' }))
  await sleep(250)
  await D.shot(page, name.slice(0, 2) + '-board')
  const facts = await page.evaluate(() => {
    const hit = (a, b) => Math.round(Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)))
    return [...document.querySelectorAll('#schedBoard .ppl.fcprcp .oilcount')].filter(c => c.offsetWidth).map(chip => {
      const c = chip.getBoundingClientRect(), at = document.elementFromPoint(c.x + c.width / 2, c.y + c.height / 2)
      const seat = chip.closest('.seat'), grid = seat.parentElement, rowEl = grid.parentElement
      const seats = [...grid.children].filter(k => k !== seat && k.offsetWidth).map(k => hit(c, k.getBoundingClientRect()))
      const cells = [...rowEl.children].filter(k => k !== grid && k.offsetWidth).map(k => hit(c, k.getBoundingClientRect()))
      const inRow = c.left >= rowEl.getBoundingClientRect().left - 1 && c.right <= rowEl.getBoundingClientRect().right + 1
      return { txt: chip.textContent, slot: seat.getAttribute('data-slot'), own: at === chip || chip.contains(at), overSeats: Math.max(0, ...seats), overCells: Math.max(0, ...cells), inRow, size: [Math.round(c.width), Math.round(c.height)], cols: getComputedStyle(grid).gridTemplateColumns }
    })
  })
  const presses = []
  for (let i = 0; i < facts.length; i++) {
    const chip = page.locator('#schedBoard .ppl.fcprcp .oilcount').nth(i)
    const b = await chip.boundingBox()
    if (w.phone) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
    await sleep(700)
    const up = await page.locator('.availwin:not([hidden])').count() > 0, armed = await page.evaluate(() => (window.ARM && window.ARM.key) || null)
    presses.push({ up, armed })
    if (i === 0) await D.shot(page, name.slice(0, 2) + '-pressed')
    await closeWin()
    if (armed) { await page.keyboard.press('Escape'); await sleep(300) }
    if (!(await page.locator('#schedBoard:not([hidden])').count())) { await page.evaluate(di => window.openScheduler(di), FRI); await sleep(500) }
  }
  const good = facts.length > 0 && facts.every(f => f.own && !f.overSeats && !f.overCells && f.inRow) && presses.every(p => p.up && !p.armed)
  if (!good) bad++
  console.log(good ? 'OK   ' : 'CHECK', name, j({ facts, presses }))
}
console.log('WALK', KIND, bad ? bad + ' to check' : 'all as expected')
await w.browser.close()
