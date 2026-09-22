/* B2 the tenth man · A2 a second man on a landed request · A4 a placeholder
   where it cannot expand · A10 the blanket, then publish · B3 masked taps. */
import { open, board, publish, oilMode, shot, tap, put, type, readDay, warnings, closeBoard, lwCell, STATE } from './lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const R = {}
const beak = () => page.evaluate(() => {
  const b = document.querySelector('#schedBoard'), e = b.querySelector('.dbeak')
  return e ? e.innerText.replace(/\s+/g, ' ').trim() : 'none'
})
const barsOf = async (names) => (await readDay(page, di)).pucks
  .filter(p => names.includes(p.who)).map(p => `${p.who}:${p.bar || '-'}`)
const titleOf = async (who) => page.evaluate(w => {
  const e = [...document.querySelectorAll('#schedBoard .puck[data-person]')]
    .filter(x => !x.closest('#sbRoster') && !x.closest('#eRoster'))
    .find(x => (x.innerText || '').split('\n')[0].trim() === w)
  return e ? { title: e.getAttribute('title'), cls: e.className } : null
}, who)

/* ---- B2: switch an item off, THEN put a man on it ---- */
await publish(page, di); await page.waitForTimeout(600)
await oilMode(page, true)
const mb = await page.evaluate(() => {
  const items = [...document.querySelectorAll('#schedBoard [data-oilitem]')]
  const i = items.findIndex(e => (e.innerText || '').split('\n')[0].trim() === 'MASS BRIEF')
  return i
})
await tap(page, '[data-oilitem]', mb)
await page.waitForTimeout(700)
R.B2_itemOffTitle = await page.evaluate(i => document.querySelectorAll('#schedBoard [data-oilitem]')[i].getAttribute('title'), mb)
await oilMode(page, false); await page.waitForTimeout(500)
R.B2_beakAfterSwitchOff = await beak()
R.B2_barsAfterSwitchOff = await barsOf(['Saber', 'Torch'])
/* now drop a THIRD man onto that switched-off event */
R.B2_thirdManAdded = await put(page, `[data-fill="a:${di}.1.+"]`, ['prism', 'vegas', 'krait', 'salsa'])
await page.waitForTimeout(600)
R.B2_barsWithThirdMan = await barsOf(['Saber', 'Torch', 'Recon', 'Vapor', 'Kraken', 'Saint'])
await oilMode(page, true)
R.B2_thirdManInMode = await page.evaluate(() => {
  const row = [...document.querySelectorAll('#schedBoard [data-oilitem]')]
    .find(e => (e.innerText || '').split('\n')[0].trim() === 'MASS BRIEF')
  const r = row && row.closest('.sb-arow')
  return r ? [...r.querySelectorAll('[data-oilp]')].map(p => ({ who: (p.innerText || '').split('\n')[0], title: p.getAttribute('title'), cls: p.className })) : null
})
await shot(page, 'B2-tenth-man')
await oilMode(page, false); await page.waitForTimeout(400)
R.B2_beak = await beak()

/* ---- A2: a second man on a member's landed request row ---- */
/* Talisman's Training landed on the Ground Programme; drop a second man on it */
const tRow = await page.evaluate(i => window.DAYS[i].ground.findIndex(g => /TRAINING/i.test(g.prog || '')), di)
R.A2_rowIndex = tRow
if (tRow >= 0) {
  R.A2_secondManAdded = await put(page, `[data-fill="g:${di}.${tRow}.+"]`, ['beams', 'boosh', 'chaps', 'slash'])
  await page.waitForTimeout(700)
  await oilMode(page, true)
  R.A2_rowInMode = await page.evaluate(([i, r]) => {
    const rows = [...document.querySelectorAll('#schedBoard .sb-arow')]
      .filter(x => /TRAINING/i.test(x.innerText || ''))
    return rows.map(x => ({
      item: [...x.querySelectorAll('[data-oilitem]')].map(e => ({ t: e.getAttribute('title') })),
      people: [...x.querySelectorAll('[data-oilp]')].map(p => ({ who: (p.innerText || '').split('\n')[0], title: p.getAttribute('title') })),
      inert: [...x.querySelectorAll('.puck')].map(p => ({ who: (p.innerText || '').split('\n')[0], title: p.getAttribute('title'), cls: p.className })),
    }))
  }, [di, tRow])
  await shot(page, 'A2-second-man-on-request-row')
  await oilMode(page, false); await page.waitForTimeout(400)
  R.A2_bars = await barsOf(['Talisman', 'Comet', 'Havoc', 'Forge', 'Blade'])
}

/* ---- A10: the blanket, then publish ---- */
await oilMode(page, true)
const blank = page.locator('#schedBoard [data-oilblank]:visible').first()
R.A10_blanketLabel = (await blank.innerText()).replace(/\s+/g, ' ').trim()
await blank.click(); await page.waitForTimeout(800)
R.A10_afterBlanket = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const some = [...b.querySelectorAll('[data-oilp]')].slice(0, 4).map(p => ({ who: (p.innerText || '').split('\n')[0], title: p.getAttribute('title'), cls: p.className }))
  return { some, items: [...b.querySelectorAll('[data-oilitem]')].slice(0, 2).map(e => e.getAttribute('title')) }
})
await shot(page, 'A10-blanket-on')
await oilMode(page, false); await page.waitForTimeout(600)
R.A10_warnWithBlanket = await warnings(page)
R.A10_barsWithBlanket = await barsOf(['Saber', 'Piston', 'Fable', 'Ranger'])
R.A10_beak = await beak()

R.errors = errors.slice(0, 8)
const { writeFileSync } = await import('node:fs')
writeFileSync('docs/img/handpass/walk-b.json', JSON.stringify(R, null, 1))
console.log(JSON.stringify({B2_itemOffTitle:R.B2_itemOffTitle, B2_beakAfterSwitchOff:R.B2_beakAfterSwitchOff, B2_barsAfterSwitchOff:R.B2_barsAfterSwitchOff, B2_thirdManAdded:R.B2_thirdManAdded, B2_barsWithThirdMan:R.B2_barsWithThirdMan, B2_thirdManInMode:R.B2_thirdManInMode, B2_beak:R.B2_beak}, null, 1))
await browser.close()
