/* Walker A1 — publishing and the one Undo (28 Sep 26): Fable S12 (Undo of a publish is an Unpublish; Redo lands
   published with the four cleared; the changes window's lines), S12b (an Undo past the undone publish never hands the
   spent sign-offs back — register AM39c), S28 (the Unpublish button, then Undo; the version preview never left on a
   retracted version), S16 (a late input on a published day, then Undo: nothing pending, the four back — D98 / D103),
   S27 (Discard N edits & load, then Undo; "Discard marks", then Undo). Every gesture through the app's own controls.
   HP_W=390 for the phone. */
import { openA1, book, door, doorState, boardOn, boardOff, dayHead, signsEmpty, signsFull, changesLines, changesClose,
  signDay, publishDay, publishAL, unpublish, viewDay, lwOpen, lwCell, lwOilFig, lwCloseSheet, fileInput, go,
  planMenuItems, planMenuLook, boardText, txt, toasts, PHONE } from './cr-a1-lib.mjs'

const { browser, page, errors } = await openA1('a')
const bk = book('pub')
const SAT = 5, SUN = 6, FRI = 4
const ids = await page.evaluate(() => ({
  sat: window.DAYS[5].dutywaves.flatMap(b => b.rows.map(r => r.id)).filter(Boolean),
  sun: window.DAYS[6].dutywaves.flatMap(b => b.rows.map(r => r.id)).filter(Boolean),
  ranger: Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Ranger'),
  notes: [4, 5, 6].map(i => (window.DAYS[i].notes || []).length),
}))
bk.note('world', ids)
const satMan = ids.sat[0], sunMan = ids.sun[0]

async function lwRead(tag, id, iso) {
  await boardOff(page)
  await lwOpen(page, iso)
  const cell = await lwCell(page, id, iso)
  const fig = await lwOilFig(page, id).catch(e => ({ oil: 'ERR ' + e.message }))
  await lwCloseSheet(page)
  return { cell: cell.box, title: (cell.title || '').slice(0, 90), oil: fig.oil }
}

/* ---------- S12 — Undo of a publish is an Unpublish; Redo lands published with the four cleared ---------- */
const lw0 = await lwRead('before', satMan, '2026-07-18')
bk.note('S12.0', { what: 'the SDO man on Sat, before anything is published', lw: lw0 })
await boardOn(page, SAT)
const signed = await signDay(page, SAT, 0)
let h = await dayHead(page, SAT)
bk.ck('S12.1', 'Sat: the four signed on the board, Publish day enabled', signsFull(h) && h.beak && !h.beakOff, { signed, h })
const pr = await publishDay(page, SAT)
h = await dayHead(page, SAT)
const p1 = await bk.shot(page, 'sat-published')
bk.ck('S12.2', 'Publish day → the day wears ORIG, an Unpublish button', pr.pressed && /ORIG/.test(h.tag) && /Unpublish/.test(h.unpub), { pr, h }, p1)
const lw1 = await lwRead('published', satMan, '2026-07-18')
bk.note('S12.2b', { what: 'the Leave War once Sat is published', lw: lw1 })
await boardOn(page, SAT)
const st1 = await doorState(page, 'board')
const u1 = await door(page, 'board', 'undo')
h = await dayHead(page, SAT)
const p2 = await bk.shot(page, 'sat-undo-publish')
bk.ck('S12.3', 'board Undo → "Undid: publishing a day"; the day is a draft again, its four EMPTY, Publish day locked', u1.pressed && u1.toasts.some(t => /Undid: publishing a day/.test(t)) && !/ORIG/.test(h.tag) && signsEmpty(h) && h.beak && h.beakOff, { before: st1, u1, h }, p2)
const v1 = await viewDay(page, SAT)
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
const p3 = await bk.shot(page, 'sat-viewonly-after-undo')
bk.ck('S12.4', 'View-only Sched: Sat no longer shows ORIG (not published)', !!v1 && !/ORIG/.test(v1.tag || '') && !/ORIG/.test(v1.head || ''), { tag: v1 && v1.tag, head: v1 && v1.head && v1.head.slice(0, 120) }, p3)
const lw2 = await lwRead('undone', satMan, '2026-07-18')
bk.ck('S12.5', 'the Leave War: Sat\'s OIL credit (which the publish gave) is withdrawn while the day is unpublished (AM37)', (lw1.cell !== lw0.cell || lw1.oil !== lw0.oil) && lw2.cell === lw0.cell && lw2.oil === lw0.oil, { before: lw0, published: lw1, afterUndo: lw2 })
await boardOn(page, SAT)
const r1 = await door(page, 'board', 'redo')
h = await dayHead(page, SAT)
const p4 = await bk.shot(page, 'sat-redo-publish')
bk.ck('S12.6', 'board Redo → "Redid: publishing a day"; ORIG again, the four still EMPTY (AM39c)', r1.pressed && r1.toasts.some(t => /Redid: publishing a day/.test(t)) && /ORIG/.test(h.tag) && signsEmpty(h), { r1, h }, p4)
const lw3 = await lwRead('redone', satMan, '2026-07-18')
bk.ck('S12.7', 'the Leave War: the credit is back, exactly as after the first publish (never twice)', lw3.cell === lw1.cell && lw3.oil === lw1.oil, { published: lw1, afterRedo: lw3 })
const cw = await changesLines(page, 'Sat')
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
const p5 = await bk.shot(page, 'sat-changes-window')
const flat = (cw.lines || []).join(' ¦ ')
const iU = (cw.lines || []).findIndex(l => /Undo\s*—\s*publishing a day/.test(l)), iR = (cw.lines || []).findIndex(l => /Redo\s*—\s*publishing a day/.test(l))
const dayGroup = (cw.groups || []).find(g => /The day/.test(g.head))
bk.ck('S12.8', 'the changes window (Sat, All changes) lists "Undo — publishing a day" and "Redo — publishing a day" under "The day" (D263, D346 (1))', iU >= 0 && iR >= 0 && !!dayGroup && dayGroup.lines.some(l => /Undo — publishing/.test(l)) && dayGroup.lines.some(l => /Redo — publishing/.test(l)), { groups: (cw.groups || []).map(g => g.head + ': ' + g.lines.join(' / ').slice(0, 200)) }, p5)
await changesClose(page)

