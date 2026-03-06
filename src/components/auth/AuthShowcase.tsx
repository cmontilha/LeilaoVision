import {
  BarChart3,
  Building2,
  FileCheck2,
  Gavel,
  Landmark,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";

const icons = [BarChart3, Gavel, Landmark, Wallet, Building2, FileCheck2];

export function AuthShowcase() {
  return (
    <section className="relative hidden min-h-[640px] overflow-hidden rounded-[30px] border border-white/12 bg-[#141416]/90 p-8 shadow-neon lg:block">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,193,7,0.12),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(255,193,7,0.08),transparent_28%)]" />

      <div className="relative z-10 max-w-md space-y-3">
        <p className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-lv-textMuted">
          Plataforma de investimento
        </p>
        <h2 className="text-2xl font-semibold leading-snug text-white xl:text-[24px]">
          Inteligencia para oportunidades em leiloes imobiliarios
        </h2>
        <p className="text-sm text-lv-textMuted">
          Acompanhe editais, avalie risco e execute sua estrategia de lances em um painel financeiro
          confiavel.
        </p>
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-8 top-10 grid grid-cols-3 gap-2 rounded-xl border border-white/12 bg-black/20 p-2">
          {icons.map((Icon, index) => (
            <span
              key={index}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#FFC107]"
            >
              <Icon size={15} />
            </span>
          ))}
        </div>

        <div className="lv-float-slow absolute left-14 top-56 h-[250px] w-[390px] rounded-[24px] border border-white/15 bg-[#1D1D21]/95 p-4 shadow-neon [transform:perspective(1100px)_rotateY(14deg)_rotateX(8deg)]">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-white">Painel de Oportunidades</p>
            <TrendingUp size={16} className="text-[#FFC107]" />
          </div>

          <div className="space-y-2.5">
            <div className="rounded-xl border border-white/10 bg-black/15 p-2.5">
              <div className="mb-1.5 flex items-center justify-between text-xs text-lv-textMuted">
                <span>ROI medio</span>
                <span className="text-white">18.4%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div className="h-1.5 w-2/3 rounded-full bg-[#FFC107]" />
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/15 p-2.5">
              <div className="mb-1.5 flex items-center justify-between text-xs text-lv-textMuted">
                <span>Leiloes ativos</span>
                <span className="text-white">27</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div className="h-1.5 w-1/2 rounded-full bg-[#FFB300]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/10 bg-black/15 p-2.5">
                <p className="text-[11px] uppercase tracking-[0.12em] text-lv-textMuted">Capital</p>
                <p className="mt-1 text-base font-semibold text-white">R$ 2,4M</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/15 p-2.5">
                <p className="text-[11px] uppercase tracking-[0.12em] text-lv-textMuted">Risco</p>
                <p className="mt-1 text-base font-semibold text-white">Controlado</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lv-float absolute bottom-16 left-8 rounded-2xl border border-white/14 bg-[#1D1D21]/95 px-4 py-3 shadow-neon">
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 p-2 text-emerald-200">
              <ShieldCheck size={16} />
            </span>
            <div>
              <p className="text-sm font-medium text-white">Checklist juridico</p>
              <p className="text-xs text-lv-textMuted">Documentacao validada</p>
            </div>
          </div>
        </div>

        <div className="lv-float-delay absolute bottom-24 right-12 rounded-2xl border border-white/14 bg-[#1D1D21]/95 px-4 py-3 shadow-neon">
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-[#FFC107]/40 bg-[#FFC107]/18 p-2 text-[#FFC107]">
              <Gavel size={16} />
            </span>
            <div>
              <p className="text-sm font-medium text-white">Leilao em 06h</p>
              <p className="text-xs text-lv-textMuted">3 imoveis prontos para lance</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
