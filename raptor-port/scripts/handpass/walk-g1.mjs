/* BLOCK G1 + G5 — what is usable inside the OIL mode, and do the tooltips tell
   the truth (Fable S36, S40).  Published everything-Saturday, desktop. */
import { open, board, tap, shot, publish, oilMode } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const di = 5
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

const R = {}

/* an inventory of everything a scheduler could press on the board */
const controls = () => page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const vis = el => !!(el.offsetParent || el.getClientRects().length)
  const out = { groups: {}, samples: {} }
  const add = (name, sel) => {
    const all = [...root.querySelectorAll(sel)].filter(vis)
    out.groups[name] = {
      n: all.length,
      enabled: all.filter(e => !e.disabled && e.getAttribute('aria-disabled') !== 'true' && !e.readOnly).length,
    }
    if (all[0]) out.samples[name] = {
      tag: all[0].tagName, cls: (all[0].className || '').toString().slice(0, 50),
      dis: !!all[0].disabled, ro: !!all[0].readOnly, title: (all[0].getAttribute('title') || '').slice(0, 90),
      text: (all[0].innerText || all[0].value || '').trim().slice(0, 30),
    }
  }
  add('crew palette pucks', '#sbRoster .rpuck')
  add('seat drop zones', '[data-slot]')
  add('"+ add" fill strips', '[data-fill]')
  add('typing boxes', 'input[data-bfld], textarea[data-bfld]')
  add('all text inputs', 'input:not([type=checkbox]):not([type=radio]), textarea')
  add('selects (any)', 'select')
  add('+ Line buttons', '[data-gline]')
  add('+ Wave button', '[data-wvadd]')
  add('+ Row ground', '[data-gradd]')
  add('+ Row duty', '[data-dradd]')
  add('+ Block duty', '[data-dwadd]')
  add('+ Row programme', '[data-padd]')
  add('+ Row sim', '[data-sradd]')
  add('+ Sim block', '[data-sblkadd]')
  add('+ Inputs door', '[data-inpadd]')
  add('info toggles', '[data-grinfo]')
  add('row menu buttons', '[data-mbtn]')
  add('drag grips', '[draggable="true"], .rgrip, .sechgrip')
  add('publish button', '[data-beak]')
  add('OIL item switches', '[data-oilitem][data-oilday]')
  add('OIL pucks', '[data-oilp]')
  add('OIL inert pucks', '.oilpk.inert')
  add('OIL dead name cells', '.oilitem.none')
  add('count chips', '[data-oilsent]')
  add('Nothing today earns', '[data-oilblank]')
  add('OIL Earn / Done', '[data-oilmode]')
  /* the action row + day bar, as text */
  out.daybar = ((root.querySelector('.daybar') || {}).innerText || '').replace(/\n+/g, ' | ')
  out.actionrow = ((root.querySelector('.sb-actions, .sb-arow, .abar') || {}).innerText || '').replace(/\n+/g, ' | ').slice(0, 300)
  out.tplBtn = [...root.querySelectorAll('button')].filter(vis).filter(b => /templ/i.test(b.innerText)).map(b => b.innerText.trim())
  out.planSel = [...root.querySelectorAll('select, button')].filter(vis)
    .filter(e => /plan|draft|working copy/i.test((e.innerText || '') + ' ' + (e.getAttribute('title') || '')))
    .map(e => ({ t: (e.innerText || '').trim().slice(0, 40), dis: !!e.disabled })).slice(0, 6)
  return out
})

R.outside = await controls()
await shot(page, 'G-G1-01-board-outside-mode')

/* publish the day first — S36/S40 want a published day */
R.publish = await publish(page, di)
await page.waitForTimeout(600)
R.outsidePublished = await controls()
await shot(page, 'G-G1-02-board-published')

/* --- into the mode --- */
R.modeCounts = await oilMode(page, true)
R.inside = await controls()
await shot(page, 'G-G1-03-mode-on')

/* every tooltip in the mode — G5 */
R.tips = await page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const P = window.PEOPLE
  const items = [...root.querySelectorAll('.oilitem')].map(e => ({
    kind: e.classList.contains('none') ? 'DEAD' : e.classList.contains('on') ? 'ON' : 'OFF',
    name: (e.innerText || '').trim().slice(0, 24) || '(blank)',
    item: e.getAttribute('data-oilitem') || '',
    title: e.getAttribute('title') || '',
  }))
  const pucks = [...root.querySelectorAll('.oilpk')].map(e => {
    const pk = e.querySelector('[data-person]')
    const id = e.getAttribute('data-oilp') || (pk && pk.dataset.person) || ''
    return {
      kind: e.classList.contains('inert') ? 'INERT' : e.classList.contains('on') ? 'ON' : 'OFF',
      who: (P[id] && P[id].cs) || id || '?',
      item: e.getAttribute('data-oilitem') || '',
      figure: pk ? (pk.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 14) : '',
      tappable: !!e.getAttribute('data-oilp'),
      title: e.getAttribute('title') || '',
    }
  })
  const chips = [...root.querySelectorAll('[data-oilsent], .oilcount')].map(e => ({
    text: (e.innerText || '').trim(), title: e.getAttribute('title') || '',
  }))
  const bar = [...root.querySelectorAll('.daybar [title], [data-oilmode], [data-oilblank], [data-beak]')].map(e => ({
    text: (e.innerText || '').trim().slice(0, 30), title: e.getAttribute('title') || '', dis: !!e.disabled,
  }))
  return { items, pucks, chips, bar, note: ((root.querySelector('.daybar-note') || {}).innerText || '') }
})

