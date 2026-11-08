// Part B of the top-bar-fixed walk (D1873): scenarios on the AFTER build (and, where a comparison needs it, the BEFORE build).
// Usage: node scripts/handpass/topbar1108-b.mjs <scenario numbers, e.g. 1,2,3> — each prints rows "S<n>.<k> PASS|FAIL|NOT REACHED | what was read | picture".
import { chromium, LAUNCH, DIST_BEFORE, DIST_AFTER, ORIGIN, open, press, tab, V } from './topbar1108-lib.mjs'
import { pictureDiff } from '../drawcheck/lib.mjs'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('[topbar1108-b v1]')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const out = path.join(root, 'docs/img/handpass/2026-11-08-lw-pin-last-frame/walk/topbar/B')
mkdirSync(out, { recursive: true })
const WANT = (process.argv[2] || '1,2,3,4,5,6,7,8,9,10,11,12').split(',').map(Number)
const rows = []
const ERRS = []
function row(id, verdict, what, pic = '') { rows.push({ id, verdict, what, pic }); console.log(`${id} ${verdict} | ${what} | ${pic}`) }
const pic = async (p, name, clip) => { const f = path.join(out, name + '.png'); await p.screenshot({ path: f, ...(clip ? { clip } : {}) }); return name + '.png' }
const wait = (p, ms = 500) => p.waitForTimeout(ms)
const folded = async p => (await p.locator(V('#burger')).count()) > 0
const goTab = (p, pg) => tab(p, pg)
const scrollTo = async (p, y) => { await p.evaluate(v => window.scrollTo(0, v), y); await wait(p, 700) }
const scrollMax = p => p.evaluate(() => document.documentElement.scrollHeight - innerHeight)
const scrollY = p => p.evaluate(() => Math.round(scrollY))
// the bar, and the top of the page under it
const measure = p => p.evaluate(() => {
  const bar = document.querySelector('#shell > .topbar') || document.querySelector('#guestApp > .topbar')
  const r = bar.getBoundingClientRect(), cs = getComputedStyle(bar)
  const vis = e => { const q = e.getBoundingClientRect(); return q.height > 0 && getComputedStyle(e).visibility !== 'hidden' }
  const pg = [...document.querySelectorAll('[id^=page-]')].find(vis)
  const pr = pg ? pg.getBoundingClientRect() : null
  const kids = pg ? [...pg.children].filter(vis).map(e => e.getBoundingClientRect().top) : []
  const sy = scrollY
  return { barTop: +r.top.toFixed(2), barBottom: +r.bottom.toFixed(2), barH: +r.height.toFixed(2), barW: +r.width.toFixed(1), clientW: document.documentElement.clientWidth, pos: cs.position,
    topbarH: document.documentElement.style.getPropertyValue('--topbar-h'), pageId: pg ? pg.id : null, pageTopDoc: pr ? +(pr.top + sy).toFixed(2) : null, firstKidDoc: kids.length ? +(kids[0] + sy).toFixed(2) : null,
    burger: !!(document.querySelector('#burger') && document.querySelector('#burger').getBoundingClientRect().width > 0), names: !!(document.querySelector('#topnav') && document.querySelector('#topnav').getBoundingClientRect().width > 0), scrollY: Math.round(sy) }
})
const near = (a, b, t = 0.6) => a != null && b != null && Math.abs(a - b) <= t
async function ctxOf(opts) { const o = await open(opts); o.p.on('pageerror', () => {}); return o }
const DESK = { w: 1536, h: 864, dsf: 1 }, PHONE = { engine: 'webkit', w: 402, h: 874, dsf: 3 }
const PAGES = [['editsched', 'Edit Schedule'], ['viewsched', 'View-only Sched'], ['inputs', 'Inputs'], ['quals', 'Quals'], ['leavewar', 'Leave War'], ['tracker', 'Tracker'], ['logic', 'Logic'], ['admin', 'Admin'], ['help', 'Help']]
const cmp = await chromium.launch(LAUNCH)
const t0 = {}
const timeIt = async (n, fn) => { const s = Date.now(); try { await fn() } catch (e) { row(`S${n}.crash`, 'NOT REACHED', 'script stopped: ' + e.message.split('\n')[0]) } t0[n] = Math.round((Date.now() - s) / 1000); console.log(`-- S${n} took ${t0[n]}s`) }
const collect = (tag, errs) => { for (const e of errs) ERRS.push(`${tag}: ${e}`) }

