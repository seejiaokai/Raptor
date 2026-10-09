/* Independent runtime supplement, Astra, 5 Oct 2026. NOT EXECUTED at authoring.
 * Fresh per-case browser-local backend; no production state or source mutations.
 * Run only after host freezes dist and explicitly assigns the shared heavy lock:
 *   SANS_FROZEN=1 SANS_LOCK_HELD=1 HP_URL=http://localhost:4192 node supplementary.mjs
 * PowerShell: use $env:NAME='value'. Optional SANS_ONLY comma-separated case names.
 * Each failing case stops its own dependent steps. Pictures require human opening.
 * Existing window.go navigation and read-only INPUTS/SCHED evidence are intentional.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.env.SANS_OUT || path.join((await import('node:os')).tmpdir(), 'raptor-inputs-sans-supplement');
if (process.env.SANS_FROZEN !== '1' || process.env.SANS_LOCK_HELD !== '1') throw Error('Host frozen-build signal and assigned heavy-lock ownership required. This driver does not acquire/release the lock.');
const req = createRequire(`${ROOT}/package.json`);
const { chromium, expect } = req('@playwright/test');
const BASE = process.env.HP_URL || 'http://localhost:4192';
process.env.HP_URL = BASE;
process.env.HP_SHOTS = OUT;
const AM = await import(pathToFileURL(`${ROOT}/scripts/handpass/am/am-lib.mjs`));
fs.mkdirSync(OUT, { recursive: true });
const chosen = (process.env.SANS_ONLY || '').split(',').filter(Boolean);
const results = [], pictures = [];
const exe = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const browser = await chromium.launch(fs.existsSync(exe) ? { executablePath: exe } : {});
const delay = ms => new Promise(r => setTimeout(r, ms));
const jul = n => `2026-07-${String(n).padStart(2, '0')}`;
// Incumbent INPUTS dates use 'Jul 19'; UI calendar addresses are ISO. Normalize
// only evidence comparisons, leaving stored data and all date assertions intact.
const isoDate = s => /^Jul \d{1,2}$/.test(s || '') ? jul(Number(s.slice(4))) : s;
const rows = p => p.evaluate(() => structuredClone(window.INPUTS));
const byRemark = (p, s) => p.evaluate(s => structuredClone(window.INPUTS.filter(r => (r.remarks || '').includes(s))), s);
async function signIn(p, member = false, navigate = true) {
  if (navigate) await p.goto(BASE);
  await p.locator('#luser').fill(member ? 'us' : 'ad');
  await p.locator('#lpass').fill(member ? 'us' : 'a');
  await p.locator('#loginForm button[type=submit]').click();
  await p.locator('#vWeek .day').first().waitFor({ state: 'attached' });
}
async function go(p, name) { await AM.closeBoard(p); await p.evaluate(n => window.go(n), name); await expect.poll(() => p.evaluate(() => window.CURPAGE)).toBe(name); }
async function inputs(p, sans = false, list = false) {
  if (await p.locator('#medClose').isVisible()) await p.locator('#medClose').click();
  await go(p, 'inputs');
  await p.locator(sans ? '#inSansMode' : '#inMemberMode').click();
  await p.locator(list ? '#inListBtn' : '#inCalBtn').click();
}
async function closeDay(p) { if (await p.locator('#icPopClose').isVisible()) await p.locator('#icPopClose').click(); }
async function day(p, date) { await closeDay(p); await p.locator(`[data-icday="${date}"]`).click({position:{x:8,y:8}}); await p.locator('#icPopAdd').waitFor(); }
async function editor(p, date) { await day(p, date); await p.locator('#icPopAdd').click(); await p.locator('#inpEditSave').waitFor(); }
async function save(p) { await p.locator('#inpEditSave').click(); await expect(p.locator('#inpEditPop')).toBeHidden(); }
async function undo(p, which = 'undo') {
  await closeDay(p);
  // Incumbent command bridge is intentional for a member who cannot enter Edit Schedule.
  // Admin cases use the visible timeline on Edit Schedule.
  const member = await p.evaluate(() => !document.querySelector('#roleBadge') || /member/i.test(document.querySelector('#roleBadge').textContent || ''));
  if (member) await p.evaluate(w => window[w](), which);
  else { await go(p, 'editsched'); await p.locator(`#${which}Btn`).click(); }
}
async function picture(p, name) { const file = path.join(OUT, `${name}.png`); await p.screenshot({ path: file }); pictures.push(file); }
async function caseRun(name, phone, member, fn) {
  if (chosen.length && !chosen.includes(name)) return;
  const errors = [];
  const ctx = await browser.newContext({ viewport: phone ? { width: 390, height: phone === 'short' ? 568 : 844 } : { width: 1440, height: 900 }, isMobile: !!phone, hasTouch: !!phone, timezoneId: 'Asia/Singapore', acceptDownloads: true });
  const p = await ctx.newPage(); p.setDefaultTimeout(12000);
  p.on('pageerror', e => errors.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text())});
  p.on('response',r=>{if(r.status()>=400)errors.push('network: '+r.status()+' '+r.url())});
  p.on('dialog', d => d.accept());
  await p.clock.setFixedTime(new Date('2026-07-13T09:00:00+08:00'));
  try {
    await signIn(p, member);
    const detail = await fn(p, ctx);
    assert.deepEqual(errors, [], 'Uncaught browser errors');
    results.push({ name, status: 'PASS', detail });
    console.log('PASS', name);
  } catch (e) {
    results.push({ name, status: 'FAIL', message: e.stack, errors });
    await picture(p, `FAIL-${name}`).catch(() => {});
    console.log('FAIL', name, e.message);
  } finally {
    await ctx.close();
    fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify({ base: BASE, results, pictures, pictureInspection: 'OWED: open every saved picture independently' }, null, 2));
  }
}
async function qualifyOwn(p) {
  await go(p, 'quals');
  await p.getByRole('button', { name: 'Enable editing', exact: true }).click();
  if (!(await p.evaluate(() => !!window.PEOPLE.bane.san))) await p.locator('#qtbl td[data-q="bane|san"]').click();
  await expect.poll(() => p.evaluate(() => !!window.PEOPLE.bane.san)).toBe(true);
}
async function offer(p, date, remark, person = 'yeti') {
  await inputs(p, true); await editor(p, date);
  if (await p.locator('#inpEditPerson').count() && await p.locator('#inpEditPerson').isEnabled()) await p.locator('#inpEditPerson').selectOption(person);
  await p.locator('#inpEditSans').getByLabel('Fly', { exact: true }).check();
  await p.locator('#inpEditRmk').fill(remark);
  await save(p);
  await expect.poll(async () => (await byRemark(p, remark)).length).toBe(1);
  return (await byRemark(p, remark))[0];
}
async function listForm(p, { person = 'bane', type = 'LL', date, remark = '' }) {
  await inputs(p, false, true);
  if (await p.locator('#inPerson').count()) await p.locator('#inPerson').selectOption(person);
  await p.locator('#inType').selectOption(type);
  await p.locator(`#inCal [data-cal="${date}"]`).click();
  if ((await p.locator('#inDates').innerText()).includes('→')) await p.locator(`#inCal [data-cal="${date}"]`).click();
  if (await p.locator('#inSpan').count()) await p.locator('#inSpan [data-span="all"]').click();
  await p.locator('#inRemarks').fill(remark);
}
async function addList(p, opts) {
  await listForm(p, opts); await p.locator('#inAdd').click();
  await expect.poll(async () => (await byRemark(p, opts.remark)).length).toBe(1);
  return (await byRemark(p, opts.remark))[0];
}
async function point(p, selector, empty = false) {
  const loc = p.locator(selector).first(); await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox(); assert(b, `No box ${selector}`);
  return { x: b.x + b.width / 2, y: b.y + (empty ? Math.min(b.height - 6, 35) : b.height / 2) };
}
async function touch(ctx, p, from, to = from, hold = 0) {
  const cdp = await ctx.newCDPSession(p);
  try {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...from, id: 1 }] });
    await delay(hold);
    if (from.x !== to.x || from.y !== to.y) for (let i = 1; i <= 12; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * i / 12, y: from.y + (to.y - from.y) * i / 12, id: 1 }] });
      await delay(20);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } finally { await cdp.detach(); }
}
try {
  await caseRun('member-lifecycle', false, true, async p => {
    await qualifyOwn(p);
    const a = await offer(p, jul(20), 'SUP member own offer', 'bane');
    assert.equal(a.person, 'bane');
    await day(p, jul(20)); await p.locator(`[data-popiid="${a.iid}"]`).click();
    await p.locator('#inpEditSpan [data-span="custom"]').click();
    await p.locator('#inpEditStart').fill('10:00'); await p.locator('#inpEditEnd').fill('11:00');
    await p.locator('#inpEditSans').getByLabel('OFT', { exact: true }).check();
    await p.locator('#inpEditRmk').fill('SUP member own edited'); await save(p);
    await expect.poll(async () => (await byRemark(p, 'SUP member own edited')).length).toBe(1);
    const flyingCount = async () => {
      const count = p.locator(`[data-icday="${jul(20)}"] [data-sans-count="f"]`);
      const raw = await count.getAttribute('data-count');
      assert.match(raw || '', /^\d+$/, 'Missing flying count');
      const n = Number(raw); await expect(count).toContainText(new RegExp(`^F ${n}(?:\\s|$)`)); return n;
    };
    const otherCounts = () => p.locator(`[data-icday="${jul(20)}"] [data-sans-count="o"], [data-icday="${jul(20)}"] [data-sans-count="a"]`).evaluateAll(es => es.map(e => ({ activity: e.dataset.sansCount, count: e.dataset.count, text: e.textContent })));
    const otherBefore = await otherCounts();
    const flyBefore = await flyingCount(); assert(flyBefore >= 1);
    await day(p, jul(20)); await p.locator(`[data-popiid="${a.iid}"]`).click();
    await p.locator('#inpEditSans').getByLabel('Fly', { exact: true }).uncheck();
    await p.locator('#inpEditSans').getByLabel('OFT', { exact: true }).check();
    await p.locator('#inpEditSans').getByLabel('AMT', { exact: true }).uncheck();
    await save(p);
    await expect.poll(flyingCount).toBe(flyBefore - 1);
    assert.deepEqual(await otherCounts(), otherBefore, 'Removing Fly must preserve OFT and AMT totals');
    await day(p, jul(20));
    await expect(p.locator(`[data-popiid="${a.iid}"]`)).toContainText(/not counted for flying/i);
    await closeDay(p); await p.locator('#undoBtn').click();
    await expect.poll(flyingCount).toBe(flyBefore);
    assert.deepEqual(await otherCounts(), otherBefore);
    await p.locator('#redoBtn').click();
    await expect.poll(flyingCount).toBe(flyBefore - 1);
    assert.deepEqual(await otherCounts(), otherBefore);
    await p.locator('#undoBtn').click();
    await expect.poll(flyingCount).toBe(flyBefore);
    assert.deepEqual(await otherCounts(), otherBefore);
    await day(p, jul(20)); await p.locator(`[data-popiid="${a.iid}"]`).click();
    await expect(p.locator('#inpEditRmk')).toBeVisible();
    await picture(p, 'member-own-editor'); await p.locator('#inpEditDel').click();
    await expect.poll(async () => (await byRemark(p, 'SUP member own')).length).toBe(0);
    await p.locator('#undoBtn').click();
    await expect.poll(async () => (await byRemark(p, 'SUP member own edited')).length).toBe(1);
    await p.locator('#redoBtn').click();
    await expect.poll(async () => (await byRemark(p, 'SUP member own')).length).toBe(0);
    await p.locator('#undoBtn').click();
    await p.reload(); await signIn(p, true, false);
    assert.equal((await byRemark(p, 'SUP member own edited')).length, 1);
    return { own: a.person, undoDoor: 'visible top-bar Undo/Redo', flyBefore, oftOnly: flyBefore - 1, flyRestored: true, persisted: true };
  });
  await caseRun('stale-actor', false, false, async p => {
    const a = await offer(p, jul(20), 'SUP stale original');
    await day(p, jul(20)); await p.locator(`[data-popiid="${a.iid}"]`).click();
    await p.locator('#inpEditRmk').fill('SUP stale unauthorized');
    const before = await rows(p);
    // Deliberate stale-actor fixture: dispatch the existing role-toggle handler while a modal is open.
    await p.locator('#roleBadge').evaluate(el => el.click());
    if (await p.locator('#inpEditSave').isVisible()) await p.locator('#inpEditSave').click();
    await delay(250);
    assert.deepEqual(await rows(p), before, 'Stale admin editor wrote after member transition');
    return { actorTransition: 'existing role badge handler invoked under open modal', noMutation: true };
  });
  await caseRun('touch-select-dates', true, false, async p => {
    await inputs(p, true); await p.locator('#icSelectDates').tap();
    await p.locator(`[data-icday="${jul(30)}"]`).tap(); await p.locator('#icNext').tap();
    await p.locator('[data-icday="2026-08-02"]').tap();
    await expect(p.locator('.ic-range-bar')).toContainText(/30 Jul.*2 Aug/);
    await p.locator('#icRangeAdd').tap();
    await expect(p.locator('#inpEditPop')).toContainText(/Jul 30|30 Jul/);
    await expect(p.locator('#inpEditPop')).toContainText(/Aug 2|2 Aug/);
    await picture(p, 'touch-range-editor'); await p.locator('#inpEditCancel').tap();
    return { dates: ['2026-07-30', '2026-08-02'], gesture: 'touchscreen taps' };
  });
  await caseRun('touch-hold', 'short', false, async (p, ctx) => {
    await inputs(p, true);
    const target = await point(p, `[data-icday="${jul(22)}"]`, true);
    await touch(ctx, p, target, target, 850);
    await expect(p.locator('#inpEditSave')).toBeVisible();
    await expect(p.locator('#inpEditPop .rc-read')).toHaveText('Jul 22');
    await expect(p.locator('#inpEditRmk')).toHaveValue('');
    await p.locator('#inpEditSave').scrollIntoViewIfNeeded();
    await picture(p, 'short-phone-hold-editor');
    await p.locator('#inpEditClose').scrollIntoViewIfNeeded(); await p.locator('#inpEditClose').tap();
    await expect(p.locator('#inpEditPop')).toBeHidden();
    return { holdMs: 850, date: jul(22), closedAt390x568: true };
  });
  await caseRun('touch-chip-drag', true, false, async (p, ctx) => {
    // SANS month cells intentionally show summaries. Exercise the incumbent draggable
    // chip in Member Inputs, using the shared calendar editor to create a normal LL.
    await inputs(p, false); await editor(p, jul(20));
    await p.locator('#inpEditPerson').selectOption('bane');
    await p.locator('#inpEditType').selectOption('LL');
    await p.locator('#inpEditRmk').fill('SUP touch dragged'); await save(p);
    await expect.poll(async () => (await byRemark(p, 'SUP touch dragged')).length).toBe(1);
    const a = (await byRemark(p, 'SUP touch dragged'))[0]; await closeDay(p);
    const source = p.locator(`[data-icday="${jul(20)}"] [data-icdrag][data-iid="${a.iid}"]`);
    const target = p.locator(`[data-icday="${jul(21)}"]`);
    await source.scrollIntoViewIfNeeded(); await target.scrollIntoViewIfNeeded();
    // Both boxes must be read AFTER scrolling is complete, otherwise scrolling the
    // target invalidates the source coordinate and turns this into a month swipe.
    const sb = await source.boundingBox(), tb = await target.boundingBox(); assert(sb && tb);
    const from = {x: sb.x + sb.width / 2, y: sb.y + sb.height / 2};
    const to = {x: tb.x + tb.width / 2, y: tb.y + Math.min(tb.height - 6, 35)};
    assert.equal(await p.evaluate(({from,iid}) => document.elementFromPoint(from.x,from.y)?.closest('[data-icdrag]')?.getAttribute('data-iid'), {from,iid:a.iid}), a.iid, 'Touch must begin on the actual draggable chip');
    await touch(ctx, p, from, to, 300);
    await expect.poll(async () => isoDate((await byRemark(p, 'SUP touch dragged'))[0]?.date)).toBe(jul(21));
    await expect(p.locator('#inpEditPop')).toBeHidden();
    await picture(p, 'touch-chip-moved');
    await p.evaluate(() => window.undo());
    await expect.poll(async () => isoDate((await byRemark(p, 'SUP touch dragged'))[0]?.date)).toBe(jul(20));
    return { from: jul(20), to: jul(21), undoRestored: true };
  });
  await caseRun('publication', false, false, async p => {
    await AM.editWeek(p); await AM.board(p, 0);
    const signed = await AM.signDay(p, 0);
    assert(!Object.values(signed).some(v => /NO /.test(v)), 'Fixture must have all four signers');
    assert.equal((await AM.publishDay(p, 0)).pressed, true);
    await AM.signDay(p, 0);
    const original = await p.evaluate(() => structuredClone(window.SCHED.cur[0]));
    const signsBefore = await p.locator('#schedBoard select[data-sign][data-signday="0"]').evaluateAll(es => es.map(e => e.value));
    assert.equal(signsBefore.filter(Boolean).length, 4);
    await inputs(p, false); await editor(p, jul(13));
    await p.locator('#inpEditPerson').selectOption('bane'); await p.locator('#inpEditType').selectOption('LL');
    await p.locator('#inpEditRmk').fill('SUP pending published'); await save(p);
    await expect.poll(async () => (await byRemark(p, 'SUP pending published')).length).toBe(1);
    const a = (await byRemark(p, 'SUP pending published'))[0];
    await AM.editWeek(p); await AM.board(p, 0);
    const after = await AM.head(p, 0);
    assert.match(after.pending, /1/);
    const signsAfter = await p.locator('#schedBoard select[data-sign][data-signday="0"]').evaluateAll(es => es.map(e => e.value));
    assert.equal(signsAfter.filter(Boolean).length, 0);
    assert.deepEqual(await p.evaluate(() => structuredClone(window.SCHED.cur[0])), original, 'Issued book changed before publication');
    await AM.closeBoard(p); await go(p, 'viewsched');
    assert(!(await p.locator('#vWeek .day[data-day="0"]').innerText()).includes('SUP pending published'));
    await picture(p, 'issued-frozen');
    await undo(p);
    assert.equal((await byRemark(p, 'SUP pending published')).length, 0);
    await AM.editWeek(p); await AM.board(p, 0);
    assert.deepEqual(await p.locator('#schedBoard select[data-sign][data-signday="0"]').evaluateAll(es => es.map(e => e.value)), signsBefore);
    return { iid: a.iid, pending: after.pending, issuedUnchanged: true, undoRestoredSignatures: true };
  });
  await caseRun('medical-and-oil', false, false, async p => {
    await inputs(p, false); await p.locator('#inMedBtn').click();
    await p.locator('#medView .medsec').first().waitFor();
    await p.locator('.med-down .medcard').first().click();
    await expect(p.locator('#docViewPop')).toBeVisible();
    await expect(p.locator('.docview-img')).toHaveCount(1);
    await picture(p, 'medical-document');
    const medicalBefore = await rows(p);
    await p.locator('#docViewEdit').click(); await p.locator('#inpEditRmk').fill('SUP existing medical revised');
    await save(p);
    const med = (await byRemark(p, 'SUP existing medical revised'))[0]; assert(med);
    const prior = medicalBefore.find(r => r.iid === med.iid); assert(prior);
    assert.deepEqual(med.docIds || med.docId, prior.docIds || prior.docId, 'Medical attachment identity must survive remarks edit');
    await p.evaluate(() => window.undo());
    await expect.poll(async () => (await byRemark(p, 'SUP existing medical revised')).length).toBe(0);
    await listForm(p, { date: jul(18), type: 'Duty', person: 'bane', remark: 'SUP duty OIL' });
    await p.locator('#inAdd').click();
    const ask = p.locator('[data-testid="oilconf"]'); await expect(ask).toBeVisible();
    await expect(p.locator('[data-testid="oilconf-save"]')).toBeDisabled();
    assert.equal((await byRemark(p, 'SUP duty OIL')).length, 0);
    await ask.locator('.x').click(); assert.equal((await byRemark(p, 'SUP duty OIL')).length, 0);
    await p.locator('#inAdd').click(); await ask.getByRole('button', { name: /^Yes/ }).first().click();
    await p.locator('[data-testid="oilconf-save"]').click();
    await expect.poll(async () => (await byRemark(p, 'SUP duty OIL')).length).toBe(1);
    const a = (await byRemark(p, 'SUP duty OIL'))[0]; assert.equal(a.oil[jul(18)], 1);
    await inputs(p, false); await day(p, jul(18)); await p.locator(`[data-popiid="${a.iid}"]`).click();
    await p.locator('#inpEditRmk').fill('SUP duty OIL revised'); await save(p);
    assert.equal((await byRemark(p, 'SUP duty OIL revised'))[0].oil[jul(18)], 1);
    return { existingMedicalViewed: true, oilCancelWroteNothing: true, oilCreditPreserved: 1 };
  });
  for (const door of ['list', 'calendar']) await caseRun(`historical-till-${door}`, false, false, async p => {
    // Owner policy: single-day "till 19 Jul" is VALID. Verify both existing doors
    // preserve that value once, update it with the span, and retain user prose.
    let cal, readout, remarks;
    if (door === 'list') {
      await listForm(p, { date: jul(18), type: 'LL', person: 'bane', remark: '' });
      cal = '#inCal'; readout = p.locator('#inDates'); remarks = p.locator('#inRemarks');
    } else {
      await inputs(p, false); await editor(p, jul(18));
      await p.locator('#inpEditPerson').selectOption('bane');
      await p.locator('#inpEditType').selectOption('LL');
      cal = '#inpEditPop'; readout = p.locator('#inpEditPop .rc-read').first(); remarks = p.locator('#inpEditRmk');
    }
    const seen = [];
    const read = async () => ({ dates: await readout.innerText(), remarks: await remarks.inputValue() });
    const clickDate = n => p.locator(`${cal} [data-cal="${jul(n)}"]`).first().click();
    // The incumbent picker marks its completed end with .e (covered by its
    // existing browser-independent tests). Start a fresh anchor at 18 if this
    // first click completed a prior selection, then perform the exact sequence.
    await clickDate(18);
    if (/\be\b/.test(await p.locator(`${cal} [data-cal="${jul(18)}"]`).first().getAttribute('class') || '')) await clickDate(18);
    await remarks.fill('LL till 18 Jul Bangkok');
    const first = await read(); assert(!first.dates.includes('→')); assert.match(first.dates, /18/); seen.push(first);
    await clickDate(19);
    const range = await read(); assert.match(range.dates, /18.*→.*19/); seen.push(range);
    assert.equal((range.remarks.match(/\btill\b/gi) || []).length, 1);
    assert.match(range.remarks, /till 19 Jul/); assert.match(range.remarks, /Bangkok/);
    await clickDate(19);
    const single = await read(); assert(!single.dates.includes('→')); assert.match(single.dates, /19/); seen.push(single);
    assert.equal((single.remarks.match(/\btill\b/gi) || []).length, 1);
    assert.match(single.remarks, /till 19 Jul/); assert.match(single.remarks, /Bangkok/);
    if (door === 'list') await p.locator('#inAdd').click(); else await save(p);
    const findSaved = async () => (await rows(p)).find(r => r.person === 'bane' && isoDate(r.date) === jul(19) && (r.remarks || '').includes('Bangkok'));
    await expect.poll(async () => !!(await findSaved())).toBe(true);
    const a = await findSaved(); assert(!a.endDate || isoDate(a.endDate) === jul(19));
    assert.equal((a.remarks.match(/\btill\b/gi) || []).length, 1); assert.match(a.remarks, /till 19 Jul/);
    await p.reload(); await signIn(p, false, false);
    const restored = (await rows(p)).find(r => r.iid === a.iid);
    assert(restored); assert.equal(isoDate(restored.date), jul(19)); assert(!restored.endDate || isoDate(restored.endDate) === jul(19));
    assert.equal(restored.remarks, a.remarks); assert.match(restored.remarks, /Bangkok/);
    return { door, seen, saved: a, restored, ruling: 'single-day till 19 Jul is valid; one matching tail and Bangkok survive save/reload' };
  });
  await caseRun('planning-list-export', false, false, async p => {
    await inputs(p, false); await day(p, jul(22));
    await p.locator('#icRmkEdit').fill('SUP planning day note'); await p.locator('#icRmkEdit').blur();
    await p.locator('#icAddPuck').click(); await p.locator('.ic-poppuck-edit').fill('SUP planning puck'); await p.locator('.ic-poppuck-edit').press('Enter');
    await closeDay(p); await expect(p.locator(`[data-icday="${jul(22)}"]`)).toContainText('SUP planning');
    const a = await addList(p, { date: jul(22), type: 'LL', person: 'bane', remark: 'SUP export exact row' });
    await p.locator('#inFPerson').selectOption('bane'); await p.locator('#inFType').selectOption('LL'); await p.locator('#inFSearch').fill('SUP export exact row');
    await p.locator('#inRangeBtn').click(); await p.locator('#inRangeAll').click();
    await expect(p.locator('#inBody tr[data-iid]')).toHaveCount(1);
    const download = p.waitForEvent('download'); await p.locator('#inExport').click();
    const d = await download; const file = path.join(OUT, 'filtered-inputs.csv'); await d.saveAs(file);
    const csv = fs.readFileSync(file, 'utf8'); assert(csv.includes('SUP export exact row')); assert(!csv.includes('SUP planning day note'));
    await p.locator('#inCalBtn').click();
    await expect(p.locator(`[data-icday="${jul(22)}"] [data-iid="${a.iid}"]`)).toBeVisible();
    await day(p, jul(22)); await expect(p.locator(`[data-popiid="${a.iid}"]`)).toContainText('SUP export exact row'); await closeDay(p);
    await picture(p, 'planning-filtered-calendar');
    return { iid: a.iid, csv: file, planningPreserved: true, filteredRows: 1 };
  });
} finally {
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify({ base: BASE, results, pictures, pictureInspection: 'OWED: open every saved picture independently' }, null, 2));
  console.log(JSON.stringify({ results, pictures }, null, 2));
  if (results.some(r => r.status === 'FAIL')) process.exitCode = 1;
}
