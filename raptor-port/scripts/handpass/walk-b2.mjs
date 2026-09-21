/* Finishing my block: the publish message under the blanket (A10), the tenth
   man properly (B2), a placeholder where it cannot expand (A4), and the
   double tap that must leave no trace (B4). */
import { open, board, publish, oilMode, shot, tap, put, readDay, warnings, STATE } from './lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const R = {}
const beak = () => page.evaluate(() => { const e = document.querySelector('#schedBoard .dbeak'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : 'none' })
const barsOf = async (names) => (await readDay(page, di)).pucks.filter(p => names.includes(p.who)).map(p => `${p.who}:${p.bar || '-'}`)
const toasts = () => page.evaluate(() => [...document.querySelectorAll('[class*=toast],[class*=snack],[class*=flash]')]
  .filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean))

/* ---- A10: blanket ON, then publish for the FIRST time ---- */
await oilMode(page, true)
await page.locator('#schedBoard [data-oilblank]:visible').first().click()
await page.waitForTimeout(700)
await oilMode(page, false); await page.waitForTimeout(500)
R.A10_warnBeforePublish = await warnings(page)
R.A10_pub = await publish(page, di)
await page.waitForTimeout(1200)
R.A10_toastAtPublish = await toasts()
R.A10_warnAfterPublish = await warnings(page)
R.A10_bars = await barsOf(['Saber', 'Piston', 'Fable', 'Ranger', 'Ridge'])
await shot(page, 'A10-published-under-blanket')

/* ---- B4: the double tap, and the member's own word ---- */
/* lift the blanket first */
await oilMode(page, true)
await page.locator('#schedBoard [data-oilblank]:visible').first().click()
await page.waitForTimeout(700)
await oilMode(page, false); await page.waitForTimeout(500)
R.B4_beakAfterLiftingBlanket = await beak()

await oilMode(page, true)
const gambit = page.locator('#schedBoard [data-oilp]:visible').filter({ hasText: 'Gambit' }).first()
R.B4_gambitBefore = await gambit.getAttribute('title')
await gambit.click(); await page.waitForTimeout(600)
R.B4_gambitAfterOneTap = await page.locator('#schedBoard [data-oilp]:visible').filter({ hasText: 'Gambit' }).first().getAttribute('title')
await oilMode(page, false); await page.waitForTimeout(400)
R.B4_beakAfterOneTap = await beak()
await oilMode(page, true)
await page.locator('#schedBoard [data-oilp]:visible').filter({ hasText: 'Gambit' }).first().click()
await page.waitForTimeout(600)
R.B4_gambitAfterTwoTaps = await page.locator('#schedBoard [data-oilp]:visible').filter({ hasText: 'Gambit' }).first().getAttribute('title')
await oilMode(page, false); await page.waitForTimeout(500)
R.B4_beakAfterTwoTaps = await beak()
await shot(page, 'B4-double-tap')

/* ---- A4: a placeholder dropped where it cannot expand ---- */
await put(page, `[data-fill="d:${di}.0.1.+"]`, ['allavail'])
await page.waitForTimeout(600)
R.A4_desk = await page.evaluate(i => {
  const rows = [...document.querySelectorAll('#schedBoard .sb-arow')].filter(r => /SXO/.test(r.innerText || ''))
  return rows.slice(0, 2).map(r => ({ text: (r.innerText || '').replace(/\s+/g, ' ').slice(0, 90),
    pucks: [...r.querySelectorAll('.puck')].map(p => ({ who: (p.innerText || '').split('\n')[0], cls: p.className, title: p.getAttribute('title') })) }))
}, di)
await oilMode(page, true)
R.A4_deskInMode = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#schedBoard .sb-arow')].filter(r => /SXO/.test(r.innerText || ''))
  return rows.slice(0, 2).map(r => ({ items: [...r.querySelectorAll('[data-oilitem]')].map(e => e.getAttribute('title')),
    people: [...r.querySelectorAll('[data-oilp]')].map(p => ({ who: (p.innerText || '').split('\n')[0], title: p.getAttribute('title') })),
    pucks: [...r.querySelectorAll('.puck')].map(p => ({ who: (p.innerText || '').split('\n')[0], cls: p.className, title: p.getAttribute('title') })) }))
})
await shot(page, 'A4-placeholder-on-a-desk')
await oilMode(page, false)

R.errors = errors.slice(0, 8)
console.log(JSON.stringify(R, null, 1))
await browser.close()
