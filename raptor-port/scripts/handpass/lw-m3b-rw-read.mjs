// THE RE-WALK OF THE CODE READ'S F1 AND F5 (the M3 build's FULL check, 25 Oct 26), on the built bundle, with pictures:
//   F1  the Scheduler Board's Ground Programme "+ Inputs" → an Other for Ranger, Goes to Unavailable → Add: the passing
//       note says it was filed under Unavailable, the row stands on the board's Unavailable list, and the Leave War counts
//       him out (Available P one lower); the same window for an Attach files it under Unavailable by itself
//   F5  his PC (1536 × 864): the Leave War, a date heading pressed (the day panel floats at the top right), a bid that
//       turns a row red: the bubble stands at the FOOT of the screen, never at its top
// Usage (from raptor-port/, a preview served): node scripts/handpass/lw-m3b-rw-read.mjs
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-m3-build/rewalk-read'
process.env.HP_URL ||= 'http://localhost:4180'
const L = await import('./lw-r3-lib.mjs')
const path = await import('node:path')
const T = L.T
console.log('lw-m3b-rw-read v4 →', L.OUT)
const out = []
const say = s => { out.push(s); console.log('   ' + s) }
const shot = (P, name, clip) => P.screenshot({ path: path.join(L.OUT, name + '.png'), scale: 'css', ...(clip ? { clip } : {}) })
const boxOf = (P, sel) => P.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.max(0, r.left - 8), y: Math.max(0, r.top - 8), width: Math.min(innerWidth, r.width + 16), height: Math.min(innerHeight, r.height + 16) } }, sel)

/* ---------- F1 ---------- */
{
  const w = await L.newCtx('desk'); const P = w.page
  const errs = []; P.on('pageerror', e => errs.push(String(e))); P.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await L.signInPlain(w, 'admin')
  const who = await P.evaluate(() => Object.entries(window.PEOPLE).find(([, v]) => v.cs === 'Ranger')[0])
  await L.reachCell(w, who, '2026-07-15')
  const availBefore = await L.txt(P, T('avail-p-2026-07-15'))
  await P.evaluate(() => window.go('editsched')); await P.waitForTimeout(1200)
  /* the Scheduler Board on Wednesday 15 Jul (day 2) */
  const lib = await import('./lib.mjs')
  await lib.board(P, 2); await P.waitForTimeout(800)
  for (const [type, rmk] of [['Other', 'Board of inquiry'], ['Attach', 'Exercise support']]) {
    const add = P.locator('#schedBoard [data-inpadd="2.g"]:visible').first()
    if (!(await add.count())) { say(`F1 ${type}: NOT WALKED — no "+ Inputs" on the Ground Programme`); continue }
    await add.click(); await P.waitForSelector('#inpEditPop:not([hidden]) #inpEditType, [data-testid="win-inputedit"] #inpEditType', { timeout: 5000 }); await P.waitForTimeout(500)
    await P.locator('#inpEditPerson').selectOption({ label: 'Ranger' })
    await P.locator('#inpEditType').selectOption(type); await P.waitForTimeout(300)
    if (type === 'Other') { await P.locator(T('inpEdit-goes-u')).click(); await P.waitForTimeout(200) }
    if (type === 'Attach') await P.locator('#inpEditTo').fill('145 Sqn')
    await P.locator('#inpEditRmk').fill(rmk)
    await shot(P, `f1-${type}-window`, await boxOf(P, '#inpEditPop .inpedbox, #inpEditPop, [data-testid="win-inputedit"]'))
    const toasts = []
    P.on('console', () => {})
    await P.locator('#inpEditSave').click()
    const t = await P.waitForSelector('#toastEl, .toast', { timeout: 3000 }).then(e => e.innerText()).catch(() => '')
    toasts.push(t)
    await P.waitForTimeout(900)
    const rec = await P.evaluate(r => (window.INPUTS || []).filter(x => x.remarks === r).map(x => ({ type: x.type, acc: x.acc, to: x.to })), rmk)
    const unav = await P.evaluate(r => [...document.querySelectorAll('#schedBoard .sb-panel.unav')].some(s => s.innerText.includes(r)), rmk)
    const ground = await P.evaluate(r => [...document.querySelectorAll('#schedBoard .sb-panel.grnd')].some(s => s.innerText.includes(r)), rmk)
    say(`F1 ${type}: note "${t.replace(/\s+/g, ' ').trim()}"; stored ${JSON.stringify(rec)}; on the board's Unavailable list ${unav}, on its Ground Programme ${ground}`)
    say(`F1 ${type}: ${rec[0]?.acc === 'u' && unav && !ground && /Unavailable/.test(t) ? 'PASS' : 'FAIL'}`)
    say(`F1 ${type}: the board's Unavailable panel reads: ${JSON.stringify(await P.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.unav')].map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 260))))}`)
    await P.locator('#schedBoard .sb-panel.unav').first().scrollIntoViewIfNeeded().catch(() => {})
    await P.waitForTimeout(300)
    await shot(P, `f1-${type}-board`)
  }
  await lib.closeBoard(P).catch(() => {})
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(1200)
  await L.reachCell(w, who, '2026-07-15')
  const availAfter = await L.txt(P, T('avail-p-2026-07-15'))
  const cell = await L.cellInfo(P, who, '2026-07-15')
  say(`F1 the war: Available P ${availBefore} → ${availAfter}; Ranger's 15 Jul ${JSON.stringify((cell?.boxes || []).map(b => b.text))}`)
  await P.locator(T(L.cellId(who, '2026-07-15'))).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await P.waitForTimeout(400)
  await shot(P, 'f1-war', await boxOf(P, `[data-testid="${L.cellId(who, '2026-07-15')}"]`).then(b => b && { x: Math.max(0, b.x - 200), y: Math.max(0, b.y - 120), width: 480, height: 200 }))
  say(`F1 errors: ${JSON.stringify(errs.slice(0, 3))}`)
  await w.ctx.close()
}

