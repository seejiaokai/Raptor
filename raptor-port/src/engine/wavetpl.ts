import { store } from './hooks'
import { parseHM, hmOK, hhmm } from './time'
import { SAWAVE } from './waves'

/* THE SQUADRON'S FLYING-WAVE TEMPLATES (owner, 25 Aug 26). The sibling of the
   duty-block templates (engine/dutytpl.ts): "+ Wave" offers these alongside its
   four built-in kinds, so a scheduler saves a wave they build often — a 4-ship
   BFM go, a standby package — and drops it onto any day in one tap.

   A template is {id,title,kind,lines}. `kind` is the RULE-SET the placed wave
   follows, and it is exactly one of the four the app already checks waves by
   (owner chose one-rule-per-template): 'fly' is an ordinary flying wave (counts
   toward the day's flying tally, fully conflict-checked); 'sc'/'avalon'/'bb' are
   the standalone standby kinds (SAWAVE in engine/waves.ts), which sit outside the
   flying count and are exempt from cross-checking to the same degree makeStandalone
   gives them — AVALON/BB whole, SC on its SPARE lines only. Each LINE is a flying
   line {cs,msn,to,ld} plus a MAIN/SPARE flag that matters only on a standby kind
   (it drives saExempt exactly as a hand-flipped line does).

   Placing a template COPIES its lines onto the day (waveFromTpl), so later edits to
   the library never reach a wave already on a board, and vice-versa. Nothing in
   validate.ts reads a template — it only mints an ordinary wave whose own kind flags
   decide its checking, so the seed week and the reference-parity gate see nothing
   new. Persisted with save/load/reset like the stores list, the duty templates and
   `rules`, so it lives in the engine and the UI stays a builder. */

export type WaveKind = 'fly' | 'sc' | 'avalon' | 'bb'
export const WAVE_KINDS: readonly WaveKind[] = ['fly', 'sc', 'avalon', 'bb']
export type WaveTplLine = { cs: string; msn: string; to: string; ld: string; spare: boolean }
export type WaveTpl = { id: string; title: string; kind: WaveKind; lines: WaveTplLine[] }

export const MAX_WTPL = 24, MAX_WTITLE = 24, MAX_WLINES = 24, MAX_CS = 12, MAX_MSN = 24

/* the picker's four built-ins carry stable keys so the Admin show/hide list can
   address them beside a template's own id; a template's key IS its id. */
export const WAVE_BUILTIN: readonly { key: WaveKind; label: string }[] = [
  { key: 'fly', label: 'Flying wave' }, { key: 'sc', label: 'SC' },
  { key: 'avalon', label: 'AVALON' }, { key: 'bb', label: 'BB' },
]
/* a standby kind whose line carries a genuine MAIN/SPARE distinction; 'fly' does
   not, so its editor hides the flip and every minted line is a plain MAIN. */
export function kindIsStandby(k: WaveKind) { return k === 'sc' || k === 'avalon' || k === 'bb' }
export function kindLabel(k: WaveKind) { return WAVE_BUILTIN.find(b => b.key === k)?.label || 'Flying wave' }
/* the one-line rule-set note the editor prints under the kind picker. It USED to
   reuse the "+ Wave" popup's SAWAVE.note verbatim, but the two describe different
   things and were deliberately split (owner, 30 Aug 26 — "that's misleading … MAIN
   SC and SPARE SC will just use those existing rules independently despite how many
   lines I create"): the popup's built-in wave really does come up 2 MAIN + 2 SPARE
   (makeStandalone), so its note names that count; a TEMPLATE's line count is
   whatever the owner builds, so a fixed count here read as a limit. These notes
   describe only the RULE each kind applies per line, count-free, verified against
   validate.ts / events.ts — fly: counts toward the tally, fully cross-checked;
   sc: a SPARE is canSpare (overseas + the medical group) + SC currency only, a MAIN
   in full; avalon: every seat canSpare only (the one look, MAIN and SPARE alike, no
   currency/rest/clash); bb: nothing checked at all (not even collected into sacrew).
   SAWAVE.note keeps its count for the popup; when a kind's checking rule changes,
   update BOTH. */
export function kindNote(k: WaveKind): string {
  switch (k) {
    case 'sc': return 'A SPARE line is only checked for overseas / medically down and SC currency — nothing else. A MAIN line is checked in full. Add as many of each as you need.'
    case 'avalon': return 'Overnight. Every line — MAIN or SPARE — is only checked for overseas / medically down, nothing else. Add as many as you need.'
    case 'bb': return 'Times are yours to set. Nothing on a BB line is cross-checked at all. Add as many as you need.'
    default: return 'An ordinary flying wave — it counts toward the day’s flying tally, and every line is fully cross-checked.'
  }
}

