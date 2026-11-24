// draw-trk v1 (24 Nov 26) — the Tracker's member-view question: TODAY's real screens (T1–T4, Stay, Discard) and ONE drawn
// proposal (N1) on the real app. Method: .claude/skills/brainstorming/mockups-on-the-real-app.md.
//   node raptor-port/docs/mock/2026-11-24-msq-night-questions/draw-trk.mjs desk|phone [today,stay,discard,n1]
// desk = Chromium 1536x864 at scale 2 (+ a scale-1 true-size copy of each crop); phone = his iPhone's 402x874 in WebKit,
// touch, scale 3. Pictures: ./checked/trk-today-*.png, ./checked/trk-new-N1-*.png. Drawn words: ./words-trk.json.
// The case: Hunter (ad2/a2, admin of 142, Plan of 149 given by Saber through Admin → Users) picks 149, makes an unsaved
// chart edit (+ Test "TRKA" in Edit chart layout), switches to the member view, then picks 142 (or presses Logout).
// N1's ONE transform: the open question box's message words (#dlgMsg) and its third button's label (#dlgOk) are
// re-lettered; nothing cloned, restyled, moved or removed. Every step before it is a real press.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { SZ, ENGINE, PICS, mk, run, fact, fail, log, press, go, pickSq, roleSwitch, logout, trackerReady, hunterOn149, addEvent, dlg, waitDlg, waitNoDlg, where, bar, frames, shut } from '../../../scripts/handpass/n162/trk-lib.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const W = JSON.parse(readFileSync(resolve(HERE, 'words-trk.json'), 'utf8'))
const PARTS = (process.argv[3] || 'today,stay,discard,n1').split(',')
const DEV = SZ === 'desk' || SZ === 'd' ? 'desk' : 'phone'
console.log('draw-trk v1', SZ, ENGINE, PARTS.join(','))

/* ---- pictures: a full screen, a crop (about 700 wide on the desktop, full width on the phone), and on the desktop a
   scale-1 true-size copy of the crop (the same page, its density set to 1 for that one shot and put back) ---- */
async function pics(s, base, sel, { full = true } = {}) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await frames(s)
  const out = []
  if (full) { await page.screenshot({ path: `${PICS}/${base}-full.png` }); out.push(`${base}-full.png`) }
  const r = await page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => { const b = x.getBoundingClientRect(); return b.width > 0 && b.height > 0 }); if (!e) return null; const b = e.getBoundingClientRect(); return { L: b.left, T: b.top, R: b.right, B: b.bottom, W: innerWidth, H: innerHeight } }, sel)
  if (!r) fail(`crop ${base}: ${sel} not drawn`)
  let x, w
  if (s.desk) { w = Math.min(700, r.W); x = Math.max(0, Math.min(r.W - w, (r.L + r.R) / 2 - w / 2)) } else { x = 0; w = r.W }
  const y = Math.max(0, Math.round(r.T - 24)), h = Math.min(r.H - y, Math.round(r.B - r.T + 48))
  const clip = { x, y, width: w, height: h }
  await page.screenshot({ path: `${PICS}/${base}-crop.png`, clip }); out.push(`${base}-crop.png`)
  if (s.desk && ENGINE === 'chromium') {
    /* one image pixel per page pixel (Playwright's scale 'css'; Chromium captures the clip at that scale) */
    await page.screenshot({ path: `${PICS}/${base}-crop-1x.png`, clip, scale: 'css' }); out.push(`${base}-crop-1x.png`)
  }
  fact(`${base}.pictures`, out)
  return out
}

