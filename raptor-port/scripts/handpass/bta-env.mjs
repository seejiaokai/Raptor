/* [BLANK-TIMES-ABSENCE] walk — who X is, set BEFORE rbl-C-lib reads it (imports run in order).
   Vandal: a pilot (front seat), idle across the demo week, no input of his own, SC DAY and NIGHT current, not a SANS
   man — so nothing but the rule under test speaks about him. BTA_X / BTA_CS / BTA_SEAT override. */
process.env.RBL_X = process.env.BTA_X || 'split'
process.env.RBL_CS = process.env.BTA_CS || 'Vandal'
process.env.RBL_SEAT = process.env.BTA_SEAT || 'p'
