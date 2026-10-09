// Walker C, script 1 — scenarios 32, 33, 36, 37, 38, 39 and the Saber halves of 35 (desktop 1440, Saber)
import * as L from './ivet-C-lib.mjs'
const T = false
const { ctx, page } = await L.open(L.DESK, 'ad', 'a', false, { fresh: false })
const id = cs => L.csId(page, cs)
const G = [
  { n: 2, ppl: ['Wisp', 'Ace'], date: '2026-07-20' },
  { n: 4, ppl: ['Zulu', 'Blade', 'Hex', 'Cinch'], date: '2026-07-21' },
  { n: 9, ppl: ['Vapor', 'Ranger', 'Echo', 'Drifter', 'Kraken', 'Basher', 'Static', 'Ghost', 'Anvil'], date: '2026-07-24' },
  { n: 14, ppl: ['Widget', 'Otter', 'Marlin', 'Nomad', 'Torch', 'Piston', 'Reaper', 'Ridge', 'Trident', 'Vandal', 'Comet', 'Cobra', 'Bolt', 'Forge'], date: '2026-07-27' },
]
await L.toList(page, T)
const made32 = {}
/* a measuring function run in the page for a group's desktop row */
const trOf = iid => page.evaluate(iid => { const want = window.INPUTS.find(r => r.iid === iid); const tr = [...document.querySelectorAll('#inBody tr[data-iid]')].find(t => { const r = window.INPUTS.find(x => x.iid === t.getAttribute('data-iid')); return r && (r.iid === iid || (want.grp && r.grp === want.grp)) }); return tr ? tr.getAttribute('data-iid') : null }, iid)
const measure = (iid) => page.evaluate(iid => {
  const want = window.INPUTS.find(r => r.iid === iid)
  const tr = [...document.querySelectorAll('#inBody tr[data-iid]')].find(t => { const r = window.INPUTS.find(x => x.iid === t.getAttribute('data-iid')); return r && want.grp && r.grp === want.grp })
  if (!tr) return null
  const name = tr.querySelector('[data-label="Name"]'), btn = name.querySelector('.in-open, [data-testid="in-open"]')
  const nr = name.getBoundingClientRect()
  const rg = document.createRange(); rg.selectNodeContents(btn)
  const rects = [...rg.getClientRects()]
  const inCol = rects.every(r => r.left >= nr.left - 0.5 && r.right <= nr.right + 0.5)
  const nextCell = tr.querySelectorAll('td')[1]
  const nxt = nextCell.getBoundingClientRect()
  const rowR = tr.getBoundingClientRect()
  const lines = new Set(rects.map(r => Math.round(r.top))).size
  const others = [...tr.querySelectorAll('td')].filter(td => td !== name).map(td => td.getBoundingClientRect())
  const overlapOther = rects.some(r => others.some(o => r.right > o.left + 0.5 && r.left < o.right - 0.5 && r.bottom > o.top + 0.5 && r.top < o.bottom - 0.5))
  const insideRow = rects.every(r => r.top >= rowR.top - 0.5 && r.bottom <= rowR.bottom + 0.5)
  const pill = tr.querySelector('.intag')
  return { names: btn.textContent, nameW: Math.round(nr.width), inCol, lines, overlapOther, insideRow, rowH: Math.round(rowR.height), pill: pill ? pill.textContent : null, by: tr.querySelector('.in-placed')?.textContent || '', pageWide: document.documentElement.scrollWidth <= innerWidth }
}, iid)

