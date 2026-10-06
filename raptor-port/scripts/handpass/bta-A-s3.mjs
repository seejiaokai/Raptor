/* walker A — S19 (end-only / start-only), S22 (CX, info-only), S23 (ALL / ALL AVAIL), S24 (twice in a row). Usage: node bta-A-s3.mjs <s19|s22|s23|s24> */
import * as A from './bta-A-lib.mjs'
import * as C from './rbl-C-lib.mjs'
const { B, K, W, L, TUE, ID, CSN, sleep } = A
const which = process.argv[2] || 's19'
const clip = s => String(s).replace(/\s+/g, ' ')
const sz = A.PHONE ? '390×844 phone' : '1440×900 desktop'
const OTHER_A = 'taipan', OTHER_B = 'bullet'
async function inWorld(id, fn) {
  const w = await K.fresh(); const { p, errors } = w
  try { await fn(p) } catch (e) { K.R(id, 'script', String(e.stack || e).slice(0, 500), 'FAIL', [await A.pic(p, ('ERR-' + id).replace(/\W+/g, '_'))]) }
  if (errors.length) K.R(id + '.err', 'browser errors', errors.join(' | ').slice(0, 400), 'FAIL')
  await w.browser.close()
}
const absOf = s => s.abs.map(w => w.msg)

/* ---------------- S19 ---------------- */
async function s19() {
  for (const [absName, filer] of [['OL all day (the whole day)', p => A.fileType(p, 'OL')], ['LL morning only (AM)', p => C.fileInput(p, { type: 'LL', di: TUE, allday: false, span: 'am', remarks: 'x-LL-AM' })]]) {
    const whole = /OL/.test(absName)
    for (const fam of ['duty', 'sim', 'fly']) {
      if (process.argv[3] && !process.argv[3].split(',').includes(fam)) continue
      if (process.argv[4] && !absName.startsWith(process.argv[4])) continue
      await inWorld(`S19 ${absName} × ${fam}`, async p => {
        const f = await filer(p)
        const stored = await p.evaluate(who => { const xs = window.INPUTS.filter(x => JSON.stringify(x).includes(who) && /^(OL|LL)$/.test(x.type)); const x = xs[xs.length - 1]; return x ? `${x.type} allday ${!!x.allday} half "${x.half || ''}" ${x.s}–${x.e}` : 'none' }, ID)
        const h = await A.build(p, fam); const bl = await A.blankIt(p, h)
        const u = await A.putX(p, h)
        const seatName = fam === 'fly' ? 'flying line' : fam === 'duty' ? 'duty row' : 'sim (OFT) row'
        const setBox = async (which, v) => {
          if (fam === 'fly') { await K.ff(p, TUE, h.gi, 0, which === 'start' ? 'to' : 'ld', v) }
          else { await K.boardTo(p, TUE); const spec = h.spec; await W.boardText(p, spec.box(h.ri, which === 'start' ? 'str' : 'end'), v) }
        }
        const steps = [
          ['blank', async () => {}, whole ? 'flag' : 'silent'],
          [fam === 'fly' ? 'landing 11:00 typed alone (no take-off)' : 'end 12:00 typed alone (no start)', async () => setBox('end', fam === 'fly' ? '11:00' : '12:00'), whole ? 'flag' : 'silent'],
          ['that end cleared again', async () => setBox('end', ''), whole ? 'flag' : 'silent'],
          [fam === 'fly' ? 'take-off 08:00 typed alone (inside the morning)' : 'start 08:00 typed alone (inside the morning)', async () => setBox('start', '08:00'), whole ? 'flag' : 'record'],
          [fam === 'fly' ? 'take-off 15:00 instead (afternoon, after the morning leave)' : 'start 15:00 instead (afternoon, after the morning leave)', async () => setBox('start', '15:00'), whole ? 'flag' : 'record'],
        ]
        for (const [label, act, exp] of steps) {
          await act()
          const st = await h.state()
          const s = await A.read(p, `s19-${absName.slice(0, 2)}-${fam}-${label.slice(0, 12)}`.replace(/\W+/g, '_'), { pics: 'list' })
          const flagged = s.abs.length >= 1 && s.ring
          const verdict = exp === 'record' ? 'RECORDED' : (exp === 'flag' ? flagged : (s.abs.length === 0)) ? 'PASS' : 'FAIL'
          K.R(`S19 ${absName} × ${seatName}: ${label}`, `${sz}: ${absName} filed (stored ${stored}); a new ${seatName}${bl.cleared ? ' (cleared)' : ''}, X put on it (${u.took}); ${label} [seat now: ${st}]`,
            `${A.say(s)} → expected ${exp === 'record' ? '(observation only)' : exp === 'flag' ? 'flagged' : 'silent (a part-day absence against a seat with no start)'}`, verdict, s.pics)
        }
      })
    }
  }
}

