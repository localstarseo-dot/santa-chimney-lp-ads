# Local component preview QA

## Dark right-to-left review loop and release preparation, October 6, 2026

- Applied the approved charcoal palette to the reviews section, cards, avatars and Google link, with light text and warm gold stars. Preserved the three supplied excerpts, reviewer identities, service labels, rating and Google destination. An automated comparison against the supplied source confirms unchanged review wording.
- Removed LP 1's static modifier and opted it into desktop/mobile autoplay. The right-to-left keyframes travel from 0 to -50% of two equal-width groups, including the trailing inter-card gap. Exactly one duplicate is aria-hidden and inert, with no duplicated IDs or focus targets. The legacy component still supports its previous mobile/manual mode unless explicitly opted in.
- Added a 44px Pause/Resume control. Hover, keyboard focus and press pause the track; offscreen/hidden-tab state also suspends it. Reduced motion removes the clone and hides the control, restoring native manual scrolling. Motion preference changes preserve a visitor's manual pause choice. A touch-hover guard avoids sticky-hover stalls. No new dependency or review feed was added.
- Local rendered checks at 320, 390, 640, 768, 769, 1024 and 1440px confirmed dark colors, three accessible reviews and one inert copy, equal group widths, seamless geometry, no card or document horizontal overflow, and working pause/resume. The running transform moved farther left at every tested width. Keyboard focus paused the animation and showed a 3px outline. No browser console errors were recorded. Reduced-motion/hidden-tab/fallback cases were isolated-test verified, not browser-preference emulated or tested on physical mobile devices.
- Build, validation, review/hero/comparison/voucher regression fixtures and git diff --check passed. Screenshots: /tmp/santa-chimney-reviews-dark-desktop.jpg and /tmp/santa-chimney-reviews-dark-mobile.jpg. Temporary viewport override was reset. JC subsequently approved committing and pushing the current build; public deployment and rendered checks remain a separate post-push gate.

## Hero review-logo restoration and payment grouping, October 6, 2026

- Removed the repair hero's display:none rule hiding the existing Google and Yelp graphics. Both original supplied images loaded in the served browser, with natural width 300px. No asset replacement or new review claim was made.
- Desktop/tablet now explicitly groups Google/Yelp beside the rating, then credentials beside payments. “We Accept All Cards” is centered directly above the four payment logos, with an 8px gap. At 640px and below all four groups stack and center, with a 10px payment-label gap. This supersedes the earlier rating/credentials and split-label/payment rows described below.
- Served checks at 320, 390, 640, 641, 769, 1024 and 1440px confirmed both review logos visible and loaded, four payment logos, label above cards with less than 0.01px center offset, no document or hero horizontal overflow, and identical copy/trust boundaries. The phone CTA's approved pulse remains active; its measured bounding box can briefly grow during the animation.
- Build, validation, hero/comparison/voucher regression fixtures and git diff --check passed. No browser console errors were recorded. LP 1 HTML, slideshow/popup scripts and header/footer source hashes remain unchanged. No form, integration, asset, copy or footer change was made.
- Screenshots: /tmp/santa-chimney-hero-trust-desktop.jpg, /tmp/santa-chimney-hero-trust-mobile.jpg and /tmp/santa-chimney-hero-trust-grouping.jpg. Temporary viewport override was reset; the existing preview remains open. Checks used resized desktop-browser viewports, not physical mobile devices. Changes remain local only, with no Git commit, push or deployment.

## Hero desktop formatting and responsive alignment, October 6, 2026

