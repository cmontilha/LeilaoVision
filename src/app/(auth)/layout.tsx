import { AuthShowcase } from "@/components/auth/AuthShowcase";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 lg:px-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_8%,rgba(255,193,7,0.16),transparent_28%),radial-gradient(circle_at_90%_0%,rgba(255,179,0,0.09),transparent_30%),linear-gradient(180deg,#141416_0%,#0B0B0C_100%)]" />

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1400px] items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <AuthShowcase />

        <div className="flex items-center justify-center lg:justify-end">{children}</div>
      </div>
    </main>
  );
}
