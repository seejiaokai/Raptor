/* Walker A1 — OIL Earn and the one Undo (28 Sep 26): Fable S11 / Astra 16 (Undo stops at the door of the mode, from the
   BOARD's pair and from the TOP BAR's pair; a Redo inside the mode) and Astra 17 (Publish → OIL → Undo back through the
   mode and the publish → Redo through both → reload; the Leave War credits exactly once). Every gesture through the
   app's own controls (OIL Earn, the pucks, the fill zone and the crew palette, the sign-offs, Publish day, the pairs).
   HP_W=390 for the phone. */
import { openA1, book, door, doorState, boardOn, boardOff, dayHead, signsEmpty, signDay, publishDay, lwOpen, lwCell,
  lwOilFig, lwCloseSheet, put, oilPucks, oilOn, oilTap, oilButton, boardText, txt, toasts, spy, login, PHONE } from './cr-a1-lib.mjs'

const { browser, page, errors } = await openA1('a')
const bk = book('oil')
const SAT = 5, SUN = 6
const w = await page.evaluate(() => ({
  sat: window.DAYS[5].dutywaves[0].rows[0].id, sun: window.DAYS[6].dutywaves[0].rows[0].id,
  n5: window.DAYS[5].notes, n6: window.DAYS[6].notes,
}))
bk.note('world', w)
const lwRead = async (id, iso) => {
  await boardOff(page); await lwOpen(page, iso)
  const c = await lwCell(page, id, iso); const f = await lwOilFig(page, id).catch(e => ({ oil: 'ERR ' + e.message })); await lwCloseSheet(page)
  return { cell: c.box, oil: f.oil }
}
const onOf = (ps, who, item) => { const p = ps.find(x => x.who === who && x.item === item); return p ? p.on : null }

