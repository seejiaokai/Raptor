// S7 event details and Reset to doc around a pick; S8 pace, end dates, lulls and Flex settings kept per squadron. PART=s7|s8
import { mk, closeAll, finish, as, go, pic, picsFor, note, step, check, T, hit, pickCourse, pickCrew, info, openBall, half, pickDate, undoBtn, pressUndo, pressRedo, shut, sleep } from './ja-lib.mjs'
import { fixture, waitTrk, openTrk, move, reload, readBoth, whole142, whole149 } from './ja-fx.mjs'
const SZ = process.env.SZ || 'd', PART = process.env.PART || 's7'
console.log('ja-07 v1', SZ, PART)
picsFor(`j07-${SZ}-${PART}`)
const EV = 'ACG-05'
const closePop = s => hit(s, s.page.locator('#pop .opts button', { hasText: /^Close$/ }), 220)
async function fromPop(s) { await openBall(s, EV); await hit(s, '#popEditInfo', 350); await s.page.waitForSelector('#infoModal', { timeout: 5000 }) }
const form = s => s.page.evaluate(() => ({ name: document.getElementById('ifName')?.value, hrs: document.getElementById('ifHrs')?.value, crew: document.getElementById('ifCrew')?.value, pre: document.getElementById('ifPre')?.value, reset: !!document.getElementById('ifReset') }))
async function fill(s, tag) { await s.page.locator('#ifName').fill(`NAME ${tag}`); await s.page.locator('#ifHrs').fill(`${tag} Hrs`); await s.page.locator('#ifCrew').fill(`CREW ${tag}`); await s.page.locator('#ifPre').fill(`PRE ${tag}`) }
/* the event read by every reader: its window on the chart, and Show All */
async function readers(s) {
  await openBall(s, EV); const pop = await s.page.evaluate(() => document.getElementById('popInfo')?.innerText.replace(/\s+/g, ' ').trim()); await closePop(s)
  await hit(s, s.desk ? '#showAllBtn' : '#showAllTab', 450)
  await s.page.locator('#saSearch').fill(EV); await sleep(s, 250)
  const all = await s.page.evaluate(() => document.getElementById('saBody')?.innerText.replace(/\s+/g, ' ').trim())
  await hit(s, '#saClose', 250)
  return { pop, all }
}
const shows = (r, tag) => r.pop.includes(`NAME ${tag}`) && r.all.includes(`NAME ${tag}`) && r.pop.includes(`CREW ${tag}`) && r.all.includes(`CREW ${tag}`)
const noneOf = (r, tag) => !r.pop.includes(tag) && !r.all.includes(tag)
/* every value of the Pace, End date and Lull cards for the student on screen */
async function pv(s) {
  await half(s, 'info')
  const v = await s.page.evaluate(() => ({
    pace: document.getElementById('epwIn')?.value, a: document.getElementById('targetIn')?.getAttribute('data-value') || '', b: document.getElementById('targetIn2')?.getAttribute('data-value') || '',
    lulls: [...document.querySelectorAll('#lullChips .lullchip')].map(c => c.textContent.replace(/\s+/g, ' ').trim()),
    req: [...document.querySelectorAll('.c-pace .o .r')].map(c => c.textContent.trim()),
    who: document.querySelector('.c-pace h3 .who')?.textContent.trim(),
  }))
  await half(s, 'flow'); return v
}
async function setPace(s, x) {
  await half(s, 'info'); const i = s.page.locator('#epwIn'); await i.scrollIntoViewIfNeeded(); await i.fill(String(x)); await i.press('Tab').catch(() => {}); await sleep(s, 300); await half(s, 'flow')
}
async function setEnd(s, box, iso) { await half(s, 'info'); await s.page.locator(box).first().scrollIntoViewIfNeeded(); await pickDate(s, box, iso); await half(s, 'flow') }
async function addLull(s, a, z) {
  await half(s, 'info'); await s.page.locator('#setLullBtn').scrollIntoViewIfNeeded(); await hit(s, '#setLullBtn', 300)
  const ym = a.slice(0, 7)
  for (let i = 0; i < 24; i++) { const h = await s.page.locator(`#lullCal .day[data-iso="${a}"]`).count(); if (h) break; await hit(s, ym > new Date().toISOString().slice(0, 7) ? '#lullNext' : '#lullPrev', 120) }
  await hit(s, `#lullCal .day[data-iso="${a}"]`, 200); await hit(s, `#lullCal .day[data-iso="${z}"]`, 350)
  if (await s.page.locator('#lullCal').count()) { note('lull window still up'); await hit(s, '#lullClose', 200) }
  await half(s, 'flow')
}
async function flexOpen(s) { await hit(s, '#flexBtn', 350); await s.page.waitForSelector('#trkFlexWin', { timeout: 4000 }) }
const flexRead = s => s.page.evaluate(() => ({ on: (() => { const e = document.querySelector('[data-testid="trk-flex-on"]'); return e.tagName === 'INPUT' ? e.checked : e.getAttribute('aria-checked') === 'true' })(), first: (() => { const e = document.querySelector('[data-testid="trk-flex-from-1"]'); return e.tagName === 'INPUT' ? e.value : e.textContent.trim() })(), inputs: document.querySelectorAll('#trkFlexWin input').length, save: !!document.querySelector('[data-testid="trk-flex-save"]') }))

