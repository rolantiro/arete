/**
 * ARÉTÉ — Create first admin account
 *
 * Creates a Supabase Auth user AND its matching row in
 * public.admins, so the account can immediately sign in and pass
 * the `is_admin()` RLS check.
 *
 * Usage:
 *   node scripts/create-admin.mjs admin@arete.id YourStrongPassword123 "Nama Admin"
 *
 * Requires these env vars to be set (e.g. via `.env.local`, loaded
 * automatically if you run with `node --env-file=.env.local`):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";

const [, , email, password, fullName] = process.argv;

if (!email || !password) {
  console.error(
    "Usage: node scripts/create-admin.mjs <email> <password> [\"Full Name\"]"
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run this with: node --env-file=.env.local scripts/create-admin.mjs ..."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: userResult, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (userError) {
    console.error("Failed to create auth user:", userError.message);
    process.exit(1);
  }

  const userId = userResult.user.id;

  const { error: adminError } = await supabase.from("admins").insert({
    id: userId,
    full_name: fullName || "Admin",
    role: "super_admin",
  });

  if (adminError) {
    console.error("Failed to create admin profile:", adminError.message);
    console.error(
      `Auth user was created (id: ${userId}) but the admins row was not. ` +
        "You can insert it manually in the Supabase SQL editor:\n" +
        `insert into public.admins (id, full_name, role) values ('${userId}', '${fullName || "Admin"}', 'super_admin');`
    );
    process.exit(1);
  }

  console.log("✅ Admin account created successfully!");
  console.log(`   Email: ${email}`);
  console.log(`   User ID: ${userId}`);
  console.log("   You can now log in at /admin/login");
}

main();
