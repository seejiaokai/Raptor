// AN ATTACH ON THE LEAVE WAR, AS BUILT (25 Oct 26) — for his question "How does it look in the Leave War? Is there a button
// for it?" after D1377. Pictures of the real app, nothing drawn but the cyan mark and the label:
//   att-built-war      an Attach filed for Drifter through the Inputs page's own window (Wed 15 – Thu 16 Jul, "To" 145 Sqn):
//                      the grid's ATCH boxes and the Available P row one lower
//   att-built-day      a tap on one of its days: what opens
//   att-built-more     a tap on a free day: the bid window's row under the leaves and its ⋯ open — no Attach there today
//   att-built-member   the same window for a member (his own row): CSE · OD only
// Usage (from raptor-port/, a preview served): node scripts/handpass/lw-1025-attach-look.mjs  [LW_PORT=4180] [SIZES=phone]
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-drawings/attach-built'
const { mkdirSync, writeFileSync } = await import('node:fs')
const path = await import('node:path')
const here0 = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
mkdirSync(path.resolve(here0, '../../docs/img/handpass', process.env.LW_OUT), { recursive: true })
const L = await import('./lw-r3-lib.mjs')
const T = L.T
const SIZES = (process.env.SIZES || 'phone').split(',')
const log = []
const note = (id, size, said) => { log.push({ id, size, said }); console.log(`   ${id} [${size}] ${said}`) }
const hideTransient = P => P.addStyleTag({ content: '#toastEl, .toast, .secdef-snack, .savestat, .saveband { visibility: hidden !important }' })

async function frame(w, name, { marks = [], around = [], label, pad = 8 }) {
  const P = w.page
  const tg = `${name}-${w.size}`
  const clip = await P.evaluate(({ marks, around, label, pad }) => {
    for (const e of document.querySelectorAll('.qmk')) e.remove()
    const one = s => { const e = [...document.querySelectorAll(s)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom } }
    const uni = rs => { rs = rs.filter(Boolean); if (!rs.length) return null; return { l: Math.min(...rs.map(r => r.l)), t: Math.min(...rs.map(r => r.t)), r: Math.max(...rs.map(r => r.r)), b: Math.max(...rs.map(r => r.b)) } }
    const missing = []
    const mr = marks.map(m => { const r = one(m); if (!r) missing.push(m); return r }).filter(Boolean)
    const ar = around.map(a => { const r = one(a); if (!r) missing.push(a); return r }).filter(Boolean)
    if (missing.length) return { missing }
    const box = r => { const d = document.createElement('div'); d.className = 'qmk'; Object.assign(d.style, { position: 'fixed', left: `${r.l - 4}px`, top: `${r.t - 4}px`, width: `${r.r - r.l + 8}px`, height: `${r.b - r.t + 8}px`, zIndex: 2147483647, pointerEvents: 'none', border: '2px dashed rgba(59,198,232,.9)', borderRadius: '7px' }); document.body.appendChild(d); return { l: r.l - 4, t: r.t - 4, r: r.r + 4, b: r.b + 4 } }
    const inflated = mr.map(box)
    let c = uni([...ar, ...inflated]); c = { l: c.l - pad, t: c.t - pad, r: c.r + pad, b: c.b + pad }
    const tag = document.createElement('div'); tag.className = 'qmk'; tag.textContent = label
    Object.assign(tag.style, { position: 'fixed', zIndex: 2147483647, pointerEvents: 'none', background: '#1d232c', color: '#e9eef5', font: '600 13px/17px -apple-system, "Segoe UI", system-ui, sans-serif', padding: '5px 9px', borderRadius: '8px', border: '1.5px solid rgba(59,198,232,.9)', maxWidth: `${Math.min(innerWidth - 12, 380)}px` })
    document.body.appendChild(tag)
    const tw = tag.offsetWidth, th = tag.offsetHeight
    let tx = Math.max(4, Math.min(c.l + 2, innerWidth - tw - 4)), ty
    if (c.t - th - 6 >= 2) { ty = c.t - th - 6; c.t = ty - 4 } else { ty = Math.min(innerHeight - th - 2, c.b + 4); c.b = ty + th + 4 }
    tag.style.left = `${tx}px`; tag.style.top = `${ty}px`
    c.l = Math.min(c.l, tx - 4); c.r = Math.max(c.r, tx + tw + 4)
    c = { l: Math.max(0, c.l), t: Math.max(0, c.t), r: Math.min(innerWidth, c.r), b: Math.min(innerHeight, c.b) }
    return { x: Math.round(c.l), y: Math.round(c.t), width: Math.round(c.r - c.l), height: Math.round(c.b - c.t) }
  }, { marks, around, label, pad })
  if (clip.missing) throw new Error(`${tg}: nothing drawn for ${clip.missing.join(', ')}`)
  await P.screenshot({ path: path.join(L.OUT, tg + '.png'), clip, scale: 'device' })
  await P.evaluate(() => { for (const e of document.querySelectorAll('.qmk')) e.remove() })
  console.log(`   picture ${tg}.png — ${label}`)
}
const openInputsList = async w => {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0))
  await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1000)
  if (!(await L.vis(P, T('in-new')))) { await L.press(w, '#inListBtn'); await P.waitForTimeout(700) }
  await P.waitForSelector(T('in-new'), { timeout: 5000 })
}
const availP = (P, iso) => L.txt(P, T('avail-p-' + iso))
/* the Manning rows open folded on a phone (D1258) — opened through their own button */
const openManning = async (w, iso) => { if (!(await w.page.locator(T('avail-p-' + iso)).count())) { await L.press(w, T('counts-toggle')); await w.page.waitForTimeout(600) } }

