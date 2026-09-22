/* E3 (proper) — a man on FOUR rows where only TWO count, plus a probe of the
   Common Programme row's "+ ADD" when it already carries two men. */
import { open, board, tap, type, put, shot, oilMode, warnings, publish } from './lib.mjs'
import { modeRead, bars, money, tracker, closeTracker, dayDetail, names, putSure, SAT } from './ef.mjs'

const STATE = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f98d5224-18e3-4e42-8a4f-bd4fe1b84782/scratchpad/hp/state-sat.json'
const di = 5
const Z = 'chaps'
const R = {}
const { browser, page, errors } = await open({ state: STATE })
const NM = await names(page)
const { writeFileSync } = await import('node:fs')
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/ef-e3b.json'
const save = t => { R._at = t; writeFileSync(OUT, JSON.stringify(R, null, 1)) }

await board(page, di)

/* ---------- probe: can a THIRD man go on MASS BRIEF at all? ------------- */
R.massBefore = await page.evaluate(() => JSON.stringify(window.DAYS[5].allhands[1]))
R.addZone = await page.evaluate(() => {
  const e = [...document.querySelectorAll('#schedBoard [data-fill="a:5.1.+"]')].find(x => x.offsetParent !== null)
  return e ? { text: (e.innerText || '').trim(), cls: e.className, title: e.getAttribute('title') || '' } : 'NO VISIBLE ADD ZONE'
})
await tap(page, `[data-fill="a:${di}.1.+"]`)
R.armAfterTap = await page.evaluate(() => window.ARM && window.ARM.key)
await shot(page, 'EF-E3-00-massbrief-armed')
if (R.armAfterTap) {
  const p = page.locator(`#sbRoster .rpuck[data-person="${Z}"]:visible`).first()
  R.rosterOffersForge = await p.count() > 0
  if (await p.count()) { await p.click(); await page.waitForTimeout(700) }
}
R.massAfter = await page.evaluate(() => JSON.stringify(window.DAYS[5].allhands[1]))
R.massThirdLanded = R.massAfter.includes('"' + Z + '"')
await shot(page, 'EF-E3-00b-massbrief-after-add')
save('probe')

/* ---------- the four rows, using a programme row of its own ------------- */
await tap(page, `[data-dradd="${di}.0"]`)
await type(page, `[data-bfld="dr:${di}.0.3.role"]`, 'Z DESK')
await type(page, `[data-bfld="dr:${di}.0.3.str"]`, '08:00')
await type(page, `[data-bfld="dr:${di}.0.3.end"]`, '10:00')
R.f1 = await putSure(page, `[data-fill="d:${di}.0.3.+"]`, Z, id => JSON.stringify(window.DAYS[5].dutywaves[0].rows[3]).includes('"' + id + '"'))

await tap(page, `[data-sradd="${di}.oft"]`)
await type(page, `[data-bfld="sr:${di}.oft.1.label"]`, 'EP-9')
await type(page, `[data-bfld="sr:${di}.oft.1.str"]`, '11:00')
await type(page, `[data-bfld="sr:${di}.oft.1.end"]`, '12:00')
R.f2 = await putSure(page, `[data-slot="s:${di}.oft.1.p"]`, Z, id => JSON.stringify(window.DAYS[5].sims.oft[1]).includes('"' + id + '"'))

R.f3 = await putSure(page, `[data-fill="g:${di}.1.+"]`, Z, id => JSON.stringify(window.DAYS[5].ground[1]).includes('"' + id + '"'))  // the ⓘ ADMIN row

await tap(page, `[data-padd="${di}"]`)
await page.waitForTimeout(400)
R.progRows = await page.evaluate(() => window.DAYS[5].allhands.length)
const pr = R.progRows - 1
await type(page, `[data-bfld="ap:${di}.${pr}.prog"]`, 'LATE BRIEF')
await type(page, `[data-bfld="ap:${di}.${pr}.str"]`, '15:00')
await type(page, `[data-bfld="ap:${di}.${pr}.end"]`, '16:00')
R.f4 = await putSure(page, `[data-fill="a:${di}.${pr}.+"]`, Z, id => JSON.stringify(window.DAYS[5].allhands[window.DAYS[5].allhands.length - 1]).includes('"' + id + '"'))
save('built')

const zRows = () => page.evaluate(() => {
  const P = window.PEOPLE
  return [...document.querySelectorAll('#schedBoard .puck[data-person="chaps"]')]
    .filter(e => !e.closest('#sbRoster'))
    .map(e => ({
      bar: e.className.match(/oilbar-(fo|ho)/)?.[1] || (/oilbar/.test(e.className) ? 'plain' : 'NO BAR'),
      title: (e.getAttribute('title') || ''),
      row: (e.closest('.sb-row,.sb-arow,.sb-line,tr,li') || {}).innerText?.replace(/\s+/g, ' ').trim().slice(0, 46) || '',
    }))
})
const zMode = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilp]')]
  .filter(e => { const pk = e.matches('[data-person]') ? e : e.querySelector('[data-person]'); return pk && pk.dataset.person === 'chaps' })
  .map(e => ({ text: (e.innerText || '').replace(/\s+/g, ' ').trim(), title: e.getAttribute('title') || '',
    row: (e.closest('.sb-row,.sb-arow,.sb-line,tr,li') || {}).innerText?.replace(/\s+/g, ' ').trim().slice(0, 46) || '' })))

