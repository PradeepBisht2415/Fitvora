# Fitvora — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** 21 November 2026  
**Status:** Build-ready specification (decisions requiring owner approval marked TBD)  
**Product:** Fitvora — personalized Indian home-food weight management  
**Initial market:** India  
**Platforms:** Responsive web app / installable PWA later

## 1. Executive summary

Fitvora is a premium, mobile-first wellness SaaS web app that helps adult members pursue realistic weight-loss or weight-gain goals using personalized Indian home-cooked meals, without supplements, medication, or crash diets. It begins as a founder-operated service with zero members, low operational overhead, and manual diet-plan review. The platform will support lead assessments without mandatory registration, two paid subscription tiers, member dashboards, progress tracking, support, and a founder admin portal.

**Business model:** Normal ₹499/month and Premium ₹999/month. Both tiers receive the **same standard of individualized diet planning**; Premium adds priority support, weekly check-ins, and additional guidance, not a different or inherently better diet.

**Critical boundary:** Fitvora is a general wellness and nutrition-support service, not a medical diagnosis or treatment platform. High-risk or complex health conditions must be flagged for qualified professional review rather than automatically prescribed diets. Never guarantee weight-loss results.

## 2. Goals and non-goals

### Goals
- Convert visitors into assessment completions, qualified leads, and paying members.
- Deliver practical, culturally familiar Indian home-food meal plans tailored to goals, preferences, and schedules.
- Give members a simple daily plan, alternatives, reminders, and progress visibility.
- Let a solo founder efficiently manage dozens of members with reusable meal templates.
- Protect sensitive health and progress-photo data by design.
- Keep implementation modular for future scale without prematurely building complex infrastructure.

### Non-goals for MVP
- Automated medical diagnosis, treatment, or therapeutic meal prescription.
- AI-generated diets published without human approval.
- Calorie counting via computer vision, wearable integrations, video consultations, community forums, or marketplace features.
- Native iOS/Android apps, multi-coach marketplace, or elaborate gamification.
- Supplements, fat burners, medicines, or crash-diet programs.

## 3. Target users and roles

| Role | Description | Permissions |
|---|---|---|
| Visitor | Prospective member browsing Fitvora | Public pages; begin/submit assessment without account |
| Member — Normal | Active ₹499/month subscriber | Own dashboard, assigned plan, weight/photos, standard support |
| Member — Premium | Active ₹999/month subscriber | Same diet functionality plus priority support, weekly check-ins, extra guidance |
| Admin | Founder / authorized operator | Review leads, manage members, meal library, diet plans, payments metadata, reminders, support |
| Future nutrition professional | Optional qualified reviewer | Limited assigned cases; only if enabled later |

Use friendly labels such as **Member**, **Your Journey**, **Health & Lifestyle Assessment**; avoid calling ordinary users “patients.”

## 4. Brand, UX, and design system

- Name: **Fitvora**.
- Look: premium interactive wellness SaaS, not a traditional clinic or generic diet blog.
- Palette: forest green `#075B2B`, fresh green `#2FAF37`, pale green `#EAF8E7`, warm cream `#FFFDF7`, white `#FFFFFF`; accessible dark text.
- Typography: modern sans-serif (e.g., Inter or Plus Jakarta Sans), large readable headings, restrained line lengths.
- Layout: responsive, mobile-first, spacious cards, subtle gradients, rounded corners, soft shadows, clear primary CTAs.
- Motion: subtle scroll reveals, hover transitions, progress-ring animation, chart transitions; honor `prefers-reduced-motion` and avoid motion-dependent functionality.
- Brand imagery: **one consistent female Indian wellness ambassador** across all relevant pages. Maintain the same face, messy-bun hairstyle, forest-green T-shirt with minimal white leaf emblem, black smartwatch, and proportions. Use a master approved image and reference asset variants; do not generate a new inconsistent person per page. Use text/buttons/prices as actual UI, not baked into images.
- Accessibility: WCAG 2.2 AA target, keyboard navigation, focus states, meaningful alt text, sufficient contrast, accessible form errors, 44px-ish touch targets.
- Performance: compressed WebP/AVIF images, responsive sources, lazy-loading below fold, minimize layout shift and heavy animations.

## 5. Information architecture and page inventory