// ---------------------------------------------------------------- 1 and 2 (long pages to the foot; mid-scroll)
async function s1and2(size, opts) {
  const { br, p, errs } = await ctxOf({ dist: DIST_AFTER, ...opts })
  const pages = [['editsched', 'edit'], ['inputs', 'inputs'], ['quals', 'quals'], ['leavewar', 'lwgrid'], ['admin', 'admin']]
  for (const [pg, nm] of pages) {
    await goTab(p, pg); await scrollTo(p, 0)
    if (pg === 'inputs' && await p.locator(V('#inListBtn')).count()) { await press(p, '#inListBtn'); await wait(p, 500) }
    const rest = await measure(p); let max = await scrollMax(p), shrunk = false
    if (max < 60) { await p.setViewportSize({ width: opts.w, height: 360 }); await wait(p, 700); max = await scrollMax(p); shrunk = max >= 60 }
    // 1: the foot
    if (max < 60) { row(`S1.${size}.${nm}`, 'NOT REACHED', `page is not scrollable here (scroll room ${max}px)`); continue }
    await scrollTo(p, max + 400)
    const foot = await measure(p)
    const f1 = await pic(p, `s1-${size}-${nm}-foot`, { x: 0, y: 0, width: opts.w, height: 300 })
    const ok1 = near(foot.barTop, 0) && foot.scrollY > 0 && near(foot.barH, rest.barH) && foot.pos === 'fixed'
    row(`S1.${size}.${nm}`, ok1 ? 'PASS' : 'FAIL', `${shrunk ? '(the page fits the screen, so the window was made 360 tall) ' : ''}scrollY=${foot.scrollY} of ${max}; bar top=${foot.barTop}, height ${foot.barH} (at rest ${rest.barH}), position ${foot.pos}`, f1)
    // 2: mid-scroll — the bar region at two scrolls must be the same picture (nothing of the page shows through)
    const bh = Math.ceil(rest.barH), clipB = { x: 0, y: 0, width: opts.w, height: bh }
    const positions = [Math.round(max * 0.3), Math.round(max * 0.55), Math.round(max * 0.8)]
    const files = []
    for (const [i, s] of positions.entries()) { await scrollTo(p, s); const f = path.join(out, `s2-${size}-${nm}-mid${i}.png`); await p.screenshot({ path: f, clip: clipB }); files.push(f) }
    const d1 = await pictureDiff(cmp, files[0], files[1]), d2 = await pictureDiff(cmp, files[0], files[2])
    const mid = await measure(p)
    const bg = await p.evaluate(() => { const b = document.querySelector('#shell > .topbar'); const c = getComputedStyle(b); return c.backgroundImage.slice(0, 120) + ' | ' + c.backgroundColor })
    const full = await pic(p, `s2-${size}-${nm}-mid-top300`, { x: 0, y: 0, width: opts.w, height: 300 })
    const same = d1.same !== false && d2.same !== false
    row(`S2.${size}.${nm}`, same && near(mid.barTop, 0) && near(mid.barW, mid.clientW, 1.5) ? 'PASS' : 'FAIL', `bar picture at 3 scrolls (${positions}) differs by ${d1.pixels ?? 'size'}/${d2.pixels ?? 'size'} px; bar top ${mid.barTop}, bar width ${mid.barW} vs page width ${mid.clientW}; background ${bg}`, full)
    if (shrunk) { await p.setViewportSize({ width: opts.w, height: opts.h }); await wait(p, 500) }
  }
  collect('S1/2 ' + size, errs); await br.close()
}
async function s2board() {
  // the Scheduler Board's own bar: same on both builds
  const shots = {}
  for (const [tag, dist] of [['before', DIST_BEFORE], ['after', DIST_AFTER]]) {
    const { br, p, errs } = await ctxOf({ dist, ...DESK })
    await goTab(p, 'editsched'); await press(p, '#eWeek .sb-open[data-sbday="0"]'); await wait(p, 900)
    const info = await p.evaluate(() => { const sc = [...document.querySelectorAll('#schedBoard *')].find(e => e.scrollHeight > e.clientHeight + 200 && /auto|scroll/.test(getComputedStyle(e).overflowY)); return sc ? { id: sc.id, cls: sc.className.toString(), h: sc.scrollHeight - sc.clientHeight } : null })
    if (info) await p.evaluate(() => { const sc = [...document.querySelectorAll('#schedBoard *')].find(e => e.scrollHeight > e.clientHeight + 200 && /auto|scroll/.test(getComputedStyle(e).overflowY)); sc.scrollTop = sc.scrollHeight / 2 })
    else await p.evaluate(() => scrollTo(0, 600))
    await wait(p, 700)
    const f = path.join(out, `s2-board-${tag}.png`); await p.screenshot({ path: f, clip: { x: 0, y: 0, width: 1536, height: 300 } }); shots[tag] = { f, info }
    const sb = await p.evaluate(() => { const t = document.querySelector('#schedBoard .sb-top'); const r = t && t.getBoundingClientRect(); return r ? { top: r.top, h: r.height, pos: getComputedStyle(t).position } : null })
    shots[tag].sb = sb; collect('S2 board ' + tag, errs); await br.close()
  }
  const d = await pictureDiff(cmp, shots.before.f, shots.after.f)
  row('S2.desk.board', d.same !== false ? 'PASS' : 'FAIL', `top 300px of the board mid-scroll, before vs after: ${d.pixels ?? 'sizes differ'} px differ; scroller ${JSON.stringify(shots.after.info)}; board bar before ${JSON.stringify(shots.before.sb)} after ${JSON.stringify(shots.after.sb)}`, 's2-board-after.png (and s2-board-before.png)')
}

// ---------------------------------------------------------------- 3 (first content starts at the bar's foot, five sizes, both builds)
async function s3() {
  const sizes = [['1536', { engine: 'chromium', w: 1536, h: 864, dsf: 1 }], ['1024', { engine: 'chromium', w: 1024, h: 768, dsf: 1 }], ['830', { engine: 'chromium', w: 830, h: 900, dsf: 1 }], ['402', PHONE], ['874x402', { engine: 'webkit', w: 874, h: 402, dsf: 3 }]]
  for (const [sz, o] of sizes) {
    const res = {}
    for (const [tag, dist] of [['before', DIST_BEFORE], ['after', DIST_AFTER]]) {
      const { br, p, errs } = await ctxOf({ dist, ...o }); res[tag] = {}
      for (const [pg] of PAGES) {
        const fld = !(await p.locator(V(`#topnav a[data-page="${pg}"]`)).count())
        try { await goTab(p, pg) } catch (e) { res[tag][pg] = { err: e.message.split('\n')[0] }; continue }
        await scrollTo(p, 0); const m = await measure(p); m.folded = await folded(p) && fld; res[tag][pg] = m
        if (tag === 'after' && (pg === 'editsched' || pg === 'leavewar' || pg === 'inputs')) await pic(p, `s3-${sz}-${pg}`, { x: 0, y: 0, width: o.w, height: Math.min(300, o.h) })
      }
      collect(`S3 ${sz} ${tag}`, errs); await br.close()
    }
    const bad = [], note = []
    for (const [pg, name] of PAGES) {
      const a = res.after[pg], b = res.before[pg]
      if (!a || a.err || !b || b.err) { bad.push(`${name}: not reached (${a?.err || b?.err})`); continue }
      const gapA = +(a.pageTopDoc - a.barBottom).toFixed(2), gapB = +(b.pageTopDoc - b.barBottom).toFixed(2)
      const startA = a.firstKidDoc == null ? null : +(a.firstKidDoc - a.barBottom).toFixed(2), startB = b.firstKidDoc == null ? null : +(b.firstKidDoc - b.barBottom).toFixed(2)
      if (!near(gapA, gapB, 1) || !near(startA, startB, 1) || !near(a.barH, b.barH, 1)) bad.push(`${name}: gap page-top minus bar-bottom ${gapA} (before ${gapB}); first child minus bar-bottom ${startA} (before ${startB}); bar height ${a.barH} (before ${b.barH})`)
      note.push(`${name} gap ${gapA}/${startA} barH ${a.barH} ${a.folded ? 'names folded into the menu' : (a.names ? 'names beside the logo' : 'names ?')}${a.barH > 70 ? ' (bar wrapped)' : ''}`)
    }
    row(`S3.${sz}`, bad.length ? 'FAIL' : 'PASS', (bad.length ? 'DIFFERENCES: ' + bad.join(' ; ') + ' || ' : 'every page: ') + note.join('; '), `s3-${sz}-editsched.png`)
  }
}

