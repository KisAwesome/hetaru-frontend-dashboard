'use client'

import posthog from "posthog-js";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // This catches heavy React-level crashes
    posthog.captureException(error);
    console.error("Global Error Captured:", error);
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={500} />
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}