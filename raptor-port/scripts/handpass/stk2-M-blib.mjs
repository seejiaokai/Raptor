/* Codex-stack walk, walker B — helpers on top of ins-s-lib2 / wh-b-lib / seat-lib. Every fixture goes through the app's
   own controls (+ Wave, the text boxes, the crew list, + In-time / Rally, the sign-off selects, Publish, Undo). */
import * as S from './ins-s-lib2.mjs'
import { handPut } from './seat-lib.mjs'
export * from './ins-s-lib2.mjs'
export { handPut }
const { B, L, W } = S
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const results = []   /* the rows of this script (also in TABLE) */

/* a fresh world per scenario: its own browser, signed in as admin on Edit Schedule */
export async function fresh({ who = 'a', phone = B.PHONE } = {}) {
  const w = await B.world({ who, phone })
  await B.toEdit(w.p)
  return w
}
/* the picture of ONE element (clipped to the window) — what a person looks at */
export async function picEl(p, sel, name, { pad = 6, maxH = 900 } = {}) {
  const el = p.locator(sel).first()
  if (!(await el.count())) return B.pic(p, name + '-noel')
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(250)
  const b = await el.boundingBox()
  const vp = p.viewportSize()
  if (!b) return B.pic(p, name)
  const x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad)
  const clip = { x, y, width: Math.min(vp.width - x, b.width + 2 * pad), height: Math.min(vp.height - y, Math.min(maxH, b.height + 2 * pad)) }
  return B.pic(p, name, { clip })
}

