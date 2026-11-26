// draw-s4 - SECTION 4, THE POSTING SHEET ON THE LEAVE WAR: what the section still owes, drawn on the REAL app (chat 191's
// drawer, 26 Nov 26; brief docs/superpowers/briefs/2026-11-26-msq-sections-draw-brief.md; ledger
// …-msq-sections-drawings-ledger.md §4; his D2653 way C, D2648, D2657). Nothing here writes the app's code.
// THE WORLD: round 6's (.tmp/n176-draw/r6-users-state.json - three squadrons, 142 · 149 · 150, Hunter with rights in all
// three). Every picture runs in its own fresh browser holding a COPY of that world, so a posting pressed here is gone
// when the browser closes; the saved world file is never written.
// HOW EACH IS MADE (round 6's way, ../n176/draw-r6-posting.mjs - its `build` is not exported, so way C's layout is
// written again here, the same rules): the real sheet is opened and brought to its state by a person's presses; then its
// OWN parts - the date box, the chips, the line, an amber line, the button, the question card - are laid out again in
// way C. Nothing is pressed after the layout. Every word is read off the app, or comes from WP (reviewed) or WS4.
// THE MARK: what is new in the app wears a teal dashed ring, 2px #0D9488, 4px clear of the part.
//   s4-{d,p}-greyed-words    4.3 (and 4.2 as it ships): the sheet as it opens, Transfer to Sqn greyed, its reason as words
//   s4-{d,p}-greyed-out      4.3, the other answer: the chip left out until the Transfer step
//   s4-{d,p}-greyed-today    4.3, as the app does it today: greyed, the reason only on mouse rest
//   s4-{d,p}-delete          4.4  Delete chosen, Post out pressed: the "Delete Cinch?" card
//   s4-{d,p}-lastadmin       4.5  150's last admin (Mako): the amber line
//   s4-{d,p}-existing        4.6  an existing posting's sheet (Undo post out)
//   s4-{d,p}-existing-hatch  4.6  the same, "Undo post out (PO)" keeping today's hatched grey (the other answer)
//   s4-{d,p}-existing-in     4.6  its twin, an existing post-in's sheet (Undo post in)
//   s4-{d,p}-drag            4.7  the posting from a dragged range
//   s4-{d,p}-ground          4.8  a ground-crew man (Cotter): three chips, no SANS
//   s4-{d,p}-sans            4.10 SANS chosen
//   s4-{d,p}-none            4.10 no outcome chosen
//   s4-{d,p}-error           4.10 a refused posting's amber line
//   s4-{d,p}-transfer        4.1  as it will be AFTER the Transfer step (Transfer live, To squadron 149) - teal ring
//   s4-{d,p}-postin          4.11 Post in - teal ring
//   node raptor-port/scripts/handpass/n191/draw-s4.mjs      (ONLY=greyed-words,delete,…   SZ=d,p)
import { resolve } from 'node:path'
import { run, as, FACT, wait, hit, shot, box, closeAll, go, reachPick, vis, TMP } from '../n176/draw-r5b-lib.mjs'
import { WP } from '../n176/words-r6-posting.mjs'
import { WS4 } from './words-s4.mjs'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean), want = k => !ONLY.length || ONLY.includes(k)
const SZ = (process.env.SZ || 'd,p').split(',')
const ST = resolve(TMP, 'r6-users-state.json')
const TEAL = '#0D9488'
const DAY = '14 Dec', TO = '149'

