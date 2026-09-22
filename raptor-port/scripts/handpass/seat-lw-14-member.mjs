/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 12: the member's read.
   The money belongs to the men, so the man who earned it must be able to see
   it. Same published world, signed in as a squadron member rather than the
   admin: the Saturday cell, his own OIL figure, and whether the tracker
   offers him an edit he should not have. */
import { open, go, shot } from './lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const { browser, page, errors } = await open({ state: OUT + '/state-lw-published.json', who: 'us' })
await go(page, 'leavewar')
await page.waitForTimeout(2200)
console.log('MEMBER — the top row:', await page.evaluate(() => {
  const b = document.querySelector('[data-testid="oil-tracker"]')
  return { oilButton: b ? (b.innerText || '').trim() : 'MISSING',
    settingsGear: document.querySelector('[data-testid="lw-settings"], .lw-gear') ? 'shown' : 'not shown' }
}))
const cells = await page.evaluate(() => {
  const o = {}
  for (const id of ['nact', 'pump', 'shaft']) {
    const c = document.querySelector(`[data-testid="cell-${id}-2026-07-18"]`)
    o[id] = c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : 'NO CELL'
  }
  return o
})
console.log('MEMBER — Warden / Piston / Anvil on the credited Saturday:', JSON.stringify(cells))
await shot(page, 'LW-34-member-war-grid')

await page.click('[data-testid="oil-tracker"]')
await page.waitForTimeout(1600)
const t = await page.evaluate(() => {
  const s = document.querySelector('[data-testid="oil-sheet"]')
  if (!s) return 'DID NOT OPEN'
  return { header: (s.querySelector('.bidsheet-hd') || {}).innerText.replace(/\s+/g, ' ').slice(0, 120),
    rows: document.querySelectorAll('[data-testid^="oil-row-"]').length,
    warden: (document.querySelector('[data-testid="oil-bal-nact"]') || {}).textContent,
    gear: document.querySelector('[data-testid="oil-settings"]') ? 'SHOWN to a member' : 'admin only — not shown',
    anyDelete: document.querySelectorAll('[data-testid^="oil-del-"]').length,
    firstEntry: ((document.querySelector('[data-testid^="oil-entry-"]') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 90) }
})
console.log('MEMBER — the OIL tracker:', JSON.stringify(t))
await shot(page, 'LW-35-member-oil-tracker')
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
