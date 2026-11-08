console.log('oeb-w1-saved v1')
import { launch, closeAll, open, openBoard, oilOn, oilIsOn, swChecked, selCount, toastText, noteText, sleep, pic, BAR, SW, toTop, press, mkReport, saveRows, blur } from './oeb-w1-lib.mjs'
import { publish, put, tap as hpTap, type as hpType } from './lib.mjs'

const only = (process.argv[3] || '').split(',').filter(Boolean)
const sizes = process.argv[2] ? [process.argv[2]] : ['phone', 'pc']
const rep = mkReport()
const WANT = 'Nothing on this day earns OIL. Turn off the switch and each man earns as he did before.'
const REFUSE = 'Nothing on this day earns. Turn off the switch first.'

const pressWords = async W => { const l = W.page.locator(SW).filter({ visible: true }).first(); const b = await l.boundingBox(); const pos = { x: b.width - 10, y: b.height / 2 }; if (W.phone) await l.tap({ position: pos }); else await l.click({ position: pos }) }
const tapEl = async (W, loc) => { await loc.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); if (W.phone) await loc.tap(); else await loc.click() }
const puckOf = (W, text) => W.page.locator('#schedBoard .oilpk .puck').filter({ hasText: new RegExp('^' + text) }).filter({ visible: true }).first()
const figures = page => page.evaluate(() => {
  const c = k => document.querySelectorAll('#schedBoard .oilpk.' + k).length
  const f = [...document.querySelectorAll('#schedBoard .oilpk .puck')].find(p => /^Fable/.test(p.innerText.trim()))
  const m = [...document.querySelectorAll('#schedBoard .oilpk .puck')].find(p => /^Ridge/.test(p.innerText.trim()))
  return { on: c('on'), off: c('off'), inert: c('inert'), glow: document.querySelectorAll('#schedBoard .oilpk .puck.oilglow').length, dim: document.querySelectorAll('#schedBoard .oilpk .puck.oildim').length, fable: f ? f.className.replace(/puck |sm /g, '') : null, ridge: m ? m.className.replace(/puck |sm /g, '') : null }
})
const pend = page => page.evaluate(() => {
  const t = e => e ? e.innerText.trim().replace(/\s+/g, ' ') : null
  const panels = [...document.querySelectorAll('#schedBoard .sb-panel')]
  const sign = panels.find(p => /^SIGN-OFF/i.test(p.innerText.trim()))
  const side = document.getElementById('sbSide')
  return { chip: t(document.querySelector('#schedBoard .verchip')), alcount: t(document.querySelector('#schedBoard [data-alcount], #schedBoard .alchip')), sign: t(sign), signSel: sign ? [...sign.querySelectorAll('select')].map(s => s.value || s.options[s.selectedIndex]?.text).join(',') : null, beak: [...document.querySelectorAll('#schedBoard [data-beak],#schedBoard [data-alpub]')].map(b => t(b) + (b.disabled ? '(disabled)' : '')), side: side ? t(side).slice(0, 150) : null, top: panels.slice(0, 2).map(p => t(p).slice(0, 200)) }
})
const snap = async W => ({ sw: await swChecked(W.page), ...(await figures(W.page)) })
const rd = async W => JSON.stringify(await snap(W))
const undoBtn = W => W.page.evaluate(() => { const b = document.getElementById('sbUndo'); return b ? b.disabled : null })
const clickId = async (W, id) => { await press(W, '#' + id); await sleep(550) }
const doneOil = async W => { await W.page.locator('#schedBoard .daybar [data-oilmode].done').filter({ visible: true }).first()[W.phone ? 'tap' : 'click'](); await sleep(700) }
const enterSat = async W => { await open(W); }

