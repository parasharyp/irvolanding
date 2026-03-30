import type { GuideArticle } from './types'
import { article as smeGuide } from './eu-ai-act-sme-guide'
import { article as annexIII } from './annex-iii-categories'
import { article as checklist } from './compliance-checklist'

/** All published guides, keyed by slug. */
export const GUIDES: Record<string, GuideArticle> = {
  [smeGuide.slug]: smeGuide,
  [annexIII.slug]: annexIII,
  [checklist.slug]: checklist,
}

/** Ordered list for the guides index page — most important first. */
export const GUIDE_LIST: GuideArticle[] = [
  smeGuide,
  annexIII,
  checklist,
]

export function getGuideBySlug(slug: string): GuideArticle | undefined {
  return GUIDES[slug]
}

export function getAllSlugs(): string[] {
  return Object.keys(GUIDES)
}
