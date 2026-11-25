// swd-w14d-lib — walker w14d's helpers ("the calendar's doors, the merged bell, the plain-user round": B5, B6, A3, A4, A6,
// A8, A9, D1–D3, E; probes P9, P10), chat 174, the night of 24–25 Nov 26. Built on the passing helpers of the earlier parts
// (swd-w14c-lib → swd-w14b-lib → swd-w14a-lib → swd-w12-lib → swd-w11-lib), w13's SANS-calendar doors (swd-w13-lib), the
// Calendar window's no-fly step (cal-A-lib2's calSet, copied) and the words pass's input window (wr4-lib's openDay /
// answerAsks / fileInput / editInput, copied — that file launches a browser on import). Copied, never edited.
// window.* is only READ here (and window.go, the recipes' own page switch). Every staging step is the app's own controls.
import './swd-w14d-env.mjs'
import path from 'node:path'
import { writeFileSync } from 'node:fs'
const Z = await import('./swd-w14c-lib.mjs')
export const M = await import('./swd-w13-lib.mjs')
export const { K, X, T, L, W5, RANGER, HEX, CASPER, D, ISO, DI, WK1, WK2, WORDS, lineIs, remIs, bell, say, sayB, readReminder, need, asR, asS, asH,
  scene, sleep, planSim, remDays, J, tickOf, seatOn, fileMe, topBar, tbSay, postAny, withWords, moveTo, tapAndRead, tapSay, barLook } = Z
export const OUT = L.OUT
export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const md = iso => `${MON[+iso.slice(5, 7) - 1]} ${+iso.slice(8)}`
export const I = { ...M.ISO, 15: '2026-07-15', 20: '2026-07-20', 27: '2026-07-27', 28: '2026-07-28', 30: '2026-07-30' }
export const srt = x => String(x).split('+').sort().join('+')
export const recIs = (m, who, from, to) => !!m && srt(m.who) === srt(who) && m.date === md(from) && (to && to !== from ? m.end === md(to) : !m.end || m.end === md(from))

/* one scenario at one size, a fresh context (a fresh store), the clock installed before load; Saber signed in. 'pc' = the
   phone's size in Chromium with real fingers over CDP, only for a held finger drag (WebKit's in-page touches drive no
   pointer events, walk-scripts §4) — w13's run, copied */
export async function run(name, szKey, fn, when = '2026-07-15T09:00:00') {
  const sz = szKey === 'pc' ? X.PC : L.SIZES[szKey], W = L.mk(name, sz)
  if (szKey === 'pc') { W.isPhone = true; W.touchCdp = true }
  const { b, ctx, p } = await L.world(sz, W, when)
  try {
    await L.signIn(p, 'ad', 'a')
    W.rec('today', "the app's today (page clock), Saber signed in", null, await L.today(p))
    await fn(p, W, ctx)
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 500), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 10).join(' || '))
  await b.close()
  writeFileSync(path.join(OUT, `results-${name}-${sz.name}.json`), JSON.stringify(L.results.filter(r => r.scn === name && r.size === sz.name), null, 1))
}

/* ---- the SANS calendar ---- */
/* a saved filing opened from its day's line, its window's Dates calendar tapped (first day, then the last: a tap after a whole
   run starts a new pick), Save pressed; the note, whether the window stayed, the record read back by its id */
export async function editDates(p, W, iso, iid, taps, tag) {
  await T.closeAll(p, W)
  await M.onSans(p, W)
  const o = await X.openLine(p, W, iso, iid, tag)
  if (!o.ok) return { ok: false, why: o.why, pic: o.pic }
  for (const d of taps) await X.tapWinDate(p, W, d)
  const dd = await M.winDates(p), r = await X.inpRead(p)
  const pic0 = await W.pic(p, tag + '-form')
  if (!r || !r.save) return { ok: false, noSave: true, r, dd, pic: o.pic + ', ' + pic0 }
  const a = await M.add(p, W, tag)
  const rec = (await M.sansRecs(p)).find(x => x.iid === iid)
  return { ok: true, said: a.said, shown: a.shown, stayed: a.stayed, made: a.made, rec, dd, r, pic: o.pic + ', ' + pic0 + ', ' + a.pic }
}
/* the day's "+ Commitment" read without pressing: enabled / greyed and its words; on the phone also whether the words stand
   inside the window's drawn box at both heights (as opened, then after a tap on its top bar) */
