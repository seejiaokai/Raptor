/* [DB-READINESS] phase 7 — WALKER A, part 5: the roll-call's OTHER ROOMS, in one world.
   R1 a version preview (the edit week's and the board's "Original" look, and View-only Sched's own picker) of the
      published Saturday while a leave is pending — the chip and its window agree, "when this day was issued";
   R2 a saved-plan preview (Sunday: + Alt Plan parks Plan A; View-only Sched's picker shows it) — "as things stand now";
   R3 the next-week peek on View-only Sched — no chip;
   R4 the member (Ranger, us/us): reads the chip and the window, no earn controls, nothing written. */
import { boot, world, fileTimed, fileRange, oilButton } from './p6-lib.mjs'
import * as S from './seat-lib.mjs'
import { lwCell } from './lib.mjs'
import * as A from './p7-a-lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const SAT = A.SAT, SUN = A.SUN
const dayJson = di => p.evaluate(d => JSON.stringify(window.DAYS[d]), di)
const menuOpen = async (scope, di) => { const pm = p.locator(`${scope} [data-planmenu="${di}"]:visible`).first(); if (!(await pm.count())) return false; await pm.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await pm.click(); await L.sleep(450); return true }
const menuPick = async sel => { const it = p.locator(`.wavemenu .wm${sel}:visible`).first(); if (!(await it.count())) return false; await it.click(); await L.sleep(750); return true }
const viewPick = async (di, value) => { const s = p.locator(`#vWeek select[data-dver="${di}"]:visible, #vWeek select[data-vwork="${di}"]:visible`).first(); if (!(await s.count())) return false; await s.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await s.selectOption(value); await L.sleep(650); return true }
const viewOpts = di => p.evaluate(d => { const s = document.querySelector(`#vWeek select[data-dver="${d}"], #vWeek select[data-vwork="${d}"]`); return s ? [...s.options].map(o => `${o.value}=${o.text}${o.selected ? ' *' : ''}`) : null }, di)
/* tap the first man in the open window: nothing may be written */
async function tapWrites(di) {
  const before = await dayJson(di); const r0 = JSON.stringify(await L.rows(p))
  const m = p.locator('.availwin:not([hidden]) [data-awp] .puck').first()
  await m.click({ timeout: 3000 }).catch(() => {}); await L.settle(p, 600)
  const w = await A.win(p)
  return { changedDay: before !== await dayJson(di), changedRows: r0 !== JSON.stringify(await L.rows(p)), foot: w.foot, tabs: w.tabs }
}

let satIid = null, sunIid = null, N = null, crowd = [], leaveWho = null

/* ---------------- the fixture ---------------- */
A.scen('R0', 'the fixture: Saturday — timed Personal (Ranger) with ALL AVAIL, signed and published, then a Local leave for one crowd man (pending); Sunday — timed Personal (Ranger) with ALL AVAIL, then "+ Alt Plan" (Plan A parked, Plan B live); Mon 20 Jul (next week) — timed Personal (Ranger) with ALL AVAIL')
try {
  satIid = await fileTimed(L, p, { person: A.RANGER, type: 'Personal', iso: A.ISO[SAT], from: '10:00', to: '11:00', remarks: 'P7 R1' })
  await W.boardOn(p, SAT)
  A.ok('Saturday: ALL AVAIL placed', (await A.place(S, p, SAT, await A.rowIdx(p, SAT, satIid), 'extras', 'allavail')).took)
  const w0 = await A.openChip(p, '#schedBoard', satIid); await A.closeWin(p)
  N = String(w0.n); crowd = w0.ids.slice(); leaveWho = crowd.filter(id => !['stiff', A.RANGER].includes(id))[0]
  await W.boardOff(p); await W.toEdit(L, p); await W.showDay(p, SAT)
  await W.signDay(p, SAT); const pub = await W.publishDay(p, SAT)
  const h = await W.head(p, SAT)
  A.ok('Saturday published (ORIG)', pub.pressed && /ORIG/.test(h.tag), h)
  const lv = await fileRange(L, p, { person: leaveWho, type: 'LL', fromIso: A.ISO[SAT], toIso: A.ISO[SAT], remarks: 'P7 R1 leave' })
  A.ok('the leave filed for ' + (await A.csOf(p, [leaveWho]))[0], !!lv)
  sunIid = await fileTimed(L, p, { person: A.RANGER, type: 'Personal', iso: A.ISO[SUN], from: '10:00', to: '11:00', remarks: 'P7 R2' })
  await W.boardOn(p, SUN)
  A.ok('Sunday: ALL AVAIL placed', (await A.place(S, p, SUN, await A.rowIdx(p, SUN, sunIid), 'extras', 'allavail')).took)
  await W.boardOff(p); await W.toEdit(L, p); await W.showDay(p, SUN)
  await menuOpen('#eWeek', SUN); const dup = await menuPick('[data-plandup]')
  A.said(`Sunday "+ Alt Plan": ${dup}; the app said ${JSON.stringify(await W.toasts(p))}`)
  A.said(`working copy: Saturday chip ${N} at publication, a leave now pending for ${(await A.csOf(p, [leaveWho]))[0]}`)
} catch (e) { A.ok('the fixture ran', false, String(e && e.stack || e).slice(0, 700)); await A.pic(L, p, 'R0-X-error').catch(() => {}) }

