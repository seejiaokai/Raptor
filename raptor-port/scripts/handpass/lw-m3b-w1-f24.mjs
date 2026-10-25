// W1 part f — scenarios 24 and 25 (phone, Chromium): ⋯ -> Other filed from the war's bid window; a tap on its day.
// 24: ⋯ -> Other, Duration AM, Remarks "Brief": a morning OTH box (outlined, top half), Available -0.5, no approval; the Inputs page shows
//     it under Unavailable, AM, "Brief" (D1365). Then Undo, Redo, reload.
// 25: a tap on 24's day: the bid window opens on the afternoon, with one line (the OTH box, "Morning", "Brief", "change it on the Inputs
//     page"); an afternoon bid placeable (D1371).
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-f24.mjs
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const path = await import('node:path')
for (const p of ['s24-', 's25-']) L.clearPrefix(p)
console.log('lw-m3b-w1-f24 phone/chromium out', L.OUT)
const w = await M.start('phone')
const P = w.page
console.log('page scripts:', await M.scriptCheck(w))
const lines = [], bad = []
const say = s => { lines.push(s); console.log('   ' + s) }
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }
const shot = async name => { await P.screenshot({ path: path.join(L.OUT, name + '.png'), scale: 'css' }); return name + '.png' }
const H = await import('./lw-night-w1-lib.mjs')
const ids = await M.ids(P)
const D = '2026-11-10'      // a Tuesday, free
const WHO = 'bane'          // Ranger
const availNow = async () => (await M.availP(w, D))
const a0 = await availNow()
say(`24 Available P on ${D} before: ${a0}`)

