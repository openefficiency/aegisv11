// Simple connection test for Supabase
const { createClient } = require("@supabase/supabase-js")

async function testConnection() {
  console.log("🔍 Testing Supabase Connection...")

  // Use your Supabase credentials
  const supabaseUrl = "https://vnjfnlnwfhnwzcfkdrsw.supabase.co"
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_ANON_KEY_HERE"

  if (!supabaseKey || supabaseKey === "YOUR_ANON_KEY_HERE") {
    console.log("❌ Please set your NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables")
    console.log("   Get it from: https://supabase.com/dashboard/project/vnjfnlnwfhnwzcfkdrsw/settings/api")
    return
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test basic connection
    console.log("📡 Testing basic connection...")
    const { data, error } = await supabase.from("profiles").select("count(*)")

    if (error) {
      console.log("❌ Connection failed:", error.message)
      return
    }

    console.log("✅ Connection successful!")
    console.log("📊 Found profiles table")

    // Test reports table
    console.log("📡 Testing reports table...")
    const { data: reports, error: reportsError } = await supabase
      .from("reports")
      .select("case_id, title, report_source")
      .limit(5)

    if (reportsError) {
      console.log("⚠️ Reports table not accessible:", reportsError.message)
    } else {
      console.log("✅ Reports table accessible")
      console.log(`📋 Found ${reports.length} sample reports`)
      reports.forEach((report) => {
        console.log(`   - ${report.case_id}: ${report.title} (${report.report_source})`)
      })
    }

    console.log("\n🎉 Database setup appears to be working!")
    console.log("🔗 Next steps:")
    console.log("   1. Update your .env.local file with the anon key")
    console.log("   2. Test the application in your browser")
    console.log("   3. Try making a test report")
  } catch (error) {
    console.log("❌ Unexpected error:", error.message)
  }
}

// Run the test
testConnection()
