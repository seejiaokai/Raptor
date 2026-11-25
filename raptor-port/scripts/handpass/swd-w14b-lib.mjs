// swd-w14b-lib — walker w14b's helpers (the change lines and the read rule through ticks and postings: B1, B2, B3, B4, B7,
// B9; probe P6), chat 174, the night of 24–25 Nov 26. Built on w14a's passing helpers (swd-w14a-lib: + Wave, the armed seat)
// and the recipes under it (swd-w11-lib / swd-w12-lib: the bell reader, the words, the posting, Undo post out, the Quals tick;
// asp-w2-lib; sah-w10-lib). Copied, never edited. window.* is only READ here (and window.go, the recipes' own page switch).
import './swd-w14b-env.mjs'
import path from 'node:path'
const Z = await import('./swd-w14a-lib.mjs')
export { Z }
export const { K, X, T, L, W5, RANGER, HEX, CASPER, D, ISO, DI, WK1, WK2, WORDS, lineIs, remIs, bell, say, sayB, readReminder, need, asR, asS, post, file, tick, filings, scene, sleep, planSim, remDays, remSay, J, addLine, armSeat, crewSay } = Z
export const asH = (p, W) => T.as(p, W, 'hex', 'x')
export const NAME = { bane: 'Ranger', rocky: 'Hex' }

/* the Quals tick of any man (L.qualsTick presses his SANS cell once — a toggle), asserted */
export async function tickOf(p, W, id, want, sid) {
  const q = await L.qualsTick(p, W, id, sid)
  need(W, sid, `Quals → Edit → ${NAME[id]}'s SANS ${want ? 'ticked' : 'unticked'} → Done`, q.st && q.st.san === want, J(q.st), q.pic)
  await sleep(200)
  return q
}
/* a flying line 21:00–22:00 on day di (week 1), its FCP armed, `id` picked, read back */
export async function seatOn(p, W, sid, di, id = RANGER, o = {}) {
  const a = await addLine(p, W, di, { cs: o.cs || 'W14B', to: o.to || '21:00', ld: o.ld || '22:00' })
  const seat = o.seat || (id === HEX ? 'w' : 'p')
  const r = a.wi >= 0 ? await armSeat(p, W, `${di}.${a.wi}.0.0.${seat}`, `${sid.replace(/\./g, '-')}-seat`, true, id) : { placed: false, c: null, pic: '' }
  need(W, sid, `a flying line ${o.to || '21:00'}–${o.ld || '22:00'} on day ${di}, its ${seat === 'w' ? 'RCP' : 'FCP'} armed and ${NAME[id]} picked (read back)`, r.placed, `${J(a.f)} · while armed: ${crewSay(r.c)}`, r.pic)
  await L.closeBoard(p, W)
  return a
}
/* Post out → SANS from `iso` for any man (a ticked man too: his cell sits in the SANS group, "+ SANS" on first) */
export async function postAny(p, W, id, iso, sid) {
  await K.warReady(p)
  const r = await L.postOut(p, W, id, iso, sid.replace(/\./g, '-'))
  need(W, sid, `Saber: ${NAME[id]}'s ${iso.slice(8)} Jul cell → ⋯ → Post out → SANS → Post out`, /becomes SANS/.test(r.line || ''), `sheet said "${r.line}" · record ${J(r.after)}`, r.pic)
  return r
}
/* the seat emptied: the man's puck on that seat taken off by the board's own control — not needed by w14b; kept out */

