// Walker r1 — the RE-WALK of SANS from its date (D2313), 22 Nov 26, chat 140: R1 (Medical "as of" cards, desktop + phone),
// R2 (Edit Schedule's next-week preview follows a tick at once, desktop), R3 (a published next-week day keeps each man as
// published on View-only Sched, desktop). Helpers from sfd-w1-lib.mjs (copied from the passing recipes).
// Run from raptor-port/:  ONLY=r1d,r1p,r2d,r3d RUN=run1 node scripts/handpass/sfd-r1.mjs
import './sfd-r1-env.mjs'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
const L = await import('./sfd-w1-lib.mjs')
const { SIZES, results, log, sleep, J, mk, world, signIn, signOut, go, today, weekOf, B, hideToast, openBoard, closeBoard, boardStep, groundRowWith, qualsTick, OUT, URL_ } = L

const VERSION = 'sfd-r1 v3'
const ONLY = (process.env.ONLY || 'r1d,r1p,r2d,r3d').split(',')
log(VERSION, URL_, OUT, ONLY.join(','))
const HEX = 'rocky'

async function toDemoWeek(p, W) {
  await go(p, 'editsched')
  if ((await weekOf(p)).startsWith('Jul 13')) return 'already'
  await openBoard(p, W, 0); const r = await boardStep(p, W, -1); await closeBoard(p, W)
  return r.week
}
async function toNextWeek(p, W) {
  await go(p, 'editsched')
  if ((await weekOf(p)).startsWith('Jul 20')) return 'already'
  await openBoard(p, W, 6); const r = await boardStep(p, W, 1); await closeBoard(p, W)
  return r.week
}

