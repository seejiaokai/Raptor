// p6-a2 - P6 case A2 (the code read's row A2): the Inputs page's "+ Input" on another squadron's page.
// SET-UP by presses (Saber, master admin, desktop): Admin → Users: Hunter's row → "Access to 149" Plan → Save.
// Then, in a fresh browser with that saved data, Hunter (142's admin, Plan of 149) signs in, picks 149 (top-bar picker;
// ☰ list on a phone), Inputs → List → "+ Input": who is in the Person box, and who it offers. Type Duty, Thu 10 Dec 2026,
// Remarks "n175 p6 A2" → Save: which saved record changed (its unit), the bar. Then 149's List (All dates) and, after a
// pick of 142, 142's List: on which squadron's list the new input shows.
//   node raptor-port/scripts/handpass/n175/p6-a2.mjs <d|p>
// Pictures: p6-a2-<d|p>-1-window (the Person box ringed, the bar), p6-a2-<d|p>-2-lists (149's list after Save)
import { mk, closeAll, FACT, signIn, wait, vis, hit, shot, scratch, reachPick, barSq, give, newInputWindow, pickDay, typeIn, saveInput, snap, changed, state, toList, rowsWith, ringRow, unring, saveState, SEC, via } from './p6-lib.mjs'
const SZ = process.argv[2] || 'd'
const k = `p6.a2.${SZ}`, P = `p6-a2-${SZ}`
try {
  console.log('p6-a2 v1', SZ)
  let st
  { const s = await mk('d'); try { await signIn(s, 'ad', 'a'); FACT(`${k}.setup.hunterPlan149`, await give(s, 'prowler', '149', 'plan')); st = await saveState(s, 'a2') } finally { await s.ctx.close().catch(() => {}) } }
  const s = await mk(SZ, { storageState: st })
  try {
    await signIn(s, 'ad2', 'a2')
    const p = await reachPick(s, 149, via(s)); FACT(`${k}.1.pick149`, { pressed: !!p.pressed, rows: p.listRows, ...(await state(s)) })
    await newInputWindow(s)
    const person = await s.page.evaluate(() => { const e = [...document.querySelectorAll('#inpEditPerson')].find(x => x.getBoundingClientRect().width > 0); return e ? { chosen: e.options[e.selectedIndex]?.text.trim(), offered: [...e.options].map(o => o.text.trim()).filter(Boolean).slice(0, 40) } : 'no Person box drawn' })
    FACT(`${k}.2.window`, { ...(await state(s)), person })
    await shot(s, `${P}-1-window`, ['#inpEditPerson', s.desk ? '#sqnMenuBtn' : '.topbar .mark'], null, 24)
    await s.page.selectOption('#inpEditType', 'Duty')
    await pickDay(s, 'Thu 10 Dec 2026'); await typeIn(s, '#inpEditRmk', 'n175 p6 A2')
    const before = await snap(s)
    FACT(`${k}.3.save`, await saveInput(s))
    FACT(`${k}.3.afterSave`, await state(s))
    FACT(`${k}.3.storageChanged`, changed(before, await snap(s)).filter(x => /inputs\/|elog|notice/.test(x)))
    await toList(s)
    FACT(`${k}.4.on149List`, { squadron: await barSq(s), rows: await rowsWith(s, /n175 p6 A2/) })
    const r = await ringRow(s, /n175 p6 A2/)
    await shot(s, `${P}-2-lists`, r ? ['[data-n175ring]', s.desk ? '#sqnMenuBtn' : '.topbar .mark'] : [s.desk ? '#sqnMenuBtn' : '.topbar .mark'], null, 30)
    await unring(s)
    const p2 = await reachPick(s, 142, via(s)); FACT(`${k}.5.pick142`, { pressed: !!p2.pressed })
    await toList(s)
    FACT(`${k}.5.on142List`, { squadron: await barSq(s), rows: await rowsWith(s, /n175 p6 A2/) })
    await scratch(s, SEC, `${P}-3-on142-list`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
