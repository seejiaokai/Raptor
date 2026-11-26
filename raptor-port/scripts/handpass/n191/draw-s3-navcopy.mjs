// draw-s3-navcopy - section 3's drawer (chat 191, 26 Nov 26): Admin → Users' way A (his D2652 N13) as round 6 drew it -
// COPIED WORD FOR WORD from ../n176/draw-r6-nav.mjs (lines 26, 29-52, 57-166, 189-216: the people read, the page built
// from the app's own parts, the jumps, the two pages' specs), because that file draws on import and exports nothing.
// Only the exports at the foot are added. Nothing here writes the app's code.
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { run, as, W, FACT, wait, usersTab, reachPick, words, TMP } from '../n176/draw-r5b-lib.mjs'
import { W6 } from '../n176/words-r6-users.mjs'
import { WN } from '../n176/words-r6-nav.mjs'
const R6 = resolve(TMP, 'r6-users-state.json'), SRC = resolve(TMP, 'j6-sources.json')

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

export { R6, readSources, build, spec149, spec142, J, mode }
export const counts = () => COUNT
