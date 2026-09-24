/* w4 · S28 (Fable) + Astra rank 6 + roll-call R17 — the CSV export and the print after working-copy edits on
   published days. Monday is issued at AL1 with a take-off time changed on the working copy (07:45, pending
   AL2); this walk also renames Tuesday's first flying line to "W4LEAK" on the working copy (Tuesday is
   issued as its Original). Friday and Wednesday are drafts.
   Rules: AM50 (export = a scheduler-only snapshot of the PUBLISHED schedule — PARTLY BUILT: it is still the
   whole week, which is not a finding here), AM36 (an export is not a boundary and does not constrain undo).
   Checks: the file and the print carry the ISSUED values (never 07:45, never W4LEAK), the print names each
   day's version ("Published — AL1", "Published — Original", "Working draft — not yet signed"), and Undo is
   the same before and after.
   Usage: node w4-07-s28-export.mjs [desktop|phone] */
const w = process.argv[2] || 'desktop'
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4'
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/dedf65a7-fc04-491e-af33-0c8dc578f346/scratchpad'
const L = await import('./w4-lib.mjs')
const { open, STATE, PHONE, DESK, editWeek, head, editText, shot, toastNow, clearToast, checker, go, frame, book } = L
const { readFileSync } = await import('node:fs')
const { browser, ctx, page, errors } = await open({ ...(w === 'phone' ? PHONE : DESK), state: STATE })
const { ck, note, summary } = checker('S28 ' + w)
const pic = s => `s28-${w}-${s}`

await editWeek(page)
/* what the book holds, for the record: Monday's issued take-off vs the working copy's */
const monKey = await page.evaluate(() => Object.keys(window.SCHED.pending).find(k => /^ff:0\..*\.to$/.test(k)))
const monLine = await page.evaluate(() => { for (const wv of window.DAYS[0].waves) for (const f of wv.formations) if (f.to === '07:45' || f.to === '0745') return { cs: f.cs, to: f.to }; return null })
note('Monday: the pending take-off on the working copy', { key: monKey, line: monLine, head: await head(page, 0) })

/* the conspicuous edit: rename Tuesday's first flying callsign on the working copy */
const tueCs = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="1"] [data-txt^="ff:1."]')].map(e => e.dataset.txt).find(k => /\.cs$/.test(k)))
const tueWas = await page.evaluate(k => (document.querySelector(`#eWeek [data-txt="${k}"]`) || {}).innerText?.trim(), tueCs)
await editText(page, tueCs, 'W4LEAK')
const h1 = await head(page, 1)
note('Tuesday renamed on the working copy', { key: tueCs, was: tueWas, head: h1 })
ck('the rename is pending on the published Tuesday', /pending/.test(h1.pending || ''), 'N pending', h1.pending)
await frame(page, '#eWeek .day[data-day="1"]')
await shot(page, pic('1-tue-renamed'))

const undoBefore = await page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? { title: b.title, disabled: b.disabled } : 'NO UNDO' })

/* ---- the CSV ---- */
const xb = page.locator('#exportSched:visible').first()
ck('R17: the CSV export button is reachable at this width', (await xb.count()) > 0, 'visible', await xb.count())
let csv = null
if (await xb.count()) {
  await clearToast(page)
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }).catch(() => null), xb.click()])
  const t = await toastNow(page)
  if (dl) { const f = `${SCR}/w4-s28-${w}.csv`; await dl.saveAs(f); csv = readFileSync(f, 'utf8'); note('CSV file', { name: dl.suggestedFilename(), bytes: csv.length, toast: t }) }
  else note('CSV', { download: 'NONE CAUGHT', toast: t })
}
if (csv) {
  const rows = csv.replace(/^\uFEFF/, '').split(/\r\n/).map(l => l.split('","').map(c => c.replace(/^"|"$/g, '')))
  const hd = rows[0]
  const col = n => hd.indexOf(n)
  const mon = rows.filter(r => r[col('Day')] === 'Monday'), tue = rows.filter(r => r[col('Day')] === 'Tuesday')
  note('CSV Monday lines (CS · TO)', mon.map(r => r[col('CS')] + ' ' + r[col('TO')]))
  note('CSV Tuesday lines (CS · TO)', tue.map(r => r[col('CS')] + ' ' + r[col('TO')]))
  ck('AM50: the CSV carries Monday as ISSUED at AL1 (no 07:45)', mon.length > 0 && !mon.some(r => /07:?45/.test(r[col('TO')])), 'no 07:45 on Monday', mon.map(r => r[col('TO')]).join(','))
  ck('AM50: the CSV carries Tuesday as ISSUED (no W4LEAK)', tue.length > 0 && !csv.includes('W4LEAK'), 'no W4LEAK anywhere', tue.map(r => r[col('CS')]).join(','))
  note('AM50 PARTLY BUILT — the file covers the days', [...new Set(rows.slice(1).map(r => r[col('Day')]))])
}

