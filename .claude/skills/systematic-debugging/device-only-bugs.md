# Bugs You Cannot Reproduce Here

**Load this reference when:** a bug shows only on a device or browser you
cannot run (a phone, Safari), or only in a recording someone sent.

## Read the Recording as Data

- **Turn the clip into frames before forming any theory.** ffmpeg does it (on
  a machine without it, the `imageio-ffmpeg` Python package ships a binary):
  contact sheets from its fps / scale / tile filters make a whole clip
  viewable, then a second pass at 10-30 frames a second over the seconds that
  matter shows the mechanism.
- **Classify each motion by its shape.** Diff consecutive frames: a released
  fling decays smoothly; a held finger is no change, then constant speed; a
  one-frame jump is a programmatic write or a repaint. Match the one-frame
  jumps to timers and writes in the code.
- **Read the platform's own chrome as an instrument.** A mobile browser's
  address bar collapses only when the PAGE scrolls, so a bar that stays tall
  while content moves means a nested scroller moved.
- **A fixed edge is geometry; a drifting edge is timing.** A seam at the same
  pixel in every frame is an element's box — compare it with the sizes the
  code measured. Only a boundary that moves or varies earns a paint or timing
  theory.
- **After a fix, read the NEW recording, not the old diagnosis.** Removing one
  fault changes what shows through the same pixels — a hole that showed black
  now shows whatever is underneath.

## When the Engine Differs

- **Portable causes first.** A train of long timer tasks right after the
  input is visible in any browser's trace. An engine-specific theory is earned
  only once the portable causes are exhausted — the portable fix is usually
  the small one.
- **Know which bugs the desktop cannot show.** Keep a list of engine
  differences (e.g. WebKit does not re-snap after a programmatic scroll;
  Chromium does), so the investigation reaches the device with a hypothesis
  and a fix preview, not "cannot reproduce".
- **With no device, the engine's published source beats memory** for exact
  behaviour.
- **"Not painted until touched":** confirm the page structure is already
  right; list the ancestors of the missing pixels and which of them own a
  compositor layer; find a nearby element that DOES paint on the device and
  diff only the layer-owning properties. Verify the fix's mechanism on the
  engine you have, say plainly that the fault itself is verified only on the
  device, and pin the fix as a contract test that says why it exists.
- **A mechanism-level diagnosis obliges a mechanism-level sweep:** fix every
  element the same mechanism reaches, or name each one you leave alone and
  why.

This project's worked cases: `raptor-port/docs/performance.md` (the ledger
items on compositor layers, timer trains and the phone week glide) and
`raptor-port/docs/ui-contracts.md` (the compositor-layer section).
