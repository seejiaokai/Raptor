// Scenario B — a member's plain everyday round. Usage: node mg1105-walk-b.mjs desktop|phone
import { L, press, pressShot } from './mg1105-walk-common.mjs'
const { say, note, check } = L
const size = process.argv[2] || 'desktop'
const tag = size === 'desktop' ? 'Bd' : 'Bp'
const h = await L.open(size)
const { page } = h
const step = async (name, fn) => { try { await fn() } catch (e) { say(`SCRIPT ERROR ${tag} ${name} — ` + String(e.message || e).split('\n').slice(0, 3).join(' | ')) } }
const goNav = async (label) => {
  if (h.tap) { await press(h, page.locator('#burger')); await page.waitForTimeout(500) }
  await press(h, page.getByRole('link', { name: label, exact: true }).first().or(page.getByRole('button', { name: label, exact: true }).first()))
  await page.waitForTimeout(800)
}
const goWeek = async (txt, dateName) => {
  const w = page.locator('.wk').filter({ hasText: txt }).first()
  if (await w.count() && await w.isVisible().catch(() => false)) { await press(h, w); return }
  await press(h, page.locator('.wknav-mbtn').first()); await page.waitForTimeout(500)
  await press(h, page.getByRole('button', { name: dateName }).first()); await page.waitForTimeout(500)
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
}
const shotBoth = async (id, what) => { if (h.tap) await L.shot(page, id, what + '-instant'); await page.waitForTimeout(700); return L.shot(page, id, what + '-settled') }
const sIn = async () => { await L.signIn(page, 'us', 'us') }
await sIn()
const s0 = await L.state(page)

// ---- View-only Sched
await step('sched', async () => {
  await goNav('View-only Sched')
  await L.shot(page, tag + '1', 'sched-start')
  const wk = (t) => page.locator('.wk').filter({ hasText: t }).first()
  const w0 = await page.evaluate(() => window.CURWEEK)
  await goWeek('Jul 20', /^Mon 20 Jul 2026/); await shotBoth(tag + '1', 'sched-next-week')
  const w1 = await page.evaluate(() => window.CURWEEK)
  await goWeek('Jul 13', /^Mon 13 Jul 2026/); await shotBoth(tag + '1', 'sched-back')
  const w2 = await page.evaluate(() => window.CURWEEK)
  note(tag + '1-weeks', { w0, w1, w2, page: await page.evaluate(() => window.CURPAGE) })
  const info = page.locator('button[data-dayinfo]:visible').first()
  if (await info.count()) {
    await press(h, info); await shotBoth(tag + '1', 'sched-info-open')
    const open = () => page.evaluate(() => [...document.querySelectorAll('.airpop')].filter(e => e.getBoundingClientRect().width > 30).length)
    const o1 = await open()
    await page.keyboard.press('Escape'); await page.waitForTimeout(400); await L.shot(page, tag + '1', 'sched-info-escape'); const e1 = await open()
    await press(h, info); await page.waitForTimeout(400)
    await page.mouse.click(h.tap ? 200 : 700, 5); await page.waitForTimeout(400); await L.shot(page, tag + '1', 'sched-info-outside'); const e2 = await open()
    await press(h, info); await page.waitForTimeout(400)
    const x = page.locator('.airpop #dayPopClose').first()
    let e3 = 'no ✕'; if (await x.count()) { await press(h, x); await page.waitForTimeout(400); await L.shot(page, tag + '1', 'sched-info-x'); e3 = await open() }
    note(tag + '1-info', { openedCount: o1, afterEscape: e1, afterOutside: e2, afterX: e3 })
  } else note(tag + '1-info', 'no day ⓘ button visible on View-only Sched')
})

