// Environment setup script for Node.js
console.log("🔧 Setting up Aegis Whistle Platform environment...")

// Check if we're in a browser environment
if (typeof window !== "undefined") {
  console.log("✅ Running in browser environment")
  console.log("📋 Environment variables available:")

  // List available environment variables (client-side only)
  const envVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_VAPI_API_KEY",
    "NEXT_PUBLIC_VAPI_ASSISTANT_ID",
  ]

  envVars.forEach((varName) => {
    const value = process.env[varName]
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`)
    } else {
      console.log(`❌ ${varName}: Not set`)
    }
  })
} else {
  console.log("✅ Running in Node.js environment")
  console.log("📋 Server environment variables available:")

  // Check server-side environment variables
  const serverEnvVars = ["POSTGRES_URL", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]

  serverEnvVars.forEach((varName) => {
    const value = process.env[varName]
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`)
    } else {
      console.log(`❌ ${varName}: Not set`)
    }
  })
}

console.log("🎉 Environment setup complete!")
console.log("💡 Next steps:")
console.log("   1. Run the SQL script to create database tables")
console.log("   2. Test the login with demo credentials")
console.log("   3. Check the ethics officer dashboard")
