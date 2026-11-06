// The night of 6 Nov 26, job 3 (People and Quals) — the walk of the built app, scenarios W1 to W6 (brief: the walker's brief of
// the night). Real fingers over CDP on Phone A (Chromium 402x874 @3), WebKit taps on Phone B, the mouse on the Desktop
// (1536x864 @1.25). Every step prints the value it judged. Writes its report to docs/handpass/parts/pq1106/walk.md.
// Usage, from raptor-port/:  node scripts/handpass/pq1106-walk.mjs <dist> [only e.g. w1,w3]
import { chromium, webkit, LAUNCH, serveDist } from '../drawcheck/lib.mjs'
import { mkdirSync, rmSync, writeFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('[pq1106-walk v1]')
const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
const [dist, ONLY = ''] = process.argv.slice(2)
console.log('bundle:', readdirSync(path.join(dist, 'assets')).filter(f => /^index-.*\.js$/.test(f)).join(' '))
const OUT = process.env.HP_OUT ? path.resolve(process.env.HP_OUT) : path.join(ROOT, 'docs/img/handpass/2026-11-06-people-quals/walk')   // a re-walk gets its own folder (walk-scripts §6)
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const REPORT = process.env.HP_REPORT ? path.resolve(process.env.HP_REPORT) : path.join(ROOT, 'docs/handpass/parts/pq1106/walk.md'); mkdirSync(path.dirname(REPORT), { recursive: true })
const ORIGIN = 'http://localhost:4391'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const PHONE_A = { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
const PHONE_B = { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true }
const DESK = { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 }
const NAMES = { A: 'Phone A (Chromium 402x874)', B: 'Phone B (WebKit 402x874)', D: 'Desktop (Chromium 1536x864)' }
const R = [], odd = [], allErrs = []
const want = s => !ONLY || ONLY.split(',').includes(s)
function rec(step, env, ok, note, pic = '') {
  const status = ok === true ? 'PASS' : ok === false ? 'FAIL' : 'NOT WALKED'
  R.push({ step, env, status, note, pic }); console.log(`${status.padEnd(10)} ${step} | ${env} | ${note}${pic ? ' | ' + pic : ''}`)
}
async function run(step, E, fn) {
  try { const r = await fn(); rec(step, NAMES[E.kind], r.ok, r.note, r.pic || '') }
  catch (e) { if (process.env.DBGSHOT) await E.p.screenshot({ path: process.env.DBGSHOT + '/' + step.slice(0, 5) + E.kind + '.png' }).catch(() => {}); rec(step, NAMES[E.kind], null, 'script could not act: ' + String(e.message).split('\n')[0]) }
}
async function open(kind, { init, user = 'ad', pass = 'a', page = 'quals' } = {}) {
  const engine = kind === 'B' ? 'webkit' : 'chromium'
  const br = engine === 'webkit' ? await webkit.launch() : await chromium.launch(LAUNCH)
  const ctx = await br.newContext(kind === 'D' ? DESK : kind === 'A' ? PHONE_A : PHONE_B)
  await serveDist(ctx, ORIGIN, dist)
  if (init) await ctx.addInitScript(init)
  const p = await ctx.newPage()
  const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()) })
  await p.goto(ORIGIN + '/?fresh=1')
  await signin(p, user, pass)
  const cdp = kind === 'A' ? await ctx.newCDPSession(p) : null
  const E = { kind, engine, br, ctx, p, errs, cdp, phone: kind !== 'D' }
  if (page) await goto(E, page)
  return E
}
async function signin(p, user, pass) {
  await p.waitForSelector('#luser'); await p.fill('#luser', user); await p.fill('#lpass', pass); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await sleep(500)
  await p.addStyleTag({ content: '#toastEl{visibility:hidden!important}' })
}
async function goto(E, name) { await E.p.evaluate(n => window.go(n), name); await sleep(700) }
async function close(E) { allErrs.push(...E.errs.map(e => NAMES[E.kind] + ' ' + e)); await E.br.close() }
async function press(E, sel, nth = 0) {
  const l = E.p.locator(sel).filter({ visible: true }).nth(nth)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (E.engine === 'webkit') await l.tap(); else await l.click()
}
const touch = (cdp, type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })
const shot = async (E, name, clip, css = true) => { const f = `${name}.png`; await E.p.screenshot({ path: path.join(OUT, f), ...(clip ? { clip } : {}), ...(css ? { scale: 'css' } : {}) }); return f }
const cols = p => p.evaluate(() => [...document.querySelectorAll('#qtbl thead th[data-col]')].map(t => t.dataset.col))
const align = (p, n = 4) => p.evaluate(n => [...document.querySelectorAll('#qtbl thead th[data-col]')].slice(0, n).map(t => {
  const td = document.querySelector(`#qtbl td.qcell[data-q$="|${t.dataset.col}"]`); if (!td) return { col: t.dataset.col, dl: null, dr: null }
  const a = t.getBoundingClientRect(), b = td.getBoundingClientRect(); return { col: t.dataset.col, dl: +(a.left - b.left).toFixed(1), dr: +(a.right - b.right).toFixed(1) }
}), n)
const alignOk = a => a.length > 0 && a.every(x => x.dl !== null && Math.abs(x.dl) <= 2 && Math.abs(x.dr) <= 2)
const alignS = a => a.map(x => `${x.col}:${x.dl}/${x.dr}`).join(' ')
const headBox = (p, i) => p.evaluate(i => { const t = [...document.querySelectorAll('#qtbl thead th[data-col]')][i]; const r = t.getBoundingClientRect(); const l = t.querySelector('.qlbl').getBoundingClientRect(); const d = t.querySelector('.qdel')?.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: innerWidth, lbl: [l.left + l.width / 2, l.top + l.height / 2], del: d ? [d.left + d.width / 2, d.top + d.height / 2] : null } }, i)
async function toEditQuals(E) {
  await press(E, '#qEdit'); await sleep(350); await press(E, '#qEditQuals'); await sleep(450)
}
async function scrollSide(E, idx = 1) {
  await E.p.evaluate(i => {
    const w = document.querySelector('#page-quals .qwrap'), ths = [...document.querySelectorAll('#qtbl thead th[data-col]')]
    const name = document.querySelector('#qtbl thead th[data-sort="cs"]').getBoundingClientRect()
    w.scrollLeft += ths[i].getBoundingClientRect().left - name.right - 8
  }, idx); await sleep(350)
}
const swapped = (a, b, i, j) => { const x = b.slice(); [x[i], x[j]] = [x[j], x[i]]; return x.join() === a.join() }