/* ---------------- S22 ---------------- */
async function s22() {
  await inWorld('S22', async p => {
    await A.fileType(p, 'OL')
    const fl = await A.build(p, 'fly'); await K.ff(p, TUE, fl.gi, 0, 'cs', 'ZQ')
    const du = await A.build(p, 'duty'); await du.setName('DESK Q')
    const gr = await A.build(p, 'ground'); await gr.setName('GRND Q')
    const pr = await A.build(p, 'prog'); await pr.setName('PROG Q')
    for (const h of [fl, du, gr, pr]) { const bl = await A.blankIt(p, h); await A.putX(p, h) }
    const names = { fly: /planned to fly ZQ/, duty: /DESK Q/, ground: /GRND Q/, prog: /PROG Q/ }
    const present = s => Object.fromEntries(Object.entries(names).map(([k, re]) => [k, s.abs.some(w => re.test(w.msg))]))
    const show = pr_ => Object.entries(pr_).map(([k, v]) => `${k} ${v ? 'flagged' : 'silent'}`).join(', ')
    const step = async (id, did, expect) => {
      const s = await A.read(p, `s22-${id}`.replace(/\W+/g, '_'), { pics: 'list' })
      const pr_ = present(s)
      const ok = Object.entries(expect).every(([k, v]) => pr_[k] === v)
      K.R(`S22 ${id}`, `${sz}: ${did}`, `${A.say(s)} · by row: ${show(pr_)} → expected ${show(expect)}`, ok ? 'PASS' : 'FAIL', s.pics)
    }
    const all = { fly: true, duty: true, ground: true, prog: true }
    await step('0 all four named rows, X on each', 'OL filed; a flying line ZQ, a duty row DESK Q, a Ground Programme row GRND Q, a Common Programme row PROG Q, each no times, X on each', all)
    const cx = async sel => {
      await K.boardTo(p, TUE)
      const b = p.locator(`#schedBoard ${sel}`).first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(500)
      const pop = await p.locator('#cxPop:not([hidden])').count()
      if (pop) { const un = p.locator('#cxUn:visible'); if (await un.count()) await un.click(); else await p.locator('#cxSave').click(); await sleep(700) }
      return pop ? 'popup' : 'direct'
    }
    let r = await cx(`[data-lcx="${TUE}.${fl.gi}.0.0"]`)
    await step('1 flying line CX', `the flying line's CX pressed (${r}: "Cancel line")`, { fly: false, duty: true, ground: true, prog: true })
    r = await cx(`[data-lcx="${TUE}.${fl.gi}.0.0"]`)
    await step('2 flying line restored', `the same CX pressed again (${r}: "Un-cancel")`, all)
    r = await cx(`[data-drcx="${TUE}.0.${du.ri}"]`)
    await step('3 duty row CX', `the duty row's CX pressed (${r})`, { fly: true, duty: false, ground: true, prog: true })
    r = await cx(`[data-drcx="${TUE}.0.${du.ri}"]`)
    await step('4 duty row restored', `the duty row's CX pressed again (${r})`, all)
    r = await cx(`[data-grcx="${TUE}.${gr.ri}"]`)
    await step('5 ground row CX', `the Ground Programme row's CX pressed (${r})`, { fly: true, duty: true, ground: false, prog: true })
    r = await cx(`[data-grcx="${TUE}.${gr.ri}"]`)
    await step('6 ground row restored', `the Ground Programme row's CX pressed again (${r})`, all)
    const info = async sel => { await K.boardTo(p, TUE); const b = p.locator(`#schedBoard ${sel}`).first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(600) }
    await info(`[data-grinfo="${TUE}.${gr.ri}"]`)
    await step('7 ground row info-only on', 'the Ground Programme row set to ⓘ info-only', { fly: true, duty: true, ground: false, prog: true })
    await info(`[data-grinfo="${TUE}.${gr.ri}"]`)
    await step('8 ground row info-only off', 'ⓘ pressed again', all)
    await info(`[data-pinfo="${TUE}.${pr.ri}"]`)
    await step('9 Common Programme row info-only on', 'the Common Programme row set to ⓘ info-only', { fly: true, duty: true, ground: true, prog: false })
    await info(`[data-pinfo="${TUE}.${pr.ri}"]`)
    await step('10 Common Programme row info-only off', 'ⓘ pressed again', all)
    /* the reversal protocol on the last state: Undo, Redo, reload */
    await A.undo(p); await step('11 Undo', "the top bar's Undo", { fly: true, duty: true, ground: true, prog: false })
    await A.redo(p); await step('12 Redo', "the top bar's Redo", all)
    await B.reloadAs(p, 'a'); await B.toEdit(p); await step('13 reload', 'the page reloaded and signed in again', all)
  })
}