try {
  const s = await mk(SZ)
  await step('fixture', async () => { await fixture(s); await openTrk(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A') })
  if (PART === 's7') {
    await step('S7 give each squadron its own details', async () => {
      await fromPop(s); const f0 = await form(s); note('details as shipped: ' + JSON.stringify(f0)); await fill(s, 'D142'); await hit(s, '#ifSave', 450)
      await move(s, '149'); await pickCourse(s, 'JA-149'); await fromPop(s); const f1 = await form(s)
      check('S7 149 opens with its own, not 142 words', !JSON.stringify(f1).includes('D142'), f1); await fill(s, 'D149'); await hit(s, '#ifSave', 450)
      const r = await readers(s); check('S7 149: chart and Show All agree', shows(r, 'D149') && noneOf(r, 'D142'), r); await pic(s, '01-149')
      await move(s, '142'); await pickCourse(s, 'JA-142'); const q = await readers(s); check('S7 142 kept its own after the pick', shows(q, 'D142') && noneOf(q, 'D149'), q); await pic(s, '02-142')
    })
    await step('S7 Cancel, then pick', async () => {
      await fromPop(s); await fill(s, 'JUNKA'); await hit(s, '#ifCancel', 300); await move(s, '149')
      const a = await readers(s); check('S7 Cancel wrote nothing to 149', shows(a, 'D149') && noneOf(a, 'JUNKA'), a)
      await move(s, '142'); const b = await readers(s); check('S7 Cancel wrote nothing to 142', shows(b, 'D142') && noneOf(b, 'JUNKA'), b)
    })
    await step('S7 Save, then pick at once', async () => {
      await fromPop(s); await fill(s, 'E142'); await hit(s, '#ifSave', 0); await move(s, '149')
      const a = await readers(s); check('S7 149 untouched by 142 save', shows(a, 'D149') && noneOf(a, 'E142'), a)
      await move(s, '142'); const b = await readers(s); check('S7 142 has the later save', shows(b, 'E142'), b)
    })
    await step('S7 pick first, then Save on 149', async () => {
      await move(s, '149'); await fromPop(s); await fill(s, 'E149'); await hit(s, '#ifSave', 350)
      const a = await readers(s); check('S7 149 shows its later save', shows(a, 'E149') && noneOf(a, 'E142'), a)
      await move(s, '142'); const b = await readers(s); check('S7 142 keeps its own', shows(b, 'E142') && noneOf(b, 'E149'), b)
    })
    await step('S7 Reset to doc on 142 only', async () => {
      await fromPop(s); const f = await form(s)
      if (!f.reset) { note('NOT WALKED: Reset to doc not offered on this event'); await hit(s, '#ifCancel', 200) }
      else {
        await hit(s, '#ifReset', 200); const g = await form(s); note('after Reset to doc: ' + JSON.stringify(g))
        check('S7 Reset puts wording back in the boxes (nothing of ours)', !JSON.stringify(g).includes('E142'), g); await hit(s, '#ifCancel', 200)
        const r0 = await readers(s); check('S7 Reset then Cancel keeps ours', shows(r0, 'E142'), r0)
        await fromPop(s); await hit(s, '#ifReset', 200); await hit(s, '#ifSave', 300)
        await move(s, '149'); const a = await readers(s); check('S7 a Reset on 142 leaves 149 alone', shows(a, 'E149'), a)
        await move(s, '142'); const b = await readers(s); check('S7 142 shows the doc wording', noneOf(b, 'E142') && noneOf(b, 'E149'), b); await pic(s, '03-142-reset')
      }
    })
    await step('S7 reload', async () => {
      await reload(s); await openTrk(s); await pickCourse(s, 'JA-142'); const a = await readers(s); check('S7 142 after reload has no foreign words', noneOf(a, 'E149') && noneOf(a, 'D149'), a)
      await move(s, '149'); await pickCourse(s, 'JA-149'); const b = await readers(s); check('S7 149 after reload', shows(b, 'E149') && noneOf(b, 'E142'), b)
      const r = await readBoth(s); check('S7 marks whole', whole142(r['142']) && whole149(r['149']), r)
    })
  }
  if (PART === 's8') {
    const ym = new Date().toISOString().slice(0, 7), next = (() => { const d = new Date(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + 2); return d.toISOString().slice(0, 7) })()
    const A1 = `${next}-10`, B1 = `${next}-20`, A2 = `${next}-12`, B2 = `${next}-22`, L1 = [`${next}-03`, `${next}-05`], L2 = [`${next}-14`, `${next}-16`]
    let v142, v149
    await step('S8 142 values', async () => {
      await setPace(s, 3.5); await setEnd(s, '#targetIn', A1); await setEnd(s, '#targetIn2', B1); await addLull(s, L1[0], L1[1])
      v142 = await pv(s); note('142: ' + JSON.stringify(v142))
      check('S8 142 took its values', v142.pace === '3.5' && v142.a === A1 && v142.b === B1 && v142.lulls.length === 1, v142); await pic(s, '01-142')
    })
    await step('S8 149 values, the pick between', async () => {
      await move(s, '149'); await pickCourse(s, 'JA-149'); await pickCrew(s, 'JA149A')
      const fresh = await pv(s); check('S8 149 did not inherit 142 values', fresh.pace !== '3.5' && fresh.a !== A1 && fresh.lulls.length === 0, fresh)
      await setPace(s, 1.5); await setEnd(s, '#targetIn', A2); await setEnd(s, '#targetIn2', B2); await addLull(s, L2[0], L2[1])
      v149 = await pv(s); note('149: ' + JSON.stringify(v149))
      check('S8 149 took its values', v149.pace === '1.5' && v149.a === A2 && v149.b === B2 && v149.lulls.length === 1, v149); await pic(s, '02-149')
    })
    await step('S8 each keeps its own', async () => {
      await move(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A'); const a = await pv(s)
      check('S8 142 unchanged after a pick', JSON.stringify(a) === JSON.stringify(v142), a)
      await move(s, '149'); await pickCourse(s, 'JA-149'); await pickCrew(s, 'JA149A'); const b = await pv(s)
      check('S8 149 unchanged after a pick', JSON.stringify(b) === JSON.stringify(v149), b)
    })
    await step('S8 lull Copy to and remove stay on their squadron', async () => {
      await move(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A')
      await half(s, 'info'); await s.page.locator('#copyLullBtn').scrollIntoViewIfNeeded(); await hit(s, '#copyLullBtn', 300)
      const names = await s.page.evaluate(() => [...document.querySelectorAll('#lullCopy label')].map(l => l.textContent.trim()))
      check('S8 Copy to offers only 142 students', names.some(n => n.includes('JA142B')) && !names.some(n => n.includes('JA149')), names)
      await s.page.locator('#lullCopy label', { hasText: 'JA142B' }).locator('input').check(); await hit(s, '#lullCopyOk', 350); await half(s, 'flow')
      await pickCrew(s, 'JA142B'); const b = await pv(s); check('S8 JA142B got the copied period', b.lulls.length === 1 && b.lulls[0] === v142.lulls[0], b)
      await half(s, 'info'); await hit(s, '#lullChips .lullchip button.x', 300); if (await s.page.locator('#dlgModal').count()) { note('remove asked: ' + (await s.page.locator('#dlgMsg').textContent())); await hit(s, '#dlgOk', 350) }; await half(s, 'flow')
      const b2 = await pv(s); check('S8 removed from JA142B', b2.lulls.length === 0, b2)
      await pickCrew(s, 'JA142A'); const a = await pv(s); check('S8 A keeps its period', a.lulls.length === 1, a)
      await move(s, '149'); await pickCourse(s, 'JA-149'); await pickCrew(s, 'JA149A'); const c = await pv(s); check('S8 149 lull untouched', JSON.stringify(c) === JSON.stringify(v149), c)
    })
    await step('S8 Undo waits with its squadron', async () => {
      await move(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A')
      const u0 = await undoBtn(s); note('142 undo offers: ' + JSON.stringify(u0))
      await setPace(s, 4.5); check('S8 142 pace changed', (await pv(s)).pace === '4.5', 'pace')
      const u1 = await undoBtn(s); check('S8 Undo names the 142 student', u1.undo?.on && /JA142A/.test(u1.undo.t), u1.undo)
      await move(s, '149'); await pickCourse(s, 'JA-149'); await pickCrew(s, 'JA149A'); const u2 = await undoBtn(s); note('149 undo offers: ' + JSON.stringify(u2))
      check('S8 on 149 the offered Undo is not 142 work', !u2.undo?.t?.includes('JA142A'), u2.undo)
      if (u2.undo?.on) { await pressUndo(s); const c = await pv(s); note('149 after its own Undo: ' + JSON.stringify(c)); await pressRedo(s) }
      const c2 = await pv(s); check('S8 149 values whole', c2.pace === v149.pace && c2.a === v149.a && c2.b === v149.b, c2)
      await move(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A'); const u3 = await undoBtn(s)
      check('S8 back on 142 its Undo is there', u3.undo?.on && /JA142A/.test(u3.undo.t), u3.undo)
      await pressUndo(s); const a = await pv(s); check('S8 Undo on 142 puts the pace back', a.pace === '3.5', a.pace); await pic(s, '03-142-undo')
      await move(s, '149'); await pickCourse(s, 'JA-149'); await pickCrew(s, 'JA149A'); const b = await pv(s); check('S8 142 Undo did not touch 149', b.pace === '1.5' && b.a === A2, b)
    })
    await step('S8 Flex settings: admin changes one squadron, member reads', async () => {
      await move(s, '142'); await flexOpen(s); const f0 = await flexRead(s); note('142 flex: ' + JSON.stringify(f0)); check('S8 admin can edit Flex', f0.save && f0.inputs > 0, f0)
      const from1 = s.page.locator('[data-testid="trk-flex-from-1"]'); const was = await from1.inputValue(); await from1.fill(String(+was + 1)); await hit(s, '[data-testid="trk-flex-save"]', 400)
      await flexOpen(s); const f1 = await flexRead(s); check('S8 142 Flex saved', f1.first === String(+was + 1), f1); await hit(s, '[data-testid="trk-flex-x"]', 250)
      await move(s, '149'); await flexOpen(s); const f2 = await flexRead(s); check('S8 149 Flex not changed by 142', f2.first === was, f2); await pic(s, '04-149-flex'); await hit(s, '[data-testid="trk-flex-x"]', 250)
      await move(s, '142')
      await as(s, 'us', 'us'); await openTrk(s, '142'); await flexOpen(s); const m = await flexRead(s); await pic(s, '05-member-flex')
      check('S8 member reads Flex: no field, no Save', m.inputs === 0 && !m.save && m.first === String(+was + 1), m); await hit(s, '[data-testid="trk-flex-x"]', 250)
      const pm = await s.page.locator('#trkFlexWin').count(); check('S8 member Flex window closes', pm === 0, pm)
    })
    await step('S8 reload', async () => {
      await reload(s, 'us', 'us'); await s.page.locator('#luser').count()
      await as(s, 'ad', 'a'); await openTrk(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A')
      const a = await pv(s); check('S8 142 after reload', a.pace === '3.5' && a.a === A1 && a.lulls.length === 1, a)
      await move(s, '149'); await pickCourse(s, 'JA-149'); await pickCrew(s, 'JA149A')
      const b = await pv(s); check('S8 149 after reload', b.pace === '1.5' && b.a === A2 && b.b === B2 && b.lulls.length === 1, b)
    })
  }
  await s.ctx.close()
} finally { finish(`j07-${SZ}-${PART}`); await closeAll() }