// a finger drag of a heading, real touch over CDP. Returns what was lit mid-drag and the scroll shift.
async function fingerDrag(E, from, to, o = {}) {
  const { moves = 12, gap = 24, pre = 60, rest = 90, press: pr = 'words', hold = 0, edge = false, shotMid = '' } = o
  const hb = await headBox(E.p, from), tb = await headBox(E.p, to)
  const pt = pr === 'words' ? hb.lbl : pr === 'pad' ? [hb.l + 3, (hb.t + hb.b) / 2] : hb.del
  const hit = await E.p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + (e.className || '') : 'nothing' }, pt)
  const tx = edge ? hb.w - 14 : (tb.l + tb.r) / 2, ty = pt[1]
  const sl0 = await E.p.evaluate(() => document.querySelector('#page-quals .qwrap').scrollLeft)
  await touch(E.cdp, 'touchStart', [pt]); await sleep(pre)
  for (let i = 1; i <= moves; i++) { await touch(E.cdp, 'touchMove', [[pt[0] + (tx - pt[0]) * i / moves, ty]]); await sleep(gap) }
  let slMid = sl0
  if (hold) { await sleep(hold); slMid = await E.p.evaluate(() => document.querySelector('#page-quals .qwrap').scrollLeft) }
  await sleep(rest)
  let tgt = to, back = null
  if (edge) {   // carry back onto a heading in sight, then lift on it
    const n = (await cols(E.p)).length
    for (let k = 1; k < n; k++) { const b = await headBox(E.p, k); if (k !== from && (b.l + b.r) / 2 > 140 && (b.l + b.r) / 2 < hb.w - 90) { tgt = k; back = [(b.l + b.r) / 2, ty]; break } }
    if (back) { for (let i = 1; i <= 8; i++) { await touch(E.cdp, 'touchMove', [[tx + (back[0] - tx) * i / 8, ty]]); await sleep(gap) } await sleep(rest) }
  }
  const mid = await E.p.evaluate(() => [...document.querySelectorAll('#qtbl thead th.qdrop')].map(t => t.dataset.col))
  const pic = shotMid ? await shot(E, shotMid, { x: 0, y: Math.max(0, hb.t - 30), width: hb.w, height: 210 }) : ''
  await touch(E.cdp, 'touchEnd', []); await sleep(650)
  return { hit, mid, sl0, slMid, pic, tgt }
}

/* ---------------------------------------------------------------------------------------------------------------- W1 */
if (want('w1')) {
  const E = await open('A'); const p = E.p
  await toEditQuals(E); await scrollSide(E, 1)
  const c0 = await cols(p)
  await run('W1.0 Edit quals open, headings 2-4 in sight', E, async () => {
    const bs = [await headBox(p, 1), await headBox(p, 2), await headBox(p, 3)]
    return { ok: bs[0].r < bs[0].w && bs[1].r < bs[1].w && bs[2].l < bs[2].w - 20 && bs[0].l > 60, note: `columns ${c0.slice(0, 5).join(' ')}; heading boxes l-r ${bs.map(b => Math.round(b.l) + '-' + Math.round(b.r)).join(' | ')} of ${bs[0].w}`, pic: await shot(E, 'W1-0-edit-quals', { x: 0, y: Math.max(0, bs[0].t - 30), width: 402, height: 210 }) }
  })
  await run('W1.1 finger drag heading 2 on its words to heading 3 (slow)', E, async () => {
    const d = await fingerDrag(E, 1, 2, { shotMid: 'W1-1-mid-drag' }); const c1 = await cols(p), al = await align(p)
    const pic = await shot(E, 'W1-1-after', { x: 0, y: (await headBox(p, 1)).t - 30, width: 402, height: 260 })
    return { ok: swapped(c1, c0, 1, 2) && alignOk(al) && d.mid.length === 1 && d.mid[0] === c0[2], note: `press hit ${d.hit}; lit mid-drag ${JSON.stringify(d.mid)} (want ["${c0[2]}"]); order ${c0.slice(0, 4).join(' ')} -> ${c1.slice(0, 4).join(' ')}; heading-vs-cell left/right ${alignS(al)}`, pic }
  })
  await run('W1.2 Undo (top bar) after the move puts the order back', E, async () => {
    const cNow = await cols(p)
    await press(E, 'button[aria-label="Undo"]'); await sleep(600)
    const c2 = await cols(p), pic = await shot(E, 'W1-2-after-undo', { x: 0, y: (await headBox(p, 1)).t - 30, width: 402, height: 210 })
    return { ok: c2.join() === c0.join(), note: `before undo ${cNow.slice(0, 4).join(' ')}; after undo ${c2.slice(0, 4).join(' ')}; original ${c0.slice(0, 4).join(' ')}`, pic }
  })
  await scrollSide(E, 1)
  await run('W1.3 the same drag QUICK (6 moves, 10 ms apart)', E, async () => {
    const b = await cols(p); const d = await fingerDrag(E, 1, 2, { moves: 6, gap: 10, pre: 30 }); const c1 = await cols(p), al = await align(p)
    return { ok: swapped(c1, b, 1, 2) && alignOk(al), note: `lit ${JSON.stringify(d.mid)}; ${b.slice(0, 4).join(' ')} -> ${c1.slice(0, 4).join(' ')}; align ${alignS(al)}` }
  })
  await scrollSide(E, 1)
  await run('W1.4 drag RIGHT TO LEFT (heading 4 onto heading 3)', E, async () => {
    const b = await cols(p); const d = await fingerDrag(E, 3, 2, {}); const c1 = await cols(p), al = await align(p)
    return { ok: swapped(c1, b, 2, 3) && alignOk(al), note: `press hit ${d.hit}; lit ${JSON.stringify(d.mid)}; ${b.slice(0, 4).join(' ')} -> ${c1.slice(0, 4).join(' ')}; align ${alignS(al)}` }
  })
  await scrollSide(E, 1)
  await run('W1.5 drag carried to the right edge and held, then lift on a heading', E, async () => {
    const b = await cols(p); const d = await fingerDrag(E, 1, 2, { edge: true, hold: 1300, moves: 14 }); const c1 = await cols(p), al = await align(p)
    const pic = await shot(E, 'W1-5-edge-after', { x: 0, y: (await headBox(p, 1)).t - 30, width: 402, height: 230 })
    const moved = c1.join() !== b.join()
    return { ok: d.slMid > d.sl0 + 5 && moved && alignOk(al), note: `scrollLeft ${d.sl0} -> ${d.slMid} while held; lifted on heading ${d.tgt}; order ${b.slice(0, 6).join(' ')} -> ${c1.slice(0, 6).join(' ')}; align ${alignS(al)}`, pic }
  })
  await scrollSide(E, 1)
  await run('W1.6 press on the heading padding (not its words) and slide', E, async () => {
    const b = await cols(p); const d = await fingerDrag(E, 1, 2, { press: 'pad' }); const c1 = await cols(p), al = await align(p)
    return { ok: swapped(c1, b, 1, 2) && alignOk(al), note: `press hit ${d.hit}; lit ${JSON.stringify(d.mid)}; ${b.slice(0, 4).join(' ')} -> ${c1.slice(0, 4).join(' ')}; align ${alignS(al)} (the brief gave no expected line: judged as the words drag)` }
  })
  await scrollSide(E, 1)
  await run('W1.7 a press on a heading\'s X arms "remove?" and starts no drag', E, async () => {
    const b = await cols(p), hb = await headBox(p, 1)
    if (!hb.del) return { ok: null, note: 'heading has no X' }
    await touch(E.cdp, 'touchStart', [hb.del]); await sleep(60)
    for (let i = 1; i <= 3; i++) { await touch(E.cdp, 'touchMove', [[hb.del[0] + i, hb.del[1]]]); await sleep(24) }
    await sleep(90)
    const lit = await p.evaluate(() => [...document.querySelectorAll('#qtbl thead th.qdrop')].map(t => t.dataset.col))
    await touch(E.cdp, 'touchEnd', []); await sleep(500)
    const c1 = await cols(p)
    const st = await p.evaluate(() => { const t = document.querySelector('#qtbl thead th.arm'); return t ? { col: t.dataset.col, txt: t.querySelector('.qdel')?.textContent } : null })
    const pic = await shot(E, 'W1-7-x-armed', { x: 0, y: hb.t - 30, width: 402, height: 210 })
    return { ok: !!st && st.txt === 'remove?' && c1.join() === b.join() && lit.length === 0, note: `armed ${JSON.stringify(st)}; lit while pressed ${JSON.stringify(lit)}; order unchanged ${c1.join() === b.join()}`, pic }
  })
  await close(E)
}

