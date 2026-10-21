/* lk-rewalk: the re-walk of the code read's fixes R1-R8 (21 Oct 26, the Sonnet walker) */
process.env.HP_URL ||= 'http://localhost:4295'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/.claude/worktrees/overnight-backlog-review-92da33/raptor-port/docs/img/handpass/2026-10-21-look-keys/rewalk'
console.log('lk-rewalk v3')
import { rmSync, mkdirSync } from 'node:fs'
rmSync(process.env.HP_SHOTS, { recursive: true, force: true }); mkdirSync(process.env.HP_SHOTS, { recursive: true })
const { go, board } = await import('./lib.mjs')
const W = await import('./lk-walk-lib.mjs')
const rec = W.recorder('rewalk')
const pause = (page, ms = 350) => page.waitForTimeout(ms)
const near = (a, b, t = 1) => Math.abs(a - b) <= t
const allErrors = []
const measure = (page, sel) => page.evaluate(W.WINMEASURE, sel)
const fm = (m) => m.open ? `top ${m.top} (bar bottom ${m.barBottom}, bar H ${m.barH}; vw ${m.vw}) left ${m.left} right ${m.right}; bar's last 3px under its centre: ${m.underBarFoot}` : 'NOT OPEN'
async function openChg(page) { await page.click('#histBtn'); await page.waitForSelector('.chgwin:not([hidden])'); await pause(page) }
async function openAvail(page) { const c = page.locator('#eWeek [data-oilsent]:visible').first(); await c.scrollIntoViewIfNeeded(); await c.click(); await page.waitForSelector('.availwin:not([hidden])'); await pause(page) }

