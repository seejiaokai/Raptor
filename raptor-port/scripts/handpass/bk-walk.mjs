// THE BOARD-KEYS NIGHT'S WALK (7–8 Nov 26 — [BOARD-KEYS-LEFT]'s last two menus, D1646; [WEEK-GLIDE-TWO-PAGES]).
// Written as assertions of the RIGHT behaviour (a PASS means correct), so re-running it is the re-walk; run on `main`'s
// build first, the ⋯ and day-bar parts and the glide over two pages FAIL there — the calibration that the walk can see the fault.
// Every step presses the app's own controls with real keys, a real mouse or a real finger (Chromium's touch pipeline, CDP);
// the probe bridge (window.CURPAGE / CURWEEK / SBDAY / DAYS / go) is only READ, and `go` switches the page as the nav does.
//   from raptor-port:  WALK_DIR=<frozen dist> BK_OUT=<pictures folder> [ONLY=b1,b2,b5,b3,b4,g1,g2,g3] [BROWSER=webkit] node scripts/handpass/bk-walk.mjs
// BROWSER=webkit walks the menus and the phone's taps in Safari's engine (lessons 10 and 19); the glide's finger needs
// Chromium's own touch pipeline, so the G parts are Chromium's alone.
// The build is served from WALK_DIR inside the test browser (isr-serve.mjs) — no server holds a port. Each run empties its folder.
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serveFrozen } from './isr-serve.mjs'

const VERSION = 'bk-walk v8'
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.env.BK_OUT || join(HERE, '../../docs/img/handpass/2026-11-08-board-keys/walk')
const URL = 'http://localhost:4394/'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const run = id => !ONLY.length || ONLY.includes(id)
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const WEBKIT = process.env.BROWSER === 'webkit'
const browser = WEBKIT ? await webkit.launch() : await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const results = [], errs = []
const say = l => { results.push(l); console.log(l) }
const check = (id, name, ok, got) => say(`${ok ? 'PASS' : 'FAIL'} ${id} ${name} — saw ${JSON.stringify(got)}`)
const notWalked = (id, why) => say(`NOT WALKED ${id} — ${why}`)
const note = (id, what) => say(`NOTE ${id} — ${what}`)
console.log(`[${VERSION}] → ${OUT}  build ${process.env.WALK_DIR}  only ${ONLY.join(',') || 'all'}  browser ${WEBKIT ? 'webkit' : 'chromium'}`)
if (!process.env.WALK_DIR) throw new Error('WALK_DIR (the frozen build) is required')

const SIZES = {
  narrow: { viewport: { width: 800, height: 760 } },            // a desktop window narrow enough for the board's ⋯ (≤ 820)
  desktop: { viewport: { width: 1536, height: 864 } },          // his PC
  phone: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true },   // his iPhone
}
async function session(size, user = 'ad') {
  const ctx = await browser.newContext({ ...SIZES[size], deviceScaleFactor: 2 })
  await serveFrozen(ctx, URL)
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`[${size}] page error ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${size}] console ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`[${size}] HTTP ${r.status()} ${r.url()}`) })
  await page.goto(URL)
  await page.fill('#luser', user); await page.fill('#lpass', user === 'ad' ? 'a' : user)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
  return { ctx, page, phone: size === 'phone', size }
}
let n = 0
const shot = async (w, name) => { const f = `${String(++n).padStart(3, '0')}-${WEBKIT ? 'webkit-' : ''}${w.size}-${name}.png`; await w.page.screenshot({ path: join(OUT, f) }); return f }
const go = async (w, p) => { await w.page.evaluate(p => window.go(p), p); await w.page.waitForFunction(p => window.CURPAGE === p, p); await w.page.waitForTimeout(400) }
const up = (w, sel) => w.page.evaluate(sel => { const e = document.querySelector(sel); return !!e && !e.hidden && e.getBoundingClientRect().width > 0 }, sel)
const ACCENT = 'rgb(59, 198, 232)'
/* where the keys are, and how it is drawn */
const focusAt = w => w.page.evaluate(() => {
  const a = document.activeElement
  if (!a || a === document.body) return null
  const cs = getComputedStyle(a)
  return { tag: a.tagName, id: a.id, text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24), data: { ...a.dataset },
    ring: a.matches(':focus-visible'), outline: cs.outlineColor + ' ' + cs.outlineStyle, bg: cs.backgroundColor,
    inMore: !!a.closest('.sb-moremenu'), inMenu: !!a.closest('.wavemenu'), inBoard: !!a.closest('#schedBoard') }
})
const key = async (w, k, ms = 200) => { await w.page.keyboard.press(k); await w.page.waitForTimeout(ms) }
const moreOpen = w => up(w, '#sbMoreMenu')
const boardUp = w => up(w, '#schedBoard')
const wide = w => w.page.evaluate(() => document.getElementById('schedBoard')?.classList.contains('sb-wide'))
/* a press as the person makes it: a finger on the phone (a picture right after the lift, D1281), the mouse on a desktop */
async function press(w, sel, name) {
  const l = w.page.locator(sel).filter({ visible: true }).first()
  if (!(await l.count())) return false
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (w.phone) { await l.tap(); if (name) await shot(w, name + '-q') }
  else await l.click()
  await w.page.waitForTimeout(w.phone ? 550 : 250)
  return true
}
async function openBoard(w, day = 2) {
  await go(w, 'editsched')
  await press(w, `#eWeek .day[data-day="${day}"] .dt.sb-open`)
  await w.page.waitForFunction(() => { const b = document.getElementById('schedBoard'); return b && !b.hidden }, undefined, { timeout: 3000 }).catch(() => {})
  await w.page.waitForTimeout(300)
}

