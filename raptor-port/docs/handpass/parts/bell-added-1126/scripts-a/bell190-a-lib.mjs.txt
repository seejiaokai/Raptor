// bell190 walker A — shared helpers (26 Nov 26). The app served at http://localhost:4190/ (never built or started here).
// Routes copied from the host's proved route (bell190-host.mjs) and the Inputs-calendar filing of wr4-lib.mjs.
import { createRequire } from 'module'
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs'
import { join } from 'node:path'
const require = createRequire(process.cwd() + '/package.json')
const { chromium, webkit } = require('playwright')
export const LIBV = 'bell190-a-lib v12'
export const PHONE_URL = 'http://localhost:4173/'
console.log(LIBV)
export const URL = 'http://localhost:4190/'
export const BUNDLE = 'index-B9okpSpf.js'
export const PICS = 'C:/Users/User/projects/Raptor/.claude/worktrees/elastic-dijkstra-948566/raptor-port/docs/img/handpass/2026-11-26-bell-added/a'
export const SCR = 'C:/Users/User/AppData/Local/Temp/claude/a0a73751ce6bb0b4/a7bfbc5c-70a8-46a1-9ccd-a4391c31b9f1/scratchpad/bell190-a'
mkdirSync(PICS, { recursive: true })
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const J = JSON.stringify
export const ID = { Ranger: 'bane', Saber: 'stiff', Tally: 'nick', Hex: 'rocky', Ace: 'dj', Vapor: 'vegas', Drifter: 'slipway', Warden: 'nact' }
export const CS = Object.fromEntries(Object.entries(ID).map(([k, v]) => [v, k]))
export const WED = '2026-07-15', THU = '2026-07-16', TUE = '2026-07-14', SAT = '2026-07-18'
const NOMOTION = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}'
let BR = null, WK = null
export async function newWorld(kind = 'desk', state) {
  let ctx
  /* WebKit refuses port 4190 outright ("Not allowed to use restricted network port"), so the phone opens the SAME served
     app through an address on 4191 that this script answers by fetching every request, unchanged, from 4190 — no server
     is started; the saved world handed over has its origin renamed to match */
  /* (from v12, on the host's word: the same build is served for WebKit at http://localhost:4173/ — earlier phone runs
     reached 4190 through a routed 4191 address) */
  const phone = kind === 'phone'
  if (phone && state) state = JSON.parse(JSON.stringify(state).split('localhost:4190').join('localhost:4173'))
  const ss = state ? { storageState: state } : {}
  if (phone) { WK ||= await webkit.launch(); ctx = await WK.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, ...ss }) }
  else { BR ||= await chromium.launch(); ctx = await BR.newContext({ viewport: { width: 1536, height: 864 }, ...ss }) }
  const page = await ctx.newPage()
  const w = { ctx, page, tap: phone, kind, errs: [], base: phone ? PHONE_URL : URL }
  page.on('pageerror', e => w.errs.push(String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') w.errs.push('console: ' + m.text().slice(0, 200)) })
  return w
}
/* the same saved world handed to another device (the stored data carried over) */
export async function handOver(w, kind) { await sleep(1200); const st = await w.ctx.storageState({ indexedDB: true }); await w.ctx.close(); return newWorld(kind, st) }
export async function closeAll() { if (BR) await BR.close(); if (WK) await WK.close() }
export async function signIn(w, u) {
  const p = w.page
  const pass = u === 'ad' ? 'a' : u === 'us' ? 'us' : (w.pass || 'x')
  await p.goto(w.base || URL, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('#luser', { timeout: 30000 })
  const b = await p.evaluate(() => [...document.querySelectorAll('script[src]')].map(s => s.src.split('/').pop()).join(' '))
  if (!b.includes(BUNDLE)) throw new Error('WRONG BUNDLE ' + b)
  await p.fill('#luser', u); await p.fill('#lpass', pass)
  await p.click('#loginForm button[type=submit]'); await p.waitForSelector('#notifyBell', { state: 'attached' })
  await p.addStyleTag({ content: NOMOTION }).catch(() => {})
  await sleep(700)
}
export async function signOut(w) {
  const p = w.page
  await sleep(900) // let the last save reach the store
  if (await p.locator('#logout:visible').count()) await p.locator('#logout:visible').click()
  else { await p.evaluate(() => document.querySelector('#logout')?.click()) }
  await p.waitForSelector('#luser')
  await sleep(300)
}
export const go = async (p, where) => { await p.evaluate(x => window.go(x), where); await p.waitForFunction(x => window.CURPAGE === x, where); await sleep(500) }
export const ids = p => p.evaluate(() => window.INPUTS.map(r => String(r.iid)))
export const rec = (p, iid) => p.evaluate(i => { const r = window.INPUTS.find(x => String(x.iid) === String(i)); return r ? { type: r.type, title: r.title, date: r.date, endDate: r.endDate, s: r.s, e: r.e, allday: r.allday, people: (r.people || []).map(x => x.p), person: r.person, by: r.by || r.filer || r.filedBy, cx: !!r.cx } : null }, iid)
/* the notices store — every line, with its index, for a diff */
export const allNotices = p => p.evaluate(() => (window.NOTICES || []).map((n, i) => ({ i, ...JSON.parse(JSON.stringify(n)) })))
export function newSince(before, after) { const seen = new Set(before.map(x => J(x))); return after.filter(x => !seen.has(J(x))) }
export const fmtN = n => `to=${J(n.to)} by=${n.by} iid=${n.iid ?? ''} name=${n.name ?? n.n ?? ''} day=${n.day ?? n.d ?? ''} what=${J(n.what)}`.slice(0, 400)
/* press as a person would */
export async function press(w, sel) { const l = (typeof sel === 'string' ? w.page.locator(sel) : sel).first(); await l.scrollIntoViewIfNeeded().catch(() => {}); if (w.tap) await l.tap(); else await l.click(); await sleep(w.tap ? 650 : 250) }
export const toast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return ''; const cs = getComputedStyle(t); return +cs.opacity > 0.05 && t.getBoundingClientRect().height > 0 ? (t.textContent || '').replace(/\s+/g, ' ').trim() : '' })
export async function shot(w, name, clip) { const f = join(PICS, name + '.png'); await w.page.screenshot({ path: f, ...(clip ? { clip } : {}) }); return name + '.png' }
/* ---------- the bell, on screen ---------- */
export async function bell(w, name) {
  const p = w.page
  await p.evaluate(() => scrollTo(0, 0))
  const lit = await p.evaluate(() => { const b = document.querySelector('#notifyBell'); if (!b) return 'no bell'; const badge = b.querySelector('.badge, .dot, [class*="badge"], [class*="dot"]'); return { cls: String(b.className), label: b.getAttribute('aria-label') || b.title || '', badge: badge ? (badge.textContent || '').trim() + '|' + getComputedStyle(badge).display : null } })
  const bl = p.locator('#notifyBell:visible').first()
  if (w.tap) await bl.tap(); else await bl.click()
  await sleep(120)
  let lift = null
  if (w.tap && name) lift = await shot(w, name + '-lift')
  await sleep(600)
  const lines = await p.evaluate(() => {
    const l = document.querySelector('.bell-list') || document.querySelector('[data-testid="bell-list"]')
    if (!l) return null
    return [...l.querySelectorAll('.bl-line')].map((e, i) => { e.setAttribute('data-ba', String(i)); const t = s => (e.querySelector(s)?.textContent || '').replace(/\s+/g, ' ').trim(); return { i, name: t('.bl-name'), day: t('.bl-day'), what: t('.bl-what'), ago: t('.bl-ago'), cls: String(e.className), iid: e.getAttribute('data-iid') || e.getAttribute('data-nid') || '' } })
  })
  const txt = await p.evaluate(() => { const l = document.querySelector('.bell-list') || document.querySelector('[data-testid="bell-list"]'); return l ? l.innerText.replace(/\n+/g, ' | ').slice(0, 900) : null })
  const t = await toast(p)
  let pic = null
  if (name) pic = await shot(w, name)
  return { lit, lines, txt, toast: t, pic, lift }
}
export async function closeBell(w) { await w.page.keyboard.press('Escape').catch(() => {}); await sleep(300); if (await w.page.locator('.bell-list:visible').count()) { await w.page.mouse.click(5, 500).catch(() => {}); await sleep(300) } }
/* a tap on line i of the open bell: what opens */
export async function tapLine(w, i, name) {
  const p = w.page
  const l = p.locator(`.bell-list [data-ba="${i}"]`).first()
  if (w.tap) await l.tap(); else await l.click()
  await sleep(1000)
  const what = await p.evaluate(() => {
    const vis = e => e && e.getBoundingClientRect().width > 3 && getComputedStyle(e).visibility !== 'hidden'
    const win = [...document.querySelectorAll('[data-testid^="win-"]')].filter(vis).map(e => e.getAttribute('data-testid'))
    const ed = document.querySelector('#inpEditPop')
    const type = document.querySelector('#inpEditPop #inpEditType')?.value
    const ppl = [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp'))
    const person = document.querySelector('#inpEditPop #inpEditPerson')?.value || (document.querySelector('#inpEditPop #inpEditPersonFixed')?.textContent || '').trim()
    const head = [...document.querySelectorAll('[data-testid^="win-"] h2, [data-testid^="win-"] .fw-title, [data-testid^="win-"] .title')].filter(vis).map(e => e.textContent.trim()).join(' / ')
    return { page: window.CURPAGE, windows: win, editor: vis(ed), type, people: ppl, person, head: head.slice(0, 160) }
  })
  const pic = name ? await shot(w, name) : null
  return { ...what, pic }
}
/* ---------- the Inputs page ---------- */
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
export async function toMonth(w, y, m) {
  await go(w.page, 'inputs')
  if (await w.page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(w, '#inCalBtn')
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await w.page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.indexOf(name.slice(0, 3)))
    if (!d) { await sleep(400); return }
    await press(w, d > 0 ? '#icNext' : '#icPrev'); await sleep(300)
  }
  throw new Error('calendar never reached the month')
}
export async function openDay(w, iso) {
  await toMonth(w, +iso.slice(0, 4), +iso.slice(5, 7))
  await w.page.locator(`#inpCal [data-icday="${iso}"]`).focus()
  await w.page.keyboard.press('Enter')
  await w.page.locator('[data-testid="win-inputsday"]').waitFor()
  await sleep(350)
}
export async function answerAsks(w, oil = 'yes') {
  const asked = []
  for (let i = 0; i < 5; i++) {
    await sleep(400)
    const p = w.page
    if (await p.locator('[data-testid="docconf-nodoc"]:visible').count()) { asked.push('document'); await press(w, '[data-testid="docconf-nodoc"]'); continue }
    if (await p.locator('[data-testid="oilconf"]:visible').count()) {
      asked.push('oil')
      if (oil === 'leave') return asked
      const y = p.locator(oil === 'no' ? '[data-testid="oil-no"]:visible' : '[data-testid="oil-all"]:visible, [data-testid="oil-yes"]:visible')
      if (await y.count()) await press(w, y)
      await press(w, '[data-testid="oilconf-save"]'); continue
    }
    if (await p.locator('[data-testid="inped-swap-go"]:visible').count()) { asked.push('swap'); await press(w, '[data-testid="inped-swap-go"]'); continue }
    break
  }
  return asked
}
/* file an input through a day of the Inputs calendar and its "+ Input" (spec: type, people[], from, to, title, span) */
export async function fileInput(w, iso, spec, log = console.log) {
  await openDay(w, iso)
  const before = await ids(w.page)
  await press(w, '#icPopAdd')
  await w.page.locator('#inpEditPop #inpEditType').waitFor()
  await w.page.selectOption('#inpEditPop #inpEditType', spec.type)
  await sleep(250)
  if (spec.unav && await w.page.locator('#inpEditPop [data-testid="inped-unav"], #inpEditPop #inpEditUnav').count()) { /* set below by caller */ }
  if (spec.people) {
    if (spec.people.length > 1) {
      await press(w, '#inpEditPop [data-testid="pp-several"]')
      for (const id of spec.people) if ((await w.page.locator(`#inpEditPop [data-pp="${id}"]`).getAttribute('aria-pressed')) !== 'true') await press(w, `#inpEditPop [data-pp="${id}"]`)
      const lit = await w.page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
      for (const id of lit) if (!spec.people.includes(id)) await press(w, `#inpEditPop [data-pp="${id}"]`)
    } else if (await w.page.locator('#inpEditPop #inpEditPerson').count()) await w.page.selectOption('#inpEditPop #inpEditPerson', spec.people[0])
  }
  if (spec.endIso) { /* range set by caller hook */ }
  if (spec.before) await spec.before(w)
  if (spec.span && await w.page.locator(`#inpEditSpan [data-span="${spec.span}"]`).count()) await press(w, `#inpEditSpan [data-span="${spec.span}"]`)
  if (spec.from) {
    const ad = w.page.locator('#inpEditPop #inpEditAllday')
    if (await w.page.locator('#inpEditSpan [data-span="custom"]').count()) await press(w, '#inpEditSpan [data-span="custom"]')
    else if (await ad.count() && await ad.isChecked()) await ad.click()
    await w.page.fill('#inpEditPop #inpEditStart', spec.from); await w.page.fill('#inpEditPop #inpEditEnd', spec.to)
  }
  if (spec.title) { const t = w.page.locator('#inpEditPop #inpEditOwnTitle'); if (await t.count()) await t.fill(spec.title) }
  await press(w, '#inpEditSave')
  const asked = await answerAsks(w, spec.oil || 'yes')
  const said = await toast(w.page)
  const made = (await ids(w.page)).filter(x => !before.includes(x))
  const stillOpen = await w.page.locator('[data-testid="win-inputedit"]:visible').count()
  if (await w.page.locator('[data-testid="win-inputsday-x"]:visible').count()) await press(w, '[data-testid="win-inputsday-x"]')
  log(`  filed ${spec.type} for ${J(spec.people)} on ${iso}: new ${J(made)} asked ${J(asked)} note ${J(said)} stillOpen ${stillOpen}`)
  return made.length === 1 ? made[0] : (made.length ? made : null)
}
/* ---------- Edit Schedule / the Board ---------- */
export const DI = { [WED]: 2, [THU]: 3, [TUE]: 1, [SAT]: 5 }
/* the ground rows of day di that came from input iid: { ri, key, who, more } */
export const rowsOf = (p, di, iid) => p.evaluate(([di, iid]) => (window.DAYS[di].ground || []).map((r, ri) => ({ ri, src: r.src ? String(r.src.iid ?? r.src) : '', who: r.who, more: r.more || [], prog: r.prog, rid: r.rid, str: r.str, end: r.end })).filter(r => !iid || r.src.includes(String(iid))), [di, iid])
export const groundDump = (p, di) => p.evaluate(di => (window.DAYS[di].ground || []).map((r, ri) => `${ri}:${r.prog}|who=${r.who}|more=${JSON.stringify(r.more || [])}|src=${JSON.stringify(r.src || null).slice(0, 80)}`), di)
/* a visible element's middle */
export const mid = (p, sel) => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => { const r = x.getBoundingClientRect(); return r.width > 3 && r.height > 3 }); if (!e) return null; e.scrollIntoView({ block: 'center', inline: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height } }, sel)
/* a mouse drag (HTML5 drag) from one element's middle to another's — the target measured AFTER the lift */
export async function drag(w, fromSel, toSel, picBase) {
  const p = w.page
  /* a point that HITS the element (elementFromPoint lands inside it — the week keeps hidden copies of days), or where it
     stands off the screen */
  const find = s => p.evaluate(s => {
    const all = [...document.querySelectorAll(s)].filter(x => { const r = x.getBoundingClientRect(); return r.width > 3 && r.height > 3 })
    for (const e of all) { const r = e.getBoundingClientRect(); const x = r.left + Math.min(r.width / 2, 40), y = r.top + r.height / 2; if (x < 0 || y < 50 || x > innerWidth || y > innerHeight - 4) continue; const h = document.elementFromPoint(x, y)
      /* a mark that takes no presses (the "+ add" words) is hit through the place that holds it — never a man's puck there */
      const thru = getComputedStyle(e).pointerEvents === 'none' && e.parentElement && h && e.parentElement.contains(h) && !h.closest('.puck')
      if (h && (e === h || e.contains(h) || thru)) return { x, y, hit: true } }
    const e = all.find(x => !x.closest('.peek')) || all[0]; if (!e) return null
    const r = e.getBoundingClientRect(); return { hit: false, top: r.top, bottom: r.bottom, left: r.left, right: r.right }
  }, s)
  /* from the crew list (it stays in view, sticky): the target into view first */
  if (/Roster/.test(fromSel)) { await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 3 && !x.closest('.peek')); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, toSel); await sleep(300) }
  /* the source in view and hit */
  let a = await find(fromSel)
  if (a && !a.hit) { await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 3 && !x.closest('.peek')); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }, fromSel); await sleep(400); a = await find(fromSel) }
  if (!a || !a.hit) return { ok: false, why: 'no source in view ' + fromSel }
  await p.mouse.move(a.x, a.y); await p.mouse.down()
  await p.mouse.move(a.x + 8, a.y + 8, { steps: 3 }); await sleep(150)
  /* carry it: while the target is off the screen hold the pointer at the edge it lies beyond (the app scrolls the page or
     the week under a carried puck there), then onto the target once it is hit */
  let b = null, hops = 0, cx = a.x + 8, cy = a.y + 8
  const vp = p.viewportSize()
  for (; hops < 80; hops++) {
    b = await find(toSel)
    if (!b) break
    if (b.hit) break
    const ex = b.left > vp.width ? vp.width - 6 : b.right < 0 ? 6 : Math.min(Math.max(cx, 60), vp.width - 60)
    const ey = b.top > vp.height - 4 ? vp.height - 6 : b.bottom < 50 ? 64 : Math.min(Math.max(cy, 80), vp.height - 40)
    cx = ex + (hops % 2); cy = ey
    await p.mouse.move(cx, cy, { steps: 2 }); await sleep(140)
  }
  if (!b || !b.hit) { await p.mouse.move(a.x, a.y, { steps: 5 }); await p.mouse.up(); return { ok: false, why: `target not reached after ${hops} hops ${J(b)} ${toSel}` } }
  await p.mouse.move(b.x, b.y, { steps: 12 }); await sleep(250)
  const b2 = await find(toSel)
  if (b2 && b2.hit) { b = b2; await p.mouse.move(b.x, b.y, { steps: 3 }) }
  const under = await p.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); const pk = h && h.closest('[data-person]'); return h ? `${h.tagName}.${String(h.className).slice(0, 30)}${pk ? ' person=' + pk.getAttribute('data-person') : ''}` : null }, [b.x, b.y])
  if (picBase) await shot(w, picBase + '-carried')
  await p.mouse.up(); await sleep(700)
  return { ok: true, from: a, to: b, hops, under }
}
/* tap-to-arm on a phone (or a click on desktop): press the source puck, then the target */
export async function armPlace(w, fromSel, toSel, picBase) {
  const p = w.page
  const a = p.locator(fromSel).filter({ visible: true }).first()
  if (!(await a.count())) return { ok: false, why: 'no source ' + fromSel }
  await a.scrollIntoViewIfNeeded()
  if (w.tap) await a.tap(); else await a.click()
  await sleep(150); if (picBase) await shot(w, picBase + '-armtap')
  await sleep(500)
  const armed = await p.evaluate(() => { try { return window.armedKey ? window.armedKey() : null } catch { return 'err' } })
  const t = p.locator(toSel).filter({ visible: true }).first()
  if (!(await t.count())) return { ok: false, why: 'no target ' + toSel, armed }
  await t.scrollIntoViewIfNeeded()
  if (w.tap) await t.tap(); else await t.click()
  await sleep(150); if (picBase) await shot(w, picBase + '-placetap')
  await sleep(700)
  return { ok: true, armed }
}
/* ---------- Admin → Users: give a man on the roster a sign-in (his row's "Give sign-in") ---------- */
export async function giveSignIn(w, pid, name, log = console.log) {
  const p = w.page
  await go(p, 'admin')
  const cat = p.locator('.adm-cat').filter({ hasText: 'Users' }).first()
  if (await cat.count()) await press(w, cat)
  await press(w, `#accList [data-person="${pid}"] .acc-tap`)
  await p.locator('#accGiveName').fill(name)
  await press(w, '#accGive')
  const t = await toast(p)
  log(`  gave ${pid} the sign-in ${name}: note ${J(t)}`)
  return t
}
/* ---------- one case: the act's new lines, judged by person ---------- */
const kindsOf = what => (what || []).map(x => x.k + (x.who ? ':' + x.who.join('+') : '') + (x.c ? ':' + x.c : '')).join(',')
export function judgeLines(newLines, expect, iid) {
  /* expect: { pid: 'in' | 'out' | 'add:bane' | 'add:bane,rem:nick' | null } — every other pid: no line */
  const out = []
  const by = {}
  for (const n of newLines) { const t = Array.isArray(n.to) ? n.to : [n.to]; for (const x of t) (by[x] ||= []).push(n) }
  let ok = true
  for (const [pid, want] of Object.entries(expect)) {
    const got = (by[pid] || [])
    const words = got.map(n => `${n.name} ${n.day} [${kindsOf(n.what)}] by ${n.by}${n.iid && iid && n.iid !== iid ? ' OTHER-INPUT ' + n.iid : ''}`)
    const good = want == null ? got.length === 0 : (got.length === 1 && kindsOf(got[0].what) === want && (!iid || got[0].iid === iid))
    if (!good) ok = false
    out.push(`${CS[pid] || pid}: ${want == null ? 'none expected' : 'expect [' + want + ']'} got ${got.length ? words.join(' + ') : 'none'} ${good ? 'ok' : 'WRONG'}`)
  }
  for (const pid of Object.keys(by)) if (!(pid in expect)) { ok = false; out.push(`${CS[pid] || pid}: UNEXPECTED ${by[pid].map(n => `${n.name} [${kindsOf(n.what)}]`).join(' + ')}`) }
  return { ok, out }
}
export const kinds = kindsOf
/* several inputs at once: expected lines as 'pid|tag|kinds' (tags name the inputs), compared as a set */
export function judgeSet(fresh, expected, tags) {
  const tagOf = iid => Object.entries(tags).find(([, v]) => v === iid)?.[0] || ('other:' + iid)
  const got = []
  for (const n of fresh) for (const to of (Array.isArray(n.to) ? n.to : [n.to])) got.push(`${to}|${n.iid ? tagOf(n.iid) : n.name}|${kindsOf(n.what)}`)
  const a = [...got].sort(), b = [...expected].sort()
  const ok = J(a) === J(b)
  const nice = s => s.split('|').map((x, i) => i === 0 ? (CS[x] || x) : x).join(' ')
  return { ok, got: a.map(nice), expected: b.map(nice), missing: b.filter(x => !a.includes(x)).map(nice), extra: a.filter(x => !b.includes(x)).map(nice) }
}
/* the Ranger read: sign out the actor, sign in as him in the SAME world, open his bell, tap the line about `name` */
export async function readAs(w, user, picBase, pickRe, opts = {}) {
  await signOut(w)
  if (opts.pass) w.pass = opts.pass
  await signIn(w, user)
  const b = await bell(w, picBase + '-bell')
  let tap = null
  if (b.lines && b.lines.length && pickRe) {
    const L = b.lines.find(l => pickRe.test(`${l.name} ${l.day} ${l.what}`))
    if (L) tap = { line: L, ...(await tapLine(w, L.i, picBase + '-tap')) }
  }
  return { bell: b, tap }
}
/* the place on day di's ground row from input iid: the "+ add", or the seat holding person pid */
export async function rowPlace(p, di, iid, pid) {
  const rows = await rowsOf(p, di, iid)
  if (!rows.length) return null
  const r = rows[0]
  if (!pid) return { ri: r.ri, key: `g:${di}.${r.ri}.+`, sel: `[data-fill="g:${di}.${r.ri}.+"] > .addz` }
  if (r.who === pid) return { ri: r.ri, key: `g:${di}.${r.ri}`, sel: `[data-slot="g:${di}.${r.ri}"] .puck[data-person="${pid}"]` }
  const n = (r.more || []).indexOf(pid)
  if (n >= 0) return { ri: r.ri, key: `g:${di}.${r.ri}.x${n}`, sel: `[data-slot="g:${di}.${r.ri}.x${n}"] .puck[data-person="${pid}"]` }
  return null
}
export async function openBoard(w, di) {
  await go(w.page, 'editsched')
  const b = w.page.locator(`[data-sbday="${di}"]`).filter({ visible: true }).first()
  await b.scrollIntoViewIfNeeded(); if (w.tap) await b.tap(); else await b.click()
  await w.page.waitForSelector('#schedBoard #sbBoard', { timeout: 8000 }); await sleep(900)
}
export async function closeBoard(w) { const d = w.page.locator('#sbDone:visible').first(); if (await d.count()) { if (w.tap) await d.tap(); else await d.click(); await sleep(700) } }
/* a phone's tap-to-arm on the Board: tap the place (an "+ add" at its right end, clear of the puck in it; a puck at its
   middle), a picture straight after the lift, then tap the man in the crew drawer, a picture straight after */
