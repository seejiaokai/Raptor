/* THE LOADING CLAW's way out (D1591, D1605). index.html draws the claw from the first page alone, so it shows before
   the app's code arrives; this takes it away the moment the app has drawn itself — a 0.2s fade (its transition in
   index.html), or at once for a reader who asked for less motion — never waiting for the round to finish, so the
   claw adds nothing to the load. Called once the app's first render has painted (main.tsx), and when the boot fails,
   so its message is never hidden under the claw. Safe to call twice, or with no claw on the page. */
export const BOOTCLAW_FADE_MS = 220

export function dismissBootClaw(): void {
  const el = document.getElementById('bootclaw')
  if (!el || el.classList.contains('gone')) return
  const still = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (still) { el.remove(); return }
  el.classList.add('gone')
  window.setTimeout(() => el.remove(), BOOTCLAW_FADE_MS)
}
