/* The scheduler board's HTML assembly (renderScheduler's board loop) and its
   delegated handlers — the reference's bodies, verbatim, with repaint via the
   store's notify(). The CX-with-a-reason dialog state lives here too. */
import { DAYS } from '../engine/data'
import { mkNote, noteText } from '../engine/note'
import { briefLeadShown } from '../engine/faceattrs'
import { INPUTS, inputsOn, inputCoversDate, inpById, inpTimeText, inpId, inputReadPass, remarksTyped } from '../engine/inputs'
import { onCommon } from '../engine/grouprows'
import { PEOPLE, whoId, isSpecial } from '../engine/people'
import { isStandalone, makeStandalone, DUTY_PICK, SAWAVE } from '../engine/waves'
import { REPORTING_LABEL, reportingIssuesForWave } from '../engine/reporting'
import { WARN, validate, WCODE, wlbl, fltNoLenSays } from '../engine/validate'
import { shownWarns } from '../engine/warnhide'
import { hhmm, hm24, fmtHM, minus, parseHM } from '../engine/time'
import { VCONF } from '../engine/rules'
import { slotVal, txtGet, txtSet, acRef, rollCx, whoArr, unacceptInput, TIME_TXT } from '../engine/slots'
import { standsOn } from '../engine/overlay'
import { markEdit, markDeletion, deletionWasIssued, markStructuralAdd, alAttr, dayApproved, dayCurVer, dayShownPendCount, dayHasChanges, verLabel, nextSeq, dropRowMarks, protectedWeek, dayVersions, publishReadPass } from '../engine/publish'
import { logAction } from '../engine/editlog'
import { hideHistBub } from './histbubble'
import { touchDragBusy } from './drag'
import { shiftAircraft, shiftFormation, shiftWave, shiftKeys, keyDay, iuParts } from '../engine/keys'
import { applyMove, sortWave, sortInTimes, sortDutyBlock, sortSims, sortGround, sortProg, sortDay } from '../engine/reorder'
import { HIST } from '../state/history'
import { rlFaultAtt, signoffHTML, cxText, storesView, intimesInner, areaText, atimeText, dayStatHTML, planSelectorHTML, verTagHTML, nysMarkHTML, signedLineHTML, srcInput, saRoleHTML, saBadgesHTML, availHTML, QUARANTINE_NOTE , mkPeriod, withDaySnap, fltNoLenShown, sbPrevDay, SB_PREVDAY, boxText } from './html'
import { onInputRow, rowMark, UNMARKED } from './reqdoor'
import { setInpField, howMany } from './inputedit'
import { reqRowText } from './reqrow'
import { STORE_CFG, DUTYTPL_CFG, blockFromTpl, DAYTPL_CFG, applyDayTpl, addDayTpl, dayTplSave, dayTplSummary, secOrder, waveInsertSlot, waveKindOf, moveWave } from '../engine'
import { DAYTPL_PUBLISHED_MSG } from '../engine/daytpl'
import { commit, isOk } from '../command'
import { schedStore, SCHED_TYPES, schedWrite } from '../state/sched-commit'
import { reconcileIssuedMarks } from '../engine/drafts'
import { withFreshMissionRoles } from '../state/mission-roles'
import { missionTracking } from '../engine/insights-config'
import { resolveMissionRole } from '../engine/mission-role'
import { dayDrafts, curDraftId, draftDup, draftSelect, ROWSLEFT, rowsLeftSentences } from '../engine/drafts'
import { oilPutBackWatch, oilNeedSaid } from './oilputback'
import { setTplEdit, setDayTplEdit, setDraftsEdit, setWaveEdit } from './pops'
import { noteOpener } from './sheetfocus'
import { openAvailWinFrom } from './AvailWindow'
import { shownBuiltins, shownTemplates, waveFromTpl, kindLabel, WAVE_BUILTIN, WAVETPL_CFG } from '../engine/wavetpl'
import { HOOKS } from '../engine/hooks'
import { penSvg } from './pen'
import { canEditSched } from '../state/auth'
import * as view from '../state/view'
import { esc } from '../state/view'
import { notify, notifyBoard, loadWeek } from '../state/store'
import { CURWEEK } from '../engine/waves'
import { shiftWeek } from './weeknav'
import { oilModeOn, dayBarHTML, toggleOilMode, toggleOilItem, toggleOilPerson, setOilBlanket, oilBlanketOn, oilItemMasked, oilItemCellHTML, oilItemHistName, oilPersonSays, DAY_EARNS_NOTHING } from './oilmode'
import { rowItemKey } from '../engine/oil'
import { oilReadPass } from '../engine/oilev'
import { sbNotesPanel, sbProgPanel, sbSlot, sbDutyPanel, sbSimRowsPanel, sbGroundPanel, sbInputsGroupPanel, sbSansPanel, sbUnavailPanel, labelToTitle, titleToLabel, titleToKind, sbGrip, sbNudge, rowMove, sbSortBtn, boxHTML } from './board-html'
import { followVisible } from './vvfollow'

const toast = (...a: any[]) => HOOKS.toast(...a)
const afterSchedMutate = () => view.afterSchedMutate()

/* renderScheduler's board string, verbatim. pv = published-version preview:
   read-only markup throughout, and no sign-off bar — the frozen record's
   signatures live on the AL record; live sign selects against an old day
   would invite edits against the wrong document. */
/* THE ONE READ-ONLY PASS PER DAY ([OIL-SEATS-CAN-EARN] §5 step 1). From step 1
   the OIL item guard reads the day's whole evidence block instead of an O(1)
   property, and from step 9 the count is asked on every seat on every repaint —
   so a builder that asked per row and per puck would rebuild the block dozens of
   times for one day (Fable R2-7, S4; docs/performance.md Part 1). The builder is
   a pure string producer, which is exactly the shape the pass requires: nothing
   inside it writes DAYS, INPUTS or PEOPLE, so the memo cannot serve a stale
   answer to validation, signing or publication — none of which run in here. */
/* …and the inputs' per-person lines once a date ([ALL-AVAIL-AS-MEMBER] step 1 — engine/inputs.ts inputReadPass): the
   same contract, the same reason. */
