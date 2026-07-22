import { config } from 'dotenv';
config({ path: '.env.local' });

import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from './schema';
import { calculateReadingTime, slugify } from '../utils/slugify';

const url = process.env.DATABASE_URL;
if (!url || url.includes('REPLACE_WITH')) {
  console.error('❌ DATABASE_URL not set in .env.local');
  process.exit(1);
}

const client = postgres(url, { ssl: 'require' });
const db = drizzle(client, { schema });

// ─── TOPICS ──────────────────────────────────────────────────────────────────
const TOPICS = [
  { slug: 'company-registration', name: 'Company Registration', description: 'Everything about forming your legal entity — LLC, C-Corp, sole proprietorship, and more.', icon: 'Building2', color: 'blue', orderIndex: 1 },
  { slug: 'funding', name: 'Funding & Investment', description: 'Bootstrapping, angel investors, VCs, crowdfunding, and grants — demystified.', icon: 'DollarSign', color: 'green', orderIndex: 2 },
  { slug: 'legal', name: 'Legal & Compliance', description: 'Contracts, IP, trademarks, employment law, privacy, and regulatory compliance.', icon: 'Scale', color: 'purple', orderIndex: 3 },
  { slug: 'hiring', name: 'Hiring & HR', description: 'Finding co-founders, hiring first employees, onboarding, equity, and culture.', icon: 'Users', color: 'orange', orderIndex: 4 },
  { slug: 'marketing', name: 'Marketing & Growth', description: 'Branding, SEO, content, paid ads, product-led growth, and retention.', icon: 'TrendingUp', color: 'pink', orderIndex: 5 },
  { slug: 'taxation', name: 'Taxation & Finance', description: 'Tax obligations, bookkeeping, financial modeling, and managing runway.', icon: 'Receipt', color: 'yellow', orderIndex: 6 },
  { slug: 'ai-tools', name: 'AI Tools for Startups', description: 'Leverage AI to automate operations, build products, and accelerate growth.', icon: 'Bot', color: 'cyan', orderIndex: 7 },
  { slug: 'scaling', name: 'Scaling & Operations', description: 'Processes, team structure, SaaS metrics, and building systems that scale.', icon: 'Rocket', color: 'red', orderIndex: 8 },
];

