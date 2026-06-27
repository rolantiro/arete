"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginSchema } from "@/lib/validations";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "email") fieldErrors.email = issue.message;
        if (issue.path[0] === "password") fieldErrors.password = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error("[admin-login] signInWithPassword error:", error);
        toast.error(`Gagal masuk: ${error.message}`);
        setLoading(false);
        return;
      }

      toast.success("Berhasil masuk");
      const redirectTo = searchParams.get("redirectTo") || "/admin/dashboard";
      // Hard navigation (not router.push) so the browser sends a fresh
      // request with the just-set Supabase auth cookie already attached.
      // A client-side transition can race ahead of the cookie write and
      // cause middleware to see a stale/missing session, bouncing back
      // to /admin/login in a loop.
      window.location.href = redirectTo;
    } catch (err) {
      console.error("[admin-login] unexpected exception:", err);
      const message = err instanceof Error ? err.message : "Kesalahan tidak diketahui";
      toast.error(`Terjadi kesalahan: ${message}`);
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-sm"
    >
      <div className="mb-10 text-center">
        <span className="font-display text-3xl tracking-[0.15em]">ARÉTÉ</span>
        <p className="tracked mt-3 text-xs text-[var(--color-grey-500)]">
          Portal Admin
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="admin@arete.id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="username"
        />
        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />
        <Button type="submit" isLoading={loading} className="mt-2 w-full">
          {loading ? "Memproses" : "Masuk"}
        </Button>
      </form>
    </motion.div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] px-6">
      <Suspense
        fallback={<Loader2 className="h-6 w-6 animate-spin text-[var(--color-grey-500)]" />}
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
