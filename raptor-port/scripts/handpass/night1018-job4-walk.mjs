/* WALK — Job 4 [CREW-REST-MARK-COPIES] (D1013, D1017): every copy of a man's puck wears his seat's crew-rest ring and chip;
   an open issues list keeps the dotted / dashed ring on a lit puck.
   Same case as mock-rest-ring-copies.mjs (Scribe 'waldo' Monday dotted, Otter 'wrangler' Tuesday dashed) built through the
   board's own controls, plus a Tuesday SANS card and Personal input for Scribe (B2: his Tuesday seat is the solid one).
   NO css injection and NO transforms — the app draws everything itself.
   Run: HP_URL=http://localhost:4174 node scripts/handpass/night1018-job4-walk.mjs  (WALK_REUSE=1 reuses the saved fixture)
   Pictures: docs/img/handpass/2026-10-18-night-job4/ */
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { chromium } from '@playwright/test'

console.log('night1018-job4-walk v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4174'
const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-18-night-job4')
const STATE = resolve(tmpdir(), 'night1018-job4-fixture.json')
mkdirSync(OUT, { recursive: true })
if (!process.env.WALK_REUSE) for (const f of readdirSync(OUT)) rmSync(resolve(OUT, f), { force: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const sleep = ms => new Promise(r => setTimeout(r, ms))
const X = 'waldo', Y = 'wrangler'
const MON = 0, TUE = 1
const errors = [], bad4xx = []
const log = (...a) => console.log(...a)
const results = []
const record = (step, ok, note, pic = '') => { results.push({ step, ok, note, pic }); log(`${ok ? 'PASS' : 'FAIL'} ${step} :: ${note}${pic ? ' [' + pic + ']' : ''}`) }

async function open(browser, { width = 1440, height = 900, dsf = 1, phone = false, state = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dsf, ...(phone ? { isMobile: true, hasTouch: true } : {}), ...(state ? { storageState: state } : {}) })
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  p.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  p.on('response', r => { if (r.status() >= 400) bad4xx.push(r.status() + ' ' + r.url()) })
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
async function boardText(p, key, value) {
  const el = p.locator(`#schedBoard [data-bfld="${key}"]:visible, #schedBoard [data-txt="${key}"]:visible`).first()
  if (!(await el.count())) throw new Error('no board box ' + key)
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await el.click()
  const tag = await el.evaluate(e => e.tagName)
  if (tag === 'INPUT' || tag === 'TEXTAREA') { await el.fill(''); await el.type(String(value), { delay: 8 }) }
  else { await p.keyboard.press('Control+A'); await p.keyboard.type(String(value), { delay: 8 }) }
  await el.evaluate(e => e.blur()); await sleep(450)
}
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
  for (let i = 0; i < 3; i++) {
    const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible'); if (await nodoc.count()) { await nodoc.click(); await sleep(500); continue }
    const conf = p.locator('[data-testid="oilconf"]:visible')
    if (await conf.count()) { await conf.locator('button').filter({ hasText: /^No/ }).first().click().catch(() => {}); await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await sleep(600); continue }
    break
  }
  return (await p.evaluate(() => window.INPUTS.length)) > n0
}

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
    /* B2 extras: Scribe's Tuesday copies (his Tuesday seat is the solid one) */
    await fileInput(p, TUE, 's', { who: X, span: 'all' }),
    await fileInput(p, TUE, 'g', { who: X, type: 'Personal', allday: false, from: '15:30', to: '16:30', rmk: 'dentist' }),
    await fileInput(p, TUE, 'u', { who: X, type: 'LL', span: 'custom', from: '14:00', to: '15:00', rmk: 'leave bit' }),
  ]
  await boardOff(p)
  await sleep(1500)
  const state = await ctx.storageState()
  writeFileSync(STATE, JSON.stringify(state))
  log('FIXTURE', JSON.stringify(r))
  await ctx.close()
  return { state, r }
}

