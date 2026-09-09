import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as core from '../app/core.js';

/* The panel is always in the DOM and hidden with CSS, never conditionally
   rendered. Two reasons: the file name and the save tick-boxes have to stay
   readable while the menu is shut, and a button that is removed and recreated
   around a click is exactly how the file-picker gesture got spent before. */
/* `icon` drops the ▾ caret and shows the glyph alone (the Course / Syllabus
   edit pencils). `active` lights the button (primary) even while shut — the
   syllabus pencil uses it to show the chart is in edit mode. */
function Menu({ id, label, title, children, icon, active }) {
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState(null);
  const ref = useRef(null), btn = useRef(null);
  /* The panel is position:fixed and placed by hand. It used to be absolute
     inside the button — which works on a desktop and is DEAD on a phone, where
     the header scrolls sideways: an overflow container clips its own absolutely
     positioned children, so the panel was drawn but cut off at the 41px header
     and every tap landed on the view tabs underneath instead. */
  useLayoutEffect(() => {
    if (!open || !btn.current) { setAt(null); return; }
    const place = () => {
      const r = btn.current.getBoundingClientRect();
      const w = 200, pad = 6;
      setAt({
        left: Math.round(Math.max(pad, Math.min(r.left, innerWidth - w - pad))),
        top: Math.round(r.bottom + 5),
        maxHeight: Math.round(innerHeight - r.bottom - 5 - pad),
      });
    };
    place();
    addEventListener('resize', place);
    addEventListener('scroll', place, true);
    return () => { removeEventListener('resize', place); removeEventListener('scroll', place, true); };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const away = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [open]);
  return (
    <span className="menu" ref={ref}>
      <button className={'sm' + (icon ? ' icon' : '') + (open || active ? ' primary' : '')} id={id + 'MenuBtn'} title={title} ref={btn}
        aria-expanded={open} onClick={() => setOpen(o => !o)}>{icon ? label : <>{label} ▾</>}</button>
      {/* Closing on bubble, so the item's own handler has already run — the
          file pickers throw if anything awaits before them. */}
      <div className={'menupanel' + (open ? ' on' : '')} id={id + 'MenuPanel'}
        style={at ? { left: at.left + 'px', top: at.top + 'px', maxHeight: at.maxHeight + 'px' } : undefined}
        onClick={e => { if (e.target.closest('button')) setOpen(false); }}>
        {children}
      </div>
    </span>
  );
}

/* Find one ball on a 210-event chart. On a phone the bar is one row that
   scrolls sideways, so the box hides behind a 🔍 button and opens as a
   full-width strip underneath — position:fixed and placed by hand for the same
   reason the menu panels are: an overflow container clips its own absolutely
   positioned children, so an absolute strip is drawn and then cut off at the
   41px header. */
function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState(null);
  const wrap = useRef(null), input = useRef(null);
  useLayoutEffect(() => {
    if (!open) { setAt(null); return; }
    const place = () => {
      const h = document.querySelector('header');
      setAt({ top: Math.round(h ? h.getBoundingClientRect().bottom + 4 : 44) });
    };
    place();
    addEventListener('resize', place);
    addEventListener('scroll', place, true);
    return () => { removeEventListener('resize', place); removeEventListener('scroll', place, true); };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const away = e => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);
  const hits = core.searchCount;
  const stat = !core.searchQ ? '' : (hits === 0 ? 'no match' : (hits === 1 ? '1 match' : `${core.searchAt + 1} of ${hits}`));
  return (
    <span className="findwrap" ref={wrap}>
      <button className="sm" id="hSearchBtn" title="Find an event on the chart"
        onClick={() => { setOpen(o => !o); setTimeout(() => input.current && input.current.focus(), 0); }}>🔍</button>
      <span className={'findpanel' + (open ? ' on' : '')} id="hSearchPanel"
        style={at ? { top: at.top + 'px' } : undefined}>
        <input id="hSearch" ref={input} placeholder="Find event…" value={core.searchQ}
          onChange={e => core.runSearch(e.target.value, false)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); core.runSearch(core.searchQ, true); }
            /* Not stopPropagation: Escape still has to reach the app's own
               handler, it simply clears the box first. */
            if (e.key === 'Escape') { core.clearSearch(); e.currentTarget.blur(); setOpen(false); }
          }} />
        <button className="sm" id="hSearchClear" title="Clear the search"
          onClick={() => { core.clearSearch(); if (input.current) input.current.focus(); }}>✕</button>
        <span className="findstat" id="hSearchStat">{stat}</span>
      </span>
    </span>
  );
}

