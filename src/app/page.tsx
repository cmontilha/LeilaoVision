import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-lg rounded-2xl border border-lv-border bg-lv-panel/80 p-8 shadow-neon backdrop-blur">
        <h1 className="text-3xl font-semibold text-lv-text">LeilãoVision</h1>
        <p className="mt-3 text-sm text-lv-textMuted">
          Plataforma SaaS para pipeline completo de investimento em leilões imobiliários.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/login"
            className="rounded-xl border border-lv-neon/40 bg-lv-neon/10 px-4 py-3 text-center text-sm font-medium text-lv-neon transition hover:bg-lv-neon/20"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-4 py-3 text-center text-sm font-medium text-lv-text transition hover:border-lv-neon/50"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </main>
  );
}
