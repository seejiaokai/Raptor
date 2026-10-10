// THE WALK, PART 2 — the scenarios Astra designed for the day window's check (9 Oct 26;
// docs/superpowers/briefs/2026-10-09-day-window-compact-scenarios.md, its report's §2): made with the keyboard (2.1),
// the picker's ends (2.2), Undo and Redo by the top bar's own buttons from another month (2.5), the small print's
// long forms (2.6), the SANS day's cards (2.7), thirty people and a long word (2.8), mixed notes reordered (2.9), a
// whole note dragged to another day from its words and from its people (2.10), a gap kept through an edit and a man
// not added twice (2.11). PASS means the right behaviour; a picture a step.
//
//   node scripts/handpass/note-pucks-walk2.mjs <out dir>          (the built bundle on :4180)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const OUT = process.argv[2] || 'docs/img/handpass/2026-10-09-note-pucks/part2'
mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4180/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const win = '[data-testid="win-inputsday"]'
let n = 0, fails = 0
const errors = []
const say = (ok, what, detail = '') => { if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}${detail ? ' — ' + detail : ''}`) }
const shot = async (page, name) => { await page.screenshot({ path: join(OUT, `${String(++n).padStart(2, '0')}-${name}.png`) }) }

async function open(kind) {
  const phone = kind === 'phone'
  const ctx = await browser.newContext(phone ? { viewport: { width: 390, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(kind + ': ' + e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(kind + ': ' + m.text()) })
  await page.goto(URL); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('inputs')); await page.waitForSelector('#inpCal')
  const month = async (y, m) => { for (let i = 0; i < 60; i++) { const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/); const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name))); if (!d) return; await page.locator(d > 0 ? '#icNext' : '#icPrev').click() } }
  const shown = async () => (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase()
  const press = sel => phone ? page.locator(sel).first().tap() : page.locator(sel).first().click()
  const openDay = async iso => { phone ? await page.locator(`#inpCal [data-icday="${iso}"]`).tap({ position: { x: 10, y: 10 } }) : await page.locator(`#inpCal [data-icday="${iso}"]`).click({ position: { x: 10, y: 10 } }); await page.locator(win).waitFor(); await page.waitForTimeout(350) }
  const closeDay = async () => { await press('[data-testid="win-inputsday-x"]'); await page.waitForTimeout(250) }
  const notes = () => page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] .ic-sec[data-sec]')].map(sec => ({ id: sec.getAttribute('data-sec'), text: (sec.querySelector('.ic-poppuck-txt') || { textContent: '' }).textContent, ids: [...sec.querySelectorAll('.ic-secpk')].map(c => c.classList.contains('ic-secpk-gap') ? '' : (c.querySelector('[data-person]') || c).getAttribute('data-person') || '?') })))
  const head = iso => page.evaluate(iso => { const h = document.querySelector(`[data-ichead="${iso}"]`); return h ? { words: [...h.querySelectorAll('.ic-chip.plan')].map(x => x.textContent), people: h.querySelectorAll('.ic-pks .ic-pk').length } : null }, iso)
  const makeNote = async (words, picks) => {
    await press('#icAddPuck')
    if (words) await page.locator('.ic-newnote .ic-poppuck-edit').fill(words)
    if (picks && picks.length) { await press('#icNewNotePpl'); await page.locator('.ic-pick').waitFor(); for (const i of picks) await press(`.ic-pick .ic-pickp >> nth=${i}`); await press('#icPickOk') }
    else await page.locator('.ic-newnote .ic-poppuck-edit').press('Enter')
    await page.waitForTimeout(300)
  }
  return { ctx, page, month, shown, press, openDay, closeDay, notes, head, makeNote, phone }
}

