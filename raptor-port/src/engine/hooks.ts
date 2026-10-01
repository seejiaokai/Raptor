/* ---------------------------------------------------------------------------
   ENGINE HOOKS — the only doorway from the engine back to the world.
   The reference app calls toast/reflow/histPush/renderStatus and reads DOM
   nodes via $() from inside a handful of otherwise DOM-free functions
   (setDayApproved, publishAL, markEdit, validate's header counters). The
   engine keeps those call sites verbatim and routes them here; everything
   defaults to a no-op so the engine runs headless. The app (phase 3/4)
   assigns real implementations.
   --------------------------------------------------------------------------- */
export const HOOKS = {
  toast: (..._a: any[]): any => undefined,
  /* ONE PRESS, ONE MESSAGE ([AMEND-SMALL-SEEN] 1, 28 Sep 26): run `fn`, and every toast raised inside it is said as ONE
     line, in order, when it returns (ui/toast.ts toastBatch). The toast is a single element whose text is replaced, so a
     publish that then raised the OIL check's warning showed only the warning. Scoped on purpose — only a publish uses
     it; every other toast keeps "the last one wins" (a rolled-back save must never read "… removed · That did not save",
     Astra 03). Headless: runs `fn` and nothing more. */
  toastBatch: (fn: () => any): any => fn(),
  reflow: (): void => {},
  histPush: (): void => {},
  renderStatus: (): void => {},
  /* the reference guards `$('nHard')` etc. — outside a browser $ returns null
     and the guards skip, exactly as they do in jsdom before boot */
  $: (_id: any): any => null,
  /* phase-3 additions: the repaint/gesture call sites inside the view-state
     functions (armSlot, placeArmed, histPush/histApply, afterSchedMutate).
     All no-ops headless; the store maps the repaints to its notify(). */
  paintArm: (): void => {},
  renderRosters: (): void => {},
  renderScheduler: (): void => {},
  renderEditWeek: (): void => {},
  /* the ~6s fresh-add box's OWN lifecycle repaint (view.ts flashAdded — its
     fade at 5.45s and its removal at 6s): the decoration pass alone, which
     highlights.ts wires to paintFreshAdds, never a notify(). A full repaint
     here rebuilt the seven day strings a dozen times in one second, ~6s after
     every week load, for a box the week never draws (5 Sep 26). */
  paintFreshAdds: (): void => {},
  renderSchedule: (): void => {},
  renderInputs: (): void => {},
  syncHistBtns: (): void => {},
  /* IS THIS DAY ONE THAT CAN EARN OIL? Only Leave War knows a public holiday
     (its own PH input and the 'off' event tag), and the engine does not import
     state/ or leavewar/ — so the answer arrives as a hook, the way editMode and
     the edit-log name do. Unset, the blind-desk warning below still covers
     Saturday and Sunday from the day's own name; the wire sharpens it to the
     squadron's real non-working days. */
  oilEarningDay: (_di: number): boolean => false,
  /* A DELETED MAN NEVER COMES BACK ON A DAY FROM HIS CUTOFF ([POST-OUT-OUTCOMES], 27 Sep 26 — D297; the plan's Round 2
     belt): a version loaded onto the working copy, or a saved plan switched in, is a whole-day replacement that could
     carry him back. The engine does not import state/, so the delete's module installs the answer here
     (state/person-delete.ts stripDeletedFromDay): it strips every deleted man from the incoming day model and names
     them. Unset (no one ever deleted), nothing is stripped. */
  stripDeleted: (_di: number, _nd: any): string[] => [],
  /* THE DAY A LOAD ONTO THE WORKING COPY WILL LEAVE, worked out ([DB-READINESS] phase 6 (c) — engine/drafts.ts
     dayAsLoadLeaves installs it; publish.ts dayDiscardCount reads it — publish.ts cannot import drafts.ts at module level
     without a loop). Null → the count measures the version's day with D175's leave-out only, as before. */
  dayAsLoadLeaves: null as null | ((di: number, snapDay: any) => any),
  /* THE DAY'S WARNINGS AS ISSUED ([LEAVE-LATE-PUBLISHED], D179 — publish.ts): the validator lends publishing its
     judgement — at issue, the day's slice of the official warnings to keep (`issuedWarn`), and on every read today's
     slice to compare it with (`warnNow`). engine/validate.ts sets both at load (publish.ts cannot import it — the
     validator imports publishing). Null → nothing is frozen and the face reads the official pass, as before. */
  issuedWarn: null as null | ((di: number) => any),
  warnNow: null as null | ((di: number) => any),
  /* THE HIDDEN WARNINGS ([WARN-HIDE-KEPT], owner D469 / D471, 1 Oct 26). `hiddenKeys` — the working copy's hides, as the
     validator reads them (state/view.ts lends its set; the engine cannot import state). `hideNow` — for a published
     day, each warning of today's judgement of the issued day that the working copy also raises, with whether it is
     hidden on the working copy (engine/validate.ts sets it; publish.ts compares it with the version's own hides — its
     pending axis). `setDayHides` — a load onto the working copy puts the day's hides back to the loaded version's
     (state/view.ts; D98). Unset (an engine-only test): nothing is hidden, nothing is compared. */
  /* `validated` — called with each RAW bundle a validate() builds; set only by the test suite's marks guard
     (src/testing/marks-guard.ts), null in the app. */
  validated: null as null | ((raw: any) => void),
  hiddenKeys: null as null | (() => Set<string>),
  hideNow: null as null | ((di: number) => Array<{ k: string, on: boolean, code: string, who: string[], msg: string, sev: string, key?: string }>),
  setDayHides: null as null | ((di: number, keys: string[]) => void),
  /* how many of the working copy's warnings on a day would change their hidden state if the day's hides became `keys` —
     what a load of the version that went out with `keys` replaces (publish.ts dayDiscardCount; validate.ts sets it) */
  hideDiffTo: null as null | ((di: number, keys: string[]) => number),
  /* THE DAY'S REAL DATE, and WHO AN ALL / ALL AVAIL PUCK STANDS FOR — the two
     other facts the OIL evidence block needs and the engine cannot know
     ([OIL-AUTO-REMOVE] §7.1/§7.3, engine/oilev.ts). The date is the week's own
     calendar (state/store.ts owns DATES' year convention); the sentinel's people
     are Leave War's answer (`sync.ts:availableFor`), because a posting window and
     the squadron roster decide half of it. Unset, a day carries no OIL evidence
     and a sentinel stands for nobody — which is exactly how the engine behaved
     before this block existed, so a headless run is unchanged. */
  oilDayISO: (_di: number): string => '',
  /* THE YEAR WHOSE LEAVE WAR PERIOD IS MISSING, or '' when one covers the day
     (owner's ruling D19, 22 Sep 26). A weekend needs no period to COUNT as a
     day that earns — that is the calendar — but the credit can only be written
     into a war that holds the date, so a day outside every period promised
     money nobody could ever be paid. The engine cannot ask a war anything, and
     the year is the war's own fact, so it arrives already named. Unset, nothing
     is ever missing, which is how a headless run behaved before this. */
  oilNoPeriod: (_di: number): string => '',
  oilSentinel: (_iso: string, _win: [number, number], _day: any): string[] => [],
  /* A NEW PERSON'S POST-IN DATE ON THE LEAVE WAR ([ONE-DOOR], owner D308, 27 Sep 26 — "the app should also ask the admin
     when is the post in date so that the leave war is reflected correctly"). The add runs in the roster's command; the
     war's record is the war's, so the war installs this (leavewar/sync.ts) and it enlists the war's store in that same
     command — one step, all or nothing (round 1, Fable F11 / Astra 6), with no import from state/ into the war. Unset
     (a headless run with no war wired), nothing is written. */
  warPostIn: (_txn: any, _id: string, _date: string): void => {},
  isPhone: (): boolean => false,
  editMode: (): boolean => false,
  /* who is making this edit, for the edit log (editlog.ts). It arrives as a
     hook for the same reason editMode does: the name lives in state/auth.ts
     and the engine does not import state/. It is also the ONE seam that has
     to change the day the app gains real accounts — a server-backed session
     returns a person's name here and the log starts naming other people with
     no other edit. Headless, and before login, it is 'Unknown'. */
  whoami: (): string => 'Unknown',
  /* the PERSON behind whoami ([ACCOUNTS], 26 Sep 26): the signed-in person's id, kept
     beside the name on every record that stores a "who" — a callsign rename moves
     nothing, a reused callsign inherits nothing (the one-identity rule). Headless and
     for someone without access: null. */
  whoamiId: (): string | null => null,
  /* THE OG TAG ([DRAFT-PENDING], the owner's D172): does the puck at this (positional) key, on a day NOT yet published,
     hold a change NEW TO the person looking? Per PLACE, never per person (Astra DP-11). The answer is the viewer's
     (the change history and his seen record live in state/ui), so it arrives as a hook — ui/changesmodel.ts installs
     it. Headless, and for nobody signed in: false, so the emitted HTML stays byte-identical. */
  newToMe: (_key: any): boolean => false,
  /* the board's own dialog state (the CX-with-a-reason box, Sort all's
     confirm) lives in ui/board.ts as module `let`s, not here — but
     state/view.ts's closeBoardState() needs to clear them the moment the
     board closes, and state/ does not import ui/ (the layering this repo's
     file map describes: engine -> state -> ui, HOOKS is the one doorway
     back out, same reason it exists for the engine at all). Defaults to a
     no-op headless; SchedBoard.tsx wires the real implementation once, on
     mount, the same way store.ts's wireStore() wires editMode/render*. */
  closeBoardDialogs: (): void => {},
  /* VIEW STATE THAT ADDRESSES ROWS BY KEY has to ride the same renumbering
     the amendment book and the edit log do (keys.ts). This was RMKOPEN — the
     single empty remarks box a phone user asked back — until the owner made
     every remarks box show at all times (16 Aug 26), which retired it. No
     transient view state addresses a board row by key now, so store.ts wires
     this to a no-op; `move` (keys.ts's own mapper — new key, unchanged, or
     null where the row was deleted) is ready again the day one returns. */
  remapViewKeys: (_move: (k: any) => any): void => {},
  /* A newly ADDED row / line / wave / block flashes a blue box for ~6s so a
     scheduler sees exactly what their tap created (owner, 14 Aug 26). Fired
     from markStructuralAdd (publish.ts) — the one choke EVERY board add already
     funnels through, and nothing else calls — so a future add site is covered
     with no extra wiring and a restore / AL replay (which never calls it) does
     not flash. Purely a UI affordance: no-op headless, wired to
     state/view.ts's flashAdded by store.ts. */
  flashAdded: (_key: any): void => {},
  /* THE LOADED WEEK JUST SWAPPED (state/store.ts loadWeek — every caller).
     ui/pan.ts wires this to drop its arrow-burst corridor: the corridor is
     keyed by the CURWEEK string alone, so a calendar round-trip AWAY from a
     week and BACK to it used to revive a stale in-flight target and the first
     arrow press jumped several days (26 Aug 26 bug pass). Same layering story
     as closeBoardDialogs: state/ does not import ui/, HOOKS is the doorway. */
  weekSwapped: (): void => {},
  /* UNDO / REDO JUST REPLACED THE WHOLE MODEL (state/history.ts histApply).
     state/persist.ts wires this to re-persist everything: an undo is a
     change the backend must see, and histApply never calls histPush. */
  histApplied: (): void => {},
}