/* ---------- F5 ---------- */
{
  const b = await L.getBrowser()
  const ctx = await b.newContext({ viewport: { width: 1536, height: 864 } })
  const P = await ctx.newPage()
  const w = { ctx, page: P, size: 'desk1536', phone: false }
  await L.signInPlain(w, 'admin')
  const who = await P.evaluate(() => Object.entries(window.PEOPLE).find(([, v]) => v.cs === 'Drifter')[0])
  const D = '2026-12-16'
  await L.reachCell(w, who, D)
  /* a counter red the moment one more is off that day, made through the store's test door (the walk's own fixture) */
  const ok = await P.evaluate(d => { const s = window.lwGetState?.(); return !!s }, D)
  /* the day panel: the date's heading */
  const head = P.locator(T('head-' + D)).first()
  await head.click(); await P.waitForTimeout(600)
  const panel = await P.evaluate(() => { const e = document.querySelector('[data-testid="win-lwday"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) } })
  say(`F5 the day panel: ${JSON.stringify(panel)}`)
  /* a bid on that day: Required P typed at today's Available P so the bid turns it red (L.setRequired) */
  /* a counter of everyone already red there (the probe bridge's rule door, as bidbubble.test.tsx's fixture): a bid takes it
     lower and raises the note (D1345) */
  say('F5 rule saved: ' + await P.evaluate(() => window.lwSaveManningRule({ id: 'rw-red', label: 'Test crew', count: { kind: 'people', filter: {} }, threshold: { amber: 999, red: 999 } })))
  await P.waitForTimeout(400)
  await L.openCellR(w, who, D)
  if (await L.vis(P, T('bid-picker'))) {
    const tick = P.locator(T('bid-approve-tick'))
    if (await tick.count() && (await tick.getAttribute('aria-checked')) === 'true') await tick.click()
    await P.locator(T('bid-LL')).click(); await P.waitForTimeout(700)
  }
  const bub = await P.evaluate(() => { const e = document.querySelector('[data-testid="manning-bubble"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), words: e.getAttribute('aria-label'), styleBottom: e.style.bottom } })
  say(`F5 the bubble: ${JSON.stringify(bub)} (screen 864)`)
  say(`F5: ${bub && bub.bottom >= 864 - 60 ? 'PASS' : bub ? 'FAIL' : 'NOT WALKED — no bubble raised'}`)
  await shot(P, 'f5-desk-panel-bubble')
  await ctx.close()
}
await L.closeBrowser()