/* ---------------- R1 — the version previews ---------------- */
A.scen('R1', 'published Saturday, a leave pending: (a) edit week — the day\'s plans menu → "Original" (look only); (b) the board — the same menu; (c) View-only Sched — its picker "Original — as issued" / "Working draft — not issued"; in each: the chip, its window, a tap on a man')
try {
  /* (a) the edit week */
  await W.toEdit(L, p); await W.showDay(p, SAT)
  const live = await A.chips(p, `#eWeek .day[data-day="${SAT}"]`, satIid)
  A.said(`edit week, live working copy: chip "${live[0] && live[0].txt}" — "${live[0] && live[0].title}"`)
  A.ok(`the working copy has dropped to ${+N - 1}`, live[0] && live[0].txt === String(+N - 1), live)
  await menuOpen('#eWeek', SAT); const pv = await menuPick('[data-planpv]')
  A.ok('the plans menu opens the Original (look only) on the edit week', pv)
  await A.showWeekChip(p, '#eWeek', SAT, satIid)
  const pc = await A.chips(p, `#eWeek .day[data-day="${SAT}"]`, satIid)
  A.said(`edit week, previewing the Original: chip "${pc[0] && pc[0].txt}" — "${pc[0] && pc[0].title}" (version ${pc[0] && pc[0].ver})`)
  A.ok(`PREVIEW (edit week): the chip says ${N}, of the issued version, "when this day was issued"`, pc.length === 1 && pc[0].txt === N && !!pc[0].ver && /when this day was issued/.test(pc[0].title), pc)
  await A.pic(L, p, 'R1-a1-editweek-preview-chip')
  const pw = await A.openChip(p, `#eWeek .day[data-day="${SAT}"]`, satIid)
  A.said(`its window "${pw.title}": ${pw.tabs.length ? pw.tabs.join(' | ') : pw.one}; lists ${pw.n}; "${pw.from}"; foot "${pw.foot}"`)
  A.ok('PREVIEW (edit week): the window agrees with the chip — the same number, "when this day was issued", the man on leave still listed', pw.open && String(pw.n) === N && /when this day was issued/.test(pw.from) && pw.ids.includes(leaveWho), { n: pw.n, from: pw.from })
  const t1 = await tapWrites(SAT)
  A.ok('PREVIEW (edit week): a tap on a man in the window writes nothing', !t1.changedDay && !t1.changedRows, t1)
  A.said(`a tap on the first man: the window's foot reads "${t1.foot}"; day changed ${t1.changedDay}, rows changed ${t1.changedRows}`)
  await A.pic(L, p, 'R1-a2-editweek-preview-window')
  await A.closeWin(p)
  const back = p.locator(`#eWeek .day[data-day="${SAT}"] [data-golive="${SAT}"]:visible`).first()
  if (await back.count()) { await back.click(); await L.sleep(600) } else A.note('no "Back to live copy" button found on the edit week preview')
  const live2 = await A.chips(p, `#eWeek .day[data-day="${SAT}"]`, satIid)
  A.ok('back on the live copy the chip reads the working number again', live2[0] && live2[0].txt === String(+N - 1) && !live2[0].ver, live2)

  /* (b) the board */
  await W.boardOn(p, SAT)
  const mb = await menuOpen('#schedBoard', SAT); const pvb = mb && await menuPick('[data-planpv]')
  if (pvb) {
    await p.evaluate(i => { const c = document.querySelector(`#schedBoard .oilcount[data-oilsent="i:${i}"]`); if (c) c.scrollIntoView({ block: 'center' }) }, satIid); await L.sleep(300)
    const bc = await A.chips(p, '#schedBoard', satIid)
    A.said(`board, previewing the Original: chip "${bc[0] && bc[0].txt}" — "${bc[0] && bc[0].title}" (version ${bc[0] && bc[0].ver})`)
    A.ok(`PREVIEW (board): the chip says ${N}, "when this day was issued"`, bc.length >= 1 && bc[0].txt === N && /when this day was issued/.test(bc[0].title), bc)
    const bw = await A.openChip(p, '#schedBoard', satIid)
    A.said(`its window: ${bw.tabs.length ? bw.tabs.join(' | ') : bw.one}; lists ${bw.n}; "${bw.from}"`)
    A.ok('PREVIEW (board): the window agrees', bw.open && String(bw.n) === N && /when this day was issued/.test(bw.from), { n: bw.n, from: bw.from })
    const oilBtn = await p.evaluate(() => { const b = document.querySelector('#sbOil'); return b ? { disabled: b.disabled, title: b.title } : null })
    A.said('OIL Earn button while the board previews the Original: ' + JSON.stringify(oilBtn))
    const t2 = await tapWrites(SAT)
    A.ok('PREVIEW (board): a tap on a man in the window writes nothing', !t2.changedDay && !t2.changedRows, t2)
    await A.pic(L, p, 'R1-b-board-preview-window')
    await A.closeWin(p)
    await menuOpen('#schedBoard', SAT); await menuPick('[data-plangolive]')
  } else A.note('the board offered no plans menu / no Original row — board preview NOT WALKED')
  await W.boardOff(p)

  /* (c) View-only Sched's picker */
  await L.go(p, 'viewsched'); await A.showWeekChip(p, '#vWeek', SAT, satIid)
  A.said('View-only Sched, Saturday\'s picker: ' + JSON.stringify(await viewOpts(SAT)))
  const vi = await A.chips(p, `#vWeek .day[data-day="${SAT}"]`, satIid)
  A.ok(`VIEW-ONLY SCHED (as issued): ${N}, "when this day was issued"`, vi[0] && vi[0].txt === N && /when this day was issued/.test(vi[0].title), vi)
  const okW = await viewPick(SAT, 'working')
  await A.showWeekChip(p, '#vWeek', SAT, satIid)
  const vwk = await A.chips(p, `#vWeek .day[data-day="${SAT}"]`, satIid)
  A.said(`View-only Sched, "Working draft — not issued" picked (${okW}): chip "${vwk[0] && vwk[0].txt}" — "${vwk[0] && vwk[0].title}"`)
  A.ok(`VIEW-ONLY SCHED (working draft): ${+N - 1}, "as things stand now"`, vwk[0] && vwk[0].txt === String(+N - 1) && /as things stand now/.test(vwk[0].title), vwk)
  const vww = await A.openChip(p, `#vWeek .day[data-day="${SAT}"]`, satIid)
  A.ok('VIEW-ONLY SCHED (working draft): the window agrees with its chip', vww.open && String(vww.n) === String(+N - 1) && /as things stand now/.test(vww.from), { n: vww.n, from: vww.from })
  A.said(`its window: lists ${vww.n}; "${vww.from}"`)
  await A.pic(L, p, 'R1-c-viewsched-working-window')
  await A.closeWin(p)
  await viewPick(SAT, 'issued')
} catch (e) { A.ok('the scenario ran', false, String(e && e.stack || e).slice(0, 700)); await A.pic(L, p, 'R1-X-error').catch(() => {}) }

