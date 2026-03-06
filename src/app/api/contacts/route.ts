import { NextRequest } from "next/server";

import { createCrudHandlers } from "@/lib/api/crud";
import { parseContactCreate, parseContactUpdate } from "@/lib/api/parsers";

const handlers = createCrudHandlers({
  table: "contacts",
  parseCreate: parseContactCreate,
  parseUpdate: parseContactUpdate,
  applyListFilters(query, request: NextRequest) {
    const type = request.nextUrl.searchParams.get("type");

    if (type) {
      return query.eq("type", type);
    }

    return query;
  },
});

export const { GET, POST, PATCH, DELETE } = handlers;
