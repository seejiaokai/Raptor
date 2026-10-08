// P3-09 — a window dragged low stays recoverable: 390x568, rotate to 844x390, resize to 1280x700, back to portrait.
// For each window at each stage: is the title bar on the screen, is the cross the thing at its centre, can Save / the main
// action be reached (scrolling the window body is allowed — the page's own scroll too), can the last field.
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { world, toLeaveWar, toInputs, tid, press, pic, sleep, closeAll, rec, recErrors, big, active, openWins, touchDrag, drag, SIZES, ROOT } from './cal-C-lib.mjs'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const OUTJ = ROOT + '/docs/handpass/parts/cal-C-lowdrag.json'
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const save = (name, row) => { let all = {}; if (existsSync(OUTJ)) { try { all = JSON.parse(readFileSync(OUTJ, 'utf8')) } catch {} } all[name] = row; writeFileSync(OUTJ, JSON.stringify(all, null, 1)) }
const STAGES = [['390x568', { width: 390, height: 568 }, true], ['844x390', { width: 844, height: 390 }, true], ['1280x700', { width: 1280, height: 700 }, false], ['back 390x568', { width: 390, height: 568 }, true]]
let CUR = 'phone'
const pressC = (page, loc, o) => (CUR === 'desk' ? loc.click(o) : loc.tap(o))

async function reach(page, win, mainSel) {
  return page.evaluate(([testid, mainSel]) => {
    const el = document.querySelector(`[data-testid="${testid}"]`)
    if (!el) return { gone: true }
    const R = e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), b: Math.round(r.bottom) } }
    const vw = innerWidth, vh = innerHeight
    const bar = el.querySelector('.win-bar'), x = el.querySelector('.win-x'), body = el.querySelector('.win-body')
    const onScreen = r => r.y >= -1 && r.b <= vh + 1 && r.x >= -1 && r.x + r.w <= vw + 1
    const hitIs = (node) => { const r = node.getBoundingClientRect(); const cx = Math.min(Math.max(r.x + r.width / 2, 1), vw - 1), cy = Math.min(Math.max(r.y + r.height / 2, 1), vh - 1); const h = document.elementFromPoint(cx, cy); return !!h && (h === node || node.contains(h)) }
    const out = { vp: [vw, vh], win: R(el), bar: bar ? R(bar) : null, barOnScreen: bar ? onScreen(R(bar)) : null, cross: x ? R(x) : null, crossOnScreen: x ? onScreen(R(x)) : null, crossHit: x ? hitIs(x) : null }
    const reachEl = (sel, label) => {
      const n = el.querySelector(sel) || document.querySelector(sel)
      if (!n) { out[label] = 'not found'; return }
      n.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      const r = n.getBoundingClientRect()
      out[label] = { rect: R(n), onScreen: onScreen(R(n)), hit: hitIs(n) }
    }
    if (mainSel) reachEl(mainSel, 'main')
    const fields = [...el.querySelectorAll('input:not([type=hidden]), select, textarea, button')].filter(f => f.offsetParent && f.getBoundingClientRect().width > 0)
    const last = fields[fields.length - 1]
    if (last) { last.scrollIntoView({ block: 'nearest', inline: 'nearest' }); const r = last.getBoundingClientRect(); out.last = { what: (last.getAttribute('data-testid') || last.id || last.textContent.trim().slice(0, 14)), onScreen: onScreen(R(last)), hit: hitIs(last) } }
    return out
  }, [win.testid, mainSel])
}
const ok = r => !r.gone && r.barOnScreen && r.crossOnScreen && r.crossHit && (!('main' in r) || r.main === 'not found' || (r.main.onScreen && r.main.hit)) && (!r.last || (r.last.onScreen && r.last.hit))

const WINS = []
const W = (name, testid, main, open) => WINS.push({ name, testid, main, open })
const dayCorner = (p, iso) => pressC(p, p.locator(`[data-icday="${iso}"]`), { position: { x: 8, y: 8 } })
async function inputsPage(w, sans) {
  const p = w.page; await toInputs(p)
  if (sans) { await pressC(p, p.locator('#inSansMode')); await tid(p, 'sanscal').waitFor() }
  const monthOf = async () => { const t = (await (sans ? tid(p, 'sc-month') : p.locator('#inpCal .ic-mon')).textContent()).trim().toLowerCase(); const [m, y] = t.split(/\s+/); return +y * 12 + MONTHS.findIndex(x => x.startsWith(m)) }
  for (let d = 2026 * 12 + 6 - await monthOf(); d !== 0; d += d > 0 ? -1 : 1) await pressC(p, sans ? tid(p, d > 0 ? 'sc-next' : 'sc-prev') : p.locator(d > 0 ? '#icNext' : '#icPrev'))
  await sleep(300)
}
W('Calendar', 'win-days', null, async w => { const p = w.page; await toLeaveWar(p); await pressC(p, tid(p, 'settings-open')); await pressC(p, tid(p, 'settings-days')); await tid(p, 'win-days').waitFor() })
W('Every Thursday', 'win-every', '[data-testid="every-save"]', async w => { const p = w.page; await toLeaveWar(p); await pressC(p, tid(p, 'settings-open')); await pressC(p, tid(p, 'settings-days')); await tid(p, 'win-days').waitFor(); await pressC(p, tid(p, 'days-wd-3')); await tid(p, 'win-every').waitFor() })
W('Holiday form', 'win-holiday', '[data-testid="hol-save"]', async w => { const p = w.page; await toLeaveWar(p); await pressC(p, tid(p, 'settings-open')); await pressC(p, tid(p, 'settings-days')); await tid(p, 'win-days').waitFor(); if (await tid(p, 'days-tabs').count()) await pressC(p, tid(p, 'days-tab-holidays')); await pressC(p, tid(p, 'hol-add')); await tid(p, 'win-holiday').waitFor() })
W('Inputs day', 'win-inputsday', '#icPopAdd', async w => { await inputsPage(w, false); await dayCorner(w.page, '2026-07-15'); await tid(w.page, 'win-inputsday').waitFor() })
W('SANS day', 'win-sansday', '[data-testid="sd-add"]', async w => { await inputsPage(w, true); await pressC(w.page, tid(w.page, 'sc-day-2026-07-15')); await tid(w.page, 'win-sansday').waitFor() })
W('Input editor', 'win-inputedit', '#inpEditSave', async w => { await inputsPage(w, false); await dayCorner(w.page, '2026-07-15'); await tid(w.page, 'win-inputsday').waitFor(); await pressC(w.page, w.page.locator('#icPopAdd')); await tid(w.page, 'win-inputedit').waitFor() })
W('Inputs settings', 'win-inputsset', '[data-testid="iset-save"]', async w => { await inputsPage(w, false); await pressC(w.page, tid(w.page, 'in-gear')); await tid(w.page, 'win-inputsset').waitFor() })
W('SANS settings', 'win-sansset', '[data-testid="sset-save"]', async w => { await inputsPage(w, true); await pressC(w.page, tid(w.page, 'sc-gear')); await tid(w.page, 'win-sansset').waitFor() })

