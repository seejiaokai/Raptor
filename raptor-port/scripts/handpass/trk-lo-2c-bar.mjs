/* [TRK-RETEST-NOTES] C10 + C14 — walker c: the bar, on top of trk-lo-11-bar.mjs (28 Sep 26).
   (1) a 14-letter student name (the callsign cap, D226) added through + Add, at 390 upright:
       how much of it the Crew box reads, and does the bar stay two rows; (2) the Crew box (and the
       Course box beside it) at 844×390, which lo-11 did not measure; (3) the C14 error path: while
       ✓ Save changes shows, the words beside it step aside — so a save that FAILS must still say
       so somewhere on screen (the brief: "its red words").

   THE ONE THING THIS SCRIPT DOES THAT A PERSON CANNOT: step 3 makes the browser's storage refuse
   every write (Storage.prototype.setItem throws a QuotaExceededError) ONLY TO CHECK the error
   path, as the brief allows — a full disk or a locked-down browser does the same thing for real.
   It is put back before the step ends.

     HP_URL=http://localhost:4175 HP_SHOTS=<dir> HP_OUT=<dir> node scripts/handpass/trk-lo-2c-bar.mjs
*/
import { open, shot, save, log, reveal } from './trk-lib.mjs'

const L = log()
const sleep = ms => new Promise(r => setTimeout(r, ms))
const allErrors = []
const NAME = 'ABCDEFGHIJKLMN'   // 14 letters — the callsign/name cap (D226)
/* under 1050px wide the Students card lives on the Info tab */
const toInfo = async page => { const t = page.locator('#viewtabs [data-view="info"]:visible'); if (await t.count()) { await t.first().tap(); await sleep(400) } }
const toFlow = async page => { const t = page.locator('#viewtabs [data-view="flow"]:visible'); if (await t.count()) { await t.first().tap(); await sleep(400) } }

/* the bar: its height, its rows, and how much of each dropdown's chosen text fits */
const bar = page => page.evaluate(() => {
  const h = document.querySelector('#page-tracker header'); if (!h) return null
  const tops = new Set()
  for (const el of h.querySelectorAll('.controls > *')) { const r = el.getBoundingClientRect(); if (r.width && r.height) tops.add(Math.round(r.top / 8)) }
  const ctx = document.createElement('canvas').getContext('2d')
  const fit = s => {
    if (!s) return null
    const cs = getComputedStyle(s); ctx.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily
    const text = s.selectedOptions[0] ? s.selectedOptions[0].textContent : ''
    /* the room for text: the box less its padding and the dropdown arrow (~16px) */
    const room = Math.floor(s.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 16)
    let n = text.length; while (n > 0 && ctx.measureText(text.slice(0, n)).width > room) n--
    return { text, w: Math.round(s.getBoundingClientRect().width), room, need: Math.ceil(ctx.measureText(text).width), reads: text.slice(0, n), whole: n === text.length }
  }
  return { h: Math.round(h.getBoundingClientRect().height), rows: tops.size, crew: fit(document.getElementById('activeSel')), course: fit(document.getElementById('courseSel')), syl: fit(document.getElementById('sylSel')) }
})

/* ============ 1 — a 14-letter name at 390 upright ============ */
{
  const { browser, page, errors } = await open({ size: { width: 390, height: 844 }, touch: true })
  const b0 = await bar(page)
  await toInfo(page)
  await page.locator('#addStu').first().tap(); await sleep(400)
  await page.locator('#dlgInput').first().tap(); await page.keyboard.type(NAME, { delay: 30 })
  await page.locator('#dlgOk').first().tap(); await sleep(700)
  const picked = await page.evaluate(() => { const s = document.getElementById('activeSel'); return s.selectedOptions[0] ? s.selectedOptions[0].textContent : '' })
  L.note('1.0 + Add "' + NAME + '" at 390: the Crew box now shows', picked)
  if (picked !== NAME) {
    /* pick him the way a person does if + Add did not */
    const v = await page.evaluate(n => [...document.getElementById('activeSel').options].find(o => o.textContent === n)?.value, NAME)
    if (v) { await page.locator('#activeSel').tap(); await page.selectOption('#activeSel', v); await sleep(500) }
  }
  const b1 = await bar(page)
  L.ok('1.1 390: + Add picks the new 14-letter student into the Crew box', picked === NAME, JSON.stringify({ picked }))
  L.ok('1.2 390: the bar stays two rows (no taller than before: ' + b0.h + 'px)', b1.h <= b0.h + 1 && b1.rows <= 2, JSON.stringify({ h: b1.h, rows: b1.rows, was: b0.h }))
  L.note('1.3 390: how much of the 14-letter name the Crew box reads', JSON.stringify(b1.crew))
  L.ok('1.3 390: the Crew box reads at least 9 letters of a 14-letter name (a puck shows ~9–10, D289) — the start of the name is never lost', b1.crew.reads.length >= 9 && NAME.startsWith(b1.crew.reads), `reads "${b1.crew.reads}" (${b1.crew.reads.length} of 14) in ${b1.crew.room}px of room; needs ${b1.crew.need}px`)
  await shot(page, 'lo-2c-b01-390-14-letters', { el: '#page-tracker header' })
  await shot(page, 'lo-2c-b02-390-14-letters-full')
  /* the list itself (the open dropdown is the phone's own picker, drawn outside the page) */
  const opts = await page.evaluate(() => [...document.getElementById('activeSel').options].map(o => o.textContent))
  L.ok('1.4 390: the Crew list holds the whole name', opts.includes(NAME), JSON.stringify(opts))
  L.ok('1.5 390: no console or page error', errors.length === 0, errors.join(' | '))
  allErrors.push(...errors.map(e => '390: ' + e))
  await browser.close()
}

