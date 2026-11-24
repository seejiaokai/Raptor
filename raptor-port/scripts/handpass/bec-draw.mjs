// THE BELL'S "EVERY CHANGE" LINE, DRAWN ON THE REAL APP (his D2600 — drawn, not built; chat 170's night of 25 Nov 26, job 1).
// One world per run: Saber (desktop) makes each case in ONE save; Ranger reads his bell on his iPhone's size (Chromium and
// WebKit, 402x874) and on a desktop (1440x900); each case's row is pictured, its words read from the page and its rows
// counted. Run the same world on two frozen builds — today's (main) and the scratch "every change" build — and the
// pictures pair up by name. Built over the round-4 walk's lib (wr4-lib.mjs): the build is served inside the test browser.
//   node scripts/handpass/bec-draw.mjs <tag> <A|B>      (env WR4_NEW = the build folder, WR4_OUT = the run's folder)
//   world A: cases 1-5 (two to seven changes in one save, a replaced Leave War bid)
//   world B: the wordings round 4 left unruled (today's build only)
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
console.log('bec-draw v1')
const TAG = process.argv[2] || 'today'
const WORLD = (process.argv[3] || 'A').toUpperCase()
if (!process.env.WR4_OUT || !process.env.WR4_NEW) throw new Error('set WR4_OUT and WR4_NEW')
const L = await import('./wr4-lib.mjs')
const { newPage, signIn, handOver, fileInput, editInput, recOf, bundleOf, log, press, sleep, go, openBell, bellFit, facts, OUT, NEW_DIR, RANGER, HEX } = L
const q = t => `[data-testid="${t}"]`
const day = (w, iso) => press(w, `#inpEdCal [data-iso="${iso}"]`)
const span = (w, m) => press(w, `#inpEditSpan [data-span="${m}"]`)
const kind = (w, k) => w.page.selectOption('#inpEditPop #inpEditType', k)
const title = (w, t) => w.page.fill('#inpEditPop #inpEditOwnTitle', t)
const rmk = (w, t) => w.page.fill('#inpEditPop #inpEditRmk', t)
const toggle = (w, id) => press(w, `#inpEditPop [data-pp="${id}"]`)
async function times(w, a, b) {
  const cu = w.page.locator('#inpEditSpan [data-span="custom"]')
  if (await cu.count()) await press(w, cu)
  const ad = w.page.locator('#inpEditPop #inpEditAllday')
  if (await ad.count() && await ad.isChecked()) await ad.click()
  await w.page.fill('#inpEditPop #inpEditStart', a); await w.page.fill('#inpEditPop #inpEditEnd', b)
}
async function toDay(w, iso) {
  if (!(await w.page.locator(`#inpEdCal [data-iso="${iso}"]`).count())) await press(w, '#inpEdCal button[aria-label="Next month"]')
  await day(w, iso)
}
export const LONG = 'Advanced range safety procedures brief 1'   // 40 letters, the most a title takes
const out = { tag: TAG, world: WORLD, cases: {}, people: {}, swap: process.env.BEC_SWAP === '1' }
const T = (extra = {}) => ({ type: 'Training', people: [RANGER, HEX], from: '09:00', to: '10:00', remarks: 'Bring your kit', ...extra })

/* the other people the window offers, with their callsigns — the longest first (the worst case names the two longest) */
async function others(w) {
  return w.page.evaluate(() => {
    const ids = [...document.querySelectorAll('#inpEditPop [data-pp]')].map(b => b.getAttribute('data-pp')).filter(id => !['bane', 'rocky', 'stiff'].includes(id) && !/9$/.test(id))
    return ids.map(id => ({ id, cs: (window.PEOPLE[id] && window.PEOPLE[id].cs) || id })).sort((a, b) => b.cs.length - a.cs.length || a.cs.localeCompare(b.cs))
  })
}

