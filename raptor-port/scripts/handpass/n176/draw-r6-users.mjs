// draw-r6-users - round 6: Admin → Users across squadrons, drawn on the REAL app (chat 188, a fresh Fable, 26 Nov 26;
// brief docs/superpowers/briefs/2026-11-26-msq-r6-users-draw-brief.md; report …-r6-users-draw-report.md).
// Nothing here writes the app's code. Every word a drawing adds comes from ./words-r6-users.mjs (W6); round 5's
// "+ Add a person" from ./words.mjs (W). What is NEW SINCE ROUND 5 wears a violet dashed ring (2px #8B5CF6, 4px clear).
// THE R6 WORLD (r6-users-state.json): round 5's (state-r5b.json) and one press more by Saber on 142's page -
//   Cinch's row → Sign-in "cinch" (Member) → "Give sign-in"   (so his opened row is a man's with a sign-in: Save, Suspend,
//   Archive, Delete, Cancel - the row "Post out…" joins - and his short row on 149's page opens to his real 149 line).
// DRAWN, NOT IN THE WORLD (the app cannot do them yet): Cinch's posting to 149 on 14 Dec, Raven's to 150 on 4 Jan, Mako's
// View of 149. Bolt's View of 149 and Hunter's Plan of 149 are real.
//  u6-{d,p}-users     Kestrel (149's admin) on Admin → Users: "From other squadrons · 4" (Hunter, Saber, "▸ View only · 2
//                     people"), "Incoming · 1" (Cinch), "Outgoing · 1" (Raven, "Undo post out"), 149's own people (Hunter
//                     no longer among them; Raven's row tagged), "▸ 142 · 60 people", "▸ 150 · 3 people".
//  u6-{d,p}-folded    the same, "▾ 142 · 60 people" opened: short rows with NO grey 142, the role in words.
//  u6-{d,p}-edit      Saber, 149 picked: Ranger's short row opened, "Edit on 142 →" (e8j redrawn without the grey 142).
//  u6-d-postout       Hunter on 142's page, Cinch's real row opened, "Post out…" before Suspend.
//  u6-d-postout-sheet the sheet it opens: the Leave War's own Post out part (read off Cinch's real sheet on 142's war,
//                     14 Dec picked), "✓ Transfer to Sqn", "To 149".
//  u6-d-askpost       Kestrel on 149's page, Cinch's short row opened: "Ask 142 to post him here".
//  u6-d-askpost-bell  Hunter's bell: the line 142's admins get.
//  u6-d-both-pages-142 / -149 and u6-d-both-pages (the two cuts, one above the other): Cinch in transit on both pages.
//   node raptor-port/scripts/handpass/n176/draw-r6-users.mjs   (ONLY=users,folded,edit,postout,askpost,bell,both; FRESH=1 remakes the set-up)
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { run, as, W, FACT, wait, vis, hit, usersTab, reachPick, shot, box, words, closeAll, typeInto, r5bWorld, shotTall, barSq, addButton, TMP, DRAWN, LIST, lineParts, numbersFirst, toastNow, go } from './draw-r5b-lib.mjs'
import { tapBell } from '../n175/p6-lib.mjs'
import { W6 } from './words-r6-users.mjs'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
const R6 = resolve(TMP, 'r6-users-state.json')
const VIOLET = '#8B5CF6'
let ARCH = null, P = {}, COUNT = {}, CARD = {}, SHEET = null
const n = t => Number(String(t).replace(/\D+/g, ''))