/* ---------- B1 the board's ⋯ menu by the keys (D1646), a desktop window ≤ 820 wide ---------- */
async function b1(w) {
  const P = w.page
  await openBoard(w)
  if (!(await up(w, '#sbMore'))) { notWalked('B1', 'the ⋯ is not drawn at this width'); return }
  await P.mouse.move(790, 750)                              // the mouse off the menu, so no row is lit by hovering
  await P.locator('#sbMore').focus(); await key(w, 'Enter', 300)
  let f = await focusAt(w)
  await shot(w, 'b1-more-enter')
  check('B1.1', 'Enter on ⋯ opens its menu, the keys on its first item (Insights), drawn as under the keys', (await moreOpen(w)) && f?.id === 'sbMoreInsights' && f.ring, f)
  /* how that item is drawn under the keys is a question put to him, not a pass or fail (the evidence sheet's Q1, D1625):
     the board's other menus draw the cyan ring (D1646, D1652); the ⋯ menu's own rule draws a raised row, and the browser
     adds its own ring */
  note('B1.1', `the ⋯ item under the keys is drawn with outline ${f?.outline} and background ${f?.bg} — the other board menus: a ${ACCENT} solid ring`)
  /* Q1's pictures: the menu as built, then the same menu with the board's other menus' ring drawn on it (a style laid on
     the running page for the picture only, taken off at once — nothing built) */
  const clip = await P.evaluate(() => { const r = document.getElementById('sbMoreMenu').getBoundingClientRect(), b = document.getElementById('sbMore').getBoundingClientRect()
    const x = Math.max(0, Math.min(r.left, b.left) - 24), y = Math.max(0, b.top - 16); return { x, y, width: Math.max(r.right, b.right) + 24 - x, height: r.bottom + 24 - y } })
  if (await moreOpen(w)) {
    await P.screenshot({ path: join(OUT, `${String(++n).padStart(3, '0')}-narrow-q1-as-built.png`), clip })
    await P.addStyleTag({ content: '.sb-moreitem:focus-visible{outline:2px solid var(--accent);outline-offset:-2px;border-radius:8px}' }).then(h => h.evaluate(e => e.setAttribute('data-bk-mock', '')))
    await P.screenshot({ path: join(OUT, `${String(++n).padStart(3, '0')}-narrow-q1-proposed.png`), clip })
    await P.evaluate(() => document.querySelectorAll('[data-bk-mock]').forEach(e => e.remove()))
  }
  const items = await P.evaluate(() => [...document.querySelectorAll('#sbMoreMenu button')].filter(b => !b.disabled).map(b => b.id))
  const seen = [f?.id]
  for (let i = 0; i < items.length; i++) { await key(w, 'ArrowDown', 120); seen.push((await focusAt(w))?.id) }
  check('B1.2', `↓ walks the menu and comes round to its first item (${items.join(', ')})`, JSON.stringify(seen) === JSON.stringify([...items, items[0]]), seen)
  await key(w, 'ArrowUp', 120)
  f = await focusAt(w)
  await shot(w, 'b1-more-arrowup')
  check('B1.3', '↑ from the first item comes round to the last', f?.id === items[items.length - 1] && f.inMore, f)
  await key(w, 'Escape', 250)
  f = await focusAt(w)
  await shot(w, 'b1-more-escape')
  check('B1.4', 'Escape closes the menu, the keys back on ⋯ (ringed), the board still open', !(await moreOpen(w)) && f?.id === 'sbMore' && f.ring && (await boardUp(w)), { f, board: await boardUp(w) })
  await key(w, 'ArrowDown', 300)
  f = await focusAt(w)
  check('B1.5', '↓ on the closed ⋯ opens it on its first item', (await moreOpen(w)) && f?.id === 'sbMoreInsights', f)
  await key(w, 'Escape', 250)
  /* the mouse: a click opens it, the keys not moved into it, no item ringed; then ↓ goes in */
  await P.locator('#sbMore').click(); await P.waitForTimeout(300)
  f = await focusAt(w)
  const ringed = await P.evaluate(() => [...document.querySelectorAll('#sbMoreMenu button')].some(b => b.matches(':focus-visible')))
  await shot(w, 'b1-more-mouse')
  check('B1.6', 'opened by the mouse: the menu open, the keys not in it, no item ringed', (await moreOpen(w)) && !f?.inMore && !ringed, { f, ringed })
  /* the keys reach ⋯ as a keyboard user's do (Safari never puts the keys on a clicked button; Chromium does) — as the
     5 Nov walk's S5.5 did for the other menus */
  await P.locator('#sbMore').focus(); await key(w, 'ArrowDown', 200)
  f = await focusAt(w)
  check('B1.7', 'then ↓ on ⋯: the keys go into the open menu, on its first item', f?.id === 'sbMoreInsights' && (await moreOpen(w)), f)
  await key(w, 'Escape', 250)
  /* a pick by the keys: the layout switch, twice; the keys back on ⋯ each time */
  const w0 = await wide(w)
  for (const k of [1, 2]) {
    await P.locator('#sbMore').focus(); await key(w, 'Enter', 250)
    for (let i = 0; i < 6 && (await focusAt(w))?.id !== 'sbMoreWide'; i++) await key(w, 'ArrowDown', 100)
    await key(w, 'Enter', 450)
    f = await focusAt(w)
    if (k === 1) await shot(w, 'b1-wide-by-keys')
    check(`B1.8.${k}`, `the layout switch picked by Enter (${k === 1 ? 'to the desktop layout' : 'back'}): the layout changes, the menu closes, the keys on ⋯`,
      (await wide(w)) === (k === 1 ? !w0 : w0) && !(await moreOpen(w)) && f?.id === 'sbMore', { wide: await wide(w), f })
  }
  /* Insights by the keys: its window opens; Escape closes it, the keys back on ⋯, the board stays */
  await P.locator('#sbMore').focus(); await key(w, 'Enter', 250); await key(w, 'Enter', 500)
  const ins = await P.evaluate(() => { const m = document.getElementById('insightModal'); return !!m && !m.hidden })
  await shot(w, 'b1-insights-by-keys')
  check('B1.9', 'Insights picked by Enter: its window opens', ins, ins)
  await key(w, 'Escape', 400)
  f = await focusAt(w)
  await shot(w, 'b1-insights-escape')
  check('B1.10', 'Escape closes Insights, the keys back on ⋯, the board still open', !(await P.evaluate(() => { const m = document.getElementById('insightModal'); return !!m && !m.hidden })) && f?.id === 'sbMore' && (await boardUp(w)), { f, board: await boardUp(w) })
  /* Sort all by the keys: its question opens; Escape closes it, the keys back on ⋯ */
  if (items.includes('sbMoreSort')) {
    await P.locator('#sbMore').focus(); await key(w, 'Enter', 250)
    for (let i = 0; i < 6 && (await focusAt(w))?.id !== 'sbMoreSort'; i++) await key(w, 'ArrowDown', 100)
    await key(w, 'Enter', 450)
    const sa = await up(w, '#sortAllPop')
    await shot(w, 'b1-sortall-by-keys')
    check('B1.11', 'Sort all picked by Enter: its question opens', sa, sa)
    await key(w, 'Escape', 400)
    f = await focusAt(w)
    check('B1.12', 'Escape closes Sort all\'s question, nothing sorted, the keys back on ⋯, the board open', !(await up(w, '#sortAllPop')) && f?.id === 'sbMore' && (await boardUp(w)), { f, board: await boardUp(w) })
  } else notWalked('B1.11–12', 'no Sort all in the ⋯ menu here')
  /* Tab past the last item leaves the menu: it closes, the keys stay on the board */
  await P.locator('#sbMore').focus(); await key(w, 'Enter', 250)
  await P.evaluate(() => { const b = [...document.querySelectorAll('#sbMoreMenu button')].filter(x => !x.disabled); b[b.length - 1].focus() })
  await key(w, 'Tab', 250)
  f = await focusAt(w)
  await shot(w, 'b1-tab-out')
  check('B1.13', 'Tab past the last item: the menu closes, the keys on the board', !(await moreOpen(w)) && !!f?.inBoard && !f.inMore, f)
  /* a click away closes it too (D-rule: a click-open popup closes on a click outside it) */
  await P.locator('#sbMore').click(); await P.waitForTimeout(250)
  await P.mouse.click(400, 600); await P.waitForTimeout(300)
  check('B1.14', 'a click outside closes the menu opened by the mouse', !(await moreOpen(w)), await moreOpen(w))
}

