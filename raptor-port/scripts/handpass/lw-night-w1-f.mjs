// WALKER 1 — scenarios 14 (Move from the one-day window), 15 (Move from the drag window) and 17 (a long range on a phone).
// Usage, from raptor-port/:  LW_PORT=4180 [SIZES=phone,desk] [ONLY=14,15,17] node scripts/handpass/lw-night-w1-f.mjs
import * as H from './lw-night-w1-lib.mjs'
import path from 'node:path'
import { readdirSync, unlinkSync } from 'node:fs'
const { L, T, rec } = H
console.log('lw-night-w1-f v1', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null
const run = id => !ONLY || ONLY.has(String(id))
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && /^s1[457]-/.test(f) && SIZES.some(s => f.includes(`-${s}-`)) && (!ONLY || [...ONLY].some(o => f.startsWith(`s${o}-`)))) unlinkSync(path.join(L.OUT, f))
const RED = { border: /240, 85, 95/, bg: /46, 20, 24/, ink: /255, 170, 176/ }
const judge = (id, size, conds, said, pics) => {
  const bad = conds.filter(c => !c[1])
  rec(id, size, bad.length ? 'FAIL' : 'PASS', (bad.length ? 'FAILED: ' + bad.map(c => `${c[0]} (saw ${c[2]})`).join('; ') + ' — ' : '') + said, pics)
}
const redConds = (b, words) => [
  ['a bubble is up', b.where !== 'none', b.where],
  [`words "${words}"`, b.text === words, b.text],
  ['data-level red', b.level === 'red', b.level],
  ['red border / fill / words', RED.border.test(b.border || '') && RED.bg.test(b.bg || '') && RED.ink.test(b.color || ''), `${b.border} ${b.bg} ${b.color}`],
  ['box inside the screen', !!b.inside, JSON.stringify(b.rect)],
  ['not both notes', !(b.all?.mid && b.all?.foot), JSON.stringify(b.all)],
  ['no sideways page scroll', b.docOverflowX <= 0 && b.pageScrollX === 0, `overflow ${b.docOverflowX} scrollX ${b.pageScrollX}`],
]
const rowsOpen = P => P.evaluate(() => { const e = document.querySelector('[data-testid^="avail-p-"]'); return !!e && e.getBoundingClientRect().height > 0 })
const availCell = async (P, iso) => { const c = await H.rowCell(P, `avail-p-${iso}`); return c ? `${c.text} ${H.levelOf(c)}` : null }
async function f1(w, iso) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0))
  const a0 = await H.availP(w, iso)
  const req = await H.setReq(w, iso, Number(a0)); await P.waitForTimeout(300)
  const cell = await H.rowCell(P, `avail-p-${iso}`)
  if (H.levelOf(cell) !== 'ok') throw new Error(`F1 ${iso}: Available P ${cell.text} ${H.levelOf(cell)}`)
  return { a0, req, cell }
}
async function foldRows(w) { const P = w.page; await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250); if (await rowsOpen(P)) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(600) } return !(await rowsOpen(P)) }
async function openRows(w) { const P = w.page; await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250); if (!(await rowsOpen(P))) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(600) } }
const reading = async (P, iso) => { try { return await availCell(P, iso) } catch { return null } }
/* open a bid's window, press Move, then the destination (a tap/click: with its picture), and on a phone the Confirm */
async function moveFromWindow(w, who, from, to, name, { dest = null, confirm = true, cancelWith = null } = {}) {
  const P = w.page
  await L.openCellR(w, who, from); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  await L.press(w, T('decide-shift')); await P.waitForTimeout(600)
  const banner = await L.txt(P, T('move-banner'))
  const out = { banner, stage: null, seen: null, seenConfirm: null, said: null }
  if (cancelWith === 'escape') { await P.keyboard.press('Escape'); await P.waitForTimeout(500); out.after = await H.bubbleNow(P); out.bannerAfter = await L.txt(P, T('move-banner')); return out }
  if (cancelWith === 'empty') { /* an empty tap: a spot of the page that is no day — the card's title bar */ await H.tapPic(w, { x: w.phone ? 200 : 700, y: w.phone ? 12 : 6 }, name ? `${name}-empty` : null); await P.waitForTimeout(500); out.after = await H.bubbleNow(P); out.bannerAfter = await L.txt(P, T('move-banner')); return out }
  out.seen = await H.tapPic(w, T(L.cellId(dest ? dest.who : who, dest ? dest.iso : to)), name)
  await P.waitForTimeout(700)
  const st = await L.txt(P, T('move-banner'))
  out.stage = st
  if (w.phone && confirm && (await L.vis(P, T('move-confirm')))) { out.seenConfirm = await H.tapPic(w, T('move-confirm'), name ? `${name}-confirm` : null); await P.waitForTimeout(800) }
  out.said = (await L.txt(P, T('shift-problem'))) || (await L.txt(P, T('move-banner'))) || ''
  return out
}

