// r-war (chat 151, the re-walk) — fix 3 and scenarios a, a2, b, b2: a Leave War window open when the page would land
// elsewhere holds the page — the Leave War stays, the window and its words in sight, until the window is closed; then the
// page lands on View-only Sched. A window held by a pick wears the band "This is 142's. You picked 149 — close this to go
// on.", its controls greyed, ✕ and Close live; the band's Close lands him; picking 142 again gives the window back live.
//  a  — Hunter (Plan of 149) on 149's Leave War, a man's window open with words typed, switches to the member view.
//  b  — Ranger (View of 149) on 142's Leave War, a window open, picks 149. Then Hunter with View of 149 the same (a View
//       holder too — the second fix round).
// Windows tried: the day's window (modal, with its own shade) with words typed in its box, and the man's own figures
// window from his name (not modal). Where the control to press is covered by the window's shade, the cover is pictured
// and named — a result, not forced. SZ=d (desktop 1536: the badge, the top bar's list, the ✕, Escape) or SZ=p (WebKit
// phone: ☰ and its role line and list, the ✕, the band's Close, a held press on the shade).
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, openMenu, menuPick, barPick, go, grant, finish, note, facts, state } from './vlib.mjs'
import { check, shutMenu, over, wins, T, hold } from './r-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('r-war v2 (phone: the name where seen, the ☰ tap checked, the menu shut after a pick)', SZ)
picsFor('r-war-' + SZ)
const BAND = (from, to) => `This is ${from}'s. You picked ${to} — close this to go on.`
const norm = t => (t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
const pick = (s, n, name) => s.desk ? barPick(s, n, name) : menuPick(s, n, name)
const pagesOffered = st => (st.tabs.length ? st.tabs : st.items)
/* the day's window of person `pid` on `date`: its cell pressed where it is drawn */
async function dayWindow(s, pid, date, words) {
  const c = s.page.locator(T(`cell-${pid}-${date}`)).first()
  if (!(await c.count())) return { ok: false, why: `no cell ${pid} ${date}` }
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await s.page.waitForTimeout(350)
  const b = await c.boundingBox()
  if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  await s.page.waitForTimeout(800)
  const box = s.page.locator('.bidsheet textarea, .bidsheet input[type=text], .bidsheet input:not([type])').filter({ visible: true }).first()
  if (!(await box.count())) return { ok: true, typed: false, w: await wins(s) }
  await box.click(); await box.type(words, { delay: 10 })
  return { ok: true, typed: true, w: await wins(s) }
}
/* the man's own figures window, from his name */
async function personWindow(s, pid) {
  /* the name where a person sees it: on a phone with the year scrolled, the frozen band's copy (e2e/leavewar.spec.ts) */
  let n = s.page.locator(T(`person-${pid}`)).filter({ visible: true }).first()
  if (!(await n.count()) || (await over(s, `[data-testid="person-${pid}"]`)) !== 'self') n = s.page.locator(`.mxband [data-band-id="${pid}"] .whoedit`).filter({ visible: true }).first()
  if (!(await n.count())) return { ok: false, why: `no name ${pid}` }
  const b = await n.boundingBox()
  if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  await s.page.waitForTimeout(800)
  return { ok: (await wins(s)).length > 0, w: await wins(s) }
}
/* on the phone: the ☰ button tapped with the window open — does ☰ open, or does the tap only close the window? */
async function burgerTap(s, name) {
  const before = (await wins(s)).length
  await openMenu(s, name && `${name}-menu`)
  const st = await state(s), after = (await wins(s)).length
  if (st.drawerOpen) return { open: true }
  return { open: false, cover: `the ☰ tap opened no menu; windows ${before} → ${after} (the tap closed the window)` }
}
/* the role switch a person has with the window open: the badge (desktop) or ☰'s role line (phone) */
async function switchRole(s, name) {
  if (s.desk) { const o = await over(s, '#roleBadge'); if (o !== 'self') return { pressed: false, cover: o }; await press(s, '#roleBadge'); return { pressed: true } }
  const o = await over(s, '#burger'); if (o !== 'self') return { pressed: false, cover: o }
  const b = await burgerTap(s, name); if (!b.open) return { pressed: false, cover: b.cover }
  await press(s, '#drawerRole', name && `${name}-role`); return { pressed: true }
}
async function pickWithWindow(s, n, name) {
  const o = await over(s, s.desk ? '#sqnMenuBtn' : '#burger'); if (o !== 'self') return { pressed: false, cover: o }
  if (!s.desk) { const b = await burgerTap(s, name); if (!b.open) return { pressed: false, cover: b.cover } }
  await pick(s, n, name)
  if (!s.desk) await shutMenu(s)   // a pick inside ☰ leaves the menu open (D2384): shut it to see the page under it
  return { pressed: true }
}
const anyWin = async s => (await wins(s))[0] || null
/* the window's own ✕: the person window's, else the frame's close */
async function closeX(s, name) {
  for (const sel of [T('pw-close'), T('bid-cancel'), '.bidsheet .bidsheet-hd button.x', '.bidsheet button[aria-label="Close"]', '.bidsheet .x']) {
    if ((await over(s, sel)) === 'self') { await press(s, sel, name); return sel }
  }
  return null
}
await serve()
try {
  const s = await newPage(SZ)
  const { page } = s
  await signIn(s, 'ad', 'a')
  await step('grants', async () => { await grant(s, 'prowler', '149', 'plan'); await grant(s, 'bane', '149', 'view'); await go(s, 'viewsched'); await shutMenu(s) })
  await as(s, 'ad2', 'a2')
  /* ---- a: Hunter, Plan of 149, member-view switch with a 149 man's window open ---- */
  const man149 = 'osp9'
  for (const [kind, closeBy] of [['day', 'x'], ['person', 'x'], ...(SZ === 'd' ? [['day', 'esc'], ['person', 'esc']] : [])]) {
    await step(`a: ${kind} window, switch to the member view, close by ${closeBy}`, async () => {
      const k = `a-${kind}-${closeBy}`
      let st = await state(s)
      if (!st.barMark?.startsWith('149')) { await go(s, 'viewsched'); await pick(s, '149'); await shutMenu(s) }
      await go(s, 'leavewar'); await page.waitForTimeout(1500); await shutMenu(s)
      const o = kind === 'day' ? await dayWindow(s, man149, '2026-12-09', 'walk words a') : await personWindow(s, man149)
      facts[`${k}-opened`] = o; note(k, 'opened:', JSON.stringify(o))
      await pic(s, `${k}-01-open`)
      if (!o.ok) { check(`${k}: premise — the window opened`, false, o); return }
      const sw = await switchRole(s, `${k}-02`)
      facts[`${k}-switch`] = sw
      if (!sw.pressed) {
        note(`${k}: the role switch cannot be pressed with this window open — covered by`, sw.cover)
        await pic(s, `${k}-02-switch-covered`)
        facts[`${k}-result`] = `NOT WALKED: the role switch covered by ${sw.cover}`
        await page.keyboard.press('Escape'); await page.waitForTimeout(400); if ((await wins(s)).length) await closeX(s)
        return
      }
      await page.waitForTimeout(600)
      st = await rec(s, `${k}-b-after-switch`); const w = await anyWin(s)
      await pic(s, `${k}-02-after-switch`)
      check(`${k}: the page held on the Leave War`, st.page === 'page-leavewar', st.page)
      check(`${k}: the window still in sight`, !!w, w)
      if (o.typed) check(`${k}: its typed words still there`, !!w && w.typed.includes('walk words a'), w && w.typed)
      facts[`${k}-band`] = w && w.band; note(`${k}: the band reads`, w && w.band)
      if (closeBy === 'x') { const c = await closeX(s, `${k}-03-x`); check(`${k}: the window's own ✕ pressed`, !!c, c) }
      else { await page.keyboard.press('Escape'); await page.waitForTimeout(600) }
      await page.waitForTimeout(600)
      st = await rec(s, `${k}-c-after-close`); await pic(s, `${k}-03-after-close`)
      check(`${k}: closed → the page lands on 149's View-only Sched`, st.page === 'page-viewsched' && st.barMark?.startsWith('149'), { page: st.page, mark: st.barMark })
      check(`${k}: two pages offered (View-only Sched, Help)`, pagesOffered(st).length === 2, pagesOffered(st))
      check(`${k}: no window left`, (await wins(s)).length === 0, await wins(s))
      /* back to the admin view for the next round */
      if (s.desk) await press(s, '#roleBadge'); else { await openMenu(s); await press(s, '#drawerRole') }
      await shutMenu(s)
    })
  }
  /* ---- b: Ranger, View of 149, a window open on 142's Leave War, picks 149 ---- */
  async function bRound(who, pid, tag) {
    await step(`${tag}: the day's window with words typed, then a pick of 149`, async () => {
      const k = `${tag}-day`
      if ((await state(s)).barMark?.startsWith('149')) { await go(s, 'viewsched'); await pick(s, '142'); await shutMenu(s) }
      await go(s, 'leavewar'); await page.waitForTimeout(1500); await shutMenu(s)
      const o = await dayWindow(s, pid, '2026-12-09', 'walk words b'); facts[`${k}-opened`] = o; note(k, JSON.stringify(o))
      await pic(s, `${k}-01-open`)
      const p = await pickWithWindow(s, '149', `${k}-02`)
      facts[`${k}-pick`] = p
      if (!p.pressed) {
        note(`${k}: the pick cannot be made with this window open — covered by`, p.cover)
        await pic(s, `${k}-02-pick-covered`); facts[`${k}-result`] = `NOT WALKED: covered by ${p.cover}`
        if (!s.desk) {
          /* a2/b2: a press held about a second on the window's shade, the phone */
          const sh = await page.evaluate(() => { const e = [...document.querySelectorAll('.sheetscrim')].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left + 20), y: Math.round(r.top + 60) } })
          facts[`${k}-shade`] = sh
          if (sh) { await hold(s, sh.x, sh.y, 1000, `${k}-03-hold-shade`); const w = await wins(s); facts[`${k}-after-hold`] = w; note(`${k}: after a held press on the shade, windows:`, JSON.stringify(w)); await pic(s, `${k}-03-after-hold-shade`) }
        }
        await page.keyboard.press('Escape'); await page.waitForTimeout(400); if ((await wins(s)).length) await closeX(s)
        return
      }
      const st = await rec(s, `${k}-b-after-pick`); const w = await anyWin(s); await pic(s, `${k}-02-after-pick`)
      check(`${k}: the page held on the Leave War`, st.page === 'page-leavewar', st.page)
      check(`${k}: the window and its words in sight`, !!w && w.typed.includes('walk words b'), w)
      check(`${k}: the band "${BAND('142', '149')}"`, !!w && norm(w.band) === BAND('142', '149'), w && w.band)
      await closeX(s, `${k}-03-x`); const st2 = await rec(s, `${k}-c-after-x`); await pic(s, `${k}-03-after-x`)
      check(`${k}: ✕ → 149's View-only Sched`, st2.page === 'page-viewsched' && st2.barMark?.startsWith('149'), { page: st2.page, mark: st2.barMark })
    })
    await step(`${tag}: his own figures window, a pick of 149 — the band, its Close, and 142 again`, async () => {
      const k = `${tag}-own`
      if ((await state(s)).barMark?.startsWith('149')) { await go(s, 'viewsched'); await pick(s, '142'); await shutMenu(s) }
      await go(s, 'leavewar'); await page.waitForTimeout(1500); await shutMenu(s)
      let o = await personWindow(s, pid); facts[`${k}-opened`] = o; await pic(s, `${k}-01-open`)
      if (!o.ok) { check(`${k}: premise — his window opened`, false, o); return }
      let p = await pickWithWindow(s, '149', `${k}-02`); facts[`${k}-pick`] = p
      if (!p.pressed) { await pic(s, `${k}-02-pick-covered`); facts[`${k}-result`] = `NOT WALKED: covered by ${p.cover}`; await closeX(s); return }
      let st = await rec(s, `${k}-b-held`); let w = await anyWin(s); await pic(s, `${k}-02-held`)
      check(`${k}: the page held on the Leave War`, st.page === 'page-leavewar', st.page)
      check(`${k}: the window in sight with the band "${BAND('142', '149')}"`, !!w && norm(w.band) === BAND('142', '149'), w && w.band)
      check(`${k}: its controls greyed (held parts)`, !!w && w.held > 0, w && w.held)
      check(`${k}: the band has its Close`, !!w && w.bandClose, w && w.bandClose)
      check(`${k}: ✕ live (reached by a press)`, (await over(s, T('pw-close'))) === 'self', await over(s, T('pw-close')))
      /* the band's Close */
      const bc = page.locator('.moveband button').filter({ visible: true }).first()
      await press(s, bc, `${k}-03-band-close`); await page.waitForTimeout(600)
      st = await rec(s, `${k}-c-after-band-close`); await pic(s, `${k}-03-after-band-close`)
      check(`${k}: the band's Close → 149's View-only Sched, two pages`, st.page === 'page-viewsched' && st.barMark?.startsWith('149') && pagesOffered(st).length === 2, { page: st.page, mark: st.barMark, pages: pagesOffered(st) })
      check(`${k}: no window left`, (await wins(s)).length === 0, await wins(s))
      /* again: held by the pick, then 142 picked again → the window back live */
      await go(s, 'viewsched'); await pick(s, '142'); await shutMenu(s)
      await go(s, 'leavewar'); await page.waitForTimeout(1500); await shutMenu(s)
      o = await personWindow(s, pid); p = await pickWithWindow(s, '149')
      w = await anyWin(s); check(`${k}: (again) held with the band`, !!w && !!w.band, w)
      p = await pickWithWindow(s, '142', `${k}-04`)
      st = await rec(s, `${k}-d-142-again`); w = await anyWin(s); await pic(s, `${k}-04-142-again`)
      check(`${k}: 142 picked again → the window back live (no band, nothing greyed)`, !!w && !w.band && w.held === 0, w)
      check(`${k}: 142 picked again → still the Leave War, 142`, st.page === 'page-leavewar' && st.barMark?.startsWith('142'), { page: st.page, mark: st.barMark })
      /* and closed by its ✕ (and Escape on the desktop) while held */
      for (const by of s.desk ? ['x', 'esc'] : ['x']) {
        if (!(await wins(s)).length) o = await personWindow(s, pid)
        await pickWithWindow(s, '149')
        w = await anyWin(s); check(`${k}: (${by}) held before closing`, !!w && !!w.band, w && w.band)
        if (by === 'x') await closeX(s, `${k}-05-${by}`); else { await page.keyboard.press('Escape'); await page.waitForTimeout(600) }
        await page.waitForTimeout(500)
        st = await rec(s, `${k}-e-${by}`); await pic(s, `${k}-05-after-${by}`)
        check(`${k}: closed by ${by} while held → 149's View-only Sched`, st.page === 'page-viewsched' && st.barMark?.startsWith('149'), { page: st.page, mark: st.barMark })
        await go(s, 'viewsched'); await pick(s, '142'); await shutMenu(s); await go(s, 'leavewar'); await page.waitForTimeout(1200); await shutMenu(s)
      }
    })
  }
  await as(s, 'us', 'us')
  await bRound('Ranger', 'bane', 'b-ranger')
  await as(s, 'ad', 'a')
  await step('Hunter given View of 149 (from Plan)', async () => { await grant(s, 'prowler', '149', 'view'); await go(s, 'viewsched'); await shutMenu(s) })
  await as(s, 'ad2', 'a2')
  await bRound('Hunter', 'prowler', 'b-hunterview')
  await s.ctx.close()
} finally { finish('r-war-' + SZ); await stop() }