- Replaced the obsolete two-column grid with a single content track: up to 640px on desktop, within the existing 1200px outer container. Copy, CTAs and trust block now share identical left/right boundaries. Kept the photo backdrop visible on the right without an empty photo element. Adjusted spacing, text width and overlay using the existing palette.
- Both hero CTAs use equal grid widths and 56px minimum height. Desktop rating and four credentials share one compact row; the label and four payment cards share the next row. The trust area is now 123px high at 1440px instead of 211px. Overall desktop hero height is approximately 641px instead of 692px.
- Tablet through 1023px centers a bounded content area instead of squeezing content into the old half-width grid. At 640px and below the CTAs and proof groups stack and center. Font sizing remains close across the 1023/1024 transition (43.989px/44.032px).
- Served checks at 320, 360, 390, 640, 641, 768, 769, 1023, 1024, 1280 and 1440px found zero document or internal hero overflow, zero mismatch between copy/trust widths or left boundaries, equal CTA widths/heights and no clipped labels. All four badges and payment cards remain. Fade transition remains opacity-only; no Pause Photos control returned.
- Keyboard focus showed a 3px outline and paused the focused phone CTA pulse. Home navigation was checked. No browser console errors were recorded. Build, validation, hero/comparison/voucher regression fixtures and git diff --check passed. LP 1 HTML, hero and popup JavaScript, and header/footer source hashes matched the pre-edit versions exactly. No copy, asset, integration or form change was made.
- Screenshots: /tmp/santa-chimney-hero-layout-desktop.jpg, /tmp/santa-chimney-hero-layout-tablet.jpg and /tmp/santa-chimney-hero-layout-mobile.jpg. Temporary viewport overrides were reset and the existing local preview remained open. These are responsive desktop-browser checks, not physical mobile-device testing. No Git commit, push, publication or WordPress deployment was performed.

## Hero fade revision and rendered checks, October 6, 2026

- Removed the visible Pause Photos button, its CSS, its JavaScript dependency and the bottom spacing reserved for it, as requested. The five supplied photos now use a 1000ms opacity crossfade, with an unchanged 3000ms rotation interval. No translation or swipe animation remains. The outgoing photo stays solid below the incoming fade to avoid a dark flash.
- Hero headline, body copy, phone/booking destinations, trust graphics and payment markup remain unchanged. Existing reduced-motion, hidden-tab, offscreen and popup suspension guards remain. Removing the manual pause control means this autoplay is not claimed to meet WCAG pause/stop requirements.
- Served checks at 320, 390, 768 and 1440px confirmed no document or hero-content horizontal overflow, no hero button, opacity-only transitions and transform: none. All five hosted photos loaded with natural dimensions 1448 x 1086. A fifth-to-first fade was observed with incoming opacity 0.99134 above the fully opaque outgoing photo; the active index continued changing with one active slide and stationary image frames.
- Build, static validation, hero trigger regression, comparison regression, voucher regression and git diff --check passed. No browser console errors were recorded. Reduced-motion behavior was isolated-test and source-verified, not browser preference-emulated. Screenshots: /tmp/santa-chimney-hero-fade-desktop.jpg and /tmp/santa-chimney-hero-fade-mobile.jpg. Viewport override was reset and the existing preview tab was kept open.
- Changes remain local only. No Git commit, push, GitHub publication or WordPress deployment was performed.

## Hero background slideshow, October 6, 2026

- Replaced only the hero photo placeholder with JC's five supplied October photos in their given order. Headline, copy, CTA destinations, trust badges and payment markup remain unchanged. Desktop retains its left content column; mobile remains centered. A dark overlay separates the stationary content from the moving background. Added a 44px-minimum Pause/Play button with bottom clearance.
- Added a dependency-free 3000ms rotation with 700ms horizontal sliding, including the fifth-to-first loop. Images are decorative and excluded from the accessibility tree. The first source is in initial HTML; later photos are prefetched one ahead, not all eagerly. Existing comparison and voucher scripts were not edited in this change.
- All five supplied URLs returned HTTP 200 image/webp by HEAD. Matching local source files measure 1448 x 1086; remote dimensions and cropping still require browser confirmation. Hosted files are approximately 1.8–2 MB each. Responsive Media Library derivatives and actual LCP/transfer measurements remain pre-launch work.
- Isolated `node qa/hero-slideshow.test.cjs` checks passed the five-photo sequence, 3000ms timer, single active slide, outgoing cleanup, wrap, prefetch, Pause/Play, hidden-tab/offscreen/popup suspension, reduced-motion behavior, unloaded/failed image guards, duplicate initialization and page lifecycle cleanup. Comparison and voucher regression fixtures also passed. These are isolated logic tests, not rendered browser or mobile-device verification.
- Build, static validation and diff whitespace checks passed. Preview server was restarted at port 4173. Browser access to the existing error-state preview tab was blocked by the browser URL security policy; no alternate browser or automation workaround was used. JC was asked to reload the tab. Rendered desktop/mobile, loaded remote images, visual transition, console state and screenshot verification remain pending.
- Changes are local only. No Git commit, push, GitHub publication or WordPress deployment was performed.

