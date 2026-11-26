// draw-s2q-b - section 2's question B (chat 199, 26 Nov 26): a Plan holder's Undo of his own "made a member". Real
// presses: Hunter (142's admin, Plan of 149) picks 149, opens Osprey's row (an admin of 149), Role → Member, Save. Today
// his Undo would go through; by his D2730 Q8 it is refused, in Undo's words today naming nobody (D2730 Q11 - undo/
// timeline.ts OUT_OF_BAND). The press is NOT made (it would undo today): the refusal is drawn as the app raises any
// refused Undo today - ui/topstate.ts: HOOKS.toast(reason, 'warn'), the amber passing note in its own place
// (ui/toast.ts placeToast: the screen's foot, centred on a desktop, full width less 12px on a phone).
//   s2q-b-{d,p}-refused    the Undo button and the note, ringed
//   node raptor-port/scripts/handpass/n199/draw-s2q-b.mjs   (SZ=d,p)
import { run, FACT, wait, signIn, pick, usersTab, openRow, box, hit, shot, tring, note, want, closeAll, toastNow, okDialogs, ERRS } from './s2q-lib.mjs'
import { WQ } from './words-s2q.mjs'

const UNDO = '.topbar button[aria-label="Undo"]'
try {
  for (const sz of ['d', 'p']) if (want('refused', sz)) await run(`b-${sz}`, sz, async s => {
    const k = `s2q-b-${sz}-refused`
    await signIn(s, 'hunter'); FACT(`${k}.bar`, await pick(s, 149)); await usersTab(s); await wait(s, 400)
    await openRow(s, 'osp9')
    FACT(`${k}.ospreyBefore`, await s.page.evaluate(() => ({ role: document.querySelector('#accEdRole').value, row: document.querySelector('.acc-row.od-row-on .acc-main').innerText.replace(/\s+/g, ' ').trim() })))
    await s.page.selectOption('#accEdRole', 'main'); await wait(s, 200)
    await hit(s, '#accEdSave', 800); await okDialogs(s)
    FACT(`${k}.saved`, { note: await toastNow(s), ospreyAfter: await s.page.evaluate(() => document.querySelector('[data-person="osp9"] .acc-main')?.innerText.replace(/\s+/g, ' ').trim()) })
    FACT(`${k}.undoToday`, await s.page.evaluate(sel => { const b = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); return b ? { title: b.title, disabled: b.disabled } : null }, UNDO))
    await wait(s, 4500)   /* the "Saved" note gone */
    const n = await note(s, WQ.undoRefused, 'warn'); FACT(`${k}.note`, n)
    const u = await box(s, UNDO)
    await tring(s, u); await tring(s, n.box)
    await shot(s, k, [u, n.box], 14)
  })
} finally { FACT('errors', ERRS); await closeAll() }