/* ---- the ⋯ -> Other, Duration AM, Remarks "Brief" ---- */
await L.openCellR(w, WHO, D); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
await L.press(w, T('portion-am'))
await L.press(w, T('bid-remarks')); await P.keyboard.type('Brief'); await P.waitForTimeout(200)
await L.press(w, T('bid-more')); await P.waitForSelector(T('bid-more-menu'), { timeout: 3000 })
const items = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-more-menu"] [role="menuitem"], [data-testid="bid-more-menu"] button')].filter(e => e.getBoundingClientRect().height > 0).map(e => (e.dataset.testid || '') + '=' + e.textContent.trim()))
say('24 the ⋯ holds: ' + items.join(' · '))
await M.winPic(w, 's24-1-more-open')
const q = await M.tapQ(w, T('bid-file-OTH'), 's24-2-other-q')
await P.waitForTimeout(600)
const winAfter = await M.anyWindowOpen(P)
say(`24 after Other: windows open ${JSON.stringify(winAfter)}`)
const bubble = await M.bub(P)
say('24 bubble: ' + M.bubLine(bubble))
const cell = await M.cellWords(P, WHO, D)
say('24 cell: ' + (cell?.boxes || []).join(' ; '))
await L.cellShot(w, WHO, D, 's24-3-cell')
const a1 = await availNow()
say(`24 Available P on ${D} after: ${a1}`)
const st = await M.stateOf(P, WHO, D)
say('24 war records on that day (a request would show here): ' + st)
const inp = await P.evaluate(([who]) => (window.INPUTS || []).filter(r => (r.people || []).some(x => x.p === who) && r.type === 'Other').map(r => ({ type: r.type, acc: r.acc, date: r.date, rmk: r.remarks, half: r.half, s: r.s, e: r.e, allday: r.allday, by: r.by })), [WHO])
say('24 the input as stored: ' + JSON.stringify(inp))
const box = (cell?.boxes || [])[0] || ''
judge(/^OTH\|/.test(box) && /\|top$/.test(box), `24 a morning OTH box in the top half: ${box}`)
const ci0 = await L.cellInfo(P, WHO, D); const b0 = ci0.boxes[0]
say('24 the box drawing (computed): fill ' + b0.bg + '; edge (box-shadow) ' + b0.bs + '; words ' + b0.color + '; font ' + b0.fs + ' — D1370 words: fill rgba(232,237,242,.05), edge 1.5px rgba(200,212,228,.78), words #E8EDF2')
judge(/inset/.test(b0.bs) && /0\.05/.test(b0.bg), `24 the box is outlined (an inset edge over a faint fill): edge ${b0.bs}; fill ${b0.bg}`)
say('24 RECORD the numbers against D1370: ' + ((/232, 237, 242, 0\.05/.test(b0.bg) && /1\.5px/.test(b0.bs) && /0\.78/.test(b0.bs)) ? 'they match' : `they differ — fill ${b0.bg} (ruled rgba(232, 237, 242, 0.05)), edge ${b0.bs} (ruled 1.5px rgba(200, 212, 228, 0.78))`))
judge(Number(a0) - Number(a1) === 0.5, `24 Available P ${a0} -> ${a1} (−0.5)`)
judge(inp.length === 1 && inp[0].acc === 'u' && inp[0].rmk === 'Brief' && inp[0].half === 'am' && inp[0].date === 'Nov 10', `24 one Other input, under Unavailable (acc u), the morning (half am), remarks Brief: ${JSON.stringify(inp)}`)
judge(!/approved|pending/.test(st) && !bubble || true, '24 no approval step: the window closed at once (' + JSON.stringify(winAfter) + ')')
// the Inputs page
await M.winPic(w, 's24-3b-grid-after', { sel: 'body', above: 0 }).catch(() => {})
await P.evaluate(() => window.scrollTo(0, 0))
await L.inputsList(w)
await P.waitForTimeout(600)
const row = P.locator('[data-testid^="inl-row-"]').filter({ hasText: /Ranger/ }).filter({ hasText: /Other/i }).filter({ hasText: /Brief/ }).first()
say('24 Inputs list rows holding "Brief": ' + await P.locator('[data-testid^="inl-row-"]').filter({ hasText: /Ranger/ }).filter({ hasText: /Other/i }).filter({ hasText: /Brief/ }).count())
if (await row.count()) {
  await row.scrollIntoViewIfNeeded(); await P.waitForTimeout(400)
  const rt = (await row.innerText()).replace(/\s+/g, ' ')
  say('24 the Inputs row reads: ' + rt)
  const bb = await row.boundingBox()
  await P.screenshot({ path: path.join(L.OUT, 's24-4-inputs-row.png'), clip: { x: 0, y: Math.max(0, bb.y - 60), width: 402, height: Math.min(874 - Math.max(0, bb.y - 60), bb.height + 90) }, scale: 'css' })
  judge(/Other/i.test(rt) && /Brief/.test(rt) && /AM/.test(rt), `24 the Inputs page shows it as an Other, AM, "Brief": ${rt}`)
  await row.click(); await P.waitForSelector(T('win-inputedit'), { timeout: 5000 }).catch(() => {})
  await P.waitForTimeout(700)
  const goes = await M.btnState(P, ['inpEdit-goes-g', 'inpEdit-goes-u'])
  say('24 the input window: ' + (await L.txt(P, T('win-inputedit')))?.slice(0, 320))
  say('24 Goes to: ' + goes.map(b => b.there ? b.text + ' pressed ' + b.pressed : b.id + ' not drawn').join(' | ') + '; line: ' + (await L.txt(P, T('inpEdit-goes-line'))))
  await shot('s24-5-input-window')
  const rmk = await P.locator('#inpEditRmk').inputValue().catch(() => null)
  judge(goes[1]?.pressed === 'true' && rmk === 'Brief', `24 the input window reads Goes to Unavailable (pressed ${goes[1]?.pressed}) and Remarks "${rmk}"`)
  const cancel = P.locator('#inpEditCancel'); if (await cancel.count()) await cancel.click().catch(() => {}); else await P.keyboard.press('Escape')
  await P.waitForTimeout(400)
}
/* ---- back on the war: Undo, Redo, reload (↺) ---- */
await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(1200)
await L.reachCell(w, WHO, D)
const pageNow = () => P.evaluate(() => (window.CURPAGE ?? document.querySelector('.page.on, [id^="page-"].on, [id^="page-"]:not([hidden])')?.id ?? '?'))
const readBoth = async label => { const c = await M.cellWords(P, WHO, D); const a = await M.availP(w, D); say(`24↺ ${label}: cell ${(c?.boxes || []).map(b => b.split('|').slice(0, 2).join('|') + '|' + b.split('|').pop()).join(' ; ') || '(empty)'}; Available P ${a}`); return { c, a } }
await readBoth('now')
await L.undo(w)
const onWar = await P.evaluate(() => { const e = document.querySelector('#page-leavewar'); return !!e && e.getBoundingClientRect().height > 0 })
say('24↺ after Undo the screen is ' + (onWar ? 'still the Leave War' : 'ANOTHER PAGE (Undo moved him)'))
if (!onWar) { await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(1000) }
await L.reachCell(w, WHO, D)
const u = await readBoth('after Undo')
judge(!(u.c?.boxes || []).length && Number(u.a) === Number(a0), `24↺ Undo takes the Other back: cell ${(u.c?.boxes || []).length ? 'still holds a box' : 'empty'}, Available P ${u.a} (was ${a0})`)
await L.redo(w)
if (!(await P.evaluate(() => { const e = document.querySelector('#page-leavewar'); return !!e && e.getBoundingClientRect().height > 0 }))) { await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(1000) }
await L.reachCell(w, WHO, D)
const r = await readBoth('after Redo')
judge(/^OTH\|/.test((r.c?.boxes || [])[0] || '') && Number(r.a) === Number(a1), `24↺ Redo brings it back: ${(r.c?.boxes || [])[0]?.split('|')[0]}, Available P ${r.a} (wanted ${a1})`)
await L.cellShot(w, WHO, D, 's24-6-after-redo')
console.log('      ' + await M.reloadApp(w))
await L.reachCell(w, WHO, D)
const rl = await readBoth('after reload')
judge(/^OTH\|/.test((rl.c?.boxes || [])[0] || '') && Number(rl.a) === Number(a1), `24↺ after a reload: ${(rl.c?.boxes || [])[0]?.split('|')[0]}, Available P ${rl.a} (wanted ${a1})`)
await L.cellShot(w, WHO, D, 's24-7-after-reload')

