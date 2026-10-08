// THE WALK of [CAL-NOTE-WITH-PUCKS] and [CAL-DAY-LINES-COMPACT] (owner D684, D688, D689, D692, D694, D695; D699, D701 —
// the night of 9 Oct 26, D708). It drives the BUILT app through the day opened on the Inputs calendar with the app's
// own controls — a real finger on a phone, a mouse on a desktop — and says PASS or FAIL for each thing a person would
// see, with a picture of each. A PASS means the right behaviour; re-running it on a fixed build IS the re-walk.
//
//   node scripts/handpass/note-pucks-walk.mjs <out dir>          (the built bundle on :4180)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const OUT = process.argv[2] || 'docs/img/handpass/2026-10-09-note-pucks'
mkdirSync(OUT, { recursive: true })
/* NOT `?fresh=1`: that boot keeps everything in memory only, and this walk reloads to see what was SAVED. Every
   browser context here is a new one, so each starts from the demo all the same. */
const URL = process.env.LOOK_URL || 'http://localhost:4180/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const ISO = '2026-07-16'
let n = 0, fails = 0
const errors = []
const say = (ok, what, detail = '') => { if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}${detail ? ' — ' + detail : ''}`) }
const shot = async (page, name) => { const f = `${String(++n).padStart(2, '0')}-${name}.png`; await page.screenshot({ path: join(OUT, f) }); return f }
const win = '[data-testid="win-inputsday"]'

async function open(kind, who = ['ad', 'a']) {
  const phone = kind === 'phone'
  const ctx = await browser.newContext(phone ? { viewport: { width: 390, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(kind + ': ' + e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(kind + ': ' + m.text()) })
  await page.goto(URL)
  await page.fill('#luser', who[0]); await page.fill('#lpass', who[1]); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('inputs')); await page.waitForSelector('#inpCal')
  for (let i = 0; i < 40; i++) {
    const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) break
    await page.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
  const press = sel => phone ? page.locator(sel).first().tap() : page.locator(sel).first().click()
  const openDay = async () => { phone ? await page.locator(`#inpCal [data-icday="${ISO}"]`).tap({ position: { x: 10, y: 10 } }) : await page.locator(`#inpCal [data-icday="${ISO}"]`).click({ position: { x: 10, y: 10 } }); await page.locator(win).waitFor(); await page.waitForTimeout(400) }
  return { ctx, page, press, openDay, phone }
}
/* the day's notes AS THE WINDOW DRAWS THEM: each note's words, and its people slot by slot ('' a held gap) */
const notes = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] .ic-sec[data-sec]')].map(sec => ({ id: sec.getAttribute('data-sec'),
  text: (sec.querySelector('.ic-poppuck-txt') || { textContent: '' }).textContent, ids: [...sec.querySelectorAll('.ic-secpk')].map(c => c.classList.contains('ic-secpk-gap') ? '' : (c.querySelector('[data-person]') || c).getAttribute('data-person') || '?') })))
const geo = (page, id) => page.evaluate(id => {
  const box = document.querySelector(`[data-testid="idy-note-${id}"]`); if (!box) return null
  const b = box.getBoundingClientRect(), pk = [...box.querySelectorAll('.ic-secpk:not(.ic-secpk-gap) .puck')].map(p => p.getBoundingClientRect())
  const add = box.querySelector('.ic-secpk-grid .ic-pkadd'), txt = box.querySelector('.ic-poppuck-txt')
  const row1 = pk.filter(p => Math.abs(p.top - pk[0].top) < 3)
  return { h: Math.round(b.height), across: row1.length, left: pk.length ? +(pk[0].left - b.left).toFixed(1) : null, right: row1.length ? +(b.right - row1[row1.length - 1].right).toFixed(1) : null,
    wordsH: txt ? Math.round(txt.getBoundingClientRect().height) : 0, addLast: !!add && add === add.parentElement.lastElementChild, off: document.documentElement.scrollWidth - window.innerWidth }
}, id)
const firstInputTop = page => page.evaluate(() => { const w = document.querySelector('[data-testid="win-inputsday"]').getBoundingClientRect(), r = [...document.querySelectorAll('[data-testid^="idy-row-"]')].map(x => x.getBoundingClientRect()); return { whole: r.filter(x => x.bottom <= w.bottom - 2).length, of: r.length } })

