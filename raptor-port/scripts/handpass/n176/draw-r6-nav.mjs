// draw-r6-nav - Admin → Users across squadrons with the NEW ORDER (his D2650), the ONE SEARCH AT THE TOP (D2647) and a
// way to JUMP to each heading, drawn on the REAL app (chat 188, a fresh Fable, 26 Nov 26; brief
// docs/superpowers/briefs/2026-11-26-msq-r6-users-nav-brief.md; report …-r6-users-nav-report.md).
// Nothing here writes the app's code. New words come from ./words-r6-nav.mjs (WN); round 6's from ./words-r6-users.mjs
// (W6); round 5's "+ Add a person" from ./words.mjs (W). What is NEW SINCE ROUND 6's DRAWINGS wears a violet dashed ring
// (2px #8B5CF6). The world is round 6's (r6-users-state.json), read only.
// TWO DIRECTIONS, the phone the same in both:
//   A  the desktop's jumps live in Admin's own left column, inside the lit "Users" card; the column stays put
//   B  the desktop's jumps are a row of the app's filter chips under the search, the two rows pinned (as the phone)
// DRAWN, NOT IN THE WORLD: round 6's (Cinch to 149 on 14 Dec, Raven to 150 on 4 Jan, Mako's View of 149) and, on 142's
// page, Mako posting in on 4 Jan and Kestrel's View of 142 - so 142's page shows every group.
//  j6-d-A-149  j6-d-B-149  j6-p-149      Kestrel (149, 10 people), the page from its top
//  j6-d-A-142  j6-d-B-142  j6-p-142      Hunter (142, 60 people), the page from its top
//  j6-d-A-mid  j6-d-B-mid  j6-p-mid      Hunter, halfway down the sixty: what stays in reach
//  j6-d-A-jump j6-d-B-jump j6-p-jump     Hunter, "Outgoing" pressed: the heading reached, the jump lit
//  j6-d-A-fold               j6-p-fold   Kestrel, "From other squadrons" folded shut
//  j6-d-A-search j6-d-B-search j6-p-search  Kestrel, "Bol" typed: the groups filtered
//   node raptor-port/scripts/handpass/n176/draw-r6-nav.mjs   (ONLY=149,142,mid,jump,fold,search  DIRS=A,B,p  FRESH=1 re-reads the people)
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { run, as, W, FACT, wait, usersTab, reachPick, shot, box, words, closeAll, typeInto, shotTall, barSq, addButton, TMP } from './draw-r5b-lib.mjs'
import { W6 } from './words-r6-users.mjs'
import { WN } from './words-r6-nav.mjs'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean), DIRS = (process.env.DIRS || '').split(',').filter(Boolean)
const want = (k, d) => (!ONLY.length || ONLY.includes(k)) && (!DIRS.length || DIRS.includes(d))
const R6 = resolve(TMP, 'r6-users-state.json'), SRC = resolve(TMP, 'j6-sources.json')
if (!existsSync(R6)) throw new Error('no round-6 world: run draw-r6-users.mjs first')
const VIOLET = '#8B5CF6'
let ARCH = null, P = {}, COUNT = {}
const n = t => Number(String(t).replace(/\D+/g, ''))

