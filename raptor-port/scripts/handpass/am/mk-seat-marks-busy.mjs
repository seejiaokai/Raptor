/* THE BUSY DAY for [AMEND-MARK-RING-CLASH] (24 Sep 26, his ask: "show me with the proposed fix how would it look like
   in a schedule that has 3 AL and multiple changes"). Monday of the everything-week, which already carries AL1, taken
   through two more amendments and a third in hand, every change made through the app's own write path and every
   amendment signed and published through its own buttons:
     AL2 (published)  Piston and Outlaw swap seats on the 19:20 RU line; a remark on the 07:45 VL line changes.
     AL3 (published)  a new WSO on the 07:45 VL line; the 19:20 RU line's take-off moves to 19:30.
     AL4 (waiting)    Warden takes Saber's seat on the 19:45 VL line — his landing breaks his Tuesday crew rest (the
                      dotted ring); Saber moves onto the 13:40 RU line, where he clashes with his 07:45 sortie (the
                      solid ring); a new WSO on the 19:45 VL line, with no warning; a new WSO on the 07:45 VL line
                      who draws an advisory (the thin amber ring); a remark on the 19:45 line changes.
   Then the flying waves are pictured today and with the fix (design B, mk-seat-marks-lib.mjs), on the edit week and
   the board, and once as the squadron sees it on View-only Sched, which the fix does not touch.
   Usage, with the build served on :4173:
     node mk-seat-marks-busy.mjs desktop 1   the desktop pictures at real size
     node mk-seat-marks-busy.mjs desktop 4   the two lines the fix changes, enlarged
     node mk-seat-marks-busy.mjs phone 2     the phone pictures */
import { mkdirSync } from 'node:fs'
const W = process.argv[2] || 'desktop'
const DPR = Number(process.argv[3] || (W === 'phone' ? 2 : 1))
const ZOOM = W === 'desktop' && DPR > 1
/* tall windows, so a whole wave fits in one picture; the app lays out by width */
const SIZE = W === 'phone' ? { width: 390, height: 1600 } : { width: 1440, height: 1300 }
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/mock/img/amend-seat-marks'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w2-lib.mjs')
const { B_CSS, design: lay } = await import('./mk-seat-marks-lib.mjs')
const { openHi, editWeek, board, closeBoard, signDay, publishAL, go, STATE } = L
const { browser, page, errors } = await openHi({ ...SIZE, state: STATE, dpr: DPR })
const design = (css) => lay(page, css)
const TAG = ZOOM ? 'zoom' : W