/* ---- the world ---- */
async function r6World() {
  if (existsSync(R6) && !process.env.FRESH) return R6
  await run('r6.setup', 'd', async s => {
    await as(s, 'saber'); await usersTab(s); await wait(s, 500)
    await hit(s, s.page.locator('[data-person="snap"] .acc-tap').first(), 700)
    await s.page.fill('#accGiveName', 'cinch'); await wait(s, 200)
    await hit(s, '#accGive', 800)
    for (let i = 0; i < 3; i++) if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk', 500)
    FACT('r6.setup.cinch', { toast: await toastNow(s), row: await s.page.evaluate(() => document.querySelector('[data-person="snap"]')?.innerText.replace(/\s+/g, ' ').trim()) })
    await wait(s, 600); writeFileSync(R6, JSON.stringify(await s.ctx.storageState()))
  }, { state: await r5bWorld() })
  return R6
}
/* a squadron's own people as its page lists them: callsign, seat · CAT, role, what the row says he also plans */
const peopleNow = s => s.page.evaluate(() => [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].filter(e => !e.querySelector('.acc-sqn')).map(e => {
  const sub = [...e.querySelector('.acc-sub').childNodes].map(n => n.nodeType === 3 ? n.textContent : (n.classList?.contains('od-rw') || n.classList?.contains('od-plans') || n.classList?.contains('od-po') || n.classList?.contains('acc-tag') ? '' : n.textContent)).join('')
  const parts = sub.split(' · ').map(x => x.trim()).filter(Boolean)
  const ub = e.querySelector('.ub')
  return { pid: e.dataset.person, cs: e.querySelector('.acc-name').childNodes[0].textContent, seatCat: parts.slice(1).filter(p => !/^also /.test(p)).join(' · '), badge: ub ? ub.textContent.trim() : null, badgeClass: ub ? ub.className : null, plans: e.querySelector('.od-plans')?.textContent.replace(/^\s*·\s*/, '').trim() || null }
}))
async function openCard(s, cs) {
  await typeInto(s, '#accFind', cs); await wait(s, 400)
  await hit(s, vis(s, '#page-admin .acc-row[data-person] .acc-tap').filter({ hasText: new RegExp('^' + cs) }).first(), 700)
  const html = await s.page.evaluate(() => document.querySelector('.acc-row.od-row-on').outerHTML)
  const text = await s.page.evaluate(() => document.querySelector('.acc-row.od-row-on [data-testid="acc-sq"]')?.innerText.replace(/\s+/g, ' ').trim())
  if (await vis(s, '#accEdCancel').count()) await hit(s, '#accEdCancel', 400)
  await typeInto(s, '#accFind', ''); await wait(s, 300)
  return { html, accessToday: text }
}
async function readSources(st) {
  await run('r6.read.saber', 'd', async s => {
    await as(s, 'saber'); await usersTab(s); await wait(s, 400)
    ARCH = await s.page.evaluate(() => document.querySelector('#accArchived').outerHTML)
    P['142'] = await peopleNow(s); COUNT['142'] = n((await words(s, '.od-head .adm-sub'))[0])
    for (const u of [149, 150]) { await reachPick(s, u, 'bar'); await usersTab(s); await wait(s, 400); P[u] = await peopleNow(s); COUNT[u] = n((await words(s, '.od-head .adm-sub'))[0]) }
    CARD['s.Ranger'] = await openCard(s, 'Ranger')   /* 150 picked last: back to 149 for Saber's 149 page */
  }, { state: st })
  await run('r6.read.saber149', 'd', async s => {
    await as(s, 'saber'); await reachPick(s, 149, 'bar'); await usersTab(s); await wait(s, 400)
    CARD['s.Ranger'] = await openCard(s, 'Ranger')
  }, { state: st })
  await run('r6.read.kestrel', 'd', async s => {
    await as(s, 'kestrel'); await usersTab(s); await wait(s, 400)
    CARD['k.Cinch'] = await openCard(s, 'Cinch')
  }, { state: st })
  const who = (u, cs) => P[u].find(p => p.cs === cs)
  FACT('r6.sources', { counts: COUNT, hunter: who('142', 'Hunter'), saber: who('142', 'Saber'), blade: who('142', 'Blade'), bolt: who('142', 'Bolt'), cinch: who('142', 'Cinch'), ranger: who('142', 'Ranger'), mako: who('150', 'Mako'), raven: who('149', 'Raven'), cardsToday: Object.fromEntries(Object.entries(CARD).map(([k, v]) => [k, v.accessToday])) })
}
/* a man's short row's second line on another squadron's page: seat · CAT, his role in words, what he holds of `view` */
const HOLDS = { Hunter: 'plans', Bolt: 'views', Mako: 'views' }   /* of 149; Mako's is drawn, not in the world */
function subOf(p, view) {
  const master = /master/i.test(p.badge || '') || /master/i.test(p.badgeClass || '') || p.cs === 'Saber'
  const role = master ? W6.roleMaster : /admin/i.test(p.badge || '') ? W6.roleAdmin : ''
  const holds = !master && view === '149' && HOLDS[p.cs] ? (HOLDS[p.cs] === 'plans' ? W6.alsoPlans(view) : W6.alsoViews(view)) : ''
  return [p.seatCat, role, holds].filter(Boolean).join(' · ')
}
const man = (u, cs) => P[u].find(p => p.cs === cs)

/* ---- the drawing's parts, each made from the page's own ---- */
/* the violet ring: what is new since round 5 */
const vring = (s, b) => b && s.page.evaluate(([b, c]) => { const d = document.createElement('div'); d.className = '__u6ring'; Object.assign(d.style, { position: 'absolute', boxSizing: 'border-box', left: (b.x - 6 + scrollX) + 'px', top: (b.y - 6 + scrollY) + 'px', width: (b.w + 12) + 'px', height: (b.h + 12) + 'px', border: '2px dashed ' + c, borderRadius: '8px', zIndex: 2147483646, pointerEvents: 'none' }); document.body.appendChild(d) }, [b, VIOLET])
const unring = s => s.page.evaluate(() => document.querySelectorAll('.__u6ring').forEach(e => e.remove()))
/* the box of some words inside an element, as drawn */
const wordBox = (s, sel, word) => s.page.evaluate(([sel, word]) => {
  for (const e of document.querySelectorAll(sel)) { const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let t
    while ((t = w.nextNode())) { const i = t.textContent.indexOf(word); if (i < 0) continue; const r = document.createRange(); r.setStart(t, i); r.setEnd(t, i + word.length); const q = r.getBoundingClientRect(); if (q.width > 0) return { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) } } }
  return null
}, [sel, word])
/* THE TOP OF THE PAGE: the block "From other squadrons", then Incoming, then Outgoing - each a heading in the page's own
   heading look (h4.adm-sub, as "Waiting for access" and "People · 10"), its rows the page's own short rows (a row of the
   list with no dots and no badge, cloned), a fold in "▸ Archived"'s look, an empty block in "Nobody is waiting for
   access."'s look; a rule (the page's own) under them, before "People". */
