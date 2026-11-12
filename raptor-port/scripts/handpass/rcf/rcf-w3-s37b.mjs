/* rcf-w3 S37b v1 — the same window opened from the board's + Block menu pencil.
   usage: RCF_RUN=s37-r2 node scripts/handpass/rcf/rcf-w3-s37b.mjs */
const W = await import('./rcf-w3-lib.mjs')
const { L, say, check, nrm } = W
console.log('rcf-w3-s37b v1', W.SHOTS)
const { browser, page, errors } = await W.openWorld()
await L.board(page, 4)
const isOpen = () => page.locator('#tplClose:visible').count()
async function openViaPencil() {
  await L.tap(page, '[data-dwadd="4"]'); await page.waitForTimeout(500)
  const hdr = page.getByText(/^add a duty block$/i).first()
  const pencil = hdr.locator('xpath=..').locator('button').first()
  const n = await hdr.locator('xpath=..').locator('button').count()
  say('buttons beside the menu heading:', n, 'title:', await pencil.getAttribute('title'))
  await L.shot(page, 'menu')
  await pencil.click(); await page.waitForTimeout(500)
}
await openViaPencil()
check('S37b window opens from the + Block pencil', (await isOpen()) > 0, 'tplClose visible: ' + (await isOpen()))
await L.shot(page, 'opened')
const WANTA = 'The AVALON desk — until the AVALON flies, checked only for overseas or medically down (ATT B may still man it), and earns no OIL by default on a weekend or holiday. Switch it on in OIL Earn if activated.'
const WANTB = 'The BB desk — the same rules as the AVALON desk: until the BB flies, checked only for overseas or medically down (ATT B may still man it), and earns no OIL by default on a weekend or holiday. Switch it on in OIL Earn if activated.'
for (const [v, want] of [['avalon', WANTA], ['bb', WANTB]]) {
  await page.locator('.tpl-wave select').first().selectOption(v); await page.waitForTimeout(350)
  const all = nrm(await page.evaluate(() => document.body.innerText))
  const i = all.indexOf('The ' + v.toUpperCase() + ' desk')
  const note = i >= 0 ? all.slice(i, i + want.length) : '(none)'
  check(`S37b board-pencil ${v} note`, note === want, `read: "${note}"`)
  await L.shot(page, `${v}`)
}
// does the window show "For wave" options by its own? record the options
say('For wave options:', await page.locator('.tpl-wave select').first().locator('option').evaluateAll(os => os.map(o => o.value + '=' + o.textContent.trim())))
const closes = {}
await page.locator('#tplClose').click(); await page.waitForTimeout(400); closes['✕'] = !(await isOpen())
if (!(await isOpen())) { await L.shot(page, 'after-x'); }
// reopen: the menu may still be open after the window closes
async function reopen() {
  if (await isOpen()) return
  const pen = page.getByText(/^add a duty block$/i).first()
  if (await pen.count() && await pen.isVisible()) { await pen.locator('xpath=..').locator('button').first().click(); await page.waitForTimeout(500) }
  else await openViaPencil()
}
await reopen()
const done = page.getByRole('button', { name: /^Done$/ }).last()
closes['Done'] = 'n/a'
if (await done.count()) { const vis = await done.isVisible(); if (vis && (await isOpen())) { await page.locator('#tplClose').locator('xpath=ancestor::*[contains(@class,"tpl") or @role="dialog"][1]').getByRole('button', { name: /^Done$/ }).first().click().catch(() => done.click()); await page.waitForTimeout(400); closes['Done'] = !(await isOpen()) } }
await reopen()
await page.keyboard.press('Escape'); await page.waitForTimeout(400); closes['Escape'] = !(await isOpen())
await reopen()
await page.mouse.click(8, 400); await page.waitForTimeout(400); closes['outside press'] = !(await isOpen())
say('RECORD which closes close the board-pencil duty-template window:', JSON.stringify(closes))
check('S37b close routes recorded', 'RECORD', JSON.stringify(closes))
check('S37b no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '))
await browser.close()
W.summary()
