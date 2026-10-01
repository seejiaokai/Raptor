/* [DB-READINESS] phase 7 — WALKER A, part 4: A26–A28. Saturday with a Personal crowd is PUBLISHED (the four sign-off
   boxes, Publish day); the Leave War cells of three crowd men (no credit) beside a man who really worked (the SDO — the
   proof the reading works); then a leave is filed for ONE crowd man: the working copy's count drops, View-only Sched's
   issued face keeps the count it went out with (its window says "when this day was issued"), the day reads pending,
   the four sign-offs fall (D103); Undo the leave → equal again. The changes window: no "count changed" line of its own. */
import { boot, world, fileTimed, fileRange, oilButton, stored, changesList } from './p6-lib.mjs'
import * as S from './seat-lib.mjs'
import { lwCell } from './lib.mjs'
import * as A from './p7-a-lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const SAT = A.SAT, iso = A.ISO[SAT]
const viewChip = async () => { await L.go(p, 'viewsched'); await A.showWeekChip(p, '#vWeek', SAT, iid); return A.chips(p, `#vWeek .day[data-day="${SAT}"]`, iid) }
const editChip = async () => { await W.toEdit(L, p); await A.showWeekChip(p, '#eWeek', SAT, iid); return A.chips(p, `#eWeek .day[data-day="${SAT}"]`, iid) }
let iid = null

