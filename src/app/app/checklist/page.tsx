"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckSquare2, Pencil, Plus, RotateCcw, Save, Square, Trash2, X } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useResource } from "@/lib/hooks/useResource";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";

interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  title: string;
  description: string;
}

type ChecklistCategory = "Jurídico" | "Financeiro" | "Técnico" | "Operacional";

const CHECKLIST_CATEGORIES: ChecklistCategory[] = ["Jurídico", "Financeiro", "Técnico", "Operacional"];
const CHECKLIST_ITEMS_STORAGE_KEY = "lv_diligencia_items";

const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "juridico_matricula",
    category: "Jurídico",
    title: "Verificar matrícula atualizada",
    description: "Confirmar titularidade, ônus e averbações relevantes.",
  },
  {
    id: "juridico_processo",
    category: "Jurídico",
    title: "Analisar processo e edital",
    description: "Conferir regras do leilão, prazos e responsabilidades do arrematante.",
  },
  {
    id: "financeiro_debitos",
    category: "Financeiro",
    title: "Levantar débitos do imóvel",
    description: "Mapear condomínio, IPTU e custos jurídicos potenciais.",
  },
  {
    id: "financeiro_viabilidade",
    category: "Financeiro",
    title: "Validar viabilidade do lance",
    description: "Checar ROI, margem e limite de lance máximo.",
  },
  {
    id: "tecnico_visita",
    category: "Técnico",
    title: "Realizar vistoria externa",
    description: "Registrar estado do imóvel e riscos de reforma.",
  },
  {
    id: "tecnico_ocupacao",
    category: "Técnico",
    title: "Confirmar ocupação",
    description: "Validar situação de posse e estratégia de desocupação.",
  },
  {
    id: "operacional_documentos",
    category: "Operacional",
    title: "Organizar documentos no sistema",
    description: "Upload de edital, matrícula, processo e relatório de análise.",
  },
  {
    id: "operacional_lance",
    category: "Operacional",
    title: "Definir estratégia de lance",
    description: "Registrar plano de entrada, incrementos e limite final.",
  },
];

function storageKey(propertyId: string): string {
  return `lv_diligencia_checklist_${propertyId || "geral"}`;
}

