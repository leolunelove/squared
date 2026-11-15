# Mobile polish verification — 1.1.0

## Before the update

All 12 levels were completed at `https://squared.leolune.fun/` in a 390×844 Chrome viewport. Pieces were placed through native pointer drags, with the Rotate control used from level 5. The collection showed 12 of 12 complete. Evidence is retained in the task's `work/qa/live-baseline-12.json`.

## Release checks

- 529 existing geometry and solver checks pass.
- 870 new checks cover grab-point continuity, touch clearance, magnetic edge allowance, board bounds, overlap rejection, and rotation safety.
- All 12 revised puzzles were completed locally through pointer drags and Rotate.
- Remaining tray positions and scales are unchanged when another piece is placed.
- An invalid drop returns to the exact previous home.
- A slight overshoot at a legal board edge is accepted; distant and overlapping drops remain invalid.
- A blocked rotation keeps the original piece on the board.
- Double-tap rotation and Undo restore the expected orientation.
- A partial board and rotations survive reload.
- Compact portrait layouts and the final landscape puzzle fit without scrolling after layout settles.
- The accidental scrollbar that interrupted a pickup has been reproduced, fixed, and retested.

## Live release

Version 1.1.0 was deployed successfully in [run 43662186656](https://github.com/leolunelove/squared/actions/runs/43662186656). All 12 levels were then completed again on the live site in a 375×667 viewport using pointer drags and the Rotate control. The final collection showed 12 of 12 complete. See [the raw playthrough record](qa/live-playthrough-1.1.0.json) and `verification.json`. The served HTML matches the release build byte for byte.

These are browser checks at phone viewport sizes, using mouse/pointer input. Touch lift is covered by geometry checks. Physical-phone touch feel, sound quality, and vibration have not been signed off on a physical device.
