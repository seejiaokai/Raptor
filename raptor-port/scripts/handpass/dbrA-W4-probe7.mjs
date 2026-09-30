/* W4 probe 7 (30 Sep 26) — read-only: what a restored documents-drawer record holds (is its file still a Blob?). */
process.env.HP_URL ||= 'http://localhost:4204'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W4'
process.env.HP_OUT ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/dbrA-W4-probe.json'
const L = await import('./dbrA-lib.mjs')
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/dbrA-W4-oldstate.json'
const b = await L.launch(); const ctx = await L.context(b, { storageState: STATE }); const errors = []; const p = await L.page(ctx, errors)
await p.goto(L.BASE + '/')
console.log(JSON.stringify(await p.evaluate(async () => {
  const db = await new Promise((res, rej) => { const r = indexedDB.open('raptor-docs'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error) })
  const all = await new Promise(res => { const t = db.transaction('docs').objectStore('docs').getAll(); t.onsuccess = () => res(t.result) })
  return all.map(r => ({ id: r.id, name: r.name, mime: r.mime, size: r.size, blobIsBlob: r.blob instanceof Blob, blobType: Object.prototype.toString.call(r.blob), blobKeys: r.blob && typeof r.blob === 'object' ? Object.keys(r.blob).slice(0, 5) : null }))
})))
const s = JSON.parse((await import('node:fs')).readFileSync(STATE, 'utf8'))
console.log(JSON.stringify(s.origins[0].indexedDB[0].stores[0].records[0]).slice(0, 400))
await b.close()
