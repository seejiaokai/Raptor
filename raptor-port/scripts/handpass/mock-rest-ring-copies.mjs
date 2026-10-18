/* MOCK-UP — [CREW-REST-MARK-COPIES], his ruling D1013 (18 Oct 26): "Every copy of a man's puck on a day wears the same
   crew-rest ring as his seat (dotted, dashed or solid) — his SANS card, Unavailable and Personal Inputs rows and the crew
   list included — and an open issues list lights its crew without hiding those rings; drawn for him before it is built."

   Drawn on the REAL running app (the method: .claude/skills/brainstorming/mockups-on-the-real-app.md).

   ONE BUSY CASE, built through the app's own controls (the Scheduler Board's + Wave, its text boxes, the crew list, and the
   + Add / + Inputs doors of its Unavailable, SANS and Ground panels):
     · Scribe (SANS WSO): Monday ZM 20:00–22:30, Tuesday ZT Brief 05:00, 07:00–08:00 → Tuesday's rest is broken; Monday
       is the day that CAUSES it (the dotted ring). On Monday he also has a SANS card (Fly, all day), a part-day LL
       (05:00–06:00, Unavailable) and a Personal input (06:30–07:30, the Personal Inputs panel and a Ground row).
     · Otter (SANS WSO): Monday ZR 15:00–17:00, Tuesday ZL Brief 05:00, 08:00–09:00 with LATE SHOW in its remarks →
       a sanctioned late show on Tuesday (the dashed ring). On Tuesday he has a SANS card (Fly, all day), a
       part-day LL (14:00–15:00) and a Personal input (15:30–16:30) filed here.
     · Everyone else on those days is the demo week as it stands (the plain, amber and solid-red cases beside them).

   THE TRANSFORM (proposed, list shut): every copy of Scribe's / Otter's puck on a day takes the ring classes and the chip
   of his own seat that day — the app's own `.puck.boxdot` / `.puck.boxdash` / `.puck.boxred` (04-pucks-sections.css) and
   his seat's `.lchip`. Nothing new is styled; the classes are moved, exactly as the seat wears them.
   THE TWO OPTIONS for the open issues list (its light is `.puck.wfoc`, an OUTLINE — the same property the dotted and
   dashed rings are drawn on, which is why it hides them today):
     A (recommended) — on a puck that wears the dotted or dashed ring, the list's light takes that ring's own stroke:
       what lights him is that everything else on the day dims, as it does today. No new look.
     B — the list's light moves off the outline onto a ring drawn round the outside of the rest ring (a solid ring 2px
       wide, 4px out, in the light's own colour, on a dark band). A NEW look: a design decision for him.
   Run: HP_URL=http://localhost:4174 node scripts/handpass/mock-rest-ring-copies.mjs   (RRC_REUSE=1 reuses a saved fixture)
   Pictures: docs/img/handpass/2026-10-18-rest-ring-copies/ */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { chromium } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4174'
const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-18-rest-ring-copies')
const STATE = process.env.RRC_STATE || resolve(tmpdir(), 'rrc-fixture-state.json')   /* the saved fixture, outside the repo */
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const sleep = ms => new Promise(r => setTimeout(r, ms))
export const X = 'waldo', Y = 'wrangler'       /* Scribe (dotted on Monday), Otter (dashed on Tuesday) — both SANS WSOs idle in the demo on those days */
const MON = 0, TUE = 1
const errors = []
const log = (...a) => console.log(...a)