await L.step('32', 'desktop', 'Saber', async () => {
  for (const g of G) {
    const r = await L.fileInput(page, { type: 'Meeting', people: g.ppl, from: g.date, title: `C32 g${g.n}`, rmk: `C32 g${g.n}` }, T)
    made32[g.n] = r
  }
  /* ordinary one-person inputs, for 33 */
  for (const cs of ['Ace', 'Zulu']) await L.fileInput(page, { type: 'Meeting', person: cs, from: '2026-07-28', title: `C32 solo ${cs}`, rmk: `C32 solo ${cs}` }, T)
  await page.fill('#inFSearch', 'C32'); await page.waitForTimeout(300)
  const res = {}
  for (const g of G) res[g.n] = made32[g.n][0] ? await measure(made32[g.n][0].iid) : null
  const shotAll = await L.shot(page, '32-desk-groups')
  // a close crop of each row
  const crops = []
  for (const g of G) { const el = page.locator(`#inBody tr[data-iid="${await trOf(made32[g.n][0].iid)}"]`); await el.scrollIntoViewIfNeeded(); await el.screenshot({ path: `${L.OUT}/32-desk-row-g${g.n}.png` }); crops.push(`32-desk-row-g${g.n}.png`) }
  const problems = []
  let prevH = 0
  for (const g of G) {
    const m = res[g.n]
    if (!m) { problems.push(`g${g.n}: row not found`); continue }
    const names = m.names.split(', ')
    const expect = [...g.ppl].sort((a, b) => a.localeCompare(b))
    if (names.length !== g.n) problems.push(`g${g.n}: ${names.length} names shown (${m.names})`)
    if (names.join('|') !== expect.join('|')) problems.push(`g${g.n}: not A–Z or wrong people: ${m.names}`)
    if (/\+\d/.test(m.names)) problems.push(`g${g.n}: a +N shortcut: ${m.names}`)
    if (m.nameW !== 250) problems.push(`g${g.n}: name column ${m.nameW}px`)
    if (!m.inCol) problems.push(`g${g.n}: names run outside the column`)
    if (m.overlapOther) problems.push(`g${g.n}: names overlap a neighbouring column`)
    if (!m.insideRow) problems.push(`g${g.n}: names run outside the row`)
    if (m.pill !== 'Meeting') problems.push(`g${g.n}: pill reads ${m.pill}`)
    if (!m.pageWide) problems.push(`g${g.n}: page wider than the screen`)
    if (m.rowH < prevH) problems.push(`g${g.n}: row (${m.rowH}) shorter than the smaller group's (${prevH})`)
    prevH = m.rowH
  }
  if (!(res[14].rowH > res[2].rowH)) problems.push('taller groups did not make taller rows')
  L.rec('32', 'desktop', 'Saber', problems.length ? 'FAIL' : 'PASS', problems.length ? problems.join('; ') : `groups of 2/4/9/14 each show every name once A–Z in a ${res[2].nameW}px column; row heights ${G.map(g => res[g.n].rowH).join('/')}px, ${G.map(g => res[g.n].lines).join('/')} lines; Meeting pill kept; no overlap`, [shotAll, ...crops])
})

