/* Walker D — S31: a saved plan, a day template and an issued version with a blank seat; the absence added / lifted; each restored through its real control. */
import * as D from './bta-D-lib.mjs'
import * as RD from './rbl-D-lib.mjs'
const { B, K, C, W, L, TUE, ID, CSN, sleep } = D
const R = K.R
const T = 'S31'
const { browser, p, errors } = await K.fresh()
const WED = 2
const nLL = () => p.evaluate(id => window.INPUTS.filter(x => x.person === id && x.type === 'LL').length, ID)
const nAll = () => p.evaluate(() => window.INPUTS.length)
const toast = () => p.evaluate(() => { const e = document.getElementById('toastEl'); return e && getComputedStyle(e).opacity !== '0' ? e.textContent : null })
const flag = c => c.lines.some(t => /On leave but planned to fly/.test(t)) && c.ring
const noflag = c => c.lines.length === 0 && !c.ring
const sh = (...x) => x.flatMap(c => c ? [c.shot] : []).filter(Boolean)
const wc = async (tag, di = TUE) => { await W.boardOff(p).catch(() => {}); await B.toEdit(p); return D.card(p, '#eWeek', di, tag, { puck: false }) }
async function planMenu(di = TUE) { await B.toEdit(p); await W.showDay(p, di); const m = p.locator(`#eWeek [data-planmenu="${di}"]:visible`).first(); await m.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await m.click(); await sleep(450) }
async function tplMenu(di) { await B.toEdit(p); await W.showDay(p, di); const b = p.locator(`#eWeek .day[data-day="${di}"] button`, { hasText: 'Templates' }).first(); await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await b.click(); await sleep(600) }
const popText = () => p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null).map(b => b.innerText.trim()).filter(t => /template|Plan|Save|Apply|Manage/i.test(t)).slice(0, 14))

try {
  const f = await D.file(p, 'LL', 'Walker D'); const s0 = await D.seatBlank(p)
  const n0 = await nLL(); const a0 = await nAll()
  let c = await wc('dk-s31-1')
  R(`${T}.1`, `LL all Tuesday filed; ${CSN} on a blank flying line (took ${s0.took}); ${n0} LL input(s) of his, ${a0} inputs in all`, D.sayCard(c), flag(c) ? 'PASS' : 'FAIL', sh(c))

  /* the saved plan */
  await planMenu(); await p.locator('[data-plandup]:visible').first().click(); await sleep(900)
  const t1 = await toast()
  c = await wc('dk-s31-2')
  R(`${T}.2`, `Tuesday's plans menu → "+ Alt Plan" (toast: "${t1}"); the copy is now the live day`, D.sayCard(c) + ` · LL inputs of his ${await nLL()}, all inputs ${await nAll()}`, flag(c) && (await nLL()) === n0 ? 'PASS' : 'FAIL', sh(c))

  /* reorder the waves on the live copy: a new wave added and dragged above the old one */
  const w0 = await RD.orderOf(p, TUE)
  const nw = await K.addFlyWave(p, TUE)
  const mv = await RD.dragWave(p, TUE, 2, nw.gi).then(() => 'dragged', e => 'drag failed: ' + String(e).slice(0, 80))
  const w1 = await RD.orderOf(p, TUE)
  c = await wc('dk-s31-3')
  R(`${T}.3`, `on the copy a new wave added (+ Wave) and the wave holding him dragged below it (${mv})`, `waves before: ${w0} · after: ${w1} · ${D.sayCard(c)}`, flag(c) && c.lines.filter(t => /Vandal|this line/.test(t)).length === 1 ? 'PASS' : 'FAIL', sh(c))

  /* the absence lifted, then the first plan taken back */
  const lf = await D.lift(p, f.iid)
  c = await wc('dk-s31-4')
  R(`${T}.4`, `the leave lifted on the Inputs page (${lf})`, D.sayCard(c) + ` · LL inputs of his ${await nLL()}`, noflag(c) ? 'PASS' : 'FAIL', sh(c))
  await planMenu(); const items = await popText()
  await p.locator('[data-plansel]:visible').first().click(); await sleep(900)
  const t2 = await toast()
  const w2 = await RD.orderOf(p, TUE)
  c = await wc('dk-s31-5')
  R(`${T}.5`, `the plans menu: the first saved plan ("Plan A") picked to be the live day again (menu offered ${JSON.stringify(items)}; toast "${t2}")`, `waves now: ${w2} · ${D.sayCard(c)}`, noflag(c) ? 'PASS' : 'FAIL', sh(c))
  const f2 = await D.file(p, 'LL', 'Walker D again')
  c = await wc('dk-s31-6')
  const n2 = await nLL(), a2 = await nAll()
  R(`${T}.6`, `the leave filed again (LL inputs of his now ${n2}, inputs in all ${a2}; before the lift ${n0} / ${a0})`, D.sayCard(c), flag(c) && n2 === n0 && a2 === a0 && c.lines.filter(t => /Vandal|this line/.test(t)).length === 1 ? 'PASS' : 'FAIL', sh(c))

} catch (e) { R(T, 'script', String(e.stack || e).slice(0, 800), 'FAIL', [await B.pic(p, 's31-X')]) }
R(`${T}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('bta-D-s31')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${String(r.saw).slice(0, 2400)}\n      pics ${(r.pics || []).join(' ')}`)
