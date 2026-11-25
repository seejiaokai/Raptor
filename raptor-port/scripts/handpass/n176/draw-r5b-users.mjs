// draw-r5b-users - round 5's redraws on Admin → Users (brief 2026-11-25-msq-q3-redraw-brief.md, items 1, 2, 3, 10).
//  e4a (d, p)      item 1 - Kestrel on 149 (THE WORLD, as round 1): Hunter's row on the main list shows "Hunter [142]" /
//                  "Pilot · CAT IP · also plans 149" - his sign-in name, role and both dots taken off. Desktop crop starts on
//                  his row.
//  e4b-?-r         item 2, D5's recommended way (THE R5B WORLD) - Kestrel on 149, "▾ 142 · 60 people" open: short closed rows
//                  (callsign + the grey 142, seat · CAT, nothing at the right; Bolt, who holds View of 149, adds
//                  W.alsoViews; Hunter not in the group). One row opened: Blade, a 142 admin with a sign-in - his real
//                  opened row (read on Kestrel's page by the search) cut to its 149 line, Save and Cancel.
//  e4b2-?          the same, Basher (no sign-in) opened: W.noSignInOpened('142'), Cancel only.
//  e4b3-?          the same, Ranger (a 142 member with a sign-in) opened: his real 149 line - Plan greyed, "Plan is for
//                  admins only." under it (the app's own note) - Save and Cancel.
//  e4c-d-note      item 3 - Hunter (Plan of 149) on 149, the same group: Blade's row opened, his 149 Plan greyed, the reason
//                  W.planGreyed('149') on its own line under that access line (the app's own note under a line), pink mark.
//  e4c-d-greyed    the other choice on the same opened row: the reason as the greyed Plan's hover label (imitated).
//  e5-d-primary-top   item 10 - as round 1 (Saber, Filter's squadron ticks 142, 149, 150; 149 and 150 folded), the open
//                  group's heading "142 · 60 people", no arrow, in the folded headings' own type.
//  e5-d-primary-top-r E8's recommended way - Saber, 149 picked, no tick: 149's rows whole, 142 and 150 folded under them.
//   node raptor-port/scripts/handpass/n176/draw-r5b-users.mjs   (ONLY=e4a-d,e4a-p,e4b-d,e4b-p,e4b2-d,e4b2-p,e4b3-d,e4b3-p,e4c,e5,e5r)
import { run, as, W, FACT, want, wait, vis, hit, usersTab, reachPick, shot, box, words, closeAll, typeInto, linesOf, world, r5bWorld, ring, shotTall } from './draw-r5b-lib.mjs'
let ARCH = null, P142 = null, COUNT = {}, CARD = {}
const n = t => Number(String(t).replace(/\D+/g, ''))
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
  await run('r5b.read', 'd', async s => {
    await as(s, 'saber'); await usersTab(s); await wait(s, 400)
    ARCH = await s.page.evaluate(() => document.querySelector('#accArchived').outerHTML)
    P142 = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].map(e => {
      const sub = [...e.querySelector('.acc-sub').childNodes].map(n => n.nodeType === 3 ? n.textContent : (n.classList?.contains('od-rw') || n.classList?.contains('od-plans') || n.classList?.contains('od-po') || n.classList?.contains('acc-tag') ? '' : n.textContent)).join('')
      const parts = sub.split(' · ').map(x => x.trim()).filter(Boolean)
      return { pid: e.dataset.person, cs: e.querySelector('.acc-name').childNodes[0].textContent, seatCat: parts.slice(1).filter(p => !/^also /.test(p)).join(' · '), whole: e.innerText.replace(/\s+/g, ' ').trim() }
    }))
    COUNT['142'] = n((await words(s, '.od-head .adm-sub'))[0])
    await reachPick(s, 150, 'bar'); await usersTab(s); await wait(s, 400)
    COUNT['150'] = n((await words(s, '.od-head .adm-sub'))[0])
  }, { state: st })
  await run('r5b.read.kestrel', 'd', async s => {
    await as(s, 'kestrel'); await usersTab(s); await wait(s, 400)
    for (const cs of ['Blade', 'Basher', 'Ranger']) CARD['k.' + cs] = await openCard(s, cs)
  }, { state: st })
  await run('r5b.read.hunter', 'd', async s => {
    await as(s, 'hunter'); await reachPick(s, 149, 'bar'); await usersTab(s); await wait(s, 400)
    CARD['h.Blade'] = await openCard(s, 'Blade')
  }, { state: st })
  FACT('r5b.sources', { counts: COUNT, people142: P142.length, blade: P142.find(p => p.cs === 'Blade')?.whole, bolt: P142.find(p => p.cs === 'Bolt')?.whole, ranger: P142.find(p => p.cs === 'Ranger')?.whole, cardsToday: Object.fromEntries(Object.entries(CARD).map(([k, v]) => [k, v.accessToday])) })
}
/* the folded headings under the page's own people, cloned from "▸ Archived" (round 1's way) */
const folded = (s, heads) => s.page.evaluate(({ ARCH, heads }) => {
  const groups = document.querySelector('[data-testid="acc-groups"]'); let at = groups
  for (const [num, label] of heads) {
    const h = document.createElement('div'); h.innerHTML = ARCH; const blk = h.firstElementChild
    blk.id = 'n176fold' + num; blk.dataset.n176unit = num; blk.querySelector('#accArchList')?.remove()
    const b = blk.querySelector('button'); b.id = 'n176foldBtn' + num; b.setAttribute('aria-expanded', 'false'); b.textContent = label
    at.insertAdjacentElement('afterend', blk); at = blk
  }
  return [...document.querySelectorAll('[data-n176unit] button')].map(b => b.textContent)
}, { ARCH, heads })
const HEADS = () => [['142', W.folded('142', COUNT['142'])], ['150', W.folded('150', COUNT['150'])]]
/* D5's recommended group: 142 open, short closed rows; one row (pid) replaced by an opened card shaped from his real one */
async function open142(s, { open = null, card = null, kind = 'admin', greyPlan = false } = {}) {
  return s.page.evaluate(({ P142, open, card, kind, greyPlan, heading, alsoViews, noSignIn }) => {
    const tplRow = [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].find(e => !e.querySelector('.acc-sqn') && !e.querySelector('.ub'))
    const sqn = document.querySelector('.acc-sqn')
    const btn = document.querySelector('#n176foldBtn142'); btn.textContent = heading; btn.setAttribute('aria-expanded', 'true')
    const list = document.createElement('div'); list.className = 'acc-list od-list'; list.id = 'n176list142'
    let opened = null
    for (const p of P142) {
      if (p.pid === 'prowler') continue   /* Hunter: on 149's own list (he plans 149), not in this group */
      const sub = p.seatCat + (p.cs === 'Bolt' ? ' · ' + alsoViews : '')
      if (p.pid === open) {
        const h = document.createElement('div'); h.innerHTML = card; const c = h.firstElementChild
        c.dataset.person = 'r5b-' + c.dataset.person; c.id = 'r5bOpened'
        c.querySelector('.acc-tap')?.removeAttribute('title')
        c.querySelector('.acc-sub').textContent = sub
        c.querySelectorAll('.od-c').forEach(e => e.remove()); const rc = c.querySelector('.od-rc'); if (rc) rc.textContent = ''
        const edit = c.querySelector('.acc-edit')
        edit.querySelector(':scope > .adm-2col')?.remove()
        edit.querySelector('details.acc-roles')?.remove()
        const acts = [...edit.querySelectorAll(':scope > .acc-acts')].pop()
        for (const b of [...acts.querySelectorAll('button')]) { const t = b.textContent.trim(); if (!(t === 'Cancel' || (t === 'Save' && kind !== 'nosignin'))) b.remove() }
        const sq = edit.querySelector('.acc-sq')
        if (kind === 'nosignin') { sq.remove(); const p2 = document.createElement('p'); p2.className = 'adm-note'; p2.id = 'r5bNoSignIn'; p2.textContent = noSignIn; edit.insertBefore(p2, acts) }
        else {
          for (const e of [...sq.children]) { const u = e.dataset.unit || e.dataset.noteUnit || ''; const lab = e.getAttribute('aria-label') || ''; if (!(u === 'u149' || /149$/.test(lab))) e.remove() }
          /* the man's own line: None (he holds no access to 149) */
          for (const b of sq.querySelectorAll('[aria-label="Access to 149"] button')) { const on = b.dataset.line === 'none'; b.setAttribute('aria-pressed', String(on)); b.className = 'abtn' + (on ? ' primary' : '') }
          /* a 142 ADMIN's line: today's "Only a master admin gives Plan." goes (D2626 - 149's own admins give Plan of 149):
             Plan live for Kestrel (149's own admin), greyed for Hunter (who only holds Plan of 149), its reason drawn by
             the picture itself; a member's line keeps the app's own "Plan is for admins only." */
          const pl = sq.querySelector('[aria-label="Access to 149"] [data-line="plan"]'); pl.id = 'r5bPlan'
          if (kind === 'admin') { sq.querySelectorAll('.acc-sq-note').forEach(e => e.remove()); pl.disabled = !!greyPlan }
        }
        /* the space the sign-in and role boxes stood in closed up: the first part left starts where they started */
        const first = edit.firstElementChild; if (first) first.style.marginTop = '0'
        const ns = edit.querySelector('#r5bNoSignIn'); if (ns) ns.style.margin = '0 0 10px'
        list.appendChild(c); opened = c; continue
      }
      const r = tplRow.cloneNode(true); r.dataset.person = 'n176-' + p.pid; r.querySelector('.acc-tap').removeAttribute('title')
      const nm = r.querySelector('.acc-name'); nm.textContent = p.cs; const m = sqn.cloneNode(true); m.removeAttribute('data-testid'); m.textContent = '142'; nm.appendChild(m)
      r.querySelector('.acc-sub').textContent = sub
      r.querySelectorAll('.od-c').forEach(e => e.remove())
      const rc = r.querySelector('.od-rc'); if (rc) rc.textContent = ''
      list.appendChild(r)
    }
    document.querySelector('#n176fold142').appendChild(list)
    const rows = [...list.querySelectorAll('.acc-row')]
    return { rows: rows.length, first: rows.slice(0, 4).map(r => r.innerText.replace(/\s+/g, ' ').trim()), bolt: rows.find(r => /^Bolt/.test(r.innerText))?.innerText.replace(/\s+/g, ' ').trim(), opened: opened ? opened.innerText.replace(/\s+/g, ' ').trim() : null, openedButtons: opened ? [...opened.querySelectorAll('button')].filter(b => !b.classList.contains('acc-tap')).map(b => b.textContent.trim() + (b.disabled ? ' [greyed]' : '') + (b.classList.contains('primary') ? ' [main]' : '')) : null }
  }, { P142, open, card, kind, greyPlan, heading: W.folded('142', COUNT['142']).replace('▸', '▾'), alsoViews: W.alsoViews('149'), noSignIn: W.noSignInOpened('142') })
}
const listCol = s => box(s, '[data-testid="acc-groups"]')
const PID = { Blade: 'slash', Basher: 'glass', Ranger: 'bane' }
try {
  const R5 = await r5bWorld()
  await readSources(R5)
  /* ITEM 1 - Hunter's row on 149's page (Kestrel; the world as round 1 drew it) */
  for (const sz of ['d', 'p']) if (want('e4a-' + sz)) await run(`e4a.${sz}`, sz, async s => {
    await as(s, 'kestrel'); await usersTab(s); await wait(s, 400)
    await folded(s, HEADS())
    const today = await s.page.evaluate(() => document.querySelector('[data-person="prowler"]').innerText.replace(/\s+/g, ' ').trim())
    await s.page.evaluate(sub => {
      const r = document.querySelector('[data-person="prowler"]'); r.querySelector('.acc-tap').removeAttribute('title')
      r.querySelector('.acc-sub').textContent = sub
      r.querySelectorAll('.od-c, .ub').forEach(e => { e.style.visibility = 'hidden' })
    }, 'Pilot · CAT IP · ' + 'also plans 149')
    FACT(`e4a.${sz}.hunter`, { today, drawn: await s.page.evaluate(() => { const r = document.querySelector('[data-person="prowler"]'); return [...r.querySelectorAll('.acc-name, .acc-sub')].map(e => e.innerText.replace(/\s+/g, ' ').trim()) }) })
    await s.page.evaluate(k => { const a = document.querySelector('#n176fold142').getBoundingClientRect(); scrollBy(0, a.top - k) }, s.desk ? 520 : 560); await wait(s, 300)
    const h = await box(s, '[data-person="prowler"]'), f = await box(s, '#n176fold150')
    FACT(`e4a.${sz}.folds`, await words(s, '[id^=n176foldBtn]'))
    await shot(s, `e4a-${sz}-folded`, [{ x: h.x, y: h.y, w: h.w, h: f.y + f.h - h.y }])
  }, { state: await world() })
  /* ITEM 2 - D5's recommended way, Kestrel on 149 */
  const E4B = [['e4b', 'Blade', 'admin', '-r'], ['e4b2', 'Basher', 'nosignin', ''], ['e4b3', 'Ranger', 'member', '']]
  for (const [key, cs, kind, suf] of E4B) for (const sz of ['d', 'p']) if (want(`${key}-${sz}`)) await run(`${key}.${sz}`, sz, async s => {
    await as(s, 'kestrel'); await usersTab(s); await wait(s, 400)
    await folded(s, HEADS())
    const r = await open142(s, { open: PID[cs], card: CARD['k.' + cs].html, kind })
    FACT(`${key}.${sz}.drawn`, r)
    if (key === 'e4b3') { await s.page.evaluate(() => { const c = document.querySelector('#r5bOpened'); scrollBy(0, c.getBoundingClientRect().top - (innerWidth > 700 ? 260 : 250)) }) }
    else await s.page.evaluate(k => { const a = document.querySelector('#n176fold142').getBoundingClientRect(); scrollBy(0, a.top - k) }, s.desk ? 140 : 130)
    await wait(s, 300)
    const c = await box(s, '#r5bOpened'), col = await listCol(s), top = key === 'e4b3' ? c.y - 110 : (await box(s, '#n176fold142')).y
    const bottom = c.y + c.h + (key === 'e4b' ? 100 : 100)
    await shot(s, `${key}-${sz}-opened${suf}`, [{ x: col.x, y: top, w: col.w, h: Math.min(bottom, s.H) - top }])
  }, { state: R5 })
  /* ITEM 3 - Hunter (Plan of 149) on 149: Blade's row opened, Plan greyed; the reason under the line (pink mark), or as a hover label */
  if (want('e4c')) for (const v of ['note', 'greyed']) await run(`e4c.${v}`, 'd', async s => {
    await as(s, 'hunter'); await reachPick(s, 149, 'bar'); await usersTab(s); await wait(s, 400)
    await folded(s, HEADS())
    FACT(`e4c.${v}.drawn`, await open142(s, { open: 'slash', card: CARD['h.Blade'].html, kind: 'admin', greyPlan: true }))
    await s.page.evaluate(k => { const a = document.querySelector('#n176fold142').getBoundingClientRect(); scrollBy(0, a.top - k) }, 140); await wait(s, 300)
    const col = await listCol(s)
    if (v === 'note') {
      await s.page.evaluate(why => { const g = document.querySelector('#r5bOpened [aria-label="Access to 149"]'); const p = document.createElement('p'); p.className = 'adm-note acc-sq-note'; p.dataset.noteUnit = 'u149'; p.id = 'r5bWhy'; p.textContent = why; g.insertAdjacentElement('afterend', p) }, W.planGreyed('149'))
      await wait(s, 200)
      const why = await box(s, '#r5bWhy'), g = await box(s, '#r5bOpened [aria-label="Access to 149"]')
      FACT('e4c.note', { words: await words(s, '#r5bWhy'), lines: await linesOf(s, '#r5bWhy'), leftOfNote: why.x, leftOfLine: g.x, underLine: why.y - (g.y + g.h) })
      const tw = await s.page.evaluate(() => { const e = document.querySelector('#r5bWhy'); const rg = document.createRange(); rg.selectNodeContents(e); const q = rg.getBoundingClientRect(); return { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) } })
      await ring(s, tw)
      const c = await box(s, '#r5bOpened'), f = await box(s, '#n176fold142')
      await shot(s, 'e4c-d-note', [{ x: col.x, y: f.y, w: col.w, h: c.y + c.h + 60 - f.y }])
    } else {
      const plan = await box(s, '#r5bPlan')
      await s.page.evaluate(([b, why]) => { const d = document.createElement('div'); d.id = 'n176tip'; d.textContent = why; Object.assign(d.style, { position: 'fixed', left: Math.min(b.x + 6, innerWidth - 470) + 'px', top: (b.y + b.h + 14) + 'px', zIndex: 2147483000, background: '#2b2b2b', color: '#f1f1f1', border: '1px solid #5f5f5f', borderRadius: '4px', padding: '4px 8px', font: '12px "Segoe UI", system-ui, sans-serif', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(0,0,0,.4)' }); document.body.appendChild(d) }, [plan, W.planGreyed('149')])
      FACT('e4c.greyed', { plan, hoverText: W.planGreyed('149'), imitated: 'the browser\'s own hover label, drawn by hand for this picture only' })
      const c = await box(s, '#r5bOpened'), f = await box(s, '#n176fold142')
      await shot(s, 'e4c-d-greyed', [{ x: col.x, y: f.y, w: col.w, h: c.y + c.h + 60 - f.y }, await box(s, '#n176tip')])
    }
  }, { state: R5 })
  /* ITEM 10 - the open group's heading, as round 1 (Saber, the squadron ticks) */
  if (want('e5')) await run('e5', 'd', async s => {
    await as(s, 'saber'); await usersTab(s); await wait(s, 400)
    await hit(s, '#accFilter', 500)
    for (const num of ['142', '149', '150']) { const c = vis(s, '#accFilterPanel button').filter({ hasText: new RegExp('^(✓ )?' + num + '$') }); if (await c.count()) await hit(s, c.first(), 300) }
    await s.page.keyboard.press('Escape'); await wait(s, 400)
    if (await vis(s, '#accFilterPanel').count()) await hit(s, '#accFilter', 400)
    await s.page.evaluate(() => document.activeElement?.blur())
    const heads = await words(s, '[data-unit-head]')
    const counts = Object.fromEntries(heads.map(h => h.split('·').map(x => x.trim())))
    const labels = { '149': W.folded('149', counts['149']), '150': W.folded('150', counts['150']) }
    await s.page.evaluate(({ arch, labels }) => {
      for (const g of [...document.querySelectorAll('[data-testid="acc-groups"] > div')]) {
        const h = g.querySelector('[data-unit-head]'); if (!h) continue
        const num = h.textContent.split('·')[0].trim(); if (!labels[num]) continue
        const t = document.createElement('div'); t.innerHTML = arch; const blk = t.firstElementChild
        blk.id = 'n176fold' + num; blk.querySelector('#accArchList')?.remove()
        const b = blk.querySelector('button'); b.id = 'n176foldBtn' + num; b.setAttribute('aria-expanded', 'false'); b.textContent = labels[num]
        g.replaceWith(blk)
      }
    }, { arch: ARCH, labels })
    /* THE CHANGE: 142's open heading in the folded headings' own type, the words W.folded without the arrow */
    const r = await s.page.evaluate(words => {
      const h = [...document.querySelectorAll('[data-unit-head]')].find(e => /^142/.test(e.textContent.trim()))
      const f = getComputedStyle(document.querySelector('#n176foldBtn149'))
      const was = { words: h.textContent.trim(), size: getComputedStyle(h).fontSize, weight: getComputedStyle(h).fontWeight, transform: getComputedStyle(h).textTransform, spacing: getComputedStyle(h).letterSpacing }
      h.textContent = words; h.id = 'r5bHead'
      for (const k of ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'textTransform', 'color', 'lineHeight']) h.style[k] = f[k]
      return { was, now: { words: h.textContent, size: f.fontSize, weight: f.fontWeight, transform: f.textTransform, spacing: f.letterSpacing, color: f.color } }
    }, W.folded('142', counts['142']).replace('▸ ', ''))
    FACT('e5.head', r)
    FACT('e5.top', { filter: await words(s, '#accFilter'), showing: await words(s, '.od-showing, [data-testid="users-showing"]'), folds: await words(s, '[id^=n176foldBtn]') })
    await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 300)
    await shot(s, 'e5-d-primary-top', [await box(s, '.od-head')].map(b => ({ ...b, h: 420 })))
  })
  /* E8's recommended way: Saber, 149 picked, no tick - 149 open, 142 and 150 folded */
  if (want('e5r')) await run('e5r', 'd', async s => {
    await as(s, 'saber'); await reachPick(s, 149, 'bar'); await usersTab(s); await wait(s, 500)
    FACT('e5r.today', { head: await words(s, '.od-head'), filter: await words(s, '#accFilter'), showing: await words(s, '.od-showing, [data-testid="users-showing"]'), rows: (await words(s, '[data-testid="acc-groups"] .acc-name')) })
    FACT('e5r.folded', await folded(s, HEADS()))
    /* Hunter's row on 149's page in the short form, as e4a (D2625: a 142 man's row on 149's page is short for Saber too) */
    await s.page.evaluate(sub => {
      const r = [...document.querySelectorAll('[data-person="prowler"]')].find(e => e.querySelector('.acc-sub')); r.querySelector('.acc-tap')?.removeAttribute('title')
      r.querySelector('.acc-sub').textContent = sub
      r.querySelectorAll('.od-c, .ub').forEach(e => { e.style.visibility = 'hidden' })
    }, 'Pilot · CAT IP · also plans 149')
    FACT('e5r.hunter', await s.page.evaluate(() => { const r = [...document.querySelectorAll('[data-person="prowler"]')].find(e => e.querySelector('.acc-sub')); return [...r.querySelectorAll('.acc-name, .acc-sub')].map(e => e.innerText.replace(/\s+/g, ' ').trim()) }))
    await s.page.evaluate(() => document.activeElement?.blur()); await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 300)
    const head = await box(s, '.od-head'), f = await box(s, '#n176fold150'), col = await listCol(s)
    await shotTall(s, 'e5-d-primary-top-r', { x: col.x, y: head.y, w: col.w, h: f.y + f.h - head.y })
  }, { state: await world() })   /* round 1's world (Osprey a member), as e5's first pictures */
} finally { await closeAll() }