/* ---------------- R2 — a saved plan previewed ---------------- */
A.scen('R2', 'Sunday: Plan A (parked) previewed through View-only Sched\'s picker; the chip, its window, a tap on a man; then the live plan again')
try {
  await L.go(p, 'viewsched'); await A.showWeekChip(p, '#vWeek', SUN, sunIid)
  const opts = await viewOpts(SUN)
  A.said('View-only Sched, Sunday\'s picker: ' + JSON.stringify(opts))
  const planOpt = (opts || []).map(o => o.split('=')[0]).find(v => v.startsWith('d:'))
  A.ok('the picker offers the parked plan', !!planOpt, opts)
  const lc = await A.chips(p, `#vWeek .day[data-day="${SUN}"]`, sunIid)
  A.said(`Sunday live plan (Plan B): chip "${lc[0] && lc[0].txt}" — "${lc[0] && lc[0].title}"`)
  await viewPick(SUN, planOpt); await A.showWeekChip(p, '#vWeek', SUN, sunIid)
  const pc = await A.chips(p, `#vWeek .day[data-day="${SUN}"]`, sunIid)
  A.said(`Sunday previewing Plan A: chip "${pc[0] && pc[0].txt}" — "${pc[0] && pc[0].title}" (version ${pc[0] && pc[0].ver})`)
  A.ok('SAVED PLAN: the chip is painted and its title says "who is free as things stand now" — never "issued"', pc.length === 1 && /as things stand now/.test(pc[0].title) && !/issued/.test(pc[0].title), pc)
  await A.pic(L, p, 'R2-1-plan-preview-chip')
  const pw = await A.openChip(p, `#vWeek .day[data-day="${SUN}"]`, sunIid)
  A.said(`its window "${pw.title}": ${pw.tabs.length ? pw.tabs.join(' | ') : pw.one}; lists ${pw.n}; "${pw.from}"; foot "${pw.foot}"`)
  A.ok('SAVED PLAN: the window\'s line says the same words and lists the chip\'s number', pw.open && /as things stand now/.test(pw.from) && !/issued/.test(pw.from) && String(pw.n) === (pc[0] && pc[0].txt), { n: pw.n, from: pw.from, chip: pc[0] && pc[0].txt })
  const t = await tapWrites(SUN)
  A.ok('SAVED PLAN: a tap on a man in the window writes nothing', !t.changedDay && !t.changedRows, t)
  await A.pic(L, p, 'R2-2-plan-preview-window')
  await A.closeWin(p)
  await viewPick(SUN, 'live')
} catch (e) { A.ok('the scenario ran', false, String(e && e.stack || e).slice(0, 700)); await A.pic(L, p, 'R2-X-error').catch(() => {}) }