for (const size of SIZES) {
  const w = await L.newCtx(size); const P = w.page
  w.errs = []; P.on('pageerror', e => w.errs.push(String(e))); P.on('console', m => { if (m.type() === 'error') w.errs.push(m.text()) })
  await L.signInPlain(w, 'admin'); await hideTransient(P)
  const who = await P.evaluate(() => Object.entries(window.PEOPLE || {}).find(([, v]) => v.cs === 'Drifter')?.[0])
  const days = ['2026-07-15', '2026-07-16'], free = '2026-07-20'
  await L.reachCell(w, who, days[0])
  await openManning(w, days[0])
  const before = { [days[0]]: await availP(P, days[0]), [days[1]]: await availP(P, days[1]) }

  /* file the Attach through the Inputs page's own window */
  await openInputsList(w)
  await L.press(w, T('in-new')); await P.waitForSelector(T('win-inputedit'), { timeout: 5000 }); await P.waitForTimeout(600)
  await P.locator('#inpEditPerson').selectOption({ label: 'Drifter' })
  await P.locator('#inpEditType').selectOption('Attach'); await P.waitForTimeout(400)
  await P.locator('#inpEditTo').fill('145 Sqn')
  await P.locator('#inpEditRmk').fill('Exercise support')
  await L.press(w, `[data-testid="inpEdCal-day-${days[0]}"]`); await P.waitForTimeout(300)
  await L.press(w, `[data-testid="inpEdCal-day-${days[1]}"]`); await P.waitForTimeout(400)
  await L.press(w, '#inpEditSave'); await P.waitForTimeout(1200)
  const rec = await P.evaluate(who => (window.INPUTS || []).filter(r => r.type === 'Attach' && (r.people || []).some(x => x.p === who)).map(r => ({ date: r.date, endDate: r.endDate, acc: r.acc, to: r.to })), who)
  note('filed', size, JSON.stringify(rec))
  if (!rec.some(r => r.acc === 'u' && r.to === '145 Sqn')) throw new Error('the Attach did not land under Unavailable with its To')

  /* the Leave War */
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(1200)
  await L.reachCell(w, who, days[0])
  await openManning(w, days[0])
  await P.locator(T(L.cellId(who, days[0]))).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await P.waitForTimeout(500)
  const after = { [days[0]]: await availP(P, days[0]), [days[1]]: await availP(P, days[1]) }
  const cell = await L.cellInfo(P, who, days[0])
  note('war', size, `cell ${JSON.stringify(cell?.boxes?.map(b => b.text + ' ' + b.cls))}; Available P ${before[days[0]]} → ${after[days[0]]}`)
  /* the Available rows stand at the foot of the frozen top; the person's row below — the shot holds both */
  await frame(w, 'att-built-war', {
    marks: [T(L.cellId(who, days[0])), T(L.cellId(who, days[1])), T('avail-p-' + days[0]), T('avail-p-' + days[1])],
    around: [T('head-' + days[0]), `${T('row-' + who)} td.who`],
    label: `As built: an Attach filed on the Inputs page reads ATCH, outlined, and Available P goes ${before[days[0]]} → ${after[days[0]]}`,
  })

  /* a tap on one of its days */
  await L.openCellR(w, who, days[0])
  const opened = await P.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().height > 0 && /^(bid-picker|day-list|daylist|lw-daylist|win-lwday)/.test(e.dataset.testid)).map(e => e.dataset.testid))
  note('tap', size, 'opened: ' + opened.join(', '))
  const sheet = await P.evaluate(() => { const e = [...document.querySelectorAll('.bidsheet, [role="dialog"]')].filter(e => e.getBoundingClientRect().height > 0).pop(); if (!e) return null; e.setAttribute('data-shotme', '1'); return e.innerText.replace(/\s+/g, ' ').slice(0, 300) })
  note('tap', size, 'window: ' + sheet)
  if (sheet) await frame(w, 'att-built-day', { marks: [], around: ['[data-shotme="1"]'], label: 'A tap on an Attach day: its window, read only — it is changed on the Inputs page', pad: 4 })
  await L.closeAny(w)

  /* a free day: the bid window's row under the leaves, its ⋯ open */
  await L.openCellR(w, who, free)
  await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  await L.press(w, T('bid-more')); await P.waitForTimeout(400)
  const items = await P.evaluate(() => [...document.querySelectorAll('[role="menu"] [role="menuitem"], .more-menu button')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.textContent.trim()))
  note('more', size, 'row: ' + await L.txt(P, T('bid-extra-row')) + ' · ⋯ holds: ' + items.join(', '))
  await frame(w, 'att-built-more', { marks: [T('bid-extra-row')], around: [T('bid-picker')], label: `Today: the bid window offers CSE · OD · Grant OIL · ⋯ (${items.join(', ')}) — no Attach`, pad: 4 })
  /* DRAWN: an "Attach" line in the ⋯, first, cloned from the menu's own "Other" line (nothing stored) */
  const drew = await P.evaluate(() => {
    const items = [...document.querySelectorAll('[role="menu"] [role="menuitem"], .more-menu button')].filter(e => e.getBoundingClientRect().height > 0)
    const oth = items.find(e => e.textContent.trim() === 'Other'); if (!oth) return false
    const c = oth.cloneNode(true); c.textContent = 'Attach'; c.setAttribute('data-drawn', 'att'); c.removeAttribute('data-testid')
    oth.parentNode.insertBefore(c, oth); return true
  })
  if (!drew) throw new Error('no Other line to draw beside')
  await P.waitForTimeout(200)
  await frame(w, 'att-drawn-more', { marks: ['[data-drawn="att"]'], around: [T('bid-picker')], label: 'Drawn: Attach in the ⋯, first — filed straight under Unavailable, as an Other is', pad: 4 })
  await L.closeAny(w)
  await w.ctx.close()

  /* the member's window on his own free day */
  const m = await L.newCtx(size); const MP = m.page
  await L.signInPlain(m, 'member'); await hideTransient(MP)
  const me = 'bane'
  const mfree = await MP.evaluate(() => { const c = [...document.querySelectorAll('[data-testid^="cell-bane-"]')].find(e => !e.textContent.trim() && !e.className.includes('closed')); return c?.dataset.testid?.slice('cell-bane-'.length) ?? null })
  note('member', size, 'free day ' + mfree)
  if (mfree) {
    await L.openCellR(m, me, mfree)
    if (await L.vis(MP, T('bid-picker'))) {
      note('member', size, 'row: ' + await L.txt(MP, T('bid-extra-row')))
      await frame(m, 'att-built-member', { marks: [T('bid-extra-row')], around: [T('bid-picker')], label: 'Today, a member: CSE · OD under the leaves — no Attach, no ⋯', pad: 4 })
    } else note('member', size, 'no bid window opened (the day may be closed for bidding)')
  }
  if (w.errs.length) note('errors', size, w.errs.slice(0, 5).join(' || '))
  await m.ctx.close()
}
await L.closeBrowser()
writeFileSync(path.join(L.OUT, 'run.json'), JSON.stringify(log, null, 1))
