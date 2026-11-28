// Chat 208 walk, part b — [LW-POSTIN-BALANCE] on the PHONE (his iPhone's 402 wide, and 375 for fit), as the admin and as
// the member. Written as assertions of the RIGHT behaviour (a PASS means correct); every line prints PASS / FAIL / RECORD
// with what the screen showed. Serves nothing: points at the build already served on PORT (4757). Today pinned Thu 26 Nov 26.
// People added on Admin → Users (fixtures, real storage — never ?fresh=1):
//   Buzzard  post-in Mon 7 Dec — never typed (the looks, the carried-first refusal, below-zero never typed; CCL typed 0)
//   Lynx     post-in Mon 7 Dec — his example: LL Wed 2 Dec placed first, then 24 typed; then LL Mon 7 Dec
//   Pelican  post-in Fri 27 Nov — the drawing's world (q16-final): 24 typed, no leave
// ONLY=<comma list of step ids> runs a part (its own sub-folder).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-11-27-lw-postin-build/b' + (process.env.ONLY ? '/only-' + process.env.ONLY.replace(/[^a-z0-9]/gi, '_') : '')
process.env.LW_TODAY ||= '2026-11-26'
process.env.PORT ||= '4757'
const L = await import('./lw-m4-lib.mjs')
const { T, press, vis, shot, rec } = L
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('[lw-postin-build-b v4]')
L.clearOut()
const here = path.dirname(fileURLToPath(import.meta.url))
const DRAW = path.resolve(here, '../../docs/img/handpass/2026-11-26-lw-postin-balance')
const log = (...a) => console.log(...a)
const SZ = 'phone'
let w, P
const tap = async (sel, name) => { const c = await press(w, sel, name ? name + '-q' : null); await P.waitForTimeout(450); if (name) await shot(w, name); return c }
const fingerAt = async (x, y, name) => { await L.finger(w, x, y, name ? name + '-q' : null); await P.waitForTimeout(450); if (name) await shot(w, name) }

/* ---------- reads ---------- */
const pidOf = cs => P.evaluate(cs => {
  for (const e of document.querySelectorAll('[data-testid^="bal-name-"]')) if (e.textContent.trim().startsWith(cs)) return e.dataset.testid.slice(9)
  for (const e of document.querySelectorAll('[data-testid^="row-"]')) if (e.textContent.includes(cs)) return e.dataset.testid.slice(4)
  return null
}, cs)
/* a drawn element's box, visibility, its words' ink box (a Range over its text), whether its words are cut */
const box = sel => P.evaluate(sel => {
  const e = document.querySelector(sel); if (!e) return null
  const r = e.getBoundingClientRect(), cs = getComputedStyle(e)
  let t = null
  if (e.tagName !== 'INPUT') { const rg = document.createRange(); rg.selectNodeContents(e); const q = rg.getBoundingClientRect(); if (q.width) t = { l: q.left, r: q.right, t: q.top, b: q.bottom } }
  return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height, shown: r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0,
    text: e.tagName === 'INPUT' ? e.value : e.textContent.replace(/\s+/g, ' ').trim(), cut: e.scrollWidth > e.clientWidth + 1 && cs.overflow !== 'visible', ink: t,
    font: cs.fontSize, weight: cs.fontWeight, color: cs.color, border: `${cs.borderTopStyle} ${cs.borderTopColor}`, cls: e.className, tag: e.tagName, html: e.innerHTML.slice(0, 80) }
}, sel)
const inside = (a, b, tol = 0.5) => !!a && !!b && a.l >= b.l - tol && a.r <= b.r + tol && a.t >= b.t - tol && a.b <= b.b + tol
const R = v => Math.round(v * 10) / 10
const bx = b => b ? `[${R(b.l)},${R(b.t)} ${R(b.r - b.l)}x${R(b.b - b.t)}]` : 'none'
/* the element at a point must be the thing or inside it (proves it is on top — no cover) */
const onTop = sel => P.evaluate(sel => { const e = document.querySelector(sel); if (!e) return 'missing'; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h && (h === e || e.contains(h)) ? 'on top' : `covered by ${h ? (h.dataset.testid || h.className || h.tagName) : 'nothing'}` }, sel)
const bodyHasAppBal = () => P.evaluate(() => {
  const vis = [...document.querySelectorAll('body *')].filter(e => e.childElementCount === 0 && /app bal/i.test(e.textContent) && e.getBoundingClientRect().width > 1).map(e => e.textContent.trim())
  const aria = [...document.querySelectorAll('[aria-label],[title]')].filter(e => /app bal/i.test((e.getAttribute('aria-label') || '') + ' ' + (e.getAttribute('title') || ''))).map(e => e.getAttribute('aria-label') || e.getAttribute('title'))
  return { vis, aria }
})

/* ---------- moves ---------- */
async function openBalances() { if (!(await vis(P, T('balances-page')))) await press(w, T('lw-tab-balances')); await P.waitForSelector(T('balances-page'), { state: 'visible', timeout: 10000 }); await P.waitForTimeout(600) }
async function openGrid() { await press(w, T('lw-tab-grid')); await P.waitForTimeout(800) }
async function closePw() { if (await vis(P, T('person-window'))) { await press(w, T('pw-close')); await P.waitForTimeout(400) } }
async function openPw(pid, name) {
  await openBalances()
  await P.locator(T(`bal-name-${pid}`)).scrollIntoViewIfNeeded(); await P.waitForTimeout(250)
  await tap(T(`bal-name-${pid}`), name)
  await P.waitForSelector(T('person-window'), { state: 'visible', timeout: 8000 }); await P.waitForTimeout(400)
  if (name) await shot(w, name)
}
/* type into a box by a finger tap, then leave it by Enter or by a tap on a plain spot (`away`: a selector of a plain line) */
async function typeBox(sel, fig, how, away, name) {
  await P.locator(sel).scrollIntoViewIfNeeded(); await P.waitForTimeout(200)
  await press(w, sel, name ? name + '-q' : null); await P.waitForTimeout(250)
  await P.keyboard.press('Control+A'); await P.keyboard.type(String(fig), { delay: 40 })
  if (how === 'enter') await P.keyboard.press('Enter')
  else { const b = await box(away); await L.finger(w, b.l + 8, (b.t + b.b) / 2) }
  await P.waitForTimeout(600)
  if (name) await shot(w, name)
}
async function addMan(cs, ini, iso) {
  await P.evaluate(() => window.go('admin')); await P.waitForTimeout(900)
  const users = P.locator('button:has-text("Users"), [data-testid="adm-tab-users"]').first()
  if (await users.count() && await users.isVisible()) { await users.click(); await P.waitForTimeout(500) }
  await P.locator('#accAddBlock').scrollIntoViewIfNeeded()
  await P.fill('#accAddCs', cs); await P.fill('#accAddIni', ini)
  await P.selectOption('#accAddSeat', 'FCP'); await P.selectOption('#accAddCat', 'OCU')
  await P.click('#accAddPostIn'); await P.waitForTimeout(400)
  for (let i = 0; i < 3 && !(await P.locator(`[data-iso="${iso}"]`).count()); i++) { await P.locator('[data-testid$="-next"]').first().click(); await P.waitForTimeout(250) }
  await P.locator(`[data-iso="${iso}"]`).first().click(); await P.waitForTimeout(400)
  await P.click('#accAdd'); await P.waitForTimeout(900)
  const ok = await P.evaluate(cs => document.body.innerText.includes(cs), cs)
  log(`   added ${cs} (post-in ${iso}): ${ok ? 'on the page' : 'NOT FOUND'}`)
  return ok
}
async function crop(name, sel, pad = 8) {
  const b = await box(sel); if (!b) return
  await P.screenshot({ path: `${L.OUT}/${name}.png`, clip: { x: Math.max(0, b.l - pad), y: Math.max(0, b.t - pad), width: Math.min(b.w + 2 * pad, (P.viewportSize().width) - Math.max(0, b.l - pad)), height: b.h + 2 * pad } })
}