/* [case, the day it is filed on, its filing, the one save, the bold name and the day its line shows] */
const A_CASES = [
  ['c1', '2026-07-13', T(), async w => { await day(w, '2026-07-14'); await rmk(w, 'Bring water') }, 'Training', 'Tue 14 Jul'],
  ['c2', '2026-07-15', T(), async w => { await day(w, '2026-07-16'); await title(w, 'Range brief'); await rmk(w, 'Bring water') }, 'Range brief', 'Thu 16 Jul'],
  ['c3a', '2026-07-17', T({ title: 'Range brief' }), async w => {
    await day(w, '2026-07-20'); await times(w, '08:00', '10:00'); await title(w, 'Range talk'); await rmk(w, 'Bring water')
    const x = (await others(w)).slice(-1); out.people.c3a = x; for (const p of x) await toggle(w, p.id)
  }, 'Range talk', 'Mon 20 Jul'],
  ['c3b', '2026-07-21', T({ title: 'Range brief' }), async w => {
    await kind(w, 'Meeting'); await sleep(300); await day(w, '2026-07-22'); await times(w, '08:00', '10:00'); await title(w, 'Range talk'); await rmk(w, 'Bring water')
    const x = (await others(w)).slice(-1); out.people.c3b = x; for (const p of x) await toggle(w, p.id)
  }, 'Range talk', 'Wed 22 Jul'],
  ['c3c', '2026-07-23', { type: 'LL', people: [RANGER], span: 'all', remarks: 'Bring your kit' }, async w => {
    await kind(w, 'OL'); await sleep(300); await day(w, '2026-07-24'); await span(w, 'am'); await rmk(w, 'Back by noon')
  }, 'OL', 'Fri 24 Jul'],
  ['c4', '2026-07-27', null, async w => {
    /* the worst: a change of kind into one that files itself under Unavailable (a course), the days and the hours, two
       added, two taken off, its long title changed, its remark — seven parts, the most one save of the window makes */
    await kind(w, 'CSE'); await sleep(400)
    await title(w, 'Range course')
    await day(w, '2026-07-28'); await day(w, '2026-07-30')
    await times(w, '08:00', '11:30')
    const o = await others(w), gone = out.people.c4off || []
    const add = o.filter(p => !gone.some(g => g.id === p.id)).slice(0, 2); out.people.c4add = add
    for (const p of add) await toggle(w, p.id)
    await toggle(w, HEX); for (const p of gone) await toggle(w, p.id)
    await rmk(w, 'Bring water and a hat')
  }, 'Range course', 'Tue 28 Jul'],
]

/* world B — the wordings round 4 left unruled, on today's build */
const B_CASES = [
  ['u1', '2026-08-03', { type: 'LL', people: [RANGER], span: 'all' }, [async w => { await kind(w, 'OL'); await sleep(300); await span(w, 'am') }], 'OL', 'Mon 3 Aug'],
  ['u2', '2026-08-04', { type: 'LL', people: [RANGER], span: 'all' }, [w => span(w, 'am'), async w => { await kind(w, 'Training'); await sleep(300) }], 'Training', 'Tue 4 Aug'],
  ['u3', '2026-08-05', { type: 'LL', people: [RANGER], span: 'am' }, [w => day(w, '2026-08-06')], 'LL', 'Thu 6 Aug'],
  ['u4', '2026-08-07', { type: 'Training', people: [RANGER], from: '09:00', to: '10:00' }, [w => title(w, 'Sim')], 'Sim', 'Fri 7 Aug'],
  ['u5', '2026-08-10', { type: 'Training', people: [RANGER], from: '09:00', to: '10:00', title: 'Brief' }, [w => title(w, '')], 'Training', 'Mon 10 Aug'],
  ['u6', '2026-08-11', { type: 'Attach', people: [RANGER], title: 'Exercise Kite' }, [w => w.page.fill('#inpEditPop #inpEditTo', '146 Sqn')], 'Exercise Kite · 146 Sqn', 'Tue 11 Aug'],
]

