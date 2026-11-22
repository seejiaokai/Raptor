// The pictures that explain the agent's readings 2–4 of D2313 to him (chat 140, 22 Nov 26): desktop, the real app,
// the browser's clock set to the demo week, each picture cut to its place and the place ringed.
// Run from raptor-port/ on a served build:  node scripts/handpass/sfd-explain.mjs   (ONLY=r2,r3a,r3c,r4a,r4b picks scenes)
import { world, go, openBoard, closeBoard, postOutSans, lwCell, qualsCell, state, shot, mark, unmark, sleep, MAN, nextDay } from './sfd-explain-lib.mjs'

const ONLY = (process.env.ONLY || 'r2,r3a,r3c,r4a,r4b').split(',')
const log = (...a) => console.log(...a)

/* the board's crew list of a day, cut to the two columns and SANS Avail, Hex ringed and named by where he stands */
async function crewShot(p, di, name, day) {
  await p.setViewportSize({ width: 1536, height: 1420 })
  await openBoard(p, di)
  const where = await p.evaluate(id => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
    const s = [...document.querySelectorAll(`#schedBoard .rsans .rpuck[data-person="${id}"]`)].filter(vis)
    const c = [...document.querySelectorAll(`#schedBoard .rcol .rpuck[data-person="${id}"], #schedBoard .rcol [data-person="${id}"]`)].filter(vis)
    const line = e => !!(e && (e.classList.contains('san') || e.querySelector('.san')))
    return { sans: s.length, col: c.length, line: line(s[0] || c[0]), cls: (s[0] || c[0] || {}).className || null }
  }, MAN)
  const sel = where.sans ? `#schedBoard .rsans .rpuck[data-person="${MAN}"]` : `#schedBoard .rcol .rpuck[data-person="${MAN}"]`
  const label = where.sans ? `${day}: Hex is SANS` : where.col ? `${day}: Hex is an ordinary WSO` : `${day}: Hex is not in the list`
  if (where.sans || where.col) await mark(p, [sel], label, 'left')
  await shot(p, name, ['#schedBoard .rcol', '#schedBoard .rsans'])
  await unmark(p)
  await closeBoard(p)
  await p.setViewportSize({ width: 1536, height: 864 })
  log('CREW', name, JSON.stringify(where), '→', label)
  return where
}
/* one man's seat on a day of the week page, cut to its line of the wave, the puck ringed and named above it */
async function rowShot(p, dayIdx, name, label) {
  const sel = `#eWeek .day:nth-child(${dayIdx + 1}) .puck[data-person="${MAN}"]`
  const el = p.locator(sel).first()
  if (!(await el.count())) { log('ROW', name, 'NO PUCK'); return }
  await el.evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.setAttribute('data-xp', 'puck'); (e.closest('tr') || e.parentElement.parentElement).setAttribute('data-xp', 'row') })
  await sleep(400)
  const cls = await el.evaluate(e => e.className)
  await mark(p, ['[data-xp="puck"]'], label, 'above')
  await shot(p, name, ['[data-xp="row"]'], 10)
  await unmark(p)
  await p.evaluate(() => document.querySelectorAll('[data-xp]').forEach(e => e.removeAttribute('data-xp')))
  log('ROW', name, cls)
}
async function qualsShot(p, name, label) {
  const cell = await qualsCell(p, MAN)
  await cell.click(); await sleep(500)
  await cell.evaluate(e => { e.setAttribute('data-xp', 'cell'); e.closest('tr').setAttribute('data-xp', 'row'); const h = e.closest('table').querySelector('thead'); if (h) h.setAttribute('data-xp', 'head') })
  await mark(p, ['td[data-xp="cell"]'], label, 'below')
  await shot(p, name, ['[data-xp]'])
  await unmark(p)
  await p.click('#qSave').catch(() => {}); await sleep(300)
  log('QUALS', name, JSON.stringify(await state(p)))
}

