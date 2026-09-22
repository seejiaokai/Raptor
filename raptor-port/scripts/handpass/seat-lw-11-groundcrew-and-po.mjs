/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 9: the two side answers.
   (a) Does a GROUND CREWMAN named on a desk by hand actually get the money —
       and if he does, a placeholder that leaves him out is paying two different
       answers to one question.
   (b) What the war showed for the man carrying a PO mark on the Saturday
       before anything was published, and what it shows after. */
import { open, board, oilMode, shot, go, closeBoard } from './lib.mjs'
import { allPucks, allSwitches } from './seat-lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const BEFORE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'

/* (b) first — read the untouched world, where nothing is published yet. */
{
  const { browser, page } = await open({ state: BEFORE })
  await go(page, 'leavewar'); await page.waitForTimeout(1800)
  const t = await page.evaluate(() => {
    const o = {}
    for (let d = 10; d <= 25; d++) {
      const iso = `2026-07-${String(d).padStart(2, '0')}`
      const c = document.querySelector(`[data-testid="cell-ignite-${iso}"]`)
      const tag = document.querySelector(`[data-testid="potag-ignite-${iso}"]`)
      if (c) o[iso] = (c.innerText || '').replace(/\s+/g, ' ').trim() + (tag ? ' <potag>' : '') + ' [' + c.className.slice(0, 34) + ']'
    }
    const last = document.querySelector('[data-testid="polast-ignite"]')
    return { days: o, polast: last ? (last.innerText || '').trim() + ' · title=' + (last.getAttribute('title') || '') : null }
  })
  console.log('TORCH in the UNTOUCHED world, 10-25 Jul:')
  for (const [k, v] of Object.entries(t.days)) console.log('  ', k, v)
  console.log('   his posted-out marker:', t.polast)
  await shot(page, 'LW-27-postedout-before')
  await browser.close()
}

/* (a) the ground crewman, published and read on the war. */
const { browser, page, errors } = await open({ state: OUT + '/state-lw-published.json' })
async function publishAmendment(page, di) {
  const sels = page.locator(`#sbSignBar select[data-signday="${di}"]`)
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await page.waitForTimeout(200)
  }
  const b = page.locator(`#sbSignBar [data-alpub="${di}"], #sbSignBar [data-beak="${di}"]`).first()
  if (!await b.count()) return { published: false, why: 'no publish control' }
  if (await b.isDisabled()) return { published: false, why: 'locked: ' + (await b.innerText()).trim() }
  const label = (await b.innerText()).trim(); await b.click(); await page.waitForTimeout(1300)
  return { published: true, pressed: label, version: await page.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '') }
}
const { tap, type } = await import('./lib.mjs')
const { handPut } = await import('./seat-lib.mjs')
await board(page, 6)
await tap(page, `[data-dradd="6.0"]`)
const ri = await page.evaluate(() => (window.DAYS[6].dutywaves[0].rows || []).length - 1)
await type(page, `[data-bfld="dr:6.0.${ri}.role"]`, 'GND DESK')
await type(page, `[data-bfld="dr:6.0.${ri}.str"]`, '09:00')
await type(page, `[data-bfld="dr:6.0.${ri}.end"]`, '17:00')
const put = await handPut(page, `d:6.0.${ri}.+`, 'spanner')
console.log('\nground crewman on the desk by name:', JSON.stringify(put))
const pub = await publishAmendment(page, 6)
console.log('published:', JSON.stringify(pub))
await closeBoard(page)
await go(page, 'leavewar'); await page.waitForTimeout(2000)
const gc = await page.evaluate(() => {
  const o = {}
  for (const id of ['spanner', 'torque', 'gizmo']) {
    const c = document.querySelector(`[data-testid="cell-${id}-2026-07-19"]`)
    o[id] = c ? (c.innerText || '').replace(/\s+/g, ' ').trim() || '(blank)' : 'NO CELL'
  }
  return o
})
console.log('the three ground crew on the Sunday cell:', JSON.stringify(gc))
await page.click('[data-testid="oil-tracker"]'); await page.waitForTimeout(1400)
const bal = await page.evaluate(() => {
  const o = {}
  for (const id of ['spanner', 'torque', 'gizmo']) {
    const r = document.querySelector(`[data-oilrow="${id}"]`)
    const b = r && r.querySelector(`[data-testid="oil-bal-${id}"]`)
    o[id] = r ? { bal: b ? b.textContent.trim() : null,
      ents: [...r.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()) } : 'NO ROW'
  }
  return o
})
console.log('their OIL figures:', JSON.stringify(bal))
await shot(page, 'LW-28-groundcrew-oil')
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
