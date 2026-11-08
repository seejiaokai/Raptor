// W2.4 faded pucks (Vandal, Gambit), the Talisman ground-row oddity, A23 warning mark, A2 placeholders placed through the board (PC drag), A1 retry.
import { newWorld, openBoard, oilOn, sleep, close, shot, setField, fieldVal, tapSpec, tag, selCount, toast, press, standAt, VERSION } from './oeb-w2-lib.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
const size = process.env.SIZE || 'pc'
const only = (process.env.ONLY || 'x1,x2,x3,x4').split(',')
console.log(VERSION, 'extra', size)
const OUT = 'C:/Users/User/AppData/Local/Temp/claude/ba46d636af5eaefe/e324d8f6-0c85-4339-be37-1d188075a056/scratchpad/res'
mkdirSync(OUT, { recursive: true })
const res = {}
const slim = r => r && r.missing ? { MISSING: r.n } : r && { note: r.note, sel: r.sel, selAfter: r.selAfter, fpSame: r.fpSame, hit: r.hit, wrap: r.tag && r.tag.wrap, title: r.tag && r.tag.title }
async function scen(id, fn) {
  if (!only.includes(id)) return
  const w = await newWorld(size, 'sat')
  try { await openBoard(w); res[id] = await fn(w); res[id].errors = w.errors.filter(e => !/storage may be full/.test(e)) } catch (e) { res[id] = { error: e.message.slice(0, 300) } }
  console.log(id, JSON.stringify(res[id]))
  await close(w)
}
const T = async (w, spec, name) => { const r = await tapSpec(w, spec, `${name}-${size}`); await sleep(2300); return slim(r) }

await scen('x1', async w => {
  await oilOn(w, true)
  const r = {}
  r.vandal = await T(w, { cs: 'Vandal', key: 'gr:5.1' }, 'x1-vandal-ground-admin')
  r.gambitDn = await T(w, { cs: 'Gambit', key: 'dn:5.0' }, 'x1-gambit-meeting-no')
  r.gambitGr = await T(w, { cs: 'Gambit', key: 'gr:5.4' }, 'x1-gambit-ground-meeting')
  r.saint = await T(w, { cs: 'Saint', key: 'dr:5.1' }, 'x1-saint-sxo-default-off')
  return r
})
await scen('x2', async w => {
  // the Talisman ground row: its times were cleared in the earlier script, yet he still earned. What does the row hold?
  const r = { before: [await fieldVal(w.page, 'gr:5.2.str'), await fieldVal(w.page, 'gr:5.2.end')] }
  await setField(w, 'gr:5.2.str', ''); await setField(w, 'gr:5.2.end', '')
  r.afterClear = [await fieldVal(w.page, 'gr:5.2.str'), await fieldVal(w.page, 'gr:5.2.end')]
  r.rowKind = await w.page.evaluate(() => { const f = document.querySelector('#sbBoard [data-bfld="gr:5.2.str"]'); const row = f.closest('.sb-arow'); return { cls: row.className, hint: row.title || '', text: row.innerText.replace(/\s+/g, ' ').slice(0, 120), disabled: f.disabled, ro: f.readOnly } })
  await oilOn(w, true)
  r.talisman = await T(w, { cs: 'Talisman', key: 'gr:5.2' }, 'x2-talisman-ground-training-cleared')
  r.fieldsAfter = [await fieldVal(w.page, 'gr:5.2.str'), await fieldVal(w.page, 'gr:5.2.end')]
  await shot(w, `x2-${size}-after`)
  return r
})
await scen('x3', async w => {
  await setField(w, 'sr:5.oft.0.end', '')
  await oilOn(w, true)
  const r = {}
  r.info = await w.page.evaluate(() => [...document.querySelectorAll('#sbBoard .puck')].filter(p => /^Basher/.test(p.textContent.trim()) && p.getBoundingClientRect().width > 2).map(p => ({ cls: p.className, html: p.innerHTML.slice(0, 220), title: p.title })))
  r.left = await T(w, { cs: 'BBasher', key: 'sr:5.oft', exact: false }, 'x3-basher-warn-left')
  return r
})
await scen('x4', async w => {
  const { page } = w
  const r = { phone: w.phone }
  if (w.phone) return { ...r, notWalked: 'a touch drag does not run in this phone browser (walk-scripts section 4)' }
  // try to place ALL AVAIL from the roster onto a ground row and onto a duty desk's extras
  const src = page.locator('#sbRoster .puck.allavail', { hasText: 'ALL AVAIL' }).first()
  await src.scrollIntoViewIfNeeded(); await sleep(300)
  const drag = async (targetSel, label) => {
    const t = page.locator(targetSel).first(); await t.scrollIntoViewIfNeeded(); await sleep(400)
    const a = await src.boundingBox(); const b = await t.boundingBox()
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
    await page.mouse.move(a.x + 30, a.y + 5, { steps: 4 }); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 }); await sleep(200)
    await page.mouse.up(); await sleep(700)
    await shot(w, `x4-${size}-drop-${label}`)
    return page.evaluate(() => [...document.querySelectorAll('#sbBoard .puck.allavail')].map(p => { let e = p, k = ''; for (let i = 0; i < 8 && e; i++, e = e.parentElement) { const f = e.querySelector('[data-bfld]'); if (f) { k = f.dataset.bfld; break } } return k }))
  }
  r.afterGround = await drag('#sbBoard .sb-arow:has([data-bfld="gr:5.0.str"]) [data-bfld="gr:5.0.rmks"]', 'ground')
  r.afterDuty = await drag('#sbBoard .sb-arow:has([data-bfld="dr:5.1.0.str"]) [data-bfld="dr:5.1.0.rmks"]', 'duty')
  return r
})
writeFileSync(`${OUT}/extra-${size}-${Date.now() % 100000}.json`, JSON.stringify(res, null, 1))
