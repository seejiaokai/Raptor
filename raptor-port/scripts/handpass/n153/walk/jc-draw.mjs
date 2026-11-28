// jc-draw - the drawing check by measure and by eye: the Filter on Admin → Users (1536 and 402) and the Inputs phone button (402),
// off and on, at 2x, each beside its approved picture; the neighbours' boxes before and after; the colours read from the pixels.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, go } from './jlib.mjs'
import { toUsers } from './jc-lib.mjs'
import { look, tick, closeF, openF } from './jc-flib.mjs'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('jc-draw v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const MOCK = resolve(HERE, '../../../../docs/mock/2026-11-24-msq-new-words/filter-look/img')
const P = picsFor('jc-draw')
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
const hex = (r, g, b) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
/* colour runs along one line of a picture: where its colour changes, so an edge can be read to the pixel */
async function runs(tool, file, line) {
  const b64 = readFileSync(file).toString('base64')
  return tool.evaluate(async ({ b64, line }) => {
    const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode()
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0)
    const horiz = line.axis === 'x'; const n = horiz ? im.width : im.height; const out = []; let prev = null, start = 0
    const d = horiz ? g.getImageData(0, line.at, im.width, 1).data : g.getImageData(line.at, 0, 1, im.height).data
    for (let i = 0; i < n; i++) { const k = [d[i * 4], d[i * 4 + 1], d[i * 4 + 2]].join(','); if (k !== prev) { if (prev !== null && i - start >= (line.min || 2)) out.push(`${start}-${i - 1}:${prev}`); prev = k; start = i } }
    if (n - start >= (line.min || 2)) out.push(`${start}-${n - 1}:${prev}`)
    return { size: [im.width, im.height], runs: out }
  }, { b64, line })
}
async function sideBySide(tool, name, drawnFile, buildFile, crop) {
  const a = readFileSync(drawnFile).toString('base64'), b = readFileSync(buildFile).toString('base64')
  await tool.setContent(`<body style="margin:0;background:#222;color:#fff;font:14px sans-serif;padding:8px;display:grid;gap:6px"><div>Approved drawing</div><img src="data:image/png;base64,${a}" style="${crop || ''}"><div>This build</div><img src="data:image/png;base64,${b}" style="${crop || ''}"></body>`)
  await tool.waitForTimeout(150); await tool.screenshot({ path: `${P}/${name}.png`, fullPage: true })
}
async function clipOf(s, sels, pad = 14) {
  return s.page.evaluate(({ sels, pad }) => { let L = 1e9, T = 1e9, R = -1e9, B = -1e9; for (const q of sels) for (const e of document.querySelectorAll(q)) { const b = e.getBoundingClientRect(); if (b.width > 0) { L = Math.min(L, b.left); T = Math.min(T, b.top); R = Math.max(R, b.right); B = Math.max(B, b.bottom) } } return { x: Math.max(0, L - pad), y: Math.max(0, T - pad), width: R - L + pad * 2, height: B - T + pad * 2 } }, { sels, pad })
}
try {
  const toolS = await newPage('d', { deviceScaleFactor: 1 }); const tool = toolS.page; await tool.goto('about:blank')
  for (const [sz, name, img] of [['d', 'users-desk', 'users-after-desk.png'], ['p', 'users-phone', 'users-after-phone.png']]) {
    const s = await newPage(sz, sz === 'd' ? { deviceScaleFactor: 2 } : {})
    await signIn(s, 'ad', 'a'); await toUsers(s)
    await step(`${name} off and on`, async () => {
      const page = s.page
      await page.locator('#accFilter').scrollIntoViewIfNeeded(); await page.evaluate(() => document.activeElement?.blur?.())
      const off = await look(s); rec(`${name} off`, { filter: off.filter, search: off.search, heading: off.heading, firstRow: off.firstRow })
      const cOff = await clipOf(s, ['#accFilter', '#page-admin input[placeholder^="Find a callsign"]'], 26)
      await page.screenshot({ path: `${P}/${name}-off.png`, clip: cOff })
      await tick(s, 'Pilots'); await closeF(s); await page.mouse.move(2, 2).catch(() => {}); await page.evaluate(() => document.activeElement?.blur?.()); await page.waitForTimeout(250)
      const on = await look(s); rec(`${name} on`, { label: on.label, look: on.filterLook, filter: on.filter, search: on.search, heading: on.heading, firstRow: on.firstRow, showing: on.showing })
      check(`${name}: the search box does not change height`, on.search.h === off.search.h, [off.search.h, on.search.h])
      check(`${name}: the Filter does not change height`, on.filter.h === off.filter.h, [off.filter.h, on.filter.h])
      check(`${name}: the Filter's top edge stays`, on.filter.y === off.filter.y, [off.filter.y, on.filter.y])
      check(`${name}: the heading stays`, JSON.stringify(on.heading) === JSON.stringify(off.heading), [off.heading, on.heading])
      rec(`${name} search box's width off → on`, [off.search.w, on.search.w]); rec(`${name} Filter's width off → on`, [off.filter.w, on.filter.w])
      const cOn = await clipOf(s, ['#accFilter', '#page-admin input[placeholder^="Find a callsign"]'], 26)
      const f = `${P}/${name}-on.png`; await page.screenshot({ path: f, clip: cOn })
      const scale = 2; const midY = Math.round((on.filter.y + on.filter.h / 2 - cOn.y) * scale); const fx = Math.round((on.filter.x + 8 - cOn.x) * scale)
      rec(`${name} build, across the Filter`, (await runs(tool, f, { axis: 'x', at: midY, min: 3 })).runs.slice(0, 18))
      rec(`${name} build, down the Filter`, (await runs(tool, f, { axis: 'y', at: fx, min: 2 })))
      const dr = resolve(MOCK, img); const sz2 = (await runs(tool, dr, { axis: 'x', at: 2 })).size
      rec(`${name} drawing size`, sz2)
      await sideBySide(tool, `${name}-beside-drawing`, dr, f)
    })
    await s.ctx.close()
  }
  /* the Inputs filter button on a phone */
  const s = await newPage('p')
  await signIn(s, 'ad', 'a')
  await step('inputs phone', async () => {
    const page = s.page
    await go(s, 'inputs'); await page.waitForTimeout(500); if (await page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open'))) { await page.touchscreen.tap(395, 500); await page.waitForTimeout(350) }
    const m = () => page.evaluate(() => { const bx = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) } }; const b = document.querySelector('#inFiltersBtn'), c = getComputedStyle(b); const dot = [...b.querySelectorAll('span')].find(x => /^\d+$/.test(x.textContent.trim())); return { btn: bx(b), bg: c.backgroundColor, border: c.borderTopColor, color: c.color, count: dot ? dot.textContent.trim() : null, list: bx(document.querySelector('#inListBtn')), gear: bx(document.querySelector('#inGear')), cal: bx(document.querySelector('#inCalBtn')) } })
    const off = await m(); rec('inputs off', off)
    const clipI = await clipOf(s, ['#inFiltersBtn', '#inGear', '#inListBtn'], 18)
    await page.screenshot({ path: `${P}/inputs-off.png`, clip: clipI })
    await page.locator('#inFiltersBtn').tap(); await page.waitForTimeout(300)
    const v = await page.evaluate(() => [...document.querySelector('#inFPerson').options][2]?.value); await page.selectOption('#inFPerson', v); await page.waitForTimeout(250)
    await page.locator('#inFiltersBtn').tap(); await page.waitForTimeout(300); await page.evaluate(() => document.activeElement?.blur?.()); await page.waitForTimeout(150)
    const on = await m(); rec('inputs on', on)
    check('inputs button keeps its box', JSON.stringify(on.btn) === JSON.stringify(off.btn), [off.btn, on.btn])
    check('inputs neighbours stay', JSON.stringify([on.list, on.gear, on.cal]) === JSON.stringify([off.list, off.gear, off.cal]), { off: [off.list, off.gear], on: [on.list, on.gear] })
    check('inputs on shows the count 1', on.count === '1', on.count)
    const f = `${P}/inputs-on.png`; await page.screenshot({ path: f, clip: clipI })
    const scale = 2; rec('inputs build, across the button', (await runs(tool, f, { axis: 'x', at: Math.round((on.btn.y + on.btn.h / 2 - clipI.y) * scale), min: 3 })).runs.slice(0, 14))
    rec('inputs build, down the button', (await runs(tool, f, { axis: 'y', at: Math.round((on.btn.x + 6 - clipI.x) * scale), min: 2 })))
    const dr = resolve(MOCK, 'inputs-after-phone.png'); rec('inputs drawing size', (await runs(tool, dr, { axis: 'x', at: 2 })).size)
    await sideBySide(tool, 'inputs-beside-drawing', dr, f)
  })
  await s.ctx.close()
  /* the same lines read from the approved drawings */
  await step('the drawing, read by its pixels', async () => {
    for (const [img, xLine, yLine] of [['users-after-desk.png', 76, 650], ['users-after-phone.png', 110, 500], ['inputs-after-phone.png', 118, 94]]) {
      const f = resolve(MOCK, img)
      rec(`drawing ${img} across`, (await runs(tool, f, { axis: 'x', at: xLine, min: 3 })).runs.slice(0, 16))
      rec(`drawing ${img} down`, (await runs(tool, f, { axis: 'y', at: yLine, min: 2 })))
    }
  })
  await toolS.ctx.close()
} finally { finish('jc-draw'); await closeAll() }
