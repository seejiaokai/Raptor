import * as C from './appr-a-common.mjs'
console.log('[appr-a-f2 v1]')
C.initLog('appr-a-f2-log.txt')
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
const setWin = await C.windowCtl(P)
await setWin(1550, 560)
await P.locator(T('appr-pick')).click(); await C.sleep(1000)
const S = () => P.evaluate(sel => { const sc = document.querySelector(`${sel} .appr-scroll`); const card = document.querySelector(`${sel} .appr-card`); const r = sc.getBoundingClientRect(); return { open: !!document.querySelector('[data-testid="appr-range-picker"]'), scTop: +sc.scrollTop.toFixed(1), scRoom: +(sc.scrollHeight - sc.clientHeight).toFixed(1), clientH: sc.clientHeight, scrollH: sc.scrollHeight, sbw: sc.offsetWidth - sc.clientWidth, right: +r.right.toFixed(1), top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), cardScrollTop: card.scrollTop, winY: scrollY, win: (() => { const se = document.scrollingElement; return se.scrollHeight - se.clientHeight })() } }, C.PAGE)
const s0 = await S(); C.note('start: ' + JSON.stringify(s0))
await C.shot(P, 'f2-0-open')
// predicted thumb (classic scrollbar with an arrow button at each end)
const thumbAt = s => { const arrow = s.sbw; const track = s.clientH - 2 * arrow; const len = Math.max(track * s.clientH / s.scrollH, 20); const pos = arrow + (track - len) * (s.scRoom ? s.scTop / s.scRoom : 0); return { y: s.top + pos + len / 2, len, x: s.right - s.sbw / 2 } }
if (s0.sbw < 4) { C.check('F2-bar', false, 'NOT REACHED: the list box has no classic scroll bar to press on (width ' + s0.sbw + ')') }
else {
  // (a) drag the thumb
  const th = thumbAt(s0); C.note(`thumb guess x ${th.x.toFixed(1)} y ${th.y.toFixed(1)} len ${th.len.toFixed(1)} bar width ${s0.sbw}`)
  await C.shot(P, 'f2-1-bar-zoom', { x: s0.right - 60, y: s0.top, width: 60, height: s0.bottom - s0.top })
  await P.mouse.move(th.x, th.y); await P.mouse.down(); await C.sleep(150)
  const mid = []
  for (let i = 1; i <= 8; i++) { await P.mouse.move(th.x, th.y + i * 8); await C.sleep(90); mid.push(await S()) }
  await C.shot(P, 'f2-2-dragging')
  await P.mouse.up(); await C.sleep(500)
  const s1 = await S(); C.note(`drag: list ${s0.scTop} -> ${mid.map(m => m.scTop).join(',')} -> after lift ${s1.scTop}; calendar open during ${mid.every(m => m.open)} / after ${s1.open}`)
  await C.shot(P, 'f2-3-after-drag')
  C.check('F2-drag', s1.open && mid.every(m => m.open) && s1.scTop > s0.scTop + 20 && s1.cardScrollTop === 0 && s1.win <= 0, `press on the list box's scroll bar thumb (x ${th.x.toFixed(0)}, y ${th.y.toFixed(0)}), move down 64px, lift: list scrollTop ${s0.scTop} -> ${s1.scTop}, calendar stayed open (during ${mid.every(m => m.open)}, after ${s1.open}), card.scrollTop ${s1.cardScrollTop}, window room ${s1.win}`)
  // (b) press in the track below the thumb (a page jump) and the bottom arrow button
  const th2 = thumbAt(s1)
  await P.mouse.click(th2.x, s1.bottom - s1.sbw - 12); await C.sleep(700)
  const s2 = await S(); C.note(`track click below thumb at y ${(s1.bottom - s1.sbw - 12).toFixed(0)}: list ${s1.scTop} -> ${s2.scTop}, calendar open ${s2.open}`)
  await C.shot(P, 'f2-4-track-click')
  C.check('F2-track', s2.open && s2.scTop > s1.scTop && s2.cardScrollTop === 0, `press in the bar's track below the thumb: list ${s1.scTop} -> ${s2.scTop}, calendar open ${s2.open}`)
  await P.mouse.click(s1.right - s1.sbw / 2, s1.bottom - s1.sbw / 2); await C.sleep(500)
  const s3 = await S(); C.note(`bottom arrow of the bar: list ${s2.scTop} -> ${s3.scTop}, calendar open ${s3.open}`)
  C.check('F2-arrow', s3.open && s3.scTop >= s2.scTop, `press on the bar's bottom arrow: list ${s2.scTop} -> ${s3.scTop}, calendar open ${s3.open}`)
  // (c) a press on the page's empty space still closes the calendar (the old behaviour must remain)
  await P.mouse.click(s1.right + 8 < 1536 ? s1.right + 8 : 1530, 150); await C.sleep(600)
  const s4 = await S(); C.note(`press outside the card (right margin) : calendar open ${s4.open}`)
  await C.shot(P, 'f2-5-outside-press')
  C.check('F2-outside', !s4.open, `a press outside the list box still closes the calendar: open ${s4.open}`)
}
C.note('errors ' + JSON.stringify(errs)); C.check('F2-err', errs.length === 0, 'page errors: ' + (errs.join('|') || 'none'))
C.summary()
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