/* ---------- B2 the day bar's Templates on a narrow window (≤ 820): ↓ opens it, as every other board menu ---------- */
async function b2(w) {
  const P = w.page
  if (!(await boardUp(w))) await openBoard(w)
  const sel = '#sbBoard [data-daytpladd]'
  const b = P.locator(sel).filter({ visible: true }).first()
  if (!(await b.count())) { notWalked('B2', 'the day bar\'s Templates is not drawn at this width'); return }
  await b.focus(); await key(w, 'ArrowDown', 300)
  let f = await focusAt(w)
  await shot(w, 'b2-daytpl-arrowdown')
  /* Q1's comparison: how another board menu draws the item under the keys */
  const clip = await P.evaluate(() => { const m = document.querySelector('.wavemenu').getBoundingClientRect(); return { x: Math.max(0, m.left - 24), y: Math.max(0, m.top - 70), width: m.width + 48, height: Math.min(m.height, 300) + 94 } })
  await P.screenshot({ path: join(OUT, `${String(++n).padStart(3, '0')}-narrow-q1-templates-menu.png`), clip })
  check('B2.1', '↓ on the day bar\'s Templates opens its menu, the keys on its first item', (await up(w, '.wavemenu')) && !!f?.inMenu && f.ring, f)
  await key(w, 'Escape', 250)
  f = await focusAt(w)
  check('B2.2', 'Escape closes it, the keys back on Templates', !(await up(w, '.wavemenu')) && f?.data?.daytpladd != null, f)
  await key(w, 'Enter', 300)
  f = await focusAt(w)
  check('B2.3', 'Enter opens it the same way (as built before tonight)', (await up(w, '.wavemenu')) && !!f?.inMenu, f)
  await key(w, 'Escape', 250)
}