async function twoWindows(id, first, size) {
  const { browser, page, errors } = await W.openD({ width: 1920, height: 900 })
  try {
    await go(page, 'editsched')
    const put = await W.putAt(page, 'week', 'a:0.0.+'); await pause(page, 400)
    if (first === 'avail') { await openAvail(page); await openChg(page) } else { await openChg(page); await openAvail(page) }
    const a0 = await measure(page, '.availwin'), c0 = await measure(page, '.chgwin')
    await page.setViewportSize({ width: 1200, height: 800 }); await pause(page, 900)
    const a1 = await measure(page, '.availwin'), c1 = await measure(page, '.chgwin')
    const marks = []
    for (const s of ['.availwin', '.chgwin']) { const r = await W.rectOf(page, s); if (r) marks.push(r) }
    marks.push({ x: 0, y: c1.barBottom - 3, w: 1200, h: 3 })
    await W.mark(page, marks)
    const pic = await W.snap(page, `${id.toLowerCase()}-two-windows-1200`)
    const crop = await W.snap(page, `${id.toLowerCase()}-two-windows-1200-crop`, { x: 600, y: Math.max(0, c1.barBottom - 80), width: 600, height: 200 })
    await W.unmark(page)
    const at1920ok = near(a0.top, 96) && near(c0.top, 96)
    const ok = a1.open && c1.open && near(a1.top, a1.barBottom + 8) && near(c1.top, c1.barBottom + 8) && a1.underBarFoot === 'the top bar' && c1.underBarFoot === 'the top bar'
    rec(id, '1920x900 → 1200x800', `${first === 'avail' ? 'ALL AVAIL window first, then the changes window' : 'changes window first, then ALL AVAIL'}; then viewport to 1200x800 (put: ${put})`,
      `at 1920: ALL AVAIL top ${a0.top}, changes top ${c0.top} (expected 96 each: ${at1920ok}); at 1200: ALL AVAIL ${fm(a1)}; changes ${fm(c1)}; expected both = bar bottom + 8 = ${c1.barBottom + 8}`,
      ok && at1920ok ? 'PASS' : 'FAIL', [pic, crop])
  } catch (e) { rec(id, '1920', 'x', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED') }
  allErrors.push(id + ': ' + W.consoleBlock(errors)); await browser.close()
}
await twoWindows('R1', 'avail')
await twoWindows('R2', 'chg')

/* ---------------- R3: the ring in the Cancel sheet's edit list ---------------- */
{
  const { browser, page, errors } = await W.openD({ width: 1440, height: 900 })
  try {
    await go(page, 'editsched'); await board(page, 1); await pause(page, 500)
    const btn = page.locator('#schedBoard [data-pcx]:visible').filter({ hasText: /^CX$/ }).first()
    await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForSelector('#cxPop:not([hidden])'); await pause(page, 400)
    await page.locator('#cxReason').focus()
    let onEdit = false
    for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); const c = await page.evaluate(() => document.activeElement.className); if (/cxq-edit/.test(c)) { onEdit = true; break } }
    await page.keyboard.press('Enter'); await pause(page, 500)
    const listInfo = await page.evaluate(() => { const l = document.querySelector('.cxedit-list'); if (!l || !l.offsetWidth) return null; const r = l.getBoundingClientRect(); return { x: r.x + l.clientLeft, y: r.y + l.clientTop, w: l.clientWidth, h: l.clientHeight, outer: [r.x, r.y, r.width, r.height].map(Math.round), scrollH: l.scrollHeight, overflow: getComputedStyle(l).overflow } })
    if (!onEdit || !listInfo) rec('R3', '1440x900', 'CX, Tab to ✎ Edit, Enter', `on Edit: ${onEdit}; list: ${JSON.stringify(listInfo)}`, 'NOT WALKED')
    else {
      /* the list's rows: first name box left edge against the reason box's left edge */
      const rows = await page.evaluate(() => { const rb = document.getElementById('cxReason'); const nm = document.querySelector('.cxedit-name'); const r1 = rb && rb.offsetWidth ? rb.getBoundingClientRect() : null; const r2 = nm.getBoundingClientRect(); return { reasonLeft: r1 && r1.left, reasonVisible: !!r1, nameLeft: r2.left } })
      const alignPic = await (async () => { const rr = await W.rectOf(page, '#cxReason'); const nr = await W.rectOf(page, '.cxedit-list .cxedit-name'); const lr = await W.rectOf(page, '.cxedit-list'); await W.mark(page, [rr, nr].filter(Boolean)); const pc = await W.snap(page, 'r3-rows-align-1440', { x: Math.max(0, (rr ? rr.x : 500) - 40), y: Math.max(0, (rr ? rr.y : 300) - 20), width: 520, height: 330 }); await W.unmark(page); return pc })()
      await page.locator('.cxedit-list .cxedit-name').first().focus()
      const seq = []
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab'); await page.waitForTimeout(120)
        const f = await page.evaluate(() => { const a = document.activeElement; const l = document.querySelector('.cxedit-list'); if (!a || !l || !l.contains(a)) return { out: true, name: a ? (a.id || a.className || a.tagName) : 'none' }; const r = a.getBoundingClientRect(); const s = getComputedStyle(a); const lr = l.getBoundingClientRect(); return { cls: a.className, name: (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 18), box: { x: r.x, y: r.y, w: r.width, h: r.height }, outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor} off ${s.outlineOffset}`, offsetPx: parseFloat(s.outlineOffset) || 0, ring: parseFloat(s.outlineWidth) || 0, list: { x: lr.x + l.clientLeft, y: lr.y + l.clientTop, w: l.clientWidth, h: l.clientHeight }, idx: [...l.querySelectorAll('.cxedit-name')].length } })
        if (f.out) { seq.push(f); break }
        seq.push(f)
        if (/cxedit-(mv|del)/.test(f.cls)) {
          const m = 4  /* 2px ring + 2px offset */
          const inside = f.box.x - m >= f.list.x - 0.5 && f.box.x + f.box.w + m <= f.list.x + f.list.w + 0.5 && f.box.y - m >= f.list.y - 0.5 && f.box.y + f.box.h + m <= f.list.y + f.list.h + 0.5
          f.inside = inside
          f.slack = { l: Math.round((f.box.x - m - f.list.x) * 10) / 10, r: Math.round((f.list.x + f.list.w - (f.box.x + f.box.w + m)) * 10) / 10, t: Math.round((f.box.y - m - f.list.y) * 10) / 10, b: Math.round((f.list.y + f.list.h - (f.box.y + f.box.h + m)) * 10) / 10 }
        }
      }
      const btns = seq.filter(f => f.inside !== undefined)
      console.log('R3 buttons in turn:', btns.map(f => `${f.name || f.cls} inside=${f.inside} slack ${JSON.stringify(f.slack)} ${f.outline}`).join('\n  '))
      /* pictures: re-focus and shoot the first row's ▼ ✕ and the last row's ▲ ✕ (marker drawn 7px outside the ring) */
      const pics = []
      const pick = [btns.find(f => /Move down|▼/.test(f.name)), btns.filter(f => /Remove|✕/.test(f.name))[0], [...btns].reverse().find(f => /Move up|▲/.test(f.name)), btns.filter(f => /Remove|✕/.test(f.name)).slice(-1)[0]]
      const labels = ['first-row-down', 'first-row-x', 'last-row-up', 'last-row-x']
      for (let i = 0; i < pick.length; i++) {
        const f = pick[i]; if (!f) continue
        const ok = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const b = e && e.closest('button'); if (b) { b.focus(); return true } return false }, [f.box.x + f.box.w / 2, f.box.y + f.box.h / 2])
        await pause(page, 200)
        const cur = await page.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, o: getComputedStyle(a).outlineStyle } })
        await W.mark(page, [{ x: cur.x - 7, y: cur.y - 7, w: cur.w + 14, h: cur.h + 14 }])
        pics.push(await W.snap(page, `r3-ring-${labels[i]}-1440`, { x: Math.max(0, cur.x - 40), y: Math.max(0, cur.y - 30), width: cur.w + 80, height: cur.h + 60 }))
        await W.unmark(page)
        console.log('R3 picture', labels[i], 'focused', ok, 'outline', cur.o)
      }
      const allIn = btns.length > 0 && btns.every(f => f.inside)
      const aligned = rows.reasonVisible ? near(rows.nameLeft, rows.reasonLeft) : null
      rec('R3', '1440x900', 'board, Common Programme row CX; Tab to ✎ Edit; Enter; focus a name box; Tab through every ▲ ▼ ✕',
        `list scroll box ${JSON.stringify(listInfo)}; ${btns.length} buttons reached: ${btns.map(f => `${f.name}: ring box inside ${f.inside} (slack l${f.slack.l} r${f.slack.r} t${f.slack.t} b${f.slack.b}; ${f.outline})`).join(' · ')}; first name box left ${Math.round(rows.nameLeft * 10) / 10} vs reason box left ${rows.reasonLeft == null ? '(reason box not visible while the list is open)' : Math.round(rows.reasonLeft * 10) / 10}`,
        allIn ? 'PASS' : 'FAIL', pics)
      rec('R3b', '1440x900', 'the edit list open: first name box left edge against the reason box left edge', `first name box left ${Math.round(rows.nameLeft * 10) / 10}, reason box left ${rows.reasonLeft == null ? 'not visible' : Math.round(rows.reasonLeft * 10) / 10}; difference ${rows.reasonLeft == null ? 'n/a' : Math.round((rows.nameLeft - rows.reasonLeft) * 10) / 10}px (expected 0 ±1); the list's scroll box starts at ${listInfo.x}, so the name box stands ${Math.round((rows.nameLeft - listInfo.x) * 10) / 10}px inside it`, aligned === false ? 'FAIL' : (aligned ? 'PASS' : 'NOT WALKED'), [alignPic])
      if (aligned === null) rec('R3b', '1440x900', 'first name box left edge against the reason box left edge', 'the reason box is not visible while the edit list is open; compared the name box left ' + Math.round(rows.nameLeft * 10) / 10 + ' with the Cancel sheet\'s own content left instead — see the picture', 'RECORD', [await W.snap(page, 'r3-sheet-1440')])
    }
  } catch (e) { rec('R3', '1440', 'x', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED'); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
  allErrors.push('R3: ' + W.consoleBlock(errors)); await browser.close()
}

/* ---------------- R4 / R5: the note and the windows on a phone ---------------- */
{
  const { browser, page, errors } = await W.openD({ width: 390, height: 844, touch: true })
  try {
    await go(page, 'editsched'); await pause(page, 400)
    const p0 = await W.putAt(page, 'week', 'a:0.0.+'); await pause(page, 500)
    const p1 = await W.putAt(page, 'week', 'a:0.1.+'); await pause(page, 1500)
    console.log('phone puts', p0, p1)
    const NOTE = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return null; const r = t.getBoundingClientRect(); const s = getComputedStyle(t); return { text: t.textContent, at: t.getAttribute('data-at'), opacity: s.opacity, shown: !!t.offsetWidth && s.opacity !== '0', box: { x: r.x, y: r.y, w: r.width, h: r.height } } })
    const overlap = (a, b) => !!a && !!b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    async function scenario(id, label, opener, winSel, closeSel, noteAction) {
      await opener()
      const win0 = await W.rectOf(page, winSel)
      await noteAction(); await page.waitForTimeout(500)
      const n0 = await NOTE()
      const picB = await W.snap(page, `${id.toLowerCase()}-note-with-window-before-close`)
      await W.mark(page, [win0, ...(n0 ? [n0.box] : [])].filter(Boolean))
      const picBm = await W.snap(page, `${id.toLowerCase()}-note-with-window-before-close-marked`)
      await W.unmark(page)
      const ov = n0 && win0 ? overlap(n0.box, win0) : null
      await page.locator(closeSel).tap(); await page.waitForTimeout(250)
      const n1 = await NOTE()
      const picA = await W.snap(page, `${id.toLowerCase()}-note-after-close`)
      const winGone = !(await W.rectOf(page, winSel))
      /* the note stays at the top until it fades: read it again just before it goes */
      await page.waitForTimeout(600)
      const n2 = await NOTE()
      const ok = !!n0 && n0.at === 'top' && !ov && !!n1 && n1.at === 'top' && n1.shown && winGone && (!n2 || !n2.shown || n2.at === 'top')
      rec(id, '390x844 touch', label,
        `note "${n0 && n0.text}" data-at=${n0 && n0.at} box ${n0 && JSON.stringify(n0.box.y | 0) + ',' + (n0.box.h | 0)} · window ${win0 && Math.round(win0.x) + ',' + Math.round(win0.y) + ' ' + Math.round(win0.w) + 'x' + Math.round(win0.h)}; note overlaps window: ${ov}; after closing the window (gone: ${winGone}) the note shown=${n1 && n1.shown} data-at=${n1 && n1.at} opacity ${n1 && n1.opacity}; 600ms later shown=${n2 && n2.shown} data-at=${n2 && n2.at}`,
        ok ? 'PASS' : 'FAIL', [picB, picBm, picA])
    }
    /* R4: the ALL AVAIL window, the note raised by Undo of the second put */
    await scenario('R4', 'tapped the ALL AVAIL count (window up), tapped Undo (note), then ✕ on the window while the note shows',
      async () => { const c = page.locator('#eWeek [data-oilsent]:visible').first(); await c.scrollIntoViewIfNeeded(); await c.tap(); await page.waitForSelector('.availwin:not([hidden])'); await pause(page, 400) },
      '.availwin', '.availwin .win-x', async () => { await page.locator('#undoBtn:visible').tap() })
    await pause(page, 3000)
    /* R5: the changes window, the note raised by Redo */
    await scenario('R5', 'tapped the top bar clock (changes window up), tapped Redo (note), then ✕ on the window while the note shows',
      async () => { await page.locator('#histBtn:visible').tap(); await page.waitForSelector('.chgwin:not([hidden])'); await pause(page, 400) },
      '.chgwin', '.chgwin .win-x', async () => { await page.locator('#redoBtn:visible').tap() })
  } catch (e) { rec('R4', '390 touch', 'x', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED'); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
  allErrors.push('R4/5: ' + W.consoleBlock(errors)); await browser.close()
}

/* ---------------- R6 and R7: the reader's copy, desktop ---------------- */
{
  const { browser, page, errors } = await W.openD({ width: 1440, height: 900 })
  try {
    await go(page, 'editsched')
    await page.evaluate(() => {
      window.__fills = []
      new MutationObserver((recs) => {
        for (const r of recs) {
          const sr = document.getElementById('srSay')
          if (sr && (r.target === sr || sr.contains(r.target))) {
            if (r.type === 'characterData' && r.target.data) window.__fills.push(r.target.data)
            for (const n of r.addedNodes) if ((n.textContent || '').trim()) window.__fills.push(n.textContent)
          }
          for (const n of r.addedNodes) if (n.id === 'srSay' && n.textContent.trim()) window.__fills.push(n.textContent)
        }
      }).observe(document.documentElement, { childList: true, subtree: true, characterData: true })
    })
    const state = () => page.evaluate(() => { const t = document.getElementById('toastEl'), s = document.getElementById('srSay'); return { toast: t && t.textContent, op: t ? getComputedStyle(t).opacity : null, shown: !!t && !!t.offsetWidth && getComputedStyle(t).opacity !== '0', sr: s ? s.textContent : null } })
    const put = await W.putAt(page, 'week', 'a:0.0.+')
    const t0 = Date.now()
    await page.waitForTimeout(100)
    const s100 = await state()
    const pic = await W.snap(page, 'r6-note-and-reader-1440', { x: 0, y: 500, width: 1440, height: 400 })
    let tGone = null, sAtGone = null
    for (let i = 0; i < 80; i++) { const s = await state(); if (!s.shown && s.op !== null) { tGone = Date.now() - t0; sAtGone = s; break } await page.waitForTimeout(200) }
    await page.waitForTimeout(300)
    const sAfter = await state()
    rec('R6', '1440x900', `put ALL AVAIL on a Common Programme row (${put}); read #srSay at +100ms; waited for the note to fade`,
      `+100ms: note "${s100.toast}" (opacity ${s100.op}, shown ${s100.shown}), #srSay "${s100.sr}"; the note was gone (opacity 0 / hidden) after ~${tGone == null ? 'never within 16s' : (tGone / 1000).toFixed(1) + 's'}: at that moment #srSay "${sAtGone && sAtGone.sr}"; 300ms later #srSay "${sAfter.sr}" (note opacity ${sAfter.op})`,
      (s100.sr === s100.toast && !!s100.sr && tGone != null && sAfter.sr === '') ? 'PASS' : 'FAIL', [pic])
    /* R7: the Inputs page */
    await go(page, 'inputs'); await pause(page, 500)
    await page.click('#inListBtn'); await pause(page, 300)
    await page.click('#inRangeBtn'); await page.click('#inRangeAll'); await pause(page, 400)
    await page.waitForTimeout(16000)  /* let any earlier note finish */
    await page.evaluate(() => { window.__fills = [] })
    await page.click('#inNew'); await page.waitForSelector('.inpedwin:not([hidden])'); await pause(page, 500)
    await page.selectOption('#inpEditType', { label: 'Training' }); await pause(page, 300)
    await page.selectOption('#inpEditPerson', { label: 'Anvil' })
    await page.locator('[data-testid="inpEdCal-day-2026-07-15"]').click(); await pause(page, 300)
    await page.click('#inpEditSave'); await pause(page, 900)
    const asked = await page.evaluate(() => /Does it deserve/.test(document.body.innerText))
    const sNow = await state()
    const fills = await page.evaluate(() => window.__fills.slice())
    const told = fills.filter(f => /Input added/.test(f)).length
    const shot = await W.snap(page, 'r7-input-added-1440')
    const winOpen = await page.evaluate(() => { const w = document.querySelector('.inpedwin'); return !!w && !w.hidden && !!w.offsetWidth })
    rec('R7', '1440x900', 'Inputs page, List, All dates: "+ Input", Training for Anvil on Wed 15 Jul, Add',
      `window still open: ${winOpen}; OIL question asked: ${asked}; note shown: ${sNow.shown} (words "${sNow.toast}", opacity ${sNow.op}); #srSay "${sNow.sr}"; fills seen: ${JSON.stringify(fills)} ("Input added" told ${told} time(s))`,
      (asked || winOpen) ? 'NOT WALKED' : (told === 1 && !sNow.shown ? 'PASS' : 'FAIL'), [shot])
  } catch (e) { rec('R6', '1440', 'x', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED'); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
  allErrors.push('R6/7: ' + W.consoleBlock(errors)); await browser.close()
}

/* ---------------- R8: the quick repeat of W1, W4 (at 1920) and W10 ---------------- */
{
  const { browser, page, errors } = await W.openD({ width: 1200, height: 800 })
  try {
    await go(page, 'editsched')
    await openChg(page)
    const a = await measure(page, '.chgwin')
    rec('R8a', '1200x800', 'Edit Schedule: top bar clock → changes window', fm(a) + `; expected top ${a.barBottom + 8}`, near(a.top, a.barBottom + 8) && a.underBarFoot === 'the top bar' ? 'PASS' : 'FAIL', [await W.snap(page, 'r8a-chg-1200')])
    await page.click('.chgwin .win-x'); await pause(page, 300)
    await W.putAt(page, 'week', 'a:0.0.+'); await pause(page, 400)
    /* the board at 1200: ALL AVAIL window top 96 */
    await board(page, 0); await pause(page, 500)
    const chip = page.locator('#schedBoard [data-oilsent]:visible').first()
    await chip.scrollIntoViewIfNeeded(); await chip.click(); await page.waitForSelector('.availwin:not([hidden])'); await pause(page, 400)
    const c = await measure(page, '.availwin')
    rec('R8c', '1200x800', 'Scheduler Board day 0: pressed the count on the board → ALL AVAIL window', `top ${c.top} (expected 96; bar bottom ${c.barBottom})`, near(c.top, 96) ? 'PASS' : 'FAIL', [await W.snap(page, 'r8c-board-avail-1200')])
    await page.click('.availwin .win-x'); await page.click('#sbDone').catch(() => {}); await pause(page, 400)
    /* 1920: both windows 96 */
    await page.setViewportSize({ width: 1920, height: 900 }); await pause(page, 700)
    await go(page, 'editsched'); await pause(page, 300)
    await openChg(page); await openAvail(page)
    const ch = await measure(page, '.chgwin'), av = await measure(page, '.availwin')
    rec('R8b', '1920x900', 'Edit Schedule: changes window and ALL AVAIL window both open', `changes top ${ch.top}, ALL AVAIL top ${av.top} (bar H ${ch.barH}, bottom ${ch.barBottom}); expected 96 each`, near(ch.top, 96) && near(av.top, 96) ? 'PASS' : 'FAIL', [await W.snap(page, 'r8b-both-1920')])
  } catch (e) { rec('R8', '1200', 'x', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED'); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
  allErrors.push('R8: ' + W.consoleBlock(errors)); await browser.close()
}
console.log('CONSOLE', allErrors.join(' || '))
console.log('DONE rewalk')
