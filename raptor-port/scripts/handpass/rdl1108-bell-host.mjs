// Reproduce: after an access request, does the admin's bell light and its tap go to Admin → Users?
import { chromium } from 'playwright'
import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { join, extname } from 'path'
const root = process.argv[2], shots = process.argv[3]
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' }
const srv = createServer((q, r) => {
  let p = join(root, decodeURIComponent(q.url.split('?')[0]))
  if (!existsSync(p) || p.endsWith('\\') || p.endsWith('/')) p = join(root, 'index.html')
  try { r.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); r.end(readFileSync(p)) } catch { r.writeHead(404); r.end() }
}).listen(4473)
const b = await chromium.launch()
const page = await (await b.newContext({ viewport: { width: 1536, height: 864 } })).newPage()
const errs = []; page.on('pageerror', e => errs.push(String(e)))
await page.goto('http://localhost:4473/'); await page.waitForSelector('#luser')
await page.fill('#luser', 'bellrepro@mail'); await page.fill('#lpass', 'x')
await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#accessRequest')
await page.fill('#accCs', 'Bellrep'); await page.fill('#accIni', 'BR')
await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C')
await page.click('#accSend'); await page.waitForSelector('#accessWaiting')
await page.click('#accOut'); await page.waitForSelector('#luser')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#notifyBell')
await page.waitForTimeout(800)
const st = await page.evaluate(() => ({ page: window.CURPAGE, bellCls: document.querySelector('#notifyBell')?.className, badge: document.querySelector('#admWaitBadge')?.textContent }))
console.log('after sign-in', JSON.stringify(st))
await page.screenshot({ path: shots + '/bell-before-tap.png', clip: { x: 900, y: 0, width: 636, height: 120 } })
await page.click('#notifyBell'); await page.waitForTimeout(600)
const after = await page.evaluate(() => ({ page: window.CURPAGE, toast: [...document.querySelectorAll('.toast, [role=status]')].map(e => e.textContent).join(' | '), empty: document.querySelector('[data-testid="bell-empty"]')?.textContent }))
console.log('after tap', JSON.stringify(after))
await page.screenshot({ path: shots + '/bell-after-tap.png' })
console.log('errors', errs.length)
await b.close(); srv.close()
