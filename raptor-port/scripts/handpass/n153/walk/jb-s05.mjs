// jb-s05 v1 - S5, and the Import door of S28. The operating system's file picker cannot be driven, so the file is handed in by
// the app's own test door (window.__pickOpenForTests, the smoke suite's): it replaces the picker only, every later step is a press.
// The file is a real export of 142 taken by the app's own Export on the desktop and kept in the scratch folder for the phone.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, press, facts, ask, state, addEvent, hasEv } from './jlib.mjs'
import { dress, fp, short, wait, onSeed, vclick, reload } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
const tag = `s05-${SZ}`
console.log('jb-s05 v1', SZ)
picsFor(tag)
const FILE = `${process.env.MQ_OUT}/jb-export-142.json`
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 1000) }
async function tryPick(s, unit) {
  const { page } = s
  try {
    if (s.desk) await page.locator('#sqnMenuBtn').filter({ visible: true }).first().click({ timeout: 1500 })
    else { await page.locator('#burger').filter({ visible: true }).first().tap({ timeout: 1500 }); await wait(s, 300); if (!(await page.locator('#drawerSqnList').count())) await page.locator('#drawerSqnBtn').tap({ timeout: 1500 }) }
    await wait(s, 200)
    const row = page.locator(s.desk ? '#sqnMenu .sqm-row' : '#drawerSqnList .sqm-row', { has: page.locator('.sqm-num', { hasText: new RegExp(`^${unit}$`) }) }).first()
    if (s.desk) await row.click({ timeout: 1500 }); else await row.tap({ timeout: 1500 })
    await wait(s, 500); return 'pressed'
  } catch { return 'covered' }
}
async function tryKeys(s, unit) {
  const { page } = s
  const at = () => page.evaluate(() => document.activeElement?.id || '')
  let got = false
  for (let i = 0; i < 60; i++) { await page.keyboard.press('Tab'); if ((await at()) === 'sqnMenuBtn') { got = true; break } }
  if (!got) return `keys never reach the squadron button (focus on ${await at()})`
  await page.keyboard.press('Enter'); await wait(s, 300)
  const num = () => page.evaluate(() => document.activeElement?.closest?.('.sqm-row')?.querySelector('.sqm-num')?.textContent?.trim() || '')
  for (let i = 0; i < 6 && (await num()) !== unit; i++) { await page.keyboard.press('ArrowDown'); await wait(s, 80) }
  if ((await num()) !== unit) return 'keys never reached the row'
  await page.keyboard.press('Enter'); await wait(s, 700); return 'pressed by keys'
}
const hand = (s, text) => s.page.evaluate(t => { window.__pickOpenForTests = async () => ({ text: t, name: 'jb-export-142.json' }) }, text)
const importDoor = async s => { await vclick(s, '#fileMenuBtn'); await wait(s, 200); await vclick(s, '#importFileBtn'); await wait(s, 600) }
async function clear(s) { for (let i = 0; i < 8; i++) { const q = await ask(s); if (!q.msg) return; const b = q.btns.find(x => /Skip|Cancel/.test(x)) || q.btns.find(x => /dlgOk/.test(x)) || q.btns[0]; await press(s, '#' + b.split(':')[0]); await wait(s, 350) } }
const both = async (s, label, a, b) => {
  if (!(await fp(s)).sq?.startsWith('142')) await to(s, '142')
  const x = await onSeed(s); check(`${label}: 142 keeps its marks (${a})`, x.done === a && (x.courses || []).includes('JB142') && !(x.courses || []).includes('JB149'), short(x))
  await to(s, '149'); const y = await onSeed(s); check(`${label}: 149 untouched (${b})`, y.done === b && (y.courses || []).includes('JB149') && !(y.courses || []).includes('JB142'), short(y))
  await to(s, '142'); await onSeed(s)
}
try {
  const s = await newPage(SZ, { acceptDownloads: true }); const { page } = s
  await signIn(s, 'ad', 'a')
  await dress(s, '142', ['ST-01', 'ACG-01']); await to(s, '149'); await dress(s, '149', ['ST-01']); await to(s, '142'); await onSeed(s)
  let text = existsSync(FILE) ? readFileSync(FILE, 'utf8') : null
  if (!text) await step('take a real export of 142', async () => {
    /* Chromium's own save picker cannot be driven: without it the app saves by the browser's ordinary download, as on an iPhone */
    await page.evaluate(() => { window.showSaveFilePicker = undefined })
    await vclick(s, '#fileMenuBtn'); await vclick(s, '#exportBtn'); await wait(s, 350); await pic(s, 'a0-export-window')
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }), page.locator('#copyOk').click()])
    const p = await dl.path(); text = readFileSync(p, 'utf8'); writeFileSync(FILE, text); note('export file', dl.suggestedFilename(), text.length, 'characters')
    await wait(s, 500); await clear(s)
  })
  if (!text) { note('NOT WALKED S5: no export file'); throw new Error('no file') }
  await hand(s, text)
  await step('a pick at the Replace question, then its late answer', async () => {
    await importDoor(s); const q = await ask(s); note('after the file:', JSON.stringify(q.msg), JSON.stringify(q.btns)); await pic(s, 'b1-question')
    check('the import reached its question', /already exists/.test(q.msg || ''), q.msg)
    let r = await tryPick(s, '149'); note('pick by the size\'s door:', r); await pic(s, 'b2-after-door')
    if (r !== 'pressed' && s.desk) { if ((await state(s)).drawerOpen) await shut(s); r = await tryKeys(s, '149'); note('pick by keys:', r); await pic(s, 'b3-after-keys') }
    const f = await fp(s); const q2 = await ask(s); note('now on', f.sq, 'question', JSON.stringify(q2.msg), JSON.stringify(q2.btns))
    facts['s5-door'] = r
    if ((f.sq || '').startsWith('149')) {
      check('moved: the old question is gone', !q2.msg, q2.msg)
      if (q2.msg) { await press(s, '#dlgOk', 'b4-late-replace'); await wait(s, 900); await pic(s, 'b4-after-late-replace'); await clear(s) }
      await wait(s, 500); const g = await onSeed(s); check('moved: nothing imported into 149', g.done === 1 && (g.courses || []).includes('JB149') && !(g.courses || []).includes('JB142'), short(g))
      await to(s, '142')
    } else { note('RECORD: the pick cannot be made while the import asks'); await clear(s) }
    await both(s, 'after the interrupted import', 2, 1)
  })
  await step('Skip every question', async () => {
    await importDoor(s); await clear(s); await wait(s, 500); await clear(s); await pic(s, 'c1-after-skip')
    await both(s, 'after Skip', 2, 1)
  })
  await step('Discard door: a draft, Cancel', async () => {
    await onSeed(s); check('draft', await addEvent(s, 'JB-S5A'), 'JB-S5A')
    await importDoor(s); const q = await ask(s); note('with a draft:', JSON.stringify(q.msg), JSON.stringify(q.btns)); await pic(s, 'd1-discard-asked')
    check('the door asks about the draft after the file', /Discard them and bring the file in/.test(q.msg || ''), q.msg)
    await press(s, '#dlgCancel', 'd2-cancel'); await wait(s, 500)
    const f = await fp(s); check('Cancel keeps the draft', f.dirty && await hasEv(s, 'JB-S5A'), short(f)); await pic(s, 'd2-kept')
  })
  await step('Discard door: OK, then Skip', async () => {
    await importDoor(s); const q = await ask(s); note('again:', JSON.stringify(q.msg))
    await press(s, '#dlgOk', 'e1-discard'); await wait(s, 600); await pic(s, 'e1-next-question'); await clear(s); await wait(s, 500); await clear(s)
    const f = await fp(s); check('Discard drops the draft though the import brought nothing', !f.dirty && !(await hasEv(s, 'JB-S5A')), short(f)); await pic(s, 'e2-after')
    await both(s, 'after the Discard door', 2, 1)
  })
  await step('a completed import stays in 142, and a reload agrees', async () => {
    await importDoor(s); let n = 0
    for (let i = 0; i < 8; i++) {
      const q = await ask(s); if (!q.msg) break
      const rep = q.btns.find(b => /Replace/.test(b)); const id = rep ? rep.split(':')[0] : (q.btns.find(b => /dlgOk/.test(b)) || q.btns[0]).split(':')[0]
      if (n < 1 || !rep) await press(s, '#' + id); else await press(s, '#' + (q.btns.find(b => /Skip/.test(b)) || q.btns[0]).split(':')[0])
      if (rep) n++; await wait(s, 500)
    }
    await pic(s, 'f1-imported'); await wait(s, 600)
    const x = await onSeed(s); note('142 after import', short(x)); check('142 still has its course list', (x.courses || []).includes('JB142'), short(x))
    await to(s, '149'); const y = await onSeed(s); check('149 not reached by the import', y.done === 1 && !(y.courses || []).includes('JB142'), short(y)); await pic(s, 'f2-149')
    await reload(s); await to(s, '149'); const z = await onSeed(s); check('after a reload 149 is still its own', z.done === 1 && !(z.courses || []).includes('JB142'), short(z))
  })
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