async function dragLow(page, testid, desk) {
  const win = tid(page, testid).last()
  const bar = await win.locator('.win-bar').boundingBox()
  if (!bar) return 'no bar'
  const vh = page.viewportSize().height
  const sx = bar.x + Math.min(70, bar.width / 3), sy = bar.y + bar.height / 2
  const dy = vh - sy + 40       // as far down as the screen goes (and a little further)
  if (desk) { await page.mouse.move(sx, sy); await page.mouse.down(); await page.mouse.move(sx, sy + dy / 2, { steps: 8 }); await page.mouse.move(sx, sy + dy, { steps: 8 }); await page.mouse.up() }
  else await touchDrag(page, { x: sx, y: sy }, { x: sx, y: Math.min(sy + dy, vh - 2) }, 10)
  await sleep(500)
  return { askedDy: Math.round(dy) }
}

async function pullUp(page, testid, desk) {
  const win = tid(page, testid).last()
  const bar = await win.locator('.win-bar').boundingBox()
  if (!bar) return 'no bar'
  const vh = page.viewportSize().height
  const sx = bar.x + Math.min(70, bar.width / 3), sy = Math.min(bar.y + 14, vh - 8)   // the part of the bar that is still on the screen
  const dy = -(sy - 18)
  if (desk) { await page.mouse.move(sx, sy); await page.mouse.down(); await page.mouse.move(sx, sy + dy / 2, { steps: 6 }); await page.mouse.move(sx, sy + dy, { steps: 6 }); await page.mouse.up() }
  else await touchDrag(page, { x: sx, y: sy }, { x: sx, y: sy + dy }, 10)
  await sleep(500)
  return { grabbedAt: Math.round(sy), askedDy: Math.round(dy) }
}
for (const wn of WINS) {
  if (ONLY.length && !ONLY.some(o => wn.name.includes(o))) continue
  CUR = 'phone'
  const w = await world('short'); const row = { window: wn.name, stages: {} }
  try {
    await wn.open(w)
    await sleep(500)
    for (const [label, vp, phone] of STAGES) {
      CUR = phone ? 'phone' : 'desk'
      await w.page.setViewportSize(vp); await sleep(600)
      if (!(await tid(w.page, wn.testid).count())) { row.stages[label] = { gone: true, note: 'window not present after the resize' }; continue }
      const before = await reach(w.page, wn, wn.main)
      const dr = await dragLow(w.page, wn.testid, !phone)
      const after = await reach(w.page, wn, wn.main)
      const up = await pullUp(w.page, wn.testid, !phone)
      const rec2 = await reach(w.page, wn, wn.main)
      const pn2 = await pic(w.page, `lowdrag-${wn.name.replace(/[^a-z0-9]+/gi, '_')}-${label.replace(/[^a-z0-9]+/gi, '_')}-recovered`)
      const pn = await pic(w.page, `lowdrag-${wn.name.replace(/[^a-z0-9]+/gi, '_')}-${label.replace(/[^a-z0-9]+/gi, '_')}`)
      row.stages[label] = { before: { ok: ok(before), barOnScreen: before.barOnScreen, win: before.win }, dragged: dr, after: { ok: ok(after), ...after }, recovery: { up, ok: ok(rec2), ...rec2 }, pic: pn, pic2: pn2 }
    }
    // after the stages, bring it back: restore the portrait and reach everything
    row.errors = w.errors.slice(0, 5)
  } catch (e) { row.error = String(e).split('\n')[0].slice(0, 200) }
  save(wn.name, row)
  console.log(wn.name, row.error || '', Object.entries(row.stages).map(([k, v]) => `${k}: low=${v.gone ? 'GONE' : (v.after.ok ? 'ok' : 'NOT-OK')} recovered=${v.gone ? '-' : (v.recovery.ok ? 'ok' : 'NOT-OK')}`).join(' | '))
  await w.ctx.close().catch(() => {})
}
await closeAll()