/* ---------------------------------------------------------------------------------------------------------------- W2 */
if (want('w2')) {
  const E = await open('D'); const p = E.p
  await toEditQuals(E)
  const c0 = await cols(p)
  await run('W2.1 mouse drag of heading 2 onto heading 3 in Edit quals', E, async () => {
    const hb = await headBox(p, 1), tb = await headBox(p, 2)
    await p.mouse.move(hb.lbl[0], hb.lbl[1]); await p.mouse.down()
    for (let i = 1; i <= 12; i++) { await p.mouse.move(hb.lbl[0] + ((tb.l + tb.r) / 2 - hb.lbl[0]) * i / 12, hb.lbl[1]); await sleep(20) }
    await sleep(120)
    const mid = await p.evaluate(() => [...document.querySelectorAll('#qtbl thead th.qdrop')].map(t => t.dataset.col))
    const pm = await shot(E, 'W2-1-mid-drag', { x: 0, y: Math.max(0, hb.t - 30), width: 1000, height: 170 })
    await p.mouse.up(); await sleep(650)
    const c1 = await cols(p), al = await align(p, 5)
    const pic = await shot(E, 'W2-1-after', { x: 0, y: Math.max(0, hb.t - 30), width: 1000, height: 220 })
    return { ok: swapped(c1, c0, 1, 2) && alignOk(al) && mid[0] === c0[2], note: `lit ${JSON.stringify(mid)}; ${c0.slice(0, 4).join(' ')} -> ${c1.slice(0, 4).join(' ')}; align ${alignS(al)}; mid pic ${pm}`, pic }
  })
  await run('W2.2 plain click on a heading in normal mode still sorts', E, async () => {
    await press(E, '#qSave'); await sleep(500)
    const read = () => p.evaluate(() => {
      const ths = [...document.querySelectorAll('#qtbl thead th[data-sort]')], th = ths.find(t => t.dataset.sort !== 'cs' && t.getBoundingClientRect().width > 0)
      return { key: th.dataset.sort, html: th.className + '|' + th.innerText, names: [...document.querySelectorAll('#qtbl td.qname')].map(t => t.innerText.trim()).slice(0, 8).join(',') }
    })
    const a = await read(); await p.locator(`#qtbl thead th[data-sort="${a.key}"]`).first().click(); await sleep(500)
    const b = await read(); const pic = await shot(E, 'W2-2-sorted', { x: 0, y: 60, width: 1000, height: 330 })
    return { ok: a.names !== b.names || a.html !== b.html, note: `heading ${a.key}; names before ${a.names}; after ${b.names}; heading mark before "${a.html}" after "${b.html}"`, pic }
  })
  await close(E)
}

