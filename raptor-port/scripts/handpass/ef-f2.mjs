/* F2 — THE FOUR STATES OF THE "ALL AVAIL" PUCK  (Fable S34, Codex 5)
   everyone a full day · everyone half · one man denied · the event switched off.
   Read on the BOARD and on both week surfaces, because the count chip only
   appears on some of them. Clean Sunday (day 6). */
import { open, board, tap, type, shot, oilMode, go, publish } from './lib.mjs'
import { modeRead, names, putSure, money, tracker, closeTracker, SUN } from './ef.mjs'

const STATE = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f98d5224-18e3-4e42-8a4f-bd4fe1b84782/scratchpad/hp/state-sat.json'
const di = 6
const R = {}
const { browser, page, errors } = await open({ state: STATE })
const NM = await names(page)
const { writeFileSync } = await import('node:fs')
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/ef-f2.json'
const save = t => { R._at = t; writeFileSync(OUT, JSON.stringify(R, null, 1)) }

const readOne = (root) => page.evaluate(sel => {
  const out = []
  for (const e of document.querySelectorAll(`${sel} .puck.allavail`)) {
    if (e.closest('#sbRoster') || e.closest('#eRoster')) continue
    const seat = e.closest('.seat') || e.parentElement
    const chip = seat && seat.querySelector('.oilcount')
    const row = e.closest('.sb-arow,.sb-row,tr,li')
    if (row && !/ALL HANDS/i.test(row.innerText || '')) continue
    out.push({
      bar: e.className.match(/oilbar-(fo|ho)/)?.[1] || (/oilbar/.test(e.className) ? 'plain-oilbar' : 'NO BAR'),
      puckTitle: e.getAttribute('title') || '',
      chip: chip ? (chip.innerText || '').trim() : 'NO CHIP',
      chipTitle: chip ? chip.getAttribute('title') || '' : '',
      chipCls: chip ? chip.className : '',
    })
  }
  return out
}, root)

/** the sentinel on the board, on the Edit Schedule week and on the View-only page */
async function threeSurfaces(tag) {
  const out = { board: await readOne('#schedBoard') }
  await shot(page, `EF-F2-${tag}-board`)
  const x = page.locator('#sbClose:visible').first(); if (await x.count()) { await x.click(); await page.waitForTimeout(700) }
  out.editWeek = await readOne('#eWeek')
  await shot(page, `EF-F2-${tag}-editweek`)
  await go(page, 'viewsched'); await page.waitForTimeout(700)
  out.viewOnly = await readOne('#vWeek')
  await shot(page, `EF-F2-${tag}-viewonly`)
  /* the chip is the only door to the list — tap it where it exists */
  const c = page.locator('#vWeek .oilcount:visible').first()
  if (await c.count()) {
    await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150)
    await c.click(); await page.waitForTimeout(800)
    out.list = await page.evaluate(() => { const t = document.getElementById('toastEl'); return t ? (t.innerText || '').replace(/\s+/g, ' ').trim() : 'NO LIST' })
    await shot(page, `EF-F2-${tag}-list`)
  } else out.list = 'NO CHIP TO TAP'
  await board(page, di)
  return out
}

await board(page, di)
await tap(page, `[data-padd="${di}"]`)
await page.waitForTimeout(400)
await type(page, `[data-bfld="ap:${di}.0.prog"]`, 'ALL HANDS')
await type(page, `[data-bfld="ap:${di}.0.str"]`, '08:00')
await type(page, `[data-bfld="ap:${di}.0.end"]`, '17:00')
R.put = await putSure(page, `[data-fill="a:${di}.0.+"]`, 'allavail', id => JSON.stringify(window.DAYS[6].allhands[0]).includes('"' + id + '"'))

/* ---- state 1: everyone earns a full day (9 hours) ---------------------- */
R.s1 = await threeSurfaces('01-all-full'); save('s1')

/* ---- state 2: everyone half (4 hours) ---------------------------------- */
await type(page, `[data-bfld="ap:${di}.0.end"]`, '12:00')
R.s2 = await threeSurfaces('02-all-half'); save('s2')

