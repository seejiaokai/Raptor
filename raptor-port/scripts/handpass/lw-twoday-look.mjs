// lw-twoday-look — his Q6 follow-up (24 Oct 26, "if this day u click has ATT B and LL, how would it look?") with his
// D1315 (a day of two entries shows each entry's code, Remarks and Document) and D1327 (each entry in the day's list
// leads with its coloured box, as the grid draws it). The demo has no ATT B + LL day, so one is made on Drifter, Mon 9 Nov
// 26: a MORNING LL bid placed through the bid window (AM, then LL — the app's own controls), and an AFTERNOON ATT B filed
// through the Inputs page's own write door (`window.fileInput`, localhost only — the one the e2e files use).
// Colours as ruled: set C's medical red (D1316), the OIL taken chartreuse (D1323), UNA teal (D1325).
// Pass 1 (MODE=probe): today's list pictures and the grid cell's own boxes, measured. Pass 2 (default): the drawings.
// Usage: PORT=4320 node scripts/handpass/lw-twoday-look.mjs
import * as L from './lw-declutter-lib.mjs'
import path from 'node:path'
import { writeFileSync } from 'node:fs'
console.log('lw-twoday-look v4')
const OUT = path.resolve('docs/img/handpass/2026-10-24-lw-declutter')
const DAY = '2026-11-09'
export const SETC = `.c.k-med, .tchip.lv.k-med { --h: 238, 82, 82 !important; --ink: #FFD6D6 !important; --fill: .30 !important; }`

export async function setupDay(w, { approve = false } = {}) {
  const P = w.page
  const who = await P.evaluate(() => Object.entries(window.PEOPLE || {}).find(([, v]) => v.cs === 'Drifter')?.[0])
  /* the morning LL, through the bid window */
  await L.openCellR(w, who, DAY)
  await L.press(w, L.T('portion-am')); await L.press(w, L.T('bid-LL')); await P.waitForTimeout(500)
  await L.closeAny(w)
  /* the afternoon ATT B, through the Inputs page's own write door, with a remark as a member writes one */
  await P.evaluate(who => window.fileInput({ person: who, date: 'Nov 9', yr: 2026, type: 'ATT B', allday: false, half: 'pm', s: 721, e: 1439, remarks: 'Clinic review — no flying' }), who)
  await P.waitForTimeout(600)
  if (approve) {
    await L.openCellR(w, who, DAY)
    const id = await P.evaluate(() => document.querySelector('[data-testid^="dl-approve-"]')?.dataset.testid)
    if (id) { await L.press(w, L.T(id)); await P.waitForTimeout(500) }
    await L.closeAny(w)
  }
  return who
}
export const cellBoxes = (P, who) => P.evaluate(([who, day]) => {
  const td = document.querySelector(`[data-testid="cell-${who}-${day}"]`); if (!td) return null
  const tr = td.getBoundingClientRect()
  return { w: Math.round(tr.width), h: Math.round(tr.height), html: td.innerHTML.slice(0, 900), boxes: [...td.querySelectorAll('.c')].map(c => { const r = c.getBoundingClientRect(); const cs = getComputedStyle(c); return { cls: c.className, t: c.textContent, x: Math.round(r.left - tr.left), y: Math.round(r.top - tr.top), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, bg: cs.backgroundColor } }) }
}, [who, DAY])
export const sheetClip = P => P.evaluate(() => { const e = [...document.querySelectorAll('[data-testid="daylist-sheet"] , .bidsheet')].pop(); const r = e.getBoundingClientRect(); return { x: Math.max(0, r.left - 4), y: Math.max(0, r.top - 4), width: r.width + 8, height: r.height + 8 } })

/* THE DRAWN LIST (round 3 + D1315 + D1327), as ONE transform on the open day's list:
   - each entry leads with its box: the grid cell's OWN box for that entry, cloned into the Legend's own frame (`.leg-box`,
     the cell's classes — the morning box in the top half, the afternoon one in the bottom half, the Inputs page's cyan edge
     kept), so the list, the Legend and the grid draw it alike;
   - its words lose the code the box now says ("<LL — local leave…" → "Local leave…");
   - its actions stand on one row (round 3's change 3), "Note" gone (D1307);
   - a leave the list may change gets round 3's words row — the dark Remarks box (D1308), its till tick and the one
     Document button — cloned whole from the bid window's own (harvested by `harvestWords`);
   - an entry filed on the Inputs page shows its remarks and its document read only (D1315), and where it is changed. */
