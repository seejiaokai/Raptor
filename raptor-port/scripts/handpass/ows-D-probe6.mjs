import * as D from './ows-D-lib.mjs'
const { world, sleep, A, L, P } = D
const { browser, p, errors } = await world()
await L.go(p, 'leavewar'); await sleep(900)
const m = p.locator('[data-testid="month-JUL"]'); if (await m.count()) { await m.first().click(); await sleep(900) }
const c = p.locator('[data-testid="event-0-2026-07-14"]').first()
await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(250)
await c.click(); await sleep(600)
const info = await p.evaluate(() => { const s = document.querySelector('[data-testid="event-text"]'); const root = s ? (s.closest('[role=dialog]') || s.closest('.sheet') || s.parentElement.parentElement) : null
  return { testids: [...document.querySelectorAll('[data-testid^="event-"]')].filter(e => e.offsetParent !== null).map(e => `${e.dataset.testid}|${(e.innerText || '').trim().slice(0, 30)}`).slice(0, 40), txt: root ? root.innerText.replace(/\s+/g, ' ').slice(0, 600) : '' } })
console.log(JSON.stringify(info, null, 1))
await P(p, 'probe6-eventsheet')
await browser.close()