export function boardHTML(di: number, pv?: boolean) { return inputReadPass(() => oilReadPass(() => publishReadPass(() => boardHTMLBody(di, pv)))) }
function boardHTMLBody(di: number, pv?: boolean) {
  /* a QUARANTINED loaded week is read-only and its days are the seed placeholder;
     the board is a third surface that reached the ordinary builder and painted the
     seed as the schedule, with no quarantine indication (Q2R-06). Surface the same
     one notice the week pages show — the mutators already refuse on a protected
     week, this makes the state visible. */
  if (protectedWeek()) return `<div class="sb-panel"><div class="dprev-bar">${QUARANTINE_NOTE}</div></div>`
  const d = DAYS[di]
  /* the stores chips/C follow HOOKS.editMode(), not just pv: the render gate
     is then EXACTLY the click gate interactions.ts uses for
     data-store/data-stcfg (canEditSched() && CURPAGE==='editsched'). A bare
     CURPAGE test would still render the clickable chips and the
     contenteditable bombs field for a session that may not edit, and
     routeFocusOut (textedit.ts) checks only canEditSched() — so a blur on
     that field would commit and markEdit in a state the week would never
     have rendered the field in at all. */
  /* OIL MODE MAKES THE BOARD READ-ONLY FOR SCHEDULE EDITING ([OIL-AUTO-REMOVE]
     §2.1). In the mode a tap means "does this man earn from this event" and an
     item's name is its own switch — leaving the ordinary write controls live
     beside that would give one gesture two meanings on the same pixel, and the
     scheduler cannot see which he is in. One mode at a time, and the lit button
     says which. Every write control on this board already gates on the same
     flag, so this costs one term and nothing else. */
  const oilm = oilModeOn(di)
  const stoRO = pv || !HOOKS.editMode() || oilm
  /* MAY THIS READER USE THE MODE AT ALL (Fable, 21 Sep 26)? The phone's day bar
     drew "OIL Earn" for anyone who could see the day, including a crew member
     on a read-only board, and the click handler then silently refused it — a
     control that does nothing. This is deliberately NOT mvRO: mvRO is true
     *while the mode is on*, so gating the bar on it would take away the "✓ Done"
     button and trap the scheduler in the mode. Only the editability half. */
  const canOil = !pv && HOOKS.editMode()
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
  /* The sign-off bar (and the desktop history entry above it) moved to their
     own #sbSign element (boardSignHTML below) so the Live Checks panel can sit
     right BELOW the sign-off (owner, 14 Aug 26 — "put it right below sign off
     section"). #sbBoard now starts with the notes panel. */
  /* DAY TEMPLATES (owner ask, 15 Aug 26): a labelled button at the very top of
     the board's own content, ahead of every section — NOT on the top bar's
     first line, which stays frozen (CLAUDE.md §phone board: nothing joins it
     without something else leaving). It is the same "section-level control"
     idiom + Wave uses below for the same reason: a control that can replace
     the WHOLE day belongs at the top of the day's own content, not squeezed
     onto an already-full 30px bar. Withheld on mvRO like every other write
     control on this board. */
  /* The old "Drafts" button that sat here is GONE (owner, 15 Sep 26 — the plans
     selector redesign): plans are now reached from the ONE selector in the sign
     strip (planSelectorHTML → planMenu), so this panel is Templates alone. */
  /* THE TWO PANELS ARE ONE BAR NOW (owner, 21 Sep 26) — Templates and OIL Earn
     together in a single row, where they used to be a full-width panel each with
     a heading and a sub-line. ui/oilmode.ts dayBarHTML draws it and explains the
     phone/desktop split. */
  const tplBtn = mvRO ? '' : `<button class="mbtn daybtn" data-daytpladd="${di}" title="Save this day, or apply a saved one">Templates</button>`
  /* Overall Notes and Common Programme are two separate sections now (owner, 31 Aug
     26 — "split them apart"); each is built and wrapped on its own below (sect). */
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
    /* SC is the one standalone that carries an editable in-time (owner, 24 Aug
       26): its B box is repurposed as the crew's report time, so it drops the
       "in-time · N ac" header note and the blue suggested-brief ghost that make
       sense only on a real sortie. AVALON/BB keep theirs. */
    const sc = w.kind === 'sc'
    /* SC and AVALON after Night wave (owner, 10 Aug 26) — the same list the
       + Wave picker offers, reachable from a wave that already exists. */
    const opts = ['1st wave', '2nd wave', '3rd wave', '4th wave', '5th wave', 'Night wave', 'SC', 'AVALON']
    const cur = labelToTitle(w); if (!opts.includes(cur)) opts.unshift(cur)
    /* mvRO, not pv (reviewer-found residual, 9 Aug 26): the wave header's
       own title select and its + Line / ✕ Wave pair were still pv-only,
       the same gap as everything else in this pass — a read-only board
       (a session that may not edit it, board still legitimately open on
       its own page) left the whole-wave rename and delete live even
       after the flying line's own rows went inert. */
    /* the wave BLOCK carries data-move so the wave grip in its header can drag it
       into a new place among the day's waves (mv:w → engine/reorder.ts moveWave,
       a real amendment) — edit board only, like every other write control here. */
    fly += `<div class="sb-go${w.night ? ' night' : ''}"${mvRO ? '' : ` data-move="mv:w.${di}.${gi}"`}><div class="sb-go-h">${mvRO ? '' : '<span class="wvgrip" title="Drag to reorder this wave" aria-label="Reorder this wave">⠿</span>'}<span>Go ${gi + 1}</span>`
      /* esc(o): `cur` can be a template/typed wave title — user-entered text
         reaching an HTML sink, so it is escaped at the builder like every other
         (26 Aug 26 bug pass; an unescaped `<` swallowed the option outright) */
      + `<select class="sb-wtitle" aria-label="Wave" data-wsel="${di}.${gi}"${mvRO ? ' disabled' : ''}>${opts.map(o => `<option ${o === cur ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`
      + `${w.night ? '<span class="night">· night</span>' : ''}`
      /* "(prev day)" where the wave's in-time / rally is the evening before (owner D949 Q1 — html.ts sbPrevDay) */
      + (sbPrevDay(w) ? SB_PREVDAY : '')
      /* Traffic edits the wave's airspace bookings, the same field the week's
         Traffic button opens (html.ts). Standalone lines carry none. The
         data-air click is handled globally (interactions.ts setAirKey → AirPop),
         which already reaches the board, so no board-side wiring is needed. */
      + `${sa || mvRO ? '' : `<button class="airbtn" data-air="${di}|${gi}">Traffic</button>`}`
      /* no "In-time / Rally 09:40 · 4 ac" note here any more (owner D947, 16 Oct 26 — the words pass, round 1b): the
         report times are in the yellow lines right under the header, and on a phone the note took a line in every wave */
      + (mvRO ? '' : `<span class="gctl">${sbSortBtn(`w.${di}.${gi}`, mvRO)}${sa ? '' : `<button class="mbtn add" data-itadd="${di}|${gi}" title="Add an ${REPORTING_LABEL} line to this wave">+ ${REPORTING_LABEL}</button>`}<button class="mbtn add" data-gline="${di}.${gi}" title="Add a line to this wave">+ Line</button>`
      + `<button class="mbtn del" data-gdel="${di}.${gi}" title="Remove this whole wave">✕ Wave</button></span>`) + `</div>`
    /* The IN TIME + WX/NOTAMS lines edit exactly as the week's do (html.ts):
       an editable .intimes block committing `it:` through the global
       routeFocusOut (textedit.ts), which already reaches the board's
       contenteditable cells. The board only showed the derived in-time number
       before; this makes the published lines themselves editable here too
       (owner, 14 Aug 26 — the board should edit everything the week can). */
    if (w.intimes && w.intimes.length)
      fly += `<div class="intimes${mvRO ? '' : ' iedit itdrag'}" data-warnkey="it:${di}.${gi}"${alAttr(`it:${di}.${gi}`)} ${mvRO ? '' : `data-intimes="${di}|${gi}"`}>${intimesInner(w, mvRO ? null : `${di}|${gi}`, !mvRO)}</div>`
    /* R · B · TO · LD (owner D1026, D1029, 19 Oct 26): two wrappers, R+B and TO+LD. On a desktop board they are
       display:contents, so the four headings stand in a line over four tracks; where the board puts the pucks on their
       own row (a phone, up to 820 wide, not the desktop layout) each wrapper is ONE cell, its two headings stacked over
       its two stacked boxes. Every wave has its R heading — a standby line has its rally box too (D1040). Nine children — the phone's
       hidden-by-position rule counts them (13-board-rows-responsive.css).
       A STANDBY WAVE'S THIRD PAIR READS START AND END (owner D1085, 20 Oct 26 — "Since edit schedule is start and end. Make
       the Scheduler board reflect the same"), as the week's does since D1083: the boxes under it are the shift's start and
       end, not a take-off and a landing. START fits the board's heading at its own size at every width (36px in 46 on a
       phone, 32 in 48–52 on a desktop — scripts/handpass/standby-board-fit.mjs), so `sb-se` only marks it; no style. */
    fly += `<div class="sb-lcols"><span></span><span>CS</span><span>MSN</span><span class="sb-hrb"><span>R</span><span>B</span></span><span class="sb-htl${sa ? ' sb-se' : ''}"><span>${sa ? 'START' : 'TO'}</span><span>${sa ? 'END' : 'LD'}</span></span><span>FCP</span><span>RCP</span><span>Notes</span><span></span></div>`
    if (!w.formations.length) fly += `<div class="sb-empty" style="padding:6px 11px">Empty wave — add a line, or remove the wave.</div>`
    /* the R box's own timing fault (the fresh read's F1): its address and words, as the week's (html.ts rlFaultAtt) */
    const boxFaults = sa || pv ? [] : reportingIssuesForWave(w, gi).filter((i: any) => i.box)
    w.formations.forEach((f: any, li: number) => {
      const roleAccess=pv && !sa && missionTracking() && canEditSched() && view.CURPAGE==='editsched' && !protectedWeek() && view.DPREV.get(di)===dayCurVer(di) && !f.cx && f.aircraft.some((a:any)=>!a.cx) && resolveMissionRole(f).conditional
      f.aircraft.forEach((a: any, ai: number) => {
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
      const brief = minus(f.to, briefLeadShown())
      /* D49's MARK, ON THE LINE (owner, 22 Sep 26; the walk's rules-sweep FAIL
         3) — the board's half of the same change as the week's (ui/html.ts).
         A line typed with the same take-off and landing still earns; what was
         missing is that the two boxes never said one of them must be wrong, so
         the only place it showed was the list on the right. `fltNoLen` is the
         engine's one body for the rule, shared with the warning itself, so a
         marked box and a raised warning can never disagree. `data-warnkey` is
         what the warning's own key resolves to when it is tapped
         (highlights.ts anchorEl) — before this the tap moved nothing at all. */
      const noLen = fltNoLenShown(di, fp, f, pv)   // …and never while that warning is hidden (D469 — ui/html.ts)
      const badCls = noLen ? ' badtm' : ''
      const badAtt = noLen
        /* the ADDRESS only on live paper, like the week's (ui/html.ts): a
           frozen version preview keeps the MARK — the line went out that way —
           but answers to no live warning. */
        ? `${pv ? '' : ` data-warnkey="${fp}.ld"`} title="${esc((f.cs || w.label || 'A flying line') + ' ' + fltNoLenSays(f, w))}"`
        : ''
      /* stoRO, not !pv (reviewer-found residual, 9 Aug 26): the ghost is a
         SEPARATE clickable element from the .tm brief input right next to
         it (interactions.ts's routeClick, data-bacc branch) — disabling
         the input's own `dis` attribute above never touched this one, so a
         read-only board still offered "click to accept" on the brief. */
      /* No suggested-brief ghost on SC: its B is an in-time to be typed when
         needed, not a brief to auto-fill (owner, 24 Aug 26 — "we will hardly
         have a brief time"). The box itself stays, so a real in-time can be
         entered; only the blue suggestion goes. */
      /* THE SUGGESTION INSIDE ITS OWN EMPTY BOX (owner D1028, D1030): the box's own placeholder, faint in the accent
         (.sugbox), never a line above it — one tap places it, not highlighted, with a short ring (D1038; interactions.ts
         placeSuggestion), and typing replaces it; Tab fills nothing. The brief's is the take-off less the brief lead; the R box's is the default
         rally, the take-off less the Logic page's report setting (D1027, D1031). Neither on a read-only board, and no
         brief suggestion on an SC line, whose B is an in-time to be typed when needed.
         NONE ON ANY STANDBY LINE (owner D1039, 19 Oct 26 — SC, AVALON and BB: "don't show the auto calculated brief and
         rally time. Because they are rarely used"): their empty B and R stay empty; a typed one still counts. */
      const brSug = !stoRO && !sa && parseHM(f.br) == null && brief ? fmtHM(brief) : ''
      const rlDefault = minus(f.to, VCONF.reportLead)
      const rlSug = !stoRO && !sa && parseHM(f.rl) == null && rlDefault ? fmtHM(rlDefault) : ''
      const sugAttr = (s: string) => s ? ` placeholder="${esc(s)}"` : ''
      /* A FAINT DASH IN A STANDBY LINE'S EMPTY R AND B (owner D1065, 19 Oct 26 — his idea, "to indicate to new users that
         the norm is" the shift's own times): the box's placeholder, never a value — a tap does not fill it in, typing
         replaces it — in the grey of the week's own empty-box dash (12-schedule-editing.css .txed:empty), which the week
         already draws there. On SC, AVALON and BB a typed B or R makes the shift fly ([STANDBY-FLIES], D1045). */
      const dashCls = sa ? ' sadash' : '', dashAttr = sa ? ' placeholder="—"' : ''
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
        ${oilModeOn(di) && ai === 0
          /* in the mode the line's CALLSIGN is its own switch, exactly as a
             ground row's name is (OIL7) — "stop this whole line earning".
             Flying lines and SC shifts had no switch at all until 21 Sep 26,
             so the only events a scheduler could stop earning were the desks
             and the programmes (owner, found by hand).

             ONCE PER FORMATION, NOT ONCE PER AIRCRAFT (`ai === 0`; hand pass
             finding 3, and Codex M2 which found the real reach). The switch
             addresses the FORMATION (`f.rid`), but this block runs per
             aircraft, so a formation drew one switch on every row it held —
             an SC shift on this Saturday drew SIX of the same switch, and
             nine of the day's switches sat on rows with nobody on them at
             all. Pressing the one beside an empty spare row did not switch
             off that row: it switched off the whole shift, and the MAIN crew
             two rows above lost their day with nothing on screen connecting
             the two. It is not an SC defect — every multi-aircraft formation
             had it, which is why the guard is here on the generic renderer
             and not on a kind check. The later rows keep the ordinary
             disabled box, so the line still reads the same.

             THE PLAN'S SECOND CLAUSE — "and never on a line nobody is on" —
             IS DELIBERATELY NOT BUILT (Fable, 22 Sep 26, and it is right).
             OIL7 says a switch covers a man added LATER, which is exactly why
             an empty ordinary row keeps its one switch. The empty SC spare
             rows stop drawing one here only because the item is the FORMATION,
             not the row. Measured after this change: 14 switches, 14 distinct
             items, none duplicated, and 4 still on rows with nobody on them —
             correctly. */
          ? oilItemCellHTML(di, rowItemKey(f.rid), f.cs, 'lin')
          /* in the mode the later rows say WHERE the switch went, rather than
             leaving a scheduler on row two wondering why his row has none */
          : boxHTML('lin', `data-bfld="${fp}.cs"${alAttr(`${fp}.cs`)}${dis}${oilModeOn(di) ? ' title="Part of the line above — its OIL switch is on the first row"' : ''}`, f.cs, '')}
        ${boxHTML('msn', `data-bfld="${fp}.msn"${alAttr(`${fp}.msn`)}${dis}`, f.msn, '')}
        <div class="sb-bcell sb-rb">${
          /* every line has its rally box — a standby line too, above its B (owner D1036, D1040, 19 Oct 26), with no
             suggestion (rlSug, D1039) and no fault of its own (boxFaults is empty on a standby wave) */
          `<input class="tm${rlSug ? ' sugbox' : ''}${dashCls}" data-bfld="${fp}.rl"${alAttr(`${fp}.rl`)}${dis}${sugAttr(rlSug)}${dashAttr}${rlFaultAtt(boxFaults, li, fp)} aria-label="Rally" value="${esc(fmtHM(f.rl))}">`}<input class="tm${brSug ? ' sugbox' : ''}${dashCls}" data-bfld="${fp}.br"${alAttr(`${fp}.br`)}${dis}${sugAttr(brSug)}${dashAttr} value="${esc(fmtHM(f.br))}"></div>
        <div class="sb-bcell sb-tl"><input class="tm${badCls}"${badAtt} data-bfld="${fp}.to"${alAttr(`${fp}.to`)}${dis} value="${esc(fmtHM(f.to))}"><input class="tm${badCls}"${badAtt} data-bfld="${fp}.ld"${alAttr(`${fp}.ld`)}${dis} value="${esc(fmtHM(f.ld))}"></div>
        <div class="sb-seatpair">${sbSlot(di, key + '.p', 'p', a.p, stoRO)}${sbSlot(di, key + '.w', 'w', a.w, stoRO)}</div>
        <div class="sb-rcell"${alAttr(`st:${key}`)}>
          ${sa ? saBadgesHTML(key, a, !stoRO, true) : ''}
          ${boxHTML('nts', roleAccess ? `data-role-remarks="${esc(f.rid||'')}" data-role-day="${di}" readonly aria-label="Published Remarks — read only"${alAttr(`fr:${key}`)}` : `data-bfld="fr:${key}"${alAttr(`fr:${key}`)}${dis}`, a.rmks || '', 'Remarks')}
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
              + `<span class="bombs${view.stSavedOn(key) ? ' stsaved' : ''}" contenteditable="true" data-bombs="${key}">${esc((a.opts || {}).bombs || '')}</span></span>`)}
        </div>
        ${mvRO ? '' : `<span class="lctl">
          ${sbNudge(`mv:ac.${key}`, mvRO)}
          <button class="mbtn${cxOn ? ' on' : ''}" data-lcx="${key}" title="${cxOn ? 'Restore this line' : 'Cancel this line (CX)'}">CX</button>
          <button class="mbtn red${a.flag ? ' on' : ''}" data-lflag="${key}" title="${a.flag ? 'Clear the red box' : 'Red box — flag this for the next scheduler'}">■</button>
          <button class="mbtn add" data-lac="${di}.${gi}.${li}" title="Add another aircraft to this formation">+</button>
          <button class="mbtn del" data-ldel="${key}" title="Remove this line">✕</button>
        </span>`}
      </div>`
    })
    /* AREA strip right after THIS formation's aircraft — the same two
       derived-or-typed cells the week draws (html.ts form-area): area codes and
       the airspace window. Shown whenever there is something to show, or always
       in edit mode so it can be filled in. areaText/atimeText — NOT '' — is what
       the cell SHOWS (derived off the aircraft until typed over), so
       routeFocusOut compares against the same value and a click-through does not
       freeze the cell (textedit.ts). It is not a .sb-line[data-move], so the
       row-drag machine steps right over it. */
    if (!sa) {
      const areaTxt = areaText(f), timeTxt = atimeText(f)
      if (roleAccess || !(mvRO && !areaTxt && !timeTxt))
        fly += `<div class="sb-area"${missionTracking()?` data-role-formation="${esc(f.rid||'')}" data-role-day="${di}"`:''}><span class="fa-lb">AREA</span>`
          + `<span class="areacell"${alAttr(`ar:${di}.${gi}.${li}`)} ${mvRO ? '' : `contenteditable="true" spellcheck="false" data-area="${di}.${gi}.${li}"`}>${esc(areaTxt)}</span>`
          + `<span class="timecell"${alAttr(`at:${di}.${gi}.${li}`)} ${mvRO ? '' : `contenteditable="true" spellcheck="false" data-atime="${di}.${gi}.${li}"`}>${esc(timeTxt)}</span></div>`
    } })
    fly += `</div>`
  })
  /* + Wave LIVES HERE NOW (owner, 13 Aug 26 — "put an add wave between common
     programme and duties, then remove the wave at the top bar for desktop and
     phone"). It is a section-level add control, the same idiom as the
     "+ Block" / "+ Item" / "+ Row" every other section already carries, sitting
     between Common Programme (above) and the flying waves (below). The board
     top-bar button (#sbAddGo) and the desktop edit-week page button (#addGo)
     are both gone; this inline control is the only way to create a wave.
     Withheld on mvRO (a frozen preview or a read-only board), which is what the
     top-bar button's `disabled={DPREV.has(SBDAY)}` guard used to do. */
  const wvHead = mvRO ? '' : `<div class="sb-panel wv"><div class="sb-ph">Flying waves <span class="gctl"><button class="mbtn add" data-wvadd="${di}" title="Add a flying wave">+ Wave</button></span></div></div>`
  const wavesPanel = wvHead + (fly || `<div class="sb-empty" style="padding:14px 11px">No flying waves yet${mvRO ? '' : ' — “+ Wave” above adds the first'}.</div>`)
  /* THE BOARD PANELS, emitted in the day's own order (owner, 29 Aug 26 —
     engine/order.ts secOrder). The Templates head stays pinned above; everything
     below it — the six schedule sections AND the four crew working-aid panels — is
     ONE draggable list now (owner, 31 Aug 26 — "one list, drag anywhere"). The
     canonical order is notes · prog · waves · duty · sims · ground · inputs · avail ·
     sans · unav, which is exactly the old layout (the schedule sections, then the
     crew group), so a pristine day is byte-identical; only a re-arranged day differs.
     Overall Notes and Common Programme are two separate cards (owner, 31 Aug 26
     "split them apart"); the sim planning notes still sit inside the Sims panel, so
     the board reads the way the week does. */
  /* one pass over INPUTS for the three input-backed crew panels — the board
     rebuilds on every edit */
  const dayInp = inputsOn(d.dt)
  const sect: Record<string, string> = {
    notes: sbNotesPanel(d, di, pv, mvRO), prog: sbProgPanel(d, di, pv, mvRO), waves: wavesPanel,
    duty: sbDutyPanel(d, di, pv, mvRO), sims: sbSimRowsPanel(d, di, pv, mvRO), ground: sbGroundPanel(d, di, pv, mvRO),
    /* the crew working-aid panels — same builders and, by the canonical order above,
       the same starting position as before (Personal Inputs → Available crew → SANS →
       Unavailable). availHTML is withheld on a read-only board like every other
       computed/write panel ("who is free" is a live read, meaningless on a frozen past
       version); the other three keep their own mvRO read-only shape. They reorder on
       the BOARD only — the week appends these panels separately (engine/order.ts). */
    inputs: sbInputsGroupPanel(d, di, pv, dayInp, mvRO),
    avail: mvRO ? '' : availHTML(d, di, true),
    sans: sbSansPanel(d, di, dayInp, mvRO),
    unav: sbUnavailPanel(d, di, dayInp, mvRO),
  }
  /* each panel is wrapped so its grip can drag the whole card into a new place
     (data-secmove → store.moveSectionTo, DISPLAY order only — see engine/order.ts).
     The dotted ⠿ grip is injected as the FIRST child of the panel's own header, so it
     reads on the card it moves, aligns with the wave grip's column, and pushes the
     title clear of itself — the owner's "align with Go 1, dotted, beside the title,
     centred" (scheduler.css). The match is loose (`sb-ph` OR `ap-h`) so it lands
     whatever header the panel carries: the schedule cards' `<div class="sb-ph">`, the
     foldable Personal Inputs header (`sb-ph pl-fold` + data-pitog) and Available crew's
     own `<div class="ap-h">` fold header all take it. Only the first header is matched
     (no /g), so a nested header inside a panel is never hit. Edit board only: a
     read-only board wraps nothing, staying lean and undraggable. */
  const secGrip = '<span class="secgrip" title="Drag to reorder this section" aria-label="Reorder this section">⠿</span>'
  const wrapSec = (html: string, k: string) =>
    `<div class="sb-sec" data-secmove="${di}.${k}">${html.replace(/(<div class="(?:sb-ph|ap-h)\b[^>]*>)/, `$1${secGrip}`)}</div>`
  let b = dayBarHTML(di, tplBtn, canOil) + secOrder(d).map((k: string) =>
    mvRO ? (sect[k] || '') : (sect[k] ? wrapSec(sect[k], k) : '')).join('')
  return b
}

/* The day's sign-off bar as its own element, so the Live Checks panel can sit
   directly below it (owner, 14 Aug 26). On a frozen preview the sign-off pills and
   every publish door stay away — a past version's signatures live on the AL record —
   but the PLANS SELECTOR and the VERSION TAG stay, as they do on the week: the
   selector's amber "👁 AL1" says what you are looking at and is the way to another
   version, the tag says what the day IS (register AM28 — the one selector both
   surfaces share, A5). The strip used to go blank here, older than the 15 Sep
   redesign that moved the two into it ([HUMAN-RETEST] walk W2-F1, 24 Sep 26). */
