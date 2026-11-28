// p3-note - P3 case 1: where TODAY's grey "Blocked:" note stands at each size, over (a) no window, (b) an Input window
// open with words typed, (c) Leave War My leave, (d) Inputs settings (the gear), (e) the Calendar window. Saber (ad, the
// master admin, home 142). With each open: is the squadron control reachable (the top-bar picker, ☰), and the name badge
// and the bell? Then the note is raised with the words "Blocked: close the open window, then pick 149." and read back:
// top or foot, its box, how many lines, and every control it lies over (which one is in front there with the note lifted
// for that one read).
// STAND-IN, named: the note is raised by the app's own window.toast(text, 'blocked') (as chat 166's draw-lib did) - no
// press raises it today, because no refusal of a pick is built.
//   node raptor-port/scripts/handpass/n175/p3-note.mjs <p|ps|t|d>     (ONLY=a,b,c,d,e)
// Pictures (deciding): p3-note-<case>-<size>.png and -crop.png, the note ringed (and the squadron control where drawn).
import { mk, closeAll, FACT, signIn, covered, boxOf, barSq, pageOn, windowsNow, wait, decide, openInput, openMyLeave, openInputsGear, openCalendar } from './p3-lib.mjs'
const SZ = process.argv[2] || 'p'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const TEXT = 'Blocked: close the open window, then pick 149.'
const CASES = {
  a: { what: 'no window', open: async () => {} },
  b: { what: 'an Input window open, words typed in Remarks', open: async s => { const r = await openInput(s, 'N175P3 typed words'); FACT(`P3.note.${SZ}.b.input`, r) } },
  c: { what: 'Leave War My leave open', open: openMyLeave },
  d: { what: 'Inputs settings (the gear) open', open: openInputsGear },
  e: { what: 'the Calendar window open (Inputs → gear → Calendar…)', open: openCalendar },
}
const readNote = s => s.page.evaluate(() => {
  const t = document.querySelector('#toastEl'); if (!t) return null
  const b = t.getBoundingClientRect(), c = getComputedStyle(t)
  /* lines: the distinct tops of the words' line boxes */
  const words = t.querySelector('.bk-words') || t
  const rg = document.createRange(); rg.selectNodeContents(words)
  const tops = [...new Set([...rg.getClientRects()].filter(r => r.width > 1).map(r => Math.round(r.top)))].sort((x, y) => x - y)
  const lines = tops.filter((v, i) => i === 0 || v - tops[i - 1] > 4).length
  /* what lies under the note: with the note hidden for this one read, every press-able control whose box meets the
     note's box, and whether that control is the one in front at the meeting's middle */
  const prevV = t.style.visibility; t.style.visibility = 'hidden'
  const ctl = 'button, a[href], a[data-page], input, select, textarea, [role=button], [role=tab], [role=menuitem], #sqnMenuBtn, #burger, #roleBadge, #notifyBell, .fw-x, [aria-label="Close"]'
  const under = []
  for (const e of document.querySelectorAll(ctl)) {
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e)
    if (!(r.width > 1 && r.height > 1) || cs.visibility === 'hidden' || cs.display === 'none') continue
    const L = Math.max(r.left, b.left), R = Math.min(r.right, b.right), T = Math.max(r.top, b.top), B = Math.min(r.bottom, b.bottom)
    if (!(R > L && B > T)) continue
    const at = document.elementFromPoint((L + R) / 2, (T + B) / 2)
    if (!(at && (at === e || e.contains(at)))) continue
    const label = (e.getAttribute('aria-label') || e.textContent || e.value || e.id || e.tagName).replace(/\s+/g, ' ').trim().slice(0, 40)
    const inWin = e.closest('.floatwin, .bidsheet, [role=dialog], .modal, .sheet, .drawer')
    under.push({ control: label, id: e.id || null, inWindow: inWin ? ((inWin.id ? '#' + inWin.id : '') + '.' + String(inWin.className).split(/\s+/)[0]) : 'page/bar', overlapPx: Math.round((R - L) * (B - T)), ofControlPct: Math.round(100 * (R - L) * (B - T) / (r.width * r.height)) })
  }
  t.style.visibility = prevV
  return { words: t.textContent.replace(/\s+/g, ' ').trim(), face: t.dataset.face || null, at: t.dataset.at || null, wide: t.dataset.wide || null, opacity: c.opacity, takesPresses: c.pointerEvents !== 'none', box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }, lines, onScreen: b.left >= 0 && b.top >= 0 && b.right <= innerWidth && b.bottom <= innerHeight, under: under.filter((u, i, a) => a.findIndex(o => o.control === u.control && o.inWindow === u.inWindow) === i).slice(0, 14) }
})
async function one(key) {
  const C = CASES[key], k = `P3.note.${SZ}.${key}`
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    FACT(`${k}.case`, C.what)
    try { await C.open(s) } catch (e) { FACT(`${k}.opened`, 'could not open by presses: ' + String(e).split('\n')[0].slice(0, 140)); return }
    await wait(s, 400)
    FACT(`${k}.windows`, (await windowsNow(s)).map(w => ({ what: w.what, words: w.words.slice(0, 80), buttons: w.buttons })))
    FACT(`${k}.squadron`, { bar: await barSq(s), page: await pageOn(s) })
    const ctl = {}
    for (const [n, sel] of [['top-bar squadron picker', '#sqnMenuBtn'], ['☰', '#burger'], ['name badge', '#roleBadge'], ['bell', '#notifyBell']]) ctl[n] = (await boxOf(s, sel)) ? { box: await boxOf(s, sel), at: await covered(s, sel) } : 'not drawn'
    FACT(`${k}.controls`, ctl)
    const ok = await s.page.evaluate(t => { if (typeof window.toast !== 'function') return false; window.toast(t, 'blocked'); return true }, TEXT)
    FACT(`${k}.standIn`, ok ? "note raised by the app's own window.toast(text, 'blocked')" : 'window.toast is not on the page')
    if (!ok) return
    await wait(s, 500)
    const n = await readNote(s)
    FACT(`${k}.note`, n)
    const sqSel = (await boxOf(s, '#sqnMenuBtn')) ? '#sqnMenuBtn' : '#burger'
    const winSel = '.floatwin, .bidsheet, [role=dialog], .modal'
    /* the squadron control is ringed only where it is in front (a ring over a covered control would mislead) */
    const rings = (await covered(s, sqSel)) === 'free' ? ['#toastEl', sqSel] : ['#toastEl']
    const crop = ['#toastEl', sqSel]
    if ((await windowsNow(s)).length) crop.push(winSel)
    await decide(s, `p3-note-${key}-${SZ}`, rings, crop)
    FACT(`${k}.picture`, `p3-note-${key}-${SZ}.png`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p3-note v1', SZ)
  for (const key of (ONLY.length ? ONLY : Object.keys(CASES))) await one(key)
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
