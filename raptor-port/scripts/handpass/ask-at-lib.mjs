// [ASK-AT-THE-CONTROL] (D1626, 3 Nov 26 — "C for all similar cases"): draws any question the app puts up after a press as
// the approved card of the input window's ✕ (`.inped-xask`, 25-inputs-calendar.css), hanging from the control pressed.
// Used by ask-at-mock.mjs. Only the look is drawn: the question's words and its answer buttons are MOVED from today's
// box into the card (the same nodes, so the words are today's word for word and the buttons keep their own look and
// their own handlers); today's box is then hidden, never restyled. New parts carry the `aq-` prefix.
//
// Placement (the agent's reading of "hanging from it"): under the control when the card fits below it, else above it
// with the pointer underneath; its right edge at the control's right when the control sits in the right half of the
// screen, its left edge at the control's left otherwise; 8px from the screen's edges at most; the pointer over the
// control's middle. The card is position:fixed, appended to the control's own window or page (so it keeps that page's
// scoped styles), and placed after every scroll — the picture is taken straight after.
export const CARD_CSS = `
.aq-card{position:fixed;z-index:99999;width:min(300px,calc(100vw - 16px));box-sizing:border-box;display:flex;flex-direction:column;gap:10px;
  padding:12px;border:1px solid color-mix(in srgb,var(--ink) 22%,var(--panel));border-radius:12px;
  background:color-mix(in srgb,var(--ink) 8%,var(--panel));box-shadow:0 10px 28px rgba(0,0,0,.55);text-align:left}
.aq-card::before{content:'';position:absolute;left:var(--aq-px,50%);width:10px;height:10px;margin-left:-5px;transform:rotate(45deg);background:inherit}
.aq-card.aq-below::before{top:-6px;border-left:1px solid color-mix(in srgb,var(--ink) 22%,var(--panel));border-top:1px solid color-mix(in srgb,var(--ink) 22%,var(--panel))}
.aq-card.aq-above::before{bottom:-6px;border-right:1px solid color-mix(in srgb,var(--ink) 22%,var(--panel));border-bottom:1px solid color-mix(in srgb,var(--ink) 22%,var(--panel))}
.aq-card .aq-q{font-size:12.5px;font-weight:700;line-height:1.35;color:var(--ink);white-space:normal}
.aq-card .aq-sub{font-size:12px;font-weight:500;line-height:1.35;color:var(--ink-2,#b9c2cc);white-space:normal}
.aq-card .aq-btns{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
.aq-card .aq-btns .abtn,.aq-card .aq-btns button{min-height:36px;padding:6px 12px;font-size:12px;white-space:nowrap;margin:0}
@media (max-width:620px){.aq-card .aq-btns .abtn,.aq-card .aq-btns button{min-height:44px}}
/* a whole sheet moved to its control keeps its own inside: no card padding, and its pointer is not clipped */
.aq-frame.aq-card{display:block;padding:0;gap:0;overflow:visible}
.aq-ring{outline:3px solid #ff3b6b !important;outline-offset:2px !important}
`

/** A LARGE question (a sheet with a list, per-entry choices or a calendar — the upchit, medical-clash and OIL sheets):
 *  its own box is moved, whole and untouched inside, to hang from the control — position:fixed at the same place rule
 *  as the card, the card's frame and pointer added round it (`aq-frame`), its full-screen backdrop made clear (never
 *  hidden: the box lives inside it). maxW caps its width; a box taller than the room on its side scrolls inside. */
