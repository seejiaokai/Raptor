/* The Logic page's two lists — its SETTINGS and its CHECKS — written for the person who reads them (owner D925, built
   as drawn D928, 15 Oct 26): the editable settings first, each with one line saying what else moves with it; then every
   check the app raises, each with one line naming the setting it reads (D929 — "how the rules are affecting one
   another … key pointers"), four with a folded "How it works". Key points only (D930 — "ask yourself if these words are
   needed in the first place"). Every line, word for word, and why each old row went:
   docs/superpowers/specs/2026-10-15-logic-page-lines.md (read by one fresh reader before the build, D928).

   Every value is still READ OUT OF THE LIVE OBJECTS at render time (VCONF, SHIFT_HARD, RANK, WCODE, the cut-offs), so
   the page cannot drift from the engine; and a check's name is the warning list's OWN name for it (WCODE, through
   wlbl), so the reader meets the same words here as on the schedule. The old rule book (lgRules) — its code names, its
   engine-text column and its long "why" paragraphs — is in git history. */
import { VCONF, SHIFT_HARD, KIND_LABEL, ruleFmt } from '../engine/rules'
import { RANK, CHIP_LABEL, WCODE, chipText, wlbl } from '../engine/validate'
import { cutRuleText } from '../engine/inputs'
import { lgT, hhmm } from '../engine/time'
import { kindNote } from '../engine/wavetpl'
import { esc } from '../state/view'
import { membersFileOn } from '../state/perms'
import { missionTracking } from '../engine/insights-config'

export const LG_TIER: any = { hard: 'Warning', adv: 'Advisory', note: 'Note' }
/* a live value inside a line, set apart as the page has always set it */
export const lgV = (v: any) => `<span class="val">${esc(String(v))}</span>`
const T = (k: string) => lgV(lgT(VCONF[k]))

/* THE SETTINGS NOT ON THE PAGE (D928 — "the two unused settings are removed from the page"): nothing in the app reads
   either. They stay in the engine's settings, so a stored value still loads and "Reset to standard" still clears it;
   the guard in logic.test.tsx accounts for every setting as either shown here or named in this list. */
export const LG_HIDDEN: Record<string, string> = { minTurn: 'nothing reads it', dur: 'nothing reads it' }

/* one setting row. kind: 'num' (one box, the default), 'text' (the + In-time words), 'window' (two clock
   boxes, the SC day window), 'kinds' (the six SC MAIN clash switches), 'door' (set in a calendar's own settings window
   — D639; an admin's value opens it), 'mix' (the Insights switch). `keys` names every engine setting the row shows. */
export type LgSet = { name: string, keys: string[], kind?: 'num' | 'text' | 'window' | 'kinds' | 'door' | 'mix', door?: 'inputs' | 'sans', value?: () => string, line: () => string }
export type LgGroup<T> = { g: string, items: T[] }

