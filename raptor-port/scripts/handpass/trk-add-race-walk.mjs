/*
 * The walk for [TRK-SMOKE-ADD-RACE] (D190, 25 Sep 26) — the Tracker's question box (DlgModal) and its
 * late cursor move, on every place the Tracker opens it with a text field.
 *
 * THE DEFECT. The box moves the cursor a beat after it opens (a 30ms timer — the search box when the
 * squadron roster is listed, the text box otherwise, selecting what it holds). On a busy machine that
 * beat lands LATE, after someone has already clicked into the text box and started typing: the rest
 * of the name went into the SEARCH box (+ Add), or the first letters were selected and overwritten by
 * the next key (every other question). Playwright's fill types in two steps — cursor in, then the
 * letters to wherever the cursor is — so the smoke suite met it as "OK added nobody".
 *
 * Three runs per place, each written as an assertion of the RIGHT behaviour (PASS = correct), so this
 * same script on the old build shows the defect and on the fixed build IS the re-walk:
 *   left  — nobody touches it: the cursor lands where it always did (no regression).
 *   quick — a quick typist on a slow machine: into the text box and three letters BEFORE the timer,
 *           the rest after it. The opening and the first letters happen in one in-page step so they
 *           beat the timer every time (the gap is measured and reported).
 *   fill  — exactly the test tool's two steps with the gap a busy machine gives (+ Add only).
 *
 *   WALK_URL=http://localhost:4180/ WALK_SHOTS=<folder> WALK_TAG=old node scripts/handpass/trk-add-race-walk.mjs
 */
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const URL = process.env.WALK_URL || 'http://localhost:4180/';
const SHOTS = process.env.WALK_SHOTS || null;
const TAG = process.env.WALK_TAG || 'run';
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const rows = [];
let pass = 0, fail = 0;
const ok = (where, run, cond, extra = '') => {
  cond ? pass++ : fail++;
  rows.push({ where, run, pass: !!cond, extra });
  console.log(`${cond ? ' PASS' : ' FAIL'}  [${where} · ${run}] ${extra}`);
};

const CHROMIUM = '/opt/pw-browsers/chromium';
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {});

async function openTracker(pg) {
  await pg.goto(URL, { waitUntil: 'networkidle' });
  await pg.fill('#luser', 'ad'); await pg.fill('#lpass', 'a');
  await pg.click('#loginForm button[type=submit]');
  await pg.waitForSelector('#vWeek .day', { state: 'attached' });
  await pg.evaluate(() => window.go('tracker'));
  await pg.waitForFunction(() => window.CURPAGE === 'tracker');
  await pg.waitForSelector('#flowSvg .ball', { timeout: 20000 });
  await pg.waitForTimeout(400);
}

/* In ONE page task: press the control that opens the box, wait for the box's text field to exist
   (a DOM observer, so microtask-quick), then do `then` to it. Returns how long after the press that
   happened — it must be well under the box's 30ms for a "before the timer" run to mean anything. */
const openThen = (pg, opener, then, arg) => pg.evaluate(async ([opener, then, arg]) => {
  const t0 = performance.now();
  const field = () => document.querySelector('#dlgModal #dlgInput');
  const seen = new Promise(res => {
    if (field()) return res();
    const mo = new MutationObserver(() => { if (field()) { mo.disconnect(); res(); } });
    mo.observe(document.body, { childList: true, subtree: true });
  });
  /* 'text:<words>' = the button whose label holds those words (the Edit chart layout tools have no ids) */
  const btn = opener.startsWith('text:')
    ? [...document.querySelectorAll('button')].find(x => x.textContent.includes(opener.slice(5)))
    : document.querySelector(opener);
  btn.click();
  await seen;
  const inp = field();
  const setVal = v => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(inp, v);
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  };
  if (then === 'type3') { inp.focus(); setVal(arg); inp.setSelectionRange(arg.length, arg.length); }
  if (then === 'fillstep1') { inp.select(); inp.focus(); }     /* Playwright fill's first step, verbatim */
  return Math.round((performance.now() - t0) * 10) / 10;
}, [opener, then, arg]);

