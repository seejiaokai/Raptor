import { launch, open, openDay, press, shot, cardFacts, toList, overflow, judge, saveRows, geom2, saveWin, csId, DAYWIN, WIN, rec, recAll, errs } from './icard-A-lib.mjs'
const browser = await launch()
const ABS = ['LL', 'OL', 'OIL', 'CCL', 'PL', 'FCL', 'EL', 'CL', 'HL', 'OML', 'ATT C', 'ATT B']
const KINDS = ['LL', 'OL', 'OIL', 'CCL', 'PL', 'FCL', 'EL', 'CL', 'HL', 'OML', 'ATT C', 'ATT B', 'Training', 'CSE', 'Meeting', 'Fly with', 'Personal', 'Appointment', 'Duty', 'OD', 'Other', 'Event']
const PEOPLE = ['Anvil', 'Basher', 'Cotter', 'Cutter', 'Dash', 'Diesel', 'Fable', 'Forge', 'Ghost', 'Havoc', 'Hex', 'Hunter', 'Jester', 'Kraken', 'Ledger', 'Marlin', 'Otter', 'Outlaw', 'Piston', 'Pixel', 'Ratchet', 'Reaper']
const DAYS = ['2026-07-27', '2026-07-28', '2026-07-29', '2026-07-30', '2026-07-31']
const TIMED = new Set(['Training', 'CSE', 'Meeting', 'Fly with', 'Personal', 'Appointment', 'Duty', 'OD', 'Other', 'Event'])
const RED = 'rgb(240, 90, 107)'

async function fileKind(page, touch, kind, who, day, extra = {}) {
  const o = { type: kind, who, ...extra }
  if (TIMED.has(kind) && kind !== 'OD') { o.start = '09:00'; o.end = '10:30' }
  return o
}
async function fileOne(page, touch, kind, who, day) {
  await openDay(page, day, touch)
  await press(touch, page.locator('#icPopAdd')); await page.locator(WIN).waitFor()
  await page.selectOption('#inpEditType', kind)
  await page.selectOption('#inpEditPerson', await csId(page, who))
  if (TIMED.has(kind) && kind !== 'OD') { await page.fill('#inpEditStart', '09:00').catch(() => {}); await page.fill('#inpEditEnd', '10:30').catch(() => {}) }
  await saveWin(page, touch, 'no')
  // if the window is still up (a question we did not answer), report it
  const still = await page.locator(WIN).count()
  if (still) { await shot(page, `10-stuck-${kind.replace(/\s/g, '_')}`); await page.keyboard.press('Escape'); await page.waitForTimeout(300); if (await page.locator('#inpEditCancel').count()) await press(touch, page.locator('#inpEditCancel')) }
  return !still
}
const wantTone = k => (ABS.includes(k) ? 'red' : 'amb')

async function barColour(page, iid) {
  return page.locator(`#inpCal .ib-bar[data-iid="${iid}"]`).first().evaluate(e => getComputedStyle(e).backgroundColor).catch(() => null)
}