export async function phoneArmPlace(w, placeSel, man, picBase) {
  const p = w.page
  const t = p.locator('#schedBoard ' + placeSel).filter({ visible: true }).first()
  if (!(await t.count())) return { ok: false, why: 'no place ' + placeSel }
  await t.scrollIntoViewIfNeeded(); await sleep(300)
  const bb = await t.boundingBox()
  const x = bb.x + bb.width / 2
  await p.touchscreen.tap(x, bb.y + bb.height / 2); await sleep(90)
  await shot(w, picBase + '-armtap-lift'); await sleep(650)
  const armed = await p.evaluate(() => { try { return window.armedKey() } catch { return null } })
  const drawer = await p.evaluate(() => (document.querySelector('#sbSide')?.innerText || '').split('\n').slice(0, 2).join(' / '))
  const m = p.locator(`#sbRoster .rpuck[data-person="${man}"]`).filter({ visible: true }).first()
  if (!(await m.count())) return { ok: false, why: 'no crew name ' + man, armed }
  await m.scrollIntoViewIfNeeded(); await sleep(250)
  const mb = await m.boundingBox()
  await p.touchscreen.tap(mb.x + mb.width / 2, mb.y + mb.height / 2); await sleep(90)
  await shot(w, picBase + '-pick-lift'); await sleep(800)
  return { ok: true, armed, drawer }
}
/* ---------- the record ---------- */
export function recorder(name) {
  const f = join(SCR, name + '-results.jsonl')
  return (sc, step, verdict, got, expect = '', pics = []) => { const r = { sc, step, verdict, got, expect, pics }; appendFileSync(f, J(r) + '\n'); console.log(`RESULT ${sc} ${step} | ${verdict} | ${typeof got === 'string' ? got : J(got)} | ${pics.join(', ')}`) }
}