const state = pg => pg.evaluate(() => {
  const a = document.activeElement, inp = document.querySelector('#dlgInput'), f = document.querySelector('#dlgFilter');
  return { active: (a && a.id) || (a && a.tagName) || null, text: inp ? inp.value : null, search: f ? f.value : null,
    sel: inp ? [inp.selectionStart, inp.selectionEnd] : null };
});
const shot = async (pg, name) => {
  if (!SHOTS) return;
  const box = pg.locator('#dlgModal');
  if (await box.count()) await box.screenshot({ path: join(SHOTS, `${TAG}-${name.replace(/\s+/g, '-')}.png`) });
};
const closeBox = async pg => {
  if (await pg.locator('#dlgCancel').count()) await pg.click('#dlgCancel');
  else if (await pg.locator('#dlgOk').count()) await pg.click('#dlgOk');
  await pg.waitForTimeout(250);
};
/* answer any question the app asks AFTER the name (a report, a refusal) and read it */
const drainBoxes = async pg => {
  const said = [];
  for (let i = 0; i < 4; i++) {
    await pg.waitForTimeout(500);
    if (!(await pg.locator('#dlgModal').count())) break;
    said.push(((await pg.locator('#dlgMsg').textContent()) || '').replace(/\s+/g, ' ').slice(0, 90));
    await pg.click('#dlgOk');
  }
  return said;
};
const optionTexts = (pg, sel) => pg.evaluate(s => [...document.querySelectorAll(s + ' option')].map(o => o.textContent), sel);
const rosterNames = pg => pg.evaluate(() => window.__coreForTests.rosterNow().map(r => r.name));
/* the chart list itself: the picker writes a hand-made chart as "<name> ✎", so its option text is not the name */
const sylNames = pg => pg.evaluate(() => window.__coreForTests.sylsNow().map(s => s.name));

/* The places. `open` is what a person presses (menus opened first by `pre`); `result` reads back what
   OK made, given the name typed. `upper` = the app upper-cases the answer. */
const PLACES = [
  { id: 'add', where: '+ Add (the squadron roster listed)', open: '#addStu', roster: true, upper: true,
    result: async (pg, n) => (await rosterNames(pg)).includes(n) },
  { id: 'renstu', where: 'Rename a student (✎ on a chip)', open: '.c-students .chip .ren', upper: true, def: true,
    result: async (pg, n) => (await rosterNames(pg)).includes(n) },
  { id: 'addcourse', where: '+ Add course', pre: '#courseMenuBtn', open: '#addCourse', upper: true,
    result: async (pg, n) => (await optionTexts(pg, '#courseSel')).includes(n) },
  { id: 'rencourse', where: 'Rename course', pre: '#courseMenuBtn', open: '#renCourse', upper: true, def: true,
    result: async (pg, n) => (await optionTexts(pg, '#courseSel')).includes(n) },
  { id: 'dupsyl', where: 'Duplicate syllabus', pre: '#sylMenuBtn', open: '#dupSyl', def: true,
    result: async (pg, n) => (await sylNames(pg)).includes(n) },
  { id: 'addsyl', where: 'Add syllabus (empty)', pre: '#sylMenuBtn', open: '#addSyl', def: true,
    result: async (pg, n) => (await sylNames(pg)).includes(n) },
  { id: 'rensyl', where: 'Rename syllabus', pre: '#sylMenuBtn', open: '#renSyl', def: true,
    result: async (pg, n) => (await sylNames(pg)).includes(n) },
];

async function walkPlace(pg, P, sfx) {
  const pre = async () => {
    if (typeof P.pre === 'function') await P.pre(pg);
    else if (P.pre) { await pg.click(P.pre); await pg.waitForTimeout(150); }
  };
  /* left alone */
  await pre();
  const tl = await openThen(pg, P.open, 'none');
  await pg.waitForTimeout(200);
  const L = await state(pg);
  if (P.roster) ok(P.where + sfx, 'left', L.active === 'dlgFilter', `cursor in ${L.active} (the search is where it lands when nobody is typing)`);
  else ok(P.where + sfx, 'left', L.active === 'dlgInput' && (!P.def || (L.sel && L.sel[0] === 0 && L.sel[1] === (L.text || '').length && L.text.length > 0)),
    `cursor in ${L.active}, text "${L.text}" selected ${JSON.stringify(L.sel)}${P.def ? ' (the default is selected, so typing replaces it)' : ''}`);
  await closeBox(pg);
  /* a quick typist */
  const name = ('Smo' + 'ke ' + P.id + sfx.replace(/\W/g, '')).slice(0, 24);
  const want = P.upper ? name.toUpperCase() : name;
  await pre();
  const tq = await openThen(pg, P.open, 'type3', name.slice(0, 3));
  await pg.waitForTimeout(200);                          /* the late timer has fired by now */
  await pg.keyboard.type(name.slice(3));
  const Q = await state(pg);
  await shot(pg, `${P.id}${sfx}-quick`);
  ok(P.where + sfx, 'quick', Q.text === name && (Q.search === null || Q.search === ''),
    `typed "${name}" (first 3 letters ${tq}ms after the press): the text box holds "${Q.text}"${Q.search !== null ? `, the search "${Q.search}"` : ''}, cursor in ${Q.active}`);
  await pg.click('#dlgOk');
  const said = await drainBoxes(pg);
  const landed = await P.result(pg, want);
  ok(P.where + sfx, 'quick → OK', landed, `"${want}" ${landed ? 'is there' : 'is NOT there'}${said.length ? ' · the app said: ' + said.join(' | ') : ''}`);
  return { tl, tq };
}

