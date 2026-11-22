/* msq-fr5-probe3 v1 — host probe: can Hunter see another squadron's day? Reads the top bar's squadron mark, presses it, lists selects. */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'probe3'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, say, sleep } = H
say('msq-fr5-probe3 v1')
const w = await X.open({ user: process.env.FR5_USER || 'ad2' })
const p = w.page
say('selects', await p.evaluate(() => [...document.querySelectorAll('select')].filter(s => s.getBoundingClientRect().width > 2).map(s => s.id + ':' + [...s.options].map(o => o.text).join('|').slice(0, 120)).join(' ;; ')))
say('unit-ish', await p.evaluate(() => [...document.querySelectorAll('[class*=unit],[class*=sqn],[id*=unit],[id*=sqn],[data-testid*=sqn],[data-testid*=unit],[aria-label*=quadron]')].map(e => e.tagName + '#' + e.id + '.' + e.className + ' ' + (e.getAttribute('data-testid') || '') + ' [' + e.textContent.trim().slice(0, 30) + ']').join(' ;; ')))
say('brand', await p.evaluate(() => { const e = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /^142/.test(e.textContent.trim())); return e ? e.parentElement.outerHTML.slice(0, 400) : 'none' }))
await X.L.go(p, 'editsched').catch(e => say('go editsched', e.message.split('\n')[0])); await sleep(1500)
await X.pic(w, 'probe3-edit')
say('page', await p.evaluate(() => window.CURPAGE))
await X.fin(w)