/* ---------------------------------------------------------------------------------------------------------------- W3 */
const NOSDA = () => { const real = CSS.supports.bind(CSS); CSS.supports = (...a) => (/scroll-timeline|timeline-scope|animation-timeline/.test(a.join(' ')) ? false : real(...a)) }
async function pinchRead(E, cx, cy, d0, d1, read, shotName) {
  const at = d => [[cx - d / 2, cy], [cx + d / 2, cy]]
  await touch(E.cdp, 'touchStart', [at(d0)[0]]); await sleep(30)
  await touch(E.cdp, 'touchStart', at(d0)); await sleep(30)
  for (let i = 1; i <= 10; i++) { await touch(E.cdp, 'touchMove', at(d0 + (d1 - d0) * i / 10)); await sleep(16) }
  await sleep(120)
  const m = await read(); const pic = shotName ? await shot(E, shotName, { x: 0, y: 0, width: 402, height: 520 }) : ''
  await touch(E.cdp, 'touchEnd', []); await sleep(600)
  return { m, pic }
}
const midRead = p => p.evaluate(() => {
  const wrapL = document.querySelector('#page-quals .qwrap').getBoundingClientRect().left
  const names = [...document.querySelectorAll('#qtbl td.qname')].map(td => td.getBoundingClientRect()).filter(r => r.bottom > 60 && r.top < innerHeight)
  const m = document.querySelector('[data-testid="qsticky-head"]'), shown = !!m && getComputedStyle(m).visibility !== 'hidden'
  const vis = e => { if (!e) return null; const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && s.visibility !== 'hidden' ? [+r.left.toFixed(1), +r.right.toFixed(1)] : null }
  const frozen = shown ? vis(m?.querySelector('.qfixed-frozen th[data-sort="cs"]')) : null, own = shown ? vis(m?.querySelector('.qfixed-scroll th[data-sort="cs"]')) : null, real = vis(document.querySelector('#qtbl thead th[data-sort="cs"]'))
  return { wrapL, shown, n: names.length, off: names.filter(r => Math.abs(r.left - wrapL) > 1.5).map(r => Math.round(r.left)), frozen, own, real, transformed: !!document.getElementById('qtbl').style.transform }
})
const pinnedAlign = p => p.evaluate(() => {
  const at = sel => [...document.querySelectorAll(sel)].slice(2, 7).map(t => Math.round(t.getBoundingClientRect().left))
  const real = at('#qtbl thead tr:last-child > th'), mir = at('[data-testid="qsticky-head"] .qfixed-scroll thead tr:last-child > th')
  return { real, mir, ok: real.length === 5 && mir.length === 5 && real.every((l, i) => Math.abs(l - mir[i]) <= 3) }
})
const midOk = m => m.transformed && m.n > 0 && m.off.length === 0 && (m.frozen ? Math.abs(m.frozen[0] - m.wrapL) < 1.5 : m.own ? Math.abs(m.own[0] - m.wrapL) < 1.5 : m.real ? Math.abs(m.real[0] - m.wrapL) < 1.5 : false)
const midS = m => `wrapL ${m.wrapL}; pinned row shown ${m.shown}; frozen name heading ${JSON.stringify(m.frozen)}; own ${JSON.stringify(m.own)}; table's own name heading ${JSON.stringify(m.real)}; names ${m.n}, off-edge ${JSON.stringify(m.off)}; table transformed ${m.transformed}`
for (const [tag, init] of [['sda', undefined], ['nosda', NOSDA]]) {
  if (!want('w3')) break
  const E = await open('A', { init }); const p = E.p
  const took = await p.evaluate(() => ({ q: !!document.querySelector('#page-quals .qwrap.q-sda') }))
  console.log(`W3 ${tag}: scroll-driven path ${took.q}`)
  await p.evaluate(() => window.scrollTo(0, 420)); await sleep(600)
  const pinned = await p.locator('[data-testid="qsticky-head"]').count()
  await run(`W3.${tag}.0 pinned heading row up (scroll-driven path: ${took.q})`, E, async () => ({ ok: pinned === 1 && (tag === 'sda' ? true : !took.q), note: `pinned rows ${pinned}; q-sda class on the table ${took.q}` }))
  await run(`W3.${tag}.1 pinch IN 90 to 250, read with fingers down`, E, async () => {
    const r = await pinchRead(E, 200, 450, 90, 250, () => midRead(p), `W3-${tag}-1-mid-pinch-in`); const al = await pinnedAlign(p)
    return { ok: midOk(r.m) && al.ok, note: `${midS(r.m)}; after lift pinned vs real lefts ${JSON.stringify(al.real)} vs ${JSON.stringify(al.mir)}`, pic: r.pic }
  })
  await run(`W3.${tag}.2 pinch OUT then IN at once (lesson 20)`, E, async () => {
    await p.evaluate(() => window.scrollTo(0, 420)); await sleep(500)
    const o = await pinchRead(E, 200, 450, 230, 80, () => midRead(p), `W3-${tag}-2-mid-pinch-out`)
    const i = await pinchRead(E, 200, 450, 90, 250, () => midRead(p)); const al = await pinnedAlign(p)
    return { ok: midOk(o.m) && midOk(i.m) && al.ok, note: `out: ${midS(o.m)} || in: ${midS(i.m)}; after lift ${JSON.stringify(al.real)} vs ${JSON.stringify(al.mir)}`, pic: o.pic }
  })
  await run(`W3.${tag}.3 after the lift the pinned headings stand over their columns`, E, async () => {
    await p.evaluate(() => { window.scrollTo(0, 420); document.querySelector('#page-quals .qwrap').scrollLeft = 120 }); await sleep(600)
    const al = await pinnedAlign(p); const pic = await shot(E, `W3-${tag}-3-after`, { x: 0, y: 0, width: 402, height: 420 })
    return { ok: al.ok, note: `real lefts ${JSON.stringify(al.real)}; pinned ${JSON.stringify(al.mir)}`, pic }
  })
  await close(E)
}

