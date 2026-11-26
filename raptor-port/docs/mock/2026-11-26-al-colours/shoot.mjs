/* The pictures of the REAL running app for the AL colours page, and the clearance measure: the staged Monday (stage.mjs) on
   Edit Schedule, View-only Sched and the Scheduler Board, at a desktop's size (1536, Chromium, 2x) and his iPhone's
   (402 x 874, WebKit, 3x).
     whole screens, three looks:  a today (the app as it draws itself) · b colour only (alx-b + alx-pk-name, today's colours)
                                  · c the recommendation (alx-c + alx-pk-tab, the proposed colours, the NEW key line)
     close-ups, a beside c:       the sims, and the first flying wave (remarks over their stores chips, area, in-times)
     the missing-time scenes:     the end-time rule's outline (class et-miss / et-red, added by this script to the empty time
                                  boxes of a duty desk that has its holder) beside the recommendation's marks, six scenes
     capture/clearance.json:      under every line the looks draw, the gap to the nearest thing below it (src/measure.js)
   Edit Schedule and the board are pictured with AL4 still waiting; View-only Sched with AL4 out (its published face never
   shows a waiting change). PROPOSED and added by this script, nothing else: the classes above on <html> and on the empty
   boxes, the colour variables, and the key line. Nothing here builds.
     GW_URL=http://localhost:4817/ GW_STATE=<the folder stage.mjs wrote> node docs/mock/2026-11-26-al-colours/shoot.mjs */
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync } from 'node:fs'
const K = await import('../2026-11-25-guardrail-wording/kit.mjs')
const HERE = dirname(fileURLToPath(import.meta.url))
const IMG = join(HERE, 'img')
const CSS = readFileSync(join(HERE, 'src/looks.css'), 'utf8'), JS = readFileSync(join(HERE, 'src/looks.js'), 'utf8'), MJS = readFileSync(join(HERE, 'src/measure.js'), 'utf8')
const DI = 0
const ONLY = process.env.ONLY || ''   // "main", "close", "like", "miss" or "measure": one part only
const clearance = []

