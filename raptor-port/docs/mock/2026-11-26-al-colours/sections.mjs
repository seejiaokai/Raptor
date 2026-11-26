/* Reads off the running app the colours the schedule's own parts wear on the staged Monday: each section's left stripe and
   heading, and the fills and edges of the flag chips on pucks. Output: capture/sections.json (build.mjs's look-alikes table).
     GW_URL=http://localhost:4817/ GW_STATE=<the folder stage.mjs wrote> node docs/mock/2026-11-26-al-colours/sections.mjs */
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeFileSync } from 'node:fs'
const K = await import('../2026-11-25-guardrail-wording/kit.mjs')
const HERE = dirname(fileURLToPath(import.meta.url))
const w = await K.world('d', join(K.STATE, 'alc-waiting.json')), p = w.p
await K.signIn(p); await K.weekDay(p, w.sz, 0)
const read = root => p.evaluate(root => {
  const hex = c => { const m = c.match(/[\d.]+/g).map(Number); return m.length > 3 && m[3] < 0.5 ? null : '#' + m.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase() }
  const out = {}
  const add = (k, c, what) => { const h = c && hex(c); if (!h) return; (out[k] = out[k] || {})[h] = what }
  const r = document.querySelector(root)
  for (const e of r.querySelectorAll('*')) {
    const cs = getComputedStyle(e), b = e.getBoundingClientRect(); if (!b.width) continue
    if (parseFloat(cs.borderLeftWidth) >= 2 && b.height > 30) { const t = (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 26); add('stripe', cs.borderLeftColor, t) }
    if (/lchip/.test(e.className)) add('flag chip', cs.backgroundColor, e.textContent.trim() + ' ' + e.title.slice(0, 30))
    if (/\brole\b/.test(e.className)) add('CAT box', cs.backgroundColor, e.textContent.trim())
    if (e.classList.contains('puck')) { add('puck', cs.backgroundColor, e.className); if (cs.boxShadow !== 'none') add('puck ring', (cs.boxShadow.match(/rgba?\([^)]*\)/) || [''])[0], e.className) }
    if (/stchip/.test(e.className)) { add('stores chip', cs.color, e.textContent.trim()); add('stores chip', cs.borderTopColor, 'edge') }
    if ([...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && !e.closest('.puck,[data-alc],[data-aln]')) { const k = hex(cs.color); if (k && !/^#(F1F4F7|B6C0CB|8A96A3|FBFAF0|EAFBF3|FFFFFF)$/.test(k)) add('coloured words', cs.color, e.textContent.trim().slice(0, 28) + ' .' + String(e.className).split(' ')[0]) }
  }
  return out
}, root)
const edit = await read('#eWeek .day[data-day="0"]')
await K.board(p, w.sz, 0)
const board = await read('#schedBoard .sb-boardwrap')
writeFileSync(join(HERE, 'capture', 'sections.json'), JSON.stringify({ edit, board }, null, 1))
console.log(JSON.stringify({ edit, board }, null, 1))
await w.b.close()
