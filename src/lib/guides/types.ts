// ─── Guide Article Types ────────────────────────────────────────────────

export interface GuideSection {
  id: string
  heading: string
  content: string
  table?: {
    headers: string[]
    rows: string[][]
  }
  list?: string[]
  callout?: {
    type: 'info' | 'warning' | 'tip'
    text: string
  }
}

export interface GuideFAQ {
  question: string
  answer: string
}

export interface GuideArticle {
  slug: string
  title: string
  metaDescription: string
  headline: string
  subtitle: string
  author: string
  publishedAt: string
  updatedAt: string
  readingTime: string
  category: string
  tags: string[]
  ctaVariant: 'waitlist' | 'signup' | 'assessment'
  sections: GuideSection[]
  faqs: GuideFAQ[]
  relatedSlugs: string[]
  tldr: string
}
