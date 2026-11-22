// asp-w1-s1 — S1, then S16 (reload), S17 (sign out and in), S20 (the member) on the same published world.
// Run from raptor-port/:  ONLY=d|p node scripts/handpass/asp-w1-s1.mjs
import * as L from './asp-w1-lib.mjs'
const { sleep, J, HEX, SAT, SAT_ISO, B } = L
const VERSION = 'asp-w1-s1 v5'
const ONLY = (process.env.ONLY || 'd,p').split(',')
console.log(VERSION, L.URL_, ONLY.join(','))

/* the published-day judge used after Publish and every later step */
function judgeSat(W, id, what, S, base, lw) {
  const w = S.win || {}
  const ok = S.pe.pend === 0 && !S.pe.notSigned && /SIGNED/i.test(S.pe.signed) && w.has === true && (!base || (w.n === base.n && S.chip && S.chip.txt === base.chipTxt)) && (!lw || /^FO/.test(lw))
  W.rec(id, what, ok, `pending ${S.pe.pend} "${S.pe.pendWords}" · notYetSigned ${S.pe.notSigned} · signed "${S.pe.signed.slice(0, 80)}" · chip "${S.chip && S.chip.txt}" · window n ${w.n} Hex ${w.has} purple ${w.san} col "${w.col}"${lw ? ` · LW cell "${lw}"` : ''}${base ? ` · base n ${base.n} chip ${base.chipTxt}` : ''}`, S.picDay + ', ' + S.picWin)
}