export function boardSignHTML(di: number, pv?: boolean) { return publishReadPass(() => boardSignBody(di, pv)) }   // one read of the day's comparison (publish.ts)
function boardSignBody(di: number, pv?: boolean) {
  /* who signed the version on screen, above the sign-off boxes (D95, D102): under a preview the previewed version
     (this strip is built outside the snapshot swap, so it names it itself — Fable F8), else the published version
     the working copy sits on */
  const signed = signedLineHTML(di, pv ? view.DPREV.get(di) : (dayApproved(di) ? dayCurVer(di) : null))
  if (pv) return `<div class="signoff board-sign" id="sbSignBar">${signed}<div class="sb-pub">${planSelectorHTML(di)}${verTagHTML(di)}</div></div>`
  /* the desktop "view all changes" entry heads this element, above the
     sign-off bar, exactly as it did when both lived at the top of #sbBoard */
  /* Publish controls, "same as edit schedule" (owner ask): dayStatHTML is the
     week day head's own version chip / pending count / ⓘ / Publish day /
     Publish AL strip (html.ts), shared verbatim so a scheduler working the
     full-screen board never has to back out to the week to publish. Gated on
     HOOKS.editMode() alone — pv is already ruled out above, so that's the one
     term left of the stoRO/mvRO gate every other write control on this board
     uses; dayStatHTML itself renders the read-only stamp instead of a button
     when ed is false, same as the week's view-only page does. Placed inside
     #sbSignBar, right after the sign-off names, so signing and publishing
     read as one block instead of two disconnected panels. */
  const ed = HOOKS.editMode()
  /* THE PLANS SELECTOR + TITLE TAG head the publish strip (owner, 15 Sep 26 —
     the redesign). planSelectorHTML is the SAME builder the week day head uses
     (A5), so switching plans / previewing versions behaves identically on both
     surfaces; verTagHTML is the green issued-version tag (dashed DRAFT while
     unpublished) that replaced the "✓ Published · ALn" stamp. The selector's
     data-planmenu routes through routeClick (document level), exactly as this
     strip's data-alpub / data-beak already do. The "Not yet signed" marker rides
     beside the tag from the SAME body the week head uses (nysMarkHTML) — the board is
     the working copy too ([HUMAN-RETEST] walk S5, 24 Sep 26). */
  /* (the board's "☰ Edit history" line that led this strip is gone — the changes window is the list, [DRAFT-PENDING] D168) */
  return `<div class="signoff board-sign" id="sbSignBar">${signed}${signoffHTML(di, true)}`
    + `<div class="sb-pub">${planSelectorHTML(di)}${verTagHTML(di)}${nysMarkHTML(di)}${dayStatHTML(di, ed)}</div></div>`
}

/* `look`: drawn under a look at a published version (D187) — the day's checks as that version shows them, read only:
   no mute and no "create the period" (they act on today's day, not on the record) */
export function boardWarnHTML(di: number, look = false) {
  const d = DAYS[di]
  const all = (WARN.byDay[di] && WARN.byDay[di].warns) || []
  /* A HIDDEN WARNING IS NOT COUNTED (owner D472, 1 Oct 26 — "it should just show 2 issues"): the count, the "N warnings"
     and the bar's colour read the SHOWN warnings, as the week's bar does (ui/html.ts dayWarnHTML); the count says nothing
     about a hidden one. `off` is the warning's own mark from the bundle being drawn — the working copy's hides here, a
     version's own under a look (D471). */
  const dw = shownWarns(all)
  /* .sbwrap/.open + data-sbwtog + .sbw-car exist for the PHONE fold (owner,
     8 Aug 26 — the always-open strip scrolled inside the one board
     scroller). Desktop hides the caret and its toggle branch is
     isPhone()-gated, so the header stays inert there and the rows always
     show. The ⚠ prints only when there is something to warn about. */
  /* The collapsed header reads and colours like the edit week's .daywarn bar
     (owner, 14 Aug 26 — "title it issues instead of live and have colours on
     the bar depending on warning or advisory"): "N issues · N warning · tap to
     review", the bar tinted red when anything is hard, amber when the worst is
     an advisory, grey for notes only. worst/nh are computed the same way
     dayWarnHTML does. */
  const worst = dw.some((w: any) => w.sev === 'hard') ? 'hard' : dw.some((w: any) => w.sev === 'adv') ? 'adv' : 'note'
  const nh = dw.filter((w: any) => w.sev === 'hard').length
  let wh = `<div class="sbwrap${SBWOPEN ? ' open' : ''}">`
    + `<div class="wh${dw.length ? ' ' + worst : ' ok'}" data-sbwtog title="Show / hide the day's checks">`
    + `<span class="sbw-car">${SBWOPEN ? '▾' : '▸'}</span>`
    + (dw.length
      ? `<b>⚠ ${dw.length} issue${dw.length > 1 ? 's' : ''}</b>${nh ? ` · ${nh} warning${nh > 1 ? 's' : ''}` : ''}`
      /* every issue hidden (D475): the quiet heading, and the struck lines still under it — on a phone the heading is
         the fold's own toggle, so it says the list can be opened */
      : `No conflicts flagged for ${esc(d.dow)} ✓`)
    + `</div>`
  if (all.length) {
    const canMute = !look && canEditSched()
    const wtext = (w: any) => {
      const names = (w.who || []).map((id: any) => PEOPLE[id] ? PEOPLE[id].cs : id).join(', ')
      return `${esc(names)}${names ? ' — ' : ''}${esc(wlbl(w.msg || WCODE[w.code] || w.code || ''))}`
    }
    /* Iterate WARN's own array, unsorted: validate() has already ordered it by
       SORD (hard, adv, note), so the local hard-first sort this used to do was a
       second copy of ordering the engine owns — and re-ordering would break the
       index these rows now carry. Same order as the week's .dwlist, which also
       iterates as stored; the two lists could previously disagree.
       A scheduler can HIDE a specific warning (owner, Aug 26). Since [WARN-HIDE-KEPT] (owner D469 / D475, 1 Oct 26)
       its line STAYS WHERE IT IS, struck out and darker, its ✕ become ↺ — "it shouldn't totally disappear … ready to
       be reactivated again for flagging"; the "N hidden" fold is gone. A look at a version draws its own hidden lines
       struck too, with no button (D187 read with D469: every warning the version holds, the hidden ones struck). */
    all.forEach((w: any, ix: number) => {
      const hid = !!w.off
      /* the selected state goes in the STRING, not on a class painted later:
         SchedBoard diffs this html against the last one to decide whether to
         re-hang the panel, so a class added afterwards is lost on the next
         unrelated repaint */
      const on = view.WFOCUS && view.WFOCUS.di === di && view.WFOCUS.ix === ix ? ' on' : ''
      /* the SELECTED person's flagged rows light, and clicking their puck snaps
         the panel to the first of them (owner, 26 Aug 26 — "click a puck that has
         any flagging … the top right warning column will snap to that puck and
         show what triggered that flagging"). selectPerson clears WFOCUS, so
         `.pksel` and `.on` never apply to the same row. */
      const sel = view.SELID && (w.who || []).includes(view.SELID) ? ' pksel' : ''
      wh += `<div class="wln ${w.sev}${on}${sel}${hid ? ' hid' : ''}" data-wdi="${di}" data-wix="${ix}" title="${hid ? 'Hidden — it flags no puck and is not counted. ' : ''}Jump to the puck that caused this">`
        + `<span class="wln-t">${wtext(w)}</span>`
        + (canMute ? `<button class="wln-mute" data-woff="${di}.${ix}" title="${hid ? 'Flag this again' : 'Hide this warning — it flags no puck and is not counted; it comes back if the situation changes'}">${hid ? '↺' : '✕'}</button>` : '')
        /* THE WAY OUT, BESIDE THE REASON, HERE TOO (owner's ruling D19; walk
           find, 22 Sep 26). The week's list already carried this and the
           board's did not, so the surface that tells a scheduler the credit can
           never land was the one that left him to go and find the Leave War
           himself. Same helper as the week (mkPeriod), so the button and the
           sentence cannot name different years, and no other check grows an
           action. */
        + (!look && !hid && mkPeriod(w, di) ? `<button class="wln-act" data-mkperiod="${esc(mkPeriod(w, di))}" title="Creates the ${esc(mkPeriod(w, di))} leave war period, with nothing open for bidding, and takes you to the Leave War to open its dates">Create the ${esc(mkPeriod(w, di))} period</button>` : '')
        + `</div>`
    })
  } else wh += `<div class="wln ok">No conflicts flagged for this day ✓</div>`
  /* (the way into the changes list that sat here, while History was on, is gone: the one changes window is the list,
     opened by the day's own chip and the board's History button — [DRAFT-PENDING], D168, 28 Sep 26) */
  wh += `</div>`
  return wh
}

/* THE CHECKS PANEL IS RESIZABLE ON DESKTOP (owner, Aug 26 — "allow adjusting of
   the warning and placeholder windows … move the border to reduce the amount of
   warning shown. Vice versa"). A grip on the border between the day's checks
   (.sb-warn) and the crew roster below it; dragging it sets an explicit height
   on .sb-warn, so the two trade space. The DEFAULT — never dragged — is left
   exactly as it was (content-sized up to 38%, .sb-side has no .sb-warn-sized
   class), so the board's geometry is unchanged until the grip is actually used.
   Desktop only: the phone board is one scroller with no split to move (the grip
   is display:none there). Pointer events with a deferred commit after a small
   slop, the wireDayDots shape — capture is released on down so the trailing
   click is not retargeted, and the move/up listeners live on document so a drag
   that leaves the 7px grip still tracks and still ends. Written straight to the
   DOM (a CSS var + a class on the persistent .sb-side), never through React
   state, so a panel re-hang mid-session does not throw the size away. */
/* A DRAG OF A GRIP ENDS WITH A CLICK THAT IS NOT A CLICK. The press began on the grip and the button came up wherever
   the pointer was let go — over the day, or further down the column — so the browser sends the click to what holds them
   both, which the board reads as a click on blank space: the seat being planned and the selection were dropped (the
   walk of 21 Oct 26, [BOARD-SIDE-WIDTH]). After a drag that moved, that one click is swallowed before anything sees it. */
function swallowNextClick() {
  const swallow = (ev: Event) => { ev.stopPropagation(); ev.preventDefault() }
  document.addEventListener('click', swallow, { capture: true, once: true })
  setTimeout(() => document.removeEventListener('click', swallow, true), 0)
}
export function wireWarnSplit(side: HTMLElement) {
  const down = (e: PointerEvent) => {
    const grip = (e.target as HTMLElement).closest('[data-wsplit]')
    if (!grip || (e.button != null && e.button !== 0)) return
    const warn = side.querySelector('.sb-warn') as HTMLElement | null
    if (!warn) return
    const y0 = e.clientY, h0 = warn.offsetHeight
    let moved = false
    try { (grip as HTMLElement).releasePointerCapture((e as any).pointerId) } catch { }
    const move = (ev: PointerEvent) => {
      if (!moved && Math.abs(ev.clientY - y0) < 3) return
      moved = true
      const max = Math.max(120, side.clientHeight - 140)
      const h = Math.max(80, Math.min(max, h0 + (ev.clientY - y0)))
      side.style.setProperty('--sb-warnH', h + 'px')
      side.classList.add('sb-warn-sized')
      ev.preventDefault()
    }
    const up = () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', up)
      document.removeEventListener('pointercancel', up)
      if (moved) swallowNextClick()
    }
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', up)
    document.addEventListener('pointercancel', up)
  }
  side.addEventListener('pointerdown', down)
  return () => side.removeEventListener('pointerdown', down)
}

/* THE RIGHT PANEL WIDENS BY ITS LEFT EDGE (owner D1113, D1118, 21 Oct 26 — "Yes as recommended for the right panel";
   round 1 "yes to all"). A grip on the side column's left edge (.sb-sidegrip) drags the panel from 320 up to 40% of the
   window; its two crew columns and the issues list share the width, the day narrows. A double-click puts it back to 320;
   with the keyboard on the grip, ← widens and → narrows by 20, Home is 320 and End the widest. The width is REMEMBERED ON
   THIS COMPUTER — a view preference, straight to localStorage under its own key outside the app's shared prefix, never
   through the whiteboard or the settings command (the Tracker's ocuLocal precedent, docs/data-schema.md): it is nobody
   else's business how wide one scheduler's panel is. The width he asked for is kept; what is drawn is clamped to the
   window, so a smaller window shows less and a larger one gives it back. Written straight to the DOM (a CSS variable on
   the persistent .sb-side, as wireWarnSplit does), so a repaint of the board keeps it. Desktop only: the grip is
   display:none at a phone's width, where the column is the drawer. */
export const SIDE_MIN = 320
export const SIDE_KEY = 'raptorLocal:sbSideW'
export const sideMax = () => Math.max(SIDE_MIN, Math.round(window.innerWidth * 0.4))
const readSideW = () => { try { const v = Number(window.localStorage.getItem(SIDE_KEY) || ''); return v > 0 ? v : SIDE_MIN } catch { return SIDE_MIN } }
const saveSideW = (w: number) => { try { if (w > SIDE_MIN) window.localStorage.setItem(SIDE_KEY, String(Math.round(w))); else window.localStorage.removeItem(SIDE_KEY) } catch { } }
export function wireSideGrip(side: HTMLElement) {
  const grip = side.querySelector('[data-sidegrip]') as HTMLElement | null
  if (!grip) return () => { }
  let want = readSideW()
  const apply = (w: number) => {
    const c = Math.max(SIDE_MIN, Math.min(sideMax(), Math.round(w)))
    if (c > SIDE_MIN) side.style.setProperty('--sb-sideW', c + 'px'); else side.style.removeProperty('--sb-sideW')
    grip.setAttribute('aria-valuenow', String(c)); grip.setAttribute('aria-valuemax', String(sideMax()))
    return c
  }
  apply(want)
  const set = (w: number) => { want = apply(w); saveSideW(want) }
  const down = (e: PointerEvent) => {
    if (e.button != null && e.button !== 0) return
    e.preventDefault()
    const x0 = e.clientX, w0 = side.getBoundingClientRect().width
    try { grip.releasePointerCapture(e.pointerId) } catch { }
    grip.classList.add('drag'); document.body.classList.add('sbside-drag')
    let moved = false
    const move = (ev: PointerEvent) => { if (!moved && Math.abs(ev.clientX - x0) < 3) return; moved = true; want = apply(w0 + (x0 - ev.clientX)); ev.preventDefault() }
    const up = () => {
      document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up)
      grip.classList.remove('drag'); document.body.classList.remove('sbside-drag')
      saveSideW(want)
      if (moved) swallowNextClick()
    }
    document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up)
  }
  const dbl = () => set(SIDE_MIN)
  const key = (e: KeyboardEvent) => {
    const now = side.getBoundingClientRect().width
    const to = e.key === 'ArrowLeft' ? now + 20 : e.key === 'ArrowRight' ? now - 20 : e.key === 'Home' ? SIDE_MIN : e.key === 'End' ? sideMax() : null
    if (to == null) return
    e.preventDefault(); set(to)
  }
  const resize = () => apply(want)
  grip.addEventListener('pointerdown', down); grip.addEventListener('dblclick', dbl); grip.addEventListener('keydown', key)
  window.addEventListener('resize', resize)
  return () => {
    grip.removeEventListener('pointerdown', down); grip.removeEventListener('dblclick', dbl); grip.removeEventListener('keydown', key)
    window.removeEventListener('resize', resize)
  }
}

