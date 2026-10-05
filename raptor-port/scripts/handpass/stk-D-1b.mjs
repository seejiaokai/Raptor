/* Walker D, world 1b: P4c-11 follow-up — Escape on the Board's time boxes and text boxes: what the box shows afterwards (fresh world). */
import * as H from './stk-D-lib.mjs'
const { open, nav, openBoard, boxList, clickBox, caret, label, sleep, pic, row, savePart, scopeSel } = H
const { browser, page, errors } = await open({ width: 1440, height: 900, who: 'a', fresh: false })
page.setDefaultTimeout(9000)
const typeNow = async txt => { await page.keyboard.press('Control+A'); await page.keyboard.type(txt, { delay: 8 }) }
const out = []
for (const surf of ['board', 'week']) {
  if (surf === 'week') await nav(page, 'editsched'); else await openBoard(page, 0)
  const scope = surf === 'week' ? scopeSel('week', 0) : scopeSel('board', 0)
  const tests = surf === 'board'
    ? [['ff:0.0.0.to', '09:29', 'take-off (first aircraft row)'], ['ff:0.0.0.ld', '15:29', 'landing'], ['ff:0.0.0.br', '08:29', 'Brief'], ['dr:0.0.0.str', '04:29', 'duty start'], ['gr:0.0.str', '03:29', 'ground start'], ['ff:0.0.0.cs', 'ESCCS', 'callsign (text)'], ['fr:0.0.0.0', 'ESC REMARK', 'Remarks (text)']]
    : [['ff:0.0.0.to', '09:29', 'take-off'], ['ff:0.0.0.ld', '15:29', 'landing'], ['ff:0.0.0.br', '08:29', 'Brief'], ['dr:0.0.0.str', '04:29', 'duty start'], ['ff:0.0.0.cs', 'ESCCS', 'callsign'], ['fr:0.0.0.0', 'ESC REMARK', 'Remarks']]
  for (const [key, rep, nm] of tests) {
    const list = await boxList(page, scope); const ix = list.findIndex(b => b.key === key)
    if (ix < 0) { out.push([`${surf} ${nm}`, 'no such box on this day']); continue }
    const get = () => page.evaluate(([s, k]) => [...document.querySelectorAll(`${s} [data-bfld="${k}"],${s} [data-txt="${k}"]`)].map(e => e.value !== undefined && e.tagName !== 'DIV' && e.tagName !== 'SPAN' ? e.value : e.innerText), [scope, key])
    const orig = await get(), n0 = await page.evaluate(() => window.commandStreamLen())
    await clickBox(page, scope, ix); await typeNow(rep)
    const typed = await get()
    await page.keyboard.press('Escape'); await sleep(350)
    const afterEsc = await get(), c = await caret(page)
    // leave the box with a real click on empty page area (blur) and read again
    await page.locator('body').click({ position: { x: 5, y: 450 }, force: true }).catch(() => {}); await sleep(500)
    const afterBlur = await get(), n1 = await page.evaluate(() => window.commandStreamLen())
    const dataNow = await page.evaluate(([s]) => 'n/a', [scope])
    out.push([`${surf} ${nm}`, JSON.stringify({ orig, typed, afterEsc, caretAfterEsc: label(c), afterBlur, commands: n1 - n0, restored: JSON.stringify(afterEsc) === JSON.stringify(orig) })])
    if (surf === 'board' && key === 'ff:0.0.0.to') await pic(page, 'P4c-11-board-time-after-escape')
  }
}
const rowsTxt = out.map(o => o.join(' => ')).join('\n')
console.log(rowsTxt)
row('P4c-11-escape-probe', 'Fresh world, Monday: on each box typed a replacement, pressed Escape, read the box(es) (all copies of it) at once, then clicked away and read again, counting commands', rowsTxt.replace(/\n/g, ' || '), 'RECORDED', [])
console.log('errors', errors)
savePart('world1b', { errors })
await browser.close()