/* a row of the bell: scrolled to the middle of the list, its box with a little around it, as wide as the list */
async function rowShot(w, c, name, L0, where) {
  await w.page.evaluate(i => { const l = document.querySelector(`[data-w4="${i}"]`); l && l.scrollIntoView({ block: 'center' }) }, L0.i)
  await sleep(250)
  const clip = await w.page.evaluate(i => {
    const l = document.querySelector(`[data-w4="${i}"]`), list = document.querySelector('[data-testid="bell-list"]')
    if (!l || !list) return null
    const r = l.getBoundingClientRect(), b = list.getBoundingClientRect()
    const y = Math.max(b.top, r.top - 1), y2 = Math.min(b.bottom, r.bottom + 1)
    return { x: Math.max(0, b.left - 6), y, width: Math.min(innerWidth, b.right + 6) - Math.max(0, b.left - 6), height: y2 - y }
  }, L0.i)
  /* the place marked: on the "every change" build the new words ringed green (round 4's way); in world B the words the
     question is about ringed amber; today's world A pictures are left as the app draws them. An outline takes no room. */
  const ring = TAG === 'every' ? '#34c759' : WORLD === 'B' ? '#ffc83d' : ''
  if (ring) await w.page.evaluate(([i, col]) => { const e = document.querySelector(`[data-w4="${i}"] .bl-what`); if (e) { e.style.outline = `1.5px solid ${col}`; e.style.outlineOffset = '2px'; e.style.borderRadius = '3px' } }, [L0.i, ring])
  const fit = (await bellFit(w.page))[L0.i]
  const m = await w.page.evaluate(i => {
    const l = document.querySelector(`[data-w4="${i}"]`), wt = l && l.querySelector('.bl-what')
    if (!wt) return null
    const cs = getComputedStyle(wt)
    return { cut: wt.scrollWidth > wt.clientWidth + 1 || /…/.test(wt.textContent || ''), clamp: cs.webkitLineClamp || cs.lineClamp || 'none', overflow: cs.overflow, whiteSpace: cs.whiteSpace, maxHeight: cs.maxHeight, textOverflow: cs.textOverflow, rowHeight: Math.round(l.getBoundingClientRect().height) }
  }, L0.i)
  await L.shot(w.page, c, name, clip, `${L0.name} ${L0.day} / ${L0.what}`, w.size, { fit, m, where })
  ;(out.cases[c] ||= {})[where] = { text: `${L0.name} ${L0.day} / ${L0.what}`, rows: fit && fit.lines, fit, m, picture: name + '.png' }
  log(c, `${where}: "${L0.name} ${L0.day} / ${L0.what}" — ${fit && fit.lines} row(s) ${JSON.stringify(m)}`)
}
/* THE FALLBACK, used only if the scratch build cannot be made (BEC_SWAP=1, run on today's build with TAG=every): each line
   that ends "and N more change(s)" has those words replaced in the page by the parts it did not say, read from the
   notice's own stored parts (window.NOTICES) and worded as notices.ts partWords words them — only the five kinds that
   can come after the first two in these cases; any other throws. The first two parts are checked against the app's own
   words first, so a wording drift shows. The layout is the app's: only the text of the line changes (round 4's way). */
