/* Walker A1 — Fable S13 (28 Sep 26): the "tap Unpublish first" message. Built entirely through the app: the calendar to
   the week of 28 Sep (Sat 3 Oct, still to come), "+ Item" on Saturday's Common Programme with Hex put on it, SCHEDULER
   ticked on Hex (Quals), Hex signed as PLANNED BY, Saturday published, then Admin → Users → Hex → Delete, Delete.
   Then Undo: the publish would put a deleted man's signature back (dead — passed over); the next step, "Hex on
   Saturday", sits behind the publish → "A day on this week was published after that change — tap Unpublish on that day
   first, or edit its working copy." Then Unpublish → Undo → the seat change reverts. HP_W=390 for the phone. */
import { openA1, book, door, doorState, boardOn, boardOff, dayHead, put, go, toasts, PHONE } from './cr-a1-lib.mjs'

const { browser, page, errors } = await openA1('a')
const bk = book('s13')
const SAT = 5
const hex = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Hex'))
const press = async (loc) => { await loc.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150); if (PHONE) await loc.tap().catch(() => loc.click()); else await loc.click(); await page.waitForTimeout(700) }

/* 1 — the week of 28 Sep through the calendar: › twice to September… October, then Sat 3 Oct */
await go(page, 'editsched'); await page.evaluate(() => window.scrollTo(0, 0))
await press(page.locator(PHONE ? '.filt-cal:visible, .wknav-mbtn:visible' : '.wk-cal:visible, button[aria-label="Jump to a date"]:visible').first())
for (let i = 0; i < 6 && !(await page.locator('[data-wcal="2026-10-03"]:visible').count()); i++) await press(page.locator('button[aria-label="Next month"]:visible').first())
await press(page.locator('[data-wcal="2026-10-03"]:visible').first())
const week = await page.evaluate(() => ({ wk: window.CURWEEK, sat: window.DAYS[5] && window.DAYS[5].dt, allhands: window.DAYS[5].allhands.length, duties: window.DAYS[5].dutywaves.length }))
bk.note('S13.0', { what: 'the week of Sat 3 Oct, reached through the calendar', week, hex })

/* 2 — Hex on Saturday: "+ Item" on the Common Programme, then Hex put on it */
await boardOn(page, SAT)
await press(page.locator(`#schedBoard [data-padd="${SAT}"]:visible`).first())
const ri = await page.evaluate(() => window.DAYS[5].allhands.length - 1)
const onSat = await put(page, `[data-fill="a:${SAT}.${ri}.+"]`, [hex])
const who = await page.evaluate(i => window.DAYS[5].allhands[i].who, ri)
bk.ck('S13.1', 'Hex put on Saturday 3 Oct (a Common Programme item added, Hex in it)', onSat === hex, { ri, who, onSat }, await bk.shot(page, 'hex-on-sat'))
await boardOff(page)

/* 3 — SCHEDULER ticked on Hex (Quals, editing on) */
await go(page, 'quals')
if (await page.locator('#qEdit:visible').count()) await press(page.locator('#qEdit:visible').first())
/* Hex is a WSO — the page opens on its Pilots view; its own "WSOs" tab shows his row */
const wsoTab = page.locator('button:visible', { hasText: /^WSOs$/ }).first()
if (await wsoTab.count()) await press(wsoTab)
const cell = page.locator(`td.qcell[data-q="${hex}|sched"]:visible`).first()
const had = await cell.count()
if (had) await press(cell)
const ticked = await page.evaluate(h => { const c = document.querySelector(`td.qcell[data-q="${h}|sched"]`); return c ? c.className : null }, hex)
bk.ck('S13.2', 'Quals: SCHEDULER ticked on Hex', had && /apt-on/.test(ticked || ''), { ticked }, await bk.shot(page, 'hex-scheduler-ticked'))

/* 4 — Saturday signed (Hex as PLANNED BY) and published */
await go(page, 'editsched')
await boardOn(page, SAT)
const signed = {}
for (const role of ['cur', 'sked', 'plan', 'appr']) {
  const s = page.locator(`#schedBoard select[data-sign="${role}"][data-signday="${SAT}"]:visible`).first()
  const opts = await s.locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: o.text })).filter(o => o.v))
  const pick = role === 'plan' ? (opts.find(o => o.t === 'Hex') || opts[0]) : opts[0]
  if (pick) { await s.selectOption(pick.v); await page.waitForTimeout(300) }
  signed[role] = pick ? pick.t : 'NO NAMES'
}
await press(page.locator(`#schedBoard [data-beak="${SAT}"]:visible`).first())
let h = await dayHead(page, SAT)
bk.ck('S13.3', 'Saturday 3 Oct signed (Hex as PLANNED BY) and published', signed.plan === 'Hex' && /ORIG/.test(h.tag), { signed, h: { tag: h.tag, pending: h.pending } }, await bk.shot(page, 'sat-published-hex-signed'))
await boardOff(page)

