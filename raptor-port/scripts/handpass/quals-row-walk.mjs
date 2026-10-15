/* WALK of Quals' one row ([GUIDE-ONE-ROW], owner D935, 16 Oct 26 — built as drawn) on the served build — his phone's
   size (390 x 844, 3x, by touch) and a desktop (1280 x 800, by mouse), as an admin and as a member: no date box, no
   paragraph under the row; the row ONE line at 36 in each state an admin meets (not editing, editing, Edit quals on);
   Export reads "Export" on the phone and "Export to Excel" on a desktop and, pressed, downloads the LoX and says so; the
   filter, typed in, narrows the table; Enable editing, Edit quals and Save changes pressed in the row. Then the row's
   room measured (not walked) on three narrower phones, 375, 360 and 320 (D937), for the evidence sheet. Written as the RIGHT behaviour
   (a PASS means correct). usage: node scripts/handpass/quals-row-walk.mjs [baseURL] [outDir] */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const base = process.argv[2] || 'http://localhost:4173'
const out = process.argv[3] || 'docs/img/handpass/2026-10-16-quals-one-row'
mkdirSync(out, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const results = [], errors = [], room = {}
const ok = (step, pass, note = '') => { results.push({ step, pass: !!pass, note }); console.log((pass ? 'PASS ' : 'FAIL ') + step + (note ? ' — ' + note : '')) }
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
const DESK = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }

