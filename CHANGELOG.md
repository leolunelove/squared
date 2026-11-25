# Changelog

## 1.7.0 — 2026-11-25

- Adapt desktop screens to a larger square on the left and a separate piece tray on the right, with responsive sizing and fixed piece homes.
- Add a wider desktop level picker and visible keyboard guidance.
- Preserve the compact mobile layout, puzzle data, motion, storage keys, level IDs and progress.
- Match the return-to-tray region to the side-by-side layout, preserving invalid-drop return behaviour.
- Reposition active placement markers on resize and clear hidden oversized markers that could otherwise cause page scrolling.
- Verify mouse and keyboard completion, full nine-piece desktop play, desktop/mobile transitions, saved positions, and 24,836 responsive geometry checks.

## 1.6.0 — 2026-11-24

- Apply the approved bentoad Soft toad identity: vector mascot, rounded outlined wordmark, blue, navy and chalk.
- Update browser title, accessible brand label, SVG favicon and embedded 180px home-screen icon.
- Carry the palette through controls, level navigation, instructions and completion feedback.
- Preserve the game app, engine, motion code and all 100 levels byte for byte, including the original save keys and domain.
- Verify 375×667, 320×568 and 844×390 layouts, pointer placement and overlap rejection, hints, Undo, reloads, independent saved boards, Restart and final-square completion.

## 1.5.0 — 24 November 2026

- Pickup captures the visible pose before interrupting movement, preserving the grabbed cell.
- Added short, interruptible landings and distance-aware returns. Undo and Restart cancel old visual travel cleanly.
- Made the landing preview track its grid cell immediately.
- Replaced placement overshoot, looping hint pulses and confetti with a steady hint and a single completion halo.
- Shortened the wait for completion and the result-card entrance.
- Kept immediate alternatives for reduced motion and cleared transient motion on resize.
- Preserved all 100 levels, permanent IDs, rules and saved progress.


## 1.4.0 — 23 November 2026

- Expanded the campaign to 100 levels in five phases: Learn, Connect, Compare, Plan and Master.
- Added 64 new puzzles and regraded all levels using fixed orientations only.
- Preserved original layouts and earned completions through permanent puzzle IDs.
- Saved unfinished boards and Undo histories separately, including when switching levels or reloading.
- Increased functional text size and contrast while keeping the existing visual style.
- Added specific feedback for occupied spaces and pieces outside the square.
- Added campaign, migration, independent-board and phase regression checks.


## 1.3.0 — 21 November 2026

- Fixed every level for drag-only play: fresh games and restarts no longer turn pieces away from their fitting direction.
- Hints and placement validation now use the same fixed-orientation rule.
- Migrated old rotated saves, retaining compatible placements and all completed levels.
- Removed rotation controls, double-tap turns, the R shortcut and obsolete instructions.
- Added regressions for all 36 fixed-orientation solutions, saved arrangements, restart initialization and worker hints.


## 1.2.0 — 15 November 2026

- Added 24 puzzles for a 36-level campaign, with larger squares introduced in stages and the toughest nine-piece 8×8 puzzles at the end.
- Grouped the collection into six chapters and kept the current square visible when opening it.
- Extended the tray to support nine pieces in compact portrait and landscape layouts.
- Moved complex hint searches to a background worker with cancellation, so the board stays responsive.
- Preserved the first twelve puzzles and existing player progress.
- Added independent solvability, progression, save-compatibility and worker checks.


## 1.1.0 — 15 November 2026

- Pieces keep a fixed home and scale in the tray throughout a level. Smaller shapes use the space more generously.
- Picking up a piece grows it smoothly over 135 ms. Touch drags lift above the finger; mouse drags stay under the cursor. Movement is drawn once per animation frame.
- A small magnetic allowance catches near misses at a legal edge. Overlaps remain invalid, and invalid drops return to the exact previous home.
- Quarter-turns animate around the piece centre. Double-tapping also turns a selected piece. A blocked turn keeps the piece on the board.
- A subtle settling animation accompanies successful placement. Existing quiet sounds and optional haptics remain in place.
- Page overflow no longer causes a scrollbar to interrupt a drag. Stale pointer-capture events and duplicate resize notifications are ignored.
- Dismissing completion immediately releases the screen for the next tap.
- Compact portrait layouts give the pieces more space. Landscape puts the board beside the tray. Real resizing repositions pieces without temporarily overflowing the page.

The existing save format and every valid solution remain supported. Physical-phone touch, audio quality, and haptics require device testing.
