/* aar.js adapted for the React port.

   The original runs `go('quals')` and then reads (and clicks) `#qtbl` inside
   the SAME evaluate. That works on the reference, where a nav is a synchronous
   rebuild; on the port React commits the Quals page a tick later, so the
   lookup returns null and the whole evaluate dies. Every step below is the
   original's check, split so the read happens after the commit.

   Two deliberate differences from the original, both strengthening:

   · `seq` enables editing first. The reference's own run never clicked
     "Enable editing", so its qtbl clicks were swallowed and the line printed
     the vacuous "blocked=true · both=false · cascade=true" you get when
     nothing ticks at all. With editing on, the NAAR-needs-DAAR ladder is
     actually exercised.
   · the palette check asserts instead of printing: every selectable puck must
     hold the currency the slot asks for.

   Run: node probes/adapted/aar-async.cjs   (needs vite preview on 4173) */
const { chromium } = require('playwright')
const URL = process.env.PORT_URL || 'http://localhost:4173/'

;(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
  const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 } })
  const p = await ctx.newPage()
  p.setDefaultTimeout(15000)
  p.on('pageerror', e => console.log('  PAGEERR', e.message))
  let pass = 0, fail = 0
  const T = (n, got, want) => {
    const ok = String(got) === String(want); ok ? pass++ : fail++
    console.log(`${ok ? ' ok  ' : 'FAIL '} ${n.padEnd(58)} want ${want} · got ${got}`)
  }
  await p.goto(URL)
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a')
  await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900)

  /* ---- parse · the remarks grammar, engine-only (ran clean before too) ---- */
  {
    const r = await p.evaluate(() => [
      ['1A: AAR', false, 'DAAR'], ['1A: AAR', true, 'NAAR'], ['A: AAR', false, 'DAAR'],
      ['AAR', false, 'DAAR'], ['AAR', true, 'NAAR'],
      ['1A: DAAR', true, 'DAAR'], ['2A: NAAR', false, 'NAAR'],
      ['1A: NO AAR', false, null], ['A: NO DAAR', false, null], ['NO NAAR', true, null],
      ['1A: NO AAR', true, null], ['1B: AAR', false, null], ['B: NAAR', true, null],
      ['1B: AAR // 2A: BFM', false, null], ['1A: BFM-6', false, null],
      ['2A: SAT-REF', false, null], ['PRI LSR', false, null],
      ['1A: NO DAAR / NAAR', false, 'NAAR'], ['1A: AAR // 1B: SEFE', false, 'DAAR'],
    ].filter(([rm, n, want]) => String(aarNeed(rm, n)) !== String(want))
      .map(([rm, n, want]) => `${JSON.stringify(rm)}${n ? '(night)' : ''} want ${want} got ${aarNeed(rm, n)}`))
    T('parse · every remarks form reads the same as the reference',
      r.length ? r.join(' | ') : 'all 19 agree', 'all 19 agree')
  }

  /* ---- seed · the roster cannot ship an impossible qualification --------- */
  {
    const r = await p.evaluate(() => {
      const ids = Object.keys(PEOPLE).filter(x => !PEOPLE[x].special)
      return {
        d: ids.filter(x => PEOPLE[x].quals.daar).length,
        n: ids.filter(x => PEOPLE[x].quals.naar).length,
        bad: ids.filter(x => PEOPLE[x].quals.naar && !PEOPLE[x].quals.daar).length,
        wso: ids.filter(x => PEOPLE[x].seat === 'RCP' && (PEOPLE[x].quals.daar || PEOPLE[x].quals.naar)).length,
      }
    })
    console.log(`   seed: DAAR ${r.d} · NAAR ${r.n}`)
    T('seed · nobody ships NAAR without DAAR', r.bad, 0)
    T('seed · no WSO holds a front-seat AAR qualification', r.wso, 0)
  }

  /* ---- seq · the ladder, on the Quals page ------------------------------- */
  await p.evaluate(() => go('quals')); await p.waitForTimeout(500)
  await p.click('#qEdit'); await p.waitForTimeout(300)
  {
    const id = await p.evaluate(() => Object.keys(PEOPLE)
      .find(x => PEOPLE[x].seat === 'FCP' && !PEOPLE[x].quals.daar && !PEOPLE[x].special))
    /* one click per commit — the grid is rebuilt after each tick, so the cell
       node from the previous read is stale by the time the next click lands */
    const tick = async k => {
      await p.click(`#qtbl td[data-q="${id}|${k}"]`)
      await p.waitForTimeout(150)
    }
    const q = () => p.evaluate(x => ({ daar: !!PEOPLE[x].quals.daar, naar: !!PEOPLE[x].quals.naar }), id)
    await tick('naar'); const a = await q()
    await tick('daar'); await tick('naar'); const bq = await q()
    await tick('daar'); const c = await q()
    const cs = await p.evaluate(x => PEOPLE[x].cs, id)
    console.log(`   seq subject: ${cs}`)
    T('seq · NAAR is refused before DAAR is held', a.naar ? 'ticked' : 'blocked', 'blocked')
    T('seq · both stand once DAAR is signed off', bq.daar && bq.naar ? 'both' : JSON.stringify(bq), 'both')
    T('seq · removing DAAR takes NAAR with it', !c.daar && !c.naar ? 'cascaded' : JSON.stringify(c), 'cascaded')
  }

  /* ---- the WSO column · AAR is struck through, not offered --------------- */
  {
    const r = await p.evaluate(() => {
      const wso = Object.keys(PEOPLE).find(x => PEOPLE[x].seat === 'RCP' && !PEOPLE[x].special)
      return {
        wsoOnFcpView: !![...document.querySelectorAll('#qtbl tbody tr')]
          .find(row => row.querySelector('[data-person="' + wso + '"]')),
        na: document.querySelectorAll('#qtbl td.qcell.na').length,
      }
    })
    T('quals · the FCP view lists no WSO', r.wsoOnFcpView ? 'listed' : 'absent', 'absent')
    T('quals · and strikes no AAR cell on that view', r.na, 0)
  }
  await p.click('#qViewW'); await p.waitForTimeout(400)
  {
    const r = await p.evaluate(() => ({
      na: document.querySelectorAll('#qtbl td.qcell.na').length,
      rows: document.querySelectorAll('#qtbl tbody tr:not(.grp)').length,
    }))
    console.log(`   WSO view: ${r.na} struck cells over ${r.rows} rows`)
    T('quals · the WSO view strikes DAAR and NAAR on every row', r.na, r.rows * 2)
  }

  /* ---- flag · the live AAR_QUAL warning, engine-only --------------------- */
  await p.evaluate(() => go('editsched')); await p.waitForTimeout(600)
  {
    const r = await p.evaluate(() => {
      const n = () => validate().all.filter(x => x.code === 'AAR_QUAL').length
      const f = DAYS[0].waves[0].formations[0]            // day wave, 12:40-14:05
      const noDaar = Object.keys(PEOPLE).find(x => PEOPLE[x].seat === 'FCP' && !PEOPLE[x].quals.daar && !PEOPLE[x].special)
      const dayOnly = Object.keys(PEOPLE).find(x => PEOPLE[x].quals.daar && !PEOPLE[x].quals.naar)
      f.aircraft[0].rmks = '1A: AAR'; f.aircraft[0].p = noDaar; afterSchedMutate()
      const a1 = n()
      f.aircraft[0].rmks = '1A: NO AAR'; afterSchedMutate(); const a2 = n()
      f.aircraft[0].rmks = '1B: AAR'; afterSchedMutate(); const a3 = n()
      f.aircraft[0].rmks = '1A: AAR'; f.aircraft[0].p = dayOnly; afterSchedMutate(); const a4 = n()
      const night = DAYS[0].waves[1].formations[0]        // night wave
      night.aircraft[0].rmks = '1A: AAR'; night.aircraft[0].p = dayOnly; afterSchedMutate()
      const a5 = n()
      f.aircraft[0].p = ''; f.aircraft[0].rmks = ''
      night.aircraft[0].p = ''; night.aircraft[0].rmks = ''; afterSchedMutate()
      return { a1, a2, a3, a4, a5 }
    })
    T('flag · no DAAR on a tanker line raises AAR_QUAL', r.a1, 1)
    T('flag · "NO AAR" in the same remark raises nothing', r.a2, 0)
    T('flag · the rear seat is not the one being tanked', r.a3, 0)
    T('flag · DAAR covers a DAY tanker line', r.a4, 0)
    T('flag · but not a NIGHT one', r.a5, 1)
  }

  /* ---- palette · the picker cuts to the currency the slot asks for ------- */
  {
    const key = await p.evaluate(() => {
      const s = document.querySelector('#eWeek .acrow .seat[data-slot$=".p"]')
      const k = s.dataset.slot
      disarmSlot(); setSlotVal(k, ''); acRef(k).a.rmks = '1A: AAR'; afterSchedMutate()
      return k
    })
    await p.waitForTimeout(300)
    await p.evaluate(k => armSlot(k), key)               // arm, THEN let it paint
    await p.waitForTimeout(400)
    const r = await p.evaluate(k => {
      const pk = [...document.querySelectorAll('#eRoster .rpuck[data-person]')]
      const ok = pk.filter(x => !x.classList.contains('no')).map(x => x.dataset.person)
        /* sentinel placeholders are never validated men — ALL joined ALL
           AVAIL on 28 Aug 26, so the filter matches the whole id, not a
           substring, or the new puck reads as a currency-less pilot */
        .filter(id => !/^(allavail|allsans|all)$/i.test(id))
      const rules = slotRules(k)
      return {
        aar: rules.aar || '-',
        shown: pk.length,
        selectable: ok.length,
        darkened: pk.filter(x => x.classList.contains('no')).length,
        wrong: rules.aar ? ok.filter(id => !aarOK(id, rules.aar)).length : 0,
        why: (pk.find(x => x.classList.contains('no')) || { dataset: {} }).dataset.why || '',
      }
    }, key)
    await p.evaluate(k => { disarmSlot(); acRef(k).a.rmks = ''; afterSchedMutate() }, key)
    console.log(`   palette: ${r.shown} shown · ${r.selectable} selectable · ${r.darkened} darkened · sample why "${r.why}"`)
    T('palette · the slot reads its AAR need off the remarks', r.aar, 'DAAR')
    T('palette · every selectable man holds that currency', r.wrong, 0)
    T('palette · and the ones who do not are darkened', r.darkened > 0 ? 'darkened' : 'none', 'darkened')
  }

  console.log(`\n${pass} passed · ${fail} failed`)
  await b.close(); console.log('aar-async done')
  process.exit(fail ? 1 : 0)
})().catch(e => { console.log('ERR', e.message); process.exit(1) })
