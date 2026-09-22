/* Did the drag APPEND, or did it REPLACE an occupant?
   The DOM cell holds a row's seats AND its extras, so reading it cannot tell
   the two apart. This asks the day itself, before and after. */
import { open, board, shot, STATE } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

const read = () => page.evaluate(i => {
  const d = window.DAYS[i], P = window.PEOPLE, cs = x => (P[x] && P[x].cs) || x || '·'
  return {
    oft0: { p: cs(d.sims.oft[0].p), w: cs(d.sims.oft[0].w), more: (d.sims.oft[0].more || []).map(cs) },
    amt1: { pax: (d.sims.amt[1].pax || []).map(cs), more: (d.sims.amt[1].more || []).map(cs) },
    prog1: { who: (Array.isArray(d.allhands[1].who) ? d.allhands[1].who : [d.allhands[1].who]).map(cs), more: (d.allhands[1].more || []).map(cs) },
    gnd0: { who: cs(d.ground[0].who), more: (d.ground[0].more || []).map(cs) },
    duty00: { id: cs(d.dutywaves[0].rows[0].id), more: (d.dutywaves[0].rows[0].more || []).map(cs) },
  }
}, di)

async function dragToCell(pid, fillKey) {
  const dst = page.locator(`#schedBoard [data-fill="${fillKey}"]:visible`).first()
  await dst.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(200)
  const src = page.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
  await src.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(150)
  const a = await src.boundingBox(), b = await dst.boundingBox()
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(a.x + 15, a.y + 15, { steps: 4 })
  await page.waitForTimeout(200)
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 10 })
  await page.waitForTimeout(250)
  await page.mouse.up()
  await page.waitForTimeout(700)
}

console.log('BEFORE:', JSON.stringify(await read(), null, 1))
for (const [label, key] of [['sim OFT', `s:${di}.oft.0.+`], ['sim AMT', `s:${di}.amt.1.+`],
  ['programme', `a:${di}.1.+`], ['ground', `g:${di}.0.+`], ['duty', `d:${di}.0.0.+`]]) {
  await dragToCell('allavail', key)
  console.log(`\nafter drag onto ${label} (${key}):`, JSON.stringify(await read()))
}
await shot(page, 'DOOR-06-append-truth')
console.log('\nerrors:', errors.slice(0, 6))
await browser.close()
