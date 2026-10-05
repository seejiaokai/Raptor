/* walker TO — probe: what "+ Wave", "+ Line", the formation boxes, a seat drag and "+ In-time / Rally" do on a throw-away world.
   Every gesture is the app's own control; nothing here is evidence — it only teaches the selectors. */
import { writeFileSync } from 'node:fs'
import * as B from './ins-a-lib.mjs'
const { L, W } = B
const out = {}
const w = await B.world()
const p = w.p
const DI = +(process.env.STK_DI || 0)
try {
  await B.toEdit(p)
  out.crewday = await p.evaluate(() => [...document.querySelectorAll('#eWeek [data-crewday]')].slice(0, 4).map(e => ({ a: e.dataset.crewday, tag: e.tagName, cls: e.className, t: (e.innerText || '').slice(0, 80), title: e.title })))
  await W.boardOn(p, DI)
  const wv = p.locator(`#schedBoard [data-wvadd="${DI}"]:visible`).first()
  await wv.evaluate(e => e.scrollIntoView({ block: 'center' })); await wv.click(); await L.sleep(500)
  out.menu = await p.evaluate(() => { const m = [...document.querySelectorAll('.wavemenu, [class*=menu]')].filter(e => e.offsetParent !== null).pop(); return m ? m.outerHTML.slice(0, 2500) : null })
  await p.locator('button:visible', { hasText: /^Flying wave$/ }).first().click(); await L.sleep(700)
  out.people = await p.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([id, v]) => [v.cs, id])))
  out.afterWave = await p.evaluate(di => window.DAYS[di].waves.map(g => ({ label: g.label, intimes: g.intimes, n: g.formations.length, forms: g.formations.map(f => ({ cs: f.cs, to: f.to, ld: f.ld, br: f.br, ac: f.aircraft.length })) })), DI)
  const gi = out.afterWave.length - 1
  out.newWaveHtml = await p.evaluate(([di, gi]) => { const b = document.querySelector(`#sbBoard [data-gline="${di}.${gi}"]`); let e = b; for (let i = 0; i < 5 && e; i++) { e = e.parentElement; if (e.querySelector(`[data-itadd="${di}|${gi}"]`) && e.querySelector('[data-bfld]')) break } return e ? e.outerHTML.slice(0, 7000) : null }, [DI, gi])
  out.newWaveFields = await p.evaluate(([di, gi]) => [...document.querySelectorAll(`#sbBoard [data-bfld^="ff:${di}.${gi}."], #sbBoard [data-bfld^="wl:${di}.${gi}"], #sbBoard [data-bfld^="fr:${di}.${gi}."]`)].map(e => ({ k: e.dataset.bfld, tag: e.tagName, v: e.value, ph: e.placeholder, vis: e.offsetParent !== null })), [DI, gi])
  out.newWaveSlots = await p.evaluate(([di, gi]) => [...document.querySelectorAll(`#sbBoard [data-slot^="${di}.${gi}."]`)].map(e => ({ k: e.dataset.slot, vis: e.offsetParent !== null })), [DI, gi])
  await B.pic(p, 'probe-new-wave')
  /* fill the first formation */
  if (!out.newWaveFields.some(f => f.k === `ff:${DI}.${gi}.0.cs`)) { const gl = p.locator(`#schedBoard [data-gline="${DI}.${gi}"]:visible`).first(); await gl.click(); await L.sleep(500) }
  await W.boardText(p, `ff:${DI}.${gi}.0.cs`, 'VL')
  await W.boardText(p, `ff:${DI}.${gi}.0.to`, '1200')
  await W.boardText(p, `ff:${DI}.${gi}.0.ld`, '1300')
  out.put = await B.seatPut(p, `${DI}.${gi}.0.0.p`, out.people.Comet)
  out.afterFill = await p.evaluate(([di, gi]) => window.DAYS[di].waves[gi], [DI, gi])
  const add = p.locator(`#schedBoard [data-itadd="${DI}|${gi}"]:visible`).first()
  await add.evaluate(e => e.scrollIntoView({ block: 'center' })); await add.click(); await L.sleep(600)
  out.afterAdd = await p.evaluate(([di, gi]) => ({ intimes: window.DAYS[di].waves[gi].intimes, active: document.activeElement ? { tag: document.activeElement.tagName, it: document.activeElement.dataset.itline, text: document.activeElement.innerText } : null, lines: [...document.querySelectorAll(`#sbBoard [data-itline^="${di}|${gi}|"]`)].map(e => e.innerText), fb: [...document.querySelectorAll(`#sbBoard [data-reporting-feedback][data-warnkey="it:${di}.${gi}"]`)].map(e => e.innerText), head: (document.querySelector(`#sbBoard [data-intimes="${di}|${gi}"]`) || {}).outerHTML }), [DI, gi])
  await B.pic(p, 'probe-after-add')
  /* edit the line by typing */
  const line = p.locator(`#sbBoard [data-itline="${DI}|${gi}|0"]`).first()
  await line.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('0800 IN TIME', { delay: 10 }); await p.keyboard.press('Tab'); await L.sleep(500)
  out.afterEdit = await p.evaluate(([di, gi]) => ({ intimes: window.DAYS[di].waves[gi].intimes, lines: [...document.querySelectorAll(`#sbBoard [data-itline^="${di}|${gi}|"]`)].map(e => e.innerText), fb: [...document.querySelectorAll(`#sbBoard [data-reporting-feedback][data-warnkey="it:${di}.${gi}"]`)].map(e => e.innerText) }), [DI, gi])
  out.bridge = await p.evaluate(() => Object.keys(window).filter(k => /event|span|report|hours|work|insight|oil|crew/i.test(k)).slice(0, 80))
  out.events = await p.evaluate(di => { try { return window.dayEvents(di, Object.entries(window.PEOPLE).find(([id, v]) => v.cs === 'Comet')[0]) } catch (e) { return String(e) } }, DI)
  await B.pic(p, 'probe-after-edit')
  await W.boardOff(p)
  const r = await B.insNow(p)
  out.hours = B.hoursOf(r, 'Comet')
  out.weekLines = await p.evaluate(([di, gi]) => [...document.querySelectorAll(`#eWeek [data-itline^="${di}|${gi}|"]`)].map(e => e.innerText), [DI, gi])
  out.weekWaveHtml = await p.evaluate(([di, gi]) => { const it = document.querySelector(`#eWeek [data-intimes="${di}|${gi}"]`); let e = it; for (let i = 0; i < 4 && e; i++) e = e.parentElement; return e ? e.outerHTML.slice(0, 6000) : null }, [DI, gi])
} catch (e) { out.err = String(e && e.stack || e) }
out.errors = w.errors
writeFileSync(process.env.STK_DUMP, JSON.stringify(out, null, 1))
await w.browser.close()
console.log('done', out.err || '')
