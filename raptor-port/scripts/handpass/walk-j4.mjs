/* JOB 4 — a day that STOPPED being a holiday says so.
   R-1 runs both directions; only the forward one spoke. A day published as a
   holiday that the war later stops calling one goes on paying off its FROZEN
   block — correct, money comes from the issued document — while the screen
   said nothing, so the scheduler saw a day that is no longer a holiday, men
   still credited, and no way to tell which was right.

   Precondition (validate.ts): !earnsOil && dayApproved(di) && the frozen
   snapshot's own oilev.earns. So: tag a WEEKDAY as PH, publish it, untag it. */
import { open, go, board, tap, type, put, shot, SHOTS } from './lib.mjs'
const L = []; const S = (k, v) => { L.push({ [k]: v }); return v }
const { browser, page, errors } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
/* FRIDAY 17 JUL, not the Wednesday. A publish is REFUSED while a day carries
   hard conflicts, and the demo's Mon–Thu all do (2, 2, 2, 3 of them); Friday is
   the one clean weekday — 0 hard, 0 warnings — so it is the only one this
   fixture can be built on through the app's own publish control. */
const DI = 4, ISO = '2026-07-17'

/* The event sheet needs a NAME before it will take a tag — it says so:
   "Type a word before tagging it." So: type the event, pick the tag, Save. */
const tagDay = async (label, name) => {
  await go(page, 'leavewar'); await page.waitForTimeout(1400)
  await page.locator(`[data-testid="event-0-${ISO}"]`).first().click({ force: true })
  await page.waitForTimeout(900)
  if (name) { await page.locator('input.evtext').first().fill(name); await page.waitForTimeout(300) }
  const b = page.locator('.evtagrow button', { hasText: new RegExp('^' + label + '$', 'i') }).first()
  const had = await b.count()
  if (had) { await b.click(); await page.waitForTimeout(400) }
  await page.locator('button', { hasText: /^Save$/ }).first().click()
  await page.waitForTimeout(1400)
  return { pickedTag: had ? label : 'TAG BUTTON NOT FOUND',
           cell: await page.locator(`[data-testid="event-0-${ISO}"]`).first().evaluate(e => (e.innerText || '').trim()) }
}

S('tagged the Wednesday', await tagDay('PH', 'National Day'))
await go(page, 'editsched'); await board(page, DI)
S('does it earn now?', await page.evaluate(d => ({ earns: window.oilWouldEarn ? 'n/a' : 'n/a',
  oilBtn: !!document.querySelector('#schedBoard #sbOil'), men: Object.keys(window.oilDayFigures(d) || {}).length }), DI))

/* somebody down to earn, then publish the day */
await tap(page, `[data-gradd="${DI}"]`); await page.waitForTimeout(600)
const gi = await page.evaluate(d => (window.DAYS[d].ground || []).length - 1, DI)
await type(page, `[data-bfld="gr:${DI}.${gi}.prog"]`, 'SDO')
await type(page, `[data-bfld="gr:${DI}.${gi}.str"]`, '08:00')
await type(page, `[data-bfld="gr:${DI}.${gi}.end"]`, '18:00')
const free = await page.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')]
  .map(e => e.dataset.person).filter(p => window.PEOPLE[p] && !/^all/i.test(p)).slice(0, 25))
await put(page, `[data-fill="g:${DI}.${gi}.+"]`, free)
await page.waitForTimeout(600)
S('men earning before publishing', await page.evaluate(d => Object.keys(window.oilDayFigures(d) || {}).length, DI))

/* SIGN THEN PUBLISH, THROUGH THE APP'S OWN CONTROLS (§7.7 — a fixture reached
   any other way is not the route being tested). Each sign-off is a <select
   data-sign="<role>" data-signday="<di>">; Publish day stays disabled until
   all four carry a name. */
const roles = await page.evaluate(d => [...document.querySelectorAll(`[data-signday="${d}"]`)]
  .filter(e => e.offsetParent).map(e => e.getAttribute('data-sign')), DI)
S('sign-off roles on this day', roles)
for (const r of roles) {
  const sel = page.locator(`[data-sign="${r}"][data-signday="${DI}"]:visible`).first()
  const opt = await sel.evaluate(e => { const o = [...e.options].find(o => o.value && !/^—/.test(o.text)); return o && o.value })
  if (opt) { await sel.selectOption(opt); await page.waitForTimeout(350) }
}
await page.waitForTimeout(600)
/* "Publish day" is drawn five times (desktop/phone board twins plus the week),
   so a bare :visible/.first() can press a copy nobody can see — go through
   tap(), which scopes to the board and presses where the element really is. */
S('Publish day enabled?', await page.evaluate(d => {
  const b = [...document.querySelectorAll(`[data-beak="${d}"]`)].filter(e => e.offsetParent)
  return b.length ? { copies: b.length, disabled: b.map(e => e.disabled) } : 'NONE VISIBLE'
}, DI))
await tap(page, `[data-beak="${DI}"]`); await page.waitForTimeout(1600)
S('what the publish raised', await page.evaluate(() => ({
  toast: (document.getElementById('toastEl')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 130),
  dialogs: [...document.querySelectorAll('[role=dialog],[class*=pop],[class*=confirm],[data-testid]')].filter(e => e.offsetParent && (e.innerText || '').length > 20)
    .map(e => ({ id: e.id, testid: e.getAttribute('data-testid'), cls: (e.className || '').toString().slice(0, 24),
                 txt: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 130),
                 btns: [...e.querySelectorAll('button')].map(b => (b.innerText || '').trim()).slice(0, 6) })).slice(0, 3),
})))
/* a publish may raise a confirm — answer it the way a scheduler would */
const conf = page.locator('[data-testid="oilconf"], [role=dialog]').first()
if (await conf.count() && await conf.isVisible()) {
  const ok = conf.locator('button', { hasText: /publish|yes|confirm|ok/i }).first()
  if (await ok.count()) { await ok.click(); await page.waitForTimeout(1400) }
}
S('published?', await page.evaluate(d => window.dayApproved(d), DI))
await shot(page, 'j4-01-published-as-a-holiday')

/* now the war stops calling it a holiday */
S('untagged it', await tagDay('Work', null))
await go(page, 'editsched'); await board(page, DI)
await page.waitForTimeout(800)
const t = page.locator(`#schedBoard [data-sbwtog]:visible`).first()
if (await t.count()) { await t.click({ force: true }); await page.waitForTimeout(600) }
S('WHAT THE DAY NOW SAYS', await page.evaluate(() => {
  const txt = (document.getElementById('sbWarn')?.innerText || '').replace(/\s+/g, ' ').trim()
  return { saysItStopped: /stopped being a holiday/i.test(txt), text: txt.slice(0, 260) }
}))
await shot(page, 'j4-02-stopped-being-a-holiday')
console.log(JSON.stringify(L, null, 1)); console.log('errors:', errors.slice(0, 5))
console.log('shots in ' + SHOTS)
await browser.close()
