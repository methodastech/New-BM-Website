# Handoff: Jom Makcik, Prototype Web 1

Prepared 13 September 2026 by Brand Method. Build type: static HTML, CSS and vanilla JavaScript. No framework, no build step, no dependencies to install. Target: client review now, a React build later if approved.

## 0. How to open it

1. Unzip and keep the folder structure exactly as it is.
2. Serve the folder with a static web server, then open `index.html`. Any of these works:
   * `npx serve .` (recommended, it serves video byte ranges)
   * `python3 -m http.server 8080`, then visit http://localhost:8080
   * upload the whole folder to any static host such as Netlify, Vercel, Cloudflare Pages or S3
3. Double clicking `index.html` also opens it, but the YouTube film does not play from a `file://` address. Use a server to review everything.
4. An internet connection is needed for Google Fonts and the YouTube film. Everything else is inside this folder.

## 1. Pages and URLs

| File | What it is | URL it should own |
|---|---|---|
| index.html | The website prototype, home page | `/` |
| audit.html | 00 Web audit of jommakcik.my | internal, not a public page |
| competitors.html | 01 Competitive landscape | internal |
| plan.html | 02 Web plan | internal |
| design.html | 03 Design book | internal |
| review.html | 05 Review and actions | internal |
| qa.html | 06 Questions and answers for the client meeting | internal |

Tab 04 in the admin bar is `index.html` itself. The internal documents are for the team and the client; they should not be indexed if they are ever hosted publicly (noindex present today: none).

Pages not built yet: Services, Pricing, Coverage and About (greyed in the nav), and in the footer the three service pages, About us, Our partners, Adinita driver login and Client login. Clicking any of them shows "Not available in the demo version".

## 2. Shared blocks

| Block | In index.html | Notes |
|---|---|---|
| Admin navigation bar | `div.bmws`, styles in `assets/bmws.css` | Brand Method review bar on all seven pages. Remove for production |
| Header and nav | `header#hd` | Transparent over the hero, solid once scrolled, hides on the way down. EN and BM language switch |
| Booking band | `.ft-cta` | Headline with WhatsApp and Call |
| Footer | `.ft-main`, `.ft-legal`, `.ft-bottom` | Four columns, privacy notice under PDPA 2010 |
| Footer van animation | `#ftDrive` | Van drives in, boarding film, drives off |
| Demo ribbon | `.bm-footrib` | Brand Method credit. Remove for production |
| Mobile action bar | `nav.mab` | Call and WhatsApp, fixed at the bottom under 1025px |
| WhatsApp button | `a.waf` | Desktop, bottom right. Demo link in this build |
| Film lightbox | `#lb` | Full film with sound |
| Demo notice | `.toast`, created by script | Answers links that are not built yet |

## 3. Section to component map

| Order | Block | Selector | Suggested component | Repeating |
|---|---|---|---|---|
| 1 | Hero | `.hero` | Hero | 3 proof points |
| 2 | Figures | `.stats` | StatsBand | 4 figures |
| 3 | Logo wall | `.wall` | LogoMarquee | 14 logos, cloned by script for the loop |
| 4 | Comparison | `#why` | Comparison | 2 cards |
| 5 | Services | `#services` | ServiceCards, ServiceCard | 3, `data/services.json` |
| 6 | Is it for you | `#foryou` | ForYouList | 4, `data/for-you.json` |
| 7 | Gallery | `#proof` | Gallery | 5, `data/gallery.json` |
| 8 | Film | `#film` | FilmPlayer, FilmChapter | 5, `data/film-chapters.json` |
| 9 | Pricing | `#pricing` | PriceTable, PriceRow | 5, `data/pricing-rows.json` |
| 10 | Testimonials | `#voices` | Testimonials, TestimonialCard | 3, `data/testimonials.json` |
| 11 | One dialysis day | `#saving` | DayTimeline, TimelineStop, SavingBar | 4, `data/dialysis-day.json` |
| 12 | Founder and team | `#founder` | Founder, TeamGrid, TeamCard | founder plus 3, `data/team.json` |
| 13 | Partners | `#partners` | PartnerRail, PartnerCard | 14, `data/partners.json`, cloned by script |
| 14 | Coverage | `#coverage` | CoverageMap | 4 areas, `data/coverage-areas.json` |
| 15 | Questions | `#faq` | FaqList, FaqRow | 6, `data/faqs.json` |
| 16 | Booking band, footer, van | see section 2 | Layout | |

