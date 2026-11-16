// rw2: R3, R4, R7 desktop (1536x864 chromium). v1
import { rwlaunch, shot, act, blur, esc, rec, say, state, go, errors, D0 } from './rwlib.mjs'
const { browser, page } = await rwlaunch('chromium', 1536, 864, false)
await go(page, 'editsched')
async function sc(id, fn) { try { await fn() } catch (e) { rec(id, false, 'SCRIPT ERROR ' + String(e.message).split('\n')[0]) } }
async function closeAll() { for (let i = 0; i < 5; i++) { const s = await state(page); if (!s.ava && !s.chg && !s.arm && !s.board) break; await blur(page); await esc(page) } }
const prog = d => page.locator(`#eWeek .day[data-day="${d}"] [data-fill="a:${d}.0.+"] .oilcount`).first()
if (!process.env.R4ONLY) await sc('R3', async () => {
  await closeAll(); await blur(page)
  await act(page, prog(0), false); await page.waitForTimeout(500)
  const seat = page.locator(`${D0} [data-fill="a:0.1.+"], ${D0} [data-fill="a:0.2.+"]`).first()
  await act(page, seat, false); await page.waitForTimeout(400)
  const s1 = await state(page); await shot(page, 'rw3-armed-and-window')
  await page.locator('.availwin:not([hidden]) .win-ttl').click(); await page.waitForTimeout(300)
  await blur(page)
  const s1b = await state(page)
  await esc(page)
  const s2 = await state(page); await shot(page, 'rw3-after-esc1')
  await blur(page); await esc(page)
  const s3 = await state(page); await shot(page, 'rw3-after-esc2')
  rec('R3', s1.ava && s1.arm && s2.arm && !s2.ava && !s3.arm, `armed=${s1.arm} afterTitleClick ava=${s1b.ava} arm=${s1b.arm}; esc1 ava=${s2.ava} arm=${s2.arm}; esc2 arm=${s3.arm}`)
})
// R4: count A day 0, count B day 1 (programme rows)
async function r4(id, withEdit) {
  await closeAll(); await blur(page)
  const A = page.locator('#eWeek .day[data-day="2"] [data-fill="g:2.2.+"] .oilcount').first(), B = page.locator('#eWeek .day[data-day="5"] [data-fill="g:5.0.+"] .oilcount').first()
  const nA = await A.count(), nB = await B.count()
  say('counts', nA, nB)
  await act(page, A, false); await page.waitForTimeout(500)
  const tA = await page.locator('.availwin:not([hidden]) .win-ttl').innerText()
  await shot(page, `rw4-${id}-A`)
  await act(page, B, false); await page.waitForTimeout(600)
  const tB = await page.locator('.availwin:not([hidden]) .win-ttl').innerText()
  await shot(page, `rw4-${id}-B`)
  if (withEdit) {
    // a real schedule edit: type into a day note / remarks box on another day
    const box = page.locator('#eWeek .day[data-day="3"] .ah-note.txed').first()
    const n = await box.count()
    say('edit box found', n)
    if (n) { await box.scrollIntoViewIfNeeded(); await box.click(); await page.keyboard.type('x'); await page.waitForTimeout(200); await page.keyboard.press('Tab'); await page.waitForTimeout(700) }
    await shot(page, `rw4-${id}-after-edit`)
  }
  const sB = await state(page)
  await page.locator('.availwin:not([hidden]) .win-tabs button, .availwin:not([hidden]) .win-x').first().focus()
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  const res = await page.evaluate(() => {
    const a = document.activeElement
    const fs = a && a.closest('[data-fill]'); const dy = a && a.closest('.day')
    const cs = a ? getComputedStyle(a) : null
    return { tag: a && a.tagName + '.' + String(a.className).slice(0, 30), fill: fs && fs.getAttribute('data-fill'), day: dy && dy.getAttribute('data-day'), fv: a && a.matches(':focus-visible'), ring: cs && (cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor) }
  })
  await shot(page, `rw4-${id}-after-esc`)
  const s2 = await state(page)
  rec(id, tA !== tB && !s2.ava && res.day === '5' && res.fv, `A="${tA.replace(/\n/g, ' ')}" B="${tB.replace(/\n/g, ' ')}" windowOpenBeforeEsc=${sB.ava}; after Esc keys on ${JSON.stringify(res)}; windowOpen=${s2.ava}`)
}
await page.getByRole('button', { name: 'Jul 20' }).click(); await page.waitForTimeout(900)
await sc('R4', () => r4('R4', false))
await sc('R4 after edit', () => r4('R4-edit', true))
// R7 smoke
if (process.env.R4ONLY) { say('errors', JSON.stringify(errors)); await browser.close(); process.exit(0) }
await sc('R7 ALL AVAIL', async () => {
  await closeAll(); await blur(page); await act(page, prog(0), false); await page.waitForTimeout(500)
  const s1 = await state(page); await shot(page, 'rw7-aa-open'); await blur(page); await esc(page)
  const s2 = await state(page); await shot(page, 'rw7-aa-closed')
  rec('R7 ALL AVAIL', s1.ava && !s2.ava, `open=${s1.ava} afterEsc=${s2.ava}`)
})
await sc('R7 changes', async () => {
  await blur(page); await act(page, page.locator('#histBtn'), false); await page.waitForTimeout(600)
  const s1 = await state(page); await shot(page, 'rw7-chg-open'); await blur(page); await esc(page)
  const s2 = await state(page); await shot(page, 'rw7-chg-closed')
  rec('R7 changes', s1.chg && !s2.chg, `open=${s1.chg} afterEsc=${s2.chg}`)
})
await sc('R7 board', async () => {
  await closeAll()
  await act(page, page.locator(`${D0} .dt.sb-open`), false)
  await page.waitForSelector('#schedBoard:not([hidden])'); await page.waitForTimeout(500)
  await blur(page)
  await act(page, page.locator('#schedBoard .oilcount').first(), false); await page.waitForTimeout(500)
  const s1 = await state(page); await shot(page, 'rw7-board-window'); await blur(page); await esc(page)
  const s2 = await state(page); await shot(page, 'rw7-board-esc1'); await blur(page); await esc(page)
  const s3 = await state(page); await shot(page, 'rw7-board-esc2')
  rec('R7 board', s1.ava && !s2.ava && s2.board && !s3.board, `open=${s1.ava}; esc1 ava=${s2.ava} board=${s2.board}; esc2 board=${s3.board}`)
})
say('errors', JSON.stringify(errors))
await browser.close()
