// The host's own short walk of the starting routes (walk-scripts.md §1, §2), before the walkers start — chat 13, 8 Nov 26.
// R1 the waiting mark (week, board, phone); R2 the unreadable week (notice, refusal); R3 the drawn eye in a look;
// R4 the Reset arrow on a hidden warning. Prints what it read; pictures to docs/img/handpass/2026-11-08-sched-marks/host.
// Run from raptor-port/: node scripts/handpass/sm-host.mjs
import * as L from './sm-lib.mjs'
console.log('sm-host v1', L.DIST)
const OUT = L.outDir('host')
const ORIGIN = 'http://localhost:4390'
const res = {}
const step = async (k, fn) => { try { res[k] = await fn(); console.log(k, JSON.stringify(res[k])) } catch (e) { res[k] = { err: e.message.split('\n')[0] }; console.log(k, 'ERR', res[k].err) } }

/* ---- R1, R3, R4 on the PC ---- */
const W = await L.launch('pc', { origin: ORIGIN })
await L.signIn(W)
await step('r1.publish', () => L.publishDay(W, 2))
await L.closeBoard(W)
await step('r1.file', async () => { const r = await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' }); return r && { iid: r.iid, type: r.type, acc: r.acc } })
await L.goEdit(W)
await step('r1.week', async () => ({ pend: await L.dayPending(W.page, 2), mark: await L.weekUnavMark(W.page, 2, 'Bolt') }))
await L.center(W.page, '#eWeek section.day[data-day="2"] .sec-unav'); await L.sleep(400)
await L.pic(W, OUT, 'r1-pc-week-unav', { sel: '#eWeek section.day[data-day="2"] .sec-unav' })
await L.openBoard(W, 2)
await step('r1.board', () => L.boardUnavMark(W.page, 'Bolt'))
await L.center(W.page, '#schedBoard .sb-panel.unav'); await L.sleep(400)
await L.pic(W, OUT, 'r1-pc-board-unav', { sel: '#schedBoard .sb-panel.unav' })
// R3 the eye: the plans menu → Original (read-only look)
await step('r3.look', async () => {
  await L.press(W, '#schedBoard [data-planmenu="2"]'); await L.sleep(500)
  const rows = await W.page.evaluate(() => [...document.querySelectorAll('.wavemenu [data-planpv]')].map(b => b.textContent.trim()))
  await W.page.locator('.wavemenu [data-planpv]').first().click(); await L.sleep(900)
  return W.page.evaluate(() => {
    const sel = document.querySelector('#schedBoard [data-planmenu="2"]')
    const ban = [...document.querySelectorAll('#schedBoard *')].find(e => e.children.length < 6 && /Viewing the issued/.test(e.textContent) && e.getBoundingClientRect().height > 0)
    const eyeIn = e => e ? [...e.querySelectorAll('svg.pveye')].filter(s => s.getBoundingClientRect().width > 0).map(s => { const r = s.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)] }) : null
    const unavAln = [...document.querySelectorAll('#schedBoard .sb-panel.unav [data-aln]')].length
    return { selText: sel && sel.textContent.trim(), selEye: eyeIn(sel), banner: ban && ban.textContent.trim().slice(0, 90), bannerEye: eyeIn(ban), typedEye: document.querySelector('#schedBoard').textContent.includes('👁'), unavAlnInLook: unavAln }
  }).then(o => ({ rows, ...o }))
})
await L.pic(W, OUT, 'r3-pc-board-look', { clip: { x: 0, y: 0, width: 1536, height: 300 } })
await L.closeBoard(W)
// R4 the Reset arrow: hide the first warning of Thu 16 Jul on the week, then read it on the board
await L.goEdit(W)
await step('r4.week', async () => {
  const D3 = '#eWeek section.day[data-day="3"]'
  const n = await W.page.locator(`${D3} .witem-mute:visible`).count()
  if (!n) return { err: 'no warning to hide on Thu' }
  const b = W.page.locator(`${D3} .witem-mute:visible`).first()
  const ix = await b.getAttribute('data-woff')
  await b.click(); await L.sleep(600)
  return W.page.evaluate(ix => {
    const btn = document.querySelector(`#eWeek .witem-mute[data-woff="${ix}"]`)
    const s = btn && btn.querySelector('svg.wmuteico'); const r = s && s.getBoundingClientRect()
    return { ix, title: btn && btn.title, svg: !!s, size: r && [Math.round(r.width), Math.round(r.height)], text: btn && btn.textContent.trim() }
  }, ix)
})
await L.center(W.page, '#eWeek section.day[data-day="3"] .witem-mute'); await L.sleep(300)
await L.pic(W, OUT, 'r4-pc-week-reset', { sel: '#eWeek section.day[data-day="3"] .witem-mute svg.wmuteico', pad: 120 })
await L.openBoard(W, 3)
await step('r4.board', () => W.page.evaluate(() => {
  const bs = [...document.querySelectorAll('#schedBoard .wln-mute')].filter(b => b.getBoundingClientRect().width > 0)
  return bs.map(b => ({ title: b.title, svg: !!b.querySelector('svg.wmuteico'), text: b.textContent.trim() }))
}))
await L.closeBoard(W)
await step('r1.errs', async () => W.errs)
const state = await W.ctx.storageState()
const key = await L.weekRowKey(W.page, 2)
await L.closeAll(W)

