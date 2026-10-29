/* HOLIDAYS BY FILE — THE SHEET (owner D1501, 29 Oct 26 — "All as recommended"; his D1155: "the only way to import data
   is through a file … export a file format that the app uses to fill in the public holidays … I hand this file, maybe
   excel to an AI to help me fill in Singapore holidays and then I import into the app"). Pure: the rows Export sheet
   writes (the Calendar window's Holidays list writes them with the app's one CSV writer, ui/export.ts — its byte-order
   mark for Excel and its guard against a cell a spreadsheet would run as a formula), and every row Import sheet reads,
   as a holiday or as "not read" with how to put it right. Public holidays and Off days only (D1501).

   THE FILE (the M5 plan §4 — the builder's call): a plain spreadsheet file the app writes and reads itself, no library.
   Columns From, To, Name, Kind, On grid. Read leniently, because a spreadsheet re-saves what it opens:
   - the header row is found by its words, in any order and any case; a sheet with no header is read in that order;
   - a byte-order mark and blank rows are skipped; commas, or semicolons or tabs where the first row uses them;
   - dates as 2026-08-09; a day-first date, as a spreadsheet saves one in Singapore (9/8/2026, 09/08/26); a month by its
     name (9 Aug 2026, 9-Aug-26). Anything else — a date with no year among them — is not read, and the line says how to
     write it, giving the sheet's year in its example. Reading 9/8 as 9 August is the agent's reading, named at his look.
   - Kind PH, Public holiday, Off day or Off (any case); To empty is one day; On grid as the Holidays form's rule.
   Row numbers are the spreadsheet's own, the header row being row 1. */
import { normShort, SHORT_RULE } from './eventshort'
import { MAX_HOLIDAY_NAME, validDate, type HolidayDraft, type HolidayKind } from './holidays'

export const SHEET_HEAD = ['From', 'To', 'Name', 'Kind', 'On grid']

/** the sheet's rows for these holidays, the header first — every value written as text the reader takes back */
export function holidaySheetRows(lines: ReadonlyArray<{ from: string; to: string; name: string; kind: HolidayKind; short?: string }>): string[][] {
  return [SHEET_HEAD, ...lines.map(l => [l.from, l.to, l.name, l.kind === 'ph' ? 'PH' : 'Off day', l.short ?? ''])]
}

/** one row of the sheet read: a holiday to add (`draft`), or not read and why (`why`, a sentence naming its row) */
export interface SheetRow { row: number; name: string; draft?: HolidayDraft; why?: string }

/* ---- the cells ----------------------------------------------------------------------------------------------------- */