for (const size of SIZES) {
  const phone = size === 'phone'
  const sc = async (w, id, fn) => { if (!run(id)) return; console.log(`-- S${id} [${size}]`); try { await fn() } catch (e) { rec(`S${id}`, size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500)); await H.closeAll(w).catch(() => {}); await w.page.keyboard.press('Escape').catch(() => {}) } }

  /* ============ S14: Move from the one-day window ============ */
  if (run(14)) {
    const w = await H.startWorld(size)
    const P = w.page
    const ids = await H.peopleIds(P)
    await sc(w, 14, async () => {
      const A = '2026-12-14', X = '2026-12-15', Z = '2026-12-16', F = '2026-12-17'
      const fx = await f1(w, X); const fz = await f1(w, Z)
      await H.bidType(w, ids.Hunter, X, { type: 'LL', inView: true, approve: false }); await H.dismissBubble(w)
      const r0 = await H.bidType(w, ids.Ridge, A, { type: 'LL', inView: true, approve: false }); await H.dismissBubble(w)
      if (phone) await foldRows(w)
      const ax0 = await (async () => { await openRows(w); return reading(P, X) })()
      if (phone) await foldRows(w)
      /* (1) fine day → F2 day */
      const m1 = await moveFromWindow(w, ids.Ridge, A, X, `s14-${size}-1-after-tap`)
      const b1 = await H.bubbleNow(P)
      const k1 = [(await H.kinds(w, ids.Ridge, A)).join('+'), (await H.kinds(w, ids.Ridge, X)).join('+')]
      let ax1 = await reading(P, X); if (ax1 === null) { await openRows(w); ax1 = await reading(P, X) }
      const pic1 = await H.cropPic(w, `s14-${size}-1-settled`, [T('counts-toggle'), T('manning-bubble'), T('manning-bubble-foot'), T(`avail-p-${X}`)])
      judge('S14 a bid moved from a fine day onto a red day', size, [
        ['the bid moved (14 Dec empty, 15 Dec LL)', k1[0] === '' && /^LL\|k-ll\|s-w/.test(k1[1]), JSON.stringify(k1)],
        ['Available P 15 Dec lower, still red', /red$/.test(ax1 || '') && Number((ax1 || '').split(' ')[0]) === Number((ax0 || '').split(' ')[0]) - 1, `${ax0} → ${ax1}`],
        ...redConds(b1, 'This bid takes Available P lower, still red.'),
      ], `${phone ? 'staged: "' + m1.stage + '"; ' : ''}right after the destination tap: ${H.bubbleLine(m1.seen)}${phone ? '; right after Confirm: ' + H.bubbleLine(m1.seenConfirm) : ''}; settled: ${H.bubbleLine(b1)}`, [phone ? `s14-${size}-1-after-tap-confirm.png` : `s14-${size}-1-after-tap.png`, pic1].filter(Boolean))
      await H.dismissBubble(w)
      /* (2) from one red day to a day that turns red → "turns" */
      if (phone) await foldRows(w)
      const m2 = await moveFromWindow(w, ids.Ridge, X, Z, `s14-${size}-2-after-tap`)
      const b2 = await H.bubbleNow(P)
      const k2 = [(await H.kinds(w, ids.Ridge, X)).join('+'), (await H.kinds(w, ids.Ridge, Z)).join('+')]
      await openRows(w)
      const axs = [await reading(P, X), await reading(P, Z)]
      const pic2 = await H.cropPic(w, `s14-${size}-2-settled`, [T('counts-toggle'), T('manning-bubble'), T('manning-bubble-foot'), T(`avail-p-${Z}`)])
      judge('S14 a bid moved from a red day onto a day that turns red', size, [
        ['the bid moved (15 Dec empty of Ridge, 16 Dec LL)', k2[0] === '' && /^LL\|k-ll\|s-w/.test(k2[1]), JSON.stringify(k2)],
        ['15 Dec better (27 red), 16 Dec turned red (27)', Number((axs[0] || '').split(' ')[0]) === Number(fx.a0) - 1 && axs[1] === `${Number(fz.a0) - 1} red`, JSON.stringify(axs)],
        ...redConds(b2, 'This bid turns Available P red.'),
      ], `${phone ? 'staged: "' + m2.stage + '"; ' : ''}Available P 15 Dec ${axs[0]}, 16 Dec ${axs[1]}; right after: ${H.bubbleLine(m2.seenConfirm || m2.seen)}; settled: ${H.bubbleLine(b2)}`, [phone ? `s14-${size}-2-after-tap-confirm.png` : `s14-${size}-2-after-tap.png`, pic2].filter(Boolean))
      await H.dismissBubble(w)
      /* (3) from a red day to a fine day → no bubble */
      if (phone) await foldRows(w)
      const m3 = await moveFromWindow(w, ids.Ridge, Z, F, `s14-${size}-3-after-tap`)
      const b3 = await H.bubbleNow(P)
      const k3 = [(await H.kinds(w, ids.Ridge, Z)).join('+'), (await H.kinds(w, ids.Ridge, F)).join('+')]
      judge('S14 a bid moved from a red day onto a fine day: no bubble', size, [
        ['the bid moved (16 Dec empty, 17 Dec LL) — proof the press happened', k3[0] === '' && /^LL\|k-ll\|s-w/.test(k3[1]), JSON.stringify(k3)],
        ['no bubble', b3.where === 'none' && (m3.seenConfirm || m3.seen).where === 'none', `${H.bubbleLine(b3)} / right after ${H.bubbleLine(m3.seenConfirm || m3.seen)}`],
      ], `${phone ? 'staged: "' + m3.stage + '"; ' : ''}settled: ${H.bubbleLine(b3)}`, [phone ? `s14-${size}-3-after-tap-confirm.png` : `s14-${size}-3-after-tap.png`])
      await H.dismissBubble(w)
      /* (4) refused / its own day / cancelled: no bubble, the reason said */
      const own = await moveFromWindow(w, ids.Ridge, F, F, `s14-${size}-4-own-day`)
      const bOwn = await H.bubbleNow(P)
      const ownPic = await H.settled(w, `s14-${size}-4-own-day-settled`)
      const k4 = (await H.kinds(w, ids.Ridge, F)).join('+')
      const bannerStill = await L.vis(P, T('move-banner'))
      judge('S14 a move onto its own day: no bubble, the reason said', size, [
        ['the bid is still on 17 Dec', /^LL\|k-ll\|s-w/.test(k4), k4],
        ['no bubble', bOwn.where === 'none', H.bubbleLine(bOwn)],
        ['the reason is said (words mention the day)', /already|same day|that day|own day/i.test(`${own.said} ${own.stage}`), `said "${own.said}" stage "${own.stage}"`],
      ], `after the tap on its own day: banner/said "${own.said}" (stage "${own.stage}"); banner still up ${bannerStill}`, [`s14-${size}-4-own-day.png`, ownPic])
      if (bannerStill) { await L.press(w, T('move-cancel')); await P.waitForTimeout(400) }
      // cancelled by an empty tap
      const em = await moveFromWindow(w, ids.Ridge, F, F, `s14-${size}-4-cancel`, { cancelWith: 'empty' })
      const kE = (await H.kinds(w, ids.Ridge, F)).join('+')
      judge('S14 a move cancelled by an empty tap: no bubble', size, [
        ['the banner went (the move is cancelled)', !em.bannerAfter, `banner after "${em.bannerAfter}"`],
        ['no bubble', em.after.where === 'none', H.bubbleLine(em.after)],
        ['the bid still on 17 Dec', /^LL\|k-ll\|s-w/.test(kE), kE],
      ], `after an empty tap: banner "${em.bannerAfter}"; ${H.bubbleLine(em.after)}`, [`s14-${size}-4-cancel-empty.png`])
      if (await L.vis(P, T('move-banner'))) { await L.press(w, T('move-cancel')); await P.waitForTimeout(400) }
      // cancelled by Escape
      const es = await moveFromWindow(w, ids.Ridge, F, F, null, { cancelWith: 'escape' })
      const pe = await H.settled(w, `s14-${size}-4-escape`)
      const kEs = (await H.kinds(w, ids.Ridge, F)).join('+')
      judge('S14 a move cancelled by Escape: no bubble', size, [
        ['the banner went', !es.bannerAfter, `banner after "${es.bannerAfter}"`],
        ['no bubble', es.after.where === 'none', H.bubbleLine(es.after)],
        ['the bid still on 17 Dec', /^LL\|k-ll\|s-w/.test(kEs), kEs],
      ], `after Escape: banner "${es.bannerAfter}"; ${H.bubbleLine(es.after)}`, [pe])
      if (await L.vis(P, T('move-banner'))) { await L.press(w, T('move-cancel')); await P.waitForTimeout(400) }
      // refused: a day where he already holds an OD (filed through the window), moving a bid onto it
      const od = await H.fileKind(w, ids.Ridge, '2026-12-18', 'OD', { inView: true }); await H.dismissBubble(w)
      const rf = await moveFromWindow(w, ids.Ridge, F, '2026-12-18', `s14-${size}-4-refused`)
      const bRf = await H.bubbleNow(P)
      const kRf = [(await H.kinds(w, ids.Ridge, F)).join('+'), (await H.kinds(w, ids.Ridge, '2026-12-18')).join('+')]
      const rfPic = await H.settled(w, `s14-${size}-4-refused-settled`)
      rec('S14 a move onto a day he already holds an OD (the refusal case)', size, bRf.where === 'none' ? 'PASS' : 'FAIL', `cells 17 Dec / 18 Dec: ${JSON.stringify(kRf)}; the words the screen gave: banner/problem "${rf.said}" (stage "${rf.stage}"); bubble ${H.bubbleLine(bRf)}. ${/OD/.test(kRf[1]) && /LL/.test(kRf[1]) ? 'The bid WAS moved onto the OD day (no refusal arose).' : 'The bid stayed on 17 Dec (refused) — reason: "' + rf.said + '".'}`, [`s14-${size}-4-refused.png`, rfPic])
      if (await L.vis(P, T('move-banner'))) { await L.press(w, T('move-cancel')); await P.waitForTimeout(400) }
    })
    rec('errors-14', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
    await w.ctx.close()
  }

  /* ============ S15: Move from the drag window ============ */
  if (run(15)) {
    if (!phone) {
      /* admin, desktop: a man's three pending days → Move → a week later onto red days */
      const w = await H.startWorld('desk')
      const P = w.page
      const ids = await H.peopleIds(P)
      await sc(w, 15, async () => {
        const days = ['2026-12-07', '2026-12-08', '2026-12-09'], land = ['2026-12-14', '2026-12-15', '2026-12-16']
        const f = []; for (const d of land) f.push(await f1(w, d))
        if (!(await H.dragCells(w, [ids.Piston, days[0]], [ids.Piston, days[2]]))) throw new Error('no drag window for the fixture')
        await H.setSwitch(w, false, 'sel')
        const rs = await H.selPress(w, T('sel-LL'), null, { ask: 'ask-then-go' }); await H.dismissBubble(w)
        const k0 = []; for (const d of days) k0.push((await H.kinds(w, ids.Piston, d)).join('+'))
        if (!k0.every(x => /^LL\|k-ll\|s-w/.test(x))) throw new Error('fixture: ' + JSON.stringify(k0))
        await P.evaluate(() => window.scrollTo(0, 0))
        if (!(await H.dragCells(w, [ids.Piston, days[0]], [ids.Piston, days[2]]))) throw new Error('no drag window')
        await L.press(w, T('sel-move')); await P.waitForTimeout(600)
        const banner = await L.txt(P, T('move-banner'))
        const seen = await H.tapPic(w, T(L.cellId(ids.Piston, land[0])), `s15-desk-after-tap`)
        await P.waitForTimeout(700)
        const b = await H.bubbleNow(P)
        const k1 = []; for (const d of land) k1.push((await H.kinds(w, ids.Piston, d)).join('+'))
        const k2 = []; for (const d of days) k2.push((await H.kinds(w, ids.Piston, d)).join('+'))
        const av = []; for (const d of land) av.push(await availCell(P, d))
        const pic = await H.cropPic(w, `s15-desk-settled`, [T('counts-toggle'), T('manning-bubble'), T('manning-bubble-foot'), T(`avail-p-${land[0]}`), T(`avail-p-${land[2]}`)])
        judge('S15 admin: three pending days moved a week later onto three F1 days', 'desk', [
          ['the three bids landed on 14–16 Dec and left 7–9 Dec', k1.every(x => /^LL\|k-ll\|s-w/.test(x)) && k2.every(x => x === ''), `landed ${JSON.stringify(k1)} left ${JSON.stringify(k2)}`],
          ['each landing day turned red', av.every((a, i) => a === `${Number(f[i].a0) - 1} red`), JSON.stringify(av)],
          ...redConds(b, 'This bid turns Available P red.'),
          ['names the row once', (b.text.match(/Available P/g) || []).length === 1, b.text],
        ], `banner "${banner}"; right after the tap: ${H.bubbleLine(seen)}; settled: ${H.bubbleLine(b)}`, [`s15-desk-after-tap.png`, pic].filter(Boolean))
      })
      rec('errors-15-desk', 'desk', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
      await w.ctx.close()
    } else {
      /* Ranger, phone: his own pending run, held and dragged → Move → onto a red open day */
      const w = await L.newCtx('phone')
      const P = w.page
      await L.signInPlain(w, 'admin'); await H.hideTransient(P)
      const ids = await H.peopleIds(P)
      const me = ids.Ranger
      await sc(w, 15, async () => {
        const days = ['2026-12-07', '2026-12-08', '2026-12-09'], land = ['2026-12-21', '2026-12-22', '2026-12-23']
        const f = []; for (const d of land) f.push(await f1(w, d))
        if (!(await H.dragCells(w, [me, days[0]], [me, days[2]]))) throw new Error('no drag window for the fixture')
        await H.setSwitch(w, false, 'sel')
        await H.selPress(w, T('sel-LL'), null, { ask: 'ask-then-go' }); await H.dismissBubble(w)
        const k0 = []; for (const d of days) k0.push((await H.kinds(w, me, d)).join('+'))
        if (!k0.every(x => /^LL\|k-ll\|s-w/.test(x))) throw new Error('fixture: ' + JSON.stringify(k0))
        await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
        await L.press(w, T('open-chip')); await P.waitForSelector(T('open-dates'))
        if ((await P.locator(T('od-month-2026-12')).getAttribute('aria-pressed')) !== 'true') { await L.press(w, T('od-month-2026-12')); await P.waitForTimeout(500) }
        await L.press(w, T('open-dates-close')); await P.waitForTimeout(300)
        await P.evaluate(() => window.scrollTo(0, 0))
        const sy = await (async () => { if (await L.vis(P, '#logout')) { await P.click('#logout') } else { await P.click('#burger'); await P.waitForTimeout(300); await P.click('#drawerLogout') } await P.waitForSelector('#luser') })()
        await P.fill('#luser', 'us'); await P.fill('#lpass', 'us'); await P.click('#loginForm button[type=submit]'); await P.waitForSelector('#vWeek .day')
        await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="row-bane"]'); await P.waitForTimeout(900); await H.hideTransient(P)
        const k0m = []; for (const d of days) k0m.push((await H.kinds(w, 'bane', d)).join('+'))
        if (!k0m.every(x => /^LL\|k-ll\|s-w/.test(x))) throw new Error('as the member: his run is not there: ' + JSON.stringify(k0m))
        if (!(await H.dragCells(w, ['bane', days[0]], ['bane', days[2]]))) throw new Error('no drag window for the member')
        await H.setManningView(w, true)
        await L.press(w, T('sel-move')); await P.waitForTimeout(700)
        const banner = await L.txt(P, T('move-banner'))
        const seen = await H.tapPic(w, T(L.cellId('bane', land[0])), `s15-phone-after-tap`)
        await P.waitForTimeout(700)
        const stage = await L.txt(P, T('move-banner'))
        let seenC = null
        if (await L.vis(P, T('move-confirm'))) { seenC = await H.tapPic(w, T('move-confirm'), `s15-phone-after-tap-confirm`); await P.waitForTimeout(800) }
        const b = await H.bubbleNow(P)
        const k1 = []; for (const d of land) k1.push((await H.kinds(w, 'bane', d)).join('+'))
        const k2 = []; for (const d of days) k2.push((await H.kinds(w, 'bane', d)).join('+'))
        const pic = await H.cropPic(w, `s15-phone-settled`, [T('counts-toggle'), T('manning-bubble'), T('manning-bubble-foot')])
        const whole = await H.settled(w, `s15-phone-settled-full`)
        judge('S15 Ranger on his phone: his own run held, dragged, moved onto red open days', 'phone', [
          ['his three bids landed on 21–23 Dec and left 7–9 Dec', k1.every(x => /^LL\|k-ll\|s-w/.test(x)) && k2.every(x => x === ''), `landed ${JSON.stringify(k1)} left ${JSON.stringify(k2)}`],
          ...redConds(b, 'This bid turns Available P red.'),
        ], `banner "${banner}", staged "${stage}"; right after the destination tap: ${H.bubbleLine(seen)}; right after Confirm: ${H.bubbleLine(seenC)}; settled: ${H.bubbleLine(b)}`, [`s15-phone-after-tap.png`, `s15-phone-after-tap-confirm.png`, pic, whole].filter(Boolean))
        /* a refused move: his bid carried onto a day closed for him (3 Nov) — the reason said, no bubble */
        await H.dismissBubble(w)
        await P.evaluate(() => window.scrollTo(0, 0))
        await L.openCellR(w, 'bane', land[0]); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
        await L.press(w, T('decide-shift')); await P.waitForTimeout(600)
        await L.gotoMonth(w, 'NOV')
        const closedDay = '2026-11-03'
        await L.reachCell(w, 'bane', closedDay)
        const sR = await H.tapPic(w, T(L.cellId('bane', closedDay)), `s15-phone-refused-after-tap`)
        await P.waitForTimeout(700)
        let sRC = null
        if (await L.vis(P, T('move-confirm'))) { sRC = await H.tapPic(w, T('move-confirm'), `s15-phone-refused-after-tap-confirm`); await P.waitForTimeout(800) }
        const said = (await L.txt(P, T('shift-problem'))) || (await L.txt(P, T('move-banner'))) || ''
        const bR = await H.bubbleNow(P)
        const kR = [(await H.kinds(w, 'bane', closedDay)).join('+')]
        const picR = await H.settled(w, `s15-phone-refused-settled`)
        judge('S15 Ranger: a move onto a day closed for him is refused, no bubble', 'phone', [
          ['the bid did not land on the closed day', kR[0] === '', JSON.stringify(kR)],
          ['no bubble', bR.where === 'none' && sR.where === 'none' && (!sRC || sRC.where === 'none'), `${H.bubbleLine(bR)}`],
          ['a reason is said', said.length > 0 && /closed|open|not|cannot|can.t/i.test(said), `"${said}"`],
        ], `the screen said: "${said}"; staged after the tap: ${await L.txt(P, T('move-banner'))}`, [`s15-phone-refused-after-tap.png`, picR])
        if (await L.vis(P, T('move-banner'))) { await L.press(w, T('move-cancel')); await P.waitForTimeout(400) }
      })
      rec('errors-15-phone', 'phone', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
      await w.ctx.close()
    }
  }

  /* ============ S17: a long range on a phone ============ */
  if (run(17)) {
    const w = await H.startWorld(size)
    const P = w.page
    const ids = await H.peopleIds(P)
    await sc(w, 17, async () => {
      const far = '2026-12-16'
      const f = await f1(w, far)
      // back to today's month, the Manning rows folded (a phone's start)
      await L.gotoMonth(w, 'OCT'); await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
      if (phone) await foldRows(w)
      const lit = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="month-"]')].filter(e => e.getAttribute('aria-pressed') === 'true' || /\bon\b|active|sel/.test(e.className)).map(e => e.dataset.testid))
      const start = '2026-10-26'
      await L.reachCell(w, ids.Ridge, start)
      await L.openCellR(w, ids.Ridge, start); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
      await H.setSwitch(w, false)
      await L.press(w, T('span-range')); await P.waitForTimeout(400)
      for (const d of [start, far]) {
        for (let i = 0; i < 12 && !(await L.vis(P, T('span-day-' + d))); i++) { await L.press(w, T('span-next')); await P.waitForTimeout(250) }
        await L.press(w, T('span-day-' + d)); await P.waitForTimeout(250)
      }
      const sel = await L.txt(P, T('span-selection'))
      await H.setManningView(w, true)
      let seen = await H.tapPic(w, T('bid-LL'), `s17-${size}-ask-tap`)
      await P.waitForTimeout(700)
      let askNote = null
      if (await L.vis(P, T('bid-picker'))) { askNote = (await L.sheetDump(P))?.text?.match(/That takes[^|]*/)?.[0] || null; seen = await H.tapPic(w, T('bid-LL'), `s17-${size}-after-tap`); await P.waitForTimeout(900) }
      const b = await H.bubbleNow(P)
      const k = await H.kinds(w, ids.Ridge, far)
      const k0 = await H.kinds(w, ids.Ridge, start).catch(() => [])
      let a = await reading(P, far); if (a === null) { await openRows(w); a = await reading(P, far) }
      const pic = await H.cropPic(w, `s17-${size}-settled`, [T('counts-toggle'), T('manning-bubble'), T('manning-bubble-foot')])
      const whole = await H.settled(w, `s17-${size}-settled-full`)
      judge(`S17 a long range ${sel} over the red day ${far}`, size, [
        ['the range was LL-written (first and last day)', /^LL\|k-ll\|s-w/.test(k[0] || '') && /^LL/.test((k0[0] || '')), `${far}: ${JSON.stringify(k)} ${start}: ${JSON.stringify(k0)}`],
        ['16 Dec turned red', a === `${Number(f.a0) - 1} red`, `${f.a0} → ${a}`],
        ...redConds(b, 'This bid turns Available P red.'),
      ], `month lit at the start: ${JSON.stringify(lit)}; range "${sel}"; ask "${askNote}"; Available P 16 Dec ${f.a0} → ${a}; right after: ${H.bubbleLine(seen)}; settled: ${H.bubbleLine(b)}`, [`s17-${size}-after-tap.png`, pic, whole].filter(Boolean))
      await H.dismissBubble(w)
      if (phone) {
        /* a farther gap: the month on screen is Aug; the red day is 16 Dec, four months ahead */
        const far2 = '2026-12-17'
        const f2 = await f1(w, far2)
        await L.gotoMonth(w, 'AUG'); await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
        await foldRows(w)
        const s2 = '2026-08-03'
        await L.reachCell(w, ids.Reaper, s2)
        await L.openCellR(w, ids.Reaper, s2); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
        await H.setSwitch(w, false)
        await L.press(w, T('span-range')); await P.waitForTimeout(400)
        for (const d of [s2, far2]) {
          for (let i = 0; i < 14 && !(await L.vis(P, T('span-day-' + d))); i++) { await L.press(w, T('span-next')); await P.waitForTimeout(250) }
          await L.press(w, T('span-day-' + d)); await P.waitForTimeout(250)
        }
        const sel2 = await L.txt(P, T('span-selection'))
        await H.setManningView(w, true)
        let seen2 = await H.tapPic(w, T('bid-LL'), `s17-${size}-aug-ask-tap`)
        await P.waitForTimeout(700)
        if (await L.vis(P, T('bid-picker'))) seen2 = await H.tapPic(w, T('bid-LL'), `s17-${size}-aug-after-tap`)
        await P.waitForTimeout(900)
        const b2 = await H.bubbleNow(P)
        let a2 = await reading(P, far2); if (a2 === null) { await openRows(w); a2 = await reading(P, far2) }
        const k2 = await H.kinds(w, ids.Reaper, far2)
        const pic2 = await H.cropPic(w, `s17-${size}-aug-settled`, [T('counts-toggle'), T('manning-bubble'), T('manning-bubble-foot')])
        judge(`S17b the same from August: ${sel2} over the red day ${far2} (four months ahead)`, size, [
          ['LL written on the far day', /^LL\|k-ll\|s-w/.test(k2[0] || ''), JSON.stringify(k2)],
          ['the far day turned red', a2 === `${Number(f2.a0) - 1} red`, `${f2.a0} → ${a2}`],
          ...redConds(b2, 'This bid turns Available P red.'),
        ], `right after: ${H.bubbleLine(seen2)}; settled: ${H.bubbleLine(b2)}`, [`s17-${size}-aug-after-tap.png`, pic2].filter(Boolean))
      }
    })
    rec('errors-17', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
    await w.ctx.close()
  }
}
await L.closeBrowser()
H.saveResults(`f-${SIZES.join('-')}${ONLY ? '-' + [...ONLY].join('') : ''}`)
const R = H.results, c = r => R.filter(x => x.verdict === r).length
console.log('DONE', R.length, 'records:', c('PASS'), 'PASS', c('FAIL'), 'FAIL', c('RECORD'), 'RECORD', c('NOT DONE'), 'NOT DONE')
