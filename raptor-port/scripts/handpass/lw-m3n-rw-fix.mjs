// THE RE-WALK OF THE CODE READ'S FIXES (the night of 26 Oct 26) and the scenarios it named, as assertions of the right
// behaviour (walk-scripts §6), the built bundle on LW_PORT, desktop 1536 x 864 unless said:
//   F1a (read's 1)  a course rejected and put on the Ground Programme, then Edit Schedule moved to another week — the war
//                   still counts him in (Available P as before the filing); and back on its own week, in
//   F1b (read's 3)  the demo's course (12–13 Jan) stands under Unavailable and the war counts its man out
//   F2  (read's 10) the drag window: words typed, then ⋯ → Post in → Post in — the words are on the bid
//   P1  (read's 10) a Post in pressed in the drag window, then Undo — a posting is no Undo step (D350): it stays
//   S1  (read's 9)  WebKit at an iPhone's size: after signing in the page is at its top
// Usage (from raptor-port/, the build served on LW_PORT): node scripts/handpass/lw-m3n-rw-fix.mjs
process.env.LW_PORT ||= '4190'
process.env.LW_OUT ||= '2026-10-26-lw-m3-night/fix'
const fs = await import('node:fs')
const H = await import('./lw-m3b-w2-lib.mjs')
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T, note } = H
fs.mkdirSync(H.OUT, { recursive: true })
H.clearPrefix('f')
console.log('lw-m3n-rw-fix →', H.OUT)
const verdicts = []
const judge = (id, ok, said) => { verdicts.push({ id, ok }); note(id, ok ? 'PASS' : 'FAIL', said) }
const iso = '2026-07-15'
async function pressAcc(w, scope, di, iid, dest) {
  const P = w.page
  const sel = `${scope} [data-acc="${dest}"][data-acck="${iid}"]`
  const vis = async () => { const n = await P.locator(sel).count(); for (let i = 0; i < n; i++) if (await P.locator(sel).nth(i).isVisible()) return i; return -1 }
  let at = await vis()
  if (at < 0) { const t = P.locator(`${scope} [data-pitog="${di}"]`).first(); if (await t.count()) { await t.scrollIntoViewIfNeeded().catch(() => {}); await t.click(); await P.waitForTimeout(500); at = await vis() } }
  if (at < 0) return false
  const b = P.locator(sel).nth(at); await b.scrollIntoViewIfNeeded().catch(() => {})
  await b.click(); await P.waitForTimeout(1000)
  await H.answerAsks(w, 'f-acc-' + dest, { oil: 'no' })
  return true
}
const availNow = async (w, who, name) => { await H.warOpen(w, who, iso); const a = Number(await H.availP(w.page, iso)); if (name) await H.warStrips(w, name, who, [iso]); return a }
/* a week button of the schedule's own week strip — the next week after the one on screen */
async function nextWeek(w) {
  const P = w.page
  await H.goEdit(w)
  const b = await P.evaluate(() => { const bs = [...document.querySelectorAll('button[data-wk]')].filter(b => b.getBoundingClientRect().width > 0); const i = bs.findIndex(b => b.classList.contains('on')); return i >= 0 && bs[i + 1] ? bs[i + 1].getAttribute('data-wk') : null })
  if (!b) return null
  await P.locator(`button[data-wk="${b}"]:visible`).first().click(); await P.waitForTimeout(1200)
  return b
}
async function weekOf(w, v) { const P = w.page; await H.goEdit(w); await P.locator(`button[data-wk="${v}"]:visible`).first().click(); await P.waitForTimeout(1200) }

/* ---------- F1a ---------- */
const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
note('bundle', 'desk', await H.bundleName(P))
const comet = await H.idOf(P, 'Comet')
const before = await availNow(w, comet, 'f1-0-war-before')
const fc = await H.fileInput(w, { who: 'Comet', type: 'CSE', from: iso, remarks: 'Instructor course', tag: 'f1', oil: 'no' })
const filed = await availNow(w, comet)
await H.goEdit(w)
const home = await P.evaluate(() => [...document.querySelectorAll('button[data-wk]')].find(b => b.classList.contains('on') && b.getBoundingClientRect().width > 0)?.getAttribute('data-wk') ?? null)
const scope = '#eWeek section.day[data-day="2"]'
const rej = await pressAcc(w, scope, 2, fc.rec.iid, 'x')
const gr = await pressAcc(w, scope, 2, fc.rec.iid, 'g')
const onWeek = await availNow(w, comet, 'f1-1-war-on-ground-its-week')
const wk2 = await nextWeek(w)
const accOff = (await H.inputById(P, fc.rec.iid))?.acc ?? '(none)'
const offWeek = await availNow(w, comet, 'f1-2-war-on-ground-another-week')
if (home) await weekOf(w, home)
const back = await availNow(w, comet)
judge('F1a', rej && gr && filed === before - 1 && onWeek === before && !!wk2 && offWeek === before && back === before,
  `Available P before ${before}, filed ${filed}, rejected and → Ground on its week ${onWeek}; the schedule on week ${wk2}: the course's mark "${accOff}", Available P ${offWeek}; back on its week ${back}`)

