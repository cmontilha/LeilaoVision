"use client";

import { useEffect, useState } from "react";

import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function SettingsView() {
  const [email, setEmail] = useState("investidor@leilaovision.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setEmail(data.user.email);
      }
    });
  }, []);

  async function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword.trim()) {
      setPasswordError("Informe a senha atual.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("A confirmação da nova senha não confere.");
      return;
    }

    setSavingPassword(true);
    const supabase = getSupabaseBrowserClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (authError) {
      setPasswordError("Senha atual inválida.");
      setSavingPassword(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setPasswordError(updateError.message);
      setSavingPassword(false);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordMessage("Senha alterada com sucesso.");
    setSavingPassword(false);
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Configurações"
        description="Gerencie dados da conta e segurança de acesso."
      />

      <Panel>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-lv-text">Dados da conta</h3>
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            E-mail da conta
            <input
              value={email}
              disabled
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
            />
          </label>
        </div>
      </Panel>

      <Panel>
        <h3 className="mb-4 text-sm font-semibold text-lv-text">Segurança da conta</h3>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleChangePassword}>
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted md:col-span-2">
            Senha atual
            <input
              type="password"
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Informe sua senha atual"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Nova senha
            <input
              type="password"
              minLength={6}
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Mínimo de 6 caracteres"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Confirmar nova senha
            <input
              type="password"
              minLength={6}
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              placeholder="Repita a nova senha"
              required
            />
          </label>

          {passwordError ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300 md:col-span-2">
              {passwordError}
            </p>
          ) : null}

          {passwordMessage ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 md:col-span-2">
              {passwordMessage}
            </p>
          ) : null}

          <button
            className="rounded-xl border border-[#FFC107] bg-[#FFC107] px-4 py-2 text-sm font-medium text-[#000000] md:col-span-2 md:w-fit"
            disabled={savingPassword}
          >
            {savingPassword ? "Alterando..." : "Alterar senha"}
          </button>
        </form>
      </Panel>
    </div>
  );
}
