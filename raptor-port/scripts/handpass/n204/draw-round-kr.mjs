// draw-round-kr - one round of cards for the owner (chat 204, 27 Nov 26; brief
// docs/superpowers/briefs/2026-11-27-msq-s1-round-q32-37-draw-brief.md): KR's four questions (the plan
// docs/superpowers/plans/2026-11-27-msq-s1-kr-no-blocks-plan.md §12). Cards 30 and 31 are draw-q30-31.mjs's, run beside this.
// The BUILT app in dist, served at 4741; nothing here writes the app's code. Every state is the app's own, reached by real
// presses, except where a caption says otherwise:
//   - NO SCREEN SAVES A MOVE OF SQUADRON (the posting sheet is not built): KR-Q2's move of Saber 142 -> 149 is written as SETUP
//     into the browser's saved data, as the walk libraries and draw-q25 do it;
//   - KR-Q1's "Not saved": the browser's own storage is filled by this script (a page of junk written until the browser
//     refuses more), so the app's next save fails as it fails on a full store; the save that fails is "Mark all read" on the
//     bell (never an Undo step). The app's own ?savefail switch cannot be used: it refuses every save from the start, and
//     the Redo needs two saves first.
// The one help elsewhere: the grey note's fade is held (its opacity only) so it can be pictured.
// Each picture at a desktop's 1536x864 (Chromium) and a phone's 390x844 (WebKit, touch), both at 2x, the teal ring.
//   q1   Saber: 149 -> Inputs -> "+ Input" for Osprey, saved; 142; Undo (149 comes back, the input gone); 142 again; the store
//        filled; the bell -> Mark all read -> "Not saved"; Redo pressed (today: nothing, nothing said); then 149 picked (the
//        Retry note the card's answer A would copy).
//   q2   Saber, his move 142 -> 149 written for Thu 16 Jul; Wed 23:40, 142's Inputs -> "+ Input", remarks typed; midnight: the
//        window held; 142 picked (today: the note); proposed: the band's Close, then 142 picked.
//   q3   Saber on 142: Inputs -> its calendar settings -> Calendar... -> Holidays, a year with no leave period, "+ Add", a
//        name, a day, Save (kept waiting); 149 picked (today: the note); proposed: the Calendar's X, the settings' Cancel,
//        then 149 picked.
//   q4   Saber on 142's Edit Schedule: Monday's plan menu -> "+ Alt Plan"; its pencil; "Wet weather" typed in Plan name, the
//        box not left; 149 picked (today: the note); proposed: the box left, the window's X, 149 picked; then 142 picked
//        back and the plan menu opened: the name kept on 142.
//   node raptor-port/scripts/handpass/n204/draw-round-kr.mjs        (ONLY=q1,q2,q3,q4  SZ=d,p)
import { mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { FACT, wait, vis, boxOf, barSq, words, curPage, tring, untring, toastNow } from './q2425-lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../..')
const { chromium, webkit } = createRequire(resolve(ROOT, 'package.json'))('playwright')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const URL_ = 'http://localhost:4741/'
const MOCK = resolve(ROOT, 'docs/mock/2026-11-26-msq-questions/round-kr')
const OUT = { q1: resolve(MOCK, 'kr-q1'), q2: resolve(MOCK, 'kr-q2'), q3: resolve(MOCK, 'kr-q3'), q4: resolve(MOCK, 'kr-q4') }
for (const d of Object.values(OUT)) mkdirSync(d, { recursive: true })
const TMP = resolve(ROOT, '.tmp/n204-round-kr'); mkdirSync(TMP, { recursive: true })
const SIZES = { d: { desk: true, w: 1536, h: 864, eng: 'chromium' }, p: { desk: false, w: 390, h: 844, eng: 'webkit' } }
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const SZS = (process.env.SZ || 'd,p').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
const T = s => new Date(/[zZ]|[+-]\d\d:\d\d$/.test(s) ? s : s + '+08:00')
const EVE = '2026-07-15T23:40:00', PAST = '2026-07-16T00:00:05', MOVE_DAY = '2026-07-16'
console.log('draw-round-kr v1 (27 Nov 26)')

