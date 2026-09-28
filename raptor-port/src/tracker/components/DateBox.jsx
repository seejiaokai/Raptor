import React, { useEffect, useRef, useState } from 'react';
import * as core from '../app/core.js';
import { isComposing } from './keys.js';

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
   Key it by student AND field, so a Crew switch never carries a draft across. */
export function DateBox({ value, onCommit, id, title, style }) {
  const saved = value || '';
  const [draft, setDraft] = useState(null);
  const [warn, setWarn] = useState('');
  /* the latest of each, for the commit that runs as the box goes away */
  const live = useRef({});
  live.current = { draft, saved, onCommit };
  const gone = useRef(false);
  const commit = async (el) => {
    const { draft: v, saved: was, onCommit: hand } = live.current;
    if (v == null) return;
    live.current.draft = null;
    if (!gone.current) setDraft(null);
    if (v === was) return;
    if (v === '') {
      if (gone.current || (el && el.validity && el.validity.badInput)) return;
    } else if (!core.isWholeDay(v)) return;
    const said = await hand(v);
    if (!gone.current) setWarn(typeof said === 'string' ? said : '');
  };
  useEffect(() => () => { gone.current = true; commit(null); }, []);
  return (
    <span className="datebox">
      <input type="date" id={id} title={title} style={style} value={draft ?? saved}
        onChange={e => { setWarn(''); setDraft(e.target.value); }}
        onBlur={e => { commit(e.target); }}
        onKeyDown={e => { if (e.key === 'Enter' && !isComposing(e)) commit(e.currentTarget); }} />
      {warn ? <span className="datewarn" role="status">{warn}</span> : null}
    </span>
  );
}
