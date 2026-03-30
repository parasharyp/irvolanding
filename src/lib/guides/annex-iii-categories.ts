import type { GuideArticle } from './types'

export const article: GuideArticle = {
  slug: 'annex-iii-categories',
  title: 'EU AI Act Annex III: All 8 High-Risk AI Categories Explained (2026)',
  metaDescription:
    'Complete breakdown of all 8 Annex III high-risk AI categories under the EU AI Act. Obligations, examples, and how to classify your system.',
  headline: 'Annex III: The 8 High-Risk AI Categories Under the EU AI Act',
  subtitle:
    'A plain-English breakdown of every high-risk category, with real-world examples and the obligations that apply to each.',
  publishedAt: '2026-03-29',
  updatedAt: '2026-03-29',
  author: 'Irvo Research',
  readingTime: '10 min read',
  category: 'Reference',
  tags: ['annex-iii', 'high-risk', 'categories', 'eu-ai-act'],
  ctaVariant: 'waitlist',

  tldr:
    'Annex III of Regulation (EU) 2024/1689 defines exactly eight categories of high-risk AI systems: biometrics, critical infrastructure, education, employment, essential services, law enforcement, migration, and justice/democracy. If your AI system falls into any of these categories, you must comply with Articles 9\u201315 — covering risk management, data governance, transparency, human oversight, accuracy, and robustness. Employment (Category 4) is the most common category affecting SMEs.',

  sections: [
    // ---------------------------------------------------------------
    // 1. Overview
    // ---------------------------------------------------------------
    {
      id: 'overview',
      heading: 'What Is Annex III and Why Does It Matter?',
      content:
        'Annex III of Regulation (EU) 2024/1689 defines the eight categories of AI systems that are classified as high-risk under the EU AI Act. It is the single most important reference for any organisation trying to determine whether their AI system triggers mandatory compliance obligations.\n\nIf your AI system falls into any Annex III category, you are legally required to comply with Articles 9\u201315 of the Act before placing it on the EU market or putting it into service. These articles impose concrete requirements: a risk management system (Art. 9), data governance standards (Art. 10), technical documentation (Art. 11), record-keeping and logging (Art. 12), transparency and information to deployers (Art. 13), human oversight measures (Art. 14), and accuracy, robustness, and cybersecurity safeguards (Art. 15).\n\nThe classification is not optional. It is not self-assessed with no consequences. Market surveillance authorities in each EU Member State have the power to audit, fine, and ultimately pull non-compliant systems from the market. Maximum penalties for high-risk non-compliance are up to \u20AC15 million or 3% of global annual turnover, whichever is higher.\n\nAnnex III operates alongside Article 6(2), which states that AI systems referred to in Annex III are high-risk unless they do not pose a significant risk of harm to health, safety, or fundamental rights. The burden of proof for claiming an exception sits with the provider.',
      callout: {
        type: 'warning',
        text: 'High-risk obligations under Articles 9\u201315 apply from 2 August 2026. Systems already on the market must be brought into compliance by that date.',
      },
    },

    // ---------------------------------------------------------------
    // 2. Biometrics
    // ---------------------------------------------------------------
    {
      id: 'biometrics',
      heading: 'Category 1: Biometrics (Annex III, Point 1)',
      content:
        'Annex III, point 1 covers AI systems intended for biometric identification, biometric categorisation, and emotion recognition.\n\nRemote biometric identification means identifying a natural person at a distance without their active involvement, by comparing biometric data against a reference database. This includes both "real-time" identification (e.g. scanning faces in a crowd as they pass a camera) and "post" identification (e.g. matching recorded footage against a watchlist after the fact).\n\nBiometric categorisation refers to AI that assigns natural persons to specific categories based on their biometric data. This includes inferring race, political opinions, trade union membership, religious beliefs, sex life, or sexual orientation from physical characteristics. The Act treats this as high-risk because of the direct impact on fundamental rights.\n\nEmotion recognition systems analyse biometric signals — facial expressions, voice patterns, body language, physiological data — to infer a person\'s emotional state. These are high-risk when used in workplaces or educational settings.',
      list: [
        'Facial recognition for physical access control at corporate offices',
        'Emotion detection AI used during job interviews or performance reviews',
        'AI-driven biometric categorisation for customer profiling in retail',
        'Liveness detection systems used in remote identity verification (eKYC)',
        'Voice-based emotion recognition in call centre quality monitoring',
      ],
      callout: {
        type: 'info',
        text: 'Real-time remote biometric identification in publicly accessible spaces by law enforcement is prohibited under Article 5, with narrow exceptions. This goes beyond high-risk — it is a banned practice unless a specific exemption applies.',
      },
    },

    // ---------------------------------------------------------------
    // 3. Critical Infrastructure
    // ---------------------------------------------------------------
    {
      id: 'critical-infrastructure',
      heading: 'Category 2: Critical Infrastructure (Annex III, Point 2)',
      content:
        'Annex III, point 2 covers AI systems intended to be used as safety components in the management and operation of critical digital infrastructure, road traffic, and the supply of water, gas, heating, and electricity.\n\nThe key phrase is "safety component." An AI system qualifies under this category when a failure or malfunction could directly endanger human life, health, property, or the environment. This is not limited to AI that controls infrastructure directly — it also covers AI that informs safety-critical decisions made by humans who manage that infrastructure.\n\nCritical infrastructure operators have been subject to sectoral safety regulation for decades. The AI Act layers on top of existing frameworks like the NIS2 Directive, the Critical Entities Resilience Directive, and sector-specific rules for energy, transport, and water.',
      list: [
        'AI managing load balancing on electricity grids',
        'Predictive maintenance systems for water treatment plants',
        'Autonomous traffic signal control systems',
        'AI-based gas pipeline leak detection and response routing',
        'Smart grid demand forecasting that triggers automated supply adjustments',
        'AI controlling HVAC systems in critical facilities (hospitals, data centres)',
      ],
      callout: {
        type: 'warning',
        text: 'If your AI feeds into any safety-critical decision in infrastructure management, assume it falls here. The downstream consequences of a wrong classification are severe — both legally and physically.',
      },
    },

    // ---------------------------------------------------------------
    // 4. Education
    // ---------------------------------------------------------------
    {
      id: 'education',
      heading: 'Category 3: Education and Vocational Training (Annex III, Point 3)',
      content:
        'Annex III, point 3 covers AI systems intended to be used for determining access to or admission to educational and vocational training institutions, evaluating learning outcomes, assessing the appropriate level of education for an individual, and monitoring or detecting prohibited behaviour during tests and examinations.\n\nThis category exists because AI in education directly affects a person\'s life trajectory. A wrongly denied university place, an inaccurate exam grade, or a false plagiarism flag can have irreversible consequences for students.\n\nThe scope is broad. It applies to AI used by schools, universities, vocational training providers, online learning platforms, and any organisation offering certified educational outcomes. It covers both public and private institutions.',
      list: [
        'Automated exam grading and essay scoring systems',
        'AI-driven plagiarism detection (e.g. AI-writing detectors)',
        'Student performance prediction models used for intervention or streaming',
        'AI that determines admissions or course placement',
        'Proctoring AI that monitors behaviour during online exams',
        'Adaptive learning platforms that control which content a student can access',
      ],
      callout: {
        type: 'tip',
        text: 'If you sell AI tools to schools or universities, this is your category. "We just provide recommendations" does not exempt you — if the system influences access to education or evaluates outcomes, it is high-risk.',
      },
    },

    // ---------------------------------------------------------------
    // 5. Employment
    // ---------------------------------------------------------------
    {
      id: 'employment',
      heading: 'Category 4: Employment, Workers Management, and Access to Self-Employment (Annex III, Point 4)',
      content:
        'Annex III, point 4 is the most relevant high-risk category for the majority of SMEs. It covers AI systems intended to be used for recruitment, selection, and screening of candidates; for making decisions affecting the terms of work-related relationships, promotion, and termination; for task allocation based on individual behaviour or personal traits; and for monitoring and evaluating the performance and behaviour of workers.\n\nThis is deliberately wide. The EU legislature recognised that AI in employment has an outsized impact on individuals because employment is directly tied to livelihood, dignity, and economic participation. Every sub-use listed here has documented cases of algorithmic bias causing real harm.\n\nRecruitment and CV screening is the most common trigger. If you use any AI tool that filters, ranks, or scores job applicants — including third-party SaaS tools — you are deploying a high-risk AI system and the obligations under Articles 9\u201315 apply to you as a deployer (under Article 26).\n\nPerformance evaluation AI is the second major trigger. This includes AI that scores employee productivity, flags underperformance, recommends promotions, or informs termination decisions. Warehouse worker tracking, call centre performance scoring, and developer productivity metrics all fall here.\n\nTask allocation covers AI that assigns work based on personal characteristics or inferred traits — for example, gig economy platforms that allocate delivery orders based on predicted worker behaviour.\n\nThis category does not require that the AI makes the final decision. If the AI system materially influences a human decision-maker, it is within scope.',
      list: [
        'CV screening and candidate ranking tools (ATS with AI features)',
        'AI interview analysis — scoring video interviews for communication skills or "culture fit"',
        'Automated reference checking platforms',
        'Employee performance scoring and productivity tracking systems',
        'AI that recommends promotions, pay rises, or disciplinary action',
        'Gig economy task allocation algorithms (ride-hailing, food delivery, freelance platforms)',
        'Workforce scheduling AI that allocates shifts based on predicted behaviour',
        'AI tools that flag employees for termination review',
      ],
      callout: {
        type: 'warning',
        text: 'If you use ANY AI in recruitment or HR decisions — even a third-party tool — you have deployer obligations under Article 26. "We didn\'t build it" is not a defence. Document the system, monitor its outputs, and conduct a fundamental rights impact assessment.',
      },
    },

    // ---------------------------------------------------------------
    // 6. Essential Services
    // ---------------------------------------------------------------
    {
      id: 'essential-services',
      heading: 'Category 5: Access to Essential Private and Public Services (Annex III, Point 5)',
      content:
        'Annex III, point 5 covers AI systems intended to be used to evaluate the creditworthiness of natural persons or establish their credit score; for risk assessment and pricing in life and health insurance; for evaluating and classifying emergency calls or for dispatching emergency first response services; and for assessing eligibility for public assistance benefits and services.\n\nThis category targets AI that acts as a gatekeeper to essential services. When an algorithm decides whether you get a loan, how much you pay for insurance, how quickly an ambulance reaches you, or whether you qualify for social benefits, the stakes are existential for the individuals affected.\n\nCredit scoring is the flagship use case. Any AI that evaluates a natural person\'s likelihood of repaying a debt — whether used by a bank, fintech, buy-now-pay-later provider, or landlord — is high-risk. This includes both traditional credit scoring models enhanced with AI and newer "alternative data" models that use social media, spending patterns, or device data.\n\nInsurance risk assessment covers AI used in underwriting for life and health insurance policies. AI that determines premiums, coverage eligibility, or risk categories for individual policyholders falls squarely within scope.\n\nEmergency services dispatch includes AI triage systems that prioritise emergency calls or determine which resources to send. A wrong prioritisation can be fatal.',
      list: [
        'Automated loan decisioning and credit scoring platforms',
        'Buy-now-pay-later risk assessment algorithms',
        'Insurance underwriting AI for life and health policies',
        'AI-driven insurance claims assessment',
        'Emergency call triage and prioritisation systems (112/999)',
        'AI that evaluates eligibility for social welfare or housing benefits',
        'Tenant screening AI used by landlords or letting agencies',
      ],
      callout: {
        type: 'info',
        text: 'Fintech and insurtech companies: if your core product uses AI to assess individuals, you are almost certainly in Category 5. Budget for compliance now — this is not a "nice to have" from August 2026.',
      },
    },

    // ---------------------------------------------------------------
    // 7. Law Enforcement
    // ---------------------------------------------------------------
    {
      id: 'law-enforcement',
      heading: 'Category 6: Law Enforcement (Annex III, Point 6)',
      content:
        'Annex III, point 6 covers AI systems intended to be used by or on behalf of law enforcement authorities for individual risk assessment of natural persons to assess the risk of a person offending or reoffending; as polygraphs and similar tools; to evaluate the reliability of evidence in criminal investigations; and for profiling of natural persons in the course of detection, investigation, or prosecution of criminal offences.\n\nThis category primarily affects public authorities and their contractors. Private companies building tools for law enforcement use are providers of high-risk systems and must meet the full Articles 9\u201315 requirements.\n\nPredictive policing tools — AI that forecasts where crimes will occur or who will commit them — are among the most controversial applications in this category. The Act does not ban them outright (unlike individual-level predictive policing based solely on profiling, which is prohibited under Article 5(1)(d)), but it subjects them to the full high-risk compliance regime.\n\nThe "reliability of evidence" sub-category covers AI used in forensic analysis: matching fingerprints, analysing DNA, interpreting digital evidence, or reconstructing events from surveillance data.',
      list: [
        'Recidivism risk assessment tools used by police or probation services',
        'AI lie detection or deception analysis systems',
        'Automated forensic evidence analysis (fingerprint, DNA, digital)',
        'Predictive policing tools that assess geographic crime risk',
        'AI-driven profiling systems used in criminal investigations',
      ],
      callout: {
        type: 'info',
        text: 'If you are a private company: this category applies to you primarily if you build or supply AI tools to law enforcement. If your product is not intended for law enforcement use, Category 6 does not apply — but check whether Categories 1 or 5 might.',
      },
    },

    // ---------------------------------------------------------------
    // 8. Migration
    // ---------------------------------------------------------------
    {
      id: 'migration',
      heading: 'Category 7: Migration, Asylum, and Border Control (Annex III, Point 7)',
      content:
        'Annex III, point 7 covers AI systems intended to be used by or on behalf of competent public authorities for risk assessment of natural persons entering a Member State regarding security, irregular immigration, or health risks; to assist competent authorities in the examination of applications for asylum, visa, or residence permits and associated complaints; and for detecting, recognising, or identifying natural persons in the context of migration, asylum, and border control management.\n\nThis is heavily oriented towards government use. The affected entities are border agencies, immigration authorities, asylum processing bodies, and their technology suppliers.\n\nAI visa processing systems that score or rank applications, automated risk profiling at borders, and biometric identification of travellers all fall within this category. Where biometric identification is used, Categories 1 and 7 may both apply simultaneously.\n\nPrivate companies typically encounter this category when they supply technology to government agencies — for example, building the AI components of e-gate systems at airports, or developing risk-scoring engines for visa processing platforms.',
      list: [
        'Automated visa and residence permit application scoring',
        'AI risk profiling of travellers at border crossings',
        'Biometric identification systems at airports and ports',
        'AI-assisted asylum application processing and credibility assessment',
        'Document verification AI used in immigration proceedings',
      ],
      callout: {
        type: 'info',
        text: 'Mostly relevant to government agencies and their technology contractors. If you supply AI technology to border or immigration authorities, you are a provider of a high-risk system.',
      },
    },

    // ---------------------------------------------------------------
    // 9. Justice and Democracy
    // ---------------------------------------------------------------
    {
      id: 'justice',
      heading: 'Category 8: Administration of Justice and Democratic Processes (Annex III, Point 8)',
      content:
        'Annex III, point 8 covers AI systems intended to be used by judicial authorities or on their behalf to assist in researching and interpreting facts and the law and in applying the law to a concrete set of facts; and AI systems intended to be used for influencing the outcome of an election or referendum or the voting behaviour of natural persons in the exercise of their vote in elections or referendums (excluding AI systems whose output does not directly interact with natural persons, such as tools used to organise and optimise political campaigns from a logistical standpoint).\n\nThe judicial sub-category covers AI tools that help judges, magistrates, or tribunal members research case law, interpret statutes, or apply legal reasoning. If an AI tool recommends a sentence, predicts a case outcome for a judge, or drafts a judicial decision, it is high-risk.\n\nThe democratic processes sub-category is narrower than it first appears. It targets AI systems that directly attempt to influence how people vote — for example, AI-generated personalised political messaging, deepfake political content generators, or micro-targeting systems designed to manipulate electoral choices. It does not cover general-purpose campaign logistics tools like AI that optimises canvassing routes or schedules rallies.\n\nThe distinction matters: AI that helps a political party manage its operations is not high-risk under this category. AI that generates personalised persuasion content aimed at changing individual voting behaviour is.',
      list: [
        'AI legal research tools used by courts to assist judicial decision-making',
        'Sentencing recommendation or case outcome prediction systems used by judges',
        'AI-drafted judicial decisions or legal reasoning aids',
        'AI-generated personalised political advertising designed to influence votes',
        'Deepfake detection/generation tools used in election contexts',
        'Micro-targeting AI for political campaign messaging aimed at swaying individual voters',
      ],
      callout: {
        type: 'tip',
        text: 'Legal tech companies: if your AI tool is used by courts or judges (not just lawyers in private practice), it is high-risk under Category 8. If it is only used by law firms for their own research, it likely falls outside Annex III — but check the intended use carefully.',
      },
    },

    // ---------------------------------------------------------------
    // 10. How to Classify
    // ---------------------------------------------------------------
    {
      id: 'how-to-classify',
      heading: 'How to Determine Which Category Applies to Your AI System',
      content:
        'Classifying your AI system under Annex III is not a one-time checkbox exercise. It requires a structured analysis of the system\'s intended purpose, the context of deployment, and the population affected. Here is a practical approach.\n\nStep 1: Define the intended purpose. What is the AI system designed to do? Write a clear, one-paragraph description of its function. This description determines classification — not the underlying technology, not the model architecture, and not the marketing copy.\n\nStep 2: Map to Annex III categories. Read each of the eight category descriptions above and ask: does my system\'s intended purpose fall within any of these? Pay attention to the verbs — "intended to be used for" is the operative phrase. If the system could be used for a listed purpose, even if that is not the primary use, it may still qualify.\n\nStep 3: Check the Article 6(2) exception. Even if your system maps to an Annex III category, Article 6(2) provides a narrow exception for AI systems that do not pose a significant risk of harm to health, safety, or fundamental rights. This exception is difficult to claim — the provider must document why the exception applies, and market surveillance authorities can challenge it.\n\nStep 4: Consider multiple categories. A single AI system can fall into more than one Annex III category. A biometric system used for employment screening could trigger both Category 1 and Category 4. The obligations are the same (Articles 9\u201315), but the risk management analysis must address all applicable categories.\n\nStep 5: Document your reasoning. Whether your system is high-risk or not, document the classification analysis. If an authority later disagrees with your assessment, having a documented rationale shows good faith and due diligence.',
      list: [
        'Use Irvo\'s 12-question risk questionnaire to guide classification — it maps your answers directly to Annex III categories',
        'Focus on intended purpose, not underlying technology',
        'Check all eight categories, not just the most obvious one',
        'Document your reasoning even if you conclude the system is not high-risk',
        'Reassess whenever the system\'s purpose or deployment context changes',
      ],
      callout: {
        type: 'tip',
        text: 'Not sure where your system falls? Irvo\'s guided risk questionnaire walks you through 12 targeted questions and maps your answers to the correct Annex III category automatically.',
      },
    },

    // ---------------------------------------------------------------
    // 11. Obligations Summary Table
    // ---------------------------------------------------------------
    {
      id: 'obligations-by-category',
      heading: 'Obligations by Category: Which Articles Apply?',
      content:
        'All eight Annex III categories trigger the same set of mandatory obligations under Articles 9\u201315. There is no "light" version — if your system is classified as high-risk under any Annex III category, the full set of requirements applies. The table below maps each article to its requirement and confirms applicability across all categories.',
      table: {
        headers: [
          'Article',
          'Requirement',
          'Cat 1\nBiometrics',
          'Cat 2\nInfra',
          'Cat 3\nEducation',
          'Cat 4\nEmployment',
          'Cat 5\nServices',
          'Cat 6\nLaw Enf.',
          'Cat 7\nMigration',
          'Cat 8\nJustice',
        ],
        rows: [
          ['Art. 9', 'Risk management system', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713'],
          ['Art. 10', 'Data and data governance', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713'],
          ['Art. 11', 'Technical documentation', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713'],
          ['Art. 12', 'Record-keeping (logging)', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713'],
          ['Art. 13', 'Transparency and information to deployers', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713'],
          ['Art. 14', 'Human oversight', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713'],
          ['Art. 15', 'Accuracy, robustness, and cybersecurity', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713', '\u2713'],
        ],
      },
      callout: {
        type: 'info',
        text: 'The obligations are uniform across all eight categories. What changes between categories is the specific risk context — a biometrics system has different risk factors than a credit scoring system, but both must implement all seven requirements.',
      },
    },
  ],

  faqs: [
    {
      question:'How many high-risk categories are there in the EU AI Act?',
      answer:'There are exactly eight high-risk AI categories listed in Annex III of Regulation (EU) 2024/1689: (1) biometrics, (2) critical infrastructure, (3) education and vocational training, (4) employment and workers management, (5) access to essential services, (6) law enforcement, (7) migration and border control, and (8) administration of justice and democratic processes.',
    },
    {
      question:'Is my HR screening tool high-risk under Annex III?',
      answer:'Almost certainly yes. Annex III, point 4 explicitly covers AI systems used for recruitment, candidate screening, CV filtering, and performance evaluation. If your tool uses AI to rank, score, filter, or recommend candidates — even as one input into a human decision — it is a high-risk system. Both the provider who built it and the deployer who uses it have compliance obligations.',
    },
    {
      question:'Does Annex III apply to AI used internally?',
      answer:'Yes. Annex III does not distinguish between AI used on external customers and AI used on internal employees or processes. An AI system used internally for employee performance monitoring (Category 4) or for internal credit risk decisions (Category 5) is just as high-risk as one deployed externally. The classification depends on the system\'s intended purpose, not who the end users are.',
    },
    {
      question:'What obligations apply to Annex III high-risk systems?',
      answer:'All Annex III high-risk systems must comply with Articles 9\u201315 of the EU AI Act. These require: a risk management system (Art. 9), data governance (Art. 10), technical documentation (Art. 11), automatic logging and record-keeping (Art. 12), transparency and information provision to deployers (Art. 13), human oversight mechanisms (Art. 14), and accuracy, robustness, and cybersecurity standards (Art. 15). Providers must also register the system in the EU database under Article 49.',
    },
    {
      question:'Can an AI system fall into multiple Annex III categories?',
      answer:'Yes. A single AI system can fall into two or more Annex III categories simultaneously. For example, a biometric system used for employee access control could fall under both Category 1 (biometrics) and Category 4 (employment). A credit scoring system used by insurers could fall under Category 5 twice — once for creditworthiness and once for insurance risk. The obligations under Articles 9\u201315 are the same regardless, but the risk management analysis must address the risks specific to each applicable category.',
    },
  ],

  relatedSlugs: ['eu-ai-act-sme-guide', 'compliance-checklist', 'ai-act-hr-recruitment'],
}
