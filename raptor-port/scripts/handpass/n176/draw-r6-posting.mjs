// draw-r6-posting - round 6: THE POSTING SHEET REDESIGNED, three directions, drawn on the REAL app (chat 188's fresh
// Fable through the design skill, 26 Nov 26; brief docs/superpowers/briefs/2026-11-26-msq-r6-posting-sheet-brief.md,
// report …-r6-posting-sheet-report.md; his D2648 - "can we redesign this post out page. Likewise for leave war. It's so
// ugly"). Nothing here writes the app's code. Every word a drawing shows is the app's own or comes from
// ./words-r6-posting.mjs (WP). What is NEW wears a violet dashed ring (2px #8B5CF6), as round 6's other drawings do.
// THE WORLD: round 6's (r6-users-state.json - round 5's and Cinch's sign-in). Hunter, 142's admin, does every press.
// HOW EACH IS MADE: the real Leave War sheet is opened by a person's presses (Cinch's Mon 14 Dec → ⋯ → Post out), and its
// OWN parts - the date box, the four chips, the line, the button - are laid out again in place; nothing is posted (the
// sheet is closed by Escape after the picture). For Admin → Users the same sheet's look is frozen and hung from the row's
// "Post out…" (directions A and B), or the form is built inside Cinch's opened row from Admin → Users' OWN parts - the
// label over a box, the access chips, the row's note, the row-foot pair (direction C).
//  A "tidied"   today's order and labels, the rules between rows gone, the chips one even group, the button as today.
//  B "a list"   the four outcomes a list of rows in one panel, the line at the panel's foot, a main button.
//  C "one grid" labels over their controls, the chips one even grid, PO from and To side by side, the line on a raised
//               strip, a main button; on Admin → Users it opens inside the man's row, in that page's own parts.
//  p6-{d,p}-{A,B,C}-war / -users (+ -crop)   Transfer to Sqn chosen, To 149.
//  p6-{d,p}-C-war-overseas                   the recommended direction with Overseas Sqn chosen (no "To").
//  p6-{d,p}-C-postin                         Post in, in the recommended direction.
//   node raptor-port/scripts/handpass/n176/draw-r6-posting.mjs   (ONLY=A,B,C,overseas,postin  SZ=d,p)
import { resolve } from 'node:path'
import { run, as, FACT, wait, hit, shot, box, closeAll, go, usersTab, TMP } from './draw-r5b-lib.mjs'
import { WP } from './words-r6-posting.mjs'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean), want = k => !ONLY.length || ONLY.includes(k)
const SZ = (process.env.SZ || 'd,p').split(',')
const ST = resolve(TMP, 'r6-users-state.json')
const VIOLET = '#8B5CF6'
const DAY = '14 Dec', TO = '149'
/* the words as plain text (a function cannot cross into the page) */
const WT = Object.fromEntries(Object.entries(WP).filter(([, v]) => typeof v === 'string'))

/* the layout the drawings add, over the sheet's own styles (bidpicker.css): spacing and grouping only - every colour is
   one of the app's own tokens */
