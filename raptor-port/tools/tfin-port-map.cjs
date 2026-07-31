/* Generate docs/tfin-assertions.md: every L() assertion in reference/tfin.js,
   marked ported (with its Vitest file) or skipped (with one line of why). */
const fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname,'..','reference','tfin.js'), 'utf8').split('\n');

// tfin labels ported to Vitest (exact label → test file; '≈' = adapted/behavioural port)
const PORTED = new Map(Object.entries({
  // Inputs page — ported in phase 4c (ui/inputs.test.tsx)
  "inputs rows": 'ui/inputs.test.tsx',
  "the Inputs person filter is called Personnel, not All flights": '≈ ui/inputs.test.tsx',
  "personal inputs join the undo stack": '≈ state/store.test.ts + ui/inputs.test.tsx',
  "reflow redraws the Inputs table": '≈ ui/inputs.test.tsx (as behaviour)',
  // B14 view-week interactivity — ported in phase 4b (ui/interact.test.tsx)
  "click select": 'ui/interact.test.tsx',
  "puck click opens that person's issue boxes": 'ui/interact.test.tsx',
  "opened boxes are the days that person is flagged on": 'ui/interact.test.tsx',
  "person-focused boxes are marked": 'ui/interact.test.tsx',
  "person-focused box names the callsign": 'ui/interact.test.tsx',
  "clicking the same puck again clears it": 'ui/interact.test.tsx',
  "INS hl": 'ui/interact.test.tsx',
  "strips start collapsed": 'ui/interact.test.tsx',
  "strip expands inline": 'ui/interact.test.tsx',
  "expanded day highlights affected pucks": 'ui/interact.test.tsx',
  "other pucks dimmed": 'ui/interact.test.tsx',
  "focused item marked": 'ui/interact.test.tsx',
  "warning focus lights pucks": 'ui/interact.test.tsx',
  "only related pucks lit": 'ui/interact.test.tsx',
  "solid focus stays on the focused day": 'ui/interact.test.tsx',
  "any echo is off the focused day and same-person": 'ui/interact.test.tsx',
  "clear-focus button shown": 'ui/interact.test.tsx',
  "focus cleared": 'ui/interact.test.tsx',
  "strip collapses again": 'ui/interact.test.tsx',
  "blocking pill expands days": 'ui/interact.test.tsx',
  "all strips collapsed": 'ui/interact.test.tsx',
  "a cross-day warning exists in the seed": 'ui/interact.test.tsx',
  "the guilty day lights solid": 'ui/interact.test.tsx',
  "the same aircrew light on the other days": 'ui/interact.test.tsx',
  "echo pucks are never on the focused day": 'ui/interact.test.tsx',
  "echo pucks are the same people": 'ui/interact.test.tsx',
  "clear focus drops the echo too": 'ui/interact.test.tsx',
  "clicking the week background un-clicks everybody": 'ui/interact.test.tsx',
  "clicking them selects every puck of theirs": '≈ ui/interact.test.tsx',
  "clicking the same puck again un-clicks them": '≈ ui/interact.test.tsx',
  // K · key parsing / time
  "keyDay resolves the day for every prefix": 'keys.test.ts',
  "keyDay rejects junk": 'keys.test.ts',
  "txtRef resolves a remarks field": 'slots.test.ts',
  "txtRef survives a bad path": 'slots.test.ts',
  "time helpers round-trip": '≈ time.test.ts (fmtT half is UI — see skips)',
  // F · validation engine
  "validate returns WARN shape": 'validate.test.ts',
  "byDay covers every day": '≈ validate.test.ts (vs DAYS.length, not rendered days)',
  "every warning has a known tier": 'validate.test.ts',
  "every warning has a known code": 'validate.test.ts',
  "WCODE covers all 16 codes": '≈ validate.test.ts (against the object, not source text)',
  "CHIP_LABEL covers all 10 chips": '≈ validate.test.ts (against the object)',
  "runtime tiers agree with the source": 'validate.test.ts',
  "SEVWORD is Warning/Advisory/Note": '≈ validate.test.ts (against the object)',
  "abutting windows do NOT overlap": '≈ time.test.ts (as behaviour, not source regex)',
  "VCONF thresholds unchanged": '≈ validate.test.ts (against the object)',
  "day warnings sorted hard → adv → note": 'validate.test.ts',
  "sev index keyed by day then person": 'validate.test.ts',
  "ALL AVAIL sentinels never raise warnings": 'validate.test.ts',
  "collectEvents skips cancelled lines": '≈ validate.test.ts (as behaviour)',
  "at least one warning of each tier in the seed": 'validate.test.ts',
  // funnel / edit board model contracts
  "slot round-trip all prefixes": '≈ slots.test.ts (keys built from the model, not data-slot)',
  "overflow crew round-trip on every list prefix": '≈ slots.test.ts',
  "an overflow slot is addressable and empties cleanly": 'slots.test.ts',
  "free text is never overwritten by a drop": 'slots.test.ts',
  "a no-op assignment is not an edit": '≈ slots.test.ts (made non-vacuous: pending stays empty)',
  "and flyRef returns nothing rather than throwing": 'slots.test.ts',
  "whoSet holds blanks, trims only the tail": '≈ slots.test.ts (as behaviour)',
  "a stale armed slot is put down when its row goes": '≈ slots.test.ts (armTargetExists behaviour; disarm wiring is UI)',
  "and it drops the deleted row, shifts the rest, leaves the earlier ones": 'keys.test.ts',
  "a per-day AL takes only that day's keys": '≈ publish.test.ts (as behaviour)',
  // L · SANS
  "sanStatus returns null for non-SANS": 'sans.test.ts',
  "SANS baseline: 6 for proficiency, 3 for allowance": 'sans.test.ts',
  "surplus sorties do NOT carry forward": 'sans.test.ts',
  "3 sorties earns allowance but not proficiency": 'sans.test.ts',
  "a short quarter counts as missed": 'sans.test.ts',
  "shortfall carries forward into the next quarter": 'sans.test.ts',
  "more than 2 short quarters puts them out of flying": 'sans.test.ts',
  "missing allowance is worse than missing proficiency": 'sans.test.ts',
  "exactly 6 meets proficiency": 'sans.test.ts',
  "out-of-flying is the most severe tier": 'sans.test.ts',
  "sanStatus is kept on purpose and still works": 'sans.test.ts',
  // S · standalone waves
  "SC keeps its AM and PM shifts": 'waves.test.ts',
  "AVALON runs overnight and no longer calls its shift MAIN": 'waves.test.ts',
  "BB still leaves its times blank": 'waves.test.ts',
  "SC main crews are still cross-checked": 'waves.test.ts',
  "SC spare crews are not": 'waves.test.ts',
  "every AVALON line is exempt": 'waves.test.ts',
  "the day count still counts mains only, once per shift": '≈ waves.test.ts (dayCount output, not the badge DOM)',
  // T / B34 · SC currency
  "a shift inside the window is a day shift": 'waves.test.ts',
  "a shift reaching outside it is a night shift": 'waves.test.ts',
  "the boundaries themselves are day": 'waves.test.ts',
  "an SC shift inside 0700-1900 is a day shift": 'waves.test.ts',
  "anything outside it is a night shift": 'waves.test.ts',
  "the roster holds a day-only and a both-current body": 'validate.test.ts',
  "an empty SC raises nothing": 'validate.test.ts',
  "a both-current body is fine on the day shift": 'validate.test.ts',
  "a day-current body is fine on the day shift": 'validate.test.ts',
  "moving the crew change past 19:00 changes what is required": 'validate.test.ts',
  // X · shift behaviour
  "the AM shift is read as 07:00-13:00": 'validate.test.ts',
  "the PM shift is read as 13:00-19:00": 'validate.test.ts',
  "so the two abut and do not overlap": 'validate.test.ts',
  "validate publishes when rest expires, per day per person": '≈ validate.test.ts (as behaviour)',
  // V · AAR
  "a bare AAR is day by default and night by the clock": 'aar.test.ts',
  "an untagged remark belongs to the front seat": 'aar.test.ts',
  "DAAR and NAAR are taken literally": 'aar.test.ts',
  "NO AAR / NO DAAR / NO NAAR ask for nothing": 'aar.test.ts',
  "a rear-seat tag is ignored outright": 'aar.test.ts',
  "a front-seat tag later in the line still counts": 'aar.test.ts',
  "a negation does not swallow a real requirement after it": 'aar.test.ts',
  "remarks with no AAR in them ask for nothing": 'aar.test.ts',
  "the digit is ignored — only the letter is read": 'aar.test.ts',
  "the invariant holds across the whole roster": '≈ aar.test.ts (over PEOPLE, not palette DOM)',
  "no WSO holds AAR currency": '≈ aar.test.ts (made non-vacuous)',
  // B42 · leave
  "the three leave types replace the single Leave": '≈ leave.test.ts (against INPUT_TYPES)',
  "LL is local, OL is overseas, OIL is off in lieu": '≈ leave.test.ts (against LEAVE_TYPES)',
  "all three read as leave, none of them as anything else": 'leave.test.ts',
  "LL and OIL keep the man on the island, OL does not": 'leave.test.ts',
  "and a downchit is still its own thing": 'leave.test.ts',
  "the roster really does carry leave to test against": 'leave.test.ts',
  "no TDY": 'leave.test.ts + ui/inputs.test.tsx',
  // U · slotRules / slotBar
  "slotRules reads the slot": '≈ slotrules.test.ts',
  "a front seat leaves no WSO selectable": '≈ slotrules.test.ts (through slotBar, not the palette DOM)',
  "and the reason is the real one": 'slotrules.test.ts',
  "a rear seat leaves only WSOs and IPs": 'slotrules.test.ts',
  "a plain pilot is barred from the rear seat": 'slotrules.test.ts',
  "an SC day shift leaves only SC DAY current crew selectable": '≈ slotrules.test.ts',
  "the rule engine agrees it is a day shift": 'slotrules.test.ts',
  "pushing the crew change past 19:00 changes who is selectable": '≈ slotrules.test.ts',
  "and the rule engine calls it night": 'slotrules.test.ts',
  "a duty slot has no seat rule but still darkens leave": '≈ slotrules.test.ts',
  "slotRules reads a sim seat": '≈ slotrules.test.ts (as behaviour)',
  "an ordinary flying seat carries no shift start, so no rest bar": 'slotrules.test.ts',
  "a spare slot is marked as one, so the picker can tell": '≈ slotrules.test.ts (as behaviour)',
  "the bar checks leave and downchit for that day": '≈ slotrules.test.ts (as behaviour)',
  "and reports which it was": '≈ slotrules.test.ts + leave.test.ts (offWord behaviour)',
  "a spare post forgives LL and OIL but not OL or a downchit": '≈ slotrules.test.ts (as behaviour)',
  // W · selection support
  "the count walks every place a person can be written": '≈ avail.test.ts (as behaviour)',
  "an SC spare is standing by, not tasked": '≈ avail.test.ts (dayStandby/dayEngaged behaviour)',
  // publish / sign flow (driven through buttons in tfin; through the engine here)
  "nor through the model": 'publish.test.ts',
  "three of four is still locked": '≈ publish.test.ts (signMissing, not the strip DOM)',
  "all four unlocks the day": '≈ publish.test.ts',
  "signing one day leaves the others locked": '≈ publish.test.ts',
  "the three scheduling roles offer ONLY appointed schedulers": '≈ publish.test.ts (signPeople, not the dropdowns)',
  "CUR CK stays open to everyone": '≈ publish.test.ts',
  "some schedulers are appointed": '≈ publish.test.ts',
  "the restricted list is a strict subset of the roster": '≈ publish.test.ts',
  "a signed day publishes from its own button": '≈ publish.test.ts (setDayApproved, not the button)',
  "publishing a day spends its signature": '≈ publish.test.ts',
  "and locks that day again": '≈ publish.test.ts',
  "publishing spends that day's signatures": '≈ publish.test.ts',
  "the day stays published though": 'publish.test.ts',
  "signing is per day, not shared": '≈ publish.test.ts',
  "the published AL records a name per day": '≈ publish.test.ts',
  "a withdrawn appointment invalidates the signature": '≈ publish.test.ts (as behaviour)',
  "reopening a day voids it too": '≈ publish.test.ts (as behaviour)',
  "unpublish clears AL1 marks": '≈ publish.test.ts (model marks, not the tint)',
  "publishing an AL needs that day signed": '≈ publish.test.ts (canPublishAL/alUnsignedDays)',
  "a blocked publish issues no AL": '≈ publish.test.ts',
  "AL1 published": '≈ publish.test.ts (SCHED.changes/als, not the banner)',
  "esc() closes attributes": 'skipped — esc is HTML-escaping, a rendering concern (React escapes natively); revisit in phase 4',
  // B53 / B48 / B52 engine parts
  "#14 the issue stamps its own day list and item count": '≈ publish.test.ts (as behaviour)',
  "#14 a delete cannot shrink an amendment that already went out": 'publish.test.ts',
  "#8 an offer adds nothing where a meeting would": 'validate.test.ts',
  "#8 offers are excluded from the brief and debrief windows": '≈ validate.test.ts + leave.test.ts (isOffer behaviour)',
  "#10 and OIL still leaves the spare slot open": '≈ validate.test.ts + slotrules.test.ts (as behaviour)',
  "#7 an edited crew rest changes what the label says": 'rules.test.ts',
  "#22 a stored rule must be a number inside its own bounds": '≈ rules.test.ts (as behaviour)',
  "#22 a hand-edited string never reaches VCONF": 'rules.test.ts',
  "the squadron standard is captured before anything can touch it": 'rules.test.ts',
  "every editable setting is bounded and named": 'rules.test.ts',
  "and every VCONF setting is editable — none is stranded": 'rules.test.ts',
  "a change reaches the ENGINE, not just the page": 'rules.test.ts',
  "a value outside its bounds is refused": '≈ rules.test.ts (parse + bounds; the refusal wiring is UI)',
  "the formats a scheduler would type all parse": 'rules.test.ts',
  "only what differs from standard is stored": '≈ rules.test.ts (ruleOff/rulesOffCount behaviour)',
  "reset restores the standard exactly": 'rules.test.ts',
  "the flag order is read from RANK, at module scope now": '≈ rules.test.ts (RANK values; module-scope is true by construction)',
  "AL3 bright green": '≈ publish.test.ts (alColor; the CSS var is phase 4)',
  "AL4 white": '≈ publish.test.ts (alColor; the CSS var is phase 4)',
  "cxText falls back to a plain CX with no reason": 'skipped — cxText/cxTag are HTML renderers (phase 4)',
}));

