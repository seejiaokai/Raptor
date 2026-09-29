/* [ARCH-STACK] Step 3 — the ONE central undo describer (design §8.2, owner 18 Sep
   26). Reads only what the entry already holds (type, scope, contexts, change
   counts) and returns a short, plain-words label for the undo bubble. A new
   command type gets a correct GENERIC label for free — never a per-feature string
   stored at write time, so it adds no maintenance seam and can never break the
   bubble or cause a data bug. A nicer phrasing for a known action is one optional
   line in the TYPE_PHRASE table below.

   THE CHANGE-RECORDING RE-TEST, B8 (28 Sep 26): the same phrase feeds the button's hover, the bubble and the change
   history's Undo line — one vocabulary (Astra's scenario 25). What it now reads, still only from the entry:
   - a text box — the FACT of which box a `sched.text` wrote (`entry.detail`, the key; [AMEND-SMALL-SEEN] item 2):
     "a take-off time", "a day note", "an area" — never "a note on the schedule" for a time (walker A2-F6);
   - the Leave War — the app's word (never "leave board") and the act: "a bid", "an OIL award", "moving a bid",
     "a Leave War setting", and the stage's own words (D352, `lw.stage`) — walker A2-F1;
   - one input filed on the Inputs page — "a personal input", however it was filed (walker A2-F2);
   - the roster and the settings, now Undo steps ([UNDO-ROSTER-SETTINGS]) — "Hex's quals", "a rule on the Logic
     page", "suspending Outlaw's sign-in" (Fable 3e, S23).

   The bubble prepends "Undid: " / "Redid: "; this returns the bare label. */
import type { UndoEntry } from './types'
import type { Change } from '../command'

/* a person's callsign by id, for the Leave War's records (its ids carry the person, not his name) — installed by the
   app (state/undo-wire.ts), read LIVE when the entry is recorded; null when none is installed (tests). `defaultOf` —
   what a settings record stored as null stands for (the seeded accounts list, accounts.ts), so the first change to a
   never-saved list still says what changed */
let nameOf: (pid: string) => string | null = () => null
let defaultOf: (settingId: string) => any = () => null
export function setDescribeNames(fn: (pid: string) => string | null, dflt?: (settingId: string) => any): void { nameOf = fn; if (dflt) defaultOf = dflt }
const poss = (cs: string | null | undefined) => (cs ? `${cs}’s ` : '')

/* known command types → a specific plain phrase. Optional: any type absent here
   falls back to a safe generic label from its module. */
const TYPE_PHRASE: Record<string, string> = {
  'sched.slot': 'a change to the schedule',
  'sched.fill': 'a change to the schedule',
  'sched.text': 'a note on the schedule',
  'sched.delete': 'a deletion on the schedule',
  'sched.section.move': 'a move on the schedule',
  'sched.section.reorder': 'a reorder on the schedule',
  'sched.approve': 'publishing a day',
  'sched.publishAL': 'publishing an amendment',
  'sched.unpublish': 'taking a published day back',
  'sched.discard': 'clearing a day’s draft changes',
  'sched.sign': 'a sign-off',
  /* NOT "a change to the schedule" ([OIL-UNDO-WORDS], found by driving the app
     22 Sep 26). Taking a man off an event does not move the schedule — the earn
     mode exists so that it cannot — so the generic label contradicted the very
     screen the bubble appeared on. */
  'sched.oil': 'an OIL decision',
  'sched.signClear': 'clearing a sign-off',
  'sched.stores': 'the stores on a jet',
  'sched.warnMute': 'muting a warning',
  'sched.draft.rename': 'renaming a saved plan',
  'sched.draft.delete': 'deleting a saved plan',
  'inputs.write': 'a personal input',
  'inputs.batch': 'a batch of inputs',
  /* the accounts (Admin → Users) — the account-level ones read the change itself, below */
  'account.add': 'giving a sign-in',
  'access.approve': 'giving access',
  'access.decline': 'refusing a request for access',
  'guestview.set': 'the guest switch',
  /* the five D350 keeps out of Undo — named when the greyed button or a bubble speaks of them */
  'person.add': 'adding a person',
  'account.addNew': 'adding a person',
  'access.approveNew': 'adding a person',
  'person.archive': 'archiving a person',
  'person.restore': 'restoring a person',
  'person.delete': 'deleting a person',
  'lw.postout': 'a posting',
  /* the Leave War's gestures (the one-absence commands, [ARCH-STACK] step 4) */
  'lw.decide': 'a decision on a bid',
  'lw.approve': 'approving leave',
  'lw.move': 'moving a bid',
  'lw.decideApproved': 'taking back an approval',
  'lw.removeApproved': 'removing approved leave',
  'lw.moveApproved': 'moving approved leave',
}

