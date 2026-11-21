# Changelog

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
