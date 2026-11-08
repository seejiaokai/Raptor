import { newWorld, openBoard, oilOn, sleep, close, shot, VERSION } from './oeb-w2-lib.mjs'
console.log(VERSION, 'explore4')
const w = await newWorld(process.env.SIZE || 'pc', 'sat')
try {
  await openBoard(w)
  await oilOn(w, true)
  const dump = await w.page.evaluate(() => {
    const out = new Map()
    for (const e of document.querySelectorAll('#sbBoard *')) {
      for (const a of e.getAttributeNames()) if (/^data-(oil|bfld)/.test(a) && a !== 'data-bfld') { const k = a + '=' + (a === 'data-oilp' ? '' : e.getAttribute(a)); out.set(k, (out.get(k) || 0) + 1) }
    }
    const items = [...document.querySelectorAll('#sbBoard [class*=oilitem],#sbBoard [class*=oilbar],#sbBoard .oilcount,#sbBoard [data-oilsent],#sbBoard [data-oilev],#sbBoard [data-oilrow]')].map(e => e.tagName + '.' + String(e.className).replace(/\s+/g, '.') + ' ' + [...e.getAttributeNames()].filter(a => a.startsWith('data-')).map(a => a + '=' + e.getAttribute(a)).join(',') + ' | ' + e.textContent.trim().slice(0, 25) + ' y=' + Math.round(e.getBoundingClientRect().top))
    const flds = [...document.querySelectorAll('#sbBoard [data-bfld]')].map(e => e.dataset.bfld + '=' + (e.value ?? '')).filter(s => /^(ff:5\.0|dr:5\.0|sr:5|gr:5|ap:5)/.test(s))
    return { attrs: [...out.entries()].slice(0, 40), items, flds }
  })
  console.log(JSON.stringify(dump.attrs)); console.log(dump.items.join('\n')); console.log(dump.flds.join(' ; '))
} finally { await close(w) }
