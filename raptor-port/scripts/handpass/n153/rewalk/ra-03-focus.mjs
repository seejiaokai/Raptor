// ra-03 - 1536, the keyboard: where the focus stands when "Save them before switching to 149?" opens after a keyboard pick, with no
// press held (HELD=0) and with a mouse press held on a bend handle (HELD=1), and where each Tab then takes it. Read only.
import { signIn, closeAll, finish, picsFor, pic, step, mk, go, T, log, ask, addEvent, arrange, check } from './rlib.mjs'
import { ready, hold, pickHeld, shot } from './ra-lib.mjs'
console.log('ra-03-focus v1', process.env.MQ_PORT)
const dir0 = picsFor('ra-03')
const at = s => s.page.evaluate(() => { const a = document.activeElement; if (!a) return null; const inQ = !!a.closest?.('#dlgModal'); const r = a.getBoundingClientRect(); return `${a.tagName}#${a.id || ''}${inQ ? ' [in the question]' : ''} "${(a.textContent || '').trim().slice(0, 18)}" ${Math.round(r.width)}x${Math.round(r.height)}` })
for (const held of [0, 1, 2]) await step('held ' + held, async () => {
  const s = await mk('d'); const { page } = s
  await signIn(s, 'ad', 'a'); await go(s, 'tracker'); await page.waitForTimeout(1800)
  await addEvent(s, 'RAF' + held)
  await arrange(s, true); await page.waitForTimeout(300)
  let h = null
  if (held === 1) { const g = await ready(s, 'bend'); h = await hold(s, g.x, g.y); await h.move(g.x + 40, g.y + 30) }
  const how = await pickHeld(s, '149'); log('held', held, 'pick', how)
  log('held', held, 'question', (await ask(s)).msg)
  await page.waitForTimeout(400)
  log('held', held, 'focus when it opened', await at(s))
  await shot(s, dir0, `h${held}-01-question`)
  if (held === 2) {   /* Enter, with the focus where the pick left it */
    await page.keyboard.press('Enter'); await page.waitForTimeout(350)
    const r = await page.evaluate(() => { const m = document.getElementById('sqnMenu'); const b = m && m.getBoundingClientRect(); const q = document.getElementById('dlgModal')?.getBoundingClientRect(); return { listOpen: !!m && b.width > 1, list: b ? [b.left, b.top, b.right, b.bottom].map(Math.round) : null, question: q ? [q.left, q.top, q.right, q.bottom].map(Math.round) : null, top: (() => { if (!b) return null; const t = document.elementFromPoint(b.left + b.width / 2, b.top + 40); return t ? t.tagName + '#' + t.id + '.' + t.className : null })() } })
    log('Enter on the focus the pick left, with the question up', r, 'question still', (await ask(s)).msg)
    await shot(s, dir0, 'h2-02-enter'); await s.ctx.close(); return
  }
  const trail = []
  for (let i = 0; i < 60; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(30); const a = await at(s); trail.push(a); if (/in the question/.test(a || '')) break }
  log('held', held, 'Tabs to the question', trail.length, trail.slice(0, 3), '...', trail.slice(-2))
  check(`held ${held}: Tab reaches the question's buttons`, trail.some(t => /in the question/.test(t || '')), trail.length)
  await shot(s, dir0, `h${held}-02-after-tabs`)
  if (h) await h.up()
  await s.ctx.close()
})
finish('ra-03'); await closeAll()