/* way C's layout over the sheet's own styles (bidpicker.css): spacing and grouping only, every colour the app's own */
const CSS = `
#p6sheet .bidsheet-hd{margin-bottom:12px}
#p6sheet .bidsheet-row.postout{border-top:0 !important;padding-top:0 !important;margin-top:12px !important}
#p6sheet .lab{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);font-weight:600;display:block;margin-bottom:6px}
#p6sheet .p6blk,#p6sheet .p6fields{margin-top:12px}
#p6sheet .p6chips{display:grid;gap:6px;min-width:0}
#p6sheet .p6chips .pchip{white-space:nowrap;text-align:center}
#p6sheet .p6why{margin-top:6px;display:flex}
#p6sheet .p6why .note{flex:0 1 auto}
#p6sheet .p6fields{display:grid;grid-template-columns:1fr 1fr;gap:10px}
#p6sheet .p6f .datebox{display:flex;width:100%}
#p6sheet .p6line{margin-top:12px;background:var(--panel-2);border-radius:9px;padding:9px 12px;font-size:11.5px;line-height:1.45;color:var(--ink-2)}
#p6sheet .p6warn{margin-top:10px;display:flex}
#p6sheet .p6foot{margin-top:12px;display:flex}
`
/* the teal ring: what is new in the app - 2px dashed, 4px clear of the part */
const tring = (s, b, r = 8) => b && s.page.evaluate(([b, c, r]) => { const d = document.createElement('div'); d.className = '__s4ring'; Object.assign(d.style, { position: 'absolute', boxSizing: 'border-box', left: (b.x - 6 + scrollX) + 'px', top: (b.y - 6 + scrollY) + 'px', width: (b.w + 12) + 'px', height: (b.h + 12) + 'px', border: '2px dashed ' + c, borderRadius: r + 'px', zIndex: 2147483646, pointerEvents: 'none' }); document.body.appendChild(d) }, [b, TEAL, r])

const press = async (s, x, y) => { if (s.desk) await s.page.mouse.click(x, y); else await s.page.touchscreen.tap(x, y) }
/* a day's cell pressed as a person presses it */
async function tapCell(s, pid, iso) {
  const cell = s.page.locator(`[data-testid="cell-${pid}-${iso}"]`).first()
  await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await wait(s, 500)
  const cb = await cell.boundingBox(); await press(s, cb.x + cb.width / 2, cb.y + cb.height / 2); await wait(s, 800)
}
const war = async s => { await go(s, 'leavewar'); await wait(s, 2500) }
/* the day's sheet → ⋯ → Post out (or Post in) */
async function openPanel(s, which, pid = 'snap', iso = '2026-12-14') {
  await tapCell(s, pid, iso)
  await hit(s, '[data-testid="bid-more"]', 500); await hit(s, `[data-testid="bid-${which}"]`, 700)
}
const sheetWords = s => s.page.evaluate(() => { const d = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.getBoundingClientRect().width > 0).pop(); return d ? d.innerText.replace(/\s+/g, ' ').trim().slice(0, 400) : null })
const pidOf = (s, name) => s.page.evaluate(name => { for (const c of document.querySelectorAll('[data-testid^="cell-"][data-testid$="-2026-12-14"]')) { const tr = c.closest('tr'); if (tr && new RegExp('(^|\\s)' + name + '(\\s|$)').test(tr.innerText.replace(/\s+/g, ' ').slice(0, 60))) return c.getAttribute('data-testid').slice(5, -11) } return null }, name)

/* THE SHEET LAID OUT AGAIN IN WAY C, from its own parts.
   o: { phone, title, date, confirm, line, pi, undoRow, note, top:[testid], above:[testid], below:[testid],
        transfer: 'words' | 'out' | 'today' | 'live' } */
