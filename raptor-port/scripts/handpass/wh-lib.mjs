/* [WARN-HIDE-KEPT] (D469, D471, D472, D475) — the FULL check's walk: the shared helpers (1 Oct 26).
   On top of dbrA-lib (launch, context, page, signIn, go, rows, settle) and dbrA-W1-lib (showDay, the board, sign,
   publish, amend, Unpublish, Undo / Redo). Everything a step DOES goes through the app's own controls — the ✕ / ↺ on a
   line, the sign-off selects, the publish buttons; `window.*` is read only to record what the app holds (bug-check
   order §7.7). A step asserts what a person SEES: the bar's words, a line PAINTED struck (computed style), the puck's
   ring and chip, and that the ↺ is the thing a finger lands on (§7.8, anti-pattern 21).
   Env: HP_URL (the served build), HP_SHOTS (pictures), HP_OUT (the JSON part file), HP_PHONE=1. */
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import * as L from './dbrA-lib.mjs'
import * as W from './dbrA-W1-lib.mjs'
export { L, W }
export const PHONE = !!process.env.HP_PHONE
export const TAG = PHONE ? 'ph' : 'dk'
export const DAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* ---------- the table ---------- */
export const TABLE = []
export function row(id, did, saw, verdict, pics = []) {
  TABLE.push({ id, did, saw, verdict, pics })
  console.log(`== ${verdict}  ${id} — ${did}\n     saw: ${String(saw).slice(0, 700)}`)
}
/* a step that asserts: PASS when every check holds; the failed checks are named */
export function judge(id, did, checks, pics = []) {
  const bad = checks.filter(c => !c[1])
  row(id, did, checks.map(c => `${c[1] ? '✓' : '✗'} ${c[0]}${c[2] !== undefined ? ' [' + (typeof c[2] === 'string' ? c[2] : JSON.stringify(c[2])).slice(0, 160) + ']' : ''}`).join(' · '), bad.length ? 'FAIL' : 'PASS', pics)
  return !bad.length
}
export function savePart(name, extra = {}) {
  const OUT = process.env.HP_OUT
  if (!OUT) return
  mkdirSync(dirname(OUT), { recursive: true })
  let all = {}
  if (existsSync(OUT)) { try { all = JSON.parse(readFileSync(OUT, 'utf8')) } catch { all = {} } }
  if (!all.parts) all = { parts: {} }
  all.parts[`${name}-${TAG}`] = { at: new Date().toISOString(), base: process.env.HP_URL, phone: PHONE, table: TABLE, ...extra }
  writeFileSync(OUT, JSON.stringify(all, null, 1))
  console.log(`saved part ${name}-${TAG} → ${OUT}  (${TABLE.filter(r => r.verdict === 'PASS').length} PASS, ${TABLE.filter(r => r.verdict === 'FAIL').length} FAIL, ${TABLE.filter(r => !/PASS|FAIL/.test(r.verdict)).length} other)`)
}

/* ---------- a world ---------- */
/* a fresh browser context (its own storage — its own copy of the demo data), signed in */
export async function world({ who = 'a', phone = PHONE } = {}) {
  const browser = await L.launch()
  const ctx = await L.context(browser, { phone })
  const errors = []
  const p = await L.page(ctx, errors)
  await L.signIn(p, who)
  return { browser, ctx, p, errors }
}
/* a reload and a fresh sign-in on the same storage (the app's own reload) */
export async function reloadAs(p, who = 'a') { await L.settle(p); await p.reload(); await L.signIn(p, who, { goto: false }) }
let SHOTN = 0
export async function pic(p, name, opts = {}) {
  const dir = process.env.HP_SHOTS; if (!dir) return name
  mkdirSync(dir, { recursive: true })
  const f = `${TAG}-${String(++SHOTN).padStart(2, '0')}-${name}.png`
  await p.screenshot({ path: `${dir}/${f}`, ...opts }).catch(() => {})
  return f
}

/* ---------- the day's list (Edit Schedule '#eWeek', View-only Sched '#vWeek') ---------- */
export async function openList(p, surf, di) {
  await W.showDay(p, di, surf)
  const st = await p.evaluate(([s, i]) => { const b = document.querySelector(`${s} .day[data-day="${i}"] [data-dwbox="${i}"]`); return b ? b.classList.contains('open') : null }, [surf, di])
  if (st === false) { await p.locator(`${surf} .day[data-day="${di}"] [data-daywarn="${di}"]`).first().click(); await L.sleep(350) }
  return st !== null
}
/* the bar and every line AS PAINTED: struck (computed text-decoration), its colour, its button and whether the button is
   the topmost thing at its own centre */
