// draw-q22 - question 22 on the one questions page (chat 205, 27 Nov 26). Real presses on yesterday's built app, then
// only the words that differ drawn in.
//   22A  Osprey (an admin of 149, made so by Saber) signs in, opens Kestrel's row on 149's Admin -> Users, sets Role to
//        Member, presses Save. The app REALLY refuses (Kestrel holds Plan of 151, made by "+ New squadron", and is its only
//        admin) with its amber note at the foot. today = that note as it is; A / B = the same real note, its words only
//        replaced (box, colour, place the app's own).
//          q22a-today-phone, q22a-A-phone, q22a-A-desktop, q22a-B-phone
//   22B  Hunter (142's admin, Plan of 149) picks 149, opens Merlin's row, opens "What each role allows". Drawn in (q13's
//        approved drawing, n199 draw-s2q-a putReason/openList): "Admin" greyed in the Role box's choices and the one grey
//        line under the Role box. today = the table and note 5 as built (the Role-box line NOT drawn); A / B = note 5's
//        words replaced. Rings: the small 5s in the table's Admin row, and note 5.
//          q22b-today-phone, q22b-A-phone, q22b-A-desktop, q22b-B-phone   (the phone ones a tall capture of the open row)
//   node raptor-port/scripts/handpass/n205/draw-q22.mjs   (ONLY=a-today,a-A,a-A-d,a-B,b-today,b-A,b-A-d,b-B ; FRESH=1)
import { run, FACT, wait, signIn, pick, usersTab, openRow, box, shot, tring, linesOf, holdNote, want, closeAll, hit, okDialogs, rowText, barSq, ERRS } from './q22-lib.mjs'
import { W22 } from './words-q22.mjs'

const ROW = '.acc-row.od-row-on'
const topOf = s => s.page.evaluate(sel => { document.querySelector(sel).scrollIntoView({ block: 'start' }) }, ROW)
/* bring the open row's head just under the top bar (whose foot is measured, not guessed) */
async function rowUnderBar(s, gap = 10) {
  await topOf(s); await wait(s, 150)
  await s.page.evaluate(([sel, gap]) => { const bar = [...document.querySelectorAll('.topbar')].find(e => e.getBoundingClientRect().height > 0); const foot = bar ? bar.getBoundingClientRect().bottom : 60; const r = document.querySelector(sel).getBoundingClientRect(); scrollBy(0, r.top - foot - gap) }, [ROW, gap])
  await wait(s, 250)
}
/* a neutral tap so no control is left hovered / focused (mockups trap) */
async function neutral(s) {
  await s.page.evaluate(() => document.activeElement?.blur())
  if (s.desk) await s.page.mouse.move(1, 1).catch(() => {})
}

/* ---------------- 22A ---------------- */
async function a22(s, k, words) {
  await signIn(s, 'osprey'); await usersTab(s); await wait(s, 400)
  FACT(`${k}.bar`, await barSq(s))
  const before = { kestrel: await rowText(s, 'kes9'), osprey: await rowText(s, 'osp9') }; FACT(`${k}.before`, before)
  await openRow(s, 'kes9')
  await s.page.selectOption('#accEdRole', 'main'); await wait(s, 300)
  await s.page.locator('#accEdSave').click(); await wait(s, 500)
  const dlg = await s.page.evaluate(() => [...document.querySelectorAll('#dlgOk')].filter(e => e.getBoundingClientRect().width > 0).length)
  FACT(`${k}.dialogOpen`, dlg)
  const real = await holdNote(s, null); FACT(`${k}.realNote`, real)
  if (!real || !/last admin/.test(real.words)) throw new Error('the app did not refuse with a last-admin note: ' + JSON.stringify(real))
  FACT(`${k}.after`, { kestrel: await rowText(s, 'kes9'), roleBox: await s.page.evaluate(() => document.querySelector('#accEdRole')?.value) })
  const kesWhole = await s.page.evaluate(() => document.querySelector('#page-admin .acc-row[data-person="kes9"]')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 140))
  FACT(`${k}.kestrelWholeRow`, kesWhole)
  if (!/\bAdmin\b|ADMIN/.test(kesWhole.split('SIGN-IN')[0])) throw new Error('Kestrel no longer reads Admin')
  await rowUnderBar(s, 1); await neutral(s)
  const n = await holdNote(s, words); FACT(`${k}.note`, n)
  FACT(`${k}.noteLines`, await linesOf(s, '#toastEl'))
  /* nothing in view names a second admin of 151 */
  FACT(`${k}.mentions151`, await s.page.evaluate(() => [...document.querySelectorAll('#page-admin .acc-row')].filter(e => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && /151/.test(e.innerText) }).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 120))))
  await tring(s, n.box)
  return n
}
for (const [key, k, sz, words] of [['a-today', 'q22a-today-phone', 'p', null], ['a-A', 'q22a-A-phone', 'p', W22.lastA], ['a-B', 'q22a-B-phone', 'p', W22.lastB], ['a-A-d', 'q22a-A-desktop', 'd', W22.lastA]]) {
  if (!want(key)) continue
  await run(k, sz, async s => {
    const n = await a22(s, k, words)
    if (sz === 'p') { await shot(s, k); return }
    /* desktop: the Users panel, from the top of the screen (the bar naming the squadron) to below the note */
    const p = await box(s, '#page-admin')
    const x = Math.max(0, Math.min(p.x, n.box.x) - 16), r = Math.min(s.W, Math.max(p.x + p.w, n.box.x + n.box.w) + 16)
    await shot(s, k, { x, y: 0, width: r - x, height: Math.min(s.H, n.box.y + n.box.h + 22) })
  })
}