// line-range → skip reason
const SECTIONS = [
  [7, 83, 'jsdom UI — login, view-week rendering, puck selection, inline warning boxes'],
  [84, 211, 'jsdom UI — edit page, sign-off strips, publish buttons, banners (the model contracts behind them are ported to publish.test.ts)'],
  [212, 403, 'jsdom UI — roster palette, drag & drop wiring, store pills, AL panel, undo buttons, quals page, inputs page, scheduler board'],
  [405, 606, 'CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5'],
  [607, 654, 'engine (F) — see ported column'],
  [656, 716, 'jsdom UI — advisory-bar removal and cross-day warning focus rendering'],
  [718, 765, 'jsdom UI — person-focus narrowing of the warning box'],
  [767, 804, 'jsdom UI — day-detail panel'],
  [806, 812, 'CSS — AL colour variables (phase 4); alColor itself is tested in publish.test.ts'],
  [814, 841, 'UI/CSS — CX + flag mark rendering'],
  [843, 857, 'engine (K) — see ported column; source-text pins on prefixes/commit wiring stay with the reference suite'],
  [859, 878, 'engine (L·SANS) — see ported column'],
  [879, 951, 'UI — member login, drag-and-drop internals, touch-drag source pins'],
  [953, 988, 'CSS — phone board layout and the roster resize grip'],
  [990, 1027, 'source-text pins — week panning / proxy-scrollbar internals (behaviour proven by probes, phase 5)'],
  [1029, 1151, 'B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column)'],
  [1153, 1245, 'jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring'],
  [1247, 1291, 'jsdom UI — the CX reason dialog'],
  [1293, 1346, 'engine (S) — see ported column; the rendered MAIN/SPARE badges are phase-4 UI'],
  [1348, 1399, 'engine (T·SC currency) — see ported column; QUAL_COLS/source pins are UI'],
  [1401, 1577, 'engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI'],
  [1579, 1647, 'UI selection state (SELID/WFOCUS et al) — phase 3/4; personCount behaviour is ported'],
  [1649, 1748, 'engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test'],
  [1750, 1787, 'engine (V·AAR) — see ported column; quals-page tick wiring is UI'],
  [1789, 1913, 'Logic-tab UI (jsdom evals over the rendered page); the engine rules behind it are ported to rules.test.ts'],
  [1915, 1940, 'source-text pins — B49 drag internals, toast hit-test, click-eater'],
  [1942, 1992, 'B48 — source-text pins; shiftKeys renumbering and flyRef safety are ported'],
  [1994, 2112, 'B53 audit — engine parts ported (see ported column); session/edit-mode/Logic-page items are UI'],
  [2114, 2237, 'B54 per-day string-diff redraw — the mechanism React\'s reconciler replaces; its guarantees return as probes in phases 4–5'],
  [2239, 2264, 'CSS text-wrapping contract (B55) — phase 4; probes/wrap.js measures the behaviour'],
];

