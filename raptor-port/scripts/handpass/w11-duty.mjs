/* HIS CASE, exactly: Sunday 19 Jul, a duty desk he adds himself 08:00-18:00,
   ALL AVAIL dropped on it, mode on, at phone width. No count showed. */
import { open, board, tap, type, put, shot, SHOTS } from './lib.mjs'
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE, width: 390, height: 844 })
const DI = 6                                   /* Sunday 19 Jul */
await board(page, DI)
/* a duty block, then a row on it */
const had = await page.evaluate(d => ((window.DAYS[d].dutywaves || []).length), DI)
if (!had) {
  await tap(page, `[data-dwadd="${DI}"]`); await page.waitForTimeout(900)
  const b = page.locator('button').filter({ hasText: /^(Plain|Blank|Empty|New block|Duty desk)/i }).first()
  if (await b.count()) { await b.click(); await page.waitForTimeout(800) } else { await page.keyboard.press('Escape') }
}
const blocks = await page.evaluate(d => ((window.DAYS[d].dutywaves || []).length), DI)
console.log('duty blocks:', blocks)
if (blocks) {
  await tap(page, `[data-dradd="${DI}.0"]`); await page.waitForTimeout(500)
  const ri = await page.evaluate(d => window.DAYS[d].dutywaves[0].rows.length - 1, DI)
  await type(page, `[data-bfld="dr:${DI}.0.${ri}.role"]`, 'SDO')
  await type(page, `[data-bfld="dr:${DI}.0.${ri}.str"]`, '08:00')
  await type(page, `[data-bfld="dr:${DI}.0.${ri}.end"]`, '18:00')
  /* a real man, then ALL AVAIL beside him — the shape in his picture */
  const free = await page.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')]
    .map(e => e.dataset.person).filter(p => window.PEOPLE[p] && !/^all/i.test(p)).slice(0, 12))
  await put(page, `[data-fill="d:${DI}.0.${ri}.+"]`, free)
  await page.waitForTimeout(500)
  await put(page, `[data-fill="d:${DI}.0.${ri}.+"]`, ['allavail'])
  await page.waitForTimeout(700)
  console.log('row now:', await page.evaluate(({ d, r }) => {
    const w = window.DAYS[d].dutywaves[0].rows[r]
    return JSON.stringify({ role: w.role, str: w.str, end: w.end, id: w.id, more: w.more })
  }, { d: DI, r: ri }))
}
await tap(page, `[data-oilmode="${DI}"]`); await page.waitForTimeout(1000)
console.log('THE DUTY ROW IN THE MODE:', JSON.stringify(await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#schedBoard .duty .sb-arow, #schedBoard .duty .sb-line')].filter(e => e.offsetParent)
  return rows.filter(r => /ALL AVAIL/i.test(r.textContent || '')).map(r => ({
    row: (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
    counts: r.querySelectorAll('.oilcount').length,
    pucks: [...r.querySelectorAll('.puck')].map(p => ({ who: p.getAttribute('data-person'), cls: (p.className || '').toString().slice(0, 40), title: (p.title || '').slice(0, 64) })),
  }))
}), null, 1))
/* ---- THE MONEY, not the drawing ---------------------------------------- */
console.log('WHAT THE DAY PAYS:', JSON.stringify(await page.evaluate((d) => {
  const f = window.oilDayFigures(d)
  const real = Object.keys(f).filter(k => (window.PEOPLE || {})[k])
  const fake = Object.keys(f).filter(k => !(window.PEOPLE || {})[k])
  return { menPaid: real.length, sample: real.slice(0, 6).map(k => ((window.PEOPLE[k] || {}).cs || k) + '=' + f[k]),
           nonPeopleKeys: fake, total: Object.keys(f).length }
}, DI), null, 1))
await shot(page, 'w11-duty-phone')
console.log('errors:', errors.slice(0, 4)); console.log('shots in ' + SHOTS)
await browser.close()