/* a flying/duty time is a clock time or nothing; a malformed value drops to ''.
   Stored with the colon (07:00, matching makeStandalone and the board's own
   to/ld cells) — and since 30 Aug 26 tplTime folds the same way, so wave and
   duty templates share one form and there is no deliberate difference left.
   Folded here so both crossings out of the
   editor — minted into a day (waveFromTpl) and reloaded from untrusted storage
   (waveTplLoad) — normalise the same way, and neither can carry a nonsense time
   onto the schedule. */
export function waveTime(v: any): string {
  const s = String(v == null ? '' : v).trim()
  const m = s && hmOK(s) ? parseHM(s) : null
  return m == null ? '' : hhmm(m)
}

const mkLine = (cs = '', msn = '', to = '', ld = '', spare = false): WaveTplLine => ({ cs, msn, to, ld, spare })
const cloneLine = (l: WaveTplLine): WaveTplLine => ({ ...l })
const clone = (t: WaveTpl): WaveTpl => ({ id: t.id, title: t.title, kind: t.kind, lines: t.lines.map(cloneLine) })

/* No user templates ship by default — the picker's four built-in kinds are the
   baseline, and a template is a scheduler's own saved shape. So the library starts
   EMPTY and the editor's empty state invites the first one; "reset" returns to
   empty. (Duty templates seed three because they REPLACED the retired auto-desks;
   waves have no such history — the built-ins already stand on their own.) */
export let WAVETPL_CFG: WaveTpl[] = []

/* an incrementing suffix, not Math.random / Date.now — deterministic under test.
   waveTplLoad bumps it past any 'wN' id it restores so a fresh add cannot collide
   with one, exactly as the duty-template loader does. */
let SEQ = 0
const newId = () => 'w' + (++SEQ)

export function waveTplAreDefault() { return WAVETPL_CFG.length === 0 }

export function addWaveTpl(title = 'New wave', kind: WaveKind = 'fly'): WaveTpl | null {
  if (WAVETPL_CFG.length >= MAX_WTPL) return null
  const t: WaveTpl = {
    id: newId(), title: String(title).slice(0, MAX_WTITLE) || 'New wave',
    kind: WAVE_KINDS.includes(kind) ? kind : 'fly', lines: [mkLine()],
  }
  WAVETPL_CFG.push(t)
  return t
}

export function delWaveTpl(id: string): boolean {
  const i = WAVETPL_CFG.findIndex(t => t.id === id)
  if (i < 0) return false
  WAVETPL_CFG.splice(i, 1)
  WAVEHIDE.delete(id)          // a deleted template drops any show/hide setting with it
  return true
}

export function renameWaveTpl(id: string, title: string): boolean {
  const t = WAVETPL_CFG.find(t => t.id === id)
  if (!t) return false
  t.title = String(title).slice(0, MAX_WTITLE)
  return true
}

/* changing a template's rule-set is a real product action — a fly wave becoming a
   standby package, or back. The lines are kept (a MAIN/SPARE flag simply stops
   mattering on 'fly'); only the kind flips. */
export function setWaveTplKind(id: string, kind: WaveKind): boolean {
  const t = WAVETPL_CFG.find(t => t.id === id)
  if (!t || !WAVE_KINDS.includes(kind)) return false
  t.kind = kind
  if (kind === 'fly') t.lines.forEach(l => { l.spare = false })   // no MAIN/SPARE on an ordinary wave
  return true
}

export function moveWaveTpl(from: number, to: number): boolean {
  const n = WAVETPL_CFG.length
  if (!Number.isInteger(from) || !Number.isInteger(to)) return false
  if (from < 0 || from >= n || to < 0 || to >= n) return false
  const [row] = WAVETPL_CFG.splice(from, 1)
  WAVETPL_CFG.splice(to, 0, row!)
  return true
}

export function addWaveTplLine(id: string): boolean {
  const t = WAVETPL_CFG.find(t => t.id === id)
  if (!t || t.lines.length >= MAX_WLINES) return false
  t.lines.push(mkLine())
  return true
}

export function delWaveTplLine(id: string, li: number): boolean {
  const t = WAVETPL_CFG.find(t => t.id === id)
  if (!t || !t.lines[li]) return false
  t.lines.splice(li, 1)
  return true
}