await L.step('33', 'desktop', 'Saber', async () => {
  const firstNames = () => page.evaluate(() => [...document.querySelectorAll('#inBody tr [data-label="Name"]')].map(x => x.textContent.split(', ')[0]))
  const allNames = () => page.evaluate(() => [...document.querySelectorAll('#inBody tr [data-label="Name"]')].map(x => x.textContent))
  await page.fill('#inFSearch', 'C32'); await page.waitForTimeout(250)
  const before = await allNames()
  await page.locator('#intbl thead th[data-sort="name"]').click(); await page.waitForTimeout(250)
  const asc = await firstNames(); const ascAll = await allNames(); const p1 = await L.shot(page, '33-desk-sorted-asc')
  await page.locator('#intbl thead th[data-sort="name"]').click(); await page.waitForTimeout(250)
  const desc = await firstNames(); const descAll = await allNames(); const p2 = await L.shot(page, '33-desk-sorted-desc')
  const ordered = (a, dir) => a.every((v, i) => !i || (dir * a[i - 1].localeCompare(v)) <= 0)
  const sameSet = (a, b) => [...a].sort().join('#') === [...b].sort().join('#')
  const problems = []
  if (!ordered(asc, 1)) problems.push('ascending order wrong: ' + asc.join(','))
  if (!ordered(desc, -1)) problems.push('descending order wrong: ' + desc.join(','))
  if (!sameSet(before, ascAll) || !sameSet(before, descAll)) problems.push(`rows changed by sorting (${before.length} → ${ascAll.length}/${descAll.length})`)
  if (new Set(descAll).size !== descAll.length) problems.push('duplicate entry after sorting')
  const inGroup = descAll.filter(n => n.includes(',')).every(n => { const p = n.split(', '); return p.every((v, i) => !i || p[i - 1].localeCompare(v) <= 0) })
  if (!inGroup) problems.push('names inside a group not A–Z')
  // keyboard: focus the 4-group's name button and press Enter
  const iid4 = made32[4][0].iid
  await page.locator(`#inBody tr[data-iid="${await trOf(iid4)}"] [data-testid="in-open"]`).focus()
  await page.keyboard.press('Enter'); await page.waitForTimeout(400)
  const opened = await page.locator(L.WIN).count()
  const info = opened ? await page.evaluate(() => ({ title: document.querySelector('[data-testid="win-inputedit"] .win-ttl')?.textContent, pressed: [...document.querySelectorAll('[data-testid="win-inputedit"] [data-pp][aria-pressed="true"]')].map(b => window.PEOPLE[b.getAttribute('data-pp')]?.cs).sort() })) : null
  const p3 = await L.shot(page, '33-desk-keyboard-open')
  if (opened) await page.locator('#inpEditCancel').click()
  const want = [...G[1].ppl].sort()
  if (!opened) problems.push('Enter on the name did not open the input')
  else if (info.pressed.join() !== want.join()) problems.push('opened window holds ' + info.pressed.join() + ' not ' + want.join())
  L.rec('33', 'desktop', 'Saber', problems.length ? 'FAIL' : 'PASS', problems.length ? problems.join('; ') : `${before.length} rows; Name ▲ then ▼ order by each entry's first name (asc: ${asc.join('/')}; desc: ${desc.join('/')}); no row lost or doubled; Enter on a focused group name opened it with its ${info.pressed.length} people; title "${info.title}"`, [p1, p2, p3])
  await page.locator('#intbl thead th[data-sort="start"]').click()
  await page.fill('#inFSearch', '')
})

/* ---- 35 (Saber's half) and 36 ---- */
let m35 = {}
await L.step('35a', 'desktop', 'Saber', async () => {
  const self = await L.fileInput(page, { type: 'Meeting', person: 'Saber', from: '2026-07-29', title: 'C35 self', rmk: 'C35 self' }, T)
  const forR = await L.fileInput(page, { type: 'Meeting', person: 'Ranger', from: '2026-07-30', title: 'C35 for Ranger', rmk: 'C35 for Ranger' }, T)
  m35 = { self: self[0], forR: forR[0] }
  await page.fill('#inFSearch', 'C35'); await page.waitForTimeout(250)
  const a = await L.deskRow(page, self[0].iid), b = await L.deskRow(page, forR[0].iid)
  const pic = await L.shot(page, '35-desk-saber-reads')
  await page.locator(`#inBody tr[data-iid="${await trOf(forR[0].iid)}"] [data-testid="in-open"]`).click(); await page.locator(L.WIN).waitFor()
  const stamp = await page.locator('[data-testid="inped-placed"]').textContent()
  const pic2 = await L.shot(page, '35-desk-saber-window-stamp')
  await page.locator('#inpEditCancel').click()
  await page.fill('#inFSearch', '')
  console.log('35a', JSON.stringify({ a: a.by, b: b.by, stamp }))
  m35.saber = { selfBy: a.by, otherBy: b.by, stamp, pics: [pic, pic2] }
})

