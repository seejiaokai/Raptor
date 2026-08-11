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
