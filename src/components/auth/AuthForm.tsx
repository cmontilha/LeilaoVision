"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface AuthFormProps {
  mode: "login" | "signup";
  initialError?: string;
}

function mapError(error: string): string {
  const normalized = error.toLowerCase();

  if (normalized.includes("invalid_credentials")) return "E-mail ou senha inválidos.";
  if (normalized.includes("confirm")) return "Não foi possível confirmar o e-mail.";
  if (normalized.includes("password should be at least")) return "A senha deve ter pelo menos 6 caracteres.";
  if (normalized.includes("email address") && normalized.includes("invalid")) return "Informe um e-mail válido.";
  if (normalized.includes("email rate limit exceeded")) {
    return "Limite de envio de e-mails atingido. Aguarde alguns minutos e tente novamente.";
  }
  if (normalized.includes("user already registered")) return "Este e-mail já está cadastrado.";
  return error;
}

function getFirstName(name: string): string {
  const normalized = name.trim();
  if (!normalized) {
    return "Investidor";
  }

  return normalized.split(/\s+/)[0] ?? "Investidor";
}

function getEmailRedirectUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }

  return `${window.location.origin}/auth/confirm?next=/app/dashboard`;
}

function getPasswordRecoveryRedirectUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_PASSWORD_RECOVERY_REDIRECT_URL?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }

  return `${window.location.origin}/auth/confirm?next=/reset-password`;
}

function shouldRetryWithoutRedirect(errorMessage: string): boolean {
  const normalized = errorMessage.toLowerCase();
  return (
    normalized.includes("redirect") &&
    (normalized.includes("url") || normalized.includes("uri") || normalized.includes("allow"))
  );
}

export function AuthForm({ mode, initialError }: AuthFormProps) {
  const router = useRouter();

  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [error, setError] = useState(initialError ? mapError(initialError) : "");
  const [success, setSuccess] = useState("");

  const cardTitle = isSignup ? "Criar conta" : "Entrar";
  const cardSubtitle = isSignup
    ? "Crie sua conta para acompanhar oportunidades em leilões imobiliários."
    : "Acesse sua plataforma de análise de leilões imobiliários.";

  async function persistSession(accessToken: string, refreshToken: string) {
    const response = await fetch("/api/auth/set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error("Não foi possível salvar a sessão de acesso.");
    }
  }

  async function onForgotPassword() {
    if (isSignup) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Informe seu e-mail para receber o link de redefinição.");
      setSuccess("");
      return;
    }

    setForgotPasswordLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error: resetError } = await getSupabaseBrowserClient().auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: getPasswordRecoveryRedirectUrl(),
        },
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess("Enviamos um e-mail com o link para redefinir sua senha.");
    } finally {
      setForgotPasswordLoading(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const supabase = getSupabaseBrowserClient();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    try {
      if (!normalizedEmail) {
        setError("Informe um e-mail válido.");
        return;
      }

      if (!isSignup) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        if (data.session) {
          await persistSession(data.session.access_token, data.session.refresh_token);
        }

        router.push("/app/dashboard");
        router.refresh();
        return;
      }

      if (!normalizedName) {
        setError("Informe seu nome para continuar.");
        return;
      }

      if (password !== confirmPassword) {
        setError("As senhas não conferem.");
        return;
      }

      const signUpPayload = {
        email: normalizedEmail,
        password,
        options: {
          data: {
            name: normalizedName,
            full_name: normalizedName,
            first_name: getFirstName(normalizedName),
          },
        },
      };

      let { data, error: signUpError } = await supabase.auth.signUp({
        ...signUpPayload,
        options: {
          ...signUpPayload.options,
          emailRedirectTo: getEmailRedirectUrl(),
        },
      });

      if (signUpError && shouldRetryWithoutRedirect(signUpError.message)) {
        const retry = await supabase.auth.signUp(signUpPayload);
        data = retry.data;
        signUpError = retry.error;
      }

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        await persistSession(data.session.access_token, data.session.refresh_token);
        router.push("/app/dashboard");
        router.refresh();
        return;
      }

      setSuccess("Cadastro recebido. Confira seu e-mail para confirmar o acesso.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="relative h-16 w-16 overflow-hidden rounded-xl">
          <Image src="/brand/lv-logo.png" alt="Logo LeilãoVision" fill className="object-cover" sizes="64px" />
        </div>
        <div className="mt-2 min-w-0">
          <p className="text-xl font-semibold text-white">LeilãoVision</p>
          <p className="text-sm uppercase tracking-[0.14em] text-lv-textMuted">Plataforma de Leilões</p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/15 bg-[#141416]/95 p-8 shadow-neon backdrop-blur">
        <h1 className="text-3xl font-semibold text-white">{cardTitle}</h1>
        <p className="mt-2 text-sm text-lv-textMuted">{cardSubtitle}</p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          {isSignup ? (
            <div>
              <label htmlFor="name" className="mb-2 block text-sm text-lv-textMuted">
                Nome
              </label>
              <input
                id="name"
                type="text"
                className="w-full rounded-xl border border-white/15 bg-[#1D1D21] px-4 py-3 text-sm text-white outline-none transition"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-lv-textMuted">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-xl border border-white/15 bg-[#1D1D21] px-4 py-3 text-sm text-white outline-none transition"
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
              className="w-full rounded-xl border border-white/15 bg-[#1D1D21] px-4 py-3 text-sm text-white outline-none transition"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {!isSignup ? (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => void onForgotPassword()}
                  disabled={forgotPasswordLoading || loading}
                  className="text-xs font-medium text-[#FFC107] transition hover:text-[#FFB300] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {forgotPasswordLoading ? "Enviando..." : "Esqueci minha senha"}
                </button>
              </div>
            ) : null}
          </div>

          {isSignup ? (
            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-sm text-lv-textMuted">
                Confirmar senha
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
          ) : null}

          {error ? (
            <p className="rounded-lg border border-red-500/35 bg-red-500/12 px-3 py-2 text-xs text-red-200">
              {mapError(error)}
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
            {loading ? "Processando..." : cardTitle}
          </button>
        </form>

        <div className="mt-6 text-sm text-lv-textMuted">
          {isSignup ? (
            <>
              Já tem conta?{" "}
              <Link href="/login" className="font-medium text-[#FFC107] hover:text-[#FFB300] hover:underline">
                Entrar
              </Link>
            </>
          ) : (
            <>
              Não tem conta?{" "}
              <Link href="/signup" className="font-medium text-[#FFC107] hover:text-[#FFB300] hover:underline">
                Cadastre-se
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