await L.step('36', 'desktop', 'Saber', async () => {
  const incl = await L.fileInput(page, { type: 'Meeting', people: ['Saber', 'Ace'], from: '2026-07-31', title: 'C36 incl', rmk: 'C36 incl filer' }, T)
  const excl = await L.fileInput(page, { type: 'Meeting', people: ['Ace', 'Blade'], from: '2026-07-31', title: 'C36 excl', rmk: 'C36 excl filer' }, T)
  await page.fill('#inFSearch', 'C36'); await page.waitForTimeout(250)
  const inline = iid => page.evaluate(iid => {
    const want = window.INPUTS.find(r => r.iid === iid)
    const tr = [...document.querySelectorAll('#inBody tr[data-iid]')].find(t => { const r = window.INPUTS.find(x => x.iid === t.getAttribute('data-iid')); return r && want.grp && r.grp === want.grp })
    const rmk = tr.querySelector('[data-label="Remarks"]'), by = rmk.querySelector('.in-placed')
    const textNode = [...rmk.childNodes].find(x => x.nodeType === 3 && x.textContent.trim())
    const rg = document.createRange(); rg.selectNodeContents(textNode)
    return { by: by?.textContent || '', sameLine: by ? Math.abs(by.getBoundingClientRect().top - rg.getBoundingClientRect().top) <= 6 : null, names: tr.querySelector('[data-label="Name"]').textContent, rmkText: rmk.innerText.replace(/\s+/g, ' ') }
  }, iid)
  const a = await inline(incl[0].iid), b = await inline(excl[0].iid)
  const pic = await L.shot(page, '36-desk-by-on-groups')
  await page.fill('#inFSearch', '')
  const ok = a.by === 'By Saber' && b.by === 'By Saber' && a.sameLine && b.sameLine && incl.length === 2 && excl.length === 2 && /Saber/.test(a.names) && !/Saber/.test(b.names)
  L.rec('36', 'desktop', 'Saber', ok ? 'PASS' : 'FAIL', `group incl. filer (${a.names}): "${a.by}" same line as remark=${a.sameLine}; group excl. filer (${b.names}): "${b.by}" same line=${b.sameLine}; remark cells "${a.rmkText}" / "${b.rmkText}"`, [pic])
})

