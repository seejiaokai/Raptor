// draw-s2q-a - section 2's question 13 on the one questions page (first written as question 10/A; chat 199, 26 Nov 26):
// what a Plan holder sees where he can no longer make an admin (his D2730 Q8). Hunter (142's admin, Plan of 149) picks
// 149, opens Merlin's row (a 149 member with a sign-in) on 149's Admin → Users - real presses. Then drawn on the real row:
//   q13-{d,p}-rec        recommended: the Role box's list open, "Admin" greyed in it, one grey line of reason under the
//                        Role box in the look of the greyed Plan's reason (s2-18)
//   q13-{d,p}-other      the other choice: "Admin" picked as today, the Save refused in the page's own refusal - the
//                        amber passing note, the bare sentence (ui/UsersPanel.tsx done → HOOKS.toast(bad, 'warn'))
//   q13-{d,p}-lastadmin  the reworded last-admin line (the review §1's last row): Hunter opens Kestrel's row, picks Member,
//                        and the amber note at the foot says who can make another. DRAWN: in this world Osprey is 149's
//                        second admin, so the real app would not refuse here - the note is laid on as the app raises it.
// (The review dropped the alternative wording "…can make him an admin." - not drawn.)
// The open list of a Role box is the browser's or the phone's own (his lesson 104): on the desktop the browser's own
// listbox of the same choices is shown open under the box; on the phone the box is shown closed. Nothing here writes the
// app's code. NOT YET RUN (needs a build served at 4745 and the checks lock).
//   node raptor-port/scripts/handpass/n199/draw-s2q-a.mjs   (ONLY=rec,other,lastadmin  SZ=d,p)
import { run, FACT, wait, signIn, pick, usersTab, openRow, box, words, shot, tring, linesOf, note, want, closeAll, ERRS } from './s2q-lib.mjs'
import { WQ } from './words-s2q.mjs'

const ROW = '.acc-row.od-row-on'
/* `who` a person key, or a callsign read off the page (Kestrel's key is not fixed in the lib) */
async function reach(s, who = 'mer9', byName = false) {
  await signIn(s, 'hunter'); FACT('bar', await pick(s, 149)); await usersTab(s); await wait(s, 400)
  const pid = byName ? await pidOf(s, who) : who
  if (!pid) throw new Error(`${who} not found on 149's Admin → Users`)
  FACT('row', pid)
  await openRow(s, pid)
  await s.page.evaluate(sel => document.querySelector(sel).scrollIntoView({ block: 'start' }), ROW)
  await s.page.evaluate(() => scrollBy(0, -90)); await wait(s, 300)
  return s.page.evaluate(sel => {
    const r = document.querySelector(sel), sel2 = r.querySelector('#accEdRole')
    return { squadron: document.querySelector('.topbar .mark')?.textContent.trim(), row: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 220),
      roleBox: { value: sel2.value, options: [...sel2.options].map(o => o.textContent + (o.disabled ? ' [greyed]' : '')), disabled: sel2.disabled } }
  }, ROW)
}
/* Kestrel's person key, read off 149's page by his callsign (the world names him; his key is not fixed in the lib) */
const pidOf = (s, callsign) => s.page.evaluate(c => {
  const r = [...document.querySelectorAll('#page-admin .acc-row[data-person]')].find(e => e.querySelector('.acc-name')?.firstChild?.textContent.trim() === c)
  return r ? r.dataset.person : null
}, callsign)
/* the reason line under the Role box, in the app's own grey note (the class the Plan line's reason wears) */
const putReason = (s, text) => s.page.evaluate(text => {
  const sel = document.querySelector('#accEdRole'); let p = document.querySelector('#s2qnote')
  if (!p) { p = document.createElement('p'); p.className = 'adm-note acc-sq-note'; p.id = 's2qnote'; sel.after(p) }
  p.textContent = text; p.style.margin = '6px 0 0'
  const q = p.getBoundingClientRect(), f = sel.parentElement.getBoundingClientRect()
  return { width: Math.round(q.width), fieldWidth: Math.round(f.width), fontSize: getComputedStyle(p).fontSize, color: getComputedStyle(p).color }
}, text)
/* "Admin" greyed in the box's own choices (as "Master admin" already is for him today). His lesson 104: a list the browser
   or the phone draws itself is shown as it really shows, never in a look of the app's. On the desktop the browser's own
   list is shown by the browser itself: a copy of the box drawn open (`size`, the browser's own listbox of the same
   choices, its greyed ones greyed by the browser) hung under the box where the list opens. On his iPhone the list is
   the phone's own and no screen picture holds it: the box is shown closed and ringed, and the report says so. */
