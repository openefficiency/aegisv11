// Debug VAPI Voice Report Setup (Server-side only)

console.log("🔍 VAPI Voice Report Troubleshooting\n")

// Check environment variables (server-side only, no sensitive data exposed)
console.log("📋 Environment Variables Check:")
console.log("================================")

const requiredVars = ["NEXT_PUBLIC_VAPI_ASSISTANT_ID", "VAPI_API_KEY", "VAPI_SHARE_KEY"]

const missingVars = []

requiredVars.forEach((varName) => {
  const value = process.env[varName]
  if (value) {
    // Only show first few characters for security
    console.log(`✅ ${varName}: ${value.substring(0, 8)}...`)
  } else {
    console.log(`❌ ${varName}: MISSING`)
    missingVars.push(varName)
  }
})

if (missingVars.length > 0) {
  console.log("\n🚨 MISSING ENVIRONMENT VARIABLES:")
  console.log("=================================")
  missingVars.forEach((varName) => {
    console.log(`❌ ${varName}`)
  })

  console.log("\n🔧 How to fix:")
  console.log("1. Check your .env.local file")
  console.log("2. Make sure all VAPI variables are set")
  console.log("3. Restart your development server")
  console.log("4. Check the Vercel dashboard for production variables")
}

// Test VAPI API connection (server-side only)
console.log("\n🌐 Testing VAPI API Connection:")
console.log("===============================")

async function testVAPIConnection() {
  try {
    const apiKey = process.env.VAPI_API_KEY
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID

    if (!apiKey) {
      console.log("❌ Cannot test - Private API key missing")
      return false
    }

    if (!assistantId) {
      console.log("❌ Cannot test - Assistant ID missing")
      return false
    }

    console.log("🔄 Testing VAPI API connection...")

    const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const assistant = await response.json()
      console.log("✅ VAPI API connection successful!")
      console.log(`📋 Assistant Name: ${assistant.name || "Unnamed"}`)
      console.log(`🎯 Assistant ID: ${assistantId}`)
      return true
    } else {
      console.log(`❌ VAPI API error: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.log(`📄 Error details: ${errorText}`)
      return false
    }
  } catch (error) {
    console.log("❌ VAPI API connection failed:")
    console.log(error.message)
    return false
  }
}

// Common issues and solutions
console.log("\n🔧 Common Issues & Solutions:")
console.log("=============================")

const commonIssues = [
  {
    issue: "Voice widget not loading",
    solutions: [
      "Check if environment variables are set correctly",
      "Ensure you're using HTTPS (required for microphone access)",
      "Check browser compatibility",
      "Try the embedded iframe approach",
    ],
  },
  {
    issue: "Microphone permission denied",
    solutions: [
      "Click the microphone icon in browser address bar",
      "Allow microphone access for this site",
      "Check browser settings for microphone permissions",
      "Try in an incognito/private window",
    ],
  },
  {
    issue: "Call not connecting",
    solutions: [
      "Verify VAPI API key and Assistant ID on server",
      "Check network connectivity",
      "Ensure VAPI assistant is properly configured",
      "Try using the share link approach",
    ],
  },
  {
    issue: "Security deployment errors",
    solutions: [
      "Ensure no sensitive keys are exposed to client",
      "Use server actions for API calls",
      "Use iframe or share link approach for voice",
      "Keep private keys server-side only",
    ],
  },
]

commonIssues.forEach((item, index) => {
  console.log(`\n${index + 1}. ${item.issue}:`)
  item.solutions.forEach((solution) => {
    console.log(`   • ${solution}`)
  })
})

// Run the tests
async function runDiagnostics() {
  console.log("\n🚀 Running Diagnostics:")
  console.log("=======================")

  // Test VAPI connection
  const vapiConnected = await testVAPIConnection()

  console.log("\n📊 Diagnostic Summary:")
  console.log("======================")
  console.log(`Environment Variables: ${missingVars.length === 0 ? "✅ All Set" : "❌ Missing Variables"}`)
  console.log(`VAPI API Connection: ${vapiConnected ? "✅ Working" : "❌ Failed"}`)

  if (missingVars.length === 0 && vapiConnected) {
    console.log("\n🎉 Server-side checks passed! Voice reports should work.")
    console.log("🔒 Security: No sensitive keys are exposed to the client.")
    console.log("Note: Client-side checks (browser compatibility, microphone) need to be tested in the browser.")
  } else {
    console.log("\n⚠️  Issues found. Please address the problems above.")
  }
}

// Run diagnostics
runDiagnostics().catch(console.error)
