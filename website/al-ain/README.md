# AL AiN IT Consultants, Prototype Web 1

Prototype home page for AL AiN IT Consultants Sdn Bhd (ISO/IEC 17025 software testing laboratory, SAMM 829), built by Brand Method. Version of 13 September 2026.

## Open it

Any static web server works. From this folder:

    python3 -m http.server 8080

then open http://localhost:8080/index.html in Chrome, Edge or Safari. Double-clicking index.html also works: everything renders, only the loading screen falls back to the static logo because browsers block canvas sampling on file:// pages.

## What is in the folder

| File | What it is |
|---|---|
| index.html | The prototype. One page, one file: styles, markup and script together. |
| audit.html, competitors.html, plan.html, review.html | The workspace pages linked from the dark admin bar at the top: the web audit, the competitor board, the web plan, and the review of the prototype (63 audit items, three checks each). |
| assets/ | Images, the client mark, the admin bar stylesheet. Only files the five pages use. |

The dark bar at the top of every page is Brand Method's admin navigation for the prototype review. It is not part of the client site and is removed for the live build.

## What is demo, and what is real

- Module prices are demo placeholders, tagged "Demo price" on every card and in the checkout. AL AiN supplies the real bands or "price on request".
- The checkout dialog takes no payment. Pressing pay shows the demo notice. Nothing is sent.
- The quotation form sends nothing yet.
- Items tagged "At kickoff" (course formats, intakes, office hours, the Director portrait) are supplied by the client at project start.
- Every figure on the page is sourced: SAMM 829 accreditation, the government IV&V register, the four regulatory mandates. See plan.html for the sources.

## For the developer

- Every visible string carries data-en and data-bm attributes. The prototype shows English; the Bahasa copy is in place for the full build and needs a native proofread before it goes live.
- Only Home is a live navigation link. Services, Modules, Accreditation, Academy and News are greyed and titled "Built in the full site".
- Fonts load from Google Fonts (Schibsted Grotesk, Inter, Plus Jakarta Sans). No other external dependency.
- The hero showpiece and the loading screen are canvas 2D, written in the page. No library.
- Verified in Chromium at 360 to 1920px wide, in three contexts (desktop, phone touch, reduced motion). Safari and Firefox not yet tested.

Brand Method, 2026.