/* ---------- B5 the two blind reads' fixes (8 Nov 26), on the same narrow window: one board menu at a time by the keys
   (Astra's finding 1; Astra's finding 2 and Opus's finding 2), a held Enter picks nothing (Opus's question 2), a window
   widened past 820 with the ⋯ menu up (Opus's question 3) ---------- */
async function b5(w) {
  const P = w.page
  if (!(await boardUp(w))) await openBoard(w)
  const menus = () => P.evaluate(() => [...document.querySelectorAll('.wavemenu')].filter(m => m.getBoundingClientRect().width > 0).length)
  const blocks = () => P.evaluate(() => (window.DAYS[window.SBDAY].dutywaves || []).length)
  const heldEnter = async () => { await P.keyboard.down('Enter'); await P.waitForTimeout(120); await P.keyboard.down('Enter'); await P.waitForTimeout(60); await P.keyboard.down('Enter'); await P.keyboard.up('Enter'); await P.waitForTimeout(300) }
  /* + Block's menu up by the mouse; the keys reach ⋯ as a keyboard user's do; ↓ */
  await press(w, '#sbBoard [data-dwadd]'); await P.waitForTimeout(150)
  const blockUp = await menus()
  await P.locator('#sbMore').focus(); await key(w, 'ArrowDown', 300)
  let f = await focusAt(w)
  await shot(w, 'b5-more-over-block')
  check('B5.1', 'with + Block\'s menu up, ↓ on ⋯: + Block\'s menu goes and ⋯\'s opens on its first item — one menu', blockUp === 1 && (await menus()) === 0 && (await moreOpen(w)) && f?.id === 'sbMoreInsights', { blockUp, menus: await menus(), f })
  await key(w, 'Escape', 300)
  f = await focusAt(w)
  check('B5.2', 'one Escape closes ⋯\'s menu, the keys back on ⋯, the board still open', !(await moreOpen(w)) && f?.id === 'sbMore' && (await boardUp(w)), { f, board: await boardUp(w) })
  /* + Block's menu up by the mouse; the keys reach the day bar's Templates; ↓ */
  const tpl = P.locator('#sbBoard [data-daytpladd]').filter({ visible: true }).first()
  if (await tpl.count()) {
    await press(w, '#sbBoard [data-dwadd]'); await P.waitForTimeout(150)
    await tpl.focus(); await key(w, 'ArrowDown', 300)
    f = await focusAt(w)
    const its = await P.evaluate(() => !!document.querySelector('.wavemenu [data-daytplsave]'))
    await shot(w, 'b5-templates-over-block')
    check('B5.3', 'with + Block\'s menu up, ↓ on Templates: Templates\' own menu opens, the keys in it — one menu', (await menus()) === 1 && its && !!f?.inMenu, { menus: await menus(), its, f })
    await key(w, 'Escape', 250)
    f = await focusAt(w)
    check('B5.4', 'Escape closes it, the keys back on Templates', (await menus()) === 0 && f?.data?.daytpladd != null, f)
  } else notWalked('B5.3–4', 'the day bar\'s Templates is not drawn at this width')
  /* a held Enter: the key down, two repeats, then up */
  const b0 = await blocks()
  await P.locator('#sbBoard [data-dwadd]').filter({ visible: true }).first().focus()
  await heldEnter()
  f = await focusAt(w)
  await shot(w, 'b5-block-held-enter')
  check('B5.5', 'a held Enter on + Block: its menu opens on its first pick, nothing added', (await menus()) === 1 && !!f?.inMenu && (await blocks()) === b0, { menus: await menus(), f, b0, b1: await blocks() })
  await key(w, 'Escape', 250)
  await P.locator('#sbMore').focus()
  await heldEnter()
  f = await focusAt(w)
  const ins = await P.evaluate(() => { const m = document.getElementById('insightModal'); return !!m && !m.hidden })
  await shot(w, 'b5-more-held-enter')
  check('B5.6', 'a held Enter on ⋯: its menu opens on Insights, and Insights is not opened', (await moreOpen(w)) && f?.id === 'sbMoreInsights' && !ins, { f, ins })
  /* the window widened past 820 with the menu up: the menu goes with its ⋯, and the next Escape is the board's */
  await P.setViewportSize({ width: 1100, height: 760 }); await P.waitForTimeout(400)
  const still = await P.evaluate(() => !!document.getElementById('sbMoreMenu'))
  await shot(w, 'b5-widened')
  check('B5.7', 'widened past 820 with ⋯\'s menu up: the menu is gone with its ⋯', !still, still)
  await key(w, 'Escape', 500)
  check('B5.8', 'the next Escape closes the board, as ✓ Done does', !(await boardUp(w)), await boardUp(w))
  await P.setViewportSize(SIZES.narrow.viewport); await P.waitForTimeout(300)
}

