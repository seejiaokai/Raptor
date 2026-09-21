/* E3 — a man on FOUR rows where only TWO count            (Fable S31)
   E4 — two men on ONE line, one of them denied             (Fable S32)
   Both on the everything-Saturday (day 5), chained: E3 ends by publishing
   the day as issued, E4 then works on the published day and amends it. */
import { open, board, tap, type, put, shot, oilMode, warnings, publish, go } from './lib.mjs'
import { modeRead, bars, money, tracker, closeTracker, dayDetail, names, publishAL, putSure, SAT } from './ef.mjs'

const STATE = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f98d5224-18e3-4e42-8a4f-bd4fe1b84782/scratchpad/hp/state-sat.json'
const di = 5
const Z = 'chaps'          // Forge — free on the Saturday
const R = {}
const { browser, page, errors } = await open({ state: STATE })
const NM = await names(page)
const cs = id => NM[id] || id
const { writeFileSync } = await import('node:fs')
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/ef-e34.json'
const save = (tag) => { R._at = tag; writeFileSync(OUT, JSON.stringify(R, null, 1)) }

/** publish, but never die on it: say what the day's action row offers instead */
async function tryPublish(tag) {
  try { return await publish(page, di) } catch (e) {
    const row = await page.evaluate(() => {
      const b = document.querySelector('#schedBoard')
      return {
        beaks: [...b.querySelectorAll('[data-beak]')].map(x => `${x.dataset.beak}|${(x.innerText||'').trim()}|disabled=${x.disabled}|vis=${x.offsetParent!==null}`),
        buttons: [...b.querySelectorAll('button')].map(x => (x.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0, 40),
        text: (b.innerText||'').replace(/\s+/g,' ').slice(0, 400),
      }
    })
    return { published: false, error: String(e).slice(0, 120), row, tag }
  }
}

/** every puck for `who`, wherever the app draws it: board, edit week, view-only week */
async function everywhere(who) {
  const out = {}
  out.board = await bars(page)
  out.board = out.board.filter(p => who.includes(p.id))
  const scoped = async (root) => page.evaluate(([sel, ids]) => {
    const P = window.PEOPLE
    return [...document.querySelectorAll(`${sel} .puck[data-person]`)]
      .filter(e => !e.closest('#sbRoster') && !e.closest('#eRoster') && ids.includes(e.dataset.person))
      .map(e => ({ who: (P[e.dataset.person] || {}).cs || e.dataset.person, id: e.dataset.person,
        bar: e.className.match(/oilbar-(fo|ho)/)?.[1] || (/oilbar/.test(e.className) ? 'plain' : null),
        title: (e.getAttribute('title') || '').slice(0, 150),
        row: (e.closest('.sb-row,.sb-arow,.sb-line,tr,li,.ppl') || {}).innerText?.replace(/\s+/g, ' ').trim().slice(0, 48) || '' }))
  }, [root, who])
  /* the board is an overlay on the Edit Schedule week — close it to read the
     week itself, then the View-only page, then come back to the board */
  const x = page.locator('#sbClose:visible').first()
  if (await x.count()) { await x.click(); await page.waitForTimeout(700) }
  out.editWeek = await scoped('#eWeek')
  await go(page, 'viewsched'); await page.waitForTimeout(700)
  out.viewOnly = await scoped('#vWeek')
  await board(page, di)
  return out
}

async function look(tag, who) {
  await oilMode(page, true)
  const m = await modeRead(page)
  await shot(page, `EF-${tag}-mode`)
  await oilMode(page, false)
  const b = (await bars(page)).filter(x => who.includes(x.id))
  return { mode: m.people.filter(x => who.includes(x.id)), items: m.items.map(i => `${i.text} :: ${i.title}`), bar: b }
}

await board(page, di)

/* ============================ E3 ====================================== */
/* Z on a desk 08:00-10:00, a sim 11:00-12:00, the ⓘ ADMIN row 13:00-14:00
   and MASS BRIEF 15:00-16:00. Only the first two plus MASS BRIEF can count;
   the ⓘ row never can. */
await tap(page, `[data-dradd="${di}.0"]`)
await type(page, `[data-bfld="dr:${di}.0.3.role"]`, 'Z DESK')
await type(page, `[data-bfld="dr:${di}.0.3.str"]`, '08:00')
await type(page, `[data-bfld="dr:${di}.0.3.end"]`, '10:00')
R.f1 = await put(page, `[data-fill="d:${di}.0.3.+"]`, [Z])

await tap(page, `[data-sradd="${di}.oft"]`)
await type(page, `[data-bfld="sr:${di}.oft.1.label"]`, 'EP-9')
await type(page, `[data-bfld="sr:${di}.oft.1.str"]`, '11:00')
await type(page, `[data-bfld="sr:${di}.oft.1.end"]`, '12:00')
R.f2 = await put(page, `[data-slot="s:${di}.oft.1.p"]`, [Z])

R.f3 = await put(page, `[data-fill="g:${di}.1.+"]`, [Z])      // the ⓘ ADMIN row
R.f4 = await putSure(page, `[data-fill="a:${di}.1.+"]`, Z,
  id => JSON.stringify(window.DAYS[5].allhands[1]).includes('"' + id + '"'))   // MASS BRIEF

R.e3_start = await look('E3-01-four-rows', [Z])
save('e3-start')
R.e3_startEverywhere = await everywhere([Z])

/* switch MASS BRIEF off for everyone */
await oilMode(page, true)
let m = await modeRead(page)
const mb = m.items.find(i => /MASS BRIEF/i.test(i.text))
R.e3_massBriefItem = mb ? `${mb.text} :: ${mb.title}` : 'NOT FOUND'
if (mb) { await page.locator(`#schedBoard [data-oilitem="${mb.key}"]:visible`).first().click(); await page.waitForTimeout(700) }
R.e3_massOffMode = (await modeRead(page)).people.filter(p => p.id === Z)
await shot(page, 'EF-E3-02-massbrief-off-mode')
await oilMode(page, false)
R.e3_massOffBars = (await bars(page)).filter(p => p.id === Z)

/* put it back on, then take Z off MASS BRIEF alone */
await oilMode(page, true)
m = await modeRead(page)
const mb2 = m.items.find(i => /MASS BRIEF/i.test(i.text))
R.e3_massBriefItemOff = mb2 ? `${mb2.text} :: ${mb2.title}` : 'NOT FOUND'
if (mb2) { await page.locator(`#schedBoard [data-oilitem="${mb2.key}"]:visible`).first().click(); await page.waitForTimeout(700) }
m = await modeRead(page)
const zOnMass = m.people.filter(p => p.id === Z)
R.e3_zPucksInMode = zOnMass.map(p => `${p.key} :: ${p.text} :: ${p.title}`)
/* the MASS BRIEF person-puck is the one inside the Common Programme row */
const zMass = await page.evaluate(([id]) => {
  const el = [...document.querySelectorAll('#schedBoard [data-oilp]')].find(e => {
    const pk = e.matches('[data-person]') ? e : e.querySelector('[data-person]')
    if (!pk || pk.dataset.person !== id) return false
    const row = e.closest('.sb-arow, .sb-row, tr, li')
    return !!row && /MASS BRIEF/i.test(row.innerText || '')
  })
  if (!el) return null
  el.scrollIntoView({ block: 'center' }); el.click(); return el.dataset.oilp
}, [Z])
R.e3_zMassTapped = zMass
await page.waitForTimeout(800)
R.e3_zOffMassMode = (await modeRead(page)).people.filter(p => p.id === Z).map(p => `${p.text} :: ${p.title}`)
await shot(page, 'EF-E3-03-z-off-massbrief-mode')
await oilMode(page, false)
R.e3_zOffMassBars = (await bars(page)).filter(p => p.id === Z)
await shot(page, 'EF-E3-04-z-off-massbrief')
R.e3_warn = await warnings(page)

/* publish the day as issued */
save('before-publish-orig')
R.publishOrig = await tryPublish('orig')
save('after-publish-orig')
await page.waitForTimeout(800)
await shot(page, 'EF-E3-05-published-orig')
R.e3_barsPublished = (await bars(page)).filter(p => p.id === Z)
R.e3_grid = await money(page, [Z], SAT)
R.e3_detail = await dayDetail(page, Z, SAT)
R.e3_tracker = await tracker(page, [Z])
await shot(page, 'EF-E3-06-oil-tracker')
await closeTracker(page)
await board(page, di)

/* ============================ E4 ====================================== */
/* COBRA 14:00-15:30 carries Ridge (razer) and Grit (sufa). Deny Ridge only. */
await oilMode(page, true)
m = await modeRead(page)
R.e4_before = m.people.filter(p => ['razer', 'sufa'].includes(p.id)).map(p => `${cs(p.id)} :: ${p.text} :: ${p.title}`)
const ridge = await page.evaluate(() => {
  const el = [...document.querySelectorAll('#schedBoard [data-oilp]')].find(e => {
    const pk = e.matches('[data-person]') ? e : e.querySelector('[data-person]')
    if (!pk || pk.dataset.person !== 'razer') return false
    const row = e.closest('.sb-line, .sb-row, tr, li')
    return !!row && /COBRA/i.test(row.innerText || '')
  })
  if (!el) return null
  el.scrollIntoView({ block: 'center' }); el.click(); return el.dataset.oilp
})
R.e4_ridgeTapped = ridge
await page.waitForTimeout(800)
R.e4_afterTapMode = (await modeRead(page)).people.filter(p => ['razer', 'sufa'].includes(p.id)).map(p => `${cs(p.id)} :: ${p.text} :: ${p.title}`)
await shot(page, 'EF-E4-01-ridge-denied-mode')
await oilMode(page, false)     /* ✓ Done */
await page.waitForTimeout(600)
await shot(page, 'EF-E4-02-ridge-denied-board')
R.e4_pendingChip = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  return (b.innerText || '').split('\n').filter(l => /change/i.test(l)).slice(0, 4)
})
R.e4_everywhereBeforeAL = await everywhere(['razer', 'sufa'])
save('e4-before-al')
R.e4_gridBeforeAL = await money(page, ['razer', 'sufa'], SAT)
await board(page, di)
R.e4_signState = await (await import('./lib.mjs')).signState(page, di)
save('before-publish-al1')
R.publishAL1 = await publishAL(page, di)
save('after-publish-al1')
await page.waitForTimeout(900)
await shot(page, 'EF-E4-03-al1-published')
R.e4_everywhereAfterAL = await everywhere(['razer', 'sufa'])
R.e4_gridAfterAL = await money(page, ['razer', 'sufa'], SAT)
R.e4_tracker = await tracker(page, ['razer', 'sufa'])
await shot(page, 'EF-E4-04-oil-tracker')
await closeTracker(page)
await board(page, di)
R.e4_history = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const h = b.querySelector('#sbHist, [data-hist], .sb-hist')
  return h ? (h.innerText || '').replace(/\s+/g, ' ').slice(0, 500) : null
})