| Page / route | Access | Primary content |
|---|---|---|
| `/` | Public | Hero with female character, benefits, how it works, loss/gain pathways, plan preview, CTA |
| `/how-it-works` | Public | Assessment → review → subscribe → plan → track journey |
| `/weight-loss` | Public | Sustainable weight-loss approach, sample Indian foods, CTA |
| `/weight-gain` | Public | Balanced weight-gain approach, sample Indian foods, CTA |
| `/plans` | Public | Normal/Premium comparison, transparent inclusions, FAQ, CTA |
| `/assessment` | Public | Multi-step assessment; save progress locally or with secure draft token |
| `/assessment/complete` | Public/token | Confirmation and next steps; no sensitive answers in URL |
| `/login` | Public | Email/password or passwordless sign-in; reset access |
| `/signup` | Public | Create account after assessment or before purchase |
| `/checkout` | Authenticated | Selected tier, payment summary, consent and payment handoff |
| `/dashboard` | Member | Today’s meals, timing, alternatives, progress summary, reminders |
| `/dashboard/meal-plan` | Member | Day/week meal schedule, portions, ingredients, substitutions |
| `/dashboard/progress` | Member | Weight entries, chart, photos, milestones |
| `/dashboard/support` | Member | Support inbox and priority tier labeling |
| `/dashboard/check-ins` | Premium | Weekly structured check-ins and guidance history |
| `/dashboard/subscription` | Member | Plan, billing history, renewal/cancel actions |
| `/dashboard/profile` | Member | Personal data, dietary preferences, notification settings, privacy controls |
| `/admin` | Admin | Overview: leads, active members, pending plans, check-ins, support |
| `/admin/assessments` | Admin | Review, risk flags, assign or reject/escalate |
| `/admin/members` | Admin | Search/filter member records and lifecycle |
| `/admin/meal-library` | Admin | Reusable home-food meal templates, tags, alternatives |
| `/admin/diet-plans` | Admin | Plan builder, assign, revise, version, publish |
| `/admin/support` | Admin | Conversations, priority queue, status |
| `/admin/subscriptions` | Admin | Provider-synced payment/subscription status |
| `/admin/reminders` | Admin | Notification templates and send history |
| `/privacy`, `/terms`, `/refund-policy`, `/contact` | Public | Required legal, contact and policy information |

For the earliest release, weight-loss and weight-gain content can share one reusable landing-page template, and admin pages can use a shared shell.

## 6. Core user journeys

### 6.1 Visitor to member
1. Visitor lands on homepage, chooses Lose Weight or Gain Weight.
2. Clicks **Start My Journey** and completes a multi-step assessment **without signing up**.
3. Receives confirmation that information is pending review; do not promise a plan or eligibility instantly.
4. Admin reviews suitability, requests clarification if needed, and marks `approved`, `needs_info`, or `not_suitable`.
5. Approved visitor receives secure invitation to create an account and choose Normal/Premium.
6. User accepts terms, privacy notice and applicable consents, completes payment.
7. Server verifies payment with provider webhook; subscription becomes active only after confirmed event.
8. Admin creates and publishes personalized meal plan; member sees plan-ready notification.
9. Member follows meals, records weight, requests substitutions, and contacts support.

### 6.2 Returning member
Sign in → dashboard → review today's meals and times → view portion/alternative → optionally log weight and photo → read support/check-in updates.

### 6.3 Admin workflow
Review new assessment → check health flags and preferences → approve/decline/refer → select reusable meal templates → customize portions/timings/alternatives → preview weekly plan → publish → monitor progress and support → revise with version history.

## 7. Functional requirements

Priority legend: **P0** must ship for paid MVP, **P1** next, **P2** future.

### FR-01 Public marketing website (P0)
- Hero: clear promise, no extreme claims; primary **Start My Journey** CTA.
- Sections: benefits, Indian home-cooked approach, loss/gain tracks, three-step process, Normal vs Premium, FAQ, founder/business contact.
- Show transparent prices in INR and whether taxes are included, if applicable.
- No fabricated testimonials, ratings, member counts, or before/after transformations when launching with zero clients. Use illustrative meal samples labeled as examples.
- SEO metadata, Open Graph previews, sitemap, robots.txt, analytics with consent as applicable.

**Acceptance:** Visitor can find the assessment and pricing in at most two taps; no misleading social proof.

### FR-02 Public health assessment (P0)
Step-by-step wizard with progress indicator, Back/Next, validation, and mobile keyboard-appropriate controls.