async function fillRun(pg, sfx) {
  /* the smoke suite's own "+ Add": fill = cursor in + select, then the letters to wherever the cursor is */
  const name = 'SMOKE FILL' + sfx.replace(/\W/g, '').toUpperCase();
  const t = await openThen(pg, '#addStu', 'fillstep1');
  await pg.waitForTimeout(200);                          /* a busy machine's gap between fill's two steps */
  await pg.keyboard.insertText(name);
  const F = await state(pg);
  await shot(pg, `add${sfx}-fill`);
  ok('+ Add (the squadron roster listed)' + sfx, 'fill', F.text === name && F.search === '',
    `fill's first step ${t}ms after the press, the letters after the gap: the text box holds "${F.text}", the search "${F.search}"`);
  await pg.click('#dlgOk'); await drainBoxes(pg);
  const landed = (await rosterNames(pg)).includes(name);
  ok('+ Add (the squadron roster listed)' + sfx, 'fill → OK', landed, `"${name}" ${landed ? 'was added' : 'was NOT added — OK added nobody'}`);
}

/* D191 (his "A", 25 Sep 26): a callsign NOT on the roster typed into the roster SEARCH — where + Add
   puts the cursor — with "Or type a callsign" empty: the line says OK adds it, and OK (or Enter) does.
   Unchanged: a name in the box below wins; a search that still matches someone adds nothing by itself. */
async function searchRun(pg, sfx) {
  const W = '+ Add, a new callsign in the SEARCH (D191)' + sfx;
  const line = () => pg.evaluate(() => document.querySelector('#dlgModal .dlg-none')?.textContent || '');
  const tag = sfx.replace(/\W/g, '').toUpperCase();
  for (const how of ['OK', 'Enter']) {
    const name = ('NEWGUY ' + how + tag).toUpperCase();
    await pg.click('#addStu'); await pg.waitForSelector('#dlgFilter'); await pg.waitForTimeout(200);
    await pg.keyboard.type(name.toLowerCase());          /* the cursor is in the search already */
    const L = await line();
    await shot(pg, `search${sfx}-${how.toLowerCase()}`);
    ok(W, `says so · ${how}`, /Nobody on the roster matches/.test(L) && /OK adds them as a new crew member\./.test(L), `the line reads "${L}"`);
    if (how === 'OK') await pg.click('#dlgOk'); else await pg.keyboard.press('Enter');
    await drainBoxes(pg);
    const landed = (await rosterNames(pg)).includes(name);
    ok(W, `${how} adds it`, landed, `"${name}" ${landed ? 'was added' : 'was NOT added'}`);
  }
  /* the box below wins, and then the line makes no promise */
  {
    await pg.click('#addStu'); await pg.waitForSelector('#dlgFilter'); await pg.waitForTimeout(200);
    await pg.keyboard.type('searchonly' + tag.toLowerCase());
    await pg.fill('#dlgInput', 'BOXWINS' + tag);
    const L = await line();
    ok(W, 'the box below wins · line', !/OK adds/.test(L), `the line reads "${L}"`);
    await pg.click('#dlgOk'); await drainBoxes(pg);
    const r = await rosterNames(pg);
    ok(W, 'the box below wins · OK', r.includes('BOXWINS' + tag) && !r.includes('SEARCHONLY' + tag), `added: ${r.filter(n => /BOXWINS|SEARCHONLY/.test(n)).join(', ') || 'nothing'}`);
  }
  /* a search that still matches someone adds nothing by itself */
  {
    const before = (await rosterNames(pg)).length;
    await pg.click('#addStu'); await pg.waitForSelector('#dlgFilter'); await pg.waitForTimeout(200);
    const label = await pg.evaluate(() => document.querySelector('#dlgList .dlg-item .dlg-lbl')?.textContent || '');
    await pg.keyboard.type(label.slice(0, 3).toLowerCase());
    const listed = await pg.locator('#dlgList .dlg-item').count();
    await pg.click('#dlgOk'); await drainBoxes(pg);
    const after = (await rosterNames(pg)).length;
    ok(W, 'a search matching someone · OK', listed > 0 && after === before, `"${label.slice(0, 3).toLowerCase()}" lists ${listed}; roster ${before} → ${after}`);
  }
}

