/* Walker D of the Codex-stack check (5 Oct 26): the Tab route and the phone menu.
   Real keys (page.keyboard), every fixture through the app's own controls; the probe bridge only reads.
   Env: HP_URL (my server), HP_SHOTS (my pictures), HP_OUT (my json). */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import * as lib from './lib.mjs'
export * from './lib.mjs'
export const SHOTS = process.env.HP_SHOTS
export const OUT = process.env.HP_OUT
export const sleep = ms => new Promise(r => setTimeout(r, ms))

/* ---------- the table ---------- */
export const TABLE = []
let pcount = 0
export const PICS = []
export function row(id, did, saw, verdict, pics = []) {
  TABLE.push({ id, did, saw, verdict, pics })
  console.log(`== ${verdict}  ${id} — ${did}\n     saw: ${String(saw).slice(0, 900)}`)
}
export function savePart(name, extra = {}) {
  if (!OUT) return
  mkdirSync(dirname(OUT), { recursive: true })
  let all = {}
  if (existsSync(OUT)) { try { all = JSON.parse(readFileSync(OUT, 'utf8')) } catch { all = {} } }
  if (!all.parts) all = { parts: {} }
  all.parts[name] = { at: new Date().toISOString(), base: process.env.HP_URL, table: TABLE.slice(), pics: PICS.slice(), ...extra }
  writeFileSync(OUT, JSON.stringify(all, null, 1))
  console.log(`saved part ${name} -> ${OUT}`)
}
export async function pic(page, name, opts = {}) {
  mkdirSync(SHOTS, { recursive: true })
  const f = `${String(++pcount).padStart(3, '0')}-${name}.png`
  await page.screenshot({ path: `${SHOTS}/${f}`, ...opts }).catch(() => {})
  PICS.push(f)
  return f
}

/* ---------- where the caret is ---------- */
/* describe document.activeElement: kind (the data-* key), its row, its section, where it sits on screen,
   whether the visible part is the topmost thing at its centre */
export async function caret(page) {
  return page.evaluate(() => {
    const e = document.activeElement
    if (!e || e === document.body) return { none: true, tag: e ? e.tagName : null }
    const keys = ['data-txt', 'data-bfld', 'data-inp', 'data-ifld', 'data-itline', 'data-bombs', 'data-area', 'data-atime']
    let kind = null, key = null
    for (const k of keys) if (e.hasAttribute(k)) { kind = k.slice(5); key = e.getAttribute(k); break }
    const r = e.getBoundingClientRect()
    const left = Math.max(0, r.left), right = Math.min(innerWidth, r.right), top = Math.max(0, r.top), bottom = Math.min(innerHeight, r.bottom)
    const vis = right > left && bottom > top
    let hit = null
    if (vis) { const h = document.elementFromPoint((left + right) / 2, (top + bottom) / 2); hit = h === e || e.contains(h) || (h && h.contains(e) && h.tagName !== 'BODY' && h.tagName !== 'HTML' && !h.id) }
    const sec = e.closest('[data-secmove]')
    const inBoard = !!e.closest('#schedBoard'), inWeek = !!e.closest('#eWeek')
    return {
      tag: e.tagName, kind, key, id: e.id || null, cls: String(e.className || '').slice(0, 40),
      title: (e.getAttribute('title') || e.getAttribute('aria-label') || '').slice(0, 40),
      txt: (e.value !== undefined ? e.value : (e.innerText || '')).toString().slice(0, 24),
      sec: sec ? sec.getAttribute('data-secmove') : null,
      surface: inBoard ? 'board' : inWeek ? 'week' : 'other',
      x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
      onScreen: vis, topmost: !!hit, day: window.SBDAY,
      page: window.CURPAGE,
      editable: (e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement) ? !e.disabled && !e.readOnly : e.getAttribute('contenteditable') === 'true',
      boardOpen: !!(document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth),
    }
  })
}
export const label = c => c.none ? `(none: ${c.tag})` : `${c.surface}:${c.kind || c.tag + (c.id ? '#' + c.id : '')}${c.key ? '=' + c.key : ''}${c.sec ? ' [' + c.sec + ']' : ''} @(${c.x},${c.y} ${c.w}x${c.h})${c.onScreen ? '' : ' OFFSCREEN'}${c.topmost ? '' : ' COVERED'}`