| Step | Fields | Notes |
|---|---|---|
| 1. About you | First name, email, phone (optional or required only if necessary), age/date of birth, gender optional | Adults 18+ only for initial version; collect minimum necessary |
| 2. Body and goal | Height cm, current weight kg, target direction, optional target weight, intended timeline | Explain safe/realistic goals; avoid promised outcomes |
| 3. Routine | Wake/sleep times, work shift, meal times, activity level, work type | Support overnight shifts and meals across midnight |
| 4. Food preferences | Vegetarian/eggetarian/non-veg, allergies, dislikes, regional preferences, budget, cooking access, number of meals | Allergy fields explicit and prominent |
| 5. Wellness screening | Relevant conditions, pregnancy/breastfeeding, medications affecting diet, history of disordered eating (sensitive, optional with clear purpose) | Minimize data, restricted access, refer flagged cases |
| 6. Review and consent | Editable summary, privacy notice, consent to process health data, submit | Consent separate from marketing opt-in |

- Save draft locally only with clear warning on shared devices; avoid storing sensitive answers in plain localStorage. Prefer short-lived encrypted server draft tied to an opaque token if draft persistence is needed.
- Validate ranges with clear errors but do not interpret them as diagnoses.
- CAPTCHA/rate limiting, abuse protection, duplicate-lead handling.
- Allow the user to request deletion of submitted data.
- Submission creates `assessment` with status `pending_review` and admin alert.

**Acceptance:** Complete assessment on a phone without account; admin can inspect and decide; no health answers in analytics, email subject lines, or URLs.

### FR-03 Suitability and safety review (P0)
- Manual admin screening before paid activation or meal-plan publication.
- Flag minors, pregnancy/breastfeeding, severe or complex medical conditions, major food allergies, eating-disorder concerns, or unsafe goal/timeline for professional review or out-of-scope response.
- Do not auto-reject solely because someone discloses a condition; provide respectful explanation and qualified referral where appropriate.
- General wellness disclaimer and urgent-care messaging when necessary; no emergency chat promises.
- Only qualified professionals should make condition-specific medical nutrition recommendations.

### FR-04 Authentication and authorization (P0)
- Managed auth (email/password or magic link); email verification, password reset, session expiry.
- RBAC: `visitor`, `member`, `admin`; Premium is an entitlement derived from active subscription, not a client-controlled role.
- Every member data query is scoped to the authenticated user; admin access server-enforced.
- Admin MFA mandatory; audit all sensitive admin actions.

### FR-05 Plans and payments (P0)

| Feature | Normal — ₹499/month | Premium — ₹999/month |
|---|---|---|
| Individualized Indian home-food meal plan | Included | Included — same planning quality |
| Portions, timings and meal alternatives | Included | Included |
| Dashboard and progress tracking | Included | Included |
| Basic support inbox | Included | Included |
| Priority support | — | Included |
| Weekly structured check-in | — | Included |
| Extra personalized guidance | — | Included |

- Payment gateway: Razorpay or equivalent Indian provider with supported subscription billing; verify provider capabilities and fees during implementation.
- Define renewal model (auto-renew versus manual renewal) **before launch**; show exact consent and cancellation terms.
- Handle created, authorized, paid, failed, refunded, cancelled, paused, expired and renewal events as supported by gateway.
- Never trust client-side success redirects alone; verify signatures and webhook events; idempotent processing.
- Display subscription start, next billing date, payment history and cancellation/refund policy.
- Define entitlement behavior for payment failure, cancellation and grace period in admin settings.
- Avoid storing full card details; use provider-hosted payment collection.

**Acceptance:** Failed payments do not activate access; duplicate webhooks do not duplicate entitlements; tier upgrades change support entitlements but not diet quality.

### FR-06 Meal template library and plan builder (P0)
- Meal template fields: name, meal type, vegetarian type, ingredients, serving unit, portion, preparation notes, regional tags, allergies, optional nutrition estimates with source, alternatives.
- Example templates: vegetable poha, dal-roti-sabzi, paneer bhurji, curd-rice, khichdi, eggs with roti, chana salad.
- Admin creates a plan for 7 days using template picker; edit serving sizes, time, substitutions and notes per member.
- Support local times and overnight schedules; store time zone and meal-day association explicitly.
- Plans have states `draft`, `published`, `archived`, and immutable version history after publication.
- Members see only published plans assigned to them.
- Never claim exact calories/macros unless nutrition data is calculated from defensible ingredient quantities and reference sources; mark estimates as approximate.
- Substitution logic must respect allergies and dietary restrictions; manual review before publishing.