export default function Header() {
  const sylNames = core.ready ? core.orderedSylNames() : [];
  const sylValue = (core.plan && core.plan.sylName) || core.DEFAULT_SYL_NAME;
  const sylOptions = sylNames.includes(sylValue) ? sylNames : [...sylNames, sylValue];
  /* Unsaved FLOW edits only. Until 9 Sep 26 this also watched the user's file
     (`fileDirty`), so a mark lit the button and pressing it opened a save-file
     dialog; the store is the record now, marks save themselves, and the File
     menu is import/export only. */
  const dirty = core.sylDirty;
  /* THE FILE PORTION IS THE ADMIN'S (owner, 7 Sep 26): a member gets every
     other control on this bar — the pickers, the Course and Syllabus menus,
     Edit, Details and Save changes — and not the File menu (Import, Export).
     The entry points behind it are guarded in core.js too; this is the
     affordance half. */
  const fileLocked = core.fileLocked;

  return (
    <header>
      <div>
        <h1 id="courseTitle">{core.course || ''} PROGRESS TRACKER</h1>
        <div className="sub sub-strap">Multi-student · single platform · <span id="evCount">{core.SYL.length} events</span></div>
      </div>
      <div className="controls">
        {/* Crew leads the bar: it is the control that gets changed first every
            session. On the phone the title block is display:none, so being the
            first child of .controls is what puts it far left there too — no
            separate phone rule. It stays INSIDE .controls because the header
            checks scope to "header .controls" and a sibling would silently
            drop out of them. */}
        <label className="sub"><span className="lbltx">Crew</span>{' '}
          <select id="activeSel" value={core.active || ''} onChange={e => core.setActive(e.target.value)}>
            {core.roster.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        {/* Course: pick from the dropdown; the ✎ pencil beside it holds add /
            rename / reorder / delete (owner, 9 Sep 26 — the wide "Course ▾"
            menu became an edit icon that sits right after its dropdown). */}
        <label className="sub"><span className="lbltx">Course</span>{' '}
          <select id="courseSel" value={core.course || ''} onChange={e => core.switchCourse(e.target.value)}>
            {core.COURSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <Menu id="course" label="✎" icon title="Edit courses — add, rename, reorder or delete">
          <button className="sm" id="addCourse" onClick={core.addCourse}>+ Add course</button>
          <button className="sm" id="renCourse" title="Rename the current course" onClick={core.renCourse}>✎ Rename course</button>
          <button className="sm" id="ordCourse" title="Change the order courses appear in the dropdown" onClick={core.openOrdCourse}>⇅ Reorder courses</button>
          <div className="msep" />
          <button className="sm" id="delCourse" title="Delete the current course" onClick={core.delCourse}>🗑 Delete course</button>
        </Menu>

        {/* Syllabus: pick from the dropdown; the ✎ pencil beside it now ALSO
            holds "Edit chart layout" — the old standalone Edit button, folded
            in as a menu item (owner, 9 Sep 26: "fuse it into the syllabus edit
            icon"). The pencil LIGHTS (active) while the chart is in edit mode,
            and the top item reads "Done editing" so there is always a way out
            even though the toolbar below the bar also shows it. */}
        <label className="sub"><span className="lbltx">Syllabus</span>{' '}
          <select id="sylSel" value={sylValue} onChange={e => core.switchSyllabus(e.target.value)}>
            {sylOptions.map(n => <option key={n} value={n}>{n + (core.CUSTOMS[n] ? ' ✎' : '')}</option>)}
          </select>
        </label>
        <Menu id="syl" label="✎" icon active={core.arrangeMode} title="Edit the syllabus — chart layout, duplicate, rename, reorder or delete">
          <button className="sm" id="arrangeBtn" title="Draw and move events, prerequisites and lines on the chart" onClick={core.toggleArrange}>{core.arrangeMode ? '✓ Done editing chart' : '✎ Edit chart layout'}</button>
          <div className="msep" />
          <button className="sm" id="dupSyl" title="Make an exact copy of the current syllabus, including every student's marks" onClick={core.dupSyl}>⧉ Duplicate syllabus</button>
          <button className="sm" id="addSyl" title="Create a new syllabus from the current structure with a clean slate (no marks)" onClick={core.addSyl}>+ Add syllabus</button>
          <button className="sm" id="renSyl" title="Rename the current syllabus (built-ins included)" onClick={core.renSyl}>✎ Rename syllabus</button>
          <button className="sm" id="ordSyl" title="Change the order syllabi appear in the dropdown" onClick={core.openOrd}>⇅ Reorder syllabi</button>
          <div className="msep" />
          <button className="sm" id="delSyl" title="Delete the current syllabus, built-in or custom. Deleted built-ins can be restored from Reorder." onClick={core.delSyl}>🗑 Delete syllabus</button>
        </Menu>

        {/* Info mode (was "Details mode"): a compact ⓘ icon now, sitting right
            after the syllabus pencil (owner, 9 Sep 26 — "change it to i icon").
            Turn it on and hovering an event (tapping on a phone) pops its
            title, type, crew & prerequisites; marking is off while it is on. */}
        <button className={'sm icon' + (core.showDetails ? ' primary' : '')} id="detailsBtn" title="Show each event's title, type, crew & prerequisites on hover (tap on a phone) — marking is off while this is on" onClick={core.toggleDetails}>ⓘ</button>

        {/* Show All moved to the right of the syllabus group (owner, 9 Sep 26).
            On a phone the button is hidden: the Show All tab under the bar is
            already there. */}
        <button className="sm" id="showAllBtn" title="Show name, crew & prerequisites for every event" onClick={core.openShowAll}>☰ Show All</button>

        {/* Two one-way moves between the store and a file, nothing that binds
            a file (owner, 9 Sep 26): Import a file — a chart drawn up
            elsewhere, or a whole export back in (it asks before students &
            marks); Export a copy — the backup before the database move, or a
            handover. One Import, not an Import + a Restore (owner, same day:
            "is it possible to just have 1 button?"). */}
        {fileLocked ? null : <Menu id="file" label="⇪ File" title="Bring a file in, or export a copy">
          <button className="sm" id="importFileBtn" title="Bring flow charts in from a file — and, if it holds them, students & marks (it asks first)" onClick={core.importClick}>⇪ Import…</button>
          <button className="sm" id="exportBtn" title="Save a copy of the Tracker's data to a file — a backup, or a chart to hand over" onClick={core.openCopy}>⤓ Export…</button>
        </Menu>}

        {/* Find event moved to the far right of the choose/act group (owner,
            9 Sep 26). On a phone it is a 🔍 that opens a full-width strip. */}
        <HeaderSearch />

        {/* The spacer now falls between the search and the save corner, so Save
            changes sits alone at the far right. A real element rather than
            margin-left:auto: with a wrapping bar an auto margin applies per
            flex line, so the corner's alignment would depend on where the bar
            wrapped (the phone adds the auto margin deliberately, in CSS). */}
        <span className="hspacer" />

        {/* Save changes shows only when there is something to lose — marks,
            dates, students, event details and a moved ball write themselves to
            storage; structure edits (events, prerequisites, lines, fonts) do
            not. The slot keeps its width whether the button is there or
            not: a header that grows on the first edit shifts the whole chart down
            and slides everything out from under the pointer mid-drag. */}
        <span className="saveslot">
          {dirty ? <button className="sm dirty" id="saveChanges" title="Save your changes to the syllabus — events, prerequisites and lines" onClick={core.saveChangesClick}>✓ Save changes ●</button> : null}
          {/* Green here while the orange button is showing would tell the user
              their work is both safe and at risk at once (the status reports
              the last write; the button, the flow edits still waiting). Keep
              the words, drop the green until nothing is outstanding. Errors
              stay red. */}
          <span id="saveStat" className={'savestat ' + (dirty && core.saveStat.cls === 'ok' ? '' : core.saveStat.cls)}>{core.saveStat.text}</span>
        </span>
      </div>
    </header>
  );
}
