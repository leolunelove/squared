# Fixed-orientation repair — 1.3.0

All 36 levels now use fixed orientations. Fresh games and restarts share the same initialization; the engine independently solves every board without a turn. Placement validation and the actual hint-worker program reject inaccessible rotated placements. The level layouts and piece order are unchanged.

Save migration is checked for every level: compatible placements remain, rotated tray pieces reset, incompatible turned placements return to the tray, and legacy partial arrangements that cannot be completed under fixed rules refresh. Completed levels and the current campaign index are preserved. New-format partial progress, including legal dead ends, survives reload.

Local browser checks at a confirmed 375×667 completed levels 1–6 with pointer drags only, including the levels that previously introduced rotation. Hint, Restart, reload of a partial board, and removal of R/double-tap turning were checked on level 7.

Version 1.3.0 deployed successfully in [run 44934936125](https://github.com/leolunelove/squared/actions/runs/44934936125). All 36 live puzzles were completed at a confirmed 375×667 using native pointer drags only. The collection showed 36 of 36 complete; see [the playthrough record](qa/live-playthrough-1.3.0.json). The normal campaign still showed 1 of 36 complete after the isolated playthrough. HTTPS returned 200 with a validated certificate, and the live HTML matched the local build byte for byte.

A browser migration test opened a genuine 1.2.0 level5 save in the new build: a compatible placed piece remained on the board and the turned tray pieces refreshed. Release testing uses a separate session save so campaign progress is not completed by the playthrough. Physical phone touch feel, sound and haptics remain outside this browser check.
