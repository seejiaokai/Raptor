import React, { useLayoutEffect, useRef, useState } from 'react';
import * as core from '../app/core.js';

export default function Pop() {
  const p = core.pop;
  const ref = useRef(null);
  const [posn, setPosn] = useState(null);

  useLayoutEffect(() => {
    if (!p || !ref.current) { setPosn(null); return; }
    const r = ref.current.getBoundingClientRect();
    let x = p.x, y = p.y + 12;
    if (x + r.width > innerWidth - 8) x = innerWidth - r.width - 8;
    if (y + r.height > innerHeight - 8) y = p.y - r.height - 12;
    setPosn({ x, y });
  }, [p]);

  if (!p) return null;
  const s = core.active;
  const isFlight = core.byid[p.id] && core.byid[p.id].type === 'flight';
  const done = core.isDone(s, p.id);
  const fd = core.failDates(s, p.id);
  const style = posn
    ? { display: 'block', left: posn.x + 'px', top: posn.y + 'px' }
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
          grade lands on that day; change it after and the mark is re-dated on
          the spot. A flight's day is also its Last Flown, as before. */}
      <div id="popDoneRow" style={{ marginTop: 8, borderTop: '1px dashed #262c38', paddingTop: 8 }}>
        <div className="mini" style={{ marginBottom: 4 }}>
          {done ? 'Done on' : 'Done on (when marked)'}{isFlight ? ' — sets Last Flown' : ''}
        </div>
        <input type="date" id="popDoneDate" style={{ width: '100%' }} value={core.popDoneDate} onChange={e => core.popDoneChanged(e.target.value)} />
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
      <input type="date" id="popFailDate" style={{ width: '100%' }} value={core.popFailDate} onChange={e => core.popFailDateChanged(e.target.value)} />
      {fd.length ? (
        <div className="fdates" id="popFailDates">
          {fd.map((d, i) => (
            <span key={i} className="fdate" data-date={d || ''}>
              <b>{core.failLabel(p.id, i)}</b> {d ? core.fmt(core.parseD(d)) : 'no date'}
            </span>
          ))}
        </div>
      ) : null}
      <div id="popInfo" style={{ marginTop: 8, borderTop: '1px dashed #262c38', paddingTop: 8, fontSize: 12 }} dangerouslySetInnerHTML={{ __html: core.infoHtml(p.id) }} />
      <button className="sm" id="popEditInfo" style={{ marginTop: 6, width: '100%' }} onClick={() => { const id = p.id; core.closePop(); core.openInfo(id); }}>✎ Edit details</button>
    </div>
  );
}