/* ---------- the person window's looks (a never-typed man) ---------- */
async function pwNeverTypedLooks(id, pfx, ntKinds = ['CCL', 'FCL', 'PL', 'EL', 'CL']) {
  const tile = await box(T('pw-tile-LVE')), oil = await box(T('pw-tile-OIL')), war = await box(T('pw-LVE-war')), pwb = await box(T('person-window'))
  const label = await P.evaluate(() => [...document.querySelectorAll('[data-testid="pw-tile-LVE"] .h')].map(e => e.textContent.trim()))
  const lve = await box(T('pw-LVE')), cf = await box(T('pw-LVE-cf')), line = await box(T('pw-postin'))
  const lines = await P.locator(T('pw-postin')).count()
  const vw = P.viewportSize().width
  rec(`${id}a "Not typed" in the LVE tile`, SZ, war && war.text === 'Not typed' && inside(war.ink, tile) && war.ink.r <= oil.l && !war.cut && inside(war.ink, { l: 0, r: vw, t: 0, b: 9999 }) ? 'PASS' : 'FAIL',
    `War bal reads "${war?.text}" ${war?.font} ${war?.weight} colour ${war?.color}; words ${bx(war?.ink)} inside tile ${bx(tile)}; OIL tile starts x=${R(oil?.l)}; cut=${war?.cut}`, [pfx])
  rec(`${id}b label "Official bal"`, SZ, label.includes('Official bal') && !label.some(t => /app bal/i.test(t)) ? 'PASS' : 'FAIL', `labels in the LVE tile: ${JSON.stringify(label)}`, [pfx])
  rec(`${id}c both LVE boxes empty, dashed amber`, SZ, lve?.tag === 'INPUT' && lve.text === '' && /dashed/.test(lve.border) && cf?.tag === 'INPUT' && cf.text === '' && /dashed/.test(cf.border) ? 'PASS' : 'FAIL',
    `Official bal box "${lve?.text}" edge ${lve?.border}; carried box "${cf?.text}" edge ${cf?.border}`, [pfx])
  rec(`${id}d the one line under the LVE box`, SZ, lines === 1 && line?.shown && line.text === 'Only leave after post-in is deducted.' && inside(line.ink, tile) && line.t >= cf.b - 0.5 && !line.cut ? 'PASS' : 'FAIL',
    `${lines} line(s): "${line?.text}" ${line?.font} ${line?.color}, words ${bx(line?.ink)}, tile ${bx(tile)}, carried box foot y=${R(cf?.b)}`, [pfx])
  const small = []
  for (const k of ntKinds) { const b = await box(T(`pw-${k}`)), t = await box(T(`pw-tile-${k}`)); small.push({ k, v: b?.text, edge: b?.border, inTile: inside(b, t) }) }
  rec(`${id}e the small tiles' boxes never typed (${ntKinds.join(' ')})`, SZ, small.every(s => s.v === '' && /dashed/.test(s.edge) && s.inTile) ? 'PASS' : 'FAIL', small.map(s => `${s.k} "${s.v}" ${s.edge.split(' ')[0]} inTile=${s.inTile}`).join(' · '), [pfx])
  rec(`${id}f the window inside the screen`, SZ, pwb && pwb.l >= -0.5 && pwb.r <= vw + 0.5 ? 'PASS' : 'FAIL', `window ${bx(pwb)} on a ${vw}-wide screen`, [pfx])
}