// ─── ARTICLES ────────────────────────────────────────────────────────────────
const ARTICLES = [
  // COMPANY REGISTRATION
  {
    topicSlug: 'company-registration',
    title: 'LLC vs C-Corp: Which Structure Is Right for Your Startup?',
    summary: 'The two most common startup entity types compared — taxation, liability, fundraising, and when each makes sense.',
    tags: ['llc', 'c-corp', 'entity-structure', 'legal'],
    difficulty: 'beginner' as const,
    stage: 'idea' as const,
    isPublished: true,
    isFeatured: true,
    content: `## LLC vs C-Corp: Choosing the Right Entity

Choosing your business entity is one of the first real decisions you'll make as a founder. Get it wrong and you'll spend thousands fixing it later. Here's what actually matters.

## The Core Difference

An **LLC (Limited Liability Company)** is a flexible structure that offers liability protection with pass-through taxation. An **C-Corporation** is the gold standard for venture-backed startups — it allows for multiple share classes, stock options, and is the only structure most VCs will invest in.

## When to Choose an LLC

- You're building a lifestyle business or consulting firm
- You plan to bootstrap indefinitely
- You have co-founders who want proportional profit sharing without complex cap tables
- You're in a business that doesn't require outside investment

**Tax implication:** LLC profits "pass through" to your personal return and are subject to self-employment tax (15.3% on the first ~$170k). This can actually cost more than a C-Corp at early stages.

## When to Choose a C-Corp

- You plan to raise venture capital (VCs almost exclusively invest in C-Corps)
- You want to issue stock options to employees (requires a 409A valuation)
- You plan to go public someday
- You want to retain earnings in the company at the corporate tax rate (21%) rather than paying personal income tax

**Delaware advantage:** 90%+ of venture-backed startups incorporate in Delaware, even if they operate elsewhere. Delaware has the most mature corporate law, a dedicated Court of Chancery for business disputes, and investors expect it.

## The Hidden Costs of Converting

Many founders start as an LLC thinking they'll convert later. The conversion from LLC to C-Corp is doable but costs $3,000–$10,000 in legal fees, can trigger tax events, and takes 4–6 weeks. Do it right the first time.

## Recommended Setup for Startups

If you're raising money or issuing equity to anyone: **Delaware C-Corp, incorporated immediately**.

Use [Stripe Atlas](https://stripe.com/atlas) ($500 flat fee), [Clerky](https://www.clerky.com) ($499), or [Mercury](https://mercury.com) (free with bank account) — these services handle everything remotely in 24–48 hours.

## Key Takeaways

- If you're raising VC: Delaware C-Corp, period
- If you're bootstrapping a small business: LLC is simpler and cheaper
- Converting later is expensive and stressful — decide upfront
- Use an online service like Stripe Atlas rather than a lawyer for basic incorporation
- Always get a Registered Agent (included with most incorporation services)`,
  },
  {
    topicSlug: 'company-registration',
    title: 'How to Register Your Startup: Step-by-Step Guide for 2024',
    summary: 'A practical walkthrough of registering a business entity, from choosing a name to getting your EIN.',
    tags: ['registration', 'ein', 'business-formation', 'checklist'],
    difficulty: 'beginner' as const,
    stage: 'idea' as const,
    isPublished: true,
    isFeatured: false,
    content: `## How to Register Your Startup: Complete 2024 Walkthrough

Registering your company doesn't have to be complicated. Here's the exact sequence of steps experienced founders follow.

## Step 1: Choose Your Business Name

Before filing anything, verify your name is available:
- Search the **USPTO trademark database** (trademarks.justia.com)
- Check the **Delaware Division of Corporations** name database
- Verify the **domain name** is available (use Namecheap or Vercel Domains)
- Search **Google and social media** for existing businesses with that name

**Pro tip:** Reserve your domain and social handles before you incorporate — the name might be taken the moment it becomes public record.

## Step 2: Choose Your State of Incorporation

For startups planning to raise money: **Delaware**.
For small local businesses: your home state.

If you incorporate in Delaware but operate in California, you'll need to foreign-qualify in California too (~$800/year). Factor this into your decision.

## Step 3: File Your Articles of Incorporation

You can do this yourself on the [Delaware Division of Corporations website](https://icis.corp.delaware.gov/ecorp/entitysearch/namesearch.aspx) for $89 + $50 for expedited processing, or use a service:

| Service | Cost | What's Included |
|---|---|---|
| Stripe Atlas | $500 | Corp, bank account, Stripe setup |
| Clerky | $499 | Corp, initial docs, cap table |
| Mercury | Free | Corp (with bank account opening) |
| Registered Agent | ~$50/year | Required by Delaware law |

## Step 4: Get Your EIN (Employer Identification Number)

Your EIN is your company's "Social Security number." It's free and takes 5 minutes:
1. Go to IRS.gov → Apply for EIN Online
2. Choose "Corporation" as entity type
3. You'll receive your EIN immediately online

**You need an EIN to:** open a business bank account, hire employees, file taxes, and set up payroll.

## Step 5: Open a Business Bank Account

Never mix personal and business finances — this "pierces the corporate veil" and can destroy your liability protection.

Recommended for startups:
- **Mercury** (free, startup-friendly, no minimum balance)
- **Brex** (free, good for early-stage companies)
- **SVB** (if you're VC-backed)

## Step 6: Issue Founder Shares

Do this immediately after incorporation. Delayed issuance creates tax complications. Each founder should:
1. Receive shares at the lowest possible price per share
2. File an **83(b) election** with the IRS within **30 days** of receiving restricted shares
3. Have a vesting schedule (standard: 4 years with 1-year cliff)

**The 83(b) election is critical.** Missing it is one of the most expensive mistakes a founder can make.

## Key Takeaways

- Delaware C-Corp is the default for fundable startups
- Use an online service — don't pay $3,000 for a lawyer to do this
- Get your EIN immediately after incorporation
- Open a separate business bank account on day one
- Issue founder shares and file your 83(b) election within 30 days`,
  },

  // FUNDING
  {
    topicSlug: 'funding',
    title: 'Pre-Seed to Series A: Understanding Startup Funding Rounds',
    summary: 'A clear breakdown of each funding stage — what investors expect, typical check sizes, and how to prepare.',
    tags: ['funding-rounds', 'pre-seed', 'series-a', 'venture-capital'],
    difficulty: 'intermediate' as const,
    stage: 'early' as const,
    isPublished: true,
    isFeatured: true,
    content: `## Understanding Startup Funding Rounds

Funding rounds have specific norms around check sizes, investor expectations, and what you need to show. Here's the complete picture.

## Pre-Seed ($50K–$2M)

**What it is:** The earliest institutional money, often from angels, pre-seed funds, or accelerators.

**What investors want to see:**
- A compelling founding team (domain expertise + execution ability)
- A large, real problem (not a vitamin, a painkiller)
- Early evidence: waitlist, LOIs, prototype, or first users
- A thesis for why this is the right time

**Typical sources:** Friends and family, angel investors, YC/Techstars, pre-seed micro-VCs (Precursor, Hustle Fund, First Round Seed)

**Instrument:** Usually a SAFE (Simple Agreement for Future Equity) with a valuation cap of $5M–$15M

## Seed Round ($1M–$5M)

**What it is:** The first proper institutional round. You have evidence of product-market fit signals.

**What investors want to see:**
- 3–6 months of revenue or strong growth metrics (for B2C: DAUs, retention; for B2B: ARR, NRR)
- Identifiable customer segments
- Clear hypothesis for how you'll use the capital

**Typical investors:** Seed funds (Sequoia Scout, a16z Seed), angels, some Series A funds doing seed

**Instrument:** Priced round or SAFE with cap of $15M–$30M

## Series A ($5M–$20M)

**The Series A is not about potential — it's about proof.**

What investors need to see:
- **B2B SaaS:** $1M–$3M ARR, strong NRR (>110%), clear ICP
- **Consumer:** Strong retention, 100K+ MAU, viable monetization
- Unit economics that suggest path to profitability
- A repeatable go-to-market motion

**Investors:** Traditional VCs (Sequoia, a16z, Benchmark, General Catalyst)

**Instrument:** Priced preferred stock round. You'll negotiate a full term sheet.

## The Funding Ladder

\`\`\`
Idea → Pre-Seed ($50K–$2M) → Seed ($1M–$5M) → Series A ($5M–$20M) → Series B ($20M–$100M)
\`\`\`

Each stage requires roughly 10x more evidence than the previous one.

## Common Mistakes

- **Raising too early:** Pre-revenue fundraising is harder than it's ever been (2024 market)
- **Wrong investor type:** A Series B fund won't lead your seed round
- **Too much dilution early:** Giving away 30%+ at pre-seed leaves no room for later rounds
- **Ignoring SAFEs:** Most founders don't read the post-money vs pre-money SAFE difference (it matters enormously for dilution)

## Key Takeaways

- Match your ask to your stage and evidence
- SAFEs are standard early-stage instruments — understand post-money vs pre-money caps
- Series A requires real metrics, not just a compelling story
- Most startups raise every 18–24 months — plan your milestones accordingly
- Get warm introductions to investors whenever possible — cold outreach success rate is <1%`,
  },
  {
    topicSlug: 'funding',
    title: 'How to Write a Startup Pitch Deck That Actually Gets Meetings',
    summary: 'The 10 slides every investor expects, what to include in each, and the common mistakes that kill deals.',
    tags: ['pitch-deck', 'fundraising', 'investors', 'presentation'],
    difficulty: 'intermediate' as const,
    stage: 'early' as const,
    isPublished: true,
    isFeatured: false,
    content: `## How to Write a Pitch Deck That Gets Meetings

A pitch deck doesn't close deals — it gets you the meeting. Your job is to make the investor curious enough to want a conversation. Here's what that looks like.

## The 10 Essential Slides

### 1. Cover Slide
Company name, one-line description, your contact info. That's it. Don't clutter it.

**Example:** "Startup Navigator — AI-powered knowledge platform for founders"

### 2. Problem
Make the investor feel the pain. Use a specific story or striking statistic. One slide, maximum two bullet points.

**Bad:** "Founders face many challenges when starting companies"  
**Good:** "First-time founders waste an average of $15,000 on legal fees that could be avoided with better information"

### 3. Solution
Show your product, not just describe it. A screenshot or short demo GIF is worth more than three paragraphs.

### 4. Why Now?
What's changed in the market that makes this the right time? New technology (AI), regulatory change, behavior shift (remote work)? Investors who passed 5 years ago need to understand why they'd be wrong today.

### 5. Market Size
TAM/SAM/SOM — but make it credible. Investors are allergic to "$500B market" claims with no methodology. Bottom-up market sizing is more impressive than top-down.

### 6. Business Model
How do you make money? Keep it simple: "We charge $X/month per seat, with an average contract size of $Y"

### 7. Traction
This is the most important slide if you have it. Revenue, growth rate, key customers, retention. Use a simple chart. The slope matters more than the absolute number.

### 8. Team
Why is this team uniquely qualified to win this market? Domain expertise, prior exits, relevant work experience. Be specific.

### 9. Competition
Don't say "we have no competitors." Show a 2x2 matrix or competitive positioning chart. The question investors are asking: "why won't [big company] just build this?"

### 10. The Ask
How much are you raising? What will you use it for? What are the milestones you'll hit with this capital? (12–18 month runway minimum)

## Format Rules

- **10–12 slides maximum** — long decks don't get read
- **Dark background or light, never both** — pick a clean template
- **One key message per slide** — if you need to explain a slide, the slide has failed
- **No Comic Sans, ever**
- Send as PDF, not PowerPoint

## The Narrative Arc

The best decks tell a story: There's a big problem (2) → We have a unique solution (3) → The timing is perfect (4) → The market is huge (5) → We make money this way (6) → We're already winning (7) → Our team is the right one (8) → We need X to get to the next milestone (10).

## Key Takeaways

- A deck gets you the meeting; the meeting closes the deal
- Lead with traction if you have it — nothing beats real evidence
- Investors skim decks in 3 minutes — make every slide scannable
- Your team slide matters enormously at early stages
- Practice your verbal pitch until the deck is just a visual aid`,
  },

  // LEGAL
  {
    topicSlug: 'legal',
    title: 'Founder Vesting: Why It Matters and How to Set It Up',
    summary: 'Vesting schedules protect your company if a co-founder leaves. Here\'s the standard setup and common variations.',
    tags: ['vesting', 'co-founder', 'equity', 'legal'],
    difficulty: 'beginner' as const,
    stage: 'idea' as const,
    isPublished: true,
    isFeatured: true,
    content: `## Founder Vesting: The Protection Clause Every Startup Needs

Founder vesting is the single most important legal mechanism for early-stage startups. Yet most first-time founders set it up wrong — or skip it entirely.

## What Is Founder Vesting?

Vesting is a schedule by which founders "earn" their equity over time. If a co-founder leaves after 6 months, they don't walk away with 33% of your company — they leave with whatever percentage they've earned.

Without vesting, a co-founder who leaves early takes their full equity stake. You'll have a "dead equity" problem: a large block of shares owned by someone not contributing to the company, which creates problems when raising money and can poison future negotiations.

## The Standard Schedule

**4 years total, 1-year cliff**

- After 12 months (the "cliff"): 25% of shares vest at once
- After that: shares vest monthly (1/48th per month) for 36 more months
- If the co-founder leaves before the cliff: they vest nothing

This is the industry standard. Investors expect it. Don't invent something custom.

## Early vs. Late Vesting Start

**Vesting should start from your incorporation date**, not from when you close funding. Many founders make the mistake of backdating vesting to when they started working together informally — this is actually correct. Count time you've actually been working together toward the cliff.

## Single-Trigger vs Double-Trigger Acceleration

**Single-trigger acceleration:** Shares vest immediately upon acquisition. Problematic — it means acquirers have to pay for equity without getting the founders working for them.

**Double-trigger acceleration:** Shares vest upon acquisition AND if the founder is terminated without cause within 12 months of the acquisition. This is the standard and is acquirer-friendly.

Always use double-trigger. Investors will push back on single-trigger.

## The 83(b) Election: Don't Skip This

When you receive restricted shares (subject to vesting), the IRS lets you pay tax now on the full grant at the current low value, instead of paying tax as shares vest (when they're worth more).

**File within 30 days of share issuance.** The election is a simple one-page form mailed to the IRS. If you miss this window, you cannot file it retroactively and could owe significant taxes as your company grows.

Missing the 83(b) is one of the most expensive mistakes founders make. Set a calendar reminder.

## Common Vesting Questions

**Q: What if one co-founder contributed more before incorporation?**  
A: Give them a larger initial equity stake, but still put all shares on the same vesting schedule going forward.

**Q: Can we change vesting terms later?**  
A: Yes, but it requires board and shareholder approval. Do it right the first time.

**Q: Does vesting apply to solo founders?**  
A: Investors often require solo founders to have vesting too. It protects the company if the founder becomes incapacitated.

## Key Takeaways

- Use 4-year vesting with a 1-year cliff — don't deviate without good reason
- File your 83(b) election within 30 days of receiving restricted shares
- Use double-trigger acceleration, not single-trigger
- Start vesting from the date you began working together, not from funding
- Document everything in a Restricted Stock Purchase Agreement (RSPA)`,
  },
  {
    topicSlug: 'legal',
    title: 'IP Assignment: Why Every Employee and Contractor Must Sign One',
    summary: 'Intellectual property assignment agreements ensure your company owns what your team builds. This is non-negotiable.',
    tags: ['intellectual-property', 'contracts', 'employees', 'legal'],
    difficulty: 'intermediate' as const,
    stage: 'early' as const,
    isPublished: true,
    isFeatured: false,
    content: `## IP Assignment: The Contract That Protects Your Core Asset

Your startup's code, designs, processes, and trade secrets are its most valuable assets. An IP Assignment Agreement (also called a PIIA or CIIAA) ensures those assets belong to your company — not to the individual who created them.

## Why This Is Non-Negotiable

By default, in most jurisdictions, **the person who creates something owns it** — not the company. Without a signed IP assignment, your contractor could technically own the code they wrote for you.

This becomes catastrophic during due diligence. Every serious investor and acquirer will ask: "Does the company own all of its IP?" If the answer is "mostly" or "we think so," the deal is dead.

## Who Must Sign One

- All founders (yes, you too)
- Full-time employees (include in offer letter)
- Part-time employees
- Contractors and consultants
- Anyone who contributes to your codebase, designs, or processes

Sign **before work begins**, not after.

## What a PIIA Covers

1. **Assignment of IP:** All work product created during engagement belongs to the company
2. **Prior inventions exclusion:** Employee/contractor lists any pre-existing IP they retain (prevents later disputes)
3. **Non-solicitation:** Cannot poach employees or customers for a defined period
4. **Confidentiality:** Cannot disclose company secrets
5. **Moonlighting clause:** Disclosure of outside work that may conflict

## Common Mistakes

**Mistake 1: Not getting signatures before work starts**  
If you pay someone $50,000 to build your product and they never signed a PIIA, you have a serious problem. Courts can sometimes find implied assignment, but it's expensive to prove.

**Mistake 2: Using generic templates from the internet**  
Free templates from Google often don't include the prior inventions exclusion or aren't jurisdiction-specific.

**Mistake 3: Assuming employment agreements are enough**  
An employment agreement covers the working relationship. A PIIA specifically covers IP ownership. You need both.

**Mistake 4: Not covering contractors**  
Many founders only have employees sign. Your freelance developer's code is just as important.

## Templates and Tools

- **Clerky** provides a full set of startup documents including properly drafted PIIAs
- **Stripe Atlas** includes employee equity and IP templates
- **Orrick's startup forms** (free): [orrick.com/Total-Access/Tool-Kit](https://www.orrick.com/en/Total-Access/Tool-Kit)
- **NVCA model documents** for investor-related agreements

## Key Takeaways

- Every person who touches your product must sign an IP assignment agreement before starting
- Use templates from reputable startup law firms — not generic internet templates
- Include a prior inventions clause to prevent future IP disputes
- This is one of the first things VCs check during due diligence
- Retroactively getting signatures is messy — do it upfront`,
  },

  // HIRING
  {
    topicSlug: 'hiring',
    title: 'How to Hire Your First 5 Employees Without Making Expensive Mistakes',
    summary: 'The hiring process, offer letters, equity, and culture decisions that set the tone for your entire company.',
    tags: ['hiring', 'first-employees', 'offer-letter', 'culture'],
    difficulty: 'intermediate' as const,
    stage: 'early' as const,
    isPublished: true,
    isFeatured: false,
    content: `## Hiring Your First 5 Employees: A Founder's Guide

Your first five hires will define your company's culture, capability, and trajectory more than any other decision you make. Here's how to do it right.

## The Principle: Hire Slow, Fire Fast

In the early stages, every hire is a massive bet. One wrong hire at a 10-person company can consume 40% of your management bandwidth and damage culture for a year. Go slowly.

## Who to Hire First

**Don't hire to fix your weaknesses — hire to extend your strengths.**

The most common mistake: a solo technical founder immediately hires a salesperson. Result: the technical founder spends 80% of their time managing the salesperson instead of building the product.

The right first hires are those who work **alongside** you, not those who require you to manage entirely new functions.

**Typical first hire sequence (B2B SaaS):**
1. Engineer #1 — to extend product velocity
2. Customer success / solutions engineer — to make customers successful
3. Engineer #2 — product continues to be primary value driver early
4. Head of Sales (only after you've closed 5–10 customers yourself)
5. Marketing — only after you have something worth marketing

## Sourcing Candidates

- Your personal network (best source for first 5 hires)
- LinkedIn (reach out directly, personalize every message)
- Twitter/X technical communities
- Alumni networks
- AngelList / Wellfound
- Referrals from your existing team (best signal)

**Avoid expensive recruiters at this stage** — focus on your network.

## The Hiring Process

1. **Phone screen** (30 min): Communication skills, motivation, basic fit
2. **Technical/skills assessment**: Paid work sample or take-home project
3. **Team interviews**: 3–4 people, structured questions, debrief immediately after
4. **Reference checks**: Call the references, don't just email them
5. **Offer**

## Equity for Early Employees

Standard equity ranges for early hires:

| Role | Equity Range |
|---|---|
| Engineer #1 (pre-seed) | 0.5%–2.0% |
| Engineer #2–5 | 0.1%–0.5% |
| Head of Sales (seed) | 0.25%–0.75% |
| VP Engineering (Series A) | 0.1%–0.3% |

Use the [Carta equity calculator](https://carta.com) for benchmarks. All employee equity should be on a 4-year vest with 1-year cliff.

## The Offer Letter

An offer letter should specify:
- Salary and start date
- Equity grant (number of shares, vesting schedule, exercise price)
- Employment type (full-time, at-will)
- Reference to IP assignment agreement (required to sign before start)

**Have a startup lawyer review your first offer letter.** The template you use will be reused 50 times — getting it right once is worth it.

## Key Takeaways

- Your first 5 hires will define your culture — take your time
- Hire to extend strengths, not cover weaknesses
- Use structured interviews with a consistent rubric
- All employees should be on 4-year vesting with 1-year cliff
- Get a signed IP assignment before day one, always`,
  },

  // MARKETING
  {
    topicSlug: 'marketing',
    title: 'Content Marketing for Startups: Build Authority Before Spending on Ads',
    summary: 'Why content is the most cost-effective acquisition channel for early-stage startups and how to build a system that compounds.',
    tags: ['content-marketing', 'seo', 'inbound', 'growth'],
    difficulty: 'beginner' as const,
    stage: 'early' as const,
    isPublished: true,
    isFeatured: false,
    content: `## Content Marketing for Startups: The Compounding Growth Engine

Paid ads stop working the moment you stop paying. Content keeps working for years. For early-stage startups with limited capital, content marketing is the highest-ROI channel available.

## Why Content Works Especially Well for Startups

1. **Zero variable cost** — Writing a blog post costs the same whether 10 people or 10,000 people read it
2. **Compounds over time** — Posts written today generate traffic for years
3. **Builds trust** — Readers who learn from your content trust you before they've spent a dollar with you
4. **Fuels every other channel** — Newsletters, social media, sales enablement all get better with good content

## The Content Flywheel

\`\`\`
Write useful content → Rank on Google → Readers discover your product → 
Customers share content → More backlinks → Higher rankings → More readers
\`\`\`

## Finding Your Content Angle

The best startup content occupies the intersection of:
- **What your customers search for** (keyword research)
- **What your competitors aren't covering** (gap analysis)
- **What you're uniquely qualified to explain** (founder expertise)

Use tools like Ahrefs, Semrush, or the free Google Search Console to find what your audience searches for.

## Content Types That Work

**SEO articles:** Target specific search queries. Long-form (1,500+ words), comprehensive, updated regularly.

**Comparison pages:** "[Product A] vs [Product B]" — these have high purchase intent and are often underserved.

**Tutorials/how-tos:** "How to do X with Y" — builds awareness and demonstrates product value simultaneously.

**Case studies:** Real customer outcomes. The most powerful content for B2B sales.

**Opinion/thought leadership:** Takes time to build but creates community and press attention.

## Distribution Is Half the Work

Writing the content is 50% of the work. Distribution is the other 50%:
- Post to relevant communities (Reddit, Hacker News, IndieHackers, LinkedIn)
- Email your list (start one now, even if it's 50 people)
- Repurpose into Twitter/LinkedIn threads
- Reach out to podcasts and newsletters in your space

## Getting Started Without a Team

You don't need a content team. You need:
1. **One anchor post per week** — 1,000+ words, solves a specific problem
2. **A consistent publishing schedule** — even monthly is fine to start
3. **An email list** — use ConvertKit, Beehiiv, or Substack from day one

The worst content strategy is "we'll do it when we have time." Content requires consistent investment to compound.

## Key Takeaways

- Start a blog and email list before you have a marketing budget
- Target long-tail keywords your larger competitors ignore
- Case studies are your most powerful B2B content type
- Distribute every piece — writing without distribution is wasted effort
- Content compounds — posts from year 1 still drive leads in year 3`,
  },
  {
    topicSlug: 'marketing',
    title: 'Product-Led Growth: How to Make Your Product Your Best Salesperson',
    summary: 'PLG is the growth strategy behind Slack, Figma, and Notion. Here\'s how to implement it as an early-stage startup.',
    tags: ['product-led-growth', 'plg', 'free-trial', 'growth', 'saas'],
    difficulty: 'intermediate' as const,
    stage: 'early' as const,
    isPublished: true,
    isFeatured: true,
    content: `## Product-Led Growth: The Strategy Behind Slack, Figma, and Notion

Product-Led Growth (PLG) means your product is your primary acquisition, retention, and expansion engine. Users experience value before they ever talk to a salesperson.

## The Core PLG Insight

Traditional SaaS: Marketing → Sales → Product → Customer success  
PLG SaaS: Product → User → Viral → Revenue

In PLG, the product does the selling. This is why Slack grew to $7B without a sales team, and why Figma could charge designers who then convinced their companies to pay.

## The Three PLG Motions

**Free trial:** Full product access for 14–30 days, then paywall. Works when users can experience full value quickly. (Basecamp, Airtable)

**Freemium:** Core product is free forever, premium features require payment. Works when free users create value for paid users or when there's natural expansion. (Notion, Dropbox, Loom)

**Open source:** Core is free and open. Enterprise/managed version is paid. (GitLab, Hashicorp, Sentry)

## The Time-to-Value Problem

PLG lives or dies on **Time to Value (TTV)** — how long it takes a new user to experience your product's core value.

If your TTV is > 30 minutes, most users will churn before they experience value. Your onboarding must be ruthlessly optimized.

**Measure your TTV:**
1. Define your "aha moment" (the moment a user first gets real value)
2. Track the median time from signup to aha moment
3. Optimize to reduce this time

For Slack, the aha moment is sending and receiving messages with teammates. For Dropbox, it's syncing a file across two devices.

## Building the PLG Funnel

\`\`\`
Acquisition (sign-ups) → Activation (aha moment) → Retention (weekly/monthly active) → Revenue (conversion/expansion) → Referral (inviting others)
\`\`\`

Most startups obsess over acquisition. PLG companies obsess over **activation**.

## Viral Loops That Work

- **Collaboration:** Inviting teammates to collaborate (Figma, Notion, Slack)
- **Sharing:** Exported content with branding (Canva, Loom video watermark)
- **Integrations:** Your product becomes part of their workflow
- **Network effects:** The product gets more valuable as more people use it

## The PLG Metrics to Track

| Metric | What It Measures |
|---|---|
| TTV (Time to Value) | Onboarding efficiency |
| Activation rate | % of signups who hit aha moment |
| DAU/MAU ratio | Engagement depth (>25% is good) |
| Product Qualified Leads (PQLs) | Users ready for sales outreach |
| Expansion MRR | Revenue growth from existing users |

## Key Takeaways

- PLG only works if your product delivers obvious value quickly
- Obsess over Time to Value — it's the most important onboarding metric
- Build viral loops into the product from the beginning
- Freemium works when free users create value, not just when free attracts users
- PLG and sales-led growth aren't mutually exclusive — combine them as you scale`,
  },

  // TAXATION
  {
    topicSlug: 'taxation',
    title: 'Startup Tax Basics: What Every Founder Must Know in Year One',
    summary: 'The essential tax obligations for a new startup — federal, state, payroll, and the deductions you shouldn\'t miss.',
    tags: ['taxes', 'startup', 'deductions', 'payroll-tax', 'year-one'],
    difficulty: 'beginner' as const,
    stage: 'idea' as const,
    isPublished: true,
    isFeatured: false,
    content: `## Startup Tax Basics: Year One Survival Guide

Taxes are the thing founders most commonly mess up in year one. Not because they're complicated — but because they're easy to ignore until they become a crisis.

## Your Core Tax Obligations as a C-Corp

**Federal corporate income tax:** 21% flat rate on profits. If you're burning cash (most startups), you owe $0 in year one. But you still need to file.

**State taxes:** Varies by state. Delaware charges an annual franchise tax (minimum $400/year, can be much higher based on authorized shares — choose the "assumed par value capital method" to minimize this).

**Payroll taxes:** As soon as you pay yourself or any employee, you're responsible for:
- Federal income tax withholding
- Social Security (6.2% employer, 6.2% employee)
- Medicare (1.45% employer, 1.45% employee)
- State income tax withholding
- State unemployment (varies)

Use a payroll service — **Gusto** ($6/employee/month) handles all of this automatically including filings and W-2s.

## The Big Deductions You Might Miss

**R&D Tax Credit:** If you're building software, you likely qualify for the R&D credit. This is a dollar-for-dollar reduction of your tax liability (not just a deduction). Early-stage startups can apply it against payroll taxes. This can be worth $50,000–$250,000 depending on your engineering payroll.

**Section 1202 QSBS Exclusion:** If your company is a C-Corp and you hold shares for 5+ years, gains up to $10M (or 10x your investment) are **completely excluded from federal capital gains tax**. This is one of the most valuable tax benefits in the US tax code. Ensure your company qualifies from day one.

**Home office deduction:** If you work from home, a portion of your rent/mortgage, utilities, and internet is deductible.

**Equipment and software:** Laptops, SaaS tools, cloud infrastructure — all deductible business expenses.

## Net Operating Losses (NOLs)

If your startup loses money in year one (almost certain), those losses become NOLs that can offset future profits. Keep meticulous records of every expense — your future profitable self will thank you.

## Quarterly Estimated Taxes

If you're paying yourself as an owner (not employee), the IRS expects quarterly estimated tax payments. Missing these results in penalties. Due dates: April 15, June 15, September 15, January 15.

## Finding a Startup Accountant

Regular accountants are not startup accountants. You need someone who:
- Understands R&D credits
- Has worked with venture-backed companies
- Knows Delaware franchise tax optimization
- Can advise on 83(b) elections and equity compensation

Recommended firms for early-stage: **Kruze Consulting**, **Pilot**, **Bench** (for bookkeeping).

## Key Takeaways

- File your federal return even if you owe nothing
- Start with Gusto for payroll — do not DIY payroll taxes
- Research the R&D Tax Credit — it's real money for software companies
- Make sure your company qualifies for QSBS from day one
- Keep every receipt from day one — expenses are deductible, but only if documented`,
  },

  // AI TOOLS
  {
    topicSlug: 'ai-tools',
    title: 'AI Tools Every Startup Should Be Using in 2024',
    summary: 'A curated list of AI tools across coding, marketing, operations, and customer support — with honest assessments of ROI.',
    tags: ['ai-tools', 'productivity', 'automation', 'llm', 'tools'],
    difficulty: 'beginner' as const,
    stage: 'idea' as const,
    isPublished: true,
    isFeatured: true,
    content: `## AI Tools Every Startup Should Be Using

AI has gone from experimental to essential. Here are the tools delivering real ROI for startups — organized by function.

## Engineering & Development

**GitHub Copilot ($19/month):** Autocompletion and code generation inside your editor. Increases developer productivity by 30–55% on measurable tasks. Non-negotiable for any engineering team in 2024.

**Cursor ($20/month):** AI-first code editor. Superior to Copilot for complex refactoring and understanding existing codebases. Many engineers are switching entirely.

**Vercel v0 (free tier):** Generate React components from plain English descriptions. Excellent for prototyping UI quickly.

## Writing & Content

**Claude (Anthropic) — $20/month:** Best for long-form writing, analysis, and tasks requiring nuanced judgment. The context window (200K tokens) is a major advantage for working with large documents.

**ChatGPT Plus ($20/month):** Best overall for versatility, code, and image generation. GPT-4o is fast and capable.

**Jasper ($49/month):** Content marketing focused. Good for teams producing high volumes of marketing copy with brand guidelines.

## Customer Support

**Intercom Fin (usage-based):** AI agent built on GPT-4. Handles 40–60% of support tickets automatically. Setup takes 30 minutes if your documentation is good.

**Zendesk AI:** Ticket summarization, suggested responses, and automated triage. Worth it if you're already on Zendesk.

## Operations & Productivity

**Notion AI (included with Notion):** Meeting summaries, document drafting, and Q&A over your knowledge base. High value if your team runs on Notion.

**Otter.ai ($16/month):** Real-time transcription and meeting summaries. Excellent for founders who spend significant time in meetings.

**Make (formerly Integromat) + AI modules:** Build complex automations that include AI steps without code. Powerful for automating repetitive workflows.

## Sales & Marketing

**Apollo.io (freemium):** AI-powered prospecting and outreach personalization. Find leads, get emails, automate sequences.

**Copy.ai ($49/month):** Marketing copy at scale. Best for teams producing lots of ad copy, social posts, and email campaigns.

**Perplexity Pro ($20/month):** Real-time research with citations. Useful for competitive analysis and market research.

## Where AI Doesn't Replace Humans Yet

- Strategic decisions and company direction
- Complex enterprise sales relationships
- Product design and user research
- Culture and team management
- Technical architecture decisions

## ROI Framework for AI Tool Evaluation

Before purchasing any AI tool, ask:
1. What task does it replace or accelerate?
2. How many hours per week does that task currently take?
3. At your hourly rate, is the subscription less than the time saved?
4. Is there a free tier to validate before committing?

## Key Takeaways

- GitHub Copilot or Cursor is mandatory for any technical team — the productivity gain is documented
- Start with tools that automate existing workflows, not tools creating new workflows
- AI customer support (Intercom Fin) has the highest measurable ROI for B2C products
- Most AI tools offer 14-day free trials — test before you commit
- The ROI of AI compounds: automating 1 hour/day = 250 hours/year`,
  },
  {
    topicSlug: 'ai-tools',
    title: 'Building RAG Systems: A Practical Guide for Non-ML Engineers',
    summary: 'Retrieval-Augmented Generation explained simply — how to build a knowledge base your LLM can search over.',
    tags: ['rag', 'vector-search', 'llm', 'openai', 'pgvector', 'ai-engineering'],
    difficulty: 'advanced' as const,
    stage: 'growth' as const,
    isPublished: true,
    isFeatured: false,
    content: `## Building RAG Systems: Practical Guide for Product Engineers

Retrieval-Augmented Generation (RAG) is how you give a large language model access to your own data without fine-tuning. It's the architecture behind most AI chatbots and knowledge bases built on top of GPT-4.

## Why RAG Instead of Fine-Tuning?

Fine-tuning teaches the model new knowledge permanently. RAG retrieves relevant knowledge at query time and injects it into the prompt. 

**Use RAG when:**
- Your knowledge base changes frequently
- You need to cite specific sources
- You need to keep data private (not sent to OpenAI for training)
- You want to update content without retraining

**Use fine-tuning when:**
- You need the model to respond in a specific style
- You're optimizing for specific task performance (classification, extraction)
- You need faster inference (smaller fine-tuned model vs GPT-4)

## The RAG Architecture

\`\`\`
[Documents] → [Chunker] → [Embedder] → [Vector DB]
                                              ↑
User Query → [Query Embedder] → [Similarity Search] → [Context]
                                                           ↓
                                               [LLM + Prompt] → [Answer]
\`\`\`

## Step 1: Chunking

Split your documents into chunks that fit in the context window. The right chunk size depends on your content:

- **800–1200 tokens** per chunk works for most use cases
- **Overlap chunks** by 100–200 tokens to avoid cutting context at boundaries
- **Chunk by semantic unit** (paragraph > sentence > character count)

\`\`\`python
def chunk_text(text: str, chunk_size: int = 800, overlap: int = 150) -> list[str]:
    paragraphs = text.split("\\n\\n")
    chunks = []
    current = ""
    for para in paragraphs:
        if len(current) + len(para) > chunk_size * 4 and current:
            chunks.append(current.strip())
            current = current[-overlap * 4:] + "\\n\\n" + para
        else:
            current = current + "\\n\\n" + para if current else para
    if current:
        chunks.append(current.strip())
    return chunks
\`\`\`

## Step 2: Embedding

Convert text to vectors using an embedding model:

\`\`\`typescript
import OpenAI from 'openai';

const openai = new OpenAI();

async function embed(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',  // 1536 dimensions, cheap
    input: text.replace(/\\n/g, ' '),
  });
  return response.data[0].embedding;
}
\`\`\`

**text-embedding-3-small** costs $0.02 per 1M tokens — embedding an entire knowledge base of 500 articles costs approximately $0.05.

## Step 3: Vector Storage

Store embeddings in **pgvector** (PostgreSQL extension):

\`\`\`sql
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding vector(1536),
  INDEX USING ivfflat (embedding vector_cosine_ops)
);
\`\`\`

pgvector supports cosine similarity, L2 distance, and inner product. Cosine similarity works best for semantic search.

## Step 4: Retrieval + Generation

\`\`\`typescript
async function ragQuery(userQuery: string): Promise<string> {
  const queryEmbedding = await embed(userQuery);
  
  const chunks = await db.execute(sql\`
    SELECT chunk_text, 1 - (embedding <=> \${queryEmbedding}) AS similarity
    FROM embeddings
    WHERE 1 - (embedding <=> \${queryEmbedding}) > 0.72
    ORDER BY embedding <=> \${queryEmbedding}
    LIMIT 5
  \`);
  
  const context = chunks.rows.map(c => c.chunk_text).join("\\n\\n");
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: \`Answer based on this context: \${context}\` },
      { role: 'user', content: userQuery },
    ],
  });
  
  return response.choices[0].message.content ?? '';
}
\`\`\`

## Key Takeaways

- RAG is easier than fine-tuning and works for 90% of knowledge base use cases
- Use text-embedding-3-small — it's 5x cheaper than ada-002 with similar quality
- pgvector in Supabase/Postgres is sufficient — you don't need Pinecone at early scale
- Cache RAG responses in Redis — most queries repeat, caching cuts costs 80%
- Aim for chunks of 800–1200 tokens with 150-token overlap`,
  },

  // SCALING
  {
    topicSlug: 'scaling',
    title: 'SaaS Metrics That Actually Matter: The Founder\'s Dashboard',
    summary: 'MRR, churn, NRR, LTV, CAC — explained clearly with formulas and the benchmarks that distinguish great companies from average ones.',
    tags: ['saas-metrics', 'mrr', 'churn', 'nrr', 'ltv', 'cac'],
    difficulty: 'intermediate' as const,
    stage: 'growth' as const,
    isPublished: true,
    isFeatured: true,
    content: `## SaaS Metrics That Actually Matter

Most SaaS dashboards track 40 metrics. Investors care about 6. Here's what actually matters, how to calculate it, and what "good" looks like.

## Monthly Recurring Revenue (MRR)

**Formula:** Sum of all monthly subscription revenue (normalize annual plans to monthly)

**Don't include:** One-time setup fees, professional services, non-recurring revenue

**Components to track separately:**
- **New MRR:** Revenue from new customers this month
- **Expansion MRR:** Revenue from upgrades/upsells to existing customers
- **Churned MRR:** Revenue lost from cancellations
- **Contraction MRR:** Revenue lost from downgrades

**Why it matters:** MRR is the heartbeat of your business. Growth rate matters more than absolute MRR at early stages.

## Customer Churn Rate

**Formula:** (Customers lost in period / Customers at start of period) × 100

**Benchmarks:**
- World-class: < 0.5% monthly (< 6% annually)
- Good: 0.5%–1% monthly
- Concerning: > 2% monthly (> 22% annually)

**The churn trap:** 2% monthly churn sounds small. It means you lose 22% of your customers every year. To grow at all, you must acquire 22% more customers just to stay flat.

## Net Revenue Retention (NRR)

**Formula:** (Starting MRR + Expansion MRR - Churned MRR - Contraction MRR) / Starting MRR × 100

**Why NRR > churn:** NRR tells you whether your existing customers are spending more or less over time. NRR > 100% means you can grow revenue even if you acquire zero new customers.

**Benchmarks:**
- World-class: > 130% (Snowflake hit 168%)
- Good: 110%–130%
- Acceptable: 100%–110%
- Concerning: < 100%

**What drives high NRR:**
- Usage-based pricing (customers pay more as they grow)
- Land and expand sales motion
- Strong product-led expansion
- Proactive customer success

## Customer Acquisition Cost (CAC)

**Formula:** Total sales + marketing spend / New customers acquired (in same period)

**Payback period:** CAC / Monthly Gross Margin per Customer = months to recover acquisition cost

**Benchmarks:**
- SMB SaaS: < 12 months payback
- Mid-market SaaS: < 18 months payback
- Enterprise SaaS: < 24 months payback

## LTV:CAC Ratio

**LTV Formula:** ARPU × Gross Margin % / Monthly Churn Rate

**LTV:CAC Benchmarks:**
- 3:1 is the minimum for a sustainable business
- 5:1+ is exceptional
- > 10:1 often means you're underinvesting in growth

## The Rule of 40

For mature SaaS companies: **Growth Rate % + Profit Margin % ≥ 40**

Examples:
- Growing 80% YoY with -40% margins: 80 + (-40) = 40 ✅
- Growing 20% YoY with 25% margins: 20 + 25 = 45 ✅
- Growing 15% YoY with 10% margins: 15 + 10 = 25 ❌

## The Metrics Dashboard Every Founder Needs

Track weekly:
- New MRR, expansion MRR, churned MRR
- Active users (daily/weekly/monthly)
- Trial conversion rate

Track monthly:
- NRR, logo churn
- CAC by channel
- LTV:CAC ratio
- Cash burn and runway

## Key Takeaways

- NRR is the single best predictor of long-term SaaS success
- 2% monthly churn is a business-threatening problem, not a minor concern
- LTV:CAC of 3:1 is the minimum for a sustainable business
- Track MRR components separately — blended numbers hide problems
- Payback period should be under 18 months for most SaaS businesses`,
  },
  {
    topicSlug: 'scaling',
    title: 'When and How to Build Your First Engineering Team',
    summary: 'The team structure, hiring sequence, and processes that scale from 2 to 20 engineers without losing velocity.',
    tags: ['engineering-team', 'hiring', 'processes', 'scaling', 'management'],
    difficulty: 'advanced' as const,
    stage: 'growth' as const,
    isPublished: true,
    isFeatured: false,
    content: `## Building Your First Engineering Team

Going from a 2-person technical founding team to a 20-person engineering organization is one of the hardest transitions in a startup's life. Most teams slow down significantly. The ones that don't do these things.

## Phase 1: 2–5 Engineers (Seed Stage)

At this stage, you don't have an "engineering team" — you have a group of engineers who work closely together with near-zero process overhead.

**What works:**
- Direct communication, no standups
- Pull request reviews between any two engineers
- Shared on-call, everyone owns everything
- Simple branching strategy (GitHub Flow)
- Feature flags instead of release branches

**Warning signs:**
- Deploying takes more than 30 minutes
- PRs sit unreviewed for > 24 hours
- More than 1 "senior" engineer who doesn't write code

## Phase 2: 5–12 Engineers (Series A)

This is where most startups slow down catastrophically. The patterns that worked at 5 break at 10.

**What you need:**
- **Team topology:** Organize around product areas, not technical layers (frontend/backend). A team owns a full slice of the product.
- **On-call rotation:** Formalize with PagerDuty or similar. Define incident severity levels.
- **Architecture decision records (ADRs):** Write down why you made key technical decisions. The next engineer joining needs to understand context.
- **CI/CD pipeline:** If deploying isn't automated, you're accumulating interest on a painful debt.

**Hiring sequence:**
1. Staff or senior engineer (sets technical culture)
2. 2–3 mid-level engineers
3. Engineering manager (when you have 8+ engineers or when the founding CTO can no longer manage directly)

**Avoid:** Hiring an Engineering Manager before you have 6+ engineers. A manager with 3 direct reports is expensive overhead.

## Phase 3: 12–25 Engineers (Series B+)

**What breaks:**
- Communication overhead grows quadratically with team size
- Onboarding new engineers takes weeks without documentation
- "The monolith" becomes a bottleneck
- Deploys become contentious coordination problems

**What you need:**
- **Platform engineering team:** Engineers who build internal tooling, CI/CD, infrastructure. 1 platform engineer per 8–10 product engineers.
- **Engineering levels and ladders:** Without clear levels, promotion decisions are arbitrary and cause attrition.
- **RFC process:** Major technical changes go through a written Request for Comments before implementation.
- **Developer experience investment:** Each 10% improvement in developer productivity compounds over the entire team.

## The Velocity Preservation Rule

For every 2 engineers you add, you should see measurably faster product delivery. If you're adding engineers and velocity isn't increasing, you have a process or architecture problem — not a headcount problem.

**Diagnose velocity problems:**
- Measure deployment frequency (target: multiple times per day)
- Measure lead time (commit → production): target < 1 day
- Measure change failure rate: target < 5%
- These are the DORA metrics — track them.

## Key Takeaways

- Organize teams around product areas, not technical layers
- Add an Engineering Manager only when you have 6+ engineers
- The DORA metrics (deployment frequency, lead time, change failure rate, MTTR) are your engineering health metrics
- Every 2 engineer additions should produce measurably faster delivery — if not, you have a process problem
- Platform/DevEx investment pays off starting at 10 engineers`,
  },
];

