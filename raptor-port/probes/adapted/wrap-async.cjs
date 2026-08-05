/* B55 — wrap.js adapted for the React port: the original injects the jam and
   measures in ONE evaluate, which needs a synchronous repaint. Same jam, same
   measurements (ink via a Range, not the cell box), split across the async
   commit. */
const { chromium } = require('playwright')
const URL = process.env.PORT_URL || 'http://localhost:4173/'

const JAM = 'shahdbsbsnanansjsnsnsjsjmsnsnsnsnsnsnsnnsndbdndnsnsnsnsns'
const JAM2 = 'HAHBANDIDIAKANZBHXISKSNSN'

const boot = async (b, cfg) => {
  const ctx = await b.newContext({
    viewport: { width: cfg.w, height: cfg.h }, deviceScaleFactor: 2,
    hasTouch: !!cfg.touch, isMobile: !!cfg.touch,
  })
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('  PAGEERR', e.message))
  await p.goto(URL)
  await p.fill('#luser', 'a'); await p.fill('#lpass', 'a')
  await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900)
  return { p, ctx }
}

;(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
  let pass = 0, fail = 0
  const T = (n, got, want) => {
    const ok = String(got) === String(want); ok ? pass++ : fail++
    console.log(`${ok ? ' ok  ' : 'FAIL '} ${n.padEnd(60)} want ${want} · got ${got}`)
  }

  /* the widths the squadron actually reads this on */
  for (const cfg of [{ n: 'W390 phone', w: 390, h: 844, touch: true },
                     { n: 'W430 phone', w: 430, h: 932, touch: true },
                     { n: 'W820 tablet', w: 820, h: 1180 },
                     { n: 'W1500 desk', w: 1500, h: 950 }]) {
    const { p, ctx } = await boot(b, cfg)
    for (const page of ['viewsched', 'editsched']) {
      await p.evaluate(pg => go(pg), page); await p.waitForTimeout(700)
      /* inject the jam — the reported row, verbatim — then let React commit */
      await p.evaluate(([JAM, JAM2]) => {
        const d = DAYS[0]
        d.allhands = [{ prog: 'SODB ' + JAM, sub: '', str: '0745', end: '0815', who: [] },
                      { prog: 'FLIGHT SAFETY STAND-DOWN ' + JAM2, sub: JAM, str: '0830', end: '0900', who: [] }]
        d.notes = ['EP: ' + JAM]
        ;(d.ground || (d.ground = [])).push({ prog: JAM, str: '1000', end: '1030', who: '', rmks: JAM })
        d.simnotes = JAM
        if (d.duties && d.duties.length) { d.duties[0].label = JAM; d.duties[0].rmks = JAM }
        INPUTS.push({ person: 'nobody-' + JAM.slice(0, 12), date: d.dt, allday: true, s: 0, e: 1439, type: 'Meeting', remarks: JAM, mod: '' })
        validate(); renderSchedule()
      }, [JAM, JAM2])
      await p.waitForTimeout(400)
      const r = await p.evaluate(pg => {
        const root = document.getElementById(pg === 'editsched' ? 'eWeek' : 'vWeek')
        const day = root.querySelector('[data-day="0"]')
        const out = { overflow: [], collide: [], widest: 0 }
        const R = el => el.getBoundingClientRect()
        /* 1 · every free-text cell must paint inside its own box */
        day.querySelectorAll('.ah-row>.nm,.pl-row>.nm,.pl-row .rmk,.ah-note,.blknote,.rmkcell,.ppl .itxt')
          .forEach(el => {
            const over = el.scrollWidth - el.clientWidth
            if (over > 1) out.overflow.push((el.className || '?').split(' ')[0] + ' +' + over)
            out.widest = Math.max(out.widest, over)
          })
        /* 2 · and must not reach into the START / END cells on its own row —
           measured on the INK via a Range, not the cell box */
        const inkRight = el => {
          const rg = document.createRange(); rg.selectNodeContents(el)
          const rs = [...rg.getClientRects()]; rg.detach && rg.detach()
          return rs.length ? Math.max(...rs.map(x => x.right)) : R(el).right
        }
        day.querySelectorAll('.ah-row,.pl-row').forEach(row => {
          const nm = row.querySelector(':scope>.nm'); if (!nm) return
          const ts = [...row.querySelectorAll(':scope>.t')]; if (!ts.length) return
          const first = R(ts[0]), ink = inkRight(nm)
          if (ink > first.left + 1) out.collide.push((nm.textContent || '').trim().slice(0, 16) + ` (+${Math.round(ink - first.left)}px)`)
        })
        /* 3 · the row has to have grown taller instead — the text is really there */
        const jamRow = [...day.querySelectorAll('.ah-row')].find(r => /shahdbsbsna/.test(r.textContent || ''))
        out.rowH = jamRow ? Math.round(R(jamRow).height) : -1
        out.lines = jamRow ? Math.round(R(jamRow.querySelector(':scope>.nm')).height) : -1
        /* 4 · the day column itself must not have been widened into a swipe */
        out.dayOver = Math.max(0, day.scrollWidth - day.clientWidth)
        return out
      }, page)
      const tag = `${cfg.n} ${page === 'editsched' ? 'edit' : 'view'}`
      T(`${tag} · no free-text cell overflows its box`, r.overflow.length ? r.overflow.slice(0, 3).join(' | ') : 'none', 'none')
      T(`${tag} · no name reaches into the START cell`, r.collide.length ? r.collide.slice(0, 2).join(' | ') : 'none', 'none')
      T(`${tag} · the jammed row wrapped onto several lines`, r.lines > 26 ? 'wrapped' : `one line (${r.lines}px)`, 'wrapped')
      T(`${tag} · and the day did not turn into a sideways swipe`, r.dayOver, 0)
    }
    await p.close(); await ctx.close()
  }

  /* ---- the scheduler board, same jam -------------------------------------- */
  for (const cfg of [{ n: 'W390 board', w: 390, h: 844, touch: true }, { n: 'W1500 board', w: 1500, h: 950 }]) {
    const { p, ctx } = await boot(b, cfg)
    await p.evaluate(() => go('editsched')); await p.waitForTimeout(600)
    await p.evaluate(() => openScheduler(0)); await p.waitForTimeout(800)
    await p.evaluate(JAM => {
      const d = DAYS[0]
      d.allhands = [{ prog: 'SODB ' + JAM, sub: JAM, str: '0745', end: '0815', who: [] }]
      d.notes = [JAM]; d.simnotes = JAM
      INPUTS.push({ person: 'nobody', date: d.dt, allday: true, s: 0, e: 1439, type: 'Meeting', remarks: JAM, mod: '' })
      validate(); renderScheduler()
    }, JAM)
    await p.waitForTimeout(400)
    const r = await p.evaluate(() => {
      const out = { overflow: [], panels: [] }
      document.querySelectorAll('#sbBoard .sb-ntx,#sbBoard .nts,#sbWarn .wln,'
        + '#sbInputs .sbi-rmk,#sbInputs .itxt,#sbBoard .sb-nbox').forEach(el => {
        if (/INPUT|TEXTAREA/.test(el.tagName)) return         // scrolls internally, by design
        const over = el.scrollWidth - el.clientWidth
        if (over > 1) out.overflow.push((el.className || el.tagName).split(' ')[0] + ' +' + over)
      })
      ;['sbBoard', 'sbWarn', 'sbInputs'].forEach(id => {
        const e = document.getElementById(id)
        if (e && e.scrollWidth - e.clientWidth > 1) out.panels.push(id + ' +' + (e.scrollWidth - e.clientWidth))
      })
      return out
    })
    T(`${cfg.n} · no board text overflows its box`, r.overflow.length ? r.overflow.slice(0, 3).join(' | ') : 'none', 'none')
    T(`${cfg.n} · no board panel gains a sideways scroll`, r.panels.length ? r.panels.join(' | ') : 'none', 'none')
    await p.close(); await ctx.close()
  }

  console.log(`\n${pass} passed · ${fail} failed`)
  await b.close(); console.log('wrap-async done')
  process.exit(fail ? 1 : 0)
})().catch(e => { console.log('ERR', e.message); process.exit(1) })