/* S22b — ONE row only: a line's CX and a ground row's info-only, so any ring left on the puck cannot come from another row's warning */
async function s22b() {
  for (const kind of ['fly', 'ground']) await inWorld('S22b ' + kind, async p => {
    await A.fileType(p, 'OL')
    const h = await A.build(p, kind)
    if (kind === 'fly') await K.ff(p, TUE, h.gi, 0, 'cs', 'ZQ'); else await h.setName('GRND Q')
    await A.blankIt(p, h); await A.putX(p, h)
    const step = async (id, did) => {
      const s = await A.read(p, 's22b-' + kind + '-' + id, { pics: true })
      K.R('S22b ' + kind + ' ' + id, sz + ': ' + did, A.say(s) + ' · day list lines naming him: ' + s.absLines.length + ' · ring on the row puck: ' + (s.ring ? 'SOLID' : 'none') + ' chip [' + s.chip + ']', 'RECORDED', s.pics)
    }
    await step('1 flagged', 'OL filed; ONE ' + (kind === 'fly' ? 'flying line ZQ' : 'Ground Programme row GRND Q') + ' with X on it, no times; nothing else carries X')
    if (kind === 'fly') {
      await K.boardTo(p, TUE); let b = p.locator('#schedBoard [data-lcx="' + TUE + '.' + h.gi + '.0.0"]').first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(500); await p.locator('#cxSave').click(); await sleep(700)
      await step('2 CX', 'the line cancelled with CX')
      await K.boardTo(p, TUE); b = p.locator('#schedBoard [data-lcx="' + TUE + '.' + h.gi + '.0.0"]').first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(500); await p.locator('#cxUn').click(); await sleep(700)
      await step('3 restored', 'the line un-cancelled')
    } else {
      await K.boardTo(p, TUE); let b = p.locator('#schedBoard [data-grinfo="' + TUE + '.' + h.ri + '"]').first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(600)
      await step('2 info-only on', 'the row set to ⓘ info-only')
      await K.boardTo(p, TUE); b = p.locator('#schedBoard [data-grinfo="' + TUE + '.' + h.ri + '"]').first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(600)
      await step('3 info-only off', 'ⓘ pressed again')
    }
  })
}

