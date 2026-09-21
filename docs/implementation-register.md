# Luvion implementation register

This ledger is the acceptance source for the approved 100-item evolution. Statuses describe verified product behavior, not visual intent.

## 1–10 Capture and task intelligence
1. Universal capture — Existing — shared Create action — tasks/hubs — verify from every destination.
2. Natural-language date preview — Planned — quick capture — scheduling fields required.
3. Inbox triage — Planned — Today/Hubs — inbox state required.
4. Ordered subtasks — Planned — task details — subtask records required.
5. Recurring-task preview — Planned — task details — recurrence rules required.
6. Versioned templates — Planned — create task — template revisions required.
7. Effort field — Planned — task details — task field required.
8. Energy field — Planned — task details — task field required.
9. Acyclic dependencies — Planned — task details — dependency graph required.
10. Private attachments — Blocked — task details — private file storage is not configured.

## 11–20 Today and planning
11. Dated daily plans — New — Today/Pulse — `daily_plans` — migration 0004 and date-scoped reads.
12. Three server-enforced slots — New — Today — `daily_plan_slots` — slot range and uniqueness constraints.
13. Atomic replacement — New — Today replacement sheet — database function — one locked operation replaces a slot.
14. Accessible ordering — Upgraded — Today — persisted slot index — numbered ordered list and visible controls.
15. Multi-device conflict recovery — New — Today — plan revision — stale writes refresh the current plan.
16. Tomorrow planning — Planned — Today — dated model supports it; UI is not exposed.
17. Time blocks — Planned — Today — time-block records required.
18. Overdue review — Planned — Today — due dates required.
19. Intentional rollover — Planned — Today — copy operation required.
20. Daily closure/reflection — Planned — Today — closure fields exist; workflow is not exposed.

## 21–30 Hubs and goals
21. Illustrated hub covers — Planned. 22. Hub icons/purpose — Upgraded. 23. Pins — Planned. 24. Collections — Planned. 25. List/board views — Existing. 26. Saved filters — Planned. 27. Archive/restore — Partial; restore is missing. 28. Authorized paginated search — Planned. 29. Goals/milestones — Planned. 30. Bulk organization — Planned.

## 31–40 Focus and attention
31. Focus presets — Upgraded — task durations persist. 32. Breaks — Existing. 33. Cross-device transition validation — Planned. 34. Global mini dock — Planned. 35. Distraction capture — Planned. 36. Interruption notes — Planned. 37. Factual review — Upgraded — outcomes persist. 38. One active session — Planned database enforcement. 39. Reward deduplication — Upgraded. 40. Ambient sound — Blocked until licensed audio is supplied.

## 41–50 Journal and reflection
41. Private journal — Planned. 42. Guided prompts — Planned. 43. Recoverable drafts — Planned. 44. Search — Planned. 45. Timeline — Planned. 46. Activity calendar — Planned. 47. Weekly review — Planned. 48. Pattern exploration — Planned. 49. Bookmarks — Planned. 50. Private readable exports — Upgraded; current JSON/Markdown/CSV exports remain available.

## 51–60 Lumi
51. Conversation — Existing. 52. Scope selection — Planned. 53. Authorized source retrieval — Upgraded; authenticated reads verified. 54. Structured proposals — Planned. 55. Hub summaries — Existing. 56. Opt-in reflection context — Planned. 57. Smaller next step — Existing. 58. Reviewable actions — Planned. 59. Safe action execution — Planned. 60. Conversation management — Planned.

## 61–70 Halo and rewards
61. Halo progression — Existing. 62. Versioned progression — Planned. 63. Reward receipts — Planned. 64. Streak calendar — Planned. 65. Weekly goals — Planned. 66. Milestone awards — Partial; table exists, rules/UI do not. 67. Habitat growth — Planned. 68. Challenges — Planned. 69. Gentle return — Existing. 70. Period comparisons — Planned.

## 71–80 Onboarding and personalization
71. Optional Meet Lumi — Partial; replay exists, skip/resume needs work. 72. Editable intention — Existing. 73. Identity/avatar preview — Planned. 74. Locale/time zone — Planned. 75. Contextual tours — Planned. 76. Starter packs — Partial; idempotency required. 77. Resumable onboarding — Planned. 78. Replay without reset — Existing. 79. Daylight/Moonlight themes — Upgraded; system choice remains. 80. Pulse arrangement — Planned.

## 81–90 Navigation and accessibility
81. Route-derived navigation — Existing. 82. Hub cover continuity — Planned. 83. Context-preserving sheets — Existing. 84. Command menu — Planned. 85. Swipe plus visible equivalent — Planned. 86. Truthful sync controls — Planned. 87. Dismissible achievements — Planned. 88. Reduced motion — Existing. 89. Keyboard shortcuts — Planned. 90. Reading size — Partial; CSS support exists, preference storage/control remains.

## 91–100 Account and reliability
91. Session inspection — Planned. 92. Cross-device continuation — Partial; focus persists without revision control. 93. Offline mutation queue — Planned. 94. Conflict comparison — Partial; daily-plan revision recovery is shipped. 95. Durable reminders — Blocked by scheduler/delivery service. 96. Quiet hours — Blocked by reminders. 97. Notification inbox — Planned. 98. Private export jobs — Planned. 99. Complete deletion jobs — Partial; account deletion exists, coverage audit remains. 100. Privacy controls — Planned.