/* ---------------- R3 — the next-week peek ---------------- */
A.scen('R3', 'next week (20 Jul): timed Personal (Ranger, Mon 20 Jul) with ALL AVAIL in its extras, put there on that week\'s own board; back to this week; View-only Sched\'s "Next week" peek columns')
try {
  const iid3 = await fileTimed(L, p, { person: A.RANGER, type: 'Personal', iso: '2026-07-20', from: '10:00', to: '11:00', remarks: 'P7 R3 peek' })
  A.ok('the request for Mon 20 Jul was filed', !!iid3)
  await W.toEdit(L, p)
  const wk = await p.evaluate(() => [...document.querySelectorAll('[data-wk]')].filter(e => e.offsetParent !== null).map(e => ({ wk: e.dataset.wk, txt: e.innerText.trim() })))
  const nxt = p.locator('[data-wk]:visible', { hasText: 'Jul 20' }).first()
  A.said('the week buttons on Edit Schedule: ' + JSON.stringify(wk))
  await nxt.click(); await L.sleep(1500)
  A.data('loaded week now: ' + await p.evaluate(() => window.CURWEEK))
  await W.boardOn(p, 0)
  const ri = await A.rowIdx(p, 0, iid3)
  const put = ri >= 0 ? await A.place(S, p, 0, ri, 'extras', 'allavail') : { took: false, why: 'no landed row on Mon 20 Jul' }
  A.ok('ALL AVAIL placed on next week\'s Monday row', put.took, put)
  const there = await A.chips(p, '#schedBoard', iid3)
  A.said(`on its own week the row wears the chip: ${there.map(c => c.txt).join('/') || '(none)'}`)
  A.ok('on its own week (the day itself) the chip shows', there.length === 1, there)
  await A.showRow(p, 0, iid3); await A.pic(L, p, 'R3-1-next-week-board-chip')
  await W.boardOff(p); await W.toEdit(L, p)
  const back = p.locator('[data-wk]:visible', { hasText: 'Jul 13' }).first()
  await back.click(); await L.sleep(1500)
  A.data('loaded week now: ' + await p.evaluate(() => window.CURWEEK))
  for (const surf of ['#vWeek', '#eWeek']) {
    await L.go(p, surf === '#vWeek' ? 'viewsched' : 'editsched')
    const pk = await p.evaluate(s => {
      const peeks = [...document.querySelectorAll(`${s} .day.peek`)]
      const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim()
      const withRow = peeks.find(q => /P7 R3 peek|PERSONAL/.test(t(q)))
      if (withRow) withRow.scrollIntoView({ block: 'center', inline: 'center' })
      return { n: peeks.length, chips: peeks.reduce((a, q) => a + q.querySelectorAll('.oilcount').length, 0),
        placeholders: peeks.reduce((a, q) => a + q.querySelectorAll('[data-person="allavail"], [data-person="all"], .puck.allavail').length, 0),
        rowText: withRow ? (t(withRow).match(/.{0,40}PERSONAL.{0,80}/) || [''])[0] : null }
    }, surf)
    await L.sleep(400)
    A.said(`${surf === '#vWeek' ? 'View-only Sched' : 'Edit Schedule'}: ${pk.n} peek columns; count chips in them ${pk.chips}; placeholder pucks drawn in them ${pk.placeholders}; the row reads "${pk.rowText}"`)
    if (pk.n) {
      A.ok(`PEEK (${surf}): the row and its placeholder are drawn, and NO count chip`, pk.chips === 0 && pk.placeholders >= 1 && !!pk.rowText, pk)
      await A.pic(L, p, `R3-2-peek-${surf === '#vWeek' ? 'viewsched' : 'editsched'}`)
      /* a tap on the placeholder in the peek: no window */
      const ph = p.locator(`${surf} .day.peek [data-person="allavail"]:visible`).first()
      if (await ph.count()) {
        const w0 = await p.evaluate(() => window.CURWEEK)
        await ph.click({ timeout: 3000 }).catch(() => {}); await L.sleep(900)
        const w = await A.win(p); const w1 = await p.evaluate(() => window.CURWEEK)
        A.said(`a tap on the peek's ALL AVAIL: window open ${w.open}; the loaded week ${w0} → ${w1}`)
        A.ok('PEEK: the tap opens no ALL AVAIL window', !w.open, w.open)
        if (w1 !== w0) { const b = p.locator('[data-wk]:visible', { hasText: 'Jul 13' }).first(); if (await b.count()) { await b.click(); await L.sleep(1500) } else { await p.evaluate(x => window.loadWeek(x), w0); await L.sleep(900) } }
      }
    } else A.said(`${surf}: no peek columns on this page`)
  }
} catch (e) { A.ok('the scenario ran', false, String(e && e.stack || e).slice(0, 700)); await A.pic(L, p, 'R3-X-error').catch(() => {}) }