export function dayTabsHTML(di: number) {
  /* strip the MONTH off the date so a chip reads "Mon 13", not "Mon Jul 13".
     Must strip ANY month, not the literal 'Jul ' — the board is continuous
     across weeks now (calendar pick / the ‹ › week-jump chips below), so its
     days routinely fall in August, September… and a hardcoded 'Jul ' left those
     showing the full "Mon Aug 23" (owner-scale bug found 24 Aug 26). */
  /* strip the month, and the trailing year a New Year-spanning week's labels
     carry ('Jan 1 2027' — weeks-data.ts weekLabels): the chip has room for
     'Fri 1', not 'Fri 1 2027' */
  const dayNum = (dt: string) => dt.replace(/^\S+\s+/, '').replace(/\s+\d{4}$/, '')
  /* data-fit: the chip's room is its weekday with a two-digit date ("Wed 30"), measured in whatever font draws it, so the
     › after the chips stays put from week to week (owner D1122; the figures are of one width — 10-board-history.css) */
  const chips = DAYS.map((x: any, i: number) => { const dw = esc(x.dow.slice(0, 3)); return `<span class="sbday ${i === di ? 'on' : ''}" data-sbtab="${i}" data-fit="${dw} 30">${dw} ${esc(dayNum(x.dt))}</span>` }).join('')
  /* WEEK ARROWS FLANK THE DAY CHIPS ON DESKTOP (owner, 23 Aug 26 — "in
     scheduler board i cant go between weeks except through the calendar").
     They live INSIDE #sbDays, which is display:flex on a desktop and
     display:none on a phone — so the phone board keeps its own ‹/› day arrows
     at the bar edges and never shows these, and every [data-sbtab] scrub/test
     is untouched because these carry data-sbweek instead. One press jumps a
     whole week and keeps the open weekday, so the strip relabels to the new
     week with the same column still lit (boardWeekStep). */
  const wk = (d: number, g: string, t: string) => `<span class="sbday sbweek" data-sbweek="${d}" title="${t}" aria-label="${t}">${g}</span>`
  return wk(-1, '‹', 'Previous week') + chips + wk(1, '›', 'Next week')
}

/* ---- CX-with-a-reason dialog state ---- */
/* The quick-fill reasons list moved to engine/cxreasons.ts (owner, Aug 26 —
   add/rename/delete your own), the same persisted-config footing as `stores`.
   The dialog now reads CXR_CFG; nothing here owns the list any more. */
export let CXT: any = null
export function setCxt(v: any) { CXT = v }
/* `via` — where the line is not the day's own to mark: a row that came from an input, whose CX is the INPUT's (owner
   D760; ui/reqdoor.ts rowMark). cxCommit then hands the answer to it and writes nothing itself. */