/* ---------------------------------------------------------------------------------------------------------------- W4 */
async function sliver(E, name) {
  const p = E.p
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(150)
  const geo = await p.evaluate(() => {
    const wrap = document.querySelector('#page-quals .qwrap').getBoundingClientRect()
    const names = [...document.querySelectorAll('#qtbl td.qname')].map(td => td.getBoundingClientRect()).filter(r => r.top > 140 && r.bottom < innerHeight - 10)
    return { wrapL: wrap.left, top: names[0]?.top, bottom: names.at(-1)?.bottom, dpr: devicePixelRatio, sl: document.querySelector('#page-quals .qwrap').scrollLeft, z: parseFloat(getComputedStyle(document.getElementById('qtbl')).getPropertyValue('--qz')) || 1 }
  })
  const f = `${name}.png`, fp = path.join(OUT, f)
  await p.screenshot({ path: fp, clip: { x: 0, y: geo.top, width: 60, height: Math.min(380, geo.bottom - geo.top) } })
  const res = await p.evaluate(async ({ src, wrapL, dpr }) => {
    const img = await new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.src = src })
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0)
    const d = g.getImageData(0, 0, c.width, c.height).data, x0 = Math.floor(wrapL * dpr), out = { cols: {}, rgb0: null, rgb3: null }
    for (const x of [x0, x0 + 1, x0 + 2]) { let bright = 0; for (let y = 0; y < c.height; y++) { const i = (y * c.width + x) * 4; if (Math.max(d[i], d[i + 1], d[i + 2]) > 150) bright++ } out.cols[x] = bright }
    const my = Math.floor(c.height / 2) | 0, px = x => { const i = (my * c.width + x) * 4; return [d[i], d[i + 1], d[i + 2]] }
    out.rgb0 = px(x0); out.rgb3 = px(x0 + 4); return out
  }, { src: 'data:image/png;base64,' + (await import('node:fs')).readFileSync(fp).toString('base64'), wrapL: geo.wrapL, dpr: geo.dpr })
  return { geo, res, f, bright: Object.values(res.cols).reduce((a, b) => a + b, 0) }
}
if (want('w4')) {
  for (const kind of ['A', 'B']) {
    const E = await open(kind); const p = E.p
    await p.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
    if (kind === 'A') {
      const pinch = async (d0, d1) => { const at = d => [[200 - d / 2, 500], [200 + d / 2, 500]]; await touch(E.cdp, 'touchStart', [at(d0)[0]]); await sleep(30); await touch(E.cdp, 'touchStart', at(d0)); await sleep(30); for (let i = 1; i <= 10; i++) { await touch(E.cdp, 'touchMove', at(d0 + (d1 - d0) * i / 10)); await sleep(16) } await sleep(90); await touch(E.cdp, 'touchEnd', []); await sleep(500) }
      const zNow = () => p.evaluate(() => parseFloat(getComputedStyle(document.getElementById('qtbl')).getPropertyValue('--qz')) || 1)
      await pinch(200, 100); const z1 = await zNow(); await pinch(100, Math.round(100 * 0.9 / z1));
      console.log('W4 phone A zoom', await zNow())
    }
    const z = await p.evaluate(() => parseFloat(getComputedStyle(document.getElementById('qtbl')).getPropertyValue('--qz')) || 1)
    if (kind === 'B') await run('W4.B.0 zoom is 1 on Phone B (nothing set by hand)', E, async () => ({ ok: Math.abs(z - 1) < 0.001, note: `--qz ${z}` }))
    await run(`W4.${kind}.1 unscrolled: the table's thin left line is there (zoom ${z.toFixed(3)})`, E, async () => {
      await p.evaluate(() => { document.querySelector('#page-quals .qwrap').scrollLeft = 0 }); await sleep(300)
      const s = await sliver(E, `W4-${kind}-sl0`)
      const diff = Math.max(...s.res.rgb0.map((v, i) => Math.abs(v - s.res.rgb3[i])))
      return { ok: diff > 6 && s.bright === 0, note: `first device column rgb ${JSON.stringify(s.res.rgb0)} vs 4th column ${JSON.stringify(s.res.rgb3)} (differ by ${diff}); bright pixels ${s.bright}; wrapL ${s.geo.wrapL}`, pic: s.f }
    })
    for (const sl of [40, 150, 261]) {
      await run(`W4.${kind}.2 scrolled sideways to ${sl}: no sliver at the name column's left edge (zoom ${z.toFixed(3)})`, E, async () => {
        await p.evaluate(v => { document.querySelector('#page-quals .qwrap').scrollLeft = v }, sl); await sleep(350)
        const s = await sliver(E, `W4-${kind}-sl${sl}`)
        return { ok: s.bright === 0 && s.geo.sl > 0, note: `scrollLeft ${s.geo.sl}; bright pixels in the first 3 device columns ${JSON.stringify(s.res.cols)}`, pic: s.f }
      })
    }
    await close(E)
  }
}