export const LISTCSS = `
.bidsheet .daylist.mock-list { border: 0; border-radius: 0; margin-top: 2px; overflow: visible; }
.bidsheet .dl-line.mock-card { flex-direction: column; align-items: stretch; gap: 8px; padding: 10px 0; border-left: 0; }
.bidsheet .dl-line.mock-card:first-child { padding-top: 4px; }
.bidsheet .mock-card .dchip { white-space: nowrap; }
.bidsheet .mock-head { display: flex; align-items: center; gap: 10px; min-width: 0; }
.bidsheet .mock-head .leg-box { zoom: 1.25; }
.bidsheet .mock-card .dl-acts { flex-wrap: wrap; }
.bidsheet .mock-card .dl-acts.mock-four { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.bidsheet .mock-card .dl-acts.mock-four .dchip { justify-content: center; }
.bidsheet .dl-acts .dchip.approve.mock-lit-approve { background: rgba(87, 201, 122, .45) !important; color: #F2FFF5 !important; border-color: rgba(87, 201, 122, 1) !important; }
.bidsheet .mock-card .bidsheet-row { padding: 0; margin: 0; }
.bidsheet .mock-ro { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 13px; color: var(--ink-2); }
.bidsheet .mock-ro .docchip .docdel { display: none; }
`
export async function harvestWords(w, who, day, { doc = true } = {}) {
  const P = w.page
  await L.openCellR(w, who, day)
  if (!(await L.vis(P, L.T('bid-picker')))) { await L.closeAny(w); return null }
  if (doc) await L.setDoc(w, '[data-testid="bid-doc-row"]', 'leave-form.pdf')
  await transform(P, { p: 'bid', admin: true })
  const html = await P.evaluate(() => {
    const row = document.querySelector('.bidsheet .bp-rmk')?.closest('.bidsheet-row')
    const chip = document.querySelector('.bidsheet .docchip')
    return row ? { row: row.outerHTML, chip: chip ? chip.outerHTML : null } : null
  })
  await P.evaluate(() => document.getElementById('mock-declutter')?.remove())
  await L.closeAny(w)
  return html
}
export const drawList = (P, who, words, opt = {}) => P.evaluate(({ who, day, css, words, opt }) => {
  let st = document.getElementById('mock-twoday'); if (!st) { st = document.createElement('style'); st.id = 'mock-twoday'; document.head.appendChild(st) } st.textContent = css
  const list = document.querySelector('[data-testid="daylist"]'); if (!list) return 'no list'
  const td = document.querySelector(`[data-testid="cell-${who}-${day}"]`)
  const gridBoxes = td ? [...td.querySelectorAll('.c')] : []
  const done = []
  list.classList.add('mock-list')
  for (const li of list.querySelectorAll(':scope > li')) {
    const main = li.querySelector('.dl-main'); if (!main) continue
    const text = main.textContent
    const code = text.split(' — ')[0].replace(/[<>*]/g, '').trim()   // "<LL" → LL, "ATT B>" → ATT B
    const kind = /^ATT|^OML|^HL/.test(code) ? 'k-med' : 'k-' + code.toLowerCase()
    const box = gridBoxes.find(b => b.classList.contains(kind))
    li.classList.add('mock-card')
    /* the head: the box, then the words without the code */
    const head = document.createElement('div'); head.className = 'mock-head'
    const frame = document.createElement('span'); frame.className = 'leg-box mock-new'
    if (box) frame.appendChild(box.cloneNode(true))
    head.appendChild(frame)
    const rest = text.split(' — ').slice(1).join(' — ')
    /* HIS D1328: beside the box, only what the box does not say — its half, its state, where an Inputs-page entry is
       changed; never the kind's long description (the Legend holds it) */
    const part = /\bmorning\b/.test(rest) ? 'Morning' : /\bafternoon\b/.test(rest) ? 'Afternoon' : ''
    const filed = /filed on the Inputs page/.test(rest)
    const state = filed ? 'change it on the Inputs page' : /bid refused/.test(rest) ? 'refused' : /bid pending/.test(rest) ? 'pending' : /approved/.test(rest) ? 'approved' : ''
    const said = [part, state].filter(Boolean).join(' · ')
    main.textContent = said.charAt(0).toUpperCase() + said.slice(1)
    if (filed) li.querySelector('.dl-sub')?.remove()
    /* HIS D1329: the row of actions on one line — (A) the bid window's own row, Approve lit on an approved leave (a second
       tap sends it back to waiting); (B) "Back to bid" in shorter words */
    const back = li.querySelector('[data-testid^="dl-unapprove-"]')
    if (back && opt.acts === 'A') { back.textContent = 'Approve'; back.className = 'dchip approve mock-lit-approve mock-new'; back.setAttribute('aria-pressed', 'true') }
    if (back && opt.acts === 'B') { back.textContent = 'Unapprove'; back.classList.add('mock-new') }
    if (opt.member) li.querySelectorAll('[data-testid^="dl-approve-"], [data-testid^="dl-refuse-"]').forEach(e => e.remove())
    if (opt.acts === 'A' || !back) li.querySelector('.dl-acts')?.classList.add('mock-four')
    const txt = li.querySelector('.dl-text'); txt.before(head); head.appendChild(txt)
    /* Note gone (D1307) */
    li.querySelector('[data-testid^="dl-note-"]')?.remove()
    li.querySelectorAll('[data-testid^="dl-doc-"]').forEach(e => e.remove())
    const acts = li.querySelector('.dl-acts'); if (acts && !acts.children.length) acts.remove()
    const inputsOwned = /filed on the Inputs page/.test(rest)
    if (!inputsOwned && words?.row) {
      const t = document.createElement('div'); t.innerHTML = words.row
      const row = t.firstElementChild; row.classList.add('mock-new')
      const inp = row.querySelector('input[type="text"]'); if (inp) { inp.placeholder = 'Remarks'; inp.value = opt.remark || '' }
      if (!opt.leaveDoc) {
        row.querySelectorAll('.docchip').forEach(c => c.remove())
        const b = row.querySelector('.docbtn'); if (b) { b.classList.remove('has'); const sp = b.querySelector('span'); if (sp) sp.textContent = 'Document' }
      }
      /* the till tick names this day (the row was copied from another day's window) */
      const walk = document.createTreeWalker(row, NodeFilter.SHOW_TEXT)
      for (let n = walk.nextNode(); n; n = walk.nextNode()) if (/till \d+ \w+/.test(n.textContent)) n.textContent = n.textContent.replace(/till \d+ \w+/, 'till ' + opt.dayWord)
      li.appendChild(row)
    }
    if (inputsOwned) {
      /* its remarks and document, read only (D1315) — what the Inputs page holds for it */
      const ro = document.createElement('div'); ro.className = 'mock-ro mock-new'
      const rmk = document.createElement('span'); rmk.textContent = opt.medRemark ? `“${opt.medRemark}”` : 'No remarks'
      ro.appendChild(rmk)
      if (words?.chip && opt.medDoc) { const t = document.createElement('div'); t.innerHTML = words.chip; const c = t.firstElementChild; c.querySelector('.docname').textContent = opt.medDoc; ro.appendChild(c) }
      li.appendChild(ro)
    }
    done.push(code + (box ? ' box ' + box.className : ' NO BOX'))
  }
  return done.join(' | ')
}, { who, day: opt.day || DAY, css: CSS + LISTCSS + SETC, words, opt })
/* wider letters (his iPhone's, about a seventh wider): does each card's row of actions still fit one line? */
export const widerActs = P => P.evaluate(() => {
  const s = document.querySelector('[data-testid="daylist-sheet"]') || document.querySelector('.bidsheet')
  /* per row of actions: how many lines its buttons take, and whether any button's words break inside it */
  const fit = () => [...s.querySelectorAll('.dl-acts')].map(a => {
    const bs = [...a.children]
    const lines = new Set(bs.map(b => Math.round(b.getBoundingClientRect().top))).size
    const broken = bs.filter(b => b.scrollWidth > b.clientWidth + 1 || b.getBoundingClientRect().height > 40).map(b => b.textContent.trim())
    return { lines, broken }
  })
  const a = fit(); s.style.letterSpacing = '0.9px'; const b = fit(); s.style.letterSpacing = ''
  return { normal: a, wider: b }
})
import { CSS, transform } from './lw-declutter-mock.mjs'

