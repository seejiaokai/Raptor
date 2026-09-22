/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 4: the reverse sweep.
   The published Saturday is amended so the whole SAT DESK stops earning, the
   amendment is published, and the war is read again. A credit that goes out
   and never comes back is real money wrongly banked, so this is the one
   question on my block where a wrong answer costs the squadron.

   The control is deliberate: some of the crowd have OTHER work on the same
   Saturday (a flight, a sim, the Common Programme), so they must KEEP a
   credit. Only the men whose whole Saturday was that desk may fall to nothing. */
import { open, board, oilMode, shot, go, closeBoard } from './lib.mjs'
import { allSwitches, allPucks, toast } from './seat-lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const SAT = 5
const { browser, page, errors } = await open({ state: OUT + '/state-lw-published.json' })

/* Sign the four roles and press the day's OWN publish button. lib.mjs's
   publish() is written for a FIRST publication; on an already-issued day the
   button is "Publish AL1" (data-alpub) and — because a changed OIL decision
   invalidates the signatures (D45) — all four must be signed AGAIN first. */
async function publishAmendment(page, di) {
  const sels = page.locator(`#sbSignBar select[data-signday="${di}"]`)
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await page.waitForTimeout(200)
  }
  const state = await page.evaluate(() => (document.querySelector('#sbSignBar .so-state') || {}).innerText || '')
  const btn = page.locator(`#sbSignBar [data-alpub="${di}"], #sbSignBar [data-beak="${di}"]`).first()
  if (!await btn.count()) return { published: false, why: 'no publish control', signed: n, state }
  const label = (await btn.innerText()).trim()
  if (await btn.isDisabled()) return { published: false, why: 'locked: ' + label, signed: n, state }
  await btn.click()
  await page.waitForTimeout(1200)
  return { published: true, pressed: label, signed: n, state,
    version: await page.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '') }
}

const grab = async () => {
  await go(page, 'leavewar')
  await page.waitForTimeout(1600)
  const cell = await page.evaluate(d => {
    const o = {}
    for (const r of document.querySelectorAll('[data-testid^="row-"]')) {
      const id = r.getAttribute('data-testid').slice(4)
      const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`)
      o[id] = c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : 'NO CELL'
    }
    return o
  }, '2026-07-18')
  await page.click('[data-testid="oil-tracker"]')
  await page.waitForTimeout(1400)
  const bal = await page.evaluate(() => {
    const o = {}
    for (const r of document.querySelectorAll('[data-testid^="oil-row-"]')) {
      const id = r.getAttribute('data-oilrow')
      const b = r.querySelector(`[data-testid="oil-bal-${id}"]`)
      const nm = r.querySelector(`[data-testid="oil-name-${id}"]`)
      o[id] = { cs: (nm ? nm.innerText : '').replace(/\s+/g, ' ').trim().slice(0, 14),
        bal: b ? Number(b.textContent.trim().replace('−', '-')) : null }
    }
    return o
  })
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  return { cell, bal }
}

const before = await grab()
console.log('BEFORE the amendment — 33 men read FO on the Saturday.')

await board(page, SAT)
await oilMode(page, true)
await page.waitForTimeout(600)
let sw = await allSwitches(page)
const desk = sw.find(s => /SAT DESK/.test(s.txt))
console.log('SAT DESK switch before the tap:', JSON.stringify(desk))
const crowd = (await allPucks(page)).filter(p => p.item === desk.item)
console.log('the desk is paying', crowd.length, 'men')
await shot(page, 'LW-09-satdesk-switch-on')

/* OIL7 — tapping the ITEM's name stops the whole item earning. */
await page.locator(`#schedBoard [data-oilitem="${desk.item}"]:visible`).first().click()
await page.waitForTimeout(900)
console.log('the app said:', await toast(page))
sw = await allSwitches(page)
console.log('SAT DESK switch after the tap:', JSON.stringify(sw.find(s => /SAT DESK/.test(s.txt))))
await shot(page, 'LW-10-satdesk-switch-off')
await oilMode(page, false)
await page.waitForTimeout(400)

const pend = await page.evaluate(i => ({
  chip: (document.querySelector('#schedBoard .verchip') || {}).innerText || '',
  bar: ((document.querySelector('#schedBoard .sb-daybar, #schedBoard .sb-top') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 220),
}), SAT)
console.log('the day now reads:', JSON.stringify(pend))
await shot(page, 'LW-11-day-after-switch-off')

const pub = await publishAmendment(page, SAT)
console.log('PUBLISH THE AMENDMENT:', JSON.stringify(pub))
await shot(page, 'LW-12-amendment-published')
await closeBoard(page)

const after = await grab()
console.log('\nman           | Sat cell before -> after | OIL before -> after | change')
console.log('-'.repeat(78))
const stuck = [], dropped = []
for (const id of Object.keys(after.bal)) {
  const b = before.bal[id], a = after.bal[id]
  const bc = before.cell[id] || '', ac = after.cell[id] || ''
  if (bc === ac && b.bal === a.bal) continue
  const d = (a.bal ?? 0) - (b.bal ?? 0)
  console.log(a.cs.padEnd(13) + ' | ' + (bc || '·').padEnd(6) + ' -> ' + (ac || '·').padEnd(8) + ' | '
    + String(b.bal).padStart(6) + ' -> ' + String(a.bal).padStart(6) + ' | ' + (d > 0 ? '+' : '') + d)
  dropped.push(a.cs)
}
for (const id of Object.keys(after.bal)) {
  const b = before.bal[id], a = after.bal[id]
  if (/FO|HO/.test(before.cell[id] || '') && b.bal === a.bal && (before.cell[id] === after.cell[id])) stuck.push(a.cs + '=' + a.bal)
}
console.log('\nmen whose figure MOVED:', dropped.length, '|', dropped.join(' '))
console.log('men UNCHANGED (kept their Saturday because they had other work, or never earned):', stuck.length)
console.log('\nerrors:', errors.slice(0, 8))
await page.context().storageState({ path: OUT + '/state-lw-reversed.json' })
await browser.close()