for (const kind of ['phone', 'desktop']) {
  console.log(`\n== ${kind} ==`)
  const { ctx, page, press, openDay, phone } = await open(kind)
  await openDay()
  say(await page.locator('#icAddPucks').count() === 0, `${kind}: the bar has "+ Note" and no "+ Pucks"`)
  /* 1. a note of words */
  await press('#icAddPuck')
  await page.locator('.ic-newnote .ic-poppuck-edit').fill('Brief the new guys, 0800')
  await shot(page, `${kind}-new-note-box`)
  await page.locator('.ic-newnote .ic-poppuck-edit').press('Enter'); await page.waitForTimeout(250)
  let ns = await notes(page)
  say(ns.length === 1 && ns[0].text === 'Brief the new guys, 0800' && !ns[0].ids.length, `${kind}: Enter makes a note of words`, JSON.stringify(ns))
  const id = ns[0].id
  let g = await geo(page, id)
  say(g.h <= 34, `${kind}: a note of words alone is one slim line`, `${g.h}px tall`)
  await shot(page, `${kind}-words-only`)
  /* 2. its small "+" adds people to it */
  await press(`[data-testid="idy-note-${id}"] [data-pkadd]`); await page.locator('.ic-pick').waitFor()
  for (const i of [3, 9, 14, 20, 26]) await press(`.ic-pick .ic-pickp >> nth=${i}`)
  await shot(page, `${kind}-picker`)
  await press('#icPickOk'); await page.waitForTimeout(400)
  ns = await notes(page)
  say(ns.length === 1 && ns[0].ids.filter(Boolean).length === 5, `${kind}: the five picked land on that note, not a new one`, `${ns.length} note(s), ${ns[0].ids.length} people`)
  g = await geo(page, id)
  say(g.across === 4, `${kind}: its people stand four across`, `${g.across} in the first row`)
  say(g.addLast, `${kind}: the dashed "+" is the last of them`)
  if (phone) {
    say(Math.abs(g.left - g.right) <= 1.5, `${kind}: the fourth puck is as far from the right border as the first from the left (D694)`, `${g.left} left, ${g.right} right`)
    say(g.wordsH <= 28 && g.h <= 82, `${kind}: the words line is slim and the whole note compact (D692: 77 on the drawing)`, `words ${g.wordsH}px, note ${g.h}px`)
    const f = await firstInputTop(page); say(f.whole >= 3, `${kind}: the day's inputs are still in sight under it`, `${f.whole} of ${f.of} whole on the first screen`)
  }
  say(g.off <= 0, `${kind}: nothing runs off sideways`)
  await shot(page, `${kind}-words-and-people`)
  /* 3. a man taken off by a right-click (desktop) — his place is held */
  if (!phone) {
    await page.locator(`[data-testid="idy-note-${id}"] .ic-secpk:not(.ic-secpk-gap)`).nth(1).click({ button: 'right' }); await page.waitForTimeout(250)
    ns = await notes(page)
    say(ns[0].ids.length === 5 && ns[0].ids[1] === '' && ns[0].ids.filter(Boolean).length === 4, `${kind}: a right-click takes a man off and holds his place`, JSON.stringify(ns[0].ids))
    await shot(page, `${kind}-gap-held`)
  }
  /* 4. a puck dragged onto another swaps; dragged off the note is taken off (D689) */
  const centre = async sel => { const b = await page.locator(sel).first().boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 } }
  const drag = async (from, to) => {
    if (phone) {
      const cdp = await ctx.newCDPSession(page), t = (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: p ? [{ x: p.x, y: p.y, id: 1 }] : [] })
      await t('touchStart', from); for (let i = 1; i <= 8; i++) await t('touchMove', { x: from.x + (to.x - from.x) * i / 8, y: from.y + (to.y - from.y) * i / 8 }); await t('touchEnd')
    } else { await page.mouse.move(from.x, from.y); await page.mouse.down(); for (let i = 1; i <= 8; i++) await page.mouse.move(from.x + (to.x - from.x) * i / 8, from.y + (to.y - from.y) * i / 8); await page.mouse.up() }
    await page.waitForTimeout(350)
  }
  let before = (await notes(page))[0].ids.slice()
  const cellSel = i => `[data-testid="idy-note-${id}"] .ic-secpk[data-pkidx="${i}"]`
  const a0 = before.findIndex(Boolean), a1 = before.findIndex((x, i) => i > a0 && x)
  await drag(await centre(cellSel(a0)), await centre(cellSel(a1)))
  let after = (await notes(page))[0].ids
  say(after[a0] === before[a1] && after[a1] === before[a0], `${kind}: a puck dragged onto another swaps the two`, `${JSON.stringify(before)} → ${JSON.stringify(after)}`)
  before = after.slice()
  const from = await centre(cellSel(a0)), wb = await page.locator(win).boundingBox()
  await drag(from, { x: from.x, y: Math.min(wb.y + wb.height - 30, from.y + 220) })
  after = (await notes(page))[0]?.ids || []
  say(after.filter(Boolean).length === before.filter(Boolean).length - 1 && !after.includes(before[a0]), `${kind}: a puck dragged off the note is taken off it`, `${before.filter(Boolean).length} → ${after.filter(Boolean).length}`)
  await shot(page, `${kind}-after-drags`)
  /* 5. the pencil: its words changed, its people kept; the words emptied, the note stays as its people */
  await press(`[data-testid="idy-note-${id}"] [data-ppedit]`)
  await page.locator(`[data-testid="idy-note-${id}"] .ic-poppuck-edit`).fill('')
  await page.locator(`[data-testid="idy-note-${id}"] .ic-poppuck-edit`).press('Enter'); await page.waitForTimeout(250)
  ns = await notes(page)
  say(ns.length === 1 && ns[0].text === '' && ns[0].ids.filter(Boolean).length > 0, `${kind}: its words taken away, the note stays as its people (D695)`, JSON.stringify(ns))
  g = await geo(page, id)
  say(await page.locator(`[data-testid="idy-note-${id}"] .ic-poppuck-txt`).count() === 0, `${kind}: a note of people and no words draws no line of words`, `${g.h}px tall`)
  await shot(page, `${kind}-people-only`)
  /* 6. a reload keeps it (what is saved) */
  await page.waitForTimeout(600); await page.reload(); await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  /* 7. the month's cell shows it; the last man off a note with no words takes the note with him */
  await page.evaluate(() => window.go('inputs')); await page.waitForSelector('#inpCal')
  for (let i = 0; i < 40; i++) { const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/); const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name))); if (!d) break; await page.locator(d > 0 ? '#icNext' : '#icPrev').click() }
  const chips = await page.locator(`[data-ichead="${ISO}"] .ic-pks .ic-pk`).count()
  await shot(page, `${kind}-month-cell`)
  await openDay()
  const kept = (await notes(page)).find(x => x.id === id)
  say(!!kept && kept.text === '' && kept.ids.filter(Boolean).length === ns[0].ids.filter(Boolean).length, `${kind}: after a reload the note is still there, its people with it`, JSON.stringify(kept))
  say(!!kept && chips === kept.ids.filter(Boolean).length, `${kind}: the month's cell shows the note's people`, `${chips} small pucks`)
  for (let k = 0; k < 6; k++) {
    const cur = (await notes(page)).find(x => x.id === id); if (!cur) break
    const ix = cur.ids.findIndex(Boolean), c = await centre(cellSel(ix)), w2 = await page.locator(win).boundingBox()
    await drag(c, { x: c.x, y: Math.min(w2.y + w2.height - 30, c.y + 220) })
  }
  say(!(await notes(page)).some(x => x.id === id), `${kind}: the last man off a note with no words takes the note with him`)
  /* 8. a note of people made in one go from "+ Note" → "+ people" */
  await press('#icAddPuck'); await press('#icNewNotePpl'); await page.locator('.ic-pick').waitFor()
  for (const i of [2, 5, 8]) await press(`.ic-pick .ic-pickp >> nth=${i}`)
  await press('#icPickOk'); await page.waitForTimeout(350)
  ns = await notes(page)
  say(ns.length === 1 && ns[0].text === '' && ns[0].ids.length === 3, `${kind}: "+ Note" then "+ people" makes one note of people and no words`, JSON.stringify(ns))
  await shot(page, `${kind}-people-only-made-in-one-go`)
  /* 9. Undo takes the note back, Redo puts it back */
  await page.evaluate(() => window.undo && window.undo()); await page.waitForTimeout(200)
  const gone = (await notes(page)).length === 0
  await page.evaluate(() => window.redo && window.redo()); await page.waitForTimeout(200)
  say(gone && (await notes(page)).length === 1, `${kind}: Undo takes the new note away and Redo puts it back`)
  /* 10. the shorter input cards (D701) under it */
  const card = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="idy-row-"]')].map(r => { const f = r.querySelector('.sd-foot'), k = r.querySelector('.sd-rmk'), p = r.querySelector('[data-testid="idy-placed"]'); return { h: Math.round(r.getBoundingClientRect().height), sameLine: !!(k && p) && Math.abs(k.getBoundingClientRect().top - p.getBoundingClientRect().top) < 4, placed: p ? p.textContent : '', foot: !!f } }))
  say(card.some(c => c.sameLine) && card.every(c => !/^Placed by/.test(c.placed)), `${kind}: an input's remark and who placed it share a line, the small print short (D701)`, JSON.stringify(card.map(c => c.h)))
  await shot(page, `${kind}-day-with-cards`)
  await ctx.close()
}
/* a member: reads a note and its people, changes nothing */
{
  console.log('\n== a member ==')
  /* a member's own session cannot be given a note by the page (nothing is saved across the fresh boot), so his view
     is checked on what an admin saved in THIS browser: sign out, sign in as the member */
  const ctx = await browser.newContext({ viewport: { width: 390, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.goto(URL); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('inputs')); await page.waitForSelector('#inpCal')
  for (let i = 0; i < 40; i++) { const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/); const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name))); if (!d) break; await page.locator(d > 0 ? '#icNext' : '#icPrev').click() }
  await page.locator(`#inpCal [data-icday="${ISO}"]`).tap({ position: { x: 10, y: 10 } }); await page.locator(win).waitFor()
  await page.locator('#icAddPuck').tap(); await page.locator('.ic-newnote .ic-poppuck-edit').fill('For everyone to read'); await page.locator('#icNewNotePpl').tap(); await page.locator('.ic-pick').waitFor()
  for (const i of [1, 4]) await page.locator('.ic-pick .ic-pickp').nth(i).tap()
  await page.locator('#icPickOk').tap(); await page.waitForTimeout(400)
  await page.waitForTimeout(600); await page.reload()
  await page.waitForSelector('#luser'); await page.fill('#luser', 'us'); await page.fill('#lpass', 'us'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('inputs')); await page.waitForSelector('#inpCal')
  for (let i = 0; i < 40; i++) { const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/); const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name))); if (!d) break; await page.locator(d > 0 ? '#icNext' : '#icPrev').click() }
  await page.locator(`#inpCal [data-icday="${ISO}"]`).tap({ position: { x: 10, y: 10 } }); await page.locator(win).waitFor(); await page.waitForTimeout(300)
  const m = await page.evaluate(() => { const b = document.querySelector('[data-testid^="idy-note-"]'); return b ? { words: (b.querySelector('.ic-poppuck-txt') || {}).textContent, pucks: b.querySelectorAll('.ic-secpk .puck').length, buttons: b.querySelectorAll('button').length, handle: !!document.querySelector('.ic-sechandle'), addNote: !!document.querySelector('#icAddPuck') } : null })
  say(!!m && m.words === 'For everyone to read' && m.pucks === 2, 'a member sees the note an admin saved: its words and its two people', JSON.stringify(m))
  say(!!m && m.buttons === 0 && !m.handle && !m.addNote, 'a member has no "+", no pencil, no cross, no handle and no "+ Note"')
  await shot(page, 'member-reads-note')
  await ctx.close()
}
say(errors.length === 0, 'the browser reported no error during the walk', errors.slice(0, 3).join(' | '))
await browser.close()
console.log(`\n${fails ? fails + ' FAIL' : 'ALL PASS'} — pictures in ${OUT}`)
