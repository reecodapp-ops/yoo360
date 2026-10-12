# Yoo360 studio website

This project retains the supplied Yoo 360 V0 website. The original Inter, Space Grotesk and Instrument Serif fonts, cream/yellow palette, section composition, motion and service preview effects are preserved. Requested edits simplify the copy, use the supplied Yoo360 logo and black client logos, and place two hero buttons directly beneath the headline.

## Focused additions

Order a design opens `/order-a-design` on the official website, where visitors choose Logo & Brand Visual Identity or Marketing & Print Design and continue to checkout. The hero contains only Order a design and Explore our work. Discuss a project remains in the navigation and footer and opens a separate five-field enquiry page. The footer's simulated email form is replaced with the real enquiry route. Existing ordering pages retain their established design.

The enquiry page uses the original website's typography, colors, shapes and entrance timing. It collects name, optional company, email, project type and a short description. It validates inputs, retains them after failures, prevents repeated concurrent submissions and confirms only provider-accepted sends. Corporate work is scoped through a conversation rather than the fixed design-order catalog.

`src/lib/links.ts` owns the ordering and enquiry API destinations. The email handler is hosted on the existing ordering Worker under `/api/project-enquiries`; no new Site or replacement main framework is needed.

## Search readiness

The production build prerenders the real React home, enquiry, founding team and three individual profile pages into visible HTML, including accurate impact figures. JavaScript still mounts the original interactive site and animations. Each public page has its own title, description, canonical URL and social sharing metadata. Organization/WebSite/WebPage structured data describes the site; individual ProfilePage/Person data matches the visible member biographies and confirmed connections. The build emits robots.txt and a sitemap containing all nine public pages. Unknown routes show a 404 page with noindex rather than duplicating the homepage.

## Founding team

The `/team` entry is linked from the homepage Studio section through the Meet the team button. Its centered grid shows all three compact cards together on desktop and stacks them vertically on mobile. Each portrait is at most 250px wide with a 4:5 aspect ratio. Cards contain only a portrait, name, role and View Profile cue, with the whole card linking to an individual profile. Each profile has its own direct URL, back link, biography and accessible SVG connection icons. New pages use a white background, the existing fonts and brand accents. Reduced motion is respected on these pages.

Member details live in `src/lib/team.ts`. Berton and Bertin's existing portraits were recovered unchanged from the user's saved Reecod visual review. Melkisedeck's portrait was extracted unchanged from his previously supplied CV. His profile links to the user's supplied Instagram and LinkedIn accounts. No identity, portrait or account is invented.

Individual profiles use a 384px portrait column beside the biography from 1024px upwards. The text determines the row height, and the image follows that height up to a 480px cap, centered vertically for longer biographies. Smaller screens stack a centered 280px-wide, 350px-tall portrait above the text. These profile dimensions do not change the compact team listing cards.

The supplied OG Image Yoo360 OG 2.png is copied unchanged to `/brand/yoo360-og.png` and used by every public page, with its actual 576×303 dimensions and large Twitter preview metadata. The black rounded-square brand favicon remains separate from the share image. Search and messaging services choose when to refresh cached previews.

Canonical URLs use https://www.theyoo360.com, matching the established public hostname. East Africa is included in the studio copy and metadata without adding new hero text or inventing offices. All public crawlers are allowed, including search and AI search crawlers. No special AI schema or llms.txt is required. Indexing, favicon display and rankings depend on the search providers; Search Console ownership and sitemap submission still require the owner's account.

## Email setup

The ordering Site requires server-only `RESEND_API_KEY`, `PROJECT_ENQUIRY_FROM_EMAIL` (a verified sender) and `PROJECT_ENQUIRY_TO_EMAIL`. Optional `PUBLIC_PROJECT_EMAIL` enables Email us instead. The receiving business address and delivery service have not been supplied, so submissions are unavailable until these settings are added. No successful email delivery is claimed or simulated in production.

## Favicon

