/* L-12 repeated once in a fresh world, with a longer trail: where the focus is after each of several Tabs from the
   day's last open box — on the week (Monday, then Wednesday) and on the Scheduler Board, desktop 1440x900. */
import * as K from './stk2-N-klib.mjs'
const { L, W, H } = K
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TYPING = '[data-txt],[data-bfld],[data-inp],[data-ifld],[data-itline],[data-bombs],[data-area],[data-atime]'
const { browser, p, errors } = await H.world({ who: 'a', phone: false })
await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="0"]'); await L.sleep(700)
const open = e => e.offsetParent !== null && ((e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement) ? !e.disabled && !e.readOnly : e.getAttribute('contenteditable') === 'true')
const focusDesc = () => p.evaluate(() => {
  const a = document.activeElement
  if (!a || a === document.body || a === document.documentElement) return 'NOTHING (the page body)'
  const r = a.getBoundingClientRect()
  const day = a.closest('.day')
  return `${a.tagName.toLowerCase()}${a.type ? ':' + a.type : ''} "${(a.innerText || a.value || a.getAttribute('aria-label') || a.title || '').replace(/\s+/g, ' ').trim().slice(0, 30)}" [${a.dataset.txt || a.dataset.inp || a.dataset.bfld || a.dataset.ifld || a.id || a.className.toString().slice(0, 20)}] day ${day ? day.dataset.day : '-'} ${a.closest('#schedBoard') ? 'in the board' : ''} at (${Math.round(r.left)},${Math.round(r.top)})`
})
async function lastBoxClick(scope, which = 'last') {
  const n = await p.evaluate(([sc, TY, w, fn]) => {
    const op = eval('(' + fn + ')')
    const root = document.querySelector(sc)
    const l = [...root.querySelectorAll(TY)].filter(op)
    document.querySelectorAll('[data-k12x]').forEach(x => x.removeAttribute('data-k12x'))
    const e = w === 'first' ? l[0] : l[l.length - 1]
    e.setAttribute('data-k12x', '1'); return l.length + ' open boxes, ' + w + ' is ' + (e.dataset.txt || e.dataset.inp || e.dataset.bfld || e.dataset.ifld)
  }, [scope, TYPING, which, open.toString()])
  const el = p.locator('[data-k12x="1"]').first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await K.sleep(250)
  const b = await el.boundingBox()
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await K.sleep(300)
  return n
}
const trail = async (k) => { const out = []; for (let i = 0; i < k; i++) { await p.keyboard.press('Tab'); await K.sleep(i === 0 ? 600 : 250); out.push(`Tab ${i + 1} -> ${await focusDesc()}`) } return out }
const pics = []
for (const di of [0, 2]) {
  const scope = `#eWeek .day[data-day="${di}"]`
  const info = await lastBoxClick(scope)
  const at0 = await focusDesc()
  const t = await trail(4)
  pics.push(await K.pic(p, `L12x-week-day${di}`))
  K.note('L-12', `x-week-day${di}`, `fresh world, Edit Schedule, ${DAYS[di]}, nothing changed: real click into the day's last open box (${info}), then Tab x4`, `last box: ${at0}; ${t.join('; ')}`, 'RECORD', [pics[pics.length - 1]])
  await p.evaluate(() => document.activeElement && document.activeElement.blur())
}
// the day's first box and Shift+Tab
{
  const info = await lastBoxClick('#eWeek .day[data-day="0"]', 'first')
  const at0 = await focusDesc()
  const out = []
  for (let i = 0; i < 3; i++) { await p.keyboard.press('Shift+Tab'); await K.sleep(400); out.push(`Shift+Tab ${i + 1} -> ${await focusDesc()}`) }
  K.note('L-12', 'x-week-shift', `Monday: click into the first open box (${info}), Shift+Tab x3`, `first box: ${at0}; ${out.join('; ')}`, 'RECORD', [])
}
await W.boardOn(p, 0); await L.sleep(700)
{
  const info = await lastBoxClick('#sbBoard')
  const at0 = await focusDesc()
  const t = await trail(4)
  pics.push(await K.pic(p, `L12x-board`))
  K.note('L-12', 'x-board', `fresh world, Scheduler Board Monday, nothing changed: real click into the last open box (${info}), Tab x4`, `last box: ${at0}; ${t.join('; ')}`, 'RECORD', [pics[pics.length - 1]])
}
console.log('errors', K.errList(errors))
K.flush()
await browser.close()