/* ---------------- A26 ---------------- */
A.scen('A26', 'timed Personal (Ranger, Sat 18 Jul 10:00–11:00) with ALL AVAIL in the extras; Saturday signed (four boxes) and published; View-only Sched; the Leave War')
let N = null, crowd = [], three = []
try {
  iid = await fileTimed(L, p, { person: A.RANGER, type: 'Personal', iso, from: '10:00', to: '11:00', remarks: 'P7 A26' })
  await W.boardOn(p, SAT)
  const ri = await A.rowIdx(p, SAT, iid)
  const put = await A.place(S, p, SAT, ri, 'extras', 'allavail'); A.ok('ALL AVAIL placed in the extras', put.took, put)
  const w0 = await A.openChip(p, '#schedBoard', iid); await A.closeWin(p)
  N = String(w0.n); crowd = w0.ids.slice()
  three = crowd.filter(id => !['stiff', A.RANGER].includes(id)).slice(0, 3)
  A.said(`before publishing: the board chip opens a list of ${N}; the three crowd men followed: ${(await A.csOf(p, three)).join(', ')}`)
  await W.boardOff(p); await W.toEdit(L, p); await W.showDay(p, SAT)
  const h0 = await W.head(p, SAT)
  const sg = await W.signDay(p, SAT)
  const pub = await W.publishDay(p, SAT)
  const h1 = await W.head(p, SAT)
  A.said(`Saturday's head before: tag "${h0.tag}", pending "${h0.pending}"; signed ${JSON.stringify(sg)}; Publish → ${JSON.stringify(pub)}; head after: tag "${h1.tag}", pending "${h1.pending}", signs ${JSON.stringify(h1.signs)}; toasts ${JSON.stringify(await W.toasts(p))}`)
  A.ok('Saturday is published (ORIG), nothing reads pending', pub.pressed && /ORIG/.test(h1.tag) && !/pending/.test(h1.pending), h1)
  /* the four boxes are empty again after a publish (ready for the next version): sign them again, so that D103 has
     something to wipe (the way the 26 Sep walk did it — cr-a1-pub S16) */
  const sg2 = await W.signDay(p, SAT)
  const h2 = await W.head(p, SAT)
  A.said(`the four signed again on the published day: ${JSON.stringify(sg2)}; boxes now ${JSON.stringify(h2.signs)}; pending "${h2.pending}"`)
  A.ok('the four boxes hold names again, nothing pending', W.signsFull(h2) && !/pending/.test(h2.pending), h2)
  await A.showWeekChip(p, '#eWeek', SAT, iid); await A.pic(L, p, 'A26-1-published-editweek')
  const ec = await editChip()
  A.ok('EDIT WEEK after publishing: the working copy\'s chip, the same number', ec.length === 1 && ec[0].txt === N, ec)
  A.said(`edit week chip after publishing: "${ec[0] && ec[0].txt}" — "${ec[0] && ec[0].title}"`)
  /* View-only Sched: the issued face */
  const vc = await viewChip()
  A.ok('VIEW-ONLY SCHED: the issued face wears the chip, the count it went out with', vc.length === 1 && vc[0].txt === N, vc)
  A.ok('VIEW-ONLY SCHED: the chip belongs to the issued version and its title says "when this day was issued"', vc[0] && !!vc[0].ver && /when this day was issued/.test(vc[0].title), vc[0])
  A.said(`View-only Sched chip: "${vc[0] && vc[0].txt}" — "${vc[0] && vc[0].title}" (version ${vc[0] && vc[0].ver})`)
  await A.pic(L, p, 'A26-2-viewsched-chip')
  const vw = await A.openChip(p, `#vWeek .day[data-day="${SAT}"]`, iid)
  A.ok('VIEW-ONLY SCHED: the chip opens the window; its "which answer" line says when the day was issued; the same men', vw.open && /when this day was issued/.test(vw.from) && JSON.stringify(vw.ids.slice().sort()) === JSON.stringify(crowd.slice().sort()), { open: vw.open, from: vw.from, n: vw.n })
  A.said(`View-only Sched window "${vw.title}": ${vw.tabs.length ? vw.tabs.join(' | ') : vw.one}; lists ${vw.n}; "${vw.from}"; foot "${vw.foot}"`)
  await A.pic(L, p, 'A26-3-viewsched-window')
  if (vw.tabs.length > 1) {
    const et = vw.tabs.findIndex(t => /earns OIL/.test(t)); await A.winTab(p, et); const ve = await A.win(p)
    A.said(`View-only Sched earn half: ${ve.tabs[et]}; ${ve.men.filter(m => m.inert).length} inert of ${ve.n}; e.g. "${ve.men[0] && ve.men[0].seatTitle}"; foot "${ve.foot}"`)
    A.ok('VIEW-ONLY SCHED earn half: 0 earn, every man inert with the Personal reason', / 0 of/.test(ve.tabs[et]) && ve.men.every(m => m.inert && /a personal request earns no OIL/.test(m.seatTitle)), { tab: ve.tabs[et] })
    await A.pic(L, p, 'A26-4-viewsched-earn-half')
  } else A.said('View-only Sched window has no "Who earns OIL" half (one list only)')
  await A.closeWin(p)
  /* the Leave War */
  const cells = await lwCell(p, [...three, A.RANGER, 'plasma'], iso)
  A.data(`Leave War ${iso} after publishing: ${JSON.stringify(cells)}`)
  const names = await A.csOf(p, three)
  A.ok('LEAVE WAR: no FO / HO for the three crowd men, nor for the requester', [...names, 'Ranger'].every(n => cells[n] && cells[n] !== 'NO CELL DRAWN' && !/FO|HO/.test(cells[n].text || '')), cells)
  A.ok('LEAVE WAR (the proof the reading works): the SDO of that Saturday, Fable, does wear his credit', cells.Fable && /FO|HO/.test(cells.Fable.text || ''), cells.Fable)
  await p.evaluate(([id, d]) => { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }, [three[0], iso]); await L.sleep(300)
  await A.pic(L, p, 'A26-5-leavewar')
  const st = await stored(p, 'weeks/13-07-2026#5')
  A.data(`stored Saturday row present: ${!!st}; stored issued versions: ${JSON.stringify(Object.keys(await L.rows(p)).filter(k => /^weeks\/13-07-2026.*(:is:|#5)/.test(k)))}`)
} catch (e) { A.ok('the scenario ran', false, String(e && e.stack || e).slice(0, 700)); await A.pic(L, p, 'A26-X-error').catch(() => {}) }

