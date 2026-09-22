/* [OIL-SEATS-CAN-EARN] walk — pin three things the roll-call turned up.
   1. The sim row that is exactly full offers NO door for another body.
   2. A crowd where EVERY man earns, but at two different rates, is captioned
      "Some of these men earn OIL and some do not".
   3. An AVALON line's switch is drawn in the ON style while its own words say
      the event earns nothing. */
import { open, board, tap, shot, oilMode, STATE } from './lib.mjs'
import { allChips, allSwitches } from './seat-lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

/* ---- 1. THE SIM DOOR, walked across the arities ------------------------ */
console.log('=== 1. the sim row at each occupancy ===')
async function simSlots(label) {
  const r = await page.evaluate(i => {
    const d = window.DAYS[i], P = window.PEOPLE, cs = x => (P[x] && P[x].cs) || x || '·'
    const b = document.querySelector('#schedBoard')
    const emptyOft = [...b.querySelectorAll('.sb-slot.empty[data-slot^="s:5.oft.0"]')].filter(e => e.offsetParent !== null).map(e => e.getAttribute('data-slot'))
    const emptyAmt = [...b.querySelectorAll('.sb-slot.empty[data-slot^="s:5.amt.1"]')].filter(e => e.offsetParent !== null).map(e => e.getAttribute('data-slot'))
    const zOft = b.querySelector('.ppl[data-fill="s:5.oft.0.+"] .addz')
    return {
      oft: `${cs(d.sims.oft[0].p)}/${cs(d.sims.oft[0].w)} more=[${(d.sims.oft[0].more || []).map(cs)}]`,
      amt: `pax=[${(d.sims.amt[1].pax || []).map(cs)}] more=[${(d.sims.amt[1].more || []).map(cs)}]`,
      emptyOftSlots: emptyOft, emptyAmtSlots: emptyAmt,
      addzShown: zOft ? getComputedStyle(zOft).display : 'NO STRIP',
    }
  }, di)
  console.log(' ', label, JSON.stringify(r))
  return r
}
await simSlots('as seeded (OFT p+w full, no extras; AMT 2 pax)')
/* take ONE passenger off the AMT box, through the app — does a door appear? */
const pax1 = page.locator(`#schedBoard [data-slot="s:${di}.amt.1.pax.1"]:visible`).first()
if (await pax1.count()) {
  await pax1.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await pax1.click(); await page.waitForTimeout(250)
  await page.keyboard.press('Delete'); await page.waitForTimeout(500)
}
await simSlots('after taking one AMT passenger off (odd count)')

/* ---- 2 & 3. the words, with the mode on -------------------------------- */
console.log('\n=== 2. the caption on a crowd where everyone earns ===')
/* put a placeholder on an empty duty position so a real crowd exists */
await tap(page, `[data-fill="d:${di}.2.1.+"]`)
await page.waitForTimeout(250)
await page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first().click()
await page.waitForTimeout(600)
const chips = await allChips(page)
for (const c of chips) {
  const m = /^(\d+) of (\d+) earn$/.exec(c.txt)
  const flag = m && m[1] === m[2] && /some do not/i.test(c.title) ? '   <-- SAYS "some do not" WHILE EVERY ONE OF THEM EARNS' : ''
  console.log('  ', c.txt.padEnd(14), '|', c.title, flag)
}
await shot(page, 'GAP-01-count-captions')

console.log('\n=== 3. the AVALON switch: drawn state vs its own words ===')
await oilMode(page, true)
const sw = await allSwitches(page)
for (const s of sw) {
  const contradiction = (s.state === 'on' && /earns nothing/.test(s.title)) ? '   <-- DRAWN AS ON, SAYS IT EARNS NOTHING' : ''
  if (contradiction || /AV|SXO|OPS O/.test(s.txt)) console.log('  ', s.txt.padEnd(10), 'class=' + s.state.padEnd(6), '|', s.title, contradiction)
}
/* what the two classes actually PAINT */
const paint = await page.evaluate(() => {
  const pick = (cls) => { const e = [...document.querySelectorAll('#schedBoard .oilitem')].find(x => x.offsetParent !== null && x.className.includes(cls)); if (!e) return null
    const c = getComputedStyle(e); return { cls: e.className, color: c.color, bg: c.backgroundColor, opacity: c.opacity, deco: c.textDecorationLine, border: c.borderColor } }
  return { on: pick('oilitem on'), off: pick('oilitem off'), none: pick('oilitem none') }
})
console.log('  what each class paints:', JSON.stringify(paint, null, 1))
await shot(page, 'GAP-02-switch-states')
console.log('\nerrors:', errors.slice(0, 6))
await browser.close()