/* ---- R1 on the phone, the same world ---- */
const P = await L.launch('phone', { origin: ORIGIN, state })
await L.signIn(P)
await L.goEdit(P)
await step('r1.phone.week', async () => ({ pend: await L.dayPending(P.page, 2), mark: await L.weekUnavMark(P.page, 2, 'Bolt') }))
await L.center(P.page, '#eWeek section.day[data-day="2"] .sec-unav'); await L.sleep(800)
await L.pic(P, OUT, 'r1-ph-week-unav', { sel: '#eWeek section.day[data-day="2"] .sec-unav' })
await L.openBoard(P, 2)
await step('r1.phone.board', () => L.boardUnavMark(P.page, 'Bolt'))
await L.center(P.page, '#schedBoard .sb-panel.unav'); await L.sleep(600)
await L.pic(P, OUT, 'r1-ph-board-unav', { sel: '#schedBoard .sb-panel.unav' })
await step('r1.phone.errs', async () => P.errs)
await L.closeAll(P)

/* ---- R2 the unreadable week (Astra's fixture U) on the PC ---- */
console.log('damaging', JSON.stringify(key))
const U = await L.launch('pc', { origin: ORIGIN, state, init: L.damageInit(key) })
await L.signIn(U)
await L.goEdit(U)
await step('r2.notices', () => U.page.evaluate(() => {
  const bars = [...document.querySelectorAll('#eWeek .dprev-bar')].filter(b => b.getBoundingClientRect().height > 0)
  return { days: document.querySelectorAll('#eWeek section.day').length, notices: bars.length, text: bars[0] && bars[0].innerText.replace(/\s+/g, ' ').trim() }
}))
await L.center(U.page, '#eWeek section.day[data-day="2"] .dprev-bar'); await L.sleep(300)
await L.pic(U, OUT, 'r2-pc-notice', { sel: '#eWeek section.day[data-day="2"]' })
await step('r2.refusal', async () => {
  await L.fillNew(U, { who: 'Saint', type: 'Meeting', iso: '2026-07-16', remarks: 'Safety brief' })
  await U.page.locator('#inpEditSave').click(); await L.sleep(450)
  const t = await L.toastText(U.page)
  const winOpen = await U.page.locator(L.T('win-inputedit')).count()
  return { toast: t, winOpen }
})
await L.pic(U, OUT, 'r2-pc-refusal', { sel: '#toastEl', pad: 30 })
await step('r2.errs', async () => U.errs)
await L.closeAll(U)
L.saveJson(OUT, 'host-results', res)
console.log('DONE')
