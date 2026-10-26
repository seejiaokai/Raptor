// M3 walk, walker B — harness (scenario runner, role switch, files). Build served at :4302.
import * as L from './lw-m3-walk-b-lib.mjs'
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
export { L }
export const T = L.T
export const sleep = (w, ms) => w.page.waitForTimeout(ms)
export const P = n => String(n).padStart(2, '0')
import zlib from 'node:zlib'
function crc(buf) { let c, r = 0xffffffff; for (let n = 0; n < buf.length; n++) { c = (r ^ buf[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; r = (r >>> 8) ^ c } return (r ^ 0xffffffff) >>> 0 }
function chunk(t, d) { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]) }
export function makePng(w = 240, h = 140) {
  const raw = Buffer.alloc((w * 3 + 1) * h)
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; for (let x = 0; x < w; x++) { const o = y * (w * 3 + 1) + 1 + x * 3; raw[o] = (x * 255 / w) | 0; raw[o + 1] = 120; raw[o + 2] = (y * 255 / h) | 0 } }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 2
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}
export const pdfPath = (name = 'walk-b.pdf') => { const p = path.join(L.OUT, name); if (/\.png$/.test(name)) writeFileSync(p, makePng()); else writeFileSync(p, '%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n'); return p }
export class Sc {
  constructor(id, size, engine) { this.id = id; this.size = size; this.engine = engine; this.notes = []; this.fails = []; this.pics = []; this.notrun = null }
  ok(cond, text) { this.notes.push((cond ? 'ok: ' : 'FAIL: ') + text); if (!cond) this.fails.push(text) }
  say(text) { this.notes.push(text) }
  pic(n) { this.pics.push(n + '.png') }
}
export const all = []
export const errsAll = []
export function makeRunner(ONLY) {
  return async function run(id, size, w, fn, { engine = 'chromium', keep = false } = {}) {
    if (ONLY && !ONLY.has(String(id).replace(/[^\d].*/, ''))) return
    const S = new Sc(id, size, engine)
    try { await fn(w, S) } catch (e) {
      console.log('   STACK: ' + String(e.stack).split('\n').slice(0, 5).map(x => x.trim().slice(0, 140)).join(' / '))
      S.fails.push('SCRIPT/STEP ERROR: ' + String(e.message).split('\n')[0].slice(0, 240))
      const n = `s${P(id)}-error-${size}-${engine}`; try { await L.shot(w, n); S.pic(n) } catch {}
    }
    const verdict = S.notrun ? 'NOT RUN' : S.fails.length ? 'FAIL' : 'PASS'
    all.push({ id, size, engine, verdict, notes: S.notes, fails: S.fails, pics: S.pics, notrun: S.notrun })
    console.log(`${verdict}  S${id} [${size}/${engine}]  ${S.notrun ? S.notrun : S.fails.join(' || ') || S.notes.filter(n => n.startsWith('ok')).length + ' checks ok'}`)
    for (const n of S.notes) console.log('     ' + n)
    errsAll.push(...w.errs.splice(0).map(e => `[S${id} ${size}/${engine}] ` + e))
  }
}
export function finish(tag) {
  writeFileSync(path.join(L.OUT, `results-${tag}.json`), JSON.stringify({ all, errs: errsAll }, null, 1))
  console.log('\nERRORS:', errsAll.length ? errsAll : 'none')
}
/* sign out and back in as the other role, inside the same page (the in-memory world stays) */
export async function switchTo(w, who, today = '2026-01-05') {
  const { page } = w
  await L.closeAny(w).catch(() => {})
  await page.evaluate(() => window.scrollTo(0, 0))
  if (w.phone) { await L.press(w, '#burger'); await sleep(w, 500); await L.press(w, '#drawerLogout') } else await L.press(w, '#logout')
  await page.waitForSelector('#luser', { timeout: 8000 })
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  if (today) await page.evaluate(t => window.lwSetMemberToday(t), today)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector(`[data-testid="row-${who === 'admin' ? 'stiff' : 'bane'}"]`)
  await sleep(w, 800)
}
export async function fresh(size, who, engine = 'chromium', today = '2026-01-05') {
  const w = await L.newCtx(size, engine)
  await L.signIn(w, who, who === 'member' ? today : undefined)
  return w
}
export const setDoc = async (w, name = 'walk-b.pdf', scope = '[data-testid="bid-doc-row"]') => { await w.page.locator(`${scope} input[type=file]`).first().setInputFiles(pdfPath(name)); await sleep(w, 700) }
/* a leave button, with the "tap again" ask of a below-zero bid answered */
export async function placeLeave(w, type) {
  await L.press(w, T(`bid-${type}`)); await sleep(w, 500)
  if (await L.vis(w.page, T('bid-picker'))) { await L.press(w, T(`bid-${type}`)); await sleep(w, 600) }
  return !(await L.vis(w.page, T('bid-picker')))
}
export const winText = async w => (await L.sheetDump(w.page))?.text || null
export const chips = w => w.page.evaluate(() => [...document.querySelectorAll('[data-testid="bid-doc-row"] *')].filter(e => e.children.length === 0 && e.textContent.trim()).map(e => e.textContent.trim()))