/* ---------- F1b the demo course ---------- */
{
  const demo = await P.evaluate(() => { const r = (window.INPUTS || []).find(r => r && r.type === 'CSE' && r.yr === 2026 && /^Jan 12/.test(r.date)); return r ? { iid: r.iid, person: r.person, acc: r.acc ?? null } : null })
  if (demo) {
    const d = '2026-01-12'
    await H.warOpen(w, demo.person, d)
    const cell = await H.cellBoxes(w, demo.person, d)
    await H.warStrips(w, 'f1b-1-war-demo-course', demo.person, [d])
    judge('F1b', demo.acc === 'u' && JSON.stringify(cell).includes('CSE'), `the demo course (${demo.person}, 12–13 Jan) filed "${demo.acc}"; its cell ${JSON.stringify(cell)}`)
  } else judge('F1b', false, 'no demo course on 12 Jan found')
}

/* ---------- F2 words with Post in, P1 its Undo ---------- */
{
  const ids = await M.ids(P)
  const who = ids.Drifter, a = '2026-12-07', z = '2026-12-08'
  /* pending bids, so the words land on the bids ("Approve what I enter" off — on, the leave is filed approved) */
  await M.dragCells(w, [who, a], [who, z]); await M.setSwitch(w, false, 'sel'); await L.press(w, T('sel-LL')); await P.waitForTimeout(700)
  if (await L.vis(P, T('select-sheet'))) { await L.press(w, T('sel-LL')); await P.waitForTimeout(700) }
  await P.keyboard.press('Escape').catch(() => {})
  await M.dragCells(w, [who, a], [who, z])
  await L.press(w, T('sel-remarks')); await P.keyboard.press('Control+A'); await P.keyboard.type('Exercise support'); await P.waitForTimeout(200)
  await L.press(w, T('sel-more')); await P.waitForSelector(T('sel-more-menu'))
  await L.press(w, T('sel-postin')); await P.waitForTimeout(300)
  await H.pic(w, 'f2-1-postin-with-words', [T('select-sheet')], { pad: 4 })
  const prev = '2026-12-06'
  const clsBefore = await P.evaluate(([id, d]) => document.querySelector(`[data-testid="cell-${id}-${d}"]`)?.className ?? null, [who, prev])
  await L.press(w, T('sel-pi-confirm')); await P.waitForTimeout(900)
  const st = await M.stateOf(P, who, a)
  const clsAfter = await P.evaluate(([id, d]) => document.querySelector(`[data-testid="cell-${id}-${d}"]`)?.className ?? null, [who, prev])
  judge('F2', /Exercise support/.test(st), `the bid on ${a} after Post in: ${st}`)
  /* Undo, the top bar's own button */
  await P.locator('button[aria-label="Undo"]:visible').first().click(); await P.waitForTimeout(900)
  const clsUndo = await P.evaluate(([id, d]) => document.querySelector(`[data-testid="cell-${id}-${d}"]`)?.className ?? null, [who, prev])
  await M.rangeShot(w, who, '2026-12-04', z, 'f2-2-after-undo').catch(() => {})
  /* a posting is no Undo step (his D350 — "the one undo does not take back … a posting (post out / post in …)"), the
     one-day window's the same: Undo leaves the posting and takes back the step before it */
  judge('P1', clsBefore !== clsAfter && clsUndo === clsAfter, `6 Dec's cell: before "${clsBefore}", posted in "${clsAfter}", after Undo "${clsUndo}" (D350: a posting is no Undo step)`)
}
const deskErrs = [...w.errs]
await w.ctx.close()

/* ---------- S1 WebKit at an iPhone's size ---------- */
{
  const m = await H.phoneCtx('webkit')
  await L.signInPlain(m, 'admin'); await m.page.waitForTimeout(700)
  const at = await m.page.evaluate(() => { const bar = document.querySelector('.topbar'); const day = document.querySelector('#vWeek .day.today'); return { y: Math.round(scrollY), bar: bar ? Math.round(bar.getBoundingClientRect().bottom) : 0, day: day ? Math.round(day.getBoundingClientRect().top) : -1 } })
  await m.page.screenshot({ path: `${H.OUT}/s1-webkit-signed-in.png` })
  judge('S1', at.y === 0 && at.day >= at.bar, `WebKit 402 wide: page at ${at.y}px; today's card top ${at.day}, the bar's foot ${at.bar}`)
  deskErrs.push(...m.errs)
}
note('errors', 'all', JSON.stringify(deskErrs.slice(0, 8)))
H.saveLog('f-log.json')
const bad = verdicts.filter(v => !v.ok)
console.log(bad.length ? `FAIL ${bad.map(v => v.id).join(', ')}` : `ALL ${verdicts.length} PASS`)
await H.closeBrowser()
process.exit(0)
