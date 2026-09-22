/* [OIL-SEATS-CAN-EARN] walk — SURFACES, the words on the week.
   1. The chip that reads "N of N earn" while its hover says "Some of these men
      earn OIL and some do not" — read the list underneath and see which is true.
   2. The OTHER "free" figure on the same screen: the Available-crew panel's
      "Pilots · N free", beside a puck saying a different number. */
import { open, go, board, tap, type, shot, STATE } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
await tap(page, `[data-gradd="${di}"]`)
await type(page, `[data-bfld="gr:${di}.5.prog"]`, 'STORES CHECK')
await type(page, `[data-bfld="gr:${di}.5.str"]`, '08:00')
await type(page, `[data-bfld="gr:${di}.5.end"]`, '10:00')
await tap(page, `[data-fill="g:${di}.5.+"]`)
await page.waitForTimeout(200)
const p = page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
if (await p.count()) { await p.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(500) }
await page.keyboard.press('Escape'); await page.waitForTimeout(250)
await page.locator('#sbClose:visible').first().click().catch(() => {}); await page.waitForTimeout(900)
await go(page, 'editsched'); await page.waitForTimeout(900)

console.log('===== 1. WHAT EACH CHIP SAYS, AND WHAT IS ACTUALLY TRUE =====')
const n = await page.evaluate(d => document.querySelectorAll(`#eWeek .day[data-day="${d}"] .oilcount`).length, di)
for (let i = 0; i < n; i++) {
  const m = await page.evaluate(([d, ix]) => {
    const c = document.querySelectorAll(`#eWeek .day[data-day="${d}"] .oilcount`)[ix]
    c.scrollIntoView({ block: 'center', inline: 'center' })
    const b = c.getBoundingClientRect()
    return { txt: (c.innerText || '').trim(), title: c.getAttribute('title'),
      cx: b.x + b.width / 2, cy: b.y + b.height / 2,
      row: (c.closest('.pl-row,.ah-row') || {}).innerText?.replace(/\s+/g, ' ').slice(0, 40) }
  }, [di, i])
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.textContent = ''; t.style.opacity = '0' } })
  await page.mouse.click(m.cx, m.cy); await page.waitForTimeout(650)
  const list = await page.evaluate(() => { const t = document.getElementById('toastEl')
    return t && t.style.opacity === '1' ? (t.textContent || '').trim() : '' })
  const full = (list.match(/full day/g) || []).length
  const half = (list.match(/half day/g) || []).length
  const none = (list.match(/ nothing/g) || []).length
  console.log(`\n  row ${JSON.stringify(m.row)}`)
  console.log(`    the chip reads : "${m.txt}"`)
  console.log(`    the hover says : ${m.title}`)
  console.log(`    the list says  : ${full} get a full day, ${half} get half a day, ${none} get nothing`)
  const contradiction = /some do not/.test(m.title || '') && none === 0
  if (contradiction) console.log(`    >>> THE HOVER IS WRONG: nobody in this crowd earns nothing.`)
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
}
await shot(page, 'SURF-32-chip-words')

console.log('\n===== 2. TWO ANSWERS TO THE WORD "FREE" ON ONE SCREEN =====')
const two = await page.evaluate(d => {
  const day = document.querySelector(`#eWeek .day[data-day="${d}"]`)
  if (!day) return 'no day'
  const t = day.innerText
  const freeLines = (t.match(/[^\n]*\bfree\b[^\n]*/gi) || []).slice(0, 8)
  const chips = [...day.querySelectorAll('.oilcount')].map(e => (e.innerText || '').trim())
  return { freeLines, chips, hasAvailPanel: /Available crew/i.test(t) }
}, di)
console.log(' the count chips on the day :', JSON.stringify(two.chips))
console.log(' the Available-crew panel is on this week:', two.hasAvailPanel)
console.log(' every line on the day using the word "free":')
for (const l of (two.freeLines || [])) console.log('    ', l.trim().slice(0, 110))
await shot(page, 'SURF-33-two-free-answers')
console.log('\nerrors:', errors.slice(0, 6))
await browser.close()
