// The doc-chip read's note 2: a LONG file name on the iPhone's engine — the name, now a button, still cut with "…" at its
// width, the chip one line, its ✕ in reach; one picture, at three times the pixels.
process.env.LW_PORT ||= '4195'
process.env.LW_OUT ||= '2026-11-01-lw-next-batch/docchip-close'
const fs = await import('node:fs')
const H = await import('./lw-m3b-w2-lib.mjs')
const { L, T } = H
fs.mkdirSync(H.OUT, { recursive: true })
const w = await H.phoneCtx('webkit'), P = w.page
await L.signInPlain(w, 'admin', '2026-02-15')
await L.openCellR(w, 'bane', '2026-02-23'); await P.waitForSelector(T('bid-picker'))
await L.setDoc(w, T('bid-doc-row'), 'leave-application-approved-by-the-commanding-officer-2026.pdf')
const m = await P.evaluate(sel => { const c = document.querySelector(`${sel} .docchip`), n = c.querySelector('.docname'), x = c.querySelector('.docdel'); const r = c.getBoundingClientRect(); return { chipH: Math.round(r.height), chipW: Math.round(r.width), nameCut: n.scrollWidth > n.clientWidth, nameW: Math.round(n.getBoundingClientRect().width), xIn: x.getBoundingClientRect().right <= r.right + 0.5 } }, T('bid-doc-row'))
const box = await P.locator(T('bid-rmk-row')).boundingBox()
await P.screenshot({ path: `${H.OUT}/chip-long-webkit.png`, clip: { x: 0, y: box.y - 6, width: 402, height: box.height + 12 } })
console.log('long name, WebKit phone:', JSON.stringify(m))
await w.ctx.close(); await H.closeBrowser()
