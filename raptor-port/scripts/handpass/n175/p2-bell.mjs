// p2-bell - P2 cases 2-5: the bell. SET-UP by presses (p2-bell-setup.mjs: Hunter has Plan of 149, Ranger View of 149;
// a Duty input each on 142, Tue 8 Dec 2026 = state A; then 8 Dec made a public holiday on 142 and its OIL list left with
// "Later" = state B, so both inputs hold an unanswered OIL question). Each case in its own fresh browser with that
// saved data copied in. What the screen said is read; which saved record a write touched is read from the browser's
// storage before and after (the keys that changed).
//   line   (case 2; C5, F4, A41) Hunter on 149, no window, his bell's 142 line "8 Dec" pressed - the line's look before and
//          after, the list open or closed; then back on 149 the same line (now read) pressed again.          state A
//   tap    (case 3; H7, C4, F58) a tap on the bell itself: Ranger (member) and Hunter (142 admin) with an OIL question
//          waiting, on 142 - nothing open, and an Input window open (Drifter's / his own input).             state B
//   access (case 3) the access alert: a name on no list asks for access to 149 (sign-in card, "Request access"); Saber on
//          142 taps the bell - nothing open, and an Input window open with words typed.                   state C
//   oil    (case 4; C1, F1, A1) Ranger on 149 (View) and Hunter on 149 (Plan) tap the bell with their 142 OIL question
//          waiting: what opens, what the bar says, whether Save / Delete / the OIL answer are live; the answer pressed
//          and Save - which squadron's record changed. Also: Hunter opens 142's OIL list (the bell's holiday line), then
//          picks 149.                                                                                          state B
//   own    (case 5; C8, F18) Ranger on 149 (View only), his bell's 142 line pressed - with no window, and with the
//          Changes window of View-only Sched open.                                                             state A
//   node raptor-port/scripts/handpass/n175/p2-bell.mjs <d|p>     (ONLY=line,tap,access,oil,own)
// Pictures: p2-bell-<case>-<d|p>-<what>.png
import { writeFileSync } from 'node:fs'
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, shot, scratch, reachPick, barSq, pageOn, windowsNow, roleNow, toastNow, bands, covered, boxOf, tmpDir } from './lib.mjs'
import { setupBell } from './p2-bell-setup.mjs'
const SZ = process.argv[2] || 'd'; const SEC = 'p2'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const TMP = tmpDir(SEC)
const via = s => (s.desk ? 'bar' : 'menu')
const BELL = '#notifyBell, .bellbtn'
const LIST = '[data-testid="bell-list"]'
async function tapBell(s) {
  const c = await covered(s, BELL)
  if (c !== 'free') return { covered: c }
  const b = await boxOf(s, BELL); if (s.desk) await s.page.mouse.click(b.x + b.w / 2, b.y + b.h / 2); else await s.page.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2)
  await wait(s, 800); return { covered: 'free', pressed: true }
}
const bellState = s => s.page.evaluate(() => { const b = [...document.querySelectorAll('#notifyBell, .bellbtn')].find(e => e.getBoundingClientRect().width > 0); return b ? { lit: b.classList.contains('on') } : null })
const lines = s => s.page.evaluate(l => [...document.querySelectorAll(l + ' .bl-line')].filter(e => e.getBoundingClientRect().height > 0).map(e => (e.classList.contains('unread') ? '[unread] ' : '[read] ') + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 90)), LIST)
const listOpen = s => s.page.evaluate(l => !!([...document.querySelectorAll(l)].find(e => e.getBoundingClientRect().height > 0)), LIST)
const winFacts = async s => (await windowsNow(s)).map(w => ({ what: w.what, words: w.words.slice(0, 150), inert: w.inert, buttons: w.buttons }))
/* the input window's own controls: live or greyed */
const inpCtl = s => s.page.evaluate(() => { const r = {}; for (const id of ['inpEditSave', 'inpEditDel', 'inpEditRmk', 'inpEditCancel', 'inpEditClose']) { const e = [...document.querySelectorAll('#' + id)].find(x => x.getBoundingClientRect().width > 0); r[id] = e ? (e.disabled || e.readOnly ? 'greyed' : 'live') : 'not drawn' } const pop = [...document.querySelectorAll('.airpop.upconf-pop')].find(x => x.getBoundingClientRect().width > 0); r.oilQuestion = pop ? pop.innerText.replace(/\s+/g, ' ').trim().slice(0, 200) + ' || ' + [...pop.querySelectorAll('button')].map(b => b.textContent.trim() + (b.disabled ? ' [greyed]' : '')).join(' / ') : null; return r })
const snap = s => s.page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k) } return o })
/* the keys a write changed; an input's record shown by its own fields (whose, the day, its squadron stamp where it has
   one - a 142 input carries none, the home squadron's - and its OIL answer) */
