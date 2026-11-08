// The host's reproduction of fault 2 (W1a S6.2) — chat 13, 8 Nov 26: a man split out of a shared Unavailable input by
// editing his row's remarks ON THE BOARD showed no dotted outline until the board was reopened. Reads, after the edit and
// its Tab: where the caret is, the panel's marks; then after a click on the panel's own heading (the caret leaves); and
// the same for a Ground input edited on the board (its name's mark), to tell a caret-held panel from a missed mark.
// Run: SM_DIST=<dist> TAG=<name> node scripts/handpass/sm-host-f2.mjs
import * as L from './sm-lib.mjs'
const TAG = process.env.TAG || 'job'
console.log('sm-host-f2 v1', TAG, L.DIST)
const OUT = L.outDir('host')
const W = await L.launch('pc', { origin: 'http://localhost:4397' })
const { page } = W
await L.signIn(W)
// a shared input under Unavailable, and a Ground Meeting, both filed BEFORE the day is published (clean after publish)
async function fileShared(type, goes, remarks) {
  const before = await page.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  await L.openInputsList(W)
  await page.locator(L.T('in-new')).first().click(); await page.waitForSelector(L.T('win-inputedit')); await L.sleep(500)
  await page.locator('#inpEditType').selectOption(type); await L.sleep(300)
  await page.locator(L.T('pp-several')).click(); await L.sleep(400)
  for (const n of ['Bolt', 'Saint']) await page.locator('.pp-puck').filter({ hasText: new RegExp('^' + n) }).first().click()
  await page.locator('.pp-puck.on').filter({ hasText: /^Saber/ }).first().click(); await L.sleep(200)
  const g = page.locator(L.T('inpEdit-goes-' + goes)); if (await g.count()) await g.click()
  await page.locator('#inpEditRmk').fill(remarks)
  for (let i = 0; i < 2; i++) { await page.locator('[data-testid="inpEdCal-day-2026-07-15"]').first().click(); await L.sleep(200) }
  await page.locator('#inpEditSave').click(); await L.sleep(900)
  for (let i = 0; i < 4; i++) {
    const open = await page.evaluate(() => [...document.querySelectorAll('[data-testid="docconf"], [data-testid="oilconf"]')].filter(e => e.getBoundingClientRect().width).map(e => e.dataset.testid))
    if (!open.length) break
    if (open.includes('docconf')) await page.locator(L.T('docconf-nodoc')).first().click()
    else { await page.locator(L.T('oil-no')).first().click(); await L.sleep(250); await page.locator(L.T('oilconf-save')).first().click() }
    await L.sleep(700)
  }
  const after = await page.evaluate(() => (window.INPUTS || []).map(r => ({ iid: r.iid, acc: r.acc, type: r.type })))
  return after.filter(r => !before.includes(r.iid))
}
console.log('unav', JSON.stringify(await fileShared('Other', 'u', 'Range party')))
console.log('ground', JSON.stringify(await fileShared('Meeting', 'g', 'Safety brief')))
await L.publishDay(W, 2)   // leaves the board open on Wednesday
const read = () => page.evaluate(() => {
  const a = document.activeElement
  const caret = a && a !== document.body ? (a.className || a.tagName) + ' in ' + ((a.closest('.sb-panel') || {}).className || '-') : 'none'
  const marks = sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().height > 0).map(e => e.textContent.trim().slice(0, 12) + (e.hasAttribute('data-alp') ? '[MARK]' : '[plain]'))
  return { caret, unav: marks('#schedBoard .sb-panel.unav .sbi-ty'), ground: marks('#schedBoard .sbi-ty, #schedBoard [data-alp]').slice(0, 14), pend: (document.querySelector('#schedBoard .dpend') || {}).textContent }
})
console.log('clean', JSON.stringify(await read()))
for (const [label, panel, rowSel] of [['unav', '#schedBoard .sb-panel.unav', '.sb-arow'], ['ground', '#schedBoard', '.sb-arow, .sbi-row']]) {
  const row = page.locator(`${panel} ${rowSel}`).filter({ hasText: 'Saint' }).filter({ hasText: label === 'unav' ? /Range party/ : /Safety brief/ }).first()
  if (!(await row.count())) { console.log(label, 'no Saint row found'); continue }
  const box = row.locator('.rmkin').first()
  if (!(await box.count())) { console.log(label, 'no remarks box'); continue }
  await box.scrollIntoViewIfNeeded(); await box.click(); await box.fill(label === 'unav' ? 'Saint only — range' : 'Saint only — brief'); await page.keyboard.press('Tab'); await L.sleep(900)
  console.log(label, 'after Tab', JSON.stringify(await read()))
  await L.pic(W, OUT, `f2-${TAG}-${label}-tab`, { sel: '#schedBoard .sb-boardwrap', pad: 0 }).catch(() => {})
  await page.locator('#schedBoard .sb-panel.unav .sb-ph').first().click({ position: { x: 4, y: 4 } }); await L.sleep(900)
  console.log(label, 'after caret left', JSON.stringify(await read()))
}
console.log('errs', JSON.stringify(W.errs))
await L.closeAll(W)
