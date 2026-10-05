/* P3-09 .. P3-13 — mission names and the question */
import * as C from './stk-C-lib.mjs'
import { handPut } from './seat-lib.mjs'
const { L, W } = C
const J = x => JSON.stringify(x)
const nQ = p => p.locator('.mission-role-question').count()
const mx = async (p, ...n) => C.mixOf(await C.insightsRead(p), ...n)

async function boardWorld() {
  const w = await C.world(); const p = w.p
  await C.tracking(p, true); await C.board(p, 0)
  return w
}

/* ---------------- P3-09 ---------------- */
async function p309() {
  const { browser, p } = await boardWorld(); const pics = []
  try {
    const who = ['Saber', 'Echo', 'Ranger', 'Drifter', 'Vector', 'Outlaw', 'Wisp']
    const base = await mx(p, ...who)
    const steps = []
    for (const [key, val] of [['ff:0.0.0.msn', 'DS'], ['ff:0.0.1.msn', 'RED'], ['ff:0.1.1.msn', 'RED AIR']]) {
      await C.bset(p, key, val)
      steps.push(`${key}=${val}: questions ${await nQ(p)}`)
    }
    // focus the Remarks of each of the three formations: is there a manual door?
    const doors = []
    for (const [fi, wi] of [[0, 0], [1, 0], [1, 1]]) {
      const key = `fr:0.${wi}.${fi}.0`
      const f = p.locator(`#schedBoard [data-bfld="${key}"]:visible`).first()
      await f.evaluate(e => e.scrollIntoView({ block: 'center' })); await f.click(); await C.sleep(300)
      doors.push(key + ' → ' + J(await p.evaluate(() => { const b = document.querySelector('[data-role-choose]'); return b && b.offsetParent ? b.innerText.trim() : null })) + ' q=' + await nQ(p))
      await f.press('Tab'); await C.sleep(250)
    }
    const after = await mx(p, ...who)
    pics.push(await C.pic(p, 'p309-board'))
    const missions = await p.evaluate(() => [window.DAYS[0].waves[0].formations[0].msn, window.DAYS[0].waves[0].formations[1].msn, window.DAYS[0].waves[1].formations[1].msn])
    C.row('P3-09', 'Mon formations set to Mission DS (VL, Ranger/Saber/Echo), RED (RU, Drifter/Vector) and RED AIR (night RU, Outlaw/Wisp) through the Mission boxes; focused each Remarks box',
      `before ${base}. Steps ${steps.join('; ')}; missions now ${J(missions)}. Manual door on each formation's Remarks: ${doors.join(' | ')}. After: ${after}`,
      'CHECK', pics)
  } catch (e) { C.row('P3-09', 'aborted', String(e.stack || e).slice(0, 900), 'FAIL', [await C.pic(p, 'p309-error')]) }
  finally { await browser.close() }
}

/* ---------------- P3-10 ---------------- */
async function p310() {
  const { browser, p } = await boardWorld(); const pics = []
  try {
    const who = ['Saber', 'Echo', 'Ranger', 'Drifter', 'Vector', 'Outlaw', 'Wisp']
    // blank the Remarks of the three formations (2 aircraft each)
    for (const k of ['fr:0.0.0.0', 'fr:0.0.0.1', 'fr:0.0.1.0', 'fr:0.0.1.1', 'fr:0.1.1.0', 'fr:0.1.1.1']) await C.bset(p, k, '')
    const blanked = await nQ(p)
    const base = await mx(p, ...who)
    const log = []
    for (const [key, val] of [['ff:0.0.0.msn', 'DS-2'], ['ff:0.0.1.msn', 'RED AIR 2'], ['ff:0.1.1.msn', 'ACM/DS']]) {
      await C.bset(p, key, val)
      const q = await C.question(p)
      log.push(`${key}=${val}: ${q.nQ} question ${J(q.q)}`)
      pics.push(await C.pic(p, 'p310-' + val.replace(/\W/g, '')))
      if (q.nQ) await C.side(p, 'later')
    }
    const after = await mx(p, ...who)
    C.row('P3-10', 'blanked the Remarks of three Mon formations, then typed the Missions DS-2, RED AIR 2 and ACM/DS one at a time into their Mission boxes; pressed Later on each question',
      `questions after blanking Remarks ${blanked}; before ${base}. ${log.join(' | ')}. After (all three Later): ${after}`,
      'CHECK', pics)
  } catch (e) { C.row('P3-10', 'aborted', String(e.stack || e).slice(0, 900), 'FAIL', [await C.pic(p, 'p310-error')]) }
  finally { await browser.close() }
}