/* ---------- the Balances page's looks ---------- */
async function balLooks(id, pfx, role) {
  await P.evaluate(() => { const s = document.querySelector('[data-testid="bal-scroll"]'); const sc = s && [s, ...s.querySelectorAll('*')].find(e => e.scrollHeight > e.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(e).overflowY)); if (sc) sc.scrollTop = 0; scrollTo(0, 0) })
  await P.waitForTimeout(400); await shot(w, pfx)
  const head = await P.evaluate(() => { const c = document.querySelector('.bp-cols'); const sp = c ? [...c.children] : []; return sp.map(e => { const r = e.getBoundingClientRect(); return { t: e.innerText.replace(/\n/g, ' / '), html: e.innerHTML, l: r.left, r: r.right, t0: r.top, b: r.bottom, sw: e.scrollWidth, cw: e.clientWidth } }) })
  const off = head.find(h => /OFFICIAL/.test(h.t))
  const nextH = off ? head[head.indexOf(off) + 1] : null
  rec(`${id}a heading OFFICIAL over BAL`, SZ, !!off && /OFFICIAL<br>BAL/i.test(off.html) && off.t === 'OFFICIAL / BAL' && (!nextH || off.r <= nextH.l + 0.5) && off.sw <= off.cw + 1 ? 'PASS' : 'FAIL',
    `heading "${off?.t}" ${bx(off ? { l: off.l, r: off.r, t: off.t0, b: off.b } : null)}; next heading "${nextH?.t}" from x=${R(nextH?.l)}; all: ${head.map(h => h.t).join(' | ')}`, [pfx])
  const ab = await bodyHasAppBal()
  rec(`${id}b "App bal" nowhere`, SZ, !ab.vis.length && !ab.aria.length ? 'PASS' : 'FAIL', `shown: ${JSON.stringify(ab.vis)}; names: ${JSON.stringify(ab.aria.slice(0, 4))}`, [pfx])
  const n = await P.locator(T('bal-postin')).count(); const line = await box(T('bal-postin'))
  const cols = await box('.bp-cols'); const tabs = await box(T('bal-view-bal'))
  const want = role !== 'locked'
  rec(`${id}c the one line above the rows`, SZ, want
    ? (n === 1 && line.shown && line.text === 'Only leave after post-in is deducted.' && line.t >= tabs.b - 0.5 && line.b <= cols.t + 0.5 && !line.cut && line.ink.r <= P.viewportSize().width ? 'PASS' : 'FAIL')
    : (n === 0 ? 'PASS' : 'FAIL'),
    `${n} line(s) "${line?.text ?? ''}" ${line?.font ?? ''} ${line?.color ?? ''} ${bx(line)}; view switch foot y=${R(tabs?.b)}; headings top y=${R(cols?.t)} (${want ? 'one expected' : 'none expected, locked'})`, [pfx])
  /* every row: its War bal words, its five other kinds' boxes */
  const rows = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="bal-row-"]')].filter(r => r.getBoundingClientRect().height > 0).map(r => {
    const pid = r.dataset.testid.slice(8)
    const q = id => r.querySelector(`[data-testid="${id}"]`)
    const war = q(`bal-war-${pid}`), oil = q(`bal-oil-${pid}`)
    const nt = war?.querySelector('.bp-nt')
    const rg = nt ? (() => { const g = document.createRange(); g.selectNodeContents(nt); return g.getBoundingClientRect() })() : null
    const kinds = ['CCL', 'FCL', 'PL', 'EL', 'CL'].map(k => { const e = q(`bal-${k}-${pid}`); return e ? { k, input: e.tagName === 'INPUT', v: e.tagName === 'INPUT' ? e.value : e.textContent, nt: e.classList.contains('nt'), col: getComputedStyle(e).color, edge: getComputedStyle(e).borderTopStyle } : { k, missing: true } })
    const lve = q(`bal-LVE-${pid}`)
    const ro = [...r.querySelectorAll('.bp-ro')].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ v: e.textContent.trim(), nt: e.classList.contains('nt'), col: getComputedStyle(e).color }))
    const inputs = r.querySelectorAll('input').length
    return { pid, name: r.querySelector('[data-testid^="bal-name-"]')?.textContent.trim(), nt: !!nt, ntInk: rg && { l: rg.left, r: rg.right, t: rg.top, b: rg.bottom }, warBox: war && (() => { const b = war.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom } })(), warText: war?.textContent.trim(),
      oilL: oil?.getBoundingClientRect().left, ntFont: nt && getComputedStyle(nt).fontSize, ntCol: nt && getComputedStyle(nt).color, kinds, ro, inputs, lve: lve && { input: lve.tagName === 'INPUT', v: lve.tagName === 'INPUT' ? lve.value : lve.textContent, nt: lve.classList.contains('nt') } }
  }))
  const five = rows.filter(r => r.kinds.every(k => k.nt) || r.ro.filter(x => x.nt).length >= 5), ntRows = rows.filter(r => r.nt)
  rec(`${id}d rows with five empty amber boxes`, SZ, 'RECORD', `${rows.length} rows drawn; ${five.length} show all five of CCL·FCL·PL·EL·CL never typed (${role === 'admin' ? 'empty dashed boxes' : 'amber dashes'}); ${rows.length - five.length} do not (${rows.filter(r => !r.kinds.every(k => k.nt)).map(r => r.name).join(', ')}); LVE never typed: ${ntRows.map(r => r.name).join(', ') || 'none'}`, [pfx])
  /* the column is the WAR BAL heading's, up to where the OIL heading (and the OIL figure) starts */
  const wh = head.find(h => h.t === 'WAR BAL'), oh = head.find(h => h.t === 'OIL')
  const bad = ntRows.filter(r => !(r.ntInk && wh && r.ntInk.l >= wh.l - 0.5 && r.ntInk.r <= (oh ? oh.l : wh.r) + 0.5 && (r.oilL == null || r.ntInk.r <= r.oilL)))
  rec(`${id}e "Not typed" fits the WAR BAL column`, SZ, !ntRows.length ? 'NOT WALKED' : bad.length ? 'FAIL' : 'PASS',
    ntRows.length ? `WAR BAL column x ${R(wh?.l)}–${R(oh?.l)}; ${bad.length} of ${ntRows.length} spill: ` + ntRows.slice(0, 3).map(r => `${r.name}: words x ${R(r.ntInk.l)}–${R(r.ntInk.r)}, OIL figure from x=${R(r.oilL)}, ${r.ntFont} ${r.ntCol}`).join(' · ') : 'no row reads Not typed', [pfx, pfx + '-nt-zoom'])
  if (ntRows.length) {
    const r0 = ntRows[0]
    await P.locator(T(`bal-row-${r0.pid}`)).scrollIntoViewIfNeeded(); await P.waitForTimeout(300)
    const rb = await box(T(`bal-row-${r0.pid}`)), vw = P.viewportSize().width
    await P.screenshot({ path: `${L.OUT}/${pfx}-nt-zoom.png`, scale: 'device', clip: { x: Math.max(0, vw - 200), y: rb.t - 4, width: Math.min(200, vw), height: rb.h + 8 } })
  }
  if (role !== 'admin') {
    const ro = rows.flatMap(r => r.ro.filter(x => x.nt).map(x => ({ ...x, k: 'read-only', name: r.name })))
    rec(`${id}f read-only "never typed" is the amber dash`, SZ, ro.length && ro.every(k => k.v === '–' && /242, 200, 121/.test(k.col)) ? 'PASS' : 'FAIL',
      `${ro.length} read-only never-typed marks on ${new Set(ro.map(k => k.name)).size} rows, ${ro.filter(k => !(k.v === '–' && /242, 200, 121/.test(k.col))).length} not the amber dash; first: ${ro.slice(0, 3).map(k => `${k.name} ${k.k} "${k.v}" ${k.col}`).join(' · ')}`, [pfx])
  }
  return { rows, five, ntRows }
}
/* scroll the list under the pinned headings and look for anything showing through them or the one line */
async function balLeak(id, pfx) {
  const moved = await P.evaluate(() => {
    const s = document.querySelector('[data-testid="balances-page"]')
    const sc = [s, ...s.querySelectorAll('*')].find(e => e.scrollHeight > e.clientHeight + 40 && /auto|scroll/.test(getComputedStyle(e).overflowY))
    if (!sc) { const y0 = scrollY; scrollBy(0, 360); return { who: 'window', from: y0, to: scrollY } }
    const y0 = sc.scrollTop; sc.scrollTop += 360; return { who: sc.className || sc.tagName, from: y0, to: sc.scrollTop }
  })
  await P.waitForTimeout(500); await shot(w, pfx)
  const leak = await P.evaluate(() => {
    const out = []
    for (const sel of ['.bp-cols', '[data-testid="bal-postin"]']) {
      const e = document.querySelector(sel); if (!e) continue
      const r = e.getBoundingClientRect()
      for (let x = r.left + 4; x < r.right - 2; x += 18) for (const y of [r.top + 1, (r.top + r.bottom) / 2, r.bottom - 1]) {
        const h = document.elementFromPoint(x, y)
        if (h && h.closest('[data-testid^="bal-row-"]')) out.push(`${sel} at ${Math.round(x)},${Math.round(y)}: ${h.closest('[data-testid^="bal-row-"]').dataset.testid}`)
      }
    }
    const c = document.querySelector('.bp-cols').getBoundingClientRect(), l = document.querySelector('[data-testid="bal-postin"]')?.getBoundingClientRect()
    return { out, gap: l ? Math.round((c.top - l.bottom) * 10) / 10 : null, colsTop: c.top }
  })
  rec(`${id} nothing shows through the pinned headings`, SZ, moved.to !== moved.from && !leak.out.length ? 'PASS' : moved.to === moved.from ? 'NOT WALKED' : 'FAIL',
    `list scrolled ${moved.who} ${moved.from}→${moved.to}; rows found under the headings/line: ${leak.out.length ? leak.out.slice(0, 4).join('; ') : 'none'}; line-to-headings gap ${leak.gap}px`, [pfx])
}