### FR-07 Member dashboard (P0)
- Greeting and current goal; today’s meals with time, portion, alternatives and preparation notes.
- Clear states: awaiting review, awaiting payment, plan being prepared, plan active, subscription expired.
- Current weight, last update, optional progress visualization; no shame-based labels.
- Reminders can be toggled; do not require push notifications for MVP.
- Link to support, subscription, preferences.

### FR-08 Progress tracking (P0 weight; P1 photos)
- Member adds weight with date/time; validate and prevent accidental duplicates; allow correction/deletion.
- Weight chart with selectable 7/30/90-day views when enough data exists.
- Compare to personal baseline, not unrealistic universal targets.
- P1: optional progress photo upload with explicit consent, private object storage, file type/size validation, malware scanning where available, signed URLs, user deletion, no public gallery.
- No AI body-image analysis or unsolicited appearance judgments.

### FR-09 Support and check-ins (P0 basic; P1 premium workflow)
- MVP: authenticated ticket-style messaging with message thread, unread badge, admin inbox, status (`open`, `waiting`, `closed`).
- Premium priority: separate queue ordering and visible tier badge; no guaranteed response SLA until the business can deliver it.
- P1: weekly check-in form (weight optional, appetite, adherence, energy, challenges, free-text), admin feedback and follow-up history.
- P1: saved guidance snippets and follow-up reminders.
- Do not imply 24/7 clinical support.

### FR-10 Admin operations (P0)
- Summary cards: new assessments, pending approvals, active members, plans to publish, open support tickets, renewals due.
- Member list with search, status, tier, last plan update and last check-in.
- Assessment review with decision notes and audit log.
- Meal template CRUD, diet plan editor, member assignment and preview.
- Subscription status synced from payment provider; manual overrides restricted and audited.
- Reminder templates and event log; start with email or dashboard notifications.
- CSV export of non-sensitive business metrics; sensitive export restricted and audited.
- Empty-state UX for launch: “No members yet” with actionable next step, not dummy customer data.

### FR-11 Notifications (P1)
- Transactional: assessment submitted, review decision, payment confirmed, plan published, subscription renewal/failure.
- Meal reminders: member opt-in; timezone-aware and quiet-hour aware; choose email first, push/WhatsApp only after provider setup and consent.
- Delivery attempts, retry policy, opt-out controls and deduplication.
- No sensitive health details in SMS/WhatsApp/email previews.

### FR-12 Privacy, consent and account management (P0)
- Clear privacy policy identifying data categories, purposes, processors, retention, deletion process, contact information and any cross-border transfers.
- Record consent version, timestamp and purpose; separate optional marketing consent.
- Provide access/correction/deletion request workflow; define legal retention exceptions and deletion timelines with counsel.
- Avoid unnecessary collection of Aadhaar, government IDs, precise location or extensive medical history.
- Obtain India-specific legal review for DPDP Act/rules applicability, implementation timelines, consumer protection, advertising claims, and GST/payment compliance before production.

## 8. Suggested technical architecture

**Recommended low-cost stack** (adjust if AI coding tool has strong preferences):
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion used sparingly.
- Backend: Next.js server actions/API routes for MVP, Zod validation, service-layer modules.
- Database: Supabase Postgres with Row Level Security, migrations and indexes.
- Auth: Supabase Auth with verified email; admin MFA.
- Storage: private Supabase Storage buckets for progress photos; signed short-lived access URLs.
- Payments: Razorpay subscription/payment APIs, server-side verification and webhooks.
- Email: transactional email provider (e.g., Resend) subject to service availability; server-side templates.
- Charts: Recharts or equivalent accessible charts.
- Hosting: Vercel or comparable platform, environment secrets, managed logs.
- Monitoring: error reporting, uptime checks and sanitized application logs.

**Architecture principles:** one modular monolith initially; isolate auth, assessments, diet plans, billing, support and notifications into separate modules. No microservices or custom AI agent required at launch. Keep payment/provider adapters swappable.

## 9. Data model (initial relational schema)

