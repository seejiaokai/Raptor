// [INPUT-ASK-LOOK] (D1624, 3 Nov 26 — "it's ugly can u design a better one"): the input window's "Close it and lose them?"
// question, today and three designs drawn on the real app (frozen build), at a desktop's and his iPhone's size.
//   WALK_DIR=<frozen dist> ISR_OUT=<pictures> LOOK_URL=http://localhost:4397/ node scripts/handpass/xask-mock.mjs
// 0 today — the real question, reached by typing in Remarks and pressing the window's real ✕.
// A the foot — the window's foot (Delete · Cancel · Save) becomes the question: words left, Discard and close (the app's
//   danger button) and Keep editing (the app's primary button, where Save stood) right. No new box.
// B a slim line — under the window's title bar, on the window's own surface, a 1px amber line under it: the words and the
//   same two buttons in one row (two on a phone).
// C from the ✕ — a small card hangs from the ✕ that was pressed, a pointer up to it; the same words and buttons.
// Only the look is drawn: the words and the two answers are today's, word for word. New parts are cloned from the real
// buttons (`abtn danger`, `abtn primary`) and carry the `xa-` prefix; today's box is hidden, never restyled.
import * as L from './isr-A-lib.mjs'
const { shot, tid, note, check } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
const Q = 'This input has unsaved changes. Close it and lose them?'
const CSS = `
.xa-q{font-size:12.5px;font-weight:700;line-height:1.35;color:var(--ink)}
.xa-btns{display:flex;gap:8px;justify-content:flex-end;flex-wrap:nowrap}
.xa-btns .abtn{min-height:36px;padding:6px 12px;font-size:12px;white-space:nowrap}
@media (max-width:620px){.xa-btns .abtn{min-height:44px}}
/* A — the foot */
.airpop-foot.xa-foot{display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px}
.airpop-foot.xa-foot>:not(.xa){display:none !important}
.xa-foot .xa-q{flex:1 1 220px}
.xa-foot .xa-btns{margin-left:auto}
/* B — the slim line */
.xa-strip{display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;padding:10px var(--xa-gut,14px);border-bottom:1px solid var(--adv);background:var(--panel)}
.xa-strip .xa-q{flex:1 1 220px}
.xa-strip .xa-btns{margin-left:auto}
/* C — from the ✕ */
.floatwin.inpedwin{overflow:visible}
.xa-pop{position:absolute;z-index:5;right:8px;width:min(300px,calc(100% - 16px));display:flex;flex-direction:column;gap:10px;padding:12px;
  border:1px solid color-mix(in srgb,var(--ink) 22%,var(--panel));border-radius:12px;background:color-mix(in srgb,var(--ink) 8%,var(--panel));box-shadow:0 10px 28px rgba(0,0,0,.55)}
.xa-pop::before{content:'';position:absolute;top:-6px;right:14px;width:10px;height:10px;transform:rotate(45deg);
  background:inherit;border-left:1px solid color-mix(in srgb,var(--ink) 22%,var(--panel));border-top:1px solid color-mix(in srgb,var(--ink) 22%,var(--panel))}
`

async function stage(page) {
  await page.evaluate(() => { document.querySelectorAll('.xa, .xa-strip, .xa-pop').forEach(e => e.remove()); document.querySelectorAll('.xa-foot').forEach(e => e.classList.remove('xa-foot')); const a = document.querySelector('[data-testid="inped-escask"]'); if (a) a.style.removeProperty('display') })
}
async function draw(page, which) {
  await stage(page)
  await page.evaluate(([which, Q]) => {
    const win = document.querySelector('[data-testid="win-inputedit"]')
    const ask = win.querySelector('[data-testid="inped-escask"]')
    if (!ask) throw new Error('premise: today\'s question is not up')
    if (which === '0') return
    ask.style.setProperty('display', 'none', 'important')
    const foot = win.querySelector('.airpop-foot')
    const mk = () => {
      const q = document.createElement('span'); q.className = 'xa xa-q'; q.textContent = Q
      const b = document.createElement('span'); b.className = 'xa xa-btns'
      const go = document.getElementById('inpEditDel').cloneNode(false); go.removeAttribute('id'); go.textContent = 'Discard and close'
      const stay = document.getElementById('inpEditSave').cloneNode(false); stay.removeAttribute('id'); stay.textContent = 'Keep editing'
      b.append(go, stay); return [q, b]
    }
    if (which === 'A') { foot.classList.add('xa-foot'); foot.append(...mk()) }
    if (which === 'B') { const s = document.createElement('div'); s.className = 'xa-strip'; const fld = win.querySelector('#inpEditType').getBoundingClientRect(); s.style.setProperty('--xa-gut', Math.round(fld.left - win.getBoundingClientRect().left - 1) + 'px'); s.append(...mk()); win.querySelector('.win-bar').after(s) }
    if (which === 'C') {
      const p = document.createElement('div'); p.className = 'xa-pop'; p.append(...mk())
      const bar = win.querySelector('.win-bar'); p.style.top = (bar.offsetHeight + 6) + 'px'; win.append(p)
    }
  }, [which, Q])
  await sleep(150)
  return page.evaluate(which => {
    const win = document.querySelector('[data-testid="win-inputedit"]')
    const part = which === '0' ? win.querySelector('[data-testid="inped-escask"]') : which === 'A' ? win.querySelector('.airpop-foot') : which === 'B' ? win.querySelector('.xa-strip') : win.querySelector('.xa-pop')
    const r = part.getBoundingClientRect(), w = win.getBoundingClientRect()
    const firstField = win.querySelector('#inpEditPerson, #inpEditType'); const f = firstField && firstField.getBoundingClientRect()
    const btns = [...part.querySelectorAll('.abtn')].map(b => { const x = b.getBoundingClientRect(); return { t: b.textContent, w: Math.round(x.width), h: Math.round(x.height), inside: b.scrollWidth <= b.clientWidth + 1 } })
    return { h: Math.round(r.height), top: Math.round(r.top - w.top), firstFieldTop: f ? Math.round(f.top - w.top) : null, btns, fitsWin: r.right <= w.right + 0.5 && r.left >= w.left - 0.5 }
  }, which)
}

for (const size of ['desktop', 'phone']) {
  const { page, tap } = await L.session(size, 'ad')
  await page.addStyleTag({ content: CSS })
  const men = await L.freeMen(page, 1, [2])
  const iid = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: men, from: '09:00', to: '10:00', title: 'Ops brief', remarks: 'as filed' }, true)
  await L.press(page, tap, `[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`); await tid(page, 'win-inputedit').waitFor()
  /* the typing is set through the box's own input event: an emulated phone zooms to a focused box (the method's trap) */
  await page.evaluate(() => { const r = document.querySelector('#inpEditPop #inpEditRmk'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(r, 'flights changed, back at 10:30'); r.dispatchEvent(new Event('input', { bubbles: true })) })
  await L.press(page, tap, '[data-testid="win-inputedit-x"]'); await sleep(300)
  await page.evaluate(() => document.activeElement && document.activeElement.blur())
  if (!tap) await page.mouse.move(5, 5)
  for (const which of ['0', 'A', 'B', 'C']) {
    const m = await draw(page, which)
    note(which, `${size}: ${JSON.stringify(m)}`)
    check(which, `${size}: the part fits the window, every button's words inside it`, m.fitsWin && m.btns.every(b => b.inside), m)
    if (size === 'desktop') await tid(page, 'win-inputedit').screenshot({ path: `${L.OUT}/${which}-desktop.png` })
    else await shot(page, which, 'phone', 'x')
  }
  await page.context().close()
}
await L.finish('xask')
