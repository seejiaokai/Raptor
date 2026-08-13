/* B18 — sa.js adapted for the React port: standalone waves (SC / AVALON / BB)
   are shaped right, their exempt seats are invisible to the conflict engine,
   their MAIN crews are not, and the phone chrome survives them.

   Two things in the original could not run here:

   · chip priority. The original recovers RANK by regexing
     `document.documentElement.innerHTML` — the reference is one inline script,
     so its consts really are in the HTML. There is no source to scrape in an
     ESM build, so RANK is read off the probe bridge instead. The port's ladder
     carries one extra chip, RUN ("no break day"), which the reference does not
     have; the rest is in the reference's order.
   · the SUP filter and the phone/board chrome came after a `go()` or a click
     and were read in the same evaluate — React commits a tick later.

   The original's "warnings UNCHANGED" step is also fixed here rather than
   copied. It stuffs the exempt seats from `dayEngaged()` without looking at
   who those men are, and on BOTH builds it eventually plants a downchit man on
   an SC SPARE — which raises DNIF_FLY, because no exemption lets a grounded
   man near a jet. The reference prints "CHANGED (FAIL)" for exactly that
   reason. Here the stuffing skips downchit men, so the exemption contract is
   tested on its own, and the DNIF_FLY case gets its own assertion below it.

   Run: node probes/adapted/sa-async.cjs   (needs vite preview on 4173) */
const { chromium } = require('playwright')
const URL = process.env.PORT_URL || 'http://localhost:4173/'

