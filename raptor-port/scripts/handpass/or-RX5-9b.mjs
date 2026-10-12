// RX4-9b: the same fixture at 3x picture scale; asks the page which element carries the hollow AL1 tag (pseudo-elements included) and zooms on each puck.
import * as L from './or-RX5-lib.mjs'
const { j } = L
const out = {}
const { ctx, page: p } = await L.open('ad', 'a', { dsf: 3 })
const mt = (await L.fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: L.ISO, to: L.ISO, timed: ['09:00', '10:00'], title: 'Range brief' }))[0]
const iid = mt.iid
await L.signAndPublish(p, L.DI)
await L.takeOffRow(p, 'Drifter', iid)
await L.addOntoRow(p, 'Drifter', iid)
console.log('Drifter off+back; people', j((await L.inputOf(p, iid)).people))
console.log('Tally:', await L.addOntoRow(p, 'Tally', iid))
const probe = (surface) => p.evaluate(([iid, di, surface]) => {
  const ri = (window.DAYS[di].ground || []).findIndex(g => g.src === iid)
  let f
  if (surface === 'board') f = [...document.querySelectorAll(`#schedBoard [data-fill="g:${di}.${ri}.+"]`)].find(e => e.offsetParent)
  else { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; f = d.querySelector(`[data-fill="g:${di}.${ri}.+"]`) }
  const row = f ? (f.closest('.pl-row') || f.closest('.sb-arow') || f.parentElement) : null
  if (!row) return null
  const res = []
  for (const pk of row.querySelectorAll('.puck')) {
    if (pk.closest('.addz')) continue
    const nm = (pk.querySelector('.nm')?.textContent || pk.textContent).trim()
    const pseudo = []
    for (const e of [pk, pk.parentElement, ...pk.querySelectorAll('*')]) for (const ps of ['::before', '::after']) { const c = getComputedStyle(e, ps).content; if (c && c !== 'none' && c !== 'normal' && c !== '""') pseudo.push(e.className.toString().slice(0, 30) + ps + '=' + c) }
    const r = pk.getBoundingClientRect(); const pr = pk.parentElement.getBoundingClientRect()
    res.push({ who: nm, parentCls: pk.parentElement.className.toString().slice(0, 50), parentTitle: pk.parentElement.getAttribute('title'), puckTitle: pk.getAttribute('title'), pseudo, puckBox: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, parentBox: { x: Math.round(pr.x), y: Math.round(pr.y), w: Math.round(pr.width), h: Math.round(pr.height) }, puckAttrs: [...pk.attributes].map(a => a.name + '=' + a.value.slice(0, 40)).join(' ') })
  }
  // any element anywhere in the row whose own text is AL1
  const al = [...row.querySelectorAll('*')].filter(e => /^AL\d$/.test((e.textContent || '').trim()) && e.children.length === 0).map(e => ({ cls: e.className.toString(), tag: e.tagName, parent: e.parentElement.className.toString().slice(0, 40), parentText: (e.parentElement.innerText || '').replace(/\s+/g, ' ').slice(0, 30) }))
  return { res, al, rowHTMLhead: row.innerHTML.slice(0, 1500) }
}, [iid, L.DI, surface])
await L.toWeek(p); await L.scrollToSec(p, 'ground')
out.week = await probe('week'); console.log('WEEK', j(out.week.res), 'AL elements', j(out.week.al))
console.log('WEEK html', out.week.rowHTMLhead)
const wr = await p.evaluate(([iid, di]) => { const ri = (window.DAYS[di].ground || []).findIndex(g => g.src === iid); const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; const row = d.querySelector(`[data-fill="g:${di}.${ri}.+"]`).closest('.pl-row'); row.scrollIntoView({ block: 'center' }); return 1 }, [iid, L.DI])
await p.waitForTimeout(400)
const wb = (await probe('week')).res
const ux = Math.min(...wb.map(x => x.parentBox.x)) - 6, uy = Math.min(...wb.map(x => x.parentBox.y)) - 8
const ux2 = Math.max(...wb.map(x => x.parentBox.x + x.parentBox.w)) + 8, uy2 = Math.max(...wb.map(x => x.parentBox.y + x.parentBox.h)) + 8
await L.shot(p, 'rx4-9b-week-row-3x', { x: ux, y: uy, width: ux2 - ux, height: uy2 - uy })
await L.toBoard(p, L.DI)
const ri = await L.rowIdx(p, L.DI, iid)
await L.centre(L.boardRowEl(p, L.DI, ri)); await p.waitForTimeout(400)
out.board = await probe('board'); console.log('BOARD', j(out.board.res), 'AL elements', j(out.board.al))
const bb = out.board.res
const bx = Math.min(...bb.map(x => x.parentBox.x)) - 6, by = Math.min(...bb.map(x => x.parentBox.y)) - 8
const bx2 = Math.max(...bb.map(x => x.parentBox.x + x.parentBox.w)) + 8, by2 = Math.max(...bb.map(x => x.parentBox.y + x.parentBox.h)) + 8
await L.shot(p, 'rx4-9b-board-row-3x', { x: bx, y: by, width: bx2 - bx, height: by2 - by })
console.log('ERRORS', L.errs.join(' | ') || 'none')
L.saveRes('9b', out)
await ctx.close(); await L.browser.close()
