# MetroGym Website

WEDE5020 (Web Development — Introduction) — Portfolio of Evidence

## Student Information

- **Name:** Phawu Zotwa 
- **Institution:** Rosebank International (IIE)
- **Module:** WEDE5020 — Web Development (Introduction)
- **Assessment:** Portfolio of Evidence (PoE)

## Project Overview

MetroGym is a functional fitness and CrossFit-style training gym located on Cape Road, Gqeberha, founded in 2016 by Asavela Kahla. This repository contains the source code for MetroGym's first official website, built as the practical component of the WEDE5020 Portfolio of Evidence. The site is being developed across three parts:

- **Part 1 — Building the Foundation:** project planning, research, and initial HTML structure. *(complete)*
- **Part 2 — Designing the Visuals:** CSS styling and responsive design. *(current stage)*
- **Part 3 — Adding Functionality and SEO:** JavaScript interactivity and SEO optimisation. *(to follow)*

## Website Goals and Objectives

- Increase the number of free trial class bookings generated online.
- Provide an informative, always-available source for class schedules, pricing, and location, reducing repetitive phone/walk-in enquiries.
- Build community credibility through consistent, professional branding.

**Key Performance Indicators (KPIs):**

- Number of trial-class bookings submitted via the enquiry form per month.
- Number of unique visitors to the services/schedule page.
- Enquiry form completion rate.

## Key Features and Functionality

- Responsive, mobile-first layout with a sticky navigation header and a CSS-only collapsible menu on small screens.
- Homepage hero section with a clear call-to-action to book a free trial.
- About page detailing MetroGym's history, mission, and founder.
- Services page listing class types and the weekly class schedule.
- Enquiry page with a form for trial bookings and general questions.
- Contact page with address, hours, and contact details.
- Consistent industrial visual identity (charcoal, concrete, chalk, hot-orange) using 'Bebas Neue' and 'Inter' typefaces.

## Wireframes

Low-fidelity wireframes for all five pages were created to plan section order and layout before building the HTML/CSS. These are stored in the `wireframes/` folder:

| Page | Wireframe |
|---|---|
| Home | `wireframes/index-wireframe.png` |
| About | `wireframes/about-wireframe.png` |
| Classes | `wireframes/services-wireframe.png` |
| Contact | `wireframes/contact-wireframe.png` |
| Enquiry | `wireframes/enquiry-wireframe.png` |

Each wireframe blocks out the header/navigation, hero, content sections, and footer in the order they appear on the built page, so the final HTML/CSS can be checked against the original plan.

## Timeline and Milestones

> **Note:** the dates below are aligned to this module's actual submission history and the current working date. Confirm the Part 2 and Part 3 due dates against the official WEDE5020 module guide / POE brief before final submission, and adjust this table if they differ.

| Milestone | Part | Target Date | Status |
|---|---|---|---|
| Organisation research, sitemap, initial HTML structure | Part 1 | 14 Aug 2026 | ✅ Complete |
| Part 1 resubmission (file/folder & wireframe corrections) | Part 1 | 27 Aug 2026 | ✅ Complete |
| Part 1 formal feedback received (84/100) | Part 1 | 6 Sep 2026 | ✅ Complete |
| Part 1 corrective fixes (images folder, broken link, wireframes) | Part 1 fixes | 17 Sep 2026 | ✅ Complete |
| External stylesheet, default/typography/layout/decoration CSS | Part 2 | 17 Sep 2026 | ✅ Complete |
| Pseudo-classes and media queries / responsive design | Part 2 | 17 Sep 2026 | ✅ Complete |
| Descriptive commits, README, changelog, references update | Part 2 | 17 Sep 2026 | ✅ Complete |
| JavaScript functionality and SEO optimisation | Part 3 | *(confirm against POE brief)* | ⏳ Planned |

## Part 1 Details

Part 1 covers project initiation and planning:

- Selected MetroGym as the target organisation (approved fictional small business).
- Completed the Website Project Proposal (see `WEDE5020_Website_Project_Proposal.docx`, submitted separately), including a second proposal option for comparison.
- Conducted content research for each page (organisation history, class offerings, contact details).
- Set up the file and folder structure (root HTML files, `css`, `js`, `images`, and `wireframes` folders).
- Built the initial HTML structure for all 5 required pages using semantic tags (`header`, `nav`, `main`, `footer`), with descriptive comments and consistent indentation.
- Set up navigation links functioning correctly across all pages.
- Created and pushed the initial commits to this GitHub repository.

**Corrections made after Part 1 feedback (84/100):**

- Added the missing `images/` folder with real image files (it was referenced in earlier documentation but never actually populated, so it did not exist in the pushed repo).
- Added the missing `wireframes/` folder with low-fidelity wireframes for all five pages.
- Fixed a broken navigation link on `enquiry.html` (it pointed to `classes.html`, a file that does not exist — corrected to `services.html`).
- Added the missing `<main>` wrapper and header/footer comments to `enquiry.html` so its structure is consistent with the other four pages.
- Repaired `css/style.css`, which had been cut off mid-declaration in the previous push.
- Rewrote the timeline above to align with actual submission dates rather than generic planning dates.

