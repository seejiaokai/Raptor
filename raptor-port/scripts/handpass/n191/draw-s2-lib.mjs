// draw-s2-lib - section 2's drawings, Admin → Users across squadrons (chat 191, 26 Nov 26; brief
// docs/superpowers/briefs/2026-11-26-msq-sections-draw-brief.md): the shared helpers. Drawn on the REAL app served at 4700
// (never started, stopped or rebuilt here), in round 6's world (n176's r6-users-state.json: 142, 149, 150; Hunter Plan of
// 149 and View of 150; Bolt View of 149; Blade a 142 admin; Osprey a second admin of 149). Nothing here writes the app's
// code. The page is built as round 6's approved pictures built it (n176/draw-r6-nav.mjs `build`, direction A - copied
// here because that file runs on import), in the app's own parts:
//   the bar      the page's own search row (search · Filter · "+ Add a person") at the very top (D2647, D2652 N13 i);
//                on a phone the four jumps under it (the app's filter chips) and "+ Add a person" under them
//   the rail     (desktop) the lit "Users" card grown to hold the jumps (D2652, way A)
//   the groups   under the squadron's own people: Outgoing, Incoming, From other squadrons (D2650), each heading the
//                page's own made a button with the app's fold mark; the folded other squadrons at the foot (D2652)
//   a short row opened: the man's REAL opened row (draw-s2-src.mjs) cut to the one access line with Save and Cancel
//                (D2655 D5), no grey number inside a folded squadron (D2652 N4)
// THE MARK: what is new in the app wears a teal dashed ring - 2px #0D9488, 4px clear of the part.
// Words: round 6's reviewed words (n176/words*.mjs: W, W6, WN) unchanged; new ones from ./words-s2.mjs (WS).
import { resolve } from 'node:path'
import { run, as, W, FACT, wait, vis, hit, usersTab, reachPick, shot, box, words, closeAll, typeInto, shotTall, barSq, addButton, openFormInPlace, rowFootRef, footLikeRow, greyLook, linesOf, TMP, DRAWN, LIST, lineParts, numbersFirst, note } from '../n176/draw-r5b-lib.mjs'
import { tapBell } from '../n175/p6-lib.mjs'
import { W6 } from '../n176/words-r6-users.mjs'
import { WN } from '../n176/words-r6-nav.mjs'
import { WS } from './words-s2.mjs'
import { sources, R6 } from './draw-s2-src.mjs'
export { run, as, W, W6, WN, WS, FACT, wait, vis, hit, usersTab, reachPick, shot, box, words, closeAll, typeInto, shotTall, barSq, addButton, openFormInPlace, rowFootRef, footLikeRow, greyLook, linesOf, TMP, DRAWN, LIST, lineParts, numbersFirst, note, tapBell, R6 }
export const TEAL = '#0D9488'
export const COL = { '142': '#F28C28', '149': '#D4AF37', '150': '#3B82F6' }   /* round 5's sample colours (D2638) */
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean), SZ = (process.env.SZ || '').split(',').filter(Boolean)
export const want = (k, sz) => (!ONLY.length || ONLY.includes(k)) && (!SZ.length || !sz || SZ.includes(sz))
export let S = null
export async function load() { S = await sources(); return S }
export const man = (u, cs) => S.P[u].find(p => p.cs === cs)
const roleOf = p => /master/i.test(p.badge || '') || /master/i.test(p.badgeClass || '') || p.cs === 'Saber' ? W6.roleMaster : /admin/i.test(p.badge || '') ? W6.roleAdmin : ''
/* what a man holds of the squadron in view: the world's (Hunter plans 149, Bolt views 149) and the drawn (Mako views
   149, Kestrel views 142 - round 6's) */
export const HOLDS = { 149: { Hunter: W6.alsoPlans('149'), Bolt: W6.alsoViews('149'), Mako: W6.alsoViews('149') }, 142: { Kestrel: W6.alsoViews('142') } }
export const subOf = (p, view) => { const r = roleOf(p); return [p.seatCat, r, r === W6.roleMaster ? '' : HOLDS[view]?.[p.cs] || ''].filter(Boolean).join(' · ') }
export const rowsOf = (u, view) => S.P[u].map(p => ({ key: 'g' + p.pid, pid: p.pid, cs: p.cs, sub: subOf(p, view) }))