/* ================= R1 — the Medical page's "as of" cards ================= */
async function r1(k) {
  const sz = SIZES[k], W = mk('r1', sz)
  const { b, p } = await world(sz, W, '2026-07-20T09:00:00')
  try {
    await signIn(p, 'ad', 'a')
    W.rec('premise', 'clock and man', null, `today ${await today(p)} · ${J(await p.evaluate(id => { const q = window.PEOPLE[id]; return { cs: q.cs, seat: q.seat, san: !!q.san, sanFrom: q.sanFrom || null } }, HEX))}`)
    await go(p, 'inputs')
    await W.press(p, '#inMedBtn', 'med-tab')
    await p.waitForSelector('#medView', { state: 'visible' })
    const had = await p.evaluate(() => window.INPUTS.map(r => String(r.iid)))
    await W.press(p, '#medNew', 'plus-medical')
    const win = p.locator('[data-testid="win-inputedit"]')
    await win.waitFor({ state: 'visible' })
    const type = await win.locator('#inpEditType').inputValue()
    const personTag = await p.locator('#inpEditPerson').evaluate(e => e.tagName).catch(() => 'none')
    if (personTag === 'SELECT') await p.selectOption('#inpEditPerson', HEX)
    else W.rec('r1-00', 'person box is not a select', null, personTag)
    /* the window's own calendar: 16 Jul then 24 Jul */
    for (let i = 0; i < 6 && !(await p.locator('#inpEdCal [data-iso="2026-07-16"]').count()); i++) {
      const t = (await p.locator('#inpEdCal .dcal-title').first().textContent()) || ''
      await W.press(p, p.locator(`#inpEdCal button[aria-label="${/Aug|Sep|Oct|Nov|Dec/.test(t) ? 'Previous' : 'Next'} month"]`).first(), 'cal-month')
    }
    await W.press(p, p.locator('#inpEdCal [data-iso="2026-07-16"]').first(), 'cal-16')
    await sleep(600)
    await W.press(p, p.locator('#inpEdCal [data-iso="2026-07-24"]').first(), 'cal-24')
    await win.locator('.docfield input[type=file]').first().setInputFiles([{ name: 'cert.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.1 %%EOF') }]).catch(e => W.rec('r1-00b', 'document field', null, String(e.message).slice(0, 120)))
    const winPic = await W.pic(p, '01-window')
    await W.press(p, '#inpEditSave', 'save')
    await win.waitFor({ state: 'detached', timeout: 4000 }).catch(() => {})
    const made = await p.evaluate(had => window.INPUTS.filter(r => !had.includes(String(r.iid))).map(r => ({ iid: String(r.iid), type: r.type, date: r.date, endDate: r.endDate, people: r.people || r.person })), had)
    W.rec('r1-01', `+ Medical: ${type} for Hex 16–24 Jul filed through the window`, made.length === 1 && /ATT C/.test(made[0].type) && J(made[0].people).includes(HEX), J(made), winPic + ', ' + await W.pic(p, '01b-saved'))
    if (made.length !== 1) throw new Error('filing did not land')
    const iid = made[0].iid
    /* Quals hand tick */
    const t = await qualsTick(p, W, HEX, '02')
    W.rec('r1-02', `Quals ✎ Edit: Hex's SANS ticked (today ${await today(p)})`, t.st.san === true, J(t.st), t.pic)
    /* back to the Medical tab */
    await go(p, 'inputs')
    if (!(await p.locator('#medView:visible').count())) await W.press(p, '#inMedBtn', 'med-tab2')
    await p.waitForSelector('#medView', { state: 'visible' })
    const card = () => p.locator(`.medcard[data-medcard="${iid}"]`).first()
    const readCard = async () => p.evaluate(iid => {
      const c = document.querySelector(`.medcard[data-medcard="${iid}"]`); if (!c) return { card: 'NO CARD' }
      const pk = c.querySelector('.puck')
      const sec = (c.closest('.medsec') || {}).className || ''
      return { sec, san: pk ? pk.classList.contains('san') : null, title: pk ? pk.getAttribute('title') : null, text: c.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) }
    }, iid)
    const asOfBtn = async () => ((await p.locator('#medCalBtn').textContent()) || '').trim()
    async function pickDay(iso) {
      await W.press(p, '#medCalBtn', 'asof-btn')
      for (let i = 0; i < 6 && !(await p.locator(`[data-medday="${iso}"]:visible`).count()); i++) await W.press(p, '#medCalPrev', 'cal-prev')
      await W.press(p, `[data-medday="${iso}"]:visible`, 'day-' + iso.slice(8)); await sleep(300)
    }
    async function atDate(tag, label, want) {
      await card().evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {}); await sleep(250)
      const c0 = await readCard(), btn = await asOfBtn()
      const pic0 = await W.pic(p, `${tag}-card`)
      W.rec(`r1-${tag}`, `as of ${label} (button "${btn}"): Hex's card puck ${want ? 'HAS' : 'has NO'} purple line`, c0.san === want, J(c0), pic0)
      /* the card's document viewer, opened and closed */
      await W.press(p, card(), 'card')
      const shown = await p.locator('#docViewPop').evaluate(e => !e.hidden).catch(() => false)
      const picV = await W.pic(p, `${tag}-viewer`)
      await W.press(p, '#docViewClose:visible', 'viewer-close'); await sleep(300)
      await card().evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {}); await sleep(250)
      const c1 = await readCard(), btn1 = await asOfBtn()
      W.rec(`r1-${tag}v`, `as of ${label}: viewer opened (${shown}) and closed — puck unchanged after`, shown && c1.san === c0.san && btn1 === btn, `after ${J(c1)} · button "${btn1}"`, picV + ', ' + await W.pic(p, `${tag}-after-viewer`))
    }
    await pickDay('2026-07-18'); await atDate('03-18jul', '18 Jul', false)
    await pickDay('2026-07-20'); await atDate('04-20jul', '20 Jul', true)
    await pickDay('2026-07-18'); W.rec('r1-05a', 'picked 18 Jul again before Today', null, `button "${await asOfBtn()}" · ${J(await readCard())}`)
    if (await p.locator('#medToday:visible').count()) {
      await W.press(p, '#medToday:visible', 'today'); await sleep(300)
      const appToday = await p.evaluate(() => ({ TODAY: window.TODAY, clock: new Date().toDateString() }))
      const c = await readCard()
      if (c.card === 'NO CARD') W.rec('r1-05-today', 'Today pressed: RECORD what the button reads and where his card is', null, `button "${await asOfBtn()}" · app ${J(appToday)} · ${J(c)}`, await W.pic(p, '05-today-page'))
      else await atDate('05-today', 'Today', true)
    }
    else W.rec('r1-05', 'Today', null, 'NOT WALKED: no Today button shown', await W.pic(p, '05-no-today'))
  } catch (e) {
    W.rec('r1-ERR', 'script stopped', false, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
}

/* the next-week preview (peek) on a week page: its days and Hex's pucks in each */
const readPeek = (p, root) => p.evaluate(([root, id]) => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  /* the preview's pucks carry no data-person (probe, 22 Nov 26): a man's puck is the .puck whose .nm reads his callsign */
  const cs = window.PEOPLE[id].cs
  return [...document.querySelectorAll(`${root} section.day.peek[data-peek-day="0"]`)].map(d => ({
    head: ((d.querySelector('.day-head') || d).innerText || '').replace(/\s+/g, ' ').slice(0, 50),
    pucks: [...d.querySelectorAll('.puck')].filter(e => ((e.querySelector('.nm') || {}).textContent || '').trim() === cs).map(e => ({ san: e.classList.contains('san'), cls: e.className, title: e.getAttribute('title') || '', shown: vis(e), where: ((e.closest('.sec, [class*="sec-"], .wave') || {}).className || '').slice(0, 30) })),
  }))
}, [root, HEX])
async function peekPic(p, W, root, tag) {
  const pk = p.locator(`${root} section.day.peek[data-peek-day="0"]`).first()
  if (await pk.count()) {
    await pk.evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })); await sleep(400)
    /* the row Hex was put on (W1 GROUND) brought into view, else his first puck */
    const row = pk.locator('text=W1 GROUND').first()
    const one = (await row.count()) ? row : pk.locator('.puck', { has: p.locator('.nm', { hasText: /^Hex$/ }) }).first()
    if (await one.count()) { await one.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(300) }
  }
  return W.pic(p, tag)
}
const sanOf = r => { const m = r[0]; return m ? m.pucks.map(x => x.san) : [] }

