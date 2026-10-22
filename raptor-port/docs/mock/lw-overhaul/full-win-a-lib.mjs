// The app's own window pieces, shared by the window drawings (full-win-a.mjs, full-win-b.mjs).
// the app's own window pieces
export const H = {
  hd: (who, dt) => `<div class="bidsheet-hd"><span class="who">${who}</span><span class="dt">${dt}</span><button class="x" aria-label="Close">✕</button></div>`,
  row: (lab, inner, extra = '') => `<div class="bidsheet-row ${extra}"><span class="lab">${lab}</span>${inner}</div>`,
  crow: (name, val, sub, btn = '') => `<div class="crow-wrap"><button class="crow"><span class="crow-top"><span class="cn">${name}</span><span class="ct fbox">${val}</span></span><span class="csub">${sub}</span></button>${btn ? `<span class="cmove">${btn}</span>` : ''}</div>`,
  st: s => s === 'appr' ? '<span class="c appr">Approved</span>' : s === 'ref' ? '<span class="c ref">Refused</span>' : '<span class="c zz-wait">Waiting</span>',
}
// put new content into a real window that is open (the last one on screen)
export const fill = (p, html, sel = '.bidsheet') => p.evaluate(([html, sel]) => { const d = [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width).pop(); if (!d) return 'none'; d.innerHTML = html; d.classList.add('zz-new'); return 'ok' }, [html, sel])

