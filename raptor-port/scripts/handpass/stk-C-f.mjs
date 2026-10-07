/* P3-14 structural edits / bulk; P3-15 person-specific eligibility */
import * as C from './stk-C-lib.mjs'
const { L, W } = C
const J = x => JSON.stringify(x)
const nQ = p => p.locator('.mission-role-question').count()
const ins = async p => { const o = await C.insightsRead(p); return o }

async function p314() {
  const w = await C.world(); const p = w.p; const pics = []
  try {
    await C.tracking(p, true); await C.board(p, 0)
    await C.bset(p, 'ff:0.0.0.msn', 'ACM')
    await C.bset(p, 'fr:0.0.0.0', 'DS FOR RU')
    const q1 = await nQ(p); await C.side(p, 'red')
    await C.bset(p, 'fr:0.0.0.1', 'DS FROM RU')     // second aircraft carries a different cue
    const q2 = await nQ(p); pics.push(await C.pic(p, 'p314-second-cue'))
    if (q2) await C.side(p, 'blue')
    const mBefore = C.mixOf(await ins(p), 'Saber', 'Echo', 'Ranger')
    // remove the cue-bearing second aircraft
    await p.locator('#schedBoard [data-ldel="0.0.0.1"]:visible').first().click(); await C.sleep(600)
    const qAfterRemove = await nQ(p)
    const left = await p.evaluate(() => window.DAYS[0].waves[0].formations[0].aircraft.map(a => a.rmks))
    pics.push(await C.pic(p, 'p314-after-remove'))
    const stacked = await p.locator('[data-role-ui]').count()
    const qtext = await C.question(p)
    if (qAfterRemove) await C.side(p, 'later')
    const mAfter = C.mixOf(await ins(p), 'Saber', 'Echo', 'Ranger')
    // variant: remaining cue UNANSWERED
    await C.bset(p, 'ff:0.0.1.msn', 'ACM'); await C.bset(p, 'fr:0.0.1.0', 'DS FOR RU'); if (await nQ(p)) await C.side(p, 'later')
    await C.bset(p, 'fr:0.0.1.1', 'DS FROM RU'); if (await nQ(p)) await C.side(p, 'later')
    await p.locator('#schedBoard [data-ldel="0.0.1.1"]:visible').first().click(); await C.sleep(600)
    const qVar = await nQ(p), qVarTxt = await C.question(p)
    pics.push(await C.pic(p, 'p314-variant'))
    if (qVar) await C.side(p, 'later')
    // bulk: build three unresolved formations on Monday, save as a template, apply to Wed
    await C.bset(p, 'ff:0.0.1.msn', 'ACM'); await C.bset(p, 'fr:0.0.1.0', 'DS FOR RU'); if (await nQ(p)) await C.side(p, 'later')
    await C.bset(p, 'ff:0.1.0.msn', 'ACM'); await C.bset(p, 'fr:0.1.0.0', 'DS FROM RU'); if (await nQ(p)) await C.side(p, 'later')
    await C.bset(p, 'ff:0.1.1.msn', 'ACM'); await C.bset(p, 'fr:0.1.1.0', 'DS FOR RU'); if (await nQ(p)) await C.side(p, 'later')
    await p.locator('#sbTpl').click(); await C.sleep(300)
    await p.locator('[data-daytplsave]').click(); await C.sleep(600)
    await p.locator('#daytplClose').click(); await C.sleep(400)
    await C.board(p, 2)
    await p.locator('#sbTpl').click(); await C.sleep(300)
    await p.locator('[data-daytplpick]').first().click(); await C.sleep(1000)
    const qBulk = await nQ(p)
    const fm = await p.evaluate(() => window.DAYS[2].waves.flatMap(w => w.formations.map(f => f.cs + '/' + f.msn + '/' + f.aircraft[0].rmks)))
    pics.push(await C.pic(p, 'p314-bulk'))
    const doors = []
    for (const [wi, fi] of [[0, 0], [0, 1], [1, 0], [1, 1]]) {
      const key = `fr:2.${wi}.${fi}.0`
      const f = p.locator(`#schedBoard [data-bfld="${key}"]:visible`).first()
      if (!(await f.count())) { doors.push(key + ' (absent)'); continue }
      await f.evaluate(e => e.scrollIntoView({ block: 'center' })); await f.click(); await C.sleep(300)
      doors.push(key + ' → ' + J(await p.evaluate(() => { const b = document.querySelector('[data-role-choose]'); return b && b.offsetParent ? b.innerText.trim() : null })) + ' q=' + await nQ(p))
      await f.press('Tab'); await C.sleep(250)
    }
    C.row('P3-14', 'VL formation with two aircraft carrying different cue clauses ("DS FOR RU" / "DS FROM RU"), answered; removed the cue-bearing aircraft with its ✕; then saved a Monday with three more unresolved conditional formations as a day template and applied it to Wed',
      `first cue: ${q1} question; second cue: ${q2} question (answer Blue); Insights before removal ${mBefore}. Removing aircraft two: questions ${qAfterRemove} (open UI blocks ${stacked}) ${J(qtext.q)}; Remarks left ${J(left)}; Insights after (Later) ${mAfter}. Variant (remaining cue unanswered, RU formation, aircraft two removed): questions ${qVar} ${J(qVarTxt.q)}. Template applied to Wed: questions on arrival ${qBulk}; Wed formations ${J(fm)}; manual doors: ${doors.join(' | ')}`,
      'CHECK', pics)
  } catch (e) { C.row('P3-14', 'aborted', String(e.stack || e).slice(0, 900), 'FAIL', [await C.pic(p, 'p314-error')]) }
  finally { await w.browser.close() }
}

