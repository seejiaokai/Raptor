/* B2 the tenth man (done properly, on a draft day) · B3 masked taps ·
   B5 undo across a publish. */
import { open, board, publish, oilMode, shot, tap, put, readDay, lwCell, STATE } from './lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const R = {}
const beak = () => page.evaluate(() => { const e = document.querySelector('#schedBoard .dbeak'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : 'none' })
const barsOf = async (n) => (await readDay(page, di)).pucks.filter(p => n.includes(p.who)).map(p => `${p.who}:${p.bar || '-'}`)
const itemIdx = (name) => page.evaluate(n => [...document.querySelectorAll('#schedBoard [data-oilitem]')]
  .findIndex(e => (e.innerText || '').split('\n')[0].trim() === n), name)

/* ---- B2: switch the mass brief off on a DRAFT day, then add a third man ---- */
await oilMode(page, true)
await tap(page, '[data-oilitem]', await itemIdx('MASS BRIEF'))
await page.waitForTimeout(700)
await oilMode(page, false); await page.waitForTimeout(500)
R.B2_added = await put(page, `[data-fill="a:${di}.1.+"]`, ['prism', 'vegas', 'salsa', 'krait'])
await page.waitForTimeout(700)
R.B2_barsOutsideMode = await barsOf(['Saber', 'Torch', 'Recon', 'Vapor', 'Saint', 'Kraken'])
await oilMode(page, true)
R.B2_rowInMode = await page.evaluate(() => {
  const row = [...document.querySelectorAll('#schedBoard .sb-arow')].find(r => /MASS BRIEF/.test(r.innerText || ''))
  if (!row) return null
  return { item: [...row.querySelectorAll('[data-oilitem]')].map(e => e.getAttribute('title')),
    pucks: [...row.querySelectorAll('.puck')].map(p => ({ who: (p.innerText || '').split('\n')[0], cls: p.className, title: p.getAttribute('title') })) }
})
await shot(page, 'B2-tenth-man-under-a-switched-off-event')
await oilMode(page, false); await page.waitForTimeout(400)
R.B2_pub = await publish(page, di); await page.waitForTimeout(800)
R.B2_money = await lwCell(page, ['stiff', 'ignite', 'prism', 'vegas', 'salsa', 'krait'], '2026-07-18')
await board(page, di)

/* ---- B3: a tap under the blanket must change nothing ---- */
await oilMode(page, true)
await page.locator('#schedBoard [data-oilblank]:visible').first().click()
await page.waitForTimeout(700)
R.B3_underBlanket = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const p = [...b.querySelectorAll('.puck')].filter(x => !x.closest('#sbRoster') && !x.closest('#eRoster'))
    .find(x => (x.innerText || '').split('\n')[0].trim() === 'Fable')
  const it = [...b.querySelectorAll('[data-oilitem]')].find(e => (e.innerText || '').split('\n')[0].trim() === 'SDO')
  return { fable: p ? { cls: p.className, title: p.getAttribute('title'), tappable: !!p.closest('[data-oilp]') } : null,
    sdoSwitch: it ? it.getAttribute('title') : null }
})
/* try to tap Fable while the blanket hides him */
const fab = page.locator('#schedBoard .puck:visible').filter({ hasText: 'Fable' }).first()
try { await fab.click({ timeout: 3000 }) } catch { R.B3_tapRefused = true }
await page.waitForTimeout(600)
R.B3_toast = await page.evaluate(() => [...document.querySelectorAll('[class*=toast],[class*=snack]')].filter(e => e.offsetParent).map(e => (e.innerText || '').trim()))
/* lift the blanket and check Fable came back exactly as he was */
await page.locator('#schedBoard [data-oilblank]:visible').first().click()
await page.waitForTimeout(800)
R.B3_afterLift = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const p = [...b.querySelectorAll('[data-oilp]')].find(x => /Fable/.test(x.innerText || ''))
  return p ? { title: p.getAttribute('title'), cls: p.className } : null
})
await shot(page, 'B3-under-the-blanket')
await oilMode(page, false); await page.waitForTimeout(500)
R.B3_barsAfterLift = await barsOf(['Fable', 'Saber', 'Piston'])
R.B3_beak = await beak()

R.errors = errors.slice(0, 8)
console.log(JSON.stringify(R, null, 1))
await browser.close()