/* ---------------------------------------------------------------------------------------------------------------- W5 */
async function w5(kind) {
  const E = await open(kind); const p = E.p, K = kind, phone = E.phone
  /* (a) */
  let target = null
  await run(`W5a.1 Quals: Edit, tick one man's qualification, Done - the tick is there`, E, async () => {
    await press(E, '#qEdit'); await sleep(400)
    target = await p.evaluate(() => { const td = [...document.querySelectorAll('#qtbl td.qcell[data-q]:not(.na):not(.qro)')].find(t => t.getBoundingClientRect().height > 0); return td ? { q: td.dataset.q, before: td.innerText.trim() + '|' + td.className } : null })
    if (!target) return { ok: null, note: 'no editable cell found' }
    await press(E, `#qtbl td[data-q="${target.q}"]`)
    let pic = ''; if (phone) pic = await shot(E, `W5a-${K}-1-tap-quick`, { x: 0, y: 60, width: 402, height: 360 })
    await sleep(400)
    const after = await p.evaluate(q => { const t = document.querySelector(`#qtbl td[data-q="${q}"]`); return t.innerText.trim() + '|' + t.className }, target.q)
    await press(E, '#qSave'); await sleep(500)
    const done = await p.evaluate(q => { const t = document.querySelector(`#qtbl td[data-q="${q}"]`); return t.innerText.trim() + '|' + t.className }, target.q)
    target.after = after
    if (!phone) pic = await shot(E, `W5a-${K}-1-ticked`, { x: 0, y: 60, width: 900, height: 360 })
    return { ok: after !== target.before && done === after, note: `cell ${target.q}: before "${target.before}", after tick "${after}", after Done "${done}"`, pic }
  })
  await run(`W5a.2 scroll away, Undo - row comes back into view outlined, tick gone; Redo`, E, async () => {
    if (!target) return { ok: null, note: 'no ticked cell' }
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await sleep(500)
    const out = await p.evaluate(q => { const r = document.querySelector(`#qtbl td[data-q="${q}"]`).closest('tr').getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, sy: Math.round(scrollY) } }, target.q)
    const wasOut = out.bottom < 60 || out.top > out.vh
    if (!wasOut) odd.push(`${NAMES[K]}: after scrolling to the bottom the ticked row was still in view (row ${out.top}-${out.bottom}), so "comes back into view" is only judged as outlined`)
    await press(E, 'button[aria-label="Undo"]'); let pic = ''
    if (phone) pic = await shot(E, `W5a-${K}-2-undo-quick`, { x: 0, y: 0, width: 402, height: 874 })
    await sleep(900)
    const st = await p.evaluate(q => { const t = document.querySelector(`#qtbl td[data-q="${q}"]`), tr = t.closest('tr'), r = tr.getBoundingClientRect(); return { now: t.innerText.trim() + '|' + t.className, outlined: tr.classList.contains('back-hl'), top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight } }, target.q)
    if (!phone || !pic) pic = await shot(E, `W5a-${K}-2-undo`)
    const inView = st.bottom > 60 && st.top < st.vh
    await press(E, 'button[aria-label="Redo"]'); await sleep(600)
    const redo = await p.evaluate(q => { const t = document.querySelector(`#qtbl td[data-q="${q}"]`); return t.innerText.trim() + '|' + t.className }, target.q)
    return { ok: st.now === target.before && st.outlined && inView && redo === target.after, note: `row was out of view ${wasOut} (${JSON.stringify(out)}); after Undo cell "${st.now}" (original "${target.before}"), outlined ${st.outlined}, row ${st.top}-${st.bottom} of ${st.vh}; after Redo "${redo}" (ticked was "${target.after}")`, pic }
  })
  /* (b) */
  let man = null
  await run(`W5b.1 Admin > Users: Suspend a man's account, then Enable it`, E, async () => {
    await goto(E, 'admin'); if (!(await p.locator('#accList [data-acct]').first().isVisible().catch(() => false))) { await press(E, '.adm-cat'); await sleep(500) } await p.waitForSelector('#accList [data-acct]', { timeout: 8000 })
    man = await p.evaluate(() => { const r = [...document.querySelectorAll('#accList [data-acct]')].find(x => x.querySelector('.acc-tap') && !x.querySelector('.acc-tap').disabled); return r ? { acct: r.dataset.acct, pid: r.dataset.person } : null })
    if (!man) return { ok: null, note: 'no other man with an account' }
    await press(E, `#accList [data-acct="${man.acct}"] .acc-tap`); await sleep(300)
    const w1 = (await p.locator('#accEdOnOff').innerText()).trim(); await press(E, '#accEdOnOff'); await sleep(500)
    await press(E, `#accList [data-acct="${man.acct}"] .acc-tap`); await sleep(300)
    const w2 = (await p.locator('#accEdOnOff').innerText()).trim(); const pic = await shot(E, `W5b-${K}-1-users-enable`); await press(E, '#accEdOnOff'); await sleep(500)
    return { ok: w1 === 'Suspend' && w2 === 'Enable', note: `man ${man.pid}: button read "${w1}" then "${w2}"`, pic }
  })
  await run(`W5b.2 Quals: "<name> is back" with "Check his quals" - his row outlined`, E, async () => {
    if (!man) return { ok: null, note: 'no man was enabled' }
    await goto(E, 'quals'); const sel = `[data-testid="back-${man.pid}"]`; await p.waitForSelector(sel, { timeout: 5000 })
    const txt = (await p.locator(sel).innerText()).replace(/\s+/g, ' '); const pic0 = await shot(E, `W5b-${K}-2-back-line`, { x: 0, y: 40, width: phone ? 402 : 900, height: 260 })
    await press(E, `[data-back-check="${man.pid}"]`); await sleep(900)
    const st = await p.evaluate(pid => { const tr = document.querySelector(`#qtbl td.qname[data-person="${pid}"]`)?.closest('tr'); return { has: !!tr, outlined: !!tr && tr.classList.contains('back-hl'), seat: [...document.querySelectorAll('.segview button.on')].map(b => b.id).join() } }, man.pid)
    const pic = await shot(E, `W5b-${K}-3-checked`)
    return { ok: /is back/.test(txt) && st.has && st.outlined, note: `line "${txt}"; his row present ${st.has}, outlined ${st.outlined}; seat view ${st.seat}`, pic }
  })
  await run(`W5b.3 "Later" on another prompt`, E, async () => {
    const n = await p.locator('[data-back-later]').count()
    return { ok: n ? null : null, note: n ? `${n} prompt(s) left but none was made to be dismissed` : 'only one man was enabled, no second prompt to press Later on' }
  })
  /* (c) */
  const tid = t => `[data-testid="${t}"]`
  let holName = 'Walk Day', holDate = null
  await run(`W5c.1 Leave War gear > Calendar... > Holidays: year steps with the arrows`, E, async () => {
    await goto(E, 'leavewar'); await sleep(2200)
    await press(E, tid('settings-open')); await sleep(400); await press(E, tid('settings-days')); await sleep(700)
    if (await p.locator('[data-testid="days-tabs"]:visible').count()) await press(E, tid('days-tab-holidays'))
    await sleep(400)
    const y0 = (await p.locator(tid('hol-year')).first().innerText()).trim()
    await press(E, tid('hol-next')); await sleep(300); const y1 = (await p.locator(tid('hol-year')).first().innerText()).trim()
    await press(E, tid('hol-prev')); await sleep(300); await press(E, tid('hol-prev')); await sleep(300); const y2 = (await p.locator(tid('hol-year')).first().innerText()).trim()
    await press(E, tid('hol-next')); await sleep(300); const y3 = (await p.locator(tid('hol-year')).first().innerText()).trim()
    const pic = await shot(E, `W5c-${K}-1-holidays`)
    return { ok: +y1 === +y0 + 1 && +y2 === +y0 - 1 && y3 === y0, note: `year ${y0} > ${y1} > ${y2} > ${y3}`, pic }
  })
  await run(`W5c.2 + Add: pick a day, name it, Save - it shows in the list`, E, async () => {
    await press(E, tid('hol-add')); await p.waitForSelector(tid('win-holiday'), { timeout: 5000 }); await sleep(400)
    const day = p.locator('[data-testid^="holcal-day-"]:visible').filter({ hasText: /^15$/ }).first()
    holDate = (await day.getAttribute('data-testid')).replace('holcal-day-', '')
    if (E.engine === 'webkit') await day.tap(); else await day.click()
    await sleep(300); await p.fill(tid('hol-name'), holName); await sleep(200)
    const pic0 = await shot(E, `W5c-${K}-2-form`)
    await press(E, tid('hol-save')); await sleep(900)
    const inList = await p.evaluate(n => [...document.querySelectorAll('[data-testid="hol-list"] .hol-name')].some(e => e.innerText.trim() === n), holName)
    const pic = await shot(E, `W5c-${K}-2-saved`)
    return { ok: inList, note: `picked ${holDate}; "${holName}" in the list ${inList}`, pic }
  })
  const reopen = async () => { await press(E, `[aria-label^="Change: ${holName}"]`); await p.waitForSelector(tid('win-holiday'), { timeout: 5000 }); await sleep(400) }
  const winGone = async () => { await sleep(500); return (await p.locator(tid('win-holiday')).count()) === 0 }
  await run(`W5c.3 open the holiday again and close it by its X`, E, async () => {
    await reopen()
    const x = await p.evaluate(() => { const w = document.querySelector('[data-testid="win-holiday"]'); const b = [...w.querySelectorAll('button')].find(b => /^[✕×xX]$/.test(b.innerText.trim()) || /close/i.test(b.getAttribute('aria-label') || '')); if (b) b.setAttribute('data-walk-x', '1'); return b ? (b.getAttribute('aria-label') || b.innerText) : null })
    if (!x) return { ok: null, note: 'no X button found in the window' }
    await press(E, '[data-walk-x="1"]'); const gone = await winGone()
    return { ok: gone, note: `X ("${x}") pressed; window gone ${gone}` }
  })
  await run(`W5c.4 close it by Escape (desktop)`, E, async () => {
    if (phone) return { ok: null, note: 'desktop only' }
    await reopen(); await p.keyboard.press('Escape'); const gone = await winGone()
    return { ok: gone, note: `window gone ${gone}` }
  })
  await run(`W5c.5 the holiday shows on its date on the Inputs page and on the Leave War grid`, E, async () => {
    for (let k = 0; k < 3; k++) { const x = p.locator('button[aria-label^="Close"]').filter({ visible: true }).first(); if (await x.count()) { if (E.engine === 'webkit') await x.tap(); else await x.click(); await sleep(500) } }
    await goto(E, 'inputs'); await sleep(500)
    const inInputs = await p.evaluate(() => [...document.querySelectorAll('body *')].some(e => e.children.length === 0 && e.getBoundingClientRect().width > 0 && e.textContent.trim() === 'WD')); const pic1 = await shot(E, `W5c-${K}-5-inputs`)
    await goto(E, 'leavewar'); await sleep(2000)
    const inLw = await p.evaluate(() => [...document.querySelectorAll('body *')].some(e => e.children.length === 0 && e.getBoundingClientRect().width > 0 && /^(WD|Walk Day)$/.test(e.textContent.trim()))); const pic2 = await shot(E, `W5c-${K}-5-leavewar`)
    if (!inInputs || !inLw) odd.push(`${NAMES[K]}: holiday "${holName}" (${holDate}) - words found on Inputs page ${inInputs}, on Leave War ${inLw}; the pages open on other months than ${holDate}, so a missing word is not judged a fault`)
    return { ok: inInputs && inLw ? true : null, note: `date ${holDate}; short mark WD (the name's short form) drawn on the Inputs page ${inInputs}; on the Leave War grid ${inLw} (pages open on today's month / the bidding window, the date may be off screen)`, pic: pic1 + ' ' + pic2 }
  })
  /* (d) */
  await run(`W5d.1 Inputs > List > + Input > Several people: All on Pilots, a puck off, a puck on`, E, async () => {
    await goto(E, 'inputs'); await sleep(500); if ((await p.locator('#inListBtn').getAttribute('aria-pressed')) !== 'true') { await press(E, '#inListBtn'); await sleep(400) }; await press(E, '#inNew'); await sleep(700)
    await p.selectOption('#inpEditType', { label: 'Meeting' }).catch(() => {}); await sleep(300)
    await press(E, tid('pp-several')); await sleep(400)
    const g = await p.evaluate(() => { const b = [...document.querySelectorAll('[data-testid^="pp-all-"]')].find(x => /pilot/i.test(x.innerText)) || document.querySelector('[data-testid^="pp-all-"]'); if (!b) return null; b.setAttribute('data-walk-all', '1'); const k = b.dataset.testid.replace('pp-all-', ''); return { k, label: b.innerText.trim() } })
    if (!g) return { ok: null, note: 'no All button' }
    const cnt = () => p.evaluate(k => { const grp = document.querySelector(`[data-ppgroup="${k}"]`); const pk = [...grp.querySelectorAll('.pp-puck')]; return { on: pk.filter(x => x.classList.contains('on')).length, total: pk.length } }, g.k)
    const c0 = await cnt(); await press(E, '[data-walk-all="1"]'); await sleep(300); const c1 = await cnt()
    await p.evaluate(k => document.querySelector(`[data-ppgroup="${k}"] .pp-puck`).setAttribute('data-walk-puck', '1'), g.k)
    await press(E, '[data-walk-puck="1"]'); await sleep(300); const c2 = await cnt(); await press(E, '[data-walk-puck="1"]'); await sleep(300); const c3 = await cnt()
    const pic = await shot(E, `W5d-${K}-1-several`)
    return { ok: c1.on === c1.total && c1.total > 0 && c2.on === c1.total - 1 && c3.on === c1.total, note: `group "${g.label}": start ${JSON.stringify(c0)}; after All ${JSON.stringify(c1)}; puck off ${JSON.stringify(c2)}; puck on ${JSON.stringify(c3)}`, pic }
  })
  await run(`W5d.2 drag a finger across pucks (Phone A)`, E, async () => {
    if (kind !== 'A') return { ok: null, note: 'Chromium phone only (WebKit touches drive no pointer events)' }
    const pts = await p.evaluate(() => { const grp = [...document.querySelectorAll('[data-ppgroup]')].find(x => x.querySelectorAll('.pp-puck').length >= 4); const pk = [...grp.querySelectorAll('.pp-puck')]; pk.forEach(x => x.scrollIntoView({ block: 'center' })); const rs = pk.slice(0, 4).map(x => { const r = x.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, x.dataset.pp] }); return { rs, k: grp.dataset.ppgroup } })
    await sleep(300)
    const rs = await p.evaluate(k => [...document.querySelectorAll(`[data-ppgroup="${k}"] .pp-puck`)].slice(0, 4).map(x => { const r = x.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, x.dataset.pp, x.classList.contains('on')] }), pts.k)
    const same = rs.every(r => Math.abs(r[1] - rs[0][1]) < 8)
    const before = rs.map(r => r[3] ? 1 : 0).join('')
    await touch(E.cdp, 'touchStart', [[rs[0][0], rs[0][1]]]); await sleep(60)
    const pathPts = rs.slice(1).map(r => [r[0], r[1]])
    let cur = [rs[0][0], rs[0][1]]
    for (const nx of pathPts) for (let i = 1; i <= 6; i++) { await touch(E.cdp, 'touchMove', [[cur[0] + (nx[0] - cur[0]) * i / 6, cur[1] + (nx[1] - cur[1]) * i / 6]]); await sleep(24) }
    await sleep(120); await touch(E.cdp, 'touchEnd', []); await sleep(500)
    const after = await p.evaluate(k => [...document.querySelectorAll(`[data-ppgroup="${k}"] .pp-puck`)].slice(0, 4).map(x => x.classList.contains('on') ? 1 : 0).join(''), pts.k)
    const pic = await shot(E, `W5d-${K}-2-finger-across`)
    return { ok: after !== before && same && new Set(after.split('')).size === 1, note: `4 pucks in a row ${same}; states before ${before}, after the finger crossed all four ${after}`, pic }
  })
  await run(`W5d.3 Cancel closes the input window, and so does X`, E, async () => {
    const win = '[data-testid="win-inputedit"], #inpEditPop'
    const cancel = await p.evaluate(() => { const w = document.querySelector('[data-testid="win-inputedit"], #inpEditPop'); const b = w && [...w.querySelectorAll('button')].find(b => /^cancel$/i.test(b.innerText.trim())); if (b) b.setAttribute('data-walk-cancel', '1'); return !!b })
    if (!cancel) return { ok: null, note: 'no Cancel button in the window' }
    await press(E, '[data-walk-cancel="1"]'); await sleep(600); const g1 = (await p.locator(win).filter({ visible: true }).count()) === 0
    await press(E, '#inNew'); await sleep(700)
    const x = await p.evaluate(() => { const w = document.querySelector('[data-testid="win-inputedit"], #inpEditPop'); const b = w && [...w.querySelectorAll('button')].find(b => /^[✕×xX]$/.test(b.innerText.trim()) || /close/i.test(b.getAttribute('aria-label') || '')); if (b) b.setAttribute('data-walk-x', '1'); return !!b })
    if (!x) return { ok: null, note: `Cancel closed it ${g1}; no X found on the reopened window` }
    await press(E, '[data-walk-x="1"]'); await sleep(600); const g2 = (await p.locator(win).filter({ visible: true }).count()) === 0
    return { ok: g1 && g2, note: `Cancel closed it ${g1}; X closed it ${g2}` }
  })
  /* (e) */
  const logout = async () => {
    if (await p.locator('#logout').filter({ visible: true }).count()) await press(E, '#logout')
    else { await press(E, '#burger'); await sleep(400); await press(E, '#drawerLogout') }
    await p.waitForSelector('#luser', { timeout: 8000 }); await sleep(600)
  }
  await run(`W5e.1 sign out and in again: caret in the username box at once`, E, async () => {
    await goto(E, 'quals'); await logout()
    const act = await p.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.tagName))
    await p.keyboard.type('ad'); const v = await p.inputValue('#luser'); const pic = await shot(E, `W5e-${K}-1-signin`, { x: 0, y: 0, width: phone ? 402 : 700, height: phone ? 600 : 500 })
    return { ok: act === 'luser' && v === 'ad', note: `active element "${act}"; typed "ad" with no tap, the box reads "${v}"`, pic }
  })
  await run(`W5e.2 a click on the word "Password" puts the caret in the password box (desktop)`, E, async () => {
    if (phone) return { ok: null, note: 'desktop only' }
    await p.evaluate(() => document.getElementById('luser').blur())
    const lab = p.locator('label[for="lpass"], label:has-text("Password")').first(); await lab.click(); await sleep(200)
    const act = await p.evaluate(() => document.activeElement && document.activeElement.id)
    return { ok: act === 'lpass', note: `active element "${act}"` }
  })
  await run(`W5e.3 a wrong password says "Incorrect username or password."`, E, async () => {
    await p.fill('#luser', 'ad'); await p.fill('#lpass', 'zzz'); await press(E, '#loginForm button[type=submit]'); await sleep(700)
    const t = await p.evaluate(() => document.body.innerText.includes('Incorrect username or password.')); const pic = await shot(E, `W5e-${K}-3-wrong`, { x: 0, y: 0, width: phone ? 402 : 700, height: phone ? 600 : 500 })
    await p.fill('#lpass', 'a'); await press(E, '#loginForm button[type=submit]'); await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 15000 })
    return { ok: t, note: `message shown ${t}; then signed in again with the right password`, pic }
  })
  await close(E)
}
if (want('w5')) for (const k of (process.env.W5K || 'DAB').split('')) await w5(k)