/* ---------- B3 a plain user's round at his PC, by the keys (D1557): open a day's board, add a block, look in the menus,
   leave by ✓ Done, see the block on the week, undo it ---------- */
async function b3(w) {
  const P = w.page
  await go(w, 'editsched')
  const blocks0 = await P.evaluate(() => (window.DAYS[2].dutywaves || []).length)
  await P.locator('#eWeek .day[data-day="2"] .dt.sb-open').focus(); await key(w, 'Enter', 600)
  let f = await focusAt(w)
  await shot(w, 'b3-board-by-enter')
  check('B3.1', 'Enter on Wednesday\'s date opens its board, the keys on the board', (await boardUp(w)) && (await P.evaluate(() => window.SBDAY)) === 2 && !!f?.inBoard, { f, day: await P.evaluate(() => window.SBDAY) })
  const blk = P.locator('#sbBoard [data-dwadd]').filter({ visible: true }).first()
  await blk.focus(); await key(w, 'Enter', 250)
  for (let i = 0; i < 12; i++) { const t = await P.evaluate(() => document.activeElement?.textContent || ''); if (/Empty block/.test(t)) break; await key(w, 'ArrowDown', 80) }
  await key(w, 'Enter', 500)
  const blocks1 = await P.evaluate(() => (window.DAYS[2].dutywaves || []).length)
  f = await focusAt(w)
  await shot(w, 'b3-block-added')
  check('B3.2', '+ Block → Empty block by the keys: a block added on the board, the keys back on + Block', blocks1 === blocks0 + 1 && f?.data?.dwadd != null, { blocks0, blocks1, f })
  /* Q2's picture: how a button that opens a board menu is drawn under the keys (as on main — not changed tonight) */
  const clip = await P.evaluate(() => { const r = document.activeElement.getBoundingClientRect(); return { x: Math.max(0, r.left - 60), y: Math.max(0, r.top - 30), width: r.width + 120, height: r.height + 60 } })
  /* WebKit refused this clip on 8 Nov 26 ("clipped area … outside the resulting image") though the button stood ringed in
     view — the picture is Chromium's (the question is how the app draws it, not the engine), so a refusal is noted, not fatal */
  await P.screenshot({ path: join(OUT, `${String(++n).padStart(3, '0')}-desktop-q2-block-button-under-keys.png`), clip })
    .catch(e => note('B3.Q2', `the button's picture was not taken here: ${String(e.message).split('\n')[0]} — clip ${JSON.stringify(clip)}`))
  /* Templates and the plans selector looked into and left by Escape: nothing changes */
  for (const [nm, s] of [['Templates', '#sbTpl'], ['the plans selector', '#schedBoard [data-planmenu]']]) {
    const b = P.locator(s).filter({ visible: true }).first()
    if (!(await b.count())) { notWalked(`B3.${nm}`, 'not drawn'); continue }
    await b.focus(); await key(w, 'Enter', 250)
    const opened = await up(w, '.wavemenu')
    await key(w, 'Escape', 250)
    check(`B3.${nm}`, `${nm} opened by Enter and left by Escape: the block still there, the board open`, opened && !(await up(w, '.wavemenu')) && (await P.evaluate(() => (window.DAYS[2].dutywaves || []).length)) === blocks1 && (await boardUp(w)), opened)
  }
  /* leave by ✓ Done, pressed by the keys: the week shows the new block on Wednesday */
  await P.locator('#sbDone').focus(); await key(w, 'Enter', 600)
  f = await focusAt(w)
  const onWeek = await P.evaluate(() => document.querySelectorAll('#eWeek .day[data-day="2"] [data-dwi]').length)
  await shot(w, 'b3-done-week')
  check('B3.3', '✓ Done by Enter: the board closes, the week is back', !(await boardUp(w)) && (await P.evaluate(() => window.CURPAGE)) === 'editsched', { board: await boardUp(w) })
  note('B3.3', `after ✓ Done the keys are on ${JSON.stringify(f)}; Wednesday's week card carries ${onWeek} block parts`)
  check('B3.4', 'the block added on the board is on the week\'s Wednesday', (await P.evaluate(() => (window.DAYS[2].dutywaves || []).length)) === blocks1, blocks1)
  await P.locator('#undoBtn').focus(); await key(w, 'Enter', 500)
  await shot(w, 'b3-undo')
  check('B3.5', 'Undo by Enter takes the block back off', (await P.evaluate(() => (window.DAYS[2].dutywaves || []).length)) === blocks0, await P.evaluate(() => (window.DAYS[2].dutywaves || []).length))
}

