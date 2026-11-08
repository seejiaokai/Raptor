import { newWorld, openBoard, oilOn, sleep, close, shot, VERSION } from './oeb-w2-lib.mjs'
console.log(VERSION, 'explore6 row controls')
const w = await newWorld('pc', 'sat')
try {
  await openBoard(w)
  const d = await w.page.evaluate(() => {
    const out = []
    const rowOf = key => { const f = document.querySelector(`#sbBoard [data-bfld="${key}"]`); let r = f; for (let i = 0; i < 6 && r; i++, r = r.parentElement) { if (r.querySelectorAll('button,[data-act],[data-cx],[data-info]').length > 0 && r.querySelectorAll('[data-bfld]').length > 1) return r } return null }
    for (const k of ['gr:5.0.str', 'ap:5.1.str', 'sr:5.amt.1.end', 'dr:5.0.0.end']) {
      const r = rowOf(k); if (!r) { out.push(k + ' no row'); continue }
      out.push(k + ' row=' + r.tagName + '.' + r.className)
      for (const e of r.querySelectorAll('button,[role=button],[data-cx],[data-info],[data-gcx],[data-ginfo]')) out.push('   ' + e.tagName + '.' + String(e.className).replace(/\s+/g, '.') + ' ' + e.getAttributeNames().filter(a => a.startsWith('data-')).map(a => a + '=' + e.getAttribute(a)).join(',') + ' | ' + e.textContent.trim().slice(0, 20) + ' | ' + (e.title || ''))
    }
    out.push('sr fields: ' + [...document.querySelectorAll('#sbBoard [data-bfld^="sr:5"]')].map(e => e.dataset.bfld + '=' + e.value).join(' ; '))
    out.push('gr fields: ' + [...document.querySelectorAll('#sbBoard [data-bfld^="gr:5"]')].map(e => e.dataset.bfld + '=' + e.value).join(' ; '))
    out.push('dr fields: ' + [...document.querySelectorAll('#sbBoard [data-bfld^="dr:5"]')].map(e => e.dataset.bfld + '=' + e.value).join(' ; '))
    return out
  })
  console.log(d.join('\n'))
} finally { await close(w) }