| Table | Key fields / relationships |
|---|---|
| `profiles` | `id` (auth FK), name, email, phone, timezone, created_at |
| `assessments` | `id`, nullable `user_id`, encrypted/contact reference, goal, height, weight, routine JSON, food preferences JSON, sensitive screening JSON, consent version, status, submitted_at |
| `assessment_reviews` | `id`, assessment_id, admin_id, decision, flags, notes, reviewed_at |
| `memberships` | `id`, user_id, lifecycle_status, joined_at |
| `plans_catalog` | `id`, code (`normal`/`premium`), price_paise, currency, active |
| `subscriptions` | `id`, user_id, plan_id, provider_customer_id, provider_subscription_id, status, current_period_start/end, cancel_at_period_end |
| `payment_events` | `id`, provider_event_id UNIQUE, type, verified, processed_at, sanitized_payload |
| `meal_templates` | `id`, title, meal_type, ingredients JSON, default_portion, dietary_tags, allergen_tags, alternatives JSON, active |
| `diet_plans` | `id`, user_id, version, status, effective_start, effective_end, created_by, published_at |
| `diet_plan_meals` | `id`, diet_plan_id, day_index/date, local_meal_time, template_id, custom_portion, notes, alternatives JSON |
| `weight_entries` | `id`, user_id, weight_kg, recorded_at, created_at |
| `progress_photos` | `id`, user_id, private_storage_path, captured_at, consent_at, deleted_at |
| `support_threads` | `id`, user_id, status, priority, created_at |
| `support_messages` | `id`, thread_id, sender_id, body, created_at, read_at |
| `check_ins` | `id`, user_id, week_start, answers JSON, admin_response, status |
| `notifications` | `id`, user_id, channel, template_key, status, scheduled_at, sent_at |
| `consent_records` | `id`, user_id or assessment_id, purpose, policy_version, granted_at, revoked_at |
| `audit_logs` | `id`, actor_id, action, entity_type, entity_id, timestamp, redacted_metadata |

**Implementation notes:** monetary values in integer paise; UUIDs; UTC timestamps plus IANA time zones; soft-delete only where appropriate; DB constraints and FK indexes; minimize unstructured sensitive JSON where future filtering is needed. Store unauthenticated assessments via securely scoped access token and link to verified account after invitation; do not rely on matching email alone. Row Level Security: members read/write only their own permitted records; admin-only access enforced by server-side role checks and restrictive policies. Never expose service-role keys to browsers.

## 10. API / server contract outline

| Method / endpoint | Purpose | Access |
|---|---|---|
| `POST /api/assessments` | Submit public assessment | Public, rate-limited |
| `GET /api/assessments/:token/status` | Limited submission status | Secure opaque token |
| `POST /api/admin/assessments/:id/review` | Review suitability | Admin |
| `POST /api/billing/checkout` | Start selected plan checkout | Verified user |
| `POST /api/webhooks/payments` | Verify and process provider event | Provider signature |
| `GET /api/me/dashboard` | Current meals and summary | Member |
| `GET /api/me/diet-plan` | Published assigned plan | Member |
| `POST /api/me/weight` | Record weight | Member |
| `GET /api/me/progress` | Weight history | Member |
| `POST /api/me/support/messages` | Send support message | Member |
| `POST /api/admin/meal-templates` | Create template | Admin |
| `POST /api/admin/diet-plans` | Create draft plan | Admin |
| `POST /api/admin/diet-plans/:id/publish` | Publish validated plan | Admin |
| `GET /api/admin/overview` | Aggregate operational counts | Admin |

All endpoints must validate inputs, enforce authorization and use structured errors. Prefer server actions for internal forms where practical; these route names represent contracts, not a requirement to duplicate server actions.

## 11. Subscription and lifecycle state rules

- Assessment: `draft` → `pending_review` → `needs_info` / `approved` / `not_suitable`.
- Membership: `invited` → `registered` → `active` → `paused` / `inactive`.
- Subscription: provider-authoritative state; access determined by verified billing event and explicitly configured grace rules.
- Diet plan: `draft` → `published` → `archived`; changes to published plans create new version.
- When subscription expires, retain account and permitted historical records per policy, but disable active plan entitlements and new support submissions as specified in terms.
- Upgrade Normal → Premium: preserve diet plan; unlock premium service features after confirmed payment.
- Downgrade Premium → Normal: preserve diet plan; schedule support entitlement change at configured billing boundary.

## 12. Delivery roadmap (build in order)

### Phase 0 — Foundation and decisions
**Goal:** Ready repository, UX foundations, operational policies.

