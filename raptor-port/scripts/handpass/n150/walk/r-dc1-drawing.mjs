// r-dc1 (chat 151, the re-walk) — a copy of dc1-drawing.mjs, changed only where fix 4 consumed its premise: one press
// outside the menu now closes only an open list, so the menu is shut by presses outside until it is closed.
// dc1 — the drawing check (walk-scripts.md §10) of the ☰ menu's head against the approved drawing d1–d5
// (docs/mock/2026-11-23-view-only-tabs, manifest "Version D"), phone 402 × 874 ×2, WebKit.
// The drawing was made by changing the page in the browser (k5-version-d.mjs: addMarkD) on the build before this change.
// Its record is made here the same way, on this build, in the same state: the built head hidden, addMarkD (copied whole
// from k5) laid in its place, the picture taken with k5's own clip — and that picture compared pixel for pixel with the
// approved one (the record check). Then the build's own head is measured in the same state and every part compared:
// place, size, colour, words; every difference over 2px listed, the two pictures side by side.
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'
import { serve, stop, newPage, signIn, as, step, picsFor, press, openMenu, closeMenuOutside, menuPick, barPick, go, grant, makeSquadron, finish, note, facts, state, PICS } from './vlib.mjs'
import { measureParts, pictureDiff } from '../../../drawcheck/lib.mjs'
console.log('r-dc1-drawing v1 (chat 151: dc1 again; the menu shut by as many outside presses as it takes, since fix 4 makes the first press close only the list)')
picsFor('r-dc1')
const MOCK = new URL('../../../../docs/mock/2026-11-23-view-only-tabs/', import.meta.url)
const mockFile = n => decodeURIComponent(new URL(n, MOCK).pathname).replace(/^\/([A-Za-z]:)/, '$1')

/* ---- copied whole from ../../n149/mock2381/k5-version-d.mjs (addMarkD) and klib.mjs (schedRows, the clip) ---- */
const addMarkD = (s, { open = false, rows = [], line }) => s.page.evaluate(({ open, rows, line }) => {
  const src = [...document.querySelectorAll('.topbar .mark')].find(e => e.getBoundingClientRect().width > 0)
  const panel = document.querySelector('#drawer .drawer-panel')
  const clone = src.cloneNode(true)
  const PROPS = ['display', 'flex-direction', 'align-items', 'gap', 'row-gap', 'column-gap', 'font-family', 'font-size', 'font-weight', 'letter-spacing',
    'line-height', 'text-transform', 'color', 'white-space', 'width', 'height', 'min-width', 'fill', 'flex']
  const walk = (a, b) => {
    const cs = getComputedStyle(a)
    for (const p of PROPS) b.style.setProperty(p, cs.getPropertyValue(p))
    for (let i = 0; i < a.children.length; i++) walk(a.children[i], b.children[i])
  }
  walk(src, clone)
  clone.removeAttribute('id')
  if (clone.tagName === 'SPAN') clone.style.display = 'flex'
  const wrap = document.createElement('div'); wrap.className = 'mk-talon'
  const many = src.classList.contains('menu')
  let holder = wrap
  if (many) {
    const b = document.createElement('span'); b.className = 'sqm-btn' + (open ? ' on' : ''); b.setAttribute('role', 'button')
    b.setAttribute('aria-expanded', String(open)); wrap.appendChild(b); holder = b
  }
  holder.appendChild(clone)
  if (many && open) {
    const list = document.createElement('div'); list.className = 'sb-moremenu mk-sqlist'; list.setAttribute('role', 'menu')
    Object.assign(list.style, { position: 'static', display: 'block', width: '100%', minWidth: '0', maxWidth: 'none', margin: '12px 0 0', boxSizing: 'border-box' })
    list.innerHTML = rows.join('')
    wrap.appendChild(list)
  }
  const p = document.createElement('p'); p.className = 'drawer-acct mk-sqline'; p.style.margin = '8px 0 0'; p.textContent = line
  wrap.appendChild(p)
  panel.insertBefore(wrap, panel.firstChild)
}, { open, rows, line })
async function schedRows(s) {
  const { page } = s
  await page.locator('#sqnMenuBtn:visible').first().click(); await page.waitForTimeout(350)
  const html = await page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-row')].map(r => r.outerHTML))
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  if (await page.locator('#sqnMenu').count()) { await page.mouse.click(page.viewportSize().width - 6, page.viewportSize().height - 6); await page.waitForTimeout(300) }
  return html
}
const rowsToChips = rows => rows.map(h => ({ num: (h.match(/class="sqm-num">([^<]*)</) || [])[1], label: (h.match(/class="sqm-lbl">([^<]*)</) || [])[1], on: /aria-checked="true"/.test(h) }))
const CLIP = ['#drawer .drawer-panel > :first-child', '#drawerLogout']
async function clipShot(s, path, pad = 14) {
  const { page } = s
  const box = async t => { const l = page.locator(t).filter({ visible: true }).first(); return (await l.count()) ? l.boundingBox() : null }
  const bs = (await Promise.all(CLIP.map(box))).filter(Boolean)
  const L = Math.min(...bs.map(b => b.x)), T = Math.min(...bs.map(b => b.y)), R = Math.max(...bs.map(b => b.x + b.width)), B = Math.max(...bs.map(b => b.y + b.height))
  const vp = page.viewportSize(); const x = Math.max(0, L - pad), y = Math.max(0, T - pad)
  const cut = { x, y, width: Math.min(vp.width, R + pad) - x, height: Math.min(vp.height, B + pad) - y }
  await page.screenshot({ path, clip: cut })
  return cut
}
/* ---- the parts a person would point at: [name, build selector, drawing selector, nth] ---- */
const PARTS = [
  ['head (mark button)', '.drawer-sqn > :first-child', '.mk-talon > :first-child'],
  ['mark', '.drawer-sqn .mark', '.mk-talon .mark'],
  ['number', '.drawer-sqn .mark .k', '.mk-talon .mark .k'],
  ['TALON', '.drawer-sqn .mark .v', '.mk-talon .mark .v'],
  ['claw', '.drawer-sqn .mark svg', '.mk-talon .mark svg'],
  ['list', '#drawerSqnList', '.mk-sqlist'],
  ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => [`row ${i + 1}`, '#drawerSqnList .sqm-row', '.mk-sqlist .sqm-row', i]),
  ['grey line', '#drawerSqnLine', '.mk-sqline'],
  ['MENU heading', '#drawer .drawer-panel > h4', '#drawer .drawer-panel > h4', 0],
  ['first page', '#drawerNav a', '#drawerNav a', 0],
  ['ACCOUNT heading', '#drawer .drawer-panel > h4', '#drawer .drawer-panel > h4', 1],
  ['Logout', '#drawerLogout', '#drawerLogout'],
]
const measure = (s, which) => s.page.evaluate(([fn, parts]) => { const f = new Function('return ' + fn)(); return f(parts) }, [measureParts.toString(), PARTS.map(([name, b, d, nth]) => ({ name, sel: which === 'build' ? b : d, nth: nth || 0 }))])
const hideBuilt = s => s.page.addStyleTag({ content: '.drawer-sqn{display:none !important} #drawerSqnList{display:none !important}' }).then(h => h)
async function unhideBuilt(s) { await s.page.evaluate(() => { document.querySelectorAll('style').forEach(st => { if (st.textContent.includes('.drawer-sqn{display:none')) st.remove() }); document.querySelectorAll('.mk-talon').forEach(e => e.remove()) }) }
const panelTop = s => s.page.evaluate(() => document.querySelector('#drawer .drawer-panel').scrollTo(0, 0))