/* ============ 2 — the Crew box at 844×390 ============ */
{
  const { browser, page, errors } = await open({ size: { width: 844, height: 390 }, touch: true })
  const b0 = await bar(page)
  L.note('2.0 844×390 at rest', JSON.stringify(b0))
  L.ok('2.1 844×390: the Crew box reads "STUDENT A" whole', b0.crew.whole, JSON.stringify(b0.crew))
  L.ok('2.2 844×390: the Course box reads the course whole', b0.course.whole, JSON.stringify(b0.course))
  L.ok('2.3 844×390: the Tracker bar is one row (≤40px, as at 1000px)', b0.h <= 40, JSON.stringify({ h: b0.h }))
  await shot(page, 'lo-2c-b03-844-bar', { el: '#page-tracker header' })
  await toInfo(page)
  await page.locator('#addStu').first().tap(); await sleep(400)
  await page.locator('#dlgInput').first().tap(); await page.keyboard.type(NAME, { delay: 30 })
  await page.locator('#dlgOk').first().tap(); await sleep(700)
  const b1 = await bar(page)
  L.note('2.4 844×390 with the 14-letter name picked', JSON.stringify(b1.crew))
  L.ok('2.4 844×390: the Crew box reads at least 9 letters of the 14-letter name; the bar stays one row', b1.crew.reads.length >= 9 && b1.h <= 40, `reads "${b1.crew.reads}" (${b1.crew.reads.length} of 14); h ${b1.h}`)
  await shot(page, 'lo-2c-b04-844-bar-14-letters', { el: '#page-tracker header' })
  await shot(page, 'lo-2c-b05-844-full')
  L.ok('2.5 844×390: no console or page error', errors.length === 0, errors.join(' | '))
  allErrors.push(...errors.map(e => '844: ' + e))
  await browser.close()
}

/* ============ 2b — the same 14-letter name at 1000 and 1440 (a mouse) ============ */
for (const [name, size] of [['1000', { width: 1000, height: 800 }], ['1440', { width: 1440, height: 900 }]]) {
  const { browser, page, errors } = await open({ size })
  const b0 = await bar(page)
  const info = page.locator('#viewtabs [data-view="info"]:visible')
  if (await info.count()) { await info.first().click(); await sleep(400) }
  await page.click('#addStu'); await sleep(400)
  await page.locator('#dlgInput').first().click(); await page.keyboard.type(NAME, { delay: 30 })
  await page.click('#dlgOk'); await sleep(700)
  const b1 = await bar(page)
  L.note(`2b.${name} the Crew box with the 14-letter name picked`, JSON.stringify(b1.crew))
  L.ok(`2b.${name} the Crew box reads at least 9 letters of the 14-letter name; the bar keeps its height (${b0.h}px)`, b1.crew.reads.length >= 9 && b1.h <= b0.h + 1, `reads "${b1.crew.reads}" (${b1.crew.reads.length} of 14) in ${b1.crew.room}px; needs ${b1.crew.need}px; bar ${b0.h} → ${b1.h}px`)
  await shot(page, `lo-2c-b05b-${name}-bar-14-letters`, { el: '#page-tracker header' })
  L.ok(`2b.${name} no console or page error`, errors.length === 0, errors.join(' | '))
  allErrors.push(...errors.map(e => name + ': ' + e))
  await browser.close()
}

