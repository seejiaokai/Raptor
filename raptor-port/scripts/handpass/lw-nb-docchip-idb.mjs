// A side check of the doc-chip walk (2 Nov 26): after a sign-in again (a reload), WebKit's member walk found the admin's files
// gone ("No document on file", the chip named "document") while Chromium kept them. Is that the test browser's own store, the
// same before this change? Reads the document drawer (IndexedDB raptor-docs) before and after a reload, in each engine.
process.env.LW_PORT ||= '4195'
process.env.LW_OUT ||= '2026-11-01-lw-next-batch/docchip-idb'
const fs = await import('node:fs')
const H = await import('./lw-m3b-w2-lib.mjs')
const { L, T } = H
fs.mkdirSync(H.OUT, { recursive: true })
const drawer = P => P.evaluate(() => new Promise(res => { try { const r = indexedDB.open('raptor-docs'); r.onsuccess = () => { const db = r.result; const names = [...db.objectStoreNames]; if (!names.length) return res('no stores'); const tx = db.transaction(names[0], 'readonly'); const c = tx.objectStore(names[0]).count(); c.onsuccess = () => res(`${c.result} kept`); c.onerror = () => res('count failed: ' + c.error) }; r.onerror = () => res('open failed: ' + r.error) } catch (e) { res('threw ' + e) } }))
for (const engine of ['chromium', 'webkit']) {
  const w = await H.phoneCtx(engine), P = w.page
  const toasts = []
  P.on('console', m => toasts.push(m.text().slice(0, 120)))
  await L.signInPlain(w, 'admin', '2026-02-15')
  await L.openCellR(w, 'bane', '2026-02-23'); await P.waitForSelector(T('bid-picker'))
  await L.setDoc(w, T('bid-doc-row'), 'probe.pdf')
  await P.waitForTimeout(1500)
  const before = await drawer(P)
  const toast = await L.txt(P, '#toastEl, .toast')
  await L.placeLeave(w, 'LL')
  await L.signInPlain(w, 'admin', '2026-02-15')
  const after = await drawer(P)
  await L.openCellR(w, 'bane', '2026-02-23'); await P.waitForTimeout(500)
  const chip = await L.txt(P, `${T('bid-doc-row')} .docchip`)
  console.log(`${engine}: drawer after the pick ${before}; toast "${toast}"; after a reload ${after}; the chip reads "${chip}"; errors ${w.errs.length}`)
  await w.ctx.close()
}
await H.closeBrowser()