const SWAP = process.env.BEC_SWAP === '1'
async function swapEvery(page) {
  return page.evaluate(() => {
    const cs = id => { const p = window.PEOPLE[id]; return p && p.cs ? String(p.cs) : String(id) }
    const names = who => (who.length <= 2 ? who.map(cs).join(', ') : `${who.length} people`)
    const word = p => {
      switch (p.k) {
        case 'add': return `${names(p.who)} added`
        case 'rem': return `${names(p.who)} taken off`
        case 'kind': return `${p.was} changed to ${p.now}`
        case 'title': return `Renamed — was ${p.was}`
        case 'rmk': return 'Remark changed'
      }
      throw new Error('swap: a part this fallback does not word: ' + p.k)
    }
    const LOWER = new Set(['del', 'cx', 'uncx', 'off', 'on', 'unav', 'unavoff', 'when', 'title', 'rmk'])
    const done = []
    for (const l of document.querySelectorAll('[data-testid="bell-list"] .bl-line')) {
      const id = (l.getAttribute('data-testid') || '').replace(/^bell-line-/, '')
      const n = (window.NOTICES || []).find(x => x.id === id), wt = l.querySelector('.bl-what')
      const t = (wt.textContent || '').replace(/\s+/g, ' ').trim()
      const m = /^(.*), and (\d+) more changes? · (.*)$/.exec(t)
      if (!m || !n) continue
      const parts = (n.what || []).filter(p => p && p.k !== 'rbid')
      if (parts.length !== 2 + +m[2]) throw new Error('swap: the count does not match the stored parts: ' + t)
      /* the first two as the app said them, checked where this fallback can word them */
      for (const [i, p] of parts.slice(0, 2).entries()) {
        if (!['add', 'rem', 'kind', 'title', 'rmk'].includes(p.k)) continue
        let w = word(p); if (i && LOWER.has(p.k)) w = w.charAt(0).toLowerCase() + w.slice(1)
        if (!m[1].includes(w)) throw new Error(`swap: the app words part ${i} differently: "${w}" not in "${m[1]}"`)
      }
      const rest = parts.slice(2).map(p => { const w = word(p); return LOWER.has(p.k) ? w.charAt(0).toLowerCase() + w.slice(1) : w })
      const now = `${m[1]}, ${rest.join(', ')} · ${m[3]}`
      wt.textContent = now; done.push([t, now])
    }
    return done
  })
}
async function readAll(w, cases, where) {
  let lines = await openBell(w)
  if (SWAP) {
    const done = await swapEvery(w.page); log('swap', `${where}: ` + JSON.stringify(done))
    lines = await w.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map((l, i) => {
      const t = s => (l.querySelector(s)?.textContent || '').replace(/\s+/g, ' ').trim()
      return { i, name: t('.bl-name'), day: t('.bl-day'), what: t('.bl-what'), ago: t('.bl-ago') }
    }))
  }
  out.bell ||= {}; out.bell[where] = lines.map(l => `${l.name} ${l.day} / ${l.what}`)
  log('bell', `${where}: ` + JSON.stringify(out.bell[where]))
  for (const [c, , , , name, d] of cases) {
    const L0 = lines.find(l => l.name === name && l.day === d && !/You were added/.test(l.what))
    if (!L0) { log(c, `${where}: NO LINE named ${name} ${d}`); (out.cases[c] ||= {})[where] = { missing: true }; continue }
    await rowShot(w, c, `${TAG}-${c}-${where}`, L0, where)
  }
  const bid = lines.find(l => /replaces your/.test(l.what))
  if (bid) await rowShot(w, 'c5', `${TAG}-c5-${where}`, bid, where)
  else if (WORLD === 'A') log('c5', `${where}: NO "replaces your … bid" line`)
  /* the whole list, with the worst case in the middle — the context picture */
  const worst = lines.find(l => l.name === 'Range course' && !/You were added/.test(l.what))
  if (worst) {
    await w.page.evaluate(i => document.querySelector(`[data-w4="${i}"]`)?.scrollIntoView({ block: 'center' }), worst.i); await sleep(250)
    await L.shot(w.page, 'list', `${TAG}-list-${where}`, await L.bellClip(w.page), out.bell[where], w.size)
  }
  await w.page.keyboard.press('Escape').catch(() => {})
}

/* the Leave War bid of case 5 (walker b's B5 route): Saber opens December; Ranger bids LL on Fri 11 Dec */
const BID = '2026-12-11', BIDFROM = '2026-12-09'
async function toWar(w) {
  await go(w.page, 'leavewar'); await w.page.waitForSelector(q('month-strip'), { timeout: 10000 })
  await w.page.selectOption(q('war-picker'), 'y2026').catch(e => log('c5', 'war-picker: ' + String(e.message).split('\n')[0])); await sleep(900)
  await w.page.locator(q('month-DEC')).click(); await sleep(900)
}
async function bidSetup(w) {
  await toWar(w)
  await w.page.locator(q('open-chip')).click(); await sleep(500)
  const om = w.page.locator('[data-testid^="od-month-"]', { hasText: /DEC/i }).first()
  if (await om.count()) { await om.click(); await sleep(400) }
  await w.page.locator(q('open-dates-close')).click().catch(() => {}); await sleep(400)
  w = await handOver(w, 'desk', 'us')
  await toWar(w)
  await w.page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), `[data-testid="cell-${RANGER}-${BID}"]`); await sleep(300)
  await w.page.locator(`[data-testid="cell-${RANGER}-${BID}"]`).click(); await sleep(700)
  const ll = w.page.locator(`${q('bid-leave-grid')} [data-testid$="-LL"]`).first()
  if (!(await ll.count())) { log('c5', 'NO LL button in the bid window'); return w }
  await ll.click(); await sleep(700)
  const save = w.page.locator(`${q('bid-picker')} button`, { hasText: /^(Save|Bid|Done|File)/ }).first()
  if (await save.count() && await save.isVisible().catch(() => false)) { await save.click(); await sleep(600) }
  await w.page.keyboard.press('Escape'); await sleep(400)
  log('c5', 'Ranger bid LL on ' + BID)
  return handOver(w, 'desk', 'ad')
}