/* ---------- S11 / Astra 16 — the BOARD's pair ---------- */
await boardOn(page, SAT)
const pal = await page.evaluate(x => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')].map(e => e.dataset.person).filter(v => v && v !== 'allavail' && v !== 'all' && v !== x), w.sat)
const second = await put(page, `[data-fill="d:${SAT}.0.0.+"]`, pal.slice(0, 6))
bk.note('S11.0', { what: 'a second man put on Saturday\'s SDO desk (the fill zone, then the crew palette)', second })
await boardText(page, `dn:${SAT}.0`, 'OIL WALK NOTE')
const e0 = await txt(page, `dn:${SAT}.0`)
const ob = await oilButton(page)
let ps = await oilPucks(page)
const desk = ps.length ? ps[0].item : null
const men = ps.filter(p => p.item === desk).map(p => p.who)
bk.ck('S11.1', 'a note changed (e0), then OIL Earn on: the desk opens into its pucks, each earning', await oilOn(page) && men.length >= 2 && ps.filter(p => p.item === desk).every(p => p.on) && e0 === 'OIL WALK NOTE', { ob, e0, pucks: ps }, await bk.shot(page, 'sat-oil-on'))
await oilTap(page, men[0], desk)
await oilTap(page, men[1], desk)
ps = await oilPucks(page)
const pA = await bk.shot(page, 'sat-two-off')
bk.ck('S11.2', 'two pucks tapped (e1, e2): both off, the mode still on', onOf(ps, men[0], desk) === false && onOf(ps, men[1], desk) === false && await oilOn(page), { pucks: ps, t: await toasts(page) }, pA)
let u = await door(page, 'board', 'undo')
ps = await oilPucks(page)
bk.ck('S11.3', 'board Undo → "Undid: an OIL decision"; the second puck earns again, the first still off, the mode on', u.toasts.some(t => /Undid: an OIL decision/.test(t)) && onOf(ps, men[1], desk) === true && onOf(ps, men[0], desk) === false && await oilOn(page), { u, ps })
let r = await door(page, 'board', 'redo')
ps = await oilPucks(page)
const pB = await bk.shot(page, 'sat-redo-in-mode')
bk.ck('S11.4', 'board Redo inside the mode → "Redid: an OIL decision"; the second puck off again, the mode on', r.toasts.some(t => /Redid: an OIL decision/.test(t)) && onOf(ps, men[1], desk) === false && await oilOn(page), { r, ps }, pB)
u = await door(page, 'board', 'undo'); const u2 = await door(page, 'board', 'undo')
ps = await oilPucks(page)
const pC = await bk.shot(page, 'sat-both-back')
bk.ck('S11.5', 'Undo, Undo → both pucks earn again (both bars back), the mode still on', onOf(ps, men[0], desk) === true && onOf(ps, men[1], desk) === true && await oilOn(page), { u, u2, ps }, pC)
u = await door(page, 'board', 'undo')
const noteAfterDoor = await txt(page, `dn:${SAT}.0`)
const pD = await bk.shot(page, 'sat-left-oil')
bk.ck('S11.6', 'the next Undo only LEAVES the mode: "Left OIL Earn — the next undo would change the day itself"; the note untouched', u.toasts.some(t => /Left OIL Earn — the next undo would change the day itself/.test(t)) && !(await oilOn(page)) && noteAfterDoor === 'OIL WALK NOTE', { u, noteAfterDoor }, pD)
u = await door(page, 'board', 'undo')
const noteBack = await txt(page, `dn:${SAT}.0`)
const pE = await bk.shot(page, 'sat-note-undone')
bk.ck('S11.7', 'the next Undo reverses e0 (the note), outside the mode', /^Undid:/.test(u.toasts.join(' ')) && noteBack === 'WEEKEND - NO FLYING', { u, noteBack }, pE)

/* ---------- S11 / Astra 16 — the TOP BAR's pair (the board closed while the mode is on) ---------- */
await boardText(page, `dn:${SAT}.1`, 'OIL WALK NOTE 2')
await oilButton(page)
await oilTap(page, men[0], desk)
await oilTap(page, men[1], desk)
ps = await oilPucks(page)
bk.ck('T16.1', 'again: a note (e0), OIL Earn on, two pucks off', onOf(ps, men[0], desk) === false && onOf(ps, men[1], desk) === false, { ps })
await boardOff(page)
await page.evaluate(() => window.scrollTo(0, 0))
const tsd = await doorState(page, 'top')
const pF = await bk.shot(page, 'week-board-closed-mode-on')
bk.note('T16.2', { what: 'the board closed with the mode on — the top bar pair', tsd }, pF)
const tu1 = await door(page, 'top', 'undo'), tu2 = await door(page, 'top', 'undo')
bk.ck('T16.3', 'top-bar Undo, Undo → "Undid: an OIL decision" twice', tu1.toasts.some(t => /Undid: an OIL decision/.test(t)) && tu2.toasts.some(t => /Undid: an OIL decision/.test(t)), { tu1, tu2 })
/* closing the board LEFT the mode (state/view.ts setBoardDay: any board-day change clears it), so no mode is open
   when the top bar's pair can be pressed: the next Undo is the note, with no door message — the top bar's own
   "Left OIL Earn" guard (Shell.tsx) can never be met, since the top bar sits behind the board while the mode is on */
const tu3 = await door(page, 'top', 'undo')
const n2a = await txt(page, `dn:${SAT}.1`)
const pG = await bk.shot(page, 'week-note-undone')
bk.ck('T16.4', 'top-bar Undo (no mode open any more) → the note (e0) reverses, no door message', !tu3.toasts.some(t => /Left OIL Earn/.test(t)) && /^Undid:/.test(tu3.toasts.join(' ')) && n2a === 'DUTY CREW ON CALL', { tu3, n2a }, pG)
const tu4 = await door(page, 'top', 'undo')
const who2 = await page.evaluate(() => (window.DAYS[5].dutywaves[0].rows[0].more || []).length)
bk.ck('T16.5', 'top-bar Undo once more → the second man taken off the SDO desk (the setup change)', /^Undid:/.test(tu4.toasts.join(' ')) && who2 === 0, { tu4, who2 })
await boardOn(page, SAT)
ps = await oilPucks(page)
const pH = await bk.shot(page, 'sat-board-reopened')
bk.ck('T16.6', 'the board reopened: the mode is off, nothing half-done', !(await oilOn(page)) && ps.length === 0, { ps }, pH)

/* ---------- Astra 17 — Publish → OIL → Undo through the publish → Redo → reload ---------- */
const lw0 = await lwRead(w.sun, '2026-07-19')
await boardOn(page, SUN)
await signDay(page, SUN, 0)
await publishDay(page, SUN)
let h = await dayHead(page, SUN)
const lw1 = await lwRead(w.sun, '2026-07-19')
bk.ck('A17.1', 'Sun published (ORIG): the SDO man is credited once on the Leave War', /ORIG/.test(h.tag) && lw1.oil !== lw0.oil, { h: h.tag, lw0, lw1 })
await boardOn(page, SUN)
await oilButton(page)
ps = await oilPucks(page)
const sdesk = ps.length ? ps[0].item : null
await oilTap(page, w.sun, sdesk)
ps = await oilPucks(page)
h = await dayHead(page, SUN)
const pI = await bk.shot(page, 'sun-oil-off')
bk.ck('A17.2', 'OIL Earn on published Sun, the SDO man tapped off: the day reads pending (what it earns changed)', onOf(ps, w.sun, sdesk) === false && /pending/.test(h.pending), { ps, h: { tag: h.tag, pending: h.pending } }, pI)
/* (the Leave War is read only once the mode is behind us: going there closes the board, and closing the board leaves
   the mode — which would move the door this step is testing) */
const a1 = await door(page, 'board', 'undo'), a2 = await door(page, 'board', 'undo'), a3 = await door(page, 'board', 'undo')
h = await dayHead(page, SUN)
const pJ = await bk.shot(page, 'sun-undone-through-publish')
bk.ck('A17.4', 'Undo ×3 → the OIL decision back, then "Left OIL Earn", then "Undid: publishing a day" (a draft, the four empty)',
  a1.toasts.some(t => /Undid: an OIL decision/.test(t)) && a2.toasts.some(t => /Left OIL Earn/.test(t)) && a3.toasts.some(t => /Undid: publishing a day/.test(t)) && !/ORIG/.test(h.tag) && signsEmpty(h),
  { a1: a1.toasts, a2: a2.toasts, a3: a3.toasts, h: { tag: h.tag, signs: h.signs } }, pJ)
const lw3 = await lwRead(w.sun, '2026-07-19')
bk.ck('A17.5', 'the Leave War: the credit withdrawn while Sun is unpublished', lw3.oil === lw0.oil && lw3.cell === lw0.cell, { lw0, lw3 })
await boardOn(page, SUN)
const b1 = await door(page, 'board', 'redo')
h = await dayHead(page, SUN)
bk.ck('A17.6', 'Redo → "Redid: publishing a day": ORIG, the four empty', b1.toasts.some(t => /Redid: publishing a day/.test(t)) && /ORIG/.test(h.tag) && signsEmpty(h), { b1: b1.toasts, h: { tag: h.tag, signs: h.signs } })
const lw4 = await lwRead(w.sun, '2026-07-19')
bk.ck('A17.7', 'the Leave War: credited again, exactly once', lw4.oil === lw1.oil && lw4.cell === lw1.cell, { lw1, lw4 })
await boardOn(page, SUN)
const b2 = await door(page, 'board', 'redo')
h = await dayHead(page, SUN)
ps = await oilPucks(page)
const pK = await bk.shot(page, 'sun-redo-oil-outside-mode')
bk.ck('A17.8', 'Redo → "Redid: an OIL decision" (outside the mode): the day reads pending again, the mode not reopened', b2.toasts.some(t => /Redid: an OIL decision/.test(t)) && /pending/.test(h.pending) && !(await oilOn(page)), { b2: b2.toasts, h: { tag: h.tag, pending: h.pending } }, pK)
const lw5 = await lwRead(w.sun, '2026-07-19')
bk.ck('A17.9', 'the Leave War keeps what the ISSUED day earns (credited once) while the OIL change is pending, not out', lw5.oil === lw1.oil && lw5.cell === lw1.cell, { lw1, lw5 })
/* reload */
await page.reload()
await login(page, 'a'); await spy(page)
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(700)
await boardOn(page, SUN)
h = await dayHead(page, SUN)
const bsr = await doorState(page, 'board')
await oilButton(page)
ps = await oilPucks(page)
const pL = await bk.shot(page, 'sun-after-reload')
bk.ck('A17.10', 'after a reload: Sun still ORIG with its OIL decision pending (the man still off); Undo and Redo empty (history is per sign-in)', /ORIG/.test(h.tag) && /pending/.test(h.pending) && onOf(ps, w.sun, sdesk) === false && /^off/.test(bsr.undo) && /^off/.test(bsr.redo), { h: { tag: h.tag, pending: h.pending }, bsr, ps }, pL)
await oilButton(page)
const lw6 = await lwRead(w.sun, '2026-07-19')
bk.ck('A17.11', 'after a reload the Leave War still credits Sun once', lw6.oil === lw1.oil && lw6.cell === lw1.cell, { lw1, lw6 })

bk.save(errors)
await browser.close()
