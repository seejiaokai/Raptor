/* The scheduler board's HTML assembly (renderScheduler's board loop) and its
   delegated handlers — the reference's bodies, verbatim, with repaint via the
   store's notify(). The CX-with-a-reason dialog state lives here too. */
import { DAYS } from '../engine/data'
import { INPUTS, inputCoversDate, inpById, inpTimeText } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { isStandalone, makeStandalone, waveDutyBlock, saDutyIx, DUTY_PICK, SAWAVE } from '../engine/waves'
import { waveInTime } from '../engine/events'
import { WARN, validate, WCODE, wlbl } from '../engine/validate'
import { hhmm, minus, parseHM } from '../engine/time'
import { VCONF } from '../engine/rules'
import { slotVal, txtGet, txtSet, acRef, rollCx } from '../engine/slots'
import { markEdit, markDeletion, deletionWasIssued, markStructuralAdd, trackStructuralAdd, alAttr } from '../engine/publish'
import { logAction, ELOG } from '../engine/editlog'
import { shiftAircraft, shiftFormation, shiftWave, shiftKeys, keyDay } from '../engine/keys'
import { applyMove, sortWave, sortDutyBlock, sortSims, sortGround, sortProg, sortDay } from '../engine/reorder'
import { HIST } from '../state/history'
import { signoffHTML, cxText, storesView } from './html'
import { setInpField } from './inputedit'
import { STORE_CFG } from '../engine'
import { HOOKS } from '../engine/hooks'
import { canEditSched } from '../state/auth'
import * as view from '../state/view'
import { esc } from '../state/view'
import { notify } from '../state/store'
import { sbNotesPanel, sbProgPanel, sbSlot, sbDutyPanel, sbSimRowsPanel, sbGroundPanel, sbInputsGroupPanel, sbUnavailPanel, labelToTitle, titleToLabel, titleToKind, sbGrip, sbNudge, rowMove, sbSortBtn } from './board-html'

const toast = (...a: any[]) => HOOKS.toast(...a)
const afterSchedMutate = () => view.afterSchedMutate()

/* renderScheduler's board string, verbatim. pv = published-version preview:
   read-only markup throughout, and no sign-off bar — the frozen record's
   signatures live on the AL record; live sign selects against an old day
   would invite edits against the wrong document. */
export function boardHTML(di: number, pv?: boolean) {
  const d = DAYS[di]
  /* the stores chips/C follow HOOKS.editMode(), not just pv: the render gate
     is then EXACTLY the click gate interactions.ts uses for
     data-store/data-stcfg (canEditSched() && CURPAGE==='editsched'). A bare
     CURPAGE test would still render the clickable chips and the
     contenteditable bombs field for a session that may not edit, and
     routeFocusOut (textedit.ts) checks only canEditSched() — so a blur on
     that field would commit and markEdit in a state the week would never
     have rendered the field in at all. */
  const stoRO = pv || !HOOKS.editMode()
  /* same gate as the stores chips: pv OR not in edit mode. A duty crew who
     still has a board open after navigating away must not get live controls. */
  const mvRO = stoRO
  /* THE WAY INTO THE CHANGES LIST, ON A DESKTOP (owner, 11 Aug 26 — "the
     history list will be shifted and can opened at the top of the board above
     the sign off section"). It rides at the top of the board proper, ahead of
     the sign-off bar, where the phone's copy sits in the day's checks panel.
     BOTH are rendered and CSS picks one per width (`.histln-top` desktop,
     `.histln` phone) rather than the builder asking HOOKS.isPhone(): a media
     query answers a resize instantly, where a builder decision is stuck until
     something else triggers a repaint — and the panels are string-diffed, so
     nothing does until an edit lands. It costs one node against 63 of
     headroom, which is the cheaper side of that trade.
     Not on a frozen preview: nothing else on that surface is live either. */
  let b = (pv ? '' : histLineHTML('histln-top'))
    + (pv ? '' : `<div class="signoff board-sign" id="sbSignBar">${signoffHTML(di, true)}</div>`)
    + sbNotesPanel(d, di, pv, mvRO) + sbProgPanel(d, di, pv, mvRO)
  let fly = ''
  ;(d.waves || []).forEach((w: any, gi: number) => {
    /* SC / AVALON / BB carry no store config on the week (html.ts's `sa`
       gate — a standalone line isn't a real jet loadout, it's a duty
       roster row wearing the flying-line template) — mirror that here so
       a store set from the board on a standalone line can't reach the AL
       and the CSV while staying permanently invisible/unremovable on the
       week, which the design spec requires to render identically on both
       surfaces. */
    const sa = isStandalone(w)
    const asd = w.formations.reduce((n: number, f: any) => n + f.aircraft.length, 0)
    /* SC and AVALON after Night wave (owner, 10 Aug 26) — the same list the
       + Wave picker offers, reachable from a wave that already exists. */
    const opts = ['1st wave', '2nd wave', '3rd wave', '4th wave', '5th wave', 'Night wave', 'SC', 'AVALON']
    const cur = labelToTitle(w); if (!opts.includes(cur)) opts.unshift(cur)
    const inT = waveInTime(w)
    /* mvRO, not pv (reviewer-found residual, 9 Aug 26): the wave header's
       own title select and its + Line / ✕ Wave pair were still pv-only,
       the same gap as everything else in this pass — a read-only board
       (a session that may not edit it, board still legitimately open on
       its own page) left the whole-wave rename and delete live even
       after the flying line's own rows went inert. */
    fly += `<div class="sb-go"><div class="sb-go-h"><span>Go ${gi + 1}</span>`
      + `<select class="sb-wtitle" aria-label="Wave" data-wsel="${di}.${gi}"${mvRO ? ' disabled' : ''}>${opts.map(o => `<option ${o === cur ? 'selected' : ''}>${o}</option>`).join('')}</select>`
      + `${w.night ? '<span class="night">· night</span>' : ''}`
      + `<span class="asd">in-time ${inT != null ? hhmm(inT) : '—'} · ${asd} ac</span>`
      + (mvRO ? '' : `<span class="gctl">${sbSortBtn(`w.${di}.${gi}`, mvRO)}<button class="mbtn add" data-gline="${di}.${gi}" title="Add a line to this wave">+ Line</button>`
      + `<button class="mbtn del" data-gdel="${di}.${gi}" title="Remove this whole wave">✕ Wave</button></span>`) + `</div>`
    fly += `<div class="sb-lcols"><span></span><span>CS</span><span>MSN</span><span>B</span><span>TO</span><span>LD</span><span>FCP</span><span>RCP</span><span>Notes</span><span></span></div>`
    if (!w.formations.length) fly += `<div class="sb-empty" style="padding:6px 11px">Empty wave — add a line, or remove the wave.</div>`
    w.formations.forEach((f: any, li: number) => f.aircraft.forEach((a: any, ai: number) => {
      const key = `${di}.${gi}.${li}.${ai}`, fp = `ff:${di}.${gi}.${li}`
      const cxOn = !!(a.cx || f.cx)
      /* stoRO, not pv alone — this was the last of the read-only gap left
         open on purpose while the stores-configuration feature shipped:
         every OTHER live-looking thing on this board (the stores chips,
         the grip, the nudge buttons, Sort all) already follows stoRO/mvRO
         (pv OR not in edit mode), but the flying line's own callsign,
         mission, brief, take-off, land and remarks inputs were still
         gated on pv by itself — so a board open for a session that may
         not edit it still let typed text commit.
         Same variable, same widening, no second mechanism. */
      const dis = stoRO ? ' disabled' : ''
      /* B (owner, 6 Aug 26), same funnel key and suggestion idiom as the
         week (ui/html.ts): data-bfld already flows through boardChange's
         generic txtSet path below, no new wiring needed. Wrapped so the
         optional ghost never changes this row's grid-item count — see the
         mobile column notes in scheduler.css. */
      const brief = minus(f.to, VCONF.briefLead)
      /* stoRO, not !pv (reviewer-found residual, 9 Aug 26): the ghost is a
         SEPARATE clickable element from the .tm brief input right next to
         it (interactions.ts's routeClick, data-bacc branch) — disabling
         the input's own `dis` attribute above never touched this one, so a
         read-only board still offered "click to accept" on the brief. */
      const brSug = (!stoRO && parseHM(f.br) == null)
        ? `<span class="bsug" data-bacc="${fp}.br" data-bval="${brief}" title="Click to accept the suggested brief time">${brief}</span>`
        : ''
      /* sbSlot's own `pv` param means "read-only" to that function, not
         literally "preview" — widened to stoRO below for the same reason
         as `dis` above: the FCP/RCP seats are the "arm/drop targets" the
         gap named, and sbSlot is only ever called from here (board.ts),
         so this is the one and only call site that needs to widen what it
         passes it.
         The row-control cluster below (nudge, CX, red flag, add-aircraft,
         delete) is the other half of the same gap, gated the same way:
         every sibling control this board grew after 8 Aug (the grip, the
         nudge buttons, Sort all) withholds itself on mvRO, but this OLDER
         cluster still withheld only on pv, so CX / ■ / + / ✕ stayed live
         and enabled on a read-only board — widened to mvRO below. Omitting
         the whole span (not just disabling the buttons inside it) is the
         same shape sbRowCtl already uses for the duty/sim/ground row
         clusters, and it is safe here for the same reason: this is the
         LAST grid item in the row template, so leaving it out empties the
         trailing track rather than shifting every earlier field left the
         way dropping the FIRST item (the grip) once did — finding #1's fix
         is what taught this codebase that distinction. */
      fly += `<div class="sb-line${cxOn ? ' cx' : ''}${a.flag ? ' redbox' : ''}"${rowMove(`mv:ac.${key}`, mvRO)}>
        ${sbGrip(mvRO)}
        <input class="lin" data-bfld="${fp}.cs"${alAttr(`${fp}.cs`)}${dis} value="${esc(f.cs)}">
        <input class="msn" data-bfld="${fp}.msn"${alAttr(`${fp}.msn`)}${dis} value="${esc(f.msn)}">
        <div class="sb-bcell">${brSug}<input class="tm" data-bfld="${fp}.br"${alAttr(`${fp}.br`)}${dis} value="${esc(f.br || '')}"></div>
        <input class="tm" data-bfld="${fp}.to"${alAttr(`${fp}.to`)}${dis} value="${esc(f.to)}">
        <input class="tm" data-bfld="${fp}.ld"${alAttr(`${fp}.ld`)}${dis} value="${esc(f.ld)}">
        ${sbSlot(di, key + '.p', 'p', a.p, stoRO)}
        ${sbSlot(di, key + '.w', 'w', a.w, stoRO)}
        <div class="sb-rcell"${alAttr(`st:${key}`)}>
          <input class="nts" data-bfld="fr:${key}"${alAttr(`fr:${key}`)}${dis} value="${esc(a.rmks || '')}"${sa ? ` placeholder="${esc(a.role || (a.spare ? 'SPARE' : 'MAIN'))}"` : ''}>
          ${sa ? '' : (stoRO
            ? storesView(a.opts)
            : `<span class="stores">`
              /* labels are user-renamable text (stores-edit.test.tsx's escape
                 regression) — esc() here, same as html.ts's identical on-chip,
                 or a renamed store types markup on the board same as the week
                 used to before that fix. */
              + STORE_CFG.filter(([k]: any) => (a.opts || {})[k]).map(([k, lab]: any) =>
                  `<span class="stchip on" data-store="${key}.${k}" title="Remove ${esc(lab)}">${esc(lab)}</span>`).join('')
              + `<button class="stcfg" data-stcfg="${key}" title="Stores configuration">C</button>`
              + `<span class="bombs" contenteditable="true" data-bombs="${key}">${esc((a.opts || {}).bombs || '')}</span></span>`)}
        </div>
        ${mvRO ? '' : `<span class="lctl">
          ${sbNudge(`mv:ac.${key}`, mvRO)}
          <button class="mbtn${cxOn ? ' on' : ''}" data-lcx="${key}" title="${cxOn ? 'Restore this line' : 'Cancel this line (CX)'}">CX</button>
          <button class="mbtn red${a.flag ? ' on' : ''}" data-lflag="${key}" title="${a.flag ? 'Clear the red box' : 'Red box — flag this for the next scheduler'}">■</button>
          <button class="mbtn add" data-lac="${di}.${gi}.${li}" title="Add another aircraft to this formation">+</button>
          <button class="mbtn del" data-ldel="${key}" title="Remove this line">✕</button>
        </span>`}
      </div>`
    }))
    fly += `</div>`
  })
  b += fly || `<div class="sb-empty" style="padding:14px 11px">No flying waves yet — use “+ Wave”.</div>`
  /* the four sections the board was missing (owner request, Aug 26): same
     order as the week day, with the sim planning notes staying last */
  /* the sim note used to be a panel of its own at the very bottom; it now sits
     inside the Sims panel, so the board reads the same way the week does. */
  b += sbDutyPanel(d, di, pv, mvRO) + sbSimRowsPanel(d, di, pv, mvRO) + sbGroundPanel(d, di, pv, mvRO)
  /* one pass over INPUTS for both blocks — the board rebuilds on every edit */
  const dayInp = INPUTS.filter((i: any) => inputCoversDate(i, d.dt))
  b += sbInputsGroupPanel(d, di, pv, dayInp, mvRO) + sbUnavailPanel(d, di, dayInp, mvRO)
  return b
}