/* ---- the people of each squadron, read off its own page (Saber, a master admin), kept for the re-runs ---- */
const peopleNow = s => s.page.evaluate(() => [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].filter(e => !e.querySelector('.acc-sqn')).map(e => {
  const sub = [...e.querySelector('.acc-sub').childNodes].map(n => n.nodeType === 3 ? n.textContent : (n.classList?.contains('od-rw') || n.classList?.contains('od-plans') || n.classList?.contains('od-po') || n.classList?.contains('acc-tag') ? '' : n.textContent)).join('')
  const parts = sub.split(' · ').map(x => x.trim()).filter(Boolean)
  const ub = e.querySelector('.ub')
  return { pid: e.dataset.person, cs: e.querySelector('.acc-name').childNodes[0].textContent, seatCat: parts.slice(1).filter(p => !/^also /.test(p)).join(' · '), badge: ub ? ub.textContent.trim() : null, badgeClass: ub ? ub.className : null }
}))
async function readSources() {
  if (existsSync(SRC) && !process.env.FRESH) { ({ ARCH, P, COUNT } = JSON.parse(readFileSync(SRC, 'utf8'))); return }
  await run('j6.read', 'd', async s => {
    await as(s, 'saber'); await usersTab(s); await wait(s, 400)
    ARCH = await s.page.evaluate(() => document.querySelector('#accArchived').outerHTML)
    P['142'] = await peopleNow(s); COUNT['142'] = n((await words(s, '.od-head .adm-sub'))[0])
    for (const u of [149, 150]) { await reachPick(s, u, 'bar'); await usersTab(s); await wait(s, 400); P[u] = await peopleNow(s); COUNT[u] = n((await words(s, '.od-head .adm-sub'))[0]) }
  }, { state: R6 })
  writeFileSync(SRC, JSON.stringify({ ARCH, P, COUNT }))
}
const man = (u, cs) => P[u].find(p => p.cs === cs)
const roleOf = p => /master/i.test(p.badge || '') || /master/i.test(p.badgeClass || '') || p.cs === 'Saber' ? W6.roleMaster : /admin/i.test(p.badge || '') ? W6.roleAdmin : ''
const HOLDS = { 149: { Hunter: W6.alsoPlans('149'), Bolt: W6.alsoViews('149'), Mako: W6.alsoViews('149') }, 142: { Kestrel: WN.kestrelHolds('142') } }
const subOf = (p, view) => { const r = roleOf(p); return [p.seatCat, r, r === W6.roleMaster ? '' : HOLDS[view]?.[p.cs] || ''].filter(Boolean).join(' · ') }

/* ---- the violet ring: what is new since round 6's drawings ---- */
const vring = (s, b, grow = 6) => b && s.page.evaluate(([b, c, g]) => { const d = document.createElement('div'); d.className = '__j6ring'; Object.assign(d.style, { position: 'absolute', boxSizing: 'border-box', left: (b.x - g + scrollX) + 'px', top: (b.y - g + scrollY) + 'px', width: (b.w + 2 * g) + 'px', height: (b.h + 2 * g) + 'px', border: '2px dashed ' + c, borderRadius: '8px', zIndex: 2147483646, pointerEvents: 'none' }); document.body.appendChild(d) }, [b, VIOLET, grow])

/* ---- THE PAGE, built from the page's own parts ----
   the bar      the page's own search row (search · Filter · round 5's "+ Add a person") moved to the very top of the
                page (D2647); with chips (B, and every phone) the row of jumps under it - the app's filter chips (.fchip),
                the bell's "Show" row's way (one row, 6px apart, sliding sideways before it wraps)
   the groups   under the squadron's own people (and its "▸ Archived"): Outgoing, Incoming, From other squadrons (D2650) -
                each heading the page's own (h4.adm-sub) made a button with the app's fold mark before its words; the rows
                the page's own short rows; then the page's rule and the folded squadrons (D2629), cloned from "▸ Archived"
   the rail     (A, desktop) the lit "Users" card grown to hold the jumps: the card's own look carried by a wrapper, the
                jumps a list under its two lines, the words starting where the card's own words start */