Checked October 6, 2026. This covers the supplied global components, not a complete LP 1 design.

- Build and syntax checks passed for generated header, popup, and preview-form JavaScript.
- Both generated pages have valid local asset references, working anchor targets, unique IDs, and no unrendered WordPress shortcodes or block comments.
- Browser widths checked: 320, 390, 768, and 1440 pixels. Document width matched viewport width.
- Both supplied logo URLs loaded in the browser. Footer logo dimensions were confirmed as 1958 × 803 and added to reserve its space.
- Header navigation and scroll-triggered sticky voucher form checked. Tablet overlap was fixed by widening the offer column; the 320-pixel form also fit.
- Popup automatic opening, Escape dismissal, keyboard focus wrapping, focus restoration, timer synchronization, and mobile screen fit checked.
- Header and popup preview submissions both displayed a simulated claimed state. Popup success also updated the header.
- Staging reset restored an active 59-minute timer. Reload preserved the countdown.
- Footer, telephone/email links, floating actions, popup stacking, and body space under the fixed bar checked.
- No browser console warnings or errors observed at the end of testing.

Compatibility adjustments: explicit border-box sizing for the popup overlay, wrapping offer text on narrow screens, a wider tablet offer column, and a same-page claim event. The popup is rendered outside the header without moving a plugin form at runtime.

Forms are local simulations. No real form, call, email, booking, analytics event, CRM delivery, or WordPress production behavior was tested. Logo files still depend on the supplied WordPress URLs. Initial global-component GitHub Pages publication was completed separately; the new body sections below have not been pushed.

## LP 1 local assembly, October 6, 2026

- One editable LP 1 HTML body and one built shared component stylesheet. The temporary section-file split was merged back at JC's request; original supplied attachments remain in `sources/` for reference.
- Integrated the supplied hero, service statistics, Our Work, white Google reviews, featured fireplace/wood-stove/dryer-vent services, and main residential services. Contact section remains pending.
- Preserved supplied hero copy, statistics, review excerpts, asset URLs, and destinations. No owner verification of claims is implied.
- Build, generated script syntax, unique IDs, local asset references, anchors, and `git diff --check` passed.
- Browser widths 320, 390, 768, and 1440 had no horizontal document overflow. Tablet/mobile featured stove and dryer panels did not clip their text.
- Hero image and all hero trust/reviewer assets loaded. Served hero retained eager/high priority and its responsive source; other hero images retained lazy/low priority. This is not a PageSpeed or Core Web Vitals measurement.
- Final counter values were 831, 20+, 1,478, and 874. Animation progressively enhances supplied final values and starts once in view.
- Both comparison controls passed keyboard endpoint tests. Pointer drag moved the repair split to 25% and updated range value, CSS position, and accessible text together.
- Reviews had exactly six accessible cards and one hidden clone group. In-view animation ran; focus and offscreen state paused it. Isolated script tests passed repeated initialization, document-hidden pause, reduced-motion clone removal, and missing-observer fallback. Reduced motion was not visually emulated in the browser.
- No browser console errors or warnings were observed during this round. Lower-page image loading and every outbound service destination have not been exhaustively checked.
- No commit, push, deployment, live form submission, tracking integration, or WordPress migration was performed for these changes.

## Hero phone CTA pulse, October 6, 2026

- The hero phone button reuses the sticky voucher button's `scPpcClaimPulse` keyframes and exact 1.2-second ease-in-out loop. The booking button is unchanged.
- Pulse disables on hover, keyboard focus, or active press so the target stays steady during interaction. Keyboard focus pause was verified in the local browser.
- Served CSS showed the pulse active at default preview width and 390 pixels, with no horizontal overflow and the original telephone destination intact.
- Reduced-motion CSS disables the pulse; this preference was checked in source, not visually emulated. No extra JavaScript or tracking was added.
- Local build, validation, and diff checks passed. No GitHub push or deployment was made.

## Hero payment cards, October 6, 2026

