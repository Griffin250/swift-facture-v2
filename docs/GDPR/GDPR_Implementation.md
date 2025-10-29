/*

# Goal:
## Create two modern, well-structured static pages for a SaaS web application (EU-based, GDPR-compliant)

Files to implement:
1. /privacy/page.tsx        → "Privacy Policy"
2. /terms/page.tsx          → "Terms & Conditions"

General Requirements:
- Built with Next.js App Router and React (TypeScript)
- Use TailwindCSS for styling (clean, readable layout)
- Include a hero header with page title + short intro
- Use structured sections with headings (h2, h3)
- Add "Last updated" date at top
- Add table of contents at the top (auto-scroll to sections)
- Include internal links between /privacy and /terms
- Add a back-to-home link and breadcrumb navigation

Visual Style:
- Professional, modern typography (Tailwind prose classes)
- Light background, readable margins
- Sticky sidebar or TOC (optional)
- Add a “Contact DPO” CTA at the bottom linking to /privacy#contact

----------------------------------------------------------
### Privacy Policy Page Content (EU & Global focus)
Purpose:
Explain how SwiftFacture (EU-based SaaS) collects, processes, and protects user data per EU GDPR and international standards.

Include these sections:
1. Introduction
   - Mention compliance with EU GDPR, ePrivacy Directive, and applicable global privacy laws (CCPA, LGPD).
   - Brief on who SwiftFacture is, what we do, and why privacy matters.

2. Data We Collect
   - Categories of personal data (account data, billing, usage logs, device info, optional analytics).
   - Explain no cookies or marketing trackers are used unless stated.

3. How We Use Data
   - Legal bases under GDPR (consent, contract performance, legal obligation, legitimate interest).
   - Example: Providing invoices, managing accounts, preventing fraud, improving services.

4. Data Retention
   - How long data is stored.
   - Mention compliance with accounting laws and retention policies.

5. Data Security
   - Encryption (at rest/in transit), role-based access, regular security audits.
   - Hosting in EU regions, optional international transfers with SCCs.

6. Data Sharing
   - With trusted subprocessors (e.g. Supabase, Stripe, AWS) under signed DPAs.
   - No sale of personal data.

7. International Data Transfers
   - Stored primarily in the EU.
   - When data leaves EU, protected by SCCs or adequacy decisions.

8. Your Rights
   - Right to access, rectify, erase, restrict, object, portability.
   - Right to withdraw consent.
   - How to make a Data Subject Request (via /privacy/consent-center or /privacy/data-requests).

9. Children’s Privacy
   - Service not intended for users under 16 (or local age of consent).

10. Changes to This Policy
    - How updates will be communicated.

11. Contact Us
    - Include DPO contact placeholder (e.g. privacy@swiftfacture.eu)
    - Include postal address placeholder.

Add at bottom:
- Button links: “Request My Data” → /privacy/data-requests
- “View Terms of Service” → /terms

----------------------------------------------------------
### Terms & Conditions Page Content
Purpose:
Define legal agreement between SwiftFacture and its users for EU & global compliance.

Include sections:
1. Introduction
   - Who we are (SwiftFacture)
   - Agreement acceptance when signing up or using the service.

2. Definitions
   - Terms like “Service”, “User”, “Account”, “Organization”.

3. Account Terms
   - Eligibility, security responsibility, MFA encouragement.

4. Use of Service
   - Allowed uses, prohibited uses (illegal activity, spam, misuse).

5. Payments & Billing
   - Reference to invoices, payment processors (Stripe, Supabase billing).
   - Refund policy or trial conditions.

6. Data Protection
   - Cross-link to Privacy Policy for GDPR handling.

7. Intellectual Property
   - Ownership of software, content, and trademarks.

8. Service Availability
   - Downtime disclaimer, maintenance notices.

9. Termination
   - Account closure, data deletion policy, and retention.

10. Liability & Disclaimers
    - Limitations of liability, warranty disclaimers, governing law (EU/EEA).

11. Governing Law & Jurisdiction
    - EU-based (e.g. Republic of Ireland or Germany).

12. Contact & Notices
    - How users can reach SwiftFacture for legal or support matters.

Add at bottom:
- Button links: “View Privacy Policy” → /privacy
- “Contact DPO” → /privacy#contact

----------------------------------------------------------
Extra features for both pages:
✅ Responsive layout (mobile-first)
✅ Smooth scroll for section anchors
✅ Use a small `TableOfContents` component
✅ Export a `Metadata` object for Next.js SEO (title, description)
✅ Optionally render markdown-based content from /docs/privacy-policy-template.md
✅ Add a “Last Updated” date in ISO format automatically

Deliverables:
- Full TypeScript + Tailwind page code for both pages
- Optionally include small reusable components:
   * `TableOfContents.tsx`
   * `SectionHeading.tsx`
   * `LegalLayout.tsx` (with breadcrumb and title)
- Include mock DPO contact info placeholder
- Text must sound formal, neutral, and GDPR-aligned (not casual)
- Keep privacy and terms content readable but legally complete
*/