/* 5 — Admin → Users → Hex → Delete, Delete */
await go(page, 'admin')
const cat = page.locator('.adm-cat:visible', { hasText: 'Users' }).first()
if (await cat.count()) await press(cat)
await press(page.locator(`#admUsers .acc-row[data-person="${hex}"] .acc-tap:visible`).first())
await press(page.locator('#accEdDel:visible').first())
const armWords = await page.locator('#accEdDel:visible').first().innerText().catch(() => '')
await press(page.locator('#accEdDel:visible').first())
const gone = await page.evaluate(h => !!(window.PEOPLE[h] && window.PEOPLE[h].deleted), hex)
bk.ck('S13.4', 'Admin → Users → Hex → Delete, then "Tap again to delete Hex" → Hex deleted', gone, { armWords, t: await toasts(page) }, await bk.shot(page, 'hex-deleted'))

/* 6 — Undo from Edit Schedule's top bar */
await go(page, 'editsched'); await page.evaluate(() => window.scrollTo(0, 0))
const st = await doorState(page, 'top')
h = await dayHead(page, SAT)
bk.note('S13.5', { what: 'Edit Schedule after the delete: the top-bar pair and Saturday', st, h: { tag: h.tag, pending: h.pending, signs: h.signs } })
const u1 = await door(page, 'top', 'undo')
const who1 = await page.evaluate(i => window.DAYS[5].allhands[i] ? window.DAYS[5].allhands[i].who : 'ROW GONE', ri)
h = await dayHead(page, SAT)
const p1 = await bk.shot(page, 'undo-behind-publish')
bk.ck('S13.6', 'top-bar Undo → refused: "A day on this week was published after that change — tap Unpublish on that day first, or edit its working copy."; nothing moves',
  u1.toasts.some(t => /A day on this week was published after that change — tap Unpublish on that day first/.test(t)) && /ORIG/.test(h.tag),
  { u1, who1, h: { tag: h.tag, pending: h.pending } }, p1)
/* a second press: the same message, nothing moves, Undo still offered (D148: never greys) */
const u2 = await door(page, 'top', 'undo')
bk.note('S13.6b', { what: 'the same Undo pressed again', u2 })

/* 7 — Unpublish (the day's own button), then Undo */
await boardOn(page, SAT)
const un = page.locator(`#schedBoard [data-unpub="${SAT}"]:visible`).first()
let unp = 'no Unpublish button'
if (await un.count()) { await press(un); const again = page.locator(`#schedBoard [data-unpub="${SAT}"]:visible`).first(); if (await again.count() && /confirm/i.test(await again.innerText())) await press(again); unp = 'pressed' }
h = await dayHead(page, SAT)
bk.note('S13.7', { what: 'Unpublish pressed', unp, h: { tag: h.tag, pending: h.pending } })
const u3 = await door(page, 'board', 'undo')
const who3 = await page.evaluate(i => window.DAYS[5].allhands[i] ? window.DAYS[5].allhands[i].who : 'ROW GONE', ri)
h = await dayHead(page, SAT)
const p2 = await bk.shot(page, 'after-unpublish-undo')
bk.ck('S13.8', 'after Unpublish, Undo reaches BEHIND the publish (the step before it reverts), as the message promised', u3.pressed && /^Undid:/.test(u3.toasts.join(' ')) && !/taking a published day back/.test(u3.toasts.join(' ')), { u3, who3, h: { tag: h.tag, pending: h.pending } }, p2)
/* and the press after that: where does Undo stand now? */
const u4 = await door(page, 'board', 'undo')
h = await dayHead(page, SAT)
const p3 = await bk.shot(page, 'undo-after-that')
bk.note('S13.9', { what: 'the next Undo after that', u4, h: { tag: h.tag, pending: h.pending } }, p3)

bk.save(errors)
await browser.close()
