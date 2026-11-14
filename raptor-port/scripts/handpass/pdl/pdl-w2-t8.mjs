/* pdl-w2-t8 v1 — T8 the plain-user round on a phone (402, touch). Fixture built on a desktop world, carried to the phone with its storage. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w2/t8-run1')
console.log('pdl-w2-t8 v1', process.env.HP_SHOTS)
const P = await import('./pdl-w2-lib.mjs')
const { X, L, sleep, check, note, pic, SHOTS } = P
const FX = await import('../rcf/rcf-w2-fx.mjs')
/* ---- fixture on desktop ---- */
const d = await X.world('desktop')
const dp = d.page
await P.toWeek(dp, '2026-07-27')
await L.board(dp, 1); await sleep(400)
await P.flight(d, 1, { to: '1200', ld: '1300', who: d.ID('Ranger') })
const g = await P.ground(d, 1, { prog: 'BRIEFING', str: '1430', end: '1500', who: null })
const from = dp.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
await from.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
const to = dp.locator(`#schedBoard [data-fill="g:1.${g.ri}.+"]:visible`).first()
await to.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
await FX.dragBox(dp, from, to)
await L.closeBoard(dp)
const sp = await X.signAndPublish(d, 1)
await L.closeBoard(dp)
await P.setLogic(d, 'briefLead', '3h')
const dh = await (async () => { await L.go(dp, 'editsched'); await sleep(500); return L.head(dp, 1) })()
console.log('desktop fixture', JSON.stringify({ pub: sp.p, tag: sp.h.tag, pending: dh.pending }))
const st = await d.ctx.storageState({ indexedDB: true })
/* ---- the phone ---- */
const ph = await d.browser.newContext({ storageState: st, viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
const pp = await ph.newPage()
const errs = d.errors
pp.on('console', m => { if (m.type() === 'error') errs.push('P: ' + m.text()) })
pp.on('pageerror', e => errs.push('P: PAGEERROR ' + e.message))
pp.on('response', r => { if (r.status() >= 400) errs.push('P: HTTP ' + r.status() + ' ' + r.url()) })
await pp.goto(process.env.HP_URL + '/'); await pp.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
if (await pp.locator('#luser').count()) await L.login(pp, 'a')
await pp.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(800)
const pw = { ...d, page: pp, phone: true, errors: errs }
await P.toWeek(pp, '2026-07-27')
const mon = await pp.evaluate(() => ({ f: window.DAYS[1].waves.length && window.DAYS[1].waves[0].formations[0].to, pub: JSON.stringify((window.SCHED.cur || {})[1] || null), briefLead: window.VCONF.briefLead, crewRest: window.VCONF.crewRest }))
check('T8.0 phone world carries the fixture (Tue 28 Jul published, brief lead 3h)', mon.f === '12:00' && mon.pub !== 'null' && mon.briefLead === 180, JSON.stringify(mon))
const tapPic = (name) => ({ scope: 'page', after: name })
const visible = async (sel) => (await pp.locator(sel + ':visible').count()) > 0

/* 1. Logic: ✎ Edit, change a setting, Done, Reset */
await L.go(pp, 'logic'); await sleep(700)
await pic(pp, 't8-1-logic-open')
const editBtn = await pp.evaluate(() => { const b = document.querySelector('#lgEdit'); return b ? { text: b.innerText.trim(), vis: b.offsetWidth > 0 } : null })
console.log('lgEdit', JSON.stringify(editBtn))
const boxBefore = await visible('#lgBody input[data-lgset="crewRest"]')
await X.press(pw, '#lgEdit', tapPic('t8-1-tap-edit')); await sleep(500)
await pic(pp, 't8-1-after-edit-settled')
const boxAfterEdit = await visible('#lgBody input[data-lgset="crewRest"]')
check('T8.1 Logic ✎ Edit: the setting boxes appear', !boxBefore && boxAfterEdit, `boxes before ${boxBefore} after ${boxAfterEdit}; button "${editBtn && editBtn.text}"`, 't8-1-after-edit-settled.png')
const inp = pp.locator('#lgBody input[data-lgset="crewRest"]').first()
const v0 = await inp.inputValue()
await inp.scrollIntoViewIfNeeded(); await inp.tap(); await sleep(300)
await inp.fill('12h30'); await pp.screenshot({ path: `${SHOTS}/t8-2-typed.png` }); await inp.press('Tab'); await sleep(600)
await pic(pp, 't8-2-changed')
const v1 = await inp.inputValue()
check('T8.2 Logic: crew rest changed to 12h30', /12h30/.test(v1) && v1 !== v0, `was ${v0} now ${v1}`, 't8-2-changed.png')
const resets = await pp.evaluate(() => [...document.querySelectorAll('#lgBody [data-lgreset]')].filter(e => e.offsetWidth).map(e => e.tagName + ' ' + [...e.attributes].map(a => a.name + '=' + a.value).join(';') + ' "' + e.innerText.trim() + '"'))
console.log('RESETS', JSON.stringify(resets))
const resetSel = '#lgBody [data-lgreset]'
if (resets.length) {
  /* the reset next to crew rest if it is the first */
  await X.press(pw, resetSel, { ...tapPic('t8-3-tap-reset'), scope: 'page' }); await sleep(600)
  await pic(pp, 't8-3-after-reset')
  const v2 = await pp.locator('#lgBody input[data-lgset="crewRest"]').first().inputValue()
  check('T8.3 Logic Reset: crew rest back to its normal value', v2 === v0 || /12h$/.test(v2), `before reset ${v1} after ${v2} (was ${v0})`, 't8-3-after-reset.png')
} else note('T8.3 Logic Reset', 'NOT WALKED: no reset control visible on the phone after the change: ' + JSON.stringify(resets))
const dn = pp.locator('button:visible', { hasText: /^Done$/ }).first()
const doneLabel = (await dn.count()) ? await dn.evaluate(e => e.id + '|' + e.className + '|' + e.innerText.trim()) : 'NO Done BUTTON'
console.log('Done button', doneLabel)
await dn.evaluate(e => e.scrollIntoView({ block: 'center' })); { const b = await dn.boundingBox(); await pp.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) }; await sleep(60); await pp.screenshot({ path: SHOTS + '/t8-4-tap-done.png' }); await sleep(500)
await pic(pp, 't8-4-after-done')
const boxAfterDone = await visible('#lgBody input[data-lgset="crewRest"]')
check('T8.4 Logic Done: the setting boxes close', !boxAfterDone, `button was "${doneLabel}"; boxes after Done: ${boxAfterDone}; crewRest now ${await pp.evaluate(() => window.VCONF.crewRest)}min`, 't8-4-after-done.png')

/* 2. the board and its ✓ Done */
await L.go(pp, 'editsched'); await sleep(700)
await X.press(pw, '#eWeek [data-sbday="1"]', tapPic('t8-5-tap-open-board')); await pp.waitForSelector('#schedBoard'); await sleep(900)
await pic(pp, 't8-5-board-open')
check('T8.5 the board opens on a tap of the day', await visible('#schedBoard'), 'board visible', 't8-5-board-open.png')
const doneSel = pp.locator('#schedBoard button:visible', { hasText: /Done/ }).first()
const doneCount = await doneSel.count()
if (doneCount) {
  const bb = await doneSel.boundingBox()
  await pp.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(60)
  await pp.screenshot({ path: `${SHOTS}/t8-6-tap-board-done.png` }); await sleep(700)
  await pic(pp, 't8-6-after-board-done')
  check('T8.6 board ✓ Done closes the board', !(await pp.locator('#schedBoard:visible').count()), `board visible after: ${await pp.locator('#schedBoard:visible').count()}`, 't8-6-after-board-done.png')
} else note('T8.6 board Done', 'NOT WALKED: no Done button on the phone board')

/* 3. the changes window from a pending count */
await L.go(pp, 'editsched'); await sleep(700)
await pp.locator('#eWeek .day[data-day="1"]').first().evaluate(e => e.scrollIntoView({ block: 'start', inline: 'start' })); await sleep(400)
const pend = pp.locator('#eWeek .day[data-day="1"] .dpend:visible').first()
const pendTxt = (await pend.count()) ? (await pend.innerText()).trim() : null
console.log('pending chip', pendTxt, await pend.evaluate(e => e.outerHTML.slice(0, 300)).catch(() => ''))
await pic(pp, 't8-7-pending-chip')
const seen = () => pp.evaluate(() => { window.__seen = new WeakSet([...document.querySelectorAll('body *')]) })
const fresh = () => pp.evaluate(() => { const f = [...document.querySelectorAll('body *')].filter(e => !window.__seen.has(e) && e.offsetWidth); const tops = f.filter(e => !f.includes(e.parentElement)); return tops.map(e => ({ cls: String(e.className).slice(0, 50), text: e.innerText.replace(/[\s ]+/g, ' ').slice(0, 500), buttons: [...e.querySelectorAll('button')].map(b => b.innerText.trim() + '|' + [...b.attributes].filter(a => a.name.startsWith('data-') || a.name === 'aria-label' || a.name === 'id').map(a => a.name + '=' + a.value).join(';')) })) })
if (pendTxt) {
  await seen()
  const bb = await pend.boundingBox()
  await pend.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(200)
  const bb2 = await pend.boundingBox()
  await pp.touchscreen.tap(bb2.x + bb2.width / 2, bb2.y + bb2.height / 2); await sleep(60)
  await pp.screenshot({ path: `${SHOTS}/t8-8-tap-pending.png` }); await sleep(800)
  await pic(pp, 't8-8-changes-window')
  const fw = await fresh()
  console.log('CHANGES WINDOW', JSON.stringify(fw))
  note('T8.7 the changes window opened from the pending count (RECORD)', `chip "${pendTxt}"; window: ${JSON.stringify(fw.map(x => x.text))}`, 't8-8-changes-window.png')
  /* close by ✕ */
  const xb = pp.locator('button:visible', { hasText: /^✕$/ })
  const nx = await xb.count()
  console.log('✕ buttons visible', nx)
  let closed = null
  if (nx) {
    /* the last ✕ drawn is the window's own */
    const target = xb.last(); const b = await target.boundingBox()
    await pp.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(60)
    await pp.screenshot({ path: `${SHOTS}/t8-9-tap-close-changes.png` }); await sleep(700)
    await pic(pp, 't8-9-after-close-changes')
    const left = await fresh()
    closed = left.length === 0
    check('T8.8 the changes window closes by its ✕', closed, `fresh surfaces left after ✕: ${JSON.stringify(left.map(x => x.cls + ':' + x.text.slice(0, 60)))}`, 't8-9-after-close-changes.png')
  } else note('T8.8 close changes window', 'NOT WALKED: no ✕ button found; buttons in window ' + JSON.stringify(fw.map(x => x.buttons)))
} else note('T8.7 pending count', 'NOT WALKED: no pending chip on Tuesday')

/* 4. the ALL AVAIL window */
await L.go(pp, 'editsched'); await sleep(700)
const chip = pp.locator('#eWeek .day[data-day="1"] .oilcount:visible').first()
if (await chip.count()) {
  await chip.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  await seen()
  const b = await chip.boundingBox()
  await pic(pp, 't8-10-allavail-chip')
  await pp.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(60)
  await pp.screenshot({ path: `${SHOTS}/t8-10-tap-allavail.png` }); await sleep(800)
  await pic(pp, 't8-10-allavail-window')
  const fw = await fresh()
  console.log('ALLAVAIL WINDOW', JSON.stringify(fw.map(x => ({ cls: x.cls, text: x.text.slice(0, 200), buttons: x.buttons }))))
  check('T8.9 the ALL AVAIL window opens on a tap of its count', fw.length > 0, JSON.stringify(fw.map(x => x.cls + ': ' + x.text.slice(0, 80))), 't8-10-allavail-window.png')
  const xb = pp.locator('button:visible', { hasText: /^✕$/ })
  const nx = await xb.count()
  if (nx) {
    const bb = await xb.last().boundingBox()
    await pp.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(60)
    await pp.screenshot({ path: `${SHOTS}/t8-11-tap-close-allavail.png` }); await sleep(700)
    await pic(pp, 't8-11-after-close-allavail')
    const left = await fresh()
    check('T8.10 the ALL AVAIL window closes by its ✕', left.length === 0, `fresh surfaces left: ${JSON.stringify(left.map(x => x.cls + ':' + x.text.slice(0, 60)))}`, 't8-11-after-close-allavail.png')
  } else note('T8.10 close ALL AVAIL window', 'NOT WALKED: no ✕ found: ' + JSON.stringify(fw.map(x => x.buttons)))
} else note('T8.9 ALL AVAIL window', 'NOT WALKED: no count chip on the phone week')
P.finish(d, {})
await d.browser.close()