/* ---------------- reading what is painted ---------------- */
const READ = ([s, who, crew]) => {
  const where = e => {
    if (e.closest('#sbRoster,.crewpal,.eroster,.rpuck')) return 'crew list'
    if (e.closest('.sanscard')) return 'SANS card'
    if (e.closest('.sb-panel.pinp,.sec-inp,.pinp')) return 'Personal Inputs'
    if (e.closest('.sb-panel.unav,.sec-unav,.unav')) return 'Unavailable'
    if (e.closest('[data-slot^="g:"],.sb-panel.grnd,.sec-grnd,.grnd')) return 'Ground Programme'
    if (e.closest('[data-slot]') && /^\d/.test(e.closest('[data-slot]').dataset.slot)) return 'his seat'
    return 'other(' + (e.parentElement && e.parentElement.className) + '>' + (e.closest('[class]') && e.closest('[class]').className) + ')'
  }
  const list = [...document.querySelectorAll(`${s} .puck[data-person="${who}"]`)]
  if (crew) for (const r of document.querySelectorAll(`${crew} .rpuck[data-person="${who}"] .puck`)) if (!list.includes(r)) list.push(r)
  return list.filter(e => e.offsetParent !== null).map(e => {
    const cs = getComputedStyle(e)
    const chips = [...e.querySelectorAll('.lchip')].filter(c => c.getBoundingClientRect().width > 1)
    return { where: where(e), rings: ['boxdot', 'boxdash', 'boxred'].filter(c => e.classList.contains(c)), lit: e.classList.contains('wfoc'), dim: e.classList.contains('dim'), cls: [...e.classList].join(' '),
      outline: cs.outlineStyle + ' ' + cs.outlineWidth, chip: chips.map(c => c.textContent.trim()).join('/') }
  })
}
const read = (p, scope, id, crew) => p.evaluate(READ, [scope, id, crew || null])
const say = ps => ps.map(x => `${x.where}[${x.rings.join('+') || 'none'}${x.lit ? ' LIT' : ''}${x.dim ? ' DIM' : ''}|${x.outline}|chip ${x.chip || '-'}]`).join(' · ')
const EXPECT_WHERE = ['Ground Programme', 'Personal Inputs', 'Unavailable', 'SANS card']
/* judge: every copy wears exactly the seat's ring set and chip; the named kinds are drawn */
function judge(rd, want, boardCrew) {
  const seat = rd.find(x => x.where === 'his seat')
  if (!seat) return { ok: false, why: 'no seat puck read' }
  const copies = rd.filter(x => x.where !== 'his seat')
  const seatOk = want ? seat.rings.join('+') === want : true
  const bad = copies.filter(c => c.rings.join('+') !== seat.rings.join('+') || c.chip !== seat.chip)
  const kinds = new Set(copies.map(c => c.where))
  const missing = EXPECT_WHERE.concat(boardCrew ? ['crew list'] : []).filter(k => !kinds.has(k))
  return { ok: seatOk && !bad.length && !missing.length, why: `seat ${seat.rings.join('+') || 'none'} chip '${seat.chip}'; ${copies.length} copies; mismatched: ${bad.map(b => b.where).join(',') || 'none'}; not drawn: ${missing.join(',') || 'none'}` }
}

/* ---------------- framing ---------------- */
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
async function shot(p, name) { await p.screenshot({ path: resolve(OUT, name + '.png') }); return name + '.png' }
const rowsOf = (scope, id) => [`${scope} .sanscard:has(.puck[data-person="${id}"])`, `${scope} .sb-panel.unav .sb-arow:has(.puck[data-person="${id}"])`, `${scope} .sb-panel.pinp .sb-arow:has(.puck[data-person="${id}"])`,
  `${scope} .sec-unav .plrow:has(.puck[data-person="${id}"])`, `${scope} .sec-inp .plrow:has(.puck[data-person="${id}"])`, `#sbRoster .rpuck[data-person="${id}"]`]
