import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as core from '../app/core.js';

/* THE TRACKER'S LEGEND (owner D1007, D1018 — 18 Oct 26, approved "as recommended" on the pictures
   docs/img/handpass/2026-10-18-trk-flex-legend/07-legend-*, 07b-, 08-): a "Legend" button beside ☰ Show All in the
   Tracker's top bar opens a pop-out in the Leave War's Legend look — what each ball on the chart means, what currency
   a flight needs and when an IP is required, and when a flex happens. It took in the desktop's colour strip that sat
   under the bar (Centre = type / Ring segment per student), so a phone, which never showed that strip, has a legend
   too. THE WORDS ARE HIS AS DRAWN (scripts/handpass/mock-trk-flex-legend.mjs drew them): any change to them is put to
   him first. Read-only for everyone (D121) — it explains the chart, it changes nothing.
   The balls are the chart's own drawing (core.js legendBall → ballParts, the body every chart ball is drawn by), and
   the currency and flex rows are read off the bars' own rules (core.barBands over landingCurrency; core.flexBands —
   the flex settings' own bands, D1006, whose days an admin sets), so the legend cannot drift from what it explains. */

/* The centre — one sample ball per kind of event, its code as on the 2026 chart's own balls (as drawn). Exported so
   trk-palette.test.ts can pin each word to its kind. */
export const KINDS = [
  { type: 'flight', label: 'TR-1(P)', name: 'Flight' },
  { type: 'acad', label: 'ST-01', name: 'Acad / Spec' },
  { type: 'test', label: 'T-01', name: 'Test' },
  { type: 'sim', label: 'TR(S)-1', name: 'Sim' },
  { type: 'device', label: 'CFT-01', name: 'CFT / IAT / EPT' },
];
/* The ring — one sample per grade; `grade` null is a slice nobody has graded (white). */
export const GRADES = [
  { grade: 'dco', name: 'DCO' },
  { grade: 'dpco', name: 'DPCO' },
  { grade: 'marg', name: 'Marginal' },
  { grade: 'na', name: 'N.A.' },
  { grade: null, name: 'Not done' },
];
/* The marks that sit on a ball, each on an acad ball as drawn. */
const MARKS = [
  { opts: { fails: 1 }, name: 'A failure — one red tick each' },
  { opts: { mine: true }, name: 'Blue edge — the student picked in Crew' },
  { opts: { available: true }, name: 'Gold ring — can be flown next' },
  { opts: { found: true }, name: 'Turquoise ring — found by Find event' },
];
const SAMPLE = 'ST-01';
/* The Leave War's Legend is 312px wide (leavewar/ui/chrome.css .leglist); on a screen narrower than that plus its two
   6px margins it takes the screen less the margins (tracker.css .tleglist carries the same min()). */
const WIDTH = 312, PAD = 6;
const range = b => (b.to == null ? b.from + ' +' : b.from + '–' + b.to);

function Ball({ opts }) {
  /* the SVG string is built by core.js from fixed sample values and the app's own colours — nothing typed reaches it */
  return <span className="tleg-ball" dangerouslySetInnerHTML={{ __html: core.legendBall(opts) }} />;
}
function Band({ b }) {
  return (
    <div className="tleg-row">
      <span className="tleg-sw" style={{ background: b.color, color: b.ink }}>{range(b)}</span>
      <span className="tleg-t">{b.txt}</span>
    </div>
  );
}

/* The flex part, a block of its own: the flex switch (D1006) takes it off as one piece (D1007). */
function FlexPart() {
  return (
    <div data-testid="trk-legend-flex">
      <div className="tleg-sec">Flex — days since the last syllabus flight</div>
      {core.flexBands().map(b => <Band key={b.from} b={b} />)}
    </div>
  );
}

