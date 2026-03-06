import { NextRequest } from "next/server";

import { createCrudHandlers } from "@/lib/api/crud";
import { parsePropertyCreate, parsePropertyUpdate } from "@/lib/api/parsers";

const handlers = createCrudHandlers({
  table: "properties",
  parseCreate: parsePropertyCreate,
  parseUpdate: parsePropertyUpdate,
  applyListFilters(query, request: NextRequest) {
    const search = request.nextUrl.searchParams.get("search");
    const city = request.nextUrl.searchParams.get("city");
    const status = request.nextUrl.searchParams.get("status");

    let nextQuery = query;

    if (search) {
      nextQuery = nextQuery.ilike("address", `%${search}%`);
    }

    if (city) {
      nextQuery = nextQuery.eq("city", city);
    }

    if (status) {
      nextQuery = nextQuery.eq("status", status);
    }

    return nextQuery;
  },
});

export const { GET, POST, PATCH, DELETE } = handlers;
