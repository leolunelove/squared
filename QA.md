# Fixed-orientation repair — 1.3.0

All 36 levels now use fixed orientations. Fresh games and restarts share the same initialization; the engine independently solves every board without a turn. Placement validation and the actual hint-worker program reject inaccessible rotated placements. The level layouts and piece order are unchanged.

Save migration is checked for every level: compatible placements remain, rotated tray pieces reset, incompatible turned placements return to the tray, and legacy partial arrangements that cannot be completed under fixed rules refresh. Completed levels and the current campaign index are preserved. New-format partial progress, including legal dead ends, survives reload.

Local browser checks at a confirmed 375×667 completed levels 1–6 with pointer drags only, including the levels that previously introduced rotation. Hint, Restart, reload of a partial board, and removal of R/double-tap turning were checked on level 7.

Live verification is pending publication. Release testing uses a separate session save so campaign progress is not completed by the playthrough. Physical phone touch feel, sound and haptics remain outside this browser check.
