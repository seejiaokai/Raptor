/* msq-j2-r-p2 v1 — probe: Edit Schedule page editable fields as ad9 */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'p2'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, say, sleep } = H
say('msq-j2-r-p2 v1')
const w = await X.open({ user: 'ad9' })
const p = w.page
await X.L.go(p, 'editsched'); await sleep(2000)
await X.pic(w, 'p01-edit')
say('week btns', await p.evaluate(() => [...document.querySelectorAll('#eWeek button, #weekBar button, button')].filter(b => /^(Jul|Aug|Sep|Oct|Nov|Dec)/.test(b.textContent.trim()) && b.getBoundingClientRect().width > 2).map(b => b.textContent.trim()).join(' ')))
say('editable', await p.evaluate(() => [...document.querySelectorAll('[contenteditable],[data-fld],[data-bfld],[data-k]')].filter(b => b.getBoundingClientRect().width > 2).slice(0, 40).map(e => e.tagName + ' ' + [...e.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(' ') + ' "' + (e.textContent || '').trim().slice(0, 15) + '"').join('\n')))
await X.fin(w)