/* ---- the three rounds ------------------------------------------------------------------------------------- */
await editWeek(page)
const round = (fn, arg) => page.evaluate(fn, arg).then(async r => { await page.waitForTimeout(700); return r })
/* the first WSO who can take a seat on Monday with no warning of any kind — found by trying, as a scheduler would */
await page.evaluate(() => {
  window.__cleanWso = (key, skip) => {
    const P = window.PEOPLE
    for (const id of Object.keys(P)) {
      const q = P[id]; if (q.special || q.pers || q.seat !== 'RCP' || skip.includes(id)) continue
      window.setSlotVal(key, id); window.validate()
      const w = window.WARN, day = k => (w[k] && w[k][0]) || {}
      if (!day('chip')[id] && !day('trace')[id] && !(w.sev && w.sev[0] && w.sev[0][id])) return id
    }
    return null
  }
  /* …and the first who lands there with an ADVISORY only: the thin amber ring, no red of any kind */
  window.__amberWso = (key, skip) => {
    const P = window.PEOPLE
    for (const id of Object.keys(P)) {
      const q = P[id]; if (q.special || q.pers || q.seat !== 'RCP' || skip.includes(id)) continue
      window.setSlotVal(key, id); window.validate()
      const w = window.WARN, sev = w.sev && w.sev[0] && w.sev[0][id]
      if (sev && sev !== 'hard' && sev !== 'note' && !((w.trace[0] || {})[id])) return id
    }
    return null
  }
})
const log = []
log.push(['AL2 changes', await round(() => {
  const ru = window.DAYS[0].waves[1].formations[1], piston = ru.aircraft[0].p, outlaw = ru.aircraft[1].p
  window.setSlotVal('0.1.1.0.p', outlaw); window.setSlotVal('0.1.1.1.p', piston)
  window.txtSet('fr:0.0.0.1', '2A: BFM-5 // SIM IF WX')
  window.afterSchedMutate(); return 'swap + remark'
})])
log.push(['sign', await signDay(page, 0)], ['publish', await publishAL(page, 0)])
log.push(['AL3 changes', await round(() => {
  const clean = window.__cleanWso
  const was = window.DAYS[0].waves[0].formations[0].aircraft[0].w
  const w = clean('0.0.0.0.w', [was])
  window.txtSet('ff:0.1.1.to', '19:30')
  window.afterSchedMutate(); return { wso: w && window.PEOPLE[w].cs }
})])
log.push(['sign', await signDay(page, 0)], ['publish', await publishAL(page, 0)])
const made = await round(() => {
  const clean = window.__cleanWso
  const P = window.PEOPLE, byCs = cs => Object.keys(P).find(id => P[id].cs === cs)
  const warden = byCs('Warden'), saber = byCs('Saber')
  window.setSlotVal('0.1.0.0.p', warden)                    // Warden takes Saber's night seat …
  window.setSlotVal('0.0.1.0.p', saber)                     // … and Saber moves onto the 13:40 RU line
  const al3wso = window.DAYS[0].waves[0].formations[0].aircraft[0].w
  const wso = clean('0.1.0.1.w', [al3wso, window.DAYS[0].waves[1].formations[0].aircraft[1].w])
  const was = window.DAYS[0].waves[0].formations[0].aircraft[1].w
  const amber = window.__amberWso('0.0.0.1.w', [was, al3wso, wso])
  window.txtSet('fr:0.1.0.0', '1B: NIGHT BFM // TBC')
  window.afterSchedMutate()
  return { warden, saber, wso, amber }
})
const state = await page.evaluate((m) => {
  const W = window.WARN, cs = id => window.PEOPLE[id].cs
  const day = document.querySelector('#eWeek .day[data-day="0"]')
  const count = sel => day.querySelectorAll(sel).length
  const seat = k => { const s = day.querySelector(`.seat[data-slot="${k}"]`); return s ? `${cs(s.querySelector('.puck').dataset.person)} alc=${s.dataset.alc || '-'} aln=${s.dataset.aln || '-'} ${s.querySelector('.puck').className}` : 'none' }
  return { issued: { AL1: count('[data-alc="1"]'), AL2: count('[data-alc="2"]'), AL3: count('[data-alc="3"]') }, waiting: count('[data-aln]'),
    amber: m.amber && cs(m.amber), amberSev: m.amber && (W.sev[0] || {})[m.amber],
    wardenTrace: !!(W.trace[0] || {})[m.warden], saberChip: (W.chip[0] || {})[m.saber], wso: m.wso && cs(m.wso), wsoChip: (W.chip[0] || {})[m.wso] || 'none',
    seats: ['0.1.1.0.p', '0.1.1.1.p', '0.0.0.0.w', '0.1.0.0.p', '0.0.1.0.p', '0.1.0.1.w', '0.0.0.1.w'].map(seat) }
}, made)
console.log(JSON.stringify({ log, state }, null, 1))
if (!state.issued.AL3 || !state.wardenTrace || state.saberChip !== 'C' || state.wsoChip !== 'none' || !state.amber) console.log('!! the day did not come out as intended')