export function rehomeInPage([ctlSel, boxSel, backdropSel, maxW]) {
  const vis = sel => [...document.querySelectorAll(sel)].find(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
  const ctl = vis(ctlSel); if (!ctl) throw new Error('premise: the control pressed is not on screen — ' + ctlSel)
  const box = vis(boxSel); if (!box) throw new Error('premise: today\'s sheet is not up — ' + boxSel)
  if (backdropSel) for (const b of document.querySelectorAll(backdropSel)) { b.style.setProperty('background', 'transparent', 'important'); b.style.setProperty('backdrop-filter', 'none', 'important'); b.style.setProperty('pointer-events', 'none', 'important') }
  box.style.setProperty('pointer-events', 'auto', 'important')
  box.classList.add('aq-card', 'aq-frame')
  box.style.setProperty('width', `min(${maxW || 360}px, calc(100vw - 16px))`, 'important'); box.style.setProperty('max-width', 'none', 'important')
  box.style.setProperty('margin', '0', 'important'); box.style.setProperty('transform', 'none', 'important')
  let cb = null; for (let a = box.parentElement; a; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.transform !== 'none' || cs.filter !== 'none' || /paint|layout|strict|content/.test(cs.contain)) { cb = a; break } }
  const off = cb ? cb.getBoundingClientRect() : { left: 0, top: 0 }
  const r = ctl.getBoundingClientRect(), vw = innerWidth, vh = innerHeight, GAP = 10, EDGE = 8
  const roomBelow = vh - EDGE - (r.bottom + GAP), roomAbove = r.top - GAP - EDGE
  let H = box.offsetHeight
  const below = H <= roomBelow || roomBelow >= roomAbove
  const room = below ? roomBelow : roomAbove
  if (H > room) { box.style.setProperty('max-height', room + 'px', 'important'); box.style.setProperty('overflow', 'auto', 'important'); H = room }
  const W = box.offsetWidth
  const frameOf = (ctl, vw) => { const w = ctl.closest('.floatwin, [role=dialog], dialog, .bidsheet, .lw-sheet, .airpop'); const r = w && w.getBoundingClientRect(); return r && r.width >= 316 ? { l: r.left, r: r.right } : { l: 0, r: vw } } // the control's own window or sheet when it is in one: a card stays over its window
  const fr = frameOf(ctl, vw)
  let left = (r.left + r.width / 2 > (fr.l + fr.r) / 2) ? r.right - W : r.left
  left = Math.max(Math.max(EDGE, fr.l + 4), Math.min(Math.min(vw - EDGE, fr.r - 4) - W, left))
  if (left < EDGE) left = EDGE
  const top = below ? r.bottom + GAP : r.top - GAP - H
  box.classList.add(below ? 'aq-below' : 'aq-above')
  box.style.setProperty('position', 'fixed', 'important'); box.style.setProperty('left', (left - off.left) + 'px', 'important'); box.style.setProperty('top', (top - off.top) + 'px', 'important')
  box.style.setProperty('right', 'auto', 'important'); box.style.setProperty('bottom', 'auto', 'important')
  box.style.setProperty('--aq-px', Math.max(14, Math.min(W - 14, r.left + r.width / 2 - left)) + 'px')
  ctl.classList.add('aq-ring')
  const c = box.getBoundingClientRect()
  return { side: below ? 'below' : 'above', scrolls: box.scrollHeight > box.clientHeight + 1, card: { l: Math.round(c.left), t: Math.round(c.top), w: Math.round(c.width), h: Math.round(c.height) }, ctl: { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }, onScreen: c.left >= 0 && c.right <= vw && c.top >= 0 && c.bottom <= vh }
}

/** Hang a card from `control`. spec: { q: text | selector of today's question text node, sub?: [selectors|text],
 *  btns: [selectors of today's answer buttons] | [{t, cls}], hide?: selector of today's box, ring?: bool }.
 *  Returns the measures the page prints. Runs in the page. */
