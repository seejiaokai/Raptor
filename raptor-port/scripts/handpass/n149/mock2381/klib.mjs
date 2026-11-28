// The mock-up of his D2381 (23 Nov 26): a View holder with that squadron picked is offered its View-only Sched and Help
// alone; the ☰ side menu gains a SQUADRON section that shows the squadron in view and picks one. Pictures of the REAL
// app at deviceScaleFactor 2; the proposed look is made by changing the page in the browser only, just before each shot
// (tabs hidden, the SQUADRON section built from the Schedules menu's own row classes) — the app's source is untouched.
// Built on the FULL walk's helpers (../walk/lib.mjs), the re-walk's (../rewalk/rlib.mjs) and the morning page's (../morning).
// Run from raptor-port/ with the build in dist/:
//   MQ_PORT=<a free port> MQ_PICS=<the pictures' folder> MQ_OUT=<raw facts, outside the checkout> MQ_RAW=<the same> node <script>
import { writeFileSync } from 'node:fs'
import { facts, note } from '../walk/lib.mjs'

export const DIR = process.env.MQ_PICS
export const manifest = []   // [file, what it shows, size, today | proposed]
const ACCENT = '#3BC6E8'     // the app's --accent (00-foundation-login.css)

const box = async (s, t) => {
  const l = typeof t === 'string' ? s.page.locator(t).filter({ visible: true }).first() : t
  if (!(await l.count())) return null
  return l.boundingBox()
}
const union = bs => {
  const v = bs.filter(Boolean); if (!v.length) return null
  const L = Math.min(...v.map(b => b.x)), T = Math.min(...v.map(b => b.y)), R = Math.max(...v.map(b => b.x + b.width)), B = Math.max(...v.map(b => b.y + b.height))
  return { x: L, y: T, width: R - L, height: B - T }
}
/* rings: groups of what is NEW (each group one thin ring in the accent colour, never a glow); clip: what the picture is
   about; when: 'today' | 'proposed' */
export async function shot(s, file, { rings = [], clip = [], pad = 14, what, when, size }) {
  const { page } = s
  await page.mouse.move(1, 1).catch(() => {})
  const rbs = []
  for (const g of rings) rbs.push(union(await Promise.all(g.map(t => box(s, t)))))
  if (rings.length && rbs.some(r => !r)) note(`[${s.sz}] ${file}: a ring found nothing`)
  for (const r of rbs.filter(Boolean)) await page.evaluate(([r, c]) => {
    const d = document.createElement('div'); d.className = 'mRing'
    Object.assign(d.style, { position: 'fixed', left: `${r.x - 4}px`, top: `${r.y - 4}px`, width: `${r.width + 8}px`, height: `${r.height + 8}px`, border: `2px solid ${c}`, borderRadius: '9px', boxSizing: 'border-box', pointerEvents: 'none', zIndex: '2147483647' })
    document.body.appendChild(d)
  }, [r, ACCENT])
  await page.waitForTimeout(150)
  const rb = union(rbs)
  const cb = union([rb && { x: rb.x - 6, y: rb.y - 6, width: rb.width + 12, height: rb.height + 12 }, ...(await Promise.all(clip.map(t => box(s, t))))])
  let cut = null
  if (cb) {
    const vp = page.viewportSize()
    const x = Math.max(0, cb.x - pad), y = Math.max(0, cb.y - pad)
    cut = { x, y, width: Math.min(vp.width, cb.x + cb.width + pad) - x, height: Math.min(vp.height, cb.y + cb.height + pad) - y }
  }
  await page.screenshot({ path: `${DIR}/${file}`, ...(cut ? { clip: cut } : {}) })
  await page.evaluate(() => document.querySelectorAll('.mRing').forEach(e => e.remove()))
  const vp = page.viewportSize()
  manifest.push([file, what, size || `${s.desk ? 'desktop' : 'phone'} ${vp.width} × ${vp.height}`, when])
  facts[file] = { rings: rbs.filter(Boolean).length, cut }
}
export function saveManifest(name) { writeFileSync(`${process.env.MQ_RAW}/${name}-manifest.json`, JSON.stringify(manifest, null, 1)) }

/* ---- the proposed look, in the browser only ---- */
const KEEP = ['viewsched', 'help']
/* the top bar's page names: only View-only Sched and Help stand */
export const barViewOnly = s => s.page.evaluate(keep => {
  for (const a of document.querySelectorAll('#topnav a[data-page]')) if (!keep.includes(a.dataset.page)) a.style.display = 'none'
}, KEEP)
/* the ☰ menu's MENU list: only View-only Sched and Help */
export const drawerViewOnly = s => s.page.evaluate(keep => {
  for (const a of document.querySelectorAll('#drawerNav a[data-page]')) if (!keep.includes(a.dataset.page)) a.style.display = 'none'
}, KEEP)
/* the Schedules menu's rows as the app draws them (tick, number, grey label) — read by opening it with its own button */
export async function schedRows(s) {
  const { page } = s
  await page.locator('#sqnMenuBtn:visible').first().click(); await page.waitForTimeout(350)
  const html = await page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-row')].map(r => r.outerHTML))
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  if (await page.locator('#sqnMenu').count()) { await page.mouse.click(page.viewportSize().width - 6, page.viewportSize().height - 6); await page.waitForTimeout(300) }
  return html
}
/* the new first section of the ☰ menu: "SQUADRON" in the MENU / ACCOUNT heading's own look (the panel's h4), then one
   row in the Schedules menu's row look (.sb-moreitem .sqm-row, 38 high): the number, its grey label beside it, ▾ at the
   right edge; opened, ▴, and the Schedules menu's rows under it, in place */
