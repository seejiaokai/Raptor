import React, { useEffect, useRef, useState } from 'react';
import * as core from '../app/core.js';

const TOOLS = [
  { t: 'move', label: '✋ Move', title: 'Drag balls to reposition' },
  { t: 'select', label: '▣ Select', title: 'Drag a box on empty space to select several balls, then drag any of them to move the group' },
  { t: 'connect', label: '→ Connect', title: 'Click prerequisite first, then the event that depends on it' },
  { t: 'delball', label: '🗑 Delete', title: 'Delete whatever is selected — events or a line. With nothing selected, click an event, a drawn line, or a prerequisite arrow to delete it.', style: { borderLeft: '4px solid var(--red)' } },
];
const ADDS = [
  { a: 'flight', label: '+ Flight', style: { borderLeft: '4px solid var(--flight)' } },
  { a: 'acad', label: '+ Acad', style: { borderLeft: '4px solid var(--acad)' } },
  { a: 'test', label: '+ Test', style: { borderLeft: '4px solid var(--test)' } },
  { a: 'sim', label: '+ Sim', style: { borderLeft: '4px solid var(--sim)' } },
  { a: 'device', label: '+ CFT/IAT/EPT', style: { borderLeft: '4px solid var(--device)' } },
];
const TOOLS2 = [
  { t: 'text', label: '✎ Text', title: 'Click a ball to edit its text/type/number' },
  { t: 'line', label: '╱ Line', title: 'Draw a free right-angle line: click to start, then click where it ends. Ends snap to a ball or to another line; anything left loose stays unlinked.' },
  { t: 'editlines', label: '❐ Edit lines', title: 'Show N/E/S/W snap points on every ball; select a line and drag its ends onto them' },
];

/* Shows the chart's real size, not a hard-wired 8.5. The box keeps its own text
   while it has focus so "7." can be typed without snapping back to "7"; it
   follows the chart again once focus leaves or the selection changes. */
function FontBox() {
  const cur = core.currentFont();
  const [v, setV] = useState(String(cur));
  const ref = useRef(null);
  useEffect(() => { if (document.activeElement !== ref.current) setV(String(cur)); }, [cur]);
  return (
    <label className="sub">Font <input id="fontIn" ref={ref} className="fontnum" type="number" min="4" max="20" step="0.5" value={v}
      onChange={e => { setV(e.target.value); const n = parseFloat(e.target.value); if (n >= 4 && n <= 20) core.setFont(n); }}
      onBlur={() => setV(String(core.currentFont()))} /></label>
  );
}

/* The folded row's one-line hint per tool (D373) — the hint LINE is hidden on a short
   screen, so the row carries it; a flash message ("That link already exists.")
   takes its place while it lasts. */
const SHORT = {
  move: 'drag a ball · drag empty space to pan', select: 'drag a box to pick several balls',
  connect: 'tap the prerequisite, then the event after it', delball: 'tap what to delete',
  text: 'tap a ball to edit it', line: 'tap where it starts, then where it ends',
  editlines: 'drag a line’s end onto a blue point', merge: 'tap a line, then one crossing it',
  unmerge: 'tap a line, then one crossing it',
};
const LABEL = Object.fromEntries([...TOOLS, ...TOOLS2, { t: 'merge', label: '✕ Merge' }, { t: 'unmerge', label: '⌢ Unmerge' }].map(o => [o.t, o.label]));

