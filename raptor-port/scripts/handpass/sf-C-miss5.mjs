import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, closeBoard, bPut, bType, bf, sleep, shot, rec, go, errors, switchRole, fileInput, warnLines } = L
const S = 'I'
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'editsched'); await p.evaluate(() => window.addWave(5, 'avalon')); await sleep(500)
await openBoard(p, 5)
await bPut(p, 5, 0, 0, 0, 'p', ['stiff']); await bPut(p, 5, 0, 0, 2, 'p', ['bane'])
await bType(p, bf(5, 0, 0, 'rl'), '18:30')
await closeBoard(p)
await switchRole(p, 'u')
const f = await fileInput(p, { type: 'LL', iso: '2026-07-18', remarks: 'SF calendar' })
await go(p, 'inputs'); await sleep(500)
await p.locator('#inCalBtn').click(); await sleep(600)
const probe = await p.evaluate(() => ({ prev: [...document.querySelectorAll('#page-inputs button')].filter(e => e.offsetParent && /‹|prev/i.test(e.innerText + e.getAttribute('aria-label'))).map(e => e.id + '|' + (e.dataset.testid || '') + '|' + e.innerText.trim()), title: (document.querySelector('[data-testid="in-cal-title"], #inpCal h2, .incal-title') || {}).innerText }))
console.log(JSON.stringify(probe))
for (let i = 0; i < 6; i++) {
  const t = await p.evaluate(() => (document.querySelector('#page-inputs').innerText.match(/(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER) \d{4}/) || [''])[0])
  if (/JULY 2026/.test(t)) break
  await p.locator('#page-inputs button').filter({ hasText: '‹' }).first().click(); await sleep(400)
}
const days = await p.evaluate(() => [...document.querySelectorAll('#page-inputs [data-testid]')].map(e => e.dataset.testid).filter(t => /18/.test(t)).slice(0, 6))
console.log(days)
await shot(p, 'I-1-member-calendar-july')
await p.getByText('Ranger · LL').first().click(); await sleep(900)
await shot(p, 'I-2-member-day-open')
const card = await p.evaluate(() => { const w = [...document.querySelectorAll('[role=dialog], .dayprev, .inpday, [class*=dayopen]')].filter(e => e.offsetParent); return w.map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 600)) })
rec(S, "the member's Inputs calendar for Sat 18 Jul after filing local leave on a flying AVALON SPARE", "RECORD what the card / calendar tell him about the clash", { days, card }, 'RECORD', 'C-I-2-member-day-open.png')
rec(S, 'browser error list', 'empty', errors, errors.length ? 'FAIL' : 'PASS')
await b.close()