const browsers = {}
async function mk(sz, clock = null) {
  const S = SIZES[sz]
  if (!browsers[S.eng]) browsers[S.eng] = await (S.eng === 'webkit' ? webkit.launch() : chromium.launch(LAUNCH))
  const opts = S.desk ? { viewport: { width: S.w, height: S.h }, deviceScaleFactor: 2 }
    : { viewport: { width: S.w, height: S.h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  const ctx = await browsers[S.eng].newContext({ ...opts, timezoneId: 'Asia/Singapore' })
  if (clock) await ctx.clock.install({ time: T(clock) })
  const page = await ctx.newPage()
  const s = { ctx, page, sz, desk: S.desk, W: S.w, H: S.h, errs: [] }
  page.on('pageerror', e => { const m = `PAGEERROR [${sz}] ${String(e).slice(0, 200)}`; console.log(m); s.errs.push(m) })
  page.on('console', m => { if (m.type() === 'error') { const t = `CONSOLE [${sz}] ${m.text().slice(0, 200)}`; console.log(t); s.errs.push(t) } })
  page.on('response', r => { if (r.status() >= 400) { const t = `HTTP${r.status()} [${sz}] ${r.url().slice(0, 120)}`; console.log(t); s.errs.push(t) } })
  page.on('dialog', d => { console.log(`DIALOG ${d.type()}: ${d.message()}`); (d.type() === 'beforeunload' ? d.accept() : d.dismiss()).catch(() => {}) })
  return s
}
async function closeAll() { for (const k of Object.keys(browsers)) { await browsers[k].close().catch(() => {}); delete browsers[k] } }
async function run(key, sz, fn, clock = null) {
  const s = await mk(sz, clock)
  try { await fn(s) } catch (e) { FACT(`${key}.error`, String(e).split('\n')[0].slice(0, 300)); process.exitCode = 1; await s.page.screenshot({ path: `${TMP}/${key}-error.png` }).catch(() => {}) } finally { FACT(`${key}.errs`, s.errs); await s.ctx.close().catch(() => {}) }
}
async function signIn(s, u, p) {
  const { page } = s
  if (!(await page.locator('#luser').count())) await page.goto(URL_)
  await page.waitForSelector('#luser', { timeout: 20000 })
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 })
  await page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' })
  await page.waitForTimeout(700)
}
async function hit(s, l, ms = 400) {
  l = typeof l === 'string' ? vis(s, l).first() : l
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 })
  await s.page.waitForTimeout(ms)
}
async function shut(s) {
  for (let i = 0; i < 3; i++) {
    const open = await s.page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open'))
    if (!open) return
    await s.page.touchscreen.tap(s.W - 8, Math.min(500, s.H - 20)); await s.page.waitForTimeout(400)
  }
}
async function go(s, name) {
  const tab = vis(s, `#topnav a[data-page="${name}"]`)
  if (await tab.count()) { await hit(s, tab.first(), 700); return }
  await hit(s, '#burger', 400)
  await hit(s, `#drawerNav a[data-page="${name}"]`, 700)
  await shut(s)
}
/* the squadron picked as a person picks it: the top bar's menu on a desktop; ☰ and its squadron list on a phone */
async function pickAs(s, num, k, { keepMenu = false } = {}) {
  if (s.desk) {
    await hit(s, '#sqnMenuBtn', 450)
    FACT(`${k}.list`, await words(s, '#sqnMenu .sqm-row'))
    const row = vis(s, '#sqnMenu .sqm-row').filter({ has: s.page.locator('.sqm-num', { hasText: new RegExp('^' + num + '$') }) }).first()
    await hit(s, row, 900)
  } else {
    await hit(s, '#burger', 500)
    if (!(await vis(s, '#drawerSqnList .sqm-row').count()) && await s.page.locator('#drawerSqnBtn').count()) await hit(s, '#drawerSqnBtn', 450)
    FACT(`${k}.list`, await words(s, '#drawerSqnList .sqm-row'))
    const row = vis(s, '#drawerSqnList .sqm-row').filter({ has: s.page.locator('.sqm-num', { hasText: new RegExp('^' + num + '$') }) }).first()
    await hit(s, row, 900)
    if (!keepMenu) await shut(s)
  }
  FACT(`${k}.picked`, { want: num, bar: await barSq(s), page: await curPage(s) })
}
const sqMark = s => boxOf(s, s.desk ? '.topbar .mark' : '.topbar .mark, .drawer-sqn .mark')
const ctlBox = s => boxOf(s, s.desk ? '#sqnMenuBtn' : '#burger')
/* (v2) can the squadron control be pressed at all - on a phone a window that fills the screen lies over the ☰ menu */
async function ctlReachable(s) {
  const b = await ctlBox(s); if (!b) return false
  return s.page.evaluate(([x, y, sel]) => !!document.elementFromPoint(x, y)?.closest(sel), [b.x + b.w / 2, b.y + b.h / 2, s.desk ? '#sqnMenuBtn' : '#burger'])
}
/* the "today" press of a pick: made where the control can be pressed; else the picture says it lies under the window */
async function todayPick(s, num, k) {
  if (!(await ctlReachable(s))) { FACT(`${k}.covered`, 'the squadron control lies under the window - no pick can be pressed'); return false }
  await pickAs(s, num, k, { keepMenu: true })
  if (!s.desk) await shut(s)
  return true
}
/* the grey note's fade held off (opacity only - its words, place and look are the app's), set before the press */
const holdNote = s => s.page.evaluate(() => {
  /* (v4: the hold is set even when the app has drawn no note yet this session - its box is made at the first note) */
  /* (v2: a fade the app runs as an animation is CANCELLED, never finished - finishing a fade-out leaves it at nothing; and
     the hold is re-made every 50 ms, so a fade started between two changes of the note is caught too) */
  /* (v3: the note's own box is looked up afresh each time - the hold on the box first found missed a fade set later) */
  const put = () => { const t = document.querySelector('#toastEl'); if (!t || !t.textContent.trim()) return; t.getAnimations?.().forEach(a => a.cancel()); if (t.style.opacity !== '1') t.style.opacity = '1' }
  window.__krhold?.disconnect(); clearInterval(window.__krtick)
  window.__krhold = new MutationObserver(put); window.__krhold.observe(document.body, { attributes: true, attributeFilter: ['style'], subtree: true })
  window.__krtick = setInterval(put, 50)
  return true
})
const dropHold = s => s.page.evaluate(() => { window.__krhold?.disconnect(); clearInterval(window.__krtick) })
const noteNow = s => s.page.evaluate(() => {
  const t = document.querySelector('#toastEl'); if (!t) return null
  const b = t.getBoundingClientRect(), c = getComputedStyle(t)
  return { words: t.textContent.replace(/\s+/g, ' ').trim(), opacity: c.opacity, shown: b.width > 1 && c.display !== 'none' && c.visibility !== 'hidden' && c.opacity !== '0' && !!t.textContent.trim(), box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } }
})
const clearNote = s => s.page.evaluate(() => { const t = document.querySelector('#toastEl'); if (t) { t.textContent = ''; t.style.opacity = '0' } })
async function sshot(s, q, name, rects, pad = 14) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT[q]}/${name}.png` })
  rects = (rects || []).filter(Boolean)
  if (rects.length) {
    const L = Math.min(...rects.map(r => r.x)), Tp = Math.min(...rects.map(r => r.y)), R = Math.max(...rects.map(r => r.x + r.w)), B = Math.max(...rects.map(r => r.y + r.h))
    const x = Math.max(0, L - pad), y = Math.max(0, Tp - pad)
    const clip = { x, y, width: Math.max(20, Math.min(s.W, R + pad) - x), height: Math.max(20, Math.min(s.H, B + pad) - y) }
    await page.screenshot({ path: `${OUT[q]}/${name}-crop.png`, clip })
    FACT(`${name}.crop`, clip)
  }
  console.log('  picture ' + q + '/' + name + '.png' + (rects.length ? ' + -crop' : ''))
}
const bandNow = s => s.page.evaluate(() => {
  const b = [...document.querySelectorAll('.savestat')].find(e => e.getBoundingClientRect().width > 1)
  return b ? { cls: b.className, words: b.innerText.replace(/\s+/g, ' ').trim() } : null
})
async function clockTo(s, iso) {
  const now = await s.page.evaluate(() => Date.now())
  const ms = T(iso).getTime() - now
  if (ms < 0) throw new Error('clockTo: ' + iso + ' is behind the page clock')
  await s.page.clock.fastForward(ms)
  await s.page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await wait(s, 1500)
  FACT('clock', { to: iso, page: await s.page.evaluate(() => new Date().toString()) })
}
/* SETUP: a move of squadron as the walk libraries write it (no screen saves one) */
const writeHome = (s, m) => s.page.evaluate(m => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('raptor:settings/home:'))
  const has = keys.some(k => { try { return JSON.parse(localStorage.getItem(k)).pid === m.pid } catch { return false } })
  const id = n => 'h' + (Date.now() + n).toString(36) + Math.random().toString(36).slice(2, 6)
  const out = []
  if (!has) { const a = id(0); localStorage.setItem('raptor:settings/home:' + a, JSON.stringify({ id: a, pid: m.pid, unit: m.from, from: '2026-01-01' })); out.push(a) }
  const b = id(1); localStorage.setItem('raptor:settings/home:' + b, JSON.stringify({ id: b, pid: m.pid, unit: m.to, from: m.day })); out.push(b)
  return { hadRow: has, wrote: out }
}, m)
const winNow = s => s.page.evaluate(() => {
  const w = document.querySelector('[data-testid="win-inputedit"]'), r = w?.getBoundingClientRect()
  return { open: !!w && r.width > 0, band: document.querySelector('[data-testid="inped-moveband"]')?.innerText.replace(/\s+/g, ' ').trim() ?? null, remarks: document.querySelector('#inpEditRmk')?.value ?? null }
})
const listRows = s => s.page.evaluate(() => [...document.querySelectorAll('#inBody [data-iid], #inList [data-iid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ iid: e.dataset.iid, words: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 140) })))
async function toList(s) {
  await go(s, 'inputs'); await wait(s, 700)
  if (await vis(s, '#inMemberMode[aria-selected="false"]').count()) await hit(s, '#inMemberMode', 500)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn', 600)
}

/* ============ KR-Q1: three rare presses while a save has failed ============
   (v2) None of the three presses the card names can be reached by a press today (read from the tests, and v1's run): a
   Redo never changes the squadron in view by a button (v1: Saber's Undo of a 149 input from 142 left 142 in view;
   msq-guard-doors-undo.test.tsx: "a belt: no button reaches it"); the OIL list's card that brings another squadron stands
   only over a raw entry (msq-guard-doors-bell.test.tsx B25: "reached by no press since D2403 and D2627 A19"); "Check my
   quals" shows only at home (D2627 A18, C4). So the drawing is the look answer A would copy: the app's own ?savefail test
   switch (D1666), a change of his - an input filed on 142's Inputs - refused, "Not saved"; then 149 picked: the Retry
   note, the app's own words. */
if (want('q1')) for (const sz of SZS) {
  const n = sz === 'd' ? 'desktop' : 'phone'
  await run(`kr-q1-${n}`, sz, async s => {
    const k = `q1.${sz}`, { page } = s
    /* (v3: the ?savefail switch cannot be used - with it on, sign-in itself waits for a save that never lands, "Sign in
       waits until it saves", and a reload loses the sign-in. So he signs in as usual, and the browser's own store is then
       filled by this script - junk written until the browser refuses more - so his next save fails as on a full store) */
    await signIn(s, 'ad', 'a')
    FACT(`${k}.filled`, await page.evaluate(() => {
      let big = 0, small = 0
      const a = 'x'.repeat(256 * 1024), b = 'y'.repeat(2 * 1024)
      try { for (;;) { localStorage.setItem('__kr_fill_' + big, a); big++ } } catch {}
      try { for (;;) { localStorage.setItem('__kr_fills_' + small, b); small++ } } catch {}
      return { big, small }
    }))
    FACT(`${k}.in`, { bar: await barSq(s), page: await curPage(s), band: await bandNow(s) })
    /* a change of his on 142: an input filed for Ranger - refused by the switch */
    await toList(s)
    await hit(s, '#inNew', 900)
    await page.selectOption('#inpEditPerson', 'bane').catch(async () => { const v = await page.evaluate(() => [...document.querySelector('#inpEditPerson').options].map(o => o.value).find(v => v)); await page.selectOption('#inpEditPerson', v) })
    await page.selectOption('#inpEditType', 'Training').catch(() => {})
    await wait(s, 300)
    const day = vis(s, '[data-testid^="inpEdCal-day-2026-07-2"]').first()
    if (await day.count()) await hit(s, day, 400)
    await hit(s, '#inpEditSave', 1500)
    const band = await bandNow(s)
    FACT(`${k}.saved`, { band, window: await winNow(s), toast: await toastNow(s), bar: await barSq(s) })
    if (!band || !/failed/.test(band.cls)) throw new Error('no "Not saved" band')
    if ((await winNow(s)).open) { FACT(`${k}.windowStillOpen`, true); await hit(s, '#inpEditCancel', 600) }
    const bb = await boxOf(s, '.savestat.failed')
    const r0 = await tring(s, bb, 'Not saved')
    await sshot(s, 'q1', `q1-notsaved-${n}`, [r0, await sqMark(s), await ctlBox(s)])
    await untring(s)
    /* the look answer A would copy: 149 picked - the Retry note */
    await clearNote(s); await holdNote(s)
    await pickAs(s, 149, `${k}.pick149`, { keepMenu: true })
    if (!s.desk) await shut(s)
    await wait(s, 400)
    const nt2 = await noteNow(s); FACT(`${k}.pickNote`, { ...nt2, bar: await barSq(s), band: await bandNow(s) })
    const rn = nt2?.shown ? await tring(s, nt2.box, 'the note') : null
    await sshot(s, 'q1', `q1-pick-today-${n}`, [rn, await boxOf(s, '.savestat.failed'), await ctlBox(s), await sqMark(s)])
    await untring(s)
  })
}

/* ============ KR-Q2: a window held since his move at midnight, then his own pick of that window's squadron ============ */
if (want('q2')) for (const sz of SZS) {
  const n = sz === 'd' ? 'desktop' : 'phone'
  await run(`kr-q2-${n}`, sz, async s => {
    const k = `q2.${sz}`, { page } = s
    await page.goto(URL_); await page.waitForSelector('#luser', { timeout: 20000 })
    FACT(`${k}.setup`, await writeHome(s, { pid: 'stiff', from: 'u142', to: 'u149', day: MOVE_DAY }))
    await page.reload(); await page.waitForSelector('#luser', { timeout: 20000 }); await wait(s, 600)
    await signIn(s, 'ad', 'a')
    FACT(`${k}.before`, { bar: await barSq(s), clock: await page.evaluate(() => new Date().toString()) })
    await toList(s)
    await hit(s, '#inNew', 900)
    const rmk = vis(s, '#inpEditRmk').first(); await rmk.click(); await page.keyboard.type('Course brief, 0800')
    await wait(s, 300)
    FACT(`${k}.window`, { ...(await winNow(s)), bar: await barSq(s) })
    await clockTo(s, PAST)
    const w = await winNow(s); FACT(`${k}.held`, { ...w, bar: await barSq(s), page: await curPage(s), toast: await toastNow(s) })
    if (!w.band) throw new Error('the window was not held at midnight')
    const r0 = await tring(s, await boxOf(s, '[data-testid="inped-moveband"]'), 'the band')
    await sshot(s, 'q2', `q2-held-${n}`, [r0, await boxOf(s, '[data-testid="win-inputedit"]'), await sqMark(s)])
    await untring(s)
    /* today: 142 picked */
    await holdNote(s)
    const pressed = await todayPick(s, 142, `${k}.pick142`)
    await wait(s, 400)
    const nt = await noteNow(s)
    FACT(`${k}.today`, { pressed, note: nt, bar: await barSq(s), page: await curPage(s), window: await winNow(s) })
    const rn = nt?.shown ? await tring(s, nt.box, 'the note') : null
    await sshot(s, 'q2', `q2-pick-today-${n}`, [rn, await ctlBox(s), await sqMark(s), await boxOf(s, '[data-testid="inped-moveband"]')])
    await untring(s)
    await dropHold(s); await clearNote(s)
    /* proposed (answer A), by real presses: the band's Close, then 142 picked */
    await hit(s, vis(s, '[data-testid="inped-moveband"] button').first(), 700)
    FACT(`${k}.closed`, await winNow(s))
    await pickAs(s, 142, `${k}.pick142b`)
    await wait(s, 600)
    FACT(`${k}.proposed`, { bar: await barSq(s), page: await curPage(s), window: await winNow(s), note: await noteNow(s) })
    const m = await sqMark(s)
    const rm = m ? await tring(s, m, 'the squadron') : null
    await sshot(s, 'q2', `q2-proposed-${n}`, [rm, await ctlBox(s), s.desk ? { x: 16, y: 0, w: 900, h: 420 } : { x: 0, y: 0, w: s.W, h: 420 }])
    await untring(s)
  }, EVE)
}

/* ============ KR-Q3: a holiday the Calendar is keeping, then a pick ============ */
if (want('q3')) for (const sz of SZS) {
  const n = sz === 'd' ? 'desktop' : 'phone'
  await run(`kr-q3-${n}`, sz, async s => {
    const k = `q3.${sz}`, { page } = s
    await signIn(s, 'ad', 'a')
    await go(s, 'inputs'); await wait(s, 800)
    let gear = vis(s, '[aria-label="Inputs calendar settings"]')
    if (!(await gear.count())) { const cal = vis(s, 'button[aria-pressed]').filter({ hasText: /^Calendar$/ }); if (await cal.count()) await hit(s, cal.first(), 600); gear = vis(s, '[aria-label="Inputs calendar settings"]') }
    await hit(s, gear.first(), 600)
    await hit(s, '[data-testid="iset-days"]', 800)
    /* (v2: on a phone the Calendar shows one tab at a time - Month first; Holidays is pressed) */
    if (!(await vis(s, '[data-testid="hol-year"]').count())) { const tab = vis(s, 'button').filter({ hasText: /^Holidays$/ }); if (await tab.count()) await hit(s, tab.first(), 600) }
    let year = null
    for (let i = 0; i < 8; i++) {
      const no = await page.locator('[data-testid="hol-nocover"]').filter({ visible: true }).first().innerText().catch(() => null)
      const y = await page.locator('[data-testid="hol-year"]').filter({ visible: true }).first().innerText()
      FACT(`${k}.year${i}`, { year: y, nocover: no })
      if (no && /No leave period covers \d{4} yet/.test(no)) { year = +y; break }
      await hit(s, '[data-testid="hol-next"]', 300)
    }
    if (!year) throw new Error('no year without a leave period found')
    await hit(s, '[data-testid="hol-add"]', 600)
    await vis(s, '[data-testid="hol-name"]').first().fill('Founders Day'); await wait(s, 200)
    const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    const calAt = () => page.evaluate(M => { const t = [...document.querySelectorAll('[data-testid="holcal-title"] .dcal-my')].find(e => e.getBoundingClientRect().width > 0) || document.querySelector('[data-testid="holcal-title"] .dcal-my'); const [m, y] = t.textContent.trim().split(/\s+/); return +y * 12 + M.indexOf(m.toLowerCase()) }, MONTHS)
    const target = year * 12 + 2 /* March */
    for (let d = target - await calAt(), i = 0; d !== 0 && i < 60; d = target - await calAt(), i++) await hit(s, `[data-testid="${d > 0 ? 'holcal-next' : 'holcal-prev'}"]`, 80)
    const day = `holcal-day-${year}-03-09`
    await hit(s, `[data-testid="${day}"]`, 250); await hit(s, `[data-testid="${day}"]`, 300)
    await hit(s, '[data-testid="hol-save"]', 800)
    const waiting = await page.locator('[data-testid="hol-waiting"]').filter({ visible: true }).first().innerText().catch(() => null)
    FACT(`${k}.waiting`, { year, waiting })
    if (!waiting) throw new Error('the holiday was not kept waiting')
    const wb = await page.evaluate(() => { const e = [...document.querySelectorAll('[data-testid="hol-waiting"]')].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } })
    await wait(s, 300)
    const wb2 = await boxOf(s, '[data-testid="hol-waiting"]')
    const r0 = await tring(s, wb2 || wb, 'kept waiting')
    await sshot(s, 'q3', `q3-waiting-${n}`, [r0, await boxOf(s, '[data-testid="win-holiday"]'), await sqMark(s), await ctlBox(s)])
    await untring(s)
    /* today: 149 picked */
    await holdNote(s)
    const pressed = await todayPick(s, 149, `${k}.pick149`)
    await wait(s, 400)
    const nt = await noteNow(s)
    FACT(`${k}.today`, { pressed, note: nt, bar: await barSq(s), page: await curPage(s), waiting: !!(await boxOf(s, '[data-testid="hol-waiting"]')) })
    const rn = nt?.shown ? await tring(s, nt.box, 'the note') : null
    await sshot(s, 'q3', `q3-pick-today-${n}`, [rn, await ctlBox(s), await sqMark(s), await boxOf(s, '[data-testid="hol-waiting"]')])
    await untring(s)
    await dropHold(s); await clearNote(s)
    /* proposed (answer A), by real presses: the Calendar's X (the holiday dropped, as it drops it today), the settings'
       Cancel, then 149 picked */
    /* (v2: on a phone the holiday form is a window of its own over the Calendar - its ✕ first, then the Calendar's) */
    if (!s.desk && await vis(s, '[data-testid="win-holiday-x"]').count()) {
      await hit(s, vis(s, '[data-testid="win-holiday-x"]').first(), 600)
      FACT(`${k}.formX`, { form: !!(await boxOf(s, '[data-testid="win-holiday"]')), ask: await words(s, '[role="alertdialog"], .askcard, [data-testid$="-ask"]') })
    }
    const x = vis(s, '[data-testid="win-days-x"]')
    FACT(`${k}.calX`, await x.count())
    await hit(s, x.first(), 600)
    FACT(`${k}.calClosed`, { cal: !!(await boxOf(s, '[data-testid="win-days"]')), iset: !!(await boxOf(s, '[data-testid="iset-cancel"]')) })
    if (await vis(s, '[data-testid="iset-cancel"]').count()) await hit(s, '[data-testid="iset-cancel"]', 600)
    await pickAs(s, 149, `${k}.pick149b`)
    await wait(s, 600)
    FACT(`${k}.proposed`, { bar: await barSq(s), page: await curPage(s), note: await noteNow(s), cal: !!(await boxOf(s, '[data-testid="win-days"]')) })
    const m = await sqMark(s)
    const rm = m ? await tring(s, m, 'the squadron') : null
    await sshot(s, 'q3', `q3-proposed-${n}`, [rm, await ctlBox(s), s.desk ? { x: 16, y: 0, w: 900, h: 420 } : { x: 0, y: 0, w: s.W, h: 420 }])
    await untring(s)
  })
}

/* ============ KR-Q4: words that keep themselves - a plan's name half typed ============ */
const PLANNAME = 'Wet weather'
async function planMenu(s, k) {
  const sel = vis(s, '[data-planmenu="0"]').first()
  FACT(`${k}.selector`, await sel.count())
  await hit(s, sel, 600)
  return s.page.evaluate(() => [...document.querySelectorAll('.wm, .wm-edit')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()).slice(0, 12))
}
if (want('q4')) for (const sz of SZS) {
  const n = sz === 'd' ? 'desktop' : 'phone'
  await run(`kr-q4-${n}`, sz, async s => {
    const k = `q4.${sz}`, { page } = s
    await signIn(s, 'ad', 'a')
    await go(s, 'editsched'); await wait(s, 1000)
    FACT(`${k}.menu0`, await planMenu(s, `${k}.m0`))
    await hit(s, vis(s, '[data-plandup]').first(), 900)
    FACT(`${k}.dup`, { toast: await toastNow(s) })
    FACT(`${k}.menu1`, await planMenu(s, `${k}.m1`))
    const pen = vis(s, '[data-planedit]').first()
    if (!(await pen.count())) throw new Error('no plan pencil')
    await hit(s, pen, 800)
    const box = vis(s, '#draftsModal input[aria-label="Plan name"]').first()
    FACT(`${k}.was`, await box.inputValue())
    await box.click(); await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A'); await page.keyboard.type(PLANNAME)
    if (!s.desk) { await box.fill(PLANNAME) }
    await wait(s, 300)
    FACT(`${k}.typed`, { value: await box.inputValue(), focused: await page.evaluate(() => document.activeElement?.getAttribute('aria-label')) })
    const nb = await boxOf(s, '#draftsModal input[aria-label="Plan name"]')
    const r0 = await tring(s, nb, 'the name typed')
    await sshot(s, 'q4', `q4-typed-${n}`, [r0, await boxOf(s, '#draftsModal .modal-box, #draftsModal > div'), await sqMark(s), await ctlBox(s)])
    await untring(s)
    /* today: he presses the squadron control (v2: the Plans window lies over the whole page, its dark backdrop over the top
       bar, so the press lands where the control is drawn - a real mouse press or tap at that spot, as a person makes it) */
    await clearNote(s); await holdNote(s)
    const cb = await ctlBox(s)
    const at = { x: cb.x + cb.w / 2, y: cb.y + cb.h / 2 }
    FACT(`${k}.pressAt`, { at, under: await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.id || e.className || e.tagName).toString().slice(0, 60) : null }, [at.x, at.y]) })
    if (s.desk) await page.mouse.click(at.x, at.y); else await page.touchscreen.tap(at.x, at.y)
    await wait(s, 900)
    FACT(`${k}.afterPress`, { bar: await barSq(s), modal: !!(await boxOf(s, '#draftsModal input[aria-label="Plan name"]')), menuOpen: s.desk ? !!(await boxOf(s, '#sqnMenu .sqm-row')) : await page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open')), toast: await toastNow(s) })
    /* if the press opened the squadron list, 149 is pressed in it */
    if (s.desk ? await boxOf(s, '#sqnMenu .sqm-row') : await page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open'))) {
      const list = s.desk ? '#sqnMenu .sqm-row' : '#drawerSqnList .sqm-row'
      if (!s.desk && !(await vis(s, list).count()) && await page.locator('#drawerSqnBtn').count()) await hit(s, '#drawerSqnBtn', 450)
      const row = vis(s, list).filter({ has: page.locator('.sqm-num', { hasText: /^149$/ }) }).first()
      if (await row.count()) await hit(s, row, 900)
      if (!s.desk) await shut(s)
      FACT(`${k}.listPressed`, { bar: await barSq(s) })
    }
    await wait(s, 400)
    const nt = await noteNow(s)
    FACT(`${k}.today`, { note: nt, bar: await barSq(s), page: await curPage(s), modal: !!(await boxOf(s, '#draftsModal input[aria-label="Plan name"]')), value: await page.locator('#draftsModal input[aria-label="Plan name"]').inputValue().catch(() => null) })
    const rn = nt?.shown ? await tring(s, nt.box, 'the note') : null
    await sshot(s, 'q4', `q4-pick-today-${n}`, [rn, await ctlBox(s), await sqMark(s), await boxOf(s, '#draftsModal input[aria-label="Plan name"]')])
    await untring(s)
    await dropHold(s); await clearNote(s)
    /* proposed (answer A), by real presses: the box left (its own save - the name kept on 142), the window's X, 149 picked */
    if (await vis(s, '#draftsModal .modal-head b').count()) {
      await hit(s, vis(s, '#draftsModal .modal-head b').first(), 500)
      FACT(`${k}.left`, { value: await page.locator('#draftsModal input[aria-label="Plan name"]').inputValue().catch(() => null), tabs: await words(s, '#draftsModal .tpl-tab') })
      await hit(s, '#draftsClose', 600)
    } else FACT(`${k}.left`, 'the window had already closed at the press')
    if (!/^149/.test(await barSq(s) || '')) await pickAs(s, 149, `${k}.pick149b`)
    await wait(s, 600)
    FACT(`${k}.proposed149`, { bar: await barSq(s), page: await curPage(s), note: await noteNow(s), modal: !!(await boxOf(s, '#draftsModal input')) })
    const m = await sqMark(s)
    const rm = m ? await tring(s, m, 'the squadron') : null
    await sshot(s, 'q4', `q4-proposed-149-${n}`, [rm, await ctlBox(s), s.desk ? { x: 16, y: 0, w: 900, h: 420 } : { x: 0, y: 0, w: s.W, h: 420 }])
    await untring(s)
    /* and 142 picked back: the plan menu shows the name kept on 142 */
    await pickAs(s, 142, `${k}.back142`)
    await go(s, 'editsched'); await wait(s, 800)
    const menu = await planMenu(s, `${k}.m2`)
    FACT(`${k}.kept`, { bar: await barSq(s), menu })
    const row = await page.evaluate(n => { const e = [...document.querySelectorAll('.wm')].find(x => x.getBoundingClientRect().width > 0 && x.textContent.includes(n)); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }, PLANNAME)
    const menuBox = await page.evaluate(() => { const e = [...document.querySelectorAll('.wm')].find(x => x.getBoundingClientRect().width > 0); const p = e?.closest('.popmenu, .pop, [role="menu"], .wm-pop') || e?.parentElement?.parentElement; if (!p) return null; const r = p.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } })
    const rk = row ? await tring(s, row, 'the name kept') : null
    await sshot(s, 'q4', `q4-proposed-kept-${n}`, [rk, menuBox, await sqMark(s)])
    await untring(s)
  })
}

/* ============ KR-Q4, second example (v2): a calendar note half typed in the Inputs calendar's day window ============
   (the Plans window lies over the top bar, so a press there closes it first - the guard never sees it; the day window does
   not, so this is the case the guard stops today) */
const NOTE = 'Brief the new guy'
const NOTE_DAY = '2026-11-30'
async function openDay(s, k) {
  await go(s, 'inputs'); await wait(s, 800)
  const cal = vis(s, '#inCalBtn, button[aria-pressed]').filter({ hasText: /^Calendar$/ })
  if (await cal.count()) await hit(s, cal.first(), 700)
  /* (v2: the calendar opens on the real month; the day is the one after today drawn in the month - Mon 30 Nov 26) */
  const heads = await s.page.evaluate(() => [...document.querySelectorAll('[data-ichead]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.ichead))
  const day = heads.includes(NOTE_DAY) ? NOTE_DAY : heads[heads.length - 1]
  const head = vis(s, `[data-ichead="${day}"]`).first()
  FACT(`${k}.head`, { day, count: await head.count(), heads: heads.length })
  /* (a press on the day's empty space, as a person presses it; the grid draws its bars over the heads) */
  await head.scrollIntoViewIfNeeded().catch(() => {})
  const hb = await head.boundingBox()
  const pt = { x: hb.x + hb.width / 2, y: hb.y + Math.min(hb.height - 4, 40) }
  if (s.desk) await s.page.mouse.click(pt.x, pt.y); else await s.page.touchscreen.tap(pt.x, pt.y)
  await wait(s, 800)
  return !!(await boxOf(s, '[data-testid="win-inputsday"]'))
}
const notesOn = s => s.page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] [data-testid^="idy-note-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => ((e.querySelector('input')?.value || '') + ' ' + e.innerText).replace(/\s+/g, ' ').trim().slice(0, 60)))
if (want('q4n')) for (const sz of SZS) {
  const n = sz === 'd' ? 'desktop' : 'phone'
  await run(`kr-q4n-${n}`, sz, async s => {
    const k = `q4n.${sz}`, { page } = s
    await signIn(s, 'ad', 'a')
    if (!(await openDay(s, k))) throw new Error('the day window did not open')
    FACT(`${k}.notesBefore`, await notesOn(s))
    await hit(s, '#icAddPuck', 500)
    const box = vis(s, '[aria-label="New planning note"]').first()
    await box.click(); await page.keyboard.type(NOTE); await wait(s, 300)
    FACT(`${k}.typed`, { value: await box.inputValue(), focused: await page.evaluate(() => document.activeElement?.getAttribute('aria-label')) })
    const nb = await boxOf(s, '[aria-label="New planning note"]')
    const r0 = await tring(s, nb, 'the note typed')
    await sshot(s, 'q4', `q4n-typed-${n}`, [r0, await boxOf(s, '[data-testid="win-inputsday"]'), await sqMark(s), await ctlBox(s)])
    await untring(s)
    /* today: the squadron control pressed, then 149 */
    await clearNote(s); await holdNote(s)
    const pressed = await todayPick(s, 149, `${k}.pick149`)
    await wait(s, 400)
    const nt = await noteNow(s)
    FACT(`${k}.today`, { pressed, note: nt, bar: await barSq(s), page: await curPage(s), win: !!(await boxOf(s, '[data-testid="win-inputsday"]')), box: await page.locator('[aria-label="New planning note"]').inputValue().catch(() => null), notes: await notesOn(s) })
    const rn = nt?.shown ? await tring(s, nt.box, 'the note') : null
    await sshot(s, 'q4', `q4n-pick-today-${n}`, [rn, await ctlBox(s), await sqMark(s), await boxOf(s, '[data-testid="win-inputsday"]')])
    FACT(`${k}.noteAtShot`, { note: await noteNow(s), at: await page.evaluate(() => { const t = document.querySelector('#toastEl'); const r = t.getBoundingClientRect(); const e = document.elementFromPoint(r.left + 10, r.top + 10); return { top: e?.id || String(e?.className).slice(0, 40), z: getComputedStyle(t).zIndex, vis: getComputedStyle(t).visibility, disp: getComputedStyle(t).display, tr: getComputedStyle(t).transform, inline: t.getAttribute('style')?.slice(-160), anims: (t.getAnimations?.() || []).length, parentOp: getComputedStyle(t.parentElement).opacity, inert: !!t.closest('[inert]'), ancestors: (() => { const o = []; for (let e = t.parentElement; e; e = e.parentElement) { const c = getComputedStyle(e); if (c.opacity !== '1' || c.visibility !== 'visible' || c.filter !== 'none') o.push((e.id || e.tagName) + ':' + c.opacity + ':' + c.filter) } return o })() } }) })
    await untring(s)
    await dropHold(s); await clearNote(s)
    /* proposed (answer A), by real presses: the box left (its own save, on 142), the day window's X, 149 picked */
    if (await vis(s, '[aria-label="New planning note"]').count()) { await page.keyboard.press('Tab'); await wait(s, 500) }
    FACT(`${k}.left`, { notes: await notesOn(s) })
    const x = vis(s, '[data-testid="win-inputsday-x"], [data-testid="win-inputsday"] .x, [data-testid="win-inputsday"] [aria-label="Close"]').first()
    if (await x.count()) await hit(s, x, 600)
    FACT(`${k}.closed`, !!(await boxOf(s, '[data-testid="win-inputsday"]')))
    await pickAs(s, 149, `${k}.pick149b`)
    await wait(s, 600)
    FACT(`${k}.proposed149`, { bar: await barSq(s), page: await curPage(s), note: await noteNow(s), win: !!(await boxOf(s, '[data-testid="win-inputsday"]')) })
    const m = await sqMark(s)
    const rm = m ? await tring(s, m, 'the squadron') : null
    await sshot(s, 'q4', `q4n-proposed-149-${n}`, [rm, await ctlBox(s), s.desk ? { x: 16, y: 0, w: 900, h: 420 } : { x: 0, y: 0, w: s.W, h: 420 }])
    await untring(s)
    /* 142 picked back, the same day opened: the note kept on 142 */
    await pickAs(s, 142, `${k}.back142`)
    await openDay(s, `${k}.again`)
    const notes = await notesOn(s); FACT(`${k}.kept`, { bar: await barSq(s), notes })
    const nk = await page.evaluate(t => { const e = [...document.querySelectorAll('[data-testid="win-inputsday"] [data-testid^="idy-note-"]')].find(x => x.getBoundingClientRect().width > 0 && ((x.querySelector('input')?.value || '') + x.innerText).includes(t)); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }, NOTE)
    const rk = nk ? await tring(s, nk, 'the note kept') : null
    await sshot(s, 'q4', `q4n-proposed-kept-${n}`, [rk, await boxOf(s, '[data-testid="win-inputsday"]'), await sqMark(s)])
    await untring(s)
  })
}
await closeAll()
