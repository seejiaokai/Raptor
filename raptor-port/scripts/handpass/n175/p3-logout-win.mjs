// p3-logout-win - P3 cases 4 and 5, at the desktop (d): Logout pressed over a window that holds typing.
//   holiday - Inputs → gear → Calendar… → Holidays → + Add, a holiday's name typed (no question of its own)
//   bid     - Leave War, December, a cell of 15 Dec pressed (Place a bid), a leave chosen in it where one is offered
//   oil     - the day's OIL list (raised by a holiday saved over an earning input), one answer chosen, not saved
//   trk     - Tracker, an event pressed (the marking window), Edit details, words typed in its first box
//   input   - case 5: an Input window with words typed in Remarks and NO unsaved chart edits
//   admin   - case 5 (N5): Admin → Users, a row opened, words typed in its sign-in box
// Each: is Logout reachable at its middle (or under the window's shade)? Pressed where reachable: is anything asked (its
// words and answers), is he signed out, did the page reload, are the typed words anywhere in the browser's storage after?
// SET-UP (oil only, named): an earning Training input is filed for two free men on Fri 17 Jul 2026 through the Inputs
// calendar's day and its + Input (chat 103's isr-A-lib fileOn way, by presses), and the holiday is added over it by
// presses; the page is moved between pages by the app's own window.go where that set-up needs it.
//   node raptor-port/scripts/handpass/n175/p3-logout-win.mjs d     (ONLY=holiday,bid,oil,trk,input,admin)
// Pictures (deciding): p3-logout-<case>-d-1-open (Logout ringed), p3-logout-<case>-d-2-after (each with -crop).
import { mk, closeAll, FACT, signIn, go, wait, windowsNow, decide, scratch, hit, vis, boxOf, covered, typeWords, openInput, openPlaceBid, tid } from './p3-lib.mjs'
const SZ = process.argv[2] || 'd'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const W = 'N175P3LW words'

