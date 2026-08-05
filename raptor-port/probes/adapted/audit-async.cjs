/* B48 — audit.js adapted for the React port: one check per defect the audit
   confirmed. Each prints WANT vs GOT.

   The original runs the whole battery inside one evaluate and then three more
   that read the DOM straight after a `go()` or a click. Three things stopped
   it here:

   · item 3 pinned the OFFER exemption — `Available fly` / `Available duty`
     clashed with nothing. Those types were removed and `Fly` became an
     ordinary commitment (owner, Aug 26), so `INPUTS.find(/^Available/)` came
     back undefined and the whole evaluate died on `off.person` before
     printing a single line. It is re-expressed below against the rule that
     replaced it: a personal input is invisible to the validator until a
     scheduler ACCEPTS it (docs/engine-rules.md §Accepting a personal input).
   · item 14 assigned `AIRKEY` as a bare window global; in the port that is
     module state in ui/pops.ts. The probe now opens the popup the way a user
     does — the wave's own Traffic button — which tests more, not less.
   · items 9, 12, 13 read the board / the Inputs page in the same tick as the
     nav or click that builds them. Split across the commit.

   Run: node probes/adapted/audit-async.cjs   (needs vite preview on 4173) */
const { chromium } = require('playwright')
const URL = process.env.PORT_URL || 'http://localhost:4173/'