/* the settings records, by the page they are edited on */
const SETTING_PHRASE: Record<string, string> = {
  rules: 'a rule on the Logic page',
  qualcols: 'the LoX columns',
  dutytpl: 'a duty template',
  daytpl: 'a day template',
  wavetpl: 'a wave template',
  wavehide: 'showing or hiding a wave',
  secdefault: 'the default arrangement',
  wavedefault: 'the default arrangement',
  lookahead: 'the Inputs look-ahead',
  stores: 'the stores list',
  cxreasons: 'the cancel reasons',
  guestview: 'the guest switch',
  accounts: 'an account',
  accessreqs: 'a request for access',
}

/* a safe generic label from the entry's module, used when the type is unknown. */
function genericLabel(entry: UndoEntry): string {
  switch (entry.scope && entry.scope.module) {
    case 'sched': return 'a change to the schedule'
    case 'inputs': return 'a change to the inputs'
    case 'plan': return 'a change to the plan'
    case 'people': return 'a change on Quals'
    case 'settings': return 'a settings change'
    case 'lw': return 'a change on the Leave War'
    case 'trk': return 'a change to the tracker'
    default: return 'a change'
  }
}

/* ---- a text box, by its key (the slot-key grammar, raptor-port/CLAUDE.md) ---- */
const TIME_WORD: Record<string, string> = {
  to: 'a take-off time', ld: 'a landing time', br: 'a brief time', str: 'a start time', end: 'an end time',
}
export function textLabel(key: string | undefined): string | null {
  if (!key) return null
  const c = key.indexOf(':')
  if (c < 0) return null
  const pre = key.slice(0, c), last = key.slice(c + 1).split('.').pop() || ''
  if ((pre === 'ff' || pre === 'dr' || pre === 'sr' || pre === 'gr' || pre === 'ap') && TIME_WORD[last]) return TIME_WORD[last]
  switch (pre) {
    case 'dn': return 'a day note'
    case 'pn': case 'dtn': case 'sn': case 'gn': return 'a note on the schedule'
    case 'wl': case 'dl': return 'a name on the schedule'
    case 'ff': return last === 'cs' ? 'a flying line’s callsign' : last === 'msn' ? 'a mission' : 'a flying line’s details'
    case 'fr': return 'a remark on a flying line'
    case 'dr': case 'sr': case 'gr': case 'ap': return 'a detail on the schedule'
    case 'it': return 'an in-time'
    case 'st': return 'the stores on a jet'
    case 'ar': return 'an area'
    case 'at': return 'an area time'
    default: return null
  }
}