const buildTop = (s, spec) => s.page.evaluate(({ spec, ARCH }) => {
  const head = document.querySelector('.od-head'), users = head.parentElement
  const h4 = users.querySelector(':scope > h4.adm-sub'), hr = users.querySelector(':scope > hr.adm-sep')
  const noteLook = users.querySelector(':scope > p.adm-note')
  const tpl = [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].find(e => !e.querySelector('.acc-sqn') && !e.querySelector('.ub') && !e.querySelector('.acc-tag') && !e.classList.contains('od-row-on'))
  const mkRow = r => {
    const e = tpl.cloneNode(true); e.dataset.person = 'u6-' + r.key; e.id = 'u6row-' + r.key; e.querySelector('.acc-tap').removeAttribute('title'); e.querySelector('.acc-tap').disabled = false
    const nm = e.querySelector('.acc-name'); nm.textContent = r.cs
    if (r.chip) { const m = document.createElement('span'); m.className = 'acc-sqn'; m.textContent = r.chip; nm.appendChild(m) }
    const sub = e.querySelector('.acc-sub'); sub.textContent = r.sub
    if (r.tag) { sub.append(' '); const t = document.createElement('span'); t.className = 'od-po'; t.textContent = r.tag; sub.appendChild(t) }
    e.querySelectorAll('.od-c').forEach(x => x.remove())
    const rc = e.querySelector('.od-rc'); if (rc) rc.textContent = ''
    /* an Outgoing row OPENED (as every row on this page opens): the app's own opened-row look and its line of buttons -
       "Undo post out" and "Cancel", both the page's plain button */
    if (r.open) { e.classList.add('od-row-on'); const ed = document.createElement('div'); ed.className = 'acc-edit'; const a = document.createElement('div'); a.className = 'acc-acts'; a.id = 'u6undoActs'
      for (const [id, t] of [['u6undo', r.open[0]], ['u6undoCancel', r.open[1]]]) { const b = document.createElement('button'); b.type = 'button'; b.className = 'abtn'; b.id = id; b.textContent = t; a.appendChild(b) }
      ed.appendChild(a); e.appendChild(ed) }
    return e
  }
  const wrap = document.createElement('div'); wrap.id = 'u6top'
  const sec = (id, label) => { const d = document.createElement('div'); d.id = id; d.className = 'u6sec'; if (wrap.children.length) d.style.marginTop = '22px'; const h = h4.cloneNode(false); h.textContent = label; d.appendChild(h); wrap.appendChild(d); return d }
  const list = (d, rows) => { const l = document.createElement('div'); l.className = 'acc-list od-list'; for (const r of rows) l.appendChild(mkRow(r)); d.appendChild(l); return l }
  const o = sec('u6other', spec.other.label)
  if (spec.other.empty) { const p = document.createElement('p'); p.className = 'adm-note'; p.id = 'u6empty'; p.textContent = spec.other.empty; if (noteLook) p.style.cssText = noteLook.style.cssText; p.style.margin = '0'; o.appendChild(p) }
  else {
    list(o, spec.other.rows)
    if (spec.other.fold) { const t = document.createElement('div'); t.innerHTML = ARCH; const blk = t.firstElementChild; blk.id = 'u6viewfold'; blk.querySelector('#accArchList')?.remove(); const b = blk.querySelector('button'); b.id = 'u6viewfoldBtn'; b.setAttribute('aria-expanded', 'false'); b.textContent = spec.other.fold; o.appendChild(blk) }
  }
  if (spec.incoming) list(sec('u6in', spec.incoming.label), spec.incoming.rows)
  if (spec.outgoing) list(sec('u6out', spec.outgoing.label), spec.outgoing.rows)
  head.insertAdjacentElement('beforebegin', wrap)
  const rule = hr.cloneNode(false); rule.id = 'u6rule'; head.insertAdjacentElement('beforebegin', rule)
  return { headings: [...wrap.querySelectorAll('h4')].map(h => h.textContent), rows: [...wrap.querySelectorAll('.acc-row')].map(r => r.innerText.replace(/\s+/g, ' ').trim()), fold: wrap.querySelector('#u6viewfoldBtn')?.textContent ?? null, empty: wrap.querySelector('#u6empty')?.textContent ?? null }
}, { spec, ARCH })
/* Hunter leaves 149's own list: he is in the block at the top */
const hunterOut = s => s.page.evaluate(() => { const r = [...document.querySelectorAll('[data-testid="acc-groups"] [data-person="prowler"]')].find(e => e.querySelector('.acc-sqn')); const was = r ? r.innerText.replace(/\s+/g, ' ').trim() : null; r?.remove(); return was })
/* a waiting posting's amber tag on a man's own row (the app's own tag, `.od-po`) */
const tagRow = (s, pid, tag) => s.page.evaluate(([pid, tag]) => { const r = document.querySelector(`[data-testid="acc-groups"] [data-person="${pid}"]`); const sub = r.querySelector('.acc-sub'); sub.append(' '); const t = document.createElement('span'); t.className = 'od-po'; t.id = 'u6tag-' + pid; t.textContent = tag; sub.appendChild(t); return r.innerText.replace(/\s+/g, ' ').trim() }, [pid, tag])
/* the folded headings under the page's own people, cloned from "▸ Archived" (round 1's way) */
const folded = (s, heads) => s.page.evaluate(({ ARCH, heads }) => {
  let at = document.querySelector('[data-testid="acc-groups"]')
  for (const [num, label] of heads) {
    const h = document.createElement('div'); h.innerHTML = ARCH; const blk = h.firstElementChild
    blk.id = 'n176fold' + num; blk.dataset.n176unit = num; blk.querySelector('#accArchList')?.remove()
    const b = blk.querySelector('button'); b.id = 'n176foldBtn' + num; b.setAttribute('aria-expanded', 'false'); b.textContent = label
    at.insertAdjacentElement('afterend', blk); at = blk
  }
  return [...document.querySelectorAll('[data-n176unit] button')].map(b => b.textContent)
}, { ARCH, heads })
const heads = (...nums) => nums.map(u => [String(u), W6.folded(u, COUNT[u])])
/* A FOLDED SQUADRON OPENED (round 5's short rows, D2625) - round 6: NO grey number on the rows (the heading says whose
   they are), the role in words, Hunter listed with the rest. One row may stand opened, shaped from his real opened row. */
