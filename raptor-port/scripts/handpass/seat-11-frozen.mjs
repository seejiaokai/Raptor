/* [OIL-SEATS-CAN-EARN] walk — THE FROZEN MEMBERSHIP, which is the money.
   D44: who is behind a puck is written down when the day is published, on every
   day. D44-the-tap: the issued page lists the men that page went out with.
   D44-the-mark: when the crowd is no longer what it went out with, the day
   reads as having something pending. D45: a change in AVAILABILITY never
   invalidates a signature; a changed OIL DECISION still does.

   Four traps this file pays for, so nobody pays again:
   · publishing SPENDS the signature, so D45 must be walked on a day signed
     AGAIN after publishing — otherwise there is no signature to protect.
   · the count chip's tap is a TOAST (`#toastEl`, no class), not a sheet.
   · the board has THREE "+ Inputs" doors: `.g` is ground requests, `.u` is
     UNAVAILABILITY (leave, medical, overseas duty), `.s` is SANS. Only `.u`
     changes who is available.
   · the Unavailable dialog takes a date RANGE, not a single day. */
import { open, board, tap, shot, publish, go, STATE } from './lib.mjs'
import { allChips, seatHolds, toast } from './seat-lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

await tap(page, `[data-fill="d:${di}.2.1.+"]`)
await page.waitForTimeout(250)
await page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first().click()
await page.waitForTimeout(600)
console.log('crowd placed on the empty SC OPS O AM desk:', await seatHolds(page, `d:${di}.2.1.+`))

const state = () => page.evaluate(i => {
  const b = document.querySelector('#schedBoard'), txt = b.innerText || ''
  return {
    ver: (b.querySelector('.verchip') || {}).innerText || '',
    pending: (txt.match(/(\d+)\s+pending/) || [])[1] || '0',
    signs: [...b.querySelectorAll('select')].filter(s => s.closest('.sb-sign,.signrow,[class*=sign]')).map(s => s.value).filter(Boolean).length,
    notSigned: /not yet signed|Not-Yet-Signed/i.test(txt),
  }
}, di)
const counts = async () => (await allChips(page)).map(c => `${c.txt} [${c.ver || 'live'}]`).join(' · ')
const tapChip = async (label) => {
  const chip = page.locator('#schedBoard .oilcount:visible').last()
  if (!await chip.count()) return console.log(label, 'NO CHIP ON SCREEN')
  await chip.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await chip.click(); await page.waitForTimeout(900)
  const t = await toast(page)
  console.log(label, t ? t.replace(/\s+/g, ' ').slice(0, 340) : 'NOTHING OPENED')
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  return t
}

console.log('publish ->', JSON.stringify(await publish(page, di)))
console.log('\nA. right after publishing:', JSON.stringify(await state()), '| counts:', await counts())

const sels = page.locator('#schedBoard .sb-sign select:visible, #schedBoard [data-sign] select:visible')
for (let i = 0; i < await sels.count(); i++) {
  const o = await sels.nth(i).locator('option').evaluateAll(os => os.map(x => x.value).filter(v => v && v !== '—'))
  if (o.length) await sels.nth(i).selectOption(o[Math.min(i, o.length - 1)])
  await page.waitForTimeout(120)
}
await page.waitForTimeout(500)
console.log('B. signed again after publishing:', JSON.stringify(await state()))
await shot(page, 'FRZ-01-published-and-signed')
const listBefore = await tapChip('   tap on the WORKING COPY ->')

/* ---- change AVAILABILITY through the board's own Unavailable door -------- */
await tap(page, `[data-inpadd="${di}.u"]`)
await page.waitForTimeout(900)
const pop = page.locator('#inpEditPop')
await pop.locator('#inpEditPerson').selectOption('dj')          // Ace, who is in the crowd
await pop.locator('#inpEditPerson').selectOption('dj')          // Ace, who is in the crowd
await pop.locator('#inpEditType').selectOption('LL')            // ordinary leave
await page.waitForTimeout(300)
console.log('filing LL for Ace, who is one of the 30 behind the puck')
await page.locator('#inpEditSave').click()
await page.waitForTimeout(900)
const conf = page.locator('[data-testid="oilconf"]')
if (await conf.count() && await conf.isVisible()) {
  await conf.locator('button').filter({ hasText: /^No OIL/ }).first().click()
  await page.waitForTimeout(300)
  await conf.getByRole('button', { name: 'Save', exact: true }).click()
  await page.waitForTimeout(900)
}
await page.waitForTimeout(700)

console.log('C. AFTER the availability change:')
console.log('   day:', JSON.stringify(await state()))
console.log('   counts on the WORKING COPY:', await counts())
await tapChip('   tap on the WORKING COPY ->')
await shot(page, 'FRZ-03-after-availability-change')

const anchor = page.locator(`#schedBoard [data-planmenu="${di}"]:visible`).first()
await anchor.evaluate(e => e.scrollIntoView({ block: 'center' }))
await anchor.click(); await page.waitForTimeout(700)
const pv = page.locator('[data-planpv]:visible').first()
if (await pv.count()) {
  await pv.click(); await page.waitForTimeout(1200)
  console.log('D. THE ISSUED PAGE, after the change:')
  console.log('   counts:', await counts())
  await tapChip('   tap on the ISSUED page ->')
  await shot(page, 'FRZ-04-issued-after-change')
  /* the way back out of a preview is the bar's own "Back to live copy"
     (data-golive) — it sits under the board's sticky top bar, so it has to go
     through tap(), which brings the target clear of the chrome first. */
  await tap(page, `[data-golive="${di}"]`)
  await page.waitForTimeout(1000)
  console.log('   back on the working copy:', JSON.stringify(await state()))
}

console.log('E. now change an OIL DECISION instead:')
console.log('   before:', JSON.stringify(await state()))
const oilBtn = page.locator('#sbOil')
if (await oilBtn.count() && await oilBtn.isVisible()) { await oilBtn.click(); await page.waitForTimeout(900) }
const item = page.locator('#schedBoard .oilitem.on:visible').first()
if (await item.count()) {
  const nm = (await item.innerText()).replace(/\s+/g, ' ').trim().slice(0, 24)
  const key = await item.getAttribute('data-oilitem')
  await tap(page, `[data-oilitem="${key}"]`)
  await page.waitForTimeout(1000)
  console.log('   turned "' + nm + '" off ->', JSON.stringify(await state()))
  console.log('   said:', await toast(page))
  await shot(page, 'FRZ-05-after-oil-decision')
}
console.log('errors:', errors.slice(0, 8))
await browser.close()
