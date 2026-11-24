// mid-e1 - case E(1): his own move to another squadron taking effect at midnight while a window is open.
// Hunter (sign-in ad2, admin of 142) moves 142 → 149 from 16 Jul 2026. Before midnight he opens (e1i) an Input window on
// Inputs and types in its Remarks, or (e1l) a Leave War day window (a cell of 15 Dec pressed); the page's clock is run
// past midnight; what the screen says is read; then the window's own Save / ✕ are looked at and Save pressed.
// STAND-INS, both named: (1) the move is written as a home row at the sign-in card before he signs in - no screen saves a
// move (the established way, scripts/handpass/msq/msq-rs-lib.mjs saveMove/world); (2) the page's clock (Playwright's
// clock, installed at 23:58:30 on 15 Jul 2026, Singapore time) is run forward to 00:00:30 - the app's own midnight wake
// (leavewar/sync.ts installPostingClock, a timer set for 00:00:01) fires on the way, as it would on the real night.
// The phone size is WebKit at 402×874 (rs-lib's phone world), the desktop Chromium 1536×864.
//   node raptor-port/scripts/handpass/n166/mid-e1.mjs <d|402x874>     (ONLY=e1i,e1l)
// Pictures: E1-<d|p>-<case>-*.png
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.RS_OUT = process.env.RS_OUT || resolve(HERE, '../../../.tmp/n166-rs')
const RS = await import('../msq/msq-rs-lib.mjs')
const { FACT, pic, windowsNow, roleNow, barSq, pageOn, bands, wait, boxOf, covered, go } = await import('./lib.mjs')
const SZ = process.argv[2] || 'd', T = SZ === 'd' ? 'd' : 'p'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const WORDS = 'N166E1 words'
const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
async function hit(s, l, ms = 400) { l = typeof l === 'string' ? vis(s, l).first() : l; await l.scrollIntoViewIfNeeded().catch(() => {}); if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 }); await wait(s, ms) }
const lineWords = s => s.page.evaluate(() => [...document.querySelectorAll('.moveband, .saveband, [role=status], [role=alert], .toast, #toastEl')].filter(e => e.getBoundingClientRect().width > 1 && getComputedStyle(e).opacity !== '0').map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 8))
async function setup(user = 'ad2') {
  const w = await RS.world({ origin: 'http://localhost:4700', size: SZ === 'd' ? 'd' : 'p', user, now: '2026-07-15T23:58:30', moves: [{ pid: 'prowler', from: 'u142', to: 'u149', day: '2026-07-16' }] })
  const s = { page: w.page, ctx: w.ctx, desk: !w.phone, W: SZ === 'd' ? 1536 : 402, H: SZ === 'd' ? 864 : 874, w }
  await w.page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' }).catch(() => {})
  return s
}
async function after(s, k, P, typedSel) {
  FACT(`${k}.beforeMidnight`, { squadron: await barSq(s), role: (await roleNow(s)).badge || (await roleNow(s)).menuLine, page: await pageOn(s), windows: (await windowsNow(s)).map(x => x.what + ': ' + x.words.slice(0, 80)) })
  await pic(s, `${P}-1-before-midnight`)
  await RS.clockTo(s.w, '2026-07-16T00:00:30'); await wait(s, 1500)
  FACT(`${k}.standIn`, 'clock run from 23:58:30 to 00:00:30 on 16 Jul; move written at the sign-in card')
  const ws = await windowsNow(s)
  FACT(`${k}.afterMidnight`, { squadron: await barSq(s), role: (await roleNow(s)).badge || (await roleNow(s)).menuLine, page: await pageOn(s), signedOut: !!(await vis(s, '#luser').count()) })
  FACT(`${k}.afterMidnight.windows`, ws.map(x => ({ what: x.what, words: x.words.slice(0, 200), buttons: x.buttons, inert: x.inert })))
  FACT(`${k}.afterMidnight.bands`, await bands(s)); FACT(`${k}.afterMidnight.notes`, await lineWords(s))
  if (typedSel) FACT(`${k}.afterMidnight.typed`, await s.page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); return e ? { value: e.value, readOnly: e.readOnly || e.disabled || !!e.closest('[inert]') } : null }, typedSel))
  await pic(s, `${P}-2-after-midnight`)
  return ws
}
async function e1i() {
  const k = `E1.${T}.input`, P = `E1-${T}-input`
  const s = await setup()
  try {
    await go(s, 'inputs'); await wait(s, 700)
    if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
    if (!(await vis(s, '#inBody tr[data-iid], #inList [data-iid]').count())) { await hit(s, '#inRangeBtn'); if (await s.page.locator('#inRangeAll').count()) await hit(s, s.page.locator('#inRangeAll').first()); if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn') }
    const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').first()
    FACT(`${k}.input`, (await row.innerText()).replace(/\s+/g, ' ').slice(0, 40))
    const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 700)
    const r = vis(s, '#inpEditRmk').first(); await r.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type(WORDS)
    await after(s, k, P, '#inpEditRmk')
    /* the window's own Save, pressed where drawn and not covered */
    const sv = await boxOf(s, '#inpEditSave')
    if (sv) {
      FACT(`${k}.save.covered`, await covered(s, '#inpEditSave'))
      FACT(`${k}.save.greyed`, await s.page.evaluate(() => { const b = [...document.querySelectorAll('#inpEditSave')].find(x => x.getBoundingClientRect().width > 0); return !!(b.disabled || b.closest('[inert]')) }))
      if ((await covered(s, '#inpEditSave')) === 'free') { if (s.desk) await s.page.mouse.click(sv.x + sv.w / 2, sv.y + sv.h / 2); else await s.page.touchscreen.tap(sv.x + sv.w / 2, sv.y + sv.h / 2); await wait(s, 900) }
      FACT(`${k}.save.after`, { windows: (await windowsNow(s)).map(x => x.what + ': ' + x.words.slice(0, 120)), bands: await bands(s), notes: await lineWords(s) })
      await pic(s, `${P}-3-after-save`)
    } else FACT(`${k}.save`, 'no Save drawn')
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)) } finally { await s.w.browser.close().catch(() => {}) }
}
async function e1l() {
  const k = `E1.${T}.leavewar`, P = `E1-${T}-leavewar`
  const s = await setup()
  try {
    await go(s, 'leavewar'); await s.page.waitForSelector('[data-testid="month-strip"]', { timeout: 15000 }); await wait(s, 600)
    if (await vis(s, '[data-testid="month-DEC"]').count()) await hit(s, '[data-testid="month-DEC"]', 700)
    const c = s.page.locator('[data-testid^="cell-"][data-testid$="-2026-12-15"]').first()
    await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await wait(s, 250)
    if (s.desk) await c.click(); else await c.tap(); await wait(s, 800)
    FACT(`${k}.opened`, (await windowsNow(s)).map(x => x.what + ': ' + x.words.slice(0, 100)))
    await after(s, k, P, null)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)) } finally { await s.w.browser.close().catch(() => {}) }
}
try {
  console.log('mid-e1 v1', SZ)
  if (!ONLY.length || ONLY.includes('e1i')) await e1i()
  if (!ONLY.length || ONLY.includes('e1l')) await e1l()
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 }
