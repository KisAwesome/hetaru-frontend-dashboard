import { auth } from "./firebase";
import posthog from "posthog-js"; // ✅ Import posthog

const BACKEND_URL = "http://localhost:8080"; 

export const api = {
  
  // 1. GET Request
  get: async (endpoint: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");
    
    const token = await user.getIdToken();

    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        
        // ✅ Capture API-level errors (400s, 500s)
        posthog.captureException(new Error(`API GET Failed: ${res.status}`), {
          properties: {
            endpoint,
            status: res.status,
            error_detail: errorData.message || errorData.error,
            userId: user.uid
          }
        });

        throw new Error(errorData.message || "API Request Failed");
      }

      return res.json();
    } catch (err: any) {
      // ✅ Capture Network/CORS errors
      posthog.captureException(err, {
        properties: { 
          endpoint, 
          type: 'network_or_cors_error',
          userId: user.uid 
        }
      });
      throw err;
    }
  },

  // 2. POST Request
  post: async (endpoint: string, body: any) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");
    
    const token = await user.getIdToken();

    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        
        // ✅ Log detailed billing/AI errors to PostHog
        posthog.captureException(new Error(`API POST Failed: ${res.status}`), {
          properties: {
            endpoint,
            status: res.status,
            error_detail: errorData.message || errorData.error,
            request_body: body, // Careful not to log sensitive data here
            userId: user.uid
          }
        });

        throw new Error(errorData.message || "API Request Failed");
      }

      return res.json();
    } catch (err: any) {
      // ✅ Capture unexpected crashes or network failures
      posthog.captureException(err, {
        properties: { 
          endpoint, 
          type: 'post_request_crash',
          userId: user.uid 
        }
      });
      throw err;
    }
  }
};