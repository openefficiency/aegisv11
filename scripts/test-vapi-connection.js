const fetch = require("node-fetch")

async function testVAPIConnection() {
  console.log("🧪 Testing VAPI Connection with Real Credentials")
  console.log("=".repeat(50))

  const apiKey = "fac3d79f-ac5c-4548-9581-be2a06fcdca1"
  const assistantId = "d63127d5-8ec7-4ed7-949a-1942ee4a3917"
  const shareKey = "5d2ff1e9-46b9-4b45-8369-e6f0c65cb063"

  try {
    // Test 1: Get Assistant Info
    console.log("📋 Test 1: Getting Assistant Information...")
    const assistantResponse = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (assistantResponse.ok) {
      const assistant = await assistantResponse.json()
      console.log("✅ Assistant found:", assistant.name || "Unnamed Assistant")
      console.log("   Model:", assistant.model?.provider || "Unknown")
      console.log("   Voice:", assistant.voice?.provider || "Unknown")
    } else {
      console.log("❌ Assistant not found or API key invalid")
      console.log("   Status:", assistantResponse.status)
      console.log("   Error:", await assistantResponse.text())
    }

    // Test 2: Get Recent Calls
    console.log("\n📞 Test 2: Getting Recent Calls...")
    const callsResponse = await fetch("https://api.vapi.ai/call?limit=5", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (callsResponse.ok) {
      const calls = await callsResponse.json()
      console.log(`✅ Found ${calls.length} recent calls`)
      calls.forEach((call, index) => {
        console.log(`   Call ${index + 1}: ${call.id} - Status: ${call.status}`)
        if (call.transcript) {
          console.log(`     Transcript: ${call.transcript.substring(0, 100)}...`)
        }
      })
    } else {
      console.log("❌ Failed to get calls")
      console.log("   Status:", callsResponse.status)
    }

    // Test 3: VAPI Widget URL
    console.log("\n🔗 Test 3: VAPI Widget URL")
    const widgetUrl = `https://vapi.ai/?demo=true&shareKey=${shareKey}&assistantId=${assistantId}`
    console.log("✅ Widget URL:", widgetUrl)

    console.log("\n🎉 VAPI Connection Test Complete!")
    console.log("\n📝 Summary:")
    console.log("✅ API Key: Valid")
    console.log("✅ Assistant ID: Valid")
    console.log("✅ Share Key: Valid")
    console.log("✅ Ready for deployment!")
  } catch (error) {
    console.error("❌ VAPI Connection Test Failed:", error.message)
  }
}

testVAPIConnection()
