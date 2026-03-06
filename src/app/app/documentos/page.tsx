"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";

import { UploadDocumentModal } from "@/components/documents/UploadDocumentModal";
import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useResource } from "@/lib/hooks/useResource";
import { formatDate } from "@/lib/utils";
import { DOCUMENT_TYPE, type Document, type DocumentType, type Property } from "@/types";

const documentLabel: Record<DocumentType, string> = {
  edital: "Edital",
  matricula: "Matrícula",
  processo: "Processo",
  fotos: "Fotos",
  relatorio: "Relatório",
};

export default function DocumentsPage() {
  const documents = useResource<Document>("/api/documents");
  const properties = useResource<Property>("/api/properties");
  const [openModal, setOpenModal] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

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
          <select
            value={propertyFilter}
            onChange={(event) => {
              setPropertyFilter(event.target.value);
              void applyFilters(event.target.value, undefined);
            }}
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
          >
            <option value="">Todos os imóveis</option>
            {properties.data.map((property) => (
              <option key={property.id} value={property.id}>
                {property.address}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value);
              void applyFilters(undefined, event.target.value);
            }}
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
          >
            <option value="">Todos os tipos</option>
            {DOCUMENT_TYPE.map((type) => (
              <option key={type} value={type}>
                {documentLabel[type]}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-4 py-2 text-sm text-lv-textMuted"
            onClick={() => {
              setPropertyFilter("");
              setTypeFilter("");
              void documents.load("");
            }}
          >
            Limpar filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lv-border text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-lv-textMuted">
                <th className="px-2 py-3">Imóvel</th>
                <th className="px-2 py-3">Tipo</th>
                <th className="px-2 py-3">Arquivo</th>
                <th className="px-2 py-3">Enviado em</th>
                <th className="px-2 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lv-border/60">
              {documents.data.map((document) => (
                <tr key={document.id}>
                  <td className="px-2 py-3 text-lv-text">
                    {propertyMap.get(document.property_id) ?? document.property_id}
                  </td>
                  <td className="px-2 py-3">
                    <StatusBadge label={documentLabel[document.type]} />
                  </td>
                  <td className="px-2 py-3 text-lv-textMuted">{document.file_name}</td>
                  <td className="px-2 py-3 text-lv-textMuted">{formatDate(document.created_at)}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      {document.file_url ? (
                        <a
                          href={document.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-lv-border bg-lv-panelMuted p-2 text-lv-textMuted"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