/* ---- the pictures ----------------------------------------------------------------------------------------- */
async function waveShot(name, root, i) {
  const el = page.locator(`${root}`).nth(i)
  if (!(await el.count())) { console.log('NO WAVE', name); return }
  /* centred, so the app's sticky top bar never lies over the wave's first line */
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(150)
  await el.screenshot({ path: `${OUT}/${TAG}-${name}.png` })
  console.log('shot', `${TAG}-${name}`)
}
/* the top of Monday: its head (the version it is on, what is waiting) down to the day note AL1 changed */
async function topShot(name, dayRoot) {
  const box = await page.evaluate((dayRoot) => {
    const day = document.querySelector(dayRoot); if (!day) return null
    const note = day.querySelector('.ah-note'); if (!note) return null
    day.scrollIntoView({ block: 'start', inline: 'center' })
    const bar = document.querySelector('.topbar'), barH = bar ? bar.getBoundingClientRect().bottom : 0
    window.scrollBy(0, -(barH + 12))
    const t = day.getBoundingClientRect(), b = note.getBoundingClientRect()
    return { x: t.left, y: t.top, w: t.width, h: b.bottom - t.top + 26 }      // + the orders line under the note
  }, dayRoot)
  if (!box) { console.log('NO TOP', name); return }
  await page.screenshot({ path: `${OUT}/${TAG}-${name}.png`, clip: { x: Math.max(0, box.x - 4), y: Math.max(0, box.y - 4), width: box.w + 8, height: Math.min(SIZE.height - box.y, box.h + 8) } })
  console.log('shot', `${TAG}-${name}`, JSON.stringify(box))
}
async function crewShot(name, keys) {        // the crew pucks of one line, enlarged
  const box = await page.evaluate((keys) => {
    const ss = keys.map(k => document.querySelector(`#eWeek .day[data-day="0"] .seat[data-slot="${k}"]`)).filter(Boolean)
    ss[0].scrollIntoView({ block: 'center', inline: 'center' })
    const rs = ss.map(e => e.getBoundingClientRect())
    return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) }
  }, keys)
  await page.screenshot({ path: `${OUT}/${TAG}-${name}.png`, clip: { x: box.x - 9, y: box.y - 9, width: box.r - box.x + 18, height: box.b - box.y + 18 } })
  console.log('shot', `${TAG}-${name}`)
}
const WEEK = '#eWeek .day[data-day="0"] .go', BOARD = '#schedBoard .sb-go'
if (ZOOM) {
  for (const d of ['today', 'fix']) {
    await design(d === 'today' ? null : B_CSS)
    await crewShot(`busy-night-${d}`, ['0.1.0.0.p', '0.1.0.0.w', '0.1.0.1.p', '0.1.0.1.w'])
    await crewShot(`busy-ru-${d}`, ['0.0.1.0.p', '0.0.1.0.w', '0.0.1.1.p', '0.0.1.1.w'])
    await crewShot(`busy-am-${d}`, ['0.0.0.0.p', '0.0.0.0.w', '0.0.0.1.p', '0.0.0.1.w'])
  }
} else {
  await design(null)
  await topShot('busy-week-top', '#eWeek .day[data-day="0"]')       // the fix does not reach it: one picture
  for (const d of ['today', 'fix']) {
    await design(d === 'today' ? null : B_CSS)
    for (const i of [0, 1]) await waveShot(`busy-week-w${i + 1}-${d}`, WEEK, i)
  }
  await board(page, 0)
  for (const d of ['today', 'fix']) {
    await design(d === 'today' ? null : B_CSS)
    for (const i of [0, 1]) await waveShot(`busy-board-w${i + 1}-${d}`, BOARD, i)
  }
  await closeBoard(page)
  await go(page, 'viewsched')
  await page.waitForTimeout(700)
  await topShot('busy-view-top', '#vWeek .day[data-day="0"]')
  for (const i of [0, 1]) await waveShot(`busy-view-w${i + 1}`, '#vWeek .day[data-day="0"] .go', i)
}
console.log('errors', JSON.stringify(errors))
await browser.close()