// ---- Inputs: file, edit remarks, delete, undo, redo
const sI = await L.state(page)
let wInputStart = (await L.state(page)).writes
await step('inputs', async () => {
  await goNav('Inputs')
  await press(h, page.locator('#inListBtn')); await page.waitForTimeout(600)
  await L.shot(page, tag + '2', 'inputs-list')
  wInputStart = (await L.state(page)).writes
  await press(h, page.locator('#inNew')); await page.waitForTimeout(700)
  await L.shot(page, tag + '2', 'add-window')
  await press(h, page.getByRole('button', { name: /^Wed 22 Jul 2026/ }).first()); await page.waitForTimeout(400)
  await L.shot(page, tag + '2', 'add-date-picked')
  const sa = await L.state(page)
  await press(h, page.locator('#inpEditSave'))
  if (h.tap) await L.shot(page, tag + '2', 'add-saved-instant')
  await page.waitForTimeout(900)
  await L.shot(page, tag + '2', 'add-saved-settled')
  const wa = await L.writesSince(page, sa.writes)
  const nd = page.getByRole('button', { name: 'No document', exact: true })
  if (await nd.count()) { await L.shot(page, tag + '2', 'no-document-question'); await press(h, nd); if (h.tap) await L.shot(page, tag + '2', 'no-document-instant'); await page.waitForTimeout(900); await L.shot(page, tag + '2', 'after-no-document') }
  const wa2 = await L.writesSince(page, sa.writes)
  note(tag + '2-add-after-nodoc', { writes: wa2 })
  await press(h, page.locator('#inRangeBtn')); await page.waitForTimeout(600); await L.shot(page, tag + '2', 'range-open')
  note(tag + '2-range', await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 2 && /all dates|all|this|next|year|month/i.test(b.textContent)).slice(0, 12).map(b => b.id + '|' + b.textContent.trim().slice(0, 30))))
  const winOpen = await page.locator('.inpedwin').isVisible().catch(() => false)
  note(tag + '2-add', { writes: wa, windowStillOpen: winOpen, said: await L.notesSince(page, sa.notes), undo: (await L.state(page)).undo })
})
await step('inputs-list-find', async () => {
  const rows = await page.evaluate(() => [...document.querySelectorAll('#page-inputs [class*=ib-], #page-inputs .in-row, #page-inputs tr, #page-inputs [data-iid]')].filter(e => e.getBoundingClientRect().width > 30 && /22/.test(e.textContent)).slice(0, 6).map(e => `${e.tagName}.${String(e.className).slice(0, 30)}|${[...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',')}|${e.textContent.replace(/s+/g, ' ').slice(0, 80)}`))
  note(tag + '2-rows', rows)
})

const rowSel = '[data-iid]:visible:has-text("22 Jul"), [data-iid]:visible:has-text("OL")'
// B2: other places showing the input
await step('b2-places', async () => {
  const inList = await page.locator(rowSel).count()
  note(tag + 'B2-inputs-list', { rows: inList, text: await page.locator(rowSel).first().innerText().catch(() => '') })
  await L.shot(page, tag + 'B2', 'inputs-list-with-input')
  await goNav('View-only Sched')
  await goWeek('Jul 20', /^Mon 20 Jul 2026/); await page.waitForTimeout(900)
  const wed = await page.evaluate(() => { const d = [...document.querySelectorAll('#vWeek .day')].find(e => /Wednesday/.test(e.textContent.slice(0, 40))); return d ? d.innerText.replace(/s+/g, ' ') : null })
  note(tag + 'B2-sched-wed', { hasRanger: wed && /Ranger/.test(wed), ctx: wed && (wed.match(/.{0,60}Ranger.{0,60}/) || [''])[0], head: wed && wed.slice(0, 120) })
  await L.shot(page, tag + 'B2', 'sched-wed-jul22')
  const wedEl = page.locator('#vWeek .day').nth(2)
  if (await wedEl.count()) { await wedEl.scrollIntoViewIfNeeded().catch(() => {}); await L.shotEl(page, '#vWeek .day:nth-child(3)', tag + 'B2', 'sched-wed-crop') }
  await goWeek('Jul 13', /^Mon 13 Jul 2026/); await page.waitForTimeout(700)
  // bell
  const bell = page.locator('#notifyBell')
  await press(h, bell); await shotBoth(tag + 'B2', 'bell-open')
  const bellText = await page.evaluate(() => { const b = [...document.querySelectorAll('[class*=bell], [id*=notif], [class*=notif]')].filter(e => e.getBoundingClientRect().width > 120 && e.getBoundingClientRect().height > 60).slice(0, 2); return b.map(e => e.className + '|' + e.innerText.replace(/s+/g, ' ').slice(0, 300)) })
  note(tag + 'B2-bell', bellText)
  await page.keyboard.press('Escape'); await page.waitForTimeout(400); await L.shot(page, tag + 'B2', 'bell-escape')
  const openAfterEsc = await page.evaluate(() => [...document.querySelectorAll('[class*=bellpop], [class*=notifpop], [id*=notifPanel], .bellmenu')].filter(e => e.getBoundingClientRect().width > 50).length)
  await press(h, bell); await page.waitForTimeout(500)
  await page.mouse.click(h.tap ? 200 : 700, h.tap ? 840 : 700); await page.waitForTimeout(500); await L.shot(page, tag + 'B2', 'bell-outside')
  const openAfterOutside = await page.evaluate(() => [...document.querySelectorAll('[class*=bellpop], [class*=notifpop], [id*=notifPanel], .bellmenu')].filter(e => e.getBoundingClientRect().width > 50).length)
  await press(h, bell); await page.waitForTimeout(500)
  await press(h, bell); await page.waitForTimeout(500); await L.shot(page, tag + 'B2', 'bell-toggle-closed')
  note(tag + 'B2-bell-close', { openAfterEsc, openAfterOutside })
})