/* ---------- the board: waves, lines, boxes, crew ---------- */
export async function boardTo(p, di) {
  const cur = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); return b && b.offsetWidth ? window.SBDAY : null })
  if (cur != null && cur !== di) await W.boardOff(p)
  await W.boardOn(p, di); await sleep(250)
}
export const nWaves = (p, di) => p.evaluate(i => window.DAYS[i].waves.length, di)
export const waveIx = (p, di, label) => p.evaluate(([i, l]) => window.DAYS[i].waves.findIndex(w => w.label === l), [di, label])
/* + Wave → "Flying wave" (a plain flying wave, first line blank). Returns { gi, label } of the new wave. */
export async function addFlyWave(p, di) {
  await boardTo(p, di)
  const before = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label), di)
  const b = p.locator(`#schedBoard [data-wvadd="${di}"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(350)
  await p.locator('.wavemenu [data-wmkind=""]').first().click(); await sleep(600)
  const after = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label), di)
  const label = after.find(l => !before.includes(l))
  return { gi: after.indexOf(label), label }
}
export async function addStandby(p, di, kind) {
  await boardTo(p, di)
  const before = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label), di)
  const b = p.locator(`#schedBoard [data-wvadd="${di}"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(350)
  await p.locator(`.wavemenu [data-wmkind="${kind}"]`).first().click(); await sleep(700)
  const after = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label), di)
  const label = after.find(l => !before.includes(l))
  return { gi: after.indexOf(label), label }
}
/* + Line: a new blank formation on the day's LAST wave */
export async function addLine(p, di, gi) {
  await boardTo(p, di)
  const b = p.locator(`#schedBoard [data-gline="${di}.${gi}"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(500)
}
/* a text box of formation fi on the board: cs, msn, br, to, ld */
export async function ff(p, di, gi, fi, field, value) {
  await boardTo(p, di)
  await W.boardText(p, `ff:${di}.${gi}.${fi}.${field}`, value)
}
/* the crew list's own puck dropped on a seat (arm the seat, tap the puck) */
export async function seat(p, di, gi, fi, ai, which, pid) {
  await boardTo(p, di)
  return handPut(p, `${di}.${gi}.${fi}.${ai}.${which}`, pid)
}

/* ---------- reporting lines ---------- */
export const itSel = (surf, di) => surf === 'board' ? '#schedBoard' : `#eWeek .day[data-day="${di}"]`
export async function itAdd(p, surf, di, gi) {
  if (surf === 'board') await boardTo(p, di); else { await B.toEdit(p); await W.showDay(p, di) }
  const b = p.locator(`${itSel(surf, di)} [data-itadd="${di}|${gi}"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(200)
  await b.click(); await sleep(600)
}
export const itLines = (p, di, gi) => p.evaluate(([i, g]) => (window.DAYS[i].waves[g].intimes || []).slice(), [di, gi])
/* type a reporting line (replace its text) and commit by leaving the box */
export async function itSet(p, surf, di, gi, ix, text, { commit = 'blur' } = {}) {
  if (surf === 'board') await boardTo(p, di); else { await B.toEdit(p); await W.showDay(p, di) }
  const el = p.locator(`${itSel(surf, di)} [data-itline="${di}|${gi}|${ix}"]`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(150)
  await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.type(text, { delay: 8 })
  const live = await feedback(p, surf, di, gi)   /* what the box says WHILE the caret is still in it */
  if (commit === 'tab') await p.keyboard.press('Tab'); else await el.evaluate(e => e.blur())
  await sleep(500)
  return live
}
export async function itDel(p, surf, di, gi, ix) {
  if (surf === 'board') await boardTo(p, di); else { await B.toEdit(p); await W.showDay(p, di) }
  const b = p.locator(`${itSel(surf, di)} [data-itdel="${di}|${gi}|${ix}"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await b.click(); await sleep(500)
}
/* the reporting box's own feedback sentence (shown beside the lines) and the painted lines */
export async function feedback(p, surf, di, gi) {
  return p.evaluate(([s, i, g]) => {
    const root = s === 'board' ? document.querySelector('#schedBoard') : document.querySelector(`#eWeek .day[data-day="${i}"]`)
    if (!root) return null
    const fbs = [...root.querySelectorAll('[data-reporting-feedback]')].filter(e => e.offsetParent !== null)
    const mine = fbs.find(e => (e.getAttribute('data-warnkey') || '') === `it:${i}.${g}`)
    return mine ? mine.textContent.trim() : null
  }, [surf, di, gi])
}
export async function linesOnScreen(p, surf, di, gi) {
  return p.evaluate(([s, i, g]) => {
    const root = s === 'board' ? document.querySelector('#schedBoard') : document.querySelector(`#eWeek .day[data-day="${i}"]`)
    return [...root.querySelectorAll(`[data-itline="${i}|${g}|0"], [data-itline^="${i}|${g}|"]`)].map(e => e.textContent.trim())
  }, [surf, di, gi])
}

/* ---------- warnings and hours ---------- */
/* the day's warning list as the app holds it (read only): [code sev msg] */
export async function warns(p, di) { return (await B.warnsOf(p, di)).map(w => `${w.sev}/${w.code}${w.off ? '/HIDDEN' : ''}: ${w.msg}`) }
export async function warnsFull(p, di) {
  return p.evaluate(i => ((window.WARN.byDay[i] || {}).warns || []).map(w => ({ sev: w.sev, code: w.code, off: !!w.off, msg: String(w.msg || '') })), di)
}
export const cs = async (p, ids) => Promise.all(ids.map(i => B.csOf(p, i)))
/* Insights' Work hours for named callsigns */
export async function hours(p, names, name = null, { keep = false } = {}) {
  await B.toEdit(p)
  if (B.PHONE) {
    /* the phone's door since D558: the schedule page's ... menu, one item, Insights */
    await p.locator('#editSchedMore').click(); await sleep(300)
    await p.locator('#editSchedMoreInsights').click(); await sleep(700)
    const r0 = await S.readIns(p)
    r0.shot = await B.pic(p, name || 'ins')
    if (!keep) await S.closeIns(p)
    return { r: r0, h: S.hoursOf(r0, names), all: S.sec(r0, 'Work hours'), shot: r0.shot }
  }
  const r = await S.look(p, name || 'ins', { keep })
  if (r.none) return { r, h: {}, all: [], shot: r.shot, none: true }
  return { r, h: S.hoursOf(r, names), all: S.sec(r, 'Work hours'), shot: r.shot }
}
export async function flyingLoad(p) {
  await B.toEdit(p)
  const r = await S.look(p, 'insload', { keep: false })
  return { r, load: S.sec(r, 'Flying load') }
}

/* ---------- Logic ---------- */
export const logicSet = S.logicSet
export async function logicRead(p, key) {
  await L.go(p, 'logic')
  let opened = false
  if (!(await p.locator(`[data-lgset="${key}"]`).count())) { await p.locator('#lgEdit').click(); await sleep(500); opened = true }
  const v = await p.evaluate(k => { const e = document.querySelector(`[data-lgset="${k}"]`); return e ? e.value : null }, key)
  if (opened) { const d = p.locator('#lgDone:visible').first(); if (await d.count()) { await d.click(); await sleep(300) } }
  return v
}

/* sign and publish through the day's own buttons; returns what the app said */
export async function publishOrig(p, di) { const r = await S.publish(p, di, 'orig'); return r }
export async function publishAL(p, di) { const r = await S.publish(p, di, 'al'); return r }

/* write a result row AND remember it for the report */
export function R(id, did, saw, verdict, pics = []) { B.row(id, did, saw, verdict, pics); results.push({ id, verdict }) }
export async function watchErrors(p, errors, label) {
  return errors.length ? `${label}: ${errors.join(' | ').slice(0, 500)}` : null
}

/* a Logic setting emptied the way a person does it: click, select all, Backspace, Enter */
export async function logicBlank(p, set) {
  await L.go(p, 'logic')
  if (!(await p.locator(`[data-lgset="${set}"]`).count())) { await p.locator('#lgEdit').click(); await sleep(500) }
  const el = p.locator(`[data-lgset="${set}"]:visible`).first()
  const before = await el.inputValue()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.press('Backspace')
  const mid = await el.inputValue()
  await p.keyboard.press('Enter'); await el.evaluate(e => e.blur()); await sleep(500)
  const after = await el.inputValue().catch(() => '?')
  const done = p.locator('#lgDone:visible').first(); if (await done.count()) { await done.click(); await sleep(400) }
  return { before, mid, after }
}
