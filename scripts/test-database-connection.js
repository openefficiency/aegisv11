const fs = require("fs")

console.log("🔍 Testing Supabase Database Connection")
console.log("=====================================")

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
const postgresUrl = process.env.POSTGRES_URL

console.log("📋 Environment Variables Check:")
console.log(`✅ Supabase URL: ${supabaseUrl ? "✓" : "✗"}`)
console.log(`✅ Supabase Anon Key: ${supabaseAnonKey ? "✓" : "✗"}`)
console.log(`✅ Postgres URL: ${postgresUrl ? "✓" : "✗"}`)

if (!supabaseUrl || !supabaseAnonKey) {
  console.log("❌ Missing required environment variables")
  process.exit(1)
}

// Test Supabase connection using fetch
async function testConnection() {
  try {
    console.log("\n🔗 Testing Supabase Connection...")

    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    })

    if (response.ok) {
      console.log("✅ Supabase connection successful")

      // Test a simple query
      const tablesResponse = await fetch(
        `${supabaseUrl}/rest/v1/information_schema.tables?select=table_name&table_schema=eq.public`,
        {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        },
      )

      if (tablesResponse.ok) {
        const tables = await tablesResponse.json()
        console.log(`✅ Found ${tables.length} tables in database`)
        console.log("✅ Database query test passed")
      } else {
        console.log("⚠️ Connection successful but query failed")
      }
    } else {
      console.log("❌ Supabase connection failed")
      console.log(`   Status: ${response.status}`)
    }
  } catch (error) {
    console.log("❌ Connection test failed:", error.message)
  }
}

// Run the test
testConnection().then(() => {
  console.log("\n🎉 Database connection test complete!")
  console.log("\n📝 Next steps:")
  console.log("1. Run the SQL scripts in Supabase SQL Editor")
  console.log("2. Run: node scripts/verify-supabase-setup.js")
})
