// THE WALK OF THE CODE READ'S Q2 FIX (the M3 build's FULL check, 25 Oct 26), on the built bundle, with pictures:
//   a course filed on the Inputs page (it lands under Unavailable by itself, D1372) — and a Training a scheduler moves
//   "→ Unavail" (D1357) — must read in Edit Schedule's crew list as away, crossed out with its reason, never in full colour
//   as free; with a flying seat picked the same man is crossed out with "course"; a Training left on the Ground
//   Programme still reads as already tasked (faded), as before. Desktop 1536 x 864, admin; then the Scheduler Board's
//   crew list on a phone, a picture straight after each tap (D1281).
// Usage (from raptor-port/, a preview served on 4180): node scripts/handpass/lw-m3b-rw-crew.mjs
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-m3-build/rewalk-crew'
const H = await import('./lw-m3b-w2-lib.mjs')
const lib = await import('./lib.mjs')
const { L, T, note } = H
const fs = await import('node:fs')
fs.mkdirSync(H.OUT, { recursive: true })
H.clearPrefix('c-')
console.log('lw-m3b-rw-crew →', H.OUT)
const verdicts = []
const judge = (id, ok, said) => { verdicts.push({ id, ok }); note(id, ok ? 'PASS' : 'FAIL', said) }

const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
note('bundle', 'desk', await H.bundleName(P))
const ranger = await H.idOf(P, 'Ranger'), hunter = await H.idOf(P, 'Hunter'), saber = await H.idOf(P, 'Saber'), comet = await H.idOf(P, 'Comet')

/* the crew list's own puck for a man: its class (no = crossed out, busy = faded tasked, '' = free) and its words */
const puckOf = id => P.evaluate(id => {
  const e = [...document.querySelectorAll(`.ros-body .rpuck[data-person="${id}"], #sbRoster .rpuck[data-person="${id}"]`)].find(e => e.getBoundingClientRect().width > 0)
  if (!e) return null
  const cls = [...e.classList].filter(c => c !== 'rpuck' && c !== 'haswhy').join(' ')
  return { cls, why: e.dataset.why || '', title: e.title, shown: (e.querySelector('.rwhy') || {}).textContent || '' }
}, id)
const DOWS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
async function crewDay(di) {
  for (let i = 0; i < 8; i++) {
    const name = await L.txt(P, '.ros-body .er-dayname')
    const at = DOWS.findIndex(d => d.toLowerCase() === String(name || '').trim().toLowerCase())
    if (at === di) return true
    if (at < 0) return false
    const b = P.locator(`[data-crewstep="${at < di ? '1' : '-1'}"]:visible`).first()
    if (!(await b.count()) || await b.isDisabled()) return false
    await b.click(); await P.waitForTimeout(400)
  }
  return false
}
const crewPic = async (name, id) => H.pic(w, name, [`.ros-body .rpuck[data-person="${id}"]`, '.ros-body'], { pad: 6 })

/* ---------- the fixture, through the app's own windows ---------- */
const fc = await H.fileInput(w, { who: 'Ranger', type: 'CSE', from: '2026-07-14', remarks: 'Instructor course', tag: 'c-cse', oil: 'no' })
note('file-cse', 'desk', `stored acc ${fc.rec?.acc} date ${fc.rec?.date}`)
const ft = await H.fileInput(w, { who: 'Hunter', type: 'Training', from: '2026-07-14', remarks: 'Sim instructor training', tag: 'c-trg', oil: 'no' })
note('file-trg', 'desk', `stored acc ${ft.rec?.acc} date ${ft.rec?.date}`)
const fg = await H.fileInput(w, { who: 'Saber', type: 'Training', from: '2026-07-14', remarks: 'Ground school', tag: 'c-trg2', oil: 'no' })
const fa = await H.fileInput(w, { who: 'Comet', type: 'CSE', from: '2026-07-14', remarks: 'Safety course', tag: 'c-cse-all', oil: 'no', beforeSave: async () => { if (await P.locator('#inpEditAllday').count() && !(await P.locator('#inpEditAllday').isChecked())) { await L.press(w, '#inpEditAllday'); await P.waitForTimeout(250) } } })
note('file-cse-allday', 'desk', `stored acc ${fa.rec?.acc} allday ${fa.rec?.allday}`)
note('file-trg2', 'desk', `stored acc ${fg.rec?.acc} date ${fg.rec?.date} — left on the Ground Programme`)

