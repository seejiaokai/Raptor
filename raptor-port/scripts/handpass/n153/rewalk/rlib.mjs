// The re-walk of the nine night fixes (24 Nov 26), shared helpers on top of the first walk's (../walk/jlib.mjs, ja-lib.mjs).
// Run from raptor-port/ against the frozen build served by the check lead:
//   MQ_PORT=<4715|4716|4717> MQ_OUT=<scratchpad/rewalk/<walker>> MQ_PICS=../2026-11-24-msq-night-check/rewalk/<walker> node scripts/handpass/n153/rewalk/<script>
// Every step presses the app's own controls; the page is only READ here (saved records, what is drawn).
export * from '../walk/ja-lib.mjs'
import { note } from '../walk/jlib.mjs'

/* every saved chart layout, by key, as a short fingerprint: read-only, from the browser's own stores */
export const savedLayouts = s => s.page.evaluate(async () => {
  const hash = t => { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h.toString(36) + ':' + t.length }
  const out = {}
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/:lay:/.test(k)) out['ls|' + k] = hash(localStorage.getItem(k) || '') }
  const dbs = indexedDB.databases ? await indexedDB.databases() : []
  for (const d of dbs) {
    if (!d.name) continue
    const db = await new Promise(res => { const r = indexedDB.open(d.name); r.onsuccess = () => res(r.result); r.onerror = () => res(null) })
    if (!db) continue
    for (const st of db.objectStoreNames) {
      await new Promise(done => {
        const tx = db.transaction(st, 'readonly'), os = tx.objectStore(st), c = os.openCursor()
        c.onsuccess = () => {
          const x = c.result
          if (!x) return done()
          const k = String(x.key); const v = typeof x.value === 'string' ? x.value : JSON.stringify(x.value)
          if (/:lay:/.test(k) || /:lay:/.test(v.slice(0, 200))) out[`${d.name}/${st}|${k}`] = hash(v)
          x.continue()
        }
        c.onerror = () => done()
      })
    }
    db.close()
  }
  return out
})
/* EVERY saved Tracker record of a squadron, by key, as a short fingerprint (the store is localStorage,
   `raptor:tracker/u<unit>@<key>`): `trackerSaved(s, '149')`. Read-only. */
export const trackerSaved = (s, unit) => s.page.evaluate(unit => {
  const hash = t => { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h.toString(36) + ':' + t.length }
  const pre = `raptor:tracker/u${unit}@`, out = {}
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(pre)) out[k.slice(pre.length)] = hash(localStorage.getItem(k) || '') }
  return out
}, unit)
/* what differs between two readings */
export function layoutDiff(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]), changed = []
  for (const k of keys) if (a[k] !== b[k]) changed.push(k)
  return changed
}
/* the finger held down on a real touch screen (Chromium, by the browser's own touch input) */
export async function fingerDown(s, x, y) {
  const cdp = await s.ctx.newCDPSession(s.page)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] })
  return {
    cdp,
    async move(a, b, n = 8) { for (let i = 1; i <= n; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (a - x) * i / n, y: y + (b - y) * i / n, id: 1 }] }); await s.page.waitForTimeout(24) } x = a; y = b },
    async up() { await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach() },
  }
}
export const log = (...a) => note(a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '))
