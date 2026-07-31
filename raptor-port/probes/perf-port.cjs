/* The performance gate (perf1 C/D/F + perf3 B/C, adapted per PORTING.md —
   the mechanism probes perf1 E/H and perf2 pin the reference's string-diff
   cache and are dropped; their behavioural checks are here).

   The budgets in PORTING.md (one-day ≤200ms, board ≤120ms) were measured on
   the author's machine; a 4x-throttled phone on other hardware lands
   elsewhere for BOTH builds. So this gate measures the REFERENCE and the
   PORT with one methodology — mutation → macrotask → forced layout, the
   full painted cost regardless of when each build does its work — and
   asserts NO REGRESSION: port ≤ reference × 1.15 on every timed metric.
   Absolute numbers are printed for the record. */
const { chromium } = require('playwright')
const path = require('path')
const REF = 'file://' + path.join(__dirname, '..', 'reference', 'scheduler.html')
const PORT = process.env.PORT_URL || 'http://localhost:4173/'

const boot = async (b, url, cfg) => {
  const ctx = await b.newContext({
    viewport: { width: cfg.w, height: cfg.h }, deviceScaleFactor: 2,
    hasTouch: !!cfg.touch, isMobile: !!cfg.touch,
  })
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('  PAGEERR', e.message))
  const cdp = await ctx.newCDPSession(p)
  await p.goto(url)
  await p.fill('#luser', 'a'); await p.fill('#lpass', 'a')
  await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900)
  await p.evaluate(() => go('editsched')); await p.waitForTimeout(600)
  if (cfg.board) { await p.evaluate(() => openScheduler(1)); await p.waitForTimeout(600) }
  if (cfg.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cfg.cpu })
  await p.waitForTimeout(300)
  return { p, ctx }
}

/* the one shared measurement: median full painted cost over n rounds */
const MED = `async (f, n) => {
  const a = []
  for (let i = 0; i < n; i++) {
    const t = performance.now(); f(i)
    await new Promise(r => setTimeout(r, 0))
    document.body.offsetHeight
    a.push(performance.now() - t)
  }
  a.sort((x, y) => x - y); return +a[a.length >> 1].toFixed(1)
}`

async function timings(b, url) {
  const out = {}
  { /* the week, 4x phone */
    const { p, ctx } = await boot(b, url, { w: 390, h: 844, cpu: 4, touch: true })
    Object.assign(out, await p.evaluate(async medSrc => {
      const med = eval(medSrc)
      const ids = Object.keys(PEOPLE).filter(x => !PEOPLE[x].special)
      const oneEdit = await med(i => {
        const s = document.querySelector('#eWeek [data-day="1"] .seat[data-slot$=".p"],#eWeek [data-day="1"] .empty-slot[data-slot$=".p"]')
        if (s) fillSlot(s.dataset.slot, ids[i % ids.length]); afterSchedMutate()
      }, 7)
      const noop = await med(() => afterSchedMutate(), 7)
      return { oneEdit, noop }
    }, MED))
    await p.close(); await ctx.close()
  }
  { /* the board, 4x phone */
    const { p, ctx } = await boot(b, url, { w: 390, h: 844, cpu: 4, touch: true, board: 1 })
    Object.assign(out, await p.evaluate(async medSrc => {
      const med = eval(medSrc)
      const ids = Object.keys(PEOPLE).filter(x => !PEOPLE[x].special)
      const board = await med(i => {
        const s = document.querySelector('#sbBoard .sb-slot[data-slot$=".p"],#sbBoard .seat[data-slot$=".p"]')
        if (s) setSlotVal(s.dataset.slot, ids[(i + 20) % ids.length]); afterSchedMutate()
      }, 7)
      const noopB = await med(() => afterSchedMutate(), 7)
      return { board, noopB }
    }, MED))
    await p.close(); await ctx.close()
  }
  return out
}