/* ---------- the drawing check: two pictures compared pixel by pixel, bands of difference listed ---------- */
async function compare(name, drawingFile, buildFile, scaleDraw = 1) {
  const cmpPage = await (await L.getBrowser()).newPage({ viewport: { width: 1200, height: 900 } })
  const a = 'data:image/png;base64,' + readFileSync(drawingFile).toString('base64'), b = 'data:image/png;base64,' + readFileSync(buildFile).toString('base64')
  const res = await cmpPage.evaluate(async ({ a, b, scaleDraw }) => {
    const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s })
    const A = await load(a), B = await load(b)
    const W = Math.round(Math.max(A.width / scaleDraw, B.width)), H = Math.round(Math.max(A.height / scaleDraw, B.height))
    const ca = new OffscreenCanvas(W, H), cb = new OffscreenCanvas(W, H)
    const xa = ca.getContext('2d'), xb = cb.getContext('2d')
    xa.fillStyle = '#000'; xa.fillRect(0, 0, W, H); xb.fillStyle = '#000'; xb.fillRect(0, 0, W, H)
    xa.drawImage(A, 0, 0, A.width / scaleDraw, A.height / scaleDraw); xb.drawImage(B, 0, 0)
    const da = xa.getImageData(0, 0, W, H).data, db = xb.getImageData(0, 0, W, H).data
    const rowsDiff = new Array(H).fill(0), rowMin = new Array(H).fill(W), rowMax = new Array(H).fill(-1)
    const cd = new OffscreenCanvas(W * 3, H), xd = cd.getContext('2d')
    xd.drawImage(ca, 0, 0); xd.drawImage(cb, W, 0)
    const out = xd.getImageData(W * 2, 0, W, H)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]))
      const g = (da[i] + da[i + 1] + da[i + 2]) / 12
      if (d > 24) { rowsDiff[y]++; rowMin[y] = Math.min(rowMin[y], x); rowMax[y] = Math.max(rowMax[y], x); out.data[i] = 255; out.data[i + 1] = 45; out.data[i + 2] = 149; out.data[i + 3] = 255 }
      else { out.data[i] = g; out.data[i + 1] = g; out.data[i + 2] = g; out.data[i + 3] = 255 }
    }
    xd.putImageData(out, W * 2, 0)
    const bands = []; let cur = null
    for (let y = 0; y < H; y++) {
      if (rowsDiff[y] > 1) { if (!cur || y - cur.y1 > 2) { cur = { y0: y, y1: y, x0: rowMin[y], x1: rowMax[y], px: 0 }; bands.push(cur) } cur.y1 = y; cur.x0 = Math.min(cur.x0, rowMin[y]); cur.x1 = Math.max(cur.x1, rowMax[y]); cur.px += rowsDiff[y] }
    }
    const blob = await cd.convertToBlob({ type: 'image/png' })
    const buf = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000))
    const inkBands = (d, x0, x1) => { const out = []; let c = null
      for (let y = 0; y < H; y++) { let n = 0; for (let x = x0; x < x1; x++) { const i = (y * W + x) * 4; if (d[i] + d[i + 1] + d[i + 2] > 330) n++ }
        if (n > 1) { if (!c) { c = { y0: y, y1: y }; out.push(c) } else c.y1 = y } else c = null }
      return out.filter(b => b.y1 - b.y0 >= 2) }
    const lines = []
    for (const [x0, x1] of [[20, Math.round(W * 0.58)], [Math.round(W * 0.58), W - 10]]) lines.push({ x0, x1, a: inkBands(da, x0, x1), b: inkBands(db, x0, x1) })
    return { W, H, bands, lines, png: btoa(s) }
  }, { a, b, scaleDraw })
  await cmpPage.close()
  writeFileSync(path.join(L.OUT, name + '.png'), Buffer.from(res.png, 'base64'))
  return res
}

