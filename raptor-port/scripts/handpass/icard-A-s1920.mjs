import { launch, open, openDay, press, shot, cardFacts, toList, overflow, judge, saveRows, saveWin, csId, DAYWIN, WIN, rec, recAll, errs } from './icard-A-lib.mjs'
const browser = await launch()
const T = true
const { ctx, page: p } = await open(browser, { width: 390, height: 844 }, 'ad', 'a', T)
async function fileOne(day, o) {
  await openDay(p, day, T)
  await press(T, p.locator('#icPopAdd')); await p.locator(WIN).waitFor()
  await p.selectOption('#inpEditType', o.type)
  if (o.several) {
    await press(T, p.locator(`${WIN} [data-testid="pp-several"]`))
    for (const cs of o.several) { const b = p.locator(`${WIN} [data-pp="${await csId(p, cs)}"]`); await b.scrollIntoViewIfNeeded().catch(() => {}); if ((await b.getAttribute('aria-pressed')) !== 'true') await press(T, b) }
  } else if (o.who.startsWith('ph:')) await p.selectOption('#inpEditPerson', o.who.slice(3))
  else await p.selectOption('#inpEditPerson', await csId(p, o.who))
  await p.fill('#inpEditStart', o.start || '09:00'); await p.fill('#inpEditEnd', o.end || '10:00')
  await p.fill('#inpEditOwnTitle', o.title); if (o.rmk) await p.fill('#inpEditRmk', o.rmk)
  await saveWin(p, T, 'no')
  await p.keyboard.press('Escape'); await p.waitForTimeout(200)
}
// the set (every title starts ZQ)
await fileOne('2026-07-27', { type: 'Duty', who: 'Saber', title: 'ZQ saber duty' })
await fileOne('2026-07-27', { type: 'Duty', who: 'Ranger', title: 'ZQ ranger duty', rmk: 'bring the quokka tag', start: '11:00', end: '12:00' })
await fileOne('2026-07-28', { type: 'Meeting', several: ['Ranger', 'Saber', 'Zulu'], title: 'ZQ shared meeting' })
await fileOne('2026-07-29', { type: 'Event', who: 'ph:all', title: 'ZQ all event' })
await fileOne('2026-07-29', { type: 'Event', who: 'Anvil', title: 'ZQ anvil event', start: '13:00', end: '14:00' })
await fileOne('2026-07-30', { type: 'Duty', who: 'ph:allavail', title: 'ZQ allavail duty' })
console.log('set filed:', (await recAll(p, {})).filter(r => /^ZQ/.test(r.title || '')).length, 'records (shared counted per person)')
await toList(p, T)
if (!(await p.locator('#inFilters').isVisible())) { await p.locator('#inFiltersBtn').tap(); await p.waitForTimeout(250) }
async function setF({ person, type, search }) {
  if (person != null) await p.selectOption('#inFPerson', person)
  if (type != null) await p.selectOption('#inFType', type)
  if (search != null) await p.fill('#inFSearch', search)
  await p.waitForTimeout(500)
}
const snap = async name => { await p.evaluate(() => { const e = document.querySelector('#inRangeBtn'); if (e) { e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -110) } }); await p.waitForTimeout(250); return shot(p, name) }
const emptyText = () => p.evaluate(() => { const e = document.querySelector('#inEmpty'); return e && e.offsetParent ? e.innerText.replace(/\s+/g, ' ') : '' })
const readList = () => p.evaluate(() => {
  const out = []; let cur = null
  for (const e of document.querySelectorAll('#inList [data-testid="inl-day"], #inList [data-testid^="inl-row-"]')) {
    if (e.matches('[data-testid="inl-day"]')) { cur = { day: e.querySelector('b') ? e.querySelector('b').textContent.trim() : e.textContent, count: e.querySelector('i') ? e.querySelector('i').textContent.trim() : '', cards: [] }; out.push(cur) }
    else if (cur) { const t = e.querySelector('[data-testid="inl-title"]'); cur.cards.push({ title: t ? t.textContent : null, who: (e.querySelector('[data-testid="inl-who"]') || {}).textContent, kind: (e.querySelector('[data-testid="inl-kind"]') || {}).textContent }) }
  }
  return out
})
const sum = l => l.map(d => `${d.day}[${d.count}]: ${d.cards.map(c => c.title).join(' / ')}`).join(' || ')
const titles = l => l.flatMap(d => d.cards.map(c => c.title)).filter(Boolean)
const emptyHeads = l => l.filter(d => !d.cards.length).length
const countsRight = l => l.every(d => d.count === `${d.cards.length} input${d.cards.length === 1 ? '' : 's'}`)
const expect = (tag, l, want, probs) => {
  const got = titles(l).filter(t => /^ZQ/.test(t)).sort(), w = [...want].sort()
  if (JSON.stringify(got) !== JSON.stringify(w)) probs.push(`${tag}: shows [${got.join(', ')}] wanted [${w.join(', ')}]`)
  if (emptyHeads(l)) probs.push(`${tag}: ${emptyHeads(l)} empty day headings`)
  if (!countsRight(l)) probs.push(`${tag}: a heading's count does not match its cards`)
}
const ALL = ['ZQ saber duty', 'ZQ ranger duty', 'ZQ shared meeting', 'ZQ all event', 'ZQ anvil event', 'ZQ allavail duty']
const pics19 = [], pics20 = []
// ===== 19
const probs19 = []; const logs19 = []
await setF({ search: 'ZQ', person: 'all', type: 'all' })
let l = await readList(); logs19.push('Everyone: ' + sum(l)); expect('Everyone', l, ALL, probs19); pics19.push(await snap('19-phone-everyone'))
const dayCountEveryone = l.find(d => /27 Jul/.test(d.day)).count
await setF({ person: 'ph:all' }); l = await readList(); logs19.push('ALL: ' + sum(l)); pics19.push(await snap('19-phone-all'))
const gotAll = titles(l).filter(t => /^ZQ/.test(t))
if (JSON.stringify(gotAll) !== JSON.stringify(['ZQ all event'])) probs19.push(`ALL shows [${gotAll.join(', ')}] wanted only ZQ all event`)
if (emptyHeads(l)) probs19.push('ALL: empty headings'); if (!countsRight(l)) probs19.push('ALL: counts')
await setF({ person: 'ph:allavail' }); l = await readList(); logs19.push('ALL AVAIL: ' + sum(l)); pics19.push(await snap('19-phone-allavail'))
const gotAA = titles(l).filter(t => /^ZQ/.test(t))
if (JSON.stringify(gotAA) !== JSON.stringify(['ZQ allavail duty'])) probs19.push(`ALL AVAIL shows [${gotAA.join(', ')}] wanted only ZQ allavail duty`)
if (!countsRight(l)) probs19.push('ALL AVAIL: counts')
for (const cs of ['Ranger', 'Saber']) {
  await setF({ person: await csId(p, cs) }); l = await readList(); logs19.push(cs + ': ' + sum(l)); pics19.push(await shot(p, `19-phone-${cs.toLowerCase()}`))
  const got = titles(l).filter(t => /^ZQ/.test(t)).sort()
  const own = cs === 'Ranger' ? 'ZQ ranger duty' : 'ZQ saber duty'
  for (const w of [own, 'ZQ shared meeting']) if (!got.includes(w)) probs19.push(`${cs}: missing ${w}`)
  for (const bad of ['ZQ anvil event', cs === 'Ranger' ? 'ZQ saber duty' : 'ZQ ranger duty']) if (got.includes(bad)) probs19.push(`${cs}: shows ${bad}`)
  logs19.push(`${cs} also shows: ${got.filter(t => ![own, 'ZQ shared meeting'].includes(t)).join(', ') || 'nothing else'}`)
  // the whole shared card with all its names
  const sh = (await cardFacts(p, '#inList', 'inl')).find(c => c.title === 'ZQ shared meeting')
  if (!sh || sh.who !== 'Ranger, Saber, Zulu') probs19.push(`${cs}: the shared card names "${sh && sh.who}"`)
  // the day count recalculated
  const d27 = l.find(d => /27 Jul/.test(d.day)); if (!d27 || d27.count !== '1 input') probs19.push(`${cs}: 27 Jul count "${d27 && d27.count}" (was ${dayCountEveryone} under Everyone)`)
  if (!countsRight(l)) probs19.push(`${cs}: counts`); if (emptyHeads(l)) probs19.push(`${cs}: empty headings`)
}
judge(19, 'phone 390', 'admin', probs19.length ? 'FAIL' : 'PASS', probs19.join(' | ') || logs19.join(' ## '), pics19)
// ===== 20
const probs20 = []; const logs20 = []
await setF({ person: 'all', type: 'Event', search: 'ZQ' }); l = await readList(); logs20.push('Event: ' + sum(l)); pics20.push(await snap('20-phone-event'))
expect('Event', l, ['ZQ all event', 'ZQ anvil event'], probs20)
await setF({ type: 'Meeting' }); l = await readList(); logs20.push('Meeting: ' + sum(l)); pics20.push(await snap('20-phone-meeting'))
expect('Meeting', l, ['ZQ shared meeting'], probs20)
await setF({ type: 'all' })
for (const [tag, q, want] of [['exact title', 'ZQ anvil event', ['ZQ anvil event']], ['exact title UPPER', 'ZQ ANVIL EVENT', ['ZQ anvil event']], ['remark-only word', 'quokka', ['ZQ ranger duty']], ['remark-only word UPPER', 'QUOKKA', ['ZQ ranger duty']], ['shared participant (not first A-Z)', 'zulu', ['ZQ shared meeting']], ['shared participant UPPER', 'ZULU', ['ZQ shared meeting']]]) {
  await setF({ search: q }); l = await readList(); logs20.push(`"${q}": ${sum(l)}`)
  const got = titles(l).filter(t => /^ZQ/.test(t)).sort()
  if (JSON.stringify(got) !== JSON.stringify([...want].sort())) probs20.push(`search "${q}" (${tag}): shows [${got.join(', ')}] wanted [${want.join(', ')}]`)
  if (emptyHeads(l)) probs20.push(`search "${q}": empty headings`); if (!countsRight(l)) probs20.push(`search "${q}": counts`)
  const sh = (await cardFacts(p, '#inList', 'inl')).find(c => c.title === 'ZQ shared meeting'); if (sh && sh.who !== 'Ranger, Saber, Zulu') probs20.push(`"${q}": shared card names "${sh.who}"`)
  if (tag === 'shared participant (not first A-Z)') pics20.push(await snap('20-phone-search-zulu'))
}
// combined: search + person + kind
await setF({ search: 'ZQ', person: await csId(p, 'Ranger'), type: 'Meeting' }); l = await readList(); logs20.push('ZQ + Ranger + Meeting: ' + sum(l)); pics20.push(await snap('20-phone-combined-ranger-meeting'))
expect('ZQ+Ranger+Meeting', l, ['ZQ shared meeting'], probs20)
await setF({ search: 'ZQ', person: await csId(p, 'Ranger'), type: 'Event' }); l = await readList(); logs20.push('ZQ + Ranger + Event: ' + sum(l))
expect('ZQ+Ranger+Event', l, [], probs20)
const emptyMsg = await emptyText()
logs20.push('empty list says: ' + emptyMsg.replace(/\s+/g, ' ').slice(0, 100)); pics20.push(await snap('20-phone-combined-empty'))
await setF({ search: 'ZQ', person: 'ph:all', type: 'Event' }); l = await readList(); logs20.push('ZQ + ALL + Event: ' + sum(l))
expect('ZQ+ALL+Event', l, ['ZQ all event'], probs20)
judge(20, 'phone 390', 'admin', probs20.length ? 'FAIL' : 'PASS', probs20.join(' | ') || logs20.join(' ## '), pics20)
await ctx.close()
await browser.close()
saveRows('s1920')
console.log('ERRS', JSON.stringify(errs))
