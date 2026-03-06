"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useResource } from "@/lib/hooks/useResource";
import { CONTACT_TYPE, type Contact, type ContactType } from "@/types";

const contactLabel: Record<ContactType, string> = {
  advogado: "Advogado",
  corretor: "Corretor",
  engenheiro: "Engenheiro",
  despachante: "Despachante",
  cartorio: "Cartório",
  outros: "Outros",
};

export default function ContactsPage() {
  const contacts = useResource<Contact>("/api/contacts");
  const [typeFilter, setTypeFilter] = useState("");

  const [form, setForm] = useState({
    type: "advogado" as ContactType,
    name: "",
    role: "",
    company: "",
    email: "",
    phone: "",
    notes: "",
  });

  const filteredContacts = useMemo(() => {
    if (!typeFilter) {
      return contacts.data;
    }

    return contacts.data.filter((contact) => contact.type === typeFilter);
  }, [contacts.data, typeFilter]);

  async function createContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await contacts.create({
      type: form.type,
      name: form.name,
      role: form.role || null,
      company: form.company || null,
      email: form.email || null,
      phone: form.phone || null,
      notes: form.notes || null,
    });

    setForm({
      type: "advogado",
      name: "",
      role: "",
      company: "",
      email: "",
      phone: "",
      notes: "",
    });
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Contatos"
        description="Rede de profissionais para apoiar diligência jurídica, técnica e operacional."
      />

      <Panel>
        <h3 className="mb-4 text-sm font-semibold text-lv-text">Novo contato</h3>
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-5" onSubmit={createContact}>
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Tipo de contato
            <select
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={form.type}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, type: event.target.value as ContactType }))
              }
            >
              {CONTACT_TYPE.map((type) => (
                <option key={type} value={type}>
                  {contactLabel[type]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Nome
            <input
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              placeholder="Ex.: Ana Souza"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Cargo (opcional)
            <input
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              placeholder="Ex.: Advogada especialista"
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Empresa (opcional)
            <input
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              placeholder="Ex.: Escritório XYZ"
              value={form.company}
              onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            E-mail (opcional)
            <input
              type="email"
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              placeholder="nome@empresa.com"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Telefone (opcional)
            <input
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              placeholder="(11) 99999-9999"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-lv-textMuted md:col-span-2 xl:col-span-3">
            Observações (opcional)
            <input
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              placeholder="Ex.: Atende região central"
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
            />
          </label>

          <button className="rounded-xl border border-[#FFC107] bg-[#FFC107] px-4 py-2 text-sm font-medium text-[#000000]">
            Salvar contato
          </button>
        </form>
      </Panel>

      <Panel>
        <SectionTitle
          title="Agenda de contatos"
          action={
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            >
              <option value="">Todos os tipos</option>
              {CONTACT_TYPE.map((type) => (
                <option key={type} value={type}>
                  {contactLabel[type]}
                </option>
              ))}
            </select>
          }
        />

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lv-border text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-lv-textMuted">
                <th className="px-2 py-3">Nome</th>
                <th className="px-2 py-3">Tipo</th>
                <th className="px-2 py-3">Empresa</th>
                <th className="px-2 py-3">Contato</th>
                <th className="px-2 py-3">Observações</th>
                <th className="px-2 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lv-border/60">
              {filteredContacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="px-2 py-3 text-lv-text">{contact.name}</td>
                  <td className="px-2 py-3">
                    <StatusBadge label={contactLabel[contact.type]} />
                  </td>
                  <td className="px-2 py-3 text-lv-textMuted">{contact.company ?? "-"}</td>
                  <td className="px-2 py-3 text-lv-textMuted">
                    <div>{contact.email ?? "-"}</div>
                    <div>{contact.phone ?? "-"}</div>
                  </td>
                  <td className="px-2 py-3 text-lv-textMuted">{contact.notes ?? "-"}</td>
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      className="rounded-lg border border-red-500/35 bg-red-500/10 p-2 text-red-300"
                      onClick={() => void contacts.remove(contact.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