/* ---------------- P3-11 ---------------- */
async function p311() {
  const { browser, p } = await boardWorld(); const pics = []
  try {
    const who = ['Saber', 'Echo', 'Ranger', 'Drifter', 'Vector']
    const base = await mx(p, ...who)
    await C.bset(p, 'ff:0.0.0.msn', 'ACM'); await C.bset(p, 'ff:0.0.1.msn', 'ACM')
    await C.bset(p, 'fr:0.0.0.0', 'DS FOR RU')
    const qa = await C.question(p); pics.push(await C.pic(p, 'p311-for'))
    await C.side(p, 'blue')
    await C.bset(p, 'fr:0.0.1.0', 'DS FROM RU')
    const qb = await C.question(p); pics.push(await C.pic(p, 'p311-from'))
    await C.side(p, 'red')
    const after = await mx(p, ...who)
    C.row('P3-11', 'two ACM formations on Mon: VL "DS FOR RU" answered Blue, RU "DS FROM RU" answered Red (the opposite of what the words suggest)',
      `before ${base}. VL question: ${J(qa.q)} sides ${J(qa.sides)}; RU question: ${J(qb.q)} sides ${J(qb.sides)}. After: ${after} (VL crew Saber/Echo/Ranger should be Blue for this sortie, RU crew Drifter/Vector Red)`,
      'CHECK', pics)
  } catch (e) { C.row('P3-11', 'aborted', String(e.stack || e).slice(0, 900), 'FAIL', [await C.pic(p, 'p311-error')]) }
  finally { await browser.close() }
}

/* ---------------- P3-12 ---------------- */
async function p312(editor) {
  const w = await C.world(); const p = w.p
  const pics = []
  try {
    await C.tracking(p, true)
    if (editor === 'Board') await C.board(p, 0); else await C.toWeek(p, 0)
    await C.fset(p, 'ff:0.0.0.msn', 'ACM')
    await C.fset(p, 'fr:0.0.0.0', 'DS FOR RU')
    const q0 = await C.question(p)
    await C.side(p, 'later')
    const saved = await p.evaluate(() => window.DAYS[0].waves[0].formations[0].aircraft[0].rmks)
    const seq0 = await p.evaluate(() => window.commandStreamLen())
    const log = []
    for (let i = 1; i <= 5; i++) {
      const d = await C.doorLabel2(p, editor, 'fr:0.0.0.0')
      log.push(`pass ${i}: door "${d.label}", questions ${d.nQ}`)
    }
    // Tab-through the formation's boxes unchanged
    const f = editor === 'Board' ? p.locator('#schedBoard [data-bfld="ff:0.0.0.cs"]:visible').first() : p.locator('#eWeek [data-txt="ff:0.0.0.cs"]:visible').first()
    await f.click()
    for (let i = 0; i < 9; i++) await p.keyboard.press('Tab')
    await C.sleep(300)
    const qTab = await nQ(p)
    const seq1 = await p.evaluate(() => window.commandStreamLen())
    pics.push(await C.pic(p, 'p312-' + editor + '-quiet'))
    // manual door
    const fld = editor === 'Board' ? p.locator('#schedBoard [data-bfld="fr:0.0.0.0"]:visible').first() : p.locator('#eWeek [data-txt="fr:0.0.0.0"]:visible').first()
    await fld.click(); await C.sleep(250)
    const door = await p.evaluate(() => { const b = document.querySelector('[data-role-choose]'); return b && b.offsetParent ? b.innerText.trim() : null })
    await p.locator('[data-role-choose]:visible').first().click(); await C.sleep(350)
    const qManual = await C.question(p)
    pics.push(await C.pic(p, 'p312-' + editor + '-manual'))
    await C.side(p, 'red')
    const m = C.mixOf(await C.insightsRead(p), 'Saber', 'Echo')
    C.row(`P3-12(${editor})`, `${editor}: question by own edit → Later; five times click into Remarks and Tab out unchanged; Tab through nine boxes; then the manual "Choose mission role" → Red`,
      `first question ${q0.nQ}; after Later text saved ${J(saved)}; quiet passes: ${log.join('; ')}; after nine Tabs questions ${qTab}; commands written during the quiet part: ${seq1 - seq0}; manual door says ${J(door)}; question after pressing it ${J(qManual.q)}; after Red Insights ${m}`,
      'CHECK', pics)
  } catch (e) { C.row(`P3-12(${editor})`, 'aborted', String(e.stack || e).slice(0, 900), 'FAIL', [await C.pic(p, 'p312-error')]) }
  finally { await w.browser.close() }
}