/* ---------- B4 the same ⋯ on a phone, by the finger: unchanged — Insights, the layout switch and back, ✓ Done ---------- */
async function b4(w) {
  const P = w.page
  await openBoard(w)
  await press(w, '#sbMore', 'b4-more-tap')
  const op = await moreOpen(w)
  const f = await focusAt(w)
  await shot(w, 'b4-more-open')
  check('B4.1', 'a tap on ⋯ opens its menu; no item takes the keys or a ring', op && !f?.inMore, { op, f })
  await press(w, '#sbMoreInsights', 'b4-insights-tap')
  const ins = await P.evaluate(() => { const m = document.getElementById('insightModal'); return !!m && !m.hidden })
  await shot(w, 'b4-insights')
  check('B4.2', 'a tap on Insights opens its window, the menu gone', ins && !(await moreOpen(w)), ins)
  const x = P.locator('#insightModal .x, #insightModal [aria-label="Close"]').filter({ visible: true }).first()
  if (await x.count()) { await x.tap(); await P.waitForTimeout(500) } else await key(w, 'Escape', 400)
  check('B4.3', 'Insights closed: the board still open', !(await P.evaluate(() => { const m = document.getElementById('insightModal'); return !!m && !m.hidden })) && (await boardUp(w)), await boardUp(w))
  const w0 = await wide(w)
  await press(w, '#sbMore'); await press(w, '#sbMoreWide', 'b4-wide-tap')
  await shot(w, 'b4-wide')
  check('B4.4', 'a tap on the layout switch changes the layout, the menu gone', (await wide(w)) === !w0 && !(await moreOpen(w)), await wide(w))
  await press(w, '#sbMore'); await press(w, '#sbMoreWide')
  check('B4.5', 'and back', (await wide(w)) === w0, await wide(w))
  await press(w, '#sbDone', 'b4-done')
  check('B4.6', '✓ Done closes the board', !(await boardUp(w)), await boardUp(w))
}

/* ---------- G: the phone's week glide over two pages ([WEEK-GLIDE-TWO-PAGES]) ---------- */
const WK = { editsched: '#eWeek', viewsched: '#vWeek' }
const sl = (w, s) => w.page.evaluate(s => Math.round(document.querySelector(s).scrollLeft), s)
const settle = (w, s) => w.page.evaluate(async s => {
  const el = document.querySelector(s); let last = NaN, same = 0
  for (let i = 0; i < 180 && same < 8; i++) { await new Promise(r => requestAnimationFrame(r)); const now = Math.round(el.scrollLeft); same = now === last ? same + 1 : 0; last = now }
  return last
}, s)
async function park(w, s, day) {
  await w.page.evaluate(([s, d]) => {
    const el = document.querySelector(s), ds = el.querySelectorAll('.day:not(.peek)')
    el.style.scrollBehavior = 'auto'
    el.scrollLeft = d >= ds.length - 1 ? el.scrollWidth : ds[d].offsetLeft - ds[0].offsetLeft
    el.style.scrollBehavior = ''
  }, [s, day])
  await settle(w, s); await w.page.waitForTimeout(250)
}
async function finger(w, pts, stepMs = 16, rest = 60) {
  const [x0, y0] = pts[0]
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0, id: 1 }] })
  for (const [x, y] of pts.slice(1)) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, id: 1 }] }); await w.page.waitForTimeout(stepMs) }
  if (rest) await w.page.waitForTimeout(rest)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