- Added JC's color Visa, Mastercard, American Express, and Discover WebP assets below the existing hero credential badges, with the requested text “We Accept All Cards.” No monochrome files or image color filters are used.
- All four local assets loaded in the served browser. The row fit at 320 and 1440 pixels without horizontal overflow; default preview width also passed. Original badges, booking CTA, and phone pulse remain intact.
- Explicit image dimensions reserve space, and the added row uses scoped styles in the shared stylesheet. Build, asset-path validation, and diff checks passed. No commit, push, or deployment was made.

## Black footer palette, October 6, 2026

- Removed the footer grid texture and red radial glow. Footer background is solid #000000, with neutral dark panels, gray borders/text, and white icons. Red/gold accents, hover colors, and focus outlines were replaced with neutral tones.
- Preserved footer content, links, logo, layout, and the separate floating action bar. Browser checks at 390 and 1440 pixels confirmed a solid black background, no background image, and no horizontal overflow.
- Local build, validation, and diff checks passed. No commit, GitHub push, or deployment was made.

## Mobile footer alignment and spacing, October 6, 2026

- Footer copyright and service-area lines remain centered and stacked at widths up to 640 pixels; desktop retains the left/right row.
- Removed duplicate mobile footer clearance: bottom padding is now 20px, while the body still reserves the floating bar height and safe-area space. At 390 pixels, footer bottom and floating bar top both measured 786px, with text unobscured.
- Centered brand description only on mobile. The initial logo check measured the link wrapper instead of the image; a follow-up image check exposed and fixed the remaining left alignment with mobile-only image auto margins. Actual image center offset is now 0px at both 390 and 583 pixels, while at 1440 pixels the image remains at the original left edge.
- Build, validation, and diff checks passed. Changes remain local, with no commit or GitHub push.

## Hero spacing and hierarchy refinement, October 6, 2026

- Refined the existing centered hero rather than replacing its structure. Copy, background image, asset URLs, CTA destinations, header, and footer were preserved.
- Reduced heading scale and excess outer padding, softened the secondary booking button and primary button shadow, and standardized spacing between reviews, rating, credentials, and payment cards.
- Payment tiles are now a quieter 38px-high row. All four credential badges stay on one row even at 320px. The phone pulse and reduced-motion rules remain intact.
- Served-browser checks passed at 320, 375, 390, 560, 768, 1024, and 1440px: no horizontal document overflow, no clipped CTA text, and unchanged telephone/booking destinations. Mobile buttons retain 58px and 50px minimum target heights.
- At 390px the hero height changed from about 916px to 816px; this is a layout measurement, not a Core Web Vitals or conversion result.
- Build, validation, and diff checks passed. No commit, GitHub push, deployment, or production tracking/form test was performed.

## Sticky voucher bar refinement, October 6, 2026

- Refined the existing sticky voucher bar in the shared stylesheet. Offer, timer, Forminator IDs, input labels, claim action, and form scripts were preserved.
- Mobile now places the readable offer and short caption above a single row of name, phone, and claim controls. Desktop retains the offer on the left, with aligned fields and a normal-height CTA. Softer input backgrounds, consistent borders/radii, and restrained header shadow improve separation.
- Served-browser checks passed at 320, 375, 390, 560, 721, 767, 768, 820, 1024, and 1440px: no horizontal document overflow, clipped offer/button text, or controls outside the viewport. Inputs and CTA measured 48px high and aligned on the same row.
- At the supplied screenshot's 721px width, the offer no longer wraps inside a 64px column and the CTA no longer spans two stacked input rows.
- Keyboard flow from Name to Phone to Claim passed at 390px, with visible focus outlines. The claim pulse stops on hover, focus, and active press. Existing reduced-motion rules remain intact; the preference was not visually emulated.
- An empty keyboard submission focused the required Name input and did not trigger a claimed state. Test field values were cleared. No valid submission or production request was sent.
- Latest build, validation, and diff checks passed. No browser console warnings or errors were observed. Temporary viewport overrides were reset, and no commit, GitHub push, or deployment was performed.

## Voucher popup UI and floating mascot, October 6, 2026