export function boardWarnHTML(di: number) {
  const d = DAYS[di]
  const dw = (WARN.byDay[di] && WARN.byDay[di].warns) || []
  /* .sbwrap/.open + data-sbwtog + .sbw-car exist for the PHONE fold (owner,
     8 Aug 26 — the always-open strip scrolled inside the one board
     scroller). Desktop hides the caret and its toggle branch is
     isPhone()-gated, so the header stays inert there and the rows always
     show. The ⚠ prints only when there is something to warn about. */
  let wh = `<div class="sbwrap${SBWOPEN ? ' open' : ''}">`
    + `<div class="wh" data-sbwtog title="Show / hide the day's checks">`
    + `<span class="sbw-car">${SBWOPEN ? '▾' : '▸'}</span>`
    + `${dw.length ? '⚠ ' : ''}Live checks · ${dw.length} for ${esc(d.dow)}</div>`
  if (dw.length) {
    /* Iterate WARN's own array, unsorted: validate() has already ordered it by
       SORD (hard, adv, note), so the local hard-first sort this used to do was a
       second copy of ordering the engine owns — and re-ordering would break the
       index these rows now carry. Same order as the week's .dwlist, which also
       iterates as stored; the two lists could previously disagree. */
    dw.forEach((w: any, ix: number) => {
      const names = (w.who || []).map((id: any) => PEOPLE[id] ? PEOPLE[id].cs : id).join(', ')
      /* the selected state goes in the STRING, not on a class painted later:
         SchedBoard diffs this html against the last one to decide whether to
         re-hang the panel, so a class added afterwards is lost on the next
         unrelated repaint */
      const on = view.WFOCUS && view.WFOCUS.di === di && view.WFOCUS.ix === ix ? ' on' : ''
      wh += `<div class="wln ${w.sev}${on}" data-wdi="${di}" data-wix="${ix}" title="Jump to the puck that caused this">${esc(names)}${names ? ' — ' : ''}${esc(wlbl(w.msg || WCODE[w.code] || w.code || ''))}</div>`
    })
  } else wh += `<div class="wln ok">No conflicts flagged for this day ✓</div>`
  /* THE WAY INTO THE CHANGES LIST (owner, 11 Aug 26), and it lives here
     rather than on the top bar for a measured reason: a second control up
     there took the phone bar from 70px to 92px, wrapping the day name onto a
     line of its own, which is the failure HANDOFF's "do not add a control
     back to this bar without taking one off" describes. This panel is where
     the board already puts what is true of the day as a whole, it is the
     first thing on the phone board (order:-1) and the side column on a
     desktop, and it costs the bar nothing.
     It shows only while History is on — the owner's own phrasing was "when I
     enable history, there is ALSO an option to view the history of all
     edits", so it is a second thing the mode brings, not a permanent control
     competing with the day's checks for attention.
     Counted here rather than in the modal so the number is visible before you
     open it: an empty log says so up front instead of after a tap. */
  wh += `</div>`
  /* OUTSIDE .sbwrap, not inside it — on a phone that wrapper folds shut by
     default and hides every .wln, so an entry in there would be invisible
     until you had opened a panel about something else. It is also not one
     of the day's checks: those are about this day's flying, this is about
     the session. CSS shows this copy only under 820px — see histLineHTML. */
  wh += histLineHTML('histln')
  return wh
}

/* ONE definition of the way in, rendered twice at different widths. Counted
   here rather than in the modal so the number is visible before you open it:
   an empty log says so up front instead of after a tap. It shows only while
   History is on — the owner's phrasing was "when I enable history, there is
   ALSO an option to view the history of all edits", so it is a second thing
   the mode brings, not a permanent control competing with the day's checks. */
function histLineHTML(cls: string) {
  if (!view.HISTMODE) return ''
  const n = ELOG.rows.length
  return `<button class="${cls}" data-histopen title="Every change made this session, newest first">`
    + `☰ ${n ? `${n} change${n > 1 ? 's' : ''} this session` : 'No changes yet'}</button>`
}

export function dayTabsHTML(di: number) {
  return DAYS.map((x: any, i: number) => `<span class="sbday ${i === di ? 'on' : ''}" data-sbtab="${i}">${esc(x.dow.slice(0, 3))} ${esc(x.dt.replace('Jul ', ''))}</span>`).join('')
}

/* ---- CX-with-a-reason dialog state ---- */
export const CX_QUICK = ['WX', 'U/S AIRCRAFT', 'CREW SICK', 'NO AIRSPACE', 'TASKING', 'ENGINEERING', 'SLIPPED']
export let CXT: any = null
export function setCxt(v: any) { CXT = v }
export function askCx(o: any, key: any, label: any, after?: any) {
  if (!o) return
  CXT = { o, key, after: after || null, label: label || 'this line' }
  notify()
}
export function cxCommit(cancel: boolean, reason: string) {
  if (!CXT) return
  /* the standard guard, added here for the first time (reviewer-found
     follow-up, 9 Aug 26): cxCommit carried NO role or mode check of its
     own at all — every other write path in this file does now — so a
     stale CX dialog left open through a role or mode change (or, before
     closeBoardState() started clearing CXT on a page change, a dialog
     that had genuinely outlived its board) could still confirm and write.
     Not reachable by a normal user today (the dialog sits above the
     drawer, and the page behind it takes neither pointer nor keyboard from
     there), same defence-in-depth framing as the rest of this task — but
     it is the last write path of this family with no check at all. */
  if (!canEditSched() || !HOOKS.editMode()) { CXT = null; notify(); return }
  const { o, key, after, label } = CXT
  if (cancel) { o.cx = true; o.cxr = String(reason).trim() }
  else { o.cx = false; delete o.cxr }
  CXT = null
  if (key) markEdit(key)
  if (after) after()
  afterSchedMutate()
  /* logged as a sentence, not a value pair: cancelling writes `cx`/`cxr`,
     which are not addressed by any slot key, so the markEdit above marks the
     row's TEXT key and has no before/after to hand over. Cancelling a line is
     one of the loudest things a scheduler does to a day and it used to leave
     the changes list empty. The reason is carried too — it is the whole point
     of asking for one. */
  logAction(key == null ? null : keyDay(key),
    cancel ? `${cxText(o)} — ${label}` : `Restored ${label}`)
  toast(cancel ? cxText(o) : 'Restored')
}

/* ---- Sort all: one control for the WHOLE day, same confirm-dialog shape as
   CX above (owner asked for this after being advised against it — it rewrites
   every list on the day, and every one of those is an amendment). Every other
   board control acts on one row; this one does not, so it gets its own
   confirmation naming the day, not a browser confirm() and not silence. ---- */
