/* WALKER G — X-09: medical splitting keeps each piece's own placement line on its own document page */
import * as G from './cal-G-lib.mjs'
import * as W2 from './dbrA-W2-lib.mjs'
const { L, W, sleep } = G
G.setTag('x09')
const { browser, ctx, p, errors } = await G.world({ who: 'a' })
const tid = id => p.locator(`[data-testid="${id}"]`)
const say = (n, o) => console.log(n, JSON.stringify(o).slice(0, 2200))
const pdf = n => Buffer.from(`%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 120]>>endobj\n% X09 document ${n}\ntrailer<</Root 1 0 R>>\n%%EOF`)
const recs = () => p.evaluate(() => window.INPUTS.filter(x => x.person === 'bane' && /^(ATT|Upchit)/.test(x.type) && /X09/.test(x.remarks || '')).map(x => ({ iid: x.iid, type: x.type, date: x.date, end: x.endDate || '', docs: (x.docIds || (x.docId ? [x.docId] : [])).map(d => (window.DOCS && window.DOCS[d] && window.DOCS[d].name) || d), by: x.by && window.PEOPLE[x.by] ? window.PEOPLE[x.by].cs : x.by, at: x.at, modBy: x.modBy && window.PEOPLE[x.modBy] ? window.PEOPLE[x.modBy].cs : x.modBy, modAt: x.modAt })).sort((a, b) => a.iid < b.iid ? -1 : 1))
const toJulCal = async () => { await L.go(p, 'inputs'); if (await p.locator('#inMemberMode').count()) { await p.locator('#inMemberMode').click(); await sleep(300) }; await G.toInputsCal(p); await G.monthTo(p, 2026, 6) }
const fileMed = async ({ day, type, to, doc, remarks, person }) => {
  await toJulCal(); await G.openDay(p, day); await G.plusInput(p)
  await p.selectOption('#inpEditType', type); await sleep(200)
  if (person && await p.locator('#inpEditPerson').count()) await p.selectOption('#inpEditPerson', person)
  if (to && to !== day) { await p.locator('[data-testid="win-inputedit"] [data-cal="' + to + '"]').first().click(); await sleep(300) }
  if (doc) { await p.locator('[data-testid="win-inputedit"] .docfield input[type=file]').first().setInputFiles([{ name: doc, mimeType: 'application/pdf', buffer: pdf(doc) }]); await sleep(700) }
  await p.fill('#inpEditRmk', remarks); await sleep(200)
  const f = await G.shot(p, `editor-${type.replace(/\W/g, '')}-${day}`)
  await p.click('#inpEditSave'); await sleep(1000)
  return f
}
const sheetUp = async () => {
  const s = p.locator('.upconf-pop:visible, [data-testid="oilconf"]:visible, [data-testid^="medclash"]:visible, .airpop:visible').filter({ hasText: /replaces|keep|Remove|clash|Upchit|summary|ends/i }).first()
  return (await s.count()) ? (await s.innerText()).replace(/\s+/g, ' ').slice(0, 700) : null
}

