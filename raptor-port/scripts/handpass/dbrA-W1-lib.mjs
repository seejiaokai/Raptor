/* [DB-READINESS] group A FULL walk — walker W1 (the schedule) — shared helpers on top of the group driver (dbrA-lib.mjs).
   Every gesture goes through the app's own controls; the probe bridge only gets to a place and READS state.
   Each step: L.step (every row it wrote named by its change-log batch, and the exact rows it should write), a picture,
   then L.reloadCompare (a reload gives it all back and writes nothing), a picture of what the reload shows.
   One row per step goes to the walker's table (HP_OUT's `table`), so the report is built from what the run saw. */
export const PORT = process.env.HP_URL || 'http://localhost:4201'
export const W1SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W1'
export const WK = 'weeks/13-07-2026', WK2 = 'weeks/20-07-2026'
export const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
export const day = (wk, di) => new RegExp('^' + esc(wk) + '#' + di + '$')
export const ELOG = /^settings\/elog:/

/* set the driver's env (it reads it when first imported) and load it */
export async function boot(part) {
  process.env.HP_URL ||= 'http://localhost:4201'
  process.env.HP_SHOTS ||= W1SHOTS   // a re-walk sets its own folder (the first walk's pictures are the evidence)
  process.env.HP_OUT = (process.env.HP_REWALK_OUT ? process.env.HP_REWALK_OUT.replace(/.json$/, "") + (part ? "-" + part : "") + ".json" : null) || `C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/dbrA-W1${part ? '-' + part : ''}.json`
  return import('./dbrA-lib.mjs')
}

export function table(L, width) {
  const T = []
  let cur = null
  async function pic(p, name, { full = false } = {}) {
    await L.shot(p, name, full ? { fullPage: true } : {})
    if (cur) cur.pics.push(name + '.png')
    return name + '.png'
  }
  /* the batches a step wrote, with WHERE its history line went: inside the same batch as the rows, or its own */
  function batchInfo(after, a) {
    const out = []
    for (const b of a.batches) {
      let items = []
      try { items = JSON.parse(after[b.key]).items || [] } catch (e) {}
      out.push({ key: b.key, type: b.type, actor: b.actorId, n: b.n, seqs: b.seqs,
        tables: [...new Set(items.map(i => i.table))].join('+'), elog: items.filter(i => /^settings\/elog:/.test(i.key)).length })
    }
    return out
  }
  /* one step: the gesture (fn), its audit, a picture; then (unless reload:false) the reload check and its picture */
  async function S(p, id, did, fn, o = {}) {
    const { expect = null, reload = true, who = 'a', page = 'editsched', ignore = [], after = null, show = null, onScreen = null } = o
    const n0 = L.results.length
    cur = { step: id, width, did, pics: [], shown: '', rows: '', batches: [], pass: false, notes: [] }
    T.push(cur)
    let a = null
    try {
      a = await L.step(p, `${id} ${did}`, fn, expect)
      const rowsNow = await L.rows(p)
      cur.batches = batchInfo(rowsNow, a)
      cur.rows = `put ${a.put.length}: ${a.put.join(', ')}${a.del.length ? ' · del ' + a.del.length + ': ' + a.del.join(', ') : ''} · batches: ${cur.batches.map(b => `${b.type}(${b.tables || '-'}, ${b.n} rows${b.elog ? ', ' + b.elog + ' history line' : ''}, by ${b.actor})`).join(' + ') || 'none'}`
      if (onScreen) await onScreen()
      await pic(p, `${id}-1-after`)
      if (after) await after(a)
      if (reload) {
        await L.reloadCompare(p, id, who, { page, ignore })
        await toastSpy(p)   /* a reload drops the page's own toast recorder */
        if (onScreen) await onScreen()
        await pic(p, `${id}-2-reloaded`)
      }
      if (show) cur.shown = String(await show()).slice(0, 600)
    } catch (e) {
      L.check(`${id} ${did} — the step ran`, false, String(e && e.stack || e).slice(0, 800))
      await pic(p, `${id}-X-error`).catch(() => {})
    }
    cur.pass = L.results.slice(n0).every(r => r.ok)
    cur.fails = L.results.slice(n0).filter(r => !r.ok).map(r => r.name + ' :: ' + r.detail)
    return a
  }
  function note(s) { if (cur) cur.notes.push(s); console.log('NOTE  ' + s) }
  return { T, S, pic, note, get cur() { return cur } }
}

