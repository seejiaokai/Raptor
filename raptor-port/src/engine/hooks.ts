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
  isPhone: (): boolean => false,
  editMode: (): boolean => false,
  /* who is making this edit, for the edit log (editlog.ts). It arrives as a
     hook for the same reason editMode does: the name lives in state/auth.ts
     and the engine does not import state/. It is also the ONE seam that has
     to change the day the app gains real accounts — a server-backed session
     returns a person's name here and the log starts naming other people with
     no other edit. Headless, and before login, it is 'Unknown'. */
  whoami: (): string => 'Unknown',
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
}

/* tiny preference store — same guarded semantics as the reference's
   localStorage wrapper, with the backend injected so the engine stays
   DOM-free. `storeBackend.impl` is null headless (get returns the default,
   set is dropped); the app plugs window.localStorage in. */
export const storeBackend: {
  impl: { getItem(k: string): string | null; setItem(k: string, v: string): void } | null
} = { impl: null }

export const store = {
  get(k: any, d: any) {
    try {
      const v = storeBackend.impl ? storeBackend.impl.getItem('sqn142_' + k) : null
      return v == null ? d : JSON.parse(v)
    } catch (e) { return d }
  },
  set(k: any, v: any) {
    try { if (storeBackend.impl) storeBackend.impl.setItem('sqn142_' + k, JSON.stringify(v)) } catch (e) {}
  },
}