/* ---- a desktop: the keyboard, the picker's ends, Undo from another month, reorder, move, gap --------------------- */
{
  console.log('== a desktop ==')
  const w = await open('desktop'), { page } = w
  await w.month(2026, 10); await w.openDay('2026-10-14')
  /* 2.1 the keyboard: words, Tab, Enter on "+ people" */
  await w.press('#icAddPuck'); await page.keyboard.type('Brief at 0800'); await page.keyboard.press('Tab')
  say(await page.evaluate(() => document.activeElement && document.activeElement.id) === 'icNewNotePpl' && (await w.notes()).length === 0, '2.1 Tab from the words lands on "+ people" and saves nothing yet')
  await page.keyboard.press('Enter'); await page.locator('.ic-pick').waitFor()
  say((await page.locator('[data-testid="ic-pick-for"]').innerText()).includes('Brief at 0800'), '2.1 Enter there opens the people, the note\'s words in sight')
  /* Sol S1: the keyboard stays in the picker while it is up - forty Tabs and ten Shift+Tabs never leave it */
  let out = 0
  for (let i = 0; i < 40; i++) { await page.keyboard.press('Tab'); if (!(await page.evaluate(() => !!document.activeElement && !!document.activeElement.closest('.ic-pick')))) out++ }
  for (let i = 0; i < 10; i++) { await page.keyboard.press('Shift+Tab'); if (!(await page.evaluate(() => !!document.activeElement && !!document.activeElement.closest('.ic-pick')))) out++ }
  say(out === 0, 'S1 the keyboard stays inside the people picker: fifty Tabs never reach the notes or the window under it', `${out} escapes`)
  await page.locator('.ic-pick .ic-pickp:not(.already)').nth(2).click(); await page.locator('.ic-pick .ic-pickp:not(.already)').nth(6).click(); await page.locator('#icPickOk').click(); await page.waitForTimeout(300)
  let ns = await w.notes()
  say(ns.length === 1 && ns[0].text === 'Brief at 0800' && ns[0].ids.length === 2, '2.1 made by keyboard: ONE note, its words and its two people', JSON.stringify(ns))
  await shot(page, 'desk-keyboard-note')
  /* 2.2 the picker's ends: Escape, the cross, Cancel — each leaves the words alone as the note */
  for (const [how, end] of [['Escape', () => page.keyboard.press('Escape')], ['the cross', () => page.locator('#icPickClose').click()], ['Cancel', () => page.locator('#icPickCancel').click()]]) {
    const before = (await w.notes()).length
    await w.press('#icAddPuck'); await page.locator('.ic-newnote .ic-poppuck-edit').fill('Ended by ' + how); await w.press('#icNewNotePpl'); await page.locator('.ic-pick').waitFor()
    await page.locator('.ic-pick .ic-pickp:not(.already)').nth(1).click(); await end(); await page.waitForTimeout(300)
    ns = await w.notes(); const made = ns.find(x => x.text === 'Ended by ' + how)
    say(ns.length === before + 1 && !!made && made.ids.length === 0 && await page.locator('.ic-pick').count() === 0 && await page.locator(win).count() === 1, `2.2 the picker ended by ${how}: the words alone become the note, nobody is added, the day stays open`, JSON.stringify(made))
  }
  /* 2.11 a gap kept through an edit; a man already on the note cannot be added twice; one Undo a step */
  const first = (await w.notes()).find(x => x.text === 'Brief at 0800')
  await page.locator(`[data-testid="idy-note-${first.id}"] .ic-pkadd`).click(); await page.locator('.ic-pick').waitFor()
  const locked = await page.locator('.ic-pick .ic-pickp.already').count()
  for (const i of [0, 1, 2]) await page.locator('.ic-pick .ic-pickp:not(.already)').nth(i).click()
  await page.locator('#icPickOk').click(); await page.waitForTimeout(300)
  say(locked === 2 && (await w.notes()).find(x => x.id === first.id).ids.length === 5, '2.11 the two already on the note are ticked and locked; three more are added, nobody twice')
  await page.locator(`[data-testid="idy-note-${first.id}"] .ic-secpk[data-pkidx="1"]`).click({ button: 'right' }); await page.waitForTimeout(250)
  await page.locator(`[data-testid="idy-note-${first.id}"] [data-ppedit]`).click(); await page.locator(`[data-testid="idy-note-${first.id}"] .ic-poppuck-edit`).fill('Brief at 0900'); await page.keyboard.press('Enter'); await page.waitForTimeout(250)
  let cur = (await w.notes()).find(x => x.id === first.id)
  say(cur.text === 'Brief at 0900' && cur.ids.length === 5 && cur.ids[1] === '', '2.11 the gap a removed man left is still held after the words are edited', JSON.stringify(cur.ids))
  await page.locator('#undoBtn').click(); await page.waitForTimeout(300)
  cur = (await w.notes()).find(x => x.id === first.id)
  say(cur.text === 'Brief at 0800' && cur.ids[1] === '', '2.11 one Undo takes back the edit alone — the gap stays', JSON.stringify(cur))
  await page.locator('#redoBtn').click(); await page.waitForTimeout(300)
  /* 2.9 mixed notes reordered: the handle drags the last above the first; a reload keeps the order */
  const order = async () => (await w.notes()).map(x => x.text || `(${x.ids.filter(Boolean).length} people)`)
  await w.makeNote('', [3, 8])                                        // a note of people and no words
  const before = await order()
  const hs = page.locator(`${win} .ic-sechandle`), hb = await hs.nth(before.length - 1).boundingBox(), tb = await hs.nth(0).boundingBox()
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2); await page.mouse.down()
  /* let go over the TOP half of the first note - a drop above every note is over none of them, and is a cancel */
  for (let i = 1; i <= 10; i++) await page.mouse.move(tb.x + tb.width / 2 + 40, hb.y + (tb.y + 4 - hb.y) * i / 10)
  await page.mouse.up(); await page.waitForTimeout(400)
  const after = await order()
  say(after[0] === before[before.length - 1] && after.length === before.length && JSON.stringify([...after].sort()) === JSON.stringify([...before].sort()), '2.9 the last note dragged by its handle to the top: it leads, the others keep their order and their people', `${JSON.stringify(before)} → ${JSON.stringify(after)}`)
  const people = (await w.notes()).map(x => x.ids)
  await shot(page, 'desk-mixed-notes-reordered')
  await page.waitForTimeout(600); await page.reload(); await page.waitForSelector('#luser'); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('inputs')); await page.waitForSelector('#inpCal'); await w.month(2026, 10); await w.openDay('2026-10-14')
  say(JSON.stringify(await order()) === JSON.stringify(after) && JSON.stringify((await w.notes()).map(x => x.ids)) === JSON.stringify(people), '2.9 after a reload the notes are in that order, each with its own people and gaps')
  /* 2.10 a whole note dragged to another day on the month — from its words, then from its people */
  await w.closeDay()
  const dragTo = async (fromSel, iso) => { const a = await page.locator(fromSel).first().boundingBox(), b = await page.locator(`#inpCal [data-icday="${iso}"]`).boundingBox(); await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down(); for (let i = 1; i <= 12; i++) await page.mouse.move(a.x + a.width / 2 + (b.x + b.width / 2 - a.x - a.width / 2) * i / 12, a.y + a.height / 2 + (b.y + b.height - 12 - a.y - a.height / 2) * i / 12); await page.mouse.up(); await page.waitForTimeout(450) }
  let h14 = await w.head('2026-10-14')
  const moving = 'Brief at 0900'
  await dragTo(`[data-ichead="2026-10-14"] .ic-chip.plan:has-text("${moving}")`, '2026-10-21')
  let h21 = await w.head('2026-10-21'), h14b = await w.head('2026-10-14')
  say(h21.words.includes(moving) && h21.people === 4 && !h14b.words.includes(moving) && h14b.people === h14.people - 4, '2.10 dragged by its WORDS to another day: the words and its four people went together, none left behind', `21 Oct ${JSON.stringify(h21)}, 14 Oct ${JSON.stringify(h14b)}`)
  await dragTo('[data-ichead="2026-10-21"] .ic-pks', '2026-10-28')
  const h28 = await w.head('2026-10-28'); h21 = await w.head('2026-10-21')
  say(h28.words.includes(moving) && h28.people === 4 && h21.words.length === 0 && h21.people === 0, '2.10 dragged by its PEOPLE to another day: the same whole note moved', `28 Oct ${JSON.stringify(h28)}`)
  await shot(page, 'desk-note-moved-across-days')
  /* 2.5 Undo and Redo by the top bar's buttons, from another month: the calendar turns to the note's month */
  await w.month(2026, 12)
  await page.locator('#undoBtn').click(); await page.waitForTimeout(500)
  say((await w.shown()).startsWith('oct'), '2.5 Undo pressed while December shows: the calendar turns to October, where the note went back', await w.shown())
  h21 = await w.head('2026-10-21')
  say(!!h21 && h21.words.includes(moving) && h21.people === 4, '2.5 …and the note is back on the 21st, whole')
  await w.month(2027, 2); await page.locator('#redoBtn').click(); await page.waitForTimeout(500)
  say((await w.shown()).startsWith('oct') && (await w.head('2026-10-28')).words.includes(moving), '2.5 Redo pressed while another month shows: October again, the note on the 28th', await w.shown())
  await page.locator('#undoBtn').click(); await page.waitForTimeout(400)
  say((await w.shown()).startsWith('oct'), '2.5 Undo with October already showing: nothing moves (D672)')
  /* Sol S3: with ANOTHER day's window open, Redo brings that window to the note's day */
  await w.openDay('2026-10-07')
  await page.locator('#redoBtn').click(); await page.waitForTimeout(500)
  const ttl = (await page.locator(`${win} .win-ttl`).innerText()).trim()
  say(/28 Oct/.test(ttl) && (await w.notes()).some(x => x.text === moving), 'S3 Redo with another day open: its window goes to the day of the note and shows it', ttl)
  await w.closeDay()
  await shot(page, 'desk-undo-from-another-month')
  await w.ctx.close()
}
/* ---- a phone: thirty people and a long word; the small print's long forms; the SANS day ---------------------------- */
{
  console.log('\n== a phone ==')
  const w = await open('phone'), { page } = w
  await w.month(2026, 10)
  /* inputs for 2.6, filed through the app's own door before the day is opened */
  await page.evaluate(() => {
    const P = window.PEOPLE, crew = Object.keys(P).filter(id => !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers)
    const at = new Date(2025, 11, 28, 14, 32).getTime(), mod = new Date(2026, 9, 8, 9, 10).getTime()
    window.fileInput({ iid: 'w2-long', person: crew[4], type: 'Meeting', date: 'Oct 15', yr: 2026, allday: false, s: 540, e: 600, remarks: 'Dental', by: crew[0], at, modBy: crew[7], modAt: mod })
    window.fileInput({ iid: 'w2-other', person: crew[5], type: 'Other', date: 'Oct 15', yr: 2026, allday: true, remarks: 'A very long custom commitment name that runs on and on past the card', by: crew[5], at: mod, modBy: crew[5], modAt: mod })
  })
  await w.openDay('2026-10-15')
  const cards = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="idy-row-w2-"]')].map(r => { const b = r.getBoundingClientRect(), p = r.querySelector('[data-testid="idy-placed"]'), pb = p.getBoundingClientRect(); return { id: r.getAttribute('data-testid'), words: p.textContent, title: p.getAttribute('title'), inside: pb.left >= b.left - 0.5 && pb.right <= b.right + 0.5, h: Math.round(b.height) } }))
  const long = cards.find(c => c.id.endsWith('w2-long'))
  say(!!long && /for .+ · 28 Dec 25, 14:32 · changed by .+ · 8 Oct, 09:10$/.test(long.words) && /^Placed by /.test(long.title), '2.6 filed for someone else in another year and changed since: the small print keeps the names, keeps the OTHER year, drops this one', long && long.words)
  say(cards.every(c => c.inside) && await page.evaluate(() => document.documentElement.scrollWidth) <= 390, '2.6 the longest small print wraps inside its card; nothing runs off sideways', JSON.stringify(cards.map(c => c.h)))
  await shot(page, 'phone-small-print-long-forms')
  await w.closeDay()
  /* 2.8 thirty people and one long unbroken word */
  await w.openDay('2026-10-16')
  await w.makeNote('Supercalifragilisticexpialidocious-and-then-some-more-unbroken-letters-to-the-very-end', Array.from({ length: 30 }, (_, i) => i))
  let ns = await w.notes()
  const big = await page.evaluate(() => { const b = document.querySelector('[data-testid^="idy-note-"]'), r = b.getBoundingClientRect(), pk = [...b.querySelectorAll('.ic-secpk .puck')].map(p => p.getBoundingClientRect()); return { inside: pk.every(p => p.left >= r.left && p.right <= r.right + 0.5), rows: new Set(pk.map(p => Math.round(p.top))).size, wide: document.documentElement.scrollWidth, txtInside: b.querySelector('.ic-poppuck-txt').getBoundingClientRect().right <= r.right } })
  say(ns.length === 1 && ns[0].ids.length === 30 && big.inside && big.rows === 8 && big.wide <= 390 && big.txtInside, '2.8 thirty people stand four across in eight rows inside the note; the long word wraps; nothing runs off sideways', JSON.stringify(big))
  await shot(page, 'phone-thirty-people')
  /* scrolled, then a middle puck dragged onto another slot, then one dragged off the note */
  await page.evaluate(() => { const l = document.querySelector('[data-testid="idy-list"]'); l.scrollTop = 120 }); await page.waitForTimeout(200)
  const cdp = await w.ctx.newCDPSession(page), t = (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: p ? [{ x: p.x, y: p.y, id: 1 }] : [] })
  const drag = async (from, to) => { await t('touchStart', from); for (let i = 1; i <= 8; i++) await t('touchMove', { x: from.x + (to.x - from.x) * i / 8, y: from.y + (to.y - from.y) * i / 8 }); await t('touchEnd'); await page.waitForTimeout(350) }
  const c = async i => { const b = await page.locator(`${win} .ic-secpk[data-pkidx="${i}"]`).boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 } }
  const b4 = (await w.notes())[0].ids.slice()
  await drag(await c(13), await c(18))
  let a4 = (await w.notes())[0].ids
  say(a4[13] === b4[18] && a4[18] === b4[13] && a4.filter((x, i) => x !== b4[i]).length === 2, '2.8 with the list scrolled, a middle puck dragged onto another swaps exactly those two')
  const from = await c(13), wb = await page.locator(win).boundingBox()
  await drag(from, { x: from.x, y: wb.y + wb.height - 24 })
  a4 = (await w.notes())[0].ids
  say(a4.filter(Boolean).length === 29 && a4[13] === '', '2.8 …and one dragged off the note leaves it, his place held', `${a4.filter(Boolean).length} people`)
  await shot(page, 'phone-thirty-after-drags')
  await w.closeDay()
  /* 2.7 the SANS day: a commitment with a remark and its small print on one line; a "not counted" reason and the LATE note keep their own lines */
  await page.evaluate(() => {
    const P = window.PEOPLE, sans = Object.keys(P).filter(id => P[id].san && !P[id].archived && !P[id].deleted), at = new Date(2026, 8, 28, 9, 14).getTime()
    window.fileInput({ iid: 'w2-sans', person: sans[0], type: 'SANS Availability', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 900, sans: { f: true }, remarks: 'Morning only', by: sans[0], at, modBy: sans[0], modAt: at })
  })
  await w.press('#inSansMode'); await page.locator('[data-testid="sanscal"]').waitFor()
  for (let i = 0; i < 40; i++) { const [name, year] = (await page.locator('[data-testid="sc-month"]').innerText()).trim().toLowerCase().split(/\s+/); const d = 2026 * 12 + 9 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name))); if (!d) break; await page.locator(d > 0 ? '[data-testid="sc-next"]' : '[data-testid="sc-prev"]').click() }
  await page.locator('[data-testid="sc-day-2026-10-13"]').tap({ position: { x: 10, y: 10 } }); await page.locator('[data-testid="win-sansday"]').waitFor(); await page.waitForTimeout(350)
  const sd = await page.evaluate(() => { const r = document.querySelector('[data-testid="sd-row-w2-sans"]'); if (!r) return null; const k = r.querySelector('.sd-rmk').getBoundingClientRect(), p = r.querySelector('[data-testid="sd-placed"]'), pb = p.getBoundingClientRect(), b = r.getBoundingClientRect(); return { same: Math.abs(k.top - pb.top) < 4, words: p.textContent, right: Math.round(b.right - pb.right), h: Math.round(b.height), tall: document.querySelector('[data-testid="win-sansday"]').className.includes('is-tall') } })
  say(!!sd && sd.same && /^\S+ · 28 Sep, 09:14$/.test(sd.words) && sd.right <= 12, '2.7 the SANS day: a commitment\'s remark and its short small print share a line, at the card\'s right end', JSON.stringify(sd))
  say(!!sd && sd.tall, 'D707 the SANS day opened tall')
  await shot(page, 'phone-sans-day-card')
  await w.ctx.close()
}
say(errors.length === 0, 'the browser reported no error during the walk', errors.slice(0, 3).join(' | '))
await browser.close()
console.log(`\n${fails ? fails + ' FAIL' : 'ALL PASS'} — pictures in ${OUT}`)
