/* WALK — the standby batch of 20 Oct 26 (D994's small fixes): [BOARD-TAB-FOLD] with the week's half, [SA-HEAD-CLIP-360],
   [STANDBY-UNDO-WORDS]. Written as assertions of the RIGHT behaviour, so a PASS means correct and a re-run is the re-walk.
   The fixture through the app's own controls: the standby waves by the board's "+ Wave" menu, every time typed by a real
   press and real keys (Tab on a desktop, a finger on the next box on a phone), Undo / Redo by their own buttons, the day
   published by its own sign-offs and Publish button. Desktop 1440 × 900 by mouse (D1–D12); a phone 402 × 874 by touch,
   then 360 and 320 (P1–P6).
   Run: HP_URL=http://localhost:4312 node scripts/handpass/walk-standby-batch.mjs
   Pictures: docs/img/handpass/2026-10-20-standby-batch/walk/ (WALK_DIR=walk2 for a re-walk) */
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4312'
const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-20-standby-batch', process.env.WALK_DIR || 'walk')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const results = [], errors = []
const check = (id, ok, said) => { results.push([id, ok, said]); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} — ${said}`) }
let n = 0
const pic = async (p, name, loc, pad = 6) => {
  const f = resolve(OUT, `${String(++n).padStart(2, '0')}-${name}.png`)
  if (!loc) { await p.screenshot({ path: f }); return }
  const b = await loc.boundingBox()
  await p.screenshot({ path: f, clip: { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: b.width + 2 * pad, height: b.height + 2 * pad } })
}
async function start(vp, phone) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, colorScheme: 'dark', ...(phone ? { hasTouch: true } : {}) })
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  p.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  p.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await p.goto(BASE + '/?fresh=1')
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await p.waitForTimeout(500)
  return { ctx, p }
}
async function press(p, loc, phone) {
  await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await p.waitForTimeout(150)
  const b = await loc.boundingBox()
  if (phone) await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await p.waitForTimeout(250)
}
const go = async (p, page) => { await p.evaluate(x => window.go(x), page); await p.waitForFunction(x => window.CURPAGE === x, page); await p.waitForTimeout(500) }
async function openBoard(p, phone) { await go(p, 'editsched'); await press(p, p.locator('#eWeek [data-sbday="0"]:visible').first(), phone); await p.waitForSelector('#schedBoard'); await p.waitForTimeout(600) }
async function closeBoard(p, phone) { for (let i = 0; i < 3 && (await p.locator('#schedBoard').isVisible().catch(() => false)); i++) { await press(p, p.locator('#sbDone:visible').first(), phone); await p.waitForTimeout(500) } }
async function addWaves(p, phone) {
  for (const k of ['sc', 'avalon', 'bb']) {
    await press(p, p.locator('#schedBoard [data-wvadd="0"]:visible').first(), phone)
    await press(p, p.locator(`[data-wmkind="${k}"]:visible`).first(), phone); await p.waitForTimeout(400)
  }
  return p.evaluate(() => ['sc', 'avalon', 'bb'].map(k => window.DAYS[0].waves.findIndex(w => w.kind === k)))
}
const F = (p, g, f) => p.evaluate(([g, f]) => window.DAYS[0].waves[g].formations[0][f] || '', [g, f])
const bbox = (p, key) => p.locator(`#schedBoard [data-bfld="${key}"]:visible`).first()
const wbox = (p, key) => p.locator(`#eWeek [data-txt="${key}"]`).first()
const active = p => p.evaluate(() => document.activeElement?.getAttribute('data-bfld') || document.activeElement?.getAttribute('data-txt') || document.activeElement?.tagName || '')
/* the board's own Undo / Redo while it stands (D349), the top bar's otherwise */
const onBoard = p => p.locator('#schedBoard').isVisible().catch(() => false)
const undoB = async p => p.locator((await onBoard(p)) ? '#sbUndo' : '#undoBtn').first()
const redoB = async p => p.locator((await onBoard(p)) ? '#sbRedo' : '#redoBtn').first()
const undoT = async p => (await undoB(p)).getAttribute('title')
const redoT = async p => (await redoB(p)).getAttribute('title')
/* type into a board box: one press (which selects the time — D1047), the digits, then Tab */
async function typeBoard(p, key, digits, phone, nextKey) {
  const b = bbox(p, key); await press(p, b, phone)
  await p.keyboard.type(digits)
  if (phone) await press(p, bbox(p, nextKey), true); else await p.keyboard.press('Tab')
  await p.waitForTimeout(500)
  return b.inputValue()
}
async function typeWeek(p, key, digits, phone, nextKey) {
  const b = wbox(p, key); await press(p, b, phone)
  await p.keyboard.press('Control+A'); await p.keyboard.type(digits)
  if (phone) await press(p, wbox(p, nextKey), true); else await p.keyboard.press('Tab')
  await p.waitForTimeout(600)
  return (await wbox(p, key).textContent()).trim()
}
const head = (p, g, root) => p.evaluate(([g, root]) => {
  const go = document.querySelector(`${root} [data-move="mv:w.0.${g}"]`) || [...document.querySelectorAll(`${root} .go.sa`)][0]
  const h = go.querySelector('.cols.formcols').children[0]
  return { text: h.innerText.replace(/\s+/g, ' '), fits: h.scrollWidth <= h.clientWidth, size: getComputedStyle(h).fontSize }
}, [g, root])