/* ---------------- A27 ---------------- */
A.scen('A27', 'on the published Saturday: a Local leave (LL, all day Sat 18 Jul) filed on the Inputs page for ONE crowd man (the first of the three)')
let leave = null
try {
  const who = three[0], whoCs = (await A.csOf(p, [who]))[0]
  leave = await fileRange(L, p, { person: who, type: 'LL', fromIso: iso, toIso: iso, remarks: 'P7 A27 leave' })
  const lr = await A.reqOf(p, leave)
  A.ok(`the leave for ${whoCs} was filed`, !!lr, lr)
  A.said(`leave filed for ${whoCs}: toasts ${JSON.stringify(await W.toasts(p))}`)
  const ec = await editChip()
  A.ok(`WORKING COPY: the chip drops by one (${N} → ${+N - 1})`, ec.length === 1 && ec[0].txt === String(+N - 1), ec)
  const ew = await A.openChip(p, `#eWeek .day[data-day="${SAT}"]`, iid)
  A.ok(`WORKING COPY: the window no longer lists ${whoCs}, and says "as things stand now"`, ew.open && !ew.ids.includes(who) && /as things stand now/.test(ew.from), { n: ew.n, from: ew.from })
  A.said(`working copy: chip "${ec[0] && ec[0].txt}" — "${ec[0] && ec[0].title}"; window lists ${ew.n}; "${ew.from}"`)
  await A.pic(L, p, 'A27-1-working-copy-window')
  await A.closeWin(p)
  await W.showDay(p, SAT)
  const h = await W.head(p, SAT)
  A.said(`Saturday's head on the edit week: tag "${h.tag}", pending "${h.pending}", sign-off boxes ${JSON.stringify(h.signs)}, signed line "${h.signed}"`)
  A.ok('the day reads pending', /pending/.test(h.pending), h.pending)
  A.ok('the four sign-offs have fallen (D103)', W.signsEmpty(h), h.signs)
  await A.pic(L, p, 'A27-2-editweek-pending-signs')
  /* the changes window */
  const cl = await changesList(L, p, SAT)
  A.said(`the changes window opened from Saturday's count: tabs ${JSON.stringify(cl && cl.tabs)}; lines ${JSON.stringify(cl && cl.lines)}`)
  A.ok('the changes window carries no "count changed" line of its own', !!cl && !(cl.lines || []).some(l => /count|\b4[34]\b.*→|ALL AVAIL.*(4[34])/i.test(l)), cl && cl.lines)
  const c = p.locator(`#eWeek .day[data-day="${SAT}"] .dpend`).first()
  if (await c.count()) { await c.click(); await L.sleep(600); const t = p.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'To go out' }).first(); if (await t.count()) { await t.click(); await L.sleep(300) } await A.pic(L, p, 'A27-3-changes-window'); const x = p.locator('.chgwin:not([hidden]) .win-x').first(); if (await x.count()) { await x.click().catch(() => {}); await L.sleep(300) } }
  /* View-only Sched: the issued face keeps what it went out with */
  const vc = await viewChip()
  A.ok(`VIEW-ONLY SCHED: the issued face still says ${N}`, vc.length === 1 && vc[0].txt === N && /when this day was issued/.test(vc[0].title), vc)
  const vw = await A.openChip(p, `#vWeek .day[data-day="${SAT}"]`, iid)
  A.ok(`VIEW-ONLY SCHED: its window still lists ${whoCs} and says "when this day was issued"`, vw.open && vw.ids.includes(who) && String(vw.n) === N && /when this day was issued/.test(vw.from), { n: vw.n, from: vw.from, has: vw.ids.includes(who) })
  const vh = await p.evaluate(d => { const s = document.querySelector(`#vWeek .day[data-day="${d}"]`); const t = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; return { tag: t(s.querySelector('.verchip')), pend: t(s.querySelector('.dpend')), nys: t(s.querySelector('.nysmark')) } }, SAT)
  A.said(`View-only Sched: chip "${vc[0] && vc[0].txt}" — "${vc[0] && vc[0].title}"; window lists ${vw.n}; "${vw.from}"; the day's head there: tag "${vh.tag}", pending "${vh.pend}", not-yet-signed "${vh.nys}"`)
  await A.pic(L, p, 'A27-4-viewsched-issued-window')
  await A.closeWin(p)
  const cells = await lwCell(p, [...three, A.RANGER], iso)
  A.data(`Leave War ${iso} with the leave filed: ${JSON.stringify(cells)}`)
  A.ok('LEAVE WAR: still no FO / HO for the crowd men', Object.values(cells).every(x => x !== 'NO CELL DRAWN' && !/FO|HO/.test(x.text || '')), cells)
  await A.pic(L, p, 'A27-5-leavewar')
} catch (e) { A.ok('the scenario ran', false, String(e && e.stack || e).slice(0, 700)); await A.pic(L, p, 'A27-X-error').catch(() => {}) }

