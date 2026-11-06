// [NOTSAVED-REFUSAL-LOOK] THE BUG CHECK'S WALK (his D1667, D1668, 6 Nov 26 — "B", the grey note): a refusal of one change
// is the app's plain grey note with a red "no entry" sign, "Blocked:" (or a document's own lead) bold white, the rest
// quieter, read from the left; the Leave War's store refusal is the same grey tag under its box; every other refusal keeps
// its look; "Not saved" stays the failed-save band's alone. Written as assertions of the RIGHT behaviour (a PASS means
// correct — bug-check-order §5, the re-walk). His PC's 1536 in Chromium, his iPhone's 402 × 874 in WebKit, by touch.
// Each refusal is reached through the app's own controls where any control reaches it; what stands in for "another
// device" is named beside it (the test bridge's lwSetRole, the route the drawing and e2e/leavewar.spec.ts use).
// Usage (from raptor-port/, a built dist): WALK_DIR=dist MG_OUT=<pictures> node scripts/handpass/nsr1106-walk.mjs
import * as L from './mg1105-lib.mjs'
import { join } from 'node:path'
import { writeFileSync } from 'node:fs'
const T = (id) => `[data-testid="${id}"]`
const OUT = L.OUT
const shot = async (page, name, sel, pad = { x: 120, y: 70 }) => {
  const vw = page.viewportSize()
  const box = sel ? await page.locator(sel).first().boundingBox().catch(() => null) : null
  if (!box) return page.screenshot({ path: join(OUT, name + '.png') })
  const x = Math.max(0, box.x - pad.x), y = Math.max(0, box.y - pad.y)
  return page.screenshot({ path: join(OUT, name + '.png'), clip: { x, y, width: Math.min(vw.width - x, box.width + pad.x * 2), height: Math.min(vw.height - y, box.height + pad.y * 2) } })
}
/* what the note SHOWS (lesson 22: drawn, not only present) — its face, colours, where its sign stands against its first line */
const noteRead = (page) => page.evaluate(() => {
  const t = document.getElementById('toastEl'); if (!t) return null
  const cs = getComputedStyle(t), s = t.querySelector('.bk-sign'), b = t.querySelector('b')
  const sr = s && s.getBoundingClientRect(), br = b && b.getBoundingClientRect(), tr = t.getBoundingClientRect()
  return {
    text: t.textContent, face: t.dataset.face ?? null, at: t.dataset.at ?? null, opacity: cs.opacity,
    bg: cs.backgroundColor, edge: cs.borderTopColor, align: cs.textAlign, display: cs.display,
    lead: b ? b.textContent : null, leadColour: b ? getComputedStyle(b).color : null, leadWeight: b ? getComputedStyle(b).fontWeight : null,
    rest: t.querySelector('.bk-rest')?.textContent ?? null, restColour: t.querySelector('.bk-rest') ? getComputedStyle(t.querySelector('.bk-rest')).color : null,
    sign: sr ? { w: Math.round(sr.width), h: Math.round(sr.height), x: Math.round(sr.x - tr.x), img: getComputedStyle(s).backgroundImage.slice(0, 30) } : null,
    signVsLead: sr && br ? Math.round((sr.top + sr.height / 2) - (br.top + Math.min(br.height, parseFloat(getComputedStyle(b).lineHeight) || br.height) / 2)) : null,
    box: { x: Math.round(tr.x), y: Math.round(tr.y), w: Math.round(tr.width), h: Math.round(tr.height) },
  }
})
/* red pixels inside the sign's box, counted from the screen (lesson 22) */
async function signPixels(page, sel) {
  const b = await page.locator(sel).first().boundingBox().catch(() => null); if (!b) return 0
  const buf = await page.screenshot({ clip: { x: b.x, y: b.y, width: Math.max(1, b.width), height: Math.max(1, b.height) } })
  return page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
    const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data
    let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 180 && d[i + 1] < 150 && d[i + 2] < 160) n++
    return n
  }, buf.toString('base64'))
}
const GREY = { bg: 'rgb(26, 31, 38)', edge: 'rgb(57, 66, 77)', ink: 'rgb(241, 244, 247)', ink2: 'rgb(182, 192, 203)' }
const isGreyBlocked = (n) => !!n && n.face === 'blocked' && n.bg === GREY.bg && n.edge === GREY.edge && n.leadColour === GREY.ink && Number(n.leadWeight) >= 700 && n.align === 'left' && n.display === 'flex' && n.sign && n.sign.w === 14 && n.sign.h === 14 && /svg/.test(n.sign.img)
const IDB_REFUSE = () => {
  window.__idbRefuse = false
  const put = IDBObjectStore.prototype.put
  IDBObjectStore.prototype.put = function (...a) { if (window.__idbRefuse) throw new DOMException('The quota has been exceeded (walk: forced)', 'QuotaExceededError'); return put.apply(this, a) }
}

