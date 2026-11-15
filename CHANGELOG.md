# Changelog

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
