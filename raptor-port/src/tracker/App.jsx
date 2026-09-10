import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import * as core from './app/core.js';
import Header from './components/Header.jsx';
import Legend from './components/Legend.jsx';
import ArrangeTools from './components/ArrangeTools.jsx';
import SidePanel from './components/SidePanel.jsx';
import Pop from './components/Pop.jsx';
import ShowAllPanel from './components/ShowAllPanel.jsx';
import { EditModal, InfoModal, SylModal, OrdModal, CopyModal, DlgModal } from './components/Modals.jsx';
import { SideZoomCtl, FlowZoomCtl } from './components/ZoomControls.jsx';

/* The Tracker's own page section — the element the standalone app called
   #root. Inside Raptor it is `#page-tracker`, which the Shell mounts this
   component into; the resizable side width lives on it now instead of
   <html> (the `--sideW` variable on <html> would have been shadowed by the
   scoped stylesheet), and the layout column + the phone tab classes live on
   `.tr-root` below, so nothing this tab does can reach the other tabs. */
export const PAGE_ID = 'page-tracker';
const pageEl = () => document.getElementById(PAGE_ID);

function Board() {
  /* The flow chart is rendered imperatively into this container by the core
     engine (renderBoard), exactly as in the original app. */
  return <div className="board" id="board" tabIndex={0} />;
}

function Resizer() {
  const ref = useRef(null);
  useEffect(() => {
    const rz = ref.current; if (!rz) return;
    let dr = null;
    /* Read and written on the page section, not <html>: the stylesheet's
       `--sideW:350px` default now sits on #page-tracker (it was :root), and a
       value set any higher up the tree would lose to it. */
    const down = e => { const el = pageEl(); dr = { x: e.clientX, w: parseInt(el && getComputedStyle(el).getPropertyValue('--sideW')) || 350 }; try { rz.setPointerCapture(e.pointerId); } catch (_) {} };
    const move = e => { if (!dr) return; let w = dr.w - (e.clientX - dr.x); w = Math.max(240, Math.min(680, w)); const el = pageEl(); if (el) el.style.setProperty('--sideW', w + 'px'); };
    const end = () => { dr = null; };
    rz.addEventListener('pointerdown', down);
    rz.addEventListener('pointermove', move);
    rz.addEventListener('pointerup', end); rz.addEventListener('pointercancel', end);
    return () => { rz.removeEventListener('pointerdown', down); rz.removeEventListener('pointermove', move); rz.removeEventListener('pointerup', end); rz.removeEventListener('pointercancel', end); };
  }, []);
  return <div className="resizer" id="resizer" ref={ref} />;
}

function ViewTabs({ tab, setTab }) {
  return (
    <div className="viewtabs" id="viewtabs">
      <button data-view="flow" className={tab === 'flow' ? 'active' : ''} onClick={() => setTab('flow')}>🗺 Flow chart</button>
      <button data-view="info" className={tab === 'info' ? 'active' : ''} onClick={() => setTab('info')}>ⓘ Info</button>
      <button id="showAllTab" onClick={core.openShowAll}>☰ Show All</button>
    </div>
  );
}

/* `active` is whether the Tracker tab is the one on screen. The section stays
   mounted once visited (Shell.tsx — the flow board is drawn imperatively once
   by core.init and would come back empty on a remount), so the document-level
   listeners below must switch OFF while another tab is up: Escape on the Edit
   Schedule must not close a Tracker pop-up, and Delete in a Raptor text box
   must never reach the chart editor. */