Tasks: initialize Next.js/TypeScript project, Git, env configuration, linting, component library, design tokens, routes, database project, auth skeleton; approve master character assets; draft privacy/terms/refund and safety screening; decide billing renewal and cancellation policy.

**Exit:** App deploys to staging, branded mobile shell works, secrets isolated, no fake testimonials or demo users in production.

### Phase 1 — Public website + assessment
**Goal:** Collect real leads without requiring signup.

Tasks: homepage, how-it-works, loss/gain content, pricing, FAQ, assessment wizard, validations, consent capture, secure submission, admin-only assessment inbox and status handling, basic email alert.

**Exit:** New visitor completes assessment on mobile; founder sees it; unsafe/complex cases are flagged; form abuse protection works. **This is the first useful launch milestone even before accepting payments.**

### Phase 2 — Accounts + payments + manual onboarding
**Goal:** Convert approved leads into paid members.

Tasks: verified auth, invite/claim assessment, Normal/Premium checkout, provider webhook processing, subscription status, billing pages, member access rules, basic admin member list.

**Exit:** Both ₹499 and ₹999 purchase flows pass sandbox tests; failed payments deny paid access; cancellations and duplicate webhooks handled.

### Phase 3 — Diet library + personalized plan + member dashboard
**Goal:** Deliver the paid core service.

Tasks: reusable Indian meal templates, 7-day plan editor, portions/alternatives/timing, publish/version controls, dashboard daily meal cards, basic member preferences, empty/loading/error states.

**Exit:** Admin assigns unique plan; member sees correct meal schedule; substitutions respect allergies; plan unpublished edits are not visible. **Do not accept paid members until this phase is operational and the founder can fulfill the service.**

### Phase 4 — Progress + support + premium differentiation
**Goal:** Retain members and deliver tier promises.

Tasks: weight log and chart, standard support inbox, priority queue, weekly Premium check-ins, admin replies, subscription upgrade/downgrade; optional photo upload after privacy controls.

**Exit:** Normal and Premium share equal diet-plan functionality; premium service features are access-controlled; support messages stay private.

### Phase 5 — Notifications + reliability + growth
**Goal:** Improve operations as membership grows.

Tasks: opt-in meal reminders, renewal/failure emails, analytics dashboard, scheduled jobs, retries, error monitoring, accessibility/performance improvements, backups/restore drills, SEO refinement, optional PWA.

**Exit:** Notifications honor consent and timezone; admin can manage routine workflows without manual database edits; monitoring and restore verified.

### Phase 6 — Future scale (not MVP)
Optional multi-nutritionist roles, automation suggestions with human approval, AI support limited to general FAQs, multilingual UI, advanced recipe/nutrition database, mobile apps, wearable integration, cohort analytics. Each requires a separate scoped PRD and safety review.

## 13. Test plan and acceptance scenarios

1. Anonymous visitor can submit valid assessment without signup; invalid heights/weights and missing consent block submission.
2. Admin sees a new assessment; unapproved visitor cannot pay or view personalized plan.
3. User with medical risk flags is routed to manual review; no automated clinical plan generated.
4. Authenticated member cannot retrieve another member’s assessment, meal plan, photos or messages by changing IDs.
5. Normal checkout at ₹499 and Premium checkout at ₹999 behave correctly in gateway sandbox; test failed/duplicate/out-of-order webhook events.
6. Upgrading changes support priority and check-in access, **not** quality or existence of personalized diet plan.
7. Meal plan is shown only when published; revisions retain historical versions.
8. Allergy-marked ingredients are flagged before meal plan publication; substitutions reviewed.
9. Overnight worker sees meals in correct intended order despite crossing midnight.
10. Weight entries render accurate trend chart; users can correct/delete their own entries.
11. Photos are never public and private links expire; deletion works.
12. Screen-reader, keyboard-only and reduced-motion testing passes key flows.
13. Mobile tests at 320px, 375px, 768px, 1280px; no horizontal overflow.
14. New production database shows meaningful zero-member states; no fake KPIs.
15. Deletion requests, audit logging, backups and basic incident response tested before handling sensitive data at scale.

## 14. Non-functional requirements

