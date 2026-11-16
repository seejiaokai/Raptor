process.env.WWW_RUN ||= 'probe-legend'
const H = await import('./www-w3-lib.mjs')
const { X, say, sleep, L } = H
const w = await X.open({ phone: process.env.PHONE === '1' })
await L.go(w.page, 'editsched'); await sleep(800)
const b = w.page.locator('button:visible, summary:visible, [role=button]:visible').filter({ hasText: /^\s*Legend/ }).first()
say('legend btn', await b.count())
if (await b.count()) { await b.click(); await sleep(600) }
await X.pic(w, 'legend-open')
const r = await w.page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().width > 0 && /Misses (flight|sim)|Wrong seat|Long day \(|Days in a row/.test((e.title || '') + (e.children.length === 0 ? e.innerText : ''))).map(e => ({ tag: e.tagName, cls: String(e.className).slice(0, 40), title: e.title, text: (e.innerText || '').slice(0, 60) })).slice(0, 40))
say(JSON.stringify(r, null, 1))
await X.fin(w)
