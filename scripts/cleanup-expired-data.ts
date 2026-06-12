import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const retentionDays = process.env.DATA_RETENTION_DAYS
  ? parseInt(process.env.DATA_RETENTION_DAYS, 10)
  : 365;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function cleanup() {
  console.log(`Starting cleanup: deleting records older than ${retentionDays} days...`);

  const { data, error } = await supabase.rpc("delete_expired_data", {
    retention_days: retentionDays,
  });

  if (error) {
    console.error("Cleanup failed:", error.message);
    process.exit(1);
  }

  console.log(`Cleanup complete: deleted ${data} expired records`);
}

cleanup();