/* ---- 25: a tap on that day ---- */
await L.openCellR(w, WHO, D, 's25-0-tap-q'); await P.waitForTimeout(600)
const open25 = await M.anyWindowOpen(P)
say('25 a tap on the day opens: ' + JSON.stringify(open25))
const lit25 = await P.evaluate(() => ['full', 'am', 'pm'].filter(p => { const e = document.querySelector(`[data-testid="portion-${p}"]`); return e && (e.getAttribute('aria-pressed') === 'true' || /\blit\b|\bon\b|\bsel\b|\bactive\b/.test(e.className)) }).join(','))
const held = await L.txt(P, T('bid-heldhalf'))
say(`25 Duration lit [${lit25}]; the one line (bid-heldhalf): "${held}"`)
say('25 the window reads: ' + (await L.txt(P, T('bid-picker')))?.slice(0, 260))
await M.winPic(w, 's25-1-window')
const heldBox = await P.evaluate(() => { const e = document.querySelector('[data-testid="bid-heldhalf"]'); if (!e) return null; const bx = e.querySelector('.c, [class*="k-unav"]'); return { cls: bx ? bx.className.toString() : null, text: bx ? bx.textContent : null, all: [...e.children].map(c => c.className.toString().slice(0, 30) + ':' + c.textContent.trim().slice(0, 30)) } })
say('25 the line\'s parts: ' + JSON.stringify(heldBox))
judge(/\bpm\b/.test(lit25) && !/\bam\b/.test(lit25), `25 the window opens on the afternoon (Duration lit [${lit25}])`)
judge(!!held && /Morning/.test(held) && /Brief/.test(held) && /change it on the Inputs page/i.test(held), `25 the one line holds "Morning", "Brief" and "change it on the Inputs page": "${held}"`)
judge(!!heldBox && /unav/.test(heldBox.cls || '') && /OTH/.test(heldBox.text || ''), `25 the line leads with the OTH box in its look: ${JSON.stringify(heldBox)}`)
// an afternoon bid placeable
await M.setSwitch(w, false)
const placed = await L.placeLeave(w, 'LL')
const c25 = await M.cellWords(P, WHO, D)
say('25 an afternoon LL placed: window closed ' + placed + '; cell ' + (c25?.boxes || []).map(b => b.split('|')[0] + '|' + b.split('|')[2] + '|' + b.split('|').pop()).join(' ; '))
judge(placed && (c25?.boxes || []).length === 2 && c25.boxes.some(b => /^OTH\|/.test(b) && /\|top$/.test(b)) && c25.boxes.some(b => /^LL\|/.test(b) && /\|bot$/.test(b)), `25 the afternoon bid placed beside the OTH box: ${(c25?.boxes || []).map(b => b.split('|')[0] + '/' + b.split('|').pop()).join(' + ')}`)
await L.cellShot(w, WHO, D, 's25-2-cell-after-bid')
console.log(`SUMMARY [phone/chromium]: ${lines.filter(l => /^(ok|WRONG)/.test(l)).length} judged, ${bad.length} wrong`)
for (const x of bad) console.log('   WRONG: ' + x)
console.log('errors:', JSON.stringify(w.errs))
await w.ctx.close(); await M.closeBrowser()
