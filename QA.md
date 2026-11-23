# 100-level campaign verification — 1.4.0

Five phases contain twenty levels each. All 100 levels were independently solved using fixed orientations; the actual hint-worker program, geometry checks, campaign and save tests pass. The new campaign retains all 36 original layouts under permanent IDs, with 64 new puzzles. Old completions and the current square migrate to those identities. Seventy-four legacy save round trips cover versions 1 and 2 with 0–36 earned completions. Separate board states and Undo histories survive a save/reload round trip.

All 100 local levels were completed at a confirmed 375×667 through game controls: first 10 by native pointer dragging, remaining 90 using keyboard controls after two browser-connection stalls interrupted pointer testing. The collection showed 100/100, with 20/20 in every phase. See [raw playthrough](qa/local-playthrough-1.4.0.json). A separate earlier pointer run reached 29 before its connection reset.

The exact level-switching regression was checked in the browser: a placed piece and Undo history persisted after switching away/back and after reload, and Undo returned it to the tray. Outside-board feedback and fixed-orientation hints were checked. The final nine-piece level fits 320×568 portrait and 844×390 landscape without scrolling. Completion copy was checked both for all 100 earned squares and for completing the final square with 98 earlier squares still unearned, using an explicitly seeded, local-only QA fixture. QA fixture pages are excluded from the release.

Five shuffled exact-cover searches, shape clues and placement ambiguity inform ordering. The final phase was refined through thousands of connected-shape candidates. These scores are structural aids; they do not establish how difficult real players find the puzzles. Physical phone touch feel, audio and haptics remain device-test boundaries.

Live deployment verification is pending.
