// HIS QUESTION ON THE FO / HO DRAWING (26 Oct 26, morning — "any better idea or put the am pm above the days row"): two
// ways drawn on the real app (the built bundle on LW_PORT), an iPhone's size, 3x; nothing built. Each is one transform;
// the changed area dashed yellow.
//   E  his: the Give row (FO · a day / HO · half a day), then AM / PM straight under it, then Days and the button
//   G  after his D1391 (the half does not matter): FO · a day / HO · half a day, no AM / PM row, Days for an FO only
//   F  the agent's: no new row — Grant OIL follows the window's own Duration at its top (Whole day · AM · PM), which
//      a leave already uses: Whole day gives an FO (Days for more than one), AM or PM gives an HO in that half; the
//      button says which ("Give FO", "Give HO · morning")
// Usage (from raptor-port/, the build served on LW_PORT): node scripts/handpass/lw-m3n-draw-ho.mjs
process.env.LW_PORT ||= '4190'
process.env.LW_OUT ||= '2026-10-26-lw-m3-night/draw'
const H = await import('./lw-m3b-w2-lib.mjs')
const { L, T, note } = H
const RING = 'outline:2px dashed #FFD23F;outline-offset:2px'
const desk = await H.deskFrom(undefined, 2); await L.signInPlain(desk, 'admin', '2026-07-13')
const w = await H.phoneFrom(await desk.ctx.storageState()); await L.signInPlain(w, 'admin', '2026-07-13')
const P = w.page
await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(900)
const saber = await H.idOf(P, 'Saber'), iso = '2026-11-16'
async function grantPanel() {
  await L.openCellR(w, saber, iso); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  await L.press(w, T('bid-oil')); await P.waitForTimeout(400)
}
async function close() { await P.keyboard.press('Escape').catch(() => {}); await P.waitForTimeout(400) }

/* ---------- E: his order — Give, then AM / PM, then Days ---------- */
await grantPanel()
await P.locator(T('oil-days')).fill('0.5'); await P.waitForTimeout(300)   // the app's own Half row comes for half a day
const okE = await P.evaluate(ring => {
  const daysRow = document.querySelector('[data-testid="oil-days"]')?.closest('.bidsheet-row')
  const halfRow = document.querySelector('[data-testid="oil-half-am"]')?.closest('.bidsheet-row')
  const chipSrc = document.querySelector('[data-testid="portion-am"]')
  if (!daysRow || !halfRow || !chipSrc) return false
  const give = daysRow.cloneNode(false); give.id = 'dr-fh'
  const lab = document.createElement('span'); lab.className = 'lab'; lab.textContent = 'Give'; give.appendChild(lab)
  for (const [t, on] of [['FO · a day', false], ['HO · half a day', true]]) { const c = chipSrc.cloneNode(false); c.removeAttribute('data-testid'); c.textContent = t; c.className = 'pchip' + (on ? ' on' : ''); give.appendChild(c) }
  daysRow.before(give)
  daysRow.before(halfRow)                                   // AM / PM straight under the choice, above Days
  for (const el of [give, halfRow]) el.style.cssText += ';' + ring
  return true
}, RING)
await P.waitForTimeout(200)
await H.pic(w, 'd6e-phone-1-his-order', [T('bid-picker')], { pad: 4, scale: 'device' })
note('d6e', 'draw', `drawn ${okE}`)
await close()

/* ---------- F: the window's own Duration decides ---------- */
await grantPanel()
const durRow = '[data-testid="portion-am"]'
const markF = (half) => P.evaluate(([half, ring]) => {
  const dur = document.querySelector('[data-testid="portion-am"]')?.closest('.bidsheet-row')
  const daysRow = document.querySelector('[data-testid="oil-days"]')?.closest('.bidsheet-row')
  const give = document.querySelector('[data-testid="oil-give"]')
  const halfRow = document.querySelector('[data-testid="oil-half-am"]')?.closest('.bidsheet-row')
  if (!dur || !daysRow || !give) return false
  dur.style.cssText += ';' + ring
  if (halfRow) halfRow.style.display = 'none'               // no Half row: the Duration at the top already says which half
  const lab = daysRow.querySelector('.lab'), box = document.querySelector('[data-testid="oil-days"]')
  if (half) { if (lab) lab.style.visibility = 'hidden'; if (box) box.style.display = 'none'; give.textContent = `Give HO · ${half === 'am' ? 'morning' : 'afternoon'}` }
  else give.textContent = 'Give FO'
  give.style.cssText += ';' + ring
  return true
}, [half, RING])
/* Whole day: as today, the Duration row marked as what decides */
const okF1 = await markF(null); await P.waitForTimeout(200)
await H.pic(w, 'd6f-phone-1-whole-day-fo', [T('bid-picker')], { pad: 4, scale: 'device' })
/* AM pressed — the window's real AM chip — then the transform */
await L.press(w, T('portion-am')); await P.waitForTimeout(400)
if (!(await L.vis(P, T('oil-give')))) { await L.press(w, T('bid-oil')); await P.waitForTimeout(400) }
const okF2 = await markF('am'); await P.waitForTimeout(200)
await H.pic(w, 'd6f-phone-2-am-ho', [T('bid-picker')], { pad: 4, scale: 'device' })
note('d6f', 'draw', `drawn ${okF1} / ${okF2}`)
await close()
/* ---------- G (after his D1391 — the half of a granted HO does not matter): the Give row, FO · a day / HO · half a day;
   no AM / PM row; Days only for an FO (more than one day); the button says which ---------- */
for (const ho of [false, true]) {
  await grantPanel()
  const okG = await P.evaluate(([ho, ring]) => {
    const daysRow = document.querySelector('[data-testid="oil-days"]')?.closest('.bidsheet-row')
    const chipSrc = document.querySelector('[data-testid="portion-am"]')
    const give = document.querySelector('[data-testid="oil-give"]')
    if (!daysRow || !chipSrc || !give) return false
    const row = daysRow.cloneNode(false); row.id = 'dr-fh'
    const lab = document.createElement('span'); lab.className = 'lab'; lab.textContent = 'Give'; row.appendChild(lab)
    for (const [t, on] of [['FO · a day', !ho], ['HO · half a day', ho]]) { const c = chipSrc.cloneNode(false); c.removeAttribute('data-testid'); c.textContent = t; c.className = 'pchip' + (on ? ' on' : ''); row.appendChild(c) }
    daysRow.before(row)
    if (ho) { const lb = daysRow.querySelector('.lab'), box = document.querySelector('[data-testid="oil-days"]'); if (lb) lb.style.visibility = 'hidden'; if (box) box.style.display = 'none'; give.textContent = 'Give HO' }
    for (const el of [row, give]) el.style.cssText += ';' + ring
    return true
  }, [ho, RING])
  await P.waitForTimeout(200)
  await H.pic(w, ho ? 'd6g-phone-2-ho' : 'd6g-phone-1-fo', [T('bid-picker')], { pad: 4, scale: 'device' })
  note('d6g', 'draw', `${ho ? 'HO' : 'FO'} drawn ${okG}`)
  await close()
}
H.saveLog('draw-log-ho.json')
await H.closeBrowser()
process.exit(0)
