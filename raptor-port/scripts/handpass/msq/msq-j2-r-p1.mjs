/* msq-j2-r-p1 v1 — probe: desktop Inputs new-input window as us9 */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'p1'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, say, sleep } = H
say('msq-j2-r-p1 v1')
const w = await X.open({ user: 'us9' })
const p = w.page
await X.L.go(p, 'inputs'); await sleep(1500)
await X.pic(w, 'p01-inputs')
say('buttons', await p.evaluate(() => [...document.querySelectorAll('#page-inputs button')].filter(b => b.getBoundingClientRect().width > 2).map(b => b.id + '[' + b.textContent.trim().slice(0, 20) + ']').join(' ')))
if (!(await p.locator('#inNew:visible').count())) { await p.locator('#inListBtn').click(); await sleep(800) }
await p.locator('#inNew').click(); await sleep(1500)
await X.pic(w, 'p02-new')
say('person', await p.evaluate(() => { const s = document.querySelector('#inpEditPerson'); return s ? [s.disabled, [...s.options].map(o => o.text).join('|'), s.options[s.selectedIndex]?.text] : null }))
say('type', await p.evaluate(() => [...document.querySelectorAll('#inpEditType option')].map(o => o.value + '=' + o.text).join(' | ')))
say('win', await H.U.bodyText(p).then(t => t.slice(0, 900)))
say('ids', await p.evaluate(() => [...document.querySelectorAll('.inped-win [id]')].map(e => e.id).join(',')))
await X.fin(w)