async function openFold(p, root, di) {
  const open = await p.evaluate(([r, i]) => { const h = document.querySelector(`${r} [data-pitog="${i}"]`); if (!h) return null; const pnl = h.closest('.sb-panel,.sec'); return pnl ? !!pnl.querySelector('.puck') : null }, [root, di])
  if (open === false) { await click(p, `${root} [data-pitog="${di}"]`); await sleep(500) }
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
async function onBoard(p, di) { await boardTo(p, di); await openFold(p, '#schedBoard', di); await sleep(300) }
async function onWeek(p, di) { await weekDay(p, di); await openFold(p, '#eWeek', di); await sleep(300) }

/* a crop of every puck of the man, each its own file (2x), stacked into one sheet */
async function cropSheet(browser, p, scope, id, crew, name, title) {
  if (!(await p.evaluate(() => devicePixelRatio >= 2))) return null   /* crops are taken in the 2x pass below */
  const n = await p.evaluate(READ, [scope, id, crew || null]).then(a => a.length)
  const out = []
  for (let k = 0; k < n; k++) {
    const info = await p.evaluate(([s, who, cr, k, src]) => {
      const list = [...document.querySelectorAll(`${s} .puck[data-person="${who}"]`)]
      if (cr) for (const r of document.querySelectorAll(`${cr} .rpuck[data-person="${who}"] .puck`)) if (!list.includes(r)) list.push(r)
      const e = list.filter(e => e.offsetParent !== null)[k]; if (!e) return null
      e.scrollIntoView({ block: 'center', inline: 'nearest' })
      return null
    }, [scope, id, crew || null, k]); await sleep(200)
    const box = await p.evaluate(([s, who, cr, k]) => {
      const list = [...document.querySelectorAll(`${s} .puck[data-person="${who}"]`)]
      if (cr) for (const r of document.querySelectorAll(`${cr} .rpuck[data-person="${who}"] .puck`)) if (!list.includes(r)) list.push(r)
      const e = list.filter(e => e.offsetParent !== null)[k]; if (!e) return null
      const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }
    }, [scope, id, crew || null, k])
    if (!box) continue
    const rd = (await p.evaluate(READ, [scope, id, crew || null]))[k]
    const buf = await p.screenshot({ clip: { x: Math.max(0, box.x - 10), y: Math.max(0, box.y - 10), width: box.w + 20, height: box.h + 20 } })
    out.push({ where: rd ? rd.where : '?', cls: rd ? rd.rings.join('+') || 'none' : '', url: 'data:image/png;base64,' + buf.toString('base64') })
  }
  const ctx = await browser.newContext({ viewport: { width: 900, height: 300 }, deviceScaleFactor: 2 })
  const sp = await ctx.newPage()
  await sp.setContent(`<html><body style="margin:0;background:#0B0D10;color:#E6EAEE;font:13px/1.3 -apple-system,Segoe UI,sans-serif;padding:16px"><div style="font-weight:700;font-size:15px;margin-bottom:10px">${title}</div>
    <div style="display:flex;flex-wrap:wrap;gap:16px">${out.map(c => `<div><img src="${c.url}" style="zoom:1.5;display:block"><div style="color:#9AA6B2;margin-top:4px">${c.where} · ${c.cls}</div></div>`).join('')}</div></body></html>`)
  await sleep(300)
  const h = await sp.evaluate(() => document.body.scrollHeight), w = await sp.evaluate(() => document.body.scrollWidth)
  await sp.setViewportSize({ width: Math.max(500, w), height: h })
  await sp.screenshot({ path: resolve(OUT, name + '.png'), fullPage: true })
  await ctx.close()
  return name + '.png'
}

/* ---------------- main ---------------- */
const browser = await chromium.launch({ headless: true, ...LAUNCH })
let state
if (process.env.WALK_REUSE && existsSync(STATE)) state = JSON.parse(readFileSync(STATE, 'utf8'))
else { const f = await buildFixture(browser); state = f.state }

