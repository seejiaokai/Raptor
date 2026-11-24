/* OPEN 7 looked into (chat 167): W14-newtab read "Kept 14 of 15" where the server answered every file "unchanged".
   Prints each app file's sizes as Chrome reports them, beside the server's own answer, on a first visit, a reload and a
   new tab — to prove which file is misread and why. */
import { serve, browserOf, fresh, DESK, sleep } from './timing-walk-lib.mjs'
const srv = await serve(); const cr = await browserOf()
const { ctx, page } = await fresh(cr, DESK)
const sizes = p => p.evaluate(() => performance.getEntriesByType('resource')
  .filter(e => /\.(js|css)$/.test(new URL(e.name).pathname) && !/timingwindow|TimingReadout/i.test(e.name))
  .map(e => ({ f: new URL(e.name).pathname.replace('/assets/', ''), t: e.transferSize, b: e.encodedBodySize, d: e.decodedBodySize, st: e.responseStatus })))
const show = (label, list, h0) => {
  const ans = {}; for (const h of srv.hits.slice(h0)) ans[h.p.replace('/assets/', '')] = h.st
  console.log(`\n${label}`)
  for (const e of list) console.log(`  ${e.f.padEnd(34)} transfer ${String(e.t).padStart(7)}  body ${String(e.b).padStart(7)}  decoded ${String(e.d).padStart(7)}  status ${e.st}  server ${ans[e.f] ?? 'not asked'}`)
}
let h0 = srv.hits.length
await page.goto(srv.base + '/?timing'); await page.waitForSelector('#timingRoot .timingwin', { timeout: 60000 }); await sleep(1200)
show('FIRST VISIT', await sizes(page), h0)
h0 = srv.hits.length
await page.reload(); await page.waitForSelector('#timingRoot .timingwin', { timeout: 60000 }); await sleep(1200)
show('RELOAD', await sizes(page), h0)
h0 = srv.hits.length
const p2 = await ctx.newPage(); await p2.goto(srv.base + '/?timing'); await p2.waitForSelector('#timingRoot .timingwin', { timeout: 60000 }); await sleep(1200)
show('NEW TAB', await sizes(p2), h0)
await cr.close(); await srv.close()
