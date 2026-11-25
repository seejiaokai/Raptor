// asp-w1-s5 — S5 (Hex's briefing taken off a published Saturday; "+ SANS" both ways before amending) with S7 (the
// count opened from View-only Sched, the plans menu's look at the published version, and the Scheduler Board while that
// change waits), then S5's second run (the briefing put back by the board's Undo, in a fresh world).
// Run from raptor-port/:  ONLY=d|p  PART=a|b  node scripts/handpass/asp-w1-s5.mjs
import * as L from './asp-w1-lib.mjs'
const { sleep, J, HEX, SAT, SAT_ISO, B } = L
const VERSION = 'asp-w1-s5 v1'
const ONLY = (process.env.ONLY || 'd,p').split(',')
const PART = (process.env.PART || 'a,b').split(',')
console.log(VERSION, L.URL_, ONLY.join(','), PART.join(','))

async function delBriefing(p, W, ri) {
  const n0 = await p.evaluate(i => window.DAYS[i].ground.length, SAT)
  await W.press(p, B(`[data-grdel="${SAT}.${ri}"]`), 'grdel')
  await sleep(500)
  const n1 = await p.evaluate(i => window.DAYS[i].ground.length, SAT)
  const left = await p.evaluate(([i, id]) => window.DAYS[i].ground.some(r => r.who === id || (r.more || []).includes(id)), [SAT, HEX])
  return { n0, n1, left }
}

async function partA(k) {
  const sz = L.SIZES[k], RUN = 's5-' + sz.name
  L.clearRun(RUN)
  const W = L.mk(RUN, 's5', sz)
  const { b, p } = await L.world(sz, W)
  try {
    await L.signIn(p, 'ad', 'a')
    W.rec('premise', 'the app\'s today', null, await L.today(p))
    const F = await L.publishedFixture(p, W)
    /* take the briefing off: its row's ✕ on the board */
    await L.openBoard(p, W, SAT)
    const d = await delBriefing(p, W, F.brRi)
    const pe = await L.pendingOf(p, SAT)
    W.rec('s5-01', 'board: the BRIEFING row\'s ✕ — Hex named on nothing; the day reads pending and its sign-offs fall', d.n1 === d.n0 - 1 && !d.left && pe.pend >= 1 && pe.notSigned, `${J(d)} · ${J(pe)}`, await W.pic(p, '01-briefing-off'))
    /* S7 (board) — the working copy's crowd */
    const o1 = await L.openChip(p, W, '#schedBoard', SAT, F.evRi)
    W.rec('s5-02', 'board (working copy): the window no longer lists Hex', o1.win.has === false && typeof o1.win.n === 'number', `chip ${J(o1.chip)} · window ${J(o1.win)} · published n ${F.base.n}`, await W.pic(p, '02-board-window-working'))
    W.rec('s7-01', 'S7 — the Scheduler Board shows the working copy\'s crowd (Hex out, one fewer)', o1.win.has === false && o1.win.n === F.base.n - 1, `n ${o1.win.n} vs published ${F.base.n}`, await W.pic(p, '02b-board-window-working'))
    await L.closeWin(p, W)
    /* S7 — the plans menu's look at the published version (the line eye) */
    await W.press(p, B(`[data-planmenu="${SAT}"]`), 'planmenu')
    const pvs = await p.evaluate(() => [...document.querySelectorAll('[data-planpv]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.planpv + '=' + e.innerText.replace(/\s+/g, ' ')))
    const menuPic = await W.pic(p, '03-plans-menu')
    let o2 = { win: 'no published version in the menu', chip: null }
    if (pvs.length) {
      await W.press(p, p.locator('[data-planpv]').filter({ visible: true }).last(), 'planpv'); await sleep(700)
      o2 = await L.openChip(p, W, '#schedBoard', SAT, F.evRi)
    }
    W.rec('s7-02', 'S7 — the board\'s look at the published version (plans menu → the issued version): the window lists Hex, the published count', o2.win.has === true && o2.win.n === F.base.n, `menu ${J(pvs)} · chip ${J(o2.chip)} · window ${J(o2.win)}`, menuPic + ', ' + await W.pic(p, '04-look-published-window'))
    if (o2.chip) await L.closeWin(p, W)
    const live = p.locator(B(`[data-planmenu="${SAT}"]`)).first()
    if (await live.count()) { await W.press(p, live, 'planmenu2'); const gl = p.locator(`[data-plangolive="${SAT}"]:visible`).first(); if (await gl.count()) await W.press(p, gl, 'golive'); else await p.keyboard.press('Escape') }
    await sleep(400)
    W.rec('s7-02b', 'back to the live working copy', null, ((await p.locator(B(`[data-planmenu="${SAT}"]`)).first().innerText().catch(() => '')) || '').trim(), await W.pic(p, '05-back-live'))
    await L.closeBoard(p, W)
    /* S7 — View-only Sched */
    await L.go(p, 'viewsched'); await sleep(500)
    await p.locator(`#vWeek section.day[data-day="${SAT}"]`).first().evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })).catch(() => {}); await sleep(400)
    const o3 = await L.openChip(p, W, '#vWeek', SAT, F.evRi)
    W.rec('s7-03', 'S7 — View-only Sched (the published face): the window lists Hex, the published count', o3.win.has === true && o3.win.n === F.base.n, `chip ${J(o3.chip)} · window ${J(o3.win)}`, await W.pic(p, '06-viewsched-window'))
    if (o3.chip) await L.closeWin(p, W)
    /* S5 — "+ SANS" both ways before amending */
    for (const [i, on] of [[1, true], [2, false]]) {
      const s = await L.sansOnWar(p, W, on, `07-${i}-sans-${on ? 'on' : 'off'}`)
      const lw = (await L.lwCell(p, W, HEX, SAT_ISO)).text
      const lwPic = await W.pic(p, `07-${i}-lw-cell`)
      const S = await L.satLook(p, W, `08-${i}-${on ? 'on' : 'off'}`, F.evRi)
      W.rec(`s5-0${2 + i}`, `"+ SANS" ${on ? 'on' : 'off'}: the working crowd has no Hex, the day still pending with sign-offs down, the Leave War cell still FO`, s.groupAfter === on && S.win.has === false && S.pe.pend >= 1 && S.pe.notSigned && /^FO/.test(lw), `${J({ did: s.did, group: s.groupAfter })} · pending ${S.pe.pend} "${S.pe.head}" notYetSigned ${S.pe.notSigned} · chip ${J(S.chip)} · window ${J(S.win)} · cell "${lw}"`, [s.pic, lwPic, S.picDay, S.picWin].join(', '))
    }
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 500), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 10).join(' || '))
  await b.close()
}

