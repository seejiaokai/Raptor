/* JOB 6 / D19 — a weekend NO LEAVE WAR PERIOD COVERS must NAME the reason and
   OFFER the way out, instead of promising money nobody can ever be paid.
   Reached by stepping the board forward past the war's last year (the route
   walk-a9 found). */
import { open, go, board, tap, type, put, shot, SHOTS } from './lib.mjs'
const { browser, page, errors } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
const L = []; const S = (k, v) => { L.push({ [k]: v }); return v }
await go(page, 'editsched'); await board(page, 5)

/* the board's own week arrows are [data-sbweek="-1"|"1"]; the week is named in
   CURWEEK (dd/mm/yyyy). The day objects carry `dt`, not an iso. */
let landed = null
for (let i = 0; i < 110; i++) {
  const wk = await page.evaluate(() => window.CURWEEK)
  /* 2028, NOT 2027. The demo Leave War carries TWO periods — "JAN - DEC 26"
     and "JAN - DEC 27", both visible in its own PERIOD selector — so every day
     in 2027 IS held by a war and the advisory is correctly silent there. The
     grid only draws the SELECTED period's cells (353 of them, all 2026), which
     reads exactly like "the war stops at 2026" and is why 2027 looked
     uncovered. Read the period selector, not the cells. */
  if (/^\d\d\/02\/2028$/.test(String(wk))) { landed = wk; break }
  const nxt = page.locator('#schedBoard [data-sbweek="1"]:visible')
  if (!await nxt.count()) break
  await nxt.click({ force: true }); await page.waitForTimeout(330)
}
S('a Saturday past the war', landed)
await shot(page, 'j6-01-saturday-outside-the-war')

/* THE ADVISORY ONLY SPEAKS ON A DAY THAT HAS SOMEBODY DOWN TO EARN
   (`oilWouldEarn` in validate.ts) — deliberately silent on an empty weekend.
   So build one: a ground row 08:00–18:00 with a man on it, through the
   board's own controls. */
await tap(page, '[data-gradd="5"]'); await page.waitForTimeout(600)
const gi = await page.evaluate(() => (window.DAYS[5].ground || []).length - 1)
await type(page, `[data-bfld="gr:5.${gi}.prog"]`, 'SDO')
await type(page, `[data-bfld="gr:5.${gi}.str"]`, '08:00')
await type(page, `[data-bfld="gr:5.${gi}.end"]`, '18:00')
const free = await page.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')]
  .map(e => e.dataset.person).filter(p => window.PEOPLE[p] && !/^all/i.test(p)).slice(0, 25))
const man = await put(page, `[data-fill="g:5.${gi}.+"]`, free)
S('a man down to earn on the 2027 Saturday', await page.evaluate(p => ((window.PEOPLE[p] || {}).cs || p), man))
await page.waitForTimeout(700)

const checks = () => page.evaluate(() => {
  const side = document.querySelector('#sbSide')
  const txt = (side?.innerText || '').replace(/\s+/g, ' ').trim()
  const cut = txt.indexOf('PLACEHOLDERS')
  const warns = (cut > 0 ? txt.slice(0, cut) : txt)
  return {
    namesTheYear: /no leave war period|leave war period .* (does not|doesn't) exist|period for 20\d\d/i.test(warns),
    saysPublishBeforeTheDayIsOut: /publish it before the day is out/i.test(warns),
    offersTheWayOut: [...(side?.querySelectorAll('button,a') || [])].filter(e => e.offsetParent)
      .map(e => (e.innerText || '').trim()).filter(Boolean).slice(0, 6),
    warnings: warns.slice(0, 330),
  }
})
S('does a period cover this day?', await page.evaluate(() => ({
  oilNoPeriod: window.HOOKS ? String(window.HOOKS.oilNoPeriod(5)) : 'HOOKS not exposed',
  oilWouldEarn: window.oilWouldEarn ? window.oilWouldEarn(5) : 'n/a',
})))
S('the day, as the SCHEDULER sees it', await checks())
await shot(page, 'j6-02-scheduler-checks')

/* ---- D19's OTHER HALF: the way out sits beside the reason ------------- */
await page.evaluate(() => {
  const t = [...document.querySelectorAll('#sbSide *')].find(e => /tap to review/i.test(e.innerText || '') && e.children.length < 3)
  t && t.click()
})
await page.waitForTimeout(700)
S('THE WAY OUT', await page.evaluate(() => {
  const b = document.querySelector('[data-mkperiod]')
  return b ? { label: (b.innerText || '').trim(), year: b.getAttribute('data-mkperiod'),
               says: (b.title || '').slice(0, 110) } : 'NO ACTION OFFERED'
}))
await shot(page, 'j6-03-the-way-out')

const mk = page.locator('[data-mkperiod]').first()
if (await mk.count()) {
  await mk.click(); await page.waitForTimeout(1600)
  S('after pressing it', await page.evaluate(() => ({
    page: window.CURPAGE,
    periodsOnOffer: [...document.querySelectorAll('button,span,a')].filter(e => e.offsetParent)
      .map(e => (e.innerText || '').trim()).filter(t => /JAN\s*-\s*DEC\s*2\d/i.test(t)).slice(0, 6),
    stage: (() => { const t = (document.body.innerText || '').replace(/\s+/g, ' ')
      const m = t.match(/STAGE[^A-Z]*([A-Z ]{3,24})/); return m ? m[1].trim().slice(0, 24) : null })(),
  })))
  await shot(page, 'j6-04-period-created')
}
await browser.close()

/* ---- and the MEMBER is offered nothing -------------------------------- */
const m = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json', who: 'u' })
await m.page.waitForTimeout(800)
S('the member', await m.page.evaluate(() => ({
  hasBoard: !!document.querySelector('#schedBoard'),
  anyCreateAction: document.querySelectorAll('[data-mkperiod]').length,
})))
await m.browser.close()
console.log(JSON.stringify(L, null, 1)); console.log('errors:', errors.slice(0, 4))
console.log('shots in ' + SHOTS)