;(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
  let pass = 0, fail = 0
  const T = (n, got, want) => {
    const ok = String(got) === String(want); ok ? pass++ : fail++
    console.log(`${ok ? ' ok  ' : 'FAIL '} ${n.padEnd(58)} want ${want} · got ${got}`)
  }
  const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 } })
  const p = await ctx.newPage(); p.setDefaultTimeout(20000)
  p.on('pageerror', e => console.log('  PAGEERR', e.message))
  await p.goto(URL)
  await p.fill('#luser', 'a'); await p.fill('#lpass', 'a')
  await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900)

  const badges = () => p.evaluate(() => [...document.querySelectorAll('#vWeek .day .badge')].map(x => x.textContent))
  const before = await badges()

  /* ---- the three standalone waves, added one at a time ------------------- */
  await p.evaluate(() => addWave(0, 'sc')); await p.waitForTimeout(500)
  const scOnly = (await badges())[0]
  await p.evaluate(() => { addWave(0, 'avalon'); addWave(0, 'bb') }); await p.waitForTimeout(600)
  const after = await badges()
  console.log(`   badges: "${before[0]}" → SC "${scOnly}" → all "${after[0]}"`)
  T('badge · an SC wave adds its own count to day 1', scOnly, before[0] + ' / 2')
  T('badge · AVALON and BB add theirs too', after[0], before[0] + ' / 6')
  T('badge · and no other day moved', after.slice(1).join('|'), before.slice(1).join('|'))

  {
    const r = await p.evaluate(() => JSON.stringify((DAYS[0].waves || []).filter(isStandalone).map(w => ({
      label: w.label, kind: w.kind, noconf: !!w.noconf,
      shifts: (w.formations || []).map(f => f.msn + ' ' + f.to + '-' + f.ld + ' ac' + f.aircraft.length + ' spare' + f.aircraft.filter(a => a.spare).length),
    }))))
    T('shape · the three waves come up exactly as the reference builds them', r,
      '[{"label":"SC","kind":"sc","noconf":false,"shifts":["AM 07:00-13:00 ac4 spare2","PM 13:00-19:00 ac4 spare2"]},'
      + '{"label":"AVALON","kind":"avalon","noconf":true,"shifts":["NIGHT 19:00-07:00 ac4 spare2"]},'
      + '{"label":"BB","kind":"bb","noconf":true,"shifts":["SHIFT - ac4 spare2"]}]')
    const dw = await p.evaluate(() => {
      const x = (DAYS[0].dutywaves || []).find(y => y.sa === 'avalon')
      return x ? JSON.stringify({ label: x.label, noconf: x.noconf, roles: x.rows.map(r => r.role), t: x.rows[0].str + '-' + x.rows[0].end }) : 'MISSING'
    })
    /* AVALON NO LONGER BRINGS A DESK (owner, 13 Aug 26 — duties are decoupled
       from waves). No wave auto-creates a duty block now; every desk is placed
       from the + Block TEMPLATE picker. So adding the AVALON wave via addWave
       leaves the dutywaves list with no avalon-marked desk. */
    T('shape · AVALON no longer auto-creates a duty block', dw, 'MISSING')
  }

  /* ---- the exempt seats are invisible to the engine ---------------------- */
  {
    const r = await p.evaluate(() => {
      const key = x => x.code + '|' + (x.who || []).join(',') + '|' + x.msg
      const was = validate().all.map(key)
      const d = DAYS[0]
      /* the men the engine already knows are working today — but eligible for
         the seat they are about to stand: right seat, SC-current, not grounded.
         The exemption is about CLASHES; it never licensed an illegal seat, and
         the original's blind rotation eventually found one. */
      const fit = id => {
        const P = PEOPLE[id]
        return P && !P.special && P.quals && P.quals.scDay && P.quals.scNight
          && !INPUTS.some(i => isDownchit(i.type) && i.person === id && inputCoversDate(i, d.dt))
      }
      const busy = [...dayEngaged(d)].filter(fit)
      const front = busy.filter(id => PEOPLE[id].seat === 'FCP')
      const rear = busy.filter(id => PEOPLE[id].seat === 'RCP')
      let i = 0, j = 0, put = 0
      ;(d.waves || []).filter(isStandalone).forEach(w => w.formations.forEach(f => f.aircraft.forEach(a => {
        if (!saExempt(w, f, a)) return
        a.p = front[i++ % front.length]; a.w = rear[j++ % rear.length]; put += 2
      })))
      const dw = (d.dutywaves || []).find(x => x.sa === 'avalon')
      if (dw) dw.rows.forEach(r => { r.id = front[i++ % front.length]; put++ })
      afterSchedMutate()
      const now = validate().all.map(key)
      return { put, added: now.filter(x => !was.includes(x)), n: was.length + '->' + now.length }
    })
    console.log(`   ${r.put} exempt seats filled from the men already working · warnings ${r.n}`)
    T('exempt · AVALON, BB and the SC spares raise nothing new',
      r.added.length ? r.added.slice(0, 3).join(' | ') : 'nothing', 'nothing')
  }

  /* ---- the exemption covers clashes, never an illegal seat --------------- */
  {
    const r = await p.evaluate(() => {
      const d = DAYS[0], sc = (d.waves || []).find(w => w.kind === 'sc')
      const spare = sc.formations[1].aircraft.find(a => a.spare)
      const held = spare.p
      const codes = id => { spare.p = id; afterSchedMutate(); return validate().all.filter(x => (x.who || []).includes(id)).map(x => x.code) }
      const dnif = Object.keys(PEOPLE).find(id => !PEOPLE[id].special
        && INPUTS.some(i => isDownchit(i.type) && i.person === id && inputCoversDate(i, d.dt)))
      const noSC = Object.keys(PEOPLE).find(id => !PEOPLE[id].special && PEOPLE[id].seat === 'FCP'
        && PEOPLE[id].quals && !PEOPLE[id].quals.scDay)
      const out = {
        dnif: dnif ? (codes(dnif).includes('DNIF_FLY') ? 'DNIF_FLY' : 'nothing') : 'no downchit in the seed',
        noSC: noSC ? (codes(noSC).includes('SC_QUAL') ? 'SC_QUAL' : 'nothing') : 'everyone is SC current',
      }
      spare.p = held; afterSchedMutate()
      return out
    })
    T('exempt · a downchit man on an SC SPARE is still flagged', r.dnif, 'DNIF_FLY')
    T('exempt · so is a man without SC currency', r.noSC, 'SC_QUAL')
  }

  /* ---- the SC MAIN crew IS checked, the SPARE beside it is not ----------- */
  {
    const r = await p.evaluate(() => {
      const d = DAYS[0], sc = (d.waves || []).find(w => w.kind === 'sc')
      const f0 = (d.waves || []).find(w => !isStandalone(w)).formations[0]
      const victim = f0.aircraft[0].p                      // already flying 12:40-14:05
      sc.formations[0].to = '12:00'; sc.formations[0].ld = '14:00'
      sc.formations[0].aircraft[0].p = victim              // MAIN seat — must be flagged
      afterSchedMutate()
      const main = validate().all.filter(x => (x.who || []).includes(victim)).map(x => x.code).sort()
      sc.formations[0].aircraft[2].p = victim              // SPARE, same man — must add nothing
      afterSchedMutate()
      const both = validate().all.filter(x => (x.who || []).includes(victim)).map(x => x.code).sort()
      return { victim, main, both }
    })
    console.log(`   SC main check on ${r.victim}: ${r.main.join(', ')}`)
    T('main · an SC MAIN seat over a real flight double-books',
      r.main.includes('DOUBLE_BOOK') ? 'DOUBLE_BOOK' : r.main.join(','), 'DOUBLE_BOOK')
    T('main · and the SPARE beside it adds nothing', r.both.join(','), r.main.join(','))
  }

  /* ---- chip priority ----------------------------------------------------- */
  {
    const r = await p.evaluate(() => Object.keys(RANK).sort((a, b) => RANK[b] - RANK[a]).join(' > '))
    /* The reference ladder with the port's insertions: RUN (no break day, just
       above crew rest) and the two crew-pairing flags (renamed from CC/CCH to
       CP/CPH, owner ask 5 Aug 26) — CPH under the conflict flag, CP leading
       the advisories. The reference order itself is untouched; the new codes
       slot between its rungs. */
    T('chips · the ladder is the reference order plus RUN, CP and CPH', r,
      'Q > C > CPH > RUN > CR > CP > NB > DB > SB > SD > A > TT > DT > LD')
  }

  /* ---- the SUP filter lights supervisors and nobody else ----------------- */
  {
    await p.evaluate(() => { const el = document.querySelector('.fchip[data-hl="SUP"]'); el && el.click() })
    await p.waitForTimeout(400)
    const r = await p.evaluate(() => {
      const lit = [...document.querySelectorAll('#vWeek .puck.hl[data-person]')].map(x => x.dataset.person)
      const missed = [...document.querySelectorAll('#vWeek .puck[data-person]')].map(x => x.dataset.person)
        .filter(id => ['A', 'B'].includes(PEOPLE[id].q) && !lit.includes(id))
      return { lit: new Set(lit).size, wrong: lit.filter(id => !['A', 'B'].includes(PEOPLE[id].q)).length, missed: new Set(missed).size }
    })
    await p.evaluate(() => { const el = document.querySelector('.fchip[data-hl="SUP"]'); el && el.click() })
    await p.waitForTimeout(300)
    console.log(`   SUP filter: lit ${r.lit}`)
    T('filter · SUP lights supervisors only', r.wrong, 0)
    T('filter · and misses none of them', r.missed, 0)
    T('filter · with somebody actually lit', r.lit > 0 ? 'lit' : 'none', 'lit')
  }
  await ctx.close()

  /* ---- the phone: filters visible, board wide toggle --------------------- */
  {
    const ctx2 = await b.newContext({ viewport: { width: 390, height: 900 }, hasTouch: true, isMobile: true })
    const p2 = await ctx2.newPage(); p2.setDefaultTimeout(20000)
    p2.on('pageerror', e => console.log('  PAGEERR', e.message))
    await p2.goto(URL)
    await p2.fill('#luser', 'a'); await p2.fill('#lpass', 'a')
    await p2.click('#loginForm button[type=submit]'); await p2.waitForTimeout(900)
    const f = await p2.evaluate(() => {
      const el = document.querySelector('#page-viewsched .filters')
      return {
        display: getComputedStyle(el).display, chips: el.querySelectorAll('.fchip').length,
        sideScroll: el.scrollWidth > el.clientWidth,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }
    })
    console.log(`   phone filters: display ${f.display} · chips ${f.chips} · own side-scroll ${f.sideScroll}`)
    T('phone · the filter strip is on screen', f.display, 'flex')
    T('phone · it scrolls itself rather than the page', f.sideScroll ? 'itself' : 'no scroll', 'itself')
    T('phone · and the page gains no sideways swipe', f.pageOverflow, 0)

    await p2.evaluate(() => go('editsched')); await p2.waitForTimeout(600)
    await p2.evaluate(() => openScheduler(0)); await p2.waitForTimeout(800)
    const b1 = await p2.evaluate(() => ({
      dir: getComputedStyle(document.querySelector('.sb-main')).flexDirection,
      wideBtn: getComputedStyle(document.getElementById('sbWide')).display,
    }))
    T('board · the phone board stacks its panels', b1.dir, 'column')
    T('board · and offers the desktop-layout button', b1.wideBtn === 'none' ? 'hidden' : 'offered', 'offered')

    await p2.click('#sbWide'); await p2.waitForTimeout(600)
    const b2 = await p2.evaluate(() => {
      const m = document.querySelector('.sb-main'), sb = document.getElementById('schedBoard')
      const side = document.querySelector('.sb-side')
      return {
        wide: sb.classList.contains('sb-wide'), dir: getComputedStyle(m).flexDirection,
        sidePos: getComputedStyle(side).position, sideW: Math.round(side.getBoundingClientRect().width),
        panX: sb.scrollWidth - sb.clientWidth, btn: document.getElementById('sbWide').textContent,
      }
    })
    console.log(`   board desktop on a phone: sideW ${b2.sideW} · pan ${b2.panX} · btn "${b2.btn}"`)
    T('board · the desktop layout really switches over', b2.wide && b2.dir === 'row' ? 'wide' : JSON.stringify(b2), 'wide')
    T('board · the side panel takes its full width', b2.sideW, 320)
    T('board · and the board becomes pannable instead of squashed', b2.panX > 0 ? 'pannable' : 'squashed', 'pannable')
    T('board · the button offers the way back', /Phone layout/.test(b2.btn) ? 'offers phone' : b2.btn, 'offers phone')
    await ctx2.close()
  }

  console.log(`\n${pass} passed · ${fail} failed`)
  await b.close(); console.log('sa-async done')
  process.exit(fail ? 1 : 0)
})().catch(e => { console.log('ERR', e.message); process.exit(1) })
