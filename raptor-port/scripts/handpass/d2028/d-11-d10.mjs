/* d-11-d10 v1 — D10: the plain-user round on the ALL AVAIL window: each way to open and close it, from three pages, a press behind it.
   usage (from raptor-port/): node scripts/handpass/d2028/d-11-d10.mjs [pc|phone] */
const KIND = process.argv[2] || 'pc'
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/d10-' + KIND
console.log('d-10-d10 v1', KIND, process.env.HP_SHOTS)
const F = await import('./d-lib2.mjs')
const { D, X, L, sleep, j, SAT } = F
const w = await D.world(KIND)
const { page } = w
const P = KIND === 'phone' ? 'P' : 'D'
console.log('bundle', await D.bundle(page))
await F.buildD1(w, { logic: true })
const winUp = () => page.evaluate(() => { const e = document.querySelector('.win-one'); return !!(e && e.offsetWidth) })
const winText = () => page.evaluate(() => { const e = document.querySelector('.win-one'); return e && e.offsetWidth ? e.innerText.replace(/[\s\u00a0]+/g, ' ').trim().slice(0, 80) : null })
const res = {}
for (const surf of ['view', 'edit', 'board']) {
  const r = { surf }
  await D.toSurface(w, surf, SAT)
  const c = await D.chips(w, surf, SAT)
  r.chips = c.length
  const el = page.locator(D.chipScope(surf, SAT) + ' .oilcount:visible').first()
  // 1. open by the count, close by the window's own ✕
  const o1 = await D.openAA(w, surf, SAT, 0, `d10-${surf}-1-open`)
  r.open1 = { ok: o1.ok, title: o1.title, up: await winUp() }
  const xs = page.locator('.win-one button:visible, .win-bar button:visible')
  r.xButtons = await page.evaluate(() => [...document.querySelectorAll('.win-bar button, .win-one button')].filter(b => b.offsetWidth).map(b => (b.getAttribute('aria-label') || b.title || '') + '|' + b.innerText.trim()).join(' ; '))
  await D.closeAA(w)
  r.closedByX = !(await winUp())
  await D.shot(page, `d10-${surf}-2-after-x`)
  // 2. open again; Escape (desktop only)
  if (!w.phone) {
    const o2 = await D.openAA(w, surf, SAT, 0, `d10-${surf}-3-reopen`)
    r.open2 = { ok: o2.ok, up: await winUp() }
    await page.keyboard.press('Escape'); await sleep(600)
    r.closedByEsc = !(await winUp())
    await D.shot(page, `d10-${surf}-4-after-esc`)
    if (!r.closedByEsc) await D.closeAA(w)
  }
  // 3. open; press a puck on the page behind it; picture; what is up now
  const o3 = await D.openAA(w, surf, SAT, 0, `d10-${surf}-5-open-for-behind`)
  const pk = await page.evaluate(({ surf, di }) => {
    const sc = surf === 'view' ? `#vWeek .day[data-day="${di}"]` : surf === 'edit' ? `#eWeek .day[data-day="${di}"]` : '#schedBoard'
    const win = document.querySelector('.win-one')
    const wr = win ? win.getBoundingClientRect() : null
    const ps = [...document.querySelectorAll(sc + ' .puck[data-person]')].filter(e => e.offsetWidth && !e.closest('.win-one') && !e.closest('#sbRoster') && !e.closest('#eRoster'))
    const out = ps.map(e => { const b = e.getBoundingClientRect(); const cx = b.x + b.width / 2, cy = b.y + b.height / 2; const top = document.elementFromPoint(cx, cy); const covered = !!(top && win && win.contains(top)); return { who: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 12), x: cx, y: cy, inView: cy > 0 && cy < innerHeight && cx > 0 && cx < innerWidth, covered } })
    return out
  }, { surf, di: SAT })
  r.pucksBehind = pk.length
  const pick = pk.find(p => p.inView && !p.covered)
  if (pick) {
    const before = await page.evaluate(() => ({ sel: document.querySelectorAll('.puck.sel, .puck.picked, .puck.selected').length, win: !!(document.querySelector('.win-one') || {}).offsetWidth }))
    if (w.phone) { await page.touchscreen.tap(pick.x, pick.y); await sleep(60); await D.shot(page, `d10-${surf}-6-tap-behind`) } else await page.mouse.click(pick.x, pick.y)
    await sleep(800)
    r.behind = { puck: pick.who, before, afterWinUp: await winUp(), winText: await winText(), selected: await page.evaluate(() => document.querySelectorAll('.puck.sel, .puck.picked, .puck.selected').length), freshWins: await page.evaluate(() => [...document.querySelectorAll('[class*="win-"]')].filter(e => e.offsetWidth && /win-(bar|one|body)$/.test(e.className)).map(e => e.className).join(',') ) }
    await D.shot(page, `d10-${surf}-7-after-behind`)
  } else { r.behind = { note: 'NOT DONE: no puck on the page that is in view and not under the window (of ' + pk.length + ')', pk: pk.slice(0, 5) } }
  if (await winUp()) await D.closeAA(w)
  // anything left behind
  r.leftUp = await winUp()
  res[surf] = r
  console.log('D10', surf, j(r))
}
D.row(`D10-${P}`, 'RECORD', j(res))
D.finish(w, 'd10-' + KIND)
await w.browser.close()