/* ---- E1: Saber files ATT B for Ranger Jul 7-12 with document A ---- */
const f1 = await fileMed({ day: '2026-07-07', type: 'ATT B', to: '2026-07-12', doc: 'X09-docA-attB.pdf', remarks: 'X09 E1 attb', person: 'bane' })
say('after E1, a sheet?', await sheetUp()); await sleep(500)
say('E1 records', await recs())
/* ---- E2: Ranger himself (signed in as him) files ATT C Jul 10-14 with document B — overlaps E1 ---- */
await W2.signOut(p); await L.signIn(p, 'm', { goto: false })
const f2 = await fileMed({ day: '2026-07-10', type: 'ATT C', to: '2026-07-14', doc: 'X09-docB-attC.pdf', remarks: 'X09 E2 attc' })
const clash = await sheetUp(); say('E2 clash sheet', clash); const f3 = await G.shot(p, 'e2-clash-sheet')
console.log('clash buttons', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.upconf-pop button, .airpop button')].filter(b => b.offsetParent).map(b => b.innerText.trim() + '|' + (b.dataset.testid || b.id || '')).filter(t => t.length > 2).slice(0, 30))))
await p.locator('.airpop:visible button', { hasText: 'ATT C replaces' }).first().click(); await sleep(300)
const f4 = await G.shot(p, 'e2-clash-chosen')
await tid('medclash-save').click(); await sleep(1000)
say('after the clash sheet, another sheet?', await sheetUp())
const afterE2 = await recs(); say('RECORDS after E2 (E1 cut back, E2 whole)', afterE2)
/* ---- the upchit: Saber files an Upchit for Ranger on Jul 13 with document C: the medical entry ends the day before ---- */
await W2.signOut(p); await L.signIn(p, 'a', { goto: false })
const f5 = await fileMed({ day: '2026-07-13', type: 'Upchit', to: null, doc: 'X09-docC-upchit.pdf', remarks: 'X09 E3 upchit', person: 'bane' })
const up1 = await sheetUp(); say('Upchit sheet', up1); const f6 = await G.shot(p, 'upchit-sheet')
console.log('upchit buttons', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.airpop button')].filter(b => b.offsetParent).map(b => b.innerText.trim() + '|' + (b.dataset.testid || b.id || '')).filter(t => t.length > 2).slice(0, 30))))
const prim = p.locator('.upconf-pop:visible button.primary, .upconf-pop:visible [data-testid$="save"]').first()
if (await prim.count()) { await prim.click(); await sleep(1000) }
say('after the upchit sheet, another sheet?', await sheetUp())
const afterE3 = await recs(); say('RECORDS after the upchit (the trim)', afterE3)
G.saveRows('x09-partial')
/* ---- the Medical tab: every document of the episode, paged ---- */
await toJulCal()
await p.locator('#inMedBtn').click(); await sleep(900)
const f7 = await G.shot(p, 'medical-tab')
const cards = await p.locator('.medcard').allInnerTexts(); say('cards', cards.map(c => c.replace(/\s+/g, ' ')))
const myCards = p.locator('.medcard').filter({ hasText: 'Ranger' })
say('Ranger cards', await myCards.count())
const pages = []
if (await myCards.count()) {
  await myCards.first().click(); await p.waitForSelector('#docViewPop:not([hidden])'); await sleep(600)
  for (let g = 0; g < 8 && await p.locator('#docViewPrev').count() && !(await p.locator('#docViewPrev').isDisabled()); g++) { await p.locator('#docViewPrev').click(); await sleep(400) }
  for (let i = 0; i < 8; i++) {
    const t = await p.locator('#docViewTitle').innerText(), pl = await p.locator('[data-testid="docview-placed"]').innerText().catch(() => '(none)')
    const nav = await p.locator('.docview-count').innerText().catch(() => '1 of 1'); const sub = (await p.locator('.docview-sub').innerText().catch(() => '')).replace(/\s+/g, ' ')
    const f = await G.shot(p, `viewer-page-${i + 1}`)
    const doc = await p.locator('.docview-frame, .docview-img').first().evaluate(e => e.getAttribute('title') || e.getAttribute('alt')).catch(() => '(no doc)')
    pages.push({ nav, title: t, sub, placed: pl, doc, f })
    const nx = p.locator('#docViewNext'); if (!(await nx.count()) || (await nx.isDisabled())) break
    await nx.click(); await sleep(500)
  }
  say('VIEWER PAGES (from the Medical card)', pages)
}
await p.locator('#docViewDone').click(); await sleep(400)
/* the same documents from the List's paperclip, row by row */
await p.locator('#inListBtn').click().catch(() => {}); await sleep(600)
await p.locator('#inMemberMode').click().catch(() => {}); await sleep(300); await p.locator('#inListBtn').click().catch(() => {}); await sleep(600)
const clips = []
const nClip = await p.locator('#inBody .rclip').count(); say('paperclips in the List', nClip)
for (let i = 0; i < nClip; i++) {
  const row = p.locator('#inBody tr').filter({ has: p.locator('.rclip') }).nth(i)
  const rt = (await row.innerText()).replace(/\s+/g, ' ').slice(0, 160)
  if (!/X09|Ranger/.test(rt)) continue
  await row.locator('.rclip').click(); await p.waitForSelector('#docViewPop:not([hidden])'); await sleep(500)
  const pl = await p.locator('[data-testid="docview-placed"]').innerText().catch(() => '(none)')
  const doc = await p.locator('.docview-frame, .docview-img').first().evaluate(e => e.getAttribute('title') || e.getAttribute('alt')).catch(() => '(no doc)')
  const f = await G.shot(p, `list-clip-${i}`)
  clips.push({ row: rt, title: await p.locator('#docViewTitle').innerText(), placed: pl, doc, f })
  await p.locator('#docViewDone').click(); await sleep(300)
}
say('LIST PAPERCLIPS', clips)

/* ---- and the same documents paged by the member who is the subject (Ranger), signed in as himself ---- */
await W2.signOut(p); await L.signIn(p, 'm', { goto: false })
await L.go(p, 'inputs'); await p.locator('#inMedBtn').click(); await sleep(900)
const mcards = p.locator('.medcard').filter({ hasText: 'Ranger' })
say('member: Ranger cards', await mcards.count())
const mpages = []
if (await mcards.count()) {
  await mcards.first().click(); await p.waitForSelector('#docViewPop:not([hidden])'); await sleep(600)
  for (let g = 0; g < 8 && await p.locator('#docViewPrev').count() && !(await p.locator('#docViewPrev').isDisabled()); g++) { await p.locator('#docViewPrev').click(); await sleep(400) }
  for (let i = 0; i < 6; i++) {
    const t = await p.locator('#docViewTitle').innerText(), pl = await p.locator('[data-testid="docview-placed"]').innerText().catch(() => '(none)')
    const nav = await p.locator('.docview-count').innerText().catch(() => '1 of 1')
    const doc = await p.locator('.docview-frame, .docview-img').first().evaluate(e => e.getAttribute('title') || e.getAttribute('alt')).catch(() => '(no doc)')
    const btns = await p.locator('#docViewPop .airpop-foot button:visible').allInnerTexts()
    const f = await G.shot(p, `member-viewer-page-${i + 1}`)
    mpages.push({ nav, title: t, placed: pl, doc, btns, f })
    const nx = p.locator('#docViewNext'); if (!(await nx.count()) || (await nx.isDisabled())) break
    await nx.click(); await sleep(500)
  }
}
say('MEMBER VIEWER PAGES (Ranger, signed in as himself)', mpages)
G.saveRows('x09-raw')

console.log('errors', JSON.stringify(errors))
await browser.close()