const CSID = await (async () => { const { ctx, p } = await open(browser, { state }); const r = await p.evaluate(([x, y]) => ({ x: window.PEOPLE[x].cs, y: window.PEOPLE[y].cs }), [X, Y]); await ctx.close(); return r })()
log('callsigns', JSON.stringify(CSID))

/* ===== DESKTOP 1440x900 scale 1 ===== */
{
  const { ctx, p } = await open(browser, { state })
  /* sanity: the fixture landed */
  const fx = await p.evaluate(([x, y]) => ({ x0: window.DAYS[0].waves.some(w => w.formations[0].aircraft[0] && w.formations[0].aircraft[0].w === x), y1: window.DAYS[1].waves.some(w => w.formations[0].aircraft[0] && w.formations[0].aircraft[0].w === y) }), [X, Y])
  log('fixture landed', JSON.stringify(fx))
  if (!fx.x0 || !fx.y1) throw new Error('fixture missing')

  /* S1 board Monday Scribe */
  await onBoard(p, MON)
  const s1 = await read(p, '#schedBoard', X, '#sbRoster')
  const s1pics = []
  await p.evaluate(who => { const r = document.querySelector(`#sbRoster .rpuck[data-person="${who}"]`); let x = r && r.parentElement; while (x && x !== document.body && !(x.scrollHeight > x.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(x).overflowY))) x = x.parentElement; if (r && x && x !== document.body) x.scrollTop += r.getBoundingClientRect().top - x.getBoundingClientRect().top - x.clientHeight / 2 }, X); await sleep(300)
  await p.evaluate(() => { const e = document.querySelector('#schedBoard .sb-panel.sansav') || document.querySelector('#schedBoard .sb-panel.unav'); e && e.scrollIntoView({ block: 'center' }) }); await sleep(300)
  await boxes(p, rowsOf('#schedBoard', X)); s1pics.push(await shot(p, 'dk-01-mon-scribe-board')); await unbox(p)
  log('S1 board Mon Scribe:', say(s1))
  const j1 = judge(s1, 'boxdot', true)
  record('S1 Board Mon Scribe', j1.ok, j1.why + ' || ' + say(s1), s1pics.join(','))
  const c1 = await cropSheet(browser, p, '#schedBoard', X, '#sbRoster', 'dk2x-01-mon-scribe-closeups', 'Scribe on Monday - Scheduler Board (all pucks)')
  log('  crops', c1)

  /* S2 week Monday Scribe */
  await onWeek(p, MON)
  const s2 = await read(p, `#eWeek .day[data-day="${MON}"]`, X, 'body')
  await p.evaluate(([i, who]) => { const e = document.querySelector(`#eWeek .day[data-day="${i}"] .puck[data-person="${who}"]:not([data-slot] *)`) || document.querySelector(`#eWeek .day[data-day="${i}"] .puck[data-person="${who}"]`); e && e.scrollIntoView({ block: 'center' }) }, [MON, X]); await sleep(300)
  const sec = `#eWeek .day[data-day="${MON}"]`
  await boxes(p, [`${sec} [data-slot]:has(> .puck[data-person="${X}"])`, ...rowsOf(sec, X)], 6)
  const w1 = await shot(p, 'dk-02-mon-scribe-week'); await unbox(p)
  const j2 = judge(s2, 'boxdot', true)
  record('S2 Week Mon Scribe', j2.ok, j2.why + ' || ' + say(s2), w1)
  await cropSheet(browser, p, sec, X, 'body', 'dk2x-02-mon-scribe-week-closeups', 'Scribe on Monday - Edit Schedule week (all pucks)')

  /* S3 Tuesday Otter, board + week */
  await onBoard(p, TUE)
  const s3b = await read(p, '#schedBoard', Y, '#sbRoster')
  await p.evaluate(() => { const e = document.querySelector('#schedBoard .sb-panel.sansav') || document.querySelector('#schedBoard .sb-panel.unav'); e && e.scrollIntoView({ block: 'center' }) }); await sleep(300)
  await boxes(p, rowsOf('#schedBoard', Y)); const b3 = await shot(p, 'dk-03-tue-otter-board'); await unbox(p)
  const j3b = judge(s3b, 'boxdash', true)
  record('S3 Board Tue Otter', j3b.ok, j3b.why + ' || ' + say(s3b), b3)
  await cropSheet(browser, p, '#schedBoard', Y, '#sbRoster', 'dk2x-03-tue-otter-closeups', 'Otter on Tuesday - Scheduler Board (all pucks)')
  await onWeek(p, TUE)
  const secT = `#eWeek .day[data-day="${TUE}"]`
  const s3w = await read(p, secT, Y, 'body')
  await p.evaluate(([i, who]) => { const e = document.querySelector(`#eWeek .day[data-day="${i}"] .puck[data-person="${who}"]`); e && e.scrollIntoView({ block: 'center' }) }, [TUE, Y]); await sleep(300)
  await boxes(p, [`${secT} [data-slot]:has(> .puck[data-person="${Y}"])`, ...rowsOf(secT, Y)], 6)
  const w3 = await shot(p, 'dk-04-tue-otter-week'); await unbox(p)
  const j3w = judge(s3w, 'boxdash', true)
  record('S3 Week Tue Otter', j3w.ok, j3w.why + ' || ' + say(s3w), w3)
  await cropSheet(browser, p, secT, Y, 'body', 'dk2x-04-tue-otter-week-closeups', 'Otter on Tuesday - Edit Schedule week (all pucks)')

  /* S4 issues list open + crew-rest line */
  for (const [di, id, cs, ringWant, style, tag] of [[MON, X, CSID.x, 'boxdot', 'dotted', 'mon-scribe'], [TUE, Y, CSID.y, 'boxdash', 'dashed', 'tue-otter']]) {
    await onWeek(p, di)
    const sc = `#eWeek .day[data-day="${di}"]`
    const shutRd = await read(p, sc, id, 'body')
    log(`S4 ${tag} list SHUT:`, say(shutRd))
    await listOpen(p, di, true)
    const lines = await p.evaluate(([i]) => [...document.querySelectorAll(`#eWeek .day[data-day="${i}"] .witem`)].map(e => ({ ix: e.dataset.wix, t: e.textContent.trim().slice(0, 90) })), [di])
    log(`S4 d${di} lines:`, JSON.stringify(lines))
    const openRd = await read(p, sc, id, 'body')
    const idx = lines.find(l => /rest|breaks/i.test(l.t) && l.t.includes(cs)) || lines.find(l => l.t.includes(cs))
    if (!idx) { record(`S4 ${tag}`, false, 'no issue line names ' + cs + '; lines: ' + JSON.stringify(lines)); continue }
    await p.evaluate(([i]) => { const d = document.querySelector(`#eWeek .day[data-day="${i}"] [data-daywarn="${i}"]`); d && d.scrollIntoView({ block: 'start' }) }, [di]); await sleep(200)
    const nth = lines.indexOf(idx)
    await click(p, `${sc} .witem >> nth=${nth}`); await sleep(600)
    const lit = await read(p, sc, id, 'body')
    const counts = await p.evaluate(i => { const q = s => document.querySelectorAll(`#eWeek .day[data-day="${i}"] ${s}`).length; return { wfoc: q('.puck.wfoc'), dim: q('.puck.dim'), pucks: q('.puck') } }, di)
    /* put the seat in view for the picture */
    await p.evaluate(([i, who]) => { const e = document.querySelector(`#eWeek .day[data-day="${i}"] [data-slot] .puck[data-person="${who}"]`); e && e.scrollIntoView({ block: 'center' }) }, [di, id]); await sleep(300)
    await boxes(p, [`${sc} [data-slot]:has(> .puck[data-person="${id}"])`], 12)
    const pic = await shot(p, `dk-0${di === MON ? 5 : 6}-${tag}-week-list-open-tapped`); await unbox(p)
    const litOnes = lit.filter(x => x.lit)
    const allKeep = litOnes.length > 0 && litOnes.every(x => x.outline.startsWith(style) && x.rings.join('+') === ringWant)
    const nonLitRings = lit.filter(x => !x.lit)
    log(`S4 ${tag} open(before tap):`, say(openRd)); log(`S4 ${tag} after tap:`, say(lit), JSON.stringify(counts))
    record(`S4 ${tag} list open + line "${idx.t.slice(0, 40)}"`, allKeep && counts.dim > 0, `lit pucks of ${cs}: ${litOnes.length} (${litOnes.map(x => x.where + ':' + x.outline).join('; ')}); not lit copies: ${nonLitRings.map(x => x.where).join(',') || 'none'}; day counts ${JSON.stringify(counts)} (wfoc=lit, dim=dimmed)`, pic)
    await cropSheet(browser, p, sc, id, 'body', `dk2x-0${di === MON ? 5 : 6}-${tag}-list-open-closeups`, `${cs} on ${di === MON ? 'Monday' : 'Tuesday'} - issues list open, line tapped`)
    /* B3 (Scribe/Otter): close the list, rings as at rest */
    await listOpen(p, di, false); await p.evaluate(() => window.WFOCUS && 0); await sleep(500)
    const after = await read(p, sc, id, 'body')
    const restWant = di === MON ? s2 : s3w
    const same = JSON.stringify(after.map(x => [x.where, x.rings, x.chip, x.lit])) === JSON.stringify(restWant.map(x => [x.where, x.rings, x.chip, x.lit]))
    record(`B3 ${tag} close the list`, same, `after close: ${say(after)} ; at rest was: ${say(restWant)}`)
  }

  /* B3x: Monday's list opened and shut WITHOUT tapping a line; then tapped line + shut, with a picture of what is left */
  {
    const o2 = await open(browser, { state }); const p = o2.p
    await onWeek(p, MON)
    const sc = `#eWeek .day[data-day="${MON}"]`
    const rest = await read(p, sc, X, 'body')
    await listOpen(p, MON, true); const opened = await read(p, sc, X, 'body')
    await listOpen(p, MON, false); await sleep(400); const closed = await read(p, sc, X, 'body')
    const same = JSON.stringify(closed.map(x => [x.where, x.rings, x.chip, x.lit, x.dim])) === JSON.stringify(rest.map(x => [x.where, x.rings, x.chip, x.lit, x.dim]))
    record('B3x Scribe Mon: open then close, no tap', same, `rest ${say(rest)} || open ${say(opened)} || closed ${say(closed)}`)
    await listOpen(p, MON, true)
    const nth = await p.evaluate(([i, cs]) => [...document.querySelectorAll(`#eWeek .day[data-day="${i}"] .witem`)].findIndex(e => /Breaks/.test(e.textContent) && e.textContent.includes(cs)), [MON, CSID.x])
    await click(p, `${sc} .witem >> nth=${nth}`); await sleep(500)
    await listOpen(p, MON, false); await sleep(500)
    const after = await read(p, sc, X, 'body')
    const dimsAfter = await p.evaluate(() => ({ wfoc: document.querySelectorAll('.puck.wfoc').length, dim: document.querySelectorAll('.puck.dim').length, focus: JSON.stringify(window.WFOCUS || null) }))
    await p.evaluate(([i, who]) => { const e = document.querySelector(`#eWeek .day[data-day="${i}"] [data-slot] .puck[data-person="${who}"]`); e && e.scrollIntoView({ block: 'center' }) }, [MON, X]); await sleep(300)
    const pc = await shot(p, 'dk-10-b3x-mon-after-tap-then-close')
    record('B3x Scribe Mon: tap line, then close', JSON.stringify(after.map(x => [x.where, x.rings, x.chip, x.lit, x.dim])) === JSON.stringify(rest.map(x => [x.where, x.rings, x.chip, x.lit, x.dim])), `after ${say(after)} ; page counts ${JSON.stringify(dimsAfter)}`, pc)
    await o2.ctx.close()
  }

  /* B2 Scribe on Tuesday: his seat is the solid one; copies stay solid */
  await onBoard(p, TUE)
  const b2b = await read(p, '#schedBoard', X, '#sbRoster')
  await p.evaluate(() => { const e = document.querySelector('#schedBoard .sb-panel.sansav') || document.querySelector('#schedBoard .sb-panel.unav'); e && e.scrollIntoView({ block: 'center' }) }); await sleep(300)
  await boxes(p, rowsOf('#schedBoard', X)); const b2p = await shot(p, 'dk-07-b2-tue-scribe-board'); await unbox(p)
  const j2b = judge(b2b, 'boxred', true)
  record('B2 Board Tue Scribe (true breach on the day itself)', j2b.ok, j2b.why + ' || ' + say(b2b), b2p)
  await cropSheet(browser, p, '#schedBoard', X, '#sbRoster', 'dk2x-07-b2-tue-scribe-closeups', 'Scribe on Tuesday - the day his rest is broken (solid)')
  await onWeek(p, TUE)
  const b2w = await read(p, secT, X, 'body')
  const j2w = judge(b2w, 'boxred', true)
  record('B2 Week Tue Scribe', j2w.ok, j2w.why + ' || ' + say(b2w))

  /* B1: Scribe's Monday landing earlier, copies lose the dotted ring; undo brings it back */
  await onBoard(p, MON)
  const giMon = await p.evaluate(x => window.DAYS[0].waves.findIndex(w => w.formations[0].aircraft[0] && w.formations[0].aircraft[0].w === x), X)
  const before = await read(p, '#schedBoard', X, '#sbRoster')
  await boardText(p, `ff:0.${giMon}.0.to`, '12:00')
  await boardText(p, `ff:0.${giMon}.0.ld`, '14:00')
  await sleep(500)
  await p.evaluate(() => { const e = document.querySelector('#schedBoard .sb-panel.sansav') || document.querySelector('#schedBoard .sb-panel.unav'); e && e.scrollIntoView({ block: 'center' }) }); await sleep(300)
  const moved = await read(p, '#schedBoard', X, '#sbRoster')
  await boxes(p, rowsOf('#schedBoard', X)); const b1a = await shot(p, 'dk-08-b1-after-move'); await unbox(p)
  const noRing = moved.every(x => !x.rings.length) && moved.every(x => !x.chip)
  record('B1a take-off 12:00, landing 14:00', noRing, `before: ${say(before)} || after move: ${say(moved)}`, b1a)
  await boardOff(p)
  let backOk = false, tries = 0, last = []
  while (tries < 4 && !backOk) {
    tries++
    await click(p, '#undoBtn'); await sleep(700)
    await onBoard(p, MON)
    last = await read(p, '#schedBoard', X, '#sbRoster')
    backOk = last.length && last.every(x => x.rings.join('+') === 'boxdot')
    if (!backOk) await boardOff(p)
  }
  await p.evaluate(() => { const e = document.querySelector('#schedBoard .sb-panel.sansav') || document.querySelector('#schedBoard .sb-panel.unav'); e && e.scrollIntoView({ block: 'center' }) }); await sleep(300)
  await boxes(p, rowsOf('#schedBoard', X)); const b1b = await shot(p, 'dk-09-b1-after-undo'); await unbox(p)
  record('B1b undo (' + tries + ' presses)', backOk, `after undo: ${say(last)}`, b1b)
  await ctx.close()
}


