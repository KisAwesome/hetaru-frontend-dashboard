import { auth } from "./firebase";
import posthog from "posthog-js";

const BACKEND_URL = "http://localhost:8080";

type PostOptions = {
  headers?: Record<string, string>;
  formData?: boolean; // if true, body is FormData
};

export const api = {
  get: async (endpoint: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const token = await user.getIdToken();

    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "API Request Failed";
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {}

      if (res.status !== 402) {
        posthog.captureException(new Error(`API GET Failed: ${res.status} - ${endpoint}`), {
          status: res.status,
          error_detail: errorMessage,
          userId: user.uid,
        });
      }

      throw new Error(errorMessage);
    }

    return res.json();
  },

  post: async (endpoint: string, body: any, options: PostOptions = {}) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const token = await user.getIdToken();

    const isForm = options.formData === true;
    const extraHeaders = options.headers || {};

    // IMPORTANT:
    // - If sending FormData, DO NOT set Content-Type manually.
    //   Browser will set it with the correct boundary.
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      ...extraHeaders,
      ...(isForm ? {} : { "Content-Type": "application/json" }),
    };

    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: isForm ? (body as FormData) : JSON.stringify(body),
    });

    if (!res.ok) {
      let errorMessage = "API Request Failed";
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {}

      // ignore expected user errors
      if (res.status === 402 || res.status === 413) {
        throw new Error(errorMessage);
      }

      posthog.captureException(new Error(`API POST Failed: ${res.status} - ${endpoint}`), {
        status: res.status,
        error_detail: errorMessage,
        userId: user.uid,
      });

      throw new Error(errorMessage);
    }

    return res.json();
  },
};
