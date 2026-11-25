# Desktop adaptation verification — 1.7.0

Desktop screens at least 960×600 use a larger left-hand square and a right-hand tray. Boards reach 424px at 1280×720 and 520px at 1440×900. Controls remain below the tray; the level picker uses five columns. Mobile layout and short landscape layout are preserved.

All six existing suites and the new responsive suite pass. The latter checks mobile geometry baselines, separated board/tray bounds and nonoverlapping piece homes for all 100 levels on compact laptops and larger screens: 15,762 checks. Engine, motion and level definitions are byte-identical to 1.6.0; application code outside the layout function is unchanged. Storage keys, domain, IDs and save format are retained.

Browser checks covered 1280×720, 1440×900, 1024×600, 959×720, 375×667, 320×568 and 844×390. Mouse placement, rejected overlaps, keyboard completion, Next, Undo, Restart, level navigation and mobile placement after a desktop resize passed. All nine final-square pieces were placed with native pointer drags from a blank board.

Resizing initially exposed a hidden desktop-sized preview contributing to page scroll. Layout now clears unused marker geometry and updates active keyboard/hint previews. After the fix, tested page scroll dimensions match each viewport; visible hints scale to the new board correctly.

The existing normal save before deployment showed level 7, 6 completed squares, sound enabled, honey at (3,0) and peach at (0,0). Local QA used isolated session keys. Post-deployment evidence will be recorded in qa/live-desktop-1.7.0.json. Physical-phone touch feel, OS motion settings, audio and haptics remain device-test boundaries.
