/* THE MOCK-UP for the five-flags batch's look (27 Sep 26). His words: "q1 can u show me a mock upp · Q2 yes · Q3 show me
   a mock up · can u show mock of what u changed before and after".
   Part 1 — what the batch changed, before and after (the glow, Reset order, the crowd swap, the arrow's room); `p4full`,
            the arrow's room as the whole desktop window (his ask, 27 Sep 26). Where a
            walk already photographed the real before / after, the picture is COPIED from it (named below); the rest is
            shot here. A "before" is today's app with main's rule put back for the picture only (main's CSS, the words
            main's caption printed — `git show main:…`), exactly as the walk's own "before" pictures were made.
   Part 2 — Q2, answered yes (D270): his own flagged puck with the flag's ring instead of the purple one — today vs after.
   Part 3 — Q1: a man put on a row he is already on — today (warned, planted twice) vs refused.
   Part 4 — Q3: the strip beside the ‹ arrow — keep, empty, or faded.
   Drawn on the real production build served on :4176; everything proposed is injected just before each picture; nothing
   is saved. Usage, from raptor-port/:  node scripts/handpass/am/mk-five-flags.mjs */
import { mkdirSync, copyFileSync } from 'node:fs'
const ROOT = 'C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port'
const OUT = `${ROOT}/docs/mock/img/five-flags`
const WALK = `${ROOT}/docs/img/handpass/2026-09-26-five-flags`
process.env.HP_URL = process.env.HP_URL || 'http://localhost:4176'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w2-lib.mjs')
const { openHi, go, board, closeBoard } = L
const log = (...a) => console.log(...a)
const ERR = []
const PART = (process.argv[2] || 'all').toLowerCase()
const want = (k) => PART === 'all' || PART.split(',').includes(k)

/* a close-up of several visible elements together, padded, kept inside the window */
async function shot(page, name, sels, pad = 12, extra = {}) {
  const r = await page.evaluate(ss => {
    const vis = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 }
    const els = ss.map(s => [...document.querySelectorAll(s)].find(vis)).filter(Boolean)
    if (!els.length) return null
    els[0].scrollIntoView({ block: 'center', inline: 'nearest' })
    const bs = els.map(e => e.getBoundingClientRect())
    return { x0: Math.min(...bs.map(b => b.left)), y0: Math.min(...bs.map(b => b.top)), x1: Math.max(...bs.map(b => b.right)), y1: Math.max(...bs.map(b => b.bottom)), vw: innerWidth, vh: innerHeight }
  }, sels)
  if (!r) { log(`  (${name}: nothing to frame)`); return null }
  await page.waitForTimeout(200)
  const x = Math.max(0, r.x0 - pad - (extra.left || 0)), y = Math.max(0, r.y0 - pad - (extra.top || 0))
  const w = Math.min(r.vw, r.x1 + pad + (extra.right || 0)) - x, h = Math.min(r.vh, r.y1 + pad + (extra.bottom || 0)) - y
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x, y, width: w, height: h } })
  log(`  ${name}.png`)
  return name
}
async function inject(page, css) {
  return page.evaluate(css => { const s = document.createElement('style'); s.dataset.mk = '1'; s.textContent = css; document.head.appendChild(s) }, css)
}
async function uninject(page) { await page.evaluate(() => document.querySelectorAll('style[data-mk]').forEach(s => s.remove())); await page.waitForTimeout(150) }
function watch(errors, tag) { return () => { ERR.push(...errors.splice(0).map(e => `${tag}: ${e}`)) } }
const copy = (from, to) => { copyFileSync(`${WALK}/${from}`, `${OUT}/${to}.png`); log(`  ${to}.png  (copied from the walk: ${from})`) }