Repeating items inside each group share identical markup.

## 4. CSS

* System: plain CSS in one `<style>` block in the head of `index.html`. No Tailwind, no Bootstrap.
* Fonts: Google Fonts, Poppins and Plus Jakarta Sans, weights 400, 500, 600, 700, linked in the head.
* Class names are short section prefixes: `.hd` header, `.sc` services, `.fyi` for you, `.gal` gallery, `.prow` price rows, `.vcard` testimonials, `.tl` timeline, `.tm` team, `.ptr` partners, `.ft` footer. Expand them to full prefixes when porting, for example `services-card`.
* Breakpoints: max-width 1080, 1024, 820, 700, 640, 560 and 400; min-width 641, 1025 and 1081; plus `pointer:coarse` and `prefers-reduced-motion`.
* `!important`: 5 in `index.html`, all for reduced motion and hidden states.

Theme variables in `:root`:

| Variable | Value |
|---|---|
| `--ink` | `#0E1424` |
| `--soft` | `#454E60` |
| `--faint` | `#5C6577` |
| `--hair` | `#E8EAEF` |
| `--red` | `#F91B2A` |
| `--red-deep` | `#C60815` |
| `--wash` | `#FFF3F4` |
| `--cream` | `#F7F8FA` |
| `--cream2` | `#EEF0F4` |
| `--white` | `#fff` |
| `--maxw` | `1340px` |
| `--r` | `0px` |
| `--e` | `cubic-bezier(.22,.8,.28,1)` |
| `--sh` | `0 2px 8px rgba(14,20,36,.04),0 18px 44px -22px rgba(14,20,36,.20)` |
| `--sh2` | `0 4px 14px rgba(14,20,36,.06),0 34px 70px -30px rgba(14,20,36,.30)` |

## 5. JavaScript

* One inline `<script>` at the end of the body of `index.html`, about 24 KB of vanilla JavaScript. No libraries, no jQuery, no GSAP.
* A second block holds JSON-LD structured data, LocalBusiness and FAQPage.
* Every animation respects `prefers-reduced-motion`.

| Behaviour | Trigger | React path |
|---|---|---|
| EN and BM language switch, reads `data-en` and `data-bm`, sets `html lang` | click | i18n state, copy moved into message files |
| Header lift, hide on scroll down, show on scroll up | scroll | effect with a scroll listener and cleanup |
| Hero still drifts from first paint, film crossfades in after load on a fast connection | load | effect after mount |
| Logo marquee and partner rail duplicated for a seamless loop | load | render the list twice |
| Film player with five chapters, YouTube IFrame API, video `UBGWAKq6WVM` | click | iframe component or react-youtube |
| Full film lightbox | click, Escape | modal component |
| Comparison clips: ours loops, theirs is scrubbed forward and back with requestAnimationFrame | in view | effect with IntersectionObserver |
| Dialysis day timeline, track draws and each stop reveals | in view | IntersectionObserver hook |
| Service and for you icons play once on view and on hover | in view, hover | class toggled by a hook |
| Coverage map reveal, list and map highlight each other | in view, hover | IntersectionObserver hook plus state |
| Footer van loop with the boarding clip | in view | IntersectionObserver hook |
| Demo notice for links not built yet | click | remove once the pages exist |
| Back to top on desktop | scroll, click | small component |
| Privacy notice opens when linked | hash | details element with state |
| Mobile menu | click, Escape, resize | state |
| Demo ribbon canvas | load | remove for production |