const SC = {}
// ---------------------------------------------------------------- W1.9 + A5 + A6
SC.W19 = async W => {
  await open(W)
  const fab = await figures(W.page)
  const fableThere = await W.page.evaluate(() => !!document.querySelector('#schedBoard [data-person="fable"], #schedBoard .puck'))
  const p0 = await pend(W.page)
  const pub = await publish(W.page, 5)
  await sleep(600)
  const p1 = await pend(W.page)
  await toTop(W); const pa = await pic(W, `W1.9-${W.size}-published`, { full: true })
  await oilOn(W); await toTop(W)
  const f2 = await figures(W.page); const p2 = await pend(W.page)
  await pressWords(W); await sleep(700)
  const f3 = await figures(W.page); const p3 = await pend(W.page); const sw3 = await swChecked(W.page); const n3 = await noteText(W.page); const t3 = await toastText(W.page)
  await toTop(W); const pb = await pic(W, `W1.9-${W.size}-switch-on`, { full: true })
  await pressWords(W); await sleep(700)
  const f4 = await figures(W.page); const p4 = await pend(W.page); const sw4 = await swChecked(W.page); const t4 = await toastText(W.page)
  await toTop(W); const pc = await pic(W, `W1.9-${W.size}-switch-off`, { full: true })
  const j = o => JSON.stringify(o)
  rep.add({ sc: 'W1.9', size: W.size, res: pub.published ? 'RECORDED' : 'NOT WALKED', said: `publish: ${j(pub)}. Before publish: ${j(p0)}. After publish: ${j(p1)}. Mode on, before switch: ${j(p2)}; figures ${j(f2)}. Switch ON: switch=${sw3} note=${j(n3)} passing note=${j(t3)}; ${j(p3)}; figures ${j(f3)}. Switch OFF: switch=${sw4} passing note=${j(t4)}; ${j(p4)}; figures ${j(f4)}`, pic: `${pa}, ${pb}, ${pc}` })
  const same = j(p4) === j(p2)
  rep.add({ sc: 'A5/A6', size: W.size, res: pub.published ? (same ? 'PASS' : 'RECORDED') : 'NOT WALKED', said: `pending/sign-offs before the switch: ${j(p2)}; after ON: ${j(p3)}; after OFF: ${j(p4)}; off equals before: ${same}; figures before ${j(f2)} / on ${j(f3)} / off ${j(f4)} (earning counts back: ${j(f2) === j(f4)})`, pic: `${pb}, ${pc}` })
}
// ---------------------------------------------------------------- W1.10
SC.W110 = async W => {
  await open(W); await oilOn(W); await toTop(W)
  await pressWords(W); await sleep(600)
  const swBefore = await swChecked(W.page)
  const c = W.page.locator('#schedBoard .oilcount').filter({ visible: true }).first()
  const hasCount = (await c.count()) > 0
  const winOpen = () => W.page.evaluate(() => [...document.querySelectorAll('.availwin')].some(e => e.getBoundingClientRect().width > 0))
  let notes = []
  if (hasCount) {
    await tapEl(W, c); await sleep(800); const o1 = await winOpen(); await pic(W, `W1.10-${W.size}-window-open`, { full: true })
    // OIL tab
    const tab = W.page.locator('.availwin .win-tab').filter({ hasText: /earns OIL/ }).first()
    await (W.phone ? tab.tap() : tab.click()); await sleep(500)
    const tabOn = await W.page.evaluate(() => document.querySelector('.availwin .win-tab.on')?.innerText.replace(/\s+/g, ' '))
    await pic(W, `W1.10-${W.size}-window-oiltab`, { full: true })
    const x = W.page.locator('.availwin .win-x').first(); await (W.phone ? x.tap() : x.click()); await sleep(600)
    const c1 = await winOpen(); await pic(W, `W1.10-${W.size}-window-closed-x`, { full: true })
    await tapEl(W, c); await sleep(800); const o2 = await winOpen(); await pic(W, `W1.10-${W.size}-window-reopen`, { full: true })
    await W.page.keyboard.press('Escape'); await sleep(600)
    const c2 = await winOpen(); await pic(W, `W1.10-${W.size}-window-closed-esc`, { full: true })
    if (c2) { const x2 = W.page.locator('.availwin .win-x').first(); await (W.phone ? x2.tap() : x2.click()); await sleep(500) }
    notes.push(`ESCAPE left the window ${c2 ? 'OPEN (closed it by ✕ after)' : 'closed'}; window opened=${o1}; OIL tab selected="${tabOn}"; closed by ✕ (still open=${c1}); reopened=${o2}; Escape (still open=${c2}); mode still on=${await oilIsOn(W.page)}; switch=${await swChecked(W.page)}`)
    var ok = o1 && !c1 && o2 && !c2; var o1ok = o1 && !c1 && o2
  } else { notes.push('no placeholder count on this day'); var ok = null }
  await toTop(W)
  await doneOil(W); const left = !(await oilIsOn(W.page)); await pic(W, `W1.10-${W.size}-mode-left`, { full: true })
  await press(W, '#sbDone'); await sleep(900)
  const boardClosed = !(await W.page.evaluate(() => { const b = document.querySelector('#schedBoard'); return !!b && b.getBoundingClientRect().width > 0 }))
  await pic(W, `W1.10-${W.size}-board-closed`, { full: true })
  await openBoard(W, 5); await oilOn(W); await toTop(W)
  const swAfter = await swChecked(W.page); const nt = await noteText(W.page); await pic(W, `W1.10-${W.size}-reopened`, { full: true })
  rep.add({ sc: 'W1.10', size: W.size, res: 'RECORDED', said: `${notes.join('; ')}; mode left=${left}; board closed=${boardClosed}; switch before=${swBefore}, after reopen+OIL Earn=${swAfter} note=${JSON.stringify(nt)}`, pic: `W1.10-${W.size}-reopened.png` })
}
// ---------------------------------------------------------------- A11
SC.A11 = async W => {
  await open(W); await oilOn(W); await toTop(W)
  await pressWords(W); await sleep(600)
  const sw1 = await swChecked(W.page)
  await toTop(W); await doneOil(W)
  const N = await W.page.evaluate(() => window.DAYS[5].ground.length)
  await hpTap(W.page, '[data-gradd="5"]'); await sleep(500)
  const N2 = await W.page.evaluate(() => window.DAYS[5].ground.length)
  if (N2 !== N + 1) return rep.add({ sc: 'A11', size: W.size, res: 'NOT WALKED', said: `+ Item did not add a ground row (${N} -> ${N2})`, pic: '' })
  const ix = N
  await hpType(W.page, `[data-bfld="gr:5.${ix}.str"]`, '08:00'); await hpType(W.page, `[data-bfld="gr:5.${ix}.end"]`, '18:00')
  const pid = await W.page.evaluate(() => { const r = [...document.querySelectorAll('#sbRoster .rpuck[data-person]')].find(p => /^Ace/.test(p.innerText.trim())) || document.querySelector('#sbRoster .rpuck[data-person]'); return r && r.dataset.person })
  const got = await put(W.page, `[data-fill="g:5.${ix}.+"]`, [pid])
  if (String(got).startsWith('FAILED')) return rep.add({ sc: 'A11', size: W.size, res: 'NOT WALKED', said: `could not add a man to the new row: ${got}`, pic: '' })
  await sleep(500)
  const times = await W.page.evaluate(i => ({ s: window.DAYS[5].ground[i]?.str, e: window.DAYS[5].ground[i]?.end, who: window.DAYS[5].ground[i]?.who }), ix)
  await oilOn(W); await toTop(W)
  const row = W.page.locator(`#schedBoard .oilpk`)
  const pk = row.locator(`.puck[data-person="${pid}"]`).first()
  const cls = await pk.evaluate(e => e.className + ' <' + e.closest('.seat').className + '>')
  await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  if (W.phone) await pk.tap(); else await pk.click()
  await sleep(120); const t = await toastText(W.page); const pn = await pic(W, `A11-${W.size}-tap-now`, { full: true })
  const sel = await selCount(W.page)
  await toTop(W); await pressWords(W); await sleep(700)
  const sw2 = await swChecked(W.page)
  const cls2 = await W.page.locator(`#schedBoard .oilpk .puck[data-person="${pid}"]`).first().evaluate(e => e.className + ' <' + e.closest('.seat').className + '>')
  await W.page.locator(`#schedBoard .oilpk .puck[data-person="${pid}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  const pf = await pic(W, `A11-${W.size}-switch-off`, { full: true })
  const ok = !/oilglow/.test(cls) && t && t.text === REFUSE && sel === 0
  rep.add({ sc: 'A11', size: W.size, res: ok ? 'PASS' : 'FAIL', said: `switch before leaving=${sw1}; new row ${JSON.stringify(times)} man ${pid}; re-entered: puck "${cls}"; tap note ${JSON.stringify(t)}, picked=${sel}; switch off (switch=${sw2}): puck "${cls2}" => ${/oilglow/.test(cls2) ? 'he earns' : 'he does not earn'}`, pic: `${pn}, ${pf}` })
}
// ---------------------------------------------------------------- A12
SC.A12 = async W => {
  await open(W); await oilOn(W); await toTop(W)
  const fam = () => W.page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard .oilitem')].find(x => /FAMILY DAY/.test(x.innerText)); return e ? e.className : null })
  const S = async () => JSON.stringify({ sw: await swChecked(W.page), ridge: (await figures(W.page)).ridge, fam: await fam() })
  const s0 = await S(); const log = ['start ' + s0]
  const t1 = async () => { const p = puckOf(W, 'Ridge'); await tapEl(W, p); await sleep(500) }
  await t1(); const s1 = await S(); const n1 = await toastText(W.page); log.push('man tap -> ' + s1)
  const f = W.page.locator('#schedBoard .oilitem').filter({ hasText: /FAMILY DAY/ }).filter({ visible: true }).first()
  await tapEl(W, f); await sleep(500); const s2 = await S(); log.push('event mark tap -> ' + s2)
  await toTop(W); await pressWords(W); await sleep(600); const s3 = await S(); log.push('switch on -> ' + s3)
  await tapEl(W, puckOf(W, 'Fable')); await sleep(400); const n4 = await toastText(W.page); const s4 = await S(); log.push(`refused tap under switch (${n4 && n4.text}) -> ${s4}`)
  await toTop(W); await pressWords(W); await sleep(600); const s5 = await S(); log.push('switch off -> ' + s5)
  const wd = W.page.locator('#schedBoard .oilpk.inert .puck').filter({ visible: true }).first()
  await tapEl(W, wd); await sleep(400); const n6 = await toastText(W.page); const s6 = await S(); const sel6 = await selCount(W.page); log.push(`refused tap on a faded puck (${n6 && n6.text}) picked=${sel6} -> ${s6}`)
  await pic(W, `A12-${W.size}-before-undo`, { full: true })
  // press Undo and watch
  const seq = []
  for (let i = 0; i < 8; i++) {
    if (await undoBtn(W)) { seq.push('Undo disabled'); break }
    await clickId(W, 'sbUndo'); const t = await toastText(W.page); const s = await S(); const mode = await oilIsOn(W.page)
    seq.push(`Undo${i + 1}: ${s} mode=${mode} toast=${t && t.text}`)
    await pic(W, `A12-${W.size}-undo${i + 1}`, { full: true })
    if (!mode) break
  }
  const redoSeq = []
  for (let i = 0; i < 8; i++) {
    const d = await W.page.evaluate(() => document.getElementById('sbRedo')?.disabled)
    if (d) { redoSeq.push('Redo disabled'); break }
    await clickId(W, 'sbRedo'); redoSeq.push(`Redo${i + 1}: ${await S()} mode=${await oilIsOn(W.page)}`)
  }
  const exp = [s3, s2, s1, s0]
  const got = seq.slice(0, 4).map(x => (x.match(/\{.*?\}/) || [''])[0])
  const ok = JSON.stringify(exp) === JSON.stringify(got)
  rep.add({ sc: 'A12', size: W.size, res: ok ? 'PASS' : 'FAIL', said: `${log.join(' | ')} || ${seq.join(' | ')} || ${redoSeq.join(' | ')} || expected first four Undos to step back through the four real changes only (switch off->on, event, man restored... ) states ${JSON.stringify(exp)}; got ${JSON.stringify(got)}`, pic: `A12-${W.size}-before-undo.png, A12-${W.size}-undo1.png` })
}
// ---------------------------------------------------------------- A25
SC.A25 = async W => {
  await open(W); await oilOn(W); await toTop(W)
  const c = W.page.locator('#schedBoard .oilcount').filter({ visible: true }).first()
  await tapEl(W, c); await sleep(700)
  const hist = async () => { await press(W, '#sbHist'); await sleep(700) }
  await hist()
  const wins = () => W.page.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }; return { avail: [...document.querySelectorAll('.availwin')].filter(vis).length, other: [...document.querySelectorAll('[class*=win]')].filter(vis).filter(e => !e.closest('.availwin') && !/availwin/.test(e.className)).map(e => e.className).slice(0, 6) } })
  const w0 = await wins(); await pic(W, `A25-${W.size}-both-windows`, { full: true })
  await toTop(W)
  let pressed = 'ok'
  try { const l = W.page.locator(SW).filter({ visible: true }).first(); const b = await l.boundingBox(); const pos = { x: b.width - 10, y: b.height / 2 }; if (W.phone) await l.tap({ position: pos, timeout: 5000 }); else await l.click({ position: pos, timeout: 5000 }) } catch (e) { pressed = 'could not press: ' + e.message.split('\n').slice(0, 3).join(' ') }
  await sleep(300)
  const sw = await swChecked(W.page); const t1 = await toastText(W.page); await pic(W, `A25-${W.size}-after-switch`, { full: true })
  const wd = W.page.locator('#schedBoard .oilpk.inert .puck').filter({ visible: true }).first()
  await wd.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  const covered = await wd.evaluate(e => { const r = e.getBoundingClientRect(); const x = r.x + r.width / 2, y = r.y + r.height / 2; const t = document.elementFromPoint(x, y); return t ? (t.closest('.availwin') ? 'availwin' : t.closest('.puck') ? 'puck' : t.className) : null })
  let tapped = 'ok'
  try { if (W.phone) await wd.tap({ timeout: 4000 }); else await wd.click({ timeout: 4000 }) } catch (e) { tapped = 'could not press: ' + e.message.split('\n').slice(0, 3).join(' ') }
  await sleep(150)
  const t2 = await toastText(W.page); const z = await W.page.evaluate(() => { const t = document.getElementById('toastEl'); const w = [...document.querySelectorAll('.availwin')][0]; const r = t.getBoundingClientRect(); const tx = r.x + r.width / 2, ty = r.y + r.height / 2; const top = document.elementFromPoint(tx, ty); return { toastZ: getComputedStyle(t).zIndex, toastBox: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], winZ: w && getComputedStyle(w).zIndex, topAtToast: top ? (top.id || top.className) : null, vp: [innerWidth, innerHeight] } })
  await pic(W, `A25-${W.size}-faded-tap`, { full: true })
  const w1 = await wins(); const sel = await selCount(W.page)
  rep.add({ sc: 'A25', size: W.size, res: 'RECORDED', said: `windows before: ${JSON.stringify(w0)}; switch press: ${pressed}; switch now=${sw}; passing note after switch=${JSON.stringify(t1)}; faded puck's point is covered by: ${covered}; tap: ${tapped}; passing note=${JSON.stringify(t2)}; layering ${JSON.stringify(z)}; windows after: ${JSON.stringify(w1)}; picked=${sel}`, pic: `A25-${W.size}-both-windows.png, A25-${W.size}-after-switch.png, A25-${W.size}-faded-tap.png` })
}
// ---------------------------------------------------------------- A27 (phone)
SC.A27 = async W => {
  if (!W.phone) return rep.add({ sc: 'A27', size: W.size, res: 'NOT WALKED', said: 'phone only', pic: '' })
  await open(W); await toTop(W); await blur(W.page)
  const menu = () => W.page.evaluate(() => [...document.querySelectorAll('.wavemenu')].some(e => e.getBoundingClientRect().width > 0))
  const tplBtn = W.page.locator('#schedBoard .daybar [data-daytpladd]')
  const closeMenu = async () => { await W.page.locator('#schedBoard .daybar .daybar-h').tap(); await sleep(500) }
  const res = []
  // Templates: the mark
  await tplBtn.locator('svg').tap(); await sleep(600); res.push('Templates on its mark -> menu ' + (await menu())); await pic(W, 'A27-phone-templates-mark', { full: true }); await closeMenu()
  await toTop(W)
  // Templates: the word (right end of the button, off the mark)
  const b = await tplBtn.boundingBox(); await tplBtn.tap({ position: { x: b.width - 8, y: b.height / 2 } }); await sleep(600); res.push('Templates on its word -> menu ' + (await menu())); await pic(W, 'A27-phone-templates-word', { full: true }); await closeMenu()
  await toTop(W)
  const oilBtn = W.page.locator('#schedBoard .daybar [data-oilmode]').first()
  await oilBtn.locator('svg').tap(); await sleep(700); res.push('OIL Earn on its mark -> mode ' + (await oilIsOn(W.page))); await pic(W, 'A27-phone-oil-mark', { full: true })
  await toTop(W); await doneOil(W); res.push('left the mode -> ' + (await oilIsOn(W.page))); await toTop(W)
  const ob = await W.page.locator('#schedBoard .daybar [data-oilmode]').first().boundingBox()
  await W.page.locator('#schedBoard .daybar [data-oilmode]').first().tap({ position: { x: ob.width - 8, y: ob.height / 2 } }); await sleep(700); res.push('OIL Earn on its word -> mode ' + (await oilIsOn(W.page))); await pic(W, 'A27-phone-oil-word', { full: true })
  const ok = res.every(r => /true$/.test(r) || /-> false$/.test(r))
  await toTop(W); await doneOil(W)
  // the board's ⋯ menu: desktop layout
  await W.page.evaluate(() => window.scrollTo(0, 0)); await press(W, '#sbMore'); await sleep(600)
  const items = await W.page.evaluate(() => [...document.querySelectorAll('[role=menu] *, [role=menuitem]')].filter(e => e.getBoundingClientRect().width > 0 && e.children.length === 0).map(e => (e.textContent || '').trim()).filter(Boolean))
  await pic(W, 'A27-phone-more-menu', { full: true })
  const it = W.page.locator('[role=menuitem], [role=menu] button').filter({ hasText: /desktop/i }).first()
  let lay = 'no Desktop layout item'
  if (await it.count()) { await it.tap(); await sleep(1200); lay = 'switched' }
  await sleep(800)
  const bar = await W.page.evaluate(() => { const d = document.querySelector('#schedBoard .daybar'); if (!d) return null; const r = d.getBoundingClientRect(); const bs = [...d.querySelectorAll('.mbtn')].map(b => { const q = b.getBoundingClientRect(); return b.innerText.trim() + ':' + Math.round(q.width) + 'x' + Math.round(q.height) + (b.querySelector('svg') ? ' +mark' : ' no mark') }); const vis = r.width > 0; return { vis, text: d.innerText.replace(/\n+/g, ' | '), bs } })
  await W.page.evaluate(() => { const d = document.querySelector('#schedBoard .daybar'); d && d.scrollIntoView({ block: 'center' }) }); await sleep(400)
  await pic(W, 'A27-phone-desktop-layout', { full: true })
  rep.add({ sc: 'A27', size: 'phone', res: ok ? 'PASS' : 'FAIL', said: res.join('; '), pic: 'A27-phone-templates-mark.png, A27-phone-templates-word.png, A27-phone-oil-mark.png, A27-phone-oil-word.png' })
  rep.add({ sc: 'A27-layout', size: 'phone', res: 'RECORDED', said: `⋯ menu items ${JSON.stringify(items)}; ${lay}; day bar in desktop layout: ${JSON.stringify(bar)}`, pic: 'A27-phone-more-menu.png, A27-phone-desktop-layout.png' })
}

for (const size of sizes) {
  for (const k of Object.keys(SC)) {
    if (only.length && !only.includes(k)) continue
    const W = await launch(size, { saved: true })
    try { await SC[k](W) } catch (e) { rep.add({ sc: k, size, res: 'NOT WALKED', said: 'script error: ' + e.message.split('\n').slice(0, 6).join(' ~ '), pic: '' }) }
    if (W.errs.length) rep.note(`${k}/${size}: page errors ${JSON.stringify(W.errs)}`)
    await closeAll(W)
  }
}
saveRows(rep, 'saved-' + (process.argv[2] || 'both') + (only.length ? '-' + only.join('') : ''))
console.log('DONE')
