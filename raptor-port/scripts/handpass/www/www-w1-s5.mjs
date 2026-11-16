/* www W1 round 2, item 4 and 5: OIL Earn routes on the phone board; the pending list, Leave War day sheet and Insights each closed every way.
   usage: [PHONE=1] node scripts/handpass/www/www-w1-s5.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's5-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w1-lib3.mjs')
const { X, say, sleep, L, nrm } = H
const size = PHONE ? '402' : '1536'
const P = PHONE ? 'p' : 'd'
const SAT = X.SAT
const w = await X.open({ phone: PHONE })
const { page } = w
const R = (did, exp, saw, v, pic) => X.row('R2-5 windows closed every way / OIL Earn route', size, did, exp, saw, v, pic)
// fixture: published Saturday, then A flight 90 so a pending list exists
await X.board(w, SAT)
await X.flight(w, SAT, '12:00', '', 'bane', { msn: 'OIL FLT' })
// --- item 4: the board's day bar buttons, read by words
const bar = await page.evaluate(() => [...document.querySelectorAll('#schedBoard button, #schedBoard [role=button]')].filter(b => b.getBoundingClientRect().width > 0 && b.getBoundingClientRect().top < 200).map(b => ({ id: b.id, aria: b.getAttribute('aria-label') || '', title: b.title || '', txt: (b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 30), x: Math.round(b.getBoundingClientRect().left), y: Math.round(b.getBoundingClientRect().top) })))
await X.pic(w, `5-1-bar-${P}`)
R('read the board day bar\'s buttons by words and aria-label', 'RECORD', JSON.stringify(bar), 'RECORDED', `5-1-bar-${P}.png`)
const tried = []
let oilOk = null
async function tryOil(name, fn) {
  try { await fn(); await sleep(700)
    const on = await page.evaluate(() => document.querySelectorAll('#schedBoard [data-oilitem]').length)
    tried.push(`${name}: ${on} OIL items`); if (on) { oilOk = oilOk || name; return true } } catch (e) { tried.push(`${name}: ${e.message.slice(0, 70)}`) }
  return false
}
await tryOil('#sbOil', () => X.press(w, '#sbOil', { after: `5-2-oil-route1-after-tap-${P}` }))
if (!oilOk) await tryOil('button by words "OIL Earn"', async () => { const b = page.locator('#schedBoard button:visible', { hasText: /OIL Earn|OIL/ }).first(); await b.scrollIntoViewIfNeeded(); if (PHONE) await b.tap(); else await b.click() })
if (!oilOk) await tryOil('aria-label /OIL/', async () => { const b = page.locator('#schedBoard [aria-label*="OIL" i]:visible').first(); if (PHONE) await b.tap(); else await b.click() })
if (!oilOk) await tryOil('the ⋯ menu then OIL', async () => { const m = page.locator('#schedBoard [id*="More"]:visible, #schedBoard button:has-text("⋯"):visible').first(); if (PHONE) await m.tap(); else await m.click(); await sleep(500); await X.pic(w, `5-3-more-${P}`); const b = page.locator('button:visible, [role=menuitem]:visible', { hasText: /OIL/ }).first(); if (PHONE) await b.tap(); else await b.click() })
await X.pic(w, `5-4-oil-${P}`)
R('tried every route to OIL Earn on the board', 'RECORD which worked', `${JSON.stringify(tried)}; worked: ${oilOk}`, 'RECORDED', `5-4-oil-${P}.png`)
if (oilOk) { await page.evaluate(() => document.querySelector('#sbOil')?.click()); await sleep(400) }
await H.signAndPublish(w, SAT); await sleep(800)
await X.closeBoard(w)
await H.logicOpen(w, true); await H.setSetting(w, 'fltLen', '90'); await H.logicDone(w)
const snap = () => page.evaluate(() => JSON.stringify([window.DAYS, window.CURPAGE, window.SBDAY]))
// a generic closer for a window found by a root finder
async function closeEvery(label, open, isOpen, closers) {
  for (const [how, fn] of closers) {
    await open(); await sleep(500)
    const before = await snap()
    const o = await isOpen()
    if (!o) { R(`${label}: opened, then closed by ${how}`, 'window opens', 'did not open', 'NOT WALKED', ''); continue }
    await page.screenshot({ path: `${X.SHOTS}/5-${label.replace(/\W+/g, '')}-open-${how}-${P}.png` })
    let err = ''
    try { await fn() } catch (e) { err = e.message.slice(0, 80) }
    await sleep(600)
    const still = await isOpen()
    const after = await snap()
    await page.screenshot({ path: `${X.SHOTS}/5-${label.replace(/\W+/g, '')}-after-${how}-${P}.png` })
    const exp = how === 'tap outside' ? 'RECORD (closes or stays)' : 'closes; the page under it as it was'
    R(`${label}: opened, closed by ${how}${err ? ' (' + err + ')' : ''}`, exp, `still open: ${still}; page under unchanged: ${before === after}`, how === 'tap outside' ? 'RECORDED' : (!still && before === after ? 'PASS' : 'FAIL'), `5-${label.replace(/\W+/g, '')}-after-${how}-${P}.png`)
    if (still) { await page.keyboard.press('Escape').catch(() => {}); await sleep(300) }
  }
}
const outside = async () => { const vp = page.viewportSize(); if (PHONE) await page.touchscreen.tap(6, vp.height - 6); else await page.mouse.click(6, vp.height - 6) }
// --- pending list (board)
await X.board(w, SAT)
const plOpen = () => X.press(w, '[data-pendlist]', { scope: 'board' })
const plIs = () => page.evaluate(() => !![...document.querySelectorAll('.pl-head')].find(e => e.getBoundingClientRect().width > 0))
const plClose = async () => { const b = await page.evaluateHandle(() => { const t = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /Waiting to go out as/.test(e.textContent) && e.getBoundingClientRect().width > 0); let p = t; for (let i = 0; i < 12 && p; i++, p = p.parentElement) { const c = [...p.querySelectorAll('button, [role=button]')].find(x => /^(✕|×|Close|Done)$/.test((x.innerText || '').trim()) || /close/i.test(x.getAttribute('aria-label') || '')); if (c && c.getBoundingClientRect().width > 0) return c } return null }); const el = b.asElement(); if (!el) throw new Error('no close control found'); if (PHONE) await el.tap(); else await el.click() }
await closeEvery('pending list', async () => { if (!(await plIs())) await plOpen() }, plIs, [['its ✕', async () => { const box = await page.evaluateHandle(() => { const h = document.querySelector('.pl-head'); let p = h; for (let i = 0; i < 10 && p; i++, p = p.parentElement) { const c = [...p.querySelectorAll('button')].find(x => /close/i.test(x.getAttribute('aria-label') || x.title || '') || /^(✕|×)$/.test((x.innerText || '').trim())); if (c) return c } return null }); const el = box.asElement(); if (!el) throw new Error('no close control'); if (PHONE) await el.tap(); else await el.click() }], ['Escape', () => page.keyboard.press('Escape')], ['tap outside', outside]])
await X.closeBoard(w)
// --- Leave War day sheet
await H.lwOpen(w, '2026-07-18')
const cellSel = '[data-testid="cell-bane-2026-07-18"]'
const shOpen = async () => { if (await page.locator('[data-testid="bid-picker"]:visible').count()) return; const c = page.locator(cellSel).first(); await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(200); if (PHONE) await c.tap(); else await c.click() }
const shIs = async () => (await page.locator('[data-testid="bid-picker"]:visible').count()) > 0
const shClose = async () => { const b = page.locator('[data-testid="bid-picker"] button[aria-label*="lose" i]:visible, [data-testid="bid-picker"] button:has-text("✕"):visible').first(); if (!(await b.count())) throw new Error('no close control'); if (PHONE) await b.tap(); else await b.click() }
await closeEvery('Leave War day sheet', shOpen, shIs, [['its ✕', shClose], ['Escape', () => page.keyboard.press('Escape')], ['tap outside', outside]])
// --- Insights
await L.go(page, 'editsched'); await sleep(500)
const inOpen = async () => { const btn = page.locator('#insightBtn:visible').first(); if (await btn.count()) { if (PHONE) await btn.tap(); else await btn.click() } else { const more = page.locator('#editSchedMore:visible').first(); if (PHONE) await more.tap(); else await more.click(); await sleep(400); const mi = page.locator('#editSchedMoreInsights:visible').first(); if (PHONE) await mi.tap(); else await mi.click() } }
const inIs = () => page.evaluate(() => !![...document.querySelectorAll('*')].find(e => e.children.length === 0 && /^Week insights/.test(e.textContent) && e.getBoundingClientRect().width > 0))
const inClose = async () => { const b = await page.evaluateHandle(() => { const t = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /^Week insights/.test(e.textContent) && e.getBoundingClientRect().width > 0); let p = t; for (let i = 0; i < 6 && p; i++, p = p.parentElement) { const c = [...p.querySelectorAll('button')].find(x => /^(✕|×|Close)$/.test((x.innerText || '').trim()) || /close/i.test(x.getAttribute('aria-label') || '')); if (c) return c } return null }); const el = b.asElement(); if (!el) throw new Error('no close control found'); if (PHONE) await el.tap(); else await el.click() }
await closeEvery('Insights', async () => { if (!(await inIs())) await inOpen() }, inIs, [['its ✕', inClose], ['Escape', () => page.keyboard.press('Escape')], ['tap outside', outside]])
// --- the Logic row: change and Reset (plain-user round)
await H.logicOpen(w, true)
const v1 = await H.setSetting(w, 'fltLen', '75')
const s1 = await H.strip(w)
await X.pic(w, `5-logic-changed-${P}`)
await X.press(w, '[data-lgreset="fltLen"]', { after: `5-logic-reset-after-tap-${P}` }); await sleep(700)
const v2 = await H.readSetting(w, 'fltLen'); const s2 = await H.strip(w)
await X.pic(w, `5-logic-reset-${P}`)
R('Logic: A flight 75, then the row Reset', 'box 1h15 with the strip; then 1h and the strip gone', `${v1} strip ${s1.length}; after reset ${v2} strip ${s2.length}`, v1 === '1h15' && s1.length && v2 === '1h' && !s2.length ? 'PASS' : 'FAIL', `5-logic-reset-${P}.png`)
await X.fin(w)