/* ---------------- a browser ---------------- */
async function open(browser, { width = 1440, height = 900, dsf = 1, phone = false, state = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dsf, ...(phone ? { isMobile: true, hasTouch: true } : {}), ...(state ? { storageState: state } : {}) })
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  p.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  await p.goto(BASE + '/')
  const card = await p.waitForSelector('#luser', { state: 'visible', timeout: 8000 }).then(() => true, () => false)
  if (card) { await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]') }
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important} #toastEl{display:none !important}' })
  await p.evaluate(() => window.go('editsched')); await sleep(700)
  return { ctx, p }
}
async function boardTo(p, di) {
  const cur = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); return b && b.offsetWidth ? window.SBDAY : null })
  if (cur === di) return
  if (cur != null) await boardOff(p)
  await p.evaluate(d => window.openScheduler(d), di)
  await p.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(700)
}
async function boardOff(p) {
  if (!(await p.locator('#schedBoard:visible').count())) return
  const x = p.locator('#sbDone:visible, #sbClose:visible').first()
  if (await x.count()) await x.click(); else await p.keyboard.press('Escape')
  await sleep(600)
}
async function click(p, sel) {
  const el = p.locator(sel).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(120)
  try { await el.click({ timeout: 2500 }) } catch { const b = await el.boundingBox(); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
}
/* a board text box (callsign, mission, times, remarks), typed and left */
async function boardText(p, key, value) {
  const el = p.locator(`#schedBoard [data-bfld="${key}"]:visible, #schedBoard [data-txt="${key}"]:visible`).first()
  if (!(await el.count())) throw new Error('no board box ' + key)
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await el.click()
  const tag = await el.evaluate(e => e.tagName)
  if (tag === 'INPUT' || tag === 'TEXTAREA') { await el.fill(''); await el.type(String(value), { delay: 8 }) }
  else { await p.keyboard.press('Control+A'); await p.keyboard.type(String(value), { delay: 8 }) }
  await el.evaluate(e => e.blur()); await sleep(450)
}
/* + Wave → Flying wave; its first (blank) line filled; a man put in a seat by arming it and pressing his crew-list puck */
async function flyLine(p, di, o, who, seat) {
  await boardTo(p, di)
  const before = await p.evaluate(i => window.DAYS[i].waves.length, di)
  await click(p, `#schedBoard [data-wvadd="${di}"]`); await sleep(350)
  await p.locator('.wavemenu [data-wmkind=""]').first().click(); await sleep(650)
  const gi = await p.evaluate(i => window.DAYS[i].waves.length - 1, di)
  if (gi !== before) throw new Error('no new wave')
  for (const [k, v] of Object.entries(o)) await boardText(p, `ff:${di}.${gi}.0.${k}`, v)
  const key = `${di}.${gi}.0.0.${seat}`
  await click(p, `#schedBoard [data-slot="${key}"], #schedBoard [data-fill="${key}"]`); await sleep(250)
  await click(p, `#sbRoster .rpuck[data-person="${who}"]`); await sleep(450)
  await p.keyboard.press('Escape'); await sleep(200)
  const took = await p.evaluate(([i, g, s, w]) => (window.DAYS[i].waves[g].formations[0].aircraft[0] || {})[s] === w, [di, gi, seat, who])
  return { gi, took }
}
/* the board's own + Add / + Inputs doors (Unavailable 'u', SANS 's', Ground 'g') */
async function fileInput(p, di, door, { who, type = null, span = null, from = null, to = null, rmk = '', allday = null }) {
  await boardTo(p, di)
  const n0 = await p.evaluate(() => window.INPUTS.length)
  await click(p, `#schedBoard [data-inpadd="${di}.${door}"]`); await sleep(600)
  const pop = p.locator('#inpEditPop')
  await pop.locator('#inpEditPerson').selectOption(who)
  if (type) { await pop.locator('#inpEditType').selectOption(type); await sleep(250) }
  if (door === 's') { const f = pop.locator('input[type=checkbox]').first(); if (!(await f.isChecked())) await f.click() }
  if (span) { await pop.locator(`[data-span="${span}"]`).click(); await sleep(200) }
  if (allday !== null && await pop.locator('#inpEditAllday').count()) {
    const on = await pop.locator('#inpEditAllday').isChecked(); if (on !== allday) await pop.locator('#inpEditAllday').click(); await sleep(200)
  }
  if (from) { await pop.locator('#inpEditStart').fill(from); await pop.locator('#inpEditStart').blur() }
  if (to) { await pop.locator('#inpEditEnd').fill(to); await pop.locator('#inpEditEnd').blur() }
  if (rmk) await pop.locator('#inpEditRmk').fill(rmk)
  await pop.locator('#inpEditSave').click(); await sleep(800)
  for (let i = 0; i < 3; i++) {   /* the questions a save can raise: no certificate, OIL */
    const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible'); if (await nodoc.count()) { await nodoc.click(); await sleep(500); continue }
    const conf = p.locator('[data-testid="oilconf"]:visible')
    if (await conf.count()) { await conf.locator('button').filter({ hasText: /^No/ }).first().click().catch(() => {}); await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await sleep(600); continue }
    break
  }
  return (await p.evaluate(() => window.INPUTS.length)) > n0
}

/* ---------------- the fixture ---------------- */
async function buildFixture(browser) {
  const { ctx, p } = await open(browser)
  const r = {}
  r.xMon = await flyLine(p, MON, { cs: 'ZM', msn: 'BFM', to: '20:00', ld: '22:30' }, X, 'w')
  r.xTue = await flyLine(p, TUE, { cs: 'ZT', msn: 'BFM', br: '05:00', to: '07:00', ld: '08:00' }, X, 'w')
  r.yMon = await flyLine(p, MON, { cs: 'ZR', msn: 'ACM', to: '15:00', ld: '17:00' }, Y, 'w')
  r.yTue = await flyLine(p, TUE, { cs: 'ZL', msn: 'ACM', br: '05:00', to: '08:00', ld: '09:00' }, Y, 'w')
  await boardTo(p, TUE); await boardText(p, `fr:${TUE}.${r.yTue.gi}.0.0`, 'LATE SHOW')
  r.in = [
    await fileInput(p, MON, 's', { who: X, span: 'all' }),
    await fileInput(p, MON, 'u', { who: X, type: 'LL', span: 'custom', from: '05:00', to: '06:00', rmk: 'leave bit' }),
    await fileInput(p, MON, 'g', { who: X, type: 'Personal', allday: false, from: '06:30', to: '07:30', rmk: 'dentist' }),
    await fileInput(p, TUE, 's', { who: Y, span: 'all' }),
    await fileInput(p, TUE, 'u', { who: Y, type: 'LL', span: 'custom', from: '14:00', to: '15:00', rmk: 'leave bit' }),
    await fileInput(p, TUE, 'g', { who: Y, type: 'Personal', allday: false, from: '15:30', to: '16:30', rmk: 'dentist' }),
  ]
  await boardOff(p)
  await sleep(1500)   /* the postman's merge, then the write */
  const state = await ctx.storageState()
  writeFileSync(STATE, JSON.stringify(state))
  log('FIXTURE', JSON.stringify(r))
  await ctx.close()
  return state
}

/* ---------------- reading what is painted ---------------- */
async function painted(p, scope, id) {
  return p.evaluate(([s, who]) => {
    const where = e => {
      if (e.closest('#sbRoster,.crewpal,.eroster,.rpuck')) return 'crew list'
      if (e.closest('.sanscards,.sanscard')) return 'SANS card'
      if (e.closest('.sec-pinp,.pinp')) return 'Personal Inputs'
      if (e.closest('.sec-unav,.unav,.unavrow')) return 'Unavailable'
      if (e.closest('.sec-grnd,.grnd,[data-slot^="g:"]')) return 'Ground'
      if (e.closest('[data-slot]') && /^\d/.test(e.closest('[data-slot]').dataset.slot)) return 'cockpit'
      return 'other'
    }
    return [...document.querySelectorAll(`${s} .puck[data-person="${who}"]`)].filter(e => e.offsetParent !== null).map(e => {
      const cs = getComputedStyle(e), ch = e.querySelector('.lchip')
      return { where: where(e), rings: ['boxred', 'boxdash', 'boxdot', 'wfoc', 'dim', 'warn', 'hard'].filter(c => e.classList.contains(c)).join(' '), outline: cs.outlineStyle + ' ' + cs.outlineWidth, shadow: (cs.boxShadow || '').slice(0, 50), chip: ch ? ch.textContent : '' }
    })
  }, [scope, id])
}
const say = ps => ps.map(x => `${x.where}[${x.rings}|${x.outline}|chip ${x.chip || '-'}]`).join(' · ')

/* ---------------- the transforms (on the page; each marks what it touched with data-mock) ---------------- */
/* PROPOSED: every copy of `id` inside `scope` (and his crew-list puck) wears the ring classes and chip of his seat that day */
const RINGS = ['warn', 'hard', 'note', 'boxred', 'boxdash', 'boxdot']
async function propose(p, scope, id, crewScope) {
  return p.evaluate(([s, who, crew, RINGS]) => {
    const all = [...document.querySelectorAll(`${s} .puck[data-person="${who}"]`)]
    const seat = all.find(e => { const k = e.closest('[data-slot]'); return k && /^\d/.test(k.dataset.slot) })
    if (!seat) return { err: 'no seat puck for ' + who }
    const want = RINGS.filter(c => seat.classList.contains(c)), chip = seat.querySelector('.lchip')
    const copies = all.filter(e => e !== seat && !(e.closest('[data-slot]') && /^\d/.test(e.closest('[data-slot]').dataset.slot)))
    if (crew) copies.push(...[...document.querySelectorAll(`${crew} .rpuck[data-person="${who}"] .puck`)].filter(e => e.offsetParent !== null))
    for (const e of copies) {
      RINGS.forEach(c => e.classList.remove(c)); want.forEach(c => e.classList.add(c))
      const old = e.querySelector('.lchip'); if (old) old.remove()
      if (chip) e.insertBefore(chip.cloneNode(true), e.firstChild)
      e.dataset.mock = 'proposed'
    }
    return { seat: want.join(' '), chip: chip ? chip.textContent : '', n: copies.length }
  }, [scope, id, crewScope || null, RINGS])
}
const assertMock = async (p, n) => { const k = await p.evaluate(() => document.querySelectorAll('[data-mock="proposed"]').length); if (k < n) throw new Error(`the proposed classes were wiped (${k} of ${n})`) }
/* the open list's light: option A keeps the rest ring's own stroke; option B puts the light on a ring round the outside */
const OPT = {
  A: `.puck.wfoc.boxdot{outline:var(--dot-w,1.5px) dotted var(--hard)!important;outline-offset:2px!important}
      .puck.wfoc.boxdash{outline:2px dashed var(--hard)!important;outline-offset:0!important}`,
  /* B's outer ring wears the light's own colour, as `.puck.wfoc` does: red, amber (.advf) or a note's grey (.notef) */
  B: `.puck.wfoc.boxdot{outline:var(--dot-w,1.5px) dotted var(--hard)!important;outline-offset:2px!important}
      .puck.wfoc.boxdash{outline:2px dashed var(--hard)!important;outline-offset:0!important}
      .puck.wfoc.boxdot,.puck.wfoc.boxdash{--lit:var(--hard);box-shadow:0 0 0 4px #0B0D10,0 0 0 6px var(--lit)!important}
      .puck.wfoc.advf.boxdot,.puck.wfoc.advf.boxdash{--lit:var(--adv)}
      .puck.wfoc.notef.boxdot,.puck.wfoc.notef.boxdash{--lit:#8A96A3}`,
}
async function option(p, k) {
  await p.evaluate(([css, k]) => { document.querySelectorAll('style[data-mockopt]').forEach(x => x.remove()); if (!css) return; const st = document.createElement('style'); st.dataset.mockopt = k; st.textContent = css; document.head.appendChild(st) }, [k ? OPT[k] : '', k || ''])
}

/* ---------------- framing and marking ---------------- */
/* a red #FF3B30 box drawn OUTSIDE each element (6px clear of it), never on a puck's own ring */
async function boxes(p, sels, pad = 6) {
  await p.evaluate(([sels, pad]) => {
    document.querySelectorAll('.mockbox').forEach(x => x.remove())
    for (const sel of sels) for (const e of document.querySelectorAll(sel)) {
      if (e.offsetParent === null) continue
      const r = e.getBoundingClientRect(); if (r.width < 2 || r.bottom < 0 || r.top > innerHeight) continue
      const b = document.createElement('div'); b.className = 'mockbox'
      Object.assign(b.style, { position: 'fixed', left: (r.left - pad) + 'px', top: (r.top - pad) + 'px', width: (r.width + 2 * pad) + 'px', height: (r.height + 2 * pad) + 'px', border: '2px solid #FF3B30', borderRadius: '6px', zIndex: 99999, pointerEvents: 'none', boxSizing: 'border-box' })
      document.body.appendChild(b)
    }
  }, [sels, pad])
}
const unbox = p => p.evaluate(() => document.querySelectorAll('.mockbox').forEach(x => x.remove()))
async function shot(p, name, opts = {}) { await p.screenshot({ path: resolve(OUT, name + '.png'), ...opts }); log('  picture', name); return name + '.png' }
/* the rows that hold a man's copies — the box goes round the ROW, so it never touches the puck's own ring */
const rowsOf = (scope, id) => [`${scope} .sanscard:has(.puck[data-person="${id}"])`, `${scope} .sb-panel.unav .sb-arow:has(.puck[data-person="${id}"])`, `${scope} .sb-panel.pinp .sb-arow:has(.puck[data-person="${id}"])`,
  `${scope} .sec-unav .plrow:has(.puck[data-person="${id}"])`, `${scope} .sec-inp .plrow:has(.puck[data-person="${id}"])`, `#sbRoster .rpuck[data-person="${id}"]`]
async function openFold(p, root, di) {
  const open = await p.evaluate(([r, i]) => { const h = document.querySelector(`${r} [data-pitog="${i}"]`); if (!h) return null; const pnl = h.closest('.sb-panel,.sec'); return pnl ? !!pnl.querySelector('.puck') : null }, [root, di])
  if (open === false) { await click(p, `${root} [data-pitog="${di}"]`); await sleep(500) }
}
/* a close-up of every puck of `id` in `scope` (each its own crop, 10px round the puck), returned as data URLs. The app
   repaints parts of the page as it scrolls, so each puck is found afresh by its place in the list, and `prep` (the
   proposed transform) is re-applied before each picture — and checked, or the picture is refused. */
async function crops(p, scope, id, crewScope, prep = null) {
  const find = ([s, who, crew, k]) => {
    const where = e => e.closest('#sbRoster,.eroster') ? 'crew list' : e.closest('.sanscard') ? 'SANS card' : e.closest('.pinp,.sec-inp') ? 'Personal Inputs' : e.closest('.unav,.sec-unav') ? 'Unavailable'
      : e.closest('.grnd,.sec-grnd,[data-slot^="g:"]') ? 'Ground Programme' : (e.closest('[data-slot]') && /^\d/.test(e.closest('[data-slot]').dataset.slot)) ? 'his seat' : 'other'
    const list = [...document.querySelectorAll(`${s} .puck[data-person="${who}"]`)]
    if (crew) { const r = [...document.querySelectorAll(`${crew} .rpuck[data-person="${who}"] .puck`)].filter(e => e.offsetParent !== null); if (r.length) list.push(r[0]) }
    const vis = list.filter(e => e.offsetParent !== null)
    if (k == null) return vis.map(where)
    const e = vis[k]; if (!e) return null
    e.scrollIntoView({ block: 'center', inline: 'nearest' })
    return { where: where(e), mock: e.dataset.mock || '' }
  }
  const wheres = await p.evaluate(find, [scope, id, crewScope || null, null])
  const out = []
  for (let k = 0; k < wheres.length; k++) {
    if (prep) await prep()
    const info = await p.evaluate(find, [scope, id, crewScope || null, k]); await sleep(150)
    if (prep) await prep()
    const box = await p.evaluate(([s, who, crew, k]) => {
      const list = [...document.querySelectorAll(`${s} .puck[data-person="${who}"]`)]
      if (crew) { const r = [...document.querySelectorAll(`${crew} .rpuck[data-person="${who}"] .puck`)].filter(e => e.offsetParent !== null); if (r.length) list.push(r[0]) }
      const e = list.filter(e => e.offsetParent !== null)[k]; if (!e) return null
      const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, mock: e.dataset.mock || '', seat: !!(e.closest('[data-slot]') && /^\d/.test(e.closest('[data-slot]').dataset.slot)) }
    }, [scope, id, crewScope || null, k])
    if (!box) continue
    if (prep && !box.seat && box.mock !== 'proposed') throw new Error('a proposed copy lost its classes before its picture: ' + info.where)
    const buf = await p.screenshot({ clip: { x: box.x - 10, y: box.y - 10, width: box.w + 20, height: box.h + 20 } })
    out.push({ where: info.where, url: 'data:image/png;base64,' + buf.toString('base64') })
  }
  const order = ['his seat', 'Ground Programme', 'Personal Inputs', 'SANS card', 'Unavailable', 'crew list', 'other']
  return out.sort((a, b) => order.indexOf(a.where) - order.indexOf(b.where))
}
/* a sheet of close-ups: one row per state, the real crops at the 2x density they were taken, labelled */
async function sheet(browser, name, title, rowsIn, note) {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 400 }, deviceScaleFactor: 2 })
  const p = await ctx.newPage()
  const cols = [...new Set(rowsIn.flatMap(r => r.crops.map(c => c.where)))]
  const cell = (r, w) => { const c = r.crops.find(c => c.where === w); return `<td>${c ? `<img src="${c.url}" style="zoom:1.5">` : '<span class=none>not drawn</span>'}</td>` }
  await p.setContent(`<html><body style="margin:0;background:#0B0D10;color:#E6EAEE;font:13px/1.3 -apple-system,Segoe UI,sans-serif;padding:16px">
    <div style="font-weight:700;font-size:15px;margin-bottom:4px">${title}</div><div style="color:#9AA6B2;margin-bottom:12px">${note}</div>
    <table style="border-collapse:separate;border-spacing:10px 8px"><tr><th></th>${cols.map(c => `<th style="text-align:left;color:#9AA6B2;font-weight:600">${c}</th>`).join('')}</tr>
    ${rowsIn.map(r => `<tr><td style="font-weight:700;white-space:nowrap;padding-right:6px">${r.label}</td>${cols.map(w => cell(r, w)).join('')}</tr>`).join('')}</table>
    <style>.none{color:#5F6B76;font-size:11px} img{display:block;image-rendering:auto}</style></body></html>`)
  await sleep(300)
  const h = await p.evaluate(() => document.body.scrollHeight), w = await p.evaluate(() => document.body.scrollWidth)
  await p.setViewportSize({ width: Math.max(600, w), height: h })
  await p.screenshot({ path: resolve(OUT, name + '.png'), fullPage: true }); log('  sheet', name)
  await ctx.close()
}