/* READING 2 — posted out as SANS from Wed 15; an admin unticks Thu 16 and ticks again Fri 17 */
if (ONLY.includes('r2')) {
  const { b, p, errs } = await world('2026-07-15T09:00:00')
  await postOutSans(p, MAN, '2026-07-15')
  log('r2 posted', JSON.stringify(await state(p)))
  await nextDay(p)
  await qualsShot(p, 'r2-1-quals-untick-thu', 'Thu 16 Jul: an admin clicks Hex’s SANS box — the tick comes off')
  await crewShot(p, 2, 'r3b-crew-wed-after-untick', 'Wed 15 Jul')
  await crewShot(p, 3, 'r3b-crew-thu-after-untick', 'Thu 16 Jul')
  await nextDay(p)
  await qualsShot(p, 'r2-2-quals-tick-fri', 'Fri 17 Jul: the admin clicks it again — the tick is back')
  await crewShot(p, 2, 'r2-3-crew-wed', 'Wed 15 Jul')
  await crewShot(p, 3, 'r2-4-crew-thu', 'Thu 16 Jul')
  await crewShot(p, 4, 'r2-5-crew-fri', 'Fri 17 Jul')
  log('r2 errs', JSON.stringify(errs)); await b.close()
}

/* READING 3a — "Undo post out": the posting's SANS days go, as if it never was */
if (ONLY.includes('r3a')) {
  const { b, p, errs } = await world('2026-07-15T09:00:00')
  await postOutSans(p, MAN, '2026-07-15')
  await nextDay(p)
  await crewShot(p, 2, 'r3a-1-crew-wed-before', 'Wed 15 Jul')
  const c = await lwCell(p, MAN, '2026-07-15')
  await c.click(); await sleep(600)
  await mark(p, ['[data-testid="postout-undo"]'], 'Thu 16 Jul: an admin presses this on the Leave War', 'above')
  await p.locator('[data-testid="postout-undo"]').first().evaluate(e => { let x = e; for (let i = 0; i < 6 && x.parentElement; i++) { x = x.parentElement; if (x.getBoundingClientRect().width > 480) break } x.setAttribute('data-xp', 'sheet') })
  await shot(p, 'r3a-2-undo-button', ['[data-xp="sheet"]'])
  await unmark(p)
  await p.click('[data-testid="postout-undo"]:visible'); await sleep(900)
  await p.keyboard.press('Escape'); await sleep(300)
  log('r3a after undo', JSON.stringify(await state(p)))
  await crewShot(p, 2, 'r3a-3-crew-wed-after', 'Wed 15 Jul')
  log('r3a errs', JSON.stringify(errs)); await b.close()
}