/* ================= R2 — the next-week preview follows a tick at once ================= */
async function r2(k) {
  const sz = SIZES[k], W = mk('r2', sz)
  const { b, p } = await world(sz, W, '2026-07-15T09:00:00')
  try {
    await signIn(p, 'ad', 'a')
    W.rec('premise', 'clock', null, `today ${await today(p)} · week ${(await weekOf(p)).slice(0, 6)}`)
    const nw = await toNextWeek(p, W)
    await openBoard(p, W, 0)
    const g = await groundRowWith(p, W, 0, HEX)
    W.rec('r2-01', `next week (${nw.slice(0, 6)}): Hex on a new Ground Programme row on Mon 20 Jul`, g.row && g.row.who === HEX, J(g), await W.pic(p, '01-ground-mon20'))
    await closeBoard(p, W)
    const bw = await toDemoWeek(p, W)
    await go(p, 'editsched')
    let pv = await readPeek(p, '#eWeek')
    W.rec('r2-02', `back on the demo week (${bw.slice(0, 6)}); the preview's Monday shows Hex with NO purple line`, sanOf(pv).length > 0 && sanOf(pv).every(s => !s), J(pv), await peekPic(p, W, '#eWeek', '02-peek-before'))
    const t = await qualsTick(p, W, HEX, '03')
    W.rec('r2-03', 'Quals: Hex SANS ticked', t.st.san === true, J(t.st), t.pic)
    await go(p, 'editsched')
    pv = await readPeek(p, '#eWeek')
    W.rec('r2-04', 'Edit Schedule (no reload, no visit to next week): preview Monday shows Hex WITH the purple line', sanOf(pv).length > 0 && sanOf(pv).every(s => s), J(pv), await peekPic(p, W, '#eWeek', '04-peek-ticked'))
    const u = await qualsTick(p, W, HEX, '05')
    W.rec('r2-05', 'Quals: Hex SANS unticked', u.st.san === false, J(u.st), u.pic)
    await go(p, 'editsched')
    pv = await readPeek(p, '#eWeek')
    W.rec('r2-06', 'preview Monday: the purple line gone at once', sanOf(pv).length > 0 && sanOf(pv).every(s => !s), J(pv), await peekPic(p, W, '#eWeek', '06-peek-unticked'))
    await W.press(p, '#undoBtn:visible', 'undo'); await sleep(700)
    await go(p, 'editsched')
    pv = await readPeek(p, '#eWeek')
    const st1 = await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null } }, HEX)
    W.rec('r2-07', 'top bar Undo (takes back the untick): RECORD the preview', null, `${J(st1)} · ${J(pv)}`, await peekPic(p, W, '#eWeek', '07-peek-undo'))
    await W.press(p, '#redoBtn:visible', 'redo'); await sleep(700)
    await go(p, 'editsched')
    pv = await readPeek(p, '#eWeek')
    const st2 = await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null } }, HEX)
    W.rec('r2-08', 'top bar Redo: RECORD the preview', null, `${J(st2)} · ${J(pv)}`, await peekPic(p, W, '#eWeek', '08-peek-redo'))
  } catch (e) {
    W.rec('r2-ERR', 'script stopped', false, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
}

/* sign-offs and publish (copied from sfd-w2.mjs) */
async function signAll(p) {
  const roles = ['cur', 'sked', 'plan', 'appr'], nth = [0, 0, 1, 2]
  for (let i = 0; i < 4; i++) {
    const sel = p.locator(`#schedBoard .sb-sign select[data-sign="${roles[i]}"]:visible`).first()
    await sel.scrollIntoViewIfNeeded().catch(() => {})
    const v = await sel.locator('option').evaluateAll((os, n) => os.map(o => o.value).filter(Boolean)[n], nth[i])
    await sel.selectOption(v); await sleep(300)
    const later = p.locator('[data-testid="win-oilday"] [data-testid="odl-later"]')
    if (await later.count() && await later.first().isVisible()) { await later.first().click(); await sleep(300) }
  }
}
async function publish(p, W, di) {
  let l = null
  for (const s of [`[data-alpub="${di}"]`, `[data-beak="${di}"]`]) { const x = p.locator(B(s)).first(); if (await x.count()) { l = x; break } }
  if (!l) return { label: 'NO PUBLISH BUTTON' }
  const label = (await l.innerText()).trim()
  await W.press(p, l, 'publish'); await sleep(900)
  return { label, toast: await p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.textContent : null }) }
}
const boardState = p => p.evaluate(() => {
  const vis = e => e.getBoundingClientRect().width > 0
  const root = document.querySelector('#schedBoard'); if (!root) return 'no board'
  const pend = [...root.querySelectorAll('*')].filter(e => vis(e) && /^\d+\s*pending/i.test((e.innerText || '').trim()) && (e.innerText || '').trim().length < 20).map(e => e.innerText.trim())
  const txt = (root.innerText || '').replace(/\s+/g, ' ')
  const k = txt.toUpperCase().indexOf('SIGNED ')
  return { pend: pend[pend.length - 1] || '0', notSigned: /Not yet signed/i.test(txt), signed: k >= 0 ? txt.slice(k, k + 60) : '', approved: window.dayApproved ? window.dayApproved(window.SBDAY) : 'n/a' }
})
const dayPucks = (p, root, di) => p.evaluate(([root, di, id]) => {
  const d = document.querySelector(`${root} section.day[data-day="${di}"]:not(.peek)`); if (!d) return 'no day'
  return { head: ((d.querySelector('.day-head') || d).innerText || '').replace(/\s+/g, ' ').slice(0, 40), pucks: [...d.querySelectorAll(`.puck[data-person="${id}"]`)].map(e => ({ san: e.classList.contains('san'), title: e.getAttribute('title') || '' })) }
}, [root, di, HEX])