async function setLook(p, look, root) {
  await p.evaluate(([look, root, CSS, JS, MJS]) => {
    if (!document.getElementById('alx-css')) { const s = document.createElement('style'); s.id = 'alx-css'; s.textContent = CSS; document.head.appendChild(s) }
    if (!window.ALX) (0, eval)(JS)
    if (!window.ALXmeasure) (0, eval)(MJS)
    const A = window.ALX
    for (let n = 1; n <= 7; n++) document.documentElement.style.removeProperty('--alx' + n)
    document.querySelectorAll('.alx-key').forEach(k => k.remove())
    if (look === 'a') return A.look(document.documentElement, { look: 'a', puck: 'chip' })
    if (look === 'b') return A.look(document.documentElement, { look: 'b', puck: 'name' })
    /* r1: the recommendation's look in the FIRST round's colours (periwinkle, mint, orange...), for the look-alikes pictures */
    A.palette(look === 'r1' ? ['', '#FFE815', '#8FA6FF', '#4FEBC8', '#FF9548', '#EDC4FF', '#9FB07A', '#6FB0B2'] : A.NEW); A.look(document.documentElement, { look: 'c', puck: 'tab' }); const r = document.querySelector(root); if (r) A.key(r)
  }, [look, root, CSS, JS, MJS])
  await K.wait(p, 250)
}
/* ---- whole screens ---- */
async function frame(p, sz, root, anchor) {
  return p.evaluate(([root, anchor, phone]) => {
    const r = document.querySelector(root), a = r.querySelector(anchor)
    a.scrollIntoView({ block: 'start', inline: 'nearest' })
    let sc = a.parentElement; while (sc && !(sc.scrollHeight > sc.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement
    const up = phone ? 170 : 250; if (sc) sc.scrollTop -= up; else window.scrollBy(0, -up)
    const c = r.getBoundingClientRect()
    return { x: c.left, y: c.top, w: c.width, h: c.height }
  }, [root, anchor, K.isPhone(sz)])
}
async function three(p, sz, name, root, anchor) {
  for (const look of ['a', 'b', 'c']) {
    await setLook(p, look, root)
    const c = await frame(p, sz, root, anchor); await K.wait(p, 350)
    const vw = sz.opts.viewport.width, vh = sz.opts.viewport.height
    const clip = K.isPhone(sz) ? { x: 0, y: 0, width: vw, height: vh }
      : { x: Math.max(0, c.x - 6), y: 130, width: Math.min(vw - Math.max(0, c.x - 6), Math.min(c.w + 12, 760)), height: vh - 130 - 40 }
    await p.screenshot({ path: join(IMG, `${name}-${look}-${sz.name}.png`), clip })
    K.log('  picture', `${name}-${look}-${sz.name}.png`)
  }
  await setLook(p, 'a', root)
}
/* ---- close-ups: one part of the day, found by what it holds, pictured whole (the screen is made tall for it) ---- */
const PART = {
  prog: r => r.querySelector('.sec-prog'), dutysec: r => r.querySelector('.sec-duty'), simsec: r => r.querySelector('.sec-sim'), ground: r => r.querySelector('.sec-grnd'),
  sims: r => { const subs = [...r.querySelectorAll('.pl-sub')].filter(e => /^(AMT|OFT)/.test(e.textContent.trim())); if (subs.length) { let a = subs[0].parentElement; while (a && !subs.every(s => a.contains(s))) a = a.parentElement; return a }
    const b = r.querySelector('[data-bfld^="sr:"]'); return b && b.closest('.sb-sec') },
  fly: r => { const b = r.querySelector('[data-bfld^="ff:"]'); if (b) return b.closest('.sb-sec'); const it = r.querySelector('.intimes'); let a = it && it.parentElement; while (a && a.querySelectorAll('.form').length < 2) a = a.parentElement; return a },
  duty: r => { const b = r.querySelector('[data-bfld^="dr:"]'); if (b) return b.closest('.sb-sec'); const rows = [...r.querySelectorAll('.pl-row')].filter(e => /^(SDO|SXO|OPS-O)/.test((e.querySelector('.nm') || e).textContent.trim()))
    if (!rows.length) return null; let a = rows[0].parentElement; while (a && !rows.every(s => a.contains(s))) a = a.parentElement; return a },
}
async function closeUp(p, sz, file, root, part) {
  const box = await p.evaluate(([root, fn]) => {
    const el = (0, eval)('(' + fn + ')')(document.querySelector(root)); if (!el) return null
    el.scrollIntoView({ block: 'start', inline: 'nearest' }); window.scrollBy(0, -80)
    let sc = el.parentElement; while (sc && !(sc.scrollHeight > sc.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement
    if (sc) sc.scrollTop -= 120
    document.activeElement && document.activeElement.blur && document.activeElement.blur()
    return new Promise(ok => setTimeout(() => { const b = el.getBoundingClientRect(); ok({ x: b.left, y: b.top, w: b.width, h: b.height }) }, 350))
  }, [root, String(PART[part])])
  if (!box) throw new Error(`${file}: no ${part} in ${root}`)
  const vp = p.viewportSize(), x = Math.max(0, box.x - 4), y = Math.max(0, box.y - 4)
  await p.screenshot({ path: join(IMG, `${file}-${sz.name}.png`), clip: { x, y, width: Math.min(vp.width - x, box.w + 8), height: Math.min(vp.height - y, box.h + 8) } })
  K.log('  picture', `${file}-${sz.name}.png`, Math.round(box.w) + 'x' + Math.round(box.h))
}
const tall = async (p, sz) => { await p.setViewportSize({ width: sz.opts.viewport.width, height: 2600 }); await K.wait(p, 500) }
/* ---- the missing-time outline: every empty time box of a duty desk that has its holder ---- */
async function outline(p, red) {
  return p.evaluate(([di, red]) => {
    document.querySelectorAll('.et-miss').forEach(e => e.classList.remove('et-miss', 'et-red'))
    let n = 0
    for (const dw of [0, 1]) for (const ri of [0, 1, 2]) for (const f of ['str', 'end']) {
      const k = `dr:${di}.${dw}.${ri}.${f}`
      for (const e of document.querySelectorAll(`#eWeek [data-txt="${k}"], #schedBoard input[data-bfld="${k}"]`)) {
        if ((e.tagName === 'INPUT' ? e.value : e.textContent).trim() !== '') continue
        e.classList.add('et-miss'); if (red) e.classList.add('et-red'); n++
      }
    }
    return n
  }, [DI, red])
}
const open = async (key, st) => { const w = await K.world(key, join(K.STATE, `alc-${st}.json`)); await K.signIn(w.p); return w }
const toView = async p => { await p.evaluate(di => { const d = document.querySelector(`#vWeek .day[data-day="${di}"]`); d && d.scrollIntoView({ block: 'start', inline: 'start' }); window.scrollTo(0, 0) }, DI); await K.wait(p, 600) }
const EDIT = `#eWeek .day[data-day="${DI}"]`, VIEW = `#vWeek .day[data-day="${DI}"]`, BOARD = '#schedBoard'
const measure = async (p, sz, surface, st, root) => { for (const look of ['a', 'c']) { await setLook(p, look, root); clearance.push({ surface, size: sz.name, st, look, rows: await p.evaluate(r => window.ALXmeasure(r), root) }) } }

for (const key of ['d', 'p']) {
  /* Edit Schedule and the board: AL4 waiting */
  let w = await open(key, 'waiting'), p = w.p, sz = w.sz
  await K.weekDay(p, sz, DI); await K.neutral(p)
  if (!ONLY || ONLY === 'main') await three(p, sz, 'edit', EDIT, `[data-txt="dn:${DI}.0"]`)
  await tall(p, sz)
  if (!ONLY || ONLY === 'measure') await measure(p, sz, 'Edit Schedule', 'AL4 waiting', EDIT)
  if (!ONLY || ONLY === 'close') for (const part of ['sims', 'fly']) for (const look of ['a', 'c']) { await setLook(p, look, EDIT); await closeUp(p, sz, `${part}-edit-${look}`, EDIT, part) }
  /* the look-alikes: each section of the day in the first round's colours beside this round's */
  if (!ONLY || ONLY === 'like') for (const part of ['prog', 'dutysec', 'simsec', 'ground']) for (const look of ['r1', 'c']) { await setLook(p, look, EDIT); await closeUp(p, sz, `like-${part}-${look}`, EDIT, part) }
  await p.setViewportSize(sz.opts.viewport); await setLook(p, 'a', EDIT)
  await K.board(p, sz, DI); await K.neutral(p)
  if (!ONLY || ONLY === 'main') await three(p, sz, 'board', BOARD, `[data-bfld="ap:${DI}.0.prog"]`)
  await tall(p, sz)
  if (!ONLY || ONLY === 'measure') await measure(p, sz, 'Scheduler Board', 'AL4 waiting', BOARD)
  if (!ONLY || ONLY === 'close') for (const part of ['sims', 'fly']) for (const look of ['a', 'c']) { await setLook(p, look, BOARD); await closeUp(p, sz, `${part}-board-${look}`, BOARD, part) }
  if (p.errs.length) K.log('ERRORS', p.errs.join(' | '))
  await w.b.close()
  /* all four out: View-only Sched's pictures, and the measure on all three */
  w = await open(key, 'out'); p = w.p; sz = w.sz
  await toView(p)
  if (!ONLY || ONLY === 'main') await three(p, sz, 'view', VIEW, '.intimes, .pl-row')
  await tall(p, sz)
  if (!ONLY || ONLY === 'measure') await measure(p, sz, 'View-only Sched', 'all out', VIEW)
  if (!ONLY || ONLY === 'close') for (const part of ['sims', 'fly']) for (const look of ['a', 'c']) { await setLook(p, look, VIEW); await closeUp(p, sz, `${part}-view-${look}`, VIEW, part) }
  if (!ONLY || ONLY === 'miss') { await setLook(p, 'c', VIEW); await closeUp(p, sz, 'miss-5-view', VIEW, 'duty') }
  await p.setViewportSize(sz.opts.viewport); await setLook(p, 'a', VIEW)
  await K.weekDay(p, sz, DI); await K.neutral(p); await tall(p, sz)
  if (!ONLY || ONLY === 'measure') await measure(p, sz, 'Edit Schedule', 'all out', EDIT)
  if (!ONLY || ONLY === 'miss') { await setLook(p, 'c', EDIT); await closeUp(p, sz, 'miss-5-edit', EDIT, 'duty') }
  await p.setViewportSize(sz.opts.viewport)
  await K.board(p, sz, DI); await K.neutral(p); await tall(p, sz)
  if (!ONLY || ONLY === 'measure') await measure(p, sz, 'Scheduler Board', 'all out', BOARD)
  if (!ONLY || ONLY === 'miss') { await setLook(p, 'c', BOARD); await closeUp(p, sz, 'miss-5-board', BOARD, 'duty') }
  if (p.errs.length) K.log('ERRORS', p.errs.join(' | '))
  await w.b.close()
  /* the missing-time scenes 1 to 4 (5 is above): draft grey, draft red, a time emptied on the published day (with the desk
     whose holder changed in AL2 and whose END is empty), the time typed again */
  if (!ONLY || ONLY === 'miss' || ONLY === 'measure') for (const [st, scenes] of [['draft', [['1', false], ['2', true]]], ['m3', [['3', true]]], ['m4', [['4', true]]]]) {
    w = await open(key, st); p = w.p; sz = w.sz
    if (st === 'draft') { await toView(p); await tall(p, sz); await setLook(p, 'c', VIEW); await closeUp(p, sz, 'miss-1-view', VIEW, 'duty'); await p.setViewportSize(sz.opts.viewport) }
    await K.weekDay(p, sz, DI); await K.neutral(p); await tall(p, sz)
    for (const [n, red] of scenes) { await setLook(p, 'c', EDIT); K.fact('miss ' + n, sz.name, 'boxes outlined on Edit Schedule', await outline(p, red)); await closeUp(p, sz, `miss-${n}-edit`, EDIT, 'duty')
      if (st !== 'draft') clearance.push({ surface: 'Edit Schedule', size: sz.name, st: 'missing-time scene ' + n, look: 'c', rows: await p.evaluate(r => window.ALXmeasure(r), EDIT) }) }
    await p.setViewportSize(sz.opts.viewport)
    await K.board(p, sz, DI); await K.neutral(p); await tall(p, sz)
    for (const [n, red] of scenes) { await setLook(p, 'c', BOARD); K.fact('miss ' + n, sz.name, 'boxes outlined on the board', await outline(p, red)); await closeUp(p, sz, `miss-${n}-board`, BOARD, 'duty')
      if (st !== 'draft') clearance.push({ surface: 'Scheduler Board', size: sz.name, st: 'missing-time scene ' + n, look: 'c', rows: await p.evaluate(r => window.ALXmeasure(r), BOARD) }) }
    if (p.errs.length) K.log('ERRORS', p.errs.join(' | '))
    await w.b.close()
  }
}
if (!ONLY || ONLY === 'measure') {
  writeFileSync(join(HERE, 'capture', 'clearance.json'), JSON.stringify(clearance, null, 1))
  const worst = {}
  for (const c of clearance) for (const r of c.rows) { const k = c.look + ' | ' + r.place; const w = worst[k] = worst[k] || { gap: 1e9, cut: 1e9 }; if (r.gap < w.gap) { w.gap = r.gap; w.at = `${c.surface}, ${c.size}, ${r.state}`; w.to = r.to } if (r.cut != null && r.cut < w.cut) w.cut = r.cut }
  for (const k of Object.keys(worst).sort()) K.log(k.padEnd(62), String(worst[k].gap).padStart(6), 'cut', String(worst[k].cut > 1e8 ? '-' : worst[k].cut).padStart(5), ' ', worst[k].at, '→', worst[k].to)
}