/* READING 3c — an archive on Thu 16: the day he was SANS stays a SANS day */
if (ONLY.includes('r3c')) {
  const { b, p, errs } = await world('2026-07-15T09:00:00')
  await postOutSans(p, MAN, '2026-07-15')
  await nextDay(p)
  await go(p, 'admin'); await sleep(500)
  if (!(await p.locator('#accList:visible').count())) { await p.getByText('Sign-in and roster').first().click(); await sleep(600) }
  await p.locator(`#accList [data-person="${MAN}"]`).first().click(); await sleep(400)
  const ar = p.getByRole('button', { name: 'Archive', exact: true }).first()
  await ar.scrollIntoViewIfNeeded()
  await ar.evaluate(e => e.setAttribute('data-xp', 'btn'))
  await mark(p, ['[data-xp="btn"]'], 'Thu 16 Jul: an admin archives Hex', 'above')
  await shot(p, 'r3c-1-archive-button', ['[data-xp="btn"]'], 230)
  await unmark(p)
  await ar.click(); await sleep(800)
  log('r3c after archive', JSON.stringify(await state(p)))
  await crewShot(p, 2, 'r3c-2-crew-wed', 'Wed 15 Jul')
  await crewShot(p, 3, 'r3c-3-crew-thu', 'Thu 16 Jul')
  /* his seat on Wed 15's flying wave, on the week */
  await go(p, 'editsched')
  await rowShot(p, 2, 'r3c-4-seat-wed', 'Wed 15 Jul: still drawn as SANS (purple line)')
  await rowShot(p, 3, 'r3c-5-seat-thu', 'Thu 16 Jul: no purple line')
  log('r3c week pucks', JSON.stringify(await p.evaluate(id => [...document.querySelectorAll(`#eWeek .day .puck[data-person="${id}"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => [e.className, [...e.closest('.day').parentElement.children].indexOf(e.closest('.day'))]), MAN)))
  log('r3c errs', JSON.stringify(errs)); await b.close()
}

/* READING 4a — the SANS highlight chip goes by who is SANS today, across the whole week in view */
if (ONLY.includes('r4a')) {
  const { b, p, errs } = await world('2026-07-15T09:00:00')
  await postOutSans(p, MAN, '2026-07-15')
  await nextDay(p)
  await go(p, 'editsched')
  await p.locator('[data-hlgrp-btn="type"]:visible').first().click(); await sleep(300)
  await p.locator('[data-hl="SANS"]:visible').first().click(); await sleep(500)
  /* Tuesday's card to the left edge, sideways only */
  await p.evaluate(() => {
    const day = document.querySelectorAll('#eWeek .day')[1]
    let x = day.parentElement
    while (x && !(x.scrollWidth > x.clientWidth + 40 && getComputedStyle(x).overflowX !== 'visible')) x = x.parentElement
    if (x) x.scrollLeft += day.getBoundingClientRect().left - x.getBoundingClientRect().left - 8
  })
  await sleep(600)
  const inDay = n => `#eWeek .day:nth-child(${n + 1}) .puck[data-person="${MAN}"]`
  log('r4a pucks', JSON.stringify(await p.evaluate(id => [...document.querySelectorAll(`#eWeek .day .puck[data-person="${id}"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => { const r = e.getBoundingClientRect(); return [e.className, [...e.closest('.day').parentElement.children].indexOf(e.closest('.day')), Math.round(r.left), Math.round(r.top)] }), MAN)))
  await mark(p, ['[data-hl="SANS"]'], 'Thu 16 Jul: the SANS chip is pressed', 'below')
  await shot(p, 'r4a-1-chip', ['[data-hlgrp="type"]'], 16)
  await unmark(p)
  await rowShot(p, 1, 'r4a-2-seat-tue', 'Tue 14 Jul: lit — though an ordinary WSO that day (no purple line)')
  await rowShot(p, 2, 'r4a-3-seat-wed', 'Wed 15 Jul: lit — and SANS that day (purple line)')
  log('r4a errs', JSON.stringify(errs)); await b.close()
}

/* READING 4b — who may be filed for SANS availability goes by who is SANS today */
if (ONLY.includes('r4b')) {
  const { b, p, errs } = await world('2026-07-13T09:00:00')
  await postOutSans(p, MAN, '2026-07-15')
  log('r4b posted (future)', JSON.stringify(await state(p)))
  const openAdd = async () => {
    await go(p, 'inputs'); await sleep(400)
    await p.click('#inSansMode'); await sleep(700)
    await p.locator('[data-testid="sc-day-2026-07-16"]').first().click(); await sleep(700)
    await p.locator('[data-testid="sd-add"]').first().click(); await sleep(700)
    return p.evaluate(() => [...document.querySelectorAll('[data-testid="pp"] select option')].map(o => o.textContent))
  }
  const names = await openAdd()
  log('r4b offered Mon 13', JSON.stringify(names))
  await p.locator('[data-testid="pp"]').first().evaluate(e => { let x = e; while (x.parentElement && x.getBoundingClientRect().height < 500) x = x.parentElement; x.setAttribute('data-xp', 'win') })
  await mark(p, ['[data-testid="pp"] select'], `Mon 13 Jul: Hex is not on this list (${names.join(', ')})`, 'left')
  await shot(p, 'r4b-1-commit-mon', ['[data-testid="pp"]', '[data-xp="win"]'])
  await unmark(p)
  await p.keyboard.press('Escape'); await sleep(300)
  await p.getByRole('button', { name: 'Cancel', exact: true }).first().click().catch(() => {}); await sleep(300)
  await nextDay(p); await nextDay(p)
  log('r4b Wed', JSON.stringify(await state(p)))
  const names2 = await openAdd()
  log('r4b offered Wed 15', JSON.stringify(names2))
  if (names2.includes('Hex')) await p.locator('[data-testid="pp"] select').first().selectOption({ label: 'Hex' })
  await sleep(300)
  await p.locator('[data-testid="pp"]').first().evaluate(e => { let x = e; while (x.parentElement && x.getBoundingClientRect().height < 500) x = x.parentElement; x.setAttribute('data-xp', 'win') })
  await mark(p, ['[data-testid="pp"] select'], 'Wed 15 Jul, his posting’s date: Hex can now be picked', 'left')
  await shot(p, 'r4b-2-commit-wed', ['[data-testid="pp"]', '[data-xp="win"]'])
  await unmark(p)
  log('r4b errs', JSON.stringify(errs)); await b.close()
}