/* tiny preference store — same guarded semantics as the reference's
   localStorage wrapper, with the backend injected so the engine stays
   DOM-free. `storeBackend.impl` is null headless (get returns the default,
   set is dropped); the app plugs window.localStorage in. */
export const storeBackend: {
  /* `keys` ([DB-READINESS] group A, phase 4): every stored key, in the form getItem takes — a record kept one row per
     thing (a history line, an account) is found by its prefix; a backend without it holds none of those */
  impl: { getItem(k: string): string | null; setItem(k: string, v: string): void; keys?(): string[] } | null
} = { impl: null }

/* [ARCH-STACK] Step 2 phase 3: a dependency-free write seam. The state layer
   installs a hook so every durable settings write (store.set) routes through the
   command gate + change stream, WITHOUT the engine depending on the command
   layer (it stays DOM-/dependency-free) and WITHOUT touching the ~30 UI call
   sites. Null by default => the raw write runs exactly as before (parity/tfin
   728/0 unchanged); the hook, when installed, receives (key, value, raw) and
   decides whether to open a named command or write raw (re-entrancy/unknown
   keys). Only store.set is hooked — reads never open a command. */
type SettingsWriteHook = (k: string, v: any, raw: (k: string, v: any) => void) => void
let SETTINGS_WRITE_HOOK: SettingsWriteHook | null = null
export function setSettingsWriteHook(fn: SettingsWriteHook | null) { SETTINGS_WRITE_HOOK = fn }
function rawStoreSet(k: any, v: any) {
  try { if (storeBackend.impl) storeBackend.impl.setItem('sqn142_' + k, JSON.stringify(v)) } catch (e) {}
}
/* [ARCH-STACK] follow-up #1: the SCHEDULER backstop seam. state/view.ts's
   afterSchedMutate() is the durable-write epilogue for the ~40 board sites that
   mutate the model in place and then repaint. The command layer installs a hook
   here so that epilogue self-wraps in a `sched.mutate` command (capturing the
   preceding board mutation into the change stream), WITHOUT view.ts importing
   the command layer (state/view.ts <- state/sched-commit.ts would be a cycle;
   sched-commit already imports view). Null by default => run raw exactly as
   before (parity/tfin 728/0 unchanged). Same shape as SETTINGS_WRITE_HOOK. */
