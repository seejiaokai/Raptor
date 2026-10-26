// W2 walk, Item 8 — scenarios 33 and 34: the clash note names the man. VERSION 1
// Run: node w2d.mjs phone|desktop   (ONLY=33,34 to pick)
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { openWorld, tools } from './w2lib.mjs'
console.log('w2d.mjs VERSION 1')
const WHICH = process.argv[2] || 'phone'
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'out'); mkdirSync(OUT, { recursive: true })
const allResults = []
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const ok = (c, then = 'PASS') => (c ? then : 'FAIL')
const cellId = (p, d) => `[data-testid="cell-${p}-${d}"]`

async function scenario(id, fn) {
  if (ONLY && !ONLY.includes(id)) return
  console.log(`\n== ${id} (${WHICH})`)
  const w = await openWorld(WHICH); const t = tools(w, 'w2-s' + id.replace(/[^0-9a-z]/gi, ''))
  const rec = (sc, verdict, seen, pic = '') => { t.rec(sc, WHICH, verdict, seen, pic); allResults.push({ id: sc, size: WHICH, verdict, seen, pic }) }
  try { await fn(w, t, rec) } catch (e) { console.log('  STEP-ERROR ' + String(e).split('\n')[0].slice(0, 300)); allResults.push({ id, size: WHICH, verdict: 'NOT WALKED', seen: String(e).split('\n')[0].slice(0, 300) }) }
  console.log('  errors', JSON.stringify(w.errors))
  if (w.errors.length) allResults.push({ id: id + '-errors', size: WHICH, verdict: 'ERRORS', seen: JSON.stringify(w.errors) })
  await w.browser.close()
}
async function setSans(w, t, on) {
  const { page } = w
  await t.press('[data-testid="settings-open"]'); await page.waitForTimeout(350)
  const txt = await page.locator('[data-testid="sans-toggle"]').innerText()
  if (/Show SANS/.test(txt) === on) { await t.press('[data-testid="sans-toggle"]'); await page.waitForTimeout(500) }
  await t.press('[data-testid="settings-close"]'); await page.waitForTimeout(500)
}
// a bid on a day: fill AM/whole-day LL through the one-day sheet (answering the below-zero ask), then approve it
async function bidAndApprove(w, t, p, d) {
  const { page } = w
  await page.locator(cellId(p, d)).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
  await t.press(cellId(p, d)); await page.waitForTimeout(400)
  await t.press('[data-testid="bid-LL"]'); await page.waitForTimeout(500)
  if (await page.locator('[data-testid="bid-picker"]').count()) { await t.press('[data-testid="bid-LL"]'); await page.waitForTimeout(500) }
  if (await page.locator('[data-testid="bid-picker"]').count()) await t.press('[data-testid="bid-cancel"]')
  await page.waitForTimeout(300)
  await page.locator(cellId(p, d)).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
  await t.press(cellId(p, d)); await page.waitForTimeout(400)
  if (await page.locator('[data-testid="decide-approve"]').count()) { await t.press('[data-testid="decide-approve"]'); await page.waitForTimeout(500) }
  if (await page.locator('[data-testid="bid-picker"]').count()) await t.press('[data-testid="bid-cancel"]')
  await page.waitForTimeout(300)
  return page.evaluate(([p, d]) => { const c = document.querySelector(`[data-testid="cell-${p}-${d}"]`); return c ? (c.innerText || '').replace(/\s+/g, ' ').trim() + ' / ' + c.className.slice(0, 50) : 'NO CELL' }, [p, d])
}
const readNote = async (w, t) => {
  const { page, TOUCH } = w
  const found = await page.locator('[data-testid="sync-clashes"]').count()
  if (!found) return { found: 0 }
  if (TOUCH) {
    if ((await page.locator('[data-testid="clash-line"]').getAttribute('aria-expanded')) !== 'true') { await t.press('[data-testid="clash-line"]'); await page.waitForTimeout(400) }
    return page.evaluate(() => ({ found: 1, head: document.querySelector('[data-testid="clash-line"]').innerText.replace(/\s+/g, ' ').trim(), rows: [...document.querySelectorAll('[data-testid^="clash-row-"]')].map(r => ({ who: r.querySelector('.clash-who').innerText.trim(), day: r.querySelector('.clash-day').innerText.trim(), what: r.querySelector('.clash-what').innerText.trim(), do: r.querySelector('.clash-do').innerText.trim(), whoX: Math.round(r.querySelector('.clash-who').getBoundingClientRect().left), dayX: Math.round(r.querySelector('.clash-day').getBoundingClientRect().left), doX: Math.round(r.querySelector('.clash-do').getBoundingClientRect().left) })) }))
  }
  return page.evaluate(() => ({ found: 1, head: document.querySelector('[data-testid="sync-clashes"] .n').innerText.trim(), rows: [...document.querySelectorAll('[data-testid="sync-clashes"] .row')].map(r => ({ text: r.innerText.replace(/\s+/g, ' ').trim(), who: r.querySelector('b').innerText.trim() })) }))
}
const clashPic = async (w, t, name) => { await w.page.locator('[data-testid="sync-clashes"]').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await w.page.waitForTimeout(300); return t.shot(name) }