export function setWaveTplLine(id: string, li: number, field: 'cs' | 'msn' | 'to' | 'ld' | 'spare', val: any): boolean {
  const t = WAVETPL_CFG.find(t => t.id === id)
  if (!t) return false
  const l = t.lines[li]
  if (!l) return false
  if (field === 'cs') l.cs = String(val).slice(0, MAX_CS)
  else if (field === 'msn') l.msn = String(val).slice(0, MAX_MSN)
  /* bounded like cs/msn — the raw keystroke value persists until blur
     normalises it through waveTime, so an unclamped paste rode every
     per-keystroke save into storage (26 Aug 26 bug pass) */
  else if (field === 'to' || field === 'ld') l[field] = String(val).slice(0, 12)
  else if (field === 'spare') l.spare = kindIsStandby(t.kind) ? !!val : false
  else return false
  return true
}

export function moveWaveTplLine(id: string, from: number, to: number): boolean {
  const t = WAVETPL_CFG.find(t => t.id === id)
  if (!t) return false
  const n = t.lines.length
  if (!Number.isInteger(from) || !Number.isInteger(to)) return false
  if (from < 0 || from >= n || to < 0 || to >= n) return false
  const [row] = t.lines.splice(from, 1)
  t.lines.splice(to, 0, row!)
  return true
}

/* one aircraft row, shaped like the seed's — a standby line carries the spare/role
   the rule engine reads (saExempt), a fly line carries neither. */
const mkAircraft = (standby: boolean, spare: boolean): any => {
  const a: any = { p: '', w: '', area: '', rmks: '', opts: {} }
  if (standby) { a.spare = !!spare; a.role = spare ? 'SPARE' : 'MAIN' }
  return a
}

/* mint a real wave from a template — the one thing "+ Wave" asks for. The kind's
   own flags (standalone/noconf/night/kind) decide how validate.ts treats it, exactly
   as makeStandalone/addWave set them; only the LINES are the template's. Times are
   normalised through waveTime so a stored nonsense value never reaches the board.
   A fly wave CARRIES THE TEMPLATE'S TITLE as its label (addWaveFromTpl, board.ts,
   keeps it deliberately — the label the wave carries is the template's own); a
   standby wave keeps its kind label. The board's Go dropdown passes a non-"WAVE N"
   label through verbatim (board-html.ts labelToTitle), so the title survives. */
export function waveFromTpl(id: string): any | null {
  const t = WAVETPL_CFG.find(t => t.id === id)
  if (!t) return null
  const standby = kindIsStandby(t.kind)
  const S = standby ? SAWAVE[t.kind] : null
  const lines = t.lines.length ? t.lines : [mkLine()]
  /* A STANDBY template mints the built-in's SHAPE (owner, 26 Aug 26 — closing
     HANDOFF's "structurally lighter" seam): consecutive lines naming the same
     shift (cs + msn + times) become ONE formation carrying a crew row per line,
     exactly how makeStandalone packs MAIN/SPARE under a shift. The old 1:1
     line→formation mint undercounted the day badge (waves.ts sn is max
     non-spare PER FORMATION, so a two-MAIN template SC read "/ 1" against the
     built-in's "/ 2") and no hand-built SC template could reproduce
     + Wave → SC. Grouping is consecutive-only so the author's line order is
     the formation order; a fly line stays one aircraft — that is what it is. */
  let formations: any[]
  if (standby) {
    formations = []
    let last: any = null, lastKey = ''
    for (const l of lines) {
      const to = waveTime(l.to), ld = waveTime(l.ld)
      const key = `${l.cs}|${l.msn}|${to}|${ld}`
      if (last && key === lastKey) { last.aircraft.push(mkAircraft(true, l.spare)); continue }
      last = { cs: l.cs, msn: l.msn, shift: l.msn, to, ld, aircraft: [mkAircraft(true, l.spare)] }
      lastKey = key
      formations.push(last)
    }
  } else {
    formations = lines.map(l => ({
      cs: l.cs, msn: l.msn,
      to: waveTime(l.to), ld: waveTime(l.ld),
      aircraft: [mkAircraft(false, l.spare)],
    }))
  }
  return {
    label: standby ? (S?.label || t.title) : t.title,
    kind: standby ? t.kind : undefined,
    standalone: standby,
    noconf: standby ? !!S?.all : false,
    night: standby ? t.kind !== 'sc' : false,
    intimes: [], traffic: [],
    formations,
  }
}