function compare(id, D, B) {
  const rows = []
  for (const [name] of PARTS) {
    const d = D.parts[name], b = B.parts[name]
    if (!d?.found && !b?.found) continue
    if (!d?.found) { rows.push([id, name, 'only in the build', '', JSON.stringify(b.box)]); continue }
    if (!b?.found) { rows.push([id, name, 'missing from the build', JSON.stringify(d.box), '']); continue }
    for (const k of ['x', 'y', 'w', 'h']) if (Math.abs(d.box[k] - b.box[k]) > 2) rows.push([id, name, `box ${k}`, d.box[k], b.box[k]])
    if (d.ink && b.ink) for (const k of ['x', 'y']) if (Math.abs(d.ink[k] - b.ink[k]) > 2) rows.push([id, name, `words ${k}`, d.ink[k], b.ink[k]])
    if (d.text !== b.text) rows.push([id, name, 'words', d.text, b.text])
    for (const k of ['fill', 'color', 'font', 'spacing', 'shadow']) if (d.look[k] !== b.look[k]) rows.push([id, name, k, d.look[k], b.look[k]])
    if (JSON.stringify(d.look.edge) !== JSON.stringify(b.look.edge)) rows.push([id, name, 'edge', d.look.edge.join(' / '), b.look.edge.join(' / ')])
    if (JSON.stringify(d.look.corners) !== JSON.stringify(b.look.corners)) rows.push([id, name, 'corners', d.look.corners.join(' '), b.look.corners.join(' ')])
  }
  return rows
}
async function sideBySide(browser, id, a, b) {
  const ctx = await browser.newContext({ viewport: { width: 1700, height: 1900 } }); const p = await ctx.newPage()
  const u = f => 'data:image/png;base64,' + readFileSync(f).toString('base64')
  await p.setContent(`<body style="margin:0;background:#fff;font:16px sans-serif;display:flex;gap:16px;padding:12px;align-items:flex-start">
    <div><div style="margin:0 0 6px">${id} — the approved drawing</div><img src="${u(a)}" style="border:1px solid #888"></div>
    <div><div style="margin:0 0 6px">${id} — the build</div><img src="${u(b)}" style="border:1px solid #888"></div></body>`)
  await p.waitForTimeout(300)
  const bb = await p.evaluate(() => { const r = document.body.getBoundingClientRect(); return { w: Math.ceil(document.body.scrollWidth), h: Math.ceil(document.body.scrollHeight) } })
  await p.screenshot({ path: `${PICS}/${id}-side-by-side.png`, clip: { x: 0, y: 0, width: Math.min(1700, bb.w), height: Math.min(1900, bb.h) } })
  await ctx.close()
}
async function shutMenu(s) { for (let i = 0; i < 3 && (await state(s)).drawerOpen; i++) await closeMenuOutside(s) }
const table = []
let cr
async function check(s, id, approved, drawOpts, setBuild) {
  // the drawing's record, on this build
  await openMenu(s); await panelTop(s)
  const hs = await hideBuilt(s)
  await addMarkD(s, drawOpts); await s.page.waitForTimeout(250)
  const recPath = `${PICS}/${id}-record.png`
  facts[`${id}-record-cut`] = await clipShot(s, recPath)
  const D = await measure(s, 'drawing')
  facts[`${id}-record-vs-approved`] = await pictureDiff(cr, mockFile(approved), recPath)
  note(`${id} record vs approved:`, JSON.stringify(facts[`${id}-record-vs-approved`]))
  await unhideBuilt(s)
  // the build, in the same state, pressed into it as a person does
  await setBuild()
  await panelTop(s); await s.page.waitForTimeout(250)
  const buildPath = `${PICS}/${id}-build.png`
  facts[`${id}-build-cut`] = await clipShot(s, buildPath)
  const B = await measure(s, 'build')
  facts[`${id}-D`] = D; facts[`${id}-B`] = B
  const rows = compare(id, D, B); table.push(...rows)
  note(`${id}: ${rows.length} differences`); for (const r of rows) note('   ', JSON.stringify(r))
  await sideBySide(cr, id, mockFile(approved), buildPath)
  await shutMenu(s)
}
await serve()
try {
  cr = await chromium.launch()
  const s = await newPage('p')
  await signIn(s, 'us', 'us')
  await step('d5 one squadron', () => check(s, 'd5', 'd5-menu-one-squadron-proposed.png', { line: '142 · Your squadron' }, async () => {}))
  await as(s, 'ad', 'a')
  await step('grant', () => grant(s, 'bane', '149', 'view'))
  await as(s, 'us', 'us')
  await step('d1 149 picked, closed', async () => {
    await barPick(s, '149'); await go(s, 'viewsched')
    const rows = await schedRows(s); const cur = rowsToChips(rows).find(c => c.on)
    await check(s, 'd1', 'd1-menu-149-closed-proposed.png', { rows, line: `${cur.num} · ${cur.label}` }, async () => {})
  })
  await step('d2 149 picked, open', async () => {
    const rows = await schedRows(s); const cur = rowsToChips(rows).find(c => c.on)
    await check(s, 'd2', 'd2-menu-149-open-proposed.png', { open: true, rows, line: `${cur.num} · ${cur.label}` }, async () => { await press(s, '#drawerSqnBtn') })
  })
  await step('d3 just after picking 142', async () => {
    // the drawing: 142 already picked; the build: the pick made in the menu's own list, the menu left open
    await openMenu(s); await menuPick(s, '142'); await shutMenu(s)
    const rows = await schedRows(s); const cur = rowsToChips(rows).find(c => c.on)
    await check(s, 'd3', 'd3-menu-after-picking-142-proposed.png', { rows, line: `${cur.num} · ${cur.label}` }, async () => {
      await shutMenu(s); await barPick(s, '149'); await openMenu(s); await menuPick(s, '142')
    })
  })
  await as(s, 'ad', 'a')
  await step('d4 Saber eight', async () => {
    for (let n = 150; n <= 155; n++) await makeSquadron(s, n)
    await go(s, 'viewsched')
    const rows = await schedRows(s); const cur = rowsToChips(rows).find(c => c.on)
    await check(s, 'd4', 'd4-menu-saber-eight-open-proposed.png', { open: true, rows, line: `${cur.num} · ${cur.label}` }, async () => { await press(s, '#drawerSqnBtn') })
  })
  await s.ctx.close()
} finally {
  writeFileSync(`${process.env.MQ_OUT}/r-dc1-table.json`, JSON.stringify(table, null, 1))
  if (cr) await cr.close()
  finish('r-dc1'); await stop()
}
