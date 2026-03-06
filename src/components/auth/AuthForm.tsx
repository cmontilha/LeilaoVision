"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface AuthFormProps {
  mode: "login" | "signup";
  initialError?: string;
}

function mapError(error: string): string {
  if (error.includes("invalid_credentials")) return "Email ou senha inválidos.";
  if (error.includes("confirm")) return "Não foi possível confirmar o e-mail.";
  return error;
}

export function AuthForm({ mode, initialError }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError ? mapError(initialError) : "");
  const [success, setSuccess] = useState("");

  async function persistSession(accessToken: string, refreshToken: string) {
    await fetch("/api/auth/set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
      }),
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const supabase = getSupabaseBrowserClient();

    if (mode === "login") {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        await persistSession(data.session.access_token, data.session.refresh_token);
      }

      router.push("/app/dashboard");
      router.refresh();
      return;
    }

    const redirectUrl = `${window.location.origin}/auth/confirm?next=/app/dashboard`;

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      await persistSession(data.session.access_token, data.session.refresh_token);
      router.push("/app/dashboard");
      router.refresh();
      return;
    }

    setSuccess("Conta criada. Confira seu e-mail para confirmar o acesso.");
    setLoading(false);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-lv-border bg-lv-panel/90 p-8 shadow-neon backdrop-blur">
      <h1 className="text-3xl font-semibold text-lv-text">
        {mode === "login" ? "Entrar" : "Criar conta"}
      </h1>
      <p className="mt-2 text-sm text-lv-textMuted">
        {mode === "login"
          ? "Acesse seu pipeline de oportunidades em leilões."
          : "Cadastre-se para iniciar seu CRM de investimentos em leilões."}
      </p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm text-lv-textMuted">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded-xl border border-lv-border bg-lv-panelMuted px-4 py-3 text-sm text-lv-text outline-none ring-lv-neon transition focus:ring-2"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm text-lv-textMuted">
            Senha
          </label>
          <input
            id="password"
            type="password"
            minLength={6}
            className="w-full rounded-xl border border-lv-border bg-lv-panelMuted px-4 py-3 text-sm text-lv-text outline-none ring-lv-neon transition focus:ring-2"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {mapError(error)}
          </p>
        ) : null}

        {success ? (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl border border-lv-neon/50 bg-lv-neon/10 px-4 py-3 text-sm font-medium text-lv-neon transition hover:bg-lv-neon/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <div className="mt-6 text-xs text-lv-textMuted">
        {mode === "login" ? (
          <>
            Não tem conta?{" "}
            <Link href="/signup" className="text-lv-neon hover:underline">
              Cadastre-se
            </Link>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <Link href="/login" className="text-lv-neon hover:underline">
              Entrar
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