async function run(k) {
  const sz = L.SIZES[k], RUN = 's1-' + sz.name
  L.clearRun(RUN)
  const W = L.mk(RUN, 's1', sz)
  const { b, p } = await L.world(sz, W)
  try {
    await L.signIn(p, 'ad', 'a')
    const man = await p.evaluate(id => { const q = window.PEOPLE[id]; return { cs: q.cs, seat: q.seat, san: !!q.san } }, HEX)
    W.rec('premise', 'Hex and the app\'s today', man.cs === 'Hex' && !man.san, `${J(man)} · today ${await L.today(p)} · week ${await L.weekOf(p)}`)
    /* 1. the fixture on Sat 18 Jul */
    await L.openBoard(p, W, SAT)
    const ev = await L.eventRow(p, W, SAT)
    W.rec('s1-01', 'Sat: Common Programme SQN EVENT 10:00–17:00 for ALL AVAIL (+ Item, typed, tapped)', /10:?00/.test(ev.row.str) && /17:?00/.test(ev.row.end) && J(ev.row.who).includes('allavail'), J(ev.row), await W.pic(p, '01-event-row'))
    const br = await L.briefingRow(p, W, SAT, HEX)
    W.rec('s1-02', 'Sat: Ground Programme BRIEFING 08:00–09:00 naming Hex', br.row && br.row.who === HEX && /08:?00/.test(br.row.str) && /09:?00/.test(br.row.end), J(br.row), await W.pic(p, '02-briefing-row'))
    await L.closeBoard(p, W)
    /* 2. posting out as SANS from today, Wed 15 Jul */
    W.rec('s1-03a', 'the app\'s today before the posting', null, await L.today(p))
    const po = await L.postOutSans(p, W, HEX, '2026-07-15', '03')
    W.rec('s1-03', 'Hex posted out as SANS from Wed 15 Jul (his cell → ⋯ → Post out → SANS → Post out)', po.after.san === true, `line "${po.line}" · ${J(po.after)}`, po.pic)
    const g0 = await p.locator('tr[data-testid="group-SANS"]').count()
    W.rec('s1-04', '"+ SANS" is off the Leave War (no SANS group on the grid)', g0 === 0, `SANS group rows ${g0}`, await W.pic(p, '04-lw-no-sans-group'))
    /* 3. before Publish: the board's count, the window, OIL Earn */
    await L.openBoard(p, W, SAT)
    const o1 = await L.openChip(p, W, '#schedBoard', SAT, ev.ri)
    const pic5 = await W.pic(p, '05-board-availwin')
    W.rec('s1-05', 'before Publish, board: the count chip and the ALL AVAIL window list Hex with his purple SANS line', o1.win.has === true && o1.win.san === true && o1.win.n === Number(o1.chip && o1.chip.txt), `chip ${J(o1.chip)} · window ${J(o1.win)} · all chips ${J(o1.chips)}`, pic5)
    await L.closeWin(p, W)
    W.rec('s1-05b', 'the window closed by its ✕', (await p.locator('.availwin:visible').count()) === 0, '', await W.pic(p, '05b-win-closed'))
    const om = await L.oilEarn(p, W, true)
    const o2 = await L.openChip(p, W, '#schedBoard', SAT, ev.ri)
    const pic6 = await W.pic(p, '06-oilearn-window')
    W.rec('s1-06', `OIL Earn on (${om}): the window's earning half has Hex earning`, o2.win.has === true && o2.win.earnSeat === 'on', `chip ${J(o2.chip)} · window ${J(o2.win)}`, pic6)
    await L.closeWin(p, W)
    W.rec('s1-06b', 'OIL Earn turned off again', null, await L.oilEarn(p, W, false))
    /* 4. the four sign-offs and Publish */
    await L.signAll(p)
    const pt = await L.publish(p, W, SAT)
    const pe7 = await L.pendingOf(p, SAT)
    W.rec('s1-07', `four sign-offs and Publish (${pt})`, pe7.pend === 0 && /SIGNED/i.test(pe7.signed), J(pe7), await W.pic(p, '07-published'))
    const o3 = await L.openChip(p, W, '#schedBoard', SAT, ev.ri)
    W.rec('s1-08', 'after Publish, board: the window still lists Hex', o3.win.has === true, `chip ${J(o3.chip)} · window ${J(o3.win)}`, await W.pic(p, '08-board-availwin-published'))
    await L.closeWin(p, W)
    await L.closeBoard(p, W)
    const base = { n: o3.win.n, chipTxt: o3.chip && o3.chip.txt }
    /* 5. the Leave War cell */
    const lw1 = await L.lwCell(p, W, HEX, SAT_ISO)
    W.rec('s1-09', 'Leave War: Hex\'s Sat 18 Jul reads FO after Publish', /^FO/.test(lw1.text), `cell "${lw1.text}"`, await W.pic(p, '09-lw-fo'))
    /* 6. the Saturday from Edit Schedule, "+ SANS" off */
    const A = await L.satLook(p, W, '10-off', ev.ri)
    judgeSat(W, 's1-10', 'Edit Schedule, "+ SANS" off: nothing pending, signed, same count and Hex in', A, base)
    /* 7. "+ SANS" on */
    const on1 = await L.sansOnWar(p, W, true, '11-on')
    const lwOn = await L.lwCell(p, W, HEX, SAT_ISO)
    const picLwOn = await W.pic(p, '11-lw-cell-sans-on')
    W.rec('s1-11', '"+ SANS" on in ⚙ Settings: SANS group on the grid, Hex\'s Sat cell', on1.groupAfter && /^FO/.test(lwOn.text), `${J({ did: on1.did, before: on1.groupBefore, after: on1.groupAfter })} · cell "${lwOn.text}"`, on1.pic + ', ' + picLwOn)
    const Bn = await L.satLook(p, W, '12-on', ev.ri)
    judgeSat(W, 's1-12', 'Edit Schedule, "+ SANS" on: nothing pending, signed, same count and Hex in', Bn, base)
    /* 8. "+ SANS" off again */
    const off1 = await L.sansOnWar(p, W, false, '13-off')
    const lwOff = await L.lwCell(p, W, HEX, SAT_ISO)
    W.rec('s1-13', '"+ SANS" off again (the SANS group\'s ✕): Hex\'s Sat cell', !off1.groupAfter && /^FO/.test(lwOff.text), `${J({ did: off1.did, after: off1.groupAfter })} · cell "${lwOff.text}"`, off1.pic + ', ' + await W.pic(p, '13-lw-cell-sans-off'))
    const C = await L.satLook(p, W, '14-off', ev.ri)
    judgeSat(W, 's1-14', 'Edit Schedule, "+ SANS" off again: nothing pending, signed, same count and Hex in', C, base)
    /* 9. another week and back (the board's › from Sunday, ‹ from Monday), with "+ SANS" turned on while away */
    await L.openBoard(p, W, 6)
    const nx = await L.boardStep(p, W, 1)
    await L.closeBoard(p, W)
    const onAway = await L.sansOnWar(p, W, true, '15-on-away')
    await L.go(p, 'editsched'); await L.openBoard(p, W, 0)
    const bk = await L.boardStep(p, W, -1)
    await L.closeBoard(p, W)
    W.rec('s1-15', 'to the next week, "+ SANS" turned on there, and back', nx.week.startsWith('Jul 20') && bk.week.startsWith('Jul 13') && onAway.groupAfter, `${nx.week.slice(0, 6)} → ${bk.week.slice(0, 6)} · ${J({ did: onAway.did, after: onAway.groupAfter })}`, onAway.pic)
    const D = await L.satLook(p, W, '16-back-on', ev.ri)
    const lw16 = (await L.lwCell(p, W, HEX, SAT_ISO)).text
    judgeSat(W, 's1-16', 'back on the demo week, "+ SANS" on: nothing pending, signed, same count, Hex in, cell FO', D, base, lw16)
    const off2 = await L.sansOnWar(p, W, false, '17-off')
    const E = await L.satLook(p, W, '17-back-off', ev.ri)
    const lw17 = (await L.lwCell(p, W, HEX, SAT_ISO)).text
    judgeSat(W, 's1-17', '"+ SANS" off again: nothing pending, signed, same count, Hex in, cell FO', E, base, lw17)
    W.rec('s1-17b', 'the Leave War cell, last', null, lw17, await W.pic(p, '17b-lw-cell'))

    /* ---- S16: reload with "+ SANS" off, then with it on ---- */
    const W16 = L.mk(RUN, 's16', sz); W16.errs = W.errs
    await L.reloadIn(p)
    const R1 = await L.satLook(p, W16, '01-reload-off', ev.ri)
    const lwR1 = (await L.lwCell(p, W16, HEX, SAT_ISO)).text
    judgeSat(W16, 's16-01', 'reloaded with "+ SANS" off: nothing pending, same count and people, cell FO', R1, base, lwR1)
    W16.rec('s16-01b', 'the Leave War after the reload', null, `SANS group rows ${await p.locator('tr[data-testid="group-SANS"]').count()}`, await W16.pic(p, '01b-lw'))
    const on3 = await L.sansOnWar(p, W16, true, '02-on')
    await L.reloadIn(p)
    await L.go(p, 'leavewar'); await sleep(600)
    const keptOn = await p.locator('tr[data-testid="group-SANS"]').count()
    W16.rec('s16-02', '"+ SANS" on, reloaded: the SANS group is still on the war', keptOn > 0 && on3.groupAfter, `group rows after reload ${keptOn}`, await W16.pic(p, '02-lw-after-reload'))
    const R2 = await L.satLook(p, W16, '03-reload-on', ev.ri)
    const lwR2 = (await L.lwCell(p, W16, HEX, SAT_ISO)).text
    judgeSat(W16, 's16-03', 'reloaded with "+ SANS" on: nothing pending, same count and people, cell FO', R2, base, lwR2)

    /* ---- S17: sign out, sign in as ad again ---- */
    const W17 = L.mk(RUN, 's17', sz); W17.errs = W.errs
    await L.signOut(p, W17); await L.signIn(p, 'ad', 'a')
    const S = await L.satLook(p, W17, '01-signed-in-again', ev.ri)
    const lwS = (await L.lwCell(p, W17, HEX, SAT_ISO)).text
    judgeSat(W17, 's17-01', 'signed out and in as ad: nothing pending, same count and people, cell FO', S, base, lwS)
    W17.rec('s17-01b', 'Leave War after signing in again', null, `SANS group rows ${await p.locator('tr[data-testid="group-SANS"]').count()} · cell "${lwS}"`, await W17.pic(p, '01b-lw'))

    /* ---- S20: the member us / us ---- */
    const W20 = L.mk(RUN, 's20', sz); W20.errs = W.errs
    await L.signOut(p, W20); await L.signIn(p, 'us', 'us')
    await L.go(p, 'viewsched'); await sleep(500)
    await p.locator(`#vWeek section.day[data-day="${SAT}"]`).first().evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })).catch(() => {}); await sleep(400)
    const vo = await L.openChip(p, W20, '#vWeek', SAT, ev.ri)
    const pv = await W20.pic(p, '01-member-viewsched-window')
    W20.rec('s20-01', 'as the member, View-only Sched Sat: the count and the window — the same people as the admin saw', vo.win.has === true && vo.win.n === base.n && vo.chip && vo.chip.txt === base.chipTxt, `chip ${J(vo.chip)} · window ${J(vo.win)} · admin's n ${base.n} chip ${base.chipTxt}`, pv)
    if (vo.chip) await L.closeWin(p, W20)
    const editTab = await p.evaluate(() => [...document.querySelectorAll('button, a')].filter(e => e.getBoundingClientRect().width > 0 && /Edit Schedule/i.test(e.textContent || '')).length)
    W20.rec('s20-02', 'as the member: no Edit Schedule (so no board, no OIL Earn) offered', editTab === 0, `visible "Edit Schedule" controls ${editTab}`, await W20.pic(p, '02-member-topbar'))
    await L.go(p, 'leavewar'); await sleep(800)
    const gear = await p.locator('[data-testid="settings-open"]:visible').count()
    const lwm = await L.lwCell(p, W20, HEX, SAT_ISO)
    let more = 'no cell'
    if (lwm.cell) {
      await W20.press(p, lwm.cell, 'hex-cell'); await sleep(500)
      more = `bid-more ${await p.locator('[data-testid="bid-more"]:visible').count()} · bid-postout ${await p.locator('[data-testid="bid-postout"]:visible').count()}`
    }
    W20.rec('s20-03', 'as the member on the Leave War: no ⚙ Settings, no posting control on Hex\'s cell; his Sat cell', gear === 0 && !/[1-9]/.test(more.replace(/^bid-more \d+ · /, '')) && /^FO/.test(lwm.text), `gear ${gear} · after a tap on his cell: ${more} · cell "${lwm.text}"`, await W20.pic(p, '03-member-hex-cell'))
    await p.keyboard.press('Escape'); await sleep(300)
    /* the OIL tracker, Hex's figure */
    await L.go(p, 'leavewar'); await sleep(600)
    const tab = p.locator('[data-testid="oil-tracker"]:visible').first()
    if (await tab.count()) await W20.press(p, tab, 'oil-tracker'); await sleep(700)
    const bal = p.locator(`[data-testid="oil-bal-${HEX}"]`).first()
    if (await bal.count()) await bal.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
    const balTxt = ((await bal.innerText().catch(() => '')) || '').replace(/\s+/g, ' ')
    const nm = p.locator(`[data-testid="oil-name-${HEX}"]`).first()
    let detail = ''
    if (await nm.count()) { await W20.press(p, nm, 'oil-name'); await sleep(500); detail = ((await p.locator('body').innerText()).match(/18 Jul[^\n]*/g) || []).slice(0, 3).join(' | ') }
    const credit = await p.locator('[data-testid="oil-credit-save"]:visible, [data-testid="oil-amt"]:visible').count()
    W20.rec('s20-04', 'as the member, the OIL tracker for Hex: his figure, the 18 Jul line, no credit control', credit === 0, `balance "${balTxt}" · 18 Jul lines "${detail}" · credit controls ${credit}`, await W20.pic(p, '04-member-oil-tracker'))
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 500), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 10).join(' || '))
  await b.close()
}
for (const k of ONLY) await run(k)
L.saveResults('s1-' + ONLY.join('_'))
console.log('done')