async function look(tag) {
  await oilMode(page, true); const m = await zMode(); await shot(page, `EF-E3-${tag}-mode`)
  await oilMode(page, false); const b = await zRows(); await shot(page, `EF-E3-${tag}`)
  return { mode: m, bar: b }
}

R.start = await look('11-four-rows'); save('start')

/* switch LATE BRIEF off for everyone */
await oilMode(page, true)
let m = await modeRead(page)
const lb = m.items.find(i => /LATE BRIEF/i.test(i.text))
R.lateBriefItem = lb ? `${lb.text} :: ${lb.title}` : 'NOT FOUND'
if (lb) { await page.locator(`#schedBoard [data-oilitem="${lb.key}"]:visible`).first().click(); await page.waitForTimeout(700) }
R.offMode = await zMode(); await shot(page, 'EF-E3-12-latebrief-off-mode')
await oilMode(page, false); R.offBars = await zRows(); await shot(page, 'EF-E3-12b-latebrief-off')
save('switched-off')

/* put it back on */
await oilMode(page, true)
m = await modeRead(page)
const lb2 = m.items.find(i => /LATE BRIEF/i.test(i.text))
R.lateBriefItemOff = lb2 ? `${lb2.text} :: ${lb2.title}` : 'NOT FOUND'
if (lb2) { await page.locator(`#schedBoard [data-oilitem="${lb2.key}"]:visible`).first().click(); await page.waitForTimeout(700) }
R.backOnMode = await zMode()

/* now take Z off LATE BRIEF alone */
const tapped = await page.evaluate(() => {
  const el = [...document.querySelectorAll('#schedBoard [data-oilp]')].find(e => {
    const pk = e.matches('[data-person]') ? e : e.querySelector('[data-person]')
    if (!pk || pk.dataset.person !== 'chaps') return false
    const row = e.closest('.sb-arow, .sb-row, tr, li')
    return !!row && /LATE BRIEF/i.test(row.innerText || '')
  })
  if (!el) return null
  el.scrollIntoView({ block: 'center' }); el.click(); return true
})
R.zTapped = tapped
await page.waitForTimeout(800)
R.zOffMode = await zMode(); await shot(page, 'EF-E3-13-z-off-latebrief-mode')
await oilMode(page, false); R.zOffBars = await zRows(); await shot(page, 'EF-E3-13b-z-off-latebrief')
R.warn = await warnings(page)
save('z-off')

R.publish = await publish(page, di)
await page.waitForTimeout(800)
R.barsPublished = await zRows()
await shot(page, 'EF-E3-14-published')
R.grid = await money(page, [Z], SAT)
R.detail = await dayDetail(page, Z, SAT)
R.tracker = await tracker(page, [Z])
await shot(page, 'EF-E3-15-oil-tracker')
await closeTracker(page)
R.errors = errors.slice(0, 10)
save('done')

console.log('MASS BRIEF before:', R.massBefore)
console.log('add zone:', JSON.stringify(R.addZone), 'armed:', R.armAfterTap, 'roster offered Forge:', R.rosterOffersForge)
console.log('MASS BRIEF after:', R.massAfter, '| third landed?', R.massThirdLanded)
console.log('\nfills:', R.f1, R.f2, R.f3, R.f4, '| programme rows:', R.progRows)
const D = (t, o) => { console.log('\n== ' + t); (o.mode || []).forEach(x => console.log('  MODE ' + x.text.padEnd(12) + x.row.padEnd(32) + x.title)); (o.bar || []).forEach(x => console.log('  BAR  ' + String(x.bar).padEnd(8) + x.row.padEnd(32) + x.title)) }
D('four rows', R.start)
console.log('\nLATE BRIEF item:', R.lateBriefItem)
D('LATE BRIEF switched off', { mode: R.offMode, bar: R.offBars })
console.log('\nback on:', JSON.stringify(R.backOnMode.map(x => x.text + '|' + x.row)))
console.log('tapped Z on LATE BRIEF:', R.zTapped)
D('Z taken off LATE BRIEF', { mode: R.zOffMode, bar: R.zOffBars })
console.log('\nwarn:', JSON.stringify(R.warn))
console.log('publish:', JSON.stringify(R.publish))
D('after publish', { bar: R.barsPublished })
console.log('grid:', JSON.stringify(R.grid))
console.log('DAY DETAIL:', R.detail)
console.log('tracker:', JSON.stringify(R.tracker))
console.log('errors', R.errors)
await browser.close()