- **Security:** TLS, managed auth, admin MFA, least privilege, RLS, secure headers, CSRF protections as appropriate, input validation, file upload restrictions, dependency scanning, rate limits, signed webhooks, secrets management.
- **Privacy:** data minimization, explicit purpose-based consent, encrypted at rest/in transit, private media, retention/deletion procedures, no sensitive information in analytics or logs.
- **Reliability:** idempotent webhooks and jobs, transactional writes for billing state, daily managed backups where supported, restore runbook, error alerting.
- **Performance targets:** mobile Lighthouse performance ≥85 on key public pages under realistic test conditions; LCP ≤2.5s at p75 where measurable; avoid heavy hero media.
- **Accessibility:** WCAG 2.2 AA target on primary user flows.
- **SEO:** index only public marketing pages; noindex private/admin/assessment completion pages.
- **Observability:** structured redacted logs, server errors, payment webhook failure queue, audit trails for admin actions.
- **Cost discipline:** use free/low-cost managed tiers initially within provider limits; monitor monthly costs; do not hardcode assumptions about provider free plans.

## 15. Metrics and reporting

- Acquisition: unique visitors, assessment starts, assessment completion rate.
- Funnel: eligible leads, approved leads, invited users, paid conversion rate.
- Revenue: active paid subscriptions by tier, gross collections, failed renewals, refunds, churn; distinguish collected cash from recurring revenue.
- Service: median time from payment to published plan, open support tickets, premium check-in completion, overdue reviews.
- Engagement: members viewing plans, weekly weight logging participation, reminder opt-in rate.
- Safety: flagged assessments reviewed, privacy requests resolved, unauthorized access alerts.
- Do not publish member counts or transformation claims without consent and evidence.

## 16. Suggested folder structure

```text
fitvora/
  app/
    (marketing)/
    (auth)/
    assessment/
    dashboard/
    admin/
    api/webhooks/payments/
  components/
    ui/
    marketing/
    assessment/
    dashboard/
    admin/
  features/
    auth/
    assessments/
    billing/
    meals/
    diet-plans/
    progress/
    support/
    notifications/
  lib/
    db/
    auth/
    validation/
    permissions/
    integrations/
  supabase/
    migrations/
    policies/
  public/
    images/fitvora-character/
  tests/
    unit/
    integration/
    e2e/
  docs/
    decisions/
    runbooks/
```

## 17. Implementation instructions for AI coding tool

1. Read the entire PRD and implement **only the requested phase**. Do not silently add future-phase features.
2. Before coding each phase, output a short task checklist, DB changes, affected routes and acceptance tests.
3. Build reusable typed components, strict TypeScript, validated server inputs, RLS and RBAC from day one.
4. Keep UI consistent with the Fitvora palette and **one approved female character**; use asset placeholders until approved files are supplied.
5. Use mock data only in development/test and label it clearly. Production must start with zero real clients and truthful empty states.
6. No fake payment success, hardcoded admin bypass, exposed service keys, or public storage of health photos.
7. Include SQL migrations, `.env.example` with no real secrets, README setup steps, seed templates (not fake clients), and automated tests.
8. Use provider sandbox for payments; production keys only via deployment secrets.
9. After each phase, run lint, typecheck, unit/integration/e2e tests as applicable; report exact pass/fail and remaining risks.
10. Stop at phase exit criteria and ask for approval before proceeding to the next phase.

## 18. Open decisions before production

- Will Fitvora operate as a general-wellness service only, and who is qualified to review any health-sensitive cases?
- Which specific medical/health situations will be out of scope at launch?
- Are subscriptions automatically renewed or manually repurchased? What is the exact cancellation/refund policy?
- What support hours and response targets can the founder reliably provide for Normal and Premium?
- What is the expected turnaround from successful payment to first published plan?
- Will progress photos be enabled at launch or postponed until Phase 4?
- Which contact channels are approved: in-app, email, WhatsApp, or others?
- What retention period and deletion process will apply to assessment data, support chats and progress photos?
- Is tax included in the advertised ₹499/₹999 price? Confirm with an accountant.
- Who owns and has rights to the consistent female brand-character assets?

## 19. Definition of launch-ready

Fitvora is ready to accept its first paying member only when the marketing site, assessment/safety review, secure account onboarding, verified billing, admin meal-plan publishing, member meal dashboard, basic support, core privacy/legal policies, and end-to-end test coverage are operational. Premium weekly check-ins and priority service must also be operational before selling Premium as described; otherwise defer that tier until ready.

**Build principle:** Launch with a trustworthy, human-managed wellness product and excellent user experience; automate only after the founder's real workflow is validated.
