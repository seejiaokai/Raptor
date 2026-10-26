// Walker 3, section E (scenarios 46-51): the grid's order, the open outline, the frozen header, the Manning fold's memory.
import * as L from './lw-m2-walk-3-lib.mjs'
import { writeFileSync } from 'node:fs'
const { T, tap, vis, txt, rec, shot } = L
const only = process.argv.slice(2).map(Number)
const want = n => !only.length || only.includes(n)
const all = []
const run = async (n, fn) => { if (!want(n)) return; try { await fn() } catch (e) { L.rec(n, '?', 'NOT RUN', 'script error: ' + String(e).slice(0, 300)) } }
const manningOpen = w => w.page.evaluate(() => !!document.querySelector('[data-testid="fly-row-req-p"]'))
const keys = w => w.page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('lw:manning')).map(k => k + '=' + localStorage.getItem(k)))
const R = b => b && [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]

await run(46, async () => {
  for (const size of ['desk', 'phone']) {
    const w = await L.newWorld(size); await L.signIn(w, 'admin')
    await tap(w, T('month-JAN')); await w.page.waitForTimeout(900)
    if (!(await manningOpen(w))) { await tap(w, T('counts-toggle')); await w.page.waitForTimeout(500) }
    await w.page.evaluate(() => window.scrollTo(0, 0)); await w.page.waitForTimeout(200)
    const ids = ['month-strip', 'head-2026-01-01', 'fly-row-req-p', 'fly-row-req-w', 'fly-row-avail-p', 'fly-row-avail-w', 'event-row-0', 'event-row-1', 'row-dice']
    const y = {}; for (const i of ids) { const b = await L.boxOf(w.page, T(i)); y[i] = b ? b.y : null }
    const ordered = ids.every((i, k) => y[i] != null && (k === 0 || y[i] > y[ids[k - 1]]))
    const info = await w.page.evaluate(() => {
      const head = document.querySelector('[data-testid="head-2026-01-01"]')
      const rows = [...document.querySelectorAll('table.mx tbody.mxhead tr')].length
      const th = head ? head.innerText.replace(/\s+/g, ' ').trim() : null
      // any row of the grid whose only text is a month name (a band row)
      const band = [...document.querySelectorAll('table.mx tr')].filter(tr => /^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s*$/i.test(tr.innerText.trim()) && !tr.querySelector('[data-testid^="cell-"]')).length
      return { rows, th, band, figures: /FIGURES|Balances/i.test(document.querySelector('table.mx').innerText) }
    })
    await shot(w, `s46-${size}-order`)
    const ok = ordered && /JAN/.test(info.th || '') && /THU/.test(info.th || '') && /01/.test(info.th || '') && info.band === 0 && !info.figures
    rec(46, size === 'desk' ? 'desk1536' : 'phone390', ok ? 'PASS' : 'FAIL', `y of month buttons/dates/Req P/Req W/Avail P/Avail W/Event 1/Event 2/first person: ${ids.map(i => Math.round(y[i])).join(' < ')} (ordered=${ordered}); first date reads "${info.th}"; month-band rows=${info.band}; header rows=${info.rows}; "FIGURES"/"Balances" text in grid=${info.figures}`, [`s46-${size}-order.png`])
    w.errs.forEach(x => all.push('46: ' + x)); await w.ctx.close()
  }
})

