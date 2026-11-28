// Chat 200 — the leave balance of a man posted in from outside the app: how it is counted TODAY, pressed on the
// running app for his questions page. Admin (Saber), desktop 1536 x 860 at 1.25 (his PC). Today pinned to Thu 26 Nov 26.
// Lynx is added on Admin → Users, posted in Mon 7 Dec; then, on the Leave War:
//   1 his balance before anyone types it          2 his old squadron's leave (Mon 14 Dec) entered first
//   3 his official balance typed (25, 5 carried)  4 more of that old leave (Mon 21 Dec) entered AFTER the typing
//   5 the figure typed again                      6 a leave on a day before his post-in (Wed 2 Dec)
// Serves nothing: points at the build already served on PORT.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-11-26-lw-postin-balance'
process.env.LW_TODAY ||= '2026-11-26'
process.env.PORT ||= '4757'
const L = await import('./lw-m4-lib.mjs')
const { T, press, vis, shot } = L
console.log('[lw-postin-bal-walk v1]')
L.clearOut()
const w = await L.newCtx('desk'); const P = w.page
const log = (...a) => console.log(...a)

const pidOf = cs => P.evaluate(cs => {
  for (const e of document.querySelectorAll('[data-testid^="bal-name-"]')) if (e.textContent.trim().startsWith(cs)) return e.dataset.testid.slice(9)
  for (const e of document.querySelectorAll('[data-testid^="row-"]')) if (e.textContent.includes(cs)) return e.dataset.testid.slice(4)
  return null
}, cs)
const balRow = pid => P.evaluate(pid => {
  const v = id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.replace(/\s+/g, ' ').trim()) : null }
  return { app: v(`bal-LVE-${pid}`), cf: v(`bal-cf-${pid}`), pend: v(`bal-pend-${pid}`), war: v(`bal-war-${pid}`), grade: v(`bal-grade-${pid}`) }
}, pid)
async function openBalances() { await press(w, T('lw-tab-balances')); await P.waitForSelector(T('balances-page'), { state: 'visible', timeout: 10000 }); await P.waitForTimeout(500) }
async function openGrid() { await press(w, T('lw-tab-grid')); await P.waitForTimeout(700) }
async function rowShot(pid, name) {
  const row = P.locator(T(`bal-row-${pid}`)); await row.scrollIntoViewIfNeeded(); await P.waitForTimeout(250)
  const b = await row.boundingBox()
  const head = await P.locator('.bp-head, .bp-table thead, [data-testid="bal-head"]').first().boundingBox().catch(() => null)
  await shot(w, name + '-page')
  await P.screenshot({ path: `${L.OUT}/${name}.png`, clip: { x: 0, y: Math.max(0, b.y - 70), width: 1100, height: b.height + 110 } })
  if (head) log('   heading at', Math.round(head.y))
}
async function typeBox(sel, fig) {
  await press(w, sel); await P.waitForTimeout(150)
  await P.keyboard.press('Control+A'); await P.keyboard.type(String(fig), { delay: 30 }); await P.keyboard.press('Enter'); await P.waitForTimeout(500)
}
async function placeLL(pid, iso, name) {
  await L.openCell(w, pid, iso)
  await P.waitForSelector(`${T('postin-place')}, ${T('bid-picker')}`, { state: 'visible', timeout: 8000 }).catch(() => null)
  if (await vis(P, T('postin-place'))) { await shot(w, name + '-a-posting-sheet'); await press(w, T('postin-place')); await P.waitForTimeout(500) }
  await L.approveWhatIEnter(w, true)
  await shot(w, name + '-b-window')
  const ok = await L.placeLeave(w, 'LL')
  await P.waitForTimeout(500)
  log(`   LL on ${iso} placed: ${ok}`)
}
async function gridShot(pid, iso, name) {
  await L.reachCell(w, pid, iso)
  const row = P.locator(T(`row-${pid}`)).first(); await row.scrollIntoViewIfNeeded(); await P.waitForTimeout(300)
  const b = await row.boundingBox()
  await P.screenshot({ path: `${L.OUT}/${name}.png`, clip: { x: 0, y: Math.max(0, b.y - 120), width: 1536, height: b.height + 170 } })
}