/* ---------------- 22B ---------------- */
/* q13's approved drawing (n199 draw-s2q-a putReason + openList(false)), copied: "Admin" greyed in the box's choices (the
   box shown closed, reading Member), and the grey line hanging under the Role box in the class the greyed Plan's reason
   wears; the two fields lined up at their head so the Sign-in box does not drop */
const putReason = (s, text) => s.page.evaluate(text => {
  const sel = document.querySelector('#accEdRole'); sel.options[1].disabled = true
  let p = document.querySelector('#q22note')
  if (!p) { p = document.createElement('p'); p.className = 'adm-note acc-sq-note'; p.id = 'q22note'; sel.after(p) }
  p.textContent = text; p.style.margin = '6px 0 0'
  const fld = sel.closest('.mfield'), pair = fld.parentElement; pair.style.alignItems = 'start'
  const [a, b] = [...pair.querySelectorAll(':scope > .mfield')]
  const real = document.querySelector('.acc-sq-note:not(#q22note)')
  return { options: [...sel.options].map(o => o.textContent + (o.disabled ? ' [greyed]' : '')), fontSize: getComputedStyle(p).fontSize, color: getComputedStyle(p).color, realNoteLook: real ? { fontSize: getComputedStyle(real).fontSize, color: getComputedStyle(real).color } : null,
    level: a && b ? { labelTops: [a, b].map(m => Math.round(m.querySelector('label').getBoundingClientRect().top)), boxTops: [a, b].map(m => Math.round(m.querySelector('input,select').getBoundingClientRect().top)) } : null }
}, text)
const note5 = (s, words) => s.page.evaluate(words => {
  const li = document.querySelector(`.acc-row.od-row-on [data-testid="acc-roles"] .acc-rt-notes li:nth-child(5)`)
  if (!li) return null
  if (words != null) li.textContent = words
  return li.innerText.replace(/\s+/g, ' ').trim()
}, words)
/* the small 5s: every <sup>5</sup> in the table's Admin row */
const fives = s => s.page.evaluate(() => {
  const rows = [...document.querySelectorAll('.acc-row.od-row-on [data-testid="acc-roles"] tbody tr')]
  const out = []
  /* each ring takes the tick and its 5 together (the letters' own extent, not the cell), so it crosses no glyph */
  for (const tr of rows) for (const sup of tr.querySelectorAll('sup')) if (sup.textContent.trim() === '5') {
    const td = sup.closest('td'), rg = document.createRange(); rg.selectNodeContents(td); const r = rg.getBoundingClientRect()
    out.push({ row: tr.querySelector('th')?.textContent.trim(), col: td.dataset.role, cell: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } }) }
  return out
})
async function b22(s, k, words, drawRole) {
  await signIn(s, 'hunter'); FACT(`${k}.bar`, await pick(s, 149)); await usersTab(s); await wait(s, 400)
  await openRow(s, 'mer9')
  FACT(`${k}.row`, await s.page.evaluate(sel => document.querySelector(sel + ' .acc-main')?.innerText.replace(/\s+/g, ' ').trim(), ROW))
  const sum = s.page.locator(`${ROW} [data-testid="acc-roles"] summary`).first()
  await sum.scrollIntoViewIfNeeded(); if (s.desk) await sum.click(); else await sum.tap()
  await wait(s, 400)
  FACT(`${k}.foldOpen`, await s.page.evaluate(sel => document.querySelector(sel + ' [data-testid="acc-roles"]')?.open, ROW))
  FACT(`${k}.note5Today`, await note5(s, null))
  FACT(`${k}.notesToday`, await s.page.evaluate(sel => [...document.querySelectorAll(sel + ' .acc-rt-notes li')].map(e => e.textContent), ROW))
  if (drawRole) FACT(`${k}.reason`, await putReason(s, W22.roleReason('149')))
  if (words != null) FACT(`${k}.note5`, await note5(s, words))
  FACT(`${k}.note5Lines`, await linesOf(s, `${ROW} .acc-rt-notes li:nth-child(5)`))
  if (drawRole) FACT(`${k}.reasonLines`, await linesOf(s, '#q22note'))
  await rowUnderBar(s, 1); await neutral(s)
  FACT(`${k}.rowTopVsBar`, await s.page.evaluate(sel => { const bar = [...document.querySelectorAll('.topbar')].find(e => e.getBoundingClientRect().height > 0); return { barFoot: Math.round(bar.getBoundingClientRect().bottom), rowTop: Math.round(document.querySelector(sel).getBoundingClientRect().top) } }, ROW))
  const f = await fives(s); FACT(`${k}.fives`, f)
  for (const q of f) await tring(s, q.cell, 2)
  /* note 5 with its own "5." marker (drawn left of the item's box). The notes stand close, so the ring's top and bottom
     lines sit ON the edges of the letters' own boxes (inside the line's spacing: clear of note 4's descenders above and
     of note 5's capitals), and 4px clear at the sides, past the longest line's last letter */
  const n5 = await s.page.evaluate(sel => {
    const li = document.querySelector(sel), r = li.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(li)
    const t = rg.getBoundingClientRect(), mk = parseFloat(getComputedStyle(li).fontSize) * 1.3
    const L = Math.min(r.left - mk, t.left), R = Math.max(r.right, t.right)
    return { x: Math.round(L), y: Math.round(t.top), w: Math.round(R - L), h: Math.round(t.height) }
  }, `${ROW} .acc-rt-notes li:nth-child(5)`)
  await s.page.evaluate(([b, c]) => { const d = document.createElement('div'); d.className = '__q22ring'; Object.assign(d.style, { position: 'fixed', boxSizing: 'border-box', left: (b.x - 6) + 'px', top: (b.y - 2) + 'px', width: (b.w + 12) + 'px', height: (b.h + 4) + 'px', border: '2px dashed ' + c, borderRadius: '8px', zIndex: 2147483646, pointerEvents: 'none' }); document.body.appendChild(d) }, [n5, '#0D9488'])
  const rowB = await box(s, ROW)
  FACT(`${k}.rowBox`, rowB); FACT(`${k}.note5Box`, n5)
  return { rowB, n5 }
}
/* the phone: a tall screen (the same phone width, a taller window), so the open row from its head to its Save buttons
   is one real capture - never stitched */
for (const [key, k, sz, words, role] of [['b-today', 'q22b-today-phone', 'p', null, false], ['b-A', 'q22b-A-phone', 'p', W22.note5A, true], ['b-B', 'q22b-B-phone', 'p', W22.note5B, true], ['b-A-d', 'q22b-A-desktop', 'd', W22.note5A, true]]) {
  if (!want(key)) continue
  await run(k, sz, async s => {
    const { rowB } = await b22(s, k, words, role)
    if (rowB.y + rowB.h + 4 > s.H) throw new Error(`the open row runs past the screen (${rowB.y + rowB.h} > ${s.H}): raise the window`)
    if (sz === 'p') { await shot(s, k, { x: 0, y: 0, width: s.W, height: rowB.y + rowB.h + 4 }); return }
    const p = await box(s, '#page-admin')
    const x = Math.max(0, p.x - 16), r = Math.min(s.W, p.x + p.w + 16)
    await shot(s, k, { x, y: 0, width: r - x, height: rowB.y + rowB.h + 4 })
  }, { h: sz === 'p' ? (role ? 1090 : 1010) : 1000 })
}
FACT('errors', ERRS); await closeAll()