/* ---- the teal ring ---- */
export const tring = (s, b, clear = 4) => b && s.page.evaluate(([b, c, g]) => { const d = document.createElement('div'); d.className = '__s2ring'; Object.assign(d.style, { position: 'absolute', boxSizing: 'border-box', left: (b.x - g - 2 + scrollX) + 'px', top: (b.y - g - 2 + scrollY) + 'px', width: (b.w + 2 * g + 4) + 'px', height: (b.h + 2 * g + 4) + 'px', border: '2px dashed ' + c, borderRadius: '8px', zIndex: 2147483646, pointerEvents: 'none' }); document.body.appendChild(d) }, [b, TEAL, clear])
export const tringFixed = (s, b, clear = 4) => b && s.page.evaluate(([b, c, g]) => { const d = document.createElement('div'); d.className = '__s2ring'; Object.assign(d.style, { position: 'fixed', boxSizing: 'border-box', left: (b.x - g - 2) + 'px', top: (b.y - g - 2) + 'px', width: (b.w + 2 * g + 4) + 'px', height: (b.h + 2 * g + 4) + 'px', border: '2px dashed ' + c, borderRadius: '8px', zIndex: 2147483646, pointerEvents: 'none' }); document.body.appendChild(d) }, [b, TEAL, clear])
export const unring = s => s.page.evaluate(() => document.querySelectorAll('.__s2ring').forEach(e => e.remove()))
export const ringAll = async (s, sels, fixed = false) => { for (const sel of sels) { const b = await box(s, sel); if (b) await (fixed ? tringFixed : tring)(s, b) } }
/* the box of some words inside an element, as drawn */
export const wordBox = (s, sel, word) => s.page.evaluate(([sel, word]) => {
  for (const e of document.querySelectorAll(sel)) { const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let t
    while ((t = w.nextNode())) { const i = t.textContent.indexOf(word); if (i < 0) continue; const r = document.createRange(); r.setStart(t, i); r.setEnd(t, i + word.length); const q = r.getBoundingClientRect(); if (q.width > 0) return { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) } } }
  return null
}, [sel, word])