export default function Legend() {
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState(null);
  const btn = useRef(null), body = useRef(null);
  /* Fixed and placed by hand under its button, for the reason the bar's menus are (Header.jsx Menu): on a phone the
     bar is an overflow container, which would clip a pop-out drawn inside it. */
  useLayoutEffect(() => {
    if (!open || !btn.current) { setAt(null); return; }
    const place = () => {
      const r = btn.current.getBoundingClientRect(), w = Math.min(WIDTH, innerWidth - 2 * PAD);
      setAt({ left: Math.round(Math.max(PAD, Math.min(r.left, innerWidth - w - PAD))), top: Math.round(r.bottom + 5) });
    };
    place();
    addEventListener('resize', place);
    addEventListener('scroll', place, true);
    return () => { removeEventListener('resize', place); removeEventListener('scroll', place, true); };
  }, [open]);
  /* The keyboard goes into the pop-out when it opens (its scrolling list is the one stop, so the arrow keys scroll
     it) and back to the button when it closes, however it closed (design guide §2 — a window, D812). */
  const close = () => {
    setOpen(false);
    if (btn.current) btn.current.focus({ preventScroll: true });
  };
  useEffect(() => { if (open && body.current) body.current.focus({ preventScroll: true }); }, [open]);
  /* Escape closes it — and only it: caught on the way down and stopped, so the Tracker's own Escape (the marking
     pop-up, the search, Edit chart layout) never fires behind a legend it cannot see. The page is kept mounted while
     another tab is up (Shell.tsx), so a legend left open there must not take Escape from that page (the Leave War's
     Legend has the same guard). */
  useEffect(() => {
    if (!open) return;
    const esc = e => {
      if (e.key !== 'Escape') return;
      const pg = document.getElementById('page-tracker');
      if (pg && !pg.classList.contains('on')) return;
      e.stopPropagation(); e.preventDefault();
      close();
    };
    document.addEventListener('keydown', esc, true);
    return () => document.removeEventListener('keydown', esc, true);
  }, [open]);
  /* Tab stays inside (§2): the list is the pop-out's only stop. */
  const trap = e => { if (e.key === 'Tab') { e.preventDefault(); if (body.current) body.current.focus({ preventScroll: true }); } };
  return (
    <>
      <button className={'sm' + (open ? ' primary' : '')} id="legendBtn" ref={btn} data-testid="trk-legend-open"
        title="What the balls, bars and flex mean" aria-haspopup="dialog" aria-expanded={open} aria-controls="trkLegend"
        onClick={() => (open ? close() : setOpen(true))}>Legend</button>
      {open ? (
        <>
          {/* A tap outside closes it and does nothing else — the scrim takes it, so a tap meant to close the legend
              never marks a ball under it (the Leave War Legend's scrim). It lies over the button too: a second
              press of the button lands here and closes it. */}
          <div className="tlegscrim" data-testid="trk-legend-scrim" onClick={close} />
          <div className="tleglist" id="trkLegend" data-testid="trk-legend" role="dialog" aria-label="What the chart is telling you"
            style={at ? { left: at.left + 'px', top: at.top + 'px' } : undefined} onKeyDown={trap}>
            <div className="tleg-hd">What the chart is telling you</div>
            <div className="tleg-body" ref={body} tabIndex={0}>
              <div className="tleg-sec">The centre — the kind of event</div>
              <div className="tleg-grid">
                {KINDS.map(k => <div className="tleg-tile" key={k.type} data-kind={k.type}><Ball opts={{ type: k.type, label: k.label }} /><span className="tleg-t">{k.name}</span></div>)}
              </div>
              <div className="tleg-sec">The ring — one slice per student</div>
              <div className="tleg-grid">
                {GRADES.map(g => <div className="tleg-tile" key={g.name} data-grade={g.grade || 'none'}><Ball opts={{ label: SAMPLE, fill: g.grade ? core.GRADE_FILL[g.grade] : '#ffffff' }} /><span className="tleg-t">{g.name}</span></div>)}
              </div>
              {MARKS.map(m => <div className="tleg-row tleg-ballrow" key={m.name}><Ball opts={{ label: SAMPLE, px: 34, ...m.opts }} /><span className="tleg-t">{m.name}</span></div>)}
              <div className="tleg-sec">Currency — days since the last flight</div>
              {core.barBands(core.landingCurrency).map(b => <Band key={b.from} b={b} />)}
              <div className="tleg-note">Any syllabus flight counts, or a non-syllabus flight put in Last Flown (Currency).</div>
              {core.flexOn() ? <FlexPart /> : null}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