export let SORTALL: any = null
export function setSortAll(v: any) { SORTALL = v }
/* canEditSched() and the DPREV (frozen-preview) guard live HERE, not only on
   the button's render gate — a stale button left over from a role change, or
   a click that lands after a preview was armed, must not open the dialog
   either. Same belt-and-braces the row-level sort/nudge branches use in
   boardMbtn below. */
export function askSortAll(di: any) {
  if (!canEditSched() || !HOOKS.editMode() || view.DPREV.has(di)) return
  SORTALL = di
  notify()
}
export function cancelSortAll() { SORTALL = null; notify() }
/* the confirmed run. HIST.lock suppresses every markEdit() that sortDay's six
   sorters fire — so however many sections move, NOTHING pushes while it is
   set — and the single afterSchedMutate() after the lock lifts is the one
   push that reaches the stack: its own bare markEdit() is what actually
   records the step, the same "the epilogue's markEdit is the one that
   counts" idiom every mutation funnel entry already relies on. Six sorters,
   one entry — that is the whole point of the lock: Undo has to be one step
   back to "before Sort all", not six steps into a half-sorted day.
   An already-ordered day must come back false from sortDay and change
   nothing at all — no lock needed for that path, since nothing inside it
   ever calls markEdit. */
export function sortAllCommit() {
  if (SORTALL == null) return
  const di = SORTALL
  SORTALL = null
  if (!canEditSched() || !HOOKS.editMode() || view.DPREV.has(di)) { notify(); return }
  const d = DAYS[di]
  HIST.lock = true
  let any = false
  try { any = sortDay(di) } finally { HIST.lock = false }
  /* ONE line, not one per section. sortDay runs six sorters and the reorder
     paths mark keys without changing a value, so the log stays silent through
     all of it by construction — the same shape as HIST.lock above, and for the
     same reason: this was one action. */
  if (any) { logAction(di, `Every section on ${d.dow} sorted`); afterSchedMutate(); toast(`Every section on ${d.dow} sorted`) }
  else { notify(); toast('Already in order') }
}

/* A STRUCTURAL CHANGE — a line, wave, row or note added or removed — said
   once, to the scheduler and to the edit log, in the same words.
   Deletes use an inert del: tombstone for amendments rather than re-marking
   the address they removed; the log still has no value pair or live cell to
   hang a bubble on, so the sentence the toast already says is its record.
   Routing both through one call is what stops the two
   drifting: a toast reworded here cannot leave the log saying the old thing.
   Returns the toast, so every `return toast(…)` site became `return act(…)`
   with no change to how any of them behave. */
const act = (di: any, msg: string) => { logAction(di, msg); return toast(msg) }

