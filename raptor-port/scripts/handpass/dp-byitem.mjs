/* [DRAFT-PENDING] — mock-up for the owner's D340 (28 Sep 26): "is it possible to have the main category to sort as per
   item, and the latest changes of that group will be the highest. And in that group in that item can show sub categories
   of that item, if that item has multiple change." Real app, phone width (his phone's), with REAL changes made on Monday
   through the app's own write path (so the history, the counts and the schedule behind all agree); their clock times are
   spread over a few minutes afterwards so the picture reads like a real sitting.
   TODAY: the window grouped by Where (the day's sections) and by Who — a man put on or taken off leads with his name.
   PROPOSED (drawn onto the real window for the picture — not built): "Group by: Item / Who"; one group per item, the
   newest-changed item on top; an item with more than one change lists each as a sub-line, newest first; an item with one
   change is one line; every line leads with its item. */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync } from 'node:fs'

const BASE = process.env.HP_URL || 'http://localhost:4182'
const OUT = (process.env.HP_SHOTS || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-28-draft-pending') + '/byitem'
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })

async function world(page) {
  const wait = ms => page.waitForTimeout(ms)
  await page.goto(BASE + '/?fresh=1')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.waitForSelector('#luser'); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day', { state: 'attached' }); await wait(400)
  await page.evaluate(() => window.go('editsched')); await wait(500)
  /* the edits, one command each (afterSchedMutate after each), in the order the picture's clock will show them */
  const steps = await page.evaluate(() => {
    const w = window, AH = w.DAYS[0].allhands, id = cs => w.nameToId(cs)
    const row = n => AH.findIndex(r => r && String(r.prog || '').toUpperCase().startsWith(n))
    const r = { sodb: row('SODB'), met: row('MET'), fs: row('FLIGHT SAFETY'), wpn: row('WPNS'), std: row('STANDARDISATION') }
    return { r, dw: w.DAYS[0].dutywaves[0].rows.findIndex(x => x && x.id) }
  })
  const act = async (fn, arg) => { await page.evaluate(fn, arg); await page.evaluate(() => window.afterSchedMutate()); await wait(400) }
  const { r, dw } = steps
  const put = (k, cs) => act(([k, cs]) => window.setSlotVal(k, cs ? window.nameToId(cs) : ''), [k, cs])
  await put(`a:0.${r.sodb}.0`, 'Warden')
  await put(`a:0.${r.fs}.0`, '')                       // whoever the seed had there — taken off
  await put(`a:0.${r.fs}.0`, 'Rune')
  await put(`a:0.${r.fs}.1`, 'Diesel')
  await put(`a:0.${r.sodb}.0`, 'Vandal')
  await act(([k]) => window.txtSet(k, '08:20'), [`ap:0.${r.met}.str`])
  await act(([dw]) => { const d = window.DAYS[0].dutywaves[0].rows; window.setSlotVal(`d:0.0.${dw}`, d[dw].id === 'mamba' ? 'pump' : 'mamba') }, [dw])
  await put(`a:0.${r.wpn}.0`, 'Trident')
  await put(`a:0.${r.std}.0`, 'Piston')
  await put('0.0.0.0.p', 'Casper')
  await put('0.0.0.0.w', 'Static')
  /* a move: Echo off MET + NOTAM BRIEF and onto SODB, in one command (one line today — "moved from … to …") */
  await page.evaluate(([m, s]) => { const w = window; w.setSlotVal(`a:0.${m}.0`, w.nameToId('Echo')); w.afterSchedMutate() }, [r.met, r.sodb]); await wait(400)
  await page.evaluate(([m, s]) => { const w = window; w.setSlotVal(`a:0.${m}.0`, ''); w.setSlotVal(`a:0.${s}.1`, w.nameToId('Echo')); w.afterSchedMutate() }, [r.met, r.sodb]); await wait(400)
  await put(`a:0.${r.wpn}.0`, 'Piston')
  await put(`a:0.${r.std}.0`, 'Trident')
  /* spread the clock: rows written by one command keep one time; each later command a little later — 06:01 onwards */
  await page.evaluate(() => {
    const rows = window.ELOG.rows
    const base = new Date(2026, 8, 28, 6, 1, 0).getTime()
    let slot = -1, last = -1e15
    for (const x of rows) { if (x.t - last > 250) slot++; last = x.t; x.t = base + slot * 21_000 }
  })
}