/* ---- SHOW / HIDE, the Admin control (owner, 25 Aug 26). The "+ Wave" popup shows
   every built-in kind and every template unless it is hidden here; Admin toggles
   each. A Set of hidden keys (built-in kind key or template id) — default EMPTY, so
   everything shows until an admin curates it. Kept beside the templates because a
   deleted template must drop its hide flag too (delWaveTpl above), and both persist
   together on the same seam. */
export const WAVEHIDE = new Set<string>()
export function isWaveHidden(key: string) { return WAVEHIDE.has(key) }
export function setWaveHidden(key: string, on: boolean) { if (on) WAVEHIDE.add(key); else WAVEHIDE.delete(key) }
export function shownBuiltins() { return WAVE_BUILTIN.filter(b => !WAVEHIDE.has(b.key)) }
export function shownTemplates() { return WAVETPL_CFG.filter(t => !WAVEHIDE.has(t.id)) }

/* the library and its hide-set are stored as wholes, only when they deviate — an
   all-shown, no-template baseline writes nothing at all, matching the stores/duty
   idiom. Two keys, one save call, so a UI change never persists half the state. */
export function waveTplSave() {
  store.set('wavetpl', WAVETPL_CFG.length ? WAVETPL_CFG.map(clone) : null)
  store.set('wavehide', WAVEHIDE.size ? [...WAVEHIDE] : null)
}

/* Storage is hand-editable, so untrusted (the scar every list loader here carries).
   Every field is type-checked and clamped; a template with no lines array is dropped,
   a bad line skipped, a bad kind coerced to 'fly'. SEQ is advanced past every restored
   'wN' id BEFORE any id is minted, so an id-less entry can never take one a later entry
   also claims (the duty loader's 18 Aug bug, avoided the same way). */
export function waveTplLoad() {
  const raw = store.get('wavetpl', null)
  const out: WaveTpl[] = []
  if (Array.isArray(raw)) for (const t of raw) {
    const id = (t as any)?.id
    const m = typeof id === 'string' ? /^w(\d+)$/.exec(id) : null
    if (m) SEQ = Math.max(SEQ, +m[1]!)
  }
  if (Array.isArray(raw)) for (const t of raw) {
    if (out.length >= MAX_WTPL) break
    if (!t || typeof t !== 'object' || !Array.isArray((t as any).lines)) continue
    /* an id seen twice (hand-edited storage) gets a fresh one, or delete/
       rename/hide would only ever address the first wearer (26 Aug 26 pass) */
    let id = typeof (t as any).id === 'string' && (t as any).id ? (t as any).id : newId()
    if (out.some(x => x.id === id)) id = newId()
    const title = typeof (t as any).title === 'string' ? (t as any).title.slice(0, MAX_WTITLE) : ''
    const kind: WaveKind = WAVE_KINDS.includes((t as any).kind) ? (t as any).kind : 'fly'
    const standby = kindIsStandby(kind)
    const lines: WaveTplLine[] = []
    for (const l of (t as any).lines) {
      if (lines.length >= MAX_WLINES) break
      if (!l || typeof l !== 'object') continue
      lines.push({
        cs: typeof l.cs === 'string' ? l.cs.slice(0, MAX_CS) : '',
        msn: typeof l.msn === 'string' ? l.msn.slice(0, MAX_MSN) : '',
        to: waveTime(l.to), ld: waveTime(l.ld),
        spare: standby ? !!l.spare : false,
      })
    }
    out.push({ id, title, kind, lines })
  }
  WAVETPL_CFG = out

  WAVEHIDE.clear()
  const rawH = store.get('wavehide', null)
  const valid = new Set<string>([...WAVE_KINDS, ...WAVETPL_CFG.map(t => t.id)])
  if (Array.isArray(rawH)) for (const k of rawH) if (typeof k === 'string' && valid.has(k)) WAVEHIDE.add(k)
}

/* Clear-all clears the LIBRARY — and only the library's half of the hide-set.
   WAVEHIDE holds two ownership domains: per-template flags (they die with
   their templates, exactly as delWaveTpl drops one) and the four BUILT-IN
   kind flags the Admin page curates. Wiping both used to silently resurface
   a hidden BB in every + Wave menu the day someone cleared the template
   library (26 Aug 26 bug pass) — the Admin's curation is not this button's
   to destroy. */
export function waveTplReset() {
  WAVETPL_CFG = []
  ;[...WAVEHIDE].forEach(k => { if (!WAVE_KINDS.includes(k as any)) WAVEHIDE.delete(k) })
  waveTplSave()
}
