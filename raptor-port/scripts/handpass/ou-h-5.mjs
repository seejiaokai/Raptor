import { L, J, file, mark, inputsCal, FRI, FRI_ISO } from './ou-h-0.mjs'
const w = await L.world('desk'), p = w.page
try {
  const A = await file(w, FRI_ISO, 'bane', 'Range brief')
  await mark(w, FRI, A.id, 'cx')
  await inputsCal(w, '2026-07-13')
  const r = await p.evaluate(() => [...document.querySelectorAll('#inpCal *')].filter(e => /range brief/i.test(e.textContent || '') && e.children.length < 3 && e.getClientRects().length).slice(0, 3).map(e => { let x = e, out = []; for (let i = 0; i < 4 && x; i++, x = x.parentElement) out.push(x.tagName + '.' + String(x.className).slice(0, 30) + '[' + [...x.attributes].filter(a => /^data-|draggable/.test(a.name)).map(a => a.name + '=' + a.value.slice(0, 20)).join(',') + ']'); return out.join(' < ') }))
  console.log(J(r, null, 1))
  await L.pic(w, 'x-cal')
} finally { await L.close(w) }