export default function ChecklistPage() {
  const properties = useResource<Property>("/api/properties");
  const [propertyId, setPropertyId] = useState("");
  const [items, setItems] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST_ITEMS);
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [newItem, setNewItem] = useState({
    category: "Jurídico" as ChecklistCategory,
    title: "",
    description: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState({
    category: "Jurídico" as ChecklistCategory,
    title: "",
    description: "",
  });

  useEffect(() => {
    const rawItems = localStorage.getItem(CHECKLIST_ITEMS_STORAGE_KEY);
    if (!rawItems) {
      setItems(DEFAULT_CHECKLIST_ITEMS);
      return;
    }

    try {
      const parsed = JSON.parse(rawItems) as unknown;
      if (!Array.isArray(parsed)) {
        setItems(DEFAULT_CHECKLIST_ITEMS);
        return;
      }

      if (parsed.length === 0) {
        setItems([]);
        return;
      }

      const normalized = parsed
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
        .map((item) => ({
          id: String(item.id ?? ""),
          category: String(item.category ?? "") as ChecklistCategory,
          title: String(item.title ?? ""),
          description: String(item.description ?? ""),
        }))
        .filter(
          (item) =>
            item.id &&
            CHECKLIST_CATEGORIES.includes(item.category) &&
            item.title.trim().length > 0 &&
            item.description.trim().length > 0,
        );

      setItems(normalized);
    } catch {
      setItems(DEFAULT_CHECKLIST_ITEMS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CHECKLIST_ITEMS_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey(propertyId));
    if (!raw) {
      setCheckedMap({});
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      setCheckedMap(parsed);
    } catch {
      setCheckedMap({});
    }
  }, [propertyId]);

  useEffect(() => {
    localStorage.setItem(storageKey(propertyId), JSON.stringify(checkedMap));
  }, [propertyId, checkedMap]);

  const grouped = useMemo(() => {
    const map = new Map<string, ChecklistItem[]>();
    items.forEach((item) => {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    });
    return CHECKLIST_CATEGORIES.map((category) => [category, map.get(category) ?? []] as const).filter(
      ([, list]) => list.length > 0,
    );
  }, [items]);

  const total = items.length;
  const done = items.filter((item) => checkedMap[item.id]).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  function toggleItem(id: string) {
    setCheckedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function resetChecklist() {
    setCheckedMap({});
  }

  function createItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newItem.title.trim();
    const description = newItem.description.trim();
    if (!title || !description) return;

    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setItems((prev) => [
      ...prev,
      {
        id,
        category: newItem.category,
        title,
        description,
      },
    ]);
    setNewItem({ category: "Jurídico", title: "", description: "" });
  }

  function startEdit(item: ChecklistItem) {
    setEditingId(item.id);
    setEditingDraft({
      category: item.category,
      title: item.title,
      description: item.description,
    });
  }

  function saveEdit(id: string) {
    const title = editingDraft.title.trim();
    const description = editingDraft.description.trim();
    if (!title || !description) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              category: editingDraft.category,
              title,
              description,
            }
          : item,
      ),
    );
    setEditingId(null);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setCheckedMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (editingId === id) {
      setEditingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Checklist de Diligência"
        description="Validação operacional, jurídica e financeira antes do lance. Checklist salvo por imóvel no navegador."
      />

      <Panel>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Imóvel (opcional)
            <select
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={propertyId}
              onChange={(event) => setPropertyId(event.target.value)}
            >
              <option value="">Checklist geral</option>
              {properties.data.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.12em] text-lv-textMuted">Progresso</p>
            <p className="mt-1 text-lg font-semibold text-lv-text">
              {done}/{total}
            </p>
            <p className="text-xs text-lv-textMuted">itens concluídos ({progress}%)</p>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={resetChecklist}
              className="inline-flex items-center gap-2 rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-textMuted hover:text-lv-text"
            >
              <RotateCcw size={15} />
              Limpar checklist
            </button>
          </div>
        </div>
      </Panel>

      <Panel>
        <h3 className="mb-4 text-sm font-semibold text-lv-text">Adicionar item de diligência</h3>
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" onSubmit={createItem}>
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Categoria
            <select
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={newItem.category}
              onChange={(event) =>
                setNewItem((prev) => ({ ...prev, category: event.target.value as ChecklistCategory }))
              }
            >
              {CHECKLIST_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Item
            <input
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={newItem.title}
              onChange={(event) => setNewItem((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Ex.: Confirmar certidão negativa"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-lv-textMuted xl:col-span-2">
            Descrição
            <input
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={newItem.description}
              onChange={(event) => setNewItem((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Ex.: Validar pendências na esfera cível e trabalhista"
              required
            />
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#FFC107] bg-[#FFC107] px-4 py-2 text-sm font-medium text-[#000000] md:w-fit"
          >
            <Plus size={15} />
            Adicionar item
          </button>
        </form>
      </Panel>

      <div className="space-y-4">
        {grouped.map(([category, items]) => (
          <Panel key={category}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-lv-text">{category}</h3>
              <StatusBadge
                label={`${items.filter((item) => checkedMap[item.id]).length}/${items.length} concluídos`}
                tone={items.every((item) => checkedMap[item.id]) ? "success" : "warning"}
              />
            </div>

            <div className="space-y-2">
              {items.map((item) => {
                const checked = Boolean(checkedMap[item.id]);
                const editing = editingId === item.id;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-xl border px-3 py-2 transition",
                      checked
                        ? "border-emerald-500/35 bg-emerald-500/10"
                        : "border-lv-border bg-lv-panelMuted hover:border-white/20",
                    )}
                  >
                    {editing ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
                          Categoria
                          <select
                            className="rounded-lg border border-lv-border bg-[#141416] px-2 py-1 text-sm text-lv-text"
                            value={editingDraft.category}
                            onChange={(event) =>
                              setEditingDraft((prev) => ({
                                ...prev,
                                category: event.target.value as ChecklistCategory,
                              }))
                            }
                          >
                            {CHECKLIST_CATEGORIES.map((categoryOption) => (
                              <option key={categoryOption} value={categoryOption}>
                                {categoryOption}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
                          Item
                          <input
                            className="rounded-lg border border-lv-border bg-[#141416] px-2 py-1 text-sm text-lv-text"
                            value={editingDraft.title}
                            onChange={(event) =>
                              setEditingDraft((prev) => ({ ...prev, title: event.target.value }))
                            }
                          />
                        </label>

                        <label className="flex flex-col gap-1 text-xs text-lv-textMuted md:col-span-2">
                          Descrição
                          <input
                            className="rounded-lg border border-lv-border bg-[#141416] px-2 py-1 text-sm text-lv-text"
                            value={editingDraft.description}
                            onChange={(event) =>
                              setEditingDraft((prev) => ({ ...prev, description: event.target.value }))
                            }
                          />
                        </label>

                        <div className="flex items-center gap-2 md:col-span-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(item.id)}
                            className="rounded-lg border border-[#FFC107] bg-[#FFC107] p-2 text-[#000000]"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-lg border border-lv-border bg-[#141416] p-2 text-lv-textMuted"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          className="flex flex-1 items-start gap-3 text-left"
                        >
                          <span className="mt-0.5 text-lv-textMuted">
                            {checked ? (
                              <CheckSquare2 size={16} className="text-emerald-300" />
                            ) : (
                              <Square size={16} />
                            )}
                          </span>
                          <span>
                            <span
                              className={cn(
                                "block text-sm font-medium",
                                checked ? "text-emerald-100" : "text-lv-text",
                              )}
                            >
                              {item.title}
                            </span>
                            <span className="block text-xs text-lv-textMuted">{item.description}</span>
                          </span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="rounded-lg border border-lv-border bg-[#141416] p-2 text-lv-textMuted"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="rounded-lg border border-red-500/35 bg-red-500/10 p-2 text-red-300"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
