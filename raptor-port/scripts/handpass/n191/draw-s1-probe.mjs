// draw-s1-probe - section 1: what can be pressed where, before drawing (chat 191). Reads only; no picture kept.
//   node raptor-port/scripts/handpass/n191/draw-s1-probe.mjs <case>
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, covered, boxOf, barSq, reachPick, windowsNow, pageOn, TMP1 } from './draw-s1-lib.mjs'
const C = process.argv[2]
async function newSquadron(s, num) {
  const { page } = s
  await go(s, 'admin'); await wait(s, 700)
  if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back')
  const t = vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Squadrons/ }); if (await t.count()) await hit(s, t.first(), 700)
  await hit(s, '#sqNew', 500)
  await page.fill('#sqNewNum', String(num))
  await page.selectOption('#sqNewPlace', 'p1').catch(() => {})
  const opts = await page.locator('#sqNewAdmin').first().evaluate(e => [...e.options].map(o => o.text)).catch(() => [])
  await page.selectOption('#sqNewAdmin', { label: 'Kestrel · 149' }).catch(() => {})
  await hit(s, '#sqNewSave', 1000)
  return { opts, list: (await page.locator('#sqList').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 160) }
}
const undoInfo = s => s.page.evaluate(() => [...document.querySelectorAll('[aria-label="Undo"]')].filter(e => e.getBoundingClientRect().width > 0).map(b => ({ id: b.id, title: b.title, disabled: b.disabled, box: (r => ({ x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }))(b.getBoundingClientRect()) })))
if (C === 'undo') for (const sz of ['d', 'p']) {
  const s = await mk(sz)
  try {
    await signIn(s, 'ad', 'a')
    FACT(`${sz}.newSqn`, await newSquadron(s, 150))
    let p = await reachPick(s, 150, s.desk ? 'bar' : 'menu'); await wait(s, 700)
    FACT(`${sz}.picked`, { squadron: await barSq(s), undo: await undoInfo(s), page: await pageOn(s) })
    await go(s, 'inputs'); await wait(s, 600)
    if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
    FACT(`${sz}.inNew`, await covered(s, '#inNew'))
    if (await vis(s, '#inNew').count()) { await hit(s, '#inNew', 800); FACT(`${sz}.window`, (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 120))); FACT(`${sz}.undoCovered.inputWindow`, { undo: await covered(s, '#undoBtn'), undoInfo: await undoInfo(s) }) }
    await s.page.screenshot({ path: `${TMP1}/probe-undo-${sz}.png` })
  } catch (e) { FACT(`${sz}.error`, String(e).split('\n')[0]) } finally { await s.ctx.close() }
}
if (C === 'undop') {
  const s = await mk('p')
  try {
    await signIn(s, 'ad', 'a')
    await newSquadron(s, 150); await reachPick(s, 150, 'menu'); await wait(s, 700)
    FACT('p.squadron', await barSq(s))
    await go(s, 'leavewar'); await wait(s, 1500)
    FACT('p.leavewar', { myLeave: await covered(s, '[data-testid="my-leave"]'), text: (await s.page.locator('#page-leavewar').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200) })
    if ((await covered(s, '[data-testid="my-leave"]')) === 'free') { await hit(s, '[data-testid="my-leave"]', 900); FACT('p.myLeave.windows', (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 160))); FACT('p.myLeave.undo', await covered(s, '#undoBtn')); await s.page.screenshot({ path: `${TMP1}/probe-undop-myleave.png` }); await s.page.keyboard.press('Escape'); await wait(s, 500) }
    await go(s, 'inputs'); await wait(s, 700)
    FACT('p.gear', await covered(s, '#inGear'))
    await hit(s, '#inGear', 700)
    FACT('p.gear.windows', (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 200)))
    FACT('p.gear.undo', await covered(s, '#undoBtn'))
    await s.page.screenshot({ path: `${TMP1}/probe-undop-gear.png` })
    const cal = vis(s, '[data-testid="iset-days"]'); if (await cal.count()) { await hit(s, cal.first(), 800); FACT('p.cal.windows', (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 200))); FACT('p.cal.undo', await covered(s, '#undoBtn')); await s.page.screenshot({ path: `${TMP1}/probe-undop-cal.png` }) }
  } catch (e) { FACT('p.error', String(e).split('\n')[0]) } finally { await s.ctx.close() }
}
if (C === 'noperson') for (const sz of ['d', 'p']) {
  /* today: a squadron with nobody in it (150 made just now) - "+ Input" opens with an empty Person box; Add pressed */
  const s = await mk(sz)
  try {
    await signIn(s, 'ad', 'a'); await newSquadron(s, 150); await reachPick(s, 150, s.desk ? 'bar' : 'menu'); await wait(s, 700)
    await go(s, 'inputs'); await wait(s, 600)
    if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
    await hit(s, '#inNew', 800)
    const person = () => s.page.evaluate(() => { const e = document.querySelector('#inpEditPerson'); if (!e) return 'no Person box'; const c = getComputedStyle(e); return { value: e.value, shown: e.options[e.selectedIndex]?.textContent ?? '(nothing selected)', options: [...e.options].map(o => `${o.value}=${o.textContent}`), required: e.required, invalid: e.matches(':invalid'), border: c.borderColor } })
    FACT(`${sz}.person`, await person())
    const day = s.page.locator('.floatwin.inpedwin [data-testid$="-grid"] button, .floatwin.inpedwin button[aria-label*="2026"]').filter({ hasText: /^14$/ }).first()
    if (await day.count()) await hit(s, day, 300)
    await s.page.fill('#inpEditRmk', 'nobody picked')
    await hit(s, '#inpEditSave', 800)
    FACT(`${sz}.afterAdd`, { windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 200)), toast: await s.page.evaluate(() => document.querySelector('#toastEl')?.textContent.trim()), errs: await s.page.evaluate(() => [...document.querySelectorAll('.inpedwin .od-err, .inpedwin .err, .inpedwin [role="alert"], .inpedwin .every-err, .inpedwin .inp-err')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim())), person: await person(), addGreyed: await s.page.evaluate(() => document.querySelector('#inpEditSave')?.disabled) })
    await s.page.screenshot({ path: `${TMP1}/probe-noperson-${sz}.png` })
  } catch (e) { FACT(`${sz}.error`, String(e).split('\n')[0]) } finally { await s.ctx.close() }
}
if (C === 'bellp') {
  const { world, tapBell, bellLines, bellShow, LIST } = await import('./draw-s1-lib.mjs').then(async m => ({ ...m, ...(await import('../n175/p6-lib.mjs')) }))
  const s = await mk('p', { storageState: await world() })
  try {
    await signIn(s, 'ad', 'a')
    await go(s, 'leavewar'); await s.page.waitForSelector('[data-testid="my-leave"]', { timeout: 15000 }); await hit(s, '[data-testid="my-leave"]', 900)
    FACT('p.myLeave', (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 100)))
    FACT('p.bell', await covered(s, '#notifyBell, .bellbtn'))
    FACT('p.tap', await tapBell(s))
    FACT('p.lines', await bellLines(s)); FACT('p.show', await bellShow(s))
    FACT('p.windowsAfterBell', (await windowsNow(s)).map(w => w.what))
    await s.page.screenshot({ path: `${TMP1}/probe-bellp.png` })
  } catch (e) { FACT('p.error', String(e).split('\n')[0]) } finally { await s.ctx.close() }
}
await closeAll()
