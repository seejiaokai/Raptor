// THE WALK of [LW-PHONE-HEADER-SPACE] — the top of the Leave War on a phone is two lines (owner, D678, 8 Oct 26), and a
// desktop's is as it was (D679). The production build, a real browser, signed in THROUGH THE SIGN-IN CARD as an admin
// and as a member, every control of the two lines pressed and every pop-out opened; a picture after each step. Each
// check is written as the RIGHT behaviour (a PASS means correct), so running it again on a later build is the re-walk.
// The evidence sheet: docs/handpass/2026-10-08-lw-phone-header.md.
//
//   npm run build && npx vite preview --port 4180 --strictPort      (NOT 4173 — the browser tests reuse a server left there)
//   node scripts/handpass/lw-phone-head-walk.mjs [out dir]
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const OUT = process.argv[2] || 'docs/img/handpass/2026-10-08-lw-phone-header'
mkdirSync(OUT, { recursive: true })
/* NOT "?fresh=1": that keeps the app's data in memory only, and one step here reloads the page to see that a stage
   moved from the menu was SAVED. Each browser context below starts with empty storage, so each still opens on the
   untouched demo squadron. */
const URL = process.env.LOOK_URL || 'http://localhost:4180/'

let pass = 0, fail = 0, shots = 0
const fails = []
const check = (name, ok, detail = '') => { if (ok) pass++; else { fail++; fails.push(name) } console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`) }
const q = t => `[data-testid="${t}"]`

async function open(browser, { width, height, who, touch = true }) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, hasTouch: touch, isMobile: touch })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  await page.goto(URL)
  await page.fill('#luser', who === 'admin' ? 'ad' : 'us'); await page.fill('#lpass', who === 'admin' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector(q('row-slipway'))
  await page.waitForTimeout(500)
  return { ctx, page, errors }
}
const shot = async (page, name, full = false) => {
  shots++
  const vp = page.viewportSize()
  await page.screenshot({ path: join(OUT, name + '.png'), clip: { x: 0, y: 0, width: vp.width, height: full ? vp.height : Math.min(vp.height, 430) } })
}
/** what is painted in the top area: each control's box and words, whether anything overlaps or leaves the screen */
const read = page => page.evaluate(() => {
  const pg = document.querySelector('#page-leavewar')
  const tb = pg.querySelector(':scope > .topbar'), fl = pg.querySelector(':scope > .filters')
  const ids = ['war-picker', 'war-new', 'lw-viewing', 'stage-now', 'stage-advance', 'stage-back', 'bid-window', 'undermanned', 'legend-open']
  const b = {}
  for (const id of ids) {
    const el = pg.querySelector(`[data-testid="${id}"]`); if (!el) continue
    const r = el.getBoundingClientRect(); if (!r.width) continue
    b[id] = { l: r.left, t: r.top, r: r.right, b: r.bottom, text: (el.textContent || '').trim(), tag: el.tagName }
  }
  const lines = []
  for (const [id, x] of Object.entries(b)) {
    const mid = (x.t + x.b) / 2
    let line = lines.find(L => mid > L.t && mid < L.b)
    if (!line) { line = { t: x.t, b: x.b, ids: [] }; lines.push(line) }
    line.ids.push(id)
  }
  lines.sort((a, c) => a.t - c.t)
  let overlap = ''
  for (const L of lines) {
    const row = L.ids.map(id => ({ id, ...b[id] })).sort((a, c) => a.l - c.l)
    for (let i = 1; i < row.length; i++) if (row[i].l < row[i - 1].r - 0.5) overlap += `${row[i].id} over ${row[i - 1].id}; `
  }
  const rows = [...document.querySelectorAll('[data-testid^="row-"]')]
  return {
    b, lines: lines.map(L => L.ids), overlap,
    off: Object.entries(b).filter(([, x]) => x.l < 0 || x.r > innerWidth + 0.5).map(([id]) => id),
    labs: [...tb.querySelectorAll('.lab'), ...fl.querySelectorAll(':scope > .lab')].filter(el => el.getBoundingClientRect().width).map(el => el.textContent.trim()),
    height: Math.round(fl.getBoundingClientRect().bottom - tb.getBoundingClientRect().top),
    gridTop: Math.round(pg.querySelector('.mx-outer').getBoundingClientRect().top),
    names: rows.filter(r => r.getBoundingClientRect().bottom <= innerHeight && r.getBoundingClientRect().top >= 0).length,
    pageOver: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }
})
const stage = page => page.locator(q('stage-now')).innerText().then(s => s.trim())
/** a pop-out is whole on the screen and is the top thing at its own middle */
const onScreen = (page, testid) => page.evaluate(t => {
  const el = document.querySelector(`#page-leavewar [data-testid="${t}"]`)
  if (!el) return { there: false }
  const r = el.getBoundingClientRect()
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height, innerHeight - r.top) / 2)
  return { there: true, inside: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, onTop: !!hit && (hit === el || el.contains(hit)), box: [r.left, r.top, r.right, r.bottom].map(Math.round) }
}, testid)