/* ===== DESKTOP 1440x900 at 2x: the close-up crops only ===== */
{
  const { ctx, p } = await open(browser, { state, dsf: 2 })
  await onBoard(p, MON); await cropSheet(browser, p, '#schedBoard', X, '#sbRoster', 'dk2x-01-mon-scribe-board', 'Scribe on Monday - Scheduler Board (every puck of his)')
  await onWeek(p, MON); await cropSheet(browser, p, '#eWeek .day[data-day="0"]', X, 'body', 'dk2x-02-mon-scribe-week', 'Scribe on Monday - Edit Schedule week, list shut')
  await listOpen(p, MON, true); await cropSheet(browser, p, '#eWeek .day[data-day="0"]', X, 'body', 'dk2x-03-mon-scribe-week-list-open', 'Scribe on Monday - issues list OPEN (lit pucks keep the dotted ring)')
  await onBoard(p, TUE); await cropSheet(browser, p, '#schedBoard', Y, '#sbRoster', 'dk2x-04-tue-otter-board', 'Otter on Tuesday - Scheduler Board (every puck of his)')
  await onWeek(p, TUE); await cropSheet(browser, p, '#eWeek .day[data-day="1"]', Y, 'body', 'dk2x-05-tue-otter-week', 'Otter on Tuesday - Edit Schedule week, list shut')
  await listOpen(p, TUE, true); await cropSheet(browser, p, '#eWeek .day[data-day="1"]', Y, 'body', 'dk2x-06-tue-otter-week-list-open', 'Otter on Tuesday - issues list OPEN (lit pucks keep the dashed ring)')
  await onBoard(p, TUE); await cropSheet(browser, p, '#schedBoard', X, '#sbRoster', 'dk2x-07-b2-tue-scribe-board', 'Scribe on Tuesday - day his rest is broken (solid)')
  await ctx.close()
}

