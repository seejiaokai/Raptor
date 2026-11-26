// Chat 200 — his follow-up (26 Nov 26): the same numbers, but everything after he posts in. 25 days, a 1-day leave on
// Wed 2 Dec, the official leave app shows 24 once that leave is applied. Three new men, all posted in Fri 27 Nov, admin
// at his PC's size, today Thu 26 Nov 26:
//   Lynx      — 25 typed on arrival; the 2 Dec leave bid on the Leave War and approved; later 24 typed from the app
//               (expected: 24, then still 24 — the Leave War route never counts twice)
//   Pelican   — the 2 Dec leave, approved at his old squadron, put on first, then 24 typed     (expected 24)
//   Kittyhawk — 24 typed first, then that same leave put on                                     (expected 23)
process.env.LW_OUT ||= '../../docs/img/handpass/2026-11-26-lw-postin-balance/q12b'
process.env.LW_TODAY ||= '2026-11-26'
process.env.PORT ||= '4757'
const L = await import('./lw-m4-lib.mjs')
const { T, press, vis, shot } = L
console.log('[lw-postin-bal-q12b v1]')
L.clearOut()
const w = await L.newCtx('desk'); const P = w.page
const log = (...a) => console.log(...a)

const pidOf = cs => P.evaluate(cs => {
  for (const e of document.querySelectorAll('[data-testid^="bal-name-"]')) if (e.textContent.trim().startsWith(cs)) return e.dataset.testid.slice(9)
  return null
}, cs)
const balRow = pid => P.evaluate(pid => {
  const v = id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.replace(/\s+/g, ' ').trim()) : null }
  return { app: v(`bal-LVE-${pid}`), pend: v(`bal-pend-${pid}`), war: v(`bal-war-${pid}`) }
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
/* a leave on the day: Auto-approve on places it approved; off places a pending bid */
async function placeLL(pid, iso, approved) {
  await L.openCell(w, pid, iso)
  await P.waitForSelector(`${T('postin-place')}, ${T('bid-picker')}`, { state: 'visible', timeout: 8000 }).catch(() => null)
  if (await vis(P, T('postin-place'))) { await press(w, T('postin-place')); await P.waitForTimeout(500) }
  await L.approveWhatIEnter(w, approved)
  const ok = await L.placeLeave(w, 'LL'); await P.waitForTimeout(500)
  log(`   LL on ${iso} placed (${approved ? 'approved' : 'pending'}): ${ok}`)
}
async function approveOn(pid, iso) {
  await L.openCell(w, pid, iso)
  await P.waitForSelector(T('bid-picker'), { state: 'visible', timeout: 8000 })
  await press(w, T('decide-approve')); await P.waitForTimeout(500)
  await L.closeWin(w)
}
async function addMan(cs, ini) {
  await P.evaluate(() => window.go('admin')); await P.waitForTimeout(800)
  await P.locator('#accAddBlock').scrollIntoViewIfNeeded()
  await P.fill('#accAddCs', cs); await P.fill('#accAddIni', ini)
  await P.selectOption('#accAddSeat', 'FCP'); await P.selectOption('#accAddCat', 'OCU')
  await P.click('#accAddPostIn'); await P.waitForTimeout(400)
  await P.locator('[data-iso="2026-11-27"]').first().click(); await P.waitForTimeout(400)
  await P.click('#accAdd'); await P.waitForTimeout(800)
}

try {
  await L.signIn(w, 'admin')
  await addMan('Lynx', 'LX'); await addMan('Pelican', 'PN'); await addMan('Kittyhawk', 'KH')
  await L.openWar(w, 'admin'); await openBalances()
  const lynx = await pidOf('Lynx'), pel = await pidOf('Pelican'), kit = await pidOf('Kittyhawk'); log('ids', lynx, pel, kit)

  /* Lynx — the Leave War route */
  await typeBox(T(`bal-LVE-${lynx}`), 25); log('Lynx, 25 typed on arrival:', JSON.stringify(await balRow(lynx)))
  await rowShot(lynx, 'a1-lynx-25-typed')
  await openGrid(); await placeLL(lynx, '2026-12-02', false)
  await openBalances(); log('Lynx, bid pending:', JSON.stringify(await balRow(lynx)))
  await rowShot(lynx, 'a2-lynx-bid-pending')
  await openGrid(); await approveOn(lynx, '2026-12-02')
  await openBalances(); log('Lynx, bid approved:', JSON.stringify(await balRow(lynx)))
  await rowShot(lynx, 'a3-lynx-approved')
  await typeBox(T(`bal-LVE-${lynx}`), 24); log('Lynx, later 24 typed from the official app:', JSON.stringify(await balRow(lynx)))
  await rowShot(lynx, 'a4-lynx-24-typed-later')

  /* Pelican — leave approved elsewhere put on first, then 24 typed */
  await openGrid(); await placeLL(pel, '2026-12-02', true)
  await openBalances(); await typeBox(T(`bal-LVE-${pel}`), 24); log('Pelican, leave first then 24:', JSON.stringify(await balRow(pel)))
  await rowShot(pel, 'b-pelican-leave-first-then-24')

  /* Kittyhawk — 24 typed first, then the leave */
  await typeBox(T(`bal-LVE-${kit}`), 24); log('Kittyhawk, 24 typed:', JSON.stringify(await balRow(kit)))
  await rowShot(kit, 'c1-kittyhawk-24-typed')
  await openGrid(); await placeLL(kit, '2026-12-02', true)
  await openBalances(); log('Kittyhawk, then the leave:', JSON.stringify(await balRow(kit)))
  await rowShot(kit, 'c2-kittyhawk-then-leave')

  await openGrid(); await L.reachCell(w, kit, '2026-12-02')
  await P.locator(T(`row-${kit}`)).first().scrollIntoViewIfNeeded(); await P.mouse.move(5, 845); await P.waitForTimeout(400)
  await shot(w, 'd-grid-full')
  log('errors:', w.errs.length ? w.errs.join(' | ') : 'none')
} catch (e) {
  console.log('STOPPED:', e.message); await shot(w, 'zz-stopped')
} finally { await L.closeBrowser() }