export function lgSettings(): LgGroup<LgSet>[] {
  return [
    { g: 'Crew rest and the working day', items: [
      { name: 'Crew rest', keys: ['crewRest'], line: () => 'The rest a flyer needs before his day starts. The crew-rest warning and the tight crew-rest advisory move with it.' },
      { name: 'Days in a row', keys: ['maxRun'], line: () => 'A day on the programme beyond this many in a row raises the red break-day warning.' },
      { name: 'Long work day', keys: ['longDay'], line: () => 'A longer day, first commitment to last, shows the grey long-day note.' },
      { name: 'Default rally before take-off', keys: ['reportLead'], line: () => 'An empty R box suggests take-off less this time, and "+ In-time" fills in the same time. With no in-time or rally entered, a flyer\'s day starts here: his long day, OIL and Insights hours count from it. It also sets when the tight crew-rest advisory shows.' },
    ] },
    { g: 'Flying lines', items: [
      { name: 'Brief before take-off', keys: ['briefLead'], line: () => 'Sets the suggested B on a line with no brief typed, and a blank B is checked against it. With no in-time typed, crew rest counts to this B. A published day keeps its B until it is published again.' },
      { name: 'Step before take-off', keys: ['step'], line: () => 'A man counts as busy from step: clashes and the crew list follow it. It and dekit set the shortest tight turn. It also decides when a LATE SHOW crew-rest ring turns from dashed to solid.' },
      { name: 'Dekit after landing', keys: ['dekit'], line: () => 'A man counts as busy until dekit. It and step set the shortest tight turn.' },
      { name: 'Debrief after landing', keys: ['debrief'], line: () => 'Ends a flyer\'s day: tomorrow\'s crew rest, the long day, OIL and Insights hours count to here, and so does the flight debrief advisory.' },
      { name: 'Tight turn', keys: ['tightTurn'], line: () => 'A shorter gap from landing to the next take-off is a tight turn. It is never less than dekit plus step.' },
      { name: 'In-time words', keys: ['reportText'], kind: 'text', line: () => 'What "+ In-time" writes after the time.' },
    ] },
    { g: 'Sims', items: [
      { name: 'EP sim brief', keys: ['epBrief'], line: () => 'The brief before an EP sim, unless its remarks name one.' },
      { name: 'Sim debrief', keys: ['simDebrief'], line: () => 'The debrief after a sim.' },
      { name: 'AMT debrief', keys: ['amtDebrief'], line: () => 'How long an AMT debrief runs when its DEBRIEF row has no end.' },
    ] },
    { g: 'Rows with no end time', items: [
      { name: 'A sim', keys: ['simLen'], line: () => 'A sim with a start and no end is taken to run this long, for clashes and the crew list. It earns no OIL until its end is typed.' },
      { name: 'Any other row', keys: ['openEnd'], line: () => 'The same for a ground, programme or duty row.' },
    ] },
    { g: 'Standby (SC, AVALON, BB)', items: [
      { name: 'SC day window', keys: ['scDayFrom', 'scDayTo'], kind: 'window', line: () => 'A shift wholly inside it needs SC DAY; one reaching outside it needs SC NIGHT.' },
      { name: 'SC MAIN clashes', keys: [], kind: 'kinds', line: () => 'What an SC MAIN man\'s clash with each shows: a red warning or an amber advisory.' },
    ] },
    { g: 'Inputs', items: [
      { name: 'Inputs late cut-off', keys: ['inputLead', 'inputCutMode', 'inputCutWd', 'inputCutWeeks'], kind: 'door', door: 'inputs', value: () => cutRuleText('inputs'), line: () => 'An input last changed after it wears LATE.' },
      { name: 'SANS late cut-off', keys: ['sansLead', 'sansCutMode', 'sansCutWd', 'sansCutWeeks'], kind: 'door', door: 'sans', value: () => cutRuleText('sans'), line: () => 'The same for SANS availability.' },
      { name: 'Members file for others', keys: [], kind: 'door', door: 'inputs', value: () => membersFileOn() ? 'On' : 'Off', line: () => 'A member may file a duty or commitment for someone else. Never leave, medical or SANS availability.' },
    ] },
    { g: 'OIL', items: [
      { name: 'Full day of OIL', keys: ['oilFullMin'], line: () => 'Weekend or holiday work this long or longer earns a full day; less earns a half.' },
    ] },
    { g: 'Insights', items: [
      { name: 'Track Blue and Red sorties', keys: [], kind: 'mix', value: () => missionTracking() ? 'On' : 'Off', line: () => 'Splits Insights\' flying bars into Blue and Red, and asks Blue or Red under a formation.' },
    ] },
  ]
}

/* one check row. A check with a `code` is a warning, an advisory or a note the warning list raises, named as the
   list names it; one without is a grey note — something the app does that a reader acts on. `how` is the folded
   "How it works" — exactly four (D928). `id` keys the fold's open state and the row. */
export type LgChk = { id: string, sev: 'hard' | 'adv' | 'note', code?: string, name?: string, line: () => string, how?: () => string[] }