/* ---------------- the states, on one page ---------------- */
async function boardState(p, di, id, state) {
  await boardTo(p, di); await openFold(p, '#schedBoard', di)
  await p.evaluate(() => window.refreshHighlights && window.refreshHighlights())
  if (state === 'proposed') { await boardOff(p); await boardTo(p, di); await openFold(p, '#schedBoard', di); const r = await propose(p, '#schedBoard', id, '#sbRoster'); log('  proposed', JSON.stringify(r)) }
}
async function weekDay(p, di) {
  await boardOff(p)
  await p.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); if (!d) return; const sc = d.closest('.week'); if (sc) sc.scrollLeft = d.offsetLeft - (sc.firstElementChild ? sc.firstElementChild.offsetLeft : 0); window.scrollTo(0, 0) }, di)
  await sleep(400)
}
async function listOpen(p, di, want) {
  const open = await p.evaluate(i => { const b = document.querySelector(`#eWeek .day[data-day="${i}"] [data-dwbox="${i}"]`); return b ? b.classList.contains('open') : null }, di)
  if (open !== null && open !== want) { await click(p, `#eWeek .day[data-day="${di}"] [data-daywarn="${di}"]`); await sleep(500) }
}

/* ---------------- main ---------------- */
const browser = await chromium.launch({ headless: true, ...LAUNCH })
let state = process.env.RRC_REUSE && existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : null
if (!state) state = await buildFixture(browser)