/* ---------------- S23 ---------------- */
async function tapPlace(p, key, pid) {
  await K.boardTo(p, TUE)
  const armed = await C.armSeat(p, key)
  const found = await p.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).count()
  const t = found ? await C.pressName(p, pid) : 'NO PUCK IN THE LIST'
  return { armed, t }
}
async function dragPlace(p, key, pid) {
  await K.boardTo(p, TUE)
  const dst = p.locator(`#schedBoard [data-slot="${key}"]:visible, #schedBoard [data-fill="${key}"]:visible`).first()
  await dst.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  const src = p.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
  try { await W.drag(p, src, dst) } catch (e) { return { err: String(e).slice(0, 140) } }
  return { t: await C.toastNow(p) }
}
const rowJson = (p, kind, ri) => p.evaluate(([k, r]) => { const d = window.DAYS[1]; const o = k === 'duty' ? d.dutywaves[0].rows[r] : k === 'oft' ? d.sims.oft[r] : k === 'ground' ? d.ground[r] : k === 'prog' ? d.allhands[r] : null; return JSON.stringify(o) }, [kind, ri])
async function s23() {
  /* cockpits: tap and drag, ALL AVAIL and ALL, on a flying line, SC MAIN / SPARE, AVALON, BB */
  await inWorld('S23 cockpits', async p => {
    const seats = []
    const fl = await A.build(p, 'fly'); seats.push(['flying line', fl.key])
    const sc = await K.addStandby(p, TUE, 'sc'); seats.push(['SC MAIN', `${TUE}.${sc.gi}.0.0.p`], ['SC SPARE', `${TUE}.${sc.gi}.0.2.p`])
    const av = await K.addStandby(p, TUE, 'avalon'); seats.push(['AVALON MAIN', `${TUE}.${av.gi}.0.0.p`], ['AVALON SPARE', `${TUE}.${av.gi}.0.2.p`])
    const bb = await K.addStandby(p, TUE, 'bb'); seats.push(['BB MAIN', `${TUE}.${bb.gi}.0.0.p`], ['BB SPARE', `${TUE}.${bb.gi}.0.2.p`])
    const snap = () => p.evaluate(i => JSON.stringify(window.DAYS[i].waves.map(w => w.formations.map(f => f.aircraft.map(a => [a.p, a.w])))), TUE)
    const pend = () => p.evaluate(i => { const e = document.querySelector('.dpend'); return e ? e.innerText.trim() : '(no pending count)' }, TUE)
    for (const [lab, key] of seats) for (const pid of ['allavail', 'all']) for (const how of ['tap', 'drag']) {
      const before = await snap()
      const r = how === 'tap' ? await tapPlace(p, key, pid) : await dragPlace(p, key, pid)
      const after = await snap()
      const sh = await A.pic(p, `s23-${lab}-${pid}-${how}`.replace(/\W+/g, '_'))
      const refused = before === after
      K.R(`S23 ${pid === 'all' ? 'ALL' : 'ALL AVAIL'} on ${lab} by ${how}`, `${sz}: ${how === 'tap' ? 'seat armed, the name pressed in the crew list' : 'a real drag from the crew list onto the seat'}`,
        `armed ${r.armed || '-'}; the app said ${r.t ? '"' + clip(r.t).slice(0, 140) + '"' : r.err ? 'DRAG FAILED: ' + r.err : 'nothing'}; seat holds after: ${refused ? 'unchanged' : 'CHANGED'}`, refused && (r.t || r.err) ? (r.err ? 'PARTIAL' : 'PASS') : 'FAIL', [sh])
    }
  })
  /* blank non-cockpit rows */
  await inWorld('S23 rows', async p => {
    const rows = []
    await A.makeBBTemplate(p)
    rows.push(['duty row', 'duty', await A.build(p, 'duty')], ['sim (OFT) row', 'oft', await A.build(p, 'sim')], ['Ground Programme row', 'ground', await A.build(p, 'ground')], ['Common Programme row', 'prog', await A.build(p, 'prog')], ['BB desk', 'bbd', await A.build(p, 'bbDesk')])
    for (const [lab, kind, h] of rows) for (const pid of ['allavail', 'all']) for (const how of ['tap', 'drag']) {
      if (kind === 'oft' && (how === 'drag' || pid === 'all')) {/* keep the OFT row to the allavail tap and a drag below */}
      const before = kind === 'bbd' ? await p.evaluate(i => JSON.stringify(window.DAYS[i].dutywaves.map(w => w.rows)), TUE) : await rowJson(p, kind, h.ri)
      const key = kind === 'oft' ? `s:${TUE}.oft.${h.ri}.+` : h.key
      const r = how === 'tap' ? await tapPlace(p, key, pid) : await dragPlace(p, key, pid)
      const after = kind === 'bbd' ? await p.evaluate(i => JSON.stringify(window.DAYS[i].dutywaves.map(w => w.rows)), TUE) : await rowJson(p, kind, h.ri)
      const s = await A.read(p, `s23-${lab}-${pid}-${how}`.replace(/\W+/g, '_'), { pics: 'list' })
      /* the "?" count chip, if the app draws one on the board for this row */
      let chip = null
      await K.boardTo(p, TUE)
      const cc = p.locator('#schedBoard .oilcount.nostart:visible').first()
      if (await cc.count()) { await cc.evaluate(e => e.scrollIntoView({ block: 'center' })); await cc.click().catch(() => {}); await sleep(500); chip = { text: clip(await cc.innerText()), toast: await C.toastNow(p), title: clip(await cc.getAttribute('title') || '').slice(0, 200), pop: clip(await p.evaluate(() => { const e = [...document.querySelectorAll('.pop, .popover, .oilpop, #oilPop, [role=dialog], .tip')].find(x => x.offsetParent !== null); return e ? e.innerText : '' })).slice(0, 220) }; await p.keyboard.press('Escape'); await sleep(200) }
      const changed = before !== after
      K.R(`S23 ${pid === 'all' ? 'ALL' : 'ALL AVAIL'} on ${lab} by ${how}`, `${sz}: a blank ${lab} (no times); ${how}`, `armed ${r.armed || '-'}; the app said ${r.t ? '"' + clip(r.t).slice(0, 120) + '"' : r.err ? 'DRAG FAILED: ' + r.err : 'nothing'}; row ${changed ? 'took it' : 'unchanged'}; his name absent from the warnings; day's warnings naming anybody new: ${A.say(s)}; "?" count chip: ${chip ? JSON.stringify(chip) : 'none drawn'}`, changed && !r.err ? 'PASS' : r.err ? 'PARTIAL' : 'FAIL', s.pics)
    }
  })
}

