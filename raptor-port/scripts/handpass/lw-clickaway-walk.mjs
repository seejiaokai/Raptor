// The OIL award editor's click outside (his D2173, D2176 — which replaced D2174: an outside click always closes, an unsaved
// change dropped; the slide kept, D2175) walked on the built app, a phone and a PC, with the plain-user round of the OIL
// tracker's controls that open or close; and first the grid's row tint over the name and balance cells (D2171, D2177).
// Each step asserts the right behaviour, so a re-run on a fixed build is the re-walk. node lw-clickaway-walk.mjs [port] [outdir]
import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(here, '../../package.json'))
const { chromium, devices } = require('@playwright/test')
const PORT = process.argv[2] || '4197'
const OUT = path.resolve(here, process.argv[3] || '../../docs/img/handpass/2026-11-17-lw-four-items/clickaway')
fs.rmSync(OUT, { recursive: true, force: true })
const results = []

async function run(kind) {
  const dir = path.join(OUT, kind); fs.mkdirSync(dir, { recursive: true })
  const browser = await chromium.launch()
  const ctx = kind === 'phone'
    ? await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 1 })
    : await browser.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  let n = 0
  const pic = async name => { n++; await page.screenshot({ path: path.join(dir, `${String(n).padStart(2, '0')}-${name}.png`) }) }
  const ok = (id, pass, note) => { results.push({ kind, id, pass, note }); console.log(`${pass ? 'PASS' : 'FAIL'} ${kind} ${id} — ${note}`) }
  const press = async (sel, nth = 0) => {
    const loc = page.locator(sel).nth(nth)
    /* brought to the list's middle, never only "into view": at the top it sits under the held heading rows, and a press
       at its middle lands on them (the first run's C7 on a phone) */
    await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' }))
    await page.waitForTimeout(150)
    const b = await loc.boundingBox()
    const x = b.x + b.width / 2, y = b.y + b.height / 2
    if (kind === 'phone') await page.touchscreen.tap(x, y); else await page.mouse.click(x, y)
    if (kind === 'phone') await pic('tap-lift')   // the picture right after the lift (D1281)
    await page.waitForTimeout(350)
  }
  const editorOpenOn = async () => page.evaluate(() => {
    const e = document.querySelector('[data-testid="oil-edit-award"], .oil-e.take.editing .oil-edit')
    return e ? e.closest('.oil-e')?.getAttribute('data-testid') : null
  })
  const EDIT = '[data-testid="oil-entry-l4"]', TITLE = '[data-testid="oil-sheet"] .bidsheet-hd .who'

  await page.goto(`http://localhost:${PORT}/`)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForFunction(() => window.CURPAGE === 'leavewar')
  await page.waitForSelector('[data-testid="oil-tracker"]', { timeout: 15000 })

  // T — the row tint (D2171, D2177): on a PC the row under the mouse tints its name and balance cells too, laid over their
  // solid fill; the next row bare; gone when the mouse leaves; the same with the year scrolled sideways (the pinned cells
  // still in front and solid). A phone has no mouse: the rule is not in force there.
  await page.waitForSelector('.mx tbody tr td.who')
  await page.waitForTimeout(800)
  const TINT = 'linear-gradient(rgba(59, 198, 232, 0.05), rgba(59, 198, 232, 0.05))'
  const dayOfMan = () => page.evaluate(() => {
    const vw = innerWidth, vh = innerHeight
    for (const td of document.querySelectorAll('.mx tbody tr:not(.me) td[data-testid^="cell-"]')) {
      if (td.children.length) continue
      const r = td.getBoundingClientRect()
      if (r.left < vw * 0.4 || r.right > vw - 20 || r.top < vh * 0.35 || r.bottom > vh - 40) continue
      if (document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === td) return td.dataset.testid
    }
    return null
  })
  const paintOf = id => page.locator(`[data-testid="${id}"]`).evaluate(td => {
    const tr = td.closest('tr')
    const cells = ['td.who', 'td.bal'].map(q => { const c = tr.querySelector(q), cs = getComputedStyle(c), r = c.getBoundingClientRect()
      return { image: cs.backgroundImage, color: cs.backgroundColor, front: document.elementFromPoint(r.left + 4, r.top + r.height / 2)?.closest('td') === c } })
    let nx = tr.nextElementSibling; while (nx && !nx.querySelector('td.who')) nx = nx.nextElementSibling
    return { cells, next: nx ? getComputedStyle(nx.querySelector('td.who')).backgroundImage : 'none', top: tr.getBoundingClientRect().top }
  })
  const rowPic = async (name, top) => { n++; await page.screenshot({ path: path.join(dir, `${String(n).padStart(2, '0')}-${name}.png`), clip: { x: 0, y: Math.max(0, top - 60), width: 900, height: 140 } }) }
  if (kind === 'desktop') {
    const id = await dayOfMan()
    if (!id) ok('T1', false, 'NOT WALKED — no empty day of a man in sight')
    else {
      const before = await paintOf(id)
      const b = await page.locator(`[data-testid="${id}"]`).boundingBox()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(250)
      const on = await paintOf(id)
      await rowPic('t1-row-tint', on.top)
      const solid = c => !/rgba\(.*, 0(\.\d+)?\)$/.test(c.color)
      ok('T1', before.cells.every(c => c.image === 'none') && on.cells.every(c => c.image === TINT && solid(c) && c.front) && on.next === 'none'
        && on.cells.every((c, i) => c.color === before.cells[i].color),
        `name and balance before: ${before.cells.map(c => c.image === 'none' ? 'bare' : 'tinted')}; under the mouse: ${on.cells.map(c => (c.image === TINT ? 'tinted' : c.image) + (solid(c) ? ', solid' : ', SEE-THROUGH') + (c.front ? ', in front' : ', BEHIND'))}; the row below ${on.next === 'none' ? 'bare' : 'tinted'}`)
      await page.mouse.move(5, 5); await page.waitForTimeout(250)
      const off = await paintOf(id)
      ok('T2', off.cells.every(c => c.image === 'none'), `the mouse gone: ${off.cells.map(c => c.image === 'none' ? 'bare' : 'tinted')}`)
      // the year scrolled sideways: the pinned cells stay in front and solid, tinted under the mouse
      await page.locator('.mx-wrap').evaluate(w => { w.scrollLeft += 900 })
      await page.waitForTimeout(400)
      const id3 = await dayOfMan()
      if (!id3) ok('T3', false, 'NOT WALKED — no empty day of a man in sight once scrolled')
      else {
        const b3 = await page.locator(`[data-testid="${id3}"]`).boundingBox()
        await page.mouse.move(b3.x + b3.width / 2, b3.y + b3.height / 2); await page.waitForTimeout(250)
        const s3 = await paintOf(id3)
        await rowPic('t3-scrolled-tint', s3.top)
        ok('T3', s3.cells.every(c => c.image === TINT && solid(c) && c.front), `scrolled sideways, under the mouse: ${s3.cells.map(c => (c.image === TINT ? 'tinted' : c.image) + (solid(c) ? ', solid' : ', SEE-THROUGH') + (c.front ? ', in front' : ', BEHIND'))}`)
      }
      await page.locator('.mx-wrap').evaluate(w => { w.scrollLeft = 0 })
      await page.mouse.move(5, 5); await page.waitForTimeout(300)
    }
  } else {
    const mouse = await page.evaluate(() => matchMedia('(hover: hover)').matches)
    ok('T1', mouse === false, `the phone has ${mouse ? 'A MOUSE — the tint would be in force' : 'no mouse — the tint is not in force, a phone unchanged'}`)
  }

  await page.locator('[data-testid="oil-tracker"]').click()
  await page.waitForSelector('[data-testid="oil-sheet"]')
  const first = page.locator('[data-testid="oil-range-first"]')
  if (await first.count()) await first.click()
  await page.waitForTimeout(400)

  // C1 — open the award, press outside with nothing changed: it closes, nothing saved
  await press(EDIT)
  ok('C1a', (await editorOpenOn()) === 'oil-entry-l4', `the editor opened on: ${await editorOpenOn()}`)
  await pic('c1-open')
  await press(TITLE)
  const c1 = await editorOpenOn()
  const amt1 = await page.locator(`${EDIT} .amt`).innerText()
  ok('C1b', c1 === null && amt1 === '+2', `after the press on the title: editor ${c1 ?? 'closed'}, the award reads ${amt1}`)
  await pic('c1-closed')

  // C2 — a change typed, a press outside: it closes as Cancel does, the change dropped (D2176)
  await press(EDIT)
  await page.locator('[data-testid="oil-edit-reason"]').fill('CNY workplan — moved')
  await press(TITLE)
  const r2 = await page.locator(`${EDIT} .l2`).innerText()
  ok('C2', (await editorOpenOn()) === null && r2.includes('CNY workplan') && !r2.includes('moved'), `after the press outside: editor ${await editorOpenOn() ?? 'closed'}, reason line "${r2.trim()}"`)
  await pic('c2-closed-dropped')

  // C3 — a change typed, a tap on another award: that award opens, the change dropped (D2176)
  await press(EDIT)
  await page.locator('[data-testid="oil-edit-reason"]').fill('CNY workplan — moved')
  const otherId = await page.locator('[data-testid="oil-list"] .oil-e.grant:not(.editing)').first().getAttribute('data-testid')
  await press('[data-testid="oil-list"] .oil-e.grant:not(.editing)', 0)
  const r3 = await page.locator(`${EDIT} .l2`).innerText()
  ok('C3', (await editorOpenOn()) === otherId && await page.locator('[data-testid="oil-edit-award"]').count() === 1 && !r3.includes('moved'), `after a tap on another award: editor on ${await editorOpenOn()} (${otherId} tapped), the first award's reason "${r3.trim()}"`)
  await pic('c3-other-opened')

  // C4 — Cancel drops a change
  await press(EDIT)
  await page.locator('[data-testid="oil-edit-reason"]').fill('CNY workplan — moved')
  await press('[data-testid="oil-edit-cancel"]')
  const r4 = await page.locator(`${EDIT} .l2`).innerText()
  ok('C4', (await editorOpenOn()) === null && r4.includes('CNY workplan') && !r4.includes('moved'), `after Cancel: editor ${await editorOpenOn() ?? 'closed'}, reason line "${r4.trim()}"`)
  await pic('c4-cancelled')

  // C5 — nothing changed, the list slid (a finger's drag on a phone, the wheel on a PC): it stays open, and the list moved
  await press(EDIT)
  const wrap = page.locator('.oil-wrap')
  const before = await wrap.evaluate(w => [w.scrollLeft, w.scrollTop])
  const wb = await wrap.boundingBox(), eb = await page.locator(EDIT).boundingBox()
  const x = Math.min(wb.x + wb.width - 30, Math.max(wb.x + 200, eb.x + eb.width / 2)), y = Math.min(wb.y + wb.height - 20, eb.y + eb.height + 40)
  if (kind === 'phone') {
    const cdp = await ctx.newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - i * 10, y: y - i * 6 }] }); await page.waitForTimeout(16) }
    await page.waitForTimeout(90)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else { await page.mouse.move(x, y); await page.mouse.wheel(0, 120) }
  await page.waitForTimeout(400)
  const after = await wrap.evaluate(w => [w.scrollLeft, w.scrollTop])
  ok('C5', (await editorOpenOn()) === 'oil-entry-l4' && (after[0] !== before[0] || after[1] !== before[1]), `the list from ${before} to ${after}; editor on ${await editorOpenOn()}`)
  await pic('c5-slid-still-open')

  // C6 — Save keeps a change
  await page.locator(EDIT).evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'nearest' }))
  await page.locator('[data-testid="oil-edit-amt"]').fill('3')
  await press('[data-testid="oil-edit-save"]')
  const a6 = await page.locator(`${EDIT} .amt`).innerText()
  ok('C6', (await editorOpenOn()) === null && a6 === '+3', `after Save: editor ${await editorOpenOn() ?? 'closed'}, the award reads ${a6}`)
  await pic('c6-saved')

  // C7 — a correction: its date calendar is the editor's own; a day picked there keeps it open; a press outside then closes
  // it, the change dropped (D2176)
  const CORR = '[data-testid="oil-entry-dol-3"]'
  await press(CORR)
  await press('[data-testid="oil-edit-date"]')
  const calOpen = await page.locator('.dcal-layer').count()
  await pic('c7-calendar')
  const day = page.locator('.dcal-layer button:not([disabled])').filter({ hasText: /^1[0-2]$/ }).first()
  const dayOk = await day.count()
  if (dayOk) { const b = await day.boundingBox(); if (kind === 'phone') await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(400) }
  const open7a = await editorOpenOn()
  if (!calOpen || !dayOk) ok('C7', false, `NOT WALKED — calendar ${calOpen}, a day to press ${dayOk}`)
  else {
    await press(TITLE)
    const open7b = await editorOpenOn()
    ok('C7', open7a === 'oil-entry-dol-3' && open7b === null, `after a day in its calendar: editor on ${open7a}; after a press outside with that change: ${open7b ?? 'closed'}`)
  }
  await pic('c7-after')
  if (await editorOpenOn()) await press('[data-testid="oil-edit-cancel"]')

  // C8 — plain-user round: an editor open with nothing changed, a tap on a name: the editor closes and the credit bar opens;
  // a press outside the bar folds it away
  await press(EDIT)
  await press('[data-testid^="oil-name-"]', 0)
  const bar = await page.locator('[data-testid="oil-credit-panel"]').count()
  ok('C8a', (await editorOpenOn()) === null && bar === 1, `after a tap on a name: editor ${await editorOpenOn() ?? 'closed'}, credit bar ${bar ? 'open' : 'not open'}`)
  await pic('c8-name-bar')
  await press(TITLE)
  const bar2 = await page.locator('[data-testid="oil-credit-panel"]').count()
  ok('C8b', bar2 === 0, `after a press outside the bar: credit bar ${bar2 ? 'still open' : 'folded'}`)
  await pic('c8-bar-folded')

  // C9 — the tracker closes by its ✕ with an editor open, and opens again with none open
  await press(EDIT)
  await press('[data-testid="oil-close"]')
  const gone = await page.locator('[data-testid="oil-sheet"]').count()
  await page.locator('[data-testid="oil-tracker"]').click(); await page.waitForTimeout(500)
  ok('C9', gone === 0 && (await editorOpenOn()) === null, `✕ closed the tracker (${gone === 0}); reopened with editor ${await editorOpenOn() ?? 'closed'}`)
  await pic('c9-reopened')

  ok('ERR', errors.length === 0, `page errors: ${errors.length ? errors.join(' | ') : 'none'}`)
  await browser.close()
}

await run('desktop')
await run('phone')
const fails = results.filter(r => !r.pass)
fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2))
console.log(`\n${results.length - fails.length} PASS / ${fails.length} FAIL`)
