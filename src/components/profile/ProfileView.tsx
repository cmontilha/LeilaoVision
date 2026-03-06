"use client";

import { useEffect, useState } from "react";

import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function getFirstName(value: string): string {
  const normalized = value.trim();
  if (!normalized) return "Investidor";
  const [first] = normalized.split(/\s+/);
  return first || "Investidor";
}

export function ProfileView() {
  const [name, setName] = useState("Investidor");
  const [email, setEmail] = useState("investidor@leilaovision.com");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;

      if (user.email) {
        setEmail(user.email);
      }

      const metadata = user.user_metadata;
      const metadataName =
        (typeof metadata?.full_name === "string" && metadata.full_name) ||
        (typeof metadata?.name === "string" && metadata.name) ||
        user.email?.split("@")[0] ||
        "Investidor";

      setName(metadataName);
    });
  }, []);

  async function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage("");
    setProfileError("");

    const supabase = getSupabaseBrowserClient();
    const trimmedName = name.trim() || "Investidor";
    const { error } = await supabase.auth.updateUser({
      data: {
        name: trimmedName,
        full_name: trimmedName,
        first_name: getFirstName(trimmedName),
      },
    });

    if (error) {
      setProfileError(error.message);
      setSavingProfile(false);
      return;
    }

    window.dispatchEvent(new Event("lv-profile-updated"));
    setProfileMessage("Perfil atualizado com sucesso.");
    setSavingProfile(false);
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Perfil"
        description="Atualize seus dados de perfil e mantenha o cadastro sincronizado."
      />

      <Panel>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSaveProfile}>
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Nome completo
            <input
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Caio Montilha"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            E-mail
            <input
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={email}
              disabled
            />
          </label>

          {profileError ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300 md:col-span-2">
              {profileError}
            </p>
          ) : null}

          {profileMessage ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 md:col-span-2">
              {profileMessage}
            </p>
          ) : null}

          <button
            className="rounded-xl border border-[#FFC107] bg-[#FFC107] px-4 py-2 text-sm font-medium text-[#000000] md:col-span-2 md:w-fit"
            disabled={savingProfile}
          >
            {savingProfile ? "Salvando..." : "Salvar perfil"}
          </button>
        </form>
      </Panel>
    </div>
  );
}