export default function App({ active = true }) {
  useSyncExternalStore(core.subscribe, core.getVersion);
  const [tab, setTab] = useState('flow');
  const [sideZoom, setSideZoom] = useState(1);

  /* First mount boots the engine; a LATER mount redraws. core.init() runs
     once per page load and is guarded against a second run — but the Shell
     that holds this tab is unmounted by a LOGOUT (ui/App.tsx renders the
     login screen in its place), so the next login mounts the Tracker again
     with a fresh, empty #board and nothing would draw into it (found by the
     7 Sep 26 bug sweep: log out from the Tracker, log back in, open it —
     no chart). The engine's state is intact in that case; only the DOM is
     new, so ask it to render again. */
  useEffect(() => { if (core.ready) { core.renderBoard(); core.notify(); } else core.init(); }, []);

  /* Which tab is showing is React state, but the search has to reach it: on the
     Info tab the board is display:none, so scrolling to a found event would be
     measuring a hidden element and would land nowhere. */
  useEffect(() => { core.setTabSink(setTab); return () => core.setTabSink(null); }, []);

  useEffect(() => {
    if (!active) return;
    const esc = e => core.handleEscapeKey(e);
    const del = e => core.handleDeleteKey(e);
    /* Ctrl/⌘+Z, Ctrl+Y, Ctrl/⌘+Shift+Z — the bar's ↶ ↷ from the keyboard
       (9 Sep 26). Bound only while the tab is up, like Escape and Delete, so a
       shortcut on a Raptor page never undoes a Tracker mark. */
    const undo = e => core.handleUndoKey(e);
    const clickAway = e => { if (core.pop && !e.target.closest('#pop') && !e.target.closest('.ball')) core.closePop(); };
    const unload = e => { if (core.sylDirty) { e.preventDefault(); e.returnValue = ''; } };
    document.addEventListener('keydown', esc);
    document.addEventListener('keydown', del);
    document.addEventListener('keydown', undo);
    document.addEventListener('click', clickAway);
    window.addEventListener('beforeunload', unload);
    return () => {
      document.removeEventListener('keydown', esc);
      document.removeEventListener('keydown', del);
      document.removeEventListener('keydown', undo);
      document.removeEventListener('click', clickAway);
      window.removeEventListener('beforeunload', unload);
    };
  }, [active]);

  /* The phone's Flow / Info switch (was a class on <body>) rides the .tr-root
     div's className — never the page section above it. The section's className
     belongs to Raptor's Shell, which rewrites it whenever its value changes —
     "page on" ↔ "page doze" on every tab switch away and back — wiping anything
     toggled onto it by hand: on the owner's iPhone that showed the chart AND
     the side panel stacked (7 Sep 26). React owns this div, so the class
     survives. */
  return (
    <div className={'tr-root tab-' + tab}>
      {/* The bar hides on demand to hand the chart the whole column (owner
          phone ask, 9 Sep 26). When it is hidden the Header is not rendered at
          all — a display:none header would still cost nothing but keep its
          menus/search mounted, and there is no reason to — and a slim strip
          stands in as the one way back: it names the crew you are on so hiding
          the bar never loses track of who you are viewing, and the whole strip
          is the button that brings the bar back. Works on a desktop too, where
          the Flow/Info tabs are not drawn and this is the only handle. */}
      {core.barHidden
        ? <button className="barpeek" id="barShowBtn" title="Show the bar" onClick={core.toggleBar}>
            <span className="barpeek-chev" aria-hidden="true">⌄</span>
            <span className="barpeek-who">{core.nameOf(core.active)}</span>
            <span className="barpeek-lbl">Show bar</span>
          </button>
        : <Header />}
      <ArrangeTools />
      {/* Zero-height wrapper: the hint FLOATS over the legend/board instead of
          occupying flow space. Its height changes with every tool switch and
          1.8s flash message; in flow that shoved the chart up and down under
          the pointer mid-draw, so lines connected to the wrong place. */}
      {/* Details mode silently rebinds every ball's click away from grading, so
          without this the chart just stops responding to marking with no cause
          on screen — and on a phone the button that did it is off the edge of
          the header. Arrange wins when both are on: its own click tools take
          the ball first. */}
      {/* The wrapper is exactly one line tall while editing — never the hint's
          own height, which changes with the text. So the board still does not
          move when the tool changes, but the line the hint occupies is real
          space: with the wrapper at 0px it lay over the colour legend on a
          desktop and over the Flow chart / Info / Show All tabs on a phone,
          hiding all three for as long as edit mode was on. A hint long enough
          to wrap spills below that line, over the legend, for as long as that
          tool is selected — the rare case, not the resting state. */}
      <div className={'arrhintwrap' + (core.arrangeMode ? ' on' : '')}>
        <div className={'arrhint' + (core.arrangeMode ? ' on' : '')} id="arrhint">{core.hintFlash || core.hintBase}</div>
      </div>
      {/* In normal flow, not floating: its text never changes while it is up,
          so there is nothing for the chart to jump about, and on a phone it
          covered the view tabs. */}
      {!core.arrangeMode && core.showDetails
        ? <div className="arrhint on inflow" id="detailsHint">
            Details mode — click an event for its brief. <b>Marking is off.</b>
            <button className="hintoff" id="detailsHintOff" onClick={core.toggleDetails}>Turn off</button>
          </div>
        : null}
      <Legend />
      <ViewTabs tab={tab} setTab={setTab} />
      {/* Each zoom control is docked at the foot of its own column rather than
          floating over it. Floating, the panel control landed on the Plannable
          now card at the default 1440x900 and clipped the first chip to
          "ACG-0"; end padding only let you scroll a card out from under it,
          because a fixed control always covers whatever is beneath it. Docked,
          it occupies real space and can never cover anything. The columns are
          the grid children now, so the phone's show/hide rules target them. */}
      <div className="layout" id="layout">
        <div className="boardcol">
          <Board />
          <FlowZoomCtl />
        </div>
        <Resizer />
        <div className="sidecol">
          <SidePanel zoom={sideZoom} />
          <SideZoomCtl zoom={sideZoom} setZoom={setSideZoom} />
        </div>
      </div>
      <Pop />
      <ShowAllPanel />
      <InfoModal />
      <OrdModal />
      <CopyModal />
      <EditModal />
      <SylModal />
      <DlgModal />
    </div>
  );
}
