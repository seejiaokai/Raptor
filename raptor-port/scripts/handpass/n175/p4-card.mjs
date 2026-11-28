// p4-card - P4 case 2, the refresh card's edges (H10; C46-C51), as TODAY's app behaves (the card is not built).
//   (a) Hunter's own move 142 -> 149 lands at midnight, NOTHING open (he is on the week page): what changes, what is said.
//   (b) the app opened two days AFTER his move date (18 Jul, move from 16 Jul): where he lands, what is said.
//   (c) a posting OUT taking effect at midnight with the app open: Saber posts Hunter out from 16 Jul through Leave War's
//       bid sheet "Post out" (c: the chosen chip as drawn, Overseas Sqn - "archived, account suspended"), signs out;
//       Hunter signs in at 23:58:30 and the clock runs past midnight. (c2: the same with the SANS chip pressed.) What his
//       screen shows.
//   (d) a midnight for a man who is NOT moving: Saber signed in, Hunter's move lands at the same midnight: anything shown?
//   (e) the browser's own reload while a save is waiting ("Not saved"): does the browser ask; stay, then reload and leave:
//       is the change lost?
//   (f) 149's Tracker failing at EVERY pick: on the Tracker page, 149 picked three times (142 between): the panel each time.
// STAND-INS, each named in its FACT lines: the midnight (a, c, d): the page clock installed before midnight and run past it
// (Playwright's clock; the app's own midnight wake fires on the way), and for a/b/d the move written as a home row at the
// sign-in card (no screen saves a move - mid-e1's way). (b): the page clock installed at 18 Jul 09:00. (e): browser storage
// refuses every write (save-d's stand-in); the reload is the browser's own (page.reload). (f): reads of 149's Tracker
// records refused (trk-e3's stand-in), installed before the first pick and left on.
//   node raptor-port/scripts/handpass/n175/p4-card.mjs <d|402x874>    (ONLY=a,b,c,d,e,f)
// A phone here is WebKit at 402x874 (mid-e1's phone world) for a-d; e and f use chat 166's phone (Chromium, touch).
import { mk, closeAll, FACT, signIn, barSq, pageOn, go, reachPick, wait, vis, hit, toast, question, tpic, dpic, SZT, boxOf, covered, windowsNow, roleNow, bands, sayNow, clockWorld, clockSignIn, clockTo } from './p4-lib.mjs'
const SZ = process.argv[2] || 'd', T = SZT(SZ)
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = x => !ONLY.length || ONLY.includes(x)
const MOVE = { pid: 'prowler', from: 'u142', to: 'u149', day: '2026-07-16' }
const role = async s => { const r = await roleNow(s); return r.badge || r.menuLine }
const screenNow = async s => ({ tabs: await s.page.evaluate(() => [...document.querySelectorAll('#topnav a[data-page], #drawerNav a[data-page]')].map(a => a.getAttribute('data-page')).filter((v, i, a) => a.indexOf(v) === i).join(',')), squadron: await barSq(s), role: await role(s), page: await pageOn(s), signInCard: !!(await vis(s, '#luser').count()), said: await sayNow(s), bands: await bands(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 120)) })
/* the bell: its count as drawn, and on opening, its lines (closed again after) */
async function bellNow(s) {
  const n = await s.page.evaluate(() => { const b = [...document.querySelectorAll('#notifyBell')].find(e => e.getBoundingClientRect().width > 0); if (!b) return 'no bell drawn'; const dot = [...b.querySelectorAll('*')].some(e => { const r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 2 && r.width < 16 && r.height < 16 && c.borderRadius !== '0px' && /rgb\((2[0-5]\d|1\d\d),\s?\d{1,2},/.test(c.backgroundColor) }); return { words: b.innerText.replace(/\s+/g, ' ').trim(), label: b.getAttribute('aria-label'), className: String(b.className), unreadDot: dot } })
  return n
}
async function a() {
  const k = `R.${T}.a`, P = `p4-carda-${T}`
  const s = await clockWorld(SZ, { now: '2026-07-15T23:58:00', homes: [MOVE], user: 'ad2', pass: 'a2' })
  try {
    FACT(`${k}.standIn`, 'move 142->149 from 16 Jul written as a home row at the sign-in card; page clock 15 Jul 23:58:00 run to 16 Jul 00:00:30 (Singapore)')
    FACT(`${k}.beforeMidnight`, { ...(await screenNow(s)), bell: await bellNow(s) })
    await dpic(s, `${P}-1-before-midnight`, s.desk ? ['.topbar #sqnMenuBtn', '#roleBadge'] : ['#burger', '.topbar .mark'], s.desk ? ['.topbar'] : ['.topbar'])
    await clockTo(s, '2026-07-16T00:00:30')
    FACT(`${k}.afterMidnight`, { ...(await screenNow(s)), bell: await bellNow(s), toast: await toast(s) })
    await dpic(s, `${P}-2-after-midnight`, s.desk ? ['.topbar #sqnMenuBtn', '#roleBadge'] : ['.topbar .mark'], ['.topbar'])
    await clockTo(s, '2026-07-16T00:05:00')
    FACT(`${k}.fiveMinutesLater`, { ...(await screenNow(s)), bell: await bellNow(s) })
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)) } finally { await s.browser.close().catch(() => {}) }
}
async function b() {
  const k = `R.${T}.b`, P = `p4-cardb-${T}`
  const s = await clockWorld(SZ, { now: '2026-07-18T09:00:00', homes: [MOVE] })
  try {
    FACT(`${k}.standIn`, 'move 142->149 from 16 Jul written as a home row at the sign-in card; page clock 18 Jul 09:00 (two days after)')
    await clockSignIn(s, 'ad2', 'a2')
    FACT(`${k}.landed`, { ...(await screenNow(s)), bell: await bellNow(s), toast: await toast(s) })
    await dpic(s, `${P}-1-landed`, s.desk ? ['.topbar #sqnMenuBtn', '#roleBadge'] : ['.topbar .mark'], ['.topbar'])
    /* the bell opened as he would, to read any line about the move */
    if ((await covered(s, '#notifyBell')) === 'free') { await hit(s, '#notifyBell', 600); FACT(`${k}.bellList`, await s.page.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); return l ? l.innerText.replace(/\s+/g, ' ').trim().slice(0, 400) : (document.querySelector('[role=dialog]')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 300) || 'nothing opened' })); await tpic(s, `${P}-2-bell`) }
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)) } finally { await s.browser.close().catch(() => {}) }
}
async function c(outcome = null) {
  const k = `R.${T}.c${outcome ? '-' + outcome : ''}`, P = `p4-cardc${outcome ? '-' + outcome : ''}-${T}`
  const s = await clockWorld(SZ, { now: '2026-07-15T23:40:00', user: 'ad', pass: 'a' })
  const { page } = s
  try {
    /* Saber: Leave War, July, a cell of Hunter's row, the sheet's Post out, from 16 Jul */
    await go(s, 'leavewar'); await page.waitForSelector('[data-testid="month-strip"]', { timeout: 15000 }); await wait(s, 600)
    if (await vis(s, '[data-testid="month-JUL"]').count()) await hit(s, '[data-testid="month-JUL"]', 700)
    /* the cell of 16 Jul: the sheet's "PO from" date starts at the cell's own day */
    const cell = page.locator('[data-testid="cell-prowler-2026-07-16"]').first()
    await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await wait(s, 250)
    if (s.desk) await cell.click(); else await cell.tap(); await wait(s, 800)
    if (!(await vis(s, '[data-testid="bid-postout"]').count())) await hit(s, '[data-testid="bid-more"]', 500)
    await hit(s, '[data-testid="bid-postout"]', 600)
    const date = vis(s, '[data-testid="po-date"]').first()
    /* c2: the SANS chip pressed in place of the chosen Overseas Sqn */
    if (outcome) await hit(s, `[data-testid="po-${outcome}"]`, 400)
    const chips = await page.evaluate(() => [...document.querySelectorAll('.po-outcomes button')].map(b => b.textContent.trim() + (b.getAttribute('aria-pressed') === 'true' ? ' [chosen]' : '') + (b.disabled ? ' [greyed]' : '')))
    const line = await page.locator('[data-testid="po-line"]').first().textContent().catch(() => null)
    FACT(`${k}.saber.postOutSheet`, { chips, line, date: await date.inputValue().catch(() => null) })
    await tpic(s, `${P}-0-saber-sheet`)
    await hit(s, '[data-testid="po-confirm"]', 900)
    FACT(`${k}.saber.afterPostOut`, { toast: await toast(s), said: await sayNow(s) })
    /* Saber signs out through the app's own Logout */
    if (!s.desk) { await hit(s, '#burger', 500) }
    await hit(s, vis(s, '#logout, #drawer button').filter({ hasText: /Log ?out|Sign out/i }).first(), 900)
    if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk', 800)
    await page.waitForSelector('#luser', { timeout: 15000 })
    await clockTo(s, '2026-07-15T23:58:30')
    await clockSignIn(s, 'ad2', 'a2')
    FACT(`${k}.standIn`, 'page clock 15 Jul 23:40 (Saber presses Post out, signs out), 23:58:30 Hunter signs in, run to 16 Jul 00:00:30 (Singapore)')
    FACT(`${k}.hunter.beforeMidnight`, { ...(await screenNow(s)), bell: await bellNow(s) })
    await clockTo(s, '2026-07-16T00:00:30')
    FACT(`${k}.hunter.afterMidnight`, { ...(await screenNow(s)), bell: await bellNow(s), toast: await toast(s) })
    const shown = await page.evaluate(() => { const vis = e => { const b = e.getBoundingClientRect(); return b.width > 2 && b.height > 2 && getComputedStyle(e).visibility !== 'hidden' }; return { text: (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 400), buttons: [...document.querySelectorAll('button, a')].filter(vis).map(b => (b.innerText || b.getAttribute('aria-label') || '').trim().slice(0, 30)).filter(Boolean).slice(0, 12), card: [...document.querySelectorAll('h1, h2, .card, [class*=card], [class*=access], [class*=wait]')].filter(vis).map(e => (e.id ? '#' + e.id : '') + '.' + String(e.className).split(/\s+/)[0]).slice(0, 6) } })
    FACT(`${k}.hunter.afterMidnight.screen`, shown)
    await dpic(s, `${P}-1-after-midnight`, ['.login-card', '.topbar .mark'], null)
    /* a press after midnight, as he would: the Edit Schedule page */
    if (await barSq(s)) { await go(s, 'editsched').catch(e => FACT(`${k}.hunter.goEditSched`, 'could not: ' + String(e).split('\n')[0].slice(0, 100))); await wait(s, 900) }
    else FACT(`${k}.hunter.goEditSched`, 'no page tab drawn: the app shows only the card above')
    FACT(`${k}.hunter.afterAPress`, { ...(await screenNow(s)), bell: await bellNow(s) })
    await tpic(s, `${P}-2-after-press`)
    await page.reload(); await wait(s, 2500)
    FACT(`${k}.hunter.afterReload`, await screenNow(s))
    await tpic(s, `${P}-3-after-reload`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await tpic(s, `${P}-error`).catch(() => {}) } finally { await s.browser.close().catch(() => {}) }
}
async function d() {
  const k = `R.${T}.d`, P = `p4-cardd-${T}`
  const s = await clockWorld(SZ, { now: '2026-07-15T23:58:00', homes: [MOVE], user: 'ad', pass: 'a' })
  try {
    FACT(`${k}.standIn`, 'Hunter\'s move 142->149 from 16 Jul written at the sign-in card; Saber signed in; clock 23:58:00 -> 00:00:30')
    FACT(`${k}.beforeMidnight`, { ...(await screenNow(s)), bell: await bellNow(s) })
    await clockTo(s, '2026-07-16T00:00:30')
    FACT(`${k}.afterMidnight`, { ...(await screenNow(s)), bell: await bellNow(s), toast: await toast(s) })
    await dpic(s, `${P}-1-after-midnight`, s.desk ? ['.topbar #sqnMenuBtn', '#roleBadge', '#notifyBell'] : ['.topbar .mark'], ['.topbar'])
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)) } finally { await s.browser.close().catch(() => {}) }
}
async function e() {
  const k = `R.${T}.e`, P = `p4-carde-${T}`, W = 'N175E words'
  let policy = 'dismiss'; const dialogs = []
  const s = await clockWorld(SZ, { engine: 'chromium', onDialog: dg => { dialogs.push({ type: dg.type(), message: dg.message(), answered: policy }); (policy === 'dismiss' ? dg.dismiss() : dg.accept()).catch(() => {}) } })
  const { page } = s
  const storedWith = () => page.evaluate(w => { const out = []; for (let i = 0; i < localStorage.length; i++) { const kk = localStorage.key(i); if ((localStorage.getItem(kk) || '').includes(w)) out.push(kk) } return out }, W)
  try {
    await clockSignIn(s, 'ad', 'a')
    await go(s, 'inputs'); await wait(s, 600)
    if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
    if (!(await vis(s, '#inBody tr[data-iid], #inList [data-iid]').count())) { await hit(s, '#inRangeBtn'); if (await page.locator('#inRangeAll').count()) await hit(s, page.locator('#inRangeAll').first()); if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn') }
    const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').first(); FACT(`${k}.input`, (await row.innerText()).replace(/\s+/g, ' ').slice(0, 40))
    const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 700)
    await page.evaluate(() => { window.__n175 = { real: Storage.prototype.setItem }; Storage.prototype.setItem = function () { throw new DOMException('The quota has been exceeded.', 'QuotaExceededError') } })
    FACT(`${k}.standIn`, 'browser storage refuses every write (localStorage.setItem throws), from just before the Save; the reload is the browser\'s own (page.reload)')
    const r = vis(s, '#inpEditRmk').first(); if (s.desk) await r.click(); else await r.tap(); await page.keyboard.press('Control+a'); await page.keyboard.type(W)
    await hit(s, '#inpEditSave', 2500)
    FACT(`${k}.beforeReload`, await screenNow(s))
    await dpic(s, `${P}-1-not-saved`, ['.saveband', '.savestat'], ['.topbar', '.saveband'])
    /* the browser's reload, answered "stay" */
    policy = 'dismiss'
    await page.reload({ timeout: 5000 }).catch(err => FACT(`${k}.reload1.note`, String(err).split('\n')[0].slice(0, 120)))
    await wait(s, 1200)
    FACT(`${k}.reload1`, { dialogs: dialogs.slice(), ...(await screenNow(s)), stored: await storedWith() })
    await tpic(s, `${P}-2-after-stay`)
    /* again, answered "leave" */
    policy = 'accept'
    await page.reload({ timeout: 15000 }).catch(err => FACT(`${k}.reload2.note`, String(err).split('\n')[0].slice(0, 120)))
    await wait(s, 2500)
    FACT(`${k}.reload2`, { dialogs: dialogs.slice(), ...(await screenNow(s)), stored: await storedWith() })
    await dpic(s, `${P}-2-after-leave`, ['#luser', '#loginForm'], ['#loginForm'])
    if (await vis(s, '#luser').count()) { await clockSignIn(s, 'ad', 'a'); FACT(`${k}.afterSignInAgain`, { stored: await storedWith(), said: await sayNow(s), bands: await bands(s) }) }
  } catch (err) { FACT(`${k}.error`, String(err).split('\n')[0].slice(0, 200)) } finally { await s.browser.close().catch(() => {}) }
}
async function f() {
  const k = `R.${T}.f`, P = `p4-cardf-${T}`
  const s = await mk(SZ); const { page } = s
  const panel = () => page.evaluate(() => { const pg = document.querySelector('#page-tracker'); const btns = pg ? [...pg.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && /reload|try|again|retry/i.test(b.textContent)).map(b => b.textContent.trim()) : []; return { text: (pg?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 260), retryButtons: btns, chart: !!document.querySelector('#flowSvg .ball') } })
  try {
    await signIn(s, 'ad', 'a')
    await go(s, 'tracker'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 600)
    await page.evaluate(() => { window.__n175 = { hits: 0 }; const g = Map.prototype.get; Map.prototype.get = function (key) { if (typeof key === 'string' && key.startsWith('tracker/u149@')) { window.__n175.hits++; throw new Error('store refused a read') } return g.call(this, key) } })
    FACT(`${k}.standIn`, 'reads of 149\'s Tracker records refused (Map.prototype.get throws for tracker/u149@ keys), from before the first pick, left on')
    for (let i = 1; i <= 3; i++) {
      const p = await reachPick(s, 149, 'bar'); let pr = p; if (!p.pressed && !s.desk) pr = await reachPick(s, 149, 'menu')
      await wait(s, 2000)
      FACT(`${k}.pick149.${i}`, { pressed: !!pr.pressed, squadron: await barSq(s), page: await pageOn(s), panel: await panel(), said: await sayNow(s), standInHits: await page.evaluate(() => window.__n175.hits) })
      if (i === 1 || i === 3) await dpic(s, `${P}-${i}-pick149`, ['#page-tracker .tr-root, #page-tracker'], null)
      else await tpic(s, `${P}-${i}-pick149`)
      if (i < 3) { let q = await reachPick(s, 142, 'bar'); if (!q.pressed && !s.desk) q = await reachPick(s, 142, 'menu'); await wait(s, 1500); FACT(`${k}.back142.${i}`, { pressed: !!q.pressed, squadron: await barSq(s), chart: (await panel()).chart }) }
    }
  } catch (err) { FACT(`${k}.error`, String(err).split('\n')[0].slice(0, 200)) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p4-card v1', SZ)
  if (want('a')) await a()
  if (want('b')) await b()
  if (want('c')) await c()
  if (want('c2')) await c('sans')
  if (want('d')) await d()
  if (want('e')) await e()
  if (want('f')) await f()
} catch (err) { console.error('FAILED', String(err).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
