/* THE ONE CHANGES WINDOW'S LINES ([DRAFT-PENDING], 28 Sep 26 — the owner's D168: one changes window for the whole
   app; D170: new to you until you mark it seen, grouped by person and sitting on its own, every line saying who and
   when; the design of record docs/mock/changes-window.html, option A).

   Reads the change history (engine/editlog.ts) and turns its rows into what the window lists:
   · A LINE — what (the man, or the place, in bold), what happened ("put on RU BFM · #1 FCP", "07:00 → 07:30",
     "moved from MET + NOTAM BRIEF to SODB"), who and when. A person is named by his live callsign (elogVal).
   · A MOVE IS ONE LINE (Fable F2): the history is per cell, so a man dragged from one place to another is two rows —
     off here, on there. Two rows NEXT TO EACH OTHER in the history, by the same person, within a second and a half,
     one taking a man off a place and the other putting the SAME man on another, pair into one line. Door-independent on
     purpose: no wrapper at each door that a new door could forget. A swap is two lines (D109 — two moves).
   · GROUP BY WHERE — a closed list of the day's own sections (Astra DP-12), by the key's prefix; a line with no key names
     its section when it is written (engine/editlog.ts `sect`), else it is "The day".
   · GROUP BY WHO — by person, then by SITTING: one person's changes with no gap over 30 minutes.
   · THE COUNTS — per calendar day of the loaded week, what is new to you and what changed, in LINES (a move counts one);
     the admin's icon counts the week, a line once however many of its days it covers. */
import { ELOG, elogWeekRows, rowTouches, weekDates, elogWho, elogVal, isPersonKey, type ELogRow } from '../engine/editlog'
import { CURWEEK } from '../engine/waves'
import { isNewToMe } from '../state/changes'

export type Sect = 'fly' | 'duty' | 'prog' | 'sim' | 'ground' | 'note' | 'abs' | 'quals' | 'day'
export const SECT_ORDER: Sect[] = ['fly', 'duty', 'prog', 'sim', 'ground', 'note', 'abs', 'quals', 'day']
export const SECT_LABEL: Record<Sect, string> = {
  fly: 'Flying waves', duty: 'Duties', prog: 'Common Programme', sim: 'Sims', ground: 'Ground', note: 'Notes',
  abs: 'Absences', quals: 'Quals', day: 'The day',
}
const PFX: Record<string, Sect> = {
  ff: 'fly', fr: 'fly', wl: 'fly', it: 'fly', tr: 'fly', st: 'fly', ar: 'fly', at: 'fly', fa: 'fly', ft: 'fly', aa: 'fly', au: 'fly',
  d: 'duty', dr: 'duty', dl: 'duty', dtn: 'duty',
  a: 'prog', ap: 'prog', pn: 'prog',
  s: 'sim', sr: 'sim', sn: 'sim',
  g: 'ground', gr: 'ground', gn: 'ground',
  dn: 'note',
  iu: 'abs',
}
export function sectionOf(r: { key: string; sect?: string }): Sect {
  if (r.key) {
    const c = r.key.indexOf(':')
    if (c < 0) return 'fly'                                  // a flying seat carries no prefix
    return PFX[r.key.slice(0, c)] || 'day'
  }
  return (r.sect && (SECT_LABEL as any)[r.sect]) ? r.sect as Sect : 'day'
}

export type CLine = {
  rows: ELogRow[]; seqs: number[]; t: number; pid: string | null; who: string
  title: string; text: string; from: string; to: string
  sect: Sect; fresh: boolean; date: string | null
}

/* one row in words */
function words(r: ELogRow): { title: string; text: string; from: string; to: string } {
  const from = elogVal(r, 'from'), to = elogVal(r, 'to')
  if (r.key && isPersonKey(r.key)) {
    if ((r.from === '—' || !r.from) && r.to && r.to !== '—') return { title: to, text: `put on ${r.lbl}`, from: '', to: '' }
    if ((r.to === '—' || !r.to) && r.from && r.from !== '—') return { title: from, text: `taken off ${r.lbl}`, from: '', to: '' }
  }
  return { title: r.lbl, text: '', from: from === '—' && !r.key ? '' : from, to }
}
const offOf = (r: ELogRow) => (r.key && isPersonKey(r.key) && r.from && r.from !== '—' && (r.to === '—' || !r.to)) ? r.from : null
const onOf = (r: ELogRow) => (r.key && isPersonKey(r.key) && r.to && r.to !== '—' && (r.from === '—' || !r.from)) ? r.to : null
const PAIR_MS = 1500