await run(47, async () => {
  for (const size of ['desk', 'phone']) {
    const w = await L.newWorld(size); await L.signIn(w, 'admin')
    await tap(w, T('month-JAN')); await w.page.waitForTimeout(900)
    if (!(await manningOpen(w))) { await tap(w, T('counts-toggle')); await w.page.waitForTimeout(500) }
    const measure = async (tag) => {
      await w.page.evaluate(() => window.scrollTo(0, 700)); await w.page.waitForTimeout(500)
      const m = await w.page.evaluate(() => {
        const sh = document.querySelector('[data-testid="sticky-head"]'); if (!sh) return { stuck: false }
        const ths = [...sh.querySelectorAll('th')].filter(e => e.getBoundingClientRect().width > 0 && /\d\d\s*$/.test(e.innerText.trim()))
        const out = ths.slice(0, 10).map(e => { const day = e.innerText.trim().match(/(\d\d)\s*$/)[1]; const iso = '2026-01-' + day; const c = document.querySelector('[data-testid="cell-dice-' + iso + '"]'); const a = e.getBoundingClientRect(), b = c ? c.getBoundingClientRect() : null; return [iso, Math.round(a.x + a.width / 2), b ? Math.round(b.x + b.width / 2) : null, Math.round(a.width), b ? Math.round(b.width) : null] })
        const hb = sh.getBoundingClientRect()
        return { stuck: true, text: sh.innerText.replace(/\s+/g, ' ').slice(0, 160), top: Math.round(hb.top), h: Math.round(hb.height), out, manningInHeader: /Required|Avail|Manning/i.test(sh.innerText) }
      })
      return m
    }
    const m1 = await measure('z1'); await shot(w, `s47-${size}-scrolled-zoom-default`)
    const aligned = m => m.stuck && m.out.length && m.out.every(r => r[2] == null || Math.abs(r[1] - r[2]) <= 3)
    const m1ok = aligned(m1) && !m1.manningInHeader && !/FIGURES|Balances/i.test(m1.text || '')
    rec(47, size === 'desk' ? 'desk1536' : 'phone390', m1ok ? 'PASS' : 'FAIL', `scrolled 700px at the start zoom: frozen header present=${m1.stuck}, top ${m1.top}, height ${m1.h}, text "${m1.text}", dates vs their columns (iso, header centre x, column centre x): ${JSON.stringify(m1.out && m1.out.slice(0, 4))}, aligned within 3px=${aligned(m1)}, Manning/figures in header=${m1.manningInHeader}`, [`s47-${size}-scrolled-zoom-default.png`])
    await w.page.evaluate(() => window.scrollTo(0, 0))
    await tap(w, T('lw-zoom-out')); await w.page.waitForTimeout(500)
    const m2 = await measure('z2'); await shot(w, `s47-${size}-scrolled-one-step-out`)
    rec(47, size === 'desk' ? 'desk1536' : 'phone390', aligned(m2) ? 'PASS' : 'FAIL', `one zoom step out, scrolled: stuck=${m2.stuck}; dates vs columns ${JSON.stringify(m2.out && m2.out.slice(0, 4))}, aligned=${aligned(m2)}`, [`s47-${size}-scrolled-one-step-out.png`])
    // toggle Manning while scrolled
    await w.page.evaluate(() => window.scrollTo(0, 700)); await w.page.waitForTimeout(300)
    const before = await manningOpen(w)
    await tap(w, T('counts-toggle')); await w.page.waitForTimeout(600)
    const after = await manningOpen(w)
    const m3 = await measure('z3'); await shot(w, `s47-${size}-manning-toggled-scrolled`)
    rec(47, size === 'desk' ? 'desk1536' : 'phone390', before !== after && aligned(m3) ? 'PASS' : 'FAIL', `Manning toggled while scrolled (${before} -> ${after}); header stuck=${m3.stuck}, dates vs columns ${JSON.stringify(m3.out && m3.out.slice(0, 4))}, aligned=${aligned(m3)}`, [`s47-${size}-manning-toggled-scrolled.png`])
    w.errs.forEach(x => all.push('47: ' + x)); await w.ctx.close()
  }
})