export async function readList(p, surf, di) {
  return p.evaluate(([s, i]) => {
    const day = document.querySelector(`${s} .day[data-day="${i}"]`); if (!day) return { none: 'no such day on this page' }
    const box = day.querySelector(`[data-dwbox="${i}"]`)
    if (!box) return { bar: '(no bar)', barCls: '', lines: [], other: [] }
    const bar = box.querySelector('.daywarn')
    const lines = [...box.querySelectorAll('.witem[data-wix]')].map(e => {
      const t = e.querySelector('.wtx') || e.children[1], cs = getComputedStyle(t), b = e.querySelector('button.witem-mute')
      let top = null
      if (b) { const r = b.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); top = !!hit && (hit === b || b.contains(hit)); if (!(r.width > 0 && r.top >= 0 && r.bottom <= innerHeight)) top = 'off-screen' }
      return { ix: +e.dataset.wix, sev: ['hard', 'adv', 'note'].find(c => e.classList.contains(c)), hid: e.classList.contains('hid'), struck: cs.textDecorationLine.includes('line-through'), color: cs.color,
        btn: b ? b.innerText.trim() : '', btnTop: top, text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 110), tag: (e.querySelector('.wsig') || {}).innerText || '' }
    })
    return { bar: bar ? bar.innerText.replace(/\s+/g, ' ').trim() : '(no bar)', barCls: bar ? bar.className : '', lines,
      other: [...box.querySelectorAll('.dwlist > :not(.witem)')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 90)),
      gone: [...box.querySelectorAll('.witem.gone')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 90)) }
  }, [surf, di])
}
/* ✕ or ↺ on line `ix` of a day's list — the app's own button, scrolled into view first */
export async function tapLine(p, surf, di, ix) {
  const b = p.locator(`${surf} .day[data-day="${di}"] [data-woff="${di}.${ix}"]`).first()
  if (!(await b.count())) return 'no button on that line'
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(150)
  await b.click(); await L.sleep(500)
  return 'pressed'
}
/* the index of the first line whose text matches */
export const lineIx = (list, re) => { const l = (list.lines || []).find(x => re.test(x.text)); return l ? l.ix : -1 }

/* ---------- the board's panel ---------- */
export async function boardOpenFold(p) {
  const o = await p.evaluate(() => { const w = document.querySelector('#schedBoard .sbwrap'); return w ? w.classList.contains('open') : null })
  const folded = await p.evaluate(() => { const r = document.querySelector('#schedBoard .sb-warn .wln[data-wix]'); return r ? getComputedStyle(r).display === 'none' : false })
  if (o === false && folded) { await p.locator('#schedBoard [data-sbwtog]').first().click(); await L.sleep(300) }
}
export async function readBoard(p) {
  return p.evaluate(() => {
    const w = document.querySelector('#schedBoard .sb-warn'); if (!w) return { none: 'no board panel' }
    const h = w.querySelector('.wh')
    return { head: h.innerText.replace(/\s+/g, ' ').trim(), headCls: h.className,
      lines: [...w.querySelectorAll('.wln[data-wix]')].map(e => {
        const t = e.querySelector('.wln-t'), b = e.querySelector('button.wln-mute'), cs = getComputedStyle(t)
        let top = null
        if (b) { const r = b.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); top = !!hit && (hit === b || b.contains(hit)); if (!(r.width > 0)) top = 'not drawn' }
        return { ix: +e.dataset.wix, hid: e.classList.contains('hid'), struck: cs.textDecorationLine.includes('line-through'), shown: getComputedStyle(e).display !== 'none', btn: b ? b.innerText.trim() : '', btnTop: top, text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 110) }
      }),
      other: [...w.querySelectorAll('.wln.ok, .wmuted-h')].map(e => e.innerText.replace(/\s+/g, ' ').trim()) }
  })
}
export async function tapBoardLine(p, di, ix) {
  const b = p.locator(`#schedBoard [data-woff="${di}.${ix}"]`).first()
  if (!(await b.count())) return 'no button on that line'
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(150)
  await b.click(); await L.sleep(500)
  return 'pressed'
}

/* ---------- a man's pucks, as painted ---------- */
/* every VISIBLE puck of `id` inside `scope`: where it sits, its warning class, chip, red / dashed / dotted box */
export async function pucks(p, scope, id) {
  return p.evaluate(([s, who]) => {
    const where = e => e.closest('.availwin') ? 'ALL AVAIL window' : e.closest('#crewPal, .crewpal, .palette, .sb-side .ros, .sb-ros, .roster') ? 'crew list' : e.closest('.avgrid, .avail, [data-avail]') ? 'Available crew' : e.closest('.sanscards, .sans') ? 'SANS' : e.closest('.unav, .unavail') ? 'Unavailable' : e.closest('.go, .sb-wave, .sb-line') ? 'flying line' : e.closest('.duty, .sb-panel.duty, .dutyblk') ? 'duty' : e.closest('.sims, .sb-panel.sim') ? 'sim' : e.closest('.ground, .sb-panel.grnd') ? 'ground' : e.closest('.common, .sb-panel.prog') ? 'programme' : 'other'
    return [...document.querySelectorAll(`${s} .puck[data-person="${who}"]`)].filter(e => e.offsetParent !== null).map(e => ({
      where: where(e), warn: e.classList.contains('warn'), sev: ['hard', 'adv', 'note'].find(c => e.classList.contains(c)) || '',
      chip: (e.querySelector('.lchip') || {}).innerText || '', red: e.classList.contains('boxred'), dash: e.classList.contains('boxdash'), dot: e.classList.contains('boxdot'), cls: e.className }))
  }, [scope, id])
}
export const flagged = ps => ps.filter(x => x.warn || x.chip || x.red || x.dash || x.dot)

/* ---------- what the app holds (read only) ---------- */
export async function warnsOf(p, di) {
  return p.evaluate(i => ((window.WARN.byDay[i] || {}).warns || []).map((w, ix) => ({ ix, sev: w.sev, code: w.code, who: w.who || [], off: !!w.off, msg: String(w.msg || '').slice(0, 90), key: w.key || '' })), di)
}
export async function csOf(p, id) { return p.evaluate(i => (window.PEOPLE[i] || {}).cs || i, id) }
/* the day's head: its version tag, the pending chip, the marker, the sign-off line */
export const head = (p, di) => W.head(p, di)