/* ---- the print ---- */
const pb = page.locator('#exportPdf:visible').first()
ck('R17: the print button is reachable at this width', (await pb.count()) > 0, 'visible', await pb.count())
let html = null
if (await pb.count()) {
  await clearToast(page)
  await pb.click(); await page.waitForTimeout(1200)
  const t = await toastNow(page)
  html = await page.evaluate(() => { const f = [...document.querySelectorAll('iframe')].pop(); return f ? (f.srcdoc || (f.contentDocument && f.contentDocument.documentElement.outerHTML) || '') : '' })
  note('print', { toast: t, htmlBytes: html ? html.length : 0 })
}
if (html) {
  const txt = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  const DAYN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  /* each day's own stretch of the printed page: from its name to the next day's name */
  const sect = d => { const a = txt.indexOf(d); if (a < 0) return 'DAY NOT PRINTED'; const nx = DAYN.slice(DAYN.indexOf(d) + 1).map(n => txt.indexOf(n, a + 1)).filter(k => k > a); return txt.slice(a, nx.length ? Math.min(...nx) : a + 400) }
  const stamp = d => sect(d).slice(0, 110)
  note('print — per-day stamps', Object.fromEntries(DAYN.map(d => [d, stamp(d)])))
  ck('AM50: the print names Monday\'s issued version (AL1)', /Published — AL1/.test(sect('Monday')), '"Published — AL1" on Monday', stamp('Monday'))
  ck('AM50: the print names Tuesday as the Original', /Published — Original/.test(sect('Tuesday')), '"Published — Original" on Tuesday', stamp('Tuesday'))
  /* the print lists flying lines only (schedRows), so a day with none — Friday, Sunday — is not printed at all;
     Wednesday is the draft day that flies */
  ck('the print labels a draft day a working draft', /Working draft — not yet signed/.test(sect('Wednesday')), '"Working draft — not yet signed" on Wednesday (draft, Plan B live)', stamp('Wednesday'))
  note('days with no flying lines are left out of the print (and the CSV) altogether', DAYN.filter(d => sect(d) === 'DAY NOT PRINTED'))
  ck('AM50: the print carries no working-copy value (no W4LEAK, no 07:45 on Monday)', !/W4LEAK/.test(txt) && !/07:45/.test(sect('Monday')), 'neither', { leak: /W4LEAK/.test(txt), mon0745: /07:45/.test(sect('Monday')) })
  /* a picture of what the print shows, rendered from the very page the app hands the print dialog */
  const pp = await ctx.newPage()
  await pp.setViewportSize(w === 'phone' ? PHONE : DESK)
  await pp.setContent(html)
  await pp.waitForTimeout(400)
  await pp.screenshot({ path: `${process.env.HP_SHOTS}/${pic('2-print-page')}.png`, fullPage: true })
  await pp.close()
}

const undoAfter = await page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? { title: b.title, disabled: b.disabled } : 'NO UNDO' })
ck('AM36: exporting and printing change nothing Undo can reach', JSON.stringify(undoBefore) === JSON.stringify(undoAfter), JSON.stringify(undoBefore), undoAfter)
const h2 = await head(page, 1)
ck('the export left the working copy as it was (still pending)', h2.pending === h1.pending, h1.pending, h2.pending)
await shot(page, pic('3-after-export'))

note('book', await book(page))
ck('no console errors', errors.length === 0, 'none', errors)
summary()
await browser.close()