const build = (s, spec) => s.page.evaluate(({ spec, ARCH }) => {
  const q = sel => document.querySelector(sel)
  const desk = innerWidth > 820
  const users = q('#admUsers'), head = q('.od-head'), own = q('[data-testid="acc-groups"]'), h4 = users.querySelector(':scope > h4.adm-sub')
  const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } }
  /* the foot's "Add a person" block leaves: round 5's button opens the form in place (D2628) */
  const blk = q('#accAddBlock'); if (blk) { const sep = blk.previousElementSibling; if (sep?.tagName === 'HR') sep.style.display = 'none'; blk.style.display = 'none' }
  /* a man listed in the block leaves the squadron's own list (round 6's way); a waiting posting's amber tag on his own row */
  for (const pid of spec.leave || []) [...document.querySelectorAll(`[data-testid="acc-groups"] [data-person="${pid}"]`)].find(e => e.querySelector('.acc-sqn'))?.remove()
  for (const [pid, tag] of spec.tags || []) { const row = q(`[data-testid="acc-groups"] [data-person="${pid}"]`); if (!row) continue; const sub = row.querySelector('.acc-sub'); sub.append(' '); const t = document.createElement('span'); t.className = 'od-po'; t.textContent = tag; sub.appendChild(t) }
  const tpl = window.__j6tpl || [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].find(e => !e.querySelector('.acc-sqn') && !e.querySelector('.ub') && !e.querySelector('.acc-tag') && !e.querySelector('.od-po') && !e.classList.contains('od-row-on'))

  /* THE BAR */
  const bar = document.createElement('div'); bar.id = 'j6bar'
  const fr = q('.od-findrow'); bar.appendChild(fr)
  Object.assign(fr.style, { flex: 'none', width: '100%', margin: '0' })
  const sb = fr.querySelector('.searchbox'); Object.assign(sb.style, { flex: '1 1 0', marginLeft: '0', minWidth: '0' })
  users.insertBefore(bar, users.firstChild)
  const add = q('#n176add')
  if (add && !desk) { bar.insertAdjacentElement('afterend', add); add.style.marginTop = '10px'; add.style.marginBottom = '18px' }
  else bar.style.marginBottom = '18px'
  const jumpWords = j => (desk ? j.label : j.short || j.label)
  if (spec.chips) {
    const nav = document.createElement('div'); nav.id = 'j6jumps'; nav.setAttribute('role', 'navigation'); nav.setAttribute('aria-label', spec.navName)
    Object.assign(nav.style, { display: 'flex', flexWrap: 'nowrap', gap: '6px', marginTop: '8px', overflowX: 'auto', scrollbarWidth: 'none' })
    for (const j of spec.jumps) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'fchip' + (j.lit ? ' on' : ''); b.id = 'j6jump-' + j.id
      Object.assign(b.style, desk ? { flex: '0 0 auto', whiteSpace: 'nowrap' } : { flex: '1 1 0', minWidth: '0', whiteSpace: 'nowrap', paddingLeft: '0', paddingRight: '0' })   /* a phone: the jumps share the row's width equally, so every one always shows */
      b.append(jumpWords(j) + ' '); const c = document.createElement('span'); c.textContent = j.count; c.style.opacity = '.62'; b.appendChild(c)
      if (j.lit) b.setAttribute('aria-current', 'true')
      if (j.off) { b.disabled = true; b.style.opacity = '.38' }
      nav.appendChild(b)
    }
    bar.appendChild(nav)
  }
  /* THE RAIL (A, desktop): the lit card grown */
  if (spec.rail && desk) {
    const cat = q('.adm-cat.on'), c = getComputedStyle(cat)
    const wrap = document.createElement('div'); wrap.id = 'j6card'
    Object.assign(wrap.style, { background: c.backgroundColor, borderStyle: 'solid', borderWidth: '1px 1px 1px 3px', borderColor: `${c.borderTopColor} ${c.borderRightColor} ${c.borderBottomColor} ${c.borderLeftColor}`, borderRadius: c.borderRadius, marginBottom: c.marginBottom, boxSizing: 'border-box', width: '100%' })
    cat.parentElement.insertBefore(wrap, cat); wrap.appendChild(cat)
    Object.assign(cat.style, { background: 'transparent', border: '0', borderRadius: '0', margin: '0' })
    const lab = cat.querySelector('.adm-cat-l').getBoundingClientRect().left - wrap.getBoundingClientRect().left - 3   /* where the card's own words start, inside its left bar */
    const list = document.createElement('div'); list.id = 'j6rail'; list.setAttribute('role', 'navigation'); list.setAttribute('aria-label', spec.navName)
    Object.assign(list.style, { padding: `0 8px 8px ${Math.round(lab) - 9}px`, display: 'grid', gap: '2px' })
    const sml = getComputedStyle(cat.querySelector('.adm-cat-s'))
    for (const j of spec.jumps) {
      const b = document.createElement('button'); b.type = 'button'; b.id = 'j6jump-' + j.id
      Object.assign(b.style, { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%', height: '28px', boxSizing: 'border-box', padding: '0 8px', borderRadius: '8px', border: '1px solid transparent', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: sml.fontFamily, fontSize: '12px', fontWeight: '600', color: 'var(--ink-2)' })
      const t = document.createElement('span'); t.textContent = j.label; const k = document.createElement('span'); k.textContent = j.count; k.style.color = 'var(--ink-3)'; k.style.fontVariantNumeric = 'tabular-nums'
      b.append(t, k)
      if (j.lit) { Object.assign(b.style, { background: 'rgba(59,198,232,.16)', borderColor: 'rgba(59,198,232,.6)', color: 'var(--accent)' }); k.style.color = 'var(--accent)'; k.style.opacity = '.7'; b.setAttribute('aria-current', 'true') }
      if (j.off) { b.disabled = true; b.style.opacity = '.38'; b.style.cursor = 'default' }
      list.appendChild(b)
    }
    wrap.appendChild(list)
  }

  /* THE GROUPS under the squadron's own people */
  const mkRow = x => {
    const e = tpl.cloneNode(true); e.dataset.person = 'j6-' + x.key; e.id = 'j6row-' + x.key; e.querySelector('.acc-tap').removeAttribute('title'); e.querySelector('.acc-tap').disabled = false
    const nm = e.querySelector('.acc-name'); nm.textContent = x.cs
    if (x.chip) { const m = document.createElement('span'); m.className = 'acc-sqn'; m.textContent = x.chip; nm.appendChild(m) }
    const sub = e.querySelector('.acc-sub'); sub.textContent = x.sub
    if (x.tag) { sub.append(' '); const t = document.createElement('span'); t.className = 'od-po'; t.textContent = x.tag; sub.appendChild(t) }
    e.querySelectorAll('.od-c').forEach(y => y.remove()); const rc = e.querySelector('.od-rc'); if (rc) rc.textContent = ''
    return e
  }
  const listOf = rows => { const l = document.createElement('div'); l.className = 'acc-list od-list'; for (const x of rows) l.appendChild(mkRow(x)); return l }
  const fold = (id, label, rows) => { const t = document.createElement('div'); t.innerHTML = ARCH; const b = t.firstElementChild; b.id = id; b.querySelector('#accArchList')?.remove(); const btn = b.querySelector('button'); btn.id = id + 'Btn'; btn.setAttribute('aria-expanded', rows ? 'true' : 'false'); btn.textContent = label; if (rows) b.appendChild(listOf(rows)); return b }
  let at = q('#accArchived') || own
  const after = e => { at.insertAdjacentElement('afterend', e); at = e }
  for (const g of spec.groups) {
    const d = document.createElement('div'); d.id = 'j6' + g.id; d.style.marginTop = '24px'
    const h = h4.cloneNode(false); h.id = 'j6' + g.id + '-h'; h.style.margin = g.closed ? '0' : '0 0 2px'
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-expanded', g.closed ? 'false' : 'true')
    /* the whole line presses; the look is the heading's own */
    Object.assign(b.style, { display: 'flex', alignItems: 'center', width: '100%', minHeight: '28px', padding: '0', margin: '0', background: 'none', border: '0', cursor: 'pointer', font: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit', color: 'inherit', textAlign: 'left' })
    const mk = document.createElement('span'); mk.textContent = g.label.slice(0, 1); Object.assign(mk.style, { fontSize: '12px', letterSpacing: '0', width: '12px', marginRight: '6px', flex: '0 0 auto', lineHeight: '1' }); b.append(mk, g.label.slice(2)); h.appendChild(b); d.appendChild(h)
    if (g.reached) h.style.color = 'var(--ink)'
    if (!g.closed) {
      if (g.empty) { const p = document.createElement('p'); p.className = 'adm-note'; p.textContent = g.empty; p.style.margin = '0'; d.appendChild(p) }
      if (g.rows?.length) d.appendChild(listOf(g.rows))
      if (g.fold) d.appendChild(fold('j6viewfold', g.fold, g.foldRows))
    }
    after(d)
  }
  if (spec.sqFolds?.length) {
    const hr = users.querySelector(':scope > hr.adm-sep').cloneNode(false); hr.id = 'j6rule'; hr.style.display = ''; after(hr)
    spec.sqFolds.forEach(([num, label, rows], i) => { const f = fold('j6sq' + num, label, rows); if (!i) f.style.marginTop = '0'; after(f) })
  }
  /* THE SEARCH'S HIDING (D2647): a group with no match hides */
  if (spec.hidePeople) for (const e of [head, own, q('#accArchived')]) if (e) e.style.display = 'none'
  if (spec.hideWaiting) for (const e of [...users.children]) { if (e === bar || e === add) continue; if (e === head) break; e.style.display = 'none' }
  document.activeElement?.blur()
  return { bar: r(bar), search: r(sb), filter: r(q('#accFilter')), add: r(add), jumps: [...document.querySelectorAll('[id^=j6jump-]')].map(b => ({ id: b.id.slice(7), words: b.innerText.replace(/\s+/g, ' ').trim(), box: r(b), lit: b.getAttribute('aria-current') === 'true', greyed: b.disabled })), jumpsRow: r(q('#j6jumps')), jumpsRowScrolls: q('#j6jumps') ? q('#j6jumps').scrollWidth - q('#j6jumps').clientWidth : null, card: r(q('#j6card')),
    headings: [...users.querySelectorAll('h4')].filter(h => h.getBoundingClientRect().height > 0).map(h => h.innerText.replace(/\s+/g, ' ').trim()),
    groupRows: Object.fromEntries(spec.groups.map(g => ['j6' + g.id, [...document.querySelectorAll('#j6' + g.id + ' .acc-row')].map(e => e.innerText.replace(/\s+/g, ' ').trim())])),
    folds: [...users.querySelectorAll('.od-arch > button')].filter(b => b.getBoundingClientRect().height > 0).map(b => b.textContent), foldRows: [...users.querySelectorAll('.od-arch .acc-row')].filter(b => b.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()),
    ownRows: [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row')].filter(b => b.getBoundingClientRect().height > 0).length, pageHigh: document.documentElement.scrollHeight }
}, { spec, ARCH })

/* WHAT STAYS PUT once the page is scrolled. The rail (A): Admin's left column held where it stands. The bar (B, phone):
   the search row and the jumps held just under the top bar, the pane's own colour behind them edge to edge and a
   hairline under - nothing of the list shows behind or beside it (D1518). Drawn fixed for the picture; a place-holder
   keeps the page's length. */
const pin = (s, { rail, bar }) => s.page.evaluate(({ rail, bar }) => {
  const q = sel => document.querySelector(sel), out = {}
  const top = Math.round(q('.topbar').getBoundingClientRect().bottom)
  if (rail) { const e = q('.adm-rail'), b = e.getBoundingClientRect(); const ph = document.createElement('div'); ph.style.flex = `0 0 ${b.width}px`; e.insertAdjacentElement('beforebegin', ph)
    Object.assign(e.style, { position: 'fixed', left: b.left + 'px', top: (top + 18) + 'px', width: b.width + 'px' }); out.rail = { top: top + 18 } }
  if (bar) { const e = q('#j6bar'), pane = q('.adm-pane-body').getBoundingClientRect(), b = e.getBoundingClientRect(), c = getComputedStyle(q('.adm-pane'))
    const ph = document.createElement('div'); ph.style.height = b.height + 'px'; ph.style.marginBottom = e.style.marginBottom; e.insertAdjacentElement('beforebegin', ph)
    Object.assign(e.style, { position: 'fixed', left: pane.left + 'px', top: top + 'px', width: pane.width + 'px', boxSizing: 'border-box', padding: '10px 16px', background: c.backgroundColor, borderBottom: '1px solid var(--edge)', zIndex: '40', margin: '0' })
    out.bar = { top, high: Math.round(e.getBoundingClientRect().height), ofScreen: Math.round(e.getBoundingClientRect().height / innerHeight * 1000) / 10 + '%' } }
  return out
}, { rail, bar })
/* the page's own scroll, to a place; then where things stand */
const scrollToY = async (s, y) => { await s.page.evaluate(y => scrollTo(0, y), y); await wait(s, 350) }
const headTo = async (s, sel, under) => { await s.page.evaluate(([sel, under]) => { const a = document.querySelector(sel).getBoundingClientRect(); scrollBy(0, a.top - under) }, [sel, under]); await wait(s, 350); return s.page.evaluate(sel => ({ scrollY: Math.round(scrollY), most: Math.round(document.documentElement.scrollHeight - innerHeight), headingAt: Math.round(document.querySelector(sel).getBoundingClientRect().top) }), sel) }
const pinnedFoot = s => s.page.evaluate(() => { const b = document.querySelector('#j6bar'); return Math.round(getComputedStyle(b).position === 'fixed' ? b.getBoundingClientRect().bottom : document.querySelector('.topbar').getBoundingClientRect().bottom) })

/* ---- the two pages ---- */
const J = (lit, off = []) => (ids, counts) => ids.map((id, i) => ({ id, label: { people: WN.jumpPeople, out: WN.jumpOutgoing, in: WN.jumpIncoming, other: WN.jumpOther }[id], short: id === 'other' ? WN.jumpOtherShort : undefined, count: counts[i], lit: id === lit, off: off.includes(id) }))
const mode = dir => ({ rail: dir === 'A', chips: dir !== 'A', navName: WN.navName })
function spec149(dir, { lit = 'people', closed = [], reached = null } = {}) {
  const hunter = man('142', 'Hunter'), saber = man('142', 'Saber'), cinch = man('142', 'Cinch'), raven = man('149', 'Raven')
  const mark = (id, t) => (closed.includes(id) ? WN.closed(t) : WN.open(t))
  return { ...mode(dir), leave: ['prowler'], tags: [[raven.pid, W6.postingOutTo('4 Jan', '150')]],
    jumps: J(lit)(['people', 'out', 'in', 'other'], [COUNT['149'], 1, 1, 4]),
    groups: [
      { id: 'out', label: mark('out', W6.outgoing(1)), closed: closed.includes('out'), reached: reached === 'out', rows: [{ key: 'raven', cs: 'Raven', sub: raven.seatCat, tag: W6.postingOutTo('4 Jan', '150') }] },
      { id: 'in', label: mark('in', W6.incoming(1)), closed: closed.includes('in'), rows: [{ key: 'cinch', cs: 'Cinch', chip: '142', sub: subOf(cinch, '149'), tag: W6.postingIn('14 Dec') }] },
      { id: 'other', label: mark('other', W6.fromOther(4)), closed: closed.includes('other'), rows: [{ key: 'hunter', cs: 'Hunter', chip: '142', sub: subOf(hunter, '149') }, { key: 'saber', cs: 'Saber', chip: '142', sub: subOf(saber, '149') }], fold: W6.viewOnly(2) },
    ],
    sqFolds: [['142', W6.folded('142', COUNT['142'])], ['150', W6.folded('150', COUNT['150'])]] }
}
function spec142(dir, { lit = 'people', reached = null } = {}) {
  const cinch = man('142', 'Cinch'), mako = man('150', 'Mako'), kestrel = man('149', 'Kestrel')
  return { ...mode(dir), tags: [[cinch.pid, W6.postingOutTo('14 Dec', '149')]],
    jumps: J(lit)(['people', 'out', 'in', 'other'], [COUNT['142'], 1, 1, 1]),
    groups: [
      { id: 'out', label: WN.open(W6.outgoing(1)), reached: reached === 'out', rows: [{ key: 'cinch', cs: 'Cinch', sub: cinch.seatCat, tag: W6.postingOutTo('14 Dec', '149') }] },
      { id: 'in', label: WN.open(W6.incoming(1)), rows: [{ key: 'mako', cs: 'Mako', chip: '150', sub: mako.seatCat, tag: W6.postingIn('4 Jan') }] },
      { id: 'other', label: WN.open(W6.fromOther(1)), rows: [{ key: 'kestrel', cs: 'Kestrel', chip: '149', sub: subOf(kestrel, '142') }] },
    ],
    sqFolds: [['149', W6.folded('149', COUNT['149'])], ['150', W6.folded('150', COUNT['150'])]] }
}
/* "Bol" typed on 149's page: nobody of 149's own, nobody coming or going; Bolt (142) holds View of 149, so the block
   shows him under its "View only" fold, opened for him; he is one of 142's sixty, so that fold opens for him too (the
   readings told to him with D2647: a match opens its fold; a man in two groups shows in both) */
function specSearch(dir) {
  const bolt = man('142', 'Bolt'), row = { key: 'bolt', cs: 'Bolt', sub: subOf(bolt, '149') }
  return { ...mode(dir), leave: ['prowler'], hidePeople: true, hideWaiting: true,
    jumps: J('other', ['people', 'out', 'in'])(['people', 'out', 'in', 'other'], [COUNT['149'], 1, 1, 4]),
    groups: [{ id: 'other', label: WN.open(W6.fromOther(4)), rows: [], fold: WN.opened(W6.viewOnly(2)), foldRows: [{ ...row, chip: '142' }] }],
    sqFolds: [['142', WN.opened(W6.folded('142', COUNT['142'])), [{ ...row, key: 'bolt2' }]]] }
}
const sizes = dir => (dir === 'p' ? 'p' : 'd')
const nameOf = (dir, k) => (dir === 'p' ? `j6-p-${k}` : `j6-d-${dir}-${k}`)
const start = async (s, who) => { await as(s, who); await usersTab(s); await wait(s, 400); FACT('addButton', await addButton(s, W)) }
const column = async (s, dir) => { const pane = await box(s, '.adm-pane'), rail = dir === 'A' ? await box(s, '.adm-rail') : null; const x = rail ? rail.x : pane.x; return { x, w: pane.x + pane.w - x } }
const ringNew = async (s, dir, extra = []) => { for (const sel of [dir === 'A' ? '#j6rail' : '#j6jumps', '#j6bar .searchbox', ...extra]) await vring(s, await box(s, sel), 5) }

try {
  await readSources()
  FACT('j6.sources', { counts: COUNT, hunter: man('142', 'Hunter'), saber: man('142', 'Saber'), bolt: man('142', 'Bolt'), cinch: man('142', 'Cinch'), mako: man('150', 'Mako'), raven: man('149', 'Raven'), kestrel: man('149', 'Kestrel') })
  for (const dir of ['A', 'B', 'p']) {
    const sz = sizes(dir)
    /* 1 - the page from its top, Kestrel on 149 */
    if (want('149', dir)) await run(nameOf(dir, '149'), sz, async s => {
      const k = nameOf(dir, '149'); await start(s, 'kestrel')
      FACT(`${k}.built`, await build(s, spec149(dir)))
      await ringNew(s, dir, ['#j6out-h', '#j6in-h', '#j6other-h'])
      const col = await column(s, dir), top = await box(s, dir === 'A' ? '.adm-rail' : '.adm-pane'), last = await box(s, '#j6sq150')
      FACT(`${k}.screen`, { squadron: await barSq(s), searchTop: (await box(s, '#j6bar .searchbox')).y, firstRowTop: (await box(s, '[data-testid="acc-groups"] .acc-row')).y })
      await shotTall(s, k, { x: col.x, y: top.y, w: col.w, h: last.y + last.h - top.y + 6 }, 16)
    }, { state: R6 })
    /* 2 - the page from its top, Hunter on 142 */
    if (want('142', dir)) await run(nameOf(dir, '142'), sz, async s => {
      const k = nameOf(dir, '142'); await start(s, 'hunter')
      FACT(`${k}.built`, await build(s, spec142(dir)))
      await ringNew(s, dir)
      const col = await column(s, dir), top = await box(s, dir === 'A' ? '.adm-rail' : '.adm-pane')
      FACT(`${k}.screen`, { squadron: await barSq(s), searchTop: (await box(s, '#j6bar .searchbox')).y, firstRowTop: (await box(s, '[data-testid="acc-groups"] .acc-row')).y })
      await shot(s, k, [{ x: col.x, y: top.y, w: col.w, h: s.H - top.y - 10 }], 16)
    }, { state: R6 })
    /* 3 - halfway down the sixty: what stays in reach */
    if (want('mid', dir)) await run(nameOf(dir, 'mid'), sz, async s => {
      const k = nameOf(dir, 'mid'); await start(s, 'hunter')
      FACT(`${k}.built`, (await build(s, spec142(dir))).jumps)
      FACT(`${k}.pinned`, await pin(s, { rail: dir === 'A', bar: dir !== 'A' }))
      await scrollToY(s, s.desk ? 1500 : 1400)
      await ringNew(s, dir)
      const col = await column(s, dir), bar = await box(s, '.topbar')
      FACT(`${k}.screen`, { scrollY: await s.page.evaluate(() => Math.round(scrollY)), listStartsUnder: await pinnedFoot(s) })
      await shot(s, k, [{ x: col.x, y: bar.h, w: col.w, h: Math.min(s.H - bar.h - 10, 520) }], 16)
    }, { state: R6 })
    /* 4 - "Outgoing" pressed: the page runs to the heading, the jump is lit, the heading's words stand white a moment */
    if (want('jump', dir)) await run(nameOf(dir, 'jump'), sz, async s => {
      const k = nameOf(dir, 'jump'); await start(s, 'hunter')
      FACT(`${k}.built`, (await build(s, spec142(dir, { lit: 'out', reached: 'out' }))).jumps)
      FACT(`${k}.pinned`, await pin(s, { rail: dir === 'A', bar: dir !== 'A' }))
      const under = (await pinnedFoot(s)) + 14
      FACT(`${k}.reached`, { wantedAt: under, ...(await headTo(s, '#j6out-h', under)) })
      for (const sel of ['#j6jump-out', '#j6out-h']) await vring(s, await box(s, sel), 5)
      const col = await column(s, dir), bar = await box(s, '.topbar')
      await shot(s, k, [{ x: col.x, y: bar.h, w: col.w, h: s.H - bar.h - 10 }], 16)
    }, { state: R6 })
    /* 5 - a fold closed: "From other squadrons" shut, its count kept */
    if (dir !== 'B' && want('fold', dir)) await run(nameOf(dir, 'fold'), sz, async s => {
      const k = nameOf(dir, 'fold'); await start(s, 'kestrel')
      FACT(`${k}.built`, await build(s, spec149(dir, { closed: ['other'], lit: 'out' })))
      FACT(`${k}.pinned`, await pin(s, { rail: dir === 'A', bar: dir !== 'A' }))
      const under = (await pinnedFoot(s)) + 14
      FACT(`${k}.reached`, await headTo(s, '#j6out-h', under + (s.desk ? 60 : 40)))
      await vring(s, await box(s, '#j6other-h'), 5)
      const a = await box(s, '#j6out'), z = await box(s, '#j6sq150'), pane = await box(s, '.adm-pane')
      await shot(s, k, [{ x: pane.x, y: a.y - 8, w: pane.w, h: z.y + z.h - a.y + 16 }], 16)
    }, { state: R6 })
    /* 6 - "Bol" typed */
    if (want('search', dir)) await run(nameOf(dir, 'search'), sz, async s => {
      const k = nameOf(dir, 'search'); await start(s, 'kestrel')
      /* a plain row kept aside before the typing empties the list of them (the short rows are made from it) */
      await s.page.evaluate(() => { window.__j6tpl = [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].find(e => !e.querySelector('.acc-sqn') && !e.querySelector('.ub') && !e.querySelector('.acc-tag') && !e.querySelector('.od-po')).cloneNode(true) })
      FACT(`${k}.typed`, await typeInto(s, '#accFind', 'Bol'))
      FACT(`${k}.todayOwnList`, await words(s, '[data-testid="acc-groups"] .acc-row'))
      FACT(`${k}.built`, await build(s, specSearch(dir)))
      await s.page.evaluate(() => { const sb = document.querySelector('#j6bar .searchbox'); sb.style.borderColor = 'var(--accent)' })   /* the box as it stands while he types in it */
      await ringNew(s, dir, ['#j6other', '#j6sq142'])
      const col = await column(s, dir), top = await box(s, dir === 'A' ? '.adm-rail' : '.adm-pane'), last = await box(s, '#j6sq142'), rail = dir === 'A' ? await box(s, '.adm-rail') : null
      const foot = Math.max(last.y + last.h, rail ? rail.y + rail.h : 0)
      await shot(s, k, [{ x: col.x, y: top.y, w: col.w, h: foot - top.y + 8 }], 16)
    }, { state: R6 })
  }
} finally { await closeAll() }
