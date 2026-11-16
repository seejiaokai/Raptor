/* wwf w1 explore — phone week navigation. */
import * as H from './wwf-w1-lib.mjs'
const X = await H.init('explore', true)
const { say, sleep, pic } = X
const w = await X.open({ phone: true })
const { page } = w
await X.L.go(page, 'editsched'); await sleep(1000)
say('wk', await page.evaluate(() => [...document.querySelectorAll('.wk')].map(e => e.dataset.wk + ':' + (e.offsetWidth ? 'vis' : 'hid') + (e.className.includes('on') ? '*' : '')).join(' ')))
say('fn', await page.evaluate(() => Object.keys(window).filter(k => /week|Week|load/i.test(k)).join(' ')))
say('cal', await page.evaluate(() => [...document.querySelectorAll('[data-cal],[data-jump],#calBtn,[id*=alendar],[data-wkcal]')].map(e => e.tagName + '#' + e.id + '.' + e.className + (e.offsetWidth ? ' vis' : ' hid')).join(' ; ')))
await pic(w, 'p1')
await X.fin(w)