R.errors = errors.slice(0, 10)
save('done')

console.log('fills', R.f1, R.f2, R.f3, R.f4)
console.log('\n=== E3: Forge on four rows ===')
R.e3_start.mode.forEach(x => console.log('  MODE ' + x.text.padEnd(12) + x.title))
R.e3_start.bar.forEach(x => console.log('  BAR  ' + String(x.bar).padEnd(8) + x.row.padEnd(34) + x.title))
console.log('  -- edit week:'); R.e3_startEverywhere.editWeek.forEach(x => console.log('     ' + String(x.bar).padEnd(8) + x.row))
console.log('  -- view only:'); R.e3_startEverywhere.viewOnly.forEach(x => console.log('     ' + String(x.bar).padEnd(8) + x.row))
console.log('\n  MASS BRIEF item:', R.e3_massBriefItem)
console.log('  after MASS BRIEF switched OFF:'); R.e3_massOffMode.forEach(x => console.log('     MODE ' + x.text + ' :: ' + x.title)); R.e3_massOffBars.forEach(x => console.log('     BAR  ' + String(x.bar).padEnd(8) + x.row))
console.log('\n  Z pucks in mode after switching back on:'); R.e3_zPucksInMode.forEach(s => console.log('     ' + s))
console.log('  tapped Z on MASS BRIEF:', R.e3_zMassTapped)
console.log('  after Z taken off MASS BRIEF:'); R.e3_zOffMassMode.forEach(s => console.log('     MODE ' + s)); R.e3_zOffMassBars.forEach(x => console.log('     BAR  ' + String(x.bar).padEnd(8) + x.row))
console.log('\n  warnings:', JSON.stringify(R.e3_warn))
console.log('  publish ORIG:', JSON.stringify(R.publishOrig))
console.log('  bars after publish:'); R.e3_barsPublished.forEach(x => console.log('     ' + String(x.bar).padEnd(8) + x.row))
console.log('  leave war:', JSON.stringify(R.e3_grid))
console.log('  day detail:', (R.e3_detail || '').slice(0, 400))
console.log('  tracker:', JSON.stringify((R.e3_tracker[Z] || {}).entries).slice(0, 600))

