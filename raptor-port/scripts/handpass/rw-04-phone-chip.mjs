/* RE-WALK 4 — the walk's S1: on a phone, on the EDIT WEEK, the count chip
   overflowed into the RMKS column and the press opened the row's remarks box,
   so a scheduler could type a stray character into the schedule.
   Measured the same way the walk measured it: what sits on the chip's own
   pixels, and what a real press actually does. */
import { open, go, shot, STATE } from './lib.mjs'

const { browser, page, errors } = await open({ width: 390, height: 844, state: STATE })
await go(page, 'editsched')
await page.waitForTimeout(900)

/* put a lone placeholder on a Common Programme row and on a ground row — the
   two kinds the walk found, both on rows where the placeholder sits ALONE */
await page.evaluate(() => {
  const w = window
  w.DAYS[0].allhands = [{ prog: 'SAFETY BRIEF', str: '08:00', end: '10:00', who: 'allavail' }]
  w.DAYS[0].ground = [{ prog: 'STORES CHECK', str: '09:00', end: '11:00', who: 'allavail' }]
  w.afterSchedMutate()
})
await page.waitForTimeout(900)

const rows = await page.evaluate(async () => {
  const out = []
  for (const chip of document.querySelectorAll('#eWeek .day[data-day="0"] .oilcount')) {
    if (chip.offsetParent === null) continue
    /* a chip below the fold is not measurable by elementFromPoint — bring it on
       screen first, the same way a scheduler would by scrolling to the row */
    chip.scrollIntoView({ block: 'center' })
    await new Promise(r => setTimeout(r, 120))
    const cell = chip.closest('.ppl')
    const row = chip.closest('.ah-row,.pl-row')
    const c = chip.getBoundingClientRect(), p = cell.getBoundingClientRect()
    const hit = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2)
    out.push({
      row: ((row && row.querySelector('.nm')) || {}).innerText ? row.querySelector('.nm').innerText.replace(/\s+/g, ' ').trim().slice(0, 22) : '(row)',
      chip: (chip.innerText || '').trim(),
      spill: Math.round(c.right - p.right),
      inside: c.right <= p.right + 1 && c.left >= p.left - 1,
      onTop: !!hit && (hit === chip || chip.contains(hit)),
      landsOn: hit ? (hit.tagName + '.' + String(hit.className).split(' ').slice(0, 2).join('.')) : '(nothing)',
    })
  }
  return out
})
console.log('THE COUNT CHIP ON THE PHONE EDIT WEEK:')
for (const r of rows) console.log('  ', JSON.stringify(r))
await shot(page, 'RW-04-phone-editweek-chip')

/* and a REAL press — does the list open, or does a caret land in the schedule? */
const pressed = await page.evaluate(async () => {
  const chips = [...document.querySelectorAll('#eWeek .day[data-day="0"] .oilcount')]
  const chip = chips[chips.length - 1]      // the ground row — the one furthest down
  if (!chip) return '(no chip)'
  chip.scrollIntoView({ block: 'center' })
  await new Promise(r => setTimeout(r, 200))
  const c = chip.getBoundingClientRect()
  const el = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2)
  el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
  el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
  el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
  el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  return el.tagName + '.' + String(el.className).split(' ').slice(0, 2).join('.')
})
await page.waitForTimeout(900)
const after = await page.evaluate(() => {
  const t = document.getElementById('toastEl')
  return {
    pressLandedOn: null,
    toast: t ? { text: (t.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120), opacity: getComputedStyle(t).opacity } : '(no toast element)',
    focus: document.activeElement ? (document.activeElement.tagName + '.' + String(document.activeElement.className).split(' ').slice(0, 2).join('.')) : '(none)',
  }
})
console.log('\nthe press landed on:', pressed)
console.log('what happened:', JSON.stringify(after, null, 1))
await shot(page, 'RW-04-phone-press-result')
console.log('\nerrors:', errors.slice(0, 6))
await browser.close()