## 6. Forms

There are no forms. Every booking and question goes to WhatsApp or the phone.

| Action | Destination |
|---|---|
| Book links in services | scroll to the booking band (`#book`) |
| Header Book a ride | `#book` |
| WhatsApp buttons, booking band, questions, mobile bar | `https://wa.me/60102284020`, with a prefilled message where set |
| Call | `tel:+60102284020` |
| Second WhatsApp line in the footer | `https://wa.me/60173404020` |
| Email | `admin@jommakcik.my` |
| Floating WhatsApp button on desktop | `href="#"`, shows the demo notice. Point it at the booking link in production |

Login, payment or API keys involved: none.

## 7. Data files

Content that repeats, extracted from `index.html` on 13 September 2026 so it can be looped and edited. Every text field carries `en` and `bm`. The HTML is still the source of truth for this build.

| File | Feeds | Rows |
|---|---|---|
| data/services.json | Services | 3 |
| data/for-you.json | Is it for you | 4 |
| data/gallery.json | Gallery | 5 |
| data/film-chapters.json | Film chapters | 5 |
| data/pricing-rows.json | Pricing | 5 |
| data/testimonials.json | Testimonials | 3 |
| data/dialysis-day.json | One dialysis day | 4 |
| data/team.json | Founder and team | 4 |
| data/partners.json | Partners | 14 |
| data/coverage-areas.json | Coverage | 4 |
| data/faqs.json | Questions | 6 |

## 8. SEO and meta

| Page | Title | Meta description | OG image |
|---|---|---|---|
| `/` | Jom Makcik · Wheelchair accessible transport and trained companions, Selangor to Negeri Sembilan | Stay in your own wheelchair. A trained woman walks you in, waits, and brings you home. AbiliCar wheelchair accessible vehicles, lady drivers and chaperones across Selangor, Kuala Lumpur, Putrajaya and Negeri Sembilan. | https://jommakcik.my/assets/img/photo-van-branded.webp |

* Favicon: `assets/img/favicon-32.webp`, touch icon `assets/img/apple-touch-icon.png`, theme colour `#F91B2A`.
* Structured data: LocalBusiness and FAQPage, JSON-LD in `index.html`.
* Analytics: none installed. Add the GA4 or GTM container at build time.

## 9. Known issues and decisions needed

1. Generated imagery, to be replaced by a half day photo shoot: the two comparison clips and their posters, the dialysis day photos, the for you photos, the testimonial photos, the team portraits in the khaki field vest (backgrounds extended around the original photographs), the footer van and its boarding clip, and the hero film loop. The founder's signature is her own.
2. Customer names and photographs in the testimonials wait for consent. The quotes are the customers' own published words.
3. Facts the client must confirm: the rates, shown as On request; the hours, weekdays 8am to 5pm; and the open items in plan part 07.
4. Pages not built yet show a demo notice, see section 1.
5. Remove for production: the admin bar (`div.bmws`, `assets/bmws.css`), the Brand Method ribbon (`.bm-footrib`), the demo notice, and the footer line "Prototype, home page only".
6. The right hand comparison clip is scrubbed by setting `currentTime`, which needs a host that serves byte ranges. Every common static host does. Without it the clip plays as a normal loop.
7. The YouTube film needs an `http` or `https` address.
8. CSS and JavaScript are inline in `index.html`. When porting, move them into `css/` and `js/` files first, then split into components.
9. Asset URLs carry cache tokens such as `?v=3`. Keep them or drop them in the new build.

## 10. Assets

* `assets/` holds only the files the pages use: images, WebP responsive ladders with JPG or PNG fallbacks, logos, icons, the map pins, and four H.264 MP4 videos in `assets/video`. All paths are relative.
* `shots/` holds the evidence screenshots used by the audit.
* `data/` holds the content files in section 7.
* Package size: 211 files before this document, about 19.6 MB.