const lay = (s, o) => s.page.evaluate(o => {
  const W = o.W, d = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.getBoundingClientRect().width > 0).pop()
  if (!d) throw new Error('no sheet open')
  const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e }
  const css = mk('style'); css.id = 'p6css'; css.textContent = o.css; document.head.appendChild(css)
  const q = t => (t ? d.querySelector(`[data-testid="${t}"]`) : null)
  const clean = e => e.textContent.replace(/\s+/g, ' ').trim()
  const hd = d.querySelector('.bidsheet-hd'), ask = d.querySelector('.askcard')
  const dateBtn = q(o.date), btn = q(o.confirm)
  if (!dateBtn) throw new Error('no date box ' + o.date)
  let chips = [...d.querySelectorAll('.po-outcomes .pchip')]
  let line = o.pi ? clean(btn.parentElement.querySelector('.note')) : o.note ? clean(q(o.note)) : q(o.line) ? clean(q(o.line)) : ''
  const warn = ids => (ids || []).map(q).filter(Boolean)
  const top = warn(o.top), above = warn(o.above), below = warn(o.below)
  const footRow = o.undoRow ? (q(o.undoRow[0]) || q(o.undoRow[1]))?.parentElement : null
  const footWas = footRow ? [...footRow.querySelectorAll('button')].map(x => { const k = getComputedStyle(x); return { t: clean(x), cls: x.className, bg: k.backgroundColor, border: k.borderTopWidth + ' ' + k.borderTopColor } }) : null
  const today = { chips: chips.map(c => ({ t: c.textContent, disabled: c.disabled, hover: c.getAttribute('title') })), head: clean(hd) }
  /* the head names the act (D2653 f); the Auto-approve switch is the leave's, it steps aside with the leave's parts */
  hd.querySelector('.bp-sw')?.remove(); hd.querySelector('.when').textContent = o.title
  /* the main button: the app's own main-button colours (.abtn.primary), the posting button's own box and letters kept */
  const main = b => { const t = mk('button', 'abtn primary', 'x'); d.appendChild(t); const c = getComputedStyle(t); const look = { background: c.backgroundColor, color: c.color, borderColor: c.borderTopColor }; t.remove(); Object.assign(b.style, look); return look }
  /* Transfer to Sqn */
  const tr = chips.find(c => /Transfer/.test(c.textContent))
  let toBox = null, why = null
  if (tr && o.transfer === 'live') {
    tr.disabled = false; tr.removeAttribute('title')
    for (const c of chips) { c.className = 'pchip'; c.setAttribute('aria-pressed', 'false'); c.textContent = c.textContent.replace('✓ ', '') }
    tr.className = 'pchip on'; tr.setAttribute('aria-pressed', 'true'); tr.textContent = '✓ ' + tr.textContent
    toBox = dateBtn.cloneNode(true); toBox.removeAttribute('data-testid'); toBox.setAttribute('aria-label', W.to + ' ' + o.to); toBox.id = 'p6to'; toBox.querySelector('.datebox-txt').textContent = o.to
    line = W.transferLine
  } else if (tr && o.transfer === 'out') { chips = chips.filter(c => c !== tr) }
  else if (tr && o.transfer === 'words') { why = mk('div', 'p6why'); why.id = 'p6why'; why.appendChild(mk('span', 'note', W.transferWhy)) }
  /* everything else steps aside (D2653 d) - the question card, if one is up, stays */
  for (const e of [...d.children]) if (e !== hd && e !== ask && !(ask && e.contains(ask))) e.remove()
  d.id = 'p6sheet'; d.classList.add('p6', 'p6-C'); if (o.phone) d.classList.add('p6-ph')
  const lab = t => mk('span', 'lab', t)
  const put = (cls, ...kids) => { const r = mk('div', cls); r.append(...kids); d.appendChild(r); return r }
  for (const w of top) put('p6warn', w)
  if (chips.length) {
    const g = mk('div', 'p6chips'); g.style.gridTemplateColumns = o.phone ? '1fr 1fr' : `repeat(${chips.length}, 1fr)`; g.append(...chips)
    g.setAttribute('role', 'group'); g.setAttribute('aria-label', W.posting)
    const b = put('p6blk', lab(W.posting), g); if (why) b.appendChild(why)
  }
  const f = mk('div', 'p6fields'); const f1 = mk('div', 'p6f'); f1.append(lab(o.pi || o.piLabel ? W.fromIn : W.from), dateBtn); f.appendChild(f1)
  if (toBox) { const f2 = mk('div', 'p6f'); f2.append(lab(W.to), toBox); f.appendChild(f2) }
  d.appendChild(f)
  let lineEl = null
  if (line) { lineEl = mk('div', 'p6line', line); lineEl.id = 'p6line'; d.appendChild(lineEl) }
  for (const w of above) put('p6warn', w)
  let mainLook = null
  if (btn) { mainLook = main(btn); put('p6foot', btn) }
  let footToday = null
  if (footRow) {
    /* the foot pair: today "Place leave or OIL here instead…" is a bare chip - the browser's own grey button with a white
       edge (bidpicker.css says so of a bare .dchip) - so it takes the app's own quiet chip (.dchip.plain); "Undo post out
       (PO)" takes the same (o.undo 'plain') or keeps today's hatch (o.undo 'hatch') */
    const bs = [...footRow.querySelectorAll('button')]
    footToday = footWas
    for (const x of bs) { if (!x.classList.contains('po')) x.classList.add('plain'); else if (o.undo === 'plain') { x.classList.remove('po'); x.classList.add('plain') } }
    /* AFTER HIS D2660 - "Undo post out (PO)" redesigned through the design skill, three ways, each the app's own part:
       a  the one Move look (.dchip.move: the quiet grey chip, a teal glyph before the word) wearing the top bar's own
          Undo arrow (topbits.tsx "↶");  b  the one Delete look (.dchip.del: a dashed grey edge, never red - D332);
       c  as a, the words shortened (W.undoShort - a draft) and the chip set at the foot's far end, apart from "Place
          leave or OIL here instead…" */
    const u = bs.find(x => /^Undo/.test(clean(x)))
    if (u && o.undo && 'abc'.includes(o.undo)) {
      /* the short words on every design (the fresh Fable words review, 26 Nov 26: "Undo post out" / "Undo post in",
         without "(PO)" / "(PI)") */
      const t = /post in/.test(clean(u)) ? W.undoShortIn : W.undoShort
      u.id = 'p6undo'; u.classList.remove('po', 'plain')
      if (o.undo === 'b') { u.classList.add('del'); u.textContent = t }
      else {
        u.classList.add('move')
        u.textContent = ''; const g = mk('span', 'mvarr', '↶'); g.setAttribute('aria-hidden', 'true'); u.append(g, t)
        if (o.undo === 'c') { footRow.appendChild(u); u.style.marginLeft = 'auto' }
      }
    }
    d.appendChild(footRow)
  }
  for (const w of below) put('p6warn', w)
  if (ask) d.appendChild(ask.parentElement === d ? ask : ask)
  d.style.height = 'auto'
  const r = e => { if (!e) return null; const k = e.getBoundingClientRect(); return { x: Math.round(k.left), y: Math.round(k.top), w: Math.round(k.width), h: Math.round(k.height) } }
  const c = e => { const k = getComputedStyle(e); return `${k.fontSize} ${k.color} opacity ${k.opacity}` }
  return { today, words: d.innerText.replace(/\s+/g, ' ').trim(), sheet: r(d), chips: chips.map(x => ({ t: x.textContent, disabled: x.disabled, ...r(x) })),
    why: why ? { t: why.textContent, ...r(why.firstChild), look: c(why.firstChild) } : null, date: r(dateBtn), to: r(toBox), line: r(lineEl),
    amber: [...top, ...above, ...below].map(x => ({ t: x.textContent, ...r(x), look: c(x) })), button: btn ? { t: clean(btn), ...r(btn) } : null,
    foot: footRow ? [...footRow.querySelectorAll('button')].map(x => ({ t: clean(x), cls: x.className, ...r(x) })) : null, footToday, mainLook, labels: [...d.querySelectorAll('.lab')].map(l => l.textContent) }
}, { ...o, css: CSS, to: TO, W: { ...Object.fromEntries(Object.entries(WP).filter(([, v]) => typeof v === 'string')), transferLine: WP.transferLine(DAY, TO), ...WS4 } })

