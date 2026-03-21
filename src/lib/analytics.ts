export type AnalyticsEvent =
  | 'landing_cta_clicked'
  | 'waitlist_submitted'
  | 'waitlist_duplicate'
  | 'founding_discount_clicked'
  | 'walkthrough_clicked'
  | 'pricing_viewed'

export interface TrackPayload {
  event: AnalyticsEvent
  cta_label?: string
  section?: string
  page?: string
  source?: string
}

export function track(payload: TrackPayload): void {
  if (typeof window === 'undefined') return
  if (process.env.NODE_ENV !== 'production') {
    console.log('[analytics]', payload)
  }
  try {
    // Plausible
    if (typeof (window as any).plausible === 'function') {
      (window as any).plausible(payload.event, { props: { ...payload } })
    }
    // PostHog
    if (typeof (window as any).posthog?.capture === 'function') {
      (window as any).posthog.capture(payload.event, { ...payload })
    }
  } catch {
    // swallow — analytics must never break the page
  }
}
