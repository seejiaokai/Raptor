// k4 - N9: an Input window that would open already greyed. Three-squadron world (k0). Desktop. By presses:
//   1. Hunter (142's admin, Plan of 149) signs in, picks 149: Inputs → List → + Input: OL, "Several" on, two 149 men
//      (the first two the picker's crew offers), Mon 14 Dec 2026, Remarks "k4 two 149" → Add.
//   2. Logout. Kestrel (149's own admin) signs in: that input opened from the List, Remarks changed → Save (a change by
//      someone else to an input Hunter filed lights Hunter's bell - p6-a7's finding). Then Admin → Users: Hunter's row
//      (149's list) → "Access to 149": None → Save - whether D2626 lets him (built today as a master admin's alone); where
//      refused, Logout and Saber (master admin) does the same.
//   3. Logout. Hunter signs in (on 142), taps the bell: his lines; the line about that input pressed: what opens, where,
//      greyed or live, its words, its buttons; Remarks changed → Save pressed: what the screen says, and which record of
//      the browser's saved data changed (its squadron).
//   node raptor-port/scripts/handpass/n176/k4-heldinput.mjs <none|view>   (what the Plan is ended to; default none)
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, shot, scratch, barSq, pageOn, reachPick, windowsNow, toastNow, bands, usersTab, typeIn, saveInput, editRemarks, relog, tapBell, bellLit, bellLines, LIST, store, diffKeys, world, winFacts } from './k-lib.mjs'
/* what his Plan of 149 is ended to: None (no right in 149 left) or View (the first run's None left no line in his bell) */
const END = process.argv[2] === 'view' ? 'view' : 'none'
const K = `k4.d.${END}`, P = `k4-d-${END}`
const lineBtn = (num, v) => `[data-testid="acc-sq"] [aria-label="Access to ${num}"] button[data-line="${v}"]`
const inputRecs = (a, b) => diffKeys(a, b).map(k => { const v = b[k]; if (!/inputs\//.test(k)) return k.replace(/^raptor:/, ''); try { const r = JSON.parse(v || 'null') || {}; return `${k.replace(/^raptor:/, '')} {people:${JSON.stringify(r.people ?? r.person)}, unit:${r.u ?? r.unit ?? '(none)'}, rmks:${JSON.stringify(r.rmks ?? r.remarks ?? '')}}` } catch { return k } })
async function endPlan(s, who) {
  await usersTab(s)
  const f = vis(s, '#accFind').first(); if (await f.count()) { await f.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type('Hunter'); await wait(s, 500) }
  const row = s.page.locator('#accList [data-person="prowler"] .acc-tap').first()
  if (!(await row.count())) return { who, row: 'Hunter not listed' }
  await hit(s, row, 700)
  const line = await s.page.evaluate(() => { const e = document.querySelector('[data-testid="acc-sq"] [aria-label="Access to 149"]'); return e ? [...e.querySelectorAll('button')].map(b => `${b.textContent.trim()}${b.getAttribute('aria-pressed') === 'true' ? '(on)' : ''}${b.disabled || b.getAttribute('aria-disabled') === 'true' ? '[greyed]' : ''}${b.title ? ' title="' + b.title + '"' : ''}`) : null })
  const words = await s.page.evaluate(() => document.querySelector('[data-testid="acc-sq"]')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 300) ?? null)
  const b = s.page.locator(lineBtn('149', END))
  let pressed = false
  if (await b.count() && !(await b.isDisabled())) { await b.click(); pressed = true; await wait(s, 300) }
  if (pressed) await hit(s, '#accEdSave', 900)
  const toast = await toastNow(s)
  if (await vis(s, '#accEdCancel').count()) await hit(s, '#accEdCancel', 400)
  return { who, squadron: await barSq(s), line, words, pressedNone: pressed, toast }
}
try {
  console.log('k4-heldinput v1')
  const st = await world()
  const s = await mk('d', { storageState: st }); const { page } = s
  try {
    /* 1 */
    await signIn(s, 'ad2', 'a2')
    const p9 = await reachPick(s, 149, 'bar'); FACT(`${K}.1.pick149`, { rows: p9.listRows, squadron: await barSq(s) })
    await go(s, 'inputs'); await wait(s, 500)
    if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
    await hit(s, '#inNew', 800)
    await page.selectOption('#inpEditType', 'OL').catch(() => {})
    await hit(s, '[data-testid="pp-several"]', 400)
    const men = await page.evaluate(() => [...document.querySelectorAll('[data-testid="pp"] .pp-group:not([data-ppgroup="ph"]) button[aria-label]')].filter(b => b.getBoundingClientRect().width > 0 && !b.classList.contains('pp-all')).map(b => b.getAttribute('aria-label')).slice(0, 12))
    /* the picker starts with the filer himself picked (found by the first run: "Hunter +2"): he is unpicked, so the input
       is for two 149 men only */
    const preset = await page.evaluate(() => [...document.querySelectorAll('[data-testid="pp"] button[aria-pressed="true"][aria-label]')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.getAttribute('aria-label')))
    const two = men.filter(m => m !== 'Hunter').slice(0, 2)
    for (const m of two) await hit(s, page.locator(`[data-testid="pp"] button[aria-label="${m}"]`).first(), 250)
    /* (the last one picked cannot be unpicked - the probe: so the two first, then the filer off) */
    for (const m of preset) await hit(s, page.locator(`[data-testid="pp"] button[aria-label="${m}"]`).first(), 250)
    FACT(`${K}.1.picked`, { presetUnpicked: preset, picked: two, count: await page.evaluate(() => document.querySelector('[data-testid="pp-count"]')?.textContent.trim() ?? null) })
    const day = () => page.locator('.floatwin.inpedwin button[aria-label^="Mon 14 Dec 2026"]').first()
    for (let i = 0; i < 12 && !(await day().count()); i++) await hit(s, page.locator('.floatwin.inpedwin button[aria-label="Next month"]').first(), 250)
    await hit(s, day())
    await page.fill('#inpEditRmk', 'k4 two 149')
    const filed = await saveInput(s)
    FACT(`${K}.1.filed`, { squadron: await barSq(s), offered: men, ...filed })
    /* 2 */
    await relog(s, 'ad9', 'a9')
    FACT(`${K}.2.kestrelEdits`, { squadron: await barSq(s), ...(await editRemarks(s, /k4 two 149/, 'k4 two 149 changed by Kestrel')) })
    if (await vis(s, '#inpEditCancel').count()) { await hit(s, '#inpEditCancel', 500); if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk', 400) }
    let ended = await endPlan(s, 'Kestrel')
    FACT(`${K}.2.kestrelEndsPlan`, ended)
    await shot(s, `${P}-0-kestrel-access-line`, ['#accList [data-person="prowler"]'], null, 10).catch(() => {})
    if (!/Saved/.test(ended.toast || '')) {
      /* (Kestrel may not end it today.) Before Saber ends it: Hunter's bell while he still holds Plan of 149 */
      const { bellShow } = await import('../n175/p6-lib.mjs'); const { closeBell } = await import('./k-lib.mjs')
      await relog(s, 'ad2', 'a2')
      await tapBell(s); FACT(`${K}.2b.hunterBellWithPlan`, { squadron: await barSq(s), lines: await bellLines(s), show: await bellShow(s) })
      await shot(s, `${P}-0b-bell-with-plan`, [LIST], [LIST], 12)
      await closeBell(s)
      await relog(s, 'ad', 'a')
      ended = await endPlan(s, 'Saber'); FACT(`${K}.2.saberEndsPlan`, ended)
    }
    /* 3 */
    await relog(s, 'ad2', 'a2')
    FACT(`${K}.3.hunterIn`, { squadron: await barSq(s), page: await pageOn(s), bellLit: await bellLit(s), pickerRows: await page.evaluate(() => !!document.querySelector('#sqnMenuBtn')) })
    FACT(`${K}.3.bellTap`, await tapBell(s))
    const { bellShow, bellFoot } = await import('../n175/p6-lib.mjs')
    FACT(`${K}.3.lines`, { lines: await bellLines(s), show: await bellShow(s), foot: await bellFoot(s) })
    await shot(s, `${P}-1a-bell`, [LIST], [LIST], 12)
    let line = page.locator(`${LIST} .bl-line`).filter({ hasText: /k4|Kestrel|OL|Condor|Harrier/ }).filter({ visible: true }).first()
    if (!(await line.count())) {
      FACT(`${K}.3.line`, 'no line about the k4 input in his bell on 142')
      await scratch(s, `${P}-no-line`)
      /* where he may still pick 149 (View), its bell looked at too */
      const { closeBell } = await import('./k-lib.mjs'); await closeBell(s)
      const p9 = await reachPick(s, 149, 'bar'); await wait(s, 600)
      FACT(`${K}.3.pick149`, { pressed: !!p9.pressed, rows: p9.listRows, why: p9.why, squadron: await barSq(s) })
      if (!p9.pressed) throw new Error('no line, and 149 not offered')
      await tapBell(s)
      FACT(`${K}.3.linesOn149`, { lines: await bellLines(s), show: await bellShow(s) })
      await shot(s, `${P}-1b-bell-on149`, [LIST], [LIST], 12)
      line = page.locator(`${LIST} .bl-line`).filter({ hasText: /k4|Kestrel|OL|Condor|Harrier/ }).filter({ visible: true }).first()
      if (!(await line.count())) throw new Error('no line on 149 either')
    }
    FACT(`${K}.3.lineWords`, (await line.textContent()).replace(/\s+/g, ' ').trim())
    await page.evaluate(() => document.querySelectorAll('.__k4l').forEach(e => e.classList.remove('__k4l')))
    await line.evaluate(e => e.classList.add('__k4l'))
    await shot(s, `${P}-1-bell-line`, ['.__k4l'], [LIST], 12)
    const before = await store(s)
    await hit(s, line, 1200)
    FACT(`${K}.3.afterLine`, { squadron: await barSq(s), page: await pageOn(s), bands: await bands(s), toast: await toastNow(s), windows: await winFacts(s) })
    const win = await page.evaluate(() => { const w = [...document.querySelectorAll('.floatwin.inpedwin, #inpEditPop')].find(e => e.getBoundingClientRect().width > 2); if (!w) return null; return { inert: !!w.closest('[inert]') || w.hasAttribute('inert'), words: w.innerText.replace(/\s+/g, ' ').trim().slice(0, 400), rmkDisabled: !!w.querySelector('#inpEditRmk')?.disabled, rmkReadonly: !!w.querySelector('#inpEditRmk')?.readOnly, save: [...w.querySelectorAll('#inpEditSave, #inpEditDel, #inpEditCancel, #inpEditClose')].map(b => `${b.id}:${b.textContent.trim()}${b.disabled ? '[greyed]' : ''}`) } })
    FACT(`${K}.3.window`, win)
    await shot(s, `${P}-2-window-opened`, ['.floatwin.inpedwin, #inpEditPop', '.topbar .mark'], null, 10)
    if (win && !win.rmkDisabled && await vis(s, '#inpEditRmk').count()) {
      await typeIn(s, '#inpEditRmk', 'k4 two 149 changed by Hunter after his Plan ended')
      const sv = await saveInput(s)
      const after = await store(s)
      FACT(`${K}.4.save`, { ...sv, squadron: await barSq(s), bands: await bands(s), records: inputRecs(before, after) })
      await shot(s, `${P}-3-after-save`, ['.topbar .mark', '#toastEl'], null, 10)
    } else FACT(`${K}.4.save`, 'no Remarks box to change, or it is greyed: Save not pressed')
  } catch (e) { FACT(`${K}.error`, String(e).split('\n')[0].slice(0, 220)); await scratch(s, `${P}-error`).catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
