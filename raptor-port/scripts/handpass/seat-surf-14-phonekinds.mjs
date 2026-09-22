/* [OIL-SEATS-CAN-EARN] walk — SURFACES. WHICH KINDS of week seat lose their
   count chip under the row's remarks box at phone width. One placeholder on
   every kind, then each chip measured and pressed where it actually is. */
import { open, go, board, tap, type, shot, STATE } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE, width: 390, height: 844 })

/* the empty rows, through the app's own add controls */
await board(page, di)
await tap(page, `[data-gradd="${di}"]`)
await type(page, `[data-bfld="gr:${di}.5.prog"]`, 'STORES CHECK')
await type(page, `[data-bfld="gr:${di}.5.str"]`, '08:00')
await type(page, `[data-bfld="gr:${di}.5.end"]`, '10:00')
await tap(page, `[data-padd="${di}"]`)
await type(page, `[data-bfld="ap:${di}.2.prog"]`, 'SAFETY BRIEF')
await type(page, `[data-bfld="ap:${di}.2.str"]`, '08:00')
await type(page, `[data-bfld="ap:${di}.2.end"]`, '09:00')
await page.locator('#sbClose:visible').first().click().catch(() => {})
await page.waitForTimeout(900)
await go(page, 'editsched'); await page.waitForTimeout(900)

async function weekPut(key, pid) {
  const t = page.locator(`#eWeek [data-slot="${key}"], #eWeek [data-fill="${key}"]`).first()
  if (!(await t.count())) return 'no target drawn'
  await t.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(150)
  const b = await t.boundingBox(); if (!b) return 'no box'
  await page.mouse.click(b.x + b.width / 2, b.y + Math.min(b.height - 3, b.height * 0.8)); await page.waitForTimeout(280)
  if (!(await page.evaluate(() => !!(window.ARM && window.ARM.key)))) return 'did not arm'
  const p = page.locator(`#eRoster .rpuck[data-person="${pid}"]:visible`).first()
  if (!(await p.count())) return 'palette did not offer it'
  await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(120)
  try { await p.click({ timeout: 2500 }) } catch { const q = await p.boundingBox(); if (q) await page.mouse.click(q.x + q.width / 2, q.y + q.height / 2) }
  await page.waitForTimeout(450); await page.keyboard.press('Escape'); await page.waitForTimeout(150)
  return 'placed'
}
const KINDS = [
  ['Common Programme — the who',    `a:${di}.2.+`],
  ['Common Programme — extras',     `a:${di}.1.+`],
  ['Duty desk — own position',      `d:${di}.1.1.+`],
  ['Duty desk — a second desk',     `d:${di}.2.1.+`],
  ['Sim — the row’s extras',   `s:${di}.oft.0.+`],
  ['Sim — passenger row extras',    `s:${di}.amt.1.+`],
  ['Ground row — the who',          `g:${di}.5.+`],
]
console.log('===== placing one placeholder on every kind, at phone width =====')
for (const [n, k] of KINDS) console.log(` ${(await weekPut(k, 'allavail')).padEnd(22)} <- ${n}  (${k})`)
await shot(page, 'SURF-25-phone-editweek-all-kinds')

const report = async (scope, label) => {
  const n = await page.evaluate(s => document.querySelectorAll(`${s} .oilcount`).length, scope)
  console.log(`\n===== ${label} — ${n} count chip(s) =====`)
  for (let i = 0; i < n; i++) {
    const m = await page.evaluate(([s, ix]) => {
      const c = document.querySelectorAll(`${s} .oilcount`)[ix]; if (!c) return null
      c.scrollIntoView({ block: 'center', inline: 'center' })
      const b = c.getBoundingClientRect(), cx = b.x + b.width / 2, cy = b.y + b.height / 2
      const seat = c.closest('.seat')
      const row = c.closest('.pl-row, .ah-row, .sb-arow')
      const kind = c.closest('.sec-grnd') ? 'ground row'
        : c.closest('.sec-prog') || c.closest('.allhands') ? 'Common Programme'
          : c.closest('.sec-dut') || c.closest('.duties') ? 'duty desk'
            : c.closest('.sec-sim') || c.closest('.sims') ? 'sim'
              : (row ? row.className.slice(0, 26) : '?')
      const top = document.elementFromPoint(cx, cy)
      return { txt: (c.innerText || '').trim(), kind, cx, cy,
        rowName: row ? (row.innerText || '').replace(/\s+/g, ' ').slice(0, 34) : '?',
        onTop: !!(top && (top === c || c.contains(top))),
        front: top ? (top.tagName + '.' + String(top.className).trim().replace(/\s+/g, '.')).slice(0, 34) : 'none',
        inView: cx > 0 && cy > 0 && cx < innerWidth && cy < innerHeight }
    }, [scope, i])
    if (!m) continue
    await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.textContent = ''; t.style.opacity = '0' } })
    await page.waitForTimeout(70)
    if (m.inView) await page.mouse.click(m.cx, m.cy)
    await page.waitForTimeout(620)
    const said = await page.evaluate(() => { const t = document.getElementById('toastEl')
      return t && t.style.opacity === '1' ? (t.textContent || '').trim().slice(0, 44) : null })
    console.log(`  ${m.kind.padEnd(18)} "${m.txt}"  row=${JSON.stringify(m.rowName)}`)
    console.log(`     on top: ${m.onTop ? 'the chip' : 'NO — ' + m.front}   press -> ${said ? 'the list appeared' : 'NOTHING'}`)
    await page.keyboard.press('Escape'); await page.waitForTimeout(180)
  }
}
await report(`#eWeek .day[data-day="${di}"]`, 'EDIT WEEK, phone')
await go(page, 'viewsched'); await page.waitForTimeout(900)
await report(`#vWeek .day[data-day="${di}"]`, 'VIEW WEEK, phone')
await shot(page, 'SURF-26-phone-viewweek-all-kinds')
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