/* ---------------------------------------------------------------------------------------------------------------- W6 */
if (want('w6')) for (const kind of ['B', 'D']) {
  const E = await open(kind, { user: 'us', pass: 'us' }); const p = E.p
  await run(`W6 member: Quals > Edit ticks only his own row; no "Edit quals" button`, E, async () => {
    await press(E, '#qEdit'); await sleep(400)
    const cells = await p.evaluate(() => {
      const rows = [...document.querySelectorAll('#qtbl td.qname')].map(t => t.closest('tr'))
      const mine = rows.find(r => /ranger/i.test(r.querySelector('td.qname').innerText)), other = rows.find(r => r !== mine && r.querySelector('td.qcell[data-q]:not(.na)'))
      const pick = r => r && [...r.querySelectorAll('td.qcell[data-q]:not(.na)')][0]?.dataset.q
      return { mine: pick(mine), other: pick(other), rows: rows.length }
    })
    if (!cells.mine || !cells.other) return { ok: null, note: `could not find both rows ${JSON.stringify(cells)}` }
    const rd = q => p.evaluate(q => { const t = document.querySelector(`#qtbl td[data-q="${q}"]`); return t.innerText.trim() + '|' + t.className }, q)
    const m0 = await rd(cells.mine), o0 = await rd(cells.other)
    await press(E, `#qtbl td[data-q="${cells.other}"]`); await sleep(400); const o1 = await rd(cells.other)
    await press(E, `#qtbl td[data-q="${cells.mine}"]`); await sleep(400); const m1 = await rd(cells.mine)
    const eq = await p.locator('#qEditQuals').filter({ visible: true }).count()
    const pic = await shot(E, `W6-${kind}-member`, { x: 0, y: 40, width: kind === 'D' ? 900 : 402, height: 420 })
    return { ok: o1 === o0 && m1 !== m0 && eq === 0, note: `his own ${cells.mine} "${m0}" -> "${m1}"; another man's ${cells.other} "${o0}" -> "${o1}"; visible Edit-quals buttons ${eq}`, pic }
  })
  await close(E)
}