for (const size of ['desktop', 'phone']) {
  const sx = size === 'desktop' ? 'desk' : 'phone'
  /* ---- S1 a document the browser cannot store: the input window's own Document button, the store made to refuse (what a
     full browser store does). Expect the grey note, its own words, its lead before the colon; on a phone, with the window
     up, at the top, read from the left */
  {
    const { page } = await L.open(size)
    await page.context().addInitScript(IDB_REFUSE)
    await page.reload(); await page.waitForSelector('#luser')
    await L.signIn(page, 'us', 'us')
    await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(900)
    await page.locator('#inListBtn').first().click(); await page.waitForTimeout(500)
    await page.locator(T('in-new')).first().click(); await page.waitForTimeout(700)
    await page.evaluate(() => { window.__idbRefuse = true })
    await page.locator('input[type="file"][accept="image/*,application/pdf"]').first().setInputFiles({ name: 'medical-cert.png', mimeType: 'image/png', buffer: Buffer.alloc(2048, 1) })
    await page.waitForTimeout(600)
    const n = await noteRead(page)
    L.check(`S1-${sx}`, 'document refused: the grey note, "Couldn\'t save that document:" its bold lead, the rest after it', isGreyBlocked(n) && n.lead === "Couldn't save that document:" && /^ your browser storage may be full/.test(n.rest || '') && n.restColour === GREY.ink2, n)
    if (size === 'phone') L.check(`S1-${sx}b`, 'on a phone with the window up: the note at the top, full width less 12px a side', n?.at === 'top' && n.box.x === 12 && n.box.w === 402 - 24, n?.box)
    L.check(`S1-${sx}c`, 'the sign is DRAWN (red pixels in its box)', (await signPixels(page, '#toastEl .bk-sign')) > 20, await signPixels(page, '#toastEl .bk-sign'))
    L.check(`S1-${sx}d`, 'the sign stands level with the lead\'s first line (±2px)', n && Math.abs(n.signVsLead) <= 2, n?.signVsLead)
    await shot(page, `S1-document-${sx}`, '#toastEl', { x: 30, y: 30 })
    await page.screenshot({ path: join(OUT, `S1-document-whole-${sx}.png`) })
    /* B1 the next note of another kind is a plain note again — the app's own "Input added"-type note raised next */
    await page.evaluate(() => window.toast('Input added', undefined)); await page.waitForTimeout(250)
    const p = await noteRead(page)
    L.check(`B1-${sx}`, 'the next plain note: no sign, no grey "Blocked" face, its own centring', p && p.face === null && p.sign === null && p.text === 'Input added', p)
    await page.context().close()
  }
  /* ---- S2–S5 the Leave War's Balances page, as the admin Saber */
  {
    const { page } = await L.open(size)
    await L.signIn(page, 'ad', 'a')
    await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
    await page.locator(T('lw-tab-balances')).first().click(); await page.waitForTimeout(900)
    const bx = T('bal-LVE-dice')
    await page.locator(bx).scrollIntoViewIfNeeded()
    /* S4 a figure the box cannot take keeps the RED tag in its own words — never "Blocked", no sign */
    await page.locator(bx).click(); await page.locator(bx).fill('abc'); await page.keyboard.press('Enter'); await page.waitForTimeout(300)
    const red = await page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); return { text: e.textContent, cls: e.className, bg: c.backgroundColor, edge: c.borderTopColor, sign: !!e.querySelector('.bk-sign') } }, T('bal-LVE-dice-err'))
    L.check(`S4-${sx}`, 'a figure it cannot take: the red tag, its words, no sign', red && red.cls === 'bp-err' && red.bg === 'rgb(42, 18, 21)' && red.edge === 'rgb(255, 122, 132)' && !red.sign && /^Type a whole number/.test(red.text), red)
    await shot(page, `S4-figbox-red-${sx}`, bx, { x: 200, y: 50 })
    await page.keyboard.press('Escape'); await page.waitForTimeout(200)
    /* S3 the store's own refusal under the box — the drawing's route: this tab's Leave War view reads Saber as an admin
       while the app's session is a member's (the bridge's lwSetRole — what a role changed from another device does) */
    await L.signOut(page); await L.signIn(page, 'us', 'us')
    await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1200)
    await page.evaluate(() => window.lwSetRole && window.lwSetRole('admin')); await page.waitForTimeout(500)
    await page.locator(T('lw-tab-balances')).first().click().catch(() => {}); await page.waitForTimeout(800)
    const offered = await page.locator(bx).first().evaluate(e => e.tagName).catch(() => null)
    if (offered === 'INPUT') {
      await page.locator(bx).click(); await page.locator(bx).fill('7'); await page.keyboard.press('Enter'); await page.waitForTimeout(150)
      const tag = await page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); const b = e.querySelector('b'); return { text: e.textContent, cls: e.className, bg: c.backgroundColor, edge: c.borderTopColor, sign: !!e.querySelector('.bk-sign'), lead: b && getComputedStyle(b).color } }, T('bal-LVE-dice-err'))
      const notes = await page.evaluate(() => window.__notes.slice(-3))
      if (tag) {
        L.check(`S3-${sx}`, 'the store refused: "Blocked" in the grey tag with its red sign', tag.cls === 'bp-err bp-blocked' && tag.text === 'Blocked' && tag.sign && tag.bg === GREY.bg && tag.edge === GREY.edge && tag.lead === GREY.ink, tag)
        await shot(page, `S3-figbox-blocked-${sx}`, bx, { x: 200, y: 50 })
      } else L.note(`S3-${sx}`, { tag: 'none on screen — the refusal put the war\'s view back and the box went (as the drawing found: [LW-NIGHT1025-OLDER])', notes })
      const said = notes.find(t => /Not saved|not saved/.test(t))
      L.check(`S3-${sx}b`, 'nothing the refusal says reads "Not saved" (the band\'s alone)', !said, notes)
      await page.screenshot({ path: join(OUT, `S3-after-${sx}.png`) })
    } else L.notWalked(`S3-${sx}`, `the box is not offered to a member's tab read as an admin (${offered}) — pinned by balances.test.tsx "the store said no"`)
    await page.context().close()
  }
  /* ---- S2 a box leaving the screen with a figure the app then refuses — Saber types in another man's box, then his tab's
     Leave War view becomes a member's (the bridge's lwSetRole: a role changed from another device): the boxes go, and
     the refusal is said in the passing note */
  {
    const { page } = await L.open(size)
    await L.signIn(page, 'ad', 'a')
    await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
    await page.locator(T('lw-tab-balances')).first().click(); await page.waitForTimeout(900)
    const bx = T('bal-LVE-dice')
    await page.locator(bx).scrollIntoViewIfNeeded()
    await page.locator(bx).click(); await page.locator(bx).fill('9'); await page.waitForTimeout(100)
    await page.evaluate(() => window.lwSetRole('member')); await page.waitForTimeout(500)
    const n = await noteRead(page)
    L.check(`S2-${sx}`, 'the box gone with a refused figure: "Blocked: <box>. <why>." in the grey note', isGreyBlocked(n) && n.lead === 'Blocked:' && /\. .+\.$/.test(n.rest || ''), n)
    await shot(page, `S2-figbox-gone-${sx}`, '#toastEl', { x: 30, y: 30 })
    await page.screenshot({ path: join(OUT, `S2-figbox-gone-whole-${sx}.png`) })
    await page.context().close()
  }
  /* ---- S5 the Grades window: an emptied name keeps the red tag; the store's "Blocked" there is reached by no control
     (the same refusal as S3) — pinned by balances.test.tsx */
  {
    const { page } = await L.open(size)
    await L.signIn(page, 'ad', 'a')
    await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
    await page.locator(T('lw-tab-balances')).first().click(); await page.waitForTimeout(900)
    await page.locator(T('bal-grades')).first().click(); await page.waitForTimeout(700)
    const g = await page.evaluate(() => document.querySelector('[data-testid^="grade-name-"]')?.dataset.testid ?? null)
    if (g) {
      await page.locator(T(g)).click(); await page.locator(T(g)).fill(''); await page.keyboard.press('Enter'); await page.waitForTimeout(300)
      const r = await page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); return { text: e.textContent, cls: e.className, bg: c.backgroundColor, sign: !!e.querySelector('.bk-sign') } }, T(g + '-err'))
      L.check(`S5-${sx}`, 'an emptied grade name: the red tag, its words, no sign', r && r.cls === 'bp-err' && r.bg === 'rgb(42, 18, 21)' && !r.sign, r)
      await shot(page, `S5-grades-red-${sx}`, T(g), { x: 120, y: 90 })
    } else L.notWalked(`S5-${sx}`, 'no grade name box in the Grades window')
    await page.context().close()
  }
  /* ---- S6 the schedule's two catch-all refusals — NO control reaches either (each fires only when a window forgets its own
     refusal: inputedit.tsx saveBatchX, and the group save with no reason heard). Their words are pinned by
     toastblocked.test.ts; here only their LOOK, raised through the app's own note with the built words, over Edit Schedule */
  {
    const { page } = await L.open(size)
    await L.signIn(page, 'ad', 'a')
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1300)
    for (const [id, words] of [['S6a', 'Blocked: nothing was kept'], ['S6b', 'Blocked: that change is not yours to make']]) {
      await page.evaluate((w) => window.toast(w, 'blocked'), words); await page.waitForTimeout(300)
      const n = await noteRead(page)
      L.check(`${id}-${sx}`, `"${words}" in the grey note (look only — no control reaches it)`, isGreyBlocked(n) && n.text === words, n)
      await shot(page, `${id}-schedule-${sx}`, '#toastEl', { x: 30, y: 30 })
    }
    /* B2 a long refusal on a narrow screen wraps under its own words, the sign at the first line */
    await page.evaluate(() => window.toast('Blocked: Maverick-Longcallsign LVE App bal. You can change only your own figures.', 'blocked')); await page.waitForTimeout(300)
    const lg = await noteRead(page)
    L.check(`B2-${sx}`, 'a long one: grey, read from the left, the sign level with the first line, inside the screen', isGreyBlocked(lg) && Math.abs(lg.signVsLead) <= 2 && lg.box.x >= 0 && lg.box.x + lg.box.w <= page.viewportSize().width, lg)
    await shot(page, `B2-long-${sx}`, '#toastEl', { x: 30, y: 30 })
    await page.context().close()
  }
  /* ---- S7 the failed-save band is untouched: "Not saved — keep this page open", amber, Retry (?savefail, D1666) */
  {
    const { page } = await L.open(size)
    await page.goto(L.URL + '?savefail'); await page.waitForSelector('#luser')
    await L.signIn(page, 'ad', 'a')
    await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
    await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click().catch(() => {}); await page.waitForTimeout(300)
    await page.locator('#admGuestView').click().catch(() => {}); await page.waitForTimeout(1200)
    const band = await page.evaluate(() => { const b = document.querySelector('.savestat.failed, .saveband'); if (!b) return null; const l = b.querySelector('b'); return { text: (b.textContent || '').replace(/\s+/g, ' ').trim(), lead: l && l.textContent, leadColour: l && getComputedStyle(l).color, blockedSign: !!b.querySelector('.bk-sign') } })
    L.check(`S7-${sx}`, 'the band still says "Not saved", amber, with its own sign', band && band.lead === 'Not saved' && band.leadColour === 'rgb(242, 212, 107)' && !band.blockedSign, band)
    await shot(page, `S7-band-${sx}`, '.savestat.failed, .saveband', { x: 20, y: 20 })
    await page.context().close()
  }
}
writeFileSync(join(OUT, 'walk-log.txt'), L.results.join('\n') + '\n\nerrors:\n' + L.errs.join('\n') + '\n')
console.log('errors', L.errs.length, L.errs.slice(0, 8))
const fails = L.results.filter(r => r.startsWith('FAIL'))
console.log(`${L.results.filter(r => r.startsWith('PASS')).length} pass, ${fails.length} fail`)
process.exit(fails.length ? 1 : 0)
