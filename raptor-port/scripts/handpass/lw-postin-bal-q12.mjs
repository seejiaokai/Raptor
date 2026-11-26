// Chat 200 — question 12 with HIS numbers (26 Nov 26): 25 days, 1 day taken on Wed 2 Dec, the official leave app shows
// 24, posted in Mon 7 Dec. Two new men, both posted in Mon 7 Dec, admin at his PC's size, today Thu 26 Nov 26:
//   Lynx    — the 2 Dec leave put on FIRST, then 24 typed      (expected today: 24)
//   Pelican — 24 typed FIRST, then the 2 Dec leave put on      (expected today: 23 — the day counted twice)
// Serves nothing: points at the build already served on PORT.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-11-26-lw-postin-balance/q12'
process.env.LW_TODAY ||= '2026-11-26'
process.env.PORT ||= '4757'
const L = await import('./lw-m4-lib.mjs')
const { T, press, vis, shot } = L
console.log('[lw-postin-bal-q12 v1]')
L.clearOut()
const w = await L.newCtx('desk'); const P = w.page
const log = (...a) => console.log(...a)

const pidOf = cs => P.evaluate(cs => {
  for (const e of document.querySelectorAll('[data-testid^="bal-name-"]')) if (e.textContent.trim().startsWith(cs)) return e.dataset.testid.slice(9)
  return null
}, cs)
const balRow = pid => P.evaluate(pid => {
  const v = id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.replace(/\s+/g, ' ').trim()) : null }
  return { app: v(`bal-LVE-${pid}`), cf: v(`bal-cf-${pid}`), war: v(`bal-war-${pid}`) }
}, pid)
async function openBalances() { await press(w, T('lw-tab-balances')); await P.waitForSelector(T('balances-page'), { state: 'visible', timeout: 10000 }); await P.waitForTimeout(500) }
async function openGrid() { await press(w, T('lw-tab-grid')); await P.waitForTimeout(700) }
async function rowShot(pid, name) {
  const row = P.locator(T(`bal-row-${pid}`)); await row.scrollIntoViewIfNeeded(); await P.waitForTimeout(250)
  const b = await row.boundingBox()
  await P.screenshot({ path: `${L.OUT}/${name}.png`, clip: { x: 0, y: Math.max(0, b.y - 70), width: 1100, height: b.height + 110 } })
}
async function typeBox(sel, fig) {
  await press(w, sel); await P.waitForTimeout(150)
  await P.keyboard.press('Control+A'); await P.keyboard.type(String(fig), { delay: 30 }); await P.keyboard.press('Enter'); await P.waitForTimeout(500)
}
async function placeLL(pid, iso) {
  await L.openCell(w, pid, iso)
  await P.waitForSelector(`${T('postin-place')}, ${T('bid-picker')}`, { state: 'visible', timeout: 8000 }).catch(() => null)
  if (await vis(P, T('postin-place'))) { await press(w, T('postin-place')); await P.waitForTimeout(500) }
  await L.approveWhatIEnter(w, true)
  const ok = await L.placeLeave(w, 'LL'); await P.waitForTimeout(500)
  log(`   LL on ${iso} placed: ${ok}`)
}
async function addMan(cs, ini) {
  await P.evaluate(() => window.go('admin')); await P.waitForTimeout(800)
  await P.locator('#accAddBlock').scrollIntoViewIfNeeded()
  await P.fill('#accAddCs', cs); await P.fill('#accAddIni', ini)
  await P.selectOption('#accAddSeat', 'FCP'); await P.selectOption('#accAddCat', 'OCU')
  await P.click('#accAddPostIn'); await P.waitForTimeout(400)
  for (let i = 0; i < 3 && !(await P.locator('[data-iso="2026-12-07"]').count()); i++) { await P.locator('[data-testid$="-next"]').first().click(); await P.waitForTimeout(250) }
  await P.locator('[data-iso="2026-12-07"]').first().click(); await P.waitForTimeout(400)
  await P.click('#accAdd'); await P.waitForTimeout(800)
}

try {
  await L.signIn(w, 'admin')
  await addMan('Lynx', 'LX'); await addMan('Pelican', 'PN')
  await L.openWar(w, 'admin'); await openBalances()
  const lynx = await pidOf('Lynx'), pel = await pidOf('Pelican'); log('ids', lynx, pel)

  /* Lynx: the 2 Dec leave first, then 24 typed (0 carried forward) */
  await openGrid(); await placeLL(lynx, '2026-12-02')
  await openBalances(); log('Lynx, leave on, nothing typed:', JSON.stringify(await balRow(lynx)))
  await typeBox(T(`bal-LVE-${lynx}`), 24)
  log('Lynx, then 24 typed:', JSON.stringify(await balRow(lynx)))
  await rowShot(lynx, 'a-lynx-leave-first-then-24')

  /* Pelican: 24 typed first, then the 2 Dec leave */
  await typeBox(T(`bal-LVE-${pel}`), 24)
  log('Pelican, 24 typed:', JSON.stringify(await balRow(pel)))
  await rowShot(pel, 'b1-pelican-24-typed')
  await openGrid(); await placeLL(pel, '2026-12-02')
  await openBalances(); log('Pelican, then the leave:', JSON.stringify(await balRow(pel)))
  await rowShot(pel, 'b2-pelican-then-leave')

  /* both rows and the grid, for the card */
  await openGrid(); await L.reachCell(w, pel, '2026-12-02')
  await P.locator(T(`row-${pel}`)).first().scrollIntoViewIfNeeded(); await P.mouse.move(5, 845); await P.waitForTimeout(400)
  await shot(w, 'c-grid-full')
  log('errors:', w.errs.length ? w.errs.join(' | ') : 'none')
} catch (e) {
  console.log('STOPPED:', e.message); await shot(w, 'zz-stopped')
} finally { await L.closeBrowser() }
