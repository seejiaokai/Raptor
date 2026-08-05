/* B40 — sc2.js adapted for the React port: SC slots are judged against their
   own shift window, the palette is cut to the crew holding that shift's
   currency, and SC NIGHT needs SC DAY.

   The original arms a slot and reads `#eRoster` in the SAME evaluate, and
   later runs `go('quals')` and clicks `#qEdit` on the next line. Both need a
   synchronous repaint; on the port the palette and the Quals page commit a
   tick later, so `$('qEdit')` came back null and the evaluate died. Same
   checks, same order, split across the async commit.

   The counts the reference prints (54 shown / 23 struck …) are printed here
   too but not asserted — the Aug-26 input-type changes move them on the port
   by design. What IS asserted is every contract the original states in its
   own "(want …)" notes.

   Run: node probes/adapted/sc2-async.cjs   (needs vite preview on 4173) */
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
  await p.fill('#luser', 'a'); await p.fill('#lpass', 'a')
  await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900)
  await p.evaluate(() => go('editsched')); await p.waitForTimeout(800)

  /* arm and let the palette commit before anything reads it */
  const arm = async k => {
    await p.evaluate(key => { disarmSlot(); armSlot(key) }, k)
    await p.waitForTimeout(350)
  }
  const cls = (id) => p.evaluate(x => {
    const el = document.querySelector('#eRoster .rpuck[data-person="' + x + '"]')
    return el ? (el.className.replace(/\s+/g, ' ').trim() || 'rpuck') : 'NOT SHOWN'
  }, id)

  /* ---- an empty day 0 with one SC wave on it ----------------------------- */
  const S = await p.evaluate(() => {
    const d = DAYS[0]
    ;(d.waves || []).forEach(w => w.formations.forEach(f => f.aircraft.forEach(a => { a.p = ''; a.w = '' })))
    ;['amt', 'oft'].forEach(k => ((d.sims || {})[k] || []).forEach(o => { o.p = ''; o.w = ''; o.who = ''; o.pax = []; o.more = [] }))
    ;(d.dutywaves || []).forEach(dw => dw.rows.forEach(r => { r.id = ''; r.more = [] }))
    ;(d.ground || []).forEach(g => { g.who = ''; g.more = [] })
    ;(d.allhands || []).forEach(x => { x.who = ''; x.more = [] })
    addWave(0, 'sc'); afterSchedMutate()
    const w = d.waves.find(x => x.kind === 'sc'), gi = d.waves.indexOf(w)
    const AM = w.formations[0], PM = w.formations[1]
    const mAM = AM.aircraft.findIndex(a => !a.spare), mPM = PM.aircraft.findIndex(a => !a.spare)
    const pilots = Object.keys(PEOPLE).filter(id => PEOPLE[id].seat === 'FCP' && !PEOPLE[id].special
      && !PEOPLE[id].archived && PEOPLE[id].quals && PEOPLE[id].quals.scDay)
    const fw = (d.waves || []).find(x => !isStandalone(x))
    return {
      gi, mAM, mPM, key: `0.${gi}.1.${mPM}.p`, fkey: `0.${d.waves.indexOf(fw)}.0.1.p`,
      win: `SC AM ${AM.to}-${AM.ld} · SC PM ${PM.to}-${PM.ld}`,
      A: pilots[0], B: pilots[1], C: pilots[2],
      cs: { A: PEOPLE[pilots[0]].cs, B: PEOPLE[pilots[1]].cs, C: PEOPLE[pilots[2]].cs },
    }
  })
  await p.waitForTimeout(400)
  console.log(`   ${S.win} · arming ${S.key}`)

  /* ---- 1 · the reported bug: a man on the OTHER half of the day ---------- */
  await p.evaluate(S => {
    const w = DAYS[0].waves[S.gi]
    w.formations[0].aircraft[S.mAM].p = S.A; afterSchedMutate()
  }, S)
  await arm(S.key)
  {
    const bar = await p.evaluate(S => slotBar(S.A, S.key) || '(clear)', S)
    console.log(`   1 · ${S.cs.A} on SC AM MAIN, planning SC PM MAIN — class "${await cls(S.A)}"`)
    T('1 · the other half of the day does not bar the PM shift', bar, '(clear)')
  }

  /* ---- 2 · a flight INSIDE the PM window bars, and names itself ---------- */
  await p.evaluate(S => {
    const fw = (DAYS[0].waves || []).find(x => !isStandalone(x)), ff = fw.formations[0]
    ff.to = '14:00'; ff.ld = '15:30'; ff.aircraft[0].p = S.B; afterSchedMutate()
  }, S)
  await arm(S.key)
  {
    const bar = await p.evaluate(S => slotBar(S.B, S.key) || '(clear)', S)
    const c = await cls(S.B)
    console.log(`   2 · ${S.cs.B} flying 14:00-15:30 — class "${c}" · bar "${bar}"`)
    T('2 · a flight inside the shift bars the SC slot', /inside this shift/.test(bar) ? 'BAR' : bar, 'BAR')
    T('2 · and the puck is struck in the palette', /\bno\b/.test(c) ? 'struck' : c, 'struck')
  }

  /* ---- 3 · a ground event inside the window does NOT bar ----------------- */
  await p.evaluate(S => {
    const g = (DAYS[0].ground || [])[0]
    if (g) { g.who = PEOPLE[S.C].cs; g.str = '14:00'; g.end = '15:00' }
    afterSchedMutate()
  }, S)
  await arm(S.key)
  {
    const r = await p.evaluate(S => {
      const bar = slotBar(S.C, S.key) || '(clear)'
      const before = slotVal(S.key); placeArmed(S.C); const after = slotVal(S.key)
      setSlotVal(S.key, before); afterSchedMutate()
      return { bar, plants: after === S.C ? 'YES' : 'NO' }
    }, S)
    console.log(`   3 · ${S.cs.C} on a ground event 14:00-15:00 — class "${await cls(S.C)}"`)
    T('3 · a ground event inside the window does not bar', r.bar, '(clear)')
    T('3 · and he really plants into the SC seat', r.plants, 'YES')
  }

  /* ---- 4 · no day-wide fade while an SC slot is armed -------------------- */
  await arm(S.key)
  {
    const r = await p.evaluate(() => {
      const pal = [...document.querySelectorAll('#eRoster .rpuck[data-person]')]
      return {
        shown: pal.length,
        busy: pal.filter(e => e.classList.contains('busy')).length,
        standby: pal.filter(e => e.classList.contains('standby')).length,
        struck: pal.filter(e => e.classList.contains('no')).length,
        nonCur: pal.filter(e => { const P = PEOPLE[e.dataset.person]; return !P.special && P.quals && !P.quals.scDay }).length,
        strip: (document.querySelector('#eRoster .ros-arm span') || {}).textContent || '',
      }
    })
    console.log(`   4 · SC slot armed: ${r.shown} shown · busy ${r.busy} · standby ${r.standby} · struck ${r.struck}`)
    console.log(`       arm strip: "${r.strip}"`)
    T('4 · an armed SC slot fades nobody day-wide', r.busy, 0)
    T('4 · and the palette lists nobody without SC DAY currency', r.nonCur, 0)
    T('4 · the arm strip names the shift', /SC DAY current only/.test(r.strip) ? 'named' : r.strip, 'named')
  }

  /* ---- 5 · an ordinary flying seat still fades the day the old way ------- */
  await arm(S.fkey)
  {
    const r = await p.evaluate(() => {
      const pal = [...document.querySelectorAll('#eRoster .rpuck[data-person]')]
      return { shown: pal.length, busy: pal.filter(e => e.classList.contains('busy')).length }
    })
    console.log(`   5 · ordinary flying seat armed: ${r.shown} shown · busy ${r.busy}`)
    T('5 · an ordinary seat still fades the men already flying', r.busy > 0 ? 'faded' : 'nobody faded', 'faded')
  }

  /* ---- 6 · a NIGHT shift lists only SC NIGHT holders --------------------- */
  await p.evaluate(S => {
    const PM = DAYS[0].waves[S.gi].formations[1]
    PM.to = '19:00'; PM.ld = '23:00'; afterSchedMutate()
  }, S)
  await arm(S.key)
  {
    const r = await p.evaluate(S => {
      const pal = [...document.querySelectorAll('#eRoster .rpuck[data-person]')]
      return {
        shift: slotRules(S.key).sc, shown: pal.length,
        nonCur: pal.filter(e => { const P = PEOPLE[e.dataset.person]; return !P.special && P.quals && !P.quals.scNight }).length,
      }
    }, S)
    console.log(`   6 · PM moved to 19:00-23:00 → ${r.shift} shift · ${r.shown} shown`)
    T('6 · the slot re-reads its shift from the window', r.shift, 'night')
    T('6 · and lists nobody without SC NIGHT currency', r.nonCur, 0)
  }
  await p.evaluate(() => disarmSlot())

  /* ---- 7 · SC NIGHT cannot stand without SC DAY -------------------------- */
  const seedBad = await p.evaluate(() => Object.keys(PEOPLE)
    .filter(id => PEOPLE[id].quals && PEOPLE[id].quals.scNight && !PEOPLE[id].quals.scDay).length)
  T('7 · the roster seeds nobody with SC NIGHT alone', seedBad, 0)
  await p.evaluate(() => go('quals')); await p.waitForTimeout(500)
  await p.click('#qEdit'); await p.waitForTimeout(300)
  {
    const id = await p.evaluate(() => Object.keys(PEOPLE)
      .find(x => PEOPLE[x].quals && !PEOPLE[x].quals.scDay && !PEOPLE[x].special))
    const tick = async k => { await p.click(`#qtbl td[data-q="${id}|${k}"]`); await p.waitForTimeout(150) }
    const q = () => p.evaluate(x => ({ d: !!PEOPLE[x].quals.scDay, n: !!PEOPLE[x].quals.scNight }), id)
    await tick('scNight'); const a = await q()
    await tick('scDay'); await tick('scNight'); const bq = await q()
    await tick('scDay'); const c = await q()
    console.log(`   7 · subject ${await p.evaluate(x => PEOPLE[x].cs, id)}`)
    T('7 · SC NIGHT is refused before SC DAY is held', a.n ? 'ticked' : 'blocked', 'blocked')
    T('7 · both stand once SC DAY is signed off', bq.d && bq.n ? 'both' : JSON.stringify(bq), 'both')
    T('7 · removing SC DAY takes SC NIGHT with it', !c.d && !c.n ? 'cascaded' : JSON.stringify(c), 'cascaded')
  }

  console.log(`\n${pass} passed · ${fail} failed`)
  await b.close(); console.log('sc2-async done')
  process.exit(fail ? 1 : 0)
})().catch(e => { console.log('ERR', e.message); process.exit(1) })
