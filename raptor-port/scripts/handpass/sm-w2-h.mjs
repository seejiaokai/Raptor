// W2 H: S3 Admin -> Users -> Bolt -> Delete on U (loaded). SZ=pc|phone
import * as L from './sm-lib.mjs'
import { readFileSync } from 'node:fs'
const size = process.env.SZ || 'pc'
console.log('sm-w2-h v2', size)
const OUT = L.outDir('w2')
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad'
const s3 = JSON.parse(readFileSync(SCR + '/w2-state3.json', 'utf8'))
const log = (k, v) => console.log(k, JSON.stringify(v))
const U = await L.launch(size, { origin: 'http://localhost:4393', state: s3, init: L.damageInit('raptor:weeks/13-07-2026#2') })
const { page } = U
const v = page.viewportSize(); const full = { x: 0, y: 0, width: v.width, height: v.height }
await L.signIn(U)
const people = () => page.evaluate(() => (JSON.stringify(window.PEOPLE || {}).match(/"Bolt"/g) || []).length)
log('bolt before', await people())
await L.press(U, 'a:has-text("Admin"), button:has-text("Admin")'); await L.sleep(1500)
await L.press(U, page.locator('text=/^Bolt/').filter({ visible: true }).first()); await L.sleep(900)
await L.press(U, page.getByRole('button', { name: /^Delete/ }).filter({ visible: true }).first()); await L.sleep(1000)
await L.pic(U, OUT, `s3-${size}-delete-step1`, { clip: full })
log('step1 buttons', await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim().slice(0, 30)).filter(t => /delete|cancel|confirm|yes|sure|remove/i.test(t))))
log('step1 toast', await L.toastText(page))
const conf = page.getByRole('button', { name: /delete|confirm|yes|sure/i }).filter({ visible: true })
const n = await conf.count(); log('confirm count', n)
if (n) { await L.press(U, conf.last()); await L.sleep(1200) }
await L.pic(U, OUT, `s3-${size}-delete-step2`, { clip: full })
log('step2 toast', await L.toastText(page))
log('bolt after', await people())
log('words', await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && e.getBoundingClientRect().width > 0 && /saved copy|older version|locked|Blocked|can.t be deleted|cannot/i.test(e.textContent) && !/^This week/.test(e.textContent)).map(e => e.textContent.replace(/\s+/g, ' ').trim())))
log('errs', U.errs); await L.closeAll(U)
console.log('DONE')