/* ---------- S12b — an Undo past the undone publish ---------- */
await boardOn(page, SAT)
const u2 = await door(page, 'board', 'undo')
h = await dayHead(page, SAT)
bk.ck('S12b.1', 'Undo again → the publish is taken back (a draft, four empty)', u2.toasts.some(t => /Undid: publishing a day/.test(t)) && !/ORIG/.test(h.tag) && signsEmpty(h), { u2, h })
const u3 = await door(page, 'board', 'undo')
h = await dayHead(page, SAT)
const p6 = await bk.shot(page, 'sat-undo-past-publish')
bk.ck('S12b.2', 'Undo once more (the last sign-off before the publish): the spent sign-offs are NOT handed back (AM39c)', signsEmpty(h) || h.signs.filter(s => s && !/name/.test(s)).length <= 0, { u3, signs: h.signs, tag: h.tag }, p6)
const r2 = await door(page, 'board', 'redo')
h = await dayHead(page, SAT)
bk.note('S12b.3', { what: 'Redo (the sign-off step)', r2, signs: h.signs, tag: h.tag })
const r3 = await door(page, 'board', 'redo')
h = await dayHead(page, SAT)
const p7 = await bk.shot(page, 'sat-redo-back-to-orig')
bk.ck('S12b.4', 'Redo again → published ORIG, the four empty (the publish\'s redo)', /ORIG/.test(h.tag) && signsEmpty(h), { r3, h }, p7)
const bs = await doorState(page, 'board')
bk.note('S12b.5', { what: 'the board pair now', bs })

