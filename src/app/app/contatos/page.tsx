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
          <select
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as ContactType }))}
          >
            {CONTACT_TYPE.map((type) => (
              <option key={type} value={type}>
                {contactLabel[type]}
              </option>
            ))}
          </select>

          <input
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            placeholder="Nome"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />

          <input
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            placeholder="Cargo"
            value={form.role}
            onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
          />

          <input
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            placeholder="Empresa"
            value={form.company}
            onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
          />

          <input
            type="email"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            placeholder="E-mail"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />

          <input
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            placeholder="Telefone"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          />

          <input
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm md:col-span-2 xl:col-span-3"
            placeholder="Observações"
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          />

          <button className="rounded-xl border border-lv-neon/40 bg-lv-neon/10 px-4 py-2 text-sm font-medium text-lv-neon">
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
