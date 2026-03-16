"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function mapResetError(error: string): string {
  const normalized = error.toLowerCase();

  if (normalized.includes("expired") || normalized.includes("invalid")) {
    return "Link inválido ou expirado. Solicite um novo e-mail de recuperação.";
  }

  if (normalized.includes("session")) {
    return "Sessão inválida ou expirada. Solicite um novo e-mail de recuperação.";
  }

  if (normalized.includes("least 6")) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }

  return error;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        return;
      }

      if (password !== confirmPassword) {
        setError("As senhas não conferem.");
        return;
      }

      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(mapResetError(payload.error ?? "Não foi possível redefinir a senha."));
        return;
      }

      setSuccess("Senha redefinida com sucesso. Você será redirecionado para o login.");

      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      await fetch("/api/auth/set-session", { method: "DELETE" });

      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1200);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#141416]/95 p-8 shadow-neon backdrop-blur">
      <h1 className="text-3xl font-semibold text-white">Redefinir senha</h1>
      <p className="mt-2 text-sm text-lv-textMuted">Informe uma nova senha para sua conta.</p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="new-password" className="mb-2 block text-sm text-lv-textMuted">
            Nova senha
          </label>
          <input
            id="new-password"
            type="password"
            minLength={6}
            className="w-full rounded-xl border border-white/15 bg-[#1D1D21] px-4 py-3 text-sm text-white outline-none transition"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="mb-2 block text-sm text-lv-textMuted">
            Confirmar nova senha
          </label>
          <input
            id="confirm-password"
            type="password"
            minLength={6}
            className="w-full rounded-xl border border-white/15 bg-[#1D1D21] px-4 py-3 text-sm text-white outline-none transition"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-red-500/35 bg-red-500/12 px-3 py-2 text-xs text-red-200">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl border border-[#FFC107] bg-[#FFC107] px-4 py-3 text-sm font-semibold text-[#000000] transition hover:bg-[#FFB300] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {loading ? "Atualizando..." : "Salvar nova senha"}
        </button>
      </form>

      <div className="mt-6 text-sm text-lv-textMuted">
        <Link href="/login" className="font-medium text-[#FFC107] hover:text-[#FFB300] hover:underline">
          Voltar para login
        </Link>
      </div>
    </div>
  );
}