/* ---------- getting around (the bridge only to get to a place) ---------- */
export async function toEdit(L, p) { await boardOff(p); if ((await p.evaluate(() => window.CURPAGE)) !== 'editsched') await L.go(p, 'editsched') }
/* bring a day of the edit week to the front of the window (the week scrolls sideways) */
export async function showDay(p, di, surf = '#eWeek') {
  await p.evaluate(([s, i]) => {
    const d = document.querySelector(`${s} .day[data-day="${i}"]`)
    if (!d) return
    const sc = d.closest('.week') || d.parentElement
    if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = d.offsetLeft - (sc.firstElementChild ? sc.firstElementChild.offsetLeft : 0)
    window.scrollTo(0, 0)
  }, [surf, di])
  await p.waitForTimeout(350)
}
export async function boardOn(p, di) {
  const open = await p.evaluate(() => (document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth ? window.SBDAY : null))
  if (open === di) return
  if ((await p.evaluate(() => window.CURPAGE)) !== 'editsched') { await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(500) }
  await p.evaluate(d => window.openScheduler(d), di)
  await p.waitForSelector('#schedBoard', { timeout: 8000 })
  await p.waitForTimeout(600)
}
export async function boardOff(p) {
  if (!(await p.locator('#schedBoard:visible').count())) return false
  const x = p.locator('#sbDone:visible, #sbClose:visible').first()
  if (await x.count()) { await x.click(); await p.waitForTimeout(600) } else { await p.keyboard.press('Escape'); await p.waitForTimeout(500) }
  return true
}

