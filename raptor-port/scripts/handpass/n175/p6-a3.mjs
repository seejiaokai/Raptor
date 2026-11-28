// p6-a3 - P6 case A3 (the code read's row A3): the SANS calendar's "+ Commitment" on another squadron's page.
// SET-UP by presses (Saber, master admin, desktop): Admin → Users: Hunter's row → "Access to 149" Plan → Save; then
// (variant "sans" only) Quals → Edit → Hunter's SANS cell pressed → Done, so Hunter is SANS-qualified.
// Then, in a fresh browser, Hunter signs in, picks 149, Inputs → SANS, a day of the month shown pressed, "+ Commitment":
// who is in the Person box, who it offers. Remarks "n175 p6 A3", Save (the window's own): which saved record changed (its
// unit), the bar; then the SANS day / Inputs List on 149 and on 142.
//   node raptor-port/scripts/handpass/n175/p6-a3.mjs <d|p>     (ONLY=sans,nosans)
// Pictures: p6-a3-<variant>-<d|p>-1-window
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, shot, scratch, reachPick, barSq, pageOn, give, tick, typeIn, saveInput, snap, changed, state, toList, rowsWith, saveState, winFacts, SEC, via } from './p6-lib.mjs'
const SZ = process.argv[2] || 'd'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
async function setup(v) {
  const s = await mk('d')
  try {
    await signIn(s, 'ad', 'a')
    FACT(`p6.a3.${v}.setup.hunterPlan149`, await give(s, 'prowler', '149', 'plan'))
    if (v === 'sans') FACT(`p6.a3.${v}.setup.hunterSansTick`, await tick(s, 'prowler', 'san'))
    return await saveState(s, 'a3-' + v)
  } finally { await s.ctx.close().catch(() => {}) }
}
async function toSans(s) {
  await go(s, 'inputs'); await wait(s, 600)
  const t = vis(s, '.page.on button').filter({ hasText: /^\s*SANS\s*$/ }).first()
  if (await t.count()) await hit(s, t, 800)
  return { sansCal: !!(await vis(s, '[data-testid="sanscal"]').count()), month: await s.page.evaluate(() => (document.querySelector('[data-testid="sanscal"]')?.innerText || '').replace(/\s+/g, ' ').slice(0, 30)) }
}
async function run(v) {
  const k = `p6.a3.${v}.${SZ}`, P = `p6-a3-${v}-${SZ}`
  const st = await setup(v)
  const s = await mk(SZ, { storageState: st })
  try {
    await signIn(s, 'ad2', 'a2')
    const p = await reachPick(s, 149, via(s)); FACT(`${k}.1.pick149`, { pressed: !!p.pressed, ...(await state(s)) })
    FACT(`${k}.2.sans`, await toSans(s))
    /* a weekday of the month shown, the 16th (the first weekday from it), pressed as he would */
    /* (the first weekday after today in the month shown - a day after his SANS tick, which counts from today) */
    const iso = await s.page.evaluate(() => { const t = new Date(); const today = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; const ds = [...document.querySelectorAll('[data-testid^="sc-day-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.getAttribute('data-icday')); const wk = ds.filter(i => { const d = new Date(i + 'T12:00:00').getDay(); return d > 0 && d < 6 && i > today }); return wk[0] || ds[ds.length - 1] })
    await hit(s, `[data-testid="sc-day-${iso}"]`, 800)
    const add = vis(s, '[data-testid="sd-add"]').first()
    FACT(`${k}.3.day`, { iso, addButton: (await add.count()) ? ((await add.isDisabled()) ? 'greyed' : 'live') : 'not drawn', windows: (await winFacts(s)).map(w => w.slice(0, 160)) })
    if (!(await add.count()) || (await add.isDisabled())) { await shot(s, `${P}-1-window`, ['[data-testid="sd-add"]', s.desk ? '#sqnMenuBtn' : '.topbar .mark'], null, 24); return }
    await hit(s, add, 900)
    const person = await s.page.evaluate(() => { const e = [...document.querySelectorAll('#inpEditPerson')].find(x => x.getBoundingClientRect().width > 0); if (!e) { const w = [...document.querySelectorAll('.inpedwin')].find(x => x.getBoundingClientRect().width > 0); return { box: 'no Person box', window: w ? w.innerText.replace(/\s+/g, ' ').slice(0, 200) : 'no window' } } return { chosen: e.options[e.selectedIndex]?.text.trim() || '(blank)', offered: [...e.options].map(o => o.text.trim()).filter(Boolean).slice(0, 30) } })
    FACT(`${k}.4.window`, { ...(await state(s)), person, windows: (await winFacts(s)).map(w => w.slice(0, 200)) })
    await shot(s, `${P}-1-window`, ['#inpEditPerson', s.desk ? '#sqnMenuBtn' : '.topbar .mark'], null, 24)
    if (await vis(s, '#inpEditRmk').count()) await typeIn(s, '#inpEditRmk', 'n175 p6 A3')
    const before = await snap(s)
    FACT(`${k}.5.save`, await saveInput(s))
    FACT(`${k}.5.afterSave`, { ...(await state(s)), windows: (await winFacts(s)).map(w => w.slice(0, 300)) })
    FACT(`${k}.5.storageChanged`, changed(before, await snap(s)).filter(x => /inputs\//.test(x)))
    if (v === 'sans') await shot(s, `${P}-2-after-save`, ['.floatwin.sansday', s.desk ? '#sqnMenuBtn' : '.topbar .mark', '#toastEl'], null, 24)
    else await scratch(s, SEC, `${P}-2-after-save`)
    if (await vis(s, '#inpEditCancel').count()) await hit(s, '#inpEditCancel', 500)
    for (let i = 0; i < 3; i++) { const x = vis(s, '.floatwin button').filter({ hasText: /^✕$/ }).first(); if (!(await x.count())) break; await hit(s, x, 400) }
    const dayFig = () => s.page.evaluate(i => (document.querySelector(`[data-testid="sc-day-${i}"]`)?.innerText || 'not drawn').replace(/\s+/g, ' ').trim(), iso)
    FACT(`${k}.6.on149SansDay`, { squadron: await barSq(s), iso, figures: await dayFig() })
    await toList(s); FACT(`${k}.6.on149List`, { squadron: await barSq(s), rows: await rowsWith(s, /n175 p6 A3/) })
    await reachPick(s, 142, via(s)); await toList(s); FACT(`${k}.6.on142List`, { squadron: await barSq(s), rows: await rowsWith(s, /n175 p6 A3/) })
    await toSans(s); FACT(`${k}.6.on142SansDay`, { squadron: await barSq(s), iso, figures: await dayFig() })
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p6-a3 v1', SZ)
  for (const v of (ONLY.length ? ONLY : ['sans', 'nosans'])) await run(v)
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