/* the set-up helpers for the OIL list - isr-A-lib's (scripts/handpass/isr-A-lib.mjs), copied so no second browser opens */
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const pr = async (s, loc) => { const l = (typeof loc === 'string' ? s.page.locator(loc) : loc).first(); await l.click(); await wait(s, 150) }
async function incalMonth(s, y, m) { for (let i = 0; i < 80; i++) { const [name, year] = (await s.page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/); const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.indexOf(name.slice(0, 3))); if (!d) { await wait(s, 350); return } await pr(s, d > 0 ? '#icNext' : '#icPrev'); await wait(s, 300) } throw new Error('Inputs calendar never reached the month') }
async function fileTraining(s, iso, people) {
  await go(s, 'inputs'); if (await s.page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await pr(s, '#inCalBtn')
  await incalMonth(s, +iso.slice(0, 4), +iso.slice(5, 7))
  await s.page.locator(`#inpCal [data-icday="${iso}"]`).focus(); await s.page.keyboard.press('Enter'); await s.page.locator(tid('win-inputsday')).waitFor(); await wait(s, 300)
  await pr(s, '#icPopAdd'); await s.page.locator('#inpEditPop #inpEditType').waitFor()
  await s.page.selectOption('#inpEditPop #inpEditType', 'Training')
  await pr(s, '#inpEditPop [data-testid="pp-several"]')
  for (const id of people) if ((await s.page.locator(`#inpEditPop [data-pp="${id}"]`).getAttribute('aria-pressed')) !== 'true') await pr(s, `#inpEditPop [data-pp="${id}"]`)
  const lit = await s.page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
  for (const id of lit) if (!people.includes(id)) await pr(s, `#inpEditPop [data-pp="${id}"]`)
  const ad = s.page.locator('#inpEditPop #inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.click()
  await s.page.fill('#inpEditPop #inpEditStart', '09:00'); await s.page.fill('#inpEditPop #inpEditEnd', '12:00')
  if (await s.page.locator('#inpEditPop #inpEditOwnTitle').count()) await s.page.fill('#inpEditPop #inpEditOwnTitle', 'Range brief')
  await pr(s, '#inpEditSave'); await wait(s, 400)
  if (await s.page.locator(tid('oilconf')).count()) { await pr(s, (await s.page.locator(tid('oil-all')).count()) ? tid('oil-all') : tid('oil-yes')); await pr(s, tid('oilconf-save')); await wait(s, 300) }
  if (await s.page.locator(tid('docconf-nodoc')).count()) { await pr(s, tid('docconf-nodoc')); await wait(s, 300) }
  if (await s.page.locator(tid('win-inputsday-x')).count()) await pr(s, tid('win-inputsday-x'))
}
const freeMen = s => s.page.evaluate(() => { const P = window.PEOPLE, D = window.DAYS, days = [4]; return Object.keys(P).filter(id => !P[id].special && !P[id].pers && !P[id].archived && !P[id].san && days.every(d => !JSON.stringify(D[d]).includes(`"${id}"`)) && !window.INPUTS.some(r => JSON.stringify(r).includes(`"${id}"`) && days.some(d => window.inputCoversDate(r, D[d].dt)))).slice(0, 2) })

const CASES = {
  holiday: { what: 'Calendar window, Holidays, + Add, a holiday name typed', open: async s => { await go(s, 'inputs'); await hit(s, '#inGear', 500); await hit(s, tid('iset-days'), 700); if (await vis(s, tid('days-tab-holidays')).count()) await hit(s, tid('days-tab-holidays')); await hit(s, tid('hol-add'), 500); return { typed: await typeWords(s, tid('hol-name'), W) } } },
  bid: { what: 'Leave War Place a bid (15 Dec), AM chosen, no leave pressed yet', open: async s => {
    await openPlaceBid(s)
    const ws = await windowsNow(s); FACT(`P3.logout.${SZ}.bid.window`, ws.map(w => ({ what: w.what, words: w.words.slice(0, 140), buttons: w.buttons })))
    /* a choice in the bid that does not place it: "AM" (part of the day). A press on a leave button (LL, OL ...) places
       the bid at once and closes the window (found in this script's earlier run), so the bid "being placed" is the window
       with its part of the day chosen and no leave pressed yet */
    const pick = await s.page.evaluate(() => { const w = [...document.querySelectorAll('.bidsheet, .lwday, [role=dialog]')].find(e => e.getBoundingClientRect().width > 0); if (!w) return null; const b = [...w.querySelectorAll('button')].find(x => x.getBoundingClientRect().width > 0 && !x.disabled && x.textContent.trim() === 'AM'); if (!b) return null; b.setAttribute('data-n175pick', '1'); return b.textContent.replace(/\s+/g, ' ').trim() })
    if (pick) { await hit(s, '[data-n175pick]', 500); FACT(`P3.logout.${SZ}.bid.chosen`, pick); FACT(`P3.logout.${SZ}.bid.windowAfterChoice`, (await windowsNow(s)).map(w => ({ words: w.words.slice(0, 160), buttons: w.buttons }))) } else FACT(`P3.logout.${SZ}.bid.chosen`, 'no choice button found in the window')
    return { typed: pick }
  } },
  bidll: { what: 'Leave War Place a bid (15 Dec), its first leave button (LL) pressed', open: async s => {
    await openPlaceBid(s)
    const b = s.page.locator('.bidsheet button').filter({ hasText: /^LL/ }).first()
    const label = (await b.innerText()).replace(/\s+/g, ' ').trim()
    await hit(s, b, 900)
    FACT(`P3.logout.${SZ}.bidll.afterLeavePress`, { pressed: label, windows: (await windowsNow(s)).map(w => w.what), note: await s.page.evaluate(() => { const t = document.getElementById('toastEl'); return t && getComputedStyle(t).opacity !== '0' ? t.textContent.replace(/\s+/g, ' ').trim() : null }), cell: await s.page.evaluate(() => { const c = document.querySelector('[data-testid^="cell-"][data-testid$="-2026-12-15"]'); return c ? c.innerText.replace(/\s+/g, ' ').trim().slice(0, 40) : null }) })
    return { typed: label + ' pressed' }
  } },
  oil: { what: "the day's OIL list, one answer chosen, not saved", open: async s => {
    const men = await freeMen(s); FACT(`P3.logout.${SZ}.oil.setup.men`, men)
    await fileTraining(s, '2026-07-17', men)
    await go(s, 'inputs'); await hit(s, '#inGear', 500); await hit(s, tid('iset-days'), 700)
    if (await vis(s, tid('days-tab-holidays')).count()) await hit(s, tid('days-tab-holidays'))
    await hit(s, tid('hol-add'), 400); if (await vis(s, tid('hol-kind-ph')).count()) await hit(s, tid('hol-kind-ph'))
    await typeWords(s, tid('hol-name'), 'N175 Day')
    for (let i = 0; i < 14 && !(await s.page.locator(tid('holcal-day-2026-07-17')).count()); i++) await hit(s, tid('holcal-prev'), 200)
    for (let i = 0; i < 40 && !(await s.page.locator(tid('holcal-day-2026-07-17')).count()); i++) await hit(s, tid('holcal-next'), 200)
    await hit(s, tid('holcal-day-2026-07-17'), 300); await hit(s, tid('hol-save'), 900)
    if (!(await vis(s, tid('win-oilday')).count())) throw new Error("the day's OIL list did not open on the holiday's Save")
    FACT(`P3.logout.${SZ}.oil.listOpened`, (await s.page.locator(tid('win-oilday')).innerText()).replace(/\s+/g, ' ').trim().slice(0, 200))
    const y = vis(s, '[data-testid^="odl-yes-"]').first(); await hit(s, y, 400)
    FACT(`P3.logout.${SZ}.oil.chosen`, { count: await s.page.locator(tid('odl-count')).innerText().catch(() => null), saveLive: await s.page.locator(tid('odl-save')).isEnabled().catch(() => null) })
    return { typed: 'Yes chosen on one input' }
  } },
  trk: { what: 'Tracker marking window, Edit details, words typed', open: async s => {
    await go(s, 'tracker'); await s.page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 600)
    const id = await s.page.evaluate(() => { for (const g of document.querySelectorAll('#flowSvg .ball')) { const r = g.getBoundingClientRect(); if (r.width < 4) continue; const cx = r.left + r.width / 2, cy = r.top + r.height / 2; if (cx < 10 || cy < 140 || cx > innerWidth - 10 || cy > innerHeight - 60) continue; const at = document.elementFromPoint(cx, cy); if (at && g.contains(at)) return g.dataset.id } return null })
    const b = await s.page.locator(`#flowSvg .ball[data-id="${id}"]`).first().boundingBox(); await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await wait(s, 700)
    FACT(`P3.logout.${SZ}.trk.markingWindowBoxes`, await s.page.evaluate(() => { const p = document.querySelector('#pop'); return p ? [...p.querySelectorAll('textarea, input:not([type=hidden]), [contenteditable=true]')].filter(e => e.getBoundingClientRect().width > 0).length : 'no window' }))
    await hit(s, vis(s, '#pop button').filter({ hasText: /Edit details/ }).first(), 700)
    const box = await s.page.evaluate(() => { const ws = [...document.querySelectorAll('#pop, [role=dialog], .modal, #dlgModal')].filter(e => e.getBoundingClientRect().width > 0); for (const w of ws) { const e = [...w.querySelectorAll('textarea, input[type=text], input:not([type]), [contenteditable=true]')].find(x => x.getBoundingClientRect().width > 0); if (e) { e.setAttribute('data-n175box', '1'); return { in: (w.id ? '#' + w.id : '') + '.' + String(w.className).split(/\s+/)[0], tag: e.tagName, label: (e.closest('label')?.textContent || e.getAttribute('aria-label') || e.placeholder || e.previousElementSibling?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40), was: e.value ?? e.textContent } } } return null })
    FACT(`P3.logout.${SZ}.trk.box`, box)
    if (!box) return { typed: 'no box to type in' }
    if (box.tag === 'DIV' || box.tag === 'SPAN') { await s.page.locator('[data-n175box]').click(); await s.page.keyboard.press('End'); await s.page.keyboard.type(' ' + W); return { typed: 'typed after its words' } }
    const v = await s.page.locator('[data-n175box]').evaluate(e => e.value); await s.page.locator('[data-n175box]').click(); await s.page.keyboard.press('End'); await s.page.keyboard.type(' ' + W)
    return { typed: v + ' ' + W === await s.page.locator('[data-n175box]').inputValue() ? 'typed' : 'box did not take the words' }
  } },
  trkmark: { what: 'Tracker marking window open (an event pressed), nothing changed in it', open: async s => {
    await go(s, 'tracker'); await s.page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 600)
    const id = await s.page.evaluate(() => { for (const g of document.querySelectorAll('#flowSvg .ball')) { const r = g.getBoundingClientRect(); if (r.width < 4) continue; const cx = r.left + r.width / 2, cy = r.top + r.height / 2; if (cx < 10 || cy < 140 || cx > innerWidth - 10 || cy > innerHeight - 60) continue; const at = document.elementFromPoint(cx, cy); if (at && g.contains(at)) return g.dataset.id } return null })
    const b = await s.page.locator(`#flowSvg .ball[data-id="${id}"]`).first().boundingBox(); await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await wait(s, 700)
    return { typed: 'nothing typed: the marking window has no box to type in' }
  } },
  input: { what: 'Input window, words typed in Remarks, no unsaved chart edits', open: async s => ({ typed: (await openInput(s, W)).typed }) },
  admin: { what: 'Admin → Users, a row opened, words typed in its sign-in box', open: async s => {
    await go(s, 'admin'); if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back')
    const t = vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Users/ }); if (await t.count()) await hit(s, t.first(), 600)
    const r = vis(s, '#page-admin .acc-tap').first(); await r.scrollIntoViewIfNeeded(); const b = await r.boundingBox(); await s.page.mouse.click(b.x + 40, b.y + b.height / 2); await wait(s, 800)
    return { typed: await typeWords(s, '#accGiveName', W) }
  } },
}
const asked = s => s.page.evaluate(() => {
  const v = e => { const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return r.width > 1 && r.height > 1 && c.visibility !== 'hidden' && c.display !== 'none' && c.opacity !== '0' }
  const out = []
  for (const e of document.querySelectorAll('[role=alertdialog], .askcard, #dlgModal')) { if (!v(e)) continue; if (out.some(o => o.el.contains(e))) continue; out.push({ el: e, words: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200), buttons: [...e.querySelectorAll('button')].filter(v).map(b => b.textContent.trim()) }) }
  return out.map(({ words, buttons }) => ({ words, buttons }))
})
const storedWith = (s, w) => s.page.evaluate(w => { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if ((localStorage.getItem(k) || '').includes(w)) out.push(k) } return out }, w).catch(() => 'page gone')
async function one(key) {
  const C = CASES[key], k = `P3.logout.${SZ}.${key}`, P = `p3-logout-${key}-${SZ}`
  const s = await mk(SZ); let loads = 0; s.page.on('load', () => { loads++ })
  try {
    await signIn(s, 'ad', 'a'); loads = 0
    FACT(`${k}.case`, C.what)
    let r; try { r = await C.open(s) } catch (e) { FACT(`${k}.opened`, 'could not open by presses: ' + String(e).split('\n')[0].slice(0, 160)); await scratch(s, `logout-${key}-${SZ}-failed-open`); return }
    FACT(`${k}.typed`, r?.typed ?? null)
    FACT(`${k}.windows`, (await windowsNow(s)).map(w => ({ what: w.what, words: w.words.slice(0, 100), buttons: w.buttons.slice(0, 10) })))
    const lb = await boxOf(s, '#logout')
    const at = lb ? await covered(s, '#logout') : 'not drawn'
    FACT(`${k}.logoutAt`, at)
    await decide(s, `${P}-1-open`, ['#logout'], ['#logout', '.floatwin, .bidsheet, #pop, [role=dialog], .modal'])
    if (at !== 'free') { FACT(`${k}.logoutPressed`, 'no - not reachable at its middle'); return }
    await s.page.mouse.click(lb.x + lb.w / 2, lb.y + lb.h / 2); await wait(s, 1800)
    const q = await asked(s)
    const signedOut = await s.page.evaluate(() => { const f = document.querySelector('#loginForm'); return !!f && f.getBoundingClientRect().width > 0 }).catch(() => 'page gone')
    FACT(`${k}.afterLogout`, { asked: q, signedOut, pageReloaded: loads > 0, windows: signedOut === true ? [] : (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 100)), typedWordsInStorage: await storedWith(s, W) })
    await decide(s, `${P}-2-after`, q.length ? ['[role=alertdialog], .askcard, #dlgModal'] : (signedOut === true ? ['#loginForm'] : ['#logout']), null)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p3-logout-win v1', SZ)
  for (const key of (ONLY.length ? ONLY : Object.keys(CASES))) await one(key)
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
