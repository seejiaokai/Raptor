/* The performance gate (perf1 C/D/F + perf3 B/C, adapted per PORTING.md —
   the mechanism probes perf1 E/H and perf2 pin the reference's string-diff
   cache and are dropped; their behavioural checks are here).

   The budgets in PORTING.md (one-day ≤200ms, board ≤120ms) were measured on
   the author's machine; a 4x-throttled phone on other hardware lands
   elsewhere for BOTH builds. So this gate measures the REFERENCE and the
   PORT with one methodology — mutation → macrotask → forced layout, the
   full painted cost regardless of when each build does its work — and
   asserts NO REGRESSION against the reference measured beside it.
   Absolute numbers are printed for the record.

   THE BUDGET IS PER NODE, NOT PER REPAINT (owner, 5 Aug 26). It used to be
   a flat `port ≤ reference × 1.15` on the raw times, and the board went red
   at 1.19× — not because anything had got slower, but because the port's
   board is no longer the reference's board: it draws 1.78× the nodes (the
   stores chips, the personal-inputs group, the day-version selects). A flat
   ratio between two builds drawing different amounts of DOM measures FEATURE
   GROWTH, and would keep going red for every feature added while saying
   nothing about speed. Dividing by the node ratio asks the question the gate
   was always for — is a unit of drawing getting more expensive — and the
   board answers 0.67×, i.e. comfortably faster per node.

   WHY THE COMPANION DOM CEILING. Per-node alone has an obvious hole: a bug
   that doubles the DOM would halve the per-node cost and sail through, while
   the user waits twice as long. So node counts are gated too — separately,
   because they are the one measurement here that is NOT machine-dependent.
   Times swing 3x on this VM and must be read as a ratio against a reference
   measured in the same seconds; a node count is the same integer everywhere,
   so it is checked against a recorded number instead. Growth past the
   ceiling is not automatically a fault — it is a prompt to look at the time
   and then raise the ceiling deliberately, in the PR that adds the nodes.

   HOW IT SURVIVES A NOISY MACHINE. This gate used to fail ~2 runs in 5 (3 in
   5 when it was measured for this rewrite), at the SAME rate on an unchanged
   baseline: the flakiness was the estimator, not the code under test. On this
   container one round of the one-day edit reads anywhere from 210 to 830 ms
   on the SAME build, so the question is never "how fast is it" but "how do
   you compare two builds through that much noise". Three things do it:

   · BOTH BUILDS OPEN AT ONCE, measured round for round — reference round 1,
     port round 1, reference round 2, port round 2… The old run measured all
     of the reference and then all of the port, ~15 seconds apart, and the
     machine load in those two windows is simply not the same. That gap was
     most of the flakiness. Alternating puts both builds under one machine.
   · MINIMUM of the per-trial medians, not a single median. Scheduler noise
     is strictly ADDITIVE — nothing makes a repaint faster than it really is
     — so the fastest trial is the closest reading of the true cost, and more
     trials only sharpen it. A single trial's median is a median of one
     noisy sample.
   · a WARMUP: the first two rounds of every metric are run and thrown away,
     so first-paint and JIT are not counted as steady state.

   PERF_TRIALS (default 3) sets the trial count; every trial is printed, so a
   wide spread stays visible instead of being averaged away. */
const { chromium } = require('playwright')
const path = require('path')
const REF = 'file://' + path.join(__dirname, '..', 'reference', 'scheduler.html')
const PORT = process.env.PORT_URL || 'http://localhost:4173/'
const TRIALS = Math.max(1, +(process.env.PERF_TRIALS || 3))
const KEYS = ['oneEdit', 'noop', 'board', 'noopB']

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

/* ROUNDS measured rounds after WARM discarded ones, per metric per trial */
const WARM = 2, ROUNDS = 7

/* one round, run inside the page: mutate → macrotask → forced layout. The
   whole painted cost, whenever each build chooses to do the work. */