/* ---------- S28 — the Unpublish button, then Undo ---------- */
await boardOn(page, SAT)
const noteKey = 'dn:5.0'
const n0 = await txt(page, noteKey)
await boardText(page, noteKey, 'WEEKEND - NO FLYING (A1 edit)')
h = await dayHead(page, SAT)
bk.ck('S28.0', 'Sat (published ORIG): an overall note changed → "1 pending"', /1\s*pending/.test(h.pending), { n0, h })
await signDay(page, SAT, 0)
const al = await publishAL(page, SAT)
h = await dayHead(page, SAT)
const p8 = await bk.shot(page, 'sat-al1-published')
bk.ck('S28.1', 'the four signed, Publish AL1 → the day wears AL1, nothing pending', al.pressed && /AL1/.test(h.tag) && !/pending/.test(h.pending), { al, h }, p8)
const un = await unpublish(page, SAT)
const unT = await toasts(page)
h = await dayHead(page, SAT)
const p9 = await bk.shot(page, 'sat-al1-unpublished')
bk.ck('S28.2', 'Unpublish (the button) → back to ORIG, the AL1 change pending again, the four cleared (AM34, AM37c)', un.pressed && /ORIG/.test(h.tag) && /1\s*pending/.test(h.pending) && signsEmpty(h), { un, unT, h }, p9)
const u4 = await door(page, 'board', 'undo')
h = await dayHead(page, SAT)
const p10 = await bk.shot(page, 'sat-undo-unpublish')
bk.ck('S28.3', 'board Undo → "Undid: taking a published day back"; AL1 current again, nothing pending', u4.toasts.some(t => /Undid: taking a published day back/.test(t)) && /AL1/.test(h.tag) && !/pending/.test(h.pending), { u4, h }, p10)
bk.note('S28.3b', { what: 'the sign-offs after the Unpublish is undone (Fable: record what shows)', signs: h.signs })
/* look at AL1 through the plans menu, then Undo while looking — the retracted version must not stay on screen */
let menu = []
try { menu = await planMenuItems(page, SAT) } catch (e) { menu = ['ERR ' + e.message] }
let looked = 'no AL1 row'
if (menu.some(m => m.does && /^look:/.test(m.does) && /AL1/.test(m.text))) { await planMenuLook(page, /AL1/); looked = 'looking at AL1' }
else await page.keyboard.press('Escape').catch(() => {})
h = await dayHead(page, SAT)
const p11 = await bk.shot(page, 'sat-look-al1')
bk.note('S28.4', { what: 'the plans menu, then a look at AL1', menu: menu.map(m => m.text + '→' + m.does), looked, h })
const u5 = await door(page, 'board', 'undo')
h = await dayHead(page, SAT)
const p12 = await bk.shot(page, 'sat-undo-while-looking')
const stillOnAL1 = /AL1/.test(h.prev) || /AL1/.test(h.planbtn)
bk.ck('S28.5', 'Undo while looking at AL1 → the AL1 publish is taken back and the look at the retracted AL1 is not left on screen', u5.pressed && !stillOnAL1 && /ORIG/.test(h.tag), { u5, h, looked }, p11 + ', ' + p12)

/* ---------- S16 — a late input on a published day, then Undo ---------- */
await boardOn(page, SUN)
await signDay(page, SUN, 0)
await publishDay(page, SUN)
h = await dayHead(page, SUN)
const p13 = await bk.shot(page, 'sun-published')
bk.ck('S16.0', 'Sun signed and published (ORIG); nothing pending (the four boxes empty again, ready for the next version)', /ORIG/.test(h.tag) && !/pending/.test(h.pending) && signsEmpty(h), { h }, p13)
/* "Published Sat, signed" (Fable S16): the four signed again on the published day, for the next version */
await signDay(page, SUN, 0)
h = await dayHead(page, SUN)
const signsPub = h.signs
bk.ck('S16.0b', 'the four signed again on published Sun (nothing pending)', signsFull(h) && !/pending/.test(h.pending), { h })
await boardOff(page)
const fi = await fileInput(page, { person: ids.ranger, type: 'LL', from: '2026-07-19' })
bk.note('S16.1', { what: 'the Inputs page: LL for Ranger on Sun 19 Jul', fi: { ...fi, toast: (fi.toast || '').slice(0, 120) } })
await go(page, 'editsched')
const toSun = async () => { await page.evaluate(() => { window.scrollTo(0, 0); const d = document.querySelector('#eWeek .day[data-day="6"]'); d && d.scrollIntoView({ inline: 'start', block: 'nearest' }); window.scrollTo(0, 0) }); await page.waitForTimeout(500) }
await toSun()
h = await dayHead(page, SUN)
const p14 = await bk.shot(page, 'sun-late-input')
bk.ck('S16.2', 'Sun reads "1 pending" and its four fall (D103)', /1\s*pending/.test(h.pending) && signsEmpty(h), { h, signsPub }, p14)
const vf = await viewDay(page, SUN)
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
const p15 = await bk.shot(page, 'sun-viewonly-issued')
bk.ck('S16.3', 'View-only Sched: the issued face does not show Ranger\'s LL (D178)', !!vf && !/Ranger/.test(vf.unavail || ''), { unavail: vf && vf.unavail.slice(0, 200), tag: vf && vf.tag }, p15)
await go(page, 'editsched')
await toSun()
const u6 = await door(page, 'top', 'undo')
await toSun()
h = await dayHead(page, SUN)
const p16 = await bk.shot(page, 'sun-undo-late-input')
const inpGone = await page.evaluate(r => !window.INPUTS.some(x => x.person === r && x.type === 'LL' && /Jul 19|2026-07-19/.test(String(x.date))), ids.ranger)
bk.ck('S16.4', 'top-bar Undo → "Undid: …"; Sun nothing pending, the four BACK (D98, D103 / AM11), the LL gone', u6.toasts.some(t => /^Undid:/.test(t)) && !/pending/.test(h.pending) && signsFull(h) && inpGone, { u6, h, inpGone, signsPub }, p16)
bk.note('S16.4b', { what: 'the bubble\'s words for one leave filed on the Inputs page', toasts: u6.toasts })