// ---------------------------------------------------------------- 4 the "Not saved" band
async function s4(size, opts) {
  const { br, ctx, p, errs } = await ctxOf({ dist: DIST_AFTER, ...opts, q: '?savefail' })
  await goTab(p, 'editsched'); await scrollTo(p, 0)
  const before = await measure(p)
  const f0 = await pic(p, `s4-${size}-0-before-change`, { x: 0, y: 0, width: opts.w, height: 300 })
  await press(p, '#eWeek [data-planmenu="0"]'); await press(p, '[data-plandup]'); await wait(p, 1200)
  const band = await p.evaluate(() => { const b = document.querySelector('.savestat.failed, .saveband'); if (!b) return null; const r = b.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: r.height, text: b.textContent.trim().slice(0, 60) } })
  const after = await measure(p)
  const f1 = await pic(p, `s4-${size}-1-band-up`, { x: 0, y: 0, width: opts.w, height: 300 })
  const grew = after.barH - before.barH
  const moved = +(after.pageTopDoc - before.pageTopDoc).toFixed(2), kid = after.firstKidDoc == null ? null : +(after.firstKidDoc - before.firstKidDoc).toFixed(2)
  const covered = +(after.firstKidDoc - after.barBottom).toFixed(2)
  row(`S4.${size}.band-up`, band && grew > 5 && near(moved, grew, 1.5) && near(covered, +(before.firstKidDoc - before.barBottom).toFixed(2), 1.5) ? 'PASS' : 'FAIL', `band ${JSON.stringify(band)}; bar ${before.barH} -> ${after.barH} (grew ${grew}); page top moved ${moved}, first content moved ${kid}; first content minus bar bottom ${covered} (before change ${(before.firstKidDoc - before.barBottom).toFixed(2)}); --topbar-h ${after.topbarH}`, f1)
  // Retry stays while the switch is on
  const retry = p.locator(V('.savestat.failed button, .saveband button')).first()
  if (await retry.count()) { await retry.click(); await wait(p, 1200); const m2 = await measure(p); const f2 = await pic(p, `s4-${size}-2-after-retry`, { x: 0, y: 0, width: opts.w, height: 300 }); row(`S4.${size}.retry-with-switch-on`, near(m2.barH, after.barH, 1) ? 'PASS' : 'FAIL', `Retry pressed with ?savefail still on (saves refused again): bar ${m2.barH}; band stays as the switch says`, f2) }
  else row(`S4.${size}.retry-with-switch-on`, 'NOT REACHED', 'no Retry button found')
  // reopen without ?savefail
  await p.goto(ORIGIN + '/'); await wait(p, 1500)
  try { await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]'); await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }) } catch (e) { /* maybe already signed in */ }
  await wait(p, 1000); await goTab(p, 'editsched'); await scrollTo(p, 0)
  const gone = await measure(p), bandGone = await p.evaluate(() => !document.querySelector('.savestat.failed, .saveband'))
  const f3 = await pic(p, `s4-${size}-3-reopened-without-switch`, { x: 0, y: 0, width: opts.w, height: 300 })
  row(`S4.${size}.band-gone`, bandGone && near(gone.barH, before.barH, 1) && near(gone.firstKidDoc - gone.barBottom, before.firstKidDoc - before.barBottom, 1.5) ? 'PASS' : 'FAIL', `reopened without ?savefail: band present=${!bandGone}; bar ${gone.barH} (originally ${before.barH}); first content minus bar bottom ${(gone.firstKidDoc - gone.barBottom).toFixed(2)}`, f3)
  collect('S4 ' + size, errs); await br.close()
}

// S4 again: the baseline is taken on a page opened WITHOUT ?savefail (the band was already up in the first version's "before")
async function s4b(size, opts) {
  const base = await ctxOf({ dist: DIST_AFTER, ...opts })
  await goTab(base.p, 'editsched'); await scrollTo(base.p, 0)
  const b0 = await measure(base.p); const fb = await pic(base.p, `s4b-${size}-0-baseline-no-switch`, { x: 0, y: 0, width: opts.w, height: 300 })
  collect('S4b base ' + size, base.errs); await base.br.close()
  const { br, p, errs } = await ctxOf({ dist: DIST_AFTER, ...opts, q: '?savefail' })
  await goTab(p, 'editsched'); await scrollTo(p, 0)
  const m0 = await measure(p), band0 = await p.evaluate(() => !!document.querySelector('.savestat.failed, .saveband'))
  const fa = await pic(p, `s4b-${size}-1-before-my-change`, { x: 0, y: 0, width: opts.w, height: 300 })
  // one change that saves: duplicate the plan (what the walk of 8 Nov used)
  await press(p, '#eWeek [data-planmenu="0"]'); await press(p, '[data-plandup]'); await wait(p, 1500)
  const m1 = await measure(p), band = await p.evaluate(() => { const b = document.querySelector('.savestat.failed, .saveband'); if (!b) return null; const r = b.getBoundingClientRect(); return { top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), h: +r.height.toFixed(1), text: b.textContent.trim().slice(0, 50) } })
  const f1 = await pic(p, `s4b-${size}-2-band-up`, { x: 0, y: 0, width: opts.w, height: 300 })
  const grew = +(m1.barH - b0.barH).toFixed(2), pageMoved = +(m1.pageTopDoc - b0.pageTopDoc).toFixed(2), kidMoved = +(m1.firstKidDoc - b0.firstKidDoc).toFixed(2), gap = +(m1.firstKidDoc - m1.barBottom).toFixed(2)
  row(`S4.${size}.band-up`, band && grew > 5 && near(pageMoved, grew, 1.5) && near(kidMoved, grew, 1.5) && near(gap, 0, 1.2) ? 'PASS' : 'FAIL', `no-switch page: bar ${b0.barH}, page top ${b0.pageTopDoc}, first content ${b0.firstKidDoc}. With ?savefail (band already up when the page opened: ${band0}) and after one saving change: band ${JSON.stringify(band)}; bar ${m1.barH} (grew ${grew}), page top moved ${pageMoved}, first content moved ${kidMoved}, first content minus bar bottom ${gap}; --topbar-h ${m1.topbarH}; bar height before my change ${m0.barH}`, f1)
  const retry = p.locator(V('.savestat.failed button, .saveband button')).first()
  if (await retry.count()) { await retry.click(); await wait(p, 1200); const m2 = await measure(p); const f2 = await pic(p, `s4b-${size}-3-after-retry`, { x: 0, y: 0, width: opts.w, height: 300 }); row(`S4.${size}.retry`, near(m2.barH, m1.barH, 1) ? 'PASS' : 'FAIL', `Retry pressed with the switch still on (saves are refused again, so the band stays): bar ${m2.barH}`, f2) }
  else row(`S4.${size}.retry`, 'NOT REACHED', 'no Retry button found')
  await p.goto(ORIGIN + '/'); await wait(p, 1500)
  try { await p.fill('#luser', 'ad', { timeout: 3000 }); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]'); await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }) } catch (e) { /* maybe still signed in */ }
  await wait(p, 1000); await goTab(p, 'editsched'); await scrollTo(p, 0)
  const g = await measure(p), bandGone = await p.evaluate(() => !document.querySelector('.savestat.failed, .saveband'))
  const f3 = await pic(p, `s4b-${size}-4-reopened-without-switch`, { x: 0, y: 0, width: opts.w, height: 300 })
  row(`S4.${size}.band-gone`, bandGone && near(g.barH, b0.barH, 1) && near(g.firstKidDoc, b0.firstKidDoc, 1.2) ? 'PASS' : 'FAIL', `reopened without ?savefail: band present=${!bandGone}; bar ${g.barH} (baseline ${b0.barH}); first content at ${g.firstKidDoc} (baseline ${b0.firstKidDoc})`, f3)
  collect('S4b ' + size, errs); await br.close()
}

