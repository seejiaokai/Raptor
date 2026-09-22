/* [OIL-SEATS-CAN-EARN] walk — the "+ add" strip, which is the real door for
   putting an EXTRA body on a row that is already full.
   The board has form here: 26 Aug 26, "a full board row swapped a seated puck
   instead of taking a new one, exactly because the board never drew this
   drop-below target the week always has". So: is the strip drawn on EVERY
   people cell the board draws, and does each order work through it? */
import { open, board, shot, STATE } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

/* IS THE STRIP DRAWN, on every people cell, on the board? */
const cells = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .ppl[data-fill]')]
  .filter(e => e.offsetParent !== null)
  .map(e => {
    const z = e.querySelector('.addz')
    const cs = z ? getComputedStyle(z) : null
    return { key: e.getAttribute('data-fill'), pucks: e.querySelectorAll('[data-person]').length,
      addz: !!z, disp: cs && cs.display, vis: cs && cs.visibility, h: z ? Math.round(z.getBoundingClientRect().height) : null }
  }))
console.log('PEOPLE CELLS ON THE BOARD — is the "+ add" strip there?')
for (const c of cells) console.log('  ', JSON.stringify(c))
console.log('  cells:', cells.length, ' with strip:', cells.filter(c => c.addz).length,
  ' WITHOUT:', cells.filter(c => !c.addz).map(c => c.key).join(', ') || 'none')

const read = () => page.evaluate(i => {
  const d = window.DAYS[i], P = window.PEOPLE, cs = x => (P[x] && P[x].cs) || x || '·'
  return {
    oft0: `${cs(d.sims.oft[0].p)}/${cs(d.sims.oft[0].w)} more=[${(d.sims.oft[0].more || []).map(cs)}]`,
    amt1: `pax=[${(d.sims.amt[1].pax || []).map(cs)}] more=[${(d.sims.amt[1].more || []).map(cs)}]`,
    prog1: `who=[${(Array.isArray(d.allhands[1].who) ? d.allhands[1].who : [d.allhands[1].who]).map(cs)}] more=[${(d.allhands[1].more || []).map(cs)}]`,
  }
}, di)

/* ORDER A — tap the strip to arm, then pick the puck off the palette */
console.log('\n=== ORDER A: tap "+ add", then pick ALL AVAIL ===')
console.log('before:', JSON.stringify(await read()))
for (const key of [`s:${di}.oft.0.+`, `s:${di}.amt.1.+`, `a:${di}.1.+`]) {
  const z = page.locator(`#schedBoard .ppl[data-fill="${key}"] .addz`).first()
  if (!await z.count()) { console.log('  ', key, 'NO STRIP'); continue }
  await z.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(150)
  const b = await z.boundingBox()
  if (!b) { console.log('  ', key, 'strip has no box (never laid out)'); continue }
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await page.waitForTimeout(300)
  const armed = await page.evaluate(() => (window.ARM && window.ARM.key) || null)
  if (armed) {
    await page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first().click()
    await page.waitForTimeout(500)
  }
  console.log('  ', key, 'armed=', armed, '->', JSON.stringify(await read()))
  await page.keyboard.press('Escape'); await page.waitForTimeout(150)
}

/* ORDER B — drag the puck and DROP ON THE STRIP */
console.log('\n=== ORDER B: drag ALL onto the "+ add" strip ===')
for (const key of [`s:${di}.oft.0.+`, `s:${di}.amt.1.+`, `a:${di}.1.+`]) {
  const z = page.locator(`#schedBoard .ppl[data-fill="${key}"] .addz`).first()
  if (!await z.count()) { console.log('  ', key, 'NO STRIP'); continue }
  await z.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(150)
  const src = page.locator(`#sbRoster .rpuck[data-person="all"]:visible`).first()
  await src.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(150)
  const a = await src.boundingBox()
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(a.x + 15, a.y + 15, { steps: 4 })
  await page.waitForTimeout(250)      // the strip only appears once a drag starts
  const b = await z.boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 10 })
  await page.waitForTimeout(250)
  await page.mouse.up()
  await page.waitForTimeout(700)
  console.log('  ', key, '->', JSON.stringify(await read()))
}
await shot(page, 'DOOR-07-addz')
console.log('\nerrors:', errors.slice(0, 6))
await browser.close()