// the project's own clash fixture (e2e twoClashes): Saturday 18 Jul 26 published with the men on a programme row; a bid from the war on that day then clashes
const DAY = '2026-07-18'
async function fixtureDay(page, ids) {
  await page.evaluate(ids => {
    const W = window, di = 5
    W.DAYS[di].ground.push({ prog: 'Range brief', str: '09:00', end: '12:00', who: '', rmks: '' }); W.afterSchedMutate()
    for (const id of ids) { W.fillSlot(`g:${di}.${W.DAYS[di].ground.length - 1}.+`, id); W.afterSchedMutate() }
    const g = W.signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    W.setDayApproved(di, true); W.afterSchedMutate()
    if (W.clearToast) W.clearToast()
  }, ids)
}
// a bid on a day through the one-day sheet (answering the below-zero ask)
async function bid(w, t, p, d) {
  const { page } = w
  await page.locator(cellId(p, d)).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
  await t.press(cellId(p, d)); await page.waitForTimeout(400)
  await t.press('[data-testid="bid-LL"]'); await page.waitForTimeout(500)
  if (await page.locator('[data-testid="bid-picker"]').count()) { await t.press('[data-testid="bid-LL"]'); await page.waitForTimeout(500) }
  if (await page.locator('[data-testid="bid-picker"]').count()) await t.press('[data-testid="bid-cancel"]')
  await page.waitForTimeout(400)
  return page.evaluate(([p, d]) => { const c = document.querySelector(`[data-testid="cell-${p}-${d}"]`); return c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : 'NO CELL' }, [p, d])
}
// tap the first row of the note and say where it went
async function tapNote(w, t) {
  const { page, TOUCH } = w
  const sel = TOUCH ? '[data-testid="clash-row-0"]' : '[data-testid="clash-go-0"]'
  await page.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250)
  await t.press(sel); await page.waitForTimeout(900)
  return page.evaluate(() => {
    const vis = e => e && e.getBoundingClientRect().width > 0
    const day = document.querySelector('[data-testid="daylist-sheet"]'), one = document.querySelector('[data-testid="bid-picker"]'), win = [...document.querySelectorAll('[role=dialog]')].filter(vis)
    return { dayList: day ? day.innerText.replace(/\s+/g, ' ').slice(0, 120) : null, oneDay: one ? one.innerText.replace(/\s+/g, ' ').slice(0, 120) : null, dialogs: win.map(d => (d.getAttribute('data-testid') || d.id || d.className) + ': ' + d.innerText.replace(/\s+/g, ' ').slice(0, 100)), page: window.CURPAGE }
  })
}