/* CAN a write actually be made in the mode? try to arm a seat and drop a man */
R.tryArm = await (async () => {
  const seat = page.locator('#schedBoard [data-slot]:visible').first()
  const n = await page.locator('#schedBoard [data-slot]:visible').count()
  if (!n) return { seats: 0, armed: null, note: 'no seat drop zones drawn in the mode' }
  await seat.click({ force: true }).catch(() => {})
  await page.waitForTimeout(300)
  const armed = await page.evaluate(() => (window.ARM && window.ARM.key) || null)
  return { seats: n, armed }
})()

/* try to TYPE into a time box while in the mode */
R.tryType = await page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const box = [...root.querySelectorAll('input[data-bfld]')].filter(e => e.offsetParent)[0]
  if (!box) return { found: false }
  const before = box.value
  box.focus()
  return { found: true, key: box.getAttribute('data-bfld'), disabled: !!box.disabled, readOnly: !!box.readOnly, before, focused: document.activeElement === box }
})

/* the instruction line's claim, checked against every kind of row on the day */
R.rowKinds = await page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const secs = [...root.querySelectorAll('.sb-sec, .sb-panel')]
  return secs.map(s => {
    const head = ((s.querySelector('.sb-ph, .sb-sech, h3, .sech') || {}).innerText || '').split('\n')[0].trim().slice(0, 34)
    return {
      section: head,
      switches: s.querySelectorAll('.oilitem:not(.none)').length,
      deadNames: s.querySelectorAll('.oilitem.none').length,
      liveP: s.querySelectorAll('.oilpk[data-oilp]').length,
      inertP: s.querySelectorAll('.oilpk.inert').length,
    }
  }).filter(r => r.switches + r.deadNames + r.liveP + r.inertP > 0)
})

/* a row added through the board, then the mode entered AT ONCE — does its name
   read "This row has no identity yet"? (S40's specific ask) */
await oilMode(page, false)
await tap(page, `[data-gradd="${di}"]`)
await page.waitForTimeout(400)
await oilMode(page, true)
R.freshRow = await page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  return [...root.querySelectorAll('.oilitem')].map(e => ({
    name: (e.innerText || '').trim().slice(0, 20) || '(blank)', title: (e.getAttribute('title') || '').slice(0, 80),
  })).filter(e => /no identity/i.test(e.title) || e.name === '(blank)')
})
await shot(page, 'G-G5-01-fresh-row-in-mode')

R.errors = errors.slice(0, 10)
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-21-oil/../walk-g1.json', JSON.stringify(R, null, 1))

const tbl = (o) => Object.entries(o.groups).map(([k, v]) => `  ${k.padEnd(24)} n=${String(v.n).padStart(3)}  enabled=${v.enabled}`).join('\n')
console.log('=== OUTSIDE THE MODE (draft) ===\n' + tbl(R.outside))
console.log('daybar: ' + R.outside.daybar)
console.log('=== OUTSIDE (published) ===\n' + tbl(R.outsidePublished))
console.log('publish: ' + JSON.stringify(R.publish))
console.log('=== INSIDE THE MODE ===\n' + tbl(R.inside))
console.log('daybar: ' + R.inside.daybar)
console.log('note: ' + R.tips.note)
console.log('templates btn: ' + JSON.stringify(R.inside.tplBtn) + '  (outside: ' + JSON.stringify(R.outsidePublished.tplBtn) + ')')
console.log('plan selector: ' + JSON.stringify(R.inside.planSel))
console.log('tryArm: ' + JSON.stringify(R.tryArm))
console.log('tryType: ' + JSON.stringify(R.tryType))
console.log('=== ROW KINDS IN THE MODE ===')
R.rowKinds.forEach(r => console.log(`  ${r.section.padEnd(34)} switches=${r.switches} dead=${r.deadNames} livePucks=${r.liveP} inert=${r.inertP}`))
console.log('=== ITEM SWITCH TOOLTIPS ===')
R.tips.items.forEach(i => console.log(`  [${i.kind.padEnd(4)}] ${i.name.padEnd(24)} ${i.title}`))
console.log('=== PUCK TOOLTIPS ===')
R.tips.pucks.forEach(p => console.log(`  [${p.kind.padEnd(5)}] ${p.who.padEnd(10)} fig=${(p.figure || '-').padEnd(6)} ${p.title}`))
console.log('=== CHIPS ===', JSON.stringify(R.tips.chips))
console.log('=== BAR ===')
R.tips.bar.forEach(b => console.log(`  ${(b.text || '?').padEnd(26)} dis=${b.dis} :: ${b.title}`))
console.log('=== FRESH ROW ===', JSON.stringify(R.freshRow))
console.log('errors:', R.errors)
await browser.close()
