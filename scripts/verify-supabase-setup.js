const fs = require("fs")

console.log("🔍 Verifying Complete Supabase Setup")
console.log("====================================")

// Check if .env.local exists
if (!fs.existsSync(".env.local")) {
  console.log("❌ .env.local file not found")
  console.log("   Run: node scripts/setup-supabase-environment.js")
  process.exit(1)
}

// Load environment variables
require("dotenv").config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Required tables for the application
const requiredTables = [
  "profiles",
  "reports",
  "cases",
  "vapi_reports",
  "case_updates",
  "interviews",
  "investigator_queries",
  "audit_trails",
  "reward_transactions",
]

async function verifySetup() {
  try {
    console.log("📋 Checking Environment Variables...")
    console.log(`✅ Supabase URL: ${supabaseUrl ? "✓" : "✗"}`)
    console.log(`✅ Supabase Anon Key: ${supabaseAnonKey ? "✓" : "✗"}`)

    if (!supabaseUrl || !supabaseAnonKey) {
      console.log("❌ Missing required environment variables")
      return
    }

    console.log("\n🔗 Testing Supabase Connection...")
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    })

    if (!response.ok) {
      console.log("❌ Supabase connection failed")
      return
    }
    console.log("✅ Supabase connection successful")

    console.log("\n📊 Checking Required Tables...")
    for (const table of requiredTables) {
      try {
        const tableResponse = await fetch(`${supabaseUrl}/rest/v1/${table}?select=count&limit=1`, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            Prefer: "count=exact",
          },
        })

        if (tableResponse.ok) {
          console.log(`✅ Table '${table}': EXISTS`)
        } else {
          console.log(`❌ Table '${table}': MISSING`)
        }
      } catch (error) {
        console.log(`❌ Table '${table}': ERROR - ${error.message}`)
      }
    }

    console.log("\n👥 Checking Sample Data...")

    // Check profiles table
    try {
      const profilesResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=count`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          Prefer: "count=exact",
        },
      })

      if (profilesResponse.ok) {
        const profileCount = profilesResponse.headers.get("content-range")?.split("/")[1] || "0"
        console.log(`✅ Profiles: ${profileCount} records`)
      }
    } catch (error) {
      console.log("⚠️ Could not check profiles data")
    }

    // Check reports table
    try {
      const reportsResponse = await fetch(`${supabaseUrl}/rest/v1/reports?select=count`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          Prefer: "count=exact",
        },
      })

      if (reportsResponse.ok) {
        const reportCount = reportsResponse.headers.get("content-range")?.split("/")[1] || "0"
        console.log(`✅ Reports: ${reportCount} records`)
      }
    } catch (error) {
      console.log("⚠️ Could not check reports data")
    }
  } catch (error) {
    console.log("❌ Verification failed:", error.message)
  }
}

// Run the verification
verifySetup().then(() => {
  console.log("\n🎉 Supabase setup verification complete!")
  console.log("\n📝 If any tables are missing:")
  console.log("1. Go to your Supabase SQL Editor")
  console.log("2. Run: scripts/supabase-complete-setup.sql")
  console.log("3. Run: scripts/supabase-populate-data.sql")
})