- Refined the existing popup in the shared stylesheet: distinct discount/service lines, consistent sans-serif typography, neutral fields, a full-width timer row, lighter CTA shadow, a separated call alternative, and a visible 44px close target. The offer wording, form IDs, phone destination, timer logic, and form scripts were preserved.
- Added JC's supplied 1600 × 1600 booking mascot on the right of the offer. It is decorative, reserves its dimensions, and scales from 80–112px without moving or cloning the form. The existing supplied asset URL is used directly.
- Verified image loading and a running 4.8-second infinite float animation. Mascot motion is a gentle 6px vertical travel and only runs while the popup is open. Existing reduced-motion CSS disables all popup animations; the preference was checked in source, not visually emulated.
- Final mascot-layout checks passed at 320, 340, 341, 375, 390, 480, 481, 768, and 1440px: the panel fit, with no horizontal clipping or mascot overlap with the title, timer, or close button. At 320 × 568px the panel required no internal scrolling.
- A 390 × 460px check confirmed that a short viewport permits internal scrolling and keyboard focus brings the claim button into view. This is a short-viewport test, not a real-device on-screen-keyboard test.
- Name → Phone → Claim keyboard flow, visible focus, forward/reverse focus trapping, Escape dismissal, close-button dismissal, focus restoration, and body scroll unlocking passed. The CTA pulse pauses while hovered, focused, or pressed. Empty keyboard submission focused the required Name field without claiming a voucher.
- Header/popup timer synchronization was verified. No valid form submission, production request, or contact-data save was performed. Build, validation, and diff checks passed, with no browser console errors or warnings observed. Changes remain local; no commit, push, deployment, or WordPress migration was made.

## Google reviews visual refinement, October 6, 2026

- Scoped the update to the reviews section and its existing shared stylesheet/script. Heading typography now matches the approved hero/popup sans-serif system, with restrained red branding, consistent gutters, a lighter secondary Google link, neutral avatar initials, and simpler card borders/shadows.
- Removed decorative gradient strips and blue source dots. Increased review text to 14px, separated the stars from reviewer identity, and made service labels quieter. The duplicate footer source label is hidden; the Google source remains visible below each reviewer name.
- Simplified the disclosure to the existing first sentence. All six supplied review excerpts were compared with the original supplied HTML and remain unchanged, as do reviewer identities, ratings, and the Google Maps destination. No live GBP feed or new review claim was added.
- At widths up to 768px, cards remain still and use native, keyboard-accessible horizontal scrolling with snap alignment. Desktop retains the original loop and hidden clone, including focus/hover/press and offscreen/document-hidden pause behavior.
- Served-browser checks passed at 320, 375, 390, 518, 768, 769, 1024, and 1440px: no horizontal document overflow, clipped heading/card content, or CTA text. The Google link retained its 44px target height. Mobile had one group with six accessible reviews; desktop had one accessible group and one hidden clone.
- Manual keyboard scrolling, desktop animation, focus pause, and transition back to mobile scrolling were verified. Isolated script tests passed repeated initialization, responsive mode transitions, hidden clone state, document-hidden pause, reduced-motion removal, and missing-observer fallback. Reduced motion was unit/source-tested, not visually emulated in the browser.
- Build, validation, and diff checks passed. No commit, GitHub push, deployment, WordPress migration, or production tracking test was performed.

## Softer footer background, October 6, 2026

- Changed only the footer background token from pure black to neutral charcoal #1c1c1c. Existing content, logos, typography, alignment, and the separate floating action bar remain unchanged; no background texture or gradient was reintroduced.
- Served checks at 390 and 1440px confirmed rgb(28, 28, 28), no background image, and no horizontal document overflow. Build, validation, and diff checks passed. No commit, push, or deployment was performed.

## LP 1 repair-only wireframe and hosted icons, October 6, 2026