await L.step('37', 'desktop', 'Saber', async () => {
  const optLabels = await page.evaluate(() => { document.querySelector('#inNew').click(); return null })
  await page.locator(L.WIN).waitFor()
  const opts = await page.evaluate(() => [...document.querySelectorAll('#inpEditPerson option')].map(o => o.value + '=' + o.textContent).filter(x => /all/i.test(x)))
  await page.locator('#inpEditCancel').click()
  const mk = async (type, person, date, rmk) => {
    const had = await L.ids(page)
    await L.plus(page, T)
    await page.selectOption('#inpEditType', type); await page.selectOption('#inpEditPerson', person)
    await L.pick(page, date, T); await page.fill('#inpEditRmk', rmk)
    await page.locator('#inpEditSave').click(); await page.waitForTimeout(350)
    for (let k = 0; k < 3; k++) { if (await page.locator('[data-testid="oilconf"]').count()) await L.answerOil(page, T, 'no'); else if (await page.locator('[data-testid="docconf"]').count()) await page.locator('[data-testid="docconf-nodoc"]').click(); else break; await page.waitForTimeout(300) }
    await page.locator(L.WIN).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(300)
    return L.newest(page, had)
  }
  const av = await mk('Duty', 'allavail', '2026-08-03', 'C37 allavail')
  const al = await mk('Event', 'all', '2026-08-04', 'C37 all')
  await page.fill('#inFSearch', 'C37'); await page.waitForTimeout(250)
  const ra = av[0] && await L.deskRow(page, av[0].iid), rl = al[0] && await L.deskRow(page, al[0].iid)
  const pic = await L.shot(page, '37-desk-placeholders')
  // missing filer: any record in the demo with no filer?
  await page.fill('#inFSearch', ''); await page.waitForTimeout(250)
  const nof = await page.evaluate(() => window.INPUTS.filter(r => !r.by).length)
  const nofRows = await page.evaluate(() => { const bad = window.INPUTS.filter(r => !r.by); const out = []; for (const r of bad.slice(0, 40)) { const tr = [...document.querySelectorAll('#inBody tr[data-iid]')].find(t => t.getAttribute('data-iid') === r.iid); if (tr) out.push({ type: r.type, person: window.PEOPLE[r.person]?.cs || r.person, text: tr.querySelector('[data-label="Remarks"]').innerText.replace(/s+/g, ' '), by: tr.querySelector('.in-placed')?.textContent || '', undef: /undefined|null/.test(tr.textContent) }) } return out })
  const ph = await page.evaluate(() => { const out = []; for (const r of window.INPUTS.filter(r => r.person === 'all' || r.person === 'allavail')) { const tr = [...document.querySelectorAll('#inBody tr[data-iid]')].find(t => t.getAttribute('data-iid') === r.iid); if (tr) out.push({ person: r.person, filer: window.PEOPLE[r.by]?.cs || r.by || '(none)', by: tr.querySelector('.in-placed')?.textContent || '', rmk: tr.querySelector('[data-label="Remarks"]').innerText.replace(/s+/g, ' ') }) } return out })
  const ex = nofRows.find(r => /Upchit|Downchit|OML|ATT|LL|OL/.test(r.type)) || nofRows[0]
  if (ex) { await page.locator('#inFSearch').fill(''); }
  const picNof = await L.shot(page, '37-desk-placeholders-and-unfiled')
  await page.fill('#inFSearch', '')
  const okA = ra && ra.by === 'By Saber' && rl && rl.by === 'By Saber' && !/By ALL/.test(ra.by + rl.by) && nofRows.every(r => !r.by && !r.undef) && ph.every(r => !/By ALL/.test(r.by))
  m37 = { av, al }
  L.rec('37', 'desktop', 'Saber', okA ? 'PASS' : 'FAIL', `ALL AVAIL input made=${av.length} (person ${av[0]?.person}) row "${ra?.name}" by "${ra?.by}"; ALL input made=${al.length} row "${rl?.name}" by "${rl?.by}". Missing-filer subcase: ${nof} demo records have no filer; of the ${nofRows.length} shown in the table, any with a By label: ${nofRows.filter(r => r.by).length}, any with undefined/null text: ${nofRows.filter(r => r.undef).length}; examples ${JSON.stringify(nofRows.slice(0, 2))}. Demo placeholders: ${JSON.stringify(ph)}. Person options seen: ${opts.join(' ; ')}`, [pic, picNof])
})
var m37

