/* [OIL-SEATS-CAN-EARN] walk — SURFACES 5b: the member at the WRITE PATH.
   Reaching Edit Schedule is not the test — the rule is that the page and the
   write path refuse him, never the nav. So: as the member, try to ARM a seat
   and drop a puck, try to open the day's board, and try the earn mode. */
import { open, go, shot, STATE } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE, who: 'u' })

const navSeen = await page.evaluate(() => [...document.querySelectorAll('.nav a,.nav button,[data-page]')]
  .filter(e => e.getBoundingClientRect().width > 0)
  .map(e => (e.innerText || '').trim()).filter(Boolean))
console.log('the tabs the member can actually SEE:', navSeen.join(' | '))

await go(page, 'editsched'); await page.waitForTimeout(1000)
const st = await page.evaluate(() => ({
  page: window.CURPAGE,
  fills: document.querySelectorAll('#eWeek [data-fill]').length,
  drags: document.querySelectorAll('#eWeek [data-drag]').length,
  emptySlots: document.querySelectorAll('#eWeek .seat.empty-slot').length,
  rosterPucks: [...document.querySelectorAll('#eRoster .rpuck')].filter(e => e.getBoundingClientRect().width > 0).length,
  addBtns: document.querySelectorAll('[data-gradd],[data-padd],[data-sradd],[data-gline]').length,
}))
console.log('\nEDIT SCHEDULE as the member:', JSON.stringify(st))
await shot(page, 'SURF-10-member-editsched-week')

/* try to plant a placeholder on the Common Programme row — the real gesture */
const armed = await page.evaluate(d => {
  const c = document.querySelector(`#eWeek [data-fill="a:${d}.1.+"]`) || document.querySelector(`#eWeek [data-fill^="a:${d}."]`)
  if (!c) return { target: 'NONE DRAWN' }
  c.scrollIntoView({ block: 'center' })
  const b = c.getBoundingClientRect()
  return { target: c.dataset.fill, x: b.x + b.width / 2, y: b.y + Math.min(b.height - 3, b.height * 0.8) }
}, di)
console.log('\n the member presses a people cell:', JSON.stringify(armed))
if (armed.x) {
  await page.mouse.click(armed.x, armed.y); await page.waitForTimeout(350)
  const a = await page.evaluate(() => (window.ARM && window.ARM.key) || null)
  console.log('   armed? ->', a === null ? 'NO — the seat did not arm' : a)
  if (a) {
    const p = page.locator(`#eRoster .rpuck[data-person="allavail"]:visible`).first()
    if (await p.count()) { await p.click({ timeout: 2500 }).catch(() => {}); await page.waitForTimeout(500) }
    const after = await page.evaluate(k => {
      const h = document.querySelector(`#eWeek [data-fill="${k}"]`)
      return h ? [...h.querySelectorAll('[data-person]')].map(e => e.dataset.person) : []
    }, armed.target)
    console.log('   after the drop the cell holds:', JSON.stringify(after))
    const said = await page.evaluate(() => { const t = document.getElementById('toastEl'); return t && t.style.opacity === '1' ? (t.textContent || '').slice(0, 200) : null })
    console.log('   the app said:', said || '(nothing)')
  }
}
await shot(page, 'SURF-11-member-tried-to-plant')

/* the day's board — and the earn mode inside it */
const dayBtn = await page.locator(`#eWeek [data-sbday="${di}"]`).count()
console.log('\n the "open this day" control on the member\'s week:', dayBtn ? 'drawn' : 'not drawn')
if (dayBtn) {
  await page.locator(`#eWeek [data-sbday="${di}"]`).first().click({ timeout: 4000 }).catch(e => console.log('   click refused:', String(e.message).slice(0, 80)))
  await page.waitForTimeout(1200)
}
const bd = await page.evaluate(() => ({
  boardOpen: !!document.querySelector('#schedBoard'),
  oilBtn: !!document.querySelector('#sbOil'),
  oilBtnVisible: !!(document.querySelector('#sbOil') && document.querySelector('#sbOil').getBoundingClientRect().width > 0),
  oilPhoneDoor: document.querySelectorAll('[data-oilmode]').length,
  switches: document.querySelectorAll('#schedBoard [data-oilitem]').length,
  chips: document.querySelectorAll('#schedBoard .oilcount').length,
  publishBtns: document.querySelectorAll('#schedBoard [data-beak],#schedBoard [data-alpub]').length,
}))
console.log(' the board, as the member:', JSON.stringify(bd))
await shot(page, 'SURF-12-member-board')

/* the write path itself — flip an earn switch without a button */
const wp = await page.evaluate(d => {
  const before = JSON.stringify((window.DAYS[d] || {}).oil || null)
  const bridge = Object.keys(window).filter(k => /oil/i.test(k)).slice(0, 20)
  return { before, oilOnWindow: bridge, oilev: JSON.stringify((window.DAYS[d] || {}).oilev || null).slice(0, 120) }
}, di)
console.log('\n what the page exposes about OIL:', JSON.stringify(wp))
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