/** the sheet's rows of cells, a quoted cell's commas, quotes and line breaks kept as written */
function cellsOf(text: string): string[][] {
  const t = text.replace(/^﻿/, '')
  /* the separator is read from the first line holding anything — a spreadsheet may save blank rows above the header */
  const first = t.split(/\r?\n/).find(l => /[^\s,;\t]/.test(l)) ?? ''
  const count = (c: string) => first.split(c).length - 1
  const sep = [',', ';', '\t'].reduce((a, c) => (count(c) > count(a) ? c : a), ',')
  const rows: string[][] = []
  let row: string[] = [], cell = '', quoted = false
  for (let i = 0; i < t.length; i++) {
    const ch = t[i]!
    if (quoted) {
      if (ch === '"' && t[i + 1] === '"') { cell += '"'; i++ }
      else if (ch === '"') quoted = false
      else cell += ch
      continue
    }
    if (ch === '"' && cell.trim() === '') { quoted = true; cell = ''; continue }
    if (ch === sep) { row.push(cell); cell = ''; continue }
    if (ch === '\r' && t[i + 1] === '\n') continue
    if (ch === '\n' || ch === '\r') { row.push(cell); rows.push(row); row = []; cell = ''; continue }
    cell += ch
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  return rows
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
const year4 = (y: string) => (y.length === 2 ? 2000 + +y : +y)

/** the date a cell holds, as yyyy-mm-dd, or null */
function dateOf(cell: string): string | null {
  const c = cell.trim()
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(c)
  let out: string | null = null
  if (m) out = iso(+m[1]!, +m[2]!, +m[3]!)
  else if ((m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/.exec(c))) out = iso(year4(m[3]!), +m[2]!, +m[1]!)
  else if ((m = /^(\d{1,2})[\s-]+([A-Za-z]{3,9})[\s,-]+(\d{2}|\d{4})$/.exec(c))) {
    const mo = MONTHS.indexOf(m[2]!.slice(0, 3).toLowerCase())
    if (mo >= 0) out = iso(year4(m[3]!), mo + 1, +m[1]!)
  }
  return out && validDate(out) ? out : null
}

/** how to write a date the reader could not read: a day-first guess with the sheet's year, else the pattern */
function howToWrite(cell: string, year: number): string {
  const m = /^(\d{1,2})[/.-](\d{1,2})$/.exec(cell.trim())
  if (m) {
    const g = iso(year, +m[2]!, +m[1]!)
    if (validDate(g)) return `Write it as ${g}.`
  }
  return `Write it as year-month-day, like ${year}-11-08.`
}

const KINDS: Record<string, HolidayKind> = { ph: 'ph', 'public holiday': 'ph', 'off day': 'off', off: 'off' }
/* a name Export wrote after a "'" so a spreadsheet would not run it as a formula — the "'" comes off again */
const unguard = (s: string) => (/^'[=+\-@\t\r]/.test(s) ? s.slice(1) : s)

/* ---- the rows ------------------------------------------------------------------------------------------------------ */

export function readHolidaySheet(text: string): SheetRow[] {
  const rows = cellsOf(text)
  if (!rows.length) return []
  /* the header, by its words; none: the sheet's own order */
  const key = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')
  /* the header is the first row holding anything (blank rows above it keep their numbers) */
  const top = rows.findIndex(r => r.some(c => c.trim() !== ''))
  if (top < 0) return []
  const head = rows[top]!.map(key)
  const hasHead = head.includes('from')
  const col = (names: string[], at: number) => {
    if (!hasHead) return at
    return head.findIndex(h => names.includes(h))
  }
  const ix = { from: col(['from'], 0), to: col(['to'], 1), name: col(['name'], 2), kind: col(['kind'], 3), short: col(['on grid', 'ongrid', 'short'], 4) }
  const cell = (r: string[], i: number) => (i >= 0 ? (r[i] ?? '').trim() : '')
  /* the sheet's year — the one most of its readable first days fall in — for the example in a "write it as" */
  const years = rows.slice(hasHead ? top + 1 : 0).map(r => dateOf(cell(r, ix.from))).filter(Boolean).map(d => +d!.slice(0, 4))
  /* each year counted once (the security read, 29 Oct 26: a sort that re-counted on every comparison froze the page on a
     sheet of thousands of rows) — the most common wins, the first met on a tie */
  const tally = new Map<number, number>()
  for (const y of years) tally.set(y, (tally.get(y) ?? 0) + 1)
  const year = tally.size ? [...tally].reduce((a, b) => (b[1] > a[1] ? b : a))[0] : new Date().getUTCFullYear()

  const out: SheetRow[] = []
  rows.forEach((r, i) => {
    if (hasHead && i === top) return
    if (r.every(c => c.trim() === '')) return
    const row = i + 1
    const name = unguard(cell(r, ix.name)).replace(/\s+/g, ' ')
    const not = (why: string) => out.push({ row, name, why: `Row ${row}: ${why}` })
    const fromCell = cell(r, ix.from), toCell = cell(r, ix.to)
    const from = dateOf(fromCell)
    if (!from) return not(`the date “${fromCell}” cannot be read. ${howToWrite(fromCell, year)}`)
    const to = toCell === '' ? from : dateOf(toCell)
    if (!to) return not(`the date “${toCell}” cannot be read. ${howToWrite(toCell, year)}`)
    if (to < from) return not('its last day is before its first.')
    const kindCell = cell(r, ix.kind)
    if (!kindCell) return not('say what it is. Write PH or Off day.')
    const kind = KINDS[key(kindCell)]
    if (!kind) return not(`the kind “${kindCell}” is not one the sheet takes. Write PH or Off day.`)
    if (name.length > MAX_HOLIDAY_NAME) return not(`the name is longer than ${MAX_HOLIDAY_NAME} letters.`)
    const shortCell = cell(r, ix.short)
    if (shortCell && !normShort(shortCell)) return not(SHORT_RULE)
    const draft: HolidayDraft = { kind, name, from, to, ...(shortCell ? { short: normShort(shortCell)! } : {}) }
    out.push({ row, name, draft })
  })
  return out
}