/* ---- the question box measured: words, labels, size, the message's line count, each button's box, fit and cuts ---- */
const measureBox = s => s.page.evaluate(() => {
  const d = [...document.querySelectorAll('#dlgModal')].find(e => e.getBoundingClientRect().width > 0)
  if (!d) return { up: false }
  const m = d.querySelector('#dlgMsg'), rb = e => { const r = e.getBoundingClientRect(); return { l: Math.round(r.left * 10) / 10, t: Math.round(r.top * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, r: r.right, b: r.bottom } }
  const box = rb(d)
  /* lines of the message: the distinct tops of its text's line boxes */
  const rg = document.createRange(); rg.selectNodeContents(m)
  const tops = [...rg.getClientRects()].filter(r => r.width > 0).map(r => Math.round(r.top))
  const lineTops = []; for (const t of tops.sort((a, b) => a - b)) if (!lineTops.length || t - lineTops[lineTops.length - 1] > 4) lineTops.push(t)
  const btns = [...d.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => {
    const r = rb(b); return { id: b.id, label: b.textContent, box: [r.l, r.t, r.w, r.h], insideBox: r.l >= box.l - 0.5 && r.r <= box.r + 0.5 && r.t >= box.t - 0.5 && r.b <= box.b + 0.5, insideScreen: r.l >= -0.5 && r.r <= innerWidth + 0.5 && r.t >= -0.5 && r.b <= innerHeight + 0.5, cut: b.scrollWidth > b.clientWidth + 0.5 || b.scrollHeight > b.clientHeight + 0.5, wraps: r.h > 40 }
  })
  const oneRow = btns.length > 0 && btns.every(b => Math.abs(b.box[1] - btns[0].box[1]) < 1 && Math.abs(b.box[3] - btns[0].box[3]) < 1)
  return {
    up: true, msg: m.textContent, labels: btns.map(b => b.label), box: [box.l, box.t, box.w, box.h],
    msgLines: lineTops.length, msgCut: m.scrollWidth > m.clientWidth + 0.5 || m.scrollHeight > m.clientHeight + 0.5,
    buttons: btns, buttonsOneRow: oneRow, allInsideBox: btns.every(b => b.insideBox), allInsideScreen: btns.every(b => b.insideScreen),
    anyButtonCut: btns.some(b => b.cut), boxInsideScreen: box.l >= -0.5 && box.r <= innerWidth + 0.5 && box.t >= -0.5 && box.b <= innerHeight + 0.5,
    focus: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : null,
    zoom: window.visualViewport ? window.visualViewport.scale : 1,
  }
})
function boxFacts(key, m) {
  for (const k of ['msg', 'labels', 'box', 'msgLines', 'msgCut', 'buttonsOneRow', 'allInsideBox', 'allInsideScreen', 'anyButtonCut', 'boxInsideScreen', 'focus', 'zoom']) fact(`${key}.${k}`, m[k])
  for (const b of m.buttons || []) fact(`${key}.button.${b.id}`, { label: b.label, box: b.box, insideBox: b.insideBox, insideScreen: b.insideScreen, cut: b.cut })
}
/* on the phone, a tap on a neutral element (the box's own words) before a picture, so no control stays focused by a tap */
async function neutral(s) { if (!s.desk) { await press(s, '#dlgMsg', 'the box words (neutral)'); } }

const MEMBER = /Back to the admin view/
async function toMember(s) {
  await roleSwitch(s)
  await s.page.waitForFunction(src => { const r = document.querySelector('#roleBadge'), d = document.querySelector('#drawerRole'); return new RegExp(src).test((r?.getAttribute('title') || '') + (d?.textContent || '')) }, MEMBER.source, { timeout: 10000 }).catch(() => fail('member view not reached'))
}
async function held() {
  const s = await mk()
  await hunterOn149(s)
  await addEvent(s, 'TRKA')
  await toMember(s)
  const w = await where(s); fact(`${DEV}.held.where`, w)
  if (!/149/.test(w.sq || '')) fail('not on 149 in the member view')
  return s
}
const ask = async (s, how) => {
  if (how === 'logout') { await logout(s); await waitDlg(s, /Save them before logging out\?/) }
  else { await pickSq(s, '142'); await waitDlg(s, /Save them before switching to 142\?/) }
}
/* the way back's own words, read from the app: the desktop chip's hover title, the phone ☰ line */
async function wayBackWords(s) {
  if (s.desk) {
    const t = await s.page.evaluate(() => document.querySelector('#roleBadge')?.getAttribute('title'))
    await s.page.locator('#roleBadge').hover(); await frames(s)
    fact(`${DEV}.wayBack.chipTitle`, t); fact(`${DEV}.wayBack.chipText`, await s.page.evaluate(() => document.querySelector('#roleBadge')?.textContent))
    return t
  }
  await press(s, '#burger', '☰')
  const t = await s.page.evaluate(() => document.querySelector('#drawerRole')?.textContent)
  fact(`${DEV}.wayBack.drawerLine`, t)
  await shut(s)
  return t
}

await run('draw-trk', async () => {
  /* ===== TODAY ===== */
  if (PARTS.includes('today')) {
    log(`--- today (${DEV})`)
    const s = await held()
    const way = await wayBackWords(s)
    if (way !== W.thirdLabel) fail(`words-trk.json thirdLabel "${W.thirdLabel}" is not the app's own "${way}"`)
    /* T4: the Tracker tab itself while he is in the member view with the edit held */
    /* the member view on 149 offers no Tracker tab (draw-trk-probe.mjs): the pages offered, and the cover's words as the
       page holds them (in the page, not on screen) are read; a picture of the screen he has shows that no Tracker is there */
    if (!s.desk) { await press(s, '#burger', '☰'); fact(`${DEV}.T4.menuPages`, await s.page.evaluate(() => [...document.querySelectorAll('#drawerNav a[data-page]')].filter(a => !a.hidden && a.getBoundingClientRect().width > 0).map(a => a.textContent.trim()))) }
    else fact(`${DEV}.T4.barPages`, await s.page.evaluate(() => [...document.querySelectorAll('#topnav a[data-page]')].filter(a => !a.hidden && a.getBoundingClientRect().width > 0).map(a => a.textContent.trim())))
    const cover = await s.page.evaluate(() => { const b = document.querySelector('[data-testid="trk-cover-band"]'); if (!b) return null; const r = b.getBoundingClientRect(); const t = r.width > 0 ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null; const cs = getComputedStyle(b); let hid = null; for (let e = b; e; e = e.parentElement) { const c = getComputedStyle(e); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) { hid = `${e.tagName}#${e.id}.${e.className}`; break } } return { text: b.textContent.replace(/\s+/g, ' ').trim(), hasBox: r.width > 0 && r.height > 0, seenAtItsMiddle: !!t && (t === b || b.contains(t)), hiddenBy: hid, visibility: cs.visibility, rect: [r.left, r.top, r.width, r.height].map(Math.round), trackerTabOffered: [...document.querySelectorAll('#topnav a[data-page="tracker"], #drawerNav a[data-page="tracker"]')].some(a => !a.hidden && a.getBoundingClientRect().width > 0) } })
    fact(`${DEV}.T4.cover`, cover); fact(`${DEV}.T4.where`, await where(s))
    await pics(s, `trk-today-T4-${DEV}`, s.desk ? '#topnav' : '#drawerNav')
    if (!s.desk) await shut(s)
    /* T1: the pick's question, then T2: the refusal */
    await ask(s, 'pick')
    await neutral(s)
    const q = await measureBox(s); boxFacts(`${DEV}.T1.pick`, q); fact(`${DEV}.T1.where`, await where(s))
    await pics(s, `trk-today-T1-${DEV}`, '#dlgModal')
    await press(s, '#dlgOk', 'Save them'); await waitDlg(s, /could not be saved/)
    await neutral(s)
    const r = await measureBox(s); boxFacts(`${DEV}.T2`, r); fact(`${DEV}.T2.where`, await where(s))
    await pics(s, `trk-today-T2-${DEV}`, '#dlgModal')
    await press(s, '#dlgOk', 'OK'); await waitNoDlg(s)
    /* T3: back in the admin view, the Tracker's bar */
    await roleSwitch(s)
    await s.page.waitForFunction(() => { const r = document.querySelector('#roleBadge'), d = document.querySelector('#drawerRole'); return /Switch to the member view/.test((r?.getAttribute('title') || '') + (d?.textContent || '')) }, null, { timeout: 10000 }).catch(() => fail('admin view not reached'))
    if ((await where(s)).page !== 'page-tracker') await go(s, 'tracker')
    await trackerReady(s)
    const b = await bar(s)
    fact(`${DEV}.T3.where`, await where(s))
    for (const k of ['fullText', 'visibleText', 'boxWidth', 'naturalTextWidth', 'cut', 'barHeight', 'barRows', 'saveChangesText']) fact(`${DEV}.T3.bar.${k}`, b[k])
    if (!/could not be saved/.test(b.fullText || '')) fail('T3: the bar does not hold the words')
    await pics(s, `trk-today-T3-${DEV}`, '#page-tracker header .saveslot')
    await s.ctx.close()
    /* T1 logout variant: crop only */
    const s2 = await held()
    await ask(s2, 'logout'); await neutral(s2)
    const ql = await measureBox(s2); boxFacts(`${DEV}.T1.logout`, ql)
    await pics(s2, `trk-today-T1-${DEV}-logout`, '#dlgModal', { full: false })
    await s2.ctx.close()
  }
  /* ===== STAY and DISCARD in the member-view pick question (each a fresh run) ===== */
  for (const which of ['stay', 'discard']) {
    if (!PARTS.includes(which)) continue
    log(`--- ${which} (${DEV})`)
    const s = await held()
    await ask(s, 'pick')
    await press(s, which === 'stay' ? '#dlgCancel' : '#dlgAlt', which === 'stay' ? 'Stay' : 'Discard them')
    await waitNoDlg(s).catch(() => log('a box is still up'))
    if (which === 'discard') await s.page.waitForFunction(() => /142/.test(([...document.querySelectorAll('.topbar .mark')].find(e => e.getBoundingClientRect().width > 1) || document.querySelector('.drawer-sqn .mark'))?.textContent || ''), null, { timeout: 15000 }).catch(() => log('not on 142 after Discard'))
    fact(`${DEV}.${which}.after.where`, await where(s)); fact(`${DEV}.${which}.after.box`, await dlg(s))
    await roleSwitch(s)
    await s.page.waitForFunction(() => { const r = document.querySelector('#roleBadge'), d = document.querySelector('#drawerRole'); return /Switch to the member view/.test((r?.getAttribute('title') || '') + (d?.textContent || '')) }, null, { timeout: 10000 }).catch(() => fail('admin view not reached'))
    if ((await where(s)).page !== 'page-tracker') await go(s, 'tracker')
    await trackerReady(s)
    const b = await bar(s)
    fact(`${DEV}.${which}.admin.where`, await where(s))
    fact(`${DEV}.${which}.admin.editOnChart`, await s.page.evaluate(() => document.querySelector('#page-tracker').innerText.includes('TRKA')))
    fact(`${DEV}.${which}.admin.saveChangesShown`, b.saveChangesShown); fact(`${DEV}.${which}.admin.barText`, b.fullText)
    await s.ctx.close()
  }
  /* ===== N1, drawn ===== */
  if (PARTS.includes('n1')) {
    const cases = [['c1', 'pick'], ['c1', 'logout'], ...(DEV === 'desk' ? [['c2', 'pick']] : [])]
    for (const [c, how] of cases) {
      log(`--- N1 ${c} ${how} (${DEV})`)
      const words = W[c] && W[c][how]; if (!words) fail(`words-trk.json has no ${c}.${how}`)
      const s = await held()
      const way = await wayBackWords(s)
      if (way !== W.thirdLabel) fail(`words-trk.json thirdLabel "${W.thirdLabel}" is not the app's own "${way}"`)
      await ask(s, how)
      const today = await measureBox(s)
      /* the first line kept as today */
      if (words.split('\n')[0] !== today.msg.split('\n')[0]) fail(`drawn first line differs from today's: "${today.msg.split('\n')[0]}"`)
      await neutral(s)
      /* THE TRANSFORM: re-letter the message and the third button, then assert just before each picture */
      const draw = () => s.page.evaluate(([m, l]) => { const d = [...document.querySelectorAll('#dlgModal')].find(e => e.getBoundingClientRect().width > 0); d.querySelector('#dlgMsg').textContent = m; d.querySelector('#dlgOk').textContent = l }, [words, W.thirdLabel])
      const holds = () => s.page.evaluate(([m, l]) => { const d = [...document.querySelectorAll('#dlgModal')].find(e => e.getBoundingClientRect().width > 0); return !!d && d.querySelector('#dlgMsg').textContent === m && d.querySelector('#dlgOk').textContent === l }, [words, W.thirdLabel])
      await draw(); await frames(s)
      if (!(await holds())) fail('drawn words not held before the measure')
      const m = await measureBox(s); boxFacts(`${DEV}.N1.${c}.${how}`, m)
      fact(`${DEV}.N1.${c}.${how}.todayBox`, today.box)
      await draw(); if (!(await holds())) fail('drawn words not held before the picture')
      await pics(s, `trk-new-N1-${c}-${how}-${DEV}`, '#dlgModal')
      if (!(await holds())) fail('drawn words gone after the picture')
      await s.ctx.close()
    }
  }
})
