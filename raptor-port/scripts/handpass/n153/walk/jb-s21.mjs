// jb-s21 v1 - S21: every Tracker window left open at a pick. For each window: opened on 142 by presses, a pick of 149 tried by
// the size's own door; whether the pick was possible, what survives on 149, and whether anything left open can still write.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, press, facts, go, state, ask } from './jlib.mjs'
import { dress, fp, short, wait, onSeed, mark, vclick } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
const ONLY = process.env.ONLY || ''
console.log('jb-s21 v1', SZ, ONLY)
const tag = `s21-${SZ}${ONLY ? '-' + ONLY : ''}`
picsFor(tag)
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 1000) }
const WINS = ['#pop', '#infoModal', '#editModal', '#sylModal', '#ordModal', '#copyModal', '#trkFlexWin', '#dlgModal', '#arrTools', '[data-testid="trk-showall"]', '.showall', '#lullModal']
const open = s => s.page.evaluate(ws => ws.filter(w => { const e = document.querySelector(w); if (!e) return false; const b = e.getBoundingClientRect(); const c = getComputedStyle(e); return b.width > 2 && b.height > 2 && c.visibility !== 'hidden' && c.display !== 'none' }), WINS)
const anyTop = s => s.page.evaluate(() => { const e = document.elementFromPoint(innerWidth / 2, innerHeight / 2); return e ? (e.closest('[role=dialog],.modal,.pop,.tflexwin')?.id || e.closest('[role=dialog],.modal,.pop,.tflexwin')?.className || '') : '' })
async function tryPick(s, unit) {
  const { page } = s
  try {
    if (s.desk) await page.locator('#sqnMenuBtn').filter({ visible: true }).first().click({ timeout: 1500 })
    else {
      await page.locator('#burger').filter({ visible: true }).first().tap({ timeout: 1500 }); await wait(s, 300)
      if (!(await page.locator('#drawerSqnList').count())) await page.locator('#drawerSqnBtn').tap({ timeout: 1500 })
    }
    await wait(s, 200)
    const row = page.locator(s.desk ? '#sqnMenu .sqm-row' : '#drawerSqnList .sqm-row', { has: page.locator('.sqm-num', { hasText: new RegExp(`^${unit}$`) }) }).first()
    if (!(await row.count())) return 'no row'
    if (s.desk) await row.click({ timeout: 1500 }); else await row.tap({ timeout: 1500 })
    await wait(s, 500)
    return 'pressed'
  } catch (e) { return 'covered: ' + String(e).split('\n').find(l => /intercepts|Timeout/.test(l))?.trim().slice(0, 100) }
}
/* the keys' door: Tab to the squadron button, Enter, the arrows to the row, Enter */
async function tryKeys(s, unit) {
  const { page } = s
  const at = () => page.evaluate(() => { const a = document.activeElement; return a ? (a.id || (a.className && String(a.className).slice(0, 24)) || a.tagName) : '' })
  let got = false
  for (let i = 0; i < 70; i++) { await page.keyboard.press('Tab'); if ((await at()) === 'sqnMenuBtn') { got = true; break } }
  if (!got) return `keys never reach the squadron button (focus ends on ${await at()})`
  await page.keyboard.press('Enter'); await wait(s, 300)
  const rowNum = () => page.evaluate(() => document.activeElement?.closest?.('.sqm-row')?.querySelector('.sqm-num')?.textContent?.trim() || '')
  for (let i = 0; i < 6 && (await rowNum()) !== unit; i++) { await page.keyboard.press('ArrowDown'); await wait(s, 80) }
  if ((await rowNum()) !== unit) return `keys opened the list but never reached ${unit} (focus ${await at()})`
  await page.keyboard.press('Enter'); await wait(s, 600)
  return 'pressed by keys'
}
const topNow = s => s.page.evaluate(() => { const e = document.elementFromPoint(innerWidth / 2, innerHeight / 2); if (!e) return null; const w = e.closest('[role=dialog],.modal,.pop,.tflexwin,.overlay'); return w ? `${w.id || ''}.${String(w.className).slice(0, 30)}` : `${e.tagName}.${String(e.className).slice(0, 24)}` })
async function closeUp(s) {
  const { page } = s
  for (const sel of ['#dlgCancel', '#edCancel', '#sylCancel', '#ordCancel', '#copyCancel', '[data-testid="trk-flex-x"]', '#ifCancel']) {
    const l = page.locator(sel).filter({ visible: true })
    if (await l.count()) { await l.first().click({ timeout: 1500 }).catch(() => {}); await wait(s, 200) }
  }
  const c = page.locator('#pop .opts button', { hasText: /^Close$/ })
  if (await c.filter({ visible: true }).count()) await c.first().click({ timeout: 1500 }).catch(() => {})
  await page.keyboard.press('Escape').catch(() => {}); await wait(s, 200)
  await page.keyboard.press('Escape').catch(() => {}); await wait(s, 200)
  if ((await state(s)).drawerOpen) await shut(s)
  if (await page.locator('#arrTools').filter({ visible: true }).count()) { await vclick(s, '#sylMenuBtn').catch(() => {}); await vclick(s, '#arrangeBtn').catch(() => {}); await wait(s, 300) }
  if (!s.desk) await page.locator('#page-tracker button', { hasText: /^\s*Flow chart\s*$/ }).filter({ visible: true }).first().tap({ timeout: 1500 }).catch(() => {})
}
const ball = async (s, id) => {
  const { page } = s; const b = page.locator(`#page-tracker g.ball[data-id="${id}"]`).first()
  await b.scrollIntoViewIfNeeded().catch(() => {}); await wait(s, 100); const r = await b.boundingBox()
  if (s.desk) await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2); else await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2)
  await page.waitForSelector('#pop .opts button', { state: 'visible', timeout: 2500 }); await wait(s, 150)
}
/* the phone's Tracker has three tabs of its own: Flow chart, Info (the students and lull controls), Show All */
const ptab = async (s, name) => {
  if (s.desk) return
  const b = s.page.locator('#page-tracker button', { hasText: new RegExp(`^\\s*${name}\\s*$`) }).filter({ visible: true }).first()
  if (await b.count()) { await b.tap({ timeout: 2000 }); await wait(s, 350) } else note('no phone tab', name)
}
const LIST = [
  ['grading', async s => { await ball(s, 'ACG-02') }, '#pop .opts button[data-g="marg"]'],
  ['details', async s => { await ball(s, 'ACG-02'); await vclick(s, '#popEditInfo'); await wait(s, 300) }, '#ifSave'],
  ['editevents', async s => { await vclick(s, '#sylMenuBtn'); await vclick(s, '#arrangeBtn'); await wait(s, 250); const e = s.page.locator('#arrTools #editSyl'); if (!(await e.isVisible())) await s.page.locator('#page-tracker button', { hasText: 'Tools ▾' }).first().click(); await s.page.locator('#editSyl').first().click(); await wait(s, 350) }, '#edSave'],
  ['layout', async s => { await vclick(s, '#sylMenuBtn'); await vclick(s, '#arrangeBtn'); await wait(s, 350) }, null],
  ['showall', async s => { if (s.desk) await vclick(s, '#showAllBtn'); else await ptab(s, 'Show All'); await wait(s, 350) }, null],
  ['reorderCrew', async s => { await ptab(s, 'Info'); await vclick(s, '#ordCrew'); await wait(s, 350) }, '#ordSave'],
  ['reorderCourses', async s => { await vclick(s, '#courseMenuBtn'); await vclick(s, '#ordCourse'); await wait(s, 350) }, '#ordSave'],
  ['export', async s => { await vclick(s, '#fileMenuBtn'); await vclick(s, '#exportBtn'); await wait(s, 350) }, '#copyOk'],
  ['lull', async s => { await ptab(s, 'Info'); await vclick(s, '#setLullBtn'); await wait(s, 350) }, '#dlgOk'],
  ['copylull', async s => { await ptab(s, 'Info'); await vclick(s, '#copyLullBtn'); await wait(s, 350) }, '#dlgOk'],
  ['flex', async s => { await vclick(s, '#flexBtn'); await wait(s, 350) }, '[data-testid="trk-flex-save"]'],
  ['failhist', async s => { await ptab(s, 'Info'); await vclick(s, '#failTitle'); await wait(s, 350) }, '#dlgOk'],
]
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await dress(s, '142', ['ST-01', 'ACG-01'])
  await to(s, '149'); await dress(s, '149', ['ST-01'])
  await to(s, '142'); await onSeed(s)
  const base = { a: 2, b: 1 }
  for (const [name, opener, writer] of LIST) {
    if (ONLY && !ONLY.split(',').includes(name)) continue
    await step(name, async () => {
      if ((await fp(s)).sq !== '142') await to(s, '142')
      await onSeed(s)
      await opener(s)
      const was = await open(s); note(`${name}: open ${JSON.stringify(was)}`); await pic(s, `${name}-1-open`)
      if (!was.length) note(`${name}: nothing opened`)
      note(`${name}: on top ${await topNow(s)}`)
      const r = process.env.KEYS ? await tryKeys(s, '149') : await tryPick(s, '149'); await wait(s, 500)
      const q = await ask(s); const st = await state(s); const now = await open(s)
      const f = await fp(s)
      const moved = (f.sq || '').startsWith('149')
      note(`${name}: pick ${r}; bar ${f.sq}; left open ${JSON.stringify(now)}; asked ${JSON.stringify(q.msg)}`); await pic(s, `${name}-2-after-pick`)
      facts[`s21:${name}`] = { r, sq: f.sq, was, now, asked: q.msg }
      if (q.msg) { await press(s, '#dlgCancel'); await wait(s, 300) }
      if (moved) {
        check(`${name}: no old window left open on 149`, !now.some(w => w !== '#arrTools' || name === 'layout'), now)
        const live = writer && await page.locator(writer).filter({ visible: true }).count()
        if (live) {
          note(`${name}: its write control is still on the screen on 149: pressing it`)
          await page.locator(writer).filter({ visible: true }).first().click({ timeout: 1500 }).catch(e => note('press failed', String(e).split('\n')[0]))
          await wait(s, 600); await pic(s, `${name}-3-pressed`)
        }
      }
      await closeUp(s); if ((await state(s)).drawerOpen) await shut(s)
      if (moved) {
        const b = await onSeed(s); check(`${name}: 149 unchanged (done ${base.b})`, b.sq === '149' && b.done === base.b && (b.courses || []).includes('JB149') && !(b.courses || []).includes('JB142'), short(b))
        await to(s, '142'); const c = await onSeed(s); check(`${name}: 142 unchanged (done ${base.a})`, c.done === base.a && !c.dirty, short(c))
      } else {
        const c = await onSeed(s); check(`${name}: still 142, unchanged`, c.sq === '142' && c.done === base.a, short(c))
        note(`${name}: pick not reachable while open`)
      }
    })
  }
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