/* ---- the Leave War (walker A2-F1; D352) ---- */
const STAGE_TO: Record<string, string> = {
  open: 'opening bidding', closed: 'closing bidding', published: 'publishing the war', draft: 'taking the war back to a draft',
}
function stageOf(v: any): string | null { return v && typeof v.stage === 'string' ? v.stage : null }
function stageMove(entry: UndoEntry): { from: string | null; to: string | null } | null {
  /* a move needs a war on both sides — a new war (no before) starts at draft and is no step back (Fable's final read, F1) */
  const w = entry.forward.find(c => c.collection === 'lw.war' && c.before && c.after)
  if (!w) return null
  const from = stageOf(w.before), to = stageOf(w.after)
  return from !== to ? { from, to } : null
}
const ORDER = ['draft', 'open', 'closed', 'published']
function stageLabel(entry: UndoEntry): string | null {
  const m = stageMove(entry)
  if (!m || !m.to) return null
  /* a step BACK (the ← button) says so: closed → open is "reopening bidding" */
  if (m.from && ORDER.indexOf(m.to) < ORDER.indexOf(m.from))
    return m.to === 'open' ? 'reopening bidding' : m.to === 'closed' ? 'taking the war back to Bidding closed' : STAGE_TO[m.to] || 'a stage change on the Leave War'
  return STAGE_TO[m.to] || 'a stage change on the Leave War'
}
/* what the stage IS after an undo or a redo — D352: the bubble says it opened or closed for everyone */
const STAGE_NOW: Record<string, string> = {
  open: 'bidding is open again for everyone', closed: 'bidding is closed for everyone', published: 'the war is published',
  draft: 'the war is a draft again',
}
function listOf(v: any): any[] { return Array.isArray(v) ? v : [] }
function lwCellLabel(entry: UndoEntry): string | null {
  const cells = entry.forward.filter(c => c.collection === 'lw.cell')
  if (!cells.length) return null
  const pid = (() => { const p = cells[0].id.split(':'); return p.length >= 3 ? p[p.length - 2] : '' })()
  const who = cells.every(c => { const p = c.id.split(':'); return p[p.length - 2] === pid }) ? nameOf(pid) : null
  let added = { req: 0, cred: 0 }, removed = { req: 0, cred: 0 }
  for (const c of cells) {
    const b = listOf(c.before), a = listOf(c.after)
    const ids = (l: any[], k: string) => new Set(l.filter(r => r && r.kind === k).map(r => r.id))
    const bR = ids(b, 'request'), aR = ids(a, 'request'), bC = ids(b, 'credit'), aC = ids(a, 'credit')
    for (const id of aR) if (!bR.has(id)) added.req++
    for (const id of bR) if (!aR.has(id)) removed.req++
    for (const id of aC) if (!bC.has(id)) added.cred++
    for (const id of bC) if (!aC.has(id)) removed.cred++
  }
  if (added.cred && !added.req && !removed.req) return who ? `${who}’s OIL award` : 'an OIL award'
  if (removed.cred && !added.req && !removed.req && !added.cred) return who ? `removing ${who}’s OIL award` : 'removing an OIL award'
  if (added.req && !removed.req) return who ? `${who}’s bid` : 'a bid'
  if (removed.req && !added.req) return who ? `removing ${who}’s bid` : 'removing a bid'
  return who ? `${who}’s leave` : 'leave on the Leave War'
}
function lwLabel(entry: UndoEntry): string {
  if (entry.type === 'lw.stage') return stageLabel(entry) || 'a stage change on the Leave War'
  if (TYPE_PHRASE[entry.type]) return TYPE_PHRASE[entry.type]
  const colls = new Set(entry.forward.map(c => c.collection))
  const cell = lwCellLabel(entry)
  if (cell) return cell
  /* approved leave lives as ONE input (the absence record), not a war record — the war's own delete of it names the man
     and the leave (the picture check, walk G4: it read "a change on the Leave War") */
  const rows = entry.forward.filter(c => c.collection === 'inputs' && c.id !== '__order')
  if (rows.length) {
    const r: any = rows[0].before || rows[0].after || {}
    const who = rows.every(c => ((c.before || c.after || {}) as any).person === r.person) && r.person ? nameOf(String(r.person)) : null
    const what = r.type ? String(r.type) : 'leave'
    const gone = rows.every(c => c.before && !c.after)
    return who ? `${gone ? 'removing ' : ''}${who}’s ${what}` : gone ? 'removing leave on the Leave War' : 'leave on the Leave War'
  }
  if (colls.has('lw.config')) return 'a Leave War setting'
  if (colls.has('lw.balances')) return 'an opening balance'
  if (colls.has('lw.oilpolicy')) return 'the OIL policy'
  if (colls.has('lw.ledger')) {
    /* an OIL AWARD — a ledger entry, however it was given ([OIL-AWARD-IS-A-GRANT]) — by its own name, as the grid's
       award was before (per entry since the ledger went into small pieces) */
    const led = entry.forward.filter(c => c.collection === 'lw.ledger')
    const isAward = (e: any) => e && e.counter === 'oil' && +e.amount > 0
    if (led.length && led.every(c => isAward(c.after ?? c.before))) {
      const pids = new Set(led.map(c => String(((c.after ?? c.before) as any).personId)))
      const who = pids.size === 1 ? nameOf([...pids][0]!) : null
      const gone = led.every(c => c.before && !c.after)
      return who ? `${gone ? 'removing ' : ''}${who}’s OIL award` : gone ? 'removing OIL awards' : 'OIL awards'
    }
    return 'an OIL entry'
  }
  const war = entry.forward.find(c => c.collection === 'lw.war')
  if (war && !war.before && war.after) return 'a new Leave War period'
  if (war && war.before && !war.after) return 'deleting a Leave War period'
  if (colls.has('lw.war')) return stageLabel(entry) || 'the war’s dates or name'
  return 'a change on the Leave War'
}

