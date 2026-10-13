import React, { useLayoutEffect, useRef, useState } from 'react';
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

  if (!p) return null;
  const s = core.active;
  const isFlight = core.byid[p.id] && core.byid[p.id].type === 'flight';
  const done = core.isDone(s, p.id);
  const fd = core.failDates(s, p.id);
  const style = posn
    ? { display: 'block', left: posn.x + 'px', top: posn.y + 'px', maxHeight: posn.maxH + 'px', overflowY: 'auto' }
    : { display: 'block', left: p.x + 'px', top: (p.y + 12) + 'px', visibility: 'hidden' };

  return (
    <div className="pop" id="pop" ref={ref} style={style}>
      <div className="t" id="popTitle">{p.id}  ·  {core.nameOf(s)}</div>
      <div className="opts">
        <button onClick={() => core.popGrade('0')}><span className="dot" style={{ background: '#fff' }}></span>Not done</button>
        <button onClick={() => core.popGrade('dco')}><span className="dot" style={{ background: '#000' }}></span>DCO</button>
        <button onClick={() => core.popGrade('dpco')}><span className="dot" style={{ background: 'var(--dpco)' }}></span>DPCO</button>
        <button onClick={() => core.popGrade('marg')}><span className="dot" style={{ background: 'var(--marg)' }}></span>Marginal</button>
        <button onClick={() => core.popGrade('na')}><span className="dot" style={{ background: 'var(--na)' }}></span>N.A.</button>
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
          <AppDateBox id="popDoneDate" className="trpopdate" label="Done on" value={core.isWholeDay(core.popDoneDate) ? core.popDoneDate : ''}
            today={core.isoToday()} min="1900-01-01"
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
      <AppDateBox id="popFailDate" className="trpopdate" label="Failed on" value={core.isWholeDay(core.popFailDate) ? core.popFailDate : ''}
        today={core.isoToday()} min="1900-01-01"
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
      <button className="sm" id="popEditInfo" style={{ marginTop: 6, width: '100%' }} onClick={() => { const id = p.id; core.closePop(); core.openInfo(id); }}>✎ Edit details</button>
    </div>
  );
}