const CSS = `
#p6sheet .bidsheet-hd{margin-bottom:12px}
#p6sheet .bidsheet-row.postout{border-top:0 !important;padding-top:0 !important;margin-top:10px !important}
#p6sheet .lab{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);font-weight:600}
#p6sheet .p6chips{display:flex;gap:6px;flex:1 1 0;min-width:0}
#p6sheet .p6chips .pchip{flex:1 1 auto;white-space:nowrap;text-align:center}
#p6sheet .p6line{margin-top:10px;font-size:11.5px;line-height:1.45;color:var(--ink-2)}
#p6sheet .p6foot{margin-top:12px;display:flex}
#p6sheet.p6-ph.p6-A .p6chips{display:grid;grid-template-columns:1fr 1fr}
#p6sheet.p6-B .p6labtop{align-self:flex-start;margin-top:13px}
#p6sheet.p6-B .p6list{flex:1 1 0;min-width:0;background:var(--panel-2);border:1px solid var(--edge);border-radius:9px;overflow:hidden}
#p6sheet.p6-B .p6opt{display:flex;align-items:center;gap:8px;box-sizing:border-box;width:100%;height:38px;padding:0 12px;background:none;border:0;color:var(--ink-2);font-size:12.5px;font-weight:600;font-family:inherit;text-align:left;cursor:pointer}
#p6sheet.p6-B .p6opt[aria-pressed=true]{color:var(--accent);background:rgba(59,198,232,.14)}
#p6sheet.p6-B .p6tick{flex:0 0 14px;width:14px;font-weight:800}
#p6sheet.p6-B .p6opt .datebox{margin-left:auto;height:28px;min-height:0;padding:3px 9px}
#p6sheet.p6-B .p6listfoot{border-top:1px solid var(--edge);padding:9px 12px;font-size:11.5px;line-height:1.45;color:var(--ink-2)}
#p6sheet.p6-C .p6blk,.p6-C .p6fields{margin-top:12px}
#p6sheet.p6-C .lab{display:block;margin-bottom:6px}
#p6sheet.p6-C .p6chips{display:grid;grid-template-columns:repeat(4,1fr)}
#p6sheet.p6-ph.p6-C .p6chips{grid-template-columns:1fr 1fr}
#p6sheet.p6-C .p6fields{display:grid;grid-template-columns:1fr 1fr;gap:10px}
#p6sheet.p6-C .p6f .datebox{display:flex;width:100%}
#p6sheet.p6-C .p6line{margin-top:12px;background:var(--panel-2);border-radius:9px;padding:9px 12px}
`
/* the violet ring: what is new */
const vring = (s, b, r = 8) => b && s.page.evaluate(([b, c, r]) => { const d = document.createElement('div'); d.className = '__p6ring'; Object.assign(d.style, { position: 'absolute', boxSizing: 'border-box', left: (b.x - 6 + scrollX) + 'px', top: (b.y - 6 + scrollY) + 'px', width: (b.w + 12) + 'px', height: (b.h + 12) + 'px', border: '2px dashed ' + c, borderRadius: r + 'px', zIndex: 2147483646, pointerEvents: 'none' }); document.body.appendChild(d) }, [b, VIOLET, r])