/* ---- the proposed window, drawn with the app's own classes ---- */
async function drawProposed(page, mode, dayWord) {
  await page.evaluate(([mode, dayWord]) => {
    const w = window, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
    const cs = v => (v && v !== '—' && w.PEOPLE[v]) ? w.PEOPLE[v].cs : v
    const isPerson = k => !!k && (!k.includes(':') || /^(a|d|s|g):/.test(k))
    const when = t => w.elogWhen(t)
    const hm = t => when(t).split(' ')[1]
    const rows = w.ELOG.rows.filter(x => x.di === 0 || x.date === w.DAYS[0].dt)
    /* the item a row belongs to, and the detail inside it */
    const itemOf = x => {
      const l = x.lbl || ''
      if (x.key && !x.key.includes(':')) { const [f, seat] = l.split(' · '); return { item: `Flying · ${f}`, det: seat } }
      const m = /^(Programme|Duty|Ground|Sim) · (.+?) · (start|end|item|detail|role|remarks|label)$/.exec(l)
      if (m) return { item: `${m[1]} · ${m[2]}`, det: m[3][0].toUpperCase() + m[3].slice(1) }
      return { item: l, det: '' }
    }
    const short = s => s.replace(/^(Programme|Duty|Ground|Sim|Flying) · /, '')
    /* changes, a move paired (the app's rule: neighbours, the same person, within a moment, off + on the same man) */
    const ch = []
    for (let i = 0; i < rows.length; i++) {
      const a = rows[i], b = rows[i + 1]
      const off = x => isPerson(x.key) && x.from && x.from !== '—' && (!x.to || x.to === '—') ? x.from : null
      const on = x => isPerson(x.key) && x.to && x.to !== '—' && (!x.from || x.from === '—') ? x.to : null
      if (b && b.seq === a.seq + 1 && Math.abs(b.t - a.t) <= 1500 && off(a) && on(b) && off(a) === on(b)) {
        const A = itemOf(a), B = itemOf(b), man = cs(on(b))
        ch.push({ t: b.t, who: a.who, item: B.item, det: B.det, txt: `${man} moved in from ${short(A.item)}`, move: true })
        ch.push({ t: b.t, who: a.who, item: A.item, det: A.det, txt: `${man} moved out to ${short(B.item)}`, move: true })
        i++; continue
      }
      const I = itemOf(a)
      let txt
      if (isPerson(a.key) && on(a)) txt = `${cs(a.to)} put on`
      else if (isPerson(a.key) && off(a)) txt = `${cs(a.from)} taken off`
      else txt = `<s>${esc(cs(a.from))}</s> → <b>${esc(cs(a.to))}</b>`
      ch.push({ t: a.t, who: a.who, item: I.item, det: I.det, txt, html: !isPerson(a.key) || (!on(a) && !off(a)) })
    }
    const T = c => c.html ? c.txt : esc(c.txt)
    const tag = d => d ? `<span style="display:inline-block;font-size:11.5px;font-weight:700;letter-spacing:.3px;color:#9fb3c6;border:1px solid #33475a;border-radius:6px;padding:0 6px;margin-right:7px;vertical-align:1px">${esc(d)}</span>` : ''
    const who = c => `<span class="cw-who">${esc(c.who)} · ${when(c.t)}</span>`
    const oneLine = (c, title) => `<button class="cw-l"><span class="cw-top"><b class="cw-what">${esc(title)}</b>${who(c)}</span><span class="cw-txt">${tag(c.det)}${T(c)}</span></button>`
    let html = ''
    if (mode === 'item') {
      const g = new Map()
      for (const c of ch) g.set(c.item, [...(g.get(c.item) || []), c])
      const groups = [...g.entries()].map(([item, cs]) => ({ item, cs: cs.sort((x, y) => y.t - x.t) })).sort((x, y) => y.cs[0].t - x.cs[0].t)
      for (const G of groups) {
        const title = dayWord ? `${dayWord} · ${G.item}` : G.item
        if (G.cs.length === 1) { html += `<div class="cw-g" style="border:0">${oneLine(G.cs[0], title)}</div>`; continue }
        html += `<div class="cw-g"><button class="cw-gh" aria-expanded="true"><span class="cw-caret">▾</span>`
          + `<span class="cw-ghname">${esc(title)} <span style="color:#8fa0b0;font-weight:600">· ${G.cs.length}</span></span>`
          + `<span class="cw-ghwhen">${hm(G.cs[0].t)}</span></button><div class="cw-gl">`
        /* a sub-line: the change in the same colours as a line's second row (struck grey → gold), who · when beside it */
        for (const c of G.cs) html += `<button class="cw-l" style="padding-top:9px;padding-bottom:9px"><span class="cw-top"><span class="cw-txt" style="margin:0;flex:1;min-width:0">${tag(c.det)}${T(c)}</span>${who(c)}</span></button>`
        html += `</div></div>`
      }
    } else {
      /* Who, as today (by person and sitting), each line item-first; a move once, under the item he reached */
      const ls = ch.filter((c, i) => !(c.move && ch[i - 1] && ch[i - 1].move && ch[i - 1].t === c.t && c.txt.includes('moved out'))).sort((x, y) => y.t - x.t)
      html += `<div class="cw-g"><button class="cw-gh" aria-expanded="true"><span class="cw-caret">▾</span><span class="cw-ghname">Saber · ${ls.length} changes</span>`
        + `<span class="cw-ghwhen">${when(ls[ls.length - 1].t)}–${hm(ls[0].t)}</span></button><div class="cw-gl">`
      for (const c of ls) html += oneLine(c, (dayWord ? `${dayWord} · ` : '') + c.item)
      html += `</div></div>`
    }
    const body = document.querySelector('.chgwin .cw-body'); if (body) { body.innerHTML = html; body.scrollTop = 0 }
    const grp = document.querySelector('.chgwin .cw-grp')
    if (grp) grp.innerHTML = `<span class="cw-grpl">Group by</span><button class="cw-g-btn${mode === 'item' ? ' on' : ''}">Item</button><button class="cw-g-btn${mode === 'who' ? ' on' : ''}">Who</button>`
    /* the tab's count stays in CHANGES (a move once) */
  }, [mode, dayWord])
}