/* ================= R3 — a published next-week day keeps each man as published on View-only Sched ================= */
async function r3(k) {
  const sz = SIZES[k], W = mk('r3', sz)
  const { b, p } = await world(sz, W, '2026-07-15T09:00:00')
  try {
    await signIn(p, 'ad', 'a')
    W.rec('premise', 'clock', null, `today ${await today(p)}`)
    await toNextWeek(p, W)
    await openBoard(p, W, 0)
    const g = await groundRowWith(p, W, 0, HEX)
    W.rec('r3-01', 'Mon 20 Jul: Hex on a new Ground Programme row', g.row && g.row.who === HEX, J(g), await W.pic(p, '01-ground-mon20'))
    await signAll(p); const pb = await publish(p, W, 0); await hideToast(p)
    const st0 = await boardState(p)
    W.rec('r3-02', `Mon 20 Jul: four sign-off boxes and ${pb.label}`, st0.approved === true && st0.pend === '0', `${J(st0)} · toast "${pb.toast}"`, await W.pic(p, '02-published'))
    await closeBoard(p, W)
    const bw = await toDemoWeek(p, W)
    const t = await qualsTick(p, W, HEX, '03')
    W.rec('r3-03', `back on the demo week (${bw.slice(0, 6)}); Quals: Hex SANS ticked`, t.st.san === true, J(t.st), t.pic)
    await go(p, 'viewsched')
    let pv = await readPeek(p, '#vWeek')
    W.rec('r3-04', 'View-only Sched (admin): preview Monday 20 Jul — Hex with NO purple line (as published)', sanOf(pv).length > 0 && sanOf(pv).every(s => !s), J(pv), await peekPic(p, W, '#vWeek', '04-view-peek-admin'))
    await go(p, 'editsched')
    pv = await readPeek(p, '#eWeek')
    W.rec('r3-05', 'Edit Schedule (admin): preview Monday — Hex WITH the purple line (working copy)', sanOf(pv).length > 0 && sanOf(pv).every(s => s), J(pv), await peekPic(p, W, '#eWeek', '05-edit-peek-admin'))
    await signOut(p, W); await signIn(p, 'us', 'us')
    await go(p, 'viewsched')
    pv = await readPeek(p, '#vWeek')
    W.rec('r3-06', 'as Ranger, View-only Sched: preview Monday — Hex with NO purple line', sanOf(pv).length > 0 && sanOf(pv).every(s => !s), `week ${(await weekOf(p)).slice(0, 6)} · ${J(pv)}`, await peekPic(p, W, '#vWeek', '06-view-peek-ranger'))
    await signOut(p, W); await signIn(p, 'ad', 'a')
    /* load next week */
    await toNextWeek(p, W)
    await go(p, 'editsched')
    await p.locator('#eWeek section.day[data-day="0"]').first().evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })).catch(() => {}); await sleep(400)
    const chip = ((await p.locator('#eWeek [data-pendlist="0"]').first().innerText().catch(() => 'NO PENDING CHIP')) || '').replace(/\s+/g, ' ').trim()
    const ep = await dayPucks(p, '#eWeek', 0)
    W.rec('r3-07', `next week loaded (${(await weekOf(p)).slice(0, 6)}): Edit Schedule Mon 20 Jul reads "1 pending"`, /^1\s*pending/i.test(chip), `chip "${chip}" · ${J(ep)}`, await W.pic(p, '07-edit-mon20'))
    await openBoard(p, W, 0)
    const st1 = await boardState(p)
    W.rec('r3-07b', 'the board, Mon 20 Jul (record)', null, J(st1), await W.pic(p, '07b-board-mon20'))
    await closeBoard(p, W)
    await go(p, 'viewsched')
    if ((await weekOf(p)).startsWith('Jul 13')) await W.press(p, '#weekSeg [data-wk="20/07/2026"]:visible', 'wk20')
    await p.locator('#vWeek section.day[data-day="0"]').first().evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })).catch(() => {}); await sleep(400)
    const vp = await dayPucks(p, '#vWeek', 0)
    const one = p.locator(`#vWeek section.day[data-day="0"] .puck[data-person="${HEX}"]`).first()
    if (await one.count()) { await one.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(300) }
    W.rec('r3-08', `View-only Sched's own Mon 20 Jul (week ${(await weekOf(p)).slice(0, 6)}): Hex with NO purple line`, vp.pucks && vp.pucks.length > 0 && vp.pucks.every(x => !x.san), J(vp), await W.pic(p, '08-view-mon20'))
  } catch (e) {
    W.rec('r3-ERR', 'script stopped', false, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
}

for (const k of ONLY) {
  if (k === 'r1d') await r1('d')
  if (k === 'r1p') await r1('p')
  if (k === 'r2d') await r2('d')
  if (k === 'r3d') await r3('d')
}
writeFileSync(path.join(OUT, `results-${ONLY.join('_')}.json`), JSON.stringify(results, null, 1))
log('done')
