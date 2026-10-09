/* The Leave War's windows on a short screen: 390x568, 844x390 (a phone on its side), and the owner's 1536x864. */
import * as B from './cal-B-lib.mjs'
const size = process.argv[2] || 'short'
const w = await B.world(size)
const p = w.page, S = w.key
const pics = [], log = [], checks = []
const note = (k, v) => { log.push(`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`); console.log('  >', k, typeof v === 'string' ? v : JSON.stringify(v)) }
const chk = (name, ok, detail = '') => { checks.push([name, !!ok, detail]); console.log(ok ? '  ok' : '  XX', name, detail) }
const vp = { w: B.SIZES[size].w, h: B.SIZES[size].h }
const rect = id => B.tid(w, id).evaluate(el => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), r: Math.round(b.right), b: Math.round(b.bottom), w: Math.round(b.width), h: Math.round(b.height) } })
const within = (r, name) => chk(`${name} is wholly on the screen`, r.x >= -1 && r.y >= -1 && r.r <= vp.w + 1 && r.b <= vp.h + 1, JSON.stringify(r) + ' vp ' + JSON.stringify(vp))
const atCentre = async id => { const hit = await B.tid(w, id).evaluate(el => { const b = el.getBoundingClientRect(); const e = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !!e && (e === el || el.contains(e)) }); return hit }
const third = async id => { await p.evaluate(t => { const e = document.querySelector(`[data-testid="${t}"]`); window.scrollBy(0, e.getBoundingClientRect().top - Math.max(innerHeight / 3, 230)) }, id); await B.sleep(300) }
/* reachable: scrolled to inside its own window, then on screen and the thing a finger lands on */
const reach = async id => { await B.tid(w, id).evaluate(el => el.scrollIntoView({ block: 'center' })); await B.sleep(200); const rr = await rect(id); const hit = await atCentre(id); return { rr, hit, ok: rr.y >= 0 && rr.b <= vp.h + 1 && rr.r <= vp.w + 1 && hit } }
await p.evaluate(() => window.scrollTo(0, 0))
/* the Figures drawer is open by default at this width and lies over the first days of a month (seen: after FEB, Feb 5 is the first day in sight); fold it away, as a user would */
const figTxt = await B.txt(B.tid(w, 'figures-toggle')); note('Figures drawer toggle reads', figTxt)
if (/▾/.test(figTxt) && size === 'side') { await B.press(w, B.tid(w, 'figures-toggle')); await B.sleep(500) }
/* 1. Available form */
await third('fly-name-avail-p'); await B.press(w, B.tid(w, 'fly-name-avail-p')); await B.sleep(400)
let r = await rect('counter-form'); within(r, 'the Available P form')
for (const id of ['cform-save', 'cform-cancel', 'cform-name']) { const rc = await reach(id); chk(`${id} reachable (scrolled inside its window if needed; on screen; what a finger lands on)`, rc.ok, JSON.stringify(rc.rr)) }
pics.push(await B.pic(p, `short-${S}-1-available-form`))
await B.press(w, B.tid(w, 'cform-cancel')); await B.sleep(300)
/* 2. Event sheet at its tallest: Other + range, merged */
await B.press(w, B.tid(w, 'month-FEB')); await B.sleep(600)
await B.reveal(w, '2026-02-24', 'event-0'); await third('event-0-2026-02-24')
await B.press(w, B.tid(w, 'event-0-2026-02-24')); await B.sleep(350)
await B.press(w, B.tid(w, 'event-other')); await B.press(w, B.tid(w, 'event-scope-range')); await B.sleep(300)
r = await rect('event-sheet'); within(r, 'the Event sheet (Other, A range)')
for (const id of ['event-apply', 'event-cancel', 'event-text', 'event-short']) { const rc = await reach(id); chk(`${id} reachable (scrolled inside its window if needed)`, rc.ok, JSON.stringify(rc.rr)) }
pics.push(await B.pic(p, `short-${S}-2-event-sheet`))
await B.press(w, B.tid(w, 'event-cancel')); await B.sleep(300)
/* 3. Required typing: desktop box / phone pad with the four rows above it */
await p.evaluate(() => window.scrollTo(0, 0)); await B.sleep(200)
await B.reveal(w, '2026-02-25', 'req-p'); await third('req-p-2026-02-25')
await B.press(w, B.cell(w, 'req-p', '2026-02-25')); await B.sleep(400)
if (w.phone) {
  const pad = await rect('fly-pad'), c = await rect('req-p-2026-02-25'), av = await rect('fly-row-avail-w')
  note('3 pad', JSON.stringify({ pad, cell: c, availW: av }))
  chk('the pad sits at the foot, the cell and the Available rows are above it', pad.b >= vp.h - 2 && c.b <= pad.y && av.b <= pad.y, JSON.stringify({ pad, c, av }))
  chk('every pad key is wholly on screen', (await p.evaluate(() => [...document.querySelectorAll('[data-testid^="fly-pad-"]')].every(b => { const r = b.getBoundingClientRect(); return r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 && r.top >= 0 }))), '')
} else {
  const box = await rect('fly-edit-strip'); within(box, 'the typing strip')
}
pics.push(await B.pic(p, `short-${S}-3-required-typing`))
if (w.phone) await B.press(w, B.tid(w, 'fly-pad-done')); else await p.keyboard.press('Escape')
await B.sleep(300)
/* 4. Required panel */
await third('req-p-2026-02-25')
await B.dragPick(w, B.cell(w, 'req-p', '2026-02-25'), B.cell(w, 'req-w', '2026-02-26'))
await B.sleep(300)
if (await B.tid(w, 'req-panel').count()) {
  r = await rect('req-panel'); within(r, 'the Required panel')
  for (const id of ['req-panel-apply', 'req-panel-num', 'req-panel-x']) { const rr = await rect(id); chk(`${id} reachable`, rr.b <= vp.h + 1 && rr.r <= vp.w + 1 && rr.y >= 0, JSON.stringify(rr)) }
  const rows = await rect('fly-row-req-p'); note('4 Required row vs panel', JSON.stringify({ rows, panel: r }))
  chk('the picked Required row is above the panel (not hidden under it)', rows.b <= r.y + 2, JSON.stringify({ rowBottom: rows.b, panelTop: r.y }))
  pics.push(await B.pic(p, `short-${S}-4-required-panel`))
  await B.press(w, B.tid(w, 'req-panel-x')); await B.sleep(300)
} else { chk('the pick opened the Required panel', false, 'no panel'); pics.push(await B.pic(p, `short-${S}-4-no-panel`)) }
/* 5. a counter's window */
await p.evaluate(() => window.scrollTo(0, 0)); await B.sleep(300)
await B.makeCounter(w, 'Short test', { seat: 'pilot', amber: 20, red: 10 })
await third('manning-info-short-test')
await B.press(w, B.tid(w, 'manning-info-short-test')); await B.sleep(300)
await B.press(w, B.tid(w, 'counter-edit-open')); await B.sleep(400)
r = await rect('counter-form'); within(r, "the counter's own window")
for (const id of ['cform-save', 'cform-cancel', 'cform-delete']) { const rc = await reach(id); chk(`${id} reachable (scrolled inside its window if needed)`, rc.ok, JSON.stringify(rc.rr)) }
pics.push(await B.pic(p, `short-${S}-5-counter-window`))
await B.press(w, B.tid(w, 'cform-cancel')); await B.sleep(300)
const bad = checks.filter(c => !c[1])
B.row('SHORT-' + S, S, `Leave War windows at ${vp.w}x${vp.h}: Available form, Event sheet (Other, A range), Required typing, Required panel, the counter's own window`,
  checks.map(c => `${c[1] ? 'ok' : 'XX'} ${c[0]} [${c[2]}]`).join(' | '), bad.length ? 'FAIL' : 'PASS', pics)
B.noteErrors('short-' + S, w.errors)
await B.close(w)
