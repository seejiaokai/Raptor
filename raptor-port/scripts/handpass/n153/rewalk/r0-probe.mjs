// r0 - the check lead's own short walk of the route: sign-in, Tracker, the layout editor, what a line's bend handle needs, and
// where a saved layout lives, at 1536 (mouse) and 402 (Chromium, touch).
import { signIn, closeAll, finish, picsFor, note, pic, step, mk, go, arrange, tool, T, savedLayouts, log } from './rlib.mjs'
console.log('r0-probe v1', process.env.MQ_PORT)
picsFor('r0-probe')
for (const sz of ['d', 'pc']) {
  await step('route ' + sz, async () => {
    const s = await mk(sz); const { page } = s
    await signIn(s, 'ad', 'a'); await go(s, 'tracker'); await page.waitForTimeout(1800)
    log(sz, 'tracker', await T(s))
    log(sz, 'layouts', Object.keys(await savedLayouts(s)).slice(0, 6))
    await arrange(s, true); await page.waitForTimeout(400)
    log(sz, 'tools', await page.evaluate(() => [...document.querySelectorAll('#arrTools button')].map(b => b.textContent.trim())))
    await pic(s, sz + '-01-editor')
    log(sz, 'chart parts', await page.evaluate(() => { const q = c => document.querySelectorAll('#flowSvg ' + c).length; return { ball: q('.ball'), edgehit: q('.edgehit'), linehit: q('.linehit'), lend: q('.lend'), linehandle: q('.linehandle'), endhandle: q('.endhandle'), port: q('.port') } }))
    log(sz, 'stores', await page.evaluate(async () => {
      const ls = []; for (let i = 0; i < localStorage.length; i++) ls.push(localStorage.key(i))
      const dbs = indexedDB.databases ? await indexedDB.databases() : []; const idb = {}
      for (const d of dbs) { const db = await new Promise(res => { const r = indexedDB.open(d.name); r.onsuccess = () => res(r.result); r.onerror = () => res(null) }); if (!db) continue
        for (const st of db.objectStoreNames) { idb[d.name + '/' + st] = await new Promise(done => { const q = db.transaction(st).objectStore(st).getAllKeys(); q.onsuccess = () => done(q.result.length + ' keys: ' + q.result.slice(0, 6).map(String).join(' , ')); q.onerror = () => done('err') }) } db.close() }
      return { ls: ls.slice(0, 40), idb }
    }))
    await tool(s, 'Edit lines'); await page.waitForTimeout(200)
    const e = page.locator('#flowSvg .edgehit').first()
    if (await e.count()) {
      const b = await e.boundingBox(); log(sz, 'edge box', b)
      await e.evaluate(n => n.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {})
      const r = await e.boundingBox(); const x = r.x + r.width / 2, y = r.y + r.height / 2
      if (s.desk) await page.mouse.click(x, y); else await page.touchscreen.tap(x, y)
      await page.waitForTimeout(400)
      log(sz, 'after a press on a link', await page.evaluate(() => { const q = c => document.querySelectorAll('#flowSvg ' + c).length; const h = document.querySelector('#flowSvg .linehandle'); return { linehandle: q('.linehandle'), endhandle: q('.endhandle'), box: h ? h.getBoundingClientRect().toJSON() : null } }))
      await pic(s, sz + '-02-link-selected')
    }
    await s.ctx.close()
  })
}
finish('r0-probe'); await closeAll()
