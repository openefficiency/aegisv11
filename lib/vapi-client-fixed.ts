import { VAPIClient } from "@vapi-ai/client"

// Create a server-side only instance of the VAPI client
export const vapiClient = new VAPIClient({
  apiKey: process.env.VAPI_API_KEY || "",
  baseUrl: "https://api.vapi.ai",
  assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "d63127d5-8ec7-4ed7-949a-1942ee4a3917",
  shareKey: process.env.VAPI_SHARE_KEY || "5d2ff1e9-46b9-4b45-8369-e6f0c65cb063",
})
