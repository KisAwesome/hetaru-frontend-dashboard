// instrumentation-client.ts
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  person_profiles: 'identified_only',
  capture_pageview: false, // We still handle this manually or via Provider
  capture_exceptions: true, // ✅ Best for Error Tracking tab
})