/* a range bid by the admin (ticked: approved), on the Ranger row; days in one month; a file and a remark first */
export async function placeRange(w, iso0, iso1, { doc = true, remark = '', type = 'LL', portion = null } = {}) {
  await L.openCell(w, 'bane', iso0)
  if (iso1 !== iso0) {
    await L.press(w, T('span-range')); await sleep(w, 400)
    await L.press(w, T('span-day-' + iso0)); await sleep(w, 200)
    await L.press(w, T('span-day-' + iso1)); await sleep(w, 300)
  }
  if (portion) await L.press(w, T('portion-' + portion))
  if (doc) await setDoc(w, typeof doc === 'string' ? doc : 'walk-b.pdf')
  if (remark) { const r = w.page.locator(T('bid-remarks')); await r.fill(remark); await r.press('Enter'); await sleep(w, 200) }
  return placeLeave(w, type)
}
export async function inputsList(w, search = 'Ranger') {
  await w.page.evaluate(() => window.go('inputs')); await sleep(w, 900)
  await L.press(w, '#inListBtn'); await sleep(w, 500)
  await L.press(w, '#inRangeBtn'); await sleep(w, 500)
  await w.page.locator('#inRangeAll').click(); await sleep(w, 700)
  if (search) { if (!(await L.vis(w.page, '#inFSearch'))) { await L.press(w, '#inFiltersBtn'); await sleep(w, 500) } await w.page.fill('#inFSearch', search); await sleep(w, 500) }
}
export const listRows = w => w.page.evaluate(() => [...document.querySelectorAll('#page-inputs tr[data-iid], #page-inputs .icard[data-iid]')].map(r => { const card = r.classList.contains('icard'); let day = ''; if (card) { let p = r.previousElementSibling; while (p && !p.classList.contains('icard-day')) p = p.previousElementSibling; const d = p ? new Date(p.dataset.iso + 'T00:00:00Z') : null; day = d ? d.getUTCDate() + ' ' + d.toLocaleString('en', { month: 'short', timeZone: 'UTC' }) + ' ' : '' } return { iid: r.dataset.iid, card, text: (card ? day : '') + r.innerText.replace(/s+/g, ' ').trim().slice(0, 110), clip: !!r.querySelector('.rclip, [data-doc], [data-testid="inl-clip"]'), doc: r.querySelector('.rclip')?.dataset.doc || null } }))
export const toWar = async (w, mon) => { await w.page.evaluate(() => window.go('leavewar')); await sleep(w, 900); await L.gotoMonth(w, mon) }


/* does this Inputs row carry a file? the desktop row shows a paperclip; a phone card is opened and its Document row read */
export async function rowHasFile(w, r) {
  if (r.clip) return true
  if (!r.card) return false
  await w.page.locator(`[data-iid="${r.iid}"] [data-testid="inl-open"]`).first().click(); await sleep(w, 800)
  const n = await w.page.evaluate(() => document.querySelectorAll('.floatwin .docchip').length)
  await w.page.locator('.floatwin .win-x').first().click().catch(() => {}); await sleep(w, 500)
  return n > 0
}