/* a no-write snapshot: what a Tab that types nothing must leave alone */
export async function snap(page) {
  return page.evaluate(() => ({
    d: JSON.stringify(window.DAYS), i: JSON.stringify(window.INPUTS), s: JSON.stringify(window.SCHED),
    seq: window.commandStreamLen ? window.commandStreamLen() : null,
    elog: window.ELOG ? window.ELOG.rows.length : null,
    pend: [0, 1, 2, 3, 4, 5, 6].map(i => window.pendCount ? window.pendCount(i) : null),
  }))
}
export const same = (a, b) => a.d === b.d && a.i === b.i && a.s === b.s && a.seq === b.seq && a.elog === b.elog && JSON.stringify(a.pend) === JSON.stringify(b.pend)

/* press Tab (or Shift+Tab) n times from where the caret is; record the caret after each press */
export async function tabs(page, n, shift = false, { stopWhen = null } = {}) {
  const out = []
  for (let i = 0; i < n; i++) {
    await page.keyboard.press(shift ? 'Shift+Tab' : 'Tab')
    await sleep(70)
    const c = await caret(page)
    out.push(c)
    if (stopWhen && stopWhen(c)) break
  }
  return out
}
/* the set of typing boxes the brief names */
export const TYPING = '[data-txt],[data-bfld],[data-inp],[data-ifld],[data-itline],[data-bombs],[data-area],[data-atime]'
/* the typing boxes of a scope that are visible and open for typing, in DOM order */
export async function openBoxes(page, scope) {
  return page.evaluate(([s, t]) => {
    const root = document.querySelector(s); if (!root) return []
    return [...root.querySelectorAll(t)].filter(e => {
      const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return false
      const r = e.getBoundingClientRect(); if (!(r.width > 0 && r.height > 0) && e.offsetParent === null) return false
      return (e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement) ? !e.disabled && !e.readOnly : e.getAttribute('contenteditable') === 'true'
    }).map(e => {
      for (const k of ['data-txt', 'data-bfld', 'data-inp', 'data-ifld', 'data-itline', 'data-bombs', 'data-area', 'data-atime']) if (e.hasAttribute(k)) return { kind: k.slice(5), key: e.getAttribute(k), sec: (e.closest('[data-secmove]') || {}).getAttribute ? e.closest('[data-secmove]').getAttribute('data-secmove') : null }
      return { kind: '?', key: '?' }
    })
  }, [scope, TYPING])
}
export const SC = kind => kind === 'board' ? '#sbBoard' : '#eWeek'

/* ---------- getting around ---------- */
export async function nav(page, to) {
  if (await page.locator('#schedBoard:visible').count()) await page.locator('#sbDone').click().catch(() => {})
  const direct = page.locator(`.nav [data-page="${to}"]:visible`)
  if (await direct.count()) await direct.first().click()
  else { await page.locator('#burger').click(); await page.locator(`#drawerNav [data-page="${to}"]`).click() }
  await page.waitForFunction(p => window.CURPAGE === p, to)
  await sleep(300)
}
export async function openBoard(page, di) {
  const cur = await page.evaluate(() => (document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth ? window.SBDAY : null))
  if (cur === di) return
  if (cur != null) { await page.locator('#sbDone').click(); await sleep(400) }
  await nav(page, 'editsched')
  await page.locator(`#eWeek [data-sbday="${di}"]:visible`).first().click()
  await page.waitForSelector('#schedBoard:visible'); await sleep(500)
}
/* set a box through the keyboard the way a person does: click, select all, type, leave it with Tab */
export async function typeInto(page, locator, value, { leave = 'Tab' } = {}) {
  await locator.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await locator.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type(String(value), { delay: 8 })
  if (leave) await page.keyboard.press(leave)
  await sleep(250)
}
export async function errs(errors) { return errors.slice() }
export { lib }