/* the picture: the sheet ringed (the whole look is new), or only `ringSel` where the picture is about one part */
async function picture(s, k, { ringSel = null, extra = [] } = {}) {
  await wait(s, 300); await s.page.evaluate(() => document.activeElement?.blur()); await wait(s, 150)
  const sh = await box(s, '#p6sheet'); const more = []
  for (const q of extra) { const b = await box(s, q); if (b) more.push(b) }
  if (ringSel) { for (const q of ringSel) await tring(s, await box(s, q), 10) } else await tring(s, sh, 20)
  await shot(s, k, [sh, ...more], 18)
  await s.page.evaluate(() => document.querySelectorAll('.__s4ring').forEach(e => e.remove()))
}
const NEWPO = { title: WP.titleOut, date: 'po-date', confirm: 'po-confirm', line: 'po-line', above: ['po-blocked'], below: ['post-err'] }
const scene = (key, who, fn) => async sz => { if (want(key)) await run(`s4.${key}.${sz}`, sz, async s => { await as(s, who); await fn(s, `s4-${sz}-${key}`) }, { state: ST }) }

const SCENES = [
  /* 4.3 - the sheet as it opens in the build that ships alone (D2657): Overseas Sqn chosen by the app, Transfer greyed */
  /* (his D2659, 26 Nov 26: "leave it out for now" - only 'out' is drawn now; GREYED=words,today re-makes the two answers
     not taken, s4-*-greyed-words / -greyed-today, kept as the record of the question) */
  ...(process.env.GREYED ? process.env.GREYED.split(',') : ['out']).map(t => scene(`greyed-${t}`, 'hunter', async (s, k) => {
    await war(s); await openPanel(s, 'postout')
    FACT(`${k}.drawn`, await lay(s, { ...NEWPO, phone: !s.desk, transfer: t }))
    await s.page.evaluate(() => { const c = [...document.querySelectorAll('#p6sheet .pchip')].find(x => /Transfer/.test(x.textContent)); if (c) c.id = 'p6tr' })
    await picture(s, k, t === 'words' ? { ringSel: ['#p6why .note'] } : {})
  })),
  /* 4.4 - Delete chosen and Post out pressed: the app's own "Delete Cinch?" card, hanging from the button */
  /* s4-*-delete-grey (the coordinator, 26 Nov 26; his D332, D673, D676 - "Delete" on every Leave War sheet is a dashed
     grey edge, never red): the same card, its Delete button in the look of the Leave War's real dashed Delete chip
     (.dchip.del, read off a chip the sheet itself draws), its own box kept - the same height as Cancel beside it (D2644) */
  ...[['delete', false], ['delete-grey', true]].map(([key, grey]) => scene(key, 'hunter', async (s, k) => {
    await war(s); await openPanel(s, 'postout')
    await hit(s, '[data-testid="po-delete"]', 400); await hit(s, '[data-testid="po-confirm"]', 600)
    FACT(`${k}.cardToday`, await s.page.evaluate(() => document.querySelector('[data-testid="po-delete-ask"]')?.innerText.replace(/\s+/g, ' ').trim()))
    FACT(`${k}.drawn`, await lay(s, { ...NEWPO, phone: !s.desk, transfer: 'out' }))
    /* the card follows its button: the app's own placing, asked again as it is on any resize */
    await s.page.evaluate(() => window.dispatchEvent(new Event('resize'))); await wait(s, 400)
    FACT(`${k}.card`, { box: await box(s, '[data-testid="po-delete-ask"]'), button: await box(s, '[data-testid="po-confirm"]') })
    if (grey) FACT(`${k}.deleteButton`, await s.page.evaluate(() => {
      const d = document.querySelector('#p6sheet'), go = d.querySelector('[data-testid="po-delete-go"]'), cn = d.querySelector('[data-testid="po-delete-cancel"]')
      const look = e => { const c = getComputedStyle(e); return { background: c.backgroundColor, color: c.color, border: `${c.borderTopWidth} ${c.borderTopStyle} ${c.borderTopColor}` } }
      const r = e => { const q = e.getBoundingClientRect(); return { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) } }
      const was = look(go)
      const t = document.createElement('button'); t.className = 'dchip del'; t.textContent = 'Delete'; d.appendChild(t); const c = getComputedStyle(t)
      const chip = { backgroundColor: c.backgroundColor, color: c.color, borderStyle: c.borderTopStyle, borderColor: c.borderTopColor, borderWidth: c.borderTopWidth }; t.remove()
      Object.assign(go.style, chip); go.id = 'p6delgo'
      return { was, chip, now: look(go), box: r(go), cancel: r(cn) }
    }))
    await picture(s, k, grey ? { ringSel: ['#p6delgo'], extra: ['[data-testid="po-delete-ask"]'] } : { extra: ['[data-testid="po-delete-ask"]'] })
  })),
  /* 4.5 - the last admin: Saber (master admin) on 150, Mako is 150's only admin */
  scene('lastadmin', 'saber', async (s, k) => {
    FACT(`${k}.pick150`, await reachPick(s, 150, s.desk ? 'bar' : 'menu')); await wait(s, 600)
    await war(s); const pid = await pidOf(s, 'Mako'); FACT(`${k}.mako`, pid)
    await openPanel(s, 'postout', pid)
    FACT(`${k}.drawn`, await lay(s, { ...NEWPO, phone: !s.desk, transfer: 'out' }))
    await picture(s, k)
  }),
  /* 4.6 - an existing posting's sheet: Cinch really posted out from 14 Dec (in this browser only), then Tue 15 Dec pressed */
  /* D2660: the app's plain button AS IT REALLY IS TODAY - nothing drawn. Cinch's Mon 14 Dec given a day of LL (this
     browser only), the day pressed again: the real sheet's action row, Approve · Refuse · Move · Delete. "Move" is the
     app's quiet grey chip (the look `.dchip.plain` shares), "Delete" its dashed one. */
  scene('plain-today', 'hunter', async (s, k) => {
    await war(s); await tapCell(s, 'snap', '2026-12-14')
    await hit(s, vis(s, '.bidsheet[role="dialog"] button').filter({ hasText: /^LL/ }).first(), 900)
    await s.page.keyboard.press('Escape'); await wait(s, 400)
    if (!(await vis(s, '[data-testid="bid-actions"]').count())) await tapCell(s, 'snap', '2026-12-14')
    FACT(`${k}.sheetToday`, await sheetWords(s))
    FACT(`${k}.buttons`, await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="bid-actions"] button')].map(b => { const c = getComputedStyle(b), q = b.getBoundingClientRect(); return { t: b.textContent.trim(), cls: b.className, w: Math.round(q.width), h: Math.round(q.height), bg: c.backgroundColor, color: c.color, border: `${c.borderTopWidth} ${c.borderTopStyle} ${c.borderTopColor}`, radius: c.borderTopLeftRadius, font: `${c.fontSize}/${c.fontWeight}` } })))
    await s.page.evaluate(() => document.activeElement?.blur())
    await shot(s, k, [await box(s, '.bidsheet[role="dialog"]')], 16)
    await shot(s, k + '-row', [await box(s, '[data-testid="bid-actions"]')], 10)
  }),
  ...[['existing', 'plain'], ['existing-hatch', 'hatch'], ['undo-a', 'a'], ['undo-b', 'b'], ['undo-c', 'c']].map(([key, undo]) => scene(key, 'hunter', async (s, k) => {
    await war(s); await openPanel(s, 'postout'); await hit(s, '[data-testid="po-confirm"]', 900)
    await s.page.keyboard.press('Escape'); await wait(s, 400)
    await tapCell(s, 'snap', '2026-12-15'); FACT(`${k}.sheetToday`, await sheetWords(s))
    FACT(`${k}.drawn`, await lay(s, { phone: !s.desk, title: WS4.titleExistingOut, date: 'postout-date', line: 'postout-line', top: ['postout-locked'], above: ['postout-blocked', 'postout-err'], undoRow: ['postout-undo', 'postout-place'], undo, transfer: 'out' }))
    await picture(s, k, 'abc'.includes(undo) ? { ringSel: ['#p6undo'] } : {})
  })),
  scene('existing-in', 'hunter', async (s, k) => {
    await war(s); await openPanel(s, 'postin'); await hit(s, '[data-testid="pi-confirm"]', 900)
    await s.page.keyboard.press('Escape'); await wait(s, 400)
    await tapCell(s, 'snap', '2026-12-10'); FACT(`${k}.sheetToday`, await sheetWords(s))
    FACT(`${k}.drawn`, await lay(s, { phone: !s.desk, title: WS4.titleExistingIn, piLabel: true, date: 'postin-date', note: 'postin-note', top: ['postin-locked'], above: ['postin-err'], undoRow: ['postin-undo', 'postin-place'], undo: 'a' }))
    await picture(s, k)
  }),
  /* 4.7 - the posting from a dragged range: Cinch's Mon 14 - Fri 18 Dec dragged, ⋯ → Post out */
  scene('drag', 'hunter', async (s, k) => {
    await war(s)
    const a = s.page.locator('[data-testid="cell-snap-2026-12-14"]').first(), b = s.page.locator('[data-testid="cell-snap-2026-12-18"]').first()
    await a.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await wait(s, 500)
    const b1 = await a.boundingBox(), b2 = await b.boundingBox()
    const x1 = b1.x + b1.width / 2, y1 = b1.y + b1.height / 2, x2 = b2.x + b2.width / 2, y2 = b2.y + b2.height / 2
    await s.page.mouse.move(x1, y1); await s.page.mouse.down(); await s.page.mouse.move(x1 + 6, y1 + 1, { steps: 3 }); await s.page.mouse.move(x2, y2, { steps: 14 }); await s.page.mouse.up(); await wait(s, 800)
    FACT(`${k}.afterDrag`, await sheetWords(s))
    await hit(s, '[data-testid="sel-more"]', 500); await hit(s, '[data-testid="sel-postout"]', 700)
    FACT(`${k}.sheetToday`, await sheetWords(s))
    FACT(`${k}.drawn`, await lay(s, { phone: !s.desk, title: WP.titleOut, date: 'sel-po-date', confirm: 'sel-po-confirm', line: 'sel-po-line', above: ['sel-po-blocked'], transfer: 'out' }))
    await picture(s, k)
  }),
  /* 4.8 - a ground-crew man: no SANS chip (his D1709) */
  scene('ground', 'hunter', async (s, k) => {
    await war(s); await openPanel(s, 'postout', 'spanner')
    FACT(`${k}.drawn`, await lay(s, { ...NEWPO, phone: !s.desk, transfer: 'out' }))
    await picture(s, k)
  }),
  /* 4.10 - SANS chosen; no outcome chosen (the chosen chip pressed again); a refused posting's amber line */
  scene('sans', 'hunter', async (s, k) => {
    await war(s); await openPanel(s, 'postout'); await hit(s, '[data-testid="po-sans"]', 400)
    FACT(`${k}.drawn`, await lay(s, { ...NEWPO, phone: !s.desk, transfer: 'out' })); await picture(s, k)
  }),
  scene('none', 'hunter', async (s, k) => {
    await war(s); await openPanel(s, 'postout'); await hit(s, '[data-testid="po-overseas"]', 400)
    FACT(`${k}.drawn`, await lay(s, { ...NEWPO, phone: !s.desk, transfer: 'out' })); await picture(s, k)
  }),
  scene('error', 'hunter', async (s, k) => {
    /* Cinch really posted IN from 14 Dec (this browser only); Thu 10 Dec → "Place leave or OIL here instead…" → ⋯ → Post
       out → Post out: the app refuses a post-out before the post-in and says why */
    await war(s); await openPanel(s, 'postin'); await hit(s, '[data-testid="pi-confirm"]', 900)
    await s.page.keyboard.press('Escape'); await wait(s, 400)
    await tapCell(s, 'snap', '2026-12-10'); await hit(s, '[data-testid="postin-place"]', 700)
    await hit(s, '[data-testid="bid-more"]', 500); await hit(s, '[data-testid="bid-postout"]', 700); await hit(s, '[data-testid="po-confirm"]', 700)
    FACT(`${k}.sheetToday`, await sheetWords(s))
    FACT(`${k}.drawn`, await lay(s, { ...NEWPO, phone: !s.desk, transfer: 'out' })); await picture(s, k)
  }),
  /* 4.1 as it will be after the Transfer step, and 4.11 Post in - round 6's two, re-made with the teal ring */
  scene('transfer', 'hunter', async (s, k) => {
    await war(s); await openPanel(s, 'postout')
    FACT(`${k}.drawn`, await lay(s, { ...NEWPO, phone: !s.desk, transfer: 'live' })); await picture(s, k)
  }),
  scene('postin', 'hunter', async (s, k) => {
    await war(s); await openPanel(s, 'postin')
    FACT(`${k}.drawn`, await lay(s, { phone: !s.desk, title: WP.titleIn, pi: true, date: 'pi-date', confirm: 'pi-confirm', below: ['post-err'] })); await picture(s, k)
  }),
]
try { for (const sz of SZ) for (const sc of SCENES) await sc(sz) } finally { await closeAll() }