/* ---------------- R4 — the member ---------------- */
A.scen('R4', 'sign out; sign in as the member (us — Ranger, the requester): View-only Sched — the published Saturday\'s chip and window, Sunday\'s (a draft); the pages he is offered; a tap on a man')
try {
  await W.toEdit(L, p)
  await W2.signOut(p)
  await L.signIn(p, 'm', { goto: false }); await W.toastSpy(p)
  const nav = await p.evaluate(() => [...document.querySelectorAll('nav a, nav button, .topnav a, .topnav button, header [data-go]')].filter(e => e.offsetParent !== null).map(e => (e.innerText || '').trim()).filter(Boolean))
  A.said('the member\'s top bar: ' + JSON.stringify(nav.slice(0, 16)))
  await L.go(p, 'viewsched'); await A.showWeekChip(p, '#vWeek', SAT, satIid)
  const c = await A.chips(p, `#vWeek .day[data-day="${SAT}"]`, satIid)
  A.said(`member, View-only Sched Saturday: chip "${c[0] && c[0].txt}" — "${c[0] && c[0].title}"; picker ${JSON.stringify(await viewOpts(SAT))}`)
  A.ok(`MEMBER: the issued Saturday wears the chip (${N}, "when this day was issued")`, c.length === 1 && c[0].txt === N && /when this day was issued/.test(c[0].title), c)
  await A.pic(L, p, 'R4-1-member-viewsched-chip')
  const w = await A.openChip(p, `#vWeek .day[data-day="${SAT}"]`, satIid)
  A.said(`member's window "${w.title}": ${w.tabs.length ? w.tabs.join(' | ') : w.one}; lists ${w.n}; "${w.from}"; foot "${w.foot}"`)
  A.ok('MEMBER: the chip opens the window — the same list the admin read, "when this day was issued"', w.open && String(w.n) === N && JSON.stringify(w.ids.slice().sort()) === JSON.stringify(crowd.slice().sort()) && /when this day was issued/.test(w.from), { n: w.n, from: w.from })
  A.ok('MEMBER: no earn controls — no "Who earns OIL" half, no earn switches on the puck rows', !w.tabs.some(t => /earns OIL/.test(t)) && w.men.every(m => !/oilpk/.test(m.seatCls)), { tabs: w.tabs, seat: w.men[0] && w.men[0].seatCls })
  const t = await tapWrites(SAT)
  A.ok('MEMBER: a tap on a man writes nothing', !t.changedDay && !t.changedRows, t)
  A.said(`member's tap on the first man: foot "${t.foot}"`)
  await A.pic(L, p, 'R4-2-member-window')
  await A.closeWin(p)
  /* Sunday (a draft, two plans) as the member sees it */
  await A.showWeekChip(p, '#vWeek', SUN, sunIid)
  const cs = await A.chips(p, `#vWeek .day[data-day="${SUN}"]`, sunIid)
  A.said(`member, Sunday (a draft): chips ${cs.map(x => `"${x.txt}" — "${x.title}"`).join(' / ') || '(none painted)'}; picker ${JSON.stringify(await viewOpts(SUN))}`)
  if (cs.length) { const ws = await A.openChip(p, `#vWeek .day[data-day="${SUN}"]`, sunIid); A.said(`member's Sunday window: ${ws.tabs.length ? ws.tabs.join(' | ') : ws.one}; "${ws.from}"`); A.ok('MEMBER: Sunday\'s window has no earn half either', ws.open && !ws.tabs.some(x => /earns OIL/.test(x)), ws.tabs); await A.pic(L, p, 'R4-3-member-sunday-window'); await A.closeWin(p) }
  /* can he reach Edit Schedule / the board / OIL Earn? */
  const canEdit = await p.evaluate(() => { try { window.go('editsched') } catch (e) { return 'threw ' + e.message } return window.CURPAGE })
  await L.sleep(500)
  const oilCtl = await p.evaluate(() => [...document.querySelectorAll('#sbOil, [data-oilmode]')].filter(e => e.offsetParent !== null).length)
  A.said(`asked for Edit Schedule as the member → the page shown is "${await p.evaluate(() => window.CURPAGE)}" (${canEdit}); OIL Earn buttons on screen: ${oilCtl}`)
  A.ok('MEMBER: no OIL Earn button anywhere he can reach', oilCtl === 0, oilCtl)
  await A.pic(L, p, 'R4-4-member-after-asking-edit')
} catch (e) { A.ok('the scenario ran', false, String(e && e.stack || e).slice(0, 700)); await A.pic(L, p, 'R4-X-error').catch(() => {}) }
A.ok('no console error, page error or 4xx (whole world)', errors.length === 0, errors.slice(0, 5))
A.saveRows(process.env.HP_OUT.replace(/\.json$/, '-walk5.json'), { errors })
await browser.close()
