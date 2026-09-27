/* RE-WALK copy of w1-09-probe-member-cal.mjs (26 Sep 26, the absence-record re-walk, W1): pictures go to docs/img/handpass/2026-09-26-absence/rewalk/w1/, results to docs/handpass/parts/2026-09-26-absence-rewalk-w1-*.txt; every change of premise or added check is marked RE-WALK. The first walk's script is untouched. */
/* W1 probe (26 Sep 26): what the MEMBER's Inputs calendar draws in July (whose chips), and the filter it opens with. */
process.env.AB_WHO = 'rewalk/w1'
const L = await import('./w1-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'm', dpr: 1 })
await L.inputsView(page, 'list')
const f = await page.evaluate(() => ({ person: document.querySelector('#fPerson, #inFPerson, select[aria-label*="erson" i]')?.value, selects: [...document.querySelectorAll('#page-inputs select, .inputs select')].map(s => (s.id || s.getAttribute('aria-label')) + '=' + s.value) }))
console.log('filters', JSON.stringify(f))
await L.calOpen(page, '2026-07')
await L.shot(page, 'w1-09-member-july')
console.log(JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#inpCal [data-icday]')].map(c => [c.getAttribute('data-icday'), [...c.querySelectorAll('[data-iid]')].map(e => e.innerText.trim()).join('|')]).filter(x => x[1]))))
console.log('pill', await page.evaluate(() => document.querySelector('#inpCal .ic-filterpill')?.innerText || 'none'))
console.log('errors', errors)
await browser.close()
/* the member's Inputs TABLE, widened to everyone: which rows carry an edit / delete control */
{
  const { browser, page } = await openHi({ width: 1440, height: 900, who: 'm', dpr: 1 })
  await L.inputsView(page, 'list')
  await page.selectOption('#inFPerson', 'all'); await page.waitForTimeout(400)
  await L.inputsWindow(page, '2026-07-13', '2026-07-24')
  const rows = await page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].map(tr => ({ who: (tr.cells[0]?.innerText || '').trim(), ctl: [...tr.querySelectorAll('button')].map(b => (b.innerText || b.getAttribute('aria-label') || '').trim()).join(' ') })))
  console.log('TABLE', JSON.stringify(rows.slice(0, 12)))
  await L.shot(page, 'w1-09-member-table-all')
  await browser.close()
}
