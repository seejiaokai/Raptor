/* THE RE-WALK OF THE DESIGN LOOK'S SMALL FIXES — what dl-cal.mjs and dl-trk.mjs share ([LOOK-13OCT-SMALL-FIXES], owner
   D830). The look's scripts recorded what was FOUND ("GAP", "look"); once a finding is fixed the note that observed it
   becomes a CHECK of the fixed behaviour (docs/walk-scripts.md §6). These helpers are that check's grammar:
     · every judged line ends in `works` or `FAIL — <what was seen>`, and prints the value it judged (§4);
     · a check whose own set-up could not act is NOT WALKED, never FAIL (§4);
     · a colour is compared with what the BROWSER resolves the app's own token to, never with a number typed here;
     · a month is reached by reading the calendar's own heading, never by a count of presses (§4).
   The shared driver is dl-lib.mjs (its pictures and keyboard.json go to the folder named by DL_SHOTS). */
import * as L from './dl-lib.mjs'

/** one judged line */
export function check(surface, key, expected, saw, ok) {
  L.row(surface, key, expected, saw, ok ? 'works' : `FAIL — ${String(saw).slice(0, 400)}`)
  return !!ok
}
export function notWalked(surface, key, expected, why) { L.row(surface, key, expected, why, `NOT WALKED — ${why}`) }
/** a part of a script: a step that cannot act is written down as such, and the parts after it still run */
export async function part(surface, name, fn) {
  try { await fn() } catch (e) { notWalked(surface, `${name} — the script's own step`, 'runs to its end', `the script could not act: ${String(e && e.message || e).split('\n')[0].slice(0, 240)}`) }
}

/* dates, with no time zone in them */
export const plus = (iso, n) => new Date(Date.parse(iso + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10)
/** 0 = Monday (the app's weeks — D797) */
export const weekday = iso => (new Date(iso + 'T00:00:00Z').getUTCDay() + 6) % 7
export const daysIn = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate()
/** the same day `n` months on — that month's last day where it is shorter */
export function months(iso, n) {
  const t = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) + n
  const y = Math.floor(t / 12), m = (t % 12) + 1
  return `${y}-${String(m).padStart(2, '0')}-${String(Math.min(+iso.slice(8, 10), daysIn(y, m))).padStart(2, '0')}`
}

/** the colour the browser draws for one of the app's own tokens (`--ink`, `--accent`; inside the Tracker `--muted`) */
export const tok = (w, name, inside = 'body') => w.page.evaluate(([n, sel]) => {
  const host = document.querySelector(sel) || document.body
  const i = document.createElement('i'); i.style.color = `var(${n})`; host.appendChild(i)
  const c = getComputedStyle(i).color; i.remove(); return c
}, [name, inside])

/** how an element is drawn, read off the page; null when it is not there */
export const drawn = (w, sel, pseudo) => w.page.evaluate(([s, ps]) => {
  const e = document.querySelector(s); if (!e) return null
  const c = getComputedStyle(e, ps || undefined), r = e.getBoundingClientRect()
  const px = v => Math.round(parseFloat(v) * 10) / 10
  return {
    color: c.color, opacity: c.opacity, weight: c.fontWeight, bg: c.backgroundColor,
    ring: c.outlineStyle === 'none' || !parseFloat(c.outlineWidth) ? 'no ring' : `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor}`,
    transform: c.textTransform, content: c.content, left: px(c.left), right: px(c.right), minWidth: c.minWidth, fontSize: px(c.fontSize),
    x: px(r.left), y: px(r.top), w: px(r.width), h: px(r.height), r: px(r.right), b: px(r.bottom),
    cls: typeof e.className === 'string' ? e.className : '', text: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
    disabled: !!e.disabled, cut: e.scrollWidth > e.clientWidth + 0.5,
  }
}, [sel, pseudo || ''])

/** red, green, blue (0–255) and strength (0–1) of a colour as a browser writes it: rgb(), rgba() or color(srgb …) */
export function parts(css) {
  const n = (String(css).match(/-?[\d.]+(?:e-?\d+)?/g) || []).map(Number)
  if (/^color\(/.test(css)) return { r: n[0] * 255, g: n[1] * 255, b: n[2] * 255, a: n.length > 3 ? n[3] : 1 }
  return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 }
}
const lum = c => { const f = v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b) }
export const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
/** a colour at a strength, laid over a ground */
export const over = (fg, bg, alpha) => ({ r: alpha * fg.r + (1 - alpha) * bg.r, g: alpha * fg.g + (1 - alpha) * bg.g, b: alpha * fg.b + (1 - alpha) * bg.b, a: 1 })
export const same = (a, b, slack = 1.5) => { const x = parts(a), y = parts(b); return Math.abs(x.r - y.r) <= slack && Math.abs(x.g - y.g) <= slack && Math.abs(x.b - y.b) <= slack && Math.abs(x.a - y.a) <= 0.02 }

/** turn a calendar to a month ("2026-11") by its two arrows, reading its own heading at every step */
export async function showMonth(w, ym, tid = 'dcal') {
  for (let i = 0; i < 40; i++) {
    const at = await w.page.locator(`[data-testid="${tid}"]`).getAttribute('data-month')
    if (at === ym) return true
    await w.press(`[data-testid="${tid}-${at < ym ? 'next' : 'prev'}"]`); await L.sleep(140)
  }
  return false
}
/** what a calendar on screen says of itself */
export const calSays = (w, tid = 'dcal') => w.page.locator(`[data-testid="${tid}"]`).evaluate(e => ({ month: e.getAttribute('data-month'), today: e.getAttribute('data-today'), min: e.getAttribute('data-min'), max: e.getAttribute('data-max') }))

/** a real press at an element's middle, by its place on the screen — so it lands on a control that takes no press too
 *  (a button switched off). Answers what lay under the finger: the proof that the press happened (§4). */
export async function pressAt(w, sel) {
  const l = w.page.locator(sel).first()
  await l.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'nearest' }))
  const r = await l.boundingBox()
  if (!r) return null
  const x = r.x + r.width / 2, y = r.y + r.height / 2
  const under = await w.page.evaluate(([px, py]) => { const e = document.elementFromPoint(px, py); const d = e && e.closest('[data-testid]'); return d ? d.getAttribute('data-testid') : (e ? e.tagName.toLowerCase() : 'nothing') }, [x, y])
  if (w.phone) await w.page.touchscreen.tap(x, y); else await w.page.mouse.click(x, y)
  await L.sleep(350)
  return under
}
/** what the keyboard is on: its test id, else its id, else its tag */
export const kbOn = w => w.page.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return 'nothing'; return e.getAttribute('data-testid') || (e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).split(' ')[0] : '')) })
