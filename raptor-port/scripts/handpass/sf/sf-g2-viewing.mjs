/* G3.2 — [ABSENCE-SMALL-SEEN] 2: the Leave War's "VIEWING AS" chip is cut off at 390px (the re-test's W6 N6). Walked as
   the admin and as a member at 390 and 360 wide: the words "VIEWING AS" are never cut, the chip never runs past the
   screen's edge, and the callsign shows whole or ends in "…" — never sliced mid-letter by the screen edge.
   Usage: node sf-g2-viewing.mjs [outdir-suffix] */
const OUT = 'g2-viewing' + (process.argv[2] ? '-' + process.argv[2] : '')
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= new URL(`../../../docs/img/handpass/2026-09-28-small-fixes/${OUT}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const L = await import('./sf-lib.mjs')
const { open, go, check, note, summary } = L

const measure = page => page.evaluate(() => {
  const c = [...document.querySelectorAll('[data-testid="lw-viewing"]')].find(x => x.offsetWidth)
  if (!c) return null
  const r = c.getBoundingClientRect(), lab = c.querySelector('.vlab'), who = c.querySelector('.vwho')
  const lr = lab.getBoundingClientRect(), wr = who.getBoundingClientRect()
  const cs = getComputedStyle(who)
  return {
    vw: innerWidth, docW: document.documentElement.scrollWidth,
    chip: [r.left, r.right].map(Math.round), lab: [lr.left, lr.right].map(Math.round), who: [wr.left, wr.right].map(Math.round),
    labCut: lab.scrollWidth > lab.clientWidth + 1 || lr.right > r.right + 0.5,
    whoText: who.textContent, whoCut: who.scrollWidth > who.clientWidth + 1, whoEllipsis: cs.textOverflow === 'ellipsis' && cs.overflow !== 'visible',
    chipPastEdge: r.right > innerWidth + 0.5, whoPastChip: wr.right > r.right + 0.5,
  }
})

for (const [who, label] of [['a', 'admin'], ['m', 'member']]) {
  for (const width of [390, 360]) {
    const { browser, page, errors } = await open({ width, height: 800, who })
    await go(page, 'leavewar')
    await page.waitForSelector('[data-testid="lw-viewing"]', { state: 'attached' })
    await page.waitForTimeout(600)
    const m = await measure(page)
    note(`${label} ${width}`, JSON.stringify(m))
    /* the picture from the page's top — taken before anything scrolls, or the row's first line hides under the
       app's own sticky bar and the picture lies about what is there */
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(150)
    await page.screenshot({ path: `${process.env.HP_SHOTS}/g2-${label}-${width}-top.png`, clip: { x: 0, y: 0, width, height: 220 } })
    const first = await page.evaluate(() => [...document.querySelectorAll('#page-leavewar .topbar .spring > *')].filter(k => k.offsetWidth).map(k => Math.round(k.getBoundingClientRect().top)))
    check(`G2f ${label} ${width}: the row's other controls sit above the chip, none lost`, first.length >= 3 && Math.min(...first.slice(0, -1)) < first[first.length - 1], JSON.stringify(first))
    check(`G2a ${label} ${width}: the chip is on the page`, !!m, '')
    if (m) {
      check(`G2b ${label} ${width}: the chip stays inside the screen`, !m.chipPastEdge, JSON.stringify(m.chip) + ' vw ' + m.vw)
      check(`G2c ${label} ${width}: "VIEWING AS" is never cut`, !m.labCut, JSON.stringify(m.lab))
      check(`G2d ${label} ${width}: the callsign shows whole or ends in "…", never sliced by the edge`, !m.whoPastChip && (!m.whoCut || m.whoEllipsis), JSON.stringify(m))
      check(`G2e ${label} ${width}: the page does not scroll sideways`, m.docW <= m.vw, `${m.docW} > ${m.vw}`)
    }
    check(`${label} ${width}: no console errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
    await browser.close()
  }
}
/* THE CONTROL — a tablet and a desktop keep the one line they had: the chip beside the picker, not under it */
for (const width of [768, 1440]) {
  const { browser, page } = await open({ width, height: 900, who: 'a' })
  await go(page, 'leavewar'); await page.waitForTimeout(600)
  const tops = await page.evaluate(() => [...document.querySelectorAll('#page-leavewar .topbar .spring > *')].filter(k => k.offsetWidth).map(k => [String(k.className).split(' ')[0], Math.round(k.getBoundingClientRect().top + k.getBoundingClientRect().height / 2)]))
  const mid = tops.map(t => t[1])
  check(`G2g ${width}: one line, as before`, Math.max(...mid) - Math.min(...mid) <= 4, JSON.stringify(tops))
  await page.screenshot({ path: `${process.env.HP_SHOTS}/g2-admin-${width}-top.png`, clip: { x: 0, y: 0, width, height: 160 } })
  await browser.close()
}
process.exitCode = summary('sf-g2-viewing') ? 1 : 0
