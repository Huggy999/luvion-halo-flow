# Luvion premium product evolution

## Product contract

- Preserve the existing TanStack Start application, Lovable Cloud data, authentication, billing, legal/export flows, routes, and the five destinations: **Pulse, Hubs, Today, Lumi, Profile**.
- Open directly into Pulse. Keep onboarding optional, resumable, replayable, and accessible from inside the product.
- Use the eight attached images as the only visual references. The missing Trail image will not be sourced elsewhere; its written milestone-path description may guide behavior without introducing another visual reference.
- Keep all product copy in English, sentence case, without emoji or guilt-based language. Errors name the cause and the next step.
- Treat the 100 requirements as an implementation register, not as 100 unverified completion claims. Every item will receive: **status, entry point, frontend behavior, backend dependency, and verification evidence**.

## Verified baseline

The current app already contains owner-scoped tasks, hubs, documents, chat, app state, daily check-ins, focus sessions, activity events, achievements, and subscription records. Existing code also includes optimistic task mutations and undo, a three-item Today experience, hub boards and documents, task notes and duration presets, persistent focus sessions, Halo levels, optional onboarding, Lumi chat, profile preferences, data export/deletion, PWA reading support, reduced-motion handling, and responsive mobile/desktop navigation.

These are foundations to upgrade rather than duplicate. The audit also shows that several requirements need stronger domain models rather than additional presentation: daily priority slots are not yet a transactionally enforced daily-plan model; offline support is not a recoverable mutation queue; reminders/jobs, task recurrence, attachments, revisions/idempotency receipts, goals/milestones, journal records, conflict resolution, and device-session controls are not established as complete workflows.

## 1. Implementation register and release boundaries

- Create a checked 1–100 register before feature work begins, seeded from the existing implementation.
- Classify each item as **existing**, **upgraded**, **new**, **blocked**, or **deferred**. A styled control, empty panel, or local-only state does not count as implemented.
- Preserve established behavior unless the guide explicitly replaces it. Record migrations, affected screens, test evidence, and external dependencies per item.
- Keep release slices independently usable. Do not expose navigation or controls for backend-dependent work until the complete workflow and recovery states exist.

## 2. One visual system from the eight references

- Build two complete semantic themes:
  - **Moonlight:** deep teal/charcoal, mint controls, warm ivory text.
  - **Daylight:** pale mint/warm ivory, deep forest text, dark green controls.
- Define semantic tokens for every state: default, hover, pressed, selected, disabled, pending, success, error, destructive, and keyboard focus. Validate WCAG 2.2 AA pairings before release.
- Use **Manrope** for the working interface and **Cormorant Garamond** only for onboarding, journal, milestone, and achievement moments. Use tabular numerals for timers and changing statistics.
- Apply the 4/8/12/16/24/32/48/64 rhythm, 44px minimum targets, restrained 12/20/28px radii, and clear surface hierarchy. Avoid turning every control into a pill.
- Translate reference qualities rather than subject matter: bold editorial hierarchy, charcoal/cream planning contrast, fine orbital structure, narrative milestones, deep-teal tactile surfaces, expressive character silhouettes, pale-mint organization, and warm layered landscapes.
- Redraw Lumi into one original mint companion system with eight purposeful states: Welcome, Listen, Think, Encourage, Celebrate, Rest, Explain, Recover. Motion occurs only in response to meaningful events.
- Create a cohesive Luvion illustration family: moonlit lake, forest clearing, mountain path, dawn valley, riverside, and sunset overlook, with wide, portrait, cover, and thumbnail crops. Interface text remains outside artwork.

## 3. Responsive application shell and interaction language

- Recompose the shell for mobile, tablet, and desktop rather than stretching the phone layout. Mobile uses a safe-area dock; tablet can pair content and detail; desktop uses navigation, working content, and an optional context panel.
- Make navigation selection travel, preserve route/scroll/draft context, and add a real universal capture entry point from every destination.
- Standardize screen headers, action bars, task rows/details, priority slots, hub covers/headers, focus timer/mini-player, Lumi messages/sources, milestone/Halo views, journal editor, sheets/dialogs, undo, and loading/empty/error/offline states.
- Use shared accessible primitives for focus containment, Escape dismissal, focus restoration, pending states, live announcements, and non-drag alternatives.
- Apply motion only for causality and continuity: press 100–140ms, selection 160–220ms, list changes 200–280ms, sheets 260–340ms, route changes 240–360ms, and dismissible achievements 500–800ms. Provide equivalent static states for reduced motion.