/* ---- the roster (Quals) ---- */
function peopleLabel(entry: UndoEntry): string | null {
  const ps = entry.forward.filter(c => c.collection === 'people')
  if (ps.length !== 1) return ps.length ? 'a change on Quals' : null
  const b: any = ps[0].before, a: any = ps[0].after
  if (!b || !a) return 'a change on Quals'
  const cs = String(b.cs || a.cs || '')
  if (b.cs !== a.cs) return `${cs}’s callsign`
  if (b.q !== a.q) return `${cs}’s CAT`
  if (JSON.stringify(b.quals) !== JSON.stringify(a.quals) || b.san !== a.san || b.sxo !== a.sxo) return `${cs}’s quals`
  if (b.initials !== a.initials) return `${cs}’s initials`
  if (b.flight !== a.flight) return `${cs}’s flight`
  if (b.remarks !== a.remarks) return `${cs}’s remarks`
  return `a change to ${cs} on Quals`
}

/* ---- the accounts (Admin → Users) ---- */
function accountLabel(entry: UndoEntry): string | null {
  const ch = entry.forward.find(c => c.collection === 'settings' && c.id === 'accounts')
  if (!ch || entry.type !== 'account.update') return null
  const b = listOf(ch.before == null ? defaultOf('accounts') : ch.before), a = listOf(ch.after)
  for (const x of a) {
    const y = b.find((z: any) => z && z.id === x.id)
    if (!y || JSON.stringify(y) === JSON.stringify(x)) continue
    const cs = nameOf(x.pid) || x.name
    if ((y.on !== false) !== (x.on !== false)) return x.on === false ? `suspending ${poss(cs)}sign-in` : `enabling ${poss(cs)}sign-in`
    if (y.role !== x.role) return `${poss(cs)}role`
    if (y.name !== x.name) return `${poss(cs)}sign-in name`
    if (y.pid !== x.pid) return 'the callsign an account belongs to'
    return `${poss(cs)}account`
  }
  return 'an account'
}

function inputsCount(entry: UndoEntry): number {
  return entry.forward.filter((c: Change) => c.collection === 'inputs' && c.id !== '__order').length
}

export function describeEntry(entry: UndoEntry): string {
  /* read only what the entry holds — a partial one (no closure yet, a test's) is still described */
  if (!Array.isArray(entry.forward)) entry = { ...entry, forward: [] }
  if (entry.type === 'sched.text') return textLabel(entry.detail) || TYPE_PHRASE['sched.text']
  /* the Inputs calendar's own record (plan/all: its day titles `dm`, its puck rows `pp`), saved through the Inputs page's
     door — with no input row, the change is on the calendar (the walk, R2: a day title read "a personal input") */
  const plan = entry.forward.find((c: Change) => c.collection === 'plan')
  if (plan && inputsCount(entry) === 0) {
    const b: any = plan.before || {}, a: any = plan.after || {}
    const dm = JSON.stringify(b.dm || {}) !== JSON.stringify(a.dm || {}), pp = JSON.stringify(b.pp || []) !== JSON.stringify(a.pp || [])
    return dm && !pp ? 'a day title on the calendar' : pp && !dm ? 'pucks on the calendar' : 'a change to the calendar'
  }
  /* one input filed through the Inputs page's batch door is one input (walker A2-F2) */
  if (entry.type === 'inputs.batch') { const n = inputsCount(entry); return n === 1 ? 'a personal input' : n > 1 ? `${n} inputs` : TYPE_PHRASE['inputs.batch'] }
  if ((entry.scope && entry.scope.module) === 'lw' || entry.type.startsWith('lw.')) return lwLabel(entry)
  const acct = accountLabel(entry); if (acct) return acct
  if (TYPE_PHRASE[entry.type]) return TYPE_PHRASE[entry.type]
  if (entry.type === 'people.edit') return peopleLabel(entry) || genericLabel(entry)
  if (entry.type.startsWith('settings.')) {
    const k = entry.type.slice('settings.'.length)
    return SETTING_PHRASE[k] || 'a settings change'
  }
  return genericLabel(entry)
}

/* the full bubble text for an undo or a redo of `entry`. A stage move says what the war is NOW (D352: "Undid: closing
   bidding — bidding is open again for everyone"), since it changes what every member may do at once. */
export function bubbleText(entry: UndoEntry, dir: 'undo' | 'redo'): string {
  const head = `${dir === 'undo' ? 'Undid' : 'Redid'}: ${entry.label}`
  if (entry.type === 'lw.stage') {
    const m = stageMove(entry)
    const now = m ? (dir === 'undo' ? m.from : m.to) : null
    if (now && STAGE_NOW[now]) return `${head} — ${STAGE_NOW[now]}`
  }
  return head
}
