/* msq-fr5-probe2 v2 — host probe: Hunter's Inputs form and any squadron switch in the top bar (desktop) */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'probe2'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, say, sleep } = H
say('msq-fr5-probe2 v2')
const w = await X.open({ user: 'ad2' })
const p = w.page
await X.L.go(p, 'inputs'); await sleep(1200)
if (!(await p.locator('#inNew:visible').count())) { await p.locator('#inListBtn').click(); await sleep(800) }
await p.locator('#inNew').click(); await sleep(1300)
say('types', await p.evaluate(() => [...document.querySelectorAll('#inpEditType option')].map(o => o.text).join(' | ')))
say('person', await p.evaluate(() => { const s = document.querySelector('#inpEditPerson'); return s ? JSON.stringify({ d: s.disabled, v: s.options[s.selectedIndex]?.text, n: s.options.length, o: [...s.options].map(o => o.text).slice(0, 40) }) : 'none' }))
await X.pic(w, 'probe2-new-input')
await p.keyboard.press('Escape'); await sleep(400)
say('click logo area, then pages', await p.evaluate(() => [...document.querySelectorAll('#topbar *, header *')].filter(e => e.children.length === 0 && /142|TALON/.test(e.textContent)).map(e => e.tagName + '#' + e.id + '.' + e.className).join(' ; ')))
await X.fin(w)
