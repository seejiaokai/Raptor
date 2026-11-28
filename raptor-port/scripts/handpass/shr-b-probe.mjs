// Walker b — probe: where the week draws the shared leave's rows (reads only). SZ=desk|phone
console.log('shr-b-probe v1')
const B = await (await import('./shr-b-lib.mjs')).setup('probe')
const { start, fileInput, go, sleep, log, weekRows, store, J } = B
const SZ = process.env.SZ || 'desk'
const w = await start(SZ)
const iid = await fileInput(w, 'P', B.WED, { type: 'LL', people: [B.RANGER, B.HEX], from: '08:00', to: '10:00' })
log('P', 'iid ' + iid)
await go(w.page, 'editsched'); await sleep(700)
const di = await w.page.evaluate(() => window.DAYS.findIndex(x => x.dt === 'Jul 15'))
log('P', 'di ' + di + ' days ' + J(await w.page.evaluate(() => window.DAYS.map(d => d.dow + ' ' + d.dt))))
log('P', 'store ' + J(await store(w.page)))
log('P', 'rows ' + J(await weekRows(w.page, di)))
const chain = await w.page.evaluate(di => { const e = [...document.querySelectorAll(`#eWeek .day[data-day="${di}"] [data-inp$="~bane.str"]`)][0]; if (!e) return 'none'; const out = []; let p = e; for (let i = 0; i < 6 && p; i++, p = p.parentElement) out.push(`${p.tagName.toLowerCase()}.${[...p.classList].join('.')}[${[...p.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',')}] w${Math.round(p.getBoundingClientRect().width)}`); return out }, di)
log('P', 'chain ' + J(chain))
const rowHtml = await w.page.evaluate(di => { const e = [...document.querySelectorAll(`#eWeek .day[data-day="${di}"] [data-inp$="~bane.str"]`)][0]; return e ? e.parentElement.outerHTML.slice(0, 1800) : 'none' }, di)
console.log('ROWHTML', rowHtml)
const ctl = await w.page.evaluate(di => ({
  signs: [...document.querySelectorAll(`#eWeek select[data-sign][data-signday="${di}"]`)].map(s => s.getAttribute('data-sign') + ' vis' + Math.round(s.getBoundingClientRect().width)),
  beak: [...document.querySelectorAll(`#eWeek [data-beak="${di}"], #eWeek [data-alpub="${di}"]`)].map(e => e.outerHTML.slice(0, 200)),
  pend: [...document.querySelectorAll('[class*="pend"], [data-pend], [id*="pend"]')].filter(e => e.getBoundingClientRect().width > 1).slice(0, 15).map(e => (e.id || e.className) + ': ' + (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60)),
  allch: [...document.querySelectorAll('button')].filter(b => /changes/i.test(b.textContent || '') && b.getBoundingClientRect().width > 1).map(b => (b.id || b.className) + ': ' + b.textContent.trim().slice(0, 40)),
  undo: document.getElementById('undoBtn')?.outerHTML.slice(0, 300),
}), di)
log('P', 'controls ' + J(ctl))
await B.pic(w, 'P', `probe-${SZ}-week-day`, [`#eWeek .day[data-day="${di}"]`], 'the day')
await B.done()
