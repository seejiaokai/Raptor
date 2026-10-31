/* [REACT-DOCTOR-CLEANUP] fix round 1 (31 Oct 26): the Tracker's "Next event" card — the first chip of a row that can be
   flown keeps the card's grey words, as on main (the code read's F1: `.kv span:first-child` stopped matching once the chip
   became a button). The demo student can fly none of his "Next event" chips, so this measures the stylesheet: on the first
   chip of each row it takes the "not yet" mark off (in the page only, to read the cascade a ready chip gets), reads its
   colour and compares it with the card's grey (--muted). PASS on main's build; red on the branch before the fix.
   Usage: node scripts/handpass/rdc-evchip.mjs <dist>   (desktop and phone) */
import { launch, newWorld, login, toPage, settle, SIZES } from './rdc-lib.mjs'

const dist = process.argv[2]
if (!dist) { console.error('usage: rdc-evchip.mjs <dist>'); process.exit(2) }
const browser = await launch()
let bad = 0
for (const [sizeName, size] of Object.entries(SIZES)) {
  const w = await newWorld(browser, dist, size, { touch: sizeName === 'phone' })
  const p = w.page
  await login(p, 'a')
  await toPage(p, 'tracker')
  if (sizeName === 'phone') { await p.click('button[data-view="info"]'); await settle(p) }
  await p.waitForSelector('.c-next .kv b [data-ev]', { timeout: 15000 })
  const rows = await p.evaluate(() => {
    const out = []
    for (const b of document.querySelectorAll('.c-next .kv b')) {
      const chip = b.querySelector(':scope > [data-ev]')
      if (!chip) continue
      chip.classList.remove('notyet')
      const muted = getComputedStyle(document.querySelector('#page-tracker')).getPropertyValue('--muted').trim()
      const probe = document.createElement('i'); probe.style.color = muted; document.body.appendChild(probe)
      const mutedRgb = getComputedStyle(probe).color; probe.remove()
      out.push({ ev: chip.getAttribute('data-ev'), tag: chip.tagName.toLowerCase(), color: getComputedStyle(chip).color, muted: mutedRgb })
    }
    return out
  })
  for (const r of rows) {
    const ok = r.color === r.muted
    if (!ok) bad++
    console.log(`${ok ? 'PASS' : 'FAIL'} ${sizeName} ${r.ev} <${r.tag}> colour ${r.color} — the card's grey ${r.muted}`)
  }
  if (!rows.length) { bad++; console.log(`FAIL ${sizeName}: no Next event chip found`) }
  await w.ctx.close()
}
await browser.close()
console.log(bad ? `${bad} FAIL` : 'all PASS')
process.exit(bad ? 1 : 0)