const openGroup = (s, num, rows, open) => s.page.evaluate(({ num, rows, open }) => {
  const tpl = [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].find(e => !e.querySelector('.acc-sqn') && !e.querySelector('.ub') && !e.querySelector('.acc-tag') && !e.querySelector('.od-po'))
  const btn = document.querySelector('#n176foldBtn' + num); btn.textContent = btn.textContent.replace('▸', '▾'); btn.setAttribute('aria-expanded', 'true')
  const list = document.createElement('div'); list.className = 'acc-list od-list'; list.id = 'u6list' + num
  let opened = null
  for (const p of rows) {
    if (open && p.pid === open.pid) {
      const h = document.createElement('div'); h.innerHTML = open.card; const c = h.firstElementChild
      c.dataset.person = 'u6-' + c.dataset.person; c.id = 'u6opened'
      c.querySelector('.acc-tap')?.removeAttribute('title')
      c.querySelector('.acc-name').textContent = p.cs
      c.querySelector('.acc-sub').textContent = p.sub
      c.querySelectorAll('.od-c').forEach(e => e.remove()); const rc = c.querySelector('.od-rc'); if (rc) rc.textContent = ''
      const edit = c.querySelector('.acc-edit')
      edit.querySelector(':scope > .adm-2col')?.remove()
      edit.querySelector('details.acc-roles')?.remove()
      const acts = [...edit.querySelectorAll(':scope > .acc-acts')].pop(); acts.id = 'u6acts'
      for (const b of [...acts.querySelectorAll('button')]) { const t = b.textContent.trim(); if (!(t === 'Cancel' || t === 'Save')) b.remove() }
      const sq = edit.querySelector('.acc-sq')
      for (const e of [...sq.children]) { const u = e.dataset.unit || e.dataset.noteUnit || ''; const lab = e.getAttribute('aria-label') || ''; if (!(u === 'u' + open.view || new RegExp(open.view + '$').test(lab))) e.remove() }
      const first = edit.firstElementChild; if (first) first.style.marginTop = '0'
      list.appendChild(c); opened = c; continue
    }
    const r = tpl.cloneNode(true); r.dataset.person = 'u6g-' + p.pid; r.querySelector('.acc-tap').removeAttribute('title')
    r.querySelector('.acc-name').textContent = p.cs
    r.querySelector('.acc-sub').textContent = p.sub
    r.querySelectorAll('.od-c').forEach(e => e.remove())
    const rc = r.querySelector('.od-rc'); if (rc) rc.textContent = ''
    list.appendChild(r)
  }
  document.querySelector('#n176fold' + num).appendChild(list)
  const all = [...list.querySelectorAll('.acc-row')], txt = e => e.innerText.replace(/\s+/g, ' ').trim()
  return { rows: all.length, greyNumbersOnRows: list.querySelectorAll('.acc-sqn').length, first: all.slice(0, 9).map(txt), hunter: all.filter(r => /^Hunter/.test(txt(r))).map(txt), saber: all.filter(r => /^Saber/.test(txt(r))).map(txt), opened: opened ? txt(opened) : null, openedButtons: opened ? [...opened.querySelectorAll('button')].filter(b => !b.classList.contains('acc-tap')).map(b => b.textContent.trim() + (b.disabled ? ' [greyed]' : '') + (b.classList.contains('primary') ? ' [main]' : '')) : null }
}, { num, rows, open })
const rows142 = () => P['142'].map(p => ({ pid: p.pid, cs: p.cs, sub: subOf(p, '149') }))
const listCol = s => box(s, '[data-testid="acc-groups"]')
const toTop = async (s, sel, y) => { await s.page.evaluate(([sel, y]) => { const a = document.querySelector(sel).getBoundingClientRect(); scrollBy(0, a.top - y) }, [sel, y]); await wait(s, 300) }

/* 149's page as round 6 has it, for whoever looks (Kestrel; Saber with 149 picked): the block, Incoming, Outgoing, Hunter
   out of the list, Raven's row tagged, "+ Add a person", the folded squadrons */
async function page149(s, k) {
  FACT(`${k}.addButton`, await addButton(s, W))
  FACT(`${k}.hunterWasOnTheList`, await hunterOut(s))
  const hunter = man('142', 'Hunter'), saber = man('142', 'Saber'), cinch = man('142', 'Cinch'), raven = man('149', 'Raven')
  FACT(`${k}.top`, await buildTop(s, {
    other: { label: W6.fromOther(4), rows: [{ key: 'hunter', cs: 'Hunter', chip: '142', sub: subOf(hunter, '149') }, { key: 'saber', cs: 'Saber', chip: '142', sub: subOf(saber, '149') }], fold: W6.viewOnly(2) },
    incoming: { label: W6.incoming(1), rows: [{ key: 'cinch', cs: 'Cinch', chip: '142', sub: subOf(cinch, '149'), tag: W6.postingIn('14 Dec') }] },
    outgoing: { label: W6.outgoing(1), rows: [{ key: 'raven', cs: 'Raven', sub: raven.seatCat, tag: W6.postingOutTo('4 Jan', '150') }] },
  }))
  FACT(`${k}.ravenRow`, await tagRow(s, raven.pid, W6.postingOutTo('4 Jan', '150')))
  FACT(`${k}.folds`, await folded(s, heads(142, 150)))
  await s.page.evaluate(() => document.activeElement?.blur())
}
/* the measured facts of the top's parts: each heading's type against "People"'s, the Undo button against the page's Filter */
const topFacts = s => s.page.evaluate(() => {
  const st = e => { const c = getComputedStyle(e); return `${c.fontSize} ${c.fontWeight} ${c.letterSpacing} ${c.textTransform}` }
  const r = e => { if (!e) return null; const q = e.getBoundingClientRect(); return { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) } }
  return { peopleHeading: st(document.querySelector('.od-head .adm-sub')), newHeadings: [...document.querySelectorAll('#u6top h4')].map(st), undo: r(document.querySelector('#u6undo')), undoCancel: r(document.querySelector('#u6undoCancel')), filter: r(document.querySelector('#accFilter')), searchTop: r(document.querySelector('#accFind'))?.y, rowsHigh: [...document.querySelectorAll('#u6top .acc-row')].map(e => Math.round(e.getBoundingClientRect().height)), ownRowHigh: Math.round(document.querySelector('[data-testid="acc-groups"] .acc-row').getBoundingClientRect().height) }
})

