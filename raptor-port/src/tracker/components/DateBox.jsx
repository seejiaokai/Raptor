import React, { useEffect, useRef, useState } from 'react';
import * as core from '../app/core.js';
import { DateBox as AppDateBox } from '../../ui/DateBox';

/* A DATE BOX THAT SAVES WHEN YOU LEAVE IT ([TRK-RETEST-NOTES] C5, 28 Sep 26).
   The side panel's date boxes saved on every keystroke, and a browser's date box
   passes through wrong days while one is typed: half-typed years (0002, 0020,
   0202 — one ↶ left an Upchit reading 02/11/0202, the walk's W2 N4) and, while the
   DAY is typed, whole but wrong days (the 1st on the way to the 17th — the plan's
   red team, Fable F1). So this box shows what is typed and saves only when it is
   LEFT (blur), on Enter, or when it goes away: a real day that differs from the
   saved one is handed to `onCommit`; a box emptied on purpose hands over '' (a
   half-typed box reads empty too, but the browser flags it — `validity.badInput`
   — and it is put back instead); anything else is put back to the saved day, the
   robustness doctrine's "a refused value is put back, never left looking saved".
   One commit is one undo step; the same day retyped commits nothing.
   `onCommit` may answer with words — the reason a day was refused (a day after
   today, D374) — and they show on one line under the box until the next change.
   Key it by student AND field, so a Crew switch never carries a draft across.

   SINCE 13 OCT 26 THE BOX ITSELF IS THE APP'S OWN (owner D801 — "All as recommended": the app's one date calendar, a
   tap picks, no tick; D798 before it). The phone's date box is gone, and with it the typing the paragraph above is
   about: a day is PICKED, whole, so there is no half-typed day to wait out — a pick is the commit, one undo step, and
   the same day picked again commits nothing. What this file still owns is unchanged: `onCommit` may answer with the
   reason a day was refused (D374) and it shows on one line under the box; a day's box can still be EMPTIED — the app's
   calendar has no Clear (D796), so a small "take this date off" button stands beside a box that holds a date and hands
   over '' exactly as an emptied box did. The wrapper's class is `trdatebox`: `datebox` is the app's own box's name on
   the one global stylesheet, and the two looks met once (ui/scheduler/26-date-calendar.css). */
/** @param {{ value?: string, onCommit: (v: string) => any, id?: string, title?: string, style?: object }} props */
export function DateBox({ value, onCommit, id, title, style }) {
  const saved = value || '';
  const [warn, setWarn] = useState('');
  const gone = useRef(false);
  useEffect(() => () => { gone.current = true; }, []);
  /* the line belongs to the day it refused: when the saved day changes under the box (a
     re-sort of the failures list moved another failure into this row), it goes (walker b F-b4) */
  useEffect(() => { setWarn(''); }, [saved]);
  const hand = async v => {
    if (v === saved) return;
    if (v !== '' && !core.isWholeDay(v)) return;
    setWarn('');
    const said = await onCommit(v);
    if (!gone.current) setWarn(typeof said === 'string' ? said : '');
  };
  return (
    <span className="trdatebox" style={style}>
      <span className="trdatebox-row">
        <AppDateBox id={id} label={title || 'Date'} value={saved} onChange={hand} />
        {saved ? <button type="button" className="sm trdate-x" title="Take this date off" aria-label="Take this date off" onClick={() => hand('')}>&#10005;</button> : null}
      </span>
      {warn ? <span className="datewarn" role="status">{warn}</span> : null}
    </span>
  );
}
