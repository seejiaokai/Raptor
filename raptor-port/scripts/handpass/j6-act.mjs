/* D19's WAY OUT, OPERATED — press it on the BOARD and watch the period appear
   in draft and the scheduler land on the Leave War. Then the phone width, then
   the member, who must be offered nothing. */
import { open, go, board, tap, type, put, shot, SHOTS } from './lib.mjs'
const L = []; const S = (k, v) => { L.push({ [k]: v }); return v }

const to2028 = async (page) => {
  await go(page, 'editsched'); await board(page, 5)
  for (let i = 0; i < 110; i++) {
    const wk = await page.evaluate(() => window.CURWEEK)
    if (/^\d\d\/02\/2028$/.test(String(wk))) break
    const n = page.locator('#schedBoard [data-sbweek="1"]:visible')
    if (!await n.count()) break
    await n.click({ force: true }); await page.waitForTimeout(320)
  }
  await tap(page, '[data-gradd="5"]'); await page.waitForTimeout(600)
  const gi = await page.evaluate(() => (window.DAYS[5].ground || []).length - 1)
  await type(page, `[data-bfld="gr:5.${gi}.prog"]`, 'SDO')
  await type(page, `[data-bfld="gr:5.${gi}.str"]`, '08:00')
  await type(page, `[data-bfld="gr:5.${gi}.end"]`, '18:00')
  const free = await page.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')]
    .map(e => e.dataset.person).filter(p => window.PEOPLE[p] && !/^all/i.test(p)).slice(0, 25))
  await put(page, `[data-fill="g:5.${gi}.+"]`, free)
  await page.waitForTimeout(600)
  const t = page.locator('#schedBoard [data-sbwtog]:visible').first()
  if (await t.count()) { await t.click({ force: true }); await page.waitForTimeout(600) }
}

/* ---- desktop: press it ------------------------------------------------- */
{
  const { browser, page, errors } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
  await to2028(page)
  await shot(page, 'j6a-01-board-desktop')
  S('the board offers', await page.evaluate(() => {
    const b = document.querySelector('#schedBoard [data-mkperiod]')
    return b ? { label: (b.innerText || '').trim(), visible: !!b.offsetParent } : 'NOTHING'
  }))
  await tap(page, '[data-mkperiod]')
  await page.waitForTimeout(1800)
  S('after pressing it', await page.evaluate(() => {
    const t = (document.body.innerText || '').replace(/\s+/g, ' ')
    return {
      page: window.CURPAGE,
      periodsOffered: [...new Set((t.match(/JAN\s*-\s*DEC\s*\d\d/gi) || []))],
      stage: (t.match(/STAGE\s+([A-Z ]{3,22})/) || [])[1]?.trim() || null,
      says: (document.getElementById('toastEl')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120),
    }
  }))
  await shot(page, 'j6a-02-period-created')
  S('errors', errors.slice(0, 4))
  await browser.close()
}

/* ---- phone width: is it reachable, and does it fit? -------------------- */
{
  const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json', width: 390, height: 844 })
  await to2028(page)
  await shot(page, 'j6a-03-board-phone')
  S('on a phone', await page.evaluate(() => {
    const b = document.querySelector('[data-mkperiod]')
    if (!b) return 'NOTHING'
    const r = b.getBoundingClientRect()
    const row = b.closest('.wln')
    const rr = row && row.getBoundingClientRect()
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return { label: (b.innerText || '').trim(),
             size: { w: Math.round(r.width), h: Math.round(r.height) },
             rowHeight: rr ? Math.round(rr.height) : null,
             withinTheRow: !!(rr && r.right <= rr.right + 1),
             pressable: !!(top && (top === b || b.contains(top))) }
  }))
  await browser.close()
}

/* ---- the member is offered nothing ------------------------------------- */
{
  const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json', who: 'u' })
  await page.waitForTimeout(900)
  S('the member', await page.evaluate(() => ({ createActions: document.querySelectorAll('[data-mkperiod]').length })))
  await browser.close()
}
console.log(JSON.stringify(L, null, 1)); console.log('shots in ' + SHOTS)
