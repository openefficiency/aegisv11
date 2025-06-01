import { NextResponse } from "next/server";
import { cryptoRewardSystem } from "@/lib/crypto-utils";
import { supabase } from "@/lib/supabase";
import { auditLogger } from "@/lib/audit-logger";

export async function POST(request: Request) {
  try {
    const { caseId, amount, currency, address, userId } = await request.json();

    // Validate crypto address
    const isValidAddress = await cryptoRewardSystem.validateAddress(
      address,
      currency
    );
    if (!isValidAddress) {
      return NextResponse.json(
        { error: "Invalid crypto address" },
        { status: 400 }
      );
    }

    // Create reward transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from("reward_transactions")
      .insert({
        case_id: caseId,
        amount: parseFloat(amount),
        crypto_currency: currency,
        crypto_address: address,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Process crypto reward
    const rewardResult = await cryptoRewardSystem.processReward({
      amount: parseFloat(amount),
      currency,
      address,
      caseId,
    });

    if (rewardResult.success) {
      // Update transaction with success
      await supabase
        .from("reward_transactions")
        .update({
          status: "completed",
          transaction_hash: rewardResult.transactionHash,
          completed_at: new Date().toISOString(),
        })
        .eq("id", transaction.id);

      // Update case reward status
      await supabase
        .from("cases")
        .update({ reward_status: "paid" })
        .eq("id", caseId);

      await auditLogger.logRewardTransaction(userId, transaction.id, {
        amount,
        currency,
        transaction_hash: rewardResult.transactionHash,
      });

      return NextResponse.json({
        success: true,
        transactionHash: rewardResult.transactionHash,
        transactionId: transaction.id,
      });
    } else {
      // Update transaction with failure
      await supabase
        .from("reward_transactions")
        .update({ status: "failed" })
        .eq("id", transaction.id);

      return NextResponse.json({ error: rewardResult.error }, { status: 500 });
    }
  } catch (error) {
    console.error("Error processing crypto reward:", error);
    return NextResponse.json(
      { error: "Failed to process reward" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");

    if (!caseId) {
      return NextResponse.json({ error: "Case ID required" }, { status: 400 });
    }

    const { data: transactions, error } = await supabase
      .from("reward_transactions")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching reward transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