export default function ArrangeTools() {
  const wrap = useRef(null);
  /* a press outside the open set closes it (the standing rule for a click-open
     popup — CLAUDE.md §Standing UI rules) */
  useEffect(() => {
    if (!core.toolsOpen) return;
    const away = e => { if (wrap.current && !wrap.current.contains(e.target)) core.setToolsOpen(false); };
    document.addEventListener('pointerdown', away, true);
    return () => document.removeEventListener('pointerdown', away, true);
  }, [core.toolsOpen]);
  /* every other button in the set also closes it first, so what it opens (a
     question, the event list) is never drawn under it */
  const then = f => () => { core.setToolsOpen(false); f(); };
  return (
    <div className="arrwrap" ref={wrap}>
    {/* ON A SHORT SCREEN — a phone on its side — the strip folds behind this row
        (owner, 28 Sep 26 — D373, "fold"; tracker.css shows it under ~500px tall) */}
    {core.arrangeMode ? (
      <div className="arrfold" id="arrFold">
        <button className="primary" id="foldTool" title="The tool in use — Tools ▾ has the rest" onClick={() => core.setToolsOpen(!core.toolsOpen)}>{LABEL[core.tool] || core.tool}</button>
        <span className="foldhint" id="foldHint">{core.hintFlash || SHORT[core.tool] || ''}</span>
        <button id="foldFit" title="Fit the whole flow in view" onClick={then(core.fitView)}>⤢ Fit</button>
        <button id="foldTools" className="foldtools" aria-expanded={core.toolsOpen ? 'true' : 'false'} aria-controls="arrTools"
          title="Every chart tool" onClick={() => core.setToolsOpen(!core.toolsOpen)}>Tools ▾</button>
      </div>
    ) : null}
    <div className={'arrtools' + (core.arrangeMode ? ' on' : '') + (core.toolsOpen ? ' open' : '')} id="arrTools">
      {TOOLS.map(o => (
        <button key={o.t} className={core.tool === o.t ? 'primary' : ''} title={o.title} style={o.style} onClick={() => core.toolButtonClick(o.t)}>{o.label}</button>
      ))}
      <span className="sep"></span>
      {ADDS.map(o => (
        <button key={o.a} style={o.style} onClick={then(() => core.addModule(o.a))}>{o.label}</button>
      ))}
      <span className="sep"></span>
      {TOOLS2.map(o => (
        <button key={o.t} className={core.tool === o.t ? 'primary' : ''} title={o.title} onClick={() => core.toolButtonClick(o.t)}>{o.label}</button>
      ))}
      <button id="arrowBtn" title="Select a line — drawn or prerequisite — then cycle: arrow at end → arrow at other end → no arrow" onClick={then(core.arrowClick)}>➤ Arrow</button>
      <button className={core.tool === 'merge' ? 'primary' : ''} title="Click one line then a crossing line: the hop is removed, and near-parallel drawn lines snap flush into one straight run. Drawn lines are merged by default." onClick={() => core.toolButtonClick('merge')}>✕ Merge</button>
      <button className={core.tool === 'unmerge' ? 'primary' : ''} title="Click one line then a crossing line to give the crossing an inverted-U hop. Works on drawn lines as well as prerequisite arrows." onClick={() => core.toolButtonClick('unmerge')}>⌢ Unmerge</button>
      <span className="sep"></span>
      <button id="selectAllBtn" title="Select every ball so the font box applies to all" onClick={then(core.selectAllClick)}>▣ Select all</button>
      <FontBox />
      <span className="sep"></span>
      {/* ↶ Undo / ↷ Redo left this strip for the main bar on 9 Sep 26 (owner):
          they take back marks as well as chart edits now, so they belong where
          everyone can reach them, not only inside edit mode. Header.jsx. */}
      <button id="fitBtn" title="Fit the whole flow in view" onClick={then(core.fitView)}>⤢ Fit</button>
      {/* Moved out of the header, where showing up only in edit mode pushed
          Marking as onto another row and slid the buttons under the pointer.
          The header's #fitViewBtn was a duplicate of #fitBtn and is gone. */}
      <button id="resetLayout" title="Put every event back where the chart says it goes" onClick={then(core.resetLayoutClick)}>↺ Reset layout</button>
      <span className="sep"></span>
      <button id="editSyl" title="Open the full event list to edit names, types, crew and prerequisites" onClick={then(core.openModal)}>📋 Edit events</button>
      <div className="arrnote">Double-click any pokéball on the chart to edit that event directly.</div>
    </div>
    </div>
  );
}