try {
  await L.signIn(w, 'admin')
  /* ---- 0: add Lynx on Admin → Users, posted in Mon 7 Dec */
  await P.evaluate(() => window.go('admin')); await P.waitForTimeout(800)
  const users = P.locator('button:has-text("Users"), [data-testid="adm-tab-users"]').first()
  if (await users.count()) { await users.click(); await P.waitForTimeout(500) }
  await P.locator('#accAddBlock').scrollIntoViewIfNeeded()
  await P.fill('#accAddCs', 'Lynx'); await P.fill('#accAddIni', 'LX')
  await P.selectOption('#accAddSeat', 'FCP'); await P.selectOption('#accAddCat', 'OCU')
  await P.click('#accAddPostIn'); await P.waitForTimeout(400)
  for (let i = 0; i < 3 && !(await P.locator('[data-iso="2026-12-07"]').count()); i++) { await P.locator('[data-testid$="-next"]').first().click(); await P.waitForTimeout(250) }
  await P.locator('[data-iso="2026-12-07"]').first().click(); await P.waitForTimeout(400)
  await P.locator('#accAddBlock').screenshot({ path: `${L.OUT}/00-add-kestrel.png` })
  await P.click('#accAdd'); await P.waitForTimeout(800)
  log('after add, page says:', (await P.locator('body').innerText()).match(/Lynx[^\n]*/g)?.slice(0, 4))
  await shot(w, '00b-after-add')

  /* ---- 1: his balance before anyone types it */
  await L.openWar(w, 'admin')
  await openBalances()
  const pid = await pidOf('Lynx'); log('Lynx id:', pid)
  if (!pid) log('names on Balances:', await P.evaluate(() => [...document.querySelectorAll('[data-testid^="bal-name-"]')].map(e => e.dataset.testid + '=' + e.textContent.trim()).join(', ')))
  log('1 never typed:', JSON.stringify(await balRow(pid)))
  await rowShot(pid, '01-balances-never-typed')
  await press(w, T(`bal-name-${pid}`)); await P.waitForTimeout(600)
  if (await vis(P, T('person-window'))) {
    await P.locator(T('person-window')).screenshot({ path: `${L.OUT}/01b-person-window-never-typed.png` })
    /* MOCK-UP ONLY (question 10's recommendation, drawn on the real window — nothing saved): the figure boxes empty with
       "No grade"'s dashed amber edge, War bal reading "Not typed" in its amber */
    await P.evaluate(() => {
      const pw = document.querySelector('[data-testid="person-window"]')
      for (const id of ['pw-LVE', 'pw-LVE-cf']) { const b = pw.querySelector(`[data-testid="${id}"]`); if (b) { b.value = ''; b.style.border = '1px dashed rgba(242,200,121,.8)' } }
      const war = pw.querySelector('[data-testid="pw-LVE-war"]'); if (war) { war.textContent = 'Not typed'; war.style.color = '#F2C879'; war.style.fontSize = '15px'; war.style.whiteSpace = 'nowrap' }
    })
    await P.locator(T('person-window')).screenshot({ path: `${L.OUT}/01m-MOCK-person-window-not-typed.png` })
    await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  }
  await P.evaluate(pid => {
    const row = document.querySelector(`[data-testid="bal-row-${pid}"]`)
    for (const id of [`bal-LVE-${pid}`, `bal-cf-${pid}`]) { const b = row.querySelector(`[data-testid="${id}"]`); if (b) { b.value = ''; b.style.border = '1px dashed rgba(242,200,121,.8)' } }
    const war = row.querySelector(`[data-testid="bal-war-${pid}"]`); if (war) { war.textContent = 'Not typed'; war.style.color = '#F2C879'; war.style.whiteSpace = 'nowrap' }
  }, pid)
  await rowShot(pid, '01m-MOCK-balances-not-typed')
  /* put the page back as it was drawn (the mock touched only what is on screen) */
  await openGrid(); await openBalances()

  /* ---- 2: his old squadron's leave, Mon 14 Dec, entered BEFORE the typing */
  await openGrid()
  await gridShot(pid, '2026-12-07', '02a-grid-before')
  await placeLL(pid, '2026-12-14', '02')
  await gridShot(pid, '2026-12-14', '02c-grid-after-leave')
  await openBalances(); log('2 leave first, nothing typed:', JSON.stringify(await balRow(pid)))
  await rowShot(pid, '02d-balances-leave-first')

  /* ---- 3: his official balance typed — 25, 5 of it carried forward */
  await typeBox(T(`bal-LVE-${pid}`), 25)
  await typeBox(T(`bal-cf-${pid}`), 5)
  log('3 typed 25 incl 5:', JSON.stringify(await balRow(pid)))
  await rowShot(pid, '03-balances-typed-25')

  /* ---- 4: more of that old leave, Mon 21 Dec, entered AFTER the typing */
  await openGrid()
  await placeLL(pid, '2026-12-21', '04')
  await openBalances(); log('4 leave after typing:', JSON.stringify(await balRow(pid)))
  await rowShot(pid, '04-balances-leave-after-typing')

  /* ---- 5: the figure typed again from the official app */
  await typeBox(T(`bal-LVE-${pid}`), 25)
  log('5 typed again 25:', JSON.stringify(await balRow(pid)))
  await rowShot(pid, '05-balances-typed-again')

  /* ---- 6: a leave on a day before his post-in, Wed 2 Dec */
  await openGrid()
  await placeLL(pid, '2026-12-02', '06')
  await gridShot(pid, '2026-12-02', '06c-grid-before-postin')
  /* the whole screen, the dates row pinned at its top, Lynx's row in view — for the marked picture */
  await P.mouse.move(5, 845); await P.waitForTimeout(300)
  await shot(w, '07-grid-full')
  await openBalances(); log('6 leave before post-in:', JSON.stringify(await balRow(pid)))
  await rowShot(pid, '06d-balances-before-postin')

  log('errors:', w.errs.length ? w.errs.join(' | ') : 'none')
} catch (e) {
  console.log('STOPPED:', e.message); await shot(w, 'zz-stopped')
} finally { await L.closeBrowser() }