const changed = (a, b) => Object.keys({ ...a, ...b }).filter(k => a[k] !== b[k] && !/seen|view|ui|pref|last|sess/i.test(k)).map(k => {
  if (!/^raptor:inputs\//.test(k)) return k
  try { const r = JSON.parse(b[k] || 'null') || {}; return `${k} {person:${r.person}, date:${r.date}, unit:${r.u ?? r.unit ?? '(none)'}, oil:${JSON.stringify(r.oil ?? null)}}` } catch { return k }
})
async function lineByText(s, re) { const l = s.page.locator(`${LIST} .bl-line`).filter({ hasText: re }).filter({ visible: true }).first(); return (await l.count()) ? l : null }
async function pressLoc(s, l) { await l.scrollIntoViewIfNeeded().catch(() => {}); const b = await l.boundingBox(); if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await wait(s, 1000) }
const after = async s => ({ squadron: await barSq(s), page: await pageOn(s), role: (await roleNow(s)).badge, toast: await toastNow(s), listOpen: await listOpen(s), bell: await bellState(s), bands: await bands(s) })

async function caseLine(st) {
  const k = `p2.bell.line.${SZ}`, P = `p2-bell-line-${SZ}`
  const s = await mk(SZ, { storageState: st.A })
  try {
    await signIn(s, 'ad2', 'a2')
    FACT(`${k}.pick149`, (await reachPick(s, 149, via(s))).pressed); FACT(`${k}.squadron`, await barSq(s))
    FACT(`${k}.bellBefore`, await bellState(s))
    FACT(`${k}.tap`, await tapBell(s)); FACT(`${k}.linesBefore`, await lines(s))
    const l = await lineByText(s, /8 Dec/); if (!l) { FACT(`${k}.line`, 'no 8 Dec line'); await scratch(s, SEC, P + '-noline'); return }
    await l.evaluate(e => e.setAttribute('data-n175line', '1'))
    await shot(s, `${P}-1-before`, ['[data-n175line]'], [LIST], 16)
    await pressLoc(s, l)
    FACT(`${k}.afterPress`, await after(s)); FACT(`${k}.afterPress.windows`, await winFacts(s))
    await scratch(s, SEC, `${P}-2-after-press`)
    /* the line's look now: the bell's list opened again (the window first closed with its own Cancel/✕ if it covers the bell) */
    if ((await covered(s, BELL)) !== 'free') { const c = vis(s, '#inpEditCancel, #inpEditClose').first(); if (await c.count()) { await hit(s, c, 500); FACT(`${k}.closedWindowWith`, 'its own Cancel/✕') } }
    FACT(`${k}.tap2`, await tapBell(s)); FACT(`${k}.linesAfter`, await lines(s))
    const l2 = await lineByText(s, /8 Dec/)
    if (l2) { await l2.evaluate(e => e.setAttribute('data-n175line', '2')); await shot(s, `${P}-3-line-after`, ['[data-n175line="2"]'], [LIST], 16) }
    /* back to 149, the now-read line pressed again */
    if (await listOpen(s)) await s.page.keyboard.press('Escape').catch(() => {})
    await reachPick(s, 149, via(s)); FACT(`${k}.again.squadron`, await barSq(s))
    await tapBell(s); FACT(`${k}.again.lines`, await lines(s))
    const l3 = await lineByText(s, /8 Dec/)
    if (l3) { await pressLoc(s, l3); FACT(`${k}.again.afterPress`, await after(s)); FACT(`${k}.again.windows`, (await winFacts(s)).map(w => w.what + ': ' + w.words.slice(0, 80))) }
    await scratch(s, SEC, `${P}-4-again`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
async function openInputRow(s, re) {
  await go(s, 'inputs'); await wait(s, 600)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  if (!/All dates/.test((await s.page.locator('#inRangeBtn').first().textContent().catch(() => '')) || '')) { await hit(s, '#inRangeBtn'); if (await s.page.locator('#inRangeAll').count()) await hit(s, s.page.locator('#inRangeAll').first()); if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn') }
  const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').filter({ hasText: re }).first()
  const txt = (await row.innerText({ timeout: 6000 })).replace(/\s+/g, ' ').slice(0, 50)
  const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 800)
  return txt
}
async function typeRmk(s, w) { const r = vis(s, '#inpEditRmk').first(); if (!(await r.count())) return null; if (s.desk) { await r.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type(w) } else await r.evaluate((e, w) => { const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'value').set; set.call(e, w); e.dispatchEvent(new Event('input', { bubbles: true })) }, w); await wait(s, 300); return r.inputValue() }
async function caseTap(st) {
  for (const [who, user, pass] of [['ranger', 'us', 'us'], ['hunter', 'ad2', 'a2']]) for (const win of ['none', 'input']) {
    const k = `p2.bell.tap.${SZ}.${who}.${win}`, P = `p2-bell-tap-${SZ}-${who}-${win}`
    const s = await mk(SZ, { storageState: st.B })
    try {
      await signIn(s, user, pass)
      FACT(`${k}.squadron`, await barSq(s)); FACT(`${k}.bellBefore`, await bellState(s))
      if (win === 'input') { FACT(`${k}.opened`, await openInputRow(s, /Drifter|Ranger/)); FACT(`${k}.typed`, await typeRmk(s, 'N175 tap words')) }
      FACT(`${k}.bellCovered`, await covered(s, BELL))
      FACT(`${k}.tap`, await tapBell(s))
      FACT(`${k}.after`, await after(s)); FACT(`${k}.windows`, await winFacts(s)); FACT(`${k}.inputCtl`, await inpCtl(s)); FACT(`${k}.lines`, await lines(s))
      if (win === 'input') FACT(`${k}.typedWordsKept`, await s.page.evaluate(() => [...document.querySelectorAll('textarea, input')].filter(e => e.value === 'N175 tap words').map(e => e.id + (e.getBoundingClientRect().width > 0 ? '' : ' (hidden)'))))
      const ring = (await vis(s, '.airpop.upconf-pop').count()) ? '.airpop.upconf-pop' : (await listOpen(s)) ? LIST : BELL
      await shot(s, `${P}-after`, [BELL, ring], [BELL, ring], 24)
    } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
  }
}
async function setupAccess() {
  const s = await mk('d'); const { page } = s
  await page.goto('http://localhost:4700/'); await page.waitForSelector('#luser')
  await page.fill('#luser', 'n175ask'); await page.fill('#lpass', 'x'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#accForm', { timeout: 15000 })
  await page.selectOption('#accSqn', { label: '149' }); await page.fill('#accCs', 'Asker'); await page.selectOption('#accSeat', { label: 'Pilot' })
  const cat = await page.evaluate(() => [...document.querySelector('#accCat').options].map(o => o.value).find(v => v)); await page.selectOption('#accCat', cat)
  await hit(s, '#accSend', 900); FACT(`p2.bell.access.setup.sent`, (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 60))
  await hit(s, '#accOut', 900)
  const C = `${TMP}/bell-state-C.json`; writeFileSync(C, JSON.stringify(await s.ctx.storageState())); await s.ctx.close(); return C
}
async function caseAccess() {
  const C = await setupAccess()
  for (const win of ['none', 'input']) {
    const k = `p2.bell.access.${SZ}.${win}`, P = `p2-bell-access-${SZ}-${win}`
    const s = await mk(SZ, { storageState: C })
    try {
      await signIn(s, 'ad', 'a')
      FACT(`${k}.squadron`, await barSq(s)); FACT(`${k}.bellAtSignIn`, await bellState(s))
      /* 149 switched on in the bell's "Show" (the list's own chips), as F58's set-up has it; the list closed with Escape */
      if (!(await bellState(s))?.lit) {
        await tapBell(s)
        const chips = () => s.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-show"] button')].map(b => b.textContent.trim() + (b.getAttribute('aria-pressed') === 'true' ? ' on' : ' off')))
        FACT(`${k}.showChips`, await chips())
        const c149 = vis(s, '[data-testid="bell-show"] button[aria-pressed="false"]').filter({ hasText: /^149$/ }).first()
        if (await c149.count()) { await hit(s, c149, 400); FACT(`${k}.showChipsAfter`, await chips()) }
        await s.page.keyboard.press('Escape'); await wait(s, 300)
        if (await listOpen(s)) { await s.page.mouse.click(5, s.H - 5).catch(() => {}); await wait(s, 300) }
        FACT(`${k}.bellAfterShow`, await bellState(s))
      }
      if (win === 'input') { FACT(`${k}.opened`, await openInputRow(s, /Drifter/)); FACT(`${k}.typed`, await typeRmk(s, 'N175 access words')) }
      FACT(`${k}.bellBefore`, await bellState(s))
      FACT(`${k}.bellCovered`, await covered(s, BELL))
      FACT(`${k}.tap`, await tapBell(s))
      FACT(`${k}.after`, await after(s)); FACT(`${k}.windows`, (await winFacts(s)).map(w => w.what + ': ' + w.words.slice(0, 100) + (w.inert ? ' [inert]' : '')))
      FACT(`${k}.lines`, await lines(s))
      if (win === 'input') FACT(`${k}.typedWordsKept`, await s.page.evaluate(() => [...document.querySelectorAll('textarea, input')].filter(e => e.value === 'N175 access words').map(e => e.id + (e.getBoundingClientRect().width > 0 ? '' : ' (hidden)'))))
      FACT(`${k}.waitingOnPage`, await s.page.evaluate(() => (document.querySelector('.page.on')?.innerText || '').replace(/\s+/g, ' ').match(/WAITING FOR ACCESS.{0,80}/)?.[0] ?? null))
      await shot(s, `${P}-after`, [s.desk ? '#sqnMenuBtn' : '.topbar .mark', '[data-approve], .inpedwin'], null, 30)
    } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
  }
}
async function caseOil(st) {
  for (const [who, user, pass] of [['ranger', 'us', 'us'], ['hunter', 'ad2', 'a2']]) {
    const k = `p2.bell.oil.${SZ}.${who}`, P = `p2-bell-oil-${SZ}-${who}`
    const s = await mk(SZ, { storageState: st.B })
    try {
      await signIn(s, user, pass)
      const p = await reachPick(s, 149, via(s)); FACT(`${k}.pick149`, { pressed: !!p.pressed, rows: p.listRows, squadron: await barSq(s), page: await pageOn(s) })
      FACT(`${k}.bellBefore`, await bellState(s))
      FACT(`${k}.tap`, await tapBell(s))
      FACT(`${k}.after`, await after(s)); FACT(`${k}.windows`, await winFacts(s)); FACT(`${k}.inputCtl`, await inpCtl(s)); FACT(`${k}.lines`, await lines(s))
      const ring = (await vis(s, '.airpop.upconf-pop').count()) ? '.airpop.upconf-pop' : (await vis(s, '.inpedwin').count()) ? '.inpedwin' : LIST
      await shot(s, `${P}-1-after-tap`, [s.desk ? '#sqnMenuBtn' : '.topbar .mark', ring], null, 24)
      /* the OIL answer, as he presses it; then Save */
      const yes = vis(s, '.airpop.upconf-pop button').filter({ hasText: /^Yes/ }).first()
      if (await yes.count()) {
        const before = await snap(s)
        await hit(s, yes, 500)
        const add = vis(s, '.airpop.upconf-pop button').filter({ hasText: /^(Add|Save|OK|Done)$/ }).first(); if (await add.count() && !(await add.isDisabled())) await hit(s, add, 500)
        FACT(`${k}.afterYes`, { squadron: await barSq(s), toast: await toastNow(s), ctl: await inpCtl(s) })
        if (await vis(s, '#inpEditSave').count() && !(await vis(s, '#inpEditSave').first().isDisabled())) { await hit(s, '#inpEditSave', 800); for (let i = 0; i < 2; i++) { const nd = vis(s, 'button').filter({ hasText: /^No document$/ }); if (await nd.count()) await hit(s, nd.first()); if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk') } FACT(`${k}.savePressed`, true) }
        await wait(s, 800)
        const a = await snap(s)
        FACT(`${k}.storageChanged`, changed(before, a))
        FACT(`${k}.afterSave`, { ...(await after(s)), windows: (await winFacts(s)).map(w => w.what) })
        await scratch(s, SEC, `${P}-2-after-answer`)
      } else FACT(`${k}.oilAnswer`, 'no OIL question drawn to answer')
    } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
  }
  /* Hunter: 142's OIL list opened from the bell's holiday line, then 149 picked */
  const k = `p2.bell.oil.${SZ}.hunterList`, P = `p2-bell-oil-${SZ}-hunter-list`
  const s = await mk(SZ, { storageState: st.B })
  try {
    await signIn(s, 'ad2', 'a2'); FACT(`${k}.squadron`, await barSq(s))
    await tapBell(s); FACT(`${k}.lines`, await lines(s))
    const hl = await lineByText(s, /N175 Day|holiday/i)
    if (!hl) { FACT(`${k}.holidayLine`, 'none'); return }
    await pressLoc(s, hl); FACT(`${k}.listWindows`, (await winFacts(s)).map(w => w.what + ': ' + w.words.slice(0, 120)))
    const p = await reachPick(s, 149, via(s)); FACT(`${k}.pick`, p)
    FACT(`${k}.afterPick`, await after(s)); FACT(`${k}.afterPick.windows`, await winFacts(s))
    await shot(s, `${P}-after-pick`, [s.desk ? '#sqnMenuBtn' : '.topbar .mark', '[data-testid="odl-count"]'], null, 30)
    /* a row of the list pressed, if the list still stands: what opens */
    const row = vis(s, '[data-testid^="odl-yes-"]').first()
    if (await row.count()) {
      const before = await snap(s)
      await hit(s, row, 400); const sv = vis(s, '[data-testid="odl-save"]').first(); if (await sv.count() && !(await sv.isDisabled())) await hit(s, sv, 800)
      FACT(`${k}.answeredOnList`, { squadron: await barSq(s), toast: await toastNow(s), storageChanged: changed(before, await snap(s)) })
    }
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
async function caseOwn(st) {
  for (const win of ['none', 'changes', 'dayinfo']) {
    const k = `p2.bell.own.${SZ}.${win}`, P = `p2-bell-own-${SZ}-${win}`
    const s = await mk(SZ, { storageState: st.A })
    try {
      await signIn(s, 'us', 'us')
      const p = await reachPick(s, 149, via(s)); FACT(`${k}.pick149`, { pressed: !!p.pressed, rows: p.listRows, squadron: await barSq(s), page: await pageOn(s) })
      if (win === 'changes') {
        if ((await pageOn(s)) !== 'page-viewsched') await go(s, 'viewsched')
        const hb = vis(s, '.page.on #histBtn, .page.on [data-testid*="changes"], .page.on button[aria-label*="hange"]').first()
        if (await hb.count()) { await hit(s, hb, 700) } else FACT(`${k}.changesControl`, 'none found: ' + JSON.stringify(await s.page.evaluate(() => [...document.querySelectorAll('.page.on button')].filter(b => b.getBoundingClientRect().width > 0).map(b => (b.id || '') + ' ' + (b.getAttribute('aria-label') || b.textContent.trim()).slice(0, 25)).slice(0, 25))))
        FACT(`${k}.windowOpen`, (await winFacts(s)).map(w => w.what + ': ' + w.words.slice(0, 80)))
        if (!(await windowsNow(s)).length) { FACT(`${k}.skipped`, 'no Changes window can be opened on 149 View-only Sched in the demo (no change count drawn); see the dayinfo case'); await s.ctx.close(); continue }
      }
      if (win === 'dayinfo') {
        /* the window View-only Sched does draw for him: a day's ⓘ (Day details) */
        const ib = vis(s, '.page.on button').filter({ hasText: /^i$/ }).first()
        if (await ib.count()) await hit(s, ib, 700)
        FACT(`${k}.windowOpen`, (await winFacts(s)).map(w => w.what + ': ' + w.words.slice(0, 80)))
      }
      FACT(`${k}.bellCovered`, await covered(s, BELL))
      FACT(`${k}.tap`, await tapBell(s)); FACT(`${k}.lines`, await lines(s))
      const l = await lineByText(s, /8 Dec/)
      if (!l) { FACT(`${k}.line`, 'no 8 Dec line'); await scratch(s, SEC, P + '-noline'); continue }
      await l.evaluate(e => e.setAttribute('data-n175line', '1'))
      await scratch(s, SEC, `${P}-1-list`)
      await pressLoc(s, l)
      FACT(`${k}.afterPress`, await after(s)); FACT(`${k}.afterPress.windows`, await winFacts(s)); FACT(`${k}.inputCtl`, await inpCtl(s))
      const ring = (await vis(s, '.inpedwin').count()) ? '.inpedwin' : '.page.on h1, .page.on h2'
      await shot(s, `${P}-2-after`, [s.desk ? '#sqnMenuBtn' : '.topbar .mark', ring], null, 24)
    } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
  }
}
try {
  console.log('p2-bell v1', SZ)
  const want = ONLY.length ? ONLY : ['line', 'tap', 'access', 'oil', 'own']
  const st = want.some(w => w !== 'access') ? await setupBell() : null
  if (want.includes('line')) await caseLine(st)
  if (want.includes('tap')) await caseTap(st)
  if (want.includes('access')) await caseAccess()
  if (want.includes('oil')) await caseOil(st)
  if (want.includes('own')) await caseOwn(st)
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
