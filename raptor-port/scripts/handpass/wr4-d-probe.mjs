// Walker d — probe: where the week and the Board draw a filed Training (its rows and their keys). Reads only.
import { setup } from './wr4-d-common.mjs'
console.log('wr4-d-probe v1')
const { L, A } = await setup('probe-r1')
const { newPage, signIn, fileInput, go, sleep, log, RANGER, HEX, WED } = L
const dump = (page, root) => page.evaluate(root => {
  const out = []
  for (const e of document.querySelectorAll(`${root} *`)) {
    const own = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim()
    if (!/range brief/i.test(own) && !/range brief/i.test(e.value || '')) continue
    const r = e.getBoundingClientRect()
    const chain = []; let p = e
    for (let i = 0; i < 7 && p; i++, p = p.parentElement) chain.push(`${p.tagName.toLowerCase()}${p.id ? '#' + p.id : ''}.${[...p.classList].join('.')}[${[...p.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',')}]`)
    const row = e.closest('tr') || e.parentElement?.parentElement
    const times = row ? [...row.querySelectorAll('*')].filter(x => /^\d\d:\d\d$/.test((x.value || x.textContent || '').trim()) && x.children.length === 0).map(x => `${x.tagName}[${[...x.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',')}]=${(x.value || x.textContent).trim()}`) : []
    out.push({ own, w: Math.round(r.width), chain, times })
  }
  return out
}, root)
const w = await newPage('desk'); await signIn(w, 'ad')
const iid = await fileInput(w, 'P', WED, { type: 'Training', people: [RANGER, HEX], from: '08:00', to: '10:00', title: 'Range brief' })
log('P', 'iid ' + iid)
await go(w.page, 'editsched'); await sleep(600)
const di = await w.page.evaluate(() => window.DAYS.findIndex(x => x.dt === 'Jul 15'))
log('P', 'di ' + di + ' day.input/events keys ' + JSON.stringify(await w.page.evaluate(di => Object.keys(window.DAYS[di]), di)))
console.log(JSON.stringify(await dump(w.page, '#eWeek'), null, 1))
await w.page.evaluate(i => window.openScheduler(i), di); await w.page.waitForSelector('#schedBoard'); await sleep(900)
console.log('BOARD', JSON.stringify(await dump(w.page, '#schedBoard'), null, 1))
console.log('BOARD pencils', JSON.stringify(await w.page.evaluate(i => [...document.querySelectorAll(`#schedBoard [data-inpedit]`)].map(e => ({ k: e.getAttribute('data-inpedit'), w: Math.round(e.getBoundingClientRect().width) })), iid)))
await A.done('probe-r1')
