import type { GuideArticle } from './types'

export const article: GuideArticle = {
  slug: 'eu-ai-act-sme-guide',
  title: 'EU AI Act Compliance Guide for SMEs (2026) — What You Need to Know',
  metaDescription:
    'Complete EU AI Act compliance guide for SMEs. Risk classification, obligations, penalties, and practical steps to comply before the August 2026 deadline.',
  headline: 'The EU AI Act: What Every SME Needs to Know Before August 2026',
  subtitle:
    'Full enforcement begins August 2, 2026. The regulation applies to every company that provides or uses AI in the EU market — regardless of where you are based. Non-compliance carries fines of up to €35 million or 7% of global annual turnover.',
  author: 'Irvo Research',
  publishedAt: '2026-03-29',
  updatedAt: '2026-03-29',
  readingTime: '12 min read',
  category: 'Compliance Guide',
  tags: ['eu-ai-act', 'sme', 'compliance', 'regulation', '2026'],
  ctaVariant: 'waitlist',

  sections: [
    // ── 1. What Is the EU AI Act ──────────────────────────────────────────
    {
      id: 'what-is-the-eu-ai-act',
      heading: 'What Is the EU AI Act?',
      content: `The EU AI Act (Regulation (EU) 2024/1689) is the world's first comprehensive legal framework for artificial intelligence. It was formally adopted by the European Parliament on March 13, 2024, published in the Official Journal of the EU on July 12, 2024, and entered into force on August 1, 2024.

The regulation establishes harmonised rules for the development, placement on the market, putting into service, and use of AI systems within the European Union. It takes a risk-based approach — meaning the stricter your AI system's potential impact on health, safety, or fundamental rights, the heavier the obligations.

The Act covers the full AI lifecycle. It applies to providers (companies that develop or commission AI systems), deployers (companies that use AI systems in their operations), importers, and distributors. If you build, sell, or use AI-powered tools that touch the EU market, you are in scope.

For SMEs, the most critical dates are August 2, 2025 (when prohibited AI practices become enforceable) and August 2, 2026 (when the full regime — including all high-risk obligations — takes effect). The regulation includes specific provisions in Article 62 encouraging national authorities to provide guidance and reduced fees for SMEs, but the core obligations are the same regardless of company size.

This is not a directive — it is a regulation. That means it applies directly in all 27 EU member states without needing national transposition. There is no ambiguity about whether it applies.`,
    },

    // ── 2. Does It Apply to My Company ────────────────────────────────────
    {
      id: 'does-it-apply-to-my-company',
      heading: 'Does the EU AI Act Apply to My Company?',
      content: `The EU AI Act has extraterritorial reach. Under Article 2, it applies to:

- **Providers** (developers) of AI systems that place them on the EU market or put them into service in the EU — regardless of whether the provider is based inside or outside the EU.
- **Deployers** (users) of AI systems that are established in the EU or whose AI system's output is used within the EU.
- **Providers and deployers** located in a third country, where the output produced by the AI system is used in the EU.

This means a UK company selling SaaS to EU customers is in scope. A US startup whose product is used by an EU-based deployer is in scope. An Australian company whose AI-generated decisions affect EU citizens is in scope.

The test is not where you are incorporated. The test is whether your AI system touches the EU market.

> **Key question: Do you develop, deploy, or use AI, machine learning, or automated decision-making in any business process that involves EU customers, EU data subjects, or the EU market? If yes, the Act almost certainly applies to you.**

For SMEs specifically, the scope is broad because the regulation's definition of "AI system" in Article 3(1) covers machine-learning-based systems and, under certain conditions, rule-based automation. If you use tools like automated hiring screening, AI-assisted customer service, ML-powered credit scoring, or algorithmic content moderation — you are likely deploying AI systems under this regulation.

The only general exceptions (Article 2(6)) are AI systems used exclusively for military/defence purposes and AI systems used purely for scientific research. Standard commercial use does not qualify for any exemption.`,
    },

    // ── 3. Risk Classification ────────────────────────────────────────────
    {
      id: 'risk-classification',
      heading: 'The Four Risk Tiers: How AI Systems Are Classified',
      content: `The EU AI Act classifies AI systems into four risk levels. Your obligations depend entirely on which tier your system falls into. Articles 5, 6, and 50, along with Annexes I and III, define the classification criteria.

| Risk Level | Definition | Examples | Obligations |
|---|---|---|---|
| **Unacceptable** (Art. 5) | AI practices that pose a clear threat to fundamental rights and are outright banned | Social scoring by governments, real-time remote biometric identification in public spaces (with narrow exceptions), manipulation of vulnerable groups, emotion recognition in workplaces and schools | **Prohibited.** These systems cannot be placed on the market or used in the EU. |
| **High** (Art. 6 + Annex III) | AI systems that pose significant risk to health, safety, or fundamental rights | AI in recruitment/HR screening, credit scoring, educational assessment, medical device diagnostics, critical infrastructure management, biometric categorisation | **Heavy obligations.** Risk management, data governance, technical documentation, transparency, human oversight, accuracy and robustness requirements (Arts. 9-15). Conformity assessment required before market placement. |
| **Limited** (Art. 50) | AI systems with specific transparency risks | Chatbots, deepfakes, emotion recognition systems (outside prohibited contexts), AI-generated content | **Transparency obligations.** Users must be informed they are interacting with AI. AI-generated content must be labelled. |
| **Minimal** (no specific articles) | AI systems that pose negligible risk | Spam filters, AI-enhanced video games, inventory optimisation | **No mandatory obligations** beyond existing law. Voluntary codes of conduct encouraged. |

Most SMEs will find that their AI systems fall into the high-risk or limited-risk categories. The critical step is accurate classification — underclassifying a system does not reduce your legal exposure, it increases it. If a regulator later determines your system should have been classified as high-risk, you face enforcement action for non-compliance with all the obligations you skipped.

Classification under Article 6 follows two paths: (a) AI systems that are safety components of products already covered by EU harmonisation legislation listed in Annex I, and (b) stand-alone AI systems whose use cases fall within the eight categories listed in Annex III.`,
    },

    // ── 4. Annex III Categories ───────────────────────────────────────────
    {
      id: 'annex-iii-categories',
      heading: 'The 8 High-Risk Categories (Annex III)',
      content: `Annex III of the EU AI Act lists eight areas where AI systems are classified as high-risk by default. If your AI system falls into any of these categories, the full set of high-risk obligations applies.

| Category | Annex III Ref | Examples | Key Articles |
|---|---|---|---|
| **1. Biometrics** | Annex III, 1 | Remote biometric identification, biometric categorisation by sensitive attributes, emotion recognition | Arts. 5, 6, 9-15, 26 |
| **2. Critical infrastructure** | Annex III, 2 | AI managing electricity, gas, water, heating, or digital infrastructure; road traffic safety systems | Arts. 6, 9-15 |
| **3. Education and vocational training** | Annex III, 3 | AI determining access to education, assessing learning outcomes, monitoring exam behaviour, adaptive learning systems that gate progression | Arts. 6, 9-15, 26 |
| **4. Employment, workers management, self-employment** | Annex III, 4 | CV screening tools, AI scheduling/allocation, automated performance evaluation, promotion/termination decision support | Arts. 6, 9-15, 26 |
| **5. Access to essential private and public services** | Annex III, 5 | Credit scoring, insurance pricing and claims, AI triage in emergency services, social benefit eligibility assessment | Arts. 6, 9-15, 26 |
| **6. Law enforcement** | Annex III, 6 | Polygraph-type tools, evidence reliability assessment, profiling for crime prediction, crime analytics | Arts. 6, 9-15, 26 |
| **7. Migration, asylum, border control** | Annex III, 7 | Automated visa application assessment, border surveillance, risk assessment of irregular migration | Arts. 6, 9-15, 26 |
| **8. Administration of justice and democratic processes** | Annex III, 8 | AI assisting judicial decisions on fact/law, AI used in dispute resolution, AI influencing election outcomes | Arts. 6, 9-15, 26 |

For SMEs, categories 3, 4, and 5 are the most common triggers. If you use AI in hiring, lending, insurance, customer assessment, or education — you are almost certainly operating a high-risk system.

Note that the classification is based on the *intended purpose* of the system. A general-purpose chatbot is not high-risk. The same underlying model deployed specifically to screen job applicants becomes high-risk because of its use in an Annex III category. The use case determines the classification, not the technology.

The European Commission can update Annex III via delegated acts (Article 6(5)), adding new categories as AI use evolves. This list will grow over time.`,
    },

    // ── 5. Key Obligations ────────────────────────────────────────────────
    {
      id: 'key-obligations',
      heading: 'Key Obligations for High-Risk AI Systems',
      content: `If your AI system is classified as high-risk under Article 6, you must meet six core requirements before placing it on the market or putting it into service. These obligations apply to providers. Deployers have a separate but overlapping set of duties under Article 26.

**1. Risk Management System (Article 9)**
You must establish, implement, document, and maintain a continuous risk management system throughout the AI system's lifecycle. This includes identifying foreseeable risks, estimating them, adopting risk mitigation measures, and testing those measures. The risk management system must be reviewed and updated regularly — it is not a one-time exercise.

**2. Data Governance (Article 10)**
Training, validation, and testing datasets must meet quality criteria. You must document data collection processes, identify potential biases, and take measures to address gaps. Data must be relevant, representative, and — to the extent possible — free from errors.

**3. Technical Documentation (Article 11)**
Before a high-risk AI system is placed on the market, you must draw up technical documentation demonstrating compliance. Annex IV specifies the minimum content: a general description, detailed development methodology, monitoring and control measures, and a description of the risk management process. This documentation must be kept up to date.

**4. Transparency and Information to Deployers (Article 13)**
High-risk AI systems must be designed to be sufficiently transparent that deployers can interpret and use outputs appropriately. You must provide instructions for use that include the system's intended purpose, level of accuracy, known limitations, and circumstances that may lead to risks.

**5. Human Oversight (Article 14)**
Systems must be designed so that they can be effectively overseen by natural persons during use. This means humans must be able to understand the system's capabilities and limitations, monitor its operation, and intervene or override its outputs — including the ability to stop the system entirely.

**6. Accuracy, Robustness, and Cybersecurity (Article 15)**
High-risk AI systems must achieve appropriate levels of accuracy, robustness, and cybersecurity. They must be resilient against errors, faults, and inconsistencies, and protected against attempts by third parties to exploit vulnerabilities.

For deployers (Article 26): you must use the system in accordance with instructions, ensure human oversight, monitor for risks, and keep logs generated by the system for at least six months.`,
    },

    // ── 6. Timeline ───────────────────────────────────────────────────────
    {
      id: 'timeline',
      heading: 'EU AI Act Enforcement Timeline',
      content: `The EU AI Act uses a phased enforcement approach. Not all obligations apply at the same time. Here are the critical dates:

| Date | What Happens |
|---|---|
| **August 1, 2024** | The EU AI Act enters into force (20 days after publication in the Official Journal on July 12, 2024). |
| **February 2, 2025** | Chapter I (general provisions and definitions) and Chapter II (prohibited AI practices, Article 5) become applicable. AI literacy obligations under Article 4 also apply. |
| **August 2, 2025** | Obligations for general-purpose AI (GPAI) models under Chapter V take effect. Governance structures (AI Office, Board, Forum) are operational. Member states must designate national competent authorities. Penalties framework under Articles 99-101 becomes enforceable for prohibited practices. |
| **August 2, 2026** | **Full enforcement.** All remaining provisions apply, including all high-risk AI obligations (Articles 6-43), deployer obligations (Article 26), transparency obligations (Article 50), and the full penalties regime. This is the hard deadline for SMEs. |
| **August 2, 2027** | Obligations for high-risk AI systems that are safety components of products covered by existing EU harmonisation legislation (Annex I, Section A) — such as medical devices, machinery, toys — become applicable. |

> **The August 2, 2026 deadline is 16 months away. If your company uses high-risk AI systems and you have not started your compliance programme, you are already behind. Assessment, documentation, and evidence gathering for even a single AI system takes weeks — and most SMEs operate multiple systems.**

There is no grace period after August 2, 2026. Market surveillance authorities can begin enforcement actions immediately. The regulation does not include a "soft launch" provision for companies that started late.`,
    },

    // ── 7. Penalties ──────────────────────────────────────────────────────
    {
      id: 'penalties',
      heading: 'Fines and Penalties for Non-Compliance',
      content: `The EU AI Act establishes three tiers of administrative fines under Article 99, scaled by severity. Fines are calculated as the higher of a fixed amount or a percentage of worldwide annual turnover — whichever is greater.

**Tier 1 — Prohibited AI practices (Article 5 violations):**
Up to €35 million or 7% of total worldwide annual turnover from the preceding financial year, whichever is higher.

**Tier 2 — Non-compliance with high-risk obligations (Articles 6-43 and other key provisions):**
Up to €15 million or 3% of total worldwide annual turnover, whichever is higher.

**Tier 3 — Supplying incorrect, incomplete, or misleading information to authorities:**
Up to €7.5 million or 1% of total worldwide annual turnover, whichever is higher.

For SMEs and startups, Article 99(6) provides a proportionality adjustment: the fine caps are reduced to the lower of the fixed amount or the percentage — rather than the higher. This means a company with €5 million in annual turnover would be capped at the fixed amount rather than the percentage, but these are still potentially business-ending figures.

Beyond administrative fines, non-compliance carries practical consequences:
- **Market access:** Non-compliant AI systems can be ordered withdrawn or recalled from the EU market under Articles 16(i) and 21.
- **Reputational damage:** The regulation requires member states to make enforcement decisions publicly available. A compliance failure becomes a public record.
- **Commercial impact:** Enterprise customers and public-sector buyers will increasingly require AI Act compliance evidence as a procurement condition. Without it, you lose deals.

The enforcement model mirrors GDPR. National authorities will have investigative powers and the ability to impose corrective measures. Early GDPR enforcement disproportionately targeted smaller companies that lacked documentation — not because they were worse offenders, but because they were easier to prosecute. The same pattern is likely here.`,
    },

    // ── 8. What SMEs Should Do Now ────────────────────────────────────────
    {
      id: 'what-smes-should-do-now',
      heading: 'What SMEs Should Do Now: 5 Practical Steps',
      content: `Compliance does not require a legal team or a six-figure consulting engagement. It requires a structured, systematic approach. Here are the five steps every SME should take before August 2, 2026.

**Step 1: Inventory your AI systems.**
List every tool, platform, or workflow in your organisation that uses AI, machine learning, or automated decision-making. Include third-party tools — if you deploy an AI-powered SaaS product, you are a deployer under the Act and have obligations under Article 26. Most companies undercount by 40-60% on their first pass because they forget about embedded AI in existing software.

**Step 2: Classify the risk level of each system.**
For each AI system, determine whether it falls under unacceptable, high, limited, or minimal risk. Use the Annex III categories as your primary reference. If a system touches hiring, lending, insurance, education, or critical infrastructure, start by assuming it is high-risk and work backwards from there.

**Step 3: Map your obligations.**
For each high-risk system, identify which of the six core obligations (Arts. 9-15) apply and what evidence you need to demonstrate compliance. For deployers, review Article 26 for your specific duties. For limited-risk systems, identify your transparency obligations under Article 50.

**Step 4: Build evidence packs.**
Documentation is the deliverable. Regulators will not accept verbal assurances — they will ask for structured evidence that your risk management, data governance, oversight mechanisms, and testing protocols are in place. An evidence pack is the artefact you hand to an auditor or regulator.

**Step 5: Establish ongoing monitoring.**
Compliance is not a project with an end date. Article 9 requires continuous risk management. Article 72 establishes post-market monitoring obligations. You need a system that tracks changes to your AI systems, updates documentation when models are retrained or modified, and flags when a new regulatory development affects your classification.

Irvo automates steps 2 through 5. You describe your AI system, answer a structured questionnaire, receive an AI-powered classification and obligations map, capture evidence per obligation with AI-assisted drafting, and export regulator-ready evidence packs — in about 20 minutes per system.`,
    },

    // ── 9. Evidence Packs ─────────────────────────────────────────────────
    {
      id: 'evidence-packs',
      heading: 'What Is an AI Act Evidence Pack?',
      content: `An evidence pack is a structured documentation package that demonstrates your AI system's compliance with the EU AI Act. It is the single most important deliverable in your compliance programme. When a regulator, auditor, or enterprise customer asks "prove you comply," the evidence pack is what you hand over.

The concept is not explicitly named in the regulation, but it maps directly to the documentation requirements across Articles 9-15, Article 11 (technical documentation per Annex IV), and Article 18 (document retention). Think of it as the consolidated compliance file for a single AI system.

**A complete evidence pack should contain:**

1. **System description** — What the AI system does, its intended purpose, the technology it uses, and where it operates. Maps to Annex IV, Section 1.
2. **Risk classification rationale** — Why the system is classified at its current risk level, which Annex III category applies (if high-risk), and the reasoning behind the classification. Maps to Article 6.
3. **Risk management documentation** — Identified risks, mitigation measures, residual risk assessment, and testing results. Maps to Article 9.
4. **Data governance summary** — Training data provenance, quality measures, bias assessment, and data processing practices. Maps to Article 10.
5. **Technical specification** — Model architecture, performance metrics, accuracy benchmarks, known limitations, and robustness testing. Maps to Articles 11 and 15.
6. **Human oversight plan** — Who oversees the system, what intervention mechanisms exist, escalation procedures, and override capabilities. Maps to Article 14.
7. **Transparency documentation** — Instructions for use provided to deployers, information about system capabilities and limitations, and user-facing disclosures. Maps to Article 13.
8. **Monitoring and update log** — Post-market monitoring procedures, incident records, model update history, and revalidation results. Maps to Article 72.

A well-structured evidence pack serves multiple purposes: regulatory compliance, customer due diligence, internal governance, and insurance underwriting. The companies that build evidence packs now will have a structural advantage when enforcement begins — both in avoiding penalties and in winning contracts that require compliance proof.

Irvo generates evidence packs as regulator-ready PDFs. Each section is pre-structured to the relevant Article, pre-populated with AI-drafted content based on your questionnaire responses, and editable before export.`,
    },

    // ── 10. Cost of Compliance ────────────────────────────────────────────
    {
      id: 'cost-of-compliance',
      heading: 'The Real Cost of EU AI Act Compliance',
      content: `Compliance costs vary dramatically depending on the approach. Here is what SMEs can realistically expect across three paths.

**Path 1: External consulting**
Specialist AI governance consultancies charge £15,000-£50,000 per engagement for a single AI system assessment. This typically includes risk classification, gap analysis, and a compliance report. It does not usually include ongoing monitoring or evidence maintenance. For a company with 5 AI systems, total cost ranges from £75,000 to £250,000 — and that is before annual review cycles. Engagement timelines run 6-12 weeks per system.

**Path 2: Manual internal compliance**
If you assign an internal team (typically a mix of legal, technical, and operations staff), expect 40-60 hours of effort per AI system for the initial assessment and documentation. At fully loaded cost rates for senior staff, that translates to £8,000-£15,000 per system in internal resource cost. The challenge is expertise — most SME teams do not have AI regulation specialists, so the first system takes significantly longer while the team learns the framework. Quality and consistency vary. Ongoing maintenance adds 10-20 hours per system annually.

**Path 3: Irvo**
Irvo is purpose-built for this problem. The platform guides you through a structured questionnaire for each AI system, runs AI-powered risk classification against the Annex III categories and Article 6 criteria, maps your specific obligations, provides AI-assisted evidence drafting per obligation, and exports a complete evidence pack as a regulator-ready PDF. Time per system: approximately 20 minutes. Cost: from £149/month for up to 3 systems (Starter), £399/month for up to 10 systems (Growth), or £799/month for up to 25 systems (Plus).

| Approach | Cost per system | Time per system | Ongoing maintenance | Consistency |
|---|---|---|---|---|
| External consulting | £15,000-£50,000 | 6-12 weeks | Separate engagement | Depends on consultant |
| Internal manual | £8,000-£15,000 | 40-60 hours | 10-20 hrs/year | Variable |
| Irvo | From £50/system/month | ~20 minutes | Automated monitoring | Standardised to regulation |

The regulatory risk of non-compliance (fines up to €15M for high-risk obligation breaches) makes the cost of compliance a rounding error by comparison. The question is not whether to comply — it is how efficiently you can get there.`,
    },
  ],

  faqs: [
    {
      question: 'Does the EU AI Act apply to UK companies?',
      answer:
        'Yes. The EU AI Act has extraterritorial scope under Article 2. If a UK company provides an AI system that is placed on the EU market, or if the output of its AI system is used within the EU, the regulation applies. This is the same extraterritorial model as GDPR. UK companies selling to EU customers, or whose products are used by EU-based deployers, must comply.',
    },
    {
      question: 'What happens if I don\'t comply with the EU AI Act?',
      answer:
        'Non-compliance carries administrative fines of up to €35 million or 7% of global annual turnover for prohibited practices, up to €15 million or 3% for high-risk obligation breaches, and up to €7.5 million or 1% for providing misleading information to authorities (Article 99). Beyond fines, non-compliant systems can be ordered withdrawn from the EU market, and enforcement decisions are made public.',
    },
    {
      question: 'Is ChatGPT high-risk under the EU AI Act?',
      answer:
        'ChatGPT as a general-purpose AI model is regulated under the GPAI provisions (Chapter V, Articles 51-56), not as a high-risk AI system. However, if you deploy ChatGPT or its API in a high-risk use case — such as screening job applicants, assessing creditworthiness, or making decisions about education access — then your specific deployment becomes a high-risk AI system under Annex III. The risk classification follows the use case, not the underlying model.',
    },
    {
      question: 'Do I need to register my AI system?',
      answer:
        'Yes, if it is high-risk. Article 49 requires providers of high-risk AI systems to register them in the EU database (established under Article 71) before placing them on the market or putting them into service. Deployers of high-risk systems in the public sector are also required to register. The database is publicly accessible, and registration must include information specified in Annexes VIII and IX.',
    },
    {
      question: 'What is an AI Act evidence pack?',
      answer:
        'An evidence pack is a structured documentation package that demonstrates a specific AI system\'s compliance with EU AI Act obligations. It consolidates all required documentation — risk management records (Art. 9), data governance (Art. 10), technical documentation (Art. 11, Annex IV), transparency information (Art. 13), human oversight plans (Art. 14), and accuracy/robustness testing (Art. 15) — into a single, auditable file. It is the deliverable you present to regulators, auditors, or customers.',
    },
    {
      question: 'How long does EU AI Act compliance take?',
      answer:
        'It depends on your approach and number of AI systems. External consulting typically takes 6-12 weeks per system. Manual internal compliance requires 40-60 hours per system. Using a purpose-built compliance platform like Irvo, you can complete risk classification, obligations mapping, and evidence pack generation in approximately 20 minutes per system. The key bottleneck is usually the initial AI system inventory — most companies undercount their AI deployments on first assessment.',
    },
    {
      question: 'Does the EU AI Act apply to small businesses?',
      answer:
        'Yes. The EU AI Act applies to all providers and deployers of AI systems regardless of company size. There are no blanket SME exemptions. However, Article 62 requires member states and the AI Office to provide SMEs with priority access to regulatory sandboxes, and Article 99(6) adjusts fine calculations so that SMEs are capped at the lower of the fixed amount or the turnover percentage. The obligations themselves are identical.',
    },
    {
      question: 'What is Annex III of the EU AI Act?',
      answer:
        'Annex III lists the eight categories of AI systems that are classified as high-risk under Article 6(2). These are: (1) biometrics, (2) critical infrastructure, (3) education and vocational training, (4) employment and workers management, (5) access to essential services, (6) law enforcement, (7) migration and border control, and (8) administration of justice and democratic processes. If your AI system\'s intended purpose falls within any of these categories, it is classified as high-risk and the full set of obligations under Articles 9-15 applies.',
    },
  ],

  relatedSlugs: ['annex-iii-categories', 'compliance-checklist', 'ai-act-penalties'],

  tldr:
    'The EU AI Act (Regulation 2024/1689) takes full effect on August 2, 2026, applying to any company that develops or deploys AI systems in the EU market — including UK and non-EU companies. AI systems are classified into four risk tiers (unacceptable, high, limited, minimal), with high-risk systems in areas like hiring, credit scoring, and education facing mandatory obligations including risk management, data governance, technical documentation, transparency, human oversight, and ongoing monitoring. Non-compliance carries fines of up to €35 million or 7% of global annual turnover.',
}