const only = process.env.ONLY ? process.env.ONLY.split(',') : null
const want = id => !only || only.includes(id)
try {
  w = await L.newCtx('phone'); P = w.page
  log('viewport', JSON.stringify(P.viewportSize()))
  await L.signIn(w, 'admin')
  /* ---- fixtures: three men added on Admin → Users (each asserted on the page) */
  const added = [await addMan('Buzzard', 'BZ', '2026-12-07'), await addMan('Lynx', 'LX', '2026-12-07'), await addMan('Pelican', 'PN', '2026-11-27')]
  await L.openWar(w, 'admin'); await openBalances()
  const K = await pidOf('Buzzard'), LX = await pidOf('Lynx'), PN = await pidOf('Pelican')
  log('ids', K, LX, PN)
  rec('F0 fixture: three men on the Balances page', SZ, added.every(Boolean) && K && LX && PN ? 'PASS' : 'FAIL', `Buzzard=${K} Lynx=${LX} Pelican=${PN}`)
  /* Pelican's 24, the drawing's world (typed through his box, Enter) */
  await typeBox(T(`bal-LVE-${PN}`), 24, 'enter', null, null)
  rec('F1 fixture: Pelican 24 typed', SZ, (await box(T(`bal-war-${PN}`)))?.text === '24' ? 'PASS' : 'FAIL', `War bal ${(await box(T(`bal-war-${PN}`)))?.text}`)

  /* ===== B1 the Balances page, admin, 402 ===== */
  if (want('B1')) { await balLooks('B1', '01-bal-admin-402', 'admin'); await balLeak('B1g', '01b-bal-admin-402-scrolled') }

  /* ===== B2 Buzzard's person window, never typed, 402 ===== */
  if (want('B2')) {
    await openPw(K, '02-pw-buzzard-402')
    await crop('02c-pw-buzzard-402-crop', T('person-window'), 2)
    await pwNeverTypedLooks('B2', '02-pw-buzzard-402')
  }
  /* ===== B3 carried forward typed first — the refusal, fully in sight ===== */
  if (want('B3')) {
    if (!(await vis(P, T('person-window')))) await openPw(K, null)
    await typeBox(T('pw-LVE-cf'), 3, 'enter', null, '03-cf-first-refused')
    const err = await box(T('pw-LVE-cf-err')), pwb = await box(T('person-window')), vw = P.viewportSize()
    const top = await onTop(T('pw-LVE-cf-err'))
    rec('B3a "Type the Official bal first" fully in sight', SZ, err?.shown && err.text === 'Type the Official bal first' && inside(err, pwb) && inside(err, { l: 0, r: vw.width, t: 0, b: vw.height }) && top === 'on top' && !err.cut ? 'PASS' : 'FAIL',
      `"${err?.text}" ${bx(err)} ${err?.font} ${err?.color}; window ${bx(pwb)}; ${top}`, ['03-cf-first-refused'])
    await crop('03b-cf-first-refused-crop', T('pw-tile-LVE'), 30)
    const till = await box(T('pw-LVE-till')), pil = await box(T('pw-postin'))
    const ov = (a, b) => a && b ? Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t)) : 0
    rec('B3d what the refusal tag stands over', SZ, 'RECORD', `tag ${bx(err)}; "till 31 Dec" ${bx(till)} covered ${R(ov(err, till))}px²; the one line ${bx(pil)} covered ${R(ov(err, pil))}px² (its top ${R(pil?.t)}, the tag's foot ${R(err?.b)})`, ['03b-cf-first-refused-crop'])
    const war = await box(T('pw-LVE-war'))
    rec('B3b nothing saved by the refusal', SZ, war?.text === 'Not typed' ? 'PASS' : 'FAIL', `War bal still "${war?.text}"`, ['03-cf-first-refused'])
    /* clear the box and tap away: still nothing saved */
    await press(w, T('pw-LVE-cf')); await P.keyboard.press('Control+A'); await P.keyboard.press('Backspace')
    const pt = await box(T('pw-name')); await fingerAt(pt.r + 30, (pt.t + pt.b) / 2, '03c-cf-cleared-tap-away')
    const after = await box(T('pw-LVE-war')), cf = await box(T('pw-LVE-cf'))
    rec('B3e the refusal after the box is emptied and left', SZ, 'RECORD', `refusal still shown: ${await vis(P, T('pw-LVE-cf-err'))}`, ['03c-cf-cleared-tap-away'])
    rec('B3c cleared and left: still never typed', SZ, after?.text === 'Not typed' && cf?.text === '' ? 'PASS' : 'FAIL', `War bal "${after?.text}", carried box "${cf?.text}", error shown: ${await vis(P, T('pw-LVE-cf-err'))}`, ['03c-cf-cleared-tap-away'])
    await closePw()
  }
  /* ===== B4 below zero, never typed: one-day window, LL on Tue 8 Dec ===== */
  if (want('B4')) {
    await openGrid()
    await L.reachCell(w, K, '2026-12-08')
    const nameFig = await P.evaluate(pid => { const r = document.querySelector(`[data-testid="row-${pid}"]`); return r ? r.innerText.replace(/\s+/g, ' ').slice(0, 60) : null }, K)
    rec('B4r grid figure beside a never-typed name (left unchanged on purpose)', SZ, 'RECORD', `Buzzard's row name cell reads "${nameFig}"`)
    await L.openCell(w, K, '2026-12-08', '04a-buzzard-8dec-open-q'); await shot(w, '04a-buzzard-8dec-open')
    const left = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="bid-"]')].filter(e => /^bid-(LL|OL|CCL|FCL|PL|EL|CL|OIL)$/.test(e.dataset.testid) && e.getBoundingClientRect().width > 0).map(e => `${e.dataset.testid.slice(4)}: ${e.innerText.replace(/\s+/g, ' ')}`))
    rec('B4r2 leave buttons\' "left" for a never-typed man (left unchanged on purpose)', SZ, 'RECORD', left.join(' · '), ['04a-buzzard-8dec-open'])
    await tap(T('bid-LL'), '04b-buzzard-LL-one-tap')
    const note = await vis(P, T('span-note')) ? await box(T('span-note')) : null
    const open = await vis(P, T('bid-picker'))
    const cell = await P.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.innerText.replace(/\s+/g, ' ').trim(), L.cellId(K, '2026-12-08'))
    rec('B4a never typed: no below-zero question, placed on the first tap', SZ, !note && !open && /LL/.test(cell || '') ? 'PASS' : 'FAIL', `question: ${note ? '"' + note.text + '"' : 'none'}; window still open: ${open}; the day now reads "${cell}"`, ['04b-buzzard-LL-one-tap-q', '04b-buzzard-LL-one-tap'])
    await L.closeWin(w)
    await openBalances()
    const war = await box(T(`bal-war-${K}`))
    rec('B4b after the leave, still "Not typed" (never 0 or −1)', SZ, war?.text === 'Not typed' ? 'PASS' : 'FAIL', `Buzzard War bal "${war?.text}"`)
    await P.locator(T(`bal-row-${K}`)).scrollIntoViewIfNeeded(); await crop('04c-bal-buzzard-after-LL', T(`bal-row-${K}`), 6)
    await openPw(K, '04d-pw-buzzard-after-LL')
    rec('B4c "taken" on his LVE tile (LL Tue 8 Dec approved, after his post-in)', SZ, 'RECORD', `tile says "${(await box(T('pw-taken')))?.text}"; War bal "${(await box(T('pw-LVE-war')))?.text}"; leave list "${await P.evaluate(() => document.querySelector('[data-testid="pw-list"]')?.innerText.replace(/\s+/g, ' ').slice(0, 80))}"`, ['04d-pw-buzzard-after-LL'])
    await closePw()
  }
  /* ===== B5 0 typed into an empty box (CCL), left by a tap away; then below zero for that typed 0 ===== */
  if (want('B5')) {
    await openBalances()
    await typeBox(T(`bal-CCL-${K}`), 0, 'away', T('bal-postin'), '05a-buzzard-CCL-0-tap-away')
    const c = await box(T(`bal-CCL-${K}`)), lve = await box(T(`bal-LVE-${K}`)), war = await box(T(`bal-war-${K}`))
    rec('B5a 0 typed saves (tap away): the box shows 0, no dashed edge', SZ, c?.text === '0' && !/dashed/.test(c.border) && !/\bnt\b/.test(c.cls) ? 'PASS' : 'FAIL', `CCL box "${c?.text}" edge ${c?.border} class ${c?.cls}`, ['05a-buzzard-CCL-0-tap-away'])
    rec('B5b the other kinds stay never typed', SZ, lve?.text === '' && war?.text === 'Not typed' ? 'PASS' : 'FAIL', `LVE box "${lve?.text}", War bal "${war?.text}"`, ['05a-buzzard-CCL-0-tap-away'])
    await P.locator(T(`bal-row-${K}`)).scrollIntoViewIfNeeded(); await crop('05b-bal-buzzard-CCL0-crop', T(`bal-row-${K}`), 6)
    /* a CCL bid on Wed 9 Dec: CCL is typed (0), so the question comes */
    await openGrid()
    await L.openCell(w, K, '2026-12-09'); await shot(w, '05c-buzzard-9dec-open')
    await tap(T('bid-CCL'), '05d-buzzard-CCL-first-tap')
    const note = await vis(P, T('span-note')) ? await box(T('span-note')) : null
    const llb = await box(T('bid-CCL')), vw = P.viewportSize()
    const top = note ? await onTop(T('span-note')) : 'none'
    rec('B5c typed 0: the below-zero question, fully in sight above the buttons', SZ, note && /That takes Buzzard to −1 CCL\. Tap the same leave again to go ahead\./.test(note.text) && inside(note, { l: 0, r: vw.width, t: 0, b: vw.height }) && note.b <= llb.t + 0.5 && top === 'on top' && !note.cut ? 'PASS' : 'FAIL',
      `"${note?.text}" ${bx(note)}; CCL button top y=${R(llb?.t)}; ${top}`, ['05d-buzzard-CCL-first-tap-q', '05d-buzzard-CCL-first-tap'])
    await tap(T('bid-CCL'), '05e-buzzard-CCL-second-tap')
    const open = await vis(P, T('bid-picker'))
    const cell = await P.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.innerText.replace(/\s+/g, ' ').trim(), L.cellId(K, '2026-12-09'))
    rec('B5d the second tap places it', SZ, !open && /CCL/.test(cell || '') ? 'PASS' : 'FAIL', `window open ${open}; day reads "${cell}"`, ['05e-buzzard-CCL-second-tap'])
    await L.closeWin(w)
    await openBalances(); const cc = await box(T(`bal-CCL-${K}`))
    rec('B5e CCL now reads below zero', SZ, cc?.text === '−1' || cc?.text === '-1' ? 'PASS' : 'RECORD', `CCL box "${cc?.text}"`)
  }
  /* ===== B6 his example on the phone: post-in Mon 7 Dec, leave Wed 2 Dec placed first, 24 typed ===== */
  if (want('B6')) {
    await openGrid()
    await L.reachCell(w, LX, '2026-12-02')
    await L.openCell(w, LX, '2026-12-02', '06a-lynx-2dec-tap-q'); await shot(w, '06a-lynx-2dec-tap')
    await P.waitForSelector(`${T('postin-place')}, ${T('bid-picker')}`, { state: 'visible', timeout: 8000 }).catch(() => null)
    if (await vis(P, T('postin-place'))) { await tap(T('postin-place'), '06b-lynx-postin-place') }
    await L.approveWhatIEnter(w, true)
    await shot(w, '06c-lynx-window')
    const placed = await L.placeLeave(w, 'LL'); await P.waitForTimeout(400)
    const cell = await P.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.innerText.replace(/\s+/g, ' ').trim(), L.cellId(LX, '2026-12-02'))
    await shot(w, '06d-lynx-grid-2dec')
    rec('B6a the leave on Wed 2 Dec placed and shown on the grid', SZ, placed && /LL/.test(cell || '') ? 'PASS' : 'FAIL', `placed=${placed}; day reads "${cell}"`, ['06d-lynx-grid-2dec'])
    await openPw(LX, '06e-pw-lynx-before')
    const before = await box(T('pw-LVE-war'))
    rec('B6b before typing: Not typed', SZ, before?.text === 'Not typed' ? 'PASS' : 'FAIL', `War bal "${before?.text}"`, ['06e-pw-lynx-before'])
    await typeBox(T('pw-LVE'), 24, 'enter', null, '06f-pw-lynx-24-typed')
    const a = await box(T('pw-LVE')), pend = await box(T('pw-LVE-pend')), war = await box(T('pw-LVE-war')), taken = await box(T('pw-taken'))
    rec('B6c his example: Official 24, War 24 (2 Dec never deducted)', SZ, a?.text === '24' && war?.text === '24' ? 'PASS' : 'FAIL', `Official bal "${a?.text}", Pending "${pend?.text}", War bal "${war?.text}", taken "${taken?.text}"`, ['06f-pw-lynx-24-typed'])
    await crop('06g-pw-lynx-24-crop', T('pw-tile-LVE'), 8)
    const list = await P.evaluate(() => document.querySelector('[data-testid="pw-list"]')?.innerText.replace(/\s+/g, ' ').slice(0, 160))
    rec('B6d his leave list still shows 2 Dec', SZ, /2 Dec/.test(list || '') ? 'PASS' : 'FAIL', `leave list: "${list}"`, ['06f-pw-lynx-24-typed'])
    await closePw()
    /* the post-in day itself counts: LL Mon 7 Dec → 23 */
    await openGrid(); await L.openCell(w, LX, '2026-12-07'); await L.approveWhatIEnter(w, true)
    const p2 = await L.placeLeave(w, 'LL'); await L.closeWin(w)
    await openBalances(); const w7 = await box(T(`bal-war-${LX}`)), a7 = await box(T(`bal-LVE-${LX}`))
    await P.locator(T(`bal-row-${LX}`)).scrollIntoViewIfNeeded(); await crop('06h-bal-lynx-after-7dec', T(`bal-row-${LX}`), 6)
    await openPw(LX, '06i-pw-lynx-after-7dec')
    rec('B6f "taken" on Lynx\'s tile after 7 Dec', SZ, 'RECORD', `tile says "${(await box(T('pw-taken')))?.text}"; Official "${(await box(T('pw-LVE')))?.text}", War "${(await box(T('pw-LVE-war')))?.text}"`, ['06i-pw-lynx-after-7dec'])
    await closePw()
    rec('B6e leave on his post-in day (Mon 7 Dec) does come off', SZ, p2 && a7?.text === '23' && w7?.text === '23' ? 'PASS' : 'FAIL', `placed=${p2}; Official "${a7?.text}", War "${w7?.text}"`, ['06h-bal-lynx-after-7dec'])
    await openGrid(); await L.reachCell(w, LX, '2026-12-02')
    const nameFig = await P.evaluate(pid => document.querySelector(`[data-testid="row-${pid}"]`)?.innerText.replace(/\s+/g, ' ').slice(0, 60), LX)
    rec('B6r grid figure beside Lynx', SZ, 'RECORD', `"${nameFig}"`)
  }
  /* ===== B7 375 wide: the same looks ===== */
  if (want('B7')) {
    await P.setViewportSize({ width: 375, height: 812 }); await P.waitForTimeout(900)
    await openBalances()
    await balLooks('B7', '07-bal-admin-375', 'admin')
    await openPw(K, '07b-pw-buzzard-375')
    await pwNeverTypedLooks('B7p', '07b-pw-buzzard-375', ['FCL', 'PL', 'EL', 'CL'])
    await typeBox(T('pw-LVE-cf'), 2, 'enter', null, '07c-cf-first-375')
    const err = await box(T('pw-LVE-cf-err')), pwb = await box(T('person-window'))
    rec('B7q "Type the Official bal first" in sight at 375', SZ, err?.shown && inside(err, pwb) && err.r <= 375 && (await onTop(T('pw-LVE-cf-err'))) === 'on top' ? 'PASS' : 'FAIL', `${bx(err)} window ${bx(pwb)}`, ['07c-cf-first-375'])
    await P.keyboard.press('Escape'); await P.waitForTimeout(300)
    await closePw()
    await P.setViewportSize({ width: 402, height: 874 }); await P.waitForTimeout(900)
  }
  /* ===== B8 the member (Ranger) — unlocked: own row and window, another man's ===== */
  if (want('B8')) {
    await L.switchTo(w, 'member'); await openBalances()
    const m = await balLooks('B8', '08-bal-member-unlocked', 'member')
    const own = await box(T('bal-LVE-bane')), withInputs = m.rows.filter(r => r.inputs > 0).map(r => r.name), bz = m.rows.find(r => r.pid === K)
    rec('B8g member: own row boxes, others read only', SZ, own?.tag === 'INPUT' && withInputs.length === 1 && /Ranger/.test(withInputs[0]) && bz && bz.inputs === 0 ? 'PASS' : 'FAIL', `his Official bal ${own?.tag} "${own?.text}"; rows with boxes: ${withInputs.join(', ')}; Buzzard's row read only: ${bz?.ro.map(x => x.v).join(' ')}`, ['08-bal-member-unlocked'])
    await P.locator(T(`bal-row-${K}`)).scrollIntoViewIfNeeded(); await crop('08b-member-sees-buzzard', T(`bal-row-${K}`), 6)
    /* his own window: the line under the box; type a figure in his own CCL (Enter) */
    await openPw('bane', '08c-pw-ranger-own-unlocked')
    const l1 = await P.locator(T('pw-postin')).count()
    rec('B8h own window unlocked: the one line', SZ, l1 === 1 && (await box(T('pw-postin'))).shown ? 'PASS' : 'FAIL', `${l1} line(s)`, ['08c-pw-ranger-own-unlocked'])
    const c0 = await box(T('pw-CCL'))
    await typeBox(T('pw-CCL'), 2, 'enter', null, '08d-pw-ranger-CCL-2')
    const c1 = await box(T('pw-CCL'))
    rec('B8i member types his own figure on the phone (Enter)', SZ, c1?.text === '2' ? 'PASS' : 'FAIL', `his CCL "${c0?.text}" → "${c1?.text}"`, ['08d-pw-ranger-CCL-2'])
    await closePw()
    /* another man's window (never typed) */
    await openPw(K, '08e-pw-member-sees-buzzard')
    const l2 = await P.locator(T('pw-postin')).count(), dash = await box(T('pw-LVE')), war = await box(T('pw-LVE-war')), tile = await box(T('pw-tile-LVE')), oil = await box(T('pw-tile-OIL'))
    rec('B8j another man\'s window: no line, amber dash, "Not typed" fits', SZ, l2 === 0 && dash?.tag !== 'INPUT' && dash?.text === '–' && /242, 200, 121/.test(dash.color) && war?.text === 'Not typed' && inside(war.ink, tile) && war.ink.r <= oil.l ? 'PASS' : 'FAIL',
      `${l2} line(s); Official bal "${dash?.text}" ${dash?.tag} ${dash?.color}; War bal "${war?.text}" ${bx(war?.ink)} in tile ${bx(tile)}`, ['08e-pw-member-sees-buzzard'])
    await crop('08f-pw-member-sees-buzzard-crop', T('pw-tile-LVE'), 8)
    const small = []; for (const k of ['CCL', 'FCL', 'PL', 'EL', 'CL']) small.push(`${k} "${(await box(T(`pw-${k}`)))?.text}" war "${(await box(T(`pw-${k}-war`)))?.text ?? '(no line)'}"`)
    rec('B8k another man\'s small tiles', SZ, 'RECORD', small.join(' · '), ['08e-pw-member-sees-buzzard'])
    await closePw()
  }
  /* ===== B9 locked: the admin locks; the member's page and window ===== */
  if (want('B9')) {
    await L.switchTo(w, 'admin'); await openBalances()
    await tap(T('bal-lock'), '09a-admin-locks')
    const lk = await P.locator(T('bal-lock')).getAttribute('aria-checked')
    rec('B9a admin locks on the phone (padlock)', SZ, lk === 'true' ? 'PASS' : 'FAIL', `lock aria-checked=${lk}`, ['09a-admin-locks-q', '09a-admin-locks'])
    const al = await P.locator(T('bal-postin')).count()
    rec('B9b admin still sees the one line when locked', SZ, al === 1 ? 'PASS' : 'FAIL', `${al} line(s)`, ['09a-admin-locks'])
    await L.switchTo(w, 'member'); await openBalances()
    await balLooks('B9c', '09b-bal-member-locked', 'locked')
    const lb = await box(T('bal-locked'))
    rec('B9d "Locked by admin" shown', SZ, lb?.shown && /Locked by admin/.test(lb.text) ? 'PASS' : 'FAIL', `"${lb?.text}" ${bx(lb)}`, ['09b-bal-member-locked'])
    await openPw('bane', '09c-pw-ranger-own-locked')
    const l3 = await P.locator(T('pw-postin')).count(), own = await box(T('pw-LVE')), lock = await box(T('pw-lock'))
    rec('B9e own window locked: no line, read only, padlock', SZ, l3 === 0 && own?.tag !== 'INPUT' && lock?.shown ? 'PASS' : 'FAIL', `${l3} line(s); Official bal ${own?.tag} "${own?.text}"; padlock ${lock?.shown}`, ['09c-pw-ranger-own-locked'])
    await closePw()
    await L.switchTo(w, 'admin'); await openBalances(); await press(w, T('bal-lock')); await P.waitForTimeout(400)
    log('   unlocked again:', await P.locator(T('bal-lock')).getAttribute('aria-checked'))
  }
  log('errors:', w.errs.length ? w.errs.join(' | ') : 'none')
  L.writeResults('results-phone')
  await w.ctx.close()

  /* ===== B10 the drawing check — the drawing's own world: Pelican, post-in 27 Nov, 24 typed, no leave; the picture
     taken as the drawing script took it (a desktop context at 1.25 resized to 402 x 874), then compared pixel by pixel ===== */
  if (want('B10')) {
    const d = await L.newCtx('desk'); w = d; P = d.page
    await L.signIn(d, 'admin'); await addMan('Pelican', 'PN', '2026-11-27')
    await L.openWar(d, 'admin'); await openBalances()
    const pn = await pidOf('Pelican')
    await typeBox(T(`bal-LVE-${pn}`), 24, 'enter', null, null)
    await P.click(T(`bal-name-${pn}`)); await P.waitForSelector(T('person-window'), { state: 'visible' }); await P.waitForTimeout(500)
    const dk = await box(T('pw-CCL')); await P.locator(T('person-window')).screenshot({ path: `${L.OUT}/10x-desk-1536-pw-pelican.png` })
    rec('B10x lead: desktop 1536 person window, a never-typed CCL box', 'desk', /dashed/.test(dk?.border || '') ? 'PASS' : 'FAIL', `CCL box "${dk?.text}" edge ${dk?.border}`, ['10x-desk-1536-pw-pelican'])
    await P.keyboard.press('Escape'); await P.waitForTimeout(300); await closePw()
    await P.setViewportSize({ width: 402, height: 874 }); await P.waitForTimeout(900)
    /* the window, as the drawing took it (the element's own picture at 1.25) */
    await openBalances(); await P.click(T(`bal-name-${pn}`)); await P.waitForSelector(T('person-window'), { state: 'visible' }); await P.waitForTimeout(600)
    await P.mouse.move(1, 1); await P.waitForTimeout(200)
    await P.locator(T('person-window')).screenshot({ path: `${L.OUT}/10a-build-pw-as-built.png` })
    const parts = {}
    for (const id of ['person-window', 'pw-name', 'pw-tile-LVE', 'pw-LVE', 'pw-LVE-cf', 'pw-LVE-war', 'pw-postin', 'pw-tile-OIL', 'pw-tile-CCL', 'pw-year']) { const b = await box(T(id)); parts[id] = b && { l: R(b.l), t: R(b.t), w: R(b.w), h: R(b.h), text: b.text?.slice(0, 40), font: b.font, color: b.color } }
    log('   build parts (window, css px):', JSON.stringify(parts))
    const c1 = await compare('10b-pw-drawing-vs-build-as-built', path.join(DRAW, 'q16-final/phone-pw.png'), `${L.OUT}/10a-build-pw-as-built.png`)
    /* the five small kinds typed 0 — the drawing's world, drawn before "Not typed" existed */
    for (const k of ['CCL', 'FCL', 'PL', 'EL', 'CL']) { await P.click(T(`pw-${k}`)); await P.keyboard.type('0'); await P.keyboard.press('Enter'); await P.waitForTimeout(250) }
    await P.evaluate(() => document.activeElement && document.activeElement.blur()); await P.waitForTimeout(250)
    await P.mouse.move(1, 1); await P.waitForTimeout(300)
    await P.locator(T('person-window')).screenshot({ path: `${L.OUT}/10c-build-pw-zeros.png` })
    const c2 = await compare('10d-pw-drawing-vs-build-zeros', path.join(DRAW, 'q16-final/phone-pw.png'), `${L.OUT}/10c-build-pw-zeros.png`)
    await P.keyboard.press('Escape'); await P.waitForTimeout(400); await closePw()
    /* the page, as the drawing took it (scale css, the page at its top) */
    await openBalances(); await P.evaluate(() => scrollTo(0, 0)); await P.mouse.move(1, 1); await P.waitForTimeout(400)
    await shot(d, '10e-build-bal')
    const c3 = await compare('10f-bal-drawing-vs-build', path.join(DRAW, 'q16-final/phone-bal.png'), `${L.OUT}/10e-build-bal.png`)
    const line = await box(T('bal-postin')), cols = await box('.bp-cols')
    log('   build page line', bx(line), line?.font, line?.color, 'headings', bx(cols))
    const fmt = c => c.bands.map(b => `y ${b.y0}–${b.y1} x ${b.x0}–${b.x1} (${b.px}px)`).join('; ')
    const fmtL = (c, sc) => c.lines.map(L2 => `strip x ${L2.x0}–${L2.x1}: drawing ${L2.a.length} lines, build ${L2.b.length}; ` + L2.a.map((a, i) => { const b = L2.b[i]; return b ? `${a.y0}→${b.y0}${Math.abs(b.y0 - a.y0) / sc > 2 ? ' (' + R((b.y0 - a.y0) / sc) + 'px!)' : ''}` : `${a.y0}→none` }).join(' ')).join(' || ')
    log('   B10 line shifts, window as built:', fmtL(c1, 1.25)); log('   B10 line shifts, window zeros:', fmtL(c2, 1.25)); log('   B10 line shifts, page:', fmtL(c3, 1))
    rec('B10a drawing check, his window (as built: five kinds never typed)', SZ, 'RECORD', `${c1.W}x${c1.H}; ${c1.bands.length} band(s) differ: ${fmt(c1)}`, ['10b-pw-drawing-vs-build-as-built'])
    rec('B10b drawing check, his window (five kinds typed 0, the drawing\'s world)', SZ, c2.bands.length ? 'RECORD' : 'PASS', `${c2.W}x${c2.H}; ${c2.bands.length} band(s) differ: ${fmt(c2)}`, ['10d-pw-drawing-vs-build-zeros'])
    rec('B10c drawing check, Balances page', SZ, 'RECORD', `${c3.W}x${c3.H}; ${c3.bands.length} band(s) differ: ${fmt(c3)}`, ['10f-bal-drawing-vs-build'])
    log('errors (drawing world):', d.errs.length ? d.errs.join(' | ') : 'none')
    L.writeResults('results-all')
  }
} catch (e) {
  console.log('STOPPED:', e.stack?.split('\n').slice(0, 3).join(' | ')); try { await shot(w, 'zz-stopped') } catch { }
  L.writeResults('results-stopped')
} finally { await L.closeBrowser() }
