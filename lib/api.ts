import { auth } from "./firebase";

// Change this to your Cloud Run URL later when you deploy
const BACKEND_URL = "http://localhost:8080"; 

export const api = {
  
  // 1. GET Request (For fetching data like Balance)
  get: async (endpoint: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");
    
    // Get the fresh security token from Firebase
    const token = await user.getIdToken();

    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // <--- Attaches the ID Card
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const error = await res.json();
            console.error("API Error:", error);

      throw new Error(error.message || "API Request Failed");
    }

    return res.json();
  },

  // 2. POST Request (For registering or using AI)
  post: async (endpoint: string, body: any) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");
    
    const token = await user.getIdToken();

    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("API Error:", error);
      throw new Error(error.message || "API Request Failed");
    }

    return res.json();
  }
};