// edit remarks, delete, undo, redo
await step('inputs-edit', async () => {
  await goNav('Inputs'); await page.waitForTimeout(500)
  await press(h, page.locator('#inListBtn')); await page.waitForTimeout(400)
  await press(h, page.locator('#inRangeBtn')); await page.waitForTimeout(400); await press(h, page.locator('#inRangeAll')); await page.waitForTimeout(600)
  await L.shot(page, tag + '3', 'inputs-list-all-dates')
  const sE = await L.state(page)
  await press(h, page.locator(rowSel).first()); await page.waitForTimeout(800)
  await L.shot(page, tag + '3', 'input-open')
  const rmk = page.locator('#inpEditRmk')
  await rmk.click(); await page.keyboard.type('walk remark'); await page.waitForTimeout(300)
  await L.shot(page, tag + '3', 'remark-typed')
  note(tag + '3-buttons', await page.evaluate(() => [...document.querySelectorAll('.inpedwin button')].filter(b => b.getBoundingClientRect().width > 2).map(b => b.id + '|' + b.textContent.trim().slice(0, 20))))
  const save = page.locator('#inpEditSave')
  await press(h, save); if (h.tap) await L.shot(page, tag + '3', 'remark-saved-instant'); await page.waitForTimeout(900)
  await L.shot(page, tag + '3', 'remark-saved-settled')
  note(tag + '3-save', { writes: await L.writesSince(page, sE.writes), said: await L.notesSince(page, sE.notes), rowText: await page.locator(rowSel).first().innerText().catch(() => 'no row') , winOpen: await page.locator('.inpedwin').isVisible().catch(() => false) })
  // delete
  if (!(await page.locator('.inpedwin').isVisible().catch(() => false))) { await press(h, page.locator(rowSel).first()); await page.waitForTimeout(800) }
  const sD = await L.state(page)
  const del = page.locator('.inpedwin button').filter({ hasText: /^Delete/ }).first()
  note(tag + '3-delete-btn', await del.count())
  if (await del.count()) {
    await press(h, del); if (h.tap) await L.shot(page, tag + '3', 'delete-instant'); await page.waitForTimeout(900)
    await L.shot(page, tag + '3', 'delete-settled')
    note(tag + '3-delete', { writes: await L.writesSince(page, sD.writes), said: await L.notesSince(page, sD.notes), rows: await page.locator(rowSel).count(), undo: (await L.state(page)).undo })
  }
  const sU = await L.state(page)
  await press(h, page.locator('#undoBtn')); if (h.tap) await L.shot(page, tag + '3', 'undo-instant'); await page.waitForTimeout(900); await L.shot(page, tag + '3', 'undo-settled')
  note(tag + '3-undo', { writes: await L.writesSince(page, sU.writes), said: await L.notesSince(page, sU.notes), rows: await page.locator(rowSel).count(), undo: (await L.state(page)).undo, redo: (await L.state(page)).redo })
  const sR = await L.state(page)
  await press(h, page.locator('#redoBtn')); if (h.tap) await L.shot(page, tag + '3', 'redo-instant'); await page.waitForTimeout(900); await L.shot(page, tag + '3', 'redo-settled')
  note(tag + '3-redo', { writes: await L.writesSince(page, sR.writes), said: await L.notesSince(page, sR.notes), rows: await page.locator(rowSel).count(), undo: (await L.state(page)).undo, redo: (await L.state(page)).redo })
})

