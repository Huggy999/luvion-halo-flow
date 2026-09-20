# Celestial Glass & Lumi

## Scope
- Extend the selected bright celestial-glass direction across every main screen without changing product workflows, data rules, billing, or authentication.
- Build a reusable motion library that produces at least 100 purposeful interaction instances across the app rather than 100 unrelated effects.

## Build
1. **Celestial design system**
   - Refine typography, glass surfaces, spectral accents, shadows, icon containers, navigation, and page atmosphere.
   - Keep semantic tokens, contrast, mobile sizing, dark mode, and reduced-motion behavior intact.
2. **Motion and interaction library**
   - Add reusable entrance, press, hover, focus, shimmer, orbit, progress, completion, navigation, list, sheet, field, and loading behaviors.
   - Apply them consistently across cards, controls, tasks, hubs, docs, chat, timer, profile, pricing, and legal screens.
3. **Lumi and illustration system**
   - Give Lumi richer ambient states, orbital scenery, responsive reactions, and contextual appearances in Pulse, onboarding, focus, and chat.
4. **Onboarding and gamification**
   - Elevate step transitions, selection feedback, progress, halo milestones, daily completion, streak feedback, and focus-session rituals.
5. **Verification**
   - Verify mobile and desktop layouts, key flows, interaction states, no overflow, clean runtime/build signals, and reduced-motion coverage.

## Technical details
- Continue using TanStack Start, React, Tailwind v4, semantic CSS tokens, Lucide icons, and the existing SVG mascot.
- Prefer CSS motion and shared classes; add no unnecessary runtime dependency.
- Use motion only for feedback, hierarchy, state change, progress, or delight tied to an action.