try {
  /* ---------------- desktop, by mouse and keys ---------------- */
  {
    const { ctx, p } = await start({ width: 1440, height: 900 }, false)
    await openBoard(p, false)
    const [sc, av, bb] = await addWaves(p, false)
    check('D1', sc >= 0 && av >= 0 && bb >= 0, `SC, AVALON and BB added by the board's "+ Wave" menu (waves ${sc}, ${av}, ${bb})`)
    let v = await typeBoard(p, `ff:0.${av}.0.to`, '2015', false)
    check('D2', v === '20:15' && (await F(p, av, 'to')) === '20:15' && (await active(p)) !== `ff:0.${av}.0.to`, `board, AVALON START typed 2015 and Tab: the box reads "${v}" at once, saved ${await F(p, av, 'to')}, the caret moved on (${await active(p)})`)
    await pic(p, 'board-avalon-start-after-tab', bbox(p, `ff:0.${av}.0.to`).locator('xpath=ancestor::div[contains(@class,"sb-line")][1]'))
    const u1 = await undoT(p)
    check('D3', u1 === 'Undo — a start time', `Undo names it: "${u1}"`)
    await press(p, await undoB(p), false); await p.waitForTimeout(500)
    const back = await bbox(p, `ff:0.${av}.0.to`).inputValue(), r1 = await redoT(p)
    check('D4', back === '19:00' && (await F(p, av, 'to')) === '19:00' && /a start time/.test(r1 || ''), `Undo took it back: the box reads ${back}; Redo says "${r1}"`)
    await press(p, await redoB(p), false); await p.waitForTimeout(500)
    check('D5', (await bbox(p, `ff:0.${av}.0.to`).inputValue()) === '20:15' && (await F(p, av, 'to')) === '20:15', `Redo put 20:15 back (box ${await bbox(p, `ff:0.${av}.0.to`).inputValue()})`)
    v = await typeBoard(p, `ff:0.${bb}.0.ld`, '1830', false)
    const u2 = await undoT(p)
    check('D6', v === '18:30' && u2 === 'Undo — an end time', `board, BB END typed 1830 and Tab: reads "${v}"; Undo "${u2}"`)
    v = await typeBoard(p, `ff:0.${sc}.0.br`, '610', false)
    const u3 = await undoT(p)
    {
      const vb = await typeBoard(p, `ff:0.${av}.0.br`, '1800', false), u4 = await undoT(p)
      check('D7', v === '06:10' && u3 === 'Undo — an in-time' && vb === '18:00' && u4 === 'Undo — a brief time', `SC's B typed 610 reads "${v}", Undo "${u3}"; AVALON's B typed 1800 reads "${vb}", Undo "${u4}"`)
    }
    /* a flying line and a duty desk, the older boxes */
    v = await typeBoard(p, 'ff:0.0.0.ld', '1135', false)
    const u5 = await undoT(p)
    const dkey = await p.evaluate(() => (document.querySelector('#schedBoard [data-bfld^="dr:0."][data-bfld$=".str"]') || {}).dataset?.bfld || '')
    const dv = dkey ? await typeBoard(p, dkey, '0715', false) : 'NO DUTY BOX'
    check('D8', v === '11:35' && u5 === 'Undo — a landing time' && dv === '07:15', `flying line's landing typed 1135 reads "${v}" (Undo "${u5}" — a flying line keeps its words); a duty desk's start (${dkey}) typed 0715 reads "${dv}"`)
    /* break tests on the board: nonsense, a cleared box, Escape */
    const was = await F(p, 0, 'to')
    v = await typeBoard(p, 'ff:0.0.0.to', 'abc', false)
    check('D9', v === was && (await F(p, 0, 'to')) === was, `break: "abc" typed in a take-off and Tab — the box reads "${v}", the saved time stays ${was} (nothing half-typed left showing)`)
    {
      const b = bbox(p, `ff:0.${bb}.0.ld`); await press(p, b, false); await p.keyboard.press('Backspace'); await p.keyboard.press('Tab'); await p.waitForTimeout(500)
      const cleared = await b.inputValue(), saved = await F(p, bb, 'ld')
      check('D10', cleared === '' && saved === '', `break: BB END cleared and Tab — the box reads "${cleared}", saved "${saved}"`)
    }
    {
      const b = bbox(p, `ff:0.${av}.0.ld`), before = await b.inputValue(); await press(p, b, false); await p.keyboard.type('2359'); await p.keyboard.press('Escape'); await p.waitForTimeout(500)
      check('D11', (await b.inputValue()) === before && (await F(p, av, 'ld')) === before, `break: AVALON END typed 2359 then Escape — the box reads ${await b.inputValue()}, saved ${await F(p, av, 'ld')}, as before (${before})`)
    }
    await closeBoard(p, false); await go(p, 'editsched')
    /* the week */
    v = await typeWeek(p, `ff:0.${av}.0.ld`, '0815', false)
    check('D12', v === '08:15' && (await F(p, av, 'ld')) === '08:15' && (await active(p)) !== `ff:0.${av}.0.ld`, `week, AVALON END typed 0815 and Tab: reads "${v}" at once, the caret in the next box (${await active(p)})`)
    await pic(p, 'week-avalon-end-after-tab', wbox(p, `ff:0.${av}.0.ld`).locator('xpath=ancestor::div[contains(@class,"form")][1]'))
    const u6 = await undoT(p)
    check('D13', u6 === 'Undo — an end time', `week: Undo names it "${u6}"`)
    const wd = await p.evaluate(() => (document.querySelector('#eWeek .day[data-day="0"] [data-txt^="dr:0."][data-txt$=".end"]') || {}).dataset?.txt || '')
    const wdv = wd ? await typeWeek(p, wd, '1205', false) : 'NO DUTY END'
    check('D14', wdv === '12:05', `week, a duty desk's end (${wd}) typed 1205 and Tab reads "${wdv}"`)
    const fh = await head(p, sc, '#eWeek .day[data-day="0"]')
    check('D15', fh.text === 'SC SHIFT' && fh.fits && fh.size !== '7px', `desktop heading unchanged: "${fh.text}" at ${fh.size}`)
    /* the changes window */
    await press(p, p.locator('#histBtn'), false); await p.waitForTimeout(600)
    await press(p, p.locator('.chgwin button', { hasText: 'All changes' }).first(), false); await p.waitForTimeout(500)
    const lines = await p.evaluate(() => [...document.querySelectorAll('.chgwin .cw-l')].map(e => e.innerText.replace(/\s+/g, ' ')))
    const pick = re => lines.filter(t => re.test(t))
    /* an item changed more than once is a group — its heading, then a line a change — so an item is read as the smallest
       block that holds its name and a change */
    const itemText = name => p.evaluate(name => { const c = [...document.querySelectorAll('.chgwin *')].filter(e => e.innerText && e.innerText.includes(name) && e.innerText.includes('→')).sort((a, b) => a.innerText.length - b.innerText.length); return c.length ? c[0].innerText.replace(/\s+/g, ' ') : '' }, name)
    const avl = await itemText('AV NIGHT'), bbl = await itemText('BB SHIFT'), vl = await itemText('VL BFM')
    check('D16', /Start/.test(avl) && /End/.test(avl) && /Brief/.test(avl) && !/Take-off|Land\b/.test(avl) && /End/.test(bbl) && !/Land\b/.test(bbl) && /Land/.test(vl), `changes window — AVALON: "${avl.slice(0, 170)}"; BB: "${bbl.slice(0, 110)}"; the flying line: "${vl.slice(0, 110)}"; ${lines.length} lines`)
    await pic(p, 'changes-window-start-end', p.locator('.chgwin').first(), 2)
    if (process.env.WALK_DIR === 'walk2') {
      /* the re-walk: the blind read's F2 — an input's own start / end on the week and on the board */
      await press(p, p.locator('.chgwin button[aria-label*="Close"], .chgwin .cw-x').first(), false).catch(() => {})
      await p.keyboard.press('Escape').catch(() => {})
      const ik = await p.evaluate(() => (document.querySelector('#eWeek .day[data-day="0"] [data-inp$=".str"]') || {}).dataset?.inp || '')
      if (ik) {
        const c = p.locator(`#eWeek [data-inp="${ik}"]`).first(); await press(p, c, false)
        await p.keyboard.press('Control+A'); await p.keyboard.type('1015'); await p.keyboard.press('Tab'); await p.waitForTimeout(600)
        const shown = (await p.locator(`#eWeek [data-inp="${ik}"]`).first().textContent()).trim()
        check('D19', shown === '10:15', `week, an input's start (${ik}) typed 1015 and Tab reads "${shown}" at once`)
        await pic(p, 'week-input-start-after-tab', p.locator(`#eWeek [data-inp="${ik}"]`).first().locator('xpath=..'), 8)
      } else check('D19', false, 'no input start cell on Monday\'s week')
      await openBoard(p, false)
      const bk = await p.evaluate(() => (document.querySelector('#schedBoard [data-ifld$=".end"]') || {}).dataset?.ifld || '')
      if (bk) {
        const b = p.locator(`#schedBoard [data-ifld="${bk}"]:visible`).first(); await press(p, b, false)
        await p.keyboard.press('Control+A'); await p.keyboard.type('1645'); await p.keyboard.press('Tab'); await p.waitForTimeout(600)
        const shown = await b.inputValue()
        check('D20', shown === '16:45', `board, an input's end under Personal Inputs (${bk}) typed 1645 and Tab reads "${shown}" at once`)
        await pic(p, 'board-input-end-after-tab', b.locator('xpath=ancestor::*[contains(@class,"sb-arow") or contains(@class,"sb-irow") or contains(@class,"row")][1]'), 6).catch(async () => pic(p, 'board-input-end-after-tab', b, 30))
      } else check('D20', false, 'no input end box on the board')
    }
    await press(p, p.locator('.chgwin [aria-label="Close"], .chgwin .cw-x, .chgwin button[title*="Close"]').first(), false).catch(() => {})
    await ctx.close()
  }
  /* ---------------- a published day: the "To go out" list names a standby time ---------------- */
  {
    const { ctx, p } = await start({ width: 1440, height: 900 }, false)
    await openBoard(p, false)
    const [, av] = await addWaves(p, false)
    const L = await import('./lib.mjs')
    const pub = await L.publish(p, 0)
    check('D17', pub.published, `Monday published by its own sign-offs and Publish (${JSON.stringify(pub)})`)
    const v = await typeBoard(p, `ff:0.${av}.0.to`, '2030', false)
    await closeBoard(p, false); await go(p, 'editsched')
    await press(p, p.locator('#histBtn'), false); await p.waitForTimeout(600)
    const tab = p.locator('.chgwin button', { hasText: /To go out/ }).first()
    let out = []
    if (await tab.count()) {
      await press(p, tab, false); await p.waitForTimeout(500)
      /* the tab lists a line a day ("Monday 1 waiting to go out as AL1"); a press on it opens the day's list */
      const day = p.locator('.chgwin').first().getByText('waiting to go out').first()
      if (await day.count()) { await press(p, day, false); await p.waitForTimeout(700) }
      out = [(await p.locator('.chgwin').first().innerText()).replace(/\s+/g, ' ')]
    }
    check('D18', v === '20:30' && out.some(t => /20:30/.test(t) && /start/i.test(t)) && !out.some(t => /take-off/i.test(t)), `on the published day AVALON START 2030 reads "${v}"; the list of what goes out says start — ${JSON.stringify(out).slice(0, 300)}`)
    await pic(p, 'published-to-go-out-start', p.locator('.chgwin').first(), 2)
    await ctx.close()
  }
  /* ---------------- a phone, by touch ---------------- */
  {
    const { ctx, p } = await start({ width: 402, height: 874 }, true)
    await openBoard(p, true)
    const [sc, av, bb] = await addWaves(p, true)
    let v = await typeBoard(p, `ff:0.${av}.0.to`, '2015', true, `ff:0.${av}.0.ld`)
    check('P1', v === '20:15' && (await F(p, av, 'to')) === '20:15', `phone board, a finger on AVALON START, 2015, then a finger on END: START reads "${v}"`)
    await pic(p, 'phone-board-avalon-start', bbox(p, `ff:0.${av}.0.to`).locator('xpath=ancestor::div[contains(@class,"sb-line")][1]'))
    await closeBoard(p, true); await go(p, 'editsched')
    v = await typeWeek(p, `ff:0.${bb}.0.to`, '0905', true, `ff:0.${bb}.0.ld`)
    check('P2', v === '09:05' && (await F(p, bb, 'to')) === '09:05', `phone week, BB START by finger, 0905, then a finger on END: reads "${v}"`)
    const h402 = await head(p, av, '#eWeek .day[data-day="0"]')
    check('P3', h402.text === 'AVALON SHIFT' && h402.fits && h402.size !== '7px', `402 wide the heading is as before: "${h402.text}" at ${h402.size}, whole`)
    for (const width of [360, 320]) {
      await p.setViewportSize({ width, height: 780 }); await p.waitForTimeout(500)
      const hs = []
      for (const g of [sc, av, bb]) hs.push(await head(p, g, '#eWeek .day[data-day="0"]'))
      const peek = await p.locator('.day.peek:visible').count()
      check(`P4-${width}`, hs.every(h => h.fits) && hs.map(h => h.text).join('|') === 'SC SHIFT|AVALON SHIFT|BB SHIFT' && peek === 0, `${width} wide, Edit Schedule: ${hs.map(h => `"${h.text}" ${h.fits ? 'whole' : 'CUT'} at ${h.size}`).join(', ')}; next-week preview drawn: ${peek}`)
      const goEl = p.locator(`#eWeek .day[data-day="0"] [data-move="mv:w.0.${av}"]`).first()
      await goEl.evaluate(e => e.scrollIntoView({ block: 'start' })); await p.evaluate(() => scrollBy(0, -80)); await p.waitForTimeout(200)
      await pic(p, `phone-${width}-edit-week-avalon-heading`, goEl.locator('.cols.formcols').first(), 8)
    }
    if (process.env.WALK_DIR === 'walk2') {
      /* the re-walk: the blind read's F1 — a wave renamed longer than the room wraps, its name whole, 320 wide */
      const wl = wbox(p, `wl:0.${av}`); await press(p, wl, true)
      await p.keyboard.press('Control+A'); await p.keyboard.type('AVALON NIGHT 2'); await press(p, p.locator('#eWeek .day[data-day="0"] .day-head').first(), true); await p.waitForTimeout(500)
      const h = await head(p, av, '#eWeek .day[data-day="0"]')
      check('P7', h.text === 'AVALON NIGHT 2 SHIFT' && h.fits, `320 wide, AVALON renamed by finger "AVALON NIGHT 2": the heading reads "${h.text}", ${h.fits ? 'whole' : 'CUT'}`)
      const goEl = p.locator(`#eWeek .day[data-day="0"] [data-move="mv:w.0.${av}"]`).first()
      await goEl.evaluate(e => e.scrollIntoView({ block: 'start' })); await p.evaluate(() => scrollBy(0, -80)); await p.waitForTimeout(200)
      await pic(p, 'phone-320-renamed-wave-heading', goEl.locator('.cols.formcols').first(), 8)
    }
    await go(p, 'viewsched')
    const vh = await p.evaluate(() => [...document.querySelectorAll('#vWeek .day[data-day="0"] .go.sa')].map(go => { const h = go.querySelector('.cols.formcols').children[0]; return { text: h.innerText.replace(/\s+/g, ' '), fits: h.scrollWidth <= h.clientWidth } }))
    check('P5', vh.length === 3 && vh.every(h => h.fits), `320 wide, View-only Sched: ${JSON.stringify(vh)}`)
    const vgo = p.locator('#vWeek .day[data-day="0"] .go.sa').nth(1)
    await vgo.evaluate(e => e.scrollIntoView({ block: 'start' })); await p.evaluate(() => scrollBy(0, -80)); await p.waitForTimeout(200)
    await pic(p, 'phone-320-view-week-avalon-heading', vgo.locator('.cols.formcols').first(), 8)
    /* a flying wave's heading is untouched under 375 (the rule needs START / END beside it) */
    const fly = await p.evaluate(() => { const go = document.querySelector('#vWeek .day[data-day="0"] .go:not(.sa)'); const h = go && go.querySelector('.cols.formcols').children[0]; return h ? getComputedStyle(h).fontSize : 'none' })
    check('P6', fly !== '7px' && fly !== 'none', `320 wide, a flying wave's first heading keeps its size (${fly})`)
    await ctx.close()
  }
} finally {
  check('ERR', errors.length === 0, `browser errors: ${errors.length ? errors.join(' | ').slice(0, 500) : 'none'}`)
  const fails = results.filter(r => !r[1]).length
  console.log(`\n${results.length - fails} PASS, ${fails} FAIL`)
  await browser.close()
}