;(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
  const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 } })
  const p = await ctx.newPage(); p.setDefaultTimeout(15000)
  /* a page exception is a defect and fails the run; console noise is printed
     for the record only — the browser asks any Vite app for /favicon.ico and
     logs the 404 itself, which is not the app's doing */
  const errs = [], noise = []
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message))
  p.on('console', m => { if (m.type() === 'error') noise.push('CONSOLE ' + m.text()) })
  let pass = 0, fail = 0
  const T = (n, got, want) => {
    const ok = String(got) === String(want); ok ? pass++ : fail++
    console.log(`${ok ? ' ok  ' : 'FAIL '} ${n.padEnd(56)} want ${want} · got ${got}`)
  }
  await p.goto(URL)
  await p.fill('#luser', 'a'); await p.fill('#lpass', 'a')
  await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900)
  await p.evaluate(() => go('editsched')); await p.waitForTimeout(800)

  /* the engine battery — nothing here reads the DOM, so it stays in one
     evaluate exactly as the original wrote it */
  const R = await p.evaluate(() => {
    const out = {}
    const wipe = di => {
      const d = DAYS[di]
      ;(d.waves || []).forEach(w => w.formations.forEach(f => f.aircraft.forEach(a => { a.p = ''; a.w = '' })))
      ;['amt', 'oft'].forEach(k => ((d.sims || {})[k] || []).forEach(o => { o.p = ''; o.w = ''; o.who = ''; o.pax = []; o.more = [] }))
      ;(d.dutywaves || []).forEach(dw => dw.rows.forEach(r => { r.id = ''; r.more = [] }))
      ;(d.ground || []).forEach(g => { g.who = ''; g.more = [] })
      ;(d.allhands || []).forEach(x => { x.who = ''; x.more = [] })
    }
    const W = id => validate().all.filter(x => (x.who || []).includes(id))
    const pilot = n => Object.keys(PEOPLE).filter(x => PEOPLE[x].seat === 'FCP' && !PEOPLE[x].special
      && PEOPLE[x].quals && PEOPLE[x].quals.scDay && PEOPLE[x].quals.scNight)[n || 0]

    /* 1 · winOverlap no longer manufactures hits */
    wipe(0); addWave(0, 'sc'); afterSchedMutate()
    {
      const d = DAYS[0], w = d.waves.find(x => x.kind === 'sc'), gi = d.waves.indexOf(w)
      const AM = w.formations[0], id = pilot(0)
      const dw = (d.dutywaves || [])[0] && d.dutywaves[0].rows[0]
      if (dw) { dw.id = id; dw.str = '19:00'; dw.end = '08:00' }   // starts 6h AFTER the shift ends
      afterSchedMutate()
      const k = `0.${gi}.0.${AM.aircraft.findIndex(a => !a.spare)}.p`
      out.i1 = slotBar(id, k) || 'CLEAR'
      if (dw) dw.id = ''
      afterSchedMutate()
    }
    /* 1b · but a genuine roll into tomorrow still bars */
    wipe(0); wipe(1); addWave(0, 'sc'); afterSchedMutate()
    {
      const d = DAYS[0], w = d.waves.find(x => x.kind === 'sc'), gi = d.waves.indexOf(w)
      const N = w.formations[1]; N.to = '19:00'; N.ld = '07:00'    // rolls past midnight
      const id = pilot(0)
      const fw = DAYS[1].waves.find(x => !isStandalone(x)), ff = fw.formations[0]
      ff.to = '05:00'; ff.ld = '06:00'; ff.aircraft[0].p = id      // tomorrow, inside the tail
      afterSchedMutate()
      const k = `0.${gi}.1.${N.aircraft.findIndex(a => !a.spare)}.p`
      out.i1b = /inside this shift/.test(slotBar(id, k)) ? 'BAR' : 'clear'
      ff.aircraft[0].p = ''; afterSchedMutate()
    }
    /* 2 · NO_BRIEF can fire */
    wipe(1)
    {
      const d = DAYS[1], fw = d.waves.find(x => !isStandalone(x)), ff = fw.formations[0], id = pilot(0)
      ff.to = '13:00'; ff.ld = '14:30'; ff.aircraft[0].p = id
      const g = (d.ground || [])[0]; if (g) { g.who = PEOPLE[id].cs; g.str = '11:00'; g.end = '12:00' }
      afterSchedMutate()
      out.i2 = W(id).some(x => x.code === 'NO_BRIEF') ? 'NO_BRIEF' : 'nothing'
      if (g) g.who = ''; ff.aircraft[0].p = ''; afterSchedMutate()
    }
    /* 3 (re-expressed) · a personal input is not the issued programme until a
       scheduler accepts it — the offer exemption's successor rule */
    wipe(0)
    {
      const d = DAYS[0], fw = d.waves.find(x => !isStandalone(x)), ff = fw.formations[0]
      const inp = INPUTS.find(i => isPersonal(i.type) && !i.acc && inputCoversDate(i, d.dt) && PEOPLE[i.person])
      if (!inp) { out.i3 = 'no personal input in the seed' } else {
        ff.aircraft[0].p = inp.person; afterSchedMutate()
        out.i3type = inp.type
        out.i3 = (chipOf(0, inp.person) || 'none') + '/' + (sevOf(0, inp.person) || 'none')
        acceptInput(0, inp, 'g'); afterSchedMutate()
        out.i3seen = (d.ground || []).some(g => g.src === inpKey(inp)) ? 'on the programme' : 'nowhere'
        unacceptInput(0, inp); ff.aircraft[0].p = ''; afterSchedMutate()
      }
    }
    /* 4 · a sim crossing midnight is a real window */
    wipe(0)
    {
      const d = DAYS[0], s0 = (d.sims.oft || [])[0], id = pilot(0)
      s0.str = '2300'; s0.end = '0100'; s0.p = id
      const dr = (d.dutywaves || [])[0] && d.dutywaves[0].rows[0]
      if (dr) { dr.id = id; dr.str = '2330'; dr.end = '0030' }
      afterSchedMutate()
      const ev = (collectEvents()[0].events.find(e => e.kind === 'sim' && e.id === id) || {})
      out.i4win = `${ev.s}-${ev.e}`
      out.i4 = W(id).some(x => x.code === 'DOUBLE_BOOK') ? 'DOUBLE_BOOK' : 'nothing'
      s0.p = ''; if (dr) dr.id = ''; afterSchedMutate()
    }
    /* 5 · a body dropped under a sim row counts */
    wipe(0)
    {
      const d = DAYS[0], s0 = (d.sims.oft || [])[0], id = pilot(1)
      s0.str = '1300'; s0.end = '1430'; s0.more = [id]
      const dr = (d.dutywaves || [])[0] && d.dutywaves[0].rows[0]
      if (dr) { dr.id = id; dr.str = '1300'; dr.end = '1430' }
      afterSchedMutate()
      out.i5 = W(id).some(x => x.code === 'DOUBLE_BOOK') ? 'DOUBLE_BOOK' : 'nothing'
      s0.more = []; if (dr) dr.id = ''; afterSchedMutate()
    }
    /* 6 · crew rest is measured off flying, not off a desk */
    wipe(0); wipe(1); addWave(1, 'sc'); afterSchedMutate()
    {
      const d0 = DAYS[0], id = pilot(0)
      const fw = d0.waves.find(x => !isStandalone(x)), ff = fw.formations[0]
      ff.to = '08:00'; ff.ld = '10:00'; ff.aircraft[0].p = id      // rest-bearing end 12:00
      const dr = (d0.dutywaves || [])[0] && d0.dutywaves[0].rows[0]
      if (dr) { dr.id = id; dr.str = '1800'; dr.end = '2359' }     // a desk, not a cockpit
      const w = DAYS[1].waves.find(x => x.kind === 'sc'), AM = w.formations[0]
      AM.aircraft[AM.aircraft.findIndex(a => !a.spare)].p = id
      afterSchedMutate()
      out.i6 = W(id).some(x => x.code === 'CREW_REST') ? 'CREW_REST' : 'none'
      out.i6b = restClear(1, id) == null ? 'clear' : 'barred'
      ff.aircraft[0].p = ''; if (dr) dr.id = ''
      AM.aircraft[AM.aircraft.findIndex(a => !a.spare)].p = ''
      afterSchedMutate()
    }
    /* 7 · one man listed twice on a row is one commitment */
    wipe(0)
    {
      const id = pilot(0); fillSlot('d:0.0.0.+', id); fillSlot('d:0.0.0.+', id); afterSchedMutate()
      out.i7 = W(id).some(x => x.code === 'DOUBLE_BOOK') ? 'DOUBLE_BOOK' : 'none'
      const r = DAYS[0].dutywaves[0].rows[0]; r.id = ''; r.more = []; afterSchedMutate()
    }
    /* 8 · sim seats obey the seat rules */
    {
      const wso = Object.keys(PEOPLE).find(x => PEOPLE[x].seat === 'RCP' && !PEOPLE[x].special)
      out.i8a = slotRules('s:0.oft.0.p').seat || 'null'
      out.i8b = /front seat/.test(slotBar(wso, 's:0.oft.0.p')) ? 'BAR' : 'clear'
      out.i8c = slotRules('s:0.oft.0.pax.1').seat || 'null'
    }
    /* 11 · the free count excludes men on leave */
    {
      disarmSlot()
      const di = 1, d = DAYS[di], off = dayOff(d)
      const host = document.createElement('div'); host.innerHTML = paletteHTML(di, { head: false })
      const free = [...host.querySelectorAll('.rcol')].map(c => +(c.querySelector('.rh').textContent.match(/(\d+) free/) || [])[1])
      out.i11a = [...host.querySelectorAll('.rpuck[data-person]')]
        .filter(e => off.has(e.dataset.person) && !e.classList.contains('no')).length
      out.i11b = free.length && free.every(n => isFinite(n)) ? 'ok' : 'bad'
    }
    /* 15 · undo puts down an armed slot */
    {
      const before = DAYS[0].waves.length
      addWave(0, 'fly'); afterSchedMutate()
      const gi = DAYS[0].waves.length - 1
      armSlot(`0.${gi}.0.0.p`)
      histApply(HIST.ix - 1)
      out.i15a = ARM ? 'still armed' : 'disarmed'
      out.i15b = DAYS[0].waves.length <= before ? 'gone' : 'still there'
    }
    return out
  })
  T('1 · overnight duty does not bar the 07-13 shift', R.i1, 'CLEAR')
  T('1b · tomorrow inside the night tail DOES bar', R.i1b, 'BAR')
  T('2 · a meeting inside the brief window raises NO_BRIEF', R.i2, 'NO_BRIEF')
  console.log(`   3 · subject input type: ${R.i3type || '-'}`)
  T('3 · an un-accepted personal input paints nothing', R.i3, 'none/none')
  T('3 · and accepting it puts it on the programme', R.i3seen, 'on the programme')
  T('4 · a 2300-0100 sim is stored rolled, not inverted', R.i4win, '1380-1500')
  T('4 · and it clashes with the duty inside it', R.i4, 'DOUBLE_BOOK')
  T('5 · a sim extra is seen by the engine', R.i5, 'DOUBLE_BOOK')
  T('6 · a late desk duty raises no crew-rest breach', R.i6, 'none')
  T('6 · and the picker agrees with the engine', R.i6b, 'clear')
  T('7 · a man on a row twice does not clash with himself', R.i7, 'none')
  T('8 · slotRules reads a sim front seat', R.i8a, 'p')
  T('8 · a WSO is barred from it', R.i8b, 'BAR')
  T('8 · but not from a pax place', R.i8c, 'null')
  T('11 · nobody on leave is drawn as available', R.i11a, 0)
  T('11 · and the free counts are numbers', R.i11b, 'ok')
  T('15 · undo disarms', R.i15a, 'disarmed')
  T('15 · and the wave really went', R.i15b, 'gone')

  /* ---- 13 · a splice moves the amendment marks with it ------------------- */
  await p.evaluate(() => {
    const d = DAYS[0]; d.notes = ['ALPHA', 'BRAVO', 'CHARLIE']
    SCHED.pending = {}; SCHED.changes = { 'dn:0.2': 1 }; SCHED.als = [{ n: 1, keys: ['dn:0.2'], sign: {} }]
    openScheduler(0)
  })
  await p.waitForTimeout(800)
  {
    const r = await p.evaluate(() => {
      /* the delete handler is delegated off the board and keyed on .mbtn */
      const del = document.createElement('span')
      del.className = 'mbtn'; del.dataset.ndel = '0.0'
      document.getElementById('sbBoard').appendChild(del)
      del.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      const out = {
        moved: SCHED.changes['dn:0.1'] || 'lost',
        dead: SCHED.changes['dn:0.2'] || 'gone',
        al: (SCHED.als[0] || { keys: [] }).keys.join(','),
      }
      del.remove(); return out
    })
    T('13 · the AL mark follows the row it marked', r.moved, 1)
    T('13 · and no mark is left on the dead address', r.dead, 'gone')
    T('13 · the issued AL is rewritten too', r.al, 'dn:0.1')
  }

  /* ---- 9 · the board's day tab puts down the armed slot ------------------ */
  {
    const armed = await p.evaluate(() => {
      const cell = document.querySelector('#sbBoard [data-slot]')
      if (!cell) return null
      armSlot(cell.dataset.slot); return cell.dataset.slot
    })
    await p.waitForTimeout(300)
    if (!armed) { T('9 · a board slot exists to arm', 'none found', 'found') } else {
      await p.click('[data-sbtab="3"]'); await p.waitForTimeout(500)
      const still = await p.evaluate(() => (ARM ? ARM.key : 'null'))
      console.log(`   9 · armed ${armed}, then switched to day 3`)
      T('9 · changing day puts the armed slot down', still, 'null')
    }
  }
  await p.evaluate(() => closeScheduler()); await p.waitForTimeout(400)

  /* ---- 12 · undo on the Inputs page redraws the table -------------------- */
  await p.evaluate(() => go('inputs')); await p.waitForTimeout(600)
  {
    const rows = () => p.evaluate(() => document.querySelectorAll('#inBody [data-inx]').length)
    const n0 = await p.evaluate(() => INPUTS.length), r0 = await rows()
    await p.evaluate(() => {
      INPUTS.unshift({ person: 'bane', date: 'Jul 13', allday: true, type: 'LL', remarks: 'probe', mod: '2026-07-28' })
      renderInputs(); histPush()
    })
    await p.waitForTimeout(400)
    const r1 = await rows()
    await p.evaluate(() => histApply(HIST.ix - 1)); await p.waitForTimeout(400)
    const n2 = await p.evaluate(() => INPUTS.length), r2 = await rows()
    console.log(`   12 · inputs ${n0}/${r0} → ${n0 + 1}/${r1} → ${n2}/${r2}`)
    T('12 · the added row really appears', r1, r0 + 1)
    T('12 · undo takes it back out of the model', n2, n0)
    T('12 · and the table follows the model', r2, n2)
  }

  /* ---- 14 · a traffic edit earns a history step and an amendment mark ---- */
  await p.evaluate(() => go('editsched')); await p.waitForTimeout(700)
  {
    const h0 = await p.evaluate(() => { SCHED.pending = {}; return HIST.ix })
    await p.click('#eWeek [data-air]'); await p.waitForTimeout(400)
    await p.click('#airAdd'); await p.waitForTimeout(400)
    const r = await p.evaluate(() => ({
      hist: HIST.ix, keys: Object.keys(SCHED.pending).filter(k => /^tr:/.test(k)).join(','),
    }))
    console.log(`   14 · traffic add — history ${h0} → ${r.hist} · key ${r.keys || 'NONE'}`)
    T('14 · a traffic add is undoable', r.hist > h0 ? 'stepped' : 'no step', 'stepped')
    T('14 · and lands in the next AL as a tr: key', r.keys ? 'marked' : 'NONE', 'marked')
  }

  console.log(errs.length ? '\nRUNTIME ERRORS:\n' + errs.join('\n') : '\nno runtime errors')
  if (noise.length) console.log('console (not asserted): ' + noise.join(' | '))
  console.log(`\n${pass} passed · ${fail} failed`)
  await b.close(); console.log('audit-async done')
  process.exit(fail || errs.length ? 1 : 0)
})().catch(e => { console.log('ERR', e.message); process.exit(1) })
