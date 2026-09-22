/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 5: all the way back.
   Step 4 showed the money step DOWN when one desk stopped earning. This asks
   the harder half: when the LAST thing a man was paid for stops earning, does
   the credit disappear completely and does his day go BLANK, or is a stale
   half-day left on the grid? A credit that goes out and never comes back is
   money wrongly banked. Continues from the AL1 world step 4 left. */
import { open, board, oilMode, shot, go, closeBoard } from './lib.mjs'
import { allSwitches, allPucks, toast } from './seat-lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const SAT = 5
const { browser, page, errors } = await open({ state: OUT + '/state-lw-reversed.json' })

async function publishAmendment(page, di) {
  const sels = page.locator(`#sbSignBar select[data-signday="${di}"]`)
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await page.waitForTimeout(200)
  }
  const btn = page.locator(`#sbSignBar [data-alpub="${di}"], #sbSignBar [data-beak="${di}"]`).first()
  if (!await btn.count()) return { published: false, why: 'no publish control' }
  if (await btn.isDisabled()) return { published: false, why: 'locked: ' + (await btn.innerText()).trim() }
  const label = (await btn.innerText()).trim()
  await btn.click(); await page.waitForTimeout(1200)
  return { published: true, pressed: label, version: await page.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '') }
}
const grab = async () => {
  await go(page, 'leavewar'); await page.waitForTimeout(1600)
  const cell = await page.evaluate(d => { const o = {}
    for (const r of document.querySelectorAll('[data-testid^="row-"]')) { const id = r.getAttribute('data-testid').slice(4)
      const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); o[id] = c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : 'NO CELL' }
    return o }, '2026-07-18')
  await page.click('[data-testid="oil-tracker"]'); await page.waitForTimeout(1400)
  const bal = await page.evaluate(() => { const o = {}
    for (const r of document.querySelectorAll('[data-testid^="oil-row-"]')) { const id = r.getAttribute('data-oilrow')
      const b = r.querySelector(`[data-testid="oil-bal-${id}"]`), nm = r.querySelector(`[data-testid="oil-name-${id}"]`)
      o[id] = { cs: (nm ? nm.innerText : '').replace(/\s+/g, ' ').trim().slice(0, 14), bal: b ? Number(b.textContent.trim().replace('−', '-')) : null,
        jul18: [...r.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /18 Jul/.test(t)) } }
    return o })
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  return { cell, bal }
}

const before = await grab()
console.log('start: the Saturday reads HO for the men whose only work left is FAMILY DAY.')

await board(page, SAT)
await oilMode(page, true); await page.waitForTimeout(600)
const sw = await allSwitches(page)
console.log('every switch on the Saturday:', sw.map(s => s.txt.replace(/\n/g, ' ') + '=' + s.state).join(' | '))
const fam = sw.find(s => /FAMILY DAY/.test(s.txt))
console.log('FAMILY DAY switch:', JSON.stringify(fam))
const paid = (await allPucks(page)).filter(p => p.item === fam.item)
console.log('FAMILY DAY is paying', paid.length, 'men')
await page.locator(`#schedBoard [data-oilitem="${fam.item}"]:visible`).first().click()
await page.waitForTimeout(900)
console.log('the app said:', await toast(page))
console.log('FAMILY DAY after the tap:', JSON.stringify((await allSwitches(page)).find(s => /FAMILY DAY/.test(s.txt))))
await shot(page, 'LW-13-familyday-switch-off')
await oilMode(page, false)
const pub = await publishAmendment(page, SAT)
console.log('PUBLISH:', JSON.stringify(pub))
await closeBoard(page)

const after = await grab()
console.log('\nman           | Sat cell -> after | OIL -> after | 18 Jul ledger line now')
console.log('-'.repeat(88))
let blanked = 0, stale = []
for (const id of Object.keys(after.bal)) {
  const b = before.bal[id], a = after.bal[id], bc = before.cell[id] || '', ac = after.cell[id] || ''
  if (bc === ac && b.bal === a.bal) continue
  console.log(a.cs.padEnd(13) + ' | ' + (bc || '·').padEnd(5) + ' -> ' + (ac || '·').padEnd(6) + ' | '
    + String(b.bal).padStart(5) + ' -> ' + String(a.bal).padStart(5) + ' | ' + (a.jul18.join(' ;; ') || '(none)'))
  if (!ac) blanked++
  if (ac && a.jul18.length === 0 && /FO|HO/.test(ac)) stale.push(a.cs)
}
console.log('\nmen whose Saturday went BLANK:', blanked)
const leftovers = Object.values(after.bal).filter(x => x.jul18.length).map(x => x.cs + ':' + x.jul18.join('/'))
console.log('men still carrying an 18 Jul credit:', leftovers.length, leftovers.slice(0, 12).join(' | '))
console.log('cells still showing FO/HO with no 18 Jul credit behind them:', stale.length ? stale.join(' ') : 'none')
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