/* Hunter's Training moved → Unavail by the scheduler, on Tuesday's own row: Reject (off the programme), then → Unavail,
   the buttons a scheduler presses (D945) */
await H.goEdit(w)
const scope = '#eWeek section.day[data-day="1"]'
const accList = () => P.evaluate(([scope, iid]) => [...document.querySelectorAll(`${scope} [data-acck="${iid}"]`)].filter(b => b.getBoundingClientRect().width > 0).map(b => b.dataset.acc + ':' + b.textContent.trim()), [scope, ft.rec.iid])
async function pressAcc(dest) {
  const sel = `${scope} [data-acc="${dest}"][data-acck="${ft.rec.iid}"]`
  const vis = async () => { const n = await P.locator(sel).count(); for (let i = 0; i < n; i++) if (await P.locator(sel).nth(i).isVisible()) return i; return -1 }
  let at = await vis()
  if (at < 0) { const t = P.locator(`${scope} [data-pitog="1"]`).first(); if (await t.count()) { await t.scrollIntoViewIfNeeded().catch(() => {}); await t.click(); await P.waitForTimeout(500); at = await vis() } }
  if (at < 0) return `no ${dest} button: have ${JSON.stringify(await accList())}`
  const b = P.locator(sel).nth(at); await b.scrollIntoViewIfNeeded().catch(() => {})
  const label = (await b.innerText()).trim()
  await b.click(); await P.waitForTimeout(1000)
  await H.answerAsks(w, 'c-acc-' + dest, { oil: 'no' })
  return 'pressed ' + label
}
note('move-trg', 'desk', `buttons ${JSON.stringify(await accList())}`)
const said = (await accList()).some(b => b.startsWith('u:')) ? await pressAcc('u') : (await pressAcc('x')) + ' · ' + (await pressAcc('u'))
note('move-trg', 'desk', `${said}; stored acc now ${(await H.inputById(P, ft.rec.iid))?.acc}`)

/* ---------- Edit Schedule's crew list, Tuesday, nothing picked ---------- */
await H.goEdit(w)
note('crew-day', 'desk', 'crew list on Tuesday ' + await crewDay(1))
const r0 = await puckOf(ranger), h0 = await puckOf(hunter), s0 = await puckOf(saber), c0 = await puckOf(comet)
await crewPic('c-1-ranger-course', ranger)
await crewPic('c-2-hunter-training-unav', hunter)
await crewPic('c-3-saber-training-ground', saber)
await crewPic('c-3b-comet-course-allday', comet)
await H.pic(w, 'c-0-crewlist-tuesday', ['.ros-body'], { pad: 4 })
judge('Q2-course', r0?.cls === 'busy', `Ranger, course 06:00-18:00 under Unavailable (faded, already tasked, as its Ground row did): ${JSON.stringify(r0)}`)
judge('Q2-course-allday', c0?.cls === 'no' && /course/i.test(c0.why), `Comet, all-day course under Unavailable (crossed out): ${JSON.stringify(c0)}`)
judge('Q2-moved', h0?.cls === 'busy' || h0?.cls === 'no', `Hunter, Training moved → Unavail: ${JSON.stringify(h0)}`)
judge('Q2-ground-control', s0?.cls === 'busy', `Saber, Training on the Ground Programme (control — already tasked): ${JSON.stringify(s0)}`)