/* the real sheet, opened by a person's presses: Cinch's Mon 14 Dec → ⋯ → Post out (or Post in) */
async function openPanel(s, which) {
  await go(s, 'leavewar'); await wait(s, 2500)
  const cell = s.page.locator('[data-testid="cell-snap-2026-12-14"]').first()
  await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await wait(s, 500)
  const cb = await cell.boundingBox()
  if (s.desk) await s.page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2); else await s.page.touchscreen.tap(cb.x + cb.width / 2, cb.y + cb.height / 2)
  await wait(s, 800)
  await hit(s, '[data-testid="bid-more"]', 500); await hit(s, `[data-testid="bid-${which}"]`, 700)
}
async function closePanel(s, k) {
  await s.page.keyboard.press('Escape'); await wait(s, 400)
  if (await s.page.locator('.bidsheet[role="dialog"]:visible').count()) await hit(s, s.page.locator('.bidsheet[role="dialog"] button.x:visible').last(), 400)
  FACT(`${k}.closedNothingPosted`, { sheets: await s.page.locator('.bidsheet[role="dialog"]:visible').count() })
}
/* THE SHEET LAID OUT AGAIN, from its own parts. o: { dir, phone, outcome: 'transfer'|'asis', pi } */
const build = (s, o) => s.page.evaluate(o => {
  const W = o.W, d = [...document.querySelectorAll('.bidsheet[role="dialog"]')].pop()
  const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e }
  const css = mk('style'); css.id = 'p6css'; css.textContent = o.css; document.head.appendChild(css)
  d.id = 'p6sheet'; d.classList.add('p6', 'p6-' + o.dir); if (o.phone) d.classList.add('p6-ph')
  /* the leave's own parts step aside while the posting is open (a change in what the sheet shows - named in the report) */
  for (const e of [...d.children]) if (!e.classList.contains('bidsheet-hd') && !e.classList.contains('postout')) e.remove()
  const hd = d.querySelector('.bidsheet-hd'); hd.querySelector('.bp-sw')?.remove(); hd.querySelector('.when').textContent = o.pi ? W.titleIn : W.titleOut
  const lab = t => mk('span', 'lab', t)
  /* the main button: the app's own main-button colours (.abtn.primary), the posting button's own box and letters kept */
  const main = b => { const t = mk('button', 'abtn primary', 'x'); d.appendChild(t); const c = getComputedStyle(t); const look = { background: c.backgroundColor, color: c.color, borderColor: c.borderTopColor }; t.remove(); Object.assign(b.style, look); return look }
  const dateBtn = d.querySelector(o.pi ? '[data-testid="pi-date"]' : '[data-testid="po-date"]')
  const btn = d.querySelector(o.pi ? '[data-testid="pi-confirm"]' : '[data-testid="po-confirm"]')
  let line, chips = [], toBox = null, mainLook = null
  if (o.pi) line = btn.parentElement.querySelector('.note').textContent.replace(/\s+/g, ' ').trim()
  else {
    const keys = ['overseas', 'delete', 'sans', 'transfer']
    chips = keys.map(k => d.querySelector(`[data-testid="po-${k}"]`)).filter(Boolean)
    const tr = chips[chips.length - 1]; tr.disabled = false; tr.removeAttribute('title')
    if (o.outcome === 'transfer') {
      for (const c of chips) { c.className = 'pchip'; c.setAttribute('aria-pressed', 'false'); c.textContent = c.textContent.replace('✓ ', '') }
      tr.className = 'pchip on'; tr.setAttribute('aria-pressed', 'true'); tr.textContent = '✓ ' + tr.textContent
      toBox = dateBtn.cloneNode(true); toBox.removeAttribute('data-testid'); toBox.setAttribute('aria-label', W.to + ' ' + o.to); toBox.id = 'p6to'; toBox.querySelector('.datebox-txt').textContent = o.to
      line = W.line
    } else line = d.querySelector('[data-testid="po-line"]').textContent
  }
  for (const e of [...d.querySelectorAll(':scope > .postout')]) e.remove()
  const row = (...kids) => { const r = mk('div', 'bidsheet-row postout'); r.append(...kids); d.appendChild(r); return r }
  const foot = () => { const f = mk('div', 'p6foot'); f.appendChild(btn); d.appendChild(f) }
  const lineEl = mk('div', 'p6line', line); lineEl.id = 'p6line'
  if (o.pi) {
    const f = mk('div', 'p6fields'); const f1 = mk('div', 'p6f'); f1.append(lab(W.fromIn), dateBtn); f.appendChild(f1); d.appendChild(f)
    d.appendChild(lineEl); mainLook = main(btn); foot()
  } else if (o.dir === 'A') {
    row(lab(W.from), dateBtn)
    const g = mk('div', 'p6chips'); g.append(...chips); row(lab(W.posting), g).classList.add('po-outcomes')
    if (toBox) row(lab(W.to), toBox)
    d.appendChild(lineEl); foot()
  } else if (o.dir === 'B') {
    row(lab(W.from), dateBtn)
    const list = mk('div', 'p6list'); list.setAttribute('role', 'group'); list.setAttribute('aria-label', W.posting)
    for (const c of chips) { const on = c.getAttribute('aria-pressed') === 'true'; const r = mk('button', 'p6opt'); r.type = 'button'; r.setAttribute('aria-pressed', String(on)); r.append(mk('span', 'p6tick', on ? '✓' : ''), mk('span', '', c.textContent.replace('✓ ', ''))); if (on && toBox) r.appendChild(toBox); list.appendChild(r) }
    const lf = mk('div', 'p6listfoot', line); lf.id = 'p6line'; list.appendChild(lf)
    const l = lab(W.posting); l.classList.add('p6labtop'); row(l, list)
    mainLook = main(btn); foot()
  } else {
    const b = mk('div', 'p6blk'); const g = mk('div', 'p6chips'); g.append(...chips); b.append(lab(W.posting), g); d.appendChild(b)
    const f = mk('div', 'p6fields'); const f1 = mk('div', 'p6f'); f1.append(lab(W.from), dateBtn); f.appendChild(f1)
    if (toBox) { const f2 = mk('div', 'p6f'); f2.append(lab(W.to), toBox); f.appendChild(f2) }
    d.appendChild(f); d.appendChild(lineEl); mainLook = main(btn); foot()
  }
  d.style.height = 'auto'
  const r = e => { if (!e) return null; const q = e.getBoundingClientRect(); return { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) } }
  return { words: d.innerText.replace(/\s+/g, ' ').trim(), sheet: r(d), chips: chips.map(c => ({ t: c.textContent, ...r(c) })), date: r(dateBtn), to: r(toBox), line: r(d.querySelector('#p6line')), button: { t: btn.textContent.trim(), ...r(btn) }, mainLook, labels: [...d.querySelectorAll('.lab')].map(l => l.textContent) }
}, { ...o, css: CSS, W: { ...WT, line: WP.transferLine(DAY, TO) }, to: TO })

