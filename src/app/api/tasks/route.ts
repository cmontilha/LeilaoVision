import { NextRequest } from "next/server";

import { createCrudHandlers } from "@/lib/api/crud";
import { parseTaskCreate, parseTaskUpdate } from "@/lib/api/parsers";

const handlers = createCrudHandlers({
  table: "tasks",
  parseCreate: parseTaskCreate,
  parseUpdate: parseTaskUpdate,
  orderBy: "due_date",
  applyListFilters(query, request: NextRequest) {
    const status = request.nextUrl.searchParams.get("status");
    const priority = request.nextUrl.searchParams.get("priority");

    let nextQuery = query;

    if (status) {
      nextQuery = nextQuery.eq("status", status);
    }

    if (priority) {
      nextQuery = nextQuery.eq("priority", priority);
    }

    return nextQuery;
  },
});

export const { GET, POST, PATCH, DELETE } = handlers;
