# Desktop adaptation verification — 1.7.0

Desktop screens at least 700×600 use a larger left-hand square and a right-hand tray. Boards reach 424px at 1280×720 and 520px at 1440×900. Controls remain below the tray; the level picker uses five columns. Mobile layout and short landscape layout are preserved.

All six existing suites and the new responsive suite pass. The latter checks mobile geometry baselines, separated board/tray bounds and nonoverlapping piece homes for all 100 levels on compact laptops and larger screens: 24,836 checks. Engine, motion and level definitions are byte-identical to 1.6.0; application changes are confined to responsive geometry, preview resizing and the side-tray return region. Saving, progression and motion logic are unchanged. Storage keys, domain, IDs and save format are retained.

Browser checks covered 1280×720, 1440×900, 1024×600, 732×751, 700×600, 699×720, 375×667, 320×568 and 844×390. Mouse placement, rejected overlaps, keyboard completion, Next, Undo, Restart, level navigation and mobile placement after a desktop resize passed. All nine final-square pieces were placed with native pointer drags from a blank board.

Resizing initially exposed a hidden desktop-sized preview contributing to page scroll. Layout now clears unused marker geometry and updates active keyboard/hint previews. After the fix, tested page scroll dimensions match each viewport; visible hints scale to the new board correctly.

The existing normal save before deployment showed level 7, 6 completed squares, sound enabled, honey at (3,0) and peach at (0,0). Local QA used isolated session keys. Post-deployment evidence will be recorded in qa/live-desktop-1.7.0.json. Physical-phone touch feel, OS motion settings, audio and haptics remain device-test boundaries.

A placed sage piece dropped onto an occupied desktop cell returned to its original (2,0) position. Dragging it back to the right-hand tray then removed it from the board. The tray hit region follows the horizontal layout on desktop and short landscape screens; mobile retains its vertical tray boundary.

The compact desktop layout also fits the actual 732×751 in-app pane: a 315px board, a three-column nine-piece tray, and all controls remain within the viewport. All nine pieces were placed successfully by mouse at that size. The 700×600 lower desktop boundary fits without scrolling; at 699px and at phone sizes the original mobile arrangement is used.