/* ---- THE PAGE ---- */
export const build = (s, spec) => s.page.evaluate(({ spec, ARCH }) => {
  const q = sel => document.querySelector(sel)
  const desk = innerWidth > 820
  const users = q('#admUsers'), head = q('.od-head'), own = q('[data-testid="acc-groups"]'), h4 = users.querySelector(':scope > h4.adm-sub')
  const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } }
  const txt = e => e.innerText.replace(/[ \t\r\n]+/g, ' ').trim()
  /* the foot's "Add a person" block leaves: the top row's button opens the form (D2652 N13 i) */
  const blk = q('#accAddBlock'); if (blk && !spec.keepForm) { const sep = blk.previousElementSibling; if (sep?.tagName === 'HR') sep.style.display = 'none'; blk.style.display = 'none' }
  for (const pid of spec.leave || []) [...document.querySelectorAll(`[data-testid="acc-groups"] [data-person="${pid}"]`)].find(e => e.querySelector('.acc-sqn'))?.remove()
  for (const [pid, tag] of spec.tags || []) { const row = q(`[data-testid="acc-groups"] [data-person="${pid}"]`); if (!row) continue; const sub = row.querySelector('.acc-sub'); sub.append(' '); const t = document.createElement('span'); t.className = 'od-po'; t.textContent = tag; sub.appendChild(t) }
  const tpl = window.__s2tpl || [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].find(e => !e.querySelector('.acc-sqn') && !e.querySelector('.ub') && !e.querySelector('.acc-tag') && !e.querySelector('.od-po') && !e.classList.contains('od-row-on'))

  /* THE BAR */
  const bar = document.createElement('div'); bar.id = 's2bar'
  const fr = q('.od-findrow'); bar.appendChild(fr)
  Object.assign(fr.style, { flex: 'none', width: '100%', margin: '0' })
  const sb = fr.querySelector('.searchbox'); Object.assign(sb.style, { flex: '1 1 0', marginLeft: '0', minWidth: '0' })
  users.insertBefore(bar, users.firstChild)
  const add = q('#n176add')
  if (add && !desk) { bar.insertAdjacentElement('afterend', add); add.style.marginTop = '10px'; add.style.marginBottom = '18px' }
  else bar.style.marginBottom = '18px'
  if (!desk && spec.jumps) {
    const nav = document.createElement('div'); nav.id = 's2jumps'; nav.setAttribute('role', 'navigation'); nav.setAttribute('aria-label', spec.navName)
    Object.assign(nav.style, { display: 'flex', flexWrap: 'nowrap', gap: '6px', marginTop: '8px', overflowX: 'auto', scrollbarWidth: 'none' })
    for (const j of spec.jumps) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'fchip' + (j.lit ? ' on' : ''); b.id = 's2jump-' + j.id
      /* 'equal' (round 6's): the jumps share the row equally; 'words': each as wide as its own words need, the spare
         shared out; 'nocount': equal, the counts left off */
      Object.assign(b.style, spec.fit === 'words' ? { flex: '1 1 auto', minWidth: '0', whiteSpace: 'nowrap', paddingLeft: '2px', paddingRight: '2px' } : { flex: '1 1 0', minWidth: '0', whiteSpace: 'nowrap', paddingLeft: '0', paddingRight: '0' })
      if (spec.fit === 'nocount') b.append(j.short || j.label); else { b.append((j.short || j.label) + ' '); const c = document.createElement('span'); c.textContent = j.count; c.style.opacity = '.62'; b.appendChild(c) }
      if (j.lit) b.setAttribute('aria-current', 'true')
      if (j.off) { b.disabled = true; b.style.opacity = '.38' }
      nav.appendChild(b)
    }
    bar.appendChild(nav)
  }
  /* THE RAIL (desktop): the lit card grown; the new "Display" card after the last (section 3's page) */
  if (desk) {
    const cat = q('.adm-cat.on'), c = getComputedStyle(cat)
    if (spec.display) { const cats = [...q('.adm-rail').querySelectorAll('.adm-cat')], last = cats[cats.length - 1]; const d = last.cloneNode(true); d.id = 's2display'; d.classList.remove('on'); d.removeAttribute('aria-current')
      d.querySelector('.adm-cat-l').textContent = spec.display[0]; d.querySelector('.adm-cat-s').textContent = spec.display[1]
      d.querySelector('.adm-cat-ic').innerHTML = '<svg class="btnglyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><circle cx="8.5" cy="10" r="1.3"></circle><circle cx="12" cy="7.5" r="1.3"></circle><circle cx="15.5" cy="10" r="1.3"></circle><path d="M12 21a2.5 2.5 0 0 1 0-5h2.5"></path></svg>'
      last.after(d) }
    if (spec.jumps) {
      const wrap = document.createElement('div'); wrap.id = 's2card'
      Object.assign(wrap.style, { background: c.backgroundColor, borderStyle: 'solid', borderWidth: '1px 1px 1px 3px', borderColor: `${c.borderTopColor} ${c.borderRightColor} ${c.borderBottomColor} ${c.borderLeftColor}`, borderRadius: c.borderRadius, marginBottom: c.marginBottom, boxSizing: 'border-box', width: '100%' })
      cat.parentElement.insertBefore(wrap, cat); wrap.appendChild(cat)
      Object.assign(cat.style, { background: 'transparent', border: '0', borderRadius: '0', margin: '0' })
      const lab = cat.querySelector('.adm-cat-l').getBoundingClientRect().left - wrap.getBoundingClientRect().left - 3
      const list = document.createElement('div'); list.id = 's2rail'; list.setAttribute('role', 'navigation'); list.setAttribute('aria-label', spec.navName)
      Object.assign(list.style, { padding: `0 8px 8px ${Math.round(lab) - 9}px`, display: 'grid', gap: '2px' })
      const sml = getComputedStyle(cat.querySelector('.adm-cat-s'))
      for (const j of spec.jumps) {
        const b = document.createElement('button'); b.type = 'button'; b.id = 's2jump-' + j.id
        Object.assign(b.style, { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%', height: '28px', boxSizing: 'border-box', padding: '0 8px', borderRadius: '8px', border: '1px solid transparent', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: sml.fontFamily, fontSize: '12px', fontWeight: '600', color: 'var(--ink-2)' })
        const t = document.createElement('span'); t.textContent = j.label; const k = document.createElement('span'); k.textContent = j.count; k.style.color = 'var(--ink-3)'; k.style.fontVariantNumeric = 'tabular-nums'
        b.append(t, k)
        if (j.lit) { Object.assign(b.style, { background: 'rgba(59,198,232,.16)', borderColor: 'rgba(59,198,232,.6)', color: 'var(--accent)' }); k.style.color = 'var(--accent)'; k.style.opacity = '.7'; b.setAttribute('aria-current', 'true') }
        if (j.off) { b.disabled = true; b.style.opacity = '.38'; b.style.cursor = 'default' }
        list.appendChild(b)
      }
      wrap.appendChild(list)
    }
  }

  /* A SHORT ROW, and a short row OPENED (his real opened row cut to the one access line) */
  const strip = e => { e.querySelectorAll('.od-c').forEach(y => y.remove()); const rc = e.querySelector('.od-rc'); if (rc) rc.textContent = '' }
  const name = (e, x) => { const nm = e.querySelector('.acc-name'); nm.textContent = x.cs; if (x.chip) { const m = document.createElement('span'); m.className = 'acc-sqn'; m.textContent = x.chip; nm.appendChild(m) }
    const sub = e.querySelector('.acc-sub'); sub.textContent = x.sub; if (x.tag) { sub.append(' '); const t = document.createElement('span'); t.className = 'od-po'; t.textContent = x.tag; sub.appendChild(t) }
    if (x.you) { const t = document.createElement('span'); t.className = 'acc-tag you'; t.textContent = 'you'; sub.appendChild(t) } }
  const mkCard = x => {
    const o = x.card, h = document.createElement('div'); h.innerHTML = o.html; const c = h.firstElementChild
    c.dataset.person = 's2-' + x.key; c.id = 's2opened'; c.removeAttribute('data-acct'); c.querySelector('.acc-tap')?.removeAttribute('title')
    c.querySelectorAll('.ub, .acc-tag').forEach(e => e.remove()); strip(c); name(c, x)
    const edit = c.querySelector('.acc-edit')
    edit.querySelector(':scope > .adm-2col')?.remove(); edit.querySelector('details.acc-roles')?.remove()
    const acts = [...edit.querySelectorAll(':scope > .acc-acts')].pop(); acts.id = 's2acts'
    for (const b of [...acts.querySelectorAll('button')]) { const t = b.textContent.trim(); if (!(t === 'Cancel' || (t === 'Save' && o.kind !== 'nosignin'))) b.remove(); else b.removeAttribute('id') }
    const sq = edit.querySelector('.acc-sq')
    if (o.kind === 'nosignin') { sq.remove(); const p2 = document.createElement('p'); p2.className = 'adm-note'; p2.id = 's2nosignin'; p2.textContent = o.words; p2.style.margin = '0 0 10px'; edit.insertBefore(p2, acts) }
    else {
      const grp = [...sq.querySelectorAll('[role="group"]')].find(g => new RegExp(o.view + '$').test(g.getAttribute('aria-label') || '')), num = grp.previousElementSibling
      const noteEl = grp.nextElementSibling?.classList.contains('acc-sq-note') ? grp.nextElementSibling : null
      for (const e of [...sq.children]) if (e !== grp && e !== num && e !== noteEl) e.remove()
      grp.id = 's2line'
      for (const b of grp.querySelectorAll('button')) { const on = b.dataset.line === o.line; b.setAttribute('aria-pressed', String(on)); b.className = 'abtn' + (on ? ' primary' : ''); b.disabled = !(o.live || []).includes(b.dataset.line); b.id = 's2line-' + b.dataset.line }
      if (o.note === undefined) { /* the app's own note kept */ if (noteEl) noteEl.id = 's2note' }
      else { noteEl?.remove(); if (o.note) { const p2 = document.createElement('p'); p2.className = 'adm-note acc-sq-note'; p2.id = 's2note'; p2.textContent = o.note; grp.after(p2) } }
    }
    const first = edit.firstElementChild; if (first) first.style.marginTop = '0'
    return c
  }
  const mkRow = x => {
    if (x.card) return mkCard(x)
    const e = tpl.cloneNode(true); e.dataset.person = 's2-' + x.key; e.id = 's2row-' + x.key; e.querySelector('.acc-tap').removeAttribute('title'); e.querySelector('.acc-tap').disabled = false
    strip(e); name(e, x)
    if (x.landed) { e.classList.add('acc-ring'); e.style.boxShadow = 'inset 0 0 0 2px #1E86FF' }   /* the app's own landing ring (UsersPanel's ringed row; its still look, the flash stopped for the picture) */
    return e
  }
  const listOf = (rows, id) => { const l = document.createElement('div'); l.className = 'acc-list od-list'; if (id) l.id = id; for (const x of rows) l.appendChild(mkRow(x)); return l }
  const fold = (id, label, rows) => { const t = document.createElement('div'); t.innerHTML = ARCH; const b = t.firstElementChild; b.id = id; b.querySelector('#accArchList')?.remove(); const btn = b.querySelector('button'); btn.id = id + 'Btn'; btn.setAttribute('aria-expanded', rows ? 'true' : 'false'); btn.textContent = label; if (rows) b.appendChild(listOf(rows, id + 'List')); return b }
  let at = q('#accArchived') || own
  const after = e => { at.insertAdjacentElement('afterend', e); at = e }
  for (const g of spec.groups || []) {
    const d = document.createElement('div'); d.id = 's2' + g.id; d.style.marginTop = '24px'
    const h = h4.cloneNode(false); h.id = 's2' + g.id + '-h'; h.style.margin = g.closed ? '0' : '0 0 2px'
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-expanded', g.closed ? 'false' : 'true')
    Object.assign(b.style, { display: 'flex', alignItems: 'center', width: '100%', minHeight: '28px', padding: '0', margin: '0', background: 'none', border: '0', cursor: 'pointer', font: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit', color: 'inherit', textAlign: 'left' })
    const mk = document.createElement('span'); mk.textContent = g.label.slice(0, 1); Object.assign(mk.style, { fontSize: '12px', letterSpacing: '0', width: '12px', marginRight: '6px', flex: '0 0 auto', lineHeight: '1' }); b.append(mk, g.label.slice(2)); h.appendChild(b); d.appendChild(h)
    if (g.reached) h.style.color = 'var(--ink)'
    if (!g.closed) {
      if (g.empty) { const p = document.createElement('p'); p.className = 'adm-note'; p.id = 's2' + g.id + '-empty'; p.textContent = g.empty; p.style.margin = '6px 0 0'; d.appendChild(p) }
      if (g.rows?.length) d.appendChild(listOf(g.rows))
      if (g.fold) { const f = fold('s2viewfold', g.fold, g.foldRows); if (!g.rows?.length) f.style.marginTop = '8px'; d.appendChild(f) }
    }
    after(d)
  }
  if (spec.sqFolds?.length) {
    const hr = users.querySelector(':scope > hr.adm-sep').cloneNode(false); hr.id = 's2rule'; hr.style.display = ''; after(hr)
    spec.sqFolds.forEach(([num, label, rows], i) => { const f = fold('s2sq' + num, label, rows); if (!i) f.style.marginTop = '0'; after(f) })
  }
  /* THE SEARCH'S HIDING (D2647): a group with no match hides */
  if (spec.hidePeople) for (const e of [head, own, q('#accArchived')]) if (e) e.style.display = 'none'
  if (spec.hideWaiting) for (const e of [...users.children]) { if (e === bar || e === add) continue; if (e === head) break; e.style.display = 'none' }
  /* nobody anywhere: the app's own "Nobody matches." alone under the bar */
  if (spec.nobody) { const p = q('#accNoMatch'); if (!p) throw new Error('the app shows no "Nobody matches."'); const keep = p.cloneNode(true); keep.id = 's2nomatch'; keep.style.margin = '6px 0 0'; (add && !desk ? add : bar).insertAdjacentElement('afterend', keep) }
  document.activeElement?.blur()
  return { bar: r(bar), search: r(sb), filter: r(q('#accFilter')), add: r(add), jumps: [...document.querySelectorAll('[id^=s2jump-]')].map(b => ({ id: b.id.slice(7), words: txt(b), box: r(b), lit: b.getAttribute('aria-current') === 'true', greyed: b.disabled, wordsFit: b.scrollWidth <= b.clientWidth + 1 })), jumpsRowScrolls: q('#s2jumps') ? q('#s2jumps').scrollWidth - q('#s2jumps').clientWidth : null,
    railCards: [...document.querySelectorAll('.adm-rail .adm-cat')].map(c => c.querySelector('.adm-cat-l').textContent),
    headings: [...users.querySelectorAll('h4')].filter(h => h.getBoundingClientRect().height > 0).map(txt),
    notes: [...users.querySelectorAll('p.adm-note')].filter(h => h.getBoundingClientRect().height > 0).map(txt),
    groupRows: Object.fromEntries((spec.groups || []).map(g => ['s2' + g.id, [...document.querySelectorAll('#s2' + g.id + ' .acc-row')].map(txt)])),
    folds: [...users.querySelectorAll('.od-arch > button')].filter(b => b.getBoundingClientRect().height > 0).map(b => b.textContent), foldRows: [...users.querySelectorAll('.od-arch .acc-row')].filter(b => b.getBoundingClientRect().height > 0).slice(0, 12).map(txt),
    greyNumbersInFolds: document.querySelectorAll('[id^=s2sq] .acc-sqn').length,
    opened: q('#s2opened') ? { words: txt(q('#s2opened')), buttons: [...q('#s2opened').querySelectorAll('button')].filter(b => !b.classList.contains('acc-tap')).map(b => b.textContent.trim() + (b.disabled ? ' [greyed]' : '') + (b.classList.contains('primary') ? ' [main]' : '')) } : null,
    ownRows: [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row')].filter(b => b.getBoundingClientRect().height > 0).length, pageHigh: document.documentElement.scrollHeight }
}, { spec, ARCH: S.ARCH })

/* WHAT STAYS PUT once the page is scrolled (round 6's `pin`): Admin's left column held where it stands (desktop); the
   search row and the jumps held just under the top bar (phone). Drawn fixed for the picture. */
export const pin = s => s.page.evaluate(desk => {
  const q = sel => document.querySelector(sel), out = {}
  const top = Math.round(q('.topbar').getBoundingClientRect().bottom)
  if (desk) { const e = q('.adm-rail'), b = e.getBoundingClientRect(); const ph = document.createElement('div'); ph.style.flex = `0 0 ${b.width}px`; e.insertAdjacentElement('beforebegin', ph)
    Object.assign(e.style, { position: 'fixed', left: b.left + 'px', top: (top + 18) + 'px', width: b.width + 'px' }); out.rail = { top: top + 18 } }
  else { const e = q('#s2bar'), pane = q('.adm-pane-body').getBoundingClientRect(), b = e.getBoundingClientRect(), c = getComputedStyle(q('.adm-pane'))
    const ph = document.createElement('div'); ph.style.height = b.height + 'px'; ph.style.marginBottom = e.style.marginBottom; e.insertAdjacentElement('beforebegin', ph)
    Object.assign(e.style, { position: 'fixed', left: pane.left + 'px', top: top + 'px', width: pane.width + 'px', boxSizing: 'border-box', padding: '10px 16px', background: c.backgroundColor, borderBottom: '1px solid var(--edge)', zIndex: '40', margin: '0' })
    out.bar = { top, high: Math.round(e.getBoundingClientRect().height) } }
  return out
}, s.desk)
export const pinnedFoot = s => s.page.evaluate(() => { const b = document.querySelector('#s2bar'); return Math.round(getComputedStyle(b).position === 'fixed' ? b.getBoundingClientRect().bottom : document.querySelector('.topbar').getBoundingClientRect().bottom) })
export const headTo = async (s, sel, under) => { await s.page.evaluate(([sel, under]) => { const a = document.querySelector(sel).getBoundingClientRect(); scrollBy(0, a.top - under) }, [sel, under]); await wait(s, 350); return s.page.evaluate(sel => ({ scrollY: Math.round(scrollY), most: Math.round(document.documentElement.scrollHeight - innerHeight), headingAt: Math.round(document.querySelector(sel).getBoundingClientRect().top) }), sel) }

/* ---- specs ---- */
export const J = (lit, off = []) => (ids, counts) => ids.map((id, i) => ({ id, label: { people: WN.jumpPeople, out: WN.jumpOutgoing, in: WN.jumpIncoming, other: WN.jumpOther }[id], short: id === 'other' ? WN.jumpOtherShort : undefined, count: counts[i], lit: id === lit, off: off.includes(id) }))
export const mark = (closed, t) => (closed ? WN.closed(t) : WN.open(t))
export const sqFolds = (...nums) => nums.map(u => [String(u), W6.folded(u, S.COUNT[u])])
/* 149's page as round 6 approved it (j6-*-149), for whoever looks */
export function spec149({ lit = 'people', other = {}, sq = {}, groups = null, jumps = null } = {}) {
  const hunter = man('142', 'Hunter'), saber = man('142', 'Saber'), cinch = man('142', 'Cinch'), raven = man('149', 'Raven')
  return { navName: WN.navName, leave: ['prowler'], tags: [[raven.pid, W6.postingOutTo('4 Jan', '150')]],
    jumps: jumps || J(lit)(['people', 'out', 'in', 'other'], [S.COUNT['149'], 1, 1, 4]),
    groups: groups || [
      { id: 'out', label: WN.open(W6.outgoing(1)), rows: [{ key: 'raven', cs: 'Raven', sub: raven.seatCat, tag: W6.postingOutTo('4 Jan', '150') }] },
      { id: 'in', label: WN.open(W6.incoming(1)), rows: [{ key: 'cinch', cs: 'Cinch', chip: '142', sub: subOf(cinch, '149'), tag: W6.postingIn('14 Dec') }] },
      { id: 'other', label: WN.open(W6.fromOther(4)), rows: [{ key: 'hunter', cs: 'Hunter', chip: '142', sub: subOf(hunter, '149'), ...(other.hunter || {}) }, { key: 'saber', cs: 'Saber', chip: '142', sub: subOf(saber, '149') }], fold: other.fold || W6.viewOnly(2), foldRows: other.foldRows },
    ],
    sqFolds: [['142', sq['142']?.label || W6.folded('142', S.COUNT['142']), sq['142']?.rows], ['150', W6.folded('150', S.COUNT['150'])]] }
}
/* the two View-only holders of 149 (Bolt, real; Mako of 150, drawn - round 6's) */
export const viewRows = () => { const bolt = man('142', 'Bolt'), mako = man('150', 'Mako'); return [{ key: 'bolt', cs: 'Bolt', chip: '142', sub: subOf(bolt, '149') }, { key: 'mako', cs: 'Mako', chip: '150', sub: subOf(mako, '149') }] }
export const start = async (s, who, pick) => { await as(s, who); if (pick) await reachPick(s, pick, s.desk ? 'bar' : 'menu'); await usersTab(s); await wait(s, 400); return addButton(s, W) }
export const column = async s => { const pane = await box(s, '.adm-pane'), rail = s.desk ? await box(s, '.adm-rail') : null; const x = rail ? rail.x : pane.x; return { x, w: pane.x + pane.w - x } }
export const paneCol = s => box(s, '.adm-pane')
/* a real, app-raised passing note held for the picture (its fade stopped) */
export async function holdToast(s) {
  await s.page.evaluate(() => { const t = document.querySelector('#toastEl'); t.getAnimations?.().forEach(a => a.cancel()); const put = () => { if (t.style.opacity !== '1') t.style.opacity = '1' }; put(); new MutationObserver(put).observe(t, { attributes: true, attributeFilter: ['style'] }) })
  await wait(s, 150)
  return s.page.evaluate(() => { const t = document.querySelector('#toastEl'), b = t.getBoundingClientRect(); return { words: t.textContent.replace(/[ \t\r\n]+/g, ' ').trim(), face: t.dataset.face || null, box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } } })
}
/* the bell's numbers and Show buttons in their squadron colours (D2638; draw-r5b-both's paint) */
export const paintBell = s => s.page.evaluate(([L, COL]) => { const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(','); for (const m of document.querySelectorAll(L + ' .bl-sqn')) { const c = COL[m.textContent.trim()]; if (c) Object.assign(m.style, { color: c, borderColor: `rgba(${hex(c)},.6)`, background: `rgba(${hex(c)},.16)` }) } for (const b of document.querySelectorAll(L + ' [data-testid="bell-show"] button')) { const c = COL[b.textContent.trim()]; if (c) { const on = b.getAttribute('aria-pressed') === 'true'; Object.assign(b.style, { color: c, borderColor: `rgba(${hex(c)},${on ? .6 : .35})`, background: `rgba(${hex(c)},${on ? .16 : .06})` }) } }
  return { numbers: [...document.querySelectorAll(L + ' .bl-sqn')].filter(m => m.getBoundingClientRect().width > 0 && getComputedStyle(m).visibility !== 'hidden').map(m => m.textContent.trim() + ' ' + getComputedStyle(m).color), show: [...document.querySelectorAll(L + ' [data-testid="bell-show"] button')].map(b => `${b.textContent.trim()}:${b.getAttribute('aria-pressed') === 'true' ? 'on' : 'off'} ${getComputedStyle(b).color}`) } }, [LIST, COL])