export async function addState(p, W, iso, tag) {
  const pg = await M.sday(p, W, iso)
  const pic = await W.pic(p, tag)
  let heights = ''
  if (W.isPhone && pg.win) {
    const geo = () => p.evaluate(() => {
      const w = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(e => e.getBoundingClientRect().width > 0)
      if (!w) return 'gone'
      const r = w.getBoundingClientRect(), why = w.querySelector('[data-testid="sd-addwhy"]')
      const b = why ? why.getBoundingClientRect() : null
      const inside = b ? (b.width > 0 && b.top >= Math.max(0, r.top) - 0.5 && b.bottom <= Math.min(innerHeight, r.bottom) + 0.5) : 'no words'
      return `window top ${Math.round(r.top)} height ${Math.round(r.height)} · words ${b ? `${Math.round(b.top)}–${Math.round(b.bottom)}` : 'none'} inside the visible window: ${inside}`
    })
    const g1 = await geo()
    const bar = await p.evaluate(() => { const w = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(e => e.getBoundingClientRect().width > 0); const r = w.getBoundingClientRect(); return [r.x, r.y] })
    await p.touchscreen.tap(bar[0] + 200, bar[1] + 20); await sleep(60)
    await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-bar-now-phone.png`) }); await sleep(600)
    const g2 = await geo()
    heights = `as opened: ${g1} | after a tap on its top bar: ${g2}`
    pg.pic2 = await W.pic(p, tag + '-h2')
  }
  await X.sansX(p, W)
  return { add: pg.win ? pg.win.add : 'no window', why: pg.win ? pg.win.addwhy : '', heights, pic: pic + (pg.pic2 ? ', ' + pg.pic2 : '') }
}
export const sayAdd = r => `+ Commitment ${r.add}${r.why ? ' · "' + r.why + '"' : ' · no words'}${r.heights ? ' · ' + r.heights : ''}`

/* ---- P9: the Calendar window (the SANS day's "Days" door), one date set no fly; cal-A-lib2 calGoto / calSet copied ---- */
const tid = (p, id) => p.locator(`[data-testid="${id}"]`)
const MONS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export async function noFly(p, W, iso, tag) {
  await T.closeAll(p, W)
  await M.sday(p, W, iso)
  const door = tid(p, 'sd-days').first()
  if (!(await door.count())) return { ok: false, why: 'no "Days" door in the SANS day window', pic: await W.pic(p, tag + '-nodoor') }
  await W.press(p, door, 'sd-days')
  await tid(p, 'win-days').first().waitFor({ timeout: 6000 }).catch(() => {}); await sleep(600)
  const tab = tid(p, 'days-tab-month').first(); if (await tab.count()) { await W.press(p, tab, 'days-tab-month'); await sleep(200) }
  for (let i = 0; i < 24; i++) {
    const [m, y] = ((await tid(p, 'days-month').first().textContent()) || '').trim().toLowerCase().split(/\s+/)
    const d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - (+y * 12 + MONS.findIndex(x => x.startsWith(m.slice(0, 3))))
    if (!d) break
    await W.press(p, tid(p, d > 0 ? 'days-next' : 'days-prev').first(), 'days-step'); await sleep(300)
  }
  const before = await p.evaluate(iso => { try { return window.lwDayFacts(iso).kind } catch (e) { return 'unread' } }, iso)
  let how
  const key = tid(p, `days-nf-${iso}`).first()
  if (await key.count() && await key.isVisible()) { await W.press(p, key, 'days-nf'); how = 'the date\'s NF key'; await sleep(400) }
  else {
    how = 'the date\'s stepping button'
    for (let i = 0; i < 4; i++) {
      const s = tid(p, 'days-step-' + iso).first()
      if (!(await s.count())) { how += ' (none)'; break }
      if ((await s.getAttribute('data-cls')) === 'nf') break
      await W.press(p, s, 'days-step-' + iso.slice(8)); await sleep(350)
    }
  }
  const pic = await W.pic(p, tag + '-days')
  const after = await p.evaluate(iso => { try { const f = window.lwDayFacts(iso), a = window.flyAnswer(iso); return { kind: f.kind, cls: a && a.cls } } catch (e) { return 'unread ' + e.message } }, iso)
  const x = tid(p, 'win-days-x').first(); if (await x.count()) { await W.press(p, x, 'days-x'); await sleep(300) }
  await X.sansX(p, W)
  return { ok: true, how, before, after, pic }
}

/* ---- the Inputs page: a titled input, an LL; its own window (wr4-lib's openDay / answerAsks / fileInput / editInput,
   copied, pressing through W.press so the phone's taps are pictured) ---- */
const MONTHS3 = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
export async function inDay(p, W, iso) {
  await T.closeAll(p, W)
  await L.go(p, 'inputs')
  if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await W.press(p, '#inCalBtn', 'incal')
  for (let i = 0; i < 30; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - (+year * 12 + MONTHS3.indexOf(name.slice(0, 3)))
    if (!d) break
    await W.press(p, d > 0 ? '#icNext' : '#icPrev', 'icmon'); await sleep(350)
  }
  await sleep(400)
  await p.locator(`#inpCal [data-icday="${iso}"]`).focus()
  await p.keyboard.press('Enter')
  await p.locator('[data-testid="win-inputsday"]').waitFor({ timeout: 6000 })
  await sleep(350)
}
export async function answerAsks(p, W) {
  const asked = []
  for (let i = 0; i < 5; i++) {
    await sleep(350)
    if (await p.locator('[data-testid="docconf-nodoc"]:visible').count()) { asked.push('document'); await W.press(p, '[data-testid="docconf-nodoc"]:visible', 'nodoc'); continue }
    if (await p.locator('[data-testid="oilconf"]:visible').count()) {
      asked.push('oil')
      const y = p.locator('[data-testid="oil-all"]:visible, [data-testid="oil-yes"]:visible')
      if (await y.count()) await W.press(p, y.first(), 'oil-yes')
      await W.press(p, '[data-testid="oilconf-save"]:visible', 'oil-save'); continue
    }
    if (await p.locator('[data-testid="inped-swap-go"]:visible').count()) { asked.push('swap'); await W.press(p, '[data-testid="inped-swap-go"]:visible', 'swap'); continue }
    break
  }
  return asked
}
export const ids = p => p.evaluate(() => window.INPUTS.map(r => String(r.iid)))
export const recOf = (p, iid) => p.evaluate(i => { const r = window.INPUTS.find(x => String(x.iid) === String(i)); return r ? { type: r.type, title: r.title, date: r.date, endDate: r.endDate, allday: r.allday, half: r.half, s: r.s, e: r.e, remarks: r.remarks, person: r.person, people: (r.people || []).map(q => q.p || q) } : null }, iid)
/* Saber's notices for one man, as stored (read only): how many, and the newest's words */
export const notes = (p, to) => p.evaluate(to => (window.NOTICES || []).filter(n => n.to === to).map(n => ({ id: n.id, name: n.name, day: n.day, what: n.what, iid: n.iid })), to)
export async function fileIn(p, W, iso, spec, tag) {
  await inDay(p, W, iso)
  const before = await ids(p)
  await W.press(p, '#icPopAdd', 'icadd')
  await p.locator('#inpEditPop #inpEditType').waitFor()
  await p.selectOption('#inpEditPop #inpEditType', spec.type); await sleep(200)
  if (spec.who && await p.locator('#inpEditPop #inpEditPerson').count()) { await p.selectOption('#inpEditPop #inpEditPerson', spec.who); await sleep(200) }
  if (spec.span && await p.locator(`#inpEditSpan [data-span="${spec.span}"]`).count()) await W.press(p, `#inpEditSpan [data-span="${spec.span}"]`, 'span')
  if (spec.from) {
    const ad = p.locator('#inpEditPop #inpEditAllday')
    if (await p.locator('#inpEditSpan [data-span="custom"]').count()) await W.press(p, '#inpEditSpan [data-span="custom"]', 'span-custom')
    else if (await ad.count() && await ad.isChecked()) await ad.click()
    await p.fill('#inpEditPop #inpEditStart', spec.from); await p.fill('#inpEditPop #inpEditEnd', spec.to)
  }
  if (spec.title) { const t = p.locator('#inpEditPop #inpEditOwnTitle'); if (await t.count()) await t.fill(spec.title) }
  if (spec.remarks) await p.fill('#inpEditPop #inpEditRmk', spec.remarks)
  const pic0 = await W.pic(p, tag + '-form')
  await W.press(p, '#inpEditSave:visible', 'save')
  const asked = await answerAsks(p, W)
  const made = (await ids(p)).filter(x => !before.includes(x))
  const pic = await W.pic(p, tag + '-saved')
  if (await p.locator('[data-testid="win-inputedit"]:visible').count()) { await p.keyboard.press('Escape'); await sleep(300) }
  const x = p.locator('[data-testid="win-inputsday-x"]:visible'); if (await x.count()) await W.press(p, x.first(), 'day-x')
  return { iid: made.length === 1 ? made[0] : null, made, asked, rec: made.length === 1 ? await recOf(p, made[0]) : null, pic: pic0 + ', ' + pic }
}
export async function editIn(p, W, iid, iso, edit, tag, button = '#inpEditSave') {
  await inDay(p, W, iso)
  const card = p.locator(`[data-testid="win-inputsday"] [data-iid="${iid}"], [data-testid="win-inputsday"] [data-popiid="${iid}"]`).first()
  if (!(await card.count())) return { ok: false, why: `no card for ${iid} on ${iso}`, pic: await W.pic(p, tag + '-nocard') }
  await W.press(p, card, 'card')
  await p.locator('[data-testid="win-inputedit"]').waitFor({ timeout: 5000 })
  await sleep(400)
  await edit()
  const pic0 = await W.pic(p, tag + '-form')
  await W.press(p, `${button}:visible`, button === '#inpEditDel' ? 'delete' : 'save')
  const asked = await answerAsks(p, W)
  const note = await L.toastSaid(p)
  const stayed = !!(await p.locator('[data-testid="win-inputedit"]:visible').count())
  const pic = await W.pic(p, tag + '-saved')
  if (stayed) { await p.keyboard.press('Escape'); await sleep(300); const d = p.getByRole('button', { name: /Discard|Close it/ }).first(); if (await d.count()) await d.click().catch(() => {}) }
  const x = p.locator('[data-testid="win-inputsday-x"]:visible'); if (await x.count()) await W.press(p, x.first(), 'day-x')
  return { ok: !stayed, asked, note, stayed, rec: await recOf(p, iid), pic: pic0 + ', ' + pic }
}
export { path, tid }
