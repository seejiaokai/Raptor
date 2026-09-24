/* Walker B2 (25 Sep 26) — probe the saved everything-week: which days are published, at which version, and who the
   sign-off selects offer. Reads only. */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b2'
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, book, head, STATE } = L
const { browser, page, errors } = await openHi({ width: 1440, height: 900, state: STATE, dpr: 1 })
await editWeek(page)
console.log(JSON.stringify(await book(page), null, 0))
for (let di = 0; di < 7; di++) console.log(di, JSON.stringify(await head(page, di)))
const opts = await page.evaluate(() => [...document.querySelectorAll('#eWeek select[data-sign][data-signday="1"]')].map(s => s.dataset.sign + ': ' + [...s.options].map(o => o.text).join(' | ')))
console.log(opts.join('\n'))
const kinds = await page.evaluate(() => {
  const d = document.querySelector('#eWeek .day[data-day="0"]')
  const slots = [...d.querySelectorAll('[data-slot]')].map(e => e.dataset.slot + (e.classList.contains('seat') ? '[seat]' : '[' + e.className.split(' ')[0] + ']') + (e.querySelector('.puck') ? '*' : ''))
  return slots.join('  ')
})
console.log(kinds)
console.log('errors', JSON.stringify(errors))
await browser.close()
