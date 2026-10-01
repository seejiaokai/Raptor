/* [DB-READINESS] group A — THE GROUP-WIDE FULL WALK's shared driver (30 Sep 26).

   Group A changed HOW every record is saved (one row per thing, written only from a command's changes, one change-log
   batch `changes/<id>` per saved group). Nothing on screen was meant to change. So every walk step here is judged three
   ways, each a check a person's eye cannot make:

   1. THE ROWS A STEP WROTE — the browser's storage (`raptor:<collection>/<id>`) is read before and after the step; every
      row that changed, appeared or went must be NAMED by a change-log batch written in that step, with the right op
      (put / delete), and every row a batch names must be in that state. A row changed with no batch is a bare write
      (the roll-call's MISSING); a batch naming a row that did not change the way it says is a lie.
   2. WHAT A RELOAD GIVES BACK — the app's own state (the loaded week, every request, the schedule's publish state, the
      planning calendar, the roster, the change history) is read before a reload and after it: they must be equal. A
      change that reached memory but not storage is lost here — the class this whole group of work could create.
   3. A RELOAD WRITES NOTHING — reading the store back must not rewrite it.

   Pictures go to HP_SHOTS; the step table to HP_OUT (JSON). HP_URL is the served build (localhost only — the probe
   bridge the checks read exists on this PC only). */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..')
export const BASE = process.env.HP_URL || 'http://localhost:4201'
{ const h = new URL(BASE).hostname
  if (!['localhost', '127.0.0.1'].includes(h)) throw new Error(`HP_URL must be a local build: the probe bridge is not installed on ${h}`) }
