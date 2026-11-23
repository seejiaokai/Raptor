// D2381's mock-up, VERSION D of the ☰ menu (his D2382 and D2383, 23 Nov 26): the menu opens with the TALON mark AS A
// DROP-DOWN, the top bar's own "149 ▾" — a tap opens the Schedules menu's list right under it, inside the menu; a pick
// switches the squadron. Under the mark one grey line says his access to the squadron in view ("149 · View only").
// No chips, no "SQUADRON" label. One squadron: the mark alone, no ▾ — the grey line still there (the agent's reading of
// D2383, put to him). NO RINGS — every picture clean, as the built app would look (skill note 1025).
// Phone (WebKit, iPhone 402 × 874, ×2, touch): d1 Ranger with 149 picked, closed; d2 the same, opened; d3 Ranger just
// after picking 142 there (the menu still open, every page back); d4 Saber with eight squadrons, opened; d5 one squadron.
import { serve, stop, signIn, pick, save, errs, facts } from '../walk/lib.mjs'
import { navTo, adminCat, openRow, lineBtn } from '../walk/w1-view.mjs'
import { step, as, press, vis, drawerOpen, drawerCloseOutside, drawerItems } from '../rewalk/rlib.mjs'
import { newPage } from '../morning/mlib.mjs'
import { shot, saveManifest, drawerViewOnly, schedRows, rowsToChips, resetMock } from './klib.mjs'

const P = 'phone 402 × 874'
const clip = ['#drawer .drawer-panel > :first-child', '#drawerLogout']

async function giveRangerView(s) {
  await adminCat(s, 'Users'); await openRow(s, 'bane')
  if ((await s.page.locator(lineBtn('149', 'view')).getAttribute('aria-pressed')) !== 'true') await press(s, lineBtn('149', 'view'))
  await press(s, '#accEdSave'); await s.page.waitForTimeout(500)
}
async function makeSquadron(s, num) {
  const { page } = s
  if (!(await vis(s, '#sqNew'))) await adminCat(s, 'Squadrons')
  await press(s, '#sqNew')
  await page.fill('#sqNewNum', String(num))
  await page.selectOption('#sqNewAdmin', { label: 'Hunter · 142' }).catch(() => {})
  await press(s, '#sqNewSave'); await page.waitForTimeout(500)
}

/* D: the top bar's mark cloned with its ▾ kept (".mark.menu"), in the top bar's own button look (".sqm-btn", ".on" while
   open — the soft box the bar's button shows when its list is open); under it, when open, the Schedules menu's own rows
   (tick, number, grey label — read from the app's list), in the small menu's look but sitting in the ☰ menu, not hung
   over it; then the grey line in the menu's own grey (.drawer-acct). The phone's mark is sized by rules that reach only
   inside the top bar, so its computed sizes are copied inline, as version C did. */
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
  const r = src.getBoundingClientRect(), c = clone.getBoundingClientRect()
  const l = wrap.querySelector('.mk-sqlist')
  return { bar: `${Math.round(r.width)}x${Math.round(r.height)}`, menu: `${Math.round(c.width)}x${Math.round(c.height)}`, num: clone.textContent,
    caret: getComputedStyle(clone.querySelector('.k'), '::after').content, list: l ? `${Math.round(l.getBoundingClientRect().width)}x${Math.round(l.getBoundingClientRect().height)}` : null }
}, { open, rows, line })

async function drawD(s, key, { viewOnly = false, one = false, open = false } = {}) {
  let rows = [], line = '142 · Your squadron'
  if (!one) {
    rows = await schedRows(s)
    const cur = rowsToChips(rows).find(c => c.on)
    line = `${cur.num} · ${cur.label}`
    facts[`${key}-rows`] = rowsToChips(rows).map(c => `${c.num}${c.on ? '*' : ''} ${c.label}`)
  }
  await drawerOpen(s)
  facts[`${key}-mark`] = await addMarkD(s, { open, rows, line })
  if (viewOnly) await drawerViewOnly(s)
  facts[`${key}-menu`] = await drawerItems(s)
}

await serve()
try {
  const s = await newPage('p')
  await signIn(s, 'us', 'us')
  await step('d5 one squadron', async () => {
    facts['d5-menuBtn'] = await vis(s, '#sqnMenuBtn')
    await drawD(s, 'd5', { one: true })
    await shot(s, 'd5-menu-one-squadron-proposed.png', { clip, when: 'proposed (D)', size: P,
      what: 'Version D, Ranger with one squadron: the TALON mark alone ("142", no ▾ — nothing to pick), the grey line "142 · Your squadron" under it; MENU and ACCOUNT as today.' })
    await resetMock(s); await drawerCloseOutside(s)
  })
  await as(s, 'ad', 'a')
  await step('saber gives Ranger View of 149', () => giveRangerView(s))
  await as(s, 'us', 'us')
  await step('d1 and d2, 149 picked', async () => {
    await pick(s, '149'); await navTo(s, 'View-only Sched')
    await drawD(s, 'd1', { viewOnly: true })
    await shot(s, 'd1-menu-149-closed-proposed.png', { clip, when: 'proposed (D)', size: P,
      what: 'Version D, Ranger with 149 picked, the drop-down closed: the TALON mark reading "149 ▾", the grey line "149 · View only" under it; MENU with only View-only Sched and Help; ACCOUNT as today.' })
    await resetMock(s); await drawerCloseOutside(s)
    await drawD(s, 'd2', { viewOnly: true, open: true })
    await shot(s, 'd2-menu-149-open-proposed.png', { clip, when: 'proposed (D)', size: P,
      what: 'Version D, the same after one tap on the mark: the Schedules list opens right under it, inside the menu — 142 "Your squadron", 149 ticked "View only" — the mark in its pressed look; the grey line and MENU move down under the list.' })
    await resetMock(s); await drawerCloseOutside(s)
  })
  await step('d3 just after picking 142', async () => {
    await pick(s, '142')
    await drawD(s, 'd3')
    await shot(s, 'd3-menu-after-picking-142-proposed.png', { clip, when: 'proposed (D)', size: P,
      what: 'Version D, just after picking 142 in that list: the list closes, the menu stays open, the mark reads "142 ▾", the grey line "142 · Your squadron", and every page is back in MENU.' })
    await resetMock(s); await drawerCloseOutside(s)
  })
  await as(s, 'ad', 'a')
  await step('d4 Saber eight', async () => {
    await adminCat(s, 'Squadrons')
    for (let n = 150; n <= 155; n++) await makeSquadron(s, n)
    facts['d4-sqlist'] = (await s.page.evaluate(() => document.querySelectorAll('#sqList [data-unit]').length))
    await navTo(s, 'View-only Sched')
    await drawD(s, 'd4', { open: true })
    await shot(s, 'd4-menu-saber-eight-open-proposed.png', { clip, when: 'proposed (D)', size: P,
      what: 'Version D for Saber, a master admin, with eight squadrons (142, 149, 150 to 155), the list open: eight rows under the mark, 142 ticked "Your squadron", every other "Full access"; the grey line "142 · Your squadron"; MENU and ACCOUNT under them (the menu scrolls if they pass the screen\'s foot).' })
    await resetMock(s); await drawerCloseOutside(s)
  })
  await s.ctx.close()
} finally { saveManifest('k5'); save('k5'); await stop() }
console.log(JSON.stringify(Object.fromEntries(Object.entries(facts).filter(([k]) => !k.endsWith('.png'))), null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