/* ===== PHONE 390x844 scale 3 ===== */
{
  const { ctx, p } = await open(browser, { state, width: 390, height: 844, dsf: 3, phone: true })
  for (const [di, id, want, tag, label] of [[MON, X, 'boxdot', 'mon-scribe', 'Scribe Monday'], [TUE, Y, 'boxdash', 'tue-otter', 'Otter Tuesday']]) {
    await onBoard(p, di)
    const rd = await read(p, '#schedBoard', id, '#sbRoster')
    await p.evaluate(() => { const e = document.querySelector('#schedBoard .sb-panel.sansav'); e && e.scrollIntoView({ block: 'start' }) }); await sleep(300)
    await boxes(p, rowsOf('#schedBoard', id).slice(0, 5))
    const pic = await shot(p, `ph-0${di === MON ? 1 : 3}-${tag}-board`); await unbox(p)
    const j = judge(rd, want, false)
    record(`S5 phone board ${label}`, j.ok, j.why + ' || ' + say(rd), pic)
    await weekDay(p, di); await openFold(p, '#eWeek', di)
    const rw = await read(p, `#eWeek .day[data-day="${di}"]`, id, 'body')
    await p.evaluate(([i, who]) => { const e = document.querySelector(`#eWeek .day[data-day="${i}"] .puck[data-person="${who}"]`); e && e.scrollIntoView({ block: 'center' }) }, [di, id]); await sleep(300)
    const pic2 = await shot(p, `ph-0${di === MON ? 2 : 4}-${tag}-week`)
    const jw = judge(rw, want, true)
    record(`S5 phone week ${label}`, jw.ok, jw.why + ' || ' + say(rw), pic2)
  }
  await ctx.close()
}

log('---- SUMMARY ----')
for (const r of results) log(`${r.ok ? 'PASS' : 'FAIL'} | ${r.step} | ${r.pic}`)
log('errors', errors.slice(0, 8).join(' | ') || 'none')
log('4xx', bad4xx.slice(0, 8).join(' | ') || 'none')
writeFileSync(resolve(OUT, 'results.json'), JSON.stringify({ results, errors, bad4xx }, null, 1))
await browser.close()