/* the board's delegated .mbtn click handler, verbatim bodies */
export function boardMbtn(e: MouseEvent) {
  /* previewing a published version: the panels render no controls, but a stale
     element from the pre-preview markup must not mutate the live day */
  if (view.DPREV.has(view.SBDAY as any)) return
  /* editMode(), not just the role — every branch below writes straight to
     the live model, and a stale or forced click on a read-only board (the
     role changed, or a stale element survived from a board that was open
     before the page moved away from Edit Schedule) must not act
     just because the session is still an admin's. This used to be three
     separate copies of this exact check, found and added one at a time
     across two review passes (the nudge branch below, the per-section sort
     branch, delete-line) — CX, the red flag and add-aircraft never got a
     copy of their own at all, which is the other half of the gap this
     closes. One guard here covers every branch in this function, so the
     next branch added here inherits it instead of having to rediscover the
     gap by itself.
     LOAD-BEARING for tests that predate this consolidation, not just the
     ones added alongside it: the nudge, per-section-sort and delete-line
     branches lost their OWN copy of this check when it moved up here
     (board.test.tsx's "a stale nudge button does nothing", "a stale
     per-section Auto sort button does nothing" and "the delete-line (✕)
     button does nothing" all still pass, but only because THIS line still
     runs before their branch — narrowing or removing this guard without
     giving those three branches their own check back would silently
     reopen the exact gap those tests were written to catch, even though
     the tests themselves would keep passing right up until whatever future
     change actually narrows it. */
  if (!canEditSched() || !HOOKS.editMode()) return
  const t = (e.target as HTMLElement).closest('.mbtn') as HTMLElement | null; if (!t) return
  const ds = t.dataset
  /* ▲/▼ — the phone's reorder gesture. The target is read off the NEIGHBOURING
     ROW IN THE DOM rather than computed as index±1, because one list (Ground)
     renders time-sorted: "one place down" is a question about what the
     scheduler can see, and engine/reorder.ts translates the model indices. */
  if (ds.mvup != null || ds.mvdn != null) {
    const up = ds.mvup != null
    const row = t.closest('[data-move]') as HTMLElement | null
    if (!row) return
    const rows = [...(row.parentElement ? row.parentElement.children : [])]
      .filter(x => (x as HTMLElement).dataset && (x as HTMLElement).dataset.move) as HTMLElement[]
    const i = rows.indexOf(row), j = up ? i - 1 : i + 1
    if (i < 0 || j < 0 || j >= rows.length) return
    if (applyMove(row.dataset.move, rows[j].dataset.move)) { afterSchedMutate(); notify() }
    return
  }
  /* ⇅ Auto sort — one control per section, dispatched by the address's own
     prefix (w/d/s/g/p) rather than by which panel the click landed in, so
     which sorter answers which section lives in exactly one place. Same
     read-only gate as every branch here (checked once, at the top of this
     function) — sbSortBtn already withholds the button itself in the
     ordinary case. 'Already in order' rather than silence: a scheduler who
     reaches for the way-back control on a tidy section should hear that it
     IS tidy, not wonder whether the click landed. */
  if (ds.sortsec != null) {
    const [kind, ...rest] = String(ds.sortsec).split('.')
    const n = rest.map(Number)
    /* Ground is the one section where "changed" can be true with the row
       order untouched: sortGround always clears gman, so a day that was
       frozen in manual mode but already happened to read in time order
       comes back changed=true with the SAME row array (engine/reorder.ts
       never reassigns it on that path) — read here before the call so the
       toast can tell that apart from a real reorder, rather than staying
       silent about the one thing that DID happen (review fix, 9 Aug 26). */
    const gDay = kind === 'g' ? DAYS[n[0]] : null
    const gWasMan = !!(gDay && gDay.gman), gRowsBefore = gDay && gDay.ground
    let changed = false
    if (kind === 'w') changed = sortWave(n[0], n[1])
    else if (kind === 'd') changed = sortDutyBlock(n[0], n[1])
    else if (kind === 's') changed = sortSims(n[0], rest[1])
    else if (kind === 'g') changed = sortGround(n[0])
    else if (kind === 'p') changed = sortProg(n[0])
    if (changed) {
      afterSchedMutate(); notify()
      if (kind === 'g' && gWasMan && gDay!.ground === gRowsBefore) toast('Ground programme back to time order')
    }
    else toast('Already in order')
    return
  }
  /* CX, the red flag and add-aircraft (below) carried no check of their own
     at all before the top-level guard above — the read-only board's own
     documented gap named these three by name. Covered now, same as every
     other branch here. */
  if (ds.lcx != null) { const r = acRef(ds.lcx); if (!r || !r.a) return; return askCx(r.a, `fr:${ds.lcx}`, 'this line', () => rollCx(r.f)) }
  if (ds.lflag != null) {
    const r = acRef(ds.lflag); if (!r || !r.a) return
    r.a.flag = !r.a.flag; markEdit(`fr:${ds.lflag}`); afterSchedMutate(); notify()
    return toast(r.a.flag ? 'Red box — flagged for the next scheduler' : 'Red box cleared')
  }
  if (ds.ldel != null) {
    const r = acRef(ds.ldel); if (!r || !r.a) return
    const [dI, gI] = String(ds.ldel).split('.').map(Number)
    const issued = deletionWasIssued(dI, 'line', gI, r.li, r.ai)
    r.f.aircraft.splice(r.ai, 1)
    shiftAircraft(dI, gI, r.li, r.ai)
    if (!r.f.aircraft.length) { r.w.formations.splice(r.li, 1); shiftFormation(dI, gI, r.li) } else rollCx(r.f)
    markDeletion(dI, 'line', issued); afterSchedMutate(); notify(); return act(dI, 'Line removed')
  }
  if (ds.lac != null) {
    const [di, gi, li] = ds.lac.split('.').map(Number)
    const f = DAYS[di].waves[gi].formations[li]
    f.aircraft.push({ p: '', w: '', area: '', rmks: '', opts: {} }); rollCx(f)
    markStructuralAdd(`fr:${di}.${gi}.${li}.${f.aircraft.length - 1}`); afterSchedMutate(); notify(); return act(di, 'Aircraft added')
  }
  if (ds.gline != null) {
    const [di, gi] = ds.gline.split('.').map(Number)
    /* A NEW LINE COMES UP BLANK (owner, 10 Aug 26). It used to copy the
       previous line's callsign, mission, take-off and land, which reads as
       filled in when nobody filled it in — a plausible wrong time is worse
       than an empty box, because only the empty one asks to be typed into. */
    const w = DAYS[di].waves[gi]
    w.formations.push({ cs: '', msn: '', to: '', ld: '', aircraft: [{ p: '', w: '', area: '', rmks: '', opts: {} }] })
    markStructuralAdd(`ff:${di}.${gi}.${w.formations.length - 1}.cs`); afterSchedMutate(); notify(); return act(di, 'Line added')
  }
  if (ds.gdel != null) {
    const [di, gi] = ds.gdel.split('.').map(Number)
    const gw = DAYS[di].waves[gi]
    const issued = deletionWasIssued(di, 'wave', gi)
    DAYS[di].waves.splice(gi, 1); shiftWave(di, gi)
    /* An SC wave owns TWO duty blocks, not one, so this walks the list rather
       than finding a single index — highest first, because each splice
       renumbers everything after it and shiftKeys has to see the same order. */
    if (gw && isStandalone(gw) && Array.isArray(DAYS[di].dutywaves)) {
      saDutyIx(DAYS[di], gw).forEach((j: number) => {
        DAYS[di].dutywaves.splice(j, 1);[`d:${di}.`, `dr:${di}.`, `dl:${di}.`].forEach(h => shiftKeys(h, 0, j))
      })
    }
    markDeletion(di, 'wave', issued); afterSchedMutate(); notify(); return act(di, 'Wave removed')
  }
  if (ds.nadd != null) {
    const d = DAYS[+ds.nadd]; d.notes = d.notes || []; d.notes.push('')
    markStructuralAdd(`dn:${+ds.nadd}.${d.notes.length - 1}`); logAction(+ds.nadd, 'Note added'); afterSchedMutate(); notify(); return
  }
  if (ds.ndel != null) {
    const [di, ni] = ds.ndel.split('.').map(Number)
    const issued = deletionWasIssued(di, 'note', ni)
    DAYS[di].notes.splice(ni, 1); shiftKeys(`dn:${di}.`, 0, ni)
    markDeletion(di, 'note', issued); afterSchedMutate(); notify(); return act(di, 'Note removed')
  }
  if (ds.padd != null) {
    const d = DAYS[+ds.padd]; d.allhands = d.allhands || []
    d.allhands.push({ prog: '', sub: '', str: '', end: '', who: [] })
    markStructuralAdd(`ap:${+ds.padd}.${d.allhands.length - 1}.prog`); logAction(+ds.padd, 'Programme item added'); afterSchedMutate(); notify(); return
  }
  if (ds.pdel != null) {
    const [di, ri] = ds.pdel.split('.').map(Number)
    const issued = deletionWasIssued(di, 'programme', ri)
    DAYS[di].allhands.splice(ri, 1)
    ;[`ap:${di}.`, `a:${di}.`].forEach(h => shiftKeys(h, 0, ri))
    markDeletion(di, 'programme', issued); afterSchedMutate(); notify(); return act(di, 'Item removed')
  }
  if (ds.pcx != null) { const [di, ri] = ds.pcx.split('.').map(Number); return askCx(DAYS[di].allhands[ri], `ap:${di}.${ri}.prog`, 'this item') }
  if (ds.pflag != null) {
    const [di, ri] = ds.pflag.split('.').map(Number); const x = DAYS[di].allhands[ri]
    x.flag = !x.flag; markEdit(`ap:${di}.${ri}.prog`); afterSchedMutate(); notify()
    return toast(x.flag ? 'Red box — flagged for the next scheduler' : 'Red box cleared')
  }
  /* ---- duty / sim / ground rows (the panels added Aug 26) ---------------
     Same shapes as the p* programme branches: adds mark the new row's name
     key, deletes renumber the surviving keys and add an inert deletion
     tombstone, CX goes through the reason dialog. */
  /* + BLOCK ASKS WHICH WAVE IT IS FOR (owner, 10 Aug 26). It used to push a
     bare block titled DUTY with one empty row, so every block was typed out
     by hand — the same three roles, every wave, every day. Naming the wave is
     the one thing that decides all of it: the title, and which desk it needs
     (engine/waves.ts's waveDutyBlock). "Empty block" keeps the old behaviour
     for anything that is not a wave's desk at all. */
  if (ds.dwadd != null) {
    const di = +ds.dwadd
    return blockMenu(t, di)
  }
  if (ds.dwdel != null) {
    const [di, wi] = ds.dwdel.split('.').map(Number)
    const issued = deletionWasIssued(di, 'dutyblock', wi)
    DAYS[di].dutywaves.splice(wi, 1)
    ;[`d:${di}.`, `dr:${di}.`, `dl:${di}.`].forEach(h => shiftKeys(h, 0, wi))
    markDeletion(di, 'dutyblock', issued); afterSchedMutate(); notify(); return act(di, 'Duty block removed')
  }
  if (ds.dradd != null) {
    const [di, wi] = ds.dradd.split('.').map(Number)
    const rows = DAYS[di].dutywaves[wi].rows
    rows.push({ role: '', id: '', str: '', end: '' })
    markStructuralAdd(`dr:${di}.${wi}.${rows.length - 1}.role`); logAction(di, 'Duty row added'); afterSchedMutate(); notify(); return
  }
  if (ds.drdel != null) {
    const [di, wi, ri] = ds.drdel.split('.').map(Number)
    const issued = deletionWasIssued(di, 'duty', wi, ri)
    DAYS[di].dutywaves[wi].rows.splice(ri, 1)
    ;[`d:${di}.${wi}.`, `dr:${di}.${wi}.`].forEach(h => shiftKeys(h, 0, ri))
    markDeletion(di, 'duty', issued); afterSchedMutate(); notify(); return act(di, 'Duty row removed')
  }
  if (ds.drcx != null) { const [di, wi, ri] = ds.drcx.split('.').map(Number); return askCx(DAYS[di].dutywaves[wi].rows[ri], `dr:${di}.${wi}.${ri}.role`, 'this duty') }
  if (ds.drflag != null) {
    const [di, wi, ri] = ds.drflag.split('.').map(Number); const x = DAYS[di].dutywaves[wi].rows[ri]
    x.flag = !x.flag; markEdit(`dr:${di}.${wi}.${ri}.role`); afterSchedMutate(); notify()
    return toast(x.flag ? 'Red box — flagged for the next scheduler' : 'Red box cleared')
  }
  if (ds.sradd != null) {
    const [di, kind] = ds.sradd.split('.')
    const d = DAYS[+di]; d.sims = d.sims || {}
    const rows = (d.sims[kind] = d.sims[kind] || [])
    rows.push({ label: '', str: '', end: '' })
    markStructuralAdd(`sr:${+di}.${kind}.${rows.length - 1}.label`); logAction(+di, 'Sim row added'); afterSchedMutate(); notify(); return
  }
  if (ds.srdel != null) {
    const [di, kind, ri] = ds.srdel.split('.')
    const issued = deletionWasIssued(+di, 'sim', kind, +ri)
    DAYS[+di].sims[kind].splice(+ri, 1)
    ;[`s:${di}.${kind}.`, `sr:${di}.${kind}.`].forEach(h => shiftKeys(h, 0, +ri))
    markDeletion(+di, 'sim', issued); afterSchedMutate(); notify(); return act(+di, 'Sim row removed')
  }
  if (ds.srcx != null) { const [di, kind, ri] = ds.srcx.split('.'); return askCx(DAYS[+di].sims[kind][+ri], `sr:${di}.${kind}.${ri}.label`, 'this sim') }
  if (ds.srflag != null) {
    const [di, kind, ri] = ds.srflag.split('.'); const x = DAYS[+di].sims[kind][+ri]
    x.flag = !x.flag; markEdit(`sr:${di}.${kind}.${ri}.label`); afterSchedMutate(); notify()
    return toast(x.flag ? 'Red box — flagged for the next scheduler' : 'Red box cleared')
  }
  if (ds.gradd != null) {
    const d = DAYS[+ds.gradd]; d.ground = d.ground || []
    d.ground.push({ prog: '', str: '', end: '', who: '' })
    markStructuralAdd(`gr:${+ds.gradd}.${d.ground.length - 1}.prog`); logAction(+ds.gradd, 'Ground item added'); afterSchedMutate(); notify(); return
  }
  if (ds.grdel != null) {
    const [di, ri] = ds.grdel.split('.').map(Number)
    const row = DAYS[di].ground[ri]
    const issued = deletionWasIssued(di, 'ground', ri, row && row.src)
    DAYS[di].ground.splice(ri, 1)
    ;[`g:${di}.`, `gr:${di}.`].forEach(h => shiftKeys(h, 0, ri))
    markDeletion(di, 'ground', issued); afterSchedMutate(); notify(); return act(di, 'Ground item removed')
  }
  if (ds.grcx != null) { const [di, ri] = ds.grcx.split('.').map(Number); return askCx(DAYS[di].ground[ri], `gr:${di}.${ri}.prog`, 'this item') }
  if (ds.grflag != null) {
    const [di, ri] = ds.grflag.split('.').map(Number); const x = DAYS[di].ground[ri]
    x.flag = !x.flag; markEdit(`gr:${di}.${ri}.prog`); afterSchedMutate(); notify()
    return toast(x.flag ? 'Red box — flagged for the next scheduler' : 'Red box cleared')
  }
}

