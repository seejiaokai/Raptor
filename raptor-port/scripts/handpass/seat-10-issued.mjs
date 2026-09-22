/* [OIL-SEATS-CAN-EARN] walk — THE VERSION PREVIEW, the only place "as issued"
   is visible, so the plan says it MUST be walked. D44 / D44-the-tap / D45.
   Publish the everything-Saturday with a placeholder crowd on it, then read the
   count on the working copy and on the issued page, and check the issued one
   does not move when somebody's availability changes.
   The door is the ONE white selector in the day's top bar (data-planmenu); the
   issued rows inside it carry data-planpv. */
import { open, board, tap, shot, oilMode, publish, signState, STATE } from './lib.mjs'
import { allChips, seatHolds } from './seat-lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

await tap(page, `[data-fill="d:${di}.2.1.+"]`)
await page.waitForTimeout(250)
await page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first().click()
await page.waitForTimeout(600)
console.log('placed on SC OPS O AM:', await seatHolds(page, `d:${di}.2.1.+`))

const pub = await publish(page, di)
console.log('publish ->', JSON.stringify(pub))
await shot(page, 'ISS-01-after-publish')
console.log('\nCHIPS ON THE WORKING COPY, once the day is out:')
for (const c of await allChips(page)) console.log('  ', c.txt.padEnd(14), 'ver="' + c.ver + '"', '|', (c.title || '').slice(0, 110))

const anchor = page.locator(`#schedBoard [data-planmenu="${di}"]:visible`).first()
const n = await anchor.count()
console.log('\nplans selector drawn:', n, n ? '"' + (await anchor.innerText()).replace(/\s+/g, ' ').trim() + '"' : '')
if (n) {
  await anchor.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await anchor.click()
  await page.waitForTimeout(700)
  const menu = await page.evaluate(() => [...document.querySelectorAll('[data-planpv], [data-plangolive], [data-plansel]')]
    .filter(e => e.offsetParent !== null)
    .map(e => ({ pv: e.dataset.planpv || null, live: e.dataset.plangolive || null, txt: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 90) })))
  console.log('plans menu rows:'); for (const r of menu) console.log('  ', JSON.stringify(r))
  await shot(page, 'ISS-02-plans-menu')

  const pv = page.locator('[data-planpv]:visible').first()
  if (await pv.count()) {
    const label = (await pv.innerText()).replace(/\s+/g, ' ').trim()
    await pv.click()
    await page.waitForTimeout(1100)
    console.log('\nopened the issued version:', label)
    console.log('the preview bar says:', await page.evaluate(() => {
      const b = document.querySelector('#schedBoard .dprev-bar')
      return b ? (b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 240) : 'NO PREVIEW BAR'
    }))
    console.log('COUNT CHIPS ON THE ISSUED PAGE:')
    for (const c of await allChips(page)) console.log('  ', c.txt.padEnd(14), 'ver="' + c.ver + '"', '|', (c.title || '').slice(0, 120))
    await shot(page, 'ISS-03-issued-preview')

    const chip = page.locator('#schedBoard .oilcount:visible').first()
    if (await chip.count()) {
      await chip.evaluate(e => e.scrollIntoView({ block: 'center' }))
      await chip.click(); await page.waitForTimeout(900)
      console.log('\ntapping that chip opened:', JSON.stringify(await page.evaluate(() =>
        [...document.querySelectorAll('.sheet, [role=dialog], .modal, .wm-pop, .pop, .popmenu')]
          .filter(e => e.offsetParent !== null).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 420)))).slice(0, 800))
      await shot(page, 'ISS-04-issued-chip-tapped')
      await page.keyboard.press('Escape'); await page.waitForTimeout(400)
    }
  } else console.log('NO ISSUED ROW IN THE PLANS MENU')
} else console.log('NO PLANS SELECTOR ON THE BOARD')

console.log('\nerrors:', errors.slice(0, 8))
await page.context().storageState({ path: 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats/state-published.json' })
await browser.close()
