import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PenGlyph } from './Glyphs.jsx';
import * as core from '../app/core.js';
import { DateBox as AppDateBox } from '../../ui/DateBox';


export default function Pop() {
  const p = core.pop;
  const ref = useRef(null);
  const [posn, setPosn] = useState(null);

  useLayoutEffect(() => {
    if (!p || !ref.current) { setPosn(null); return; }
    const r = ref.current.getBoundingClientRect();
    /* Never past the screen's edges. On a phone turned sideways (844×390) the
       pop-up is taller than the screen: flipped above the ball it opened 73px
       above the top, its title, Not done and DCO out of reach and nothing to
       scroll ([HUMAN-RETEST] w3-F3). It is held on screen and, when taller
       than the screen, scrolls inside itself. */
    const maxH = Math.max(120, innerHeight - 16), h = Math.min(r.height, maxH);
    let x = p.x, y = p.y + 12;
    if (x + r.width > innerWidth - 8) x = innerWidth - r.width - 8;
    if (y + h > innerHeight - 8) y = p.y - h - 12;
    y = Math.max(8, Math.min(y, innerHeight - 8 - h));
    x = Math.max(8, x);
    setPosn({ x, y, maxH });
  }, [p]);
  /* OPENED FROM THE KEYBOARD, IT TAKES THE KEYBOARD (owner D980, 17 Oct 26): the keyboard lands on the grade the event
     has now (Not done when it has none), so a second Enter changes nothing; the pop-up's own Escape (core.handleEscapeKey)
     and every grade and Close hand the keyboard back to the same event on the chart (core.closePop). Opened by a mouse or
     a finger it takes nothing, as before. */
  /* after it is placed (posn): until then it is drawn hidden to be measured, and a hidden button takes no focus */
  const opened = p && p.id, byKey = core.popByKey, placed = !!posn;
  useEffect(() => {
    if (!opened || !byKey || !placed || !ref.current) return;
    const g = core.gradeOf(core.active, opened) || 0;
    const b = ref.current.querySelector(`.opts button[data-g="${g === 0 ? '0' : g}"]`) || ref.current.querySelector('.opts button');
    if (b) b.focus({ preventScroll: true });
  }, [opened, byKey, placed]);
  /* Tab and Shift+Tab go round inside it (the design guide §2 — a window keeps the keyboard), and ← → ↑ ↓ step along
     the row of grades */
  const onKeyDown = e => {
    const box = ref.current; if (!box) return;
    if (e.key === 'Tab') {
      const f = [...box.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(n => !n.disabled && n.tabIndex >= 0 && !n.closest('[hidden]'));
      if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      return;
    }
    if (/^Arrow(Left|Right|Up|Down)$/.test(e.key) && document.activeElement && document.activeElement.closest('.opts')) {
      const row = [...box.querySelectorAll('.opts button')], i = row.indexOf(document.activeElement); if (i < 0) return;
      e.preventDefault();
      const d = (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 1;
      row[(i + d + row.length) % row.length].focus();
    }
  };

  if (!p) return null;
  const s = core.active;
  const isFlight = core.byid[p.id] && core.byid[p.id].type === 'flight';
  const done = core.isDone(s, p.id);
  const fd = core.failDates(s, p.id);
  const style = posn
    ? { display: 'block', left: posn.x + 'px', top: posn.y + 'px', maxHeight: posn.maxH + 'px', overflowY: 'auto' }
    : { display: 'block', left: p.x + 'px', top: (p.y + 12) + 'px', visibility: 'hidden' };

  return (
    <div className="pop" id="pop" ref={ref} style={style} role="dialog" aria-label={p.id + ' · ' + core.nameOf(s)} onKeyDown={onKeyDown}>
      <div className="t" id="popTitle">{p.id}  ·  {core.nameOf(s)}</div>
      <div className="opts">
        <button data-g="0" onClick={() => core.popGrade('0')}><span className="dot" style={{ background: '#fff' }}></span>Not done</button>
        <button data-g="dco" onClick={() => core.popGrade('dco')}><span className="dot" style={{ background: '#000' }}></span>DCO</button>
        <button data-g="dpco" onClick={() => core.popGrade('dpco')}><span className="dot" style={{ background: 'var(--dpco)' }}></span>DPCO</button>
        <button data-g="marg" onClick={() => core.popGrade('marg')}><span className="dot" style={{ background: 'var(--marg)' }}></span>Marginal</button>
        <button data-g="na" onClick={() => core.popGrade('na')}><span className="dot" style={{ background: 'var(--na)' }}></span>N.A.</button>
        <button onClick={() => core.popGrade('cancel')}>Close</button>
      </div>
      {/* Done on: the day the grade carries. Today by default, so pressing DCO
          dates the event the day it was pressed; change it first and the
          grade lands on that day; change it after and the mark is re-dated
          at once — a day is PICKED on the app's calendar since 13 Oct 26 (D801;
          before that it was typed, and re-dated when the box was left —
          [TRK-RETEST-NOTES] C5). A day after today is refused, with one line
          saying why (D374). A flight's day is also its Last Flown, as before. */}
      <div id="popDoneRow" style={{ marginTop: 8, borderTop: '1px dashed var(--line)', paddingTop: 8 }}>
        <div className="mini" style={{ marginBottom: 4 }}>
          {done ? 'Done on' : 'Done on (when marked)'}{isFlight ? ' — sets Last Flown' : ''}
        </div>
        {/* the app's own date box since 13 Oct 26 (owner D801): a day is picked whole, and a pick is the commit */}
        {/* a refusal's line on an event already DONE goes at the next press on the box or in its calendar: the box
            shows the day the mark keeps, and that day picked again is no change, so nothing else would clear it (the
            read of 13 Oct 26 — F7). On an event not yet done the refused day is still in the box, and its line stays. */}
        <span style={{ display: 'block' }} onClickCapture={() => { if (done && core.popMsg && core.popMsg.where === 'done') core.popDoneChanged(core.popDoneDate, false); }}>
          {/* SINCE THE DESIGN LOOK OF 13 OCT 26 (owner D830). L14: a day after today is faint on this calendar and takes
              no tap (`max` — the squadron's today, the day D374's refusal measures against); the refusal's line
              stays, as the safety net. L15: until the event is DONE its date is only the day a grade would carry,
              so it is drawn dim (`is-notyet`, tracker.css) and turns white the moment a mark carries it. */}
          <AppDateBox id="popDoneDate" className={'trpopdate' + (done ? '' : ' is-notyet')} label="Done on" value={core.isWholeDay(core.popDoneDate) ? core.popDoneDate : ''}
            today={core.isoToday()} min="1900-01-01" max={core.isoToday()}
            onChange={v => { core.popDoneChanged(v, false); core.popDoneCommit(false); }} />
        </span>
        {core.popMsg && core.popMsg.where === 'done' ? <div className="datewarn" id="popDoneWarn" role="status">{core.popMsg.text}</div> : null}
      </div>
      {/* Failures: each + records one failure ON the day in the box (today
          unless changed), − takes the latest one back. The list under the
          counter is this student's failures on this event, each with its day;
          the days can be changed from the Failures title on the side panel. */}
      <div className="fails">
        <span className="mini">Fails:</span>
        <button className="sm" id="popFailMinus" title="One fewer failure" onClick={() => core.popFail(-1)}>−</button>
        <span id="failCount" style={{ minWidth: 14, textAlign: 'center' }}>{core.failOf(s, p.id)}</span>
        <button className="sm" id="popFailPlus" title="Record another failure on the day below" onClick={() => core.popFail(1)}>+</button>
      </div>
      <div className="mini" style={{ marginTop: 5, marginBottom: 3 }}>Failed on</div>
      {/* L14, L15 as Done on above. This date is only where the NEXT + lands: it is drawn dim until a failure of this
          event is ON that day — at Fails 0, and again when another day is picked for the next one. The box is not
          hidden at Fails 0: its day is set BEFORE + is pressed. */}
      <AppDateBox id="popFailDate" className={'trpopdate' + (fd.includes(core.popFailDate) ? '' : ' is-notyet')} label="Failed on" value={core.isWholeDay(core.popFailDate) ? core.popFailDate : ''}
        today={core.isoToday()} min="1900-01-01" max={core.isoToday()}
        onChange={v => { core.popFailDateChanged(v, false); core.popFailCommit(false); }} />
      {core.popMsg && core.popMsg.where === 'fail' ? <div className="datewarn" id="popFailWarn" role="status">{core.popMsg.text}</div> : null}
      {fd.length ? (
        <div className="fdates" id="popFailDates">
          {fd.map((d, i) => (
            <span key={i} className="fdate" data-date={d || ''}>
              <b>{core.failLabel(p.id, i)}</b> {d ? core.fmt(core.parseD(d)) : 'no date'}
            </span>
          ))}
        </div>
      ) : null}
      <div id="popInfo" style={{ marginTop: 8, borderTop: '1px dashed var(--line)', paddingTop: 8, fontSize: 12 }} dangerouslySetInnerHTML={{ __html: core.infoHtml(p.id) }} />
      <button className="sm" id="popEditInfo" style={{ marginTop: 6, width: '100%' }} onClick={() => { const id = p.id; core.closePop(true); core.openInfo(id); }}><PenGlyph /> Edit details</button>
    </div>
  );
}
