"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, FolderClosed, Plus, Trash2 } from "lucide-react";

import { UploadDocumentModal } from "@/components/documents/UploadDocumentModal";
import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useResource } from "@/lib/hooks/useResource";
import { cn, formatDate } from "@/lib/utils";
import { DOCUMENT_TYPE, type Document, type DocumentType, type Property } from "@/types";

const documentLabel: Record<DocumentType, string> = {
  edital: "Edital",
  matricula: "Matrícula",
  processo: "Processo",
  fotos: "Fotos",
  relatorio: "Relatório",
};

const folderTone: Record<DocumentType, { border: string; bg: string; text: string }> = {
  edital: { border: "border-amber-500/35", bg: "bg-amber-500/10", text: "text-amber-200" },
  matricula: { border: "border-emerald-500/35", bg: "bg-emerald-500/10", text: "text-emerald-200" },
  processo: { border: "border-rose-500/35", bg: "bg-rose-500/10", text: "text-rose-200" },
  fotos: { border: "border-sky-500/35", bg: "bg-sky-500/10", text: "text-sky-200" },
  relatorio: { border: "border-orange-500/35", bg: "bg-orange-500/10", text: "text-orange-200" },
};

export default function DocumentsPage() {
  const documents = useResource<Document>("/api/documents");
  const properties = useResource<Property>("/api/properties");
  const [openModal, setOpenModal] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeFolder, setActiveFolder] = useState<DocumentType | null>(null);

  const propertyMap = useMemo(() => {
    const map = new Map<string, string>();
    properties.data.forEach((property) => map.set(property.id, property.address));
    return map;
  }, [properties.data]);

  async function applyFilters(nextProperty?: string, nextType?: string) {
    const propertyId = nextProperty ?? propertyFilter;
    const type = nextType ?? typeFilter;
    const params = new URLSearchParams();

    if (propertyId) params.set("property_id", propertyId);
    if (type) params.set("type", type);

    await documents.load(params.toString());
  }

  const groupedByType = useMemo(() => {
    const map = new Map<DocumentType, Document[]>();
    DOCUMENT_TYPE.forEach((type) => map.set(type, []));
    documents.data.forEach((document) => {
      const list = map.get(document.type) ?? [];
      list.push(document);
      map.set(document.type, list);
    });
    return map;
  }, [documents.data]);

  useEffect(() => {
    if (typeFilter) {
      setActiveFolder(typeFilter as DocumentType);
      return;
    }

    if (activeFolder && DOCUMENT_TYPE.includes(activeFolder)) {
      return;
    }

    setActiveFolder(DOCUMENT_TYPE[0]);
  }, [typeFilter, activeFolder]);

  const selectedFolder = (typeFilter || activeFolder || DOCUMENT_TYPE[0]) as DocumentType;
  const selectedDocuments = groupedByType.get(selectedFolder) ?? [];

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Documentos"
        description="Armazenamento por imóvel usando Supabase Storage (PDF e imagens)."
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[#FFC107] bg-[#FFC107] px-4 py-2 text-sm font-medium text-[#000000]"
            onClick={() => setOpenModal(true)}
          >
            <Plus size={16} />
            Enviar
          </button>
        }
      />

      <Panel>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Filtrar por imóvel
            <select
              value={propertyFilter}
              onChange={(event) => {
                setPropertyFilter(event.target.value);
                void applyFilters(event.target.value, undefined);
              }}
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
            >
              <option value="">Todos os imóveis</option>
              {properties.data.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Filtrar por tipo de documento
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setActiveFolder((event.target.value as DocumentType) || null);
                void applyFilters(undefined, event.target.value);
              }}
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
            >
              <option value="">Todos os tipos</option>
              {DOCUMENT_TYPE.map((type) => (
                <option key={type} value={type}>
                  {documentLabel[type]}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-4 py-2 text-sm text-lv-textMuted"
            onClick={() => {
              setPropertyFilter("");
              setTypeFilter("");
              setActiveFolder(null);
              void documents.load("");
            }}
          >
            Limpar filtros
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {DOCUMENT_TYPE.map((type) => {
            const folderItems = groupedByType.get(type) ?? [];
            const tone = folderTone[type];
            const active = selectedFolder === type;

            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  const nextType = typeFilter === type ? "" : type;
                  setTypeFilter(nextType);
                  setActiveFolder(nextType ? (nextType as DocumentType) : null);
                  void applyFilters(undefined, nextType);
                }}
                className={cn(
                  "rounded-2xl border p-4 text-left transition",
                  tone.border,
                  tone.bg,
                  active ? "ring-1 ring-[#FFC107]/60" : "hover:border-white/20",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FolderClosed size={18} className={tone.text} />
                    <p className={cn("text-sm font-semibold", tone.text)}>{documentLabel[type]}</p>
                  </div>
                  <span className="rounded-full border border-white/15 bg-black/15 px-2 py-0.5 text-xs text-lv-textMuted">
                    {folderItems.length}
                  </span>
                </div>
                <p className="mt-2 text-xs text-lv-textMuted">
                  {folderItems.length === 0
                    ? "Nenhum arquivo"
                    : `${folderItems.length} arquivo(s) nesta pasta`}
                </p>
                <p className="mt-1 text-xs text-lv-textMuted">
                  Último envio:{" "}
                  {folderItems.length > 0 ? formatDate(folderItems[0]?.created_at) : "-"}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-lv-border/70 bg-[#141416]/65 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Pasta selecionada</p>
              <p className="text-sm font-semibold text-lv-text">{documentLabel[selectedFolder]}</p>
            </div>
            <span className="rounded-full border border-white/15 bg-black/15 px-2 py-1 text-xs text-lv-textMuted">
              {selectedDocuments.length} arquivo(s)
            </span>
          </div>

          {documents.loading ? (
            <p className="text-sm text-lv-textMuted">Carregando documentos...</p>
          ) : documents.error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {documents.error}
            </p>
          ) : selectedDocuments.length === 0 ? (
            <p className="text-sm text-lv-textMuted">Essa pasta ainda não possui arquivos.</p>
          ) : (
            <div className="space-y-2">
              {selectedDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-lv-text">{document.file_name}</p>
                    <p className="text-xs text-lv-textMuted">
                      {propertyMap.get(document.property_id) ?? document.property_id} • {formatDate(document.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {document.file_url ? (
                      <a
                        href={document.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-lv-border bg-[#141416] p-2 text-lv-textMuted"
                      >
                        <ExternalLink size={14} />
                      </a>
                    ) : null}
                    <button
                      type="button"
                      className="rounded-lg border border-red-500/35 bg-red-500/10 p-2 text-red-300"
                      onClick={() => void documents.remove(document.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>

      <UploadDocumentModal
        open={openModal}
        properties={properties.data}
        onClose={() => setOpenModal(false)}
        onUploaded={() => documents.load()}
      />
    </div>
  );
}
