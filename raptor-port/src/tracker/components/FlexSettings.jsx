import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as core from '../app/core.js';

/* THE TRACKER'S FLEX SETTINGS (owner D1006, D1014, D1018 — 18 Oct 26, approved "as recommended" on the pictures
   docs/img/handpass/2026-10-18-trk-flex-legend/02-topbar-proposed-*, 03-flex-settings-admin-*, 04-flex-settings-member-*).
   A settings icon, the app's cog ⚙, in the Tracker's bar after Find event (as drawn), opens a window: the one switch
   "Track flex" with its line, then the bands — six typed "From" days, each "To" following from the next row, each
   band's words and colour fixed and drawn as the Info panel's own flex bar. THE WORDS ARE HIS AS DRAWN
   (scripts/handpass/mock-trk-flex-legend.mjs drew them): any change to them is put to him first.
   - Only an admin changes them (D1014 — the Tracker's one admin gate): Cancel / Save. A member opens the same window
     read-only (D1018): the figures as plain numbers, the switch as it stands, no Save.
   - Nothing is saved until Save (the Inputs calendar's settings window, which this one copies): what is typed is a
     draft; Cancel, ✕, Escape and a tap outside throw it away. Save checks the six days first and writes nothing on a
     bad figure, saying why on the line above the buttons.
   - It is not a dragged window: it opens under its button, as the Legend does, so a tap outside can close it (design
     guide §2) — the picture's six-dot grip, which says "drag me", is left out for that reason.
   - The keyboard goes in when it opens, Tab stays inside, and it comes back to the ⚙ however it closed. */

/* The window's width (the picture's, about 400px), less the screen's 6px margins on a phone (as the Legend) */
const WIDTH = 400, PAD = 6;
const digits = v => (/^\d+$/.test(String(v).trim()) ? Number(String(v).trim()) : NaN);