## 4. Core workflows: requirements 1–40

### Capture and task intelligence — 1–10

- Upgrade quick capture into an inbox-preserving operation available from every screen.
- Add confirmed natural-language date previews, inbox triage, ordered subtasks, recurring-task previews, versioned task templates, effort and energy fields, acyclic dependencies, and private attachments with progress and access checks.
- Keep measured focus time separate from estimates and never infer health-related meaning from energy labels.

### Today and planning — 11–20

- Replace the UI-only Today limit with dated daily plans and three server-enforced slots, including atomic replacement, accessible ordering, revision checks, and multi-device conflict recovery.
- Add tomorrow planning, time blocks with overlap warnings, overdue review, intentional rollover, capacity budgets, explainable energy-aware suggestions, and a dated daily closure/reflection.
- Completed priorities remain visible; a fourth priority always requires an explicit replacement choice.

### Hubs and goals — 21–30

- Upgrade hubs with curated illustrated covers, icons, purpose, pins, collections, list/board views, saved filters, archive/restore, and authorized paginated search.
- Add goals and ordered milestones linked to real tasks. Provide both illustrated path/constellation views and an equivalent linear list.
- Add bulk organization with explicit partial-failure reporting and no silent loss.

### Focus and attention — 31–40

- Extend the existing persistent focus session into customizable presets, breaks, cross-device transition validation, a global mini dock, distraction capture, interruption notes, and a factual session review.
- Persist transitions and intervals, not every second. Enforce one active/paused session and prevent duplicate time or reward records.
- Keep ambient sound optional, licensed, user initiated, independently adjustable, and off by default.

## 5. Reflection, Lumi, and progress: requirements 41–70

### Journal and reflection — 41–50

- Evolve check-ins/documents into a private journal workflow with guided prompts, recoverable drafts, search, timeline, activity calendar, weekly review, cautious pattern exploration, bookmarks, and private readable exports.
- Keep associations descriptive rather than making clinical or causal claims.

### Lumi assistance — 51–60

- Add conversation scope selection, authorized source references, structured inbox/task/priority proposals, current hub summaries, opt-in reflection context, smaller-next-step support, reviewable actions, and conversation management.
- Use the pipeline: authenticate → authorize scope → retrieve → generate → validate → present sources/actions.
- Treat notes, attachments, and imported text as untrusted data. All accepted actions pass through ordinary validated, retry-safe mutations. Interrupted or unavailable AI remains visibly incomplete/unavailable.

### Halo and meaningful rewards — 61–70

- Preserve the existing Halo mechanic and upgrade it to versioned progression, deduplicated reward receipts, a real streak calendar, flexible weekly goals, unique milestone awards, earned habitat growth/customization, bounded personal challenges, a gentle return ritual, and transparent period comparisons.
- Record UTC instant, time zone, and local date. Undo reverses the linked reward; repeated toggles cannot farm progress. An unfinished morning never erases historical streaks.

## 6. Personalization, accessibility, and reliability: requirements 71–100

### Onboarding and personalization — 71–80

- Upgrade optional “Meet Lumi” onboarding with editable intention, identity/avatar preview, locale and IANA time zone, contextual tours, idempotent starter packs, resumable progress, replay without reset, complete Daylight/Moonlight/system theme choices, and a validated Pulse module arrangement.

### Navigation, motion, and accessibility — 81–90

- Add route-derived traveling navigation, static-safe hub cover continuity, context-preserving sheets, an authorized command menu, swipe actions with visible-button equivalents, truthful refresh/sync controls, one-time dismissible achievements, persisted reduced motion, discoverable keyboard shortcuts, and a reading-size preference.
- Target WCAG 2.2 AA: one main landmark, semantic controls, visible focus above the dock, no drag-only/hover-only paths, 44px product-standard targets, readable task states, restrained timer announcements, robust zoom/text enlargement, and decorative art hidden appropriately.

