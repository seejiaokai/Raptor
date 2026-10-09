// H-05 — Medical is a tab, in the page, and otherwise as it was. Roles ad / us, phone and desktop.
import { launch, world, toInputs, shot, press, saveRows, big } from './cal-E-lib.mjs'
const size = process.argv[2] || 'desk'
const who = process.argv[3] || 'ad'
const b = await launch()
const log = []
const L = (...a) => { log.push(a.join(' ')); console.log(...a) }
const res = {}
const w = await world(b, size, who); const p = w.page
const N = n => `h05-${size}-${who}-${n}`
await toInputs(p)
const tabsState = () => p.evaluate(() => ['#inMemberMode', '#inSansMode', '#inMedBtn'].map(s => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { s, sel: e.getAttribute('aria-selected'), h: Math.round(r.height), onTop: !!hit && (hit === e || e.contains(hit)) } }))
const wins = () => p.evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.hidden }
  return [...document.querySelectorAll('.floatwin, [role="dialog"], .airpop, #inpEditPop')].filter(vis).map(e => (e.dataset.testid || e.id || e.className.toString().slice(0, 30)) + ' :: ' + e.innerText.replace(/\n/g, ' | ').slice(0, 260))
})
await press(p, size, p.locator('#inMedBtn')); await p.waitForTimeout(700)
const t0 = await tabsState()
const closeX = await p.evaluate(() => [...document.querySelectorAll('#medView button')].filter(b => /✕|×|close/i.test(b.textContent + (b.getAttribute('aria-label') || ''))).length)
L('Medical open: tabs', JSON.stringify(t0), '| close crosses in the Medical view:', closeX); res.tabs = t0; res.closeX = closeX
res.docH = await p.evaluate(() => Math.round(document.querySelector('#inMedBtn').getBoundingClientRect().height))
const placed = await p.evaluate(() => [...document.querySelectorAll('#medView .medcard-placed')].map(e => e.textContent))
L('placed lines on cards:', JSON.stringify(placed)); res.placed = placed
L('page sideways scroll?', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth))
await shot(p, N('1-medical'))
const cardNames = ['Grit', 'Vector', 'Quill', 'Zenith']
for (const nm of cardNames) {
  const card = p.locator('#medView .medcard', { hasText: nm }).first()
  await card.scrollIntoViewIfNeeded()
  await press(p, size, card); await p.waitForTimeout(700)
  const ws = await wins(); L(`card ${nm} ->`, JSON.stringify(ws)); res['card ' + nm] = ws
  L('  tabs while it is open:', JSON.stringify(await tabsState()))
  await shot(p, N('2-card-' + nm))
  await p.keyboard.press('Escape'); await p.waitForTimeout(400)
  if ((await wins()).length) { const x = p.locator('#inpEditCancel, [data-testid="win-inputedit-x"], .docview-close, button:has-text("Close")').first(); if (await x.count()) await x.click().catch(() => {}); await p.waitForTimeout(300) }
  L('  windows after closing:', (await wins()).length)
}
// the document viewer through the "documents" chip
const chip = p.locator('#medView').locator('text=/\\d documents?/').first()
await chip.scrollIntoViewIfNeeded()
await press(p, size, chip); await p.waitForTimeout(800)
const v1 = await p.evaluate(() => ({ title: document.querySelector('.docviewbox .airpop-hd, .docviewbox h3, .docviewbox')?.innerText.split('\n')[0], sub: document.querySelector('.docview-sub')?.textContent, placed: document.querySelector('.docview-placed')?.textContent, count: document.querySelector('.docview-count')?.textContent }))
L('document viewer first page:', JSON.stringify(v1)); res.view1 = v1
await shot(p, N('3-viewer-1'))
const prev = p.locator('.docview-nav button').first(), next = p.locator('.docview-nav button').last()
await press(p, size, prev); await p.waitForTimeout(500)
const v2 = await p.evaluate(() => ({ sub: document.querySelector('.docview-sub')?.textContent, placed: document.querySelector('.docview-placed')?.textContent, count: document.querySelector('.docview-count')?.textContent }))
L('after paging back:', JSON.stringify(v2)); res.view2 = v2
await shot(p, N('4-viewer-2'))
// the viewer's own buttons
L('viewer buttons:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.docviewbox button')].map(b => b.textContent.trim()))))
// "Edit input" from the viewer, and the upload door in that editor
const edit = p.locator('.docviewbox button', { hasText: 'Edit input' })
if (await edit.count()) { await press(p, size, edit); await p.waitForTimeout(700); L('Edit input ->', JSON.stringify(await wins())); await shot(p, N('5-edit-from-viewer')) }
// upload door: the editor's document control opens the file chooser (nothing is chosen)
const upl = p.locator('#inpEditPop button', { hasText: /Upload|Add|Document/ }).first()
if (await upl.count()) {
  const fc = p.waitForEvent('filechooser', { timeout: 4000 }).catch(() => null)
  await press(p, size, upl); const f = await fc
  L('upload door pressed ->', f ? 'a file chooser opened (nothing chosen)' : 'no file chooser', '| windows:', JSON.stringify((await wins()).map(x => x.slice(0, 80))))
  await shot(p, N('6-upload-door'))
}
await p.keyboard.press('Escape'); await p.waitForTimeout(300)
// back to the Inputs tab and to SANS by the tabs
for (const [name, sel] of [['Inputs', '#inMemberMode'], ['SANS', '#inSansMode'], ['Medical', '#inMedBtn'], ['Inputs', '#inMemberMode']]) {
  await press(p, size, p.locator(sel)); await p.waitForTimeout(600)
  const st = await tabsState()
  L('tab', name, '-> selected:', st.filter(t => t.sel === 'true').map(t => t.s).join(','), '| month visible:', await p.locator('#inpCal .ic-mon').isVisible().catch(() => false), '| medical view hidden:', !(await p.locator('#medView').isVisible().catch(() => false)))
}
await shot(p, N('7-back-on-inputs'))
L('errors', JSON.stringify(w.errors))
saveRows(`h05-${size}-${who}`, [{ log, res, errors: w.errors }])
await b.close()
