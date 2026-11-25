// draw-e11 - the sign-off boxes (his D2628 C8). Kestrel (149's own admin) on 149's Edit Schedule, Mon 7 Dec 2026 (after
// Hunter's Plan of 149 began), the PLANNED BY box (the app's own select) and its list.
// SET-UP by presses (Saber, from the world): Quals → Edit → Hunter's Scheduler cell → Done (the boxes offer only men
// carrying the Scheduler tick - chat 175's P6 finding).
//  e11t-d  TODAY: the names PLANNED BY offers (FACT), the box as drawn.
//  e11-d   THE LIST OPEN. The box is the browser's own select: its open list is the browser's pop-up, which no picture
//          holds and which cannot carry a badge. So the list is drawn as the app's own list of people's names - the SANS
//          calendar's "Highlight" list (its panel and rows, `.sc-hl-menu` / `.sc-hl-item`, read from the running page),
//          hanging under the box, the names PLANNED BY offers in its order, the box's own choice ringed as that list rings
//          its choice - and beside each name from another squadron the app's grey badge (`.bl-sqn`) with his home number;
//          149's own names plain. In the build: the number as words in the browser's list ("Hunter 142"), or the box's
//          list made the app's own - the owner's to know.
//   node raptor-port/scripts/handpass/n176/draw-e11.mjs        (FRESH=1 remakes the set-up)
import { writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { run, as, FACT, wait, vis, hit, shot, box, closeAll, world, TMP, barSq } from './draw-lib.mjs'
import { tick, go } from '../n175/p6-lib.mjs'
const ST = resolve(TMP, 'state-e11.json')
const HOME = { Hunter: '142', Saber: '142' }
try {
  if (!existsSync(ST) || process.env.FRESH) await run('e11.setup', 'd', async s => {
    await as(s, 'saber')
    FACT('e11.setup.hunterSchedTick', await tick(s, 'prowler', 'sched'))
    await wait(s, 500); writeFileSync(ST, JSON.stringify(await s.ctx.storageState()))
  }, { state: await world() })
  await run('e11', 'd', async s => {
    await as(s, 'kestrel')
    /* the app's own list of names: Inputs → SANS → Highlight, opened, read, closed */
    await go(s, 'inputs'); await wait(s, 500); await hit(s, '#inSansMode', 700); await hit(s, '[data-testid="sc-hl"]', 500)
    const tpl = await s.page.evaluate(() => { const m = document.querySelector('[data-testid="sc-hl-menu"]'); return { menu: m.cloneNode(false).outerHTML, item: m.querySelector('.sc-hl-item:not(.lit)')?.outerHTML || m.querySelector('.sc-hl-item').outerHTML, lit: m.querySelector('.sc-hl-item.lit')?.outerHTML, rows: [...m.querySelectorAll('.sc-hl-item')].map(b => b.textContent.trim()).slice(0, 6) } })
    FACT('e11.listSource', { from: 'Inputs → SANS → Highlight', rows: tpl.rows })
    await hit(s, '[data-testid="sc-hl"]', 300)
    await go(s, 'editsched'); await wait(s, 1200)
    await hit(s, vis(s, 'button.wk-cal'), 700)
    for (let i = 0; i < 8; i++) { const t = await s.page.evaluate(() => document.querySelector('#weekCal')?.innerText.slice(0, 40) || ''); if (/December 2026/.test(t)) break; await hit(s, vis(s, '#weekCal button[aria-label="Next month"]').first(), 250) }
    await hit(s, vis(s, '#weekCal button').filter({ hasText: /^7$/ }).first(), 1200)
    const sel = await s.page.evaluate(() => {
      const all = [...document.querySelectorAll('select[data-sign]')].filter(e => e.getBoundingClientRect().width > 0)
      const pb = all.find(e => /PLANNED BY/i.test(e.getAttribute('aria-label') || ''))
      if (!pb) return { boxes: all.map(e => e.getAttribute('aria-label')) }
      pb.id = pb.id || 'n176pb'
      return { id: pb.id, label: pb.getAttribute('aria-label'), offered: [...pb.options].map(o => o.textContent.trim()), picked: pb.options[pb.selectedIndex]?.textContent.trim() }
    })
    FACT('e11.today', { squadron: await barSq(s), ...sel })
    if (!sel.id) throw new Error('no PLANNED BY box')
    const PB = '#' + sel.id
    const pbBox = await box(s, PB)
    const field = await s.page.evaluate(sel => { const e = document.querySelector(sel); const f = e.closest('label, .so-box, div'); const r = f.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } }, PB)
    await shot(s, 'e11t-d-today', [field, { ...field, x: field.x - 300, w: field.w + 600 }])
    const r = await s.page.evaluate(([sel, HOME, tpl, field]) => {
      const e = document.querySelector(sel)
      const h = document.createElement('div'); h.innerHTML = tpl.menu; const menu = h.firstElementChild
      menu.removeAttribute('data-testid'); menu.id = 'n176list'; menu.setAttribute('aria-label', 'PLANNED BY')
      for (const o of e.options) {
        const t = document.createElement('div'); t.innerHTML = (o.selected && tpl.lit) ? tpl.lit : tpl.item; const b = t.firstElementChild
        b.removeAttribute('data-testid'); b.className = 'sc-hl-item' + (o.selected ? ' lit' : ''); b.setAttribute('aria-selected', String(o.selected))
        const name = o.textContent.trim(); b.textContent = name
        if (HOME[name]) { const m = document.createElement('span'); m.className = 'bl-sqn'; m.textContent = HOME[name]; m.style.marginLeft = '0'; b.appendChild(m) }
        menu.appendChild(b)
      }
      Object.assign(menu.style, { position: 'fixed', left: field.x + 'px', top: (field.y + field.h + 6) + 'px', right: 'auto', width: Math.max(field.w, 200) + 'px' })
      document.body.appendChild(menu)
      const mr = menu.getBoundingClientRect()
      return { listed: [...menu.querySelectorAll('.sc-hl-item')].map(b => b.innerText.replace(/\s+/g, ' ').trim() + (b.classList.contains('lit') ? ' (ringed: the box\'s choice)' : '')), listBox: { x: Math.round(mr.left), y: Math.round(mr.top), w: Math.round(mr.width), h: Math.round(mr.height) } }
    }, [PB, HOME, tpl, field])
    FACT('e11.drawn', r)
    await wait(s, 200)
    await shot(s, 'e11-d-plannedby', [r.listBox, field, { ...field, x: field.x - 200, w: field.w + 400 }])
  }, { state: ST })
} finally { await closeAll() }