/* the board field-change handler (through the text funnel) */
export function boardChange(e: Event) {
  if (view.DPREV.has(view.SBDAY as any)) return   // same stale-markup guard as boardMbtn
  /* boardChange carried NO check of any kind, role or mode — unlike
     boardMbtn and boardArmClick, which at least checked the role. This is
     the write path behind the flying line's callsign, mission, brief,
     take-off, land and remarks inputs (and every other data-bfld field on
     the board), so it is exactly the path a read-only board's still-live
     inputs used to commit straight through: a typed callsign became a
     model write with nothing here to refuse it. Same gate as boardMbtn's
     top-level guard.
     RO is computed, not an early return, on purpose (reviewer-found gap in
     THIS pass's own first attempt, 9 Aug 26): an early `return` here skips
     past the revert branch below (`else f.value = txtGet(p)`) exactly the
     way a failed `txtSet` already reverts a rejected value — so a field
     that is still rendered live for any reason (a stale render, or one of
     the panels the render-widening below missed) would silently keep
     whatever was typed into it ON SCREEN forever, with the model holding
     the old value underneath: worse than a dead control, because a
     scheduler sees their own words sitting there and reasonably believes
     it saved. Blocked writes now revert the field the same way a rejected
     one always has. */
  const RO = !canEditSched() || !HOOKS.editMode()
  /* the wave-title select: night flag + label, verbatim */
  const s = (e.target as HTMLElement).closest('[data-wsel]') as HTMLSelectElement | null
  if (s) {
    /* a <select>'s own chosen option is the browser's internal state, not
       ours — notify() alone would not restore it, because nothing in the
       model changed for the panel-diff to notice, so the stale selection
       is put back explicitly, from the model, the same way the diff would
       on the next real repaint. */
    if (RO) { const [rdi, rgi] = s.dataset.wsel!.split('.'); const rw = DAYS[+rdi!]?.waves?.[+rgi!]; if (rw) s.value = labelToTitle(rw); return }
    const [di, gi] = s.dataset.wsel!.split('.'); const w = DAYS[+di!].waves[+gi!]
    /* PICKING SC OR AVALON LABELS THE WAVE, IT DOES NOT REBUILD IT (owner,
       10 Aug 26, asked and answered). Rebuilding into 4 or 8 MAIN/SPARE lines
       would be the tidier shape but it throws away whatever is already
       planted, and this control sits one mis-click away from a full wave.
       So: the kind, the exemption flags and the name change; the formations
       are left exactly as they are. Its duty block comes from + Block.
       Going BACK to an ordinary wave clears the standalone flags, or the
       wave would keep sitting outside the day's flying count for ever. */
    const kind = titleToKind(s.value)
    if (kind) {
      const S = SAWAVE[kind]
      w.standalone = true; w.kind = kind; w.noconf = !!S.all; w.night = kind !== 'sc'; w.label = S.label
    } else {
      if (w.standalone) { delete w.standalone; delete w.kind; delete w.noconf }
      w.night = /night/i.test(s.value); w.label = titleToLabel(s.value)
    }
    afterSchedMutate(); notify(); return
  }
  /* an INPUT's own fields (owner, 10 Aug 26). Separate from data-bfld because
     the write is not a schedule write: an input has no funnel key, and
     setInpField goes through writeInputsBatch and the accepted-row relink
     instead of txtSet/markEdit. Same RO treatment as every field above,
     including the revert — a refused value must never be left sitting on
     screen looking saved. */
  const inf = (e.target as HTMLElement).closest('[data-ifld]') as HTMLInputElement | null
  if (inf) {
    const [id, field] = inf.dataset.ifld!.split('.')
    const inp = inpById(id)
    if (!inp) return notify()                    // deleted or undone underneath it
    const back = () => { inf.value = field === 'rmks' ? (inp.remarks || '') : inpTimeText(inp, field) }
    if (RO) return back()
    if (setInpField(inp, field as any, inf.value)) notify()
    else back()
    return
  }
  const f = (e.target as HTMLElement).closest('[data-bfld]') as HTMLInputElement | null; if (!f) return
  const p = f.dataset.bfld!
  if (RO) { f.value = txtGet(p); return }
  /* NOTHING SORTS ON ITS OWN ANY MORE (owner, 10 Aug 26). Typing a role into
     a blank cell used to reposition the whole block — the "+ Row, then type
     SDO" path — which is precisely the jump the owner asked to be rid of:
     "prevent a situation when the scheduler types and the line jumps."
     Auto sort and Sort all remain the only things that reorder a duty block,
     and they now order it by START TIME (engine/reorder.ts's sortDutyBlock).
     What went with it: the `wasEmptyRole` read (there is no longer a moment
     to detect), and the HIST.lock wrapper that held the commit and the sort
     it triggered to ONE undo step — with no second mutation to fold in, the
     text commit is a single action again and pushes its own snapshot.
     The finding-#5 disarm this used to feed still works: REORDERED_DI is set
     by every mover and sorter, and afterSchedMutate() below still reads it —
     this path simply never sets it now. */
  if (txtSet(p, f.value)) {
    markEdit()
    afterSchedMutate()
    notify()
  }
  else f.value = txtGet(p)
}

/* the board's slot-arm click handler */
export function boardArmClick(e: MouseEvent) {
  /* editMode() too, not just the role — a read-only board (role changed, or
     the page moved away from Edit Schedule while the board stayed open)
     must not still arm a seat just because the session is still an
     admin's. Same gate as boardMbtn/boardChange. */
  if (!canEditSched() || !HOOKS.editMode()) return
  if (view.DPREV.has(view.SBDAY as any)) return   // same stale-markup guard as boardMbtn
  const t = e.target as HTMLElement
  /* the duty ROLE cell offers its pick-list (owner, 10 Aug 26). Before the
     arm branches, because a ROLE cell is not a seat and must not be treated
     as one — and BEFORE nothing else, so the box still takes typing exactly
     as it did: the popup is an offer beside the caret, not a replacement for
     it, and clicking straight past it goes on editing the text. */
  const rp = t.closest('[data-rolepick]') as HTMLElement | null
  if (rp) { rolePickMenu(rp, rp.dataset.rolepick!); return }
  if (t.closest('.puck[data-person]')) return
  const empty = t.closest('.sb-slot.empty[data-slot]') as HTMLElement | null
  if (empty) { view.armSlot(empty.dataset.slot, empty); notify(); e.stopPropagation(); return }
  const seat = t.closest('.seat[data-slot]') as HTMLElement | null
  /* same armed-element escape as routeClick: a seat armed while empty, then
     filled by drag, must still answer the put-me-down tap */
  if (seat && (view.armedKey() === seat.dataset.slot || !slotVal(seat.dataset.slot!))) { view.armSlot(seat.dataset.slot, seat); notify(); e.stopPropagation(); return }
  const cell = t.closest('[data-fill]') as HTMLElement | null
  if (cell && !seat) { view.armSlot(cell.dataset.fill, cell); notify(); e.stopPropagation() }
}

/* + Line — a new BLANK formation on the day's LAST wave (it used to be seeded
   from the wave's last line; owner, 10 Aug 26). canEditSched() checked here too
   (smaller item, review 9 Aug 26): this used to rely on being unreachable
   through the UI for a non-admin (Edit Schedule hidden from their nav, the
   board itself never opened) rather than refusing to act on its own — the
   same "hidden, not gated" gap finding #1's read-only board proved a role
   change or a stale reference can reopen. Every other control on this
   board carries its own in-function check regardless of what the render
   already withholds; this one now does too. */
export function addLine(di: number) {
  /* editMode() too, not just the role (re-review fix, 9 Aug 26): a read-only
     board (View sched, board left open — finding #1's state) still passes
     canEditSched() for an admin, and this button carries no `disabled` of
     its own for that state (only for a frozen preview) — so the role check
     alone left it able to act. Same gate finding #4 put on Sort all.
     Scoped to `view.SBDAY != null` — a board actually open somewhere —
     rather than an unconditional editMode(): this function is also the
     bridge's own `window.addLine`/`addWave`, called directly by probes
     (sa-async.cjs) to build standalone waves before ever touching the UI
     or navigating to Edit Schedule, and no board is rendered at all for
     those calls (SBDAY stays null, so there is no live-looking button
     anywhere for a stray click to exploit — the vulnerability this closes
     needs a board that LOOKS open, not a bare API call). */
  if (!canEditSched() || (view.SBDAY != null && !HOOKS.editMode())) return
  const d = DAYS[di]; if (!d.waves || !d.waves.length) return toast('Add a wave first')
  /* blank, same reason as the gline handler above */
  const w = d.waves[d.waves.length - 1]
  w.formations.push({ cs: '', msn: '', to: '', ld: '', aircraft: [{ p: '', w: '', area: '', rmks: '', opts: {} }] })
  markStructuralAdd(`ff:${di}.${d.waves.length - 1}.${w.formations.length - 1}.cs`)
  afterSchedMutate(); notify(); toast('Line added')
}

/* + Wave, verbatim. Same in-function role check as addLine above — the
   direct mutator, so this is the one that actually has to refuse, whether
   it is reached through waveMenu's picker or (as the smaller-item test
   does) called straight off the module. */
export function addWave(di: number, kind: any) {
  // same SBDAY-scoped editMode() gate as addLine above, same reason.
  if (!canEditSched() || (view.SBDAY != null && !HOOKS.editMode())) return
  const d = DAYS[di]; if (!d) return
  d.waves = d.waves || []
  if (!kind) {
    d.waves.push({ label: 'WAVE ' + (d.waves.filter((w: any) => !isStandalone(w)).length + 1), night: false, intimes: [], traffic: [], formations: [{ cs: 'NEW', msn: '-', to: '12:00', ld: '13:00', aircraft: [{ p: '', w: '', area: '', rmks: '', opts: {} }] }] })
    markStructuralAdd(`wl:${di}.${d.waves.length - 1}`); afterSchedMutate(); notify(); return act(di, 'Wave added')
  }
  const w = makeStandalone(kind); if (!w) return
  d.waves.push(w)
  const S = SAWAVE[kind]
  /* AVALON alone brings its desk up with the wave. SC used to as well for one
     afternoon (10 Aug 26) and the owner moved it to `+ Block` the same day —
     an SC desk is a choice, an AVALON one is not, because nothing else on an
     overnight wave tells you a runner and a log cell are needed. Everything
     else, SC included, is filled from the `+ Block` picker via the same
     `waveDutyBlock`, so there is one shape per wave kind and not two. */
  if (S.autoDuty) { d.dutywaves = d.dutywaves || []; d.dutywaves.push(waveDutyBlock(w)); trackStructuralAdd(`dl:${di}.${d.dutywaves.length - 1}`) }
  markStructuralAdd(`wl:${di}.${d.waves.length - 1}`); afterSchedMutate(); notify()
  toast(S.label + ' added — standalone, ' + (kind === 'avalon' ? 'checked for availability only' : S.all ? 'nothing on it is cross-checked' : 'SPARE is checked for availability and SC currency only'))
}

/* the Add-a-wave chooser, verbatim (a body-level popup, just as the reference
   builds it — it lives outside the React tree and removes itself on any
   outside click) */
