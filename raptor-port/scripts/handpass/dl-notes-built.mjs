/* THE PUBLISH NOTE HE PICTURED, RAISED BY THE SCREEN'S OWN "PUBLISH DAY" ([NOTES-SHORTER] — N1, owner D837; the join
   D839). The walk's W2 published the seed Saturday and got "Saturday published and approved" alone: nobody stands on that
   day's Common Programme, so the app has no OIL sentence to add. This script makes the day he pictured — men who earn on
   a timed ground row, and a man on a Common Programme row that has no times — and then publishes it the way a scheduler
   does: the four sign-off names, then "Publish day". The men and the rows are a fixture, put on through the bridge; the
   publish, and so the note, is the screen's.
     usage: DL_SHOTS=docs/img/handpass/2026-10-14-three-builds node scripts/handpass/dl-notes-built.mjs [phone|desk] */
import * as L from './dl-lib.mjs'

const K = process.argv[2] === 'desk' ? 'desk' : 'phone'
const w = await L.world(K), p = w.page
const errs = []; p.on('pageerror', e => errs.push(String(e)))
const ok = (key, expected, saw, pass) => { L.row(`The publish note [${K}]`, key, expected, typeof saw === 'string' ? saw : JSON.stringify(saw), pass ? 'works' : 'FAIL'); console.log(pass ? 'works' : 'FAIL', '—', key, '—', typeof saw === 'string' ? saw : JSON.stringify(saw)) }
const SAT = 5
const note = () => p.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return null; const s = getComputedStyle(t), r = t.getBoundingClientRect(); return { text: t.textContent, opacity: s.opacity, left: Math.round(r.left), right: Math.round(innerWidth - r.right), lines: Math.round(r.height / parseFloat(s.lineHeight || '20')), h: Math.round(r.height), lh: s.lineHeight } })
const shown = async () => { for (let i = 0; i < 60; i++) { const t = await note(); if (t && t.text && +t.opacity >= 0.99) { await L.sleep(450); return note() } await L.sleep(50) } return note() }
const gone = async () => { for (let i = 0; i < 50; i++) { const t = await note(); if (!t || !t.text || +t.opacity < 0.05) break; await L.sleep(150) } await L.sleep(150) }

