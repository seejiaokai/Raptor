// draw-s2q-b - section 2's question 14 on the one questions page (first written as question 11/B; chat 199, 26 Nov 26):
// a Plan holder's Undo of his own "made a member". Real presses: Hunter (142's admin, Plan of 149) picks 149, opens
// Osprey's row (an admin of 149), Role → Member, Save. Today his Undo would go through; by his D2730 Q8 it is refused.
// Today's Undo words ("Something else changed this after your action…", undo/timeline.ts OUT_OF_BAND) are NOT true here -
// nothing changed after his Save - so the fresh Fable's review drafted a new sentence (his to approve), and that is what is
// drawn (words-s2q.mjs undoRefusedPlan). The press is NOT made (it would undo today): the refusal is drawn as the app
// raises any refused Undo today - ui/topstate.ts: HOOKS.toast(reason, 'warn'), the amber passing note in its own place
// (ui/toast.ts placeToast: the screen's foot, centred on a desktop, full width less 12px on a phone).
//   q14-{d,p}-refused    the Undo button and the note, ringed
//   node raptor-port/scripts/handpass/n199/draw-s2q-b.mjs   (SZ=d,p)
import { run, FACT, wait, signIn, pick, usersTab, openRow, box, hit, shot, tring, note, want, closeAll, toastNow, okDialogs, linesOf, DRAWN, ERRS } from './s2q-lib.mjs'
import { WQ } from './words-s2q.mjs'

/* the whole screen dimmed but for the places the question is about (the coordinator's word, 26 Nov 26: a crop cut the
   left menu and the top bar through) - one see-through dark sheet with a hole round each place, under the rings */
const dim = (s, rects, pad = 8) => s.page.evaluate(([rects, pad]) => {
  const W = innerWidth, H = innerHeight, ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('width', W); svg.setAttribute('height', H)
  Object.assign(svg.style, { position: 'fixed', left: '0', top: '0', zIndex: '2147483645', pointerEvents: 'none' })
  let d = `M0 0H${W}V${H}H0Z`
  for (const r of rects) { const x = r.x - pad, y = r.y - pad, w = r.w + 2 * pad, h = r.h + 2 * pad; d += ` M${x} ${y}v${h}h${w}v${-h}Z` }
  const p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); p.setAttribute('fill', 'rgba(0,0,0,.62)'); p.setAttribute('fill-rule', 'evenodd')
  svg.appendChild(p); document.body.appendChild(svg)
}, [rects.filter(Boolean), pad])

const UNDO = '.topbar button[aria-label="Undo"]'
try {
  for (const sz of ['d', 'p']) if (want('refused', sz)) await run(`q14-${sz}`, sz, async s => {
    const k = `q14-${sz}-refused`
    await signIn(s, 'hunter'); FACT(`${k}.bar`, await pick(s, 149)); await usersTab(s); await wait(s, 400)
    await openRow(s, 'osp9')
    FACT(`${k}.ospreyBefore`, await s.page.evaluate(() => ({ role: document.querySelector('#accEdRole').value, row: document.querySelector('.acc-row.od-row-on .acc-main').innerText.replace(/\s+/g, ' ').trim() })))
    await s.page.selectOption('#accEdRole', 'main'); await wait(s, 200)
    await hit(s, '#accEdSave', 800); await okDialogs(s)
    FACT(`${k}.saved`, { note: await toastNow(s), ospreyAfter: await s.page.evaluate(() => document.querySelector('[data-person="osp9"] .acc-main')?.innerText.replace(/\s+/g, ' ').trim()) })
    FACT(`${k}.undoToday`, await s.page.evaluate(sel => { const b = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); return b ? { title: b.title, disabled: b.disabled } : null }, UNDO))
    await wait(s, 4500)   /* the "Saved" note gone */
    const n = await note(s, WQ.undoRefusedPlan('149'), 'warn'); FACT(`${k}.note`, n)
    FACT(`${k}.noteLines`, await linesOf(s, '#toastEl'))
    const u = await box(s, UNDO)
    await tring(s, u); await tring(s, n.box)
    /* the whole screen as it is, then `-crop` = the same whole screen dimmed but for three lit places: the Undo button,
       Osprey's row (reading Member, the sign his Save went through) and the note (the coordinator's word, 26 Nov 26) */
    await shot(s, k, [])
    const osp = await box(s, '#page-admin .acc-row[data-person="osp9"]'); FACT(`${k}.lit`, { undo: u, osprey: osp, note: n.box })
    await dim(s, [u, osp, n.box]); await wait(s, 200)
    await s.page.screenshot({ path: `${DRAWN}/${k}-crop.png` }); console.log(`  picture ${k}-crop.png (whole screen, dimmed)`)
  })
} finally { FACT('errors', ERRS); await closeAll() }
