// Test Supabase Connection with New Configuration
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://vnjfnlnwfhnwzcfkdrsw.supabase.co"
// Note: You need to get these from Supabase Dashboard > Settings > API
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_ANON_KEY_HERE"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SERVICE_KEY_HERE"

console.log("🔍 Testing Supabase Connection...")
console.log(`Project URL: ${supabaseUrl}`)

async function testConnection() {
  try {
    // Test with anon key
    console.log("\n1️⃣ Testing Anonymous Connection...")
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

    // Test basic connection
    const { data: testData, error: testError } = await supabaseAnon.from("profiles").select("count(*)").limit(1)

    if (testError) {
      console.log("❌ Anonymous connection failed:", testError.message)
      console.log("⚠️  Make sure to set NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment")
    } else {
      console.log("✅ Anonymous connection successful")
    }

    // Test with service key
    console.log("\n2️⃣ Testing Service Role Connection...")
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey)

    const { data: serviceData, error: serviceError } = await supabaseService.from("profiles").select("*").limit(1)

    if (serviceError) {
      console.log("❌ Service role connection failed:", serviceError.message)
      console.log("⚠️  Make sure to set SUPABASE_SERVICE_ROLE_KEY in your environment")
    } else {
      console.log("✅ Service role connection successful")
      console.log(`📊 Found ${serviceData?.length || 0} profiles in database`)
    }

    // Test database tables
    console.log("\n3️⃣ Testing Database Tables...")
    const tables = [
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

    for (const table of tables) {
      try {
        const { data, error } = await supabaseService.from(table).select("count(*)").limit(1)

        if (error) {
          console.log(`❌ Table '${table}' not accessible: ${error.message}`)
        } else {
          console.log(`✅ Table '${table}' accessible`)
        }
      } catch (err) {
        console.log(`❌ Table '${table}' error: ${err.message}`)
      }
    }

    // Test data retrieval
    console.log("\n4️⃣ Testing Data Retrieval...")

    // Test profiles
    const { data: profiles, error: profilesError } = await supabaseService.from("profiles").select("*").limit(5)

    if (profilesError) {
      console.log("❌ Failed to retrieve profiles:", profilesError.message)
    } else {
      console.log(`✅ Retrieved ${profiles?.length || 0} profiles`)
      if (profiles && profiles.length > 0) {
        console.log("   Sample profile:", profiles[0].email, "-", profiles[0].role)
      }
    }

    // Test reports
    const { data: reports, error: reportsError } = await supabaseService.from("reports").select("*").limit(5)

    if (reportsError) {
      console.log("❌ Failed to retrieve reports:", reportsError.message)
    } else {
      console.log(`✅ Retrieved ${reports?.length || 0} reports`)
      if (reports && reports.length > 0) {
        console.log("   Sample report:", reports[0].case_id, "-", reports[0].title)
      }
    }

    // Test VAPI reports
    const { data: vapiReports, error: vapiError } = await supabaseService.from("vapi_reports").select("*").limit(3)

    if (vapiError) {
      console.log("❌ Failed to retrieve VAPI reports:", vapiError.message)
    } else {
      console.log(`✅ Retrieved ${vapiReports?.length || 0} VAPI reports`)
      if (vapiReports && vapiReports.length > 0) {
        console.log("   Sample VAPI report:", vapiReports[0].report_id, "-", vapiReports[0].status)
      }
    }

    console.log("\n🎉 Connection test completed!")
    console.log("\n📋 Next Steps:")
    console.log("1. Get your ANON_KEY and SERVICE_ROLE_KEY from Supabase Dashboard")
    console.log("2. Update your .env.local file with the new keys")
    console.log("3. Restart your development server")
    console.log("4. Test the application functionality")
  } catch (error) {
    console.error("💥 Connection test failed:", error)
  }
}

// Run the test
testConnection()