export const addSquadronSection = (s, { num, label, open = false, rows = [] }) => s.page.evaluate(({ num, label, open, rows }) => {
  const panel = document.querySelector('#drawer .drawer-panel')
  const menuH = panel.querySelector(':scope > h4')
  const h = document.createElement('h4'); h.textContent = 'Squadron'; h.className = 'mk-sqh'
  const row = document.createElement('button'); row.type = 'button'; row.className = 'sb-moreitem sqm-row mk-sqrow'
  row.setAttribute('aria-expanded', String(open))
  row.innerHTML = `<span class="sqm-num">${num}</span><span class="sqm-lbl" style="margin-left:0;padding-left:10px">${label}</span>`
    + `<span class="mk-caret" style="margin-left:auto;color:var(--ink-3)">${open ? '▴' : '▾'}</span>`
  panel.insertBefore(h, menuH); panel.insertBefore(row, menuH)
  if (open) {
    const list = document.createElement('div'); list.className = 'mk-sqlist'; list.setAttribute('role', 'menu')
    list.innerHTML = rows.join('')
    panel.insertBefore(list, menuH)
  }
}, { num, label, open, rows })

/* every change of the mock taken off again — the page back to what the app drew */
export const resetMock = s => s.page.evaluate(() => {
  document.querySelectorAll('.mk-sqh, .mk-sqrow, .mk-sqlist, .mk-sqchips, .mk-sqline, .mk-talon').forEach(e => e.remove())
  document.querySelectorAll('#drawerNav a[data-page], #topnav a[data-page]').forEach(a => { a.style.display = '' })
})

/* VERSION B (the owner asked for a better design, 23 Nov 26): under "SQUADRON", one row of chips, one per squadron he
   can pick, in the bell's Show-row look exactly (.bl-sqns > .fchip, 6px apart, the one in view drawn "on"); the row
   slides sideways, never wrapping, as the bell's does — here a block row the panel's width (the bell's sits inline in
   its foot); under it one grey line in the menu's own grey line (.drawer-acct) naming the access in view in the
   Schedules menu's words ("149 · View only"). `sqns`: [{ num, label, on }] in the Schedules menu's order. */
/* version C passes { head: false, top: '14px' }: no "SQUADRON" label, the row a little under the TALON mark */
export const addSquadronChips = (s, sqns, { head = true, top = '0' } = {}) => s.page.evaluate(({ sqns, head, top }) => {
  const panel = document.querySelector('#drawer .drawer-panel')
  const menuH = panel.querySelector(':scope > h4')
  const h = document.createElement('h4'); h.textContent = 'Squadron'; h.className = 'mk-sqh'
  const row = document.createElement('span'); row.className = 'bl-sqns mk-sqchips'; row.setAttribute('role', 'group')
  Object.assign(row.style, { display: 'flex', width: '100%', marginTop: top })
  row.innerHTML = sqns.map(q => `<button type="button" class="fchip${q.on ? ' on' : ''}" aria-pressed="${q.on}">${q.num}</button>`).join('')
  const cur = sqns.find(q => q.on)
  const line = document.createElement('p'); line.className = 'drawer-acct mk-sqline'; line.style.margin = '8px 0 0'
  line.textContent = `${cur.num} · ${cur.label}`
  if (head) panel.insertBefore(h, menuH)
  panel.insertBefore(row, menuH); panel.insertBefore(line, menuH)
  return [...row.querySelectorAll('.fchip')].map(b => { const r = b.getBoundingClientRect(); return `${b.textContent} ${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.left)}` })
}, { sqns, head, top })
/* VERSION C (his idea after his look, 23 Nov 26): the menu opens with the TALON mark — the top bar's own mark, cloned
   from the bar as it is drawn there (claw, "TALON", the small squadron number above it) and given the bar's computed
   sizes and colours inline (the phone's mark is sized by rules that only reach inside the top bar); not a button here,
   so no ▾. Put first in the panel. */
export const addTalonMark = s => s.page.evaluate(() => {
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
  const wrap = document.createElement('div'); wrap.className = 'mk-talon'
  clone.classList.remove('menu'); clone.removeAttribute('id')
  if (clone.tagName === 'SPAN') clone.style.display = 'flex'
  wrap.appendChild(clone)
  panel.insertBefore(wrap, panel.firstChild)
  const r = src.getBoundingClientRect(), c = clone.getBoundingClientRect()
  return { bar: `${Math.round(r.width)}x${Math.round(r.height)}`, menu: `${Math.round(c.width)}x${Math.round(c.height)}`, num: clone.textContent }
})
/* the Schedules menu's rows (as schedRows reads them) as chips: number, grey label, whether it is the one in view */
export const rowsToChips = rows => rows.map(h => ({
  num: (h.match(/class="sqm-num">([^<]*)</) || [])[1],
  label: (h.match(/class="sqm-lbl">([^<]*)</) || [])[1],
  on: /aria-checked="true"/.test(h),
}))

/* the roles table's View cell for a page, as proposed: "—" in the dash's own look */
export const rolesCell = (s, pageId, role, mark) => s.page.evaluate(({ pageId, role, mark }) => {
  const td = document.querySelector(`[data-testid="acc-roles"] tr[data-page="${pageId}"] td[data-role="${role}"]`)
  if (!td) return false
  td.textContent = mark; td.className = mark === '—' ? 'n' : mark === 'read' ? 'r' : 'y'
  return true
}, { pageId, role, mark })