await L.step('38', 'desktop', 'Saber', async () => {
  const LONG = 'C38 Supercalifragilisticexpialidocious' + 'X'.repeat(70) + ' and then a normal sentence continues here to wrap across several lines of the remarks column to check the table holds'
  // (i) other person, empty remark, a date well ahead (not late)
  const e1 = await L.fileInput(page, { type: 'Meeting', person: 'Ace', from: '2026-11-04', title: 'C38 norem', beforeSave: async () => { await page.fill('#inpEditRmk', '') } }, T)
  // (ii) an input filed now for a date already inside the cut-off: LATE, no remark
  const e2 = await L.fileInput(page, { type: 'Meeting', person: 'Blade', from: '2026-10-12', title: 'C38 late', beforeSave: async () => { await page.fill('#inpEditRmk', '') } }, T)
  // (iii) a long remark with a long unbroken word, ahead
  const e3 = await L.fileInput(page, { type: 'Meeting', person: 'Cinch', from: '2026-11-05', title: 'C38 long', rmk: LONG }, T)
  // (iv) a short remark and By together
  const e4 = await L.fileInput(page, { type: 'Meeting', person: 'Echo', from: '2026-11-06', title: 'C38 short', rmk: 'C38 short remark' }, T)
  // (v) LATE with a short remark
  const e5 = await L.fileInput(page, { type: 'Meeting', person: 'Havoc', from: '2026-10-13', title: 'C38 late2', rmk: 'C38 late short' }, T)
  await page.fill('#inFSearch', 'C38'); await page.waitForTimeout(300)
  const info = iid => page.evaluate(iid => {
    const tr = document.querySelector(`#inBody tr[data-iid="${iid}"]`); if (!tr) return null
    const rmk = tr.querySelector('[data-label="Remarks"]'); const rr = rmk.getBoundingClientRect()
    const kids = [...rmk.querySelectorAll('*')].map(k => ({ cls: k.className, tag: k.tagName, text: k.textContent.slice(0, 40), r: (() => { const b = k.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)] })() }))
    const rg = document.createRange(); rg.selectNodeContents(rmk)
    const rects = [...rg.getClientRects()]
    const outside = rects.some(r => r.right > rr.right + 0.5)
    const next = tr.querySelectorAll('td')[[...tr.querySelectorAll('td')].indexOf(rmk) + 1]
    const nr = next ? next.getBoundingClientRect() : null
    const overlapNext = nr ? rects.some(r => r.right > nr.left + 0.5 && r.left < nr.right) && rects.some(r => r.bottom > nr.top && r.top < nr.bottom) : false
    return { text: rmk.innerText.replace(/\n+/g, ' / '), html: rmk.innerHTML.slice(0, 500), w: Math.round(rr.width), h: Math.round(tr.getBoundingClientRect().height), outside, overlapNext, scrollW: rmk.scrollWidth, clientW: rmk.clientWidth, kids }
  }, iid)
  const out = {}
  for (const [k, e] of Object.entries({ e1, e2, e3, e4, e5 })) out[k] = e[0] ? await info(e[0].iid) : null
  const pageWide = await L.wideOK(page)
  const stampRows = await page.evaluate(() => [...document.querySelectorAll('#inBody tr')].filter(t => /Placed by/.test(t.textContent)).length)
  const pic = await L.shot(page, '38-desk-remarks')
  const crops = []
  for (const [k, e] of Object.entries({ e1, e2, e3, e4, e5 })) { const el = page.locator(`#inBody tr[data-iid="${e[0].iid}"]`); await el.screenshot({ path: `${L.OUT}/38-desk-row-${k}.png` }); crops.push(`38-desk-row-${k}.png`) }
  await page.fill('#inFSearch', '')
  console.log(JSON.stringify(out, null, 1))
  const problems = []
  const t = k => out[k]?.text || ''
  if (!/^By Saber$/.test(t('e1').trim())) problems.push(`no-remark row reads "${t('e1')}"`)
  if (!/LATE/.test(t('e2')) || !/By Saber/.test(t('e2'))) problems.push(`late/no-remark row reads "${t('e2')}"`)
  if (!/LATE/.test(t('e5'))) problems.push(`late row with remark reads "${t('e5')}"`)
  for (const k of ['e3']) if (out[k].outside || out[k].overlapNext || out[k].scrollW > out[k].clientW + 1) problems.push(`long remark ${k}: outside=${out[k].outside} overlapNext=${out[k].overlapNext} scrollW=${out[k].scrollW}>${out[k].clientW}`)
  if (!pageWide) problems.push('page widened')
  if (stampRows) problems.push(`${stampRows} rows show a "Placed by" full stamp`)
  console.log('38 text', JSON.stringify({ e1: t('e1'), e2: t('e2'), e3: t('e3').slice(0, 120), e4: t('e4'), e5: t('e5') }))
  L.rec('38', 'desktop', 'Saber', problems.length ? 'FAIL' : 'PROVISIONAL', problems.length ? problems.join('; ') : `no-remark: "${t('e1')}"; LATE alone: "${t('e2')}"; short: "${t('e4')}"; late+short: "${t('e5')}"; long cell ${out.e3.w}px wide, row ${out.e3.h}px tall, text inside cell; page not wider. (look at the pictures to decide)`, [pic, ...crops])
})

