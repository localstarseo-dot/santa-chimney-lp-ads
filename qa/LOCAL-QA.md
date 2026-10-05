# Local component preview QA

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

Forms are local simulations. No real form, call, email, booking, analytics event, CRM delivery, or WordPress production behavior was tested. Logo files still depend on the supplied WordPress URLs. GitHub repository and Pages publication remain pending.
