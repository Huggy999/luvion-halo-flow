# Luvion — Moonlit Sanctuary Redesign

## Direction and guardrails

- Use the selected **Organic Obsidian Flow** composition as the structural reference, refined into Luvion’s own moonlit forest world.
- Use only the checklist, scuba interface, and Land of Dreams images as references. The Trail image is explicitly excluded.
- Preserve authentication, account-scoped data, billing, legal/export flows, routes, and existing integrations.
- Open directly into Pulse. Onboarding becomes optional through a quiet in-app entry and never blocks returning users.
- Keep all interface copy in English, sentence case, without emoji or exclamation marks. Errors name the cause and the next step.
- Do not claim AI, persistence, reminders, offline sync, or rewards unless the underlying capability is real.

## 1. Establish the product and data baseline

- Verify the live database policies and grants before touching behavior; the repository contains historical open-policy migrations as well as newer owner-scoped migrations, so the live state is the authority.
- Add only the data needed for requested real features: task notes; hub icon/archive state; user intention, avatar, motion and sound preferences; daily check-ins/reflections; activity events and earned achievements; durable focus-session records.
- Keep every new user-facing table owner-scoped with explicit grants and row-level policies. Use recorded, idempotent events for streaks and rewards so repeated toggles cannot farm progress.
- Preserve current task, hub, document, chat, subscription, and app-state records through additive migrations and safe defaults.

## 2. Rebuild the shared design system

- Consolidate the rendered theme tokens around deep forest charcoal, dark teal, raised teal, warm ivory, readable pale teal, mint actions, moonlight-yellow rewards, and restrained coral errors.
- Define one radius scale, spacing rhythm, elevation model, icon sizing/stroke rules, focus rings, and four motion durations. Glass is reserved for navigation, sheets, and true overlays.
- Use a refined rounded sans for interface text, a restrained serif for milestone/editorial moments, and tabular numerals for timers and statistics. Support enlarged text and long labels.
- Replace the fixed 430px desktop column with responsive shells: mobile bottom dock, tablet split layouts, and a calm desktop navigation rail with useful supporting context.
- Adapt sheets into bottom sheets on phones and centered dialogs on larger screens while preserving focus trapping, Escape, focus return, and inert background behavior.

## 3. Original Luvion artwork and mascot

- Redraw Lumi as an original mint forest spirit derived from the existing halo-and-M silhouette, with tactile form, two eyes, upward features, and a warm yellow halo.
- Provide purposeful states: welcoming, listening, thinking, encouraging, celebrating, resting, offering help, and error recovery. Every meaningful state has adjacent text or an accessible label.
- Build reusable responsive scene artwork from layered SVG/CSS elements: moonlit lake, distant mountains, woodland silhouettes, reflected light, botanical details, and Lumi. Keep controls and copy outside artwork.
- Reuse the same visual world across Pulse, optional onboarding, hub covers, focus, empty states, and milestones, with safe mobile/desktop crops and reduced-motion fallbacks.

## 4. Redesign the complete app

- **Pulse:** personal greeting/date; compact atmospheric scene; direct completion of three priorities; honest progress explanation; next unfinished priority action; Spark → Ray halo summary; contextual Lumi guidance; quick hub access; check-in and post-completion reflection.
- **Today:** intentional three-slot planner; explicit replacement chooser; recoverable completion; editable task details/notes/priority; duration presets; persistent active focus session; pause/resume/early finish/reset; accurate summary.
- **Hubs:** searchable and sortable collection; meaningful icon/color previews; responsive tiles; rename/recolor; task filtering and transfer; archive/restore; useful empty-hub first action; preserve boards, docs, limits, and WIP rules.
- **Lumi:** companion-led conversation; transparent suggested prompts; truthful pending/error states; real task/hub source links; proposed actions shown before authorized application; deterministic guidance labeled when generated AI is unavailable.
- **Profile:** editable identity/avatar/intention; real progress ranges and achievements; motion and sound preferences; optional sound preview; onboarding replay; export progress; existing billing, legal, reset, sign-out, and deletion flows.
- **Onboarding:** optional, resumable introduction from inside the app; Lumi purpose, intention, personalization preview, existing-or-new first hub, first priority, navigation lesson, preserved back navigation, skip/resume, and one clear return action.

## 5. Interaction implementation map

Each item below maps the requested interaction to a real surface or shared module. The final implementation ledger will point to exact files and verification evidence.

### Navigation and shell — 1–10
1. Active indicator travel — shared mobile dock/desktop rail.
2. Directional screen transitions — route shell using navigation order.
3. Return-position memory — route-keyed scroll restoration.
4. Quick-create expansion — create menu with task/hub actions.
5. Three dismissal paths — create menu and shared overlay primitive.
6. Contextual back — hub/task/detail entry-state preservation.
7. Search reveal and focus — shared command/search surface.
8. Result identification — destination highlight with timed announcement.
9. Active focus dock — persistent timer controller in the app shell.
10. Compact header — scroll-aware shared page header.

### Pulse — 11–20
11. Ordered entrance — Pulse sections.
12. Scene depth response — Pulse landscape with static fallback.
13. Tap Lumi greeting — contextual, short, non-blocking message.
14. Immediate progress — optimistic priority completion.
15. Progress explanation — accessible detail sheet.
16. Next priority — deep-link/open/start-focus action.
17. Check-in choices — labeled segmented control.
18. Check-in saved state — non-blocking announcement.
19. Check-in editing — reopen current-day response.
20. Reflection reveal — optional prompt after real completion.

