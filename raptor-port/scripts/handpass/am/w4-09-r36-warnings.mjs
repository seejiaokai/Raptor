/* w4 · Astra rank 36 + roll-call R19 — a working-copy FIX of an issued cross-day warning.
   The everything week already carries one: Outlaw (casper) lands 20:45 on Monday (RU 19:20) and flies
   Tuesday's 08:40 VL — a crew-rest breach flagged on Tuesday. Monday is issued at AL1, Tuesday at its
   Original. Fix it on MONDAY's working copy (take Outlaw off the evening line), without publishing.
   Rules: AM51 (each screen flags the version it shows; a day is checked against each neighbour's PUBLISHED
   version if it has one, else its working copy; the issued content stays frozen), AM51b/AM51e (the view
   page's issued face shows its issued version's flags; the working-draft peek shows the working copy's),
   AM51c. Expected: the edit week's Tuesday no longer counts the breach (or strikes it "goes away once
   signed"); the view page's ISSUED Tuesday still shows it; the working-draft peek does not.
   Usage: node w4-09-r36-warnings.mjs [desktop|phone] */
const w = process.argv[2] || 'desktop'
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4'
const L = await import('./w4-lib.mjs')
const { open, STATE, PHONE, DESK, editWeek, board, closeBoard, head, shot, toastNow, clearToast, checker, go, frame, viewDay, book } = L
const { browser, page, errors } = await open({ ...(w === 'phone' ? PHONE : DESK), state: STATE })
const { ck, note, summary } = checker('R36 ' + w)
const O = 'casper'
const pic = s => `r36-${w}-${s}`

async function strip(sel, di) {
  const s = page.locator(`${sel} [data-daywarn="${di}"]:visible`).first()
  if (!(await s.count())) return []
  if (!(await page.locator(`${sel} [data-dwbox="${di}"].open`).count())) { await s.evaluate(e => e.scrollIntoView({ block: 'center' })); await s.click(); await page.waitForTimeout(400) }
  return page.evaluate(([q, i]) => [...document.querySelectorAll(`${q} [data-dwbox="${i}"] .witem`)].map(e => ({ t: e.innerText.replace(/\s+/g, ' ').trim(), struck: getComputedStyle(e).textDecorationLine.includes('line-through') || !!e.closest('.gone') || e.classList.contains('gone') })), [sel, di])
}
const rest = ls => ls.filter(x => /Outlaw/.test(x.t) && /rest/i.test(x.t))

/* ---- before ---- */
await editWeek(page)
const e0 = await strip('#eWeek', 1)
note('edit week Tuesday before', e0.map(x => x.t))
ck('the issued cross-day breach is there to start with', rest(e0).length > 0, 'Outlaw crew rest on Tuesday', e0.map(x => x.t))
await frame(page, '#eWeek .day[data-day="1"]')
await shot(page, pic('1-edit-before'))

/* ---- the fix on Monday's working copy: Outlaw off the 19:20 line ---- */
const slot = await page.evaluate(o => {
  const d = window.DAYS[0]
  for (let gi = 0; gi < d.waves.length; gi++) for (let li = 0; li < d.waves[gi].formations.length; li++) {
    const f = d.waves[gi].formations[li]
    for (let ai = 0; ai < f.aircraft.length; ai++) for (const s of ['p', 'w']) if (f.aircraft[ai][s] === o && f.to >= '19') return `0.${gi}.${li}.${ai}.${s}`
  }
  return null
}, O)
note('Outlaw\'s Monday-evening seat', slot)
await clearToast(page)
if (w === 'desktop') {
  const seat = page.locator(`#eWeek .seat[data-slot="${slot}"]:visible`).first()
  await seat.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await seat.click({ button: 'right' })
} else {
  await board(page, 0)
  /* the phone's door: drag his puck onto his own line's text (drag.ts — a seat puck dropped off any seat leaves it) */
  note('dropped on', await L.dragOffSeat(page, `#schedBoard .seat[data-slot="${slot}"]:visible`))
  await closeBoard(page)
}
await page.waitForTimeout(600)
const gone = await page.evaluate(s => { const [di, gi, li, ai, k] = s.split('.'); return window.DAYS[+di].waves[+gi].formations[+li].aircraft[+ai][k] || '(empty)' }, slot)
note('the fix', { toast: await toastNow(page), seatNow: gone, monHead: await head(page, 0) })
ck('Outlaw is off Monday\'s evening line on the working copy', gone !== O, 'seat empty', gone)

/* ---- after: the working face vs the issued face ---- */
await editWeek(page)
const e1 = await strip('#eWeek', 1)
note('edit week Tuesday after the fix', e1)
await frame(page, '#eWeek .day[data-day="1"]')
await shot(page, pic('2-edit-after-fix'))
ck('AM51: the working face no longer counts the breach (or strikes it "goes away once signed")', rest(e1).length === 0 || rest(e1).every(x => x.struck || /goes away/i.test(x.t)), 'gone or struck', e1.map(x => x.t))

const v1 = await viewDay(page, 1)
const vs = await strip('#vWeek', 1)
note('view page — ISSUED Tuesday', { tag: v1.tag, warnings: vs.map(x => x.t) })
await frame(page, '#vWeek .day[data-day="1"]')
await shot(page, pic('3-view-issued'))
ck('AM51/AM51b: the issued Tuesday keeps its issued breach (Monday\'s published AL1 still has Outlaw)', rest(vs).length > 0, 'Outlaw crew rest still on the issued face', vs.map(x => x.t))

const sel = page.locator('#vWeek select[data-vwork="1"]:visible').first()
if (await sel.count()) {
  await sel.selectOption('working'); await page.waitForTimeout(700)
  const vw = await strip('#vWeek', 1)
  note('view page — working-draft peek of Tuesday', vw.map(x => x.t))
  await frame(page, '#vWeek .day[data-day="1"]')
  await shot(page, pic('4-view-working'))
  ck('AM51e: the working-draft peek shows the working copy\'s flags (breach gone)', rest(vw).length === 0 || rest(vw).every(x => x.struck || /goes away/i.test(x.t)), 'gone', vw.map(x => x.t))
  await page.locator('#vWeek select[data-vwork="1"]:visible').first().selectOption('issued').catch(() => {})
} else note('working-draft peek', 'NO PICKER')

/* the member sees the same issued face as the admin (AM51e) */
await L.relogin(page, 'm')
const vm = await viewDay(page, 1)
const vms = await strip('#vWeek', 1)
await frame(page, '#vWeek .day[data-day="1"]')
await shot(page, pic('5-member-view-issued'))
ck('AM51e: the member\'s issued Tuesday shows the same breach', rest(vms).length > 0, 'Outlaw crew rest', vms.map(x => x.t))

note('book', await book(page))
ck('no console errors', errors.length === 0, 'none', errors)
summary()
await browser.close()