### Account, reminders, and reliability — 91–100

- Add supported session inspection/revocation, cross-device continuation, an account-scoped persistent offline mutation queue, revision-based conflict comparison, durable task reminders, quiet hours, a deduplicated notification inbox, private export jobs, complete deletion jobs, and privacy controls for analytics, Lumi context, and local cache.
- Preserve unsynced drafts through auth expiry and never replay one account’s queue into another account.
- Distinguish local save, syncing, saved, and needs-attention states. Provider acceptance is not presented as confirmed reminder delivery.

## 7. Backend and data evolution

- Use additive migrations only; preserve all current records and account ownership. Every new public table receives explicit grants, row-level security, and owner policies in the same migration.
- Introduce only the records required by complete workflows: daily plans/slots, subtasks, recurrence, attachments, goals/milestones, journal/bookmarks, intervals/breaks, reward ledger, Lumi scopes/sources/proposals, reminder occurrences, operation receipts, revisions/deletion markers, exports, notification state, and privacy preferences.
- Every important mutation derives the actor from verified authentication and accepts a unique operation ID, validated payload, and expected revision where relevant. Repeated identical operations return the original result; reused IDs with different payloads fail.
- Enforce slot uniqueness, task uniqueness, ownership, and atomic replacement server-side. Serialize concurrent plan edits and return structured errors such as `PLAN_FULL` and `REVISION_CONFLICT` for calm product-language recovery.
- Keep private files private with validated size/type, expiring access, and deletion coverage. Logs exclude task notes, journal text, attachments, and full conversations.
- Use durable jobs for reminders, exports, and deletion work. Re-check relevance and cancellation before delivery.

## 8. Delivery sequence

1. **Foundation:** freeze the 1–100 baseline; verify live grants/policies; finalize themes, type, spacing, responsive shell, accessible overlays, operation contract, revisions, and daily-plan model.
2. **Core experience:** ship the redesigned Pulse, Today, task intelligence, Hubs, goals, focus recovery, mini dock, and complete mobile/tablet/desktop layouts.
3. **Personal growth:** ship journal/reflection, Halo ledger and achievements, illustration environments, Lumi states, optional onboarding, theme and reading preferences.
4. **Assistance and resilience:** ship scoped Lumi sources/actions, reminders/jobs, private files, offline queue, conflicts, notification inbox, exports, deletion, and privacy controls.
5. **Release refinement:** finish performance budgets, route/asset loading, accessibility, reduced motion, localization consistency, security isolation, concurrency, recovery exercises, and the evidence ledger.

## 9. Verification and acceptance

- Test every control’s stated action and every requirement’s evidence entry; do not count placeholders.
- Verify signed-out, new-account zero state, returning account, quota/unavailable AI, offline, reconnect, expired auth, conflict, validation, and server-error paths without fabricated success.
- Exercise simultaneous three-slot edits, duplicate operation IDs, focus refresh/sleep/navigation/cross-device commands, reward reversal/deduplication, local-date and daylight-saving boundaries, reminder cancellation/quiet hours, export expiry, and account deletion coverage.
- Prove one account cannot read, mutate, search, export, download, or supply Lumi with another account’s records or files.
- Inspect narrow mobile, 394px mobile, large mobile, tablet, 1280px desktop, and wide desktop with software keyboards, safe areas, 200% text, browser zoom, long labels, and no horizontal overflow.
- Keyboard-test all destinations, dialogs, quick capture, command menu, task planning, focus, journal, and onboarding. Verify focus trap/return, landmarks, names, live regions, contrast, target size, and non-color cues.
- Run focused unit/integration tests, type checks, production build, runtime/console/network checks, accessibility review, performance checks on representative mobile hardware, database migration/recovery exercises, and security scans.

## External dependencies and honest limits

- Browser background work cannot guarantee exact delivery while the app is closed; durable server-side scheduling and available delivery channels are required.
- App Store packaging/signing, Apple developer credentials, and native notification entitlements remain separate release dependencies.
- Payment activation, licensed ambient audio, and any external delivery provider remain blocked until their real services and credentials are available.
- Semantic retrieval, a separate search cluster, and microservices remain deferred until measured data volume or retrieval quality justifies them.