async function p315() {
  const w = await C.world(); const p = w.p; const pics = []
  try {
    await C.tracking(p, true); await C.board(p, 0)
    const who = ['Saber', 'Echo', 'Ranger', 'Piston', 'Relay', 'Comet', 'Havoc', 'Nomad']
    const o0 = await ins(p); const base = C.mixOf(o0, ...who); const t0 = o0.tiles.join(' / ')
    // Saber: second sortie unresolved
    await C.bset(p, 'ff:0.1.0.msn', 'ACM'); await C.bset(p, 'fr:0.1.0.0', 'DS FROM RU'); await C.side(p, 'later')
    const o1 = await ins(p); const m1 = C.mixOf(o1, ...who); const t1 = o1.tiles.join(' / ')
    pics.push(await C.pic(p, 'p315-unresolved'))
    // cancel one aircraft: RU formation, aircraft two (Piston, Relay)
    await p.locator('#schedBoard [data-lcx="0.0.1.1"]:visible').first().click(); await C.sleep(500)
    const cxTxt = await p.evaluate(() => { const e = document.querySelector('#cxPop'); return e ? e.innerText.split(/\s+/).join(' ').slice(0, 200) : null })
    pics.push(await C.pic(p, 'p315-cxpop'))
    if (cxTxt) { await p.locator('#cxPop').getByRole('button', { name: /Cancel line/ }).click(); await C.sleep(600) }
    const cx = await p.evaluate(() => window.DAYS[0].waves[0].formations[1].aircraft.map(a => !!(a.cx || a.cancel || a.x)))
    const o2 = await ins(p); const m2 = C.mixOf(o2, ...who); const t2 = o2.tiles.join(' / ')
    // empty formation: + Line on wave 1
    const nF0 = await p.evaluate(() => window.DAYS[0].waves[0].formations.length)
    await p.locator('#schedBoard .sb-go').first().getByRole('button', { name: /\+ Line/ }).click(); await C.sleep(600)
    const nF1 = await p.evaluate(() => window.DAYS[0].waves[0].formations.length)
    const o3 = await ins(p); const t3 = o3.tiles.join(' / ')
    pics.push(await C.pic(p, 'p315-empty-line'))
    // standby rows: SC MAIN / AVALON / BB with a crew member each
    const added = []
    for (const [kind, who2] of [['sc', 'Comet'], ['avalon', 'Havoc'], ['bb', 'Nomad']]) {
      const wi = await p.evaluate(() => window.DAYS[0].waves.length)
      await p.locator('#schedBoard').getByRole('button', { name: /\+ Wave/ }).first().click(); await C.sleep(400)
      await p.locator(`.wavemenu [data-wmkind="${kind}"]`).click(); await C.sleep(700)
      const info = await p.evaluate(i => { const w = window.DAYS[0].waves[i]; return w ? w.label + '/standalone=' + w.standalone + '/' + JSON.stringify(w.formations.map(f => f.cs + ':' + f.aircraft.length)) : 'no wave' }, wi)
      const slot = await p.evaluate(i => { const e = document.querySelector(`#schedBoard [data-slot^="0.${i}."]`); return e ? e.getAttribute('data-slot') : null }, wi)
      const src = p.locator('#sbRoster .rpuck:visible').filter({ hasText: who2 }).first()
      let placed = 'no puck or slot'
      if (slot && await src.count()) {
        await src.evaluate(e => e.scrollIntoView({ block: 'center' }))
        await W.drag(p, src, p.locator(`#schedBoard [data-slot="${slot}"]`).first()).then(() => { placed = 'dragged' }, e => { placed = 'drag failed: ' + String(e).slice(0, 80) })
      }
      added.push(`${kind.toUpperCase()}→${who2} (wave ${wi} ${info}, slot ${slot}, ${placed})`)
    }
    const o4 = await ins(p); const m4 = C.mixOf(o4, ...who); const t4 = o4.tiles.join(' / ')
    pics.push(await C.pic(p, 'p315-standby'))
    // resolve Saber's outstanding role (night VL = wave 1, formation 0)
    const f = p.locator('#schedBoard [data-bfld="fr:0.1.0.0"]:visible').first()
    await f.evaluate(e => e.scrollIntoView({ block: 'center' })); await f.click(); await C.sleep(300)
    await p.locator('[data-role-choose]:visible').first().click(); await C.sleep(300)
    await C.side(p, 'red')
    const o5 = await ins(p); const m5 = C.mixOf(o5, ...who)
    pics.push(await C.pic(p, 'p315-resolved'))
    C.row('P3-15', 'Saber/Echo: Mon night VL set ACM "DS FROM RU" + Later (their day sortie stays plain BFM); Ranger/Piston/Relay only plain; CX on one RU aircraft (reason pop-up: ' + 'see row); "+ Line" empty formation; SC, AVALON and BB waves added from the + Wave menu with Comet / Havoc / Nomad dragged in',
      `before ${base} [${t0}]. After Saber's unresolved night sortie: ${m1} [${t1}]. After CX on RU aircraft two (pop-up said ${J(cxTxt)}; cancelled flags ${J(cx)}): ${m2} [${t2}]. After empty formation (${nF0}→${nF1} formations): [${t3}]. Standby lines: ${added.join(' ; ')}. Insights: ${m4} [${t4}]. After answering Saber's night formation Red: ${m5}`,
      'CHECK', pics)
  } catch (e) { C.row('P3-15', 'aborted', String(e.stack || e).slice(0, 900), 'FAIL', [await C.pic(p, 'p315-error')]) }
  finally { await w.browser.close() }
}
const only = (process.env.ONLY || 'p314,p315').split(',')
if (only.includes('p314')) await p314()
if (only.includes('p315')) await p315()
console.log('ERRORS', JSON.stringify(C.ERR))
C.save('f')