export function hangInPage([ctlSel, spec]) {
  const vis = sel => [...document.querySelectorAll(sel)].find(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
  const ctl = typeof ctlSel === 'string' ? vis(ctlSel) : null
  if (!ctl) throw new Error('premise: the control pressed is not on screen — ' + ctlSel)
  const card = document.createElement('div'); card.className = 'aq-card'; card.setAttribute('role', 'alertdialog')
  const take = (s, cls) => {
    if (s && typeof s === 'object' && s.text) { const e = document.createElement('div'); e.className = cls; e.textContent = s.text; return e }
    const n = vis(s); if (!n) throw new Error('premise: today\'s part is not on screen — ' + s)
    const e = document.createElement('div'); e.className = cls; e.textContent = (n.textContent || '').replace(/\s+/g, ' ').trim(); return e
  }
  card.append(take(spec.q, 'aq-q'))
  for (const s of spec.sub || []) card.append(take(s, 'aq-sub'))
  const row = document.createElement('div'); row.className = 'aq-btns'
  for (const b of spec.btns) {
    if (typeof b === 'string') { const n = vis(b); if (!n) throw new Error('premise: today\'s answer is not on screen — ' + b); row.append(n) }
    else { const n = document.createElement('button'); n.type = 'button'; n.className = b.cls; n.textContent = b.t; row.append(n) }
  }
  if (spec.safe) { const n = row.querySelector(spec.safe) || [...row.children].find(b => b.textContent.trim() === spec.safe); if (n) n.className = 'abtn primary' }
  card.append(row)
  if (spec.hide) for (const h of document.querySelectorAll(spec.hide)) h.style.setProperty('visibility', 'hidden', 'important')
  const home = ctl.closest('.floatwin, [role=dialog], dialog, .lw-sheet, [id^="page-"]') || document.body
  home.append(card)
  // a containing block made by a transformed ancestor would move a fixed card: measure from it
  let cb = null; for (let a = card.parentElement; a; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.transform !== 'none' || cs.filter !== 'none' || /paint|layout|strict|content/.test(cs.contain)) { cb = a; break } }
  const off = cb ? cb.getBoundingClientRect() : { left: 0, top: 0 }
  const r = ctl.getBoundingClientRect(), vw = innerWidth, vh = innerHeight, W = card.offsetWidth, H = card.offsetHeight, GAP = 10, EDGE = 8
  const below = r.bottom + GAP + H <= vh - EDGE || r.top - GAP - H < EDGE
  const frameOf = (ctl, vw) => { const w = ctl.closest('.floatwin, [role=dialog], dialog, .bidsheet, .lw-sheet, .airpop'); const r = w && w.getBoundingClientRect(); return r && r.width >= 316 ? { l: r.left, r: r.right } : { l: 0, r: vw } } // the control's own window or sheet when it is in one: a card stays over its window
  const fr = frameOf(ctl, vw)
  let left = (r.left + r.width / 2 > (fr.l + fr.r) / 2) ? r.right - W : r.left
  left = Math.max(Math.max(EDGE, fr.l + 4), Math.min(Math.min(vw - EDGE, fr.r - 4) - W, left))
  if (left < EDGE) left = EDGE
  const top = below ? r.bottom + GAP : r.top - GAP - H
  card.classList.add(below ? 'aq-below' : 'aq-above')
  card.style.left = (left - off.left) + 'px'; card.style.top = (top - off.top) + 'px'
  card.style.setProperty('--aq-px', Math.max(14, Math.min(W - 14, r.left + r.width / 2 - left)) + 'px')
  if (spec.ring !== false) ctl.classList.add('aq-ring')
  const c = card.getBoundingClientRect()
  const btns = [...row.children].map(b => { const x = b.getBoundingClientRect(); return { t: b.textContent.trim(), w: Math.round(x.width), h: Math.round(x.height), fits: b.scrollWidth <= b.clientWidth + 1 } })
  return { side: below ? 'below' : 'above', card: { l: Math.round(c.left), t: Math.round(c.top), w: Math.round(c.width), h: Math.round(c.height) }, ctl: { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }, onScreen: c.left >= 0 && c.right <= vw && c.top >= 0 && c.bottom <= vh, btns }
}