/* ---------- S27a — Discard N edits & load, then Undo (published Sun) ---------- */
await boardOn(page, SUN)
const k1 = 'dn:6.0', k2 = (ids.notes[2] > 1) ? 'dn:6.1' : null
const o1 = await txt(page, k1), o2 = k2 ? await txt(page, k2) : null
await boardText(page, k1, 'SUNDAY NOTE A1-1')
if (k2) await boardText(page, k2, 'SUNDAY NOTE A1-2')
else { await boardText(page, k1, 'SUNDAY NOTE A1-1b') }
h = await dayHead(page, SUN)
bk.note('S27a.0', { what: 'two edits on published Sun', o1, o2, h })
let menu2 = []
try { menu2 = await planMenuItems(page, SUN) } catch (e) { menu2 = ['ERR ' + e.message] }
if (menu2.some(m => m.does && /^look:/.test(m.does) && /ORIG|Original/.test(m.text))) await planMenuLook(page, /ORIG|Original/)
else await page.keyboard.press('Escape').catch(() => {})
await page.waitForTimeout(400)
const disc = page.locator('#schedBoard [data-restore]:visible').first()
let dl = 'no Discard button'
if (await disc.count()) { dl = (await disc.innerText()).trim(); await disc.click(); await page.waitForTimeout(600)
  const d2 = page.locator('#schedBoard [data-restore]:visible').first()
  if (await d2.count()) { dl += ' → ' + (await d2.innerText()).trim(); await d2.click(); await page.waitForTimeout(800) } }
const dT = await toasts(page)
h = await dayHead(page, SUN)
const a1 = await txt(page, k1)
const p17 = await bk.shot(page, 'sun-discard-load')
bk.ck('S27a.1', '"Discard N edits & load — confirm" on the Original → nothing pending, the notes back', /Discard/.test(dl) && !/pending/.test(h.pending) && a1 === o1, { dl, dT, h, a1 }, p17)
const u7 = await door(page, 'board', 'undo')
h = await dayHead(page, SUN)
const b1 = await txt(page, k1)
const marks = await page.evaluate(() => document.querySelectorAll('#schedBoard [data-alp]').length)
const p18 = await bk.shot(page, 'sun-undo-discard')
bk.ck('S27a.2', 'board Undo → the two edits and their pending count come back together, the marks back', u7.pressed && /2\s*pending/.test(h.pending) && b1 === 'SUNDAY NOTE A1-1' && marks >= 1, { u7, h, b1, marks }, p18)
const r4 = await door(page, 'board', 'redo')
h = await dayHead(page, SUN)
bk.ck('S27a.3', 'board Redo → discarded again, nothing pending', r4.pressed && !/pending/.test(h.pending) && (await txt(page, k1)) === o1, { r4, h })

/* ---------- S27b — "Discard marks" (an unpublished day), then Undo ---------- */
await boardOff(page)
await go(page, 'editsched')
await boardOn(page, FRI)
await boardText(page, 'dn:4.0', 'FRIDAY NOTE A1')
await boardOff(page)
const alp = async () => page.evaluate(() => { const b = document.querySelector('#alDrop'); const p = document.querySelector('#alPanel .al-pend'); return { drop: b ? { off: b.disabled, title: b.title } : null, pend: p ? p.textContent : null } })
const al0 = await alp()
const drop = page.locator('#alDrop:visible').first()
let pressed = false
if (await drop.count() && !(await drop.isDisabled())) { await drop.click(); await page.waitForTimeout(600); pressed = true }
const al1 = await alp()
const p19 = await bk.shot(page, 'fri-discard-marks')
bk.ck('S27b.1', 'the Amendments panel\'s "Discard marks" clears the unpublished Friday\'s marks (button then off)', pressed && al0.drop && !al0.drop.off && al1.drop && al1.drop.off, { al0, al1 }, p19)
const fnote = await txt(page, 'dn:4.0')
bk.note('S27b.1b', { what: 'Friday\'s note after Discard marks (the text stays; only the marks go)', fnote })
const u8 = await door(page, 'top', 'undo')
const al2 = await alp()
const p20 = await bk.shot(page, 'fri-undo-discard-marks')
bk.ck('S27b.2', 'top-bar Undo → "Undid: clearing a day\'s draft changes"; the marks back (Discard marks on again)', u8.toasts.some(t => /Undid: clearing a day/.test(t)) && al2.drop && !al2.drop.off, { u8, al2 }, p20)

bk.save(errors)
await browser.close()