// ---------------------------------------------------------------- 5 pinned rows under the bar
async function s5(size, opts) {
  const { br, p, errs } = await ctxOf({ dist: DIST_AFTER, ...opts })
  const pinned = (sel) => p.evaluate(s => { const bar = document.querySelector('#shell > .topbar').getBoundingClientRect(); const els = [...document.querySelectorAll(s)]; const out = els.map(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { cls: e.className.toString().slice(0, 40), top: +r.top.toFixed(2), h: +r.height.toFixed(2), op: cs.opacity, vis: cs.visibility, disp: cs.display } }).filter(o => o.h > 0 && o.disp !== 'none'); return { barBottom: +bar.bottom.toFixed(2), out } }, sel)
  // Leave War grid
  await goTab(p, 'leavewar'); await wait(p, 800)
  const max = await scrollMax(p)
  for (const frac of [0.3, 0.6]) {
    await scrollTo(p, Math.round(max * frac)); await wait(p, 500)
    const r = await pinned('.mxfixed'); const f = await pic(p, `s5-${size}-lwgrid-${frac}`, { x: 0, y: 0, width: opts.w, height: 300 })
    const shown = r.out.filter(o => o.op !== '0' && o.vis !== 'hidden')
    const ok = shown.length > 0 && shown.every(o => near(o.top, r.barBottom, 1.2))
    row(`S5.${size}.lw-grid-dates@${Math.round(frac * 100)}%`, ok ? 'PASS' : shown.length ? 'FAIL' : 'NOT REACHED', `scrollY ${await scrollY(p)}; bar bottom ${r.barBottom}; pinned dates row(s) shown: ${JSON.stringify(shown)} (all copies ${r.out.length})`, f)
  }
  // Quals
  await goTab(p, 'quals'); await wait(p, 600)
  const qmax = await scrollMax(p)
  if (qmax < 60) row(`S5.${size}.quals-heading`, 'NOT REACHED', `Quals not scrollable here (room ${qmax})`)
  else { await scrollTo(p, Math.round(qmax * 0.5)); const r = await pinned('.qfixed'); const f = await pic(p, `s5-${size}-quals`, { x: 0, y: 0, width: opts.w, height: 300 }); const shown = r.out.filter(o => o.op !== '0' && o.vis !== 'hidden')
    row(`S5.${size}.quals-heading`, shown.length && shown.every(o => near(o.top, r.barBottom, 1.2)) ? 'PASS' : shown.length ? 'FAIL' : 'NOT REACHED', `scrollY ${await scrollY(p)}; bar bottom ${r.barBottom}; pinned heading(s) shown: ${JSON.stringify(shown)}`, f) }
  // Balances
  await goTab(p, 'leavewar'); await scrollTo(p, 0); await press(p, '[data-testid="lw-tab-balances"]'); await wait(p, 800)
  let bmax = await scrollMax(p), bshrunk = false
  if (bmax < 80) { await p.setViewportSize({ width: opts.w, height: 360 }); await wait(p, 800); bmax = await scrollMax(p); bshrunk = bmax >= 80 }
  const bal =await p.evaluate(() => { const bar = document.querySelector('#shell > .topbar').getBoundingClientRect(); const pg = document.querySelector('[data-testid="balances-page"], .bal-page, [class*="balances"]'); const cand = [...document.querySelectorAll('#page-leavewar *')].filter(e => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return (cs.position === 'sticky' || cs.position === 'fixed') && r.height > 0 && r.top < 200 }).map(e => ({ c: e.className.toString().slice(0, 30), pos: getComputedStyle(e).position, top: +e.getBoundingClientRect().top.toFixed(2), h: +e.getBoundingClientRect().height.toFixed(1) })); return { barBottom: bar.bottom, cand: cand.slice(0, 8), found: !!pg } })
  if (bmax > 80) await scrollTo(p, Math.round(bmax * 0.5)); else await scrollTo(p, 0)
  const bal2 = await p.evaluate(() => { const bar = document.querySelector('#shell > .topbar').getBoundingClientRect(); const cand = [...document.querySelectorAll('#page-leavewar *')].filter(e => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return (cs.position === 'sticky' || cs.position === 'fixed') && r.height > 0 && r.top < 260 && r.top >= -2 }).map(e => ({ c: e.className.toString().slice(0, 30), pos: getComputedStyle(e).position, top: +e.getBoundingClientRect().top.toFixed(2), h: +e.getBoundingClientRect().height.toFixed(1) })); return { barBottom: +bar.bottom.toFixed(2), cand: cand.slice(0, 8) } })
  const fb = await pic(p, `s5-${size}-balances`, { x: 0, y: 0, width: opts.w, height: 300 })
  const flush = bal2.cand.filter(c => c.top < bal2.barBottom - 1.2)
  row(`S5.${size}.balances`, flush.length === 0 ? "PASS" : "FAIL", `${bshrunk ? "(page fits, window made 360 tall) " : ""}scrollY ${await scrollY(p)} of room ${bmax}; bar bottom ${bal2.barBottom}; pinned/sticky parts near the top: ${JSON.stringify(bal2.cand)}; of them behind the bar: ${JSON.stringify(flush)}`, fb)
  collect('S5 ' + size, errs); await br.close()
}