- Implemented the supplied repair-first flow in the combined LP 1 body and shared stylesheet: focused hero, six problem cards, three repair project pairs, compact experience/credentials, three relevant Google reviews, three-step process, compact repair links, collapsed all-services directory, six FAQs, and final call/booking CTA. The previous broad-service body is recoverable in sources/lp-1-before-repair-wireframe.html.
- Replaced the six problem-card icon paths with JC's supplied October WordPress URLs. All six loaded in the served browser with 1254 x 1254 intrinsic dimensions; explicit dimensions were corrected accordingly. The complete 22-icon supplied set is recorded in sources/website-icon-manifest.json for contextual use, not loaded indiscriminately into the repair funnel.
- Seven labelled photo slots remain: one repair hero photo and three before/after pairs. Project descriptions are also marked coming soon. No unrelated sweeping/inspection photo was relabelled and no empty comparison slider was added.
- Preserved global header, offer/timer, native Forminator source IDs 4877/4914, popup styling and mascot, charcoal footer, payments, phone and Workiz destinations, and fixed actions. Local forms still simulate success only. No new form, analytics, CRM connection, guarantee, timeline, or published business claim verification was added.
- Betty, N. Kuyer, and A. Gleizer review article markup matched the corresponding supplied originals exactly. Desktop showed three equal 386.7px cards at 1440px with no card overflow; mobile kept one accessible source group, no clones, native horizontal scrolling and x-mandatory snapping. ArrowRight moved the mobile review viewport to scrollLeft 312px.
- Served checks at 320, 390, 768, 1024, and 1440px had zero document overflow, six problem cards, three reviews, seven placeholders, and exactly two preview forms. Mobile problem cards use one column, tablet two, desktop three. Repair-directory columns are one on mobile, two on tablet, three at 1024px, four at 1440px.
- Mobile before/after placeholders retained two 175px columns at 390px, with no pair overflow. The All Services directory started collapsed, expanded to 44 links by Enter, and collapsed again. A FAQ opened, revealed its answer, and closed by Enter.
- Popup remained closed on the fresh page before engagement, opened after a scroll and its five-second delay, focused inside the dialog, and displayed the same 32:20 timer as the header. Escape closed it and released scroll locking. It stayed dismissed after reload and further engagement in that tab session. The input/hidden-tab/claimed guard and reduced-motion styles were source-reviewed, not separately browser-emulated in this pass.
- All 48 unique checked service/icon URLs returned HTTP 200 by HEAD. Service destinations follow the official sitemap; Tuckpointing & Mortar Repair intentionally uses the existing masonry parent destination rather than an invented child URL.
- Supplied 874+ repairs, 20+ years, reviews, rating, credentials, and offer conditions require business-owner confirmation before ads launch. FAQ answers are draft wording, informed by the CSIA sources linked in README.
- Footer retained rgb(28, 28, 28), no background image and no document overflow. No browser console errors were recorded. Build, validation, review-integrity comparison, and git diff --check passed.
- Screenshot evidence: /tmp/santa-chimney-repair-cards-desktop.jpg and /tmp/santa-chimney-repair-wireframe-desktop.jpg. Temporary QA tab was closed, viewport override reset, and the original preview left open. No commit, push, GitHub publication, WordPress migration, production form delivery, tracking test, or measured ad result was performed.

## Final CTA removal and shared footer trust layout, October 6, 2026

- Removed the entire duplicate final repair CTA, its voucher copy and proof block, and the visible local preview-control row. The repair FAQs now lead directly into the shared official footer.
- Recreated the approved compact proof formatting inside the shared footer: two centered 88 x 56px Google/Yelp logo boxes above a centered NFPA, Certified Chimney Sweep, CERC and Licensed/Insured row. Credential images are 58 x 58px, with 20px desktop/tablet gaps and 14px mobile gaps.
- Preserved the footer logo, company description, address/email content, all four color payment logos and copyright byte-for-byte. Charcoal #1c1c1c and the existing desktop two-column/mobile-centered brand treatment remain intact.
- Moved #request-service to the footer address/email container so Contact Us remains valid. The three body enquiry links formerly targeting the removed final section now use the existing tel:+15129370590 destination. Hero, sticky voucher, popup and fixed bottom actions remain unchanged.
- Served checks at 320, 390, 768 and 1440px passed with no horizontal document overflow, exactly two preview forms, four payment logos and both proof rows centered within their footer column. Brand alignment remains centered only on mobile; desktop retains left alignment.
- All six footer proof assets loaded successfully. Contact Us navigation reached the footer business details. No browser console errors were recorded. Build, validation, preservation checks and git diff --check passed.
- No Git commit, push, GitHub publication or WordPress deployment was performed. The shared footer source is prepared locally for later migration.

