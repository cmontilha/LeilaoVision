import { NextRequest } from "next/server";

import { createCrudHandlers } from "@/lib/api/crud";
import { validateOwnedReferences } from "@/lib/api/ownership";
import { parseAnalysisCreate, parseAnalysisUpdate } from "@/lib/api/parsers";

const handlers = createCrudHandlers({
  table: "analysis",
  parseCreate: parseAnalysisCreate,
  parseUpdate: parseAnalysisUpdate,
  validateWrite: async ({ payload, userId, supabase }) =>
    validateOwnedReferences({
      payload,
      userId,
      supabase: supabase as Parameters<typeof validateOwnedReferences>[0]["supabase"],
      rules: [{ field: "property_id", table: "properties" }],
    }),
  applyListFilters(query, request: NextRequest) {
    const propertyId = request.nextUrl.searchParams.get("property_id");

    if (propertyId) {
      return query.eq("property_id", propertyId);
    }

    return query;
  },
});

export const { GET, POST, PATCH, DELETE } = handlers;
