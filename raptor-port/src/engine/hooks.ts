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