/* The one popup builder the board's three pickers share — Add-a-wave,
   + Block's wave picker and the duty ROLE pick-list. It was waveMenu's body
   until two more pickers wanted the same box (10 Aug 26); everything here
   was already load-bearing there and is unchanged in behaviour.
   The stores popup (interactions.ts's openStoresMenu) shares the `.wavemenu`
   class for its LOOK, and it keeps a NOT-{once:true} document listener that
   only it knows how to unhook (`_offClick`) — its outside-click handler
   declines clicks inside its box and the one click a press beginning inside
   dispatches outside. Pulling its box out from under it here, the way it
   pulls out its own stale popups, would strand that listener on document
   with no box to remove it through. So: unhook before removing. */
function popMenu(anchor: HTMLElement, html: string, onPick: (e: any, close: () => void) => void) {
  document.querySelectorAll('.wavemenu').forEach(x => {
    const off = (x as any)._offClick
    if (off) document.removeEventListener('click', off)
    x.remove()
  })
  const box = document.createElement('div')
  box.className = 'wavemenu'
  box.innerHTML = html
  document.body.appendChild(box)
  const r = anchor.getBoundingClientRect()
  box.style.left = Math.max(8, Math.min(window.innerWidth - box.offsetWidth - 8, Math.round(r.left))) + 'px'
  box.style.top = Math.min(window.innerHeight - box.offsetHeight - 8, Math.round(r.bottom + 6)) + 'px'
  box.addEventListener('click', (e: any) => onPick(e, () => box.remove()))
  /* deferred by a tick, or the very click that OPENED this box closes it */
  setTimeout(() => document.addEventListener('click', function off() { box.remove(); document.removeEventListener('click', off) }, { once: true }), 0)
  return box
}
/* + BLOCK's picker: every wave on the day, plus a bare block. Picking a wave
   fills the block from engine/waves.ts's waveDutyBlock, so the shapes live
   with the waves they belong to and the UI only places the result. */
export function blockMenu(anchor: HTMLElement, di: any) {
  if (!canEditSched() || !HOOKS.editMode()) return
  const d = DAYS[di]; if (!d) return
  const waves = (d.waves || [])
  const html = `<h5>Duties for</h5><div class="wm-row">`
    + (waves.length
      ? waves.map((w: any, gi: number) => `<button class="wm${isStandalone(w) ? ' sa' : ''}" data-blkw="${gi}">${esc(w.label || `Wave ${gi + 1}`)}</button>`).join('')
      : '')
    + `<button class="wm" data-blkw="">Empty block</button></div>`
    + `<div class="wm-note">${waves.length
      ? 'Picking a wave titles the block after it and fills in that wave\u2019s desk \u2014 times and names stay yours to set.'
      : 'No waves on this day yet \u2014 add one and it will be offered here.'}</div>`
  popMenu(anchor, html, (e, close) => {
    const b = e.target.closest('[data-blkw]'); if (!b) return
    const v = b.dataset.blkw
    d.dutywaves = d.dutywaves || []
    d.dutywaves.push(v === '' ? { label: 'DUTY', rows: [{ role: '', id: '', str: '', end: '' }] }
      : waveDutyBlock(waves[+v]))
    markStructuralAdd(`dl:${di}.${d.dutywaves.length - 1}`); afterSchedMutate(); notify()
    close(); e.stopPropagation()
  })
}
/* The duty ROLE cell's pick-list (owner, 10 Aug 26). A block that belongs to
   no wave has no desk to fill in, so its rows are typed — and the five roles
   the squadron actually uses were being retyped, and misspelt, every time.
   The list is DUTY_PICK, which IS engine/order.ts's DUTY_ORDER keys, so what
   you can pick and what Auto sort understands cannot drift apart. Typing is
   untouched: this is an offer over an ordinary text cell, not a <select>. */
export function rolePickMenu(anchor: HTMLElement, addr: string) {
  if (!canEditSched() || !HOOKS.editMode()) return
  const [di, wi, ri] = addr.split('.').map(Number)
  const row = DAYS[di]?.dutywaves?.[wi]?.rows?.[ri]; if (!row) return
  const html = `<h5>Role</h5><div class="wm-row">`
    + DUTY_PICK.map(r => `<button class="wm${row.role === r ? ' sa' : ''}" data-rolev="${esc(r)}">${esc(r)}</button>`).join('')
    + `</div><div class="wm-note">Or just type \u2014 the box takes any text.</div>`
  popMenu(anchor, html, (e, close) => {
    const b = e.target.closest('[data-rolev]'); if (!b) return
    txtSet(`dr:${di}.${wi}.${ri}.role`, b.dataset.rolev)
    afterSchedMutate(); notify(); close(); e.stopPropagation()
  })
}
export function waveMenu(anchor: HTMLElement, di: any) {
  // same SBDAY-scoped editMode() gate as addLine/addWave above, same reason.
  if (!canEditSched() || (view.SBDAY != null && !HOOKS.editMode())) return
  const dayBtns = (di == null)
    ? `<h5>Day</h5><div class="wm-row" id="wmDays">`
      + DAYS.map((x: any, i: number) => `<button class="wm ${i === 0 ? 'on' : ''}" data-wmday="${i}" style="padding:6px 9px;font-size:11.5px">${esc(x.dow.slice(0, 3))}</button>`).join('')
      + `</div>` : ''
  const html = dayBtns
    + `<h5>Add</h5><div class="wm-row">`
    + `<button class="wm" data-wmkind="">Flying wave</button>`
    + Object.keys(SAWAVE).map(k => `<button class="wm sa" data-wmkind="${k}">${SAWAVE[k].label}</button>`).join('')
    + `</div><div class="wm-note">SC \u00b7 AVALON \u00b7 BB sit outside the day's flying count \u2014 two waves of four plus an SC reads <b>4 X 4 / 2</b>.</div>`
  let day = (di == null) ? 0 : di
  const box = popMenu(anchor, html, (e: any, close: () => void) => {
    const dbtn = e.target.closest('[data-wmday]')
    if (dbtn) {
      day = +dbtn.dataset.wmday
      box.querySelectorAll('[data-wmday]').forEach(x => x.classList.toggle('on', x === dbtn))
      box.querySelectorAll('[data-wmday]').forEach((x: any) => x.style.borderColor = x === dbtn ? 'var(--accent)' : 'var(--edge)')
      e.stopPropagation(); return
    }
    const kbtn = e.target.closest('[data-wmkind]')
    if (kbtn) { addWave(day, kbtn.dataset.wmkind || null); close(); e.stopPropagation() }
  })
}

/* the board layout choice survives closing and reopening it within a session */
export let SBWIDE = false
export function toggleWide() {
  SBWIDE = !SBWIDE
  toast(SBWIDE ? 'Desktop layout — pan sideways to read the whole day' : 'Phone layout')
}

/* the phone board's Live checks fold (owner, 8 Aug 26): module state like
   SBWIDE, collapsed afresh on every openScheduler — a board visit starts
   with the day, not the list; the flag survives day-tab switches. Desktop
   ignores it (the fold is CSS under 820px only, and the toggle branch in
   interactions.ts is isPhone()-gated). */
export let SBWOPEN = false
export function toggleSbwarn() { SBWOPEN = !SBWOPEN }

/* day tab switch — setBoardDay carries the reference's cross-day disarm */
export function boardTab(n: number) { view.setBoardDay(n); validate(); notify() }

/* ---------------------------------------------------------------------------
   SWIPING BETWEEN DAYS ON THE PHONE BOARD (owner, 11 Aug 26)
   The seven Mon–Sun chips are gone from the bar, so the day is reached the way
   the view week's is: a sideways swipe.

   REWRITTEN AS A CAROUSEL on 11 Aug 26 — see wireBoardSwipe below for the
   mechanism and for why the week's own scroll-snap container could not simply
   be reused. What this block still describes correctly is the set of GUARDS,
   which are unchanged: which gestures the swipe declines, and why each of
   those refusals was measured rather than assumed. The one number that moved
   is the commit distance, and it is documented at the constants.

   Three guards, each answering a real conflict on this surface rather than a
   hypothetical one:

   - **It never starts on the row grip, and never finishes during a puck
     drag.** Those are the only two machines that can hold this finger, and
     they need different answers because they claim it differently.
     `rowdrag.ts` takes a press on `.sb-grip` IMMEDIATELY, so the grip is
     excluded at pointerdown. `drag.ts` takes a puck only after a deliberate
     HOLD and gives up the moment the finger travels — which a swipe does at
     once — so a swipe can never arm it; the `tdrag` body class is checked at
     pointerup anyway, in case one was armed before the swipe began.
     **Everything else is deliberately allowed, and this is the guard that
     had to be loosened after measurement.** Excluding inputs, buttons and
     seats — the obvious defensive list — made the gesture work on the first
     swipe and fail on every one after it: the board is wall-to-wall
     controls, so whatever happened to land under the thumb once the day
     changed decided whether the next swipe was permitted, which reads as
     "swiping randomly stops working". A tap travels ~0px, so the distance
     test below already separates tapping from swiping, and it does it on
     what the finger DID rather than on what it started over.
   - **Horizontal has to beat vertical by 2×.** The board is a tall scroller;
     a thumb travelling down it wanders sideways, and a bare threshold turns
     ordinary reading into day changes.
   - **Not in desktop layout.** `.sb-wide` makes the whole board a horizontal
     scroller, where sideways IS panning across the day's columns.

   `editingText()` is deliberately NOT consulted. It asks "is a text cell
   focused", which is true for the whole time a scheduler has tapped into a
   field — including while they then swipe away from it — so gating on it
   silently killed every swipe made after the first tap. The commit path is
   unaffected either way: a day change re-renders through the ordinary funnel
   and the field's own blur commits it, the same as tapping any other day.

   Pointer events, not touch: the same choice `rowdrag.ts` documents — one
   code path covers a finger and a trackpad, and the board's other machines
   already speak them. Attached to the scroller and passive, so it never
   delays the vertical scroll it usually turns out to be.
   --------------------------------------------------------------------------- */
