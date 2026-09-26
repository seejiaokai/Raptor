/* W6 (26 Sep 26) — R19, the crew picker, reproduced from a FRESH world: does the scheduler board's crew palette
   (the AIRCREW column beside the board, unarmed) read the BOARD's day? A man on leave on the board's day must be struck
   through and out of "N free" (plan R19: "a man on leave or medical is not offered as free").
   Steps (the app's own controls only): file LL on Thu 16 Jul for a pilot with nothing that week (the Inputs page);
   Edit Schedule, the week at its start (Monday on the left); open Thursday's board from the week; read the palette;
   then drag his puck from the palette onto Thursday's SODB row, the way a scheduler drags a free-looking name.
   Then the same on Friday's board opened after the week was scrolled to Friday. Desktop and phone.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w6-03-board-palette.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop', PH = W === 'phone'
process.env.AB_WHO = 'rewalk/w6'
const L = await import('./ab-lib.mjs')
const S = await import('./ab-sched.mjs')
const W4 = await import('./w4-lib.mjs')
const { go, board, closeBoard, editWeek, shot, toastSpy, toasts, resultBook, ROOT, fileInput, frame } = L
const R = resultBook(`W6-palette-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w6-03-palette-${W}.txt`)
const o = await W4.openW4({ phone: PH, who: 'a' })
const page = o.page
await toastSpy(page)
const cs = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
const free = await S.freeMen(page, [0, 1, 2, 3, 4])
const seat = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.seat])))
const X = free.find(k => seat[k] === 'FCP')
R.note('X', `${X}=${cs[X]}`)
const f = await fileInput(page, { person: X, type: 'LL', from: '2026-07-16', span: 'all', remarks: 'W6 palette leave Thu' })
R.ck('filed', f.added === 1, 'LL on Thu 16 Jul for X, on the Inputs page', f)
const pal = () => page.evaluate(x => {
  const vis = e => !!(e.offsetWidth || e.offsetHeight)
  const root = [...document.querySelectorAll('#sbRoster')].find(vis)
  if (!root) return { err: 'NO PALETTE ON SCREEN' }
  const e = [...root.querySelectorAll(`.rpuck[data-person="${x}"]`)].find(vis)
  return { heads: [...root.querySelectorAll('.rh, .rh2, .er-h')].map(h => h.innerText.trim()), x: e ? { cls: e.className, why: e.getAttribute('data-why') || '', title: e.title } : 'NOT LISTED',
    busy: [...root.querySelectorAll('.rpuck.busy')].slice(0, 8).map(b => b.getAttribute('data-person')), SBDAY: window.SBDAY, ROSDAY: window.ROSDAY ?? '(not exposed)' }
}, X)
/* whom the palette greys as "already tasked" — whose day's tasks are those? */
const taskedOn = di => page.evaluate(di => { const d = window.DAYS[di], s = new Set()
  d.waves.forEach(w => w.formations.forEach(f => f.aircraft.forEach(a => { if (a.p) s.add(a.p); if (a.w) s.add(a.w) })))
  ;(d.dutywaves || []).forEach(b => b.rows.forEach(r => r.id && s.add(r.id))); return [...s] }, di)

await editWeek(page)
await frame(page, '#eWeek .day[data-day="0"]')
if (PH) {
  /* a phone shows one day at a time: open Thursday's board from the week's own door (the day is stepped to by the
     board's own arrows otherwise) — the palette on a phone is the drawer the AIRCREW tab slides open */
}
await board(page, 3)
let tab = null
if (PH) { const t = page.locator('#schedBoard .ros-tab:visible').first(); if (await t.count()) { await t.click(); await page.waitForTimeout(500); tab = 'opened' } else tab = 'NO TAB' }
const p1 = await pal()
const busyThu = await taskedOn(3), busyMon = await taskedOn(0)
const busyWhose = Array.isArray(p1.busy) ? { onThu: p1.busy.filter(k => busyThu.includes(k)).length, onMon: p1.busy.filter(k => busyMon.includes(k)).length, of: p1.busy.length } : null
await shot(page, `w6-${W}-P1-thu-board-palette`)
R.note('thu-board-palette', { tab, p1, busyWhose })
R.ck('P1-thu-board-strikes-x', p1.x && typeof p1.x === 'object' && /\bno\b/.test(p1.x.cls), "Thursday's board, unarmed: X (on leave Thursday) is struck through with his reason", p1)
R.ck('P1-palette-reads-board-day', busyWhose && busyWhose.onThu >= busyWhose.onMon, "the palette's greyed \"already tasked\" men are Thursday's (the board's day), not Monday's", busyWhose)
/* a scheduler drags the free-looking name onto Thursday's SODB row */
if (!PH && p1.x && typeof p1.x === 'object') {
  const src = page.locator(`#sbRoster .rpuck[data-person="${X}"]:visible`).first()
  const dst = page.locator('#schedBoard [data-fill="a:3.0.+"]:visible').first()
  await src.evaluate(e => e.scrollIntoView({ block: 'center' })); await dst.evaluate(e => e.scrollIntoView({ block: 'center' }))
  const a = await src.boundingBox(), b = await dst.boundingBox()
  if (a && b) {
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
    await page.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2 + 8, { steps: 3 })
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 14 }); await page.waitForTimeout(150)
    await page.mouse.up(); await page.waitForTimeout(700)
  }
  const onRow = await page.evaluate(x => { const w = window.DAYS[3].allhands[0].who; return Array.isArray(w) ? w.includes(x) : w === x }, X)
  const t = await toasts(page)
  const warn = await page.evaluate(() => [...document.querySelectorAll('#sbWarn li, #sbWarn .wrow, #sbSide .sb-warn *')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(s => /leave/i.test(s)).slice(0, 4))
  await shot(page, `w6-${W}-P2-after-drag`)
  R.note('P2-drag', { onRow, toasts: t, warn })
}
await closeBoard(page)

/* the same after scrolling the week to Friday — the board then opened for Thursday */
await editWeek(page)
await frame(page, '#eWeek .day[data-day="4"]')
await page.waitForTimeout(400)
await board(page, 3)
if (PH) { const t = page.locator('#schedBoard .ros-tab:visible').first(); if (await t.count()) { await t.click(); await page.waitForTimeout(500) } }
const p3 = await pal()
await shot(page, `w6-${W}-P3-thu-board-after-week-at-fri`)
R.note('thu-board-after-week-at-fri', p3)
R.ck('P3-thu-board-strikes-x', p3.x && typeof p3.x === 'object' && /\bno\b/.test(p3.x.cls), 'opened with the week scrolled elsewhere, Thursday\'s board still strikes X', p3)
R.note('errors', o.errors.slice(0, 10))
R.save()
await o.browser.close()
