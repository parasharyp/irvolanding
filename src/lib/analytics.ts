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
    const w = window as Window & {
      plausible?: (event: string, opts: { props: TrackPayload }) => void
      posthog?: { capture: (event: string, props: TrackPayload) => void }
    }
    if (typeof w.plausible === 'function') {
      w.plausible(payload.event, { props: { ...payload } })
    }
    // PostHog
    if (typeof w.posthog?.capture === 'function') {
      w.posthog.capture(payload.event, { ...payload })
    }
  } catch {
    // swallow — analytics must never break the page
  }
}