const out = [];
out.push('# tfin.js → Vitest port map (phase 2)');
out.push('');
out.push('Every assertion in `reference/tfin.js`, by its label, marked **ported** (with');
out.push('its Vitest home under `src/engine/`) or **skipped** (with why). “≈” means the');
out.push('assertion was adapted: the same contract, driven through the engine instead of');
out.push('the rendered page, or re-expressed as behaviour instead of a source-text regex.');
out.push('The reference suite itself still runs untouched (`npm run test:reference`),');
out.push('so every skipped assertion continues to be enforced against the reference.');
out.push('');
out.push('| tfin line | assertion | status |');
out.push('|---|---|---|');

let ported = 0, skipped = 0;
const re = /L\((?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g;
src.forEach((line, i) => {
  let m;
  while ((m = re.exec(line))) {
    const label = (m[1] ?? m[2]).replace(/\\'/g, "'");
    const clean = label.replace(/\|/g, '\\|');
    const hit = PORTED.get(label);
    if (hit) {
      ported++;
      const skippedNote = hit.startsWith('skipped');
      if (skippedNote) { skipped++; ported--; out.push(`| ${i + 1} | ${clean} | skipped — ${hit.replace(/^skipped — /, '')} |`); }
      else out.push(`| ${i + 1} | ${clean} | **ported** → ${hit} |`);
    } else {
      skipped++;
      const sec = SECTIONS.find(([a, b]) => i + 1 >= a && i + 1 <= b);
      out.push(`| ${i + 1} | ${clean} | skipped — ${sec ? sec[2] : 'UI/CSS/source-text (see section note)'} |`);
    }
  }
});
out.push('');
out.push(`Totals: ${ported} labels ported (some cover several tfin result lines), ${skipped} skipped.`);
fs.mkdirSync(require('path').join(__dirname,'..','docs'), { recursive: true });
fs.writeFileSync(require('path').join(__dirname,'..','docs','tfin-assertions.md'), out.join('\n') + '\n');
console.log('ported', ported, 'skipped', skipped);
