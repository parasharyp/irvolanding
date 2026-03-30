import type { GuideArticle } from './types'

export const article: GuideArticle = {
  slug: 'compliance-checklist',
  title: 'EU AI Act Compliance Checklist for 2026 — Step-by-Step Guide',
  metaDescription:
    'Complete EU AI Act compliance checklist for 2026. 12 actionable steps to get your organisation compliant before the August deadline.',
  headline: 'EU AI Act Compliance Checklist: 12 Steps Before August 2026',
  subtitle:
    'A practical, step-by-step checklist for SMEs to achieve EU AI Act compliance before enforcement begins.',
  publishedAt: '2026-03-29',
  updatedAt: '2026-03-29',
  author: 'Irvo Research',
  readingTime: '8 min read',
  category: 'Practical Guide',
  tags: ['checklist', 'compliance', 'eu-ai-act', '2026', 'step-by-step'],
  ctaVariant: 'signup',
  tldr:
    'The EU AI Act (Regulation 2024/1689) requires compliance by August 2, 2026. This 12-step checklist walks SMEs through every requirement — from inventorying AI systems and classifying risk levels to building evidence packs and registering in the EU database. Start now; five months is tight but achievable if you move systematically.',
  sections: [
    {
      id: 'step-1-inventory',
      heading: 'Step 1: Inventory All AI Systems',
      content:
        'Before you can comply, you need to know what you are complying for. List every workflow in your organisation that uses AI, machine learning, automation, or algorithmic decision-making.\n\nThis includes internal tools (e.g. an ML model that scores leads), third-party SaaS products (e.g. a chatbot from a vendor), and custom-built models. If it takes input and generates predictions, recommendations, decisions, or content — it likely qualifies.\n\nUnder Art. 3(1) of Regulation (EU) 2024/1689, an "AI system" is a machine-based system designed to operate with varying levels of autonomy, that may exhibit adaptiveness after deployment, and that infers from input how to generate outputs such as predictions, content, recommendations, or decisions that can influence physical or virtual environments.\n\nDo not skip vendor tools. If you deploy a third-party AI system, you have obligations as a deployer under Art. 26. Your inventory should capture: system name, vendor (if third-party), purpose, data inputs, data outputs, and which teams use it.',
      callout: {
        type: 'tip',
        text: 'Start with a simple spreadsheet. Columns: System Name, Provider, Purpose, Data Inputs, Data Outputs, Business Owner, Status. You can migrate to a structured tool like Irvo later.',
      },
    },
    {
      id: 'step-2-classify',
      heading: 'Step 2: Classify Each System by Risk Level',
      content:
        'The EU AI Act uses a 4-tier risk framework: unacceptable (prohibited), high-risk, limited-risk, and minimal-risk. Your obligations depend entirely on which tier each system falls into.\n\nArt. 6 defines high-risk AI systems in two ways. First, AI systems that are safety components of products already covered by EU harmonisation legislation (e.g. medical devices, machinery). Second, AI systems listed in Annex III — which covers areas like biometric identification, critical infrastructure, employment, education, law enforcement, and migration.\n\nTo classify a system, ask: (1) Does it fall into any Annex III category? (2) Is it a safety component of a regulated product? (3) Does it make decisions that significantly affect natural persons? If any answer is yes, treat it as high-risk until you can prove otherwise.\n\nFor limited-risk systems (e.g. chatbots, emotion recognition, deepfake generators), you have transparency obligations under Art. 50. For minimal-risk systems, there are no mandatory obligations — but voluntary codes of practice are encouraged.\n\nGet classification wrong and everything downstream is wrong. If you are unsure, err on the side of higher risk.',
      callout: {
        type: 'warning',
        text: 'Classification is the single most consequential decision in your compliance journey. If you classify a high-risk system as minimal-risk, you skip obligations that regulators will expect evidence for.',
      },
    },
    {
      id: 'step-3-prohibited',
      heading: 'Step 3: Check for Prohibited Uses',
      content:
        'Art. 5 of the EU AI Act bans specific AI practices outright. These are not "comply with conditions" — they are "do not use, full stop."\n\nProhibited practices include: social scoring by public authorities or on their behalf, AI systems that deploy subliminal, manipulative, or deceptive techniques to distort behaviour in ways that cause significant harm, exploitation of vulnerabilities of specific groups (age, disability, social or economic situation), real-time remote biometric identification in publicly accessible spaces for law enforcement (with narrow exceptions), emotion recognition in workplaces and educational institutions, untargeted scraping of facial images from the internet or CCTV to build facial recognition databases, and biometric categorisation to infer sensitive attributes like race, political opinions, or sexual orientation.\n\nReview your inventory against every item on this list. If any system comes close to a prohibited practice, stop using it immediately. The penalties for prohibited practices are the highest under the Act — up to 35 million EUR or 7% of global annual turnover.',
      callout: {
        type: 'warning',
        text: 'Art. 5 prohibitions are already enforceable as of February 2, 2025. If you are still operating a prohibited AI system, you are already in breach.',
      },
    },
    {
      id: 'step-4-risk-management',
      heading: 'Step 4: Establish Risk Management (Art. 9)',
      content:
        'For every high-risk AI system, Art. 9 requires a risk management system that runs throughout the entire lifecycle of the AI system — not a one-off assessment.\n\nYour risk management system must: (1) Identify and analyse known and reasonably foreseeable risks to health, safety, and fundamental rights. (2) Estimate and evaluate risks that may emerge when the system is used in accordance with its intended purpose and under conditions of reasonably foreseeable misuse. (3) Adopt appropriate and targeted risk management measures. (4) Address residual risks — document them, communicate them to deployers, and ensure they are acceptable.\n\nPractically, this means creating a risk register for each high-risk AI system. For each identified risk, document: the risk description, likelihood, severity, affected parties, mitigation measures you have implemented, residual risk after mitigation, and the owner responsible for monitoring that risk.\n\nRisk management is not a document you write once and file. Art. 9(2) explicitly requires it to be a continuous iterative process planned and run throughout the entire lifecycle. Build review cycles into your operations — quarterly at minimum.',
    },
    {
      id: 'step-5-data-governance',
      heading: 'Step 5: Implement Data Governance (Art. 10)',
      content:
        'Art. 10 requires that training, validation, and testing datasets for high-risk AI systems meet specific quality criteria. Even if you use a third-party model, you need to understand and document the data governance practices applied.\n\nYour data governance must address: relevance — is the data appropriate for the system\'s intended purpose? Representativeness — does the data adequately represent the population or scenarios the system will encounter? Freedom from errors — has the data been cleaned and validated? Completeness — does the data cover the operational conditions the system will face?\n\nBias is a central concern. Art. 10(2)(f) explicitly requires you to examine data for possible biases that are likely to affect the health and safety of persons, have an adverse impact on fundamental rights, or lead to discrimination. Document what you looked for, what you found, and what you did about it.\n\nIf you are a deployer using a vendor\'s AI system, request their data governance documentation. If they cannot provide it, that is a red flag for your own compliance.',
    },
    {
      id: 'step-6-documentation',
      heading: 'Step 6: Create Technical Documentation (Art. 11)',
      content:
        'Art. 11 requires providers of high-risk AI systems to draw up technical documentation before the system is placed on the market or put into service. This documentation must be kept up to date.\n\nThe documentation must include: a general description of the AI system, a detailed description of the elements of the system and its development process, detailed information about the monitoring, functioning, and control of the system, a description of the system\'s accuracy, robustness, and cybersecurity measures, and a description of the risk management system.\n\nAnnex IV of the Regulation specifies the full list of required content. Use it as your template.\n\nThis is the backbone of your evidence pack. Without comprehensive technical documentation, you cannot demonstrate compliance to a regulator. Think of it as the "source of truth" for each AI system — everything else references back to it.\n\nFor deployers: you are not required to produce the provider\'s technical documentation, but you must maintain your own records under Art. 26 — including logs of system use, any modifications, and your own risk assessments.',
      callout: {
        type: 'tip',
        text: 'Do not treat technical documentation as a bureaucratic exercise. Write it so that someone unfamiliar with the system can understand what it does, what risks it poses, and how those risks are managed.',
      },
    },
    {
      id: 'step-7-transparency',
      heading: 'Step 7: Ensure Transparency (Art. 13)',
      content:
        'Art. 13 requires that high-risk AI systems are designed and developed in such a way that their operation is sufficiently transparent to enable deployers to interpret the system\'s output and use it appropriately.\n\nAt minimum, this means: users must be informed that they are interacting with an AI system (Art. 50), the system must come with instructions for use that include information about the provider, the system\'s capabilities and limitations, intended purpose, and the level of accuracy and robustness, and deployers must be able to understand the system\'s output well enough to make informed decisions.\n\nFor general-purpose AI systems and chatbots, Art. 50 adds specific obligations: content generated by AI must be marked as such (especially synthetic audio, images, video, and text), and people interacting with an AI system must be informed they are doing so.\n\nDocument your transparency measures: what disclosures you make, where they appear, how users are notified, and how you verify that notifications are effective.',
    },
    {
      id: 'step-8-human-oversight',
      heading: 'Step 8: Enable Human Oversight (Art. 14)',
      content:
        'Art. 14 requires that high-risk AI systems are designed to be effectively overseen by natural persons during the period in which they are in use.\n\nHuman oversight must enable the person overseeing the system to: fully understand the capabilities and limitations of the AI system, properly monitor its operation, be able to interpret the system\'s output, be able to decide not to use the system or to disregard, override, or reverse its output, and be able to intervene in the operation or interrupt the system.\n\nPractically, this means identifying a named individual or role responsible for overseeing each high-risk AI system. Document: who has oversight responsibility, what training they have received, what tools they use to monitor the system, the procedure for overriding or halting the system, and escalation paths for when something goes wrong.\n\nHuman oversight is not a checkbox. If your "human in the loop" rubber-stamps every AI output without genuine review, you do not have meaningful human oversight — and a regulator will see through it.',
      callout: {
        type: 'warning',
        text: 'Automation bias is real. Train your oversight personnel to critically evaluate AI outputs, not just confirm them. Document the training.',
      },
    },
    {
      id: 'step-9-accuracy',
      heading: 'Step 9: Verify Accuracy and Robustness (Art. 15)',
      content:
        'Art. 15 requires that high-risk AI systems achieve an appropriate level of accuracy, robustness, and cybersecurity, and perform consistently in those respects throughout their lifecycle.\n\nAccuracy: define and measure your system\'s accuracy metrics. These must be declared in the instructions for use (Art. 13). Accuracy levels should reflect the system\'s intended purpose and be appropriate to the risks involved.\n\nRobustness: the system must be resilient to errors, faults, and inconsistencies in its environment. It should also be resistant to attempts by unauthorised third parties to alter its use or performance by exploiting system vulnerabilities (adversarial attacks).\n\nCybersecurity: Art. 15(5) specifically requires technical solutions appropriate to the relevant circumstances — including measures to prevent or control attacks that try to manipulate training data (data poisoning), inputs designed to cause errors (adversarial examples), or model flaws (model flaws).\n\nDocument: accuracy benchmarks, test methodology, test results, robustness testing approach, cybersecurity measures in place, and how often you re-test.',
    },
    {
      id: 'step-10-evidence',
      heading: 'Step 10: Build Evidence Packs',
      content:
        'An evidence pack is your structured, per-system compliance file. When a regulator asks "show me your compliance", this is what you hand over.\n\nEach evidence pack should contain: a cover sheet identifying the AI system, its provider, and its deployer; classification rationale — why this system is classified at its risk level, with references to Art. 6 and Annex III; a table of applicable obligations mapped to the system\'s risk tier; evidence per obligation — documents, test results, policies, and screenshots that demonstrate compliance; a gap analysis — any areas where compliance is incomplete and your plan to close them; and a compliance declaration signed by the responsible person in your organisation.\n\nStructure matters. A folder of random documents is not an evidence pack. Use a consistent template across all your AI systems so that you can maintain, update, and present them efficiently.\n\nThis is where most organisations fail — not because they lack compliance measures, but because they cannot prove they have them. Build evidence packs as you go through steps 1 to 9, not as a separate exercise afterwards.',
      callout: {
        type: 'tip',
        text: 'Irvo generates structured evidence packs automatically — classification rationale, obligations mapping, evidence capture per obligation, and PDF export. One system at a time, no bulk overhead.',
      },
    },
    {
      id: 'step-11-monitoring',
      heading: 'Step 11: Set Up Post-Market Monitoring (Art. 72)',
      content:
        'Art. 72 requires providers of high-risk AI systems to establish and document a post-market monitoring system. This is proportionate to the nature and risks of the AI system.\n\nYour post-market monitoring system must actively and systematically collect, document, and analyse relevant data about the performance of the AI system throughout its lifetime. The purpose is to ensure continued compliance and to detect risks that may not have been apparent before deployment.\n\nKey elements to implement: ongoing performance monitoring against your accuracy and robustness benchmarks, incident tracking and reporting (serious incidents must be reported to market surveillance authorities under Art. 73), feedback mechanisms from users and deployers, regular reviews — at minimum annually, but more frequently for higher-risk systems, and a clear procedure for when monitoring reveals non-compliance or new risks.\n\nDocument your monitoring plan: what you monitor, how often, who is responsible, what triggers a review, and what actions you take when issues are detected. This is a living process, not a static document.',
    },
    {
      id: 'step-12-register',
      heading: 'Step 12: Register in the EU Database (Art. 49)',
      content:
        'Art. 49 requires that before a high-risk AI system is placed on the market or put into service, the provider (or authorised representative) registers it in the EU database referred to in Art. 71.\n\nThe EU database is publicly accessible and designed to increase transparency. Registration information includes: the provider\'s name and contact details, a description of the AI system\'s intended purpose, the risk classification, conformity assessment procedure used, the system\'s status (on the market, withdrawn, recalled), and the member states where the system is available.\n\nDeployers of high-risk AI systems listed in Annex III must also register their use under Art. 49(3).\n\nPrepare your registration information well before your go-live date. Registration is a prerequisite — not a follow-up task. You cannot legally place a high-risk AI system on the EU market without completing this step.\n\nThe European Commission maintains the database at the EU AI Act database portal. Check for the latest registration guidance and forms as the infrastructure is still being finalised.',
      callout: {
        type: 'info',
        text: 'The EU database infrastructure is being built by the Commission. Monitor the AI Office announcements for the exact registration process and timeline.',
      },
    },
    {
      id: 'timeline',
      heading: 'Recommended Timeline',
      content:
        'Starting from March 2026, an SME with a small portfolio of AI systems can realistically achieve compliance by August 2, 2026 — but only with disciplined execution. Here is a month-by-month plan.',
      table: {
        headers: ['Month', 'Action'],
        rows: [
          ['March 2026', 'Complete AI inventory (Step 1). Begin risk classification (Step 2). Screen for prohibited uses (Step 3).'],
          ['April 2026', 'Finalise risk classification for all systems. Begin risk management documentation (Step 4). Start data governance review (Step 5).'],
          ['May 2026', 'Complete data governance. Draft technical documentation (Step 6). Implement transparency measures (Step 7).'],
          ['June 2026', 'Establish human oversight procedures (Step 8). Run accuracy and robustness testing (Step 9). Begin compiling evidence packs (Step 10).'],
          ['July 2026', 'Finalise evidence packs. Set up post-market monitoring (Step 11). Complete EU database registration (Step 12). Internal review and gap closure.'],
          ['August 2026', 'Final review. Compliance declaration signed. Enforcement begins August 2.'],
        ],
      },
      callout: {
        type: 'warning',
        text: 'This timeline assumes you start immediately and have a small number of AI systems. If you have 10+ systems or complex high-risk deployments, you needed to start months ago. Do not wait.',
      },
    },
  ],
  faqs: [
    {
      question:'How long does EU AI Act compliance take?',
      answer:'For an SME with a handful of AI systems, expect 3 to 6 months of focused work. The timeline depends on how many systems you have, how complex they are, and whether you already have documentation practices in place. High-risk systems take significantly longer than minimal-risk ones due to the depth of documentation and testing required under Articles 9 through 15.',
    },
    {
      question:'Can I do EU AI Act compliance myself or do I need a consultant?',
      answer:'You can do it yourself if you have someone with the capacity to understand the regulation and systematically work through each requirement. Tools like Irvo are designed to guide you through the process without needing external consultants. That said, if you have complex high-risk systems or operate in heavily regulated sectors (healthcare, finance), legal review of your compliance approach is a sensible investment.',
    },
    {
      question:'What documentation do I need for the EU AI Act?',
      answer:'For high-risk AI systems, you need: technical documentation (Art. 11 and Annex IV), risk management documentation (Art. 9), data governance records (Art. 10), transparency disclosures (Art. 13), human oversight procedures (Art. 14), accuracy and robustness test results (Art. 15), post-market monitoring plans (Art. 72), and registration records (Art. 49). For limited and minimal-risk systems, the requirements are lighter — primarily transparency obligations under Art. 50.',
    },
    {
      question:'Is there a grace period for EU AI Act compliance?',
      answer:'The regulation was published in July 2024. Prohibited practices (Art. 5) became enforceable on February 2, 2025. AI literacy obligations (Art. 4) apply from February 2, 2025. Most obligations for high-risk AI systems apply from August 2, 2026. Obligations for general-purpose AI models apply from August 2, 2025. There is no additional grace period beyond these phased dates.',
    },
    {
      question:'What if I only use third-party AI tools?',
      answer:'You are a deployer under the EU AI Act, and deployers have their own obligations under Art. 26. You must: use the system in accordance with the provider\'s instructions, ensure human oversight, monitor the system\'s operation, keep logs generated by the system, and inform individuals that they are subject to AI decision-making. For high-risk systems listed in Annex III, you must also register your use in the EU database (Art. 49). You cannot outsource compliance to your vendor.',
    },
    {
      question:'Do I need to comply if I\'m a deployer, not a provider?',
      answer:'Yes. The EU AI Act creates obligations for both providers (developers) and deployers (users of AI systems). Art. 26 sets out deployer obligations explicitly. For high-risk systems, deployers must implement human oversight, monitor system performance, keep automatically generated logs, conduct fundamental rights impact assessments where required (Art. 27), and register in the EU database. Deployer obligations are lighter than provider obligations but they are not optional.',
    },
  ],
  relatedSlugs: ['eu-ai-act-sme-guide', 'annex-iii-categories', 'ai-act-evidence-packs'],
}
