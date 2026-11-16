/* www W2 plain-user round: ALL AVAIL window and Insights closed every way; View-only Sched read as the admin and as Ranger.
   usage (from raptor-port/): [PHONE=1] node scripts/handpass/www/www-w2-s15.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's15-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w2-lib2.mjs')
const { X, say, sleep, L } = H
const P = PHONE ? 'p' : 'd', size = PHONE ? '402' : '1536'
const R = (did, exp, saw, v, pic) => X.row('plain-user round', size, did, exp, saw, v, pic)
say('www-w2-s15 v1', size)
const w = await X.open({ phone: PHONE })
const { page } = w
const FRI = X.FRI
await X.board(w, FRI)
await H.frFlight(w, FRI, '12:00', '', 'bane', 'VL BFM')
await H.gRow(w, FRI, 'BRIEFING', '13:10', '13:20', 'bane')
const gP = await H.gRow(w, FRI, 'PROBE', '13:10', '13:20', null)
await X.seat(w, `[data-fill="g:${FRI}.${gP}.+"]`, 'allavail')
const winN = () => page.locator('.availwin:visible').count()
const outside = async () => { const vp = page.viewportSize(); if (PHONE) await page.touchscreen.tap(6, 140); else await page.mouse.click(6, 60); await sleep(500) }
const snap = () => page.evaluate(() => JSON.stringify(window.DAYS.map(d => d.ground.length)))
for (const [how, fn] of [['Escape', () => page.keyboard.press('Escape')], ['a tap outside', outside], ['its ✕', () => H.closeAvail(w)]]) {
  const o = await H.openAvail(w, `g:${FRI}.${gP}`)
  const open1 = await winN(); const s0 = await snap()
  await fn(); await sleep(500)
  const open2 = await winN()
  await X.pic(w, `15-all-${how.replace(/\W+/g, '')}-${P}`)
  R(`ALL AVAIL window opened, closed by ${how}`, how === 'Escape' ? 'RECORD (Escape known not to close it: [ALLAVAIL-ESCAPE])' : 'closes or RECORD', `open before ${open1}, after ${open2}; page unchanged ${s0 === await snap()}`, how === 'its ✕' ? (open2 ? 'FAIL' : 'PASS') : 'RECORDED', `15-all-${how.replace(/\W+/g, '')}-${P}.png`)
  if (open2) await H.closeAvail(w)
}
// Insights closed every way (board)
for (const [how, fn] of [['its ✕', () => H.closeInsights(w)], ['Escape', () => page.keyboard.press('Escape')], ['a tap outside', outside]]) {
  const ins = await H.insightsLines(w, `15-ins-${how.replace(/\W+/g, '')}`)
  const open1 = ins[0] && /insights/i.test(ins[0])
  await fn(); await sleep(500)
  const open2 = await page.evaluate(() => [...document.querySelectorAll('*')].some(e => e.children.length === 0 && /^Week insights/.test(e.textContent) && e.getBoundingClientRect().width > 0))
  await X.pic(w, `15-ins-after-${how.replace(/\W+/g, '')}-${P}`)
  R(`Insights opened, closed by ${how}`, how === 'its ✕' ? 'closes' : 'RECORD', `opened ${open1}, still open ${open2}`, how === 'its ✕' ? (open2 ? 'FAIL' : 'PASS') : 'RECORDED', `15-ins-after-${how.replace(/\W+/g, '')}-${P}.png`)
  if (open2) await H.closeInsights(w)
}
// publish Friday, then read View-only Sched as the admin and as Ranger
const pub = await H.signAndPublish(w, FRI)
say('PUBLISH', JSON.stringify(pub))
await X.closeBoard(w)
const pages = await page.evaluate(() => [...document.querySelectorAll('[data-page]')].map(e => e.dataset.page))
say('PAGES', JSON.stringify([...new Set(pages)]))
const vp = [...new Set(pages)].find(p => /view|vsched|week/i.test(p)) || 'viewsched'
async function readView(who) {
  await L.go(page, vp); await sleep(600)
  const ww = await X.weekWarn(w, '#vWeek', FRI)
  const dd = await X.dayDetails(w, '#vWeek', FRI)
  await X.pic(w, `15-view-${who}-${P}`)
  await X.closeDayPop(w, 'done')
  return { head: ww.head, items: ww.items.filter(l => /Ranger/.test(l)), dd: (dd.items || []).filter(l => /Ranger/.test(l)), ddWhy: dd.why || '' }
}
const a = await readView('admin')
R(`View-only Sched (page ${vp}) as the admin: Friday strip and day details`, 'the published day\'s warnings, same words as Edit Schedule', JSON.stringify(a), a.items.some(l => /Conflict:/.test(l)) ? 'PASS' : 'RECORDED', `15-view-admin-${P}.png`)
await page.reload(); await page.waitForSelector('#luser, #vWeek .day', { state: 'attached', timeout: 15000 })
if (await page.locator('#luser:visible').count()) await L.login(page, 'u')
await sleep(800)
const m = await readView('ranger')
R(`View-only Sched as Ranger (member): Friday strip and day details`, 'the published day\'s warnings, same words (members read them too)', JSON.stringify(m), m.items.some(l => /Conflict:/.test(l)) ? 'PASS' : 'RECORDED', `15-view-ranger-${P}.png`)
await X.fin(w)