/* ---- state 3: one man denied ------------------------------------------- */
await oilMode(page, true)
const m = await modeRead(page)
R.membersInMode = m.people.filter(p => /ALL HANDS/i.test('')).length
const denied = await page.evaluate(() => {
  const el = [...document.querySelectorAll('#schedBoard [data-oilp]')].find(e => {
    const row = e.closest('.sb-arow,.sb-row,tr,li')
    if (!row || !/ALL HANDS/i.test(row.innerText || '')) return false
    const pk = e.matches('[data-person]') ? e : e.querySelector('[data-person]')
    return pk && pk.dataset.person === 'bane'
  })
  if (!el) return null
  el.scrollIntoView({ block: 'center' }); el.click(); return true
})
R.deniedRanger = denied
await page.waitForTimeout(800)
R.deniedTitle = await page.evaluate(() => {
  const el = [...document.querySelectorAll('#schedBoard [data-oilp]')].find(e => {
    const pk = e.matches('[data-person]') ? e : e.querySelector('[data-person]')
    return pk && pk.dataset.person === 'bane'
  })
  return el ? (el.innerText || '').replace(/\s+/g, ' ').trim() + ' :: ' + (el.getAttribute('title') || '') : 'GONE'
})
await oilMode(page, false)
R.s3 = await threeSurfaces('03-one-denied'); save('s3')

/* ---- state 4: the whole event switched off ----------------------------- */
await oilMode(page, true)
const items = (await modeRead(page)).items
const it = items.find(i => /ALL HANDS/i.test(i.text))
R.allHandsItem = it ? `${it.text} :: ${it.title}` : 'NOT FOUND'
if (it) { await page.locator(`#schedBoard [data-oilitem="${it.key}"]:visible`).first().click(); await page.waitForTimeout(700) }
await oilMode(page, false)
/* one of its men also earns from a desk, to prove the chip counts THIS row */
await tap(page, `[data-dradd="${di}.0"]`)
await type(page, `[data-bfld="dr:${di}.0.1.role"]`, 'LONG DESK')
await type(page, `[data-bfld="dr:${di}.0.1.str"]`, '08:00')
await type(page, `[data-bfld="dr:${di}.0.1.end"]`, '18:00')
R.deskFill = await putSure(page, `[data-fill="d:${di}.0.1.+"]`, 'slash', id => JSON.stringify(window.DAYS[6].dutywaves[0].rows[1]).includes('"' + id + '"'))
R.s4 = await threeSurfaces('04-item-off'); save('s4')

/* ---- and the money: the sentinel itself must never be paid ------------- */
await oilMode(page, true)
const items2 = (await modeRead(page)).items
const it2 = items2.find(i => /ALL HANDS/i.test(i.text))
if (it2) { await page.locator(`#schedBoard [data-oilitem="${it2.key}"]:visible`).first().click(); await page.waitForTimeout(700) }  // back on
await oilMode(page, false)
R.publish = await publish(page, di)
await page.waitForTimeout(800)
R.grid = await money(page, ['allavail', 'all', 'bane', 'slash', 'stiff'], SUN)
R.tracker = await tracker(page, ['allavail', 'bane', 'slash', 'stiff'])
await shot(page, 'EF-F2-05-money')
await closeTracker(page)
R.errors = errors.slice(0, 10)
save('done')

const D = (t, o) => {
  console.log('\n== ' + t)
  for (const k of ['board', 'editWeek', 'viewOnly']) console.log('  ' + k.padEnd(10) + JSON.stringify(o[k]))
  console.log('  list: ' + o.list)
}
console.log('sentinel placed:', R.put)
D('1. everyone a FULL day (08:00-17:00)', R.s1)
D('2. everyone HALF (08:00-12:00)', R.s2)
console.log('\ndenied Ranger:', R.deniedRanger, '|', R.deniedTitle)
D('3. one man denied', R.s3)
console.log('\nALL HANDS item:', R.allHandsItem, '| desk fill:', R.deskFill)
D('4. the whole event switched off (Blade also on a 08:00-18:00 desk)', R.s4)
console.log('\npublish:', JSON.stringify(R.publish))
console.log('leave war:', JSON.stringify(R.grid))
console.log('tracker:', JSON.stringify(R.tracker).slice(0, 900))
console.log('errors', R.errors)
await browser.close()