try {
  let w = await newPage('desk'); await signIn(w, 'ad')
  out.bundle = await bundleOf(w.page); log('setup', `${TAG} world ${WORLD} — bundle ${out.bundle} from ${NEW_DIR}`)
  if (WORLD === 'A') {
    w = await bidSetup(w)
    const made = {}
    for (const [c, iso, spec] of A_CASES) {
      if (c === 'c4') {
        /* filed with Ranger, Hex and Ace, the long title; Hex and Ace are taken off in the one save ('stiff' is Saber
           himself — taking the one who saves off would name him twice) */
        out.people.c4off = [{ id: 'dj', cs: 'Ace' }]
        made.c4 = await fileInput(w, c, iso, T({ people: [RANGER, HEX, 'dj'], title: LONG }))
      } else made[c] = await fileInput(w, c, iso, spec)
    }
    made.c5 = await fileInput(w, 'c5', BIDFROM, { type: 'OL', span: 'all', people: [RANGER], remarks: 'Bring your kit' })
    for (const [c, iso, , edit] of A_CASES) {
      if (!made[c]) { log(c, 'NOT FILED'); continue }
      const b = await recOf(w.page, made[c]); const r = await editInput(w, c, made[c], iso, () => edit(w)); const a = await recOf(w.page, made[c])
      out.cases[c] = { before: b, after: a, asked: r.asked, note: r.said }
    }
    if (made.c5) {
      const b = await recOf(w.page, made.c5)
      const r = await editInput(w, 'c5', made.c5, BIDFROM, async () => { await toDay(w, BID); await kind(w, 'PL'); await sleep(300); await rmk(w, 'Bring water') })
      out.cases.c5 = { before: b, after: await recOf(w.page, made.c5), asked: r.asked, note: r.said }
    }
    log('setup', 'people: ' + JSON.stringify(out.people))
  } else {
    const made = {}
    for (const [c, iso, spec] of B_CASES) made[c] = await fileInput(w, c, iso, spec)
    /* the Attach's "To", given in a save of Saber's own before the change Ranger is told of (that first save's line is
       "Renamed — was Exercise Kite" too; the line pictured is the second) */
    if (made.u6) await editInput(w, 'u6', made.u6, '2026-08-11', () => w.page.fill('#inpEditPop #inpEditTo', '145 Sqn'))
    for (const [c, iso, , edits] of B_CASES) {
      if (!made[c]) { log(c, 'NOT FILED'); continue }
      const b = await recOf(w.page, made[c]); let at = iso
      for (const e of edits) { await editInput(w, c, made[c], at, () => e(w)); const r = await recOf(w.page, made[c]); at = r && r.date ? at : at }
      out.cases[c] = { before: b, after: await recOf(w.page, made[c]) }
    }
  }
  const cases = WORLD === 'A' ? A_CASES : B_CASES
  w = await handOver(w, 'phone', 'us'); await readAll(w, cases, 'phone')
  const state = await w.ctx.storageState({ indexedDB: true })
  w = await handOver(w, 'desk', 'us'); await readAll(w, cases, 'desk')
  await w.ctx.close()
  try {
    const wk = await newPage('phone', state, NEW_DIR, 'webkit'); await signIn(wk, 'us')
    await readAll(wk, cases, 'wk'); await wk.ctx.close()
  } catch (e) { facts.errors.push('webkit: ' + String(e && e.message || e).slice(0, 300)); log('wk', 'ERROR ' + String(e && e.message || e).split('\n')[0]) }
} catch (e) { facts.errors.push(`${TAG}-${WORLD}: ` + String(e && e.stack || e).slice(0, 600)); log('run', 'ERROR ' + String(e && e.message || e).split('\n')[0]) }
writeFileSync(join(OUT, 'bec.json'), JSON.stringify(out, null, 1))
console.log('\npictures:', facts.pictures.length, '· errors:', facts.errors.length)
for (const e of facts.errors.slice(0, 20)) console.log('  ' + e)
await L.finish()
