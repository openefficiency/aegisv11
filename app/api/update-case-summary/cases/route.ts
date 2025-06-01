// app/api/cases/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auditLogger } from "@/lib/audit-logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const assignedTo = searchParams.get("assignedTo");

    let query = supabase
      .from("cases")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (assignedTo) {
      query = query.eq("assigned_to", assignedTo);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const caseData = await request.json();

    const { data, error } = await supabase
      .from("cases")
      .insert({
        ...caseData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await auditLogger.logCaseAction(
      caseData.created_by || "system",
      data.id,
      "case_created",
      caseData
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json(
      { error: "Failed to create case" },
      { status: 500 }
    );
  }
}

// // app/api/cases/[id]/route.ts
// import { NextResponse } from "next/server";
// import { supabase } from "@/lib/supabase";
// import { auditLogger } from "@/lib/audit-logger";

// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { data, error } = await supabase
//       .from("cases")
//       .select("*")
//       .eq("id", params.id)
//       .single();

//     if (error) throw error;

//     return NextResponse.json({ success: true, data });
//   } catch (error) {
//     console.error("Error fetching case:", error);
//     return NextResponse.json({ error: "Case not found" }, { status: 404 });
//   }
// }

// export async function PUT(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const updates = await request.json();

//     const { data, error } = await supabase
//       .from("cases")
//       .update({
//         ...updates,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", params.id)
//       .select()
//       .single();

//     if (error) throw error;

//     await auditLogger.logCaseAction(
//       updates.updated_by || "system",
//       params.id,
//       "case_updated",
//       updates
//     );

//     return NextResponse.json({ success: true, data });
//   } catch (error) {
//     console.error("Error updating case:", error);
//     return NextResponse.json(
//       { error: "Failed to update case" },
//       { status: 500 }
//     );
//   }
// }

// // app/api/investigators/route.ts
// import { NextResponse } from "next/server";
// import { supabase } from "@/lib/supabase";

// export async function GET() {
//   try {
//     const { data, error } = await supabase
//       .from("profiles")
//       .select("*")
//       .eq("role", "investigator")
//       .eq("is_active", true)
//       .order("first_name");

//     if (error) throw error;

//     return NextResponse.json({ success: true, data });
//   } catch (error) {
//     console.error("Error fetching investigators:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch investigators" },
//       { status: 500 }
//     );
//   }
// }

// // app/api/queries/route.ts
// import { NextResponse } from "next/server";
// import { supabase } from "@/lib/supabase";
// import { auditLogger } from "@/lib/audit-logger";

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const caseId = searchParams.get("caseId");
//     const investigatorId = searchParams.get("investigatorId");

//     let query = supabase
//       .from("investigator_queries")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (caseId) {
//       query = query.eq("case_id", caseId);
//     }

//     if (investigatorId) {
//       query = query.eq("investigator_id", investigatorId);
//     }

//     const { data, error } = await query;

//     if (error) throw error;

//     return NextResponse.json({ success: true, data });
//   } catch (error) {
//     console.error("Error fetching queries:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch queries" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const queryData = await request.json();

//     const { data, error } = await supabase
//       .from("investigator_queries")
//       .insert({
//         ...queryData,
//         status: "pending",
//         created_at: new Date().toISOString(),
//       })
//       .select()
//       .single();

//     if (error) throw error;

//     await auditLogger.logCaseAction(
//       queryData.investigator_id,
//       queryData.case_id,
//       "query_sent",
//       { query_text: queryData.query_text }
//     );

//     return NextResponse.json({ success: true, data });
//   } catch (error) {
//     console.error("Error creating query:", error);
//     return NextResponse.json(
//       { error: "Failed to create query" },
//       { status: 500 }
//     );
//   }
// }

// // app/api/stats/route.ts
// import { NextResponse } from "next/server";
// import { supabase } from "@/lib/supabase";

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const role = searchParams.get("role");
//     const userId = searchParams.get("userId");

//     // Get basic case statistics
//     const { data: cases, error: casesError } = await supabase
//       .from("cases")
//       .select("status, reward_amount, recovery_amount, priority, assigned_to");

//     if (casesError) throw casesError;

//     const stats = {
//       totalCases: cases.length,
//       openCases: cases.filter((c) => c.status === "open").length,
//       underInvestigation: cases.filter(
//         (c) => c.status === "under_investigation"
//       ).length,
//       resolvedCases: cases.filter((c) => c.status === "resolved").length,
//       escalatedCases: cases.filter((c) => c.status === "escalated").length,
//       highPriorityCases: cases.filter(
//         (c) => c.priority === "high" || c.priority === "critical"
//       ).length,
//       totalRewards: cases.reduce((sum, c) => sum + (c.reward_amount || 0), 0),
//       totalRecovery: cases.reduce(
//         (sum, c) => sum + (c.recovery_amount || 0),
//         0
//       ),
//     };

//     // Role-specific statistics
//     if (role === "investigator" && userId) {
//       const assignedCases = cases.filter((c) => c.assigned_to === userId);
//       return NextResponse.json({
//         success: true,
//         data: {
//           ...stats,
//           assignedCases: assignedCases.length,
//           assignedInProgress: assignedCases.filter(
//             (c) => c.status === "under_investigation"
//           ).length,
//           assignedCompleted: assignedCases.filter(
//             (c) => c.status === "resolved"
//           ).length,
//         },
//       });
//     }

//     return NextResponse.json({ success: true, data: stats });
//   } catch (error) {
//     console.error("Error fetching statistics:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch statistics" },
//       { status: 500 }
//     );
//   }
// }
