// draw-e4 - another squadron's people on Admin → Users (his D2625, D2629, D2635, D2626), and the roles table's note 5.
//  e4a (d, p)  Kestrel (149's own admin) on 149: 149's people as today; under them W.folded('142', n) and W.folded('150', n),
//              closed - each cloned from Admin → Users' own "▸ Archived" heading (its markup read on 142's page, where
//              an archived man stands; 149 has none). n = that squadron's own people, as its own page's heading counts.
//  e4b (d, p)  the 142 heading opened (its ▸ turned ▾, as "▸ Archived" turns when opened): 142's people grouped under it,
//              each row a clone of the page's own row, showing only callsign, the grey "142" (the page's own `.acc-sqn`),
//              seat and CAT, and the access line for 149 (the opened row's own "Access to 149" None · View · Plan,
//              cloned) - no sign-in mail, role, dots, Save, Suspend, Archive or Delete. Saber, a master admin: the opened
//              row's own "Full access" words. The line shows each man's real access to 149.
//  e4c-d       the same as Hunter (Plan of 149): every Plan greyed (the app's own greyed button), its reason
//              W.planGreyed('149') as the button's hover text - the browser's own label, IMITATED for the picture (a
//              screenshot holds none) - and e4c-d-note: the reason as the opened row shows one today (its `.acc-sq-note`
//              under the line), on the first row. A phone shows no hover text; the note is what a phone would show.
//  e4t-d       TODAY: Hunter on 149, "Ranger" (142) found by the search and opened: his sign-in mail, Role and Save,
//              Suspend, Archive, Delete live (the P6 finding).
//  e4d-d       the roles table ("What each role allows", in an opened row) with its note 5 changed to W.rolesNote.
//   node raptor-port/scripts/handpass/n176/draw-e4.mjs        (ONLY=e4a-d,e4a-p,e4b-d,e4b-p,e4c,e4t,e4d)
import { run, as, W, FACT, want, wait, vis, hit, usersTab, reachPick, shot, box, words, closeAll, typeInto, linesOf } from './draw-lib.mjs'
let ARCH = null, P142 = null, COUNT = {}, SRC = null
/* read once: the "▸ Archived" heading's markup and 142's people (callsign, seat · CAT, real access to 149) - Saber */
async function readSources() {
  await run('e4.read', 'd', async s => {
    await as(s, 'saber'); await usersTab(s); await wait(s, 400)
    ARCH = await s.page.evaluate(() => document.querySelector('#accArchived').outerHTML)
    P142 = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].map(e => {
      const sub = [...e.querySelector('.acc-sub').childNodes].map(n => n.nodeType === 3 ? n.textContent : (n.classList?.contains('od-rw') || n.classList?.contains('od-plans') || n.classList?.contains('od-po') || n.classList?.contains('acc-tag') ? '' : n.textContent)).join('')
      const parts = sub.split(' · ').map(x => x.trim()).filter(Boolean)
      return { pid: e.dataset.person, cs: e.querySelector('.acc-name').childNodes[0].textContent, seatCat: parts.slice(1).join(' · '), master: false }
    }))
    COUNT['142'] = (await words(s, '.od-head .adm-sub'))[0]
    await reachPick(s, 150, 'bar'); await usersTab(s); await wait(s, 400)
    COUNT['150'] = (await words(s, '.od-head .adm-sub'))[0]
  })
  /* the opened row's own access-line markup: Kestrel on 149, a 142 man's row on his page (Hunter's - he holds a line of
     149) opened, read, closed */
  await run('e4.read2', 'd', async s => {
    await as(s, 'kestrel'); await usersTab(s); await wait(s, 400)
    await hit(s, vis(s, '.acc-row[data-person="prowler"] .acc-tap').first(), 700)
    SRC = await s.page.evaluate(() => {
      const g = document.querySelector('[data-testid="acc-sq"] [aria-label="Access to 149"]')
      const home = document.querySelector('[data-testid="acc-sq"] .acc-sq-home')
      return { group: g.outerHTML, home: home.outerHTML, todayNote: document.querySelector('[data-testid="acc-sq"] [data-note-unit]')?.textContent ?? null }
    })
  })
  FACT('e4.accessLineSource', { cloned: 'the opened row\'s own "Access to 149" (None · View · Plan) and its "Full access" words, read on Kestrel\'s 149 page from Hunter\'s opened row', todayNoteThere: SRC.todayNote })
  const n = t => Number(String(t).replace(/\D+/g, ''))
  COUNT = { '142': n(COUNT['142']), '150': n(COUNT['150']) }
  FACT('e4.sources', { archivedHeading: ARCH.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), counts: COUNT, people142: P142.length })
}
const ACCESS = { prowler: 'plan', stiff: 'master' }
/* the folded headings, cloned from "▸ Archived", under the page's own people */
async function folded(s) {
  return s.page.evaluate(({ ARCH, heads }) => {
    const groups = document.querySelector('[data-testid="acc-groups"]'); let at = groups
    for (const [num, label] of heads) {
      const h = document.createElement('div'); h.innerHTML = ARCH; const blk = h.firstElementChild
      blk.id = 'n176fold' + num; blk.dataset.n176unit = num
      blk.querySelector('#accArchList')?.remove()
      const b = blk.querySelector('button'); b.id = 'n176foldBtn' + num; b.setAttribute('aria-expanded', 'false'); b.textContent = label
      at.insertAdjacentElement('afterend', blk); at = blk
    }
    return [...document.querySelectorAll('[data-n176unit] button')].map(b => b.textContent)
  }, { ARCH, heads: [['142', W.folded('142', COUNT['142'])], ['150', W.folded('150', COUNT['150'])]] })
}
/* the 142 heading opened: its people under it, each a clone of the page's own row with only what D2625 lets show */
async function open142(s, { greyPlan }) {
  const src = SRC
  return s.page.evaluate(({ P142, src, open, ACCESS, greyPlan, why }) => {
    const tplRow = [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].find(e => !e.querySelector('.acc-sqn') && !e.querySelector('.ub'))
    const sqn = document.querySelector('.acc-sqn')
    const btn = document.querySelector('#n176foldBtn142'); btn.textContent = open; btn.setAttribute('aria-expanded', 'true')
    const list = document.createElement('div'); list.className = 'acc-list od-list'; list.id = 'n176list142'
    for (const p of P142) {
      const r = tplRow.cloneNode(true); r.dataset.person = 'n176-' + p.pid; r.querySelector('.acc-tap').removeAttribute('title')
      const nm = r.querySelector('.acc-name'); nm.textContent = p.cs; const m = sqn.cloneNode(true); m.removeAttribute('data-testid'); m.textContent = '142'; nm.appendChild(m)
      r.querySelector('.acc-sub').textContent = p.seatCat
      r.querySelectorAll('.od-c').forEach(e => e.remove())
      const rc = r.querySelector('.od-rc'); rc.textContent = ''; rc.style.display = 'flex'; rc.style.alignItems = 'center'; rc.style.justifyContent = 'flex-end'; rc.style.width = 'auto'
      const line = ACCESS[p.pid] || 'none'
      if (line === 'master') { const h = document.createElement('div'); h.innerHTML = src.home; const e = h.firstElementChild; e.textContent = 'Full access'; rc.appendChild(e) }
      else {
        const h = document.createElement('div'); h.innerHTML = src.group; const g = h.firstElementChild
        g.style.margin = '0'; g.style.flexWrap = 'nowrap'
        for (const b of g.querySelectorAll('button')) { const on = b.dataset.line === line; b.setAttribute('aria-pressed', String(on)); b.className = 'abtn' + (on ? ' primary' : ''); b.disabled = false
          if (greyPlan && b.dataset.line === 'plan') { b.disabled = true; b.title = why } }
        rc.appendChild(g)
      }
      list.appendChild(r)
    }
    document.querySelector('#n176fold142').appendChild(list)
    const r0 = list.querySelector('.acc-row').getBoundingClientRect()
    return { rows: list.querySelectorAll('.acc-row').length, firstRowH: Math.round(r0.height), firstRows: [...list.querySelectorAll('.acc-row')].slice(0, 6).map(r => r.innerText.replace(/\s+/g, ' ').trim()) }
  }, { P142, src, open: W.folded('142', COUNT['142']).replace('▸', '▾'), ACCESS, greyPlan, why: W.planGreyed('149') })
}
const foldBox = s => s.page.evaluate(() => { const a = document.querySelector('#n176fold142').getBoundingClientRect(), b = document.querySelector('#n176fold150').getBoundingClientRect(); return { x: Math.round(a.left), y: Math.round(a.top), w: Math.round(a.width), h: Math.round(b.bottom - a.top) } })
async function toFolds(s, keepAbove = 220) {
  await s.page.evaluate(k => { const a = document.querySelector('#n176fold142').getBoundingClientRect(); scrollBy(0, a.top - k) }, keepAbove); await wait(s, 300)
}
try {
  await readSources()
  for (const sz of ['d', 'p']) if (want('e4a-' + sz)) await run(`e4a.${sz}`, sz, async s => {
    await as(s, 'kestrel'); await usersTab(s); await wait(s, 400)
    FACT(`e4a.${sz}.page`, { people: await words(s, '.od-head .adm-sub'), rows: await words(s, '[data-testid="acc-groups"] .acc-name') })
    FACT(`e4a.${sz}.folded`, await folded(s))
    await toFolds(s, s.desk ? 520 : 560)
    const f = await foldBox(s); FACT(`e4a.${sz}.foldBox`, f)
    await shot(s, `e4a-${sz}-folded`, [{ ...f, y: f.y - (s.desk ? 260 : 300), h: f.h + (s.desk ? 260 : 300) }])
  })
  for (const sz of ['d', 'p']) if (want('e4b-' + sz)) await run(`e4b.${sz}`, sz, async s => {
    await as(s, 'kestrel'); await usersTab(s); await wait(s, 400)
    await folded(s)
    FACT(`e4b.${sz}.opened`, await open142(s, { greyPlan: false }))
    FACT(`e4b.${sz}.heading`, await words(s, '#n176foldBtn142'))
    FACT(`e4b.${sz}.rowLines`, await s.page.evaluate(() => { const r = document.querySelector('#n176list142 .acc-row'); return { access: r.querySelector('[role=group]')?.getBoundingClientRect().top - r.getBoundingClientRect().top, rowH: Math.round(r.getBoundingClientRect().height) } }))
    await toFolds(s, s.desk ? 120 : 90)
    await shot(s, `e4b-${sz}-opened`, [{ x: 0, y: 60, w: s.W, h: s.H - 60 }].map(b => s.desk ? { x: 607, y: 60, w: 584, h: 780 } : b))
  })
  if (want('e4c')) await run('e4c', 'd', async s => {
    await as(s, 'hunter'); await reachPick(s, 149, 'bar'); await usersTab(s); await wait(s, 400)
    await folded(s)
    FACT('e4c.opened', await open142(s, { greyPlan: true }))
    await toFolds(s, 120)
    const plan = await s.page.evaluate(() => { const b = document.querySelector('#n176list142 .acc-row:nth-child(2) [data-line="plan"]'); b.id = 'n176plan'; const r = b.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), greyed: b.disabled, title: b.title } })
    FACT('e4c.planButton', plan)
    /* the hover text: the browser's own label, imitated (n175/draw-place's d6a way) */
    await s.page.evaluate(([b, why]) => { const d = document.createElement('div'); d.id = 'n176tip'; d.textContent = why; Object.assign(d.style, { position: 'fixed', left: Math.min(b.x + 6, innerWidth - 470) + 'px', top: (b.y + b.h + 14) + 'px', zIndex: 2147483000, background: '#2b2b2b', color: '#f1f1f1', border: '1px solid #5f5f5f', borderRadius: '4px', padding: '4px 8px', font: '12px "Segoe UI", system-ui, sans-serif', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(0,0,0,.4)' }); document.body.appendChild(d) }, [plan, W.planGreyed('149')])
    FACT('e4c.hoverText', { words: W.planGreyed('149'), imitated: 'the browser\'s own hover label, drawn by hand for this picture only', box: await box(s, '#n176tip') })
    await shot(s, 'e4c-d-greyed', [{ x: 607, y: plan.y - 140, w: 584, h: 260 }, await box(s, '#n176tip')])
    /* e4c-d-note: the reason as the opened row shows one today - its note under the line - on that row */
    await s.page.evaluate(why => { document.querySelector('#n176tip').remove(); const r = document.querySelector('#n176list142 .acc-row:nth-child(2)'); const p = document.createElement('p'); p.className = 'adm-note acc-sq-note'; p.textContent = why; p.style.margin = '0 0 10px'; p.style.textAlign = 'right'; r.insertAdjacentElement('afterend', p) }, W.planGreyed('149'))
    FACT('e4c.note', { words: await words(s, '#n176list142 .acc-sq-note'), lines: await linesOf(s, '#n176list142 .acc-sq-note') })
    await shot(s, 'e4c-d-note', [{ x: 607, y: plan.y - 140, w: 584, h: 260 }])
  })
  if (want('e4t')) await run('e4t', 'd', async s => {
    await as(s, 'hunter'); await reachPick(s, 149, 'bar'); await usersTab(s); await wait(s, 400)
    await typeInto(s, '#accFind', 'Ranger'); await wait(s, 400)
    await hit(s, vis(s, '#accList [data-person] .acc-tap').filter({ hasText: /Ranger/ }).first(), 700)
    const r = await s.page.evaluate(() => { const e = document.querySelector('.acc-row.od-row-on'); return { words: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 400), buttons: [...e.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim() + (b.disabled ? ' [greyed]' : ' [live]')) } })
    FACT('e4t.today', r)
    await s.page.evaluate(() => document.querySelector('.acc-row.od-row-on').scrollIntoView({ block: 'center' })); await wait(s, 300)
    await shot(s, 'e4t-d-today-row', [await box(s, '.acc-row.od-row-on')])
  })
  if (want('e4d')) await run('e4d', 'd', async s => {
    await as(s, 'saber'); await usersTab(s); await wait(s, 400)
    await hit(s, vis(s, '.acc-row[data-person="prowler"] .acc-tap').first(), 700)
    await s.page.evaluate(() => { document.querySelector('[data-testid="acc-roles"]').open = true }); await wait(s, 300)
    const today = await words(s, '.acc-rt-notes li')
    await s.page.evaluate(t => { const li = document.querySelectorAll('.acc-rt-notes li')[4]; li.textContent = t }, W.rolesNote)
    FACT('e4d.notes', { today5: today[4], drawn: await words(s, '.acc-rt-notes li'), note5Lines: await s.page.evaluate(() => { const li = document.querySelectorAll('.acc-rt-notes li')[4]; return Math.round(li.getBoundingClientRect().height / parseFloat(getComputedStyle(li).lineHeight)) }) })
    await s.page.evaluate(() => document.querySelector('[data-testid="acc-roles"]').scrollIntoView({ block: 'center' })); await wait(s, 300)
    await shot(s, 'e4d-d-roles', [await box(s, '[data-testid="acc-roles"]')])
  })
} finally { await closeAll() }