const openList = (s, desk) => s.page.evaluate(desk => {
  const sel = document.querySelector('#accEdRole'); sel.options[1].disabled = true
  const out = { options: [...sel.options].map(o => o.textContent + (o.disabled ? ' [greyed]' : '')) }
  if (!desk) return out
  const b = sel.getBoundingClientRect(), c = sel.cloneNode(true); c.id = 's2qlist'; c.size = c.options.length; c.removeAttribute('aria-label')
  c.value = sel.value
  Object.assign(c.style, { position: 'fixed', left: b.left + 'px', top: (b.bottom + 2) + 'px', width: b.width + 'px', height: 'auto', zIndex: 600, overflow: 'hidden' })
  document.body.appendChild(c)
  const cs = getComputedStyle(c); out.listLook = { bg: cs.backgroundColor, colour: cs.color, scheme: cs.colorScheme }
  return out
}, desk)

try {
  for (const sz of ['d', 'p']) {
    if (want('rec', sz)) await run(`q13-${sz}-rec`, sz, async s => {
      const k = `q13-${sz}-rec`
      FACT(`${k}.today`, await reach(s))
      FACT(`${k}.reason`, await putReason(s, WQ.roleReason('149')))
      FACT(`${k}.reasonLines`, await linesOf(s, '#s2qnote'))
      FACT(`${k}.list`, await openList(s, s.desk))
      const row = await box(s, ROW), list = s.desk ? await box(s, '#s2qlist') : null
      await tring(s, s.desk ? list : await box(s, '#accEdRole')); await tring(s, await box(s, '#s2qnote'))
      FACT(`${k}.words`, await words(s, '#s2qnote'))
      await shot(s, k, [row, list], 12)
    })
    if (want('other', sz)) await run(`q13-${sz}-other`, sz, async s => {
      const k = `q13-${sz}-other`
      FACT(`${k}.today`, await reach(s))
      await s.page.selectOption('#accEdRole', 'admin'); await wait(s, 300)   /* picked, as today allows (not saved) */
      FACT(`${k}.picked`, await s.page.evaluate(() => document.querySelector('#accEdRole').value))
      await s.page.evaluate(() => document.activeElement?.blur())
      const n = await note(s, WQ.roleRefused('149'), 'warn'); FACT(`${k}.note`, n)
      await tring(s, await box(s, '#accEdRole')); await tring(s, n.box)
      await shot(s, k, [await box(s, ROW), n.box], 12)
    })
    if (want('lastadmin', sz)) await run(`q13-${sz}-lastadmin`, sz, async s => {
      const k = `q13-${sz}-lastadmin`
      FACT(`${k}.today`, await reach(s, 'Kestrel', true))
      await s.page.selectOption('#accEdRole', 'main'); await wait(s, 300)    /* picked, not saved: the refusal is drawn */
      await s.page.evaluate(() => document.activeElement?.blur())
      const n = await note(s, WQ.lastAdmin('Kestrel', '149'), 'warn')
      FACT(`${k}.note`, { ...n, drawn: 'Osprey is a second admin of 149 in this world, so the real app would let this through' })
      await tring(s, n.box)
      await shot(s, k, [await box(s, ROW), n.box], 12)
    })
  }
} finally { FACT('errors', ERRS); await closeAll() }
