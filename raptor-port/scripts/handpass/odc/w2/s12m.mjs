// W2 scenario 12 — a member (us / Ranger): any upchit of his own to file? VERSION 1
import { openWorld, tools } from './lib.mjs'
const WHICH = process.argv[2] || 'desktop'
console.log(`s12m VERSION 1 — ${WHICH}`)
const w = await openWorld(WHICH, 'us', 'us')
const { page } = w
const t = tools(w, `${WHICH}-s12m`)
console.log('signed in as:', (await page.locator('header, #topbar, .topbar').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 160))
await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(600)
const med = await page.locator('#inMedBtn').count()
console.log('Medical button present for the member:', med)
let seen = ''
if (med) {
  await t.press('#inMedBtn')
  const secs = await page.$$eval('.medsec', es => es.map(e => e.className.replace('medsec ', '') + ': ' + e.innerText.replace(/\s+/g, ' ').slice(0, 300)))
  console.log('sections:', JSON.stringify(secs))
  seen = secs.join(' || ')
  await t.shot('medical')
  const pend = page.locator('.medsec.med-pend .medcard')
  console.log('pending cards:', await pend.count(), (await pend.allInnerTexts()).map(x => x.replace(/\s+/g, ' ')))
  // does a card mentioning Ranger carry an Upchit control
  const ranger = page.locator('.medcard', { hasText: 'Ranger' })
  console.log('cards naming Ranger:', await ranger.count())
}
console.log('errors', JSON.stringify(w.errors))
await w.browser.close()