const line = (x0, dx, k = 10, y = 430) => Array.from({ length: k + 1 }, (_, i) => [x0 + dx * i / k, y])
/* a height inside the week's day card — a short ground day leaves empty page under it, where a finger moves nothing */
const yIn = (w, s) => w.page.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return Math.round(r.top + Math.min(150, r.height / 2)) }, s)
const clonesUp = w => w.page.evaluate(() => [...document.body.children].filter(c => c.style.position === 'fixed' && c.classList.contains('week')).length)
/* every frame: is each week covered (its touches off), and how many glide copies stand; when each week was first covered
   and first uncovered, in ms from the trace's start */
const trace = w => w.page.evaluate(() => {
  const g = window, t0 = performance.now(); g.__bk = { both: 0, frames: 0, maxClones: 0, stop: false, eOn: null, eOff: null, vOn: null, vOff: null }
  const tick = () => {
    const e = document.getElementById('eWeek'), v = document.getElementById('vWeek'), t = Math.round(performance.now() - t0), b = g.__bk
    const c = [...document.body.children].filter(x => x.style.position === 'fixed' && x.classList.contains('week')).length
    b.frames++; b.maxClones = Math.max(b.maxClones, c)
    const eC = e?.style.pointerEvents === 'none', vC = v?.style.pointerEvents === 'none'
    if (eC && b.eOn == null) b.eOn = t; if (!eC && b.eOn != null && b.eOff == null) b.eOff = t
    if (vC && b.vOn == null) b.vOn = t; if (!vC && b.vOn != null && b.vOff == null) b.vOff = t
    if (eC && vC) b.both++
    if (!g.__bk.stop && g.__bk.frames < 600) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})
const traceEnd = w => w.page.evaluate(() => { window.__bk.stop = true; return window.__bk })
const styles = w => w.page.evaluate(() => {
  const s = id => { const e = document.getElementById(id); return { pe: e.style.pointerEvents, ox: e.style.overflowX, cpe: getComputedStyle(e).pointerEvents } }
  return { e: s('eWeek'), v: s('vWeek'), body: document.body.style.overflowX }
})
const loose = st => st.e.pe !== 'none' && st.e.ox !== 'hidden' && st.v.pe !== 'none' && st.v.ox !== 'hidden' && st.body !== 'hidden'
/* a real swipe inside the week moves it a day: the week takes touches and scrolls */
async function swipeMoves(w, pg, id) {
  const s = WK[pg]
  await go(w, pg); await w.page.waitForTimeout(300)
  const from = await settle(w, s)
  const wk = await w.page.evaluate(() => window.CURWEEK)
  const dx = from < 50 ? -220 : 220                       // on Monday swipe toward Tuesday, else back a day
  await finger(w, line(dx < 0 ? 320 : 80, dx, 10, await yIn(w, s)))
  await w.page.waitForTimeout(700)
  const to = await settle(w, s)
  await shot(w, `${id}-swipe-${pg}`)
  check(`${id}.swipe.${pg}`, `afterwards a finger swipe on ${pg === 'editsched' ? 'Edit Schedule' : 'View-only Sched'}'s week moves it a day, in the same week`,
    Math.abs(to - from) > 100 && (await w.page.evaluate(() => window.CURWEEK)) === wk, { from, to })
}
/* a cross on page A, and a cross on page B started while A's slide is still going */
async function twoPages(w, id, a, b) {
  const P = w.page
  for (let attempt = 1; attempt <= 3; attempt++) {
    await go(w, a); await park(w, WK[a], 6)
    const wk0 = await P.evaluate(() => window.CURWEEK)
    const ya = await yIn(w, WK[a])
    await trace(w)
    await finger(w, line(320, -220, 10, ya))
    const started = await P.waitForFunction(() => [...document.body.children].some(c => c.style.position === 'fixed' && c.classList.contains('week')), undefined, { timeout: 1500, polling: 'raf' }).then(() => true).catch(() => false)
    if (!started) { await traceEnd(w); note(id, `attempt ${attempt}: the first swipe did not cross on ${a}`); await P.waitForTimeout(800); continue }
    /* the nav pressed and the other week measured in one go, so its flick starts inside the first slide (about 0.4 s) */
    const r = await P.evaluate(async ([p, s]) => {
      window.go(p)
      const el = document.querySelector(s)
      for (let i = 0; i < 30 && !el.getBoundingClientRect().width; i++) await new Promise(f => requestAnimationFrame(f))
      const rc = el.getBoundingClientRect()
      return { y: Math.round(rc.top + Math.min(150, rc.height / 2)), at: Math.round(el.scrollLeft), wide: Math.round(rc.width), wk: window.CURWEEK }
    }, [b, WK[b]])
    const at = r.at, wk1 = r.wk
    await finger(w, at < 50 ? line(80, 200, 5, r.y) : line(320, -200, 5, r.y), 8, 0)  // a quick flick at the week's edge
    const firstStill = await clonesUp(w)
    await P.waitForTimeout(150)
    await shot(w, `${id}-mid-burst`)
    await P.waitForTimeout(1600)
    const tr = await traceEnd(w)
    const wk2 = await P.evaluate(() => window.CURWEEK)
    note(id, `attempt ${attempt}: ${a} crossed ${wk0}→${wk1}; ${b} shown ${r.wide}px wide at its scroll ${at}, flicked, now on ${wk2}; covered (ms) Edit ${tr.eOn}→${tr.eOff}, View ${tr.vOn}→${tr.vOff}; frames with BOTH weeks covered: ${tr.both}, most copies at once: ${tr.maxClones}, copies up after the flick: ${firstStill}`)
    if (wk2 === wk1 || tr.both === 0) { note(id, `attempt ${attempt}: the second cross did not land inside the first slide — tried again`); continue }
    const st = await styles(w)
    await shot(w, `${id}-after-${b}`)
    check(`${id}.1`, `a cross on ${a}, then one on ${b} begun inside its slide: afterwards neither week is left covered or unscrollable, the page not clipped`, loose(st), st)
    check(`${id}.2`, 'and no glide copy is left on screen', (await clonesUp(w)) === 0, await clonesUp(w))
    await swipeMoves(w, a, id)
    await swipeMoves(w, b, id)
    return
  }
  notWalked(id, 'three tries and the second cross never landed inside the first slide')
}
async function g3(w) {
  const P = w.page
  await go(w, 'viewsched'); await park(w, '#vWeek', 6)
  const wk0 = await P.evaluate(() => window.CURWEEK)
  await finger(w, line(320, -220, 10, await yIn(w, '#vWeek')))
  await P.waitForTimeout(1600)
  const st = await styles(w)
  await shot(w, 'g3-after-cross')
  check('G3.1', 'one cross on View-only Sched (Sunday → next Monday): it crosses, the week takes touches and scrolls again', (await P.evaluate(() => window.CURWEEK)) !== wk0 && loose(st), { wk0, wk: await P.evaluate(() => window.CURWEEK), st })
  await swipeMoves(w, 'viewsched', 'G3')
}

/* ---------- run ---------- */
if (run('b1') || run('b2') || run('b5')) {
  const w = await session('narrow')
  for (const [id, f] of [['b1', b1], ['b2', b2], ['b5', b5]]) {
    if (!run(id)) continue
    try { await f(w) } catch (e) { say(`FAIL ${id}.ERROR [narrow] the script stopped: ${String(e.message).split('\n')[0]}`); await shot(w, `${id}-error`).catch(() => {}) }
  }
  await w.ctx.close()
}
if (run('b3')) {
  const w = await session('desktop')
  try { await b3(w) } catch (e) { say(`FAIL b3.ERROR [desktop] the script stopped: ${String(e.message).split('\n')[0]}`); await shot(w, 'b3-error').catch(() => {}) }
  await w.ctx.close()
}
if (run('b4') || run('g1') || run('g2') || run('g3')) {
  const w = await session('phone')
  w.cdp = WEBKIT ? null : await w.ctx.newCDPSession(w.page)
  for (const [id, f] of [['b4', b4], ['g1', x => twoPages(x, 'G1', 'editsched', 'viewsched')], ['g2', x => twoPages(x, 'G2', 'viewsched', 'editsched')], ['g3', g3]]) {
    if (!run(id)) continue
    if (WEBKIT && id !== 'b4') { notWalked(id.toUpperCase(), 'the glide finger is Chromium touch (CDP); WebKit walks the menus and taps only'); continue }
    try { await f(w) } catch (e) { say(`FAIL ${id}.ERROR [phone] the script stopped: ${String(e.message).split('\n')[0]}`); await shot(w, `${id}-error`).catch(() => {}) }
  }
  await w.ctx.close()
}
await browser.close()
const lines = [...results, ...errs.map(e => 'BROWSER ' + e)]
writeFileSync(join(OUT, 'results-bk-walk.txt'), `[${VERSION}]\n` + lines.join('\n') + '\n')
console.log(`\n${results.filter(r => r.startsWith('PASS')).length} PASS · ${results.filter(r => r.startsWith('FAIL')).length} FAIL · ${results.filter(r => r.startsWith('NOT WALKED')).length} NOT WALKED · ${errs.length} browser errors`)
