import { supabase } from "./supabase";

export interface AuditLogEntry {
  user_id: string;
  action: string;
  entity_type: "case" | "reward" | "assignment" | "query";
  entity_id: string;
  details: any;
}

export class AuditLogger {
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await supabase.from("audit_trail").insert({
        ...entry,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to log audit entry:", error);
    }
  }

  async logCaseAction(
    userId: string,
    caseId: string,
    action: string,
    details: any = {}
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action,
      entity_type: "case",
      entity_id: caseId,
      details,
    });
  }

  async logRewardTransaction(
    userId: string,
    transactionId: string,
    details: any = {}
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action: "reward_processed",
      entity_type: "reward",
      entity_id: transactionId,
      details,
    });
  }
}

export const auditLogger = new AuditLogger();
