import { NextRequest } from "next/server";

import { createCrudHandlers } from "@/lib/api/crud";
import { validateOwnedReferences } from "@/lib/api/ownership";
import { parseDocumentCreate, parseDocumentUpdate } from "@/lib/api/parsers";

const handlers = createCrudHandlers({
  table: "documents",
  parseCreate: parseDocumentCreate,
  parseUpdate: parseDocumentUpdate,
  validateWrite: async ({ payload, userId, supabase }) => {
    const referenceError = await validateOwnedReferences({
      payload,
      userId,
      supabase: supabase as Parameters<typeof validateOwnedReferences>[0]["supabase"],
      rules: [{ field: "property_id", table: "properties" }],
    });

    if (referenceError) {
      return referenceError;
    }

    const storagePath = payload.storage_path;
    if (storagePath !== undefined && storagePath !== null) {
      if (typeof storagePath !== "string") {
        return "Campo storage_path inválido.";
      }

      if (!storagePath.startsWith(`${userId}/`)) {
        return "storage_path inválido para o usuário autenticado.";
      }
    }

    return null;
  },
  applyListFilters(query, request: NextRequest) {
    const propertyId = request.nextUrl.searchParams.get("property_id");
    const type = request.nextUrl.searchParams.get("type");

    let nextQuery = query;

    if (propertyId) {
      nextQuery = nextQuery.eq("property_id", propertyId);
    }

    if (type) {
      nextQuery = nextQuery.eq("type", type);
    }

    return nextQuery;
  },
});

export const { GET, POST, PATCH, DELETE } = handlers;
