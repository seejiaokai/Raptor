/* [DB-READINESS] phase 7 — WALKER A, part 1: A1–A5 (a placeholder on a member's Personal request row).
   Each scenario in its own fresh world (its own storage), at the fixed date Wed 15 Jul 26.
   Usage: node p7-a-walk1.mjs [A1 A2 …]   (HP_PHONE=1 for the phone width) */
import { boot, world, fileTimed, fileRange, oilButton, stored } from './p6-lib.mjs'
import * as S from './seat-lib.mjs'
import { lwCell } from './lib.mjs'
import * as A from './p7-a-lib.mjs'
const { L, W } = await boot()
const PHONE = !!process.env.HP_PHONE
const sfx = PHONE ? '-phone' : ''
const only = process.argv.slice(2)
const allErrors = []

const SCEN = [
  { id: 'A1', di: A.TUE, timed: true, puts: [['extras', 'allavail']], did: 'timed Personal (Ranger, Tue 14 Jul 10:00–11:00) filed on the Inputs page; ALL AVAIL put in the extras under its row (board: arm the + add zone, tap ALL AVAIL in the crew list)' },
  { id: 'A2', di: A.SAT, timed: false, puts: [['name', 'all']], did: 'all-day Personal (Ranger, Sat 18 Jul); ALL put in the row\'s NAME BOX (arm the name seat, tap ALL)' },
  { id: 'A3', di: A.SAT, timed: true, puts: [['extras', 'all']], did: 'timed Personal (Ranger, Sat 18 Jul 10:00–11:00); ALL put in the extras' },
  { id: 'A4', di: A.THU, timed: false, puts: [['extras', 'allavail']], did: 'all-day Personal (Ranger, Thu 16 Jul); ALL AVAIL put in the extras' },
  { id: 'A5', di: A.SAT, timed: true, puts: [['name', 'all'], ['extras', 'allavail']], did: 'timed Personal (Ranger, Sat 18 Jul 10:00–11:00); ALL in the name box AND ALL AVAIL in the extras' },
]