/* ---- desktop: every place ---- */
{
  const pg = await b.newPage({ viewport: { width: 1500, height: 950 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await openTracker(pg);
  /* the chart the smoke suite was on when it stopped: Tx 2026, nobody on it yet */
  const tx = await pg.evaluate(() => [...document.getElementById('sylSel').options].find(o => o.textContent.startsWith('Tx 2026'))?.value);
  await pg.selectOption('#sylSel', tx); await pg.evaluate(() => window.__coreForTests.whenLoaded()); await pg.waitForTimeout(600);
  await fillRun(pg, '');
  await searchRun(pg, '');
  for (const P of PLACES) await walkPlace(pg, P, '');
  /* the new-event name, in Edit chart layout */
  {
    await pg.click('#sylMenuBtn'); await pg.waitForTimeout(150); await pg.click('#arrangeBtn'); await pg.waitForTimeout(300);
    await walkPlace(pg, { id: 'event', where: 'New event name (+ Acad, Edit chart layout)', open: 'text:+ Acad',
      result: async (p, n) => p.evaluate(i => !!document.querySelector(`#flowSvg .ball[data-id="${i}"]`), n) }, '');
  }
  ok('desktop', 'page errors', errs.length === 0, errs.slice(0, 3).join(' | ') || 'none');
  await pg.close();
}

/* ---- Import: the name for an incoming chart that already exists ("Add as new") ---- */
{
  const pg = await b.newPage({ viewport: { width: 1500, height: 950 } });
  await openTracker(pg);
  await pg.evaluate(() => {
    const id = window.__coreForTests.sylIdOf('Tx 2026');
    return window.__coreForTests.collectCharts([id]).then(snap => {
      const text = JSON.stringify(window.__fileFormatForTests.buildFile({ charts: snap, students: null, savedAt: new Date().toISOString() }));
      window.__pickOpenForTests = async () => ({ name: 'walk-import.json', text });
    });
  });
  /* each run starts the import again: the question "already exists — Replace / Add as new" first */
  const reimport = async p => {
    await drainBoxes(p);
    await p.click('#fileMenuBtn'); await p.waitForTimeout(150); await p.click('#importFileBtn');
    await p.waitForSelector('#dlgAlt', { timeout: 10000 });
  };
  await walkPlace(pg, { id: 'import', where: 'Import → Add as new → name', pre: reimport, open: '#dlgAlt', def: true,
    result: async (p, n) => (await sylNames(p)).includes(n) }, '')
    .catch(e => ok('Import → Add as new → name', 'run', false, String(e).slice(0, 160)));
  /* one question straight into the next, by a REAL mouse click — the click leaves the cursor on
     "Add as new", inside the box, as the name question opens: the cursor must still reach the name */
  await reimport(pg);
  await pg.click('#dlgAlt'); await pg.waitForSelector('#dlgInput'); await pg.waitForTimeout(200);
  const Ch = await state(pg);
  ok('Import → Add as new → name', 'chained (a real click)', Ch.active === 'dlgInput' && Ch.sel && Ch.sel[0] === 0 && Ch.sel[1] === (Ch.text || '').length,
    `cursor in ${Ch.active}, "${Ch.text}" selected ${JSON.stringify(Ch.sel)}`);
  await closeBox(pg); await drainBoxes(pg);
  await pg.close();
}

/* ---- phone: + Add and Rename a student, from the Info tab ---- */
{
  const pg = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await openTracker(pg);
  const tx = await pg.evaluate(() => [...document.getElementById('sylSel').options].find(o => o.textContent.startsWith('Tx 2026'))?.value);
  await pg.selectOption('#sylSel', tx); await pg.evaluate(() => window.__coreForTests.whenLoaded()); await pg.waitForTimeout(600);
  if (await pg.locator('button[data-view="info"]').count()) { await pg.click('button[data-view="info"]'); await pg.waitForTimeout(300); }
  await fillRun(pg, ' phone');
  await searchRun(pg, ' phone');
  await walkPlace(pg, PLACES[0], ' phone');
  await walkPlace(pg, PLACES[1], ' phone');
  if (SHOTS) await pg.screenshot({ path: join(SHOTS, `${TAG}-phone-after.png`) });
  await pg.close();
}

await b.close();
console.log(`\n${pass} passed, ${fail} failed (${TAG})`);
if (SHOTS) writeFileSync(join(SHOTS, `${TAG}-results.json`), JSON.stringify(rows, null, 1));
process.exit(0);
