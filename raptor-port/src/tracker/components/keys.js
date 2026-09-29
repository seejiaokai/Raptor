/* ENTER WHILE A WORD IS STILL BEING COMPOSED IS NOT AN ANSWER ([TRK-DLG-LEFTOVERS] 2,
   28 Sep 26). A phone keyboard (autocomplete, predictive text) and an input method for
   another script hold the word being typed "in composition"; the Enter that commits that
   word fires a keydown too, and every Tracker box that acts on Enter used to act on the
   half-typed text — adding a student named "ZUL", searching for half a code, saving an
   event's details mid-word. Every Enter handler asks this first. Three signals, because
   browsers differ: React's event carries the native one on `nativeEvent`; a plain DOM
   event has it directly; older engines give only key code 229 ("composition key").
   Plain JS with no imports, so it stays in the standalone Tracker as it is. */
export function isComposing(e) {
  if (!e) return false;
  if (e.nativeEvent && e.nativeEvent.isComposing) return true;
  return !!e.isComposing || e.keyCode === 229;
}