/* what is painted today, read once (the evidence behind the pictures) */
{
  const { ctx, p } = await open(browser, { state })
  for (const di of [MON, TUE]) {
    await weekDay(p, di); await openFold(p, '#eWeek', di)
    for (const id of [X, Y]) log(`WEEK d${di} ${id} (list shut): ${say(await painted(p, `#eWeek .day[data-day="${di}"]`, id))}`)
    await listOpen(p, di, true)
    for (const id of [X, Y]) log(`WEEK d${di} ${id} (list OPEN): ${say(await painted(p, `#eWeek .day[data-day="${di}"]`, id))}`)
    await listOpen(p, di, false)
    await boardTo(p, di); await openFold(p, '#schedBoard', di)
    for (const id of [X, Y]) log(`BOARD d${di} ${id}: ${say(await painted(p, '#schedBoard', id))} · crew list ${say(await painted(p, '#sbRoster', id))}`)
  }
  await ctx.close()
}

const CASES = [[MON, X, 'mon-scribe', 'Scribe on Monday — the day that breaks Tuesday\'s rest (his seat: DOTTED)'],
               [TUE, Y, 'tue-otter', 'Otter on Tuesday — a sanctioned late show (his seat: DASHED)']]

/* DESKTOP 1440×900 at 1x — the board, list shut: (a) today, (b) proposed; then the week with the day's list open: (c) today, (d) options A and B */
{
  const { ctx, p } = await open(browser, { state })
  let n = 0
  for (const [di, id, tag] of CASES) {
    for (const st of ['today', 'proposed']) {
      await boardState(p, di, id, st)
      await p.evaluate(who => { const e = document.querySelector('#schedBoard .sb-panel.sansav') || document.querySelector(`#schedBoard .sb-panel.unav`); e && e.scrollIntoView({ block: 'center' })
        const r = document.querySelector(`#sbRoster .rpuck[data-person="${who}"]`); const sc = r && r.closest('.sb-roster,#sbRoster')
        if (r && sc) { let x = r.parentElement; while (x && x !== document.body && !(x.scrollHeight > x.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(x).overflowY))) x = x.parentElement; if (x && x !== document.body) x.scrollTop += r.getBoundingClientRect().top - x.getBoundingClientRect().top - x.clientHeight / 2 } }, id); await sleep(300)
      if (st === 'proposed') { await propose(p, '#schedBoard', id, '#sbRoster'); await assertMock(p, 3) }
      await boxes(p, rowsOf('#schedBoard', id))
      await shot(p, `dk-${String(++n).padStart(2, '0')}-${tag}-board-${st === 'today' ? 'a-today' : 'b-proposed'}`)
      await unbox(p)
    }
  }
  for (const [di, id, tag] of CASES) {
    for (const [st, opt] of [['c-today-list-open', null], ['d-proposed-list-open-optA', 'A'], ['d-proposed-list-open-optB', 'B']]) {
      await weekDay(p, di); await openFold(p, '#eWeek', di); await listOpen(p, di, true)
      if (opt) { await propose(p, `#eWeek .day[data-day="${di}"]`, id, null); await option(p, opt) } else await option(p, null)
      await p.evaluate(([i, who]) => { const e = document.querySelector(`#eWeek .day[data-day="${i}"] [data-slot] .puck[data-person="${who}"]`); e && e.scrollIntoView({ block: 'center' }) }, [di, id]); await sleep(300)
      if (opt) await assertMock(p, 2)
      await boxes(p, [`#eWeek .day[data-day="${di}"] [data-slot]:has(> .puck[data-person="${id}"])`], 12)
      await shot(p, `dk-${String(++n).padStart(2, '0')}-${tag}-week-${st}`)
      await unbox(p); await option(p, null); await listOpen(p, di, false)
    }
  }
  await ctx.close()
}

/* CLOSE-UPS at 2x — every puck of the man, each its own crop, laid out today above proposed */
{
  const { ctx, p } = await open(browser, { state, dsf: 2 })
  let n = 0
  for (const [di, id, tag, title] of CASES) {
    await boardState(p, di, id, 'today'); const t = await crops(p, '#schedBoard', id, '#sbRoster')
    await boardState(p, di, id, 'proposed'); await assertMock(p, 3)
    const pr = await crops(p, '#schedBoard', id, '#sbRoster', () => propose(p, '#schedBoard', id, '#sbRoster'))
    await sheet(browser, `dk2x-${String(++n).padStart(2, '0')}-${tag}-closeups-list-shut`, title + ' — the Scheduler Board, issue list shut',
      [{ label: '(a) today', crops: t }, { label: '(b) proposed', crops: pr }], 'Real crops of the running app at 2x, each puck with 10px round it. Proposed = each copy wears his seat\'s own ring and chip — no new style.')
    const rows = []
    for (const [label, opt] of [['(c) today', null], ['(d) option A', 'A'], ['(d) option B', 'B']]) {
      await weekDay(p, di); await openFold(p, '#eWeek', di); await listOpen(p, di, true)
      if (opt) { await propose(p, `#eWeek .day[data-day="${di}"]`, id, null); await option(p, opt) } else await option(p, null)
      rows.push({ label, crops: await crops(p, `#eWeek .day[data-day="${di}"]`, id, null, opt ? () => propose(p, `#eWeek .day[data-day="${di}"]`, id, null) : null) })
      await option(p, null); await listOpen(p, di, false)
    }
    await sheet(browser, `dk2x-${String(++n).padStart(2, '0')}-${tag}-closeups-list-open`, title + ' — Edit Schedule, the day\'s issue list OPEN',
      rows, 'Option A: the lit puck keeps its own dotted / dashed ring; everything the list does not name dims, as today. Option B: a new solid ring drawn round the outside of the rest ring.')
  }
  await ctx.close()
}

/* PHONE 390×844 at 3x — the board's panels (a, b) and the week with the list open (c, d) */
{
  const { ctx, p } = await open(browser, { state, width: 390, height: 844, dsf: 3, phone: true })
  let n = 0
  for (const [di, id, tag] of CASES) {
    for (const st of ['today', 'proposed']) {
      await boardState(p, di, id, st)
      await p.evaluate(() => { const e = document.querySelector('#schedBoard .sb-panel.sansav'); e && e.scrollIntoView({ block: 'start' }) }); await sleep(300)
      if (st === 'proposed') await assertMock(p, 2)
      await boxes(p, rowsOf('#schedBoard', id).slice(0, 5))
      await shot(p, `ph-${String(++n).padStart(2, '0')}-${tag}-board-${st === 'today' ? 'a-today' : 'b-proposed'}`)
      await unbox(p)
    }
    for (const [st, opt] of [['c-today-list-open', null], ['d-proposed-list-open-optA', 'A'], ['d-proposed-list-open-optB', 'B']]) {
      await weekDay(p, di); await listOpen(p, di, true)
      if (opt) { await propose(p, `#eWeek .day[data-day="${di}"]`, id, null); await option(p, opt) } else await option(p, null)
      await p.evaluate(([i, who]) => { const e = document.querySelector(`#eWeek .day[data-day="${i}"] [data-slot] .puck[data-person="${who}"]`); e && e.scrollIntoView({ block: 'center' }) }, [di, id]); await sleep(300)
      await boxes(p, [`#eWeek .day[data-day="${di}"] [data-slot]:has(> .puck[data-person="${id}"])`], 12)
      await shot(p, `ph-${String(++n).padStart(2, '0')}-${tag}-week-${st}`)
      await unbox(p); await option(p, null); await listOpen(p, di, false)
    }
  }
  await ctx.close()
}
log('errors', errors.slice(0, 8).join(' | ') || 'none')
await browser.close()