/* ---------------------------------------------------------------------------------------------- Part 1 — before / after */
if (want('p1')) {
log('Part 1 — what changed')
/* 1 · the glow — the walk's own pair (W1 A: main's two old rules injected for "before") and the dashed pair (W1 C4) */
copy('w1/A-desktop-before-main-saber-you-glows-beside-ranger.png', '1-glow-before')
copy('w1/A-desktop-after-branch-saber-you-beside-ranger.png', '1-glow-after')
copy('w1/C4-desktop-before-main-as-outlaw-tue-dashed-you-haze.png', '1-dash-before')
copy('rewalk/w1/C4-desktop-after-branch-as-outlaw-tue-dashed-you.png', '1-dash-after')
/* 2 · Reset order — after: the walk's three states (W2 F10); before: the same sheet without the new line (main has none) */
copy('w2/d-F10-0-fresh-greyed.png', '2-reset-after-greyed')
copy('w2/d-F10-4-real-change-enabled.png', '2-reset-after-lit')
copy('w2/d-F10-5-armed-really-reset.png', '2-reset-after-armed')
{
  const { browser, page, errors } = await openHi({ width: 1440, height: 900, dpr: 2 }); const drain = watch(errors, 'reset')
  await go(page, 'leavewar')
  await page.waitForSelector('.mx [data-testid^="row-"]', { state: 'attached' })
  await page.locator('[data-testid="settings-open"]').first().click(); await page.waitForSelector('[data-testid="settings-sheet"]')
  await page.locator('[data-testid="roster-reset-order"]').scrollIntoViewIfNeeded(); await page.waitForTimeout(250)
  /* main's sheet: no Roster order heading, no tray */
  await inject(page, `.gs-sec:has(+ .set-tray [data-testid="roster-reset-order"]),.set-tray:has([data-testid="roster-reset-order"]){display:none!important}`)
  await page.waitForTimeout(200)
  const r = await page.evaluate(() => {
    const c = document.querySelector('[data-testid="counter-reset-all"]').closest('.set-tray').getBoundingClientRect()
    const heads = [...document.querySelectorAll('[data-testid="settings-sheet"] .gs-sec')].filter(e => /groups/i.test(e.textContent))
    const g = heads[0].getBoundingClientRect(), s = document.querySelector('[data-testid="settings-sheet"]').getBoundingClientRect()
    return { x: s.left, y: c.top - 40, w: s.width, h: g.bottom + 16 - (c.top - 40) }
  })
  await page.screenshot({ path: `${OUT}/2-reset-before.png`, clip: { x: r.x, y: Math.max(0, r.y), width: r.w, height: r.h } }); log('  2-reset-before.png')
  drain(); await browser.close()
}
/* 3 · the crowd swap — Reaper dragged onto Ranger inside FLIGHT SAFETY STAND-DOWN. After: nothing under the ghost.
       Before: main's caption, "already on FLIGHT SAFETY STAND-DOWN 08:30–09:00" (crowdself.test.ts went red with those
       words on main's code), drawn on the real ghost and its amber target outline */
async function swapHover(name, before) {
  const { browser, page, errors } = await openHi({ width: 1440, height: 900, dpr: 2 }); const drain = watch(errors, 'swap')
  await board(page, 0)
  const zone = page.locator('#schedBoard [data-fill="a:0.2.+"] .addz:visible').first()
  await zone.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200)
  let b = await zone.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(400)
  const p = page.locator('#sbRoster .rpuck[data-person="dice"]').first()
  await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150)
  b = await p.boundingBox(); await page.mouse.click(b.x + Math.min(b.width / 2, 20), b.y + b.height / 2); await page.waitForTimeout(700)
  if (await page.evaluate(() => !!window.ARM)) { await page.keyboard.press('Escape'); await page.waitForTimeout(200) }
  const src = page.locator('#schedBoard [data-slot="a:0.2.1"] .puck:visible').first(), dst = page.locator('#schedBoard [data-slot="a:0.2.0"]:visible').first()
  await src.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250)
  const a = await src.boundingBox(), t = await dst.boundingBox()
  const ax = a.x + a.width / 2, ay = a.y + a.height / 2, tx = t.x + Math.min(t.width / 2, 30), ty = t.y + Math.min(t.height / 2, 9)
  await page.mouse.move(ax, ay); await page.mouse.down()
  await page.mouse.move(ax + 2, ay + 5); await page.waitForTimeout(40); await page.mouse.move(ax + 4, ay + 9); await page.waitForTimeout(60)
  for (let i = 1; i <= 12; i++) { await page.mouse.move(ax + 4 + (tx - ax - 4) * i / 12, ay + 9 + (ty - ay - 9) * i / 12); await page.waitForTimeout(10) }
  await page.waitForTimeout(250)
  if (before) await page.evaluate(() => {
    const g = document.querySelector('.dragimg, .tdghost'); const o = document.querySelector('.dragover')
    if (g && !g.querySelector('.dwhy')) { const c = document.createElement('span'); c.className = 'dwhy'; c.textContent = 'already on FLIGHT SAFETY STAND-DOWN 08:30–09:00'; g.appendChild(c); g.classList.add('haswhy') }
    if (o) o.classList.add('dragover-why')
  })
  await page.waitForTimeout(150)
  const said = await page.evaluate(() => { const c = document.querySelector('.dragimg .dwhy, .tdghost .dwhy'); return c ? c.textContent : '' })
  log(`  (${name}: the caption reads "${said}")`)
  await shot(page, name, ['#schedBoard [data-fill="a:0.2.+"]', '.dragimg, .tdghost'], 14, { bottom: 26, right: 120 })
  await page.mouse.up(); await page.waitForTimeout(500)
  drain(); await browser.close()
}
await swapHover('3-swap-before', true)
await swapHover('3-swap-after', false)
/* 4 · the arrow's room — View-only Sched, Monday's "⚠ issues" list open at the front. Before: main's 20px padding. */
async function arrowList(name, before) {
  const { browser, page, errors } = await openHi({ width: 1440, height: 900, dpr: 2 }); const drain = watch(errors, 'arrow')
  await go(page, 'viewsched')
  if (before) await inject(page, `@media (min-width:821px){.week{padding-left:20px!important;scroll-padding-left:0!important}}`)
  await page.evaluate(() => { const w = document.querySelector('#vWeek'); w.scrollLeft = 0 }); await page.waitForTimeout(300)
  await page.locator('#vWeek .day[data-day="0"] [data-daywarn]').first().click(); await page.waitForSelector('#vWeek .day[data-day="0"] .dwlist')
  await page.evaluate(() => { const w = document.querySelector('#vWeek'); w.scrollLeft = 0 }); await page.waitForTimeout(300)
  const r = await page.evaluate(() => {
    const l = document.querySelector('#vWeek .day[data-day="0"] .dwlist').getBoundingClientRect(), a = document.getElementById('weekPrev').getBoundingClientRect()
    return { y: Math.max(0, Math.min(l.top, a.top) - 60), y1: Math.min(innerHeight, Math.max(l.top + 190, a.bottom + 20)) }
  })
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y: r.y, width: 520, height: r.y1 - r.y } }); log(`  ${name}.png`)
  drain(); await browser.close()
}
await arrowList('4-arrow-before', true)
await arrowList('4-arrow-after', false)
}

