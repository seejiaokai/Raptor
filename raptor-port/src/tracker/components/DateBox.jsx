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
   the same day picked again commits nothing (the app's box hands over a date only when it differs from the one held). What this file still owns is unchanged: `onCommit` may answer with the
   reason a day was refused (D374) and it shows on one line under the box; a day's box can still be EMPTIED — the app's
   calendar has no Clear (D796), so a box that holds a date carries a small "take this date off" button in its right end,
   where its arrow was (inside, not beside: beside it the narrow boxes cut their date short), which hands over ''
   exactly as an emptied box did. The wrapper's class is `trdatebox`: `datebox` is the app's own box's name on
   the one global stylesheet, and the two looks met once (ui/scheduler/26-date-calendar.css). */
/* AFTER THE READ OF THE FINISHED CODE (a fresh, blind Opus reader, 13 Oct 26):
   - "take this date off" SETTLES: for a moment after it is pressed, a press on this box's row reaches nothing. In the
     failures list the rows are in the order of their days, so the failure that loses its day drops to the foot and the
     next one slides up under the finger — the second half of a double press took ITS day off too; on any other box it
     fell on the box and opened the calendar (F2). 400ms, the app box's own settle.
   - the keyboard goes back onto the box when the button that was pressed is taken away (F6).
   - a refusal's line goes at the next press on the box or in its calendar: the same day picked again is no change,
     so nothing else would ever clear it (F7).
   - `title` is what the date IS, said to a screen reader before the date and in the button's own name (F6).
   - `clearable` (default yes): the two Last Flown boxes offer the button only for a day put in BY HAND — a day that
     comes from the flights marked done cannot be taken off (D123; F3).
   - the calendar's "today" is the squadron's (D374), and no day before 1900 is offered — the store refuses one (F5, F9). */
const OFF_SETTLE_MS = 400;
/** `narrow`: a box with no room for the weekday (End date A and B, three across in their card) shows the date without it.
    @param {{ value?: string, onCommit: (v: string) => any, id?: string, title?: string, style?: object, narrow?: boolean, clearable?: boolean }} props */
export function DateBox({ value, onCommit, id, title, style, narrow, clearable = true }) {
  const saved = value || '';
  const [warn, setWarn] = useState('');
  const gone = useRef(false);
  const offAt = useRef(0);
  const row = useRef(null);
  useEffect(() => { gone.current = false; return () => { gone.current = true; }; }, []);
  /* the line belongs to the day it refused: when the saved day changes under the box (a
     re-sort of the failures list moved another failure into this row), it goes (walker b F-b4) */
  useEffect(() => { setWarn(''); }, [saved]);
  const hand = async v => {
    if (v !== '' && !core.isWholeDay(v)) return;
    setWarn('');
    const said = await onCommit(v);
    if (!gone.current) setWarn(typeof said === 'string' ? said : '');
  };
  const off = () => {
    offAt.current = Date.now();
    hand('');
    const b = row.current && row.current.querySelector('button.datebox');
    if (b) b.focus({ preventScroll: true });
  };
  const press = e => {
    if (Date.now() - offAt.current < OFF_SETTLE_MS) { e.stopPropagation(); e.preventDefault(); return; }
    if (warn) setWarn('');
  };
  const has = !!saved && clearable;
  const today = core.isoToday();
  return (
    <span className="trdatebox" style={style}>
      <span className={'trdatebox-row' + (has ? ' has-x' : '')} ref={row} onClickCapture={press}>
        <AppDateBox id={id} label={title || 'Date'} value={saved} onChange={hand} noWeekday={!!narrow} today={today} min="1900-01-01" />
        {has ? <button type="button" className="sm trdate-x" title={title ? 'Take the date off — ' + title : 'Take this date off'} aria-label={title ? 'Take the date off — ' + title : 'Take this date off'} onClick={off}>&#10005;</button> : null}
      </span>
      {warn ? <span className="datewarn" role="status">{warn}</span> : null}
    </span>
  );
}