type SchedEpilogueHook = (raw: () => void) => void
let SCHED_EPILOGUE_HOOK: SchedEpilogueHook | null = null
export function setSchedEpilogueHook(fn: SchedEpilogueHook | null) { SCHED_EPILOGUE_HOOK = fn }
export function runSchedEpilogue(raw: () => void) { if (SCHED_EPILOGUE_HOOK) SCHED_EPILOGUE_HOOK(raw); else raw() }

/* ONE command for a save that writes several settings keys (the change-recording re-test, §11.8 — Fable's red team 7):
   a wave-template save writes the library AND its hide-set, and each bare store.set opened its own command, so one
   save was two Undo steps and one Undo brought a deleted template back still hidden… or not. The state layer installs
   the hook (people-settings-commit.ts), the engine stays free of the command layer; with no hook the body just runs. */
type SettingsGroupHook = (name: string, fn: () => void) => void
let SETTINGS_GROUP_HOOK: SettingsGroupHook | null = null
export function setSettingsGroupHook(fn: SettingsGroupHook | null) { SETTINGS_GROUP_HOOK = fn }
export const store = {
  group(name: string, fn: () => void) { if (SETTINGS_GROUP_HOOK) SETTINGS_GROUP_HOOK(name, fn); else fn() },
  get(k: any, d: any) {
    try {
      const v = storeBackend.impl ? storeBackend.impl.getItem('sqn142_' + k) : null
      return v == null ? d : JSON.parse(v)
    } catch (e) { return d }
  },
  set(k: any, v: any) {
    if (SETTINGS_WRITE_HOOK) SETTINGS_WRITE_HOOK(k, v, rawStoreSet)
    else rawStoreSet(k, v)
  },
  /* every stored key that starts with `prefix`, without the store's own prefix — the rows of a record kept one row per
     thing (`elog:`, `seen:`, `account:` …); none on a backend that cannot list */
  keys(prefix: string): string[] {
    try {
      const all = storeBackend.impl && storeBackend.impl.keys ? storeBackend.impl.keys() : []
      const p = 'sqn142_' + prefix
      return all.filter(k => k.startsWith(p)).map(k => k.slice(7))
    } catch (e) { return [] }
  },
}
