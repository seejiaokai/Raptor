import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as core from '../app/core.js';
import { isComposing } from './keys.js';
import { edgeAutoScroll } from '../../ui/edgescroll';
import { markLand, paintLand } from '../../ui/lift';

/* ---------- generic in-page dialog (uiConfirm / uiPrompt / uiAlert / uiChoice) ---------- */
export function DlgModal() {
  const d = core.dlg;
  const [val, setVal] = useState('');
  const [q, setQ] = useState('');
  const serialRef = useRef(-1);
  const inputRef = useRef(null);
  const filterRef = useRef(null);
  /* A list (9 Sep 26, the + Add roster picker): the search box and the list
     sit ABOVE the text box, so the roster is the first thing offered and the
     free-text box the fallback. An empty list draws nothing — the dialog is
     then the old prompt to the byte. */
  /* a list may be given as a function, read on every render — the + Add roster, so a
     person added or taken off while the box is open shows at once ([TRK-RETEST-NOTES] C11) */
  const src = d && (d.listFn ? d.listFn() : d.list);
  const list = (Array.isArray(src) && src.length) ? src : null;
  /* Clear the fields to the new dialog's defaults DURING render, not in a
     post-paint effect. The effect version ran a beat AFTER the box was already
     on screen and fillable, so a value put into the field in that gap — a fast
     paste, a password manager, or the smoke suite typing at machine speed — was
     wiped by the reset a moment later, and OK then submitted a blank. That is
     exactly what made "+ Add" silently drop a student when the app was busy
     enough for the reset to land after the type (TRK-SMOKE, 17 Sep 26).
     Resetting during render (a supported React pattern for adjusting state when
     the source changes) means the field already holds the right value before it
     is ever shown, so nothing typed afterwards can be clobbered. Safe with a ref
     here rather than the docs' state-based form because notify() drives this
     through useSyncExternalStore, which renders synchronously — no discarded
     render can leave serialRef bumped without this reset committing. */
  if (d && serialRef.current !== core.dlgSerial) {
    serialRef.current = core.dlgSerial;
    setVal(d.def || ''); setQ('');
  }
  /* Focus after paint (it touches the DOM); the search box takes it when there
     is a list to search, the text box otherwise. KEYED ON THE DIALOG SERIAL so
     it arms exactly once per open: without a dependency array the cleanup ran on
     every incidental re-render, and a store notify landing inside the 30ms
     window (a hint flash, a re-fit, an async save) cleared the timer and never
     re-armed it — so the first keystrokes went to the page, which owns Escape
     and Ctrl+Z, until the user clicked into the box (TRK-SMOKE review).
     IT NEVER TAKES A CURSOR THE BOX ALREADY HAS. The 30ms is a minimum, not a
     promise: on a busy machine the timer fires late — after the user (or the
     smoke suite, typing at machine speed) has already clicked into "Or type a
     callsign" and started typing. Moving the cursor then sent the rest of the
     name into the SEARCH box, left the callsign blank, and OK added nobody,
     silently; on the plain prompt, the select() alone made the next key wipe
     what was typed. Three stops on GitHub's checks on 25 Sep 26, after "+ Add"
     on Tx 2026, were this (TRK-SMOKE-ADD-RACE, D190). So the timer stands
     down when the cursor is already in one of THIS box's typing fields; from
     anywhere else — the button that opened it, or nowhere — it moves it as
     before. */
  const modalRef = useRef(null);
  /* THE DOOR BEHIND THE SHADE IS SHUT ([TRK-DLG-LEFTOVERS], 28 Sep 26 — the plan's red
     team, Fable F3). The shade stops a pointer, not the keyboard: Tab walked out of the
     box into the Tracker's bar, and Enter on "+ Add" there opened a second question over
     the first. While a question is up, every other part of the Tracker's page is `inert`
     (no focus, no press) — the bar, the tool strip, the chart, the side panel and any
     window open under the question. Raptor's own top bar is outside the page and stays
     usable: its Logout asks about this question first (D129). Only what THIS effect
     marked is unmarked, so a part something else made inert is left as it was. */
  const open = !!d;
  useEffect(() => {
    if (!open) return;
    const box = modalRef.current, page = box && box.closest('.tr-root');
    if (!page) return;
    const marked = [];
    for (const el of page.children) {
      if (el === box || el.id === 'dlgOverlay' || el.hasAttribute('inert')) continue;
      el.setAttribute('inert', ''); marked.push(el);
    }
    return () => marked.forEach(el => el.removeAttribute('inert'));
  }, [open]);
  /* ...and Tab / Shift+Tab go round inside the box: from its last control to its first,
     and back. */
  const trapTab = e => {
    if (e.key !== 'Tab' || !modalRef.current) return;
    const f = [...modalRef.current.querySelectorAll('input, button, textarea, select, [tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1], at = document.activeElement;
    if (e.shiftKey ? (at === first || !modalRef.current.contains(at)) : (at === last || !modalRef.current.contains(at))) {
      e.preventDefault(); (e.shiftKey ? last : first).focus();
    }
  };
  useEffect(() => {
    if (!d) return;
    const t = setTimeout(() => {
      const box = modalRef.current, has = document.activeElement;
      if (box && has && box.contains(has) && (has.tagName === 'INPUT' || has.tagName === 'TEXTAREA')) return;
      const el = (list && d.filter) ? filterRef.current : inputRef.current;
      if (el) { el.focus(); el.select(); }
    }, 30);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [core.dlgSerial]);
  if (!d) return null;
  const needle = q.trim().toLowerCase();
  const shown = list ? list.filter(it => !needle || (it.label + ' ' + (it.sub || '')).toLowerCase().includes(needle)) : [];
  /* A callsign typed into the SEARCH that matches nobody on the roster, with
     "Or type a callsign" left empty, IS the name to add (D191, 25 Sep 26 — his
     "A"). + Add opens with the cursor in the search, so this is where a new
     name is most often typed; OK used to close the box having added nobody,
     silently ([TRK-SMOKE-ADD-RACE]'s sibling, Fable F1). A name in the box
     below still wins, and a search that matches someone adds nothing by
     itself — pick them. The line under the search says so while it is true. */
  const searchAsNew = (list && d.input && needle && !shown.length && !val.trim()) ? q.trim() : '';
  const ok = () => core.dlgClose(d.input ? (searchAsNew || val) : true);
  const cancel = () => core.dlgClose(d.input ? null : false);
  const pick = key => core.dlgClose({ pick: key });
  return (
    <>
      {/* The TOP of the Tracker's ladder (100/101): a question or a refusal is
          always answered before anything under it, whichever window raised it.
          At 70/71 it sat UNDER the Export window (90/91), Show All (80/81) and
          the details window (90/91), so Export's "Tick at least one syllabus."
          was drawn behind the window that asked it ([HUMAN-RETEST] Fable #6,
          23 Sep 26). Raptor's own overlays (400+) stay above the whole tab. */}
      <div className="overlay" id="dlgOverlay" style={{ zIndex: 100, display: 'block' }} onClick={cancel}></div>
      <div className="modal" id="dlgModal" ref={modalRef} role="dialog" aria-modal="true" onKeyDown={trapTab} style={{ zIndex: 101, width: 'min(420px, 92vw)', display: 'block' }}>
        <div id="dlgMsg" style={{ fontSize: 13.5, whiteSpace: 'pre-wrap', marginBottom: 12 }}>{d.msg}</div>
        {list && (
          <>
            {d.listTitle && <div className="mini dlg-listtitle">{d.listTitle}</div>}
            {d.filter && (
              <input id="dlgFilter" ref={filterRef} type="search" placeholder="Search by callsign" value={q}
                onChange={e => setQ(e.target.value)}
                /* Enter on the search box picks the one entry left — the keyboard
                   route through a long roster — and, with nobody left, does what
                   OK does: adds the name typed (D191) */
                onKeyDown={e => {
                  if (e.key !== 'Enter' || isComposing(e)) return;
                  if (shown.length === 1) { e.preventDefault(); pick(shown[0].key); }
                  else if (searchAsNew) { e.preventDefault(); ok(); }
                }} />
            )}
            <div id="dlgList" role="listbox">
              {shown.map(it => (
                <button type="button" className="dlg-item" key={it.key} data-key={it.key} role="option" onClick={() => pick(it.key)}>
                  <span className="dlg-lbl">{it.label}</span>
                  {it.sub ? <span className="dlg-sub">{it.sub}</span> : null}
                </button>
              ))}
              {!shown.length && <div className="mini dlg-none">Nobody on the roster matches “{q.trim()}”.{searchAsNew ? ' OK adds them as a new crew member.' : ''}</div>}
            </div>
          </>
        )}
        {d.input && (
          <input id="dlgInput" ref={inputRef} style={{ width: '100%', marginBottom: 12 }} value={val}
            placeholder={d.placeholder || undefined}
            onChange={e => setVal(e.target.value)}
            /* Escape is left to the app's own handler (core.handleEscapeKey), which
               closes this dialog and stops. Cancelling here as well let the same
               press carry on to the document and shut the editor underneath. */
            onKeyDown={e => { if (e.key === 'Enter' && !isComposing(e)) ok(); }} />
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {d.cancel && <button id="dlgCancel" onClick={cancel}>{d.cancelLabel || 'Cancel'}</button>}
          {d.alt && <button id="dlgAlt" onClick={() => core.dlgClose('__alt__')}>{d.alt}</button>}
          <button className="primary" id="dlgOk" onClick={ok}>{d.ok}</button>
        </div>
      </div>
    </>
  );
}

/* ---------- inline ball editor (Edit poke-ball) ---------- */
function EditModalInner({ id }) {
  const ev = core.byid[id];
  const d = core.infoFor(id);
  const [text, setText] = useState(ev.label || ev.id);
  const [type, setType] = useState(ev.type);
  const [num, setNum] = useState(ev.num != null ? String(ev.num) : '');
  const [crew, setCrew] = useState(d.crew || '');
  const [pre, setPre] = useState(d.pre || '');
  const [links, setLinks] = useState((ev.prereqs || []).join(', '));
  const [err, setErr] = useState('');
  const save = async () => {
    const e = await core.saveEdit({ text, type, num, crew, pre, links });
    if (e) setErr(e);
  };
  return (
    <div className="modal" id="editModal" style={{ width: 'min(460px,92vw)', display: 'block' }}>
      <h2>Edit poke-ball</h2>
      <div className="field"><label>Text</label><input id="edText" style={{ flex: 1 }} value={text} onChange={e => setText(e.target.value)} /></div>
      <div className="field"><label>Colour / type</label>
        <select id="edType" value={type} onChange={e => setType(e.target.value)}>
          <option value="flight">Flight (blue)</option>
          <option value="acad">Acad / Spec (green)</option>
          <option value="test">Test (red)</option>
          <option value="sim">Sim (amber)</option>
          <option value="device">CFT/IAT/EPT (purple)</option>
        </select>
      </div>
      <div className="field"><label>Number (badge)</label><input id="edNum" type="text" style={{ width: 90 }} placeholder="optional" value={num} onChange={e => setNum(e.target.value)} /></div>
      <div className="field"><label>Crew</label><input id="edCrew" style={{ flex: 1 }} placeholder="e.g. IP / UW, UP / IW" value={crew} onChange={e => setCrew(e.target.value)} /></div>
      <div className="field"><label>Prereq links</label><input id="edLinks" style={{ flex: 1 }} placeholder="comma-separated event IDs — draws the arrows" value={links} onChange={e => setLinks(e.target.value)} /></div>
      <div className="field"><label>Prerequisites (note)</label><input id="edPre" style={{ flex: 1 }} placeholder="free text shown in the details bubble" value={pre} onChange={e => setPre(e.target.value)} /></div>
      <small className="hint" style={{ display: 'block', marginTop: 2 }}>Prereq links drive the arrows on the chart and what counts as available. The note is the wording shown under Crew in the details bubble — leave it blank to fall back to the links.</small>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'space-between' }}>
        <button id="edDelete" style={{ borderColor: 'var(--red)', color: 'var(--red-ink)' }} onClick={core.deleteFromEditModal}>Delete ball</button>
        <span><button id="edCancel" onClick={core.closeEdit}>Cancel</button> <button className="primary" id="edSave" onClick={save}>Save</button></span>
      </div>
      <div id="edErr" style={{ color: 'var(--red)', marginTop: 8, fontSize: 12 }}>{err}</div>
    </div>
  );
}
export function EditModal() {
  const id = core.editId;
  return (
    <>
      {(id != null || core.sylModalOpen) && (
        <div className="overlay" id="overlay" style={{ display: 'block' }} onClick={() => { core.closeModal(); core.closeEdit(); }}></div>
      )}
      {id != null && core.byid[id] && <EditModalInner key={id} id={id} />}
    </>
  );
}

/* ---------- event info editor ---------- */
function InfoModalInner({ id }) {
  const init = core.infoFor(id);
  const [name, setName] = useState(init.name || '');
  const [fmtV, setFmtV] = useState(init.fmt || '');
  const [hrs, setHrs] = useState(init.hrs || '');
  const [crew, setCrew] = useState(init.crew || '');
  const [pre, setPre] = useState(init.pre || '');
  /* "Reset to doc" puts the source document's wording back in the BOXES; Save
     keeps it, Cancel drops it. It used to save on the press, so the Cancel
     beside it cancelled nothing, and on a ball the user made — which has no
     document — it blanked every field with no way back ([HUMAN-RETEST] w3-F4).
     No document, no button. */
  const hasDoc = core.hasDocInfo(id);
  const reset = () => {
    const d = core.docInfoFor(id);
    setName(d.name || ''); setFmtV(d.fmt || ''); setHrs(d.hrs || ''); setCrew(d.crew || ''); setPre(d.pre || '');
  };
  return (
    <>
      {/* above #showAllPanel (81) so it can never open behind the Show All list */}
      <div className="overlay" id="infoOverlay" style={{ zIndex: 90, display: 'block' }} onClick={core.closeInfo}></div>
      <div className="modal" id="infoModal" style={{ zIndex: 91, width: 'min(440px,94vw)', display: 'block' }}>
        <h2 id="infoTitle">{id} — details</h2>
        <div className="field"><label>Name</label><input id="ifName" style={{ flex: 1 }} value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="field"><label>Type / format</label><input id="ifFmt" style={{ flex: 1 }} placeholder={core.FMT_HINT} value={fmtV} onChange={e => setFmtV(e.target.value)} /></div>
        <div className="field"><label>Hours</label><input id="ifHrs" style={{ width: 120 }} placeholder="e.g. 1.5 Hrs" value={hrs} onChange={e => setHrs(e.target.value)} /></div>
        <div className="field" style={{ alignItems: 'flex-start' }}><label>Crew</label><textarea id="ifCrew" placeholder="e.g. UP/UW, IP/IW/FSI" value={crew} onChange={e => setCrew(e.target.value)} /></div>
        <div className="field" style={{ alignItems: 'flex-start' }}><label>Prerequisites</label><textarea id="ifPre" placeholder="e.g. AVI-02, AVI-03, AVI-04" value={pre} onChange={e => setPre(e.target.value)} /></div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
          {hasDoc
            ? <button id="ifReset" title="Put the source document's wording back in the boxes — Save keeps it, Cancel doesn't" style={{ marginRight: 'auto' }} onClick={reset}>Reset to doc</button>
            : <span style={{ marginRight: 'auto' }} />}
          <button id="ifCancel" onClick={core.closeInfo}>Cancel</button>
          <button className="primary" id="ifSave" onClick={() => core.saveInfo({ name, fmt: fmtV, hrs, crew, pre })}>Save</button>
        </div>
      </div>
    </>
  );
}
export function InfoModal() {
  const id = core.infoId;
  if (id == null) return null;
  return <InfoModalInner key={id} id={id} />;
}

/* ---------- syllabus editor (raw JSON) ---------- */
function SylModalInner() {
  const [text, setText] = useState(() => JSON.stringify(core.SYL, null, 1));
  const [err, setErr] = useState('');
  const save = async () => { const e = await core.saveSylText(text); if (e) setErr(e); };
  return (
    <div className="modal" id="sylModal" style={{ display: 'block' }}>
      <h2>Edit events / flow</h2>
      <small className="hint">Each event: {'{'}"id","type","phase","seq","prereqs":[...]{'}'}. type = flight | acad | test | sim | device. Two events sharing the same prereqs run in parallel (branch). Edit and Save to regenerate the board — then hit “Save changes” in the header to keep it.</small>
      <textarea id="sylText" spellCheck={false} value={text} onChange={e => setText(e.target.value)} />
      <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
        <button id="sylCancel" onClick={core.closeModal}>Cancel</button>
        <button className="primary" id="sylSave" onClick={save}>Save</button>
      </div>
      <div id="sylErr" style={{ color: 'var(--red)', marginTop: 8, fontSize: 12 }}>{err}</div>
    </div>
  );
}
export function SylModal() {
  if (!core.sylModalOpen) return null;
  return <SylModalInner />;
}

/* ---------- reorder syllabi, courses or crew ----------
   One component, three modes. The rows, the drag handling and the ▲/▼ buttons
   are identical; only the list, the row tag and where it saves differ. Three
   copies would mean fixing the next drag bug three times.
   A FINGER DRAGS A ROW BY ITS ⠿ GRIP, A MOUSE ANYWHERE ON IT, AND BOTH WEAR THE APP'S ONE DRAG LOOK (owner D922,
   D924 — "All as recommended", 15 Oct 26; drawn first, docs/mock/2026-10-15-trk-reorder-drag/): the carried row
   ringed, ONE landing line in the gap (the design guide §5a), the row flashing where it lands. The browser's own
   drag, which does not work by touch and drew a box round the row it would replace, is gone; the ▲/▼ stay, the
   keyboard's way. "Drag a row, or use ▲/▼." went from the notes with it (D924; the guide's rule on words that
   only say what the screen shows, D846). */
const ORD_MODES = {
  syllabus: {
    title: 'Syllabus order',
    note: 'This sets the order of the Syllabus dropdown for every course.',
    read: () => core.orderedSylNames(),
    /* the modal lists LABELS (unique per catalogue, §9); resolve label→id to tag */
    tag: n => { const id = core.sylIdOf(n); return (id && core.builtinOf(id)) ? (core.sylHasOwnDef(id) ? 'built-in ✎ edited' : 'built-in') : 'custom'; },
    save: l => core.saveOrderList(l),
  },
  course: {
    title: 'Course order',
    note: 'This sets the order of the Course dropdown, and everyone sharing this tracker sees it.',
    /* names, not entries: the shared OrdModal renders each row as a string and
       sorts by localeCompare, and course names are unique among courses, so it
       reorders by name and saveCourseOrder maps names back to entries (the
       saveCrewOrder pattern, review CSID-09) */
    read: () => core.COURSES.map(c => c.name),
    tag: n => (n === core.curCourseName() ? 'current' : ''),
    save: l => core.saveCourseOrder(l),
  },
  crew: {
    title: 'Crew order',
    note: 'This also sets which slice of every ball belongs to whom — first in the list is the first slice.',
    read: () => core.roster.map(r => r.name),
    tag: (n, i) => '#' + (i + 1),
    save: l => core.saveCrewOrder(l),
  },
};
function OrdModalInner({ mode }) {
  const cfg = ORD_MODES[mode] || ORD_MODES.syllabus;
  const [list, setList] = useState(() => cfg.read());
  /* THE DRAG (D922, D924). One pointer machine for a finger and a mouse, the shape of a day's notes on the Inputs
     calendar (ui/InputsCal.tsx startSecDrag): window listeners for the life of one drag, the row under the pointer
     read at a point, the row-half rule, one line a gap. The looks ride classes React writes from state (`dragging`,
     `dragover`, `after`) — an imperative class would be wiped by the re-render the drag itself causes.
     A finger takes a row by its grip only, which carries `touch-action:none` (tracker.css): anywhere else a finger
     scrolls the list, so a long crew list still scrolls. A mouse takes it anywhere but its buttons, once it has moved
     a few pixels — a click stays a click. */
  const [drag, setDrag] = useState(null);      // index of the row being carried
  const [over, setOver] = useState(null);      // { i, after } — the ONE row that wears the landing line
  const dragEnd = useRef(null);                // ends the drag in flight (a cancel), or null
  const pressEnd = useRef(null);               // ends a mouse press still under its 4px (not yet a drag), or null
  useEffect(() => () => { if (dragEnd.current) dragEnd.current(false); if (pressEnd.current) pressEnd.current(); }, []);
  /* the moved row flashes where it landed (lift.ts — the mark is taken at the drop, painted once React has redrawn) */
  useLayoutEffect(() => { paintLand(); });
  /* ONE POINTER A DRAG (the code read of 15 Oct 26, F1): every listener answers only the pointer that took the row —
     a second finger, or the mouse while a finger carries, neither moves the line nor drops the row. */
  const beginDrag = (from, x0, y0, touch, rowEl, pid) => {
    const box = rowEl.parentElement;
    const n = box ? box.children.length : 0;
    /* where a release would put the row: before row j (j = n: after the last), 'self' for its own place, or null */
    let target = null;
    let px = x0, py = y0;
    /* the row under a point — by a move, and again after an edge scroll slid the rows under a still pointer (D900) */
    const hoverAt = (x, y) => {
      const el = document.elementFromPoint(x, y);
      const row = el && el.closest ? el.closest('#ordList .ordrow') : null;
      let line = null;
      target = null;
      if (row && row.parentElement === box) {
        const i = [...box.children].indexOf(row);
        const r = row.getBoundingClientRect();
        const lower = r.height > 0 && y > r.top + r.height / 2;
        /* ONE LINE A GAP (§5a; D890 on the Leave War, D891): a row's lower half and the upper half of the row below it
           are ONE drop — "before the row that follows" — so the line is drawn once, on that row's top edge; only under
           the last row is it drawn on a row's foot */
        const j = lower ? i + 1 : i;
        if (j === from || j === from + 1) target = 'self';   // its own place: no line, a release flashes it in place
        else { target = j; line = j < n ? { i: j, after: false } : { i: n - 1, after: true }; }
      }
      setOver(o => (o && line && o.i === line.i && o.after === line.after) || (!o && !line) ? o : line);
    };
    setDrag(from);
    /* A ROW CARRIED TO THE LIST'S TOP OR FOOT SCROLLS IT THAT WAY (owner D900; §5a), at Raptor's one edge feel
       (ui/edgescroll.ts) — only a list longer than its box: a short one has nothing to show, and the page behind the
       window must not be scrolled in its place */
    const auto = box && box.scrollHeight > box.clientHeight + 1
      ? edgeAutoScroll({ from: rowEl, axis: 'y', touch, x: x0, y: y0, onScroll: () => hoverAt(px, py) })
      : null;
    const move = ev => {
      if (ev.pointerId !== pid) return;
      /* A MOUSE RELEASE THE PAGE NEVER HEARD (F2) — the right button's menu took it, or it came up in another program:
         a move with no button held ends the carry, so the next click (Save order's, say) drops nothing */
      if (!touch && !(ev.buttons & 1)) { end(false); return; }
      px = ev.clientX; py = ev.clientY; if (auto) auto.point(px, py); hoverAt(px, py);
    };
    const end = commit => {
      if (auto) auto.stop();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('keydown', key, true);
      window.removeEventListener('blur', lost);
      dragEnd.current = null;
      setDrag(null); setOver(null);
      if (!commit || target == null) return;
      /* A COMMITTED DROP FLASHES WHERE THE ROW ENDED UP, MOVED OR NOT (the app's drops, 7 Sep 26) */
      const to = target === 'self' ? from : (target > from ? target - 1 : target);
      markLand(`#ordList .ordrow:nth-child(${to + 1})`);
      if (target === 'self') return;            // the drag's own classes coming off re-render, and that paints it
      setList(l => { const a = [...l]; const [m] = a.splice(from, 1); a.splice(to, 0, m); return a; });
    };
    const up = ev => { if (ev.pointerId === pid) end(true); };
    const cancel = ev => { if (ev.pointerId === pid) end(false); };
    const lost = () => end(false);                // the window lost focus mid-carry (F2)
    /* Escape ends the drag, not the window (heard before the Tracker's own Escape, which would close it) */
    const key = ev => { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopImmediatePropagation(); end(false); } };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('keydown', key, true);
    window.addEventListener('blur', lost);
    dragEnd.current = end;
    hoverAt(x0, y0);
    return move;
  };
  /* a finger (or a pen) on the grip takes the row at once; the grip's touch-action keeps the list from scrolling */
  const gripDown = (e, i) => {
    if (e.pointerType === 'mouse' || dragEnd.current || pressEnd.current) return;   // a mouse is the row's own handler below
    e.preventDefault(); e.stopPropagation();
    beginDrag(i, e.clientX, e.clientY, true, e.currentTarget.closest('.ordrow'), e.pointerId);
  };
  /* a mouse anywhere on the row but its buttons, once it has moved 4px (then that move is the drag's first) */
  const rowDown = (e, i) => {
    if (e.pointerType !== 'mouse' || (e.button != null && e.button !== 0) || dragEnd.current || pressEnd.current) return;
    if (e.target.closest && e.target.closest('button')) return;
    const rowEl = e.currentTarget, x0 = e.clientX, y0 = e.clientY, pid = e.pointerId;
    const stop = () => {
      window.removeEventListener('pointermove', wait); window.removeEventListener('pointerup', done); window.removeEventListener('pointercancel', done); window.removeEventListener('blur', stop);
      pressEnd.current = null;
    };
    const done = ev => { if (ev.pointerId === pid) stop(); };
    const wait = ev => {
      if (ev.pointerId !== pid) return;
      if (!(ev.buttons & 1)) { stop(); return; }   // released where the page could not hear it (F2)
      if (Math.abs(ev.clientX - x0) <= 4 && Math.abs(ev.clientY - y0) <= 4) return;
      stop();
      beginDrag(i, x0, y0, false, rowEl, pid)(ev);  // this move is the drag's first
    };
    window.addEventListener('pointermove', wait);
    window.addEventListener('pointerup', done);
    window.addEventListener('pointercancel', done);
    window.addEventListener('blur', stop);
    pressEnd.current = stop;
  };
  /* What can come back: deleted built-in syllabi, and deleted courses (owner,
     23 Sep 26 — D128; their records were always kept). Crew has none — a
     removed student's marks are deleted, and the question says so. */
  /* {id,name} each (§9 CSID2-09) */
  const hid = mode === 'syllabus' ? core.hiddenBuiltins() : mode === 'course' ? core.deletedCourses() : [];
  const move = (i, j) => setList(l => { const a = [...l]; [a[i], a[j]] = [a[j], a[i]]; return a; });
  const restore = async item => {
    if (mode === 'course') {
      await core.restoreCourse(item.id);
      /* the name may have gained "(restored)" beside a course made since */
      const label = core.courseName(item.id) || item.name;
      setList(l => (l.includes(label) ? l : [...l, label]));
      return;
    }
    await core.restoreHiddenSyl(item.id);
    /* the actual label may have gained a suffix (ensureUniqueLabel), so read it
       back rather than reuse the shipped name (review CSID-REV-11) */
    const label = core.sylName(item.id) || item.name;
    setList(l => (l.includes(label) ? l : [...l, label]));
  };
  return (
    <>
      <div className="overlay" id="ordOverlay" style={{ zIndex: 70, display: 'block' }} onClick={core.closeOrd}></div>
      <div className="modal" id="ordModal" data-ord={mode} style={{ zIndex: 71, width: 'min(420px,92vw)', display: 'block' }}>
        <h2 id="ordTitle">{cfg.title}</h2>
        <div className="mini" style={{ marginBottom: 8 }}>{cfg.note}</div>
        <div id="ordList" style={{ maxHeight: '52vh', overflow: 'auto', border: '1px solid var(--line)', borderRadius: 8 }}>
          {list.map((n, i) => {
            const tag = cfg.tag(n, i);
            return (
              <div key={n} className={'ordrow' + (drag === i ? ' dragging' : '') + (over && over.i === i ? (over.after ? ' dragover after' : ' dragover') : '')}
                onPointerDown={e => rowDown(e, i)}>
                <span className="grip" onPointerDown={e => gripDown(e, i)}>⠿</span>
                <span className="onm">{n}</span>
                <span className="otag">{tag}</span>
                <button title="Move up" disabled={i === 0} onClick={e => { e.stopPropagation(); move(i, i - 1); }}>▲</button>
                <button title="Move down" disabled={i === list.length - 1} onClick={e => { e.stopPropagation(); move(i, i + 1); }}>▼</button>
              </div>
            );
          })}
        </div>
        {hid.length > 0 && (
          <div id="ordHiddenWrap" style={{ marginTop: 12 }}>
            <div className="mini" style={{ marginBottom: 6 }}>{mode === 'course'
              ? 'Deleted courses — restore to bring one back into the dropdown, with its students and marks.'
              : 'Deleted built-in syllabi — restore to bring one back into the dropdown.'}</div>
            <div id="ordHidden" style={{ maxHeight: '22vh', overflow: 'auto', border: '1px solid var(--line)', borderRadius: 8 }}>
              {hid.map(item => (
                <div key={item.id} className="ordrow">
                  <span className="onm">{item.name}</span><span className="otag">deleted</span>
                  <button title={mode === 'course' ? 'Restore this course' : 'Restore this built-in syllabus'} onClick={() => restore(item)}>↺ Restore</button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
          <button id="ordAlpha" style={{ marginRight: 'auto' }} title="Sort A to Z" onClick={() => setList(l => [...l].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })))}>A–Z</button>
          <button id="ordCancel" onClick={core.closeOrd}>Cancel</button>
          <button className="primary" id="ordSave" onClick={() => cfg.save(list)}>Save order</button>
        </div>
      </div>
    </>
  );
}
export function OrdModal() {
  if (!core.ordMode) return null;
  /* Keyed on the mode so switching lists rebuilds the working copy rather than
     reordering the previous one. */
  return <OrdModalInner key={core.ordMode} mode={core.ordMode} />;
}

/* ---------- Export: pick what goes into the file ----------
   The one way data leaves the app (owner, 9 Sep 26): a backup before the
   database move (tick both), or a chart to hand over (charts only, the
   default). The ids keep their `copy` prefix — the mechanism is the same copy
   the "Save a copy" dialog made; only its job widened. */
function CopyModalInner() {
  const ids = core.orderedSylIds();          /* copyPick keys by syllabus id (§9) */
  const picked = ids.filter(id => core.copyPick[id]).length;
  return (
    <>
      <div className="overlay" id="copyOverlay" style={{ zIndex: 90, display: 'block' }} onClick={core.closeCopy}></div>
      <div className="modal" id="copyModal" style={{ zIndex: 91, width: 'min(460px, 92vw)', display: 'block' }}>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>Export</div>
        <div className="mini" style={{ marginBottom: 10 }}>
          A copy of the Tracker's data as a file. Tick both for a full backup you can bring back with Import; charts only to hand a syllabus over. Nothing here is changed.
        </div>
        <label style={{ display: 'block', marginBottom: 6 }}>
          <input type="checkbox" id="copyCharts" checked={core.copyOpts.charts}
            onChange={e => core.setCopyOpt('charts', e.target.checked)} /> Charts
        </label>
        <label style={{ display: 'block', marginBottom: 4 }}>
          <input type="checkbox" id="copyStudents" checked={core.copyOpts.students}
            onChange={e => core.setCopyOpt('students', e.target.checked)} /> Students &amp; courses
        </label>
        <div className="mini" id="copyWarn" style={{ marginBottom: 10, opacity: core.copyOpts.students ? 1 : 0.65 }}>
          {core.copyOpts.students
            ? '⚠ This copy will contain real names and marks. Only send it to someone entitled to see them.'
            : 'Names and marks stay out — safe to send.'}
        </div>
        {/* All / None (the [HUMAN-RETEST] walk, 23 Sep 26 — Fable #5): the list
            still opens on the chart on screen (the 7 Aug safety default), but
            the backup before the database move carries EVERY chart (D120), and
            ticking them one by one is how one gets missed. */}
        <div className="mini" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ flex: 1 }}>Syllabi to include ({picked} ticked)</span>
          <button className="sm" id="copyTickAll" onClick={() => core.setCopyPickAll(true)}>All</button>
          <button className="sm" id="copyTickNone" onClick={() => core.setCopyPickAll(false)}>None</button>
        </div>
        <div id="copySylList" style={{ maxHeight: '30vh', overflow: 'auto', border: '1px solid var(--line)', borderRadius: 8, padding: 6 }}>
          {ids.map(id => (
            <label key={id} style={{ display: 'block', padding: '2px 4px' }}>
              <input type="checkbox" checked={!!core.copyPick[id]}
                onChange={e => core.setCopyPick(id, e.target.checked)} /> {core.sylName(id)}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
          <button id="copyCancel" onClick={core.closeCopy}>Cancel</button>
          <button className="primary" id="copyOk" onClick={core.saveCopyClick}>Export</button>
        </div>
      </div>
    </>
  );
}
export function CopyModal() {
  if (!core.copyOpen) return null;
  return <CopyModalInner />;
}