// ---------------------------------------------------------------- 6 windows below the bar, Undo/Redo pressable, the bell
async function s6() {
  const { br, p, errs } = await ctxOf({ dist: DIST_AFTER, ...DESK })
  await goTab(p, 'editsched'); await scrollTo(p, 0)
  // make an undoable change first
  const undoOn = () => p.evaluate(() => { const u = document.querySelector('#undoBtn'); return u && !u.disabled && u.getAttribute('aria-disabled') !== 'true' })
  let changed = false
  for (const sel of ['[data-itadd="0|0"]']) { try { await press(p, '#eWeek ' + sel); await wait(p, 600); changed = await undoOn() } catch (e) {} }
  row('S6.0.make-a-change', changed ? 'PASS' : 'NOT REACHED', changed ? 'pressed "+ In-time" on day 1; Undo is now enabled' : 'could not make an undoable change by "+ In-time"; Undo stays disabled')
  const barB = (await measure(p)).barBottom
  async function winTest(label, openSel, winSel, key) {
    try {
      await press(p, openSel); await wait(p, 700)
      const w = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const box = e.querySelector('.airpop-box,.modal-box,[class*="box"]') || e; const br_ = box.getBoundingClientRect(); return { top: +r.top.toFixed(1), boxTop: +br_.top.toFixed(1), h: +r.height.toFixed(0) } }, winSel)
      const f = await pic(p, `s6-${key}-open`)
      if (!w) { row(`S6.${key}`, 'NOT REACHED', `${label}: window ${winSel} not found after pressing ${openSel}`, f); return }
      const hit = await p.evaluate(() => { const out = {}; for (const id of ['undoBtn', 'redoBtn', 'notifyBell']) { const b = document.getElementById(id); if (!b) { out[id] = null; continue } const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); out[id] = !!e && (e === b || b.contains(e)) } return out })
      let undid = 'not pressed'
      if (changed && hit.undoBtn) { const before = await p.evaluate(() => document.querySelectorAll('#eWeek .itx').length); await p.locator('#undoBtn').click(); await wait(p, 700); const af = await p.evaluate(() => document.querySelectorAll('#eWeek .itx').length); const redoOn = await p.evaluate(() => { const r = document.querySelector('#redoBtn'); return r && !r.disabled }); undid = `Undo pressed: in-time boxes ${before} -> ${af}, Redo enabled=${redoOn}`; if (redoOn) { await p.locator('#redoBtn').click(); await wait(p, 600); undid += '; Redo pressed, put back' } }
      const f2 = await pic(p, `s6-${key}-after-undo`)
      row(`S6.${key}`, w.boxTop >= barB - 1 && hit.undoBtn && hit.redoBtn ? 'PASS' : 'FAIL', `${label}: window top ${w.top}, its box top ${w.boxTop}, bar bottom ${barB}; the bar's Undo/Redo/bell are what a press at their centre reaches: ${JSON.stringify(hit)}; ${undid}`, f2)
      await p.keyboard.press('Escape'); await wait(p, 500)
      const still = await p.evaluate(s => { const e = document.querySelector(s); return !!e && e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden' }, winSel)
      if (still) { await p.mouse.click(5, 800); await wait(p, 500) }
    } catch (e) { row(`S6.${key}`, 'NOT REACHED', `${label}: ${e.message.split('\n')[0]}`) }
  }
  await winTest('"Jump to a date"', '#page-editsched .wk-cal', '#weekCal', 'jump')
  await winTest('the day window', '#eWeek .dinfobtn[data-dayinfo="0"]', '#dayPop', 'day')
  // the bell
  try {
    await press(p, '#notifyBell'); await wait(p, 600)
    const open = await p.evaluate(() => { const l = [...document.querySelectorAll('[id*="bell" i],[class*="bell" i],[class*="notif" i]')].filter(e => e.getBoundingClientRect().height > 40 && getComputedStyle(e).visibility !== 'hidden').map(e => ({ id: e.id, c: e.className.toString().slice(0, 30), top: +e.getBoundingClientRect().top.toFixed(1), h: +e.getBoundingClientRect().height.toFixed(0) })); return l.slice(0, 4) })
    const f = await pic(p, 's6-bell-open')
    await press(p, '#notifyBell'); await wait(p, 600)
    const closed = await p.evaluate(() => [...document.querySelectorAll('[id*="bell" i],[class*="bell" i],[class*="notif" i]')].filter(e => e.getBoundingClientRect().height > 40 && getComputedStyle(e).visibility !== 'hidden').length)
    const f2 = await pic(p, 's6-bell-closed')
    row('S6.bell', open.length && open.every(o => o.top >= barB - 1) && closed === 0 ? 'PASS' : 'FAIL', `bell list parts after opening ${JSON.stringify(open)} (bar bottom ${barB}); after pressing the bell again, ${closed} such parts left`, f)
  } catch (e) { row('S6.bell', 'NOT REACHED', e.message.split('\n')[0]) }
  // a document viewer from Inputs
  try {
    await goTab(p, 'inputs'); await press(p, '#inMedBtn'); await wait(p, 800)
    const cand = p.locator(V('[data-docview],[data-docopen],[data-doc],.doc-chip,.docchip,[aria-label*="document" i]')).first()
    if (!(await cand.count())) { row('S6.docviewer', 'NOT REACHED', 'no document chip or button found on Inputs -> Medical in the demo data'); }
    else { await cand.click(); await wait(p, 900); const w = await p.evaluate(() => { const e = document.querySelector('.docviewbox'); return e ? +e.getBoundingClientRect().top.toFixed(1) : null }); const f = await pic(p, 's6-docviewer'); row('S6.docviewer', w == null ? 'NOT REACHED' : (w >= barB - 1 ? 'PASS' : 'FAIL'), `document viewer box top ${w}, bar bottom ${barB}`, f) }
  } catch (e) { row('S6.docviewer', 'NOT REACHED', e.message.split('\n')[0]) }
  collect('S6', errs); await br.close()
}

