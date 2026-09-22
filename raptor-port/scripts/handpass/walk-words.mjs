/* THE SCREEN-LEVEL WORDING BATCH — findings 9, 11, 12, 8, 10, 17 from
   docs/handpass/parts/blocks-g.md. None can be settled by reading code; every
   one needs the app on screen, and 12 needs it at 390px. */
import { open, board, openInputs, tap, shot, SHOTS } from './lib.mjs'
const L = []; const S = (k, v) => { L.push({ [k]: v }); return v }

/* ---------- 9: the VIEWER'S OWN puck draws no green stripe -------------- */
{
  const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
  await board(page, 5)
  const me = await page.evaluate(() => window.ME)
  S('9 — viewing as', await page.evaluate(m => ((window.PEOPLE[m] || {}).cs || m), me))
  S('9 — the stripe, mine vs everyone else', await page.evaluate((m) => {
    const pucks = [...document.querySelectorAll('#schedBoard .puck')].filter(e => e.offsetParent)
    const grab = (p) => {
      const cs = getComputedStyle(p, '::before')
      return { cls: (p.className || '').toString().slice(0, 44),
               before: cs.background.slice(0, 40) + ' | w=' + cs.width + ' h=' + cs.height,
               bg: getComputedStyle(p).backgroundImage.slice(0, 60) }
    }
    const mine = pucks.filter(p => (p.getAttribute('data-person') || '') === m || /\bme\b/.test((p.className || '').toString()))
    const oil = pucks.filter(p => /oil/.test((p.className || '').toString()))
    return { pucks: pucks.length, mineFound: mine.length,
             mine: mine.slice(0, 2).map(grab), withOilClass: oil.slice(0, 2).map(grab) }
  }, me))
  await shot(page, 'w09-own-puck')
  await browser.close()
}

/* ---------- 11: the board never shows the ALL AVAIL count -------------- */
{
  const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
  await board(page, 5)
  S('11 — the board ALL AVAIL row', await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#schedBoard .sb-arow, #schedBoard .sb-line')].filter(e => e.offsetParent)
      .filter(r => /ALL AVAIL/i.test(r.textContent || ''))
    return rows.map(r => ({ txt: (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 74),
                            hasANumber: /\b\d{1,2}\b/.test((r.textContent || '').replace(/\d+:\d+/g, '')),
                            puckTitle: (r.querySelector('.puck')?.title || '').slice(0, 74) }))
  }))
  await tap(page, '#sbOil'); await page.waitForTimeout(800)
  S('11 — and inside the mode', await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#schedBoard .sb-arow, #schedBoard .sb-line')].filter(e => e.offsetParent)
      .filter(r => /ALL AVAIL/i.test(r.textContent || ''))
    return rows.map(r => ({ txt: (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 74) }))
  }))
  await shot(page, 'w11-board-allavail')
  await browser.close()
}

/* ---------- 10: "tap to see each one" on the count chip ---------------- */
{
  const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
  await page.waitForTimeout(700)
  S('10 — where the promise appears', await page.evaluate(() => {
    const hits = [...document.querySelectorAll('*')].filter(e => e.children.length < 3 && /tap to see each one/i.test(e.textContent || ''))
    return hits.slice(0, 3).map(e => ({ tag: e.tagName, cls: (e.className || '').toString().slice(0, 30),
      txt: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 74),
      clickableAttrs: [...e.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name).join(' ') || 'NONE' }))
  }))
  await browser.close()
}
console.log(JSON.stringify(L, null, 1)); console.log('shots in ' + SHOTS)
