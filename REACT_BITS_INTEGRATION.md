# React Bits in the existing Build & Hire app

Research date: 27 October 2026. The first integration is now `SplitFlapText` (TypeScript + CSS), used for the brief post-login welcome screen. Its registry lists no additional dependencies; no animation package or styling framework was added.

## Implemented: SplitFlapText welcome

The official [TypeScript/CSS registry source](https://reactbits.dev/r/SplitFlapText-TS-CSS.json) lives in `BuildAndHireFrontend/src/components/reactbits/SplitFlapText`. Only React type-only imports were adjusted for the project's TypeScript settings. Upstream CSS and the license are retained. The application wrapper at `src/pages/PostLoginWelcome` displays “Build and Hire” using brown tiles, cream lettering and terracotta accents, with responsive sizing.

Successful sign-in (including automatic sign-in after customer registration) enters the authenticated `/welcome` route. After 3.4 seconds it replaces that route with the account's existing dashboard; reduced-motion users see a static result and continue after 600 ms. The Continue button and Escape skip the screen. Keyboard focus moves from the welcome screen to the dashboard. [Component documentation](https://reactbits.dev/text-animations/split-flap-text).

## How the library fits

React Bits delivers individual component source files, through manual copying or a CLI. Each component offers JavaScript/TypeScript and CSS/Tailwind variants. Choose **TypeScript + CSS** for this project. The official installation guide explains both installation methods. [Installation](https://reactbits.dev/get-started/installation), [component catalogue and variants](https://reactbits.dev/llms.txt).

The existing frontend uses React 19, TypeScript, Vite and plain CSS/CSS Modules. It has no Tailwind dependency or `components.json`. The current system can keep its router, API calls, authentication, context providers, forms and database contracts while selected presentation components are added around existing content. This is the proposed integration approach, not a claim that arbitrary upstream components have already passed our checks.

For an initial component, manual copying avoids introducing a new styling setup. Put the chosen `.tsx` and accompanying CSS under `BuildAndHireFrontend/src/components/reactbits/<Component>/`; use a small application wrapper when adapting its props and styling. Install only dependencies required by that component. The public SpotlightCard TypeScript/CSS registry entry was inspected directly: it contains `SpotlightCard.tsx` and `SpotlightCard.css`, with no additional dependency listed. [Registry entry](https://reactbits.dev/r/SpotlightCard-TS-CSS).

CLI installation is also supported. The official registry URL pattern selects the component and variant; for example:

```powershell
# Example only; not executed during this research.
npx shadcn@latest add https://reactbits.dev/r/SpotlightCard-TS-CSS
```

Inspect proposed CLI configuration changes before accepting them in this existing application. A Tailwind migration is unnecessary for CSS variants. [CLI patterns](https://reactbits.dev/llms.txt).

## Components worth considering

These placements are recommendations based on the current application, not changes already made.

| Component | Possible use | What was verified |
| --- | --- | --- |
| SpotlightCard | Marketplace company cards or selected feature cards | React and its own CSS; light/dark theme and color/intensity props. [Source](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Components/SpotlightCard/SpotlightCard.tsx) |
| FadeContent / AnimatedContent | Short entrance effects on the home page and company introduction | FadeContent currently imports GSAP/ScrollTrigger and includes cleanup and a reduced-motion branch. [Source](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Animations/FadeContent/FadeContent.tsx), [AnimatedContent](https://reactbits.dev/animations/animated-content) |
| CountUp | Genuine project/worker aggregate counts | Current source imports `motion/react`; use actual API-derived values. Keep quotes/payment amounts immediately readable. [Source](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/TextAnimations/CountUp/CountUp.tsx) |
| Masonry | A future alternative presentation for company completed-work photos | Official component offers a resizing masonry gallery with a lightbox. Its data, dependency and accessibility requirements need a separate source review before adoption. [Component](https://reactbits.dev/components/masonry) |
| TiltedCard | Optional decorative portfolio cover effect | Source checks reduced motion and coarse pointers and cleans up listeners/animation frames. Reduced-motion support still retains some movement, so assess a fully static alternative. [Source](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Components/TiltedCard/TiltedCard.tsx) |

## Project-specific integration checks

**Styling:** Keep the earthy colors, existing typography and spacing. Reuse variables from `src/theme/theme.css`. Existing `.bh-workspace` rules affect links, buttons, inputs and headings, so test the CSS cascade rather than copying a demo's entire stylesheet. SpotlightCard's source CSS adds its own padding, radius, overflow and stacking; adapt those to the existing card layout. [Upstream CSS](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Components/SpotlightCard/SpotlightCard.css).

**Scaled layouts:** The workspace uses CSS `zoom: var(--workspace-scale)` with a default of `1.08`. SpotlightCard computes pointer coordinates with `getBoundingClientRect()` and uses pixel positions in its light gradient. Check the effect under this scaling; coordinate adjustment may be needed. That is a compatibility concern inferred from the two implementations, not a demonstrated bug. [Pointer implementation](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Components/SpotlightCard/SpotlightCard.tsx).

**Layout and behavior:** Animation wrappers add DOM elements and can change grid/flex sizing, overflow, focus outlines and stacking contexts. Preserve real links/buttons and their existing callbacks, stable record keys, loading/error states and owner-only controls. Completed-work posts must remain confined to the business information page. Keep upload forms, confirmation dialogs and authentication behavior functional independently of decorative effects.

**Accessibility:** Verify keyboard navigation, visible focus, readable text, touch use and reduced-motion settings. Existing support varies by component; do not assume one library-wide guarantee. For reduced motion, show the same content with minimal or no movement. [Reduced-motion preference](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).

**Lifecycle:** `src/main.tsx` uses React StrictMode. Check route changes and repeated mounts for duplicate listeners, observers, timers or animation loops. Retain proper cleanup; StrictMode reruns Effects in development to expose missing cleanup. [React documentation](https://react.dev/reference/react/StrictMode).

**Performance:** Start with a small number of restrained effects. Measure bundle size and responsiveness after adding dependencies. Load heavy canvas/WebGL effects only where needed, stop unnecessary offscreen work, and provide a static fallback. These are implementation recommendations, not measurements of components running in this app.

## Adoption sequence

1. Pick one component and its exact TypeScript/CSS source version; inspect the implementation and retain applicable notices.
2. Add only its source files and required dependencies, then audit dependency changes.
3. Adapt through a local wrapper and scoped styling while preserving current data and actions.
4. Test at desktop/mobile widths, with keyboard/touch input, reduced motion, workspace scaling and route remounts.
5. Run frontend tests, ESLint and the production build; run the real browser workflow for the affected pages.
6. Compare screenshots and performance before expanding to more pages.

The first candidate I would evaluate is a subtle light-theme SpotlightCard for marketplace cards. It has no extra listed dependency, and the existing card content and navigation can remain inside it. Evaluate the actual result before adding animation packages or broader effects.