/* ---------- gestures, all through the app's own controls ---------- */
/* a contenteditable text box on the edit week, typed and committed by leaving it */
export async function weekText(p, key, value, { delay = 8 } = {}) {
  const el = p.locator(`#eWeek [data-txt="${key}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await el.click()
  await p.keyboard.press('Control+A')
  await p.keyboard.type(String(value), { delay })
  await el.evaluate(e => e.blur())
  await p.waitForTimeout(300)
}
/* a text box on the open board (data-bfld input or data-txt cell) */
export async function boardText(p, key, value) {
  const el = p.locator(`#schedBoard [data-bfld="${key}"]:visible, #schedBoard [data-txt="${key}"]:visible`).first()
  if (!(await el.count())) throw new Error('no board box ' + key)
  await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await el.click()
  const tag = await el.evaluate(e => e.tagName)
  if (tag === 'INPUT' || tag === 'TEXTAREA') { await el.fill(''); await el.type(String(value), { delay: 8 }) }
  else { await p.keyboard.press('Control+A'); await p.keyboard.type(String(value), { delay: 8 }) }
  await el.evaluate(e => e.blur())
  await p.waitForTimeout(500)
}
/* a real pointer drag: press on the source, move past the 3px threshold, glide to the target, release */
export async function drag(p, src, dst, { steps = 14 } = {}) {
  /* the way a person does it: bring the drop point on screen first, then find the name in the crew list (it sits in
     its own scrolling panel beside the week) — both must be inside the window before the press */
  /* 'nearest' sideways: the week's days sit side by side, and a centring scroll would slide the source's day off
     under the ‹ arrow — the caller puts both days on screen first (showDay) */
  await dst.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' }))
  await p.waitForTimeout(150)
  await src.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'nearest' }))
  await p.waitForTimeout(200)
  const vp = p.viewportSize()
  const inView = r => r && r.y >= 0 && r.y + r.height <= vp.height && r.x >= 0 && r.x + r.width <= vp.width
  if (!inView(await dst.boundingBox())) { await dst.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'nearest' })); await p.waitForTimeout(200) }
  const a = await src.boundingBox()
  if (!inView(a) || !inView(await dst.boundingBox())) throw new Error(`drag: source or target not on screen (src ${JSON.stringify(a)} dst ${JSON.stringify(await dst.boundingBox())})`)
  /* and nothing lies over either point (a sticky bar, the ‹ › arrows): what a press there would land on */
  const hit = async (loc) => loc.evaluate(e => { const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!x && (x === e || e.contains(x) || x.contains(e)) })
  if (!(await hit(src)) || !(await hit(dst))) throw new Error('drag: something lies over the source or the target — the press would miss')
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await p.mouse.down()
  await p.mouse.move(a.x + a.width / 2 + 6, a.y + a.height / 2 + 6, { steps: 3 })
  const b = await dst.boundingBox()
  if (!b) { await p.mouse.up(); throw new Error('no target box') }
  await p.mouse.move(b.x + Math.min(b.width / 2, 30), b.y + b.height / 2, { steps })
  await p.waitForTimeout(150)
  await p.mouse.up()
  await p.waitForTimeout(700)
}
/* sign the four boxes of day di on the visible surface (board or week), the n-th offered name each */
export async function signDay(p, di, pick = 0) {
  const r = (await p.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const out = {}
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = p.locator(`${r} select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
    if (!(await sel.count())) { out[role] = 'NO SELECT'; continue }
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.selectOption(opts[Math.min(pick, opts.length - 1)])
    await p.waitForTimeout(250)
    out[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  return out
}
async function pressDay(p, attr, di) {
  const r = (await p.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const b = p.locator(`${r} [${attr}="${di}"]:visible`).first()
  if (!(await b.count())) return { pressed: false, why: 'absent' }
  if (await b.isDisabled()) return { pressed: false, why: 'disabled: ' + (await b.getAttribute('title')) }
  const label = (await b.innerText()).trim()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await b.click()
  await p.waitForTimeout(800)
  return { pressed: true, label }
}
export const publishDay = (p, di) => pressDay(p, 'data-beak', di)
export const publishAL = (p, di) => pressDay(p, 'data-alpub', di)
export async function unpublish(p, di) {
  const a = await pressDay(p, 'data-unpub', di)
  if (!a.pressed) return a
  const r = (await p.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const armed = p.locator(`${r} [data-unpub="${di}"]:visible`).first()
  if ((await armed.count()) && /confirm/i.test(await armed.innerText())) return { ...(await pressDay(p, 'data-unpub', di)), armedFirst: a.label }
  return a
}
/* the one Undo / Redo: 'top' = the app's top bar, 'board' = the board's own bar */
const DOOR = { top: ['#undoBtn', '#redoBtn'], board: ['#sbUndo', '#sbRedo'] }
export async function door(p, where, dir = 'undo') {
  const b = p.locator(`${DOOR[where][dir === 'undo' ? 0 : 1]}:visible`).first()
  if (!(await b.count())) return { present: false }
  const title = await b.getAttribute('title'), disabled = await b.isDisabled()
  if (disabled) return { present: true, title, disabled, pressed: false }
  await p.evaluate(() => { window.__w1toast = [] })
  await b.click()
  await p.waitForTimeout(900)
  return { present: true, title, pressed: true, toasts: await toasts(p) }
}
export async function toastSpy(p) {
  await p.evaluate(() => {
    if (window.__w1spy) return
    window.__w1spy = true; window.__w1toast = []
    new MutationObserver(ms => { for (const m of ms) {
      if (m.target && m.target.id === 'toastEl') for (const n of m.addedNodes || []) if (n.nodeType === 3 && n.data) window.__w1toast.push(n.data)
    } }).observe(document.body, { childList: true, subtree: true })
  }).catch(() => {})
}
export async function toasts(p) { return p.evaluate(() => { const a = window.__w1toast || []; window.__w1toast = []; return a.filter((t, i, x) => t && (i === 0 || t !== x[i - 1])) }).catch(() => []) }

/* what a day's head says (on the board when it is open, else on the edit week) */
export async function head(p, di) {
  return p.evaluate(i => {
    const b = document.querySelector('#schedBoard')
    const scope = b && b.offsetWidth ? b : document.querySelector(`#eWeek .day[data-day="${i}"]`)
    if (!scope) return null
    const t = e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : ''
    const q = s => scope.querySelector(s)
    return {
      tag: t(q('.verchip')), pending: t(q('.dpend')),
      beak: q(`[data-beak="${i}"]`) ? (q(`[data-beak="${i}"]`).disabled ? 'locked' : 'on') : 'none',
      alpub: t(q(`[data-alpub="${i}"]`)), unpub: t(q(`[data-unpub="${i}"]`)),
      signs: [...scope.querySelectorAll(`select[data-sign][data-signday="${i}"]`)].map(s => s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : ''),
      signed: t(q('.signedln')), nys: t(q('.nysmark')),
    }
  }, di)
}
export const signsEmpty = h => !!h && h.signs.length === 4 && h.signs.every(s => !s || /name/i.test(s))
export const signsFull = h => !!h && h.signs.length === 4 && h.signs.every(s => s && !/name/i.test(s))
/* bring one visible element to the middle of the window for the picture (the way a person scrolls to it) */
export async function focus(p, sel) {
  await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent !== null); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }, sel)
  await p.waitForTimeout(300)
}