for (const sc of SCEN) {
  if (only.length && !only.includes(sc.id)) continue
  const { browser, p, errors } = await world(L, { phone: PHONE })
  await W.toastSpy(p)
  const R = A.scen(sc.id + sfx, sc.did + (PHONE ? ' — PHONE 390×844' : ''))
  const tag = `${sc.id}${sfx}`
  try {
    const di = sc.di, iso = A.ISO[di]
    const weekend = di >= 5
    const iid = sc.timed
      ? await fileTimed(L, p, { person: A.RANGER, type: 'Personal', iso, from: '10:00', to: '11:00', remarks: 'P7 ' + sc.id })
      : await fileRange(L, p, { person: A.RANGER, type: 'Personal', fromIso: iso, toIso: iso, remarks: 'P7 ' + sc.id })
    const req = await A.reqOf(p, iid)
    A.ok('the request was filed and landed on the Ground Programme by itself', !!req && req.acc === 'g', req)
    A.data(`request ${req.type} ${req.date} ${req.allday ? 'all day' : req.s + '–' + req.e + ' min'} acc=${req.acc}`)
    await W.boardOn(p, di)
    const ri = await A.rowIdx(p, di, iid)
    for (const [where, pid] of sc.puts) {
      if (where === 'name') {
        /* the name box holds the requester's puck: a tap on it does not arm (recorded), so the door is a real drag */
        const t = await A.place(S, p, di, ri, 'name', pid)
        A.said(`a tap on the filled name seat then ${pid} in the crew list: armed ${t.armed}, seat still holds [${t.after}]`)
        if (!t.took) {
          const d = await A.dragIn(W, p, di, ri, pid)
          A.ok(`${pid} dragged from the crew list onto the row's name box`, d.took, d)
          A.said(`dragging ${pid} onto the name box: ${d.did}; the app said ${JSON.stringify(d.toasts)}; the name seat now holds [${d.after}]`)
        }
      } else {
        const r = await A.place(S, p, di, ri, where, pid)
        A.ok(`${pid} placed in the ${where}`, r.took, r)
        A.said(`placing ${pid} in the ${where}: armed ${r.armed}, offered ${r.offered}, the app said "${r.msg}", seat now holds [${r.after}]`)
      }
    }
    const row = await A.rowOf(p, di, iid)
    A.data(`the day's row: who=${row.who} more=${JSON.stringify(row.more || [])} str="${row.str}" end="${row.end}"`)

    /* ---- the BOARD, OIL Earn off ---- */
    await A.showRow(p, di, iid)
    let ch = await A.chips(p, '#schedBoard', iid)
    A.ok('BOARD (OIL Earn off): the count chip is painted on the row', Array.isArray(ch) && ch.length >= 1, ch)
    A.ok('BOARD: one chip per placeholder on the row', ch.length === sc.puts.length, ch.map(c => c.beside + '=' + c.txt))
    for (const c of ch) A.said(`board chip beside ${c.beside}: "${c.txt}" — title "${c.title}"`)
    const nBoard = ch[0] ? ch[0].txt : null
    await A.pic(L, p, `${tag}-1-board-chip`)
    let w = await A.openChip(p, '#schedBoard', iid)
    A.ok('BOARD: a tap on the chip opens the ALL AVAIL window', w.open, w)
    A.ok('BOARD: the window lists as many men as the chip says', w.open && String(w.n) === nBoard, { chip: nBoard, listed: w.n })
    A.said(`board window "${w.title}": ${w.tabs.length ? w.tabs.join(' | ') : w.one}; lists ${w.n}; "which answer" line: "${w.from}"; foot: "${w.foot}"; flagged: ${JSON.stringify(w.flagged)}`)
    A.ok('BOARD: the window\'s "which answer" line says the working copy\'s words', /as things stand now/.test(w.from || ''), w.from)
    A.ok('BOARD: the requester is not in his own crowd', !w.ids.includes(A.RANGER) || sc.puts.some(x => x[0] === 'name'), w.ids.includes(A.RANGER) ? 'Ranger listed' : 'Ranger not listed')
    A.data(`Ranger (the requester) listed in the crowd: ${w.ids.includes(A.RANGER)}`)
    const offIds = w.ids.slice()
    await A.pic(L, p, `${tag}-2-board-window`)
    if (sc.puts.length > 1) {
      const w2 = await A.openChip(p, '#schedBoard', iid, 1)
      A.said(`second chip's window: lists ${w2.n}; "${w2.from}"`)
      A.ok('the two chips on the row open the same list (nobody counted twice)', w2.open && JSON.stringify(w2.ids.slice().sort()) === JSON.stringify(offIds.slice().sort()), { first: offIds.length, second: w2.n, dup: w2.ids.length - new Set(w2.ids).size })
      A.ok('nobody is listed twice in a window', new Set(offIds).size === offIds.length)
    }
    await A.closeWin(p)

    /* ---- OIL Earn ---- */
    const oilBtn = await p.evaluate(() => [...document.querySelectorAll('#sbOil, #schedBoard [data-oilmode]')].filter(e => e.offsetParent !== null).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()))
    if (!weekend) {
      A.said(`OIL Earn button on this weekday's board: ${oilBtn.length ? oilBtn.join(',') : 'none drawn'}`)
      A.ok('a weekday offers no OIL Earn mode (nothing to walk with the mode on)', oilBtn.length === 0, oilBtn)
    } else {
      const pressed = await oilButton(L, p)
      A.ok('OIL Earn turned on', pressed === 'pressed' && await A.oilOn(p), pressed)
      await A.showRow(p, di, iid)
      ch = await A.chips(p, '#schedBoard', iid)
      A.ok('OIL EARN ON: the chip is still painted', Array.isArray(ch) && ch.length === sc.puts.length, ch)
      for (const c of ch) A.said(`OIL Earn chip beside ${c.beside}: "${c.txt}" — title "${c.title}"`)
      A.ok('OIL EARN ON: the same number as with the mode off', ch[0] && ch[0].txt === nBoard, { off: nBoard, on: ch[0] && ch[0].txt })
      const br = await A.boardRow(p, di, iid)
      A.said(`OIL Earn row: item cell "${br.item && br.item.txt}" [${br.item && br.item.cls}] title "${br.item && br.item.title}"`)
      for (const pk of br.pucks || []) A.said(`OIL Earn row puck ${pk.cs}: earn wrapper ${pk.earn ? `[${pk.earn.cls}] title "${pk.earn.title}"` : 'none'}; puck title "${pk.title}"`)
      const reqPuck = (br.pucks || []).find(x => x.who === A.RANGER)
      if (reqPuck) A.ok('OIL EARN ON: the requester\'s own puck says "Ranger — a personal request earns no OIL", inert', !!reqPuck.earn && /Ranger — a personal request earns no OIL/.test(reqPuck.earn.title) && /inert/.test(reqPuck.earn.cls), reqPuck.earn)
      else A.said('the requester\'s puck is not on the row (the name box holds the placeholder)')
      A.ok('OIL EARN ON: the row offers no earning switch (nothing on it can earn)', !!br.item && /none/.test(br.item.cls), br.item)
      await A.pic(L, p, `${tag}-3-board-oilearn-row`)
      w = await A.openChip(p, '#schedBoard', iid)
      A.ok('OIL EARN ON: the chip opens the window', w.open, w)
      A.said(`OIL Earn window tabs: ${w.tabs.join(' | ')}; heads: ${w.heads.join(' · ')}; "${w.from}"; foot: "${w.foot}"`)
      /* the earn half */
      const earnTab = w.tabs.findIndex(t => /earns OIL/.test(t))
      if (earnTab >= 0 && !/\[on\]/.test(w.tabs[earnTab])) { await A.winTab(p, earnTab); w = await A.win(p) }
      const bad = w.men.filter(m => !(m.inert && m.seatTitle === `${m.cs} — a personal request earns no OIL`))
      A.ok('EARN HALF: every man is inert and titled "<callsign> — a personal request earns no OIL"', w.n > 0 && bad.length === 0, bad.slice(0, 4))
      A.said(`earn half: ${w.n} men; first three titles: ${w.men.slice(0, 3).map(m => `"${m.seatTitle}" [${m.seatCls}]`).join(' · ')}`)
      A.ok('EARN HALF: the tab says 0 earn', /0 of/.test(w.tabs[earnTab] || ''), w.tabs[earnTab])
      A.ok('EARN HALF lists the same men as with the mode off', JSON.stringify(w.ids.slice().sort()) === JSON.stringify(offIds.slice().sort()), { off: offIds.length, on: w.n })
      await A.pic(L, p, `${tag}-4-window-earn-half`)
      /* a tap on a man in the earn half: what does the app do? */
      const before = await p.evaluate(d => JSON.stringify(window.DAYS[d].oild || null), di)
      await W.toasts(p)
      const first = p.locator('.availwin:not([hidden]) [data-awp] .puck').first()
      await first.click({ timeout: 3000 }).catch(() => {}); await L.sleep(500)
      const after = await p.evaluate(d => JSON.stringify(window.DAYS[d].oild || null), di)
      const tst = await W.toasts(p); const w3 = await A.win(p)
      A.said(`a tap on ${w.men[0].cs} in the earn half: toast ${JSON.stringify(tst)}; foot now "${w3.foot}"; tab ${w3.tabs[earnTab]}`)
      A.ok('a tap on an inert man writes no decision', before === after, { before, after })
      A.data(`the day's OIL decisions before / after the tap: ${before} / ${after}`)
      await A.pic(L, p, `${tag}-5-window-earn-tapped`)
      /* the available half, mode on */
      await A.winTab(p, 0); const w4 = await A.win(p)
      A.said(`available half with the mode on: lists ${w4.n}; flagged ${JSON.stringify(w4.flagged)}`)
      A.ok('AVAILABLE HALF with the mode on: the same men', JSON.stringify(w4.ids.slice().sort()) === JSON.stringify(offIds.slice().sort()))
      await A.closeWin(p)
      await oilButton(L, p)
      A.ok('OIL Earn turned off again', !(await A.oilOn(p)))
    }

    /* ---- the EDIT WEEK ---- */
    await W.boardOff(p); await W.toEdit(L, p); await A.showWeekChip(p, '#eWeek', di, iid)
    const wk = await A.chips(p, `#eWeek .day[data-day="${di}"]`, iid)
    A.ok('EDIT WEEK: the chip is painted on the week\'s row', Array.isArray(wk) && wk.length === sc.puts.length, wk)
    for (const c of wk) A.said(`edit week chip beside ${c.beside}: "${c.txt}" — title "${c.title}"`)
    A.ok('EDIT WEEK: the same number as the board', wk[0] && wk[0].txt === nBoard, { board: nBoard, week: wk[0] && wk[0].txt })
    await A.pic(L, p, `${tag}-6-editweek-chip`)
    const ww = await A.openChip(p, `#eWeek .day[data-day="${di}"]`, iid)
    A.ok('EDIT WEEK: a tap on the chip opens the window (the board closed)', ww.open && ww.n === offIds.length, { open: ww.open, n: ww.n })
    A.said(`edit week window "${ww.title}": ${ww.tabs.length ? ww.tabs.join(' | ') : ww.one}; lists ${ww.n}; "${ww.from}"; foot "${ww.foot}"`)
    await A.pic(L, p, `${tag}-7-editweek-window`)
    await A.closeWin(p)

    /* ---- stored + the Leave War ---- */
    const st = await stored(p, `weeks/13-07-2026#${di}`)
    const srow = st && (st.ground || (st.d && st.d.ground) || []).find?.(r => r.src === iid)
    A.data(`stored day row weeks/13-07-2026#${di}: ${st ? 'present' : 'ABSENT'}; the request's row ${srow ? `who=${srow.who} more=${JSON.stringify(srow.more || [])}` : JSON.stringify(st ? Object.keys(st) : null)}`)
    const three = offIds.filter(id => id !== A.RANGER && id !== 'stiff').slice(0, 3)
    const cells = await lwCell(p, [...three, A.RANGER], iso)
    A.data(`Leave War ${iso} (working copy, not published): ${JSON.stringify(cells)}`)
    A.ok('LEAVE WAR: no FO / HO for three crowd men or the requester', Object.values(cells).every(c => c === 'NO CELL DRAWN' || !/FO|HO/.test(c.text || '')), cells)
    await A.pic(L, p, `${tag}-8-leavewar`)

    /* ---- a reload ---- */
    const n0 = L.results.length
    await L.reloadCompare(p, tag, 'a', { page: 'editsched' })
    const rl = L.results.slice(n0)
    A.ok('a reload gives back what was there and writes nothing', rl.every(r => r.ok), rl.filter(r => !r.ok))
    await A.showWeekChip(p, '#eWeek', di, iid)
    const wk2 = await A.chips(p, `#eWeek .day[data-day="${di}"]`, iid)
    A.ok('after the reload the chip is still painted, the same number', Array.isArray(wk2) && wk2.length === sc.puts.length && wk2[0].txt === nBoard, wk2)
    await A.pic(L, p, `${tag}-9-reloaded`)
  } catch (e) {
    A.ok('the scenario ran', false, String(e && e.stack || e).slice(0, 700))
    await A.pic(L, p, `${tag}-X-error`).catch(() => {})
  }
  A.ok('no console error, page error or 4xx', errors.length === 0, errors.slice(0, 5))
  allErrors.push(...errors.map(e => sc.id + ': ' + e))
  await browser.close()
}
A.saveRows(process.env.HP_OUT.replace(/\.json$/, `-walk1${sfx}${only.length ? '-' + only.join('') : ''}.json`), { errors: allErrors })
