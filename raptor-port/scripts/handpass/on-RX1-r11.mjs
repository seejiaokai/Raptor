import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'R11' })
const { page, tid, shot, press } = W
const J = o => JSON.stringify(o)
const iid = await L.usualSat(W)
// sign the four boxes
const sels = page.locator(`#schedBoard [data-signday="${L.SAT_DI}"]`)
const n = await sels.count()
const picked = []
for (let i = 0; i < n; i++) {
  const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
  if (opts.length) { await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)]); picked.push(opts[Math.min(i, opts.length - 1)]) }
  await page.waitForTimeout(150)
}
await page.waitForTimeout(300)
console.log('sign boxes', n, 'picked', J(picked), 'values', J(await sels.evaluateAll(es => es.map(e => e.value))))
await L.frameBoard(page)
const s0 = { ground: await L.groundNow(page), oil: await L.oilOf(page, iid) }
await L.drag(page, page.locator(L.puckSel(1)), page.locator(L.puckSel(0)))
console.log('question', await tid('oilconf').count(), await tid('oilconf-lead').innerText().catch(() => 'NO'))
await press(tid('oilconf-cancel')); await page.waitForTimeout(700)
console.log('bar', await tid('oilbar-text').innerText().catch(() => 'NO'), 'ground same', J(await L.groundNow(page)) === J(s0.ground))
console.log('sign values after the not-swap', J(await sels.evaluateAll(es => es.map(e => e.value))))
// Publish day
let btn = page.locator(`#schedBoard [data-beak="${L.SAT_DI}"]`).first()
if (!(await btn.count())) btn = page.locator(`#schedBoard [data-alpub="${L.SAT_DI}"]`).first()
console.log('publish button', await btn.count(), (await btn.innerText().catch(() => '')).trim(), 'disabled', await btn.isDisabled().catch(() => null))
await W.hush(); await shot('RX1-11-1-before-publish'); await W.unhush()
await btn.evaluate(b => b.click()); await page.waitForTimeout(900)
await shot('RX1-11-2-publish-dialog')
const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm|Issue)/ }).first()
const okTxt = await ok.count() ? (await ok.innerText()) : 'none'
console.log('confirm button', okTxt)
if (await ok.count() && await ok.isVisible()) { await ok.evaluate(b => b.click()); await page.waitForTimeout(1200) }
console.log('after publish: toast', await L.toast(page), 'bar', await tid('oilbar').count(), 'ver', await page.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || ''))
console.log('ground now (working copy)', J(await L.groundNow(page)))
await L.closeBoard(W)
// View-only Sched
await page.locator('a[data-page="viewsched"]').first().click(); await page.waitForTimeout(1000)
const view = await page.evaluate((di) => {
  const day = [...document.querySelectorAll('#vWeek .day:not(.peek)')][di]
  if (!day) return 'NO DAY'
  const rows = [...day.querySelectorAll('.sec-grnd .pl-row')].map(r => (r.querySelector('.nm .ntx')?.textContent || '').trim() + ': ' + [...r.querySelectorAll('.ppl .puck .nm')].map(e => e.textContent.trim()).join(' + '))
  const bar = day.querySelector('.daywarn')
  const head = day.querySelector('.dh, .day-head, .dhd')
  const dstat = day.querySelector('.dstat')
  return { rows, issueBar: bar ? bar.innerText.replace(/\s+/g, ' ').trim() : 'no issue bar', dstat: dstat ? dstat.innerText.replace(/\s+/g, ' ').trim() : '', head: day.innerText.slice(0, 160).replace(/\s+/g, ' ') }
}, L.SAT_DI)
console.log('VIEW-ONLY SAT', J(view))
// open the issue list there
const dw = page.locator(`#vWeek [data-daywarn="${L.SAT_DI}"]`)
if (await dw.count()) { await dw.evaluate(e => e.click()); await page.waitForTimeout(400) }
console.log('VIEW warn list', J(await page.evaluate((di) => { const day = [...document.querySelectorAll('#vWeek .day:not(.peek)')][di]; return [...day.querySelectorAll('.dwlist .witem .wtx')].map(w => w.innerText.replace(/\s+/g, ' ').trim()) }, L.SAT_DI)))
await page.locator('#vWeek .day:not(.peek) .sec-grnd').nth(L.SAT_DI).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
await shot('RX1-11-3-view-only-saturday')
// the edit week's day head too
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(700)
console.log('EDIT week Sat head', J(await page.evaluate((di) => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; const s = d.querySelector('.dstat'); return { dstat: s ? s.innerText.replace(/\s+/g, ' ') : '', warn: (d.querySelector('.daywarn') || {}).innerText } }, L.SAT_DI)))
console.log('errors', J(W.errors))
await W.ctx.close(); process.exit(0)
