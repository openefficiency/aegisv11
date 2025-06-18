// Test script to verify VAPI network connectivity (No sensitive data)
console.log("🧪 Testing VAPI network connectivity...")

// Test the CDNs
async function testCDN(url, name) {
  try {
    console.log(`Testing ${name}: ${url}`)
    const response = await fetch(url, { method: "HEAD" })
    if (response.ok) {
      console.log(`✅ ${name} is accessible`)
      return true
    } else {
      console.log(`❌ ${name} returned status: ${response.status}`)
      return false
    }
  } catch (error) {
    console.log(`❌ ${name} failed: ${error.message}`)
    return false
  }
}

async function testAllCDNs() {
  const cdns = [
    { url: "https://cdn.vapi.ai/web/v1.0.0/index.js", name: "Primary VAPI CDN" },
    { url: "https://unpkg.com/@vapi-ai/web@latest/dist/index.js", name: "UNPKG CDN" },
    { url: "https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js", name: "JSDelivr CDN" },
  ]

  console.log("🔍 Testing CDN accessibility...")

  for (const cdn of cdns) {
    await testCDN(cdn.url, cdn.name)
  }

  // Test environment variables (server-side only, no sensitive data)
  console.log("\n🔑 Checking environment variables...")
  console.log("NEXT_PUBLIC_VAPI_ASSISTANT_ID:", process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ? "✅ Set" : "❌ Missing")
  console.log("VAPI_API_KEY:", process.env.VAPI_API_KEY ? "✅ Set (server-side)" : "❌ Missing")
  console.log("VAPI_SHARE_KEY:", process.env.VAPI_SHARE_KEY ? "✅ Set (server-side)" : "❌ Missing")

  console.log("\n🔒 Security Note:")
  console.log("All sensitive API keys are kept server-side only.")
  console.log("Client uses secure iframe and share link approach.")

  console.log("\n🎯 Network test complete!")
  console.log("Note: For full testing including browser compatibility, visit /test-voice in your browser.")
}

testAllCDNs()