await run(48, async () => {
  for (const size of ['desk', 'phone']) {
    const w = await L.newWorld(size); await L.signIn(w, 'admin')
    // open November for the admin (the demo has nothing open from today)
    await tap(w, T('open-chip')); await w.page.waitForSelector(T('open-dates')); await w.page.waitForTimeout(300)
    await tap(w, T('od-month-2026-11')); await w.page.waitForTimeout(400)
    if (await vis(w.page, T('open-dates-close'))) { await tap(w, T('open-dates-close')); await w.page.waitForTimeout(400) }
    await tap(w, T('month-NOV')); await w.page.waitForTimeout(900)
    await w.page.evaluate(() => window.scrollTo(0, 0)); await w.page.waitForTimeout(300)
    const geo = async () => w.page.evaluate(() => {
      const bb = [...document.querySelectorAll('[data-testid="bid-box"]')].map(e => { const r = e.getBoundingClientRect(); return { from: e.dataset.from, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom) } })
      const head = document.querySelector('table.mx [data-testid^="head-"]'); const hr = head && head.getBoundingClientRect()
      const rows = [...document.querySelectorAll('table.mx [data-testid^="row-"]')]; const last = rows[rows.length - 1]; const lr = last && last.getBoundingClientRect()
      return { bb, headTop: hr && Math.round(hr.top), lastBottom: lr && Math.round(lr.bottom), lastId: last && last.dataset.testid, manning: !!document.querySelector('[data-testid="fly-row-req-p"]') }
    })
    if (!(await manningOpen(w))) { await tap(w, T('counts-toggle')); await w.page.waitForTimeout(500) }
    const g1 = await geo(); await shot(w, `s48-${size}-manning-open`)
    await tap(w, T('counts-toggle')); await w.page.waitForTimeout(700)
    const g2 = await geo(); await shot(w, `s48-${size}-manning-folded`)
    await tap(w, T('counts-toggle')); await w.page.waitForTimeout(700)
    const g3 = await geo(); await shot(w, `s48-${size}-manning-open-again`)
    const okOne = g => g.bb.length >= 1 && Math.abs(g.bb[0].y - g.headTop) <= 6 && Math.abs(g.bb[0].bottom - g.lastBottom) <= 8
    const ok = okOne(g1) && okOne(g2) && okOne(g3) && g1.manning && !g2.manning && g3.manning
    rec(48, size === 'desk' ? 'desk1536' : 'phone390', ok ? 'PASS' : 'FAIL', `outline vs date row top and last person (${g1.lastId}) bottom — open: ${JSON.stringify(g1.bb.slice(0, 1))} head top ${g1.headTop} last bottom ${g1.lastBottom}; folded: ${JSON.stringify(g2.bb.slice(0, 1))} head ${g2.headTop} last ${g2.lastBottom}; unfolded again: ${JSON.stringify(g3.bb.slice(0, 1))} head ${g3.headTop} last ${g3.lastBottom}; outline count ${g1.bb.length}`, [`s48-${size}-manning-open.png`, `s48-${size}-manning-folded.png`, `s48-${size}-manning-open-again.png`])
    w.errs.forEach(x => all.push('48: ' + x)); await w.ctx.close()
  }
})

await run(49, async () => {
  const w = await L.newWorld('phone')
  const log = []
  const stage = async (who, tag, doToggle) => {
    await L.signIn(w, who, who === 'member' ? '2026-01-05' : undefined)
    const start = await manningOpen(w)
    let afterToggle = null
    if (doToggle) { await tap(w, T('counts-toggle')); await w.page.waitForTimeout(500); afterToggle = await manningOpen(w) }
    log.push(`${tag}: ${who} starts ${start ? 'OPEN' : 'folded'}${doToggle ? ' -> after tap ' + (afterToggle ? 'OPEN' : 'folded') : ''}; keys ${JSON.stringify(await keys(w))}`)
    await shot(w, `s49-${tag}`)
    return { start, afterToggle }
  }
  const a1 = await stage('admin', 'a1-first-sign-in-open-it', true)
  const a2 = await stage('admin', 'a2-admin-reload', false)
  const u1 = await stage('member', 'u1-member-first-sign-in-open-then-fold', true)
  // fold it again
  await tap(w, T('counts-toggle')); await w.page.waitForTimeout(400); const u1b = await manningOpen(w); log.push(`u1b: member folds again -> ${u1b ? 'OPEN' : 'folded'}; keys ${JSON.stringify(await keys(w))}`)
  const a3 = await stage('admin', 'a3-admin-back', false)
  const u2 = await stage('member', 'u2-member-back', false)
  const ks = await keys(w)
  const emptyKey = ks.some(k => /^lw:manning:(=|$)/.test(k))
  const ok = a1.start === false && a1.afterToggle === true && a2.start === true && u1.start === false && u1b === false && a3.start === true && u2.start === false && !emptyKey && ks.length >= 2
  rec(49, 'phone390', ok ? 'PASS' : 'FAIL', `${log.join(' | ')} ; final keys ${JSON.stringify(ks)}; a key with no person=${emptyKey}`, ['s49-a1-first-sign-in-open-it.png', 's49-u1-member-first-sign-in-open-then-fold.png', 's49-a3-admin-back.png'])
  w.errs.forEach(x => all.push('49: ' + x)); await w.ctx.close()
})

