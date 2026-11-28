// r4wf-mb-m11 — merge walk, Share B, M11 (Astra's M11, the route of r4wf-w2-b.mjs): Blue/Red tracking on (the Logic
// page's switch); a shared ALL-DAY leave Ranger + Hex on Wed 15 Jul (Hex flies wave 1, which it overlaps); the Blue/Red
// question raised in wave 1's first formation ("ACM", then "DS FOR RU" in its remarks) and left open; Ranger's Start
// 1800 under Unavailable, into his End (Tab on the desk, a tap on the phone); his End box measured; then Blue answered.
// EXPECTED (brief): the question still open after the rewrite and the answer lands on its formation; Ranger's box moves
// ≤1px; Ranger cut out, Hex untouched.
//   WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=desk|phone ENG=chromium|webkit node scripts/handpass/r4wf-mb-m11.mjs
import { L, J, sleep, add, done, world, openBoard, read, boxSel, pic, fixture, caretAt, heldRows, clickNow, pressAt, away, BUILD, TAG } from './r4wf-mb-lib.mjs'
console.log('r4wf-mb-m11 v4', BUILD, TAG)
const steps = [], pics = [], notes = []
try {
  const w = await world(); const p = w.page
  await L.go(p, 'logic'); const e = p.locator('#lgEdit:visible'); if (await e.count()) { await e.click(); await sleep(300) }
  const sw = p.locator('#lgMissionMix'); if (!(await sw.isChecked())) { await sw.setChecked(true); await sleep(400) }
  notes.push('Blue/Red switch on: ' + await sw.isChecked())
  /* an all-day leave: the input window's whole-day choice */
  await L.openDay(w, L.WED); await L.press(w, '#icPopAdd'); await p.locator('#inpEditPop #inpEditType').waitFor()
  await p.selectOption('#inpEditPop #inpEditType', 'LL')
  const spans = await p.evaluate(() => [...document.querySelectorAll('#inpEditSpan [data-span]')].map(b => b.getAttribute('data-span') + '=' + b.textContent.trim()))
  const ad = await p.evaluate(() => { const c = document.querySelector('#inpEditPop #inpEditAllday'); return c ? c.checked : null })
  notes.push('span choices ' + J(spans) + '; all-day tick ' + ad)
  await p.keyboard.press('Escape'); await sleep(300)
  const dis = p.getByRole('button', { name: /Discard|Close it/ }).first(); if (await dis.count()) await dis.click().catch(() => {})
  if (await p.locator('[data-testid="win-inputsday-x"]').count()) await L.press(w, '[data-testid="win-inputsday-x"]')
  const whole = spans.map(s => s.split('=')).find(([k, t]) => /all|full|whole/i.test(k + t))
  const iid = await fixture(w, [L.RANGER, L.HEX], { from: undefined, to: undefined, ...(whole ? { span: whole[0] } : {}) })
  await openBoard(w)
  steps.push({ ...(await read(p, 'filed')) })
  if (!/allday/.test(steps[0].store.join())) notes.push('NOTE: the leave is not all day: ' + J(steps[0].store))
  const bset = async (k, v) => { const b = p.locator(`#schedBoard [data-bfld="${k}"]:visible`).first(); await b.scrollIntoViewIfNeeded(); if (w.tap) await b.tap(); else await b.click(); await sleep(200); await b.fill(v); await b.press('Tab'); await sleep(450) }
  await bset('ff:2.0.0.msn', 'ACM'); await bset('fr:2.0.0.0', 'DS FOR RU')
  await p.mouse.click(3, 3).catch(() => {}); await sleep(400)
  const qn = () => p.evaluate(() => [...document.querySelectorAll('.mission-role-question')].filter(q => q.offsetHeight).map(q => ({ text: q.innerText.replace(/\s+/g, ' ').slice(0, 120), btns: [...q.querySelectorAll('button')].map(b => b.textContent.trim()), where: q.closest('[data-secmove]')?.getAttribute('data-secmove') })))
  const q0 = await qn(); notes.push('question raised: ' + J(q0))
  if (!q0.length) throw new Error('the Blue/Red question did not open')
  const form = () => p.evaluate(() => JSON.stringify(window.DAYS[2].waves))
  const f0 = await form()
  pics.push(await pic(w, 'm11-0-question', ['.mission-role-question']))
  const rs = await boxSel(p, 'Ranger', 'str'), re = await boxSel(p, 'Ranger', 'end')
  await clickNow(w, rs); await sleep(w.tap ? 650 : 250)
  await p.keyboard.press('Control+A'); await p.keyboard.type('1800')
  const measure = sel => p.evaluate(sel => { const b = document.querySelector(sel); const a = document.activeElement; return { top: b ? Math.round(b.getBoundingClientRect().top * 10) / 10 : null, focusIsBox: a === b, focus: a?.getAttribute('data-ifld') || a?.tagName, value: b?.value, q: document.querySelectorAll('.mission-role-question').length } }, sel)
  const before = await measure(re)
  if (w.tap) await p.locator(re).first().tap(); else await p.keyboard.press('Tab')
  const lift = await measure(re)
  if (w.tap) await p.screenshot({ path: `${L.OUT}/m11-1-tap-lift.png`, scale: 'css' })
  await sleep(800)
  /* the box he is in, re-found (its address may have changed with the cut) */
  const reNow = `#schedBoard [data-ifld="${await p.evaluate(() => document.activeElement?.getAttribute('data-ifld'))}"]`
  const after = await measure(reNow)
  steps.push({ ...(await read(p, '1800, into his End')), caretAt: await caretAt(p), held: await heldRows(p), q: await qn() })
  pics.push(await pic(w, 'm11-1-after-into-end', ['#sbBoard > [data-secmove$=".unav"]']))
  pics.push(await pic(w, 'm11-1b-question-after', ['.mission-role-question']))
  const moved = after.top != null && before.top != null ? Math.round((after.top - before.top) * 10) / 10 : null
  notes.push(`End box: before ${J(before)}, right after ${J(lift)}, settled ${J(after)}; moved ${moved}`)
  /* the control (AWAY=1): the caret taken out first (a tap on blank space), then Blue */
  if (process.env.AWAY) { await away(w); notes.push('CONTROL: caret taken out before Blue — caret now ' + await caretAt(p)) }
  /* answer Blue */
  const blue = p.locator('.mission-role-question button').filter({ hasText: /blue/i }).first()
  if (!(await blue.count())) throw new Error('no Blue button on the question ' + J(await qn()))
  if (!w.tap) { await blue.click(); await sleep(800) }
  else {
    /* the phone: up to three tries, each logging what lies under the finger and whether the question went */
    for (let t = 1; t <= 3; t++) {
      await blue.evaluate(el => el.scrollIntoView({ block: 'center' })); await sleep(400)
      const bb = await blue.boundingBox()
      const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2
      const under = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className + ' "' + e.textContent.trim().slice(0, 12) + '"' : 'none' }, [x, y])
      if (t === 1) await blue.tap(); else await p.touchscreen.tap(x, y)
      await p.screenshot({ path: `${L.OUT}/m11-blue-try${t}-lift.png`, scale: 'css' })
      await sleep(900)
      const left = (await qn()).length
      notes.push(`Blue try ${t} (${t === 1 ? 'locator tap' : 'finger at the measured middle'}) at (${Math.round(x)},${Math.round(y)}) on ${under}: questions left ${left}; caret ${await caretAt(p)}; undo ${await p.evaluate(() => document.querySelector('#sbUndo')?.title)}`)
      if (!left || !(await blue.count())) break
    }
  }
  const f1 = await form()
  const diff = []
  const walk = (a, b, path) => { if (J(a) === J(b)) return; if (a && b && typeof a === 'object' && typeof b === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) walk(a[k], b[k], path + '.' + k) } else diff.push(`${path}: ${J(a)} → ${J(b)}`) }
  walk(JSON.parse(f0), JSON.parse(f1), 'waves')
  steps.push({ ...(await read(p, 'Blue answered')), caretAt: await caretAt(p), held: await heldRows(p), q: await qn(), wavesChanged: diff.slice(0, 20) })
  pics.push(await pic(w, 'm11-2-after-blue', ['#sbBoard > [data-secmove$=".waves"]']))
  await p.mouse.click(3, 3).catch(() => {}); await sleep(600)
  steps.push({ ...(await read(p, 'caret left')) })
  const s = steps.at(-1).store
  const okStore = s.some(x => /^LL Ranger Jul 15 1080-1439/.test(x)) && s.some(x => /^LL Hex Jul 15 allday/.test(x)) && s.length === 2
  const qKept = after.q >= 1
  /* the answer is not kept in the day's waves (no change there); the Board's Undo names it: "the mission role for <callsign> — Blue" */
  const cs = await p.evaluate(() => document.querySelector('#schedBoard [data-bfld="ff:2.0.0.cs"]')?.value)
  const ans = steps.find(x => x.step === 'Blue answered')
  const m = /mission role for (.+?) — Blue/.exec(ans.undo || '')
  notes.push(`wave 1 formation 1 callsign "${cs}"; the Undo after the answer: ${ans.undo}; questions left ${ans.q.length}; the waves' saved data changed: ${diff.length}`)
  const answered = ans.q.length === 0 && !!m && m[1] === cs
  const v = Math.abs(moved ?? 99) <= 1 && after.focusIsBox && qKept && answered && okStore ? 'PASS' : 'FAIL'
  add('M11', v, { moved, kept: after.focusIsBox, qKept, answeredOnWave1: answered, okStore, notes, steps }, pics)
} catch (e) { add('M11', 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 300) + ' ' + J({ notes, steps }).slice(0, 3000), pics) }
await done('m11')
