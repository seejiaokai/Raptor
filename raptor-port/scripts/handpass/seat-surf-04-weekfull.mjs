/* [OIL-SEATS-CAN-EARN] walk — SURFACES 1b: the EDIT WEEK with a placeholder on
   EVERY kind of week seat. The empty rows are made through the board's own add
   controls (§7.7); every placeholder is then put on THROUGH THE WEEK. Then the
   week is read: chip present / absent per seat kind, and the earn bar. */
import { open, go, board, closeBoard, tap, type, shot, STATE } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })

/* ---- empty rows, made through the app's own add controls ---------------- */
await board(page, di)
await tap(page, `[data-gradd="${di}"]`)
await type(page, `[data-bfld="gr:${di}.5.prog"]`, 'STORES CHECK')
await type(page, `[data-bfld="gr:${di}.5.str"]`, '08:00')
await type(page, `[data-bfld="gr:${di}.5.end"]`, '10:00')
await tap(page, `[data-padd="${di}"]`)
await type(page, `[data-bfld="ap:${di}.2.prog"]`, 'SAFETY BRIEF')
await type(page, `[data-bfld="ap:${di}.2.str"]`, '08:00')
await type(page, `[data-bfld="ap:${di}.2.end"]`, '09:00')
await closeBoard(page)
await go(page, 'editsched'); await page.waitForTimeout(900)
console.log('rows added through the board: STORES CHECK (ground), SAFETY BRIEF (Common Programme)')

async function weekPut(key, pid) {
  const t = page.locator(`#eWeek [data-slot="${key}"], #eWeek [data-fill="${key}"]`).first()
  if (!(await t.count())) return { key, took: false, why: 'no target drawn on the week' }
  await t.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(120)
  const b = await t.boundingBox()
  if (b) await page.mouse.click(b.x + b.width / 2, b.y + Math.min(b.height - 3, b.height * 0.8))
  await page.waitForTimeout(260)
  const armed = await page.evaluate(() => (window.ARM && window.ARM.key) || null)
  const p = page.locator(`#eRoster .rpuck[data-person="${pid}"]:visible`).first()
  const offered = await p.count()
  if (armed && offered) {
    await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(100)
    try { await p.click({ timeout: 2500 }) } catch { const q = await p.boundingBox(); if (q) await page.mouse.click(q.x + q.width / 2, q.y + q.height / 2) }
    await page.waitForTimeout(420)
  }
  await page.keyboard.press('Escape'); await page.waitForTimeout(150)
  const after = await page.evaluate(k => {
    const w = document.querySelector('#eWeek')
    const h = w.querySelector(`[data-slot="${k}"]`) || w.querySelector(`[data-fill="${k}"]`)
    return h ? [...h.querySelectorAll('[data-person]')].map(e => e.dataset.person) : []
  }, key)
  return { key, armed: !!armed, armedKey: armed, offered: !!offered, after, took: after.includes(pid) }
}

const TARGETS = [
  ['Duty desk — own position (AVALON block, empty row)', `d:${di}.1.1.+`, 'allavail'],
  ['Duty desk — own position (SC block, empty row)',     `d:${di}.2.1.+`, 'all'],
  ['Ground row — the who (STORES CHECK, new+empty)',     `g:${di}.5.+`,   'allavail'],
  ['Common Programme — the who (SAFETY BRIEF, new)',     `a:${di}.2.+`,   'all'],
  ['Sim — OFT row append',                               `s:${di}.oft.0.+`, 'allavail'],
  ['Sim — AMT passenger row append',                     `s:${di}.amt.1.+`, 'all'],
  ['Common Programme — existing row append (SODB)',      `a:${di}.1.+`,   'allavail'],
]
console.log('\n===== PLACING THROUGH THE WEEK =====')
for (const [name, key, pid] of TARGETS) {
  const r = await weekPut(key, pid)
  console.log(`[${r.took ? 'TOOK' : r.why || (r.armed ? 'no-op' : 'DID NOT ARM')}] ${name} (${key} <- ${pid}) after=[${r.after}]`)
}
await shot(page, 'SURF-02-editweek-all-kinds-desktop')

const read = await page.evaluate(d => {
  const day = document.querySelector(`#eWeek .day[data-day="${d}"]`)
  const key = e => { const s = e.closest('.seat'); if (s && s.dataset.slot) return s.dataset.slot
    const f = e.closest('[data-fill]'); return f ? f.dataset.fill : '(panel)' }
  const seats = [...day.querySelectorAll('[data-person]')].map(e => ({
    who: e.dataset.person, key: key(e),
    bar: (e.className.match(/oilbar-(fo|ho)/) || [])[1] || (e.className.includes('oilbar') ? 'plain' : null),
    chip: (() => { const s = e.closest('.seat'); const c = s && s.querySelector('.oilcount'); return c ? (c.innerText || '').trim() : null })(),
  })).filter(s => s.who === 'allavail' || s.who === 'all')
  return { seats, total: day.querySelectorAll('.oilcount').length }
}, di)
console.log('\n===== PLACEHOLDERS ON THE EDIT WEEK, DAY 5 =====   (chips on the day:', read.total, ')')
for (const s of read.seats) console.log(`   ${s.who.padEnd(9)} ${String(s.key).padEnd(16)} bar=${String(s.bar).padEnd(5)} chip=${s.chip === null ? 'MISSING' : JSON.stringify(s.chip)}`)

/* ---- tap a chip: what does the app SAY? --------------------------------- */
console.log('\n===== TAPPING THE COUNT CHIPS =====')
const chips = page.locator(`#eWeek .day[data-day="${di}"] .oilcount`)
const n = await chips.count()
for (let i = 0; i < n; i++) {
  const c = chips.nth(i)
  const txt = (await c.innerText()).trim(), ttl = await c.getAttribute('title')
  await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(120)
  try { await c.click({ timeout: 2500 }) } catch { const b = await c.boundingBox(); if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await page.waitForTimeout(500)
  const said = await page.evaluate(() => [...document.querySelectorAll('.toast,#toast,[role=alert],[class*=toast],.sheet,.modal')]
    .filter(e => e.offsetParent !== null).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean).join(' || ').slice(0, 600))
  console.log(`  chip ${i}: "${txt}"`)
  console.log(`    its hover words: ${ttl}`)
  console.log(`    the tap said   : ${said || '(nothing appeared)'}`)
  if (i === 0) await shot(page, 'SURF-03-editweek-chip-tap')
  await page.keyboard.press('Escape'); await page.waitForTimeout(350)
}
console.log('\nerrors:', errors.slice(0, 8))
await page.context().storageState({ path: 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats/state-surf-week.json' })
await browser.close()