const round = (page, src, i) => page.evaluate(async ([s, idx]) => {
  const f = eval(s)
  /* the roster list is scenery, not the thing being timed — build it once and
     leave it out of the measured window, as the original did */
  const w = window
  if (!w.__ids) w.__ids = Object.keys(PEOPLE).filter(x => !PEOPLE[x].special)
  const t = performance.now(); f(idx)
  await new Promise(r => setTimeout(r, 0))
  document.body.offsetHeight
  return +(performance.now() - t).toFixed(1)
}, [src, i])

/* the mutations, as source so both builds run the identical body */
const METRICS = {
  week: {
    oneEdit: `i => {
      const s = document.querySelector('#eWeek [data-day="1"] .seat[data-slot$=".p"],#eWeek [data-day="1"] .empty-slot[data-slot$=".p"]')
      if (s) fillSlot(s.dataset.slot, window.__ids[i % window.__ids.length]); afterSchedMutate()
    }`,
    noop: `() => afterSchedMutate()`,
  },
  board: {
    board: `i => {
      const s = document.querySelector('#sbBoard .sb-slot[data-slot$=".p"],#sbBoard .seat[data-slot$=".p"]')
      if (s) setSlotVal(s.dataset.slot, window.__ids[(i + 20) % window.__ids.length]); afterSchedMutate()
    }`,
    noopB: `() => afterSchedMutate()`,
  },
}

const median = a => { const s = [...a].sort((x, y) => x - y); return +s[s.length >> 1].toFixed(1) }

/* ONE trial: both builds open at the same time, measured round for round.
   This is the part that matters. Measuring all of the reference and then all
   of the port means ~15 seconds separate the two samples, and on a shared VM
   the load in those two windows is simply not the same — that difference
   went straight into the ratio and was the whole of the old flakiness.
   Alternating round by round puts both builds under the same machine. */
/* how much there is to draw, so a ratio is never read without it. The gate
   assumes the two builds are doing the same work; where they are not, the
   number to look at first is this one, not the milliseconds. */
const SIZE = { week: '#eWeek', board: '#sbBoard' }
const sizeOf = (page, sel) => page.evaluate(s => {
  const el = document.querySelector(s)
  return el ? { nodes: el.querySelectorAll('*').length, chars: el.innerHTML.length } : { nodes: -1, chars: -1 }
}, sel)

