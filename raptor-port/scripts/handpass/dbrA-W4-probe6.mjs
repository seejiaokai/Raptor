/* W4 probe 6 (30 Sep 26) — read-only: the medical documents drawer (IndexedDB raptor-docs) after the conversion. */
process.env.HP_URL ||= 'http://localhost:4204'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W4'
process.env.HP_OUT ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/dbrA-W4-probe.json'
const L = await import('./dbrA-lib.mjs')
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/dbrA-W4-oldstate.json'
const b = await L.launch(); const ctx = await L.context(b, { storageState: STATE }); const errors = []; const p = await L.page(ctx, errors)
await p.goto(L.BASE + '/')
const idb = () => p.evaluate(async () => {
  const dbs = indexedDB.databases ? await indexedDB.databases() : []
  const out = { dbs }
  for (const d of dbs) {
    const db = await new Promise((res, rej) => { const r = indexedDB.open(d.name); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error) })
    out[d.name] = {}
    for (const s of db.objectStoreNames) out[d.name][s] = await new Promise(res => { const t = db.transaction(s).objectStore(s).getAllKeys(); t.onsuccess = () => res(t.result.map(String)) })
    db.close()
  }
  return out
})
console.log('BEFORE SIGN-IN', JSON.stringify(await idb()))
await L.signIn(p, 'a', { goto: false })
console.log('AFTER', JSON.stringify(await idb()))
console.log('DOCIDS', JSON.stringify(await p.evaluate(() => window.INPUTS.filter(i => i.docIds && i.docIds.length).map(i => [i.iid, i.docIds]))))
console.log('ERR', errors)
await b.close()