export const SHOTS = process.env.HP_SHOTS || resolve(ROOT, 'docs/img/handpass/2026-09-30-dbrA')
export const OUT = process.env.HP_OUT || resolve(ROOT, 'docs/handpass/parts/dbrA.json')
mkdirSync(SHOTS, { recursive: true }); mkdirSync(dirname(OUT), { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const DESK = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 }
export const sleep = ms => new Promise(r => setTimeout(r, ms))

/* ---------- results ---------- */
export const results = []
export function check(name, ok, detail = '') {
  results.push({ name, ok: !!ok, detail: typeof detail === 'string' ? detail.slice(0, 1200) : JSON.stringify(detail).slice(0, 1200) })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 300) : ''}`)
  return !!ok
}
export function save(extra = {}) {
  writeFileSync(OUT, JSON.stringify({ base: BASE, at: new Date().toISOString(), results, ...extra }, null, 1))
  const bad = results.filter(r => !r.ok)
  console.log(`\n${results.length - bad.length}/${results.length} passed → ${OUT}`)
  return bad.length
}
export const shot = (page, name, opts = {}) => page.screenshot({ path: resolve(SHOTS, name + '.png'), ...opts })

/* ---------- browser ---------- */
export async function launch() { return chromium.launch({ headless: true, ...launchOptions }) }
export async function context(browser, { phone = false, storageState = null } = {}) {
  return browser.newContext({ viewport: phone ? PHONE : DESK, ...(phone ? { isMobile: true, hasTouch: true } : {}), ...(storageState ? { storageState } : {}) })
}
export async function page(ctx, errors, label = 'p') {
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(`${label}: ${m.text()}`) })
  p.on('pageerror', e => errors.push(`${label}: PAGEERROR ${e.message}`))
  p.on('response', r => { if (r.status() >= 400) errors.push(`${label}: HTTP ${r.status()} ${r.url()}`) })
  p.on('dialog', d => { errors.push(`${label}: NATIVE DIALOG ${d.message()}`); d.dismiss().catch(() => {}) })
  return p
}
const CRED = { a: ['ad', 'a'], m: ['us', 'us'] }
/* open the app and sign in (`who` = 'a' admin Saber, 'm' member Ranger, or [user, pass]) */
export async function signIn(p, who = 'a', { goto = true } = {}) {
  if (goto) await p.goto(BASE + '/')
  const onCard = await p.waitForSelector('#luser', { state: 'visible', timeout: 10000 }).then(() => true, () => false)
  if (onCard) {
    const [u, pw] = Array.isArray(who) ? who : CRED[who]
    await p.fill('#luser', u); await p.fill('#lpass', pw)
    await p.click('#loginForm button[type=submit]')
  }
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await sleep(500)
}
export async function go(p, to) {
  await p.evaluate(x => window.go(x), to)
  await p.waitForFunction(x => window.CURPAGE === x, to)
  await sleep(450)
}

/* ---------- storage ---------- */
/* every saved row of the app (the Browser backend's `raptor:<collection>/<id>`), plus the Leave War's and the
   Tracker's own localStorage conveniences kept apart (they are not rows) */
export async function rows(p) {
  return p.evaluate(() => {
    const o = {}
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('raptor:') && !k.startsWith('raptor:__')) o[k.slice(7)] = localStorage.getItem(k)
    }
    return o
  })
}
export async function journal(p) { return p.evaluate(() => localStorage.getItem('raptor:__txn')) }
/* wait until the postman has delivered (its 300 ms merge, then a synchronous write) and no journal is open */
export async function settle(p, ms = 900) {
  await sleep(ms)
  for (let i = 0; i < 20; i++) { if (!(await journal(p))) return; await sleep(150) }
}
const isBatch = k => k.startsWith('changes/')
/* what changed between two row reads: rows put (new or different) and rows removed, change-log batches apart */
export function diff(a, b) {
  const put = [], del = [], newBatches = [], goneBatches = []
  for (const k of Object.keys(b)) {
    if (isBatch(k)) { if (!(k in a)) newBatches.push(k); continue }
    if (!(k in a) || a[k] !== b[k]) put.push(k)
  }
  for (const k of Object.keys(a)) {
    if (!(k in b)) (isBatch(k) ? goneBatches : del).push(k)
  }
  return { put: put.sort(), del: del.sort(), newBatches: newBatches.sort(), goneBatches }
}
/* the batch's items name a row as { table, key, op } — `key` is `<collection>/<id>` */
export function batchesOf(b, keys) { return keys.map(k => { try { return { key: k, ...JSON.parse(b[k]) } } catch (e) { return { key: k, bad: true } } }) }
/* THE CHECK 1: every changed row named by a new batch with the right op; every named row in the state the batch says */
export function audit(before, after) {
  const d = diff(before, after)
  const bs = batchesOf(after, d.newBatches)
  const named = new Map()
  for (const b of bs) for (const it of (b.items || [])) named.set(it.key, it.op)
  const bare = [], wrongOp = [], phantom = []
  for (const k of d.put) { if (!named.has(k)) bare.push('put ' + k); else if (named.get(k) !== 'put') wrongOp.push(`${k} changed, batch says ${named.get(k)}`) }
  for (const k of d.del) { if (!named.has(k)) bare.push('delete ' + k); else if (named.get(k) !== 'delete') wrongOp.push(`${k} removed, batch says ${named.get(k)}`) }
  for (const [k, op] of named) {
    if (op === 'delete' && k in after) phantom.push(`batch deletes ${k} but it is stored`)
    if (op === 'put' && !(k in after)) phantom.push(`batch puts ${k} but it is not stored`)
  }
  return { ...d, batches: bs.map(b => ({ key: b.key, type: b.type, actorId: b.actorId, n: (b.items || []).length, seqs: b.seqs })), bare, wrongOp, phantom }
}

/* ---------- the app's own state, for "a reload gives back what was there" ---------- */
export async function state(p) {
  return p.evaluate(() => {
    const clone = x => JSON.parse(JSON.stringify(x))
    const people = {}
    for (const [id, v] of Object.entries(window.PEOPLE || {})) people[id] = v
    const elog = ((window.ELOG && window.ELOG.rows) || []).map(l => { const c = clone(l); delete c.seq; return c })
    return {
      week: window.CURWEEK != null ? window.CURWEEK : null,
      hist: window.histSnap ? JSON.parse(window.histSnap()) : null,
      people: clone(people),
      elog,
    }
  })
}
/* where two states differ, as short paths — enough to say WHAT a reload lost */
export function stateDiff(a, b, path = '', out = []) {
  if (out.length > 40) return out
  if (JSON.stringify(a) === JSON.stringify(b)) return out
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const k of keys) stateDiff(a[k], b[k], path + '.' + k, out)
  } else out.push(`${path}: ${JSON.stringify(a)?.slice(0, 120)} → ${JSON.stringify(b)?.slice(0, 120)}`)
  return out
}

/* ---------- a step ---------- */
/* run one gesture (fn), wait for the save, and audit the rows it wrote. `expect` (optional) names what the step must
   write: { put: [regex…], del: [regex…], only: true } — `only` = nothing else may change. Returns the audit. */
export async function step(p, name, fn, expect = null) {
  const before = await rows(p)
  const ret = await fn()
  await settle(p)
  const after = await rows(p)
  const a = audit(before, after)
  a.ret = ret
  const summary = `put ${a.put.length} [${a.put.slice(0, 8).join(', ')}${a.put.length > 8 ? ' …' : ''}] · del ${a.del.length} [${a.del.slice(0, 6).join(', ')}] · batches ${a.batches.map(b => `${b.type}/${b.n}`).join(' ')}`
  check(`${name} — every row it wrote is named by its change-log batch`, !a.bare.length && !a.wrongOp.length && !a.phantom.length,
    a.bare.length || a.wrongOp.length || a.phantom.length ? { bare: a.bare, wrongOp: a.wrongOp, phantom: a.phantom } : summary)
  if (expect) {
    const miss = []
    for (const re of expect.put || []) if (!a.put.some(k => re.test(k))) miss.push('no put matching ' + re)
    for (const re of expect.del || []) if (!a.del.some(k => re.test(k))) miss.push('no delete matching ' + re)
    if (expect.only) {
      const allowed = [...(expect.put || []), ...(expect.del || []), ...(expect.also || [])]
      for (const k of [...a.put, ...a.del]) if (!allowed.some(re => re.test(k))) miss.push('also changed ' + k)
    }
    if (expect.none) { if (a.put.length || a.del.length) miss.push('wrote ' + [...a.put, ...a.del].join(', ')) }
    check(`${name} — wrote exactly what it should`, !miss.length, miss.length ? miss.join(' | ') : summary)
  }
  return a
}

/* reload, sign in again, bring back the same week, and compare the app's state; also: the reload itself writes nothing */
export async function reloadCompare(p, name, who = 'a', { page: pg = null, ignore = [] } = {}) {
  const s1 = await state(p)
  const r1 = await rows(p)
  await p.reload()
  await signIn(p, who, { goto: false })
  if (s1.week != null) {
    const wk = await p.evaluate(() => window.CURWEEK)
    if (wk !== s1.week) { await p.evaluate(w => window.loadWeek(w), s1.week); await sleep(700) }
  }
  if (pg) await go(p, pg)
  await settle(p, 700)
  const s2 = await state(p)
  const r2 = await rows(p)
  /* A DAY NO ONE HAS SAVED has no stored row (the group walk's fix H3: a week's first save writes only the days it
     changed), so it is worked out again at every load — its rows' hidden ids (`rid`) minted afresh, as a never-saved
     week's always were. Nothing durable points at them (any edit to that day saves it, ids and all). So on exactly such a
     day, and only for `rid`, a difference is not a loss. Read from the rows stored at the moment of the reload. */
  const wid = s1.week != null ? String(s1.week).replace(/\//g, '-') : null
  const unsavedDay = di => wid != null && !(`weeks/${wid}#${di}` in r1)
  const d = stateDiff(s1, s2).filter(x => !ignore.some(re => re.test(x)))
    .filter(x => { const m = /^\.hist\.d\.(\d+)\..*\.rid: /.exec(x); return !(m && unsavedDay(+m[1])) })
  check(`${name} — a reload gives back exactly what was there`, !d.length, d.length ? d.slice(0, 12).join(' || ') : `week ${s2.week}`)
  const rd = diff(r1, r2)
  check(`${name} — the reload wrote nothing`, !rd.put.length && !rd.del.length, rd.put.length || rd.del.length ? { put: rd.put.slice(0, 12), del: rd.del.slice(0, 12) } : 'no row changed')
  return { s1, s2, d }
}