/* ---- phone ---- */
{
  const page = await (await browser.newContext({ viewport: { width: 430, height: 932 }, hasTouch: true, isMobile: true , deviceScaleFactor: +(process.env.HP_DPR || 1) })).newPage()
  const wait = ms => page.waitForTimeout(ms)
  await world(page)
  await page.evaluate(() => { const h = document.querySelector('#eWeek .day[data-day="0"] .day-head'); h && h.scrollIntoView({ block: 'start' }); window.scrollBy(0, 170) })
  await wait(200)
  await page.click('#histBtn'); await wait(500)
  await page.click('.chgwin .win-tab:has-text("All changes")'); await page.click('.chgwin .cw-day:has-text("Mon")'); await wait(300)
  /* the panel dragged up, as he had it — more of the list in view */
  const bar = await page.locator('.chgwin .win-bar').boundingBox()
  if (bar) {
    await page.mouse.move(bar.x + 40, bar.y + bar.height / 2); await page.mouse.down()
    await page.mouse.move(bar.x + 40, bar.y - 150, { steps: 8 }); await page.mouse.up(); await wait(300)
  }
  await page.click('.chgwin .cw-g-btn:has-text("Where")'); await wait(300)
  await page.screenshot({ path: `${OUT}/1-today-where.png` })
  await page.click('.chgwin .cw-g-btn:has-text("Who")'); await wait(300)
  await page.screenshot({ path: `${OUT}/2-today-who.png` })
  await drawProposed(page, 'item', ''); await wait(200)
  await page.screenshot({ path: `${OUT}/3-proposed-item.png` })
  await page.evaluate(() => { const b = document.querySelector('.chgwin .cw-body'); b && (b.scrollTop = b.scrollHeight) }); await wait(200)
  await page.screenshot({ path: `${OUT}/4-proposed-item-more.png` })
  await drawProposed(page, 'who', ''); await wait(200)
  await page.screenshot({ path: `${OUT}/5-proposed-who.png` })
  await page.context().close()
}

/* ---- desktop: the week view (the item's day leads its header) ---- */
{
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } , deviceScaleFactor: +(process.env.HP_DPR || 1) })).newPage()
  const wait = ms => page.waitForTimeout(ms)
  await world(page)
  await page.click('#histBtn'); await wait(500)
  await page.click('.chgwin .win-tab:has-text("All changes")'); await page.click('.chgwin .cw-day:has-text("Week")'); await wait(300)
  await drawProposed(page, 'item', 'Mon'); await wait(200)
  await page.screenshot({ path: `${OUT}/6-proposed-desktop-week.png` })
  await page.context().close()
}
console.log('done → ' + OUT)
await browser.close()
