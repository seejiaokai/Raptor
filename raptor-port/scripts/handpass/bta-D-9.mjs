/* Walker D — S31 (part 2): a day template with a blank seat applied to another day and refused on a published day; an issued version loaded back onto the working copy. */
import * as D from './bta-D-lib.mjs'
const { B, K, C, W, L, TUE, ID, CSN, sleep } = D
const R = K.R
const T = 'S31'
const WED = 2
const { browser, p, errors } = await K.fresh()
const toast = () => p.evaluate(() => { const e = document.getElementById('toastEl'); return e && getComputedStyle(e).opacity !== '0' ? e.textContent : null })
const flag = c => c.lines.some(t => /On leave but planned to fly/.test(t)) && c.ring
const sh = (...x) => x.flatMap(c => c ? [c.shot] : []).filter(Boolean)
const wc = async (tag, di = TUE, o = {}) => { await W.boardOff(p).catch(() => {}); await B.toEdit(p); return D.card(p, '#eWeek', di, tag, { puck: false, ...o }) }
const pendN = c => { const m = /^(\d+)\s*pending/i.exec(c.hd.pend || ''); return m ? +m[1] : 0 }
async function tplMenu(di) {
  await B.toEdit(p); await W.showDay(p, di)
  const b = p.locator(`#eWeek .day[data-day="${di}"] button`, { hasText: 'Templates' }).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(250)
  await b.click({ timeout: 4000 }); await sleep(600)
}
const visibleBtns = () => p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null).map(b => b.innerText.replace(/\s+/g, ' ').trim()).filter(t => /template|Save this|Apply|Replace|Manage|Use /i.test(t)).slice(0, 14))
try {
  const f = await D.file(p, 'LL', 'Walker D'); const s0 = await D.seatBlank(p)
  await tplMenu(TUE)
  await p.locator('button', { hasText: 'Save this day as a template' }).first().click({ timeout: 4000 }); await sleep(700)
  const t3 = await toast()
  const pic7 = await B.pic(p, 'dk-s31-7b-tpl-window')
  await p.locator('.modal:visible button, [role=dialog] button', { hasText: /^Done$/ }).first().click({ timeout: 3000 }).catch(async () => { await p.keyboard.press('Escape') }); await sleep(500)
  R(`${T}.7`, `Tuesday (LL filed, ${CSN} on a blank line, took ${s0.took}) saved as a day template through its Templates menu`, `toast "${t3}"`, /Saved as/.test(t3 || '') ? 'PASS' : 'FAIL', [pic7])
  /* the file's leave covers Tuesday only; apply the template to Wednesday */
  await tplMenu(WED)
  const wedItems = await visibleBtns()
  const pic8 = await B.pic(p, 'dk-s31-8-wed-templates-menu')
  const tb = p.locator('button', { hasText: /Template 1/ }).filter({ visible: true }).first()
  let applied = 'no "Template 1" button in Wednesday\'s menu'
  if (await tb.count()) { await tb.click({ timeout: 4000 }); await sleep(900); applied = `pressed; toast "${await toast()}"` }
  const conf = await visibleBtns()
  const ok = p.locator('button').filter({ hasText: /^(Apply|Replace|Yes|Confirm|Use)\b/i }).filter({ visible: true }).first()
  if (await ok.count()) { const lbl = (await ok.innerText()).trim(); await ok.click({ timeout: 4000 }).catch(() => {}); await sleep(900); applied += `; "${lbl}" pressed, toast "${await toast()}"` }
  const wd = await wc('dk-s31-9-wed', WED)
  const wedWaves = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label + '[' + w.formations.map(x => x.cs || '(blank)').join('/') + ']').join('  '), WED)
  const wedSeat = await p.evaluate(([i, id]) => JSON.stringify(window.DAYS[i].waves.flatMap(w => w.formations.flatMap(x => x.aircraft.map(a => (a.p === id ? 'p' : '') + (a.w === id ? 'w' : '')).filter(Boolean)))), [WED, ID])
  R(`${T}.8`, `Wednesday's Templates menu offered ${JSON.stringify(wedItems)}; applied: ${applied}`, `Wednesday now: waves ${wedWaves}; seats holding ${CSN}: ${wedSeat} · ${D.sayCard(wd)} (his leave covers Tuesday only, so Wednesday should be silent)`, wd.lines.length === 0 ? 'RECORDED' : 'FAIL', [pic8, ...sh(wd)])
  /* a leave for Wednesday: the warning follows the DATE */
  const C2 = await import('./rbl-C-lib.mjs')
  const f2 = await C2.fileInput(p, { type: 'LL', di: WED, allday: true, remarks: 'Wed leave' })
  const wd2 = await wc('dk-s31-10-wed-leave', WED)
  const tu2 = await wc('dk-s31-10-tue', TUE)
  R(`${T}.9`, `LL filed for Wednesday too`, `WEDNESDAY: ${D.sayCard(wd2)} || TUESDAY: ${D.sayCard(tu2)}`, 'RECORDED', [...sh(wd2), ...sh(tu2)])

  /* publish Tuesday with the warning, then try to apply the template onto the published day */
  const pub = await D.pub(p)
  await tplMenu(TUE)
  const tueItems = await visibleBtns()
  const tb2 = p.locator('button', { hasText: /Template 1/ }).filter({ visible: true }).first()
  let refused = 'no "Template 1" button on the published Tuesday'
  const before = await p.evaluate(i => JSON.stringify(window.DAYS[i].waves.map(w => w.label + w.formations.length)), TUE)
  const dis = (await tb2.count()) ? await tb2.isDisabled() : null
  const dtitle = (await tb2.count()) ? await tb2.getAttribute('title') : null
  if (dis) refused = `the template's button is greyed out (disabled), its tooltip says: "${dtitle}"`
  const picT = await B.pic(p, 'dk-s31-11a-tue-templates-menu')
  if ((await tb2.count()) && !dis) { await tb2.click({ timeout: 4000 }); await sleep(900); refused = `pressed; toast "${await toast()}"`
    const ok2 = p.locator('button').filter({ hasText: /^(Apply|Replace|Yes|Confirm|Use)\b/i }).filter({ visible: true }).first()
    if (await ok2.count()) { await ok2.click({ timeout: 4000 }).catch(() => {}); await sleep(800); refused += `; confirm pressed, toast "${await toast()}"` } }
  const after = await p.evaluate(i => JSON.stringify(window.DAYS[i].waves.map(w => w.label + w.formations.length)), TUE)
  const tp = await wc('dk-s31-11-tue-after-apply', TUE)
  R(`${T}.10`, `Tuesday published (${JSON.stringify(pub.r)}); then the template pressed in Tuesday's Templates menu (offered ${JSON.stringify(tueItems)})`, `${refused} · Tuesday's waves before/after: ${before === after ? 'unchanged ' + after : before + ' → ' + after} · ${D.sayCard(tp)}`, before === after && (dis || /not|can't|cannot|published|refus|only/i.test(refused)) ? 'PASS' : (before === after ? 'PARTIAL' : 'FAIL'), [picT, ...sh(tp)])

  /* the issued version loaded back onto the working copy; the leave lifted and filed again (exact restoration) */
  const lf = await D.lift(p, f.iid)
  const lw = await wc('dk-s31-12-lifted')
  const lk = await B.look(p, TUE, /Original/i)
  const ld = await B.load(p, TUE, { confirm: true })
  await B.backLive(p, TUE).catch(() => {})
  const lw2 = await wc('dk-s31-13-loaded')
  R(`${T}.11`, `Tuesday's leave lifted (${lf}; working copy "${lw.hd.pend}"), then the 👁 Original looked at and "Load onto working copy" pressed (${JSON.stringify(ld.said)})`, `after loading: ${D.sayCard(lw2)}`, 'RECORDED', [...sh(lw), ...sh(lw2)])
  const f3 = await D.file(p, 'LL', 'Walker D')
  const rw = await wc('dk-s31-14-refiled')
  const nLL = await p.evaluate(id => window.INPUTS.filter(x => x.person === id && x.type === 'LL').length, ID)
  R(`${T}.12`, `the Tuesday leave filed again after the load (his LL inputs now ${nLL}: one for Tuesday and one for Wednesday expected)`, D.sayCard(rw), flag(rw) && nLL === 2 ? 'RECORDED' : 'FAIL', sh(rw))
} catch (e) { R(T + '.p2', 'script', String(e.stack || e).slice(0, 800), 'FAIL', [await B.pic(p, 's31b-X')]) }
R(`${T}.p2.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('bta-D-s31b')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${String(r.saw).slice(0, 2400)}\n      pics ${(r.pics || []).join(' ')}`)