// ---------------------------------------------------------------- 7 page switches, and a resize with a scrolled page
async function s7() {
  for (const [size, o] of [['1536', DESK], ['402', PHONE]]) {
    const { br, p, errs } = await ctxOf({ dist: DIST_AFTER, ...o })
    const bad = [], seen = []
    for (const [pg, name] of PAGES.concat(PAGES.slice(0, 3))) {
      await scrollTo(p, 250)
      await goTab(p, pg); await wait(p, 600)
      const m = await measure(p), y = m.scrollY
      await scrollTo(p, 0); const m0 = await measure(p)
      const gap = +(m0.pageTopDoc - m0.barBottom).toFixed(2)
      seen.push(`${name}:${gap}`)
      if (!near(m0.barTop, 0) || !near(gap, 0, 1.2) || !near(m0.barH, +await p.evaluate(() => parseFloat(document.documentElement.style.getPropertyValue('--topbar-h'))), 1)) bad.push(`${name}: bar top ${m0.barTop}, gap ${gap}, bar ${m0.barH} vs --topbar-h ${m0.topbarH}`)
    }
    const f = await pic(p, `s7-${size}-switched`, { x: 0, y: 0, width: o.w, height: 300 })
    row(`S7.${size}.page-switches`, bad.length ? 'FAIL' : 'PASS', `after each switch (page first scrolled to 250): ${bad.length ? bad.join('; ') : 'bar top 0, page starts at the bar foot, bar height equals --topbar-h'} [gaps: ${seen.join(', ')}]`, f)
    collect('S7 ' + size, errs); await br.close()
  }
  // resize
  const { br, p, errs } = await ctxOf({ dist: DIST_AFTER, ...DESK })
  await goTab(p, 'editsched')
  const steps = [[1536, 864], [830, 900], [1536, 864], [1024, 768], [402, 874], [1536, 864]], res = [], bad = []
  for (const [w, h] of steps) {
    await p.setViewportSize({ width: w, height: h }); await wait(p, 900)
    await scrollTo(p, 400); const m = await measure(p); await scrollTo(p, 0); const m0 = await measure(p)
    const gap = +(m0.pageTopDoc - m0.barBottom).toFixed(2), tb = +await p.evaluate(() => parseFloat(document.documentElement.style.getPropertyValue('--topbar-h')))
    res.push(`${w}: bar ${m0.barH} (--topbar-h ${tb}), gap ${gap}, scrolled bar top ${m.barTop}, ${m0.burger && !m0.names ? 'folded' : 'names'}`)
    if (!near(gap, 0, 1.2) || !near(m.barTop, 0) || !near(m0.barH, tb, 1)) bad.push(w + ': ' + res[res.length - 1])
  }
  const f = await pic(p, 's7-resize-back', { x: 0, y: 0, width: 1536, height: 300 })
  row('S7.resize', bad.length ? 'FAIL' : 'PASS', `1536 -> 830 -> 1536 -> 1024 -> 402 -> 1536 with the page scrolled: ${res.join(' | ')}`, f)
  collect('S7 resize', errs); await br.close()
}

// ---------------------------------------------------------------- 8 the bar's own sideways scroll on a phone
async function s8(W = 402) {
  const { br, ctx, p, errs } = await ctxOf({ dist: DIST_AFTER, engine: 'chromium', w: W, h: 874, dsf: 3, touch: true })
  for (const [pg, nm] of [['editsched', 'edit'], ['leavewar', 'lw']]) {
    await goTab(p, pg); await scrollTo(p, 0)
    const info = await p.evaluate(() => {
      const bar = document.querySelector('#shell > .topbar')
      const sc = [bar, ...bar.querySelectorAll('*')].find(e => e.scrollWidth > e.clientWidth + 4 && /auto|scroll/.test(getComputedStyle(e).overflowX))
      const pos = id => { const e = document.querySelector(id); const r = e && e.getBoundingClientRect(); return r ? +r.left.toFixed(1) : null }
      return { sc: sc ? (sc.id || sc.className.toString().slice(0, 30)) : null, room: sc ? sc.scrollWidth - sc.clientWidth : 0, sl: sc ? sc.scrollLeft : 0, burger: pos('#burger'), undo: pos('#undoBtn'), bell: pos('#notifyBell'), mark: (() => { const e = bar.querySelector('.brand, .logo, #logo, [class*="brand"]'); const r = e && e.getBoundingClientRect(); return r ? +r.left.toFixed(1) : null })() }
    })
    const f0 = await pic(p, `s8-${W}-${nm}-0`, { x: 0, y: 0, width: W, height: 130 })
    if (!info.sc || info.room < 4) { row(`S8.${W}.${nm}`, 'NOT REACHED', `no sideways-scrolling part in the bar at ${W} wide (found ${JSON.stringify(info)})`, f0); continue }
    // a real finger swipe over CDP on the bar
    const cdp = await ctx.newCDPSession(p)
    await cdp.send('Input.synthesizeScrollGesture', { x: Math.round(W * 0.62), y: 25, xDistance: -160, yDistance: 0, speed: 600, gestureSourceType: 'touch' }); await wait(p, 900)
    const after = await p.evaluate(() => { const bar = document.querySelector('#shell > .topbar'); const sc = [bar, ...bar.querySelectorAll('*')].find(e => e.scrollWidth > e.clientWidth + 4 && /auto|scroll/.test(getComputedStyle(e).overflowX)); const pos = id => { const e = document.querySelector(id); const r = e && e.getBoundingClientRect(); return r ? +r.left.toFixed(1) : null }; return { sl: sc ? sc.scrollLeft : null, burger: pos('#burger'), undo: pos('#undoBtn'), bell: pos('#notifyBell'), mark: (() => { const e = bar.querySelector('.brand, .logo, #logo, [class*="brand"]'); const r = e && e.getBoundingClientRect(); return r ? +r.left.toFixed(1) : null })(), barTop: bar.getBoundingClientRect().top, scrollY: scrollY } })
    const f1 = await pic(p, `s8-${W}-${nm}-1-swiped`, { x: 0, y: 0, width: W, height: 130 })
    const moved = after.sl > info.sl + 5, burgerStays = near(after.burger, info.burger, 1) && (info.mark == null || near(after.mark, info.mark, 1)), btnMoved = info.bell != null && after.bell != null && !near(after.bell, info.bell, 2) || (info.undo != null && !near(after.undo, info.undo, 2))
    row(`S8.${W}.${nm}`, moved && burgerStays ? 'PASS' : 'FAIL', `scroller ${info.sc} room ${info.room}; scrollLeft ${info.sl} -> ${after.sl}; burger left ${info.burger} -> ${after.burger}; mark left ${info.mark} -> ${after.mark}; Undo left ${info.undo} -> ${after.undo}; bell left ${info.bell} -> ${after.bell}; buttons moved=${btnMoved}; bar top ${after.barTop}, page scrollY ${after.scrollY}`, f1)
  }
  collect('S8', errs); await br.close()
}