await run(50, async () => {
  const w = await L.newWorld('desk'); await L.signIn(w, 'admin')
  const s0 = await manningOpen(w)
  await tap(w, T('counts-toggle')); await w.page.waitForTimeout(500)
  const s1 = await manningOpen(w); const k1 = await keys(w)
  await L.signIn(w, 'admin')
  const s2 = await manningOpen(w); const k2 = await keys(w)
  await shot(w, 's50-desk-after-reload')
  // a phone-remembered "folded" for this person must not fold a desktop either
  await w.page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('lw:manning:')) localStorage.setItem(k, 'folded') })
  await L.signIn(w, 'admin')
  const s3 = await manningOpen(w)
  rec(50, 'desk1536', s0 && !s1 && s2 && s3 ? 'PASS' : 'FAIL', `desktop opens with Manning ${s0 ? 'OPEN' : 'folded'}; toggled -> ${s1 ? 'OPEN' : 'folded'} (keys ${JSON.stringify(k1)}); after reload ${s2 ? 'OPEN' : 'folded'} (keys ${JSON.stringify(k2)}); with a stored 'folded' for him, reload -> ${s3 ? 'OPEN' : 'folded'}`, ['s50-desk-after-reload.png'])
  w.errs.forEach(x => all.push('50: ' + x)); await w.ctx.close()
})

await run(51, async () => {
  const w = await L.newWorld('phone'); await L.signIn(w, 'admin')
  const a = await manningOpen(w)
  await w.page.setViewportSize({ width: 844, height: 390 }); await w.page.waitForTimeout(900)
  const b = await manningOpen(w); await shot(w, 's51-landscape')
  await w.page.setViewportSize({ width: 390, height: 844 }); await w.page.waitForTimeout(900)
  const c = await manningOpen(w); await shot(w, 's51-back-portrait')
  const gap = await w.page.evaluate(() => { const h = document.querySelector('table.mx [data-testid^="head-"]'); const e = document.querySelector('[data-testid="event-row-0"]'); return h && e ? Math.round(e.getBoundingClientRect().top - h.getBoundingClientRect().bottom) : null })
  rec(51, 'phone390<->844', !a && !b && !c && gap != null && gap < 12 ? 'PASS' : 'FAIL', `Manning folded=${!a}; after turning to 844 wide: ${b ? 'OPEN' : 'folded'}; back to 390: ${c ? 'OPEN' : 'folded'}; gap between the date row and Event 1 ${gap}px (no blank band)`, ['s51-landscape.png', 's51-back-portrait.png'])
  w.errs.forEach(x => all.push('51: ' + x)); await w.ctx.close()
})

writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-leave-war-overhaul-e11c0a/41598151-b62f-4130-886a-f6dcd3903085/scratchpad/w3-e.out.json', JSON.stringify({ results: L.results, errs: all }, null, 1))
console.log('ERRORS', JSON.stringify(all))
await L.closeBrowser()
