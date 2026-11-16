import * as H from './wwf-w2-lib.mjs'
const X = await H.init('explore4', false)
const { say, sleep, pic } = X
const w = await X.open({})
const { page } = w
await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
const r = await page.evaluate(() => [...document.querySelectorAll('button, a, summary, [role=button], [data-legend], [id]')].filter(e => e.offsetWidth && /legend|sign out|log ?out|logout|signout/i.test((e.innerText || '') + (e.id || '') + (e.title || '') + (e.getAttribute('aria-label') || '') + (e.className || ''))).slice(0, 15).map(e => e.tagName + '#' + e.id + '.' + e.className + ' [' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 40) + '] data=' + JSON.stringify(e.dataset)))
say('controls', JSON.stringify(r, null, 1))
const m = await page.evaluate(() => [...document.querySelectorAll('.menu button, #menu *, .sidebar *, nav *')].filter(e => e.offsetWidth && e.children.length === 0 && e.innerText).slice(0, 30).map(e => e.tagName + '#' + e.id + ':' + e.innerText.slice(0, 25)))
say('nav', JSON.stringify(m))
await X.fin(w)