try {
  const ST = await r6World()
  await readSources(ST)

  /* 1 - u6-{d,p}-users */
  for (const sz of ['d', 'p']) if (want('users')) await run(`u6.users.${sz}`, sz, async s => {
    const k = `u6-${sz}-users`
    await as(s, 'kestrel'); await usersTab(s); await wait(s, 400)
    await page149(s, k)
    await toTop(s, '#u6top', s.desk ? 150 : 120)
    FACT(`${k}.measured`, await topFacts(s))
    FACT(`${k}.screen`, { squadron: await barSq(s), people: await words(s, '.od-head .adm-sub'), ownRows: await words(s, '[data-testid="acc-groups"] .acc-name') })
    for (const sel of ['#u6other', '#u6in', '#u6out', '[id^=u6tag-]']) await vring(s, await box(s, sel))
    const top = await box(s, '#u6top'), f = await box(s, '#n176fold150'), col = await listCol(s)
    await shotTall(s, k, { x: col.x, y: top.y, w: col.w, h: f.y + f.h - top.y }, 16)
  }, { state: ST })

  /* 3 - u6-{d,p}-folded */
  for (const sz of ['d', 'p']) if (want('folded')) await run(`u6.folded.${sz}`, sz, async s => {
    const k = `u6-${sz}-folded`
    await as(s, 'kestrel'); await usersTab(s); await wait(s, 400)
    await page149(s, k)
    FACT(`${k}.group`, await openGroup(s, '142', rows142(), null))
    await toTop(s, '#n176fold142', s.desk ? 110 : 96)
    for (const cs of ['Blade']) await vring(s, await wordBox(s, `#u6list142 .acc-row`, cs === 'Blade' ? W6.roleAdmin : ''))
    const f = await box(s, '#n176fold142'), col = await listCol(s)
    await shotTall(s, k, { x: col.x, y: f.y, w: col.w, h: Math.min(s.H - f.y - 20, s.desk ? 640 : 700) }, 16)
  }, { state: ST })

  /* 4 - u6-{d,p}-edit (e8j redrawn: the rows inside the opened group carry no grey 142) */
  for (const sz of ['d', 'p']) if (want('edit')) await run(`u6.edit.${sz}`, sz, async s => {
    const k = `u6-${sz}-edit`
    await as(s, 'saber'); await reachPick(s, 149, s.desk ? 'bar' : 'menu'); await usersTab(s); await wait(s, 500)
    await page149(s, k)
    const link = await s.page.evaluate(html => { const h = document.createElement('div'); h.innerHTML = html; h.style.position = 'absolute'; h.style.left = '-9999px'; document.querySelector('#page-admin').appendChild(h); const sm = h.querySelector('details.acc-roles summary'); const c = getComputedStyle(sm); const r = { color: c.color, fontSize: c.fontSize, fontWeight: c.fontWeight, fontFamily: c.fontFamily }; h.remove(); return r }, CARD['s.Ranger'].html)
    const g = await openGroup(s, '142', rows142(), { pid: 'bane', card: CARD['s.Ranger'].html, view: '149' })
    const b = await s.page.evaluate(([label, link]) => {
      const acts = document.querySelector('#u6acts'); acts.style.display = 'flex'; acts.style.alignItems = 'center'
      const t = document.createElement('button'); t.type = 'button'; t.id = 'u6jump'; t.textContent = label
      Object.assign(t.style, { marginLeft: 'auto', background: 'transparent', border: '0', padding: '6px 2px', cursor: 'pointer', color: link.color, fontSize: link.fontSize, fontWeight: link.fontWeight, fontFamily: link.fontFamily })
      acts.appendChild(t); return [...acts.querySelectorAll('button')].map(x => x.textContent.trim())
    }, [W6.editOn('142'), link])
    FACT(`${k}.drawn`, { opened: g.opened, buttons: g.openedButtons, actsLine: b, greyNumbersOnRows: g.greyNumbersOnRows, squadron: await barSq(s) })
    await s.page.evaluate(() => { const c = document.querySelector('#u6opened'); scrollBy(0, c.getBoundingClientRect().top - (innerWidth > 700 ? 260 : 250)) }); await wait(s, 300)
    const c = await box(s, '#u6opened'), col = await listCol(s)
    await shot(s, k, [{ x: col.x, y: c.y - 110, w: col.w, h: c.h + 210 }], 16)
  }, { state: ST })

  /* 5 - u6-d-postout, u6-d-postout-sheet: Hunter on 142's page */
  if (want('postout')) await run('u6.postout', 'd', async s => {
    const k = 'u6-d-postout'
    await as(s, 'hunter')
    /* the Leave War's own Post out part, read off Cinch's real sheet on 142's war (Mon 14 Dec pressed, ⋯, Post out) */
    await go(s, 'leavewar'); await wait(s, 2500)
    const cell = s.page.locator('[data-testid="cell-snap-2026-12-14"]').first()
    await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await wait(s, 400)
    const cb = await cell.boundingBox(); await s.page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2); await wait(s, 700)
    await hit(s, '[data-testid="bid-more"]', 500); await hit(s, '[data-testid="bid-postout"]', 600)
    FACT(`${k}.warSheetToday`, await s.page.evaluate(() => { const d = [...document.querySelectorAll('.bidsheet[role="dialog"]')].pop(); return { rows: [...d.querySelectorAll('.bidsheet-row.postout')].map(e => e.innerText.replace(/\s+/g, ' ').trim()), transferToday: (() => { const b = d.querySelector('[data-testid="po-transfer"]'); return { greyed: b.disabled, hover: b.title } })() } }))
    SHEET = await s.page.evaluate(({ title, to, toNum, line }) => {
      const real = [...document.querySelectorAll('.bidsheet[role="dialog"]')].pop()
      const d = real.cloneNode(true); d.removeAttribute('data-testid'); d.id = 'u6sheet'
      real.parentElement.appendChild(d)
      /* what is the leave's goes: the day line, remarks and document, the portion, the leaves, Auto-approve */
      d.querySelectorAll('.bidsheet-dayline, .bp-words, .bp-dur, [aria-label="Which leave"], .bp-sw, .bp-extra, .grip, [data-testid="bid-grip"]').forEach(e => e.remove())
      for (const e of [...d.children]) if (!e.classList.contains('bidsheet-hd') && !e.innerText.trim() && !e.querySelector('button')) e.remove()
      d.querySelector('.bidsheet-hd .when').textContent = title
      /* Transfer to Sqn chosen: the chips' own on and off looks */
      const ov = d.querySelector('[data-testid="po-overseas"]'), tr = d.querySelector('[data-testid="po-transfer"]')
      ov.className = 'pchip'; ov.setAttribute('aria-pressed', 'false'); ov.textContent = ov.textContent.replace('✓ ', '')
      tr.disabled = false; tr.removeAttribute('title'); tr.className = 'pchip on'; tr.setAttribute('aria-pressed', 'true'); tr.textContent = '✓ ' + tr.textContent
      /* the new line "To 149": the "PO from" line cloned, its date box's look holding the squadron */
      const from = d.querySelector('[data-testid="po-date"]').closest('.bidsheet-row'), toRow = from.cloneNode(true)
      toRow.id = 'u6to'; toRow.querySelector('.lab').textContent = to; const bx = toRow.querySelector('.datebox'); bx.removeAttribute('data-testid'); bx.removeAttribute('aria-label'); bx.querySelector('.datebox-txt').textContent = toNum
      d.querySelector('.po-outcomes').insertAdjacentElement('afterend', toRow)
      d.querySelector('[data-testid="po-line"]').textContent = line
      d.style.height = 'auto'; d.style.maxHeight = 'none'
      /* the look frozen into the copy, so it stands on Admin → Users as it stands on the war */
      const all = [d, ...d.querySelectorAll('*')]
      const looks = all.map(e => { const c = getComputedStyle(e); let t = ''; for (let i = 0; i < c.length; i++) { const p = c[i]; t += `${p}:${c.getPropertyValue(p)};` } return t })
      all.forEach((e, i) => { e.setAttribute('style', looks[i]) })
      const q = d.getBoundingClientRect(); const out = { html: d.outerHTML, w: Math.round(q.width), h: Math.round(q.height), words: d.innerText.replace(/\s+/g, ' ').trim() }
      d.remove(); return out
    }, { title: W6.sheetTitle, to: W6.sheetTo, toNum: '149', line: W6.transferLine('14 Dec', '149') })
    FACT(`${k}.sheetCopied`, { w: SHEET.w, h: SHEET.h, words: SHEET.words })
    await s.page.keyboard.press('Escape'); await wait(s, 400)
    if (await s.page.locator('.bidsheet[role="dialog"]:visible').count()) { await hit(s, s.page.locator('.bidsheet[role="dialog"] button.x:visible').last(), 400) }
    FACT(`${k}.warSheetClosedNothingPosted`, { sheets: await s.page.locator('.bidsheet[role="dialog"]:visible').count() })
    await usersTab(s); await wait(s, 500)
    FACT(`${k}.addButton`, await addButton(s, W))
    FACT(`${k}.top`, await buildTop(s, { other: { label: W6.fromOther(0).replace(/ · 0$/, ''), empty: W6.nobodyOutside('142') } }))
    FACT(`${k}.folds`, await folded(s, heads(149, 150)))
    await hit(s, s.page.locator('[data-testid="acc-groups"] [data-person="snap"] .acc-tap').first(), 700)
    const r = await s.page.evaluate(label => {
      const row = document.querySelector('.acc-row.od-row-on'), acts = [...row.querySelectorAll('.acc-edit > .acc-acts')].pop()
      const before = [...acts.querySelectorAll('button')].map(b => b.textContent.trim())
      const sus = [...acts.querySelectorAll('button')].find(b => /^Suspend/.test(b.textContent.trim())) || acts.querySelector('#accEdArchive')
      const b = document.createElement('button'); b.type = 'button'; b.className = 'abtn'; b.id = 'u6po'; b.textContent = label
      sus.insertAdjacentElement('beforebegin', b)
      const q = e => { const x = e.getBoundingClientRect(); return { y: Math.round(x.top), h: Math.round(x.height) } }
      return { before, after: [...acts.querySelectorAll('button')].map(x => x.textContent.trim()), postOut: q(b), suspend: q(sus), row: row.innerText.replace(/\s+/g, ' ').trim().slice(0, 120) }
    }, W6.postOutBtn)
    FACT(`${k}.row`, r)
    await s.page.evaluate(() => { const c = document.querySelector('.acc-row.od-row-on'); scrollBy(0, c.getBoundingClientRect().top - 110) }); await wait(s, 300)
    await s.page.evaluate(() => document.activeElement?.blur())
    await vring(s, await box(s, '#u6po'))
    const row = await box(s, '.acc-row.od-row-on')
    await shot(s, k, [{ ...row, y: row.y - 70, h: row.h + 140 }], 16)
    /* pressed: the sheet, hung from the button as the war's sheet hangs by the day pressed */
    await unring(s)
    const pb = await box(s, '#u6po')
    const placed = await s.page.evaluate(([html, pb]) => {
      const h = document.createElement('div'); h.innerHTML = html; const d = h.firstElementChild
      const w = parseFloat(d.style.width) || 560, left = Math.min(Math.max(12, pb.x - 24), innerWidth - w - 12)
      Object.assign(d.style, { visibility: 'visible', position: 'fixed', left: left + 'px', top: (pb.y + pb.h + 10) + 'px', right: 'auto', bottom: 'auto', transform: 'none', zIndex: '2147483000', margin: '0' })
      document.body.appendChild(d)
      const q = d.getBoundingClientRect()
      if (q.bottom > innerHeight - 8) d.style.top = Math.max(80, pb.y - q.height - 10) + 'px'
      const t = e => e.innerText.replace(/\s+/g, ' ').trim()
      return { head: t(d.querySelector('.bidsheet-hd')), rows: [...d.querySelectorAll('.bidsheet-row')].map(t), chips: [...d.querySelectorAll('.po-outcomes button')].map(b => b.textContent + (b.disabled ? ' [greyed]' : '')), w: Math.round(q.width), h: Math.round(d.getBoundingClientRect().height) }
    }, [SHEET.html, pb])
    FACT('u6-d-postout-sheet.drawn', placed)
    await wait(s, 300)
    const sh = await box(s, '#u6sheet')
    await vring(s, sh)
    await shot(s, 'u6-d-postout-sheet', [{ ...row, y: row.y - 20, h: row.h + 40 }, sh], 18)
  }, { state: ST })

  /* 6 - u6-d-askpost: Kestrel on 149's page, Cinch's short row opened */
  if (want('askpost')) await run('u6.askpost', 'd', async s => {
    const k = 'u6-d-askpost'
    await as(s, 'kestrel'); await usersTab(s); await wait(s, 400)
    /* before anyone has posted him: no Incoming line for Cinch yet */
    FACT(`${k}.addButton`, await addButton(s, W)); await hunterOut(s)
    const hunter = man('142', 'Hunter'), saber = man('142', 'Saber'), raven = man('149', 'Raven')
    FACT(`${k}.top`, await buildTop(s, {
      other: { label: W6.fromOther(4), rows: [{ key: 'hunter', cs: 'Hunter', chip: '142', sub: subOf(hunter, '149') }, { key: 'saber', cs: 'Saber', chip: '142', sub: subOf(saber, '149') }], fold: W6.viewOnly(2) },
      outgoing: { label: W6.outgoing(1), rows: [{ key: 'raven', cs: 'Raven', sub: raven.seatCat, tag: W6.postingOutTo('4 Jan', '150') }] },
    }))
    await tagRow(s, raven.pid, W6.postingOutTo('4 Jan', '150'))
    await folded(s, heads(142, 150))
    const g = await openGroup(s, '142', rows142(), { pid: 'snap', card: CARD['k.Cinch'].html, view: '149' })
    const b = await s.page.evaluate(label => {
      const acts = document.querySelector('#u6acts'); acts.style.display = 'flex'; acts.style.alignItems = 'center'
      const t = document.createElement('button'); t.type = 'button'; t.className = 'abtn'; t.id = 'u6ask'; t.textContent = label; t.style.marginLeft = 'auto'
      acts.appendChild(t)
      const q = e => { const x = e.getBoundingClientRect(); return { x: Math.round(x.left), y: Math.round(x.top), w: Math.round(x.width), h: Math.round(x.height) } }
      return { line: [...acts.querySelectorAll('button')].map(x => x.textContent.trim()), boxes: [...acts.querySelectorAll('button')].map(q) }
    }, W6.askPost('142', '149'))
    FACT(`${k}.drawn`, { opened: g.opened, buttons: g.openedButtons, actsLine: b, cinchTodayOn149: CARD['k.Cinch'].accessToday })
    await s.page.evaluate(() => { const c = document.querySelector('#u6opened'); scrollBy(0, c.getBoundingClientRect().top - 330) }); await wait(s, 300)
    await s.page.evaluate(() => document.activeElement?.blur())
    await vring(s, await box(s, '#u6ask'))
    const c = await box(s, '#u6opened'), f = await box(s, '#n176fold142'), col = await listCol(s)
    const top = Math.max(f.y, c.y - 250)
    await shot(s, k, [{ x: col.x, y: top, w: col.w, h: c.y + c.h + 110 - top }], 16)
  }, { state: ST })

  /* 6b - u6-d-askpost-bell: Hunter's bell (142's admin) */
  if (want('bell')) await run('u6.bell', 'd', async s => {
    const k = 'u6-d-askpost-bell'
    await as(s, 'hunter'); await tapBell(s)
    const real = await lineParts(s)
    FACT(`${k}.realLines`, real.map(l => `${l.mark ?? '-'} | ${l.name} ${l.day} | ${l.what} | ${l.ago}`))
    /* the day the line is written: today, in the bell's own day form ("Wed 25 Nov") */
    const day = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '')
    FACT(`${k}.dayForm`, { real: real[0]?.day, drawn: day })
    const r = await numbersFirst(s, { home: '142', about: ['^Given (Plan|View) of', '^Plan of .* ended'], clones: [] })
    /* the new line: the newest, so first - a real line of his bell cloned */
    const drawn = await s.page.evaluate(({ L, c }) => {
      const first = document.querySelector(L + ' .bl-line'), e = first.cloneNode(true); e.removeAttribute('data-testid'); e.id = 'u6line'; e.classList.add('unread')
      e.querySelector('.bl-name').textContent = c.name; e.querySelector('.bl-day').textContent = c.day; e.querySelector('.bl-what').textContent = c.what; e.querySelector('.bl-ago').textContent = c.ago
      const m = e.querySelector('.bl-sqn'); m.textContent = c.mark; m.style.visibility = 'visible'
      first.before(e)
      return [...e.querySelectorAll('.bl-sqn, .bl-name, .bl-day, .bl-what, .bl-ago')].map(x => x.textContent)
    }, { L: LIST, c: { name: 'Cinch', day, what: `${W6.askBell('149')} · Kestrel`, ago: 'now', mark: '142' } })
    /* his D2638 (after the words review, 26 Nov): a bell showing more than one squadron - every line's number wears its
       squadron's colour, the same as its Show button (round 5's sample colours, as draw-r6-misc-d8); the unread dot stays */
    const COL = { '142': '#F28C28', '149': '#D4AF37', '150': '#3B82F6' }
    const show = await s.page.evaluate(L => [...document.querySelectorAll(L + ' [data-testid="bell-show"] button')].map(b => `${b.textContent.trim()}:${b.getAttribute('aria-pressed') === 'true' ? 'on' : 'off'}`), LIST)
    const many = show.filter(x => /:on$/.test(x)).length > 1
    if (many) await s.page.evaluate(([L, COL]) => { const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(','); for (const m of document.querySelectorAll(L + ' .bl-sqn')) { const c = COL[m.textContent.trim()]; if (c) Object.assign(m.style, { color: c, borderColor: `rgba(${hex(c)},.6)`, background: `rgba(${hex(c)},.16)` }) } for (const b of document.querySelectorAll(L + ' [data-testid="bell-show"] button')) { const c = COL[b.textContent.trim()]; if (c) { const on = b.getAttribute('aria-pressed') === 'true'; Object.assign(b.style, { color: c, borderColor: `rgba(${hex(c)},${on ? .6 : .35})`, background: `rgba(${hex(c)},${on ? .16 : .06})` }) } } }, [LIST, COL])
    FACT(`${k}.drawn`, { column: r.column, line: drawn, show, coloured: many, numberColour: await s.page.evaluate(() => getComputedStyle(document.querySelector('#u6line .bl-sqn')).color) })
    await wait(s, 300)
    await vring(s, await box(s, '#u6line'))
    await shot(s, k, [await box(s, LIST)], 16)
  }, { state: ST })

  /* 7 - u6-d-both-pages: Cinch in transit, on 142's page and on 149's */
  if (want('both')) {
    await run('u6.both.142', 'd', async s => {
      const k = 'u6-d-both-pages-142'
      await as(s, 'hunter'); await usersTab(s); await wait(s, 500)
      FACT(`${k}.addButton`, await addButton(s, W))
      const cinch = man('142', 'Cinch')
      FACT(`${k}.top`, await buildTop(s, {
        other: { label: W6.fromOther(0).replace(/ · 0$/, ''), empty: W6.nobodyOutside('142') },
        outgoing: { label: W6.outgoing(1), rows: [{ key: 'cinch', cs: 'Cinch', sub: cinch.seatCat, tag: W6.postingOutTo('14 Dec', '149'), open: [W6.undoPostOut, 'Cancel'] }] },
      }))
      FACT(`${k}.cinchRow`, await tagRow(s, 'snap', W6.postingOutTo('14 Dec', '149')))
      FACT(`${k}.folds`, await folded(s, heads(149, 150)))
      await s.page.evaluate(() => document.activeElement?.blur())
      await toTop(s, '#u6top', 150)
      FACT(`${k}.measured`, await topFacts(s))
      for (const sel of ['#u6out', '#u6tag-snap']) await vring(s, await box(s, sel))
      const top = await box(s, '#u6top'), row = await box(s, '[data-testid="acc-groups"] [data-person="snap"]'), col = await listCol(s)
      await shotTall(s, k, { x: col.x, y: top.y, w: col.w, h: row.y + row.h + 8 - top.y }, 16)
    }, { state: ST })
    await run('u6.both.149', 'd', async s => {
      const k = 'u6-d-both-pages-149'
      await as(s, 'kestrel'); await usersTab(s); await wait(s, 400)
      await page149(s, k)
      await toTop(s, '#u6top', 150)
      for (const sel of ['#u6in']) await vring(s, await box(s, sel))
      const top = await box(s, '#u6top'), head = await box(s, '.od-head'), col = await listCol(s)
      await shotTall(s, k, { x: col.x, y: top.y, w: col.w, h: head.y + head.h + 8 - top.y }, 16)
    }, { state: ST })
    /* the two cuts, one above the other, each under a plain caption (the picture's own words, not the app's) */
    await run('u6.both', 'd', async s => {
      const img = f => 'data:image/png;base64,' + readFileSync(`${DRAWN}/${f}`).toString('base64')
      await s.page.setContent(`<body style="margin:0;background:#07090c"><div id="sheet" style="width:616px;padding:16px 16px 20px;background:#07090c;font:600 14px 'Segoe UI',system-ui,sans-serif;color:#b6c0cb">
        <div style="margin:0 0 8px">${W6.capPage('142', 'Hunter, its admin')}</div><img src="${img('u6-d-both-pages-142-crop.png')}" style="width:616px;display:block;border:1px solid #232a33;border-radius:8px">
        <div style="margin:22px 0 8px">${W6.capPage('149', 'Kestrel, its admin')}</div><img src="${img('u6-d-both-pages-149-crop.png')}" style="width:616px;display:block;border:1px solid #232a33;border-radius:8px"></div></body>`)
      await wait(s, 500)
      await s.page.locator('#sheet').screenshot({ path: `${DRAWN}/u6-d-both-pages.png` })
      FACT('u6-d-both-pages', 'made of u6-d-both-pages-142-crop.png above u6-d-both-pages-149-crop.png')
    }, { state: ST })
  }
} finally { await closeAll() }
