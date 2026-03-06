export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(55,183,255,0.2),transparent_35%),radial-gradient(circle_at_80%_40%,rgba(22,60,130,0.35),transparent_40%)]" />
      {children}
    </main>
  );
}
