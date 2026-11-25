// r4wf-mb-m8 — merge walk, Share B, M8 (Astra's M8): Wed 15 Jul published through its four sign-offs with the shared leave
// (Ranger + Hex, LL 08:00–10:00) on it (the route of shr-b-b6.mjs, re-written on wr4-lib: the week's own sign selects and
// "Publish day"). Then on the Board: Ranger's Start 0900, then click a Ground Programme box, type nothing; open the changes
// count and press Ranger's change; open the window from his row's leave name; close the Board; the member's view of the
// day (us/us).
// EXPECTED (brief): the window is Ranger's own leave; the issued schedule the member sees keeps the published times.
// RECORD the changes count and what the press on Ranger's change does.
//   WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=desk ENG=chromium node scripts/handpass/r4wf-mb-m8.mjs
import { L, J, sleep, add, done, world, read, boxSel, rowSel, pic, fixture, note, caretAt, heldRows, clickNow, BUILD, TAG, SZ } from './r4wf-mb-lib.mjs'
console.log('r4wf-mb-m8 v1', BUILD, TAG)
const steps = [], pics = [], notes = [], DI = 2
const head = p => p.evaluate(i => {
  const b = document.querySelector('#schedBoard')
  const scope = b && b.offsetWidth ? b : document.querySelector(`#eWeek .day[data-day="${i}"]`)
  if (!scope) return null
  const t = e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : ''
  const q = s => scope.querySelector(s)
  return { where: scope.id || 'week', tag: t(q('.verchip')), pending: t(q('.dpend')), nys: t(q('.nysmark')), beak: q(`[data-beak="${i}"]`) ? (q(`[data-beak="${i}"]`).disabled ? 'locked' : 'on') : 'none', alpub: t(q(`[data-alpub="${i}"]`)), signs: [...scope.querySelectorAll(`select[data-sign][data-signday="${i}"]`)].map(s => s.options[s.selectedIndex]?.text || '') }
}, DI)
const showDay = p => p.evaluate(di => document.querySelector(`#eWeek .day[data-day="${di}"]`)?.scrollIntoView({ block: 'start', inline: 'start' }), DI)
async function sign(w) {
  const signed = {}
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = w.page.locator(`#eWeek select[data-sign="${role}"][data-signday="${DI}"]:visible`).first()
    if (!(await sel.count())) { signed[role] = 'NO SELECT'; continue }
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.scrollIntoViewIfNeeded(); await sel.selectOption(opts[0]); await sleep(250)
    signed[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  return signed
}
async function publish(w) {
  const pub = w.page.locator(`#eWeek [data-beak="${DI}"]:visible`).first()
  if (!(await pub.count())) return { err: 'no Publish day button' }
  if (await pub.isDisabled()) return { err: 'greyed: ' + await pub.getAttribute('title') }
  await pub.scrollIntoViewIfNeeded(); await pub.click(); await sleep(400)
  const dlg = await w.page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && /^(Publish|Yes|Confirm)/.test(x.textContent.trim()) && x.closest('[role="dialog"], .airpop, .modal, .upconf-pop')); return b ? b.textContent.trim() : null })
  if (dlg) await w.page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first().click()
  const asked = await L.answerAsks(w)
  return { dialog: dlg, asked, note: await note(w.page) }
}
const viewRows = p => p.evaluate(di => [...document.querySelectorAll(`#vWeek .day[data-day="${di}"] .sec-unav .pl-row`)].filter(r => r.getBoundingClientRect().width > 1 && r.querySelector('.puck[data-person="bane"], .puck[data-person="rocky"]')).map(r => `${r.querySelector('.puck[data-person="bane"]') ? 'Ranger' : 'Hex'} ${[...r.querySelectorAll('.t')].map(e => (e.textContent || '').trim()).join('-')} "${(r.querySelector('.rmk .ntx')?.textContent || '').trim()}"`), DI)
const vhead = p => p.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); if (!d) return null; const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''; const sel = d.querySelector('select.dver'); return { tag: t(d.querySelector('.verchip')), pend: t(d.querySelector('.dpend')), sel: sel ? sel.options[sel.selectedIndex].text : '' } }, DI)
let w
try {
  w = await world(); const p = w.page
  await fixture(w)
  await L.go(p, 'editsched'); await sleep(600); await showDay(p); await sleep(300)
  /* publish: sign four times, Publish day — up to three tries */
  let hp = null
  for (let t = 1; t <= 3; t++) {
    const signed = await sign(w); const pub = await publish(w); await sleep(700)
    hp = await head(p)
    notes.push(`publish try ${t}: signed ${J(signed)}; publish ${J(pub)}; head ${J(hp)}`)
    if (hp && hp.beak === 'none' && (hp.tag || hp.alpub)) break
  }
  await showDay(p)
  pics.push(await pic(w, 'm8-0-published', [`#eWeek .day[data-day="${DI}"]`]))
  if (!(hp && hp.beak === 'none' && (hp.tag || hp.alpub))) throw new Error('the day did not read published: ' + J(hp))
  /* the Board */
  await p.evaluate(i => window.openScheduler(i), DI); await p.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900)
  const look = async label => { const r = await read(p, label); const o = { ...r, caretAt: await caretAt(p), held: await heldRows(p), head: await head(p) }; steps.push(o); return o }
  await look('board open (published)')
  const rs = await boxSel(p, 'Ranger', 'str')
  await clickNow(w, rs); await sleep(250)
  await p.keyboard.press('Control+A'); await p.keyboard.type('0900')
  await clickNow(w, '#schedBoard [data-bfld="gr:2.0.rmks"]'); await sleep(600)
  await look('0900 in Ranger\'s Start, then a Ground box clicked')
  pics.push(await pic(w, 'm8-1-unav', ['#sbBoard > [data-secmove$=".unav"]']))
  /* the changes count, and Ranger's change pressed */
  const cnt = p.locator('#schedBoard .dpend:visible').first()
  const chg = {}
  if (!(await cnt.count())) chg.err = 'no changes count on the Board'
  else {
    chg.countSays = (await cnt.innerText()).trim()
    await cnt.click(); await sleep(700)
    const rd = () => p.evaluate(() => { const wn = document.querySelector('.chgwin:not([hidden])'); if (!wn) return null; const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''; return { title: t(wn.querySelector('.win-ttl')), tabs: [...wn.querySelectorAll('.win-tab')].map(x => t(x) + (x.classList.contains('on') ? ' [on]' : '')), out: [...wn.querySelectorAll('.pl-list > *')].map(e => t(e)), groups: [...wn.querySelectorAll('.cw-g')].map(g => t(g).slice(0, 200)) } })
    chg.opened = await rd()
    pics.push(await pic(w, 'm8-2-changes', ['.chgwin:not([hidden])']))
    const items = await p.evaluate(() => [...document.querySelectorAll('.chgwin:not([hidden]) .pl-list > *')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()))
    const ix = items.findIndex(t => /Ranger/.test(t))
    if (ix >= 0) {
      await p.locator('.chgwin:not([hidden]) .pl-list > *').nth(ix).click({ timeout: 2500 }).catch(e => notes.push('press on Ranger\'s change: ' + e.message.split('\n')[0]))
      await sleep(600)
      chg.pressed = { line: items[ix], windowStillOpen: !!(await rd()), caret: await caretAt(p), landed: await p.evaluate(() => { const e = document.querySelector('.chgflash'); if (!e) return null; const row = e.closest('[data-inprow]'); return { tag: e.tagName, cls: String(e.className).slice(0, 60), value: e.value ?? null, text: (e.innerText || '').trim().slice(0, 60), row: row?.getAttribute('data-inprow') || null, who: row ? [...row.querySelectorAll('.seat [data-person]')].map(x => x.getAttribute('data-person')).join('+') : null, section: e.closest('[data-secmove]')?.getAttribute('data-secmove') || null } }) }
      pics.push(await pic(w, 'm8-3-after-press', ['#sbBoard > [data-secmove$=".unav"]']))
    } else chg.pressed = { none: 'no line naming Ranger', items }
    if (await p.locator('.chgwin:not([hidden])').count()) await p.locator('.chgwin:not([hidden]) .win-x').first().click().catch(() => {})
    await sleep(400)
  }
  notes.push('changes: ' + J(chg))
  await look('after the changes window')
  /* the window from his row's leave name */
  const row = await rowSel(p, 'Ranger')
  await clickNow(w, `${row} .inpedit`); await sleep(700)
  const win = await p.evaluate(() => { const win = document.querySelector('#inpEditPop'); if (!win || !win.offsetWidth) return null; return { head: (win.innerText || '').split('\n')[0], people: [...win.querySelectorAll('[data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')), person: win.querySelector('#inpEditPerson')?.value, start: win.querySelector('#inpEditStart')?.value, end: win.querySelector('#inpEditEnd')?.value } })
  notes.push('the window from Ranger\'s leave name: ' + J(win))
  pics.push(await pic(w, 'm8-4-window', ['#inpEditPop']))
  await p.keyboard.press('Escape'); await sleep(400)
  const dis = p.getByRole('button', { name: /Discard|Close it/ }).first(); if (await dis.count()) await dis.click().catch(() => {})
  if (await p.locator('#inpEditPop').isVisible().catch(() => false)) { const x = p.locator('[data-testid="win-inputedit-x"], #inpEditPop .win-x').first(); if (await x.count()) await x.click().catch(() => {}) }
  await sleep(400)
  await look('window closed')
  /* close the Board */
  const off = p.locator('#sbDone:visible').first(); if (await off.count()) { await off.click(); await sleep(800) }
  await showDay(p)
  const weekHead = await head(p); notes.push('the week after the Board closed: ' + J(weekHead))
  const storeAdmin = await read(p, 'board closed'); steps.push(storeAdmin)
  /* the member */
  const m = await L.handOver(w, SZ, 'us'); w = m
  await L.go(m.page, 'viewsched'); await sleep(600)
  await m.page.evaluate(i => document.querySelector(`#vWeek .day[data-day="${i}"]`)?.scrollIntoView({ block: 'start', inline: 'start' }), DI)
  const mv = { head: await vhead(m.page), rows: await viewRows(m.page) }
  notes.push('the member\'s view of Wed: ' + J(mv))
  pics.push(await pic(m, 'm8-5-member', [`#vWeek .day[data-day="${DI}"] .sec-unav`]))
  const winOwn = !!win && (win.people.join() === 'bane' || (win.person === 'bane' && !win.people.length)) && win.start === '09:00'
  const frozen = mv.rows.length === 2 && mv.rows.every(r => /08:00-10:00/.test(r))
  add('M8', winOwn && frozen ? 'PASS' : 'FAIL', { windowIsRangersOwn: winOwn, memberSeesPublishedTimes: frozen, notes, steps: steps.map(x => ({ step: x.step, caretAt: x.caretAt, store: x.store, screen: x.screen, held: x.held, head: x.head })) }, pics)
} catch (e) { add('M8', 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 300) + ' ' + J({ notes, steps: steps.map(x => ({ step: x.step, store: x.store, head: x.head })) }).slice(0, 3000), pics) }
try { await w?.ctx.close() } catch {}
await done('m8')
