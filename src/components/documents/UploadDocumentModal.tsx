"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { DOCUMENT_BUCKET } from "@/lib/constants";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { DOCUMENT_TYPE, type DocumentType, type Property } from "@/types";

interface UploadDocumentModalProps {
  open: boolean;
  properties: Property[];
  onClose: () => void;
  onUploaded: () => Promise<void> | void;
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

const documentLabel: Record<DocumentType, string> = {
  edital: "Edital",
  matricula: "Matrícula",
  processo: "Processo",
  fotos: "Fotos",
  relatorio: "Relatório",
};

function sanitizeFileName(value: string): string {
  const normalized = value.normalize("NFKD").replace(/[^\w.-]+/g, "_");
  const compact = normalized.replace(/_+/g, "_").slice(0, 140);
  return compact || "arquivo";
}

export function UploadDocumentModal({
  open,
  properties,
  onClose,
  onUploaded,
}: UploadDocumentModalProps) {
  const [propertyId, setPropertyId] = useState("");
  const [type, setType] = useState<DocumentType>("edital");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !propertyId) {
      setError("Selecione imóvel e arquivo.");
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setError("Arquivo excede o limite de 10 MB.");
      return;
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      setError("Tipo de arquivo não permitido. Envie PDF, PNG, JPEG ou WEBP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Sessão expirada.");
      }

      const safeFileName = sanitizeFileName(file.name);
      const filePath = `${user.id}/${propertyId}/${type}/${Date.now()}-${safeFileName}`;
      const { error: uploadError } = await supabase.storage
        .from(DOCUMENT_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          property_id: propertyId,
          type,
          file_name: safeFileName,
          storage_path: filePath,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Falha ao salvar metadados.");
      }

      await onUploaded();
      setPropertyId("");
      setType("edital");
      setFile(null);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha ao enviar documento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-lv-border bg-lv-panel p-5 shadow-neon">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-lv-text">Envio de documento</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-lv-border bg-lv-panelMuted p-2 text-lv-textMuted"
          >
            <X size={14} />
          </button>
        </div>

        <form className="space-y-3" onSubmit={submit}>
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Imóvel
            <select
              className="w-full rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={propertyId}
              onChange={(event) => setPropertyId(event.target.value)}
              required
            >
              <option value="">Selecione o imóvel</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Tipo de documento
            <select
              className="w-full rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={type}
              onChange={(event) => setType(event.target.value as DocumentType)}
            >
              {DOCUMENT_TYPE.map((item) => (
                <option key={item} value={item}>
                  {documentLabel[item]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Arquivo (PDF ou imagem)
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              className="w-full rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              required
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          ) : null}

          <button
            disabled={loading}
            className="w-full rounded-xl border border-[#FFC107] bg-[#FFC107] px-4 py-2 text-sm font-medium text-[#000000] disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar documento"}
          </button>
        </form>
      </div>
    </div>
  );
}