/* 4, full screen (his ask, 27 Sep 26: "4 can u show me a full screen mock up") — the whole desktop window, before (main's
   20px, no declared room) and after, in three places: View-only with Monday's "⚠ issues" list open; Edit Schedule at rest;
   View-only after two › presses (Wednesday at the front, Tuesday's strip beside the arrow — D273 keeps it) */
if (want('p4full')) {
  log('Part 1, item 4 — full screen')
  const OLD = `@media (min-width:821px){.week{padding-left:20px!important;scroll-padding-left:0!important}}`
  for (const before of [true, false]) {
    const tag = before ? 'before' : 'after'
    const { browser, page, errors } = await openHi({ width: 1440, height: 900, dpr: 1 }); const drain = watch(errors, 'p4full')
    await go(page, 'viewsched')
    if (before) await inject(page, OLD)
    const rest = async () => { await page.evaluate(() => { const w = document.querySelector('#vWeek'); w.scrollLeft = 0; window.scrollTo(0, 0) }); await page.waitForTimeout(400) }
    await rest()
    await page.locator('#vWeek .day[data-day="0"] [data-daywarn]').first().click(); await page.waitForSelector('#vWeek .day[data-day="0"] .dwlist')
    await rest()
    await page.screenshot({ path: `${OUT}/4f-view-list-${tag}.png` }); log(`  4f-view-list-${tag}.png`)
    await page.locator('#vWeek .day[data-day="0"] [data-daywarn]').first().click(); await page.waitForTimeout(300)   // fold it again
    await rest()
    for (let i = 0; i < 2; i++) { await page.locator('#weekNext').click(); await page.waitForTimeout(900) }
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
    await page.screenshot({ path: `${OUT}/4f-view-pressed-${tag}.png` }); log(`  4f-view-pressed-${tag}.png`)
    await go(page, 'editsched'); await page.waitForTimeout(500)
    if (before) await inject(page, OLD)
    await page.evaluate(() => { const w = document.querySelector('#eWeek'); w.scrollLeft = 0; window.scrollTo(0, 0) }); await page.waitForTimeout(400)
    await page.screenshot({ path: `${OUT}/4f-edit-rest-${tag}.png` }); log(`  4f-edit-rest-${tag}.png`)
    drain(); await browser.close()
  }
}