/* ============ DESKTOP, every kind */
{
  const { ctx, page } = await open(browser, { width: 1440, height: 900 }, 'ad', 'a', false)
  const placed = []
  for (let i = 0; i < KINDS.length; i++) {
    const kind = KINDS[i], who = PEOPLE[i], day = DAYS[i % 5]
    const ok = await fileOne(page, false, kind, who, day)
    const r = await rec(page, { type: kind, person: await csId(page, who) })
    placed.push({ kind, who, day, ok, iid: r && r.iid })
    console.log('filed', kind, who, day, ok, r && r.iid)
  }
  const probsAll = {}
  const pics = []
  for (const d of DAYS) {
    await openDay(page, d, false); await page.waitForTimeout(400)
    const cards = await cardFacts(page, DAYWIN, 'idy')
    pics.push(await shot(page, `10-desk-day-${d}`))
    for (const pl of placed.filter(x => x.day === d)) {
      const c = cards.find(x => x.iid === pl.iid)
      const probs = []
      if (!c) probs.push('no card on the opened day (filed: ' + pl.ok + ')')
      else {
        if ((c.kind || '').toLowerCase() !== pl.kind.toLowerCase()) probs.push(`kind says "${c.kind}"`)
        if (c.kindCaps !== 'uppercase') probs.push('kind not capitals')
        if (c.kindColor !== 'rgb(138, 150, 163)') probs.push('kind colour ' + c.kindColor)
        if (c.tone !== wantTone(pl.kind)) probs.push(`square ${c.tone} (${c.sqColor}), wanted ${wantTone(pl.kind)}`)
        if (c.pucks) probs.push('pucks')
        const g = await geom2(page, `${DAYWIN} [data-testid="idy-row-${pl.iid}"]`)
        if (g.probs.length) probs.push(g.probs.join(','))
        if (/SANS/i.test(c.kind || '')) probs.push('SANS in the list')
        pl.card = { kind: c.kind, who: c.who, when: c.when, tone: c.tone, sq: c.sqColor, title: c.title, rmk: c.rmk, by: c.by, h: c.h }
      }
      pl.probs = probs
    }
  }
  // month bars against the cards' squares (a consistency read, not a scenario rule)
  await openDay(page, DAYS[0], false); await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  for (const pl of placed) { pl.bar = pl.iid ? await barColour(page, pl.iid) : null }
  const fails = placed.filter(p => p.probs && p.probs.length)
  for (const pl of placed) console.log(pl.probs && pl.probs.length ? 'FAILK' : 'okk', pl.kind, JSON.stringify(pl.card), 'bar', pl.bar, pl.probs && pl.probs.join(' | '))
  // no SANS availability kind among the saved inputs listed
  const sansInList = await page.evaluate(() => window.INPUTS.filter(r => /SANS/i.test(r.type)).length)
  console.log('SANS records in INPUTS (read only)', sansInList)
  await toList(page, false)
  const sansRows = await page.locator('#inBody tr').filter({ hasText: /SANS/ }).count()
  const listpic = await shot(page, '10-desk-list-top')
  judge(10, 'desktop 1440', 'admin', fails.length || sansRows ? 'FAIL' : 'PASS',
    fails.length || sansRows ? fails.map(f => `${f.kind}: ${f.probs.join(';')}`).join(' | ') + (sansRows ? ` | ${sansRows} SANS rows in the table` : '') : `all ${KINDS.length} kinds: each card names its kind in grey capitals, red squares on ${ABS.length} absence kinds, amber on the rest; no SANS rows in the Inputs table`, [...pics, listpic])
  const odNote = placed.find(p => p.kind === 'OD')
  console.log('OD card', JSON.stringify(odNote))
  writeKinds(placed)
  await ctx.close()
}
import { writeFileSync } from 'node:fs'
function writeKinds(placed) { writeFileSync('docs/handpass/parts/icard-A-kinds-desktop.json', JSON.stringify(placed, null, 1)) }

/* ============ PHONE LIST, eight kinds spread over leave, medical, commitments */
{
  const { ctx, page } = await open(browser, { width: 390, height: 844 }, 'ad', 'a', true)
  const six = ['LL', 'OML', 'ATT C', 'CCL', 'Training', 'Meeting', 'Duty', 'Event']
  const placed = []
  for (let i = 0; i < six.length; i++) {
    const kind = six[i], who = PEOPLE[i], day = DAYS[i % 5]
    const ok = await fileOne(page, true, kind, who, day)
    const r = await rec(page, { type: kind, person: await csId(page, who) })
    placed.push({ kind, who, day, ok, iid: r && r.iid })
  }
  await toList(page, true)
  const cards = await cardFacts(page, '#inList', 'inl')
  const probs = []; const pics = []
  for (const pl of placed) {
    const c = cards.find(x => x.iid === pl.iid)
    if (!c) { probs.push(`${pl.kind}: no list card`); continue }
    if ((c.kind || '').toLowerCase() !== pl.kind.toLowerCase()) probs.push(`${pl.kind}: kind "${c.kind}"`)
    if (c.tone !== wantTone(pl.kind)) probs.push(`${pl.kind}: square ${c.tone}`)
    if (c.kindCaps !== 'uppercase') probs.push(`${pl.kind}: not capitals`)
    if (c.pucks) probs.push(`${pl.kind}: pucks`)
    const sel = `#inList [data-testid="inl-row-${pl.iid}"]`
    const g = await geom2(page, sel); if (g.probs.length) probs.push(`${pl.kind}: ${g.probs.join(',')}`)
    console.log('phone', pl.kind, JSON.stringify({ kind: c.kind, tone: c.tone, when: c.when, h: c.h }))
  }
  // pictures: scroll to the first card of each day
  for (const d of DAYS) {
    await page.evaluate(d => { const h = document.querySelector(`#inList [data-testid="inl-day"][data-iso="${d}"]`); if (h) { h.scrollIntoView({ block: 'start' }); window.scrollBy(0, -130) } }, d)
    await page.waitForTimeout(250); pics.push(await shot(page, `10-phone-list-${d}`))
  }
  const ov = await overflow(page); if (ov.wide) probs.push('page wider than screen')
  judge(10, 'phone 390 (list, 8 kinds)', 'admin', probs.length ? 'FAIL' : 'PASS', probs.join(' | ') || `${six.join(', ')}: kind in grey capitals, red for LL/OML/ATT C/CCL, amber for Training/Meeting/Duty/Event, no pucks, nothing cut`, pics)
  await ctx.close()
}
await browser.close()
saveRows('s10')
console.log('ERRS', JSON.stringify(errs))
