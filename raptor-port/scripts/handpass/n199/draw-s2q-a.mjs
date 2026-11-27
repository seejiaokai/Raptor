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
import { run, FACT, wait, signIn, pick, usersTab, openRow, box, words, shot, tring, linesOf, note, want, closeAll, hit, okDialogs, toastNow, ERRS } from './s2q-lib.mjs'
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
  /* the coordinator's word, 26 Nov 26: the line hangs under the Role box and moves nothing beside it. The two fields
     (Sign-in, Role) line up at their foot today, so a taller Role field dropped the Sign-in box; they are lined up at
     their head instead - with no line under the box the two looks are the same (both labels one height) */
  const fld = sel.closest('.mfield'), pair = fld.parentElement; pair.style.alignItems = 'start'
  const q = p.getBoundingClientRect(), f = fld.getBoundingClientRect()
  const [a, b] = [...pair.querySelectorAll(':scope > .mfield')]
  const lvl = a && b ? { labelTops: [a, b].map(m => Math.round(m.querySelector('label').getBoundingClientRect().top)), boxTops: [a, b].map(m => Math.round(m.querySelector('input,select').getBoundingClientRect().top)) } : null
  return { width: Math.round(q.width), fieldWidth: Math.round(f.width), fontSize: getComputedStyle(p).fontSize, color: getComputedStyle(p).color, level: lvl }
}, text)
/* the Role box's ring, kept clear of its "ROLE" label (the coordinator, 26 Nov 26: on the phone the ring touched it) */
async function ringRole(s) {
  const gap = await s.page.evaluate(() => { const sel = document.querySelector('#accEdRole'), l = sel.closest('.mfield').querySelector('label'); return Math.round(sel.getBoundingClientRect().top - l.getBoundingClientRect().bottom) })
  const clear = Math.max(0, Math.min(4, gap - 3)); await tring(s, await box(s, '#accEdRole'), clear); return { gap, clear }
}
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
  /* 26 Nov 26 run: the browser drew a listbox's greyed choices as white as the rest, and clipped the third. So the greyed
     choices take the browser's own grey (GrayText, as its open list draws them) and the list is sized to all three. It
     opens BELOW the box, as the browser opens it, covering what is under it (the reason line too) - the open list is a
     picture of its own (q13-d-rec-open); q13-d-rec shows the box closed with its reason line (the coordinator's word) */
  for (const o of c.options) if (o.disabled) o.style.color = 'GrayText'
  c.style.height = (c.scrollHeight + 4) + 'px'
  const cs = getComputedStyle(c); out.listLook = { bg: cs.backgroundColor, colour: cs.color, scheme: cs.colorScheme, greyed: [...c.options].map(o => getComputedStyle(o).color) }
  return out
}, desk)

try {
  for (const sz of ['d', 'p']) {
    if (want('rec', sz)) await run(`q13-${sz}-rec`, sz, async s => {
      const k = `q13-${sz}-rec`
      FACT(`${k}.today`, await reach(s))
      FACT(`${k}.reason`, await putReason(s, WQ.roleReason('149')))
      FACT(`${k}.reasonLines`, await linesOf(s, '#s2qnote'))
      FACT(`${k}.list`, await openList(s, false))   /* the box closed, at both sizes ("Admin" greyed in its choices) */
      FACT(`${k}.ring`, await ringRole(s)); await tring(s, await box(s, '#s2qnote'))
      FACT(`${k}.words`, await words(s, '#s2qnote'))
      await shot(s, k, [await box(s, ROW)], 12)
    })
    /* desktop only: the list open below the box, as the browser opens it (the phone draws its own, no picture holds it) */
    if (sz === 'd' && want('rec-open', sz)) await run(`q13-${sz}-rec-open`, sz, async s => {
      const k = `q13-${sz}-rec-open`
      FACT(`${k}.today`, await reach(s))
      await putReason(s, WQ.roleReason('149'))
      FACT(`${k}.list`, await openList(s, true))
      const list = await box(s, '#s2qlist'); await tring(s, list)
      await shot(s, k, [await box(s, ROW), list], 12)
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
      /* the coordinator's word, 26 Nov 26: 149 made to truly have one admin of its own first - Saber, through the real
         door (Osprey's Role box and Save on 149's page), makes Osprey a member; then Hunter's real Save is refused by the
         app, and only the refusal's words are replaced by the new sentence */
      await signIn(s, 'saber'); FACT(`${k}.saberBar`, await pick(s, 149)); await usersTab(s); await wait(s, 400)
      await openRow(s, 'osp9'); await s.page.selectOption('#accEdRole', 'main'); await wait(s, 200)
      await hit(s, '#accEdSave', 800); await okDialogs(s)
      FACT(`${k}.ospreyMember`, { note: await toastNow(s), row: await s.page.evaluate(() => document.querySelector('#page-admin .acc-row[data-person="osp9"]')?.innerText.replace(/\s+/g, ' ').trim()) })
      FACT(`${k}.today`, await reach(s, 'Kestrel', true))
      await s.page.selectOption('#accEdRole', 'main'); await wait(s, 300)
      await hit(s, '#accEdSave', 300)
      FACT(`${k}.realRefusal`, await s.page.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return null; const c = getComputedStyle(t); return { words: t.innerText.replace(/\s+/g, ' ').trim(), opacity: c.opacity, border: c.borderColor, colour: c.color, face: t.dataset.face || null } }))
      FACT(`${k}.dialog`, await s.page.evaluate(() => [...document.querySelectorAll('#dlgOk')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.closest('[role=dialog],.dlg,.modal')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 200))))
      await okDialogs(s); await wait(s, 300)
      FACT(`${k}.after`, await s.page.evaluate(() => ({ toast: document.getElementById('toastEl')?.innerText.replace(/\s+/g, ' ').trim(), kestrel: document.querySelector('#page-admin .acc-row[data-person="kes9"]')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 80), roleBox: document.querySelector('#accEdRole')?.value, osprey: document.querySelector('#page-admin .acc-row[data-person="osp9"]')?.innerText.replace(/\s+/g, ' ').trim() })))
      await s.page.evaluate(() => document.activeElement?.blur())
      const n = await note(s, WQ.lastAdmin('Kestrel', '149'), 'warn')
      FACT(`${k}.note`, n)
      await tring(s, n.box)
      await shot(s, k, [await box(s, ROW), n.box], 12)
    })
  }
} finally { FACT('errors', ERRS); await closeAll() }