type IsNew = (r: ELogRow) => boolean
/* the lines on any of `dates`, NEWEST FIRST, a move paired into one */
export function linesFor(dates: string[], isNew: IsNew = r => isNewToMe(r)): CLine[] {
  const want = new Set(dates)
  const rows = ELOG.rows.filter(r => [...want].some(d => rowTouches(r, d)))      // oldest first, in number order
  const out: CLine[] = []
  for (let i = 0; i < rows.length; i++) {
    const a = rows[i]!, b = rows[i + 1]
    /* a move: neighbours in the WHOLE history (nobody's change between them), the same person, within a moment,
       one off and one on for the same man */
    if (b && b.seq === a.seq + 1 && (a.pid || a.who) === (b.pid || b.who) && Math.abs(b.t - a.t) <= PAIR_MS) {
      const offA = offOf(a), onB = onOf(b), onA = onOf(a), offB = offOf(b)
      const [off, on] = offA && onB && offA === onB ? [a, b] : onA && offB && onA === offB ? [b, a] : [null, null]
      if (off && on) {
        out.push({
          rows: [a, b], seqs: [a.seq, b.seq], t: Math.max(a.t, b.t), pid: a.pid ?? null, who: elogWho(a),
          title: elogVal(on, 'to'), text: `moved from ${off.lbl} to ${on.lbl}`, from: '', to: '',
          sect: sectionOf(on), fresh: isNew(a) || isNew(b), date: on.date,
        })
        i++
        continue
      }
    }
    const w = words(a)
    out.push({ rows: [a], seqs: [a.seq], t: a.t, pid: a.pid ?? null, who: elogWho(a), ...w, sect: sectionOf(a), fresh: isNew(a), date: a.date })
  }
  return out.reverse()
}

export type WhoGroup = { key: string; pid: string | null; who: string; lines: CLine[]; from: number; to: number; fresh: boolean }
const SITTING_MS = 30 * 60_000
/* by person, then by sitting — newest sitting first; lines newest first inside it */
export function byWho(lines: CLine[]): WhoGroup[] {
  const per = new Map<string, CLine[]>()
  for (const l of lines) { const k = l.pid || `?${l.who}`; per.set(k, [...(per.get(k) || []), l]) }
  const out: WhoGroup[] = []
  for (const [k, ls] of per) {
    const asc = [...ls].sort((x, y) => x.t - y.t || x.seqs[0]! - y.seqs[0]!)
    let cur: CLine[] = []
    const flush = () => {
      if (!cur.length) return
      const newest = [...cur].reverse()
      out.push({ key: `${k}@${cur[0]!.seqs[0]}`, pid: cur[0]!.pid, who: cur[0]!.who, lines: newest, from: cur[0]!.t, to: cur[cur.length - 1]!.t, fresh: cur.some(l => l.fresh) })
      cur = []
    }
    for (const l of asc) { if (cur.length && l.t - cur[cur.length - 1]!.t > SITTING_MS) flush(); cur.push(l) }
    flush()
  }
  return out.sort((x, y) => y.to - x.to)
}

export type WhereGroup = { key: string; sect: Sect; label: string; lines: CLine[]; fresh: boolean }
export function byWhere(lines: CLine[]): WhereGroup[] {
  return SECT_ORDER.map(s => {
    const ls = lines.filter(l => l.sect === s)
    return { key: `sect:${s}`, sect: s, label: SECT_LABEL[s], lines: ls, fresh: ls.some(l => l.fresh) }
  }).filter(g => g.lines.length)
}

/* per calendar day of the loaded week: { fresh: new to you, all: every line } — in LINES */
export function dayCounts(isNew: IsNew = r => isNewToMe(r)): Record<string, { fresh: number; all: number }> {
  const out: Record<string, { fresh: number; all: number }> = {}
  for (const d of weekDates(CURWEEK)) {
    const ls = linesFor([d], isNew)
    out[d] = { fresh: ls.filter(l => l.fresh).length, all: ls.length }
  }
  return out
}
/* the admin's icon: what is new to you across the loaded week, a line once */
export function weekNew(isNew: IsNew = r => isNewToMe(r)): number {
  return linesFor(weekDates(CURWEEK), isNew).filter(l => l.fresh).length
}
/* the rows of the loaded week, for the window's "Mark all as seen" and the chip's memo */
export const weekRows = () => elogWeekRows(CURWEEK)
