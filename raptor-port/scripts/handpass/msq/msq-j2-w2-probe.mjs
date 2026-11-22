/* msq-j2-w2-probe v2 — W2's look at Quals edit mode and Admin → Data (reading only) */
process.env.MSQ_WHO = 'w2'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'probe2'
const H = await (await import('./msq-j2-w2-h.mjs')).mk()
const { X, U, say, sleep } = H
say('msq-j2-w2-probe v2')
const w = await X.open({ user: 'ad2' })
const p = w.page
await X.L.go(p, 'quals'); await sleep(1500)
await p.getByRole('button', { name: /^.?\s*Edit$/ }).first().click(); await sleep(900)
await X.pic(w, 'p2-quals-edit')
const info = await p.evaluate(() => {
  const els = [...document.querySelectorAll('input,select,textarea')].filter(e => e.offsetWidth > 1)
  const tr = els.find(e => e.value === 'Saber')?.closest('tr')
  const rowEls = tr ? [...tr.querySelectorAll('input,select,textarea,button')].filter(e => e.offsetWidth > 1).map(e => e.tagName + '[' + (e.getAttribute('aria-label') || e.title || e.className).toString().slice(0, 25) + ']=' + (e.value || e.textContent || '').slice(0, 20)) : null
  return { n: els.length, vals: els.slice(0, 12).map(e => e.tagName + ':' + e.value.slice(0, 15)), rowEls, tr: !!tr }
})
say('quals edit', JSON.stringify(info))
await X.L.go(p, 'admin'); await sleep(900)
await p.getByRole('button', { name: /^Data/ }).first().click(); await sleep(900)
await X.pic(w, 'p2-admin-data')
say('data buttons', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetWidth > 1).map(e => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40)))))
await X.fin(w)