if (process.env.MODE !== 'probe') {
  const take = async (P, name) => { await P.waitForTimeout(250); await P.evaluate(() => document.querySelectorAll('.toast, .snack, .snackbar, [class*="toast"]').forEach(e => { if (!e.closest('.bidsheet')) e.style.display = 'none' })); const c = await sheetClip(P); console.log(name, 'h', Math.round(c.height - 8)); await P.screenshot({ path: path.join(OUT, name + '.png'), clip: c, scale: 'device' }) }
  const notes = {}
  /* A: an admin; the morning LL approved as he enters it (his switch on, the default) */
  /* B: an admin; the morning LL a pending bid (his switch off) */
  for (const [tag, pending] of [['a', false], ['b', true]]) {
    const w = await L.newCtx('phone'); const P = w.page
    await L.signInPlain(w, 'admin')
    await P.addStyleTag({ content: SETC })
    const who = await P.evaluate(() => Object.entries(window.PEOPLE || {}).find(([, v]) => v.cs === 'Drifter')?.[0])
    const words = await harvestWords(w, who, '2026-11-02')
    if (pending) {
      await L.openCellR(w, who, DAY)
      await L.press(w, L.T('bid-approve-tick')); await P.waitForTimeout(200)
      await L.press(w, L.T('portion-am')); await L.press(w, L.T('bid-LL')); await P.waitForTimeout(500); await L.closeAny(w)
      await P.evaluate(who => window.fileInput({ person: who, date: 'Nov 9', yr: 2026, type: 'ATT B', allday: false, half: 'pm', s: 721, e: 1439, remarks: 'Clinic review — no flying' }), who)
      await P.waitForTimeout(600)
    } else await setupDay(w)
    await L.cellShot(w, who, DAY, `twoday-${tag}-cell`)
    await L.openCellR(w, who, DAY)
    await take(P, `twoday-${tag}-today`)
    const base = { dayWord: '9 Nov', leaveDoc: !pending, medRemark: 'Clinic review — no flying', medDoc: 'MC-clinic.pdf' }
    console.log(tag, 'drawn:', await drawList(P, who, words, { ...base, acts: 'A' }))
    await take(P, `twoday-${tag}-drawn`)
    notes[tag] = await widerActs(P)
    await L.closeAny(w)
    /* the other way of D1329 (the approved leave), and — on the pending one — the man's own view: the same list without
       Approve and Refuse, which only an admin has (drawn from the admin's list; see C for why the member's tap shows none) */
    await L.openCellR(w, who, DAY)
    const v2 = pending ? { ...base, member: true } : { ...base, acts: 'B' }
    const name2 = pending ? 'twoday-own-drawn' : 'twoday-a-drawn-b'
    console.log(name2, await drawList(P, who, words, v2))
    await take(P, name2)
    notes[name2] = await widerActs(P)
    await L.closeAny(w)
    console.log('errors', JSON.stringify(w.errs))
    await w.ctx.close()
  }
  writeFileSync(path.join(OUT, 'twoday-geometry.json'), JSON.stringify(notes, null, 1))
  console.log(JSON.stringify(notes))
  await L.closeBrowser()
}

if (process.env.MODE === 'probe') {
  const w = await L.newCtx('phone'); const P = w.page
  await L.signInPlain(w, 'admin')
  await P.addStyleTag({ content: SETC })
  const who = await setupDay(w)
  console.log('cell', JSON.stringify(await cellBoxes(P, who), null, 1))
  await L.cellShot(w, who, DAY, 'twoday-cell-today')
  await L.openCellR(w, who, DAY)
  console.log('sheet', JSON.stringify(await L.sheetDump(P)))
  await P.screenshot({ path: path.join(OUT, 'twoday-today-pending.png'), clip: await sheetClip(P), scale: 'device' })
  await L.closeAny(w)
  console.log('errors', JSON.stringify(w.errs))
  await L.closeBrowser()
}
