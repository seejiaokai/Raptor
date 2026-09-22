/* [OIL-SEATS-CAN-EARN] walk — SURFACES 1: THE EDIT WEEK, desktop.
   Every placeholder is put on by HAND through the WEEK'S OWN doors — its own
   seat/append targets and its own crew palette (#eRoster) — never through the
   board, so this proves the week's doors as well as its drawing. Then: does the
   count chip show on the week's seats, and does the green earn bar reach the
   week's flying lines, sims, duty desks, ground rows and Common Programme? */
import { open, go, shot, STATE } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await go(page, 'editsched'); await page.waitForTimeout(900)

/* which copy of the week is the one on screen? both are in the DOM. */
const whichWeek = await page.evaluate(() => {
  const r = id => { const e = document.querySelector(id); if (!e) return 'absent'
    const b = e.getBoundingClientRect(); return `${Math.round(b.width)}x${Math.round(b.height)}` }
  return { eWeek: r('#eWeek'), vWeek: r('#vWeek'), eRoster: r('#eRoster'), sbRoster: r('#sbRoster') }
})
console.log('week boxes:', JSON.stringify(whichWeek))

/* ---- the WEEK's own hand-placement -------------------------------------- */
/* Arms the week's target and clicks the placeholder puck in the WEEK palette.
   Reports what the app DID: whether the arm took, whether the palette offered
   the puck, and who the seat holds afterwards. */
async function weekPut(key, pid) {
  const before = await page.evaluate(k => {
    const w = document.querySelector('#eWeek') || document
    const h = w.querySelector(`[data-slot="${k}"]`) || w.querySelector(`[data-fill="${k}"]`)
    return h ? [...h.querySelectorAll('[data-person]')].map(e => e.dataset.person) : ['NO TARGET']
  }, key)
  const t = page.locator(`#eWeek [data-slot="${key}"], #eWeek [data-fill="${key}"]`).first()
  if (!(await t.count())) return { key, armed: false, offered: false, before, after: [], took: false, why: 'no target drawn on the week' }
  await t.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(120)
  try { await t.click({ timeout: 2500 }) }
  catch { const b = await t.boundingBox(); if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await page.waitForTimeout(260)
  const armed = await page.evaluate(() => (window.ARM && window.ARM.key) || null)
  const p = page.locator(`#eRoster .rpuck[data-person="${pid}"]:visible`).first()
  const offered = await p.count()
  if (armed && offered) {
    await p.evaluate(e => e.scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(100)
    try { await p.click({ timeout: 2500 }) }
    catch { const b = await p.boundingBox(); if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
    await page.waitForTimeout(420)
  }
  const msg = await page.evaluate(() => {
    const t = [...document.querySelectorAll('.toast,#toast,[role=alert],[class*=toast]')]
      .filter(e => e.offsetParent !== null).map(e => (e.innerText || '').trim()).filter(Boolean)
    return t.length ? t.join(' | ').slice(0, 220) : null
  })
  await page.keyboard.press('Escape'); await page.waitForTimeout(160)
  const after = await page.evaluate(k => {
    const w = document.querySelector('#eWeek') || document
    const h = w.querySelector(`[data-slot="${k}"]`) || w.querySelector(`[data-fill="${k}"]`)
    return h ? [...h.querySelectorAll('[data-person]')].map(e => e.dataset.person) : []
  }, key)
  return { key, armed: !!armed, armedKey: armed, offered: !!offered, before, after, took: after.includes(pid), msg }
}

const TARGETS = [
  ['Common Programme — the who list (SODB)',      `a:${di}.0.+`,  'allavail'],
  ['Common Programme — a second row (MASS BRIEF)', `a:${di}.1.+`,  'all'],
  ['Duty desk — own position / append (SDO blk)', `d:${di}.0.0.+`, 'allavail'],
  ['Duty desk — AVALON block append',             `d:${di}.1.0.+`, 'all'],
  ['Duty desk — SC block append',                 `d:${di}.2.0.+`, 'allavail'],
  ['Sim — OFT row append (seats + more)',         `s:${di}.oft.0.+`, 'allavail'],
  ['Sim — AMT passenger row append',              `s:${di}.amt.1.+`, 'all'],
  ['Ground row — append (row 0)',                 `g:${di}.0.+`,   'allavail'],
  ['Ground row — append (row 3)',                 `g:${di}.3.+`,   'all'],
  ['Flying — cockpit FCP, ordinary wave',         `${di}.0.0.0.p`, 'allavail'],
  ['Flying — cockpit RCP, SC MAIN',               `${di}.1.0.0.w`, 'allavail'],
]
console.log('\n===== PLACING BY HAND, THROUGH THE WEEK\'S OWN DOORS =====')
const placed = []
for (const [name, key, pid] of TARGETS) {
  const r = await weekPut(key, pid)
  placed.push({ name, ...r })
  console.log(`[${r.took ? 'TOOK' : r.why || (r.armed ? 'refused/no-op' : 'DID NOT ARM')}] ${name}  (${key} <- ${pid})`)
  console.log(`    arm=${r.armed}${r.armedKey ? ' key=' + r.armedKey : ''} offered=${r.offered} before=[${r.before}] after=[${r.after}]` + (r.msg ? `\n    SAID: ${r.msg}` : ''))
}
await shot(page, 'SURF-01-editweek-placed-desktop')

/* ---- what the WEEK now draws -------------------------------------------- */
const read = await page.evaluate(d => {
  const W = document.querySelector('#eWeek')
  const day = W.querySelector(`.day[data-day="${d}"]`)
  if (!day) return { err: 'no day column' }
  const seats = [...day.querySelectorAll('[data-person]')].map(e => {
    const seat = e.closest('.seat') || e.parentElement
    const slot = (seat && (seat.dataset.slot)) || (e.closest('[data-slot]') || {}).dataset?.slot
      || (e.closest('[data-fill]') || {}).dataset?.fill || '?'
    const chip = seat ? seat.querySelector('.oilcount') : null
    return { who: e.dataset.person, key: slot,
      bar: (e.className.match(/oilbar-(fo|ho)/) || [])[1] || (e.className.includes('oilbar') ? 'plain' : null),
      chip: chip ? (chip.innerText || '').trim() : null }
  })
  return { seats, chips: [...day.querySelectorAll('.oilcount')].map(e => ({
    txt: (e.innerText || '').trim(), item: e.dataset.oilsent, ver: e.dataset.oilver,
    title: (e.getAttribute('title') || '').slice(0, 130) })) }
}, di)
console.log('\n===== THE EDIT WEEK, DAY 5 — what is drawn =====')
console.log(' count chips on the day:', read.chips.length)
for (const c of read.chips) console.log('   ', JSON.stringify(c))
console.log(' every puck on the day (who | key | earn bar | count chip beside it):')
for (const s of read.seats) console.log(`   ${String(s.who).padEnd(10)} ${String(s.key).padEnd(16)} bar=${String(s.bar).padEnd(5)} chip=${s.chip === null ? '—' : JSON.stringify(s.chip)}`)
console.log('\nerrors:', errors.slice(0, 8))
await page.context().storageState({ path: 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats/state-surf-week.json' })
await browser.close()