/* ============ 3 — C14: a failed save while ✓ Save changes shows ============ */
/* the Tracker's own words beside Save; Raptor's saving note (it floats under the top bar's
   right end since [LW-FIGSEL-FLAKE], on main 28 Sep 26); and whether a press on the middle of
   ✓ Save changes reaches it */
const words = page => page.evaluate(() => {
  const st = document.getElementById('saveStat'), rs = document.querySelector('.topbar .savestat'), sv = document.getElementById('saveChanges')
  const vis = e => !!e && !e.hidden && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0
  const box = e => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] }
  const overlap = (a, b) => !!a && !!b && a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]
  /* what the note's Retry button sits on top of (it takes the presses there) */
  let underRetry = null
  const rb = rs && rs.querySelector('button')
  if (rb && vis(rb)) { const r = rb.getBoundingClientRect(); const below = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2).find(e => !rs.contains(e) && e.closest && e.closest('#page-tracker')); const c = below && (below.closest('button, select, input') || below); underRetry = c ? (c.id ? '#' + c.id : '') + ' ' + ((c.textContent || c.title || c.tagName).trim().slice(0, 24)) : null }
  let saveHit = null
  if (sv) { const r = sv.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); saveHit = h ? (sv.contains(h) ? 'Save changes' : (h.textContent || h.tagName).trim().slice(0, 30)) : null }
  return {
    save: !!sv, saveBox: sv ? box(sv) : null, saveHit, underRetry,
    tracker: vis(st) ? { text: st.textContent, cls: st.className, color: getComputedStyle(st).color, cut: st.scrollWidth > st.clientWidth + 1 } : null,
    raptor: vis(rs) ? { text: rs.textContent.trim(), cls: rs.className, color: getComputedStyle(rs).color, box: box(rs), inWindow: box(rs)[0] >= 0 && box(rs)[2] <= innerWidth && box(rs)[3] <= innerHeight, coversSave: sv ? overlap(box(rs), box(sv)) : false } : null,
  }
})
const until = async (page, fn, ms = 6000) => { const t = Date.now(); let v; while (Date.now() - t < ms) { v = await words(page); if (fn(v)) return v; await sleep(150) } return v }
for (const [name, size, touch] of [['1200', { width: 1200, height: 800 }, false], ['390', { width: 390, height: 844 }, true]]) {
  const { browser, page, errors } = await open({ size, touch })
  const tap = async sel => { const l = page.locator(sel).first(); if (touch) await l.tap(); else await l.click(); await sleep(300) }
  const pressAt = async (x, y) => { if (touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); await sleep(300) }
  const grade = async (id, g) => {
    await reveal(page, id)
    const bb = await page.locator(`#flowSvg .ball[data-id="${id}"]`).first().boundingBox()
    await pressAt(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(200)
    await page.locator('#pop .opts button', { hasText: g }).first().click(); await sleep(50)
  }
  /* an unsaved chart edit: + Test, then Done editing — ✓ Save changes shows */
  await tap('#sylMenuBtn'); await tap('#arrangeBtn'); await sleep(400)
  await page.locator('#arrTools button', { hasText: '+ Test' }).first().click(); await sleep(300)
  await page.locator('#dlgInput').first().click(); await page.keyboard.type('LO2C-S' + name, { delay: 25 }); await tap('#dlgOk'); await sleep(400)
  await tap('#sylMenuBtn'); await tap('#arrangeBtn'); await sleep(400)
  const w0 = await words(page)
  L.ok(name + ' 3.1 an unsaved chart edit: ✓ Save changes shows and the words beside it step aside', w0.save && !w0.tracker, JSON.stringify(w0))

  /* storage WORKING: a mark saves by itself — sample the "Saving…" note while it lasts */
  await grade('ACG-01', 'Marginal')
  const seen = []; const t0 = Date.now()
  while (Date.now() - t0 < 1500) { const v = await words(page); if (v.raptor) seen.push({ t: Date.now() - t0, text: v.raptor.text, covers: v.raptor.coversSave, hit: v.saveHit }); await sleep(40) }
  L.note(name + ' 3.2 storage working, a mark: the "Saving…" note while it lasts', JSON.stringify(seen.slice(0, 4)) + ` (${seen.length} samples)`)
  L.ok(name + ' 3.2 storage working: a press on ✓ Save changes is never taken by the passing "Saving…" note', seen.every(x => x.hit === 'Save changes'), JSON.stringify(seen.slice(0, 3)))

  /* the storage refuses every write from here (CHECKING the error path — see the header) */
  await page.evaluate(() => { window.__lsSetWas = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new DOMException('The quota has been exceeded (walk: forced)', 'QuotaExceededError') } })
  await grade('ACG-01', 'DCO')
  const w1 = await until(page, v => !!v.raptor && /Not saved/.test(v.raptor.text))
  L.note(name + ' 3.3 a mark made while the storage refuses', JSON.stringify(w1))
  L.ok(name + ' 3.3 a mark that cannot be saved, with ✓ Save changes showing: words on screen say it is NOT saved', w1.save && ((w1.raptor && /Not saved/.test(w1.raptor.text) && w1.raptor.inWindow) || (w1.tracker && /err/.test(w1.tracker.cls))), `Raptor's note: ${w1.raptor && w1.raptor.text} (colour ${w1.raptor && w1.raptor.color}); the Tracker's corner: ${w1.tracker ? w1.tracker.text : 'blank'}`)
  L.ok(name + ' 3.4 while "Not saved — Retry" shows, ✓ Save changes stays in sight and a press on its middle reaches it', !!w1.raptor && !w1.raptor.coversSave && w1.saveHit === 'Save changes', `note ${JSON.stringify(w1.raptor && w1.raptor.box)} · Save changes ${JSON.stringify(w1.saveBox)} · a press on Save's middle hits: ${w1.saveHit} · the note's Retry sits on: ${w1.underRetry}`)
  await shot(page, `lo-2c-b06-${name}-failed-mark-while-unsaved`)
  /* ✓ Save changes itself, still refused — pressed where the note's own words sit over it
     (the note lets a press through there; only its Retry button takes one) */
  const pt = await page.evaluate(() => {
    const svEl = document.getElementById('saveChanges'), sv = svEl.getBoundingClientRect(), rb = document.querySelector('.topbar .savestat button')
    const r = rb ? rb.getBoundingClientRect() : null
    const y = sv.top + sv.height / 2
    for (let x = sv.left + 4; x < sv.right - 4; x += 3) { if (!r || x < r.left - 2 || x > r.right + 2) { const h = document.elementFromPoint(x, y); if (h && svEl.contains(h)) return { x: Math.round(x), y: Math.round(y) } } }
    return null
  })
  L.note(name + ' 3.5 a spot on the covered ✓ Save changes that a press still reaches', JSON.stringify(pt))
  if (pt) await pressAt(pt.x, pt.y)
  await sleep(500)
  const w2 = await until(page, v => !!v.raptor && /Not saved/.test(v.raptor.text), 3000)
  L.note(name + ' 3.5 ✓ Save changes pressed while the storage refuses', JSON.stringify(w2))
  L.ok(name + ' 3.5 ✓ Save changes that cannot be written: nothing on screen says "saved" while "Not saved" shows', !!pt && !(w2.tracker && /saved/.test(w2.tracker.text) && !/not saved/i.test(w2.tracker.text) && w2.raptor && /Not saved/.test(w2.raptor.text)), `the Tracker's corner: ${w2.tracker ? w2.tracker.text + ' (' + w2.tracker.color + ')' : 'blank'} · Raptor's note: ${w2.raptor && w2.raptor.text} · ✓ Save changes still showing: ${w2.save}`)
  await shot(page, `lo-2c-b07-${name}-save-pressed-while-refused`)
  /* the storage takes writes again: Retry */
  await page.evaluate(() => { Storage.prototype.setItem = window.__lsSetWas })
  const retry = page.locator('.topbar .savestat button', { hasText: 'Retry' })
  if (await retry.count()) { if (touch) await retry.first().tap(); else await retry.first().click(); await sleep(800) }
  const w3 = await until(page, v => !v.raptor, 5000)
  L.ok(name + ' 3.6 storage back, Retry: the "Not saved" words go', !w3.raptor, JSON.stringify(w3))
  await shot(page, `lo-2c-b08-${name}-after-retry`)
  L.note(name + ' 3.7 console/page errors (the forced refusal may log its own)', errors.join(' | '))
  allErrors.push(...errors.map(e => name + ' C14: ' + e))
  await browser.close()
}

save('lo-2c-bar', { rows: L.rows, errors: allErrors })
const fails = L.rows.filter(r => r.pass === false)
console.log(fails.length ? `\n${fails.length} FAIL` : '\nALL PASS')
process.exit(fails.length ? 1 : 0)