/* ---------------- S24 ---------------- */
async function s24() {
  const cases = [['sim (OFT) row — front then rear seat of the same row', 'oft', k => `s:${TUE}.oft.${k.ri}.p`, k => `s:${TUE}.oft.${k.ri}.w`],
    ['sim (OFT) row — via "+" twice', 'oft', k => `s:${TUE}.oft.${k.ri}.+`, k => `s:${TUE}.oft.${k.ri}.+`],
    ['duty row — primary then extra', 'duty', k => k.key, k => k.key],
    ['Ground Programme row — primary then extra', 'ground', k => k.key, k => k.key],
    ['Common Programme row — crowd twice', 'prog', k => k.key, k => k.key]]
  for (const [label, kind, k1, k2] of cases) await inWorld('S24 ' + label, async p => {
    await A.fileType(p, 'OL')
    const h = await A.build(p, kind === 'oft' ? 'sim' : kind); await A.blankIt(p, h)
    await K.boardTo(p, TUE)
    const g1 = await tapPlace(p, k1(h), ID)
    const s1 = JSON.stringify(await p.evaluate(([k, r]) => { const d = window.DAYS[1]; return k === 'duty' ? d.dutywaves[0].rows[r] : k === 'oft' ? d.sims.oft[r] : k === 'ground' ? d.ground[r] : d.allhands[r] }, [kind, h.ri]))
    const a1 = await A.read(p, `s24-${kind}-first`.replace(/\W+/g, '_'), { pics: false })
    const g2 = await tapPlace(p, k2(h), ID)
    const s2 = JSON.stringify(await p.evaluate(([k, r]) => { const d = window.DAYS[1]; return k === 'duty' ? d.dutywaves[0].rows[r] : k === 'oft' ? d.sims.oft[r] : k === 'ground' ? d.ground[r] : d.allhands[r] }, [kind, h.ri]))
    const a2 = await A.read(p, `s24-${kind}-second`.replace(/\W+/g, '_'), { pics: 'list' })
    const refused = s1 === s2
    K.R(`S24 ${label}`, `${sz}: OL filed for X; a new ${h.label}; X put on it, then put on it AGAIN`, `first press: toast "${clip(g1.t || '').slice(0, 100)}", row ${s1.slice(0, 160)}; second press: toast "${clip(g2.t || '').slice(0, 140)}", row ${refused ? 'UNCHANGED' : 'CHANGED to ' + s2.slice(0, 200)}; warnings naming him before/after: ${a1.abs.length} / ${a2.abs.length} (${absOf(a2).join(' || ')})`, refused ? (g2.t ? 'PASS' : 'PARTIAL') : 'FAIL', a2.pics)
  })
  /* both cockpit seats of one aircraft */
  await inWorld('S24 cockpit', async p => {
    await A.fileType(p, 'OL')
    const fl = await A.build(p, 'fly'); await K.ff(p, TUE, fl.gi, 0, 'cs', 'ZQ')
    const g1 = await tapPlace(p, `${TUE}.${fl.gi}.0.0.p`, ID)
    const g2 = await tapPlace(p, `${TUE}.${fl.gi}.0.0.w`, ID)
    const ac = await p.evaluate(([i, g]) => { const a = window.DAYS[i].waves[g].formations[0].aircraft[0]; return `p "${a.p}" w "${a.w}"` }, [TUE, fl.gi])
    const s = await A.read(p, 's24-cockpit', { pics: true })
    const both = (ac.match(/split/g) || []).length === 2
    K.R('S24 cockpit — both seats of one aircraft', `${sz}: OL filed for X; a flying line ZQ; X put on its front seat, then on its rear seat`, `first toast "${clip(g1.t || '').slice(0, 100)}", second toast "${clip(g2.t || '').slice(0, 140)}"; aircraft now ${ac}; ${A.say(s)} (the existing policy is warning-only: expected both seats held)`, both ? 'PASS' : 'FAIL', s.pics)
  })
}

if (which === 's19') await s19()
if (which === 's22') await s22()
if (which === 's22b') await s22b()
if (which === 's23') await s23()
if (which === 's24') await s24()
B.savePart('bta-A-' + which)
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n      ${clip(r.did).slice(0, 220)}\n      → ${clip(r.saw).slice(0, 1300)}`)