try {
  await L.go(w, 'editsched')
  /* the fixture: two men on a timed ground row (they earn), one man on the day's first Common Programme row (no times) */
  const fx = await p.evaluate(di => {
    const W = window
    const ids = Object.keys(W.PEOPLE).filter(id => !['all', 'allavail'].includes(id) && W.PEOPLE[id] && W.PEOPLE[id].cs && !W.PEOPLE[id].pers && !W.PEOPLE[id].sans && !W.PEOPLE[id].ph).slice(0, 3)
    W.DAYS[di].ground.push({ prog: 'Range brief', str: '09:00', end: '12:00', who: '', rmks: '' }); W.afterSchedMutate()
    for (const id of ids.slice(0, 2)) { W.fillSlot(`g:${di}.${W.DAYS[di].ground.length - 1}.+`, id); W.afterSchedMutate() }
    /* the seed Saturday's Common Programme holds no row (its "WEEKEND - NO FLYING" is the day's note): one row in the
       shape of Monday's first, its times left blank, and a man put on it by the row's own append key */
    const prog = W.DAYS[di].allhands
    const like = (W.DAYS[0].allhands || [])[0] || {}
    prog.push({ ...Object.fromEntries(Object.keys(like).filter(k => k !== 'rid').map(k => [k, Array.isArray(like[k]) ? [] : ''])), prog: 'Squadron clean-up', str: '', end: '', who: '', rmks: '' }); W.afterSchedMutate()
    const ri = prog.length - 1
    W.fillSlot(`a:${di}.${ri}.+`, ids[2]); W.afterSchedMutate()
    return { ids, like: JSON.stringify(like).slice(0, 200), row: JSON.stringify(prog[ri] || null).slice(0, 240) }
  }, SAT)
  console.log('fixture', JSON.stringify(fx))
  await L.sleep(500)
  /* the scheduler's own publish: the four names, then "Publish day" */
  const day = `#eWeek .day[data-day="${SAT}"]`
  await p.locator(day).first().evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })); await L.sleep(400)
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = p.locator(`#eWeek select[data-sign="${role}"][data-signday="${SAT}"]:visible`).first()
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.selectOption(opts[0]); await L.sleep(250)
  }
  await gone()
  const b = p.locator(`#eWeek [data-beak="${SAT}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' }))
  if (w.phone) await b.tap(); else await b.click()
  const t = await shown()
  await L.pic(w, `note-${K}-1-published-with-oil-line`)
  const WANT = 'Saturday 18 Jul published and approved. The Common Programme has no usable times, so nobody on it earns OIL.'
  ok('N1 — the note he pictured, by the screen\'s own "Publish day"', WANT, t ? t.text : 'NO NOTE', !!t && t.text === WANT)
  if (t && K === 'phone') ok('N1 on a phone — the full width, and how tall', 'the screen\'s width less 12 each side; two lines — 54 tall, where a one-line note is 38 (it was five lines in the half-width box)', t, t.left === 12 && t.right === 12 && t.h === 54)
  ok('no page error', 'none', errs.length ? errs.join(' | ') : 'none', !errs.length)
} finally {
  await L.close(w)
}

/* N12 — THE REFUSAL UNDER THE DAY'S SWITCH NAMES THE SWITCH (owner D843, D844, 14 Oct 26 — "What is turn 'that' off mean",
   then "Clearer"). A world of its own, Saturday not published: the Scheduler Board, OIL Earn, the day's own switch
   pressed, then a tap on an event's own OIL mark — the tap a person CAN make (a man's puck is not a control there). */
const w2 = await L.world(K), q = w2.page
const errs2 = []; q.on('pageerror', e => errs2.push(String(e)))
const note2 = () => q.evaluate(() => { const t = document.getElementById('toastEl'); return t ? { text: t.textContent, opacity: getComputedStyle(t).opacity } : null })
const shown2 = async () => { for (let i = 0; i < 60; i++) { const t = await note2(); if (t && t.text && +t.opacity >= 0.99) { await L.sleep(350); return note2() } await L.sleep(50) } return note2() }
const gone2 = async () => { for (let i = 0; i < 90; i++) { const t = await note2(); if (!t || !t.text || +t.opacity < 0.05) break; await L.sleep(150) } await L.sleep(150) }
const press2 = async sel => { const b = q.locator(sel).first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); if (w2.phone) await b.tap(); else await b.click(); await L.sleep(350) }
try {
  await L.go(w2, 'editsched')
  await q.locator(`#eWeek [data-sbday="${SAT}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await q.waitForSelector('#schedBoard .sb-sec', { state: 'attached' }); await L.sleep(600)
  await press2(w2.phone ? `#schedBoard [data-oilmode="${SAT}"]:visible` : '#sbOil')
  const label = (await q.locator(`#schedBoard [data-oilblank="${SAT}"]:visible`).first().innerText()).trim()
  await press2(`#schedBoard [data-oilblank="${SAT}"]:visible`)
  await gone2()
  const pucks = await q.locator('#schedBoard [data-oilp]:visible').count()
  await press2('#schedBoard [data-oilitem]:visible')
  const t2 = await shown2()
  await L.pic(w2, `note-${K}-2-under-the-days-switch`)
  const WANT2 = `Nothing on this day earns. Turn off “${label}” first.`
  ok('N12 — a tap on an event\'s OIL mark with the day\'s switch on', `${WANT2} — the name quoted is the switch's own label, read off the screen ("${label}")`, t2 ? t2.text : 'NO NOTE', !!t2 && t2.text === WANT2 && label === 'Nothing today earns')
  ok('N12 — a man\'s puck under the day\'s switch', 'not a control there: no puck is a tap target (which is why the sentence is said from the event\'s mark)', `${pucks} tappable pucks`, pucks === 0)
  ok('no page error (the board)', 'none', errs2.length ? errs2.join(' | ') : 'none', !errs2.length)
} finally {
  await L.close(w2)
}
