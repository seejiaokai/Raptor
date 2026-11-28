// draw-r5b-misc - round 5's redraws (brief 2026-11-25-msq-q3-redraw-brief.md, items 4, 5, 9).
//  e9-?-greyed     item 4 - Saber, 150 picked, Inputs → SANS, a day pressed: "+ Commitment" visibly greyed (draw-r5b-lib's
//                  greyLook) and W.noSansAircrew('150') under it as the panel's own quiet reason line (SansDay's `sd-note`,
//                  the line it shows today when a man cannot add), left-aligned, above "No commitments yet." No hover label.
//  e11-d-plannedby item 5 - Kestrel, 149's Edit Schedule, Mon 7 Dec, PLANNED BY: the browser's own list drawn by the
//                  browser - a plain select drawn open by its `size` (round 1's e10 way: a picture of the pop-up itself is
//                  not possible), hung under the closed box: "— name —", "Kestrel", then the 142 names as
//                  W.plannedByName(who, '142'). The box's own choice is the list's chosen line.
//  e11b-d          the closed box after choosing Hunter: "Hunter · 142" (the option's words, no change event - nothing signed).
//  e8-d-badge-r    item 9, D10's recommended way - Hunter on 150: the badge as plain words W.badgeViewOnly('Hunter'), no
//                  button edge or fill, in the member badge's grey letters (read off the badge in the member view).
//  e8-p-menu-r     the phone ☰ menu on 150 without "Switch to the member view"; the crop the whole Account block.
//   node raptor-port/scripts/handpass/n176/draw-r5b-misc.mjs   (ONLY=e9-d,e9-p,e11,e11b,e8d,e8p)
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { run, as, W, FACT, want, wait, vis, hit, reachPick, shot, box, words, closeAll, barSq, TMP, greyLook, linesOf, usersTab } from './draw-r5b-lib.mjs'
import { go } from '../n175/p6-lib.mjs'
const ADD = '[data-testid="sd-add"]'
const PANEL = '.floatwin, .sansday, [data-testid="sansday"]'
try {
  /* ITEM 4 */
  for (const sz of ['d', 'p']) if (want('e9-' + sz)) await run(`e9.${sz}`, sz, async s => {
    await as(s, 'saber'); await reachPick(s, 150, s.desk ? 'bar' : 'menu'); await go(s, 'inputs'); await wait(s, 600)
    await hit(s, '#inSansMode', 700)
    const find = () => s.page.evaluate(() => { const d = [...document.querySelectorAll('[data-testid^="sc-day-"]')].find(e => e.getBoundingClientRect().width > 0 && /2026-12-07/.test(e.dataset.icday)); return d?.dataset.icday ?? null })
    for (let i = 0; i < 3 && !(await find()); i++) await hit(s, '[data-testid="sc-next"]', 500)
    const iso = await find(); if (!iso) throw new Error('no Mon 7 Dec in the SANS calendar')
    await hit(s, `[data-testid="sc-day-${iso}"]`, 800)
    FACT(`e9.${sz}.today`, { squadron: await barSq(s), day: iso, add: await s.page.evaluate(sel => { const b = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); return b ? { words: b.textContent, greyed: b.disabled } : null }, ADD), why: await words(s, '[data-testid="sd-addwhy"]') })
    await s.page.evaluate(sel => { [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0).id = 'r5bAdd' }, ADD)
    FACT(`e9.${sz}.greyLook`, await greyLook(s, '#r5bAdd'))
    await s.page.evaluate(why => {
      const b = document.querySelector('#r5bAdd'); new MutationObserver(() => { if (!b.disabled) b.disabled = true }).observe(b, { attributes: true })
      const row = b.parentElement; const p = document.createElement('p'); p.className = 'sd-note'; p.id = 'r5bWhy'; p.textContent = why
      row.insertAdjacentElement('afterend', p)
    }, W.noSansAircrew('150'))
    await wait(s, 200)
    const why = await box(s, '#r5bWhy'), add = await box(s, '#r5bAdd'), empty = await box(s, '[data-testid="sd-empty"]')
    FACT(`e9.${sz}.drawn`, { words: await words(s, '#r5bWhy'), lines: await linesOf(s, '#r5bWhy'), leftOfLine: why.x, leftOfButton: add.x, aboveEmpty: empty ? empty.y - (why.y + why.h) : null, panel: (await words(s, '[data-testid="sd-list"], .sd-list'))[0] })
    await shot(s, `e9-${sz}-greyed`, [await box(s, PANEL) || { ...add, h: 200 }])
  })
  /* ITEM 5 */
  const ST = resolve(TMP, 'state-e11.json')
  if ((want('e11') || want('e11b')) && !existsSync(ST)) throw new Error('round 1\'s e11 state is missing - run draw-e11.mjs first')
  for (const key of ['e11', 'e11b']) if (want(key)) await run(key, 'd', async s => {
    await as(s, 'kestrel')
    await go(s, 'editsched'); await wait(s, 1200)
    await hit(s, vis(s, 'button.wk-cal'), 700)
    for (let i = 0; i < 8; i++) { const t = await s.page.evaluate(() => document.querySelector('#weekCal')?.innerText.slice(0, 40) || ''); if (/December 2026/.test(t)) break; await hit(s, vis(s, '#weekCal button[aria-label="Next month"]').first(), 250) }
    await hit(s, vis(s, '#weekCal button').filter({ hasText: /^7$/ }).first(), 1200)
    const sel = await s.page.evaluate(() => {
      const pb = [...document.querySelectorAll('select[data-sign]')].filter(e => e.getBoundingClientRect().width > 0).find(e => /PLANNED BY/i.test(e.getAttribute('aria-label') || ''))
      if (!pb) return null; pb.id = pb.id || 'n176pb'
      return { id: pb.id, offered: [...pb.options].map(o => o.textContent.trim()), picked: pb.options[pb.selectedIndex]?.textContent.trim() }
    })
    FACT(`${key}.today`, { squadron: await barSq(s), ...sel })
    if (!sel) throw new Error('no PLANNED BY box')
    const PB = '#' + sel.id
    /* the 142 names' words in the browser's list: W.plannedByName(who, '142') */
    const names = { Hunter: W.plannedByName('Hunter', '142'), Saber: W.plannedByName('Saber', '142') }
    await s.page.evaluate(([PB, names]) => { for (const o of document.querySelector(PB).options) { const t = o.textContent.trim(); if (names[t]) o.textContent = names[t] } }, [PB, names])
    const field = await s.page.evaluate(sel => { const f = document.querySelector(sel).closest('label, .so-box, div'); const r = f.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } }, PB)
    if (key === 'e11') {
      /* the browser's own list: a plain select (no app class, the page's dark colour scheme) drawn open by its size */
      const r = await s.page.evaluate(([PB, field]) => {
        const e = document.querySelector(PB)
        const l = document.createElement('select'); l.id = 'r5bList'; l.size = e.options.length
        for (const o of e.options) { const n = document.createElement('option'); n.textContent = o.textContent; n.selected = o.selected; l.appendChild(n) }
        Object.assign(l.style, { position: 'fixed', left: field.x + 'px', top: (field.y + field.h + 2) + 'px', width: Math.max(field.w, 160) + 'px', zIndex: 2147483000, colorScheme: 'dark', fontFamily: getComputedStyle(e).fontFamily })
        document.body.appendChild(l); l.focus()   /* focused, the browser lights its chosen line, as its open list does */
        const b = l.getBoundingClientRect()
        return { listed: [...l.options].map(o => o.textContent + (o.selected ? ' (chosen)' : '')), box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } }
      }, [PB, field])
      FACT('e11.drawn', r)
      await wait(s, 200)
      await shot(s, 'e11-d-plannedby', [r.box, field, { ...field, x: field.x - 200, w: field.w + 400 }])
    } else {
      /* the box's visible words are its own `.v` span over an invisible select (html.ts: today the signed man's callsign
         alone, and the pill takes its signed `on` look); drawn: the option's words, "Hunter · 142" */
      const today = await s.page.evaluate(PB => { const l = document.querySelector(PB).closest('label.sgn'); return { shown: l.querySelector('.v').textContent, cls: l.className } }, PB)
      await s.page.evaluate(([PB, w]) => { const e = document.querySelector(PB); const i = [...e.options].findIndex(o => o.textContent === w); e.selectedIndex = i; const l = e.closest('label.sgn'); l.classList.add('on'); l.querySelector('.v').textContent = w }, [PB, names.Hunter])
      FACT('e11b.drawn', { before: today, closedBoxReads: await s.page.evaluate(PB => document.querySelector(PB).closest('label.sgn').querySelector('.v').textContent, PB), pill: await s.page.evaluate(PB => document.querySelector(PB).closest('label.sgn').className, PB), note: 'today a signed box shows the callsign alone ("Hunter"); the drawing shows the option\'s words' })
      await wait(s, 200)
      await shot(s, 'e11b-d-chosen', [field, { ...field, x: field.x - 300, w: field.w + 600 }])
    }
  }, { state: ST })
  /* ITEM 9 - the member badge's grey letters, read off the badge in the member view (Hunter on 150, the badge pressed) */
  let MEMBER = null
  if (want('e8d')) await run('e8.read', 'd', async s => {
    await as(s, 'hunter'); await reachPick(s, 150, 'bar'); await wait(s, 500)
    await hit(s, '#roleBadge', 700)
    const top = await s.page.evaluate(() => { const b = [...document.querySelectorAll('#roleBadge')].find(e => e.getBoundingClientRect().width > 1); const c = getComputedStyle(b); return { words: b.textContent.replace(/\s+/g, ' ').trim(), color: c.color, background: c.backgroundColor, border: c.borderColor } })
    FACT('e8.topBarBadgeInMemberView', { ...top, note: 'its letters are white, not grey' })
    /* "the member badge's grey letters": the grey MEMBER badge of Admin → Users (`.ub.main`), read on 142 (Hunter, admin) */
    await hit(s, '#roleBadge', 700); await reachPick(s, 142, 'bar'); await usersTab(s); await wait(s, 500)
    MEMBER = await s.page.evaluate(() => { const b = [...document.querySelectorAll('.ub.main')].find(e => e.getBoundingClientRect().width > 1); const c = getComputedStyle(b); return { words: b.textContent.trim(), color: c.color } })
    FACT('e8.memberBadge', MEMBER)
  })
  if (want('e8d')) await run('e8d', 'd', async s => {
    await as(s, 'hunter'); await reachPick(s, 150, 'bar'); await wait(s, 500)
    const r = await s.page.evaluate(([to, color]) => {
      const b = [...document.querySelectorAll('#roleBadge')].find(e => e.getBoundingClientRect().width > 1)
      const was = { words: b.textContent.replace(/\s+/g, ' ').trim(), color: getComputedStyle(b).color, border: getComputedStyle(b).borderColor, tag: b.tagName }
      const w = document.createTreeWalker(b, NodeFilter.SHOW_TEXT); const ns = []; let n; while ((n = w.nextNode())) ns.push(n); ns.forEach((n, i) => { n.textContent = i === 0 ? to : '' })
      Object.assign(b.style, { border: '1px solid transparent', background: 'transparent', boxShadow: 'none', color, cursor: 'default' })
      b.id = 'r5bBadge'; const r = b.getBoundingClientRect()
      return { was, now: { words: b.textContent, color }, box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } }
    }, [W.badgeViewOnly('Hunter'), MEMBER.color])
    FACT('e8d.drawn', { squadron: await barSq(s), ...r })
    await shot(s, 'e8-d-badge-r', [r.box, { x: r.box.x - 280, y: 4, w: 10, h: 56 }])
  })
  if (want('e8p')) await run('e8p', 'p', async s => {
    await as(s, 'hunter'); await reachPick(s, 150, 'menu'); await wait(s, 500)
    await hit(s, '#burger', 500)
    const r = await s.page.evaluate(to => {
      const line = [...document.querySelectorAll('#drawer *')].find(x => x.children.length < 3 && /^Signed in as/.test(x.textContent.trim()))
      const w = document.createTreeWalker(line, NodeFilter.SHOW_TEXT); const ns = []; let n; while ((n = w.nextNode())) ns.push(n); const head = ns.map(n => n.textContent).join('').match(/^\s*Signed in as\s*/)[0]; ns.forEach((n, i) => { n.textContent = i === 0 ? head + to : '' })
      const sw = [...document.querySelectorAll('#drawer button')].find(b => /^Switch to the member view$/.test(b.textContent.trim()))
      const swWas = sw ? sw.textContent.trim() : null; if (sw) sw.style.display = 'none'
      const acc = [...document.querySelectorAll('#drawer *')].find(x => x.children.length === 0 && /^account$/i.test(x.textContent.trim()))
      const out = [...document.querySelectorAll('#drawer button')].find(b => /^Logout$/.test(b.textContent.trim()))
      const a = acc.getBoundingClientRect(), o = out.getBoundingClientRect(), l = line.getBoundingClientRect()
      return { signed: line.textContent.replace(/\s+/g, ' ').trim(), removed: swWas, account: [...document.querySelectorAll('#drawer button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()), block: { x: Math.round(Math.min(a.left, l.left, o.left)), y: Math.round(a.top), w: Math.round(Math.max(a.right, l.right, o.right) - Math.min(a.left, l.left, o.left)), h: Math.round(o.bottom - a.top) } }
    }, W.badgeViewOnly('Hunter'))
    FACT('e8p.drawn', { squadron: await barSq(s), ...r })
    await shot(s, 'e8-p-menu-r', [r.block])
  })
} finally { await closeAll() }