/* the sheet's look frozen into a copy, so it stands on Admin → Users as it stands on the war (round 6's way) */
const freeze = s => s.page.evaluate(() => {
  const d = document.querySelector('#p6sheet')
  const all = [d, ...d.querySelectorAll('*')]
  const looks = all.map(e => { const c = getComputedStyle(e); let t = ''; for (let i = 0; i < c.length; i++) { const p = c[i]; t += `${p}:${c.getPropertyValue(p)};` } return t })
  const k = d.cloneNode(true); const ka = [k, ...k.querySelectorAll('*')]; ka.forEach((e, i) => e.setAttribute('style', looks[i]))
  k.id = 'p6hung'; k.removeAttribute('data-testid'); k.querySelectorAll('[data-testid]').forEach(e => e.removeAttribute('data-testid'))
  return { html: k.outerHTML, w: Math.round(d.getBoundingClientRect().width), h: Math.round(d.getBoundingClientRect().height) }
})
/* Admin → Users: Cinch's real row opened, round 6's "Post out…" before Suspend (u6-d-postout's way) */
async function cinchRow(s) {
  await usersTab(s); await wait(s, 500)
  await hit(s, s.page.locator('[data-testid="acc-groups"] [data-person="snap"] .acc-tap').first(), 700)
  const r = await s.page.evaluate(label => {
    const row = document.querySelector('.acc-row.od-row-on'), acts = [...row.querySelectorAll('.acc-edit > .acc-acts')].pop()
    const sus = [...acts.querySelectorAll('button')].find(b => /^Suspend/.test(b.textContent.trim())) || acts.querySelector('#accEdArchive')
    const b = document.createElement('button'); b.type = 'button'; b.className = 'abtn'; b.id = 'p6po'; b.textContent = label
    sus.insertAdjacentElement('beforebegin', b)
    scrollBy(0, row.getBoundingClientRect().top - 110)
    return [...acts.querySelectorAll('button')].map(x => x.textContent.trim())
  }, WP.rowPostOut)
  await wait(s, 300); await s.page.evaluate(() => document.activeElement?.blur())
  return r
}
/* directions A and B on Admin → Users: the same sheet hung from the row's button (a desktop), at the screen's foot as
   the war's own sheet sits (a phone) */
const hang = (s, html) => s.page.evaluate(([html, desk]) => {
  const h = document.createElement('div'); h.innerHTML = html; const d = h.firstElementChild
  const pb = document.querySelector('#p6po').getBoundingClientRect()
  Object.assign(d.style, { visibility: 'visible', position: 'fixed', right: 'auto', transform: 'none', zIndex: '2147483000', margin: '0', height: 'auto', maxHeight: 'none' })
  if (desk) { const w = parseFloat(d.style.width) || 560; Object.assign(d.style, { left: Math.min(Math.max(12, pb.left - 24), innerWidth - w - 12) + 'px', top: (pb.bottom + 10) + 'px', bottom: 'auto' }) }
  else Object.assign(d.style, { left: '12px', top: 'auto', bottom: '14px' })
  document.body.appendChild(d)
  /* the title strip's grip: this sheet is hung from its button, not dragged */
  const q = d.getBoundingClientRect(); return { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height), words: d.innerText.replace(/\s+/g, ' ').trim() }
}, [html, s.desk])
/* direction C on Admin → Users, AFTER THE HOST'S LOOK (26 Nov 26 - his D2648 says ONE design for both doors): the war's
   own C parts - the same chips with the ✓, the same "To" box as PO from, the line on its raised strip - their look frozen
   off the war's sheet and laid inside Cinch's opened row at the row's width; the row keeps its own foot pair,
   Post out · Cancel. (rowForm below, the first drawing in the page's own parts, is kept but no longer run.) */
