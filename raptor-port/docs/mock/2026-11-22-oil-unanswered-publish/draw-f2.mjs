// OIL F2, his choice (D2294, 22 Nov 26): a day with an input whose OIL question is unanswered asks it at the first press
// of any of its four sign-off boxes — the day's open OIL list opens BEFORE the name is recorded, so the answer never
// clears it (the signature binds the day's OIL evidence: engine/publish.ts currentBindNow); Later asks no more that day;
// the publish note names the unanswered input. Drawn beside the first round (draw.mjs, the same folder, same data).
//
// Drawn on the REAL running app by .claude/skills/brainstorming/mockups-on-the-real-app.md. Frames:
//   T  today: the Saturday's four empty sign-off boxes; CUR CK picked for real — the name goes in, nothing asks
//   P1 proposed: the press opens the day's one OIL list (the app's own window, opened for the drawing by a door that
//      opens it today — see openList), the CUR CK box still empty;
//      a new lead line and a new foot line in the window's own classes, marked "New"
//   P2 Save with Yes, then the name — what the build does in that order — pressed for real: the box reads Ace, the input
//      answered, nothing cleared
//   P3 Later, then the name and the other three boxes, pressed for real (the proposal: no more asking that day), then
//      Publish day pressed for real and the note's words after "published and approved" changed as D2294 rules
//   W  (desktop) the same window over Edit Schedule's week, whose day carries the same four boxes
//
// Run from raptor-port/, against a built preview already serving:
//   TS_URL=http://localhost:4187/ node docs/mock/2026-11-22-oil-unanswered-publish/draw-f2.mjs
// Pictures go to img/f2-*.png, the measures to img/manifest-f2.json.
import { chromium, webkit } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

const URL_ = process.env.TS_URL || 'http://localhost:4187/'
const OUT = 'docs/mock/2026-11-22-oil-unanswered-publish/img'
mkdirSync(OUT, { recursive: true })
const ONLY = process.env.TS_ONLY ? process.env.TS_ONLY.split(',') : null

const SIZES = {
  d: { name: 'desktop', eng: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', eng: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } },
}

/* the words, one place — each new line is put to him on the page. Round 3 (his D2296, "too much words. be concise"):
   round 2's were "Asked now because an answer given after signing clears the sign-offs. Ace's CUR CK goes in when you
   press Save or Later." and "Later signs without an answer: nobody on it earns OIL, and Saturday won't ask again." */
const W = {
  lead: 'Answer before Ace signs CUR CK.',
  foot: 'Later: nobody on it earns OIL.',
  note_tail: "Ranger's Training has no OIL answer, so nobody on it earns OIL.",
}

const MARK_CSS = `
.mkq { outline: 2px solid #ff2d95 !important; outline-offset: 2px !important; }
.mkq-tag { position: fixed; z-index: 2147483647; background: #ff2d95; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; }
`
const manifest = { drawn: new Date().toISOString(), url: URL_, words: W, frames: [], checks: {} }
const log = (...a) => console.log(...a)

const vis = 'e => e.getBoundingClientRect().width > 0'
async function box(p, sel) {
  return p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }, sel)
}
async function shot(p, sz, name, sels, pad = 10) {
  const boxes = []
  for (const s of [].concat(sels)) { const b = await box(p, s); if (b) boxes.push(b); else log(`${name}: nothing visible for ${s}`) }
  if (!boxes.length) throw new Error(`${name}: nothing to picture`)
  const x0 = Math.min(...boxes.map(b => b.x)), y0 = Math.min(...boxes.map(b => b.y))
  const x1 = Math.max(...boxes.map(b => b.x + b.w)), y1 = Math.max(...boxes.map(b => b.y + b.h))
  const vw = sz.opts.viewport.width, vh = sz.opts.viewport.height
  const x = Math.max(0, x0 - pad), y = Math.max(0, y0 - pad)
  const clip = { x, y, width: Math.min(vw - x, x1 - x0 + 2 * pad), height: Math.min(vh - y, y1 - y0 + 2 * pad) }
  const file = `${OUT}/${name}-${sz.name}.png`
  await p.screenshot({ path: file, clip })
  manifest.frames.push({ name, size: sz.name, file: file.split('/').pop(), clip })
  log('shot', file)
}
async function full(p, sz, name) {
  const file = `${OUT}/${name}-${sz.name}.png`
  await p.screenshot({ path: file })
  manifest.frames.push({ name, size: sz.name, file: file.split('/').pop(), clip: 'viewport' })
  log('shot', file)
}
/* a tag fixed on the page, placed from the element's box just before the picture (the screen is still) */
async function tag(p, sel, label) {
  await p.evaluate(([sel, label]) => {
    const el = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); if (!el) throw new Error('tag: no ' + sel)
    el.classList.add('mkq')
    const b = el.getBoundingClientRect(), t = document.createElement('span')
    t.className = 'mkq-tag'; t.textContent = label; t.setAttribute('data-mine', '1'); document.body.appendChild(t)
    t.style.left = (b.right - t.offsetWidth - 2) + 'px'; t.style.top = Math.max(0, b.top - t.offsetHeight - 3) + 'px'
  }, [sel, label])
}
const untag = p => p.evaluate(() => { document.querySelectorAll('[data-mine]').forEach(e => e.remove()); document.querySelectorAll('.mkq').forEach(e => e.classList.remove('mkq')) })
const hideToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.style.transition = 'none'; t.style.opacity = '0' } })