// Quals: his own row
await step('quals', async () => {
  await goNav('Quals'); await page.waitForTimeout(500)
  await press(h, page.locator('#qEdit')); await page.waitForTimeout(600)
  await L.shot(page, tag + '4', 'quals-edit-mode')
  const cell = (k) => page.locator('#page-quals td[data-q="bane|' + k + '"]')
  const row = page.locator('#page-quals tr').filter({ has: page.locator('td.qname[data-person="bane"]') })
  await row.scrollIntoViewIfNeeded().catch(() => {})
  const t0 = await L.state(page)
  const before = await cell('tf').innerText()
  await press(h, cell('tf')); if (h.tap) await L.shot(page, tag + '4', 'tick-instant'); await page.waitForTimeout(700)
  const ticked = await cell('tf').innerText()
  await L.shotEl(page, '#page-quals tr:has(td[data-person="bane"])', tag + '4', 'row-ticked')
  note(tag + '4-tick', { before, after: ticked, writes: await L.writesSince(page, t0.writes), said: await L.notesSince(page, t0.notes), undo: (await L.state(page)).undo })
  const t1 = await L.state(page)
  await press(h, cell('tf')); await page.waitForTimeout(700)
  await L.shotEl(page, '#page-quals tr:has(td[data-person="bane"])', tag + '4', 'row-unticked')
  note(tag + '4-untick', { after: await cell('tf').innerText(), writes: await L.writesSince(page, t1.writes) })
  // Management
  const t2 = await L.state(page)
  await press(h, cell('mgmt')); if (h.tap) await L.shot(page, tag + '4', 'mgmt-instant'); await page.waitForTimeout(700)
  await L.shotEl(page, '#page-quals tr:has(td[data-person="bane"])', tag + '4', 'row-mgmt-pressed')
  note(tag + '4-mgmt', { text: await cell('mgmt').innerText(), cls: await cell('mgmt').getAttribute('class'), title: await cell('mgmt').getAttribute('title'), writes: await L.writesSince(page, t2.writes), said: await L.notesSince(page, t2.notes), ticked: await cell('mgmt').locator('.qchk').count() })
  // Scheduler cell (a member's own)
  const t2b = await L.state(page)
  await press(h, cell('sched')); await page.waitForTimeout(600)
  note(tag + '4-sched-cell', { text: await cell('sched').innerText(), cls: await cell('sched').getAttribute('class'), title: await cell('sched').getAttribute('title'), writes: await L.writesSince(page, t2b.writes), said: await L.notesSince(page, t2b.notes) })
  if (!(await cell('sched').locator('.qchk').count())) { await press(h, cell('sched')); await page.waitForTimeout(500) } // put back if we ticked it
  // callsign
  const t3 = await L.state(page)
  const cs = page.locator('#page-quals td.qname[data-person="bane"]')
  await press(h, cs); await page.waitForTimeout(500)
  await page.keyboard.type('ZZQ'); await page.keyboard.press('Enter'); await page.waitForTimeout(600)
  await L.shotEl(page, '#page-quals tr:has(td[data-person="bane"])', tag + '4', 'row-callsign-typed')
  note(tag + '4-callsign', { text: await cs.innerText(), editable: await cs.evaluate(e => e.isContentEditable), writes: await L.writesSince(page, t3.writes), said: await L.notesSince(page, t3.notes), zzqInPage: await page.evaluate(() => document.body.innerText.includes('ZZQ')) , popup: await page.evaluate(() => [...document.querySelectorAll('.floatwin, [role=dialog]')].filter(e => e.getBoundingClientRect().width > 30).map(e => e.innerText.replace(/s+/g, ' ').slice(0, 120))) })
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  await L.shot(page, tag + '4', 'after-callsign')
})
// B1: the whole round's writes
const wAll = await L.writesSince(page, s0.writes)
note(tag + 'B1-all-writes', { count: wAll.length, keys: [...new Set(wAll.map(x => x.replace(/raptor:(inputs|changes|settings)[^ ]*/, 'raptor:$1…')))] })
await step('signout', async () => { await L.signOut(page) })
await L.finish('b-' + size)