/* ---------------------------------------------------------------------------------------------- Part 2 — Q2 (D270) */
log('Part 2 — Q2: the flag\'s own ring on his own puck')
/* the proposal: flagged, his puck wears the flag's ring as anyone's does (the purple fill stays); a solid or dashed red
   ring keeps winning as today. Drawn by giving the pucks of a man who carries that flag the "this is you" class, which
   is all the app itself does for the man signed in (ui/highlights.ts) */
const Q2 = `.puck.me.warn{box-shadow:0 0 0 1.5px var(--adv)!important}.puck.me.warn.hard{box-shadow:0 0 0 1.5px var(--hard)!important}
.puck.me.warn.note{box-shadow:0 0 0 1.5px #8A96A3!important}.puck.me.boxdot{box-shadow:none!important}
.puck.me.warn.boxred{box-shadow:0 0 0 2px var(--hard)!important}.puck.me.warn.boxdash{box-shadow:none!important}`
if (want('q2')) {
  const { browser, page, errors } = await openHi({ width: 1440, height: 900, dpr: 3 }); const drain = watch(errors, 'q2')
  await go(page, 'editsched'); await page.waitForTimeout(400)
  const cases = [
    ['amber', 'bapster', 0, ['[data-slot="0.1.0.1.p"]', '[data-slot="0.1.0.1.w"]']],
    ['thinred', 'bapster', 3, ['[data-slot="3.0.1.1.p"]', '[data-slot="3.0.1.1.w"]']],
    ['grey', 'wolf', 1, ['[data-slot="1.1.0.0.w"]', '[data-slot="1.1.0.0.p"]']],
    ['dotted', 'casper', 0, ['.puck.boxdot[data-person="casper"]']],
  ]
  for (const [k, pid, di, rel] of cases) {
    const scope = `#eWeek .day[data-day="${di}"]`, sels = rel.map(r => `${scope} ${r}`)
    const has = await page.evaluate(([s, p]) => document.querySelectorAll(`${s} .puck[data-person="${p}"]`).length, [scope, pid])
    if (!has) { log(`  (Q2 ${k}: no puck of ${pid} here — skipped)`); continue }
    /* the day to the front beside the ‹ arrow, then the pucks to the middle of the window — every scroll done BEFORE
       the "you" class goes on (a scroll can repaint the day, and a repaint takes a hand-set class off) */
    await page.evaluate(([di, sel]) => {
      const w = document.querySelector('#eWeek'), d = w.querySelector(`.day[data-day="${di}"]`)
      w.scrollLeft += d.getBoundingClientRect().left - w.getBoundingClientRect().left - 54
      const e = document.querySelector(sel); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' })
    }, [di, sels[0]])
    await page.waitForTimeout(500)
    const you = () => page.evaluate(([s, p]) => document.querySelectorAll(`${s} .puck[data-person="${p}"]`).forEach(e => e.classList.add('me')), [scope, pid])
    const frame = async (name) => {
      await you(); await page.waitForTimeout(150)
      const r = await page.evaluate(ss => {
        const bs = ss.map(s => document.querySelector(s)).filter(Boolean).map(e => e.getBoundingClientRect())
        return { x0: Math.min(...bs.map(b => b.left)), y0: Math.min(...bs.map(b => b.top)), x1: Math.max(...bs.map(b => b.right)), y1: Math.max(...bs.map(b => b.bottom)), me: [...document.querySelectorAll(ss[0])].some(e => e.classList.contains('me') || !!e.querySelector('.puck.me')) }
      }, sels)
      await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: r.x0 - 12, y: r.y0 - 12, width: r.x1 - r.x0 + 24, height: r.y1 - r.y0 + 24 } })
      log(`  ${name}.png${r.me ? '' : '  — WARNING: the "you" class is not on it'}`)
    }
    await frame(`q2-${k}-today`)
    await inject(page, Q2)
    await frame(`q2-${k}-after`)
    await uninject(page)
  }
  drain(); await browser.close()
}