/* ---------- the Scheduler Board's crew list, desktop ---------- */
await lib.board(P, 1); await P.waitForTimeout(800)
const rb = await puckOf(ranger)
await H.pic(w, 'c-5-board-ranger', [`#schedBoard .rpuck[data-person="${ranger}"]`], { pad: 40 })
judge('Q2-board', rb?.cls === 'busy', `the board's crew list — Ranger: ${JSON.stringify(rb)}`)
/* a flying seat picked: "+ Line" on Tuesday's first wave (the board's own button), then its empty front seat */
const before = await P.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-slot.empty[data-slot]')].map(e => e.dataset.slot))
const gl = P.locator('#schedBoard [data-gline="1.0"]:visible').first()
if (await gl.count()) {
  await gl.click(); await P.waitForTimeout(700)
  const seat = await P.evaluate(b => [...document.querySelectorAll('#schedBoard .sb-slot.empty[data-slot]')].map(e => e.dataset.slot).find(k => !b.includes(k) && k.indexOf(':') < 0 && /\.p$/.test(k)) || null, before)
  if (seat) {
    const loc = P.locator(`#schedBoard .sb-slot.empty[data-slot="${seat}"]`).first()
    await loc.scrollIntoViewIfNeeded(); await loc.click(); await P.waitForTimeout(600)
    const ra = await puckOf(ranger), ca = await puckOf(comet)
    await H.pic(w, 'c-4-board-seat-picked-ranger', [`#schedBoard .rpuck[data-person="${ranger}"]`], { pad: 40 })
    await H.pic(w, 'c-4b-board-seat-picked-line', [`#schedBoard .seat[data-slot="${seat}"]`], { pad: 30 })
    judge('Q2-armed', ra?.cls === 'no' && /course/i.test(ra.why) && ca?.cls === 'no', `the new line's front seat ${seat} picked — Ranger ${JSON.stringify(ra)} · Comet ${JSON.stringify(ca)}`)
    await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  } else note('Q2-armed', 'NOT WALKED', 'no new empty front seat after + Line')
  /* take the added line back off — Undo, the app's own */
  await P.locator('#schedBoard').getByRole('button', { name: /Undo/ }).first().click().catch(() => {}); await P.waitForTimeout(500)
} else note('Q2-armed', 'NOT WALKED', 'no + Line on the board')
await lib.closeBoard(P).catch(() => {})
note('errors', 'desk', JSON.stringify(w.errs.slice(0, 6)))

/* ---------- a phone: the board's crew list, a picture straight after each tap ---------- */
const state = await w.ctx.storageState()
const ph = await H.phoneFrom(state); const Q = ph.page
await L.signInPlain(ph, 'admin').catch(() => {})
await Q.evaluate(() => window.go('editsched')); await Q.waitForTimeout(1500)
const dayBtn = Q.locator('#eWeek [data-sbday="1"]:visible').first()
if (await dayBtn.count()) {
  await dayBtn.scrollIntoViewIfNeeded().catch(() => {})
  await dayBtn.click(); await Q.waitForTimeout(200)
  await Q.screenshot({ path: H.OUT + '/c-6-phone-board-tap.png', scale: 'css' })
  await Q.waitForSelector('#schedBoard'); await Q.waitForTimeout(800)
  /* the AIRCREW drawer at the right edge — a picture straight after the tap (D1281), then once it has slid open */
  const crewTab = Q.locator('#schedBoard .ros-tab:visible').first()
  if (await crewTab.count()) {
    await crewTab.click(); await Q.waitForTimeout(120)
    await Q.screenshot({ path: H.OUT + '/c-7-phone-crew-tap.png', scale: 'css' })
    await Q.waitForTimeout(700)
  } else note('phone-drawer', 'NOT WALKED', 'no AIRCREW tab on the phone board')
  const rp = await Q.evaluate(id => { const e = [...document.querySelectorAll(`#schedBoard .rpuck[data-person="${id}"]`)].find(e => e.getBoundingClientRect().width > 0); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); return { cls: [...e.classList].join(' '), why: e.dataset.why || '' } }, ranger)
  await Q.waitForTimeout(300)
  await Q.screenshot({ path: H.OUT + '/c-8-phone-crew-ranger.png', scale: 'css' })
  const box = await Q.evaluate(id => { const e = [...document.querySelectorAll(`#schedBoard .rpuck[data-person="${id}"]`)].find(e => e.getBoundingClientRect().width > 0); if (!e) return null; const r = e.closest('.rcol')?.getBoundingClientRect() || e.getBoundingClientRect(); return { x: Math.max(0, r.left - 6), y: Math.max(0, r.top - 6), width: Math.min(innerWidth - Math.max(0, r.left - 6), r.width + 12), height: Math.min(innerHeight - Math.max(0, r.top - 6), r.height + 12) } }, ranger)
  if (box) await Q.screenshot({ path: H.OUT + '/c-9-phone-crew-column.png', clip: box, scale: 'css' })
  judge('Q2-phone', !!rp && /\bbusy\b/.test(rp.cls), `phone board crew list — Ranger: ${JSON.stringify(rp)}`)
} else note('Q2-phone', 'NOT WALKED', 'no board door for Tuesday on the phone week')
note('errors', 'phone', JSON.stringify(ph.errs.slice(0, 6)))

H.saveLog('c-log.json')
const bad = verdicts.filter(v => !v.ok)
console.log(bad.length ? `FAIL ${bad.map(v => v.id).join(', ')}` : `ALL ${verdicts.length} PASS`)
await H.closeBrowser()
