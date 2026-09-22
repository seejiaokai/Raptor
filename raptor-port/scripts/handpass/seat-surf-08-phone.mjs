/* [OIL-SEATS-CAN-EARN] walk — SURFACES 1c/2b: the EDIT WEEK and the VIEW WEEK
   at PHONE width. Same fixture, same questions: does the count chip show on the
   week's seats, does the green earn bar reach them, and is the chip reachable
   by a finger (a real touch target, not just a visible one)? */
import { open, go, board, tap, type, shot, STATE } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE, width: 390, height: 844 })
console.log('viewport 390x844 — the phone')

/* fixture through the app's own controls, at phone width */
await board(page, di)
await tap(page, `[data-gradd="${di}"]`)
await type(page, `[data-bfld="gr:${di}.5.prog"]`, 'STORES CHECK')
await type(page, `[data-bfld="gr:${di}.5.str"]`, '08:00')
await type(page, `[data-bfld="gr:${di}.5.end"]`, '10:00')
await page.locator('#sbClose:visible').first().click()
await page.waitForTimeout(900)
await go(page, 'editsched'); await page.waitForTimeout(1000)

async function weekPut(key, pid) {
  const t = page.locator(`#eWeek [data-slot="${key}"], #eWeek [data-fill="${key}"]`).first()
  if (!(await t.count())) return 'no target'
  await t.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(150)
  const b = await t.boundingBox(); if (!b) return 'no box'
  await page.mouse.click(b.x + b.width / 2, b.y + Math.min(b.height - 3, b.height * 0.8)); await page.waitForTimeout(280)
  if (!(await page.evaluate(() => !!(window.ARM && window.ARM.key)))) return 'did not arm'
  const p = page.locator(`#eRoster .rpuck[data-person="${pid}"]:visible`).first()
  if (!(await p.count())) return 'palette did not offer ' + pid
  await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(120)
  try { await p.click({ timeout: 2500 }) } catch { const q = await p.boundingBox(); if (q) await page.mouse.click(q.x + q.width / 2, q.y + q.height / 2) }
  await page.waitForTimeout(450); await page.keyboard.press('Escape'); await page.waitForTimeout(150)
  const after = await page.evaluate(k => { const h = document.querySelector(`#eWeek [data-slot="${k}"],#eWeek [data-fill="${k}"]`)
    return h ? [...h.querySelectorAll('[data-person]')].map(e => e.dataset.person) : [] }, key)
  return after.includes(pid) ? 'TOOK' : 'no-op, cell now [' + after + ']'
}
console.log('\n===== PLACING ON THE PHONE, THROUGH THE WEEK =====')
for (const [n, k, p] of [
  ['Duty desk (AVALON, empty row)', `d:${di}.1.1.+`, 'allavail'],
  ['Ground row (STORES CHECK)',      `g:${di}.5.+`,   'all'],
  ['Sim — OFT append',               `s:${di}.oft.0.+`, 'allavail'],
  ['Common Programme — append',      `a:${di}.1.+`,   'all'],
]) console.log(` ${await weekPut(k, p)}  <- ${n} (${k})`)

const look = async (root, label) => {
  const r = await page.evaluate(([sel, d]) => {
    const day = document.querySelector(`${sel} .day[data-day="${d}"]`)
    if (!day) return { err: 'no day column drawn' }
    const key = e => { const s = e.closest('.seat'); if (s && s.dataset.slot) return s.dataset.slot
      const f = e.closest('[data-fill]'); return f ? f.dataset.fill : '(panel)' }
    const seats = [...day.querySelectorAll('[data-person="allavail"],[data-person="all"]')].map(e => {
      const s = e.closest('.seat'); const c = s && s.querySelector('.oilcount')
      const cb = c ? c.getBoundingClientRect() : null
      return { who: e.dataset.person, key: key(e),
        bar: (e.className.match(/oilbar-(fo|ho)/) || [])[1] || (e.className.includes('oilbar') ? 'plain' : null),
        chip: c ? (c.innerText || '').trim() : null,
        chipBox: cb ? `${Math.round(cb.width)}x${Math.round(cb.height)}` : null,
        chipClipped: cb ? (cb.width < 1 || cb.height < 1) : null }
    })
    return { seats, chipsOnDay: day.querySelectorAll('.oilcount').length }
  }, [root, di])
  console.log(`\n===== ${label} — PHONE =====`)
  if (r.err) return console.log('  ', r.err)
  console.log('  count chips drawn on the day:', r.chipsOnDay)
  for (const s of r.seats) console.log(`   ${s.who.padEnd(9)} ${String(s.key).padEnd(16)} bar=${String(s.bar).padEnd(5)} chip=${s.chip === null ? 'MISSING' : JSON.stringify(s.chip)} box=${s.chipBox}${s.chipClipped ? '  <-- CLIPPED TO NOTHING' : ''}`)
  return r
}
await look('#eWeek', 'EDIT WEEK')
await shot(page, 'SURF-13-editweek-phone')

/* is the chip reachable by a finger? press it where it actually is */
const reach = await page.evaluate(d => {
  const c = document.querySelector(`#eWeek .day[data-day="${d}"] .oilcount`); if (!c) return null
  c.scrollIntoView({ block: 'center', inline: 'center' })
  const b = c.getBoundingClientRect()
  const on = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)
  return { w: Math.round(b.width), h: Math.round(b.height), txt: (c.innerText || '').trim(),
    whatIsOnTop: on ? (on.className.toString().slice(0, 50) + '|' + on.tagName) : 'nothing',
    x: b.x + b.width / 2, y: b.y + b.height / 2 }
}, di)
console.log('\n the chip as a touch target:', JSON.stringify(reach))
if (reach && reach.x) {
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.textContent = ''; t.style.opacity = '0' } })
  await page.mouse.click(reach.x, reach.y); await page.waitForTimeout(700)
  const said = await page.evaluate(() => { const t = document.getElementById('toastEl'); return t ? { op: t.style.opacity, txt: (t.textContent || '').slice(0, 200) } : 'none' })
  console.log(' a finger on the chip ->', JSON.stringify(said))
  await shot(page, 'SURF-14-editweek-phone-chip-tapped')
}

await go(page, 'viewsched'); await page.waitForTimeout(1000)
await look('#vWeek', 'VIEW WEEK')
await shot(page, 'SURF-15-viewweek-phone')
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