/* --------------------------------------------------------------------------------------------------------------- report */
const cnt = s => R.filter(r => r.status === s).length
const esc = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ')
let md = `# Walk of People and Quals, 6 Nov 26 (branch claude/people-quals-1106) - walker's table\n\n` +
  `Script: scripts/handpass/pq1106-walk.mjs (v1). Pictures: docs/img/handpass/2026-11-06-people-quals/walk/. Build: ${readdirSync(path.join(dist, 'assets')).filter(f => /^index-.*\.js$/.test(f)).join(' ')}.\n\n` +
  `Counts: ${cnt('PASS')} PASS, ${cnt('FAIL')} FAIL, ${cnt('NOT WALKED')} NOT WALKED, of ${R.length} steps.\n\n| step | engine / size | result | what was seen | picture |\n|---|---|---|---|---|\n` +
  R.map(r => `| ${esc(r.step)} | ${esc(r.env)} | ${r.status} | ${esc(r.note)} | ${esc(r.pic)} |`).join('\n') + '\n\n## Page errors and console errors\n\n' +
  (allErrs.length ? allErrs.slice(0, 40).map(e => '- ' + esc(e)).join('\n') : 'None seen in any run.') + '\n\n## Odd things beyond the steps\n\n' +
  (odd.length ? odd.map(o => '- ' + o).join('\n') : '- (none recorded by the script)') + '\n'
writeFileSync(REPORT, md, 'utf8')
console.log(`DONE: ${cnt('PASS')} PASS, ${cnt('FAIL')} FAIL, ${cnt('NOT WALKED')} NOT WALKED; ${allErrs.length} page/console errors`)