// ---------------- 33 a SANS man with Show SANS off
await scenario('33', async (w, t, rec) => {
  const { page } = w
  const S = 'vinci', SCS = 'Zenith'
  await fixtureDay(page, [S, 'pump'])
  await t.lw('JUL')
  await setSans(w, t, true)
  const row = await page.locator(`tr[data-testid="row-${S}"]`).count()
  const cell = await bid(w, t, S, DAY)
  const noteOn = await readNote(w, t)
  console.log('  Show SANS on: Zenith row drawn', row, '; his 18 Jul cell:', cell, '; note', JSON.stringify(noteOn))
  const wentOn = await tapNote(w, t)
  await t.shot('after-tap-sans-on')
  rec('33-tap-sans-on', ok(!!wentOn.dayList), `Show SANS ON, tapping the note's first row went to: ${JSON.stringify(wentOn)}`, `w2-s33-${WHICH}-after-tap-sans-on.png`)
  if (await page.locator('[data-testid="daylist-sheet"]').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
  if (await page.locator('[data-testid="daylist-sheet"]').count()) await page.mouse.click(4, 4)
  await page.waitForTimeout(300)
  await setSans(w, t, false)
  const rowOff = await page.locator(`tr[data-testid="row-${S}"]`).count()
  await page.waitForTimeout(800)
  const note = await readNote(w, t)
  console.log('  Show SANS off: note', JSON.stringify(note))
  if (note.found) await clashPic(w, t, 'note')
  rec('33-setup', rowOff === 0 && note.found ? 'OK' : 'NOT WALKED', `Show SANS on: Zenith row ${row}, cell "${cell}", note found ${noteOn.found}; Show SANS off: Zenith row ${rowOff}; note found ${note.found}; rows ${JSON.stringify(note.rows)}`)
  if (note.found) {
    const names = (note.rows || []).map(r => r.who)
    rec('33-name', ok(names.includes(SCS) && !names.includes(S)), `names in the note: ${JSON.stringify(names)}; head "${note.head}"`, `w2-s33-${WHICH}-note.png`)
    if (WHICH === 'phone' && note.rows.length > 1) {
      const xs = note.rows.map(r => [r.whoX, r.dayX, r.doX]); const same = xs.every(x => x.join() === xs[0].join())
      rec('33-columns', ok(same), `list columns (who, day, instruction left edges): ${JSON.stringify(xs)}`)
    }
    const went = await tapNote(w, t)
    console.log('  tapped the note row:', JSON.stringify(went))
    await t.shot('after-tap')
    rec('33-tap', ok(!!went.dayList), `tapping the first row (${WHICH === 'phone' ? 'its whole row' : 'its link'}) went to: ${JSON.stringify(went)}`, `w2-s33-${WHICH}-after-tap.png`)
  }
})

// ---------------- 34 an archived man
await scenario('34', async (w, t, rec) => {
  const { page } = w
  const A = 'pump', ACS = 'Piston'
  await fixtureDay(page, [A, 'stiff'])
  await t.lw('JUL')
  const cellA = await bid(w, t, A, DAY), cellB = await bid(w, t, 'stiff', DAY)
  const before = await readNote(w, t)
  console.log('  Piston/Saber 18 Jul cells', cellA, cellB, '; note before archive', JSON.stringify(before))
  await t.adminUsers()
  await page.fill('#accFind', ACS); await page.waitForTimeout(300)
  await t.press(`#accList .acc-main:has-text("${ACS}")`); await t.press('#accEdArchive'); await page.waitForTimeout(600)
  await t.lw('JUL')
  const rowNow = await page.locator(`tr[data-testid="row-${A}"]`).count()
  const note = await readNote(w, t)
  console.log('  note after archive', JSON.stringify(note))
  if (note.found) await clashPic(w, t, 'note-archived')
  if (note.found) { const went = await tapNote(w, t); await t.shot('after-tap'); rec('34-tap', ok(!!went.dayList), `tapping the archived man's row went to: ${JSON.stringify(went)}`, `w2-s34-${WHICH}-after-tap.png`) }
  if (await page.locator('[data-testid="daylist-sheet"]').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
  if (await page.locator('[data-testid="daylist-sheet"]').count()) { await t.press('[data-testid="daylist-sheet"] button.x'); await page.waitForTimeout(300) }
  await t.press('[data-testid="month-NOV"]'); await page.waitForTimeout(900)
  const rowNov = await page.locator(`tr[data-testid="row-${A}"]`).count()
  const noteNov = await readNote(w, t)
  const namesNov = (noteNov.rows || []).map(r => r.who)
  await clashPic(w, t, 'note-nov')
  rec('34-name-nov-view', rowNov === 0 ? ok(namesNov.includes(ACS) && !namesNov.includes(A)) : 'NOT WALKED', `Nov view (Piston drawn ${rowNov}): names ${JSON.stringify(namesNov)}`, `w2-s34-${WHICH}-note-nov.png`)
  if (WHICH === 'phone' && noteNov.rows && noteNov.rows.length > 1) { const xs = noteNov.rows.map(r => [r.whoX, r.dayX, r.doX]); rec('34-columns', ok(xs.every(x => x.join() === xs[0].join())), `list columns (who, day, instruction left edges): ${JSON.stringify(xs)}`) }
  rec('34-setup', before.found ? 'OK' : 'NOT WALKED', `before the archive the note found ${before.found}: ${JSON.stringify(before.rows)}`)
  const names = (note.rows || []).map(r => r.who)
  rec('34-name', note.found ? ok(names.includes(ACS) && !names.includes(A)) : 'FAIL', `after archiving Piston (his row drawn ${rowNow} in Jul): note found ${note.found}; names ${JSON.stringify(names)}`, note.found ? `w2-s34-${WHICH}-note-archived.png` : '')
})

writeFileSync(join(OUT, `w2d-${WHICH}.json`), JSON.stringify({ allResults }, null, 1))
console.log('\nDONE')
