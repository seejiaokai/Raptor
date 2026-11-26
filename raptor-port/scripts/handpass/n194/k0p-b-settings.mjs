// k0p-b-settings - Part 2 B: on the phone, Inputs → the settings window (gear), the late cut-off changed and NOT saved,
// "Calendar…" pressed from there: is the Calendar window drawn over the settings window? Then the SANS calendar's twin.
// Saber, 142. Also on the desktop, for comparison.
import { mk, signIn, go, FACT, closeAll, world, wait, ERRS, shot, boxOf, vis, hit } from './k0p-lib.mjs'
console.log('k0p-b-settings v1')
const wins = s => s.page.evaluate(() => [...document.querySelectorAll('.floatwin')].filter(e => e.getBoundingClientRect().width > 0).map(e => { const r = e.getBoundingClientRect(); return { testid: e.dataset.testid || e.id, title: e.querySelector('.fw-title, h3, .fwtitle, header')?.textContent.trim().slice(0, 40), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), z: getComputedStyle(e).zIndex } }))
const topAt = (s, sel) => s.page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return 'not drawn'; const r = e.getBoundingClientRect(); const pts = [[r.left + r.width / 2, r.top + 20], [r.left + r.width / 2, r.top + r.height / 2]]; return pts.map(([x, y]) => { const h = document.elementFromPoint(x, y); const w = h?.closest('.floatwin'); return w ? (w.dataset.testid || w.id) : (h?.className || h?.tagName) }) }, sel)
async function setCut(s, winSel) {
  const inp = s.page.locator(`${winSel} input[type=number], ${winSel} input[inputmode=numeric], ${winSel} input`).first()
  const before = await inp.inputValue()
  await inp.evaluate(e => { const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'value').set; set.call(e, '21'); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) })
  await wait(s, 300)
  return { before, after: await inp.inputValue() }
}
async function run(sz) {
  const s = await mk(sz, { storageState: await world() })
  try {
    await signIn(s, 'saber'); await go(s, 'inputs'); await wait(s, 800)
    /* Inputs */
    await hit(s, '#inGear', 700)
    FACT(`b.${sz}.inputs.settingsOpen`, await wins(s))
    FACT(`b.${sz}.inputs.cut`, await setCut(s, '[data-testid="win-inputsset"]'))
    await shot(s, `b-inputs-settings-changed-${sz}`)
    await hit(s, '[data-testid="iset-days"]', 900)
    const w1 = await wins(s); FACT(`b.${sz}.inputs.afterCalendar`, w1)
    FACT(`b.${sz}.inputs.onTop`, { settings: await topAt(s, '[data-testid="win-inputsset"]'), calendar: await topAt(s, '.floatwin:not([data-testid="win-inputsset"])') })
    FACT(`b.${sz}.inputs.cutStill`, await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsset"] input')].map(i => i.value)))
    await shot(s, `b-inputs-calendar-over-settings-${sz}`)
    /* close both, then the SANS calendar's twin */
    for (let i = 0; i < 3; i++) { await s.page.keyboard.press('Escape'); await wait(s, 300) }
    FACT(`b.${sz}.closed`, await wins(s))
    const sm = vis(s, '#inSansMode'); if (await sm.count()) await hit(s, sm.first(), 900)
    await hit(s, '[data-testid="sc-gear"]', 700)
    FACT(`b.${sz}.sans.settingsOpen`, await wins(s))
    const ssel = await s.page.evaluate(() => { const e = [...document.querySelectorAll('.floatwin')].find(x => x.getBoundingClientRect().width > 0 && x.querySelector('[data-testid="sset-days"]')); return e ? (e.dataset.testid ? `[data-testid="${e.dataset.testid}"]` : '#' + e.id) : null })
    FACT(`b.${sz}.sans.win`, ssel)
    if (ssel) FACT(`b.${sz}.sans.cut`, await setCut(s, ssel))
    await shot(s, `b-sans-settings-changed-${sz}`)
    const days = vis(s, '[data-testid="sset-days"]')
    FACT(`b.${sz}.sans.calendarButton`, { drawn: await days.count(), covered: await s.page.evaluate(() => { const e = document.querySelector('[data-testid="sset-days"]'); if (!e) return 'none'; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === e || e.contains(h) ? 'free' : 'covered by ' + (h?.className || h?.tagName) }) })
    if (await days.count()) await hit(s, days.first(), 900)
    FACT(`b.${sz}.sans.afterCalendar`, await wins(s))
    if (ssel) FACT(`b.${sz}.sans.onTop`, { settings: await topAt(s, ssel), calendar: await topAt(s, `.floatwin:not(${ssel})`) })
    if (ssel) FACT(`b.${sz}.sans.cutStill`, await s.page.evaluate(sel => [...document.querySelectorAll(sel + ' input')].map(i => i.value), ssel))
    await shot(s, `b-sans-calendar-over-settings-${sz}`)
    FACT(`b.${sz}.errs`, s.errs)
  } catch (e) { FACT(`b.${sz}.error`, String(e).slice(0, 300)) } finally { await s.ctx.close() }
}
try { await run('p'); await run('d') } finally { FACT('errors', ERRS); await closeAll() }
