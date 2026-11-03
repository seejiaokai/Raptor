// A6 — Undo's words for a leave and for a duty input (filing, then changing one); the note after Undo; the button's title.
import * as L from './isr-A-lib.mjs'
const { say, check, note, tid, press, shot, mark, unmark, undoState, notes } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
export default async function a6() {
  for (const size of ['desktop', 'phone']) {
    const { ctx, page, tap } = await L.session(size)
    try {
      const [a, b] = await L.freeMen(page, 2)
      const name = id => page.evaluate(id => window.PEOPLE[id].cs, id)
      const cases = [
        ['leave', { type: 'OL', people: [a], end: '2026-07-18', remarks: 'isr A6 leave' }, a],
        ['duty', { type: 'Duty', people: [b], from: '09:00', to: '12:00', remarks: 'isr A6 duty' }, b],
      ]
      for (const [kind, spec, who] of cases) {
        const iid = await L.fileOn(page, tap, '2026-07-17', spec)
        const cs = await name(who)
        if (!iid) { say(`NOT WALKED A6 ${size} ${kind} — not filed`); continue }
        await page.waitForTimeout(600)
        const uFile = await undoState(page)
        await mark(page, '#undoBtn'); await page.locator('#undoBtn').hover().catch(() => {}); await sleep(900)
        await shot(page, 'A6', size, `${kind}-undo-title-after-filing`); await unmark(page, '#undoBtn')
        const n0 = (await notes(page)).length
        await press(page, tap, '#undoBtn'); await sleep(900)
        const nAfter = (await notes(page)).slice(n0)
        await shot(page, 'A6', size, `${kind}-note-after-undo`)
        say(`A6 ${size} ${kind} (${cs}): Undo button title after FILING = ${JSON.stringify(uFile.undo.title)} aria ${JSON.stringify(uFile.undo.aria)}; note(s) after pressing Undo = ${JSON.stringify(nAfter)}`)
        const named = new RegExp(cs, 'i').test(uFile.undo.title + ' ' + nAfter.join(' '))
        const kindNamed = new RegExp(kind === 'leave' ? 'leave|OL' : 'duty', 'i').test(uFile.undo.title + ' ' + nAfter.join(' '))
        check('A6', `${size} ${kind}: Undo's words name the person (${cs}) and the kind`, named && kindNamed, { title: uFile.undo.title, notes: nAfter })
        // redo it, then change it (the remarks) and read Undo again
        await press(page, tap, '#redoBtn'); await sleep(700)
        await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2026, 7); await L.openDay(page, '2026-07-17')
        const row = page.locator(`[data-testid^="idy-row-"]`).filter({ hasText: `isr A6 ${kind}` }).first()
        if (!(await row.count())) { say(`NOT WALKED A6 ${size} ${kind} edit — card not found after Redo`); continue }
        await press(page, tap, row.locator('[data-testid="idy-open"]')); await tid(page, 'win-inputedit').waitFor(); await sleep(400)
        await page.fill('#inpEditRmk', `isr A6 ${kind} changed`)
        await press(page, tap, '#inpEditSave'); await sleep(700)
        if (await tid(page, 'oilconf').count()) { await press(page, tap, '[data-testid="oil-yes"]'); await press(page, tap, '[data-testid="oilconf-save"]'); await sleep(400) }
        for (const x of ['win-inputedit-x', 'win-inputsday-x']) if (await tid(page, x).count()) await press(page, tap, `[data-testid="${x}"]`)
        const uEdit = await undoState(page)
        const n1 = (await notes(page)).length
        await press(page, tap, '#undoBtn'); await sleep(900)
        const nEdit = (await notes(page)).slice(n1)
        await shot(page, 'A6', size, `${kind}-note-after-undo-of-edit`)
        say(`A6 ${size} ${kind} EDIT: Undo title after changing remarks = ${JSON.stringify(uEdit.undo.title)}; note(s) after Undo = ${JSON.stringify(nEdit)}`)
        check('A6', `${size} ${kind} edit: Undo's words name the person (${cs})`, new RegExp(cs, 'i').test(uEdit.undo.title + ' ' + nEdit.join(' ')), { title: uEdit.undo.title, notes: nEdit })
        await press(page, tap, '#undoBtn').catch(() => {}); await sleep(400)
      }
    } catch (e) { say(`ERROR A6 ${size}: ${e.message.split('\n')[0]}`); await shot(page, 'A6', size, 'error').catch(() => {}) }
    await ctx.close()
  }
}
if (process.argv[1].endsWith('isr-A-a6.mjs')) { await a6(); await L.finish('a6') }