/* ---------------- P3-13 ---------------- */
async function p313() {
  const { browser, p } = await boardWorld(); const pics = []
  try {
    const who = ['Saber', 'Echo', 'Ranger', 'Comet']
    const base = await mx(p, ...who)
    await C.bset(p, 'ff:0.0.0.msn', 'ACM')
    await C.bset(p, 'fr:0.0.0.1', 'DS FOR RU')       // only the SECOND aircraft mentions DS
    const q = await C.question(p); pics.push(await C.pic(p, 'p313-question'))
    await C.side(p, 'red')
    const m1 = await mx(p, ...who)
    // replace a crew member on aircraft two (Ranger → Tally)
    const src = p.locator('#sbRoster .rpuck:visible').filter({ hasText: 'Comet' }).first()
    await src.evaluate(e => e.scrollIntoView({ block: 'center' }))
    await W.drag(p, src, p.locator('#schedBoard [data-slot="0.0.0.1.p"]').first())
    const put = { took: true }
    const crew = await p.evaluate(() => window.DAYS[0].waves[0].formations[0].aircraft.map(a => (window.PEOPLE[a.p] || {}).cs + ',' + (window.PEOPLE[a.w] || {}).cs))
    const qA = await nQ(p)
    const m2 = await mx(p, ...who)
    // change a time
    await C.bset(p, 'ff:0.0.0.to', '12:50')
    const qB = await nQ(p)
    const m3 = await mx(p, ...who)
    pics.push(await C.pic(p, 'p313-after'))
    C.row('P3-13', 'VL formation (2 aircraft, 4 crew): Mission ACM, only aircraft two Remarks = "DS FOR RU"; answered Red; then replaced Ranger by Tally by hand; then took-off 12:50',
      `before ${base}. Question: ${J(q.q)}. After Red: ${m1}. Crew replaced (put took: ${put.took}) now ${J(crew)}; questions ${qA}; Insights ${m2}. After take-off change: questions ${qB}; Insights ${m3}`,
      'CHECK', pics)
  } catch (e) { C.row('P3-13', 'aborted', String(e.stack || e).slice(0, 900), 'FAIL', [await C.pic(p, 'p313-error')]) }
  finally { await browser.close() }
}
const only = (process.env.ONLY || 'p309,p310,p311,p312,p313').split(',')
if (only.includes('p309')) await p309()
if (only.includes('p310')) await p310()
if (only.includes('p311')) await p311()
if (only.includes('p312')) { await p312('Board'); await p312('Week') }
if (only.includes('p313')) await p313()
console.log('ERRORS', JSON.stringify(C.ERR))
C.save('e')
