/* RE-WALK copy of w1-07-probe-ghostclick.mjs (26 Sep 26, the absence-record re-walk, W1): pictures go to docs/img/handpass/2026-09-26-absence/rewalk/w1/, results to docs/handpass/parts/2026-09-26-absence-rewalk-w1-*.txt; every change of premise or added check is marked RE-WALK. The first walk's script is untouched. */
/* W1 probe (26 Sep 26): a finger tap on a calendar chip opens its edit on the pointer-up, and the SAME tap's click
   (the one a phone sends after the finger lifts) then lands on the dialog that has just appeared. Where does it land?
   For every chip on the phone's July, open that chip's edit (by a finger tap) and record what the tap's click hit
   and whether the input survived. Diagnosis for the finding; the assertion lives in w1-05. */
process.env.AB_WHO = 'rewalk/w1'
const L = await import('./w1-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { browser, page, errors } = await openHi({ width: 390, height: 844, who: 'a', dpr: 3 })
const cdp = await L.touchOn(page)
await L.calOpen(page, '2026-07')
await page.evaluate(() => {
  window.__hit = []
  window.addEventListener('click', e => window.__hit.push((e.target.id ? '#' + e.target.id : '') + '.' + String(e.target.className || e.target.tagName).split(' ')[0] + ':' + (e.target.innerText || '').trim().slice(0, 14)), true)
})
const chips = await page.evaluate(() => [...document.querySelectorAll('#inpCal .ic-inrow [data-iid]')].map(e => ({ iid: e.getAttribute('data-iid'), day: e.closest('[data-icday]').getAttribute('data-icday'), t: e.title || '' })))
const seen = new Set(), out = []
for (const ch of chips) {
  if (seen.has(ch.iid + ch.day)) continue; seen.add(ch.iid + ch.day)
  if ((await L.calMonth(page)) !== 'July 2026') await L.calOpen(page, '2026-07')
  const c = await L.chipAt(page, ch.iid, ch.day)
  if (!c) continue
  const n0 = await page.evaluate(() => window.INPUTS.length)
  await page.evaluate(() => { window.__hit = [] })
  await L.finger(page, cdp, c, null, { holdMs: 50 })
  const d = await L.addDialog(page)
  const hit = await page.evaluate(() => window.__hit)
  const n1 = await page.evaluate(() => window.INPUTS.length)
  out.push(`${ch.day} ${ch.iid.slice(-4)} @${Math.round(c.x)},${Math.round(c.y)} dialog=${d.open ? 'OPEN' : 'closed'} click→${hit.join(',') || 'none'} inputs ${n0}→${n1}`)
  if (d.open) { await page.locator('#inpEditCancel').click().catch(() => {}); await page.waitForTimeout(250) }
  if (await page.locator('#inpCal .ic-pop').count()) { await page.locator('#icPopClose').click().catch(() => {}); await page.waitForTimeout(200) }
}
console.log(out.join('\n'))
const box = await page.evaluate(() => null)
console.log('errors', errors)
await browser.close()