/* the man files a SANS availability for himself (Fly; one day or a run) on the SANS tab, asserted */
export async function fileMe(p, W, who, from, to, sid, kinds = ['fly']) {
  const f = await T.file(p, W, from, null, kinds, null, sid, to && to !== from ? { endIso: to } : {})
  need(W, sid, `${who} files ${kinds.join('+')} ${from}${to && to !== from ? ' to ' + to : ''} on the SANS tab`, !!f.iid, f.iid ? J(f.made) : f.refused, f.pic)
  await T.closeAll(p, W)
  return f
}
/* the top bar's Undo / Redo, its title read before the press; the man's SANS record read after */
export async function topBar(p, W, which, id, tag) {
  const sel = which === 'undo' ? '#undoBtn' : '#redoBtn'
  await T.closeAll(p, W)
  const b = p.locator(sel).first()
  const title = await b.getAttribute('title').catch(() => '')
  const dis = await b.isDisabled().catch(() => 'no button')
  if (dis === false) { await W.press(p, `${sel}:visible`, which); await sleep(800) }
  const after = await T.rec(p, id)
  const toast = await L.toastSaid(p)
  const pic = tag ? await W.pic(p, tag) : ''
  return { title, pressed: dis === false, dis, after, toast, pic }
}
export const tbSay = t => `${t.pressed ? 'pressed' : 'NOT pressed (' + t.dis + ')'} "${t.title}" → record ${J(t.after)} · note "${t.toast}"`
/* "+ SANS" on in the Leave War's ⚙ (a ticked man's cell sits in the SANS group) */
export async function sansOn(p, W, sid) {
  await K.warReady(p)
  const g = await L.sansGroup(p, W, true, sid.replace(/\./g, '-'))
  need(W, sid, 'Leave War ⚙ → "+ SANS" on (the SANS group shows)', g.group, `group ${g.group}`, g.pic)
}
/* the store's record of who holds what in the loaded week (read only) */
export const holds = (p, id) => T.holds(p, id)
/* every bell line that carries a given sentence, live (not struck) */
export const withWords = (b, re) => b.lines.filter(l => !l.struck.length && re.test(l.title + ' ' + l.body))
export const saysWords = (b, re) => b.lines.filter(l => re.test(l.all || (l.title + ' ' + l.body)))
/* Saber files a titled input (a Meeting) for a man through the Inputs calendar's day and its "+ Input" (copied from
   isr-A-lib fileOn: incalMonth, openDay; the presses through W.press so the phone gets its tap pictures) */
const MON3 = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
export async function meeting(p, W, iso, id, title, from, to, tag) {
  await T.closeAll(p, W)
  await L.go(p, 'inputs')
  if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await W.press(p, '#inCalBtn', 'incal')
  const y = +iso.slice(0, 4), m = +iso.slice(5, 7)
  for (let i = 0; i < 30; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MON3.indexOf(name.slice(0, 3)))
    if (!d) break
    await W.press(p, d > 0 ? '#icNext' : '#icPrev', 'icmon'); await sleep(400)
  }
  await sleep(400)
  await p.locator(`#inpCal [data-icday="${iso}"]`).focus()
  await p.keyboard.press('Enter')
  await p.locator('[data-testid="win-inputsday"]').waitFor({ timeout: 6000 })
  await sleep(300)
  const before = await p.evaluate(() => window.INPUTS.map(r => String(r.iid)))
  await W.press(p, '#icPopAdd', 'icadd')
  await p.locator('#inpEditPop #inpEditType').waitFor()
  await p.selectOption('#inpEditPop #inpEditType', 'Meeting')
  if (await p.locator('#inpEditPop #inpEditPerson').count()) await p.selectOption('#inpEditPop #inpEditPerson', id)
  const ad = p.locator('#inpEditPop #inpEditAllday')
  if (await ad.count() && await ad.isChecked()) await ad.click()
  await p.fill('#inpEditPop #inpEditStart', from); await p.fill('#inpEditPop #inpEditEnd', to)
  if (await p.locator('#inpEditPop #inpEditOwnTitle').count()) await p.fill('#inpEditPop #inpEditOwnTitle', title)
  const pic0 = await W.pic(p, tag + '-form')
  await W.press(p, '#inpEditSave', 'save'); await sleep(500)
  if (await p.locator('[data-testid="oilconf"]').count()) { await W.press(p, '[data-testid="oil-yes"]', 'oil-yes'); await W.press(p, '[data-testid="oilconf-save"]', 'oil-save') }
  if (await p.locator('[data-testid="docconf-nodoc"]').count()) await W.press(p, '[data-testid="docconf-nodoc"]', 'nodoc')
  const x = p.locator('[data-testid="win-inputsday-x"]:visible'); if (await x.count()) await W.press(p, x.first(), 'day-x')
  const made = await p.evaluate(b => window.INPUTS.filter(r => !b.includes(String(r.iid))).map(r => ({ iid: r.iid, type: r.type, title: r.title, date: r.date, people: JSON.stringify(r.people || r.person).slice(0, 60) })), before)
  return { made, pic: pic0 + ', ' + await W.pic(p, tag + '-saved') }
}
export const OUT = L.OUT
export const tapsDir = path.join(L.OUT, 'taps')