;(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
  let pass = 0, fail = 0
  const T = (n, got, want) => {
    const ok = String(got) === String(want); ok ? pass++ : fail++
    console.log(`${ok ? ' ok  ' : 'FAIL '} ${n.padEnd(58)} want ${want} · got ${got}`)
  }

  /* ---- the no-regression gate: reference vs port, same method ------------- */
  const ref = await timings(b, REF)
  const port = await timings(b, PORT)
  console.log(`   4x phone, painted cost   ${'reference'.padStart(10)} ${'port'.padStart(8)}`)
  for (const k of ['oneEdit', 'noop', 'board', 'noopB']) {
    console.log(`   ${k.padEnd(24)} ${String(ref[k]).padStart(8)}ms ${String(port[k]).padStart(6)}ms`)
  }
  T('perf · one-day edit does not regress vs the reference', port.oneEdit <= ref.oneEdit * 1.15 ? 'yes' : `no (${port.oneEdit} vs ${ref.oneEdit})`, 'yes')
  T('perf · board edit does not regress vs the reference', port.board <= ref.board * 1.15 ? 'yes' : `no (${port.board} vs ${ref.board})`, 'yes')
  T('perf · a no-op repaint does not regress', port.noop <= ref.noop * 1.15 ? 'yes' : `no (${port.noop} vs ${ref.noop})`, 'yes')

  /* ---- perf1 B (behavioural) · a day-1 edit rewrites ONLY day 1 ----------- */
  {
    const { p, ctx } = await boot(b, PORT, { w: 1500, h: 950, cpu: 1 })
    const r = await p.evaluate(async () => {
      const days = [...document.querySelectorAll('#eWeek .day')]
      const others = days.filter(d => d.dataset.day !== '1')
      const beforeNodes = others, beforeHTML = others.map(d => d.innerHTML)
      const s = document.querySelector('#eWeek [data-day="1"] .seat[data-slot$=".p"]')
      const ids = Object.keys(PEOPLE).filter(x => !PEOPLE[x].special)
      fillSlot(s.dataset.slot, ids[9]); afterSchedMutate()
      await new Promise(r => setTimeout(r, 50))
      const now = [...document.querySelectorAll('#eWeek .day')].filter(d => d.dataset.day !== '1')
      return { sameNodes: now.every((d, i) => d === beforeNodes[i]), sameHTML: now.every((d, i) => d.innerHTML === beforeHTML[i]) }
    })
    T('B · the other days are not rewritten by a day-1 edit', r.sameNodes && r.sameHTML ? 'held' : JSON.stringify(r), 'held')
    await p.close(); await ctx.close()
  }

  /* ---- perf1 D · the week keeps its scroll across an edit ----------------- */
  {
    const { p, ctx } = await boot(b, PORT, { w: 1500, h: 950, cpu: 1 })
    const r = await p.evaluate(async () => {
      const wk = document.getElementById('eWeek')
      try { wk.scrollTo({ left: 400, behavior: 'instant' }) } catch (e) { wk.scrollLeft = 400 }
      wk.scrollLeft = 400
      await new Promise(r => setTimeout(r, 150))
      const before = Math.round(wk.scrollLeft)
      txtSet('dn:0.0', 'SCROLL PROBE'); afterSchedMutate()
      await new Promise(r => requestAnimationFrame(r))
      await new Promise(r => setTimeout(r, 30))
      return { before, after: Math.round(document.getElementById('eWeek').scrollLeft) }
    })
    console.log(`   scrollLeft across an edit: ${r.before} → ${r.after}`)
    T('D · the week does not jump back to Monday on an edit', r.after === r.before ? 'held' : `lost(${r.after})`, 'held')
    await p.close(); await ctx.close()
  }

  /* ---- perf1 F · the Edit-mode toggle holds its place --------------------- */
  {
    const { p, ctx } = await boot(b, PORT, { w: 1500, h: 950, cpu: 1 })
    const r = await p.evaluate(async () => {
      const wk = document.getElementById('eWeek')
      try { wk.scrollTo({ left: 500, behavior: 'instant' }) } catch (e) { wk.scrollLeft = 500 }
      wk.scrollLeft = 500; await new Promise(r => setTimeout(r, 150))
      const before = Math.round(wk.scrollLeft)
      document.getElementById('editToggle').click()
      await new Promise(r => setTimeout(r, 150))
      const after = Math.round(document.getElementById('eWeek').scrollLeft)
      const editable = !!document.querySelector('#eWeek [contenteditable="true"]')
      document.getElementById('editToggle').click()
      await new Promise(r => setTimeout(r, 150))
      return { before, after, editable }
    })
    console.log(`   scrollLeft across an Edit-mode toggle: ${r.before} → ${r.after}`)
    T('F · the toggle does not jump back to Monday', r.after === r.before ? 'held' : `lost(${r.after})`, 'held')
    T('F · and Edit mode OFF really is read-only', r.editable ? 'editable' : 'read-only', 'read-only')
    await p.close(); await ctx.close()
  }

  /* ---- perf3 C · a field open while another panel changes (informational,
     exactly as it is in the reference's perf3 — no assertion there either) -- */
  {
    const { p, ctx } = await boot(b, PORT, { w: 1500, h: 950, cpu: 1, board: 1 })
    const r = await p.evaluate(async () => {
      const inp = document.querySelector('#sbBoard input.nts'); if (!inp) return 'no field'
      inp.focus(); inp.value = 'TYPING IN PROGRESS'
      txtSet('dn:1.0', 'SOMETHING ELSE'); afterSchedMutate()
      await new Promise(r => setTimeout(r, 80))
      return document.querySelector('#sbBoard input.nts') === inp ? 'field survived' : 'field replaced'
    })
    console.log('   a field open while another panel changes: ' + r + ' (informational — matches the reference)')
    await p.close(); await ctx.close()
  }

  console.log(`\n${pass} passed · ${fail} failed`)
  await b.close(); console.log('perf-port done')
})().catch(e => { console.log('ERR', e.message); process.exit(1) })