const rowFormWar = (s, html, phone) => s.page.evaluate(([html, phone, W]) => {
  const row = document.querySelector('.acc-row.od-row-on'), ed = row.querySelector('.acc-edit')
  const h = document.createElement('div'); h.innerHTML = html; const sheet = h.firstElementChild
  for (const e of [...ed.children]) e.remove()
  const form = document.createElement('div'); form.id = 'p6form'
  const parts = ['.p6blk', '.p6fields', '.p6line'].map(q => sheet.querySelector(q))
  /* the frozen look keeps the sheet's own widths: let each part take the row's width instead */
  for (const p of parts) for (const e of [p, ...p.querySelectorAll('*')]) { for (const k of ['width', 'height', 'inline-size', 'block-size', 'min-width', 'max-width', 'min-inline-size', 'max-inline-size']) e.style.removeProperty(k) }
  const [blk, fields, line] = parts
  blk.querySelector('.p6chips').style.gridTemplateColumns = phone ? '1fr 1fr' : 'repeat(4, 1fr)'
  fields.style.gridTemplateColumns = '1fr 1fr'
  for (const b of fields.querySelectorAll('.datebox')) b.style.width = '100%'
  blk.style.marginTop = '4px'; line.id = 'p6line'
  /* the strip's own colour is the opened row's (both the app's second panel colour), so here it would not show: it takes
     the sheet's colour (the app's first panel colour), still one step off what it lies on */
  line.style.background = 'var(--panel)'
  const acts = document.createElement('div'); acts.className = 'acc-acts'; acts.style.marginTop = '12px'
  const a = document.createElement('button'); a.type = 'button'; a.className = 'abtn primary'; a.id = 'p6go'; a.textContent = W.postOut
  const c = document.createElement('button'); c.type = 'button'; c.className = 'abtn'; c.id = 'p6cancel'; c.textContent = W.cancel
  acts.append(a, c); form.append(blk, fields, line, acts); ed.appendChild(form)
  scrollBy(0, row.getBoundingClientRect().top - 110)
  const r = e => { const q = e.getBoundingClientRect(); return { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) } }
  const boxes = [...fields.querySelectorAll('.datebox')]
  return { words: form.innerText.replace(/\s+/g, ' ').trim(), form: r(form), chips: [...blk.querySelectorAll('.pchip')].map(b => ({ t: b.textContent, ...r(b) })), date: r(boxes[0]), to: boxes[1] ? r(boxes[1]) : null, line: r(line), postOut: r(a), cancel: r(c) }
}, [html, phone, WT])
/* direction C on Admin → Users: the posting form INSIDE Cinch's opened row, made of the page's own parts - the label over
   a box (.mfield, as "Role" and "Post in"), the date box ("Post in"'s own), the squadron list (the page's own select),
   the access chips (None · View · Plan's look, the chosen one the page's lit chip), the row's note (.od-said) and the
   row-foot pair (a main and a plain button) */
const rowForm = (s, o) => s.page.evaluate(o => {
  const W = o.W, row = document.querySelector('.acc-row.od-row-on'), ed = row.querySelector('.acc-edit')
  const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e }
  const dateTpl = document.querySelector('#page-admin button.datebox'), selTpl = row.querySelector('#accEdRole'), noteTpl = document.querySelector('#page-admin .od-said')
  for (const e of [...ed.children]) e.remove()
  const form = mk('div'); form.id = 'p6form'
  const field = (label, ctl) => { const f = mk('div', 'mfield'); f.append(mk('label', '', label), ctl); return f }
  /* Posting: the access chips' own group */
  const chips = mk('div', 'acc-acts acc-mode'); chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', W.posting); chips.id = 'p6chips'
  for (const [k, t] of [['overseas', W.overseas], ['delete', W.del], ['sans', W.sans], ['transfer', W.transfer]]) { const b = mk('button', 'abtn' + (k === o.outcome ? ' primary' : ''), t); b.type = 'button'; b.setAttribute('aria-pressed', String(k === o.outcome)); chips.appendChild(b) }
  if (o.phone) Object.assign(chips.style, { display: 'grid', gridTemplateColumns: '1fr 1fr' })
  const pf = field(W.posting, chips); pf.style.marginBottom = '6px'; chips.style.marginTop = '6px'
  /* PO from | To */
  const two = mk('div', 'adm-2col')
  const date = dateTpl.cloneNode(true); date.removeAttribute('id'); date.id = 'p6date'; date.setAttribute('aria-label', W.from); date.querySelector('.datebox-txt').textContent = o.dateWords
  two.appendChild(field(W.from, date))
  if (o.outcome === 'transfer') { const sel = selTpl.cloneNode(false); sel.id = 'p6sel'; sel.setAttribute('aria-label', W.to); for (const n of o.sqns) { const op = mk('option', '', n); op.value = n; sel.appendChild(op) } sel.value = o.to; two.appendChild(field(W.to, sel)) }
  else two.appendChild(mk('div', 'mfield'))
  const said = mk('p', 'od-said', o.line); said.id = 'p6line'; if (!noteTpl) Object.assign(said.style, { color: 'var(--ink-3)', fontSize: '11.5px' })
  said.style.margin = '10px 0 12px'
  const acts = mk('div', 'acc-acts'); const a = mk('button', 'abtn primary', W.postOut); a.type = 'button'; a.id = 'p6go'; const c = mk('button', 'abtn', W.cancel); c.type = 'button'; c.id = 'p6cancel'; acts.append(a, c)
  form.append(pf, two, said, acts); ed.appendChild(form)
  scrollBy(0, row.getBoundingClientRect().top - 110)
  const r = e => { const q = e.getBoundingClientRect(); return { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) } }
  return { words: form.innerText.replace(/\s+/g, ' ').trim(), form: r(form), chips: [...chips.children].map(b => ({ t: b.textContent, ...r(b) })), date: r(date), to: document.querySelector('#p6sel') ? r(document.querySelector('#p6sel')) : null, postOut: r(a), cancel: r(c), noteLookFromPage: !!noteTpl }
}, { ...o, W: WT, to: TO, sqns: ['149', '150'], line: WP.transferLine(DAY, TO), dateWords: 'Mon 14 Dec 26' })

