/* G1 part four — the crew palette inside the mode, an actual drag attempt, the
   input row's UNDO, and the bars after a publish made from inside the mode. */
import { open, board, tap, shot, oilMode, readDay, publish } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const di = 5
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const R = {}

/* the board's Common Programme row, OUTSIDE the mode — is there a count chip? */
const commonRow = () => page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const cell = [...root.querySelectorAll('input, span, td, div')].find(e => (e.value || e.innerText || '') === 'FAMILY DAY')
  const row = cell && cell.closest('.c6r, .sb-arow, tr, [class*=row]')
  if (!row) return { found: false }
  return {
    found: true, text: (row.innerText || '').replace(/\n+/g, ' | ').slice(0, 200),
    pucks: [...row.querySelectorAll('[data-person], .puck')].map(p => ({ txt: (p.innerText || '').trim().slice(0, 18), cls: String(p.className).slice(0, 48), title: (p.getAttribute('title') || '').slice(0, 80) })),
    chip: [...row.querySelectorAll('.oilcount, [data-oilsent]')].map(c => ({ t: c.innerText, title: c.getAttribute('title') })),
  }
})
R.commonOut = await commonRow()
const fam = page.locator('#schedBoard').getByText('FAMILY DAY', { exact: true }).first()
await fam.scrollIntoViewIfNeeded().catch(() => {})
await shot(page, 'G-G1-12-common-programme-outside-mode')

await oilMode(page, true)
/* the crew palette, inside the mode */
R.palette = await page.evaluate(() => {
  const r = document.querySelector('#sbRoster')
  if (!r) return { found: false }
  const vis = e => !!(e.offsetParent || e.getClientRects().length)
  const kids = [...r.querySelectorAll('[data-person]')].filter(vis)
  return {
    found: true, visible: vis(r), heading: (r.previousElementSibling || {}).innerText || '',
    text: (r.innerText || '').replace(/\n+/g, ' ').slice(0, 90),
    pucks: kids.length, classes: [...new Set(kids.map(e => String(e.className).split(' ')[0]))],
    draggable: kids.filter(e => e.getAttribute('draggable') === 'true' || e.classList.contains('rpuck')).length,
    sideText: ((document.querySelector('#sbSide') || {}).innerText || '').replace(/\n+/g, ' | ').slice(0, 220),
  }
})
await shot(page, 'G-G1-13-palette-in-mode')

/* try the drag: arm a seat, then click a palette puck — the app's own fill gesture */
R.tryFill = await (async () => {
  const before = await readDay(page, di)
  const seatCount = await page.locator('#schedBoard [data-slot]:visible, #schedBoard [data-fill]:visible').count()
  /* no seat targets at all in the mode → try dropping onto a puck's own cell */
  const p = page.locator('#sbRoster [data-person]:visible').first()
  const has = await p.count()
  let armed = null, clicked = false
  if (has) { await p.click({ force: true }).catch(() => {}); clicked = true; await page.waitForTimeout(400); armed = await page.evaluate(() => (window.ARM && window.ARM.key) || null) }
  const after = await readDay(page, di)
  return { seatTargets: seatCount, paletteClickable: !!has, clicked, armAfterPaletteClick: armed,
    dayChanged: JSON.stringify(before.waves) !== JSON.stringify(after.waves) }
})()

/* a real HTML5 drag from the palette onto a flying seat, inside the mode */
R.realDrag = await (async () => {
  const src = page.locator('#sbRoster [data-person]:visible').first()
  const tgtSel = '#schedBoard .sb-line .seat:visible, #schedBoard .puck:visible'
  const tgt = page.locator(tgtSel).first()
  if (!await src.count() || !await tgt.count()) return { skipped: true, src: await src.count(), tgt: await tgt.count() }
  const before = await readDay(page, di)
  const a = await src.boundingBox(), b = await tgt.boundingBox()
  if (!a || !b) return { skipped: 'no box' }
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 15 })
  await page.waitForTimeout(250)
  const mid = await page.evaluate(() => ({ body: document.body.className, ghost: !!document.querySelector('.dragimg, .tdghost') }))
  await page.mouse.up()
  await page.waitForTimeout(700)
  const after = await readDay(page, di)
  return { mid, changed: JSON.stringify(before.waves) !== JSON.stringify(after.waves) || JSON.stringify(before.prog) !== JSON.stringify(after.prog) }
})()
await shot(page, 'G-G1-14-after-drag-attempt-in-mode')

/* press UNDO on an accepted input row, inside the mode */
R.inputUndo = await (async () => {
  const before = await readDay(page, di)
  const u = page.locator('#schedBoard [data-acc]:visible, #schedBoard [data-accd]:visible, #schedBoard [data-acck]:visible').first()
  if (!await u.count()) return { found: false }
  const title = await u.getAttribute('title')
  await u.click({ force: true }).catch(() => {})
  await page.waitForTimeout(900)
  const after = await readDay(page, di)
  const dlg = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog], .sheet, .modal')].filter(e => e.offsetParent)
    return d.map(e => (e.innerText || '').replace(/\n+/g, ' | ').slice(0, 160))
  })
  return { found: true, title, dialog: dlg,
    groundBefore: before.ground, groundAfter: after.ground,
    removedARow: before.ground.length !== after.ground.length,
    stillInMode: await page.evaluate(() => !!document.querySelector('#schedBoard [data-oilitem]')) }
})()
await shot(page, 'G-G1-15-after-input-undo-in-mode')

R.errors = errors.slice(0, 10)
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/walk-g1d.json', JSON.stringify(R, null, 1))
console.log('COMMON PROGRAMME row outside the mode:', JSON.stringify(R.commonOut, null, 1))
console.log('PALETTE inside the mode:', JSON.stringify(R.palette, null, 1))
console.log('tryFill:', JSON.stringify(R.tryFill))
console.log('realDrag:', JSON.stringify(R.realDrag))
console.log('inputUndo:', JSON.stringify(R.inputUndo, null, 1))
console.log('errors:', R.errors)
await browser.close()
