// jb-s26 v1 - S26 and a person's own move at midnight. ONE allowed storage write: the SETUP of the dated move (msq-rs-lib's
// world/moves; no screen saves one), told in the report. The clock is the page's own, run past midnight by clockTo.
// CASES: plain-clean, plain-dirty, plain-lw (Hunter stays on 142, the Tracker or Leave War open across midnight) and
// move-clean, move-dirty, move-editor (Hunter's own move 142 -> 149 dated the next day).
import { world, clockTo, signIn as rsIn, signOut as rsOut, U142, U149, errors } from '../../msq/msq-rs-lib.mjs'
import { note, pic, picsFor, pickSq, shut, step, check, press, facts, go, state, ask, addEvent, hasEv, finish } from './jlib.mjs'
import { dress, fp, short, wait, onSeed, vclick, head, holdWords, mark } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
const CASES = (process.env.CASES || 'plain-clean,plain-dirty,plain-lw,move-clean,move-dirty,move-editor').split(',')
const tag = `s26-${SZ}${process.env.CASES ? '-' + CASES.join('-') : ''}`
console.log('jb-s26 v1', SZ, CASES.join(','))
picsFor(tag)
const ORIGIN = `http://localhost:${process.env.MQ_PORT}`
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 1000) }
const NOW = '2026-07-15T23:30:00', PAST = '2026-07-16T00:01:00'
const bands = s => s.page.evaluate(() => [...document.querySelectorAll('.saveband, .moveband')].filter(e => e.getBoundingClientRect().width > 2).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
const trkHead = s => s.page.evaluate(() => { const p = document.querySelector('#page-tracker'); return p ? p.innerText.replace(/\s+/g, ' ').trim().slice(0, 150) : null })
const doneDate = async s => {
  const { page } = s
  const b = page.locator('#page-tracker g.ball[data-id="ST-06"]').first()
  await b.scrollIntoViewIfNeeded().catch(() => {}); await wait(s, 120); const r = await b.boundingBox()
  if (s.desk) await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2); else await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2)
  await page.waitForSelector('#pop', { state: 'visible', timeout: 2500 }); await wait(s, 200)
  const v = await page.evaluate(() => { const e = document.querySelector('#popDoneDate'); if (!e) return null; const i = e.matches?.('input') ? e : e.querySelector('input'); return i ? i.value : e.textContent.trim() })
  const c = page.locator('#pop .opts button', { hasText: /^Close$/ }).first(); await (s.desk ? c.click() : c.tap()); await wait(s, 200)
  return v
}
async function build(kind) {
  const moves = kind.startsWith('move') ? [{ pid: 'prowler', from: U142, to: U149, day: '2026-07-16' }] : []
  const w = await world({ origin: ORIGIN, size: SZ === 'p' ? 'p' : 'd', now: NOW, moves })
  const s = { page: w.page, ctx: w.ctx, sz: SZ, desk: SZ !== 'p', w }
  await rsIn(w, 'ad'); await s.page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' }).catch(() => {})
  await dress(s, '142', ['ST-01', 'ACG-01']); await to(s, '149'); await dress(s, '149', ['ST-01'])
  await rsOut(w); await rsIn(w, 'ad2')
  await s.page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' }).catch(() => {})
  return s
}
const readBack = async (s, label) => {
  const a = await fp(s); note(`${label} now: ${short(a)}; bands ${JSON.stringify(await bands(s))}`)
  return a
}
try {
  for (const c of CASES) await step(c, async () => {
    const s = await build(c); const { page, w } = s
    await go(s, 'tracker'); await wait(s, 1200); await onSeed(s)
    const before = await fp(s); note(`${c} before midnight: ${short(before)}`)
    let dn0 = null
    if (c !== 'move-editor') { dn0 = await doneDate(s); note('Done-on before midnight', dn0) }
    if (c.endsWith('dirty') || c === 'move-editor') check(`${c}: draft made`, await addEvent(s, 'JB-MID'), 'JB-MID')
    if (c === 'move-editor') {
      await vclick(s, '#sylMenuBtn'); await vclick(s, '#arrangeBtn'); await wait(s, 300)
      const e = page.locator('#arrTools #editSyl'); if (!(await e.isVisible())) await page.locator('#page-tracker button', { hasText: 'Tools ▾' }).first().click()
      await page.locator('#editSyl').first().click(); await wait(s, 400); await pic(s, `${c}-1-editor-open`)
    }
    if (c === 'plain-lw') { await go(s, 'leavewar'); await wait(s, 1500) }
    await pic(s, `${c}-2-before`)
    const tb = c === 'plain-lw' ? await page.evaluate(() => [...document.querySelectorAll('[class*=today]')].filter(e => e.getBoundingClientRect().width > 0).slice(0, 4).map(e => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 24))) : null
    if (tb) note('Leave War today marks before', JSON.stringify(tb))
    await clockTo(w, PAST); await wait(s, 1200)
    await pic(s, `${c}-3-after-midnight`)
    const st = await state(s); note(`${c} after midnight: page ${st.page} bar ${st.barMark || st.dMark} tabs ${JSON.stringify(st.tabs)}`)
    note('words', JSON.stringify(await holdWords(s)), 'bands', JSON.stringify(await bands(s)), 'ask', JSON.stringify((await ask(s)).msg))
    if (c === 'plain-lw') {
      const ta = await page.evaluate(() => [...document.querySelectorAll('[class*=today]')].filter(e => e.getBoundingClientRect().width > 0).slice(0, 4).map(e => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 24)))
      note('Leave War today marks after', JSON.stringify(ta)); facts['lw-today'] = { before: tb, after: ta }
      await go(s, 'tracker'); await wait(s, 900); const f = await onSeed(s); check('plain-lw: 142 Tracker its own after midnight', f.sq === '142' && f.done === 2, short(f))
      const dn = await doneDate(s); note('Done-on after midnight', dn)
    } else if (c.startsWith('plain')) {
      const f = await fp(s); check(`${c}: Tracker on 142, marks kept`, (f.sq || '').startsWith('142') && f.done === 2, short(f))
      if (c === 'plain-dirty') check('plain-dirty: draft kept across midnight', f.dirty && await hasEv(s, 'JB-MID'), short(f))
      const dn = await doneDate(s).catch(e => 'pop failed ' + String(e).split('\n')[0]); note('Done-on after midnight', dn)
      check(`${c}: a mark's day has moved to the new day`, !!dn && dn !== dn0, { dn0, dn })
    } else {
      // his own move
      await readBack(s, `${c} tracker`)
      if (c === 'move-editor') {
        const open = await page.locator('#sylModal').filter({ visible: true }).count(); note('editor still open after midnight:', open)
        if (open) { await vclick(s, '#sylCancel').catch(() => {}); await wait(s, 500); await pic(s, `${c}-4-editor-closed`); const q = await ask(s); note('after closing the editor: ask', JSON.stringify(q.msg)); if (q.msg) { await pic(s, `${c}-4b-asked`); await press(s, '#dlgCancel'); await wait(s, 400) } }
        await readBack(s, `${c} after closing the editor`)
        note('layout mode', await page.locator('#arrTools').filter({ visible: true }).count())
        if (await page.locator('#arrTools').filter({ visible: true }).count()) { await vclick(s, '#sylMenuBtn').catch(() => {}); await vclick(s, '#arrangeBtn').catch(() => {}); await wait(s, 600); await pic(s, `${c}-5-layout-closed`); await readBack(s, `${c} after closing layout mode`) }
      }
      if (c === 'move-dirty' || c === 'move-editor') {
        const hasSave = await page.locator('#saveChanges').filter({ visible: true }).count()
        note('Save changes drawn:', hasSave)
        if (hasSave) {
          await page.locator('#saveChanges').filter({ visible: true }).first().click(); await wait(s, 700)
          const t = await page.evaluate(() => document.querySelector('#toastEl')?.textContent?.trim() || '')
          note('press Save: note', JSON.stringify(t), 'bands', JSON.stringify(await bands(s)), 'ask', JSON.stringify((await ask(s)).msg)); await pic(s, `${c}-6-after-save-press`)
          const q = await ask(s); if (q.msg) { await press(s, '#dlgCancel'); await wait(s, 300) }
        }
      }
      const a1 = await fp(s); note(`${c} ends on`, short(a1), 'head', (await trkHead(s) || '').slice(0, 120))
      // both read back as Saber: the truth in the store
      await page.keyboard.press('Escape').catch(() => {})
      await rsOut(w).catch(async e => { note('sign out said', String(e).split('\n')[0]); const q = await ask(s); note('ask', JSON.stringify(q.msg)); if (q.msg) { await press(s, '#dlgAlt'); await wait(s, 800) } })
      await page.waitForSelector('#luser', { timeout: 8000 }); await rsIn(w, 'ad')
      const b142 = await onSeed(s); check(`${c}: 142 keeps its two marks`, b142.done === 2 && !(await hasEv(s, 'JB-MID')), short(b142))
      await to(s, '149'); const b149 = await onSeed(s); check(`${c}: 149 keeps its one mark and no draft of 142`, b149.done === 1 && !(await hasEv(s, 'JB-MID')), short(b149))
      await pic(s, `${c}-7-saber-149`)
    }
    const e = await errors(w); note('errors', JSON.stringify(e.console.slice(0, 3)))
    await w.browser.close().catch(() => {})
  })
} finally { finish(tag) }