// ─── SEED FUNCTION ───────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Starting database seed...\n');

  // 1. Seed admin user
  console.log('Creating admin user...');
  const adminHash = await bcrypt.hash('Admin@123456', 12);
  const [adminUser] = await db
    .insert(schema.users)
    .values({
      email: 'admin@startupnavigator.com',
      name: 'Admin',
      passwordHash: adminHash,
      role: 'admin',
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { name: 'Admin', role: 'admin' },
    })
    .returning({ id: schema.users.id });

  console.log(`✅ Admin user ready (ID: ${adminUser.id})`);

  // 2. Seed topics
  console.log('\nSeeding topics...');
  const insertedTopics = await db
    .insert(schema.topics)
    .values(TOPICS)
    .onConflictDoUpdate({
      target: schema.topics.slug,
      set: { name: schema.topics.name, description: schema.topics.description },
    })
    .returning({ id: schema.topics.id, slug: schema.topics.slug });

  const topicMap = new Map(insertedTopics.map((t) => [t.slug, t.id]));
  console.log(`✅ ${insertedTopics.length} topics seeded`);

  // 3. Seed articles
  console.log('\nSeeding articles...');
  let articleCount = 0;

  for (const article of ARTICLES) {
    const topicId = topicMap.get(article.topicSlug);
    const slug = slugify(article.title);
    const readingTime = calculateReadingTime(article.content);

    await db
      .insert(schema.articles)
      .values({
        topicId,
        authorId: adminUser.id,
        title: article.title,
        slug,
        summary: article.summary,
        content: article.content,
        tags: article.tags,
        difficulty: article.difficulty,
        stage: article.stage,
        readingTime,
        isPublished: article.isPublished,
        isFeatured: article.isFeatured,
      })
      .onConflictDoUpdate({
        target: schema.articles.slug,
        set: {
          title: article.title,
          summary: article.summary,
          content: article.content,
          updatedAt: new Date(),
        },
      });

    articleCount++;
    process.stdout.write(`\r  Articles: ${articleCount}/${ARTICLES.length}`);
  }

  console.log(`\n✅ ${articleCount} articles seeded`);

  // 4. Seed resources
  console.log('\nSeeding resources...');
  const resources = [
    { title: 'Stripe Atlas', description: 'Incorporate your company online in 10 minutes', url: 'https://stripe.com/atlas', type: 'tool' as const, topicSlug: 'company-registration', isFeatured: true },
    { title: 'Clerky', description: 'Legal documents and company formation for startups', url: 'https://www.clerky.com', type: 'tool' as const, topicSlug: 'company-registration', isFeatured: false },
    { title: 'Orrick Startup Forms', description: 'Free legal document templates from a top startup law firm', url: 'https://www.orrick.com/en/Total-Access/Tool-Kit', type: 'template' as const, topicSlug: 'legal', isFeatured: true },
    { title: 'YC SAFE', description: 'Y Combinator\'s Simple Agreement for Future Equity template', url: 'https://www.ycombinator.com/documents', type: 'template' as const, topicSlug: 'funding', isFeatured: true },
    { title: 'Kruze Consulting', description: 'Accounting and tax services specifically for venture-backed startups', url: 'https://kruzeconsulting.com', type: 'tool' as const, topicSlug: 'taxation', isFeatured: true },
    { title: 'Carta', description: 'Cap table management and equity administration', url: 'https://carta.com', type: 'tool' as const, topicSlug: 'legal', isFeatured: true },
    { title: 'Ahrefs', description: 'SEO and content marketing research tool', url: 'https://ahrefs.com', type: 'tool' as const, topicSlug: 'marketing', isFeatured: false },
    { title: 'GitHub Copilot', description: 'AI code completion tool for developers', url: 'https://github.com/features/copilot', type: 'tool' as const, topicSlug: 'ai-tools', isFeatured: true },
  ];

  for (const resource of resources) {
    const topicId = topicMap.get(resource.topicSlug);
    await db
      .insert(schema.resources)
      .values({
        topicId,
        title: resource.title,
        description: resource.description,
        url: resource.url,
        type: resource.type,
        isFeatured: resource.isFeatured,
        tags: [],
      })
      .onConflictDoNothing();
  }

  console.log(`✅ ${resources.length} resources seeded`);

  console.log('\n🎉 Seed complete!');
  console.log('   Admin login: admin@startupnavigator.com / Admin@123456');
  console.log('   Run `pnpm db:studio` to browse the database\n');
}

seed()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => client.end());