try {
  for (const sz of SZ) {
    for (const dir of ['A', 'B', 'C']) if (want(dir)) await run(`p6.${dir}.${sz}`, sz, async s => {
      const kw = `p6-${sz}-${dir}-war`, ku = `p6-${sz}-${dir}-users`
      await as(s, 'hunter'); await openPanel(s, 'postout')
      FACT(`${kw}.drawn`, await build(s, { dir, phone: !s.desk, outcome: 'transfer' }))
      await wait(s, 300); await s.page.evaluate(() => document.activeElement?.blur())
      const sh = await box(s, '#p6sheet'); await vring(s, sh, 20)
      await shot(s, kw, [sh], 18)
      const fz = await freeze(s)
      await s.page.evaluate(() => { document.querySelectorAll('.__p6ring').forEach(e => e.remove()); document.querySelector('#p6css')?.remove() })
      await closePanel(s, kw)
      FACT(`${ku}.rowButtons`, await cinchRow(s))
      if (dir === 'C') {
        FACT(`${ku}.drawn`, await rowFormWar(s, fz.html, !s.desk))
        await wait(s, 300); await s.page.evaluate(() => document.activeElement?.blur())
        const f = await box(s, '#p6form'), row = await box(s, '.acc-row.od-row-on'); await vring(s, f)
        await shot(s, ku, [{ ...row, y: row.y - 60, h: row.h + 130 }], 16)
      } else {
        const placed = await hang(s, fz.html); FACT(`${ku}.drawn`, placed)
        await wait(s, 300)
        const row = await box(s, '.acc-row.od-row-on'); await vring(s, placed, 20)
        await shot(s, ku, s.desk ? [{ ...row, y: row.y - 20, h: row.h + 40 }, placed] : [{ x: 0, y: 96, w: s.W, h: s.H - 96 }], 18)
      }
    }, { state: ST })
    /* the recommended direction as the real sheet opens (Overseas Sqn chosen by the app itself): no "To", nothing else moves */
    if (want('overseas')) await run(`p6.C.overseas.${sz}`, sz, async s => {
      const k = `p6-${sz}-C-war-overseas`
      await as(s, 'hunter'); await openPanel(s, 'postout')
      FACT(`${k}.drawn`, await build(s, { dir: 'C', phone: !s.desk, outcome: 'asis' }))
      await wait(s, 300); await s.page.evaluate(() => document.activeElement?.blur())
      const sh = await box(s, '#p6sheet'); await vring(s, sh, 20); await shot(s, k, [sh], 18)
      await s.page.evaluate(() => document.querySelectorAll('.__p6ring').forEach(e => e.remove())); await closePanel(s, k)
    }, { state: ST })
    /* Post in, in the recommended direction */
    if (want('postin')) await run(`p6.C.postin.${sz}`, sz, async s => {
      const k = `p6-${sz}-C-postin`
      await as(s, 'hunter'); await openPanel(s, 'postin')
      FACT(`${k}.drawn`, await build(s, { dir: 'C', phone: !s.desk, pi: true }))
      await wait(s, 300); await s.page.evaluate(() => document.activeElement?.blur())
      const sh = await box(s, '#p6sheet'); await vring(s, sh, 20); await shot(s, k, [sh], 18)
      await s.page.evaluate(() => document.querySelectorAll('.__p6ring').forEach(e => e.remove())); await closePanel(s, k)
    }, { state: ST })
  }
} finally { await closeAll() }