await L.step('39', 'desktop', 'Saber', async () => {
  const ev = await L.fileInput(page, { type: 'Event', person: 'Ace', from: '2026-11-09', title: 'C39 Titled event', rmk: 'C39 event' }, T)
  const ot = await L.fileInput(page, { type: 'Other', person: 'Ace', from: '2026-11-10', title: 'C39 Titled other', rmk: 'C39 other' }, T)
  const ll = await L.fileInput(page, { type: 'LL', person: 'Saber', from: '2026-11-12', rmk: 'C39 leave' }, T)
  await page.fill('#inFSearch', ''); await page.waitForTimeout(150)
  const rows = await page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].map(tr => { const tg = tr.querySelector('.intag'); const type = tr.querySelector('[data-label="Type"]'); return { pill: tg ? tg.textContent : null, pillCount: tr.querySelectorAll('.intag').length, typeCell: type?.textContent.replace(/\s+/g, ' ').trim(), titleIn: tr.querySelector('.intitle')?.textContent || null, name: tr.querySelector('[data-label="Name"]').textContent.slice(0, 40), cls: tg?.className } }))
  const noPill = rows.filter(r => r.pillCount !== 1)
  const kinds = [...new Set(rows.map(r => r.pill))]
  const sans = rows.filter(r => /SANS/i.test(r.typeCell || '')).length
  // clicks on Changed
  const head = await page.locator('#intbl thead th[data-sort="mod"]').textContent()
  const mods = () => page.evaluate(() => [...document.querySelectorAll('#inBody tr td:nth-child(6)')].map(x => x.textContent.trim()))
  const attr = () => page.locator('#intbl thead th[data-sort="mod"]').evaluate(e => ({ aria: e.getAttribute('aria-sort'), text: e.textContent }))
  await page.locator('#intbl thead th[data-sort="mod"]').click(); await page.waitForTimeout(250); const m1 = await mods(); const a1 = await attr(); const p1 = await L.shot(page, '39-desk-changed-1')
  await page.locator('#intbl thead th[data-sort="mod"]').click(); await page.waitForTimeout(250); const m2 = await mods(); const a2 = await attr(); const p2 = await L.shot(page, '39-desk-changed-2')
  // the titled event / other rows
  await page.fill('#inFSearch', 'C39'); await page.waitForTimeout(250)
  const pic = await L.shot(page, '39-desk-pills')
  const titled = await page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].map(tr => ({ pill: tr.querySelector('.intag')?.textContent, pillCount: tr.querySelectorAll('.intag').length, name: tr.querySelector('[data-label="Name"]').innerText.replace(/\s+/g, ' '), type: tr.querySelector('[data-label="Type"]').innerText.replace(/\s+/g, ' ') })))
  await page.fill('#inFSearch', '')
  const dirChanged = JSON.stringify(m1) !== JSON.stringify(m2) && JSON.stringify(m1) === JSON.stringify([...m2].reverse()) || (a1.aria !== a2.aria)
  const problems = []
  if (noPill.length) problems.push(`${noPill.length} row(s) without exactly one pill`)
  if (head.replace(/[▲▼]/g, '').trim() !== 'Changed') problems.push('heading reads ' + head)
  if (!dirChanged) problems.push(`Changed sort did not change direction (aria ${a1.aria}/${a2.aria})`)
  if (sans) problems.push('SANS rows in the list: ' + sans)
  if (titled.some(t => t.pillCount !== 1 || !t.pill)) problems.push('titled rows lost a pill')
  L.rec('39', 'desktop', 'Saber', problems.length ? 'FAIL' : 'PASS', problems.length ? problems.join('; ') : `${rows.length} rows each with ONE pill (kinds seen: ${kinds.join(', ')}); titled rows: ${JSON.stringify(titled)}; Changed heading "${head.trim()}", click1 aria=${a1.aria} click2 aria=${a2.aria}, first Changed values ${m1.slice(0, 2).join(' | ')} then ${m2.slice(0, 2).join(' | ')}; no SANS rows`, [pic, p1, p2])
})

await L.saveState(ctx, 'desk-saber')
const keep = { m35, m37 };
(await import('node:fs')).writeFileSync(L.SCR + '/ivet-C-1-keep.json', JSON.stringify(keep))
L.savePartial('1')
console.log('errors:', L.errs)
await ctx.close(); await L.browser.close()
