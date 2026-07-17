import { supabaseAdmin } from "./supabase-admin";
import { logger } from "./logger";

export async function logAuditEvent(params: {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  if (!supabaseAdmin) {
    logger.warn('Audit log skipped: supabaseAdmin not configured');
    return;
  }

  const { error } = await supabaseAdmin.from("audit_log").insert({
    user_id: params.userId,
    action: params.action,
    resource: params.resource,
    resource_id: params.resourceId,
    details: params.details,
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
  });

  if (error) {
    logger.error("Audit log insert failed:", error);
  }
}