## Pending-photo before/after sliders, October 6, 2026

- Replaced the three static project photo pairs with independent real-time comparisons using JC's supplied pointer/range interaction. Kept the repair-only project headings, descriptions, enquiry links, shared header, hero, reviews and footer unchanged. All seven photo-slot identifiers remain intact; no photos were added.
- Neutral Before/After panels show "Photo coming soon" and "Layout preview only." The red divider can be dragged or positioned with a click. The labelled native range supports keyboard control and shows a visible focus outline. No autoplay or decorative slider animation was added.
- Browser drag moved the first range from 50 to 75 percent on desktop and from 50 to 69 percent at 390px; its CSS clipping, position variable and accessible value stayed synchronized while the other two controls stayed independent. ArrowRight changed the second range to 51; End and Home reached 100 and 0 on the third. Focus outline measured 3px.
- Served layout checks at 320, 390, 768 and 1440px found no horizontal document overflow. All three components initialized; pending layouts contain no image elements. Small-screen captions and comparisons had no internal horizontal overflow.
- Isolated `node qa/comparison.test.cjs` checks passed initialization, repeat initialization, frame-coalesced updates before pointer release, independent values, bounds, cancellation, vertical-scroll direction lock, ignored secondary/non-primary pointers, and focus without scroll. `touch-action: pan-y` was confirmed in the browser. Touch hardware gestures were not tested.
- Build, strengthened static validation and `git diff --check` passed. No browser console errors were recorded. README now documents the matched-photo replacement and pending-state removal steps. Screenshot evidence: /tmp/santa-chimney-comparison-preview.jpg.
- Changes remain local. No Git commit, push, publication, WordPress migration, form delivery test or ad launch was performed. Photos and accurate project descriptions are still pending.

## Our Work centered buttons and copy, October 6, 2026

- Removed project numbers 01, 02 and 03. Centered the Our Work section heading, each project title, comparison hint, pending project detail and enquiry CTA. Existing text, matched-photo slots and phone destinations were preserved. Body markup outside Our Work matched the pre-edit source exactly.
- Converted all three enquiry links into the existing red repair-button style, with white text, arrow, 8px radius and 50px minimum height. Reused the Claim My Voucher 1.2-second gentle pulse. Hover, keyboard focus and active press disable the animation; the reduced-motion media query disables it entirely.
- Served checks at 320, 390, 768 and 1440px found no document overflow, clipped button text or buttons outside their project column. Button centers differed from their column centers by less than 0.01px. Desktop backgrounds were rgb(187, 27, 28), all three animations ran and all three destinations remained tel:+15129370590.
- Keyboard focus showed a 3px outline and stopped the focused button's animation. Reduced-motion and hover rules were source-reviewed, not separately preference/hover-emulated. Slider regression tests, build, static validation and git diff --check passed, with no recorded browser console errors.
- Screenshot evidence: /tmp/santa-chimney-our-work-centered-cta.jpg. No commit, GitHub push, publication or WordPress deployment was performed.

## Our Work dark template, October 6, 2026

- Restyled only Our Work with soft charcoal #1c1c1c, light headings, muted-light supporting copy and the existing warm hero accent on its eyebrow. Before/After placeholder panels use #24292b and #303638, with a visible light divider. No gradient, photograph or extra UI was added.
- Retained centered layout, red CTA buttons, original text/phone destinations, seven pending photo slots and the existing pulse, focus and reduced-motion rules. No HTML or JavaScript source changes were needed.
- Served checks at 320, 390, 768 and 1440px passed with no document, caption or button overflow. CTA targets remained at least 50px high. Contrast calculations from served colors ranged from 6.39:1 for white CTA/After-label text to 15.75:1 for headings; supporting text measured 9.79:1 on charcoal. This is color contrast verification, not a full accessibility audit.
- Desktop dragging plus ArrowRight updated the first comparison to 66 percent while the other two stayed at 50. The sliders' position variables matched their native range values. Build, validation, comparison regression tests and git diff --check passed, with no recorded browser console errors.
- Screenshot evidence: /tmp/santa-chimney-our-work-dark.jpg. Temporary viewport overrides were reset. No commit, GitHub push, publication or WordPress deployment was performed.