## Part 2 Details

Part 2 covers CSS styling and responsive design, built on top of the existing `css/style.css`:

- **External stylesheet:** all five pages continue to share the single `css/style.css` file linked in each `<head>`.
- **Default CSS styles:** universal box-sizing reset, margin/padding reset, base `body` typography and background.
- **Typography styles:** Google Fonts 'Bebas Neue' (headings/brand) and 'Inter' (body text), fluid heading sizes with `clamp()`, consistent letter-spacing and text-transform rules.
- **Layout structure:** Flexbox for the header/nav and footer, CSS Grid for card and two-column layouts, a shared `.container` max-width wrapper.
- **Decoration & colour:** CSS custom properties for the brand palette (charcoal/concrete/chalk/orange), gradient and diagonal-stripe hero background, button and card styling, border accents.
- **Pseudo-classes:** `:hover` and `:focus`/`:focus-visible` on links and form fields (from Part 1), extended with `:active` on buttons, `:first-child`/`:last-child` on nav items, `:nth-child(even)` on cards, and `:nth-child(odd)` on table rows.
- **Media queries / breakpoints:** two breakpoints added — `max-width: 768px` (tablet) and `max-width: 480px` (small phones).
- **Responsive layout:** grid columns collapse to a single column on tablet-sized screens; section padding reduces at smaller sizes.
- **Responsive typography:** heading sizes step down at the 768px breakpoint in addition to the existing fluid `clamp()` scaling.
- **Responsive navigation:** a CSS-only checkbox/label toggle collapses the nav into a dropdown menu below 768px, with no JavaScript required (JavaScript interactivity is reserved for Part 3, per the existing `js/script.js` placeholder).
- **Responsive images:** all images use `max-width: 100%` and `height: auto` via the shared `.photo`/`img` rules, so they scale correctly at every breakpoint.

*(Part 3 details will be added here in a future submission/edit.)*

## Sitemap

```
                index.html
                (Homepage)
                     |
   ┌────────────┬────┴────┬────────────┐
about.html   services.html  enquiry.html  contact.html
 (About)    (Classes/Services) (Enquiry)   (Contact)
```

## Page Hierarchy

- Home (`index.html`) — top-level entry point, linked from every page.
  - About (`about.html`)
  - Services (`services.html`) — class types and weekly schedule.
  - Enquiry (`enquiry.html`) — trial booking / enquiry form.
  - Contact (`contact.html`)

## File and Folder Structure

```
metrogym/
├── index.html
├── about.html
├── services.html
├── enquiry.html
├── contact.html
├── css/
│   └── style.css
├── js/
│   └── script.js          (placeholder — populated in Part 3)
├── images/
│   ├── hero-training.jpg
│   ├── about-facility.jpg
│   ├── founder-asavela-kahla.jpg
│   ├── class-session.jpg
│   ├── gym-exterior.jpg
│   └── logo-mark.png       (placeholder photography — to be swapped for real gym photos)
└── wireframes/
    ├── index-wireframe.png
    ├── about-wireframe.png
    ├── services-wireframe.png
    ├── contact-wireframe.png
    └── enquiry-wireframe.png
```

## Changelog

- **17 September 2026** — Part 2: added full responsive CSS (media queries at 768px/480px, CSS-only responsive nav toggle, additional pseudo-classes, responsive images/typography). Fixed Part 1 issues: populated the missing `images/` folder, added `wireframes/` folder, corrected the broken `enquiry.html` nav link (`classes.html` → `services.html`), added the missing `<main>` wrapper to `enquiry.html`, repaired the truncated `css/style.css`, and rewrote the timeline to match actual dates. Updated this README and references.
- **14 August 2026** — Part 1: Restructured `classes.html` to `services.html` to match the required site structure. Added semantic `<main>` sectioning and descriptive comments to all pages. Added `js/` and `images/` folders. Wrote the Website Project Proposal (two organisation options). Wrote this README.
- **11 August 2026** — Initial HTML pages created (`index.html`, `about.html`, `contact.html`, `enquiry.html`, `classes.html`) and pushed to GitHub with a shared `css/style.css`.

## References

- Google Fonts (2026) *Bebas Neue* and *Inter* [font families]. Available at: https://fonts.google.com (Accessed: 14 August 2026).
- Mozilla Developer Network (2026) *HTML: HyperText Markup Language*. Available at: https://developer.mozilla.org/en-US/docs/Web/HTML (Accessed: 14 August 2026).
- Mozilla Developer Network (2026) *CSS: Cascading Style Sheets*. Available at: https://developer.mozilla.org/en-US/docs/Web/CSS (Accessed: 14 August 2026).
- Mozilla Developer Network (2026) *Using media queries*. Available at: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries (Accessed: 17 September 2026).
- Mozilla Developer Network (2026) *Pseudo-classes*. Available at: https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes (Accessed: 17 September 2026).
- W3Schools (2026) *HTML Forms*. Available at: https://www.w3schools.com/html/html_forms.asp (Accessed: 14 August 2026).