/* THE TWO NUMBERS, AND WHY THEY MOVED (owner, 11 Aug 26 — "the swipe left and
   right feels unresponsive").
   They started at 55px of travel and a 2x horizontal-over-vertical bias, fired
   on pointerUP. All three were wrong together, and the bias was the worst of
   them: a real thumb swipe on a tall scroller arcs, so a perfectly deliberate
   120px sideways drag that also drifted 70px down was REFUSED (120 < 140) —
   the gesture did nothing at all, which reads as the app ignoring you rather
   than as a threshold. 1.25x still refuses an ordinary vertical scroll by a
   wide margin (a 200px scroll would need 250px of sideways drift to be taken
   for a swipe) while accepting the arc.
   Firing on MOVE rather than UP is the other half. Waiting for the lift meant
   the day changed after the finger left the glass, so the gesture and its
   result were separated by however long the swipe took — the definition of
   laggy. It now fires the instant the threshold is crossed, with the finger
   still down, and `done` consumes the gesture so the rest of the drag and the
   pointerup that follows do nothing. */
/* REWRITTEN AS A CAROUSEL (owner, 11 Aug 26 — "make scheduler board swipe
   between days to be the same logic and mechanism as edit schedule ... full
   motion, mechanism, feel and sensitivity").

   WHAT THE WEEK ACTUALLY DOES, because it is not a gesture at all: `.week` is
   an ordinary horizontal scroller with `scroll-snap-type:x mandatory` and a
   `scroll-snap-align` on every `.day`. All seven days are in the layout, and
   the BROWSER supplies the finger-tracking, the momentum and the snap.

   That mechanism cannot be copied here and the reason is a number: one day of
   board is 897 nodes against a 960 ceiling (probes/perf-port.cjs), so seven
   side by side is ~6,300 on the surface whose whole architecture exists to
   keep a phone fast. What IS copied is everything the scheduler can feel —
   the day tracks the finger 1:1, the next day is really there underneath
   coming in, the ends rubber-band, and the release settles on distance OR
   velocity rather than on one hard threshold.

   The neighbour is built only while a finger is down and thrown away on
   settle, so the resting board is unchanged at 897. It is an absolutely
   positioned pane inside `.schedboard`, NOT a restructure of `.sb-main`:
   that element is the phone's single scroller and carries overscroll
   containment, the parked-roster proxy scroll and the drawer, and wrapping it
   in a track would have put all three back in play. A transform on a scroller
   moves what you see and leaves its scrolling alone, which is exactly the
   seam this needs.

   `touch-action:pan-y` on `.sb-main` (see scheduler.css) is what makes it
   possible without a non-passive listener: the browser keeps the vertical
   scroll and hands us the horizontal, so nothing here ever calls
   preventDefault and the scroll path stays passive. */
const SWIPE_LOCK = 10       // px of travel before the gesture is taken as horizontal
const SWIPE_BIAS = 1.25     // horizontal must beat vertical by this much
/* HOW FAR COMMITS, and why it is a fraction with a CEILING rather than either
   on its own. A fraction is what makes it feel like a carousel — you have
   pulled the next day a fifth of the way across, so it comes. But 22% of a
   390px phone is 86px, and the owner already had this out once at 55px ("the
   swipe left and right feels unresponsive") and it was tuned down to 45. So
   the fraction is capped: it never asks for more than 60px, and the flick path
   below takes anything quick however short. Net sensitivity is HIGHER than the
   45px jump it replaces, not lower — a flick that never reached 45px now
   counts. */
const SWIPE_TAKE = 0.22     // fraction of the width that commits on distance alone
const SWIPE_TAKE_MAX = 60   // ...but never ask for more than this many px
const SWIPE_FLICK = 0.45    // px/ms that commits however short the drag was
/* ...but a flick still has to be a TRAVEL, not a twitch. Velocity alone is a
   trap: a 12px jab delivered in one frame is arbitrarily fast, and a thumb
   resettling on a scrolling board produces exactly that. 35px is under the
   45px the old jump-on-threshold asked for, so the flick path is still the
   more sensitive of the two, and it is what keeps a short deliberate drag
   ("reading, not swiping") from flipping the day. */
const SWIPE_FLICK_MIN = 35
const SWIPE_MS = 240        // the settle animation
const EDGE_PULL = 0.32      // how much of the drag the ends give back

export function wireBoardSwipe(el: HTMLElement) {
  let x0 = 0, y0 = 0, t0 = 0, lx = 0, lt = 0, vel = 0
  let live = false, lock = false, pane: HTMLElement | null = null, w = 1
  let settleTimer: ReturnType<typeof setTimeout> | null = null
  let settlingPane: HTMLElement | null = null

  /* the neighbour, drawn once the gesture is taken. Built from the same
     boardHTML the live board uses, so it IS that day, not a placeholder. */
  const makePane = (to: number, dir: number) => {
    const host = el.closest('.schedboard') as HTMLElement | null
    if (!host) return null
    const r = el.getBoundingClientRect()
    const p = document.createElement('div')
    p.className = 'sb-pane'
    p.style.top = (r.top - host.getBoundingClientRect().top) + 'px'
    p.style.height = r.height + 'px'
    p.style.left = (dir > 0 ? r.width : -r.width) + 'px'
    p.innerHTML = `<div class="sb-boardwrap"><div class="sb-board">${boardHTML(to)}</div></div>`
    /* SHOW THE SAME VERTICAL WINDOW the board is parked at. Changing day does
       not reset `.sb-main.scrollTop` (boardTab only moves SBDAY), so a pane
       drawn from its own top would preview one thing and settle on another —
       the day would appear to jump down the moment the animation ended.
       Offsetting the pane's content by the live scroll makes the preview the
       truth. The week behaves the same way: its days share one vertical page
       scroll, and swiping sideways does not move it. */
    const inner = p.firstElementChild as HTMLElement | null
    if (inner) inner.style.transform = `translateY(${-el.scrollTop}px)`
    host.appendChild(p)
    return p
  }
  const put = (dx: number, ms = 0) => {
    const e2 = ms ? `transform ${ms}ms cubic-bezier(.22,.61,.36,1)` : ''
    el.style.transition = e2; el.style.transform = `translateX(${dx}px)`
    if (pane) { pane.style.transition = e2; pane.style.transform = `translateX(${dx}px)` }
  }
  const clear = () => {
    if (settleTimer != null) { clearTimeout(settleTimer); settleTimer = null }
    el.style.transition = ''; el.style.transform = ''
    if (pane) { pane.remove(); pane = null }
    if (settlingPane) { settlingPane.remove(); settlingPane = null }
    live = false; lock = false
  }

  const onDown = (e: any) => {
    /* One complete board is close to the phone DOM ceiling. During settle the
       pane belongs to the timer below (and `pane` is deliberately nulled), so
       accepting another finger immediately used to create a second full pane
       beside it. Fast repeated swipes could stack several ~900-node days and
       exhaust mobile Safari before their 240ms timers caught up. A carousel
       cannot begin another drag while it is still settling anyway: hold the
       gesture until the one preview has been removed and the day committed. */
    if (settleTimer != null) return
    live = false; lock = false
    if (pane) { pane.remove(); pane = null }
    el.style.transition = ''; el.style.transform = ''
    if (SBWIDE) return
    if (e.pointerType === 'mouse' && e.buttons !== 1) return
    const t = e.target as HTMLElement
    if (!t || !t.closest) return
    /* the row grip owns its own drag, and the parked aircrew handle forwards
       a scroll it would otherwise swallow (wireParkedRosScroll below) */
    if (t.closest('.sb-grip') || t.closest('.sb-ros')) return
    x0 = lx = e.clientX; y0 = e.clientY; t0 = lt = e.timeStamp || Date.now()
    vel = 0; live = true
  }

  const onMove = (e: any) => {
    if (!live) return
    /* a puck drag was armed before this gesture — that finger is spoken for */
    if (document.body.classList.contains('tdrag')) { clear(); return }
    const dx = e.clientX - x0, dy = e.clientY - y0
    const now = e.timeStamp || Date.now()
    /* a rolling velocity, not one over the whole drag: a slow drag that ends
       in a flick should read as a flick, which is how the week's native
       scroller behaves */
    if (now > lt) { vel = (e.clientX - lx) / (now - lt); lx = e.clientX; lt = now }
    if (!lock) {
      if (Math.abs(dx) < SWIPE_LOCK || Math.abs(dx) < Math.abs(dy) * SWIPE_BIAS) return
      const di = view.SBDAY
      if (di == null) { live = false; return }
      lock = true
      /* jsdom reports every rect as 0, and a 0 width would make the distance
         test below meaningless (0.22 of nothing). Fall back through the layout
         box to the viewport rather than to 1. */
      w = el.getBoundingClientRect().width || el.clientWidth
        || (typeof window !== 'undefined' ? window.innerWidth : 0) || 360
      const to = di + (dx < 0 ? 1 : -1)
      /* no day that way: the drag still moves, it just gives most of it back —
         the same "there is nothing here" a native scroller shows at its end */
      if (to >= 0 && to < DAYS.length) pane = makePane(to, dx < 0 ? 1 : -1)
    }
    put(pane ? dx : dx * EDGE_PULL)
  }

  const end = (e: any) => {
    if (!live) return
    if (!lock) { live = false; return }
    const dx = (e && e.clientX != null ? e.clientX : x0) - x0
    const dir = dx < 0 ? 1 : -1
    const takeDist = Math.min(w * SWIPE_TAKE, SWIPE_TAKE_MAX)
    const take = !!pane && (Math.abs(dx) > takeDist
      /* a flick counts only if it is still travelling the way it started —
         a drag out and back has a big velocity pointing home */
      || (Math.abs(dx) > SWIPE_FLICK_MIN && Math.abs(vel) > SWIPE_FLICK
          && (vel < 0 ? 1 : -1) === dir))
    const di = view.SBDAY, rev = view.BOARDREV
    if (!take || di == null) {
      /* home, and say why if the end of the week is the reason */
      put(0, SWIPE_MS)
      if (!pane && Math.abs(dx) > takeDist)
        toast(dir > 0 ? 'Last day of the week' : 'First day of the week')
      const p = pane; pane = null; live = false; lock = false
      settlingPane = p
      settleTimer = setTimeout(() => {
        settleTimer = null
        el.style.transition = ''; el.style.transform = ''
        if (p) p.remove()
        if (settlingPane === p) settlingPane = null
      }, SWIPE_MS)
      return
    }
    /* run it the rest of the way, THEN swap the day underneath. Committing
       first would repaint the board mid-flight and the animation would carry
       the day it was already showing. */
    put(-dir * w, SWIPE_MS)
    const p = pane; pane = null; live = false; lock = false
    settlingPane = p
    settleTimer = setTimeout(() => {
      settleTimer = null
      el.style.transition = ''; el.style.transform = ''
      if (p) p.remove()
      if (settlingPane === p) settlingPane = null
      /* The dots, Close, logout or a page change may have moved the board
         while this animation was finishing. Never let an old swipe overwrite
         that newer choice (or reopen a board that has just been closed). */
      if (view.BOARDREV === rev && view.SBDAY === di) boardTab(di + dir)
    }, SWIPE_MS)
  }

  el.addEventListener('pointerdown', onDown, { passive: true })
  el.addEventListener('pointermove', onMove, { passive: true })
  el.addEventListener('pointerup', end, { passive: true })
  el.addEventListener('pointercancel', end, { passive: true })
  return () => {
    el.removeEventListener('pointerdown', onDown)
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerup', end)
    el.removeEventListener('pointercancel', end)
    clear()
  }
}
/* ---------------------------------------------------------------------------
   THE PARKED AIRCREW HANDLE MUST NOT SWALLOW A SCROLL (owner, 11 Aug 26 —
   a screenshot of a drag down the right-hand edge that moved nothing)
   Parked, the drawer is a 30px sliver pinned to the right edge over a band
   429px tall on a 780px screen — right where a thumb rests. A vertical drag
   starting on it scrolled NOTHING: measured at x=378, 0px of board movement
   against 264px two finger-widths to the left.

   The cause is not this app's. A `position:fixed` element hands its touch
   scroll to the VIEWPORT, not to the overflow ancestor it happens to sit
   inside, and the viewport here cannot scroll (`.schedboard` is
   `position:fixed; inset:0`) — so the gesture had nowhere to go. Both CSS
   levers were tried against the real build and neither moves it:
   `touch-action:pan-y` (the browser is then willing to pan, but there is
   still nothing for it to pan) and `position:absolute` against `.schedboard`
   (stays pinned, chains no better). So the drag is forwarded by hand.

   It is deliberately NOT a general scroll proxy: it acts only while the
   drawer is PARKED — open, the drawer holds a scrolling crew list that owns
   its own gesture — and it drives the same `.sb-main.scrollTop` the browser
   would have. A tap moves ~0px, so scrolling by that is a no-op and the tap
   still toggles the drawer.
   What it does not reproduce is momentum: the board stops when the finger
   stops, where a native scroll would coast. Fixing that means running an
   inertia loop by hand, which is a lot of machinery for a 30px strip — and a
   scroll that works without coasting beats one that does nothing.
   --------------------------------------------------------------------------- */
