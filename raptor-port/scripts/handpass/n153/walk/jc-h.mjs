// jc-h - a follow-up of S31 H: Hunter, holding Plan of 149, made a Member by the Role box alone. What his bell and his squadron list say, and what one Undo brings back.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, as, state } from './jlib.mjs'
import { toast, tips, who, editRow, saveRow, toUsers, doUndo, bell } from './jc-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-h v1', SZ)
picsFor('jc-h-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
const list = async s => { if (s.desk) { const b = s.page.locator('#sqnMenuBtn'); if (!(await b.count())) return null; await b.click(); await s.page.waitForTimeout(220); const l = await s.page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-num')].map(e => e.textContent.trim())); await s.page.keyboard.press('Escape'); return l } const st = await state(s); return { barBtn: st.barBtn } }
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a'); await toUsers(s)
  await step('Hunter made a Member, Plan of 149 held', async () => {
    await editRow(s, 'prowler', [{ line: ['149', 'plan'] }]); await saveRow(s); await page.waitForTimeout(200)
    await editRow(s, 'prowler', [{ role: 'main' }]); await saveRow(s); await page.waitForTimeout(200)
    const w = await who(s, 'prowler', ['149']); rec('after the Save', w); rec('Undo hover', (await tips(s)).undo?.title)
    await as(s, 'ad2', 'a2'); await bell.open(s); const L = await bell.lines(s); rec('Hunter bell after being made a Member', L); await pic(s, 'h1-bell'); await bell.close(s)
    rec('Hunter squadron list', await list(s))
    check('his bell tells him the Plan ended', L.some(x => /Plan of 149 ended/.test(x)), L.filter(x => /149/.test(x)))
  })
  await s.ctx.close()
} finally { finish('jc-h-' + SZ); await closeAll() }