async function partB(k) {
  const sz = L.SIZES[k], RUN = 's5b-' + sz.name
  L.clearRun(RUN)
  const W = L.mk(RUN, 's5b', sz)
  const { b, p } = await L.world(sz, W)
  try {
    await L.signIn(p, 'ad', 'a')
    const F = await L.publishedFixture(p, W)
    await L.openBoard(p, W, SAT)
    const pe0 = await L.pendingOf(p, SAT)
    const d = await delBriefing(p, W, F.brRi)
    const pe1 = await L.pendingOf(p, SAT)
    W.rec('s5b-01', 'board: the BRIEFING row taken off — pending, sign-offs fall', pe1.pend >= 1 && pe1.notSigned, `before ${J(pe0)} · ${J(d)} · after ${J(pe1)}`, await W.pic(p, '01-off'))
    await W.press(p, '#sbUndo:visible', 'undo'); await sleep(800)
    const pe2 = await L.pendingOf(p, SAT)
    const back = await p.evaluate(([i, id]) => window.DAYS[i].ground.some(r => r.who === id), [SAT, HEX])
    const signBoxes = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-sign select[data-sign]')].filter(e => e.getBoundingClientRect().width > 0).map(s => s.dataset.sign + '=' + (s.options[s.selectedIndex] || {}).text))
    const o = await L.openChip(p, W, '#schedBoard', SAT, F.evRi)
    W.rec('s5b-02', 'RECORD — the board\'s Undo puts the briefing back: what the day and the sign-offs say', null, `briefing back ${back} · ${J(pe2)} · sign boxes ${J(signBoxes)} · chip ${J(o.chip)} · window Hex ${o.win.has} n ${o.win.n}`, await W.pic(p, '02-put-back'))
    if (o.chip) await L.closeWin(p, W)
    await L.closeBoard(p, W)
    const S = await L.satLook(p, W, '03-editsched', F.evRi)
    W.rec('s5b-03', 'RECORD — Edit Schedule\'s Saturday after the put-back', null, `${J(S.pe)} · window Hex ${S.win.has} n ${S.win.n}`, S.picDay + ', ' + S.picWin)
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 500), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 10).join(' || '))
  await b.close()
}

for (const k of ONLY) { if (PART.includes('a')) await partA(k); if (PART.includes('b')) await partB(k) }
L.saveResults('s5-' + ONLY.join('_') + '-' + PART.join(''))
console.log('done')