### Tasks and planning — 21–30
21. Task creation sheet — trigger-linked focus placement.
22. Inline validation — Field errors and focused recovery.
23. Identified insertion — real optimistic list entry.
24. Relational task details — TaskSheet transition from source row.
25. Title edit — explicit save/cancel.
26. Notes edit — persisted status and retry.
27. Priority selector — labeled, non-color-only states.
28. Add to Today — available-slot mutation.
29. Three-slot replacement — explicit selected task swap.
30. Completion/undo — optimistic completion and reliable UndoToast.

### Hubs — 31–40
31. Hub insertion — collection transition after real save.
32. Appearance preview — color plus icon, never color alone.
33. Hub opening — tile-to-detail continuity.
34. Title editing — save/cancel without content loss.
35. Hub search — actual-name filtering and result count.
36. Hub sorting — selected criterion with stable ordering.
37. Task filters — real states and counts.
38. Task transfer — destination picker and confirmation.
39. Archive/restore — persisted archive state with clear consequence.
40. Empty hub — first-task action with contextual Lumi scene.

### Focus sessions — 41–50
41. Focus setup — task plus optional duration selection.
42. Duration presets — accessible segmented control.
43. Session start — quiet timer mode.
44. Accurate progress — wall-clock calculation, restrained announcements.
45. Pause — persisted paused state and changed controls.
46. Resume — correct continuation after navigation/reload.
47. Early finish — distinct outcome from planned completion.
48. Reset protection — confirmation only for active sessions.
49. Completion moment — brief visual; sound only when enabled.
50. Session summary — actual focused time and next action.

### Lumi — 51–60
51. Companion opening — Lumi guidance/conversation surface.
52. Suggested question — transparent population/submission.
53. Listening state — input acknowledgment without microphone claims.
54. Thinking state — only during the real request.
55. Answer entrance — immediate readable response.
56. Source inspection — links to matched real tasks/hubs.
57. Action preview — proposed mutation review.
58. Action application — authenticated server-validated mutation.
59. Missing context — honest explanation and next step.
60. Failure recovery — preserve question and retry.

### Halo and rewards — 61–70
61. Halo inspection — progression sheet.
62. Level inspection — Spark/Ray and later real requirements.
63. Earned progress — event-backed feedback.
64. Milestone crossing — one-time short reveal.
65. Halo transformation — earned skin/state.
66. Achievement details — requirement, status, evidence.
67. Persistent collection — account-backed earned records.
68. Streak date inspection — real activity-event detail.
69. One continuation reward — idempotent local-date event.
70. Gentle return — gap-aware, non-punitive copy.

### Optional onboarding — 71–80
71. In-app launch — Pulse/Profile entry.
72. Lumi introduction — short illustrated scene.
73. Intention selection — accessible choices.
74. Personalization preview — live preview before save.
75. First hub — select existing or create without duplication.
76. First priority — select existing or create real task.
77. Navigation lesson — Pulse/Hubs/Today relationship.
78. Step progress/back — preserved inputs.
79. Skip/resume — saved position without blocking Pulse.
80. Completion — return to personalized Pulse and next action.

### Profile and preferences — 81–90
81. Profile editing — display-name save states.
82. Avatar preview/confirm — staged selection.
83. Intention editing — persisted preference.
84. Motion preference — working in-app override plus system setting.
85. Sound preference — off by default with optional preview.
86. Reminders — expose only capabilities genuinely supported; otherwise document dependency.
87. Progress ranges — actual event-backed periods.
88. Achievement filters — earned/upcoming.
89. Onboarding replay — no account reset.
90. Export — progress, completion, and recoverable failure states.

### Feedback, accessibility, resilience — 91–100
91. Contextual skeletons — stable layouts per route.
92. Saving/saved/failed — shared async status pattern.
93. Offline state — truthful banner and protected drafts.
94. Reconnection — resume safe reads/writes and disclose conflicts.
95. Destructive protection — consequences plus appropriate confirmation.
96. Timed undo — shared reversible-action notification.
97. Keyboard focus — intentional focus movement and visible rings.
98. Form recovery — retain valid input and focus the failed field.
99. No-results recovery — direct reset action.
100. Reduced-motion alternatives — static state changes with equivalent meaning.

## 6. Technical implementation sequence

1. Live-data/security verification and additive migrations.
2. Shared tokens, type, responsive shell, navigation, overlays, status and motion primitives.
3. Lumi state system and reusable moonlit illustration components.
4. Pulse and Today, including task details and persistent focus controller.
5. Hubs, hub detail/board/docs integration, search/sort/edit/archive/transfer.
6. Lumi source/action flows and truthful fallback behavior.
7. Profile, achievements, preferences, export states, and optional onboarding.
8. Complete loading/empty/error/offline/reconnection and reduced-motion coverage.
9. Produce a checked 1–100 implementation ledger with exact locations and dependencies.

## 7. Verification and acceptance

- Run focused tests for task CRUD, explicit three-slot replacement, undo, focus timing across navigation/reload, persistence, streak idempotency, halo thresholds, achievements, exports, and Lumi source isolation.
- Verify signed-out, new-account zero-state, returning-account, AI unavailable, quota, offline, reconnect, validation, and server-error paths without fabricated success.
- Inspect at narrow phone, 394px phone, large phone, tablet, 1280px desktop, and wide desktop sizes; check safe areas, software-keyboard layouts, truncation, enlarged text, and no horizontal overflow.
- Keyboard-test all routes, overlays, quick-create, search, task workflows, and onboarding. Verify focus trap/return, landmarks, names, live regions, contrast, 44px targets, and non-color status cues.
- Test system and in-app reduced motion, background/offscreen animation pausing, and sound-off defaults.
- Run type checks, targeted tests, production build, runtime/console/network checks, accessibility scan, and security scan.
- Finish with a concise dependency report. Browser notifications that cannot reliably fire while the app is closed, App Store packaging, and payment activation remain external unless their required platform credentials/services are supplied.