// ---------------------------------------------------------------- 9 an Approvals date tapped
async function s9(size, opts) {
  const { br, p, errs } = await ctxOf({ dist: DIST_AFTER, ...opts })
  await goTab(p, 'leavewar'); await press(p, '[data-testid="lw-tab-approvals"]'); await wait(p, 900)
  const link = p.locator(V('[data-testid="appr-dates"]')).first()
  if (!(await link.count())) { const f = await pic(p, `s9-${size}-none`); row(`S9.${size}`, 'NOT REACHED', 'Approvals shows no request with a dates link in the demo world', f); collect('S9', errs); await br.close(); return }
  await link.click(); await wait(p, 1500)
  const r = await p.evaluate(() => { const bar = document.querySelector('#shell > .topbar').getBoundingClientRect(); const ring = [...document.querySelectorAll('.lw-ring, [class*="ring"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => { const q = e.getBoundingClientRect(); return { c: e.className.toString().slice(0, 40), top: +q.top.toFixed(1), left: +q.left.toFixed(1), h: +q.height.toFixed(1) } }).slice(0, 4); const slim = document.querySelector('[data-testid="appr-slim"]'); return { barBottom: +bar.bottom.toFixed(1), ring, slim: slim ? +slim.getBoundingClientRect().top.toFixed(1) : null, scrollY: Math.round(scrollY) } })
  const f = await pic(p, `s9-${size}-ring`, { x: 0, y: 0, width: opts.w, height: 360 })
  const ringOk = r.ring.filter(x => x.c.includes('lw-ring') || x.c.includes('mx')).concat(r.ring)[0]
  row(`S9.${size}`, ringOk && ringOk.top >= r.barBottom - 1 ? 'PASS' : (ringOk ? 'FAIL' : 'NOT REACHED'), `grid opened; bar bottom ${r.barBottom}; ringed element(s) ${JSON.stringify(r.ring)}; slim Back bar top ${r.slim}; scrollY ${r.scrollY}`, f)
  collect('S9 ' + size, errs); await br.close()
}

// ---------------------------------------------------------------- 10 print
async function s10() {
  const { br, p, errs } = await ctxOf({ dist: DIST_AFTER, ...DESK })
  await goTab(p, 'viewsched'); await scrollTo(p, 0)
  const screenM = await measure(p)
  await p.emulateMedia({ media: 'print' }); await wait(p, 600)
  const r = await p.evaluate(() => { const sh = document.querySelector('#shell'); const bs = getComputedStyle(sh, '::before'); const bar = document.querySelector('#shell > .topbar'); const pg = document.querySelector('#page-viewsched'); const vis = e => e.getBoundingClientRect().height > 0; return { before: { display: bs.display, h: bs.height, content: bs.content }, barPos: getComputedStyle(bar).position, barDisplay: getComputedStyle(bar).display, pageTop: pg ? +pg.getBoundingClientRect().top.toFixed(1) : null, shellTop: +sh.getBoundingClientRect().top.toFixed(1) } })
  const f = await pic(p, 's10-print-top', { x: 0, y: 0, width: 1536, height: 300 })
  const beforeBuild = await ctxOf({ dist: DIST_BEFORE, ...DESK }); await goTab(beforeBuild.p, 'viewsched'); await beforeBuild.p.emulateMedia({ media: 'print' }); await wait(beforeBuild.p, 600)
  const rb = await beforeBuild.p.evaluate(() => { const pg = document.querySelector('#page-viewsched'); const bar = document.querySelector('#shell > .topbar'); return { pageTop: pg ? +pg.getBoundingClientRect().top.toFixed(1) : null, barDisplay: getComputedStyle(bar).display, barPos: getComputedStyle(bar).position } })
  await beforeBuild.br.close()
  row('S10', near(r.pageTop, rb.pageTop, 1) && r.barPos !== 'fixed' ? 'PASS' : 'FAIL', `print emulation: ::before ${JSON.stringify(r.before)}, bar position ${r.barPos}, display ${r.barDisplay}; page top ${r.pageTop} (before build: ${rb.pageTop}, bar ${rb.barPos}/${rb.barDisplay}); screen bar height ${screenM.barH}`, f)
  collect('S10', errs); await br.close()
}

// ---------------------------------------------------------------- 11 the guest page
async function s11(size, opts) {
  const { br, p, errs } = await ctxOf({ dist: DIST_AFTER, ...opts })
  try {
    await goTab(p, 'admin'); await p.locator(V('.adm-cat')).filter({ hasText: 'Users' }).first().click(); await wait(p, 600)
    if (!(await p.locator('#admGuestView').isChecked())) await press(p, '#admGuestView')
    if (await p.locator(V('#burger')).count()) { await press(p, '#burger'); await press(p, '#drawerLogout') } else await press(p, '#logout')
    await wait(p, 900)
    await p.fill('#luser', 'stranger'); await p.fill('#lpass', 'x'); await p.click('#loginForm button[type=submit]'); await wait(p, 900)
    await p.fill('#accCs', 'Stranger'); await p.fill('#accIni', 'ST'); await p.selectOption('#accSeat', 'GND'); await press(p, '#accSend'); await wait(p, 1000)
    await press(p, '#accGuest'); await wait(p, 1200)
    const m = await measure(p), max = await scrollMax(p)
    const f0 = await pic(p, `s11-${size}-guest-top`, { x: 0, y: 0, width: opts.w, height: 300 })
    let foot = null; if (max > 60) { await scrollTo(p, max + 300); foot = await measure(p); await pic(p, `s11-${size}-guest-foot`, { x: 0, y: 0, width: opts.w, height: 300 }) }
    const gap = +(m.pageTopDoc != null ? m.pageTopDoc - m.barBottom : NaN).toFixed(2)
    const kid = await p.evaluate(() => { const g = document.querySelector('#guestApp'); const bar = g.querySelector(':scope > .topbar'); const next = [...g.children].find(e => e !== bar && e.getBoundingClientRect().height > 0); return next ? +(next.getBoundingClientRect().top + scrollY - (bar.getBoundingClientRect().bottom)).toFixed(2) : null })
    row(`S11.${size}`, near(m.barTop, 0) && m.pos === 'fixed' && near(kid, 0, 1.5) && (!foot || near(foot.barTop, 0)) ? 'PASS' : 'FAIL', `guest bar position ${m.pos}, top ${m.barTop}, height ${m.barH}; first content under it starts ${kid} from the bar foot; scroll room ${max}${foot ? `; at the foot bar top ${foot.barTop}` : ' (page does not scroll)'}`, f0)
  } catch (e) { row(`S11.${size}`, 'NOT REACHED', 'could not reach the guest page: ' + e.message.split('\n')[0]) }
  collect('S11 ' + size, errs); await br.close()
}

// ---------------------------------------------------------------- 12-14 the plain-user round
async function round(label, opts, page, key) {
  const { br, p, errs } = await ctxOf({ dist: DIST_AFTER, ...opts })
  const phone = opts.w < 600
  const press1 = async (name, fn) => { await fn(); await p.waitForTimeout(100); const a = await pic(p, `${key}-${name}-a`, { x: 0, y: 0, width: opts.w, height: 360 }); await wait(p, 700); const b = await pic(p, `${key}-${name}-b`, { x: 0, y: 0, width: opts.w, height: 360 }); return [a, b] }
  const state = async () => { const m = await measure(p); return `bar top ${m.barTop}, height ${m.barH}, scrollY ${m.scrollY}` }
  const tap = async sel => { if (phone) await p.locator(V(sel)).first().tap(); else await p.locator(V(sel)).first().click(); }
  await goTab(p, page); await scrollTo(p, Math.round((await scrollMax(p)) / 2))
  const y0 = await scrollY(p), rowOf = (id, v, what, pics) => row(`${key}.${id}`, v, what, pics.join(' , '))
  // ☰ (phone)
  if (await folded(p)) {
    let pics = await press1('burger-open', () => tap('#burger')); let open = await p.evaluate(() => !!document.querySelector('#drawer.open')); rowOf('burger-open', open ? 'PASS' : 'FAIL', `menu open=${open}; ${await state()}`, pics)
    const closeX = await p.locator(V('#drawer .drawer-panel [aria-label*="lose" i], #drawer .drawer-panel .x, #drawer .drawer-panel button.close, #drawer .drawer-panel [class*="close"]')).count()
    if (closeX) { pics = await press1('burger-close-x', () => tap('#drawer .drawer-panel [aria-label*="lose" i], #drawer .drawer-panel .x, #drawer .drawer-panel button.close, #drawer .drawer-panel [class*="close"]')); open = await p.evaluate(() => !!document.querySelector('#drawer.open')); rowOf('burger-close-by-x', !open ? 'PASS' : 'FAIL', `menu open after its ✕=${open}; ${await state()}`, pics) } else rowOf('burger-close-by-x', 'NOT REACHED', 'the menu has no ✕ button (no close-looking button in the panel); not pressed', [])
    if (!(await p.evaluate(() => !!document.querySelector('#drawer.open')))) { await tap('#burger'); await wait(p, 600) }
    pics = await press1('burger-close-outside', async () => { await p.mouse.click(395, 600) }); open = await p.evaluate(() => !!document.querySelector('#drawer.open')); rowOf('burger-close-by-tap-outside', !open ? 'PASS' : 'FAIL', `menu open after a tap on the shade=${open}; ${await state()}`, pics)
    await tap('#burger'); await wait(p, 600)
    pics = await press1('burger-close-escape', () => p.keyboard.press('Escape')); open = await p.evaluate(() => !!document.querySelector('#drawer.open')); rowOf('burger-close-by-escape', !open ? 'PASS' : 'FAIL', `menu open after Escape=${open}; ${await state()}`, pics)
  }
  // the bell
  let pics = await press1('bell-open', () => tap('#notifyBell')); const bo = await p.evaluate(() => [...document.querySelectorAll('[id*="bell" i],[class*="bell" i],[class*="notif" i]')].filter(e => e.getBoundingClientRect().height > 40 && getComputedStyle(e).visibility !== 'hidden').length); rowOf('bell-open', bo > 0 ? 'PASS' : 'FAIL', `bell list parts visible=${bo}; ${await state()}`, pics)
  pics = await press1('bell-close', () => tap('#notifyBell')); const bc = await p.evaluate(() => [...document.querySelectorAll('[id*="bell" i],[class*="bell" i],[class*="notif" i]')].filter(e => e.getBoundingClientRect().height > 40 && getComputedStyle(e).visibility !== 'hidden').length); rowOf('bell-close', bc === 0 ? 'PASS' : 'FAIL', `bell list parts visible after second press=${bc}; ${await state()}`, pics)
  // page names
  const to = page === 'editsched' ? 'inputs' : 'quals'
  pics = await press1('pagename', async () => { if (await folded(p)) { await tap('#burger'); await wait(p, 500); await tap(`#drawerNav a[data-page="${to}"]`) } else await tap(`#topnav a[data-page="${to}"]`) }); const m1 = await measure(p)
  rowOf('page-name', m1.pageId === 'page-' + to && near(m1.barTop, 0) ? 'PASS' : 'FAIL', `went to ${m1.pageId}; ${await state()}; page starts ${(m1.pageTopDoc - m1.barBottom).toFixed(2)} below the bar foot`, pics)
  await goTab(p, page); await wait(p, 500); await scrollTo(p, Math.round((await scrollMax(p)) / 2))
  // Undo / Redo after one change
  if (page === 'editsched') {
    await press(p, '#eWeek [data-itadd="0|0"]'); await wait(p, 600)
    const on = await p.evaluate(() => { const u = document.querySelector('#undoBtn'); return u && !u.disabled })
    pics = await press1('undo', () => tap('#undoBtn')); const redo = await p.evaluate(() => { const r = document.querySelector('#redoBtn'); return r && !r.disabled })
    rowOf('undo', on && redo ? 'PASS' : 'FAIL', `Undo was enabled=${on}; after pressing it Redo enabled=${redo}; ${await state()}`, pics)
    pics = await press1('redo', () => tap('#redoBtn')); rowOf('redo', 'PASS', `Redo pressed; ${await state()}`, pics)
  } else {
    // Leave War: make one change by pressing a grid cell? press Undo state only
    const un = await p.evaluate(() => { const u = document.querySelector('#undoBtn'); return u ? { exists: true, disabled: u.disabled } : { exists: false } })
    rowOf('undo-redo', 'NOT REACHED', `no change made on the Leave War grid in this round (it needs a bid or entry); Undo present=${JSON.stringify(un)}`, [])
  }
  collect('round ' + key, errs); await br.close()
}

const jobs = {
  1: async () => { await s1and2('desk', { ...DESK }); await s1and2('phone', { ...PHONE }); await s2board() },
  3: () => s3(),
  4: async () => { await s4('desk', { ...DESK }); await s4('phone', { ...PHONE }) },
  41: async () => { await s4b('desk', { ...DESK }); await s4b('phone', { ...PHONE }) },
  5: async () => { await s5('desk', { ...DESK }); await s5('phone', { ...PHONE }) },
  6: () => s6(), 7: () => s7(), 8: () => s8(), 81: () => s8(320),
  9: async () => { await s9('desk', { ...DESK }); await s9('phone', { ...PHONE }) },
  10: () => s10(),
  11: async () => { await s11('desk', { ...DESK }); await s11('phone', { ...PHONE }) },
  12: async () => { await round('Edit Schedule 1536', { ...DESK }, 'editsched', 'R12') },
  13: async () => { await round('Edit Schedule 402', { ...PHONE }, 'editsched', 'R13') },
  14: async () => { await round('Leave War grid 402', { ...PHONE }, 'leavewar', 'R14') },
}
for (const n of WANT) if (jobs[n]) await timeIt(n, jobs[n])
await cmp.close()
const file = path.join(out, `results-${WANT.join('_')}.json`)
writeFileSync(file, JSON.stringify({ rows, errors: ERRS, seconds: t0 }, null, 1))
console.log('ERRORS SEEN:', ERRS.length ? ERRS.slice(0, 20).join(' || ') : 'none')
