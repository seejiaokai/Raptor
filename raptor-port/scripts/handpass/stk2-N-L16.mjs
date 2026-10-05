import * as K from './stk2-N-klib.mjs'
const { L, W, H } = K
const { browser, p, errors } = await H.world({ who: 'a', phone: true })
await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="0"]'); await L.sleep(800)
await W.boardOn(p, 0); await L.sleep(800)
async function tapBtn(sel) { const el = p.locator(sel).first(); const b = await el.boundingBox(); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await K.sleep(600) }
await tapBtn('#sbMore')
const dl = p.locator('button:visible', { hasText: /Desktop layout/ }).first()
const bd = await dl.boundingBox(); await p.touchscreen.tap(bd.x + bd.width / 2, bd.y + bd.height / 2); await K.sleep(900)
const pc0 = await K.pic(p, 'L16-desktop-layout-before-fail')
async function typeNote(key, text) {
  const el = p.locator(`#schedBoard [data-bfld="${key}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await K.sleep(250)
  const b = await el.boundingBox()
  await p.touchscreen.tap(Math.min(b.x + 20, 380), b.y + b.height / 2); await K.sleep(250)
  await p.keyboard.press('End'); await p.keyboard.type(text, { delay: 10 })
  await p.evaluate(() => document.activeElement && document.activeElement.blur()); await K.sleep(700)
}
await typeNote('dn:0.0', ' ok')
await L.settle(p)
await p.evaluate(() => { window.__lsSetWas = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new DOMException('The quota has been exceeded (walk: forced)', 'QuotaExceededError') } })
await typeNote('dn:0.1', ' fail')
const found = await p.waitForFunction(() => [...document.querySelectorAll('body *')].some(e => /Not saved/i.test(e.textContent || '') && e.children.length < 4 && e.getBoundingClientRect().width > 0), null, { timeout: 12000 }).then(() => true, () => false)
console.log('note found', found)
await K.sleep(500)
const geo = () => p.evaluate(() => {
  const r = e => { const x = e.getBoundingClientRect(); return { left: Math.round(x.left), right: Math.round(x.right), top: Math.round(x.top), bottom: Math.round(x.bottom), w: Math.round(x.width) } }
  const leaves = [...document.querySelectorAll('body *')].filter(e => /Not saved/i.test(e.textContent || '') && e.getBoundingClientRect().width > 0 && ![...e.children].some(c => /Not saved/i.test(c.textContent || '') && c.getBoundingClientRect().width > 0))
  const notes = leaves.map(n => {
    const box = n.closest('.savestat, .saveband, [class*=save]') || n
    const retry = [...box.querySelectorAll('button')].find(b => /retry/i.test(b.textContent))
    const anc = []
    for (let e = box; e && e !== document.documentElement; e = e.parentElement) { const cs = getComputedStyle(e); anc.push((e.id ? '#' + e.id : '') + '.' + String(e.className).split(' ')[0] + ' ' + cs.position) }
    const rr = retry ? r(retry) : null
    let hit = null
    if (rr) {
      const cx = (rr.left + rr.right) / 2, cy = (rr.top + rr.bottom) / 2
      if (cx >= 0 && cx < innerWidth && cy >= 0 && cy < innerHeight) { const x = document.elementFromPoint(cx, cy); hit = x ? (x === retry || retry.contains(x) ? 'the Retry button' : (x.id ? '#' + x.id : x.tagName + '.' + String(x.className).split(' ')[0])) : null } else hit = 'off screen'
    }
    const nr = r(n)
    const cxn = Math.min(Math.max((nr.left + nr.right) / 2, 0), innerWidth - 1), cyn = (nr.top + nr.bottom) / 2
    const topN = document.elementFromPoint(cxn, cyn)
    return { cls: String(box.className).split(' ').slice(0, 2).join('.'), text: n.textContent.replace(/\s+/g, ' ').trim().slice(0, 60), note: nr, retry: rr, retryHit: hit, noteSeen: !!topN && (n === topN || n.contains(topN) || topN.contains(n)) && nr.top >= 0, anc: anc.slice(0, 6) }
  })
  const sb = document.querySelector('#schedBoard')
  return { notes, vw: innerWidth, docW: document.documentElement.scrollWidth, board: sb ? Math.round(sb.scrollLeft) : null, boardW: sb ? sb.scrollWidth : null }
})
const fmtN = n => '[' + n.cls + '] "' + n.text + '" spans ' + n.note.left + '..' + n.note.right + ' (w ' + n.note.w + ') at y ' + n.note.top + '-' + n.note.bottom + ', seen on top: ' + n.noteSeen + '; Retry ' + (n.retry ? n.retry.left + '..' + n.retry.right + ' (w ' + n.retry.w + ') at y ' + n.retry.top + '-' + n.retry.bottom : 'none') + '; a finger at its middle lands on: ' + n.retryHit + '; ancestors: ' + n.anc.join(' < ')
const fmt = g => g ? ('board scrolled ' + g.board + ' of ' + g.boardW + ': ' + g.notes.map(fmtN).join(' ## ')) : 'no note found'
/* a sideways pan: positive dx = back toward the left edge, negative = on to the right (a sideways wheel turn over the board) */
let PANVIA = 'a sideways wheel turn'
const pan = async (dx) => {
  const b0 = await p.evaluate(() => document.querySelector('#schedBoard').scrollLeft)
  await p.mouse.move(200, 520); await p.mouse.wheel(-dx, 0); await K.sleep(500)
  const b1 = await p.evaluate(() => document.querySelector('#schedBoard').scrollLeft)
  if (b1 === b0) {
    // the wheel did not move it (a desktop-emulated touch screen): set the board's own scroll position, which is what a finger pan does
    await p.evaluate(d => { const sb = document.querySelector('#schedBoard'); sb.scrollLeft = Math.max(0, Math.min(sb.scrollWidth, sb.scrollLeft - d)) }, dx); await K.sleep(500); PANVIA = 'setting the board scroll position directly (a wheel turn did not move it)'
  }
}
const g0 = await geo()
console.log('S1', fmt(g0))
const pc1 = await K.pic(p, 'L16-failed-save-as-it-appeared')
for (let i = 0; i < 4; i++) await pan(300)
const g1 = await geo(); console.log('S2', fmt(g1))
const pc2 = await K.pic(p, 'L16-board-at-left-edge')
let last = -1
for (let i = 0; i < 6; i++) { await pan(-300); const g = await geo(); if (g.board === last) break; last = g.board }
const g2 = await geo(); console.log('S3', fmt(g2))
const pc3 = await K.pic(p, 'L16-board-at-right-edge')
await p.evaluate(() => { const arm = e => { if (!/retry/i.test((e.target.closest('button') || {}).textContent || '')) return; Storage.prototype.setItem = window.__lsSetWas; document.removeEventListener('pointerdown', arm, true) }; document.addEventListener('pointerdown', arm, true) })
let pressed = 'no Retry could be reached by a finger'
for (let st = 0; st < 2; st++) {
  const g = await geo()
  const n = g.notes.find(n => n.retry && n.retryHit === 'the Retry button')
  if (n) { const cx = (n.retry.left + n.retry.right) / 2, cy = (n.retry.top + n.retry.bottom) / 2; await p.touchscreen.tap(cx, cy); pressed = 'tapped Retry at (' + Math.round(cx) + ',' + Math.round(cy) + ') with the board scrolled to ' + g.board; break }
  for (let i = 0; i < 4; i++) await pan(300)
}
await K.sleep(1500)
const gone = await p.evaluate(() => ![...document.querySelectorAll('body *')].some(e => /Not saved/i.test(e.textContent || '') && e.getBoundingClientRect().width > 0))
const pc4 = await K.pic(p, 'L16-after-retry')
const okNote = g0.notes.some(n => n.noteSeen && n.retry && n.retry.left >= 0 && n.retry.right <= g0.vw && n.retryHit === 'the Retry button')
K.note('L-16', 'phone-desktop-layout', 'Phone 390x844: Edit Schedule -> Mon on the Scheduler Board (tap) -> more menu -> Desktop layout; typed into the first overall note (real write), made storage refuse writes, typed in the second note; then looked, panned the board to its left edge and to its right edge, and tapped Retry',
  'AS IT APPEARED (screen ' + g0.vw + ' wide, page ' + g0.docW + ' wide): ' + fmt(g0) + '  ||| BOARD PANNED TO LEFT EDGE: ' + fmt(g1) + '  ||| BOARD PANNED TO RIGHT EDGE: ' + fmt(g2) + '  ||| panning was done by ' + PANVIA + '  ||| then ' + pressed + '; afterwards the note is ' + (gone ? 'GONE (saved)' : 'still showing'),
  okNote && gone ? 'PASS' : 'FAIL', [pc0, pc1, pc2, pc3, pc4])
console.log('errors', K.errList(errors))
K.flush()
await browser.close()