export function askCx(o: any, key: any, label: any, after?: any, via?: (cancel: boolean, reason: string) => boolean) {
  if (!o) return
  CXT = { o, key, after: after || null, label: label || 'this line', via: via || null }
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
  const { o, key, after, label, via } = CXT
  if (via) {
    /* the INPUT is cancelled or brought back, by its own door's one command: its own line of the change history, its
       own Undo step — and the row follows */
    CXT = null
    if (via(cancel, reason)) toast(cancel ? cxText({ cx: true, cxr: String(reason).trim() }) : UNMARKED.cx)
    else notify()
    return
  }
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
/* the armed "apply a day-template over a published day's working-draft edits"
   confirm (P2-R3-04) — survives the menu close so the second pick confirms;
   cleared on apply or a different pick. The arm key is scoped by dayTplArmKey
   (P2-IMPL-10), never the bare `${di}:${id}` — that collided across weeks. */
let DAYTPL_ARM: string | null = null
/* The template-apply confirm key. Bound to the ABSOLUTE date (CURWEEK + di — the
   same template id on another WEEK's same weekday must NOT match a stale arm, the
   P2-IMPL-10 bug), the selected DRAFT, the TEMPLATE's content and the WORKING
   DRAFT's content, so a change to the week, the draft, the template or the day's
   edits between the two taps forces a fresh confirm rather than silently applying. */
export function dayTplArmKey(di: any, id: any): string {
  di = +di
  const t = DAYTPL_CFG.find((x: any) => x.id === id) || null
  /* view.navGen() (P2-REV2-07): a navigation gesture between the two taps — a week
     swap, a page change, a session/role change — bumps it, so a navigate-away-and-
     back with UNCHANGED content no longer yields the same arm key and silently
     applies; the confirm re-arms instead. The content/week/draft terms still catch
     an intervening edit or draft switch. */
  return [CURWEEK, di, id, curDraftId(di) || '', view.navGen(), JSON.stringify(t), JSON.stringify(DAYS[di])].join('␟')
}
/* Decide + perform a day-template pick, extracted from the menu handler so the
   slot disarm is unit-testable (P2-IMPL-11). Returns 'refused' on a PUBLISHED day (D96, 25 Sep 26 — a template is
   refused there; the caller says DAYTPL_PUBLISHED_MSG), 'applied', or 'noop' (applyDayTpl declined). 'armed' — the
   old confirm before a published day's working-draft apply (P2-R3-04, P2-IMPL-10) — is no longer returned. */
export function pickDayTpl(di: any, id: any): 'armed' | 'applied' | 'noop' | 'refused' {
  di = +di
  /* D96 (25 Sep 26): a published day never takes a template — refused FIRST, before anything arms (Fable F4: the
     old order armed on the first pick, "pick it again to confirm", then went silent on the second). The confirm
     that used to guard a published day's working-draft edits has nothing left to guard; 'armed' is no longer
     returned, and dayTplArmKey stays only for its own tests. */
  if (dayApproved(di)) { DAYTPL_ARM = null; return 'refused' }
  DAYTPL_ARM = null
  /* disarm any crew slot armed on THIS day BEFORE the replacement — a whole-day
     swap leaves the slot's address occupied by a new row, so afterSchedMutate's
     "target gone?" disarm does not fire and a stale arm would plant into the
     replacement sortie (P2-IMPL-11). Mirrors the recovery / draft-switch paths. */
  if (view.ARM && view.ARM.di === di) view.disarmSlot()
  let applied=false
  const result=commit({type:SCHED_TYPES.mutate,scope:{module:'sched',weekId:CURWEEK},apply(txn){
    txn.enlist(schedStore)
    withFreshMissionRoles(txn,()=>{applied=applyDayTpl(di,id);if(applied)afterSchedMutate()})
  }})
  return isOk(result) && applied ? 'applied' : 'noop'
}
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
  /* the caret leaves its text box first, as at a section's sort (boardMbtn, data-sortsec): a line left after the sort
     wrote its words by its old place */
  const typing = document.activeElement as HTMLElement | null
  if (typing && typing !== document.body && (typing.isContentEditable || typing.getAttribute('contenteditable') === 'true' || /^(INPUT|TEXTAREA)$/.test(typing.tagName))) typing.blur()
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
/* A STRUCTURAL EDIT LOGS ITS LINE FIRST, then saves ([DB-READINESS] group A, the group-wide walk's finding H2, 30 Sep 26):
   a line logged BEFORE afterSchedMutate's self-wrapped command is held and kept inside it — the edit and its line one
   saved group, one change-log batch (engine/editlog.ts hold); logged AFTER, it went out as a second saved group of its
   own. So those sites call logAction, then afterSchedMutate, then toast — the words unchanged. `act` stays for a line
   whose words depend on the result (the OIL switches), which can only follow its command (its own group, its batch). */

/* THE ROW AS THE SCHEDULER READS IT, for the day's history — one body with the
   window's switch now (Fable F5): oilmode.ts oilItemHistName, which carries the
   whole reasoning (a request by its long type name, anything else by the name
   the mode drew in its item cell). */
const oilItemName = (di: any, item: string): string => oilItemHistName(di, item)

/* WHAT A DELETED ROW HELD, said once — the log and the toast are the same
   string (act, above), so a description has to stay short. Free text is
   clipped to ~60 chars with a trailing ellipsis; empty parts are dropped
   rather than printed as bare commas, since a note or a duty row rarely
   fills every field it could carry. */
const clip = (s: any) => { const t = String(s ?? '').trim(); const cp = [...t]; return cp.length > 60 ? cp.slice(0, 59).join('') + '…' : t }
const desc = (...parts: any[]) => { const p = parts.map(clip).filter(Boolean).join(', '); return p ? ' — ' + p : '' }
/* a str/end pair as one clause, only when at least one side has something —
   a wholly-blank row (times never filled in) must not print a bare dash */
const timeSpan = (str: any, end: any) => (str || end) ? [str, end].filter(Boolean).join('–') : ''
/* person ids/callsigns → callsigns, deleted rows' `who` (and its `.more`
   overflow) collapsed to "Bane +3" once there is more than one, the same
   shorthand the board itself has no room to spell out in full either */
const whoText = (row: any) => {
  const ids = [...whoArr(row), ...((row && row.more) || [])].map((v: any) => whoId(v) || v).filter(Boolean)
  if (!ids.length) return ''
  const names = ids.map((id: any) => PEOPLE[id]?.cs || id)
  return names.length > 1 ? `${names[0]} +${names.length - 1}` : names[0]
}




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
     (the ▲▼ nudge and its "stale nudge button" test are gone since 31 Aug 26,
     but board.test.tsx's "a stale per-section Auto sort button does nothing" and
     "the delete-line (✕) button does nothing" still pass, but only because THIS line still
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
    /* the caret leaves its text box before the sort (the batch's check, 19 Oct 26 — the scenario designer's S1-02): a tap
       that does not move the focus (an iPhone's) left it in an In-time line, the sort reordered the stored lines under it,
       and leaving the line wrote its words by its old place — one line doubled, the other lost. Left now, it saves where
       it stands. (ui/rowdrag.ts does the same at a grip's press.) */
    const typing = document.activeElement as HTMLElement | null
    if (typing && typing !== document.body && (typing.isContentEditable || typing.getAttribute('contenteditable') === 'true' || /^(INPUT|TEXTAREA)$/.test(typing.tagName))) typing.blur()
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
    /* the rows' ORDER, not the list object: since [DB-READINESS] phase 6 (c) the working-out after the command may put an
       equal copy of the day's rows in place, so "the same array" no longer tells a reorder from none */
    const gSig = (r: any) => JSON.stringify([r && r.prog, r && r.str, r && r.end, r && r.src])
    const gWasMan = !!(gDay && gDay.gman), gRowsBefore: string[] = gDay ? (gDay.ground || []).map(gSig) : []
    let changed = false
    /* a wave's ⇅ orders its In-time / Rally lines too (D594) — both run, never one short-circuiting the other */
    if (kind === 'w') { const f = sortWave(n[0], n[1]); const l = sortInTimes(n[0], n[1]); changed = f || l }
    else if (kind === 'd') changed = sortDutyBlock(n[0], n[1])
    else if (kind === 's') changed = sortSims(n[0], rest[1])
    else if (kind === 'g') changed = sortGround(n[0])
    else if (kind === 'p') changed = sortProg(n[0])
    if (changed) {
      afterSchedMutate(); notify()
      const gNow = kind === 'g' ? ((DAYS[n[0]] || {}).ground || []).map(gSig).filter((x: string) => gRowsBefore.includes(x)) : []
      if (kind === 'g' && gWasMan && gNow.join('|') === gRowsBefore.join('|')) toast('Ground programme back to time order')
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
    return toast(r.a.flag ? 'Red box: flagged for the next scheduler' : 'Red box cleared')
  }
  if (ds.ldel != null) {
    const r = acRef(ds.ldel); if (!r || !r.a) return
    const [dI, gI] = String(ds.ldel).split('.').map(Number)
    const issued = deletionWasIssued(dI, 'line', gI, r.li, r.ai)
    /* what the line HELD, read off r.f/r.a before the splice below empties
       either — the formation may vanish with it if this was its last aircraft */
    const said = 'Line removed' + desc([r.f.cs, r.f.msn].filter(Boolean).join(' · '), timeSpan(r.f.to, r.f.ld), [PEOPLE[r.a.p]?.cs, PEOPLE[r.a.w]?.cs].filter(Boolean).join('/'))
    /* the removed ROOT rid(s), captured BEFORE the splice: the aircraft always,
       and the formation too when this was its last aircraft (it goes with it) */
    const rids: any[] = [r.a && r.a.rid]
    r.f.aircraft.splice(r.ai, 1)
    shiftAircraft(dI, gI, r.li, r.ai)
    if (!r.f.aircraft.length) { rids.push(r.f.rid); r.w.formations.splice(r.li, 1); shiftFormation(dI, gI, r.li) } else rollCx(r.f)
    dropRowMarks(rids)
    markDeletion(dI, 'line', issued); logAction(dI, said); afterSchedMutate(); notify(); return toast(said)
  }
  if (ds.lac != null) {
    const [di, gi, li] = ds.lac.split('.').map(Number)
    const f = DAYS[di].waves[gi].formations[li]
    f.aircraft.push({ p: '', w: '', area: '', rmks: '', opts: {} }); rollCx(f)
    markStructuralAdd(`fr:${di}.${gi}.${li}.${f.aircraft.length - 1}`); logAction(di, 'Aircraft added'); afterSchedMutate(); notify(); return toast('Aircraft added')
  }
  if (ds.gline != null) {
    const [di, gi] = ds.gline.split('.').map(Number)
    /* A NEW LINE COMES UP BLANK (owner, 10 Aug 26). It used to copy the
       previous line's callsign, mission, take-off and land, which reads as
       filled in when nobody filled it in — a plausible wrong time is worse
       than an empty box, because only the empty one asks to be typed into. */
    const w = DAYS[di].waves[gi]
    w.formations.push({ cs: '', msn: '', to: '', ld: '', aircraft: [{ p: '', w: '', area: '', rmks: '', opts: {} }] })
    markStructuralAdd(`ff:${di}.${gi}.${w.formations.length - 1}.cs`); logAction(di, 'Line added'); afterSchedMutate(); notify(); return toast('Line added')
  }
  if (ds.gdel != null) {
    const [di, gi] = ds.gdel.split('.').map(Number)
    const gw = DAYS[di].waves[gi]
    const issued = deletionWasIssued(di, 'wave', gi)
    /* the wave's own shape, read before the splice below removes it — how many
       formations and aircraft it was carrying, not just its label */
    const nf = gw ? gw.formations.length : 0
    const na = gw ? gw.formations.reduce((n: number, f: any) => n + f.aircraft.length, 0) : 0
    const said = 'Wave removed' + desc(gw && gw.label, nf ? `${nf} formation${nf > 1 ? 's' : ''} · ${na} aircraft` : '')
    const waveRid = gw && gw.rid    // the root rid — sweeps its formations/aircraft too (ancestor-retaining keys)
    DAYS[di].waves.splice(gi, 1); shiftWave(di, gi)
    dropRowMarks([waveRid])
    /* DELETING A WAVE LEAVES THE DUTY BLOCKS ALONE (owner, 13 Aug 26 — duties
       are decoupled from waves). A desk is placed from a template now and owned
       by nothing on the flying side, so a wave's removal no longer walks the
       dutywaves list to take any desk down with it. */
    markDeletion(di, 'wave', issued); logAction(di, said); afterSchedMutate(); notify(); return toast(said)
  }
  if (ds.nadd != null) {
    const d = DAYS[+ds.nadd]; d.notes = d.notes || []; d.notes.push(mkNote(''))
    markStructuralAdd(`dn:${+ds.nadd}.${d.notes.length - 1}`); logAction(+ds.nadd, 'Note added'); afterSchedMutate(); notify(); return
  }
  if (ds.ndel != null) {
    const [di, ni] = ds.ndel.split('.').map(Number)
    const issued = deletionWasIssued(di, 'note', ni)
    /* the note's own words, quoted — the closing quote is only added when the
       text fit whole. A note long enough to clip already ends in clip's own
       ellipsis, and a quote mark stitched on after that would read as part of
       the sentence rather than as the record trimming it. */
    const raw = noteText(DAYS[di].notes[ni]).trim(), text = clip(raw)
    const said = 'Note removed' + (text ? ` — "${text}${text === raw ? '"' : ''}` : '')
    DAYS[di].notes.splice(ni, 1); shiftKeys(`dn:${di}.`, 0, ni)
    markDeletion(di, 'note', issued); logAction(di, said); afterSchedMutate(); notify(); return toast(said)
  }
  if (ds.padd != null) {
    const d = DAYS[+ds.padd]; d.allhands = d.allhands || []
    d.allhands.push({ prog: '', sub: '', str: '', end: '', who: [], rmks: '' })
    markStructuralAdd(`ap:${+ds.padd}.${d.allhands.length - 1}.prog`); logAction(+ds.padd, 'Programme item added'); afterSchedMutate(); notify(); return
  }
  if (ds.pdel != null) {
    const [di, ri] = ds.pdel.split('.').map(Number)
    const issued = deletionWasIssued(di, 'programme', ri)
    /* the item's own line, before the splice below takes it */
    const x = DAYS[di].allhands[ri]
    const said = 'Item removed' + desc([x.prog, x.sub].filter(Boolean).join(' · '), timeSpan(x.str, x.end), whoText(x))
    const rid = x && x.rid
    DAYS[di].allhands.splice(ri, 1)
    ;[`ap:${di}.`, `a:${di}.`].forEach(h => shiftKeys(h, 0, ri))
    dropRowMarks([rid])
    markDeletion(di, 'programme', issued); logAction(di, said); afterSchedMutate(); notify(); return toast(said)
  }
  if (ds.pcx != null) { const [di, ri] = ds.pcx.split('.').map(Number); return askCx(DAYS[di].allhands[ri], `ap:${di}.${ri}.prog`, 'this item') }
  if (ds.pflag != null) {
    const [di, ri] = ds.pflag.split('.').map(Number); const x = DAYS[di].allhands[ri]
    x.flag = !x.flag; markEdit(`ap:${di}.${ri}.prog`); afterSchedMutate(); notify()
    return toast(x.flag ? 'Red box: flagged for the next scheduler' : 'Red box cleared')
  }
  /* the ⓘ info-only flip (owner, 1 Sep 26) rides the same shape as the red box:
     through the funnel, marked on the row's own key so a flip on a published
     day rides the next AL. afterSchedMutate re-validates, which is the whole
     point — the item's warnings appear/vanish the moment it is flipped. */
  if (ds.pinfo != null) {
    const [di, ri] = ds.pinfo.split('.').map(Number); const x = DAYS[di].allhands[ri]
    x.info = !x.info; markEdit(`ap:${di}.${ri}.prog`); afterSchedMutate(); notify()
    return toast(x.info ? 'This item is info only: no longer checked against the rules, and earns nobody any OIL' : 'This item is checked against the rules again and can earn OIL')
  }
  /* ---- duty / sim / ground rows (the panels added Aug 26) ---------------
     Same shapes as the p* programme branches: adds mark the new row's name
     key, deletes renumber the surviving keys and add an inert deletion
     tombstone, CX goes through the reason dialog. */
  /* + BLOCK OPENS THE TEMPLATE PICKER (owner, 13 Aug 26). It lists the saved
     duty templates directly — no wave needed — and picking one copies its rows
     onto the day; the pencil opens the editor. See blockMenu below. */
  if (ds.wvadd != null) {
    /* the inline "+ Wave" between Common Programme and the flying waves
       (board.ts's boardHTML) — opens the same kind picker the top-bar button
       used to, anchored on itself and scoped to the board's own day. */
    return waveMenu(t, +ds.wvadd)
  }
  if (ds.dwadd != null) {
    const di = +ds.dwadd
    return blockMenu(t, di)
  }
  /* the board's own "Templates" button, at the top of the board content —
     see dayTplMenu above and the boardHTML comment on where the button lives. */
  /* the OIL Earn button, and the day blanket once the mode is on. A mode switch
     writes nothing — it only changes what the board draws and what a tap means —
     so it needs no funnel; the blanket IS a write and goes through it. */
  if (ds.oilmode != null) {
    const di = +ds.oilmode
    const on = toggleOilMode(di)
    notify()
    /* (owner D838 + D839, 14 Oct 26 — N9: the button reads "OIL Earn", so the note names it that, not "OIL mode"; and
       "take a man off that event" was read as taking him off the SCHEDULE. The same words: ui/SchedBoard.tsx.) */
    return toast(on ? 'OIL Earn: tap a puck to stop that man earning from that event, or an item to stop the whole item earning' : 'Back to editing the schedule')
  }
  if (ds.oilblank != null) {
    const di = +ds.oilblank
    const on = !oilBlanketOn(di)
    setOilBlanket(di, on)
    notify()
    return act(di, on ? 'Nothing on this day earns OIL, including anything added later' : 'This day can earn OIL again, and the marks underneath are back')
  }
  if (ds.daytpladd != null) {
    const di = +ds.daytpladd
    return dayTplMenu(t, di)
  }
  if (ds.dwdel != null) {
    const [di, wi] = ds.dwdel.split('.').map(Number)
    const issued = deletionWasIssued(di, 'dutyblock', wi)
    /* the block's own label and row count, before the splice below empties it */
    const dw = DAYS[di].dutywaves[wi], n = dw ? dw.rows.length : 0
    const said = 'Duty block removed' + desc(dw && dw.label, n ? `${n} row${n > 1 ? 's' : ''}` : '')
    const rid = dw && dw.rid    // sweeps the block and its rows (ancestor-retaining)
    DAYS[di].dutywaves.splice(wi, 1)
    ;[`d:${di}.`, `dr:${di}.`, `dl:${di}.`].forEach(h => shiftKeys(h, 0, wi))
    dropRowMarks([rid])
    markDeletion(di, 'dutyblock', issued); logAction(di, said); afterSchedMutate(); notify(); return toast(said)
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
    /* the row's role, who was in it and its hours, before the splice below */
    const row = DAYS[di].dutywaves[wi].rows[ri]
    const said = 'Duty row removed' + desc(row.role, PEOPLE[row.id]?.cs || row.id, timeSpan(row.str, row.end))
    const rid = row && row.rid
    DAYS[di].dutywaves[wi].rows.splice(ri, 1)
    ;[`d:${di}.${wi}.`, `dr:${di}.${wi}.`].forEach(h => shiftKeys(h, 0, ri))
    dropRowMarks([rid])
    markDeletion(di, 'duty', issued); logAction(di, said); afterSchedMutate(); notify(); return toast(said)
  }
  if (ds.drcx != null) { const [di, wi, ri] = ds.drcx.split('.').map(Number); return askCx(DAYS[di].dutywaves[wi].rows[ri], `dr:${di}.${wi}.${ri}.role`, 'this duty') }
  if (ds.drflag != null) {
    const [di, wi, ri] = ds.drflag.split('.').map(Number); const x = DAYS[di].dutywaves[wi].rows[ri]
    x.flag = !x.flag; markEdit(`dr:${di}.${wi}.${ri}.role`); afterSchedMutate(); notify()
    return toast(x.flag ? 'Red box: flagged for the next scheduler' : 'Red box cleared')
  }
  if (ds.sradd != null) {
    const [di, kind] = ds.sradd.split('.')
    const d = DAYS[+di]; d.sims = d.sims || {}
    const rows = (d.sims[kind] = d.sims[kind] || [])
    rows.push({ label: '', str: '', end: '' })
    markStructuralAdd(`sr:${+di}.${kind}.${rows.length - 1}.label`); logAction(+di, 'Sim row added'); afterSchedMutate(); notify(); return
  }
  /* + Block (AMT) — the whole three-row shape in one tap (owner, 14 Aug 26:
     "add an AMT block that shows what it shows now. Like brief box and
     debrief. All 3 together"). Times stay BLANK — a new line comes up blank,
     a plausible wrong time reads as filled in — and the BOX carries pax:[] so
     the FCP/RCP grid renders its first empty droppable pair. Three structural
     adds, so the AL treats them exactly like three + Row taps. */
  if (ds.sblkadd != null) {
    const di = +ds.sblkadd
    const d = DAYS[di]; d.sims = d.sims || {}
    const rows = (d.sims.amt = d.sims.amt || [])
    rows.push({ label: 'BRIEF', str: '', end: '' }, { label: 'BOX', str: '', end: '', pax: [] }, { label: 'DEBRIEF', str: '', end: '' })
    for (let i = rows.length - 3; i < rows.length; i++) markStructuralAdd(`sr:${di}.amt.${i}.label`)
    logAction(di, 'AMT block added (BRIEF / BOX / DEBRIEF)'); afterSchedMutate(); notify(); return
  }
  if (ds.srdel != null) {
    const [di, kind, ri] = ds.srdel.split('.')
    const issued = deletionWasIssued(+di, 'sim', kind, +ri)
    /* the row's kind (AMT/OFT), label and hours, before the splice below */
    const row = DAYS[+di].sims[kind][+ri]
    const said = 'Sim row removed' + desc([kind.toUpperCase(), row.label].filter(Boolean).join(' · '), timeSpan(row.str, row.end))
    const rid = row && row.rid
    DAYS[+di].sims[kind].splice(+ri, 1)
    ;[`s:${di}.${kind}.`, `sr:${di}.${kind}.`].forEach(h => shiftKeys(h, 0, +ri))
    dropRowMarks([rid])
    markDeletion(+di, 'sim', issued); logAction(+di, said); afterSchedMutate(); notify(); return toast(said)
  }
  if (ds.srcx != null) { const [di, kind, ri] = ds.srcx.split('.'); return askCx(DAYS[+di].sims[kind][+ri], `sr:${di}.${kind}.${ri}.label`, 'this sim') }
  if (ds.srflag != null) {
    const [di, kind, ri] = ds.srflag.split('.'); const x = DAYS[+di].sims[kind][+ri]
    x.flag = !x.flag; markEdit(`sr:${di}.${kind}.${ri}.label`); afterSchedMutate(); notify()
    return toast(x.flag ? 'Red box: flagged for the next scheduler' : 'Red box cleared')
  }
  if (ds.gradd != null) {
    const d = DAYS[+ds.gradd]; d.ground = d.ground || []
    d.ground.push({ prog: '', str: '', end: '', who: '' })
    markStructuralAdd(`gr:${+ds.gradd}.${d.ground.length - 1}.prog`); logAction(+ds.gradd, 'Ground item added'); afterSchedMutate(); notify(); return
  }
  if (ds.grdel != null) {
    const [di, ri] = ds.grdel.split('.').map(Number)
    const row = DAYS[di].ground[ri]
    /* An auto-landed / accepted input row carries a `src` back-link. The plain
       splice below would strip the ROW but leave its input still marked
       accepted (inp.acc) with nothing behind it — an orphan the validator reads
       as a live commitment while the picker and the board show nothing of it
       (audit, Aug 26). The owner's round-trip is that removing such a row
       returns the input to Personal Inputs, which is exactly what unacceptInput
       does (splice + renumber + markDeletion + clear acc, day-searched not
       guessed). Route a src row there; a hand-built ground item still takes the
       direct delete. */
    /* …only when this row IS its request's row: a dead `kept` row (the holder's version row, on a day its request cannot
       stand on — D363) is his own to remove, by the plain delete below ([DB-READINESS] phase 6 (c); overlay.ts standsOn) */
    const inp = row && row.src && standsOn(DAYS[di], row.src) === row ? srcInput(row) : null
    if (inp && unacceptInput(di, inp)) {
      afterSchedMutate(); notify()
      /* said to him, not written as a line: the request's own filing line ("… filed: on the programme → taken off the
         programme", the change history's one writer) is this act's one line (D114 — one act, one change; Fable's final
         read, F1) */
      /* an input of several is named by HOW MANY, a placeholder said beside them ("3 people", "2 people and ALL AVAIL")
         — as it was while a shared input was several rows taken off as one; since the one-rule build the one row said
         "Nomad +2", the first to join and "the rest" (found by the re-expressed tests, step 6) */
      const ids = [row.who, ...((row && row.more) || [])].map((v: any) => whoId(v)).filter(Boolean)
      /* the place it stood: an ALL / ALL AVAIL input's row is on the Common Programme (owner D955, D958) */
      return toast(`${onCommon(row) ? 'Common' : 'Ground'} item removed — back under Personal Inputs` + desc(row.prog, timeSpan(row.str, row.end), ids.length > 1 ? howMany(ids) : whoText(row)))
    }
    const issued = deletionWasIssued(di, 'ground', ri, row && row.src)
    const said = 'Ground item removed' + desc(row && row.prog, row && timeSpan(row.str, row.end), row && whoText(row))
    const rid = row && row.rid
    DAYS[di].ground.splice(ri, 1)
    ;[`g:${di}.`, `gr:${di}.`].forEach(h => shiftKeys(h, 0, ri))
    dropRowMarks([rid])
    markDeletion(di, 'ground', issued); logAction(di, said); afterSchedMutate(); notify(); return toast(said)
  }
  /* CX, THE RED BOX AND INFORMATION ONLY. On a scheduler's own row they are the ROW's, written here. ON A ROW THAT CAME
     FROM AN INPUT ALL THREE ARE THE INPUT'S (step 4 of the one-rule build — owner D760): asked of the row's door first,
     which changes the input in one command; the row follows as the copy it is. */
  if (ds.grcx != null) {
    const [di, ri] = ds.grcx.split('.').map(Number); const lead = DAYS[di].ground[ri]
    if (onInputRow(`g:${di}.${ri}`)) return askCx(lead, null, 'this item', undefined, (cancel, reason) => rowMark(`g:${di}.${ri}`, 'cx', cancel, reason) === 'done')
    return askCx(lead, `gr:${di}.${ri}.prog`, 'this item')
  }
  if (ds.grflag != null) {
    const [di, ri] = ds.grflag.split('.').map(Number); const x = DAYS[di].ground[ri]
    if (onInputRow(`g:${di}.${ri}`)) {
      const on = !x.flag
      if (rowMark(`g:${di}.${ri}`, 'flag', on) !== 'done') return
      return toast(on ? 'Red box: flagged for the next scheduler' : 'Red box cleared')
    }
    x.flag = !x.flag; markEdit(`gr:${di}.${ri}.prog`)
    afterSchedMutate(); notify()
    return toast(x.flag ? 'Red box: flagged for the next scheduler' : 'Red box cleared')
  }
  /* ⓘ info-only, ground twin of ds.pinfo above */
  if (ds.grinfo != null) {
    const [di, ri] = ds.grinfo.split('.').map(Number); const x = DAYS[di].ground[ri]
    if (onInputRow(`g:${di}.${ri}`)) {
      const on = !x.info
      if (rowMark(`g:${di}.${ri}`, 'info', on) !== 'done') return
      return toast(on ? 'This item is info only: no longer checked against the rules, and earns nobody any OIL' : UNMARKED.info)
    }
    x.info = !x.info; markEdit(`gr:${di}.${ri}.prog`)
    afterSchedMutate(); notify()
    return toast(x.info ? 'This item is info only: no longer checked against the rules, and earns nobody any OIL' : 'This item is checked against the rules again and can earn OIL')
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
    /* the retitle must reach the funnel's bookkeeping like the week's wl:
       cell does — this handler writes the model itself, so until 12 Aug 26
       (audit) picking a title here was invisible to the edit log AND to the
       amendment marks: History had no line and a published day issued no
       amendment for a renamed wave. The key is the same wl: the week uses;
       the values are the TITLES (what this control shows), captured before
       and after so a re-pick of the same title stays a refused no-op. */
    const wasTitle = labelToTitle(w)
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
    markEdit(`wl:${di}.${gi}`, wasTitle, labelToTitle(w))
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
    const [tail, field] = inf.dataset.ifld!.split('.')
    /* one man's row of an input that holds several names him after the id (engine/keys.ts iuParts) */
    const at = iuParts('iu:' + tail), id = at ? at.iid : tail
    const inp = inpById(id)
    if (!inp) return notify()                    // deleted or undone underneath it
    const back = () => { inf.value = field === 'rmks' ? remarksTyped(inp.remarks, inp) : inpTimeText(inp, field) }
    if (RO) return back()
    /* an input's start / end left after a save reads the time as saved too ([BOARD-TAB-FOLD]; the blind read's F2,
       20 Oct 26) — the panel holding the caret is held back from repainting, so "1015" stayed on screen; not while the
       caret is still in the box (the window lost the focus, the read's F3). THE TIME TYPED, FOLDED — what setInpField saved
       (hhmm of what was typed; an emptied box, all day, reads empty) — never read back off `inp`: one man's row of an input
       that holds several saves into a record of his own, cut out of this one, so `inp` still holds the old shared time
       (the shaky-tests batch's blind read, F1, 20 Oct 26) */
    if (setInpField(inp, field as any, inf.value, at ? at.person : null)) { notify(); if (field !== 'rmks' && inf.isConnected && document.activeElement !== inf) inf.value = fmtHM(String(inf.value).trim()) }
    else back()
    return
  }
  const f = (e.target as HTMLElement).closest('[data-bfld]') as HTMLInputElement | null; if (!f) return
  const p = f.dataset.bfld!
  if (RO) { f.value = boxText(p); return }
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
  /* A REQUEST'S ROW: ITS NAME, ITS TIMES AND ITS REMARK ARE THE REQUEST'S (owner D739, D740 — ui/reqrow.ts), asked
     before the funnel as the week's focus-out asks it. The box is set to what the row now reads either way — a refusal
     is never left on screen looking saved, and a save is shown as the request holds it (10:15 for a typed 1015). */
  const rq = reqRowText(p, f.value)
  if (rq !== 'none') {
    f.value = boxText(p)   // a remark box holds the typed words, its date grey after it (owner D949 Q3 — html.ts reqRmkParts)
    if (rq === 'saved') notify()
    return
  }
  if (txtSet(p, f.value)) {
    /* the write recorded as a text command NAMING its box, as the week's does (textedit.ts commitText), so Undo says what it
       took back — "a brief time", an SC line's B "an in-time" — not "a change to the schedule" (walker C, the batch's
       walk, 19 Oct 26 — [SC-B-CHANGE-SAYS-BRIEF]); the epilogue after it then finds nothing left to record */
    schedWrite(SCHED_TYPES.text, () => { reconcileIssuedMarks(); markEdit() }, { key: p })
    afterSchedMutate()
    notify()
    /* THE BOX LEFT SHOWS THE TIME AS SAVED ([BOARD-TAB-FOLD], 20 Oct 26): a time typed "1000" is saved 10:00, but the box
       left by Tab kept reading "1000" until a press elsewhere — the redraw leaves standing the block the caret moved on
       to, and this box with it. So the box itself is set to the time as the board draws it (fmtHM, the one fold). Only a
       time box: anything else already shows what was typed. Not while the caret is still in the box — the window losing
       the focus saves it too, and rewriting the box under the caret would lose the place being typed (the blind read's F3). */
    if (TIME_TXT.test(p) && f.isConnected && document.activeElement !== f) f.value = fmtHM(txtGet(p))
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
  /* OIL MODE OWNS EVERY TAP ON THE DAY IT IS ON ([OIL-AUTO-REMOVE] §2.1).
     FIRST, before the role pick and before every arm branch: in the mode a tap
     on a puck means "take this man off this event" and a tap on an item's name
     means "stop the whole item earning" — never arm a slot, never plant a
     person, never open a pick-list. The board renders read-only in the mode, so
     nothing below would fire anyway; this is the belt to that braces, and it is
     what makes the two gestures impossible to confuse. */
  const opk = t.closest('[data-oilp]') as HTMLElement | null
  if (opk) {
    const di = +(opk.dataset.oilday || -1), person = opk.dataset.oilp!, item = opk.dataset.oilitem || ''
    if (!oilModeOn(di)) return
    /* UNDER A MASK THIS GESTURE HAS NO MEANING, and letting it through destroyed
       the decision the mask was hiding (Astra + Fable, 21 Sep 26). The item's own
       switch has always refused a tap under the blanket; the person's puck did
       not. Say which mask is on, so the way to change it is obvious. */
    if (oilItemMasked(di, item)) {
      e.stopPropagation()
      /* (owner D838, 14 Oct 26 — N12: a fact, then what to do; the day's sentence says what to turn off and has one source,
         ui/oilmode.ts — D844, D845. The event's own OIL mark below and the ALL AVAIL window say the same words: D843.) */
      return toast(oilBlanketOn(di)
        ? DAY_EARNS_NOTHING
        : 'This event earns nobody any OIL. Turn the event back on first.')
    }
    const on = toggleOilPerson(di, person, item)
    notify(); e.stopPropagation()
    const cs = (PEOPLE[person]||{}).cs||person, nm = oilItemName(di, item)
    return act(di, oilPersonSays(cs, nm, on))
  }
  /* the sentinel's count chip: who is behind this puck, and what each of them
     earns (§7.6 / §2.7). Read-only, so it works outside the mode too — on the
     issued schedule it lists the FROZEN membership, which is the whole reason
     that membership is frozen.

     IT OPENS [ALL-AVAIL-WINDOW], BUILT 23 Sep 26 (D38-D41). This comment has now
     said three different things about the same tap, which is worth knowing: it
     once said the shape was "not yet ruled" (stale within the day the owner
     ruled), then that a toast "stands in for it - a placeholder, not a design".
     Both are gone. The bubble of names IS the window now: movable, resizable,
     non-blocking, real pucks with the app's own warning flags, pilots left and
     WSOs right - and the SAME window serves both counters, who is available
     behind a placeholder and who is credited OIL, where individual pucks are
     switched off. Design of record: docs/mock/allavail-window.html, approved
     D41. Contract: docs/ui-contracts.md, which states that the outside-click
     rule does NOT apply to this surface. */
  const osn = t.closest('[data-oilsent]') as HTMLElement | null
  /* THE VERSION THE CHIP WAS DRAWN IN ([OIL-SEATS-CAN-EARN] step 9, Codex
     OSE-R2-05). The snapshot is installed only while the page is being built,
     so by the time this tap happens the live day is back in place — reading it
     here would list whoever is free NOW under a number that was frozen when the
     day went out. Empty means the chip came from the working copy. */
  if (osn) {
    e.stopPropagation()
    /* [ALL-AVAIL-WINDOW] (D38) — this used to be a one-line toast of names, and
       the comment above said so: "until then the toast stands in for it — a
       placeholder, not a design". This is the window it stood in for, opened
       through the ONE opener the week shares (AvailWindow.tsx). */
    openAvailWinFrom(osn)
    notify()
    return
  }
  const oit = t.closest('[data-oilitem]') as HTMLElement | null
  if (oit) {
    const di = +(oit.dataset.oilday || -1), item = oit.dataset.oilitem || ''
    if (!oilModeOn(di)) return
    if (oilBlanketOn(di)) { e.stopPropagation(); return toast(DAY_EARNS_NOTHING) }
    const on = toggleOilItem(di, item)
    notify(); e.stopPropagation()
    const nm = oilItemName(di, item)
    return act(di, on ? `${nm} earns OIL again` : `${nm} earns nobody any OIL`)
  }
  /* the duty ROLE cell offers its pick-list (owner, 10 Aug 26). Before the
     arm branches, because a ROLE cell is not a seat and must not be treated
     as one — and BEFORE nothing else, so the box still takes typing exactly
     as it did: the popup is an offer beside the caret, not a replacement for
     it, and clicking straight past it goes on editing the text. */
  const rp = t.closest('[data-rolepick]') as HTMLElement | null
  if (rp) { rolePickMenu(rp, rp.dataset.rolepick!); return }
  /* a PLACEHOLDER's puck arms its slot like an empty one (owner, 13 Aug 26 —
     "someone still needed here" goes straight to finding that someone); only
     a real person's puck falls through to selection */
  const bpk = t.closest('.puck[data-person]') as HTMLElement | null
  if (bpk && !isSpecial(bpk.dataset.person)) return
  const empty = t.closest('.sb-slot.empty[data-slot]') as HTMLElement | null
  if (empty) { view.armSlot(empty.dataset.slot, empty); notify(); e.stopPropagation(); return }
  const seat = t.closest('.seat[data-slot]') as HTMLElement | null
  /* same armed-element escape as routeClick: a seat armed while empty, then
     filled by drag, must still answer the put-me-down tap */
  if (seat && (view.armedKey() === seat.dataset.slot || !slotVal(seat.dataset.slot!) || isSpecial(slotVal(seat.dataset.slot!)))) { view.armSlot(seat.dataset.slot, seat); notify(); e.stopPropagation(); return }
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

/* Slot a freshly-appended wave into the admin's house wave order (owner, 29 Aug 26
   pt.2 — "new schedules only"). The wave has just been pushed to the END of
   d.waves; if a house order is set and the day is NOT signed off, slide it up into
   its kind's slot with the same tested moveWave the Arrange sheet uses, and return
   its final index (for markStructuralAdd). A signed-off day is left untouched — the
   owner's rule that the default never amends an existing schedule — and an unset
   house order returns the end index, so nothing moves. `newKind` is 'fly' for an
   ordinary wave, else the standalone kind. */
function placeAddedWave(di: number, newKind: string): number {
  const d = DAYS[di]; const end = d.waves.length - 1
  if (dayApproved(di)) return end
  const slot = waveInsertSlot(d.waves.slice(0, end), newKind)
  if (slot < end) moveWave(di, end, slot)
  return slot < end ? slot : end
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
    /* the wave's first line comes up BLANK, same reason as + Line above
       (owner, 25 Aug 26 — "keep the data clean … nothing filled"): a seeded
       NEW / 12:00 / 13:00 reads as a line somebody filled in when nobody did,
       and the suggested-brief time then paints a green in-time off it. */
    d.waves.push({ label: 'WAVE ' + (d.waves.filter((w: any) => !isStandalone(w)).length + 1), night: false, intimes: [], traffic: [], formations: [{ cs: '', msn: '', to: '', ld: '', aircraft: [{ p: '', w: '', area: '', rmks: '', opts: {} }] }] })
    const fi = placeAddedWave(di, 'fly')
    markStructuralAdd(`wl:${di}.${fi}`); logAction(di, 'Wave added'); afterSchedMutate(); notify(); return toast('Wave added')
  }
  const w = makeStandalone(kind); if (!w) return
  d.waves.push(w)
  const S = SAWAVE[kind]
  /* NO WAVE AUTO-CREATES A DESK ANY MORE (owner, 13 Aug 26 — duties are
     decoupled from waves; "I do not need a wave to trigger the selection").
     AVALON used to bring its desk up with the wave; now every desk, AVALON's
     included, is added from the "+ Block" template picker like any other.
     Adding a wave creates only the wave. */
  const fi = placeAddedWave(di, kind)
  /* a line of the change history, as + Wave writes for a flying wave ([BLOCK-NO-HISTORY-LINE], found beside it) */
  markStructuralAdd(`wl:${di}.${fi}`); logAction(di, `${S.label} added`); afterSchedMutate(); notify()
  toast(S.label + ' added: standalone, ' + (S.all ? 'every seat checked for availability, SC currency, front seat and overlapping places only' : 'SPARE is checked for availability, SC currency, front seat and overlapping SC seats or the SC desk only'))
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
  /* IT FOLLOWS ITS BOX, ABOVE A PHONE'S KEYBOARD ([KEYBOARD-SCROLL], his iPhone recording, 19 Oct 26 — the duty role's
     pick-list stayed where it opened, under the keys, while the board scrolled the role box up above them): placed by
     the box on every scroll and, frame by frame, while the keys move (vvfollow.ts); below the box where it fits above
     the visible screen's foot, else above the box. Pinch-zoomed, the layout's own edges, as before. Its listeners go
     with it the first time it is found gone. */
  const place = () => {
    if (!box.isConnected || !anchor.isConnected) { stop(); document.removeEventListener('scroll', place, true); return }
    const r = anchor.getBoundingClientRect(), vv = window.visualViewport
    const zoomed = !vv || vv.scale > 1.01
    const visTop = zoomed ? 0 : vv!.offsetTop, visBot = zoomed ? window.innerHeight : vv!.offsetTop + vv!.height
    const h = box.offsetHeight
    let top = r.bottom + 6
    if (top + h > visBot - 8 && r.top - 6 - h >= visTop + 8) top = r.top - 6 - h
    box.style.left = Math.max(8, Math.min(window.innerWidth - box.offsetWidth - 8, Math.round(r.left))) + 'px'
    box.style.top = Math.round(Math.max(visTop + 8, Math.min(visBot - h - 8, top))) + 'px'
  }
  const stop = followVisible(place)
  document.addEventListener('scroll', place, true)
  box.addEventListener('click', (e: any) => onPick(e, () => box.remove()))
  /* deferred by a tick, or the very click that OPENED this box closes it */
  setTimeout(() => document.addEventListener('click', function off() { box.remove(); document.removeEventListener('click', off) }, { once: true }), 0)
  return box
}
/* + BLOCK's picker (owner, 13 Aug 26): the saved duty TEMPLATES, straight up \u2014
   no wave has to exist first, and none is consulted. Picking one copies its
   rows onto the day through blockFromTpl (a plain block unless the template
   names its wave — then an SC or AVALON desk, dutytpl.ts). "Empty block" keeps the bare one-row block, and the
   pencil opens the template editor. The old wave-driven desk is retired with
   the wave->duty coupling \u2014 see addWave and the wave-delete path. */
export function blockMenu(anchor: HTMLElement, di: any) {
  if (!canEditSched() || !HOOKS.editMode()) return
  const d = DAYS[di]; if (!d) return
  /* the template editor is a pencil at the top-right of the header, matching
     the stores Config popup (owner, 26 Aug 26 \u2014 "how the config places the edit
     icon on the top right \u2026 do the same for \u2026 duties, not how it is at the
     bottom currently"). Same data-blkedit hook, only relocated. */
  const html = `<h5 class="wm-hpen">Add a duty block<button class="wm-pen" data-blkedit="1" title="Edit the duty templates">${penSvg(true)}</button></h5><div class="wm-row" style="flex-direction:column;align-items:stretch">`
    + DUTYTPL_CFG.map((t: any) => `<button class="wm" data-blktpl="${esc(t.id)}">${esc(t.title || 'Untitled')}<span class="wm-sub">${t.rows.length} role${t.rows.length === 1 ? '' : 's'}${t.wave ? ` · ${String(t.wave).toUpperCase()} desk` : ''}</span></button>`).join('')
    + `<button class="wm" data-blktpl="">Empty block</button></div>`
  popMenu(anchor, html, (e, close) => {
    if (e.target.closest('[data-blkedit]')) { close(); noteOpener(anchor); setTplEdit(true); notify(); e.stopPropagation(); return }
    const b = e.target.closest('[data-blktpl]'); if (!b) return
    const id = b.dataset.blktpl
    const blk = id === '' ? { label: 'DUTY', rows: [{ role: '', id: '', str: '', end: '' }] } : blockFromTpl(id)
    if (!blk) { close(); return }
    d.dutywaves = d.dutywaves || []
    d.dutywaves.push(blk)
    /* a line of the change history, as + Wave and + Line write ([BLOCK-NO-HISTORY-LINE], the group-A walk, 30 Sep 26) */
    markStructuralAdd(`dl:${di}.${d.dutywaves.length - 1}`); logAction(di, `Duty block added · ${blk.label || 'DUTY'}`); afterSchedMutate(); notify()
    close(); e.stopPropagation()
  })
}
/* THE DAY-TEMPLATES PICKER (owner, 15 Aug 26) — the same popMenu idiom as
   blockMenu above, one level up: a whole DAY's structure instead of one duty
   block. Lists the saved templates (tap = apply), "Save this day as a
   template" (mints one off the day the picker was opened from), then a
   pencil into the manage modal. One function serves BOTH entry points — the
   board's own "Templates" control (below) and the edit week's day-sign strip
   (routeClick in interactions.ts) — so there is exactly one picker to keep
   in step with the engine, not two drifting copies of the same list. */
export function dayTplMenu(anchor: HTMLElement, di: any) {
  if (!canEditSched() || !HOOKS.editMode()) return
  di = +di
  const d = DAYS[di]; if (!d) return
  /* a PUBLISHED day: every template is drawn but disabled, with the reason on screen (D96 — the house rule for a
     refusal: say why, at the door); saving this day AS a template stays open */
  const pub = dayApproved(di), why = DAYTPL_PUBLISHED_MSG(d.dow)
  const html = `<h5>Day templates — ${esc(d.dow)}</h5>`
    + (pub && DAYTPL_CFG.length ? `<div class="wm-note wm-refuse">${esc(why)}</div>` : '')
    + `<div class="wm-row" style="flex-direction:column;align-items:stretch">`
    + (DAYTPL_CFG.length
      ? DAYTPL_CFG.map((t: any) => `<button class="wm" data-daytplpick="${esc(t.id)}"${pub ? ` disabled aria-disabled="true" title="${esc(why)}"` : ''}>${esc(t.title || 'Untitled')}<span class="wm-sub">${esc(dayTplSummary(t))}</span></button>`).join('')
      : `<div class="wm-note">No saved templates yet — save this day to start the library.</div>`)
    + `</div><div class="wm-row" style="flex-direction:column;align-items:stretch">`
    + `<button class="wm" data-daytplsave="1">+ Save this day as a template</button></div>`
    + `<div class="wm-note"><button class="wm-edit" data-daytpledit="1">${penSvg()}Manage templates</button></div>`
  popMenu(anchor, html, (e, close) => {
    if (e.target.closest('[data-daytpledit]')) { close(); noteOpener(anchor); setDayTplEdit(true); notify(); e.stopPropagation(); return }
    if (e.target.closest('[data-daytplsave]')) {
      close()
      const t = addDayTpl(di)
      if (!t) { toast('Template library is full — delete one before saving another'); e.stopPropagation(); return }
      dayTplSave()
      /* opens the manage modal PRE-SELECTED on what was just captured, so the
         owner can rename it off the default "Template N" straight away
         instead of having to find it among however many already exist */
      noteOpener(anchor); setDayTplEdit(t.id); notify()
      toast(`Saved as "${t.title}"`)
      e.stopPropagation(); return
    }
    const b = e.target.closest('[data-daytplpick]'); if (!b) return
    const id = b.dataset.daytplpick
    const t = DAYTPL_CFG.find((x: any) => x.id === id)
    /* A PUBLISHED DAY REFUSES a template (D96, 25 Sep 26) — pickDayTpl says so before anything arms; its rows are
       drawn disabled above, so this is the belt for a stale menu. A draft day applies it (P2-IMPL-11 disarms the day's
       crew slot first, in pickDayTpl). */
    const r = pickDayTpl(di, id)
    if (r === 'refused') { close(); toast(DAYTPL_PUBLISHED_MSG(d.dow)); e.stopPropagation(); return }
    if (r === 'armed') {
      close()
      toast(`Applying "${t ? t.title : 'template'}" replaces your unpublished edits on ${d.dow} — open Templates and pick it again to confirm`)
      e.stopPropagation(); return
    }
    close()
    if (r === 'applied') {
      /* one undo step for the whole swap (afterSchedMutate's own markEdit() call
         carries no key, so nothing is marked pending by it — applyDayTpl already
         did the real work). No markStructuralAdd / flashAdded: that mechanism is
         keyed to ONE funnel address, and a whole-day replace has no single
         address to hang a blue box on. A named toast carries the news instead. */
      notify()
      toast(`Applied "${t ? t.title : 'template'}" to ${d.dow}`)   // only ever a draft day since D96
      logAction(di, `Day template "${t ? t.title : 'template'}" applied`)
    }
    e.stopPropagation()
  })
}
/* MAKE ANOTHER DRAFT THE LIVE DAY — the one write path both the drafts menu
   (below) and DraftsModal.tsx share, so switching behaves identically from
   either door. draftSelect stows the outgoing live day into its own entry
   first, so nothing is lost by switching away and back; the engine refuses
   the already-selected id (toasted as already-live rather than silence).
   A PUBLISHED day switches too (owner, 15 Aug 26 — the old "Reopen the day
   first" refusal is gone): the issued snapshots are frozen, so nothing the
   squadron holds moves; draftSelect's rebase re-marks the day's pending set
   as the true diff against the issued document, and the toast says what that
   came to — the sentence a scheduler needs to know whether an AL is now due.
   The caller's afterSchedMutate() is the single undo step — the
   restore/applyDayTpl contract draftSelect documents. Any frozen preview on
   this day is dropped: the scheduler just chose a live document, and a
   banner claiming to show a stowed copy of it would lie. */
export function switchDraft(di: any, id: any) {
  if (!canEditSched() || !HOOKS.editMode()) return false
  di = +di
  const d = DAYS[di]; if (!d) return false
  const t = dayDrafts(di).find((x: any) => x.id === id)
  if (!t) return false
  if (id === curDraftId(di)) { toast(`"${t.name}" is already the live ${d.dow}`); return false }
  const pub = dayApproved(di), cv = pub ? dayCurVer(di) : null
  if (view.ARM && view.ARM.di === di) view.disarmSlot()   // the swap may remove the armed row
  /* what the switch PUTS BACK that still needs an OIL answer is read before it and told after it — the load's own
     reading (owner D865, 15 Oct 26 — "as recommend": the load's short note and list; ui/oilputback.ts). On a published
     day a plan without an input's row unfiles it and nothing lands it again, so the plan with the row brings it back. */
  const oilAfter = oilPutBackWatch(di)
  if (!draftSelect(di, id)) return false
  view.setDayPreview(di, null)
  afterSchedMutate(); notify()
  /* a whole-day swap passes no key through the funnel — the sentence is the
     record, exactly as it is for a rollback or an applied template */
  /* THE NOTE IS SHORT PLAIN SENTENCES, as the load's (owner D865 — "the same way" as D863): what the day is now; a row
     the plan held for a request now on another day stayed out — named (D175), before the count it explains; on a
     published day what is pending against the version that went out; and how many inputs need an OIL answer. (The long
     form it replaced: "Switched to "<plan>" — this is now the live <day> · <who> · <what> left out — … · N differences
     from AL1 pending".) */
  const the = (v: any) => { const l = verLabel(v); return l === 'Original' ? 'the Original' : l }
  let said = `${d.dow} is now "${t.name}".` + rowsLeftSentences(ROWSLEFT)
  if (pub && cv != null) {
    /* the day head's own count (AM23): a plan that differs only in what the day earns, or
       in a filing, is still a difference ([HUMAN-RETEST] walk S3 / Astra rank 5, 24 Sep 26) */
    const n = dayShownPendCount(di)
    said += n ? ` ${n} difference${n > 1 ? 's' : ''} from ${the(cv)} ${n > 1 ? 'are' : 'is'} pending.`
      : ` Nothing is pending: it matches ${the(cv)}.`
  }
  const need = oilAfter()   // opens the one list where an input it put back needs an answer
  said += oilNeedSaid(need)
  /* PER-PLAN SIGN-OFFS (owner, 15 Sep 26 — item 1a): each plan owns its four
     sign-offs (draftSelect stows the outgoing plan's and loads the incoming plan's),
     so a switch no longer "resets" anything — an unsigned plan simply shows its own
     empty sign-off bar, a signed one comes back green. The old "· signatures reset"
     note is gone with the day-level signature it described. */
  logAction(di, said)
  toast(said)
  /* the list was opened after the redraw above, and the plans menu's own caller draws nothing more — draw it now */
  if (need) notify()
  return true
}
/* THE PLANS MENU (owner, 15 Sep 26 — the redesign, replacing the old drafts
   menu). ONE menu, opened by the ONE selector (planSelectorHTML) on BOTH the
   week day head and the board sign strip (A5), reached through routeClick's
   data-planmenu. It reads top-to-bottom exactly as the mockup does:
     · EDITABLE COPIES first — the live working copy / each named plan. Tapping
       one SWITCHES to it instantly (switchDraft — stow-then-load, one undo
       step); the live one is marked ● and, while you are previewing, tapping it
       is "back to live". Each plan carries a ✎ into the rename/delete modal.
     · ISSUED · READ-ONLY next — one row per issued version (ORIG / ALn). Tapping
       one PREVIEWS it read-only (setDayPreview) — the edit surfaces never switch
       to a frozen document, they only look. The row you are previewing is ●.
     · + ALT PLAN last — draftDup, the "+ Alt Plan" entry the mockup names.
   A quarantined (unsupported / wrong-week) book is read-only: "+ Alt Plan" is
   withheld and the plan/preview rows are inert (C2), so a frozen day can't be
   mutated or navigated into an edit. */
export function planMenu(anchor: HTMLElement, di: any) {
  if (!canEditSched() || !HOOKS.editMode()) return
  di = +di
  const d = DAYS[di]; if (!d) return
  const ro = protectedWeek()
  const list = dayDrafts(di), selId = curDraftId(di)
  const previewing = view.DPREV.has(di), pvVer = previewing ? String(view.DPREV.get(di)) : ''
  /* on a PUBLISHED day the live row's sublabel changes register (owner, 15 Aug
     26): it is no longer "what publishes" — the day already went out — it is
     what the next AL's differences are measured against. */
  const pub = dayApproved(di), cv = pub ? dayCurVer(di) : null
  const liveSub = (pub && cv != null)
    ? `live now — differences from ${esc(verLabel(cv))} go out as AL${nextSeq(di)}`
    : 'live now — this is what publishes'
  /* one editable-copy row: the LIVE one carries data-plangolive (tap = stay /
     return to live, clearing any preview); the others carry data-plansel (tap =
     switch). Under quarantine every row is inert. */
  const editRow = (id: string, name: string, isLive: boolean) => {
    const mark = isLive && !previewing ? ' ●' : ''
    const act = ro ? '' : isLive ? ` data-plangolive="${di}"` : ` data-plansel="${esc(id)}"`
    const sub = isLive ? (previewing ? 'tap to return to your live working copy' : liveSub) : 'tap to make it the live day'
    return `<div style="display:flex;gap:4px;align-items:stretch">`
      + `<button class="wm${isLive && !previewing ? ' sa' : ''}" style="flex:1"${act}>${esc(name)}${mark}<span class="wm-sub">${sub}</span></button>`
      + (id && !ro ? `<button class="wm-edit" data-planedit="${esc(id)}" title="Rename or delete ${esc(name)}">${penSvg(true)}</button>` : '')
      + `</div>`
  }
  const copies = list.length
    ? list.map((t: any) => editRow(t.id, t.name, t.id === selId)).join('')
    : editRow('', 'Live working copy', true)   // no plans yet — the day IS its live working copy
  /* the issued documents, if any — preview-only (A4: the edit side never
     switches to a frozen version, only looks) */
  const issued = pub ? dayVersions(di).filter((v: any) => v !== 'live') : []
  const issuedRows = issued.length
    ? `<div class="wm-hdr">Issued · read-only</div><div class="wm-row" style="flex-direction:column;align-items:stretch">`
      + issued.map((v: any) => `<button class="wm${pvVer === String(v) ? ' sa' : ''}"${ro ? '' : ` data-planpv="${esc(String(v))}"`}>${esc(verLabel(v))}${pvVer === String(v) ? ' ●' : ''}<span class="wm-sub">read-only — look, don't change</span></button>`).join('')
      + `</div>`
    : ''
  const html = `<h5>Plans — ${esc(d.dow)}</h5>`
    + (pub ? `<div class="wm-note">This day is published — the issued versions don't change. Switching plans marks the differences as the next AL.</div>` : '')
    + `<div class="wm-row" style="flex-direction:column;align-items:stretch">${copies}</div>`
    + issuedRows
    + (ro ? '' : `<div class="wm-row" style="flex-direction:column;align-items:stretch"><button class="wm" data-plandup="1">+ Alt Plan</button></div>`)
    + (list.length && !ro ? `<div class="wm-note"><button class="wm-edit" data-planmanage="1">${penSvg()}Manage plans</button></div>` : '')
  popMenu(anchor, html, (e, close) => {
    const pencil = e.target.closest('[data-planedit]')
    if (pencil) { close(); noteOpener(anchor); setDraftsEdit({ di, id: pencil.dataset.planedit }); notify(); e.stopPropagation(); return }
    if (e.target.closest('[data-planmanage]')) { close(); noteOpener(anchor); setDraftsEdit({ di }); notify(); e.stopPropagation(); return }
    if (e.target.closest('[data-plangolive]')) { close(); view.setDayPreview(di, null); notify(); e.stopPropagation(); return }
    if (e.target.closest('[data-plandup]')) {
      close()
      const t = draftDup(di)
      if (t) {
        /* the new plan is now the live day, so drop any frozen preview this menu
           was opened from — otherwise the day keeps showing the old read-only
           version while the toast says the new plan is live and editable (Codex
           PS-004). setDayPreview(di,null) also clears any armed restore confirm. */
        view.setDayPreview(di, null)
        /* one undo step for the whole duplicate — histSnap carries the blobs; its line logged FIRST, so it is kept
           inside that step's saved group (the group walk's H2 — see `act`) */
        logAction(di, `Plan "${t.name}" created — a copy of the day as it stood`)
        afterSchedMutate(); notify()
        const said = `${d.dow} — "${t.name}" is now the live day, edit over it`
        toast(said)
      }
      e.stopPropagation(); return
    }
    const pv = e.target.closest('[data-planpv]')
    if (pv) { close(); view.setDayPreview(di, pv.dataset.planpv); notify(); e.stopPropagation(); return }
    const b = e.target.closest('[data-plansel]'); if (!b) return
    close()
    switchDraft(di, b.dataset.plansel)
    e.stopPropagation()
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
  /* ONE gear at the top-right of the popup's first header opens the Flying-waves
     sheet (owner, 30 Aug 26 — "ugly to have the settings and edit buttons separate
     … combine them through 1 button"). That one sheet now both EDITS the templates
     and shows / hides / deletes what appears here, so the old separate ✎ editor and
     ⚙ Manage buttons collapse into this single data-wvedit opener. It rides the Day
     header when the board's generic add shows one, else the Add header. */
  const pen = `<button class="wm-pen wm-mng" data-wvedit="1" title="Manage flying waves">⚙</button>`
  const dayBtns = (di == null)
    ? `<h5 class="wm-hpen">Day${pen}</h5><div class="wm-row" id="wmDays">`
      + DAYS.map((x: any, i: number) => `<button class="wm ${i === 0 ? 'on' : ''}" data-wmday="${i}" style="padding:6px 9px;font-size:11.5px">${esc(x.dow.slice(0, 3))}</button>`).join('')
      + `</div>` : ''
  /* the built-in kinds are the four rule-sets, minus any an admin has hidden
     (WAVEHIDE); 'fly' carries the empty data-wmkind the plain add already uses.
     Saved TEMPLATES (owner, 25 Aug 26) follow in their own group, and the gear
     opens the Flying-waves sheet \u2014 the same shape blockMenu gives + Block. */
  const builtins = shownBuiltins()
  const tpls = shownTemplates()
  const anyStandby = builtins.some(b => b.key !== 'fly')
  const kindRow = builtins.map(b => b.key === 'fly'
    ? `<button class="wm" data-wmkind="">Flying wave</button>`
    : `<button class="wm sa" data-wmkind="${b.key}">${esc(b.label)}</button>`).join('')
  const tplRow = tpls.length
    ? `<h5>Templates</h5><div class="wm-row" style="flex-direction:column;align-items:stretch">`
      + tpls.map((t: any) => `<button class="wm" data-wmtpl="${esc(t.id)}">${esc(t.title || 'Untitled')}<span class="wm-sub">${esc(kindLabel(t.kind))}${t.lines.length ? ` \u00b7 ${t.lines.length} line${t.lines.length === 1 ? '' : 's'}` : ''}</span></button>`).join('')
      + `</div>` : ''
  /* a hidden wave never silently vanishes: this line says how many are tucked away
     and opens the Flying-waves sheet to bring them back, right where their absence
     is noticed. */
  const hiddenN = (WAVE_BUILTIN.length + WAVETPL_CFG.length) - (builtins.length + tpls.length)
  const hiddenLine = hiddenN > 0
    ? `<div class="wm-hidden"><b>${hiddenN} hidden</b> \u00b7 <button class="wm-mnglink" data-wvedit="1">Manage</button></div>` : ''
  const html = dayBtns
    + `<h5${di == null ? '' : ' class="wm-hpen"'}>Add${di == null ? '' : pen}</h5><div class="wm-row">` + kindRow + `</div>`
    + tplRow
    + (anyStandby ? `<div class="wm-note">SC \u00b7 AVALON \u00b7 BB sit outside the day's flying count until they fly \u2014 two waves of four plus an SC standing by reads <b>4 X 4 / 2</b>.</div>` : '')
    + hiddenLine
  let day = (di == null) ? 0 : di
  const box = popMenu(anchor, html, (e: any, close: () => void) => {
    if (e.target.closest('[data-wvedit]')) { close(); noteOpener(anchor); setWaveEdit(true); notify(); e.stopPropagation(); return }
    const dbtn = e.target.closest('[data-wmday]')
    if (dbtn) {
      day = +dbtn.dataset.wmday
      box.querySelectorAll('[data-wmday]').forEach(x => x.classList.toggle('on', x === dbtn))
      box.querySelectorAll('[data-wmday]').forEach((x: any) => x.style.borderColor = x === dbtn ? 'var(--accent)' : 'var(--edge)')
      e.stopPropagation(); return
    }
    const tbtn = e.target.closest('[data-wmtpl]')
    if (tbtn) { addWaveFromTpl(day, tbtn.dataset.wmtpl); close(); e.stopPropagation(); return }
    const kbtn = e.target.closest('[data-wmkind]')
    if (kbtn) { addWave(day, kbtn.dataset.wmkind || null); close(); e.stopPropagation() }
  })
}

/* place a saved template onto the day \u2014 the "+ Wave" template pick. waveFromTpl
   mints a wave whose own kind flags (standalone/noconf/night) decide its checking,
   so this is exactly addWave's structural epilogue over that minted wave: one
   markStructuralAdd on the new wl: key, revalidate, a named toast. The label the
   wave carries is the template's own (a standby keeps its kind label), and it is
   an ordinary editable wave from here \u2014 the library no longer owns it. */
export function addWaveFromTpl(di: any, id: string) {
  if (!canEditSched() || (view.SBDAY != null && !HOOKS.editMode())) return
  di = +di
  const d = DAYS[di]; if (!d) return
  const w = waveFromTpl(id); if (!w) return
  d.waves = d.waves || []
  d.waves.push(w)
  /* a template wave follows the house order too — by the kind it mints as (a
     standby template mints a standalone, so waveKindOf reads its kind; a fly
     template is ordinary → 'fly') */
  const fi = placeAddedWave(di, waveKindOf(w))
  const said = `"${w.label || 'Wave'}" added`
  logAction(di, said); markStructuralAdd(`wl:${di}.${fi}`); afterSchedMutate(); notify()
  return toast(said)
}

/* the board layout choice survives closing and reopening it within a session */
export let SBWIDE = false
/* THE DESKTOP LAYOUT'S ZOOM ON A PHONE (owner D1109, 21 Oct 26 — [BOARD-PHONE-PINCH-ZOOM]): what a pinch has set the day
   to (1 = the size it opens at), kept across days and dropped whenever the board closes (✓ Done, a page change — SchedBoard.tsx), by a change of layout and by
   a sign-in or sign-out. Module state like SBWIDE; the pinch itself is ui/pinchzoom.ts, wired in SchedBoard.tsx. */
export let SBZOOM = 1
export function setBoardZoom(z: number) { SBZOOM = z }
export function toggleWide() {
  SBWIDE = !SBWIDE
  SBZOOM = 1
  toast(SBWIDE ? 'Desktop layout: pan sideways to read the whole day' : 'Phone layout')
}
/* …but not into the next person's: a sign-in or sign-out puts the standard layout back
   ([ACCOUNTS] — what the next person inherits; Astra's code read, 26 Sep 26) */
view.VIEW_RESET.push({ name: 'SBWIDE', scopes: ['session'], reset: () => { SBWIDE = false; SBZOOM = 1 } })

/* the phone board's Live checks fold (owner, 8 Aug 26): module state like
   SBWIDE, collapsed afresh on every openScheduler — a board visit starts
   with the day, not the list; the flag survives day-tab switches. Desktop
   ignores it (the fold is CSS under 820px only, and the toggle branch in
   interactions.ts is isPhone()-gated). */
export let SBWOPEN = false
export function toggleSbwarn() { SBWOPEN = !SBWOPEN }

/* day tab switch — setBoardDay carries the reference's cross-day disarm */
/* Day navigation changes no schedule data. Validation is already run by every
   mutation path; doing a full-week validate here made a rapid swipe pay the
   engine cost again before repainting the target day. */
/* Commit before the repaint. The board's own <input data-bfld> grammar
   commits on `change` — i.e. on blur — and the panel repaint a day change
   triggers tears a focused input out of the DOM. Chromium happens to fire
   `change` during that teardown; WebKit historically does not, and iOS is
   the primary phone target — so a value typed and then scrubbed away could
   land on no day at all (audit, 12 Aug 26). Blurring HERE, while the input
   is still attached and the old day is still current, turns that into an
   ordinary commit to the day being left. textedit.ts's editingText() never
   knew this grammar, so the repaint guard can't help — and widening it
   would freeze the panels on the old day instead.
   The stores popup and a pinned History bubble are body-level and survive a
   panel swap on their own, so a day change must take them down itself or
   they keep describing the day that was left (same audit). The popup's
   document click listener unhooks through its own _offClick, same as
   setPage's sweep. */
export function boardTab(n: number) {
  if (typeof document !== 'undefined') {
    const ae = document.activeElement as any
    if (ae && ae.dataset && (ae.dataset.bfld != null || ae.dataset.ifld != null)) {
      const iv = ae.value
      ae.blur()
      /* a browser's blur fires `change` itself when the value moved — but
         only some engines do (jsdom none, WebKit historically not on a
         programmatic teardown), so if the model still disagrees with the
         field after the blur, say `change` by hand. The compare keeps the
         real-browser path from committing twice and a merely-focused,
         untouched field from writing at all. */
      let want = iv
      if (ae.dataset.bfld != null) want = boxText(ae.dataset.bfld)
      else {
        const [tail, field] = ae.dataset.ifld.split('.')
        const inp = inpById((iuParts('iu:' + tail) || { iid: tail }).iid)
        if (inp) want = field === 'rmks' ? remarksTyped(inp.remarks, inp) : inpTimeText(inp, field)   // the box's typed words (D948)
      }
      /* a TIME box SHOWS fmtHM(model) — a legacy compact '0900' reads '09:00' —
         so compare the field to what the model would DISPLAY, not to its raw
         stored form. Without the fold, stepping the day with an untouched legacy
         box focused makes iv ('09:00') differ from want ('0900') and synthesises
         a no-op `change`: it rewrites the model and logs a phantom History row
         nobody typed (owner adversarial pass, 30 Aug 26). An untouched box then
         reads iv === fmtHM(want) exactly, so it stays silent, while a real typed
         value (raw iv) still differs and still commits on the way out. The
         data-ifld branch needs none of this — inpTimeText already returns colon
         off stored minutes, so its want matches the field. */
      const shows = (ae.dataset.bfld != null && TIME_TXT.test(ae.dataset.bfld)) ? fmtHM(want) : want
      if (iv !== shows) ae.dispatchEvent(new Event('change', { bubbles: true }))
    }
    document.querySelectorAll('.stmenu').forEach(x => {
      const off = (x as any)._offClick
      if (off) document.removeEventListener('click', off)
      x.remove()
    })
    hideHistBub()
  }
  view.setBoardDay(n); notifyBoard()
}

/* ---------------------------------------------------------------------------
   THE DAY IS REACHED BY ARROWS, AND THE SWIPE IS GONE (owner, 12 Aug 26 —
   "remove the swipe for the mobile scheduler board too. Just put arrows at the
   edges of the bar at the top to navigate left and right between days.")

   Recorded here rather than left to `git log`, because the swipe was itself an
   owner ask (11 Aug 26) and this file is where the next agent will look for it:
   DO NOT REBUILD IT. It went through three shapes in two days — a
   jump-on-threshold, then a carousel with a live-tracking board and a preview
   pane, then that carousel tuned for hit-testing, interruptible settles and a
   distance-scaled animation — and every round bought back some of what the
   previous one cost. The arrows do the whole job in two buttons that cannot be
   ambiguous about what they are for.
   What the swipe took with it, all of it now deleted: `wireBoardSwipe`, the
   `.sb-pane`/`.sb-peek` preview, `touch-action:pan-y pinch-zoom` on `.sb-main`
   (the seam it needed, so the scroller is back to the browser's default), and
   the axis-sharing `wireParkedRosScroll` grew to split a finger with it.
   PHONE: THE DOTS ARE REMOVED (owner, 23 Aug 26) — the row between the arrows
   carries search + highlight now (#searchB / #sbHl, SchedBoard.tsx), and the
   arrows plus the bar's day title carry "which day". Desktop keeps its Mon–Sun
   chips, still a scrub bar — the removal is display:none in scheduler.css, so
   dayTabsHTML, wireDayDots and every jsdom test here are untouched.
   `prevDay`/`nextDay` below are what the arrows call.
   --------------------------------------------------------------------------- */
/* CONTINUOUS ACROSS WEEKS (owner, 22 Aug 26 — "in scheduler board it's
   continuous arrow between weeks"). Stepping off the loaded week's ends no
   longer stops: past Monday loads the PREVIOUS week and opens its Sunday, past
   Sunday loads the NEXT week and opens its Monday. This supersedes the earlier
   "arrows disabled at the week's ends" shape (the board swipe stays gone; only
   the arrows changed). loadWeek closes the board as it swaps the week, so the
   boardTab that reopens the day MUST run after it — the two synchronous notifies
   batch into one repaint, so the board never visibly blinks shut. */
export function boardDayStep(n: number) {
  const di = view.SBDAY
  if (di == null) return
  const to = di + n
  if (to < 0) { loadWeek(shiftWeek(CURWEEK, -1)); boardTab(6); return }
  if (to >= DAYS.length) { loadWeek(shiftWeek(CURWEEK, 1)); boardTab(0); return }
  boardTab(to)
}
/* WHOLE-WEEK JUMP for the desktop board's day-chip-flanking arrows (dayTabsHTML
   `.sbweek`). The phone board steps DAYS with its edge arrows (boardDayStep);
   the desktop board already lists all seven days as chips, so what it lacked
   was a way to change the WEEK (owner, 23 Aug 26 — only the calendar could).
   This keeps the open weekday so the same column stays selected on the loaded
   week, and the batched notify from loadWeek+boardTab repaints once. */
export function boardWeekStep(dir: number) {
  const di = view.SBDAY
  if (di == null) return
  /* THE MODE BELONGS TO ONE DAY OF ONE WEEK (Fable, 21 Sep 26). Stepping the
     board left OIL mode switched on at the SAME index of the NEW week: if that
     day cannot earn, neither way out is drawn — the desktop button and the day
     bar's own button are both gated on the day earning — while the board stays
     read-only. Every field greyed, no Done, nothing to do but close the board.
     Leaving the mode on a week step is what the scheduler means anyway; he
     stepped away from the day he was deciding about. boardTab clears it only
     when the day INDEX changes, which a week step does not. */
  view.setOilDay(null)
  loadWeek(shiftWeek(CURWEEK, dir))
  boardTab(Math.min(di, DAYS.length - 1))
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
    /* a mouse can release OUTSIDE `.sb-main` (the top bar is a sibling), and
       the up listener here never hears it — so `live` was left armed and a
       bare hover then scrolled the board with no button down (audit,
       12 Aug 26). Touch is immune (implicit pointer capture delivers the up
       regardless); for a mouse, no pressed primary button means the drag is
       over, whatever we missed. */
    if (e.pointerType === 'mouse' && e.buttons !== 1) { live = false; return }
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
  /* back on `.sb-main` as it was before the carousel (12 Aug 26): it briefly
     moved up to `.schedboard` so it would read the swipe's lock in the same
     event, and with the swipe gone there is nothing to share a finger with */
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
    /* not while another finger is holding a puck (audit, 12 Aug 26). A scrub
       repaints the board, which detaches the node the drag machine is
       carrying, and its drop would then land against the day it never aimed
       at. The strip simply does not take the gesture; the drag keeps it. */
    if (touchDragBusy()) return
    live = true; moved = false; x0 = e.clientX; id = e.pointerId
  }
  const onMove = (e: any) => {
    if (!live || (id != null && e.pointerId !== id)) return
    /* capture is deferred until the gesture IS a scrub (below), so a mouse
       press that slips off the strip before that can release where the up
       listener never hears it — `live` was then left armed and a bare HOVER
       scrubbed the week with no button down (audit, 12 Aug 26). Touch keeps
       its implicit capture and never gets here unpressed. */
    if (e.pointerType === 'mouse' && e.buttons !== 1) { live = false; return }
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