const ROS_TAP = 6           // px of travel still readable as a tap, not a scroll
export function wireParkedRosScroll(main: HTMLElement) {
  let y0 = 0, top0 = 0, live = false, moved = false, ros: HTMLElement | null = null
  const onDown = (e: any) => {
    live = false; moved = false
    if (document.body.classList.contains('ros-open')) return
    const t = e.target as HTMLElement
    if (!t || !t.closest) return
    const r = t.closest('.sb-ros') as HTMLElement | null
    if (!r) return
    ros = r; y0 = e.clientY; top0 = main.scrollTop; live = true
  }
  const onMove = (e: any) => {
    if (!live) return
    if (Math.abs(e.clientY - y0) > ROS_TAP) moved = true
    main.scrollTop = top0 - (e.clientY - y0)
  }
  /* A SCROLL MUST NOT OPEN THE DRAWER (owner, 11 Aug 26 — "after I move the
     bar at the top and tried to scroll vertically I can't").
     This was the whole reported fault, and it is a two-step trap. The handle
     sits at the right edge where a thumb rests, and the browser's own tap
     slop is generous: measured on the real build, a drag of up to 15px still
     fired a click, so beginning a scroll there OPENED the aircrew drawer.
     The drawer then covers 58% of the width and its crew list has all of
     39px to scroll — so the next drag moved nothing at all, which reads as
     the board having seized rather than as a panel having opened over it.
     The scroll forwarded above is what makes the fix cheap: it already knows
     the finger travelled, so a gesture that scrolled anything eats the click
     the browser fires afterwards. Under 6px is left alone — a deliberate tap
     wobbles, and that is still a tap. */
  const end = () => {
    live = false
    if (!moved || !ros) return
    const eat = (c: Event) => { c.stopPropagation(); c.preventDefault() }
    const el = ros
    el.addEventListener('click', eat, { capture: true, once: true })
    setTimeout(() => el.removeEventListener('click', eat, { capture: true } as any), 350)
  }
  main.addEventListener('pointerdown', onDown, { passive: true })
  main.addEventListener('pointermove', onMove, { passive: true })
  main.addEventListener('pointerup', end, { passive: true })
  main.addEventListener('pointercancel', end, { passive: true })
  return () => {
    main.removeEventListener('pointerdown', onDown)
    main.removeEventListener('pointermove', onMove)
    main.removeEventListener('pointerup', end)
    main.removeEventListener('pointercancel', end)
  }
}
/* ---------------------------------------------------------------------------
   THE DOTS ARE A SCRUB BAR (owner, 11 Aug 26 — "the dots should allow me to
   drag to select the pages, like a drag bar")
   Press anywhere on the strip and slide: the day under the finger becomes the
   open day, live, so a week is one movement instead of six swipes.

   Nearest-CENTRE rather than a proportional map of the strip's width, because
   the dots are not all the same size — the current day is a 16px pill and the
   rest are 6px — so proportional maths would drift by up to half a dot near
   whichever end the pill happens to be. Nearest-centre is also what makes the
   same code work unchanged on DESKTOP, where these are still `Mon 13` chips of
   differing widths.

   A TAP is deliberately left to the existing click handler: this machine only
   starts scrubbing once the finger has moved past a few px, so a plain tap
   never reaches it and there is no double `boardTab` (each one costs a
   validate). When it HAS scrubbed it eats the click that the browser fires
   afterwards, or the release would re-apply whatever day the finger went down
   on and undo the whole drag.

   Pointer capture on the strip is what lets the finger wander off it
   vertically — which it will, since the strip is 9px tall — and keep
   scrubbing. Without it the first move outside those 9px silently ends the
   gesture.
   --------------------------------------------------------------------------- */
const DOTS_SLOP = 4         // px before a press becomes a scrub rather than a tap
export function wireDayDots(el: HTMLElement) {
  let live = false, moved = false, x0 = 0, id: any = null
  const dayAt = (clientX: number) => {
    const dots = [...el.querySelectorAll('[data-sbtab]')] as HTMLElement[]
    if (!dots.length) return null
    let best = -1, bd = Infinity
    dots.forEach((d, i) => {
      const r = d.getBoundingClientRect(); const dd = Math.abs(r.left + r.width / 2 - clientX)
      if (dd < bd) { bd = dd; best = i }
    })
    return best < 0 ? null : best
  }
  const onDown = (e: any) => {
    if (e.pointerType === 'mouse' && e.buttons !== 1) return
    live = true; moved = false; x0 = e.clientX; id = e.pointerId
  }
  const onMove = (e: any) => {
    if (!live || (id != null && e.pointerId !== id)) return
    if (!moved && Math.abs(e.clientX - x0) < DOTS_SLOP) return
    if (!moved) {
      moved = true
      /* CAPTURE ONLY ONCE IT IS A SCRUB, never on pointerdown. Capture
         retargets the whole gesture — including the CLICK that follows the
         release — onto the capturing element, so capturing up front left a
         plain tap arriving at the strip rather than at a dot, `closest(
         '[data-sbtab]')` finding nothing, and tapping a day silently doing
         nothing. Taken here, a tap never captures at all and still reaches
         the ordinary click handler. */
      try { el.setPointerCapture?.(e.pointerId) } catch { /* not capturable */ }
    }
    const n = dayAt(e.clientX)
    if (n != null && n !== view.SBDAY) boardTab(n)
  }
  const onUp = (e: any) => {
    if (!live) return
    live = false
    try { el.releasePointerCapture?.(e.pointerId) } catch { /* never captured */ }
    if (!moved) return
    /* the click the browser fires after this release names the dot the finger
       went DOWN on, which is no longer the day being shown */
    const eat = (c: Event) => { c.stopPropagation(); c.preventDefault() }
    el.addEventListener('click', eat, { capture: true, once: true })
    setTimeout(() => el.removeEventListener('click', eat, { capture: true } as any), 350)
  }
  el.addEventListener('pointerdown', onDown, { passive: true })
  el.addEventListener('pointermove', onMove, { passive: true })
  el.addEventListener('pointerup', onUp, { passive: true })
  el.addEventListener('pointercancel', onUp, { passive: true })
  return () => {
    el.removeEventListener('pointerdown', onDown)
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerup', onUp)
    el.removeEventListener('pointercancel', onUp)
  }
}

export function openScheduler(di: number) { SBWOPEN = false; view.setBoardDay(di); validate(); notify() }
/* Done/Close also parks the aircrew drawer: ros-open is a body class shared
   with the edit week's own drawer, and leaving it set would surprise-open
   the week's palette the moment the board lifts (owner's one-window phone
   board, 8 Aug 26). The week's tab is right there to reopen it. */
/* view.closeBoardState() is the shared cleanup — also what setPage now calls
   the moment the page stops being Edit Schedule (state/view.ts), so a nav
   click and the Done/Close buttons close the board through the exact same
   path rather than two copies of "SBDAY null, park the drawer" drifting
   apart. */
export function closeScheduler() { view.closeBoardState(); notify() }