const browser = await chromium.launch(launchOptions)

/* ======================= THE PHONE, AN ADMIN (Saber) — 390 and 360 wide ======================= */
for (const [width, height] of [[390, 844], [360, 740]]) {
  const W = `phone ${width}, admin`
  const { ctx, page, errors } = await open(browser, { width, height, who: 'admin' })
  let m = await read(page)
  await shot(page, `p${width}-admin-1-two-lines`, true)
  check(`${W}: two lines — the period, "+", Viewing as / the stage, the dates, under-manned, Legend`, JSON.stringify(m.lines) === JSON.stringify([['war-picker', 'war-new', 'lw-viewing'], ['stage-now', 'bid-window', 'undermanned', 'legend-open']]), JSON.stringify(m.lines))
  check(`${W}: nothing overlaps, nothing leaves the screen, the page does not scroll sideways`, !m.overlap && !m.off.length && m.pageOver <= 1, `${m.overlap}${m.off.join(',')} over ${m.pageOver}`)
  check(`${W}: no label word is left`, m.labs.length === 0, m.labs.join(', '))
  check(`${W}: the words — "+", the dates without a year, "Under 0 days"`, m.b['war-new'].text === '+' && m.b['bid-window'].text === '1 Jan – 31 Mar' && m.b['undermanned'].text === 'Under 0 days', `${m.b['war-new'].text} | ${m.b['bid-window'].text} | ${m.b['undermanned'].text}`)
  check(`${W}: "Viewing as" names the man signed in`, /Viewing as\s*Saber/i.test(m.b['lw-viewing'].text), m.b['lw-viewing'].text)
  check(`${W}: the top area is ${m.height}px tall (two lines), the grid starts at ${m.gridTop}px, ${m.names} names on screen`, m.height <= 84, '')

  /* --- the stage menu: open, a press outside, Escape --- */
  await page.tap(q('stage-now')); await page.waitForTimeout(250)
  let g = await onScreen(page, 'stage-menu')
  await shot(page, `p${width}-admin-2-stage-menu`, true)
  check(`${W}: a tap on the stage opens the menu, whole on the screen and on top of the grid`, g.there && g.inside && g.onTop, JSON.stringify(g))
  check(`${W}: the menu holds "→ BIDDING CLOSED" and "← DRAFT"`, (await page.locator(q('stage-advance')).innerText()).trim() === '→ BIDDING CLOSED' && (await page.locator(q('stage-back')).innerText()).trim() === '← DRAFT')
  await page.touchscreen.tap(width - 30, height - 90); await page.waitForTimeout(250)
  check(`${W}: a tap outside puts the menu away, moves nothing and opens nothing under it`, !(await page.locator(q('stage-menu')).count()) && (await stage(page)) === 'OPEN FOR BIDDING' && !(await page.locator(q('bid-picker')).count()) && !(await page.locator(q('sheet-scrim')).count()))
  await page.tap(q('stage-now')); await page.waitForTimeout(200)
  /* by its place on the glass, as a finger goes — the driver's own tap would wait for the scrim over the button to clear */
  const sb = await page.locator(q('stage-now')).boundingBox()
  await page.touchscreen.tap(sb.x + sb.width / 2, sb.y + sb.height / 2); await page.waitForTimeout(250)
  check(`${W}: a second tap where the stage button is puts the menu away too`, !(await page.locator(q('stage-menu')).count()) && (await stage(page)) === 'OPEN FOR BIDDING')

  /* --- ORDER 1: forward, then back --- */
  await page.tap(q('stage-now')); await page.tap(q('stage-advance')); await page.waitForTimeout(300)
  m = await read(page)
  await shot(page, `p${width}-admin-3-closed`)
  check(`${W}: forward from the menu — BIDDING CLOSED, the menu gone, the dates gone, still two lines`, (await stage(page)) === 'BIDDING CLOSED' && !(await page.locator(q('stage-menu')).count()) && !m.b['bid-window'] && m.lines.length === 2 && !m.overlap && !m.off.length, JSON.stringify(m.lines))
  /* the app's one Undo takes a stage move back, and Redo does it again (D352) — from the top bar, as before */
  await page.tap('#undoBtn'); await page.waitForTimeout(350)
  const afterUndo = await stage(page)
  await page.tap('#redoBtn'); await page.waitForTimeout(350)
  check(`${W}: the top bar's Undo takes the stage move back and Redo does it again (D352)`, afterUndo === 'OPEN FOR BIDDING' && (await stage(page)) === 'BIDDING CLOSED', `after Undo "${afterUndo}", after Redo "${await stage(page)}"`)
  await page.tap(q('stage-now')); await page.waitForTimeout(200)
  await shot(page, `p${width}-admin-4-closed-menu`)
  check(`${W}: at BIDDING CLOSED the menu offers "→ PUBLISHED" and "← OPEN FOR BIDDING"`, (await page.locator(q('stage-advance')).innerText()).trim() === '→ PUBLISHED' && (await page.locator(q('stage-back')).innerText()).trim() === '← OPEN FOR BIDDING')
  await page.tap(q('stage-back')); await page.waitForTimeout(300)
  check(`${W}: back from the menu — OPEN FOR BIDDING again, the dates back`, (await stage(page)) === 'OPEN FOR BIDDING' && (await page.locator(q('bid-window')).innerText()).trim() === '1 Jan – 31 Mar')

  /* --- ORDER 2: back first (to DRAFT), then forward --- */
  await page.tap(q('stage-now')); await page.tap(q('stage-back')); await page.waitForTimeout(300)
  m = await read(page)
  await shot(page, `p${width}-admin-5-draft`)
  check(`${W}: back first — DRAFT, still two lines`, (await stage(page)) === 'DRAFT' && m.lines.length === 2 && !m.overlap && !m.off.length, JSON.stringify(m.lines))
  await page.tap(q('stage-now')); await page.waitForTimeout(200)
  check(`${W}: at DRAFT the menu offers only the way forward`, (await page.locator(q('stage-advance')).innerText()).trim() === '→ OPEN FOR BIDDING' && !(await page.locator(q('stage-back')).count()))
  await page.tap(q('stage-advance')); await page.waitForTimeout(300)
  check(`${W}: then forward — OPEN FOR BIDDING`, (await stage(page)) === 'OPEN FOR BIDDING')

  /* --- to the END of the cycle and back --- */
  await page.tap(q('stage-now')); await page.tap(q('stage-advance')); await page.waitForTimeout(250)
  await page.tap(q('stage-now')); await page.tap(q('stage-advance')); await page.waitForTimeout(300)
  m = await read(page)
  await page.tap(q('stage-now')); await page.waitForTimeout(200)
  await shot(page, `p${width}-admin-6-published-menu`)
  check(`${W}: PUBLISHED — the menu's way forward reads END OF CYCLE and cannot be pressed; the way back can`, (await stage(page)) === 'PUBLISHED' && await page.locator(q('stage-advance')).isDisabled() && (await page.locator(q('stage-back')).innerText()).trim() === '← BIDDING CLOSED' && m.lines.length === 2)
  await page.tap(q('stage-back')); await page.waitForTimeout(250)
  /* A RELOAD keeps the stage he left it at — moved from the menu, saved as from the strip */
  await page.reload(); await page.waitForSelector('#vWeek .day').catch(() => {})
  if (await page.locator('#luser').count()) { await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day') }
  await page.evaluate(() => window.go('leavewar')); await page.waitForSelector(q('row-slipway')); await page.waitForTimeout(400)
  check(`${W}: after a reload the stage is where the menu left it (BIDDING CLOSED)`, (await stage(page)) === 'BIDDING CLOSED', await stage(page))
  await page.tap(q('stage-now')); await page.tap(q('stage-back')); await page.waitForTimeout(300)
  check(`${W}: and back to OPEN FOR BIDDING`, (await stage(page)) === 'OPEN FOR BIDDING')

  /* --- "+" : the New-period sheet --- */
  await page.tap(q('war-new')); await page.waitForTimeout(350)
  g = await onScreen(page, 'war-sheet')
  await shot(page, `p${width}-admin-7-new-period`, true)
  check(`${W}: "+" opens the New-period sheet, on the screen`, g.there && g.onTop, JSON.stringify(g))
  await page.tap(q('war-cancel')); await page.waitForTimeout(250)

  /* --- the bidding dates: the window sheet --- */
  await page.tap(q('bid-window')); await page.waitForTimeout(350)
  g = await onScreen(page, 'window-sheet')
  check(`${W}: a tap on the dates opens "Open bidding on", on the screen`, g.there && g.onTop, JSON.stringify(g))
  await page.tap(q('window-cancel')); await page.waitForTimeout(250)

  /* --- Legend --- */
  await page.tap(q('legend-open')); await page.waitForTimeout(300)
  g = await onScreen(page, 'legend')
  await shot(page, `p${width}-admin-8-legend`, true)
  check(`${W}: Legend opens its key, whole on the screen`, g.there && g.inside && g.onTop, JSON.stringify(g))
  await page.touchscreen.tap(6, height - 20); await page.waitForTimeout(250)
  check(`${W}: a tap outside closes the key`, !(await page.locator(q('legend')).count()))

  /* --- the period picker: the other period, a DRAFT one --- */
  await page.selectOption(q('war-picker'), { label: 'JAN - DEC 27' }); await page.waitForTimeout(600)
  m = await read(page)
  await shot(page, `p${width}-admin-11-other-period`)
  check(`${W}: the picker switches period (JAN - DEC 27, ${m.b['stage-now'].text}) — still two lines, nothing over anything`, m.lines.length === 2 && !m.overlap && !m.off.length, JSON.stringify(m.lines))
  await page.selectOption(q('war-picker'), { label: 'JAN - DEC 26' }); await page.waitForTimeout(500)

  /* --- the top area still scrolls away with the page, as before (it is not pinned) --- */
  await page.evaluate(() => scrollTo(0, 400)); await page.waitForTimeout(300)
  const gone = await page.evaluate(() => document.querySelector('#page-leavewar > .filters').getBoundingClientRect().bottom)
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(200)
  check(`${W}: the two lines scroll away with the page, as the old five did`, gone < 60, `bottom at ${Math.round(gone)}px`)

  /* --- the phone turned on its side: wider than a phone, so the old strip — and back --- */
  await page.setViewportSize({ width: height, height: width }); await page.waitForTimeout(400)
  m = await read(page)
  await shot(page, `p${width}-admin-12-on-its-side`)
  check(`${W}: turned on its side (${height} wide) it is the wider strip — the labels and the two moves in sight`, m.labs.join('|') === 'Period|Stage|Bidding on|Under-manned' && !!m.b['stage-advance'] && !!m.b['stage-back'] && m.b['war-new'].text === '+ New' && m.b['stage-now'].tag === 'SPAN', m.labs.join('|'))
  await page.setViewportSize({ width, height }); await page.waitForTimeout(400)
  m = await read(page)
  check(`${W}: turned back, the two lines again`, m.lines.length === 2 && m.labs.length === 0 && !m.b['stage-advance'] && m.b['stage-now'].tag === 'BUTTON', JSON.stringify(m.lines))

  /* --- LAST, because the counter it makes stays: under-manned with the LONGEST count there is — a counter nobody
         can meet makes every day of the year red. (Made through the page's test hook, not the counter form: this step
         is about the chip's room on the line, not about making a counter.) At 390 the line still holds; at 360 it is
         a pixel too long and Legend drops to a line of its own — the stylesheet's safety net, seen working. --- */
  await page.evaluate(() => window.lwSaveManningRule({ id: 'walk-all', label: 'ALL', count: { kind: 'people', filter: { seats: ['wso'] } }, threshold: { amber: 99, red: 99 } }))
  await page.waitForTimeout(500)
  m = await read(page)
  await shot(page, `p${width}-admin-9-under-365`)
  check(`${W}: "Under 365 days" — the longest count there is: nothing overlaps or leaves the screen (${m.lines.length} lines, ${m.height}px)`, /^Under 36\d days$/.test(m.b['undermanned'].text) && !m.overlap && !m.off.length && m.pageOver <= 1 && m.lines.length === (width >= 380 ? 2 : 3), `${m.b['undermanned'].text} ${JSON.stringify(m.lines)}`)
  await page.tap(q('undermanned')); await page.waitForTimeout(300)
  g = await onScreen(page, 'undermanned-list')
  await shot(page, `p${width}-admin-10-under-list`, true)
  check(`${W}: a tap on it opens the list of those days, whole on the screen`, g.there && g.inside && g.onTop, JSON.stringify(g))
  await page.tap(q('undermanned-day-2026-02-10')).catch(() => {}); await page.waitForTimeout(600)
  check(`${W}: choosing a day closes the list (and the grid goes to it)`, !(await page.locator(q('undermanned-list')).count()))

  check(`${W}: no errors in the browser's own list`, errors.length === 0, errors.slice(0, 3).join(' | ').slice(0, 300))
  await ctx.close()
}

/* ======================= THE PHONE, A MEMBER (Ranger) ======================= */
for (const [width, height] of [[390, 844], [360, 740]]) {
  const W = `phone ${width}, member`
  const { ctx, page, errors } = await open(browser, { width, height, who: 'member' })
  const m = await read(page)
  await shot(page, `p${width}-member-1-two-lines`, true)
  check(`${W}: two lines, no "+" — the period, Viewing as / the stage, the dates, under-manned, Legend`, JSON.stringify(m.lines) === JSON.stringify([['war-picker', 'lw-viewing'], ['stage-now', 'bid-window', 'undermanned', 'legend-open']]) && !m.overlap && !m.off.length, JSON.stringify(m.lines))
  check(`${W}: "Viewing as" names him`, /Viewing as\s*Ranger/i.test(m.b['lw-viewing'].text), m.b['lw-viewing'].text)
  check(`${W}: his stage is a label`, m.b['stage-now'].tag === 'SPAN' && m.b['stage-now'].text === 'OPEN FOR BIDDING')
  await page.tap(q('stage-now')); await page.waitForTimeout(250)
  check(`${W}: a tap on it opens nothing, and no stage move is anywhere on the page`, !(await page.locator(q('stage-menu')).count()) && !(await page.locator(q('stage-advance')).count()) && !(await page.locator(q('stage-back')).count()))
  check(`${W}: the bidding dates are a fact for him, not a control`, await page.locator(q('bid-window')).isDisabled())
  await page.tap(q('legend-open')); await page.waitForTimeout(300)
  const g = await onScreen(page, 'legend')
  check(`${W}: Legend opens for him too`, g.there && g.inside && g.onTop, JSON.stringify(g))
  check(`${W}: no errors in the browser's own list`, errors.length === 0, errors.slice(0, 3).join(' | ').slice(0, 300))
  await ctx.close()
}

/* ======================= THE WIDER SIZES — AS THEY WERE (D679) ======================= */
for (const [width, height, name] of [[1440, 900, 'desktop'], [768, 1024, 'tablet']]) {
  const W = `${name} ${width}, admin`
  const { ctx, page, errors } = await open(browser, { width, height, who: 'admin', touch: false })
  const m = await read(page)
  await shot(page, `${name}-admin-1-as-it-was`)
  check(`${W}: the four label words, "+ New", the stage a label with its two moves in sight, the dates with their year`, m.labs.join('|') === 'Period|Stage|Bidding on|Under-manned' && m.b['war-new'].text === '+ New' && m.b['stage-now'].tag === 'SPAN' && m.b['stage-advance'].text === '→ BIDDING CLOSED' && m.b['stage-back'].text === '← DRAFT' && m.b['bid-window'].text === '1 Jan 26 – 31 Mar 26' && m.b['undermanned'].text === '0 days', `${m.labs.join('|')} · ${m.b['bid-window'].text}`)
  await page.click(q('stage-now')); await page.waitForTimeout(200)
  check(`${W}: a click on the stage opens nothing`, !(await page.locator(q('stage-menu')).count()))
  await page.click(q('stage-advance')); await page.waitForTimeout(250)
  const closed = await stage(page)
  await page.click(q('stage-back')); await page.waitForTimeout(250)
  check(`${W}: the two moves work from the strip, one click each`, closed === 'BIDDING CLOSED' && (await stage(page)) === 'OPEN FOR BIDDING')
  check(`${W}: no errors in the browser's own list`, errors.length === 0, errors.slice(0, 3).join(' | ').slice(0, 300))
  await ctx.close()
}

await browser.close()
console.log(`\n${pass} passed, ${fail} failed, ${shots} pictures in ${OUT}`)
if (fail) { console.log('FAILED: ' + fails.join(' · ')); process.exitCode = 1 }