/* the flag order on a puck, most serious first — red where the rule is a Warning, grey for the long day, amber for
   the rest (kept in step with the week's own legend, html.ts — owner, 10 Aug 26) */
export const lgChipRow = () => `<span class="lgchips">` + Object.keys(RANK).sort((a: any, b: any) => RANK[b] - RANK[a])
  .map((c: any) => `<span class="lgc"><i style="background:${
    c === 'C' || c === 'CR' || c === 'Q' || c === 'RUN' || c === 'CPH' ? '#F0555F;color:#fff' :
    c === 'LD' ? '#8A96A3;color:#0B0D10' : '#E5A83B'}">${esc(chipText(c))}</i>${esc(wlbl(CHIP_LABEL[c] || c))}</span>`).join('') + `</span>`

export const lgChkName = (c: LgChk) => c.code ? wlbl(WCODE[c.code]) : (c.name || '')

export function lgChecks(): LgGroup<LgChk>[] {
  const turn = lgV(lgT(Math.max(VCONF.tightTurn, VCONF.dekit + VCONF.step)))
  return [
    { g: 'Crew rest and the working day', items: [
      { id: 'crewrest', sev: 'hard', code: 'CREW_REST', line: () => `For a flying member: at least ${T('crewRest')} (Crew rest) from the end of his day before to his earliest in-time, or to anything earlier that day.`,
        how: () => [
          `Rest runs from the end of the day before to the first thing today: his in-time, his B where no in-time is typed, or anything earlier, such as a meeting.`,
          `The day before ends at its last commitment of any kind. A flight ends at landing plus the debrief (${T('debrief')}); anything else at its written end.`,
          'An input counts only if it is a duty or commitment, other than Personal or SANS Availability, with typed times.',
          `Exactly ${T('crewRest')} is legal. A day with no flying asks for no rest.`,
          'A LATE SHOW remark keeps the warning. The ring is dashed while rest still clears by step, solid after.',
          'Monday checks last Sunday. A Sunday that breaks Monday shows a "Breaks Monday" box.',
          'A flying line with no times yet is not measured, but a typed brief, in-time or landing on it still counts.',
          'An SC SPARE carries no crew rest either way, and a shift\'s start is its report.',
        ] },
      { id: 'crewtight', sev: 'adv', code: 'CREW_TIGHT', line: () => `His rest would be short if he reported the usual ${T('reportLead')} before take-off (Default rally before take-off), but his typed in-time is later, so it clears.` },
      { id: 'daysrun', sev: 'hard', code: 'DAYS_RUN', line: () => `On the programme more than ${lgV(VCONF.maxRun)} days in a row.`,
        how: () => [
          'Any tasking counts: a flight, a duty, a sim, a ground or programme row.',
          'Leave or a downchit resets the count.',
          'It counts last week\'s tail, and the warning lands on the day to clear.',
        ] },
      { id: 'longday', sev: 'note', code: 'LONGDAY', line: () => `More than ${T('longDay')} from first commitment to last.` },
    ] },
    { g: 'Two things at once', items: [
      { id: 'doublebook', sev: 'hard', code: 'DOUBLE_BOOK', line: () => 'Two commitments overlap for one man. Touching end to end is not a clash.' },
      { id: 'shiftsoft', sev: 'adv', code: 'SHIFT_SOFT', line: () => 'An SC MAIN man is also down for something set to Advisory under SC MAIN clashes. A commitment input across the shift is red; a meeting stays amber.' },
      { id: 'info', sev: 'note', name: 'ⓘ info only', line: () => 'A ground or programme item marked ⓘ is printed but never checked, and earns no OIL.' },
      { id: 'midnight', sev: 'note', name: 'Past midnight', line: () => 'A row whose end reads earlier than its start runs into the next day.' },
    ] },
    { g: 'Flying lines', items: [
      { id: 'kind-fly', sev: 'note', name: 'Flying wave', line: () => esc(kindNote('fly')) },
      { id: 'reportorder', sev: 'hard', code: 'REPORT_ORDER', line: () => 'In-time, rally, brief, take-off and landing are not in that order.',
        how: () => [
          'The order is in-time, rally, brief, take-off, landing. Equal times are fine.',
          `The B on the line is what is checked. A blank B is checked as the suggested brief, take-off less ${T('briefLead')}.`,
          'Out of order is red, but it never stops a day being published.',
          'A formation\'s rally is its R box. On an In-time line the first clock is used (09:00H or 0900); a line that says RALLY still counts as a rally.',
          'A formation\'s name makes the line that formation\'s; otherwise it is the whole wave\'s.',
          'A clock later than take-off means the day before.',
          'RALLY AFTER IN TIME, with no clock, means rally at that formation\'s in-time.',
        ] },
      { id: 'reportunres', sev: 'adv', code: 'REPORT_UNRESOLVED', line: () => 'The app cannot read an In-time line, or RALLY AFTER IN TIME has no in-time.' },
      { id: 'nobrief', sev: 'adv', code: 'NO_BRIEF', line: () => 'Something sits between the brief and take-off. A blank B counts as the suggested one (Brief before take-off).' },
      { id: 'debrief', sev: 'adv', code: 'DEBRIEF', line: () => `Something sits inside landing plus ${T('debrief')} (Debrief after landing).` },
      { id: 'turn', sev: 'adv', code: 'TURN', line: () => `Less than ${turn} from landing to the next take-off (Tight turn, or Dekit plus Step if longer).` },
      { id: 'dtsum', sev: 'adv', code: 'DT_SUM', line: () => 'Two or more sorties in one day. One line names everyone; it is routine, not an error.' },
      { id: 'fltnolen', sev: 'adv', code: 'FLT_NO_LEN', line: () => 'A line\'s take-off and landing are the same time. A flying line still earns its OIL; a standby shift earns none.' },
    ] },
    { g: 'Sims', items: [
      { id: 'simbrief', sev: 'adv', code: 'SIM_BRIEF', line: () => `Something sits inside an EP sim's ${T('epBrief')} brief (EP sim brief), or an AMT's BRIEF row.` },
      { id: 'simdebrief', sev: 'adv', code: 'SIM_DEBRIEF', line: () => `Something sits inside a sim's ${T('simDebrief')} debrief (Sim debrief), or an AMT's DEBRIEF row (AMT debrief, where that row has no end).` },
    ] },
    { g: 'Qualifications and currency', items: [
      { id: 'qual', sev: 'hard', code: 'QUAL', line: () => 'A man in a seat he may not hold, such as a WSO in the front seat. Any pilot may fly the rear seat.' },
      { id: 'illegalcrew', sev: 'hard', code: 'ILLEGAL_CREW', line: () => 'An OCU pilot with a CAT A–D WSO, or the reverse. An instructor in either seat clears it.' },
      { id: 'crewsolo', sev: 'adv', code: 'CREW_SOLO', line: () => 'An OCU pilot with an OCU WSO. Allowed only on sorties the syllabus names.' },
      { id: 'coapproval', sev: 'adv', code: 'CO_APPROVAL', line: () => 'A CAT D pilot with a CAT C WSO, a CAT C pilot with a CAT D WSO, or two CAT Ds. The crew needs the CO\'s approval.' },
      { id: 'ocunoip', sev: 'adv', code: 'OCU_NO_IP', line: () => 'An OCU formation with no instructor (IW, IP, IR or FI).' },
      { id: 'paxcrew', sev: 'adv', code: 'PAX_CREW', line: () => 'Ground crew in a rear seat. The ride needs approval. Ground crew are checked only for clashes, the long day and days in a row.' },
      { id: 'noir', sev: 'hard', code: 'NO_IR', line: () => 'IRT in the mission needs an IR in the formation; IRT in an aircraft\'s remarks needs one in that aircraft.' },
      { id: 'aarqual', sev: 'hard', code: 'AAR_QUAL', line: () => 'AAR in the remarks needs the front seat\'s currency: night on a night wave, day otherwise. NAAR or DAAR says it outright.' },
      { id: 'aarinstr', sev: 'hard', code: 'AAR_INSTR', line: () => 'A pilot not current may fly AAR as training only with an instructor in the back seat marked I for it on Quals (an I in place of the tick on DAAR or NAAR). That clears the front seat\'s currency warning; an instructor without the mark is flagged instead.' },
      { id: 'scqual', sev: 'hard', code: 'SC_QUAL', line: () => `A standby shift wholly inside ${lgV(hhmm(VCONF.scDayFrom))} to ${lgV(hhmm(VCONF.scDayTo))} (SC day window) needs SC DAY; one reaching outside it needs SC NIGHT. A SPARE is checked the same as a MAIN.` },
      { id: 'nightafterday', sev: 'note', name: 'Night after day', line: () => 'NAAR needs DAAR, and SC NIGHT needs SC DAY. On Quals, removing the day one removes the night one.' },
    ] },
    { g: 'Standby (SC, AVALON, BB)', items: [
      /* the "+ Wave" picker's own words for each standby kind — ONE source, engine/wavetpl.ts kindNote (owner, 30 Aug
         26: the picker and this page never tell different stories; logic.test.tsx pins it) */
      { id: 'kind-sc', sev: 'note', name: 'SC', line: () => esc(kindNote('sc')) },
      { id: 'kind-avalon', sev: 'note', name: 'AVALON', line: () => esc(kindNote('avalon')) },
      { id: 'kind-bb', sev: 'note', name: 'BB', line: () => esc(kindNote('bb')) },
      { id: 'shifthours', sev: 'note', name: 'A shift\'s hours', line: () => 'A standby shift takes exactly its written hours: no step, dekit, brief or debrief.' },
      /* [STANDBY-FLIES] (owner D1042–D1046, D1061, D1062, 19 Oct 26) */
      { id: 'saflies', sev: 'note', name: 'A standby row that flies', line: () => 'A shift with its B or R typed flies, every row on it; a row ticked FLIES on the Scheduler Board flies on its own. A row that flies is checked as an SC MAIN is, counts as a jet and a sortie, and earns OIL by default. A row with nobody on it counts nothing; one that does not come in is cancelled with CX.' },
      { id: 'saflynotime', sev: 'adv', code: 'SA_FLY_NO_TIME', line: () => 'A standby shift that flies has no START or END, so its crew rest and OIL cannot be worked out.' },
      { id: 'scintime', sev: 'adv', code: 'SC_INTIME', line: () => 'A standby row that flies has a typed B (the crew\'s in-time) or R (its rally), whichever is earlier, and something sits between it and the shift start. That time also starts his crew rest, his long day and his OIL.' },   // R since D1041; every row of a flying shift since [STANDBY-FLIES]
      { id: 'scarm', sev: 'note', name: 'Arming an SC seat', line: () => 'The crew list judges each man against that shift\'s hours only.' },
    ] },
    { g: 'Leave, downchits and inputs', items: [
      { id: 'inputcloses', sev: 'note', name: 'An input closes its hours', line: () => 'Every input closes the man for the hours it covers, from the moment it is filed. One a scheduler has taken off the programme closes nothing.' },
      { id: 'leavefly', sev: 'hard', code: 'LEAVE_FLY', line: () => 'A man on leave is planned for a flight, sim, duty or ground slot.' },
      { id: 'dnif', sev: 'hard', code: 'DNIF_FLY', line: () => 'A medically down man is planned. On ATT B he may still stand a duty, sim or ground slot, but not fly.' },
      { id: 'inputfly', sev: 'hard', code: 'INPUT_FLY', line: () => 'Any other input clashes with a planned slot: a course, a meeting, an appointment, overseas duty.' },
      { id: 'notimes', sev: 'note', name: 'A seat with no times', line: () => 'Still checked against an absence covering the whole day; a part-day absence waits until the seat has times.' },
      { id: 'halfdays', sev: 'note', name: 'Half days', line: () => 'Leave and medical can be AM (to 12:00), PM (from 12:01) or all day, and a half day closes only its own half. A sortie counts from its step (Step before take-off), so AM leave still clashes with a wave that steps before noon.' },
      { id: 'spare', sev: 'note', name: 'Standing SC SPARE', line: () => 'A man on local leave may still stand SC SPARE. Overseas leave or duty (OL, OD) or a medical code (HL, OML, ATT C, ATT B) may not: that is a warning. A row that flies has no such allowance.' },
      { id: 'sansavail', sev: 'adv', code: 'SANS_AVAIL', line: () => 'A SANS man planned outside the event or the hours he filed. Filing nothing raises nothing.' },
      { id: 'late', sev: 'note', name: 'LATE', line: () => 'An input last changed after its cut-off (Inputs late cut-off) wears LATE: a mark, never a warning. Downchits never do.' },
    ] },
    { g: 'OIL', items: [
      { id: 'oil', sev: 'note', name: 'Weekend and holiday work earns OIL', line: () => 'Work on a weekend or public holiday earns OIL once the day is published: a full day or a half, by Full day of OIL.',
        how: () => [
          'Weekend or holiday work earns OIL once the day is published.',
          `A man's day runs from his first report to his last end, gaps included: ${lgV(ruleFmt('oilFullMin', VCONF.oilFullMin))} or more is a full day (FO), less is a half (HO).`,
          'A flight runs from its in-time (or Default rally before take-off, where neither an in-time nor a rally is entered) to landing plus the debrief.',
          'A row with no times, or no end time, earns nothing. An Off day earns nothing.',
          'SC SPARE, AVALON and BB rows that do not fly earn only if switched on in OIL Earn. A row that flies earns by default, from its B or R (the earlier) to its END.',
          'A Duty & commitments input earns once its OIL question is answered yes.',
          'A published day keeps its OIL until it is published again.',
        ] },
      { id: 'oilnotimes', sev: 'hard', code: 'OIL_NO_TIMES', line: () => 'On a weekend or holiday, a row with someone on it and no usable times earns nobody on it any OIL. The warning names the row.' },
      { id: 'oilunpub', sev: 'adv', code: 'OIL_UNPUBLISHED', line: () => 'A weekend or holiday with someone to earn is not published yet. Nobody earns until it is.' },
      { id: 'oilnoperiod', sev: 'adv', code: 'OIL_NO_PERIOD', line: () => 'No Leave War period covers this weekend or holiday, so its work earns nobody OIL. The day offers to create the period, before and after it is published.' },
      { id: 'oilstaleday', sev: 'adv', code: 'OIL_STALE_DAY', line: () => 'A day published as a working day that the Leave War now calls a public holiday earns nothing until it is published again.' },
      { id: 'oilstalehol', sev: 'adv', code: 'OIL_STALE_HOLIDAY', line: () => 'A day published as a holiday that the Leave War no longer calls one keeps its OIL until it is published again, which withdraws it.' },
      { id: 'oiloldblock', sev: 'adv', code: 'OIL_OLD_BLOCK', line: () => 'A weekend or holiday published before the app counted an ALL AVAIL on a duty desk, sim or extra people line shows a pending change. Publish it again and the men behind that puck get their OIL.' },
    ] },
    { g: 'On the puck', items: [
      { id: 'puck', sev: 'note', name: 'Several problems on one puck', line: () => 'It shows the most serious flag, in this order, and its ring the most serious colour. A red box round the whole puck marks a conflict, a crew-rest breach, a qualification problem or a missed brief.' + lgChipRow() },
    ] },
  ]
}

/* the six SC MAIN clash kinds, as the "SC MAIN clashes" setting draws them */
export const lgKinds = () => Object.keys(KIND_LABEL).map(k => ({ k, label: KIND_LABEL[k], hard: !!SHIFT_HARD[k] }))
