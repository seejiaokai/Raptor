/* W14's finding, looked into (chat 164): what the browser reports for a file asked again and told "unchanged" */
import { serve, browserOf, fresh, DESK, sleep } from './timing-walk-lib.mjs'
const srv = await serve(); const cr = await browserOf()
const { page } = await fresh(cr, DESK)
const dump = () => page.evaluate(() => performance.getEntriesByType('resource').filter(e => /\.(js|css)$/.test(new URL(e.name).pathname)).slice(0, 4).map(e => ({ f: new URL(e.name).pathname.slice(8, 30), status: e.responseStatus, transfer: e.transferSize, encoded: e.encodedBodySize, decoded: e.decodedBodySize })))
await page.goto(srv.base + '/'); await page.waitForSelector('#luser'); await sleep(800)
console.log('first', JSON.stringify(await dump()))
const n = srv.hits.length
await page.reload(); await page.waitForSelector('#luser'); await sleep(800)
console.log('reload', JSON.stringify(await dump()))
console.log('server answers on the reload:', srv.hits.slice(n).filter(h => /\.(js|css)$/.test(h.p)).map(h => h.st).join(','))
await cr.close(); await srv.close()
