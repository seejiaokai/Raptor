// k1 - the Calendar window (Inputs settings → Calendar…), his D2597's open question: does every press in it save at once,
// with nothing to type? Then, with it open and nothing pending, a pick of 149 (and of 150). Three-squadron world (k0).
// Saber (master admin) on 142: Inputs → the gear → Calendar… ; the Inputs settings window closed by its own ✕ so the
// Calendar stands alone. Each press, then the browser's saved data read (which keys changed):
//   a. a day's D / N / NF key (a phone: the day's one step button) on Wed 9 Dec 2026 (› to December first)
//   b. a weekday's heading ("Every Monday…"): its form; a choice pressed (not saved) → read; Cancel
//   c. Holidays → + Add: the form - its name box; typing "K1 Day" → read; a date (Wed 16 Dec) → read; Save → read
//   d. that holiday's line opened → Delete → read
//   e. ‹ › Today (month moves)
// Then nothing pending: pick 149 (what happens to the Calendar); back on 142 the Calendar opened again, pick 150.
// Then (extra) a holiday's name typed and not saved, pick 149: what happens to the typing.
//   node raptor-port/scripts/handpass/n176/k1-calendar.mjs <d|p>
import { mk, closeAll, FACT, note, signIn, go, wait, vis, hit, shot, scratch, barSq, pageOn, reachPick, windowsNow, toastNow, store, diffKeys, world, tag } from './k-lib.mjs'
const SZ = process.argv[2] === 'p' ? 'p' : 'd'
const CAL = '[data-testid="days-parts"]'
const calOpen = s => s.page.evaluate(() => { const e = document.querySelector('[data-testid="days-parts"]'); const w = e?.closest('.floatwin'); if (!w) return null; const b = w.getBoundingClientRect(); return { title: (w.querySelector('.fw-title, h2, header')?.textContent || '').trim().slice(0, 60), shown: b.width > 0, inert: !!w.closest('[inert]'), month: document.querySelector('[data-testid="days-month"]')?.textContent.trim() ?? null, band: (w.innerText.match(/(This [^\n]{0,120}|You picked[^\n]{0,120}|could not be saved[^\n]{0,60})/) || [null])[0] } })
const keysWord = ks => ks.map(k => k.replace(/^raptor:/, '')).slice(0, 12)
async function readAfter(s, k, before, what) {
  await wait(s, 900)
  const after = await store(s)
  const ks = diffKeys(before, after)
  FACT(k, { what, savedKeys: keysWord(ks), saved: ks.length > 0, toast: await toastNow(s), err: await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="days-err"], [data-testid="hol-err"], [data-testid="every-err"]')].map(e => e.textContent.trim())) })
  return after
}
async function openCalendar(s) {
  await go(s, 'inputs'); await wait(s, 600)
  await hit(s, '#inGear', 600)
  await hit(s, '[data-testid="iset-days"]', 900)
  /* the settings window's own close, so the Calendar stands alone */
  const x = await s.page.evaluate(() => { const w = document.querySelector('[data-testid="win-inputsset"]'); const b = w && [...w.querySelectorAll('button')].find(b => /close/i.test(b.getAttribute('aria-label') || '') || b.textContent.trim() === '✕'); if (b) { b.setAttribute('data-k1x', '1'); return true } return false })
  if (x) await hit(s, '[data-k1x]', 600)
  return { settingsClosed: x, cal: await calOpen(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 50)) }
}
const via = s => (s.desk ? 'bar' : 'menu')
try {
  console.log('k1-calendar v1', SZ)
  const st = await world()
  const s = await mk(SZ, { storageState: st }); const { page } = s; const T = tag(s); const K = `k1.${T}`, P = `k1-${T}`
  try {
    await signIn(s, 'ad', 'a')
    FACT(`${K}.0.open`, { squadron: await barSq(s), ...(await openCalendar(s)) })
    let snapA = await store(s)
    /* e. the month's arrows (moving to December) */
    await hit(s, '[data-testid="days-next"]', 500)
    snapA = await readAfter(s, `${K}.e.next`, snapA, '› pressed: month ' + (await page.locator('[data-testid="days-month"]').first().textContent()))
    /* a. a day's key */
    const iso = '2026-12-09'
    if (s.desk) {
      const keys = await page.evaluate(i => [...document.querySelectorAll(`[data-testid="days-cell-${i}"] button`)].map(b => `${b.textContent.trim()}${b.getAttribute('aria-pressed') === 'true' ? '(lit)' : ''}`), iso)
      await shot(s, `${P}-1-before-day`, [`[data-testid="days-cell-${iso}"]`], [CAL], 10)
      const target = await page.evaluate(i => { const b = [...document.querySelectorAll(`[data-testid="days-cell-${i}"] button`)].find(b => b.getAttribute('aria-pressed') !== 'true'); if (b) { b.setAttribute('data-k1t', '1'); return b.getAttribute('aria-label') } return null }, iso)
      await hit(s, '[data-k1t]', 300)
      snapA = await readAfter(s, `${K}.a.dayKey`, snapA, { keysBefore: keys, pressed: target })
      await shot(s, `${P}-2-after-day`, [`[data-testid="days-cell-${iso}"]`], [CAL], 10)
    } else {
      const lab = await page.locator(`[data-testid="days-step-${iso}"]`).first().getAttribute('aria-label').catch(() => null)
      await shot(s, `${P}-1-before-day`, [`[data-testid="days-cell-${iso}"]`], [CAL], 10)
      await hit(s, `[data-testid="days-step-${iso}"]`, 300)
      await shot(s, `${P}-1b-tap-day`, [`[data-testid="days-cell-${iso}"]`], [CAL], 10)
      snapA = await readAfter(s, `${K}.a.dayStep`, snapA, { before: lab, after: await page.locator(`[data-testid="days-step-${iso}"]`).first().getAttribute('aria-label').catch(() => null) })
      await shot(s, `${P}-2-after-day`, [`[data-testid="days-cell-${iso}"]`], [CAL], 10)
    }
    /* b. a weekday's heading: its form */
    await hit(s, '[data-testid="days-wd-0"]', 600)
    const ev = await page.evaluate(() => { const f = document.querySelector('[data-testid="every-save"]')?.closest('.floatwin, form, div'); return f ? { words: f.innerText.replace(/\s+/g, ' ').slice(0, 220), boxes: [...f.querySelectorAll('input, textarea, select')].filter(e => e.getBoundingClientRect().width > 0).map(e => `${e.tagName.toLowerCase()}[${e.type || ''}] ${e.getAttribute('data-testid') || e.id}`) } : null })
    FACT(`${K}.b.everyForm`, ev)
    const optLab = await page.evaluate(() => { const b = [...document.querySelectorAll('[data-testid^="every-cls-"]')].find(b => b.getBoundingClientRect().width > 0 && !b.classList.contains('lit') && b.getAttribute('aria-pressed') !== 'true'); if (b) { b.setAttribute('data-k1o', '1'); return b.textContent.trim() } return null })
    if (optLab) await hit(s, '[data-k1o]', 300)
    await shot(s, `${P}-3-every-form`, ['[data-testid="every-save"]', '[data-testid="every-says"]'], ['[data-testid="every-says"]', '[data-testid="every-save"]', '[data-testid="every-cancel"]'], 60)
    snapA = await readAfter(s, `${K}.b.everyChoice`, snapA, `"${optLab}" pressed in the Every Monday form, Save not pressed`)
    await hit(s, '[data-testid="every-cancel"]', 500)
    snapA = await readAfter(s, `${K}.b.everyCancel`, snapA, 'Cancel')
    /* c. Holidays → + Add */
    if (await vis(s, '[data-testid="days-tab-holidays"]').count()) await hit(s, '[data-testid="days-tab-holidays"]', 500)
    await hit(s, '[data-testid="hol-add"]', 600)
    const form = await page.evaluate(() => { const n = document.querySelector('[data-testid="hol-name"]'); const f = n?.closest('.floatwin') || n?.parentElement?.parentElement; return f ? { title: (f.querySelector('.fw-title, h2, header')?.textContent || '').trim().slice(0, 60), boxes: [...f.querySelectorAll('input, textarea, select')].filter(e => e.getBoundingClientRect().width > 0 && e.type !== 'file').map(e => `${e.tagName.toLowerCase()} ${e.getAttribute('data-testid') || e.id} placeholder="${e.placeholder || ''}"`), buttons: [...f.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && !/^\d+$/.test(b.textContent.trim())).map(b => b.textContent.trim().slice(0, 24)).slice(0, 14) } : null })
    FACT(`${K}.c.holidayForm`, form)
    await vis(s, '[data-testid="hol-name"]').first().fill('K1 Day')
    snapA = await readAfter(s, `${K}.c.nameTyped`, snapA, 'name "K1 Day" typed, nothing else')
    const cal = '[data-testid="hol-dates"]'
    const day = () => page.locator(`${cal} button[aria-label*="16 Dec"], ${cal} [data-iso="2026-12-16"]`).first()
    for (let i = 0; i < 14 && !(await day().count()); i++) { const nx = page.locator(`${cal} button[aria-label^="Next"]`).first(); if (!(await nx.count())) break; await hit(s, nx, 250) }
    await hit(s, day(), 400)
    await shot(s, `${P}-4-holiday-typed`, ['[data-testid="hol-name"]', '[data-testid="hol-save"]'], ['[data-testid="hol-name"]', '[data-testid="hol-save"]', cal], 20)
    snapA = await readAfter(s, `${K}.c.dateChosen`, snapA, 'Wed 16 Dec chosen, Save not pressed')
    await hit(s, '[data-testid="hol-save"]', 1200)
    const odl = await page.evaluate(() => document.querySelector('[data-testid="odl-lead"]')?.textContent.trim() ?? null)
    snapA = await readAfter(s, `${K}.c.saved`, snapA, { pressed: 'Save', oilListOpened: odl, formStill: await vis(s, '[data-testid="hol-name"]').count() > 0 })
    if (await vis(s, '[data-testid="odl-later"]').count()) { await hit(s, '[data-testid="odl-later"]', 600); snapA = await readAfter(s, `${K}.c.oilLater`, snapA, 'the OIL list that opened by itself: Later') }
    /* d. the line opened → Delete */
    if (await vis(s, '[data-testid="days-tab-holidays"]').count()) await hit(s, '[data-testid="days-tab-holidays"]', 400)
    const line = vis(s, '.hol-line').filter({ hasText: 'K1 Day' }).first()
    if (await line.count()) {
      await hit(s, line, 600)
      await hit(s, '[data-testid="hol-delete"]', 900)
      const asked = (await windowsNow(s)).filter(w => /dlg|alert/i.test(w.what)).map(w => w.words.slice(0, 120))
      if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk', 700)
      snapA = await readAfter(s, `${K}.d.deleted`, snapA, { pressed: 'the line, then Delete', asked, lineStill: await vis(s, '.hol-line').filter({ hasText: 'K1 Day' }).count() })
    } else FACT(`${K}.d.deleted`, 'no K1 Day line to open')
    if (await vis(s, '[data-testid="days-tab-month"]').count()) await hit(s, '[data-testid="days-tab-month"]', 400)
    /* nothing pending: pick 149 */
    FACT(`${K}.f.beforePick`, { squadron: await barSq(s), cal: await calOpen(s) })
    await shot(s, `${P}-5-before-pick149`, [CAL, '.topbar .mark, #burger'], null, 10)
    const p9 = await reachPick(s, 149, via(s))
    if (!s.desk) await shot(s, `${P}-5b-tap-pick149`, ['.topbar .mark, #burger'], null, 10)
    await wait(s, 800)
    FACT(`${K}.f.pick149`, { reach: p9, squadron: await barSq(s), page: await pageOn(s), cal: await calOpen(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 60)), toast: await toastNow(s) })
    await shot(s, `${P}-6-after-pick149`, [CAL, '.topbar .mark, #burger'], null, 10)
    /* back to 142, the Calendar again, pick 150 */
    await reachPick(s, 142, via(s)); await wait(s, 600)
    FACT(`${K}.g.reopen`, await openCalendar(s))
    const p0 = await reachPick(s, 150, via(s)); await wait(s, 800)
    FACT(`${K}.g.pick150`, { reach: p0, squadron: await barSq(s), cal: await calOpen(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 60)) })
    await shot(s, `${P}-7-after-pick150`, [CAL, '.topbar .mark, #burger'], null, 10)
    /* extra: a holiday name typed and not saved, then pick 149 */
    await reachPick(s, 142, via(s)); await wait(s, 600)
    await openCalendar(s)
    if (await vis(s, '[data-testid="days-tab-holidays"]').count()) await hit(s, '[data-testid="days-tab-holidays"]', 400)
    await hit(s, '[data-testid="hol-add"]', 600)
    await vis(s, '[data-testid="hol-name"]').first().fill('K1 Typed')
    const before = await store(s)
    await shot(s, `${P}-8-typed-before-pick149`, ['[data-testid="hol-name"]', '.topbar .mark, #burger'], null, 10)
    const p9b = await reachPick(s, 149, via(s)); await wait(s, 800)
    const after = await store(s)
    FACT(`${K}.h.typedPick149`, { reach: p9b, squadron: await barSq(s), cal: await calOpen(s), nameBox: await page.evaluate(() => document.querySelector('[data-testid="hol-name"]')?.value ?? '(no box)'), savedKeys: keysWord(diffKeys(before, after)), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 60)) })
    await shot(s, `${P}-9-typed-after-pick149`, ['.topbar .mark, #burger', '[data-testid="hol-name"]'], null, 10)
    await reachPick(s, 142, via(s)); await wait(s, 800)
    FACT(`${K}.h.back142`, { squadron: await barSq(s), cal: await calOpen(s), nameBox: await page.evaluate(() => document.querySelector('[data-testid="hol-name"]')?.value ?? '(no box)') })
  } catch (e) { FACT(`${K}.error`, String(e).split('\n')[0].slice(0, 220)); await scratch(s, `${P}-error`).catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