/* ---------------- A28 ---------------- */
A.scen('A28', 'Undo the leave (the top bar\'s Undo); then a reload')
try {
  await L.go(p, 'inputs')
  const u = await W.door(p, 'top', 'undo')
  A.said(`Undo (top bar "${u.title}") → ${JSON.stringify(u.toasts)}`)
  A.ok('the leave is gone from the Inputs', !(await A.reqOf(p, leave)), await A.reqOf(p, leave))
  const ec = await editChip()
  A.ok(`WORKING COPY: the chip is back to ${N}`, ec.length === 1 && ec[0].txt === N, ec)
  await W.showDay(p, SAT)
  const h = await W.head(p, SAT)
  A.said(`Saturday's head after the Undo: tag "${h.tag}", pending "${h.pending}", sign-off boxes ${JSON.stringify(h.signs)}`)
  A.ok('nothing is pending any more (the working copy equals what was issued)', !/pending/.test(h.pending), h.pending)
  A.ok('the four sign-offs are back', W.signsFull(h), h.signs)
  await A.pic(L, p, 'A28-1-editweek-after-undo')
  const vc = await viewChip()
  A.ok(`VIEW-ONLY SCHED: still ${N}`, vc.length === 1 && vc[0].txt === N, vc)
  await A.pic(L, p, 'A28-2-viewsched-after-undo')
  const n0 = L.results.length
  await L.reloadCompare(p, 'A28', 'a', { page: 'editsched' }); await W.toastSpy(p)
  A.ok('a reload gives back what was there and writes nothing', L.results.slice(n0).every(r => r.ok), L.results.slice(n0).filter(r => !r.ok))
  const ec2 = await editChip(); const vc2 = await viewChip()
  A.ok('after the reload: the working copy and the issued face both say ' + N, ec2[0] && ec2[0].txt === N && vc2[0] && vc2[0].txt === N, { edit: ec2[0] && ec2[0].txt, view: vc2[0] && vc2[0].txt })
  await A.pic(L, p, 'A28-3-viewsched-reloaded')
  /* what the plan menu and the view page's picker offer — for the roll-call's other rooms */
  await W.toEdit(L, p); await W.showDay(p, SAT)
  const pm = p.locator(`#eWeek [data-planmenu="${SAT}"]:visible`).first()
  if (await pm.count()) { await pm.click(); await L.sleep(400)
    A.data('the plans menu of Saturday: ' + await p.evaluate(() => { const m = [...document.querySelectorAll('.wavemenu')].pop(); return m ? [...m.querySelectorAll('.wm')].map(e => `[${[...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(' ')}] ${e.innerText.replace(/\s+/g, ' ').trim()}`).join(' || ') : 'no menu' }))
    await A.pic(L, p, 'A28-4-plans-menu'); await p.mouse.click(5, 895); await L.sleep(300) }
  await L.go(p, 'viewsched')
  A.data('the view page\'s Saturday picker: ' + await p.evaluate(d => { const s = document.querySelector(`#vWeek select[data-dver="${d}"], #vWeek select[data-vwork="${d}"]`); return s ? [...s.options].map(o => `${o.value}=${o.text}`).join(' | ') : 'no picker' }, SAT))
} catch (e) { A.ok('the scenario ran', false, String(e && e.stack || e).slice(0, 700)); await A.pic(L, p, 'A28-X-error').catch(() => {}) }
A.ok('no console error, page error or 4xx (whole world)', errors.length === 0, errors.slice(0, 5))
A.saveRows(process.env.HP_OUT.replace(/\.json$/, '-walk4.json'), { errors })
await browser.close()
