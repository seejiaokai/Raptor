/* [RULES-CHECK-FIXES]' FULL check — the host's short walk on the drivers, before any walker starts (12 Nov 26;
   evidence docs/handpass/2026-11-12-rules-check-fixes.md). Proves on the frozen build the routes the walkers' briefs
   name: sign-in, the Logic page and its changed lines, Admin → Duty templates… with the AVALON and BB notes, the
   board of a day and its warning list. Assertions of the RIGHT behaviour.
   Usage (from raptor-port/): HP_URL=http://localhost:4291 node scripts/handpass/rcf/rcf-host.mjs */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/host')
const L = await import('../lib.mjs')
console.log('rcf-host v3', L.BASE, process.env.HP_SHOTS)
const res = []
const check = (id, ok, d = '') => { res.push([id, ok]); console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${d}`) }

const { browser, page, errors } = await L.open({ width: 1536, height: 864 })
// the served build is the frozen one
const js = await page.evaluate(() => [...document.scripts].map(s => s.src).find(s => /index-/.test(s)) || '')
check('H0 frozen bundle served', /index-BpIimx1U\.js/.test(js), js)

// the Logic page, by its own nav link
await page.locator('a[data-page="logic"]:visible').first().click()
await page.waitForSelector('#page-logic.on')
await page.waitForTimeout(400)
const logic = await page.evaluate(() => document.querySelector('#page-logic').innerText)
check('H1 Logic page opens', logic.length > 500, logic.length + ' chars')
const folds = await page.locator('#page-logic details').count()
console.log('NOTE folds on the Logic page:', folds)
await L.shot(page, 'h1-logic')

// Admin → Duty templates…
await page.locator('a[data-page="admin"]:visible').first().click()
await page.waitForTimeout(500)
// Admin opens on Users: the template doors sit under "Squadron config"
await page.getByText('Squadron config', { exact: true }).first().click()
await page.waitForTimeout(300)
await page.locator('#admDutyTpl:visible').click()
await page.waitForSelector('#tplClose')
const waveSel = page.locator('.tpl-wave select').first()
const opts = await waveSel.locator('option').evaluateAll(os => os.map(o => o.value))
console.log('NOTE For-wave options:', opts.join(','))
for (const v of ['avalon', 'bb']) {
  if (!opts.includes(v)) { check('H2 ' + v + ' wave offered', false, opts.join(',')); continue }
  await waveSel.selectOption(v)
  await page.waitForTimeout(300)
  const txt = await page.evaluate(() => document.body.innerText)
  const want = v === 'avalon' ? 'until the AVALON flies' : 'until the BB flies'
  check('H2 ' + v + ' note', txt.includes(want) && txt.includes('Switch it on in OIL Earn if activated.'), want)
  await L.shot(page, 'h2-tpl-' + v)
}
await page.locator('#tplClose').click()
await page.waitForTimeout(300)
check('H3 Duty templates closes', !(await page.locator('#tplClose:visible').count()))

// the board of Friday, its warning list
await L.board(page, 4)
const w = await L.warnings(page)
check('H4 board opens with a warning list', !!w.head, (w.head || '') + ' | ' + w.lines.slice(0, 3).join(' / '))
await L.shot(page, 'h4-board-fri')
await L.closeBoard(page)

check('H5 no console or page errors', errors.length === 0, errors.slice(0, 3).join(' | '))
await browser.close()
console.log(`DONE ${res.filter(r => r[1]).length}/${res.length} PASS`)
