import { NextRequest } from "next/server";

import { createCrudHandlers } from "@/lib/api/crud";
import { parseDocumentCreate, parseDocumentUpdate } from "@/lib/api/parsers";

const handlers = createCrudHandlers({
  table: "documents",
  parseCreate: parseDocumentCreate,
  parseUpdate: parseDocumentUpdate,
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