The supplied Brand Mark White image is embedded unchanged in a black rounded-square SVG composition and rendered as a 96px favicon PNG plus 180/192/512px icons. Stable favicon metadata is present on both home and enquiry pages. The homepage and icon are publicly crawlable. Google Search display depends on recrawling and is not guaranteed.

## Checks

- Original global styles, font loading, page composition and animation settings are retained.
- `node tests/project-enquiry.mjs` verifies honest client success/error handling.
- `node tests/search-readiness.mjs` verifies readable static content, route-specific metadata, structured data, asset references, crawler access and sitemap contents.
- `node tests/order-domain.mjs` checks official-domain order links, private indexing, static assets, the legacy icon URL and CSS isolation.
- Package entry, draft progress, payment retry and motion lifecycle checks cover the copied customer interface.
- `node tests/deployed-order-api.mjs --demo` is an opt-in live integration check that creates labelled demo records, stops before mutations if payments are live, and removes its 10 MB check upload.
- Main production build includes TypeScript validation and prerendered pages.
- Backend SQLite tests cover delivery receipts, validation, allowed origins, missing setup, failures, idempotency and hourly quotas.
- Existing order-flow integration checks verify payment and brief behavior remain intact.

Browser and physical-device QA are unavailable. Visual matching is based on retaining the original source, and the new form layout has not been verified in a browser. Payments remain in demo mode.

## Vercel deployment

This release is prepared for the existing Vercel project that serves theyoo360.com from its connected GitHub repository. `vercel.json` selects Vite, runs the complete `npm run build` command and publishes `dist`. The prerendered home, enquiry, team and profile pages are served as distinct static pages, with extensionless URLs and no trailing slash. There is no catch-all rewrite to the homepage, so profile metadata and the custom 404 remain distinct.

Confirm the existing GitHub repository, Vercel project, root directory and production branch before applying this release. Preserve the project's current domains and account settings. After the connected production branch is updated, verify the Vercel build and the real theyoo360.com pages, favicon, sharing image, sitemap and robots.txt. The customer ordering frontend is built separately into `/order-a-design` with its existing Poppins styling and animations. Its routes, progress links and private resume links stay on the official hostname. The fixed `/api/design-orders/*` rewrite forwards to the existing ordering Worker, retaining its database, uploads, per-order access keys and payment provider configuration. Private responses are not cached, and private customer pages are excluded from indexing. The authenticated staff workspace remains on the original ordering Site. Real payments and email delivery require the provider settings described above.

## October 2026 service and pricing release

The existing homepage composition, fonts, colors, image assets and motion settings are retained. The two hero actions are Discuss a project and Explore our work. The four existing service rows lead to Brand Strategy & Identity, Campaigns & Market Launches, Marketing Partnerships, and Websites & Digital Products. Video & Motion Production is reached through Campaigns and uses project enquiries without public rates.

The native partnership overview and four plan pages reproduce the supplied plan inclusions in readable HTML. Starter begins at $2,000 monthly and has no discount below that minimum. Growth, Scale and Enterprise retain the supplied commitment savings. Plan selection preselects the enquiry form. These enquiries create no subscription or charge; scope and agreement precede a monthly invoice.

New design orders use catalogue `2026-10-12`: logo $149.99, full visual identity $499.99, artwork $40 plus $20 print files, $20 copy and $19 rush delivery. Prices are integer cents and the existing 60%/100% payment choice is preserved. Accepted legacy orders retain their stored totals and original line prices. Obsolete clients cannot create an order without refreshing and reviewing current prices.

Project enquiries are now saved to a private inbox in the existing authenticated staff workspace. Email notification is optional when its provider settings are configured. The public form confirms a saved request, preserves inputs on failure and carries the selected service, plan and optional timeframe. Staff can review requests, update their status and compose an email reply. Request contents and the staff inbox are excluded from public indexing and require the existing staff authorization.

Verification includes exhaustive catalogue combinations and rounding, legacy display, protected enquiry persistence and status updates, demo order/payment/brief flows, public HTML/metadata and sitemap checks. Payment provider configuration remains unchanged; preview payments do not collect money.