## Supplied Our Work images and reference-logic verification, October 6, 2026

- The initial descriptive photo URLs returned HTTP 404. JC chose to wait rather than substitute local assets, then supplied corrected numbered WordPress URLs. All six corrected URLs returned HTTP 200 image/webp; the host optimizes the supplied .png paths. The local asset folder remained unused.
- Added the corrected pairs in their supplied order: 01/02 flashing, 03/04 crown/masonry and 05/06 firebox/structural. All loaded in the browser with natural dimensions 1448 x 1086. Each image has dimensions, a neutral before/after alternative, lazy loading and asynchronous decoding. Before and After retain identical full-frame sizes; only the After layer is clipped as the divider moves. Source images were not edited or re-aligned.
- Removed the six comparison photo placeholders and their pending captions. Updated the third visible heading to JC's supplied Chimney Firebox / Structural Repair wording. Hero photo and accurate project descriptions remain pending. Source markup outside Our Work and the comparison JavaScript were unchanged byte-for-byte.
- Preserved the reference pointer/range algorithm, frame-coalesced real-time updates, 0–100 bounds, pointer capture, cancellation cleanup and vertical-scroll direction handling. Existing duplicate-init, primary-pointer and focus safeguards remain. No alternative carousel or drag library was introduced.
- Desktop drags produced independent values 30, 70 and 80 with matching CSS positions, clipping and accessible values. At 390px each slider dragged to 75, ArrowRight reached 76, Home reached 0 and End reached 100. Browser checks at 320, 390, 768 and 1440px found no horizontal document, stage, caption or CTA overflow; all six images remained loaded and all stages retained touch-action: pan-y.
- Expanded isolated tests for mouse, touch and pen event types, including live updates before release and non-prevented vertical movement. Tests passed alongside build, validation and git diff --check. These are isolated event tests and desktop-browser responsive checks, not physical mobile/touch-device QA. No recorded browser console errors occurred. A broad networkidle wait timed out, but direct image complete/natural-size checks confirmed all six loaded successfully.
- Supplied pairs use differing camera views, so seam features are not perfectly registered even though the frames match. No photographic provenance or real-job details are independently verified. Confirm those before ads launch; do not invent project descriptions.
- Screenshot evidence: /tmp/santa-chimney-our-work-photo-pairs.jpg. Changes remain local, with no Git commit, push, GitHub publication, WordPress deployment, production lead test or ad launch.

## Supplied project details and contextual CTAs, October 6, 2026

- Replaced all three pending project descriptions with concise versions of JC's supplied Problem, Repair and Why it matters copy. Each summary keeps its relevant enquiry prompt. No guarantee, repair scope, price, timeline or result was added. The firebox copy retains evaluation before further use.
- Used the supplied descriptive project titles and exact CTA labels: Get Help With a Chimney Leak, Ask About Masonry Repair and Request Fireplace Repair. All retain tel:+15129370590. Slider labels match their revised headings, while control IDs, image URLs, image dimensions and reference JavaScript remain unchanged.
- Styled the summaries as centered editorial text with bold inline terms and a thin separator, using the existing dark palette. Flexible project bodies align all desktop CTA bottoms without fixed text heights or clipped copy. The existing red pulse, focus outline and reduced-motion rules remain intact.
- Served checks at 320, 390, 768, 769, 1024 and 1440px passed with no document, body or button overflow. Buttons remained centered within 0.01px and at least 50px high. At narrow widths labels wrap without clipping; all three desktop CTA bottoms aligned. Summary bodies measured 66, 63 and 61 words in the served browser.
- Keyboard focus showed a 3px outline and stopped the focused CTA animation. Slider ArrowRight updated value and CSS position to 51 percent, with both images still loaded. Build, strengthened content validation, comparison regression tests and git diff --check passed. No browser console errors were recorded.
- Source markup outside Our Work, comparison image tags and comparison JavaScript matched the pre-edit versions exactly. Screenshot evidence: /tmp/santa-chimney-project-details-desktop.jpg. Hero photo remains pending. Changes are local only, with no Git commit, push, publication or WordPress deployment.