console.log('\n=== E4: Ridge denied on COBRA ===')
console.log('  before:'); R.e4_before.forEach(s => console.log('     ' + s))
console.log('  tapped:', R.e4_ridgeTapped)
console.log('  after:'); R.e4_afterTapMode.forEach(s => console.log('     ' + s))
console.log('  pending chip:', JSON.stringify(R.e4_pendingChip))
const dump = (t, e) => { console.log('  ' + t); for (const k of ['board', 'editWeek', 'viewOnly']) { console.log('    ' + k + ':'); (e[k] || []).forEach(x => console.log('       ' + x.who.padEnd(8) + String(x.bar).padEnd(8) + x.row)) } }
dump('BEFORE AL1', R.e4_everywhereBeforeAL)
console.log('  leave war BEFORE AL1:', JSON.stringify(R.e4_gridBeforeAL))
console.log('  sign state:', JSON.stringify(R.e4_signState))
console.log('  publish AL1:', JSON.stringify(R.publishAL1))
dump('AFTER AL1', R.e4_everywhereAfterAL)
console.log('  leave war AFTER AL1:', JSON.stringify(R.e4_gridAfterAL))
console.log('  tracker:', JSON.stringify(R.e4_tracker).slice(0, 700))
console.log('  history:', R.e4_history)
console.log('\nerrors', R.errors)
await browser.close()
