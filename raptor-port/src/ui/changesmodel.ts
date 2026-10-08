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
   · GROUP BY ITEM ([CHG-BY-ITEM] — D340, D345; it replaced Group by Where, the day's sections): one group per item, the
     latest-changed on top, every line item-first — `itemOf`, `byItem` below.
   · GROUP BY WHO — by person, then by SITTING: one person's changes with no gap over 30 minutes; its lines item-first.
   · THE COUNTS — per calendar day of the loaded week, what is new to you and what changed, in LINES (a move counts one);
     the admin's icon counts the week, a line once however many of its days it covers. */
import { ELOG, elogWeekRows, rowTouches, weekDates, elogWho, elogVal, isPersonKey, TXT_FLD, NOTE_LBL, jetOf, type ELogRow } from '../engine/editlog'
import { CURWEEK } from '../engine/waves'
import { REPORTING_LABEL } from '../engine/reporting'
import { isNewToMe, SEEN_VER } from '../state/changes'
import { me } from '../state/perms'
import { HOOKS } from '../engine/hooks'
import { DAYS } from '../engine/data'
import { ridKey, posKey } from '../engine/rowids'
import { PEOPLE } from '../engine/people'
import { INPUTS, inpById } from '../engine/inputs'
import { dayApproved, approvedDays } from '../engine/publish'
import { inVersionLook } from './html'

export type CLine = {
  rows: ELogRow[]; seqs: number[]; t: number; pid: string | null; who: string
  title: string; text: string; from: string; to: string
  fresh: boolean; date: string | null
  key: string; iid?: string      // where a tap takes the schedule: the cell (a move — the place he reached), or the input
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
       one off and one on for the same man — on the SAME day: a man moved to another day is one change on each (D109),
       so the week's view pairs nothing the two days' chips count apart (Fable's final read, F7) */
    if (b && b.seq === a.seq + 1 && a.date === b.date && (a.pid || a.who) === (b.pid || b.who) && Math.abs(b.t - a.t) <= PAIR_MS) {
      const offA = offOf(a), onB = onOf(b), onA = onOf(a), offB = offOf(b)
      const [off, on] = offA && onB && offA === onB ? [a, b] : onA && offB && onA === offB ? [b, a] : [null, null]
      if (off && on) {
        out.push({
          rows: [a, b], seqs: [a.seq, b.seq], t: Math.max(a.t, b.t), pid: a.pid ?? null, who: elogWho(a),
          title: elogVal(on, 'to'), text: `moved from ${off.lbl} to ${on.lbl}`, from: '', to: '',
          fresh: isNew(a) || isNew(b), date: on.date, key: on.key,
        })
        i++
        continue
      }
    }
    const w = words(a)
    out.push({ rows: [a], seqs: [a.seq], t: a.t, pid: a.pid ?? null, who: elogWho(a), ...w, fresh: isNew(a), date: a.date, key: a.key, ...(a.iid ? { iid: a.iid } : {}) })
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

/* ---- THE ITEM OF A LINE — Group by Item ([CHG-BY-ITEM], 28 Sep 26 — the owner's D340: "the main category to sort as
   per item, and the latest changes of that group will be the highest … in that item can show sub categories of that
   item, if that item has multiple change"; the approved mock-up, D345). ----
   An item is a PLACE in a day — a formation (its seats and fields its details), a wave, a duty desk or block, a sim row,
   a programme row, a ground row, a note — or an input, a man's Quals, a man on the Leave War, the day itself. Its
   IDENTITY is the history row's ROW-ANCHORED key (its rows' stable ids — engine/rowids.ts) with the seat or field taken
   off, and ALWAYS its calendar day: never its words, so two lines both called "VL BFM" are two items and a row renamed
   between two changes stays one; the same event on two days is two items. Its TITLE is the live name ("Programme ·
   SODB" — as a man is named by his live callsign), or the frozen label's head when the row has gone. */
export type Item = { id: string; title: string; detail: string }
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const cap = (s: any) => { const t = String(s || ''); return t ? t[0]!.toUpperCase() + t.slice(1) : '' }
const csOf = (pid: any) => ((PEOPLE as any)[pid] && (PEOPLE as any)[pid].cs) || String(pid || '')
const fieldWord = (f: any) => cap(TXT_FLD[f] || f)
/* the frozen label without its last part (its seat or field) — the name a gone row had */
const head = (lbl: string) => { const i = lbl.lastIndexOf(' · '); return i < 0 ? lbl : lbl.slice(0, i) }
const tail = (lbl: string) => { const i = lbl.lastIndexOf(' · '); return i < 0 ? '' : lbl.slice(i + 3) }
const FLY = new Set(['', 'ff', 'fr', 'st', 'ar', 'at', 'fa', 'ft', 'fx', 'aa', 'au'])
const WAVE: Record<string, string> = { wl: 'Label', it: REPORTING_LABEL, tr: 'Traffic', wx: '' }
const SEAT: Record<string, string> = { p: 'FCP', w: 'RCP', pax: 'Pax' }
const AIR: Record<string, string> = { ar: 'Area', at: 'Area time', fa: 'Area', ft: 'Area time', fx: '' }

function inputItem(date: string, iid: string, r: ELogRow): Item {
  const inp: any = inpById(iid)
  const who = inp ? inp.person : (r.sub || ((r.to && (PEOPLE as any)[r.to]) ? r.to : ''))
  /* gone, it keeps the type its line recorded (`itype` — Astra's final read, FR-04) */
  const type = inp ? inp.type : (r.itype || '')
  /* SEVERAL PEOPLE FILED TOGETHER ARE ONE ITEM (owner D663): keyed by the group its line recorded — never by the input
     as it now stands, so a man since changed alone stays under the filing he was part of. Its title is the kind and how
     many people: those the shared input holds now, or — once it has gone — those its lines name. */
  if (r.grp) {
    const now = (INPUTS as any[]).filter(x => x && x.grp === r.grp).length
    const n = now || new Set(ELOG.rows.filter(x => x.grp === r.grp && x.sub).map(x => x.sub)).size
    return { id: `${date}|IG|${r.grp}`, title: `Input${type ? ' · ' + type : ''}${n > 1 ? ` · ${n} people` : ''}`, detail: '' }
  }
  const title = inp ? `Input · ${csOf(inp.person)} · ${inp.type}` : who ? `Input · ${csOf(who)}${type ? ' · ' + type : ''}` : 'Input'
  return { id: `${date}|I|${iid}`, title, detail: '' }
}

/* A BLUE/RED ANSWER'S ITEM (W7, the Codex stack check, 5 Oct 26; D530, D340). Its line carries no key — an answer writes
   no schedule cell — and names its formation by the line's hidden row id in `sub` (state/changelines.ts). `sub` is
   otherwise "the man this line is about", so the window filed every answer under "Leave War · <the hidden code>". It is
   the formation's own item: found on the loaded week by that id, it takes the very id and title its seats and times
   are filed under (so the answer sits with that line's other changes); gone, or on a week not on screen, it keeps the
   callsign its line recorded — never the code. */
function roleItem(date: string, r: ELogRow): Item {
  const days: any[] = DAYS as any
  for (let di = 0; di < days.length; di++) {
    const waves = (days[di] && days[di].waves) || []
    for (let gi = 0; gi < waves.length; gi++) {
      const fs = (waves[gi] && waves[gi].formations) || []
      for (let li = 0; li < fs.length; li++) {
        const f = fs[li]
        if (!f || !f.rid || f.rid !== r.sub) continue
        const k = ridKey(`ff:${di}.${gi}.${li}.cs`, DAYS), parts = k.slice(k.indexOf(':') + 1).split('.')
        return { id: `${date}|F|${parts[1]}.${parts[2]}`, title: `Flying · ${`${f.cs || 'Line'} ${f.msn || ''}`.trim()}`, detail: 'Mission role' }
      }
    }
  }
  const name = (r.lbl || '').split(' · ')[0] || ''
  return { id: `${date}|MR|${r.sub}`, title: `Flying · ${name && name !== r.sub ? name : 'line'}`, detail: 'Mission role' }
}

export function itemOf(r: ELogRow, day?: string | null): Item {
  const date = day || r.date || ''
  const k = String(r.key || '')
  if (k) {
    const c = k.indexOf(':'), pfx = c < 0 ? '' : k.slice(0, c), parts = (c < 0 ? k : k.slice(c + 1)).split('.')
    if (pfx === 'iu') return inputItem(date, k.slice(3), r)
    if (NOTE_LBL[pfx]) return { id: `${date}|N|${k}`, title: NOTE_LBL[pfx], detail: '' }
    /* the row's live place — its positional address now (null when the row has gone) */
    const pk = posKey(k, DAYS)
    const pp = pk == null ? null : (pk.indexOf(':') < 0 ? pk : pk.slice(pk.indexOf(':') + 1)).split('.')
    const day: any = pp ? (DAYS as any)[+pp[0]!] : null
    const live = (fn: () => any): any => { if (!pp || !day) return null; try { return fn() } catch (_) { return null } }
    if (FLY.has(pfx)) {
      const f = live(() => day.waves[+pp![1]!].formations[+pp![2]!])
      const jet = f && parts[3] != null ? jetOf(f, pp![3]) : ''
      const title = f ? `Flying · ${`${f.cs || 'Line'} ${f.msn || ''}`.trim()}` : `Flying · ${head(r.lbl)}`
      const detail = pfx === '' ? (f ? `${jet}${SEAT[parts[4]!] || String(parts[4] || '').toUpperCase()}` : tail(r.lbl))
        : pfx === 'ff' ? fieldWord(parts[3])
        : pfx === 'fr' ? `${jet}remarks` : pfx === 'st' ? `${jet}stores`
        : pfx === 'aa' ? `${jet}area` : pfx === 'au' ? `${jet}area time`
        : AIR[pfx] ?? ''
      return { id: `${date}|F|${parts[1]}.${parts[2]}`, title, detail }
    }
    if (pfx in WAVE) {
      const w = live(() => day.waves[+pp![1]!])
      const title = w ? `Wave · ${w.label || 'Wave'}` : (r.lbl.startsWith('Wave · ') ? r.lbl : `Wave · ${head(r.lbl)}`)
      return { id: `${date}|W|${parts[1]}`, title, detail: WAVE[pfx]! }
    }
    if (pfx === 'd' || pfx === 'dr') {
      const row = live(() => day.dutywaves[+pp![1]!].rows[+pp![2]!])
      const title = row ? `Duty · ${row.role || 'row'}` : (pfx === 'dr' ? head(r.lbl) : r.lbl)
      return { id: `${date}|D|${parts[1]}.${parts[2]}`, title, detail: pfx === 'dr' ? fieldWord(parts[3]) : '' }
    }
    if (pfx === 'dl' || pfx === 'bx') {
      const b = live(() => day.dutywaves[+pp![1]!])
      return { id: `${date}|DB|${parts[1]}`, title: b ? `Duty block · ${b.label || 'label'}` : r.lbl, detail: pfx === 'dl' ? 'Label' : '' }
    }
    if (pfx === 's' || pfx === 'sr') {
      const row = live(() => day.sims[parts[1]!][+pp![2]!])
      const title = row ? `Sim · ${String(parts[1]).toUpperCase()} ${row.label || ''}`.trim() : (pfx === 'sr' ? head(r.lbl) : r.lbl)
      /* a passenger by his number — "Pax 2" (Astra's final read, FR-03) */
      const seat = parts[3] === 'pax' && /^\d+$/.test(parts[4] || '') ? `Pax ${+parts[4]! + 1}` : (SEAT[parts[3]!] || cap(parts[3]))
      return { id: `${date}|S|${parts[1]}.${parts[2]}`, title, detail: pfx === 'sr' ? fieldWord(parts[3]) : seat }
    }
    if (pfx === 'a' || pfx === 'ap') {
      const row = live(() => day.allhands[+pp![1]!])
      const title = row ? `Programme · ${row.prog || 'row'}` : (pfx === 'ap' ? head(r.lbl) : r.lbl)
      return { id: `${date}|A|${parts[1]}`, title, detail: pfx === 'ap' ? fieldWord(parts[2]) : '' }
    }
    if (pfx === 'g' || pfx === 'gr' || pfx === 'gx') {
      const row = live(() => day.ground[+pp![1]!])
      const title = row ? `Ground · ${row.prog || 'row'}` : (pfx === 'gr' ? head(r.lbl) : r.lbl)
      return { id: `${date}|G|${parts[1]}`, title, detail: pfx === 'gr' ? fieldWord(parts[2]) : '' }
    }
    /* a key this list does not know is its own item, by its whole key — never merged with another by a guess */
    return { id: `${date}|K|${k}`, title: r.lbl || k, detail: '' }
  }
  /* no key — in this order, the first that fits (Fable F3): the input; the man (his Quals, or his Leave War — a decision,
     an award, a posting, by the line's own `sect`, never its words); the day; else the line itself */
  if (r.iid) return inputItem(date, r.iid, r)
  if (r.fld === 'mission-role') return roleItem(date, r)
  if (r.sub) return r.sect === 'quals'
    ? { id: `${date}|Q|${r.sub}`, title: `Quals · ${csOf(r.sub)}`, detail: r.fld && r.fld !== 'roster' ? tail(r.lbl) : '' }
    : { id: `${date}|LW|${r.sub}`, title: `Leave War · ${csOf(r.sub)}`, detail: '' }
  if (date) return { id: `${date}|DAY`, title: 'The day', detail: '' }
  return { id: `|L|${r.seq}`, title: r.lbl, detail: '' }
}

/* ONE ENTRY per line under its item — two for a move (under the item he reached, and the one he left) */
export type Entry = {
  line: CLine; row: ELogRow; item: Item; title: string; detail: string; text: string; from: string; to: string
  key: string; iid?: string; t: number; seq: number; date: string | null; fresh: boolean; move?: 'in' | 'out'
}
/* the other item's title, its kind word dropped when both are the same kind ("moved in from MET + NOTAM BRIEF") */
const shortTitle = (other: string, mine: string) => {
  const a = other.indexOf(' · '), b = mine.indexOf(' · ')
  return a > 0 && b > 0 && other.slice(0, a) === mine.slice(0, b) ? other.slice(a + 3) : other
}
/* a keyless line's words without its item's name in front ("Ranger · LL added" under "Input · Ranger · LL") */
function ownWords(r: ELogRow, item: Item): string {
  const lbl = r.lbl || ''
  /* a Blue/Red answer's own words are where it was given ("Working copy", "Published · AL1", "copied with the day
     template") — its formation and "mission role" are already its heading (W7) */
  if (r.fld === 'mission-role') { const i = lbl.indexOf(' · mission role · '); return i < 0 ? lbl : lbl.slice(i + ' · mission role · '.length) }
  /* under a group filing's item every line NAMES its man — the heading is the kind and how many (D663) */
  if (r.grp) return lbl
  const who = r.sub || (r.iid ? (inpById(r.iid) as any)?.person : '')
  for (const lead of [`Leave War · ${csOf(who)} · `, `${csOf(who)} · `]) if (who && lbl.startsWith(lead)) return lbl.slice(lead.length)
  return item.title === lbl ? '' : lbl
}
function entryOf(l: CLine, r: ELogRow, day?: string | null): Entry {
  const item = itemOf(r, day)
  const base = { line: l, row: r, item, title: item.title, detail: item.detail, key: r.key, t: r.t, seq: r.seq, date: r.date, fresh: l.fresh, ...(r.iid ? { iid: r.iid } : {}) }
  const from = elogVal(r, 'from'), to = elogVal(r, 'to')
  if (r.key && isPersonKey(r.key)) {
    if ((r.from === '—' || !r.from) && r.to && r.to !== '—') return { ...base, text: `${to} put on`, from: '', to: '' }
    if ((r.to === '—' || !r.to) && r.from && r.from !== '—') return { ...base, text: `${from} taken off`, from: '', to: '' }
    return { ...base, text: '', from, to }
  }
  if (r.key) return { ...base, text: '', from, to }
  /* a Quals detail says its field and from → to; any other keyless line (a roster add too) its own words */
  if (r.sect === 'quals' && r.sub && r.fld && r.fld !== 'roster') return { ...base, text: '', from, to }
  return { ...base, text: ownWords(r, item), from: from === '—' ? '' : from, to }
}
/* the day an entry is filed under: the first of the window's days its line touches (a line spanning days — a leave begun
   the week before — leads with its first day in this week; Fable F9), else its own day */
const anchorOf = (r: ELogRow, days?: string[]) => (days && days.find(d => rowTouches(r, d))) || r.date
/* where in its item a man stood, by what his key says (Astra's final read, FR-03) — a seat ("#1 FCP", "Pax 2"); a crowd's
   place ("place 3", its crew index); a desk's or a ground row's main place ("place 1") and its extras (`.x0` → "place 2");
   never the row's own number */
const placeOf = (r: ELogRow, item: Item) => {
  const k = String(r.key), c = k.indexOf(':'), pfx = c < 0 ? '' : k.slice(0, c), parts = (c < 0 ? k : k.slice(c + 1)).split('.')
  const last = parts[parts.length - 1] || ''
  if (/^x\d+$/.test(last)) return `place ${+last.slice(1) + 2}`
  if (pfx === 'a') return /^\d+$/.test(parts[2] || '') ? `place ${+parts[2]! + 1}` : ''
  if (pfx === 'd' || pfx === 'g') return 'place 1'
  return item.detail
}
export function entriesOf(l: CLine, days?: string[]): Entry[] {
  if (l.rows.length === 2) {
    /* a paired move: the row that put him on, and the row that took him off */
    const on = l.rows.find(r => r.key === l.key) || l.rows[1]!, off = l.rows.find(r => r !== on)!
    const iOn = itemOf(on, anchorOf(on, days)), iOff = itemOf(off, anchorOf(off, days)), man = elogVal(on, 'to')
    const at = (r: ELogRow, item: Item) => ({ line: l, row: r, item, title: item.title, detail: item.detail, from: '', to: '', key: r.key, t: l.t, seq: r.seq, date: anchorOf(r, days), fresh: l.fresh })
    /* moved WITHIN one item (a seat to another seat of the same jet, a place to another in one crowd) is ONE entry —
       "Echo moved", its two places as from → to (Fable F2) */
    if (iOn.id === iOff.id) return [{ ...at(on, iOn), detail: '', text: `${man} moved`, from: placeOf(off, iOff), to: placeOf(on, iOn) }]
    return [
      { ...at(on, iOn), text: `${man} moved in from ${shortTitle(iOff.title, iOn.title)}`, move: 'in' },
      { ...at(off, iOff), text: `${man} moved out to ${shortTitle(iOn.title, iOff.title)}`, move: 'out' },
    ]
  }
  const r = l.rows[0]!
  return [{ ...entryOf(l, r, anchorOf(r, days)), date: anchorOf(r, days) }]
}
/* in the week view the day leads every item ("Mon · Programme · SODB") */
const dowOf = (iso: string | null) => { if (!iso) return ''; const d = new Date(iso + 'T00:00:00Z').getUTCDay(); return Number.isFinite(d) ? DOW[(d + 6) % 7]! : '' }
const withDay = (title: string, date: string | null, week: boolean) => (week && dowOf(date) ? `${dowOf(date)} · ${title}` : title)

export type ItemGroup = { key: string; title: string; entries: Entry[]; t: number; seq: number; fresh: boolean; one: boolean }
/* one group per item, the item whose latest change is newest on top; its entries newest first; `one` — changed once */
export function byItem(lines: CLine[], week: boolean, days?: string[]): ItemGroup[] {
  const m = new Map<string, ItemGroup>()
  for (const l of lines) for (const e of entriesOf(l, days)) {
    let g = m.get(e.item.id)
    if (!g) { g = { key: `item:${e.item.id}`, title: '', entries: [], t: 0, seq: 0, fresh: false, one: false }; m.set(e.item.id, g) }
    g.entries.push(e)
  }
  for (const g of m.values()) {
    g.entries.sort((a, b) => b.t - a.t || b.seq - a.seq)
    const top = g.entries[0]!
    g.title = withDay(top.title, top.date, week)
    g.t = top.t; g.seq = top.seq
    g.fresh = g.entries.some(e => e.fresh)
    g.one = g.entries.length === 1
  }
  return [...m.values()].sort((a, b) => b.t - a.t || b.seq - a.seq)
}
/* Group by Who draws each line item-first too — a move ONCE, under the item he reached (D345 (6)) */
export function whoEntry(l: CLine, week: boolean, days?: string[]): Entry {
  const e = entriesOf(l, days)[0]!
  return { ...e, title: withDay(e.title, e.date, week) }
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
/* ONE DAY'S COUNTS for the day's chip (ui/html.ts dayStatHTML — drawn on every render of every day heading), memoised
   on everything that can change them: the history (its next number and its length — a sweep shortens it), the seen
   record, the loaded week and who is looking */
let MEMO = { k: '', v: {} as Record<string, { fresh: number; all: number }>, week: -1 }
const memoKey = () => `${ELOG.next}|${ELOG.rows.length}|${SEEN_VER}|${CURWEEK}|${me() || ''}`
export function chgDayCounts(di: number): { fresh: number; all: number } {
  const k = memoKey()
  if (MEMO.k !== k) MEMO = { k, v: dayCounts(), week: -1 }
  const d = weekDates(CURWEEK)[+di]
  return (d && MEMO.v[d]) || { fresh: 0, all: 0 }
}

/* the admin's icon: what is new to you across the loaded week, a line once. Read on every render of the top bar, so the
   everyday reading (who is looking now) is kept with the chips' counts (Fable's final read, F6); a test's own reading
   is worked out fresh. */
export function weekNew(isNew?: IsNew): number {
  if (isNew) return linesFor(weekDates(CURWEEK), isNew).filter(l => l.fresh).length
  const k = memoKey()
  if (MEMO.k !== k) MEMO = { k, v: dayCounts(), week: -1 }
  if (MEMO.week < 0) MEMO.week = linesFor(weekDates(CURWEEK)).filter(l => l.fresh).length
  return MEMO.week
}
/* the rows of the loaded week, for the window's "Mark all as seen" and the chip's memo */
export const weekRows = () => elogWeekRows(CURWEEK)

/* ---- THE OG TAG'S PLACES ([DRAFT-PENDING] — the owner's D172; Astra DP-11) ----
   The positional keys of the pucks, on the loaded week's days NOT yet published, whose place holds a change new to the
   person looking: a man put on a place (or moved onto it); a man taken off leaves no puck and no tag (the chip and the
   window carry that). Built once per change of anything it reads, then a set lookup per puck — alAttr is the hot paint
   path.
   The set holds the history's own ROW-ANCHORED keys (the rid form every line is stored in), and each puck's place is
   translated to that form as it is drawn — so a row dragged above another carries its tag with it. It used to hold
   the places as they stood when the set was built, and a reorder writes no line to rebuild it: the tag stayed where the
   row had been, on whoever slid in (Fable's scenario design, P1). And a LOOK at a version or a saved plan wears none —
   a preview reads a document, not your news (P4). */
let OG = { ver: -1, next: -1, len: -1, wk: '', who: '', ap: '', set: new Set<string>() }
function ogSet(): Set<string> {
  const who = me() || ''
  /* …and on which days are published (a published day wears no tag), not only on the lines a publish happens to write
     (Fable's final read, F8) */
  const ap = approvedDays().join(',')
  if (OG.ver === SEEN_VER && OG.next === ELOG.next && OG.len === ELOG.rows.length && OG.wk === CURWEEK && OG.who === who && OG.ap === ap) return OG.set
  const set = new Set<string>()
  if (who) {
    const days = weekDates(CURWEEK)
    for (const l of linesFor(days)) {
      if (!l.fresh || !l.key || !isPersonKey(l.key) || l.date == null) continue
      const di = days.indexOf(l.date)
      if (di < 0 || dayApproved(di)) continue
      const on = l.rows.find(r => r.key === l.key)
      if (!on || !on.to || on.to === '—') continue
      set.add(String(l.key))
    }
  }
  OG = { ver: SEEN_VER, next: ELOG.next, len: ELOG.rows.length, wk: CURWEEK, who, ap, set }
  return set
}
HOOKS.newToMe = (key: any) => {
  const s = ogSet()
  if (!s.size || inVersionLook() || !isPersonKey(String(key))) return false   // a text box never holds a man (F6)
  return s.has(String(ridKey(key, DAYS)))
}