/* ---------------------------------------------------------------------------------------------- Part 3 — Q1 */
if (want('q1')) {
log('Part 3 — Q1: a man put on a row he is already on')
/* today — the re-walk's own pictures (W3 f6-a, on the final build) */
copy('rewalk/w3/f6-a-hover-palette-ranger-onto-own-row.png', 'q1-today-hover-full')
{
  /* the re-walk's picture is the whole window; the part that matters is the row and the caption under the ghost */
  const { chromium } = await import('@playwright/test')
  const { readFileSync } = await import('node:fs')
  const b = await chromium.launch(); const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
  await pg.setContent(`<body style="margin:0"><img src="data:image/png;base64,${readFileSync(`${OUT}/q1-today-hover-full.png`).toString('base64')}" style="display:block"></body>`)
  await pg.waitForTimeout(200); await pg.screenshot({ path: `${OUT}/q1-today-hover.png`, clip: { x: 15, y: 98, width: 1085, height: 54 } }); await b.close()
  const { unlinkSync } = await import('node:fs'); unlinkSync(`${OUT}/q1-today-hover-full.png`); log('  q1-today-hover.png  (cropped from it)')
}
copy('rewalk/w3/f6-a-after-palette-drag.png', 'q1-today-after')
{
  /* refused — the same drop, not written: the row keeps its one Ranger, and the app says why (the refusal toast every
     refused drop uses, drag.ts refuse(): the man, then the reason) */
  const { browser, page, errors } = await openHi({ width: 1440, height: 900, dpr: 2 }); const drain = watch(errors, 'q1')
  await board(page, 0); await page.waitForTimeout(300)
  await page.evaluate(() => window.toast('Ranger — already on FLIGHT SAFETY STAND-DOWN 08:30–09:00 · not added twice', 'warn'))
  await page.waitForTimeout(350)
  await page.evaluate(() => { const r = document.querySelector('#schedBoard [data-fill="a:0.2.+"]').closest('.sb-arow'); r.id = 'mkRow' })
  await shot(page, 'q1-refuse-row', ['#mkRow'], 3)
  await shot(page, 'q1-refuse-toast', ['#toastEl'], 10)
  drain(); await browser.close()
}
/* the three row pictures cut to the band that matters — the times, the pucks and the caption under the ghost — so they
   stay readable on a phone (each in its own pixels: the walk's two at 1×, this one at 2×) */
{
  const { chromium } = await import('@playwright/test'); const { readFileSync } = await import('node:fs')
  const b = await chromium.launch(); const pg = await (await b.newContext({ viewport: { width: 2400, height: 400 } })).newPage()
  for (const [f, x, w] of [['q1-today-hover', 330, 520], ['q1-today-after', 330, 520], ['q1-refuse-row', 660, 1040]]) {
    await pg.setContent(`<body style="margin:0;background:#000"><img id="i" src="data:image/png;base64,${readFileSync(`${OUT}/${f}.png`).toString('base64')}" style="display:block"></body>`)
    await pg.waitForTimeout(150)
    const h = await pg.evaluate(() => document.getElementById('i').naturalHeight)
    await pg.screenshot({ path: `${OUT}/${f}.png`, clip: { x, y: 0, width: w, height: h } }); log(`  ${f}.png  (cut to the times, pucks and caption)`)
  }
  await b.close()
}
}

/* ---------------------------------------------------------------------------------------------- Part 4 — Q3 */
log('Part 4 — Q3: the strip beside the ‹ arrow')
if (want('q3')) {
  const { browser, page, errors } = await openHi({ width: 1440, height: 900, dpr: 2 }); const drain = watch(errors, 'q3')
  await go(page, 'viewsched')
  await page.evaluate(() => { document.querySelector('#vWeek').scrollLeft = 0 }); await page.waitForTimeout(300)
  await page.locator('#weekNext').click(); await page.waitForTimeout(900)       // one press: Tuesday at the front, Monday's tail in the room
  const frame = async (name) => {
    const r = await page.evaluate(() => { const w = document.querySelector('#vWeek').getBoundingClientRect(); return { y: Math.max(0, w.top - 8) } })
    await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y: r.y, width: 460, height: 430 } }); log(`  ${name}.png`)
  }
  await frame('q3-keep')
  await inject(page, `.week{-webkit-mask-image:linear-gradient(to right,transparent 0,transparent 54px,#000 54px);mask-image:linear-gradient(to right,transparent 0,transparent 54px,#000 54px)}`)
  await page.waitForTimeout(200); await frame('q3-empty'); await uninject(page)
  await inject(page, `.week{-webkit-mask-image:linear-gradient(to right,rgba(0,0,0,.18) 0,#000 54px);mask-image:linear-gradient(to right,rgba(0,0,0,.18) 0,#000 54px)}`)
  await page.waitForTimeout(200); await frame('q3-fade'); await uninject(page)
  drain(); await browser.close()
}

log(ERR.length ? `BROWSER ERRORS: ${ERR.join(' | ')}` : 'browser errors: none')
