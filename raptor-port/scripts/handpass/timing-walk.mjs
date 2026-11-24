/* The ?timing readout's walk, part 1 — W1, W2, W5 (the evidence sheet's combined list). ONLY=W5 runs one step.
   node scripts/handpass/timing-walk.mjs   (from raptor-port/, on a build already made; TW_MAIN = main's build folder) */
import { serve, browserOf, fresh, DESK, PHONE, signIn, outsideTime, openBy, readout, row, pageRows, waitRows, pic, shotDir, judge, notWalked, saveResults, sleep } from './timing-walk-lib.mjs'

const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const on = id => !ONLY || ONLY.includes(id)
const NAMES = { viewsched: 'View-only Sched', editsched: 'Edit Schedule', inputs: 'Inputs', quals: 'Quals', logic: 'Logic', leavewar: 'Leave War', tracker: 'Tracker', help: 'Help', admin: 'Admin' }
const strip = u => new URL(u).pathname.replace(/-[A-Za-z0-9_-]{8}(\.\w+)$/, '$1')

const srv = await serve()
const cr = await browserOf('chromium')

/* W1 — no switch: nothing asked for, nothing drawn; the first download against main's */
if (on('W1')) {
  const dir = shotDir('W1')
  const firstOf = async (base) => {
    const { ctx, page, errors } = await fresh(cr, DESK)
    const reqs = []
    page.on('request', r => reqs.push(r.url()))
    await page.goto(base + '/')
    await page.waitForSelector('#luser', { state: 'visible' })
    await sleep(1500)
    const first = reqs.filter(u => /\.(js|css)$/.test(new URL(u).pathname)).map(strip).sort()
    return { ctx, page, errors, reqs, first }
  }
  const b = await firstOf(srv.base)
  await signIn(b.page)
  await b.page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 60000 })
  for (const p of ['editsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help', 'admin', 'viewsched']) { await openBy(b.page, p); await outsideTime(b.page, p) }
  await sleep(3000)
  const timingAsked = b.reqs.filter(u => /timing/i.test(u))
  const drawn = await b.page.evaluate(() => ({ root: !!document.getElementById('timingRoot'), pill: !!document.querySelector('.timing-pill, .timingwin') }))
  judge('W1a', timingAsked.length === 0, `requests naming "timing" in a whole session without the switch: ${timingAsked.length} (of ${b.reqs.length} requests)`)
  judge('W1b', !drawn.root && !drawn.pill, `#timingRoot ${drawn.root}, a window or button ${drawn.pill}`)
  judge('W1c', b.errors.length === 0, `errors: ${b.errors.length ? b.errors.join(' | ') : 'none'}`)
  await pic(b.page, dir, 'no-switch-after-every-page')
  await b.ctx.close()
  if (process.env.TW_MAIN) {
    const m = await serve(process.env.TW_MAIN)
    const a = await firstOf(m.base)
    const b2 = await firstOf(srv.base)
    const onlyMain = a.first.filter(x => !b2.first.includes(x)), onlyBranch = b2.first.filter(x => !a.first.includes(x))
    judge('W1d', onlyMain.length === 0 && onlyBranch.length === 0, `first download before the sign-in card: main ${a.first.length} files, branch ${b2.first.length}; only on main: ${onlyMain.join(', ') || '—'}; only on the branch: ${onlyBranch.join(', ') || '—'}`)
    await a.ctx.close(); await b2.ctx.close(); await m.close()
  } else notWalked('W1d', 'TW_MAIN not set')
}

/* W2 — the switch's spellings */
if (on('W2')) {
  const cases = [['?timing', true], ['?x=1&timing', true], ['?timing=1', true], ['?TIMING', false], ['?timings', false], ['#timing', false], ['?timing=false', null]]
  for (const [q, want] of cases) {
    const { ctx, page } = await fresh(cr, DESK)
    await page.goto(srv.base + '/' + q)
    await page.waitForSelector('#luser', { state: 'visible' })
    await sleep(1200)
    const r = await readout(page)
    judge('W2 ' + q, want === null ? null : r.root === want, `window drawn: ${r.root} (open ${r.open})`)
    await ctx.close()
  }
}

/* W5 — every figure against the outside stopwatch, 4× CPU, desktop */
if (on('W5')) {
  const dir = shotDir('W5')
  const { ctx, page, errors } = await fresh(cr, DESK, { cpu: 4 })
  await page.goto(srv.base + '/?timing')
  await page.waitForSelector('#timingRoot .timingwin', { timeout: 60000 })
  let r = await readout(page)
  console.log('  start-up rows: ' + r.rows.slice(0, 3).map(x => x.label + ' = ' + x.value).join(' · '))
  judge('W5-start', /at \d|under 0\.1/.test(row(r, 'App loaded').value) && /at \d/.test(row(r, 'Sign-in shown').value), `App loaded ${row(r, 'App loaded').value}, Sign-in shown ${row(r, 'Sign-in shown').value}, Site answered ${row(r, 'Site answered').value}`)
  await signIn(page)
  const outW = await outsideTime(page, 'viewsched')
  await sleep(600)
  r = await readout(page)
  const sv = row(r, 'Sign in pressed → week shown').value
  const secs = v => Number((/([\d.]+) s/.exec(v) || [])[1])
  const close = (inside, outside) => Math.abs(inside - outside) <= Math.max(200, outside * 0.15)
  judge('W5-signin', close(secs(sv) * 1000, outW), `readout "${sv}", outside ${(outW / 1000).toFixed(2)} s`)
  await pic(page, dir, 'after-sign-in')
  const order = ['leavewar', 'tracker', 'editsched', 'viewsched', 'editsched', 'inputs', 'quals', 'logic', 'help', 'admin', 'leavewar', 'tracker', 'viewsched']
  const seen = new Set(['viewsched'])
  for (const p of order) {
    const before = pageRows(await readout(page)).length
    const clawSeen = page.evaluate(() => new Promise(res => { let up = 0; const t = setInterval(() => { if (document.querySelector('.pgclaw:not(.gone)')) up++ }, 30); setTimeout(() => { clearInterval(t); res(up) }, 1500) }))
    await openBy(page, p)
    const out = await outsideTime(page, p)
    const claw = await clawSeen
    r = await waitRows(page, before, 20000)
    const top = pageRows(r)[0]
    const first = !seen.has(p); seen.add(p)
    const wantTag = first ? /^first time/ : /^opened before$/
    const okName = top && top.label === NAMES[p], okTag = top && wantTag.test(top.tag), okTime = top && close(secs(top.value) * 1000, out)
    let dl = ''
    if (first && (p === 'leavewar' || p === 'tracker')) dl = top && /downloaded (\d+) KB/.test(top.tag) ? ' (download tag present)' : ' (NO download tag)'
    judge('W5-' + p + (first ? '-1' : '-2'), !!(okName && okTag && okTime) && !/NO download/.test(dl), `row "${top ? top.label + ', ' + top.tag + ': ' + top.value : 'none'}" — outside ${(out / 1000).toFixed(2)} s; claw seen ${claw} times${dl}`)
    if (p === 'leavewar' || p === 'tracker') await pic(page, dir, p + (first ? '-first' : '-again'))
  }
  await pic(page, dir, 'end')
  judge('W5-errors', errors.length === 0, errors.join(' | ') || 'none')
  await ctx.close()
}

saveResults('walk-part1' + (ONLY ? '-' + ONLY.join('_') : ''))
await cr.close(); await srv.close()