async function login(p) {
  await p.goto(URL_)
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a')
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' })
  await p.waitForTimeout(500)
  await p.addStyleTag({ content: MARK_CSS })
}
async function go(p, to) { await p.evaluate(t => window.go(t), to); await p.waitForFunction(t => window.CURPAGE === t, to); await p.waitForTimeout(400) }
async function board(p, di) {
  await go(p, 'editsched')
  await p.locator(`#eWeek [data-sbday="${di}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await p.locator('#schedBoard .sb-sec').first().waitFor({ state: 'attached' })
  await p.waitForTimeout(500)
}
const neutralTap = p => p.evaluate(() => { const h = document.querySelector('#schedBoard .sb-sec'); if (h) h.dispatchEvent(new MouseEvent('click', { bubbles: false })); (document.activeElement)?.blur?.() })
const SIGN = '#schedBoard .sb-sign'
const signText = p => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0); return e ? [...e.querySelectorAll('label.sgn')].map(l => l.querySelector('.k').textContent + '=' + l.querySelector('.v').textContent).join(' | ') + ' · ' + (e.querySelector('.so-state')?.textContent || '') : null }, SIGN)
const look = p => p.evaluate(() => ({ missing: window.signMissing(5), approved: window.dayApproved(5), oil: (window.INPUTS.find(x => x.iid === 'mk-train') || {}).oil || null, list: !!document.querySelector('[data-testid="win-oilday"]') }))
async function pick(p, role, nth) {
  const sel = p.locator(`${SIGN} select[data-sign="${role}"]:visible`).first()
  const v = await sel.locator('option').evaluateAll((os, n) => os.map(o => o.value).filter(Boolean)[n], nth)
  await sel.selectOption(v)
  await p.waitForTimeout(250)
}

/* the Saturday holds one thing: Ranger's Training 08:00–17:00 on the programme, no OIL answer (as draw.mjs stages it) */
async function stage(p, sz) {
  await p.evaluate(() => {
    const w = window, d = w.DAYS[5]
    d.waves = []; d.sims = {}; d.dutywaves = []; d.ground = []; d.notes = []; d.allhands = []
    w.INPUTS.unshift({ iid: 'mk-train', person: 'bane', type: 'Training', date: 'Jul 18', yr: 2026, allday: false, s: 480, e: 1020, remarks: '', mod: 'now', acc: 'g' })
    w.afterSchedMutate()
  })
  await board(p, 5)
  const premise = await p.evaluate(() => {
    const w = window
    const del = document.querySelector('#schedBoard [data-grdel="5.0"]'), sec = del && del.closest('.sb-sec')
    const txt = sec ? sec.innerText + ' ' + [...sec.querySelectorAll('input,textarea')].map(i => i.value).join(' ') : ''
    return { dow: w.DAYS[5].dow, training: /TRAINING/i.test(txt) && /08:00/.test(txt) && /17:00/.test(txt), ranger: /Ranger/.test(txt), missing: w.signMissing(5), open: (w.INPUTS.find(i => i.iid === 'mk-train') || {}).oil || null }
  })
  log('premise', JSON.stringify(premise))
  if (!premise.training || !premise.ranger || premise.missing.length !== 4 || premise.open) throw new Error('premise not on screen')
  manifest.checks[sz.name + '-premise'] = premise
}
/* open the day's one list by a door that opens it today, every step pressed in the app: the four sign and Publish day;
   the Training taken off the programme; the Original loaded back onto the working copy — its unanswered input comes
   back and the list opens (D818); then Unpublish, so the day behind the list is the unpublished Saturday again, its four
   boxes empty. (Switch to this plan, D865, was tried first: on an unpublished day it puts the row back while the input
   stays rejected, so no list opens — found while drawing, filed.) */
async function openList(p) {
  await pick(p, 'cur', 0); await pick(p, 'sked', 0); await pick(p, 'plan', 1); await pick(p, 'appr', 2)
  await p.locator('#schedBoard [data-beak="5"]:visible').first().click()
  await p.waitForFunction(() => window.dayApproved(5))
  await p.waitForTimeout(300); await hideToast(p)
  const ri = await p.evaluate(() => window.DAYS[5].ground.findIndex(g => String(g.src) === 'mk-train'))
  await p.locator(`#schedBoard [data-grdel="5.${ri}"]:visible`).first().click()
  await p.waitForFunction(() => window.INPUTS.find(x => x.iid === 'mk-train').acc !== 'g')
  await p.locator('#schedBoard [data-planmenu="5"]:visible').first().click()
  const pv = p.locator('[data-planpv]:visible').first()
  const ver = await pv.getAttribute('data-planpv')
  await pv.click()
  const load = p.locator(`#schedBoard button[data-restore="5"][data-rver="${ver}"]:visible`).first()
  await load.click(); await p.waitForTimeout(200)
  if (await load.count()) await load.click()
  await p.locator('[data-testid="win-oilday"]').waitFor({ timeout: 8000 })
  await hideToast(p)
  const un = p.locator('#schedBoard button[data-unpub="5"]:visible').first()
  await un.click(); await p.waitForTimeout(250)
  if (await un.count() && await p.evaluate(() => window.dayApproved(5))) await un.click()
  await p.waitForFunction(() => !window.dayApproved(5), null, { timeout: 5000 })
  await p.waitForTimeout(400); await hideToast(p)
  const back = await p.evaluate(() => ({ acc: window.INPUTS.find(x => x.iid === 'mk-train').acc, oil: window.INPUTS.find(x => x.iid === 'mk-train').oil || null, missing: window.signMissing(5), approved: window.dayApproved(5), list: !!document.querySelector('[data-testid="win-oilday"]') }))
  log('list open', JSON.stringify(back))
  if (back.acc !== 'g' || back.oil || back.missing.length !== 4 || back.approved || !back.list) throw new Error('the day behind the list is not the staged Saturday ' + JSON.stringify(back))
}
async function letterList(p) {
  await p.evaluate(W => {
    const w = [...document.querySelectorAll('[data-testid="win-oilday"]')].find(e => e.getBoundingClientRect().width > 0)
    const count = w.querySelector('.odl-count')
    const lead = document.createElement('p'); lead.className = 'odl-lead'; lead.setAttribute('data-mknew', 'lead'); lead.textContent = W.lead
    count.parentNode.insertBefore(lead, count)
    const left = w.querySelector('[data-testid="odl-left"]'); left.textContent = W.foot; left.setAttribute('data-mknew', 'foot')
  }, W)
}

async function run(key) {
  const sz = SIZES[key]
  const b = await sz.eng.launch()
  const fresh = async () => {
    const ctx = await b.newContext(sz.opts); const p = await ctx.newPage()
    p.on('pageerror', e => log('PAGE ERROR', e.message))
    p.on('console', m => { if (m.type() === 'error') log('console error', m.text()) })
    await login(p); await stage(p, sz); return { ctx, p }
  }

  /* T — today */
  {
    const { ctx, p } = await fresh()
    await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0); e.scrollIntoView({ block: 'center' }) }, SIGN)
    await p.waitForTimeout(300); await neutralTap(p)
    await shot(p, sz, 'f2-t1-sign', SIGN, 8)
    await pick(p, 'cur', 0); await hideToast(p); await neutralTap(p)
    manifest.checks[sz.name + '-todayAfterPick'] = { ...(await look(p)), sign: await signText(p) }
    await shot(p, sz, 'f2-t2-signed', SIGN, 8)
    await ctx.close()
  }

  /* P1 + P3 — the list at the press, then Later */
  {
    const { ctx, p } = await fresh()
    await openList(p)
    manifest.checks[sz.name + '-listAsOpened'] = await p.locator('[data-testid="win-oilday"]').evaluate(e => e.innerText)
    await letterList(p)
    await tag(p, '[data-mknew="lead"]', 'New'); await tag(p, '[data-mknew="foot"]', 'New')
    await tag(p, `${SIGN} label.sgn`, '1')
    await full(p, sz, 'f2-p1-screen')
    await untag(p)
    await tag(p, '[data-mknew="lead"]', 'New'); await tag(p, '[data-mknew="foot"]', 'New')
    await shot(p, sz, 'f2-p1-list', '[data-testid="win-oilday"]', 8)
    await untag(p)
    /* Later, then the name (the order the build keeps), then the other three — none asks again */
    await p.locator('[data-testid="win-oilday"] button', { hasText: 'Later' }).first().click()
    await p.waitForTimeout(300)
    await pick(p, 'cur', 0); await pick(p, 'sked', 0); await pick(p, 'plan', 1); await pick(p, 'appr', 2)
    await hideToast(p); await neutralTap(p)
    manifest.checks[sz.name + '-afterLater'] = { ...(await look(p)), sign: await signText(p) }
    await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0); e.scrollIntoView({ block: 'center' }) }, SIGN)
    await p.waitForTimeout(300)
    await shot(p, sz, 'f2-p3-signed-later', SIGN, 8)
    await p.locator('#schedBoard [data-beak="5"]:visible').first().click()
    await p.waitForFunction(() => { const t = document.getElementById('toastEl'); return t && +getComputedStyle(t).opacity > 0.5 && /published/i.test(t.textContent || '') }, null, { timeout: 8000 })
    manifest.checks[sz.name + '-publishNoteToday'] = await p.evaluate(() => document.getElementById('toastEl').textContent.trim())
    await p.evaluate(W => {
      const t = document.getElementById('toastEl'); t.style.transition = 'none'; t.style.opacity = '1'
      const walk = document.createTreeWalker(t, NodeFilter.SHOW_TEXT); let n, done = false
      while ((n = walk.nextNode())) if (!done && /published and approved/.test(n.nodeValue)) {
        n.nodeValue = n.nodeValue.replace(/^(\w+) published and approved\.?/, '$1 18 Jul published and approved. ')
        const s = document.createElement('span'); s.setAttribute('data-mknew', 'note'); s.textContent = W.note_tail
        n.parentNode.insertBefore(s, n.nextSibling); done = true
      }
      if (!done) throw new Error('no "published and approved" in the note')
    }, W)
    /* the note's words were drawn in the first round and chosen then: no New tag this round (only what is new is marked) */
    await shot(p, sz, 'f2-p3-note', '#toastEl', 10)
    await untag(p)
    await ctx.close()
  }

  /* P2 — Save with Yes, then the name */
  {
    const { ctx, p } = await fresh()
    await openList(p)
    await p.locator('[data-testid="odl-yes-mk-train"]').click()
    await p.locator('[data-testid="odl-save"]').click()
    await p.waitForTimeout(500)
    await pick(p, 'cur', 0)
    await hideToast(p); await neutralTap(p)
    manifest.checks[sz.name + '-afterSave'] = { ...(await look(p)), sign: await signText(p) }
    await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0); e.scrollIntoView({ block: 'center' }) }, SIGN)
    await p.waitForTimeout(300)
    await shot(p, sz, 'f2-p2-signed-save', SIGN, 8)
    /* the measure behind the lead line: sign the other three, answer No in the input's place … read in the code instead
       (engine/publish.ts currentBindNow binds the OIL evidence); here only what the order Save-then-sign leaves */
    await ctx.close()
  }

  /* W — the same window over Edit Schedule's week (desktop) */
  if (key === 'd') {
    const { ctx, p } = await fresh()
    await openList(p)
    await p.evaluate(() => { const x = document.getElementById('sbDone'); if (x) x.click() })
    await p.waitForTimeout(600)
    const still = await p.evaluate(() => ({ page: window.CURPAGE, list: !!document.querySelector('[data-testid="win-oilday"]'), bar: !!document.querySelector('#eWeek [data-signbar="5"]') }))
    log('week', JSON.stringify(still)); manifest.checks['desktop-week'] = still
    if (still.list && still.bar) {
      await p.evaluate(() => document.querySelector('#eWeek [data-signbar="5"]').scrollIntoView({ block: 'center', inline: 'center' }))
      await p.waitForTimeout(500); await hideToast(p)
      await letterList(p)
      await tag(p, '[data-mknew="lead"]', 'New'); await tag(p, '[data-mknew="foot"]', 'New')
      await tag(p, '#eWeek [data-signbar="5"] label.sgn', '1')
      await full(p, sz, 'f2-w-screen')
      await untag(p)
    }
    await ctx.close()
  }
  await b.close()
}

for (const k of ['d', 'p']) { if (ONLY && !ONLY.includes(k)) continue; await run(k) }
writeFileSync(`${OUT}/manifest-f2.json`, JSON.stringify(manifest, null, 2))
log('done')