/* ---------- the open boxes of a scope, in document order, and the caret's place among them ---------- */
const HELPER = () => {
  window.__dopen = (s) => {
    const root = document.querySelector(s); if (!root) return []
    const T = '[data-txt],[data-bfld],[data-inp],[data-ifld],[data-itline],[data-bombs],[data-area],[data-atime]'
    return [...root.querySelectorAll(T)].filter(e => {
      const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return false
      if (e.offsetParent === null && cs.position !== 'fixed') return false
      return (e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement) ? !e.disabled && !e.readOnly : e.getAttribute('contenteditable') === 'true'
    })
  }
  window.__dinfo = (e) => {
    for (const k of ['data-txt', 'data-bfld', 'data-inp', 'data-ifld', 'data-itline', 'data-bombs', 'data-area', 'data-atime']) if (e.hasAttribute(k)) {
      const sec = e.closest('[data-secmove]')
      return { kind: k.slice(5), key: e.getAttribute(k), sec: sec ? sec.getAttribute('data-secmove') : null }
    }
    return { kind: '?', key: '?', sec: null }
  }
}
export const ensureHelper = page => page.evaluate(HELPER)
export const scopeSel = (kind, di = 0) => kind === 'board' ? '#sbBoard' : `#eWeek > .day[data-day="${di}"]`
/* index of the caret among the scope's open boxes (-1 when it is not in one) */
export async function caretIdx(page, scope) {
  return page.evaluate(s => { const l = window.__dopen(s); return l.indexOf(document.activeElement) }, scope)
}
export async function boxList(page, scope) {
  await ensureHelper(page)
  return page.evaluate(s => window.__dopen(s).map(window.__dinfo), scope)
}
/* click into the i-th open box (a real press on its centre, scrolled into view) */
export async function clickBox(page, scope, i) {
  await ensureHelper(page)
  const h = await page.evaluateHandle(([s, k]) => window.__dopen(s)[k], [scope, i])
  const el = h.asElement(); if (!el) throw new Error('no box ' + i + ' in ' + scope)
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(80)
  await el.click()
  await sleep(80)
}
/* the whole route: click into box `from`, press Tab until `to` stops are taken, check each caret lands on the NEXT open box.
   Returns {n, bad:[...], stops:[...caret], exit: caret after one more Tab from the last, same: snapshot unchanged} */
export async function walkForward(page, scope, { from = 0, to = null, keepStops = true } = {}) {
  await ensureHelper(page)
  const list = await boxList(page, scope)
  const last = to == null ? list.length - 1 : to
  const s0 = await snap(page)
  await clickBox(page, scope, from)
  const bad = [], stops = []
  let c = await caret(page); let ix = await caretIdx(page, scope)
  if (ix !== from) bad.push({ at: 'start', want: from, got: ix, c: label(c) })
  stops.push({ i: from, ...slim(c) })
  for (let k = from + 1; k <= last; k++) {
    await page.keyboard.press('Tab'); await sleep(60)
    c = await caret(page); ix = await caretIdx(page, scope)
    if (ix !== k) bad.push({ at: k, want: `${list[k].kind}=${list[k].key}`, got: ix, c: label(c) })
    if (!c.onScreen || !c.topmost) bad.push({ at: k, hidden: label(c) })
    if (keepStops) stops.push({ i: k, ...slim(c) })
  }
  const s1 = await snap(page)
  return { n: last - from + 1, list, bad, stops, noWrite: same(s0, s1) }
}
export async function walkBack(page, scope, { from = null, to = 0 } = {}) {
  await ensureHelper(page)
  const list = await boxList(page, scope)
  const start = from == null ? list.length - 1 : from
  const s0 = await snap(page)
  await clickBox(page, scope, start)
  const bad = [], stops = []
  let c = await caret(page)
  for (let k = start - 1; k >= to; k--) {
    await page.keyboard.press('Shift+Tab'); await sleep(60)
    c = await caret(page); const ix = await caretIdx(page, scope)
    if (ix !== k) bad.push({ at: k, want: `${list[k].kind}=${list[k].key}`, got: ix, c: label(c) })
    if (!c.onScreen || !c.topmost) bad.push({ at: k, hidden: label(c) })
    stops.push({ i: k, ...slim(c) })
  }
  const s1 = await snap(page)
  return { bad, stops, noWrite: same(s0, s1) }
}
export const slim = c => ({ kind: c.kind, key: c.key, sec: c.sec, x: c.x, y: c.y, w: c.w, h: c.h, on: c.onScreen, top: c.topmost, tag: c.tag, id: c.id, title: c.title })
/* box's value (inputs: value; contenteditable: text) */
export async function valueOf(page, scope, key) {
  return page.evaluate(([s, k]) => {
    const els = [...document.querySelectorAll(`${s} [data-txt="${k}"],${s} [data-bfld="${k}"],${s} [data-itline="${k}"],${s} [data-bombs="${k}"],${s} [data-area="${k}"],${s} [data-atime="${k}"],${s} [data-ifld="${k}"],${s} [data-inp="${k}"]`)]
    return els.map(e => (e.value !== undefined && e.tagName !== 'DIV' && e.tagName !== 'SPAN' ? e.value : e.innerText).toString())
  }, [scope, key])
}