function Body({ btn, close }) {
  const admin = core.mayChangeFlex();
  const saved = core.flexSetting();
  const [on, setOn] = useState(saved.on);
  const [from, setFrom] = useState(() => saved.from.map(String));
  const [err, setErr] = useState('');
  const [at, setAt] = useState(null);
  const box = useRef(null);
  /* each band's words and colour are fixed (D1018): read off the bar's own rule, at the defaults' days */
  const bands = core.flexBands(core.FLEX_DEFAULT_FROM);
  /* Fixed and placed by hand under its button, its right edge on the button's where the screen allows — the bar on a
     phone is an overflow container, which would clip a window drawn inside it (the Legend's reason). */
  useLayoutEffect(() => {
    const place = () => {
      if (!btn.current) return;
      const r = btn.current.getBoundingClientRect(), w = Math.min(WIDTH, innerWidth - 2 * PAD);
      setAt({ left: Math.round(Math.max(PAD, Math.min(r.right - w, innerWidth - w - PAD))), top: Math.round(r.bottom + 5) });
    };
    place();
    addEventListener('resize', place);
    addEventListener('scroll', place, true);
    return () => { removeEventListener('resize', place); removeEventListener('scroll', place, true); };
  }, []);
  /* the keyboard goes in: to the switch for an admin, to the window itself for a member (nothing in it to press but ✕) */
  useEffect(() => {
    const n = box.current; if (!n) return;
    const first = n.querySelector(admin ? 'input' : '.tflex-body');
    if (first) first.focus({ preventScroll: true });
  }, []);
  /* Escape closes it — and only it: caught on the way down and stopped, so the Tracker's own Escape (the marking
     pop-up, the search) never fires behind it. Not while another tab is up: the page is kept mounted (the Legend's
     guard). */
  useEffect(() => {
    const esc = e => {
      if (e.key !== 'Escape') return;
      const pg = document.getElementById('page-tracker');
      if (pg && !pg.classList.contains('on')) return;
      e.stopPropagation(); e.preventDefault();
      close();
    };
    document.addEventListener('keydown', esc, true);
    return () => document.removeEventListener('keydown', esc, true);
  }, []);
  /* Tab stays inside (design guide §2): round from the last stop to the first, and back */
  const trap = e => {
    if (e.key !== 'Tab' || !box.current) return;
    const stops = [...box.current.querySelectorAll('button, input, [tabindex="0"]')].filter(x => !x.disabled);
    if (!stops.length) return;
    const i = stops.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); stops[stops.length - 1].focus(); }
    else if (!e.shiftKey && i === stops.length - 1) { e.preventDefault(); stops[0].focus(); }
  };
  const save = async () => {
    const nums = from.map(digits);
    const bad = core.flexProblem(nums);
    if (bad) { setErr(bad); return; }
    const r = await core.setFlexSetting({ on, from: nums });
    if (!r.ok) { setErr(r.message); return; }
    close();
  };
  const toOf = i => {
    if (i === bands.length - 1) return 'and over';
    const n = i < from.length ? digits(from[i]) : NaN;   /* band i+1 starts at From[i] */
    return Number.isInteger(n) ? String(n - 1) : '—';
  };
  return (
    <>
      {/* A tap outside closes it and does nothing else — the scrim takes it (the Legend's scrim), the ⚙ included */}
      <div className="tflexscrim" data-testid="trk-flex-scrim" onClick={close} />
      <div className="tflexwin" id="trkFlexWin" data-testid="trk-flex" role="dialog" aria-modal="true" aria-label="Flex settings"
        ref={box} style={at ? { left: at.left + 'px', top: at.top + 'px' } : undefined} onKeyDown={trap}>
        <div className="tflex-hd">
          <span className="tflex-ttl">Flex settings<small>{admin ? 'admins only' : 'only an admin can change these'}</small></span>
          <button type="button" className="tflex-x" data-testid="trk-flex-x" title="Close" aria-label="Close Flex settings" onClick={close}>✕</button>
        </div>
        <form className="tflex-body" tabIndex={admin ? undefined : 0} onSubmit={e => { e.preventDefault(); save(); }}>
          {admin
            ? <label className="tflex-sw"><input type="checkbox" role="switch" data-testid="trk-flex-on" checked={on} aria-label="Track flex"
                onChange={e => { setOn(e.target.checked); setErr(''); }} /><span>Track flex</span></label>
            : <span className="tflex-sw"><span className={'tflex-swread' + (on ? ' on' : '')} data-testid="trk-flex-on" role="switch" aria-checked={on} aria-disabled="true" aria-label="Track flex" /><span>Track flex</span></span>}
          <p className="tflex-hint">Off: the flex bar and the Legend's flex part go, for everyone.</p>
          <div className="tflex-sec">Days since the last syllabus flight</div>
          <div className="tflex-bands">
            <span className="tflex-mh c">From</span><span className="tflex-mh c">To</span><span className="tflex-mh">Flex</span>
            {bands.map((b, i) => (
              <React.Fragment key={i}>
                {i === 0 || !admin
                  ? <span className="tflex-val" data-testid={'trk-flex-from-' + i}>{i === 0 ? '0' : from[i - 1]}</span>
                  : <input className="tflex-num" type="text" inputMode="numeric" data-testid={'trk-flex-from-' + i} aria-label={b.txt + ' from day'}
                      value={from[i - 1]} onChange={e => { const v = e.target.value; setFrom(f => f.map((x, j) => (j === i - 1 ? v : x))); setErr(''); }} />}
                <span className="tflex-to" data-testid={'trk-flex-to-' + i}>{toOf(i)}</span>
                <span className="tflex-bar" style={{ background: b.color, color: b.ink }}>{b.txt}</span>
              </React.Fragment>
            ))}
          </div>
          {err ? <p className="tflex-err" data-testid="trk-flex-err" role="alert">{err}</p> : null}
          {admin ? (
            <div className="tflex-foot">
              <button type="button" className="sm" data-testid="trk-flex-cancel" onClick={close}>Cancel</button>
              <button type="submit" className="sm primary" data-testid="trk-flex-save">Save</button>
            </div>
          ) : null}
        </form>
      </div>
    </>
  );
}

export default function FlexSettings() {
  const btn = useRef(null);
  const open = core.flexWinOpen;
  const close = () => {
    core.closeFlexWin();
    if (btn.current) btn.current.focus({ preventScroll: true });
  };
  return (
    <>
      <button className={'sm icon' + (open ? ' primary' : '')} id="flexBtn" ref={btn} data-testid="trk-flex-open" title="Flex settings"
        aria-label="Flex settings" aria-haspopup="dialog" aria-expanded={open} aria-controls="trkFlexWin"
        onClick={() => (open ? close() : core.openFlexWin())}>⚙</button>
      {open ? <Body btn={btn} close={close} /> : null}
    </>
  );
}
