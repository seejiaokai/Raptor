// A1 — saving an existing input window with nothing changed. Run alone or imported by isr-A.mjs.
import * as L from './isr-A-lib.mjs'
const { say, check, note, notWalked, tid, press, shot, mark, unmark, rec, undoState, notes } = L
const stamp = r => [r.mod, r.by, r.at, r.modBy, r.modAt]
export default async function a1() {
  for (const size of ['desktop', 'phone']) {
    const { ctx, page, tap } = await L.session(size)
    try {
      const [who] = await L.freeMen(page, 1)
      const iid = await L.fileOn(page, tap, '2026-07-17', { type: 'Training', people: [who], from: '09:00', to: '10:00', title: 'ISR brief', remarks: 'isr A1' }, true)
      if (!iid) { notWalked(`A1 ${size}`, 'filing failed'); await ctx.close(); continue }
      note(`A1 ${size}`, `filed ${iid} for ${who} (a Training, 17 Jul 09:00-10:00)`)
      await page.waitForTimeout(3500)
      if (!(await tid(page, 'win-inputsday').count())) await L.openDay(page, '2026-07-17')
      await press(page, tap, `[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`); await tid(page, 'win-inputedit').waitFor(); await page.waitForTimeout(400)
      const r0 = await rec(page, iid), u0 = await undoState(page), n0 = (await notes(page)).length
      await mark(page, '#inpEditSave'); await shot(page, 'A1', size, 'window-before-save'); await unmark(page, '#inpEditSave')
      await press(page, tap, '#inpEditSave'); await page.waitForTimeout(1200)
      const n1 = (await notes(page)).slice(n0)
      const fresh = await page.evaluate(id => document.querySelectorAll(`[data-fresh="${id}"]`).length, iid)
      await shot(page, 'A1', size, 'after-save')
      const r1 = await rec(page, iid), u1 = await undoState(page)
      say(`A1 ${size} stamp before ${JSON.stringify(stamp(r0))} after ${JSON.stringify(stamp(r1))}; undo before ${JSON.stringify(u0.undo.title)} after ${JSON.stringify(u1.undo.title)}; notes after save ${JSON.stringify(n1)}; just-changed marks on screen ${fresh}`)
      check('A1', `${size} unchanged save leaves the changed-by stamp alone`, JSON.stringify(stamp(r0)) === JSON.stringify(stamp(r1)), { before: stamp(r0), after: stamp(r1) })
      // is there an Undo step for the save? close the windows, press Undo once: if the filing is still there, the save made its own step
      for (const x of ['win-inputedit-x', 'win-inputsday-x']) if (await tid(page, x).count()) await press(page, tap, `[data-testid="${x}"]`)
      await page.waitForTimeout(500)
      await mark(page, '#undoBtn'); await shot(page, 'A1', size, 'undo-button'); await unmark(page, '#undoBtn')
      await press(page, tap, '#undoBtn'); await page.waitForTimeout(700)
      const gone = !(await page.evaluate(id => window.INPUTS.some(x => String(x.iid) === String(id)), iid))
      const r2 = gone ? null : await rec(page, iid)
      check('A1', `${size} the first Undo after the unchanged save takes back the FILING (so the save made no step of its own)`, gone, { filingGoneAfterOneUndo: gone, stampAfterUndo: r2 && stamp(r2) })
      await shot(page, 'A1', size, 'after-one-undo')
      // the same on a demo input never touched this session (Quill LL, 14 Jul), desktop only
      if (size === 'desktop') {
        await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2026, 7); await L.openDay(page, '2026-07-14')
        const row = page.locator('[data-testid^="idy-row-"]').filter({ hasText: 'Local leave' }).first()
        const did = (await row.getAttribute('data-popiid'))
        const d0 = await rec(page, did), du0 = await undoState(page)
        await press(page, tap, row.locator('[data-testid="idy-open"]')); await tid(page, 'win-inputedit').waitFor(); await page.waitForTimeout(400)
        await press(page, tap, '#inpEditSave'); await page.waitForTimeout(1000)
        const d1 = await rec(page, did), du1 = await undoState(page)
        say(`A1 ${size} DEMO input ${did} (${d0.type}, ${d0.person}) stamp before ${JSON.stringify(stamp(d0))} after ${JSON.stringify(stamp(d1))}; undo before ${du0.undo.disabled ? 'off' : 'on'} ${JSON.stringify(du0.undo.title)} after ${du1.undo.disabled ? 'off' : 'on'} ${JSON.stringify(du1.undo.title)}`)
        check('A1', `${size} demo input: unchanged save leaves its stamp alone`, JSON.stringify(stamp(d0)) === JSON.stringify(stamp(d1)), { before: stamp(d0), after: stamp(d1) })
        check('A1', `${size} demo input: unchanged save leaves Undo as it was (disabled before: ${du0.undo.disabled})`, du0.undo.disabled === du1.undo.disabled, { du0: du0.undo, du1: du1.undo })
        await shot(page, 'A1', size, 'demo-input-after-save')
      }
    } catch (e) { say(`ERROR A1 ${size}: ${e.message.split('\n')[0]}`); await shot(page, 'A1', size, 'error').catch(() => {}) }
    await ctx.close()
  }
}
if (process.argv[1].endsWith('isr-A-a1.mjs')) { await a1(); await L.finish('a1') }