async function open(dev, who) {
  const ctx = await b.newContext({ baseURL: base, acceptDownloads: true, ...dev }), p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await p.goto('/?fresh=1'); await p.fill('#luser', who); await p.fill('#lpass', who === 'ad' ? 'a' : 'us'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(300)
  /* the Quals tab pressed as a person would: on a phone through the menu (☰), on a desktop its tab. Since D937 (16 Oct
     26) the page must ARRIVE at its top — the script never scrolls it: a phone's week opens scrolled to its day */
  const before = await p.evaluate(() => window.scrollY)
  if (dev.isMobile) { await p.tap('#burger'); await p.waitForTimeout(300); await p.getByText('Quals', { exact: true }).locator('visible=true').first().tap() }
  else await p.click('.nav a[data-page="quals"]')
  await p.waitForFunction(() => window.CURPAGE === 'quals'); await p.waitForSelector('#qtbl td.qname'); await p.waitForTimeout(200)
  const at = await p.evaluate(() => ({ y: window.scrollY, rowTop: Math.round(document.querySelector('.qbar').getBoundingClientRect().top), barBottom: Math.round((document.querySelector('.topbar') || document.querySelector('header')).getBoundingClientRect().bottom) }))
  ok(`${dev.isMobile ? 'phone' : 'desk'} ${who}: Quals arrives at its top, the row in sight (D937)`, at.y === 0 && at.rowTop >= at.barBottom - 1, `the schedule was scrolled ${before}; ${JSON.stringify(at)}`)
  return { ctx, p }
}
/* the row, as it stands on screen: what is in it, each one's height, whether they share one line, whether anything
   runs past the row or the page scrolls sideways, and how wide the filter is left */
const row = p => p.evaluate(() => {
  const bar = document.querySelector('.qbar'), br = bar.getBoundingClientRect()
  const els = [...bar.children].filter(e => e.offsetParent !== null && !e.classList.contains('grow'))
  const rs = els.map(e => e.getBoundingClientRect())
  return {
    ids: els.map(e => e.id || e.className), hs: rs.map(r => Math.round(r.height)),
    oneLine: Math.max(...rs.map(r => r.top + r.height / 2)) - Math.min(...rs.map(r => r.top + r.height / 2)) <= 1,
    inside: rs.every(r => r.left >= br.left - 0.5 && r.right <= br.right + 0.5), sideways: document.documentElement.scrollWidth > innerWidth,
    filterW: Math.round(document.querySelector('.qbar .searchbox').getBoundingClientRect().width),
    /* the words a person SEES: innerText still counts the full words kept for a screen reader (clipped to 1px) */
    exportText: [...document.querySelector('#qExport').children].filter(e => e.getBoundingClientRect().width > 1).map(e => e.textContent).join(' ').trim(), barH: Math.round(br.height),
  }
})
const good = m => m.hs.every(h => h === 36) && m.oneLine && m.inside && !m.sideways

for (const [key, dev] of [['phone', PHONE], ['desk', DESK]]) {
  const phone = key === 'phone'
  const { ctx, p } = await open(dev, 'ad')
  const press = sel => phone ? p.tap(sel) : p.click(sel)
  const gone = await p.evaluate(() => ({ date: !!document.querySelector('#qDate'), para: !!document.querySelector('.qhelp'), links: ['#qAddQual', '#qUses', '#qAdminLink'].filter(s => document.querySelector(s)), words: /Similar to a LoX|Archive, restore and delete are on/.test(document.body.innerText) }))
  ok(`${key} admin: no date box, no paragraph under the row, none of its links or words`, !gone.date && !gone.para && !gone.links.length && !gone.words, JSON.stringify(gone))
  let m = await row(p)
  ok(`${key} admin, not editing: Enable editing · Export · filter, one line at 36, nothing past the row`, good(m) && m.ids.join() === 'qEdit,qExport,searchbox', JSON.stringify(m))
  ok(`${key}: Export reads "${phone ? 'Export' : 'Export to Excel'}"`, m.exportText === (phone ? 'Export' : 'Export to Excel'), m.exportText)
  ok(`${key}: its name for a screen reader is still "Export to Excel"`, await p.getByRole('button', { name: 'Export to Excel' }).count() === 1)
  await p.screenshot({ path: `${out}/${key}-admin-view.png`, clip: { x: 0, y: 0, width: dev.viewport.width, height: phone ? 420 : 300 } })

  /* Export pressed: the LoX file lands and the app says so */
  const dl = p.waitForEvent('download', { timeout: 5000 }).catch(() => null)
  await press('#qExport')
  const file = await dl
  const toast = await p.waitForFunction(() => /CSV downloaded/.test(document.querySelector('#toastEl')?.textContent || ''), null, { timeout: 3000 }).then(() => 1, () => 0)
  ok(`${key}: Export pressed — the LoX downloads and "CSV downloaded" shows`, !!file && /142-LoX-.*\.csv$/.test(file.suggestedFilename()) && toast > 0, file ? file.suggestedFilename() : 'no download')

  /* the filter typed in: the table narrows to the callsign typed */
  const before = await p.locator('#qtbl tbody tr:not(.grp)').count()
  const cs = (await p.locator('#qtbl td.qname').first().innerText()).trim().split(/\s+/)[0]
  await press('#qFilter'); await p.keyboard.type(cs.slice(0, 4)); await p.waitForTimeout(250)
  const after = await p.locator('#qtbl tbody tr:not(.grp)').count()
  ok(`${key}: the filter, typed in, narrows the table`, after > 0 && after < before, `${before} → ${after} rows, typed "${cs.slice(0, 4)}"`)
  await p.screenshot({ path: `${out}/${key}-admin-filtered.png`, clip: { x: 0, y: 0, width: dev.viewport.width, height: phone ? 420 : 300 } })
  await p.fill('#qFilter', ''); await p.waitForTimeout(150)

  await press('#qEdit'); await p.waitForSelector('#qSave', { state: 'visible' }); await p.waitForTimeout(150)
  m = await row(p)
  ok(`${key} admin, editing: Save changes · Edit quals · Export · filter, one line at 36`, good(m) && m.ids.join() === 'qSave,qEditQuals,qExport,searchbox', JSON.stringify(m))
  const saveSeen = await p.evaluate(() => [...document.querySelector('#qSave').children].filter(e => e.getBoundingClientRect().width > 1).map(e => e.textContent).join(' ').trim())
  ok(`${key}: Save changes reads "${phone ? 'Save' : 'Save changes'}" (D937), its name still "Save changes"`, saveSeen === (phone ? 'Save' : 'Save changes') && await p.getByRole('button', { name: 'Save changes' }).count() === 1, saveSeen)
  await p.screenshot({ path: `${out}/${key}-admin-editing.png`, clip: { x: 0, y: 0, width: dev.viewport.width, height: phone ? 420 : 300 } })
  await press('#qEditQuals'); await p.waitForTimeout(200)
  m = await row(p)
  const addBar = await p.locator('#qQualBar').isVisible()
  ok(`${key} admin, Edit quals on: "✕ Edit quals", the row still one line at 36, Add qualification below it`, good(m) && /✕ Edit quals/.test(await p.locator('#qEditQuals').innerText()) && addBar, JSON.stringify(m))
  await p.screenshot({ path: `${out}/${key}-admin-editquals.png`, clip: { x: 0, y: 0, width: dev.viewport.width, height: phone ? 480 : 320 } })
  await press('#qEditQuals'); await p.waitForTimeout(150); await press('#qSave'); await p.waitForTimeout(200)
  ok(`${key} admin: Save changes ends editing, Enable editing back in its place`, await p.locator('#qEdit').isVisible() && !(await p.locator('#qSave').isVisible()))
  await ctx.close()

  /* a member: the same row, without Edit quals */
  const mem = await open(dev, 'us')
  m = await row(mem.p)
  ok(`${key} member: the row one line at 36, no paragraph`, good(m) && !(await mem.p.locator('.qhelp').count()), JSON.stringify(m))
  await mem.p.screenshot({ path: `${out}/${key}-member-view.png`, clip: { x: 0, y: 0, width: dev.viewport.width, height: phone ? 420 : 300 } })
  await mem.ctx.close()
}

/* the room left on narrower phones than his (measured, for the sheet — not part of the PASS count) */
for (const w of [375, 360, 320]) {
  const { ctx, p } = await open({ ...PHONE, viewport: { width: w, height: 760 } }, 'ad')
  const s = { view: await row(p) }
  await p.tap('#qEdit'); await p.waitForTimeout(150); s.editing = await row(p)
  await p.tap('#qEditQuals'); await p.waitForTimeout(150); s.editquals = await row(p)
  await p.screenshot({ path: `${out}/phone${w}-admin-editquals.png`, clip: { x: 0, y: 0, width: w, height: 420 } })
  room[w] = Object.fromEntries(Object.entries(s).map(([k, v]) => [k, { oneLine: v.oneLine, inside: v.inside, filterW: v.filterW, ok36: v.hs.every(h => h === 36) }]))
  console.log(`room at ${w}:`, JSON.stringify(room[w]))
  await ctx.close()
}
ok('no page errors in the console', errors.length === 0, errors.slice(0, 3).join(' | '))
writeFileSync(`${out}/quals-walk.json`, JSON.stringify({ results, room, errors }, null, 2))
console.log(`${results.filter(r => r.pass).length}/${results.length} PASS`)
await b.close()