async function trial(b, measureSize) {
  const out = {}
  for (const [surface, metrics] of Object.entries(METRICS)) {
    const cfg = { w: 390, h: 844, cpu: 4, touch: true, board: surface === 'board' }
    const R = await boot(b, REF, cfg), P = await boot(b, PORT, cfg)
    if (measureSize) {
      out.size = out.size || {}
      out.size[surface] = { ref: await sizeOf(R.p, SIZE[surface]), port: await sizeOf(P.p, SIZE[surface]) }
    }
    for (const [name, src] of Object.entries(metrics)) {
      const a = { ref: [], port: [] }
      for (let i = 0; i < ROUNDS + WARM; i++) {
        const r = await round(R.p, src, i)
        const p = await round(P.p, src, i)
        if (i >= WARM) { a.ref.push(r); a.port.push(p) }
      }
      out[name] = { ref: median(a.ref), port: median(a.port) }
    }
    for (const x of [R, P]) { await x.p.close(); await x.ctx.close() }
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
  const trials = []
  for (let t = 0; t < TRIALS; t++) {
    trials.push(await trial(b, t === 0))
    console.log(`   trial ${t + 1}/${TRIALS}  ` + KEYS.map(k => {
      const x = trials[t][k]; return `${k} ${x.ref}/${x.port}`
    }).join(' · ') + '   (ref/port ms)')
  }
  /* The gate is a RATIO, and the only ratio worth trusting is one whose two
     halves were measured under the same machine — so it is computed inside
     each trial and then taken across trials, never by pairing the
     reference's luckiest trial with the port's unluckiest. The median trial
     is the verdict; the absolute times printed are each build's own best,
     for the record only. */
  const ratios = Object.fromEntries(KEYS.map(k =>
    [k, trials.map(x => x[k].port / x[k].ref).sort((a, c) => a - c)]))
  const verdict = k => ratios[k][ratios[k].length >> 1]
  const best = who => Object.fromEntries(KEYS.map(k => [k, Math.min(...trials.map(x => x[k][who]))]))
  const ref = best('ref'), port = best('port')
  /* which surface each metric repaints — the per-node divisor below is the
     ratio for THAT surface, and the two grew by very different amounts
     (the board by 1.78×, the week by 1.20× when the weekend arrived) */
  const SURFACE = { oneEdit: 'week', noop: 'week', board: 'board', noopB: 'board' }
  const size = (trials[0] || {}).size || {}
  const nodeRatio = k => {
    const s = size[SURFACE[k]]
    return s && s.ref.nodes > 0 ? s.port.nodes / s.ref.nodes : 1
  }
  const perNode = k => verdict(k) / nodeRatio(k)
  console.log(`\n   4x phone, painted cost   ${'reference'.padStart(10)} ${'port'.padStart(8)}   ratio  per node  (median of ${TRIALS} trials)`)
  for (const k of KEYS) {
    console.log(`   ${k.padEnd(24)} ${String(ref[k]).padStart(8)}ms ${String(port[k]).padStart(6)}ms  ${verdict(k).toFixed(2)}×`
      + `    ${perNode(k).toFixed(2)}×   [${ratios[k].map(r => r.toFixed(2)).join(' ')}]`)
  }
  /* read this BEFORE the ratios: a ratio of two builds drawing different
     amounts of DOM is not a statement about rendering speed */
  for (const [surface, s] of Object.entries(size)) {
    console.log(`   ${(surface + ' DOM').padEnd(24)} ${String(s.ref.nodes).padStart(8)}n ${String(s.port.nodes).padStart(6)}n  `
      + `${(s.port.nodes / s.ref.nodes).toFixed(2)}× the nodes, ${(s.port.chars / s.ref.chars).toFixed(2)}× the markup`)
  }
  const noRegress = (k, label) => T(`perf · ${label} costs no more per node than the reference`,
    perNode(k) <= 1.15 ? 'yes' : `no (${perNode(k).toFixed(2)}x per node, ${verdict(k).toFixed(2)}x total)`, 'yes')
  noRegress('oneEdit', 'one-day edit')
  noRegress('board', 'board edit')
  noRegress('noop', 'a no-op repaint')

  /* The machine-independent half of the budget. Recorded 5 Aug 26 on the
     demo week with day 1 open: board 699 nodes, week 5028 — about 10%
     headroom each, so ordinary tinkering does not trip it but a surface
     growing by half does. Raising a number here is a deliberate edit that
     belongs in the PR that adds the nodes, next to a fresh `npm run perf`
     showing the per-node cost held. */
  const DOM_CEILING = { week: 5530, board: 770 }
  for (const [surface, s] of Object.entries(size)) {
    const cap = DOM_CEILING[surface]
    T(`perf · the ${surface} stays under its recorded DOM ceiling (${cap})`,
      s.port.nodes <= cap ? 'yes' : `no (${s.port.nodes} nodes)`, 'yes')
  }

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
      /* THE ONE LEGITIMATE COUPLING (owner, 6 Aug 26). A crew-rest breach is
         marked on the day that CAUSED it, so the day before day 1 renders a
         dotted ring and a cross-day row addressed to day 1's warning by index —
         and a day-1 edit that changes that warning must therefore rewrite that
         day too, or the strip would point at a warning that has moved. Any
         OTHER day changing is still the bug this probe was written for, so the
         exemption is named exactly: the day day-1's own trace is filed under. */
      const traced = Object.keys((WARN.trace) || {})
        .filter(di => Object.values(WARN.trace[di]).some(t => t.di === 1))
      const bad = now.filter((d, i) => (d !== beforeNodes[i] || d.innerHTML !== beforeHTML[i])
        && !traced.includes(d.dataset.day))
      return { sameNodes: now.every((d, i) => d === beforeNodes[i]), sameHTML: now.every((d, i) => d.innerHTML === beforeHTML[i]),
        traced, rewritten: bad.map(d => d.dataset.day) }
    })
    T('B · a day-1 edit rewrites only day 1 and the day its crew rest traces to',
      r.rewritten.length === 0 ? 'held' : JSON.stringify(r), 'held')
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
